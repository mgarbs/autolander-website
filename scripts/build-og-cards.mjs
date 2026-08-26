// Per-page Open Graph cards.
//
// WHY: every page on the site shared one /og-image.jpg. A card that names the actual page is worth
// more everywhere a link gets rendered —social previews, Slack unfurls, and the link cards answer
// engines show beside a citation.
//
// HOW: Playwright (already a dev dependency) renders a branded HTML template at 1200x630 and
// screenshots it. Text is laid out by a real browser with the real webfont, so nothing is guessed
// about metrics or wrapping.
//
// OUTPUT: public/og/<slug>.png plus public/og/manifest.json. shell.mjs reads the manifest and
// points og:image at a real card when one exists, falling back to /og-image.jpg when it doesn't —
// so this script is optional and the site never references a card that isn't there.
//
//   node scripts/build-og-cards.mjs          # all pages
//   node scripts/build-og-cards.mjs --only=/about/,/facebook-marketplace-auto-poster/

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { SITE } from './seo/shell.mjs';
import { NAV, INTEGRATIONS, integrationPath } from './seo/registry.mjs';
import { COMPETITORS } from './compare-data.mjs';

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
import { articlePath } from './seo/articles/article-system.mjs';
import { ARTICLES as ART_MKT_A } from './seo/articles/data-articles-marketplace-a.mjs';
import { ARTICLES as ART_MKT_B } from './seo/articles/data-articles-marketplace-b.mjs';
import { ARTICLES as ART_PHOTOS } from './seo/articles/data-articles-photos.mjs';
import { ARTICLES as ART_GROWTH } from './seo/articles/data-articles-growth.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const OG_DIR = resolve(PUBLIC_DIR, 'og');

const SILO = [...CATEGORY, ...PRICING, ...INVENTORY, ...BULK, ...SAFETY, ...INTEG, ...LISTINGSW,
  ...FBLISTING, ...DEALERS, ...AITOOLS, ...AUTOMATION, ...ASSISTANT, ...AUTOPOSTER, ...GROWTH,
  ...GROWTHMONEY, ...REPORT, ...ABOUT];

// slugFor mirrors shell.mjs — keep the two in step or a card lands under a name nothing looks up.
export const slugFor = (urlPath) =>
  (urlPath === '/' ? 'home' : urlPath.replace(/^\/|\/$/g, '').replaceAll('/', '-'));

// ---------- the pages that get a card ----------
function collectTargets() {
  const targets = [
    { path: '/', eyebrow: 'Facebook Marketplace software for car dealers', title: 'Post your whole lot to Facebook Marketplace' },
  ];

  for (const page of SILO) {
    const nav = page.key ? NAV[page.key] : null;
    const urlPath = page.path || (nav && nav.path);
    if (!urlPath) continue;
    targets.push({ path: urlPath, eyebrow: page.eyebrow || 'AutoLander', title: page.h1 || page.title });
  }

  targets.push({ path: '/compare/', eyebrow: 'Buyer’s guide', title: 'Best Facebook Marketplace auto-posting tools for car dealers' });
  for (const c of Object.values(COMPETITORS)) {
    targets.push({ path: `/compare/${c.slug}/`, eyebrow: 'Head-to-head', title: `AutoLander vs ${c.name}` });
  }
  targets.push({ path: '/guide/facebook-marketplace-automation/', eyebrow: 'Guide', title: 'Facebook Marketplace automation: the honest version' });
  targets.push({ path: '/guide/how-to-sell-cars-on-facebook-marketplace/', eyebrow: 'Guide', title: 'How to sell cars on Facebook Marketplace' });

  // Avalanche articles — cards are pre-rendered for ALL 30 (drafts included) so a later
  // publish never needs Playwright; an unreferenced card in public/og/ is harmless.
  for (const a of [...ART_MKT_A, ...ART_MKT_B, ...ART_PHOTOS, ...ART_GROWTH]) {
    targets.push({ path: articlePath(a.slug), eyebrow: a.eyebrow || 'Dealer guide', title: a.h1 || a.title });
  }

  // Registry sanity: an integration spoke with no card is a silent gap, so name it.
  for (const s of INTEGRATIONS) {
    const p = integrationPath(s.slug);
    if (!targets.some((t) => t.path === p)) console.warn('!! no card target for integration spoke', p);
  }
  return targets;
}

// ---------- card template ----------
// Deliberately not the homepage hero: an OG card is read at thumbnail size in a feed, so it is
// type and contrast only. Long titles step down a size rather than wrapping into six lines.
const FONT = existsSync(resolve(PUBLIC_DIR, 'fonts', 'inter-latin-var.woff2'))
  ? readFileSync(resolve(PUBLIC_DIR, 'fonts', 'inter-latin-var.woff2')).toString('base64')
  : null;

const LOGO = existsSync(resolve(PUBLIC_DIR, 'autolander-logo.png'))
  ? readFileSync(resolve(PUBLIC_DIR, 'autolander-logo.png')).toString('base64')
  : null;

const escapeHtml = (s) => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function cardHtml({ eyebrow, title }) {
  const len = title.length;
  const size = len > 74 ? 52 : len > 52 ? 62 : len > 34 ? 74 : 86;
  return `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  ${FONT ? `@font-face{font-family:'Inter';src:url(data:font/woff2;base64,${FONT}) format('woff2');font-weight:100 900;font-display:block}` : ''}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{
    background:#050505;
    background-image:
      radial-gradient(1100px 520px at 82% -12%, rgba(59,130,246,.30), transparent 62%),
      radial-gradient(760px 420px at 4% 108%, rgba(59,130,246,.13), transparent 60%);
    color:#fff;
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
    display:flex;flex-direction:column;justify-content:space-between;
    padding:64px 72px;
    position:relative;overflow:hidden;
  }
  .rule{position:absolute;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#3b82f6,#60a5fa 42%,rgba(96,165,250,0))}
  .eyebrow{font-size:23px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7dabf8}
  h1{font-size:${size}px;line-height:1.08;font-weight:800;letter-spacing:-.028em;max-width:19ch;text-wrap:balance}
  .foot{display:flex;align-items:center;justify-content:space-between;gap:32px}
  .brand{display:flex;align-items:center;gap:18px}
  .brand img{height:52px;width:auto;display:block}
  .brand .wordmark{font-size:34px;font-weight:800;letter-spacing:-.02em}
  .domain{font-size:25px;font-weight:600;color:#9fb6d4;letter-spacing:.01em}
</style></head>
<body>
  <div class="rule"></div>
  <div class="eyebrow">${escapeHtml(eyebrow)}</div>
  <h1>${escapeHtml(title)}</h1>
  <div class="foot">
    <div class="brand">
      ${LOGO ? `<img src="data:image/png;base64,${LOGO}" alt="" />` : '<span class="wordmark">AutoLander</span>'}
    </div>
    <div class="domain">autolander.ai</div>
  </div>
</body></html>`;
}

// ---------- render ----------
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => s.trim())) : null;

const all = collectTargets();
const targets = only ? all.filter((t) => only.has(t.path)) : all;
if (!targets.length) { console.error('No matching card targets.'); process.exit(1); }

mkdirSync(OG_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const manifest = existsSync(resolve(OG_DIR, 'manifest.json'))
  ? JSON.parse(readFileSync(resolve(OG_DIR, 'manifest.json'), 'utf8'))
  : {};

for (const t of targets) {
  const slug = slugFor(t.path);
  await page.setContent(cardHtml(t), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync(resolve(OG_DIR, `${slug}.png`), buf);
  manifest[t.path] = `/og/${slug}.png`;
  console.log('card', t.path, '->', `public/og/${slug}.png`);
}

await browser.close();

writeFileSync(resolve(OG_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nDone. ${targets.length} card(s); manifest lists ${Object.keys(manifest).length}.`);
console.log('Re-run `node scripts/build-compare-pages.mjs && node scripts/build-seo-pages.mjs` so pages pick up the new og:image.');
console.log(`Origin for absolute URLs: ${SITE.origin}`);
