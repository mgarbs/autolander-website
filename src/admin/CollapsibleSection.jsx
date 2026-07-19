import { ChevronDown } from 'lucide-react';

export default function CollapsibleSection({ slug, title, subtitle, open, onToggle, children }) {
  const headerId = `admin-section-${slug}-header`;
  const bodyId = `admin-section-${slug}-body`;

  return (
    <section
      aria-labelledby={headerId}
      className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
    >
      <button
        id={headerId}
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-inset"
      >
        <span className="min-w-0">
          <span className="block text-sm font-black uppercase italic tracking-tight text-white">{title}</span>
          {subtitle && (
            <span className="mt-0.5 block truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div id={bodyId} role="region" aria-labelledby={headerId} className="border-t border-white/10">
          {children}
        </div>
      )}
    </section>
  );
}
