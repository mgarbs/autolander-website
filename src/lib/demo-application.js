import { getAttributionPayload } from './identity.js';
import {
  mergeOrganicAttribution,
  readOrganicAttribution,
  trackGoogleLead,
} from './organic-attribution.js';

const RUNTIME_ENV = import.meta.env || {};
const CAPI_URL = (RUNTIME_ENV.VITE_CAPI_URL || RUNTIME_ENV.VITE_CHAT_API_URL || '').replace(/\/+$/, '');

export function hasFirstAndLastName(value) {
  return typeof value === 'string' && value.trim().split(/\s+/).length >= 2;
}

export function applicationApiConfigured() {
  return true;
}

function randomBase32(length) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function newSubmissionId() {
  return `sub_${randomBase32(24)}`;
}

export async function submitApplication({
  fullName,
  email,
  phone,
  role,
  inventoryUrl,
  vehicleCount,
  smsConsent,
  consentTimestamp,
  submissionId,
  company,
}) {
  const organicAttribution = readOrganicAttribution();
  const attribution = getAttributionPayload();
  const currentPage = window.location.href;
  const currentReferrer = document.referrer || '';
  const landingPage = organicAttribution?.landing_page
    || attribution.firstTouch?.landing_page || currentPage;
  const referrerUrl = organicAttribution?.referrer_url
    || attribution.firstTouch?.referrer || currentReferrer;
  const analyticsAttribution = mergeOrganicAttribution(attribution, organicAttribution);
  const res = await fetch(`${CAPI_URL}/api/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({
      fullName,
      email,
      phone,
      role,
      inventoryUrl,
      vehicleCount,
      smsConsent,
      consentTimestamp,
      submissionId,
      company,
      userAgent: navigator.userAgent || '',
      attribution,
      organic_attribution: organicAttribution || {},
      landing_page: landingPage,
      referrer_url: referrerUrl,
      current_page: currentPage,
      current_referrer: currentReferrer,
    }),
  });
  const data = await res.json().catch(() => ({ ok: false, reason: 'bad_response' }));
  if (res.ok && data.ok && data.attribution_token) {
    try {
      window.localStorage.setItem('al_signup_attribution_token', data.attribution_token);
    } catch {
      // A blocked storage API must never interrupt the completed application.
    }
  }
  if (res.ok && data.ok && !data.duplicate) trackGoogleLead(analyticsAttribution, organicAttribution);
  return { httpOk: res.ok, ...data };
}
