// Public proof entries must contain confirmed figures and verified: true.
export const PROOF = {
  eyebrow: 'Dealers on AI Visibility',
  h2Lead: 'Before and after,',
  h2Grad: 'in their own numbers.',
  body: 'AutoLander dealer results, 90 days apart. Before is the free scan and the month before we started. After is the scan and the month after day 90.',
  footnote: 'Each dealer’s results are their own, measured the way the report measures: 120 answers from ChatGPT and Claude, plus the dealer’s Search Console and Google Analytics.',
};
export const PROOF_ENTRIES = [];
export const publicProofEntries = () => PROOF_ENTRIES.filter((entry) => entry.verified === true);
export const proofEntriesFor = ({ preview = false } = {}) => (preview ? PROOF_ENTRIES : publicProofEntries());
