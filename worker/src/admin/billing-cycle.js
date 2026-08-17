// Safe, admin-only billing-date realignment for simple monthly subscriptions.
//
// Flexible billing mode intentionally does not reset an anchor when a trial is
// added, and AutoLander treats trialing subscriptions differently from paid
// subscriptions. Instead, this creates a three-phase Stripe schedule:
//   0. the already-paid current period, untouched;
//   1. a short, 100%-discounted bridge to the requested renewal date;
//   2. one normal monthly phase anchored at that requested date, then release.
//
// The guards are deliberately narrow. If a subscription has an existing
// schedule, discounts, multiple items, a cancellation, or special billing
// overrides, an operator must handle it in Stripe rather than risk replacing
// configuration the website cannot safely preserve.

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
// Keep raw Worker requests on the same contract as the Stripe SDK used by the
// AutoLander cloud. New Checkout subscriptions use flexible billing on this
// version, and Stripe only fully supports modifying those subscriptions on
// Basil (2025-06-30) or newer API versions.
const STRIPE_API_VERSION = '2026-02-25.clover';
const DEFAULT_GRACE_COUPON_ID = 'FREE_MONTH_100';
const MAX_SUBSCRIPTION_ID_LENGTH = 200;
const MAX_OPERATION_ID_LENGTH = 64;

function stripeKey(env) {
  // Keep the billing-admin capability separate from the key used by the legacy
  // Checkout-session generator when a restricted key is preferred in production.
  return env.STRIPE_BILLING_ADMIN_KEY || env.STRIPE_SECRET_KEY || env.STRIPE_RESTRICTED_KEY || '';
}

function result(status, body) {
  return { status, body };
}

function text(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function idOf(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof value.id === 'string') return value.id;
  return '';
}

function firstId(...values) {
  for (const value of values) {
    const id = idOf(value);
    if (id) return id;
  }
  return '';
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function activeDiscounts(value) {
  return nonEmptyArray(value) || Boolean(value && !Array.isArray(value));
}

function activeBillingThresholds(value) {
  if (!value) return false;
  if (typeof value !== 'object') return true;
  return (value.amount_gte !== null && value.amount_gte !== undefined)
    || (value.usage_gte !== null && value.usage_gte !== undefined)
    || value.reset_billing_cycle_anchor === true;
}

function billingModeMatches(actual, expected) {
  if (!expected || typeof expected !== 'object') return !actual;
  if (!actual || actual.type !== expected.type) return false;
  const actualProration = actual.flexible?.proration_discounts || '';
  const expectedProration = expected.flexible?.proration_discounts || '';
  return actualProration === expectedProration;
}

export function parseDateOnly(value) {
  const raw = text(value, 20);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year
    || check.getUTCMonth() !== month - 1
    || check.getUTCDate() !== day
  ) return null;
  return { year, month, day, value: raw };
}

function periodEndOf(subscription) {
  const items = Array.isArray(subscription?.items?.data) ? subscription.items.data : [];
  const primary = items.find((item) => Number.isInteger(item?.current_period_end)) || items[0];
  const end = Number.isInteger(subscription?.current_period_end)
    ? subscription.current_period_end
    : primary?.current_period_end;
  const start = Number.isInteger(subscription?.current_period_start)
    ? subscription.current_period_start
    : primary?.current_period_start;
  return {
    start: Number.isInteger(start) ? start : null,
    end: Number.isInteger(end) ? end : null,
    primary,
  };
}

function atExistingUtcTime(date, sourceTimestamp) {
  const source = new Date(sourceTimestamp * 1000);
  return Math.floor(Date.UTC(
    date.year,
    date.month - 1,
    date.day,
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
  ) / 1000);
}

function addUtcMonths(timestamp, months) {
  const source = new Date(timestamp * 1000);
  const targetMonthIndex = source.getUTCMonth() + months;
  const targetYear = source.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return Math.floor(Date.UTC(
    targetYear,
    targetMonth,
    Math.min(source.getUTCDate(), lastDay),
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
  ) / 1000);
}

function iso(timestamp) {
  return Number.isInteger(timestamp) ? new Date(timestamp * 1000).toISOString() : null;
}

function utcDateOnly(timestamp) {
  return Number.isInteger(timestamp) ? new Date(timestamp * 1000).toISOString().slice(0, 10) : null;
}

function nextUtcDateOnly(timestamp) {
  if (!Number.isInteger(timestamp)) return null;
  const source = new Date(timestamp * 1000);
  return new Date(Date.UTC(
    source.getUTCFullYear(),
    source.getUTCMonth(),
    source.getUTCDate() + 1,
  )).toISOString().slice(0, 10);
}

export function normalizeSubscriptionId(value) {
  const id = text(value, MAX_SUBSCRIPTION_ID_LENGTH);
  return /^sub_[A-Za-z0-9]+$/.test(id) ? id : '';
}

function normalizeOperationId(value) {
  const id = text(value, MAX_OPERATION_ID_LENGTH + 1);
  return /^[A-Za-z0-9_-]{8,64}$/.test(id) ? id : '';
}

function newOperationId() {
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

function errorBody(reason, message, details = {}) {
  return { ok: false, reason, message, ...details };
}

function stripeError(
  response,
  fallback = 'Stripe could not update this subscription.',
  { reason = 'stripe_error', stage = '' } = {},
) {
  const stripeMessage = text(response?.body?.error?.message, 500);
  const status = Number(response?.status);
  const permissionDenied = status === 401 || status === 403;
  const message = permissionDenied
      ? `Stripe denied the billing ${stage || 'adjustment'} request. Configure STRIPE_BILLING_ADMIN_KEY with Customer, Subscription, Invoice, and Invoice Item read access plus Coupon and Subscription Schedule read/write access.${stripeMessage ? ` ${stripeMessage}` : ''}`
    : stripeMessage || fallback;
  const details = {
    ...(stage ? { stage } : {}),
    ...(text(response?.body?.error?.code, 100) ? { code: text(response.body.error.code, 100) } : {}),
    ...(text(response?.body?.error?.param, 200) ? { param: text(response.body.error.param, 200) } : {}),
    ...(text(response?.requestId, 200) ? { requestId: text(response.requestId, 200) } : {}),
  };
  return result(
    Number.isInteger(status) && status >= 400 && status < 500 ? status : 502,
    errorBody(permissionDenied ? 'stripe_permissions_missing' : reason, message, details),
  );
}

async function stripeRequest(key, path, { method = 'GET', form, idempotencyKey } = {}) {
  const headers = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Stripe-Version': STRIPE_API_VERSION,
  };
  if (form) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  try {
    const response = await fetch(`${STRIPE_API_BASE}${path}`, {
      method,
      headers,
      body: form ? form.toString() : undefined,
    });
    const body = await response.json().catch(() => ({}));
    const shouldRetryHeader = response.headers?.get?.('stripe-should-retry') || '';
    const retryable = shouldRetryHeader === 'false'
      ? false
      : shouldRetryHeader === 'true'
        || response.status === 409
        || response.status >= 500
        || body?.error?.code === 'idempotency_key_in_use';
    return {
      ok: response.ok,
      status: response.status,
      body,
      requestId: response.headers?.get?.('request-id') || '',
      // A 5xx can be returned after Stripe began executing a mutation. Reusing
      // the same idempotency key is the only safe way to resolve that outcome.
      retryable,
      // Retry guidance and outcome certainty are different: Stripe can tell a
      // client not to retry a 5xx automatically even though a mutation may have
      // begun and still needs read-after-write reconciliation.
      indeterminate: response.status === 409
        || response.status >= 500
        || body?.error?.code === 'idempotency_key_in_use',
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      body: { error: { message: String(err?.message || err).slice(0, 500) } },
      retryable: true,
      indeterminate: true,
    };
  }
}

async function idempotentMutation(run) {
  let response = await run();
  if (response.retryable) response = await run();
  return response;
}

function unsupportedSubscriptionReason(subscription, item) {
  if (subscription?.status !== 'active') {
    return 'Only active subscriptions can have a billing date adjusted.';
  }
  if (subscription?.schedule) {
    return 'This subscription already has a Stripe schedule. Manage its billing date in Stripe so the existing schedule is preserved.';
  }
  if (subscription?.cancel_at_period_end || subscription?.cancel_at) {
    return 'This subscription is scheduled to cancel and cannot have its billing date adjusted here.';
  }
  if (subscription?.trial_end || subscription?.trial_start) {
    return 'This subscription is in or has a trial configuration and cannot be adjusted here.';
  }
  if (subscription?.pending_update || subscription?.pause_collection) {
    return 'This subscription has a pending update or pause and cannot be adjusted here.';
  }
  if (activeBillingThresholds(subscription?.billing_thresholds) || subscription?.pending_invoice_item_interval) {
    return 'This subscription has custom billing thresholds and cannot be adjusted here.';
  }
  if (subscription?.application_fee_percent || subscription?.transfer_data || subscription?.on_behalf_of) {
    return 'This subscription has special payment routing and cannot be adjusted here.';
  }
  if (subscription?.collection_method && subscription.collection_method !== 'charge_automatically') {
    return 'Only automatically charged subscriptions can have a billing date adjusted here.';
  }
  if (nonEmptyArray(subscription?.default_tax_rates) || activeDiscounts(subscription?.discounts) || subscription?.discount) {
    return 'This subscription has custom tax rates or discounts and cannot be adjusted here.';
  }
  if (!item || item.deleted) {
    return 'This subscription does not have an active recurring item.';
  }
  if (activeDiscounts(item.discounts) || activeBillingThresholds(item.billing_thresholds) || nonEmptyArray(item.tax_rates)) {
    return 'This subscription item has custom discounts, taxes, or thresholds and cannot be adjusted here.';
  }
  const recurring = item.price?.recurring;
  if (recurring?.interval !== 'month' || Number(recurring?.interval_count || 1) !== 1) {
    return 'Only simple one-month subscriptions can have a billing date adjusted here.';
  }
  if (
    (recurring.usage_type && recurring.usage_type !== 'licensed')
    || recurring.meter
    || (item.price?.billing_scheme && item.price.billing_scheme !== 'per_unit')
    || item.price?.tiers_mode
    || item.price?.transform_quantity
    || item.price?.custom_unit_amount
    || !Number.isInteger(item.price?.unit_amount)
    || item.price.unit_amount < 0
  ) {
    return 'Metered, tiered, transformed, or custom-amount prices cannot have their billing date adjusted here.';
  }
  if (
    !idOf(item.price)
    || !text(item.price?.currency, 20)
    || !Number.isInteger(Number(item.quantity || 1))
    || Number(item.quantity || 1) < 1
  ) {
    return 'This subscription item is not in a supported state.';
  }
  return '';
}

function unsupportedScheduleReason(schedule, subscription, period) {
  if (!schedule?.id || schedule.status !== 'active') {
    return 'Stripe did not create an active schedule for this subscription.';
  }
  const phases = Array.isArray(schedule.phases) ? schedule.phases : [];
  if (phases.length !== 1) {
    return 'Stripe returned an unexpected existing schedule shape.';
  }
  const phase = phases[0];
  const phaseItems = Array.isArray(phase?.items) ? phase.items : [];
  const item = phaseItems[0];
  const phasePriceId = idOf(item?.price);
  const subscriptionPriceId = idOf(period.primary?.price);
  if (
    !Number.isInteger(phase?.start_date)
    || phase.start_date !== period.start
    || phase.end_date !== period.end
    || schedule.current_phase?.start_date !== period.start
    || schedule.current_phase?.end_date !== period.end
    || phaseItems.length !== 1
    || phasePriceId !== subscriptionPriceId
    || Number(item.quantity || 1) !== Number(period.primary?.quantity || 1)
  ) {
    return 'Stripe returned a schedule that does not exactly mirror the current subscription period.';
  }
  if (
    phase.trial_end
    || activeDiscounts(phase.discounts)
    || activeDiscounts(item?.discounts)
    || nonEmptyArray(phase.add_invoice_items)
    || activeBillingThresholds(phase.billing_thresholds)
    || activeBillingThresholds(item?.billing_thresholds)
    || nonEmptyArray(phase.default_tax_rates)
    || nonEmptyArray(item?.tax_rates)
    || phase.application_fee_percent
    || phase.transfer_data
    || phase.on_behalf_of
    || phase.invoice_settings?.days_until_due
  ) {
    return 'Stripe returned a schedule with unsupported phase overrides.';
  }
  const defaults = schedule.default_settings || {};
  if (
    defaults.application_fee_percent
    || defaults.transfer_data
    || defaults.on_behalf_of
    || activeBillingThresholds(defaults.billing_thresholds)
    || nonEmptyArray(defaults.default_tax_rates)
    || defaults.invoice_settings?.days_until_due
    || defaults.default_source
    || (defaults.collection_method && defaults.collection_method !== 'charge_automatically')
  ) {
    return 'This subscription has schedule-level billing overrides that cannot be safely preserved here.';
  }
  if (schedule.subscription && idOf(schedule.subscription) && idOf(schedule.subscription) !== subscription.id) {
    return 'Stripe returned a schedule for a different subscription.';
  }
  if (schedule.renewal_interval) {
    return 'Stripe returned a schedule with a renewal interval that cannot be safely replaced.';
  }
  if (!billingModeMatches(schedule.billing_mode, subscription?.billing_mode)) {
    return 'Stripe created a schedule with a different billing mode than the subscription.';
  }
  const settings = billingSettings(null, subscription);
  if (
    !phaseSettingsMatch({}, defaults, settings)
    || !phaseSettingsMatch(phase, defaults, settings)
  ) {
    return 'Stripe created a schedule whose billing settings do not exactly mirror the subscription.';
  }
  if (
    !metadataEmptyOrMatches(phase.metadata, subscription?.metadata)
    || !metadataEmptyOrMatches(item?.metadata, period.primary?.metadata)
  ) {
    return 'Stripe created a schedule whose metadata does not exactly mirror the subscription.';
  }
  return '';
}

function appendMetadata(params, prefix, metadata) {
  if (!metadata || typeof metadata !== 'object') return;
  for (const [key, value] of Object.entries(metadata)) {
    const safeKey = text(key, 40);
    const safeValue = text(value, 500);
    if (!safeKey || !safeValue) continue;
    params.append(`${prefix}[${safeKey}]`, safeValue);
  }
}

function appendAutomaticTax(params, prefix, automaticTax) {
  if (!automaticTax || typeof automaticTax.enabled !== 'boolean') return;
  params.append(`${prefix}[automatic_tax][enabled]`, String(automaticTax.enabled));

  const liability = automaticTax.liability;
  if (!liability || !['account', 'self'].includes(liability.type)) return;
  params.append(`${prefix}[automatic_tax][liability][type]`, liability.type);
  const accountId = idOf(liability.account);
  if (liability.type === 'account' && accountId) {
    params.append(`${prefix}[automatic_tax][liability][account]`, accountId);
  }
}

function appendInvoiceSettings(params, prefix, invoiceSettings) {
  if (!invoiceSettings || typeof invoiceSettings !== 'object') return;
  const accountTaxIds = Array.isArray(invoiceSettings.account_tax_ids)
    ? invoiceSettings.account_tax_ids.map(idOf).filter(Boolean)
    : [];
  accountTaxIds.forEach((taxId, index) => {
    params.append(`${prefix}[invoice_settings][account_tax_ids][${index}]`, taxId);
  });

  const issuer = invoiceSettings.issuer;
  if (!issuer || !['account', 'self'].includes(issuer.type)) return;
  params.append(`${prefix}[invoice_settings][issuer][type]`, issuer.type);
  const accountId = idOf(issuer.account);
  if (issuer.type === 'account' && accountId) {
    params.append(`${prefix}[invoice_settings][issuer][account]`, accountId);
  }
}

function billingSettings(schedule, subscription) {
  const phase = schedule?.phases?.[0] || {};
  const defaults = schedule?.default_settings || {};
  const collectionMethod = phase.collection_method
    || defaults.collection_method
    || subscription?.collection_method;
  const description = phase.description ?? defaults.description ?? subscription?.description;
  return {
    automaticTax: phase.automatic_tax || defaults.automatic_tax || subscription?.automatic_tax,
    collectionMethod,
    defaultPaymentMethod: firstId(
      phase.default_payment_method,
      defaults.default_payment_method,
      subscription?.default_payment_method,
    ),
    description: typeof description === 'string' ? description : '',
    invoiceSettings: phase.invoice_settings || defaults.invoice_settings || subscription?.invoice_settings,
  };
}

function appendBillingSettings(params, prefix, settings) {
  appendAutomaticTax(params, prefix, settings?.automaticTax);
  if (settings?.collectionMethod === 'charge_automatically') {
    params.append(`${prefix}[collection_method]`, settings.collectionMethod);
  }
  if (settings?.defaultPaymentMethod) {
    params.append(`${prefix}[default_payment_method]`, settings.defaultPaymentMethod);
  }
  if (settings?.description) {
    params.append(`${prefix}[description]`, text(settings.description, 500));
  }
  appendInvoiceSettings(params, prefix, settings?.invoiceSettings);
}

function appendPhase(params, index, {
  start,
  end,
  item,
  metadata,
  discountCouponId: couponId,
  anchor,
  settings,
  prorationBehavior = 'none',
}) {
  const prefix = `phases[${index}]`;
  params.append(`${prefix}[start_date]`, String(start));
  if (Number.isInteger(end)) params.append(`${prefix}[end_date]`, String(end));
  params.append(`${prefix}[items][0][price]`, idOf(item.price));
  params.append(`${prefix}[items][0][quantity]`, String(Number(item.quantity || 1)));
  params.append(`${prefix}[proration_behavior]`, prorationBehavior);
  if (anchor) params.append(`${prefix}[billing_cycle_anchor]`, anchor);
  appendBillingSettings(params, prefix, settings);
  appendMetadata(params, `${prefix}[metadata]`, metadata);
  appendMetadata(params, `${prefix}[items][0][metadata]`, item.metadata);
  if (couponId) {
    params.append(`${prefix}[discounts][0][coupon]`, couponId);
  }
}

function scheduleUpdateForm({
  schedule,
  subscription,
  period,
  target,
  fullPeriodEnd,
  couponId,
  operationId,
}) {
  const phase = schedule.phases[0];
  const phaseAnchor = ['automatic', 'phase_start'].includes(phase?.billing_cycle_anchor)
    ? phase.billing_cycle_anchor
    : 'automatic';
  // The just-read subscription is the trusted metadata source. Stripe can
  // return an empty phase metadata object for a from_subscription schedule, but
  // phase metadata must never be allowed to override org/user webhook keys.
  const phaseMetadata = subscription?.metadata && typeof subscription.metadata === 'object'
    ? subscription.metadata
    : {};
  const item = period.primary;
  const settings = billingSettings(null, subscription);
  const params = new URLSearchParams();
  params.append('end_behavior', 'release');
  params.append('metadata[autolander_billing_date_operation]', operationId);
  params.append('metadata[autolander_billing_date_target]', String(target));
  params.append('metadata[autolander_billing_date_coupon]', couponId);
  // This applies to modifying the current phase. Each future phase also carries
  // `none`, so no surprise prorations are created at either transition.
  params.append('proration_behavior', 'none');
  appendBillingSettings(params, 'default_settings', settings);

  // P0: paid period exactly as Stripe returned it. Discounts are deliberately
  // omitted here and on P2 so a Customer-level discount keeps inheriting. An
  // empty discounts field would silently suppress that Customer discount.
  appendPhase(params, 0, {
    start: phase.start_date,
    end: period.end,
    item,
    metadata: phaseMetadata,
    anchor: phaseAnchor,
    settings,
  });
  // P1: a short active bridge from the normal renewal to the selected day. The
  // one-time 100% coupon waives its invoice without changing account access.
  appendPhase(params, 1, {
    start: period.end,
    end: target,
    item,
    metadata: phaseMetadata,
    discountCouponId: couponId,
    anchor: 'automatic',
    settings,
  });
  // P2: one normal monthly phase. `phase_start` deliberately changes the anchor
  // even for flexible-mode subscriptions; release then leaves the subscription
  // recurring normally on its new day.
  appendPhase(params, 2, {
    start: target,
    end: fullPeriodEnd,
    item,
    metadata: phaseMetadata,
    anchor: 'phase_start',
    settings,
  });
  return params;
}

function discountCouponId(discount) {
  return firstId(
    discount?.coupon,
    discount?.source?.coupon,
    discount?.discount?.coupon,
    discount?.discount?.source?.coupon,
  );
}

function discountIdentity(discount) {
  if (typeof discount === 'string') return `id:${discount}`;
  const couponId = discountCouponId(discount);
  if (couponId) return `coupon:${couponId}`;
  const promotionCodeId = firstId(
    discount?.promotion_code,
    discount?.source?.promotion_code,
    discount?.discount?.promotion_code,
  );
  if (promotionCodeId) return `promotion:${promotionCodeId}`;
  const reusedDiscountId = firstId(discount?.discount, discount?.id);
  return reusedDiscountId ? `discount:${reusedDiscountId}` : '';
}

function discountConfiguration(discounts) {
  if (discounts === null || discounts === undefined) return [];
  if (!Array.isArray(discounts)) return null;
  const identities = discounts.map(discountIdentity);
  if (identities.some((identity) => !identity)) return null;
  return identities.sort();
}

function sameDiscountConfiguration(actual, expected) {
  const actualIds = discountConfiguration(actual);
  const expectedIds = discountConfiguration(expected);
  return Boolean(
    actualIds
    && expectedIds
    && actualIds.length === expectedIds.length
    && actualIds.every((value, index) => value === expectedIds[index])
  );
}

function normalizedMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return [];
  return Object.entries(metadata)
    .map(([key, value]) => [text(key, 40), text(value, 500)])
    .filter(([key, value]) => key && value)
    .sort(([left], [right]) => left.localeCompare(right));
}

function metadataMatches(actual, expected) {
  const actualEntries = normalizedMetadata(actual);
  const expectedEntries = normalizedMetadata(expected);
  return actualEntries.length === expectedEntries.length
    && actualEntries.every(([key, value], index) => (
      key === expectedEntries[index][0] && value === expectedEntries[index][1]
    ));
}

function metadataEmptyOrMatches(actual, expected) {
  return normalizedMetadata(actual).length === 0 || metadataMatches(actual, expected);
}

function effectiveSetting(phase, defaults, field) {
  const phaseValue = phase?.[field];
  return phaseValue === null || phaseValue === undefined ? defaults?.[field] : phaseValue;
}

function automaticTaxMatches(actual, expected) {
  if (!expected || typeof expected.enabled !== 'boolean') {
    return !actual || (
      actual.enabled !== true
      && (!actual.liability || actual.liability.type === 'self')
    );
  }
  if (!actual || actual.enabled !== expected.enabled) return false;
  const expectedLiability = expected.liability;
  if (!expectedLiability?.type) {
    return !actual.liability || actual.liability.type === 'self';
  }
  if (actual.liability?.type !== expectedLiability.type) return false;
  if (expectedLiability.type !== 'account') return true;
  return idOf(actual.liability?.account) === idOf(expectedLiability.account);
}

function invoiceSettingsMatch(actual, expected) {
  const expectedTaxIds = Array.isArray(expected?.account_tax_ids)
    ? expected.account_tax_ids.map(idOf).filter(Boolean).sort()
    : [];
  const actualTaxIds = Array.isArray(actual?.account_tax_ids)
    ? actual.account_tax_ids.map(idOf).filter(Boolean).sort()
    : [];
  if (
    actualTaxIds.length !== expectedTaxIds.length
    || actualTaxIds.some((value, index) => value !== expectedTaxIds[index])
  ) return false;

  const expectedIssuer = expected?.issuer;
  if (!expectedIssuer?.type) return !actual?.issuer || actual.issuer.type === 'self';
  if (actual?.issuer?.type !== expectedIssuer.type) return false;
  if (expectedIssuer.type !== 'account') return true;
  return idOf(actual.issuer?.account) === idOf(expectedIssuer.account);
}

function phaseSettingsMatch(phase, defaults, settings) {
  const actualAutomaticTax = effectiveSetting(phase, defaults, 'automatic_tax');
  const actualCollectionMethod = effectiveSetting(phase, defaults, 'collection_method') || '';
  const actualPaymentMethod = idOf(effectiveSetting(phase, defaults, 'default_payment_method'));
  const actualDescription = effectiveSetting(phase, defaults, 'description') || '';
  const actualInvoiceSettings = effectiveSetting(phase, defaults, 'invoice_settings');
  return Boolean(
    automaticTaxMatches(actualAutomaticTax, settings?.automaticTax)
    && actualCollectionMethod === (settings?.collectionMethod || '')
    && actualPaymentMethod === (settings?.defaultPaymentMethod || '')
    && actualDescription === (settings?.description || '')
    && invoiceSettingsMatch(actualInvoiceSettings, settings?.invoiceSettings)
  );
}

function phaseItemMatches(phase, expectedItem) {
  const items = Array.isArray(phase?.items) ? phase.items : [];
  if (items.length !== 1) return false;
  const actual = items[0];
  return Boolean(
    firstId(actual?.price, actual?.plan) === idOf(expectedItem?.price)
    && Number(actual?.quantity || 1) === Number(expectedItem?.quantity || 1)
    && metadataMatches(actual?.metadata, expectedItem?.metadata)
    && !activeBillingThresholds(actual?.billing_thresholds)
    && !activeDiscounts(actual?.discounts)
    && !nonEmptyArray(actual?.tax_rates)
  );
}

function hasUnexpectedRouting(value) {
  return value !== null && value !== undefined && value !== '';
}

function phaseHasUnexpectedBillingOverrides(phase) {
  return Boolean(
    nonEmptyArray(phase?.add_invoice_items)
    || phase?.trial === true
    || hasUnexpectedRouting(phase?.trial_end)
    || hasUnexpectedRouting(phase?.application_fee_percent)
    || hasUnexpectedRouting(phase?.transfer_data)
    || hasUnexpectedRouting(phase?.on_behalf_of)
    || activeBillingThresholds(phase?.billing_thresholds)
    || nonEmptyArray(phase?.default_tax_rates)
    || hasUnexpectedRouting(phase?.invoice_settings?.days_until_due)
  );
}

function defaultsHaveUnexpectedBillingOverrides(defaults) {
  return Boolean(
    hasUnexpectedRouting(defaults?.application_fee_percent)
    || hasUnexpectedRouting(defaults?.transfer_data)
    || hasUnexpectedRouting(defaults?.on_behalf_of)
    || activeBillingThresholds(defaults?.billing_thresholds)
    || nonEmptyArray(defaults?.default_tax_rates)
    || hasUnexpectedRouting(defaults?.default_source)
    || hasUnexpectedRouting(defaults?.invoice_settings?.days_until_due)
  );
}

function updatedScheduleMatches(
  schedule,
  {
    sourceSchedule,
    subscription,
    period,
    target,
    fullPeriodEnd,
    couponId,
    operationId,
  },
) {
  const phases = Array.isArray(schedule?.phases) ? schedule.phases : [];
  const paid = phases[0];
  const bridge = phases[1];
  const renewal = phases[2];
  const originalPhase = sourceSchedule?.phases?.[0] || {};
  const phaseAnchor = ['automatic', 'phase_start'].includes(originalPhase.billing_cycle_anchor)
    ? originalPhase.billing_cycle_anchor
    : 'automatic';
  const phaseMetadata = subscription?.metadata && typeof subscription.metadata === 'object'
    ? subscription.metadata
    : {};
  const defaults = schedule?.default_settings || {};
  const settings = billingSettings(null, subscription);
  const bridgeDiscounts = discountConfiguration(bridge?.discounts);
  return Boolean(
    schedule?.status === 'active'
    && schedule?.id === sourceSchedule?.id
    && billingModeMatches(schedule?.billing_mode, subscription?.billing_mode)
    && phases.length === 3
    && idOf(schedule?.subscription) === subscription?.id
    && schedule?.metadata?.autolander_billing_date_operation === operationId
    && String(schedule?.metadata?.autolander_billing_date_target || '') === String(target)
    && schedule?.metadata?.autolander_billing_date_coupon === couponId
    && schedule?.current_phase?.start_date === period.start
    && schedule?.current_phase?.end_date === period.end
    && originalPhase.start_date === period.start
    && paid?.start_date === originalPhase.start_date
    && paid?.end_date === period.end
    && paid?.billing_cycle_anchor === phaseAnchor
    && bridge?.start_date === period.end
    && bridge?.end_date === target
    && bridge?.billing_cycle_anchor === 'automatic'
    && bridgeDiscounts?.length === 1
    && bridgeDiscounts[0] === `coupon:${couponId}`
    && renewal?.start_date === target
    && renewal?.end_date === fullPeriodEnd
    && renewal?.billing_cycle_anchor === 'phase_start'
    && schedule?.end_behavior === 'release'
    && !schedule?.renewal_interval
    && !defaultsHaveUnexpectedBillingOverrides(defaults)
    && phaseSettingsMatch({}, defaults, settings)
    && phases.every((phase) => !phaseHasUnexpectedBillingOverrides(phase))
    && phases.every((phase) => phase?.proration_behavior === 'none')
    && phases.every((phase) => phaseItemMatches(phase, period.primary))
    && phases.every((phase) => metadataMatches(phase?.metadata, phaseMetadata))
    && sameDiscountConfiguration(paid?.discounts, originalPhase?.discounts)
    && sameDiscountConfiguration(renewal?.discounts, originalPhase?.discounts)
    && phases.every((phase) => phaseSettingsMatch(phase, defaults, settings))
  );
}

function managedBillingScheduleMatches(
  schedule,
  { subscription, period, target, fullPeriodEnd, couponId, operationId },
) {
  const phases = Array.isArray(schedule?.phases) ? schedule.phases : [];
  const paid = phases[0];
  const bridge = phases[1];
  const renewal = phases[2];
  const defaults = schedule?.default_settings || {};
  const settings = billingSettings(null, subscription);
  const expectedMetadata = subscription?.metadata && typeof subscription.metadata === 'object'
    ? subscription.metadata
    : {};
  const bridgeDiscounts = discountConfiguration(bridge?.discounts);
  const currentPhaseMatchesSubscription = (
    schedule?.current_phase?.start_date === period.start
    && schedule?.current_phase?.end_date === period.end
  );
  const currentPhaseIsBeforeMovedCharge = [paid, bridge].some((phase) => (
    schedule?.current_phase?.start_date === phase?.start_date
    && schedule?.current_phase?.end_date === phase?.end_date
  ));

  return Boolean(
    schedule?.status === 'active'
    && idOf(schedule?.subscription) === subscription?.id
    && billingModeMatches(schedule?.billing_mode, subscription?.billing_mode)
    && phases.length === 3
    && schedule?.metadata?.autolander_billing_date_operation === operationId
    && String(schedule?.metadata?.autolander_billing_date_target || '') === String(target)
    && schedule?.metadata?.autolander_billing_date_coupon === couponId
    && Number.isInteger(paid?.start_date)
    && paid.end_date === bridge?.start_date
    && target > paid.end_date
    && target <= addUtcMonths(paid.end_date, 1)
    && bridge?.end_date === target
    && bridge?.billing_cycle_anchor === 'automatic'
    && renewal?.start_date === target
    && renewal?.end_date === fullPeriodEnd
    && renewal?.billing_cycle_anchor === 'phase_start'
    && ['automatic', 'phase_start'].includes(paid?.billing_cycle_anchor)
    && currentPhaseMatchesSubscription
    && currentPhaseIsBeforeMovedCharge
    && schedule?.end_behavior === 'release'
    && !schedule?.renewal_interval
    && !defaultsHaveUnexpectedBillingOverrides(defaults)
    && phaseSettingsMatch({}, defaults, settings)
    && phases.every((phase) => !phaseHasUnexpectedBillingOverrides(phase))
    && phases.every((phase) => phase?.proration_behavior === 'none')
    && phases.every((phase) => phaseItemMatches(phase, period.primary))
    && phases.every((phase) => metadataMatches(phase?.metadata, expectedMetadata))
    && sameDiscountConfiguration(paid?.discounts, [])
    && bridgeDiscounts?.length === 1
    && bridgeDiscounts[0] === `coupon:${couponId}`
    && sameDiscountConfiguration(renewal?.discounts, [])
    && phases.every((phase) => phaseSettingsMatch(phase, defaults, settings))
  );
}

async function readManagedBillingSchedule(key, subscription, period, couponId) {
  const scheduleId = idOf(subscription?.schedule);
  if (!scheduleId) return { managed: null, error: null };
  const read = await stripeRequest(
    key,
    `/subscription_schedules/${encodeURIComponent(scheduleId)}`,
  );
  if (!read.ok) {
    return {
      managed: null,
      error: stripeError(read, 'Stripe could not retrieve the existing billing-date schedule.', {
        reason: 'billing_date_schedule_read_failed',
        stage: 'existing schedule read',
      }),
    };
  }

  const schedule = read.body;
  const operationId = normalizeOperationId(
    schedule?.metadata?.autolander_billing_date_operation,
  );
  const target = Number(schedule?.metadata?.autolander_billing_date_target);
  if (!operationId || !Number.isInteger(target) || !couponId) {
    return { managed: null, error: null };
  }
  const fullPeriodEnd = addUtcMonths(target, 1);
  if (!managedBillingScheduleMatches(schedule, {
    subscription,
    period,
    target,
    fullPeriodEnd,
    couponId,
    operationId,
  })) {
    return { managed: null, error: null };
  }

  return {
    managed: { schedule, target, fullPeriodEnd },
    error: null,
  };
}

function validGraceCoupon(coupon, bridgeStartsAt) {
  const redeemBy = Number(coupon?.redeem_by);
  const hasRedeemBy = coupon?.redeem_by !== null
    && coupon?.redeem_by !== undefined
    && Number.isFinite(redeemBy);
  return Boolean(
    coupon?.valid
    && Number(coupon.percent_off) === 100
    && coupon.duration === 'once'
    && (coupon.max_redemptions === null || coupon.max_redemptions === undefined)
    && (!hasRedeemBy || redeemBy > bridgeStartsAt)
  );
}

async function ensureGraceCoupon(key, couponId, { provisionDefault }) {
  let read = await stripeRequest(key, `/coupons/${encodeURIComponent(couponId)}`);
  if (read.ok) return { coupon: read.body, error: null };

  if (read.status !== 404) {
    return {
      coupon: null,
      error: stripeError(
        read,
        'Stripe could not retrieve the configured billing-date grace coupon.',
        { reason: 'billing_date_coupon_read_failed', stage: 'coupon read' },
      ),
    };
  }

  if (!provisionDefault) {
    return {
      coupon: null,
      error: result(503, errorBody(
        'billing_date_coupon_missing',
        `Stripe coupon ${couponId} does not exist. Create a 100%-off, one-time coupon with that ID or unset BILLING_DATE_GRACE_COUPON_ID to use the managed default.`,
      )),
    };
  }

  const form = new URLSearchParams({
    id: couponId,
    percent_off: '100',
    duration: 'once',
    // Stripe caps Coupon.name at 40 characters on the pinned Clover version.
    name: 'One Free Month (100% off next invoice)',
  });
  const created = await idempotentMutation(() => stripeRequest(key, '/coupons', {
    method: 'POST',
    form,
    idempotencyKey: `billing-date-coupon:${couponId}:create:v2`,
  }));
  if (created.ok) return { coupon: created.body, error: null };

  // A concurrent request can create the deterministic coupon between our GET
  // and POST. Re-read once before surfacing the create error.
  if (created.status === 400 && created.body?.error?.code === 'resource_already_exists') {
    read = await stripeRequest(key, `/coupons/${encodeURIComponent(couponId)}`);
    if (read.ok) return { coupon: read.body, error: null };
  }

  return {
    coupon: null,
    error: stripeError(
      created,
      'Stripe could not create the managed billing-date grace coupon.',
      { reason: 'billing_date_coupon_setup_failed', stage: 'coupon setup' },
    ),
  };
}

async function createBillingSchedule(key, subscriptionId, operationKey) {
  const idempotencyKey = `${operationKey}:create:v3`;
  const run = () => stripeRequest(key, '/subscription_schedules', {
    method: 'POST',
    form: new URLSearchParams({ from_subscription: subscriptionId }),
    idempotencyKey,
  });
  let response = await run();
  if (response.retryable || (response.ok && !idOf(response.body))) {
    response = await run();
  }
  if (response.ok && !idOf(response.body)) {
    return {
      ...response,
      ok: false,
      status: 502,
      indeterminate: true,
      body: { error: { message: 'Stripe returned an incomplete schedule-create response.' } },
    };
  }
  return response;
}

async function indeterminateScheduleCreateResult(key, subscriptionId, originalResponse) {
  const subscriptionRead = await stripeRequest(
    key,
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
  const scheduleId = subscriptionRead.ok ? idOf(subscriptionRead.body?.schedule) : '';
  const stripeMessage = text(originalResponse?.body?.error?.message, 300);
  return result(502, errorBody(
    'schedule_create_outcome_unknown',
    scheduleId
      ? `Stripe attached schedule ${scheduleId}, but the create response was interrupted. Review it in Stripe before retrying; it was not modified further.`
      : `Stripe did not return a definitive schedule-create response${stripeMessage ? `: ${stripeMessage}` : '.'} Wait for the request to settle and review the subscription in Stripe before retrying.`,
    {
      ...(scheduleId ? { scheduleId } : {}),
      ...(text(originalResponse?.requestId, 200) ? { requestId: text(originalResponse.requestId, 200) } : {}),
      stage: 'schedule creation recovery',
    },
  ));
}

async function releaseSchedule(key, scheduleId, idempotencyKey) {
  if (!scheduleId) return false;
  const response = await idempotentMutation(() => stripeRequest(
    key,
    `/subscription_schedules/${encodeURIComponent(scheduleId)}/release`,
    {
    method: 'POST',
    form: new URLSearchParams(),
    idempotencyKey,
    },
  ));
  if (
    response.ok
    && idOf(response.body) === scheduleId
    && response.body?.status === 'released'
  ) return true;
  if (!response.ok && !response.indeterminate) return false;
  const read = await stripeRequest(
    key,
    `/subscription_schedules/${encodeURIComponent(scheduleId)}`,
  );
  return Boolean(
    read.ok
    && idOf(read.body) === scheduleId
    && read.body?.status === 'released'
  );
}

function billingAmount(item) {
  const unitAmount = Number(item?.price?.unit_amount);
  const quantity = Number(item?.quantity || 1);
  return Number.isFinite(unitAmount) && Number.isFinite(quantity) ? unitAmount * quantity : 0;
}

function billingCurrency(item) {
  return text(item?.price?.currency, 20).toLowerCase();
}

async function readOpenBillingInvoices(key, subscriptionId) {
  const read = await stripeRequest(
    key,
    `/invoices?subscription=${encodeURIComponent(subscriptionId)}&status=open&limit=10`,
  );
  if (!read.ok) {
    return {
      error: stripeError(read, 'Stripe could not retrieve this subscription\'s unpaid bills.'),
      openInvoices: [],
    };
  }

  const invoices = Array.isArray(read.body?.data) ? read.body.data : [];
  return {
    error: null,
    openInvoices: [...invoices]
      .sort((left, right) => Number(right?.created || 0) - Number(left?.created || 0))
      .map((invoice) => ({
        id: idOf(invoice),
        totalCents: Number.isInteger(invoice?.total) ? invoice.total : Number(invoice?.total || 0),
        createdAt: Number.isInteger(invoice?.created) ? invoice.created : null,
        createdIso: iso(invoice?.created),
      })),
  };
}

async function readPendingInvoiceItems(key, customerId) {
  const read = await stripeRequest(
    key,
    `/invoiceitems?customer=${encodeURIComponent(customerId)}&pending=true&limit=100`,
  );
  if (!read.ok) {
    return {
      error: stripeError(
        read,
        'Stripe could not check this customer for pending invoice items.',
        {
          reason: 'billing_date_invoice_items_read_failed',
          stage: 'pending invoice item read',
        },
      ),
      pendingItems: [],
    };
  }
  if (!Array.isArray(read.body?.data)) {
    return {
      error: result(502, errorBody(
        'billing_date_invoice_items_read_failed',
        'Stripe returned an unexpected pending-invoice-item response. The billing-date state could not be verified safely.',
        { stage: 'pending invoice item read' },
      )),
      pendingItems: [],
    };
  }
  return { error: null, pendingItems: read.body.data };
}

async function readCustomerOwedBalance(key, customerId, currency) {
  const read = await stripeRequest(
    key,
    `/customers/${encodeURIComponent(customerId)}?expand%5B%5D=invoice_credit_balance`,
  );
  if (!read.ok) {
    return {
      error: stripeError(
        read,
        'Stripe could not check this customer\'s invoice balance.',
        {
          reason: 'billing_date_customer_read_failed',
          stage: 'customer balance read',
        },
      ),
      hasOwedBalance: false,
    };
  }

  const customer = read.body;
  const legacyBalance = Number(customer?.balance);
  const creditBalances = customer?.invoice_credit_balance;
  const currencyBalance = Number(
    creditBalances && typeof creditBalances === 'object' ? creditBalances[currency] || 0 : 0,
  );
  if (
    idOf(customer) !== customerId
    || !Number.isInteger(legacyBalance)
    || (creditBalances !== null
      && creditBalances !== undefined
      && typeof creditBalances !== 'object')
    || !Number.isInteger(currencyBalance)
  ) {
    return {
      error: result(502, errorBody(
        'billing_date_customer_read_failed',
        'Stripe returned an unexpected customer-balance response. The billing-date state could not be verified safely.',
        { stage: 'customer balance read' },
      )),
      hasOwedBalance: false,
    };
  }

  return {
    error: null,
    // Legacy balance uses positive=owed. Clover's multi-currency credit
    // balance uses the opposite sign: negative means owed in that currency.
    hasOwedBalance: legacyBalance > 0 || currencyBalance < 0,
  };
}

function unsupportedBillingStatus(message) {
  return result(200, { ok: true, mode: 'unsupported', message });
}

export async function handleBillingStatus(_request, url, env) {
  const subscriptionId = normalizeSubscriptionId(url?.searchParams?.get('subscriptionId'));
  if (!subscriptionId) {
    return result(400, errorBody(
      'invalid_billing_status_request',
      'A valid subscriptionId is required.',
    ));
  }

  const key = stripeKey(env);
  if (!key) {
    return result(503, errorBody('stripe_not_configured', 'Stripe is not configured for billing-date adjustments.'));
  }

  const read = await stripeRequest(key, `/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (!read.ok) {
    return stripeError(read, 'Stripe could not retrieve this subscription.', {
      reason: 'billing_date_subscription_read_failed',
      stage: 'subscription read',
    });
  }

  const subscription = read.body;
  const graceCouponId = text(env.BILLING_DATE_GRACE_COUPON_ID, 200) || DEFAULT_GRACE_COUPON_ID;
  const period = periodEndOf(subscription);
  const items = Array.isArray(subscription?.items?.data)
    ? subscription.items.data.filter((item) => !item?.deleted)
    : [];
  const hasSimpleCurrentItem = Boolean(
    items.length === 1
    && period.primary === items[0]
    && period.start
    && period.end
  );
  const item = hasSimpleCurrentItem ? period.primary : items[0] || period.primary;

  if (subscription?.status === 'active' && subscription?.schedule && hasSimpleCurrentItem) {
    const existing = await readManagedBillingSchedule(key, subscription, period, graceCouponId);
    if (existing.error) return existing.error;
    if (existing.managed) {
      const customerId = idOf(subscription.customer);
      if (!customerId) {
        return unsupportedBillingStatus('The billing-date schedule is active, but Stripe did not return its customer, so pending charges cannot be checked safely.');
      }
      const pendingRead = await readPendingInvoiceItems(key, customerId);
      if (pendingRead.error) return pendingRead.error;
      if (pendingRead.pendingItems.length > 0) {
        return unsupportedBillingStatus('The billing-date schedule is active, but this customer now has pending Stripe invoice items that could still be charged. Review them in Stripe.');
      }
      const balanceRead = await readCustomerOwedBalance(
        key,
        customerId,
        billingCurrency(period.primary),
      );
      if (balanceRead.error) return balanceRead.error;
      if (balanceRead.hasOwedBalance) {
        return unsupportedBillingStatus('The billing-date schedule is active, but this customer now has an owed Stripe balance that can be added to the next invoice. Review it in Stripe.');
      }
      return result(200, {
        ok: true,
        mode: 'scheduled_bridge',
        amountCents: billingAmount(period.primary),
        currency: billingCurrency(period.primary),
        scheduledBillingAt: existing.managed.target,
        scheduledBillingIso: iso(existing.managed.target),
        scheduleId: existing.managed.schedule.id,
      });
    }
  }

  if (subscription?.status === 'canceled') {
    return unsupportedBillingStatus('This subscription is canceled.');
  }

  const now = Math.floor(Date.now() / 1000);
  const isFutureTrialBridge = (
    subscription?.status === 'trialing'
    && Number.isInteger(subscription.trial_end)
    && subscription.trial_end > now
  );
  if (subscription?.status === 'past_due' || subscription?.status === 'unpaid') {
    if (items.length !== 1) {
      return unsupportedBillingStatus('Only a simple subscription with one current monthly item can be adjusted here.');
    }
    const activeItem = items[0];
    const reason = unsupportedSubscriptionReason({ ...subscription, status: 'active' }, activeItem);
    if (reason) return unsupportedBillingStatus(reason);

    const invoicesRead = await readOpenBillingInvoices(key, subscriptionId);
    if (invoicesRead.error) return invoicesRead.error;
    if (invoicesRead.openInvoices.length === 0) {
      return unsupportedBillingStatus('Their unpaid bill was just settled or written off — refresh to see the latest.');
    }

    return result(200, {
      ok: true,
      mode: 'past_due',
      amountCents: billingAmount(activeItem),
      currency: billingCurrency(activeItem),
      openInvoices: invoicesRead.openInvoices,
      minDate: nextUtcDateOnly(now),
      maxDate: utcDateOnly(addUtcMonths(now, 1)),
    });
  }

  if (isFutureTrialBridge) {
    const invoicesRead = await readOpenBillingInvoices(key, subscriptionId);
    if (invoicesRead.error) return invoicesRead.error;
    if (invoicesRead.openInvoices.length > 0) {
      const activeItem = items[0] || item;
      return result(200, {
        ok: true,
        mode: 'past_due',
        amountCents: billingAmount(activeItem),
        currency: billingCurrency(activeItem),
        openInvoices: invoicesRead.openInvoices,
        minDate: nextUtcDateOnly(now),
        maxDate: utcDateOnly(addUtcMonths(now, 1)),
        resumeTargetDate: utcDateOnly(subscription.trial_end),
      });
    }
  }

  if (isFutureTrialBridge) {
    return result(200, {
      ok: true,
      mode: 'trial_bridge',
      trialEnd: subscription.trial_end,
      trialEndIso: iso(subscription.trial_end),
      amountCents: billingAmount(item),
      currency: billingCurrency(item),
    });
  }

  if (subscription?.status === 'active') {
    if (!hasSimpleCurrentItem) {
      return unsupportedBillingStatus('Only a simple subscription with one current monthly item can be adjusted here.');
    }
    const reason = unsupportedSubscriptionReason(subscription, period.primary);
    if (reason) return unsupportedBillingStatus(reason);

    const customerId = idOf(subscription.customer);
    if (!customerId) {
      return unsupportedBillingStatus('Stripe did not return the customer for this subscription, so its pending charges cannot be checked safely.');
    }
    const pendingRead = await readPendingInvoiceItems(key, customerId);
    if (pendingRead.error) return pendingRead.error;
    if (pendingRead.pendingItems.length > 0) {
      return unsupportedBillingStatus('This customer has pending Stripe invoice items that could still be charged. Resolve them in Stripe before moving the billing date.');
    }
    const balanceRead = await readCustomerOwedBalance(
      key,
      customerId,
      billingCurrency(period.primary),
    );
    if (balanceRead.error) return balanceRead.error;
    if (balanceRead.hasOwedBalance) {
      return unsupportedBillingStatus('This customer has an owed Stripe balance that can be added to the next invoice. Resolve it in Stripe before moving the billing date.');
    }

    return result(200, {
      ok: true,
      mode: 'schedulable',
      amountCents: billingAmount(period.primary),
      currency: billingCurrency(period.primary),
      interval: 'month',
      currentPeriodEnd: period.end,
      currentPeriodEndIso: iso(period.end),
      minDate: nextUtcDateOnly(period.end),
      maxDate: utcDateOnly(addUtcMonths(period.end, 1)),
    });
  }

  return unsupportedBillingStatus(unsupportedSubscriptionReason(subscription, item));
}

function billingDateSuccess(subscriptionId, scheduleId, periodEnd, target, fullPeriodEnd) {
  return result(200, {
    ok: true,
    subscriptionId,
    scheduleId,
    currentRenewalAt: periodEnd,
    currentRenewalIso: iso(periodEnd),
    nextBillingAt: target,
    nextBillingIso: iso(target),
    normalBillingPeriodEndsAt: fullPeriodEnd,
    normalBillingPeriodEndsIso: iso(fullPeriodEnd),
  });
}

export async function handleBillingDateSchedule(request, env) {
  const key = stripeKey(env);
  if (!key) {
    return result(503, errorBody('stripe_not_configured', 'Stripe is not configured for billing-date adjustments.'));
  }

  const body = await safeJson(request);
  const subscriptionId = normalizeSubscriptionId(body?.subscriptionId);
  const requestedDate = parseDateOnly(body?.nextBillingDate);
  const rawOperationId = text(body?.operationId, MAX_OPERATION_ID_LENGTH + 1);
  const operationId = rawOperationId ? normalizeOperationId(rawOperationId) : newOperationId();
  if (!subscriptionId || !requestedDate) {
    return result(400, errorBody('invalid_billing_date_request', 'subscriptionId and a valid next billing date are required.'));
  }
  if (rawOperationId && !operationId) {
    return result(400, errorBody(
      'invalid_billing_date_request',
      'operationId must be 8-64 letters, numbers, underscores, or hyphens.',
    ));
  }
  if (!operationId) {
    return result(503, errorBody(
      'billing_date_operation_id_unavailable',
      'A secure billing-date operation ID could not be generated. Retry from a supported browser.',
    ));
  }

  const read = await stripeRequest(key, `/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (!read.ok) {
    return stripeError(read, 'Stripe could not retrieve this subscription.', {
      reason: 'billing_date_subscription_read_failed',
      stage: 'subscription read',
    });
  }
  const subscription = read.body;
  const configuredCouponId = text(env.BILLING_DATE_GRACE_COUPON_ID, 200);
  const couponId = configuredCouponId || DEFAULT_GRACE_COUPON_ID;
  const period = periodEndOf(subscription);
  const items = Array.isArray(subscription?.items?.data) ? subscription.items.data.filter((item) => !item?.deleted) : [];
  if (items.length !== 1 || period.primary !== items[0] || !period.start || !period.end) {
    return result(409, errorBody('unsupported_subscription', 'Only a simple subscription with one current monthly item can be adjusted here.'));
  }

  const target = atExistingUtcTime(requestedDate, period.end);
  const maxTarget = addUtcMonths(period.end, 1);
  if (target <= period.end) {
    return result(409, errorBody('billing_date_before_current_period_end', 'Choose a billing date after the current Stripe renewal date.'));
  }
  if (target > maxTarget) {
    return result(409, errorBody('billing_date_too_far', 'Choose a billing date no more than one monthly period after the current Stripe renewal date.'));
  }

  if (subscription.schedule) {
    const existing = await readManagedBillingSchedule(key, subscription, period, couponId);
    if (existing.error) return existing.error;
    if (existing.managed?.target === target) {
      const customerId = idOf(subscription.customer);
      if (!customerId) {
        return result(409, errorBody(
          'unsupported_subscription',
          'The billing-date schedule is active, but Stripe did not return its customer, so pending charges cannot be checked safely.',
        ));
      }
      const pendingRead = await readPendingInvoiceItems(key, customerId);
      if (pendingRead.error) return pendingRead.error;
      if (pendingRead.pendingItems.length > 0) {
        return result(409, errorBody(
          'billing_date_pending_invoice_items',
          'The billing-date schedule is active, but this customer now has pending Stripe invoice items that could still be charged. Review them in Stripe.',
        ));
      }
      const balanceRead = await readCustomerOwedBalance(
        key,
        customerId,
        billingCurrency(period.primary),
      );
      if (balanceRead.error) return balanceRead.error;
      if (balanceRead.hasOwedBalance) {
        return result(409, errorBody(
          'billing_date_customer_balance',
          'The billing-date schedule is active, but this customer now has an owed Stripe balance that can be added to the next invoice. Review it in Stripe.',
        ));
      }
      return billingDateSuccess(
        subscriptionId,
        existing.managed.schedule.id,
        period.end,
        target,
        existing.managed.fullPeriodEnd,
      );
    }
    return result(409, errorBody(
      'unsupported_subscription',
      'This subscription already has a Stripe schedule. Manage its billing date in Stripe so the existing schedule is preserved.',
    ));
  }

  const subscriptionReason = unsupportedSubscriptionReason(subscription, period.primary);
  if (subscriptionReason) return result(409, errorBody('unsupported_subscription', subscriptionReason));

  const customerId = idOf(subscription.customer);
  if (!customerId) {
    return result(409, errorBody(
      'unsupported_subscription',
      'Stripe did not return the customer for this subscription, so its pending charges cannot be checked safely.',
    ));
  }
  const pendingRead = await readPendingInvoiceItems(key, customerId);
  if (pendingRead.error) return pendingRead.error;
  if (pendingRead.pendingItems.length > 0) {
    return result(409, errorBody(
      'billing_date_pending_invoice_items',
      'This customer has pending Stripe invoice items that could still be charged. Resolve them in Stripe before moving the billing date.',
    ));
  }
  const balanceRead = await readCustomerOwedBalance(
    key,
    customerId,
    billingCurrency(period.primary),
  );
  if (balanceRead.error) return balanceRead.error;
  if (balanceRead.hasOwedBalance) {
    return result(409, errorBody(
      'billing_date_customer_balance',
      'This customer has an owed Stripe balance that can be added to the next invoice. Resolve it in Stripe before moving the billing date.',
    ));
  }

  const couponReady = await ensureGraceCoupon(key, couponId, {
    provisionDefault: !configuredCouponId,
  });
  if (couponReady.error) return couponReady.error;
  const coupon = couponReady.coupon;
  if (!validGraceCoupon(coupon, period.end)) {
    return result(503, errorBody(
      'billing_date_coupon_invalid',
      'The configured billing-date grace coupon must be a valid, unrestricted 100% one-time Stripe coupon through the bridge start date.',
    ));
  }
  const allowedProducts = coupon?.applies_to?.products;
  const productId = idOf(period.primary.price?.product);
  if (nonEmptyArray(allowedProducts) && (!productId || !allowedProducts.includes(productId))) {
    return result(409, errorBody('billing_date_coupon_ineligible', 'The configured grace coupon does not apply to this subscription product.'));
  }

  // Keep every key below Stripe's 255-byte limit even if a malformed-but-valid
  // looking subscription ID reaches this point. A new operation ID is created
  // for each explicit admin attempt, while transport retries reuse it.
  const operationKey = `billing-date:${subscriptionId.slice(0, 80)}:${target}:${operationId}`;
  const created = await createBillingSchedule(key, subscriptionId, operationKey);
  if (!created.ok && created.indeterminate) {
    return indeterminateScheduleCreateResult(key, subscriptionId, created);
  }
  if (!created.ok) {
    return stripeError(created, 'Stripe could not create a billing schedule for this subscription.', {
      reason: 'billing_date_schedule_create_failed',
      stage: 'schedule creation',
    });
  }

  const schedule = created.body;
  const scheduleOperationKey = operationKey;
  const scheduleReason = unsupportedScheduleReason(schedule, subscription, period);
  if (scheduleReason) {
    const released = await releaseSchedule(key, schedule?.id, `${scheduleOperationKey}:rollback`);
    return result(409, errorBody(
      released ? 'unsupported_schedule' : 'schedule_rollback_failed',
      released ? scheduleReason : `${scheduleReason} Stripe could not roll back the temporary schedule; review it in Stripe.`,
    ));
  }

  const fullPeriodEnd = addUtcMonths(target, 1);
  const matchOptions = {
    sourceSchedule: schedule,
    subscription,
    period,
    target,
    fullPeriodEnd,
    couponId,
    operationId,
  };
  let update = await idempotentMutation(() => stripeRequest(
    key,
    `/subscription_schedules/${encodeURIComponent(schedule.id)}`,
    {
      method: 'POST',
      form: scheduleUpdateForm({
        schedule,
        subscription,
        period,
        target,
        fullPeriodEnd,
        couponId,
        operationId,
      }),
      idempotencyKey: `${scheduleOperationKey}:update`,
    },
  ));
  if (update.ok && !idOf(update.body)) {
    update = {
      ...update,
      ok: false,
      status: 502,
      indeterminate: true,
      body: { error: { message: 'Stripe returned an incomplete schedule-update response.' } },
    };
  }
  if (!update.ok && update.indeterminate) {
    const verifyRead = await stripeRequest(
      key,
      `/subscription_schedules/${encodeURIComponent(schedule.id)}`,
    );
    if (verifyRead.ok && updatedScheduleMatches(verifyRead.body, matchOptions)) {
      update = verifyRead;
    } else {
      return result(502, errorBody(
        'schedule_update_outcome_unknown',
        'Stripe did not return a definitive schedule-update response. The schedule was left untouched to avoid racing an in-flight Stripe request; review it in Stripe before retrying.',
        { scheduleId: schedule.id, stage: 'schedule update recovery' },
      ));
    }
  }
  if (!update.ok) {
    const released = await releaseSchedule(key, schedule.id, `${scheduleOperationKey}:rollback`);
    const failed = stripeError(update, 'Stripe could not configure the billing schedule.', {
      reason: 'billing_date_schedule_update_failed',
      stage: 'schedule update',
    });
    if (!released) {
      failed.body.reason = 'schedule_rollback_failed';
      failed.body.message = `${failed.body.message} Stripe could not roll back the temporary schedule; review it in Stripe.`;
    }
    return failed;
  }

  if (!updatedScheduleMatches(update.body, matchOptions)) {
    const released = await releaseSchedule(key, schedule.id, `${scheduleOperationKey}:rollback`);
    return result(502, errorBody(
      released ? 'schedule_verification_failed' : 'schedule_rollback_failed',
      released
        ? 'Stripe returned an unexpected billing schedule. The schedule was released, but active-phase changes can persist; review the subscription in Stripe before retrying.'
        : 'Stripe returned an unexpected billing schedule and it could not be released. Review the subscription in Stripe immediately.',
      { scheduleId: schedule.id, stage: 'schedule verification' },
    ));
  }

  return billingDateSuccess(
    subscriptionId,
    update.body.id,
    period.end,
    target,
    fullPeriodEnd,
  );
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
