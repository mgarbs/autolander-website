import { useState } from 'react';
import {
  Bot,
  Check,
  ExternalLink,
  Flag,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Ticket,
  Users,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate, formatRelative, healthColor, healthState } from './lib/analytics-format.js';
import VersionBadge from './VersionBadge.jsx';

const UNKNOWN_SPLIT_LABEL = 'Unknown (pre-update)';
const UNKNOWN_SPLIT_TITLE = 'Posts recorded before source telemetry shipped (v3.60.0) or by older app versions — cannot be attributed to Manual vs AutoPilot.';

export default function AccountDetail({
  orgId,
  summary,
  latestDesktopVersion,
  detail,
  daily,
  tickets,
  days,
  chartLoading,
  refreshing,
  writePending,
  onDaysChange,
  onRefresh,
  onAddNote,
  onSaveCs,
}) {
  const org = detail?.org || detail?.organization || detail || {};
  const subscription = detail?.subscription || org.subscription || {};
  const users = array(detail?.users);
  const feeds = array(detail?.feeds);
  const notes = array(detail?.notes);
  const aiStudio = detail?.aiStudio || {};
  const csMeta = detail?.csMeta || {};
  const [owner, setOwner] = useState(csMeta.owner || '');
  const [followUp, setFollowUp] = useState(Boolean(csMeta.followUp));
  const [csMessage, setCsMessage] = useState('');

  async function submitCs(event) {
    event.preventDefault();
    setCsMessage('');
    try {
      await onSaveCs({ owner: owner.trim() || null, followUp });
      setCsMessage('Customer-success details saved.');
    } catch {
      setCsMessage('Could not save customer-success details.');
    }
  }

  const accountName = org.name || org.orgName || org.slug || summary?.name || summary?.slug || orgId;
  const ticketRows = tickets?.rows?.length ? tickets.rows : array(detail?.tickets);
  const occupiedSeats = summary?.seats?.occupied
    ?? summary?.seatsOccupied
    ?? users.filter((user) => user.canPostMarketplace && !user.deactivatedAt).length;
  const purchasedSeats = summary?.seats?.purchased
    ?? summary?.seatsPurchased
    ?? subscription.seatCount
    ?? sumDefined(subscription.seatsStarter, subscription.seatsGrowth, subscription.seatsPro);
  const creditBalance = detail?.creditBalance ?? org.creditBalance ?? summary?.creditBalance;
  const periodEnd = subscription.currentPeriodEnd ?? summary?.currentPeriodEnd;
  const createdAt = org.createdAt ?? summary?.createdAt;
  const openTickets = summary?.openTickets ?? tickets?.total ?? ticketRows.length;
  const appVersion = summary?.appVersion || 'Unknown';
  const versionSummary = summary?.versionSource ? `${appVersion} · ${summary.versionSource}` : appVersion;

  return (
    <div className="min-w-0 space-y-5 border-t border-blue-500/20 p-4 md:p-5">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-lg font-black uppercase italic tracking-tight text-white">{accountName}</h3>
            <span className="max-w-full truncate rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500" title={`${subscription.plan || org.plan || summary?.plan || 'No plan'} · ${subscription.status || org.subStatus || summary?.subStatus || 'No status'}`}>
              {subscription.plan || org.plan || summary?.plan || 'No plan'} · {subscription.status || org.subStatus || summary?.subStatus || 'No status'}
            </span>
          </div>
          <p className="mt-1 min-w-0 truncate font-mono text-[10px] text-slate-600" title={orgId}>{orgId}</p>
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
            <SummaryFact label="Seats" value={`${optionalNumber(occupiedSeats)} / ${optionalNumber(purchasedSeats)}`} />
            <SummaryFact label="Credits" value={optionalNumber(creditBalance)} />
            <SummaryFact label="Last active" value={formatRelative(summary?.lastActiveAt)} />
            <SummaryFact label="Period end" value={formatDate(periodEnd)} />
            <SummaryFact label="Created" value={formatDate(createdAt)} />
            <SummaryFact label="Open tickets" value={optionalNumber(openTickets)} />
            <SummaryFact label="Last feed sync" value={formatRelative(summary?.lastSyncAt)} />
            <SummaryFact
              label="App version"
              title={versionSummary}
              value={(
                <span className="flex min-w-0 items-center gap-1.5">
                  <VersionBadge version={summary?.appVersion} latestVersion={latestDesktopVersion} />
                  {summary?.versionSource && <span className="min-w-0 truncate text-slate-500">{summary.versionSource}</span>}
                </span>
              )}
            />
            <SummaryFact label="AI Studio" value={truthy(aiStudio.active ?? aiStudio.enabled) ? 'Active' : 'Off'} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end xl:justify-end">
          <form onSubmit={submitCs} className="flex min-w-0 flex-wrap items-end gap-2">
            <label className="min-w-0 space-y-1">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-600">CS owner</span>
              <input
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="Unassigned"
                maxLength="120"
                className="h-9 w-44 max-w-full rounded-xl border border-white/10 bg-black/50 px-3 text-xs text-white outline-none focus:border-blue-500/60"
              />
            </label>
            <label className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <input type="checkbox" checked={followUp} onChange={(event) => setFollowUp(event.target.checked)} className="accent-amber-500" />
              <Flag size={12} className={followUp ? 'fill-amber-400 text-amber-400' : ''} /> Follow-up
            </label>
            <button type="submit" disabled={writePending} className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:opacity-50">
              {writePending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </button>
          </form>
          <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-50">
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh detail
          </button>
        </div>
      </div>
      {csMessage && <p className={`text-[10px] font-bold ${csMessage.startsWith('Could') ? 'text-red-300' : 'text-emerald-300'}`}>{csMessage}</p>}

      <section className="min-w-0 space-y-3">
        <SectionTitle icon={Users}>Users and posting activity</SectionTitle>
        <div className="min-w-0 divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/35">
          {users.length === 0 ? (
            <div className="px-4 py-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">No users returned.</div>
          ) : users.map((user) => {
            const presence = user.presence || {};
            const pilot = user.autoPilot || {};
            const userKey = user.id || user.username || user.email || user.displayName;
            const userName = user.displayName || user.username || user.email || 'Unnamed user';
            const seat = user.canPostMarketplace && !user.deactivatedAt ? user.seatPlan || 'Posting' : 'No posting seat';
            return (
              <article key={userKey} className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(145px,1fr))] gap-x-4 gap-y-3 px-4 py-4 text-[10px] text-slate-300">
                <UserFact label="User">
                  <strong className="block min-w-0 truncate text-white" title={userName}>{userName}</strong>
                  <Sub title={user.username && user.displayName ? user.username : ''}>{user.username && user.displayName ? user.username : ''}</Sub>
                </UserFact>
                <UserFact label="Access">
                  <span className="block min-w-0 truncate" title={user.role || 'No role'}>{user.role || '—'}</span>
                  <Sub title={seat}>{seat}</Sub>
                </UserFact>
                <UserFact label="Activity">
                  <strong className="text-white">{number(user.postsToday)}</strong> / {number(user.posts7d)} / {number(user.posts30d)}
                  <Sub title={`Last post ${formatRelative(user.lastPostAt)}`}>Last post {formatRelative(user.lastPostAt)}</Sub>
                </UserFact>
                <UserFact label="Presence / Facebook">
                  <Presence presence={presence} />
                  <Sub title={`Heartbeat ${formatRelative(presence.lastHeartbeat)}`}>Heartbeat {formatRelative(presence.lastHeartbeat)}</Sub>
                  <p className={`mt-1 min-w-0 truncate ${presence.fbSessionValid ? 'text-emerald-300' : 'text-red-300'}`} title={presence.fbSessionExpiry ? `Facebook session expires ${formatDate(presence.fbSessionExpiry)}` : 'Facebook session expiry unknown'}>
                    FB {presence.fbSessionValid ? 'valid' : 'invalid'}{presence.fbSessionExpiry ? ` · ${formatDate(presence.fbSessionExpiry)}` : ''}
                  </p>
                </UserFact>
                <UserFact label="AutoPilot">
                  <span className={pilot.enabled ? 'text-emerald-300' : 'text-slate-600'}>{pilot.enabled ? 'On' : 'Off'}</span>
                  <Sub title={pilot.enabled ? pilotSummary(pilot) : ''}>{pilot.enabled ? pilotSummary(pilot) : ''}</Sub>
                </UserFact>
                <UserFact label="Version">
                  <VersionBadge version={presence.appVersion} latestVersion={latestDesktopVersion} />
                  <Sub title={user.lastLoginProxy ? `Login ${formatRelative(user.lastLoginProxy)}` : ''}>{user.lastLoginProxy ? `Login ${formatRelative(user.lastLoginProxy)}` : ''}</Sub>
                </UserFact>
              </article>
            );
          })}
        </div>
      </section>

      <section className="min-w-0 space-y-3">
        <SectionTitle icon={Bot}>Marketplace feeds</SectionTitle>
        {feeds.length === 0 ? (
          <Empty>No feeds returned.</Empty>
        ) : (
          <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
            {feeds.map((feed, index) => {
              const state = healthState(feed.healthState || feed.health);
              const feedName = feed.name || feed.label || `Feed ${index + 1}`;
              return (
                <div key={feed.id || feed.feedId || index} className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="min-w-0 truncate font-bold text-white" title={feedName}>{feedName}</p>
                      <p className="mt-1 min-w-0 truncate text-[9px] font-black uppercase tracking-widest text-slate-600">{number(feed.count ?? feed.vehicleCount ?? feed.listingCount)} vehicles</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400"><span className={`h-2 w-2 rounded-full ${healthColor(state)}`} />{state}</span>
                  </div>
                  <p className="mt-3 min-w-0 truncate text-[10px] text-slate-500" title={`Last sync: ${formatRelative(feed.lastSyncAt)}`}>Last sync: {formatRelative(feed.lastSyncAt)}</p>
                  {feed.lastSyncError && <p className="mt-2 break-words rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-[10px] text-red-200">{feed.lastSyncError}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <section className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={Bot}>Daily posting mix</SectionTitle>
            <div className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
              {[7, 30, 90].map((value) => (
                <button key={value} type="button" onClick={() => onDaysChange(value)} className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${days === value ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>{value}d</button>
              ))}
            </div>
          </div>
          <div className="relative h-72 min-w-0">
            {chartLoading && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50"><Loader2 size={20} className="animate-spin text-blue-300" /></div>}
            {daily.length === 0 && !chartLoading ? (
              <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600">No daily posting data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={daily} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={shortDate} stroke="#475569" tick={{ fontSize: 9 }} minTickGap={20} />
                  <YAxis stroke="#475569" tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip formatter={formatChartTooltip} contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, fontSize: 11 }} />
                  <Legend formatter={formatChartLegend} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="manual" name="Manual" stackId="posts" fill="#3b82f6" radius={[0, 0, 2, 2]} />
                  <Bar dataKey="autopilot" name="AutoPilot" stackId="posts" fill="#10b981" />
                  <Bar dataKey="unknownSplit" name={UNKNOWN_SPLIT_LABEL} stackId="posts" fill="#64748b" radius={[2, 2, 0, 0]} />
                  <Line dataKey="failed" name="Failed" type="monotone" stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
            <SectionTitle icon={Ticket}>Support tickets</SectionTitle>
            {tickets?.sheetUrl && <a href={tickets.sheetUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex shrink-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-300 hover:text-blue-200">Open Sheet <ExternalLink size={11} /></a>}
          </div>
          {ticketRows.length === 0 ? <Empty>No recent tickets.</Empty> : (
            <div className="min-w-0 space-y-2">
              {ticketRows.slice(0, 10).map((ticket, index) => (
                <div key={ticket.id || ticket.ref || index} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                  <div className="flex min-w-0 items-center justify-between gap-3"><strong className="min-w-0 truncate text-xs text-white" title={ticket.ref || ticket.reference || ticket.ticketRef || 'Ticket'}>{ticket.ref || ticket.reference || ticket.ticketRef || 'Ticket'}</strong><span className={`shrink-0 text-[9px] font-black uppercase tracking-widest ${severityColor(ticket.severity)}`}>{ticket.severity || 'normal'}</span></div>
                  <div className="mt-1 flex min-w-0 justify-between gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-600"><span className="min-w-0 truncate">{ticket.status || 'Unknown'}</span><span className="shrink-0">{formatDate(ticket.createdAt || ticket.date)}</span></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <NotesPanel notes={notes} pending={writePending} onAdd={onAddNote} />
    </div>
  );
}

function formatChartLegend(value) {
  return value === UNKNOWN_SPLIT_LABEL ? <span title={UNKNOWN_SPLIT_TITLE}>{value}</span> : value;
}

function formatChartTooltip(value, name) {
  return name === UNKNOWN_SPLIT_LABEL
    ? [<span title={UNKNOWN_SPLIT_TITLE}>{name}: {value}</span>, null]
    : [value, name];
}

function SummaryFact({ label, value, title }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">
      <span className="block text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</span>
      <strong className="mt-1 block min-w-0 truncate text-[10px] text-slate-200" title={title || String(value)}>{value}</strong>
    </div>
  );
}

function UserFact({ label, children }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</span>
      {children}
    </div>
  );
}

function NotesPanel({ notes, pending, onAdd }) {
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setMessage('');
    try {
      await onAdd({ body: body.trim(), author: author.trim() || 'Admin' });
      setBody('');
      setMessage('Note added.');
    } catch {
      setMessage('Could not add note.');
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
      <SectionTitle icon={MessageSquarePlus}>Customer-success notes</SectionTitle>
      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,1fr)]">
        <div className="min-w-0 max-h-72 space-y-2 overflow-y-auto pr-1">
          {notes.length === 0 ? <Empty>No notes yet.</Empty> : notes.map((note, index) => (
            <article key={note.id || index} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
              <div className="flex min-w-0 items-center justify-between gap-3"><strong className="min-w-0 truncate text-[10px] uppercase tracking-widest text-blue-200">{note.author || 'Admin'}</strong><time className="shrink-0 text-[9px] text-slate-600">{formatDate(note.createdAt, true)}</time></div>
              <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">{note.body}</p>
            </article>
          ))}
        </div>
        <form onSubmit={submit} className="min-w-0 space-y-3">
          <input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength="120" placeholder="Your name" className="h-9 w-full min-w-0 rounded-xl border border-white/10 bg-black/50 px-3 text-xs text-white outline-none focus:border-blue-500/60" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength="4000" rows="5" placeholder="Add context, a promise, or the next follow-up step..." className="w-full min-w-0 resize-y rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white outline-none focus:border-blue-500/60" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[9px] font-bold text-slate-600">{body.length.toLocaleString()} / 4,000</span>
            <button type="submit" disabled={pending || !body.trim()} className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:opacity-40">{pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Add note</button>
          </div>
          {message && <p className={`text-[10px] font-bold ${message.startsWith('Could') ? 'text-red-300' : 'text-emerald-300'}`}>{message}</p>}
        </form>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return <h4 className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Icon size={14} className="shrink-0 text-blue-300" /><span className="min-w-0 truncate">{children}</span></h4>;
}

function Sub({ children, title }) {
  return children ? <span className="mt-1 block min-w-0 truncate text-[9px] font-bold uppercase tracking-widest text-slate-600" title={title}>{children}</span> : null;
}

function Empty({ children }) {
  return <div className="min-w-0 rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[9px] font-bold uppercase tracking-widest text-slate-600">{children}</div>;
}

function Presence({ presence }) {
  const status = String(presence.status || (presence.lastHeartbeat ? 'offline' : 'unknown')).toLowerCase();
  const live = status === 'online' || status === 'connected' || status === 'active';
  const away = status === 'away' || status === 'idle';
  return <span className="inline-flex min-w-0 items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${live ? 'bg-emerald-400' : away ? 'bg-amber-400' : 'bg-slate-500'}`} /><span className="min-w-0 truncate">{status}</span></span>;
}

function pilotSummary(pilot) {
  const hours = pilot.hours;
  let hoursLabel = '';
  if (Array.isArray(hours)) hoursLabel = hours.join(', ');
  else if (hours && typeof hours === 'object') hoursLabel = Object.entries(hours).map(([day, value]) => `${day} ${value}`).join(', ');
  else if (hours !== undefined && hours !== null) hoursLabel = String(hours);
  const feeds = array(pilot.feedIds);
  return [hoursLabel && `Hours ${hoursLabel}`, feeds.length ? `${feeds.length} feed${feeds.length === 1 ? '' : 's'}` : 'All feeds'].filter(Boolean).join(' · ');
}

function severityColor(value) {
  const severity = String(value || '').toLowerCase();
  if (severity === 'critical' || severity === 'high') return 'text-red-300';
  if (severity === 'medium') return 'text-amber-300';
  return 'text-slate-500';
}

function shortDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : `${date.getMonth() + 1}/${date.getDate()}`;
}

function sumDefined(...values) {
  const present = values.filter((value) => value !== undefined && value !== null && value !== '');
  return present.length ? present.reduce((sum, value) => sum + (Number(value) || 0), 0) : undefined;
}

function array(value) { return Array.isArray(value) ? value : []; }
function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed.toLocaleString() : '0'; }
function optionalNumber(value) { const parsed = Number(value); return value !== undefined && value !== null && value !== '' && Number.isFinite(parsed) ? parsed.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'; }
function truthy(value) { return value === true || value === 'true' || value === 1; }
