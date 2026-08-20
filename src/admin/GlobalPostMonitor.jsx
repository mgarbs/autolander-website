import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  Image,
  Loader2,
  RefreshCw,
  Users,
  Video,
} from 'lucide-react';
import { ContactPhoneActions } from './CustomerSearch.jsx';
import PostEventRow from './PostEventRow.jsx';
import PostTrendChart from './PostTrendChart.jsx';
import { ApiError } from './lib/api.js';
import { fetchAccountPosts, fetchGlobalPosts } from './lib/analytics.js';
import {
  buildPostTimeline,
  filterPosts,
} from './lib/post-analytics.js';

const WINDOWS = [1, 7, 30, 90];
const EMPTY_POSTS = {
  rows: [],
  total: 0,
  loaded: 0,
  truncated: false,
  summary: {},
  timeline: null,
  source: '',
};
const PAGE_LIMIT = 600;
const FULL_MAX_ROWS = 600;
const MAX_VISIBLE_EVENTS = 150;
const GLOBAL_OPEN_KEY = 'al_admin_post_monitor_open';
const ACCOUNT_OPEN_KEY = 'al_admin_account_post_monitor_open';

function readStoredOpen(key) {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export default function GlobalPostMonitor({ onUnauthorized, orgId = '' }) {
  const scopedOrgId = String(orgId || '').trim();
  const accountScoped = Boolean(scopedOrgId);
  const openKey = accountScoped ? ACCOUNT_OPEN_KEY : GLOBAL_OPEN_KEY;
  const [open, setOpen] = useState(() => readStoredOpen(openKey));
  const [windowDays, setWindowDays] = useState(30);
  const [posts, setPosts] = useState(EMPTY_POSTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [copyStatus, setCopyStatus] = useState({ state: 'idle', message: '' });
  const requestSeq = useRef(0);
  const abortRef = useRef(null);
  const loadedRef = useRef({ days: 0, full: false });
  const sectionId = useId();
  const copyStatusId = useId();
  const headerId = `${sectionId}-header`;
  const bodyId = `${sectionId}-body`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(openKey, String(open));
    } catch {
      // Local storage may be unavailable in locked-down browser contexts.
    }
  }, [open, openKey]);

  const loadPosts = useCallback(async ({ clear = false, full = open } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setLoading(true);
    setError('');
    if (clear) setPosts(EMPTY_POSTS);
    try {
      const request = {
        days: windowDays,
        limit: PAGE_LIMIT,
        maxRows: full ? FULL_MAX_ROWS : PAGE_LIMIT,
        signal: controller.signal,
      };
      const next = accountScoped
        ? await fetchAccountPosts(scopedOrgId, request)
        : await fetchGlobalPosts(request);
      if (requestSeq.current !== seq) return;
      loadedRef.current = { days: windowDays, full, orgId: scopedOrgId };
      setPosts(next);
    } catch (err) {
      if (requestSeq.current !== seq) return;
      if (err?.name === 'AbortError') return;
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        setError('Your admin session expired.');
      } else {
        setError(accountScoped
          ? 'Could not load this customer posting monitor.'
          : 'Could not load the all-customer posting monitor.');
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (requestSeq.current === seq) setLoading(false);
    }
  }, [accountScoped, onUnauthorized, open, scopedOrgId, windowDays]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      return undefined;
    }
    const loaded = loadedRef.current;
    if (loaded.days === windowDays && loaded.full && loaded.orgId === scopedOrgId) return undefined;
    const clear = loaded.days !== windowDays || loaded.orgId !== scopedOrgId;
    const timeoutId = window.setTimeout(() => loadPosts({ clear }), 0);
    return () => {
      window.clearTimeout(timeoutId);
      requestSeq.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [loadPosts, open, scopedOrgId, windowDays]);

  useEffect(() => () => {
    requestSeq.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const rows = useMemo(() => (Array.isArray(posts?.rows) ? posts.rows : []), [posts]);
  const receiptTotal = Math.max(rows.length, finite(posts?.total, rows.length));
  const meteredPosts = nullableFinite(posts?.summary?.meteredPosts);
  const timeline = useMemo(() => (
    posts?.timeline?.buckets?.length
      ? posts.timeline
      : buildPostTimeline(rows, { days: windowDays })
  ), [posts, rows, windowDays]);
  const activeSelection = selectionExists(selection, timeline) ? selection : null;
  const segmentRows = useMemo(
    () => (activeSelection ? filterPosts(rows, { bucketKey: activeSelection.bucketKey }) : rows),
    [activeSelection, rows],
  );
  const accounts = useMemo(() => uniqueEntities(segmentRows, 'account'), [segmentRows]);
  const activeAccountId = !accountScoped && accounts.some((account) => account.id === selectedAccountId) ? selectedAccountId : '';
  const accountRows = useMemo(
    () => (activeAccountId ? filterPosts(segmentRows, { accountId: activeAccountId }) : segmentRows),
    [activeAccountId, segmentRows],
  );
  const users = useMemo(() => uniqueEntities(accountRows, 'user'), [accountRows]);
  const activeUserId = users.some((user) => user.id === selectedUserId) ? selectedUserId : '';
  const visibleRows = useMemo(
    () => (activeUserId ? filterPosts(accountRows, { userId: activeUserId }) : accountRows),
    [accountRows, activeUserId],
  );
  const selectedAccount = accounts.find((account) => account.id === activeAccountId)
    || (accountScoped ? accounts[0] : null);
  const selectedUser = users.find((user) => user.id === activeUserId) || null;
  const drillActive = Boolean(activeSelection || activeUserId || (!accountScoped && activeAccountId));
  const displayedRows = drillActive ? visibleRows.slice(0, MAX_VISIBLE_EVENTS) : [];
  const loadedSummary = useMemo(() => summarize(rows), [rows]);
  const summary = {
    accounts: finite(posts?.summary?.uniqueAccounts, loadedSummary.accounts),
    users: finite(posts?.summary?.uniqueUsers, loadedSummary.users),
    backgrounds: finite(posts?.summary?.backgroundDelivered, loadedSummary.backgrounds),
    videos: finite(posts?.summary?.videoDelivered, loadedSummary.videos),
  };
  const hasTimelineData = Array.isArray(timeline?.buckets)
    && timeline.buckets.some((bucket) => finite(bucket?.total, 0) > 0);
  const timelineIsMetered = String(timeline?.basis || '').includes('post_usage_metered');
  const headlineCount = windowDays === 1 ? receiptTotal : meteredPosts;

  function changeWindow(days) {
    if (days === windowDays || loading) return;
    setSelection(null);
    setSelectedAccountId('');
    setSelectedUserId('');
    setCopyStatus({ state: 'idle', message: '' });
    setWindowDays(days);
  }

  function changeSelection(nextSelection) {
    setSelection(nextSelection);
    setSelectedAccountId('');
    setSelectedUserId('');
    setCopyStatus({ state: 'idle', message: '' });
  }

  function changeAccount(accountId) {
    setSelectedAccountId(accountId);
    setSelectedUserId('');
    setCopyStatus({ state: 'idle', message: '' });
  }

  function changeUser(userId) {
    setSelectedUserId(userId);
    setCopyStatus({ state: 'idle', message: '' });
  }

  async function copyVisiblePosts() {
    setCopyStatus({ state: 'working', message: 'Preparing posting receipts...' });
    try {
      const payload = {
        schemaVersion: 'autolander.post-deliveries.v1',
        generatedAt: new Date().toISOString(),
        windowDays,
        filters: {
          timeSlice: activeSelection?.bucketLabel || null,
          account: selectedAccount?.label || null,
          user: selectedUser?.label || null,
        },
        count: visibleRows.length,
        posts: visibleRows.map((post) => post.raw || post),
      };
      await copyText(JSON.stringify(payload, null, 2));
      setCopyStatus({
        state: 'success',
        message: `Copied ${visibleRows.length.toLocaleString()} post receipt${visibleRows.length === 1 ? '' : 's'}.`,
      });
    } catch {
      setCopyStatus({ state: 'error', message: 'Could not copy post receipts. Check clipboard permission and try again.' });
    }
  }

  const windowLabel = windowDays === 1 ? 'last 24 hours' : `last ${windowDays} days`;
  const pending = loading && rows.length === 0;

  return (
    <section
      aria-labelledby={headerId}
      className="min-w-0 overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.035]"
    >
      <div className={`flex min-w-0 flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between ${open ? 'border-b border-cyan-400/15' : ''}`}>
        <button
          id={headerId}
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-start gap-3 px-4 py-4 text-left transition hover:bg-cyan-400/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:ring-inset"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <BarChart3 size={17} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-200">{accountScoped ? 'Customer posting monitor' : 'All-customer posting monitor'}</span>
            <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">
              {pending
                ? `Loading posting activity from the ${windowLabel}...`
                : windowDays === 1
                  ? accountScoped
                    ? `${receiptTotal.toLocaleString()} successful posting action${receiptTotal === 1 ? '' : 's'} tracked for this customer in the ${windowLabel}.${open ? ' Hourly activity includes new posts, renewals, and updates.' : ''}`
                    : `${receiptTotal.toLocaleString()} successful posting action${receiptTotal === 1 ? '' : 's'} tracked across ${summary.accounts.toLocaleString()} customer${summary.accounts === 1 ? '' : 's'} in the ${windowLabel}.${open ? ' Hourly activity includes new posts, renewals, and updates.' : ''}`
                  : meteredPosts === null
                    ? `Metered new-post totals are unavailable for the ${windowLabel}. ${receiptTotal.toLocaleString()} timestamped delivery receipt${receiptTotal === 1 ? ' is' : 's are'} available to inspect.`
                    : `${meteredPosts.toLocaleString()} metered new post${meteredPosts === 1 ? '' : 's'} ${accountScoped ? 'for this customer ' : ''}in the ${windowLabel}, with ${receiptTotal.toLocaleString()} timestamped delivery receipt${receiptTotal === 1 ? '' : 's'} available to inspect.`}
            </span>
          </span>
          <span className="shrink-0 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-100">
            {error ? 'Unavailable' : pending ? '...' : formatMetricValue(headlineCount)}
          </span>
          <ChevronDown size={18} aria-hidden="true" className={`mt-0.5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 px-4 pb-4 2xl:pb-0 2xl:pl-0">
            <div role="group" className="flex rounded-xl border border-white/10 bg-black/45 p-1" aria-label={accountScoped ? 'Customer posting reporting window' : 'Overall posting reporting window'}>
              {WINDOWS.map((days) => (
                <button
                  key={days}
                  type="button"
                  disabled={loading}
                  aria-pressed={windowDays === days}
                  onClick={() => changeWindow(days)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-45 ${windowDays === days ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  {days === 1 ? '24h' : `${days}d`}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => loadPosts()}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-wait disabled:opacity-45"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        )}
      </div>

      {open && (
        <div id={bodyId} role="region" aria-labelledby={headerId} className="min-w-0 space-y-3 p-4">
          {error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">{error}</p>}
          {posts?.truncated && (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-200">
              The timeline and headline totals cover the full window. Detailed drill-down is showing {rows.length.toLocaleString()} of {receiptTotal.toLocaleString()} receipts.
            </p>
          )}

          {loading && rows.length === 0 ? (
            <div className="space-y-3">
              <div className="h-64 animate-pulse rounded-xl bg-white/[0.04]" />
              <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
            </div>
          ) : rows.length === 0 && !hasTimelineData ? (
            <div className="rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-10 text-center text-[11px] font-black uppercase tracking-widest text-cyan-100/80">
              {error ? `${accountScoped ? 'Customer' : 'Overall'} posting data is unavailable` : `No posting activity recorded in the ${windowLabel}`}
            </div>
          ) : (
            <>
              <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric icon={BarChart3} label={windowDays === 1 ? '24h actions' : 'New posts'} value={headlineCount} />
                <Metric icon={Users} label="Receipts" value={receiptTotal} />
                <Metric icon={Image} label="BG delivered" value={summary.backgrounds} />
                <Metric icon={Video} label="Video delivered" value={summary.videos} />
              </div>

              <PostTrendChart timeline={timeline} selection={activeSelection} onSelect={changeSelection} />

              <p className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] leading-relaxed text-slate-400">
                {windowDays === 1
                  ? 'Hourly bars use successful delivery receipts because exact hourly new-post timestamps were not historically stored. Receipts can include a new post, renewal, or listing update.'
                  : timelineIsMetered
                    ? 'The chart uses metered new-post totals. Drill-down details come from timestamped delivery receipts, which can also include renewals and listing updates, so their counts may differ.'
                    : 'Metered new-post history is unavailable, so this fallback chart uses successful delivery receipts. Receipts can include new posts, renewals, and listing updates.'}
              </p>

              <div className="min-w-0 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.045] p-3">
                <div className={`grid min-w-0 gap-3 ${accountScoped ? '' : 'sm:grid-cols-2'}`}>
                  <div className={`min-w-0 ${accountScoped ? '' : 'sm:col-span-2'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-100/80">Drill-down scope</p>
                    <p className="mt-1 break-words text-xs font-semibold text-slate-200">
                      {activeSelection ? activeSelection.bucketLabel : 'All loaded posting receipts'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{visibleRows.length.toLocaleString()} matching loaded receipt{visibleRows.length === 1 ? '' : 's'}</p>
                  </div>
                  {!accountScoped && <SelectField label="Customer account" value={activeAccountId} onChange={changeAccount} emptyLabel={`All customers (${segmentRows.length.toLocaleString()})`} rows={accounts} />}
                  <SelectField label="User" value={activeUserId} onChange={changeUser} emptyLabel={`All users (${accountRows.length.toLocaleString()})`} rows={users} />
                </div>

                {(selectedUser?.phone || selectedAccount?.phone) && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <ContactPhoneActions phone={selectedUser?.phone || selectedAccount?.phone} label={selectedUser?.label || selectedAccount?.label || 'customer'} compact />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p id={copyStatusId} role={copyStatus.state === 'error' ? 'alert' : 'status'} aria-live="polite" className={`min-w-0 text-[11px] font-bold ${copyStatus.state === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                  {copyStatus.message || (drillActive
                    ? 'Copy the current read-only drill-down as structured JSON.'
                    : accountScoped
                      ? 'Choose a time slice or user to open receipt details.'
                      : 'Choose a time slice, customer, or user to open receipt details.')}
                </p>
                <button
                  type="button"
                  onClick={copyVisiblePosts}
                  disabled={!drillActive || copyStatus.state === 'working' || visibleRows.length === 0}
                  aria-describedby={copyStatusId}
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copyStatus.state === 'working' ? <Loader2 size={12} className="animate-spin" /> : copyStatus.state === 'success' ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                  Copy matching receipts
                </button>
              </div>

              <div className="max-h-[34rem] min-w-0 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {!drillActive ? (
                  <div className="rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.025] px-3 py-7 text-center text-[11px] font-black uppercase tracking-widest text-cyan-100/80">
                    {accountScoped
                      ? 'Select a graph bar or user to inspect individual receipts'
                      : 'Select a graph bar, customer, or user to inspect individual receipts'}
                  </div>
                ) : displayedRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-3 py-7 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">No loaded receipts match this drill-down</div>
                ) : displayedRows.map((post, index) => <PostEventRow key={post.id || `post-${index}`} post={post} />)}
                {visibleRows.length > displayedRows.length && (
                  <p className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-center text-[11px] font-bold text-slate-400">
                    Showing the first {displayedRows.length.toLocaleString()} of {visibleRows.length.toLocaleString()} matching receipts. Copy includes all matching loaded receipts.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400"><Icon size={10} aria-hidden="true" /> {label}</div>
      <p className="mt-1 text-lg font-black tracking-tight text-slate-100">{formatMetricValue(value)}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, emptyLabel, rows }) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full min-w-0 rounded-xl border border-white/10 bg-black/70 px-3 text-[11px] font-bold text-slate-200 outline-none focus:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-200/60">
        <option value="">{emptyLabel}</option>
        {rows.map((row) => <option key={row.id} value={row.id}>{row.label} ({row.count.toLocaleString()})</option>)}
      </select>
    </label>
  );
}

function uniqueEntities(rows, field) {
  const entities = new Map();
  rows.forEach((post) => {
    const entity = post?.[field];
    const id = firstText(entity?.id, entity?.orgId, entity?.email, entity?.username, entity?.label);
    if (!id) return;
    const current = entities.get(id);
    if (current) {
      current.count += 1;
      if (!current.phone && entity?.phone) current.phone = entity.phone;
      return;
    }
    entities.set(id, {
      ...entity,
      id,
      label: firstText(entity?.label, entity?.displayName, entity?.name, entity?.username, entity?.email, entity?.slug, id),
      phone: firstText(entity?.phone),
      count: 1,
    });
  });
  return [...entities.values()].sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function summarize(rows) {
  return {
    accounts: new Set(rows.map((post) => post?.account?.id).filter(Boolean)).size,
    users: new Set(rows.map((post) => post?.user?.id).filter(Boolean)).size,
    backgrounds: rows.filter((post) => post?.background?.delivered === true).length,
    videos: rows.filter((post) => post?.video?.delivered === true).length,
  };
}

function selectionExists(selection, timeline) {
  if (!selection?.bucketKey) return false;
  return Array.isArray(timeline?.buckets) && timeline.buckets.some((bucket) => bucket.key === selection.bucketKey && finite(bucket.total, 0) > 0);
}

async function copyText(value) {
  if (globalThis.navigator?.clipboard?.writeText) {
    await globalThis.navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Clipboard copy failed');
}

function firstText(...values) {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim());
  return value === undefined ? '' : String(value).trim();
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nullableFinite(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatMetricValue(value) {
  const number = nullableFinite(value);
  return number === null ? 'Unavailable' : number.toLocaleString();
}
