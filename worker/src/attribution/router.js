import { isValidFbp, isValidFbc } from '../capi/validators.js';

const TTL = 30 * 24 * 60 * 60;
const MAX_TOKEN = 8192;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ad_id'];
const TRUSTED_KEYS = ['ghl_contact_id', 'ghl_email_sha256', 'ghl_phone_sha256'];
const encoder = new TextEncoder();
const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decode(value) {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
}
function encodeJson(value) { return base64url(encoder.encode(JSON.stringify(value))); }
async function key(secret) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('attribution_not_configured');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function safeUrl(value) {
  try {
    // al_attrib stores the first landing as a path, while the paid cookie stores
    // an absolute URL. Preserve either shape without accepting protocol-relative
    // third-party addresses as site paths.
    const url = typeof value === 'string' && /^\/(?!\/)/.test(value)
      ? new URL(value, 'https://autolander.ai') : new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    url.username = ''; url.password = ''; url.hash = '';
    // Never include setup codes or conversion proofs in downstream metadata.
    for (const name of ['attribution_token', 'token', 'bt']) url.searchParams.delete(name);
    return url.href.slice(0, 500);
  } catch { return ''; }
}

export async function verifyAttributionToken(env, token, now = Math.floor(Date.now() / 1000)) {
  if (typeof token !== 'string' || token.length > MAX_TOKEN || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const [header, payload, signature] = token.split('.');
    const decodedHeader = JSON.parse(new TextDecoder().decode(decode(header)));
    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') return null;
    if (!await crypto.subtle.verify('HMAC', await key(env.ATTRIBUTION_SIGNING_SECRET), decode(signature), encoder.encode(`${header}.${payload}`))) return null;
    const data = JSON.parse(new TextDecoder().decode(decode(payload)));
    if (data.v !== 1 || data.iss !== 'autolander.ai' || data.aud !== 'autolander-signup'
      || !Number.isInteger(data.iat) || !Number.isInteger(data.exp) || data.iat > now + 60
      || data.exp <= now || data.exp <= data.iat || data.exp - data.iat > TTL) return null;
    return { attribution: object(data.attribution), issued_at: data.iat, expires_at: data.exp };
  } catch { return null; }
}

// trustedIdentity is supplied ONLY by the accepted GHL application handler or a
// previously verified token. Public request fields cannot assert CRM identity.
export async function issueAttributionToken(env, request, body = {}, trustedIdentity = {}) {
  const attr = object(body.attribution);
  const organic = object(body.organic_attribution);
  const utms = object(attr.utms);
  const first = object(attr.firstTouch);
  const page = object(attr.page);
  const attribution = {};
  for (const name of UTM_KEYS) attribution[name] = clean(utms[name] || first[name] || organic[name], 180);
  attribution.utm_source ||= 'direct';
  attribution.utm_medium ||= 'none';
  attribution.fbp = isValidFbp(attr.fbp) ? attr.fbp : '';
  attribution.fbc = isValidFbc(attr.fbc) ? attr.fbc : '';
  attribution.landing_url = safeUrl(organic.landing_page) || safeUrl(page.landing_page)
    || safeUrl(first.landing_page) || safeUrl(page.current_page) || safeUrl(request.headers.get('Referer'));
  attribution.client_ip = clean(request.headers.get('CF-Connecting-IP'), 64);
  attribution.user_agent = clean(request.headers.get('User-Agent'));
  for (const name of TRUSTED_KEYS) {
    const value = clean(trustedIdentity[name], name === 'ghl_contact_id' ? 120 : 64);
    if (value) attribution[name] = value;
  }
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encodeJson({ alg: 'HS256', typ: 'JWT' })}.${encodeJson({
    v: 1, iss: 'autolander.ai', aud: 'autolander-signup', iat: now, exp: now + TTL, attribution,
  })}`;
  const signature = await crypto.subtle.sign('HMAC', await key(env.ATTRIBUTION_SIGNING_SECRET), encoder.encode(unsigned));
  return { token: `${unsigned}.${base64url(new Uint8Array(signature))}`, expires_at: now + TTL };
}

export async function handleAttribution(request, env, corsHeaders = {}) {
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
  const pathname = new URL(request.url).pathname;
  if (!['/api/attribution/token', '/api/attribution/verify'].includes(pathname)) return reply({ ok: false }, 404);
  if (request.method !== 'POST') return reply({ ok: false, reason: 'method_not_allowed' }, 405);
  if (!env.ATTRIBUTION_SIGNING_SECRET || env.ATTRIBUTION_SIGNING_SECRET.length < 32) return reply({ ok: false, reason: 'attribution_not_configured' }, 503);
  // Bound streamed bodies too: Content-Length is neither mandatory nor trusted.
  const reader = request.body?.getReader();
  let raw = ''; let bytes = 0;
  try {
    const decoder = new TextDecoder();
    if (reader) while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 24000) { await reader.cancel(); return reply({ ok: false, reason: 'payload_too_large' }, 413); }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const body = object(JSON.parse(raw));
    if (pathname.endsWith('/verify')) {
      const verified = await verifyAttributionToken(env, body.token);
      return verified ? reply({ ok: true, ...verified }) : reply({ ok: false, reason: 'invalid_attribution_token' }, 400);
    }
    const previous = await verifyAttributionToken(env, body.previous_token);
    const issued = await issueAttributionToken(env, request, body, previous?.attribution);
    return reply({ ok: true, ...issued });
  } catch { return reply({ ok: false, reason: 'invalid_request' }, 400); }
}
