// Content Publisher / Avalanche article layer — publish gating, silo linking, admin API.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SILOS, SUGGESTED_ORDER, articlePath, loadPublishState, isPublished,
  relatedForArticle, buildArticlePage, hubAugmentLinks, contentStatusJson,
  articleSitemapEntries, compareHubLinks, versusPageLinks, backlinkedFrom,
  ADMIN_SILO_ORDER, resolveBodyLinks, gatePageLinks, siloPublishNumber, siloNumberingProblems,
  clusterLabel, clusterIndex,
} from '../scripts/seo/articles/article-system.mjs';
import { loadBlogPosts } from '../scripts/seo/articles/blog-loader.mjs';
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

test('publish-state.json covers exactly the drip and blog slugs', () => {
  const st = loadPublishState();
  const expected = [...SUGGESTED_ORDER, ...loadBlogPosts().map((post) => post.slug)];
  assert.deepEqual(Object.keys(st).sort(), expected.sort());
  assert.equal(SUGGESTED_ORDER.length, 86);
});

// ---- 2026-09-30 aeoGeo silo: clusters, publish-aware (@slug) tokens, silo CTA, admin rows ----

const aeo = (slug, cluster, extra = {}) => art(slug, 'aeoGeo', { cluster, ...extra });
// Real aeoGeo slugs so SUGGESTED_ORDER positions are the real ones (#1, #2, #3, #10, #11).
const AEO_1 = 'can-chatgpt-see-my-dealer-website'; // #1 website
const AEO_2 = 'how-chatgpt-recommends-car-dealerships'; // #2 engines
const AEO_3 = 'how-car-buyers-use-chatgpt'; // #3 buyers
const AEO_10 = 'cloudflare-ai-bots-dealer-websites'; // #10 website
const AEO_11 = 'google-ai-overviews-for-car-dealers'; // #11 engines

test('ADMIN_SILO_ORDER lists every drip silo exactly once', () => {
  assert.deepEqual([...ADMIN_SILO_ORDER].sort(), Object.keys(SILOS).filter((key) => key !== 'blog').sort());
  assert.equal(ADMIN_SILO_ORDER[0], 'aeoGeo');
});

test('aeoGeo articles live under /aeo-geo/, breadcrumb to the money page and end on the free scan', () => {
  const content = aeo(AEO_1, 'website');
  const page = buildArticlePage(content, [content], state([AEO_1]));
  assert.equal(page.path, `/aeo-geo/${AEO_1}/`);
  assert.equal(articlePath(content), `/aeo-geo/${AEO_1}/`);
  assert.equal(page.breadcrumbs[1].url, 'https://autolander.ai/aeo-geo-for-car-dealers/');
  assert.equal(page.cta.heading, 'CTA');
  assert.equal(page.cta.sub, 'Sub.');
  assert.equal(page.cta.href, 'https://autolander.ai/aeo-geo-for-car-dealers/#scan-form');
  assert.equal(page.cta.button, 'Get my free scan');
  assert.equal(page.ogFallback, '/og/ai-visibility.jpg');
  assert.deepEqual(page.article.about.map((node) => node['@id']), [
    'https://autolander.ai/aeo-geo-for-car-dealers/#term-aeo',
    'https://autolander.ai/aeo-geo-for-car-dealers/#term-geo',
  ]);
  // Other silos keep the article's own CTA object and no OG fallback.
  const mkt = buildArticlePage(ARTS[0], ARTS, state([ARTS[0].slug]));
  assert.deepEqual(mkt.cta, ARTS[0].cta);
  assert.equal(mkt.ogFallback, undefined);
  assert.equal(mkt.article.about, undefined);
});

test('(@slug) tokens link a published target and print plain text for a draft or unknown target', () => {
  const target = aeo(AEO_1, 'website');
  const source = aeo(AEO_2, 'engines', {
    tldr: 'See [the website check](@can-chatgpt-see-my-dealer-website).',
    sections: [{ type: 'qa', q: 'Q?', a: ['Read [the check](@can-chatgpt-see-my-dealer-website) and [a ghost](@no-such-article-slug).'] }],
    faq: [['Q?', 'Answer with [the check](@can-chatgpt-see-my-dealer-website).']],
  });
  const articles = [target, source];

  const draft = buildArticlePage(source, articles, state([AEO_2]));
  assert.equal(draft.tldr, 'See the website check.');
  assert.deepEqual(draft.sections[0].a, ['Read the check and a ghost.']);
  assert.equal(draft.faq[0][1], 'Answer with the check.');

  const live = buildArticlePage(source, articles, state([AEO_1, AEO_2]));
  assert.equal(live.tldr, `See [the website check](/aeo-geo/${AEO_1}/).`);
  assert.deepEqual(live.sections[0].a, [`Read [the check](/aeo-geo/${AEO_1}/) and a ghost.`]);
  // the content module itself is never mutated
  assert.match(source.tldr, /\(@can-chatgpt-see-my-dealer-website\)/);
});

test('hand-written internal hrefs to a draft article render as text; a site-aware gate drops unknown paths', () => {
  const draftTarget = art('renew-facebook-marketplace-car-listings', 'marketplace');
  const value = [
    'A [draft guide](/guide/renew-facebook-marketplace-car-listings/) and [the money page](/aeo-geo-for-car-dealers/#scan-form)',
    'and [a typo](/guid/nope/) and [an outside source](https://example.com/x).',
  ];
  const events = [];
  const gated = resolveBodyLinks(value, {
    articles: [draftTarget],
    state: state([]),
    isLinkablePath: (path) => path === '/aeo-geo-for-car-dealers/',
    onUnlinked: (event) => events.push(event.kind),
  });
  assert.deepEqual(gated, [
    'A draft guide and [the money page](/aeo-geo-for-car-dealers/#scan-form)',
    'and a typo and [an outside source](https://example.com/x).',
  ]);
  assert.deepEqual(events, ['draft-href', 'unknown-href']);
  // Published target: the hand-written href stays a link.
  const live = resolveBodyLinks(value[0], { articles: [draftTarget], state: state([draftTarget.slug]) });
  assert.equal(live, value[0]);
  // gatePageLinks returns a new page object and leaves the input alone
  const page = { title: 'T', tldr: value[0], sections: [{ type: 'prose', paras: [value[1]] }], faq: [] };
  const out = gatePageLinks(page, { articles: [draftTarget], state: state([]), isLinkablePath: () => false });
  assert.notEqual(out, page);
  assert.equal(out.tldr, 'A draft guide and the money page');
  assert.equal(page.tldr, value[0]);
});

test('absolute https://autolander.ai/<draft>/ hrefs are gated exactly like their root-relative form', () => {
  const draftAeo = aeo(AEO_1, 'website');
  const draftGuide = art('renew-facebook-marketplace-car-listings', 'marketplace');
  const articles = [draftAeo, draftGuide];
  const value = [
    `A [draft AEO guide](https://autolander.ai/aeo-geo/${AEO_1}/) and [www form](https://www.autolander.ai/aeo-geo/${AEO_1}/#faq)`,
    'and [a draft guide](https://autolander.ai/guide/renew-facebook-marketplace-car-listings/?utm_source=x)',
    'and [the money page](https://autolander.ai/aeo-geo-for-car-dealers/#scan-form) and [home](https://autolander.ai)',
    'and [a typo](https://autolander.ai/guid/nope/) and [a look-alike](https://autolander.ai.example.com/aeo-geo/x/)',
    'and [an outside source](https://example.com/aeo-geo/x/).',
  ];
  const events = [];
  const isLinkablePath = (path) => ['/', '/aeo-geo-for-car-dealers/'].includes(path);
  const gated = resolveBodyLinks(value, {
    articles,
    state: state([]),
    isLinkablePath,
    onUnlinked: (event) => events.push(`${event.kind} ${event.target}`),
  });
  assert.deepEqual(gated, [
    'A draft AEO guide and www form',
    'and a draft guide',
    'and [the money page](https://autolander.ai/aeo-geo-for-car-dealers/#scan-form) and [home](https://autolander.ai)',
    'and a typo and [a look-alike](https://autolander.ai.example.com/aeo-geo/x/)',
    'and [an outside source](https://example.com/aeo-geo/x/).',
  ]);
  assert.deepEqual(events, [
    `draft-href https://autolander.ai/aeo-geo/${AEO_1}/`,
    `draft-href https://www.autolander.ai/aeo-geo/${AEO_1}/#faq`,
    'draft-href https://autolander.ai/guide/renew-facebook-marketplace-car-listings/?utm_source=x',
    'unknown-href https://autolander.ai/guid/nope/',
  ]);

  // Same verdict as the root-relative form, link for link.
  const relative = resolveBodyLinks(`A [x](/aeo-geo/${AEO_1}/) b`, { articles, state: state([]), isLinkablePath });
  const absolute = resolveBodyLinks(`A [x](https://autolander.ai/aeo-geo/${AEO_1}/) b`, { articles, state: state([]), isLinkablePath });
  assert.equal(relative, 'A x b');
  assert.equal(absolute, relative);

  // Once the target is published, the absolute href stays a link and keeps its absolute form.
  const live = resolveBodyLinks(value[0], { articles, state: state([AEO_1]), isLinkablePath });
  assert.equal(live, value[0]);
  // And the article page builder applies it to tldr, sections and FAQ.
  const source = aeo(AEO_2, 'engines', {
    tldr: `Start with [the website check](https://autolander.ai/aeo-geo/${AEO_1}/).`,
    sections: [{ type: 'prose', paras: [`Read [it](https://autolander.ai/aeo-geo/${AEO_1}/).`] }],
    faq: [['Q?', `See [it](https://autolander.ai/aeo-geo/${AEO_1}/).`]],
  });
  const draftPage = buildArticlePage(source, [draftAeo, source], state([AEO_2]));
  assert.equal(draftPage.tldr, 'Start with the website check.');
  assert.deepEqual(draftPage.sections[0].paras, ['Read it.']);
  assert.equal(draftPage.faq[0][1], 'See it.');
  const livePage = buildArticlePage(source, [draftAeo, source], state([AEO_1, AEO_2]));
  assert.equal(livePage.tldr, source.tldr);
});

test('clustered siblings: same-cluster published siblings come first in "Keep exploring"', () => {
  const articles = [
    aeo(AEO_1, 'website'), aeo(AEO_2, 'engines'), aeo(AEO_3, 'buyers'),
    aeo(AEO_10, 'website'), aeo(AEO_11, 'engines'),
  ];
  const related = relatedForArticle(articles[1], articles, state([AEO_1, AEO_2, AEO_3, AEO_10, AEO_11]));
  const siblings = related.slice(SILOS.aeoGeo.related.length).map((link) => link.href);
  assert.deepEqual(siblings.slice(0, 1), [`/aeo-geo/${AEO_11}/`], 'the only other engines article leads');
  assert.equal(siblings.length, 4);
  assert.ok(siblings.every((href) => href.startsWith('/aeo-geo/')));
  // drafts never appear
  const onlyOne = relatedForArticle(articles[1], articles, state([AEO_2]));
  assert.deepEqual(onlyOne, SILOS.aeoGeo.related);
});

test('backlinkedFrom also finds (@slug) token back-linkers', () => {
  const articles = [
    aeo(AEO_1, 'website'),
    aeo(AEO_2, 'engines', { tldr: 'See [it](@can-chatgpt-see-my-dealer-website).' }),
    aeo(AEO_3, 'buyers', { alsoRelated: [AEO_1] }),
    aeo(AEO_10, 'website'),
  ];
  assert.deepEqual(backlinkedFrom(AEO_1, articles), [AEO_2, AEO_3]);
});

test('contentStatusJson drip rows carry silo order, cluster and the silo publish number', () => {
  const rows = contentStatusJson([
    aeo(AEO_2, 'engines', { publishOrder: 2 }),
    ARTS[0],
  ], state([])).articles;
  const row = rows.find((r) => r.slug === AEO_2);
  assert.equal(row.siloOrder, ADMIN_SILO_ORDER.indexOf('aeoGeo'));
  assert.equal(row.cluster, 'engines');
  assert.equal(row.clusterLabel, 'How each AI assistant picks a dealer');
  assert.equal(row.clusterOrder, 1);
  assert.equal(row.publishNumber, 2);
  assert.equal(row.path, `/aeo-geo/${AEO_2}/`);
  const mkt = rows.find((r) => r.slug === ARTS[0].slug);
  assert.equal(mkt.cluster, null);
  assert.equal(mkt.clusterLabel, null);
  assert.equal(mkt.publishNumber, null);
  assert.equal(mkt.siloOrder, ADMIN_SILO_ORDER.indexOf('marketplace'));
});

test('silo publish numbers are positions in SUGGESTED_ORDER and drift is reported', () => {
  const articles = [aeo(AEO_1, 'website', { publishOrder: 1 }), aeo(AEO_2, 'engines', { publishOrder: 2 })];
  assert.equal(siloPublishNumber(articles[1], articles), 2);
  assert.deepEqual(siloNumberingProblems(articles), []);
  const drifted = [aeo(AEO_1, 'website', { publishOrder: 2 }), aeo(AEO_2, 'engines', { publishOrder: 2 })];
  assert.equal(siloNumberingProblems(drifted).length, 1);
  assert.equal(clusterLabel('aeoGeo', 'nope'), null);
  assert.equal(clusterIndex('marketplace', 'website'), null);
});

test('articlePath keeps string callers under /guide/ and routes compare article objects', () => {
  assert.equal(articlePath('legacy-slug'), '/guide/legacy-slug/');
  assert.equal(
    articlePath({ slug: 'meta-muse-vs-autolander-vs-carvid', silo: 'compare' }),
    '/compare/meta-muse-vs-autolander-vs-carvid/',
  );
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

test('buildArticlePage routes a compare article and uses the Compare breadcrumb', () => {
  const content = art('meta-muse-vs-autolander-vs-carvid', 'compare');
  const st = state([content.slug]);
  const page = buildArticlePage(content, [content], st);
  assert.equal(page.path, '/compare/meta-muse-vs-autolander-vs-carvid/');
  assert.equal(page.breadcrumbs[1].name, SILOS.compare.crumb.name);
  assert.equal(page.breadcrumbs[2].url, `https://autolander.ai${page.path}`);
});

test('alsoRelated links require a published target and do not reduce sibling slots', () => {
  const source = art('post-a-car-on-facebook-marketplace-dealer', 'marketplace', {
    alsoRelated: ['meta-muse-vs-autolander-vs-carvid'],
  });
  const siblings = [
    art('best-time-to-post-cars-on-facebook-marketplace', 'marketplace'),
    art('facebook-marketplace-car-listing-limits', 'marketplace'),
    art('facebook-marketplace-car-listing-removed', 'marketplace'),
    art('renew-facebook-marketplace-car-listings', 'marketplace'),
  ];
  const target = art('meta-muse-vs-autolander-vs-carvid', 'compare');
  const articles = [source, ...siblings, target];
  const siblingSlugs = siblings.map((a) => a.slug);

  const whileDraft = relatedForArticle(source, articles, state(siblingSlugs));
  assert.equal(whileDraft.length, 8);
  assert.ok(whileDraft.every((link) => link.href !== articlePath(target)));

  const whilePublished = relatedForArticle(source, articles, state([...siblingSlugs, target.slug]));
  assert.equal(whilePublished.filter((link) => siblings.some((a) => link.href === articlePath(a))).length, 4);
  assert.equal(whilePublished.length, 9);
  assert.ok(whilePublished.some((link) => link.href === articlePath(target)));
});

test('hubAugmentLinks exposes only published articles, on the right hub keys', () => {
  const st = state(['post-a-car-on-facebook-marketplace-dealer', 'remove-background-from-car-photo']);
  const aug = hubAugmentLinks(ARTS, st);
  assert.ok(aug.get('dealers').some((l) => l.href === articlePath('post-a-car-on-facebook-marketplace-dealer')));
  assert.ok(aug.get('photoEditor').some((l) => l.href === articlePath('remove-background-from-car-photo')));
  assert.equal(aug.get('dealers').length, 1); // the draft marketplace articles stay invisible
  assert.ok(!aug.has('mktgHub')); // no growth article published -> no key at all
});

test('hubAugmentLinks adds per-article augmentKeys after the silo keys without duplicates', () => {
  const content = art('meta-muse-for-car-dealerships', 'compare', {
    augmentKeys: ['aiTools', 'aiDealers'],
  });
  const aug = hubAugmentLinks([content], state([content.slug]));
  assert.deepEqual([...aug.keys()], ['aiTools', 'aiDealers']);
  assert.deepEqual(aug.get('aiTools'), [{ href: articlePath(content), text: content.anchor }]);
  assert.deepEqual(aug.get('aiDealers'), [{ href: articlePath(content), text: content.anchor }]);
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

test('contentStatusJson uses the compare silo URL for compare articles', () => {
  const content = art('meta-muse-vs-autolander-vs-carvid', 'compare');
  const json = contentStatusJson([content], state([]));
  assert.equal(json.articles[0].path, '/compare/meta-muse-vs-autolander-vs-carvid/');
  assert.equal(json.articles[0].url, 'https://autolander.ai/compare/meta-muse-vs-autolander-vs-carvid/');
});

test('compareHubLinks and versusPageLinks list only published articles in drip order', () => {
  const meta = art('meta-muse-ai-agent-for-car-dealers', 'metaTools', {
    alsoOnCompetitors: ['carvid'],
  });
  const first = art('meta-muse-vs-autolander-vs-carvid', 'compare', {
    description: 'A neutral comparison.',
    alsoOnCompetitors: ['carvid'],
  });
  const second = art('meta-muse-for-car-dealerships', 'compare', {
    description: 'A dealership guide.',
    alsoOnCompetitors: ['carvid', 'relayauto'],
  });
  const articles = [second, first, meta];
  const st = state([meta.slug, first.slug]);

  assert.deepEqual(compareHubLinks(articles, st), [{
    href: articlePath(first),
    text: first.anchor,
    description: first.description,
  }]);
  assert.deepEqual(versusPageLinks(articles, st).get('carvid'), [
    { href: articlePath(meta), text: meta.anchor },
    { href: articlePath(first), text: first.anchor },
  ]);
  assert.ok(!versusPageLinks(articles, st).has('relayauto'));
});

test('backlinkedFrom returns articles whose alsoRelated names the target', () => {
  const target = 'meta-muse-vs-autolander-vs-carvid';
  const articles = [
    art('meta-muse-ai-agent-for-car-dealers', 'metaTools', { alsoRelated: [target] }),
    art('facebook-seller-app-for-car-dealers', 'metaTools'),
    art('meta-muse-for-car-dealerships', 'compare', { alsoRelated: [target, 'another-slug'] }),
  ];
  assert.deepEqual(backlinkedFrom(target, articles), [
    'meta-muse-ai-agent-for-car-dealers',
    'meta-muse-for-car-dealerships',
  ]);
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
