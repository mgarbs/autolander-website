// Keeps Cloudflare's edge from rewriting the HTML of the three prerendered pages.
//
// WHY
// ---
// /, the AEO and GEO page (/aeo-geo-for-car-dealers/, shared/ai-visibility-route.js) and /team/ ship a finished
// first screen and load their app after the first paint.
// Cloudflare Web Analytics (RUM) is auto-injected at the edge as a High-priority <script type="module">
// from a third-party origin (static.cloudflareinsights.com) plus a /cdn-cgi/rum call; it lands on the
// critical path of those pages (lab FCP ~1.4 s -> ~2.0 s on the AEO and GEO page and /team/). Cloudflare
// documents exactly one response-level switch that stops the injection: `Cache-Control: no-transform`
// ("the Beacon script will not be automatically injected", developers.cloudflare.com/web-analytics/faq/).
// These pages load the same beacon themselves after the load event instead (scripts/spa-shell.mjs,
// beaconLoaderHtml), so Web Analytics keeps collecting.
//
// WHAT no-transform ALSO TURNS OFF, AND HOW THIS FILE COVERS IT
// -------------------------------------------------------------
// * Edge compression. no-transform stops Cloudflare from encoding the response, so the Worker encodes
//   it itself: it picks br, then gzip, from the client's Accept-Encoding (identity when neither is
//   accepted) and the Workers runtime compresses the body to match (encodeBody "automatic").
// * Email Address Obfuscation. Every address on these three pages is already wrapped in email_off
//   (intentionally readable, identical to what the edge serves today); test/worker-no-transform.test.js
//   fails the build if an unwrapped address appears on them.
// * Nothing else in use: no Rocket Loader, Fonts, Polish or JS detections on these pages. Zaraz is
//   injected by this Worker (zaraz-tag.js), not by the edge, so it is unaffected.
//
// SCOPE AND KILL SWITCH
// ---------------------
// Only GET 200 text/html responses on exactly these paths; everything else is returned untouched.
// TRACKING KV `cfg:html_no_transform` ('on' | 'off', 60 s cache) overrides env HTML_NO_TRANSFORM; with
// 'off' the edge injects the beacon as before and the page's own loader stands down (it dedupes).
// Any error returns the response unchanged.

import { AI_VISIBILITY_PATH } from '../../../shared/ai-visibility-route.js';

// The retired /ai-visibility/ is not listed: the Worker answers it with a 301 (moved-pages.js) before this runs.
export const NO_TRANSFORM_PATHS = new Set(['/', '/index.html', AI_VISIBILITY_PATH, '/team/']);
export const NO_TRANSFORM_KEY = 'cfg:html_no_transform';

export async function readNoTransformMode(env) {
  try {
    const value = await env.TRACKING?.get(NO_TRANSFORM_KEY, { cacheTtl: 60 });
    if (value === 'on' || value === 'off') return value;
  } catch { /* KV failure: fall back to the deployed default. */ }
  return env.HTML_NO_TRANSFORM === 'on' ? 'on' : 'off';
}

// q-values per coding from an Accept-Encoding header ("br;q=0" means NOT acceptable).
function acceptedCodings(header) {
  const q = new Map();
  for (const part of String(header || '').toLowerCase().split(',')) {
    const [name, ...params] = part.split(';').map((s) => s.trim());
    if (!name) continue;
    let weight = 1;
    for (const param of params) {
      const m = /^q=([0-9.]+)$/.exec(param);
      if (m) weight = Number(m[1]);
    }
    q.set(name, Number.isFinite(weight) ? weight : 0);
  }
  return q;
}

export function pickContentEncoding(acceptEncoding) {
  const q = acceptedCodings(acceptEncoding);
  const ok = (name) => (q.has(name) ? q.get(name) > 0 : (q.get('*') || 0) > 0);
  if (ok('br')) return 'br';
  if (ok('gzip')) return 'gzip';
  return '';
}

export function isNoTransformPage(request, url, response) {
  return request.method === 'GET'
    && response.status === 200
    && NO_TRANSFORM_PATHS.has(url.pathname)
    && (response.headers.get('Content-Type') || '').toLowerCase().includes('text/html');
}

export function withoutEdgeRewrites(request, url, response, { mode = 'off' } = {}) {
  try {
    if (mode !== 'on' || !isNoTransformPage(request, url, response)) return response;
    const headers = new Headers(response.headers);
    const cacheControl = headers.get('Cache-Control') || '';
    if (!/(^|,)\s*no-transform\s*(,|$)/i.test(cacheControl)) {
      headers.set('Cache-Control', cacheControl ? `${cacheControl}, no-transform` : 'no-transform');
    }
    const encoding = pickContentEncoding(request.headers.get('Accept-Encoding'));
    if (encoding) headers.set('Content-Encoding', encoding);
    else headers.delete('Content-Encoding');
    headers.delete('Content-Length');
    // The bytes now depend on the negotiated coding: a strong validator would be wrong.
    const etag = headers.get('ETag');
    if (etag && !etag.startsWith('W/')) headers.set('ETag', `W/${etag}`);
    const vary = String(headers.get('Vary') || '');
    if (!/(^|,)\s*accept-encoding\s*(,|$)/i.test(vary)) headers.set('Vary', vary ? `${vary}, Accept-Encoding` : 'Accept-Encoding');
    headers.set('X-AL-Edge', `no-transform:${encoding || 'identity'}`);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
      encodeBody: 'automatic',
    });
  } catch {
    return response;
  }
}
