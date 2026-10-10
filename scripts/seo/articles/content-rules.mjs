export const EM_DASH_RE = /[—–]/;

export const CONTRAST_TIC_RE = /\b(?:is|are|was|were|it’s|it's|that’s|that's)\s+not\s+(?:about\s+)?[^.!?]{1,60}[.!?]\s+(?:(?:It|That|This)\s+is|(?:It|That|This)(?:’s|'s))\b/i;

// AutoLander never opens, answers, routes or forwards a Marketplace message. These are the exact
// phrasings that have drifted onto live pages before (08-22 "routes buyer messages", 10-10 "remove sold
// buyer messages" / "assisting with buyer messages"). Narrow on purpose: competitor descriptions of
// their own auto-reply products stay legal. Also scanned over every generated page and llms file.
export const INBOX_CLAIMS = [
  /\bremov\w* sold buyer messages\b/i,
  /\bassist\w* with (?:incoming |your )?buyer messages\b/i,
  /\bhelps? (?:you )?handle (?:incoming |your )?buyer messages\b/i,
  /\brout(?:es|ing) (?:incoming |your )?(?:buyer|customer|marketplace) (?:messages|leads|conversations)\b/i,
  /\bmessenger leads back to your team\b/i,
  /\bno buyer message (?:left )?unseen\b/i,
];

export const FORBIDDEN_CLAIMS = [
  ...INBOX_CLAIMS,
  /auto[- ]?respond/i,
  /autoresponder/i,
  /replies? for you/i,
  /answers? (?:your |buyers.? )?messages? automatically/i,
  /AutoLander (?:reads|routes|answers|responds to|replies to)/i,
  /never (?:get|be) banned/i,
  /guaranteed? (?:not )?to (?:not )?(?:get )?bann/i,
  /ban[- ]?proof/i,
];

export const MUSE_TIER_RE = /Muse[^.]{0,160}(\$\s?\d|free tier|tokens?)/i;

export function collectText(article) {
  const out = [];
  const push = (value) => { if (typeof value === 'string') out.push(value); };
  const each = (value, visit = push) => {
    if (Array.isArray(value)) value.forEach(visit);
  };
  if (!article || typeof article !== 'object') return out;
  push(article.tldr);
  for (const section of (Array.isArray(article.sections) ? article.sections : [])) {
    if (!section || typeof section !== 'object' || Array.isArray(section)) continue;
    push(section.q); push(section.a); push(section.intro); push(section.body); push(section.caption); push(section.h2);
    each(section.a);
    push(section.paras);
    each(section.paras);
    each(section.items);
    each(section.cards, (card) => { if (card && typeof card === 'object') { push(card.title); push(card.body); } });
    each(section.steps, (step) => { if (step && typeof step === 'object') { push(step.title); push(step.body); } });
    each(section.rows, (row) => each(row));
    if (section.left && typeof section.left === 'object') each(section.left.items);
    if (section.right && typeof section.right === 'object') each(section.right.items);
    each(section.files, (file) => { if (file && typeof file === 'object') { push(file.label); push(file.desc); } });
  }
  each(article.faq, (entry) => {
    if (!Array.isArray(entry)) return;
    push(entry[0]);
    push(entry[1]);
  });
  return out;
}
