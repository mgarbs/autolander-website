// The AEO and GEO page moved from /ai-visibility/ to /aeo-geo-for-car-dealers/ (worker/src/agent/moved-pages.js,
// wired in worker/src/index.js, + the build-time stub dist/ai-visibility/index.html from scripts/spa-fallback.mjs).
//
// The regressions these guard against:
//   • the redirect dropping or re-encoding the query string (UTMs, fbclid, the no-JS form's ?sent=1 / ?error=,
//     ?preview=proof must reach the new URL byte for byte),
//   • the redirect swallowing the page images that stay under /ai-visibility/ (or any other path),
//   • a loop (a legacy key equal to a live path) or a two-hop chain,
//   • Markdown negotiation, Zaraz or no-transform answering the old URL instead of the 301,
//   • the Worker map and the static fallback stub drifting apart, or the stub carrying tracking.

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

import worker from '../worker/src/index.js';
import {
  MOVED_PAGES,
  MOVED_PAGE_STATUS,
  movedPageResponse,
  movedPageTarget,
} from '../worker/src/agent/moved-pages.js';
import { NO_TRANSFORM_KEY } from '../worker/src/agent/no-transform.js';
import {
  AI_VISIBILITY_DIR,
  AI_VISIBILITY_LEGACY_PATHS,
  AI_VISIBILITY_MD_PATH,
  AI_VISIBILITY_PATH,
} from '../shared/ai-visibility-route.js';
import { AI_VISIBILITY_CANONICAL, aiVisibilityLegacyStubHtml } from '../scripts/seo/data-ai-visibility.mjs';
import { legacyRedirectHtml } from '../scripts/spa-shell.mjs';

const NEW_URL = 'https://autolander.ai/aeo-geo-for-car-dealers/';
const NEW_MD = 'https://autolander.ai/aeo-geo-for-car-dealers.md';
const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

// Same stub-origin shape as short-links.test.js: records every path it was asked for.
function makeOrigin(files = {}) {
  const seen = [];
  const fetchImpl = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const path = new URL(req.url).pathname;
    seen.push(path);
    const hit = files[path];
    if (!hit) {
      return new Response('<!doctype html><html><body>not found</body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(hit.body, { status: 200, headers: { 'Content-Type': hit.type } });
  };
  return { fetchImpl, seen };
}

// Drives the REAL Worker entry, with globalThis.fetch standing in for the GitHub Pages origin.
async function call(url, { method = 'GET', headers = {} } = {}, origin = makeOrigin(), env = {}) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = origin.fetchImpl;
  try {
    return await worker.fetch(new Request(url, { method, headers }), env, { waitUntil() {} });
  } finally {
    globalThis.fetch = originalFetch;
  }
}

// ---------------------------------------------------------------- the map itself

test('the moved-page map is exactly the four retired URLs, each one hop to the live page', () => {
  assert.deepEqual(AI_VISIBILITY_LEGACY_PATHS, ['/ai-visibility/']);
  assert.deepEqual({ ...MOVED_PAGES }, {
    '/ai-visibility': AI_VISIBILITY_PATH,
    '/ai-visibility/': AI_VISIBILITY_PATH,
    '/ai-visibility/index.html': AI_VISIBILITY_PATH,
    '/ai-visibility.md': AI_VISIBILITY_MD_PATH,
  });
  assert.ok(Object.isFrozen(MOVED_PAGES));
  assert.equal(MOVED_PAGE_STATUS, 301);
});

test('loop guard: no legacy key is a live path, and no target is itself a legacy key', () => {
  const live = [AI_VISIBILITY_PATH, AI_VISIBILITY_PATH.slice(0, -1), `${AI_VISIBILITY_PATH}index.html`, AI_VISIBILITY_MD_PATH];
  for (const key of Object.keys(MOVED_PAGES)) assert.ok(!live.includes(key), key);
  for (const target of Object.values(MOVED_PAGES)) {
    assert.equal(movedPageTarget(target), null, `${target} must not redirect again`);
    assert.ok(live.includes(target), target);
  }
});

test('movedPageTarget matches the exact retired paths (case-insensitive) and nothing else', () => {
  for (const [path, target] of [
    ['/ai-visibility', AI_VISIBILITY_PATH],
    ['/ai-visibility/', AI_VISIBILITY_PATH],
    ['/AI-Visibility/', AI_VISIBILITY_PATH],
    ['/ai-visibility/index.html', AI_VISIBILITY_PATH],
    ['/ai-visibility.md', AI_VISIBILITY_MD_PATH],
  ]) {
    assert.equal(movedPageTarget(path), target, path);
  }
  for (const path of [
    '/ai-visibility/ai-chat-phone-640.webp', '/ai-visibility/report-preview-1600.avif', '/ai-visibility/x',
    '/ai-visibility//', '/ai-visibility-foo/', '/guide/ai-visibility/', '/og/ai-visibility.jpg',
    AI_VISIBILITY_PATH, AI_VISIBILITY_MD_PATH, '/', '', `/${'a'.repeat(80)}`, null, undefined,
  ]) {
    assert.equal(movedPageTarget(path), null, String(path));
  }
});

// ---------------------------------------------------------------- through the real Worker

test('every retired URL answers a 301 to the new URL without asking the origin', async () => {
  for (const [path, location] of [
    ['/ai-visibility', NEW_URL],
    ['/ai-visibility/', NEW_URL],
    ['/AI-Visibility/', NEW_URL],
    ['/ai-visibility/index.html', NEW_URL],
    ['/ai-visibility.md', NEW_MD],
  ]) {
    const origin = makeOrigin();
    const res = await call(`https://autolander.ai${path}`, { headers: { Accept: BROWSER_ACCEPT } }, origin);
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get('Location'), location, path);
    assert.equal(res.headers.get('X-AL-Moved'), '1', path);
    assert.match(res.headers.get('Cache-Control'), /max-age=86400/);
    assert.deepEqual(origin.seen, [], `${path}: no origin fetch`);
  }
});

test('the query string survives byte for byte, and a bare ? leaves no dangling ?', async () => {
  const query = '?preview=proof&sent=1&error=invalid_email&utm_source=a%20b&fbclid=X';
  const res = await call(`https://autolander.ai/ai-visibility/${query}`);
  assert.equal(res.headers.get('Location'), `${NEW_URL}${query}`);
  const odd = await call('https://autolander.ai/ai-visibility?utm_campaign=%E2%9C%93&x=1+2&x=3');
  assert.equal(odd.headers.get('Location'), `${NEW_URL}?utm_campaign=%E2%9C%93&x=1+2&x=3`);
  const bare = await call('https://autolander.ai/ai-visibility/?');
  assert.equal(bare.headers.get('Location'), NEW_URL);
  const md = await call('https://autolander.ai/ai-visibility.md?ref=llms');
  assert.equal(md.headers.get('Location'), `${NEW_MD}?ref=llms`);
});

test('HEAD redirects too; POST and other methods pass through untouched', async () => {
  const head = await call('https://autolander.ai/ai-visibility/', { method: 'HEAD' });
  assert.equal(head.status, 301);
  assert.equal(head.headers.get('Location'), NEW_URL);
  const origin = makeOrigin();
  const post = await call('https://autolander.ai/ai-visibility/', { method: 'POST' }, origin);
  assert.notEqual(post.status, 301);
  assert.equal(post.headers.get('Location'), null);
  assert.deepEqual(origin.seen, ['/ai-visibility/']);
  assert.equal(movedPageResponse(new Request('https://autolander.ai/ai-visibility/', { method: 'PUT' }), new URL('https://autolander.ai/ai-visibility/')), null);
});

test('an agent asking for Markdown on the old URL gets the 301, not a twin', async () => {
  const origin = makeOrigin({ '/ai-visibility.md': { body: '# stale', type: 'text/markdown' } });
  const res = await call('https://autolander.ai/ai-visibility/', { headers: { Accept: 'text/markdown' } }, origin);
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('Location'), NEW_URL);
  assert.deepEqual(origin.seen, []);
});

test('the page images, look-alike paths and the new page itself are not redirected', async () => {
  const files = {
    '/ai-visibility/ai-chat-phone-640.webp': { body: 'webp', type: 'image/webp' },
    '/og/ai-visibility.jpg': { body: 'jpg', type: 'image/jpeg' },
    [AI_VISIBILITY_PATH]: { body: '<!doctype html><html><head></head><body>AEO</body></html>', type: 'text/html; charset=utf-8' },
  };
  for (const path of ['/ai-visibility/ai-chat-phone-640.webp', '/og/ai-visibility.jpg', '/ai-visibility/x', '/ai-visibility-foo/', '/guide/ai-visibility/']) {
    const origin = makeOrigin(files);
    const res = await call(`https://autolander.ai${path}`, { headers: { Accept: BROWSER_ACCEPT } }, origin);
    assert.notEqual(res.status, 301, path);
    assert.equal(res.headers.get('X-AL-Moved'), null, path);
    assert.ok(origin.seen.includes(path), `${path} reached the origin`);
    if (files[path]) assert.equal(res.status, 200, path);
  }
  // The new page is served (and gets no-transform, as the old one used to).
  const env = { TRACKING: { get: async (key) => ({ [NO_TRANSFORM_KEY]: 'on', 'cfg:zaraz_mode': 'off' })[key] ?? null } };
  const live = await call(NEW_URL, { headers: { Accept: 'text/html', 'Accept-Encoding': 'gzip, br' } }, makeOrigin(files), env);
  assert.equal(live.status, 200);
  assert.equal(live.headers.get('X-AL-Moved'), null);
  assert.match(live.headers.get('Cache-Control') || '', /no-transform/);
  assert.equal(live.headers.get('X-AL-Edge'), 'no-transform:br');
});

test('www goes straight to the new URL in a single 308, query kept', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('the origin must not be fetched for a www redirect'); };
  try {
    const www = await worker.fetch(new Request('https://www.autolander.ai/ai-visibility/?q=1'), {}, {});
    assert.equal(www.status, 308);
    assert.equal(www.headers.get('Location'), `${NEW_URL}?q=1`);
    const other = await worker.fetch(new Request('https://www.autolander.ai/contact/?q=1'), {}, {});
    assert.equal(other.headers.get('Location'), 'https://autolander.ai/contact/?q=1');
    const image = await worker.fetch(new Request('https://www.autolander.ai/ai-visibility/ai-chat-phone-640.webp'), {}, {});
    assert.equal(image.headers.get('Location'), 'https://autolander.ai/ai-visibility/ai-chat-phone-640.webp');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('the redirect runs in the Worker entry after the short-links and before the site layer', () => {
  const source = readFileSync(new URL('../worker/src/index.js', import.meta.url), 'utf8');
  const shortAt = source.indexOf('shortLinkResponse(request, url)');
  const movedAt = source.indexOf('movedPageResponse(request, url)');
  const zarazAt = source.indexOf('readZarazMode(env)');
  const siteAt = source.indexOf('await handleSiteRequest(request, url)');
  assert.ok(shortAt !== -1 && movedAt > shortAt && movedAt < zarazAt && movedAt < siteAt);
});

// ---------------------------------------------------------------- the static fallback stub

test('the legacy stub forwards to the new URL with query and hash, and carries no tracking', () => {
  const html = aiVisibilityLegacyStubHtml();
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(html.includes(`<link rel="canonical" href="${AI_VISIBILITY_CANONICAL}" />`));
  assert.equal(AI_VISIBILITY_CANONICAL, NEW_URL);
  assert.ok(html.includes(`var d='${AI_VISIBILITY_PATH}'+(location.search||'')+(location.hash||'')`));
  assert.ok(html.includes('location.replace(d)'));
  assert.ok(html.includes(`<noscript><meta http-equiv="refresh" content="0; url=${AI_VISIBILITY_PATH}" /></noscript>`));
  assert.ok(html.includes(`<a id="moved-link" href="${AI_VISIBILITY_PATH}">This page moved: AEO and GEO for car dealers</a>`));
  assert.match(html, /<title>Moved: AEO and GEO for Car Dealers \| AutoLander<\/title>/);
  assert.doesNotMatch(html, /al-tags|data-al-cf-beacon-loader|zaraz|@autolander\.ai|G-30H80LZMCH|fbq\(|name="robots"/i);
  assert.throws(() => legacyRedirectHtml({ target: 'https://evil.example/', canonical: NEW_URL, title: 'x', label: 'x' }), /site path/);
});

test('the built stub equals the generator, sits beside the page images, and the new page is built', { skip: !existsSync(new URL('../dist/index.html', import.meta.url)) }, () => {
  const stub = new URL('../dist/ai-visibility/index.html', import.meta.url);
  assert.ok(existsSync(stub), 'dist/ai-visibility/index.html must be written by the build');
  assert.equal(readFileSync(stub, 'utf8'), aiVisibilityLegacyStubHtml());
  const images = readdirSync(new URL('../dist/ai-visibility/', import.meta.url)).filter((name) => /\.(?:avif|webp)$/.test(name));
  assert.ok(images.length >= 70, `the ${images.length} page images stay in dist/ai-visibility/`);
  assert.ok(existsSync(new URL(`../dist/${AI_VISIBILITY_DIR}/index.html`, import.meta.url)));
  assert.ok(existsSync(new URL(`../dist${AI_VISIBILITY_MD_PATH}`, import.meta.url)));
  assert.ok(!existsSync(new URL('../dist/ai-visibility.md', import.meta.url)), 'the old twin is gone');
  // Never committed to public/: the stub is generated at build time only.
  assert.ok(!existsSync(new URL('../public/ai-visibility/index.html', import.meta.url)));
});
