import { Check, X } from 'lucide-react';

const ROWS = [
  { label: 'Vehicle data', manual: 'Re-enter each field', auto: 'Mapped from your feed' },
  { label: 'Descriptions', manual: 'Write or copy-paste', auto: 'AI draft for review' },
  { label: 'Photos', manual: 'Sort one by one', auto: 'AI-assisted ordering' },
  { label: 'Sold units', manual: 'Check and remove', auto: 'Alerts you in dashboard' },
  { label: 'Attribution', manual: 'Spreadsheet or guesswork', auto: 'Post-to-sale tracking' },
  { label: 'Visibility', manual: 'Memorize posted inventory', auto: 'See queue and activity in one dashboard' },
];

export default function ComparisonSection() {
  return (
    <section className="relative pb-24 pt-0 lg:pb-40 lg:pt-0">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center lg:mb-24">
          <h2 className="mb-6 font-display text-4xl font-black uppercase italic leading-none tracking-tighter lg:text-7xl">
            MANUAL VS. <span className="text-blue-500">AUTOLANDER</span>
          </h2>
          <p className="text-lg font-medium italic text-slate-400">
            Reduce repetitive inventory work so your team can focus on accurate listings, buyer follow-up, and sales.
          </p>
        </div>

        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[38%]" />
            <col className="w-[38%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-2 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 md:px-4 md:py-6 md:text-xs"></th>
              <th className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 md:px-4 md:py-6 md:text-xs">Manual</th>
              <th className="rounded-t-3xl bg-blue-500/5 px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest text-blue-400 md:px-4 md:py-6 md:text-xs">AutoLander</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="group border-b border-white/5">
                <td className="px-2 py-4 text-xs font-bold uppercase italic tracking-tight text-white md:px-4 md:py-6 md:text-base">{row.label}</td>
                <td className="px-2 py-4 text-center text-xs font-medium text-slate-400 md:px-4 md:py-6 md:text-base">
                  <div className="flex min-w-0 items-start justify-center gap-1 md:items-center md:gap-2">
                    <X className="h-3 w-3 shrink-0 text-red-500/50 md:h-4 md:w-4" />
                    <span className="min-w-0 break-words">{row.manual}</span>
                  </div>
                </td>
                <td className="bg-blue-500/5 px-2 py-4 text-center text-xs font-black italic text-white group-last:rounded-b-3xl md:px-4 md:py-6 md:text-base">
                  <div className="flex min-w-0 items-start justify-center gap-1 md:items-center md:gap-2">
                    <Check className="h-3 w-3 shrink-0 text-blue-500 md:h-5 md:w-5" />
                    <span className="min-w-0 break-words">{row.auto}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
