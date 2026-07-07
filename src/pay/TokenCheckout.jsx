import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { getPaySummary, openPaySession, PayApiError, redirectToCheckout } from './lib/pay-api.js';
import { buildAttributionSnapshot } from './lib/attribution.js';

const PHASE = {
  loading: 'loading',
  ready: 'ready', // summary loaded, "Continue to secure checkout" available
  redirecting: 'redirecting',
  success: 'success', // ?state=success — presentational only, no Purchase pixel
  completed: 'completed', // record already paid (independent of the return-URL state)
  unavailable: 'unavailable', // disabled / expired / not found / 410
  error: 'error',
};

function formatMoney(cents, currency = 'usd') {
  if (!Number.isFinite(Number(cents))) return null;
  return (Number(cents) / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: String(currency || 'usd').toUpperCase(),
  });
}

function intervalLabel(interval) {
  if (interval === 'annual' || interval === 'year' || interval === 'yearly') return '/year';
  if (interval === 'one_time' || interval === 'one-time') return ' one-time';
  return '/month';
}

// Normalizes the cloud's GET /api/pay/:token summary payload defensively, the
// same way admin/lib/ops.js normalizes ops payloads — so minor field-name
// drift on the cloud side doesn't break this page.
function normalizeSummary(payload) {
  const amount = payload?.amountSummary && typeof payload.amountSummary === 'object' ? payload.amountSummary : {};
  return {
    planName: payload?.planName || payload?.plan?.name || payload?.planCode || 'AutoLander plan',
    amountCents: Number.isFinite(Number(amount.cents ?? payload?.amountCents))
      ? Number(amount.cents ?? payload?.amountCents)
      : null,
    currency: amount.currency || payload?.currency || 'usd',
    interval: payload?.interval || payload?.billingInterval || 'monthly',
    businessName: payload?.businessName || payload?.crmSnapshot?.businessName || '',
    status: payload?.status || 'created',
    livemode: Boolean(payload?.livemode),
  };
}

export default function TokenCheckout({ token, state }) {
  // `?state=success` is presentational-only: the return URL from Stripe.
  // The verified conversion event is emitted server-side from the Stripe
  // webhook (initial_subscription_payment_paid), never from this page — per
  // the design doc §5 and the site's conversion invariants, this view NEVER
  // fires a Meta Purchase/Schedule pixel. Seeded as the initial phase (not
  // set inside an effect, which would need a render before showing) — the
  // summary fetch below only fills in display copy (businessName) for this
  // phase and is never allowed to drive `phase` away from success.
  const isSuccessReturn = state === 'success';
  const [phase, setPhase] = useState(() => (isSuccessReturn ? PHASE.success : PHASE.loading));
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectPending, setRedirectPending] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!isSuccessReturn) setPhase(PHASE.loading);
    setErrorMessage('');
    try {
      const payload = await getPaySummary(token);
      const normalized = normalizeSummary(payload);
      setSummary(normalized);
      if (isSuccessReturn) return; // already showing the success view — never move off it

      if (normalized.status === 'completed') {
        setPhase(PHASE.completed);
      } else if (normalized.status === 'disabled' || normalized.status === 'expired' || normalized.status === 'failed') {
        setPhase(PHASE.unavailable);
      } else {
        setPhase(PHASE.ready);
      }
    } catch (err) {
      if (isSuccessReturn) return; // a stale/failed re-fetch must not bump the customer off the success view
      if (err instanceof PayApiError && (err.status === 410 || err.reason === 'expired' || err.reason === 'disabled')) {
        setPhase(PHASE.unavailable);
        return;
      }
      if (err instanceof PayApiError && (err.status === 404 || err.reason === 'not_found')) {
        setPhase(PHASE.unavailable);
        setErrorMessage('This payment link was not found.');
        return;
      }
      setPhase(PHASE.error);
      setErrorMessage(err?.message || 'Could not load this payment link.');
    }
  }, [isSuccessReturn, token]);

  useEffect(() => {
    // Deferred via setTimeout(0) — same idiom as admin/Dashboard.jsx and
    // admin/OpsLinking.jsx's mount-fetch effects — so the fetch (and its
    // setState calls) runs outside the synchronous effect body.
    const timeoutId = window.setTimeout(() => {
      loadSummary();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSummary]);

  const continueToCheckout = useCallback(async () => {
    if (redirectPending) return;
    setRedirectPending(true);
    setErrorMessage('');
    try {
      const attribution = buildAttributionSnapshot();
      const response = await openPaySession(token, { attribution });
      if (response?.status === 'completed') {
        setPhase(PHASE.completed);
        return;
      }
      if (response?.url) {
        setPhase(PHASE.redirecting);
        redirectToCheckout(response.url);
        return;
      }
      throw new PayApiError('No checkout URL was returned.', { reason: 'missing_url' });
    } catch (err) {
      if (err instanceof PayApiError && (err.status === 410 || err.reason === 'expired' || err.reason === 'disabled')) {
        setPhase(PHASE.unavailable);
        return;
      }
      setErrorMessage(err?.message || 'Could not start checkout. Please try again.');
    } finally {
      setRedirectPending(false);
    }
  }, [redirectPending, token]);

  if (phase === PHASE.loading) {
    return <CenteredCard><LoadingBlock label="Loading your payment details…" /></CenteredCard>;
  }

  if (phase === PHASE.success) {
    return (
      <CenteredCard>
        <IconBadge tone="emerald"><CheckCircle2 size={28} /></IconBadge>
        <h1 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
          Payment received
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Check your email for your receipt and next steps. Your AutoLander team will follow up shortly to get you
          set up.
        </p>
        {summary?.businessName && (
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">{summary.businessName}</p>
        )}
      </CenteredCard>
    );
  }

  if (phase === PHASE.completed) {
    return (
      <CenteredCard>
        <IconBadge tone="emerald"><CheckCircle2 size={28} /></IconBadge>
        <h1 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
          Already paid
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          This payment link has already been used. If you have questions about your subscription, email{' '}
          <a href="mailto:sales@autolander.ai" className="text-blue-400 underline underline-offset-2">
            sales@autolander.ai
          </a>
          .
        </p>
      </CenteredCard>
    );
  }

  if (phase === PHASE.unavailable) {
    return (
      <CenteredCard>
        <IconBadge tone="amber"><TriangleAlert size={28} /></IconBadge>
        <h1 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
          Link no longer active
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {errorMessage || 'This payment link has expired or was disabled. Please request a new one from your AutoLander contact.'}
        </p>
      </CenteredCard>
    );
  }

  if (phase === PHASE.error) {
    return (
      <CenteredCard>
        <IconBadge tone="red"><TriangleAlert size={28} /></IconBadge>
        <h1 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{errorMessage}</p>
        <button
          type="button"
          onClick={loadSummary}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white"
        >
          Try again
        </button>
      </CenteredCard>
    );
  }

  // PHASE.ready (covers both the fresh open and the `?state=cancel` return —
  // cancel just re-shows this exact same checkout button per the design doc).
  const money = formatMoney(summary?.amountCents, summary?.currency);
  return (
    <CenteredCard>
      {state === 'cancel' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-200">
          <TriangleAlert size={16} className="shrink-0" />
          Checkout was canceled. You can pick up right where you left off below.
        </div>
      )}

      <IconBadge tone="blue"><Lock size={26} /></IconBadge>
      <h1 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
        Complete your payment
      </h1>
      {summary?.businessName && (
        <p className="mt-1 text-sm font-bold text-slate-400">{summary.businessName}</p>
      )}

      <div className="mt-8 w-full rounded-2xl border border-white/10 bg-black/40 p-6 text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Plan</p>
        <p className="mt-1 text-lg font-black uppercase italic tracking-tight text-white">{summary?.planName}</p>
        {money && (
          <p className="mt-3 text-3xl font-black italic tracking-tight text-white">
            {money}
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
              {intervalLabel(summary?.interval)}
            </span>
          </p>
        )}
      </div>

      {errorMessage && (
        <p className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={continueToCheckout}
        disabled={redirectPending || phase === PHASE.redirecting}
        className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {redirectPending || phase === PHASE.redirecting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ShieldCheck size={18} />
        )}
        {redirectPending || phase === PHASE.redirecting ? 'Redirecting to secure checkout…' : 'Continue to secure checkout'}
      </button>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
        You will be redirected to Stripe to complete your payment securely.
      </p>
    </CenteredCard>
  );
}

function CenteredCard({ children }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/40 sm:p-10">
      {children}
    </div>
  );
}

function IconBadge({ tone = 'blue', children }) {
  const tones = {
    blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    red: 'border-red-400/20 bg-red-400/10 text-red-300',
  };
  return (
    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${tones[tone] || tones.blue}`}>
      {children}
    </span>
  );
}

function LoadingBlock({ label }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Loader2 size={28} className="animate-spin text-blue-400" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}
