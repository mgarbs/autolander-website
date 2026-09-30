// Content Publisher view helpers: silo groups, cluster sub-groups, filtering, default and
// remembered open state (src/admin/lib/content-groups.js).
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BLOG_STUDIO_GROUP_ID, allGroupIds, clusterGroupId, contentOpenKey, defaultOpenState, filterGroups, filterKeyOf,
  groupDripArticles, groupOpen, matchesQuery, matchesStatus, numberLabel, readStoredOpenState, siloGroupId,
  withFilterToggle, writeStoredOpenState,
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

// ---- open state while filtering (2026-09-30 fix) ----------------------------------------------
// A model of one <details> group in ContentPublisher.jsx: React sets the element's `open` only when
// the prop it renders CHANGES; a click flips the element and fires `toggle`, which runs the panel's
// handler (the same code as ContentPublisher's onToggleFor, over the real helpers). The invariant the
// panel needs: after every step the element shows exactly what React renders.
function panel({ stored = {}, defaults = {} } = {}) {
  const s = { query: '', status: 'all', openMap: { ...stored }, filterOpen: null, dom: {}, prop: {} };
  const key = () => filterKeyOf(s.query, s.status);
  const isOpen = (id) => groupOpen(id, { filterKey: key(), filterOpen: s.filterOpen, openMap: s.openMap, defaults });
  const render = (ids) => {
    for (const id of ids) {
      const next = isOpen(id);
      if (s.prop[id] !== next) s.dom[id] = next; // React writes `open` only on a prop change
      s.prop[id] = next;
    }
  };
  const onToggle = (id) => {
    const next = s.dom[id];
    if (next === isOpen(id)) return;
    if (key() && id !== BLOG_STUDIO_GROUP_ID) s.filterOpen = withFilterToggle(s.filterOpen, key(), id, next);
    else s.openMap[id] = next;
  };
  return {
    s,
    render,
    click(id, ids) { s.dom[id] = !s.dom[id]; onToggle(id); render(ids); },
    filter(query, status, ids) {
      s.query = query;
      s.status = status;
      if (!filterKeyOf(query, status)) s.filterOpen = null;
      render(ids);
    },
  };
}

test('filterKeyOf: empty when no filter, and changes with the query or the status filter', () => {
  assert.equal(filterKeyOf('', 'all'), '');
  assert.equal(filterKeyOf('   ', undefined), '');
  assert.notEqual(filterKeyOf('chatgpt', 'all'), '');
  assert.equal(filterKeyOf(' ChatGPT  crawler ', 'all'), filterKeyOf('chatgpt crawler', 'all'));
  assert.notEqual(filterKeyOf('chatgpt', 'all'), filterKeyOf('chatgpt', 'draft'));
  assert.notEqual(filterKeyOf('', 'draft'), '');
});

test('groupOpen: stored, then default, then closed; filtering opens every group except Blog Studio unless collapsed under this filter', () => {
  const silo = siloGroupId('aeoGeo');
  assert.equal(groupOpen(silo, { openMap: { [silo]: false }, defaults: { [silo]: true } }), false);
  assert.equal(groupOpen(silo, { openMap: {}, defaults: { [silo]: true } }), true);
  assert.equal(groupOpen(silo, {}), false);
  const key = filterKeyOf('chatgpt', 'all');
  assert.equal(groupOpen(silo, { filterKey: key, openMap: { [silo]: false } }), true, 'forced open while filtering');
  assert.equal(groupOpen(BLOG_STUDIO_GROUP_ID, { filterKey: key, openMap: { [BLOG_STUDIO_GROUP_ID]: false } }), false, 'Blog Studio is never forced');
  const toggled = withFilterToggle(null, key, silo, false);
  assert.deepEqual(toggled, { key, map: { [silo]: false } });
  assert.equal(groupOpen(silo, { filterKey: key, filterOpen: toggled }), false, 'collapsed under this filter');
  assert.equal(groupOpen(silo, { filterKey: filterKeyOf('claude', 'all'), filterOpen: toggled }), true, 'a new filter starts open');
  assert.deepEqual(withFilterToggle(toggled, filterKeyOf('claude', 'all'), 'x', true), { key: filterKeyOf('claude', 'all'), map: { x: true } });
});

test('collapsing a group while filtering keeps <details> and React in sync; nothing is stuck closed when the filter clears', () => {
  const silo = siloGroupId('aeoGeo');
  const cluster = clusterGroupId('aeoGeo', 'website');
  const ids = [BLOG_STUDIO_GROUP_ID, silo, cluster];
  const synced = (p, label) => {
    for (const id of ids) assert.equal(p.s.dom[id], p.s.prop[id], `${label}: ${id} shows ${p.s.dom[id]} but React renders ${p.s.prop[id]}`);
  };

  // The owner left the silo OPEN and the cluster CLOSED (stored), then filters.
  const p = panel({ stored: { [silo]: true, [cluster]: false }, defaults: { [BLOG_STUDIO_GROUP_ID]: true } });
  p.render(ids);
  assert.equal(p.s.dom[silo], true);
  p.filter('website', 'all', ids);
  assert.equal(p.s.dom[cluster], true, 'filtering opens matching groups');
  synced(p, 'filter on');

  // Collapse the silo and the cluster while filtering: the element and React agree, nothing is stored.
  p.click(silo, ids);
  p.click(cluster, ids);
  assert.equal(p.s.dom[silo], false);
  synced(p, 'collapsed while filtering');
  assert.deepEqual(p.s.openMap, { [silo]: true, [cluster]: false }, 'filter toggles are never persisted');

  // Clear the filter: the silo is open again (its stored state), the cluster closed (its stored state).
  p.filter('', 'all', ids);
  assert.equal(p.s.dom[silo], true, 'the silo must not come back stuck closed');
  assert.equal(p.s.dom[cluster], false);
  synced(p, 'filter cleared');
  assert.equal(p.s.filterOpen, null);

  // A new filter starts with every matching group open again.
  p.filter('engines', 'draft', ids);
  assert.equal(p.s.dom[silo], true);
  synced(p, 'new filter');
  // Changing the filter while a group is collapsed under the old one reopens it too.
  p.click(silo, ids);
  p.filter('engines two', 'draft', ids);
  assert.equal(p.s.dom[silo], true);
  synced(p, 'filter changed');

  // Blog Studio is never forced by a filter, and its toggles are remembered as usual.
  p.click(BLOG_STUDIO_GROUP_ID, ids);
  assert.equal(p.s.openMap[BLOG_STUDIO_GROUP_ID], false);
  synced(p, 'blog studio');

  // Without a filter, a click is persisted and stays in sync.
  p.filter('', 'all', ids);
  p.click(silo, ids);
  assert.equal(p.s.openMap[silo], false);
  synced(p, 'plain toggle');
});
