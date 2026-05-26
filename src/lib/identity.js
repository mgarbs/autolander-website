const VID_COOKIE = 'al_vid';
const ATTR_COOKIE = 'al_attr';
const VID_TTL_SECONDS = 365 * 24 * 60 * 60;
const ATTR_TTL_SECONDS = 90 * 24 * 60 * 60;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

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

function readUtmsFromUrl() {
  if (!isBrowser) return {};
  const params = new URLSearchParams(window.location.search);
  const out = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 120);
  }
  return out;
}

function readFbclidFromUrl() {
  if (!isBrowser) return '';
  return new URLSearchParams(window.location.search).get('fbclid') || '';
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

  const utms = readUtmsFromUrl();
  const fbclid = readFbclidFromUrl();
  if (!fbclid && Object.keys(utms).length === 0) return null;

  const attr = {
    fbclid: fbclid || '',
    ...utms,
    referrer: (document.referrer || '').slice(0, 240),
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
  const fromUrl = readUtmsFromUrl();
  if (Object.keys(fromUrl).length > 0) return fromUrl;
  const firstTouch = getFirstTouch();
  if (!firstTouch) return {};
  const out = {};
  for (const key of UTM_KEYS) {
    if (firstTouch[key]) out[key] = firstTouch[key];
  }
  return out;
}

export function getAttributionPayload() {
  const firstTouch = getFirstTouch() || {};
  const utms = getCurrentUtms();
  const { fbp, fbc } = getFbCookies();
  const fbclid = readFbclidFromUrl() || firstTouch.fbclid || '';
  return {
    vid: getVisitorId(),
    fbp,
    fbc,
    fbclid,
    utms,
  };
}
