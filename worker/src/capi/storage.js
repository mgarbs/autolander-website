import { sanitizeAdvancedMatching } from './validators.js';

const VISITOR_TTL_SECONDS = 90 * 24 * 60 * 60;
const EVENT_DEDUPE_TTL_SECONDS = 24 * 60 * 60;
const COUNTER_TTL_SECONDS = 100 * 24 * 60 * 60;
const RECENT_EVENTS_TTL_SECONDS = 14 * 24 * 60 * 60;
const RECENT_EVENT_PREFIX = 'recent:evt:';
const RECENT_EVENTS_LIST_CAP = 100;
const TS_PAD = 16;

function tracking(env) {
  if (!env.TRACKING) throw new Error('TRACKING KV binding is missing');
  return env.TRACKING;
}

export async function rememberVisitor(env, vid, attr) {
  if (!vid) return { isNew: false, existing: null };
  const key = `vid:${vid}`;
  const existing = await tracking(env).get(key, 'json');
  const now = new Date().toISOString();
  const next = {
    ...(existing || { first_seen: now }),
    ...attr,
    last_seen: now,
  };
  if (!next.first_seen) next.first_seen = now;
  await tracking(env).put(key, JSON.stringify(next), { expirationTtl: VISITOR_TTL_SECONDS });
  return { isNew: !existing, existing: existing || null, visitor: next };
}

export async function lookupVisitor(env, vid) {
  if (!vid) return null;
  return tracking(env).get(`vid:${vid}`, 'json');
}

export async function wasEventSeen(env, eventId) {
  if (!eventId) return false;
  const value = await tracking(env).get(`evt:${eventId}`);
  return value === '1';
}

export async function markEventSeen(env, eventId) {
  if (!eventId) return;
  await tracking(env).put(`evt:${eventId}`, '1', { expirationTtl: EVENT_DEDUPE_TTL_SECONDS });
}

// Single-use proof that a real high-intent conversion just completed. The site
// mints one of these after the backend has accepted the submission; the thank-you
// page redeems it via /capi/confirm before it is allowed to fire a browser pixel
// conversion. 30-minute TTL covers the redirect + page load; single-use (delete
// on read) stops a shared or forwarded thank-you URL from minting a fake event.
const BOOKING_TOKEN_TTL_SECONDS = 30 * 60;

export async function rememberConversionToken(
  env,
  token,
  { eventId = '', eventName = 'Lead', externalId = '', am = {} } = {},
) {
  if (!token) return;
  await tracking(env).put(
    `booktok:${token}`,
    JSON.stringify({ e: eventId, n: eventName, x: externalId, a: sanitizeAdvancedMatching(am) }),
    { expirationTtl: BOOKING_TOKEN_TTL_SECONDS },
  );
}

// Single-use: returns the verified conversion identity the first time a valid token is
// presented (then deletes it), or null for an unknown/used/expired token. KV's
// get/delete pair is best-effort under concurrency; the mandatory shared event ID
// makes simultaneous redemption replay-safe at Meta's deduplication boundary.
// Tolerates the legacy '1' value from before tokens carried an eventID.
export async function consumeConversionToken(env, token) {
  if (!token) return null;
  const key = `booktok:${token}`;
  const raw = await tracking(env).get(key);
  if (!raw) return null;
  await tracking(env).delete(key);
  let eventId = '';
  let eventName = 'Lead';
  let externalId = '';
  let am = {};
  try {
    const parsed = JSON.parse(raw) || {};
    eventId = parsed.e || '';
    eventName = parsed.n || eventName;
    externalId = parsed.x || '';
    am = sanitizeAdvancedMatching(parsed.a);
  } catch {
    eventId = '';
  }
  return { ok: true, eventId, eventName, externalId, am };
}

// Backward-compatible aliases for older booking code paths and any in-flight
// redirects during deployment.
export async function rememberBookingToken(env, token, eventId = '') {
  return rememberConversionToken(env, token, { eventId, eventName: 'Schedule' });
}

export async function consumeBookingToken(env, token) {
  return consumeConversionToken(env, token);
}

export async function rememberDailySeen(env, day, scope, key, ttlSeconds = COUNTER_TTL_SECONDS) {
  if (!day || !scope || !key) return false;
  const safeScope = String(scope).slice(0, 40).replace(/[^a-zA-Z0-9._:\-+]/g, '_');
  const safeKey = String(key).slice(0, 96).replace(/[^a-zA-Z0-9._:\-+]/g, '_');
  const seenKey = `seen:${day}:${safeScope}:${safeKey}`;
  const current = await tracking(env).get(seenKey);
  if (current === '1') return false;
  await tracking(env).put(seenKey, '1', { expirationTtl: ttlSeconds });
  return true;
}

export async function bumpCounter(env, day, dimension, key, n = 1) {
  if (!day || !dimension || !key) return;
  const safeKey = String(key).slice(0, 80).replace(/[^a-zA-Z0-9._:\-+]/g, '_');
  const counterKey = `stats:${day}:${dimension}:${safeKey}`;
  const current = Number((await tracking(env).get(counterKey)) || 0);
  await tracking(env).put(counterKey, String(current + n), { expirationTtl: COUNTER_TTL_SECONDS });
}

export async function readCounter(env, day, dimension, key) {
  const safeKey = String(key).slice(0, 80).replace(/[^a-zA-Z0-9._:\-+]/g, '_');
  const value = await tracking(env).get(`stats:${day}:${dimension}:${safeKey}`);
  return Number(value || 0);
}

export async function listCounterKeys(env, day, dimension) {
  const prefix = `stats:${day}:${dimension}:`;
  const result = await tracking(env).list({ prefix, limit: 1000 });
  return result.keys.map((entry) => ({
    key: entry.name.slice(prefix.length),
    fullKey: entry.name,
  }));
}

// Per-day full-read cache. The admin dashboard reads ~40 dimensions across the
// whole window; doing a separate KV `list` per (dimension, day) fans out to
// 1,000+ KV operations per request and trips Cloudflare's per-invocation
// subrequest limit ("Too many API requests by single Worker invocation").
// Instead we list ALL of a day's `stats:` keys ONCE, group them by dimension,
// and cache that for 60s — so a 30-day window is ~30 lists + a few gets, shared
// across the stats / insights / recommendations calls.
const dayStatsCache = new Map();
const dayStatsInflight = new Map();
const DAY_STATS_TTL_MS = 60 * 1000;

async function readFullDay(env, day) {
  const cached = dayStatsCache.get(day);
  if (cached && Date.now() - cached.at < DAY_STATS_TTL_MS) return cached.data;
  // Single-flight: buildStats fires ~1,000 reads concurrently, so without this
  // every concurrent call for the same day would re-list/re-get the whole day —
  // a stampede that itself blows the subrequest limit. Concurrent callers for a
  // day share ONE in-flight read.
  const existing = dayStatsInflight.get(day);
  if (existing) return existing;

  const load = (async () => {
    const tk = tracking(env);
    const prefix = `stats:${day}:`;
    const data = {};
    let cursor;
    do {
      const res = await tk.list({ prefix, limit: 1000, cursor });
      const names = res.keys.map((entry) => entry.name);
      const values = await Promise.all(names.map((name) => tk.get(name)));
      names.forEach((name, index) => {
        const rest = name.slice(prefix.length); // dimension:safeKey  (safeKey may itself contain ':')
        const sep = rest.indexOf(':');
        if (sep < 0) return;
        const dimension = rest.slice(0, sep);
        const key = rest.slice(sep + 1);
        if (!data[dimension]) data[dimension] = {};
        data[dimension][key] = Number(values[index] || 0);
      });
      cursor = res.list_complete ? undefined : res.cursor;
    } while (cursor);
    if (dayStatsCache.size > 200) dayStatsCache.clear();
    dayStatsCache.set(day, { at: Date.now(), data });
    return data;
  })();

  dayStatsInflight.set(day, load);
  try {
    return await load;
  } finally {
    dayStatsInflight.delete(day);
  }
}

export async function readDimensionForDay(env, day, dimension) {
  const dayData = await readFullDay(env, day);
  return { ...(dayData[dimension] || {}) };
}

export async function pushRecentEvent(env, payload) {
  const tk = tracking(env);
  const ts = Date.now();
  const invertedTs = String(Number.MAX_SAFE_INTEGER - ts).padStart(TS_PAD, '0');
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `${RECENT_EVENT_PREFIX}${invertedTs}:${rand}`;
  await tk.put(key, JSON.stringify(payload), { expirationTtl: RECENT_EVENTS_TTL_SECONDS });
}

export async function readRecentEvents(env, limit = 50) {
  const tk = tracking(env);
  const cap = Math.min(limit, RECENT_EVENTS_LIST_CAP);
  const result = await tk.list({ prefix: RECENT_EVENT_PREFIX, limit: cap });
  const values = await Promise.all(result.keys.map((entry) => tk.get(entry.name, 'json')));
  return values.filter(Boolean);
}
