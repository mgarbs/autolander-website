import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import HelpTip from './HelpTip.jsx';

const STEPS = [
  { key: 'pageView', label: 'Page Views', color: '#60a5fa' },
  { key: 'viewContent', label: 'Engaged', color: '#7dd3fc' },
  { key: 'lead', label: 'Leads', color: '#34d399' },
  { key: 'initiateCheckout', label: 'Started Checkout', color: '#fbbf24' },
  { key: 'schedule', label: 'Legacy Demos', color: '#f97316' },
];

export default function FunnelChart({ funnel }) {
  const data = STEPS.map((step) => ({
    label: step.label,
    value: funnel?.[step.key] || 0,
    color: step.color,
  }));

  const max = data[0]?.value || 0;
  const applicationCount = data.find((row) => row.label === 'Leads')?.value || 0;
  const enriched = data.map((row, i) => ({
    ...row,
    conversionFromTop: max > 0 ? (row.value / max) * 100 : 0,
    conversionFromPrev: i === 0 || data[i - 1].value === 0 ? null : (row.value / data[i - 1].value) * 100,
  }));

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Conversion funnel</h3>
          <HelpTip text="This shows how many people make it from viewing the site to submitting a demo application. Big drops show where the page or offer may be losing people." />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {max > 0 ? `${((applicationCount / max) * 100).toFixed(2)}% page-to-application` : 'No traffic yet'}
        </p>
      </header>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={enriched} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <Tooltip
              contentStyle={{
                background: '#0c1118',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => Number(value).toLocaleString()}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {enriched.map((entry, index) => (
                <Cell key={`c-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                style={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 700 }}
                formatter={(value) => Number(value).toLocaleString()}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:grid-cols-5">
        {enriched.map((row) => (
          <div key={row.label} className="rounded-2xl border border-white/5 bg-black/30 p-3">
            <p className="truncate text-slate-300">{row.label}</p>
            <p className="mt-1 text-base font-black text-white">{row.value.toLocaleString()}</p>
            {row.conversionFromPrev !== null && (
              <p className="mt-1 text-[9px] text-slate-500">{row.conversionFromPrev.toFixed(1)}% from prior</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
