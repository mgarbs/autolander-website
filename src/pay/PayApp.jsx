import { useEffect, useMemo, useState } from 'react';
import { CarFront } from 'lucide-react';
import SelfServePicker from './SelfServePicker.jsx';
import TokenCheckout from './TokenCheckout.jsx';
import TrialStart from './TrialStart.jsx';
import { trialCodeFromSearch } from './lib/trial.js';
import { checkoutSessionIdFor } from './lib/checkout-session.js';

// Root of the /pay SPA surface (design doc §7). Three shapes:
//   /pay                   -> install/sign in before choosing a plan (SelfServePicker)
//   /pay/?trial=starter3d  -> Starter 3-day card-required trial entry (TrialStart, §3)
//   /pay/:token            -> durable checkout link opened from admin/app (TokenCheckout)
// Root.jsx already gates on window.location.pathname.startsWith('/pay') before
// lazy-loading this component, so we only need to pull the token (if any) back
// out of the path here.
function tokenFromPath() {
  if (typeof window === 'undefined') return '';
  const match = window.location.pathname.match(/^\/pay\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function PayApp() {
  const [token] = useState(tokenFromPath);
  const state = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('state') || '';
  }, []);
  // Only honored when there is no token: a durable /pay/:token link always
  // wins over a stray ?trial= on the same URL.
  const trialCode = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return trialCodeFromSearch(window.location.search);
  }, []);
  const showTrial = !token && Boolean(trialCode);
  // The Stripe Checkout Session id main.jsx moved out of the URL (sessionStorage) on the
  // success return — lets the success view ask the cloud for the payer e-mail.
  const sessionId = useMemo(
    () => (token && state === 'success' ? checkoutSessionIdFor(token) : ''),
    [token, state],
  );

  useEffect(() => {
    document.title = token
      ? 'Complete your payment — AutoLander'
      : showTrial
        ? 'Start your free trial — AutoLander'
        : 'Get started with AutoLander';
  }, [token, showTrial]);

  return (
    <div className="min-h-dvh bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="hidden md:block fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 px-4 pt-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 sm:h-10 sm:w-10">
              <CarFront className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <img
              src="/autolander-logo-240.webp"
              srcSet="/autolander-logo-200.webp 200w, /autolander-logo-240.webp 240w, /autolander-logo.png 400w"
              sizes="(min-width: 640px) 187px, 107px"
              alt="AutoLander"
              width="400"
              height="120"
              decoding="async"
              className="h-7 w-auto sm:h-10"
            />
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        {token ? (
          <TokenCheckout token={token} state={state} sessionId={sessionId} />
        ) : showTrial ? (
          <TrialStart />
        ) : (
          <SelfServePicker />
        )}
      </main>

      <footer className="relative z-10 px-4 pb-10 text-center sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
          {token || showTrial ? 'Secure checkout powered by Stripe · ' : ''}Questions? sales@autolander.ai
        </p>
      </footer>
    </div>
  );
}
