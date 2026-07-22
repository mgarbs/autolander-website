import { useState } from 'react';
import { AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';
import { formatDate, formatRelative } from './lib/analytics-format.js';
import { buildLegacyFeedFailures, humanizeFailureValue } from './lib/failure-diagnostics.js';

export default function FailureDiagnostics({ failures, loading, error, legacyFeeds }) {
  const [open, setOpen] = useState(true);
  const endpointRows = Array.isArray(failures?.rows) ? failures.rows : [];
  const legacyRows = endpointRows.length === 0 ? buildLegacyFeedFailures(legacyFeeds) : [];
  const rows = endpointRows.length > 0 ? endpointRows : legacyRows;
  const showingLegacy = endpointRows.length === 0 && legacyRows.length > 0;
  const summary = failures?.summary || {};
  const total = showingLegacy ? rows.length : finite(summary.total, finite(failures?.total, rows.length));
  const recoverable = showingLegacy
    ? rows.filter((row) => row.recoverable === true).length
    : finite(summary.recoverable, rows.filter((row) => row.recoverable === true).length);
  const nonRecoverable = showingLegacy
    ? rows.filter((row) => row.recoverable === false).length
    : finite(summary.nonRecoverable, rows.filter((row) => row.recoverable === false).length);
  const uniqueFingerprints = showingLegacy
    ? uniqueSignatures(rows)
    : finite(summary.uniqueFingerprints, uniqueSignatures(rows));
  const windowDays = finite(summary.windowDays, 30);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.035]">
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="group min-w-0"
      >
        <summary className="flex min-w-0 cursor-pointer list-none flex-col gap-3 px-4 py-4 marker:hidden sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-200">Failure diagnostics</span>
              <span className="mt-1 block text-[10px] text-slate-500">
                {loading && rows.length === 0
                  ? 'Loading recent customer failures...'
                  : `${rows.length.toLocaleString()} shown${total > rows.length ? ` of ${total.toLocaleString()}` : ''} over ${windowDays} days`}
              </span>
            </span>
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <SummaryChip tone="red">{total.toLocaleString()} total</SummaryChip>
            <SummaryChip>{uniqueFingerprints.toLocaleString()} {total > rows.length ? 'shown signatures' : 'signatures'}</SummaryChip>
            {recoverable > 0 && <SummaryChip tone="amber">{recoverable.toLocaleString()} {total > rows.length ? 'shown recoverable' : 'recoverable'}</SummaryChip>}
            {nonRecoverable > 0 && <SummaryChip tone="red">{nonRecoverable.toLocaleString()} {total > rows.length ? 'shown non-recoverable' : 'non-recoverable'}</SummaryChip>}
            <ChevronDown size={15} className="ml-1 shrink-0 text-slate-500 transition group-open:rotate-180" />
          </span>
        </summary>

        <div className="min-w-0 border-t border-red-500/15 px-4 pb-4 pt-3">
          {error && (
            <p className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200">
              {error}{rows.length > 0 ? ' Showing the last available diagnostics below.' : ''}
            </p>
          )}
          {showingLegacy && (
            <p className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-3 py-2 text-[10px] font-bold text-amber-200">
              Detailed events were not returned. These are legacy last-sync errors from the account feed snapshot.
            </p>
          )}

          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-white/[0.04]" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-7 text-center text-[9px] font-black uppercase tracking-widest text-emerald-300/70">
              No failures recorded in this window
            </div>
          ) : (
            <div className="min-w-0 space-y-2">
              {rows.map((failure, index) => (
                <FailureRow key={failure.id || `${failure.fingerprint || failure.code}-${index}`} failure={failure} />
              ))}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

function FailureRow({ failure }) {
  const occurredAt = failure.occurredAt;
  const entityContext = [failure.vehicle?.label, failure.user?.label].filter(Boolean).join(' / ');

  return (
    <details className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/35">
      <summary className="min-w-0 cursor-pointer px-3 py-3 marker:text-slate-600 sm:px-4">
        <div className="ml-1 min-w-0 sm:ml-2">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <code className="max-w-full break-all rounded-md border border-red-400/20 bg-red-400/10 px-1.5 py-0.5 text-[10px] font-bold text-red-200">{failure.code}</code>
                {failure.area && <FailureChip>{humanizeFailureValue(failure.area)}</FailureChip>}
                {failure.stage && <FailureChip>{humanizeFailureValue(failure.stage)}</FailureChip>}
                <Recoverability value={failure.recoverable} />
                {failure.recentFailures !== null && failure.recentFailures !== undefined && (
                  <FailureChip>{failure.recentFailures.toLocaleString()} recent</FailureChip>
                )}
              </div>
              <p className="mt-2 break-words text-xs font-semibold leading-relaxed text-slate-200">{failure.message}</p>
              {entityContext && <p className="mt-1 break-words text-[10px] text-slate-500">{entityContext}</p>}
            </div>
            <time className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-slate-600" title={formatDate(occurredAt, true)}>
              {occurredAt ? formatRelative(occurredAt) : 'Time unknown'}
            </time>
          </div>
          <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500">
            {failure.source && <span>Source <strong className="text-slate-400">{failure.source}</strong></span>}
            {failure.appVersion && <span>App <strong className="text-slate-400">{failure.appVersion}</strong></span>}
            {failure.platform && <span>Platform <strong className="text-slate-400">{failure.platform}</strong></span>}
            <span className="font-bold text-blue-300">Expand technical details</span>
          </div>
        </div>
      </summary>

      <div className="min-w-0 space-y-3 border-t border-white/10 bg-black/25 px-3 py-3 sm:px-4">
        <dl className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
          <TechnicalFact label="Event ID" value={failure.id} />
          <TechnicalFact label="Occurred" value={occurredAt ? formatDate(occurredAt, true) : ''} />
          <TechnicalFact label="Fingerprint" value={failure.fingerprint} mono />
          <TechnicalFact label="Source" value={failure.source} />
          <TechnicalFact label="Stage" value={failure.stage} />
          <TechnicalFact label="Area" value={failure.area} />
          <TechnicalFact label="Vehicle" value={failure.vehicle?.label} />
          <TechnicalFact label="VIN / stock" value={[failure.vehicle?.vin, failure.vehicle?.stockNumber].filter(Boolean).join(' / ')} mono />
          <TechnicalFact label="User" value={failure.user?.label} />
          <TechnicalFact label="App / platform" value={[failure.appVersion, failure.platform].filter(Boolean).join(' / ')} />
        </dl>

        {Object.keys(failure.diagnostics || {}).length > 0 && (
          <JsonBlock label="Diagnostics" value={failure.diagnostics} />
        )}
        <JsonBlock label="Raw event" value={failure.raw || failure} />
      </div>
    </details>
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

function FailureChip({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400">{children}</span>;
}

function Recoverability({ value }) {
  if (value === true) return <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-200">Recoverable</span>;
  if (value === false) return <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-red-200">Non-recoverable</span>;
  return <span className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-500">Recovery unknown</span>;
}

function TechnicalFact({ label, value, mono = false }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2">
      <dt className="text-[8px] font-black uppercase tracking-widest text-slate-600">{label}</dt>
      <dd className={`mt-1 break-all text-[10px] text-slate-300 ${mono ? 'font-mono' : ''}`}>{String(value)}</dd>
    </div>
  );
}

function JsonBlock({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[8px] font-black uppercase tracking-widest text-slate-600">{label}</p>
      <pre className="max-h-72 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[9px] leading-relaxed text-slate-400">{prettyJson(value)}</pre>
    </div>
  );
}

function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function uniqueSignatures(rows) {
  return new Set(rows.map((row) => row.fingerprint || [row.code, row.stage, row.message].filter(Boolean).join('|'))).size;
}

function finite(value, fallback) {
  const number = Number(value);
  return value !== undefined && value !== null && value !== '' && Number.isFinite(number) ? number : fallback;
}
