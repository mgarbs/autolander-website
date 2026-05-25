export default function KpiTile({ label, value, sublabel, delta, format = 'number' }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tighter text-white">
        {format === 'currency'
          ? formatCurrency(value)
          : format === 'percent'
            ? formatPercent(value)
            : formatNumber(value)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {typeof delta === 'number' && Number.isFinite(delta) && (
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            {delta > 0 ? '+' : ''}
            {(delta * 100).toFixed(0)}%
          </span>
        )}
        {sublabel && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}

function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatCurrency(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${(Number(value) * 100).toFixed(1)}%`;
}
