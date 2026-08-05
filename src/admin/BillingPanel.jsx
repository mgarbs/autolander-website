import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import {
  fetchBillingStatus,
  forgivePastDueAndReschedule,
  friendlyAdjustmentError,
  scheduleNextBillingDate,
} from './lib/support-adjustments.js';
import {
  buildBillingBridgeCopy,
  buildBillingConfirmCopy,
  buildBillingResumeCopy,
  buildBillingSuccessCopy,
  buildPastDueNoticeCopy,
  formatBillingAmount,
  formatBillingDate,
} from './lib/billing-panel-format.js';

export default function BillingPanel({
  orgId,
  subscription,
  groupId,
  onChanged,
}) {
  const stripeSubscriptionId = text(subscription?.stripeSubscriptionId);
  const groupBilled = Boolean(
    subscription?.billedByGroupId
      || (groupId && !stripeSubscriptionId),
  );
  const requestSequence = useRef(0);
  const [billingStatus, setBillingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadBillingStatus = useCallback(async ({ background = false } = {}) => {
    if (!stripeSubscriptionId) return false;

    const sequence = ++requestSequence.current;
    setLoading(true);
    setLoadError(null);
    if (!background) setBillingStatus(null);

    try {
      const result = await fetchBillingStatus(stripeSubscriptionId);
      if (sequence !== requestSequence.current) return false;
      setBillingStatus(result);
      if (result?.mode === 'past_due' && text(result.resumeTargetDate)) {
        setNextBillingDate(text(result.resumeTargetDate));
      }
      return true;
    } catch (error) {
      if (sequence !== requestSequence.current) return false;
      setLoadError(error);
      return false;
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [stripeSubscriptionId]);

  useEffect(() => {
    requestSequence.current += 1;
    setBillingStatus(null);
    setLoadError(null);
    setNextBillingDate('');
    setConfirming(false);
    setSubmitting(false);
    setMessage(null);

    if (!groupBilled && stripeSubscriptionId) loadBillingStatus();

    return () => {
      requestSequence.current += 1;
    };
  }, [groupBilled, loadBillingStatus, orgId, stripeSubscriptionId]);

  async function submitConfirmedAction() {
    const mode = billingStatus?.mode;
    if (
      submitting
      || !nextBillingDate
      || (mode !== 'schedulable' && mode !== 'past_due')
    ) return;

    const submittedDate = nextBillingDate;
    setSubmitting(true);
    setMessage(null);

    try {
      if (mode === 'past_due') {
        await forgivePastDueAndReschedule({
          orgId,
          subscriptionId: stripeSubscriptionId,
          nextBillingDate: submittedDate,
        });
      } else {
        await scheduleNextBillingDate({
          subscriptionId: stripeSubscriptionId,
          nextBillingDate: submittedDate,
        });
      }

      setMessage({
        type: 'success',
        text: buildBillingSuccessCopy({ mode, nextBillingDate: submittedDate }),
      });
      setNextBillingDate('');
      setConfirming(false);

      const followUps = [loadBillingStatus({ background: true })];
      if (typeof onChanged === 'function') {
        try {
          followUps.push(Promise.resolve(onChanged()));
        } catch {
          // The billing change succeeded even if the parent refresh could not start.
        }
      }
      await Promise.allSettled(followUps);
    } catch (error) {
      setMessage({ type: 'error', text: friendlyAdjustmentError(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-w-0 space-y-3">
      <SectionTitle>Billing</SectionTitle>
      <div className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
        {groupBilled ? (
          <StaticState>
            Billed through their dealer group — this dealership doesn&apos;t have its own card subscription.
          </StaticState>
        ) : !stripeSubscriptionId ? (
          <StaticState>No card subscription on file.</StaticState>
        ) : (
          <div className="min-w-0 space-y-4">
            {message && <Message message={message} />}

            {loading && !billingStatus ? (
              <div className="flex min-h-16 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-4 text-xs font-bold text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Checking billing…
              </div>
            ) : loadError && !billingStatus ? (
              <LoadError
                error={loadError}
                loading={loading}
                onRetry={() => loadBillingStatus()}
              />
            ) : billingStatus ? (
              <BillingState
                billingStatus={billingStatus}
                confirming={confirming}
                loading={loading}
                nextBillingDate={nextBillingDate}
                onCancelConfirm={() => setConfirming(false)}
                onChangeDate={(value) => {
                  setNextBillingDate(value);
                  setConfirming(false);
                  if (message?.type === 'error') setMessage(null);
                }}
                onConfirm={() => setConfirming(true)}
                onSubmit={submitConfirmedAction}
                submitting={submitting}
              />
            ) : null}

            {loadError && billingStatus && (
              <LoadError
                error={loadError}
                loading={loading}
                onRetry={() => loadBillingStatus({ background: true })}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function BillingState({
  billingStatus,
  confirming,
  loading,
  nextBillingDate,
  onCancelConfirm,
  onChangeDate,
  onConfirm,
  onSubmit,
  submitting,
}) {
  const mode = billingStatus.mode;
  const amount = formatBillingAmount(billingStatus.amountCents, billingStatus.currency);

  if (mode === 'schedulable') {
    const chargeDate = formatBillingDate(
      billingStatus.currentPeriodEndIso || billingStatus.currentPeriodEnd,
    );

    return (
      <div className="min-w-0 space-y-4">
        <p className="text-sm font-bold text-slate-200">
          Next charge: {amount} on {chargeDate} · billed monthly
        </p>
        <BillingAction
          billingStatus={billingStatus}
          buttonLabel="Move billing date"
          confirming={confirming}
          confirmButtonLabel="Yes — move it"
          label="Move their next charge to"
          loading={loading}
          nextBillingDate={nextBillingDate}
          onCancelConfirm={onCancelConfirm}
          onChangeDate={onChangeDate}
          onConfirm={onConfirm}
          onSubmit={onSubmit}
          submitting={submitting}
        />
        {!confirming && (
          <p className="text-xs leading-relaxed text-slate-500">
            They keep full access. Nothing is charged until the new date — then that becomes their regular monthly charge day.
          </p>
        )}
      </div>
    );
  }

  if (mode === 'past_due') {
    const openInvoices = Array.isArray(billingStatus.openInvoices)
      ? billingStatus.openInvoices
      : [];
    const unpaidInvoice = openInvoices[0];
    const unpaidInvoiceCount = openInvoices.length;
    const unpaidAmountCents = unpaidInvoice?.totalCents ?? billingStatus.amountCents;
    const unpaidTotalCents = openInvoices.reduce((total, invoice) => {
      const invoiceTotal = Number(invoice?.totalCents);
      return total + (Number.isFinite(invoiceTotal) ? invoiceTotal : 0);
    }, 0);
    const oldestUnpaidInvoice = openInvoices[openInvoices.length - 1] || unpaidInvoice;
    const oldestInvoiceDate = oldestUnpaidInvoice?.createdIso || oldestUnpaidInvoice?.createdAt;
    const resumeTargetDate = text(billingStatus.resumeTargetDate);

    return (
      <div className="min-w-0 space-y-4">
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-3 text-sm font-bold leading-relaxed text-amber-100">
          {buildPastDueNoticeCopy({
            unpaidInvoiceCount,
            unpaidAmountCents,
            unpaidTotalCents,
            oldestInvoiceDate,
            currency: billingStatus.currency,
          })}
        </p>
        <BillingAction
          billingStatus={billingStatus}
          buttonLabel="Forgive & move billing date"
          confirming={confirming}
          confirmButtonLabel="Yes — forgive & move"
          dateHelperText={buildBillingResumeCopy(resumeTargetDate)}
          dateInputLocked={Boolean(resumeTargetDate)}
          label="Forgive the unpaid bill and charge on"
          loading={loading}
          nextBillingDate={nextBillingDate}
          onCancelConfirm={onCancelConfirm}
          onChangeDate={onChangeDate}
          onConfirm={onConfirm}
          onSubmit={onSubmit}
          submitting={submitting}
          unpaidAmountCents={unpaidAmountCents}
          unpaidInvoiceCount={unpaidInvoiceCount}
          unpaidTotalCents={unpaidTotalCents}
        />
      </div>
    );
  }

  if (mode === 'trial_bridge') {
    const trialEnd = billingStatus.trialEndIso || billingStatus.trialEnd;
    return (
      <p className="text-sm font-bold leading-relaxed text-slate-200">
        {buildBillingBridgeCopy({
          trialEnd,
          amountCents: billingStatus.amountCents,
          currency: billingStatus.currency,
        })}
      </p>
    );
  }

  return (
    <p className="text-sm leading-relaxed text-slate-400">
      {billingStatus.message || 'This subscription cannot be adjusted here.'}
    </p>
  );
}

function BillingAction({
  billingStatus,
  buttonLabel,
  confirming,
  confirmButtonLabel,
  dateHelperText,
  dateInputLocked = false,
  label,
  loading,
  nextBillingDate,
  onCancelConfirm,
  onChangeDate,
  onConfirm,
  onSubmit,
  submitting,
  unpaidAmountCents,
  unpaidInvoiceCount,
  unpaidTotalCents,
}) {
  const busy = loading || submitting;

  if (confirming) {
    return (
      <div className="rounded-xl border border-blue-400/20 bg-blue-400/[0.08] p-3">
        <p className="text-xs font-bold leading-relaxed text-blue-50">
          {buildBillingConfirmCopy({
            mode: billingStatus.mode,
            nextBillingDate,
            amountCents: billingStatus.amountCents,
            unpaidAmountCents,
            unpaidInvoiceCount,
            unpaidTotalCents,
            currency: billingStatus.currency,
          })}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onSubmit}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={12} className="animate-spin" />}
            {confirmButtonLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancelConfirm}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Never mind
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <label className="min-w-0 space-y-1.5">
        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-600">
          {label}
        </span>
        <input
          type="date"
          min={billingStatus.minDate}
          max={billingStatus.maxDate}
          value={nextBillingDate}
          disabled={busy || dateInputLocked}
          readOnly={dateInputLocked}
          onChange={(event) => onChangeDate(event.target.value)}
          className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {dateHelperText && (
          <span className="block text-[11px] font-semibold leading-relaxed text-amber-200/80">
            {dateHelperText}
          </span>
        )}
      </label>
      <button
        type="button"
        disabled={busy || !nextBillingDate}
        onClick={onConfirm}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <CalendarDays size={13} />}
        {buttonLabel}
      </button>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h4 className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
      <CalendarDays size={14} className="shrink-0 text-blue-300" />
      <span className="min-w-0 truncate">{children}</span>
    </h4>
  );
}

function StaticState({ children }) {
  return <p className="text-sm leading-relaxed text-slate-400">{children}</p>;
}

function Message({ message }) {
  return (
    <p className={`rounded-xl border px-3 py-2.5 text-xs font-bold leading-relaxed ${
      message.type === 'success'
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
        : 'border-red-500/30 bg-red-500/10 text-red-200'
    }`}>
      {message.text}
    </p>
  );
}

function LoadError({ error, loading, onRetry }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0 text-xs font-bold leading-relaxed text-red-200">
        {friendlyAdjustmentError(error)}
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={onRetry}
        className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg border border-red-300/20 px-3 text-[9px] font-black uppercase tracking-widest text-red-100 hover:bg-red-400/10 disabled:opacity-50"
      >
        {loading && <Loader2 size={11} className="animate-spin" />}
        Try again
      </button>
    </div>
  );
}

function text(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}
