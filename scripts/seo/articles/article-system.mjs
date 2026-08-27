// Avalanche article layer — the drip-published long-tail library under /guide/.
// Owned by the orchestrator; content modules (data-articles-*.mjs) never edit this.
//
// WHY THIS EXISTS: the evergreen silo (registry.mjs NAV) targets the verified >100/mo
// keywords. This layer sits one tier BELOW it (SEO-Avalanche style): ~30 long-tail
// question articles at the site's current traffic tier, each published one-by-one from
// the /admin Content Publisher, each funneling up to a hub and down to a money page.
//
// PUBLISH GATING — the single load-bearing rule:
//   scripts/seo/articles/publish-state.json decides everything. A draft article is
//   NEVER rendered into public/, never in the sitemap, never in llms.txt, never linked
//   from a hub, never linked from a published sibling. Publishing = flip state via
//   scripts/publish-article.mjs (locally or through the publish-article GitHub workflow)
//   → regenerate → commit. All interlinking recomputes from the state on every build, so
//   earlier articles automatically gain links to later ones as they go live.
//
// CONTENT OBJECT CONTRACT (what data-articles-*.mjs export in ARTICLES):
//   {
//     slug,              // final URL: /guide/<slug>/  (must exist in publish-state.json)
//     silo,              // 'marketplace' | 'photos' | 'growth'
//     anchor,            // keyword-rich anchor text used when OTHER pages link here
//     crumb,             // very short breadcrumb tail name
//     primaryKeyword, secondaryKeywords: [..],   // recorded in content-status.json
//     title, description, eyebrow, h1, tldr,     // same meaning as shell.mjs contract
//     sections, faq, cta,                        // same section types as shell.mjs
//   }
// The builder below adds: path, breadcrumbs, byline/author, Article JSON-LD with the
// REAL publish date from publish-state, and the publish-aware related links. Writers
// stay on pure content and cannot break the silo graph.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, NAV } from '../registry.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PUBLISH_STATE_PATH = resolve(HERE, 'publish-state.json');

export const articlePath = (slug) => `/guide/${slug}/`;
export const articleUrl = (slug) => SITE.origin + articlePath(slug);

// ---- silo definitions. hub = the page whose breadcrumb the article sits under and the
// first related link; money = commercial pages every article in the silo may descend to.
const L = (nav) => ({ href: nav.path, text: nav.anchor });
export const SILOS = {
  marketplace: {
    label: 'Marketplace operations',
    hubKey: 'dealers',
    crumb: { name: 'Facebook Marketplace for car dealers', url: SITE.origin + NAV.dealers.path },
    related: [L(NAV.dealers), L(NAV.sellGuide), L(NAV.category), L(NAV.safety)],
    // hub pages whose "Keep exploring" gains links to this silo's published articles
    augmentKeys: ['dealers', 'sellGuide'],
  },
  photos: {
    label: 'Photos & merchandising',
    hubKey: 'photoEditor',
    crumb: { name: 'AI car photo editor', url: SITE.origin + NAV.photoEditor.path },
    related: [L(NAV.photoEditor), L(NAV.aiDealers), L(NAV.category), L(NAV.mktgHub)],
    augmentKeys: ['photoEditor', 'aiDealers'],
  },
  growth: {
    label: 'Dealer growth',
    hubKey: 'mktgHub',
    crumb: { name: 'Car dealership marketing', url: SITE.origin + NAV.mktgHub.path },
    related: [L(NAV.mktgHub), L(NAV.mktgIdeas), L(NAV.category), L(NAV.dealers)],
    augmentKeys: ['mktgHub', 'mktgIdeas'],
  },
};

// ---- the drip order shown in /admin (suggested publish sequence: silos interleaved so
// every hub grows steadily; the two highest-volume stretch targets go early).
export const SUGGESTED_ORDER = [
  'post-a-car-on-facebook-marketplace-dealer',
  'how-to-take-pictures-of-a-car-to-sell',
  'free-places-to-advertise-used-cars',
  'best-time-to-post-cars-on-facebook-marketplace',
  'remove-background-from-car-photo',
  'used-car-dealer-advertising-on-a-budget',
  'facebook-marketplace-car-listing-limits',
  'car-photography-tips-for-dealerships',
  'how-to-price-used-cars-competitively',
  'facebook-marketplace-car-listing-removed',
  'how-many-photos-should-a-car-listing-have',
  'google-business-profile-for-car-dealers',
  'renew-facebook-marketplace-car-listings',
  'best-angles-for-car-listing-photos',
  'respond-to-facebook-marketplace-messages-dealer',
  'facebook-marketplace-car-description-template',
  'dark-cluttered-car-photos-cost-sales',
  'car-sales-follow-up-templates',
  'mark-car-sold-on-facebook-marketplace',
  'car-walkaround-video-for-dealers',
  'sell-cars-online-small-dealership',
  'facebook-marketplace-listing-not-showing-up',
  'car-photo-backdrop-vs-ai-background',
  'buy-here-pay-here-marketing',
  'facebook-marketplace-vs-craigslist-for-selling-cars',
  'used-car-merchandising-checklist',
  'aged-inventory-used-car-dealers',
  'sell-rvs-on-facebook-marketplace',
  'how-long-to-sell-a-car-on-facebook-marketplace',
  'boost-facebook-marketplace-car-listing',
];

export function loadPublishState() {
  return JSON.parse(readFileSync(PUBLISH_STATE_PATH, 'utf8'));
}

export const isPublished = (state, slug) => state?.[slug]?.status === 'published';

// ---- related links for one article: hub links + up to 4 PUBLISHED silo siblings
// (deterministic round-robin from SUGGESTED_ORDER so every build agrees), capped at 8.
export function relatedForArticle(content, articles, state) {
  const silo = SILOS[content.silo];
  const links = [...silo.related];
  const order = SUGGESTED_ORDER.filter((s) => s !== content.slug);
  const start = Math.max(0, SUGGESTED_ORDER.indexOf(content.slug));
  const rotated = [...order.slice(start), ...order.slice(0, start)];
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  let added = 0;
  for (const slug of rotated) {
    if (added >= 4) break;
    const sib = bySlug.get(slug);
    if (!sib || sib.silo !== content.silo) continue;
    if (!isPublished(state, slug)) continue;
    links.push({ href: articlePath(slug), text: sib.anchor });
    added += 1;
  }
  return links.slice(0, 8);
}

// ---- full page object for shell.renderPage(). `datePublished` is the real publish
// date; a draft rendered in preview mode gets today so the preview looks final.
export function buildArticlePage(content, articles, state, { previewDate } = {}) {
  const path = articlePath(content.slug);
  const published = state?.[content.slug]?.publishedAt || null;
  return {
    path,
    title: content.title,
    description: content.description,
    eyebrow: content.eyebrow || SILOS[content.silo].label,
    h1: content.h1,
    tldr: content.tldr,
    bylineUpdated: true,
    author: true,
    // Articles carry their OWN date everywhere a date is user- or crawler-visible:
    // byline, WebPage/Article dateModified, and the .md twin. Site-wide SITE.updated
    // stays for evergreen pages only.
    updated: published || previewDate || SITE.updated,
    article: { datePublished: published || previewDate || SITE.updated },
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      SILOS[content.silo].crumb,
      { name: content.crumb, url: SITE.origin + path },
    ],
    sections: content.sections,
    faq: content.faq,
    faqHeading: content.faqHeading,
    cta: content.cta,
    related: relatedForArticle(content, articles, state),
    relatedHeading: 'Keep exploring',
  };
}

// ---- hub augmentation: NAV key -> extra links for that hub page's related list,
// covering only PUBLISHED articles. build-seo-pages appends these before rendering,
// which is how earlier pages grow links to newly published spokes.
export function hubAugmentLinks(articles, state) {
  const out = new Map();
  const orderIndex = new Map(SUGGESTED_ORDER.map((s, i) => [s, i]));
  const publishedSorted = articles
    .filter((a) => isPublished(state, a.slug))
    .sort((a, b) => (orderIndex.get(a.slug) ?? 99) - (orderIndex.get(b.slug) ?? 99));
  for (const a of publishedSorted) {
    for (const key of SILOS[a.silo].augmentKeys) {
      if (!out.has(key)) out.set(key, []);
      out.get(key).push({ href: articlePath(a.slug), text: a.anchor });
    }
  }
  return out;
}

// ---- content-status.json payload — the /admin Content Publisher reads this.
export function contentStatusJson(articles, state) {
  const orderIndex = new Map(SUGGESTED_ORDER.map((s, i) => [s, i + 1]));
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    note: 'Avalanche article drip. status flips via scripts/publish-article.mjs (admin Content Publisher → publish-article workflow).',
    articles: articles
      .map((a) => ({
        slug: a.slug,
        path: articlePath(a.slug),
        url: articleUrl(a.slug),
        title: a.title,
        h1: a.h1,
        silo: a.silo,
        siloLabel: SILOS[a.silo].label,
        primaryKeyword: a.primaryKeyword,
        secondaryKeywords: a.secondaryKeywords || [],
        description: a.description,
        suggestedOrder: orderIndex.get(a.slug) ?? null,
        status: state?.[a.slug]?.status || 'draft',
        publishedAt: state?.[a.slug]?.publishedAt || null,
      }))
      .sort((a, b) => (a.suggestedOrder ?? 99) - (b.suggestedOrder ?? 99)),
  };
}

// ---- sitemap entries for published articles (per-URL lastmod = publish date).
export function articleSitemapEntries(articles, state) {
  return articles
    .filter((a) => isPublished(state, a.slug))
    .map((a) => ({
      loc: articleUrl(a.slug),
      pri: '0.7',
      freq: 'monthly',
      lastmod: state[a.slug].publishedAt,
    }));
}
