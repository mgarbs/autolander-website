import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import {
  BILLING_LINKS_SETUP_NOTE,
  PLAN_CHOICES,
  createBillingLink,
  disableBillingLink,
  formatCents,
  formatDate,
  getBillingLink,
  isBillingLinksNotConfigured,
  listBillingLinks,
  payUrlForToken,
  recreateBillingLink,
} from './lib/billing-links.js';
import SubscriptionLinkGenerator from './SubscriptionLinkGenerator.jsx';
import { candidateSubscriptionSummary, isOpsNotConfigured, searchCandidates } from './lib/ops.js';

const EMPTY_FORM = {
  planCode: 'STARTER',
  billingInterval: 'monthly',
  seatsStarter: '1',
  seatsGrowth: '0',
  seatsPro: '0',
  couponId: '',
  setupFee: false,
  ghlContactId: '',
  ghlOpportunityId: '',
  assignedSalesRepId: '',
  crmEmail: '',
  crmPhone: '',
  crmFirstName: '',
  crmLastName: '',
  crmBusinessName: '',
  crmWebsite: '',
  notCrmLinked: false,
};

function statusTone(status) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
    case 'opened':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-200';
    case 'disabled':
    case 'expired':
    case 'failed':
      return 'border-red-500/30 bg-red-500/10 text-red-200';
    default:
      return 'border-white/10 bg-white/[0.04] text-slate-300';
  }
}

export default function BillingLinks() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createResult, setCreateResult] = useState(null);
  const [createMessage, setCreateMessage] = useState(null);
  const [createPending, setCreatePending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const [links, setLinks] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [livemodeFilter, setLivemodeFilter] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionPending, setActionPending] = useState('');

  const loadLinks = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const rows = await listBillingLinks({ livemode: livemodeFilter, limit: 100 });
      setLinks(rows);
    } catch (err) {
      if (isBillingLinksNotConfigured(err)) {
        setUnavailable(true);
      } else {
        setListError(err?.message || 'Could not load payment links.');
      }
    } finally {
      setListLoading(false);
    }
  }, [livemodeFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadLinks();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadLinks]);

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function ghlIds(values) {
    const contactId = values.ghlContactId.trim();
    const opportunityId = values.ghlOpportunityId.trim();
    return {
      hasAny: Boolean(contactId || opportunityId),
      hasBoth: Boolean(contactId && opportunityId),
    };
  }

  async function submitCreate(event) {
    event.preventDefault();
    if (createPending) return;

    const ghl = ghlIds(form);
    if (ghl.hasAny && !ghl.hasBoth) {
      setCreateMessage({
        type: 'error',
        text: 'GHL-linked links need both a Contact ID and an Opportunity ID.',
      });
      return;
    }

    if (!ghl.hasBoth && !form.notCrmLinked) {
      setCreateMessage({
        type: 'error',
        text: 'Enter both GHL IDs, or check "Not CRM-linked" to confirm this is intentional.',
      });
      return;
    }

    setCreatePending(true);
    setCreateResult(null);
    setCreateMessage(null);
    setCopied(false);

    try {
      const body = {
        planCode: form.planCode,
        billingInterval: form.billingInterval,
        ...(form.planCode === 'PRO_TEAM'
          ? {
              seats: {
                seatsStarter: Number(form.seatsStarter) || 0,
                seatsGrowth: Number(form.seatsGrowth) || 0,
                seatsPro: Number(form.seatsPro) || 0,
              },
            }
          : {}),
        ...(form.couponId.trim() ? { couponId: form.couponId.trim() } : {}),
        withSetupFee: form.setupFee,
        ...(selectedOrg?.orgId ? { orgId: selectedOrg.orgId } : {}),
        ...(form.ghlContactId.trim() ? { ghlContactId: form.ghlContactId.trim() } : {}),
        ...(form.ghlOpportunityId.trim() ? { ghlOpportunityId: form.ghlOpportunityId.trim() } : {}),
        ...(form.assignedSalesRepId.trim() ? { assignedSalesRepId: form.assignedSalesRepId.trim() } : {}),
        notCrmLinked: !ghl.hasBoth && form.notCrmLinked,
        crmSnapshot: {
          ...(form.crmEmail.trim() ? { email: form.crmEmail.trim() } : {}),
          ...(form.crmPhone.trim() ? { phone: form.crmPhone.trim() } : {}),
          ...(form.crmFirstName.trim() ? { firstName: form.crmFirstName.trim() } : {}),
          ...(form.crmLastName.trim() ? { lastName: form.crmLastName.trim() } : {}),
          ...(form.crmBusinessName.trim() ? { businessName: form.crmBusinessName.trim() } : {}),
          ...(form.crmWebsite.trim() ? { website: form.crmWebsite.trim() } : {}),
        },
      };

      const response = await createBillingLink(body);
      setCreateResult(response);
      setCreateMessage({ type: 'success', text: 'Payment link ready.' });
      loadLinks();
    } catch (err) {
      setCreateMessage({ type: 'error', text: err?.message || 'Could not create payment link.' });
    } finally {
      setCreatePending(false);
    }
  }

  async function copyPayUrl(token) {
    if (!token) return;
    await navigator.clipboard.writeText(payUrlForToken(token));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function openDetail(id) {
    setSelectedId(id);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const payload = await getBillingLink(id);
      setDetail(payload);
    } catch (err) {
      setDetailError(err?.message || 'Could not load this payment link.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function runDisable(id) {
    setActionPending('disable');
    try {
      await disableBillingLink(id);
      await openDetail(id);
      loadLinks();
    } catch (err) {
      setDetailError(err?.message || 'Could not disable this payment link.');
    } finally {
      setActionPending('');
    }
  }

  async function runRecreate(id) {
    setActionPending('recreate');
    try {
      const response = await recreateBillingLink(id);
      const newId = response?.request?.id || response?.checkoutRequest?.id || response?.id;
      loadLinks();
      if (newId) await openDetail(newId);
    } catch (err) {
      setDetailError(err?.message || 'Could not recreate this payment link.');
    } finally {
      setActionPending('');
    }
  }

  if (unavailable) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <Wallet size={20} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Payment Links</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Centralized billing links</p>
          </div>
        </div>
        <div className="p-5">
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200">
            {BILLING_LINKS_SETUP_NOTE}
          </p>
          <details className="mt-4 rounded-xl border border-white/10 bg-black/20">
            <summary className="cursor-pointer list-none px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400 marker:content-none hover:text-white">
              Advanced: custom-price Stripe checkout (legacy, not CRM-linked)
            </summary>
            <SubscriptionLinkGenerator embedded />
          </details>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <Wallet size={20} />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Payment Links</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Centralized billing links — autolander.ai/pay/{'{token}'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Create form */}
        <form onSubmit={submitCreate} className="space-y-5 rounded-xl border border-white/10 bg-black/30 p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Create a payment link</h3>

          {createMessage && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-widest ${
                createMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/30 bg-red-500/10 text-red-200'
              }`}
            >
              {createMessage.type === 'success' ? <CheckCircle size={14} /> : <Link2 size={14} />}
              {createMessage.text}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Plan</span>
              <select
                value={form.planCode}
                onChange={(event) => updateForm({ planCode: event.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60"
              >
                {PLAN_CHOICES.map((code) => (
                  <option key={code} value={code}>
                    {code.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Interval</span>
              <select
                value={form.billingInterval}
                onChange={(event) => updateForm({ billingInterval: event.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-blue-500/60"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Coupon ID</span>
              <input
                value={form.couponId}
                onChange={(event) => updateForm({ couponId: event.target.value })}
                placeholder="Optional Stripe coupon id"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
              />
            </label>
          </div>

          {form.planCode === 'PRO_TEAM' && (
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Starter seats</span>
                <input
                  type="number"
                  min="0"
                  value={form.seatsStarter}
                  onChange={(event) => updateForm({ seatsStarter: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Growth seats</span>
                <input
                  type="number"
                  min="0"
                  value={form.seatsGrowth}
                  onChange={(event) => updateForm({ seatsGrowth: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pro seats</span>
                <input
                  type="number"
                  min="0"
                  value={form.seatsPro}
                  onChange={(event) => updateForm({ seatsPro: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <p className="text-[10px] text-slate-600 md:col-span-3">Minimum 3 seats total, any tier mix.</p>
            </div>
          )}

          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <input
              type="checkbox"
              checked={form.setupFee}
              onChange={(event) => updateForm({ setupFee: event.target.checked })}
              className="h-3.5 w-3.5 rounded border-white/20 bg-black/40 accent-blue-500"
            />
            Include one-time setup fee
          </label>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">CRM linking (GoHighLevel — passthrough only)</p>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GHL Contact ID</span>
                <input
                  value={form.ghlContactId}
                  onChange={(event) => updateForm({ ghlContactId: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GHL Opportunity ID</span>
                <input
                  value={form.ghlOpportunityId}
                  onChange={(event) => updateForm({ ghlOpportunityId: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assigned Sales Rep ID</span>
                <input
                  value={form.assignedSalesRepId}
                  onChange={(event) => updateForm({ assignedSalesRepId: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
            </div>
            {ghlIds(form).hasAny && !ghlIds(form).hasBoth && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                A CRM-linked payment link requires both IDs so the billing record stays tied to the right opportunity.
              </p>
            )}
            {!ghlIds(form).hasAny && (
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <input
                  type="checkbox"
                  checked={form.notCrmLinked}
                  onChange={(event) => updateForm({ notCrmLinked: event.target.checked })}
                  className="h-3.5 w-3.5 rounded border-white/20 bg-black/40 accent-amber-500"
                />
                Not CRM-linked — I confirm this link intentionally has no GHL ids
              </label>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              CRM snapshot (reference only — billing never writes back to GoHighLevel)
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</span>
                <input
                  type="email"
                  value={form.crmEmail}
                  onChange={(event) => updateForm({ crmEmail: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</span>
                <input
                  value={form.crmPhone}
                  onChange={(event) => updateForm({ crmPhone: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">First name</span>
                <input
                  value={form.crmFirstName}
                  onChange={(event) => updateForm({ crmFirstName: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Last name</span>
                <input
                  value={form.crmLastName}
                  onChange={(event) => updateForm({ crmLastName: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Business name</span>
                <input
                  value={form.crmBusinessName}
                  onChange={(event) => updateForm({ crmBusinessName: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Website</span>
                <input
                  value={form.crmWebsite}
                  onChange={(event) => updateForm({ crmWebsite: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </label>
            </div>
          </div>

          <AccountAttachment selectedOrg={selectedOrg} onSelect={setSelectedOrg} onClear={() => setSelectedOrg(null)} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={createPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[10px] font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createPending ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
              Create Payment Link
            </button>
          </div>

          {createResult?.request?.token || createResult?.checkoutRequest?.token || createResult?.token ? (
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-600">Durable pay URL</p>
              <p className="break-all font-mono text-xs text-slate-300">
                {createResult.payUrl || payUrlForToken(createResult.request?.token || createResult.checkoutRequest?.token || createResult.token)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyPayUrl(createResult.request?.token || createResult.checkoutRequest?.token || createResult.token)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
                >
                  <Copy size={13} />
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
                <a
                  href={createResult.payUrl || payUrlForToken(createResult.request?.token || createResult.checkoutRequest?.token || createResult.token)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
                >
                  <ExternalLink size={13} />
                  Open
                </a>
              </div>
            </div>
          ) : null}
        </form>

        {/* List */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent payment links</h3>
            <div className="flex items-center gap-2">
              <select
                value={livemodeFilter}
                onChange={(event) => setLivemodeFilter(event.target.value)}
                className="h-9 rounded-xl border border-white/10 bg-black/40 px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:border-blue-500/60"
              >
                <option value="">All modes</option>
                <option value="true">Live only</option>
                <option value="false">Test only</option>
              </select>
              <button
                type="button"
                onClick={loadLinks}
                disabled={listLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={13} className={listLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {listError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">
              {listError}
            </p>
          )}

          {listLoading ? (
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading payment links…</p>
          ) : links.length === 0 && !listError ? (
            <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-slate-500">
              No payment links yet.
            </p>
          ) : (
            <div className="max-h-96 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-1">
              {links.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => openDetail(link.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    selectedId === link.id ? 'border-blue-500/60 bg-blue-500/10' : 'border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">
                        {link.businessName || link.orgId || link.id}
                      </span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${statusTone(link.status)}`}>
                        {link.status}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                          link.livemode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                        }`}
                      >
                        {link.livemode ? 'Live' : 'Test'}
                      </span>
                      {link.crmLinked && (
                        <BadgeCheck size={13} className="shrink-0 text-emerald-400" aria-label="CRM linked" />
                      )}
                    </span>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {link.planCode} · {link.billingInterval} · {formatDate(link.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        {selectedId && (
          <BillingLinkDetailPanel
            id={selectedId}
            detail={detail}
            loading={detailLoading}
            error={detailError}
            actionPending={actionPending}
            onDisable={runDisable}
            onRecreate={runRecreate}
            onClose={() => setSelectedId('')}
          />
        )}

        <details className="rounded-xl border border-white/10 bg-black/20">
          <summary className="cursor-pointer list-none px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400 marker:content-none hover:text-white">
            Advanced: custom-price Stripe checkout (legacy, not CRM-linked)
          </summary>
          <SubscriptionLinkGenerator embedded />
        </details>
      </div>
    </section>
  );
}

function AccountAttachment({ selectedOrg, onSelect, onClear }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [opsUnavailable, setOpsUnavailable] = useState(false);
  const searchSeq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    const seq = searchSeq.current + 1;
    searchSeq.current = seq;
    const shouldSearch = q.length >= 2 && !opsUnavailable;
    const timeoutId = window.setTimeout(async () => {
      if (searchSeq.current !== seq) return;
      if (!shouldSearch) {
        setResults([]);
        setSearching(false);
        setError('');
        return;
      }
      setSearching(true);
      setError('');
      try {
        const candidates = await searchCandidates(q);
        if (searchSeq.current !== seq) return;
        setResults(candidates);
      } catch (err) {
        if (searchSeq.current !== seq) return;
        setResults([]);
        if (isOpsNotConfigured(err)) setOpsUnavailable(true);
        else setError(err?.message || 'Could not search AutoLander accounts.');
      } finally {
        if (searchSeq.current === seq) setSearching(false);
      }
    }, shouldSearch ? 300 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [opsUnavailable, query]);

  function choose(candidate) {
    onSelect(candidate);
    searchSeq.current += 1;
    setQuery('');
    setResults([]);
    setError('');
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <Building2 size={14} />
        Attach to AutoLander account
        <span className="font-bold normal-case tracking-normal text-slate-600">(optional)</span>
      </div>

      {opsUnavailable ? (
        <p className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-500">
          Account attachment is unavailable until the shared ops connection is configured. This payment link can still be created.
        </p>
      ) : selectedOrg ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-black text-white">
              <Zap size={14} className="shrink-0 text-emerald-300" />
              <span className="truncate">{selectedOrg.orgName || selectedOrg.orgId}</span>
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-200">
              When this link is paid, the subscription attaches to this account automatically.
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {candidateSubscriptionSummary(selectedOrg)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-300 transition hover:bg-white/10 hover:text-white"
            title="Remove account attachment"
          >
            <X size={14} aria-hidden="true" />
            <span className="sr-only">Remove account attachment</span>
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search accounts by dealership, org, or admin email…"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-9 text-sm text-white outline-none focus:border-blue-500/60"
            />
            {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
          </div>
          <p className="text-[10px] text-slate-600">
            Attach an account to activate it automatically after payment. Leave this blank to create a CRM-only payment link.
          </p>
          {error && <p className="text-xs font-bold text-red-200">{error}</p>}
          {results.length > 0 && (
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-1">
              {results.map((candidate) => (
                <button
                  key={candidate.orgId}
                  type="button"
                  onClick={() => choose(candidate)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{candidate.orgName || candidate.orgId}</span>
                    <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {candidate.admins?.length ? candidate.admins.join(', ') : candidate.orgId}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {candidateSubscriptionSummary(candidate)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!searching && query.trim().length >= 2 && results.length === 0 && !error && (
            <p className="text-xs text-slate-500">No matching accounts.</p>
          )}
        </>
      )}
    </div>
  );
}

const DETAIL_ID_FIELDS = [
  ['id', 'Checkout Request ID'],
  ['token', 'Token'],
  ['orgId', 'Org ID'],
  ['userId', 'User ID'],
  ['createdByUserId', 'Created By User ID'],
  ['ghlContactId', 'GHL Contact ID'],
  ['ghlOpportunityId', 'GHL Opportunity ID'],
  ['assignedSalesRepId', 'Assigned Sales Rep ID'],
  ['stripeCustomerId', 'Stripe Customer ID'],
  ['stripeCheckoutSessionId', 'Stripe Checkout Session ID'],
  ['stripePaymentLinkId', 'Stripe Payment Link ID'],
  ['stripeSubscriptionId', 'Stripe Subscription ID'],
  ['stripeInvoiceId', 'Stripe Invoice ID'],
  ['stripePaymentIntentId', 'Stripe Payment Intent ID'],
  ['stripeChargeId', 'Stripe Charge ID'],
  ['lastStripeEventId', 'Last Stripe Event ID'],
  ['supersedesId', 'Supersedes ID'],
];

const DETAIL_JSON_FIELDS = [
  ['stripeSessionIds', 'Stripe Session IDs (all)'],
  ['stripeSubscriptionItemIds', 'Stripe Subscription Item IDs'],
  ['stripeProductIds', 'Stripe Product IDs'],
  ['stripePriceIds', 'Stripe Price IDs'],
  ['lineItems', 'Line Items'],
  ['crmSnapshot', 'CRM Snapshot'],
  ['billingSnapshot', 'Billing Snapshot (from Stripe checkout)'],
  ['attribution', 'Attribution'],
];

function BillingLinkDetailPanel({ id, detail, loading, error, actionPending, onDisable, onRecreate, onClose }) {
  const record = detail?.record || {};
  const canDisable = record.status && !['disabled', 'completed'].includes(record.status);
  const canRecreate = record.status === 'disabled' || record.status === 'expired';

  return (
    <div className="space-y-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-200">Payment link detail — {id}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {canDisable && (
            <button
              type="button"
              onClick={() => onDisable(id)}
              disabled={Boolean(actionPending)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionPending === 'disable' ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
              Disable
            </button>
          )}
          {canRecreate && (
            <button
              type="button"
              onClick={() => onRecreate(id)}
              disabled={Boolean(actionPending)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionPending === 'recreate' ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              Recreate
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200">{error}</p>
      )}

      {loading ? (
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryField label="Status" value={record.status} />
            <SummaryField label="Mode" value={record.livemode ? 'Live' : 'Test'} />
            <SummaryField label="Plan" value={`${record.planCode || '—'} (${record.planVersion || '—'})`} />
            <SummaryField label="Interval" value={record.billingInterval} />
            <SummaryField label="Seat count" value={record.seatCount ?? '—'} />
            <SummaryField label="CRM linked" value={record.crmLinked ? 'Yes' : 'No'} />
            <SummaryField label="Expected recurring" value={formatCents(record.expectedRecurringCents, record.currency)} />
            <SummaryField label="Expected one-time" value={formatCents(record.expectedOneTimeCents, record.currency)} />
            <SummaryField label="Origin" value={record.origin} />
            <SummaryField label="Created" value={formatDate(record.createdAt)} />
            <SummaryField label="Opened" value={formatDate(record.openedAt)} />
            <SummaryField label="Completed" value={formatDate(record.completedAt)} />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Every ID on this record</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <tbody>
                  {DETAIL_ID_FIELDS.map(([key, label]) => (
                    <tr key={key} className="border-b border-white/5 last:border-0">
                      <td className="py-1.5 pr-4 font-bold text-slate-500">{label}</td>
                      <td className="py-1.5 font-mono text-slate-300">{record[key] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {DETAIL_JSON_FIELDS.filter(([key]) => record[key] !== undefined && record[key] !== null).map(([key, label]) => (
            <div key={key} className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
              <pre className="max-h-48 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300">
                {JSON.stringify(record[key], null, 2)}
              </pre>
            </div>
          ))}

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Normalized event log ({(detail?.billingEvents || []).length})
            </p>
            {(detail?.billingEvents || []).length === 0 ? (
              <p className="text-xs text-slate-600">No billing events recorded yet.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {(detail?.billingEvents || []).map((eventRow) => (
                  <div key={eventRow.id || `${eventRow.type}-${eventRow.createdAt}`} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-white">{eventRow.type}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {formatDate(eventRow.createdAt)} · {eventRow.deliveryStatus || 'pending'}
                      </span>
                    </div>
                    {(eventRow.amountCents !== undefined && eventRow.amountCents !== null) && (
                      <p className="mt-1 text-xs font-bold text-emerald-300">
                        {formatCents(eventRow.amountCents, eventRow.currency)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(detail?.stripeEvents || []).length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Stripe webhook audit ({detail.stripeEvents.length})
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {detail.stripeEvents.map((eventRow) => (
                  <div key={eventRow.id || eventRow.stripeEventId} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{eventRow.type}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {formatDate(eventRow.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryField({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value === undefined || value === null || value === '' ? '—' : String(value)}</p>
    </div>
  );
}
