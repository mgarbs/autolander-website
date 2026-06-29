import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

// Sticky mobile demo-application bar — fixes the known "no CTA on mobile" funnel
// leak. Slides up once the hero scrolls away; hidden on md+. Kept to a single
// full-width button + one short centered line so nothing truncates, and the
// chat launcher is raised above it on mobile (see ChatAssistant) so they never
// overlap.
export default function MobileCtaBar({ onBookDemo }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'max(0.7rem, env(safe-area-inset-bottom))' }}
    >
      <button
        onClick={onBookDemo}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-display text-base font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30 active:scale-[0.99]"
      >
        Apply for Demo
        <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        5 free posts · no credit card
      </p>
    </div>
  );
}
