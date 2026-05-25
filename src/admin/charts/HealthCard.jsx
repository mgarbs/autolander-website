export default function HealthCard({ health }) {
  if (!health) return null;
  const rows = [
    {
      label: 'Pixel + CAPI deduplication',
      value: health.dedupedShare,
      threshold: 0.7,
      help: 'Higher is better — events should land on both browser and server with matching IDs.',
    },
    {
      label: 'Server-side share',
      value: health.serverShare,
      threshold: 0.4,
      help: 'How often the Conversions API received an event. Boosts ad performance on iOS / ad blockers.',
    },
    {
      label: 'fbclid capture rate',
      value: health.fbclidCaptureRate,
      threshold: 0.8,
      help: 'Of visitors that came via Meta, how many arrived with the fbclid query param.',
    },
  ];

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Tracking health</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {health.metaVisits ? `${health.metaVisits.toLocaleString()} Meta visits` : 'No Meta visits yet'}
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <Tile key={row.label} {...row} />
        ))}
      </div>
    </div>
  );
}

function Tile({ label, value, threshold, help }) {
  const display = value === null || value === undefined ? '—' : `${(value * 100).toFixed(0)}%`;
  const color =
    value === null || value === undefined
      ? 'text-slate-400'
      : value >= threshold
        ? 'text-emerald-400'
        : value >= threshold * 0.7
          ? 'text-amber-400'
          : 'text-red-400';
  const dot =
    value === null || value === undefined
      ? 'bg-slate-500'
      : value >= threshold
        ? 'bg-emerald-500'
        : value >= threshold * 0.7
          ? 'bg-amber-500'
          : 'bg-red-500';

  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      </div>
      <p className={`mt-3 text-2xl font-black tracking-tighter ${color}`}>{display}</p>
      <p className="mt-2 text-[10px] font-medium leading-snug text-slate-500">{help}</p>
    </div>
  );
}
