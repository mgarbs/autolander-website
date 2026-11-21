import { apiGet, apiPost } from './api.js';

export const getLoginEmailStatus = (orgId, userId, options) => apiGet(
  `/admin/login-email/status?orgId=${encodeURIComponent(orgId)}&userId=${encodeURIComponent(userId)}`,
  options,
);
export const startLoginEmailChange = (input) => apiPost('/admin/login-email/start', input);
export const cancelLoginEmailChange = (input) => apiPost('/admin/login-email/cancel', input);
export const sendLoginEmailReset = (input) => apiPost('/admin/login-email/send-reset', input);

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function emailsMatch(a, b) {
  const first = normalizeEmail(a);
  return first !== '' && first === normalizeEmail(b);
}

export function isLast4(value) {
  return typeof value === 'string' && /^\d{4}$/.test(value);
}

export function operatorNameError(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (name.includes('@')) return 'Type your name, not an email address.';
  if (name.length < 2 || name.length > 60) return 'Type your name.';
  return null;
}

// Notion #201 (2026-11-21): the cloud dry-run answers emailCheck.warnings (a typo such as
// gmial.com, a domain that does not take mail). Shown before anything is sent; never a
// block. Only plain strings are kept, capped, so the UI renders text and nothing else.
export function emailCheckWarnings(result) {
  const list = Array.isArray(result?.emailCheck?.warnings) ? result.emailCheck.warnings : [];
  return list
    .filter((warning) => warning && typeof warning.message === 'string' && warning.message.trim())
    .slice(0, 5)
    .map((warning) => ({
      code: typeof warning.code === 'string' ? warning.code.slice(0, 40) : '',
      message: warning.message.slice(0, 300),
      ...(typeof warning.suggestion === 'string' && warning.suggestion ? { suggestion: warning.suggestion.slice(0, 254) } : {}),
    }));
}

// Send runs the dry-run first unless this exact address was already checked. If that
// check warns, the warning is shown and a second Send for the same address goes through.
export function sendNeedsCheck(checked, newEmail) {
  return !checked || checked.email !== normalizeEmail(newEmail);
}

// Check (dry-run) or Send (apply) for a new login email. Send runs the dry-run first
// whenever this exact address was not checked yet; if that answers warnings, this Send
// stops (nothing is sent) and returns them. A second Send for the same address applies.
// `start` is startLoginEmailChange (injectable for tests); a cloud refusal throws as usual.
export async function runStartWithEmailCheck({ action, checked, input, start = startLoginEmailChange }) {
  const email = normalizeEmail(input?.newEmail);
  const base = { ...input, newEmail: email };
  let nextChecked = checked || null;
  if (action === 'send' && sendNeedsCheck(checked, email)) {
    const dryRun = await start(base);
    if (!dryRun?.ok) return { stopped: false, checked: nextChecked, result: dryRun };
    const warnings = emailCheckWarnings(dryRun);
    nextChecked = { email, warnings };
    if (warnings.length) return { stopped: true, checked: nextChecked, result: dryRun };
  }
  const result = await start(action === 'send' ? { ...base, apply: true } : base);
  if (action === 'check' && result?.ok) nextChecked = { email, warnings: emailCheckWarnings(result) };
  return { stopped: false, checked: nextChecked, result };
}

export const REASON_TEXT = Object.freeze({
  USER_NOT_IN_ORG: 'This user is not in this account.',
  USER_DEACTIVATED: 'This user was removed from the team. Reactivate them first.',
  GROUP_OWNER: 'This is a dealer group owner login. Ask Mike to change it.',
  EMAIL_NOT_VERIFIED: 'This user has not verified their email yet. They can change it on the verification screen in the app.',
  CURRENT_EMAIL_MISMATCH: 'The current email changed since this page loaded. Refresh and try again.',
  SAME_EMAIL: 'That is already their login email.',
  EMAIL_IN_USE: 'Another AutoLander account already uses that email.',
  PHONE_NOT_ON_FILE: 'There is no phone on file for this account. Use the card check instead.',
  CARD_NOT_ON_FILE: 'There is no card on file for this account. Use the phone call instead.',
  VERIFICATION_FAILED: 'Those 4 digits do not match the card on file. Nothing was sent.',
  CARD_CHECK_LOCKED: 'Too many wrong card checks for this account today. Use the phone call, or try again tomorrow.',
  CARD_CHECK_UNAVAILABLE: 'We could not reach Stripe to check the card. Try again in a minute.',
  RATE_LIMITED: 'Too many email changes for this account today. Try again tomorrow or ask Mike.',
  NO_PENDING: 'There is no pending change to cancel.',
  NOT_OPEN: 'That change is no longer pending.',
  NO_EMAIL: 'This user has no email on file.',
  TARGET_CHANGED: 'The account changed while we were working. Refresh and try again.',
});

export function reasonText(code) {
  return Object.hasOwn(REASON_TEXT, code)
    ? REASON_TEXT[code]
    : 'Something went wrong. Nothing was changed.';
}

export const LOGIN_EMAIL_COPY = Object.freeze({
  title: 'Change login email',
  currentEmail: 'Current login email: {email}',
  hint: 'If this person can still sign in, ask them to change it in AutoLander under Settings, Login email.',
  pending: 'A confirmation link was sent to {to} by {by}. It expires {time}.',
  cancel: 'Cancel this change',
  cancelled: 'The pending change was cancelled.',
  lastChange: 'Last changed {time} by {by}: {from} to {to}.',
  verify: 'Verify the customer',
  phone: 'Phone call',
  phoneOnFile: 'Phone on file: {phoneOnFile}',
  phoneAttestation: 'I called this number and the person confirmed this change.',
  noPhone: 'No phone on file',
  card: 'Card last 4',
  last4: 'Last 4 digits the customer read to you',
  cardHelp: 'Ask for the last 4 digits of the card AutoLander bills. Never ask for the full card number.',
  noCard: 'No card on file',
  cardLocked: 'Card check is locked for 24 hours',
  newEmail: 'New login email',
  repeatEmail: 'Type it again',
  emailMismatch: 'The two emails do not match.',
  operator: 'Your name',
  note: 'Note (optional)',
  check: 'Check',
  ready: 'Ready to send a confirmation link to {to}.',
  send: 'Send confirmation link',
  sent: 'We emailed a confirmation link to {to}. The change happens when the customer clicks it. The link expires in 24 hours.',
  sendFailed: 'The confirmation email could not be sent. Check the address and send again.',
  reset: 'Send password reset email',
  resetSent: 'Password reset code sent to {email}.',
  close: 'Close',
  loading: 'Loading login email details.',
  refresh: 'Refresh',
  emailCheckHeading: 'Check this address before you send:',
  emailCheckStopped: 'Nothing was sent. Fix the address, or press Send again to use it as typed.',
  useSuggestion: 'Use {suggestion}',
});
