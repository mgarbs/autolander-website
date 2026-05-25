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
  if (!vid) return;
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

export async function readDimensionForDay(env, day, dimension) {
  const entries = await listCounterKeys(env, day, dimension);
  if (entries.length === 0) return {};
  const values = await Promise.all(entries.map((entry) => tracking(env).get(entry.fullKey)));
  const out = {};
  entries.forEach((entry, index) => {
    out[entry.key] = Number(values[index] || 0);
  });
  return out;
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
