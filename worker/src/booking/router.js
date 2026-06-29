// Demo application backend:
//   POST /api/apply -> validate lead, upsert contact in GHL, add to workflow,
//                      send the verified server Lead event, mint thank-you token.
//
// The browser never sees the GHL token. The thank-you page only fires the browser
// Lead pixel after redeeming the single-use token minted here.

import { ACTION_SOURCE, buildEvent, sendEvents } from '../capi/meta-client.js';
import { hashEmail, hashLowercase, hashName, hashPhone, sha256Hex } from '../capi/hash.js';
import {
  bumpCounter,
  lookupVisitor,
  markEventSeen,
  pushRecentEvent,
  rememberConversionToken,
  wasEventSeen,
} from '../capi/storage.js';
import { looksLikeBot } from '../security/bot-filter.js';

const ROLE_CHOICES = ['Owner', 'Manager', 'Sales Rep'];
const VEHICLE_COUNT_CHOICES = ['1-50', '51-150', '151+'];
const APPLY_IP_HOURLY = 12;
const APPLY_IP_DAILY = 30;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

const ATTR_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'campaign_id',
  'adset_id',
  'ad_id',
  'campaign_name',
  'adset_name',
  'ad_name',
  'placement',
  'site_source_name',
];

const CUSTOM_FIELD_KEYS = [
  'fullName',
  'dealershipName',
  'role',
  'inventoryUrl',
  'vehicleCount',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'campaign_id',
  'adset_id',
  'ad_id',
  'fbclid',
  'fbc',
  'fbp',
  'landingPageUrl',
  'referrer',
  'userAgent',
  'consentTimestamp',
  'metaEventId',
  'visitorId',
  'submissionId',
];

export async function handleBooking(request, env, corsHeaders, ctx) {
  const url = new URL(request.url);

  if (url.pathname === '/api/apply' && request.method === 'POST') {
    return handleApply(request, env, corsHeaders, ctx);
  }

  if (url.pathname === '/api/availability' || url.pathname === '/api/book') {
    return json(
      { ok: false, reason: 'calendar_disabled', message: 'Demo applications now use /api/apply.' },
      410,
      corsHeaders,
    );
  }

  return json({ ok: false, reason: 'not_found' }, 404, corsHeaders);
}

// Kept for the Worker scheduled handler during deployments where the cron is
// still configured. No calendar cache is needed for the application flow.
export async function syncAvailability() {
  return { ok: true, disabled: true };
}

async function handleApply(request, env, corsHeaders, ctx) {
  if (looksLikeBot(request).bot) {
    return json({ ok: false, reason: 'blocked' }, 403, corsHeaders);
  }

  const limited = await enforceApplyRateLimit(request, env);
  if (!limited.ok) {
    return json({ ok: false, reason: 'rate_limited' }, 429, corsHeaders);
  }

  const config = ghlConfig(env);
  if (!config.ok) {
    return json({ ok: false, reason: 'ghl_not_configured', missing: config.missing }, 503, corsHeaders);
  }

  const body = await safeJson(request);
  const honeypot = clean(body.company, 200);
  if (honeypot) return json({ ok: false, reason: 'blocked' }, 403, corsHeaders);

  const parsedName = splitFullName({
    fullName: body.fullName,
    firstName: body.firstName,
    lastName: body.lastName,
  });
  const { fullName, firstName, lastName } = parsedName;
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const phoneNorm = normalizePhone(phone);
  const dealershipName = clean(body.dealershipName, 160);
  const role = clean(body.role, 40);
  const inventoryUrl = normalizeWebsite(body.inventoryUrl);
  const vehicleCount = clean(body.vehicleCount, 24);
  const smsConsent = Boolean(body.smsConsent);
  const consentTimestamp = normalizeIso(body.consentTimestamp);
  const submissionId = clean(body.submissionId, 96);
  const userAgent = clean(body.userAgent, 500) || clean(request.headers.get('User-Agent'), 500);

  if (!fullName) return json({ ok: false, reason: 'missing_full_name' }, 400, corsHeaders);
  if (!isEmail(email)) return json({ ok: false, reason: 'invalid_email' }, 400, corsHeaders);
  if (!phoneNorm.ok) return json({ ok: false, reason: 'invalid_phone' }, 400, corsHeaders);
  if (!ROLE_CHOICES.includes(role)) return json({ ok: false, reason: 'missing_role' }, 400, corsHeaders);
  if (!inventoryUrl) return json({ ok: false, reason: 'invalid_inventory_url' }, 400, corsHeaders);
  if (vehicleCount && !VEHICLE_COUNT_CHOICES.includes(vehicleCount)) {
    return json({ ok: false, reason: 'invalid_vehicle_count' }, 400, corsHeaders);
  }
  if (!smsConsent || !consentTimestamp) {
    return json({ ok: false, reason: 'missing_consent' }, 400, corsHeaders);
  }
  if (!/^sub_[a-z0-9_-]{12,80}$/i.test(submissionId)) {
    return json({ ok: false, reason: 'invalid_submission' }, 400, corsHeaders);
  }

  const attribution = sanitizeAttribution(body.attribution);
  const visitor = attribution.vid ? await lookupVisitor(env, attribution.vid).catch(() => null) : null;
  const mergedUtms = mergeUtms(visitor?.utms, attribution.utms);
  const page = { ...(visitor?.page || {}), ...(attribution.page || {}) };
  const fbp = attribution.fbp || visitor?.fbp || '';
  const fbc = attribution.fbc || visitor?.fbc || buildFbc(attribution.fbclid || visitor?.fbclid || '');
  const fbclid = attribution.fbclid || visitor?.fbclid || '';
  const eventId = `lead_${(await sha256Hex(`lead:${submissionId}`)).slice(0, 32)}`;
  const sourceUrl = clean(page.current_page, 500) || clean(request.headers.get('Referer'), 500);
  const landingPageUrl = clean(page.landing_page, 500) || sourceUrl;
  const referrer = clean(page.referrer, 240);

  const lead = {
    fullName,
    firstName,
    lastName,
    email,
    phone: phoneNorm.e164,
    phonePretty: phoneNorm.pretty,
    dealershipName,
    role,
    inventoryUrl,
    vehicleCount,
    smsConsent,
    consentTimestamp,
    submissionId,
    userAgent,
    vid: attribution.vid,
    fbp,
    fbc,
    fbclid,
    landingPageUrl,
    referrer,
    eventId,
    utms: mergedUtms,
  };

  const upsert = await upsertGhlContact(env, config, lead);
  if (!upsert.ok) {
    console.error('[api/apply] GHL upsert failed', upsert.status, upsert.detail);
    return json({ ok: false, reason: 'ghl_upsert_failed' }, 502, corsHeaders);
  }

  const contactId = extractContactId(upsert.body);
  if (!contactId) {
    console.error('[api/apply] GHL upsert returned no contact id', JSON.stringify(upsert.body).slice(0, 400));
    return json({ ok: false, reason: 'ghl_contact_id_missing' }, 502, corsHeaders);
  }

  const workflow = await addContactToWorkflow(env, config, contactId);
  if (!workflow.ok && !isAlreadyInWorkflow(workflow.detail)) {
    console.error('[api/apply] GHL workflow add failed', workflow.status, workflow.detail);
    return json({ ok: false, reason: 'ghl_workflow_failed' }, 502, corsHeaders);
  }

  await recordLeadEvent({
    request,
    env,
    ctx,
    lead,
    eventId,
    sourceUrl,
    contactId,
    attribution: {
      ...attribution,
      utms: mergedUtms,
      page,
      fbp,
      fbc,
      fbclid,
      ip: request.headers.get('CF-Connecting-IP') || '',
      country: clean(request.cf?.country, 4).toLowerCase(),
      region: clean(request.cf?.region, 48).toLowerCase(),
      city: clean(request.cf?.city, 48).toLowerCase(),
    },
  });

  const conversionToken = newConversionToken();
  await rememberConversionToken(env, conversionToken, { eventId, eventName: 'Lead' }).catch(() => {});

  return json(
    {
      ok: true,
      redirectPath: '/thank-you',
      bt: conversionToken,
      contactId,
      eventId,
    },
    200,
    corsHeaders,
  );
}

async function upsertGhlContact(env, config, lead) {
  const payload = {
    locationId: config.locationId,
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: lead.fullName || `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    website: lead.inventoryUrl,
    source: 'AutoLander website application',
  };
  if (lead.dealershipName) payload.companyName = lead.dealershipName;

  const customFields = buildCustomFields(env, lead);
  if (customFields.length) payload.customFields = customFields;

  return ghlRequest(env, config, '/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function addContactToWorkflow(env, config, contactId) {
  return ghlRequest(env, config, `/contacts/${encodeURIComponent(contactId)}/workflow/${encodeURIComponent(config.workflowId)}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

async function ghlRequest(env, config, path, init) {
  const baseUrl = (env.GHL_API_BASE_URL || GHL_BASE_URL).replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Version: env.GHL_API_VERSION || GHL_VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  }).catch((err) => ({ ok: false, status: 0, text: async () => String(err?.message || err) }));

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = null;
  }

  return {
    ok: Boolean(response.ok),
    status: response.status,
    body,
    detail: text.slice(0, 600),
  };
}

async function recordLeadEvent({ request, env, ctx, lead, eventId, sourceUrl, contactId, attribution }) {
  const today = isoDay(new Date());
  const alreadySeen = await wasEventSeen(env, eventId).catch(() => false);
  if (alreadySeen) return;

  await markEventSeen(env, eventId).catch(() => {});
  const keys = attributionKeys(lead.utms);
  const hour = new Date().getUTCHours().toString().padStart(2, '0');
  await Promise.all([
    bumpCounter(env, today, 'event', 'Lead'),
    bumpCounter(env, today, 'event', 'Lead:server'),
    bumpCounter(env, today, 'hour_lead', hour),
    keys.siteSource ? bumpCounter(env, today, 'site_source', keys.siteSource) : null,
    keys.placement ? bumpCounter(env, today, 'placement', keys.placement) : null,
    keys.campaignName ? bumpCounter(env, today, 'campaign_lead', keys.campaignName) : null,
    keys.campaignId ? bumpCounter(env, today, 'campaign_id_lead', keys.campaignId) : null,
    keys.adName ? bumpCounter(env, today, 'ad_lead', keys.adName) : null,
    keys.adId ? bumpCounter(env, today, 'ad_id_lead', keys.adId) : null,
    pushRecentEvent(env, {
      at: new Date().toISOString(),
      event: 'Lead',
      source: 'website_application',
      vid: lead.vid,
      campaign_id: keys.campaignId,
      adset_id: keys.adsetId,
      ad_id: keys.adId,
      utm_campaign: keys.campaignName,
      utm_content: keys.adName,
      utm_source: lead.utms.utm_source || '',
      placement: keys.placement,
      site_source_name: keys.siteSource,
      fbclid: Boolean(lead.fbclid),
      eventId,
      contactId,
    }),
  ].filter(Boolean)).catch((err) => {
    console.error('[api/apply] lead analytics write failed', String(err).slice(0, 200));
  });

  if (env.SEND_WORKER_LEAD_CAPI === 'false') return;

  const userData = await buildUserData({
    email: lead.email,
    phone: lead.phone,
    firstName: lead.firstName,
    lastName: lead.lastName,
    fbp: attribution.fbp,
    fbc: attribution.fbc,
    fbclid: attribution.fbclid,
    vid: lead.vid,
    ip: attribution.ip || request.headers.get('CF-Connecting-IP') || '',
    ua: lead.userAgent || request.headers.get('User-Agent') || '',
    country: attribution.country,
    region: attribution.region,
    city: attribution.city,
    pixelId: env.META_PIXEL_ID,
  });

  const capiEvent = buildEvent({
    name: 'Lead',
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    sourceUrl,
    actionSource: ACTION_SOURCE.website,
    userData,
    customData: {
      content_name: 'demo_application_submitted',
      content_category: 'demo',
      lead_type: 'website_application',
      dealership_name: lead.dealershipName,
      role: lead.role,
      vehicle_count: lead.vehicleCount,
      ...lead.utms,
    },
  });

  const sendPromise = (async () => {
    const result = await sendEvents(env, [capiEvent]);
    await bumpCounter(env, today, 'meta', result.ok ? 'capi_ok' : 'capi_failed').catch(() => {});
  })();

  if (ctx?.waitUntil) ctx.waitUntil(sendPromise);
  else await sendPromise;
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
  if (fbc) userData.fbc = fbc;
  else if (fbclid) userData.fbc = buildFbc(fbclid);
  if (vid) userData.external_id = await hashLowercase(pixelId ? `${pixelId}:${vid}` : vid);
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;
  return userData;
}

function buildCustomFields(env, lead) {
  const values = {
    fullName: lead.fullName,
    dealershipName: lead.dealershipName,
    role: lead.role,
    inventoryUrl: lead.inventoryUrl,
    vehicleCount: lead.vehicleCount,
    ...lead.utms,
    fbclid: lead.fbclid,
    fbc: lead.fbc,
    fbp: lead.fbp,
    landingPageUrl: lead.landingPageUrl,
    referrer: lead.referrer,
    userAgent: lead.userAgent,
    consentTimestamp: lead.consentTimestamp,
    metaEventId: lead.eventId,
    visitorId: lead.vid,
    submissionId: lead.submissionId,
  };
  const map = customFieldMap(env);
  const fields = [];
  for (const key of CUSTOM_FIELD_KEYS) {
    const id = fieldIdFor(env, map, key);
    const value = values[key];
    if (!id || value === undefined || value === null || value === '') continue;
    fields.push({ id, fieldValue: String(value).slice(0, 1200) });
  }
  return fields;
}

function customFieldMap(env) {
  if (!env.GHL_CUSTOM_FIELD_MAP) return {};
  try {
    const parsed = JSON.parse(env.GHL_CUSTOM_FIELD_MAP);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function fieldIdFor(env, map, key) {
  return clean(map[key], 120) || clean(env[`GHL_FIELD_${toEnvKey(key)}`], 120);
}

function toEnvKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toUpperCase();
}

function extractContactId(body) {
  return clean(
    body?.contact?.id
      || body?.contactId
      || body?.id
      || body?.data?.contact?.id
      || body?.data?.id,
    120,
  );
}

function isAlreadyInWorkflow(detail = '') {
  return /already|duplicate|currently.*workflow|previously.*workflow/i.test(detail);
}

function ghlConfig(env) {
  const token = clean(env.GHL_PRIVATE_INTEGRATION_TOKEN || env.GHL_API_TOKEN || env.HIGHLEVEL_API_TOKEN, 800);
  const locationId = clean(env.GHL_LOCATION_ID, 120);
  const workflowId = clean(env.GHL_WORKFLOW_ID, 120);
  const missing = [];
  if (!token) missing.push('GHL_PRIVATE_INTEGRATION_TOKEN');
  if (!locationId) missing.push('GHL_LOCATION_ID');
  if (!workflowId) missing.push('GHL_WORKFLOW_ID');
  return { ok: missing.length === 0, missing, token, locationId, workflowId };
}

function sanitizeAttribution(raw) {
  const attr = raw && typeof raw === 'object' ? raw : {};
  return {
    vid: /^v_[a-z0-9]{12,40}$/i.test(attr.vid || '') ? attr.vid : '',
    sid: clean(attr.sid, 64),
    fbp: /^fb\.\d+\.\d+\.\d+$/.test(attr.fbp || '') ? attr.fbp : '',
    fbc: /^fb\.\d+\.\d+\.[A-Za-z0-9_.-]+$/.test(attr.fbc || '') ? attr.fbc : '',
    fbclid: clean(attr.fbclid, 256),
    utms: cleanUtms(attr.utms),
    firstTouch: cleanUtms(attr.firstTouch),
    page: sanitizePage(attr.page),
    device: attr.device && typeof attr.device === 'object' ? attr.device : {},
  };
}

function sanitizePage(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return {
    landing_page: clean(raw.landing_page, 500),
    landing_path: clean(raw.landing_path, 160),
    current_page: clean(raw.current_page, 500),
    current_path: clean(raw.current_path, 160),
    referrer: clean(raw.referrer, 240),
    referrer_domain: clean(raw.referrer_domain, 120).toLowerCase(),
    title: clean(raw.title, 160),
  };
}

function cleanUtms(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const key of ATTR_KEYS) {
    const value = clean(raw[key], 180);
    if (value) out[key] = value;
  }
  if (!out.campaign_id && out.utm_id) out.campaign_id = out.utm_id;
  if (!out.campaign_name && out.utm_campaign) out.campaign_name = out.utm_campaign;
  if (!out.ad_name && out.utm_content) out.ad_name = out.utm_content;
  if (!out.adset_name && out.utm_term) out.adset_name = out.utm_term;
  return out;
}

function mergeUtms(first, last) {
  const out = {};
  for (const key of ATTR_KEYS) {
    const value = clean(last?.[key], 180) || clean(first?.[key], 180);
    if (value) out[key] = value;
  }
  return out;
}

function attributionKeys(utms) {
  return {
    campaignId: utms.campaign_id || utms.utm_id || '',
    campaignName: utms.campaign_name || utms.utm_campaign || '',
    adsetId: utms.adset_id || '',
    adsetName: utms.adset_name || utms.utm_term || '',
    adId: utms.ad_id || '',
    adName: utms.ad_name || utms.utm_content || '',
    placement: utms.placement || '',
    siteSource: utms.site_source_name || utms.utm_source || '',
  };
}

async function enforceApplyRateLimit(request, env) {
  if (env.DISABLE_RATE_LIMITS === 'true' || !env.CHAT_RATE_LIMITS) return { ok: true };
  const now = new Date();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const fp = await sha256Hex(`apply:${ip}`);
  const limits = [
    { key: `apply:ip:${fp}:${day}`, limit: Number(env.APPLY_IP_DAILY_LIMIT || APPLY_IP_DAILY), ttl: secondsUntilTomorrow(now) },
    { key: `apply:ip:${fp}:${hour}`, limit: Number(env.APPLY_IP_HOURLY_LIMIT || APPLY_IP_HOURLY), ttl: 60 * 60 + 120 },
  ];
  const counts = await Promise.all(limits.map((l) => env.CHAT_RATE_LIMITS.get(l.key)));
  if (limits.some((l, i) => Number(counts[i] || 0) >= l.limit)) return { ok: false };
  await Promise.all(
    limits.map((l, i) => env.CHAT_RATE_LIMITS.put(l.key, String(Number(counts[i] || 0) + 1), { expirationTtl: l.ttl })),
  );
  return { ok: true };
}

function newConversionToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function splitFullName({ fullName, firstName, lastName }) {
  const first = clean(firstName, 80);
  const last = clean(lastName, 80);
  const raw = clean(fullName, 160) || clean(`${first} ${last}`, 160);
  if (!raw) return { fullName: '', firstName: '', lastName: '' };

  if (first || last) {
    const joined = clean(`${first} ${last}`.trim() || raw, 160);
    return { fullName: joined, firstName: first || raw.split(' ')[0] || '', lastName: last };
  }

  const parts = raw.split(' ').filter(Boolean);
  const parsedFirst = clean(parts.shift() || '', 80);
  const parsedLast = clean(parts.join(' '), 80);
  return { fullName: raw, firstName: parsedFirst, lastName: parsedLast };
}

function normalizeWebsite(value) {
  const raw = clean(value, 240);
  if (!raw) return '';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, '');
    if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host)) return '';
    return url.toString().slice(0, 240);
  } catch {
    return '';
  }
}

function normalizeIso(value) {
  if (typeof value !== 'string') return '';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return '';
  return new Date(t).toISOString();
}

function isEmail(value) {
  return /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(value);
}

function normalizePhone(raw) {
  const s = typeof raw === 'string' ? raw.trim() : '';
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  let nat = digits;
  if (nat.length === 11 && nat.startsWith('1')) nat = nat.slice(1);
  if (/^[2-9]\d{2}[2-9]\d{6}$/.test(nat)) {
    return {
      ok: true,
      e164: `+1${nat}`,
      pretty: `(${nat.slice(0, 3)}) ${nat.slice(3, 6)}-${nat.slice(6)}`,
    };
  }
  if (hasPlus && !digits.startsWith('1') && /^[1-9]\d{7,14}$/.test(digits)) {
    const e164 = `+${digits}`;
    return { ok: true, e164, pretty: e164 };
  }
  return { ok: false, e164: '', pretty: '' };
}

function buildFbc(fbclid) {
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : '';
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
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

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
