import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, apiGet, apiPost, setStoredToken } from './lib/api.js';
import KpiTile from './charts/KpiTile.jsx';
import TimeSeriesChart from './charts/TimeSeriesChart.jsx';
import FunnelChart from './charts/FunnelChart.jsx';
import CampaignTable from './charts/CampaignTable.jsx';
import HealthCard from './charts/HealthCard.jsx';
import TrafficExplorer from './charts/TrafficExplorer.jsx';
import AiSummaryPanel from './charts/AiSummaryPanel.jsx';
import ActionItems from './ActionItems.jsx';
import SetupGuide from './SetupGuide.jsx';
import SupportInbox from './SupportInbox.jsx';
import SubscriptionLinkGenerator from './SubscriptionLinkGenerator.jsx';
import OpsLinking from './OpsLinking.jsx';

const RANGES = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

export default function Dashboard({ onLogout }) {
  const [days, setDays] = useState(30);
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recsLoading, setRecsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState('');
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [supportError, setSupportError] = useState('');

  const refresh = useCallback(
    async (nextDays = days, opts = {}) => {
      if (opts.silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      setSupportLoading(true);
      setSupportError('');
      try {
        const [insightsResp, recsResp] = await Promise.all([
          apiGet(`/admin/insights?days=${nextDays}`),
          apiGet(`/admin/recommendations?days=${nextDays}`),
        ]);
        const supportResp = await apiGet('/admin/support/recent?limit=8').catch(() => ({
          ok: false,
          requests: [],
          message: 'Support inbox is unavailable until the Worker is deployed.',
        }));
        setInsights(insightsResp);
        setRecommendations(recsResp?.recommendations || []);
        setSupportRequests(supportResp?.requests || []);
        setSupportError(supportResp?.ok === false ? supportResp.message || 'Support inbox is unavailable.' : '');
        setAiSummary(null);
        setAiSummaryError('');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onLogout();
          return;
        }
        setError(err?.message || 'Could not load the dashboard.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setRecsLoading(false);
        setSupportLoading(false);
      }
    },
    [days, onLogout],
  );

  const runAiSummary = useCallback(async () => {
    setAiSummaryLoading(true);
    setAiSummaryError('');
    try {
      const result = await apiPost('/admin/ai-summary', { days });
      if (!result?.ok) {
        setAiSummary(null);
        setAiSummaryError(result?.message || 'AI Summary could not run right now.');
        return;
      }
      setAiSummary(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onLogout();
        return;
      }
      setAiSummaryError(err?.message || 'AI Summary could not run right now.');
    } finally {
      setAiSummaryLoading(false);
    }
  }, [days, onLogout]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refresh(days);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [days, refresh]);

  const handleLogout = useCallback(async () => {
    try {
      await apiPost('/admin/logout', {});
    } catch {
      /* ignore */
    }
    setStoredToken('');
    onLogout();
  }, [onLogout]);

  const totals = insights?.totals || {};
  const funnel = insights?.funnel || {};
  const health = insights?.health || null;
  const setup = insights?.setup || null;
  const metaInsightsError = insights?.metaInsightsError;
  const breakdowns = insights?.breakdowns || {};
  const idCaptureRate = useMemo(() => {
    const rates = [health?.campaignIdRate, health?.adIdRate].filter((value) => typeof value === 'number');
    if (rates.length === 0) return null;
    return Math.min(...rates);
  }, [health]);

  const sources = useMemo(() => {
    if (!insights?.byCampaign) return [];
    return insights.byCampaign.filter((row) => row.spend > 0 || row.schedules > 0 || row.leads > 0);
  }, [insights]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-black uppercase italic tracking-tight text-white">AutoLander Performance</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Real-time view of your Meta ads + conversions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RangePicker value={days} onChange={setDays} />
            <button
              type="button"
              onClick={() => refresh(days, { silent: true })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        {metaInsightsError && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200">
            Couldn't load Meta spend data ({metaInsightsError}). Check META_AD_ACCOUNT_ID and the access token.
          </div>
        )}

        <ActionItems recommendations={recommendations} loading={recsLoading} />

        <SubscriptionLinkGenerator />

        <OpsLinking />

        <SupportInbox requests={supportRequests} loading={supportLoading} error={supportError} />

        <AiSummaryPanel
          summary={aiSummary?.summary}
          generatedAt={aiSummary?.generatedAt}
          model={aiSummary?.model}
          loading={aiSummaryLoading}
          error={aiSummaryError}
          onRun={runAiSummary}
        />

        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <KpiTile label="Spend" value={totals.spend ?? 0} format="currency" sublabel={`${days}d`} />
            <KpiTile label="Leads" value={totals.leads ?? 0} sublabel={`${days}d`} />
            <KpiTile label="CPL" value={totals.cpl} format="currency" sublabel={`${days}d`} />
            <KpiTile label="Legacy Demos" value={totals.schedules ?? 0} sublabel={`${days}d`} />
            <KpiTile label="Meta ID Capture" value={idCaptureRate} format="percent" sublabel="campaign + ad" />
            <KpiTile label="fbclid Capture" value={health?.fbclidCaptureRate} format="percent" sublabel="Meta visits" />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <TimeSeriesChart data={insights?.byDay} />
          <FunnelChart funnel={funnel} />
        </section>

        <section>
          <HealthCard health={health} />
        </section>

        <TrafficExplorer breakdowns={breakdowns} totals={totals} recentEvents={insights?.recentEvents} />

        <section>
          <CampaignTable
            rows={sources}
            title="Campaigns (spend vs. applications)"
            emptyMessage="No spend or conversions yet. Once your Meta campaigns start running, you'll see them here."
          />
        </section>

        <section>
          <CampaignTable
            rows={insights?.byAd}
            title="Ads"
            emptyMessage="No ad-level data yet. Add UTM parameters to your Meta ads to enable this view."
          />
        </section>

        {setup && <SetupGuide setup={setup} />}

        {loading && (
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">Loading data...</p>
        )}
      </main>
    </div>
  );
}

function RangePicker({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
      {RANGES.map((range) => {
        const active = range.days === value;
        return (
          <button
            key={range.days}
            type="button"
            onClick={() => onChange(range.days)}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
              active ? 'bg-blue-500 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}

/*
function SetupStrip({ setup }) {
  const items = [
    { label: 'Pixel ID configured', ok: setup.hasPixelId },
    { label: 'Conversions API token', ok: setup.hasCapiToken },
    { label: 'Ad account connected', ok: setup.hasAdAccountId && setup.hasMetaMarketingToken },
    { label: 'GHL lead routing', ok: setup.hasGhlLeadRouting },
    { label: 'Tracking storage', ok: setup.hasTrackingKv },
    {
      label: setup.testEventCode ? 'Test events mode' : 'Live events mode',
      ok: !setup.testEventCode,
      neutral: Boolean(setup.testEventCode),
    },
  ];
  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <h3 className="mb-4 text-sm font-black uppercase italic tracking-tight text-white">Setup checklist</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${
              item.neutral
                ? 'border-amber-500/30 bg-amber-500/10'
                : item.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                item.neutral
                  ? 'bg-amber-400 text-black'
                  : item.ok
                    ? 'bg-emerald-400 text-black'
                    : 'bg-red-500 text-white'
              }`}
            >
              {item.neutral ? '!' : item.ok ? '✓' : '×'}
            </span>
            <span className="text-sm font-bold text-white">{item.label}</span>
          </div>
        ))}
      </div>
      {setup.urlParamTemplate && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta ad URL parameters</p>
          <code className="mt-2 block overflow-x-auto whitespace-pre text-[11px] text-slate-200">
            {setup.urlParamTemplate}
          </code>
          <p className="mt-2 text-[10px] text-slate-500">
            Paste this into every Meta ad's URL parameters so spend ties back to leads + demos.
          </p>
        </div>
      )}
    </section>
  );
}
*/
