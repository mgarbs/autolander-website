import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

const SEVERITY = {
  urgent: { label: 'Urgent', color: 'border-red-500/40 bg-red-500/10 text-red-200', dot: 'bg-red-500' },
  warn: { label: 'Warning', color: 'border-amber-500/40 bg-amber-500/10 text-amber-100', dot: 'bg-amber-400' },
  info: { label: 'Info', color: 'border-blue-500/30 bg-blue-500/10 text-blue-100', dot: 'bg-blue-500' },
};

const DISMISSED_KEY = 'autolander_admin_dismissed_action_items_v1';

export default function ActionItems({ recommendations, loading }) {
  const [dismissedKeys, setDismissedKeys] = useState(() => readDismissedKeys());

  useEffect(() => {
    writeDismissedKeys(dismissedKeys);
  }, [dismissedKeys]);

  const items = useMemo(
    () =>
      Array.isArray(recommendations)
        ? recommendations.map((rec, index) => ({
            rec,
            key: recommendationKey(rec, index),
          }))
        : [],
    [recommendations],
  );
  const visibleItems = items.filter((item) => !dismissedKeys.includes(item.key));
  const dismissedCount = items.length - visibleItems.length;

  function dismissItem(key) {
    setDismissedKeys((current) => (current.includes(key) ? current : [...current, key]));
  }

  function dismissVisibleItems() {
    setDismissedKeys((current) => {
      const next = new Set(current);
      visibleItems.forEach((item) => next.add(item.key));
      return [...next];
    });
  }

  function restoreDismissedItems() {
    setDismissedKeys([]);
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-sm text-slate-400">
        Loading recommendations…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm font-medium text-emerald-100">
        Everything is healthy. No action items.
      </div>
    );
  }

  if (!visibleItems.length) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Action items</h2>
            <p className="mt-2 text-sm font-medium text-emerald-100">
              All current action items have been cleared from this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={restoreDismissedItems}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/20"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Action items</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Clear items you have already reviewed
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dismissedCount > 0 && (
            <button
              type="button"
              onClick={restoreDismissedItems}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restore {dismissedCount}
            </button>
          )}
          <button
            type="button"
            onClick={dismissVisibleItems}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear all
          </button>
        </div>
      </div>
      {visibleItems.map((item) => (
        <ActionItem key={item.key} rec={item.rec} onDismiss={() => dismissItem(item.key)} />
      ))}
    </div>
  );
}

function ActionItem({ rec, onDismiss }) {
  const sev = SEVERITY[rec.severity] || SEVERITY.info;
  return (
    <div className={`rounded-2xl border p-5 ${sev.color}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 inline-block h-2 w-2 rounded-full ${sev.dot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{sev.label}</p>
          <p className="mt-1 text-base font-black text-white">{rec.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{rec.body}</p>
          {rec.action?.type === 'copy' && rec.action.payload && <CopyBlock value={rec.action.payload} />}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          title="Clear this action item"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Clear this action item</span>
        </button>
      </div>
    </div>
  );
}

function CopyBlock({ value }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="mt-3 flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-black/40 px-3 py-2">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-[11px] text-slate-200">{value}</code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function readDismissedKeys() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DISMISSED_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeDismissedKeys(keys) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(keys));
  } catch {
    /* localStorage may be disabled */
  }
}

function recommendationKey(rec, index) {
  const action = rec?.action || {};
  const parts = [
    rec?.severity || '',
    action.type || 'message',
    action.name || '',
    action.adId || '',
    action.adName || '',
    action.campaign || '',
    action.payload ? hashText(action.payload) : '',
    stableTitle(rec?.title || ''),
  ];
  const key = parts.filter(Boolean).join('|');
  return key || `action-${index}`;
}

function stableTitle(title) {
  return String(title)
    .replace(/\$[\d,.]+/g, '$')
    .replace(/\d+(\.\d+)?%/g, '%')
    .replace(/\d+/g, '#')
    .trim()
    .toLowerCase();
}

function hashText(value) {
  let hash = 5381;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
