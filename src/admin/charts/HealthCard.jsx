import HelpTip from './HelpTip.jsx';

export default function HealthCard({ health }) {
  if (!health) return null;
  const rows = [
    {
      label: 'Pixel + CAPI deduplication',
      value: health.dedupedShare,
      threshold: 0.7,
      help: 'Higher is better. Browser Pixel and server CAPI should share the same event IDs.',
    },
    {
      label: 'Server-side share',
      value: health.serverShare,
      threshold: 0.4,
      help: 'How often the Conversions API received an event. Helps iOS and ad blocker coverage.',
    },
    {
      label: 'CAPI send success',
      value: health.capiSuccessRate,
      threshold: 0.95,
      help: 'Successful server sends to Meta after the Worker receives an event.',
    },
    {
      label: 'fbclid capture rate',
      value: health.fbclidCaptureRate,
      threshold: 0.8,
      help: 'Of visitors that came via Meta, how many arrived with the fbclid query param.',
    },
    {
      label: 'Campaign ID capture',
      value: health.campaignIdRate,
      threshold: 0.95,
      help: 'Meta visits carrying campaign_id or utm_id for stable spend joins.',
    },
    {
      label: 'Ad ID capture',
      value: health.adIdRate,
      threshold: 0.95,
      help: 'Meta visits carrying ad_id so ad-level tables do not depend on names.',
    },
    {
      label: 'Unresolved macros',
      value: health.unresolvedParamHits || 0,
      format: 'count',
      inverse: true,
      help: 'Visits where a parameter still looked like {{ad.name}} or __ad.name__.',
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <Tile key={row.label} {...row} />
        ))}
      </div>
    </div>
  );
}

function Tile({ label, value, threshold, help, format = 'percent', inverse = false }) {
  const missing = value === null || value === undefined;
  const display = missing ? '-' : format === 'count' ? Number(value).toLocaleString() : `${(value * 100).toFixed(0)}%`;
  const healthy = inverse ? Number(value) === 0 : value >= threshold;
  const caution = inverse ? Number(value) <= 3 : value >= threshold * 0.7;
  const color = missing
    ? 'text-slate-400'
    : healthy
      ? 'text-emerald-400'
      : caution
        ? 'text-amber-400'
        : 'text-red-400';
  const dot = missing
    ? 'bg-slate-500'
    : healthy
      ? 'bg-emerald-500'
      : caution
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <div className="flex items-center gap-2">
          <HelpTip text={help} />
          <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-black tracking-tighter ${color}`}>{display}</p>
      <p className="mt-2 text-[10px] font-medium leading-snug text-slate-500">{plainSummary(label)}</p>
    </div>
  );
}

function plainSummary(label) {
  const copy = {
    'Pixel + CAPI deduplication': 'Checks whether browser and server events are matching.',
    'Server-side share': 'Shows how much tracking is also reaching the server.',
    'CAPI send success': 'Shows whether the server can send events to Meta.',
    'fbclid capture rate': 'Shows if Meta click IDs are arriving.',
    'Campaign ID capture': 'Shows if campaign IDs are arriving.',
    'Ad ID capture': 'Shows if ad IDs are arriving.',
    'Unresolved macros': 'Should stay at zero.',
  };
  return copy[label] || '';
}
