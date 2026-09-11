import assert from 'node:assert/strict';
import test from 'node:test';

import { createAdminSubscriptionLink } from '../worker/src/admin/stripe-links.js';

function request(body) {
  return new Request('https://autolander.ai/admin/subscription-link', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('an account-selected admin checkout resolves and reuses the app Stripe customer', async (t) => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('/api/ops/billing/customer')) {
      return new Response(JSON.stringify({
        customerId: 'cus_app_existing',
        orgId: 'org_123',
        autolanderUserId: 'owner_123',
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ id: 'cs_123', url: 'https://checkout.stripe.test/cs_123' }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  };

  const result = await createAdminSubscriptionLink(request({
    amountCents: 3900,
    interval: 'monthly',
    customerEmail: 'owner@example.com',
    orgId: 'org_123',
    pickedOrgName: 'Example Motors',
  }), {
    STRIPE_SECRET_KEY: 'sk_test_fake',
    CLOUD_API_URL: 'https://cloud.example.test',
    OPS_ADMIN_TOKEN: 'ops-secret',
  });

  assert.equal(result.ok, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://cloud.example.test/api/ops/billing/customer');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer ops-secret');
  const stripe = new URLSearchParams(calls[1].init.body);
  assert.equal(stripe.get('customer'), 'cus_app_existing');
  assert.equal(stripe.has('customer_email'), false);
  assert.equal(stripe.get('metadata[orgId]'), 'org_123');
  assert.equal(stripe.get('metadata[autolander_account_id]'), 'org_123');
  assert.equal(stripe.get('metadata[autolander_user_id]'), 'owner_123');
  assert.equal(stripe.get('subscription_data[metadata][autolander_account_id]'), 'org_123');
});

test('an account-selected checkout stops before Stripe when customer resolution fails', async (t) => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify({ error: 'customer_not_found' }), {
      status: 404, headers: { 'content-type': 'application/json' },
    });
  };

  const result = await createAdminSubscriptionLink(request({ amountCents: 3900, orgId: 'org_missing' }), {
    STRIPE_SECRET_KEY: 'sk_test_fake', CLOUD_API_URL: 'https://cloud.example.test', OPS_ADMIN_TOKEN: 'ops-secret',
  });
  assert.equal(result.ok, false);
  assert.equal(result.body.reason, 'customer_resolution_failed');
  assert.equal(calls.length, 1);
});
