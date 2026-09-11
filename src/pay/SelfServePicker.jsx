import { useState } from 'react';
import { Download, ArrowUpRight } from 'lucide-react';
import { openSignupHandoff } from '../lib/signup-handoff.js';

const SYSTEMS = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };

// Create/sign in to the account before choosing a paid plan. The app can then
// start checkout with that account's existing Stripe customer and identity.
export default function SelfServePicker() {
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  const [os, setOs] = useState(() => /Mac/i.test(navigator.userAgent) ? 'mac'
    : /Linux/i.test(navigator.userAgent) ? 'linux' : 'windows');

  function continueInApp(openApp = false) {
    const referralCode = (new URLSearchParams(window.location.search).get('ref') || '').trim().toLowerCase();
    openSignupHandoff({ os, referralCode, openApp });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Get started with AutoLander.</h1>
      <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
        Install the app, create your free account, then choose your plan inside AutoLander.
      </p>
      <ol className="my-8 space-y-4 text-slate-300">
        <li><strong className="text-white">1. Install AutoLander</strong> on your Windows, Mac or Linux computer.</li>
        <li><strong className="text-white">2. Create your account</strong> or sign in to the one you already have.</li>
        <li><strong className="text-white">3. Choose your plan</strong> in the app when you’re ready.</li>
      </ol>

      {mobile ? (
        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-6">
          <h2 className="font-bold text-white">Continue on your computer</h2>
          <p className="mt-2 leading-relaxed text-slate-300">
            AutoLander runs on a desktop or laptop. Open <strong className="text-white">autolander.ai/pay</strong> on that computer to install the app and get started.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <label htmlFor="self-serve-os" className="block text-sm font-semibold text-slate-300">Your computer</label>
          <select id="self-serve-os" value={os} onChange={(event) => setOs(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/20 bg-[#151922] px-4 py-3 text-white">
            {Object.entries(SYSTEMS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="button" onClick={() => continueInApp()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400">
            <Download size={18} aria-hidden="true" /> Download for {SYSTEMS[os]}
          </button>
          <p className="mt-3 text-sm text-slate-400">No payment required to create your account.</p>
          <div className="mt-6 border-t border-white/10 pt-5">
            <button type="button" onClick={() => continueInApp(true)}
              className="inline-flex items-center gap-2 font-semibold text-blue-300 underline-offset-4 hover:underline">
              Already installed? Open AutoLander <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">Already have an account? Sign in and manage your plan in Billing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
