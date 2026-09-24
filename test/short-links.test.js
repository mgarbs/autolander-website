// Vanity booking short-links (worker/src/agent/short-links.js, wired in worker/src/index.js, + public/<slug>/index.html).
//
// The regressions these guard against:
//   • a short-link swallowing a real page (/training/demo/, /demos, /demo/x),
//   • the redirect dropping or re-encoding the query string (UTMs and the welcome e-mail's
//     prefill params must reach the booking widget byte-for-byte),
//   • any input steering the redirect off go.autolander.ai (open redirect),
//   • the Worker map and the static fallback pages drifting apart,
//   • the vanity paths leaking into the sitemap / llms.txt (they are redirects, not pages).

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import worker from '../worker/src/index.js';
import { handleSiteRequest } from '../worker/src/agent/site.js';
import {
  SHORT_LINK_STATUS,
  SHORT_LINKS,
  shortLinkLocation,
  shortLinkResponse,
  shortLinkTarget,
} from '../worker/src/agent/short-links.js';

const BROWSER_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

const TARGETS = {
  '/onboarding': 'https://go.autolander.ai/widget/bookings/autolander-onboarding',
  '/demo': 'https://go.autolander.ai/widget/bookings/autolander-demo',
  '/demo-clay': 'https://go.autolander.ai/widget/bookings/autolander-demo-clay',
};

// Same stub-origin shape as agent-layer.test.js: records every path it was asked for.
function makeOrigin(files = {}) {
  const seen = [];
  const fetchImpl = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const path = new URL(req.url).pathname;
    seen.push(path);
    const hit = files[path];
    if (!hit) {
      return new Response('<!doctype html><html><body>app shell</body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(hit.body, { status: 200, headers: { 'Content-Type': hit.type } });
  };
  return { fetchImpl, seen };
}

// Drives the REAL Worker entry on the apex host, with globalThis.fetch standing in for the
// GitHub Pages origin (handleSiteRequest's default fetchImpl), restored before returning.
async function call(path, { method = 'GET', headers = {} } = {}, origin = makeOrigin()) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = origin.fetchImpl;
  try {
    return await worker.fetch(new Request(`https://autolander.ai${path}`, { method, headers }), {}, {});
  } finally {
    globalThis.fetch = originalFetch;
  }
}

// ---------------------------------------------------------------- the map itself

test('SHORT_LINKS is exactly the three booking targets on go.autolander.ai', () => {
  assert.deepEqual({ ...SHORT_LINKS }, TARGETS);
  assert.ok(Object.isFrozen(SHORT_LINKS));
  assert.equal(SHORT_LINK_STATUS, 302);
  for (const target of Object.values(SHORT_LINKS)) {
    assert.ok(target.startsWith('https://go.autolander.ai/widget/bookings/'), target);
    assert.equal(target.includes('?'), false, target);
    assert.equal(target.includes('#'), false, target);
  }
});

test('shortLinkTarget matches exact slugs (case-insensitive, one trailing slash) and nothing else', () => {
  for (const [path, target] of [
    ['/demo', TARGETS['/demo']],
    ['/demo/', TARGETS['/demo']],
    ['/DEMO', TARGETS['/demo']],
    ['/Demo/', TARGETS['/demo']],
    ['/onboarding', TARGETS['/onboarding']],
    ['/onboarding/', TARGETS['/onboarding']],
    ['/demo-clay', TARGETS['/demo-clay']],
    ['/demo-clay/', TARGETS['/demo-clay']],
  ]) {
    assert.equal(shortLinkTarget(path), target, path);
  }

  for (const path of [
    '/', '', '/demo//', '/demo/x', '/demos', '/demo.html', '/demo-clay-x', '/training/demo/',
    '/training/demo', '/pay', '/onboardingx', '//demo', '/constructor', '/__proto__', '/toString',
    `/${'d'.repeat(99)}`, 123, null, undefined, {},
  ]) {
    assert.equal(shortLinkTarget(path), null, String(path));
  }
});

test('the query string is kept byte-for-byte and can never move the redirect host', () => {
  assert.equal(
    shortLinkLocation(new URL('https://autolander.ai/demo?utm_source=fb&utm_campaign=a%20b&x=1&x=2&empty=')),
    'https://go.autolander.ai/widget/bookings/autolander-demo?utm_source=fb&utm_campaign=a%20b&x=1&x=2&empty=',
  );
  // The welcome e-mail's prefill params, exactly as the cloud URL-encodes them.
  assert.equal(
    shortLinkLocation(new URL('https://autolander.ai/onboarding?first_name=Jo%20Ann&last_name=O%27Neil&email=jo%2Bx%40dealer.com&phone=%2B15555550123')),
    'https://go.autolander.ai/widget/bookings/autolander-onboarding?first_name=Jo%20Ann&last_name=O%27Neil&email=jo%2Bx%40dealer.com&phone=%2B15555550123',
  );
  assert.equal(shortLinkLocation(new URL('https://autolander.ai/onboarding/')), TARGETS['/onboarding']);
  assert.equal(shortLinkLocation(new URL('https://autolander.ai/demo-clay?')), TARGETS['/demo-clay']);
  assert.equal(shortLinkLocation(new URL('https://autolander.ai/demos?x=1')), null);

  for (const query of ['?//evil.com', '?@evil.com', '?%0d%0aX:1', '?\\evil.com', '?https://evil.com/']) {
    const location = shortLinkLocation(new URL(`https://autolander.ai/demo${query}`));
    assert.equal(new URL(location).host, 'go.autolander.ai', query);
    assert.equal(new URL(location).pathname, '/widget/bookings/autolander-demo', query);
  }
});

test('shortLinkResponse answers GET/HEAD only, with a no-store 302', () => {
  const url = new URL('https://autolander.ai/demo?utm_source=x');
  for (const method of ['GET', 'HEAD']) {
    const response = shortLinkResponse(new Request(url, { method }), url);
    assert.equal(response.status, 302, method);
    assert.equal(response.headers.get('Location'), `${TARGETS['/demo']}?utm_source=x`, method);
    assert.match(response.headers.get('Cache-Control'), /no-store/, method);
  }
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
    assert.equal(shortLinkResponse(new Request(url, { method }), url), null, method);
  }
  const other = new URL('https://autolander.ai/about/');
  assert.equal(shortLinkResponse(new Request(other), other), null);
});

// ---------------------------------------------------------------- through the Worker entry (apex)

test('the Worker redirects every slug before touching the origin (GET, HEAD, any Accept)', async () => {
  for (const [slug, target] of Object.entries(TARGETS)) {
    for (const method of ['GET', 'HEAD']) {
      for (const accept of [BROWSER_ACCEPT, 'text/markdown', undefined]) {
        const origin = makeOrigin();
        const headers = accept ? { Accept: accept } : {};
        const response = await call(`${slug}?utm_source=fb&utm_campaign=a%20b`, { method, headers }, origin);
        const label = `${method} ${slug} ${accept || '(no accept)'}`;
        assert.equal(response.status, 302, label);
        assert.equal(response.headers.get('Location'), `${target}?utm_source=fb&utm_campaign=a%20b`, label);
        assert.match(response.headers.get('Cache-Control') || '', /no-store/, label);
        assert.deepEqual(origin.seen, [], `${label}: origin must not be fetched`);
        if (method === 'HEAD') assert.equal(await response.text(), '', label);
      }
    }
    const trailing = await call(`${slug}/`);
    assert.equal(trailing.status, 302);
    assert.equal(trailing.headers.get('Location'), target);
  }
});

test('non-GET short-link requests and look-alike paths pass through to the origin untouched', async () => {
  const post = makeOrigin();
  const postResponse = await call('/demo', { method: 'POST' }, post);
  assert.equal(postResponse.status, 404);
  assert.deepEqual(post.seen, ['/demo']);

  const training = makeOrigin({ '/training/demo/': { body: '<!doctype html><p>training demo</p>', type: 'text/html; charset=utf-8' } });
  const trainingResponse = await call('/training/demo/', { headers: { Accept: BROWSER_ACCEPT } }, training);
  assert.equal(trainingResponse.status, 200);
  assert.equal(trainingResponse.headers.get('Location'), null);
  assert.equal(await trainingResponse.text(), '<!doctype html><p>training demo</p>');
  assert.deepEqual(training.seen, ['/training/demo/']);

  for (const path of ['/demos', '/demo/x', '/demo.html']) {
    const origin = makeOrigin();
    const response = await call(path, { headers: { Accept: BROWSER_ACCEPT } }, origin);
    assert.equal(response.headers.get('Location'), null, path);
    assert.deepEqual(origin.seen, [path], path);
  }
});

test('the redirect lives in the Worker entry, ahead of an untouched agent layer', async () => {
  // handleSiteRequest itself is unchanged: called directly it passes /demo to the origin like any
  // other unknown path. The 302 comes from worker/src/index.js before it is ever called.
  const origin = makeOrigin();
  const url = new URL('https://autolander.ai/demo');
  const direct = await handleSiteRequest(new Request(url, { headers: { Accept: BROWSER_ACCEPT } }), url, origin.fetchImpl);
  assert.equal(direct.headers.get('Location'), null);
  assert.deepEqual(origin.seen, ['/demo']);

  const source = readFileSync(new URL('../worker/src/index.js', import.meta.url), 'utf8');
  const redirectAt = source.indexOf('shortLinkResponse(request, url)');
  const siteAt = source.indexOf('await handleSiteRequest(request, url)');
  assert.ok(redirectAt !== -1 && siteAt !== -1 && redirectAt < siteAt, 'short-links run before handleSiteRequest');
});

test('the Worker entry redirects on the apex, 308s www first, and never on workers.dev', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('the origin must not be fetched for a short-link');
  };
  try {
    const apex = await worker.fetch(new Request('https://autolander.ai/demo?utm_source=x'), {}, {});
    assert.equal(apex.status, 302);
    assert.equal(apex.headers.get('Location'), `${TARGETS['/demo']}?utm_source=x`);

    const www = await worker.fetch(new Request('https://www.autolander.ai/demo?utm_source=x'), {}, {});
    assert.equal(www.status, 308);
    assert.equal(www.headers.get('Location'), 'https://autolander.ai/demo?utm_source=x');

    const workersDev = await worker.fetch(new Request('https://autolander-chatbot.example.workers.dev/demo'), {}, {});
    assert.equal(workersDev.status, 404);
    assert.equal(String(workersDev.headers.get('Location') || '').includes('go.autolander.ai'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ---------------------------------------------------------------- static fallback pages

test('each short-link has a static fallback page that redirects to the same target', () => {
  for (const [path, target] of Object.entries(SHORT_LINKS)) {
    const file = new URL(`../public${path}/index.html`, import.meta.url);
    assert.ok(existsSync(file), `public${path}/index.html must exist`);
    const html = readFileSync(file, 'utf8');
    assert.ok(html.includes(`'${target}'`), `${path}: script target`);
    assert.ok(html.includes('location.replace('), path);
    assert.ok(html.includes('location.search'), path);
    assert.ok(html.includes('location.hash'), path);
    assert.ok(html.includes('<meta name="robots" content="noindex'), path);
    assert.ok(html.includes('<noscript>'), path);
    assert.ok(html.includes(`href="${target}"`), `${path}: link target`);
    assert.ok(html.includes(`url=${target}"`), `${path}: meta refresh target`);
    assert.match(html, /<title>[^<]+<\/title>/, path);
    // A redirect page is not a landing page: no analytics, Pixel, attribution or canonical.
    assert.doesNotMatch(html, /G-30H80LZMCH|fbq\(|fbevents|al-attribution-v1|rel="canonical"/, path);
    // Every URL in the page is the one target (never a different host).
    for (const href of html.match(/https?:\/\/[^\s'"<>]+/g) || []) {
      assert.equal(href, target, `${path}: unexpected URL ${href}`);
    }

    const built = new URL(`../dist${path}/index.html`, import.meta.url);
    if (existsSync(new URL('../dist/', import.meta.url))) {
      assert.ok(existsSync(built), `dist${path}/index.html must be copied by the build`);
      assert.equal(readFileSync(built, 'utf8'), html, `dist${path}/index.html must be byte-equal to public`);
    }
  }
});

test('the vanity paths stay out of the sitemap and the agent indexes', () => {
  const pattern = /autolander\.ai\/(demo|onboarding|demo-clay)\/?(?=[\s<)"'\]]|$)/m;
  for (const name of ['sitemap.xml', 'image-sitemap.xml', 'llms.txt', 'llms-full.txt', 'agents.md', 'robots.txt']) {
    const file = new URL(`../public/${name}`, import.meta.url);
    if (!existsSync(file)) continue;
    assert.doesNotMatch(readFileSync(file, 'utf8'), pattern, name);
  }
});
