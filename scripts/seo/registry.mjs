// Central link-graph + sitemap registry for the SEO silo. SINGLE SOURCE OF TRUTH.
// Owned by the orchestrator — content data modules never edit this. Drives:
//   • the unified sitemap.xml,
//   • relatedLinks() interlinking on every page,
//   • breadcrumbs.
// Anchors are descriptive + keyword-rich (used as visible anchor text in the silo).

import { SITE } from '../compare-data.mjs';

export { SITE };

// Money + hub destinations (existing + new). `path` is the live URL (trailing slash).
export const NAV = {
  home:       { key: 'home',      path: '/',                                          anchor: 'AutoLander — Facebook Marketplace auto poster for car dealers' },
  category:   { key: 'category',  path: '/facebook-marketplace-auto-poster/',         anchor: 'Facebook Marketplace auto poster for car dealers' },
  compareHub: { key: 'compareHub',path: '/compare/',                                  anchor: 'Best Facebook Marketplace auto-posting tools (2026 comparison)' },
  integHub:   { key: 'integHub',  path: '/integrations/',                             anchor: 'Facebook Marketplace integrations & DMS feeds' },
  guide:      { key: 'guide',     path: '/guide/facebook-marketplace-automation/',    anchor: 'Guide: Facebook Marketplace automation (the honest version)' },
  inventory:  { key: 'inventory', path: '/facebook-marketplace-inventory-sync/',      anchor: 'Facebook Marketplace inventory sync & feed' },
  bulk:       { key: 'bulk',      path: '/bulk-post-cars-to-facebook-marketplace/',   anchor: 'Bulk post cars to Facebook Marketplace' },
  safety:     { key: 'safety',    path: '/safest-facebook-marketplace-auto-poster/',  anchor: 'Safest Facebook Marketplace auto poster' },
  pricing:    { key: 'pricing',   path: '/facebook-marketplace-auto-poster-pricing/', anchor: 'Facebook Marketplace auto poster pricing' },
  listingSw:  { key: 'listingSw', path: '/facebook-marketplace-listing-software/',    anchor: 'Facebook Marketplace listing software & tools' },
  fbListing:  { key: 'fbListing', path: '/facebook-listing-software/',                anchor: 'Facebook listing software & tool' },
  dealers:    { key: 'dealers',   path: '/facebook-marketplace-for-car-dealers/',     anchor: 'Facebook Marketplace for car dealers' },
};

// Integration spokes. `system` = how AutoLander connects (honest):
//   'feed'   -> named, directly supported feed source (CarGurus, Cars.com)
//   'custom' -> ingested via a custom feed / export from that system (DMS / website providers)
export const INTEGRATIONS = [
  { slug: 'cargurus-facebook-marketplace',    name: 'CarGurus',     system: 'feed',   kind: 'Inventory marketplace / feed', anchor: 'CarGurus to Facebook Marketplace' },
  { slug: 'cars-com-facebook-marketplace',    name: 'Cars.com',     system: 'feed',   kind: 'Inventory marketplace / feed', anchor: 'Cars.com to Facebook Marketplace' },
  { slug: 'vauto-facebook-marketplace',       name: 'vAuto',        system: 'custom', kind: 'Inventory management (Cox Automotive)', anchor: 'vAuto to Facebook Marketplace' },
  { slug: 'dealercenter-facebook-marketplace',name: 'DealerCenter', system: 'custom', kind: 'Dealer management system (DMS)', anchor: 'DealerCenter to Facebook Marketplace' },
  { slug: 'dealer-com-facebook-marketplace',  name: 'Dealer.com',   system: 'custom', kind: 'Dealer website platform (Cox Automotive)', anchor: 'Dealer.com to Facebook Marketplace' },
  { slug: 'homenet-facebook-marketplace',     name: 'HomeNet',      system: 'custom', kind: 'Inventory management (Cox Automotive)', anchor: 'HomeNet to Facebook Marketplace' },
  { slug: 'frazer-facebook-marketplace',      name: 'Frazer',       system: 'custom', kind: 'Dealer management system (DMS)', anchor: 'Frazer to Facebook Marketplace' },
  { slug: 'cdk-facebook-marketplace',         name: 'CDK Global',   system: 'custom', kind: 'Dealer management system (DMS)', anchor: 'CDK to Facebook Marketplace' },
  { slug: 'tekion-facebook-marketplace',      name: 'Tekion',       system: 'custom', kind: 'Cloud dealer management system (DMS)', anchor: 'Tekion to Facebook Marketplace' },
];

export const integrationPath = (slug) => `/integrations/${slug}/`;
export const integrationUrl = (slug) => `${SITE.origin}/integrations/${slug}/`;

// ---- relatedLinks: the silo interlinking rules. Returns [{href, text}] for a page key. ----
// Keeps anchors keyword-rich and routes authority toward money + hubs.
const L = (nav) => ({ href: nav.path, text: nav.anchor });

export function relatedFor(pageKey, opts = {}) {
  const N = NAV;
  switch (pageKey) {
    case 'category':
      return [L(N.listingSw), L(N.dealers), L(N.fbListing), L(N.inventory), L(N.bulk), L(N.integHub), L(N.safety), L(N.pricing), L(N.compareHub), L(N.guide)];
    case 'inventory':
      return [L(N.listingSw), L(N.bulk), L(N.integHub), L(N.category), L(N.compareHub), L(N.pricing), L(N.guide)];
    case 'bulk':
      return [L(N.listingSw), L(N.dealers), L(N.inventory), L(N.integHub), L(N.category), L(N.safety), L(N.compareHub), L(N.pricing)];
    case 'safety':
      return [L(N.guide), L(N.compareHub), L(N.category), L(N.dealers), L(N.inventory), L(N.pricing)];
    case 'pricing':
      return [L(N.compareHub), L(N.category), L(N.listingSw), L(N.bulk), L(N.inventory), L(N.safety)];
    case 'integHub':
      return [L(N.inventory), L(N.bulk), L(N.listingSw), L(N.dealers), L(N.category), L(N.compareHub), L(N.pricing), L(N.guide)];
    // ---- new high-value commercial cluster (listing/posting software, fb listing, dealers use-case) ----
    case 'listingSw':
      return [L(N.category), L(N.dealers), L(N.fbListing), L(N.bulk), L(N.inventory), L(N.compareHub), L(N.pricing)];
    case 'fbListing':
      return [L(N.listingSw), L(N.category), L(N.dealers), L(N.inventory), L(N.compareHub), L(N.pricing), L(N.guide)];
    case 'dealers':
      return [L(N.category), L(N.listingSw), L(N.bulk), L(N.inventory), L(N.safety), L(N.compareHub), L(N.pricing)];
    case 'integrationSpoke': {
      // siblings (2-3) + hub + inventory + category + home handled by caller via siblingSpokes()
      return [L(N.integHub), L(N.inventory), L(N.bulk), L(N.category), L(N.compareHub), L(N.pricing)];
    }
    default:
      return [L(N.category), L(N.compareHub), L(N.integHub), L(N.guide)];
  }
}

// Pick up to n sibling integration spokes for a given slug (round-robin neighbours).
export function siblingSpokes(slug, n = 3) {
  const i = INTEGRATIONS.findIndex((x) => x.slug === slug);
  const out = [];
  for (let k = 1; out.length < n && k < INTEGRATIONS.length; k++) {
    const s = INTEGRATIONS[(i + k) % INTEGRATIONS.length];
    if (s.slug !== slug) out.push({ href: integrationPath(s.slug), text: `${s.anchor}` });
  }
  return out;
}

// Sitemap is assembled in ONE place — scripts/build-seo-pages.mjs (the single sitemap/robots writer).
// build-compare-pages.mjs no longer writes sitemap/robots (avoids two writers drifting/clobbering).
