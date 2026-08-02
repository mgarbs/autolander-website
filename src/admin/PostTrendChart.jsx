import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DARK_CHART_TOOLTIP_CONTENT_STYLE,
  DARK_CHART_TOOLTIP_ITEM_STYLE,
  DARK_CHART_TOOLTIP_LABEL_STYLE,
} from './lib/chart-tooltip.js';

export function PostTrendChart({ timeline, selection, onSelect }) {
  const buckets = normalizeBuckets(timeline?.buckets);
  const activeKey = selection?.bucketKey || '';
  const nonEmptyBuckets = buckets.filter((bucket) => bucket.total > 0);
  const metered = String(timeline?.basis || '').includes('post_usage_metered');
  const seriesLabel = metered ? 'Metered new posts' : 'Successful posting actions';

  if (nonEmptyBuckets.length === 0) return null;

  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3 sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-200">{seriesLabel} timeline</h4>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Select a bar to inspect related people, vehicles, and media settings.
          </p>
        </div>
        <label className="min-w-0 sm:w-48">
          <span className="sr-only">Inspect a posting time slice</span>
          <select
            value={activeKey}
            onChange={(event) => {
              const bucket = buckets.find((candidate) => candidate.key === event.target.value);
              onSelect?.(bucket ? selectionForBucket(bucket) : null);
            }}
            className="h-8 w-full rounded-lg border border-white/10 bg-black/70 px-2 text-[10px] font-black uppercase tracking-wider text-slate-200 outline-none focus:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-200/60"
          >
            <option value="">All time slices</option>
            {nonEmptyBuckets.map((bucket) => (
              <option key={bucket.key} value={bucket.key}>
                {bucket.longLabel} ({bucket.total.toLocaleString()})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="mt-3 h-56 min-w-0 sm:h-64"
        role="img"
        aria-label={`${seriesLabel} over time. Use the time-slice menu to drill down with a keyboard.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
            <defs>
              <linearGradient id="postVolumeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.58" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fontSize: 9 }}
              minTickGap={18}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#64748b" tick={{ fontSize: 9 }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(34,211,238,0.055)' }}
              formatter={(value) => [finite(value).toLocaleString(), seriesLabel]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.longLabel || payload?.[0]?.payload?.label || ''}
              contentStyle={{
                ...DARK_CHART_TOOLTIP_CONTENT_STYLE,
                border: '1px solid rgba(34,211,238,.18)',
              }}
              labelStyle={DARK_CHART_TOOLTIP_LABEL_STYLE}
              itemStyle={DARK_CHART_TOOLTIP_ITEM_STYLE}
            />
            <Bar
              dataKey="total"
              name={seriesLabel}
              maxBarSize={36}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(entry) => {
                const bucket = entry?.payload || entry;
                if (finite(bucket?.total) > 0) onSelect?.(selectionForBucket(bucket));
              }}
            >
              {buckets.map((bucket) => {
                const selected = activeKey === bucket.key;
                const muted = Boolean(activeKey) && !selected;
                return (
                  <Cell
                    key={bucket.key}
                    fill="url(#postVolumeFill)"
                    fillOpacity={muted ? 0.24 : 1}
                    stroke={selected ? '#ecfeff' : 'transparent'}
                    strokeWidth={selected ? 1.5 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selection && (
        <button
          type="button"
          onClick={() => onSelect?.(null)}
          className="mt-2 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.055] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-100 hover:border-cyan-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        >
          Clear {selection.bucketLabel || 'time'} drill-down
        </button>
      )}
    </section>
  );
}

export default PostTrendChart;

function selectionForBucket(bucket) {
  return {
    bucketKey: bucket.key,
    bucketLabel: bucket.longLabel || bucket.label,
    startAt: bucket.startAt || bucket.start || null,
    endAt: bucket.endAt || bucket.end || null,
  };
}

function normalizeBuckets(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry, index) => ({
    ...entry,
    key: String(entry?.key ?? entry?.bucketKey ?? index),
    label: String(entry?.label ?? entry?.shortLabel ?? index + 1),
    longLabel: String(entry?.longLabel ?? entry?.label ?? index + 1),
    total: finite(entry?.total ?? entry?.count),
  }));
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}
