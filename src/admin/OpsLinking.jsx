import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle, Info, Link2, Loader2, RefreshCw, Search, UserRoundSearch, X, Zap } from 'lucide-react';
import { apiPost } from './lib/api.js';
import {
  OPS_SETUP_NOTE,
  candidateSubscriptionSummary,
  describeLinkEffect,
  fetchUnlinked,
  formatAge,
  formatCents,
  isOpsNotConfigured,
  searchCandidates,
} from './lib/ops.js';

export default function OpsLinking() {
  const [unlinked, setUnlinked] = useState([]);
  const [unlinkedLoading, setUnlinkedLoading] = useState(true);
  const [unlinkedError, setUnlinkedError] = useState('');
  const [unlinkedQuery, setUnlinkedQuery] = useState('');
  const [opsUnavailable, setOpsUnavailable] = useState(false);

  const [candQuery, setCandQuery] = useState('');
  const [candResults, setCandResults] = useState([]);
  const [candSearching, setCandSearching] = useState(false);
  const candSearchSeq = useRef(0);

  const [selectedPayer, setSelectedPayer] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [force, setForce] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewPending, setPreviewPending] = useState(false);
  const [applyPending, setApplyPending] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkedMessage, setLinkedMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const previewSeq = useRef(0);

  const loadUnlinked = useCallback(async (query = '') => {
    setUnlinkedLoading(true);
    setUnlinkedError('');
    try {
      const rows = await fetchUnlinked(query);
      setUnlinked(rows);
    } catch (err) {
      if (isOpsNotConfigured(err)) {
        setOpsUnavailable(true);
      } else {
        setUnlinkedError(err?.message || 'Could not load unlinked payers.');
      }
    } finally {
      setUnlinkedLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUnlinked();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadUnlinked]);

  useEffect(() => {
    const query = candQuery.trim();
    const seq = candSearchSeq.current + 1;
    candSearchSeq.current = seq;
    const shouldSearch = query.length >= 2 && !opsUnavailable;
    const timeoutId = window.setTimeout(async () => {
      if (candSearchSeq.current !== seq) return;
      if (!shouldSearch) {
        setCandResults([]);
        setCandSearching(false);
        return;
      }
      setCandSearching(true);
      try {
        const rows = await searchCandidates(query);
        if (candSearchSeq.current !== seq) return;
        setCandResults(rows);
      } catch (err) {
        if (candSearchSeq.current !== seq) return;
        setCandResults([]);
        if (isOpsNotConfigured(err)) setOpsUnavailable(true);
      } finally {
        if (candSearchSeq.current === seq) setCandSearching(false);
      }
    }, shouldSearch ? 300 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [candQuery, opsUnavailable]);

  function resetLinkFlow() {
    previewSeq.current += 1; // discard any in-flight preview for the old selection
    setPreview(null);
    setLinkError('');
    setShowDetails(false);
  }

  function pickPayer(payer) {
    setSelectedPayer((current) => (current?.subId === payer.subId ? null : payer));
    setLinkedMessage('');
    setForce(false);
    resetLinkFlow();
  }

  function pickCandidate(candidate) {
    setSelectedCandidate((current) => (current?.orgId === candidate.orgId ? null : candidate));
    setLinkedMessage('');
    setForce(false);
    resetLinkFlow();
  }

  // Auto-run the dry-run the moment BOTH sides are picked, so the operator sees a
  // plain-English "what will happen" summary without hunting for a button. The
  // sequence guard drops a stale preview if the selection changes mid-request.
  useEffect(() => {
    // No preview to run until both sides are picked. `preview` is already cleared
    // by resetLinkFlow() on every pick, so nothing to reset here (a synchronous
    // setState in an effect body triggers cascading renders — avoid it).
    if (!selectedPayer?.subId || !selectedCandidate?.orgId) {
      return undefined;
    }
    const seq = previewSeq.current + 1;
    previewSeq.current = seq;
    const subscriptionId = selectedPayer.subId;
    const orgId = selectedCandidate.orgId;
    const plan = selectedPayer.detectedPlan;
    const timeoutId = window.setTimeout(async () => {
      if (previewSeq.current !== seq) return;
      setPreviewPending(true);
      setLinkError('');
      try {
        const response = await apiPost('/admin/ops/link', {
          subscriptionId,
          orgId,
          ...(plan ? { plan } : {}),
          ...(force ? { force: true } : {}),
          apply: false,
        });
        if (previewSeq.current !== seq) return;
        setPreview(response);
      } catch (err) {
        if (previewSeq.current !== seq) return;
        setPreview(null);
        if (isOpsNotConfigured(err)) setOpsUnavailable(true);
        else setLinkError(friendlyLinkError(err));
      } finally {
        if (previewSeq.current === seq) setPreviewPending(false);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [selectedPayer, selectedCandidate, force]);

  async function applyLink() {
    if (!selectedPayer?.subId || !selectedCandidate?.orgId) return;
    setApplyPending(true);
    setLinkError('');
    try {
      await apiPost('/admin/ops/link', {
        subscriptionId: selectedPayer.subId,
        orgId: selectedCandidate.orgId,
        ...(selectedPayer.detectedPlan ? { plan: selectedPayer.detectedPlan } : {}),
        ...(force ? { force: true } : {}),
        apply: true,
      });
      setLinkedMessage(
        `${selectedPayer.email || selectedPayer.subId} is now linked to ${
          selectedCandidate.orgName || selectedCandidate.orgId
        }. That account is active and the customer needs to do nothing.`,
      );
      previewSeq.current += 1;
      setPreview(null);
      setUnlinked((rows) => rows.filter((row) => row.subId !== selectedPayer.subId));
      setSelectedPayer(null);
      setSelectedCandidate(null);
      setForce(false);
      setShowDetails(false);
    } catch (err) {
      if (isOpsNotConfigured(err)) setOpsUnavailable(true);
      else setLinkError(friendlyLinkError(err));
    } finally {
      setApplyPending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <Link2 size={20} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Account Linking</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Payment-link payers not attached to any account
            </p>
          </div>
        </div>
        {!opsUnavailable && (
          <button
            type="button"
            onClick={() => loadUnlinked(unlinkedQuery)}
            disabled={unlinkedLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={13} className={unlinkedLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-5 p-5">
        {opsUnavailable ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200">
            {OPS_SETUP_NOTE}
          </div>
        ) : (
          <>
            <div className="flex gap-3 rounded-xl border border-blue-400/20 bg-blue-400/[0.06] px-4 py-3">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-300" />
              <div className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                <p className="font-bold text-white">Most payments attach to their account on their own.</p>
                <p>
                  A payment only shows up here when we couldn&apos;t match it automatically — usually because the customer
                  paid with a different email than the one on their AutoLander login. To attach one by hand:
                </p>
                <ol className="ml-1 list-inside list-decimal space-y-0.5 text-slate-400">
                  <li><span className="font-bold text-slate-200">Step 1</span> — click the payment on the left.</li>
                  <li>
                    <span className="font-bold text-slate-200">Step 2</span> — search the right side for the dealership
                    (by business name, the person&apos;s first or last name, or their email) and click it.
                  </li>
                  <li><span className="font-bold text-slate-200">Step 3</span> — read the plain-English summary of what will happen.</li>
                  <li><span className="font-bold text-slate-200">Step 4</span> — click <span className="font-bold text-emerald-300">Confirm &amp; Link</span>.</li>
                </ol>
              </div>
            </div>

            {linkedMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-emerald-200">
                <CheckCircle size={14} />
                {linkedMessage}
              </div>
            )}

            <div className="grid gap-5 xl:grid-cols-2">
              {/* Unlinked payers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <UserRoundSearch size={14} />
                  Step 1 · Pick the payment
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    loadUnlinked(unlinkedQuery);
                  }}
                  className="relative"
                >
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={unlinkedQuery}
                    onChange={(event) => setUnlinkedQuery(event.target.value)}
                    placeholder="Filter these payments by email or name, then Enter…"
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500/60"
                  />
                </form>
                {unlinkedError && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
                    {unlinkedError}
                  </p>
                )}
                {unlinkedLoading ? (
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading payers…</p>
                ) : unlinked.length === 0 && !unlinkedError ? (
                  <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100">
                    No unlinked payers. Every payment-link subscription is attached to an account.
                  </p>
                ) : (
                  <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-1">
                    {unlinked.map((payer) => {
                      const active = selectedPayer?.subId === payer.subId;
                      return (
                        <button
                          key={payer.subId}
                          type="button"
                          onClick={() => pickPayer(payer)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                            active
                              ? 'border-blue-500/60 bg-blue-500/10'
                              : 'border-transparent hover:bg-white/10'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-white">
                              {payer.email || payer.name || payer.subId}
                            </span>
                            <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {[payer.name && payer.email ? payer.name : '', payer.status, formatAge(payer.created)]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-sm font-black text-emerald-300">
                              {formatCents(payer.priceCents)}
                              {payer.interval ? `/${payer.interval === 'year' || payer.interval === 'annual' ? 'yr' : 'mo'}` : ''}
                            </span>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {payer.detectedPlan || 'plan unknown'}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Candidate accounts */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Search size={14} />
                  Step 2 · Pick the account
                </div>
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={candQuery}
                    onChange={(event) => setCandQuery(event.target.value)}
                    placeholder="Search by dealership, first &amp; last name, or email…"
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-xs text-white outline-none focus:border-blue-500/60"
                  />
                  {candSearching && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                  )}
                </div>
                {candResults.length > 0 && (
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-1">
                    {candResults.map((candidate) => {
                      const active = selectedCandidate?.orgId === candidate.orgId;
                      return (
                        <button
                          key={candidate.orgId}
                          type="button"
                          onClick={() => pickCandidate(candidate)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                            active
                              ? 'border-blue-500/60 bg-blue-500/10'
                              : 'border-transparent hover:bg-white/10'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-white">
                              {candidate.orgName || candidate.orgId}
                            </span>
                            <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {candidate.admins.length > 0 ? candidate.admins.join(', ') : candidate.orgId}
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {candidateSubscriptionSummary(candidate)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {!candSearching && candQuery.trim().length >= 2 && candResults.length === 0 && (
                  <p className="text-xs text-slate-500">No matching accounts.</p>
                )}

                {/* Step 3/4 — what will happen + confirm */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className={selectedPayer ? 'text-white' : 'text-slate-600'}>
                      {selectedPayer ? selectedPayer.email || selectedPayer.subId : 'Step 1: pick a payment'}
                    </span>
                    <ArrowRight size={13} className="text-slate-600" />
                    <span className={selectedCandidate ? 'text-white' : 'text-slate-600'}>
                      {selectedCandidate ? selectedCandidate.orgName || selectedCandidate.orgId : 'Step 2: pick an account'}
                    </span>
                  </div>

                  {!selectedPayer || !selectedCandidate ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Pick a payment and an account above to see exactly what linking them will do.
                    </p>
                  ) : linkError ? (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
                        These two can&apos;t be linked: {linkError}
                      </div>
                      {/^(.*already.*link|different.*org|conflict)/i.test(linkError) && !force && (
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                          <input
                            type="checkbox"
                            checked={force}
                            onChange={(event) => setForce(event.target.checked)}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-black/40 accent-amber-500"
                          />
                          Override the existing link (only if you&apos;re sure)
                        </label>
                      )}
                    </div>
                  ) : previewPending ? (
                    <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Loader2 size={14} className="animate-spin" />
                      Checking what will happen…
                    </p>
                  ) : preview ? (
                    <div className="mt-3 space-y-3">
                      {(() => {
                        const effect = describeLinkEffect({ payer: selectedPayer, candidate: selectedCandidate, preview });
                        return (
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Here&apos;s what will happen</p>
                            <p className="mt-1.5 text-sm font-bold text-white">{effect.lead}</p>
                            <ul className="mt-2 space-y-1.5">
                              {effect.bullets.map((line, i) => (
                                <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-300">
                                  <CheckCircle size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={applyLink}
                          disabled={applyPending}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-[10px] font-black uppercase italic tracking-tight text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {applyPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                          Confirm &amp; Link
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayer(null);
                            setSelectedCandidate(null);
                            setForce(false);
                            resetLinkFlow();
                          }}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          Nothing changes until you confirm
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDetails((v) => !v)}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
                      >
                        {showDetails ? 'Hide technical details' : 'Show technical details'}
                      </button>
                      {showDetails && <DiffView result={preview} />}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Turn a link API error into something a non-technical operator can act on.
function friendlyLinkError(err) {
  const reason = String(err?.reason || '').toUpperCase();
  const map = {
    DIFFERENT_ORG: 'this payment is already linked to a different account. Tick the override box to move it.',
    GROUP_CUSTOMER: 'this payment belongs to a dealer group and is billed through the group, so it can’t be attached to one rooftop here.',
    BAD_STATUS: 'this subscription isn’t in a linkable state (it may be canceled or unpaid).',
    PLAN_MISMATCH: 'the amount paid doesn’t match this plan. Double-check you picked the right payment.',
    PLAN_UNDETECTED: 'we couldn’t tell which plan this payment is for from its price.',
  };
  return map[reason] || err?.message || 'the link could not be completed.';
}

function DiffView({ result }) {
  const diff = result?.diff && typeof result.diff === 'object' ? result.diff : result;
  const before = diff?.before;
  const after = diff?.after;

  if (before && typeof before === 'object' && after && typeof after === 'object') {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return (
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">Before</th>
              <th className="px-3 py-2">After</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => {
              const beforeValue = renderValue(before[key]);
              const afterValue = renderValue(after[key]);
              const changed = beforeValue !== afterValue;
              return (
                <tr key={key} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 font-bold text-slate-400">{key}</td>
                  <td className={`px-3 py-2 font-mono ${changed ? 'text-red-300/80 line-through' : 'text-slate-500'}`}>
                    {beforeValue}
                  </td>
                  <td className={`px-3 py-2 font-mono ${changed ? 'font-bold text-emerald-300' : 'text-slate-500'}`}>
                    {afterValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-lg border border-white/10 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

function renderValue(value) {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
