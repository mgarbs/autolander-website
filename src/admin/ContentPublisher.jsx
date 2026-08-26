import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, apiGet, apiPost } from './lib/api.js';

// Content Publisher — the Avalanche article drip console.
// Lists every prepared article (draft + live) from /admin/content and publishes one at a
// time: Publish → confirm → the Worker dispatches the publish-article GitHub workflow →
// the article + its silo links + sitemap + IndexNow ping all happen in that workflow.
// While a run is in flight the row shows "publishing…" and the list polls until the
// status JSON on main flips to published.

const POLL_MS = 20_000;

function chip(status) {
  if (status === 'published') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'publishing') return 'bg-amber-500/15 text-amber-300 border-amber-400/30 animate-pulse';
  return 'bg-white/[0.06] text-slate-400 border-white/10';
}

// A run "belongs" to a slug when its display title is `publish: <slug>` (run-name in the
// workflow). Queued/in-progress runs mark the slug as publishing; a fresh failure surfaces.
function runFor(runs, slug) {
  return (runs || []).find((r) => (r.title || '').trim() === `publish: ${slug}`);
}

export default function ContentPublisher({ onUnauthorized }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmSlug, setConfirmSlug] = useState('');
  const [dispatched, setDispatched] = useState({}); // slug -> true (optimistic until runs/status catch up)
  const [notice, setNotice] = useState('');
  const timerRef = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const resp = await apiGet('/admin/content');
      setData(resp);
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

  // Poll while anything is in flight so rows flip to Live on their own.
  const anyInFlight = useMemo(() => {
    if (!data) return false;
    if (Object.keys(dispatched).length) return true;
    return (data.runs || []).some((r) => r.status === 'queued' || r.status === 'in_progress');
  }, [data, dispatched]);

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

  const articles = useMemo(() => data?.articles || [], [data]);
  const liveCount = articles.filter((a) => a.status === 'published').length;
  const silos = useMemo(() => {
    const bySilo = new Map();
    for (const a of articles) {
      if (!bySilo.has(a.siloLabel)) bySilo.set(a.siloLabel, []);
      bySilo.get(a.siloLabel).push(a);
    }
    return [...bySilo.entries()];
  }, [articles]);

  if (loading) {
    return <div className="px-5 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading content…</div>;
  }

  return (
    <div className="space-y-4 px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {liveCount}/{articles.length} live · drip one at a time · publish → silo links + sitemap + IndexNow, automatically
        </p>
        <button
          type="button"
          onClick={() => load({ silent: true })}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
        >
          Refresh
        </button>
      </div>

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

      {silos.map(([siloLabel, list]) => (
        <div key={siloLabel} className="overflow-hidden rounded-xl border border-white/10">
          <p className="border-b border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {siloLabel} · {list.filter((a) => a.status === 'published').length}/{list.length} live
          </p>
          <ul className="divide-y divide-white/5">
            {list.map((a) => {
              const run = runFor(data?.runs, a.slug);
              const inFlight = a.status !== 'published'
                && (dispatched[a.slug] || run?.status === 'queued' || run?.status === 'in_progress');
              const failed = a.status !== 'published' && !inFlight && run?.conclusion === 'failure';
              const status = a.status === 'published' ? 'published' : inFlight ? 'publishing' : 'draft';
              return (
                <li key={a.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="w-6 shrink-0 text-right text-[10px] font-black text-slate-600">{a.suggestedOrder}</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${chip(status)}`}>
                    {status === 'published' ? `live ${a.publishedAt || ''}` : status}
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
                  </span>
                  {failed && run?.url && (
                    <a href={run.url} target="_blank" rel="noreferrer" className="shrink-0 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300">
                      last run failed ↗
                    </a>
                  )}
                  {a.status !== 'published' && !inFlight && data?.canPublish && (
                    confirmSlug === a.slug ? (
                      <span className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => publish(a.slug)}
                          className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/25"
                        >
                          Confirm — go live
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
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
