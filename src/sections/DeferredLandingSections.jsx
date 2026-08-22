import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  CarFront,
  CheckCircle2,
  Gift,
  HelpCircle,
  Layout,
  PlayCircle,
  RefreshCw,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import Audience from './Audience.jsx';
import { Eyebrow, SectionHeading } from './StaticUi.jsx';

const FadeIn = ({ children, className = '' }) => <div className={className}>{children}</div>;

// Kept local so the deferred landing bundle does not pull the animated UI helper.
const MailLink = ({ email = 'sales@autolander.ai', subject = 'AutoLander support', children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const su = encodeURIComponent(subject);
  const options = [
    { label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${su}` },
    { label: 'Outlook', href: `https://outlook.office.com/mail/deeplink/compose?to=${email}&subject=${su}` },
    { label: 'Default mail app', href: `mailto:${email}?subject=${su}` },
  ];

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const copy = () => {
    navigator.clipboard?.writeText(email)?.catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit' }}
        className={`cursor-pointer border-0 bg-transparent p-0 ${className}`}
      >
        {children}
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 z-[60] mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] p-1.5 text-left shadow-2xl shadow-blue-950/50">
          <p className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Email {email}</p>
          {options.map((o) => (
            <a
              key={o.label}
              href={o.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-200 transition hover:bg-white/10"
            >
              {o.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copy}
            className="block w-full rounded-xl px-3 py-2 text-left text-xs font-bold normal-case tracking-normal text-slate-200 transition hover:bg-white/10"
          >
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>
      )}
    </span>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="group h-full p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500">
    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-blue-500" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="relative flex flex-col items-center text-center px-2 sm:px-4">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-black text-white shadow-lg shadow-blue-500/15 sm:mb-6 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl sm:shadow-xl sm:shadow-blue-500/20">
      {number}
    </div>
    <h3 className="mb-2 text-lg font-bold uppercase tracking-tight text-white sm:mb-3 sm:text-xl">{title}</h3>
    <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-400">{desc}</p>
  </div>
);

const PRICING = [
    {
      name: "Starter",
      monthly: 39,
      annual: 29,
      posts: "5 Posts / Day",
      features: [
        "Instant Inventory Sync",
        "Auto Queue",
        "Standard AI Descriptions",
        "Feed Sync (Website / DMS / Custom Feeds / CarGurus / Cars.com)",
        "25 welcome AI Studio credits",
      ]
    },
    {
      name: "Growth",
      monthly: 59,
      annual: 44,
      posts: "10 Posts / Day",
      features: [
        "Everything in Starter",
        "Pro AI Descriptions",
        "Priority Syncing",
        "50 welcome AI Studio credits",
      ]
    },
    {
      name: "Pro",
      monthly: 79,
      annual: 59,
      posts: "15 Posts / Day",
      popular: true,
      features: [
        "Everything in Growth",
        "Unlimited Marketplace Support",
        "Concierge Setup",
        "Dedicated Support Agent",
        "150 welcome AI Studio credits",
      ]
    },
    {
      name: "Dealer Plan",
      monthly: 117,
      annual: 87,
      fromPrefix: true,
      posts: "Build Your Team — Any Mix of Seats",
      team: true,
      features: [
        "Everything in Pro",
        "Minimum 3 Seats — Any Tier Mix",
        "Starter $39 • Growth $59 • Pro $79 per seat",
        "Live Manager Dashboard",
        "Real-Time Team Presence",
        "Post Attribution + Analytics",
        "Welcome credits scale with team size",
      ]
    }
  ];

export default function DeferredLandingSections({
  isAnnual,
  setIsAnnual,
  studioView,
  setStudioView,
  videoLoaded,
  setVideoLoaded,
  hasReferral,
  isMonthlyBilling,
  referralCode,
  showDownloadButtons,
  openDownload,
  openDemoBooking,
  onWarmDemo,
}) {
  const pricing = PRICING;
  const demoIntentHandlers = {
    'data-demo-application-trigger': 'true',
    onPointerEnter: onWarmDemo,
    onPointerDown: openDemoBooking,
    onFocus: onWarmDemo,
    onTouchStart: onWarmDemo,
  };

  return (
    <>
      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 lg:mb-32">
            <FadeIn>
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                HOW AUTOLANDER <span className="text-blue-500">WORKS.</span>
              </h2>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            <FadeIn delay={0.1}>
              <Step 
                number="01" 
                title="Connect Your Inventory"
                desc="Connect a supported inventory feed or dealer-authorized export. AutoLander maps the available vehicle data into one workflow for review."
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <Step 
                number="02" 
                title="Review and Prepare"
                desc="Review vehicle details, descriptions, photo order, prices, and eligible inventory before anything enters the posting queue."
              />
            </FadeIn>
            <FadeIn delay={0.3}>
              <Step 
                number="03" 
                title="Run the Queue and Track"
                desc="Control the posting workflow, keep inventory current, and track Marketplace activity from one desktop app."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative pb-24 pt-24 lg:pb-32 lg:pt-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <Eyebrow>Built for dealerships</Eyebrow>
              <SectionHeading className="mt-6">
                Everything your team needs to <span className="text-blue-500">own Marketplace.</span>
              </SectionHeading>
            </FadeIn>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <FadeIn delay={0.1} direction="up">
              <FeatureCard 
                icon={RefreshCw}
                title="Automatic Sync"
                desc="Load hundreds of vehicles from your website, dealer inventory system, custom feeds, CarGurus, or Cars.com. VIN, price, trim, and specs map from the source feed for your team to review."
              />
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <FeatureCard
                icon={Wand2}
                title="AI Posting & Photo Studio"
                desc="AutoLander fetches source photos, drafts descriptions, and manages the eligible posting queue. Optional AI background replacement uses 5-10 credits per vehicle."
              />
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <FeatureCard
                icon={RefreshCw}
                title="Auto Updates"
                desc="While the desktop app is running, price changes, sold vehicles, and inventory updates reconcile automatically — reducing manual edits and stale posts."
              />
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
              <FeatureCard 
                icon={Activity}
                title="Configurable Queue"
                desc="Choose eligible vehicles, review their data, and control the queue while the desktop app is running. Meta account rules and limits still apply."
              />
            </FadeIn>
            <FadeIn delay={0.5} direction="up">
              <FeatureCard 
                icon={Layout}
                title="Guided Setup"
                desc="Connect a supported feed or dealer-authorized export, map the fields, review the inventory, and keep the workflow on your own computer."
              />
            </FadeIn>
            <FadeIn delay={0.6} direction="up">
              <FeatureCard 
                icon={TrendingUp}
                title="Listing Quality & Attribution"
                desc="Use consistent fields, stronger creative, and post-to-sale reporting so your team can improve listings based on business outcomes."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative pb-24 pt-0 lg:pb-40 lg:pt-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                PLANS FOR <span className="text-blue-500">GROWTH.</span>
              </h2>

              {hasReferral && (
                <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-[2.5rem] border border-amber-300/40 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.35),transparent_34%),linear-gradient(135deg,rgba(30,64,175,0.9),rgba(2,6,23,0.96)_52%,rgba(120,53,15,0.7))] p-1 text-left shadow-2xl shadow-amber-500/20">
                  <div className="rounded-[2.25rem] border border-white/10 bg-black/25 p-5 sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-black shadow-xl shadow-amber-300/30">
                          <Gift className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-amber-200">Limited-Time Private Invite</p>
                          <h3 className="mt-2 text-3xl font-black uppercase italic leading-none text-white sm:text-4xl">
                            Give 25%. Get 1 Free Month.
                          </h3>
                          <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-slate-200 lg:text-base">
                            Join through this private link on monthly <span className="text-amber-200">$125/mo Pro</span> to get 25% off your first Pro month. The referrer gets a <span className="text-amber-200">$125 account credit</span> after your payment succeeds.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-amber-300/30 bg-amber-300/15 px-4 py-3 font-mono text-sm font-black text-amber-100">
                        Code: {referralCode}
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Referrer Reward</p>
                        <p className="mt-1 text-xl font-black italic text-white">1 Free Pro Month</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">New Dealer Offer</p>
                        <p className="mt-1 text-xl font-black italic text-white">25% Off First Month</p>
                      </div>
                      <div className={`rounded-2xl border p-4 ${isMonthlyBilling ? 'border-emerald-300/30 bg-emerald-400/15' : 'border-amber-300/30 bg-amber-300/10'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isMonthlyBilling ? 'text-emerald-200' : 'text-amber-200'}`}>
                          {isMonthlyBilling ? 'Active Below' : 'Annual Selected'}
                        </p>
                        <p className="mt-1 text-xl font-black italic text-white">
                          {isMonthlyBilling ? '$125/mo Pro Only' : 'Switch to Monthly'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-8">
                <span id="billing-monthly-label" className={`text-sm font-bold uppercase italic ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                <button 
                  type="button"
                  role="switch"
                  aria-checked={isAnnual}
                  aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
                  aria-describedby="billing-monthly-label billing-annual-label"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-14 h-7 rounded-full bg-white/10 border border-white/10 p-1 flex items-center transition-all"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span id="billing-annual-label" className={`text-sm font-bold uppercase italic ${isAnnual ? 'text-white' : 'text-slate-400'}`}>Annual</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest">Save 25%</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricing.map((plan, i) => {
              const isPrivateMonthlyProOffer = plan.proPromo && hasReferral && isMonthlyBilling;
              const isPrivateAnnualPro = plan.proPromo && hasReferral && isAnnual;
              const isPopularPlan = plan.popular && !hasReferral;
              const isHighlighted = isPopularPlan || isPrivateMonthlyProOffer;
              const showsPlanCta = isPrivateMonthlyProOffer && showDownloadButtons;

              return (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className={`relative flex flex-col rounded-[40px] p-10 transition-all duration-500 ${
                  isPrivateMonthlyProOffer
                    ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-amber-500 text-white scale-105 shadow-2xl shadow-amber-500/20 z-10'
                    : isPopularPlan
                      ? 'bg-blue-600 text-white scale-105 shadow-2xl shadow-blue-500/20 z-10'
                    : plan.team
                      ? 'bg-gradient-to-b from-emerald-950/40 to-white/[0.02] border border-emerald-500/40 text-slate-50 hover:border-emerald-500/70 shadow-xl shadow-emerald-500/5'
                      : 'bg-white/[0.03] border border-white/5 text-slate-50 hover:bg-white/[0.05]'
                }`}>
                  {(isHighlighted || isPrivateAnnualPro) && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                      isPrivateMonthlyProOffer ? 'bg-amber-300 text-black' : 'bg-white text-blue-600'
                    }`}>
                      {isPrivateMonthlyProOffer ? 'Limited-Time Offer' : isPrivateAnnualPro ? 'Annual Rate' : 'Most Popular'}
                    </div>
                  )}
                  {plan.team && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                      For Teams
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      {plan.fromPrefix && (
                        <span className="text-xs font-black uppercase tracking-widest opacity-60 mr-1">from</span>
                      )}
                      <span className="text-4xl lg:text-5xl font-black italic tracking-tighter">${isAnnual ? plan.annual : plan.monthly}</span>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">/ Month</span>
                    </div>
                    {isAnnual && (
                      <p className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-50">
                        Annual billing selected
                      </p>
                    )}
                    <p className={`mt-4 text-sm font-bold italic tracking-tight ${
                      isPrivateMonthlyProOffer || isPopularPlan ? 'text-blue-100' : plan.team ? 'text-emerald-400' : 'text-blue-500'
                    }`}>{plan.posts}</p>
                    {plan.team && (
                      <p className="mt-3 text-[11px] font-bold text-slate-400 italic leading-relaxed">
                        "Build a team that scales with you. Mix tiers, add seats anytime."
                      </p>
                    )}
                  </div>

                  <div className={`mb-4 space-y-4 ${showsPlanCta ? 'flex-grow md:mb-10' : ''}`}>
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                          isPrivateMonthlyProOffer || isPopularPlan ? 'text-white' : plan.team ? 'text-emerald-500' : 'text-blue-500'
                        }`} />
                        <span className="text-sm font-medium opacity-90">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {showsPlanCta && (
                    <button
                      onClick={() => openDownload({ contentName: plan.name })}
                      className="hidden w-full rounded-2xl bg-white py-4 text-sm font-black uppercase italic tracking-tighter text-blue-600 transition-all hover:bg-slate-100 md:block"
                    >
                      Claim Limited-Time Offer
                    </button>
                  )}
                  <p className={`mt-0 text-center text-[10px] font-black uppercase italic tracking-widest opacity-40 ${showsPlanCta ? 'md:mt-4' : ''}`}>
                    {plan.proPromo && hasReferral
                      ? (isMonthlyBilling ? 'Limited-time offer requires monthly $125 Pro' : 'Annual Pro is not part of this limited-time referral offer')
                      : plan.proPromo ? 'Best for high-volume single rooftops'
                      : plan.team ? 'Download + upgrade in-app' : 'First 5 posts are free'}
                  </p>
                </div>
              </FadeIn>
              );
            })}
          </div>

        </div>
      </section>

      {/* AI Studio — combined Photo Studio + Credits + Walkaround demo */}
      {/* AI Studio — single linear flow: header, description, tabbed visual demo, backdrops, CTA */}
      <section id="studio" className="py-24 lg:py-40 bg-[#080808] border-y border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">

          {/* Header + description */}
          <FadeIn>
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-8 tracking-tighter leading-none uppercase italic">
                AI PHOTO <span className="text-blue-500">STUDIO.</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium italic max-w-3xl mx-auto leading-relaxed">
                Replace messy lot backgrounds with showroom-quality backdrops <strong>and</strong> generate cinematic AI walkaround videos — all from one studio. Every plan includes free credits to get started.
              </p>
            </div>
          </FadeIn>

          {/* Tabbed visual demo — one frame at a time, video lazy-loaded on click */}
          <FadeIn direction="up">
            <div className="relative">
              <div className="hidden md:block absolute inset-0 bg-blue-600/20 blur-[100px] opacity-40" />

              {/* Tab buttons */}
              <div className="relative inline-flex max-w-full p-1.5 mb-6 rounded-2xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
                {[
                  { id: 'before', label: 'Before' },
                  { id: 'after', label: 'After' },
                  { id: 'walkaround', label: 'Walkaround' },
                ].map((tab) => {
                  const active = studioView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStudioView(tab.id)}
                      className={`min-w-0 px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all sm:px-5 sm:tracking-widest rounded-xl ${
                        active
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Visual frame — single aspect-ratio container, content swaps */}
              <div className="relative aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden border border-blue-500/30 bg-black shadow-2xl shadow-blue-500/10">

                {/* Before image */}
                <img
                  src="/preview/studio-before.webp"
                  alt="Raw dealer photo with tiled watermark — 2021 Jeep Gladiator"
                  width="1100"
                  height="733"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${studioView === 'before' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
                {studioView === 'before' && (
                  <div className="absolute top-5 left-5 px-5 py-2 bg-red-600/90 backdrop-blur-md rounded-xl text-xs font-black text-white uppercase tracking-widest">
                    Before — Raw Dealer Photo
                  </div>
                )}

                {/* After image */}
                <img
                  src="/preview/studio-after.webp"
                  alt="AI Studio Dark relit showroom — 2021 Jeep Gladiator"
                  width="1100"
                  height="733"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${studioView === 'after' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
                {studioView === 'after' && (
                  <div className="absolute top-5 right-5 px-5 py-2 bg-blue-600 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/30">
                    After — AI Studio Dark
                  </div>
                )}

                {/* Walkaround — click-to-play. <video> only mounts after user clicks. */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${studioView === 'walkaround' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {videoLoaded ? (
                    <video
                      className="absolute inset-0 h-full w-full bg-black object-cover"
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      poster="/marketplace-video-poster.webp"
                      aria-label="AutoLander AI walkaround video example"
                    >
                      <source src="/marketplace-video-example.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVideoLoaded(true)}
                      className="group absolute inset-0 h-full w-full"
                      aria-label="Play walkaround video"
                    >
                      <img
                        src="/marketplace-video-poster.webp"
                        alt="Walkaround video preview"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/20" />
                      <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl shadow-blue-500/40 transition-transform group-hover:scale-110">
                          <PlayCircle className="h-12 w-12 text-blue-600" />
                        </div>
                      </div>
                      <div className="absolute top-5 right-5 px-5 py-2 bg-blue-600 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/30">
                        Walkaround — AI Video + Sound
                      </div>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </FadeIn>

          {/* Backdrop options below the visual */}
          <FadeIn>
            <div className="mt-12">
              <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
                Backdrop options
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {['Showroom White', 'Dark Showroom', 'Outdoor Sunset', 'Mountain Clearing', 'Coastal Overlook', 'Custom Upload'].map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-300 font-bold text-xs sm:text-sm italic justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* CTA last */}
          <FadeIn>
            <div className="mt-12 flex justify-center">
              <button
                {...demoIntentHandlers}
                onClick={openDemoBooking}
                className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all uppercase italic hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30"
              >
                See the Studio in Action
              </button>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* Measurable workflow outcomes */}
      <section className="py-24 lg:py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none text-white">
                 MEASURE WHAT <span className="text-blue-500">MATTERS.</span>
               </h2>
              <p className="mx-auto max-w-3xl text-lg font-medium leading-relaxed text-slate-400">
                See what is ready, what is live, what changed, and what sold—without relying on rep memory or vanity metrics.
              </p>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Inventory accuracy",
                body: "Compare source data with the eligible listings in your queue, then reconcile price and sold-unit changes while the desktop app is running."
              },
              {
                title: "Team execution",
                body: "See which vehicles are prepared, queued, completed, or need review instead of depending on a salesperson's private checklist."
              },
              {
                title: "Post-to-sale attribution",
                body: "Connect Marketplace activity to sold inventory so managers can evaluate outcomes by vehicle, listing, and rep."
              }
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all flex flex-col h-full">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">0{i + 1}</p>
                  <h3 className="mt-5 text-xl font-black uppercase italic tracking-tight text-white">{t.title}</h3>
                  <p className="mt-4 text-slate-400 font-medium flex-grow leading-relaxed">{t.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Audience />

      {/* FAQ */}
      <section className="relative pb-24 pt-24 lg:pb-32 lg:pt-40">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                 ANY <span className="text-blue-500">QUESTIONS?</span>
               </h2>
            </FadeIn>
          </div>

          <div className="space-y-6">
            {[
              { q: "Will this get my Facebook account banned?", a: "No software can guarantee that a Facebook account will never be restricted. Meta's terms prohibit automated access without prior permission, and Marketplace eligibility and listing limits can change. AutoLander keeps session data on your own computer and provides queue controls, but those choices do not create Meta approval. Review our policy and safety guide and the rules shown in your account before posting." },
              { q: "Which inventory feeds do you work with?", a: "CarGurus and Cars.com are directly supported feed sources. Other dealer inventory and website systems may connect through a dealer-authorized custom feed/export in a supported format; confirm the format and delivery method with us before buying." },
              { q: "How fast can I get live?", a: "Setup time depends on the source format, field mapping, photo quality, inventory review, and the access shown in the Facebook account. We can verify the feed path during a demo; actual publishing remains subject to Meta's permission, eligibility, and listing limits." },
              { q: "How does the AI Photo Studio work?", a: "Optional background replacement uses AI Studio credits (5–10 per vehicle). The AI classifies every photo, leaves interiors and closeups alone, and replaces the background on full-exterior shots. Walkaround videos are 20 credits each. Every plan includes welcome credits, and you can buy more in-app." },
              { q: "Do I need any technical skills?", a: "No coding is required for a supported feed. A custom dealer-system export may still need provider authorization, format confirmation, and field mapping; we verify that path during setup before your team runs the queue." },
              { q: "Can I cancel anytime?", a: "Yes — monthly plans are month-to-month with no annual contract required. You can test the workflow with up to 5 free posts and no credit card, then cancel a monthly subscription if it is not a fit." }
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-4 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500" /> {faq.q}
                  </h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed italic">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden pb-20 pt-0 text-center sm:pb-24 lg:pb-32 lg:pt-0">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <FadeIn>
            <h2 className="font-display text-5xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.8] uppercase italic text-white">
              STOP POSTING.<br/><span className="text-blue-500">START SELLING CARS.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium italic">
              Join 500+ dealerships and sales reps using AutoLander to automate their Marketplace dominance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                {...demoIntentHandlers}
                onClick={openDemoBooking}
                className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-blue-600 text-white font-black text-xl transition-all shadow-2xl shadow-blue-600/30 uppercase italic tracking-tighter hover:bg-blue-500 active:scale-95"
              >
                Book Demo
              </button>
            </div>
            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">No Credit Card Required • Instant Setup</p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export function LandingFooter() {
  return (
    <>
      {/* Footer */}
      <footer className="py-12 sm:py-16 lg:py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          {/* Link sitemap — responsive grid: 2 cols on mobile, 4 on tablet, brand + 4 on desktop.
              Surfaces the SEO silo (auto poster / inventory / bulk / safety / pricing + integrations
              + compare) so the homepage internally links the cluster. Wraps cleanly at every width. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <CarFront className="w-6 h-6 text-white" />
              </div>
              <img
                src="/autolander-logo-240.webp"
                srcSet="/autolander-logo-200.webp 200w, /autolander-logo-240.webp 240w, /autolander-logo.png 400w"
                sizes="160px"
                alt="AutoLander"
                width="400"
                height="120"
                loading="lazy"
                decoding="async"
                className="h-12 w-auto"
              />
            </div>

            {/* Product */}
            <nav aria-label="Product" className="flex flex-col items-start gap-1 text-[13px] font-semibold text-slate-400">
              <h3 className="mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</h3>
              <a href="/facebook-marketplace-auto-poster/" className="block py-1 hover:text-blue-500 transition-colors">Auto Poster</a>
              <a href="/facebook-marketplace-listing-software/" className="block py-1 hover:text-blue-500 transition-colors">Listing Software</a>
              <a href="/facebook-marketplace-automation/" className="block py-1 hover:text-blue-500 transition-colors">Automation</a>
              <a href="/facebook-marketplace-assistant/" className="block py-1 hover:text-blue-500 transition-colors">Assistant</a>
              <a href="/facebook-autoposter/" className="block py-1 hover:text-blue-500 transition-colors">Autoposter</a>
              <a href="/facebook-marketplace-inventory-sync/" className="block py-1 hover:text-blue-500 transition-colors">Inventory Sync</a>
              <a href="/bulk-post-cars-to-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">Bulk Posting</a>
              <a href="/ai-chat-for-car-dealers/" className="block py-1 hover:text-blue-500 transition-colors">AI Chat</a>
              <a href="/ai-car-photo-editor/" className="block py-1 hover:text-blue-500 transition-colors">AI Photo Editor</a>
              <a href="/rv-dealer-software/" className="block py-1 hover:text-blue-500 transition-colors">RV Dealers</a>
              <a href="/safest-facebook-marketplace-auto-poster/" className="block py-1 hover:text-blue-500 transition-colors">Account Safety</a>
              <a href="/facebook-marketplace-auto-poster-pricing/" className="block py-1 hover:text-blue-500 transition-colors">Pricing</a>
            </nav>

            {/* Integrations */}
            <nav aria-label="Integrations" className="flex flex-col items-start gap-1 text-[13px] font-semibold text-slate-400">
              <h3 className="mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrations</h3>
              <a href="/integrations/" className="block py-1 hover:text-blue-500 transition-colors">All Integrations</a>
              <a href="/integrations/cargurus-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">CarGurus</a>
              <a href="/integrations/vauto-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">vAuto</a>
              <a href="/integrations/dealer-com-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">Dealer.com</a>
              <a href="/integrations/dealercenter-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">DealerCenter</a>
            </nav>

            {/* Compare */}
            <nav aria-label="Compare" className="flex flex-col items-start gap-1 text-[13px] font-semibold text-slate-400">
              <h3 className="mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compare</h3>
              <a href="/compare/" className="block py-1 hover:text-blue-500 transition-colors">All Tools</a>
              <a href="/compare/autobook/" className="block py-1 hover:text-blue-500 transition-colors">vs AutoBook</a>
              <a href="/compare/shiftly/" className="block py-1 hover:text-blue-500 transition-colors">vs Shiftly</a>
              <a href="/guide/how-to-sell-cars-on-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">How to Sell Cars</a>
              <a href="/guide/facebook-marketplace-automation/" className="block py-1 hover:text-blue-500 transition-colors">Automation Guide</a>
              <a href="/facebook-ai-tools/" className="block py-1 hover:text-blue-500 transition-colors">AI Tools</a>
              <a href="/facebook-listing-software/" className="block py-1 hover:text-blue-500 transition-colors">Facebook Listing</a>
              <a href="/facebook-marketplace-for-car-dealers/" className="block py-1 hover:text-blue-500 transition-colors">For Car Dealers</a>
              <a href="/guide/car-dealership-marketing/" className="block py-1 hover:text-blue-500 transition-colors">Marketing Playbook</a>
              <a href="/guide/ai-for-car-dealerships/" className="block py-1 hover:text-blue-500 transition-colors">AI for Dealerships</a>
            </nav>

            {/* Company */}
            <nav aria-label="Company" className="flex flex-col items-start gap-1 text-[13px] font-semibold text-slate-400">
              <h3 className="mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</h3>
              {/* Contact points at the real /contact/ page, not a mailto:. An AI agent checking
                  whether this is a legitimate business cannot click a mailto: — the trust-anchor
                  page has to be reachable by an ordinary link. Support keeps the mailto:. */}
              <a href="/contact/" className="block py-1 hover:text-blue-500 transition-colors">Contact</a>
              <MailLink className="block py-1 hover:text-blue-500 transition-colors">Support</MailLink>
              <a href="/privacy.html" className="block py-1 hover:text-blue-500 transition-colors">Privacy</a>
              <a href="/terms.html" className="block py-1 hover:text-blue-500 transition-colors">Terms</a>
            </nav>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 sm:mt-10 sm:pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">© 2026 AutoLander. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
