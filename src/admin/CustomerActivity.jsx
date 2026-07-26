import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import AccountDetail from './AccountDetailDiagnostics.jsx';
import { AccountsTable, FiltersBar, KpiRow } from './CustomerActivityParts.jsx';
import GlobalFailureMonitor from './GlobalFailureMonitor.jsx';
import GlobalPostMonitor from './GlobalPostMonitor.jsx';
import { ApiError } from './lib/api.js';
import {
  OPS_SETUP_NOTE,
  fetchAccount,
  fetchAllAccountFailures,
  fetchAccounts,
  fetchAnalyticsMeta,
  fetchOverview,
  fetchPostsDaily,
  fetchTickets,
  isOpsNotConfigured,
  saveCsMeta,
  saveNote,
} from './lib/analytics.js';

const EMPTY_PAGE = { rows: [], total: 0, limit: 25, offset: 0 };
const EMPTY_FAILURES = { rows: [], total: 0, limit: 200, offset: 0, available: false, summary: {} };
const EMPTY_DETAIL = {
  account: null,
  daily: [],
  tickets: { rows: [], sheetUrl: '' },
  failures: EMPTY_FAILURES,
  error: '',
  failuresError: '',
};
const DEFAULT_FILTERS = { plan: '', status: '', health: '', preset: '', sort: 'health', limit: 25, offset: 0 };
export default function CustomerActivity({ embedded = false, onUnauthorized }) {
  const [overview, setOverview] = useState(null);
  const [analyticsMeta, setAnalyticsMeta] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');
  const [page, setPage] = useState(EMPTY_PAGE);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [opsUnavailable, setOpsUnavailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSearchCandidate, setSelectedSearchCandidate] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [expandedOrgId, setExpandedOrgId] = useState('');
  const [detail, setDetail] = useState(EMPTY_DETAIL);
  const [detailLoading, setDetailLoading] = useState(false);
  const [failuresLoading, setFailuresLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [detailDays, setDetailDays] = useState(30);
  const [failureDays, setFailureDays] = useState(30);
  const [writePending, setWritePending] = useState(false);
  const [followUpPendingId, setFollowUpPendingId] = useState('');

  const accountRequest = useMemo(
    () => ({ ...filters, q: debouncedSearch }),
    [debouncedSearch, filters],
  );
  const displayPage = useMemo(() => {
    const candidateOrgId = String(selectedSearchCandidate?.orgId || '');
    if (!candidateOrgId) return page;
    return {
      ...page,
      rows: page.rows.map((row) => (
        String(row.orgId || row.id || '') === candidateOrgId
          ? {
              ...row,
              matchedUsers: selectedSearchCandidate.matchedUsers || row.matchedUsers,
              admins: selectedSearchCandidate.admins || row.admins,
              contactName: selectedSearchCandidate.contactName || row.contactName,
              contactEmail: selectedSearchCandidate.email || row.contactEmail,
              phone: selectedSearchCandidate.phone || row.phone,
            }
          : row
      )),
    };
  }, [page, selectedSearchCandidate]);
  const accountsSeq = useRef(0);
  const detailSeq = useRef(0);
  const chartSeq = useRef(0);
  const failuresSeq = useRef(0);

  const handleError = useCallback((err, fallback) => {
    if (err instanceof ApiError && err.status === 401) {
      onUnauthorized?.();
      return 'Your admin session expired.';
    }
    if (isOpsNotConfigured(err)) {
      setOpsUnavailable(true);
      return '';
    }
    if (err?.reason === 'ops_token_rejected') return 'The analytics service token was rejected. Check the matching Worker and cloud secrets.';
    if (err?.reason === 'cloud_unreachable') return 'The analytics service is temporarily unreachable.';
    return fallback;
  }, [onUnauthorized]);

  const loadOverview = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setOverviewLoading(true);
    setOverviewError('');
    try {
      const [nextOverview, nextMeta] = await Promise.all([
        fetchOverview(),
        fetchAnalyticsMeta(),
      ]);
      setOverview(nextOverview);
      setAnalyticsMeta(nextMeta);
      setOpsUnavailable(false);
    } catch (err) {
      const message = handleError(err, 'Could not load customer-activity totals.');
      if (message) setOverviewError(message);
    } finally {
      setOverviewLoading(false);
    }
  }, [handleError]);

  const loadAccounts = useCallback(async ({ silent = false } = {}) => {
    const seq = accountsSeq.current + 1;
    accountsSeq.current = seq;
    if (!silent) setPageLoading(true);
    setPageError('');
    try {
      const response = await fetchAccounts(accountRequest);
      if (accountsSeq.current !== seq) return;
      setPage(response);
      setOpsUnavailable(false);
    } catch (err) {
      if (accountsSeq.current !== seq) return;
      const message = handleError(err, 'Could not load customer accounts.');
      if (message) setPageError(message);
    } finally {
      if (accountsSeq.current === seq) setPageLoading(false);
    }
  }, [accountRequest, handleError]);

  const loadDetail = useCallback(async (
    orgId,
    days,
    { silent = false, failureWindowDays = failureDays } = {},
  ) => {
    const seq = detailSeq.current + 1;
    detailSeq.current = seq;
    chartSeq.current += 1;
    const failureRequestSeq = failuresSeq.current + 1;
    failuresSeq.current = failureRequestSeq;
    if (!silent) setDetailLoading(true);
    setFailuresLoading(true);
    setDetail((current) => ({ ...current, error: '', failuresError: '' }));

    const detailPromise = Promise.allSettled([
      fetchAccount(orgId),
      fetchPostsDaily(orgId, days),
      fetchTickets(orgId),
    ]);
    const failuresPromise = Promise.allSettled([
      fetchAllAccountFailures(orgId, {
        days: failureWindowDays,
        limit: 200,
        maxRows: 5_000,
      }),
    ]).then(([result]) => result);

    const results = await detailPromise;
    if (detailSeq.current !== seq) return;

    const rejected = results.find((result) => result.status === 'rejected');
    if (rejected) {
      const message = handleError(rejected.reason, 'Some account details could not be loaded.');
      setDetail((current) => ({
        ...current,
        account: results[0].status === 'fulfilled' ? results[0].value : current.account,
        daily: results[1].status === 'fulfilled' ? results[1].value : current.daily,
        tickets: results[2].status === 'fulfilled' ? results[2].value : current.tickets,
        error: message,
      }));
    } else {
      setDetail((current) => ({
        ...current,
        account: results[0].value,
        daily: results[1].value,
        tickets: results[2].value,
        error: '',
      }));
      setOpsUnavailable(false);
    }
    setDetailLoading(false);
    setChartLoading(false);

    const failuresResult = await failuresPromise;
    if (detailSeq.current !== seq || failuresSeq.current !== failureRequestSeq) return;
    if (failuresResult.status === 'fulfilled') {
      setDetail((current) => ({
        ...current,
        failures: failuresResult.value,
        failuresError: '',
      }));
    } else {
      const message = handleError(failuresResult.reason, 'Could not load failure diagnostics.');
      setDetail((current) => ({ ...current, failuresError: message }));
    }
    setFailuresLoading(false);
  }, [failureDays, handleError]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { loadOverview(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadOverview]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { loadAccounts(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAccounts]);

  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      loadOverview({ silent: true });
      loadAccounts({ silent: true });
      if (expandedOrgId) loadDetail(expandedOrgId, detailDays, { silent: true });
    };
    const intervalId = window.setInterval(tick, 45000);
    const handleVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [detailDays, expandedOrgId, loadAccounts, loadDetail, loadOverview]);

  function setFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value, offset: 0 }));
  }

  function applyPreset(preset) {
    setFilters((current) => ({ ...current, preset, offset: 0 }));
  }

  function clearFilters() {
    setSearch('');
    setDebouncedSearch('');
    setSelectedSearchCandidate(null);
    setFilters(DEFAULT_FILTERS);
  }

  function setPageOffset(offset) {
    setFilters((current) => ({ ...current, offset }));
  }

  function toggleAccount(row) {
    const orgId = String(row.orgId || row.id || '');
    if (!orgId) return;
    if (expandedOrgId === orgId) {
      detailSeq.current += 1;
      chartSeq.current += 1;
      failuresSeq.current += 1;
      setExpandedOrgId('');
      setDetail(EMPTY_DETAIL);
      setDetailLoading(false);
      setFailuresLoading(false);
      return;
    }
    setExpandedOrgId(orgId);
    setDetailDays(30);
    setFailureDays(30);
    setDetail(EMPTY_DETAIL);
    setDetailLoading(true);
    setFailuresLoading(true);
    loadDetail(orgId, 30, { failureWindowDays: 30 });
  }

  async function changeDetailDays(days) {
    if (!expandedOrgId || days === detailDays) return;
    setDetailDays(days);
    setChartLoading(true);
    const seq = chartSeq.current + 1;
    chartSeq.current = seq;
    try {
      const rows = await fetchPostsDaily(expandedOrgId, days);
      if (chartSeq.current === seq) setDetail((current) => ({ ...current, daily: rows }));
    } catch (err) {
      if (chartSeq.current === seq) {
        const message = handleError(err, 'Could not load daily posting data.');
        setDetail((current) => ({ ...current, error: message }));
      }
    } finally {
      if (chartSeq.current === seq) setChartLoading(false);
    }
  }

  async function changeFailureDays(days) {
    if (!expandedOrgId || days === failureDays) return;
    setFailureDays(days);
    setFailuresLoading(true);
    const seq = failuresSeq.current + 1;
    failuresSeq.current = seq;
    setDetail((current) => ({
      ...current,
      failures: {
        ...EMPTY_FAILURES,
        summary: { windowDays: days },
      },
      failuresError: '',
    }));
    try {
      const failures = await fetchAllAccountFailures(
        expandedOrgId,
        { days, limit: 200, maxRows: 5_000 },
      );
      if (failuresSeq.current === seq) {
        setDetail((current) => ({ ...current, failures, failuresError: '' }));
      }
    } catch (err) {
      if (failuresSeq.current === seq) {
        const message = handleError(err, 'Could not load failure diagnostics.');
        setDetail((current) => ({ ...current, failuresError: message }));
      }
    } finally {
      if (failuresSeq.current === seq) setFailuresLoading(false);
    }
  }

  async function addNote(note) {
    if (!expandedOrgId) return;
    setWritePending(true);
    try {
      await saveNote(expandedOrgId, note);
      await loadDetail(expandedOrgId, detailDays, { silent: true });
    } finally {
      setWritePending(false);
    }
  }

  async function saveMeta(meta) {
    if (!expandedOrgId) return;
    setWritePending(true);
    try {
      await saveCsMeta(expandedOrgId, meta);
      setPage((current) => ({
        ...current,
        rows: current.rows.map((row) => String(row.orgId || row.id) === expandedOrgId
          ? { ...row, csOwner: meta.owner || '', followUp: Boolean(meta.followUp) }
          : row),
      }));
      await loadDetail(expandedOrgId, detailDays, { silent: true });
    } finally {
      setWritePending(false);
    }
  }

  async function setRowFollowUp(row, followUp) {
    const orgId = String(row.orgId || row.id || '');
    if (!orgId) return;
    setFollowUpPendingId(orgId);
    setPageError('');
    try {
      await saveCsMeta(orgId, { followUp });
      setPage((current) => ({
        ...current,
        rows: current.rows.map((item) => String(item.orgId || item.id) === orgId
          ? { ...item, followUp }
          : item),
      }));
      if (expandedOrgId === orgId) {
        setDetail((current) => ({
          ...current,
          account: current.account
            ? { ...current.account, csMeta: { ...(current.account.csMeta || {}), followUp } }
            : current.account,
        }));
      }
    } catch (err) {
      const message = handleError(err, 'Could not update the follow-up flag.');
      if (message) setPageError(message);
    } finally {
      setFollowUpPendingId((current) => current === orgId ? '' : current);
    }
  }

  async function refreshAll() {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOverview({ silent: true }),
        loadAccounts({ silent: true }),
        expandedOrgId ? loadDetail(expandedOrgId, detailDays, { silent: true }) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className={embedded ? 'min-w-0' : 'min-w-0 rounded-3xl border border-white/10 bg-white/[0.03]'}>
      <div className={`flex flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between ${embedded ? 'pt-5' : 'border-b border-white/10 py-4'}`}>
        <div className={embedded ? 'hidden' : 'flex min-w-0 items-center gap-3'}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300"><Activity size={20} /></span>
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Customer Activity</h2>
            <p className="min-w-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Subscribers, account health, posting activity, and follow-up
              {overview?.generatedAt ? ` · updated ${new Date(overview.generatedAt).toLocaleTimeString()}` : ''}
            </p>
          </div>
        </div>
        {!opsUnavailable && (
          <button type="button" onClick={refreshAll} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white disabled:opacity-50">
            {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
          </button>
        )}
      </div>

      <div className="min-w-0 space-y-5 p-5">
        {opsUnavailable ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold leading-relaxed text-amber-200">{OPS_SETUP_NOTE}</div>
        ) : (
          <>
            {overviewError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">{overviewError}</div>}
            {overviewLoading && !overview ? (
              <div className="grid animate-pulse grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">{Array.from({ length: 11 }, (_, index) => <div key={index} className="h-24 rounded-2xl bg-white/[0.04]" />)}</div>
            ) : (
              <KpiRow overview={overview || {}} onPreset={applyPreset} />
            )}
            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
              <GlobalPostMonitor onUnauthorized={onUnauthorized} />
              <GlobalFailureMonitor onUnauthorized={onUnauthorized} />
            </div>
            <FiltersBar
              search={search}
              filters={filters}
              onSearch={(value) => {
                setSearch(value);
                if (String(value) !== String(selectedSearchCandidate?.orgId || '')) {
                  setSelectedSearchCandidate(null);
                }
                setFilters((current) => ({ ...current, offset: 0 }));
              }}
              onCandidateSelect={(_orgId, candidate) => setSelectedSearchCandidate(candidate)}
              onFilter={setFilter}
              onPreset={applyPreset}
              onClear={clearFilters}
            />
            <AccountsTable
              page={displayPage}
              latestDesktopVersion={analyticsMeta?.latestDesktopVersion}
              loading={pageLoading}
              error={pageError}
              expandedOrgId={expandedOrgId}
              followUpPendingId={followUpPendingId}
              onToggle={toggleAccount}
              onFollowUp={setRowFollowUp}
              onPage={setPageOffset}
              renderExpanded={(row) => {
                const orgId = String(row.orgId || row.id || '');
                if (!detail.account && detailLoading) {
                  return <div className="flex items-center justify-center gap-2 px-5 py-12 text-[10px] font-black uppercase tracking-widest text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading account detail</div>;
                }
                if (!detail.account) {
                  return <div className="px-5 py-8 text-center text-xs font-bold text-red-300">{detail.error || 'Account detail is unavailable.'}</div>;
                }
                return (
                  <>
                    {detail.error && <div className="border-b border-amber-500/20 bg-amber-500/10 px-5 py-3 text-xs font-bold text-amber-200">{detail.error}</div>}
                    <AccountDetail
                      key={`${orgId}:${Boolean(row.followUp)}`}
                      orgId={orgId}
                      summary={row}
                      latestDesktopVersion={analyticsMeta?.latestDesktopVersion}
                      detail={detail.account}
                      daily={detail.daily}
                      tickets={detail.tickets}
                      failures={detail.failures}
                      failuresLoading={failuresLoading}
                      failuresError={detail.failuresError}
                      failureDays={failureDays}
                      days={detailDays}
                      chartLoading={chartLoading}
                      refreshing={detailLoading || failuresLoading}
                      writePending={writePending}
                      onDaysChange={changeDetailDays}
                      onFailureDaysChange={changeFailureDays}
                      onRefresh={() => loadDetail(orgId, detailDays)}
                      onAddNote={addNote}
                      onSaveCs={saveMeta}
                    />
                  </>
                );
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}
