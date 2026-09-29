import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { browser, installBrowser } from '../test-support/tracking-browser.js';

test('fetch scan success emits GA once; duplicates and failures emit nothing', async (t) => {
  const h = browser(); installBrowser(t, h);
  const calls = [];
  h.window.alTags = { ga: (...args) => calls.push(args) };
  const module = await import(`../src/ai/scan-request.js?ga=${crypto.randomUUID()}`);
  const submit = module.submitScanRequest;
  assert.equal(typeof submit, 'function');
  for (const [body, status, count] of [
    [{ ok: true }, 200, 1], [{ ok: true, duplicate: true }, 200, 1],
    [{ ok: false }, 200, 1], [{ ok: true }, 500, 1],
  ]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body, { status }));
    await submit({});
    assert.equal(calls.length, count);
  }
  assert.equal(calls[0][0], 'ai_scan_request');
  assert.equal(calls[0][1].method, 'ai_visibility_scan');
  assert.equal(Object.hasOwn(calls[0][1], 'eventId'), false);
});

test('demo apply forwards a valid QA test code without changing lead analytics', async (t) => {
  const h = browser({ url: 'https://autolander.ai/?test_event_code=TESTsession1' }); installBrowser(t, h);
  let body; const calls = [];
  h.window.alTags = { ga: (...args) => calls.push(args) };
  t.mock.method(globalThis, 'fetch', async (_url, init) => { body = JSON.parse(init.body); return Response.json({ ok: true }); });
  const { submitApplication } = await import(`../src/lib/demo-application.js?qa=${crypto.randomUUID()}`);
  await submitApplication({});
  assert.equal(body.test_event_code, 'TESTsession1');
  assert.equal(calls[0][0], 'generate_lead');
  assert.equal(h.session.get('al_test_event_code'), 'TESTsession1');
});

test('native scan form retains its existing action with no inline analytics sender', async () => {
  const source = await readFile(new URL('../src/ai/static-mirror.js', import.meta.url), 'utf8');
  assert.match(source, /\/api\/ai-scan/);
  assert.doesNotMatch(source, /gtag|zaraz\.track|gaEvent/);
});
