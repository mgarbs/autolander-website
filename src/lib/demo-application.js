import { getAttributionPayload } from './identity.js';

const CAPI_URL = (import.meta.env.VITE_CAPI_URL || import.meta.env.VITE_CHAT_API_URL || '').replace(/\/+$/, '');

export function applicationApiConfigured() {
  return Boolean(CAPI_URL);
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
  smsConsent,
  consentTimestamp,
  submissionId,
  company,
}) {
  if (!CAPI_URL) throw new Error('application_api_unconfigured');
  const attribution = getAttributionPayload();
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
      smsConsent,
      consentTimestamp,
      submissionId,
      company,
      userAgent: navigator.userAgent || '',
      attribution,
    }),
  });
  const data = await res.json().catch(() => ({ ok: false, reason: 'bad_response' }));
  return { httpOk: res.ok, ...data };
}
