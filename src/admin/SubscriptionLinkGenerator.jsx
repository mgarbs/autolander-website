import { useState } from 'react';
import { BadgeDollarSign, CheckCircle, Copy, ExternalLink, Link2, Loader2 } from 'lucide-react';
import { apiPost } from './lib/api.js';

const TRACKING_FIELDS = [
  ['ghl_contact_id', 'GHL contact ID'],
  ['external_id', 'External ID'],
  ['fbc', 'FBC'],
  ['fbp', 'FBP'],
  ['fbclid', 'FBCLID'],
  ['campaign_id', 'Campaign ID'],
  ['adset_id', 'Adset ID'],
  ['ad_id', 'Ad ID'],
  ['event_source_url', 'Source URL'],
];

function blankTracking() {
  return Object.fromEntries(TRACKING_FIELDS.map(([key]) => [key, '']));
}

function cleanObject(value) {
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, String(item || '').trim()])
      .filter(([, item]) => item),
  );
}

function formatMoney(cents) {
  const amount = Number(cents || 0) / 100;
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default function SubscriptionLinkGenerator() {
  const [amount, setAmount] = useState('997');
  const [interval, setInterval] = useState('monthly');
  const [label, setLabel] = useState('AutoLander Subscription');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tracking, setTracking] = useState(() => blankTracking());
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  function setTrackingField(key, value) {
    setTracking((current) => ({ ...current, [key]: value }));
  }

  function parseSourceUrl() {
    const raw = tracking.event_source_url.trim();
    if (!raw) return;
    try {
      const parsed = new URL(raw);
      const params = parsed.searchParams;
      const next = { ...tracking };
      for (const key of ['fbclid', 'campaign_id', 'adset_id', 'ad_id']) {
        if (!next[key] && params.get(key)) next[key] = params.get(key);
      }
      if (!next.campaign_id && params.get('utm_id')) next.campaign_id = params.get('utm_id');
      setTracking(next);
    } catch {
      setMessage({ type: 'error', text: 'Source URL is not valid.' });
    }
  }

  async function generateLink(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setResult(null);
    setCopied(false);
    setMessage(null);
    try {
      const response = await apiPost('/admin/subscription-link', {
        amount,
        interval,
        label,
        customerEmail,
        customerName,
        customerPhone,
        tracking: cleanObject(tracking),
      });
      setResult(response);
      setMessage({ type: 'success', text: 'Subscription link ready.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Could not create link.' });
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!result?.checkoutUrl) return;
    await navigator.clipboard.writeText(result.checkoutUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <BadgeDollarSign size={20} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Stripe Subscription Link</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Manual close path</p>
          </div>
        </div>
        {result?.amountCents && (
          <div className="text-right text-xs font-black uppercase tracking-widest text-emerald-300">
            {formatMoney(result.amountCents)} / {result.interval === 'annual' ? 'yr' : 'mo'}
          </div>
        )}
      </div>

      <form onSubmit={generateLink} className="space-y-5 p-5">
        {message && (
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-widest ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={14} /> : <Link2 size={14} />}
            {message.text}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</span>
            <input
              required
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Interval</span>
            <select
              value={interval}
              onChange={(event) => setInterval(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Label</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer email</span>
            <input
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer name</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer phone</span>
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link2 size={14} />
              Attribution
            </div>
            <button
              type="button"
              onClick={parseSourceUrl}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
            >
              Parse URL
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {TRACKING_FIELDS.map(([key, fieldLabel]) => (
              <label key={key} className={key === 'event_source_url' ? 'space-y-2 md:col-span-3' : 'space-y-2'}>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{fieldLabel}</span>
                <input
                  value={tracking[key]}
                  onChange={(event) => setTrackingField(key, event.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-blue-500/60"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <BadgeDollarSign size={15} />}
            Generate Link
          </button>
          {result?.checkoutUrl && (
            <>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
              >
                <Copy size={15} />
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <a
                href={result.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
              >
                <ExternalLink size={15} />
                Open
              </a>
            </>
          )}
        </div>

        {result?.checkoutUrl && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-600">Checkout URL</p>
            <p className="break-all font-mono text-xs text-slate-300">{result.checkoutUrl}</p>
          </div>
        )}
      </form>
    </section>
  );
}
