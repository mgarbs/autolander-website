import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import HelpTip from './HelpTip.jsx';

export default function TimeSeriesChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState message="No data in this range yet." />;
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Daily activity</h3>
          <HelpTip text="Page views show traffic volume. Leads and booked demos show whether that traffic is turning into action." />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Traffic, leads, demos
        </p>
      </header>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={shortDate}
              minTickGap={20}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: '#0c1118',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="pageView" name="Page Views" stroke="#60a5fa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#a78bfa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lead" name="Leads" stroke="#34d399" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="schedule"
              name="Booked Demos"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function shortDate(value) {
  if (!value) return '';
  return value.slice(5);
}

function EmptyState({ message }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-sm text-slate-500">{message}</div>
  );
}
