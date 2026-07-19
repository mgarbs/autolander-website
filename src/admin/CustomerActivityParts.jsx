import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Flag,
  MonitorDown,
  Search,
  Users,
} from 'lucide-react';
import { formatDate, formatRelative, healthColor, healthReasons, healthState } from './lib/analytics-format.js';

const PRESETS = [
  ['no_posts_7d', 'No posts 7d'],
  ['no_posts_14d', 'No posts 14d'],
  ['never_posted', 'Never posted'],
  ['failed_posts', 'Failed posts'],
  ['autopilot_on', 'AutoPilot on'],
  ['outdated_version', 'Outdated version'],
  ['follow_up', 'Follow-up'],
  ['red_health', 'Red health'],
];

export function KpiRow({ overview, onPreset }) {
  const seats = overview?.postingSeats || {};
  const tiles = [
    { label: 'Active subscribers', value: sumMetric(overview?.activeSubscribers), icon: Users },
    { label: 'Seats occupied / purchased', value: `${metric(seats.occupied)} / ${metric(seats.purchased)}`, icon: Users },
    { label: 'Posts today', value: metric(overview?.postsToday), icon: Activity },
    { label: 'Posts this week', value: metric(overview?.postsWeek), icon: CalendarDays },
    { label: 'Posts this month', value: metric(overview?.postsMonth), icon: CalendarDays },
    { label: 'No posts 7d', value: metric(overview?.noPosts7d), icon: AlertTriangle, preset: 'no_posts_7d' },
    { label: 'No posts 14d', value: metric(overview?.noPosts14d), icon: AlertTriangle, preset: 'no_posts_14d' },
    { label: 'Never posted', value: metric(overview?.neverPosted), icon: AlertTriangle, preset: 'never_posted' },
    { label: 'Failed posts 7d', value: metric(overview?.failedPosts7d), icon: AlertTriangle, preset: 'failed_posts' },
    { label: 'AutoPilot orgs', value: metric(overview?.autoPilotOrgs), icon: Bot, preset: 'autopilot_on' },
    { label: 'Outdated version', value: metric(overview?.outdatedVersionOrgs), icon: MonitorDown, preset: 'outdated_version' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        const content = (
          <>
            <span className="flex items-start justify-between gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{tile.label}</span>
              <Icon size={14} className={tile.preset ? 'text-blue-300' : 'text-slate-600'} />
            </span>
            <span className="mt-3 block text-xl font-black tracking-tight text-white">{tile.value}</span>
          </>
        );
        return tile.preset ? (
          <button
            key={tile.label}
            type="button"
            onClick={() => onPreset(tile.preset)}
            className="rounded-2xl border border-white/10 bg-black/35 p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/[0.06]"
            title={`Filter accounts: ${tile.label}`}
          >
            {content}
          </button>
        ) : (
          <div key={tile.label} className="rounded-2xl border border-white/10 bg-black/35 p-4">
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function FiltersBar({ search, filters, onSearch, onFilter, onPreset, onClear }) {
  const selectClass =
    'h-10 rounded-xl border border-white/10 bg-black/50 px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:border-blue-500/60';

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,auto)]">
        <label className="relative">
          <span className="sr-only">Search accounts</span>
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search account, slug, or org ID..."
            className="h-10 w-full rounded-xl border border-white/10 bg-black/50 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
          />
        </label>
        <select value={filters.plan} onChange={(event) => onFilter('plan', event.target.value)} className={selectClass}>
          <option value="">All plans</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
          <option value="free">Free</option>
        </select>
        <select value={filters.status} onChange={(event) => onFilter('status', event.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past due</option>
          <option value="canceled">Canceled</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <select value={filters.health} onChange={(event) => onFilter('health', event.target.value)} className={selectClass}>
          <option value="">All health</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
          <option value="gray">Gray</option>
        </select>
        <select value={filters.sort} onChange={(event) => onFilter('sort', event.target.value)} className={selectClass}>
          <option value="health">Health priority</option>
          <option value="last_active">Last active</option>
          <option value="posts_30d">Posts 30d</option>
          <option value="last_post">Last post</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onPreset(value)}
            className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition ${
              filters.preset === value
                ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                : 'border-white/10 bg-white/[0.03] text-slate-500 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-white/20 hover:text-white"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export function AccountsTable({ page, loading, error, expandedOrgId, onToggle, onPage, renderExpanded }) {
  const rows = page?.rows || [];
  const limit = Number(page?.limit) || 25;
  const offset = Number(page?.offset) || 0;
  const total = Number(page?.total) || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + rows.length, total);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-[1540px] w-full border-collapse text-left">
          <thead className="border-b border-white/10 bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-500">
            <tr>
              <Th>Account</Th><Th>Plan / status</Th><Th>Health</Th><Th>Seats</Th><Th>Posts 7 / 30</Th>
              <Th>Last post</Th><Th>Last active</Th><Th>Facebook</Th><Th>AutoPilot</Th><Th>Feed</Th>
              <Th>Version</Th><Th>Credits</Th><Th>Tickets</Th><Th>CS</Th><Th>Created</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && rows.length === 0 ? (
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index} className="animate-pulse">
                  <td colSpan="15" className="px-4 py-4"><div className="h-6 rounded-lg bg-white/[0.05]" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan="15" className="px-5 py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-600">No accounts match these filters.</td></tr>
            ) : (
              rows.map((row) => {
                const orgId = String(row.orgId || row.id || '');
                const expanded = expandedOrgId === orgId;
                const reasons = healthReasons(row);
                return (
                  <FragmentRow key={orgId || row.slug}>
                    <tr
                      tabIndex="0"
                      onClick={() => onToggle(row)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onToggle(row);
                        }
                      }}
                      className={`cursor-pointer text-xs text-slate-300 transition hover:bg-white/[0.04] ${expanded ? 'bg-blue-500/[0.05]' : ''}`}
                    >
                      <Td>
                        <span className="flex max-w-60 items-start gap-2">
                          {expanded ? <ChevronDown size={14} className="mt-0.5 shrink-0 text-blue-300" /> : <ChevronRight size={14} className="mt-0.5 shrink-0 text-slate-600" />}
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 truncate font-bold text-white">
                              {row.name || row.slug || orgId || 'Unnamed account'}
                              {row.followUp && <Flag size={12} className="shrink-0 fill-amber-400 text-amber-400" aria-label="Follow-up" />}
                            </span>
                            <span className="block truncate text-[9px] font-bold uppercase tracking-widest text-slate-600">{row.slug || orgId}</span>
                          </span>
                        </span>
                      </Td>
                      <Td><strong className="text-white">{row.plan || '—'}</strong><Small>{row.subStatus || 'No subscription'}</Small></Td>
                      <Td><HealthDot value={row.health} reasons={reasons} /></Td>
                      <Td>{metric(row.seats?.occupied ?? row.seatsOccupied)} / {metric(row.seats?.purchased ?? row.seatsPurchased)}</Td>
                      <Td><strong className="text-white">{metric(row.posts7d)}</strong> / {metric(row.posts30d)}</Td>
                      <Td>{formatRelative(row.lastPostAt)}</Td>
                      <Td>{formatRelative(row.lastActiveAt)}</Td>
                      <Td><StatePill active={row.fbConnected} yes="Connected" no="Disconnected" /></Td>
                      <Td><StatePill active={row.autoPilotOn} yes="On" no="Off" /></Td>
                      <Td><FeedState row={row} /></Td>
                      <Td><span className="font-mono text-[10px] text-slate-300">{row.appVersion || 'Unknown'}</span><Small>{row.versionSource || ''}</Small></Td>
                      <Td>{formatNumber(row.creditBalance)}</Td>
                      <Td>{metric(row.openTickets)}</Td>
                      <Td>{row.csOwner || 'Unassigned'}</Td>
                      <Td>{formatDate(row.createdAt)}</Td>
                    </tr>
                    {expanded && (
                      <tr className="bg-[#080808]"><td colSpan="15" className="p-0">{renderExpanded(row)}</td></tr>
                    )}
                  </FragmentRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
          {start}–{end} of {total} accounts {loading && rows.length > 0 ? '· refreshing' : ''}
        </span>
        <div className="flex gap-2">
          <PageButton disabled={offset <= 0 || loading} onClick={() => onPage(Math.max(0, offset - limit))}>Previous</PageButton>
          <PageButton disabled={offset + limit >= total || loading} onClick={() => onPage(offset + limit)}>Next</PageButton>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ children }) {
  return <>{children}</>;
}

function Th({ children }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children }) {
  return <td className="whitespace-nowrap px-4 py-3 align-top">{children}</td>;
}

function Small({ children }) {
  return children ? <span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-slate-600">{children}</span> : null;
}

function PageButton({ children, ...props }) {
  return <button type="button" {...props} className="rounded-lg border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">{children}</button>;
}

function HealthDot({ value, reasons }) {
  const state = healthState(value);
  return (
    <span className="group relative inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${healthColor(state)}`} />
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{state}</span>
      <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-64 whitespace-normal rounded-xl border border-white/10 bg-slate-950 p-3 text-[10px] font-medium leading-relaxed text-slate-300 shadow-2xl group-hover:block">
        {reasons.length > 0 ? reasons.join(' · ') : 'No health reasons reported.'}
      </span>
    </span>
  );
}

function StatePill({ active, yes, no }) {
  return <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/[0.04] text-slate-600'}`}>{active ? yes : no}</span>;
}

function FeedState({ row }) {
  const state = healthState(row.feedHealth);
  return <span><span className={`mr-2 inline-block h-2 w-2 rounded-full ${healthColor(state)}`} />{state}<Small>{formatRelative(row.lastSyncAt)}</Small></span>;
}

function metric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : '0';
}

function sumMetric(value) {
  if (value && typeof value === 'object') return metric(Object.values(value).reduce((sum, item) => sum + (Number(item) || 0), 0));
  return metric(value);
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';
}
