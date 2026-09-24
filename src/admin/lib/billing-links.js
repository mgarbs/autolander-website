import { ApiError, apiGet, apiPost } from './api.js';
import { TRIAL_DAYS, TRIAL_PLAN_CHOICE, isTrialPlanChoice } from './billing-link-form.js';
import { normalizeCandidates } from './ops.js';

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

// Catalog plan codes the cloud accepts verbatim, plus one UI-only choice:
// STARTER_TRIAL_3D is never sent as a planCode — buildBillingLinkPayload maps
// it to `planCode:'STARTER', billingInterval:'monthly', trialCode:'starter_3d_v1'`
// (design doc §3). Kept last so the four real codes keep their positions.
export { TRIAL_CODE, TRIAL_DAYS, TRIAL_PLAN_CHOICE, isTrialPlanChoice } from './billing-link-form.js';
export const PLAN_CHOICES = ['STARTER', 'GROWTH', 'PRO', 'PRO_TEAM', TRIAL_PLAN_CHOICE];

// "Core" posting plans — the only links the cloud auto-attaches by e-mail and
// guards against a second live plan (CORE_PLAN_CODES on the cloud). A trial is
// never a core LINK even though its base plan is STARTER; add-ons never are.
export const CORE_PLAN_CODES = Object.freeze(['STARTER', 'GROWTH', 'PRO', 'PRO_TEAM']);
const CORE_PLAN_SET = new Set(CORE_PLAN_CODES);
const BLOCKING_CORE_STATUSES = new Set(['active', 'trialing']);
const CORE_PLAN_NAMES = { STARTER: 'Starter', GROWTH: 'Growth', PRO: 'Pro', PRO_TEAM: 'Dealer Plan' };

export function isCoreLinkChoice(planChoice) {
  const code = text(planChoice).toUpperCase();
  return CORE_PLAN_SET.has(code) && !isTrialPlanChoice(code);
}

export function corePlanDisplayName(plan) {
  const code = text(plan).toUpperCase();
  return CORE_PLAN_NAMES[code] || code || 'core';
}

// `planMeta` on list/detail rows carries `{ trialCode, trialDays }` for a
// card-required trial link (Json on CheckoutRequest, no schema change).
export function normalizePlanMeta(raw) {
  const meta = raw && typeof raw === 'object' ? raw : {};
  const trialCode = text(meta.trialCode);
  const days = Number(meta.trialDays);
  return {
    trialCode,
    trialDays: Number.isSafeInteger(days) && days > 0 ? days : (trialCode ? TRIAL_DAYS : null),
  };
}

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

// ---------- Account auto-match (cloud GET /api/billing-links/account-match) ----------
// The cloud resolves the CRM e-mail to exactly one AutoLander account (an
// active user with that exact e-mail) and says whether the link would
// auto-attach to it (only when that user is the account's active owner and it
// is not a dealer-group store), plus the core-plan guard verdict. A match on a
// team member only ('non_owner_match') or on a group store ('dealer_group')
// still sends the account as `candidate`, with autoAttach false: a suggestion
// the rep may pick, never an attach. The server stays authoritative at
// create/open time; this only pre-fills the form.

export async function findAccountMatch(email) {
  const payload = await apiGet(
    `/admin/billing-links/account-match?email=${encodeURIComponent(text(email))}`,
  );
  return normalizeAccountMatch(payload);
}

// Change (orgId) or detach (null) the account on a link nobody opened yet.
export async function setBillingLinkAccount(id, orgId) {
  return apiPost(`/admin/billing-links/${encodeURIComponent(id)}/account`, { orgId: orgId || null });
}

export function normalizeAccountMatch(payload) {
  const raw = payload && typeof payload === 'object' ? payload : {};
  const guard = raw.coreGuard && typeof raw.coreGuard === 'object' ? raw.coreGuard : {};
  const orgCount = Number(raw.orgCount);
  return {
    status: text(raw.status),
    email: text(raw.email),
    autoAttach: raw.autoAttach === true,
    orgCount: Number.isSafeInteger(orgCount) && orgCount >= 0 ? orgCount : 0,
    candidate: raw.candidate && typeof raw.candidate === 'object'
      ? normalizeCandidates({ candidates: [raw.candidate] })[0] || null
      : null,
    candidates: normalizeCandidates({ candidates: Array.isArray(raw.candidates) ? raw.candidates : [] }),
    coreGuard: {
      blocked: guard.blocked === true,
      message: text(guard.message),
      plan: text(guard.plan),
      status: text(guard.status),
    },
  };
}

// An older cloud without the endpoint answers 404 (its detail route reads
// 'account-match' as a link id), and an unset ops token answers
// ops_not_configured. Either way there is simply no suggestion — creating the
// link still works exactly as before.
export function isAccountMatchUnavailable(err) {
  return err instanceof ApiError
    && (err.status === 404 || err.reason === 'not_found' || err.reason === 'ops_not_configured');
}

// Advisory mirror of the cloud core-plan guard for a picked account row
// (normalizeCandidates shape): a core plan, active|trialing, with a Stripe
// subscription id. Dealer-group-billed seats are exempt, as on the server.
export function candidateCoreConflict(candidate) {
  const sub = candidate?.subscription;
  if (!sub || typeof sub !== 'object') return null;
  const plan = text(sub.plan).toUpperCase();
  const status = text(sub.status).toLowerCase();
  if (!CORE_PLAN_SET.has(plan) || !BLOCKING_CORE_STATUSES.has(status)) return null;
  if (!text(sub.stripeSubscriptionId) || text(sub.billedByGroupId)) return null;
  return { plan, status };
}

export function coreConflictMessage(conflict) {
  return `This account already has an active ${corePlanDisplayName(conflict?.plan)} plan — this link will be refused. `
    + 'Plan changes are made in the app under Configuration → Billing.';
}

// The red advisory under the account picker, or '' when there is nothing to
// warn about. Prefers the cloud's own sentence for the auto-matched account.
export function accountCoreWarning({ selectedOrg, accountMatch } = {}) {
  if (!selectedOrg) return '';
  if (selectedOrg.autoMatched && accountMatch?.coreGuard?.blocked
    && accountMatch?.candidate?.orgId === selectedOrg.orgId) {
    return accountMatch.coreGuard.message || coreConflictMessage({ plan: accountMatch.coreGuard.plan });
  }
  const conflict = candidateCoreConflict(selectedOrg);
  return conflict ? coreConflictMessage(conflict) : '';
}

const ACCOUNT_MATCH_LABELS = {
  auto_attached: 'Matched by e-mail',
  auto_attached_at_open: 'Matched by e-mail when opened',
  rep_selected: 'Chosen by rep',
  rep_cleared: 'E-mail match removed by rep',
  matched: 'Matched by e-mail',
  ambiguous: 'Several accounts use this e-mail',
  none: 'No account uses this e-mail',
  no_email: 'No e-mail to match',
  dealer_group: 'Dealer-group store (suggest only)',
  non_owner_match: 'Matched a team member, not the owner (suggest only)',
  // Earlier draft name for an owner-less match. The cloud sends
  // non_owner_match; this one stays readable if it ever turns up.
  no_owner: 'Matched account has no owner',
  lookup_failed: 'Account lookup failed',
};

export function accountMatchLabel(status) {
  const key = text(status);
  return ACCOUNT_MATCH_LABELS[key] || key || '—';
}

// The note under the account picker when the e-mail match did NOT attach an
// account itself: `{ note, options, tone }`, or null when there is nothing to
// say. `options` are suggested accounts shown as buttons, and picking one is a
// normal manual attach (the cloud records it as the rep's choice). `tone` is
// 'warn' for a match the rep should look at twice, else 'muted'. A status this
// build does not know yet still offers its candidate, so a suggestion from the
// cloud is never silently dropped.
export function accountMatchNote(match, { cleared = false } = {}) {
  const status = text(match?.status);
  if (!status) return null;
  const email = text(match.email) || 'this e-mail';
  const suggested = match.candidate?.orgId ? [match.candidate] : [];
  const orgName = text(match.candidate?.orgName);

  switch (status) {
    case 'matched':
      if (!cleared) return null;
      return {
        note: `E-mail match removed — this link will not attach to ${orgName || 'that account'} unless you pick an account.`,
        options: suggested,
        tone: 'muted',
      };
    case 'ambiguous':
      return {
        note: `More than one account uses ${email} — pick the right one below.`,
        options: Array.isArray(match.candidates) ? match.candidates : [],
        tone: 'warn',
      };
    case 'none':
      return {
        note: `No AutoLander account uses ${email} yet — if the dealer signs up with it before paying, the link attaches when opened.`,
        options: [],
        tone: 'muted',
      };
    case 'dealer_group':
      return {
        note: `${email} belongs to a dealer-group store — it is only suggested, never attached automatically. Attach it manually only if intended.`,
        options: suggested,
        tone: 'warn',
      };
    case 'non_owner_match':
      return {
        note: `${email} belongs to a team member (not the owner) of ${orgName || 'an account'} — it is only suggested, `
          + 'never attached automatically. Attach it manually only if intended.',
        options: suggested,
        tone: 'warn',
      };
    case 'no_owner':
      return {
        note: `${email} matches an account with no active owner — attach it manually only if intended.`,
        options: suggested,
        tone: 'warn',
      };
    case 'lookup_failed':
      return {
        note: 'Could not check accounts by e-mail. You can still search and attach an account below.',
        options: [],
        tone: 'muted',
      };
    default:
      if (!suggested.length) return null;
      return {
        note: `${email} matches ${orgName || 'an account'}, but it was not attached automatically `
          + `(${accountMatchLabel(status).toLowerCase()}). Attach it manually only if intended.`,
        options: suggested,
        tone: 'warn',
      };
  }
}

// planMeta.accountMatch, stamped by the cloud at create / first open / change.
export function normalizeAccountMatchStamp(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const status = text(raw.status);
  if (!status) return null;
  return { status, email: text(raw.email), orgId: text(raw.orgId), at: raw.at || null };
}

// One line for the "Payment link ready" box from the create response's
// `accountMatch` ('' for an older cloud that does not send it).
export function describeCreatedAccountMatch(accountMatch, { orgId = '', orgName = '' } = {}) {
  const stamp = normalizeAccountMatchStamp(accountMatch);
  if (!stamp) return '';
  const name = text(orgName) || text(orgId) || stamp.orgId || 'the account';
  if (stamp.status === 'auto_attached') return `Attached to ${name} (matched by e-mail)`;
  if (stamp.status === 'rep_selected') return `Attached to ${name} (rep choice)`;
  return `Not attached — ${accountMatchLabel(stamp.status).toLowerCase()}`;
}

// Error text for the change/detach actions: the cloud's own sentence
// (LINK_ACCOUNT_LOCKED / CORE_PLAN_ACTIVE) whenever it sent one.
export function billingLinkAccountErrorText(err) {
  if (err instanceof ApiError && (err.status === 404 || err.reason === 'cloud_bad_response')) {
    return 'Changing the account on a link needs the latest AutoLander cloud release.';
  }
  return err?.serverMessage || err?.message || 'Could not change the account on this payment link.';
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
    planMeta: normalizePlanMeta(row?.planMeta),
    accountMatch: normalizeAccountMatchStamp(row?.planMeta?.accountMatch),
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
