import assert from 'node:assert/strict';
import test from 'node:test';
import { handleCapi } from '../worker/src/capi/router.js';

class MemoryKv {
  values = new Map();
  puts = [];
  async get(key, type) {
    const value = this.values.get(key);
    return value === undefined ? null : type === 'json' ? JSON.parse(value) : value;
  }
  async put(key, value) { this.puts.push(key); this.values.set(key, String(value)); }
}
const eventId = 'evt_early_reply_123456789';
const fbp = 'fb.1.1700000000000.123456789';
function request(overrides = {}) {
  return new Request('https://autolander.ai/capi/track', {
    method: 'POST',
    headers: { Origin: 'https://autolander.ai', 'Content-Type': 'application/json',
      'CF-Connecting-IP': '192.0.2.1', 'User-Agent': 'Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36' },
    body: JSON.stringify({ event: 'PageView', eventId, fbp, vid: 'v_abcdefghijklmnopqrstuv',
      sourceUrl: 'https://autolander.ai/team/', channel: 'server_only', testEventCode: 'TEST123', ...overrides }),
  });
}
function harness(t) {
  const sent = [], promises = [];
  const tracking = new MemoryKv(), limits = new MemoryKv();
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.match(String(url), /graph.facebook.com/);
    sent.push(JSON.parse(init.body));
    return Response.json({ events_received: 1 });
  });
  return { sent, promises, tracking, limits, ctx: { waitUntil: (work) => promises.push(work) },
    env: { TRACKING: tracking, CHAT_RATE_LIMITS: limits, META_PIXEL_ID: '123456789',
      META_CAPI_ACCESS_TOKEN: 'test-token', ALLOW_QA_TEST_EVENT_CODE: 'true' } };
}

test('early reply precedes blocked writes, preserves identity and deduplicates deferred sends', async (t) => {
  const h = harness(t);
  let release;
  const blocked = new Promise((resolve) => { release = resolve; });
  const original = h.limits.put.bind(h.limits);
  h.limits.put = async (...args) => { await blocked; return original(...args); };
  const response = await handleCapi(request(), h.env, {}, h.ctx);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, queued: true });
  assert.equal(h.promises.length, 1);
  assert.equal(h.limits.puts.length, 0);
  assert.equal(h.sent.length, 0);
  release();
  await h.promises[0];
  assert.equal(h.tracking.puts.filter((key) => key === `evt:${eventId}`).length, 1);
  assert.equal(h.sent.length, 1);
  assert.equal(h.sent[0].data[0].event_id, eventId);
  assert.equal(h.sent[0].data[0].user_data.fbp, fbp);
  assert.equal(h.sent[0].test_event_code, 'TEST123');
  const writes = h.tracking.puts.length;
  await handleCapi(request(), h.env, {}, h.ctx);
  await h.promises[1];
  assert.equal(h.sent.length, 1);
  assert.equal(h.tracking.puts.length, writes, 'duplicate has no visitor, event or counter writes');
});

test('rate limits and invalid event IDs are decided before waitUntil', async (t) => {
  const h = harness(t);
  h.env.TRACK_DAILY_GLOBAL_LIMIT = '1';
  h.limits.values.set(`track:global:${new Date().toISOString().slice(0, 10)}`, '1');
  assert.equal((await handleCapi(request(), h.env, {}, h.ctx)).status, 429);
  h.limits.values.clear();
  assert.equal((await handleCapi(request({ eventId: '' }), h.env, {}, h.ctx)).status, 400);
  assert.equal(h.promises.length, 0);
  assert.equal(h.sent.length, 0);
});

test('without ctx the original response and duplicate behavior remain', async (t) => {
  const h = harness(t);
  assert.deepEqual(await (await handleCapi(request(), h.env, {})).json(), { ok: true, deduped: false });
  assert.deepEqual(await (await handleCapi(request(), h.env, {})).json(), { ok: true, deduped: true });
  assert.equal(h.sent.length, 1);
});

for (const failure of ['rate-limit', 'counter', 'visitor', 'daily-seen', 'recent', 'dedupe-write', 'dedupe-read']) {
  test(`${failure} KV failure cannot drop a deferred Meta event`, async (t) => {
    const h = harness(t);
    t.mock.method(console, 'warn', () => {});
    const prefix = { counter: 'stats:', visitor: 'vid:', 'daily-seen': 'seen:', recent: 'recent:', 'dedupe-write': 'evt:' }[failure];
    if (prefix) {
      const put = h.tracking.put.bind(h.tracking);
      h.tracking.put = async (key, ...rest) => { if (key.startsWith(prefix)) throw new Error('KV unavailable'); return put(key, ...rest); };
    }
    if (failure === 'rate-limit') h.limits.put = async () => { throw new Error('KV unavailable'); };
    if (failure === 'dedupe-read') {
      const get = h.tracking.get.bind(h.tracking);
      h.tracking.get = async (key, ...rest) => { if (key.startsWith('evt:')) throw new Error('KV unavailable'); return get(key, ...rest); };
    }
    assert.deepEqual(await (await handleCapi(request(), h.env, {}, h.ctx)).json(), { ok: true, queued: true });
    await h.promises[0];
    assert.equal(h.sent.length, 1);
  });
}
