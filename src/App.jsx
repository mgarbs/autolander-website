import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { m as motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { newEventId, track, trackCustom } from './lib/meta-pixel.js';
import { getVisitorId } from './lib/identity.js';
import Hero from './sections/Hero.jsx';
import TrustStrip from './sections/TrustStrip.jsx';
import ExecutionGap from './sections/ExecutionGap.jsx';
import Audience from './sections/Audience.jsx';
import MobileCtaBar from './sections/MobileCtaBar.jsx';
import { Eyebrow, SectionHeading, MailLink } from './sections/_ui.jsx';
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
const InstantCalendar = lazy(() => import('./components/InstantCalendar.jsx'));

const RELEASE_BASE_URL = "https://github.com/mgarbs/autolander-releases/releases/latest/download";
const DOWNLOADS = {
  windows: `${RELEASE_BASE_URL}/AutoLander-Setup.exe`,
  mac: `${RELEASE_BASE_URL}/AutoLander-Mac.dmg`,
  linux: `${RELEASE_BASE_URL}/AutoLander-Linux.AppImage`,
};
const REFERRAL_CODE_PATTERN = /^[a-z0-9]{4,64}$/;
const FEATURES_VIEW_STORAGE_KEY = 'autolander_meta_view_content_features';
const CALENDLY_WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';

let calendlyAssetsPromise = null;
function loadCalendlyAssets() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'));
  if (window.Calendly) return Promise.resolve(window.Calendly);
  if (calendlyAssetsPromise) return calendlyAssetsPromise;

  calendlyAssetsPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${CALENDLY_WIDGET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CALENDLY_WIDGET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${CALENDLY_WIDGET_JS}"]`);
    if (existing && window.Calendly) {
      resolve(window.Calendly);
      return;
    }
    const script = existing || document.createElement('script');
    if (!existing) {
      script.src = CALENDLY_WIDGET_JS;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => resolve(window.Calendly));
    script.addEventListener('error', () => {
      calendlyAssetsPromise = null;
      reject(new Error('calendly-load-failed'));
    });
  });

  return calendlyAssetsPromise;
}
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
  if (/Mac/i.test(ua)) return { url: DOWNLOADS.mac, label: 'Download for Mac', os: 'mac' };
  if (/Linux/i.test(ua)) return { url: DOWNLOADS.linux, label: 'Download for Linux', os: 'linux' };
  return { url: DOWNLOADS.windows, label: 'Download for Windows', os: 'windows' };
}

function isMobileUserAgent() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const iPadDesktopMode = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return mobileUa || iPadDesktopMode;
}

function canShowDownloadButtons() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 768px)').matches && !isMobileUserAgent();
}

function withFbEventId(url, eventId) {
  if (!eventId) return url;

  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set('fb_event_id', eventId);
    return nextUrl.toString();
  } catch {
    return `${url}${url.includes('?') ? '&' : '?'}fb_event_id=${encodeURIComponent(eventId)}`;
  }
}

const ATTR_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'campaign_id',
  'adset_id',
  'ad_id',
  'campaign_name',
  'adset_name',
  'ad_name',
  'placement',
  'site_source_name',
];
const AL_VID_MARKER = 'al_vid:';

function withUtms(url) {
  if (typeof window === 'undefined') return url;
  const params = new URLSearchParams(window.location.search);
  const utms = ATTR_KEYS
    .filter((key) => params.has(key))
    .map((key) => `${key}=${encodeURIComponent(params.get(key))}`)
    .join('&');
  if (!utms) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${utms}`;
}

function withAttribution(url) {
  if (typeof window === 'undefined') return url;
  const vid = getVisitorId();
  if (!vid) return withUtms(url);

  const stamped = withUtms(url);
  const marker = `${AL_VID_MARKER}${vid}`;

  try {
    const next = new URL(stamped, window.location.href);
    const existing = next.searchParams.get('utm_content');
    if (!existing) {
      next.searchParams.set('utm_content', marker);
    } else if (!existing.includes(AL_VID_MARKER)) {
      next.searchParams.set('utm_content', `${existing}|${marker}`);
    }
    return next.toString();
  } catch {
    return stamped;
  }
}

function hasSessionFlag(key) {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key) {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    /* Session storage can be unavailable in restricted browser contexts. */
  }
}

function checkoutEventParams(contentName, value) {
  const params = {
    content_name: contentName,
    currency: 'USD',
  };

  if (typeof value === 'number') {
    params.value = value;
  }

  return params;
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
  const [showDownloadButtons, setShowDownloadButtons] = useState(() => canShowDownloadButtons());
  const [shouldMountChat, setShouldMountChat] = useState(false);
  const featuresSectionRef = useRef(null);
  const isMonthlyBilling = !isAnnual;

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (STALE_APP_HASH_ROUTES.has(hash)) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateDownloadVisibility = () => setShowDownloadButtons(canShowDownloadButtons());
    updateDownloadVisibility();
    mediaQuery.addEventListener('change', updateDownloadVisibility);
    return () => mediaQuery.removeEventListener('change', updateDownloadVisibility);
  }, []);

  useEffect(() => {
    let mounted = false;
    let timerId = null;

    const cleanupIntentListeners = () => {
      window.removeEventListener('pointerdown', mountChat);
      window.removeEventListener('keydown', mountChat);
      window.removeEventListener('scroll', mountChat);
    };

    function mountChat() {
      if (mounted) return;
      mounted = true;
      if (timerId) window.clearTimeout(timerId);
      cleanupIntentListeners();
      setShouldMountChat(true);
    }

    const scheduleChatMount = () => {
      timerId = window.setTimeout(mountChat, 2600);
    };

    window.addEventListener('pointerdown', mountChat, { once: true, passive: true });
    window.addEventListener('keydown', mountChat, { once: true });
    window.addEventListener('scroll', mountChat, { once: true, passive: true });

    if (document.readyState === 'complete') {
      scheduleChatMount();
    } else {
      window.addEventListener('load', scheduleChatMount, { once: true });
    }

    return () => {
      mounted = true;
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener('load', scheduleChatMount);
      cleanupIntentListeners();
    };
  }, []);

  useEffect(() => {
    const section = featuresSectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined' || hasSessionFlag(FEATURES_VIEW_STORAGE_KEY)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setSessionFlag(FEATURES_VIEW_STORAGE_KEY);
        track('ViewContent', {
          content_name: 'features',
          content_category: 'landing',
        });
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const demoUrl = "https://calendly.com/autolander/demo";
  const bookingUrl = withAttribution(demoUrl);

  const openCalendlyPopup = useCallback(async () => {
    // Themed Calendly URL with site-matching dark palette.
    // a2=Yes pre-checks the "Get text reminders about your demo" checkbox
    // (verified via Calendly event-types API — multi_select at position 1).
    let widgetUrl = bookingUrl;
    try {
      const u = new URL(bookingUrl, window.location.href);
      u.searchParams.set('a2', 'Yes');
      u.searchParams.set('hide_gdpr_banner', '1');
      u.searchParams.set('background_color', '050505');
      u.searchParams.set('text_color', 'cbd5e1');
      u.searchParams.set('primary_color', '2563eb');
      widgetUrl = u.toString();
    } catch {
      const params = `a2=Yes&hide_gdpr_banner=1&background_color=050505&text_color=cbd5e1&primary_color=2563eb`;
      widgetUrl = `${bookingUrl}${bookingUrl.includes('?') ? '&' : '?'}${params}`;
    }

    try {
      const Calendly = await loadCalendlyAssets();
      if (!Calendly) {
        window.open(widgetUrl, '_blank');
        return;
      }
      Calendly.initPopupWidget({ url: widgetUrl });
    } catch (err) {
      console.error('[demo-booker] failed to load Calendly widget', err);
      window.open(widgetUrl, '_blank');
    }
  }, [bookingUrl]);

  // Native instant calendar (replaces the slow Calendly iframe on the hot path).
  // openCalendlyPopup is kept as the fallback if availability can't load.
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const openDemoBooking = useCallback(() => {
    setIsCalendarOpen(true);
    // Funnel signal: visitor opened the booking calendar (once per session) so we
    // can measure "opened but didn't book" drop-off. Lead fires later on slot
    // select; Schedule fires only on a completed booking.
    try {
      if (window.sessionStorage.getItem('al_booking_opened') === '1') return;
      window.sessionStorage.setItem('al_booking_opened', '1');
    } catch { /* sessionStorage unavailable — fall through and fire once */ }
    trackCustom('BookingOpened', { content_name: 'demo_calendar', content_category: 'demo' });
  }, []);

  const referralCode = getReferralCodeFromPath();
  const hasReferral = Boolean(referralCode);
  const referralDeepLink = hasReferral ? `autolander://signup?ref=${encodeURIComponent(referralCode)}` : 'autolander://signup';
  const download = getDownload();

  const copyReferralCode = async () => {
    if (!hasReferral) return;
    await navigator.clipboard?.writeText(referralCode).catch(() => {});
  };

  const openDownload = async ({ contentName = download.label, value } = {}) => {
    if (!showDownloadButtons) return;
    const eventId = newEventId();
    await copyReferralCode();
    track('InitiateCheckout', checkoutEventParams(contentName, value), { eventId });
    trackCustom('AppDownload', { os: download.os }, { eventId });
    window.open(withFbEventId(download.url, eventId), "_blank");
  };

  const openSpecificDownload = async (os, contentName = 'referral_download') => {
    if (!showDownloadButtons) return;
    const eventId = newEventId();
    await copyReferralCode();
    track('InitiateCheckout', checkoutEventParams(contentName), { eventId });
    trackCustom('AppDownload', { os }, { eventId });
    window.open(withFbEventId(DOWNLOADS[os], eventId), "_blank");
  };

  const openInstalledApp = async () => {
    const eventId = newEventId();
    await copyReferralCode();
    track('InitiateCheckout', checkoutEventParams('installed_app_signup'), { eventId });
    window.location.href = withFbEventId(referralDeepLink, eventId);
  };

  const trackChatOpen = () => {
    track('Lead', {
      content_name: 'chat_assistant',
      content_category: 'landing',
    });
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
      posts: "20 Posts / Day",
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
    <LazyMotion features={domAnimation}>
    <div className="min-h-dvh bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Orbs — hidden on mobile (large blur filters tank GPU on mobile) */}
      <div className="hidden md:block fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between bg-black/80 md:bg-black/40 md:backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <button
            type="button"
            aria-label="Back to top"
            className="flex shrink-0 cursor-pointer items-center space-x-2 border-0 bg-transparent p-0 text-left sm:space-x-3 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <CarFront className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <img
              src="/autolander-logo-240.webp"
              srcSet="/autolander-logo-200.webp 200w, /autolander-logo-240.webp 240w, /autolander-logo.png 400w"
              sizes="(min-width: 640px) 187px, 107px"
              alt="AutoLander"
              width="400"
              height="120"
              decoding="async"
              className="h-8 sm:h-14 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </button>
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
             <a href="#how-it-works" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">How It Works</a>
             <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Features</a>
             <a href="#pricing" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Pricing</a>
             <a href="#studio" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">AI Studio</a>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {showDownloadButtons && (
              <button
                type="button"
                onClick={() => openDownload({ contentName: 'nav_download', value: 39 })}
                className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors whitespace-nowrap"
              >
                Download
              </button>
            )}
            <button
              type="button"
              onClick={openDemoBooking}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg whitespace-nowrap">
              Book a Demo
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content">
      {/* Hero Section */}
      <section className={`relative z-10 overflow-hidden ${hasReferral ? 'pt-32 lg:pt-52 pb-20 lg:pb-40' : 'pt-28 lg:pt-36 pb-16 lg:pb-24'}`}>
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
              <h1 className="font-display text-5xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-white">
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
                  {showDownloadButtons && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => openSpecificDownload('windows')} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white">Windows</button>
                      <button type="button" onClick={() => openSpecificDownload('mac')} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white">Mac</button>
                      <button type="button" onClick={() => openSpecificDownload('linux')} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white">Linux</button>
                    </div>
                  )}
                </div>
              </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {showDownloadButtons && (
                  <motion.button
                    whileHover={{ y: -4, shadow: "0 20px 40px rgba(59,130,246,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openDownload({ contentName: 'referral_offer', value: 125 })}
                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all flex items-center justify-center space-x-3 uppercase italic"
                  >
                    <span>Download + Claim Offer</span>
                    <Download className="w-6 h-6" />
                  </motion.button>
                )}
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
          <Hero openDemoBooking={openDemoBooking} />
        )}
      </section>

      <TrustStrip />
      <ExecutionGap />

      {/* Comparison Section */}
      <section className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                MANUAL VS. <span className="text-blue-500">AUTOLANDER</span>
              </h2>
              <p className="text-slate-400 font-medium text-lg italic">Stop burning time on grunt work. Focus on closing deals while AI handles the rest.</p>
            </FadeIn>
          </div>

          <FadeIn direction="up" delay={0.2}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 md:py-6 px-2 md:px-4 text-left text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest"></th>
                    <th className="py-4 md:py-6 px-2 md:px-4 text-center text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Manual</th>
                    <th className="py-4 md:py-6 px-2 md:px-4 text-center text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-widest bg-blue-500/5 rounded-t-3xl">AutoLander</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Time per vehicle', manual: '13 minutes', auto: '2 minutes' },
                    { label: 'Vehicles per hour', manual: '~4', auto: '30 — 6.5× faster' },
                    { label: 'Descriptions', manual: 'Copy-paste', auto: 'AI-optimized' },
                    { label: 'Photos', manual: 'Random order', auto: 'Front-view first' },
                    { label: 'Sold units', manual: 'Stay listed', auto: 'Auto-removed' },
                    { label: 'Attribution', manual: 'None', auto: 'Post-to-sale tracking' }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 group">
                      <td className="py-4 md:py-6 px-2 md:px-4 text-white font-bold italic uppercase tracking-tight text-xs md:text-base">{row.label}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-center text-slate-400 font-medium text-xs md:text-base">
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
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
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
                desc="Hit 'Start' and AutoLander posts your inventory to Marketplace. Add AI background replacement (5-10 credits / vehicle) for showroom-quality photos."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" ref={featuresSectionRef} className="py-24 lg:py-40 relative">
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
                desc="Sync hundreds of vehicles from CarGurus or Cars.com automatically. VIN, price, trim, and specs are always 100% accurate."
              />
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <FeatureCard
                icon={Wand2}
                title="AI Posting & Photo Studio"
                desc="Our AI fetches photos, generates descriptions, and posts to Marketplace — all automatically. Optionally enable AI background replacement (5-10 credits / vehicle) for studio-quality results."
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-40 relative">
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
                  <motion.div 
                    animate={{ x: isAnnual ? 28 : 0 }}
                    className="w-5 h-5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
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

                  {(!isPrivateMonthlyProOffer || showDownloadButtons) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={
                        isPrivateMonthlyProOffer
                          ? () => openDownload({ contentName: plan.name, value: isAnnual ? plan.annual : plan.monthly })
                          : openDemoBooking
                      }
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
                  )}
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openDemoBooking}
                className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all uppercase italic hover:bg-blue-500 shadow-lg shadow-blue-600/30"
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
              <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none text-white">
                 DEALER <span className="text-blue-500">VOICES.</span>
               </h2>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "We sold 10 more cars last month straight from Marketplace leads. AutoLander has already paid for itself many times over.",
                author: "Mike Thompson",
                role: "General Manager, City Ford"
              },
              {
                quote: "I used to spend my entire morning manual posting to Facebook. Now it's all automated. It's the best investment we make for our digital presence.",
                author: "Sarah Jenkins",
                role: "Internet Director, Elite Motors"
              },
              {
                quote: "Our Marketplace leads turned into real sales — we're moving units that used to sit for weeks. Easily the best ROI in our marketing stack.",
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Audience />

      {/* FAQ */}
      <section className="py-24 lg:py-40 relative">
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
              { q: "Will this get my Facebook account banned?", a: "Very unlikely. AutoLander stays within Meta's guidelines and posts natural, dealer-style listings with human-like behavior — built-in delays and thoughtful pacing that mimic real activity — and never uses ToS-violating browser extensions. That combination keeps account health high and significantly reduces the risk of flags or restrictions." },
              { q: "Which inventory feeds do you work with?", a: "Paste your inventory feed or DMS and we extract every vehicle's data, photos, and specs automatically. We work with CarGurus and Cars.com out of the box, plus custom feeds from most dealership websites and DMS providers." },
              { q: "How fast can I get live?", a: "Most dealers have their first 20–30 vehicles live on Marketplace in under 15 minutes. Connect your inventory, pick the vehicles, hit post — the AI handles descriptions and photo ordering." },
              { q: "How does the AI Photo Studio work?", a: "Optional background replacement uses AI Studio credits (5–10 per vehicle). The AI classifies every photo, leaves interiors and closeups alone, and replaces the background on full-exterior shots. Walkaround videos are 20 credits each. Every plan includes welcome credits, and you can buy more in-app." },
              { q: "Do I need any technical skills?", a: "Zero. If you can copy a URL and click a button, you can run AutoLander. It's built for busy sales teams who want to sell cars, not manage software." },
              { q: "Can I cancel anytime?", a: "Yes — month-to-month, no contracts, zero penalties. Try it on a live demo with up to 5 free posts, no credit card required. If it's not selling cars for you, walk away." }
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
      <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <FadeIn>
            <h2 className="font-display text-5xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.8] uppercase italic text-white">
              STOP POSTING.<br/><span className="text-blue-500">START SELLING CARS.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium italic">
              Join 500+ dealerships and sales reps using AutoLander to automate their Marketplace dominance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openDemoBooking}
                className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-blue-600 text-white font-black text-xl transition-all shadow-2xl shadow-blue-600/30 uppercase italic tracking-tighter hover:bg-blue-500"
              >
                Book a Live Demo
              </motion.button>
              <button
                onClick={openDemoBooking}
                className="w-full sm:w-auto px-10 py-6 rounded-2xl bg-white/5 text-white font-bold text-xl hover:bg-white/10 border border-white/10 transition-all uppercase italic"
              >
                Start Your Free Trial
              </button>
            </div>
            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">No Credit Card Required • Instant Setup</p>
          </FadeIn>
        </div>
      </section>
      </main>

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
              <a href="/facebook-marketplace-inventory-sync/" className="block py-1 hover:text-blue-500 transition-colors">Inventory Sync</a>
              <a href="/bulk-post-cars-to-facebook-marketplace/" className="block py-1 hover:text-blue-500 transition-colors">Bulk Posting</a>
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
              <a href="/guide/facebook-marketplace-automation/" className="block py-1 hover:text-blue-500 transition-colors">Automation Guide</a>
            </nav>

            {/* Company */}
            <nav aria-label="Company" className="flex flex-col items-start gap-1 text-[13px] font-semibold text-slate-400">
              <h3 className="mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</h3>
              <MailLink className="block py-1 hover:text-blue-500 transition-colors">Contact</MailLink>
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
      <MobileCtaBar onBookDemo={openDemoBooking} />
      {shouldMountChat && (
        <Suspense fallback={null}>
          <ChatAssistant demoUrl={bookingUrl} supportEmail="sales@autolander.ai" onOpen={trackChatOpen} onBookDemo={openDemoBooking} />
        </Suspense>
      )}
      {isCalendarOpen && (
        <Suspense fallback={null}>
          <InstantCalendar onClose={() => setIsCalendarOpen(false)} onFallback={openCalendlyPopup} />
        </Suspense>
      )}
    </div>
    </LazyMotion>
  );
}
