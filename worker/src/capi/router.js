import { ACTION_SOURCE, buildEvent, sendEvents } from './meta-client.js';
import { hashEmail, hashLowercase, hashName, hashPhone, sha256Hex } from './hash.js';
import {
  bumpCounter,
  lookupVisitor,
  markEventSeen,
  pushRecentEvent,
  rememberVisitor,
  wasEventSeen,
} from './storage.js';
import {
  clean,
  cleanUtms,
  isAllowedEvent,
  isCustomEvent,
  isValidEventId,
  isValidFbc,
  isValidFbp,
  isValidVid,
} from './validators.js';

const TRACK_DAILY_IP_LIMIT = 240;
const TRACK_HOURLY_IP_LIMIT = 30;
const TRACK_DAILY_GLOBAL_LIMIT = 50000;

const AL_VID_PREFIX = 'al_vid:';

const KNOWN_PAID_SOURCES = new Set(['meta', 'facebook', 'fb', 'instagram', 'ig']);

function isAttributableTraffic(utms, fbclid) {
  if (fbclid) return true;
  const source = (utms?.utm_source || '').toLowerCase();
  return KNOWN_PAID_SOURCES.has(source);
}

export async function handleCapi(request, env, corsHeaders, ctx) {
  const url = new URL(request.url);

  if (url.pathname === '/capi/health') {
    return jsonResponse(
      {
        ok: true,
        hasPixelId: Boolean(env.META_PIXEL_ID),
        hasCapiToken: Boolean(env.META_CAPI_ACCESS_TOKEN),
        hasCalendlySigningKey: Boolean(env.CALENDLY_SIGNING_KEY),
        hasMetaMarketingToken: Boolean(env.META_MARKETING_ACCESS_TOKEN || env.META_CAPI_ACCESS_TOKEN),
        hasAdAccountId: Boolean(env.META_AD_ACCOUNT_ID),
        hasAdminPassword: Boolean(env.ADMIN_PASSWORD),
        hasAdminSessionSecret: Boolean(env.ADMIN_SESSION_SECRET),
        hasTrackingKv: Boolean(env.TRACKING),
        testEventCode: env.META_TEST_EVENT_CODE ? String(env.META_TEST_EVENT_CODE) : null,
        graphVersion: 'v19.0',
      },
      200,
      corsHeaders,
    );
  }

  if (url.pathname === '/capi/track' && request.method === 'POST') {
    return handleTrack(request, env, corsHeaders, ctx);
  }

  if (url.pathname === '/capi/calendly' && request.method === 'POST') {
    return handleCalendly(request, env, corsHeaders, ctx);
  }

  return jsonResponse({ message: 'Not found' }, 404, corsHeaders);
}

async function handleTrack(request, env, corsHeaders, ctx) {
  const limit = await enforceTrackRateLimit(request, env);
  if (!limit.ok) {
    return jsonResponse({ ok: false, reason: limit.reason }, limit.status || 429, corsHeaders);
  }

  const body = await safeJson(request);
  const eventName = clean(body.event, 64);
  if (!isAllowedEvent(eventName)) {
    return jsonResponse({ ok: false, reason: 'unsupported_event' }, 400, corsHeaders);
  }

  const eventId = clean(body.eventId, 128);
  if (!isValidEventId(eventId)) {
    return jsonResponse({ ok: false, reason: 'invalid_event_id' }, 400, corsHeaders);
  }

  const vid = isValidVid(body.vid) ? body.vid : '';
  const fbp = isValidFbp(body.fbp) ? body.fbp : '';
  const fbc = isValidFbc(body.fbc) ? body.fbc : '';
  const fbclid = clean(body.fbclid, 256);
  const utms = cleanUtms(body.utms);
  const sourceUrl = clean(body.sourceUrl, 500);
  const eventTime = Number(body.eventTime) || Math.floor(Date.now() / 1000);
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const country = clean(request.cf?.country, 4).toLowerCase();
  const region = clean(request.cf?.region, 48).toLowerCase();
  const city = clean(request.cf?.city, 48).toLowerCase();

  const today = isoDay(new Date());

  if (vid) {
    await rememberVisitor(env, vid, { fbp, fbc, fbclid, utms, ip, ua, country, region, city });
  }

  const alreadySeen = await wasEventSeen(env, eventId);
  if (!alreadySeen) {
    await markEventSeen(env, eventId);
    const attributable = isAttributableTraffic(utms, fbclid);
    await Promise.all([
      bumpCounter(env, today, 'event', eventName),
      bumpCounter(env, today, 'event', `${eventName}:browser`),
      attributable && utms.utm_source ? bumpCounter(env, today, 'source', utms.utm_source) : null,
      attributable && utms.utm_campaign ? bumpCounter(env, today, 'campaign', utms.utm_campaign) : null,
      attributable && utms.utm_content ? bumpCounter(env, today, 'ad', utms.utm_content) : null,
      attributable && utms.utm_campaign && eventName === 'Lead'
        ? bumpCounter(env, today, 'campaign_lead', utms.utm_campaign)
        : null,
      attributable && utms.utm_campaign && eventName === 'Schedule'
        ? bumpCounter(env, today, 'campaign_schedule', utms.utm_campaign)
        : null,
      attributable && utms.utm_content && eventName === 'Lead'
        ? bumpCounter(env, today, 'ad_lead', utms.utm_content)
        : null,
      attributable && utms.utm_content && eventName === 'Schedule'
        ? bumpCounter(env, today, 'ad_schedule', utms.utm_content)
        : null,
      fbclid ? bumpCounter(env, today, 'meta', 'with_fbclid') : null,
      utms.utm_source === 'meta' ? bumpCounter(env, today, 'meta', 'utm_meta_visits') : null,
    ].filter(Boolean));

    await pushRecentEvent(env, {
      at: new Date().toISOString(),
      event: eventName,
      source: 'browser',
      vid,
      utm_campaign: utms.utm_campaign || '',
      utm_content: utms.utm_content || '',
      utm_source: utms.utm_source || '',
      fbclid: Boolean(fbclid),
      eventId,
    });
  }

  const customData = sanitizeCustomData(body.customData);
  const userData = await buildUserData({
    fbp,
    fbc,
    fbclid,
    vid,
    email: body.email,
    phone: body.phone,
    firstName: body.firstName,
    lastName: body.lastName,
    ip,
    ua,
    country,
    region,
    city,
    pixelId: env.META_PIXEL_ID,
  });

  const capiEvent = buildEvent({
    name: isCustomEvent(eventName) ? eventName : eventName,
    eventId,
    eventTime,
    sourceUrl,
    actionSource: ACTION_SOURCE.website,
    userData,
    customData,
  });

  const sendPromise = sendEvents(env, [capiEvent]);
  if (ctx?.waitUntil) ctx.waitUntil(sendPromise);
  else await sendPromise;

  return jsonResponse({ ok: true, deduped: alreadySeen }, 200, corsHeaders);
}

async function handleCalendly(request, env, corsHeaders, ctx) {
  if (!env.CALENDLY_SIGNING_KEY) {
    console.warn('[capi/calendly] CALENDLY_SIGNING_KEY is not configured — refusing webhook');
    return jsonResponse({ ok: false, reason: 'calendly_not_configured' }, 503, corsHeaders);
  }

  const rawBody = await request.text();

  const signatureHeader = request.headers.get('Calendly-Webhook-Signature');
  const ok = await verifyCalendlySignature(signatureHeader, rawBody, env.CALENDLY_SIGNING_KEY);
  if (!ok) {
    console.warn('[capi/calendly] Invalid signature');
    return jsonResponse({ ok: false, reason: 'invalid_signature' }, 401, corsHeaders);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, reason: 'invalid_json' }, 400, corsHeaders);
  }

  if (payload.event !== 'invitee.created') {
    return jsonResponse({ ok: true, ignored: payload.event || 'unknown_event' }, 200, corsHeaders);
  }

  const data = payload.payload || {};
  const eventUri = clean(data.event, 500) || clean(data.uri, 500) || `cal_${Date.now()}`;
  const tracking = data.tracking || {};
  const email = clean(data.email, 200);
  const name = clean(data.name, 160);
  const [firstName, ...rest] = name ? name.split(/\s+/) : [''];
  const lastName = rest.join(' ');

  const utmContent = clean(tracking.utm_content, 240);
  const utms = {
    utm_source: clean(tracking.utm_source, 120),
    utm_medium: clean(tracking.utm_medium, 120),
    utm_campaign: clean(tracking.utm_campaign, 120),
    utm_content: utmContent.replace(new RegExp(`\\|?${AL_VID_PREFIX}[^|]+`, 'i'), '').replace(/^\|+|\|+$/g, ''),
    utm_term: clean(tracking.utm_term, 120),
  };

  const vidMatch = utmContent.match(new RegExp(`${AL_VID_PREFIX}(v_[a-z0-9]{12,40})`, 'i'));
  const vid = vidMatch ? vidMatch[1] : '';
  const visitor = vid ? await lookupVisitor(env, vid) : null;

  const fbp = visitor?.fbp || '';
  const fbc = visitor?.fbc || '';
  const fbclid = visitor?.fbclid || '';
  const ip = visitor?.ip || '';
  const ua = visitor?.ua || '';
  const country = visitor?.country || '';
  const region = visitor?.region || '';
  const city = visitor?.city || '';
  const mergedUtms = mergeUtms(visitor?.utms, utms);

  const eventIdHash = await sha256Hex(eventUri);
  const eventId = `cal_${eventIdHash.slice(0, 32)}`;
  const eventTime = Math.floor(new Date(data.created_at || Date.now()).getTime() / 1000);

  if (await wasEventSeen(env, eventId)) {
    return jsonResponse({ ok: true, deduped: true }, 200, corsHeaders);
  }
  await markEventSeen(env, eventId);

  const userData = await buildUserData({
    email,
    firstName,
    lastName,
    fbp,
    fbc,
    fbclid,
    vid,
    ip,
    ua,
    country,
    region,
    city,
    pixelId: env.META_PIXEL_ID,
  });

  const customData = {
    content_name: 'demo_booked',
    content_category: 'demo',
    currency: 'USD',
    ...mergedUtms,
  };

  const capiEvent = buildEvent({
    name: 'Schedule',
    eventId,
    eventTime,
    sourceUrl: clean(data.event_url, 500) || clean(payload.event_url, 500),
    actionSource: ACTION_SOURCE.systemGenerated,
    userData,
    customData,
  });

  const today = isoDay(new Date(eventTime * 1000));
  const counterPromise = Promise.all([
    bumpCounter(env, today, 'event', 'Schedule'),
    bumpCounter(env, today, 'event', 'Schedule:server'),
    mergedUtms.utm_campaign ? bumpCounter(env, today, 'campaign_schedule', mergedUtms.utm_campaign) : null,
    mergedUtms.utm_content ? bumpCounter(env, today, 'ad_schedule', mergedUtms.utm_content) : null,
    pushRecentEvent(env, {
      at: new Date().toISOString(),
      event: 'Schedule',
      source: 'calendly',
      vid,
      utm_campaign: mergedUtms.utm_campaign || '',
      utm_content: mergedUtms.utm_content || '',
      utm_source: mergedUtms.utm_source || '',
      fbclid: Boolean(fbclid),
      eventId,
    }),
  ].filter(Boolean));

  const sendPromise = (async () => {
    await counterPromise;
    await sendEvents(env, [capiEvent]);
  })();

  if (ctx?.waitUntil) ctx.waitUntil(sendPromise);
  else await sendPromise;

  return jsonResponse({ ok: true }, 200, corsHeaders);
}

async function buildUserData({
  email,
  phone,
  firstName,
  lastName,
  fbp,
  fbc,
  fbclid,
  vid,
  ip,
  ua,
  country,
  region,
  city,
  pixelId,
}) {
  const userData = {};

  const emHash = await hashEmail(email);
  if (emHash) userData.em = emHash;

  const phHash = await hashPhone(phone);
  if (phHash) userData.ph = phHash;

  const fnHash = await hashName(firstName);
  if (fnHash) userData.fn = fnHash;

  const lnHash = await hashName(lastName);
  if (lnHash) userData.ln = lnHash;

  if (country) userData.country = await hashLowercase(country);
  if (region) userData.st = await hashLowercase(region);
  if (city) userData.ct = await hashLowercase(city);

  if (fbp) userData.fbp = fbp;
  if (fbc) {
    userData.fbc = fbc;
  } else if (fbclid) {
    userData.fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  if (vid) {
    const salted = pixelId ? `${pixelId}:${vid}` : vid;
    userData.external_id = await hashLowercase(salted);
  }
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;

  return userData;
}

function sanitizeCustomData(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.length > 64) continue;
    if (typeof value === 'string') out[key] = value.slice(0, 200);
    else if (typeof value === 'number' || typeof value === 'boolean') out[key] = value;
  }
  return out;
}

function mergeUtms(first, last) {
  const out = {};
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  for (const key of keys) {
    const value = clean(last?.[key], 120) || clean(first?.[key], 120);
    if (value) out[key] = value;
  }
  return out;
}

async function verifyCalendlySignature(header, rawBody, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key?.trim(), value?.trim()];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const data = `${timestamp}.${rawBody}`;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = await crypto.subtle.sign('HMAC', keyMaterial, new TextEncoder().encode(data));
  const expectedHex = [...new Uint8Array(expected)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(expectedHex, signature);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function enforceTrackRateLimit(request, env) {
  if (env.DISABLE_RATE_LIMITS === 'true') return { ok: true };
  if (!env.CHAT_RATE_LIMITS) {
    return { ok: false, status: 503, reason: 'rate_limit_kv_unavailable' };
  }

  const now = new Date();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const fingerprint = await sha256Hex(`track:${ip}`);

  const limits = [
    {
      key: `track:global:${day}`,
      limit: Number(env.TRACK_DAILY_GLOBAL_LIMIT || TRACK_DAILY_GLOBAL_LIMIT),
      ttl: secondsUntilTomorrow(now),
    },
    {
      key: `track:ip:${fingerprint}:${day}`,
      limit: Number(env.TRACK_DAILY_IP_LIMIT || TRACK_DAILY_IP_LIMIT),
      ttl: secondsUntilTomorrow(now),
    },
    {
      key: `track:ip:${fingerprint}:${hour}`,
      limit: Number(env.TRACK_HOURLY_IP_LIMIT || TRACK_HOURLY_IP_LIMIT),
      ttl: 60 * 60 + 60,
    },
  ];

  const counts = await Promise.all(limits.map((entry) => env.CHAT_RATE_LIMITS.get(entry.key)));
  const blocked = limits.findIndex((entry, index) => Number(counts[index] || 0) >= entry.limit);
  if (blocked >= 0) {
    return { ok: false, status: 429, reason: `rate_limited:${blocked}` };
  }

  await Promise.all(
    limits.map((entry, index) =>
      env.CHAT_RATE_LIMITS.put(entry.key, String(Number(counts[index] || 0) + 1), {
        expirationTtl: entry.ttl,
      }),
    ),
  );

  return { ok: true };
}

function secondsUntilTomorrow(date) {
  const tomorrow = new Date(date);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return Math.max(60, Math.ceil((tomorrow.getTime() - date.getTime()) / 1000));
}

function isoDay(date) {
  return date.toISOString().slice(0, 10);
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
