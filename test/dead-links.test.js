// No dead internal links, in ANY publish state (Michael, 2026-09-30: "numbered in such a way that
// I publish them and there won't be any dead links").
//
// Three layers, all against real builder output:
//   1. The committed public/ + index.html (and dist/ when a production build is present) carry
//      no internal link to a path the site does not serve, and none of the draft AEO articles
//      is rendered, listed, linked or mentioned anywhere public.
//   2. Sandbox builds (scripts/build-seo-pages.mjs with AL_SEO_OUT_DIR + AL_SEO_STATE_FILE, so
//      the working tree is never touched) of simulated publish states: the current state, the
//      first N AEO articles published in publish-number order (N = 1, 5, 17, 50), and three
//      seeded random subsets published out of order. Every rendered page is crawled; a link to
//      a path missing from the build fails the test. Publishing in order must also hold ZERO
//      in-body links back as plain text (the links only ever point backward).
//   3. Publishing one article in a copy of the state makes it appear with its silo links, the
//      homepage directory entry, the blog index, the hub, the sitemap and llms.txt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import {
  dirname, join, relative, resolve, sep,
} from 'node:path';
import { env as processEnv, execPath } from 'node:process';
import { fileURLToPath } from 'node:url';

import { articlePath, loadPublishState } from '../scripts/seo/articles/article-system.mjs';
import { DRIP_ARTICLES } from '../scripts/seo/articles/drip-articles.mjs';
import { loadBlogPosts } from '../scripts/seo/articles/blog-loader.mjs';
import { NAV, SPA_PAGE_PATHS } from '../scripts/seo/registry.mjs';
import { AI_VISIBILITY_LEGACY_PATHS } from '../shared/ai-visibility-route.js';
import {
  crawl, crawlableFiles, listFiles, servedBy,
} from '../scripts/seo/link-crawl.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = resolve(ROOT, 'public');
const DIST = resolve(ROOT, 'dist');
const BUILDER = resolve(ROOT, 'scripts', 'build-seo-pages.mjs');

const AEO = DRIP_ARTICLES.filter((a) => a.silo === 'aeoGeo').sort((a, b) => a.publishOrder - b.publishOrder);
const ALL_ARTICLES = [...DRIP_ARTICLES, ...loadBlogPosts()];
const ARTICLE_PATHS = new Set(ALL_ARTICLES.map((a) => articlePath(a)));
// Paths the production build serves from outside public/: the SPA homepage, the dedicated SPA
// shells (spa-fallback.mjs), the utility shells, and the retired AEO URL's forwarding stub.
const DIST_ONLY = new Set(['/', ...SPA_PAGE_PATHS, '/admin/', '/pay/', ...AI_VISIBILITY_LEGACY_PATHS]);

const describeDead = (dead) => dead.slice(0, 15).map((d) => `  ${d.page} -> ${d.href}`).join('\n');
const TEXT_FILE_RE = /\.(html?|md|txt|xml|json)$/i;
// The generated list of published AEO articles the money page renders (React + static mirror).
const GUIDES_MODULE = join('src', 'generated', 'aeo-geo-guides.js');

// build-og-cards.mjs renders a card for EVERY article while it is still a draft (so a later publish
// needs no Playwright) and records it in og/manifest.json as "<article path>": "/og/<slugFor>.png".
// That exact entry is the generator's existing behaviour, and it is the only thing exempted: a
// draft's entry is dropped from the parsed manifest only when key AND value are exactly that pair,
// and the rest of the file is scanned like any other. A draft named under another key or with any
// other value, a manifest that is not the root og/manifest.json, or an unparseable one still leaks.
const ogCardSlug = (urlPath) => urlPath.replace(/^\/|\/$/g, '').replaceAll('/', '-'); // = build-og-cards slugFor
function withoutOgCardEntries(root, file, text, drafts) {
  if (relative(root, file).split(sep).join('/') !== 'og/manifest.json') return text;
  let manifest;
  try { manifest = JSON.parse(text); } catch { return text; }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return text;
  const rest = { ...manifest };
  for (const a of drafts) {
    const path = articlePath(a);
    if (rest[path] === `/og/${ogCardSlug(path)}.png`) delete rest[path];
  }
  return JSON.stringify(rest, null, 2);
}

// Every file a visitor or crawler can fetch that must not mention a draft. content-status.json is
// the admin's own list (drafts included by design), so it is the one exception, plus the OG
// generator's exact per-draft manifest entry (withoutOgCardEntries above).
function draftLeaks(root, drafts, { extraFiles = [] } = {}) {
  const files = [...listFiles(root).filter((f) => TEXT_FILE_RE.test(f)), ...extraFiles]
    .filter((f) => !/[\\/]data[\\/]content-status\.json$/.test(f));
  const leaks = [];
  for (const file of files) {
    const text = withoutOgCardEntries(root, file, readFileSync(file, 'utf8'), drafts);
    for (const a of drafts) {
      if (text.includes(`/aeo-geo/${a.slug}`) || text.includes(a.slug)) leaks.push(`${file}: ${a.slug}`);
    }
  }
  return leaks;
}

// dist/ is a production build of SOME earlier tree. When public/ has been regenerated since (every
// content build rewrites public/data/content-status.json), dist/ describes an older site, so its
// checks would fail on stale output or pass on output that no longer ships. They skip with this
// reason instead (null = dist/ is present and at least as new as the generated site).
function distSkipReason() {
  const index = resolve(DIST, 'index.html');
  if (!existsSync(index)) return 'no dist/ build (run npm run build)';
  const status = resolve(PUBLIC, 'data', 'content-status.json');
  if (!existsSync(status)) return null;
  const built = statSync(index).mtimeMs;
  const generated = statSync(status).mtimeMs;
  if (built >= generated) return null;
  return `dist/ is stale: dist/index.html (${new Date(built).toISOString()}) is older than `
    + `public/data/content-status.json (${new Date(generated).toISOString()}); run npm run build to check the production build`;
}

// ---- sandbox builds -------------------------------------------------------------------------

function sandbox(t, label) {
  const dir = mkdtempSync(join(tmpdir(), `al-deadlinks-${label}-`));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function buildWithState(t, label, state) {
  const out = sandbox(t, label);
  const stateFile = join(out, 'publish-state.json');
  writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
  const result = spawnSync(execPath, [BUILDER], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...processEnv, AL_SEO_OUT_DIR: out, AL_SEO_STATE_FILE: stateFile },
  });
  assert.equal(result.status, 0, `${label}: build failed\n${result.stderr}`);
  const held = Number(result.stdout.match(/Link gate: (\d+) in-body link/)?.[1] || 0);
  return { out, pub: join(out, 'public'), stdout: result.stdout, stderr: result.stderr, held };
}

// A sandbox build writes only generated pages; static assets and the compare cluster stay in the
// repo's public/. An article URL counts only when the sandbox itself rendered it, so an article
// the simulated state leaves unpublished can never be satisfied by a stale file.
const sandboxServes = (pub) => (path) => DIST_ONLY.has(path)
  || servedBy(pub, path)
  || (!ARTICLE_PATHS.has(path) && servedBy(PUBLIC, path));

function crawlSandbox(build) {
  const files = [...crawlableFiles(build.pub), { file: join(build.out, 'index.html'), urlPath: '/' }];
  return crawl(files, sandboxServes(build.pub));
}

const withPublished = (base, slugs, date = '2026-10-01') => {
  const state = structuredClone(base);
  for (const slug of slugs) state[slug] = { status: 'published', publishedAt: date };
  return state;
};

// Simulations start from "every AEO article is a draft", whatever the live publish state is, so they keep
// testing the same scenarios as articles go live (Michael published #1 on 2026-09-30).
const aeoDraftBaseline = () => {
  const state = structuredClone(loadPublishState());
  for (const a of AEO) state[a.slug] = { status: 'draft', publishedAt: null };
  return state;
};

// Deterministic shuffles so a failure reproduces.
function seededSubset(seed, size) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const slugs = AEO.map((a) => a.slug);
  for (let i = slugs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [slugs[i], slugs[j]] = [slugs[j], slugs[i]];
  }
  return slugs.slice(0, size);
}

// ---- 1. the committed site -------------------------------------------------------------------

test('committed public/ and index.html carry no dead internal links', () => {
  const files = [...crawlableFiles(PUBLIC), { file: resolve(ROOT, 'index.html'), urlPath: '/' }];
  assert.ok(files.length > 100, 'crawled the generated site');
  const dead = crawl(files, (path) => DIST_ONLY.has(path) || servedBy(PUBLIC, path));
  assert.deepEqual(dead, [], `dead internal links:\n${describeDead(dead)}`);
});

test('a production build in dist/ (when present and current) carries no dead internal links', (t) => {
  const skip = distSkipReason();
  if (skip) {
    t.skip(skip);
    return;
  }
  const dead = crawl(crawlableFiles(DIST), (path) => path === '/' || servedBy(DIST, path));
  assert.deepEqual(dead, [], `dead internal links in dist/:\n${describeDead(dead)}`);
});

const committedDrafts = () => {
  const state = loadPublishState();
  return AEO.filter((a) => state[a.slug]?.status !== 'published');
};

test('draft AEO articles render nowhere public: no page, sitemap, llms, home directory, guides list or mention', (t) => {
  const drafts = committedDrafts();
  if (!drafts.length) {
    t.skip('every AEO article is published');
    return;
  }
  for (const a of drafts) {
    assert.ok(!existsSync(resolve(PUBLIC, 'aeo-geo', a.slug)), `public/aeo-geo/${a.slug}/ exists while draft`);
  }
  const leaks = draftLeaks(PUBLIC, drafts, {
    extraFiles: [
      resolve(ROOT, 'index.html'),
      resolve(ROOT, 'src', 'generated', 'home-directory.json'),
      resolve(ROOT, GUIDES_MODULE),
    ],
  });
  assert.deepEqual(leaks, [], `draft articles leak into public output:\n  ${leaks.slice(0, 15).join('\n  ')}`);
  // The admin list is the one place drafts belong.
  const status = JSON.parse(readFileSync(resolve(PUBLIC, 'data', 'content-status.json'), 'utf8'));
  for (const a of drafts) assert.ok(status.articles.some((row) => row.slug === a.slug), `${a.slug} missing from the admin list`);
});

test('draft AEO articles do not leak into a production build in dist/ (when present and current)', (t) => {
  const drafts = committedDrafts();
  const skip = drafts.length ? distSkipReason() : 'every AEO article is published';
  if (skip) {
    t.skip(skip);
    return;
  }
  const distLeaks = draftLeaks(DIST, drafts);
  assert.deepEqual(distLeaks, [], `draft articles leak into dist/:\n  ${distLeaks.slice(0, 15).join('\n  ')}`);
});

test('draftLeaks exempts ONLY the OG generator\'s exact manifest entry for a draft, never a real leak', (t) => {
  const draft = AEO.at(-1);
  const path = articlePath(draft);
  const card = `/og/${ogCardSlug(path)}.png`;
  assert.equal(card, `/og/aeo-geo-${draft.slug}.png`, 'same naming as build-og-cards.mjs slugFor');
  const site = (files) => {
    const dir = mkdtempSync(join(tmpdir(), 'al-draftleaks-'));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    for (const [rel, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, rel)), { recursive: true });
      writeFileSync(join(dir, rel), text);
    }
    return dir;
  };
  const manifest = (entries) => `${JSON.stringify({ '/': '/og/home.png', ...entries }, null, 2)}\n`;

  // The generator's own entry (what build-og-cards.mjs writes for a draft) is not a leak.
  assert.deepEqual(draftLeaks(site({ 'og/manifest.json': manifest({ [path]: card }) }), [draft]), []);
  // Everything else still is.
  const leaky = [
    { 'og/manifest.json': manifest({ [path]: '/og/other.png' }) }, // right key, wrong value
    { 'og/manifest.json': manifest({ '/somewhere/': card }) }, // the draft's card under another page
    { 'og/manifest.json': manifest({ [path]: card, '/x/': `mentions ${draft.slug}` }) }, // a second mention
    { 'og/manifest.json': `{ "${path}": "${card}", ` }, // not a parseable manifest
    { 'data/manifest.json': manifest({ [path]: card }) }, // not the OG manifest
    { 'og/manifest.json': manifest({ [path]: card }), 'llms.txt': `- [x](https://autolander.ai${path})\n` }, // a real link elsewhere
  ];
  for (const files of leaky) {
    assert.ok(draftLeaks(site(files), [draft]).length > 0, `must leak: ${JSON.stringify(Object.keys(files))} ${JSON.stringify(files).slice(0, 160)}`);
  }
  // The real committed manifest is scanned under the same rule (no draft card entry today is a leak).
  const committed = resolve(PUBLIC, 'og', 'manifest.json');
  if (existsSync(committed)) {
    const text = readFileSync(committed, 'utf8');
    const drafts = committedDrafts();
    const rest = withoutOgCardEntries(PUBLIC, committed, text, drafts);
    for (const a of drafts) assert.ok(!rest.includes(a.slug), `public/og/manifest.json names draft ${a.slug} outside its card entry`);
  }
});

// ---- 2. simulated publish states ---------------------------------------------------------------

test('the current publish state builds with no dead internal links and no unknown hrefs', (t) => {
  const build = buildWithState(t, 'current', loadPublishState());
  const dead = crawlSandbox(build);
  assert.deepEqual(dead, [], `dead internal links:\n${describeDead(dead)}`);
  assert.doesNotMatch(build.stderr, /is not a page this site serves/, build.stderr);
});

for (const n of [1, 5, 17, 50]) {
  test(`publishing the first ${n} AEO article(s) in order: no dead links, no link held back, drafts invisible`, (t) => {
    const base = aeoDraftBaseline();
    const published = AEO.slice(0, n);
    const build = buildWithState(t, `first-${n}`, withPublished(base, published.map((a) => a.slug)));

    const dead = crawlSandbox(build);
    assert.deepEqual(dead, [], `dead internal links with the first ${n} published:\n${describeDead(dead)}`);
    // Backward-only linking: in publish order every in-body link already has a live target.
    assert.equal(build.held, 0, `publishing in order held ${build.held} in-body link(s) as plain text`);
    assert.doesNotMatch(build.stderr, /is not a page this site serves/, build.stderr);

    for (const a of published) {
      assert.ok(existsSync(join(build.pub, 'aeo-geo', a.slug, 'index.html')), `#${a.publishOrder} ${a.slug} not rendered`);
    }
    const drafts = AEO.slice(n);
    for (const a of drafts) {
      assert.ok(!existsSync(join(build.pub, 'aeo-geo', a.slug)), `draft #${a.publishOrder} ${a.slug} rendered`);
    }
    const leaks = draftLeaks(build.pub, drafts, {
      extraFiles: [join(build.out, 'index.html'), join(build.out, 'src', 'generated', 'home-directory.json'), join(build.out, GUIDES_MODULE)],
    });
    assert.deepEqual(leaks, [], `drafts leak with the first ${n} published:\n  ${leaks.slice(0, 15).join('\n  ')}`);

    const sitemap = readFileSync(join(build.pub, 'sitemap.xml'), 'utf8');
    const listed = AEO.filter((a) => sitemap.includes(`https://autolander.ai/aeo-geo/${a.slug}/`));
    assert.deepEqual(listed.map((a) => a.slug), published.map((a) => a.slug), 'sitemap lists exactly the published AEO articles');
    // The money page's guides list (module + twin) carries exactly the published articles.
    const guides = readFileSync(join(build.out, GUIDES_MODULE), 'utf8');
    const twin = readFileSync(join(build.pub, 'aeo-geo-for-car-dealers.md'), 'utf8');
    for (const a of published) {
      assert.ok(guides.includes(`"href": "${articlePath(a)}"`), `guides module lists #${a.publishOrder}`);
      assert.ok(twin.includes(`(https://autolander.ai${articlePath(a)})`), `money page twin lists #${a.publishOrder}`);
    }
  });
}

for (const [seed, size] of [[20260930, 12], [7, 25], [314159, 38]]) {
  test(`publishing a random ${size} AEO articles out of order (seed ${seed}): no dead links, drafts invisible`, (t) => {
    const base = aeoDraftBaseline();
    const slugs = seededSubset(seed, size);
    const build = buildWithState(t, `random-${size}`, withPublished(base, slugs));
    const dead = crawlSandbox(build);
    assert.deepEqual(dead, [], `dead internal links (seed ${seed}):\n${describeDead(dead)}`);
    assert.doesNotMatch(build.stderr, /is not a page this site serves/, build.stderr);
    const drafts = AEO.filter((a) => !slugs.includes(a.slug));
    const leaks = draftLeaks(build.pub, drafts, {
      extraFiles: [join(build.out, 'index.html'), join(build.out, 'src', 'generated', 'home-directory.json'), join(build.out, GUIDES_MODULE)],
    });
    assert.deepEqual(leaks, [], `drafts leak (seed ${seed}):\n  ${leaks.slice(0, 15).join('\n  ')}`);
  });
}

// ---- 3. publishing one article makes it appear everywhere it belongs ---------------------------

test('publishing #1 (in a copy of the state) adds it with its silo links, hub, blog index, home directory, sitemap and llms.txt', (t) => {
  const first = AEO[0];
  const path = articlePath(first);
  const build = buildWithState(t, 'publish-one', withPublished(aeoDraftBaseline(), [first.slug]));

  const html = readFileSync(join(build.pub, 'aeo-geo', first.slug, 'index.html'), 'utf8');
  assert.match(html, /<nav class="crumbs"[\s\S]*?href="https:\/\/autolander\.ai\/aeo-geo-for-car-dealers\/">AEO and GEO for car dealers<\/a>/);
  assert.match(html, /"isPartOf":\{"@type":"WebPage","@id":"https:\/\/autolander\.ai\/aeo-geo-for-car-dealers\/#webpage"/);
  assert.match(html, /<a class="btn" href="https:\/\/autolander\.ai\/aeo-geo-for-car-dealers\/#scan-form">Get my free scan &rarr;<\/a>/);
  assert.ok(html.includes(`<meta property="og:image" content="https://autolander.ai/og/aeo-geo-${first.slug}.png" />`), 'its own OG card');
  assert.match(html, /<a href="\/aeo-geo-for-car-dealers\/">/, 'in-body up-link to the money page');
  // Keep exploring = the silo's static links only; nothing points at an unpublished sibling.
  const related = html.match(/<nav class="related"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...related.matchAll(/href="([^"]+)"/g)].map((m) => m[1]),
    ['/aeo-geo-for-car-dealers/', NAV.aiDealers.path, NAV.mktgHub.path, NAV.about.path]);
  assert.ok(existsSync(join(build.pub, 'aeo-geo', `${first.slug}.md`)), 'Markdown twin');

  const homeJson = JSON.parse(readFileSync(join(build.out, 'src', 'generated', 'home-directory.json'), 'utf8'));
  const box = homeJson.groups.find((g) => g.id === 'articles-aeoGeo');
  assert.deepEqual(box?.links, [{ href: path, text: first.anchor }], 'homepage directory box');
  assert.ok(readFileSync(join(build.out, 'index.html'), 'utf8').includes(`href="${path}"`), 'static homepage directory');
  assert.ok(readFileSync(join(build.pub, 'blog', 'index.html'), 'utf8').includes(`href="${path}"`), 'blog index guides');
  const hub = readFileSync(join(build.pub, NAV.aiDealers.path.replace(/^\/|\/$/g, ''), 'index.html'), 'utf8');
  assert.ok(hub.includes(`href="${path}"`), 'the AI-for-dealerships hub gains the pillar (augmentKeys)');
  assert.ok(readFileSync(join(build.pub, 'sitemap.xml'), 'utf8').includes(`<loc>https://autolander.ai${path}</loc>`), 'sitemap');
  const llms = readFileSync(join(build.pub, 'llms.txt'), 'utf8');
  assert.match(llms, /## AEO and GEO guides for car dealers\n\n- \[/);
  assert.ok(llms.includes(`https://autolander.ai/aeo-geo/${first.slug}.md`), 'llms.txt entry');

  // On-topic footer: the AEO & GEO / AutoLander / Company columns, #1 (a published pillar) listed.
  const footer = html.slice(html.indexOf('<footer'));
  assert.deepEqual([...footer.matchAll(/<nav class="foot-col" aria-label="([^"]+)"/g)].map((m) => m[1]),
    ['AEO &amp; GEO', 'AutoLander', 'Company']);
  assert.ok(footer.includes(`<a href="${path}">`), 'the published pillar is in the footer');
  assert.ok(!footer.includes('href="/bulk-post-cars-to-facebook-marketplace/"'), 'no Marketplace product footer');
  assert.doesNotMatch(footer, /[\w.+-]+@autolander\.ai/, 'no raw e-mail address in the footer');

  // Money page down-links: the generated module and the Markdown twin list #1 under its cluster.
  const guides = readFileSync(join(build.out, GUIDES_MODULE), 'utf8');
  assert.ok(guides.includes(`"href": "${path}"`) && guides.includes('"pillar": true'), 'guides module');
  const twin = readFileSync(join(build.pub, 'aeo-geo-for-car-dealers.md'), 'utf8');
  assert.ok(twin.includes('## AEO and GEO guides for dealers\n'), 'twin guides heading');
  assert.ok(twin.includes(`(https://autolander.ai${path})`), 'twin guides entry');
  assert.ok(twin.indexOf('## AEO and GEO guides for dealers') < twin.indexOf('## Related guides for dealers'));
  // The committed files are untouched by a sandbox build.
  // (Only meaningful while #1 is still a draft in the real state; once it is live the folder is legitimate.)
  if (loadPublishState()[first.slug]?.status !== 'published') {
    assert.ok(!existsSync(resolve(PUBLIC, 'aeo-geo', first.slug)), 'sandbox wrote into the repo public/');
  }
});

test('publishing #2 turns its in-body token into a live link to #1, and #1 gains a forward link to #2', (t) => {
  const [first, second] = AEO;
  const build = buildWithState(t, 'publish-two', withPublished(aeoDraftBaseline(), [first.slug, second.slug]));
  const secondHtml = readFileSync(join(build.pub, 'aeo-geo', second.slug, 'index.html'), 'utf8');
  const body = secondHtml.slice(secondHtml.indexOf('<main'), secondHtml.indexOf('<section class="cta">'));
  assert.ok(body.includes(`<a href="${articlePath(first)}">`), '#2 links #1 in body copy');
  const firstHtml = readFileSync(join(build.pub, 'aeo-geo', first.slug, 'index.html'), 'utf8');
  const related = firstHtml.match(/<nav class="related"[\s\S]*?<\/nav>/)[0];
  assert.ok(related.includes(`href="${articlePath(second)}"`), '#1 Keep exploring gains #2 once it is live');

  // With #2 published but #1 still a draft, the same token prints as plain text.
  const outOfOrder = buildWithState(t, 'publish-two-only', withPublished(aeoDraftBaseline(), [second.slug]));
  const html = readFileSync(join(outOfOrder.pub, 'aeo-geo', second.slug, 'index.html'), 'utf8');
  assert.ok(!html.includes(`href="${articlePath(first)}"`), 'no link to the unpublished #1');
  assert.ok(outOfOrder.held >= 1, 'the token is held as plain text');
  assert.deepEqual(crawlSandbox(outOfOrder), []);
});
