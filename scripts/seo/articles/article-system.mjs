// Avalanche article layer: the drip-published long-tail library with per-silo URL roots.
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
//     slug,              // final URL uses the silo basePath (must exist in publish-state.json)
//     silo,              // 'marketplace' | 'photos' | 'growth' | 'metaTools' | 'compare'
//     anchor,            // keyword-rich anchor text used when OTHER pages link here
//     crumb,             // very short breadcrumb tail name
//     primaryKeyword, secondaryKeywords: [..],   // recorded in content-status.json
//     alsoRelated: [slug, ...],                  // optional publish-aware cross-silo links
//     augmentKeys: [navKey, ...],                // optional extra NAV hubs to augment
//     alsoOnCompetitors: [competitorSlug, ...],  // optional /compare/ versus-page links
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
  // 2026-09-12: the timely silo for Meta's own seller-side launches (Seller app, Muse). Hub is
  // /facebook-ai-tools/ (it IS the "Facebook AI tools for car dealers" page), and the dealers
  // use-case page also gains the links, because that is where a dealer asking "does this post
  // my cars" lands.
  metaTools: {
    label: 'Facebook’s new seller tools',
    hubKey: 'aiTools',
    crumb: { name: 'Facebook AI tools for car dealers', url: SITE.origin + NAV.aiTools.path },
    // whyNoAutoReply is deliberate: the pairing these articles describe (AutoLander lists,
    // Meta's own AI takes the conversation) is that page's principle stated as product.
    related: [L(NAV.aiTools), L(NAV.dealers), L(NAV.category), L(NAV.whyNoAutoReply), L(NAV.automation)],
    augmentKeys: ['aiTools', 'dealers'],
  },
  // Comparison pieces belong in the /compare/ silo by URL, breadcrumb, and hub links. The
  // /compare/ hub is built by build-compare-pages.mjs, so compareHubLinks() supplies its
  // down-links instead of including compareHub in augmentKeys.
  compare: {
    label: 'Comparisons & alternatives',
    hubKey: 'compareHub',
    basePath: '/compare/',
    crumb: { name: 'Compare', url: SITE.origin + NAV.compareHub.path },
    related: [L(NAV.compareHub), L(NAV.aiTools), L(NAV.whyNoAutoReply), L(NAV.category), L(NAV.pricing)],
    augmentKeys: ['aiTools'],
  },
};

// A slug string retains the original /guide/ contract. Passing the content object lets a
// silo opt into a different URL family without making legacy callers aware of SILOS.
export const articlePath = (articleOrSlug) => {
  const content = typeof articleOrSlug === 'string' ? null : articleOrSlug;
  const slug = content?.slug ?? articleOrSlug;
  const basePath = content ? (SILOS[content.silo]?.basePath || '/guide/') : '/guide/';
  return `${basePath}${slug}/`;
};
export const articleUrl = (articleOrSlug) => SITE.origin + articlePath(articleOrSlug);

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
  // 2026-09-12: the two Meta-launch articles jump the queue — they ride live search interest
  // (Seller app July 24, Muse September 8) and decay if they wait their turn.
  'facebook-seller-app-for-car-dealers',
  'meta-muse-ai-agent-for-car-dealers',
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
  // 2026-09-26: timely Muse comparison pieces jump the queue, the same reasoning as the
  // 2026-09-12 Meta-tools pair.
  'meta-muse-vs-autolander-vs-carvid',
  'meta-muse-for-car-dealerships',
  'meta-muse-for-car-salesmen',
  'facebook-marketplace-auto-reply-for-car-dealers',
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
    links.push({ href: articlePath(sib), text: sib.anchor });
    added += 1;
  }
  const capped = links.slice(0, 8);
  const seenHrefs = new Set(capped.map((link) => link.href));
  for (const slug of content.alsoRelated || []) {
    const target = bySlug.get(slug);
    if (!target || target.slug === content.slug || !isPublished(state, target.slug)) continue;
    const href = articlePath(target);
    if (seenHrefs.has(href)) continue;
    capped.push({ href, text: target.anchor });
    seenHrefs.add(href);
  }
  return capped;
}

// ---- full page object for shell.renderPage(). `datePublished` is the real publish
// date; a draft rendered in preview mode gets today so the preview looks final.
export function buildArticlePage(content, articles, state, { previewDate } = {}) {
  const path = articlePath(content);
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
    const keys = [...new Set([...(SILOS[a.silo].augmentKeys || []), ...(a.augmentKeys || [])])];
    for (const key of keys) {
      if (!out.has(key)) out.set(key, []);
      out.get(key).push({ href: articlePath(a), text: a.anchor });
    }
  }
  return out;
}

// The hand-built /compare/ hub consumes these separately from NAV hub augmentation.
export function compareHubLinks(articles, state) {
  const orderIndex = new Map(SUGGESTED_ORDER.map((s, i) => [s, i]));
  return articles
    .filter((a) => a.silo === 'compare' && isPublished(state, a.slug))
    .sort((a, b) => (orderIndex.get(a.slug) ?? 99) - (orderIndex.get(b.slug) ?? 99))
    .map((a) => ({ href: articlePath(a), text: a.anchor, description: a.description }));
}

// Published articles can opt into one or more hand-built competitor pages.
export function versusPageLinks(articles, state) {
  const out = new Map();
  const orderIndex = new Map(SUGGESTED_ORDER.map((s, i) => [s, i]));
  const publishedSorted = articles
    .filter((a) => isPublished(state, a.slug))
    .sort((a, b) => (orderIndex.get(a.slug) ?? 99) - (orderIndex.get(b.slug) ?? 99));
  for (const a of publishedSorted) {
    for (const competitorSlug of new Set(a.alsoOnCompetitors || [])) {
      if (!out.has(competitorSlug)) out.set(competitorSlug, []);
      out.get(competitorSlug).push({ href: articlePath(a), text: a.anchor });
    }
  }
  return out;
}

export function backlinkedFrom(slug, articles) {
  return articles
    .filter((a) => (a.alsoRelated || []).includes(slug))
    .map((a) => a.slug);
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
        path: articlePath(a),
        url: articleUrl(a),
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
      loc: articleUrl(a),
      pri: '0.7',
      freq: 'monthly',
      lastmod: state[a.slug].publishedAt,
    }));
}
