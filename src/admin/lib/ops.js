import { ApiError, apiGet } from './api.js';

// Helpers for the admin ops-linking surface (worker /admin-api/ops/* proxy to
// the AutoLander cloud). The cloud payload shapes are normalized defensively
// so minor field-name drift on the cloud side does not break the admin UI.

export function isOpsNotConfigured(err) {
  return err instanceof ApiError && err.reason === 'ops_not_configured';
}

export const OPS_SETUP_NOTE =
  'Automatic account linking is not configured yet. Set the OPS_ADMIN_TOKEN secret on the Cloudflare Worker '
  + '(wrangler secret put OPS_ADMIN_TOKEN) and the matching OPS_ADMIN_TOKEN on the AutoLander cloud, then redeploy the Worker.';

export async function searchCandidates(query) {
  const q = String(query || '').trim();
  const payload = await apiGet(`/admin/ops/candidates?q=${encodeURIComponent(q)}`);
  return normalizeCandidates(payload);
}

export async function fetchUnlinked(query = '') {
  const q = String(query || '').trim();
  const payload = await apiGet(`/admin/ops/unlinked${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  return normalizeUnlinked(payload);
}

export function normalizeCandidates(payload) {
  const rows = firstArray(payload, ['candidates', 'results', 'orgs', 'rows']);
  return rows
    .map((row) => {
      const org = row?.org && typeof row.org === 'object' ? row.org : row;
      return {
        orgId: text(row?.orgId ?? row?.org_id ?? org?.id ?? org?.orgId),
        orgName: text(row?.orgName ?? row?.org_name ?? org?.name ?? org?.orgName),
        plan: text(row?.plan ?? row?.currentPlan ?? org?.plan),
        subscription: row?.subscription ?? row?.subscriptionState ?? row?.currentSubscription ?? null,
        admins: normalizeAdmins(row?.adminUsers ?? row?.admins ?? row?.users),
      };
    })
    .filter((row) => row.orgId);
}

export function normalizeUnlinked(payload) {
  const rows = firstArray(payload, ['unlinked', 'subscriptions', 'payers', 'results', 'rows']);
  return rows
    .map((row) => ({
      subId: text(row?.subId ?? row?.subscriptionId ?? row?.id),
      customerId: text(row?.customerId ?? row?.customer),
      email: text(row?.email ?? row?.customerEmail),
      name: text(row?.name ?? row?.customerName),
      created: row?.created ?? row?.createdAt ?? null,
      status: text(row?.status),
      priceCents: numberOrNull(row?.priceCents ?? row?.amountCents ?? row?.price_cents),
      interval: text(row?.interval),
      detectedPlan: text(row?.detectedPlan ?? row?.plan),
    }))
    .filter((row) => row.subId);
}

export function candidateSubscriptionSummary(candidate) {
  const sub = candidate?.subscription;
  if (!sub) return 'no active subscription';
  if (typeof sub === 'string') return sub;
  const status = text(sub.status);
  const plan = text(sub.plan ?? sub.detectedPlan);
  const parts = [plan, status].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'subscription on file';
}

// The account's CURRENT plan (before linking), for the plain-English summary.
export function candidateCurrentPlan(candidate) {
  const sub = candidate?.subscription;
  const subPlan = sub && typeof sub === 'object' ? text(sub.plan ?? sub.detectedPlan) : '';
  return subPlan || text(candidate?.plan) || 'FREE';
}

function priceLabel(payer) {
  const money = formatCents(payer?.priceCents);
  if (money === '—') return '';
  const iv = text(payer?.interval);
  const suffix = iv === 'year' || iv === 'annual' ? '/yr' : '/mo';
  return `${money}${suffix}`;
}

// Plain-English description of what a link will DO, for non-technical operators.
// Returns { lead, bullets } — derived from the picked payer + account, and
// (when present) sharpened by the cloud's dry-run diff (authoritative new plan).
export function describeLinkEffect({ payer, candidate, preview }) {
  const payerLabel = text(payer?.email) || text(payer?.name) || text(payer?.subId) || 'this payment';
  const orgLabel = text(candidate?.orgName) || text(candidate?.orgId) || 'the account';
  const price = priceLabel(payer);
  const currentPlan = candidateCurrentPlan(candidate);
  const after = preview?.diff?.after && typeof preview.diff.after === 'object' ? preview.diff.after : null;
  const newPlan = text(after?.plan) || text(payer?.detectedPlan) || currentPlan;

  const lead = `Connect ${payerLabel}'s payment${price ? ` (${price})` : ''} to the ${orgLabel} account.`;
  const bullets = [];
  if (newPlan && currentPlan && newPlan.toUpperCase() !== currentPlan.toUpperCase()) {
    bullets.push(`${orgLabel} changes from the ${currentPlan} plan to the ${newPlan} plan and receives that plan's included credits.`);
  } else if (newPlan) {
    bullets.push(`${orgLabel} is set to the ${newPlan} plan and receives that plan's included credits.`);
  }
  bullets.push('From now on this payment keeps the account active automatically — if it ever fails, the account pauses; when it succeeds again, the account turns back on.');
  bullets.push('The customer does nothing — they never see this screen.');
  return { lead, bullets };
}

export function formatCents(cents) {
  if (!Number.isFinite(Number(cents))) return '—';
  return (Number(cents) / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function formatAge(created) {
  const date = toDate(created);
  if (!date) return '—';
  const ms = Date.now() - date.getTime();
  if (ms < 0) return 'just now';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `${days}d ago`;
  return date.toLocaleDateString();
}

function toDate(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') {
    // Stripe timestamps are unix seconds; anything below ~2001 in ms is seconds.
    const ms = value < 10000000000 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeAdmins(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return text(item.email ?? item.name);
      return '';
    })
    .filter(Boolean)
    .slice(0, 4);
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
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
