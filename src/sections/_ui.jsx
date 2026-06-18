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

// Email/support link that opens a real composer on EVERY device. A desktop
// `mailto:` only works if an OS mail client is registered (often none is on
// PC/Mac), so instead of a dead link we present a small chooser: Gmail / Outlook
// web (work anywhere in the browser), the default mail app (mailto — phones,
// Apple Mail, Outlook desktop), and copy-address as a last resort.
export const MailLink = ({ email = 'sales@autolander.ai', subject = 'AutoLander support', children, className = '' }) => {
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
            {copied ? 'Copied ✓' : 'Copy address'}
          </button>
        </div>
      )}
    </span>
  );
};
