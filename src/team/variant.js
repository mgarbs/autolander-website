// Headline variant for /team, one per ad angle: ?v=a (default) | b | c | d. Shared by the component and the
// boot code, so the variant React hydrates with is exactly the one the component would pick on its own.
export function teamVariantFromSearch(search = '') {
  const v = (new URLSearchParams(search).get('v') || '').toLowerCase();
  return ['a', 'b', 'c', 'd'].includes(v) ? v : 'a';
}
