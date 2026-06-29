import { ACTION_SOURCE, buildEvent, sendEvents } from './meta-client.js';
import { hashEmail, hashLowercase, hashName, hashPhone, sha256Hex } from './hash.js';
import {
  bumpCounter,
  consumeConversionToken,
  lookupVisitor,
  markEventSeen,
  pushRecentEvent,
  rememberDailySeen,
  rememberVisitor,
  wasEventSeen,
} from './storage.js';
import {
  clean,
  cleanUtms,
  isAllowedEvent,
  isCustomEvent,
  isInjectionProtectedEvent,
  isValidEventId,
  isValidFbc,
  isValidFbp,
  isValidVid,
} from './validators.js';
import { looksLikeBot } from '../security/bot-filter.js';

const TRACK_DAILY_IP_LIMIT = 240;
const TRACK_HOURLY_IP_LIMIT = 30;
const TRACK_DAILY_GLOBAL_LIMIT = 50000;

const AL_VID_PREFIX = 'al_vid:';

const KNOWN_PAID_SOURCES = new Set(['meta', 'facebook', 'fb', 'instagram', 'ig']);
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
const META_SOURCE_ALIASES = new Set(['meta', 'facebook', 'fb', 'instagram', 'ig', 'an', 'msg', 'messenger']);

function isAttributableTraffic(utms, fbclid) {
  if (fbclid) return true;
  const source = (utms?.utm_source || '').toLowerCase();
  const siteSource = (utms?.site_source_name || '').toLowerCase();
  return KNOWN_PAID_SOURCES.has(source) || META_SOURCE_ALIASES.has(siteSource);
}

function isMetaTraffic(utms, fbclid) {
  return isAttributableTraffic(utms, fbclid);
}

function enrichUtms(raw) {
  const out = { ...(raw || {}) };
  if (!out.campaign_id && out.utm_id) out.campaign_id = out.utm_id;
  if (!out.campaign_name && out.utm_campaign) out.campaign_name = out.utm_campaign;
  if (!out.ad_name && out.utm_content) out.ad_name = out.utm_content;
  if (!out.adset_name && out.utm_term) out.adset_name = out.utm_term;
  return out;
}

function hasUnresolvedMacro(value) {
  return typeof value === 'string' && (/{{[^}]+}}/.test(value) || /__[a-z0-9_.-]+__/i.test(value));
}

function hasAnyUnresolvedMacro(utms) {
  return ATTR_KEYS.some((key) => hasUnresolvedMacro(utms?.[key]));
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

function sanitizeDevice(raw, ua = '') {
  const device = clean(raw?.device, 24).toLowerCase();
  const fallback = /Mobi|Android|iPhone|iPod/i.test(ua) ? 'mobile' : 'desktop';
  const localHour = clean(raw?.local_hour, 2);
  const localWeekday = clean(raw?.local_weekday, 1);
  return {
    device: ['mobile', 'desktop', 'tablet'].includes(device) ? device : fallback,
    screen: clean(raw?.screen, 32),
    viewport: clean(raw?.viewport, 32),
    pixel_ratio: clean(raw?.pixel_ratio, 8),
    color_depth: clean(raw?.color_depth, 8),
    orientation: clean(raw?.orientation, 16),
    touch: clean(raw?.touch, 16),
    hardware_concurrency: clean(raw?.hardware_concurrency, 8),
    device_memory: clean(raw?.device_memory, 8),
    platform: clean(raw?.platform, 80),
    connection_type: clean(raw?.connection_type, 40).toLowerCase(),
    save_data: clean(raw?.save_data, 20),
    timezone: clean(raw?.timezone, 80),
    language: clean(raw?.language, 32),
    local_hour: /^(?:[01]\d|2[0-3])$/.test(localHour) ? localHour : '',
    local_weekday: /^[0-6]$/.test(localWeekday) ? localWeekday : '',
  };
}

function parseClient(ua = '') {
  const browser =
    /Edg\//i.test(ua) ? 'Edge'
      : /Chrome\//i.test(ua) && !/Chromium/i.test(ua) ? 'Chrome'
        : /Safari\//i.test(ua) && !/Chrome\//i.test(ua) ? 'Safari'
          : /Firefox\//i.test(ua) ? 'Firefox'
            : /Instagram/i.test(ua) ? 'Instagram in-app'
              : /FBAN|FBAV/i.test(ua) ? 'Facebook in-app'
                : 'Other';
  const os =
    /Windows NT/i.test(ua) ? 'Windows'
      : /Android/i.test(ua) ? 'Android'
        : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
          : /Mac OS X/i.test(ua) ? 'macOS'
            : /Linux/i.test(ua) ? 'Linux'
              : 'Other';
  return { browser, os };
}

function domainFromUrl(value) {
  try {
    return value ? new URL(value).hostname.replace(/^www\./i, '').toLowerCase().slice(0, 120) : '';
  } catch {
    return '';
  }
}

function sourceCategory({ utms, fbclid, page }) {
  const source = (utms?.utm_source || '').toLowerCase();
  const medium = (utms?.utm_medium || '').toLowerCase();
  const referrer = (page?.referrer_domain || domainFromUrl(page?.referrer) || '').toLowerCase();
  if (fbclid || ['meta', 'facebook', 'fb', 'instagram', 'ig'].includes(source)) return 'paid_meta';
  if (medium.includes('cpc') || medium.includes('paid') || medium.includes('ppc')) return 'paid_other';
  if (source) return `utm:${source}`.slice(0, 80);
  if (!referrer) return 'direct';
  if (/google\.|bing\.|yahoo\.|duckduckgo\.|search\.brave\./i.test(referrer)) return 'organic_search';
  if (/facebook\.|instagram\.|l\.facebook\.|t\.co|linkedin\.|youtube\.|tiktok\./i.test(referrer)) return 'organic_social';
  return 'referral';
}

function trafficIntent({ eventName, page }) {
  if (eventName === 'Schedule') return 'booked_demo';
  if (eventName === 'Lead') return 'lead';
  if (eventName === 'InitiateCheckout') return 'trial_or_checkout';
  const path = (page?.current_path || page?.landing_path || '').toLowerCase();
  if (path.includes('thank-you')) return 'converted';
  if (path.includes('pricing')) return 'pricing_research';
  if (path.includes('ref/')) return 'referral_signup';
  return 'research';
}

function viewportBucket(value) {
  const match = String(value || '').match(/^(\d{2,5})x(\d{2,5})$/);
  if (!match) return '';
  const width = Number(match[1]);
  if (width < 390) return 'small_mobile';
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  return 'large_desktop';
}

function utmsForCustomData(utms) {
  const out = {};
  for (const key of ATTR_KEYS) {
    if (utms?.[key]) out[key] = utms[key];
  }
  return out;
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
        hasGhlLeadRouting: Boolean(
          (env.GHL_PRIVATE_INTEGRATION_TOKEN || env.GHL_API_TOKEN || env.HIGHLEVEL_API_TOKEN)
            && env.GHL_LOCATION_ID
            && env.GHL_WORKFLOW_ID,
        ),
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
    if (env.ENABLE_LEGACY_CALENDLY_WEBHOOK !== 'true') {
      return jsonResponse({ ok: true, ignored: 'legacy_calendly_disabled' }, 200, corsHeaders);
    }
    return handleCalendly(request, env, corsHeaders, ctx);
  }

  if (url.pathname === '/capi/confirm' && request.method === 'POST') {
    return handleConfirm(request, env, corsHeaders);
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

  // This endpoint is intentionally open (no auth) so the site can report soft
  // signals (PageView, ViewContent, InitiateCheckout, engagement). The
  // high-value conversions the ad campaign optimizes on must NOT be injectable
  // here. Lead/Schedule come only from verified backend paths plus the
  // single-use thank-you pixel gate. Refuse them outright.
  if (isInjectionProtectedEvent(eventName)) {
    return jsonResponse({ ok: false, reason: 'event_not_allowed_here' }, 403, corsHeaders);
  }

  // Real browser traffic always carries an Origin on this cross-site POST. The
  // global gate only validates Origin when it is present, so a scripted client
  // that simply omits the header would otherwise sail through — require it here.
  if (!request.headers.get('Origin')) {
    return jsonResponse({ ok: false, reason: 'origin_required' }, 403, corsHeaders);
  }

  if (looksLikeBot(request).bot) {
    return jsonResponse({ ok: false, reason: 'blocked' }, 403, corsHeaders);
  }

  const eventId = clean(body.eventId, 128);
  if (!isValidEventId(eventId)) {
    return jsonResponse({ ok: false, reason: 'invalid_event_id' }, 400, corsHeaders);
  }

  const vid = isValidVid(body.vid) ? body.vid : '';
  const sid = clean(body.sid, 64);
  const fbp = isValidFbp(body.fbp) ? body.fbp : '';
  const fbc = isValidFbc(body.fbc) ? body.fbc : '';
  const fbclid = clean(body.fbclid, 256);
  const utms = enrichUtms(cleanUtms(body.utms));
  const sourceUrl = clean(body.sourceUrl, 500);
  const eventTime = Number(body.eventTime) || Math.floor(Date.now() / 1000);
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const country = clean(request.cf?.country, 4).toLowerCase();
  const region = clean(request.cf?.region, 48).toLowerCase();
  const city = clean(request.cf?.city, 48).toLowerCase();
  const colo = clean(request.cf?.colo, 16).toUpperCase();
  const asn = clean(String(request.cf?.asn || ''), 24);
  const asOrganization = clean(request.cf?.asOrganization, 120);
  const page = sanitizePage(body.page);
  const device = sanitizeDevice(body.device, ua);
  const client = parseClient(ua);
  const keys = attributionKeys(utms);
  const category = sourceCategory({ utms, fbclid, page });
  const intent = trafficIntent({ eventName, page });

  const today = isoDay(new Date());

  const visitorMemory = vid
    ? await rememberVisitor(env, vid, {
      fbp,
      fbc,
      sid,
      fbclid,
      utms,
      firstTouch: body.firstTouch && typeof body.firstTouch === 'object' ? enrichUtms(cleanUtms(body.firstTouch)) : {},
      page,
      device,
      ip,
      ua,
      country,
      region,
      city,
      colo,
      asn,
      asOrganization,
    })
    : { isNew: false, existing: null };

  const alreadySeen = await wasEventSeen(env, eventId);
  if (!alreadySeen) {
    await markEventSeen(env, eventId);
    const attributable = isAttributableTraffic(utms, fbclid);
    const metaTraffic = isMetaTraffic(utms, fbclid);
    const isVisitEvent = eventName === 'PageView';
    const hour = device.local_hour || new Date(eventTime * 1000).getUTCHours().toString().padStart(2, '0');
    const weekday = device.local_weekday || String(new Date(eventTime * 1000).getUTCDay());
    const visitorType = visitorMemory.isNew ? 'new' : 'returning';
    const networkHash = ip ? await sha256Hex(`ip:${ip}`) : '';
    const networkSeenToday =
      isVisitEvent && networkHash ? await rememberDailySeen(env, today, 'network', networkHash.slice(0, 32)) : false;
    const visitorSeenToday =
      isVisitEvent && vid ? await rememberDailySeen(env, today, 'visitor', vid) : false;
    const sessionSeenToday =
      isVisitEvent && sid ? await rememberDailySeen(env, today, 'session', sid) : false;
    await Promise.all([
      bumpCounter(env, today, 'event', eventName),
      bumpCounter(env, today, 'event', `${eventName}:browser`),
      isVisitEvent && visitorSeenToday ? bumpCounter(env, today, 'audience', 'unique_visitors') : null,
      isVisitEvent && sessionSeenToday ? bumpCounter(env, today, 'audience', 'unique_sessions') : null,
      isVisitEvent ? bumpCounter(env, today, 'visitor_type', visitorType) : null,
      isVisitEvent && networkHash ? bumpCounter(env, today, 'network', networkSeenToday ? 'new_network' : 'repeat_network') : null,
      isVisitEvent && asOrganization ? bumpCounter(env, today, 'network_org', asOrganization) : null,
      isVisitEvent && colo ? bumpCounter(env, today, 'edge', colo) : null,
      isVisitEvent && country ? bumpCounter(env, today, 'country', country) : null,
      isVisitEvent && region ? bumpCounter(env, today, 'region', `${country || 'unknown'}:${region}`) : null,
      isVisitEvent && hour ? bumpCounter(env, today, 'hour', hour) : null,
      eventName === 'Lead' && hour ? bumpCounter(env, today, 'hour_lead', hour) : null,
      eventName === 'Schedule' && hour ? bumpCounter(env, today, 'hour_schedule', hour) : null,
      isVisitEvent && weekday ? bumpCounter(env, today, 'weekday', weekday) : null,
      isVisitEvent && category ? bumpCounter(env, today, 'traffic_category', category) : null,
      isVisitEvent && intent ? bumpCounter(env, today, 'intent', intent) : null,
      isVisitEvent && page.referrer_domain ? bumpCounter(env, today, 'referrer_domain', page.referrer_domain) : null,
      isVisitEvent && page.landing_path ? bumpCounter(env, today, 'landing_page', page.landing_path) : null,
      isVisitEvent && page.current_path ? bumpCounter(env, today, 'page_path', page.current_path) : null,
      isVisitEvent && client.browser ? bumpCounter(env, today, 'browser', client.browser) : null,
      isVisitEvent && client.os ? bumpCounter(env, today, 'os', client.os) : null,
      isVisitEvent && device.viewport ? bumpCounter(env, today, 'viewport', viewportBucket(device.viewport)) : null,
      isVisitEvent && device.orientation ? bumpCounter(env, today, 'orientation', device.orientation) : null,
      isVisitEvent && device.touch ? bumpCounter(env, today, 'touch', device.touch) : null,
      isVisitEvent && device.connection_type ? bumpCounter(env, today, 'connection', device.connection_type) : null,
      isVisitEvent && device.timezone ? bumpCounter(env, today, 'timezone', device.timezone) : null,
      isVisitEvent && device.language ? bumpCounter(env, today, 'language', device.language.toLowerCase()) : null,
      eventName === 'EngagedVisit' ? bumpCounter(env, today, 'engagement', '15s_plus') : null,
      eventName === 'ScrollDepth' && body.customData?.percent
        ? bumpCounter(env, today, 'scroll_depth', `${Number(body.customData.percent) || 0}%`)
        : null,
      attributable && utms.utm_source ? bumpCounter(env, today, 'source', utms.utm_source) : null,
      attributable && keys.siteSource ? bumpCounter(env, today, 'site_source', keys.siteSource) : null,
      attributable && keys.placement ? bumpCounter(env, today, 'placement', keys.placement) : null,
      attributable && device.device ? bumpCounter(env, today, 'device', device.device) : null,
      attributable && keys.campaignName ? bumpCounter(env, today, 'campaign', keys.campaignName) : null,
      attributable && keys.campaignId ? bumpCounter(env, today, 'campaign_id', keys.campaignId) : null,
      attributable && keys.adName ? bumpCounter(env, today, 'ad', keys.adName) : null,
      attributable && keys.adId ? bumpCounter(env, today, 'ad_id', keys.adId) : null,
      attributable && keys.adsetName ? bumpCounter(env, today, 'adset', keys.adsetName) : null,
      attributable && keys.adsetId ? bumpCounter(env, today, 'adset_id', keys.adsetId) : null,
      attributable && keys.campaignName && eventName === 'Lead'
        ? bumpCounter(env, today, 'campaign_lead', keys.campaignName)
        : null,
      attributable && keys.campaignId && eventName === 'Lead'
        ? bumpCounter(env, today, 'campaign_id_lead', keys.campaignId)
        : null,
      attributable && keys.campaignName && eventName === 'Schedule'
        ? bumpCounter(env, today, 'campaign_schedule', keys.campaignName)
        : null,
      attributable && keys.campaignId && eventName === 'Schedule'
        ? bumpCounter(env, today, 'campaign_id_schedule', keys.campaignId)
        : null,
      attributable && keys.adName && eventName === 'Lead' ? bumpCounter(env, today, 'ad_lead', keys.adName) : null,
      attributable && keys.adId && eventName === 'Lead' ? bumpCounter(env, today, 'ad_id_lead', keys.adId) : null,
      attributable && keys.adName && eventName === 'Schedule' ? bumpCounter(env, today, 'ad_schedule', keys.adName) : null,
      attributable && keys.adId && eventName === 'Schedule' ? bumpCounter(env, today, 'ad_id_schedule', keys.adId) : null,
      metaTraffic && isVisitEvent ? bumpCounter(env, today, 'meta', 'visits') : null,
      metaTraffic && isVisitEvent ? bumpCounter(env, today, 'meta', 'utm_meta_visits') : null,
      fbclid && isVisitEvent ? bumpCounter(env, today, 'meta', 'with_fbclid') : null,
      metaTraffic && isVisitEvent && keys.campaignId ? bumpCounter(env, today, 'meta', 'with_campaign_id') : null,
      metaTraffic && isVisitEvent && keys.adId ? bumpCounter(env, today, 'meta', 'with_ad_id') : null,
      metaTraffic && isVisitEvent && !keys.campaignId ? bumpCounter(env, today, 'meta', 'missing_campaign_id') : null,
      metaTraffic && isVisitEvent && !keys.adId ? bumpCounter(env, today, 'meta', 'missing_ad_id') : null,
      metaTraffic && isVisitEvent && !keys.campaignName ? bumpCounter(env, today, 'meta', 'missing_campaign_name') : null,
      metaTraffic && isVisitEvent && !keys.adName ? bumpCounter(env, today, 'meta', 'missing_ad_name') : null,
      metaTraffic && isVisitEvent && hasAnyUnresolvedMacro(utms) ? bumpCounter(env, today, 'meta', 'unresolved_macros') : null,
    ].filter(Boolean));

    await pushRecentEvent(env, {
      at: new Date().toISOString(),
      event: eventName,
      source: 'browser',
      vid,
      sid,
      campaign_id: keys.campaignId,
      adset_id: keys.adsetId,
      ad_id: keys.adId,
      utm_campaign: keys.campaignName,
      utm_content: keys.adName,
      utm_source: utms.utm_source || '',
      placement: keys.placement,
      site_source_name: keys.siteSource,
      device: device.device,
      browser: client.browser,
      os: client.os,
      traffic_category: category,
      intent,
      landing_path: page.landing_path,
      current_path: page.current_path,
      referrer_domain: page.referrer_domain,
      visitor_type: isVisitEvent ? visitorType : '',
      country,
      region,
      city,
      network_org: asOrganization,
      fbclid: Boolean(fbclid),
      eventId,
    });
  }

  const customData = {
    ...sanitizeCustomData(body.customData),
    ...utmsForCustomData(utms),
  };
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

  const sendPromise = (async () => {
    const result = await sendEvents(env, [capiEvent]);
    if (result.ok) {
      await Promise.all([
        bumpCounter(env, today, 'event', `${eventName}:server`),
        bumpCounter(env, today, 'meta', 'capi_ok'),
      ]);
    } else {
      await bumpCounter(env, today, 'meta', 'capi_failed');
    }
  })();
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
  const utms = enrichUtms({
    utm_source: clean(tracking.utm_source, 120),
    utm_medium: clean(tracking.utm_medium, 120),
    utm_campaign: clean(tracking.utm_campaign, 120),
    utm_content: utmContent.replace(new RegExp(`\\|?${AL_VID_PREFIX}[^|]+`, 'i'), '').replace(/^\|+|\|+$/g, ''),
    utm_term: clean(tracking.utm_term, 120),
    utm_id: clean(tracking.utm_id, 120),
    campaign_id: clean(tracking.campaign_id, 120),
    adset_id: clean(tracking.adset_id, 120),
    ad_id: clean(tracking.ad_id, 120),
    campaign_name: clean(tracking.campaign_name, 180),
    adset_name: clean(tracking.adset_name, 180),
    ad_name: clean(tracking.ad_name, 180),
    placement: clean(tracking.placement, 120),
    site_source_name: clean(tracking.site_source_name, 120),
  });

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
  const mergedUtms = enrichUtms(mergeUtms(visitor?.utms, utms));
  const keys = attributionKeys(mergedUtms);
  const device = sanitizeDevice(visitor?.device, ua);

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
  const hour = device.local_hour || new Date(eventTime * 1000).getUTCHours().toString().padStart(2, '0');
  const counterPromise = Promise.all([
    bumpCounter(env, today, 'event', 'Schedule'),
    bumpCounter(env, today, 'event', 'Schedule:server'),
    hour ? bumpCounter(env, today, 'hour_schedule', hour) : null,
    keys.siteSource ? bumpCounter(env, today, 'site_source', keys.siteSource) : null,
    keys.placement ? bumpCounter(env, today, 'placement', keys.placement) : null,
    device.device ? bumpCounter(env, today, 'device', device.device) : null,
    keys.campaignName ? bumpCounter(env, today, 'campaign_schedule', keys.campaignName) : null,
    keys.campaignId ? bumpCounter(env, today, 'campaign_id_schedule', keys.campaignId) : null,
    keys.adName ? bumpCounter(env, today, 'ad_schedule', keys.adName) : null,
    keys.adId ? bumpCounter(env, today, 'ad_id_schedule', keys.adId) : null,
    pushRecentEvent(env, {
      at: new Date().toISOString(),
      event: 'Schedule',
      source: 'calendly',
      vid,
      campaign_id: keys.campaignId,
      adset_id: keys.adsetId,
      ad_id: keys.adId,
      utm_campaign: keys.campaignName,
      utm_content: keys.adName,
      utm_source: mergedUtms.utm_source || '',
      placement: keys.placement,
      site_source_name: keys.siteSource,
      device: device.device,
      fbclid: Boolean(fbclid),
      eventId,
    }),
  ].filter(Boolean));

  const sendPromise = (async () => {
    await counterPromise;
    const result = await sendEvents(env, [capiEvent]);
    await bumpCounter(env, today, 'meta', result.ok ? 'capi_ok' : 'capi_failed');
  })();

  if (ctx?.waitUntil) ctx.waitUntil(sendPromise);
  else await sendPromise;

  return jsonResponse({ ok: true }, 200, corsHeaders);
}

// Redeem the single-use conversion token minted by a verified backend flow.
// Returns ok:true only the first time a genuine, unexpired token is presented.
// No token, a reused token, or an expired token => no conversion.
async function handleConfirm(request, env, corsHeaders) {
  if (looksLikeBot(request).bot) {
    return jsonResponse({ ok: false, reason: 'blocked' }, 403, corsHeaders);
  }
  // Real applicant traffic reaches this cross-site POST from the thank-you page with
  // an Origin header (a CORS JSON POST always sends one). Require it — mirroring
  // /capi/track — so a leaked single-use bt token can't be redeemed from a
  // non-browser context. The global gate (index.js) validates the Origin value
  // when present; here we just refuse a missing one.
  if (!request.headers.get('Origin')) {
    return jsonResponse({ ok: false, reason: 'origin_required' }, 403, corsHeaders);
  }
  const body = await safeJson(request);
  const token = clean(body.bt, 64);
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return jsonResponse({ ok: false, reason: 'invalid_token' }, 400, corsHeaders);
  }
  const redeemed = await consumeConversionToken(env, token);
  if (!redeemed) {
    return jsonResponse({ ok: false, reason: 'unrecognized_token' }, 403, corsHeaders);
  }
  return jsonResponse(
    { ok: true, eventId: redeemed.eventId || '', eventName: redeemed.eventName || 'Lead' },
    200,
    corsHeaders,
  );
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
  for (const key of ATTR_KEYS) {
    const value = clean(last?.[key], 180) || clean(first?.[key], 180);
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
