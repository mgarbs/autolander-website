export const EM_DASH_RE = /[—–]/;

export const CONTRAST_TIC_RE = /\b(?:is|are|was|were|it’s|it's|that’s|that's)\s+not\s+(?:about\s+)?[^.!?]{1,60}[.!?]\s+(?:(?:It|That|This)\s+is|(?:It|That|This)(?:’s|'s))\b/i;

export const FORBIDDEN_CLAIMS = [
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
  push(article.tldr);
  for (const section of article.sections || []) {
    push(section.q); push(section.a); push(section.intro); push(section.body); push(section.caption); push(section.h2);
    (Array.isArray(section.a) ? section.a : []).forEach(push);
    (section.paras || []).forEach(push);
    (section.items || []).forEach(push);
    (section.cards || []).forEach((card) => { push(card.title); push(card.body); });
    (section.steps || []).forEach((step) => { push(step.title); push(step.body); });
    (section.rows || []).forEach((row) => row.forEach(push));
    if (section.left) section.left.items.forEach(push);
    if (section.right) section.right.items.forEach(push);
    (section.files || []).forEach((file) => { push(file.label); push(file.desc); });
  }
  for (const [question, answer] of article.faq || []) { push(question); push(answer); }
  return out;
}
