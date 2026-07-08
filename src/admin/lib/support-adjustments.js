import { ApiError, apiGet, apiPost } from './api.js';

export function isSupportAdjustmentsNotConfigured(err) {
  return err instanceof ApiError && err.reason === 'ops_not_configured';
}

export const SUPPORT_ADJUSTMENTS_SETUP_NOTE =
  'Support adjustments are not configured yet. Set the OPS_ADMIN_TOKEN secret on the Cloudflare Worker '
  + 'and the matching OPS_ADMIN_TOKEN on the AutoLander cloud, then redeploy both services.';

export async function searchSupportCandidates(query) {
  const q = String(query || '').trim();
  if (!q) return [];
  const payload = await apiGet(`/admin/support-adjustments/candidates?q=${encodeURIComponent(q)}`);
  return normalizeCandidates(payload);
}

export async function grantSupportCredits(input) {
  return apiPost('/admin/support-adjustments/credits', input);
}

export async function issueSupportDiscount(input) {
  return apiPost('/admin/support-adjustments/discount', input);
}

export function normalizeCandidates(payload) {
  const rows = firstArray(payload, ['candidates', 'results', 'orgs', 'rows']);
  return rows.map(normalizeCandidate).filter((row) => row.orgId);
}

export function normalizeCandidate(row) {
  const org = row?.org && typeof row.org === 'object' ? row.org : row;
  const subscription = row?.subscription && typeof row.subscription === 'object'
    ? row.subscription
    : org?.subscription && typeof org.subscription === 'object'
      ? org.subscription
      : null;
  return {
    orgId: text(row?.orgId ?? row?.org_id ?? org?.id ?? org?.orgId),
    orgName: text(row?.orgName ?? row?.org_name ?? org?.name ?? org?.orgName),
    slug: text(org?.slug),
    plan: text(row?.plan ?? org?.plan),
    creditBalance: numberOrNull(row?.creditBalance ?? org?.creditBalance),
    admins: normalizePeople(row?.adminUsers ?? row?.admins ?? org?.users),
    matchedUsers: normalizePeople(row?.matchedUsers ?? row?.matches),
    subscription,
  };
}

export function candidateLabel(candidate) {
  return candidate?.orgName || candidate?.slug || candidate?.orgId || 'Account';
}

export function candidatePeople(candidate) {
  const people = candidate?.matchedUsers?.length ? candidate.matchedUsers : candidate?.admins || [];
  return people
    .map((person) => person.email || person.displayName || person.username || person.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
}

export function subscriptionSummary(candidate) {
  const sub = candidate?.subscription;
  if (!sub) return 'no subscription';
  const plan = text(sub.plan ?? candidate?.plan);
  const status = text(sub.status);
  const interval = text(sub.billingInterval ?? sub.interval);
  return [plan, status, interval].filter(Boolean).join(' / ') || 'subscription on file';
}

export function canDiscount(candidate) {
  const sub = candidate?.subscription;
  if (!sub) return false;
  const status = text(sub.status).toLowerCase();
  const interval = text(sub.billingInterval ?? sub.interval).toLowerCase();
  return Boolean(
    sub.stripeSubscriptionId
      && sub.stripeCustomerId
      && ['active', 'trialing', 'past_due'].includes(status)
      && (!interval || interval === 'monthly' || interval === 'month')
  );
}

export function formatCredits(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return Number(value).toLocaleString();
}

export function formatCents(cents) {
  if (!Number.isFinite(Number(cents))) return '-';
  return (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function friendlyAdjustmentError(err) {
  const reason = String(err?.reason || err?.message || '').toUpperCase();
  const map = {
    OPS_NOT_CONFIGURED: SUPPORT_ADJUSTMENTS_SETUP_NOTE,
    OPS_TOKEN_REJECTED: 'The Worker token was rejected by the cloud. Rotate or re-sync OPS_ADMIN_TOKEN on both services.',
    CLOUD_UNREACHABLE: 'The cloud API is unreachable right now.',
    ORG_NOT_FOUND: 'That account could not be found.',
    SUBSCRIPTION_NOT_FOUND: 'That account does not have a linked Stripe subscription.',
    BAD_STATUS: 'That subscription is not active enough to discount.',
    UNSUPPORTED_INTERVAL: 'Only monthly subscriptions can receive a next-month percent discount here.',
    DISCOUNT_EXISTS: 'That subscription already has a discount. Remove it in Stripe before adding another one.',
    PRORATION_PRESENT: 'The upcoming invoice has proration lines, so the support UI will not discount it.',
    STRIPE_CUSTOMER_MISMATCH: 'Stripe customer IDs do not match. Check the account before adjusting billing.',
    COUPON_INVALID: 'A Stripe coupon with that support ID already exists but has different settings.',
  };
  return map[reason] || err?.message || 'The adjustment could not be completed.';
}

function normalizePeople(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((person) => {
      if (typeof person === 'string') return { email: person };
      if (!person || typeof person !== 'object') return null;
      return {
        id: text(person.id),
        username: text(person.username),
        displayName: text(person.displayName ?? person.name),
        email: text(person.email),
        role: text(person.role),
      };
    })
    .filter(Boolean);
}

function firstArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function text(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function numberOrNull(value) {
  if (value && typeof value === 'object' && 'balance' in value) return numberOrNull(value.balance);
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
