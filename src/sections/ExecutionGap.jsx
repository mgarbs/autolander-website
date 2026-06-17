import { FadeIn, Eyebrow, SectionHeading, Stat } from './_ui.jsx';

// Conviction stats straight from the playbook (Part 6). Verifiable framing,
// no fabricated claims.
const STATS = [
  { value: 1, suffix: 'B+', label: 'People on Marketplace monthly' },
  { value: 3.5, suffix: 'M+', label: 'New listings posted daily' },
  { value: 14, suffix: '%', label: 'of buyers start on a dealer site' },
];

export default function ExecutionGap() {
  return (
    <section className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <Eyebrow>The real problem</Eyebrow>
        </FadeIn>
        <FadeIn delay={0.08}>
          <SectionHeading className="mt-6">
            Dealers don&apos;t have a demand problem.{' '}
            <span className="bg-gradient-to-b from-blue-300 to-blue-600 bg-clip-text text-transparent">
              They have an execution problem.
            </span>
          </SectionHeading>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            The buyers are already on Marketplace. Your inventory already exists. The only broken
            link is consistent, fast, compliant posting — and reps can&apos;t keep up by hand.
            AutoLander closes that gap.
          </p>
        </FadeIn>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 px-6 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <FadeIn key={s.label} delay={0.1 + i * 0.1} direction="up">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <Stat value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
