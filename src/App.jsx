import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { newEventId, track, trackCustom } from './lib/meta-pixel.js';
import Hero from './sections/Hero.jsx';
import TrustStrip from './sections/TrustStrip.jsx';
import ExecutionGap from './sections/ExecutionGap.jsx';
import ComparisonSection from './sections/ComparisonSection.jsx';
import MobileCtaBar from './sections/MobileCtaBar.jsx';
import { CarFront, Gift, Download, Copy } from 'lucide-react';
const ChatAssistant = lazy(() => import('./components/ChatAssistant.jsx'));
let demoApplicationPromise = null;
const loadDemoApplication = () => {
  if (!demoApplicationPromise) {
    demoApplicationPromise = import('./components/DemoApplication.jsx');
  }
  return demoApplicationPromise;
};
const preloadDemoApplication = () => {
  loadDemoApplication().catch(() => {});
};
const DemoApplication = lazy(loadDemoApplication);
let deferredLandingSectionsPromise = null;
const loadDeferredLandingSections = () => {
  if (!deferredLandingSectionsPromise) {
    deferredLandingSectionsPromise = import('./sections/DeferredLandingSections.jsx');
  }
  return deferredLandingSectionsPromise;
};

const DeferredLandingSections = lazy(loadDeferredLandingSections);
const LandingFooter = lazy(() =>
  loadDeferredLandingSections().then((module) => ({
    default: module.LandingFooter,
  }))
);

const RELEASE_BASE_URL = "https://github.com/mgarbs/autolander-releases/releases/latest/download";
const DOWNLOADS = {
  windows: `${RELEASE_BASE_URL}/AutoLander-Setup.exe`,
  mac: `${RELEASE_BASE_URL}/AutoLander-Mac.dmg`,
  linux: `${RELEASE_BASE_URL}/AutoLander-Linux.AppImage`,
};
const REFERRAL_CODE_PATTERN = /^[a-z0-9]{4,64}$/;
const FEATURES_VIEW_STORAGE_KEY = 'autolander_meta_view_content_features';
const STALE_APP_HASH_ROUTES = new Set([
  '#/login',
  '#/sign-in',
  '#/signin',
  '#/auth',
  '#/signup',
]);

function isDemoApplicationTriggerEvent(event) {
  const target = event?.target;
  return Boolean(target?.closest?.('[data-demo-application-trigger="true"]'));
}

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

const FadeIn = ({ children }) => <div>{children}</div>;

const DemoApplicationFallback = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0f]/95 p-8 text-center shadow-2xl shadow-black/60"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-blue-500" />
      <p className="text-xs font-black uppercase italic tracking-widest text-slate-400">Opening demo form...</p>
    </div>
  </div>
);

export default function App() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [studioView, setStudioView] = useState('after');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showDownloadButtons, setShowDownloadButtons] = useState(() => canShowDownloadButtons());
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const [shouldMountChat, setShouldMountChat] = useState(false);
  const [shouldMountDeferredSections, setShouldMountDeferredSections] = useState(false);
  const [pendingDeferredSection, setPendingDeferredSection] = useState('');
  const featuresSectionRef = useRef(null);
  const lastNavScrollYRef = useRef(0);
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
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    let frameId = 0;

    const updateNavVisibility = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastNavScrollYRef.current;

      if (!mobileQuery.matches || currentScrollY <= 96) {
        setIsMobileNavVisible(true);
      } else if (scrollDelta > 10) {
        setIsMobileNavVisible(false);
      } else if (scrollDelta < -6) {
        setIsMobileNavVisible(true);
      }

      lastNavScrollYRef.current = currentScrollY;
      frameId = 0;
    };

    const onScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateNavVisibility);
    };

    const onViewportChange = () => {
      lastNavScrollYRef.current = Math.max(window.scrollY, 0);
      setIsMobileNavVisible(true);
    };

    lastNavScrollYRef.current = Math.max(window.scrollY, 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    mobileQuery.addEventListener('change', onViewportChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      mobileQuery.removeEventListener('change', onViewportChange);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    let mounted = shouldMountDeferredSections;
    let timerId = null;

    const cleanupIntentListeners = () => {
      window.removeEventListener('pointerdown', mountDeferredSections);
      window.removeEventListener('pointermove', mountDeferredSections);
      window.removeEventListener('keydown', mountDeferredSections);
      window.removeEventListener('scroll', mountDeferredSections);
      window.removeEventListener('touchstart', mountDeferredSections);
      window.removeEventListener('wheel', mountDeferredSections);
    };

    function mountDeferredSections(event) {
      if (isDemoApplicationTriggerEvent(event)) return;
      if (mounted) return;
      mounted = true;
      if (timerId) window.clearTimeout(timerId);
      cleanupIntentListeners();
      loadDeferredLandingSections().catch(() => {});
      setShouldMountDeferredSections(true);
    }

    if (mounted) return cleanupIntentListeners;

    if (['#how-it-works', '#features', '#pricing', '#studio'].includes(window.location.hash)) {
      mountDeferredSections();
      return cleanupIntentListeners;
    }

    const scheduleDeferredMount = () => {
      timerId = window.setTimeout(mountDeferredSections, 14000);
    };

    window.addEventListener('pointerdown', mountDeferredSections, { once: true, passive: true });
    window.addEventListener('pointermove', mountDeferredSections, { once: true, passive: true });
    window.addEventListener('keydown', mountDeferredSections, { once: true });
    window.addEventListener('scroll', mountDeferredSections, { once: true, passive: true });
    window.addEventListener('touchstart', mountDeferredSections, { once: true, passive: true });
    window.addEventListener('wheel', mountDeferredSections, { once: true, passive: true });

    if (document.readyState === 'complete') {
      scheduleDeferredMount();
    } else {
      window.addEventListener('load', scheduleDeferredMount, { once: true });
    }

    return () => {
      mounted = true;
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener('load', scheduleDeferredMount);
      cleanupIntentListeners();
    };
  }, [shouldMountDeferredSections]);

  useEffect(() => {
    if (!shouldMountDeferredSections || !pendingDeferredSection) return undefined;

    let attempts = 0;
    let timerId = null;
    const scrollWhenReady = () => {
      const target = document.getElementById(pendingDeferredSection);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setPendingDeferredSection('');
        return;
      }
      if (attempts < 40) {
        attempts += 1;
        timerId = window.setTimeout(scrollWhenReady, 50);
      }
    };

    scrollWhenReady();
    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [pendingDeferredSection, shouldMountDeferredSections]);

  useEffect(() => {
    let mounted = false;
    let timerId = null;

    const cleanupIntentListeners = () => {
      window.removeEventListener('pointerdown', mountChat);
      window.removeEventListener('pointermove', mountChat);
      window.removeEventListener('keydown', mountChat);
      window.removeEventListener('scroll', mountChat);
      window.removeEventListener('touchstart', mountChat);
    };

    function mountChat(event) {
      if (isDemoApplicationTriggerEvent(event)) return;
      if (mounted) return;
      mounted = true;
      if (timerId) window.clearTimeout(timerId);
      cleanupIntentListeners();
      setShouldMountChat(true);
    }

    const scheduleChatMount = () => {
      timerId = window.setTimeout(mountChat, 16000);
    };

    window.addEventListener('pointerdown', mountChat, { once: true, passive: true });
    window.addEventListener('pointermove', mountChat, { once: true, passive: true });
    window.addEventListener('keydown', mountChat, { once: true });
    window.addEventListener('scroll', mountChat, { once: true, passive: true });
    window.addEventListener('touchstart', mountChat, { once: true, passive: true });

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
  }, [shouldMountDeferredSections]);

  const openDeferredSection = useCallback((sectionId) => (event) => {
    event.preventDefault();
    setPendingDeferredSection(sectionId);
    setShouldMountDeferredSections(true);
  }, []);


  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const applicationOpenedAtRef = useRef(0);
  const warmDemoApplication = useCallback(() => {
    preloadDemoApplication();
  }, []);

  const openDemoBooking = useCallback((event) => {
    if (event?.type === 'pointerdown') {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault?.();
    }
    applicationOpenedAtRef.current = Date.now();
    warmDemoApplication();
    setIsApplicationOpen(true);
    // Funnel signal: visitor opened the application form. Standard Lead is
    // reserved for a verified submission that reached GHL.
    try {
      if (window.sessionStorage.getItem('al_application_opened') === '1') return;
      window.sessionStorage.setItem('al_application_opened', '1');
    } catch { /* sessionStorage unavailable — fall through and fire once */ }
    trackCustom('ApplicationOpened', { content_name: 'demo_application', content_category: 'demo' });
  }, [warmDemoApplication]);

  const closeDemoApplication = useCallback(() => {
    if (Date.now() - applicationOpenedAtRef.current < 450) return;
    setIsApplicationOpen(false);
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
    trackCustom('ChatOpened', {
      content_name: 'chat_assistant',
      content_category: 'landing',
    });
  };




  return (
    <div className="min-h-dvh bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Orbs — hidden on mobile (large blur filters tank GPU on mobile) */}
      <div className="hidden md:block fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 z-50 w-full px-4 py-4 transition-transform duration-300 ease-out motion-reduce:transition-none sm:px-6 ${isMobileNavVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}`}>
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
             <a href="#how-it-works" onClick={openDeferredSection('how-it-works')} className="text-sm font-semibold text-slate-400 hover:text-white transition-all">How It Works</a>
             <a href="#features" onClick={openDeferredSection('features')} className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Features</a>
             <a href="#pricing" onClick={openDeferredSection('pricing')} className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Pricing</a>
             <a href="#studio" onClick={openDeferredSection('studio')} className="text-sm font-semibold text-slate-400 hover:text-white transition-all">AI Studio</a>
             <a href="/guide/how-to-sell-cars-on-facebook-marketplace/" className="hidden text-sm font-semibold text-slate-400 transition-all hover:text-white xl:inline">Dealer Guide</a>
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
              data-demo-application-trigger="true"
              onPointerEnter={warmDemoApplication}
              onPointerDown={openDemoBooking}
              onFocus={warmDemoApplication}
              onTouchStart={warmDemoApplication}
              onClick={openDemoBooking}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg whitespace-nowrap">
              Book Demo
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
                  <button
                    onClick={() => openDownload({ contentName: 'referral_offer', value: 125 })}
                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all flex items-center justify-center space-x-3 uppercase italic hover:bg-blue-500 active:scale-95"
                  >
                    <span>Download + Claim Offer</span>
                    <Download className="w-6 h-6" />
                  </button>
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
          <Hero openDemoBooking={openDemoBooking} onWarmDemo={warmDemoApplication} />
        )}
      </section>

      <TrustStrip />
      <ExecutionGap />
      <ComparisonSection />

      {shouldMountDeferredSections && (
        <Suspense fallback={null}>
          <DeferredLandingSections
            featuresSectionRef={featuresSectionRef}
            isAnnual={isAnnual}
            setIsAnnual={setIsAnnual}
            studioView={studioView}
            setStudioView={setStudioView}
            videoLoaded={videoLoaded}
            setVideoLoaded={setVideoLoaded}
            hasReferral={hasReferral}
            isMonthlyBilling={isMonthlyBilling}
            referralCode={referralCode}
            showDownloadButtons={showDownloadButtons}
            openDownload={openDownload}
            openDemoBooking={openDemoBooking}
            onWarmDemo={warmDemoApplication}
          />
        </Suspense>
      )}
      </main>

      {shouldMountDeferredSections && (
        <Suspense fallback={null}>
          <LandingFooter />
        </Suspense>
      )}
      <MobileCtaBar onBookDemo={openDemoBooking} onWarmDemo={warmDemoApplication} />
      {shouldMountChat && (
        <Suspense fallback={null}>
          <ChatAssistant supportEmail="sales@autolander.ai" onOpen={trackChatOpen} onBookDemo={openDemoBooking} onWarmDemo={warmDemoApplication} />
        </Suspense>
      )}
      {isApplicationOpen && (
        <Suspense fallback={<DemoApplicationFallback onClose={closeDemoApplication} />}>
          <DemoApplication onClose={closeDemoApplication} />
        </Suspense>
      )}
    </div>
  );
}
