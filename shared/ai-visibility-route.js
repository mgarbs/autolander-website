// shared/ai-visibility-route.js
//
// The one place the AEO/GEO page's URL lives. Every retired slug maps DIRECTLY to the current path (one hop).
// Imported by the Worker (301 map, no-transform list, form redirects), src/lib/boot.js, src/Root.jsx, the SEO
// registry, scripts/spa-fallback.mjs, scripts/seo-audit.mjs and the tests. Plain constants only: no side
// effects, no imports, so every bundler keeps just what a consumer uses.
//
// The internal page id stays 'ai-visibility' (data-al-hydrate, the ai-rest island, SiteNav page=, the proof
// module and the image folder public/ai-visibility/); only the public URL moved.

export const AI_VISIBILITY_PATH = '/aeo-geo-for-car-dealers/';
export const AI_VISIBILITY_DIR = 'aeo-geo-for-car-dealers';
export const AI_VISIBILITY_MD_PATH = '/aeo-geo-for-car-dealers.md';
export const AI_VISIBILITY_LEGACY_PATHS = ['/ai-visibility/'];
export const AI_VISIBILITY_NAV_LABEL = 'AEO & GEO';
