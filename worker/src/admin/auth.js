const SESSION_COOKIE = 'al_admin';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function base64UrlEncode(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

async function hmacSha256Hex(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function issueSession(secret) {
  const payload = JSON.stringify({ uid: 'owner', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
  const encoded = base64UrlEncode(payload);
  const signature = await hmacSha256Hex(secret, encoded);
  return `${encoded}.${signature}`;
}

async function verifySession(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = await hmacSha256Hex(secret, encoded);
  if (!timingSafeEqual(expected, signature)) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encoded));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookie(header, name) {
  if (!header) return '';
  const pattern = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`);
  const match = header.match(pattern);
  return match ? decodeURIComponent(match[1]) : '';
}

function buildCookie(name, value, ttlSeconds) {
  const flags = ['Path=/', 'HttpOnly', 'Secure', 'SameSite=None'];
  if (ttlSeconds > 0) {
    flags.push(`Max-Age=${ttlSeconds}`);
    flags.push(`Expires=${new Date(Date.now() + ttlSeconds * 1000).toUTCString()}`);
  } else {
    flags.push('Max-Age=0');
    flags.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  }
  return `${name}=${encodeURIComponent(value)}; ${flags.join('; ')}`;
}

export async function handleLogin(request, env, corsHeaders) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return jsonResponse({ ok: false, reason: 'admin_not_configured' }, 503, corsHeaders);
  }

  const body = await safeJson(request);
  const password = typeof body.password === 'string' ? body.password : '';

  const expectedHash = await hmacSha256Hex(env.ADMIN_SESSION_SECRET, env.ADMIN_PASSWORD);
  const candidateHash = await hmacSha256Hex(env.ADMIN_SESSION_SECRET, password);
  if (!timingSafeEqual(expectedHash, candidateHash)) {
    return jsonResponse({ ok: false, reason: 'invalid_password' }, 401, corsHeaders);
  }

  const token = await issueSession(env.ADMIN_SESSION_SECRET);
  return jsonResponse(
    { ok: true, token, expiresIn: SESSION_TTL_SECONDS },
    200,
    {
      ...corsHeaders,
      'Set-Cookie': buildCookie(SESSION_COOKIE, token, SESSION_TTL_SECONDS),
    },
  );
}

export function handleLogout(_request, _env, corsHeaders) {
  return jsonResponse(
    { ok: true },
    200,
    {
      ...corsHeaders,
      'Set-Cookie': buildCookie(SESSION_COOKIE, '', 0),
    },
  );
}

export async function requireAdmin(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return { ok: false, status: 503, reason: 'not_configured' };

  const authHeader = request.headers.get('Authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const cookieToken = parseCookie(request.headers.get('Cookie'), SESSION_COOKIE);
  const token = bearer || cookieToken;
  if (!token) return { ok: false, status: 401, reason: 'no_session' };

  const session = await verifySession(token, env.ADMIN_SESSION_SECRET);
  if (!session) return { ok: false, status: 401, reason: 'invalid_session' };
  return { ok: true, session };
}

export function unauthorized(corsHeaders, reason = 'unauthorized') {
  return jsonResponse({ ok: false, reason }, 401, corsHeaders);
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
