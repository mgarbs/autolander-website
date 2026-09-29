import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { trackCustom } from '../lib/meta-pixel.js';
import {
  Beam, DashboardSection, DemoSection, FaqSection, FeedStrip, FinalCta, FloorCheck, Grad, HowItWorks,
  PricingSection, ProblemSection, ProofSection, TeamFooter, TeamHeader, TeamHero, TeamMobileCtaBar,
} from './TeamSections.jsx';
import { scrollBehavior } from './scroll.js';
import './team.css';

/**
 * /team — landing page for dealer owners, GMs and sales managers (teams of 3+), built for the
 * owner/manager Meta ad set. Not linked from the site, noindex (the shell from
 * scripts/spa-fallback.mjs already carries robots noindex; this component re-asserts it on
 * mount), and not in the sitemap. Same demo form, same tracking contract as the homepage:
 * PageView from Root, ApplicationOpened when the form opens, the form's own events after that.
 *
 * Headline variants, one per ad angle (message match): ?v=a default (whole floor + see it all),
 * ?v=b V3-10 'you stopped asking who posted', ?v=c V4 / Busy Floor / V3-12 'AutoPilot does the posting',
 * ?v=d V3-02 / V3-11 / Inventory Gap 'how many can a buyer find'.
 */

// Same lazy module as App.jsx, so the demo form is one shared chunk.
let demoApplicationPromise = null;
const loadDemoApplication = () => {
  if (!demoApplicationPromise) demoApplicationPromise = import('../components/DemoApplication.jsx');
  return demoApplicationPromise;
};
const DemoApplication = lazy(loadDemoApplication);

const HEADLINES = {
  a: <>Put your <Grad>whole sales floor</Grad> on Marketplace—and <Grad>see it all.</Grad></>,
  b: <>You stopped asking who posted. <Grad>Put it on AutoPilot.</Grad></>,
  c: <>Your people <Grad>sell.</Grad> AutoPilot does <Grad>the posting.</Grad></>,
  d: <>How many of your cars can a buyer <Grad>find tonight?</Grad></>,
};
const SUBS = {
  a: 'Flip on AutoPilot and your inventory posts to Marketplace by itself, day and night: new cars up, prices updated, sold units pulled down. You see it all in one Manager Dashboard. $39 per sales rep.',
  b: 'The Manager Dashboard shows every rep’s posts, live listings and sold cars, so you never have to ask. AutoPilot does the posting for your whole floor from one inventory feed. $39 per sales rep.',
  c: 'AutoPilot runs the whole listing cycle for every salesperson on your floor, day and night: new cars posted, prices updated, sold units pulled down. One Manager Dashboard shows you who’s posting. $39 per sales rep.',
  d: 'Your buyers scroll Marketplace every night. AutoPilot keeps your inventory in front of them through every salesperson on your floor: posted, priced right and cleaned up, day and night. $39 per sales rep.',
};

function headlineVariant() {
  if (typeof window === 'undefined') return 'a';
  const v = (new URLSearchParams(window.location.search).get('v') || '').toLowerCase();
  return ['a', 'b', 'c', 'd'].includes(v) ? v : 'a';
}

const DemoApplicationFallback = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md" onClick={onClose}>
    <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0f]/95 p-8 text-center shadow-2xl shadow-black/60" onClick={(event) => event.stopPropagation()}>
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-blue-500" />
      <p className="text-xs font-black uppercase italic tracking-widest text-slate-400">Opening demo form...</p>
    </div>
  </div>
);

export default function TeamApp() {
  const [variant] = useState(headlineVariant);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [autopilotOn, setAutopilotOn] = useState(false);
  const applicationOpenedAtRef = useRef(0);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const openedByKeyRef = useRef(false);

  useEffect(() => {
    document.title = 'AutoLander for Dealerships | Team Plans from $117/mo';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow, noarchive');
  }, []);

  const warmDemoApplication = useCallback(() => {
    loadDemoApplication().catch(() => {});
  }, []);

  // Mirrors App.jsx openDemoBooking: pointerdown opens, one ApplicationOpened per session.
  const openDemoBooking = useCallback((event) => {
    if (event?.type === 'pointerdown') {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault?.();
    }
    applicationOpenedAtRef.current = Date.now();
    // The button to return focus to, and whether a key opened it (a key press fires click with detail 0).
    returnFocusRef.current = event?.currentTarget || document.activeElement;
    openedByKeyRef.current = event?.type === 'click' && event.detail === 0;
    warmDemoApplication();
    setIsApplicationOpen(true);
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

  // The shared demo form as a modal dialog (audit F2): the page behind is inert, focus moves into the form (its
  // first field when a key opened it; the dialog itself for a tap or click, so no phone keyboard pops up),
  // Escape closes it, and focus goes back to the button that opened it.
  useEffect(() => {
    if (!isApplicationOpen) return undefined;
    const dialog = dialogRef.current;
    const firstField = () => dialog?.querySelector('input, select, textarea');
    let observer = null;
    if (openedByKeyRef.current && firstField()) firstField().focus();
    else {
      dialog?.focus({ preventScroll: true });
      if (openedByKeyRef.current && dialog && typeof MutationObserver !== 'undefined') {
        // the form's chunk may still be loading: move in as soon as its first field exists
        observer = new MutationObserver(() => {
          if (!firstField()) return;
          firstField().focus();
          observer.disconnect();
        });
        observer.observe(dialog, { childList: true, subtree: true });
      }
    }
    const onKey = (event) => {
      if (event.key === 'Escape') closeDemoApplication();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      observer?.disconnect();
      document.removeEventListener('keydown', onKey);
      const back = returnFocusRef.current;
      if (back?.isConnected) back.focus({ preventScroll: true });
    };
  }, [isApplicationOpen, closeDemoApplication]);

  const watchManagerView = useCallback(() => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: scrollBehavior() });
    window.setTimeout(() => setVideoOn(true), 500);
  }, []);

  // ?v=b sells 'who posted', so its hero button keeps the manager view; a / c / d show AutoPilot running.
  const watchAutopilot = useCallback(() => {
    document.getElementById('autopilot')?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    window.setTimeout(() => setAutopilotOn(true), 500);
  }, []);

  return (
    <div className="min-h-dvh bg-[#050505] font-sans text-slate-50 selection:bg-blue-500/30 selection:text-blue-200" data-headline-variant={variant}>
      {/* Everything but the form: inert while the form is open (audit F2). */}
      <div inert={isApplicationOpen}>
        <TeamHeader onBook={openDemoBooking} onWarm={warmDemoApplication} />
        <main id="main-content">
          <TeamHero
            headline={HEADLINES[variant]}
            sub={SUBS[variant]}
            onBook={openDemoBooking}
            onWarm={warmDemoApplication}
            onWatch={variant === 'b' ? watchManagerView : watchAutopilot}
            watch={variant === 'b' ? 'manager' : 'autopilot'}
          />
          <FeedStrip />
          <FloorCheck onBook={openDemoBooking} onWarm={warmDemoApplication} />
          <ProblemSection />
          <Beam />
          <HowItWorks autopilotOn={autopilotOn} onPlayAutopilot={() => setAutopilotOn(true)} />
          <DashboardSection videoOn={videoOn} onPlay={() => setVideoOn(true)} />
          <ProofSection />
          <DemoSection onBook={openDemoBooking} onWarm={warmDemoApplication} />
          <PricingSection onBook={openDemoBooking} onWarm={warmDemoApplication} />
          <FaqSection />
          <FinalCta onBook={openDemoBooking} onWarm={warmDemoApplication} />
        </main>
        <TeamFooter />
        <TeamMobileCtaBar onBookDemo={openDemoBooking} onWarmDemo={warmDemoApplication} />
      </div>
      {isApplicationOpen && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Book your free team demo" tabIndex={-1} className="outline-none">
          <Suspense fallback={<DemoApplicationFallback onClose={closeDemoApplication} />}>
            <DemoApplication onClose={closeDemoApplication} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
