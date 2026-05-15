import React, { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import broncoBeforeImage from '../bronco-before.jpg';
import broncoAfterImage from '../bronco-after.jpg';
import { 
  ArrowRight, Bot, RefreshCw, Facebook, CheckCircle2, 
  Activity, Calendar, Brain,
  MessageSquareText, CarFront, ShieldCheck, Sparkles, TrendingUp,
  MapPin, Gauge, Fuel, Zap, Clock, Trophy, Users, BarChart,
  Layers, Wand2, Layout, Zap as Fast,
  ArrowDownCircle, HelpCircle, Check, X, Gift, Download, Copy,
  PlayCircle
} from 'lucide-react';
const ChatAssistant = lazy(() => import('./components/ChatAssistant.jsx'));

const RELEASE_BASE_URL = "https://github.com/mgarbs/autolander-releases/releases/latest/download";
const HERO_CARS_DESKTOP_SRC = '/hero-cars-layer-full-v2.webp';
const HERO_CARS_MOBILE_SRC = '/hero-cars-layer-900-v2.webp';
const DOWNLOADS = {
  windows: `${RELEASE_BASE_URL}/AutoLander-Setup.exe`,
  mac: `${RELEASE_BASE_URL}/AutoLander-Mac.dmg`,
  linux: `${RELEASE_BASE_URL}/AutoLander-Linux.AppImage`,
};
const REFERRAL_CODE_PATTERN = /^[a-z0-9]{4,64}$/;
const STALE_APP_HASH_ROUTES = new Set([
  '#/login',
  '#/sign-in',
  '#/signin',
  '#/auth',
  '#/signup',
]);

function normalizeReferralCode(value) {
  const code = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return REFERRAL_CODE_PATTERN.test(code) ? code : '';
}

function getReferralCodeFromPath() {
  const match = window.location.pathname.match(/^\/ref\/([^/?#]+)/i);
  return normalizeReferralCode(match?.[1]);
}

function getDownload() {
  const ua = navigator.userAgent;
  if (/Mac/i.test(ua)) return { url: DOWNLOADS.mac, label: 'Download for Mac' };
  if (/Linux/i.test(ua)) return { url: DOWNLOADS.linux, label: 'Download for Linux' };
  return { url: DOWNLOADS.windows, label: 'Download for Windows' };
}

const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const directions = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: 30, opacity: 0 },
    right: { x: -30, opacity: 0 },
  };

  return (
    <motion.div
      initial={directions[direction]}
      whileInView={{ y: 0, x: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500">
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

export default function App() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [studioView, setStudioView] = useState('after');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isDesktopHero, setIsDesktopHero] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const isMonthlyBilling = !isAnnual;

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (STALE_APP_HASH_ROUTES.has(hash)) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateHeroViewport = () => setIsDesktopHero(mediaQuery.matches);
    updateHeroViewport();
    mediaQuery.addEventListener('change', updateHeroViewport);
    return () => mediaQuery.removeEventListener('change', updateHeroViewport);
  }, []);

  const demoUrl = "https://calendly.com/autolander-sales/30min";
  const referralCode = getReferralCodeFromPath();
  const hasReferral = Boolean(referralCode);
  const referralDeepLink = hasReferral ? `autolander://signup?ref=${encodeURIComponent(referralCode)}` : 'autolander://signup';
  const download = getDownload();

  const copyReferralCode = async () => {
    if (!hasReferral) return;
    await navigator.clipboard?.writeText(referralCode).catch(() => {});
  };

  const openDownload = async () => {
    await copyReferralCode();
    window.open(download.url, "_blank");
  };

  const openInstalledApp = async () => {
    await copyReferralCode();
    window.location.href = referralDeepLink;
  };


  const pricing = [
    {
      name: "Starter",
      monthly: 39,
      annual: 29,
      posts: "5 Posts / Day",
      features: [
        "Instant Inventory Sync",
        "Auto Queue",
        "Standard AI Descriptions",
        "Feed Sync (CarGurus / Cars.com)",
        "30 welcome AI Studio credits",
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
        "60 welcome AI Studio credits",
      ]
    },
    {
      name: "Pro",
      monthly: 79,
      annual: 59,
      posts: "20 Posts / Day",
      popular: true,
      features: [
        "Everything in Growth",
        "Unlimited Marketplace Support",
        "Concierge Setup",
        "Dedicated Support Agent",
        "120 welcome AI Studio credits",
      ]
    },
    {
      name: "Team",
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

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Orbs — hidden on mobile (large blur filters tank GPU on mobile) */}
      <div className="hidden md:block fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between bg-black/80 md:bg-black/40 md:backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <CarFront className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <img src="/autolander-logo.png" alt="AutoLander" width="400" height="120" decoding="async" className="h-8 sm:h-14 w-auto group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
             <a href="#how-it-works" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">How It Works</a>
             <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Features</a>
             <a href="#pricing" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Pricing</a>
             <a href="#studio" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">AI Studio</a>
          </div>
          <div className="flex items-center shrink-0">
            <button
              onClick={() => window.open(demoUrl, "_blank")}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg whitespace-nowrap">
              Book a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative z-10 overflow-hidden ${hasReferral ? 'pt-32 lg:pt-52 pb-20 lg:pb-40' : 'pt-28 lg:pt-36 pb-16 lg:pb-24'}`}>
        {!hasReferral && isDesktopHero && (
          <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block" aria-hidden="true">
            <motion.img
              initial={{ opacity: 0, x: 24, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.85, ease: [0.21, 0.47, 0.32, 0.98] }}
              src={HERO_CARS_DESKTOP_SRC}
              alt=""
              width="1146"
              height="1024"
              fetchPriority="high"
              decoding="async"
              className="absolute bottom-[-9%] right-[-18%] w-[86vw] max-w-[1120px] opacity-100 drop-shadow-[0_34px_70px_rgba(37,99,235,0.24)] lg:right-[-12%] lg:w-[72vw] xl:right-[-8%] xl:w-[68vw]"
            />
            <div className="absolute right-0 top-1/3 h-[55%] w-[46%] rounded-full bg-blue-500/10 blur-[90px]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.98)_30%,rgba(5,5,5,0.8)_45%,rgba(5,5,5,0.24)_66%,rgba(5,5,5,0.2)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050505] to-transparent" />
          </div>
        )}
        {hasReferral ? (
          <div className="max-w-4xl mx-auto px-6 text-center">
            <FadeIn>
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8 backdrop-blur-sm">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Private Invite - Limited Time
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-white">
                GET 25% OFF<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-600">
                  AUTOLANDER PRO.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed font-medium italic">
                Your private referral invite is ready. Subscribe to the $125/mo Pro plan and get 25% off your first Pro month. Your referrer gets a free Pro month after your payment succeeds.
              </p>
            </FadeIn>

              <FadeIn delay={0.25}>
                <div className="max-w-2xl mx-auto mb-10 rounded-[2rem] border border-amber-400/25 bg-gradient-to-br from-amber-400/15 via-white/[0.04] to-blue-500/10 p-5 text-left shadow-2xl shadow-amber-500/10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Private Referral Code</p>
                      <p className="mt-1 font-mono text-lg font-black text-white">{referralCode}</p>
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/15"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </button>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm font-bold text-slate-300 sm:grid-cols-3">
                    <div className="rounded-2xl bg-black/25 p-4">1. Download AutoLander</div>
                    <div className="rounded-2xl bg-black/25 p-4">2. Create your account</div>
                    <div className="rounded-2xl bg-black/25 p-4">3. Choose $125/mo Pro</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={DOWNLOADS.windows} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white">Windows</a>
                    <a href={DOWNLOADS.mac} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white">Mac</a>
                    <a href={DOWNLOADS.linux} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white">Linux</a>
                  </div>
                </div>
              </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <motion.button
                  whileHover={{ y: -4, shadow: "0 20px 40px rgba(59,130,246,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openDownload}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all flex items-center justify-center space-x-3 uppercase italic"
                >
                  <span>Download + Claim Offer</span>
                  <Download className="w-6 h-6" />
                </motion.button>
                <button
                  onClick={openInstalledApp}
                  className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white/5 text-white font-bold text-lg hover:bg-white/10 border border-white/10 transition-all uppercase italic"
                >
                  Already Installed? Apply Code
                </button>
              </div>
            </FadeIn>
          </div>
        ) : (
          <div className="relative z-10 mx-auto flex min-h-[540px] max-w-7xl items-center px-6 lg:min-h-[590px]">
            <div className="max-w-2xl text-left">
              <FadeIn>
                <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-blue-300">
                  <Facebook className="h-4 w-4" />
                  <span className="text-xs font-black uppercase">
                    Automatically Post Inventory to Facebook Marketplace
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
                  SELL 10-15 MORE
                  <span className="mt-2 block text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600">
                    CARS EVERY MONTH.
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.16}>
                <p className="mt-6 text-sm font-black uppercase text-blue-200">
                  Automatic Facebook Marketplace posting for dealers.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-300 lg:text-xl">
                  AutoLander automatically posts, updates, and tracks your dealership inventory on Facebook Marketplace, generating more leads with zero manual work.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <motion.button
                    whileHover={{ y: -4, shadow: "0 20px 40px rgba(59,130,246,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openDownload}
                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all flex items-center justify-center space-x-3 uppercase italic"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>
                  <button
                    onClick={() => window.open(demoUrl, "_blank")}
                    className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white/5 text-white font-bold text-lg hover:bg-white/10 border border-white/10 transition-all uppercase italic"
                  >
                    Book a Demo
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="mt-6 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 sm:inline-flex sm:flex-row sm:items-center sm:gap-4">
                  <span>Starting at $39/mo for individuals</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-500 sm:block" />
                  <span>$117/mo for teams</span>
                </div>
              </FadeIn>

              {!isDesktopHero && (
              <FadeIn delay={0.45}>
                <div className="relative -mx-6 mt-7 h-[340px] overflow-hidden md:hidden" aria-hidden="true">
                  <div className="absolute bottom-8 right-0 h-40 w-2/3 rounded-full bg-blue-500/15 blur-[56px]" />
                  <img
                    src={HERO_CARS_MOBILE_SRC}
                    alt=""
                    width="900"
                    height="804"
                    loading="eager"
                    decoding="async"
                    className="absolute bottom-[-34px] right-[-27vw] w-[116vw] max-w-none drop-shadow-[0_24px_46px_rgba(37,99,235,0.24)]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050505] to-transparent" />
                  <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#050505] to-transparent" />
                </div>
              </FadeIn>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                MANUAL VS. <span className="text-blue-500">AUTOLANDER</span>
              </h2>
              <p className="text-slate-400 font-medium text-lg italic">Stop burning time on grunt work. Focus on closing deals while AI handles the rest.</p>
            </FadeIn>
          </div>

          <FadeIn direction="up" delay={0.2}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 md:py-6 px-2 md:px-4 text-left text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest"></th>
                    <th className="py-4 md:py-6 px-2 md:px-4 text-center text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">Manual</th>
                    <th className="py-4 md:py-6 px-2 md:px-4 text-center text-blue-500 text-[10px] md:text-xs font-black uppercase tracking-widest bg-blue-500/5 rounded-t-3xl">AutoLander</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Listing Quality', manual: 'Amateur', auto: 'Pro Studio' },
                    { label: 'Lead Gen', manual: 'Inconsistent', auto: 'High-Convert AI' },
                    { label: 'Inventory Sync', manual: 'Manual Entry', auto: 'Automatic' },
                    { label: 'Form Filling', manual: 'Click-by-Click', auto: '100% Auto' },
                    { label: 'Descriptions', manual: 'Copy-Paste', auto: 'AI Optimized' },
                    { label: 'Monthly Results', manual: 'Varies', auto: '+12 Units Avg' }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 group">
                      <td className="py-4 md:py-6 px-2 md:px-4 text-white font-bold italic uppercase tracking-tight text-xs md:text-base">{row.label}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-center text-slate-500 font-medium text-xs md:text-base">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <X className="w-3 h-3 md:w-4 md:h-4 text-red-500/50 shrink-0" /> {row.manual}
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-center text-white font-black italic bg-blue-500/5 group-last:rounded-b-3xl text-xs md:text-base">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <Check className="w-3 h-3 md:w-5 md:h-5 text-blue-500 shrink-0" /> {row.auto}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 lg:mb-32">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                3 STEPS TO <span className="text-blue-500">DOMINANCE.</span>
              </h2>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            <FadeIn delay={0.1}>
              <Step 
                number="01" 
                title="Connect Feed" 
                desc="Paste your CarGurus or Cars.com feed URL. Your entire inventory (100-200+ units) syncs automatically with all specs and features."
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <Step 
                number="02" 
                title="Enhance Visuals" 
                desc="Select from our AI Studio backdrops—Showroom, Outdoor, or Luxury—to make your lot photos look like a professional shoot."
              />
            </FadeIn>
            <FadeIn delay={0.3}>
              <Step 
                number="03" 
                title="Start Auto Sales" 
                desc="Hit 'Start' and AutoLander posts your inventory to Marketplace. Add AI background replacement (15 credits / vehicle) for showroom-quality photos."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <FadeIn delay={0.1} direction="up">
              <FeatureCard 
                icon={RefreshCw}
                title="Automatic Sync"
                desc="Sync hundreds of vehicles from CarGurus or Cars.com automatically. VIN, price, trim, and specs are always 100% accurate."
              />
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <FeatureCard
                icon={Wand2}
                title="AI Posting & Photo Studio"
                desc="Our AI fetches photos, generates descriptions, and posts to Marketplace — all automatically. Optionally enable AI background replacement (15 credits / vehicle) for studio-quality results."
              />
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <FeatureCard
                icon={RefreshCw}
                title="Auto Updates"
                desc="Listings stay accurate 24/7. Price drops, sold vehicles, and inventory changes sync automatically — no manual edits, no stale posts."
              />
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
              <FeatureCard 
                icon={Activity}
                title="Continuous Queue"
                desc="Set it and forget it. AutoLander posts your inventory one-by-one with intelligent logic to maximize visibility."
              />
            </FadeIn>
            <FadeIn delay={0.5} direction="up">
              <FeatureCard 
                icon={Layout}
                title="Zero Setup"
                desc="No complex integrations. Just paste a URL, log into Facebook, and start selling more cars today."
              />
            </FadeIn>
            <FadeIn delay={0.6} direction="up">
              <FeatureCard 
                icon={TrendingUp}
                title="Lead Acceleration"
                desc="Our AI-optimized listings are designed to rank higher and generate 30% more Messenger inquiries."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* AI Photo Studio Section */}
      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
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
                <span className={`text-sm font-bold uppercase italic ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-14 h-7 rounded-full bg-white/10 border border-white/10 p-1 flex items-center transition-all"
                >
                  <motion.div 
                    animate={{ x: isAnnual ? 28 : 0 }}
                    className="w-5 h-5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold uppercase italic ${isAnnual ? 'text-white' : 'text-slate-500'}`}>Annual</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest">Save 25%</span>
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

              return (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className={`relative p-10 rounded-[40px] h-full flex flex-col transition-all duration-500 ${
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

                  <div className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                          isPrivateMonthlyProOffer || isPopularPlan ? 'text-white' : plan.team ? 'text-emerald-500' : 'text-blue-500'
                        }`} />
                        <span className="text-sm font-medium opacity-90">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openDownload}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase italic tracking-tighter transition-all ${
                      isPrivateMonthlyProOffer || isPopularPlan
                        ? 'bg-white text-blue-600 hover:bg-slate-100'
                        : plan.team
                          ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                    }`}
                  >
                    {isPrivateMonthlyProOffer ? 'Claim Limited-Time Offer' : plan.team ? 'Get Team' : 'Start Free Trial'}
                  </motion.button>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-center opacity-40 italic">
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
              <h2 className="text-4xl lg:text-7xl font-black mb-8 tracking-tighter leading-none uppercase italic">
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
              <div className="relative inline-flex p-1.5 mb-6 rounded-2xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
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
                      className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
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
                  src={broncoBeforeImage}
                  alt="Original Bronco dealer lot photo"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${studioView === 'before' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
                {studioView === 'before' && (
                  <div className="absolute top-5 left-5 px-5 py-2 bg-red-600/90 backdrop-blur-md rounded-xl text-xs font-black text-white uppercase tracking-widest">
                    Before — Original Lot Photo
                  </div>
                )}

                {/* After image */}
                <img
                  src={broncoAfterImage}
                  alt="AI Studio Bronco background replacement"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${studioView === 'after' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
                {studioView === 'after' && (
                  <div className="absolute top-5 right-5 px-5 py-2 bg-blue-600 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/30">
                    After — AI Studio
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
              <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-5">
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(demoUrl, "_blank")}
                className="px-10 py-5 rounded-2xl bg-white text-black font-black text-lg transition-all uppercase italic"
              >
                See the Studio in Action
              </motion.button>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none text-white">
                 DEALER <span className="text-blue-500">VOICES.</span>
               </h2>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "AutoLander is a game changer. Our lead volume has tripled since we started using the AI Studio backgrounds. The professional look really matters.",
                author: "Mike Thompson",
                role: "General Manager, City Ford"
              },
              {
                quote: "I used to spend my entire morning manual posting to Facebook. Now it's all automated. It's the best investment we make for our digital presence.",
                author: "Sarah Jenkins",
                role: "Internet Director, Elite Motors"
              },
              {
                quote: "The background removal is magic. Our lot is crowded, but our listings look like they were shot in a $10M showroom. Highly recommend.",
                author: "David Chen",
                role: "Owner, DC Auto Group"
              }
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col h-full italic">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-3 h-3 text-blue-500" />)}
                  </div>
                  <p className="text-slate-400 font-medium mb-8 flex-grow leading-relaxed">"{t.quote}"</p>
                  <div>
                    <p className="text-white font-black uppercase tracking-tight">{t.author}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-40 relative">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                 ANY <span className="text-blue-500">QUESTIONS?</span>
               </h2>
            </FadeIn>
          </div>

          <div className="space-y-6">
            {[
              { q: "Which inventory feeds do you work with?", a: "We work seamlessly with CarGurus and Cars.com feeds. Simply paste your public feed URL, and our system will extract all vehicle data, photos, and specs automatically." },
              { q: "How much does background replacement cost?", a: "Background replacement uses AI Studio credits — 15 credits per vehicle. Our AI classifies every photo in the gallery, drops dealer-ad junk automatically, leaves interior and closeup shots alone, and replaces the background on every full-exterior shot. Every plan includes welcome credits to get you started, and you can purchase more credits in-app whenever you need them." },
              { q: "How do walkaround videos work?", a: "Marketplace videos turn polished vehicle photos into a cinematic 10-second walkaround clip at 1080p. Videos cost 30 credits each. Every plan includes welcome credits, and you can purchase more credits in-app." },
              { q: "How does this help me sell more cars?", a: "AutoLander creates high-quality, professional listings that stand out in the Marketplace. By using AI to optimize photos and descriptions, dealers typically see a 3x increase in lead volume and sell an average of 12 extra units per month." },
              { q: "Do I need any technical skills?", a: "Zero. If you can copy and paste a URL and click a button, you can use AutoLander. It's designed for busy sales teams who want to sell cars, not manage software." },
              { q: "Is there a limit on how many cars I can post?", a: "Limits are based on your plan (5, 10, or 20 per day). This ensures your Facebook account stays safe and compliant with Marketplace algorithms." }
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tight mb-4 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500" /> {faq.q}
                  </h4>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed italic">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 lg:py-48 relative overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <FadeIn>
            <h2 className="text-5xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.8] uppercase italic text-white">
              STOP POSTING.<br/><span className="text-blue-500">START SELLING.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium italic">
              Join 500+ dealerships using AutoLander to automate their Marketplace dominance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openDownload}
                className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-white text-black font-black text-xl transition-all shadow-3xl shadow-white/5 uppercase italic tracking-tighter"
              >
                Start Your Free Trial
              </motion.button>
              <button 
                onClick={() => window.open(demoUrl, "_blank")}
                className="w-full sm:w-auto px-10 py-6 rounded-2xl bg-white/5 text-white font-bold text-xl hover:bg-white/10 border border-white/10 transition-all uppercase italic"
              >
                Book a Live Demo
              </button>
            </div>
            <p className="mt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">No Credit Card Required • Instant Setup</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <CarFront className="w-6 h-6 text-white" />
              </div>
              <img src="/autolander-logo.png" alt="AutoLander" className="h-14 w-auto" />
            </div>
            
            <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <a href="/privacy.html" className="hover:text-blue-500 transition-colors">Privacy</a>
              <a href="/terms.html" className="hover:text-blue-500 transition-colors">Terms</a>
              <a href="mailto:support@autolander.ai" className="hover:text-blue-500 transition-colors">Contact</a>
              <a href="mailto:support@autolander.ai" className="hover:text-blue-500 transition-colors">Support</a>
            </div>

            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">© 2026 AutoLander. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <ChatAssistant demoUrl={demoUrl} supportEmail="support@autolander.ai" />
      </Suspense>
    </div>
  );
}
