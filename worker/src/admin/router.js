import { handleLogin, handleLogout, requireAdmin, unauthorized } from './auth.js';
import { buildAiSummaryPayload } from './ai-summary.js';
import { getAdInsights, getCampaignInsights, hasMetaInsightsConfig } from './meta-insights.js';
import { buildRecommendations, META_URL_PARAM_TEMPLATE } from './recommendations.js';
import { createAdminSubscriptionLink } from './stripe-links.js';
import { handleOpsCandidates, handleOpsLink, handleOpsUnlinked } from './ops-linking.js';
import { readDimensionForDay, readRecentEvents } from '../capi/storage.js';
import { readSupportRequests } from '../support/storage.js';

const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;

export async function handleAdmin(request, env, corsHeaders, _ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/admin-api(?=\/|$)/, '/admin');

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

  if (path === '/admin/ai-summary' && request.method === 'POST') {
    const body = await safeJson(request);
    const days = normalizeDays(body.days || url.searchParams.get('days'));
    const insights = await buildInsightsPayload(env, days);
    return jsonResponse(await buildAiSummaryPayload(env, days, insights), 200, corsHeaders);
  }

  if (path === '/admin/subscription-link' && request.method === 'POST') {
    const result = await createAdminSubscriptionLink(request, env);
    return jsonResponse(result.body, result.status, corsHeaders);
  }

  if (path === '/admin/ops/unlinked' && request.method === 'GET') {
    const result = await handleOpsUnlinked(url, env);
    return jsonResponse(result.body, result.status, corsHeaders);
  }

  if (path === '/admin/ops/candidates' && request.method === 'GET') {
    const result = await handleOpsCandidates(url, env);
    return jsonResponse(result.body, result.status, corsHeaders);
  }

  if (path === '/admin/ops/link' && request.method === 'POST') {
    const result = await handleOpsLink(request, env);
    return jsonResponse(result.body, result.status, corsHeaders);
  }

  if (path === '/admin/events/recent') {
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
    return jsonResponse({ ok: true, events: await readRecentEvents(env, limit) }, 200, corsHeaders);
  }

  if (path === '/admin/support/recent') {
    const limit = Math.min(Number(url.searchParams.get('limit') || 25), 100);
    return jsonResponse({ ok: true, requests: await readSupportRequests(env, limit) }, 200, corsHeaders);
  }

  return jsonResponse({ ok: false, reason: 'not_found' }, 404, corsHeaders);
}

function paramDays(url) {
  return normalizeDays(url.searchParams.get('days'));
}

function normalizeDays(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_DAYS;
  return Math.min(raw, MAX_DAYS);
}

function buildSetup(env) {
  return {
    ok: true,
    hasPixelId: Boolean(env.META_PIXEL_ID),
    hasCapiToken: Boolean(env.META_CAPI_ACCESS_TOKEN),
    hasCalendlySigningKey: Boolean(env.CALENDLY_SIGNING_KEY),
    hasGhlLeadRouting: Boolean(
      (env.GHL_PRIVATE_INTEGRATION_TOKEN || env.GHL_API_TOKEN || env.HIGHLEVEL_API_TOKEN)
        && env.GHL_LOCATION_ID
        && env.GHL_WORKFLOW_ID,
    ),
    hasMetaMarketingToken: Boolean(env.META_MARKETING_ACCESS_TOKEN || env.META_CAPI_ACCESS_TOKEN),
    hasAdAccountId: Boolean(env.META_AD_ACCOUNT_ID),
    hasAdminSessionSecret: Boolean(env.ADMIN_SESSION_SECRET),
    hasTrackingKv: Boolean(env.TRACKING),
    hasStripeSubscriptionLinks: Boolean(env.STRIPE_SECRET_KEY || env.STRIPE_RESTRICTED_KEY),
    hasOpsLinking: Boolean(env.OPS_ADMIN_TOKEN),
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
  const [
    events,
    campaigns,
    ads,
    sources,
    meta,
    placement,
    siteSource,
    device,
    visitorType,
    network,
    country,
    region,
    hour,
    hourLead,
    hourSchedule,
    weekday,
    audience,
    trafficCategory,
    referrerDomain,
    landingPage,
    pagePath,
    browser,
    os,
    viewport,
    orientation,
    touch,
    connection,
    timezone,
    language,
    networkOrg,
    edge,
    intent,
    engagement,
    scrollDepth,
  ] = await Promise.all([
    readDimensionAcrossDays(env, window, 'event'),
    readDimensionAcrossDays(env, window, 'campaign'),
    readDimensionAcrossDays(env, window, 'ad'),
    readDimensionAcrossDays(env, window, 'source'),
    readDimensionAcrossDays(env, window, 'meta'),
    readDimensionAcrossDays(env, window, 'placement'),
    readDimensionAcrossDays(env, window, 'site_source'),
    readDimensionAcrossDays(env, window, 'device'),
    readDimensionAcrossDays(env, window, 'visitor_type'),
    readDimensionAcrossDays(env, window, 'network'),
    readDimensionAcrossDays(env, window, 'country'),
    readDimensionAcrossDays(env, window, 'region'),
    readDimensionAcrossDays(env, window, 'hour'),
    readDimensionAcrossDays(env, window, 'hour_lead'),
    readDimensionAcrossDays(env, window, 'hour_schedule'),
    readDimensionAcrossDays(env, window, 'weekday'),
    readDimensionAcrossDays(env, window, 'audience'),
    readDimensionAcrossDays(env, window, 'traffic_category'),
    readDimensionAcrossDays(env, window, 'referrer_domain'),
    readDimensionAcrossDays(env, window, 'landing_page'),
    readDimensionAcrossDays(env, window, 'page_path'),
    readDimensionAcrossDays(env, window, 'browser'),
    readDimensionAcrossDays(env, window, 'os'),
    readDimensionAcrossDays(env, window, 'viewport'),
    readDimensionAcrossDays(env, window, 'orientation'),
    readDimensionAcrossDays(env, window, 'touch'),
    readDimensionAcrossDays(env, window, 'connection'),
    readDimensionAcrossDays(env, window, 'timezone'),
    readDimensionAcrossDays(env, window, 'language'),
    readDimensionAcrossDays(env, window, 'network_org'),
    readDimensionAcrossDays(env, window, 'edge'),
    readDimensionAcrossDays(env, window, 'intent'),
    readDimensionAcrossDays(env, window, 'engagement'),
    readDimensionAcrossDays(env, window, 'scroll_depth'),
  ]);

  return {
    ok: true,
    days: window,
    events,
    campaigns,
    ads,
    sources,
    meta,
    placement,
    siteSource,
    device,
    visitorType,
    network,
    country,
    region,
    hour,
    hourLead,
    hourSchedule,
    weekday,
    audience,
    trafficCategory,
    referrerDomain,
    landingPage,
    pagePath,
    browser,
    os,
    viewport,
    orientation,
    touch,
    connection,
    timezone,
    language,
    networkOrg,
    edge,
    intent,
    engagement,
    scrollDepth,
    totals: {
      events: sumByKey(events),
      campaigns: sumByKey(campaigns),
      ads: sumByKey(ads),
      sources: sumByKey(sources),
      meta: sumByKey(meta),
      placement: sumByKey(placement),
      siteSource: sumByKey(siteSource),
      device: sumByKey(device),
      visitorType: sumByKey(visitorType),
      network: sumByKey(network),
      country: sumByKey(country),
      region: sumByKey(region),
      hour: sumByKey(hour),
      hourLead: sumByKey(hourLead),
      hourSchedule: sumByKey(hourSchedule),
      weekday: sumByKey(weekday),
      audience: sumByKey(audience),
      trafficCategory: sumByKey(trafficCategory),
      referrerDomain: sumByKey(referrerDomain),
      landingPage: sumByKey(landingPage),
      pagePath: sumByKey(pagePath),
      browser: sumByKey(browser),
      os: sumByKey(os),
      viewport: sumByKey(viewport),
      orientation: sumByKey(orientation),
      touch: sumByKey(touch),
      connection: sumByKey(connection),
      timezone: sumByKey(timezone),
      language: sumByKey(language),
      networkOrg: sumByKey(networkOrg),
      edge: sumByKey(edge),
      intent: sumByKey(intent),
      engagement: sumByKey(engagement),
      scrollDepth: sumByKey(scrollDepth),
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
    uniqueVisitors: stats.audience[day]?.unique_visitors || 0,
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

  // Lead and Schedule are intentionally excluded from the browser/server dedupe
  // health math: their browser legs fire the pixel straight to Meta from the
  // gated thank-you page and never hit the Worker, while the Worker/webhook bumps
  // the server counters. Including them would skew the health shares with a
  // phantom "server-only" event.
  const tracked = ['PageView', 'ViewContent', 'InitiateCheckout'];
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
  const withCampaignId = totals.meta.with_campaign_id || 0;
  const withAdId = totals.meta.with_ad_id || 0;
  const missingCampaignId = totals.meta.missing_campaign_id || 0;
  const missingAdId = totals.meta.missing_ad_id || 0;
  const unresolvedParamHits = totals.meta.unresolved_macros || 0;
  const capiOk = totals.meta.capi_ok || 0;
  const capiFailed = totals.meta.capi_failed || 0;

  return {
    browserShare,
    serverShare,
    dedupedShare,
    fbclidCaptureRate,
    campaignIdRate: metaVisits > 0 ? Math.min(1, withCampaignId / metaVisits) : null,
    adIdRate: metaVisits > 0 ? Math.min(1, withAdId / metaVisits) : null,
    metaVisits,
    withFbclid,
    missingCampaignId,
    missingAdId,
    unresolvedParamHits,
    capiOk,
    capiFailed,
    capiSuccessRate: capiOk + capiFailed > 0 ? capiOk / (capiOk + capiFailed) : null,
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

  const rawCampaignByDay = stats.campaigns;

  const [
    scheduleByCampaign,
    leadByCampaign,
    scheduleByCampaignId,
    leadByCampaignId,
    scheduleByAd,
    leadByAd,
    scheduleByAdId,
    leadByAdId,
  ] = await Promise.all([
    readDimensionAcrossDaysToTotals(env, stats.days, 'campaign_schedule'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'campaign_lead'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'campaign_id_schedule'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'campaign_id_lead'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'ad_schedule'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'ad_lead'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'ad_id_schedule'),
    readDimensionAcrossDaysToTotals(env, stats.days, 'ad_id_lead'),
  ]);

  const campaignLeadNames = normalizedCounterMap(leadByCampaign);
  const campaignScheduleNames = normalizedCounterMap(scheduleByCampaign);
  const adLeadNames = normalizedCounterMap(leadByAd);
  const adScheduleNames = normalizedCounterMap(scheduleByAd);

  const campaignByKey = new Map();
  const consumedCampaignNameKeys = new Set();
  for (const row of campaignInsights.rows) {
    if (!row.campaign_name) continue;
    const key = row.campaign_id || `name:${normalizeAttributionKey(row.campaign_name)}`;
    const existing = campaignByKey.get(key) || {
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
    campaignByKey.set(key, existing);
    consumedCampaignNameKeys.add(normalizeAttributionKey(row.campaign_name));
  }

  for (const id of new Set([...Object.keys(leadByCampaignId), ...Object.keys(scheduleByCampaignId)])) {
    if (!campaignByKey.has(id)) {
      campaignByKey.set(id, {
        campaign_id: id,
        name: `campaign_id:${id}`,
        spend: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
        ctr: 0,
        cpm: 0,
        frequency: 0,
      });
    }
  }
  for (const name of new Set([...Object.keys(leadByCampaign), ...Object.keys(scheduleByCampaign)])) {
    const normalized = normalizeAttributionKey(name);
    if (!consumedCampaignNameKeys.has(normalized) && !campaignByKey.has(`name:${normalized}`)) {
      campaignByKey.set(`name:${normalized}`, {
        name,
        spend: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
        ctr: 0,
        cpm: 0,
        frequency: 0,
      });
    }
  }

  const byCampaign = [...campaignByKey.values()].map((row) => {
    const leadMatch = counterByIdOrName(row.campaign_id, row.name, leadByCampaignId, campaignLeadNames);
    const scheduleMatch = counterByIdOrName(
      row.campaign_id,
      row.name,
      scheduleByCampaignId,
      campaignScheduleNames,
    );
    const leads = leadMatch.value;
    const schedules = scheduleMatch.value;
    return {
      ...row,
      leads,
      schedules,
      attribution_status: attributionStatus(row.campaign_id, leadMatch.mode, scheduleMatch.mode),
      cpl: leads > 0 ? row.spend / leads : null,
      cps: schedules > 0 ? row.spend / schedules : null,
    };
  });

  byCampaign.sort((a, b) => b.spend - a.spend);

  const adByKey = new Map();
  const consumedAdNameKeys = new Set();
  for (const row of adInsights.rows) {
    const key = row.ad_id || (row.ad_name ? `name:${normalizeAttributionKey(row.ad_name)}` : '');
    if (!key) continue;
    const existing = adByKey.get(key) || {
      ad_id: row.ad_id,
      ad_name: row.ad_name || row.ad_id,
      campaign_name: row.campaign_name,
      campaign_id: row.campaign_id,
      adset_id: row.adset_id,
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
    adByKey.set(key, existing);
    if (row.ad_name) consumedAdNameKeys.add(normalizeAttributionKey(row.ad_name));
  }

  for (const id of new Set([...Object.keys(leadByAdId), ...Object.keys(scheduleByAdId)])) {
    if (!adByKey.has(id)) {
      adByKey.set(id, {
        ad_id: id,
        ad_name: `ad_id:${id}`,
        spend: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
        ctr: 0,
        cpm: 0,
        frequency: 0,
      });
    }
  }
  for (const name of new Set([...Object.keys(leadByAd), ...Object.keys(scheduleByAd)])) {
    const normalized = normalizeAttributionKey(name);
    if (!consumedAdNameKeys.has(normalized) && !adByKey.has(`name:${normalized}`)) {
      adByKey.set(`name:${normalized}`, {
        ad_name: name,
        spend: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
        ctr: 0,
        cpm: 0,
        frequency: 0,
      });
    }
  }

  const byAd = [...adByKey.values()].map((row) => {
    const leadMatch = counterByIdOrName(row.ad_id, row.ad_name, leadByAdId, adLeadNames);
    const scheduleMatch = counterByIdOrName(row.ad_id, row.ad_name, scheduleByAdId, adScheduleNames);
    const leads = leadMatch.value;
    const schedules = scheduleMatch.value;
    return {
      ...row,
      leads,
      schedules,
      attribution_status: attributionStatus(row.ad_id, leadMatch.mode, scheduleMatch.mode),
      cpl: leads > 0 ? row.spend / leads : null,
      cps: schedules > 0 ? row.spend / schedules : null,
    };
  });
  byAd.sort((a, b) => b.spend - a.spend);

  const totalSpend = byCampaign.reduce((acc, row) => acc + row.spend, 0);
  const totalSchedules = eventCount(totals, 'Schedule');
  const totalLeads = eventCount(totals, 'Lead');
  const recentEvents = await readRecentEvents(env, 25);

  const health = {
    ...buildHealth(totals),
  };
  health.campaignsMissingUtm = Math.max(health.missingCampaignId || 0, health.missingAdId || 0);

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
      uniqueVisitors: totals.audience.unique_visitors || 0,
      uniqueSessions: totals.audience.unique_sessions || 0,
      returningVisitors: totals.visitorType.returning || 0,
      newVisitors: totals.visitorType.new || 0,
      engagedVisits: totals.engagement['15s_plus'] || 0,
      deepScrolls: totals.scrollDepth['90_'] || totals.scrollDepth['90%'] || 0,
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
    breakdowns: {
      placement: breakdownRows(totals.placement),
      siteSource: breakdownRows(totals.siteSource),
      device: breakdownRows(totals.device),
      visitorType: breakdownRows(totals.visitorType),
      network: breakdownRows(totals.network),
      country: breakdownRows(totals.country),
      region: breakdownRows(totals.region),
      trafficCategory: breakdownRows(totals.trafficCategory),
      referrerDomain: breakdownRows(totals.referrerDomain),
      landingPage: breakdownRows(totals.landingPage),
      pagePath: breakdownRows(totals.pagePath),
      browser: breakdownRows(totals.browser),
      os: breakdownRows(totals.os),
      viewport: breakdownRows(totals.viewport),
      orientation: breakdownRows(totals.orientation),
      touch: breakdownRows(totals.touch),
      connection: breakdownRows(totals.connection),
      timezone: breakdownRows(totals.timezone),
      language: breakdownRows(totals.language),
      networkOrg: breakdownRows(totals.networkOrg),
      edge: breakdownRows(totals.edge),
      intent: breakdownRows(totals.intent),
      engagement: breakdownRows(totals.engagement),
      scrollDepth: breakdownRows(totals.scrollDepth),
      weekday: weekdayRows(totals.weekday),
      hour: hourRows(totals.hour, totals.hourLead, totals.hourSchedule),
    },
    recentEvents,
    health,
    setup: buildSetup(env),
    rawCampaignByDay,
  };
}

function normalizeAttributionKey(value) {
  if (!value) return '';
  let decoded = String(value);
  try {
    decoded = decodeURIComponent(decoded.replace(/\+/g, ' '));
  } catch {
    decoded = decoded.replace(/\+/g, ' ');
  }
  return decoded
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9._:\-+]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function normalizedCounterMap(raw) {
  const out = new Map();
  for (const [key, value] of Object.entries(raw || {})) {
    const normalized = normalizeAttributionKey(key);
    if (!normalized) continue;
    out.set(normalized, (out.get(normalized) || 0) + value);
  }
  return out;
}

function counterByIdOrName(id, name, idTotals, normalizedNameTotals) {
  if (id && idTotals?.[id]) return { value: idTotals[id], mode: 'id' };
  const normalized = normalizeAttributionKey(name);
  if (normalized && normalizedNameTotals?.has(normalized)) {
    return { value: normalizedNameTotals.get(normalized), mode: 'name' };
  }
  return { value: 0, mode: id ? 'id_ready' : 'missing' };
}

function attributionStatus(id, leadMode, scheduleMode) {
  if (leadMode === 'id' || scheduleMode === 'id') return 'id_match';
  if (leadMode === 'name' || scheduleMode === 'name') return 'name_fallback';
  if (id) return 'id_ready';
  return 'missing_ids';
}

function breakdownRows(map) {
  const entries = Object.entries(map || {}).filter(([, value]) => value > 0);
  const total = entries.reduce((acc, [, value]) => acc + value, 0);
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value,
      share: total > 0 ? value / total : 0,
    }));
}

function hourRows(pageViews = {}, leads = {}, schedules = {}) {
  return Array.from({ length: 24 }, (_, index) => {
    const hour = String(index).padStart(2, '0');
    return {
      hour,
      label: hourLabel(hour),
      pageViews: pageViews[hour] || 0,
      leads: leads[hour] || 0,
      schedules: schedules[hour] || 0,
    };
  });
}

function hourLabel(hour) {
  const n = Number(hour);
  if (n === 0) return '12a';
  if (n < 12) return `${n}a`;
  if (n === 12) return '12p';
  return `${n - 12}p`;
}

function weekdayRows(map = {}) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const total = Object.values(map).reduce((acc, value) => acc + value, 0);
  return names.map((name, index) => ({
    name,
    value: map[String(index)] || 0,
    share: total > 0 ? (map[String(index)] || 0) / total : 0,
  }));
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

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
