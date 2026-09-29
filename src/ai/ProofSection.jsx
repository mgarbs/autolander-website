import { useEffect, useState } from 'react';
import { PROOF, proofEntriesFor } from 'virtual:ai-visibility-proof';
import { Eyebrow, SectionHeading, Grad } from './AiSections.jsx';

export function metricDelta(before, after) {
  const start = Number.parseFloat(before.replaceAll(',', ''));
  const end = Number.parseFloat(after.replaceAll(',', ''));
  if (!start) return null;
  const ratio = end / start;
  return ratio >= 3 ? `+${Number(ratio.toFixed(1))}×` : `+${Math.round((ratio - 1) * 100)}%`;
}

function Sparkline({ entry }) {
  const max = Math.max(...entry.trend, 1);
  const points = entry.trend.map((value, i) => [8 + i * 284 / (entry.trend.length - 1), 92 - value / max * 80]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const last = points.at(-1);
  const gradient = `trend-${entry.id}`;
  return <svg viewBox="0 0 300 100" role="img" aria-label={`${entry.dealer}: weekly AI-assistant visits, ${entry.trend.join(', ')}`} className="mt-6 h-auto w-full text-blue-400">
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity="0.3" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    <path d={`${line} L292,100 L8,100 Z`} fill={`url(#${gradient})`} />
    <path d={line} fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx={last[0]} cy={last[1]} r="4" fill="currentColor" />
  </svg>;
}

export function ProofSection() {
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') !== 'proof') return;
    setPreview(true);
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  const entries = proofEntriesFor({ preview });
  if (!entries.length) return null;
  const columns = ['lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3'][Math.min(entries.length, 3) - 1];
  return <section className="bg-[#050505] py-20 lg:py-28" data-proof-section="">
    <div className="mx-auto max-w-7xl px-6">
      {preview && <span className="mb-5 inline-block rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-slate-400">Preview</span>}
      <Eyebrow>{PROOF.eyebrow}</Eyebrow>
      <SectionHeading className="mt-5 max-w-4xl">{PROOF.h2Lead} <Grad>{PROOF.h2Grad}</Grad></SectionHeading>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{PROOF.body}</p>
      <div className={`mt-12 grid gap-5 ${columns}`}>
        {entries.map((entry) => <article key={entry.id} data-proof-card={entry.id} className="min-w-0 rounded-3xl border border-white/10 bg-[#0b0d12] p-6">
          <h3 className="font-display text-2xl font-extrabold uppercase italic text-white">{entry.dealer}</h3>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-slate-400">{entry.place}<br /><span className="break-all">{entry.site}</span></p>
          <span className="mt-4 inline-block rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-blue-200">{entry.period}</span>
          <dl className="mt-5 divide-y divide-white/10">
            {entry.metrics.map((metric) => <div key={metric.label} className="py-4">
              <dt className="text-sm text-slate-300">{metric.label}</dt>
              <dd className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-sm text-slate-400"><span className="sr-only">Before: </span>{metric.before}</span>
                <span className="text-slate-400" aria-hidden="true">→</span>
                <strong className="font-display text-2xl font-extrabold text-white"><span className="sr-only">After: </span>{metric.after}</strong>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-300">{metricDelta(metric.before, metric.after)}</span>
              </dd>
            </div>)}
          </dl>
          <Sparkline entry={entry} />
          <figure className="mt-6 border-t border-white/10 pt-6">
            <blockquote className="text-sm leading-relaxed text-slate-300">“{entry.quote}”</blockquote>
            <figcaption className="mt-4 font-mono text-[10px] leading-relaxed text-slate-400">{entry.quoteBy} · {entry.dealer}</figcaption>
          </figure>
        </article>)}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-slate-400">{PROOF.footnote}</p>
    </div>
  </section>;
}
