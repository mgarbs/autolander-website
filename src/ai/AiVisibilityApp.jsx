import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import {
  FOOTER,
  FOOTER_NAV,
  FORM,
  META,
  ROLE_CHOICES,
  SMS_CONSENT,
  SUCCESS,
} from '../../shared/ai-visibility-content.js';
import SiteFooter from '../components/SiteFooter.jsx';
import SiteNav from '../components/SiteNav.jsx';
import {
  AeoGeoSection,
  AiFaq,
  AiFinalCta,
  AiHero,
  AiMobileCtaBar,
  AboutService,
  HowSteps,
  PlansSection,
  ReasonsSection,
  ReportSection,
  ShiftSection,
  WhereBuyersAskSection,
  ResultsViewSection,
} from './AiSections.jsx';
import { ProofSection } from './ProofSection.jsx';
import { scrollBehavior } from './scroll.js';
import StaticIsland from '../components/StaticIsland.jsx';
import { HYDRATE_OPTIONS, islandHtml } from '../lib/boot.js';
import { carryValues, useLive } from '../lib/use-live.js';
import {
  CAPI_URL,
  formatPhoneInput,
  hasFirstAndLastName,
  isValidEmail,
  isValidPhone,
  newSubmissionId,
  normalizeWebsite,
  submitScanRequest,
} from './scan-request.js';
import './ai.css';

const initialForm = {
  dealershipName: '',
  website: '',
  location: '',
  fullName: '',
  role: '',
  email: '',
  phone: '',
  smsConsent: false,
  company: '',
};

const FIELD = 'mt-2 h-12 w-full rounded-xl border bg-black/40 px-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30';
const fieldClass = (bad) => `${FIELD} ${bad ? 'border-red-500/70 focus:border-red-500/70' : 'border-white/10 focus:border-blue-500/60'}`;
const REASON_FIELD = {
  missing_dealership: 'dealershipName',
  invalid_website: 'website',
  missing_location: 'location',
  missing_full_name: 'fullName',
  missing_role: 'role',
  invalid_email: 'email',
  invalid_phone: 'phone',
};

function validate(form) {
  const errors = {};
  if (!form.dealershipName.trim()) errors.dealershipName = 'missing_dealership';
  if (!normalizeWebsite(form.website)) errors.website = 'invalid_website';
  if (!form.location.trim()) errors.location = 'missing_location';
  if (!hasFirstAndLastName(form.fullName)) errors.fullName = 'missing_full_name';
  if (!ROLE_CHOICES.includes(form.role)) errors.role = 'missing_role';
  if (!isValidEmail(form.email)) errors.email = 'invalid_email';
  if (!isValidPhone(form.phone)) errors.phone = 'invalid_phone';
  return errors;
}

function returnedState() {
  if (typeof window === 'undefined') return { sent: false, reason: '' };
  const query = new URLSearchParams(window.location.search);
  return { sent: query.get('sent') === '1', reason: query.get('error') || '' };
}

const Hint = ({ id, children }) => children ? <span id={id} className="mt-1 block text-xs leading-relaxed text-slate-400">{children}</span> : null;
const InlineError = ({ id, reason }) => reason ? <span id={id} className="mt-1 block text-xs leading-relaxed text-red-300">{FORM.errors[reason]}</span> : null;

// Starts from what a visitor typed into the static island's copy of this form before the page went live.
function carriedForm(values) {
  const form = carryValues(initialForm, values);
  return form.phone ? { ...form, phone: formatPhoneInput(form.phone) } : form;
}

function ScanForm({ initialValues = null }) {
  const returned = useMemo(() => returnedState(), []);
  const [form, setForm] = useState(() => carriedForm(initialValues));
  const [phase, setPhase] = useState(returned.sent ? 'success' : 'capture');
  const [fieldErrors, setFieldErrors] = useState(() => {
    const field = REASON_FIELD[returned.reason];
    return field ? { [field]: returned.reason } : {};
  });
  const [error, setError] = useState(() => returned.reason ? (FORM.errors[returned.reason] || FORM.errors.noJsError) : '');
  const [agentAssisted, setAgentAssisted] = useState(false);
  const [reference, setReference] = useState('');
  const submissionId = useMemo(() => newSubmissionId(), []);
  const statusRef = useRef(null);
  const formRef = useRef(null);
  const doneRef = useRef(null);

  useEffect(() => {
    if (phase !== 'success' || !doneRef.current) return;
    doneRef.current.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    doneRef.current.focus({ preventScroll: true });
  }, [phase]);

  const markAgentAssisted = useCallback(() => {
    setAgentAssisted(true);
    setForm((current) => ({ ...current, smsConsent: false }));
  }, []);

  useEffect(() => {
    const node = formRef.current;
    const targets = [
      node,
      typeof window !== 'undefined' ? window : null,
      typeof document !== 'undefined' ? document.modelContext : null,
      typeof navigator !== 'undefined' ? navigator.modelContext : null,
    ].filter((target, index, all) => target?.addEventListener && all.indexOf(target) === index);
    targets.forEach((target) => target.addEventListener('toolactivated', markAgentAssisted));
    return () => targets.forEach((target) => target.removeEventListener('toolactivated', markAgentAssisted));
  }, [markAgentAssisted]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const focusTarget = (field) => {
    window.setTimeout(() => {
      const target = field ? formRef.current?.querySelector(`[name="${field}"]`) : statusRef.current;
      target?.focus();
    }, 0);
  };

  const fail = (reason) => {
    const field = REASON_FIELD[reason];
    if (field) setFieldErrors({ [field]: reason });
    const message = FORM.errors[reason] || FORM.errors.generic;
    setError(message);
    focusTarget(field);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (event.nativeEvent?.agentInvoked) {
      markAgentAssisted();
      return;
    }
    const errors = validate(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError(FORM.errorSummaryTitle);
      focusTarget(Object.keys(errors)[0]);
      return;
    }
    setPhase('submitting');
    setError('');
    setFieldErrors({});
    try {
      const res = await submitScanRequest({
        ...form,
        website: normalizeWebsite(form.website),
        location: form.location.trim(),
        consentTimestamp: new Date().toISOString(),
        submissionId,
      });
      if (res.ok) {
        setReference(res.reference || res.id || '');
        setPhase('success');
        return;
      }
      setPhase('capture');
      fail(res.reason);
    } catch {
      setPhase('capture');
      fail('generic');
    }
  };

  if (phase === 'success') {
    return (
      <div id="scan-form" ref={doneRef} tabIndex={-1} className="scroll-mt-24 rounded-[2rem] border border-emerald-400/25 bg-[#0b0d12] p-6 outline-none sm:p-8" role="status">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">{SUCCESS.eyebrow}</p>
        <p className="mt-3 font-display text-2xl font-extrabold uppercase italic text-white">{SUCCESS.heading}</p>
        <p className="mt-4 leading-relaxed text-slate-300">
          {returned.sent ? SUCCESS.noJsBody : SUCCESS.body(form.dealershipName.trim(), form.email.trim())}
        </p>
        {reference && <p className="mt-4 font-mono text-xs uppercase tracking-wider text-slate-300">{SUCCESS.referenceLabel}: {reference}</p>}
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{SUCCESS.footnote}</p>
      </div>
    );
  }

  const busy = phase === 'submitting';
  const describedBy = (key, hasHint = false) => [hasHint ? `scan-${key}-hint` : '', fieldErrors[key] ? `scan-${key}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <form
      id="scan-form"
      ref={formRef}
      method="post"
      action={`${CAPI_URL}/api/ai-scan`}
      onSubmit={submit}
      noValidate
      aria-labelledby="scan-form-title"
      toolname={FORM.webmcp.toolname}
      tooldescription={FORM.webmcp.tooldescription}
      className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-[#0b0d12] p-6 sm:p-8"
    >
      <p id="scan-form-title" className="font-display text-2xl font-extrabold uppercase italic text-white">{FORM.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{FORM.intro}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{FORM.requiredNote}</p>
      {agentAssisted && <p className="mt-4 rounded-xl border border-blue-400/25 bg-blue-500/[0.07] p-3 text-sm leading-relaxed text-blue-100">{FORM.agentBanner}</p>}
      <input id="scan-submissionId" type="hidden" name="submissionId" value={submissionId} />
      <input id="scan-submittedVia" type="hidden" name="submittedVia" value="form" />
      <input id="scan-smsConsentVersion" type="hidden" name="smsConsentVersion" value={SMS_CONSENT.version} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label htmlFor="scan-dealershipName" className="block sm:col-span-2">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.dealershipName.label}</span>
          <input id="scan-dealershipName" name="dealershipName" required toolparamdescription={FORM.fields.dealershipName.agentHint} aria-describedby={describedBy('dealershipName')} autoComplete={FORM.fields.dealershipName.autocomplete} value={form.dealershipName} onChange={(e) => update('dealershipName', e.target.value)} aria-invalid={Boolean(fieldErrors.dealershipName)} className={fieldClass(fieldErrors.dealershipName)} />
          <InlineError id="scan-dealershipName-error" reason={fieldErrors.dealershipName} />
        </label>
        <label htmlFor="scan-website" className="block">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.website.label}</span>
          <input id="scan-website" name="website" required toolparamdescription={FORM.fields.website.agentHint} aria-describedby={describedBy('website', true)} inputMode="url" autoComplete={FORM.fields.website.autocomplete} autoCapitalize="none" spellCheck={false} placeholder={FORM.fields.website.hint} value={form.website} onChange={(e) => update('website', e.target.value)} aria-invalid={Boolean(fieldErrors.website)} className={fieldClass(fieldErrors.website)} />
          <Hint id="scan-website-hint">{FORM.fields.website.hint}</Hint>
          <InlineError id="scan-website-error" reason={fieldErrors.website} />
        </label>
        <label htmlFor="scan-location" className="block">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.location.label}</span>
          <input id="scan-location" name="location" required toolparamdescription={FORM.fields.location.agentHint} aria-describedby={describedBy('location', true)} autoComplete={FORM.fields.location.autocomplete} maxLength={80} value={form.location} onChange={(e) => update('location', e.target.value)} aria-invalid={Boolean(fieldErrors.location)} className={fieldClass(fieldErrors.location)} />
          <Hint id="scan-location-hint">{FORM.fields.location.hint}</Hint>
          <InlineError id="scan-location-error" reason={fieldErrors.location} />
        </label>
        <label htmlFor="scan-fullName" className="block">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.fullName.label}</span>
          <input id="scan-fullName" name="fullName" required toolparamdescription={FORM.fields.fullName.agentHint} aria-describedby={describedBy('fullName', true)} autoComplete={FORM.fields.fullName.autocomplete} placeholder={FORM.fields.fullName.hint} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} aria-invalid={Boolean(fieldErrors.fullName)} className={fieldClass(fieldErrors.fullName)} />
          <Hint id="scan-fullName-hint">{FORM.fields.fullName.hint}</Hint>
          <InlineError id="scan-fullName-error" reason={fieldErrors.fullName} />
        </label>
        <label htmlFor="scan-role" className="block">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.role.label}</span>
          <select id="scan-role" name="role" required toolparamdescription={FORM.fields.role.agentHint} aria-describedby={describedBy('role')} autoComplete={FORM.fields.role.autocomplete} value={form.role} onChange={(e) => update('role', e.target.value)} aria-invalid={Boolean(fieldErrors.role)} className={fieldClass(fieldErrors.role)}>
            <option value="">{FORM.fields.role.placeholder}</option>
            {ROLE_CHOICES.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <InlineError id="scan-role-error" reason={fieldErrors.role} />
        </label>
        <label htmlFor="scan-email" className="block">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.email.label} <span className="font-normal text-slate-400">({FORM.fields.email.note})</span></span>
          <input id="scan-email" name="email" required toolparamdescription={FORM.fields.email.agentHint} aria-describedby={describedBy('email', true)} type="email" inputMode="email" autoComplete={FORM.fields.email.autocomplete} autoCapitalize="none" spellCheck={false} value={form.email} onChange={(e) => update('email', e.target.value)} aria-invalid={Boolean(fieldErrors.email)} className={fieldClass(fieldErrors.email)} />
          <Hint id="scan-email-hint">{FORM.fields.email.note}</Hint>
          <InlineError id="scan-email-error" reason={fieldErrors.email} />
        </label>
        <label htmlFor="scan-phone" className="block">
          <span className="text-sm font-bold text-slate-200">{FORM.fields.phone.label} <span className="font-normal text-slate-400">({FORM.fields.phone.note})</span></span>
          <input id="scan-phone" name="phone" required toolparamdescription={FORM.fields.phone.agentHint} aria-describedby={describedBy('phone', true)} type="tel" inputMode="tel" autoComplete={FORM.fields.phone.autocomplete} placeholder={FORM.fields.phone.hint} value={form.phone} onChange={(e) => update('phone', formatPhoneInput(e.target.value))} aria-invalid={Boolean(fieldErrors.phone)} className={fieldClass(fieldErrors.phone)} />
          <Hint id="scan-phone-hint">{FORM.fields.phone.hint}</Hint>
          <InlineError id="scan-phone-error" reason={fieldErrors.phone} />
        </label>
      </div>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="scan-company">
          <span>{FORM.fields.dealershipName.label}</span>
          <input id="scan-company" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => update('company', e.target.value)} />
        </label>
      </div>
      <label htmlFor="scan-smsConsent" className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-slate-300">
        <input id="scan-smsConsent" name="smsConsent" value="true" type="checkbox" aria-describedby="scan-sms-consent-hint" checked={form.smsConsent} onChange={(e) => update('smsConsent', e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
        <span id="scan-sms-consent-hint">
          {SMS_CONSENT.text}{' '}
          {SMS_CONSENT.links.map((link, index) => <span key={link.href}>{index ? ' · ' : ''}<a className="text-blue-300 underline underline-offset-2 hover:text-blue-200" href={link.href}>{link.label}</a></span>)}
        </span>
      </label>
      <button type="submit" data-scan-cta="" disabled={busy} className="mt-5 flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70 sm:text-lg">
        {busy ? FORM.submitting : FORM.submit}
      </button>
      <p id="scan-status" ref={statusRef} tabIndex={-1} className={`mt-3 text-sm outline-none ${error ? 'text-red-300' : 'text-slate-400'}`} aria-live="polite">{error}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{FORM.useNote}</p>
    </form>
  );
}

/**
 * `prerendered` is the build-time/hydration mode (scripts/prerender.mjs, main.jsx): the nav and hero are React's,
 * everything below the hero is the static mirror (`restHtml`) until the page goes live after hydration. With no
 * props (dev, Root's lazy route) it renders the whole live page exactly as before.
 */
export default function AiVisibilityApp({ prerendered = false, restHtml = '' }) {
  const formSectionRef = useRef(null);
  const [live, ensureLive, carried] = useLive(prerendered);

  useEffect(() => {
    document.title = META.title;
  }, []);

  const goToForm = useCallback((event) => {
    event?.preventDefault?.();
    ensureLive();
    const form = document.getElementById('scan-form');
    if (!form) return;
    form.querySelector('input[name="dealershipName"]')?.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }, [ensureLive]);

  return (
    <div className="min-h-dvh bg-[#050505] font-sans text-slate-50 selection:bg-blue-500/30 selection:text-blue-200">
      <SiteNav page="ai-visibility" isMobileNavVisible onPrimaryAction={goToForm} />
      <main id="main-content">
        <AiHero onGo={goToForm} />
        {live ? (
          <>
            <AeoGeoSection />
            <ShiftSection />
            <WhereBuyersAskSection />
            <ResultsViewSection />
            <ProofSection />
            <ReportSection />
            <ReasonsSection />
            <section ref={formSectionRef} className="al-scan-section scroll-mt-4 py-20 lg:py-28">
              <div className="mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-2">
                <div className="order-2 lg:order-1"><HowSteps /></div>
                <div className="order-1 lg:order-2"><ScanForm initialValues={carried} /></div>
              </div>
            </section>
            <PlansSection onGo={goToForm} />
            <AiFaq />
            <AiFinalCta onGo={goToForm} />
            <AboutService />
          </>
        ) : <StaticIsland name="ai-rest" html={restHtml} />}
      </main>
      {live && <SiteFooter extraLine={FOOTER.line} mobileCtaPadding columns={FOOTER_NAV} />}
      {live && <AiMobileCtaBar onGo={goToForm} formRef={formSectionRef} />}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- boot helpers live with the page they boot
export const aiVisibilityElement = (props) => (
  <StrictMode>
    <AiVisibilityApp {...props} />
  </StrictMode>
);

// main.jsx: adopt the prerendered nav + hero and the static island as they are.
// eslint-disable-next-line react-refresh/only-export-components
export function hydrateAiVisibility(container) {
  return hydrateRoot(container, aiVisibilityElement({ prerendered: true, restHtml: islandHtml(container, 'ai-rest') }), HYDRATE_OPTIONS);
}
