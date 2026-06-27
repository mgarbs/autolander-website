import { Check, X } from 'lucide-react';

const ROWS = [
  { label: 'Time per vehicle', manual: '13 minutes', auto: '2 minutes' },
  { label: 'Vehicles per hour', manual: '~4', auto: <>30 &mdash; 6.5&times; faster</> },
  { label: 'Descriptions', manual: 'Copy-paste', auto: 'AI-optimized' },
  { label: 'Photos', manual: 'Random order', auto: 'Front-view first' },
  { label: 'Sold units', manual: 'Stay listed', auto: 'Auto-removed' },
  { label: 'Attribution', manual: 'None', auto: 'Post-to-sale tracking' },
];

export default function ComparisonSection() {
  return (
    <section className="relative py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center lg:mb-24">
          <h2 className="mb-6 font-display text-4xl font-black uppercase italic leading-none tracking-tighter lg:text-7xl">
            MANUAL VS. <span className="text-blue-500">AUTOLANDER</span>
          </h2>
          <p className="text-lg font-medium italic text-slate-400">
            Stop burning time on grunt work. Focus on closing deals while AI handles the rest.
          </p>
        </div>

        <table className="w-full border-collapse">
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
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <X className="h-3 w-3 shrink-0 text-red-500/50 md:h-4 md:w-4" />
                    {row.manual}
                  </div>
                </td>
                <td className="bg-blue-500/5 px-2 py-4 text-center text-xs font-black italic text-white group-last:rounded-b-3xl md:px-4 md:py-6 md:text-base">
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <Check className="h-3 w-3 shrink-0 text-blue-500 md:h-5 md:w-5" />
                    {row.auto}
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
