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
const DEFAULT_GRACE_COUPON_ID = 'FREE_MONTH_100';
const MAX_SUBSCRIPTION_ID_LENGTH = 200;

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

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function activeDiscounts(value) {
  return nonEmptyArray(value) || Boolean(value && !Array.isArray(value));
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

function errorBody(reason, message) {
  return { ok: false, reason, message };
}

function stripeError(response, fallback = 'Stripe could not update this subscription.') {
  const message = text(response?.body?.error?.message, 500) || fallback;
  const status = Number(response?.status);
  return result(
    Number.isInteger(status) && status >= 400 && status < 500 ? status : 502,
    errorBody('stripe_error', message),
  );
}

async function stripeRequest(key, path, { method = 'GET', form, idempotencyKey } = {}) {
  const headers = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
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
    return { ok: response.ok, status: response.status, body };
  } catch (err) {
    return { ok: false, status: 502, body: { error: { message: String(err?.message || err).slice(0, 500) } } };
  }
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
  if (subscription?.billing_thresholds || subscription?.pending_invoice_item_interval) {
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
  if (activeDiscounts(item.discounts) || item.billing_thresholds || nonEmptyArray(item.tax_rates)) {
    return 'This subscription item has custom discounts, taxes, or thresholds and cannot be adjusted here.';
  }
  const recurring = item.price?.recurring;
  if (recurring?.interval !== 'month' || Number(recurring?.interval_count || 1) !== 1) {
    return 'Only simple one-month subscriptions can have a billing date adjusted here.';
  }
  if (!idOf(item.price) || !Number.isInteger(Number(item.quantity || 1)) || Number(item.quantity || 1) < 1) {
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
  const item = phase?.items?.[0];
  const phasePriceId = idOf(item?.price);
  const subscriptionPriceId = idOf(period.primary?.price);
  if (
    !Number.isInteger(phase?.start_date)
    || phase.end_date !== period.end
    || !item
    || phasePriceId !== subscriptionPriceId
    || Number(item.quantity || 1) !== Number(period.primary?.quantity || 1)
  ) {
    return 'Stripe returned a schedule that does not exactly mirror the current subscription period.';
  }
  if (phase.trial_end || activeDiscounts(phase.discounts) || phase.application_fee_percent || phase.transfer_data || phase.on_behalf_of) {
    return 'Stripe returned a schedule with unsupported phase overrides.';
  }
  const defaults = schedule.default_settings || {};
  if (
    defaults.application_fee_percent
    || defaults.transfer_data
    || defaults.on_behalf_of
    || defaults.billing_thresholds
    || nonEmptyArray(defaults.default_tax_rates)
    || (defaults.collection_method && defaults.collection_method !== 'charge_automatically')
  ) {
    return 'This subscription has schedule-level billing overrides that cannot be safely preserved here.';
  }
  if (schedule.subscription && idOf(schedule.subscription) && idOf(schedule.subscription) !== subscription.id) {
    return 'Stripe returned a schedule for a different subscription.';
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

function appendPhase(params, index, { start, end, item, metadata, discounts, anchor, prorationBehavior = 'none' }) {
  const prefix = `phases[${index}]`;
  params.append(`${prefix}[start_date]`, String(start));
  if (Number.isInteger(end)) params.append(`${prefix}[end_date]`, String(end));
  params.append(`${prefix}[items][0][price]`, idOf(item.price));
  params.append(`${prefix}[items][0][quantity]`, String(Number(item.quantity || 1)));
  params.append(`${prefix}[proration_behavior]`, prorationBehavior);
  if (anchor) params.append(`${prefix}[billing_cycle_anchor]`, anchor);
  appendMetadata(params, `${prefix}[metadata]`, metadata);
  appendMetadata(params, `${prefix}[items][0][metadata]`, item.metadata);
  if (discounts === 'empty') {
    // Stripe uses an empty array field to make the phase explicitly discount-free.
    params.append(`${prefix}[discounts]`, '');
  } else if (discounts?.coupon) {
    params.append(`${prefix}[discounts][0][coupon]`, discounts.coupon);
  }
}

function scheduleUpdateForm({ schedule, subscription, period, target, fullPeriodEnd, couponId }) {
  const phase = schedule.phases[0];
  const phaseAnchor = ['automatic', 'phase_start'].includes(phase?.billing_cycle_anchor)
    ? phase.billing_cycle_anchor
    : 'automatic';
  // A schedule created from a subscription can return an empty phase metadata
  // object even when the underlying subscription carries the org/user/GHL keys
  // consumed by downstream webhook handling. Keep both sources on every phase.
  const phaseMetadata = {
    ...(subscription?.metadata && typeof subscription.metadata === 'object' ? subscription.metadata : {}),
    ...(phase?.metadata && typeof phase.metadata === 'object' ? phase.metadata : {}),
  };
  const item = period.primary;
  const params = new URLSearchParams();
  params.append('end_behavior', 'release');
  // This applies to modifying the current phase. Each future phase also carries
  // `none`, so no surprise prorations are created at either transition.
  params.append('proration_behavior', 'none');

  // P0: paid period exactly as Stripe returned it. Explicit empty discounts
  // prevent the bridge coupon from leaking into the current or final phase.
  appendPhase(params, 0, {
    start: phase.start_date,
    end: period.end,
    item,
    metadata: phaseMetadata,
    discounts: 'empty',
    anchor: phaseAnchor,
  });
  // P1: a short active bridge from the normal renewal to the selected day. The
  // one-time 100% coupon waives its invoice without changing account access.
  appendPhase(params, 1, {
    start: period.end,
    end: target,
    item,
    metadata: phaseMetadata,
    discounts: { coupon: couponId },
    anchor: 'automatic',
  });
  // P2: one normal monthly phase. `phase_start` deliberately changes the anchor
  // even for flexible-mode subscriptions; release then leaves the subscription
  // recurring normally on its new day.
  appendPhase(params, 2, {
    start: target,
    end: fullPeriodEnd,
    item,
    metadata: phaseMetadata,
    discounts: 'empty',
    anchor: 'phase_start',
  });
  return params;
}

function updatedScheduleMatches(schedule, { periodEnd, target, fullPeriodEnd, couponId }) {
  const phases = Array.isArray(schedule?.phases) ? schedule.phases : [];
  const bridge = phases[1];
  const renewal = phases[2];
  const bridgeCoupon = bridge?.discounts?.[0]?.coupon;
  const bridgeCouponId = idOf(bridgeCoupon) || (typeof bridgeCoupon === 'string' ? bridgeCoupon : '');
  return Boolean(
    schedule?.status === 'active'
    && phases.length === 3
    && bridge?.start_date === periodEnd
    && bridge?.end_date === target
    && bridgeCouponId === couponId
    && renewal?.start_date === target
    && renewal?.end_date === fullPeriodEnd
    && renewal?.billing_cycle_anchor === 'phase_start'
    && schedule?.end_behavior === 'release'
  );
}

async function releaseSchedule(key, scheduleId, idempotencyKey) {
  if (!scheduleId) return false;
  const response = await stripeRequest(key, `/subscription_schedules/${encodeURIComponent(scheduleId)}/release`, {
    method: 'POST',
    form: new URLSearchParams(),
    idempotencyKey,
  });
  return response.ok;
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
  if (!read.ok) return stripeError(read, 'Stripe could not retrieve this subscription.');

  const subscription = read.body;
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

export async function handleBillingDateSchedule(request, env) {
  const key = stripeKey(env);
  if (!key) {
    return result(503, errorBody('stripe_not_configured', 'Stripe is not configured for billing-date adjustments.'));
  }

  const body = await safeJson(request);
  const subscriptionId = normalizeSubscriptionId(body?.subscriptionId);
  const requestedDate = parseDateOnly(body?.nextBillingDate);
  if (!subscriptionId || !requestedDate) {
    return result(400, errorBody('invalid_billing_date_request', 'subscriptionId and a valid next billing date are required.'));
  }

  const read = await stripeRequest(key, `/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (!read.ok) return stripeError(read, 'Stripe could not retrieve this subscription.');
  const subscription = read.body;
  const period = periodEndOf(subscription);
  const items = Array.isArray(subscription?.items?.data) ? subscription.items.data.filter((item) => !item?.deleted) : [];
  if (items.length !== 1 || period.primary !== items[0] || !period.start || !period.end) {
    return result(409, errorBody('unsupported_subscription', 'Only a simple subscription with one current monthly item can be adjusted here.'));
  }

  const subscriptionReason = unsupportedSubscriptionReason(subscription, period.primary);
  if (subscriptionReason) return result(409, errorBody('unsupported_subscription', subscriptionReason));

  const target = atExistingUtcTime(requestedDate, period.end);
  const maxTarget = addUtcMonths(period.end, 1);
  if (target <= period.end) {
    return result(409, errorBody('billing_date_before_current_period_end', 'Choose a billing date after the current Stripe renewal date.'));
  }
  if (target > maxTarget) {
    return result(409, errorBody('billing_date_too_far', 'Choose a billing date no more than one monthly period after the current Stripe renewal date.'));
  }

  const couponId = text(env.BILLING_DATE_GRACE_COUPON_ID || DEFAULT_GRACE_COUPON_ID, 200);
  const couponRead = await stripeRequest(key, `/coupons/${encodeURIComponent(couponId)}`);
  if (!couponRead.ok) return stripeError(couponRead, 'Stripe could not retrieve the configured billing-date grace coupon.');
  const coupon = couponRead.body;
  if (!coupon?.valid || Number(coupon.percent_off) !== 100 || coupon.duration !== 'once') {
    return result(503, errorBody(
      'billing_date_coupon_invalid',
      'The configured billing-date grace coupon must be a valid 100% one-time Stripe coupon.',
    ));
  }
  const allowedProducts = coupon?.applies_to?.products;
  const productId = idOf(period.primary.price?.product);
  if (nonEmptyArray(allowedProducts) && (!productId || !allowedProducts.includes(productId))) {
    return result(409, errorBody('billing_date_coupon_ineligible', 'The configured grace coupon does not apply to this subscription product.'));
  }

  const operationKey = `billing-date:${subscriptionId}:${target}`;
  const created = await stripeRequest(key, '/subscription_schedules', {
    method: 'POST',
    form: new URLSearchParams({ from_subscription: subscriptionId }),
    idempotencyKey: `${operationKey}:create`,
  });
  if (!created.ok) return stripeError(created, 'Stripe could not create a billing schedule for this subscription.');

  const schedule = created.body;
  const scheduleReason = unsupportedScheduleReason(schedule, subscription, period);
  if (scheduleReason) {
    const released = await releaseSchedule(key, schedule?.id, `${operationKey}:rollback`);
    return result(409, errorBody(
      released ? 'unsupported_schedule' : 'schedule_rollback_failed',
      released ? scheduleReason : `${scheduleReason} Stripe could not roll back the temporary schedule; review it in Stripe.`,
    ));
  }

  const fullPeriodEnd = addUtcMonths(target, 1);
  const update = await stripeRequest(key, `/subscription_schedules/${encodeURIComponent(schedule.id)}`, {
    method: 'POST',
    form: scheduleUpdateForm({ schedule, subscription, period, target, fullPeriodEnd, couponId }),
    idempotencyKey: `${operationKey}:update`,
  });
  if (!update.ok) {
    const released = await releaseSchedule(key, schedule.id, `${operationKey}:rollback`);
    const failed = stripeError(update, 'Stripe could not configure the billing schedule.');
    if (!released) {
      failed.body.reason = 'schedule_rollback_failed';
      failed.body.message = `${failed.body.message} Stripe could not roll back the temporary schedule; review it in Stripe.`;
    }
    return failed;
  }

  if (!updatedScheduleMatches(update.body, { periodEnd: period.end, target, fullPeriodEnd, couponId })) {
    const released = await releaseSchedule(key, schedule.id, `${operationKey}:rollback`);
    return result(502, errorBody(
      released ? 'schedule_verification_failed' : 'schedule_rollback_failed',
      released
        ? 'Stripe returned an unexpected billing schedule, so it was released without applying the change.'
        : 'Stripe returned an unexpected billing schedule and it could not be rolled back. Review it in Stripe immediately.',
    ));
  }

  return result(200, {
    ok: true,
    subscriptionId,
    scheduleId: update.body.id,
    currentRenewalAt: period.end,
    currentRenewalIso: iso(period.end),
    nextBillingAt: target,
    nextBillingIso: iso(target),
    normalBillingPeriodEndsAt: fullPeriodEnd,
    normalBillingPeriodEndsIso: iso(fullPeriodEnd),
  });
}

async function safeJson(request) {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
}
