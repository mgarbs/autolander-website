const VID_COOKIE = 'al_vid';
const ATTR_COOKIE = 'al_attr';
const SESSION_KEY = 'al_session';
const VID_TTL_SECONDS = 365 * 24 * 60 * 60;
const ATTR_TTL_SECONDS = 90 * 24 * 60 * 60;
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

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

function readCookie(name) {
  if (!isBrowser) return '';
  const pattern = new RegExp(`(?:^|;\\s*)${escapeRegex(name)}=([^;]*)`);
  const match = document.cookie.match(pattern);
  return match ? decodeURIComponent(match[1]) : '';
}

function writeCookie(name, value, ttlSeconds) {
  if (!isBrowser) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const expires = new Date(Date.now() + ttlSeconds * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${ttlSeconds}; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function randomBase32(length) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function getVisitorId() {
  if (!isBrowser) return '';
  const existing = readCookie(VID_COOKIE);
  if (existing && /^v_[a-z0-9]{12,40}$/i.test(existing)) return existing;
  const id = `v_${randomBase32(22)}`;
  writeCookie(VID_COOKIE, id, VID_TTL_SECONDS);
  return id;
}

function cleanParam(value, max = 180) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

export function getSessionId() {
  if (!isBrowser) return '';
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && /^s_[a-z0-9]{12,40}$/i.test(existing)) return existing;
    const id = `s_${randomBase32(18)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return '';
  }
}

function readAttributionFromUrl() {
  if (!isBrowser) return {};
  const params = new URLSearchParams(window.location.search);
  const out = {};
  for (const key of ATTR_KEYS) {
    const value = cleanParam(params.get(key));
    if (value) out[key] = value;
  }
  return out;
}

function readFbclidFromUrl() {
  if (!isBrowser) return '';
  return new URLSearchParams(window.location.search).get('fbclid') || '';
}

function safeUrl(value) {
  try {
    return value ? new URL(value, window.location.href) : null;
  } catch {
    return null;
  }
}

function cleanPath(value) {
  const url = safeUrl(value);
  if (!url) return '';
  return `${url.pathname || '/'}${url.search ? '?...' : ''}`.slice(0, 160);
}

function domainFromUrl(value) {
  const url = safeUrl(value);
  if (!url) return '';
  return url.hostname.replace(/^www\./i, '').slice(0, 120);
}

export function getFirstTouch() {
  if (!isBrowser) return null;

  const stored = readCookie(ATTR_COOKIE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* fall through and rewrite */
    }
  }

  const utms = readAttributionFromUrl();
  const fbclid = readFbclidFromUrl();
  if (!fbclid && Object.keys(utms).length === 0) return null;

  const attr = {
    fbclid: fbclid || '',
    ...utms,
    landing_page: window.location.href.slice(0, 500),
    landing_path: cleanPath(window.location.href),
    referrer: (document.referrer || '').slice(0, 240),
    referrer_domain: domainFromUrl(document.referrer),
    ts: Math.floor(Date.now() / 1000),
  };

  writeCookie(ATTR_COOKIE, JSON.stringify(attr), ATTR_TTL_SECONDS);
  return attr;
}

export function getFbCookies() {
  if (!isBrowser) return { fbp: '', fbc: '' };
  const fbp = readCookie('_fbp');
  let fbc = readCookie('_fbc');
  if (!fbc) {
    const fbclid = readFbclidFromUrl();
    if (fbclid) {
      fbc = `fb.1.${Date.now()}.${fbclid}`;
      writeCookie('_fbc', fbc, ATTR_TTL_SECONDS);
    }
  }
  return { fbp, fbc };
}

export function getCurrentUtms() {
  const fromUrl = readAttributionFromUrl();
  if (Object.keys(fromUrl).length > 0) return fromUrl;
  const firstTouch = getFirstTouch();
  if (!firstTouch) return {};
  const out = {};
  for (const key of ATTR_KEYS) {
    if (firstTouch[key]) out[key] = firstTouch[key];
  }
  return out;
}

function getDeviceContext() {
  if (!isBrowser) return {};
  const width = window.innerWidth || document.documentElement?.clientWidth || 0;
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  const ua = navigator.userAgent || '';
  const device = width < 768 || /Mobi|Android|iPhone|iPod/i.test(ua) ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  const now = new Date();
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  return {
    device,
    screen: `${window.screen?.width || width}x${window.screen?.height || 0}`,
    viewport: `${width}x${height}`,
    pixel_ratio: String(window.devicePixelRatio || 1).slice(0, 8),
    color_depth: String(window.screen?.colorDepth || ''),
    orientation: width >= height ? 'landscape' : 'portrait',
    touch: navigator.maxTouchPoints > 0 ? 'touch' : 'no_touch',
    hardware_concurrency: String(navigator.hardwareConcurrency || ''),
    device_memory: String(navigator.deviceMemory || ''),
    platform: (navigator.platform || '').slice(0, 80),
    connection_type: (connection.effectiveType || connection.type || '').slice(0, 40),
    save_data: connection.saveData ? 'save_data' : '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    language: navigator.language || '',
    local_hour: String(now.getHours()).padStart(2, '0'),
    local_weekday: String(now.getDay()),
  };
}

export function getAttributionPayload() {
  const firstTouch = getFirstTouch() || {};
  const utms = getCurrentUtms();
  const { fbp, fbc } = getFbCookies();
  const fbclid = readFbclidFromUrl() || firstTouch.fbclid || '';
  const currentUrl = isBrowser ? window.location.href : '';
  const referrer = isBrowser ? (document.referrer || firstTouch.referrer || '') : '';
  return {
    vid: getVisitorId(),
    sid: getSessionId(),
    fbp,
    fbc,
    fbclid,
    utms,
    firstTouch,
    page: {
      landing_page: firstTouch.landing_page || '',
      landing_path: firstTouch.landing_path || cleanPath(firstTouch.landing_page || currentUrl),
      current_page: currentUrl.slice(0, 500),
      current_path: cleanPath(currentUrl),
      referrer: referrer.slice(0, 240),
      referrer_domain: firstTouch.referrer_domain || domainFromUrl(referrer),
      title: isBrowser ? document.title.slice(0, 160) : '',
    },
    device: getDeviceContext(),
  };
}
