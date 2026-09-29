import assert from 'node:assert/strict';
import test from 'node:test';
import { browser, installBrowser, trackerModule } from '../test-support/tracking-browser.js';
import { gaEvent, GA_EVENTS } from '../src/lib/ga.js';

test('facade returns the CAPI eventId and mirrors only approved params, never the Meta ID', async (t) => {
  const h = browser(); installBrowser(t, h);
  const ga = [], requests = [];
  h.window.alTags = { ga: (...args) => ga.push(args) };
  t.mock.method(globalThis, 'fetch', async (url, init) => { requests.push({ url, init, body: JSON.parse(init.body) }); return Response.json({ ok: true }); });
  const tags = await trackerModule({ facade: true });
  const id = tags.trackCustom('OutboundClick', { content_name: 'download', action: 'download_installer', eventId: 'never-in-ga', junk: 'no' });
  assert.equal(requests.length, 1); assert.equal(requests[0].body.eventId, id);
  assert.deepEqual(ga, [['outbound_click', { content_name: 'download', action: 'download_installer' }]]);
  assert.equal(requests[0].body.channel, 'server_only');
  assert.equal(requests[0].init.keepalive, true); assert.equal(requests[0].init.credentials, 'omit'); assert.equal(requests[0].init.mode, 'cors');
  tags.trackCustom('EngagedVisit'); tags.track('PageView');
  assert.equal(ga.length, 1);
  tags.trackCustom('ApplicationOpened', { content_category: 'demo' });
  tags.trackCustom('ChatOpened', { content_name: 'chat_assistant' });
  assert.deepEqual(ga.slice(1), [['application_opened', { content_category: 'demo' }], ['chat_opened', { content_name: 'chat_assistant' }]]);
});

test('GA helper queues allowlisted events and fails open without a browser or when blocked', (t) => {
  assert.equal(gaEvent('generate_lead'), false);
  const h = browser(); installBrowser(t, h);
  for (const event of GA_EVENTS) assert.equal(gaEvent(event, { method: 'test' }), true);
  assert.equal(h.window.alTagsQ.length, GA_EVENTS.length);
  assert.equal(gaEvent('Lead'), false);
  h.window.alTags = { ga: () => { throw new Error('blocked'); } };
  assert.equal(gaEvent('generate_lead'), false);
});

test('no-track and preview tracker calls have no network, identity cookies or engagement timer', async (t) => {
  let count = 0; t.mock.method(globalThis, 'fetch', async () => { count++; });
  for (const [url, mode] of [['https://autolander.ai/admin', 'production'], ['https://autolander.ai/', 'preview'], ['https://preview.autolander.ai/', 'production']]) {
    const h = browser({ url }); installBrowser(t, h);
    const tags = await trackerModule({ facade: true, mode });
    tags.pageView(); tags.trackCustom('OutboundClick');
    assert.equal(h.writes.length + h.timers.size, 0);
  }
  assert.equal(count, 0);
});

test('QA code persists for the session; URLs and stored attribution are redacted before CAPI', async (t) => {
  const h = browser({ url: 'https://autolander.ai/pay/private?test_event_code=TESTabc12',
    referrer: 'https://autolander.ai/pay/refsecret',
    cookies: { al_attr: JSON.stringify({ landing_page: 'https://autolander.ai/pay/firstsecret', referrer: '/pay/refsecret' }) },
  }); installBrowser(t, h);
  const bodies = [];
  t.mock.method(globalThis, 'fetch', async (_url, init) => { bodies.push(JSON.parse(init.body)); return Response.json({ ok: true }); });
  const tracker = await trackerModule(); tracker.pageView();
  h.window.location = new URL('https://autolander.ai/'); tracker.trackCustom('ChatOpened');
  assert.equal(h.session.get('al_test_event_code'), 'TESTabc12');
  assert.equal(bodies.length, 2);
  assert.ok(bodies.every((b) => b.testEventCode === 'TESTabc12'));
  assert.doesNotMatch(JSON.stringify(bodies), /private|refsecret|firstsecret/);
  assert.match(bodies[0].sourceUrl, /\/pay\/:token/);
  h.session.set('al_test_event_code', 'invalid'); tracker.trackCustom('ChatOpened');
  assert.equal(bodies[2].testEventCode, undefined);
});
