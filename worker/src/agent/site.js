// Agent layer — content negotiation and agent-recoverable 404s for the public site.
//
// WHY THIS IS IN THE WORKER AT ALL
// --------------------------------
// autolander.ai is static HTML on GitHub Pages behind Cloudflare. GitHub Pages serves files; it
// cannot vary a response on a request header and it cannot give a 404 a body other than 404.html.
// Two things we owe an AI agent therefore have nowhere else to live:
//
//   1. acceptmarkdown.com content negotiation. An agent that sends `Accept: text/markdown` should
//      get the Markdown representation of the SAME url, and every negotiated response must carry
//      `Vary: Accept` so a CDN never hands the HTML variant to a client that asked for Markdown.
//   2. A 404 an agent can recover from. Ours already returns a real 404 status (good — a SPA that
//      answers 200 for every path teaches a crawler that every path exists), but the body is the
//      127 KB React shell, which tells a non-JS client nothing. A short Markdown body pointing at
//      the sitemap and llms.txt lets the agent find what it was actually looking for.
//
// SAFETY RULES THIS FILE KEEPS
// ----------------------------
// * Browsers are never affected. Markdown is served only when the client sends an EXPLICIT
//   `text/markdown` range that outranks its `text/html` range; `Accept: */*` never triggers it.
// * The Markdown 404 is skipped for the SPA's dynamic routes (/pay/:token, /ref/*, /r/*, /admin).
//   Those paths depend on GitHub Pages serving 404.html as the app shell — replacing that body
//   would break live payment and referral links.
// * Non-document requests (assets, fonts, images, data files) short-circuit to a plain passthrough
//   before any work happens, so the bytes path is untouched.
// * The caller wraps this in try/catch and falls back to a bare fetch. A bug here must degrade to
//   "the site as it was", never to an error page.

// Routed to the Worker's own API handlers — the agent layer must not see these.
const API_PREFIXES = ['/api/', '/capi/', '/admin-api/'];
const API_EXACT = new Set(['/chat', '/support', '/health']);

// Paths GitHub Pages answers with 404.html AS THE APP SHELL. Never rewrite their body.
const SPA_FALLBACK_PREFIXES = ['/pay', '/ref/', '/r/', '/admin'];

// Extensions that are definitely not HTML documents. Anything matching bails out immediately.
const NON_DOCUMENT_EXT =
  /\.(?:js|mjs|css|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mov|pdf|zip|txt|xml|json|csv|md|exe|dmg|AppImage)$/i;

export function isApiPath(pathname) {
  if (API_EXACT.has(pathname)) return true;
  return API_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isSpaFallbackPath(pathname) {
  return SPA_FALLBACK_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`));
}

// A "document" is a path that could plausibly resolve to an HTML page: no file extension.
// Extensionless unknown paths count too — that is exactly the 404 case we want to improve.
export function isDocumentPath(pathname) {
  if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')
    || pathname.startsWith('/preview/') || pathname.startsWith('/og/')
    || pathname.startsWith('/data/')) return false;
  if (NON_DOCUMENT_EXT.test(pathname)) return false;
  return true;
}

// ---------- Accept parsing ----------
// Returns a map of lowercased media range -> q value. Malformed parameters are ignored rather
// than thrown: a weird Accept header must not take the site down.
export function parseAccept(header) {
  const ranges = new Map();
  if (!header || typeof header !== 'string') return ranges;
  for (const part of header.split(',')) {
    const [rawType, ...params] = part.split(';');
    const type = rawType.trim().toLowerCase();
    if (!type) continue;
    let q = 1;
    for (const param of params) {
      const [k, v] = param.split('=');
      if (k && k.trim().toLowerCase() === 'q') {
        const parsed = Number.parseFloat(v);
        if (Number.isFinite(parsed)) q = Math.min(Math.max(parsed, 0), 1);
      }
    }
    // Keep the highest q if a range is repeated.
    if (!ranges.has(type) || ranges.get(type) < q) ranges.set(type, q);
  }
  return ranges;
}

// True only when the client explicitly named text/markdown AND ranked it at least as high as HTML.
// `*/*` deliberately does NOT count as a request for Markdown — curl and most link-preview
// crawlers send it, and they want the page.
export function prefersMarkdown(acceptHeader) {
  const ranges = parseAccept(acceptHeader);
  const qMarkdown = Math.max(
    ranges.get('text/markdown') ?? 0,
    ranges.get('text/x-markdown') ?? 0,
  );
  if (qMarkdown <= 0) return false;
  const qHtml = Math.max(
    ranges.get('text/html') ?? 0,
    ranges.get('application/xhtml+xml') ?? 0,
    ranges.get('text/*') ?? 0,
    ranges.get('*/*') ?? 0,
  );
  return qMarkdown >= qHtml;
}

// True when the client explicitly asked for HTML — i.e. it is a browser or a link-preview
// crawler that wants the page markup. Absent / `*/*` / Markdown-only all return false.
export function wantsHtmlDocument(acceptHeader) {
  const ranges = parseAccept(acceptHeader);
  return (ranges.get('text/html') ?? 0) > 0 || (ranges.get('application/xhtml+xml') ?? 0) > 0;
}

// ---------- Markdown twin resolution ----------
// The build writes a twin per page: "/" -> /index.md, "/about/" -> /about.md,
// "/guide/car-sales-leads/" -> /guide/car-sales-leads.md. Mirrors mdPathFor() in
// scripts/build-seo-pages.mjs — change both together.
export function markdownTwinFor(pathname) {
  if (!isDocumentPath(pathname) || isSpaFallbackPath(pathname)) return null;
  if (pathname === '/' || pathname === '') return '/index.md';
  const trimmed = pathname.replace(/\/+$/, '');
  if (!trimmed || trimmed === '') return '/index.md';
  return `${trimmed}.md`;
}

// Vary must accumulate, never replace: the origin already varies on Accept-Encoding and dropping
// that would let a gzip body reach a client that cannot read it.
export function mergeVary(existing, add) {
  const seen = new Map();
  for (const value of [existing, add]) {
    if (!value) continue;
    for (const token of String(value).split(',')) {
      const name = token.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (key === '*') return '*';
      if (!seen.has(key)) seen.set(key, name);
    }
  }
  return [...seen.values()].join(', ');
}

// ---------- Markdown 404 ----------
export function notFoundMarkdown(pathname, origin = 'https://autolander.ai') {
  const safePath = String(pathname || '/').replace(/[\r\n]/g, '').slice(0, 200);
  return `# 404 — page not found

\`${safePath}\` does not exist on autolander.ai.

AutoLander is Facebook Marketplace software for U.S. car dealerships: it posts dealer inventory to
Facebook Marketplace, keeps asking prices in step with the feed, removes sold units and enhances
listing photos. Built by AutoLander LLC.

## Where to look next

- [Home](${origin}/) — what AutoLander does, and the Markdown copy at [/index.md](${origin}/index.md)
- [/llms.txt](${origin}/llms.txt) — machine-readable index of every page, with a "when to use" section
- [/llms-full.txt](${origin}/llms-full.txt) — the whole site's content in one document
- [/agents.md](${origin}/agents.md) — instructions for AI agents: fit, mis-fit, how to cite us
- [/sitemap.xml](${origin}/sitemap.xml) — every canonical URL
- [/contact/](${origin}/contact/) — email, phone and postal address for a human
- [/about/](${origin}/about/) — the company, and how our published research is produced

## Tips

- Every page has a Markdown twin: append \`.md\` to the path, or send \`Accept: text/markdown\`.
- If you followed a link from search, the page may have moved — /sitemap.xml is authoritative.
`;
}

// Inverse of markdownTwinFor(): the HTML page a directly-requested twin is a copy of.
// "/index.md" -> "/", "/about.md" -> "/about/", "/guide/x.md" -> "/guide/x/". Returns null for
// anything that is not a twin: /agents.md is a standalone document with no HTML page, and every
// other .md on the site is generated as a twin by scripts/build-seo-pages.mjs.
export function htmlForMarkdownTwin(pathname) {
  if (!pathname || !pathname.endsWith('.md')) return null;
  if (pathname === '/agents.md') return null;
  if (pathname === '/index.md') return '/';
  return `${pathname.slice(0, -'.md'.length)}/`;
}

function markdownResponse(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

/**
 * Handle a public-site request. Returns a Response; never throws for an expected condition.
 *
 * @param {Request} request
 * @param {URL} url
 * @param {(input: any, init?: any) => Promise<Response>} fetchImpl injectable for tests
 */
export async function handleSiteRequest(request, url, fetchImpl = fetch) {
  const { pathname } = url;

  // Only GET/HEAD can be negotiated. Everything else is a plain passthrough.
  if (request.method !== 'GET' && request.method !== 'HEAD') return fetchImpl(request);

  // 0. A Markdown twin fetched DIRECTLY by its own URL (/about.md, /index.md). It is the same
  //    content as the HTML page, so tell search engines which URL is canonical — the HTTP-header
  //    form of rel="canonical" is exactly the mechanism Google documents for non-HTML copies (PDFs
  //    and the like). Without it the twin is a crawlable, indexable duplicate with no pointer home.
  //    The header only steers indexing; the bytes and the cacheability are untouched, so answer
  //    engines that fetch the twin at query time see exactly what they saw before.
  const canonicalHtml = htmlForMarkdownTwin(pathname);
  if (canonicalHtml) {
    const response = await fetchImpl(request);
    if (response.status !== 200) return response;
    const out = new Response(response.body, response);
    out.headers.append('Link', `<${url.origin}${canonicalHtml}>; rel="canonical"`);
    return out;
  }

  // Assets and data files: leave the bytes path completely alone.
  if (!isDocumentPath(pathname)) return fetchImpl(request);

  const accept = request.headers.get('Accept');
  const wantsMarkdown = prefersMarkdown(accept);

  // 1. Explicit Markdown request -> serve the twin from the same origin, at the same URL.
  if (wantsMarkdown) {
    const twin = markdownTwinFor(pathname);
    if (twin) {
      const twinUrl = new URL(url.toString());
      twinUrl.pathname = twin;
      twinUrl.search = '';
      const twinResponse = await fetchImpl(new Request(twinUrl.toString(), {
        method: request.method,
        headers: { 'Accept': 'text/markdown, text/plain' },
        redirect: 'follow',
      }));
      if (twinResponse.status === 200) {
        const out = new Response(twinResponse.body, twinResponse);
        out.headers.set('Content-Type', 'text/markdown; charset=utf-8');
        out.headers.set('Vary', mergeVary(out.headers.get('Vary'), 'Accept'));
        out.headers.set('X-Content-Type-Options', 'nosniff');
        // Tell the agent which URL the representation came from, per acceptmarkdown.com guidance
        // that the Markdown variant stays discoverable.
        out.headers.set('Content-Location', twin);
        // The negotiated representation lives at the page's own URL, which IS the canonical.
        // Saying so explicitly stops a crawler reading Content-Location as "the real copy is
        // the .md file".
        out.headers.append('Link', `<${url.origin}${pathname}>; rel="canonical"`);
        return out;
      }
      // No twin for this page: fall through and serve HTML, still with Vary: Accept so the
      // negotiation is honest about having been considered.
    }
  }

  const response = await fetchImpl(request);

  // 2. Agent-recoverable 404. Browsers (explicit text/html) keep the SPA shell, which is what
  //    /pay/:token and /ref/* deep links rely on. Everything else gets a short Markdown body.
  if (response.status === 404 && !isSpaFallbackPath(pathname)
    && (wantsMarkdown || !wantsHtmlDocument(accept))) {
    const body = request.method === 'HEAD' ? null : notFoundMarkdown(pathname, url.origin);
    return markdownResponse(body, 404, { 'Cache-Control': 'no-store' });
  }

  // 3. HTML documents: advertise that this URL varies on Accept, so a CDN can never serve a
  //    cached HTML variant to a client that asked for Markdown (or the reverse).
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/html')) {
    const out = new Response(response.body, response);
    out.headers.set('Vary', mergeVary(out.headers.get('Vary'), 'Accept'));
    const twin = markdownTwinFor(pathname);
    if (twin && response.status === 200) {
      // Discovery hint: an agent that reads headers finds the Markdown twin without guessing.
      out.headers.append('Link', `<${twin}>; rel="alternate"; type="text/markdown"`);
    }
    return out;
  }

  return response;
}
