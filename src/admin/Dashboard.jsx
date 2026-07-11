import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiPost, setStoredToken } from './lib/api.js';
import SupportInbox from './SupportInbox.jsx';
import SupportAdjustments from './SupportAdjustments.jsx';
import BillingLinks from './BillingLinks.jsx';
import OpsLinking from './OpsLinking.jsx';

export default function Dashboard({ onLogout }) {
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [supportError, setSupportError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadSupportRequests = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setRefreshing(true);
      else setSupportLoading(true);
      setSupportError('');
      try {
        const supportResp = await apiGet('/admin/support/recent?limit=100');
        setSupportRequests(supportResp?.requests || []);
        setSupportError(supportResp?.ok === false ? supportResp.message || 'Chatbot messages are unavailable.' : '');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onLogout();
          return;
        }
        setSupportRequests([]);
        setSupportError(err?.message || 'Chatbot messages are unavailable.');
      } finally {
        setSupportLoading(false);
        setRefreshing(false);
      }
    },
    [onLogout],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSupportRequests();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSupportRequests]);

  const handleLogout = useCallback(async () => {
    try {
      await apiPost('/admin/logout', {});
    } catch {
      /* ignore */
    }
    setStoredToken('');
    onLogout();
  }, [onLogout]);

  const handleDeleteSupportRequest = useCallback(
    async (id) => {
      setSupportError('');
      try {
        await apiPost('/admin/support/delete', { id });
        setSupportRequests((current) => current.filter((request) => request.id !== id));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onLogout();
          return;
        }
        setSupportError(err?.message || 'Could not delete chatbot message.');
        throw err;
      }
    },
    [onLogout],
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-black uppercase italic tracking-tight text-white">AutoLander Admin</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Chatbot messages, support adjustments, payment links, and account linking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadSupportRequests({ silent: true })}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Messages'}
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

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <SupportInbox
          requests={supportRequests}
          loading={supportLoading}
          error={supportError}
          onDelete={handleDeleteSupportRequest}
        />
        <OpsLinking />
        <SupportAdjustments />
        <BillingLinks />
      </main>
    </div>
  );
}
