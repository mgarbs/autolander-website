import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Facebook, ShieldCheck, MessageSquareText, Zap } from 'lucide-react';
import { FadeIn, Eyebrow, Stat } from './_ui.jsx';

// Generic, badge-free inventory — the imagery is emblem-free and the copy is
// brand-free on purpose (no fabricated makes/models).
const LISTINGS = [
  { img: '/preview/listing-truck.webp', title: 'Crew-Cab Pickup', meta: '2023 · 18,420 mi · $38,900', city: 'Dallas, TX' },
  { img: '/preview/listing-suv.webp', title: 'Midsize SUV', meta: '2024 · 9,310 mi · $31,250', city: 'Austin, TX' },
  { img: '/preview/listing-sedan.webp', title: 'Sport Sedan', meta: '2023 · 12,480 mi · $27,600', city: 'Houston, TX' },
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
    <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
      Queued
    </span>
  );
}

// The signature element: a live product surface that turns inventory into
// live Marketplace listings, one by one — the execution gap, visualized.
function PostingEngine() {
  const reduce = useReducedMotion();
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
          <Stat value={312} label="Total cars posted" />
          <div className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-widest text-emerald-400">
            ▲ 30 / hr
            <br />
            <span className="text-slate-500">6.5× manual</span>
          </div>
        </div>

        {/* inventory → listing cards */}
        <div className="space-y-2.5">
          {LISTINGS.map((car, i) => {
            const status = i < live ? 'live' : i === live ? 'posting' : 'queued';
            return (
              <motion.div
                key={car.title}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.25 + i * 0.15, duration: 0.5 }}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5"
              >
                <img
                  src={car.img}
                  alt=""
                  width="120"
                  height="90"
                  loading="eager"
                  decoding="async"
                  className="h-12 w-16 shrink-0 rounded-lg object-cover sm:h-14 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{car.title}</p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">{car.meta}</p>
                </div>
                <StatusChip status={status} />
              </motion.div>
            );
          })}
        </div>

        {/* buyer-conversation ping */}
        <div className="relative mt-3 h-9">
          <AnimatePresence mode="wait">
            {pingIndex >= 0 && (
              <motion.div
                key={pingIndex}
                initial={reduce ? false : { opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -14 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3"
              >
                <MessageSquareText className="h-4 w-4 shrink-0 text-blue-300" />
                <span className="truncate font-mono text-[11px] text-blue-100">
                  New buyer message — {LISTINGS[pingIndex].city}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ openDemoBooking }) {
  // Each gradient word is its own inline-block so the italic overhang of its
  // final glyph (e.g. the "2" in 8–12) isn't clipped by bg-clip-text on a line wrap.
  const gradWord =
    'inline-block bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text text-transparent pr-[0.14em]';
  return (
    <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:min-h-[600px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <div className="max-w-2xl">
        <FadeIn>
          <Eyebrow>Facebook Marketplace Automation — For Dealers &amp; Sales Reps</Eyebrow>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h1 className="mt-6 text-balance font-display text-5xl font-extrabold uppercase italic leading-[0.9] tracking-[-0.01em] text-white sm:text-6xl lg:text-7xl">
            Sell{' '}
            <span className={gradWord}>8&ndash;12</span>{' '}
            <span className={gradWord}>more</span>{' '}
            <span className={gradWord}>cars</span>{' '}
            a month on{' '}
            <span className={gradWord}>autopilot.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">
            AutoLander auto-posts, updates, and tracks your entire inventory on Facebook
            Marketplace — 20 cars in minutes, not hours. More buyer conversations, zero manual work.
          </p>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={openDemoBooking}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-9 py-5 font-display text-lg font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 sm:w-auto"
            >
              Book a Demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <button
              onClick={openDemoBooking}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-5 font-display text-lg font-bold uppercase italic tracking-tight text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Start Free Trial
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.32}>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" /> 5 free posts on your demo
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> No credit card
            </span>
            <span>$39/mo · Cancel anytime</span>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.2} direction="left" className="w-full">
        <PostingEngine />
      </FadeIn>
    </div>
  );
}
