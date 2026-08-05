import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBillingStatus } from '../worker/src/admin/billing-cycle.js';

const SUBSCRIPTION_ID = 'sub_status123';
const PERIOD_START = Date.UTC(2026, 6, 31, 12, 30, 0) / 1000;
const PERIOD_END = Date.UTC(2026, 7, 31, 12, 30, 0) / 1000;
const FIXED_NOW = Date.UTC(2026, 7, 5, 16, 0, 0) / 1000;

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
    status: 'active',
    collection_method: 'charge_automatically',
    items: { data: [item] },
    ...overrides,
  };
}

async function readStatus(subscription, invoices = []) {
  const originalFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    urls.push(url);
    assert.equal(options?.headers?.Authorization, 'Bearer sk_test_status');
    if (url.includes('/subscriptions/')) return stripeResponse(subscription);
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
  assert.deepEqual(urls, [`https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`]);
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

test('future trial end is reported as an already scheduled bridge', async () => {
  const trialEnd = Date.UTC(2026, 7, 15, 12, 30, 0) / 1000;
  const originalNow = Date.now;
  Date.now = () => FIXED_NOW * 1000;

  try {
    const { response } = await readStatus(simpleSubscription({
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
