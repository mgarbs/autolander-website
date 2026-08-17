import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBillingDateRequest } from '../worker/src/admin/router.js';

function post(body) {
  return new Request('https://admin.example.test/admin-api/support-adjustments/billing-date', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('forgive_past_due dispatch proxies the billing-anchor request and preserves the cloud response', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const cloudBody = { ok: true, moved: true, nextBillingDate: '2026-08-15' };

  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify(cloudBody), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const result = await handleBillingDateRequest(post({
      mode: 'forgive_past_due',
      orgId: 'org_123',
      subscriptionId: 'sub_abc123',
      nextBillingDate: '2026-08-15',
      note: 'Customer requested the 15th.',
    }), {
      OPS_ADMIN_TOKEN: 'ops-secret',
      AUTOLANDER_CLOUD_URL: 'https://cloud.example.test/',
    });

    assert.equal(result.status, 202);
    assert.deepEqual(result.body, cloudBody);
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      'https://cloud.example.test/api/ops/support-adjustments/billing-anchor',
    );
    assert.equal(calls[0].options.method, 'POST');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer ops-secret');
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      orgId: 'org_123',
      subscriptionId: 'sub_abc123',
      nextBillingDate: '2026-08-15',
      note: 'Customer requested the 15th.',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('forgive_past_due dispatch rejects a missing orgId before calling the cloud', async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error('fetch should not be called');
  };

  try {
    const result = await handleBillingDateRequest(post({
      mode: 'forgive_past_due',
      subscriptionId: 'sub_abc123',
      nextBillingDate: '2026-08-15',
    }), { OPS_ADMIN_TOKEN: 'ops-secret' });

    assert.equal(result.status, 400);
    assert.equal(result.body.reason, 'invalid_billing_date_request');
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('billing-date dispatch without a mode reaches the existing Stripe schedule handler', async () => {
  const originalFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ error: { message: 'not found in test' } }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const result = await handleBillingDateRequest(post({
      subscriptionId: 'sub_active123',
      nextBillingDate: '2026-09-15',
    }), { STRIPE_SECRET_KEY: 'sk_test_123' });

    assert.deepEqual(urls, ['https://api.stripe.com/v1/subscriptions/sub_active123']);
    assert.equal(result.status, 404);
    assert.equal(result.body.reason, 'billing_date_subscription_read_failed');
    assert.equal(result.body.message, 'not found in test');
    assert.equal(result.body.stage, 'subscription read');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
