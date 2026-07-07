import { useState } from 'react';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { openSelfServeSession, PayApiError, redirectToCheckout } from './lib/pay-api.js';
import { buildAttributionSnapshot } from './lib/attribution.js';

// Self-serve Starter/Growth/Pro picker for /pay (no token). Plan names,
// prices, and feature copy are mirrored from sections/DeferredLandingSections.jsx
// PRICING so this page matches the main site's pricing section — kept as a
// local, independent copy so this standalone lazy chunk never has to pull in
// the full landing-page bundle just to read four numbers.
const PLANS = [
  {
    code: 'STARTER',
    name: 'Starter',
    monthly: 39,
    annual: 29,
    posts: '5 Posts / Day',
    features: [
      'Instant Inventory Sync',
      'Auto Queue',
      'Standard AI Descriptions',
      'Feed Sync (Website / DMS / Custom Feeds / CarGurus / Cars.com)',
      '25 welcome AI Studio credits',
    ],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    monthly: 59,
    annual: 44,
    posts: '10 Posts / Day',
    features: [
      'Everything in Starter',
      'Pro AI Descriptions',
      'Priority Syncing',
      '50 welcome AI Studio credits',
    ],
  },
  {
    code: 'PRO',
    name: 'Pro',
    monthly: 79,
    annual: 59,
    posts: '20 Posts / Day',
    popular: true,
    features: [
      'Everything in Growth',
      'Unlimited Marketplace Support',
      'Concierge Setup',
      'Dedicated Support Agent',
      '150 welcome AI Studio credits',
    ],
  },
];

export default function SelfServePicker() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [pendingPlan, setPendingPlan] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function startCheckout(planCode) {
    if (pendingPlan) return;
    setPendingPlan(planCode);
    setErrorMessage('');
    try {
      const attribution = buildAttributionSnapshot();
      const interval = isAnnual ? 'annual' : 'monthly';
      const response = await openSelfServeSession({ planCode, interval, attribution });
      if (response?.url) {
        redirectToCheckout(response.url);
        return;
      }
      throw new PayApiError('No checkout URL was returned.', { reason: 'missing_url' });
    } catch (err) {
      setErrorMessage(err?.message || 'Could not start checkout. Please try again.');
      setPendingPlan('');
    }
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-3xl font-black uppercase italic tracking-tighter text-white sm:text-5xl">
          Start your <span className="text-blue-500">AutoLander</span> plan.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-slate-400 sm:text-base">
          Pick a plan below and check out securely with Stripe. You can change or cancel anytime from inside the app.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <span
            id="self-serve-monthly-label"
            className={`text-sm font-bold uppercase italic ${!isAnnual ? 'text-white' : 'text-slate-400'}`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isAnnual}
            aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
            aria-describedby="self-serve-monthly-label self-serve-annual-label"
            onClick={() => setIsAnnual(!isAnnual)}
            className="flex h-7 w-14 items-center rounded-full border border-white/10 bg-white/10 p-1 transition-all"
          >
            <div
              className={`h-5 w-5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 transition-transform ${
                isAnnual ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              id="self-serve-annual-label"
              className={`text-sm font-bold uppercase italic ${isAnnual ? 'text-white' : 'text-slate-400'}`}
            >
              Annual
            </span>
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-green-400">
              Save 25%
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">
          <TriangleAlert size={16} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3 md:gap-8">
        {PLANS.map((plan) => {
          const isPopular = plan.popular;
          const price = isAnnual ? plan.annual : plan.monthly;
          const isPending = pendingPlan === plan.code;

          return (
            <div
              key={plan.code}
              className={`relative flex h-full flex-col rounded-[32px] p-8 transition-all duration-500 sm:p-10 ${
                isPopular
                  ? 'z-10 scale-105 bg-blue-600 text-white shadow-2xl shadow-blue-500/20'
                  : 'border border-white/5 bg-white/[0.03] text-slate-50 hover:bg-white/[0.05]'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black italic tracking-tighter lg:text-5xl">${price}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">/ Month</span>
                </div>
                {isAnnual && (
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-50">
                    Annual billing selected
                  </p>
                )}
                <p className={`mt-4 text-sm font-bold italic tracking-tight ${isPopular ? 'text-blue-100' : 'text-blue-500'}`}>
                  {plan.posts}
                </p>
              </div>

              <div className="mb-10 flex-grow space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${isPopular ? 'text-white' : 'text-blue-500'}`} />
                    <span className="text-sm font-medium opacity-90">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => startCheckout(plan.code)}
                disabled={Boolean(pendingPlan)}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase italic tracking-tighter transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  isPopular
                    ? 'bg-white text-blue-600 hover:bg-slate-100'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500'
                }`}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {isPending ? 'Redirecting…' : 'Start Free Trial'}
              </button>
              <p className="mt-4 text-center text-[10px] font-black uppercase italic tracking-widest opacity-40">
                First 5 posts are free
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
