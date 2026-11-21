import { apiPost } from './api.js';

// Dealership rename (Notion #198, 2026-11-21). The AI sales replies and the buyer emails
// sign with this name. Check is a dry-run; Rename applies.
export const renameOrg = (input) => apiPost('/admin/orgs/rename', input);

export function canRenameOrg(org) {
  return Boolean(org) && !org.groupId && org.isGroupHq !== true;
}

export const ORG_RENAME_REASON_TEXT = Object.freeze({
  GROUP_ORG: 'This store belongs to a dealer group. Its group manages the name.',
  CURRENT_NAME_MISMATCH: 'The name changed since you opened this account. Reload and try again.',
  ORG_NOT_FOUND: 'This account was not found. Reload and try again.',
  target_changed: 'The account changed while we were working. Reload and try again.',
  invalid_orgId: 'This account id is not valid. Reload and try again.',
  invalid_expectCurrentName: 'This account has no name on file yet. Reload and try again.',
  invalid_actor: 'Your admin session could not be read. Sign in again and retry.',
  ops_not_configured: 'Renaming is not set up on this site yet. Ask Mike.',
  ops_token_rejected: 'The cloud did not accept this site. Ask Mike.',
  cloud_unreachable: 'We could not reach AutoLander. Try again in a minute.',
});

export function orgRenameFailureText(error) {
  const reason = error?.reasons?.[0] || error?.reason || error?.code;
  if (reason === 'invalid_name') {
    const message = typeof error?.serverMessage === 'string' && error.serverMessage !== 'invalid_name'
      ? error.serverMessage
      : typeof error?.message === 'string' && error.message !== 'invalid_name' ? error.message : '';
    return message || 'Dealership names must be 2 to 100 characters, with no < > or hidden characters.';
  }
  return Object.hasOwn(ORG_RENAME_REASON_TEXT, reason)
    ? ORG_RENAME_REASON_TEXT[reason]
    : 'Something went wrong. Nothing was changed.';
}

// The cloud reports what happened to the Stripe customer name after an applied rename
// (stripe: { updated, skipped, disabled?, error? }). Only claim it changed when it did.
export function orgRenamedText(result, to) {
  const base = ORG_RENAME_COPY.renamed.replace('{to}', to);
  const updated = Number(result?.stripe?.updated) || 0;
  return `${base} ${updated > 0 ? ORG_RENAME_COPY.stripeUpdated : ORG_RENAME_COPY.stripeNotUpdated}`;
}

export const ORG_RENAME_COPY = Object.freeze({
  button: 'Rename',
  title: 'Rename dealership',
  current: 'Current name: {name}',
  hint: 'Buyers see this name in AutoLander AI replies and emails. The account admin can also change it in the app under Configuration, Profile.',
  newName: 'New dealership name',
  operator: 'Your name',
  check: 'Check',
  ready: 'Ready to rename {from} to {to}.',
  same: 'That is already the name.',
  rename: 'Rename',
  renamed: 'Renamed to {to}. The next AI reply uses the new name.',
  stripeUpdated: 'The Stripe customer name is updated too.',
  stripeNotUpdated: 'The Stripe customer name was not changed. If invoices should show the new name, change it in Stripe.',
  alreadyApplied: 'This rename was already done.',
  close: 'Close',
});
