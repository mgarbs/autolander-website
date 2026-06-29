import HelpTip from './HelpTip.jsx';

const STATUS = {
  id_match: { label: 'ID match', color: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
  name_fallback: { label: 'Name fallback', color: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
  id_ready: { label: 'ID ready', color: 'border-blue-400/30 bg-blue-400/10 text-blue-200' },
  missing_ids: { label: 'Missing IDs', color: 'border-red-400/30 bg-red-400/10 text-red-200' },
};

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
              <HeaderCell label="Name" help="The campaign or ad name from Meta, plus useful IDs underneath when available." />
              <HeaderCell label="Join" help="How confidently the dashboard matched Meta spend to website conversions. ID match is best." />
              <HeaderCell label="Spend" align="right" help="How much Meta says this row spent." />
              <HeaderCell label="Impr" align="right" help="Impressions: how many times the ad was shown." />
              <HeaderCell label="Clicks" align="right" help="How many ad clicks Meta reported." />
              <HeaderCell label="CTR" align="right" help="Click-through rate. Higher means the creative is getting attention." />
              <HeaderCell label="Freq" align="right" help="Frequency: how many times the average person saw the ad. Too high can mean fatigue." />
              <HeaderCell label="Leads" align="right" help="Verified demo applications attributed to this row." />
              <HeaderCell label="Legacy Demos" align="right" help="Historical Schedule conversions attributed to this row." />
              <HeaderCell label="CPL" align="right" help="Cost per lead. Spend divided by leads." />
              <HeaderCell label="Legacy CPA" align="right" help="Spend divided by historical Schedule conversions." />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name || row.ad_name || row.ad_id || row.campaign_id} className="border-t border-white/5">
                <td className="min-w-64 px-2 py-3">
                  <p className="font-bold text-white">{row.name || row.ad_name || row.ad_id || '-'}</p>
                  <RowMeta row={row} />
                </td>
                <td className="px-2 py-3">
                  <StatusBadge status={row.attribution_status} />
                </td>
                <td className="px-2 py-3 text-right font-mono text-slate-300">{currency(row.spend)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-400">{number(row.impressions)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-400">{number(row.clicks)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-400">{percent(row.ctr, true)}</td>
                <td className="px-2 py-3 text-right font-mono text-slate-400">{decimal(row.frequency)}</td>
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

function HeaderCell({ label, help, align = 'left' }) {
  return (
    <th className={`px-2 py-2 ${align === 'right' ? 'text-right' : ''}`}>
      <span className={`inline-flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <HelpTip text={help} />
      </span>
    </th>
  );
}

function RowMeta({ row }) {
  const parts = [
    row.campaign_name && row.ad_name ? row.campaign_name : '',
    row.adset_name ? `adset: ${row.adset_name}` : '',
    row.campaign_id ? `cid:${row.campaign_id}` : '',
    row.adset_id ? `asid:${row.adset_id}` : '',
    row.ad_id ? `aid:${row.ad_id}` : '',
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="mt-1 max-w-xl text-[10px] leading-snug text-slate-500">{parts.join(' | ')}</p>;
}

function StatusBadge({ status }) {
  const item = STATUS[status] || STATUS.missing_ids;
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${item.color}`}>
      {item.label}
    </span>
  );
}

function number(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function decimal(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function percent(value, alreadyPercent = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  const next = alreadyPercent ? Number(value) : Number(value) * 100;
  return `${next.toFixed(2)}%`;
}

function currency(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maybeCurrency(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return currency(value);
}
