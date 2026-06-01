import { AlertTriangle, Brain, CheckCircle2, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import HelpTip from './HelpTip.jsx';

export default function AiSummaryPanel({ summary, generatedAt, model, loading, error, onRun }) {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-blue-400/20 bg-blue-500/[0.06] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-300" aria-hidden="true" />
              <h2 className="text-sm font-black uppercase italic tracking-tight text-white">AI Summary</h2>
              <HelpTip text="Runs an admin-only AI read of the dashboard data. It looks for campaign wins, weak spots, traffic patterns, and tracking gaps in simple language." />
            </div>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-300">
              {summary?.headline || 'Run an expert read when you want the plain-English story behind the numbers.'}
            </p>
            {generatedAt && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Generated {formatDateTime(generatedAt)}
                {model ? ` with ${model}` : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRun}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? 'Reading Data' : 'Run AI Summary'}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </div>
        )}

        {summary?.executiveSummary && !loading && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">What it means</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{summary.executiveSummary}</p>
          </div>
        )}
      </div>

      {summary && !loading && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <InsightList
              title="What Is Good"
              icon={CheckCircle2}
              accent="emerald"
              items={summary.whatIsWorking}
              empty="No clear wins yet."
            />
            <InsightList
              title="Interesting Signals"
              icon={Lightbulb}
              accent="amber"
              items={summary.interestingSignals}
              empty="No standout patterns yet."
            />
            <InsightList
              title="Risks"
              icon={AlertTriangle}
              accent="rose"
              items={summary.risks}
              empty="No major risks found."
            />
          </div>

          <ActionList actions={summary.recommendedActions} />

          <InsightList
            title="Tracking Notes"
            icon={TrendingUp}
            accent="blue"
            items={summary.trackingNotes}
            empty="No tracking notes."
          />
        </>
      )}
    </section>
  );
}

function InsightList({ title, icon: Icon, accent, items, empty }) {
  const rows = Array.isArray(items) ? items.filter((item) => item.title || item.meaning) : [];
  return (
    <div className={`rounded-3xl border ${accentClasses(accent).border} bg-white/[0.03] p-6`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accentClasses(accent).text}`} aria-hidden="true" />
        <h3 className="text-sm font-black uppercase italic tracking-tight text-white">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="space-y-4">
          {rows.map((item) => (
            <div key={`${item.title}-${item.meaning}`}>
              <p className="text-sm font-black text-white">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{item.meaning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionList({ actions }) {
  const rows = Array.isArray(actions) ? actions.filter((item) => item.title || item.nextStep) : [];
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-300" aria-hidden="true" />
        <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Recommended Next Moves</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No AI actions yet.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((item) => (
            <div key={`${item.priority}-${item.title}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black text-white">{item.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${priorityClasses(
                    item.priority,
                  )}`}
                >
                  {item.priority || 'medium'}
                </span>
              </div>
              {item.why && <p className="mt-2 text-sm leading-6 text-slate-300">{item.why}</p>}
              {item.nextStep && (
                <p className="mt-3 border-t border-white/10 pt-3 text-sm font-bold leading-6 text-blue-100">
                  {item.nextStep}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonLine() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-3 h-3 w-full rounded bg-white/10" />
      <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
    </div>
  );
}

function accentClasses(accent) {
  const classes = {
    emerald: { border: 'border-emerald-400/15', text: 'text-emerald-300' },
    amber: { border: 'border-amber-400/15', text: 'text-amber-300' },
    rose: { border: 'border-rose-400/15', text: 'text-rose-300' },
    blue: { border: 'border-blue-400/15', text: 'text-blue-300' },
  };
  return classes[accent] || classes.blue;
}

function priorityClasses(priority) {
  if (priority === 'high') return 'bg-red-400 text-black';
  if (priority === 'low') return 'bg-slate-600 text-white';
  return 'bg-amber-300 text-black';
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
