// Builds the NEW SEO silo (category + feature pages + integration hub/spokes) as standalone
// static HTML in public/, and writes the UNIFIED public/sitemap.xml + public/robots.txt covering
// BOTH the existing /compare/ cluster + /guide/ AND the new silo (so sitemap is never clobbered
// regardless of which generator runs last).
//
// Why static (not React routes): AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)
// don't run JS, so SPA content is invisible to them. These pages put full content in the HTML source.
// Meta-safety: files in public/ are copied verbatim by Vite; the Meta Pixel is injected ONLY into the
// SPA index.html (vite.config.js). These pages carry NO pixel and never live on /thank-you — they
// cannot fire a conversion.
//
// Run AFTER build-compare-pages.mjs (or alone — both now emit the full sitemap):
//   node scripts/build-compare-pages.mjs && node scripts/build-seo-pages.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderPage, SEO_STYLES, SITE } from './seo/shell.mjs';
import { NAV, INTEGRATIONS, integrationPath, integrationUrl } from './seo/registry.mjs';
import { COMPETITORS, GUIDE } from './compare-data.mjs';

import { PAGES as CATEGORY } from './seo/data-category.mjs';
import { PAGES as PRICING } from './seo/data-pricing.mjs';
import { PAGES as INVENTORY } from './seo/data-inventory.mjs';
import { PAGES as BULK } from './seo/data-bulk.mjs';
import { PAGES as SAFETY } from './seo/data-safety.mjs';
import { PAGES as INTEG } from './seo/data-integrations.mjs';
import { PAGES as LISTINGSW } from './seo/data-listing-software.mjs';
import { PAGES as FBLISTING } from './seo/data-facebook-listing.mjs';
import { PAGES as DEALERS } from './seo/data-dealers.mjs';
import { PAGES as AITOOLS } from './seo/data-ai-tools.mjs';
import { PAGES as AUTOMATION } from './seo/data-automation.mjs';
import { PAGES as ASSISTANT } from './seo/data-assistant.mjs';
import { PAGES as AUTOPOSTER } from './seo/data-autoposter.mjs';
import { PAGES as GROWTH } from './seo/data-growth.mjs';
import { PAGES as GROWTHMONEY } from './seo/data-growth-money.mjs';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const ALL = [...CATEGORY, ...PRICING, ...INVENTORY, ...BULK, ...SAFETY, ...INTEG, ...LISTINGSW, ...FBLISTING, ...DEALERS, ...AITOOLS, ...AUTOMATION, ...ASSISTANT, ...AUTOPOSTER, ...GROWTH, ...GROWTHMONEY];

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
  console.log('wrote', path.replace(PUBLIC_DIR, 'public'));
}

const pathToFile = (urlPath) => resolve(PUBLIC_DIR, urlPath.replace(/^\/|\/$/g, ''), 'index.html');

// ---------- render pages ----------
write(resolve(PUBLIC_DIR, 'seo', 'styles.css'), SEO_STYLES);

const renderedPaths = new Set();
for (const page of ALL) {
  const nav = page.key ? NAV[page.key] : null;
  const urlPath = page.path || (nav && nav.path);
  if (!urlPath) { console.warn('!! page missing path/key:', page.title); continue; }
  write(pathToFile(urlPath), renderPage(page));
  renderedPaths.add(urlPath);
}

// ---------- completeness check (warns if a registry page wasn't produced) ----------
const expected = [
  NAV.category.path, NAV.integHub.path, NAV.inventory.path, NAV.bulk.path, NAV.safety.path, NAV.pricing.path,
  NAV.listingSw.path, NAV.fbListing.path, NAV.dealers.path,
  NAV.aiTools.path, NAV.automation.path, NAV.assistant.path, NAV.autoposter.path,
  NAV.mktgHub.path, NAV.mktgIdeas.path, NAV.salesLeads.path, NAV.socialMedia.path,
  NAV.sellMore.path, NAV.aiDealers.path, NAV.aiChat.path, NAV.photoEditor.path, NAV.rvDealers.path,
  ...INTEGRATIONS.map((s) => integrationPath(s.slug)),
];
const missing = expected.filter((p) => !renderedPaths.has(p));
if (missing.length) console.warn(`\n!! MISSING ${missing.length} expected page(s):\n   ${missing.join('\n   ')}`);

// ---------- unified robots.txt ----------
function robotsTxt() {
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai',
    'Claude-Web', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot',
    'Applebot-Extended', 'Bingbot', 'cohere-ai', 'Amazonbot', 'meta-externalagent'];
  const blocks = aiBots.map((ua) => `User-agent: ${ua}\nAllow: /`).join('\n\n');
  return `# AutoLander robots.txt
# All crawlers are welcome, including AI search & answer engines.
User-agent: *
Allow: /

${blocks}

Sitemap: ${SITE.origin}/sitemap.xml
`;
}

// ---------- unified sitemap.xml (compare cluster + guide + new silo) ----------
function sitemapXml() {
  const competitorSlugs = Object.values(COMPETITORS).map((c) => c.slug);
  const urls = [
    { loc: SITE.origin + '/', pri: '1.0', freq: 'weekly' },
    { loc: SITE.origin + '/terms.html', pri: '0.3', freq: 'yearly' },
    { loc: SITE.origin + '/privacy.html', pri: '0.3', freq: 'yearly' },
    { loc: SITE.origin + NAV.category.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.listingSw.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + '/compare/', pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.integHub.path, pri: '0.8', freq: 'monthly' },
    { loc: `${SITE.origin}/${GUIDE.path}/`, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.sellGuide.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.inventory.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.bulk.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.safety.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.pricing.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.dealers.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.fbListing.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.aiTools.path, pri: '0.8', freq: 'weekly' },
    { loc: SITE.origin + NAV.automation.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.assistant.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.autoposter.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.mktgHub.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.mktgIdeas.path, pri: '0.8', freq: 'weekly' },
    { loc: SITE.origin + NAV.salesLeads.path, pri: '0.8', freq: 'weekly' },
    { loc: SITE.origin + NAV.socialMedia.path, pri: '0.7', freq: 'monthly' },
    { loc: SITE.origin + NAV.sellMore.path, pri: '0.8', freq: 'monthly' },
    { loc: SITE.origin + NAV.aiDealers.path, pri: '0.8', freq: 'weekly' },
    { loc: SITE.origin + NAV.aiChat.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.photoEditor.path, pri: '0.9', freq: 'weekly' },
    { loc: SITE.origin + NAV.rvDealers.path, pri: '0.8', freq: 'weekly' },
    ...competitorSlugs.map((s) => ({ loc: `${SITE.origin}/compare/${s}/`, pri: '0.7', freq: 'monthly' })),
    ...INTEGRATIONS.map((s) => ({ loc: integrationUrl(s.slug), pri: '0.7', freq: 'monthly' })),
  ];
  const body = urls.map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

write(resolve(PUBLIC_DIR, 'robots.txt'), robotsTxt());
write(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemapXml());

console.log(`\nDone. ${renderedPaths.size} new SEO pages + unified sitemap.xml + robots.txt.`);
if (missing.length) {
  console.log(`(sitemap lists all URLs; ${missing.length} page file(s) still pending content.)`);
}
