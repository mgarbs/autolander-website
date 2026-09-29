import assert from 'node:assert/strict';
import test from 'node:test';
import { handleCapi } from '../worker/src/capi/router.js';
import { handleBooking } from '../worker/src/booking/router.js';
import { sha256Hex } from '../worker/src/capi/hash.js';

class MemoryKv {
  values = new Map();
  async get(key, type) { const v = this.values.get(key); return v === undefined ? null : type === 'json' ? JSON.parse(v) : v; }
  async put(key, value) { this.values.set(key, String(value)); }
  async delete(key) { this.values.delete(key); }
}
const vid = 'v_abcdefghijklmnopqrstuv';
const headers = { Origin: 'https://autolander.ai', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', 'CF-Connecting-IP': '203.0.113.5' };
const envFor = () => ({ TRACKING: new MemoryKv(), DISABLE_RATE_LIMITS: 'true', META_PIXEL_ID: '123456789', META_CAPI_ACCESS_TOKEN: 'test-token',
  GHL_PRIVATE_INTEGRATION_TOKEN: 'test-ghl', GHL_LOCATION_ID: 'test-location', GHL_WORKFLOW_ID: 'test-workflow' });
const request = (body, extra = {}) => new Request('https://autolander.ai/capi/track', { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify({
  event: 'PageView', eventId: `evt_${crypto.randomUUID()}`, vid, sourceUrl: 'https://autolander.ai/', ...body,
}) });
const counter = (env, name) => Number(env.TRACKING.values.get(`stats:${new Date().toISOString().slice(0, 10)}:meta:${name}`) || 0);
function mockNetwork(t) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (String(url).includes('graph.facebook.com')) calls.push({ url: String(url), body: JSON.parse(init.body) });
    if (String(url).endsWith('/contacts/upsert')) return Response.json({ contact: { id: 'contact_123' } });
    return Response.json({ events_received: 1 });
  }); return calls;
}

test('replayed server event is deduped before Graph; transition counters distinguish cached clients', async (t) => {
  const env = envFor(), calls = mockNetwork(t), body = { eventId: 'evt_same_server_only', channel: 'server_only' };
  assert.equal((await handleCapi(request(body), env, {})).status, 200);
  assert.deepEqual(await (await handleCapi(request(body), env, {})).json(), { ok: true, deduped: true });
  assert.equal(calls.length, 1);
  await handleCapi(request({ eventId: 'evt_cached_legacy_pixel' }), env, {});
  assert.equal(counter(env, 'server_only_events'), 1); assert.equal(counter(env, 'legacy_pixel_events'), 1);
});

test('per-request test code requires the flag and valid format; global test behavior survives', async (t) => {
  const calls = mockNetwork(t);
  for (const [flag, code, expected] of [['false', 'TESTabc1', undefined], ['true', 'bad', undefined], ['true', 'TEST', undefined], ['true', 'TEST' + 'x'.repeat(33), undefined], ['true', 'TESTabc1', 'TESTabc1']]) {
    const env = { ...envFor(), ALLOW_QA_TEST_EVENT_CODE: flag };
    await handleCapi(request({ testEventCode: code }), env, {});
    assert.equal(calls.at(-1).body.test_event_code, expected);
    assert.equal(counter(env, 'test_event_code'), expected ? 1 : 0);
    const recent = [...env.TRACKING.values].find(([key]) => key.startsWith('recent:evt:'));
    assert.equal(JSON.parse(recent[1]).test, expected ? true : undefined);
  }
  await handleCapi(request({}), { ...envFor(), META_TEST_EVENT_CODE: 'TESTglobal' }, {});
  assert.equal(calls.at(-1).body.test_event_code, 'TESTglobal');
});

test('protected events remain forbidden and rate/bot losses get counters', async (t) => {
  const env = envFor(), calls = mockNetwork(t);
  for (const event of ['Lead', 'Schedule', 'CompleteRegistration', 'Purchase', 'Subscribe', 'AddPaymentInfo', 'Contact']) assert.equal((await handleCapi(request({ event }), env, {})).status, 403);
  assert.equal((await handleCapi(request({}, { 'User-Agent': 'Googlebot' }), env, {})).status, 403);
  assert.equal(counter(env, 'track_bot_blocked'), 1);
  env.DISABLE_RATE_LIMITS = 'false'; env.CHAT_RATE_LIMITS = { get: async () => '999999' };
  assert.equal((await handleCapi(request({}), env, {})).status, 429);
  assert.equal(counter(env, 'track_rate_limited'), 1); assert.equal(calls.length, 0);
});

test('known visitor matching is off by default and stores only hashes after an accepted server Lead', async (t) => {
  const calls = mockNetwork(t);
  for (const enabled of [false, true]) {
    const env = { ...envFor(), ...(enabled ? { ENRICH_KNOWN_VISITOR_MATCHING: 'true' } : {}) };
    const lead = new Request('https://autolander.ai/api/apply', { method: 'POST', headers, body: JSON.stringify({
      fullName: 'Jamie Dealer', email: 'Jamie@Example.com', phone: '(212) 555-0123', role: 'Owner',
      inventoryUrl: 'https://example.com/inventory', vehicleCount: '51-150', consentTimestamp: '2026-09-29T12:00:00.000Z',
      submissionId: `sub_known_matching_${enabled}_123`, attribution: { vid },
    }) });
    assert.equal((await handleBooking(lead, env, {}, {})).status, 200);
    const stored = JSON.parse(env.TRACKING.values.get(`vid:${vid}`) || '{}');
    if (enabled) { assert.equal(stored.am.em, await sha256Hex('jamie@example.com')); assert.equal(stored.am.ph, await sha256Hex('12125550123')); }
    else assert.equal(stored.am, undefined);
    await handleCapi(request({}), env, {});
    const page = calls.at(-1).body.data[0]; assert.equal(page.event_name, 'PageView');
    assert.equal(page.user_data.em, enabled ? await sha256Hex('jamie@example.com') : undefined);
    assert.equal(page.user_data.ph, enabled ? await sha256Hex('12125550123') : undefined);
    assert.doesNotMatch(JSON.stringify(stored.am || {}), /Jamie|jamie@|555-0123/);
    if (enabled) {
      await handleCapi(request({ email: 'different@example.com' }), env, {});
      assert.equal(calls.at(-1).body.data[0].user_data.em, await sha256Hex('different@example.com'));
    }
  }
});

test('health exposes injection mode, server-only browser tracking and the server Lead switch', async () => {
  for (const value of [undefined, 'true', 'false']) {
    const env = { ...envFor(), ZARAZ_MODE: 'canary', SEND_WORKER_LEAD_CAPI: value };
    const health = await (await handleCapi(new Request('https://autolander.ai/capi/health'), env, {})).json();
    assert.equal(health.zarazMode, 'canary'); assert.equal(health.browserPixel, false);
    assert.equal(health.sendsWorkerLead, value !== 'false'); assert.equal(health.testEventCode, null);
  }
});

test('Meta vendor boundary redacts URL/path/referrer tokens even from cached browser clients', async (t) => {
  const calls = mockNetwork(t);
  await handleCapi(request({ sourceUrl: 'https://autolander.ai/pay/private', customData: { page_path: '/pay/private', referrer: 'https://autolander.ai/pay/refsecret' } }), envFor(), {});
  const event = calls[0].body.data[0];
  assert.equal(event.event_source_url, 'https://autolander.ai/pay/:token');
  assert.doesNotMatch(JSON.stringify(event), /private|refsecret/);
});
