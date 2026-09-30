import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import BlogStudio from './BlogStudio.jsx';
import { ApiError, apiGet, apiPost } from './lib/api.js';
import { filterDripArticles, isBlogActivityInFlight } from './lib/blog-studio.js';
import {
  BLOG_STUDIO_GROUP_ID, STATUS_FILTERS, allGroupIds, defaultOpenState, filterGroups,
  groupDripArticles, matchesQuery, matchesStatus, numberLabel, readStoredOpenState, writeStoredOpenState,
} from './lib/content-groups.js';

// Content Publisher — the Avalanche article drip console.
// Lists every prepared article (draft + live) from /admin/content and publishes one at a
// time: Publish → confirm → the Worker dispatches the publish-article GitHub workflow →
// the article + its silo links + sitemap + IndexNow ping all happen in that workflow.
// While a run is in flight the row shows "publishing…" and the list polls until the
// status JSON on main flips to published.
//
// Layout (2026-09-30): Blog Studio and every silo are collapsible native <details> groups, and a
// silo with clusters (AEO and GEO, 50 articles) nests one group per cluster. Groups stay MOUNTED
// when closed, so a half-typed Blog Studio brief, a pending Confirm and an in-flight row survive a
// collapse; the summary pills surface anything publishing or failed inside a closed group. Open
// state is remembered per group in localStorage (guarded: it can throw in locked-down browsers).
// Publishing, polling, "Next up" and the live count are computed from the unfiltered list; the
// grouping and the filter are view-only.

const POLL_MS = 15_000;
// How long a finished run keeps a row in the "publishing" state while the status read
// catches up. Bounded so a genuinely reverted article can't pin the panel polling forever.
const SETTLE_WINDOW_MS = 15 * 60 * 1000;

function chip(status) {
  if (status === 'published') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'publishing') return 'bg-amber-500/15 text-amber-300 border-amber-400/30 animate-pulse';
  if (status === 'failed') return 'bg-red-500/15 text-red-300 border-red-400/30';
  return 'bg-white/[0.06] text-slate-400 border-white/10';
}

// A run "belongs" to a slug when its display title is `publish: <slug>` (run-name in the
// workflow). Queued/in-progress runs mark the slug as publishing; a fresh failure surfaces.
function runFor(runs, slug) {
  return (runs || []).find((r) => (r.title || '').trim() === `publish: ${slug}`);
}

function browserStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function GroupPills({ group }) {
  return (
    <>
      {group.publishing > 0 && (
        <span className="shrink-0 animate-pulse rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
          {group.publishing} publishing
        </span>
      )}
      {group.failed > 0 && (
        <span className="shrink-0 rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-300">
          {group.failed} failed
        </span>
      )}
    </>
  );
}

export default function ContentPublisher({ onUnauthorized }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState(0); // wall clock stamped when data arrives, not during render
  const [confirmSlug, setConfirmSlug] = useState('');
  const [dispatched, setDispatched] = useState({}); // slug -> true (optimistic until runs/status catch up)
  const [blogBusy, setBlogBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [openMap, setOpenMap] = useState(() => readStoredOpenState(browserStorage()));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const timerRef = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const resp = await apiGet('/admin/content');
      setData(resp);
      setLoadedAt(Date.now());
      setError('');
      // Drop optimistic flags once the backend reflects them.
      setDispatched((cur) => {
        const next = { ...cur };
        for (const slug of Object.keys(next)) {
          const art = (resp?.articles || []).find((a) => a.slug === slug);
          const run = runFor(resp?.runs, slug);
          if (art?.status === 'published' || run) delete next[slug];
        }
        return next;
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        return;
      }
      setError(err?.serverMessage || err?.message || 'Could not load content status.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const dripArticles = useMemo(() => filterDripArticles(data?.articles), [data]);

  // One place decides what each row is doing. The case that matters: a run that COMPLETED
  // SUCCESSFULLY while the status file still reads draft. The article IS live — only the
  // status read is catching up. Offering "Publish" in that window made a successful publish
  // look like it had failed and reset, so it stays "publishing" and keeps polling until the
  // row flips to live on its own.
  const effective = useMemo(() => {
    const map = new Map();
    for (const a of dripArticles) {
      const run = runFor(data?.runs, a.slug);
      if (a.status === 'published') { map.set(a.slug, { state: 'published', run }); continue; }
      const running = run?.status === 'queued' || run?.status === 'in_progress';
      const recent = run?.createdAt && loadedAt
        && (loadedAt - new Date(run.createdAt).getTime() < SETTLE_WINDOW_MS);
      const settling = Boolean(recent && run.status === 'completed' && run.conclusion === 'success');
      if (dispatched[a.slug] || running || settling) { map.set(a.slug, { state: 'publishing', run }); continue; }
      if (run?.conclusion === 'failure') { map.set(a.slug, { state: 'failed', run }); continue; }
      map.set(a.slug, { state: 'draft', run });
    }
    return map;
  }, [data, dispatched, dripArticles, loadedAt]);

  // Poll while anything is in flight so rows flip to Live on their own.
  const anyInFlight = useMemo(() => (
    [...effective.values()].some((v) => v.state === 'publishing')
    || blogBusy
    || isBlogActivityInFlight(data)
  ), [blogBusy, data, effective]);

  useEffect(() => {
    if (!anyInFlight) return undefined;
    timerRef.current = window.setInterval(() => load({ silent: true }), POLL_MS);
    return () => window.clearInterval(timerRef.current);
  }, [anyInFlight, load]);

  const publish = useCallback(async (slug) => {
    setConfirmSlug('');
    setNotice('');
    setDispatched((cur) => ({ ...cur, [slug]: true }));
    try {
      const resp = await apiPost('/admin/content/publish', { slug });
      setNotice(resp?.message || `Publishing ${slug}…`);
    } catch (err) {
      setDispatched((cur) => {
        const next = { ...cur };
        delete next[slug];
        return next;
      });
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        return;
      }
      setError(err?.serverMessage || err?.message || `Could not publish ${slug}.`);
    }
  }, [onUnauthorized]);

  const liveCount = dripArticles.filter((a) => a.status === 'published').length;
  // "Next up" = the lowest drip-order row that is still a plain draft (not in flight, not
  // failed). The list is already sorted by suggestedOrder, so the first match is the answer.
  const nextUp = useMemo(
    () => dripArticles.find((a) => (effective.get(a.slug)?.state || 'draft') === 'draft') || null,
    [dripArticles, effective],
  );

  // ---- view: silo groups, cluster sub-groups, filter, remembered open state ----
  const stateOf = useCallback((row) => effective.get(row.slug)?.state || 'draft', [effective]);
  const groups = useMemo(() => groupDripArticles(dripArticles, stateOf), [dripArticles, stateOf]);
  const defaults = useMemo(() => defaultOpenState(groups, nextUp?.slug), [groups, nextUp]);
  const filtering = Boolean(query.trim()) || statusFilter !== 'all';
  const view = useMemo(
    () => filterGroups(groups, (row) => matchesQuery(row, query) && matchesStatus(stateOf(row), statusFilter)),
    [groups, query, stateOf, statusFilter],
  );
  const blogInFlight = blogBusy || isBlogActivityInFlight(data);

  // While a filter is active every matching group is forced open and nothing is persisted, so
  // clearing the filter restores exactly the layout the owner left.
  const isOpen = (id) => {
    if (filtering && id !== BLOG_STUDIO_GROUP_ID) return true;
    return openMap[id] ?? defaults[id] ?? false;
  };
  const setOpen = useCallback((entries) => {
    setOpenMap((cur) => ({ ...cur, ...entries }));
    writeStoredOpenState(browserStorage(), entries);
  }, []);
  // <details> fires `toggle` for user clicks AND when React changes `open`; only a real change
  // on this element is recorded (React also hands a nested group's toggle to its parent).
  const onToggleFor = (id) => (event) => {
    if (event.target !== event.currentTarget) return;
    if (filtering && id !== BLOG_STUDIO_GROUP_ID) return;
    const next = event.currentTarget.open;
    if (next !== isOpen(id)) setOpen({ [id]: next });
  };
  const setAllOpen = (value) => {
    setOpen(Object.fromEntries(allGroupIds(groups).map((id) => [id, value])));
  };

  const renderRow = (a) => {
    const { state: status, run } = effective.get(a.slug) || { state: 'draft' };
    const failed = status === 'failed';
    return (
      <li key={a.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="w-8 shrink-0 text-right text-[10px] font-black text-slate-600">{numberLabel(a)}</span>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${chip(status)}`}>
          {status === 'published' ? `live ${a.publishedAt || ''}` : status === 'publishing' ? 'publishing…' : status}
        </span>
        <span className="min-w-0 flex-1">
          {a.status === 'published' ? (
            <a href={a.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold text-white hover:text-blue-300">
              {a.title}
            </a>
          ) : (
            <span className="block truncate text-sm font-bold text-slate-200">{a.title}</span>
          )}
          <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {a.primaryKeyword}
          </span>
          <span className="block truncate font-mono text-[10px] text-slate-600">
            {a.path}{a.status !== 'published' && a.clusterLabel ? ` · ${a.clusterLabel}` : ''}
          </span>
        </span>
        {failed && run?.url && (
          <a href={run.url} target="_blank" rel="noreferrer" className="shrink-0 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300">
            last run failed ↗
          </a>
        )}
        {(status === 'draft' || status === 'failed') && data?.canPublish && (
          confirmSlug === a.slug ? (
            <span className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => publish(a.slug)}
                className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/25"
              >
                Confirm: go live
              </button>
              <button
                type="button"
                onClick={() => setConfirmSlug('')}
                className="rounded-lg border border-white/10 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmSlug(a.slug)}
              className="shrink-0 rounded-lg border border-blue-400/40 bg-blue-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-300 hover:bg-blue-500/25"
            >
              Publish
            </button>
          )
        )}
      </li>
    );
  };

  if (loading) {
    return <div className="px-5 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading content…</div>;
  }

  const summaryClass = 'flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden';
  const toolButton = 'rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="space-y-4 px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {liveCount}/{dripArticles.length} live · drip one at a time · publish → silo links + homepage directory + sitemap + IndexNow, automatically
        </p>
        <button type="button" onClick={() => load({ silent: true })} className={toolButton}>
          Refresh
        </button>
      </div>

      <details
        open={isOpen(BLOG_STUDIO_GROUP_ID)}
        onToggle={onToggleFor(BLOG_STUDIO_GROUP_ID)}
        className="group/blog rounded-xl border border-white/10"
      >
        <summary className={`${summaryClass} px-4 py-2`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">AI Blog Studio</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">write and publish blog posts</span>
          {blogInFlight && (
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" title="Blog Studio is working" aria-label="Blog Studio is working" />
          )}
          <ChevronDown size={16} aria-hidden="true" className="ml-auto shrink-0 text-slate-500 transition-transform group-open/blog:rotate-180" />
        </summary>
        <div className="px-2 pb-2 sm:px-3 sm:pb-3">
          <BlogStudio
            data={data}
            reload={load}
            onUnauthorized={onUnauthorized}
            onBusyChange={setBlogBusy}
          />
        </div>
      </details>

      {nextUp && (
        <p className="rounded-xl border border-blue-400/20 bg-blue-500/[0.06] px-4 py-3 text-xs font-bold text-blue-200">
          <span className="mr-2 text-[10px] font-black uppercase tracking-widest text-blue-400">Next up</span>
          <span className="text-white">{numberLabel(nextUp)} {nextUp.title}</span>
          <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{nextUp.siloLabel}</span>
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">{error}</p>
      )}
      {notice && !error && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-300">{notice}</p>
      )}
      {data && !data.canPublish && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-200">
          Read-only: the Worker has no GITHUB_TOKEN secret yet. Set it (fine-grained PAT for
          mgarbs/autolander-website with Actions + Contents write) via `wrangler secret put GITHUB_TOKEN`
          to enable one-click publishing.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          aria-label="Filter articles"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter: title, keyword, slug, cluster or #"
          className="min-h-9 min-w-0 flex-1 basis-56 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60"
        />
        <select
          aria-label="Status filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="min-h-9 rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-400/60"
        >
          {STATUS_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={() => setAllOpen(true)} disabled={filtering} className={toolButton}>
          Expand all
        </button>
        <button type="button" onClick={() => setAllOpen(false)} disabled={filtering} className={toolButton}>
          Collapse all
        </button>
      </div>
      {filtering && (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500" aria-live="polite">
          {view.matches} {view.matches === 1 ? 'match' : 'matches'}
        </p>
      )}

      {view.groups.map((group) => (
        <details
          key={group.id}
          open={isOpen(group.id)}
          onToggle={onToggleFor(group.id)}
          className="group/silo overflow-hidden rounded-xl border border-white/10"
        >
          <summary className={`${summaryClass} border-b border-white/10 bg-white/[0.03] px-4 py-2`}>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{group.label}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.live}/{group.total} live{group.drafts ? ` · ${group.drafts} draft${group.drafts === 1 ? '' : 's'}` : ''}
            </span>
            <GroupPills group={group} />
            {group.nextDraft && (
              <span className="min-w-0 truncate text-[10px] font-bold text-blue-300/80">
                next: {numberLabel(group.nextDraft)} {group.nextDraft.title}
              </span>
            )}
            <ChevronDown size={16} aria-hidden="true" className="ml-auto shrink-0 text-slate-500 transition-transform group-open/silo:rotate-180" />
          </summary>
          {group.clusters.length > 0 && (
            <p className="px-4 pt-2 text-[10px] font-bold text-slate-500">
              Publish in number order: in-body links only point to lower numbers, so no page ever links a draft.
            </p>
          )}
          {group.visibleRows.length > 0 && (
            <ul className="divide-y divide-white/5">{group.visibleRows.map(renderRow)}</ul>
          )}
          {group.visibleClusters.length > 0 && (
            <div className="space-y-2 p-2 sm:p-3">
              {group.visibleClusters.map((cluster) => (
                <details
                  key={cluster.id}
                  open={isOpen(cluster.id)}
                  onToggle={onToggleFor(cluster.id)}
                  className="group/cluster overflow-hidden rounded-lg border border-white/5 bg-black/10"
                >
                  <summary className={`${summaryClass} px-3 py-2`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cluster.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {cluster.live}/{cluster.total} live
                    </span>
                    <GroupPills group={cluster} />
                    {cluster.nextDraft && (
                      <span className="min-w-0 truncate text-[10px] font-bold text-slate-500">
                        next: {numberLabel(cluster.nextDraft)}
                      </span>
                    )}
                    <ChevronDown size={14} aria-hidden="true" className="ml-auto shrink-0 text-slate-600 transition-transform group-open/cluster:rotate-180" />
                  </summary>
                  <ul className="divide-y divide-white/5 border-t border-white/5">{cluster.visibleRows.map(renderRow)}</ul>
                </details>
              ))}
            </div>
          )}
        </details>
      ))}
      {filtering && !view.groups.length && (
        <p className="rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-slate-500">No articles match this filter.</p>
      )}
    </div>
  );
}
