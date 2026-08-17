import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBillingDateSchedule } from '../worker/src/admin/billing-cycle.js';
import { ApiError, apiPost } from '../src/admin/lib/api.js';
import {
  friendlyAdjustmentError,
  scheduleNextBillingDate,
} from '../src/admin/lib/support-adjustments.js';

const SUBSCRIPTION_ID = 'sub_billing123';
const CUSTOMER_ID = 'cus_billing123';
const SCHEDULE_ID = 'sub_sched_billing123';
const SECOND_SCHEDULE_ID = 'sub_sched_billing456';
const COUPON_ID = 'FREE_MONTH_100';
const PERIOD_START = Date.UTC(2026, 7, 6, 12, 0, 0) / 1000;
const PERIOD_END = Date.UTC(2026, 8, 6, 12, 0, 0) / 1000;
const TARGET = Date.UTC(2026, 8, 17, 12, 0, 0) / 1000;
const FULL_PERIOD_END = Date.UTC(2026, 9, 17, 12, 0, 0) / 1000;
const NEXT_BILLING_DATE = '2026-09-17';
const STRIPE_VERSION = '2026-02-25.clover';
const OPERATION_ID = 'op_sep17_attempt_01';
const SECOND_OPERATION_ID = 'op_sep17_attempt_02';

function stripeResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function subscription(overrides = {}) {
  const item = {
    id: 'si_monthly39',
    quantity: 1,
    current_period_start: PERIOD_START,
    current_period_end: PERIOD_END,
    metadata: { item_source: 'checkout' },
    price: {
      id: 'price_monthly39',
      product: 'prod_autolander',
      currency: 'usd',
      unit_amount: 3900,
      recurring: { interval: 'month', interval_count: 1 },
    },
  };
  return {
    id: SUBSCRIPTION_ID,
    customer: CUSTOMER_ID,
    status: 'active',
    schedule: null,
    collection_method: 'charge_automatically',
    automatic_tax: { enabled: true, liability: { type: 'self' } },
    default_payment_method: 'pm_customer_default',
    invoice_settings: { issuer: { type: 'self' } },
    metadata: { orgId: 'org-safe-fixture' },
    items: { data: [item] },
    ...overrides,
  };
}

function coupon(overrides = {}) {
  return {
    id: COUPON_ID,
    valid: true,
    percent_off: 100,
    duration: 'once',
    ...overrides,
  };
}

function phase(startDate, endDate, overrides = {}) {
  return {
    start_date: startDate,
    end_date: endDate,
    items: [{
      price: 'price_monthly39',
      quantity: 1,
      metadata: { item_source: 'checkout' },
    }],
    metadata: { orgId: 'org-safe-fixture' },
    discounts: [],
    billing_cycle_anchor: 'automatic',
    proration_behavior: 'none',
    automatic_tax: { enabled: true, liability: { type: 'self' } },
    collection_method: 'charge_automatically',
    default_payment_method: 'pm_customer_default',
    invoice_settings: { issuer: { type: 'self' } },
    ...overrides,
  };
}

function createdSchedule(overrides = {}) {
  return {
    id: SCHEDULE_ID,
    status: 'active',
    subscription: SUBSCRIPTION_ID,
    end_behavior: 'release',
    current_phase: { start_date: PERIOD_START, end_date: PERIOD_END },
    default_settings: {
      billing_cycle_anchor: 'automatic',
      collection_method: 'charge_automatically',
      automatic_tax: { enabled: true, liability: { type: 'self' } },
      default_payment_method: 'pm_customer_default',
      invoice_settings: { issuer: { type: 'self' } },
    },
    phases: [phase(PERIOD_START, PERIOD_END)],
    ...overrides,
  };
}

function updatedSchedule(overrides = {}) {
  return createdSchedule({
    metadata: {
      autolander_billing_date_operation: OPERATION_ID,
      autolander_billing_date_target: String(TARGET),
      autolander_billing_date_coupon: COUPON_ID,
    },
    phases: [
      phase(PERIOD_START, PERIOD_END),
      phase(PERIOD_END, TARGET, {
        discounts: [{ source: { type: 'coupon', coupon: COUPON_ID } }],
      }),
      phase(TARGET, FULL_PERIOD_END, { billing_cycle_anchor: 'phase_start' }),
    ],
    ...overrides,
  });
}

function request(operationId = OPERATION_ID) {
  return new Request('https://admin.example.test/admin-api/support-adjustments/billing-date', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriptionId: SUBSCRIPTION_ID,
      nextBillingDate: NEXT_BILLING_DATE,
      operationId,
    }),
  });
}

async function invoke(steps, env = {}, operationId = OPERATION_ID) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const mismatches = [];
  const expectedSteps = (
    steps[0]?.url === subscriptionUrl
    && steps[1]?.url !== pendingInvoiceItemsUrl
    && !String(steps[1]?.url || '').includes('/subscription_schedules/')
  ) ? [
      steps[0],
      {
        url: pendingInvoiceItemsUrl,
        response: stripeResponse({ object: 'list', data: [], has_more: false }),
      },
      {
        url: customerUrl,
        response: stripeResponse({
          id: CUSTOMER_ID,
          // Both are credits under their respective Stripe response contracts,
          // so neither can create an unexpected bridge charge.
          balance: -500,
          invoice_credit_balance: { usd: 500 },
        }),
      },
      ...steps.slice(1),
    ] : steps;
  globalThis.fetch = async (input, options = {}) => {
    const call = {
      url: String(input),
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body || '',
    };
    const step = expectedSteps[calls.length];
    calls.push(call);
    if (!step) {
      mismatches.push(`Unexpected Stripe request: ${call.method} ${call.url}`);
      return stripeResponse({ error: { message: 'Unexpected mocked request.' } }, 599);
    }
    const expectedMethod = step.method || 'GET';
    if (call.method !== expectedMethod) {
      mismatches.push(`Expected ${expectedMethod}, received ${call.method} for ${call.url}`);
    }
    if (step.url instanceof RegExp) {
      if (!step.url.test(call.url)) mismatches.push(`Unexpected URL: ${call.url}`);
    } else if (call.url !== step.url) {
      mismatches.push(`Expected ${step.url}, received ${call.url}`);
    }
    if (call.headers.Authorization !== 'Bearer sk_test_billing') {
      mismatches.push('Stripe authorization header was missing or incorrect.');
    }
    if (call.headers['Stripe-Version'] !== STRIPE_VERSION) {
      mismatches.push('Stripe-Version header was missing or incorrect.');
    }
    return typeof step.response === 'function' ? step.response(call) : step.response;
  };

  try {
    const response = await handleBillingDateSchedule(request(operationId), {
      STRIPE_BILLING_ADMIN_KEY: 'sk_test_billing',
      ...env,
    });
    assert.deepEqual(mismatches, []);
    assert.equal(calls.length, expectedSteps.length, 'All expected Stripe calls should run');
    return {
      response,
      // Preserve the original call indexes used by the mutation assertions;
      // allCalls exposes the read-only pending-item preflight and full order.
      calls: calls.filter((call) => (
        call.url !== pendingInvoiceItemsUrl && call.url !== customerUrl
      )),
      allCalls: calls,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const subscriptionUrl = `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`;
const pendingInvoiceItemsUrl = `https://api.stripe.com/v1/invoiceitems?customer=${CUSTOMER_ID}&pending=true&limit=100`;
const customerUrl = `https://api.stripe.com/v1/customers/${CUSTOMER_ID}?expand%5B%5D=invoice_credit_balance`;
const defaultCouponUrl = `https://api.stripe.com/v1/coupons/${COUPON_ID}`;
const schedulesUrl = 'https://api.stripe.com/v1/subscription_schedules';
const scheduleUrl = `${schedulesUrl}/${SCHEDULE_ID}`;
const releaseUrl = `${scheduleUrl}/release`;
const secondScheduleUrl = `${schedulesUrl}/${SECOND_SCHEDULE_ID}`;
const operationKey = (operationId = OPERATION_ID) => (
  `billing-date:${SUBSCRIPTION_ID}:${TARGET}:${operationId}`
);

test('moves Sep 6 to Sep 17, provisions the managed coupon, and preserves billing settings', async () => {
  const { response, calls, allCalls } = await invoke([
    {
      url: subscriptionUrl,
      response: stripeResponse(subscription({
        // Customer discounts are inherited when phase discounts are omitted.
        customer: { id: CUSTOMER_ID, discount: { id: 'di_customer_loyalty' } },
      })),
    },
    { url: defaultCouponUrl, response: stripeResponse({ error: { code: 'resource_missing' } }, 404) },
    { url: 'https://api.stripe.com/v1/coupons', method: 'POST', response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    { url: scheduleUrl, method: 'POST', response: stripeResponse(updatedSchedule()) },
  ]);

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      subscriptionId: SUBSCRIPTION_ID,
      scheduleId: SCHEDULE_ID,
      currentRenewalAt: PERIOD_END,
      currentRenewalIso: '2026-09-06T12:00:00.000Z',
      nextBillingAt: TARGET,
      nextBillingIso: '2026-09-17T12:00:00.000Z',
      normalBillingPeriodEndsAt: FULL_PERIOD_END,
      normalBillingPeriodEndsIso: '2026-10-17T12:00:00.000Z',
    },
  });
  assert.deepEqual(allCalls.map((call) => [call.method, call.url]), [
    ['GET', subscriptionUrl],
    ['GET', pendingInvoiceItemsUrl],
    ['GET', customerUrl],
    ['GET', defaultCouponUrl],
    ['POST', 'https://api.stripe.com/v1/coupons'],
    ['POST', schedulesUrl],
    ['POST', scheduleUrl],
  ]);

  const couponForm = new URLSearchParams(calls[2].body);
  assert.equal(couponForm.get('id'), COUPON_ID);
  assert.equal(couponForm.get('percent_off'), '100');
  assert.equal(couponForm.get('duration'), 'once');
  assert.ok(couponForm.get('name').length <= 40);
  assert.equal(calls[2].headers['Idempotency-Key'], `billing-date-coupon:${COUPON_ID}:create:v2`);

  const createForm = new URLSearchParams(calls[3].body);
  assert.equal(createForm.get('from_subscription'), SUBSCRIPTION_ID);
  assert.equal(
    calls[3].headers['Idempotency-Key'],
    `${operationKey()}:create:v3`,
  );

  const updateForm = new URLSearchParams(calls[4].body);
  assert.equal(updateForm.get('end_behavior'), 'release');
  assert.equal(updateForm.get('proration_behavior'), 'none');
  assert.equal(updateForm.get('metadata[autolander_billing_date_operation]'), OPERATION_ID);
  assert.equal(updateForm.get('metadata[autolander_billing_date_target]'), String(TARGET));
  assert.equal(updateForm.get('metadata[autolander_billing_date_coupon]'), COUPON_ID);
  assert.equal(updateForm.get('phases[0][end_date]'), String(PERIOD_END));
  assert.equal(updateForm.get('phases[1][start_date]'), String(PERIOD_END));
  assert.equal(updateForm.get('phases[1][end_date]'), String(TARGET));
  assert.equal(updateForm.get('phases[1][discounts][0][coupon]'), COUPON_ID);
  assert.equal(updateForm.get('phases[2][start_date]'), String(TARGET));
  assert.equal(updateForm.get('phases[2][end_date]'), String(FULL_PERIOD_END));
  assert.equal(updateForm.get('phases[2][billing_cycle_anchor]'), 'phase_start');
  assert.equal(updateForm.has('phases[0][discounts]'), false);
  assert.equal(updateForm.has('phases[2][discounts]'), false);
  assert.equal(updateForm.get('default_settings[automatic_tax][enabled]'), 'true');
  assert.equal(updateForm.get('default_settings[automatic_tax][liability][type]'), 'self');
  assert.equal(updateForm.get('default_settings[default_payment_method]'), 'pm_customer_default');
  assert.equal(updateForm.get('default_settings[invoice_settings][issuer][type]'), 'self');
  for (let index = 0; index < 3; index += 1) {
    assert.equal(updateForm.get(`phases[${index}][automatic_tax][enabled]`), 'true');
    assert.equal(updateForm.get(`phases[${index}][default_payment_method]`), 'pm_customer_default');
    assert.equal(updateForm.get(`phases[${index}][collection_method]`), 'charge_automatically');
  }
  assert.equal(
    calls[4].headers['Idempotency-Key'],
    `${operationKey()}:update`,
  );
});

test('rejects pending invoice items before creating a coupon or schedule', async () => {
  const { response, allCalls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    {
      url: pendingInvoiceItemsUrl,
      response: stripeResponse({
        object: 'list',
        data: [{ id: 'ii_pending_charge', customer: CUSTOMER_ID, amount: 2500 }],
        has_more: false,
      }),
    },
  ]);

  assert.equal(response.status, 409);
  assert.equal(response.body.reason, 'billing_date_pending_invoice_items');
  assert.match(response.body.message, /Resolve them in Stripe/);
  assert.deepEqual(allCalls.map((call) => call.url), [subscriptionUrl, pendingInvoiceItemsUrl]);
});

for (const [label, customerBalance] of [
  ['legacy positive debit balance', { balance: 500, invoice_credit_balance: {} }],
  ['Clover currency-specific owed balance', { balance: 0, invoice_credit_balance: { usd: -500 } }],
]) {
  test(`rejects a ${label} before creating a coupon or schedule`, async () => {
    const { response, allCalls } = await invoke([
      { url: subscriptionUrl, response: stripeResponse(subscription()) },
      {
        url: pendingInvoiceItemsUrl,
        response: stripeResponse({ object: 'list', data: [], has_more: false }),
      },
      {
        url: customerUrl,
        response: stripeResponse({ id: CUSTOMER_ID, ...customerBalance }),
      },
    ]);

    assert.equal(response.status, 409);
    assert.equal(response.body.reason, 'billing_date_customer_balance');
    assert.match(response.body.message, /Resolve it in Stripe/);
    assert.deepEqual(
      allCalls.map((call) => call.url),
      [subscriptionUrl, pendingInvoiceItemsUrl, customerUrl],
    );
  });
}

test('a same-target retry recognizes the owned schedule without another mutation', async () => {
  const { response, allCalls } = await invoke([
    {
      url: subscriptionUrl,
      response: stripeResponse(subscription({ schedule: SCHEDULE_ID })),
    },
    { url: scheduleUrl, response: stripeResponse(updatedSchedule()) },
    {
      url: pendingInvoiceItemsUrl,
      response: stripeResponse({ object: 'list', data: [], has_more: false }),
    },
    {
      url: customerUrl,
      response: stripeResponse({ id: CUSTOMER_ID, balance: 0, invoice_credit_balance: {} }),
    },
  ]);

  assert.equal(response.status, 200);
  assert.equal(response.body.scheduleId, SCHEDULE_ID);
  assert.equal(allCalls.every((call) => call.method === 'GET'), true);
});

test('a same-target retry does not repeat a stale success promise after a pending charge appears', async () => {
  const { response, allCalls } = await invoke([
    {
      url: subscriptionUrl,
      response: stripeResponse(subscription({ schedule: SCHEDULE_ID })),
    },
    { url: scheduleUrl, response: stripeResponse(updatedSchedule()) },
    {
      url: pendingInvoiceItemsUrl,
      response: stripeResponse({
        object: 'list',
        data: [{ id: 'ii_added_after_schedule', customer: CUSTOMER_ID, amount: 2500 }],
        has_more: false,
      }),
    },
  ]);

  assert.equal(response.status, 409);
  assert.equal(response.body.reason, 'billing_date_pending_invoice_items');
  assert.equal(allCalls.every((call) => call.method === 'GET'), true);
});

test('does not silently create a misspelled explicitly configured coupon', async () => {
  const customCouponId = 'CUSTOM_GRACE_COUPON';
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    {
      url: `https://api.stripe.com/v1/coupons/${customCouponId}`,
      response: stripeResponse({ error: { code: 'resource_missing' } }, 404),
    },
  ], { BILLING_DATE_GRACE_COUPON_ID: customCouponId });

  assert.equal(response.status, 503);
  assert.equal(response.body.reason, 'billing_date_coupon_missing');
  assert.match(response.body.message, /does not exist/);
});

test('rejects a grace coupon that can expire or run out before the bridge', async () => {
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    {
      url: defaultCouponUrl,
      response: stripeResponse(coupon({
        max_redemptions: 10,
        redeem_by: PERIOD_END - 1,
      })),
    },
  ]);

  assert.equal(response.status, 503);
  assert.equal(response.body.reason, 'billing_date_coupon_invalid');
  assert.match(response.body.message, /unrestricted/);
});

test('reports the exact missing permission when managed coupon setup is denied', async () => {
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse({ error: { code: 'resource_missing' } }, 404) },
    {
      url: 'https://api.stripe.com/v1/coupons',
      method: 'POST',
      response: stripeResponse({ error: { message: 'The key lacks coupons.write.' } }, 403),
    },
  ]);

  assert.equal(response.status, 403);
  assert.equal(response.body.reason, 'stripe_permissions_missing');
  assert.equal(response.body.stage, 'coupon setup');
  assert.match(response.body.message, /STRIPE_BILLING_ADMIN_KEY/);
  assert.match(response.body.message, /coupons\.write/);
});

test('reports schedule-create permission failures before any customer schedule exists', async () => {
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    {
      url: schedulesUrl,
      method: 'POST',
      response: stripeResponse({ error: { message: 'The key lacks subscription_schedules.write.' } }, 403),
    },
  ]);

  assert.equal(response.status, 403);
  assert.equal(response.body.reason, 'stripe_permissions_missing');
  assert.equal(response.body.stage, 'schedule creation');
  assert.match(response.body.message, /subscription_schedules\.write/);
});

test('retries an indeterminate schedule creation with the identical idempotency key', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    {
      url: schedulesUrl,
      method: 'POST',
      response: () => { throw new Error('connection reset after request write'); },
    },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    { url: scheduleUrl, method: 'POST', response: stripeResponse(updatedSchedule()) },
  ]);

  assert.equal(response.status, 200);
  assert.equal(calls[2].headers['Idempotency-Key'], calls[3].headers['Idempotency-Key']);
  assert.equal(calls[2].headers['Idempotency-Key'], `${operationKey()}:create:v3`);
});

test('retries an incomplete 200 create response with the identical idempotency key', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse({}) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    { url: scheduleUrl, method: 'POST', response: stripeResponse(updatedSchedule()) },
  ]);

  assert.equal(response.status, 200);
  assert.equal(calls[2].headers['Idempotency-Key'], calls[3].headers['Idempotency-Key']);
});

test('treats a still-in-use create idempotency key as outcome-unknown', async () => {
  const inUse = stripeResponse({
    error: {
      code: 'idempotency_key_in_use',
      message: 'Another request with the same idempotency key is executing.',
    },
  }, 409);
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: inUse },
    { url: schedulesUrl, method: 'POST', response: inUse },
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
  ]);

  assert.equal(response.status, 502);
  assert.equal(response.body.reason, 'schedule_create_outcome_unknown');
  assert.equal(calls[2].headers['Idempotency-Key'], calls[3].headers['Idempotency-Key']);
});

test('does not overwrite an unowned schedule after both create responses are lost', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    {
      url: schedulesUrl,
      method: 'POST',
      response: () => { throw new Error('first response lost'); },
    },
    {
      url: schedulesUrl,
      method: 'POST',
      response: () => { throw new Error('idempotent replay response lost'); },
    },
    {
      url: subscriptionUrl,
      response: stripeResponse(subscription({ schedule: SCHEDULE_ID })),
    },
  ]);

  assert.equal(response.status, 502);
  assert.equal(response.body.reason, 'schedule_create_outcome_unknown');
  assert.equal(response.body.scheduleId, SCHEDULE_ID);
  assert.match(response.body.message, /was not modified further/i);
  assert.equal(calls[2].headers['Idempotency-Key'], calls[3].headers['Idempotency-Key']);
  assert.equal(calls.length, 5);
});

test('retries an indeterminate schedule update with the identical idempotency key', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: () => { throw new Error('update response lost'); },
    },
    { url: scheduleUrl, method: 'POST', response: stripeResponse(updatedSchedule()) },
  ]);

  assert.equal(response.status, 200);
  assert.equal(calls[3].headers['Idempotency-Key'], calls[4].headers['Idempotency-Key']);
  assert.equal(calls[3].headers['Idempotency-Key'], `${operationKey()}:update`);
});

test('reconciles two lost update responses from the exact Stripe schedule state', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: () => { throw new Error('first update response lost'); },
    },
    {
      url: scheduleUrl,
      method: 'POST',
      response: () => { throw new Error('replayed update response lost'); },
    },
    { url: scheduleUrl, response: stripeResponse(updatedSchedule()) },
  ]);

  assert.equal(response.status, 200);
  assert.equal(calls[3].headers['Idempotency-Key'], calls[4].headers['Idempotency-Key']);
  assert.equal(calls.some((call) => call.url === releaseUrl), false);
});

test('leaves an indeterminate update for review when Stripe readback is not exact', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: () => { throw new Error('first update response lost'); },
    },
    {
      url: scheduleUrl,
      method: 'POST',
      response: () => { throw new Error('replayed update response lost'); },
    },
    { url: scheduleUrl, response: stripeResponse(createdSchedule()) },
  ]);

  assert.equal(response.status, 502);
  assert.equal(response.body.reason, 'schedule_update_outcome_unknown');
  assert.equal(calls.some((call) => call.url === releaseUrl), false);
});

test('releases a temporary schedule after an update error and retains Stripe diagnostics', async () => {
  const { response, calls } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: stripeResponse({
        error: {
          message: 'Invalid phases[1][discounts].',
          code: 'parameter_invalid_empty',
          param: 'phases[1][discounts]',
        },
      }, 400, { 'request-id': 'req_schedule_update' }),
    },
    { url: releaseUrl, method: 'POST', response: stripeResponse({ id: SCHEDULE_ID, status: 'released' }) },
  ]);

  assert.equal(response.status, 400);
  assert.equal(response.body.reason, 'billing_date_schedule_update_failed');
  assert.equal(response.body.message, 'Invalid phases[1][discounts].');
  assert.equal(response.body.code, 'parameter_invalid_empty');
  assert.equal(response.body.param, 'phases[1][discounts]');
  assert.equal(response.body.requestId, 'req_schedule_update');
  assert.equal(response.body.stage, 'schedule update');
  assert.equal(
    calls[4].headers['Idempotency-Key'],
    `${operationKey()}:rollback`,
  );
});

test('releases and rejects a Stripe response that lost automatic-tax settings', async () => {
  const unsafe = updatedSchedule({
    default_settings: {
      ...createdSchedule().default_settings,
      automatic_tax: { enabled: false },
    },
    phases: updatedSchedule().phases.map((entry) => ({
      ...entry,
      automatic_tax: { enabled: false },
    })),
  });
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    { url: scheduleUrl, method: 'POST', response: stripeResponse(unsafe) },
    { url: releaseUrl, method: 'POST', response: stripeResponse({ id: SCHEDULE_ID, status: 'released' }) },
  ]);

  assert.equal(response.status, 502);
  assert.equal(response.body.reason, 'schedule_verification_failed');
  assert.match(response.body.message, /active-phase changes can persist/i);
});

const unsafeScheduleCases = [
  ['changed price and quantity', (schedule) => {
    schedule.phases[2].items[0].price = 'price_wrong';
    schedule.phases[2].items[0].quantity = 99;
  }],
  ['an extra bridge discount', (schedule) => {
    schedule.phases[1].discounts.push({ coupon: 'EXTRA_COUPON' });
  }],
  ['the bridge coupon retained on renewal', (schedule) => {
    schedule.phases[2].discounts = [{ source: { coupon: COUPON_ID } }];
  }],
  ['changed collection and payment settings', (schedule) => {
    schedule.default_settings.collection_method = 'send_invoice';
    schedule.default_settings.default_payment_method = 'pm_wrong';
    for (const entry of schedule.phases) {
      entry.collection_method = 'send_invoice';
      entry.default_payment_method = 'pm_wrong';
    }
  }],
  ['a changed invoice issuer', (schedule) => {
    schedule.default_settings.invoice_settings = {
      issuer: { type: 'account', account: 'acct_wrong' },
    };
    for (const entry of schedule.phases) {
      entry.invoice_settings = { issuer: { type: 'account', account: 'acct_wrong' } };
    }
  }],
  ['missing operation ownership metadata', (schedule) => {
    delete schedule.metadata.autolander_billing_date_operation;
  }],
  ['unexpected phase metadata', (schedule) => {
    schedule.phases[2].metadata.unexpected_webhook_flag = 'true';
  }],
  ['a different schedule ID', (schedule) => {
    schedule.id = SECOND_SCHEDULE_ID;
  }],
  ['a current phase that no longer matches the paid subscription period', (schedule) => {
    schedule.current_phase = { start_date: PERIOD_END, end_date: TARGET };
  }],
  ['a surprise invoice item and trial', (schedule) => {
    schedule.phases[2].add_invoice_items = [{ price: 'price_surprise', quantity: 1 }];
    schedule.phases[2].trial_end = FULL_PERIOD_END - 60;
  }],
  ['unexpected payment routing', (schedule) => {
    schedule.default_settings.default_source = 'card_legacy_wrong';
    schedule.default_settings.transfer_data = { destination: 'acct_wrong' };
    schedule.default_settings.on_behalf_of = 'acct_wrong';
    schedule.phases[2].application_fee_percent = 10;
  }],
  ['an unexpected automatic-tax liability', (schedule) => {
    schedule.default_settings.automatic_tax = {
      enabled: true,
      liability: { type: 'account', account: 'acct_wrong' },
    };
    for (const entry of schedule.phases) {
      entry.automatic_tax = {
        enabled: true,
        liability: { type: 'account', account: 'acct_wrong' },
      };
    }
  }],
];

for (const [label, mutate] of unsafeScheduleCases) {
  test(`rejects a nominally successful schedule with ${label}`, async () => {
    const unsafe = structuredClone(updatedSchedule());
    mutate(unsafe);
    const { response } = await invoke([
      { url: subscriptionUrl, response: stripeResponse(subscription()) },
      { url: defaultCouponUrl, response: stripeResponse(coupon()) },
      { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
      { url: scheduleUrl, method: 'POST', response: stripeResponse(unsafe) },
      { url: releaseUrl, method: 'POST', response: stripeResponse({ id: SCHEDULE_ID, status: 'released' }) },
    ]);

    assert.equal(response.status, 502);
    assert.equal(response.body.reason, 'schedule_verification_failed');
  });
}

const unsafeSourceScheduleCases = [
  ['a wrong current-period start', (schedule) => {
    schedule.phases[0].start_date = PERIOD_START - 86400;
  }],
  ['an extra subscription item', (schedule) => {
    schedule.phases[0].items.push({ price: 'price_extra', quantity: 1, metadata: {} });
  }],
  ['changed tax, payment, and invoice settings', (schedule) => {
    schedule.default_settings.automatic_tax = { enabled: false };
    schedule.default_settings.default_payment_method = 'pm_wrong';
    schedule.default_settings.invoice_settings = {
      issuer: { type: 'account', account: 'acct_wrong' },
    };
    schedule.phases[0].automatic_tax = { enabled: false };
    schedule.phases[0].default_payment_method = 'pm_wrong';
    schedule.phases[0].invoice_settings = {
      issuer: { type: 'account', account: 'acct_wrong' },
    };
  }],
  ['a different billing mode', (schedule) => {
    schedule.billing_mode = { type: 'classic', flexible: null };
  }],
  ['metadata that does not match the subscription', (schedule) => {
    schedule.phases[0].metadata = { orgId: 'org_wrong', injected: 'true' };
    schedule.phases[0].items[0].metadata = { item_source: 'wrong' };
  }],
  ['a current phase that does not match the subscription period', (schedule) => {
    schedule.current_phase = { start_date: PERIOD_END, end_date: TARGET };
  }],
];

for (const [label, mutate] of unsafeSourceScheduleCases) {
  test(`releases a newly created source schedule with ${label}`, async () => {
    const unsafeSource = structuredClone(createdSchedule());
    mutate(unsafeSource);
    const { response } = await invoke([
      { url: subscriptionUrl, response: stripeResponse(subscription()) },
      { url: defaultCouponUrl, response: stripeResponse(coupon()) },
      { url: schedulesUrl, method: 'POST', response: stripeResponse(unsafeSource) },
      { url: releaseUrl, method: 'POST', response: stripeResponse({ id: SCHEDULE_ID, status: 'released' }) },
    ]);

    assert.equal(response.status, 409);
    assert.equal(response.body.reason, 'unsupported_schedule');
  });
}

test('rejects an automatic-tax false-to-true change as well as true-to-false loss', async () => {
  const originalSubscription = subscription({ automatic_tax: { enabled: false } });
  const originalSchedule = createdSchedule({
    default_settings: {
      ...createdSchedule().default_settings,
      automatic_tax: { enabled: false },
    },
    phases: [phase(PERIOD_START, PERIOD_END, { automatic_tax: { enabled: false } })],
  });
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(originalSubscription) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(originalSchedule) },
    { url: scheduleUrl, method: 'POST', response: stripeResponse(updatedSchedule()) },
    { url: releaseUrl, method: 'POST', response: stripeResponse({ id: SCHEDULE_ID, status: 'released' }) },
  ]);

  assert.equal(response.status, 502);
  assert.equal(response.body.reason, 'schedule_verification_failed');
});

test('surfaces an emergency review message when rollback also fails', async () => {
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: stripeResponse({ error: { message: 'Schedule update failed.' } }, 400),
    },
    {
      url: releaseUrl,
      method: 'POST',
      response: stripeResponse({ error: { message: 'Release denied.' } }, 403),
    },
  ]);

  assert.equal(response.status, 400);
  assert.equal(response.body.reason, 'schedule_rollback_failed');
  assert.match(response.body.message, /review it in Stripe/i);
});

test('does not claim rollback succeeded when Stripe returns an incomplete release response', async () => {
  const { response } = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: stripeResponse({ error: { message: 'Schedule update failed.' } }, 400),
    },
    { url: releaseUrl, method: 'POST', response: stripeResponse({}) },
    { url: scheduleUrl, response: stripeResponse({ id: SECOND_SCHEDULE_ID, status: 'released' }) },
  ]);

  assert.equal(response.status, 400);
  assert.equal(response.body.reason, 'schedule_rollback_failed');
  assert.match(response.body.message, /review it in Stripe/i);
});

test('a same-date retry uses a fresh operation key and updates the newly created schedule', async () => {
  const first = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(createdSchedule()) },
    {
      url: scheduleUrl,
      method: 'POST',
      response: stripeResponse({ error: { message: 'Definitive update rejection.' } }, 400),
    },
    { url: releaseUrl, method: 'POST', response: stripeResponse({ id: SCHEDULE_ID, status: 'released' }) },
  ]);
  assert.equal(first.response.status, 400);

  const secondSchedule = createdSchedule({ id: SECOND_SCHEDULE_ID });
  const secondUpdated = updatedSchedule({
    id: SECOND_SCHEDULE_ID,
    metadata: {
      autolander_billing_date_operation: SECOND_OPERATION_ID,
      autolander_billing_date_target: String(TARGET),
      autolander_billing_date_coupon: COUPON_ID,
    },
  });
  const second = await invoke([
    { url: subscriptionUrl, response: stripeResponse(subscription()) },
    { url: defaultCouponUrl, response: stripeResponse(coupon()) },
    { url: schedulesUrl, method: 'POST', response: stripeResponse(secondSchedule) },
    { url: secondScheduleUrl, method: 'POST', response: stripeResponse(secondUpdated) },
  ], {}, SECOND_OPERATION_ID);

  assert.equal(second.response.status, 200);
  assert.equal(first.calls[2].headers['Idempotency-Key'], `${operationKey()}:create:v3`);
  assert.equal(second.calls[2].headers['Idempotency-Key'], `${operationKey(SECOND_OPERATION_ID)}:create:v3`);
  assert.notEqual(first.calls[2].headers['Idempotency-Key'], second.calls[2].headers['Idempotency-Key']);
  assert.equal(second.calls[3].url, secondScheduleUrl);
  assert.equal(second.calls[3].headers['Idempotency-Key'], `${operationKey(SECOND_OPERATION_ID)}:update`);
});

test('the admin API preserves a safe backend Stripe diagnostic for the banner', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => stripeResponse({
    ok: false,
    reason: 'stripe_permissions_missing',
    message: 'Stripe denied the billing schedule creation request.',
    stage: 'schedule creation',
    code: 'permission_denied',
    requestId: 'req_admin_banner',
  }, 403);

  try {
    await assert.rejects(
      () => apiPost('/admin/support-adjustments/billing-date', {}),
      (error) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.message, 'stripe_permissions_missing');
        assert.equal(error.serverMessage, 'Stripe denied the billing schedule creation request.');
        assert.equal(error.reason, 'stripe_permissions_missing');
        assert.equal(error.stage, 'schedule creation');
        assert.equal(error.code, 'permission_denied');
        assert.equal(error.requestId, 'req_admin_banner');
        assert.equal(
          friendlyAdjustmentError(error),
          'Stripe denied the billing schedule creation request.',
        );
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('each explicit admin retry receives a new transport-stable operation ID', async () => {
  const originalFetch = globalThis.fetch;
  const bodies = [];
  globalThis.fetch = async (_input, options = {}) => {
    bodies.push(JSON.parse(options.body));
    return stripeResponse({ ok: true });
  };

  try {
    await scheduleNextBillingDate({
      subscriptionId: SUBSCRIPTION_ID,
      nextBillingDate: NEXT_BILLING_DATE,
    });
    await scheduleNextBillingDate({
      subscriptionId: SUBSCRIPTION_ID,
      nextBillingDate: NEXT_BILLING_DATE,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(bodies.length, 2);
  assert.match(bodies[0].operationId, /^[A-Za-z0-9_-]{8,64}$/);
  assert.match(bodies[1].operationId, /^[A-Za-z0-9_-]{8,64}$/);
  assert.notEqual(bodies[0].operationId, bodies[1].operationId);
});
