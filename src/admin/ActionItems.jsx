import { useState } from 'react';

const SEVERITY = {
  urgent: { label: 'Urgent', color: 'border-red-500/40 bg-red-500/10 text-red-200', dot: 'bg-red-500' },
  warn: { label: 'Warning', color: 'border-amber-500/40 bg-amber-500/10 text-amber-100', dot: 'bg-amber-400' },
  info: { label: 'Info', color: 'border-blue-500/30 bg-blue-500/10 text-blue-100', dot: 'bg-blue-500' },
};

export default function ActionItems({ recommendations, loading }) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-sm text-slate-400">
        Loading recommendations…
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm font-medium text-emerald-100">
        Everything is healthy. No action items.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Action items</h2>
      {recommendations.map((rec, i) => (
        <ActionItem key={`${rec.title}-${i}`} rec={rec} />
      ))}
    </div>
  );
}

function ActionItem({ rec }) {
  const sev = SEVERITY[rec.severity] || SEVERITY.info;
  return (
    <div className={`rounded-2xl border p-5 ${sev.color}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 inline-block h-2 w-2 rounded-full ${sev.dot}`} />
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{sev.label}</p>
          <p className="mt-1 text-base font-black text-white">{rec.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{rec.body}</p>
          {rec.action?.type === 'copy' && rec.action.payload && <CopyBlock value={rec.action.payload} />}
        </div>
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
