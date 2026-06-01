const SUPPORT_PREFIX = 'support:request:';
const SUPPORT_TTL_SECONDS = 60 * 60 * 24 * 120;
const MAX_SORT_KEY = 9_999_999_999_999;

export async function saveSupportRequest(env, request, payload) {
  const store = supportStore(env);
  if (!store) return { ok: false, reason: 'support_storage_not_configured' };

  const now = new Date().toISOString();
  const sortKey = String(MAX_SORT_KEY - Date.now()).padStart(13, '0');
  const id = crypto.randomUUID();
  const record = {
    id,
    at: now,
    name: payload.name || '',
    email: payload.email,
    details: payload.details,
    transcript: payload.transcript || '',
    userAgent: clean(request.headers.get('User-Agent'), 300),
    origin: clean(request.headers.get('Origin'), 160),
  };

  try {
    await store.put(`${SUPPORT_PREFIX}${sortKey}:${id}`, JSON.stringify(record), {
      expirationTtl: SUPPORT_TTL_SECONDS,
    });
  } catch (err) {
    console.error('Support request storage failed', err);
    return { ok: false, reason: 'support_storage_failed' };
  }

  return { ok: true, id, record };
}

export async function readSupportRequests(env, limit = 25) {
  const store = supportStore(env);
  if (!store) return [];

  const cappedLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const list = await store.list({ prefix: SUPPORT_PREFIX, limit: cappedLimit });
  const records = await Promise.all(
    list.keys.map(async (entry) => {
      try {
        const value = await store.get(entry.name);
        if (!value) return null;
        return JSON.parse(value);
      } catch {
        return null;
      }
    }),
  );

  return records
    .filter(Boolean)
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
    .slice(0, cappedLimit);
}

function supportStore(env) {
  return env.SUPPORT_REQUESTS || env.TRACKING || env.CHAT_RATE_LIMITS || null;
}

function clean(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
