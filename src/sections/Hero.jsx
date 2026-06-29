import { useEffect, useState } from 'react';
import { ArrowRight, Facebook, ShieldCheck, MessageSquareText, Zap } from 'lucide-react';
import { Eyebrow, StaticStat } from './StaticUi.jsx';

// Generic, badge-free inventory — the imagery is emblem-free and the copy is
// brand-free on purpose (no fabricated makes/models).
const LISTINGS = [
  {
    img: '/preview/listing-truck-240.webp',
    srcSet: '/preview/listing-truck-160.webp 160w, /preview/listing-truck-240.webp 240w, /preview/listing-truck.webp 1100w',
    title: 'Crew-Cab Pickup',
    meta: '2023 · 18,420 mi · $38,900',
    city: 'Dallas, TX',
  },
  {
    img: '/preview/listing-suv-240.webp',
    srcSet: '/preview/listing-suv-160.webp 160w, /preview/listing-suv-240.webp 240w, /preview/listing-suv.webp 1100w',
    title: 'Midsize SUV',
    meta: '2024 · 9,310 mi · $31,250',
    city: 'Austin, TX',
  },
  {
    img: '/preview/listing-sedan-240.webp',
    srcSet: '/preview/listing-sedan-160.webp 160w, /preview/listing-sedan-240.webp 240w, /preview/listing-sedan.webp 1100w',
    title: 'Sport Sedan',
    meta: '2023 · 12,480 mi · $27,600',
    city: 'Houston, TX',
  },
];

function StatusChip({ status }) {
  if (status === 'live') {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
      </span>
    );
  }
  if (status === 'posting') {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-blue-300">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 motion-safe:animate-pulse" /> Posting
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
      Queued
    </span>
  );
}

// The signature element: a live product surface that turns inventory into
// live Marketplace listings, one by one — the execution gap, visualized.
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reduce;
}

function PostingEngine() {
  const reduce = usePrefersReducedMotion();
  const [live, setLive] = useState(reduce ? LISTINGS.length : 0);
  const [pingIndex, setPingIndex] = useState(reduce ? 0 : -1);

  useEffect(() => {
    if (reduce) return undefined;
    const timers = LISTINGS.map((_, i) => setTimeout(() => setLive(i + 1), 600 + i * 750));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return undefined;
    let i = 0;
    const start = setTimeout(() => setPingIndex(0), 2600);
    const id = setInterval(() => {
      i = (i + 1) % LISTINGS.length;
      setPingIndex(i);
    }, 2800);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [reduce]);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-[80px]" aria-hidden="true" />
      <div className="rounded-3xl border border-white/10 bg-[#0b0d12]/90 p-4 shadow-2xl shadow-blue-950/50 backdrop-blur-xl sm:p-5">
        {/* dashboard header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Marketplace Queue — Live
          </div>
          <Facebook className="h-4 w-4 text-blue-400" />
        </div>

        {/* live counter */}
        <div className="flex items-end justify-between py-4">
          <StaticStat value={312} label="Total cars posted" />
          <div className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-widest text-emerald-400">
            ▲ 30 / hr
            <br />
            <span className="text-slate-400">6.5× manual</span>
          </div>
        </div>

        {/* inventory → listing cards */}
        <div className="space-y-2.5">
          {LISTINGS.map((car, i) => {
            const status = i < live ? 'live' : i === live ? 'posting' : 'queued';
            return (
              <div
                key={car.title}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5"
              >
                <img
                  src={car.img}
                  srcSet={car.srcSet}
                  sizes="(min-width: 640px) 80px, 64px"
                  alt=""
                  width="120"
                  height="90"
                  loading="eager"
                  decoding="async"
                  className="h-12 w-16 shrink-0 rounded-lg object-cover sm:h-14 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{car.title}</p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-wider text-slate-400">{car.meta}</p>
                </div>
                <StatusChip status={status} />
              </div>
            );
          })}
        </div>

        {/* buyer-conversation ping */}
        <div className="relative mt-3 h-9">
          <>
            {pingIndex >= 0 && (
              <div
                key={pingIndex}
                className="absolute inset-0 flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3"
              >
                <MessageSquareText className="h-4 w-4 shrink-0 text-blue-300" />
                <span className="truncate font-mono text-[11px] text-blue-100">
                  New buyer message — {LISTINGS[pingIndex].city}
                </span>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}

function useShouldShowPostingEngine() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    if (show || typeof window === 'undefined' || !window.matchMedia) return undefined;

    let timerId = null;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const reveal = () => setShow(true);
    const onMediaChange = () => {
      if (mediaQuery.matches) reveal();
    };

    timerId = window.setTimeout(reveal, 10000);
    window.addEventListener('scroll', reveal, { once: true, passive: true });
    window.addEventListener('touchstart', reveal, { once: true, passive: true });
    window.addEventListener('wheel', reveal, { once: true, passive: true });
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('touchstart', reveal);
      window.removeEventListener('wheel', reveal);
      mediaQuery.removeEventListener('change', onMediaChange);
    };
  }, [show]);

  return show;
}

export default function Hero({ openDemoBooking, onWarmDemo }) {
  const showPostingEngine = useShouldShowPostingEngine();
  const demoIntentHandlers = {
    onPointerEnter: onWarmDemo,
    onPointerDown: onWarmDemo,
    onFocus: onWarmDemo,
    onTouchStart: onWarmDemo,
  };
  // Each gradient word is its own inline-block so the italic overhang of its
  // final glyph (e.g. the "2" in 8–12) isn't clipped by bg-clip-text on a line wrap.
  const gradWord =
    'inline-block bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text text-transparent pr-[0.14em]';
  return (
    <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:min-h-[600px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <div className="max-w-2xl">
        <div>
          <Eyebrow>Facebook Marketplace Automation — For Dealers &amp; Sales Reps</Eyebrow>
        </div>

        <div>
          <h1 className="mt-6 text-balance font-display text-5xl font-extrabold uppercase italic leading-[0.9] tracking-[-0.01em] text-white sm:text-6xl lg:text-7xl">
            Sell{' '}
            <span className={gradWord}>8&ndash;12</span>{' '}
            <span className={gradWord}>more</span>{' '}
            <span className={gradWord}>cars</span>{' '}
            a month on{' '}
            <span className={gradWord}>autopilot.</span>
          </h1>
        </div>

        <div>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">
            AutoLander auto-posts, updates, and tracks your entire inventory on Facebook
            Marketplace — 20 cars in minutes, not hours. More buyer conversations, zero manual work.
          </p>
        </div>

        <div>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              {...demoIntentHandlers}
              onClick={openDemoBooking}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-9 py-5 font-display text-lg font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:w-auto"
            >
              Apply for a Demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              {...demoIntentHandlers}
              onClick={openDemoBooking}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-5 font-display text-lg font-bold uppercase italic tracking-tight text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Apply for Access
            </button>
          </div>
        </div>

        <div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" /> 5 free posts on your demo
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> No credit card
            </span>
            <span>$39/mo · Cancel anytime</span>
          </div>
        </div>
      </div>

      <div className="w-full min-h-[360px] lg:min-h-0">
        {showPostingEngine && <PostingEngine />}
      </div>
    </div>
  );
}
