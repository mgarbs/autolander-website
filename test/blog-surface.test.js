import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogIndexPage, blogRss, blogLd } from '../scripts/seo/blog-pages.mjs';
import { buildArticlePage, articleSitemapEntries } from '../scripts/seo/articles/article-system.mjs';
import { renderPage } from '../scripts/seo/shell.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');

const post = (slug, extra = {}) => ({
  slug,
  silo: 'blog',
  anchor: `A ${slug}`,
  crumb: 'C',
  primaryKeyword: slug,
  secondaryKeywords: [],
  title: `T ${slug}`,
  description: `D ${slug} & <x>`,
  h1: `H ${slug}`,
  tldr: 'T',
  sections: [{ type: 'qa', q: 'Q?', a: 'A.' }],
  faq: [['Q?', 'A.']],
  cta: { heading: 'h', sub: 's' },
  inboundFrom: [],
  meta: { updatedAt: '2026-09-27', validation: { ok: true, errors: [] } },
  ...extra,
});
const guide = { ...post('g-one'), silo: 'marketplace', meta: undefined };
const state = {
  'p-live': { status: 'published', publishedAt: '2026-09-20' },
  'p-draft': { status: 'draft', publishedAt: null },
  'g-one': { status: 'published', publishedAt: '2026-08-27' },
};
const articles = [guide, post('p-live'), post('p-draft')];

test('/blog/ index lists published posts and guides, never drafts', () => {
  const html = renderPage(blogIndexPage(articles, state));
  assert.match(html, /href="\/blog\/p-live\/"/);
  assert.doesNotMatch(html, /p-draft/);
  assert.match(html, /href="\/guide\/g-one\/"/);
  assert.match(html, /id="guides"/);
  assert.match(html, /"@type":\s*"Blog"/);
});

test('/blog/ renders with zero posts', () => {
  const html = renderPage(blogIndexPage([guide], state));
  assert.match(html, /<h1/);
  assert.match(html, /id="guides"/);
});

test('RSS: well-formed, escaped, self+hub links, drafts excluded', () => {
  const xml = blogRss(articles, state, { now: new Date('2026-09-27T00:00:00Z') });
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /rel="self" href="https:\/\/autolander\.ai\/blog\/feed\.xml"/);
  assert.match(xml, /rel="hub" href="https:\/\/pubsubhubbub\.appspot\.com\/"/);
  assert.match(xml, /D p-live &amp; &lt;x&gt;/);
  assert.doesNotMatch(xml, /p-draft/);
  assert.equal((xml.match(/<item>/g) || []).length, 1);
  assert.match(blogRss([guide], state, { now: new Date() }), /<channel>/);
});

test('blog post page emits BlogPosting isPartOf the Blog', () => {
  const html = renderPage(buildArticlePage(post('p-live'), articles, state));
  assert.match(html, /"@type":\s*"BlogPosting"/);
  assert.match(html, /blog\/#blog/);
  assert.match(html, /"dateModified":\s*"2026-09-27"/);
  assert.match(html, /<link rel="alternate" type="application\/rss\+xml"/);
  assert.match(html, /href="\/blog\/"/);
});

test('sitemap: published posts only, lastmod = later of publish/update', () => {
  const entries = articleSitemapEntries(articles, state);
  assert.ok(entries.some((entry) => entry.loc.endsWith('/blog/p-live/') && entry.lastmod === '2026-09-27'));
  assert.ok(!entries.some((entry) => entry.loc.includes('p-draft')));
  assert.equal(blogLd(articles, state).blogPost.length, 1);
});

test('/blog/ has a dedicated generated Open Graph card on every generated surface', () => {
  const manifest = JSON.parse(read('public/og/manifest.json'));
  assert.equal(manifest['/blog/'], '/og/blog.png');
  assert.ok(existsSync(resolve(ROOT, 'public/og/blog.png')));
  const blogHtml = read('public/blog/index.html');
  assert.match(blogHtml, /<meta property="og:image" content="https:\/\/autolander\.ai\/og\/blog\.png"/);
  assert.match(blogHtml, /<meta property="og:image:type" content="image\/png"/);
  assert.match(
    read('public/image-sitemap.xml'),
    /<url>(?:(?!<\/url>)[\s\S])*?<loc>https:\/\/autolander\.ai\/blog\/<\/loc>(?:(?!<\/url>)[\s\S])*?<image:loc>https:\/\/autolander\.ai\/og\/blog\.png<\/image:loc>(?:(?!<\/url>)[\s\S])*?<\/url>/,
  );
});
