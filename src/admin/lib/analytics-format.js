const HEALTH_REASON_LABELS = new Map([
  ['no_fb_activity_7d', 'No FB activity in 7+ days (posts, renewals, or updates)'],
  ['trial_never_activated', 'Trial — never activated'],
]);

const FEED_HEALTH_STATES = new Set(['ok', 'stale', 'failing', 'paused', 'unchanged', 'unknown']);

export function feedHealthState(value) {
  const raw = typeof value === 'object' && value ? value.healthState || value.state || value.status : value;
  const state = String(raw || 'unknown').trim().toLowerCase();
  return FEED_HEALTH_STATES.has(state) ? state : 'unknown';
}

export function healthState(value) {
  const raw = typeof value === 'object' && value ? value.state || value.status || value.bucket : value;
  const state = String(raw || 'gray').toLowerCase();
  if (state === 'green' || state === 'healthy' || state === 'ok') return 'green';
  if (state === 'yellow' || state === 'amber' || state === 'stale' || state === 'warning') return 'yellow';
  if (state === 'red' || state === 'failing' || state === 'failed' || state === 'error') return 'red';
  return 'gray';
}

export function healthReasons(row) {
  const reasons = Array.isArray(row?.reasons) ? row.reasons : Array.isArray(row?.health?.reasons) ? row.health.reasons : [];
  return reasons
    .map((reason) => String(reason))
    .filter(Boolean)
    .map((reason) => HEALTH_REASON_LABELS.get(reason) ?? reason);
}

export function healthColor(state) {
  return { green: 'bg-emerald-400', yellow: 'bg-amber-400', red: 'bg-red-400', gray: 'bg-slate-500' }[state] || 'bg-slate-500';
}

export function formatRelative(value) {
  const date = toDate(value);
  if (!date) return 'Never';
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (diff < 172800000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 5184000000) return `${Math.floor(diff / 86400000)}d ago`;
  return formatDate(value);
}

export function formatDate(value, includeTime = false) {
  const date = toDate(value);
  if (!date) return '—';
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
}

function toDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
