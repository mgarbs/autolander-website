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

import { renderPage, renderMarkdown, SEO_STYLES, SITE } from './seo/shell.mjs';
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
import { PAGES as REPORT } from './seo/data-report.mjs';
import { PAGES as ABOUT } from './seo/data-about.mjs';
import { PAGES as CONTACT } from './seo/data-contact.mjs';
import { HOME } from './seo/data-home.mjs';
import { whenToUseSection, agentsMarkdown } from './seo/agent-instructions.mjs';

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const ALL = [...CATEGORY, ...PRICING, ...INVENTORY, ...BULK, ...SAFETY, ...INTEG, ...LISTINGSW, ...FBLISTING, ...DEALERS, ...AITOOLS, ...AUTOMATION, ...ASSISTANT, ...AUTOPOSTER, ...GROWTH, ...GROWTHMONEY, ...REPORT, ...ABOUT, ...CONTACT];

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

// ---------- machine-readable copies of the report data ----------
// Derived from the report page's OWN table sections, so the CSV/JSON can never drift from the
// published figures. These files back the Dataset node's DataDownload distributions — if you
// rename a table id here, update `dataset.distribution` in data-report.mjs too.
function buildReportData() {
  const page = REPORT[0];
  const tables = (page.sections || []).filter((s) => s.type === 'table');
  if (!tables.length) { console.warn('!! report page has no table sections — skipping data export'); return; }

  const meta = {
    name: page.dataset?.name || page.h1,
    url: SITE.origin + NAV.report2026.path,
    publisher: 'AutoLander LLC',
    author: 'Michael Garber',
    datePublished: page.dataset?.datePublished || SITE.updated,
    dateModified: SITE.updated,
    temporalCoverage: page.dataset?.temporalCoverage,
    spatialCoverage: 'United States',
    license: page.dataset?.license,
    measurementTechnique: page.dataset?.measurementTechnique,
    sample: page.dataset?.size,
    citation: 'AutoLander, "The Facebook Marketplace Used-Car Report 2026," autolander.ai, August 2026.',
  };

  // ---- JSON: nested, one object per table, rows keyed by column header ----
  const json = {
    ...meta,
    tables: tables.map((t) => ({
      id: t.id,
      title: t.h2,
      caption: t.caption,
      note: t.note,
      columns: t.head,
      rows: t.rows.map((r) => Object.fromEntries(r.map((cell, i) => [t.head[i], cell]))),
    })),
  };
  write(resolve(PUBLIC_DIR, 'data', 'marketplace-report-2026.json'), JSON.stringify(json, null, 2) + '\n');

  // ---- CSV: long format so every table shares one schema regardless of column count ----
  const q = (v) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = ['table_id,table_title,row,field,value'];
  for (const t of tables) {
    for (const r of t.rows) {
      for (let i = 1; i < r.length; i += 1) {
        lines.push([t.id, t.h2, r[0], t.head[i], r[i]].map(q).join(','));
      }
    }
  }
  lines.push('');
  lines.push(`# Source: ${meta.url}`);
  lines.push(`# Cite as: ${meta.citation}`);
  lines.push(`# Licence: ${meta.license}`);
  write(resolve(PUBLIC_DIR, 'data', 'marketplace-report-2026.csv'), lines.join('\n') + '\n');
}
buildReportData();

// ---------- Markdown twins + llms.txt ----------
// Answer engines parse Markdown far more reliably than HTML. Every silo page gets a .md twin at
// <path>.md, and /llms.txt is the curated index that points at them. Both are generated from the
// same page objects that produce the HTML, so they cannot drift out of sync with the site.
const mdPathFor = (urlPath) => (urlPath === '/' ? '/index' : urlPath.replace(/\/$/, '')) + '.md';

function buildMarkdownTwins() {
  const twins = [];
  for (const page of ALL) {
    const nav = page.key ? NAV[page.key] : null;
    const urlPath = page.path || (nav && nav.path);
    if (!urlPath) continue;
    const rel = mdPathFor(urlPath);
    write(resolve(PUBLIC_DIR, rel.replace(/^\//, '')), renderMarkdown(page));
    twins.push({ urlPath, md: rel, title: page.h1 || page.title, description: page.description });
  }
  return twins;
}

// The homepage is a React SPA, so `/` has no crawlable body and no page object in ALL (adding one
// would overwrite index.html with a static page — i.e. delete the site). It still needs a Markdown
// representation: the Worker serves this file when a client requests `/` with
// `Accept: text/markdown`, and llms.txt links it like any other twin.
function buildHomeTwin() {
  write(resolve(PUBLIC_DIR, 'index.md'), renderMarkdown(HOME));
  return { urlPath: '/', md: '/index.md', title: HOME.h1, description: HOME.description };
}

// Dedicated agent-instructions file. llms.txt carries the same guidance inline; this is the
// standalone document to link when something asks for "your agent instructions".
function buildAgentsMd() {
  write(resolve(PUBLIC_DIR, 'agents.md'), agentsMarkdown(SITE.updatedHuman || SITE.updated));
}

function buildLlmsTxt(twins) {
  const byPath = new Map(twins.map((t) => [t.urlPath, t]));
  const entry = (urlPath, overrideTitle) => {
    const t = byPath.get(urlPath);
    if (!t) return null;
    const title = overrideTitle || t.title;
    return `- [${title}](${SITE.origin}${t.md}): ${t.description}`;
  };
  const group = (heading, paths) => {
    const rows = paths.map((p) => entry(p)).filter(Boolean);
    return rows.length ? `## ${heading}\n\n${rows.join('\n')}\n` : '';
  };

  const header = `# AutoLander

> Facebook Marketplace software for U.S. car dealerships. Dealers connect an inventory feed and
> AutoLander posts vehicles to Facebook Marketplace, keeps asking prices in step with the feed,
> removes sold units, and runs AI photo editing on listing images. Built by AutoLander LLC.
> Plans from $${SITE.lowPrice}/mo.

AutoLander publishes original first-party research on the dealer side of Facebook Marketplace,
computed directly from anonymized aggregate platform data — never surveys or estimates. Datasets
are released under CC BY 4.0 with attribution.

Every link below points at a Markdown copy of the page; drop the .md for the HTML version.
Contact: sales@autolander.ai · (919) 280-0967
`;

  const body = [
    // 'When to use' comes first: an agent that reads only the top of the file should still learn
    // what jobs we are the right answer for before it sees a single link.
    whenToUseSection(),
    group('Start here', ['/']),
    group('Original research', [NAV.report2026.path]),
    `## Data

- [Marketplace Report 2026 — full dataset (CSV)](${SITE.origin}/data/marketplace-report-2026.csv): All four report tables in long format, CC BY 4.0.
- [Marketplace Report 2026 — full dataset (JSON)](${SITE.origin}/data/marketplace-report-2026.json): The same figures with methodology, sample sizes and units attached.
`,
    group('About the publisher', [NAV.about.path, NAV.contact.path]),
    group('Product', [
      NAV.category.path, NAV.listingSw.path, NAV.dealers.path, NAV.inventory.path,
      NAV.bulk.path, NAV.automation.path, NAV.safety.path, NAV.pricing.path,
      NAV.aiChat.path, NAV.photoEditor.path, NAV.rvDealers.path,
    ]),
    group('Guides', [
      NAV.mktgHub.path, NAV.mktgIdeas.path, NAV.salesLeads.path, NAV.socialMedia.path,
      NAV.sellMore.path, NAV.aiDealers.path, NAV.aiTools.path,
    ]),
    group('Integrations', [NAV.integHub.path, ...INTEGRATIONS.map((s) => integrationPath(s.slug))]),
    // The /compare/ cluster and the two long-form guides come from build-compare-pages.mjs and are
    // hand-authored HTML, so they have no Markdown twin — linked here as HTML so the index is
    // still complete. Give them .md twins if that generator ever moves onto page objects.
    `## Comparisons

- [Best Facebook Marketplace auto-posting tools for car dealers (2026)](${SITE.origin}/compare/): Buyer's guide comparing every major Facebook Marketplace posting tool for dealers on workflow, session architecture, AI photo/video and price.
${Object.values(COMPETITORS).map((c) => `- [AutoLander vs ${c.name}](${SITE.origin}/compare/${c.slug}/): Head-to-head comparison. ${c.name}: ${c.oneLiner}`).join('\n')}
`,
    `## Buyer guides

- [Facebook Marketplace automation: the honest version](${SITE.origin}/guide/facebook-marketplace-automation/): What Meta's terms actually say about automating Marketplace, the four architectures people use, and the account risks each carries.
- [How to sell cars on Facebook Marketplace](${SITE.origin}/guide/how-to-sell-cars-on-facebook-marketplace/): Step-by-step guide to listing, pricing, photographing and closing a vehicle sale on Facebook Marketplace.
`,
  ].filter(Boolean).join('\n');

  write(resolve(PUBLIC_DIR, 'llms.txt'), `${header}\n${body}`);

  // llms-full.txt: every page's Markdown concatenated, for a model that wants the whole corpus
  // in one fetch rather than crawling 45 URLs.
  const full = ALL.map((page) => renderMarkdown(page)).join('\n\n---\n\n');
  write(resolve(PUBLIC_DIR, 'llms-full.txt'), `${header}\n\n---\n\n${full}`);
}

buildAgentsMd();
buildLlmsTxt([buildHomeTwin(), ...buildMarkdownTwins()]);

// ---------- completeness check (warns if a registry page wasn't produced) ----------
const expected = [
  NAV.category.path, NAV.integHub.path, NAV.inventory.path, NAV.bulk.path, NAV.safety.path, NAV.pricing.path,
  NAV.listingSw.path, NAV.fbListing.path, NAV.dealers.path,
  NAV.aiTools.path, NAV.automation.path, NAV.assistant.path, NAV.autoposter.path,
  NAV.mktgHub.path, NAV.mktgIdeas.path, NAV.salesLeads.path, NAV.socialMedia.path,
  NAV.sellMore.path, NAV.aiDealers.path, NAV.aiChat.path, NAV.photoEditor.path, NAV.rvDealers.path, NAV.report2026.path,
  NAV.about.path, NAV.contact.path,
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
    { loc: SITE.origin + NAV.report2026.path, pri: '0.9', freq: 'monthly' },
    { loc: SITE.origin + NAV.about.path, pri: '0.6', freq: 'monthly' },
    { loc: SITE.origin + NAV.contact.path, pri: '0.6', freq: 'monthly' },
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
