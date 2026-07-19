import { useEffect, useRef, useState } from 'react';
import { CalendarDays, CheckCircle, Gift, Loader2, Percent, RefreshCw, Search, Sparkles } from 'lucide-react';
import {
  SUPPORT_ADJUSTMENTS_SETUP_NOTE,
  canDiscount,
  canScheduleBillingDate,
  candidateLabel,
  candidatePeople,
  formatCents,
  formatCredits,
  friendlyAdjustmentError,
  grantSupportCredits,
  isSupportAdjustmentsNotConfigured,
  issueSupportDiscount,
  scheduleNextBillingDate,
  searchSupportCandidates,
  subscriptionSummary,
} from './lib/support-adjustments.js';

const DEFAULT_CREDIT_NOTE = 'Support credit adjustment';
const DEFAULT_DISCOUNT_NOTE = 'Support discount adjustment';

export default function SupportAdjustments({ embedded = false }) {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const searchSeq = useRef(0);

  const [creditAmount, setCreditAmount] = useState('50');
  const [creditNote, setCreditNote] = useState(DEFAULT_CREDIT_NOTE);
  const [creditPending, setCreditPending] = useState(false);
  const [creditMessage, setCreditMessage] = useState(null);

  const [discountPercent, setDiscountPercent] = useState('25');
  const [discountNote, setDiscountNote] = useState(DEFAULT_DISCOUNT_NOTE);
  const [discountPending, setDiscountPending] = useState(false);
  const [discountMessage, setDiscountMessage] = useState(null);

  const [nextBillingDate, setNextBillingDate] = useState('');
  const [billingDatePending, setBillingDatePending] = useState(false);
  const [billingDateMessage, setBillingDateMessage] = useState(null);

  useEffect(() => {
    const q = query.trim();
    const seq = searchSeq.current + 1;
    searchSeq.current = seq;
    const shouldSearch = q.length >= 2 && !unavailable;
    const timeoutId = window.setTimeout(async () => {
      if (searchSeq.current !== seq) return;
      if (!shouldSearch) {
        setCandidates([]);
        setSearching(false);
        setSearchError('');
        return;
      }
      setSearching(true);
      setSearchError('');
      try {
        const rows = await searchSupportCandidates(q);
        if (searchSeq.current !== seq) return;
        setCandidates(rows);
      } catch (err) {
        if (searchSeq.current !== seq) return;
        setCandidates([]);
        if (isSupportAdjustmentsNotConfigured(err)) setUnavailable(true);
        else setSearchError(friendlyAdjustmentError(err));
      } finally {
        if (searchSeq.current === seq) setSearching(false);
      }
    }, shouldSearch ? 250 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [query, unavailable]);

  function pickCandidate(candidate) {
    setSelected(candidate);
    setCreditMessage(null);
    setDiscountMessage(null);
    setBillingDateMessage(null);
    setNextBillingDate(firstSafeBillingDate(candidate));
  }

  async function submitCredits(event) {
    event.preventDefault();
    if (!selected?.orgId || creditPending) return;
    const amount = Number(creditAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setCreditMessage({ type: 'error', text: 'Enter a positive whole number of credits.' });
      return;
    }
    setCreditPending(true);
    setCreditMessage(null);
    try {
      const response = await grantSupportCredits({
        orgId: selected.orgId,
        amount,
        note: creditNote.trim() || DEFAULT_CREDIT_NOTE,
        idempotencyKey: makeIdempotencyKey('credits'),
      });
      const balance = response?.grant?.balance ?? response?.org?.creditBalance ?? selected.creditBalance;
      const updated = { ...selected, creditBalance: balance };
      setSelected(updated);
      setCandidates((rows) => rows.map((row) => (row.orgId === updated.orgId ? { ...row, creditBalance: balance } : row)));
      setCreditMessage({
        type: 'success',
        text: `${formatCredits(amount)} credits added. Balance is now ${formatCredits(balance)}.`,
      });
    } catch (err) {
      if (isSupportAdjustmentsNotConfigured(err)) setUnavailable(true);
      setCreditMessage({ type: 'error', text: friendlyAdjustmentError(err) });
    } finally {
      setCreditPending(false);
    }
  }

  async function submitDiscount(event) {
    event.preventDefault();
    if (!selected?.orgId || discountPending) return;
    const percentOff = Number(discountPercent);
    if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
      setDiscountMessage({ type: 'error', text: 'Enter a whole percent from 1 to 100.' });
      return;
    }
    setDiscountPending(true);
    setDiscountMessage(null);
    try {
      const response = await issueSupportDiscount({
        orgId: selected.orgId,
        percentOff,
        note: discountNote.trim() || DEFAULT_DISCOUNT_NOTE,
      });
      const before = response?.discount?.before?.amountDue;
      const after = response?.discount?.after?.amountDue;
      setDiscountMessage({
        type: 'success',
        text: after !== undefined && after !== null
          ? `${percentOff}% discount applied. Next invoice: ${formatCents(before)} -> ${formatCents(after)}.`
          : `${percentOff}% discount applied to the next invoice.`,
      });
    } catch (err) {
      if (isSupportAdjustmentsNotConfigured(err)) setUnavailable(true);
      setDiscountMessage({ type: 'error', text: friendlyAdjustmentError(err) });
    } finally {
      setDiscountPending(false);
    }
  }

  async function submitBillingDate(event) {
    event.preventDefault();
    const subscriptionId = selected?.subscription?.stripeSubscriptionId;
    if (!subscriptionId || billingDatePending) return;
    if (!nextBillingDate) {
      setBillingDateMessage({ type: 'error', text: 'Choose the date normal monthly billing should resume.' });
      return;
    }
    if (!canScheduleBillingDate(selected)) {
      setBillingDateMessage({
        type: 'error',
        text: 'This account needs an active, uncancelled monthly Stripe subscription. Complex subscriptions must be adjusted in Stripe.',
      });
      return;
    }

    setBillingDatePending(true);
    setBillingDateMessage(null);
    try {
      const response = await scheduleNextBillingDate({ subscriptionId, nextBillingDate });
      const scheduleId = response?.scheduleId;
      const updated = {
        ...selected,
        subscription: {
          ...selected.subscription,
          ...(scheduleId ? { stripeScheduleId: scheduleId } : {}),
        },
      };
      setSelected(updated);
      setCandidates((rows) => rows.map((row) => (row.orgId === updated.orgId ? updated : row)));
      setBillingDateMessage({
        type: 'success',
        text: response?.nextBillingAt
          ? `Current renewal waived. Normal monthly billing resumes ${formatDateTime(response.nextBillingAt)}.`
          : 'Current renewal waived. Normal monthly billing will resume on the selected date.',
      });
    } catch (err) {
      setBillingDateMessage({ type: 'error', text: friendlyAdjustmentError(err) });
    } finally {
      setBillingDatePending(false);
    }
  }

  if (unavailable) {
    return (
      <section className={embedded ? 'min-w-0' : 'rounded-2xl border border-white/10 bg-white/[0.03]'}>
        <div className={embedded ? 'hidden' : 'flex items-center gap-3 border-b border-white/10 px-5 py-4'}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Sparkles size={20} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Support Adjustments</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Credits, billing dates, and next-month discounts</p>
          </div>
        </div>
        <div className="p-5">
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200">
            {SUPPORT_ADJUSTMENTS_SETUP_NOTE}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={embedded ? 'min-w-0' : 'rounded-2xl border border-white/10 bg-white/[0.03]'}>
      <div className={`flex flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between ${embedded ? 'pt-5' : 'border-b border-white/10 py-4'}`}>
        <div className={embedded ? 'hidden' : 'flex items-center gap-3'}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Sparkles size={20} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Support Adjustments</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Credits, billing dates, and next-month discounts
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            searchSeq.current += 1;
            setQuery('');
            setCandidates([]);
            setSelected(null);
            setSearchError('');
            setCreditMessage(null);
            setDiscountMessage(null);
            setNextBillingDate('');
            setBillingDateMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white"
        >
          <RefreshCw size={13} />
          Clear
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer, email, dealership, or username..."
            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-white outline-none focus:border-emerald-500/60"
          />
          {searching && (
            <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </div>

        {searchError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
            {searchError}
          </p>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-2">
            {query.trim().length < 2 ? (
              <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs font-bold text-slate-500">
                Start with a name, email, dealership, or username.
              </p>
            ) : !searching && candidates.length === 0 && !searchError ? (
              <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs font-bold text-slate-500">
                No matching accounts.
              </p>
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-1">
                {candidates.map((candidate) => {
                  const active = selected?.orgId === candidate.orgId;
                  return (
                    <button
                      key={candidate.orgId}
                      type="button"
                      onClick={() => pickCandidate(candidate)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                        active ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white">{candidateLabel(candidate)}</span>
                        <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {candidatePeople(candidate) || candidate.orgId}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-black text-emerald-300">
                          {formatCredits(candidate.creditBalance)} cr
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {subscriptionSummary(candidate)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
            {selected ? (
              <>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Selected account</p>
                  <p className="mt-1 truncate text-sm font-bold text-white">{candidateLabel(selected)}</p>
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {candidatePeople(selected) || selected.orgId}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <Summary label="Credits" value={`${formatCredits(selected.creditBalance)} cr`} />
                    <Summary label="Subscription" value={subscriptionSummary(selected)} />
                  </div>
                </div>

                <form onSubmit={submitBillingDate} className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <CalendarDays size={14} />
                    Next Billing Date
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Waives the current renewal once, then resumes normal monthly billing on your selected date. The account
                    stays active — it does not enter a free-trial state.
                  </p>
                  {selected?.subscription?.currentPeriodEnd && (
                    <p className="rounded-lg border border-blue-400/20 bg-blue-400/[0.06] px-3 py-2 text-xs font-bold text-blue-100">
                      Current Stripe renewal: {formatDateTime(selected.subscription.currentPeriodEnd)}
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Resume billing on</span>
                      <input
                        required
                        type="date"
                        min={firstSafeBillingDate(selected) || undefined}
                        value={nextBillingDate}
                        onChange={(event) => setNextBillingDate(event.target.value)}
                        disabled={!canScheduleBillingDate(selected) || billingDatePending}
                        className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={billingDatePending || !canScheduleBillingDate(selected)}
                      className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {billingDatePending ? <Loader2 size={14} className="animate-spin" /> : <CalendarDays size={14} />}
                      Schedule Date
                    </button>
                  </div>
                  {!canScheduleBillingDate(selected) && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Active, uncancelled monthly Stripe subscription required
                    </span>
                  )}
                  <Message message={billingDateMessage} />
                </form>

                <form onSubmit={submitCredits} className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Gift size={14} />
                    Add AI Credits
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={creditAmount}
                      onChange={(event) => setCreditAmount(event.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-emerald-500/60"
                    />
                    <input
                      value={creditNote}
                      onChange={(event) => setCreditNote(event.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creditPending}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-[10px] font-black uppercase italic tracking-tight text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creditPending ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
                    Grant Credits
                  </button>
                  <Message message={creditMessage} />
                </form>

                <form onSubmit={submitDiscount} className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Percent size={14} />
                    Next-Month Discount
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={discountPercent}
                        onChange={(event) => setDiscountPercent(event.target.value)}
                        className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 pr-8 text-sm font-bold text-white outline-none focus:border-emerald-500/60"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">%</span>
                    </div>
                    <input
                      value={discountNote}
                      onChange={(event) => setDiscountNote(event.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={discountPending || !canDiscount(selected)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {discountPending ? <Loader2 size={14} className="animate-spin" /> : <Percent size={14} />}
                      Apply Discount
                    </button>
                    {!canDiscount(selected) && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        Monthly Stripe subscription required
                      </span>
                    )}
                  </div>
                  <Message message={discountMessage} />
                </form>
              </>
            ) : (
              <p className="text-xs font-bold text-slate-500">Pick an account to make an adjustment.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-white">{value || '-'}</p>
    </div>
  );
}

function Message({ message }) {
  if (!message) return null;
  const success = message.type === 'success';
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
        success
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'border-red-500/30 bg-red-500/10 text-red-200'
      }`}
    >
      {success ? <CheckCircle size={14} /> : <Sparkles size={14} />}
      {message.text}
    </div>
  );
}

function makeIdempotencyKey(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toDate(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') {
    const millis = value < 10000000000 ? value * 1000 : value;
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function firstSafeBillingDate(candidate) {
  const end = toDate(candidate?.subscription?.currentPeriodEnd);
  if (!end) return '';
  end.setUTCDate(end.getUTCDate() + 1);
  return end.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  const date = toDate(value);
  return date ? date.toLocaleString() : 'the current renewal date';
}
