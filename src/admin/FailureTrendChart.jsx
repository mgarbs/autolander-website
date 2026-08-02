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
import { humanizeFailureValue } from './lib/failure-diagnostics.js';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#a855f7', '#3b82f6', '#14b8a6', '#64748b'];

export function FailureTrendChart({ timeline, selection, onSelect }) {
  const types = normalizeTypes(timeline?.types);
  const buckets = normalizeBuckets(timeline?.buckets, types);
  const hasFailures = buckets.some((bucket) => bucket.total > 0);

  if (!hasFailures || types.length === 0) return null;

  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3 sm:p-4">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-300">Failure timeline</h4>
          <p className="mt-1 text-[9px] text-slate-600">Select a colored segment to inspect those exact events.</p>
        </div>
        {selection && (
          <button
            type="button"
            onClick={() => onSelect?.(null)}
            className="self-start rounded-lg border border-white/10 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-slate-400 hover:border-white/20 hover:text-white"
          >
            Clear drill-down
          </button>
        )}
      </div>

      <div
        className="mt-3 h-56 min-w-0 sm:h-64"
        role="img"
        aria-label="Stacked failure counts over time, grouped by error type"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 8, right: 8, left: -20, bottom: 2 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#475569"
              tick={{ fontSize: 9 }}
              minTickGap={18}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#475569" tick={{ fontSize: 9 }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.035)' }}
              formatter={(value, dataKey) => [
                finite(value, 0).toLocaleString(),
                types.find((type) => type.dataKey === dataKey)?.label || dataKey,
              ]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.longLabel || payload?.[0]?.payload?.label || ''}
              contentStyle={{
                ...DARK_CHART_TOOLTIP_CONTENT_STYLE,
                border: '1px solid rgba(255,255,255,.12)',
              }}
              labelStyle={DARK_CHART_TOOLTIP_LABEL_STYLE}
              itemStyle={DARK_CHART_TOOLTIP_ITEM_STYLE}
            />
            {types.map((type, typeIndex) => (
              <Bar
                key={type.key}
                dataKey={type.dataKey}
                name={type.label}
                stackId="failures"
                maxBarSize={36}
                cursor="pointer"
                radius={typeIndex === types.length - 1 ? [3, 3, 0, 0] : 0}
                onClick={(entry) => selectSegment(entry, type, onSelect)}
              >
                {buckets.map((bucket) => {
                  const selected = selectionMatches(selection, bucket, type);
                  const muted = Boolean(selection) && !selected;
                  return (
                    <Cell
                      key={`${bucket.key}-${type.key}`}
                      fill={type.color}
                      fillOpacity={muted ? 0.28 : 0.9}
                      stroke={selected ? '#ffffff' : 'transparent'}
                      strokeWidth={selected ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap gap-1.5" aria-label="Filter failures by error type">
        {types.map((type) => {
          const selected = selection?.type === type.key && !selection?.bucketKey;
          return (
            <button
              key={type.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect?.({
                type: type.key,
                typeLabel: type.label,
                bucketKey: null,
                bucketLabel: 'All loaded dates',
                startAt: null,
                endAt: null,
              })}
              className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${
                selected
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-white/[0.025] text-slate-400 hover:text-white'
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: type.color }} />
              <span className="max-w-40 truncate">{type.label}</span>
              <span className="text-slate-600">{type.count.toLocaleString()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default FailureTrendChart;

function selectSegment(entry, type, onSelect) {
  const bucket = entry?.payload || entry;
  if (!bucket?.key || finite(bucket[type.dataKey], 0) < 1) return;
  onSelect?.({
    type: type.key,
    typeLabel: type.label,
    bucketKey: bucket.key,
    bucketLabel: bucket.longLabel || bucket.label,
    startAt: bucket.startAt || null,
    endAt: bucket.endAt || null,
  });
}

function selectionMatches(selection, bucket, type) {
  if (!selection) return false;
  return selection.type === type.key
    && (!selection.bucketKey || selection.bucketKey === bucket.key);
}

function normalizeTypes(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      const rawKey = typeof entry === 'string'
        ? entry
        : entry?.key ?? entry?.type ?? entry?.code;
      if (rawKey === undefined || rawKey === null || rawKey === '') return null;
      const key = String(rawKey);
      return {
        key,
        label: typeof entry === 'object' && entry?.label
          ? String(entry.label)
          : humanizeFailureValue(key),
        count: finite(typeof entry === 'object' ? entry?.count : undefined, 0),
        color: typeof entry === 'object' && entry?.color
          ? String(entry.color)
          : COLORS[index % COLORS.length],
        dataKey: `failureType${index}`,
      };
    })
    .filter(Boolean);
}

function normalizeBuckets(value, types) {
  if (!Array.isArray(value)) return [];
  return value.map((entry, index) => {
    const counts = entry?.counts && typeof entry.counts === 'object' ? entry.counts : {};
    const bucket = {
      ...entry,
      key: String(entry?.key ?? entry?.bucketKey ?? index),
      label: String(entry?.label ?? entry?.shortLabel ?? entry?.key ?? index + 1),
      longLabel: String(entry?.longLabel ?? entry?.label ?? entry?.key ?? index + 1),
      startAt: entry?.startAt ?? entry?.start ?? null,
      endAt: entry?.endAt ?? entry?.end ?? null,
    };
    let total = 0;
    types.forEach((type) => {
      const count = finite(counts[type.key] ?? entry?.[type.key], 0);
      bucket[type.dataKey] = count;
      total += count;
    });
    bucket.total = finite(entry?.total, total);
    return bucket;
  });
}

function finite(value, fallback) {
  const number = Number(value);
  return value !== undefined && value !== null && value !== '' && Number.isFinite(number) ? number : fallback;
}
