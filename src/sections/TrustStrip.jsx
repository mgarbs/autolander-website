// Feed/DMS names as a quiet marquee. Plain text (no third-party logos) to
// avoid trademark issues while still signaling "plugs into what you use."
const FEEDS = ['CarGurus', 'Cars.com', 'vAuto', 'DealerCenter', 'DealerTrack', 'VINCue', 'Tekion', 'CDK'];

export default function TrustStrip() {
  const row = [...FEEDS, ...FEEDS];
  return (
    <section className="border-y border-white/5 bg-[#080808] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-6 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          Syncs straight from your inventory feed &amp; DMS
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee-track flex w-max gap-12">
            {row.map((name, i) => (
              <span
                key={i}
                className="font-display text-xl font-bold uppercase italic tracking-tight text-slate-400 transition-colors hover:text-slate-200"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
