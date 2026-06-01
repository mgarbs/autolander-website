import { HelpCircle } from 'lucide-react';

export default function HelpTip({ text, label = 'What does this mean?' }) {
  if (!text) return null;

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span className="pointer-events-none absolute right-0 top-7 z-20 hidden w-64 rounded-xl border border-white/10 bg-[#0b0f16] p-3 text-left text-[11px] font-medium leading-relaxed text-slate-200 shadow-2xl shadow-black/40 group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}
