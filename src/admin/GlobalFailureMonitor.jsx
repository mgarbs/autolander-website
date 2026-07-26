import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ContactPhoneActions } from './CustomerSearch.jsx';
import FailureEventRow from './FailureEventRow.jsx';
import FailureTrendChart from './FailureTrendChart.jsx';
import { ApiError } from './lib/api.js';
import { fetchGlobalFailures } from './lib/analytics.js';
import {
  buildFailureReport,
  buildFailureTimeline,
  filterFailures,
} from './lib/failure-diagnostics.js';

const WINDOWS = [1, 7, 30];
const EMPTY_FAILURES = {
  rows: [],
  total: 0,
  loaded: 0,
  truncated: false,
  partial: false,
  failedAccounts: 0,
  source: '',
};
const MAX_VISIBLE_EVENTS = 150;
const PAGE_LIMIT = 200;
const FULL_MAX_ROWS = 5_000;
// Renamed from al_admin_collapse_error-monitor so the old default-closed
// preference does not keep the monitor hidden now that it opens by default.
const OPEN_KEY = 'al_admin_error_monitor_open';

function readStoredOpen() {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(OPEN_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export default function GlobalFailureMonitor({ onUnauthorized }) {
  const [open, setOpen] = useState(readStoredOpen);
  const [windowDays, setWindowDays] = useState(30);
  const [failures, setFailures] = useState(EMPTY_FAILURES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [copyStatus, setCopyStatus] = useState({ state: 'idle', message: '' });
  const requestSeq = useRef(0);
  const loadedRef = useRef({ days: 0, full: false });
  const copyStatusId = useId();
  const sectionId = useId();
  const headerId = `${sectionId}-header`;
  const bodyId = `${sectionId}-body`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(OPEN_KEY, String(open));
    } catch {
      // Local storage may be unavailable in locked-down browser contexts.
    }
  }, [open]);

  const loadFailures = useCallback(async ({ clear = false, full = open } = {}) => {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setLoading(true);
    setError('');
    if (clear) setFailures(EMPTY_FAILURES);
    try {
      const next = await fetchGlobalFailures({
        days: windowDays,
        limit: PAGE_LIMIT,
        // Collapsed, only the header count is on screen — one page already carries the total.
        maxRows: full ? FULL_MAX_ROWS : PAGE_LIMIT,
      });
      if (requestSeq.current !== seq) return;
      loadedRef.current = { days: windowDays, full };
      setFailures(next);
    } catch (err) {
      if (requestSeq.current !== seq) return;
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        setError('Your admin session expired.');
      } else {
        setError('Could not load the all-customer failure monitor.');
      }
    } finally {
      if (requestSeq.current === seq) setLoading(false);
    }
  }, [onUnauthorized, open, windowDays]);

  useEffect(() => {
    const loaded = loadedRef.current;
    // Collapsing never needs a refetch, and re-expanding a full window is already covered.
    if (loaded.days === windowDays && (loaded.full || !open)) return undefined;
    const clear = loaded.days !== windowDays;
    const timeoutId = window.setTimeout(() => loadFailures({ clear }), 0);
    return () => {
      window.clearTimeout(timeoutId);
      requestSeq.current += 1;
    };
  }, [loadFailures, open, windowDays]);

  const rows = useMemo(
    () => (Array.isArray(failures?.rows) ? failures.rows : []),
    [failures],
  );
  const total = Math.max(rows.length, finite(failures?.total, rows.length));
  const timeline = useMemo(
    () => buildFailureTimeline(rows, { days: windowDays }),
    [rows, windowDays],
  );
  const activeSelection = selectionExists(selection, timeline) ? selection : null;
  const selectionOptions = useMemo(() => ({
    bucketKey: activeSelection?.bucketKey || undefined,
    type: activeSelection?.type || undefined,
  }), [activeSelection]);
  const segmentRows = useMemo(
    () => (activeSelection ? filterFailures(rows, selectionOptions) : rows),
    [activeSelection, rows, selectionOptions],
  );
  const accounts = useMemo(() => uniqueAccounts(segmentRows), [segmentRows]);
  const activeAccountId = accounts.some((account) => account.id === selectedAccountId)
    ? selectedAccountId
    : '';
  const accountRows = useMemo(
    () => (activeAccountId
      ? filterFailures(segmentRows, { accountId: activeAccountId })
      : segmentRows),
    [activeAccountId, segmentRows],
  );
  const users = useMemo(() => uniqueUsers(accountRows), [accountRows]);
  const activeUserId = users.some((user) => user.id === selectedUserId)
    ? selectedUserId
    : '';
  const visibleRows = useMemo(
    () => (activeUserId
      ? filterFailures(accountRows, { userId: activeUserId })
      : accountRows),
    [accountRows, activeUserId],
  );
  const selectedAccount = accounts.find((account) => account.id === activeAccountId) || null;
  const selectedUser = users.find((user) => user.id === activeUserId) || null;
  const displayedRows = visibleRows.slice(0, MAX_VISIBLE_EVENTS);

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

  async function copyVisibleErrors() {
    setCopyStatus({ state: 'working', message: 'Preparing diagnostics...' });
    try {
      const copyRows = selectedUser
        ? filterFailures(rows, {
            accountId: selectedAccount?.id,
            userId: selectedUser.id,
          })
        : selectedAccount
          ? filterFailures(rows, { accountId: selectedAccount.id })
          : visibleRows;
      const unfiltered = !activeSelection && !selectedAccount && !selectedUser;
      const report = buildFailureReport({
        failures: copyRows,
        account: selectedAccount,
        user: selectedUser,
        windowDays,
        total: unfiltered ? total : copyRows.length,
        loaded: copyRows.length,
        source: failures?.source || 'global_failure_events',
        truncated: Boolean(failures?.truncated),
      });
      await copyText(JSON.stringify(report, null, 2));
      const scope = selectedUser
        ? ` for ${selectedUser.label}`
        : selectedAccount
          ? ` for ${selectedAccount.label}`
          : activeSelection
            ? ' in this chart segment'
            : '';
      setCopyStatus({
        state: 'success',
        message: `Copied ${copyRows.length.toLocaleString()} error${copyRows.length === 1 ? '' : 's'}${scope}.`,
      });
    } catch {
      setCopyStatus({
        state: 'error',
        message: 'Could not copy diagnostics. Check browser clipboard permission and try again.',
      });
    }
  }

  const windowLabel = windowDays === 1 ? 'last 24 hours' : `last ${windowDays} days`;
  const pending = loading && rows.length === 0;

  return (
    <section
      aria-labelledby={headerId}
      className="min-w-0 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.035]"
    >
      <div className={`flex min-w-0 flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between ${open ? 'border-b border-red-500/15' : ''}`}>
        <button
          id={headerId}
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-start gap-3 px-4 py-4 text-left transition hover:bg-red-500/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-inset"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <AlertTriangle size={17} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-200">
              All-customer error monitor
            </span>
            <span className="mt-1 block text-[10px] leading-relaxed text-slate-500">
              {pending
                ? `Loading failures from the ${windowLabel}...`
                : `${total.toLocaleString()} failure${total === 1 ? '' : 's'} across ${accounts.length.toLocaleString()} loaded customer${accounts.length === 1 ? '' : 's'} in the ${windowLabel}.${open ? ' Select the graph to drill into a customer, user, and raw event JSON.' : ''}`}
            </span>
          </span>
          <span
            className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
              error
                ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                : total > 0
                  ? 'border-red-400/30 bg-red-500/15 text-red-200'
                  : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {error ? 'Unavailable' : pending ? '···' : total > 0 ? total.toLocaleString() : 'All clear'}
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`mt-0.5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 px-4 pb-4 2xl:pb-0 2xl:pl-0">
            <div className="flex rounded-xl border border-white/10 bg-black/45 p-1" aria-label="Overall failure reporting window">
              {WINDOWS.map((days) => (
                <button
                  key={days}
                  type="button"
                  disabled={loading}
                  aria-pressed={windowDays === days}
                  onClick={() => changeWindow(days)}
                  className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    windowDays === days
                      ? 'bg-red-500 text-white'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {days === 1 ? '24h' : `${days}d`}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => loadFailures()}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-white/20 hover:text-white disabled:cursor-wait disabled:opacity-45"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {open && (
      <div id={bodyId} role="region" aria-labelledby={headerId} className="min-w-0 space-y-3 p-4">
        {error && (
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
            {error}
          </p>
        )}
        {failures?.partial && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-200">
            The compatibility scan could not load {finite(failures.failedAccounts, 0).toLocaleString()} customer account{finite(failures.failedAccounts, 0) === 1 ? '' : 's'}.
          </p>
        )}
        {failures?.truncated && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-200">
            Showing {rows.length.toLocaleString()} of {total.toLocaleString()} failures. Counts and drill-downs below reflect the loaded events.
          </p>
        )}

        {loading && rows.length === 0 ? (
          <div className="space-y-3">
            <div className="h-64 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-10 text-center text-[9px] font-black uppercase tracking-widest text-emerald-300/70">
            {error ? 'Overall failure data is unavailable' : `No failures recorded in the ${windowLabel}`}
          </div>
        ) : (
          <>
            <FailureTrendChart
              timeline={timeline}
              selection={activeSelection}
              onSelect={changeSelection}
            />

            <div className="min-w-0 rounded-xl border border-blue-400/15 bg-blue-400/[0.045] p-3">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-blue-300/70">
                    Drill-down scope
                  </p>
                  <p className="mt-1 break-words text-xs font-semibold text-slate-200">
                    {activeSelection
                      ? `${activeSelection.typeLabel || activeSelection.type} · ${activeSelection.bucketLabel || 'All loaded dates'}`
                      : 'All loaded error types and dates'}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500">
                    {visibleRows.length.toLocaleString()} matching loaded event{visibleRows.length === 1 ? '' : 's'}
                  </p>
                </div>

                <SelectField
                  label="Customer account"
                  value={activeAccountId}
                  onChange={changeAccount}
                  emptyLabel={`All customers (${segmentRows.length.toLocaleString()})`}
                  rows={accounts}
                />
                <SelectField
                  label="User"
                  value={activeUserId}
                  onChange={changeUser}
                  emptyLabel={`All users (${accountRows.length.toLocaleString()})`}
                  rows={users}
                />
              </div>

              {(selectedUser?.phone || selectedAccount?.phone) && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <ContactPhoneActions
                    phone={selectedUser?.phone || selectedAccount?.phone}
                    label={selectedUser?.label || selectedAccount?.label || 'customer'}
                    compact
                  />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                id={copyStatusId}
                role="status"
                aria-live="polite"
                className={`min-w-0 text-[9px] font-bold ${
                  copyStatus.state === 'error' ? 'text-red-300' : 'text-emerald-300'
                }`}
              >
                {copyStatus.message || 'Copy the current drill-down as redacted, AI-ready JSON.'}
              </p>
              <button
                type="button"
                onClick={copyVisibleErrors}
                disabled={copyStatus.state === 'working' || visibleRows.length === 0}
                aria-describedby={copyStatusId}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-[8px] font-black uppercase tracking-widest text-slate-300 hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copyStatus.state === 'working' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : copyStatus.state === 'success' ? (
                  <Check size={12} className="text-emerald-300" />
                ) : (
                  <Copy size={12} />
                )}
                {selectedUser ? 'Copy this user\'s errors' : 'Copy matching errors'}
              </button>
            </div>

            <div className="max-h-[34rem] min-w-0 space-y-2 overflow-y-auto overscroll-contain pr-1">
              {displayedRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-slate-600">
                  No loaded events match this drill-down
                </div>
              ) : displayedRows.map((failure, index) => (
                <FailureEventRow
                  key={failure.id || `${failure.fingerprint || failure.code}-${index}`}
                  failure={failure}
                />
              ))}
              {visibleRows.length > displayedRows.length && (
                <p className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-center text-[9px] font-bold text-slate-500">
                  Showing the first {displayedRows.length.toLocaleString()} of {visibleRows.length.toLocaleString()} matching events. Copy includes all matching loaded events.
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

function SelectField({
  label,
  value,
  onChange,
  emptyLabel,
  rows,
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full min-w-0 rounded-xl border border-white/10 bg-black/70 px-3 text-[10px] font-bold text-slate-200 outline-none focus:border-blue-400/50"
      >
        <option value="">{emptyLabel}</option>
        {rows.map((row) => (
          <option key={row.id} value={row.id}>
            {row.label} ({row.count.toLocaleString()})
          </option>
        ))}
      </select>
    </label>
  );
}

function uniqueAccounts(rows) {
  const accounts = new Map();
  rows.forEach((failure) => {
    const account = failure?.account;
    const id = firstText(account?.id, account?.orgId);
    if (!id) return;
    const current = accounts.get(id);
    if (current) {
      current.count += 1;
      if (!current.phone && account?.phone) current.phone = account.phone;
      return;
    }
    accounts.set(id, {
      ...account,
      id,
      label: firstText(account?.label, account?.name, account?.slug, id),
      phone: firstText(account?.phone),
      count: 1,
    });
  });
  return [...accounts.values()].sort((left, right) => (
    right.count - left.count || left.label.localeCompare(right.label)
  ));
}

function uniqueUsers(rows) {
  const users = new Map();
  rows.forEach((failure) => {
    const user = failure?.user;
    const id = firstText(user?.id, user?.email, user?.username, user?.label);
    if (!id) return;
    const current = users.get(id);
    if (current) {
      current.count += 1;
      if (!current.phone && user?.phone) current.phone = user.phone;
      return;
    }
    users.set(id, {
      ...user,
      id,
      label: firstText(user?.displayName, user?.label, user?.username, user?.email, id),
      phone: firstText(user?.phone),
      count: 1,
    });
  });
  return [...users.values()].sort((left, right) => (
    right.count - left.count || left.label.localeCompare(right.label)
  ));
}

function selectionExists(selection, timeline) {
  if (!selection) return false;
  const type = Array.isArray(timeline?.types)
    ? timeline.types.find((candidate) => candidate.key === selection.type)
    : null;
  if (!type) return false;
  if (!selection.bucketKey) return true;
  const bucket = Array.isArray(timeline?.buckets)
    ? timeline.buckets.find((candidate) => candidate.key === selection.bucketKey)
    : null;
  return finite(bucket?.counts?.[type.key], 0) > 0;
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
  const value = values.find((item) => (
    item !== undefined && item !== null && String(item).trim()
  ));
  return value === undefined ? '' : String(value).trim();
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
