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
//     silo,              // 'marketplace' | 'photos' | 'growth' | 'metaTools' | 'compare' | 'aeoGeo'
//     cluster,           // optional; a key of SILOS[silo].clusters (groups the admin list and
//                        // puts same-cluster siblings first in "Keep exploring")
//     publishOrder,      // aeoGeo only: the silo publish number (1..n), equal to the slug's
//                        // position among the silo's slugs in SUGGESTED_ORDER
//     anchor,            // keyword-rich anchor text used when OTHER pages link here
//     crumb,             // very short breadcrumb tail name
//     primaryKeyword, secondaryKeywords: [..],   // recorded in content-status.json
//     alsoRelated: [slug, ...],                  // optional publish-aware cross-silo links
//     augmentKeys: [navKey, ...],                // optional extra NAV hubs to augment
//     alsoOnCompetitors: [competitorSlug, ...],  // optional /compare/ versus-page links
//     title, description, eyebrow, h1, tldr,     // same meaning as shell.mjs contract
//     sections, faq, cta,                        // same section types as shell.mjs; a silo with its
//                                                // own `cta` supplies button/href/fine print, the
//                                                // article supplies heading + sub only
//   }
// In-body links to OTHER drip articles are never hand-written as /guide/... or /aeo-geo/...
// hrefs. They use the publish-aware token [anchor text](@sibling-slug): the builder turns it
// into a real link once the target is published and prints the anchor text as plain text
// until then (resolveBodyLinks below). Any hand-written internal href whose target is an
// unpublished article (or a path the site does not serve), root-relative or absolute
// (https://autolander.ai/...), is also printed as plain text, so no publish order can ever
// produce a dead link.
// The builder below adds: path, breadcrumbs, byline/author, Article JSON-LD with the
// REAL publish date from publish-state, and the publish-aware related links. Writers
// stay on pure content and cannot break the silo graph.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, NAV } from '../registry.mjs';
import { collectText } from './content-rules.mjs';
// Pure constants (no side effects): the money page's own CTA words and footer columns, reused by
// the aeoGeo silo CTA and its on-topic footer, and the article family's URL root.
import {
  FINAL_CTA, FOOTER as AEO_FOOTER, FOOTER_NAV as AEO_FOOTER_NAV,
} from '../../../shared/ai-visibility-content.js';
import { AEO_GEO_ARTICLE_BASE } from '../../../shared/ai-visibility-route.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const BLOG_REQUEST_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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
  // 2026-09-30: AEO and GEO for car dealers, the service's own URL family (/aeo-geo/<slug>/),
  // breadcrumbed and isPartOf'd under the money page (NAV.aiVisibility). A separate business
  // line from the Marketplace software, so a separate path partition, CTA and OG fallback.
  // Silo-level augmentKeys stay empty: hubAugmentLinks appends EVERY published article of a
  // silo to each silo key, which at 50 articles would bury a hub. Cluster leads carry
  // per-article augmentKeys instead. Never 'aiVisibility': that page is an SPA route the
  // builder does not render, so augmenting it is inert.
  aeoGeo: {
    label: 'AEO and GEO for car dealers',
    hubKey: 'aiVisibility',
    // '/aeo-geo/', shared with the Worker (it 301s exactly /aeo-geo and /aeo-geo/ to the money page).
    basePath: AEO_GEO_ARTICLE_BASE,
    crumb: { name: 'AEO and GEO for car dealers', url: SITE.origin + NAV.aiVisibility.path },
    related: [L(NAV.aiVisibility), L(NAV.aiDealers), L(NAV.mktgHub), L(NAV.about)],
    augmentKeys: [],
    // Ordered [key, label]; `cluster` values in data-articles-aeo-geo-*.mjs. The order is the
    // cluster pillars' publish order (#1 to #9), which is also the admin's group order.
    clusters: [
      ['website', 'Your website: crawlers, schema and vehicle pages'],
      ['engines', 'How each AI assistant picks a dealer'],
      ['buyers', 'How car buyers use AI'],
      ['reputation', 'Business Profile, reviews and reputation'],
      ['content', 'Answer pages and content AI can quote'],
      ['basics', 'AEO and GEO basics and budget'],
      ['measurement', 'Measuring AI visibility'],
      ['dealer-types', 'AI search by dealership type'],
      ['choosing-help', 'Choosing help and doing it right'],
    ],
    // Every article ends on the free scan, not the Marketplace "plans & demo" CTA.
    cta: {
      href: `${SITE.origin}${NAV.aiVisibility.path}#scan-form`,
      button: FINAL_CTA.cta,
      fine: FINAL_CTA.note,
    },
    // No per-article OG cards yet: fall back to the AEO card, never the Marketplace one.
    ogFallback: '/og/ai-visibility.jpg',
    // Article JSON-LD `about`: the money page's own DefinedTerm nodes for AEO and GEO.
    about: [
      { '@id': `${SITE.origin}${NAV.aiVisibility.path}#term-aeo` },
      { '@id': `${SITE.origin}${NAV.aiVisibility.path}#term-geo` },
    ],
    // On-topic footer (shell.mjs siteFooter), mirroring the money page's own FOOTER_NAV columns
    // (AEO & GEO, AutoLander, Company) and footer line instead of the Marketplace product footer.
    // siloFooter() puts the money page itself first in the AEO & GEO column and appends the
    // PUBLISHED cluster pillars after the page's own anchors, so a draft is never linked.
    footer: {
      hub: { label: 'AEO and GEO for car dealers', href: NAV.aiVisibility.path },
      columns: AEO_FOOTER_NAV,
      line: AEO_FOOTER.line,
      pillars: true,
    },
    // The NAV page whose "AEO and GEO guides for dealers" block lists this silo's published
    // articles (publishedClusterGuides below). Publishing an article re-pings it (changedUrlsFor).
    guidesOn: 'aiVisibility',
  },
  blog: {
    label: 'Blog',
    hubKey: 'blog',
    basePath: '/blog/',
    crumb: { name: 'Blog', url: SITE.origin + NAV.blog.path },
    related: [L(NAV.blog), L(NAV.category), L(NAV.dealers), L(NAV.pricing)],
    augmentKeys: [],
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
  // 2026-09-30: AEO and GEO for car dealers (silo aeoGeo), publish numbers #1 to #50 in order.
  // Cluster pillars first (#1 to #9), then the clusters take turns. In-body sibling links only
  // point to LOWER numbers, so publishing top to bottom never creates a dead link.
  'can-chatgpt-see-my-dealer-website', // AEO #1 (pillar: website)
  'how-chatgpt-recommends-car-dealerships', // AEO #2 (pillar: engines)
  'how-car-buyers-use-chatgpt', // AEO #3 (pillar: buyers)
  'dealership-reviews-ai-recommendations', // AEO #4 (pillar: reputation)
  'answer-pages-for-car-dealerships', // AEO #5 (pillar: content)
  'aeo-vs-seo-for-car-dealers', // AEO #6 (pillar: basics)
  'measure-dealership-ai-visibility', // AEO #7 (pillar: measurement)
  'ai-search-for-independent-dealers', // AEO #8 (pillar: dealer-types)
  'how-to-choose-an-aeo-agency', // AEO #9 (pillar: choosing-help)
  'cloudflare-ai-bots-dealer-websites', // AEO #10
  'google-ai-overviews-for-car-dealers', // AEO #11
  'google-business-profile-ai-answers', // AEO #12
  'questions-car-buyers-ask-ai', // AEO #13
  'car-dealership-faq-page', // AEO #14
  'search-console-ai-report-dealers', // AEO #15
  'buy-here-pay-here-ai-answers', // AEO #16
  'is-seo-dead-for-car-dealers', // AEO #17
  'aeo-agency-red-flags', // AEO #18
  'vehicle-detail-page-ai-readable', // AEO #19
  'how-claude-cites-sources', // AEO #20
  'when-ai-gets-your-dealership-wrong', // AEO #21
  'best-car-dealership-near-me-ai', // AEO #22
  'service-department-ai-answers', // AEO #23
  'track-ai-traffic-ga4-dealership', // AEO #24
  'rv-dealer-ai-search', // AEO #25
  'how-long-does-aeo-take-to-work', // AEO #26
  'chatgpt-ads-for-car-dealers', // AEO #27
  'should-dealers-block-ai-crawlers', // AEO #28
  'google-ai-mode-for-car-dealers', // AEO #29
  'how-to-respond-to-car-dealership-reviews', // AEO #30
  'do-car-buyers-trust-ai-recommendations', // AEO #31
  'trade-in-questions-in-ai-answers', // AEO #32
  'ai-visibility-score-explained', // AEO #33
  'powersports-dealer-ai-search', // AEO #34
  'aeo-cost-for-car-dealerships', // AEO #35
  'aeo-checklist-for-dealerships', // AEO #36
  'car-dealership-schema-markup', // AEO #37
  'ask-maps-for-car-dealers', // AEO #38
  'reddit-and-dealership-reputation', // AEO #39
  'financing-questions-in-ai-answers', // AEO #40
  'dealer-group-ai-visibility', // AEO #41
  'llms-txt-for-car-dealerships', // AEO #42
  'perplexity-for-car-dealerships', // AEO #43
  'car-dealer-review-sites-ai-answers', // AEO #44
  'model-comparison-pages-for-dealers', // AEO #45
  'inventory-feeds-ai-shopping', // AEO #46
  'bing-places-for-car-dealers', // AEO #47
  'local-pr-for-car-dealerships', // AEO #48
  'youtube-for-car-dealerships-ai', // AEO #49
  'dealer-website-provider-ai-search', // AEO #50
];

export function loadPublishState() {
  return JSON.parse(readFileSync(PUBLISH_STATE_PATH, 'utf8'));
}

export const isPublished = (state, slug) => state?.[slug]?.status === 'published';
export const isBlog = (article) => article?.silo === 'blog';

// ---- clusters (admin grouping + sibling bias). null when the silo or article has none.
export const clusterIndex = (silo, cluster) => {
  const list = SILOS[silo]?.clusters || [];
  const i = list.findIndex(([key]) => key === cluster);
  return i >= 0 ? i : null;
};
export const clusterLabel = (silo, cluster) => {
  const i = clusterIndex(silo, cluster);
  return i === null ? null : SILOS[silo].clusters[i][1];
};

const suggestedRank = () => {
  const orderIndex = new Map(SUGGESTED_ORDER.map((slug, i) => [slug, i]));
  return (a) => orderIndex.get(a.slug) ?? Infinity;
};

// Each cluster's pillar, in the silo's cluster order: the cluster's first article in
// SUGGESTED_ORDER (for aeoGeo, publish numbers #1 to #9). Drafts included; callers gate.
export function clusterPillars(siloKey, articles) {
  const rank = suggestedRank();
  return (SILOS[siloKey]?.clusters || [])
    .map(([key]) => articles
      .filter((a) => a.silo === siloKey && a.cluster === key)
      .sort((a, b) => rank(a) - rank(b) || a.slug.localeCompare(b.slug))[0])
    .filter(Boolean);
}

// Hub -> spokes: a clustered silo's PUBLISHED articles, grouped by cluster in cluster order,
// each cluster's pillar first and then publish order. [] while nothing is published. The money
// page's "AEO and GEO guides for dealers" block renders this (build-seo-pages.mjs writes it to
// src/generated/aeo-geo-guides.js for React and the static mirror, and hands it to the twin).
export function publishedClusterGuides(siloKey, articles, state) {
  const rank = suggestedRank();
  const pillars = new Set(clusterPillars(siloKey, articles).map((a) => a.slug));
  return (SILOS[siloKey]?.clusters || [])
    .map(([key, label]) => ({
      key,
      label,
      links: articles
        .filter((a) => a.silo === siloKey && a.cluster === key && isPublished(state, a.slug))
        .sort((a, b) => Number(pillars.has(b.slug)) - Number(pillars.has(a.slug))
          || rank(a) - rank(b) || a.slug.localeCompare(b.slug))
        .map((a) => ({ href: articlePath(a), text: a.anchor, ...(pillars.has(a.slug) ? { pillar: true } : {}) })),
    }))
    .filter((group) => group.links.length);
}

// src/generated/aeo-geo-guides.js: the module React (AiSections.jsx) and the static mirror import.
// A plain ES module rather than JSON so Node (spa-fallback.mjs, tests) and Vite both import it
// without import attributes. Deterministic: same state, same bytes.
export const AEO_GEO_GUIDES_MODULE = 'src/generated/aeo-geo-guides.js';
export function aeoGeoGuidesModule(groups) {
  return `// GENERATED by scripts/build-seo-pages.mjs from scripts/seo/articles/publish-state.json. Do not edit.
// The PUBLISHED AEO and GEO articles, grouped by cluster (each cluster's pillar first), for the
// "AEO and GEO guides for dealers" block on /aeo-geo-for-car-dealers/ (React, static mirror and
// Markdown twin). Empty until an article is published, and the block is absent while it is empty.
export const AEO_GEO_GUIDES = ${JSON.stringify(groups, null, 2)};
`;
}

// The footer a silo's article pages render instead of the site-wide Marketplace footer, or null
// (every other silo keeps shell.mjs's default footer, byte for byte). Publish-aware: only
// PUBLISHED cluster pillars are listed, so the footer can never link a draft.
export function siloFooter(siloKey, articles, state) {
  const footer = SILOS[siloKey]?.footer;
  if (!footer) return null;
  const pillars = footer.pillars
    ? clusterPillars(siloKey, articles)
      .filter((a) => isPublished(state, a.slug))
      .map((a) => ({ label: a.crumb, href: articlePath(a) }))
    : [];
  const [first, ...rest] = footer.columns;
  return {
    line: footer.line,
    columns: [
      { heading: first.heading, links: [...(footer.hub ? [footer.hub] : []), ...first.links, ...pillars] },
      ...rest,
    ].map((column) => ({
      heading: column.heading,
      // `mail` links (the React support e-mail picker) are plain /contact/ links in static HTML,
      // like the money page's no-JS mirror: no raw address ever reaches the markup.
      links: column.links.map(({ label, href }) => ({ label, href })),
    })),
  };
}

// The silo publish number: the slug's 1-based position among its silo's slugs in
// SUGGESTED_ORDER. For aeoGeo it equals the content's own `publishOrder` (tests pin that), and
// it is what the admin shows as "#N". null for a slug outside SUGGESTED_ORDER (blog posts).
export function siloPublishNumber(article, articles) {
  if (!article || isBlog(article)) return null;
  const siloOf = new Map(articles.map((a) => [a.slug, a.silo]));
  const siloSlugs = SUGGESTED_ORDER.filter((slug) => siloOf.get(slug) === article.silo);
  const i = siloSlugs.indexOf(article.slug);
  return i >= 0 ? i + 1 : null;
}

// Build-time guard: an authored publishOrder must match SUGGESTED_ORDER, and a silo that
// numbers its articles numbers all of them 1..n. Returns a list of problems (empty = fine).
export function siloNumberingProblems(articles) {
  const problems = [];
  const numbered = new Set(articles.filter((a) => a.publishOrder !== undefined).map((a) => a.silo));
  for (const a of articles) {
    if (!numbered.has(a.silo)) continue;
    const expected = siloPublishNumber(a, articles);
    if (a.publishOrder !== expected) {
      problems.push(`${a.slug}: publishOrder ${a.publishOrder} but SUGGESTED_ORDER makes it #${expected}`);
    }
  }
  return problems;
}

// Order silos appear in the admin Content Publisher (newest line of business first). Every
// drip silo is listed; test/content-publisher.test.js pins it against SILOS.
export const ADMIN_SILO_ORDER = ['aeoGeo', 'compare', 'metaTools', 'marketplace', 'photos', 'growth'];

// ---- publish-aware in-body links -------------------------------------------------------
// `[anchor](@slug)` is the only way an article body links another drip article. It resolves
// to a real link once the target is published and to the bare anchor text while it is a
// draft (or unknown). Hand-written internal hrefs go through the same gate: a caller-supplied
// `isLinkablePath(path)` decides (build-seo-pages passes the site's real path set), and an
// href whose path is an article's URL always follows that article's publish state. The href
// charset matches shell.mjs `linkify`, so exactly the links that would render are gated.
// An ABSOLUTE link to this site (https://autolander.ai/... or https://www.autolander.ai/...) is
// an internal link too and goes through the same gate as its root-relative form; the link keeps
// its absolute href when it passes. Look-alike hosts (autolander.ai.example.com) are external.
export const SIBLING_TOKEN_RE = /\[([^\]]+)\]\(@([a-z0-9][a-z0-9-]{2,80})\)/g;
const SITE_ORIGIN_RE = /^https:\/\/(?:www\.)?autolander\.ai(?=[/?#]|$)/i;
const INTERNAL_MD_LINK_RE = /\[([^\]]+)\]\((\/[A-Za-z0-9\-/#?=&.]*|https:\/\/(?:www\.)?autolander\.ai(?:[/?#][^\s)]*)?)\)/gi;
export const hrefPath = (href) => String(href).replace(SITE_ORIGIN_RE, '').replace(/[?#].*$/, '') || '/';

export function resolveBodyLinks(value, { articles, state, isLinkablePath = null, onUnlinked = null }) {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const byPath = new Map(articles.map((a) => [articlePath(a), a]));
  const visit = (v) => {
    if (typeof v === 'string') {
      return v
        .replace(SIBLING_TOKEN_RE, (match, text, slug) => {
          const target = bySlug.get(slug);
          if (target && isPublished(state, target.slug)) return `[${text}](${articlePath(target)})`;
          onUnlinked?.({ kind: target ? 'draft-token' : 'unknown-token', target: slug, text });
          return text;
        })
        .replace(INTERNAL_MD_LINK_RE, (match, text, href) => {
          const path = hrefPath(href);
          const article = byPath.get(path);
          if (article) {
            if (isPublished(state, article.slug)) return match;
            onUnlinked?.({ kind: 'draft-href', target: href, text });
            return text;
          }
          if (!isLinkablePath || isLinkablePath(path)) return match;
          onUnlinked?.({ kind: 'unknown-href', target: href, text });
          return text;
        });
    }
    if (Array.isArray(v)) return v.map(visit);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, visit(x)]));
    return v;
  };
  return visit(value);
}

// The fields of a page object whose strings can carry markdown links. Returns a NEW page
// object; the content modules are never mutated.
export function gatePageLinks(page, options) {
  const out = { ...page };
  for (const field of ['tldr', 'sections', 'faq']) {
    if (page[field] !== undefined) out[field] = resolveBodyLinks(page[field], options);
  }
  return out;
}

const publishedDate = (article, state) => state?.[article.slug]?.publishedAt || '';
const newestPublishedBlogPosts = (articles, state) => articles
  .filter((article) => isBlog(article) && isPublished(state, article.slug))
  .sort((a, b) => publishedDate(b, state).localeCompare(publishedDate(a, state)) || a.slug.localeCompare(b.slug));

const articleOrder = (orderIndex) => (a, b) => {
  const aBlog = isBlog(a);
  const bBlog = isBlog(b);
  if (aBlog !== bBlog) return aBlog ? 1 : -1;
  if (aBlog) return String(b.meta?.updatedAt || '').localeCompare(String(a.meta?.updatedAt || '')) || a.slug.localeCompare(b.slug);
  return (orderIndex.get(a.slug) ?? 99) - (orderIndex.get(b.slug) ?? 99);
};

// ---- related links for one article: hub links + up to 4 PUBLISHED silo siblings
// (deterministic round-robin from SUGGESTED_ORDER so every build agrees), capped at 8.
export function relatedForArticle(content, articles, state) {
  const silo = SILOS[content.silo];
  const links = [...silo.related];
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  if (isBlog(content)) {
    for (const sibling of newestPublishedBlogPosts(articles, state)) {
      if (sibling.slug === content.slug) continue;
      links.push({ href: articlePath(sibling), text: sibling.anchor });
      if (links.length >= silo.related.length + 4) break;
    }
  } else {
    const order = SUGGESTED_ORDER.filter((slug) => slug !== content.slug);
    const start = Math.max(0, SUGGESTED_ORDER.indexOf(content.slug));
    const rotated = [...order.slice(start), ...order.slice(0, start)];
    // Clustered silos (aeoGeo) offer same-cluster siblings first, then the rest of the silo, in
    // the same rotation. An article without a cluster keeps the plain rotation, byte for byte.
    const ordered = content.cluster
      ? [
        ...rotated.filter((slug) => bySlug.get(slug)?.cluster === content.cluster),
        ...rotated.filter((slug) => bySlug.get(slug)?.cluster !== content.cluster),
      ]
      : rotated;
    let added = 0;
    for (const slug of ordered) {
      if (added >= 4) break;
      const sibling = bySlug.get(slug);
      if (!sibling || sibling.silo !== content.silo) continue;
      if (!isPublished(state, slug)) continue;
      links.push({ href: articlePath(sibling), text: sibling.anchor });
      added += 1;
    }
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
  let inboundAdded = 0;
  for (const post of newestPublishedBlogPosts(articles, state)) {
    if (inboundAdded >= 4) break;
    if (post.slug === content.slug || !(post.inboundFrom || []).includes(content.slug)) continue;
    const href = articlePath(post);
    if (seenHrefs.has(href)) continue;
    capped.push({ href, text: post.anchor });
    seenHrefs.add(href);
    inboundAdded += 1;
  }
  return capped;
}

export function blogInboundTargets(post, articles, state) {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  return [...new Set(post.inboundFrom || [])]
    .map((slug) => bySlug.get(slug))
    .filter((article) => article && article.slug !== post.slug && isPublished(state, article.slug));
}

// ---- full page object for shell.renderPage(). `datePublished` is the real publish
// date; a draft rendered in preview mode gets today so the preview looks final.
export function buildArticlePage(content, articles, state, { previewDate, onUnlinked } = {}) {
  const path = articlePath(content);
  const published = state?.[content.slug]?.publishedAt || null;
  const datePublished = published || previewDate || SITE.updated;
  const dateModified = isBlog(content)
    ? [datePublished, content.meta?.updatedAt].filter(Boolean).sort().at(-1)
    : datePublished;
  const silo = SILOS[content.silo];
  // Publish-aware body links: (@slug) tokens resolve, links to draft articles print as text.
  const body = gatePageLinks(
    { tldr: content.tldr, sections: content.sections, faq: content.faq },
    { articles, state, onUnlinked },
  );
  return {
    path,
    title: content.title,
    description: content.description,
    eyebrow: content.eyebrow || (isBlog(content) ? 'AutoLander blog' : silo.label),
    h1: content.h1,
    tldr: body.tldr,
    bylineUpdated: true,
    author: true,
    // Articles carry their OWN date everywhere a date is user- or crawler-visible:
    // byline, WebPage/Article dateModified, and the .md twin. Site-wide SITE.updated
    // stays for evergreen pages only.
    updated: dateModified,
    article: {
      datePublished,
      ...(isBlog(content) ? {
        type: 'BlogPosting',
        isPartOf: `${SITE.origin}/blog/#blog`,
      } : {}),
      ...(silo.about ? { about: silo.about } : {}),
    },
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      silo.crumb,
      { name: content.crumb, url: SITE.origin + path },
    ],
    sections: body.sections,
    faq: body.faq,
    faqHeading: content.faqHeading,
    // A silo CTA (aeoGeo: the free scan) supplies button/href/fine print; the article keeps
    // its own heading + sub. Other silos pass the article's cta through untouched.
    cta: silo.cta ? { ...silo.cta, ...content.cta } : content.cta,
    ...(silo.ogFallback ? { ogFallback: silo.ogFallback } : {}),
    // aeoGeo: the on-topic AEO & GEO footer (published pillars only). Other silos: no key, so
    // shell.mjs renders the site-wide footer exactly as before.
    ...(silo.footer ? { footer: siloFooter(content.silo, articles, state) } : {}),
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
    .sort(articleOrder(orderIndex));
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

// Articles whose page gains a link to `slug` when it is published: through alsoRelated, or
// through an in-body (@slug) token that turns from plain text into a link.
export function backlinkedFrom(slug, articles) {
  const token = `](@${slug})`;
  return articles
    .filter((a) => (a.alsoRelated || []).includes(slug)
      || (a.slug !== slug && collectText(a).some((text) => String(text).includes(token))))
    .map((a) => a.slug);
}

// ---- content-status.json payload — the /admin Content Publisher reads this.
export function contentStatusJson(articles, state) {
  const orderIndex = new Map(SUGGESTED_ORDER.map((s, i) => [s, i + 1]));
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    note: 'Avalanche article drip. status flips via scripts/publish-article.mjs (admin Content Publisher → publish-article workflow).',
    articles: articles
      .map((a) => {
        const blogRow = isBlog(a);
        try {
          if (blogRow && (typeof a.slug !== 'string' || !a.slug)) {
            throw new Error('blog content-status row has an invalid slug');
          }
          const row = {
            slug: a.slug,
            kind: blogRow ? 'blog' : 'drip',
            path: articlePath(a),
            url: articleUrl(a),
            title: a.title,
            h1: a.h1,
            silo: a.silo,
            siloLabel: SILOS[a.silo].label,
            primaryKeyword: a.primaryKeyword,
            secondaryKeywords: Array.isArray(a.secondaryKeywords) ? a.secondaryKeywords : [],
            description: a.description,
            suggestedOrder: orderIndex.get(a.slug) ?? null,
            status: state?.[a.slug]?.status || 'draft',
            publishedAt: state?.[a.slug]?.publishedAt || null,
          };
          if (!blogRow) {
            // Admin grouping (silo, then cluster) and the silo publish number (#1..#n) ride on
            // the row itself, so the Worker passes them through without a code change.
            return {
              ...row,
              siloOrder: ADMIN_SILO_ORDER.indexOf(a.silo),
              cluster: a.cluster || null,
              clusterLabel: clusterLabel(a.silo, a.cluster),
              clusterOrder: clusterIndex(a.silo, a.cluster),
              publishNumber: Number.isInteger(a.publishOrder) ? a.publishOrder : null,
            };
          }
          const text = collectText(a);
          const outboundLinks = new Set(text.flatMap((value) => [...value.matchAll(/\]\((\/[^)\s]*)\)/g)].map((match) => match[1])));
          return {
            ...row,
            requestId: BLOG_REQUEST_ID_RE.test(a.meta?.requestId || '') ? a.meta.requestId : null,
            updatedAt: a.meta?.updatedAt || null,
            validationOk: a.meta?.validation?.ok === true,
            validationErrors: (Array.isArray(a.meta?.validation?.errors) ? a.meta.validation.errors : []).slice(0, 20),
            wordCount: text.join(' ').split(/\s+/).filter(Boolean).length,
            outboundLinks: outboundLinks.size,
            inboundFrom: Array.isArray(a.inboundFrom) ? [...a.inboundFrom] : [],
            augmentKeys: Array.isArray(a.augmentKeys) ? [...a.augmentKeys] : [],
          };
        } catch (error) {
          if (!blogRow) throw error;
          console.warn(`Skipping malformed blog content-status row ${a?.slug || '(unknown)'}`);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'drip' ? -1 : 1;
        if (a.kind === 'drip') return (a.suggestedOrder ?? 99) - (b.suggestedOrder ?? 99);
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) || a.slug.localeCompare(b.slug);
      }),
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
      lastmod: isBlog(a) && a.meta?.updatedAt > state[a.slug].publishedAt
        ? a.meta.updatedAt
        : state[a.slug].publishedAt,
    }));
}
