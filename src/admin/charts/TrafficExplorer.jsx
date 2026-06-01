import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import HelpTip from './HelpTip.jsx';

const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#f472b6', '#22d3ee', '#fb7185', '#84cc16'];

export default function TrafficExplorer({ breakdowns, totals, recentEvents }) {
  const hourRows = Array.isArray(breakdowns?.hour) ? breakdowns.hour : [];
  const weekdayRows = Array.isArray(breakdowns?.weekday) ? breakdowns.weekday : [];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Traffic Explorer</h2>
            <HelpTip text="This section explains who is coming to the site, where they came from, whether they came back, and when they tend to act." />
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            People, source, device, geography, and time patterns
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric
          label="Unique Visitors"
          value={totals?.uniqueVisitors}
          help="A daily privacy-safe count of different visitor cookies. This is closer to people than page views are."
        />
        <MiniMetric
          label="Unique Sessions"
          value={totals?.uniqueSessions}
          help="Different browser sessions seen in the range. One person can create more than one session."
        />
        <MiniMetric
          label="Returning Visitors"
          value={totals?.returningVisitors}
          help="Page views from visitors who were already known. Returning visitors usually mean warmer intent."
        />
        <MiniMetric
          label="New Visitors"
          value={totals?.newVisitors}
          help="Page views from visitors the tracker had not seen before."
        />
        <MiniMetric
          label="Repeat Networks"
          value={valueFor(breakdowns?.network, 'repeat_network')}
          help="Repeat activity from the same privacy-safe network/IP fingerprint. Raw IP addresses are not shown."
        />
        <MiniMetric
          label="Engaged Visits"
          value={totals?.engagedVisits}
          help="Visitors who stayed at least 15 seconds on a page. This helps separate real attention from quick bounces."
        />
        <MiniMetric
          label="Deep Scrolls"
          value={totals?.deepScrolls}
          help="Visitors who reached about 90% page depth. This suggests they consumed most of the page."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DonutPanel
          title="Where They Came From"
          rows={breakdowns?.trafficCategory}
          help="Plain-English source categories based on UTMs, fbclid, and referrer. This is the top-level acquisition view."
          empty="No traffic source data yet."
        />
        <DonutPanel
          title="Device Mix"
          rows={breakdowns?.device}
          help="Device category: mobile, desktop, or tablet. This tells you how people experience the page."
          empty="No device data yet."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TimeOfDayChart rows={hourRows} />
        <BreakdownPanel
          title="Day of Week"
          rows={weekdayRows}
          help="Which days bring traffic. Useful for spotting when people research and when they book."
          empty="No weekday data yet."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BreakdownPanel
          title="Visitor Intent"
          rows={breakdowns?.intent}
          help="A simple category for what the visit looked like: research, pricing, checkout/trial, lead, or demo."
          empty="No intent data yet."
        />
        <BreakdownPanel
          title="Traffic Type"
          rows={breakdowns?.trafficCategory}
          help="The broader source bucket: paid Meta, organic search, referral, direct, or another UTM source."
          empty="No traffic category data yet."
        />
        <BreakdownPanel
          title="Referrer Domains"
          rows={breakdowns?.referrerDomain}
          help="The external site that sent people here when a referrer is available."
          empty="No referrer data yet."
        />
        <BreakdownPanel
          title="Meta Source"
          rows={breakdowns?.siteSource}
          help="Where Meta says the visitor came from, such as Facebook, Instagram, Messenger, or Audience Network."
          empty="No Meta source data yet."
        />
        <BreakdownPanel
          title="Placement"
          rows={breakdowns?.placement}
          help="The ad surface that sent the visit, such as Feed, Reels, or Stories."
          empty="No placement data yet."
        />
        <BreakdownPanel
          title="Landing Pages"
          rows={breakdowns?.landingPage}
          help="The first page people landed on. Useful for seeing which offers or routes start the visit."
          empty="No landing page data yet."
        />
        <BreakdownPanel
          title="Pages Viewed"
          rows={breakdowns?.pagePath}
          help="Pages viewed during visits. Good for seeing what people actually inspect."
          empty="No page view breakdown yet."
        />
        <BreakdownPanel
          title="Browser"
          rows={breakdowns?.browser}
          help="The browser or in-app browser detected from the request. Useful for debugging UX issues."
          empty="No browser data yet."
        />
        <BreakdownPanel
          title="Operating System"
          rows={breakdowns?.os}
          help="The visitor's operating system, like iOS, Android, Windows, or macOS."
          empty="No OS data yet."
        />
        <BreakdownPanel
          title="Viewport"
          rows={breakdowns?.viewport}
          help="Screen-width bucket. More useful than raw pixel sizes for design decisions."
          empty="No viewport data yet."
        />
        <BreakdownPanel
          title="Connection"
          rows={breakdowns?.connection}
          help="Browser-reported network type when available, such as 4g or 3g."
          empty="No connection data yet."
        />
        <BreakdownPanel
          title="Language"
          rows={breakdowns?.language}
          help="Browser language. Useful for spotting unexpected markets or bot-like traffic."
          empty="No language data yet."
        />
        <BreakdownPanel
          title="Timezone"
          rows={breakdowns?.timezone}
          help="Visitor browser timezone. This can be more useful than country for timing follow-ups."
          empty="No timezone data yet."
        />
        <BreakdownPanel
          title="Network/IP Signal"
          rows={breakdowns?.network}
          help="Privacy-safe IP/network buckets. Use this to see if the same office or household keeps coming back. Raw IPs are not displayed."
          empty="No network signal yet."
        />
        <BreakdownPanel
          title="Network Org"
          rows={breakdowns?.networkOrg}
          help="Cloudflare's network/ISP organization when available. Helpful for spotting business networks without showing raw IPs."
          empty="No network organization data yet."
        />
        <BreakdownPanel
          title="Countries"
          rows={breakdowns?.country}
          help="Country from the edge network. Good for spotting off-market traffic or bot-like traffic."
          empty="No country data yet."
        />
        <BreakdownPanel
          title="Regions"
          rows={breakdowns?.region}
          help="State or region from the edge network when available. This helps you see where demand is clustering."
          empty="No region data yet."
        />
        <BreakdownPanel
          title="Scroll Depth"
          rows={breakdowns?.scrollDepth}
          help="How far people scrolled. 90% is a strong sign that they actually read most of the page."
          empty="No scroll depth data yet."
        />
      </div>

      <RecentVisitorStream events={recentEvents} />
    </section>
  );
}

function DonutPanel({ title, rows, help, empty }) {
  const safeRows = Array.isArray(rows) ? rows.filter((row) => row.value > 0).slice(0, 8) : [];
  const total = safeRows.reduce((acc, row) => acc + row.value, 0);
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase italic tracking-tight text-white">{title}</h3>
          <HelpTip text={help} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {total ? `${total.toLocaleString()} visits` : 'Waiting'}
        </p>
      </header>
      {safeRows.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={safeRows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2}>
                  {safeRows.map((row, index) => (
                    <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{
                    background: '#0c1118',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [Number(value).toLocaleString(), labelize(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {safeRows.map((row, index) => (
              <div key={row.name} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <p className="truncate text-xs font-bold text-slate-200">{labelize(row.name)}</p>
                </div>
                <p className="font-mono text-[10px] text-slate-500">
                  {row.value.toLocaleString()} / {(row.share * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeOfDayChart({ rows }) {
  const hasRows = rows.some((row) => row.pageViews || row.leads || row.schedules);
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Time of Day</h3>
          <HelpTip text="Shows the visitor's local hour when possible. Use this to find when people browse, become leads, and book demos." />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Local visitor time</p>
      </header>
      {!hasRows ? (
        <p className="text-sm text-slate-500">No hourly traffic data yet.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <ChartTooltip
                contentStyle={{
                  background: '#0c1118',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
              <Bar dataKey="pageViews" name="Page views" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="Leads" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="schedules" name="Demos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function BreakdownPanel({ title, rows, help, empty }) {
  const safeRows = Array.isArray(rows) ? rows.filter((row) => row.value > 0) : [];
  const hasRows = safeRows.length > 0;
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-black uppercase italic tracking-tight text-white">{title}</h3>
          <HelpTip text={help} />
        </div>
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {hasRows ? `${safeRows.length} values` : 'Waiting'}
        </p>
      </header>
      {!hasRows ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="space-y-3">
          {safeRows.map((row) => (
            <div key={row.name}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="truncate text-xs font-bold text-slate-200">{labelize(row.name)}</p>
                <p className="font-mono text-[10px] text-slate-500">
                  {row.value.toLocaleString()} / {(row.share * 100).toFixed(0)}%
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.max(4, row.share * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value, help }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <HelpTip text={help} />
      </div>
      <p className="mt-3 text-3xl font-black tracking-tighter text-white">{formatNumber(value)}</p>
    </div>
  );
}

function RecentVisitorStream({ events }) {
  const rows = Array.isArray(events) ? events.slice(0, 12) : [];
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Recent Visitor Signals</h3>
          <HelpTip text="A recent stream of events with useful context. This is not a full person dossier; it is a privacy-safe view of what the tracker saw." />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {rows.length ? `${rows.length} recent` : 'Waiting'}
        </p>
      </header>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No recent visitor events yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-2 py-2">When</th>
                <th className="px-2 py-2">Event</th>
                <th className="px-2 py-2">Source</th>
                <th className="px-2 py-2">Device</th>
                <th className="px-2 py-2">Location</th>
                <th className="px-2 py-2">Page</th>
                <th className="px-2 py-2">Campaign / Ad</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.eventId || `${row.at}-${row.event}`} className="border-t border-white/5">
                  <td className="whitespace-nowrap px-2 py-3 font-mono text-xs text-slate-400">{shortTime(row.at)}</td>
                  <td className="px-2 py-3 font-bold text-white">{row.event || '-'}</td>
                  <td className="px-2 py-3 text-slate-300">
                    <p>{labelize(row.traffic_category || row.utm_source || row.site_source_name || 'direct')}</p>
                    {row.referrer_domain && <p className="text-[10px] text-slate-500">{row.referrer_domain}</p>}
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    <p>{labelize(row.device || '-')}</p>
                    <p className="text-[10px] text-slate-500">{[row.browser, row.os].filter(Boolean).join(' / ')}</p>
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    <p>{[row.region, row.country].filter(Boolean).join(', ') || '-'}</p>
                    {row.network_org && <p className="max-w-48 truncate text-[10px] text-slate-500">{row.network_org}</p>}
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    <p className="max-w-56 truncate">{row.current_path || row.landing_path || '-'}</p>
                    {row.intent && <p className="text-[10px] text-slate-500">{labelize(row.intent)}</p>}
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    <p className="max-w-56 truncate">{row.utm_campaign || '-'}</p>
                    <p className="max-w-56 truncate text-[10px] text-slate-500">{row.utm_content || row.ad_id || ''}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function valueFor(rows, name) {
  const row = Array.isArray(rows) ? rows.find((entry) => entry.name === name) : null;
  return row?.value || 0;
}

function labelize(value) {
  if (!value) return '-';
  const labels = {
    fb: 'Facebook',
    ig: 'Instagram',
    msg: 'Messenger',
    an: 'Audience Network',
    new: 'New visitors',
    returning: 'Returning visitors',
    new_network: 'New networks',
    repeat_network: 'Repeat networks',
    paid_meta: 'Paid Meta',
    paid_other: 'Other paid',
    organic_search: 'Organic search',
    organic_social: 'Organic social',
    direct: 'Direct / unknown',
    referral: 'Referral',
    research: 'Research',
    pricing_research: 'Pricing research',
    trial_or_checkout: 'Trial or checkout',
    booked_demo: 'Booked demo',
    lead: 'Lead',
    converted: 'Converted',
    small_mobile: 'Small mobile',
    large_desktop: 'Large desktop',
    no_touch: 'No touch',
  };
  if (labels[value]) return labels[value];
  if (/^[a-z]{2}$/i.test(value)) return value.toUpperCase();
  if (/^[a-z]{2}:/i.test(value)) {
    const [country, region] = String(value).split(':');
    return `${country.toUpperCase()} / ${region.replace(/_/g, ' ')}`;
  }
  return String(value).replace(/_/g, ' ').replace(/:/g, ' / ');
}

function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function shortTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
