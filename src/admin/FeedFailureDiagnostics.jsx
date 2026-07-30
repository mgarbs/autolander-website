import { useId, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Loader2,
} from 'lucide-react';
import { formatDate, formatRelative } from './lib/analytics-format.js';
import { buildFeedFailureReport } from './lib/feed-failure-diagnostics.js';
import {
  buildFailureTimeline,
  filterFailures,
  humanizeFailureValue,
} from './lib/failure-diagnostics.js';
import FailureTrendChart from './FailureTrendChart.jsx';

const WINDOWS = [1, 7, 30];
const MAX_VISIBLE_EVENTS = 150;

export default function FeedFailureDiagnostics({
  failures,
  loading,
  error,
  windowDays,
  onWindowDaysChange,
  account,
  feeds = [],
}) {
  const [open, setOpen] = useState(true);
  const [selection, setSelection] = useState(null);
  const [copyStatus, setCopyStatus] = useState({ state: 'idle', message: '' });
  const sectionId = useId();
  const copyStatusId = useId();
  const headerId = `${sectionId}-header`;
  const bodyId = `${sectionId}-body`;
  const endpointRows = Array.isArray(failures?.rows) ? failures.rows : [];
  const rows = endpointRows.map((row) => enrichFeedName(row, feeds));
  const summary = object(failures?.summary);
  const available = failures?.available !== false;
  const resolvedWindowDays = finite(windowDays, finite(summary.windowDays, 30));
  const reportedTotal = finite(summary.total, rows.length);
  const total = Math.max(rows.length, reportedTotal);
  const occurrenceTotal = rows.reduce(
    (sum, row) => sum + Math.max(0, finite(row?.occurrenceCount, 0)),
    0,
  );
  const uniqueCodes = Object.keys(object(summary.byCode)).length
    || new Set(rows.map((row) => row?.code).filter(Boolean)).size;
  const timeline = buildFailureTimeline(rows, { days: resolvedWindowDays });
  const activeSelection = selection?.windowDays === resolvedWindowDays ? selection : null;
  const visibleRows = activeSelection
    ? filterFailures(rows, {
        bucketKey: activeSelection.bucketKey || undefined,
        type: activeSelection.type || undefined,
      })
    : rows;
  const displayedRows = visibleRows.slice(0, MAX_VISIBLE_EVENTS);
  const loadedLabel = `${rows.length.toLocaleString()} loaded${
    total > rows.length ? ` of ${total.toLocaleString()} total` : ''
  }`;
  const windowLabel = resolvedWindowDays === 1
    ? 'the last 24 hours'
    : `the last ${resolvedWindowDays} days`;

  function changeWindow(value) {
    setSelection(null);
    setCopyStatus({ state: 'idle', message: '' });
    onWindowDaysChange?.(value);
  }

  function changeSelection(nextSelection) {
    setSelection(nextSelection
      ? { ...nextSelection, windowDays: resolvedWindowDays }
      : null);
  }

  async function copyErrors() {
    setCopyStatus({ state: 'working', message: 'Preparing feed diagnostics…' });
    try {
      const report = buildFeedFailureReport({
        feedFailures: rows,
        account,
        windowDays: resolvedWindowDays,
        total,
        loaded: rows.length,
        summary,
        available,
        truncated: Boolean(failures?.truncated) || total > rows.length,
      });
      await copyText(JSON.stringify(report, null, 2));
      const qualifier = total > rows.length ? ' loaded' : '';
      setCopyStatus({
        state: 'success',
        message: `Copied ${rows.length.toLocaleString()}${qualifier} feed error${
          rows.length === 1 ? '' : 's'
        }.`,
      });
    } catch {
      setCopyStatus({
        state: 'error',
        message: 'Could not copy feed diagnostics. Check browser clipboard permission and try again.',
      });
    }
  }

  return (
    <section
      aria-labelledby={headerId}
      className="min-w-0 overflow-hidden rounded-2xl border border-amber-400/60 bg-slate-50 shadow-sm dark:border-amber-500/25 dark:bg-amber-500/[0.045] dark:shadow-none"
    >
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="group min-w-0"
      >
        <summary
          id={headerId}
          aria-controls={bodyId}
          className="flex min-w-0 cursor-pointer list-none flex-col gap-3 px-4 py-4 marker:hidden transition hover:bg-amber-500/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-inset sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {loading
                ? <Loader2 size={17} className="animate-spin" />
                : <AlertTriangle size={17} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                Feed sync errors
              </span>
              <span className="mt-1 block text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {loading && rows.length === 0
                  ? 'Loading feed sync errors…'
                  : loading
                    ? `Updating ${windowLabel}; ${rows.length.toLocaleString()} previously loaded error${
                        rows.length === 1 ? '' : 's'
                      } remain visible`
                    : !available && !error
                      ? 'Feed error reporting is not yet recording for this account'
                      : `${loadedLabel} from ${windowLabel}`}
              </span>
            </span>
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <SummaryChip tone="red">{total.toLocaleString()} total</SummaryChip>
            <SummaryChip>{uniqueCodes.toLocaleString()} codes</SummaryChip>
            {occurrenceTotal > 0 && (
              <SummaryChip tone="amber">
                {occurrenceTotal.toLocaleString()} loaded occurrences
              </SummaryChip>
            )}
            <ChevronDown
              size={15}
              className="ml-1 shrink-0 text-slate-500 transition group-open:rotate-180"
            />
          </span>
        </summary>

        <div
          id={bodyId}
          role="region"
          aria-labelledby={headerId}
          className="min-w-0 border-t border-amber-500/20 px-4 pb-4 pt-3"
        >
          <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="group"
              className="flex w-fit shrink-0 gap-1 rounded-xl border border-slate-300/70 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-black/45"
              aria-label="Feed error reporting window"
            >
              {WINDOWS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!onWindowDaysChange || loading}
                  aria-pressed={resolvedWindowDays === value}
                  onClick={() => changeWindow(value)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-45 ${
                    resolvedWindowDays === value
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-500 dark:hover:text-slate-100'
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
                className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-300/70 bg-white/70 px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:border-amber-500/40 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-slate-100"
              >
                {copyStatus.state === 'working' ? (
                  <Loader2 size={12} aria-hidden="true" className="animate-spin" />
                ) : copyStatus.state === 'success' ? (
                  <Check size={12} aria-hidden="true" className="text-emerald-600 dark:text-emerald-300" />
                ) : (
                  <Copy size={12} aria-hidden="true" />
                )}
                Copy all feed errors
              </button>
              <p
                id={copyStatusId}
                role={copyStatus.state === 'error' ? 'alert' : 'status'}
                aria-live="polite"
                className={`text-[9px] font-bold ${
                  copyStatus.state === 'error'
                    ? 'text-red-600 dark:text-red-300'
                    : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {copyStatus.message}
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-200"
            >
              {errorMessage(error)}
              {rows.length > 0 ? ' Showing the last loaded feed errors below.' : ''}
            </p>
          )}

          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-xl bg-slate-300/35 dark:bg-white/[0.04]"
                />
              ))}
            </div>
          ) : rows.length === 0 && !error && !available ? (
            <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/[0.07] px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
              Feed error reporting isn't recording yet for this account
            </div>
          ) : rows.length === 0 && error ? (
            <div className="rounded-xl border border-dashed border-red-500/25 bg-red-500/[0.06] px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-red-700 dark:text-red-300">
              Feed sync error details are currently unavailable
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              No feed sync errors in this window
            </div>
          ) : (
            <div className="min-w-0 space-y-3">
              <div className="min-w-0 rounded-xl bg-slate-950">
                <FailureTrendChart
                  timeline={timeline}
                  selection={activeSelection}
                  onSelect={changeSelection}
                />
              </div>

              {activeSelection && (
                <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="min-w-0 break-words text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {activeSelection.typeLabel || humanizeFailureValue(activeSelection.type)}
                    {' · '}
                    {activeSelection.bucketLabel || 'All loaded dates'}
                    {' · '}
                    {visibleRows.length.toLocaleString()} matching error
                    {visibleRows.length === 1 ? '' : 's'}
                  </p>
                  <button
                    type="button"
                    onClick={() => changeSelection(null)}
                    className="self-start rounded-lg border border-amber-500/25 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-amber-700 hover:border-amber-500/50 dark:text-amber-300"
                  >
                    Clear drill-down
                  </button>
                </div>
              )}

              <div className="max-h-[34rem] min-w-0 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {visibleRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-500 dark:border-white/10 dark:text-slate-600">
                    No loaded feed errors match this drill-down
                  </div>
                ) : displayedRows.map((failure, index) => (
                  <FeedFailureEventRow
                    key={failure?.id || `${failure?.feedId || 'feed'}-${failure?.code || index}`}
                    failure={failure}
                  />
                ))}
                {visibleRows.length > displayedRows.length && (
                  <p className="rounded-xl border border-slate-300/70 bg-white/60 px-3 py-2 text-center text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-400">
                    Showing the first {displayedRows.length.toLocaleString()} of{' '}
                    {visibleRows.length.toLocaleString()} matching loaded errors. Copy all includes
                    every loaded feed error.
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

function FeedFailureEventRow({ failure }) {
  const [copyStatus, setCopyStatus] = useState({ state: 'idle', message: '' });
  const copyStatusId = useId();
  const feedName = firstText(
    failure?.feedName,
    failure?.diagnostics?.feedName,
    failure?.feedId,
    'Unnamed feed',
  );
  const dealerHost = firstText(failure?.dealerHost, failure?.diagnostics?.dealerHost);
  const code = firstText(failure?.code, 'unknown_error');
  const stage = firstText(failure?.stage);
  const occurrences = Math.max(0, finite(failure?.occurrenceCount, 0));
  const lastSeenAt = failure?.lastSeenAt;

  async function copyEvent() {
    setCopyStatus({ state: 'working', message: 'Copying…' });
    try {
      await copyText(JSON.stringify(failure, null, 2));
      setCopyStatus({ state: 'success', message: 'Copied.' });
    } catch {
      setCopyStatus({ state: 'error', message: 'Copy failed.' });
    }
  }

  return (
    <details className="min-w-0 overflow-hidden rounded-xl border border-slate-300/70 bg-white/70 dark:border-white/10 dark:bg-black/35">
      <summary className="min-w-0 cursor-pointer px-3 py-3 marker:text-slate-500 sm:px-4">
        <div className="ml-1 min-w-0 sm:ml-2">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <strong className="min-w-0 break-words text-xs text-slate-800 dark:text-slate-200">
                  {feedName}
                </strong>
                {dealerHost && <FeedChip>{dealerHost}</FeedChip>}
                <code className="max-w-full break-all rounded-md border border-red-500/25 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-200">
                  {code}
                </code>
                {stage && <FeedChip>{stage}</FeedChip>}
                <Recoverability value={failure?.recoverable} />
              </div>
              <p className="mt-2 break-words text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                {failure?.message || 'No feed failure message was returned.'}
              </p>
            </div>
            <time
              className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-slate-500"
              dateTime={lastSeenAt || undefined}
              title={formatDate(lastSeenAt, true)}
            >
              {lastSeenAt ? formatRelative(lastSeenAt) : 'Time unknown'}
            </time>
          </div>
          <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-600 dark:text-slate-500">
            <span>
              Occurrences{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {occurrences.toLocaleString()}
              </strong>
            </span>
            {stage && (
              <span>
                Stage <strong className="text-slate-700 dark:text-slate-300">{stage}</strong>
              </span>
            )}
            <span className="font-bold text-amber-700 dark:text-amber-300">
              Expand technical details
            </span>
          </div>
        </div>
      </summary>

      <div className="min-w-0 space-y-3 border-t border-slate-300/70 bg-slate-100/65 px-3 py-3 dark:border-white/10 dark:bg-black/25 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={copyEvent}
            disabled={copyStatus.state === 'working'}
            aria-describedby={copyStatusId}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-3 text-[9px] font-black uppercase tracking-widest text-slate-700 transition hover:border-amber-500/40 hover:text-slate-950 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-slate-100"
          >
            {copyStatus.state === 'working' ? (
              <Loader2 size={11} aria-hidden="true" className="animate-spin" />
            ) : copyStatus.state === 'success' ? (
              <Check size={11} aria-hidden="true" className="text-emerald-600 dark:text-emerald-300" />
            ) : (
              <Copy size={11} aria-hidden="true" />
            )}
            Copy JSON
          </button>
          <span
            id={copyStatusId}
            role={copyStatus.state === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`text-[9px] font-bold ${
              copyStatus.state === 'error'
                ? 'text-red-600 dark:text-red-300'
                : 'text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {copyStatus.message}
          </span>
        </div>

        <dl className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
          <TechnicalFact label="Event ID" value={failure?.id} mono />
          <TechnicalFact label="Feed ID" value={failure?.feedId} mono />
          <TechnicalFact label="Feed name" value={feedName} />
          <TechnicalFact label="Dealer host" value={dealerHost} mono />
          <TechnicalFact label="Code" value={code} mono />
          <TechnicalFact label="Stage" value={stage} />
          <TechnicalFact label="Occurrences" value={occurrences} />
          <TechnicalFact
            label="First seen"
            value={failure?.firstSeenAt ? formatDate(failure.firstSeenAt, true) : ''}
          />
          <TechnicalFact
            label="Last seen"
            value={lastSeenAt ? formatDate(lastSeenAt, true) : ''}
          />
          <TechnicalFact label="App version" value={failure?.appVersion} />
          <TechnicalFact label="Platform" value={failure?.platform} />
          <TechnicalFact label="Detected platform" value={failure?.detectedPlatform} />
        </dl>

        <JsonBlock label="Diagnostics" value={failure?.diagnostics ?? null} />
        <JsonBlock label="Full feed error event" value={failure} />
      </div>
    </details>
  );
}

function FeedChip({ children }) {
  return (
    <span className="rounded-full border border-slate-300 bg-slate-100/80 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
      {children}
    </span>
  );
}

function Recoverability({ value }) {
  if (value === true) {
    return (
      <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-200">
        Recoverable
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-red-700 dark:text-red-200">
        Non-recoverable
      </span>
    );
  }
  return (
    <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-500 dark:border-white/10">
      Recovery unknown
    </span>
  );
}

function TechnicalFact({ label, value, mono = false }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="min-w-0 rounded-lg border border-slate-300/70 bg-white/75 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.025]">
      <dt className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">
        {label}
      </dt>
      <dd
        className={`mt-1 break-all text-[10px] text-slate-700 dark:text-slate-300 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {String(value)}
      </dd>
    </div>
  );
}

function JsonBlock({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">
        {label}
      </p>
      <pre className="max-h-72 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-300/70 bg-slate-950 p-3 font-mono text-[9px] leading-relaxed text-slate-200 dark:border-white/10 dark:bg-black/60 dark:text-slate-400">
        {prettyJson(value)}
      </pre>
    </div>
  );
}

function SummaryChip({ children, tone = 'slate' }) {
  const color = {
    red: 'border-red-500/25 bg-red-500/[0.09] text-red-700 dark:text-red-200',
    amber: 'border-amber-500/25 bg-amber-500/[0.09] text-amber-700 dark:text-amber-200',
    slate: 'border-slate-300 bg-white/65 text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400',
  }[tone];
  return (
    <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${color}`}>
      {children}
    </span>
  );
}

function enrichFeedName(row, feeds) {
  if (!row || typeof row !== 'object') return row;
  const feed = Array.isArray(feeds)
    ? feeds.find((candidate) => (
        firstText(candidate?.id, candidate?.feedId)
        === firstText(row.feedId)
      ))
    : null;
  const feedName = firstText(
    row.feedName,
    row.diagnostics?.feedName,
    feed?.name,
    feed?.label,
  );
  return feedName && !row.feedName ? { ...row, feedName } : row;
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
  return value?.message || 'Feed sync errors could not be loaded.';
}

function prettyJson(value) {
  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return String(value);
  }
}

function firstText(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (!['string', 'number', 'boolean'].includes(typeof value)) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function finite(value, fallback) {
  const number = Number(value);
  return value !== undefined && value !== null && value !== '' && Number.isFinite(number)
    ? number
    : fallback;
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
