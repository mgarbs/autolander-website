// Worker public pay-page proxy (worker/src/booking/pay-proxy.js + booking/router.js).
//
// GET /api/pay/:token may carry the Stripe Checkout Session id on the success return; only a
// well-formed id is forwarded to the cloud, and no other client query ever reaches it.

import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../worker/src/index.js';
import { getPaySummary } from '../worker/src/booking/pay-proxy.js';

const env = { AUTOLANDER_CLOUD_URL: 'https://cloud.example.test' };

async function withFetchStub(respond, run) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return respond(String(url), init);
  };
  try {
    await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const summaryResponse = () => new Response(JSON.stringify({ status: 'completed', businessName: 'Acme Motors' }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});

test('getPaySummary forwards a valid session id and nothing else', async () => {
  await withFetchStub(summaryResponse, async (calls) => {
    const result = await getPaySummary(env, 'tok', { sessionId: 'cs_live_abc' });
    assert.equal(result.status, 200);
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/pay/tok?session_id=cs_live_abc');
    assert.equal(calls.at(-1).init.method, 'GET');

    for (const sessionId of ['abc', 'cs_x&evil=1', 'cs_', `cs_${'a'.repeat(300)}`, ['cs_live_abc'], null, undefined, '']) {
      await getPaySummary(env, 'tok', { sessionId });
      assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/pay/tok', String(sessionId));
    }
    await getPaySummary(env, 'tok');
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/pay/tok');

    await getPaySummary(env, 'a/b?c', { sessionId: 'cs_test_1' });
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/pay/a%2Fb%3Fc?session_id=cs_test_1');
  });
});

test('through the Worker entry only session_id is forwarded, and the answer is no-store', async () => {
  await withFetchStub(summaryResponse, async (calls) => {
    const response = await worker.fetch(
      new Request('https://autolander.ai/api/pay/tok?session_id=cs_live_abc&other=1'),
      env,
      {},
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Cache-Control') || '', /no-store/);
    assert.deepEqual(await response.json(), { status: 'completed', businessName: 'Acme Motors' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://cloud.example.test/api/pay/tok?session_id=cs_live_abc');

    const plain = await worker.fetch(new Request('https://autolander.ai/api/pay/tok?other=1&state=success'), env, {});
    assert.equal(plain.status, 200);
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/pay/tok');

    const forged = await worker.fetch(
      new Request('https://autolander.ai/api/pay/tok?session_id=cs_live_abc%26admin%3D1'),
      env,
      {},
    );
    assert.equal(forged.status, 200);
    assert.equal(calls.at(-1).url, 'https://cloud.example.test/api/pay/tok');
  });
});

test('a cloud error on the success fetch is passed through unchanged', async () => {
  await withFetchStub(
    () => new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }),
    async () => {
      const result = await getPaySummary(env, 'missing', { sessionId: 'cs_live_abc' });
      assert.equal(result.status, 404);
      assert.deepEqual(result.body, { error: 'not_found' });
    },
  );
});
