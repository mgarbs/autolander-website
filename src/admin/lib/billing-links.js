import { ApiError, apiGet, apiPost } from './api.js';

// Helpers for the admin "Payment Links" surface (worker /admin-api/billing-links*
// proxy to the AutoLander cloud /api/billing-links*). Normalized defensively —
// same convention as lib/ops.js — so minor field-name drift on the cloud side
// doesn't break the admin UI.

export function isBillingLinksNotConfigured(err) {
  return err instanceof ApiError && err.reason === 'ops_not_configured';
}

export const BILLING_LINKS_SETUP_NOTE =
  'Payment links are not configured yet. Set the OPS_ADMIN_TOKEN secret on the Cloudflare Worker '
  + '(wrangler secret put OPS_ADMIN_TOKEN) and the matching OPS_ADMIN_TOKEN on the AutoLander cloud, then redeploy the Worker.';

export const PLAN_CHOICES = ['STARTER', 'GROWTH', 'PRO', 'PRO_TEAM'];

export async function listBillingLinks(params = {}) {
  const search = new URLSearchParams();
  if (params.livemode !== undefined && params.livemode !== '') search.set('livemode', params.livemode);
  if (params.status) search.set('status', params.status);
  if (params.q) search.set('q', params.q);
  if (params.limit) search.set('limit', params.limit);
  if (params.offset) search.set('offset', params.offset);
  const qs = search.toString();
  const payload = await apiGet(`/admin/billing-links${qs ? `?${qs}` : ''}`);
  return normalizeBillingLinkList(payload);
}

export async function getBillingLink(id) {
  const payload = await apiGet(`/admin/billing-links/${encodeURIComponent(id)}`);
  return normalizeBillingLinkDetail(payload);
}

export async function createBillingLink(input) {
  return apiPost('/admin/billing-links', input);
}

export async function disableBillingLink(id) {
  return apiPost(`/admin/billing-links/${encodeURIComponent(id)}/disable`, {});
}

export async function recreateBillingLink(id) {
  return apiPost(`/admin/billing-links/${encodeURIComponent(id)}/recreate`, {});
}

export function normalizeBillingLinkList(payload) {
  const rows = firstArray(payload, ['requests', 'links', 'checkoutRequests', 'results', 'rows']);
  return rows.map(normalizeBillingLinkRow).filter((row) => row.id);
}

export function normalizeBillingLinkRow(row) {
  const crmSnapshot = row?.crmSnapshot && typeof row.crmSnapshot === 'object' ? row.crmSnapshot : {};
  return {
    id: text(row?.id),
    token: text(row?.token),
    status: text(row?.status) || 'created',
    livemode: Boolean(row?.livemode),
    planCode: text(row?.planCode),
    billingInterval: text(row?.billingInterval) || 'monthly',
    orgId: text(row?.orgId),
    userId: text(row?.userId),
    crmLinked: Boolean(row?.crmLinked),
    businessName: text(crmSnapshot.businessName) || text(row?.pickedOrgName),
    createdAt: row?.createdAt || null,
    completedAt: row?.completedAt || null,
    origin: text(row?.origin),
  };
}

export function normalizeBillingLinkDetail(payload) {
  const record = payload?.request && typeof payload.request === 'object'
    ? payload.request
    : payload?.checkoutRequest && typeof payload.checkoutRequest === 'object'
      ? payload.checkoutRequest
      : payload;
  const events = firstArray(payload, ['billingEvents', 'events']);
  const stripeEvents = firstArray(payload, ['stripeEvents', 'stripeEventRecords']);
  return {
    record: record && typeof record === 'object' ? record : {},
    billingEvents: events,
    stripeEvents,
  };
}

export function payUrlForToken(token) {
  return `https://autolander.ai/pay/${token}`;
}

export function formatCents(cents, currency = 'usd') {
  if (!Number.isFinite(Number(cents))) return '—';
  return (Number(cents) / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: String(currency || 'usd').toUpperCase(),
  });
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
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
