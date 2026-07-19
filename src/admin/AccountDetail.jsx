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

export default function AccountDetail({
  orgId,
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

  const accountName = org.name || org.orgName || org.slug || orgId;
  const ticketRows = tickets?.rows?.length ? tickets.rows : array(detail?.tickets);

  return (
    <div className="space-y-5 border-t border-blue-500/20 p-4 md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black uppercase italic tracking-tight text-white">{accountName}</h3>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
              {subscription.plan || org.plan || 'No plan'} · {subscription.status || org.subStatus || 'No status'}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-slate-600">{orgId}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Credits <strong className="text-white">{number(detail?.creditBalance)}</strong></span>
            <span>AI Studio <strong className="text-white">{truthy(aiStudio.active ?? aiStudio.enabled) ? 'Active' : 'Off'}</strong></span>
            <span>Period end <strong className="text-white">{formatDate(subscription.currentPeriodEnd)}</strong></span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <form onSubmit={submitCs} className="flex flex-wrap items-end gap-2">
            <label className="space-y-1">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-600">CS owner</span>
              <input
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="Unassigned"
                maxLength="120"
                className="h-9 w-44 rounded-xl border border-white/10 bg-black/50 px-3 text-xs text-white outline-none focus:border-blue-500/60"
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

      <section className="space-y-3">
        <SectionTitle icon={Users}>Users and posting activity</SectionTitle>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/35">
          <table className="min-w-[1120px] w-full text-left text-[10px] text-slate-300">
            <thead className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-600">
              <tr><Th>User</Th><Th>Role</Th><Th>Seat</Th><Th>Posts today / 7 / 30</Th><Th>Last post</Th><Th>Presence</Th><Th>Facebook session</Th><Th>AutoPilot</Th><Th>Version</Th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-8 text-center font-bold uppercase tracking-widest text-slate-600">No users returned.</td></tr>
              ) : users.map((user) => {
                const presence = user.presence || {};
                const pilot = user.autoPilot || {};
                const userKey = user.id || user.username || user.email || user.displayName;
                return (
                  <tr key={userKey}>
                    <Td><strong className="text-white">{user.displayName || user.username || user.email || 'Unnamed user'}</strong><Sub>{user.username && user.displayName ? user.username : ''}</Sub></Td>
                    <Td>{user.role || '—'}</Td>
                    <Td>{user.canPostMarketplace && !user.deactivatedAt ? user.seatPlan || 'Posting' : 'No posting seat'}</Td>
                    <Td><strong className="text-white">{number(user.postsToday)}</strong> / {number(user.posts7d)} / {number(user.posts30d)}</Td>
                    <Td>{formatRelative(user.lastPostAt)}</Td>
                    <Td><Presence presence={presence} /><Sub>{formatRelative(presence.lastHeartbeat)}</Sub></Td>
                    <Td>{presence.fbSessionValid ? <span className="text-emerald-300">Valid</span> : <span className="text-red-300">Invalid</span>}<Sub>{presence.fbSessionExpiry ? `Expires ${formatDate(presence.fbSessionExpiry)}` : ''}</Sub></Td>
                    <Td>{pilot.enabled ? <span className="text-emerald-300">On</span> : <span className="text-slate-600">Off</span>}<Sub>{pilot.enabled ? pilotSummary(pilot) : ''}</Sub></Td>
                    <Td><span className="font-mono">{presence.appVersion || 'Unknown'}</span><Sub>{user.lastLoginProxy ? `Login ${formatRelative(user.lastLoginProxy)}` : ''}</Sub></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={Bot}>Marketplace feeds</SectionTitle>
        {feeds.length === 0 ? (
          <Empty>No feeds returned.</Empty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {feeds.map((feed, index) => {
              const state = healthState(feed.healthState || feed.health);
              return (
                <div key={feed.id || feed.feedId || index} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-bold text-white">{feed.name || feed.label || `Feed ${index + 1}`}</p><p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-600">{number(feed.count ?? feed.vehicleCount ?? feed.listingCount)} vehicles</p></div>
                    <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400"><span className={`h-2 w-2 rounded-full ${healthColor(state)}`} />{state}</span>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-500">Last sync: {formatRelative(feed.lastSyncAt)}</p>
                  {feed.lastSyncError && <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-[10px] text-red-200">{feed.lastSyncError}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <section className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={Bot}>Daily posting mix</SectionTitle>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
              {[7, 30, 90].map((value) => (
                <button key={value} type="button" onClick={() => onDaysChange(value)} className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${days === value ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>{value}d</button>
              ))}
            </div>
          </div>
          <div className="relative h-72">
            {chartLoading && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50"><Loader2 size={20} className="animate-spin text-blue-300" /></div>}
            {daily.length === 0 && !chartLoading ? (
              <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-600">No daily posting data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={daily} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={shortDate} stroke="#475569" tick={{ fontSize: 9 }} minTickGap={20} />
                  <YAxis stroke="#475569" tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="manual" name="Manual" stackId="posts" fill="#3b82f6" radius={[0, 0, 2, 2]} />
                  <Bar dataKey="autopilot" name="AutoPilot" stackId="posts" fill="#10b981" />
                  <Bar dataKey="unknownSplit" name="Unknown split" stackId="posts" fill="#64748b" radius={[2, 2, 0, 0]} />
                  <Line dataKey="failed" name="Failed" type="monotone" stroke="#ef4444" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <SectionTitle icon={Ticket}>Support tickets</SectionTitle>
            {tickets?.sheetUrl && <a href={tickets.sheetUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-300 hover:text-blue-200">Open Sheet <ExternalLink size={11} /></a>}
          </div>
          {ticketRows.length === 0 ? <Empty>No recent tickets.</Empty> : (
            <div className="space-y-2">
              {ticketRows.slice(0, 10).map((ticket, index) => (
                <div key={ticket.id || ticket.ref || index} className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3"><strong className="text-xs text-white">{ticket.ref || ticket.reference || ticket.ticketRef || 'Ticket'}</strong><span className={`text-[9px] font-black uppercase tracking-widest ${severityColor(ticket.severity)}`}>{ticket.severity || 'normal'}</span></div>
                  <div className="mt-1 flex justify-between gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-600"><span>{ticket.status || 'Unknown'}</span><span>{formatDate(ticket.createdAt || ticket.date)}</span></div>
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
    <section className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <SectionTitle icon={MessageSquarePlus}>Customer-success notes</SectionTitle>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,1fr)]">
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {notes.length === 0 ? <Empty>No notes yet.</Empty> : notes.map((note, index) => (
            <article key={note.id || index} className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
              <div className="flex items-center justify-between gap-3"><strong className="text-[10px] uppercase tracking-widest text-blue-200">{note.author || 'Admin'}</strong><time className="text-[9px] text-slate-600">{formatDate(note.createdAt, true)}</time></div>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{note.body}</p>
            </article>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength="120" placeholder="Your name" className="h-9 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-xs text-white outline-none focus:border-blue-500/60" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength="4000" rows="5" placeholder="Add context, a promise, or the next follow-up step..." className="w-full resize-y rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white outline-none focus:border-blue-500/60" />
          <div className="flex items-center justify-between gap-3">
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
  return <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Icon size={14} className="text-blue-300" />{children}</h4>;
}

function Th({ children }) { return <th className="whitespace-nowrap px-3 py-2.5">{children}</th>; }
function Td({ children }) { return <td className="whitespace-nowrap px-3 py-3 align-top">{children}</td>; }
function Sub({ children }) { return children ? <span className="mt-1 block max-w-52 truncate text-[9px] font-bold uppercase tracking-widest text-slate-600">{children}</span> : null; }
function Empty({ children }) { return <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[9px] font-bold uppercase tracking-widest text-slate-600">{children}</div>; }

function Presence({ presence }) {
  const status = String(presence.status || (presence.lastHeartbeat ? 'offline' : 'unknown')).toLowerCase();
  const live = status === 'online' || status === 'connected' || status === 'active';
  const away = status === 'away' || status === 'idle';
  return <span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : away ? 'bg-amber-400' : 'bg-slate-500'}`} />{status}</span>;
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

function array(value) { return Array.isArray(value) ? value : []; }
function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed.toLocaleString() : '0'; }
function truthy(value) { return value === true || value === 'true' || value === 1; }
