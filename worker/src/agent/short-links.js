// Vanity booking short-links: autolander.ai/onboarding, /demo and /demo-clay.
//
// These are the links we print in e-mails, texts and slides, so they have to be short, stable and
// survive the booking tool changing its URLs. worker/src/index.js calls shortLinkResponse() in its
// apex branch BEFORE handleSiteRequest (inside the same fail-open try), so these answer a 302 with
// no origin fetch; nothing else on the site is touched.
//
// RULES THIS FILE KEEPS
// ---------------------
// * Exact-path match only (case-insensitive, one optional trailing slash). /demo/x, /demos,
//   /demo.html and /training/demo/ are NOT short-links — they fall through to the site untouched.
// * The query string is appended byte-for-byte as the URL parser serialized it (never rebuilt via
//   URLSearchParams, which would re-encode it), so UTMs and the welcome e-mail's first_name /
//   last_name / email / phone prefill reach the booking widget exactly as sent. The redirect host
//   is fixed by this map, so no input can turn it into an open redirect. The browser carries the
//   #hash across the redirect itself (RFC 7231 §7.1.2).
// * 302, not 301: the booking URLs may change, and browsers cache a 301 permanently. 307 adds
//   nothing for GET/HEAD, and every other method passes through.
// * `Cache-Control: private, no-store` so no shared cache pins an old target either.
//
// MIRRORED BY public/<slug>/index.html — the static fallback GitHub Pages serves when the Worker
// fails open or is off (quota, route disabled) and on the Pages preview. test/short-links.test.js
// pins the two together: change a target here and in the matching page in the same commit.

export const SHORT_LINK_STATUS = 302;

export const SHORT_LINKS = Object.freeze({
  '/onboarding': 'https://go.autolander.ai/widget/bookings/autolander-onboarding',
  '/demo': 'https://go.autolander.ai/widget/bookings/autolander-demo',
  '/demo-clay': 'https://go.autolander.ai/widget/bookings/autolander-demo-clay',
});

// Longer than any slug above; anything past it cannot be a short-link, so skip the work.
const MAX_PATH_LENGTH = 64;

// '/demo', '/demo/', '/DEMO' -> the target; everything else -> null.
export function shortLinkTarget(pathname) {
  if (typeof pathname !== 'string' || pathname.length > MAX_PATH_LENGTH) return null;
  // Strip exactly one trailing slash from a single-segment path. '/demo//' keeps a slash and
  // '/demo/x' has two segments, so neither can match.
  const key = pathname.toLowerCase().replace(/^(\/[^/]+)\/$/, '$1');
  return Object.prototype.hasOwnProperty.call(SHORT_LINKS, key) ? SHORT_LINKS[key] : null;
}

// Target + the request's own query string. `url.search` is '' or starts with '?', and a bare '?'
// serializes to '' — so '/demo-clay?' never produces a dangling '?'.
export function shortLinkLocation(url) {
  const target = shortLinkTarget(url?.pathname);
  if (!target) return null;
  return `${target}${url.search || ''}`;
}

// The 302 for a short-link GET/HEAD, or null so the caller carries on with the normal site path.
export function shortLinkResponse(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const location = shortLinkLocation(url);
  if (!location) return null;
  return new Response(null, {
    status: SHORT_LINK_STATUS,
    headers: {
      Location: location,
      'Cache-Control': 'private, no-store',
    },
  });
}
