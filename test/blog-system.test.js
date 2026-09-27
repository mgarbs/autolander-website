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
  secondaryKeywords: [], title: `T ${slug}`, description: 'D', h1: 'H', tldr: 'T',
  sections: [{ type: 'qa', q: 'Q?', a: 'A.' }], faq: [['Q?', 'A.']], cta: { heading: 'h', sub: 's' },
  inboundFrom: [], meta: { validation: { ok: true, errors: [] }, updatedAt: '2026-09-27' }, ...extra,
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

test('content-status marks blog rows and never carries prompt text', () => {
  const p = post('x-post', { meta: { prompt: 'SECRET', validation: { ok: false, errors: ['e1'] }, updatedAt: '2026-09-27' } });
  const json = contentStatusJson([guide('g-one'), p], st({ 'g-one': '2026-08-27', 'x-post': null }));
  const row = json.articles.find((a) => a.slug === 'x-post');
  assert.equal(row.kind, 'blog');
  assert.equal(row.suggestedOrder, null);
  assert.equal(row.validationOk, false);
  assert.deepEqual(row.validationErrors, ['e1']);
  assert.ok(!JSON.stringify(json).includes('SECRET'));
  assert.equal(json.articles.find((a) => a.slug === 'g-one').kind, 'drip');
});
