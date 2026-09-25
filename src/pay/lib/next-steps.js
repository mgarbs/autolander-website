// "What do I do now?" copy for the /pay success view (TokenCheckout's PHASE.success).
// Pure — no DOM, no fetch — so the exact wording and the download/tel links are pinned by
// test/pay-next-steps.test.js without React.
//
// Two sentences: nextStepsSegments for "Payment received" (admin/paid link — the account may not
// exist yet, so it says "create your account or sign in with this same e-mail") and
// trialNextStepsSegments for "Your free trial is live" (the cloud already created the account and
// mailed the login, so it says "Your login is on its way to <e-mail>").
//
// The payer e-mail comes from GET /api/pay/:token?session_id=cs_… (the cloud only returns it
// to a caller holding both the pay token and a Stripe session stored on that link, within 24h
// of payment). Whenever it is unknown — old cloud, old Worker, no session id, invalid value —
// the copy falls back to "the same e-mail you paid with" (trial: TRIAL_EMAIL_FALLBACK), so every
// deploy order is safe.

import { SUPPORT_TEXT_NUMBER } from './trial.js';

export const CLAY_TEL_HREF = 'tel:9192800967';
export const DOWNLOAD_SETUP_PATH = '/download/setup/';

const MAX_EMAIL_LENGTH = 254;
// Stricter than trial.js's form check on purpose: this value is shown back to the customer,
// so anything carrying markup-ish characters is dropped rather than displayed.
const PAYER_EMAIL_PATTERN = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;

export function normalizePayerEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return '';
  return PAYER_EMAIL_PATTERN.test(email) ? email : '';
}

// Mirrors SelfServePicker.jsx: iPhone/iPad user agents say "like Mac OS X" and Android says
// "Linux", which is fine — on a phone the link opens the setup page without auto-downloading.
export function detectDesktopOs(userAgent) {
  const ua = String(userAgent || '');
  if (/Mac/i.test(ua)) return 'mac';
  if (/Linux/i.test(ua)) return 'linux';
  return 'windows';
}

export function isMobileDevice({ userAgent = '', maxTouchPoints = 0 } = {}) {
  const ua = String(userAgent || '');
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
    || (/Macintosh/i.test(ua) && Number(maxTouchPoints) > 1);
}

// The site's existing download page (public/download/setup/). `open=1` on a phone so an
// installer never auto-downloads to a device that cannot run it.
export function downloadSetupHref({ userAgent = '', maxTouchPoints = 0 } = {}) {
  const os = detectDesktopOs(userAgent);
  const mobile = isMobileDevice({ userAgent, maxTouchPoints });
  return `${DOWNLOAD_SETUP_PATH}?os=${os}${mobile ? '&open=1' : ''}`;
}

// [{ kind: 'text' | 'download' | 'email' | 'tel', text, href? }] — joined, the texts are the
// team's sentence verbatim. React renders each segment, so nothing here is ever raw HTML.
export function nextStepsSegments(payerEmail) {
  const email = normalizePayerEmail(payerEmail);
  const segments = [
    { kind: 'text', text: 'Next: ' },
    { kind: 'download', text: 'download AutoLander' },
  ];
  if (email) {
    segments.push(
      { kind: 'text', text: ' and create your account or sign in with this same e-mail (' },
      { kind: 'email', text: email },
      { kind: 'text', text: ') so your plan shows up automatically.' },
    );
  } else {
    segments.push({
      kind: 'text',
      text: ' and create your account or sign in with the same e-mail you paid with so your plan shows up automatically.',
    });
  }
  segments.push(
    { kind: 'text', text: ' Already have an account under a different e-mail? Text Clay at ' },
    { kind: 'tel', text: SUPPORT_TEXT_NUMBER, href: CLAY_TEL_HREF },
    { kind: 'text', text: " and he'll link it for you." },
  );
  return segments;
}

export function nextStepsText(payerEmail) {
  return nextStepsSegments(payerEmail).map((segment) => segment.text).join('');
}

// Trial variant for the "Your free trial is live" screen (Notion #14). The cloud has already
// created the account and mailed "Your AutoLander login" to the form e-mail (which is exactly the
// payerEmail the cloud reveals for a trial), so this copy never says "create your account". Same
// segment kinds as nextStepsSegments so TokenCheckout's NextSteps renders it unchanged; no Clay
// tel: segment — the trial screen is not where account linking happens.
export const TRIAL_EMAIL_FALLBACK = 'the e-mail you signed up with';

export function trialNextStepsSegments(payerEmail) {
  const email = normalizePayerEmail(payerEmail);
  return [
    { kind: 'text', text: 'Your login is on its way to ' },
    email ? { kind: 'email', text: email } : { kind: 'text', text: TRIAL_EMAIL_FALLBACK },
    { kind: 'text', text: '. ' },
    { kind: 'download', text: 'Download AutoLander' },
    { kind: 'text', text: ' and sign in with it.' },
  ];
}

export function trialNextStepsText(payerEmail) {
  return trialNextStepsSegments(payerEmail).map((segment) => segment.text).join('');
}
