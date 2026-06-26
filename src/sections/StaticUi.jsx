export const Eyebrow = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300/90 ${className}`}
  >
    <span className="h-1.5 w-1.5 rounded-[2px] bg-blue-400 shadow-[0_0_12px_2px_rgba(96,165,250,0.65)]" />
    {children}
  </span>
);

export const SectionHeading = ({ children, className = '', as: Tag = 'h2' }) => (
  <Tag
    className={`font-display text-4xl font-extrabold uppercase italic leading-[0.92] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl ${className}`}
  >
    {children}
  </Tag>
);

export const StaticStat = ({ value, prefix = '', suffix = '', label, className = '', valueClassName = '' }) => {
  const text = Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);

  return (
    <div className={className}>
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
