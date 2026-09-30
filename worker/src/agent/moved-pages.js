// Permanently moved marketing pages: the retired AEO/GEO page URLs 301 to the current one.
//
// /ai-visibility/ became /aeo-geo-for-car-dealers/ (2026-09-30). shared/ai-visibility-route.js holds both, so the
// site build, the Worker and the tests read one map. worker/src/index.js calls movedPageResponse() in its apex
// branch right after the short-links (inside the same fail-open try), BEFORE Zaraz, no-transform and
// handleSiteRequest: the old URL answers a 301 with no origin fetch, whatever its Accept header asks for.
//
// RULES THIS FILE KEEPS
// ---------------------
// * Exact-path match only (case-insensitive): /ai-visibility, /ai-visibility/, /ai-visibility/index.html and
//   /ai-visibility.md. No prefix and no splat, so the page images that stay under /ai-visibility/ (and
//   /ai-visibility/anything-else, /ai-visibility-foo/, /guide/ai-visibility/) fall through untouched.
// * GET and HEAD only; every other method passes through.
// * The query string is appended byte for byte as the URL parser serialized it (never rebuilt through
//   URLSearchParams), so UTMs, fbclid, ?sent=1 and ?error= survive. The host is fixed here, so no input can turn
//   this into an open redirect. The browser carries the #hash across the redirect itself.
// * 301, because the move is permanent and search engines should transfer the old URL's signals. One hop: every
//   legacy key maps straight to the current path, and no key is itself a current path (loop guard below).
//
// MIRRORED BY dist/ai-visibility/index.html, the build-time stub (scripts/spa-fallback.mjs) GitHub Pages serves
// when the Worker fails open or is off. test/moved-pages.test.js pins the two together.

import {
  AI_VISIBILITY_LEGACY_PATHS,
  AI_VISIBILITY_MD_PATH,
  AI_VISIBILITY_PATH,
} from '../../../shared/ai-visibility-route.js';

export const MOVED_PAGE_STATUS = 301;
export const MOVED_PAGE_ORIGIN = 'https://autolander.ai';

export const MOVED_PAGES = Object.freeze(Object.fromEntries(AI_VISIBILITY_LEGACY_PATHS.flatMap((legacy) => {
  const base = legacy.toLowerCase().replace(/\/$/, '');
  return [
    [base, AI_VISIBILITY_PATH],
    [`${base}/`, AI_VISIBILITY_PATH],
    [`${base}/index.html`, AI_VISIBILITY_PATH],
    [`${base}.md`, AI_VISIBILITY_MD_PATH],
  ];
})));

// Loop guard: test/moved-pages.test.js fails if any key above is also a live path (the page would redirect to
// itself). It is a test, not a module-load throw, because a throw here would take down every Worker route.

// Longer than any key above; anything past it cannot be a moved page, so skip the work.
const MAX_PATH_LENGTH = 64;

// '/ai-visibility/', '/AI-Visibility' ... -> the current path; everything else -> null.
export function movedPageTarget(pathname) {
  if (typeof pathname !== 'string' || pathname.length > MAX_PATH_LENGTH) return null;
  const key = pathname.toLowerCase();
  return Object.prototype.hasOwnProperty.call(MOVED_PAGES, key) ? MOVED_PAGES[key] : null;
}

// The 301 for a moved page's GET/HEAD, or null so the caller carries on with the normal site path.
export function movedPageResponse(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const target = movedPageTarget(url?.pathname);
  if (!target) return null;
  return new Response(null, {
    status: MOVED_PAGE_STATUS,
    headers: {
      // `url.search` is '' or starts with '?', and a bare '?' serializes to '', so no dangling '?'.
      Location: `${MOVED_PAGE_ORIGIN}${target}${url.search || ''}`,
      'Cache-Control': 'public, max-age=86400',
      'X-AL-Moved': '1',
    },
  });
}
