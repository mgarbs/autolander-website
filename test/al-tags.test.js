import assert from 'node:assert/strict';
import test from 'node:test';
import { browser, tagsSource, installBrowser } from '../test-support/tracking-browser.js';
import { NO_TRACK_PATH_SOURCE } from '../shared/tracking-scope.js';

test('off mode has no cookies, listeners, timers or network on excluded hosts and paths', () => {
  for (const url of [
    'http://autolander.ai/', 'https://preview.autolander.ai/', 'https://autolander-preview.pages.dev/',
    'http://localhost:5173/', 'http://127.0.0.1/', 'https://example.workers.dev/',
    ...['admin', 'admin/x', 'download/setup/', 'demo', 'demo-clay', 'onboarding', 'training/x'].map((p) => `https://autolander.ai/${p}`),
  ]) {
    const h = browser({ url, queue: [['ga', 'chat_opened', {}]] }); h.run();
    assert.equal(h.window.alTags.mode(), 'off', url);
    assert.equal(h.window.alTags.ga('chat_opened'), false);
    assert.equal(h.window.alTagsQ.length, 0);
    assert.equal(h.writes.length + h.scripts.length + h.timers.size + h.window.listeners.size + h.document.listeners.size, 0);
  }
});

test('legacy queues one config, drains queued events once, loads only on a trigger and is idempotent', () => {
  const h = browser({ queue: [['ga', 'chat_opened', { n: 1 }]] }); h.run(); h.run();
  assert.equal(h.window.alTags.mode(), 'legacy');
  assert.equal(h.scripts.length, 0);
  assert.equal(h.window.dataLayer.filter((x) => x[0] === 'config').length, 1);
  assert.equal(h.window.dataLayer.find((x) => x[0] === 'config')[1], 'G-30H80LZMCH');
  assert.equal(h.window.alTagsQ.length, 0);
  h.window.alTags.ga('outbound_click', { action: 'download' });
  assert.deepEqual(Array.from(h.window.dataLayer).filter((x) => x[0] === 'event').map((x) => x[1]), ['chat_opened', 'outbound_click']);
  h.window.emit('pointerdown'); h.window.emit('scroll'); h.window.emit('keydown'); h.run();
  assert.equal(h.scripts.length, 1);
  assert.match(h.scripts[0].src, /^https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-30H80LZMCH$/);
  assert.equal(h.scripts[0].async, true);
  assert.equal(h.timers.size, 0);
  assert.equal([...h.window.listeners.values(), ...h.document.listeners.values()].flat().length, 0);
});

test('legacy timer starts 8000ms after load; eager and hidden tabs load immediately', () => {
  const h = browser({ ready: 'loading' }); h.run();
  assert.equal(h.timers.size, 0); h.window.emit('load');
  assert.deepEqual([...h.timers.values()].map((t) => t.delay), [8000]);
  [...h.timers.values()][0].fn(); assert.equal(h.scripts.length, 1);
  for (const options of [{ eager: true }, {}]) {
    const v = browser(options); v.run();
    v.document.visibilityState = 'hidden'; v.document.emit('visibilitychange');
    assert.equal(v.scripts.length, 1);
  }
});

test('zaraz resolves once, forwards flat params, swallows failures and never defines gtag/dataLayer', async () => {
  const calls = [], h = browser({ tag: '', queue: [['ga', 'application_opened', {}]] }); h.run();
  assert.equal(h.window.alTags.mode(), 'pending');
  h.window.alTags.ga('chat_opened', {});
  h.window.zaraz = { track: (...args) => { calls.push(args); return Promise.reject(new Error('blocked')); } };
  h.node.emit('load'); h.node.emit('error');
  assert.equal(h.window.alTags.mode(), 'zaraz');
  assert.equal(calls.length, 2);
  const params = Object.assign(Object.create({ inherited: 'no' }), { text: 'x'.repeat(150), object: {}, array: [], nil: null, bool: false });
  for (let i = 0; i < 30; i++) params[`k${i}`] = i;
  assert.equal(h.window.alTags.ga('outbound_click', params), true);
  const sent = calls[2][1];
  assert.equal(Object.keys(sent).length, 25); assert.equal(sent.text.length, 100);
  for (const key of ['inherited', 'object', 'array', 'nil']) assert.equal(Object.hasOwn(sent, key), false);
  assert.equal(sent.bool, false);
  assert.equal(h.window.gtag, undefined); assert.equal(h.window.dataLayer, undefined);
  assert.equal(h.scripts.length + h.timers.size, 0);
  await Promise.resolve();
  h.window.zaraz.track = () => { throw new Error('blocked'); };
  assert.equal(h.window.alTags.ga('chat_opened'), false);
});

test('existing API, tag load/error and early data-al-state resolve without a timeout', () => {
  for (const state of ['load', 'error', '']) {
    const h = browser({ tag: state }); h.run();
    if (!state) { assert.equal(h.window.alTags.mode(), 'pending'); assert.equal(h.timers.size, 0); h.node.emit('error'); }
    assert.equal(h.window.alTags.mode(), 'legacy');
  }
  const h = browser({ tag: '', zaraz: { track() {} } }); h.run(); assert.equal(h.window.alTags.mode(), 'zaraz');
  const calls = [], stale = browser({ gtag: (...args) => calls.push(args) }); stale.run(); stale.run();
  stale.window.alTags.ga('chat_opened', {}); stale.window.emit('pointerdown');
  assert.equal(calls.length, 1); assert.equal(calls[0][0], 'event');
  assert.equal(stale.scripts.length + stale.timers.size + stale.window.listeners.size, 0);
});

test('GA cookie bridge preserves returning client IDs and uses the apex Domain only for _ga', () => {
  for (const existing of ['', 'GA1.2.123456.1700000000']) {
    const h = browser({ cookies: existing ? { _ga: existing } : {} }); h.run();
    assert.match(h.read('_ga'), /^GA1\.\d+\.\d+\.\d+$/);
    assert.equal(h.read('al_ga_cid'), h.read('_ga').split('.').slice(2).join('.'));
    if (existing) { assert.equal(h.read('_ga'), existing); assert.equal(h.writes.some((x) => x.startsWith('_ga=')), false); }
    else assert.match(h.writes.find((x) => x.startsWith('_ga=')), /Max-Age=63072000;.*Domain=autolander.ai/);
    assert.doesNotMatch(h.writes.find((x) => x.startsWith('al_ga_cid=')), /Domain=/);
  }
});

test('Meta cookie rules match identity.js, including long mixed-case, whitespace and percent/plus clicks', async (t) => {
  for (const click of ['AbC_'.repeat(87) + 'Xy', 'bad click', 'x'.repeat(1001), 'raw%+MiXeD', 'same']) {
    const cookies = { _fbc: 'fb.1.1700000000000.same', _fbp: 'invalid' };
    const h = browser({ url: `https://autolander.ai/?fbclid=${encodeURIComponent(click)}`, cookies }); h.run();
    installBrowser(t, h);
    const { getFbCookies } = await import(`../src/lib/identity.js?vector=${encodeURIComponent(click)}`);
    const before = { fbp: h.read('_fbp'), fbc: h.read('_fbc') };
    assert.deepEqual(getFbCookies(), before, 'identity must accept al-tags encoded cookies unchanged');
    assert.match(before.fbp, /^fb\.1\.\d{13}\.\d+$/);
    if (click === 'same' || /\s/.test(click) || click.length > 1000) assert.equal(before.fbc, cookies._fbc);
    else assert.ok(before.fbc.endsWith('.' + click));
    // Also run identity as the first writer for the same inputs.
    const first = browser({ url: h.window.location.href, cookies }); installBrowser(t, first);
    const identity = await import(`../src/lib/identity.js?first=${encodeURIComponent(click)}`);
    const result = identity.getFbCookies();
    assert.equal(result.fbc.split('.').slice(3).join('.'), before.fbc.split('.').slice(3).join('.'));
  }
});

test('URL privacy covers legacy pageviews, referrers and custom events within the size budget', () => {
  const h = browser({ url: 'https://autolander.ai/pay/private?session_id=cs_test_x', referrer: 'https://autolander.ai/pay/refsecret' }); h.run();
  const params = h.window.dataLayer.find((x) => x[0] === 'config')[2];
  assert.equal(params.page_location, 'https://autolander.ai/pay/:token');
  assert.equal(params.page_referrer, 'https://autolander.ai/pay/:token');
  h.window.alTags.ga('chat_opened', { page_path: '/pay/private' });
  assert.equal(h.window.dataLayer.at(-1)[2].page_path, '/pay/:token');
  assert.ok(Buffer.byteLength(tagsSource) <= 5120);
  assert.ok(tagsSource.includes(NO_TRACK_PATH_SOURCE));
});
