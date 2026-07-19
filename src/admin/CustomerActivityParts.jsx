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
import { feedHealthState, formatRelative, healthColor, healthReasons, healthState } from './lib/analytics-format.js';
import VersionBadge from './VersionBadge.jsx';

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
    { label: 'No posts 7d', value: metric(overview?.noPosts7d), icon: AlertTriangle, preset: 'no_posts_7d', scope: 'active subs' },
    { label: 'No posts 14d', value: metric(overview?.noPosts14d), icon: AlertTriangle, preset: 'no_posts_14d', scope: 'active subs' },
    { label: 'Never posted', value: metric(overview?.neverPosted), icon: AlertTriangle, preset: 'never_posted', scope: 'active subs' },
    { label: 'Failed posts 7d', value: metric(overview?.failedPosts7d), icon: AlertTriangle, preset: 'failed_posts', scope: 'active subs' },
    { label: 'AutoPilot orgs', value: metric(overview?.autoPilotOrgs), icon: Bot, preset: 'autopilot_on', scope: 'active subs' },
    { label: 'Outdated version', value: metric(overview?.outdatedVersionOrgs), icon: MonitorDown, preset: 'outdated_version', scope: 'active subs' },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        const content = (
          <>
            <span className="flex items-start justify-between gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{tile.label}</span>
              <Icon size={14} className={tile.preset ? 'text-blue-300' : 'text-slate-600'} />
            </span>
            <span className="mt-3 block text-xl font-black tracking-tight text-white">{tile.value}</span>
            {tile.scope && <span className="mt-1 block text-[10px] uppercase tracking-widest text-slate-400">{tile.scope}</span>}
          </>
        );
        return tile.preset ? (
          <button
            key={tile.label}
            type="button"
            onClick={() => onPreset(tile.preset)}
            className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/[0.06]"
            title={`Filter accounts: ${tile.label}`}
          >
            {content}
          </button>
        ) : (
          <div key={tile.label} className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function FiltersBar({ search, filters, onSearch, onFilter, onPreset, onClear }) {
  const selectClass =
    'h-10 min-w-0 w-full max-w-full flex-1 basis-36 rounded-xl border border-white/10 bg-black/50 px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:border-blue-500/60 sm:max-w-48';

  return (
    <div className="min-w-0 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-[2_1_280px]">
          <span className="sr-only">Search accounts</span>
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search account, slug, or org ID..."
            className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-black/50 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
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

export function AccountsTable({
  page,
  latestDesktopVersion,
  loading,
  error,
  expandedOrgId,
  followUpPendingId,
  onToggle,
  onFollowUp,
  onPage,
  renderExpanded,
}) {
  const rows = page?.rows || [];
  const limit = Number(page?.limit) || 25;
  const offset = Number(page?.offset) || 0;
  const total = Number(page?.total) || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + rows.length, total);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/30">
      {error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-200">{error}</div>
      )}
      <div className="hidden grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)_minmax(0,1.15fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_2rem] gap-4 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 xl:grid">
        <span className="min-w-0 truncate">Account</span>
        <span className="min-w-0 truncate">Activity</span>
        <span className="min-w-0 truncate">Signals</span>
        <span className="min-w-0 truncate">Health</span>
        <span className="min-w-0 truncate">CS</span>
        <span className="sr-only">Expand</span>
      </div>
      <div className="divide-y divide-white/5">
        {loading && rows.length === 0 ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="animate-pulse px-4 py-4"><div className="h-12 rounded-lg bg-white/[0.05]" /></div>
          ))
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-600">No accounts match these filters.</div>
        ) : (
          rows.map((row) => {
            const orgId = String(row.orgId || row.id || '');
            const expanded = expandedOrgId === orgId;
            const reasons = healthReasons(row);
            const accountName = row.name || row.slug || orgId || 'Unnamed account';
            const hasLastActivity = row.lastActivityAt !== undefined && row.lastActivityAt !== null && row.lastActivityAt !== '';
            const activityTimestamp = hasLastActivity ? row.lastActivityAt : row.lastPostAt;
            const activityLabel = hasLastActivity ? 'Last activity' : 'Last post';
            return (
              <div key={orgId || row.slug} className={expanded ? 'bg-blue-500/[0.05]' : ''}>
                <div
                  role="button"
                  tabIndex="0"
                  aria-expanded={expanded}
                  onClick={() => onToggle(row)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onToggle(row);
                    }
                  }}
                  className="grid min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)_2rem] gap-x-3 gap-y-3 px-4 py-4 text-xs text-slate-300 transition hover:bg-white/[0.04] md:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_2rem] md:gap-x-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)_minmax(0,1.15fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_2rem] xl:items-center xl:gap-y-0"
                >
                  <div className="col-start-1 row-start-1 min-w-0 md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1">
                    <MobileLabel>Account</MobileLabel>
                    <p className="min-w-0 truncate font-medium text-white" title={accountName}>{accountName}</p>
                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                      <span className="min-w-0 truncate text-[9px] font-bold uppercase tracking-widest text-slate-600" title={row.slug || orgId}>{row.slug || orgId}</span>
                      <AccountChip>{row.plan || 'No plan'}</AccountChip>
                      <AccountChip>{row.subStatus || 'No status'}</AccountChip>
                    </div>
                  </div>

                  <div className="col-start-1 row-start-2 min-w-0 md:col-start-2 md:row-start-1 xl:col-start-2 xl:row-start-1">
                    <MobileLabel>Activity</MobileLabel>
                    <p className="min-w-0 truncate font-bold text-white" title={`${metric(row.posts7d)} posts in 7 days / ${metric(row.posts30d)} posts in 30 days`}>
                      {metric(row.posts7d)} <span className="text-slate-600">/</span> {metric(row.posts30d)}
                    </p>
                    <p className="mt-1 min-w-0 truncate text-[10px] text-slate-500" title={`${activityLabel} ${formatRelative(activityTimestamp)}`}>
                      {activityLabel} {formatRelative(activityTimestamp)}
                    </p>
                  </div>

                  <div className="col-start-1 row-start-3 min-w-0 md:col-start-3 md:row-start-1 xl:col-start-3 xl:row-start-1">
                    <MobileLabel>Signals</MobileLabel>
                    <Signals row={row} latestDesktopVersion={latestDesktopVersion} />
                  </div>

                  <div className="col-start-1 row-start-4 min-w-0 md:col-span-2 md:col-start-1 md:row-start-2 xl:col-span-1 xl:col-start-4 xl:row-start-1">
                    <MobileLabel>Health</MobileLabel>
                    <HealthSummary value={row.health} reasons={reasons} />
                  </div>

                  <div className="col-start-1 row-start-5 min-w-0 md:col-start-3 md:row-start-2 xl:col-start-5 xl:row-start-1">
                    <MobileLabel>CS</MobileLabel>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate" title={row.csOwner || 'Unassigned'}>{row.csOwner || 'Unassigned'}</span>
                      <FollowUpToggle
                        active={Boolean(row.followUp)}
                        disabled={followUpPendingId === orgId}
                        onClick={(event) => {
                          event.stopPropagation();
                          onFollowUp(row, !row.followUp);
                        }}
                      />
                    </div>
                  </div>

                  <span className="col-start-2 row-start-1 row-span-5 flex items-center justify-end self-stretch md:col-start-4 md:row-start-1 md:row-span-2 xl:col-start-6 xl:row-start-1 xl:row-span-1" aria-hidden="true">
                    {expanded ? <ChevronDown size={16} className="text-blue-300" /> : <ChevronRight size={16} className="text-slate-600" />}
                  </span>
                </div>
                {expanded && <div className="min-w-0 bg-[#080808]">{renderExpanded(row)}</div>}
              </div>
            );
          })
        )}
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

function MobileLabel({ children }) {
  return <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-600 xl:hidden">{children}</span>;
}

function AccountChip({ children }) {
  return <span className="max-w-24 shrink-0 truncate rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-500" title={String(children)}>{children}</span>;
}

function Signals({ row, latestDesktopVersion }) {
  const feedState = feedHealthState(row.feedHealth);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="inline-flex shrink-0 items-center gap-1.5" title={`Facebook session: ${row.fbConnected ? 'connected' : 'disconnected'}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${row.fbConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="sr-only">Facebook {row.fbConnected ? 'connected' : 'disconnected'}</span>
      </span>
      <span className={`inline-flex shrink-0 ${row.autoPilotOn ? 'text-emerald-300' : 'text-slate-600'}`} title={`AutoPilot: ${row.autoPilotOn ? 'on' : 'off'}`}>
        <Bot size={15} aria-hidden="true" />
        <span className="sr-only">AutoPilot {row.autoPilotOn ? 'on' : 'off'}</span>
      </span>
      <span className="inline-flex shrink-0 items-center" title={`Feed health: ${feedState}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${healthColor(healthState(feedState))}`} />
        <span className="sr-only">Feed health {feedState}</span>
      </span>
      <VersionBadge version={row.appVersion} latestVersion={latestDesktopVersion} className="max-w-24" />
    </div>
  );
}

function HealthSummary({ value, reasons }) {
  const state = healthState(value);
  const topReason = reasons[0] || 'No health reasons reported.';
  return (
    <span className="group relative flex min-w-0 items-center gap-2" title={reasons.length > 0 ? reasons.join(' · ') : 'No health reasons reported.'}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${healthColor(state)}`} />
      <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-400">{state}</span>
      <span className="min-w-0 truncate text-[10px] text-slate-500">{topReason}</span>
      <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-64 max-w-[min(16rem,calc(100vw-3rem))] whitespace-normal rounded-xl border border-white/10 bg-slate-950 p-3 text-[10px] font-medium leading-relaxed text-slate-300 shadow-2xl group-hover:block">
        {reasons.length > 0 ? reasons.join(' · ') : 'No health reasons reported.'}
      </span>
    </span>
  );
}

function FollowUpToggle({ active, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Add'} follow-up flag`}
      title={`${active ? 'Remove' : 'Add'} follow-up flag`}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-wait disabled:opacity-40 ${active ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-white/[0.03] text-slate-600 hover:text-slate-300'}`}
    >
      <Flag size={12} className={active ? 'fill-current' : ''} />
    </button>
  );
}

function PageButton({ children, ...props }) {
  return <button type="button" {...props} className="rounded-lg border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">{children}</button>;
}

function metric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : '0';
}

function sumMetric(value) {
  if (value && typeof value === 'object') return metric(Object.values(value).reduce((sum, item) => sum + (Number(item) || 0), 0));
  return metric(value);
}
