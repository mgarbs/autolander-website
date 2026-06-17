import { Check, X } from 'lucide-react';
import { FadeIn, Eyebrow, SectionHeading } from './_ui.jsx';

// Straight from the playbook's landing-page formula: sharpen dealer targeting
// by naming who it's for — and who it isn't (anyone shopping for a car).
const MADE_FOR = [
  'Dealership owners & GMs who want Marketplace handled',
  'Used-car, BDC & internet-sales managers tracking rep activity',
  "Sales reps who'd rather sell cars than copy-paste listings",
  'Single rooftops and multi-store groups alike',
];
const NOT_FOR = [
  'Anyone trying to buy a car — this is dealer software',
  'Teams unwilling to post to Marketplace at all',
  'Lots with fewer than ~10 vehicles in inventory',
];

export default function Audience() {
  return (
    <section className="border-y border-white/5 bg-[#080808] py-24 lg:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <FadeIn>
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <SectionHeading className="mt-6">
              Built for people who <span className="text-blue-500">sell cars.</span>
            </SectionHeading>
          </FadeIn>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn direction="right">
            <div className="h-full rounded-3xl border border-blue-500/20 bg-blue-500/[0.04] p-8">
              <p className="mb-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Made for</p>
              <ul className="space-y-4">
                {MADE_FOR.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-200">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn direction="left">
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <p className="mb-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Not for</p>
              <ul className="space-y-4">
                {NOT_FOR.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-400">
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
