import { ExternalLink, Image, Video } from 'lucide-react';
import { formatDate, formatRelative } from './lib/analytics-format.js';

export function PostEventRow({ post }) {
  const occurredAt = post?.occurredAt;
  const listing = object(post?.listing);
  const background = object(post?.background);
  const video = object(post?.video);
  const photos = object(post?.photos);
  const account = object(post?.account);
  const user = object(post?.user);
  const vehicle = object(post?.vehicle);
  const listingUrl = canonicalUrl(listing.url, post?.postUrl, vehicle.listingUrl);
  const description = text(listing.description, post?.description);
  const descriptionExact = listing.descriptionExact === true;
  const vehicleLabel = text(vehicle.label, [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' '), vehicle.vin, 'Vehicle');
  const posterLabel = text(user.label, user.displayName, user.username, user.email, 'Unknown user');
  const accountLabel = text(account.label, account.name, account.slug, account.id, 'Unknown customer');
  const priceSource = metadataText(listing.priceSource, post?.priceSource);
  const postUrlSource = metadataText(listing.postUrlSource, listing.urlSource, post?.postUrlSource, post?.urlSource);
  const descriptionSource = metadataText(listing.descriptionSource, post?.descriptionSource);
  const descriptionAccuracy = metadataText(listing.descriptionAccuracy, post?.descriptionAccuracy);

  return (
    <details className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/35 open:border-cyan-400/20">
      <summary
        className="min-w-0 cursor-pointer rounded-xl px-3 py-3 marker:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/80 sm:px-4"
        aria-label={`View delivery receipt details for ${vehicleLabel}`}
      >
        <div className="ml-1 min-w-0 sm:ml-2">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <strong className="break-words text-xs font-extrabold text-slate-100">{vehicleLabel}</strong>
                <PostChip tone="cyan">{sourceLabel(post?.source)}</PostChip>
                <MediaChip icon={Image} active={background.delivered === true} requested={background.requested === true} label="Background" />
                <MediaChip icon={Video} active={video.delivered === true} requested={video.requested === true} label="Video" />
              </div>
              <p className="mt-1.5 break-words text-[11px] font-semibold text-slate-400">
                {accountLabel} <span className="text-slate-700">/</span> {posterLabel}
              </p>
              <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                {listing.price !== undefined && listing.price !== null && <span>Recorded price <strong className="text-slate-200">{formatMoney(listing.price)}</strong></span>}
                {photoCount(photos, background) !== null && <span>Photos <strong className="text-slate-300">{photoCount(photos, background).toLocaleString()}</strong></span>}
                {listingUrl && <span className="font-bold text-cyan-300">Listing link available</span>}
                <span className="font-bold text-blue-300">Expand post parameters</span>
              </div>
            </div>
            <time
              className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400"
              dateTime={occurredAt || undefined}
              title={formatDate(occurredAt, true)}
            >
              {occurredAt ? formatRelative(occurredAt) : 'Time unknown'}
            </time>
          </div>
        </div>
      </summary>

      <div className="min-w-0 space-y-3 border-t border-white/10 bg-black/25 px-3 py-3 sm:px-4">
        <p className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] leading-relaxed text-slate-400">
          Receipt time and delivery settings belong to this event. Vehicle, price, listing URL, and copy can come from the latest stored record; use the source and accuracy fields below to interpret them.
        </p>
        <dl className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
          <TechnicalFact label="Delivery receipt" value={post?.id} mono />
          <TechnicalFact label="Receipt time" value={occurredAt ? formatDate(occurredAt, true) : ''} />
          <TechnicalFact label="Customer" value={accountLabel} />
          <TechnicalFact label="Poster" value={posterLabel} />
          <TechnicalFact label="Poster email" value={user.email} />
          <TechnicalFact label="Source" value={sourceLabel(post?.source)} />
          <TechnicalFact label="Listing ID" value={listing.id} mono />
          <TechnicalFact label="VIN / stock" value={[vehicle.vin, vehicle.stockNumber].filter(Boolean).join(' / ')} mono />
          <TechnicalFact label="Recorded price" value={listing.price !== undefined && listing.price !== null ? formatMoney(listing.price) : ''} />
          <TechnicalFact label="Price source" value={priceSource} />
          <TechnicalFact label="Listing URL source" value={postUrlSource} />
          <TechnicalFact label="Description source" value={descriptionSource} />
          <TechnicalFact label="Description accuracy" value={descriptionAccuracy} />
          <TechnicalFact label="Mileage" value={formatMileage(vehicle.mileage, vehicle.mileageUnit)} />
          <TechnicalFact label="Condition" value={vehicle.condition} />
          <TechnicalFact label="Body / color" value={[vehicle.bodyStyle, vehicle.color].filter(Boolean).join(' / ')} />
        </dl>

        {listingUrl && <DiagnosticLink label="Latest recorded Facebook Marketplace listing URL" url={listingUrl} />}

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <ParameterPanel
            icon={Image}
            title="Photo & background"
            accent="cyan"
            status={mediaStatus(background)}
            rows={[
              ['Requested', yesNoUnknown(background.requested)],
              ['Delivered', yesNoUnknown(background.delivered)],
              ['Preset', background.preset],
              ['Quality', background.quality],
              ['Input photos', numberText(background.inputCount ?? photos.inputCount)],
              ['Output photos', numberText(background.outputCount ?? photos.outputCount ?? photos.postedCount)],
              ['Backgrounds replaced', numberText(background.replacedCount)],
              ['Job status', background.status],
              ['Job ID', background.jobId],
            ]}
          />
          <ParameterPanel
            icon={Video}
            title="Walkaround video"
            accent="violet"
            status={mediaStatus(video)}
            rows={[
              ['Requested', yesNoUnknown(video.requested)],
              ['Delivered', yesNoUnknown(video.delivered)],
              ['Provider', video.provider],
              ['Duration', video.durationSec !== undefined && video.durationSec !== null ? `${video.durationSec}s` : ''],
              ['Resolution', video.resolution],
              ['Job status', video.status],
              ['Job ID', video.jobId],
            ]}
          />
        </div>

        {video.prompt && <TextBlock label="Video prompt" value={video.prompt} />}
        {description && (
          <TextBlock
            label={descriptionExact ? 'Receipt-linked listing copy' : 'Latest recorded listing copy'}
            note={descriptionExact ? 'Source metadata marks this copy as linked to the receipt.' : 'A historical copy was not stored for this receipt, so this is the closest current record.'}
            value={description}
          />
        )}
        <JsonBlock label="Read-only delivery receipt" value={post?.raw || post} />
      </div>
    </details>
  );
}

export default PostEventRow;

function MediaChip({ icon: Icon, active, requested, label }) {
  const className = active
    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
    : requested
      ? 'border-amber-400/25 bg-amber-400/10 text-amber-200'
      : 'border-white/10 bg-white/[0.025] text-slate-500';
  const suffix = active ? 'delivered' : requested ? 'requested' : 'off';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${className}`}>
      <Icon size={9} aria-hidden="true" /> {label} {suffix}
    </span>
  );
}

function PostChip({ children, tone = 'slate' }) {
  const toneClass = tone === 'cyan'
    ? 'border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-200'
    : 'border-white/10 bg-white/[0.03] text-slate-400';
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${toneClass}`}>{children}</span>;
}

function ParameterPanel({ icon: Icon, title, accent, status, rows }) {
  const violet = accent === 'violet';
  return (
    <section className={`min-w-0 rounded-xl border p-3 ${violet ? 'border-violet-400/15 bg-violet-400/[0.04]' : 'border-cyan-400/15 bg-cyan-400/[0.04]'}`}>
      <div className="flex items-center justify-between gap-2">
        <h5 className={`flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-widest ${violet ? 'text-violet-200' : 'text-cyan-200'}`}>
          <Icon size={12} aria-hidden="true" /> {title}
        </h5>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{status}</span>
      </div>
      <dl className="mt-3 space-y-1.5">
        {rows.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value]) => (
          <div key={label} className="grid min-w-0 grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2 text-[11px]">
            <dt className="text-slate-400">{label}</dt>
            <dd className="break-all text-right font-semibold text-slate-300">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TechnicalFact({ label, value, mono = false }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2">
      <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className={`mt-1 break-all text-[11px] text-slate-200 ${mono ? 'font-mono' : ''}`}>{String(value)}</dd>
    </div>
  );
}

function DiagnosticLink({ label, url }) {
  return (
    <div className="min-w-0 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 flex min-w-0 items-start gap-2 break-all rounded font-mono text-[11px] leading-relaxed text-cyan-200 underline decoration-cyan-300/30 underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
      >
        <span className="min-w-0 flex-1">{url}</span>
        <ExternalLink size={11} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}

function TextBlock({ label, note, value }) {
  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      {note && <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{note}</p>}
      <p className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-300">{value}</p>
    </section>
  );
}

function JsonBlock({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <pre className="max-h-72 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[10px] leading-relaxed text-slate-400">
        {prettyJson(value)}
      </pre>
    </div>
  );
}

function sourceLabel(value) {
  const source = text(value).toLowerCase();
  if (source === 'autopilot' || source === 'auto_pilot') return 'Auto-pilot';
  if (source === 'manual' || source === 'assisted') return 'Assisted';
  return source ? source.replace(/[_-]+/g, ' ') : 'Source unknown';
}

function metadataText(...values) {
  const value = text(...values);
  if (!value) return 'Not recorded';
  const readable = value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function mediaStatus(value) {
  if (value?.delivered === true) return 'Delivered';
  if (value?.requested === true) return 'Not delivered';
  return 'Not requested';
}

function yesNoUnknown(value) {
  return value === true ? 'Yes' : value === false ? 'No' : 'Unknown';
}

function numberText(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number).toLocaleString() : '';
}

function photoCount(photos, background) {
  for (const value of [photos.postedCount, photos.outputCount, background.outputCount, photos.inputCount, background.inputCount]) {
    const number = Number(value);
    if (Number.isFinite(number)) return Math.max(0, number);
  }
  return null;
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value || '');
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number);
}

function formatMileage(value, unit) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return `${Math.max(0, number).toLocaleString()} ${String(unit || 'mi').toLowerCase() === 'km' ? 'km' : 'mi'}`;
}

function canonicalUrl(...values) {
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) continue;
    try {
      const url = new URL(value.trim());
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
    } catch {
      // Ignore malformed or non-absolute links.
    }
  }
  return '';
}

function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function text(...values) {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim());
  return value === undefined ? '' : String(value).trim();
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
