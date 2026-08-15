const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Lead',
  'Schedule',
  'CompleteRegistration',
  'Purchase',
  'Contact',
  'AddPaymentInfo',
  'Subscribe',
]);

const ALLOWED_CUSTOM_EVENTS = new Set([
  'ApplicationOpened',
  'ChatOpened',
  'EngagedVisit',
  'ScrollDepth',
  'ReferralCodeCopied',
  'OutboundClick',
]);

const VID_PATTERN = /^v_[a-z0-9]{12,40}$/i;
const FBP_PATTERN = /^fb\.\d+\.\d+\.\d+$/;
const FBC_PATTERN = /^fb\.\d+\.\d+\.[A-Za-z0-9_.-]+$/;
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/;
const ADVANCED_MATCHING_KEYS = ['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp', 'country'];
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/;

export function isAllowedEvent(name) {
  return typeof name === 'string' && (ALLOWED_EVENTS.has(name) || ALLOWED_CUSTOM_EVENTS.has(name));
}

export function isCustomEvent(name) {
  return ALLOWED_CUSTOM_EVENTS.has(name);
}

// High-value conversion events that the public website NEVER sends through the
// open /capi/track endpoint. `Lead` and `Schedule` arrive only from verified
// backend paths plus the single-use thank-you pixel gate. Refusing them here
// means a scripted POST to /capi/track can't inject the conversions that steer
// ad delivery toward junk audiences.
const INJECTION_PROTECTED_EVENTS = new Set([
  'Lead',
  'Schedule',
  'Purchase',
  'CompleteRegistration',
  'Subscribe',
  'AddPaymentInfo',
  'Contact',
]);

export function isInjectionProtectedEvent(name) {
  return INJECTION_PROTECTED_EVENTS.has(name);
}

export function isValidVid(value) {
  return typeof value === 'string' && VID_PATTERN.test(value);
}

export function isValidFbp(value) {
  return typeof value === 'string' && FBP_PATTERN.test(value);
}

export function isValidFbc(value) {
  return typeof value === 'string' && value.length <= 1200 && FBC_PATTERN.test(value);
}

export function isValidEventId(value) {
  return typeof value === 'string' && EVENT_ID_PATTERN.test(value);
}

export function clean(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function normalizePostalCode(raw, country = '') {
  if (typeof raw !== 'string') return '';
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10);
  if (!normalized) return '';

  const isUs = typeof country === 'string' && country.trim().toLowerCase() === 'us';
  if (isUs) return /^\d{5}/.test(normalized) ? normalized.slice(0, 5) : '';
  if (/^\d{5}(\d{4})?$/.test(normalized)) return normalized.slice(0, 5);
  return normalized;
}

export function normalizeCityForMeta(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 64);
}

export function normalizeStateForMeta({ region, regionCode } = {}) {
  const code = typeof regionCode === 'string' ? regionCode.trim() : '';
  if (/^[a-z]{2}$/i.test(code)) return code.toLowerCase();
  return normalizeCityForMeta(region);
}

export function sanitizeAdvancedMatching(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const key of ADVANCED_MATCHING_KEYS) {
    const value = raw[key];
    if (typeof value === 'string' && SHA256_HEX_PATTERN.test(value)) out[key] = value;
  }
  return out;
}

export function cleanFbclid(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length > 1000 || /\s/.test(trimmed)) return '';
  return trimmed;
}

export function buildFbc(fbclid, timestampSeconds) {
  const clickId = cleanFbclid(fbclid);
  if (!clickId) return '';
  const timestamp = Number(timestampSeconds);
  const timestampMs = Number.isSafeInteger(timestamp) && timestamp > 0
    ? timestamp * 1000
    : Date.now();
  return `fb.1.${timestampMs}.${clickId}`;
}

export function cleanUtms(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const keys = [
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
  const out = {};
  for (const key of keys) {
    const value = clean(raw[key], 180);
    if (value) out[key] = value;
  }
  return out;
}
