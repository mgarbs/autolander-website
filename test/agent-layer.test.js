// Agent layer (worker/src/agent/site.js): Accept negotiation, Vary accumulation, Markdown twins
// and the agent-recoverable 404.
//
// The regressions these guard against are all "quietly breaks the live site" shaped:
//   • serving Markdown to a browser (the page would download instead of render),
//   • replacing the 404 body on /pay/:token (every payment deep link breaks),
//   • dropping Accept-Encoding from Vary (a gzip body reaches a client that cannot read it),
//   • the agent layer touching asset requests at all.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  handleSiteRequest,
  htmlForMarkdownTwin,
  isApiPath,
  isDocumentPath,
  isSpaFallbackPath,
  markdownTwinFor,
  mergeVary,
  notFoundMarkdown,
  parseAccept,
  prefersMarkdown,
  wantsHtmlDocument,
} from '../worker/src/agent/site.js';

const BROWSER_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

// A stub origin. Returns whatever the map says for a path, 404 otherwise, and records what was asked.
function makeOrigin(files) {
  const seen = [];
  const fetchImpl = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const path = new URL(req.url).pathname;
    seen.push(path);
    const hit = files[path];
    if (!hit) {
      return new Response('<!doctype html><html><body>app shell</body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Vary': 'Accept-Encoding' },
      });
    }
    return new Response(hit.body, {
      status: 200,
      headers: { 'Content-Type': hit.type, 'Vary': 'Accept-Encoding' },
    });
  };
  return { fetchImpl, seen };
}

const HTML_HOME = { body: '<!doctype html><html><body>home</body></html>', type: 'text/html; charset=utf-8' };
const MD_HOME = { body: '# AutoLander\n', type: 'text/markdown; charset=utf-8' };

const call = (path, headers, origin, method = 'GET') => {
  const url = new URL(`https://autolander.ai${path}`);
  return handleSiteRequest(new Request(url.toString(), { method, headers }), url, origin.fetchImpl);
};

// ---------------------------------------------------------------- Accept parsing

test('parseAccept reads media ranges and q values, and survives junk', () => {
  assert.deepEqual([...parseAccept('text/markdown')], [['text/markdown', 1]]);
  assert.equal(parseAccept('text/html;q=0.9, text/markdown').get('text/html'), 0.9);
  assert.equal(parseAccept('text/markdown;q=notanumber').get('text/markdown'), 1);
  assert.equal(parseAccept('text/markdown;q=5').get('text/markdown'), 1, 'q clamps to 1');
  assert.equal(parseAccept('text/markdown;q=-3').get('text/markdown'), 0, 'q clamps to 0');
  assert.equal(parseAccept(null).size, 0);
  assert.equal(parseAccept(undefined).size, 0);
  assert.equal(parseAccept('').size, 0);
});

test('prefersMarkdown only fires on an explicit, top-ranked text/markdown', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown, text/html;q=0.9'), true);
  assert.equal(prefersMarkdown('text/x-markdown'), true);
  assert.equal(prefersMarkdown('text/markdown;q=1.0, text/html;q=1.0'), true, 'tie goes to markdown');

  // The cases that would break the site if this returned true.
  assert.equal(prefersMarkdown(BROWSER_ACCEPT), false, 'a browser must never get markdown');
  assert.equal(prefersMarkdown('*/*'), false, 'curl default must never get markdown');
  assert.equal(prefersMarkdown(null), false);
  assert.equal(prefersMarkdown('text/markdown;q=0.5, text/html'), false, 'html outranks markdown');
  assert.equal(prefersMarkdown('text/markdown;q=0'), false, 'q=0 means "not acceptable"');
});

test('wantsHtmlDocument distinguishes a browser from an agent', () => {
  assert.equal(wantsHtmlDocument(BROWSER_ACCEPT), true);
  assert.equal(wantsHtmlDocument('application/xhtml+xml'), true);
  assert.equal(wantsHtmlDocument('*/*'), false);
  assert.equal(wantsHtmlDocument(null), false);
  assert.equal(wantsHtmlDocument('text/markdown'), false);
});

// ---------------------------------------------------------------- canonical on the Markdown twins
//
// A twin fetched at its own URL is a crawlable duplicate of the HTML page. Without a canonical
// pointer, a search engine may index /about.md as a separate document and split the page's
// signals; with the HTTP-header form of rel="canonical" it consolidates to the HTML. The bytes
// and cacheability are untouched, so answer engines fetching the twin see exactly what they did.

test('htmlForMarkdownTwin maps a twin back to its HTML page and nothing else', () => {
  assert.equal(htmlForMarkdownTwin('/index.md'), '/');
  assert.equal(htmlForMarkdownTwin('/about.md'), '/about/');
  assert.equal(htmlForMarkdownTwin('/guide/car-sales-leads.md'), '/guide/car-sales-leads/');
  assert.equal(htmlForMarkdownTwin('/agents.md'), null, 'agents.md is a standalone document');
  assert.equal(htmlForMarkdownTwin('/about/'), null);
  assert.equal(htmlForMarkdownTwin('/llms.txt'), null);
  assert.equal(htmlForMarkdownTwin(''), null);
});

test('a directly requested twin carries Link rel=canonical to the HTML page, bytes untouched', async () => {
  const origin = makeOrigin({ '/about.md': { body: '# About\n', type: 'text/markdown; charset=utf-8' } });
  const res = await call('/about.md', { Accept: '*/*' }, origin);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), '# About\n', 'body passes through unchanged');
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.match(res.headers.get('Link'), /<https:\/\/autolander\.ai\/about\/>; rel="canonical"/);
  assert.deepEqual(origin.seen, ['/about.md'], 'exactly one origin fetch, no HTML probe');
});

test('/index.md is canonical to the homepage; /agents.md gets no canonical', async () => {
  const origin = makeOrigin({
    '/index.md': MD_HOME,
    '/agents.md': { body: '# Agents\n', type: 'text/markdown; charset=utf-8' },
  });
  const home = await call('/index.md', { Accept: '*/*' }, origin);
  assert.match(home.headers.get('Link'), /<https:\/\/autolander\.ai\/>; rel="canonical"/);
  const agents = await call('/agents.md', { Accept: '*/*' }, origin);
  assert.equal(agents.headers.get('Link'), null, 'a standalone document must not point elsewhere');
});

test('a missing twin passes the origin 404 through without inventing a canonical', async () => {
  const origin = makeOrigin({});
  const res = await call('/nope.md', { Accept: '*/*' }, origin);
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('Link'), null);
});

test('the negotiated Markdown representation declares its own URL as canonical', async () => {
  const origin = makeOrigin({ '/': HTML_HOME, '/index.md': MD_HOME });
  const res = await call('/', { Accept: 'text/markdown' }, origin);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Location'), '/index.md');
  assert.match(res.headers.get('Link'), /<https:\/\/autolander\.ai\/>; rel="canonical"/);
  assert.match(res.headers.get('Vary'), /Accept/);
});

// ---------------------------------------------------------------- path classification

test('isApiPath covers every routed worker endpoint and nothing else', () => {
  for (const p of ['/api/apply', '/capi/lead', '/admin-api/stats', '/chat', '/support', '/health']) {
    assert.equal(isApiPath(p), true, p);
  }
  for (const p of ['/', '/about/', '/chatty', '/healthcare/', '/api', '/supportive']) {
    assert.equal(isApiPath(p), false, p);
  }
});

test('isSpaFallbackPath protects the routes that depend on 404.html being the app shell', () => {
  for (const p of ['/pay', '/pay/tok_123', '/ref/abc', '/r/xyz', '/admin', '/admin/billing']) {
    assert.equal(isSpaFallbackPath(p), true, p);
  }
  // Must not swallow real marketing pages that merely start with the same letters.
  for (const p of ['/payments-guide/', '/reference/', '/rv-dealer-software/', '/about/']) {
    assert.equal(isSpaFallbackPath(p), false, p);
  }
});

test('isDocumentPath excludes assets and data, includes unknown extensionless paths', () => {
  for (const p of ['/', '/about/', '/guide/car-sales-leads/', '/no-such-page']) {
    assert.equal(isDocumentPath(p), true, p);
  }
  for (const p of [
    '/assets/index-abc.js', '/assets/index-abc.css', '/fonts/inter-latin-var.woff2',
    '/preview/listing-suv-240.webp', '/og/home.png', '/data/marketplace-report-2026.csv',
    '/llms.txt', '/sitemap.xml', '/about.md', '/favicon.ico',
  ]) {
    assert.equal(isDocumentPath(p), false, p);
  }
});

test('markdownTwinFor mirrors the build’s mdPathFor', () => {
  assert.equal(markdownTwinFor('/'), '/index.md');
  assert.equal(markdownTwinFor('/about/'), '/about.md');
  assert.equal(markdownTwinFor('/about'), '/about.md');
  assert.equal(markdownTwinFor('/guide/car-sales-leads/'), '/guide/car-sales-leads.md');
  assert.equal(markdownTwinFor('/pay/tok_1'), null, 'never negotiate a SPA route');
  assert.equal(markdownTwinFor('/assets/app.js'), null);
});

test('mergeVary accumulates instead of replacing', () => {
  assert.equal(mergeVary('Accept-Encoding', 'Accept'), 'Accept-Encoding, Accept');
  assert.equal(mergeVary(null, 'Accept'), 'Accept');
  assert.equal(mergeVary('Accept', 'Accept'), 'Accept', 'no duplicates');
  assert.equal(mergeVary('accept-encoding', 'Accept-Encoding'), 'accept-encoding', 'case-insensitive');
  assert.equal(mergeVary('*', 'Accept'), '*', 'a wildcard Vary stays a wildcard');
});

// ---------------------------------------------------------------- negotiation behaviour

test('Accept: text/markdown on / serves the homepage twin with Vary: Accept', async () => {
  const origin = makeOrigin({ '/': HTML_HOME, '/index.md': MD_HOME });
  const res = await call('/', { Accept: 'text/markdown' }, origin);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.match(res.headers.get('Vary'), /\bAccept\b/);
  assert.match(res.headers.get('Vary'), /Accept-Encoding/, 'origin Vary is preserved');
  assert.equal(res.headers.get('Content-Location'), '/index.md');
  assert.equal(await res.text(), MD_HOME.body);
});

test('a browser gets HTML, plus Vary: Accept and a Link hint to the twin', async () => {
  const origin = makeOrigin({ '/': HTML_HOME, '/index.md': MD_HOME });
  const res = await call('/', { Accept: BROWSER_ACCEPT }, origin);

  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type'), /text\/html/);
  assert.match(res.headers.get('Vary'), /\bAccept\b/);
  assert.match(res.headers.get('Vary'), /Accept-Encoding/);
  assert.match(res.headers.get('Link'), /rel="alternate".*text\/markdown/);
  assert.equal(await res.text(), HTML_HOME.body);
  assert.deepEqual(origin.seen, ['/'], 'no wasted subrequest for the twin');
});

test('a page with no Markdown twin still answers HTML with Vary: Accept', async () => {
  const origin = makeOrigin({ '/compare/': HTML_HOME }); // no /compare.md
  const res = await call('/compare/', { Accept: 'text/markdown' }, origin);

  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type'), /text\/html/);
  assert.match(res.headers.get('Vary'), /\bAccept\b/, 'negotiation was considered, and says so');
});

test('asset requests are a pure passthrough — untouched headers, no extra work', async () => {
  const origin = makeOrigin({
    '/assets/index-abc.js': { body: 'console.log(1)', type: 'application/javascript' },
  });
  const res = await call('/assets/index-abc.js', { Accept: 'text/markdown' }, origin);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'application/javascript');
  assert.equal(res.headers.get('Vary'), 'Accept-Encoding', 'Vary NOT rewritten on assets');
  assert.equal(res.headers.get('Link'), null);
  assert.deepEqual(origin.seen, ['/assets/index-abc.js']);
});

test('non-GET requests pass straight through without negotiation', async () => {
  const origin = makeOrigin({ '/': HTML_HOME, '/index.md': MD_HOME });
  const res = await call('/', { Accept: 'text/markdown' }, origin, 'POST');

  assert.deepEqual(origin.seen, ['/'], 'the twin was never fetched');
  assert.match(res.headers.get('Content-Type'), /text\/html/, 'body was not swapped for markdown');
  assert.equal(res.headers.get('Vary'), 'Accept-Encoding', 'headers untouched on a non-GET');
});

// ---------------------------------------------------------------- 404 behaviour

test('an agent gets a short Markdown 404 with recovery links', async () => {
  const origin = makeOrigin({});
  for (const headers of [{ Accept: '*/*' }, {}, { Accept: 'text/markdown' }]) {
    const res = await call('/some-path-that-does-not-exist', headers, origin);
    assert.equal(res.status, 404, 'still a REAL 404, never a 200 app shell');
    assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
    assert.match(res.headers.get('Vary'), /\bAccept\b/);

    const body = await res.text();
    assert.match(body, /^# 404/, 'markdown heading');
    assert.match(body, /\/sitemap\.xml/);
    assert.match(body, /\/llms\.txt/);
    assert.match(body, /\/contact\//);
    assert.ok(body.length < 2000, `404 body should stay short, got ${body.length}`);
  }
});

test('a browser 404 keeps the SPA shell so client-side routes still work', async () => {
  const origin = makeOrigin({});
  const res = await call('/some-path-that-does-not-exist', { Accept: BROWSER_ACCEPT }, origin);

  assert.equal(res.status, 404);
  assert.match(res.headers.get('Content-Type'), /text\/html/);
  assert.match(await res.text(), /app shell/);
});

test('payment and referral deep links NEVER get the markdown 404', async () => {
  const origin = makeOrigin({});
  for (const path of ['/pay/tok_live_123', '/ref/abcd', '/r/xyz', '/admin/billing']) {
    for (const accept of ['*/*', 'text/markdown', BROWSER_ACCEPT]) {
      const res = await call(path, { Accept: accept }, origin);
      assert.equal(res.status, 404, path);
      assert.match(res.headers.get('Content-Type'), /text\/html/, `${path} with Accept: ${accept}`);
      assert.match(await res.text(), /app shell/, `${path} must still get the SPA shell`);
    }
  }
});

test('a HEAD 404 from an agent has the markdown headers and no body', async () => {
  const origin = makeOrigin({});
  const res = await call('/nope', { Accept: '*/*' }, origin, 'HEAD');
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(await res.text(), '');
});

test('notFoundMarkdown neutralises header injection from the path', () => {
  const body = notFoundMarkdown('/evil\r\nX-Injected: 1');
  assert.ok(!body.includes('\r'), 'CR stripped');
  assert.ok(!body.includes('\nX-Injected'), 'LF-prefixed injection stripped');
  assert.ok(notFoundMarkdown('/' + 'a'.repeat(5000)).length < 3000, 'path is truncated');
});
