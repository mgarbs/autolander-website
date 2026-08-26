import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiPost, setStoredToken } from './lib/api.js';
import CollapsibleSection from './CollapsibleSection.jsx';
import SupportInbox from './SupportInbox.jsx';
import SupportAdjustments from './SupportAdjustments.jsx';
import BillingLinks from './BillingLinks.jsx';
import OpsLinking from './OpsLinking.jsx';
import CustomerActivity from './CustomerActivity.jsx';
import ContentPublisher from './ContentPublisher.jsx';

const ADMIN_SECTIONS = [
  {
    slug: 'customer-activity',
    title: 'Customer Activity',
    subtitle: 'Subscribers, account health, posting activity, and follow-up',
    defaultOpen: true,
  },
  {
    slug: 'chatbot-messages',
    title: 'Chatbot Messages',
    subtitle: 'Recent support requests and chatbot transcripts',
    defaultOpen: false,
  },
  {
    slug: 'account-linking',
    title: 'Account Linking',
    subtitle: 'Payment-link payers not attached to any account',
    defaultOpen: false,
  },
  {
    slug: 'support-adjustments',
    title: 'Support Adjustments',
    subtitle: 'Credits, billing dates, and next-month discounts',
    defaultOpen: false,
  },
  {
    slug: 'payment-links',
    title: 'Payment Links',
    subtitle: 'Centralized billing links — autolander.ai/pay/{token}',
    defaultOpen: false,
  },
  {
    slug: 'content-publisher',
    title: 'Content Publisher',
    subtitle: 'Drip-publish the prepared SEO article library, one click per article',
    defaultOpen: false,
  },
];

function collapseStorageKey(slug) {
  return `al_admin_collapse_${slug}`;
}

function initialOpenSections() {
  return Object.fromEntries(ADMIN_SECTIONS.map(({ slug, defaultOpen }) => {
    if (typeof window === 'undefined') return [slug, defaultOpen];
    try {
      const stored = window.localStorage.getItem(collapseStorageKey(slug));
      return [slug, stored === null ? defaultOpen : stored === 'true'];
    } catch {
      return [slug, defaultOpen];
    }
  }));
}

export default function Dashboard({ onLogout }) {
  const [openSections, setOpenSections] = useState(initialOpenSections);
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [supportError, setSupportError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const supportInboxOpen = openSections['chatbot-messages'];
  const allSectionsOpen = ADMIN_SECTIONS.every(({ slug }) => openSections[slug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      for (const { slug } of ADMIN_SECTIONS) {
        window.localStorage.setItem(collapseStorageKey(slug), String(Boolean(openSections[slug])));
      }
    } catch {
      // Local storage may be unavailable in locked-down browser contexts.
    }
  }, [openSections]);

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
    if (!supportInboxOpen) return undefined;
    const timeoutId = window.setTimeout(() => {
      loadSupportRequests();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSupportRequests, supportInboxOpen]);

  const toggleSection = useCallback((slug) => {
    setOpenSections((current) => ({ ...current, [slug]: !current[slug] }));
  }, []);

  const toggleAllSections = useCallback(() => {
    setOpenSections(Object.fromEntries(ADMIN_SECTIONS.map(({ slug }) => [slug, !allSectionsOpen])));
  }, [allSectionsOpen]);

  const handleRefreshMessages = useCallback(() => {
    if (!supportInboxOpen) {
      setOpenSections((current) => ({ ...current, 'chatbot-messages': true }));
      return;
    }
    loadSupportRequests({ silent: true });
  }, [loadSupportRequests, supportInboxOpen]);

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
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-black uppercase italic tracking-tight text-white">AutoLander Admin</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Customer health, chatbot messages, support adjustments, payment links, and account linking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshMessages}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : supportInboxOpen ? 'Refresh Messages' : 'Open Messages'}
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

      <main className="mx-auto max-w-[1500px] space-y-4 px-6 py-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleAllSections}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:text-white"
          >
            {allSectionsOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <CollapsibleSection
          {...ADMIN_SECTIONS[0]}
          open={openSections['customer-activity']}
          onToggle={() => toggleSection('customer-activity')}
        >
          <CustomerActivity embedded onUnauthorized={onLogout} />
        </CollapsibleSection>

        <CollapsibleSection
          {...ADMIN_SECTIONS[1]}
          open={supportInboxOpen}
          onToggle={() => toggleSection('chatbot-messages')}
        >
          <SupportInbox
            embedded
            requests={supportRequests}
            loading={supportLoading}
            error={supportError}
            onDelete={handleDeleteSupportRequest}
          />
        </CollapsibleSection>

        <CollapsibleSection
          {...ADMIN_SECTIONS[2]}
          open={openSections['account-linking']}
          onToggle={() => toggleSection('account-linking')}
        >
          <OpsLinking embedded />
        </CollapsibleSection>

        <CollapsibleSection
          {...ADMIN_SECTIONS[3]}
          open={openSections['support-adjustments']}
          onToggle={() => toggleSection('support-adjustments')}
        >
          <SupportAdjustments embedded />
        </CollapsibleSection>

        <CollapsibleSection
          {...ADMIN_SECTIONS[4]}
          open={openSections['payment-links']}
          onToggle={() => toggleSection('payment-links')}
        >
          <BillingLinks embedded />
        </CollapsibleSection>

        <CollapsibleSection
          {...ADMIN_SECTIONS[5]}
          open={openSections['content-publisher']}
          onToggle={() => toggleSection('content-publisher')}
        >
          <ContentPublisher onUnauthorized={onLogout} />
        </CollapsibleSection>
      </main>
    </div>
  );
}
