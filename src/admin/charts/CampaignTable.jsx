export default function CampaignTable({ rows, title = 'Campaigns', emptyMessage = 'No campaign data yet.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-sm text-slate-500">
        <h3 className="mb-2 text-sm font-black uppercase italic tracking-tight text-white">{title}</h3>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase italic tracking-tight text-white">{title}</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{rows.length} entries</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2 text-right">Spend</th>
              <th className="px-2 py-2 text-right">Impr</th>
              <th className="px-2 py-2 text-right">Clicks</th>
              <th className="px-2 py-2 text-right">Leads</th>
              <th className="px-2 py-2 text-right">Demos</th>
              <th className="px-2 py-2 text-right">CPL</th>
              <th className="px-2 py-2 text-right">Cost / Demo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name || row.ad_name || row.ad_id} className="border-t border-white/5">
                <td className="px-2 py-3">
                  <p className="font-bold text-white">{row.name || row.ad_name || row.ad_id || '—'}</p>
                  {row.campaign_name && row.ad_name && (
                    <p className="text-[10px] text-slate-500">{row.campaign_name}</p>
                  )}
                </td>
                <td className="px-2 py-3 text-right font-mono text-slate-300">{currency(row.spend)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-400">{number(row.impressions)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-400">{number(row.clicks)}</td>
                <td className="px-2 py-3 text-right font-mono text-emerald-300">{number(row.leads)}</td>
                <td className="px-2 py-3 text-right font-mono text-amber-300">{number(row.schedules)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-300">{maybeCurrency(row.cpl)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-300">{maybeCurrency(row.cps)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function number(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function currency(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maybeCurrency(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return currency(value);
}
