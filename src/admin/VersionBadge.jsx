import { compareSemver } from './lib/version.js';

const UNKNOWN_TOOLTIP = 'Version unknown — reported when the app next comes online';

export default function VersionBadge({ version, latestVersion, className = '' }) {
  const current = displayVersion(version);
  const latest = displayVersion(latestVersion);
  const comparison = current === '?' || latest === '?' ? null : compareSemver(current, latest);

  let tone = 'border-white/10 bg-white/[0.04] text-slate-400';
  let tooltip = current === '?'
    ? UNKNOWN_TOOLTIP
    : `App version ${current}; latest version is unavailable`;

  if (comparison !== null && comparison < 0) {
    tone = 'border-rose-400/25 bg-rose-400/10 text-rose-400';
    tooltip = `Needs to update to ${latest} — on ${current}`;
  } else if (comparison !== null) {
    tone = 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400';
    tooltip = `On the latest version (${current})`;
  }

  return (
    <span
      className={`inline-flex min-w-0 max-w-full items-center truncate rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${tone} ${className}`}
      title={tooltip}
    >
      {current}
    </span>
  );
}

function displayVersion(value) {
  if (!value) return '?';
  return String(value).trim().replace(/^v/i, '').split(/\s+/)[0] || '?';
}
