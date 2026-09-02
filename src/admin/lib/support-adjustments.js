import { ApiError, apiGet, apiPost } from './api.js';

export function isSupportAdjustmentsNotConfigured(err) {
  return err instanceof ApiError && err.reason === 'ops_not_configured';
}

export const SUPPORT_ADJUSTMENTS_SETUP_NOTE =
  'Support adjustments are not configured yet. Set the OPS_ADMIN_TOKEN secret on the Cloudflare Worker '
  + 'and the matching OPS_ADMIN_TOKEN on the AutoLander cloud, then redeploy both services.';

export async function searchSupportCandidates(query, options = {}) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];
  const payload = await apiGet(`/admin/support-adjustments/candidates?q=${encodeURIComponent(q)}`, options);
  return normalizeCandidates(payload);
}

export async function grantSupportCredits(input) {
  return apiPost('/admin/support-adjustments/credits', input);
}

export async function issueSupportDiscount(input) {
  return apiPost('/admin/support-adjustments/discount', input);
}

export function createBillingDateOperationId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

export async function scheduleNextBillingDate(input) {
  const operationId = String(input?.operationId || '').trim() || createBillingDateOperationId();
  return apiPost('/admin/support-adjustments/billing-date', {
    ...input,
    ...(operationId ? { operationId } : {}),
  });
}

export async function fetchBillingStatus(subscriptionId) {
  return apiGet(
    `/admin/support-adjustments/billing-status?subscriptionId=${encodeURIComponent(subscriptionId)}`,
  );
}

export async function forgivePastDueAndReschedule({ orgId, subscriptionId, nextBillingDate }) {
  return apiPost('/admin/support-adjustments/billing-date', {
    mode: 'forgive_past_due',
    orgId,
    subscriptionId,
    nextBillingDate,
  });
}

export function normalizeCandidates(payload) {
  const rows = firstArray(payload, ['candidates', 'results', 'orgs', 'rows']);
  return rows.map(normalizeCandidate).filter((row) => row.orgId);
}

export function normalizeCandidate(row) {
  const org = row?.org && typeof row.org === 'object' ? row.org : row;
  const primaryContact = firstObject(
    row?.primaryContact,
    row?.contact,
    row?.customer,
    org?.primaryContact,
    org?.contact,
    org?.customer,
  );
  const subscription = row?.subscription && typeof row.subscription === 'object'
    ? row.subscription
    : org?.subscription && typeof org.subscription === 'object'
      ? org.subscription
      : null;
  const matchedUsers = normalizePeople(row?.matchedUsers ?? row?.matches ?? row?.matchedUser ?? row?.match);
  const admins = normalizePeople(row?.adminUsers ?? row?.admins ?? org?.users);
  const fallbackPerson = matchedUsers[0] || admins[0] || null;
  const contactName = personDisplayName(primaryContact) || fallbackPerson?.displayName || '';
  const email = text(
    row?.email
    ?? row?.contactEmail
    ?? primaryContact?.email
    ?? row?.contact?.email
    ?? row?.customer?.email
    ?? org?.email
    ?? org?.contactEmail
    ?? org?.contact?.email
    ?? org?.customer?.email
    ?? fallbackPerson?.email,
  );
  const phone = phoneText(
    row?.phone,
    row?.phoneNumber,
    row?.phone_number,
    row?.mobile,
    row?.mobilePhone,
    row?.contactPhone,
    primaryContact?.phone,
    primaryContact?.phoneNumber,
    primaryContact?.phone_number,
    primaryContact?.mobile,
    primaryContact?.mobilePhone,
    row?.contact?.phone,
    row?.contact?.phoneNumber,
    row?.contact?.mobile,
    row?.customer?.phone,
    row?.customer?.phoneNumber,
    row?.customer?.mobile,
    org?.phone,
    org?.phoneNumber,
    org?.contactPhone,
    org?.contact?.phone,
    org?.customer?.phone,
    fallbackPerson?.phone,
  );
  return {
    orgId: text(row?.orgId ?? row?.org_id ?? org?.id ?? org?.orgId),
    orgName: text(row?.orgName ?? row?.org_name ?? org?.name ?? org?.orgName),
    slug: text(org?.slug),
    plan: text(row?.plan ?? org?.plan),
    creditBalance: numberOrNull(row?.creditBalance ?? org?.creditBalance),
    contactName,
    email,
    phone,
    admins,
    matchedUsers,
    subscription,
  };
}

export function candidateLabel(candidate) {
  return candidate?.orgName || candidate?.slug || candidate?.orgId || 'Account';
}

export function candidatePeople(candidate) {
  const people = candidate?.matchedUsers?.length ? candidate.matchedUsers : candidate?.admins || [];
  const descriptions = people
    .map((person) => {
      const identity = person.displayName || person.email || person.username || person.phone || person.name;
      const secondary = [
        person.displayName && person.email,
        person.displayName && !person.email && person.username,
        person.phone,
      ].filter(Boolean);
      return [identity, ...secondary].filter(Boolean).join(' · ');
    })
    .filter(Boolean)
    .slice(0, 3);
  if (descriptions.length > 0) return descriptions.join(', ');
  return [candidate?.contactName, candidate?.email, candidate?.phone].filter(Boolean).join(' · ');
}

export function candidateContacts(candidate) {
  const people = candidate?.matchedUsers?.length ? candidate.matchedUsers : candidate?.admins || [];
  if (people.length > 0) return people;
  if (!candidate?.contactName && !candidate?.email && !candidate?.phone) return [];
  return [{
    displayName: text(candidate?.contactName),
    email: text(candidate?.email),
    phone: text(candidate?.phone),
    referralCode: '',
    username: '',
    firstName: '',
    lastName: '',
    id: '',
    role: '',
  }];
}

export function displayReferralCode(person) {
  return text(person?.referralCode) || 'Not assigned';
}

export function dialablePhone(value) {
  const raw = text(value);
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 3) return '';
  return `${raw.startsWith('+') ? '+' : ''}${digits}`;
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

// The Worker performs the full Stripe/schedule safety check. This only keeps the
// control out of the way when the selected record plainly cannot qualify.
export function canScheduleBillingDate(candidate) {
  const sub = candidate?.subscription;
  if (!sub) return false;
  const status = text(sub.status).toLowerCase();
  const interval = text(sub.billingInterval ?? sub.interval).toLowerCase();
  return Boolean(
    sub.stripeSubscriptionId
      && status === 'active'
      && (!interval || interval === 'monthly' || interval === 'month')
      && !sub.cancelAtPeriodEnd
      && !sub.stripeScheduleId,
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
    BAD_STATUS: 'Their subscription isn\'t in a state this tool can adjust — handle it in Stripe.',
    UNSUPPORTED_INTERVAL: 'Only monthly subscriptions can receive a next-month percent discount here.',
    DISCOUNT_EXISTS: 'That subscription already has a discount. Remove it in Stripe before adding another one.',
    PRORATION_PRESENT: 'The upcoming invoice has proration lines, so the support UI will not discount it.',
    STRIPE_CUSTOMER_MISMATCH: 'Stripe customer IDs do not match. Check the account before adjusting billing.',
    COUPON_INVALID: 'A Stripe coupon with that support ID already exists but has different settings.',
    STRIPE_NOT_CONFIGURED: 'Stripe is not configured for billing-date adjustments.',
    INVALID_BILLING_DATE_REQUEST: 'Choose a valid next billing date before scheduling it.',
    BILLING_DATE_BEFORE_CURRENT_PERIOD_END: 'Choose a date after the subscription’s current Stripe renewal date.',
    BILLING_DATE_TOO_FAR: 'Choose a date no more than one monthly period after the current Stripe renewal date.',
    BILLING_DATE_COUPON_INVALID: 'The billing-date grace coupon is not configured as a valid 100% one-time Stripe coupon.',
    BILLING_DATE_COUPON_INELIGIBLE: 'The billing-date grace coupon does not apply to this subscription product.',
    BILLING_DATE_COUPON_MISSING: 'The configured billing-date grace coupon does not exist in Stripe.',
    BILLING_DATE_COUPON_READ_FAILED: 'Stripe could not read the billing-date grace coupon.',
    BILLING_DATE_COUPON_SETUP_FAILED: 'Stripe could not create the managed billing-date grace coupon.',
    BILLING_DATE_SUBSCRIPTION_READ_FAILED: 'Stripe could not load this subscription for the billing-date change.',
    BILLING_DATE_INVOICE_ITEMS_READ_FAILED: 'Stripe could not check this customer for pending invoice items.',
    BILLING_DATE_PENDING_INVOICE_ITEMS: 'This customer has pending Stripe invoice items. Resolve them in Stripe before moving the billing date.',
    BILLING_DATE_CUSTOMER_READ_FAILED: 'Stripe could not check this customer’s invoice balance.',
    BILLING_DATE_CUSTOMER_BALANCE: 'This customer has an owed Stripe balance. Resolve it in Stripe before moving the billing date.',
    BILLING_DATE_SCHEDULE_CREATE_FAILED: 'Stripe could not create the billing-date schedule.',
    BILLING_DATE_SCHEDULE_READ_FAILED: 'Stripe could not read the existing billing-date schedule.',
    BILLING_DATE_SCHEDULE_UPDATE_FAILED: 'Stripe could not configure the billing-date schedule.',
    BILLING_DATE_OPERATION_ID_UNAVAILABLE: 'A secure billing-date operation ID could not be generated. Retry from a supported browser.',
    SCHEDULE_CREATE_OUTCOME_UNKNOWN: 'Stripe may have created a schedule, but its state must be reviewed in Stripe before retrying.',
    SCHEDULE_UPDATE_OUTCOME_UNKNOWN: 'Stripe may still be updating the schedule. Review it in Stripe before retrying.',
    STRIPE_PERMISSIONS_MISSING: 'The Stripe billing key is missing a required Customer, Subscription, Invoice, Invoice Item, Coupon, or Subscription Schedule permission.',
    UNSUPPORTED_SUBSCRIPTION: 'This subscription has billing settings that must be adjusted directly in Stripe.',
    UNSUPPORTED_SCHEDULE: 'Stripe returned a schedule that cannot be safely adjusted here.',
    SCHEDULE_VERIFICATION_FAILED: 'Stripe returned an unexpected schedule. Review the subscription in Stripe before retrying.',
    SCHEDULE_ROLLBACK_FAILED: 'Stripe could not safely roll back a temporary schedule. Review the subscription in Stripe immediately.',
    STRIPE_ERROR: 'Stripe could not complete the billing-date adjustment.',
    GROUP_BILLED: 'This dealership is billed through its dealer group — it has no card subscription of its own.',
    SUB_MISMATCH: 'This customer\'s Stripe subscription doesn\'t match our records — handle it in Stripe.',
    NO_OPEN_INVOICE: 'Their unpaid bill was just settled or written off — refresh billing and look again.',
    INVOICE_ALREADY_PAID: 'Their unpaid bill was just settled or written off — refresh billing and look again.',
    TARGET_OUT_OF_RANGE: 'Pick a date in the next month.',
    SCHEDULE_PRESENT: 'This subscription already has a Stripe schedule. Manage its billing date in Stripe so the existing schedule is preserved.',
    TRIAL_PRESENT: 'This subscription is in or has a trial configuration and cannot be adjusted here.',
  };
  const diagnosticReasons = new Set([
    'STRIPE_ERROR',
    'STRIPE_PERMISSIONS_MISSING',
    'BILLING_DATE_COUPON_MISSING',
    'BILLING_DATE_COUPON_READ_FAILED',
    'BILLING_DATE_COUPON_SETUP_FAILED',
    'BILLING_DATE_SUBSCRIPTION_READ_FAILED',
    'BILLING_DATE_INVOICE_ITEMS_READ_FAILED',
    'BILLING_DATE_PENDING_INVOICE_ITEMS',
    'BILLING_DATE_CUSTOMER_READ_FAILED',
    'BILLING_DATE_CUSTOMER_BALANCE',
    'BILLING_DATE_SCHEDULE_CREATE_FAILED',
    'BILLING_DATE_SCHEDULE_READ_FAILED',
    'BILLING_DATE_SCHEDULE_UPDATE_FAILED',
    'SCHEDULE_CREATE_OUTCOME_UNKNOWN',
    'SCHEDULE_UPDATE_OUTCOME_UNKNOWN',
    'SCHEDULE_VERIFICATION_FAILED',
    'SCHEDULE_ROLLBACK_FAILED',
  ]);
  const diagnostic = typeof err?.serverMessage === 'string' ? err.serverMessage.trim() : '';
  if (diagnosticReasons.has(reason) && diagnostic && diagnostic.toUpperCase() !== reason) {
    return diagnostic;
  }
  return map[reason] || err?.message || 'The adjustment could not be completed.';
}

export function normalizePeople(value) {
  const rows = Array.isArray(value) ? value : value ? [value] : [];
  return rows
    .map((person) => {
      if (typeof person === 'string') {
        return {
          id: '',
          username: '',
          firstName: '',
          lastName: '',
          displayName: '',
          email: text(person),
          phone: '',
          referralCode: '',
          role: '',
        };
      }
      if (!person || typeof person !== 'object') return null;
      const profile = firstObject(person.profile, person.contact);
      const firstName = text(person.firstName ?? person.first_name ?? person.givenName ?? profile?.firstName);
      const lastName = text(person.lastName ?? person.last_name ?? person.familyName ?? profile?.lastName);
      return {
        id: text(person.id ?? person.userId ?? person.user_id),
        username: text(person.username ?? person.handle),
        firstName,
        lastName,
        displayName: text(person.displayName ?? person.display_name ?? person.name) || [firstName, lastName].filter(Boolean).join(' '),
        email: text(person.email ?? profile?.email),
        phone: phoneText(
          person.phone,
          person.phoneNumber,
          person.phone_number,
          person.mobile,
          person.mobilePhone,
          person.mobile_phone,
          profile?.phone,
          profile?.phoneNumber,
          profile?.mobile,
        ),
        referralCode: text(
          person.referralCode
          ?? person.referral_code
          ?? person.inviteCode
          ?? person.invite_code
          ?? profile?.referralCode
          ?? profile?.referral_code,
        ),
        role: text(person.role),
      };
    })
    .filter(Boolean);
}

function personDisplayName(person) {
  if (!person) return '';
  const firstName = text(person.firstName ?? person.first_name ?? person.givenName);
  const lastName = text(person.lastName ?? person.last_name ?? person.familyName);
  return text(person.displayName ?? person.display_name ?? person.name) || [firstName, lastName].filter(Boolean).join(' ');
}

function phoneText(...values) {
  const value = values.find((item) => item !== undefined && item !== null && text(item));
  return text(value);
}

function firstObject(...values) {
  return values.find((value) => value && typeof value === 'object' && !Array.isArray(value)) || null;
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
