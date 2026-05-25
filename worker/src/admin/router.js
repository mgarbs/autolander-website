import { handleLogin, handleLogout, requireAdmin, unauthorized } from './auth.js';
import { getAdInsights, getCampaignInsights, hasMetaInsightsConfig } from './meta-insights.js';
import { buildRecommendations, META_URL_PARAM_TEMPLATE } from './recommendations.js';
import { readDimensionForDay, readRecentEvents } from '../capi/storage.js';

const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;

export async function handleAdmin(request, env, corsHeaders, _ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/admin/login' && request.method === 'POST') {
    return handleLogin(request, env, corsHeaders);
  }

  if (path === '/admin/logout' && request.method === 'POST') {
    return handleLogout(request, env, corsHeaders);
  }

  const auth = await requireAdmin(request, env);
  if (!auth.ok) return unauthorized(corsHeaders, auth.reason);

  if (path === '/admin/me') {
    return jsonResponse({ ok: true, session: auth.session }, 200, corsHeaders);
  }

  if (path === '/admin/health') {
    return jsonResponse(buildSetup(env), 200, corsHeaders);
  }

  if (path === '/admin/stats') {
    return jsonResponse(await buildStats(env, paramDays(url)), 200, corsHeaders);
  }

  if (path === '/admin/insights') {
    return jsonResponse(await buildInsightsPayload(env, paramDays(url)), 200, corsHeaders);
  }

  if (path === '/admin/recommendations') {
    return jsonResponse(await buildRecommendationsPayload(env, paramDays(url)), 200, corsHeaders);
  }

  if (path === '/admin/events/recent') {
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
    return jsonResponse({ ok: true, events: await readRecentEvents(env, limit) }, 200, corsHeaders);
  }

  return jsonResponse({ ok: false, reason: 'not_found' }, 404, corsHeaders);
}

function paramDays(url) {
  const raw = Number(url.searchParams.get('days'));
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_DAYS;
  return Math.min(raw, MAX_DAYS);
}

function buildSetup(env) {
  return {
    ok: true,
    hasPixelId: Boolean(env.META_PIXEL_ID),
    hasCapiToken: Boolean(env.META_CAPI_ACCESS_TOKEN),
    hasCalendlySigningKey: Boolean(env.CALENDLY_SIGNING_KEY),
    hasMetaMarketingToken: Boolean(env.META_MARKETING_ACCESS_TOKEN || env.META_CAPI_ACCESS_TOKEN),
    hasAdAccountId: Boolean(env.META_AD_ACCOUNT_ID),
    hasAdminSessionSecret: Boolean(env.ADMIN_SESSION_SECRET),
    hasTrackingKv: Boolean(env.TRACKING),
    testEventCode: env.META_TEST_EVENT_CODE || null,
    metaInsightsReady: hasMetaInsightsConfig(env),
    urlParamTemplate: META_URL_PARAM_TEMPLATE,
  };
}

function daysWindow(days) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

async function readDimensionAcrossDays(env, days, dimension) {
  const results = await Promise.all(days.map((day) => readDimensionForDay(env, day, dimension)));
  const out = {};
  results.forEach((map, i) => {
    out[days[i]] = map;
  });
  return out;
}

function sumByKey(byDay) {
  const totals = {};
  for (const day of Object.keys(byDay)) {
    const entries = byDay[day];
    for (const [key, value] of Object.entries(entries)) {
      totals[key] = (totals[key] || 0) + value;
    }
  }
  return totals;
}

export async function buildStats(env, days) {
  const window = daysWindow(days);
  const [events, campaigns, ads, sources, meta] = await Promise.all([
    readDimensionAcrossDays(env, window, 'event'),
    readDimensionAcrossDays(env, window, 'campaign'),
    readDimensionAcrossDays(env, window, 'ad'),
    readDimensionAcrossDays(env, window, 'source'),
    readDimensionAcrossDays(env, window, 'meta'),
  ]);

  return {
    ok: true,
    days: window,
    events,
    campaigns,
    ads,
    sources,
    meta,
    totals: {
      events: sumByKey(events),
      campaigns: sumByKey(campaigns),
      ads: sumByKey(ads),
      sources: sumByKey(sources),
      meta: sumByKey(meta),
    },
  };
}

function eventCount(totals, name) {
  return totals.events[name] || 0;
}

function buildByDay(stats) {
  return stats.days.map((day) => ({
    date: day,
    pageView: stats.events[day]?.PageView || 0,
    viewContent: stats.events[day]?.ViewContent || 0,
    lead: stats.events[day]?.Lead || 0,
    initiateCheckout: stats.events[day]?.InitiateCheckout || 0,
    schedule: stats.events[day]?.Schedule || 0,
  }));
}

function buildHealth(totals) {
  const events = totals.events;
  let dedupedShare = null;
  let serverShare = null;
  let browserShare = null;

  const tracked = ['PageView', 'ViewContent', 'Lead', 'InitiateCheckout', 'Schedule'];
  let total = 0;
  let browser = 0;
  let server = 0;
  for (const name of tracked) {
    total += events[name] || 0;
    browser += events[`${name}:browser`] || 0;
    server += events[`${name}:server`] || 0;
  }
  if (total > 0) {
    const deduped = Math.max(0, browser + server - total);
    dedupedShare = deduped / total;
    serverShare = server / total;
    browserShare = browser / total;
  }

  const metaVisits = totals.meta.utm_meta_visits || 0;
  const withFbclid = totals.meta.with_fbclid || 0;
  const fbclidCaptureRate = metaVisits > 0 ? Math.min(1, withFbclid / metaVisits) : null;

  return {
    browserShare,
    serverShare,
    dedupedShare,
    fbclidCaptureRate,
    metaVisits,
    withFbclid,
  };
}

export async function buildInsightsPayload(env, days) {
  const stats = await buildStats(env, days);
  const byDay = buildByDay(stats);
  const totals = stats.totals;

  const today = new Date();
  const until = today.toISOString().slice(0, 10);
  const since = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [campaignInsights, adInsights] = await Promise.all([
    getCampaignInsights(env, { since, until }),
    getAdInsights(env, { since, until }),
  ]);

  const campaignScheduleByDay = stats.campaigns;

  const campaignSchedules = {};
  const campaignLeads = {};
  const adSchedules = {};
  const adLeads = {};

  const scheduleByCampaign = await readDimensionAcrossDaysToTotals(env, stats.days, 'campaign_schedule');
  const leadByCampaign = await readDimensionAcrossDaysToTotals(env, stats.days, 'campaign_lead');
  const scheduleByAd = await readDimensionAcrossDaysToTotals(env, stats.days, 'ad_schedule');
  const leadByAd = await readDimensionAcrossDaysToTotals(env, stats.days, 'ad_lead');

  for (const [name, count] of Object.entries(scheduleByCampaign)) campaignSchedules[name] = count;
  for (const [name, count] of Object.entries(leadByCampaign)) campaignLeads[name] = count;
  for (const [name, count] of Object.entries(scheduleByAd)) adSchedules[name] = count;
  for (const [name, count] of Object.entries(leadByAd)) adLeads[name] = count;

  const campaignByName = new Map();
  for (const row of campaignInsights.rows) {
    if (!row.campaign_name) continue;
    const existing = campaignByName.get(row.campaign_name) || {
      campaign_id: row.campaign_id,
      name: row.campaign_name,
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      ctr: 0,
      cpm: 0,
      frequency: 0,
    };
    existing.spend += row.spend;
    existing.impressions += row.impressions;
    existing.clicks += row.clicks;
    existing.reach = Math.max(existing.reach, row.reach);
    existing.ctr = row.ctr;
    existing.cpm = row.cpm;
    existing.frequency = row.frequency;
    campaignByName.set(row.campaign_name, existing);
  }

  for (const name of Object.keys(campaignLeads)) {
    if (!campaignByName.has(name)) {
      campaignByName.set(name, { name, spend: 0, impressions: 0, clicks: 0, reach: 0, ctr: 0, cpm: 0, frequency: 0 });
    }
  }
  for (const name of Object.keys(campaignSchedules)) {
    if (!campaignByName.has(name)) {
      campaignByName.set(name, { name, spend: 0, impressions: 0, clicks: 0, reach: 0, ctr: 0, cpm: 0, frequency: 0 });
    }
  }

  const byCampaign = [...campaignByName.values()].map((row) => {
    const leads = campaignLeads[row.name] || 0;
    const schedules = campaignSchedules[row.name] || 0;
    return {
      ...row,
      leads,
      schedules,
      cpl: leads > 0 ? row.spend / leads : null,
      cps: schedules > 0 ? row.spend / schedules : null,
    };
  });

  byCampaign.sort((a, b) => b.spend - a.spend);

  const adByName = new Map();
  for (const row of adInsights.rows) {
    const key = row.ad_name || row.ad_id;
    if (!key) continue;
    const existing = adByName.get(key) || {
      ad_id: row.ad_id,
      ad_name: row.ad_name || row.ad_id,
      campaign_name: row.campaign_name,
      adset_name: row.adset_name,
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      ctr: row.ctr,
      cpm: row.cpm,
      frequency: row.frequency,
    };
    existing.spend += row.spend;
    existing.impressions += row.impressions;
    existing.clicks += row.clicks;
    existing.reach = Math.max(existing.reach, row.reach);
    existing.ctr = row.ctr;
    existing.cpm = row.cpm;
    existing.frequency = row.frequency;
    adByName.set(key, existing);
  }

  for (const name of Object.keys(adLeads)) {
    if (!adByName.has(name)) {
      adByName.set(name, { ad_name: name, spend: 0, impressions: 0, clicks: 0, reach: 0, ctr: 0, cpm: 0, frequency: 0 });
    }
  }
  for (const name of Object.keys(adSchedules)) {
    if (!adByName.has(name)) {
      adByName.set(name, { ad_name: name, spend: 0, impressions: 0, clicks: 0, reach: 0, ctr: 0, cpm: 0, frequency: 0 });
    }
  }

  const byAd = [...adByName.values()].map((row) => {
    const key = row.ad_name || row.ad_id;
    const leads = adLeads[key] || 0;
    const schedules = adSchedules[key] || 0;
    return {
      ...row,
      leads,
      schedules,
      cpl: leads > 0 ? row.spend / leads : null,
      cps: schedules > 0 ? row.spend / schedules : null,
    };
  });
  byAd.sort((a, b) => b.spend - a.spend);

  const totalSpend = byCampaign.reduce((acc, row) => acc + row.spend, 0);
  const totalSchedules = eventCount(totals, 'Schedule');
  const totalLeads = eventCount(totals, 'Lead');

  const campaignsWithUtm = byCampaign.filter((row) => leadByCampaign[row.name] || scheduleByCampaign[row.name]).length;
  const campaignsMissingUtm = Math.max(0, byCampaign.length - campaignsWithUtm);

  const health = {
    ...buildHealth(totals),
    campaignsMissingUtm,
  };

  return {
    ok: true,
    range: { since, until, days },
    metaInsightsReady: hasMetaInsightsConfig(env),
    metaInsightsError: campaignInsights.error || adInsights.error || null,
    totals: {
      spend: totalSpend,
      leads: totalLeads,
      schedules: totalSchedules,
      pageViews: eventCount(totals, 'PageView'),
      viewContent: eventCount(totals, 'ViewContent'),
      initiateCheckout: eventCount(totals, 'InitiateCheckout'),
      cpl: totalLeads > 0 ? totalSpend / totalLeads : null,
      cps: totalSchedules > 0 ? totalSpend / totalSchedules : null,
    },
    byDay,
    funnel: {
      pageView: eventCount(totals, 'PageView'),
      viewContent: eventCount(totals, 'ViewContent'),
      lead: totalLeads,
      initiateCheckout: eventCount(totals, 'InitiateCheckout'),
      schedule: totalSchedules,
    },
    byCampaign,
    byAd,
    health,
    setup: buildSetup(env),
    rawCampaignByDay: campaignScheduleByDay,
  };
}

async function readDimensionAcrossDaysToTotals(env, days, dimension) {
  const byDay = await Promise.all(days.map((day) => readDimensionForDay(env, day, dimension)));
  const totals = {};
  for (const dayMap of byDay) {
    for (const [key, value] of Object.entries(dayMap)) {
      totals[key] = (totals[key] || 0) + value;
    }
  }
  return totals;
}

export async function buildRecommendationsPayload(env, days) {
  const insights = await buildInsightsPayload(env, days);

  const priorDays = days;
  const today = new Date();
  const priorUntilDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const priorUntil = priorUntilDate.toISOString().slice(0, 10);
  const priorSinceDate = new Date(priorUntilDate.getTime() - (priorDays - 1) * 24 * 60 * 60 * 1000);
  const priorSince = priorSinceDate.toISOString().slice(0, 10);

  const adsPrior = hasMetaInsightsConfig(env)
    ? (await getAdInsights(env, { since: priorSince, until: priorUntil })).rows
    : [];

  const recommendations = buildRecommendations({
    insights: {
      campaigns: insights.byCampaign,
      ads: insights.byAd,
      adsPrior,
    },
    health: insights.health,
    setup: insights.setup,
  });

  return { ok: true, recommendations, generatedAt: new Date().toISOString() };
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
