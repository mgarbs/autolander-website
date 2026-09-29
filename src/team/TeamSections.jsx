import { useEffect, useRef, useState } from 'react';
import { scrollBehavior } from './scroll.js';

/**
 * Presentational sections for /team (dealer owners, GMs and sales managers).
 * Logic-free apart from the seat calculator's own inputs; the demo form, tracking
 * and routing live in TeamApp.jsx. Copy rules: every product line here is the
 * site's own claim (pricing card, FAQ, feature copy) or a sourced support answer.
 */

// Inline icons (no icon-library import), so this lazy chunk shares nothing new with the homepage chunks.
const ArrowRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
);
const Play = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);
const Zap = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9z" /></svg>
);
const ShieldCheck = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);

// WebP copies (1600px) of /training/manuals/assets/dashboard.png and team.png: 43 KB and 26 KB instead of 377 KB and 223 KB.
const DASHBOARD_IMG = '/team/dashboard.webp';
const TEAM_IMG = '/team/team-access.webp';
const BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
// The AutoLander demo video, chapter 07:05-07:35 "Give managers a view of the team".
const MANAGER_VIEW_EMBED = 'https://www.youtube-nocookie.com/embed/i5uUB5OxIhk?start=425&end=455&autoplay=1&mute=1&rel=0&playsinline=1';
// The demo's chapter 02:19 'Let AutoPilot handle the ongoing routine' (to 03:20); the poster is its 03:08 frame.
const AUTOPILOT_EMBED = 'https://www.youtube-nocookie.com/embed/i5uUB5OxIhk?start=139&end=200&autoplay=1&mute=1&rel=0&playsinline=1';
const AUTOPILOT_IMG = '/team/autopilot.webp';

// Plain-text feed names, exactly as the homepage trust strip lists them (no third-party logos).
const FEEDS = ['CarGurus', 'Cars.com', 'vAuto', 'DealerCenter', 'DealerTrack', 'VINCue', 'Tekion', 'CDK'];

const TIERS = [
  { name: 'Starter', price: 39, posts: 5 },
  { name: 'Growth', price: 59, posts: 10 },
  { name: 'Pro', price: 79, posts: 15 },
];

// Verbatim from scripts/seo/data-testimonials.mjs, same attribution. Only customers who are active today (support's
// health check 09-27: Jim / Cox Chevrolet cancels 10-12 and Jullian / Lexus of Montgomery churned 8-13, so both are
// out; an endorsement is used only while the endorser still holds the view). Store names: Romeo's call, 09-27.
const QUOTES = [
  { text: 'I’ve sold 3 in a week from AutoLander. It’s doing great. I had 15 people message me yesterday.', who: 'Zac', role: 'Sales rep, Westgate' },
  { text: 'Very happy with the service so far. Thanks to you guys for getting me up and running so quickly. I would refer, but I don’t need the competition, lol.', who: 'David', role: 'Pine Belt Chevrolet' },
  { text: 'It’s working great, thanks for your diligence!', who: 'Sergio', role: 'Franks Irvine Subaru' },
];
const QUOTE_NOTE = 'Quotes are from customer messages to the AutoLander team, September 2026, reproduced word for '
  + 'word with first names and dealerships only. Results are what those customers reported, not a promise.';

const FAQ = [
  {
    q: 'Will my salespeople actually use it?',
    a: 'They barely have to touch it. One switch turns on AutoPilot, and it posts through their own Facebook profile, updates prices and marks sold units by itself. You’ll see who’s posting in the Manager Dashboard.',
  },
  {
    q: 'How fast can we be live?',
    a: 'If your cars are on CarGurus or Cars.com, we can set you up right on the demo call. Other feeds connect through your vendor’s export, and we set it up with you.',
  },
  {
    q: 'My salespeople already post on Marketplace. What changes?',
    a: 'They stop typing listings. AutoPilot works through your whole inventory from your feed, keeps prices current and marks sold units, day and night, and you see who is posting and what is live, rep by rep.',
  },
  { q: 'Do I pay for my managers?', a: 'No. Only salespeople who post take a paid seat. Managers see the dashboard free.' },
  {
    q: 'Only 1 or 2 salespeople?',
    a: 'The individual plans ($39, $59 or $79 each) are simpler. The Dealer Plan starts at 3 seats and adds the Manager Dashboard, because that’s where it pays off.',
  },
  {
    q: 'What happens when a salesperson leaves?',
    a: 'Remove them under Configuration → Team (the trash icon on their row), and their posting seat opens up for your next hire the same day. Free Marketplace vehicle listings are posted from personal profiles, so their existing listings stay on their own profile. We can’t move them.',
  },
  {
    q: 'Does it work with our feed or DMS?',
    a: 'CarGurus and Cars.com connect directly, and many dealer websites load directly too. Other systems (vAuto, DealerCenter, DealerTrack, VINCue, Tekion, CDK) connect through a dealer-authorized export in a supported format. We confirm yours before you buy.',
  },
  {
    q: 'Where does AutoPilot run?',
    a: 'In the AutoLander desktop app on each salesperson’s computer, Windows or Mac. Leave AutoLander open and flip on AutoPilot: it keeps the computer awake and keeps working day and night, even after they leave the lot. Laptops stay open and plugged in.',
  },
  { q: 'How many cars a day?', a: 'Per salesperson: Starter 5, Growth 10, Pro 15 posts a day. AutoPilot spreads them across the hours you choose.' },
  {
    q: 'Will prices and sold cars stay right?',
    a: 'Yes. AutoPilot updates prices and pulls sold units down from your feed on its own, AutoLander renews eligible listings, and sold units show up as alerts in your dashboard.',
  },
  {
    q: 'Who talks to the buyers?',
    a: 'Your salespeople, in Messenger. That’s the part that sells cars. AutoPilot does the posting so they spend their time closing, not typing.',
  },
  {
    q: 'Do I drop CarGurus or Cars.com?',
    a: 'No. AutoLander uses the inventory you already list. Marketplace is one more place your local buyers find it.',
  },
  { q: 'Can I cancel?', a: 'Yes. Month to month, no contract. Your demo includes 5 free posts, no card.' },
];

// Same classes as SectionHeading in sections/StaticUi.jsx. A local copy on purpose: /team imports
// nothing from the homepage modules, so the homepage chunks build byte-for-byte as before.
const SectionHeading = ({ children, className = '', as: Tag = 'h2' }) => (
  <Tag
    className={`font-display text-[clamp(2rem,9vw,2.25rem)] font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl ${className}`}
  >
    {children}
  </Tag>
);

export const Grad = ({ children, tone = 'blue' }) => (
  <span
    className={tone === 'green'
      ? 'inline box-decoration-clone bg-gradient-to-b from-emerald-300 to-emerald-600 bg-clip-text pr-[0.14em] text-transparent'
      : 'inline box-decoration-clone bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text pr-[0.14em] text-transparent'}
  >
    {children}
  </span>
);

const Eyebrow = ({ children, tone = 'blue' }) => (
  <span
    className={`flex max-w-full items-start gap-2.5 font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.28em] ${tone === 'green' ? 'text-emerald-300/90' : 'text-blue-300/90'}`}
  >
    <span
      className={`mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-[2px] ${tone === 'green'
        ? 'bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]'
        : 'bg-blue-400 shadow-[0_0_12px_2px_rgba(96,165,250,0.65)]'}`}
    />
    <span className="min-w-0">{children}</span>
  </span>
);

// Every demo button carries the homepage's trigger contract (pointerdown opens, focus/hover warms).
const DemoButton = ({ onBook, onWarm, className, children }) => (
  <button
    type="button"
    data-demo-application-trigger="true"
    onPointerEnter={onWarm}
    onPointerDown={onBook}
    onFocus={onWarm}
    onTouchStart={onWarm}
    onClick={onBook}
    className={className}
  >
    {children}
  </button>
);

const PRIMARY_CTA = 'group flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:w-auto sm:px-8 sm:text-lg';

export function TeamHeader({ onBook, onWarm }) {
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
        <DemoButton
          onBook={onBook}
          onWarm={onWarm}
          className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow transition-all hover:bg-blue-500 hover:text-white active:scale-95 sm:px-6 sm:py-2.5 sm:text-sm"
        >
          Book Team Demo
        </DemoButton>
      </div>
    </header>
  );
}

export function TeamHero({ headline, sub, onBook, onWarm, onWatch, watch = 'autopilot' }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-10 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="min-w-0 max-w-2xl">
          <Eyebrow>For dealers, GMs &amp; sales managers · 3+ salespeople</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(2rem,8.6vw,2.6rem)] font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-6xl lg:text-[3.5rem]">
            {headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">{sub}</p>
          <p className="mt-4 max-w-xl text-base font-bold leading-snug text-white sm:text-lg">Free 30-minute demo: we post up to 5 of your own cars while you watch, whether you buy or not.</p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:items-start">
            <DemoButton onBook={onBook} onWarm={onWarm} className={PRIMARY_CTA}>
              Book your free team demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </DemoButton>
            <button
              type="button"
              onClick={onWatch}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/10 px-5 py-3.5 text-sm font-bold text-slate-200 transition hover:border-blue-400/40 hover:bg-white/5 sm:justify-start sm:border-transparent sm:px-1 sm:py-1"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                <Play className="ml-0.5 h-3 w-3" />
              </span>
              {watch === 'manager'
                ? <>Watch the manager view <span className="text-slate-400">(30 sec)</span></>
                : <>Watch AutoPilot run <span className="text-slate-400">(60 sec)</span></>}
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">6 quick questions. Then pick your time from the link we send you.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <span className="text-slate-200">More than 200 dealerships on AutoLander</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-blue-400" />5 free posts in your demo</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" />No credit card</span>
            <span>Month to month</span>
            <span className="text-emerald-400">Team plans from $117/mo</span>
          </div>
        </div>

        {/* The real Manager Dashboard (desktop only; the phone keeps the fold for the CTA). */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-[80px]" aria-hidden="true" />
          <figure className="m-0 rounded-3xl border border-white/10 bg-[#0b0d12]/90 p-3 shadow-2xl shadow-blue-950/50">
            <div className="flex items-center justify-between px-2 pb-2.5">
              <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Manager Dashboard
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-300">Dealer Plan</span>
            </div>
            {/* <picture>: phones (where this column is hidden) never download the screenshot. */}
            <picture>
              <source media="(min-width: 1024px)" srcSet={DASHBOARD_IMG} />
              <img
                src={BLANK_GIF}
                alt="The AutoLander Manager Dashboard: posts today, active listings across the team, sold on AutoLander, average posts per rep, team presence, team performance and a live activity feed"
                width="1600"
                height="900"
                decoding="async"
                fetchPriority="high"
                className="w-full rounded-2xl border border-white/5"
              />
            </picture>
            <figcaption className="px-2 pt-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-slate-400">Real app screen · names hidden</figcaption>
          </figure>
          <div className="absolute -bottom-5 -left-6 rounded-2xl border border-emerald-400/20 bg-[#0b0d12] px-4 py-3 shadow-xl">
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">Managers are free</p>
            <p className="mt-0.5 text-sm font-bold text-white">Only salespeople who post take a seat</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeedStrip() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-8" aria-label="Inventory sources">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Syncs from your inventory feed &amp; DMS</p>
        <p className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 font-display text-sm font-extrabold uppercase italic tracking-tight text-slate-400 sm:text-base">
          {FEEDS.map((name) => <span key={name}>{name}</span>)}
        </p>
        <p className="mt-3 text-xs text-slate-400">CarGurus and Cars.com connect directly. Other systems connect through a dealer-authorized export; we confirm the format with you before you buy.</p>
      </div>
    </section>
  );
}

export function FloorCheck({ onBook, onWarm }) {
  const [stock, setStock] = useState('80');
  const [live, setLive] = useState('10');
  const s = Math.max(0, Number.parseInt(stock, 10) || 0);
  const l = Math.max(0, Number.parseInt(live, 10) || 0);
  const gap = Math.max(0, s - l);

  return (
    <section id="floor-check" className="py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>The 60-second floor check</Eyebrow>
          <SectionHeading className="mt-5"><Grad>Count</Grad> what’s actually up.</SectionHeading>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Put in your best guess. If you’ve already searched your store on Marketplace, use the real count.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-[#0b0d12] p-6 sm:p-8">
          <div className="grid grid-cols-2 items-end gap-3">
            <label className="block">
              <span className="text-sm font-bold text-slate-200">Cars on your lot</span>
              <input type="number" inputMode="numeric" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-3 font-display text-2xl font-extrabold italic text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-200">Live on Marketplace</span>
              <input type="number" inputMode="numeric" min="0" value={live} onChange={(e) => setLive(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-3 font-display text-2xl font-extrabold italic text-white" />
            </label>
          </div>
          <div className="mt-5 rounded-2xl border border-blue-400/25 bg-blue-500/[0.07] p-5" aria-live="polite">
            {gap > 0 ? (
              <>
                <p className="font-display text-5xl font-extrabold italic text-white">{gap} <span className="text-2xl">cars</span></p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">of your {s} that a Marketplace shopper can’t find from your store tonight.</p>
              </>
            ) : (
              <>
                <p className="font-display text-3xl font-extrabold italic text-white">Every car is up.</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Now check the prices against the window sticker, and whether the sold ones came down.</p>
              </>
            )}
          </div>
          <DemoButton
            onBook={onBook}
            onWarm={onWarm}
            className="mt-5 flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-4 py-4 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:text-lg"
          >
            Get 5 of them live, free
          </DemoButton>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">Your numbers, your lot.</p>
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  { tag: '01 · Consistency', title: 'Month one, everyone posts.', body: 'Month three, it’s quiet. Not because your people don’t care. A daily job always loses to the customer standing in front of them.' },
  { tag: '02 · Visibility', title: 'You stopped asking.', body: 'Who posted this week? Which units are live? The question slowly comes off the meeting agenda, and the lot goes half-listed.' },
  { tag: '03 · Accuracy', title: 'Ghost inventory.', body: 'Sold units still up, pulling messages. The price cut you approved on Tuesday never made it to Marketplace.' },
  { tag: '04 · Turnover', title: 'A rep leaves. So do their listings.', body: 'Free Marketplace vehicle listings live on personal profiles. When a salesperson goes, their listings go with them, and your next hire starts from zero.' },
];

export function ProblemSection() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>The real problem</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">It’s not a people problem. It’s a <Grad>daily job</Grad> nobody has time for.</SectionHeading>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">It’s 9 PM. The showroom’s dark, and your buyers are on the couch scrolling Marketplace. Whether they find your cars tonight comes down to who had a spare minute today. Meanwhile your aged units keep aging on floorplan, and the buyer looking for exactly that truck is messaging the store down the road. Keeping a whole lot posted, priced right and cleaned up is a job that rebuilds itself every night.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => (
            <div key={p.tag} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">{p.tag}</p>
              <h3 className="mt-3 font-display text-xl font-extrabold uppercase italic leading-tight text-white">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ autopilotOn = false, onPlayAutopilot }) {
  const frameRef = useRef(null);
  // After Play the button is gone: focus moves into the video instead of dropping to the page (audit F6).
  useEffect(() => {
    if (autopilotOn) frameRef.current?.focus({ preventScroll: true });
  }, [autopilotOn]);
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>How it works</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">AutoPilot does the posting. <Grad>Your people do the selling.</Grad></SectionHeading>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">You don’t need better compliance. You need a system that doesn’t depend on anyone’s memory. With AutoPilot, month three looks like month one.</p>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#0b0d12] p-7">
            <p className="font-display text-5xl font-extrabold italic text-blue-500/80">01</p>
            <h3 className="mt-4 font-display text-2xl font-extrabold uppercase italic text-white">Connect your inventory once</h3>
            <p className="mt-3 leading-relaxed text-slate-400">Your cars load from your feed or listing site: VIN, price, trim, specs and photos, mapped from the source.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0b0d12] p-7">
            <p className="font-display text-5xl font-extrabold italic text-blue-500/80">02</p>
            <h3 className="mt-4 font-display text-2xl font-extrabold uppercase italic text-white">Flip on AutoPilot</h3>
            <p className="mt-3 leading-relaxed text-slate-400">One switch per salesperson. AutoPilot posts new cars from your feed through their own Facebook profile, updates prices and pulls sold units down, spread across the hours you choose. It keeps the computer awake and keeps working day and night, even when they’re off the lot. Nothing to type, nothing to remember.</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/20 bg-[#0b0d12] p-7">
            <p className="font-display text-5xl font-extrabold italic text-emerald-400/80">03</p>
            <h3 className="mt-4 font-display text-2xl font-extrabold uppercase italic text-white">You see all of it</h3>
            <p className="mt-3 leading-relaxed text-slate-400">Posts, live listings, sold units and who’s online, rep by rep, in the Manager Dashboard. Sold units show up as alerts, so nothing slips.</p>
          </div>
        </div>
        <div id="autopilot" className="mx-auto mt-6 max-w-4xl scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12] shadow-2xl shadow-black/60">
          <div className="relative aspect-video w-full">
            {autopilotOn ? (
              <iframe
                ref={frameRef}
                className="absolute inset-0 h-full w-full"
                src={AUTOPILOT_EMBED}
                title="AutoLander demo: AutoPilot"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={onPlayAutopilot}
                className="group absolute inset-0 h-full w-full"
              >
                <img
                  src={AUTOPILOT_IMG}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width="1600"
                  height="900"
                  className="h-full w-full object-cover object-top opacity-80 transition group-hover:opacity-100"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-600/40 transition group-hover:scale-105">
                  <Play className="ml-1 h-8 w-8 text-white" />
                </span>
                <span className="absolute bottom-4 left-4 right-4 text-left font-mono text-[11px] uppercase tracking-wider text-slate-200">Watch AutoPilot run <span aria-hidden="true">·</span> 60 sec <span aria-hidden="true">·</span> from the AutoLander demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const DASH_POINTS = [
  ['Posts', 'Today, this week, this month, and the average per rep.'],
  ['Active listings', 'What’s live across your whole team right now.'],
  ['Sold on AutoLander', 'Cars sold from AutoLander posts, rep by rep, from post attribution.'],
  ['Team presence & live feed', 'Who’s online, plus a live feed of posts and sold units.'],
];

export function DashboardSection({ videoOn, onPlay }) {
  const frameRef = useRef(null);
  useEffect(() => {
    if (videoOn) frameRef.current?.focus({ preventScroll: true });
  }, [videoOn]);
  return (
    <section id="dashboard" className="border-y border-white/5 bg-[#080808] py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow tone="green">The Manager Dashboard</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">Know how your floor is tracking. <Grad tone="green">Without asking.</Grad></SectionHeading>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">Accountability without the nagging. Open one screen and you see today, this week or this month: every rep’s posts, what’s live across the team, what sold on AutoLander, and who’s online right now.</p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12] shadow-2xl shadow-black/60">
            <div className="relative aspect-video w-full">
              {videoOn ? (
                <iframe
                  ref={frameRef}
                  className="absolute inset-0 h-full w-full"
                  src={MANAGER_VIEW_EMBED}
                  title="AutoLander demo: the manager view"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={onPlay}
                  className="group absolute inset-0 h-full w-full"
                >
                  <img
                    src={DASHBOARD_IMG}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover object-top opacity-80 transition group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-600/40 transition group-hover:scale-105">
                    <Play className="ml-1 h-8 w-8 text-white" />
                  </span>
                  <span className="absolute bottom-4 left-4 right-4 text-left font-mono text-[11px] uppercase tracking-wider text-slate-200">Watch the manager view <span aria-hidden="true">·</span> 30 sec <span aria-hidden="true">·</span> from the AutoLander demo</span>
                </button>
              )}
            </div>
          </div>
          <ul className="m-0 grid list-none gap-3 p-0">
            {DASH_POINTS.map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">{t}</p>
                <p className="mt-1 text-sm text-slate-300">{d}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid items-center gap-6 rounded-3xl border border-emerald-400/15 bg-[#0b0d12] p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Team access</p>
            <h3 className="mt-3 font-display text-3xl font-extrabold uppercase italic leading-tight text-white">Pay per posting seat. <Grad tone="green">Add your managers free.</Grad></h3>
            <p className="mt-3 leading-relaxed text-slate-400">Posting seats and Manager Dashboard access are set separately. Your GM, sales manager or desk can watch the dashboard without taking a seat. When a salesperson leaves, remove them: their seat and your inventory feed stay with the store, so your next hire flips on AutoPilot and posts from the same feed.</p>
          </div>
          <img
            src={TEAM_IMG}
            alt="AutoLander Team Access screen: posting seats and Manager Dashboard access set per person, names hidden"
            loading="lazy"
            decoding="async"
            width="1920"
            height="1080"
            className="w-full rounded-2xl border border-white/5"
          />
        </div>
      </div>
    </section>
  );
}

const DEMO_STEPS = [
  { n: '1', title: 'We pull up your inventory', body: 'From your feed or listing site, so you see your own units, not a sample.' },
  { n: '2', title: '5 free posts in your demo', body: 'Your own cars, live on Marketplace from the Facebook profile of whoever is at the computer. Bring a salesperson if you’d rather it’s theirs. No credit card.' },
  { n: '3', title: 'AutoPilot and the Manager Dashboard', body: 'How AutoPilot would run each salesperson’s posting hours, and the screen where you’d see every rep’s posts, live listings and sold units.', green: true },
  { n: '4', title: 'Your team’s price, seat by seat', body: '$39 per sales rep. Month to month, no contract.' },
];

export function DemoSection({ onBook, onWarm }) {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-20 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>Your free team demo</Eyebrow>
          <SectionHeading className="mt-5">30 minutes. <Grad>Your cars.</Grad> Live while you watch.</SectionHeading>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">No slides. We look at your inventory link before the call, so the demo runs on your own cars. Bring whoever else signs off: your GM, a partner or your sales manager.</p>
          <div className="mt-8 hidden lg:block">
            <DemoButton onBook={onBook} onWarm={onWarm} className={PRIMARY_CTA}>Book your free team demo</DemoButton>
          </div>
        </div>
        <ol className="m-0 grid list-none gap-3 p-0">
          {DEMO_STEPS.map((s) => (
            <li key={s.n} className={`flex gap-4 rounded-2xl border bg-white/[0.03] p-5 ${s.green ? 'border-emerald-400/20' : 'border-white/10'}`}>
              <span className={`font-display text-3xl font-extrabold italic ${s.green ? 'text-emerald-400/80' : 'text-blue-500/80'}`}>{s.n}</span>
              <div>
                <p className="font-bold text-white">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>
            </li>
          ))}
          <li className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-relaxed text-amber-100">
            <span className="font-bold">Pick a time you’ll be at a computer.</span> AutoLander runs on Windows or Mac, not on a phone, and the demo happens on your screen.
          </li>
        </ol>
      </div>
    </section>
  );
}

function money(n) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function SeatCalculator() {
  const [reps, setReps] = useState(5);
  const [tierIndex, setTierIndex] = useState(0);
  const [gross, setGross] = useState('1500');
  const seats = Math.max(3, Math.min(60, Number.parseInt(reps, 10) || 3));
  const tier = TIERS[tierIndex];
  const month = seats * tier.price;
  const grossValue = Math.max(0, Number.parseFloat(gross) || 0);
  const setSeats = (n) => setReps(Math.max(3, Math.min(60, n)));

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#0b0d12] p-5 sm:p-9">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Your math</p>
      <h3 className="mt-3 font-display text-2xl font-extrabold uppercase italic text-white">What your floor would cost</h3>
      <div className="mt-6">
        <label htmlFor="tm-reps" className="text-sm font-bold text-slate-200">Salespeople who’ll post</label>
        <div className="mt-2 flex items-center gap-3">
          <button type="button" onClick={() => setSeats(seats - 1)} className="h-11 w-11 rounded-xl border border-white/10 text-xl font-bold text-white hover:bg-white/5" aria-label="One fewer salesperson">−</button>
          <input
            id="tm-reps"
            type="number"
            inputMode="numeric"
            min="3"
            max="60"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onBlur={() => setSeats(seats)}
            className="h-11 w-20 rounded-xl border border-white/10 bg-black/40 text-center font-display text-2xl font-extrabold italic text-white"
          />
          <button type="button" onClick={() => setSeats(seats + 1)} className="h-11 w-11 rounded-xl border border-white/10 text-xl font-bold text-white hover:bg-white/5" aria-label="One more salesperson">+</button>
          <span className="text-xs text-slate-400">minimum 3</span>
        </div>
      </div>
      <fieldset className="mt-6 border-0 p-0">
        <legend className="text-sm font-bold text-slate-200">Plan per salesperson</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TIERS.map((t, i) => (
            <label key={t.name} className="cursor-pointer">
              <input type="radio" name="tm-tier" className="peer sr-only" checked={tierIndex === i} onChange={() => setTierIndex(i)} />
              <span className="block rounded-xl border border-white/10 p-3 text-center peer-checked:border-blue-400 peer-checked:bg-blue-500/10 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400">
                <span className="block font-bold text-white">{t.name}</span>
                <span className="block text-xs text-slate-400">${t.price} · {t.posts}/day</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6">
        <label htmlFor="tm-gross" className="text-sm font-bold text-slate-200">Your average gross per car <span className="font-normal text-slate-400">(your number)</span></label>
        <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-black/40 px-3 focus-within:ring-2 focus-within:ring-blue-400">
          <span className="text-slate-400">$</span>
          <input id="tm-gross" type="number" inputMode="numeric" min="0" step="50" value={gross} onChange={(e) => setGross(e.target.value)} className="h-11 w-full bg-transparent px-2 font-bold text-white outline-none" />
        </div>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Per month</p>
          <p className="mt-1 font-display text-2xl font-extrabold italic text-white sm:text-3xl">{money(month)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Per rep / day</p>
          <p className="mt-1 font-display text-2xl font-extrabold italic text-white sm:text-3xl">${(tier.price / 30).toFixed(2)}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Team posts / day, max</p>
          <p className="mt-1 font-display text-2xl font-extrabold italic text-white sm:text-3xl">{seats * tier.posts}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">One extra car sold covers</p>
          <p className="mt-1 font-display text-2xl font-extrabold italic text-white sm:text-3xl">{grossValue > 0 ? `${(grossValue / month).toFixed(1)} months` : 'enter gross'}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-400">Your own numbers, not a promise of results. Prices plus any applicable tax. Managers don’t take a seat.</p>
    </div>
  );
}

const PLAN_LINES = [
  // The homepage Dealer Plan card, word for word…
  'Everything in Pro',
  'Minimum 3 Seats — Any Tier Mix',
  'Starter $39 • Growth $59 • Pro $79 per seat',
  'Live Manager Dashboard',
  'Real-Time Team Presence',
  'Post Attribution + Analytics',
  'AI Studio welcome credits scale with team size',
  // …plus two true lines for this buyer.
  'Managers free: only salespeople who post take a seat',
  'Month to month, no contract',
];

export function PricingSection({ onBook, onWarm }) {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow tone="green">Simple team pricing</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">$39 per sales rep. <Grad tone="green">Team plans from $117 a month.</Grad></SectionHeading>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">Pay per posting seat. Your managers watch the dashboard free. Mix plans however your floor works, and add seats anytime.</p>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
          <div className="relative rounded-[2rem] border border-emerald-400/30 bg-[#06100c] p-7 shadow-[0_0_60px_-20px_rgba(16,185,129,0.45)] sm:p-9">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-black">For teams</span>
            <p className="font-display text-3xl font-extrabold uppercase italic text-white">Dealer Plan</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">From</span>
              <span className="font-display text-6xl font-extrabold italic text-white">$117</span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">/ month</span>
            </p>
            <p className="mt-3 font-bold italic text-emerald-400">Build Your Team — Any Mix of Seats</p>
            <p className="mt-2 text-sm italic text-slate-400">Build a team that scales with you. Mix tiers, add seats anytime.</p>
            <ul className="m-0 mt-6 grid list-none gap-3 p-0 text-[15px] font-medium text-slate-200">
              {PLAN_LINES.map((line) => (
                <li key={line} className="flex gap-3"><span className="text-emerald-400" aria-hidden="true">✓</span>{line}</li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-slate-400">
              Each salesperson’s plan sets their posts a day: <span className="text-slate-200">Starter 5 · Growth 10 · Pro 15.</span> AutoPilot posts them for you, paced across the hours you choose.
            </p>
            <DemoButton
              onBook={onBook}
              onWarm={onWarm}
              className="mt-6 flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-4 py-5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:px-8 sm:text-lg"
            >
              Book a free team demo
            </DemoButton>
          </div>
          <SeatCalculator />
        </div>
      </div>
    </section>
  );
}

export function ProofSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>What dealers say</Eyebrow>
        <SectionHeading className="mt-5 max-w-4xl">Hear it <Grad>from the floor.</Grad></SectionHeading>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">More than 200 dealerships are on AutoLander today. Here’s what salespeople and dealers told us.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {QUOTES.map((quote) => (
            <figure key={quote.who} className="m-0 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <blockquote className="m-0 text-lg leading-relaxed text-slate-100">“{quote.text}”</blockquote>
              <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-wider text-slate-400">{quote.who} · {quote.role}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-5 text-[13px] text-slate-400">{QUOTE_NOTE}</p>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="border-y border-white/5 bg-[#080808] py-20 lg:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Eyebrow>Owner questions</Eyebrow>
        <SectionHeading className="mt-5">Straight answers.</SectionHeading>
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

export function FinalCta({ onBook, onWarm }) {
  return (
    <section className="relative overflow-hidden py-20 text-center lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeading>Tonight your buyers will scroll Marketplace. <Grad>Make sure they find your cars.</Grad></SectionHeading>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">30 minutes on your own inventory: we post up to 5 of your cars while you watch, walk you through AutoPilot and the Manager Dashboard, and price your team.</p>
        <div className="mt-9 flex justify-center">
          <DemoButton
            onBook={onBook}
            onWarm={onWarm}
            className="flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-6 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-2xl shadow-blue-600/30 transition-colors hover:bg-blue-500 active:scale-95 sm:w-auto sm:px-10 sm:text-xl"
          >
            Book your free team demo
          </DemoButton>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">6 quick questions. Then pick your time from the link we send you.</p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-slate-400">5 free posts in your demo · No credit card · Month to month</p>
      </div>
    </section>
  );
}

export function TeamFooter() {
  return (
    <footer className="border-t border-white/5 bg-black py-10 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
        <img src="/autolander-logo-240.webp" srcSet="/autolander-logo-200.webp 200w, /autolander-logo-240.webp 240w, /autolander-logo.png 400w" sizes="94px" alt="AutoLander" width="400" height="120" loading="lazy" decoding="async" className="h-7 w-auto opacity-80" />
        <p>© 2026 AutoLander · <a className="hover:text-slate-300" href="/privacy.html">Privacy</a> · <a className="hover:text-slate-300" href="/terms.html">Terms</a></p>
      </div>
    </footer>
  );
}

// Same markup and behaviour as sections/MobileCtaBar.jsx (local copy for the same isolation reason).
export function TeamMobileCtaBar({ onBookDemo, onWarmDemo }) {
  const [show, setShow] = useState(false);
  const warmedRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    const first = window.requestAnimationFrame(onScroll); // first read a frame later: no forced reflow on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(first);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!show || warmedRef.current) return;
    warmedRef.current = true;
    onWarmDemo?.();
  }, [onWarmDemo, show]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'max(0.7rem, env(safe-area-inset-bottom))' }}
      inert={!show}
    >
      <DemoButton
        onBook={onBookDemo}
        onWarm={onWarmDemo}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 active:scale-[0.99]"
      >
        Book your free team demo
        <ArrowRight className="h-4 w-4" />
      </DemoButton>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
        5 free posts · no credit card · month to month
      </p>
    </div>
  );
}

export function Beam() {
  return <div className="tm-beam mx-auto max-w-5xl" aria-hidden="true" />;
}
