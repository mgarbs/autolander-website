// View helpers for the Content Publisher list: silo groups, cluster sub-groups, filtering and the
// remembered open/closed state. Pure functions (no React, no DOM), unit-tested under node --test
// in test/content-groups.test.js. Every row field comes from content-status.json (built by
// contentStatusJson in scripts/seo/articles/article-system.mjs and passed through verbatim by the
// Worker): silo, siloLabel, siloOrder, cluster, clusterLabel, clusterOrder, publishNumber,
// suggestedOrder, status, title, h1, primaryKeyword, secondaryKeywords, slug, path.

export const BLOG_STUDIO_GROUP_ID = 'blog-studio';
const OPEN_KEY_PREFIX = 'al_admin_content_open:';

// localStorage key for one group's open state (same al_admin_* family as the Dashboard sections).
export const contentOpenKey = (id) => `${OPEN_KEY_PREFIX}${id}`;
export const siloGroupId = (silo) => `silo:${silo}`;
export const clusterGroupId = (silo, cluster) => `cluster:${silo}:${cluster}`;

const num = (value, fallback = Number.MAX_SAFE_INTEGER) => (Number.isFinite(value) ? value : fallback);
const byOrder = (a, b) => num(a.suggestedOrder) - num(b.suggestedOrder) || String(a.slug).localeCompare(String(b.slug));

// "#N" shown on a row: the silo publish number when the silo numbers its articles (aeoGeo #1..#50),
// otherwise the global drip position the panel has always shown.
export function numberLabel(row) {
  if (Number.isInteger(row?.publishNumber)) return `#${row.publishNumber}`;
  return Number.isFinite(row?.suggestedOrder) ? `#${row.suggestedOrder}` : '#?';
}

const defaultState = (row) => (row?.status === 'published' ? 'published' : 'draft');

function counts(rows, stateOf) {
  let live = 0;
  let publishing = 0;
  let failed = 0;
  let drafts = 0;
  for (const row of rows) {
    const state = stateOf(row);
    if (row.status === 'published') live += 1;
    if (state === 'publishing') publishing += 1;
    else if (state === 'failed') failed += 1;
    else if (state === 'draft') drafts += 1;
  }
  return { live, total: rows.length, publishing, failed, drafts };
}

// rows -> [{ id, key, label, order, rows, clusters: [{ id, key, label, order, rows, ...counts,
// nextDraft }], ...counts, nextDraft }]. `rows` on a silo holds only the rows WITHOUT a cluster.
// stateOf(row) -> 'published' | 'publishing' | 'failed' | 'draft' (the panel's effective state).
export function groupDripArticles(rows, stateOf = defaultState) {
  const silos = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || row.kind === 'blog') continue;
    const key = row.silo || row.siloLabel || 'other';
    if (!silos.has(key)) silos.set(key, { key, label: row.siloLabel || key, siloOrder: row.siloOrder, all: [] });
    silos.get(key).all.push(row);
  }
  const groups = [...silos.values()].map((silo) => {
    const all = [...silo.all].sort(byOrder);
    const clusterMap = new Map();
    const loose = [];
    for (const row of all) {
      if (!row.cluster) { loose.push(row); continue; }
      if (!clusterMap.has(row.cluster)) {
        clusterMap.set(row.cluster, {
          id: clusterGroupId(silo.key, row.cluster),
          key: row.cluster,
          label: row.clusterLabel || row.cluster,
          order: num(row.clusterOrder),
          rows: [],
        });
      }
      clusterMap.get(row.cluster).rows.push(row);
    }
    const clusters = [...clusterMap.values()]
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
      .map((cluster) => ({
        ...cluster,
        ...counts(cluster.rows, stateOf),
        nextDraft: cluster.rows.find((row) => stateOf(row) === 'draft') || null,
      }));
    const siloOrder = Number.isFinite(silo.siloOrder) && silo.siloOrder >= 0 ? silo.siloOrder : null;
    return {
      id: siloGroupId(silo.key),
      key: silo.key,
      label: silo.label,
      order: siloOrder ?? 1000 + num(all[0]?.suggestedOrder, 0),
      rows: loose,
      allRows: all,
      clusters,
      ...counts(all, stateOf),
      nextDraft: all.find((row) => stateOf(row) === 'draft') || null,
    };
  });
  return groups.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

// Case-insensitive match over everything a person might type to find an article.
export function matchesQuery(row, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    row.title, row.h1, row.primaryKeyword, ...(Array.isArray(row.secondaryKeywords) ? row.secondaryKeywords : []),
    row.slug, row.path, row.siloLabel, row.clusterLabel, numberLabel(row),
  ].filter(Boolean).join(' \n ').toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export const STATUS_FILTERS = [
  ['all', 'All'],
  ['draft', 'Drafts'],
  ['live', 'Live'],
  ['attention', 'In flight or failed'],
];

export function matchesStatus(state, filter) {
  if (!filter || filter === 'all') return true;
  if (filter === 'draft') return state === 'draft';
  if (filter === 'live') return state === 'published';
  if (filter === 'attention') return state === 'publishing' || state === 'failed';
  return true;
}

// Apply a row predicate to grouped rows. Groups keep their FULL counts (live/total are facts
// about the silo, not the filter); visibleRows / visible clusters hold what to render, and
// groups with nothing visible are dropped.
export function filterGroups(groups, predicate) {
  const out = [];
  let matches = 0;
  for (const group of groups) {
    const visibleRows = group.rows.filter(predicate);
    const clusters = group.clusters
      .map((cluster) => ({ ...cluster, visibleRows: cluster.rows.filter(predicate) }))
      .filter((cluster) => cluster.visibleRows.length);
    const count = visibleRows.length + clusters.reduce((n, c) => n + c.visibleRows.length, 0);
    if (!count) continue;
    matches += count;
    out.push({ ...group, visibleRows, visibleClusters: clusters, matchCount: count });
  }
  return { groups: out, matches };
}

// Default open state before the owner has toggled anything: Blog Studio open (as it always was),
// the silo holding the global next-up open, aeoGeo open on a first visit, every other silo
// closed, and inside each silo only the cluster holding that silo's next draft open.
export function defaultOpenState(groups, nextUpSlug) {
  const open = { [BLOG_STUDIO_GROUP_ID]: true };
  for (const group of groups) {
    const holdsNext = group.allRows.some((row) => row.slug === nextUpSlug);
    open[group.id] = holdsNext || group.key === 'aeoGeo';
    for (const cluster of group.clusters) {
      open[cluster.id] = Boolean(group.nextDraft && cluster.rows.some((row) => row.slug === group.nextDraft.slug));
    }
  }
  return open;
}

// ---- open state while a filter is active ----
// A filter forces every matching group open and persists nothing, so clearing it restores the
// layout the owner left. The owner can still collapse a group WHILE filtering; that choice goes
// into a separate, unpersisted map tied to the filter it was made under (filterKey). Without it,
// React's `open` prop would stay true while the native <details> sat closed, and a group whose
// stored state is open came back stuck closed once the filter cleared (React saw no prop change,
// so it never reopened the element). With it, the prop always equals what the element shows.

// '' when no filter is active; otherwise a key that changes whenever the filter does.
export function filterKeyOf(query, status) {
  const q = String(query || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const s = status && status !== 'all' ? String(status) : '';
  return q || s ? `${s}|${q}` : '';
}

// Is group `id` open? Filtering (Blog Studio excepted): the owner's choice under THIS filter, else
// open. Not filtering: the remembered state, else the default, else closed.
export function groupOpen(id, { filterKey = '', filterOpen = null, openMap = {}, defaults = {} } = {}) {
  if (filterKey && id !== BLOG_STUDIO_GROUP_ID) {
    const own = filterOpen && filterOpen.key === filterKey ? filterOpen.map?.[id] : undefined;
    return typeof own === 'boolean' ? own : true;
  }
  if (typeof openMap?.[id] === 'boolean') return openMap[id];
  return Boolean(defaults?.[id]);
}

// Record a toggle made while filtering. A toggle under a different filter starts a fresh map.
export function withFilterToggle(filterOpen, filterKey, id, open) {
  const map = filterOpen && filterOpen.key === filterKey ? filterOpen.map : {};
  return { key: filterKey, map: { ...map, [id]: Boolean(open) } };
}

// Every group id on screen (for Expand all / Collapse all).
export function allGroupIds(groups) {
  return [BLOG_STUDIO_GROUP_ID, ...groups.flatMap((group) => [group.id, ...group.clusters.map((c) => c.id)])];
}

// Read every remembered open state. `storage` is window.localStorage in the browser; any access
// can throw in a locked-down context, in which case nothing is remembered.
export function readStoredOpenState(storage) {
  const out = {};
  try {
    if (!storage) return out;
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key || !key.startsWith(OPEN_KEY_PREFIX)) continue;
      const value = storage.getItem(key);
      if (value === 'true' || value === 'false') out[key.slice(OPEN_KEY_PREFIX.length)] = value === 'true';
    }
  } catch {
    return {};
  }
  return out;
}

export function writeStoredOpenState(storage, entries) {
  try {
    if (!storage) return;
    for (const [id, open] of Object.entries(entries)) storage.setItem(contentOpenKey(id), String(Boolean(open)));
  } catch {
    // Storage may be unavailable (private mode, blocked site data); the panel still works.
  }
}
