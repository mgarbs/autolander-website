// Money page down-links (hub to spokes, 2026-09-30): the AEO and GEO page lists every PUBLISHED AEO and GEO
// article, grouped by cluster with each cluster's pillar first, in its React section, its no-JS static mirror
// and its Markdown twin. The list is generated at build time from the publish state
// (scripts/build-seo-pages.mjs -> src/generated/aeo-geo-guides.js), so the page stays deterministic for
// prerender and hydration, drafts never appear, and the block is absent while nothing is published.
// test/dead-links.test.js covers the same list on real sandbox builds of simulated publish states.
import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pid } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  AEO_GEO_GUIDES_MODULE, SILOS, articlePath, clusterPillars, loadPublishState, publishedClusterGuides,
  aeoGeoGuidesModule, latestSiloUpdate,
} from '../scripts/seo/articles/article-system.mjs';
import { DRIP_ARTICLES } from '../scripts/seo/articles/drip-articles.mjs';
import { loadBlogPosts } from '../scripts/seo/articles/blog-loader.mjs';
import { NAV } from '../scripts/seo/registry.mjs';
import { changedUrlsFor } from '../scripts/publish-article.mjs';
import { renderAiVisibilityMarkdown } from '../scripts/seo/data-ai-visibility.mjs';
import { renderAiVisibilityMirror, renderAiVisibilityMirrorRest } from '../src/ai/static-mirror.js';
import { AEO_GEO_GUIDES } from '../src/generated/aeo-geo-guides.js';
import { GUIDES, RELATED, FINAL_CTA } from '../shared/ai-visibility-content.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const ALL = [...DRIP_ARTICLES, ...loadBlogPosts()];
const AEO = DRIP_ARTICLES.filter((a) => a.silo === 'aeoGeo').sort((a, b) => a.publishOrder - b.publishOrder);
const MONEY_URL = `https://autolander.ai${NAV.aiVisibility.path}`;

const stateWith = (slugs) => {
  const state = structuredClone(loadPublishState());
  for (const a of AEO) state[a.slug] = { status: 'draft', publishedAt: null };
  for (const slug of slugs) state[slug] = { status: 'published', publishedAt: '2026-10-01' };
  return state;
};
// A spread of published articles: #1 and #10 (both "website"), #2 (engines), #12 and a late spoke.
const PICK = [AEO[0], AEO[9], AEO[1], AEO[11], AEO[40]];
const SAMPLE_STATE = stateWith(PICK.map((a) => a.slug));
const SAMPLE = publishedClusterGuides('aeoGeo', ALL, SAMPLE_STATE);

// ---- the list ----------------------------------------------------------------------------------

test('cluster pillars are the first article of each cluster, in cluster order (#1 to #9)', () => {
  const pillars = clusterPillars('aeoGeo', ALL);
  assert.deepEqual(pillars.map((a) => a.cluster), SILOS.aeoGeo.clusters.map(([key]) => key));
  assert.deepEqual(pillars.map((a) => a.publishOrder), SILOS.aeoGeo.clusters.map((_, i) => i + 1));
  assert.deepEqual(clusterPillars('marketplace', ALL), [], 'a silo without clusters has no pillars');
});

test('publishedClusterGuides: published only, grouped by cluster in cluster order, pillar first, then publish order', () => {
  assert.deepEqual(publishedClusterGuides('aeoGeo', ALL, stateWith([])), [], 'nothing published: no groups');
  const order = SILOS.aeoGeo.clusters.map(([key]) => key);
  assert.deepEqual(SAMPLE.map((g) => g.key), [...new Set(PICK.map((a) => a.cluster))].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  for (const group of SAMPLE) {
    assert.equal(group.label, SILOS.aeoGeo.clusters.find(([key]) => key === group.key)[1]);
    const members = PICK.filter((a) => a.cluster === group.key).sort((a, b) => a.publishOrder - b.publishOrder);
    assert.deepEqual(group.links.map((l) => l.href), members.map((a) => articlePath(a)));
    assert.deepEqual(group.links.map((l) => l.text), members.map((a) => a.anchor));
    for (const [i, link] of group.links.entries()) {
      const pillar = clusterPillars('aeoGeo', ALL).some((a) => articlePath(a) === link.href);
      assert.equal(Boolean(link.pillar), pillar, link.href);
      if (pillar) assert.equal(i, 0, 'a pillar leads its cluster');
    }
  }
  const listed = SAMPLE.flatMap((g) => g.links.map((l) => l.href));
  assert.deepEqual([...listed].sort(), PICK.map((a) => articlePath(a)).sort(), 'exactly the published articles');
  // A later spoke published without its pillar still lists (the pillar is simply absent).
  const spokeOnly = publishedClusterGuides('aeoGeo', ALL, stateWith([AEO[9].slug]));
  assert.deepEqual(spokeOnly, [{ key: AEO[9].cluster, label: SILOS.aeoGeo.clusters.find(([k]) => k === AEO[9].cluster)[1], links: [{ href: articlePath(AEO[9]), text: AEO[9].anchor }] }]);
});

test('the committed src/generated/aeo-geo-guides.js matches a fresh render from the committed publish state', () => {
  const fresh = aeoGeoGuidesModule(publishedClusterGuides('aeoGeo', ALL, loadPublishState()), latestSiloUpdate('aeoGeo', ALL, loadPublishState()));
  assert.equal(read(AEO_GEO_GUIDES_MODULE), fresh, 'run node scripts/build-seo-pages.mjs');
  assert.deepEqual(AEO_GEO_GUIDES, publishedClusterGuides('aeoGeo', ALL, loadPublishState()));
  // Deterministic: the same state always produces the same bytes.
  assert.equal(aeoGeoGuidesModule(SAMPLE), aeoGeoGuidesModule(publishedClusterGuides('aeoGeo', ALL, SAMPLE_STATE)));
});

// ---- the three surfaces ------------------------------------------------------------------------

test('static mirror: the block renders published articles after the final CTA, and is absent (byte for byte) when empty', () => {
  const empty = renderAiVisibilityMirrorRest({ guides: [] });
  assert.ok(!empty.includes(`id="${GUIDES.id}"`) && !empty.includes(GUIDES.heading));
  assert.equal(renderAiVisibilityMirror({ guides: [] }), renderAiVisibilityMirror({ guides: AEO_GEO_GUIDES.length ? [] : AEO_GEO_GUIDES }));

  const html = renderAiVisibilityMirrorRest({ guides: SAMPLE });
  const section = html.match(new RegExp(`<section id="${GUIDES.id}"[\\s\\S]*?</section>`))?.[0] || '';
  assert.ok(section, 'the guides section renders');
  assert.ok(section.includes(`>${GUIDES.heading}</h2>`));
  assert.deepEqual([...section.matchAll(/<nav aria-label="([^"]+)"/g)].map((m) => m[1]), SAMPLE.map((g) => g.label.replaceAll('&', '&amp;')));
  assert.deepEqual([...section.matchAll(/href="([^"]+)"/g)].map((m) => m[1]), SAMPLE.flatMap((g) => g.links.map((l) => l.href)));
  assert.equal((section.match(/<h2\b/g) || []).length, 1);
  assert.doesNotMatch(section, /<details\b/, 'plain visible links, nothing collapsed');
  // Low on the page: after the final CTA, before the related guides and footer.
  assert.ok(html.indexOf(FINAL_CTA.cta) < html.indexOf(`id="${GUIDES.id}"`));
  assert.ok(html.indexOf(`id="${GUIDES.id}"`) < html.indexOf(`aria-label="${RELATED.heading}"`));
  // Drafts never appear.
  for (const a of AEO.filter((x) => !PICK.includes(x))) assert.ok(!html.includes(articlePath(a)), a.slug);
});

test('Markdown twin: a "## AEO and GEO guides for dealers" section by cluster before the related guides; none when empty', () => {
  const empty = renderAiVisibilityMarkdown({ guides: [] });
  assert.ok(!empty.includes(`## ${GUIDES.heading}`));
  const twin = renderAiVisibilityMarkdown({ guides: SAMPLE });
  assert.ok(twin.includes(`## ${GUIDES.heading}\n\n${GUIDES.intro}\n`));
  for (const group of SAMPLE) {
    assert.ok(twin.includes(`### ${group.label}\n\n${group.links.map((l) => `- [${l.text}](https://autolander.ai${l.href})`).join('\n')}\n`), group.key);
  }
  assert.ok(twin.indexOf(`## ${GUIDES.heading}`) < twin.indexOf(`## ${RELATED.heading}`));
  // The default is the committed list (what the committed twin was built from).
  assert.equal(renderAiVisibilityMarkdown(), renderAiVisibilityMarkdown({ guides: AEO_GEO_GUIDES }));
});

test('React: AeoGuidesSection renders the same links as the mirror, nothing when empty, and sits after the final CTA', async () => {
  const result = await build({
    stdin: {
      contents: `import { renderToStaticMarkup } from 'react-dom/server';
        import { AeoGuidesSection } from './src/ai/AiSections.jsx';
        export const render = (groups) => renderToStaticMarkup(<AeoGuidesSection groups={groups} />);
        export const renderDefault = () => renderToStaticMarkup(<AeoGuidesSection />);`,
      resolveDir: ROOT,
      loader: 'jsx',
    },
    bundle: true, write: false, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'empty' },
    define: { 'import.meta.env': JSON.stringify({ MODE: 'production' }) },
  });
  mkdirSync(resolve(ROOT, '.probe'), { recursive: true });
  const file = resolve(ROOT, `.probe/aeo-guides-${pid}.mjs`);
  let mod;
  try {
    writeFileSync(file, result.outputFiles[0].text);
    mod = await import(pathToFileURL(file).href);
  } finally { unlinkSync(file); }

  assert.equal(mod.render([]), '');
  assert.equal(mod.renderDefault(), AEO_GEO_GUIDES.length ? mod.render(AEO_GEO_GUIDES) : '');
  const html = mod.render(SAMPLE);
  assert.ok(html.startsWith(`<section id="${GUIDES.id}"`));
  const mirror = renderAiVisibilityMirrorRest({ guides: SAMPLE });
  const hrefs = (s) => [...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const mirrorSection = mirror.match(new RegExp(`<section id="${GUIDES.id}"[\\s\\S]*?</section>`))[0];
  assert.deepEqual(hrefs(html), hrefs(mirrorSection), 'React and the no-JS mirror list the same links in the same order');
  for (const group of SAMPLE) {
    assert.ok(html.includes(`aria-label="${group.label.replaceAll('&', '&amp;')}"`), group.key);
    for (const link of group.links) assert.ok(html.includes(`>${link.text.replaceAll('&', '&amp;')}</a>`), link.href);
  }

  const app = read('src/ai/AiVisibilityApp.jsx');
  assert.match(app, /<AiFinalCta onGo=\{goToForm\} \/>\s*<AeoGuidesSection \/>\s*<AboutService \/>/);
  // Deterministic render for prerender and hydration: the section reads only its build-time data.
  const sections = read('src/ai/AiSections.jsx');
  const component = sections.match(/export function AeoGuidesSection[\s\S]*?\n}\n/)?.[0] || '';
  assert.ok(component);
  assert.doesNotMatch(component, /\bwindow\b|\bdocument\b|localStorage|fetch\(|Date\.now|Math\.random|useEffect|useState/);
  assert.match(sections, /import \{ AEO_GEO_GUIDES \} from '\.\.\/generated\/aeo-geo-guides\.js';/);
  // The route CSS build requires every src/ module the AI page imports to be an @source of ai.css.
  assert.match(read('src/ai/ai.css'), /@source "\.\.\/generated\/aeo-geo-guides\.js";/);
});

// ---- publishing regenerates and re-pings it ------------------------------------------------------

test('publishing an AEO article re-pings the money page (IndexNow); other silos do not', () => {
  const first = AEO[0];
  const state = stateWith([first.slug]);
  const urls = changedUrlsFor(first, ALL, state);
  assert.ok(urls.includes(MONEY_URL), 'the money page guides block changed');
  assert.ok(urls.includes(`https://autolander.ai${articlePath(first)}`));
  assert.equal(SILOS.aeoGeo.guidesOn, 'aiVisibility');
  const mkt = DRIP_ARTICLES.find((a) => a.silo === 'marketplace');
  assert.ok(!changedUrlsFor(mkt, ALL, stateWith([mkt.slug])).includes(MONEY_URL));
});

test('the publish workflow commits the generated module (it lives under src/generated/)', () => {
  assert.ok(AEO_GEO_GUIDES_MODULE.startsWith('src/generated/'));
  const commit = read('scripts/blog/commit-publish.mjs');
  assert.match(commit, /'src\/generated'/);
  const builder = read('scripts/build-seo-pages.mjs');
  assert.match(builder, /publishedClusterGuides\('aeoGeo', ARTICLE_CONTENT, PUBLISH_STATE\)/);
  assert.match(builder, /renderAiVisibilityMarkdown\(\{ guides: AEO_GEO_GUIDES, updated: AI_VISIBILITY_LASTMOD \}\)/);
});
