// Content Publisher / Avalanche article layer — publish gating, silo linking, admin API.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SILOS, SUGGESTED_ORDER, articlePath, loadPublishState, isPublished,
  relatedForArticle, buildArticlePage, hubAugmentLinks, contentStatusJson,
  articleSitemapEntries,
} from '../scripts/seo/articles/article-system.mjs';
import { handleContentList, handleContentPublish } from '../worker/src/admin/content.js';

const art = (slug, silo, extra = {}) => ({
  slug,
  silo,
  anchor: `Anchor for ${slug}`,
  crumb: `Crumb ${slug}`,
  primaryKeyword: `kw ${slug}`,
  secondaryKeywords: [],
  title: `Title ${slug}`,
  description: `Description ${slug}`,
  h1: `H1 ${slug}`,
  tldr: 'Short answer.',
  sections: [{ type: 'qa', q: 'Q?', a: 'A.' }],
  faq: [['Q?', 'A long enough answer for the FAQ block.']],
  cta: { heading: 'CTA', sub: 'Sub.' },
  ...extra,
});

// Three marketplace articles in SUGGESTED_ORDER order + one photos article.
const MKT = ['post-a-car-on-facebook-marketplace-dealer', 'facebook-marketplace-car-listing-limits', 'renew-facebook-marketplace-car-listings'];
const ARTS = [
  ...MKT.map((s) => art(s, 'marketplace')),
  art('remove-background-from-car-photo', 'photos'),
];
const state = (published) => Object.fromEntries(
  [...SUGGESTED_ORDER].map((s) => [s, published.includes(s)
    ? { status: 'published', publishedAt: '2026-08-27' }
    : { status: 'draft', publishedAt: null }]),
);

test('publish-state.json covers exactly the SUGGESTED_ORDER slugs', () => {
  const st = loadPublishState();
  assert.deepEqual(Object.keys(st).sort(), [...SUGGESTED_ORDER].sort());
  assert.equal(SUGGESTED_ORDER.length, 30);
});

test('draft siblings never appear in related links; published ones do', () => {
  const none = relatedForArticle(ARTS[0], ARTS, state([]));
  assert.ok(none.every((l) => !l.href.startsWith('/guide/facebook-marketplace-car-listing-limits')));
  assert.deepEqual(none, SILOS.marketplace.related);

  const some = relatedForArticle(ARTS[0], ARTS, state(['facebook-marketplace-car-listing-limits']));
  assert.ok(some.some((l) => l.href === articlePath('facebook-marketplace-car-listing-limits')));
  // cross-silo sibling never leaks in even when published
  const cross = relatedForArticle(ARTS[0], ARTS, state(['remove-background-from-car-photo']));
  assert.ok(cross.every((l) => l.href !== articlePath('remove-background-from-car-photo')));
  assert.ok(some.length <= 8);
});

test('buildArticlePage stamps the real publish date and the silo breadcrumb', () => {
  const st = state(['post-a-car-on-facebook-marketplace-dealer']);
  const page = buildArticlePage(ARTS[0], ARTS, st);
  assert.equal(page.article.datePublished, '2026-08-27');
  assert.equal(page.path, '/guide/post-a-car-on-facebook-marketplace-dealer/');
  assert.equal(page.breadcrumbs.length, 3);
  assert.equal(page.breadcrumbs[1].name, SILOS.marketplace.crumb.name);
  assert.equal(page.bylineUpdated, true);
  assert.equal(page.author, true);
});

test('hubAugmentLinks exposes only published articles, on the right hub keys', () => {
  const st = state(['post-a-car-on-facebook-marketplace-dealer', 'remove-background-from-car-photo']);
  const aug = hubAugmentLinks(ARTS, st);
  assert.ok(aug.get('dealers').some((l) => l.href === articlePath('post-a-car-on-facebook-marketplace-dealer')));
  assert.ok(aug.get('photoEditor').some((l) => l.href === articlePath('remove-background-from-car-photo')));
  assert.equal(aug.get('dealers').length, 1); // the draft marketplace articles stay invisible
  assert.ok(!aug.has('mktgHub')); // no growth article published -> no key at all
});

test('contentStatusJson lists every article with status and drip order', () => {
  const st = state(['facebook-marketplace-car-listing-limits']);
  const json = contentStatusJson(ARTS, st);
  assert.equal(json.articles.length, ARTS.length);
  const limits = json.articles.find((a) => a.slug === 'facebook-marketplace-car-listing-limits');
  assert.equal(limits.status, 'published');
  assert.equal(limits.publishedAt, '2026-08-27');
  assert.equal(limits.url, 'https://autolander.ai/guide/facebook-marketplace-car-listing-limits/');
  const orders = json.articles.map((a) => a.suggestedOrder);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
});

test('sitemap entries carry per-article lastmod and exclude drafts', () => {
  const st = state(['renew-facebook-marketplace-car-listings']);
  const entries = articleSitemapEntries(ARTS, st);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].lastmod, '2026-08-27');
  assert.ok(entries[0].loc.endsWith('/guide/renew-facebook-marketplace-car-listings/'));
});

test('isPublished is strict about status', () => {
  assert.equal(isPublished({ x: { status: 'published' } }, 'x'), true);
  assert.equal(isPublished({ x: { status: 'draft' } }, 'x'), false);
  assert.equal(isPublished({}, 'x'), false);
});

// ---- worker admin endpoints (fetch stubbed) ----

const withFetch = async (impl, fn) => {
  const orig = globalThis.fetch;
  globalThis.fetch = impl;
  try { return await fn(); } finally { globalThis.fetch = orig; }
};

test('handleContentPublish: no token -> 503, bad slug -> 400, dispatch 204 -> 202', async () => {
  const noToken = await handleContentPublish(new Request('https://x/', { method: 'POST', body: '{"slug":"abc-def"}' }), {});
  assert.equal(noToken.status, 503);

  const bad = await handleContentPublish(
    new Request('https://x/', { method: 'POST', body: '{"slug":"NOT a slug!!"}' }),
    { GITHUB_TOKEN: 't' },
  );
  assert.equal(bad.status, 400);

  await withFetch(async (url, init) => {
    assert.ok(String(url).includes('/actions/workflows/publish-article.yml/dispatches'));
    assert.equal(init.method, 'POST');
    const body = JSON.parse(init.body);
    assert.deepEqual(body, { ref: 'main', inputs: { slug: 'abc-def' } });
    return new Response(null, { status: 204 });
  }, async () => {
    const ok = await handleContentPublish(
      new Request('https://x/', { method: 'POST', body: '{"slug":"abc-def"}' }),
      { GITHUB_TOKEN: 't' },
    );
    assert.equal(ok.status, 202);
    assert.equal(ok.body.ok, true);
  });
});

test('handleContentList: surfaces articles and flags canPublish by token presence', async () => {
  const statusPayload = { generatedAt: '2026-08-27', articles: [{ slug: 'a', status: 'draft' }] };
  const stub = async (url) => {
    const u = String(url);
    if (u.includes('raw.githubusercontent.com') || u.includes('/contents/')) {
      return new Response(JSON.stringify(statusPayload), { status: 200 });
    }
    return new Response(JSON.stringify({ workflow_runs: [{ id: 1, display_title: 'publish: a', status: 'in_progress', conclusion: null, created_at: 'x', html_url: 'y' }] }), { status: 200 });
  };
  await withFetch(stub, async () => {
    const noToken = await handleContentList({});
    assert.equal(noToken.status, 200);
    assert.equal(noToken.body.canPublish, false);
    assert.equal(noToken.body.articles.length, 1);
    assert.equal(noToken.body.runs.length, 0);

    const withToken = await handleContentList({ GITHUB_TOKEN: 't' });
    assert.equal(withToken.body.canPublish, true);
    assert.equal(withToken.body.articles.length, 1);
    assert.equal(withToken.body.runs.length, 1);
    assert.equal(withToken.body.runs[0].status, 'in_progress');
  });

  await withFetch(async () => new Response('nope', { status: 404 }), async () => {
    const fail = await handleContentList({});
    assert.equal(fail.status, 502);
    assert.equal(fail.body.reason, 'status_fetch_failed');
  });
});

// The publish-then-stale-read bug: raw.githubusercontent.com serves max-age=300, so for
// ~5 minutes after a publish commit it still reported the article as a draft and the panel
// offered "Publish" again. With a token the read must go through the uncached contents API.
test('handleContentList: with a token, status is read from the contents API, not cached raw', async () => {
  const fresh = { articles: [{ slug: 'a', status: 'published', publishedAt: '2026-08-29' }] };
  const staleRaw = { articles: [{ slug: 'a', status: 'draft', publishedAt: null }] };
  const seen = [];

  await withFetch(async (url, init) => {
    const u = String(url);
    seen.push(u);
    if (u.startsWith('https://api.github.com/') && u.includes('/contents/public/data/content-status.json')) {
      assert.ok(u.includes('?ref=main'), 'contents read must pin ref=main');
      assert.equal(init.headers.Accept, 'application/vnd.github.raw');
      return new Response(JSON.stringify(fresh), { status: 200 });
    }
    if (u.includes('raw.githubusercontent.com')) return new Response(JSON.stringify(staleRaw), { status: 200 });
    return new Response(JSON.stringify({ workflow_runs: [] }), { status: 200 });
  }, async () => {
    const res = await handleContentList({ GITHUB_TOKEN: 't' });
    assert.equal(res.body.articles[0].status, 'published');
    assert.ok(!seen.some((u) => u.includes('raw.githubusercontent.com')), 'must not fall back to raw when the API answers');
  });

  // API failure still degrades to raw rather than blanking the panel.
  await withFetch(async (url) => {
    const u = String(url);
    if (u.startsWith('https://api.github.com/') && u.includes('/contents/')) return new Response('rate limited', { status: 403 });
    if (u.includes('raw.githubusercontent.com')) return new Response(JSON.stringify(staleRaw), { status: 200 });
    return new Response(JSON.stringify({ workflow_runs: [] }), { status: 200 });
  }, async () => {
    const res = await handleContentList({ GITHUB_TOKEN: 't' });
    assert.equal(res.status, 200);
    assert.equal(res.body.articles[0].status, 'draft');
  });
});
