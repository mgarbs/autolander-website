import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { AI_VISIBILITY_PATH, FOOTER_NAV } from '../shared/ai-visibility-content.js';
import { renderAiVisibilityMirror } from '../src/ai/static-mirror.js';

const read = (file) => readFileSync(file, 'utf8');

// Michael, 2026-09-30: the AEO and GEO page's footer stays on topic (AEO and GEO links plus a short
// path back to AutoLander) instead of the site-wide Marketplace product footer.
test('the AEO and GEO page footer is on topic and shared by React and the no-JS page', () => {
  assert.deepEqual(FOOTER_NAV.map((column) => column.heading), ['AEO & GEO', 'AutoLander', 'Company']);
  const aeo = FOOTER_NAV[0].links.map((link) => link.href);
  for (const hash of ['#scan-form', '#what-is-aeo-geo', '#plans', '#faq']) {
    assert.ok(aeo.includes(`${AI_VISIBILITY_PATH}${hash}`), hash);
  }
  const all = FOOTER_NAV.flatMap((column) => column.links);
  assert.ok(all.length <= 14, 'short, focused footer');
  for (const productPath of ['/facebook-marketplace-auto-poster/', '/bulk-post-cars-to-facebook-marketplace/', '/integrations/', '/compare/']) {
    assert.ok(!all.some((link) => link.href === productPath), `no ${productPath}`);
  }

  const app = read('src/ai/AiVisibilityApp.jsx');
  assert.match(app, /<SiteFooter extraLine=\{FOOTER\.line\} mobileCtaPadding columns=\{FOOTER_NAV\} \/>/);

  const mirror = renderAiVisibilityMirror();
  for (const link of all) assert.ok(mirror.includes(`href="${link.href}"`), link.label);
  assert.doesNotMatch(mirror, /href="\/bulk-post-cars-to-facebook-marketplace\/"/);
});

test('every other page keeps the site-wide footer columns', () => {
  const footer = read('src/components/SiteFooter.jsx');
  assert.match(footer, /columns \? <PageColumns columns=\{columns\} \/> : \(<>/);
  for (const label of ['Product', 'Integrations', 'Compare', 'Company']) assert.match(footer, new RegExp(`aria-label="${label}"`));
});

// ---- the static AEO and GEO ARTICLE pages (scripts/seo/shell.mjs), 2026-09-30 ----------------------
// Published /aeo-geo/<slug>/ articles get the same on-topic footer as the money page: an AEO & GEO column
// (the money page, its anchors and the PUBLISHED cluster pillars), a short AutoLander column and Company.
// Every other static page keeps the site-wide footer, byte for byte.
test('published AEO and GEO articles render the on-topic footer; drafts never appear in it; other pages are unchanged', async () => {
  const { renderPage, siteFooter } = await import('../scripts/seo/shell.mjs');
  const {
    buildArticlePage, articlePath, clusterPillars, loadPublishState, siloFooter,
  } = await import('../scripts/seo/articles/article-system.mjs');
  const { DRIP_ARTICLES } = await import('../scripts/seo/articles/drip-articles.mjs');
  const aeo = DRIP_ARTICLES.filter((a) => a.silo === 'aeoGeo').sort((a, b) => a.publishOrder - b.publishOrder);
  const pillars = clusterPillars('aeoGeo', DRIP_ARTICLES);
  // Publish pillar #1, pillar #3 and spoke #10; pillar #2 and the rest stay drafts.
  const published = [aeo[0], aeo[2], aeo[9]];
  const state = structuredClone(loadPublishState());
  for (const a of aeo) state[a.slug] = { status: 'draft', publishedAt: null };
  for (const a of published) state[a.slug] = { status: 'published', publishedAt: '2026-10-01' };

  const page = buildArticlePage(aeo[9], DRIP_ARTICLES, state);
  const html = renderPage(page);
  const footer = html.slice(html.indexOf('<footer class="foot">'), html.indexOf('</footer>') + '</footer>'.length);
  assert.ok(footer, 'the article has a footer');
  const columns = [...footer.matchAll(/<nav class="foot-col" aria-label="([^"]+)">([\s\S]*?)<\/nav>/g)]
    .map(([, heading, body]) => ({ heading: heading.replaceAll('&amp;', '&'), hrefs: [...body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]) }));
  assert.deepEqual(columns.map((c) => c.heading), FOOTER_NAV.map((c) => c.heading));

  // AEO & GEO: the money page, then its FOOTER_NAV anchors (#scan-form, #plans, #faq ...), then published pillars.
  const publishedPillars = pillars.filter((p) => published.includes(p)).map((p) => articlePath(p));
  assert.deepEqual(publishedPillars, [articlePath(aeo[0]), articlePath(aeo[2])]);
  assert.deepEqual(columns[0].hrefs, [AI_VISIBILITY_PATH, ...FOOTER_NAV[0].links.map((l) => l.href), ...publishedPillars]);
  for (const hash of ['#scan-form', '#plans', '#faq']) assert.ok(columns[0].hrefs.includes(`${AI_VISIBILITY_PATH}${hash}`), hash);
  // The other two columns mirror the money page's FOOTER_NAV exactly.
  assert.deepEqual(columns[1].hrefs, FOOTER_NAV[1].links.map((l) => l.href));
  assert.deepEqual(columns[2].hrefs, FOOTER_NAV[2].links.map((l) => l.href));

  // Publish-aware: no draft (pillar or not) is linked from the footer.
  for (const a of aeo.filter((x) => !published.includes(x))) assert.ok(!footer.includes(articlePath(a)), `draft ${a.slug} in the footer`);
  // On topic: no Marketplace product footer, the AEO footer line, and no raw e-mail address.
  assert.ok(!footer.includes('href="/bulk-post-cars-to-facebook-marketplace/"'));
  assert.ok(!footer.includes('<nav class="foot-links">'));
  assert.ok(footer.includes('AI Visibility, the AEO and GEO service for car dealers, comes from AutoLander LLC'));
  assert.doesNotMatch(footer, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  assert.doesNotMatch(footer, /mailto:/);
  assert.equal(siloFooter('aeoGeo', DRIP_ARTICLES, state).columns.length, 3);

  // Every other silo (and every evergreen page) keeps the site-wide footer, byte for byte.
  const mkt = DRIP_ARTICLES.find((a) => a.silo === 'marketplace');
  const mktState = { ...state, [mkt.slug]: { status: 'published', publishedAt: '2026-10-01' } };
  const mktPage = buildArticlePage(mkt, DRIP_ARTICLES, mktState);
  assert.equal(mktPage.footer, undefined);
  assert.equal(siloFooter('marketplace', DRIP_ARTICLES, mktState), null);
  assert.ok(renderPage(mktPage).includes(siteFooter()), 'the Marketplace article keeps the site-wide footer');
  assert.equal(siteFooter(null), siteFooter());
  assert.ok(siteFooter().includes('<nav class="foot-links">'));
});

test('the column footer has its styles in the SEO stylesheet, and the committed stylesheet is current', async () => {
  const { SEO_STYLES } = await import('../scripts/seo/shell.mjs');
  for (const selector of ['.foot-cols', '.foot-col', '.foot-h']) assert.ok(SEO_STYLES.includes(selector), selector);
  assert.equal(read('public/seo/styles.css'), SEO_STYLES, 'run node scripts/build-seo-pages.mjs');
});
