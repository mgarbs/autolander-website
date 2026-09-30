import { useEffect, useRef, useState } from 'react';
import {
  AEO_GEO,
  AI_VISIBILITY_UPDATED,
  AI_VISIBILITY_UPDATED_HUMAN,
  BRAND_SCAN,
  ENGINES,
  EVERY_PLAN_INCLUDES,
  FAQ,
  FAQ_HEADING,
  FINAL_CTA,
  FINE_PRINT,
  HERO,
  ILLUSTRATION_SLOTS,
  HOW,
  HOW_IT_STARTS,
  MOBILE_BAR,
  NEVER_PROMISE,
  NOT_INCLUDED,
  PLANS,
  PLANS_SECTION,
  PLANS_UPDATED,
  PLANS_UPDATED_HUMAN,
  PROMISES,
  REASONS,
  RELATED,
  REPORT,
  REPORT_MOCK,
  REVIEW,
  SERVICE_SUMMARY,
  SHIFT,
  WHERE_BUYERS_ASK,
  RESULTS_VIEW,
  comparisonRows,
  fmtUsd,
} from '../../shared/ai-visibility-content.js';
import { aiImage } from '../../shared/ai-images.js';
import { IMAGE_SIZES } from '../../shared/responsive-images.js';
import ResponsiveImage from '../components/ResponsiveImage.jsx';

const ArrowRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export const Grad = ({ children }) => (
  <span className="inline box-decoration-clone bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text pr-[0.14em] text-transparent">
    {children}
  </span>
);

export const Eyebrow = ({ children }) => (
  <span className="flex max-w-full items-start gap-2.5 font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.28em] text-blue-300/90">
    <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-blue-400 shadow-[0_0_12px_2px_rgba(96,165,250,0.65)]" />
    <span className="min-w-0">{children}</span>
  </span>
);

export const SectionHeading = ({ children, className = '' }) => (
  <h2 className={`font-display text-[clamp(2rem,9vw,2.25rem)] font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl ${className}`}>
    {children}
  </h2>
);

export const ScanLink = ({ onGo, className, children }) => (
  <a href="#scan-form" data-scan-cta="" onClick={onGo} className={className}>
    {children}
  </a>
);

const PRIMARY_CTA = 'group flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:w-auto sm:px-8 sm:text-lg';

function ReportMock() {
  const cell = {
    named: 'rounded bg-emerald-500/25 py-1.5 text-center text-emerald-200',
    rival: 'rounded bg-rose-500/20 py-1.5 text-center text-rose-200',
    none: 'rounded bg-white/5 py-1.5 text-center text-slate-400',
  };
  return (
    <div className="relative mt-5 hidden md:block">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-[80px]" aria-hidden="true" />
      <div className="rounded-3xl border border-white/10 bg-[#0b0d12]/95 p-6 shadow-2xl shadow-blue-950/50">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{REPORT_MOCK.caption}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300">{REPORT_MOCK.badge}</span>
        </div>
        <div className="mt-5 flex items-end gap-4">
          <p className="font-display text-7xl font-extrabold italic text-white">{REPORT_MOCK.score}<span className="ml-1 text-2xl text-slate-500">/100</span></p>
          <p className="mb-2 text-sm text-slate-300">{REPORT_MOCK.scoreNote}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
          <span />
          {ENGINES.map((engine) => <span key={engine.id} className="text-center">{engine.name}</span>)}
          {REPORT_MOCK.rows.map(([question, ...columns]) => (
            <div key={question} className="contents">
              <span>{question}</span>
              {columns.map((value, index) => (
                <span key={`${question}-${ENGINES[index].id}`} className={cell[value]}>{REPORT_MOCK.cellLabel[value]}</span>
              ))}
            </div>
          ))}
        </div>
        <ol className="m-0 mt-5 grid list-none gap-2 p-0 text-sm">
          {REPORT_MOCK.fixes.map((fix, index) => (
            <li key={fix} className="flex gap-2 text-slate-300"><span className="text-blue-400">{index + 1}</span>{fix}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function AiHero({ onGo }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div className="min-w-0 max-w-2xl lg:pt-5">
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          {/* max-w-[9.2em]: the line box scales with the font, so the H1 wraps the same way in the metric-matched
              fallback and in Archivo at every width (no layout shift when the web font swaps in). Re-check with the
              fallback-vs-webfont wrap sweep if the H1 copy or size changes. */}
          <h1 className="mt-5 max-w-[9.2em] font-display text-[clamp(2.15rem,9vw,3rem)] font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-6xl lg:text-[4rem]">
            {HERO.h1Lead} <Grad>{HERO.h1Grad}</Grad>
          </h1>
          <p className="al-ai-summary mt-6 max-w-xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">{HERO.summary}</p>
          <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-start">
            <ScanLink onGo={onGo} className={PRIMARY_CTA}>
              {HERO.cta}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </ScanLink>
            <div className="flex flex-wrap gap-2">
              {HERO.chips.map((chip) => <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-300">{chip}</span>)}
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-400">{HERO.trustLine}</p>
        </div>
        <div className="relative min-w-0">
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-[70px]" aria-hidden="true" />
          <ResponsiveImage image={aiImage(ILLUSTRATION_SLOTS.hero.image)} sizes={IMAGE_SIZES.aiHero} eager />
          <p className="mt-3 text-xs leading-relaxed text-slate-400">{ILLUSTRATION_SLOTS.hero.caption}</p>
          <ReportMock />
        </div>
      </div>
    </section>
  );
}

const AEO_CARD = 'self-start rounded-3xl border border-white/10 bg-white/[0.03] p-6';
const AEO_CARD_TITLE = 'font-display text-xl font-extrabold uppercase italic text-white';

const TermText = ({ term }) => (
  <p className="mt-3 text-[15px] leading-relaxed text-slate-400"><span className="al-aeo-def">{term.definition}</span> {term.detail}</p>
);

// "What do AEO and GEO mean for a car dealership?" The first section below the hero and the page's main citation
// target: every word is plain visible text (nothing collapsed), from the same AEO_GEO export as the mirror and twin.
export function AeoGeoSection() {
  const byId = Object.fromEntries(AEO_GEO.terms.map((term) => [term.id, term]));
  const { table } = AEO_GEO;
  return (
    <section id={AEO_GEO.anchor} className="scroll-mt-24 border-y border-white/5 bg-[#080808] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>{AEO_GEO.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">{AEO_GEO.h2Lead} <Grad>{AEO_GEO.h2Grad}</Grad></SectionHeading>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {AEO_GEO.updatedLabel} <time dateTime={AI_VISIBILITY_UPDATED}>{AI_VISIBILITY_UPDATED_HUMAN}</time>
          {REVIEW.enabled && <>{' · '}{REVIEW.label} <a className="text-blue-300 underline underline-offset-4" href={REVIEW.href}>{REVIEW.name}</a>, {REVIEW.role}</>}
        </p>
        <p className="al-aeo-lead mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{AEO_GEO.lead}</p>
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          {[byId.aeo, byId.geo].map((term) => (
            <article key={term.id} id={`term-${term.id}`} className={`scroll-mt-24 ${AEO_CARD}`}>
              <h3 className={AEO_CARD_TITLE}>{term.question}</h3>
              <TermText term={term} />
            </article>
          ))}
        </div>
        <div id="term-seo" className="mt-12 scroll-mt-24">
          <h3 className="font-display text-2xl font-extrabold uppercase italic text-white">{byId.seo.question}</h3>
          <div className="max-w-3xl"><TermText term={byId.seo} /></div>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-[#0b0d12]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm text-slate-300">
              <caption className="border-b border-white/10 p-5 text-left font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">{table.caption}</caption>
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="p-4"><span className="sr-only">{table.rowHeaderLabel}</span></th>
                  {table.columns.map((column) => <th key={column} scope="col" className="p-4 font-display text-lg font-extrabold uppercase italic text-white">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.map(([label, ...values]) => (
                  <tr key={label} className="border-b border-white/5 align-top last:border-0">
                    <th scope="row" className="w-[22%] p-4 font-bold text-white">{label}</th>
                    {values.map((value, index) => <td key={`${label}-${table.columns[index]}`} className="w-[26%] p-4 leading-relaxed">{value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-slate-300">{AEO_GEO.foundation}</p>
        <p className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] px-5 py-4 leading-relaxed text-blue-200">{AEO_GEO.scanNote}</p>
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <div className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className={AEO_CARD_TITLE}>{AEO_GEO.glossaryHeading}</h3>
            <dl className="mt-6 grid gap-4">
              {AEO_GEO.glossary.map(({ term, body }) => (
                <div key={term}>
                  <dt className="font-bold text-white">{term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-400">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className={AEO_CARD_TITLE}>{AEO_GEO.sourcesHeading}</h3>
            <ul className="m-0 mt-6 grid list-none gap-2 p-0">
              {AEO_GEO.sources.map((source) => (
                <li key={source.url}>
                  <a className="inline-block py-1 text-sm leading-relaxed text-blue-300 underline decoration-blue-400/40 underline-offset-4 hover:text-blue-200" href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShiftSection() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <Eyebrow>{SHIFT.eyebrow}</Eyebrow>
          <SectionHeading className="mt-5 max-w-4xl">{SHIFT.h2Lead} <Grad>{SHIFT.h2Grad}</Grad></SectionHeading>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{SHIFT.body}</p>
        </div>
        <div className="self-start rounded-[2rem] border border-blue-400/20 bg-blue-500/[0.06] p-7 shadow-xl shadow-blue-950/30 sm:p-9">
          <p className="font-display text-7xl font-extrabold italic text-white">{SHIFT.stat.value}</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-200">{SHIFT.stat.text}</p>
          <a className="mt-5 inline-block text-xs leading-relaxed text-blue-300 underline decoration-blue-400/40 underline-offset-4 hover:text-blue-200" href={SHIFT.stat.sourceUrl} target="_blank" rel="noreferrer">{SHIFT.stat.source}</a>
        </div>
      </div>
    </section>
  );
}

const ReportCard = ({ part }) => (
  <article className={`self-start rounded-3xl border p-6 ${part.accent ? 'border-blue-400/30 bg-blue-500/[0.08]' : 'border-white/10 bg-white/[0.03]'}`}>
    <h3 className="font-display text-xl font-extrabold uppercase italic text-white">{part.title}</h3>
    {part.tag && <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-blue-300">{part.tag}</p>}
    <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{part.body}</p>
  </article>
);

export function WhereBuyersAskSection() {
  return (
    <section className="bg-[#050505] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>{WHERE_BUYERS_ASK.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">{WHERE_BUYERS_ASK.h2Lead} <Grad>{WHERE_BUYERS_ASK.h2Grad}</Grad></SectionHeading>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{WHERE_BUYERS_ASK.body}</p>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {WHERE_BUYERS_ASK.cards.map((card) => (
            <article key={card.name} className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="p-6">
                <h3 className="font-display text-2xl font-extrabold uppercase italic text-white">{card.name}</h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-blue-300">{card.maker}</p>
                <p className="mt-3 leading-relaxed text-slate-400">{card.body}</p>
              </div>
              <ResponsiveImage image={aiImage(card.image)} sizes={IMAGE_SIZES.aiCard} className="block h-auto w-full" />
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">{WHERE_BUYERS_ASK.caption}</p>
        <p className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] px-5 py-4 leading-relaxed text-blue-200">{WHERE_BUYERS_ASK.scanNote}</p>
      </div>
    </section>
  );
}

export function ResultsViewSection() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>{RESULTS_VIEW.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">{RESULTS_VIEW.h2Lead} <Grad>{RESULTS_VIEW.h2Grad}</Grad></SectionHeading>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{RESULTS_VIEW.body}</p>
        <div className="mt-12 grid gap-8">
          {RESULTS_VIEW.panels.map((panel) => (
            <article key={panel.title} className="grid items-center gap-6 lg:grid-cols-[0.34fr_0.66fr]">
              <div className="rounded-3xl border border-white/10 bg-[#0b0d12] p-6">
                <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{panel.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-400">{panel.body}</p>
              </div>
              <ResponsiveImage image={aiImage(panel.image)} sizes={IMAGE_SIZES.aiResults} />
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">{RESULTS_VIEW.caption}</p>
      </div>
    </section>
  );
}

export function ReportSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>{REPORT.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">{REPORT.h2Lead} <Grad>{REPORT.h2Grad}</Grad></SectionHeading>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{REPORT.lead}</p>
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ResponsiveImage image={aiImage(ILLUSTRATION_SLOTS.report.image)} sizes={IMAGE_SIZES.aiReport} />
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {REPORT.parts.slice(0, 2).map((part) => <ReportCard key={part.title} part={part} />)}
          </div>
        </div>
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {REPORT.parts.slice(2).map((part) => <ReportCard key={part.title} part={part} />)}
          </div>
          <ResponsiveImage image={aiImage(ILLUSTRATION_SLOTS.vehicle.image)} sizes={IMAGE_SIZES.aiReport} />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">{ILLUSTRATION_SLOTS.reportCaption}</p>
      </div>
    </section>
  );
}

export function ReasonsSection() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>{REASONS.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">{REASONS.h2Lead} <Grad>{REASONS.h2Grad}</Grad></SectionHeading>
        <div className="mt-12 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.items.map((item, index) => (
            <article key={item.title} className="self-start rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display text-5xl font-extrabold italic text-blue-500/70">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-4 font-display text-xl font-extrabold uppercase italic text-white">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowSteps() {
  return (
    <div>
      <Eyebrow>{HOW.eyebrow}</Eyebrow>
      <SectionHeading className="mt-5">{HOW.h2Lead} <Grad>{HOW.h2Grad}</Grad></SectionHeading>
      <ol className="m-0 mt-8 grid list-none gap-4 p-0">
        {HOW.steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <span className="font-display text-3xl font-extrabold italic text-blue-500/80">{index + 1}</span>
            <div>
              <h3 className="font-bold text-white">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const LIST_MARKERS = { check: '✓', cross: '✕', dot: '•' };
const MARKER_CLASS = { check: 'text-blue-400', cross: 'text-slate-500', dot: 'text-slate-500' };

const CheckList = ({ items, ordered = false, marker = 'check', columns = false }) => {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`m-0 grid list-none gap-3 p-0 ${columns ? 'lg:grid-cols-2 lg:gap-x-8' : ''}`}>
      {items.map((item, index) => (
        <li key={typeof item === 'string' ? item : item.title} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
          <span className={`mt-0.5 shrink-0 font-mono ${ordered ? 'text-blue-400' : MARKER_CLASS[marker]}`} aria-hidden="true">{ordered ? index + 1 : LIST_MARKERS[marker]}</span>
          {typeof item === 'string' ? item : <span><strong className="text-white">{item.title}</strong> {item.body}</span>}
        </li>
      ))}
    </Tag>
  );
};

export function PlansSection({ onGo }) {
  const rows = comparisonRows();
  return (
    <section id="plans" className="border-y border-white/5 bg-[#080808] py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>{PLANS_SECTION.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">{PLANS_SECTION.h2Lead} <Grad>{PLANS_SECTION.h2Grad}</Grad></SectionHeading>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{PLANS_SECTION.lead}</p>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article id={plan.anchor} key={plan.id} className="scroll-mt-24 self-start rounded-[2rem] border border-white/10 bg-[#0b0d12] p-6 shadow-xl shadow-black/30 sm:p-7">
              <div className="flex min-h-8 flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold uppercase italic text-white">{plan.name}</h3>
                {plan.availability === 'by-application' && <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-blue-200">{PLANS_SECTION.byApplication}</span>}
              </div>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-5xl font-extrabold italic text-white">{fmtUsd(plan.monthly)}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">{PLANS_SECTION.perMonth}</span>
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-wider text-slate-400">{fmtUsd(plan.setup)} {PLANS_SECTION.setupSuffix}</p>
              <p className="mt-6 font-bold leading-relaxed text-blue-200">{plan.builtFor}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{plan.summary}</p>
              <div className="mt-6 border-t border-white/10 pt-6"><CheckList items={plan.includes} /></div>
              <ScanLink onGo={onGo} className="mt-7 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 font-display text-sm font-extrabold uppercase italic text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">{PLANS_SECTION.cardCta}</ScanLink>
            </article>
          ))}
        </div>

        <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-5 py-4 text-center font-bold text-emerald-200">{PLANS_SECTION.customerLine}</p>

        <div className="mt-12 overflow-x-auto rounded-3xl border border-white/10 bg-[#0b0d12]">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm text-slate-300">
            <caption className="border-b border-white/10 p-5 text-left font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">{PLANS_SECTION.tableCaption}</caption>
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="p-4" />
                {PLANS.map((plan) => <th key={plan.id} scope="col" className="p-4 font-display text-lg font-extrabold uppercase italic text-white">{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, ...values]) => (
                <tr key={label} className="border-b border-white/5 align-top last:border-0">
                  <th scope="row" className="w-[24%] p-4 font-bold text-white">{label}</th>
                  {values.map((value, index) => <td key={`${label}-${PLANS[index].id}`} className="w-[25.33%] p-4 leading-relaxed">{value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12">
          <div className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{PLANS_SECTION.everyPlanHeading}</h3>
            <div className="mt-6"><CheckList items={EVERY_PLAN_INCLUDES} columns /></div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-display text-3xl font-extrabold uppercase italic text-white sm:text-4xl">{PLANS_SECTION.promisesHeading}</h3>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-400">{PLANS_SECTION.promisesIntro}</p>
          <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
            {PROMISES.map((item) => (
              <article key={item.promise} className="self-start rounded-2xl border border-white/10 bg-[#0b0d12] p-5">
                <h4 className="font-bold leading-relaxed text-white">{item.promise}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.step}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 grid items-start gap-6">
          <article className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{PLANS_SECTION.neverHeading}</h3>
            <div className="mt-6"><CheckList items={NEVER_PROMISE} marker="cross" /></div>
          </article>
          <article className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{PLANS_SECTION.notIncludedHeading}</h3>
            <div className="mt-6"><CheckList items={NOT_INCLUDED} marker="cross" /></div>
          </article>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <article className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{PLANS_SECTION.howItStartsHeading}</h3>
            <div className="mt-6"><CheckList items={HOW_IT_STARTS} ordered /></div>
          </article>
          <article className="self-start rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
            <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{PLANS_SECTION.finePrintHeading}</h3>
            <div className="mt-6"><CheckList items={FINE_PRINT} marker="dot" /></div>
          </article>
        </div>

        <aside className="mt-12 rounded-3xl border border-blue-400/20 bg-blue-500/[0.06] p-6 sm:p-8">
          <h3 className="font-display text-3xl font-extrabold uppercase italic text-white">{BRAND_SCAN.heading}</h3>
          <p className="mt-4 max-w-4xl leading-relaxed text-slate-300">{BRAND_SCAN.body}</p>
        </aside>

        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Prices and plans updated <time dateTime={PLANS_UPDATED}>{PLANS_UPDATED_HUMAN}</time>
        </p>
      </div>
    </section>
  );
}

export function AiFaq() {
  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Eyebrow>{FAQ_HEADING.eyebrow}</Eyebrow>
        <SectionHeading className="mt-5">{FAQ_HEADING.h2Lead} <Grad>{FAQ_HEADING.h2Grad}</Grad></SectionHeading>
        <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-[#0b0d12]">
          {FAQ.map((item, index) => (
            <details key={item.q} className="group p-6" open={index === 0} {...(item.allow ? { 'data-claims-allow': '' } : {})}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="mt-1 text-xl leading-none text-blue-400 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="al-faq-a mt-3 leading-relaxed text-slate-400">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiFinalCta({ onGo }) {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#080808] py-20 text-center lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeading>{FINAL_CTA.h2Lead} <Grad>{FINAL_CTA.h2Grad}</Grad></SectionHeading>
        <div className="mt-9 flex justify-center">
          <ScanLink onGo={onGo} className={PRIMARY_CTA}>{FINAL_CTA.cta}<ArrowRight className="h-5 w-5" /></ScanLink>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-slate-400">{FINAL_CTA.note}</p>
      </div>
    </section>
  );
}

export function AboutService() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl px-6 text-center text-sm leading-relaxed text-slate-400">
        <nav aria-label={RELATED.heading} className="mb-8">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">{RELATED.heading}</h2>
          <ul className="m-0 mt-3 flex list-none flex-wrap justify-center gap-x-6 gap-y-1 p-0">
            {RELATED.links.map((link) => (
              <li key={link.href}><a className="inline-block py-1 text-blue-300 underline decoration-blue-400/40 underline-offset-4 hover:text-blue-200" href={link.href}>{link.label}</a></li>
            ))}
          </ul>
        </nav>
        <p>{SERVICE_SUMMARY}</p>
      </div>
    </section>
  );
}

export function AiMobileCtaBar({ onGo, formRef }) {
  const [show, setShow] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form || typeof IntersectionObserver === 'undefined') {
      const onScroll = () => setShow(window.scrollY > 560);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      setShow(window.scrollY > 560 && !entry.isIntersecting);
    });
    observer.observe(form);
    const onScroll = () => setShow(window.scrollY > 560 && !visibleRef.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [formRef]);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black px-4 pt-3 transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`} style={{ paddingBottom: 'max(0.7rem, env(safe-area-inset-bottom))' }} inert={!show}>
      <ScanLink onGo={onGo} className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 font-display text-base font-extrabold uppercase italic text-white shadow-lg shadow-blue-600/30">{MOBILE_BAR.cta}</ScanLink>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{MOBILE_BAR.note}</p>
    </div>
  );
}
