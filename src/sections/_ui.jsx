import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';

/**
 * Shared presentation primitives for the rebuilt landing page.
 * Logic-free on purpose — all booking/tracking/state stays in App.jsx.
 */

// Scroll-reveal wrapper (same behavior the old App.jsx FadeIn had).
export const FadeIn = ({ children, delay = 0, direction = 'up', className }) => {
  const directions = {
    up: { y: 28, opacity: 0 },
    down: { y: -28, opacity: 0 },
    left: { x: 28, opacity: 0 },
    right: { x: -28, opacity: 0 },
    none: { opacity: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={directions[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

// Monospace eyebrow — the recurring "dealer-data" HUD voice that signals
// software, not a car-for-sale ad.
export const Eyebrow = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300/90 ${className}`}
  >
    <span className="h-1.5 w-1.5 rounded-[2px] bg-blue-400 shadow-[0_0_12px_2px_rgba(96,165,250,0.65)]" />
    {children}
  </span>
);

// Big display heading. Pass accent text via the <SectionHeading.Accent> span.
export const SectionHeading = ({ children, className = '', as: Tag = 'h2' }) => (
  <Tag
    className={`font-display text-4xl font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl ${className}`}
  >
    {children}
  </Tag>
);

export const GlassCard = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md ${className}`}>
    {children}
  </div>
);

// Count-up metric. Animates once when scrolled into view; renders the final
// value instantly under prefers-reduced-motion.
export const Stat = ({ value, prefix = '', suffix = '', label, className = '', valueClassName = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  // Reduced motion (or animation not started): show the final value directly
  // rather than driving it through state in the effect.
  const current = reduce ? value : display;
  const text = Number.isInteger(value)
    ? Math.round(current).toLocaleString()
    : current.toFixed(1);

  return (
    <div ref={ref} className={className}>
      <div className={`font-display text-4xl font-extrabold italic tracking-tight text-white sm:text-5xl ${valueClassName}`}>
        {prefix}{text}{suffix}
      </div>
      {label && (
        <div className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
          {label}
        </div>
      )}
    </div>
  );
};

// Email/support link that works on every device. The mailto still fires for
// users who have a mail client (phones, Outlook, etc.); on desktops with no
// mail handler — where mailto silently does nothing — it copies the address and
// shows a confirmation so the link is never a dead end.
export const MailLink = ({ email = 'sales@autolander.ai', children, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const handleClick = () => {
    try {
      navigator.clipboard?.writeText(email);
    } catch {
      /* clipboard may be unavailable; the mailto still attempts to open */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <span className="relative inline-block">
      <a href={`mailto:${email}`} onClick={handleClick} className={className}>
        {children}
      </a>
      {copied && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold normal-case tracking-normal text-white shadow-lg shadow-blue-600/30">
          Copied {email}
        </span>
      )}
    </span>
  );
};
