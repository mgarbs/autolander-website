import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

// Sticky mobile Book-a-Demo bar — fixes the known "no CTA on mobile" funnel
// leak. Slides up once the hero scrolls away; hidden on md+. Offset from the
// right so it doesn't sit under the chat launcher.
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-3 pr-16">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] uppercase tracking-widest text-slate-400">5 free posts · no card</p>
          <p className="truncate text-sm font-bold text-white">See it on your inventory</p>
        </div>
        <button
          onClick={onBookDemo}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-display text-sm font-extrabold uppercase italic tracking-tight text-white shadow-lg shadow-blue-600/30"
        >
          Book Demo <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
