// Smooth scrolls honour the visitor's reduced-motion setting: 'auto' follows index.css, which turns smooth
// scrolling off under prefers-reduced-motion (audit F9).
export const scrollBehavior = () => (typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
