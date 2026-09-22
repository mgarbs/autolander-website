// Starter 3-day trial helpers for the /pay surface (design doc §3).
// Pure functions — no DOM, no fetch — so the CRM-URL entry, the form
// validation and the API error mapping are unit-testable without React.

export const TRIAL_QUERY_PARAM = 'trial';
export const TRIAL_QUERY_VALUE = 'starter3d';
export const TRIAL_CODE = 'starter_3d_v1';
export const TRIAL_PLAN_CODE = 'STARTER';
export const TRIAL_INTERVAL = 'monthly';
export const TRIAL_DAYS = 3;
export const TRIAL_POSTS_PER_DAY = 5;
export const TRIAL_MONTHLY_LABEL = '$39';

export const TRIAL_TERMS =
  `${TRIAL_DAYS}-day free trial of Starter · ${TRIAL_POSTS_PER_DAY} posts a day · card required · $0 today · `
  + `then ${TRIAL_MONTHLY_LABEL}/month (plus any applicable tax) unless you cancel.`;

export const SUPPORT_TEXT_NUMBER = '(919) 280-0967';
export const SUPPORT_TEXT_HREF = 'sms:+19192800967';

// `/pay/?trial=starter3d` (no token) → 'starter_3d_v1'; anything else → ''.
// `utm_*` / `fbclid` on the same URL are untouched here — the attribution
// snapshot (lib/attribution.js → src/lib/identity.js) reads them itself.
export function trialCodeFromSearch(search) {
  let params;
  try {
    params = new URLSearchParams(typeof search === 'string' ? search : '');
  } catch {
    return '';
  }
  const value = String(params.get(TRIAL_QUERY_PARAM) || '').trim().toLowerCase();
  return value === TRIAL_QUERY_VALUE ? TRIAL_CODE : '';
}

const MAX_TEXT = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max = MAX_TEXT) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, max);
}

// "Jamie Buyer" → { firstName: 'Jamie', lastName: 'Buyer' }; the split is on
// the FIRST space so "Mary Ann Smith" keeps "Ann Smith" as the last name (the
// cloud stores both verbatim on crmSnapshot; nothing downstream needs a
// perfect split). A single token becomes firstName with an empty lastName.
export function splitFullName(fullName) {
  const name = clean(fullName);
  if (!name) return { firstName: '', lastName: '' };
  const space = name.indexOf(' ');
  if (space === -1) return { firstName: name, lastName: '' };
  return { firstName: name.slice(0, space), lastName: name.slice(space + 1).trim() };
}

export function normalizeEmail(value) {
  return clean(value, 254).toLowerCase();
}

// Keeps a leading "+" and digits only — the cloud sanitizes again, this is
// just enough to reject "call me" style input before we hit the API.
export function normalizePhone(value) {
  const raw = clean(value, 40);
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  return raw.startsWith('+') ? `+${digits}` : digits;
}

// Basic client validation for the trial form. Returns `{ ok:true, crm }` with
// the `crm` object the cloud contract expects, or `{ ok:false, errors }` keyed
// by field name for inline messages.
export function validateTrialForm(fields = {}) {
  const errors = {};
  const businessName = clean(fields.businessName);
  const { firstName, lastName } = splitFullName(fields.fullName);
  const email = normalizeEmail(fields.email);
  const phone = normalizePhone(fields.phone);

  if (!businessName) errors.businessName = 'Enter your dealership or business name.';
  if (!firstName) errors.fullName = 'Enter your name.';
  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';
  if (!phone) errors.phone = 'Enter your mobile phone number.';
  else if (phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid mobile phone number (10 digits).';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, crm: { businessName, firstName, lastName, email, phone } };
}

// The exact `POST /api/pay/self-serve` body for the trial (cross-lane contract).
export function buildTrialCheckoutBody({ crm, attribution } = {}) {
  return {
    planCode: TRIAL_PLAN_CODE,
    interval: TRIAL_INTERVAL,
    trialCode: TRIAL_CODE,
    crm,
    attribution,
  };
}

// The cloud answers eligibility refusals as 409 { error:<CODE>, message } and
// the Worker's own throttle as 429 { reason:'rate_limited' }. Prefer the
// cloud's friendly `message` verbatim; fall back to these when it is missing.
const ELIGIBILITY_CODES = new Set([
  'TRIAL_ALREADY_USED',
  'ALREADY_CUSTOMER',
  'EMAIL_AMBIGUOUS',
  'TRIAL_CHECK_UNAVAILABLE',
]);

const NEW_ACCOUNTS_ONLY =
  'This offer is for new AutoLander accounts. It looks like you already have one — sign in and pick a plan '
  + `under Configuration → Billing, or text Clay at ${SUPPORT_TEXT_NUMBER}.`;

const FALLBACK_MESSAGES = {
  TRIAL_ALREADY_USED: NEW_ACCOUNTS_ONLY,
  ALREADY_CUSTOMER: NEW_ACCOUNTS_ONLY,
  EMAIL_AMBIGUOUS:
    `We found more than one AutoLander account for that email. Text Clay at ${SUPPORT_TEXT_NUMBER} and we will sort it out.`,
  TRIAL_CHECK_UNAVAILABLE:
    'We could not confirm your trial eligibility right now. Please try again in a minute.',
  rate_limited: 'Too many attempts from this connection. Please wait a minute and try again.',
  network_error: 'We could not reach AutoLander. Check your connection and try again.',
  validation: 'Please check your details and try again.',
  unknown: `Something went wrong starting your trial. Please try again, or text Clay at ${SUPPORT_TEXT_NUMBER}.`,
};

export function trialErrorCode(err) {
  const body = err?.body && typeof err.body === 'object' ? err.body : {};
  const code = String(body.error || body.reason || err?.reason || '').trim();
  if (ELIGIBILITY_CODES.has(code)) return code;
  if (code === 'rate_limited' || err?.status === 429) return 'rate_limited';
  if (code === 'network_error' || err?.status === 0) return 'network_error';
  if (err?.status === 400) return 'validation';
  return 'unknown';
}

export function trialErrorMessage(err) {
  const code = trialErrorCode(err);
  const body = err?.body && typeof err.body === 'object' ? err.body : {};
  const apiMessage = clean(body.message, 500);
  if (code === 'network_error') return FALLBACK_MESSAGES.network_error;
  // Trust the API's own sentence for known codes; for an unknown code only when
  // it reads like prose (not an echoed machine token such as "http_502").
  if (apiMessage && (code !== 'unknown' || /\s/.test(apiMessage))) return apiMessage;
  return FALLBACK_MESSAGES[code] || FALLBACK_MESSAGES.unknown;
}

// "Tuesday, Sep 23, 2:15 PM EDT" — the viewer's own timezone with its
// abbreviation, per design doc §3. Returns '' for a missing/invalid instant so
// callers can keep showing the interim copy while they poll for `endsAt`.
export function formatTrialEnd(endsAt) {
  if (!endsAt) return '';
  const date = new Date(endsAt);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}
