import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AiFaq, AiFinalCta, AiFooter, AiHeader, AiHero, AiMobileCtaBar, HowSteps, NextStep, ReasonsSection,
  ReportSection, ShiftSection,
} from './AiSections.jsx';
import { scrollBehavior } from './scroll.js';
import {
  ROLE_CHOICES, formatPhoneInput, hasFirstAndLastName, isValidEmail, isValidPhone, newSubmissionId,
  normalizeWebsite, submitScanRequest,
} from './scan-request.js';
import './ai.css';

/**
 * /ai-visibility — the free AI Visibility Scan page for car dealers (the hook of the AI Visibility
 * service). Not linked from the site, noindex (the shell from scripts/spa-fallback.mjs already carries
 * robots noindex; this component re-asserts it on mount), not in the sitemap.
 *
 * The form posts to POST /api/ai-scan (spec in the hand-off note). It never touches /api/apply and
 * never fires a Lead: the Worker sends one server event, AIScanRequest. Deploy this page together
 * with (or after) that Worker route; until the route exists the form shows an honest error.
 */

const initialForm = {
  dealershipName: '',
  website: '',
  location: '',
  fullName: '',
  role: '',
  email: '',
  phone: '',
  smsConsent: false,
  company: '', // honeypot (hidden); a real visitor never fills it
};

const FIELD = 'mt-2 h-12 w-full rounded-xl border bg-black/40 px-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30';
const fieldClass = (bad) => `${FIELD} ${bad ? 'border-red-500/70 focus:border-red-500/70' : 'border-white/10 focus:border-blue-500/60'}`;

const REASON_TEXT = {
  missing_dealership: ['dealershipName', 'Enter your dealership’s name.'],
  invalid_website: ['website', 'That website does not look right, e.g. yourstore.com.'],
  missing_location: ['location', 'Enter your city or ZIP code.'],
  missing_full_name: ['fullName', 'Enter your first and last name.'],
  missing_role: ['role', 'Choose your role at the dealership.'],
  invalid_email: ['email', 'That e-mail does not look right. Re-enter it and try again.'],
  invalid_phone: ['phone', 'That mobile number does not look right. Re-enter it and try again.'],
};

function validate(form) {
  if (!form.dealershipName.trim()) return 'missing_dealership';
  if (!normalizeWebsite(form.website)) return 'invalid_website';
  if (!form.location.trim()) return 'missing_location';
  if (!hasFirstAndLastName(form.fullName)) return 'missing_full_name';
  if (!ROLE_CHOICES.includes(form.role)) return 'missing_role';
  if (!isValidEmail(form.email)) return 'invalid_email';
  if (!isValidPhone(form.phone)) return 'invalid_phone';
  return '';
}

function ScanForm() {
  const [form, setForm] = useState(initialForm);
  const [phase, setPhase] = useState('capture'); // capture | submitting | success
  const [error, setError] = useState('');
  const [badField, setBadField] = useState('');
  const submissionId = useMemo(() => newSubmissionId(), []);
  const statusRef = useRef(null);
  const formRef = useRef(null);
  const doneRef = useRef(null);

  // The confirmation is shorter than the form: bring it into view and announce it.
  useEffect(() => {
    if (phase !== 'success' || !doneRef.current) return;
    doneRef.current.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    doneRef.current.focus({ preventScroll: true });
  }, [phase]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (badField === key) setBadField('');
  };

  const fail = (reason) => {
    const known = REASON_TEXT[reason];
    if (known) {
      setBadField(known[0]);
      setError(known[1]);
    } else if (reason === 'blocked') {
      setError('We couldn’t send that from this browser. E-mail sales@autolander.ai with your store’s name and we’ll run your scan.');
    } else if (reason === 'rate_limited') {
      setError('Too many requests from this connection. Try again in an hour, or e-mail sales@autolander.ai.');
    } else {
      setError('We couldn’t send that just now. Try again in a minute, or e-mail sales@autolander.ai and we’ll run your scan.');
    }
    // A field error puts the cursor in that field (its message is tied to it); anything else focuses the message.
    window.setTimeout(() => {
      const field = known ? formRef.current?.querySelector(`[name="${known[0]}"]`) : null;
      (field || statusRef.current)?.focus();
    }, 0);
  };

  const submit = async (event) => {
    event.preventDefault();
    const reason = validate(form);
    if (reason) {
      fail(reason);
      return;
    }
    setPhase('submitting');
    setError('');
    try {
      const res = await submitScanRequest({
        ...form,
        website: normalizeWebsite(form.website),
        location: form.location.trim(),
        consentTimestamp: new Date().toISOString(),
        submissionId,
      });
      if (res.ok) {
        setPhase('success');
        return;
      }
      setPhase('capture');
      fail(res.reason);
    } catch {
      setPhase('capture');
      fail('network');
    }
  };

  if (phase === 'success') {
    return (
      <div ref={doneRef} tabIndex={-1} className="rounded-[2rem] border border-emerald-400/25 bg-[#0b0d12] p-6 outline-none sm:p-8" role="status">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Request received</p>
        <p className="mt-3 font-display text-2xl font-extrabold uppercase italic text-white">Your scan is on its way.</p>
        <p className="mt-4 leading-relaxed text-slate-300">
          We’ll run {form.dealershipName.trim() || 'your store'}’s scan, and a person on our team reviews the report before it goes out. It comes to {form.email.trim()}, and we’ll set up your 20-minute walkthrough from there.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">Nothing else to do for now. No logins, nothing to install.</p>
      </div>
    );
  }

  const busy = phase === 'submitting';
  return (
    <form id="scan-form" ref={formRef} onSubmit={submit} noValidate className="rounded-[2rem] border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
      <p className="font-display text-2xl font-extrabold uppercase italic text-white">Get your free AI Visibility Scan</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">About a minute. A person on our team checks your report before we send it.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-bold text-slate-200">Dealership</span>
          <input name="dealershipName" aria-required="true" aria-describedby={badField === 'dealershipName' ? 'scan-status' : undefined} autoComplete="organization" value={form.dealershipName} onChange={(e) => update('dealershipName', e.target.value)} aria-invalid={badField === 'dealershipName'} className={fieldClass(badField === 'dealershipName')} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-200">Website</span>
          <input name="website" aria-required="true" aria-describedby={badField === 'website' ? 'scan-status' : undefined} inputMode="url" autoComplete="url" placeholder="yourstore.com" value={form.website} onChange={(e) => update('website', e.target.value)} aria-invalid={badField === 'website'} className={fieldClass(badField === 'website')} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-200">City or ZIP</span>
          <input name="location" aria-required="true" aria-describedby={badField === 'location' ? 'scan-status' : undefined} autoComplete="postal-code" maxLength={80} value={form.location} onChange={(e) => update('location', e.target.value)} aria-invalid={badField === 'location'} className={fieldClass(badField === 'location')} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-200">Your name</span>
          <input name="fullName" aria-required="true" aria-describedby={badField === 'fullName' ? 'scan-status' : undefined} autoComplete="name" placeholder="First and last name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} aria-invalid={badField === 'fullName'} className={fieldClass(badField === 'fullName')} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-200">Your role</span>
          <select name="role" aria-required="true" aria-describedby={badField === 'role' ? 'scan-status' : undefined} value={form.role} onChange={(e) => update('role', e.target.value)} aria-invalid={badField === 'role'} className={fieldClass(badField === 'role')}>
            <option value="">Choose…</option>
            {ROLE_CHOICES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-200">E-mail <span className="font-normal text-slate-400">(your report goes here)</span></span>
          <input name="email" aria-required="true" aria-describedby={badField === 'email' ? 'scan-status' : undefined} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} aria-invalid={badField === 'email'} className={fieldClass(badField === 'email')} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-200">Mobile <span className="font-normal text-slate-400">(for your 20-minute walkthrough)</span></span>
          <input name="phone" aria-required="true" aria-describedby={badField === 'phone' ? 'scan-status' : undefined} type="tel" inputMode="tel" autoComplete="tel" placeholder="(212) 555-0123" value={form.phone} onChange={(e) => update('phone', formatPhoneInput(e.target.value))} aria-invalid={badField === 'phone'} className={fieldClass(badField === 'phone')} />
        </label>
      </div>
      {/* Honeypot: hidden from people and screen readers, filled only by bots. A meaningless name and no label,
          so browser autofill never fills it (the payload key stays `company` for the Worker). */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <input name="al_hp_x7" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => update('company', e.target.value)} />
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-slate-300">
        <input name="smsConsent" type="checkbox" checked={form.smsConsent} onChange={(e) => update('smsConsent', e.target.checked)} className="mt-1 h-4 w-4" />
        <span>Text me when my report is ready. Message and data rates may apply; reply STOP to opt out.</span>
      </label>
      <button
        type="submit"
        data-scan-cta=""
        disabled={busy}
        className="mt-5 flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70 sm:text-lg"
      >
        {busy ? 'Sending…' : 'Run my free scan'}
      </button>
      <p id="scan-status" ref={statusRef} tabIndex={-1} className={`mt-3 text-sm outline-none ${error ? 'text-red-300' : 'text-slate-400'}`} aria-live="polite">{error}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">Built for car dealers. We use your details to run your scan, send your report and set up your walkthrough.</p>
    </form>
  );
}

export default function AiVisibilityApp() {
  const formSectionRef = useRef(null);

  useEffect(() => {
    document.title = 'Free AI Visibility Scan for Car Dealers | AutoLander';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow, noarchive');
  }, []);

  // Every CTA scrolls to the form and puts the cursor in the first field (no hash left in the URL).
  const goToForm = useCallback((event) => {
    event?.preventDefault?.();
    const section = formSectionRef.current;
    if (!section) return;
    section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    window.setTimeout(() => section.querySelector('input[name="dealershipName"]')?.focus({ preventScroll: true }), 600);
  }, []);

  return (
    <div className="min-h-dvh bg-[#050505] font-sans text-slate-50 selection:bg-blue-500/30 selection:text-blue-200">
      <AiHeader onGo={goToForm} />
      <main id="main-content">
        <AiHero onGo={goToForm} />
        <ShiftSection />
        <ReportSection />
        <ReasonsSection />
        <section id="scan" ref={formSectionRef} className="scroll-mt-4 py-20 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-2">
            <HowSteps />
            <div className="relative">
              <ScanForm />
            </div>
          </div>
        </section>
        <NextStep />
        <AiFaq />
        <AiFinalCta onGo={goToForm} />
      </main>
      <AiFooter />
      <AiMobileCtaBar onGo={goToForm} formRef={formSectionRef} />
    </div>
  );
}
