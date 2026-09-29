import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBillingStatus } from '../worker/src/admin/billing-cycle.js';
import * as billingFormat from '../src/admin/lib/billing-panel-format.js';

// The real request validator allows only alphanumeric characters after sub_.
const SUBSCRIPTION_ID = 'sub_testmulti';
const CUSTOMER_ID = 'cus_test_multi';
const PERIOD_START = Date.UTC(2026, 8, 20, 15, 15, 16) / 1000;
const TRIAL_END = Date.UTC(2026, 9, 20, 15, 10, 3) / 1000;
const FIXED_NOW = Date.UTC(2026, 8, 29, 12, 0, 0) / 1000;
const SUBSCRIPTION_URL = `https://api.stripe.com/v1/subscriptions/${SUBSCRIPTION_ID}`;
const INVOICES_URL = `https://api.stripe.com/v1/invoices?subscription=${SUBSCRIPTION_ID}&status=open&limit=10`;
const OPEN_INVOICES = [{ id: 'in_test_resume', total: 15700, created: FIXED_NOW - 3600 }];

function item(id, unitAmount, quantity, overrides = {}) {
  const { price: priceOverrides = {}, ...itemOverrides } = overrides;
  return {
    id,
    quantity,
    current_period_start: PERIOD_START,
    current_period_end: TRIAL_END,
    price: {
      id: `price_test_${id}`,
      currency: 'usd',
      unit_amount: unitAmount,
      recurring: { interval: 'month', interval_count: 1 },
      ...priceOverrides,
    },
    ...itemOverrides,
  };
}

const STARTER_X2 = item('si_starter', 3900, 2);
const PRO_X1 = item('si_pro', 7900, 1);

function trialingSubscription(items = [STARTER_X2, PRO_X1], overrides = {}) {
  return {
    id: SUBSCRIPTION_ID,
    customer: CUSTOMER_ID,
    status: 'trialing',
    collection_method: 'charge_automatically',
    trial_start: PERIOD_START,
    trial_end: TRIAL_END,
    schedule: null,
    discounts: [],
    items: { data: items, has_more: false },
    ...overrides,
  };
}

async function readStatus(subscription, invoices = []) {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  const calls = [];
  Date.now = () => FIXED_NOW * 1000;
  // Every request ends here, including unexpected requests. Never use real fetch.
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    calls.push({ url, method: options?.method || 'GET' });
    assert.equal(options?.method, 'GET');
    assert.equal(options?.body, undefined);
    assert.equal(options?.headers?.Authorization, 'Bearer sk_test_multi24');
    const body = url === SUBSCRIPTION_URL
      ? subscription
      : url === INVOICES_URL
        ? { object: 'list', data: invoices, has_more: false }
        : null;
    assert.ok(body, `Unexpected Stripe URL: ${url}`);
    return { ok: true, status: 200, json: async () => body };
  };

  try {
    const response = await handleBillingStatus(
      { method: 'GET' },
      new URL(`https://admin.example.test/admin/support-adjustments/billing-status?subscriptionId=${SUBSCRIPTION_ID}`),
      { STRIPE_BILLING_ADMIN_KEY: 'sk_test_multi24' },
    );
    return { response, calls };
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
}

function assertWithheld(response, mode, requiresBillingReview = false) {
  assert.equal(response.status, 200);
  assert.equal(response.body.mode, mode);
  assert.equal(response.body.amountCents ?? null, null);
  // Pin the serialized wire shape, not just an undefined property read.
  const body = JSON.parse(JSON.stringify(response.body));
  assert.equal(Object.hasOwn(body, 'amountCents'), false);
  assert.equal(Object.hasOwn(body, 'requiresBillingReview'), requiresBillingReview);
  const copy = billingFormat.buildBillingStatusCopy(response.body, {
    nextBillingDate: '2026-10-20',
    unpaidAmountCents: 15700,
  });
  if (requiresBillingReview) {
    assert.equal(body.requiresBillingReview, true);
    assert.equal(copy, "Review this subscription's billing settings in Stripe.");
    assert.doesNotMatch(copy, /\$|\u2014|regular charge|resumes|every month/);
  } else {
    assert.match(copy, mode === 'trial_bridge'
      ? /then their regular charge resumes\.$/
      : /Their regular charge on Oct 20, then the 20th of every month/);
  }
  assert.doesNotMatch(copy, /\$0\.00|\$78\.00|\$79\.00|\$157\.00 monthly/);
}

test('trial bridge totals every subscription item: 2 x $39 + 1 x $79 = $157', async () => {
  const { response } = await readStatus(trialingSubscription());
  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'trial_bridge',
      trialEnd: TRIAL_END,
      trialEndIso: '2026-10-20T15:10:03.000Z',
      amountCents: 15700,
      currency: 'usd',
    },
  });
});

test('the status-to-copy helper renders the whole list-price total', async () => {
  const { response } = await readStatus(trialingSubscription());
  assert.match(billingFormat.buildBillingStatusCopy(response.body),
    /no charge until Oct 20, 2026, then \$157\.00 monthly on the 20th\.$/);
});

test('the total is independent of subscription item order', async () => {
  const first = await readStatus(trialingSubscription());
  const reversed = await readStatus(trialingSubscription([PRO_X1, STARTER_X2]));
  assert.equal(first.response.body.amountCents, 15700);
  assert.deepEqual(reversed.response, first.response);
});

test('resumable past-due move totals all items and preserves invoice and date fields', async () => {
  const { response } = await readStatus(trialingSubscription(), OPEN_INVOICES);
  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      mode: 'past_due',
      amountCents: 15700,
      currency: 'usd',
      openInvoices: [{
        id: 'in_test_resume',
        totalCents: 15700,
        createdAt: FIXED_NOW - 3600,
        createdIso: '2026-09-29T11:00:00.000Z',
      }],
      minDate: '2026-09-30',
      maxDate: '2026-10-29',
      resumeTargetDate: '2026-10-20',
    },
  });
});

test('a zero-quantity item contributes nothing and deleted items are ignored', async () => {
  const { response } = await readStatus(trialingSubscription([
    item('si_growth', 5900, 0),
    STARTER_X2,
    item('si_deleted', 7900, 4, { deleted: true }),
    PRO_X1,
  ]));
  assert.equal(response.body.amountCents, 15700);
});

test('a single item with quantity zero reports a genuine $0.00 list price', async () => {
  const { response } = await readStatus(trialingSubscription([item('si_zero', 3900, 0)]));
  assert.equal(response.body.amountCents, 0);
  assert.match(billingFormat.buildBillingStatusCopy(response.body), /then \$0\.00 monthly/);
});

test('missing and null quantities default to one', async () => {
  const { response } = await readStatus(trialingSubscription([
    item('si_missing', 3900, undefined),
    item('si_null', 7900, null),
  ]));
  assert.equal(response.body.amountCents, 11800);
});

const unpriceable = {
  metered: { price: { recurring: { interval: 'month', usage_type: 'metered' } } },
  meter: { price: { recurring: { interval: 'month', meter: 'mtr_usage' } } },
  annual: { price: { recurring: { interval: 'year', interval_count: 1 } } },
  multiMonth: { price: { recurring: { interval: 'month', interval_count: 2 } } },
  oneTime: { price: { recurring: null } },
  tiered: { price: { billing_scheme: 'tiered' } },
  tiersMode: { price: { tiers_mode: 'graduated' } },
  transformed: { price: { transform_quantity: { divide_by: 10, round: 'up' } } },
  customAmount: { price: { custom_unit_amount: { enabled: true } } },
  otherCurrency: { price: { currency: 'cad' } },
  missingCurrency: { price: { currency: '' } },
  missingUnit: { price: { unit_amount: null } },
  fractionalUnit: { price: { unit_amount: 39.5 } },
  negativeUnit: { price: { unit_amount: -3900 } },
  fractionalQuantity: { quantity: 1.5 },
  negativeQuantity: { quantity: -1 },
  invalidQuantity: { quantity: 'unknown' },
  emptyQuantity: { quantity: '' },
  whitespaceQuantity: { quantity: ' ' },
  trueQuantity: { quantity: true },
  falseQuantity: { quantity: false },
  numericStringQuantity: { quantity: '2' },
  emptyArrayQuantity: { quantity: [] },
  numericArrayQuantity: { quantity: [2] },
  unsafeTotal: { quantity: Number.MAX_SAFE_INTEGER },
};

for (const [label, overrides] of Object.entries(unpriceable)) {
  test(`${label} item withholds the whole amount in both trial status branches`, async () => {
    for (const invoices of [[], OPEN_INVOICES]) {
      const extra = item('si_extra', 7900, 1, overrides);
      const { response } = await readStatus(trialingSubscription([STARTER_X2, extra]), invoices);
      assertWithheld(response, invoices.length ? 'past_due' : 'trial_bridge');
    }
  });
}

test('empty, deleted-only, and unexpanded item lists withhold the amount', async () => {
  for (const items of [[], [{ ...STARTER_X2, deleted: true }], [{ ...STARTER_X2, price: 'price_test_unexpanded' }]]) {
    const { response } = await readStatus(trialingSubscription(items));
    assertWithheld(response, 'trial_bridge');
  }
});

test('unsafe aggregate cents withhold the amount even when each line is safe', async () => {
  const { response } = await readStatus(trialingSubscription([
    item('si_large', Number.MAX_SAFE_INTEGER, 1),
    PRO_X1,
  ]));
  assertWithheld(response, 'trial_bridge');
});

test('a truncated item list withholds the amount in both trial status branches', async () => {
  for (const invoices of [[], OPEN_INVOICES]) {
    const subscription = trialingSubscription();
    subscription.items.has_more = true;
    const { response } = await readStatus(subscription, invoices);
    assertWithheld(response, invoices.length ? 'past_due' : 'trial_bridge');
  }
});

const nonResumingStates = {
  cancelAtPeriodEnd: { cancel_at_period_end: true },
  cancelAt: { cancel_at: TRIAL_END },
  pausedCollection: { pause_collection: { behavior: 'void' } },
  schedule: { schedule: 'sub_test_schedule_attached' },
  pendingUpdate: { pending_update: { expires_at: TRIAL_END } },
  sendInvoice: { collection_method: 'send_invoice' },
  cancelWithoutPaymentMethod: { trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } },
  pauseWithoutPaymentMethod: { trial_settings: { end_behavior: { missing_payment_method: 'pause' } } },
};

for (const [label, overrides] of Object.entries(nonResumingStates)) {
  test(`${label} withholds the amount and makes no resumption promise in both trial status branches`, async () => {
    for (const invoices of [[], OPEN_INVOICES]) {
      const { response } = await readStatus(trialingSubscription(undefined, overrides), invoices);
      assertWithheld(response, invoices.length ? 'past_due' : 'trial_bridge', true);
    }
  });
}

test('non-resuming states retain neutral copy even when the item list is empty or truncated', async () => {
  for (const items of [{ data: [] }, { data: [STARTER_X2], has_more: true }]) {
    for (const invoices of [[], OPEN_INVOICES]) {
      const { response } = await readStatus(trialingSubscription(undefined, {
        cancel_at_period_end: true,
        items,
      }), invoices);
      assertWithheld(response, invoices.length ? 'past_due' : 'trial_bridge', true);
    }
  }
});

test('create-invoice trial behavior keeps the justified amount without a review flag', async () => {
  for (const invoices of [[], OPEN_INVOICES]) {
    const { response } = await readStatus(trialingSubscription(undefined, {
      trial_settings: { end_behavior: { missing_payment_method: 'create_invoice' } },
    }), invoices);
    assert.equal(response.body.amountCents, 15700);
    assert.equal(Object.hasOwn(response.body, 'requiresBillingReview'), false);
  }
});

const adjustments = {
  subscriptionDiscounts: { discounts: [{ id: 'di_subscription' }] },
  discountList: { discounts: { data: [{ id: 'di_list' }] } },
  legacyDiscount: { discount: { id: 'di_legacy' } },
  automaticTax: { automatic_tax: { enabled: true } },
  defaultTaxRates: { default_tax_rates: ['txr_default'] },
  itemDiscounts: { items: { data: [STARTER_X2, { ...PRO_X1, discounts: ['di_item'] }] } },
  itemTaxRates: { items: { data: [STARTER_X2, { ...PRO_X1, tax_rates: ['txr_item'] }] } },
};

for (const [label, overrides] of Object.entries(adjustments)) {
  test(`${label} qualifies the list price before tax and discounts`, async () => {
    for (const invoices of [[], OPEN_INVOICES]) {
      const { response } = await readStatus(trialingSubscription(undefined, overrides), invoices);
      assert.equal(response.body.amountCents, 15700);
      assert.equal(response.body.amountBeforeTaxAndDiscounts, true);
      const copy = billingFormat.buildBillingStatusCopy(response.body, {
        nextBillingDate: '2026-10-20',
        unpaidAmountCents: 15700,
      });
      assert.match(copy, /before tax and discounts/);
    }
  });
}

test('inactive tax settings and deleted discounted items do not add a qualifier', async () => {
  const { response } = await readStatus(trialingSubscription([
    STARTER_X2,
    PRO_X1,
    { ...PRO_X1, deleted: true, discounts: ['di_deleted'], tax_rates: ['txr_deleted'] },
  ], { automatic_tax: { enabled: false }, default_tax_rates: [], discount: null }));
  assert.equal(response.body.amountCents, 15700);
  assert.equal(Object.hasOwn(response.body, 'amountBeforeTaxAndDiscounts'), false);
});

test('billing status is repeatable with exactly two GET-only Stripe calls each time', async () => {
  const subscription = trialingSubscription();
  const before = structuredClone(subscription);
  const first = await readStatus(subscription);
  const second = await readStatus(subscription);
  assert.deepEqual(second.response, first.response);
  assert.deepEqual(subscription, before);
  const expectedCalls = [
    { url: SUBSCRIPTION_URL, method: 'GET' },
    { url: INVOICES_URL, method: 'GET' },
  ];
  assert.deepEqual(first.calls, expectedCalls);
  assert.deepEqual(second.calls, expectedCalls);
});
