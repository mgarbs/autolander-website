import { useId, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Copy, Loader2 } from 'lucide-react';
import {
  buildFailureReport,
  buildFailureTimeline,
  buildLegacyFeedFailures,
  filterFailures,
} from './lib/failure-diagnostics.js';
import FailureEventRow from './FailureEventRow.jsx';
import FailureTrendChart from './FailureTrendChart.jsx';

const WINDOWS = [1, 7, 30];
const MAX_VISIBLE_EVENTS = 150;

export default function FailureDiagnostics({
  failures,
  loading,
  error,
  legacyFeeds,
  windowDays,
  onWindowDaysChange,
  account,
  reportContext,
  users = [],
}) {
  const [open, setOpen] = useState(true);
  const [selection, setSelection] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [copyStatus, setCopyStatus] = useState({ state: 'idle', message: '' });
  const sectionId = useId();
  const copyStatusId = useId();
  const headerId = `${sectionId}-header`;
  const bodyId = `${sectionId}-body`;
  const endpointRows = Array.isArray(failures?.rows) ? failures.rows : [];
  const endpointUnavailable = failures?.available === false || Boolean(error);
  const legacyRows = endpointRows.length === 0 && endpointUnavailable
    ? buildLegacyFeedFailures(legacyFeeds)
    : [];
  const rows = endpointRows.length > 0 ? endpointRows : legacyRows;
  const showingLegacy = endpointRows.length === 0 && legacyRows.length > 0;
  const summary = failures?.summary || {};
  const resolvedWindowDays = finite(windowDays, finite(summary.windowDays, 30));
  const reportedTotal = showingLegacy ? rows.length : finite(summary.total, finite(failures?.total, rows.length));
  const total = Math.max(rows.length, reportedTotal);
  const loadedSubset = total > rows.length;
  const recoverable = showingLegacy || loadedSubset
    ? rows.filter((row) => row.recoverable === true).length
    : finite(summary.recoverable, rows.filter((row) => row.recoverable === true).length);
  const nonRecoverable = showingLegacy || loadedSubset
    ? rows.filter((row) => row.recoverable === false).length
    : finite(summary.nonRecoverable, rows.filter((row) => row.recoverable === false).length);
  const uniqueFingerprints = showingLegacy || loadedSubset
    ? uniqueSignatures(rows)
    : finite(summary.uniqueFingerprints, uniqueSignatures(rows));
  const timeline = buildFailureTimeline(rows, { days: resolvedWindowDays });
  const windowSelection = selection?.windowDays === resolvedWindowDays ? selection : null;
  const activeSelection = selectionExists(windowSelection, timeline) ? windowSelection : null;
  const selectionOptions = {
    bucketKey: activeSelection?.bucketKey || undefined,
    type: activeSelection?.type || undefined,
    timeline,
  };
  const segmentRows = activeSelection ? filterFailures(rows, selectionOptions) : rows;
  const drillUsers = uniqueUsers(segmentRows, users);
  const activeSelectedUserId = drillUsers.some((user) => user.id === selectedUserId)
    ? selectedUserId
    : '';
  const visibleRows = activeSelectedUserId
    ? filterFailures(rows, { ...selectionOptions, userId: activeSelectedUserId })
    : segmentRows;
  const displayedRows = visibleRows.slice(0, MAX_VISIBLE_EVENTS);
  const selectedUser = drillUsers.find((user) => user.id === activeSelectedUserId) || null;

  function changeWindow(value) {
    setSelection(null);
    setSelectedUserId('');
    setCopyStatus({ state: 'idle', message: '' });
    onWindowDaysChange?.(value);
  }

  function changeSelection(nextSelection) {
    setSelection(nextSelection ? { ...nextSelection, windowDays: resolvedWindowDays } : null);
    setSelectedUserId('');
  }

  async function copyErrors() {
    setCopyStatus({ state: 'working', message: 'Preparing diagnostics…' });
    try {
      const copyRows = activeSelectedUserId
        ? filterFailures(rows, { userId: activeSelectedUserId })
        : rows;
      const report = buildFailureReport({
        failures: copyRows,
        account: reportContext?.account || account || reportContext || null,
        user: selectedUser,
        windowDays: resolvedWindowDays,
        total: activeSelectedUserId ? copyRows.length : total,
        loaded: copyRows.length,
        truncated: Boolean(failures?.truncated) || total > rows.length,
        legacyFeeds,
        source: showingLegacy ? 'legacy_feed_snapshot' : 'failure_events',
      });
      await copyText(JSON.stringify(report, null, 2));
      const subject = selectedUser?.label ? ` for ${selectedUser.label}` : '';
      const qualifier = total > rows.length ? 'loaded ' : '';
      setCopyStatus({
        state: 'success',
        message: `Copied ${copyRows.length.toLocaleString()} ${qualifier}error${copyRows.length === 1 ? '' : 's'}${subject}.`,
      });
    } catch {
      setCopyStatus({
        state: 'error',
        message: 'Could not copy diagnostics. Check browser clipboard permission and try again.',
      });
    }
  }

  const loadedLabel = `${rows.length.toLocaleString()} loaded${total > rows.length ? ` of ${total.toLocaleString()} total` : ''}`;
  const windowLabel = resolvedWindowDays === 1 ? 'the last 24 hours' : `the last ${resolvedWindowDays} days`;

  return (
    <section aria-labelledby={headerId} className="min-w-0 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.035]">
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="group min-w-0"
      >
        <summary id={headerId} aria-controls={bodyId} className="flex min-w-0 cursor-pointer list-none flex-col gap-3 px-4 py-4 marker:hidden transition hover:bg-red-500/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-inset sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <AlertTriangle size={17} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-200">Failure diagnostics</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">
                {loading && rows.length === 0
                  ? 'Loading customer failures…'
                  : loading
                    ? `Updating ${windowLabel}; ${rows.length.toLocaleString()} previously loaded event${rows.length === 1 ? '' : 's'} remain visible`
                    : `${loadedLabel} from ${windowLabel}`}
              </span>
            </span>
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <SummaryChip tone="red">{total.toLocaleString()} total</SummaryChip>
            <SummaryChip>{uniqueFingerprints.toLocaleString()} {total > rows.length ? 'loaded signatures' : 'signatures'}</SummaryChip>
            {recoverable > 0 && <SummaryChip tone="amber">{recoverable.toLocaleString()} {total > rows.length ? 'loaded recoverable' : 'recoverable'}</SummaryChip>}
            {nonRecoverable > 0 && <SummaryChip tone="red">{nonRecoverable.toLocaleString()} {total > rows.length ? 'loaded non-recoverable' : 'non-recoverable'}</SummaryChip>}
            <ChevronDown size={15} className="ml-1 shrink-0 text-slate-500 transition group-open:rotate-180" />
          </span>
        </summary>

        <div id={bodyId} role="region" aria-labelledby={headerId} className="min-w-0 border-t border-red-500/15 px-4 pb-4 pt-3">
          <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" className="flex w-fit shrink-0 gap-1 rounded-xl border border-white/10 bg-black/45 p-1" aria-label="Failure reporting window">
              {WINDOWS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!onWindowDaysChange || loading}
                  aria-pressed={resolvedWindowDays === value}
                  onClick={() => changeWindow(value)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-45 ${
                    resolvedWindowDays === value
                      ? 'bg-red-500 text-white'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {value === 1 ? '24h' : `${value}d`}
                </button>
              ))}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={copyErrors}
                disabled={copyStatus.state === 'working' || rows.length === 0}
                aria-describedby={copyStatusId}
                className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copyStatus.state === 'working' ? (
                  <Loader2 size={12} aria-hidden="true" className="animate-spin" />
                ) : copyStatus.state === 'success' ? (
                  <Check size={12} aria-hidden="true" className="text-emerald-300" />
                ) : (
                  <Copy size={12} aria-hidden="true" />
                )}
                {total > rows.length ? 'Copy all loaded errors' : 'Copy all errors'}
              </button>
              <p
                id={copyStatusId}
                role={copyStatus.state === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`text-[9px] font-bold ${
                  copyStatus.state === 'error' ? 'text-red-300' : 'text-emerald-300'
                }`}
              >
                {copyStatus.message}
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200">
              {errorMessage(error)}
              {rows.length > 0
                ? showingLegacy
                  ? ' Showing legacy feed diagnostics below.'
                  : ' Showing the last loaded detailed events below.'
                : ''}
            </p>
          )}
          {showingLegacy && (
            <p className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-3 py-2 text-[10px] font-bold text-amber-200">
              The detailed event endpoint was unavailable. These are legacy last-sync errors from the account feed snapshot.
            </p>
          )}

          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />)}
            </div>
          ) : rows.length === 0 && endpointUnavailable ? (
            <div className="rounded-xl border border-dashed border-amber-500/20 bg-amber-500/[0.04] px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-amber-300/70">
              Failure details are currently unavailable
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-emerald-300/70">
              No failures recorded in this window
            </div>
          ) : (
            <div className="min-w-0 space-y-3">
              <FailureTrendChart
                timeline={timeline}
                selection={activeSelection}
                onSelect={changeSelection}
              />

              {(activeSelection || drillUsers.length > 0) && (
                <DrilldownControls
                  selection={activeSelection}
                  total={segmentRows.length}
                  users={drillUsers}
                  selectedUserId={activeSelectedUserId}
                  onUserChange={setSelectedUserId}
                  visible={visibleRows.length}
                />
              )}

              <div className="max-h-[34rem] min-w-0 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {visibleRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-600">
                    No loaded events match this drill-down
                  </div>
                ) : displayedRows.map((failure, index) => (
                  <FailureEventRow
                    key={failure.id || `${failure.fingerprint || failure.code}-${index}`}
                    failure={failure}
                  />
                ))}
                {visibleRows.length > displayedRows.length && (
                  <p className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-center text-[11px] font-bold text-slate-400">
                    Showing the first {displayedRows.length.toLocaleString()} of {visibleRows.length.toLocaleString()} matching loaded events. Copy includes all matching loaded errors.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

function DrilldownControls({
  selection,
  total,
  users,
  selectedUserId,
  onUserChange,
  visible,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-blue-400/15 bg-blue-400/[0.045] px-3 py-3">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-widest text-blue-300/70">Chart drill-down</p>
          <p className="mt-1 break-words text-xs font-semibold text-slate-200">
            {selection
              ? `${selection.typeLabel || selection.type} · ${selection.bucketLabel || 'All loaded dates'}`
              : 'All loaded error types and dates'}
          </p>
          <p className="mt-1 text-[9px] text-slate-500">
            {selectedUserId
              ? `${visible.toLocaleString()} of ${total.toLocaleString()} matching loaded events`
              : `${total.toLocaleString()} matching loaded event${total === 1 ? '' : 's'}`}
          </p>
        </div>
        {users.length > 0 && (
          <label className="min-w-0 sm:min-w-56">
            <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-slate-500">Filter drill-down by user</span>
            <select
              value={selectedUserId}
              onChange={(event) => onUserChange(event.target.value)}
              className="h-9 w-full min-w-0 rounded-xl border border-white/10 bg-black/70 px-3 text-[10px] font-bold text-slate-200 outline-none focus:border-blue-400/50"
            >
              <option value="">All users ({total.toLocaleString()})</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.label} ({user.count.toLocaleString()})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

function SummaryChip({ children, tone = 'slate' }) {
  const color = {
    red: 'border-red-400/20 bg-red-400/[0.08] text-red-200',
    amber: 'border-amber-400/20 bg-amber-400/[0.08] text-amber-200',
    slate: 'border-white/10 bg-white/[0.03] text-slate-400',
  }[tone];
  return <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${color}`}>{children}</span>;
}

function uniqueUsers(rows, knownUsers) {
  const knownByAlias = new Map();
  if (Array.isArray(knownUsers)) {
    knownUsers.forEach((user) => {
      userAliases(user).forEach((alias) => knownByAlias.set(alias, user));
    });
  }
  const users = new Map();
  rows.forEach((failure) => {
    const user = failure?.user;
    if (!user) return;
    const id = String(user.id || user.email || user.username || user.label || '').trim();
    if (!id) return;
    const known = userAliases(user)
      .map((alias) => knownByAlias.get(alias))
      .find(Boolean);
    const current = users.get(id);
    if (current) {
      current.count += 1;
      return;
    }
    users.set(id, {
      ...(known || {}),
      ...user,
      id,
      label: known?.displayName
        || user.displayName
        || user.label
        || user.username
        || known?.username
        || user.email
        || known?.email
        || id,
      email: user.email || known?.email || '',
      username: user.username || known?.username || '',
      phone: user.phone
        || known?.phone
        || known?.phoneNumber
        || known?.mobile
        || known?.mobilePhone
        || '',
      count: 1,
    });
  });
  return [...users.values()].sort((left, right) => (
    right.count - left.count || left.label.localeCompare(right.label)
  ));
}

function userAliases(user) {
  return [
    user?.id,
    user?.email,
    user?.username,
    user?.label,
    user?.displayName,
  ]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
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
  document.body.removeChild(textarea);
  if (!copied) throw new Error('Clipboard copy was rejected.');
}

function errorMessage(value) {
  if (typeof value === 'string') return value;
  return value?.message || 'Detailed failure events could not be loaded.';
}

function uniqueSignatures(rows) {
  return new Set(rows.map((row) => row.fingerprint || [row.code, row.stage, row.message].filter(Boolean).join('|'))).size;
}

function finite(value, fallback) {
  const number = Number(value);
  return value !== undefined && value !== null && value !== '' && Number.isFinite(number) ? number : fallback;
}
