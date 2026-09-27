import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadBlogPosts } from '../scripts/seo/articles/blog-loader.mjs';
import {
  SILOS, articlePath, relatedForArticle, contentStatusJson, blogInboundTargets,
} from '../scripts/seo/articles/article-system.mjs';
import { NAV } from '../scripts/seo/registry.mjs';

const post = (slug, extra = {}) => ({
  slug, silo: 'blog', anchor: `A ${slug}`, crumb: `C ${slug}`, primaryKeyword: `kw ${slug}`,
  secondaryKeywords: [], title: `T ${slug}`, description: 'D', eyebrow: 'Blog', h1: 'H', tldr: 'T',
  sections: [{ type: 'qa', q: 'Q?', a: 'A.' }], faq: [['Q?', 'A.']], cta: { heading: 'h', sub: 's' },
  alsoRelated: [], augmentKeys: [], alsoOnCompetitors: [], inboundFrom: [],
  meta: { validation: { ok: true, errors: [] }, updatedAt: '2026-09-27' }, ...extra,
});
const guide = (slug, silo = 'marketplace') => ({ ...post(slug), silo, inboundFrom: undefined, meta: undefined });
const st = (map) => Object.fromEntries(Object.entries(map).map(([s, d]) => [s, d ? { status: 'published', publishedAt: d } : { status: 'draft', publishedAt: null }]));

test('NAV.blog and SILOS.blog exist; blog posts live under /blog/', () => {
  assert.equal(NAV.blog.path, '/blog/');
  assert.equal(SILOS.blog.basePath, '/blog/');
  assert.equal(articlePath(post('my-post')), '/blog/my-post/');
});

test('loadBlogPosts reads *.json sorted by slug and skips _-prefixed entries', () => {
  const dir = mkdtempSync(join(tmpdir(), 'blog-'));
  writeFileSync(join(dir, 'b-post.json'), JSON.stringify(post('b-post')));
  writeFileSync(join(dir, 'a-post.json'), JSON.stringify(post('a-post')));
  writeFileSync(join(dir, '_ignored.json'), '{}');
  mkdirSync(join(dir, '_requests'));
  writeFileSync(join(dir, '_requests', 'x.json'), '{}');
  assert.deepEqual(loadBlogPosts(dir).map((p) => p.slug), ['a-post', 'b-post']);
});

test('loadBlogPosts returns an empty list when the blog directory is absent', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-missing-'));
  assert.deepEqual(loadBlogPosts(join(root, 'does-not-exist')), []);
});

test('loadBlogPosts skips invalid JSON, unsafe shapes, and filename slug mismatches', () => {
  const dir = mkdtempSync(join(tmpdir(), 'blog-malformed-'));
  writeFileSync(join(dir, 'good-post.json'), JSON.stringify(post('good-post')));
  writeFileSync(join(dir, 'bad-json.json'), '{');
  writeFileSync(join(dir, 'bad-shape.json'), JSON.stringify(post('bad-shape', {
    sections: [{ type: 'table', h2: 'Unsafe', head: ['A'], rows: ['not-an-array'] }],
  })));
  writeFileSync(join(dir, 'wrong-file.json'), JSON.stringify(post('different-slug')));
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    assert.deepEqual(loadBlogPosts(dir).map((candidate) => candidate.slug), ['good-post']);
  } finally {
    console.warn = originalWarn;
  }
  for (const file of ['bad-json.json', 'bad-shape.json', 'wrong-file.json']) {
    assert.ok(warnings.some((warning) => warning.includes(file)), file);
  }
});

test('blog siblings = newest published blog posts, drafts excluded', () => {
  const posts = [post('p-old'), post('p-new'), post('p-draft'), post('p-self')];
  const state = st({ 'p-old': '2026-09-01', 'p-new': '2026-09-20', 'p-draft': null, 'p-self': '2026-09-10' });
  const hrefs = relatedForArticle(posts[3], posts, state).map((l) => l.href);
  assert.ok(hrefs.indexOf('/blog/p-new/') < hrefs.indexOf('/blog/p-old/'));
  assert.ok(!hrefs.includes('/blog/p-draft/'));
  assert.ok(!hrefs.includes('/blog/p-self/'));
});

test('inboundFrom adds a link on the target only once the post is published', () => {
  const target = guide('post-a-car-on-facebook-marketplace-dealer');
  const p = post('new-post', { inboundFrom: [target.slug] });
  const arts = [target, p];
  const draft = relatedForArticle(target, arts, st({ [target.slug]: '2026-08-27', 'new-post': null }));
  assert.ok(!draft.some((l) => l.href === '/blog/new-post/'));
  const live = relatedForArticle(target, arts, st({ [target.slug]: '2026-08-27', 'new-post': '2026-09-27' }));
  assert.equal(live.filter((l) => l.href === '/blog/new-post/').length, 1);
  assert.deepEqual(blogInboundTargets(p, arts, st({ [target.slug]: '2026-08-27' })).map((a) => a.slug), [target.slug]);
});

test('content-status marks blog rows, carries request identity, and never carries prompt text', () => {
  const requestId = '11111111-1111-4111-8111-111111111111';
  const p = post('x-post', { meta: { requestId, prompt: 'SECRET', validation: { ok: false, errors: ['e1'] }, updatedAt: '2026-09-27' } });
  const poisoned = post('y-post', { meta: { requestId: 'PRIVATE REQUEST TEXT', validation: { ok: true, errors: [] }, updatedAt: '2026-09-27' } });
  const json = contentStatusJson([guide('g-one'), p, poisoned], st({ 'g-one': '2026-08-27', 'x-post': null, 'y-post': null }));
  const row = json.articles.find((a) => a.slug === 'x-post');
  assert.equal(row.kind, 'blog');
  assert.equal(row.suggestedOrder, null);
  assert.equal(row.validationOk, false);
  assert.equal(row.requestId, requestId);
  assert.deepEqual(row.validationErrors, ['e1']);
  assert.ok(!JSON.stringify(json).includes('SECRET'));
  assert.equal(json.articles.find((a) => a.slug === 'y-post').requestId, null);
  assert.ok(!JSON.stringify(json).includes('PRIVATE REQUEST TEXT'));
  assert.equal(json.articles.find((a) => a.slug === 'g-one').kind, 'drip');
});

test('content-status tolerates malformed blog rows and keeps every safe row', () => {
  const drip = [guide('g-one'), guide('g-two')];
  const malformed = post('bad-table', {
    sections: [{ type: 'table', h2: 'Unsafe', head: ['A'], rows: ['not-an-array'] }],
  });
  const validBlog = post('good-blog');
  const malformedTopLevel = post('bad-top-level', { slug: null });
  let result;
  assert.doesNotThrow(() => {
    result = contentStatusJson(
      [...drip, malformed, validBlog, malformedTopLevel],
      st({ 'g-one': null, 'g-two': null, 'bad-table': null, 'good-blog': null }),
    );
  });
  assert.deepEqual(
    result.articles.filter((row) => row.kind === 'drip').map((row) => row.slug),
    ['g-one', 'g-two'],
  );
  assert.ok(result.articles.some((row) => row.slug === 'good-blog'));
  assert.ok(!result.articles.some((row) => row.slug === null));
});
