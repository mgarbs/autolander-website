import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
  ShieldCheck,
  UserRound,
  Warehouse,
  X,
} from 'lucide-react';
import { newSubmissionId, submitApplication } from '../lib/demo-application.js';
import { formatPhoneInput, isValidEmail, isValidPhone } from '../lib/contact.js';

const ROLES = ['Owner', 'Manager', 'Sales Rep'];
const VEHICLE_COUNTS = ['1-50', '51-150', '151+'];

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  role: '',
  inventoryUrl: '',
  vehicleCount: '',
  smsConsent: true,
  company: '',
};

function normalizeWebsite(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./i, '');
    if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host)) return '';
    return url.toString();
  } catch {
    return '';
  }
}

export default function DemoApplication({ onClose }) {
  const [phase, setPhase] = useState('capture');
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [invalid, setInvalid] = useState({ email: false, phone: false, inventoryUrl: false });
  const submissionId = useMemo(() => newSubmissionId(), []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const inventoryUrl = normalizeWebsite(form.inventoryUrl);

    if (!form.fullName.trim()) {
      setFormError('Enter your full name.');
      return;
    }
    if (!isValidEmail(form.email)) {
      setFormError('Enter a valid work email, like you@dealership.com.');
      setInvalid((v) => ({ ...v, email: true }));
      return;
    }
    if (!isValidPhone(form.phone)) {
      setFormError('Enter a valid mobile number, e.g. (212) 555-0123.');
      setInvalid((v) => ({ ...v, phone: true }));
      return;
    }
    if (!form.role) {
      setFormError('Tell us your role at the dealership.');
      return;
    }
    if (!inventoryUrl) {
      setFormError('Enter your dealership website or inventory link.');
      setInvalid((v) => ({ ...v, inventoryUrl: true }));
      return;
    }
    if (!form.smsConsent) {
      setFormError('Confirm we can text you about your demo.');
      return;
    }

    setPhase('submitting');
    setFormError('');

    try {
      const res = await submitApplication({
        ...form,
        inventoryUrl,
        consentTimestamp: new Date().toISOString(),
        submissionId,
      });

      if (res.ok) {
        setPhase('success');
        const dest = res.redirectPath || '/thank-you';
        const target = res.bt ? `${dest}?bt=${encodeURIComponent(res.bt)}` : dest;
        window.setTimeout(() => window.location.assign(target), 900);
        return;
      }

      if (res.reason === 'missing_full_name') {
        setFormError('Enter your full name.');
      } else if (res.reason === 'invalid_email') {
        setFormError('That email does not look right. Re-enter it and try again.');
        setInvalid((v) => ({ ...v, email: true }));
      } else if (res.reason === 'invalid_phone') {
        setFormError('That phone number does not look right. Re-enter it and try again.');
        setInvalid((v) => ({ ...v, phone: true }));
      } else if (res.reason === 'invalid_inventory_url') {
        setFormError('That website or inventory link does not look right.');
        setInvalid((v) => ({ ...v, inventoryUrl: true }));
      } else if (res.reason === 'ghl_not_configured') {
        setFormError('Applications are not connected yet. Email sales@autolander.ai and we will help.');
      } else {
        setFormError('Something went wrong submitting your application. Try again.');
      }
      setPhase('capture');
    } catch {
      setFormError('Network hiccup. Try again.');
      setPhase('capture');
    }
  };

  return (
    <div
      onClick={onClose}
      className="demo-application-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="demo-application-panel relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0f]/95 p-6 shadow-2xl shadow-black/60"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 pr-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Reviewed by our team
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
            Apply for a private demo
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
            Drop your details. If AutoLander is a fit, a rep will reach out to you with the next step.
          </p>
        </div>

        {phase === 'capture' && (
          <form onSubmit={submit} noValidate className="space-y-4">
            <input
              required
              type="text"
              placeholder="Full name"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30"
            />

            <input
              required
              type="email"
              inputMode="email"
              placeholder="Work email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => {
                update('email', event.target.value);
                if (invalid.email) setInvalid((v) => ({ ...v, email: false }));
              }}
              onBlur={() => setInvalid((v) => ({ ...v, email: form.email.trim() !== '' && !isValidEmail(form.email) }))}
              aria-invalid={invalid.email}
              className={`w-full rounded-xl border bg-white/5 p-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 ${invalid.email ? 'border-red-500/70 focus:border-red-500/70' : 'border-white/10 focus:border-blue-500/60'}`}
            />

            <input
              required
              type="tel"
              inputMode="tel"
              placeholder="Mobile phone"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => {
                update('phone', formatPhoneInput(event.target.value));
                if (invalid.phone) setInvalid((v) => ({ ...v, phone: false }));
              }}
              onBlur={() => setInvalid((v) => ({ ...v, phone: form.phone.trim() !== '' && !isValidPhone(form.phone) }))}
              aria-invalid={invalid.phone}
              className={`w-full rounded-xl border bg-white/5 p-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 ${invalid.phone ? 'border-red-500/70 focus:border-red-500/70' : 'border-white/10 focus:border-blue-500/60'}`}
            />

            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Dealership profile</p>

              <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  <UserRound className="h-3.5 w-3.5" /> Your role
                </span>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
                  {ROLES.map((role) => {
                    const active = form.role === role;
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => update('role', role)}
                        className={`flex min-h-[2.75rem] items-center justify-center rounded-lg px-1 text-center text-[11px] font-black uppercase leading-tight tracking-tight transition-all ${
                          active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  <Warehouse className="h-3.5 w-3.5" /> Vehicles in inventory
                </span>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
                  {VEHICLE_COUNTS.map((option) => {
                    const active = form.vehicleCount === option;
                    return (
                      <button
                        type="button"
                        key={option}
                        onClick={() => update('vehicleCount', active ? '' : option)}
                        className={`flex min-h-[2.75rem] items-center justify-center rounded-lg text-sm font-black tracking-tight transition-all ${
                          active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type="text"
                    inputMode="url"
                    placeholder="Website or inventory link"
                    autoComplete="url"
                    value={form.inventoryUrl}
                    onChange={(event) => {
                      update('inventoryUrl', event.target.value);
                      if (invalid.inventoryUrl) setInvalid((v) => ({ ...v, inventoryUrl: false }));
                    }}
                    onBlur={() => setInvalid((v) => ({
                      ...v,
                      inventoryUrl: form.inventoryUrl.trim() !== '' && !normalizeWebsite(form.inventoryUrl),
                    }))}
                    aria-invalid={invalid.inventoryUrl}
                    className={`w-full rounded-xl border bg-white/5 py-3 pl-9 pr-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 ${invalid.inventoryUrl ? 'border-red-500/70 focus:border-red-500/70' : 'border-white/10 focus:border-blue-500/60'}`}
                  />
                </div>
                <p className="mt-1.5 pl-1 text-xs font-semibold leading-snug text-slate-300">
                  AutoLander is for dealers and sales teams. We do not sell vehicles or offer financing.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-[11px] font-semibold leading-relaxed text-slate-500">
              <input
                type="checkbox"
                checked={form.smsConsent}
                onChange={(event) => update('smsConsent', event.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/5 accent-blue-600"
              />
              <span>Text me about my demo.</span>
            </label>

            <input
              type="text"
              name="company"
              tabIndex="-1"
              autoComplete="off"
              value={form.company}
              onChange={(event) => update('company', event.target.value)}
              className="absolute left-[-9999px] h-px w-px opacity-0"
              aria-hidden="true"
            />

            {formError && <p className="text-xs font-semibold text-red-400">{formError}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 p-4 text-sm font-black uppercase italic tracking-wider text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500 active:scale-[0.99]"
            >
              Apply for demo
            </button>
          </form>
        )}

        {phase === 'submitting' && (
          <div className="grid place-items-center gap-3 py-14 text-slate-300">
            <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
            <p className="text-xs font-bold uppercase italic tracking-widest">Submitting application...</p>
          </div>
        )}

        {phase === 'success' && (
          <div className="grid place-items-center gap-3 py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-500/20 text-green-400">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-white">Application received</h3>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Our team is reviewing your request now. If there is a fit, a rep will reach out shortly.
            </p>
          </div>
        )}

        {phase === 'capture' && (
          <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/5 pt-4 text-[10px] font-bold uppercase tracking-tight text-slate-500">
            <ArrowLeft className="h-3 w-3" />
            Reviewed before a live demo is opened
          </div>
        )}
      </div>
    </div>
  );
}
