const META_GRAPH_VERSION = 'v19.0';
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

function getToken(env) {
  return env.META_MARKETING_ACCESS_TOKEN || env.META_CAPI_ACCESS_TOKEN || '';
}

export function hasMetaInsightsConfig(env) {
  return Boolean(getToken(env) && env.META_AD_ACCOUNT_ID);
}

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cachePut(key, data) {
  cache.set(key, { at: Date.now(), data });
}

async function fetchInsights(env, { level, since, until }) {
  const token = getToken(env);
  if (!token || !env.META_AD_ACCOUNT_ID) return { rows: [], error: 'not_configured' };

  const cacheKey = `${level}:${since}:${until}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const fields =
    level === 'campaign'
      ? 'campaign_id,campaign_name,spend,impressions,clicks,ctr,cpm,reach,frequency'
      : 'ad_id,ad_name,campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,ctr,cpm,reach,frequency';

  const url = new URL(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${env.META_AD_ACCOUNT_ID}/insights`,
  );
  url.searchParams.set('level', level);
  url.searchParams.set('fields', fields);
  url.searchParams.set('time_range', JSON.stringify({ since, until }));
  url.searchParams.set('limit', '200');
  url.searchParams.set('access_token', token);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const detail = await response.text();
      console.error('[meta-insights] Meta returned non-OK', response.status, detail.slice(0, 300));
      const result = { rows: [], error: `meta_${response.status}` };
      cachePut(cacheKey, result);
      return result;
    }
    const json = await response.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    const normalized = rows.map((row) => ({
      campaign_id: row.campaign_id || '',
      campaign_name: row.campaign_name || '',
      ad_id: row.ad_id || '',
      ad_name: row.ad_name || '',
      adset_id: row.adset_id || '',
      adset_name: row.adset_name || '',
      spend: Number(row.spend) || 0,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      ctr: Number(row.ctr) || 0,
      cpm: Number(row.cpm) || 0,
      reach: Number(row.reach) || 0,
      frequency: Number(row.frequency) || 0,
    }));
    const result = { rows: normalized };
    cachePut(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[meta-insights] fetch failed', err?.message || err);
    return { rows: [], error: 'fetch_error' };
  }
}

export async function getCampaignInsights(env, { since, until }) {
  return fetchInsights(env, { level: 'campaign', since, until });
}

export async function getAdInsights(env, { since, until }) {
  return fetchInsights(env, { level: 'ad', since, until });
}
