// Content Publisher view helpers: silo groups, cluster sub-groups, filtering, default and
// remembered open state (src/admin/lib/content-groups.js).
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BLOG_STUDIO_GROUP_ID, allGroupIds, clusterGroupId, contentOpenKey, defaultOpenState, filterGroups,
  groupDripArticles, matchesQuery, matchesStatus, numberLabel, readStoredOpenState, siloGroupId,
  writeStoredOpenState,
} from '../src/admin/lib/content-groups.js';

const row = (slug, silo, extra = {}) => ({
  slug,
  kind: 'drip',
  silo,
  siloLabel: `${silo} label`,
  title: `Title ${slug}`,
  h1: `H1 ${slug}`,
  primaryKeyword: `kw ${slug}`,
  secondaryKeywords: [],
  path: `/guide/${slug}/`,
  status: 'draft',
  cluster: null,
  clusterLabel: null,
  clusterOrder: null,
  publishNumber: null,
  ...extra,
});
const aeo = (slug, n, cluster, clusterOrder, extra = {}) => row(slug, 'aeoGeo', {
  siloLabel: 'AEO and GEO for car dealers',
  siloOrder: 0,
  suggestedOrder: 36 + n,
  publishNumber: n,
  cluster,
  clusterLabel: `${cluster} label`,
  clusterOrder,
  path: `/aeo-geo/${slug}/`,
  ...extra,
});

const ROWS = [
  row('mkt-live', 'marketplace', { siloOrder: 3, suggestedOrder: 1, status: 'published' }),
  row('mkt-draft', 'marketplace', { siloOrder: 3, suggestedOrder: 32 }),
  aeo('engines-one', 2, 'engines', 1),
  aeo('website-one', 1, 'website', 0, { status: 'published' }),
  aeo('website-two', 10, 'website', 0),
  aeo('engines-two', 11, 'engines', 1),
  { slug: 'a-blog-post', kind: 'blog', silo: 'blog', status: 'draft' },
];

test('groups silos by siloOrder, clusters by clusterOrder, rows by drip order; blog rows excluded', () => {
  const groups = groupDripArticles(ROWS);
  assert.deepEqual(groups.map((g) => g.id), [siloGroupId('aeoGeo'), siloGroupId('marketplace')]);
  const [aeoGroup, mkt] = groups;
  assert.deepEqual(aeoGroup.rows, [], 'clustered rows live in their cluster');
  assert.deepEqual(aeoGroup.clusters.map((c) => c.id), [clusterGroupId('aeoGeo', 'website'), clusterGroupId('aeoGeo', 'engines')]);
  assert.deepEqual(aeoGroup.clusters[0].rows.map((r) => r.slug), ['website-one', 'website-two']);
  assert.deepEqual(aeoGroup.clusters[1].rows.map((r) => r.slug), ['engines-one', 'engines-two']);
  assert.equal(aeoGroup.live, 1);
  assert.equal(aeoGroup.total, 4);
  assert.equal(aeoGroup.drafts, 3);
  assert.equal(aeoGroup.clusters[0].live, 1);
  assert.equal(aeoGroup.clusters[0].total, 2);
  assert.equal(aeoGroup.nextDraft.slug, 'engines-one', 'lowest drip order draft in the silo');
  assert.equal(aeoGroup.clusters[0].nextDraft.slug, 'website-two');
  assert.deepEqual(mkt.rows.map((r) => r.slug), ['mkt-live', 'mkt-draft']);
  assert.deepEqual(mkt.clusters, []);
});

test('the effective state drives in-flight and failed counts without changing live counts', () => {
  const stateOf = (r) => ({ 'website-two': 'publishing', 'engines-two': 'failed' }[r.slug]
    || (r.status === 'published' ? 'published' : 'draft'));
  const [aeoGroup] = groupDripArticles(ROWS, stateOf);
  assert.equal(aeoGroup.publishing, 1);
  assert.equal(aeoGroup.failed, 1);
  assert.equal(aeoGroup.drafts, 1);
  assert.equal(aeoGroup.live, 1);
  assert.equal(aeoGroup.clusters[0].publishing, 1);
  assert.equal(aeoGroup.clusters[0].nextDraft, null, 'a publishing row is not the next draft');
});

test('number labels: the silo publish number for aeoGeo, the drip position otherwise', () => {
  assert.equal(numberLabel(ROWS[2]), '#2');
  assert.equal(numberLabel(ROWS[1]), '#32');
  assert.equal(numberLabel({}), '#?');
});

test('matchesQuery searches title, keywords, slug, path, silo, cluster and number; every word must hit', () => {
  const r = aeo('google-ai-overviews-for-car-dealers', 11, 'engines', 1, {
    title: 'Google AI Overviews for car dealers', secondaryKeywords: ['ai overview dealership'],
  });
  assert.ok(matchesQuery(r, ''));
  assert.ok(matchesQuery(r, 'overviews'));
  assert.ok(matchesQuery(r, 'AI OVERVIEW dealership'));
  assert.ok(matchesQuery(r, '/aeo-geo/google'));
  assert.ok(matchesQuery(r, 'engines label'));
  assert.ok(matchesQuery(r, '#11'));
  assert.ok(!matchesQuery(r, 'overviews craigslist'));
});

test('matchesStatus maps the status filter onto effective states', () => {
  assert.ok(matchesStatus('draft', 'all'));
  assert.ok(matchesStatus('draft', 'draft'));
  assert.ok(!matchesStatus('published', 'draft'));
  assert.ok(matchesStatus('published', 'live'));
  assert.ok(matchesStatus('publishing', 'attention'));
  assert.ok(matchesStatus('failed', 'attention'));
  assert.ok(!matchesStatus('draft', 'attention'));
});

test('filterGroups keeps full counts, hides empty clusters and silos, and counts matches', () => {
  const groups = groupDripArticles(ROWS);
  const { groups: shown, matches } = filterGroups(groups, (r) => r.slug.startsWith('engines'));
  assert.equal(matches, 2);
  assert.deepEqual(shown.map((g) => g.id), [siloGroupId('aeoGeo')]);
  assert.deepEqual(shown[0].visibleClusters.map((c) => c.key), ['engines']);
  assert.equal(shown[0].total, 4, 'counts describe the silo, not the filter');
  assert.deepEqual(filterGroups(groups, () => false), { groups: [], matches: 0 });
});

test('default open state: Blog Studio, the next-up silo and aeoGeo open; only the next-draft cluster open', () => {
  const groups = groupDripArticles(ROWS);
  const open = defaultOpenState(groups, 'mkt-draft');
  assert.equal(open[BLOG_STUDIO_GROUP_ID], true);
  assert.equal(open[siloGroupId('marketplace')], true, 'holds the global next-up');
  assert.equal(open[siloGroupId('aeoGeo')], true, 'open on a first visit');
  assert.equal(open[clusterGroupId('aeoGeo', 'engines')], true, 'holds the silo next draft');
  assert.equal(open[clusterGroupId('aeoGeo', 'website')], false);
  const other = defaultOpenState(groupDripArticles(ROWS.filter((r) => r.silo === 'marketplace')), 'nothing');
  assert.equal(other[siloGroupId('marketplace')], false);
  assert.deepEqual(allGroupIds(groups), [
    BLOG_STUDIO_GROUP_ID, siloGroupId('aeoGeo'), clusterGroupId('aeoGeo', 'website'), clusterGroupId('aeoGeo', 'engines'),
    siloGroupId('marketplace'),
  ]);
});

test('open state round-trips through storage under al_admin_content_open:* and survives a throwing storage', () => {
  const map = new Map([['unrelated', 'x']]);
  const storage = {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
  };
  writeStoredOpenState(storage, { [siloGroupId('aeoGeo')]: false, [BLOG_STUDIO_GROUP_ID]: true });
  assert.equal(map.get(contentOpenKey(siloGroupId('aeoGeo'))), 'false');
  assert.equal(contentOpenKey('x'), 'al_admin_content_open:x');
  assert.deepEqual(readStoredOpenState(storage), { [siloGroupId('aeoGeo')]: false, [BLOG_STUDIO_GROUP_ID]: true });

  const throwing = {
    get length() { throw new Error('SecurityError'); },
    key() { throw new Error('SecurityError'); },
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
  };
  assert.deepEqual(readStoredOpenState(throwing), {});
  assert.doesNotThrow(() => writeStoredOpenState(throwing, { a: true }));
  assert.deepEqual(readStoredOpenState(null), {});
});
