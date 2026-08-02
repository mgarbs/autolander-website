import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAnalyticsProxy } from '../worker/src/admin/analytics.js';
import { handleOpsCandidates } from '../worker/src/admin/ops-linking.js';
import { handleSupportAdjustmentCandidates } from '../worker/src/admin/support-adjustments.js';

test('admin read proxies forward the browser abort signal upstream', async () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  const request = { method: 'GET', signal: controller.signal };
  const env = {
    OPS_ADMIN_TOKEN: 'test-token',
    AUTOLANDER_CLOUD_URL: 'https://cloud.example.test',
  };
  const signals = [];
  const urls = [];

  globalThis.fetch = async (url, options) => {
    urls.push(String(url));
    signals.push(options?.signal);
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true, rows: [] }),
    };
  };

  try {
    await handleAnalyticsProxy(
      request,
      new URL('https://admin.example.test/admin-api/analytics/overview?fresh=1'),
      env,
      '/overview',
    );
    await handleOpsCandidates(
      request,
      new URL('https://admin.example.test/admin-api/ops/candidates?q=dealer'),
      env,
    );
    await handleSupportAdjustmentCandidates(
      request,
      new URL('https://admin.example.test/admin-api/support-adjustments/candidates?q=dealer'),
      env,
    );

    assert.equal(signals.length, 3);
    assert.ok(signals.every((signal) => signal === controller.signal));
    assert.deepEqual(urls, [
      'https://cloud.example.test/api/ops/analytics/overview?fresh=1',
      'https://cloud.example.test/api/ops/billing/candidates?q=dealer',
      'https://cloud.example.test/api/ops/support-adjustments/candidates?q=dealer',
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
