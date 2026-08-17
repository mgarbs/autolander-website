import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBillingStatus } from '../worker/src/admin/billing-cycle.js';

const SUBSCRIPTION_ID = 'sub_status123';
const CUSTOMER_ID = 'cus_status123';
const PERIOD_START = Date.UTC(2026, 6, 31, 12, 30, 0) / 1000;
const PERIOD_END = Date.UTC(2026, 7, 31, 12, 30, 0) / 1000;
const FIXED_NOW = Date.UTC(2026, 7, 5, 16, 0, 0) / 1000;
const CUSTOMER_URL = `https://api.stripe.com/v1/customers/${CUSTOMER_ID}?expand%5B%5D=invoice_credit_balance`;

function stripeResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function simpleSubscription(overrides = {}) {
  const item = {
    id: 'si_status123',
    quantity: 1,
    current_period_start: PERIOD_START,
    current_period_end: PERIOD_END,
    price: {
      id: 'price_monthly79',
      currency: 'usd',
      unit_amount: 7900,
      recurring: { interval: 'month', interval_count: 1 },
    },
  };
  return {
    id: SUBSCRIPTION_ID,
    customer: CUSTOMER_ID,
    status: 'active',
    collection_method: 'charge_automatically',
    items: { data: [item] },
    ...overrides,
  };
}

async function readStatus(
  subscription,
  invoices = [],
  schedule = null,
  pendingItems = [],
  customer = { id: CUSTOMER_ID, balance: 0, invoice_credit_balance: {} },
) {
  const originalFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    urls.push(url);
    assert.equal(options?.headers?.Authorization, 'Bearer sk_test_status');
    if (url.includes('/subscriptions/')) return stripeResponse(subscription);
    if (url.includes('/subscription_schedules/')) return stripeResponse(schedule || {}, schedule ? 200 : 404);
    if (url.includes('/invoiceitems?')) return stripeResponse({ object: 'list', data: pendingItems, has_more: false });
    if (url.includes('/customers/')) return stripeResponse(customer);
    if (url.includes('/invoices?')) return stripeResponse({ object: 'list', data: invoices });
    throw new Error(`Unexpected Stripe URL: ${url}`);
  };

  try {
    const response = await handleBillingStatus(
      { method: 'GET' },
      new URL(`https://admin.example.test/admin/support-adjustments/billing-status?subscriptionId=${SUBSCRIPTION_ID}`),
      { STRIPE_BILLING_ADMIN_KEY: 'sk_test_status' },
    );
    return { response, urls };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('active simple monthly subscription is schedulable with the POST-compatible date window', async () => {
  const { response, urls } = await readStatus(simpleSubscription({
    items: {
      data: [{
        ...simpleSubscription().items.data[0],
        quantity: 2,
      }],
    },
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    ok: true,
    mode: 'schedulable',
    amountCents: 15800,
    currency: 'usd',
    interval: 'month',
    currentPeriodEnd: PERIOD_END,
    currentPeriodEndIso: '2026-08-31T12:30:00.000Z',
    minDate: '2026-09-01',
    maxDate: '2026-09-30',
  });
  assert.deepEqual(urls, [
    `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
    `https://api.stripe.com/v1/invoiceitems?customer=${CUSTOMER_ID}&pending=true&limit=100`,
    CUSTOMER_URL,
  ]);
});

test('an AutoLander-owned billing-date schedule is reported as already scheduled', async () => {
  const target = Date.UTC(2026, 8, 10, 12, 30, 0) / 1000;
  const fullPeriodEnd = Date.UTC(2026, 9, 10, 12, 30, 0) / 1000;
  const scheduleId = 'sub_sched_status123';
  const item = { price: 'price_monthly79', quantity: 1, metadata: {} };
  const phase = (start, end, overrides = {}) => ({
    start_date: start,
    end_date: end,
    billing_cycle_anchor: 'automatic',
    collection_method: 'charge_automatically',
    proration_behavior: 'none',
    items: [item],
    metadata: {},
    discounts: [],
    ...overrides,
  });
  const schedule = {
    id: scheduleId,
    status: 'active',
    subscription: SUBSCRIPTION_ID,
    end_behavior: 'release',
    renewal_interval: null,
    current_phase: { start_date: PERIOD_START, end_date: PERIOD_END },
    metadata: {
      autolander_billing_date_operation: 'op_status_attempt_01',
      autolander_billing_date_target: String(target),
      autolander_billing_date_coupon: 'FREE_MONTH_100',
    },
    default_settings: { collection_method: 'charge_automatically' },
    phases: [
      phase(PERIOD_START, PERIOD_END),
      phase(PERIOD_END, target, { discounts: [{ coupon: 'FREE_MONTH_100' }] }),
      phase(target, fullPeriodEnd, { billing_cycle_anchor: 'phase_start' }),
    ],
  };
  const { response, urls } = await readStatus(
    simpleSubscription({ schedule: scheduleId }),
    [],
    schedule,
  );

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'scheduled_bridge',
      amountCents: 7900,
      currency: 'usd',
      scheduledBillingAt: target,
      scheduledBillingIso: '2026-09-10T12:30:00.000Z',
      scheduleId,
    },
  });
  assert.deepEqual(urls, [
    `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
    `https://api.stripe.com/v1/subscription_schedules/${scheduleId}`,
    `https://api.stripe.com/v1/invoiceitems?customer=${CUSTOMER_ID}&pending=true&limit=100`,
    CUSTOMER_URL,
  ]);

  const pendingAfterSchedule = await readStatus(
    simpleSubscription({ schedule: scheduleId }),
    [],
    schedule,
    [{ id: 'ii_added_later', customer: CUSTOMER_ID, amount: 2500 }],
  );
  assert.equal(pendingAfterSchedule.response.body.mode, 'unsupported');
  assert.match(pendingAfterSchedule.response.body.message, /schedule is active/);
  assert.match(pendingAfterSchedule.response.body.message, /pending Stripe invoice items/);

  const corrupted = structuredClone(schedule);
  corrupted.phases[0].discounts = [{ coupon: 'TEN_PERCENT' }];
  corrupted.phases[1].discounts = [{ coupon: 'TEN_PERCENT' }];
  corrupted.phases[2].discounts = [{ coupon: 'TEN_PERCENT' }];
  const unsafe = await readStatus(
    simpleSubscription({ schedule: scheduleId }),
    [],
    corrupted,
  );
  assert.equal(unsafe.response.body.mode, 'unsupported');
  assert.match(unsafe.response.body.message, /already has a Stripe schedule/);

  const advanced = structuredClone(schedule);
  advanced.current_phase = { start_date: target, end_date: fullPeriodEnd };
  const renewedItem = {
    ...simpleSubscription().items.data[0],
    current_period_start: target,
    current_period_end: fullPeriodEnd,
  };
  const afterMovedCharge = await readStatus(
    simpleSubscription({
      schedule: scheduleId,
      items: { data: [renewedItem] },
    }),
    [],
    advanced,
  );
  assert.equal(afterMovedCharge.response.body.mode, 'unsupported');
  assert.match(afterMovedCharge.response.body.message, /already has a Stripe schedule/);
});

test('pending invoice items make an active subscription ineligible before confirmation', async () => {
  const { response, urls } = await readStatus(
    simpleSubscription(),
    [],
    null,
    [{ id: 'ii_pending_charge', customer: CUSTOMER_ID, amount: 2500 }],
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, 'unsupported');
  assert.match(response.body.message, /pending Stripe invoice items/);
  assert.deepEqual(urls, [
    `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
    `https://api.stripe.com/v1/invoiceitems?customer=${CUSTOMER_ID}&pending=true&limit=100`,
  ]);
});

test('an owed customer balance makes an active subscription ineligible before confirmation', async () => {
  const { response, urls } = await readStatus(
    simpleSubscription(),
    [],
    null,
    [],
    { id: CUSTOMER_ID, balance: 0, invoice_credit_balance: { usd: -500 } },
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, 'unsupported');
  assert.match(response.body.message, /owed Stripe balance/);
  assert.deepEqual(urls, [
    `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
    `https://api.stripe.com/v1/invoiceitems?customer=${CUSTOMER_ID}&pending=true&limit=100`,
    CUSTOMER_URL,
  ]);
});

test('metered monthly prices are rejected instead of promising a fixed delayed charge', async () => {
  const meteredItem = {
    ...simpleSubscription().items.data[0],
    price: {
      ...simpleSubscription().items.data[0].price,
      recurring: {
        ...simpleSubscription().items.data[0].price.recurring,
        usage_type: 'metered',
        meter: 'mtr_usage',
      },
    },
  };
  const { response } = await readStatus(simpleSubscription({ items: { data: [meteredItem] } }));

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, 'unsupported');
  assert.match(response.body.message, /Metered, tiered/);
});

test('past-due subscription with open invoices returns newest invoice first', async () => {
  const newerCreated = Date.UTC(2026, 7, 2, 12, 0, 0) / 1000;
  const olderCreated = Date.UTC(2026, 7, 1, 12, 0, 0) / 1000;
  const originalNow = Date.now;
  Date.now = () => FIXED_NOW * 1000;

  try {
    const { response, urls } = await readStatus(
      simpleSubscription({ status: 'past_due' }),
      [
        { id: 'in_older', total: 7900, created: olderCreated },
        { id: 'in_newer', total: 8100, created: newerCreated },
      ],
    );

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ok: true,
      mode: 'past_due',
      amountCents: 7900,
      currency: 'usd',
      openInvoices: [
        {
          id: 'in_newer',
          totalCents: 8100,
          createdAt: newerCreated,
          createdIso: '2026-08-02T12:00:00.000Z',
        },
        {
          id: 'in_older',
          totalCents: 7900,
          createdAt: olderCreated,
          createdIso: '2026-08-01T12:00:00.000Z',
        },
      ],
      minDate: '2026-08-06',
      maxDate: '2026-09-05',
    });
    assert.deepEqual(urls, [
      `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
      `https://api.stripe.com/v1/invoices?subscription=${SUBSCRIPTION_ID}&status=open&limit=10`,
    ]);
  } finally {
    Date.now = originalNow;
  }
});

test('past-due subscription does not require current-period timestamps', async () => {
  const itemWithoutPeriod = {
    ...simpleSubscription().items.data[0],
    current_period_start: undefined,
    current_period_end: undefined,
  };
  const { response } = await readStatus(
    simpleSubscription({
      status: 'past_due',
      items: { data: [itemWithoutPeriod] },
    }),
    [{ id: 'in_open', total: 7900, created: FIXED_NOW - 60 }],
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, 'past_due');
  assert.equal(response.body.amountCents, 7900);
  assert.equal(response.body.openInvoices[0].id, 'in_open');
});

test('past-due subscription with a future trial is unsupported by the existing trial guard', async () => {
  const { response, urls } = await readStatus(simpleSubscription({
    status: 'past_due',
    trial_end: FIXED_NOW + 86400,
  }), [{ id: 'in_open', total: 7900, created: FIXED_NOW - 60 }]);

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'unsupported',
      message: 'This subscription is in or has a trial configuration and cannot be adjusted here.',
    },
  });
  assert.equal(urls.length, 1);
});

test('future trial end with an open invoice is reported as a resumable past-due move', async () => {
  const trialEnd = Date.UTC(2026, 7, 15, 12, 30, 0) / 1000;
  const invoiceCreated = Date.UTC(2026, 7, 1, 12, 0, 0) / 1000;
  const originalNow = Date.now;
  Date.now = () => FIXED_NOW * 1000;

  try {
    const { response, urls } = await readStatus(simpleSubscription({
      status: 'trialing',
      trial_start: FIXED_NOW - 60,
      trial_end: trialEnd,
    }), [{ id: 'in_resume', total: 7900, created: invoiceCreated }]);

    assert.deepEqual(response, {
      status: 200,
      body: {
        ok: true,
        mode: 'past_due',
        amountCents: 7900,
        currency: 'usd',
        openInvoices: [{
          id: 'in_resume',
          totalCents: 7900,
          createdAt: invoiceCreated,
          createdIso: '2026-08-01T12:00:00.000Z',
        }],
        minDate: '2026-08-06',
        maxDate: '2026-09-05',
        resumeTargetDate: '2026-08-15',
      },
    });
    assert.deepEqual(urls, [
      `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
      `https://api.stripe.com/v1/invoices?subscription=${SUBSCRIPTION_ID}&status=open&limit=10`,
    ]);
  } finally {
    Date.now = originalNow;
  }
});

test('future trial end without open invoices is reported as an already scheduled bridge', async () => {
  const trialEnd = Date.UTC(2026, 7, 15, 12, 30, 0) / 1000;
  const originalNow = Date.now;
  Date.now = () => FIXED_NOW * 1000;

  try {
    const { response, urls } = await readStatus(simpleSubscription({
      status: 'trialing',
      trial_start: FIXED_NOW - 60,
      trial_end: trialEnd,
    }));

    assert.deepEqual(response, {
      status: 200,
      body: {
        ok: true,
        mode: 'trial_bridge',
        trialEnd,
        trialEndIso: '2026-08-15T12:30:00.000Z',
        amountCents: 7900,
        currency: 'usd',
      },
    });
    assert.deepEqual(urls, [
      `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`,
      `https://api.stripe.com/v1/invoices?subscription=${SUBSCRIPTION_ID}&status=open&limit=10`,
    ]);
  } finally {
    Date.now = originalNow;
  }
});

test('active subscription with a future trial end is unsupported rather than reported as a bridge', async () => {
  const trialEnd = Date.UTC(2026, 7, 15, 12, 30, 0) / 1000;
  const originalNow = Date.now;
  Date.now = () => FIXED_NOW * 1000;

  try {
    const { response, urls } = await readStatus(simpleSubscription({
      trial_start: FIXED_NOW - 60,
      trial_end: trialEnd,
    }));

    assert.deepEqual(response, {
      status: 200,
      body: {
        ok: true,
        mode: 'unsupported',
        message: 'This subscription is in or has a trial configuration and cannot be adjusted here.',
      },
    });
    assert.deepEqual(urls, [`https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`]);
  } finally {
    Date.now = originalNow;
  }
});

test('canceled subscription is unsupported with the canceled message', async () => {
  const { response } = await readStatus(simpleSubscription({ status: 'canceled' }));

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'unsupported',
      message: 'This subscription is canceled.',
    },
  });
});

test('active discounted subscription reuses the existing unsupported reason', async () => {
  const { response } = await readStatus(simpleSubscription({ discounts: [{ id: 'di_custom' }] }));

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'unsupported',
      message: 'This subscription has custom tax rates or discounts and cannot be adjusted here.',
    },
  });
});

test('past-due subscription without an open invoice falls through to unsupported', async () => {
  const { response, urls } = await readStatus(simpleSubscription({ status: 'past_due' }));

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'unsupported',
      message: 'Their unpaid bill was just settled or written off — refresh to see the latest.',
    },
  });
  assert.equal(urls.length, 2);
});
