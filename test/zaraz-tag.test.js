import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import worker from '../worker/src/index.js';
import { isNoTrackPath, NO_TRACK_PATH_SOURCE } from '../shared/tracking-scope.js';
import { maybeInjectZaraz, readZarazMode, zarazEligibility, ZARAZ_TAG, ZARAZ_MODE_KEY } from '../worker/src/agent/zaraz-tag.js';

const html = '<html><head><script defer src="/al-tags-v1.js"></script><script type="module" src="/assets/index.js"></script></head><body>OK</body></html>';
const req = new Request('https://autolander.ai/');
const decision = { eligible: true, reason: 'ok', mode: 'on' };
const response = (body = html, headers = {}) => new Response(body, { headers: { 'Content-Type': 'text/html', ETag: 'old', 'Last-Modified': 'old', 'Content-Length': '123', ...headers } });

test('eligibility matrix: mode, cookie, method and path', () => {
  for (const mode of ['off', 'canary', 'on']) for (const cookie of ['', '0', '1'])
    for (const pathname of ['/', '/pay/tok', '/ref/x', '/thank-you', '/admin', '/admin/x', '/download/setup/', '/demo', '/demo-clay', '/onboarding', '/training/x'])
      for (const method of ['GET', 'HEAD', 'POST']) {
        const result = zarazEligibility({ mode, pathname, method, cookieHeader: `other=x; al_zaraz=${cookie}; more=y` });
        const reason = method !== 'GET' ? 'method' : isNoTrackPath(pathname) ? 'no_track_path'
          : cookie === '0' ? 'opt_out' : mode === 'off' ? 'mode_off' : mode === 'canary' && cookie !== '1' ? 'not_canary' : 'ok';
        assert.deepEqual(result, { eligible: reason === 'ok', reason });
      }
});

test('mode KV precedence, fallback and cache TTL', async () => {
  for (const [stored, fallback, expected] of [['on', 'off', 'on'], ['invalid', 'canary', 'canary'], [null, 'invalid', 'off']]) {
    assert.equal(await readZarazMode({ ZARAZ_MODE: fallback, TRACKING: { get: async (key, options) => {
      assert.equal(key, ZARAZ_MODE_KEY); assert.deepEqual(options, { cacheTtl: 60 }); return stored;
    } } }), expected);
  }
  assert.equal(await readZarazMode({ ZARAZ_MODE: 'on', TRACKING: { get() { throw new Error('KV unavailable'); } } }), 'on');
  assert.equal(await readZarazMode({}), 'off');
});

test('only eligible 200/404 HTML changes; assets remain the exact response', async () => {
  for (const type of ['text/html', 'text/markdown', 'text/css']) for (const status of [200, 404, 302, 304]) {
    const origin = new Response(status === 304 ? null : html, { status, headers: { 'Content-Type': type } });
    const result = await maybeInjectZaraz(req, origin, decision);
    if (type !== 'text/html') assert.equal(result, origin);
    else assert.equal(result.headers.get('X-AL-Zaraz'), [200, 404].includes(status) ? 'injected:on' : 'skip:status');
  }
  const skipped = await maybeInjectZaraz(req, response(), { eligible: false, mode: 'off', reason: 'mode_off' });
  assert.equal(skipped.headers.get('X-AL-Zaraz'), 'skip:mode_off'); assert.equal(skipped.headers.get('ETag'), 'old');
});

test('string injection is last in head, after module, once only, with changed validators removed', async () => {
  const result = await maybeInjectZaraz(req, response(), decision);
  const body = await result.text();
  assert.ok(body.includes(`</script>${ZARAZ_TAG}</head>`));
  assert.ok(body.indexOf('type="module"') < body.indexOf('data-al-zaraz'));
  for (const name of ['ETag', 'Last-Modified', 'Content-Length']) assert.equal(result.headers.get(name), null);
  const twice = await maybeInjectZaraz(req, response(body), decision);
  assert.equal(twice.headers.get('X-AL-Zaraz'), 'skip:already_present');
  assert.equal((await twice.text()).split('/cdn-cgi/zaraz/i.js').length - 1, 1);
});

const guardCases = [
  ['<html><head></head></html>', 'no_al_tags'],
  ['google-site-verification: test.html', 'no_al_tags'],
  ['<head></head><script src="/al-tags-v1.js"></script>', 'no_al_tags'],
  [html.replace('</head>', '<script>window.gtag("config", "G-30H80LZMCH");</script></head>'), 'legacy_gtag'],
  [html.replace('</head>', '<script src="https://www.googletagmanager.com/gtag/js?id=x"></script></head>'), 'legacy_gtag'],
];
test('string document guards skip missing al-tags, legacy GA and verification documents', async () => {
  for (const [input, reason] of guardCases) {
    const result = await maybeInjectZaraz(req, response(input), decision);
    assert.equal(result.headers.get('X-AL-Zaraz'), `skip:${reason}`); assert.equal(await result.text(), input);
  }
});

test('HTMLRewriter streams through head end and detects split and long legacy script text', async (t) => {
  let input = '', used = 0;
  class FakeRewriter {
    handlers = {};
    on(selector, handler) { this.handlers[selector] = handler; return this; }
    transform(origin) {
      let endHead, output = input;
      if (/<head/.test(input)) this.handlers.head.element({ onEndTag: (fn) => { endHead = fn; } });
      const head = input.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1] || '';
      for (const match of head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        this.handlers.script.element({ getAttribute: () => match[1].match(/src="([^"]*)"/)?.[1] });
        for (const text of [match[2].slice(0, 14), match[2].slice(14)]) this.handlers.script.text({ text });
      }
      endHead?.({ before: (tag, options) => { assert.deepEqual(options, { html: true }); used++; output = input.replace('</head>', tag + '</head>'); } });
      return new Response(output, origin);
    }
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'HTMLRewriter');
  Object.defineProperty(globalThis, 'HTMLRewriter', { configurable: true, value: FakeRewriter });
  t.after(() => original ? Object.defineProperty(globalThis, 'HTMLRewriter', original) : delete globalThis.HTMLRewriter);
  for (const body of [html, ...guardCases.map(([s]) => s), html.replace('</head>', '<script>/*123456789*/G-30H80LZMCH</script></head>'), html.replace('</head>', `<script>/*G-30H80LZMCH${'x'.repeat(400)}*/</script></head>`), html.replace('</head>', ZARAZ_TAG + '</head>')]) {
    input = body; const result = await maybeInjectZaraz(req, response(body), decision);
    assert.equal(result.headers.get('X-AL-Zaraz'), 'armed:on');
    assert.equal(await result.text(), body === html ? html.replace('</head>', ZARAZ_TAG + '</head>') : body);
  }
  assert.equal(used, 1);
  FakeRewriter.prototype.transform = () => { throw new Error('broken rewriter'); };
  const origin = response(); assert.equal(await maybeInjectZaraz(req, origin, decision), origin); assert.equal(await origin.text(), html);
});

test('worker only reads KV on trackable GET documents and strips conditionals only when eligible', async (t) => {
  const calls = [], reads = [];
  t.mock.method(globalThis, 'fetch', async (r) => { calls.push(r); return response(html); });
  const env = { TRACKING: { get: async (...args) => { reads.push(args); return 'on'; } } };
  for (const [path, method] of [['/assets/x.js', 'GET'], ['/fonts/x.woff2', 'GET'], ['/index.md', 'GET'], ['/', 'HEAD'], ['/admin', 'GET']]) {
    const r = new Request(`https://autolander.ai${path}`, { method, headers: { 'If-None-Match': 'old', 'If-Modified-Since': 'old' } });
    await worker.fetch(r, env, {}); assert.equal(reads.length, 0); assert.equal(calls.at(-1).headers.get('If-None-Match'), 'old');
  }
  await worker.fetch(new Request('https://autolander.ai/', { headers: { 'If-None-Match': 'old', 'If-Modified-Since': 'old' } }), env, {});
  assert.equal(reads.length, 1);
  for (const name of ['If-None-Match', 'If-Modified-Since']) assert.equal(calls.at(-1).headers.get(name), null);
  await worker.fetch(new Request('https://autolander.ai/', { headers: { Cookie: 'al_zaraz=0', 'If-None-Match': 'old' } }), env, {});
  assert.equal(calls.at(-1).headers.get('If-None-Match'), 'old');
  const noKv = await worker.fetch(req, {}, {}); assert.equal(noKv.headers.get('X-AL-Zaraz'), 'skip:mode_off');
  const before = reads.length;
  for (const path of ['/demo', '/onboarding', '/demo-clay']) assert.equal((await worker.fetch(new Request(`https://autolander.ai${path}`), env, {})).status, 302);
  assert.equal((await worker.fetch(new Request('https://www.autolander.ai/'), env, {})).status, 308);
  for (const path of ['/api/unknown', '/capi/unknown']) assert.equal((await worker.fetch(new Request(`https://autolander.ai${path}`), env, {})).status, 404);
  assert.equal(reads.length, before);
});

test('scope parity and admin fallback stripping are pinned', async () => {
  const config = JSON.parse(await readFile(new URL('../scripts/zaraz/zaraz-config.json', import.meta.url)));
  const tags = await readFile(new URL('../public/al-tags-v1.js', import.meta.url), 'utf8');
  const workerSource = await readFile(new URL('../worker/src/agent/zaraz-tag.js', import.meta.url), 'utf8');
  assert.equal(config.triggers.alBlockPath.loadRules[0].value, NO_TRACK_PATH_SOURCE);
  assert.ok(tags.includes(NO_TRACK_PATH_SOURCE)); assert.match(workerSource, /import \{ isNoTrackPath \} from '\.\.\/\.\.\/\.\.\/shared\/tracking-scope.js'/);
  const fallback = await readFile(new URL('../scripts/spa-fallback.mjs', import.meta.url), 'utf8');
  assert.match(fallback, /const adminShell = noindexShell.replace\(alTagsTag, ''\)/);
  assert.match(fallback, /if \(!alTagsTag.test\(noindexShell\)\) throw/);
  assert.match(fallback, /writeFileSync\(adminIndexPath, adminShell/);
});
