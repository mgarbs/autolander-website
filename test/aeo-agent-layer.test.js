// The machine-readable standard every AEO and GEO article ships with (Michael, 2026-10-01: "make
// everything machine readable for agents to cite and recommend"). An answer engine must be able to
// read the article as Markdown with its sources still linked, find what it cites in the JSON-LD, see
// its own card, and hear about it (IndexNow, llms files, agents.md) the moment it is published.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  articleCitations, articleSitemapEntries, articlePath, buildArticlePage, latestSiloUpdate,
  loadPublishState, modifiedDate, publishedClusterGuides,
} from '../scripts/seo/articles/article-system.mjs';
import { DRIP_ARTICLES } from '../scripts/seo/articles/drip-articles.mjs';
import { loadBlogPosts } from '../scripts/seo/articles/blog-loader.mjs';
import { renderMarkdown, renderPage } from '../scripts/seo/shell.mjs';
import { agentsMarkdown } from '../scripts/seo/agent-instructions.mjs';
import { changedUrlsFor } from '../scripts/publish-article.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALL = [...DRIP_ARTICLES, ...loadBlogPosts()];
const AEO = DRIP_ARTICLES.filter((a) => a.silo === 'aeoGeo').sort((a, b) => a.publishOrder - b.publishOrder);
const ORIGIN = 'https://autolander.ai';
const MANIFEST = JSON.parse(readFileSync(resolve(ROOT, 'public/og/manifest.json'), 'utf8'));

const stateWith = (slugs, extra = {}) => {
  const state = structuredClone(loadPublishState());
  for (const a of AEO) state[a.slug] = { status: 'draft', publishedAt: null };
  for (const slug of slugs) state[slug] = { status: 'published', publishedAt: '2026-10-01', ...extra };
  return state;
};
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test('every AEO article: a linked "Sources" list, a description that fits the snippet, and its own OG card', () => {
  assert.equal(AEO.length, 50);
  for (const a of AEO) {
    const sources = a.sections.filter((s) => s.type === 'bullets' && /^sources$|facts come from/i.test(String(s.h2 || '')));
    assert.deepEqual(sources.map((s) => s.h2), ['Sources'], `${a.slug}: one standard "Sources" heading`);
    const cites = articleCitations(a);
    assert.ok(cites.length >= 3, `${a.slug}: cites its primary sources`);
    assert.equal(cites.length, sources[0].items.length, `${a.slug}: every source is a link`);
    assert.ok(cites.every((c) => c.url.startsWith('https://') && !c.url.includes('autolander.ai')), a.slug);
    assert.ok(a.description.length <= 160, `${a.slug}: description ${a.description.length} chars`);
    const card = MANIFEST[articlePath(a)];
    assert.equal(card, `/og/aeo-geo-${a.slug}.png`, `${a.slug}: manifest card`);
    assert.ok(existsSync(resolve(ROOT, 'public', card.slice(1))), `${a.slug}: card file`);
  }
});

test('the Markdown twin keeps every link: sources, in-body citations and internal links (absolute)', () => {
  const [first] = AEO;
  const state = stateWith([first.slug]);
  const page = buildArticlePage(first, ALL, state);
  const md = renderMarkdown(page);
  for (const { name, url } of articleCitations(first)) assert.ok(md.includes(`[${name}](${url})`), name);
  assert.match(md, /\[OpenAI says\]\(https:\/\/help\.openai\.com\//, 'inline citation stays a link');
  assert.doesNotMatch(md, /\]\(\/[^)]*\)/, 'no relative links in the twin');
  assert.ok(md.includes(`](${ORIGIN}/aeo-geo-for-car-dealers/`), 'internal links are absolute');
  assert.match(md, /\nPublished: October 1, 2026  \nUpdated: October 1, 2026\n/);
  // A link to an unpublished sibling is still plain text (the publish gate runs before the twin).
  const draftLinks = AEO.slice(1).map((a) => `${ORIGIN}${articlePath(a)}`);
  for (const url of draftLinks) assert.ok(!md.includes(`](${url})`), url);
});

test('Article JSON-LD carries citation, keywords and the per-article image; article:tag mirrors keywords', () => {
  const [first] = AEO;
  const html = renderPage(buildArticlePage(first, ALL, stateWith([first.slug])));
  const article = jsonLd(html).find((b) => b['@type'] === 'Article');
  assert.deepEqual(article.citation, articleCitations(first).map((c) => ({ '@type': 'CreativeWork', ...c })));
  const tags = [first.primaryKeyword, ...first.secondaryKeywords];
  assert.equal(article.keywords, tags.join(', '));
  for (const tag of tags) assert.ok(html.includes(`<meta property="article:tag" content="${tag}" />`), tag);
  assert.equal(article.image, `${ORIGIN}/og/aeo-geo-${first.slug}.png`);
  assert.ok(html.includes(`<meta property="og:image" content="${ORIGIN}/og/aeo-geo-${first.slug}.png" />`));
});

test('an edit after publish (updatedAt) moves dateModified, the twin and the sitemap lastmod, never before publish', () => {
  const [first] = AEO;
  const edited = stateWith([first.slug], { updatedAt: '2026-10-15' });
  assert.equal(modifiedDate(first, edited, '2026-10-01'), '2026-10-15');
  const page = buildArticlePage(first, ALL, edited);
  const article = jsonLd(renderPage(page)).find((b) => b['@type'] === 'Article');
  assert.equal(article.datePublished, '2026-10-01');
  assert.equal(article.dateModified, '2026-10-15');
  assert.match(renderMarkdown(page), /\nPublished: October 1, 2026  \nUpdated: October 15, 2026\n/);
  assert.equal(articleSitemapEntries(ALL, edited).find((e) => e.loc.endsWith(articlePath(first))).lastmod, '2026-10-15');
  assert.equal(latestSiloUpdate('aeoGeo', ALL, edited), '2026-10-15');
  // A stale updatedAt never drags the date before publish.
  assert.equal(modifiedDate(first, stateWith([first.slug], { updatedAt: '2026-09-01' }), '2026-10-01'), '2026-10-01');
  assert.equal(latestSiloUpdate('aeoGeo', ALL, stateWith([])), null);
});

test('publishing re-pings the agent layer: Markdown twins, llms.txt, llms-full.txt and agents.md', () => {
  const [first] = AEO;
  const urls = changedUrlsFor(first, ALL, stateWith([first.slug]));
  for (const url of [
    `${ORIGIN}${articlePath(first)}`,
    `${ORIGIN}/aeo-geo/${first.slug}.md`,
    `${ORIGIN}/aeo-geo-for-car-dealers/`,
    `${ORIGIN}/aeo-geo-for-car-dealers.md`,
    `${ORIGIN}/llms.txt`,
    `${ORIGIN}/llms-full.txt`,
    `${ORIGIN}/agents.md`,
  ]) assert.ok(urls.includes(url), url);
  // Only twins that exist (or the article's own, which the publish build writes).
  for (const url of urls.filter((u) => u.endsWith('.md') && !u.endsWith(`/${first.slug}.md`))) {
    assert.ok(existsSync(resolve(ROOT, 'public', new URL(url).pathname.slice(1))), url);
  }
  const indexnow = readFileSync(resolve(ROOT, 'scripts/submit-indexnow.mjs'), 'utf8');
  assert.match(indexnow, /image-sitemap\.xml/);
});

test('agents.md lists the published guides with their Markdown twins, and nothing while none is live', () => {
  assert.doesNotMatch(agentsMarkdown('October 1, 2026', { guides: [] }), /AEO and GEO guides for car dealers/);
  const [first, second] = AEO;
  const guides = publishedClusterGuides('aeoGeo', ALL, stateWith([first.slug]));
  const md = agentsMarkdown('October 1, 2026', { guides });
  assert.ok(md.includes(`(${ORIGIN}${articlePath(first)}) (Markdown: ${ORIGIN}/aeo-geo/${first.slug}.md)`));
  assert.ok(!md.includes(articlePath(second)), 'drafts never listed');
  assert.ok(md.indexOf('## AEO and GEO guides for car dealers') < md.indexOf('## How to fetch this site'));
  const committed = readFileSync(resolve(ROOT, 'public/agents.md'), 'utf8');
  for (const a of AEO) {
    assert.equal(committed.includes(articlePath(a)), loadPublishState()[a.slug]?.status === 'published', a.slug);
  }
});
