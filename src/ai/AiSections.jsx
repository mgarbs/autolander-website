import { useEffect, useRef, useState } from 'react';
import { scrollBehavior } from './scroll.js';

// /ai-visibility sections. Self-contained on purpose: nothing here imports a homepage or /team module,
// so every existing chunk builds byte-for-byte as before (proof in the hand-off note).

const ArrowRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export const Grad = ({ children }) => (
  <span className="inline box-decoration-clone bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text pr-[0.14em] text-transparent">
    {children}
  </span>
);

const Eyebrow = ({ children }) => (
  <span className="flex max-w-full items-start gap-2.5 font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.28em] text-blue-300/90">
    <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-blue-400 shadow-[0_0_12px_2px_rgba(96,165,250,0.65)]" />
    <span className="min-w-0">{children}</span>
  </span>
);

const SectionHeading = ({ children, className = '' }) => (
  <h2 className={`font-display text-[clamp(2rem,9vw,2.25rem)] font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl ${className}`}>
    {children}
  </h2>
);

// Every "get my scan" control scrolls to the form (a plain #scan link without JavaScript).
export const ScanLink = ({ onGo, className, children }) => (
  <a href="#scan" data-scan-cta onClick={onGo} className={className}>
    {children}
  </a>
);

const PRIMARY_CTA = 'group flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:w-auto sm:px-8 sm:text-lg';

export function AiHeader({ onGo }) {
  return (
    <header className="relative z-30 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-xl sm:px-5">
        <button
          type="button"
          aria-label="Back to top"
          className="flex cursor-pointer items-center border-0 bg-transparent p-0"
          onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
        >
          <img
            src="/autolander-logo-240.webp"
            srcSet="/autolander-logo-200.webp 200w, /autolander-logo-240.webp 240w, /autolander-logo.png 400w"
            sizes="(min-width: 640px) 133px, 107px"
            alt="AutoLander"
            width="400"
            height="120"
            decoding="async"
            className="h-7 w-auto sm:h-8"
          />
        </button>
        <ScanLink
          onGo={onGo}
          className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow transition-all hover:bg-blue-500 hover:text-white active:scale-95 sm:px-6 sm:py-2.5 sm:text-sm"
        >
          Free scan
        </ScanLink>
      </div>
    </header>
  );
}

// A mock-up of OUR report layout (never a real AI-answer screenshot, never an AI company's logo).
function ReportMock({ className = 'relative hidden lg:block' }) {
  const cell = {
    named: 'rounded bg-emerald-500/25 py-1.5 text-center text-emerald-200',
    rival: 'rounded bg-rose-500/20 py-1.5 text-center text-rose-200',
    none: 'rounded bg-white/5 py-1.5 text-center',
  };
  const rows = [
    ['Best used car dealer', 'named', 'none', 'rival'],
    ['Trucks under $30k', 'none', 'rival', 'named'],
    ['Trade-in near me', 'rival', 'none', 'none'],
  ];
  const label = { named: 'named', rival: 'rival', none: '—' };
  return (
    <div className={className} aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-[80px]" />
      <div className="rounded-3xl border border-white/10 bg-[#0b0d12]/95 p-6 shadow-2xl shadow-blue-950/50">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">AI Visibility Report · sample layout</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300">Illustration</span>
        </div>
        <div className="mt-5 flex items-end gap-4">
          <p className="font-display text-7xl font-extrabold italic text-white">57<span className="text-2xl text-slate-500">/100</span></p>
          <p className="mb-2 text-sm text-slate-300">Named in some answers,<br />missing from most.</p>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
          <span />
          <span className="text-center">Engine A</span>
          <span className="text-center">Engine B</span>
          <span className="text-center">Engine C</span>
          {rows.map(([q, ...cols]) => (
            <div key={q} className="contents">
              <span>{q}</span>
              {cols.map((c, i) => <span key={i} className={cell[c]}>{label[c]}</span>)}
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 text-sm">
          <p className="flex gap-2 text-slate-300"><span className="text-blue-400">1</span>AI search crawlers blocked in robots.txt</p>
          <p className="flex gap-2 text-slate-300"><span className="text-blue-400">2</span>Fewer Google reviews than the dealers around you</p>
          <p className="flex gap-2 text-slate-300"><span className="text-blue-400">3</span>Vehicle pages don’t show price and mileage as text</p>
        </div>
      </div>
    </div>
  );
}

export function AiHero({ onGo }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-10 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="min-w-0 max-w-2xl">
          <Eyebrow>For car dealers · free AI Visibility Scan</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(2rem,8.4vw,2.6rem)] font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-6xl lg:text-[3.4rem]">
            A buyer asks AI where to buy a car in your town. <Grad>Is your store in the answer?</Grad>
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">
            We ask the AI assistants 20 questions a buyer in your town would ask, 3 times each. You see when they name you, who they name instead, the sources behind every answer, and the 3 fixes that matter most.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:items-start">
            <ScanLink onGo={onGo} className={PRIMARY_CTA}>
              Get my free scan
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </ScanLink>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <span>Free</span>
            <span>No logins needed</span>
            <span>Checked by a person</span>
            <span className="text-blue-300">20-minute walkthrough</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">Made by the AutoLander team. More than 200 dealerships are on AutoLander today.</p>
          <ReportMock className="relative mt-8 lg:hidden" />
        </div>
        <ReportMock />
      </div>
    </section>
  );
}

export function ShiftSection() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>What changed</Eyebrow>
          <SectionHeading className="mt-5">Buyers used to search. <Grad>Now they ask.</Grad></SectionHeading>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            A search gives ten links, and your store can be one of them. An AI answer names a few dealers and explains why. If you’re not one of them, you’re not in that conversation at all.
          </p>
        </div>
        {/* Sourced figure, reproduced with its source line (the claims lint skips this block). */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0b0d12] p-7" data-claims-allow="">
          <p className="font-display text-6xl font-extrabold italic text-white">19%</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-300">of all car buyers used AI websites or AI-generated overviews while they shopped.</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-slate-400">Cox Automotive Car Buyer Journey Study, released January 2026</p>
        </div>
      </div>
    </section>
  );
}

const REPORT_PARTS = [
  { t: 'Who gets named', d: 'The dealers the AI assistants recommend in your city, question by question, and how often each one comes up.' },
  { t: 'The sources they trust', d: 'The sites each answer cites, shown as links you can click, so you know where the AI learns about dealers like you.' },
  { t: 'Your cars', d: 'We pick five cars from your lot and check whether AI answers can find and describe them.' },
  { t: 'A score out of 100', d: 'Presence, sources, reputation and technical readiness, the same four things we re-check every month for dealers we work with.' },
  { t: 'Your exposure', d: 'Your monthly gross exposed to AI-assisted shoppers (not money lost): cars you sell × 19% × your gross per car.', allow: true },
  { t: 'The 3 fixes', d: 'The three changes most likely to get your store read and trusted, written plainly enough to hand to your website vendor.', accent: true },
];

export function ReportSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>Your free report</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">See what AI tells <Grad>your buyers.</Grad></SectionHeading>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_PARTS.map((p) => (
            <div
              key={p.t}
              className={`rounded-3xl border p-6 ${p.accent ? 'border-blue-400/25 bg-blue-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}
              {...(p.allow ? { 'data-claims-allow': '' } : {})}
            >
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">{p.t}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const REASONS = [
  { t: 'The door is locked', d: 'The security service in front of many websites can block AI crawlers, and some now ask site owners to choose when the site is set up. If yours blocks them, your site never gets read.' },
  { t: 'Your story doesn’t match', d: 'Different hours, names or phone numbers across Google, Yelp and the listing sites make an AI less sure it’s the same store.' },
  { t: 'Reviews go unanswered', d: 'Your reviews, and how you answer them, are part of what an assistant sees about your store. Silence reads as neglect.' },
  { t: 'Cars hidden in images', d: 'When price, mileage and VIN aren’t on the page as text, an answer can’t describe the car on your lot.' },
];

export function ReasonsSection() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>Why good stores get left out</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">It’s rarely your cars. <Grad>It’s what AI can read.</Grad></SectionHeading>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.t} className="rounded-3xl border border-white/10 bg-[#0b0d12] p-6">
              <h3 className="font-display text-xl font-extrabold uppercase italic leading-tight text-white">{r.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{r.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { t: 'You tell us where you sell', d: 'Your store, website and city. No logins, nothing to install.' },
  { t: 'We ask what your buyers ask', d: '20 questions (finding a dealer, specific cars, reputation, trade-ins) on three AI engines, 3 times each because answers change from run to run, through the AI companies’ official APIs, set to your location.' },
  { t: 'You get the report and a walkthrough', d: 'A person on our team reviews it, e-mails it to you, and walks you through it in 20 minutes. No obligation.' },
];

export function HowSteps() {
  return (
    <div>
      <Eyebrow>How it works</Eyebrow>
      <SectionHeading className="mt-5">Tell us your store. <Grad>We ask AI 180 times.</Grad></SectionHeading>
      <ol className="mt-8 grid gap-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <span className="font-display text-3xl font-extrabold italic text-blue-500/80">{i + 1}</span>
            <div>
              <p className="font-bold text-white">{s.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NextStep() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <SectionHeading>Fix it yourself, <Grad>or let us run it.</Grad></SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          The 3 fixes are yours to keep, whether or not you ever hire us. If you’d rather have it done for you, we do the work every month on your live inventory and show you the answers, so you can judge it yourself. No one can honestly promise what an AI will say, and we don’t. Plans from $497 a month, month to month.
        </p>
      </div>
    </section>
  );
}

const FAQ = [
  { q: 'Which AI assistants do you check?', a: 'Models from OpenAI, Perplexity and Anthropic, through their official APIs, with web search on and your location set. Every answer comes with the sources it cited. We’re not affiliated with any AI company.' },
  { q: 'Is this just SEO with a new name?', a: 'It overlaps, but it’s a different question: can an AI assistant reach your site, trust what it finds, and match it to what Google, the listing sites and your reviews say? The scan checks whether AI can reach your site and what it cites, and compares your Google reviews with the dealers around you.' },
  { q: 'Do you need my logins?', a: 'No. The scan uses public information only: your website, your listings and what the AI assistants say.' },
  { q: 'Can you make AI recommend my store first?', a: 'No one can honestly promise what an AI will say, and we don’t. What we can do is fix what keeps AI from reading and trusting your store, do the work every month, and show you the answers so you can judge it yourself.', allow: true },
  { q: 'What does it cost?', a: 'The scan and the walkthrough are free. If you want us to run it for you, plans start at $497 a month, month to month.' },
  { q: 'I’m already an AutoLander customer.', a: 'Then your store details are already on file. Your walkthrough can happen on your next call with us, and there’s no setup fee if you continue.' },
];

export function AiFaq() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading>Straight answers.</SectionHeading>
        <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-[#0b0d12]">
          {FAQ.map((item, i) => (
            <details key={item.q} className="group p-6" open={i === 0} {...(item.allow ? { 'data-claims-allow': '' } : {})}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="mt-1 text-xl leading-none text-blue-400 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiFinalCta({ onGo }) {
  return (
    <section className="relative overflow-hidden py-20 text-center lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeading>Find out what AI <Grad>says about your store.</Grad></SectionHeading>
        <div className="mt-9 flex justify-center">
          <ScanLink
            onGo={onGo}
            className="flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-6 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-2xl shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:w-auto sm:px-10 sm:text-xl"
          >
            Get my free scan
          </ScanLink>
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-slate-400">Free · No logins needed · Checked by a person</p>
      </div>
    </section>
  );
}

export function AiFooter() {
  return (
    <footer className="border-t border-white/5 bg-black py-10 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
        <img src="/autolander-logo-240.webp" srcSet="/autolander-logo-200.webp 200w, /autolander-logo-240.webp 240w, /autolander-logo.png 400w" sizes="94px" alt="AutoLander" width="400" height="120" loading="lazy" decoding="async" className="h-7 w-auto opacity-80" />
        <p className="max-w-xl text-center sm:text-right">
          © 2026 AutoLander · Not affiliated with OpenAI, Perplexity, Anthropic, Google or any AI company; product names belong to their owners.{' '}
          <a className="hover:text-slate-300" href="/privacy.html">Privacy</a> · <a className="hover:text-slate-300" href="/terms.html">Terms</a>
        </p>
      </div>
    </footer>
  );
}

// Phone-only bar: appears after the hero and hides while the form itself is on screen.
export function AiMobileCtaBar({ onGo, formRef }) {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const observed = useRef(null);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 560);
    const first = window.requestAnimationFrame(onScroll); // first read a frame later: no forced reflow on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(first);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const el = formRef?.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    observed.current = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.05 });
    observed.current.observe(el);
    return () => observed.current?.disconnect();
  }, [formRef]);

  const show = pastHero && !formVisible;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'max(0.7rem, env(safe-area-inset-bottom))' }}
      inert={!show}
    >
      <ScanLink
        onGo={onGo}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 active:scale-[0.99]"
      >
        Get my free scan
        <ArrowRight className="h-4 w-4" />
      </ScanLink>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
        Free · no logins · checked by a person
      </p>
    </div>
  );
}
