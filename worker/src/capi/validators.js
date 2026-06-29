const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Lead',
  'InitiateCheckout',
  'Schedule',
  'CompleteRegistration',
  'Purchase',
  'Contact',
  'AddPaymentInfo',
  'Subscribe',
]);

const ALLOWED_CUSTOM_EVENTS = new Set([
  'AppDownload',
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
  return typeof value === 'string' && FBC_PATTERN.test(value);
}

export function isValidEventId(value) {
  return typeof value === 'string' && EVENT_ID_PATTERN.test(value);
}

export function clean(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
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
