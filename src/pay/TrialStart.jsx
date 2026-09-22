import { useState } from 'react';
import { CalendarClock, Loader2, MessageSquareText, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { openSelfServeSession, PayApiError, redirectToCheckout } from './lib/pay-api.js';
import { buildAttributionSnapshot } from './lib/attribution.js';
import {
  SUPPORT_TEXT_HREF,
  SUPPORT_TEXT_NUMBER,
  TRIAL_DAYS,
  TRIAL_MONTHLY_LABEL,
  TRIAL_POSTS_PER_DAY,
  TRIAL_TERMS,
  buildTrialCheckoutBody,
  trialErrorMessage,
  validateTrialForm,
} from './lib/trial.js';

// Starter 3-day trial entry, reached from the CRM URL
// https://autolander.ai/pay/?trial=starter3d (design doc §3). Collects the
// four CRM fields, then opens a card-required $0-today Stripe Checkout through
// the public self-serve endpoint. Like TokenCheckout this page NEVER fires a
// Meta Purchase/Schedule pixel and has no analytics call of its own — the
// verified conversion is emitted server-side from the Stripe webhook.

const EMPTY_FIELDS = { businessName: '', fullName: '', email: '', phone: '' };

const FIELDS = [
  { name: 'businessName', label: 'Dealership or business name', autoComplete: 'organization', type: 'text', placeholder: 'Example Motors' },
  { name: 'fullName', label: 'Your name', autoComplete: 'name', type: 'text', placeholder: 'First and last name' },
  { name: 'email', label: 'Email', autoComplete: 'email', type: 'email', placeholder: 'you@dealership.com', inputMode: 'email' },
  { name: 'phone', label: 'Mobile phone', autoComplete: 'tel', type: 'tel', placeholder: '(555) 555-0123', inputMode: 'tel' },
];

export default function TrialStart() {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const busy = pending || redirecting;

  function updateField(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;

    const checked = validateTrialForm(fields);
    if (!checked.ok) {
      setFieldErrors(checked.errors);
      setErrorMessage('');
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    setPending(true);
    try {
      const body = buildTrialCheckoutBody({ crm: checked.crm, attribution: buildAttributionSnapshot() });
      const response = await openSelfServeSession(body);
      if (response?.url) {
        setRedirecting(true);
        redirectToCheckout(response.url);
        return;
      }
      throw new PayApiError('No checkout URL was returned.', { reason: 'missing_url', body: response });
    } catch (err) {
      setErrorMessage(trialErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <section>
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
          <Sparkles size={12} aria-hidden="true" /> {TRIAL_DAYS}-day free trial
        </p>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Try Starter free for {TRIAL_DAYS} days.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">{TRIAL_TERMS}</p>
        <ul className="mt-8 space-y-4 text-slate-300">
          <li className="flex gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-300" aria-hidden="true" />
            <span><strong className="text-white">Card required, $0 today.</strong> Stripe holds your card; nothing is charged during the trial.</span>
          </li>
          <li className="flex gap-3">
            <CalendarClock size={20} className="mt-0.5 shrink-0 text-blue-300" aria-hidden="true" />
            <span>
              <strong className="text-white">Then {TRIAL_MONTHLY_LABEL}/month</strong> (plus any applicable tax) for Starter — {TRIAL_POSTS_PER_DAY} posts a day — unless you cancel under Configuration → Billing in AutoLander before the trial ends.
            </span>
          </li>
          <li className="flex gap-3">
            <MessageSquareText size={20} className="mt-0.5 shrink-0 text-blue-300" aria-hidden="true" />
            <span>
              <strong className="text-white">Your login arrives by email</strong> right after checkout. AutoLander runs on your Windows, Mac or Linux computer.
            </span>
          </li>
        </ul>
      </section>

      <form
        onSubmit={submit}
        noValidate
        className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 sm:p-8"
      >
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Start your trial</h2>
        <div className="mt-4 space-y-4">
          {FIELDS.map((field) => {
            const error = fieldErrors[field.name];
            const inputId = `trial-${field.name}`;
            return (
              <div key={field.name}>
                <label htmlFor={inputId} className="block text-sm font-semibold text-slate-300">
                  {field.label}
                </label>
                <input
                  id={inputId}
                  name={field.name}
                  type={field.type}
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={fields[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  disabled={busy}
                  required
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  className={`mt-2 w-full rounded-xl border bg-[#151922] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 disabled:opacity-60 ${
                    error ? 'border-red-500/60' : 'border-white/20'
                  }`}
                />
                {error && (
                  <p id={`${inputId}-error`} className="mt-1.5 text-xs font-bold text-red-300">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold leading-relaxed text-red-200"
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}
          {redirecting ? 'Redirecting to secure checkout…' : pending ? 'Checking eligibility…' : 'Start my free trial'}
        </button>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          You will be redirected to Stripe to add your card securely. $0 today.
        </p>
        <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-400">
          Questions or already have an account? Text Clay at{' '}
          <a href={SUPPORT_TEXT_HREF} className="font-semibold text-blue-300 underline-offset-4 hover:underline">
            {SUPPORT_TEXT_NUMBER}
          </a>
          .
        </p>
      </form>
    </div>
  );
}
