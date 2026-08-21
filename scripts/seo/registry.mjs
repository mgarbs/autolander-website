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
  sellGuide:  { key: 'sellGuide', path: '/guide/how-to-sell-cars-on-facebook-marketplace/', anchor: 'How to sell cars on Facebook Marketplace' },
  inventory:  { key: 'inventory', path: '/facebook-marketplace-inventory-sync/',      anchor: 'Facebook Marketplace inventory sync & feed' },
  bulk:       { key: 'bulk',      path: '/bulk-post-cars-to-facebook-marketplace/',   anchor: 'Bulk post cars to Facebook Marketplace' },
  safety:     { key: 'safety',    path: '/safest-facebook-marketplace-auto-poster/',  anchor: 'Safest Facebook Marketplace auto poster' },
  pricing:    { key: 'pricing',   path: '/facebook-marketplace-auto-poster-pricing/', anchor: 'Facebook Marketplace auto poster pricing' },
  listingSw:  { key: 'listingSw', path: '/facebook-marketplace-listing-software/',    anchor: 'Facebook Marketplace listing software & tools' },
  fbListing:  { key: 'fbListing', path: '/facebook-listing-software/',                anchor: 'Facebook listing software & tool' },
  dealers:    { key: 'dealers',   path: '/facebook-marketplace-for-car-dealers/',     anchor: 'Facebook Marketplace for car dealers' },
  aiTools:    { key: 'aiTools',   path: '/facebook-ai-tools/',                         anchor: 'Facebook AI tools for car dealers' },
  automation: { key: 'automation',path: '/facebook-marketplace-automation/',          anchor: 'Facebook Marketplace automation' },
  assistant:  { key: 'assistant', path: '/facebook-marketplace-assistant/',           anchor: 'Facebook Marketplace assistant' },
  autoposter: { key: 'autoposter',path: '/facebook-autoposter/',                       anchor: 'Facebook autoposter' },
  // ---- Dealer-growth silo (2026-08-20): informational hub + spokes that funnel dealer-persona
  // searches (marketing / leads / social / AI) down to the money pages and the homepage. ----
  mktgHub:    { key: 'mktgHub',    path: '/guide/car-dealership-marketing/',           anchor: 'Car dealership marketing: the 2026 playbook' },
  mktgIdeas:  { key: 'mktgIdeas',  path: '/guide/car-dealership-marketing-ideas/',     anchor: 'Car dealership marketing ideas that sell cars' },
  salesLeads: { key: 'salesLeads', path: '/guide/car-sales-leads/',                    anchor: 'How to get more car sales leads' },
  socialMedia:{ key: 'socialMedia',path: '/guide/social-media-for-car-dealers/',       anchor: 'Social media for car dealers' },
  sellMore:   { key: 'sellMore',   path: '/guide/how-to-sell-more-cars/',              anchor: 'How to sell more cars' },
  aiDealers:  { key: 'aiDealers',  path: '/guide/ai-for-car-dealerships/',             anchor: 'AI for car dealerships: what actually works' },
  aiChat:     { key: 'aiChat',     path: '/ai-chat-for-car-dealers/',                  anchor: 'AI chat for car dealers — the honest guide' },
  photoEditor:{ key: 'photoEditor',path: '/ai-car-photo-editor/',                      anchor: 'AI car photo editor for dealers' },
  rvDealers:  { key: 'rvDealers',  path: '/rv-dealer-software/',                       anchor: 'RV dealer software for Facebook Marketplace' },
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
      return [L(N.aiTools), L(N.listingSw), L(N.automation), L(N.assistant), L(N.autoposter), L(N.dealers), L(N.sellGuide), L(N.fbListing), L(N.inventory), L(N.bulk), L(N.integHub), L(N.safety), L(N.pricing), L(N.compareHub), L(N.guide), L(N.mktgHub), L(N.rvDealers)];
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
      return [L(N.sellGuide), L(N.category), L(N.listingSw), L(N.bulk), L(N.inventory), L(N.safety), L(N.compareHub), L(N.pricing), L(N.mktgHub), L(N.aiChat)];
    // ---- educational hub (aiTools) pushes DOWN to every commercial page; commercial pages link up + across ----
    case 'aiTools':
      return [L(N.category), L(N.listingSw), L(N.automation), L(N.assistant), L(N.autoposter), L(N.fbListing), L(N.dealers), L(N.bulk), L(N.inventory), L(N.compareHub), L(N.photoEditor), L(N.aiChat), L(N.aiDealers)];
    case 'automation':
      return [L(N.category), L(N.aiTools), L(N.assistant), L(N.autoposter), L(N.bulk), L(N.safety), L(N.guide), L(N.sellGuide), L(N.compareHub), L(N.pricing)];
    case 'assistant':
      return [L(N.category), L(N.aiTools), L(N.listingSw), L(N.automation), L(N.autoposter), L(N.compareHub), L(N.pricing), L(N.aiChat)];
    case 'autoposter':
      return [L(N.category), L(N.listingSw), L(N.automation), L(N.aiTools), L(N.dealers), L(N.compareHub), L(N.pricing)];
    case 'integrationSpoke': {
      // siblings (2-3) + hub + inventory + category + home handled by caller via siblingSpokes()
      return [L(N.integHub), L(N.inventory), L(N.bulk), L(N.category), L(N.compareHub), L(N.pricing)];
    }
    // ---- Dealer-growth silo. Hub <-> spokes are bidirectional; every informational spoke
    // descends to at least one money page; money pages link up, across and to pricing. ----
    case 'mktgHub':
      return [L(N.mktgIdeas), L(N.salesLeads), L(N.socialMedia), L(N.sellMore), L(N.aiDealers), L(N.aiChat), L(N.photoEditor), L(N.category), L(N.dealers)];
    case 'mktgIdeas':
      return [L(N.mktgHub), L(N.socialMedia), L(N.salesLeads), L(N.sellMore), L(N.photoEditor), L(N.category), L(N.dealers)];
    case 'salesLeads':
      return [L(N.aiChat), L(N.mktgHub), L(N.sellMore), L(N.socialMedia), L(N.category), L(N.assistant), L(N.dealers)];
    case 'socialMedia':
      return [L(N.category), L(N.mktgHub), L(N.mktgIdeas), L(N.bulk), L(N.photoEditor), L(N.aiChat), L(N.sellGuide)];
    case 'sellMore':
      return [L(N.mktgHub), L(N.salesLeads), L(N.aiChat), L(N.photoEditor), L(N.category), L(N.sellGuide), L(N.dealers)];
    case 'aiDealers':
      return [L(N.aiChat), L(N.photoEditor), L(N.aiTools), L(N.assistant), L(N.mktgHub), L(N.category), L(N.automation)];
    case 'aiChat':
      return [L(N.aiDealers), L(N.salesLeads), L(N.assistant), L(N.category), L(N.dealers), L(N.pricing), L(N.mktgHub)];
    case 'photoEditor':
      return [L(N.aiDealers), L(N.aiTools), L(N.category), L(N.listingSw), L(N.mktgHub), L(N.bulk), L(N.pricing)];
    case 'rvDealers':
      return [L(N.category), L(N.inventory), L(N.bulk), L(N.dealers), L(N.safety), L(N.pricing), L(N.compareHub)];
    default:
      return [L(N.category), L(N.compareHub), L(N.integHub), L(N.guide), L(N.sellGuide), L(N.mktgHub)];
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
