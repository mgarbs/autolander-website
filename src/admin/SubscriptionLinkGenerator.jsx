import { useEffect, useRef, useState } from 'react';
import { BadgeDollarSign, Building2, CheckCircle, Copy, ExternalLink, Link2, Loader2, Search, X, Zap } from 'lucide-react';
import { apiPost } from './lib/api.js';
import { candidateSubscriptionSummary, isOpsNotConfigured, searchCandidates } from './lib/ops.js';

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
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orgQuery, setOrgQuery] = useState('');
  const [orgResults, setOrgResults] = useState([]);
  const [orgSearching, setOrgSearching] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [opsUnavailable, setOpsUnavailable] = useState(false);
  const orgSearchSeq = useRef(0);

  useEffect(() => {
    const query = orgQuery.trim();
    const seq = orgSearchSeq.current + 1;
    orgSearchSeq.current = seq;
    const shouldSearch = query.length >= 2 && !opsUnavailable;
    const timeoutId = window.setTimeout(async () => {
      if (orgSearchSeq.current !== seq) return;
      if (!shouldSearch) {
        setOrgResults([]);
        setOrgSearching(false);
        return;
      }
      setOrgSearching(true);
      try {
        const candidates = await searchCandidates(query);
        if (orgSearchSeq.current !== seq) return;
        setOrgResults(candidates);
      } catch (err) {
        if (orgSearchSeq.current !== seq) return;
        setOrgResults([]);
        if (isOpsNotConfigured(err)) setOpsUnavailable(true);
      } finally {
        if (orgSearchSeq.current === seq) setOrgSearching(false);
      }
    }, shouldSearch ? 300 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [orgQuery, opsUnavailable]);

  function pickOrg(candidate) {
    setSelectedOrg(candidate);
    setOrgQuery('');
    setOrgResults([]);
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
        ...(selectedOrg?.orgId
          ? { orgId: selectedOrg.orgId, pickedOrgName: selectedOrg.orgName }
          : {}),
      });
      setResult(response);
      setMessage({
        type: 'success',
        text: selectedOrg?.orgId
          ? `Subscription link ready — payments through it activate ${selectedOrg.orgName || selectedOrg.orgId} automatically.`
          : 'Subscription link ready.',
      });
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
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Building2 size={14} />
            Attach to account
            <span className="font-bold normal-case tracking-normal text-slate-600">(optional)</span>
          </div>

          {opsUnavailable ? (
            <p className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-500">
              Automatic account linking is not configured (set OPS_ADMIN_TOKEN on the Worker + cloud). Links still work
              the manual way.
            </p>
          ) : selectedOrg ? (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-black text-white">
                  <Zap size={14} className="shrink-0 text-emerald-300" />
                  <span className="truncate">{selectedOrg.orgName || selectedOrg.orgId}</span>
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-200">
                  Payments through this link activate {selectedOrg.orgName || 'this account'} automatically — no manual
                  linking needed.
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {selectedOrg.orgId}
                  {selectedOrg.admins.length > 0 ? ` · ${selectedOrg.admins.join(', ')}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                title="Remove account attachment"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={14} aria-hidden="true" />
                <span className="sr-only">Remove account attachment</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={orgQuery}
                  onChange={(event) => setOrgQuery(event.target.value)}
                  placeholder="Search accounts by dealership, org, or admin email…"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
                {orgSearching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-600">
                Pick an account and its subscription activates automatically the moment the customer pays. Skip it to
                generate a plain link exactly like before.
              </p>
              {orgResults.length > 0 && (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-1">
                  {orgResults.map((candidate) => (
                    <button
                      key={candidate.orgId}
                      type="button"
                      onClick={() => pickOrg(candidate)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white">
                          {candidate.orgName || candidate.orgId}
                        </span>
                        <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {candidate.admins.length > 0 ? candidate.admins.join(', ') : candidate.orgId}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {candidateSubscriptionSummary(candidate)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {!orgSearching && orgQuery.trim().length >= 2 && orgResults.length === 0 && (
                <p className="text-xs text-slate-500">No matching accounts.</p>
              )}
            </div>
          )}
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
            {result?.metadata?.orgId && (
              <p className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-200">
                <Zap size={13} className="shrink-0" />
                Auto-activation on: paying through this link provisions{' '}
                {result.metadata.pickedOrgName || result.metadata.orgId} instantly.
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
