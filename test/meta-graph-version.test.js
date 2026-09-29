import assert from 'node:assert/strict';
import test from 'node:test';
import { META_GRAPH_VERSION, sendEvents } from '../worker/src/capi/meta-client.js';
import { handleCapi } from '../worker/src/capi/router.js';

test('Graph delivery URL and health use the same supported v25 constant', async (t) => {
  assert.equal(META_GRAPH_VERSION, 'v25.0');
  const env = { META_PIXEL_ID: '123456789', META_CAPI_ACCESS_TOKEN: 'test-token' };
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url: new URL(url), body: JSON.parse(init.body) });
    return Response.json({ events_received: 1 });
  });
  const event = { event_name: 'PageView', event_id: 'evt_graph_version', event_time: 1790700000, action_source: 'website', user_data: { fbp: 'fb.1.1700000000000.123' } };
  assert.deepEqual(await sendEvents(env, [event]), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, `/${META_GRAPH_VERSION}/123456789/events`);
  assert.deepEqual(calls[0].body, { data: [event] });
  const health = await (await handleCapi(new Request('https://autolander.ai/capi/health'), env, {})).json();
  assert.equal(health.graphVersion, META_GRAPH_VERSION);
});
