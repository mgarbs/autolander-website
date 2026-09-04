// Customer testimonials — the single source for every "What dealers say" block on the site.
//
// PROVENANCE: each quote is verbatim from a customer's own message to the AutoLander team (text /
// iMessage / RCS), September 2026, screenshots on file with Michael. Attribution is first name +
// a role only where the role is evident from the message itself (a rep who talks about deals and
// commission is a sales rep; anyone else is "AutoLander customer"). Add last names and store names
// ONLY after the customer has said yes to being quoted — never from private messages alone.
//
// RULES (do not relax):
//   • Verbatim. Trim only; never "improve" a quote. Light punctuation normalisation is allowed.
//   • No competitor names inside a quote on our site (the originals mention one; trimmed out).
//   • No numeric ratings, no Review / AggregateRating schema. Google excludes self-collected
//     testimonials from rich results, and inventing stars for text messages would be fabrication.
//   • A quote that states a result ("3 in a week", "2-3 deals a week") stays exactly as said and is
//     framed as that customer's own report, never as a typical or guaranteed outcome.

// Dealership attributions supplied by Michael from the customer records (2026-09-04). First names
// only for the people; the store is a public business. Never publish emails, phones or referral
// codes from those records.
export const TESTIMONIALS = [
  {
    text: 'I think this is the best listing software I’ve ever used.',
    who: 'Jim',
    role: 'Cox Chevrolet',
    when: '2026-09',
  },
  {
    text: 'I love it. Averaging about 2–3 deals a week from it.',
    who: 'Jullian',
    role: 'Sales rep, Lexus of Montgomery',
    when: '2026-09',
  },
  {
    text: 'I’ve sold 3 in a week from AutoLander. It’s doing great. I had 15 people message me yesterday.',
    who: 'Zac',
    role: 'Sales rep, Westgate',
    when: '2026-09',
  },
  {
    text: 'I like how it picked up on the price changes, which I also did. Not only is it more accurate, but it may push those listings to the top of the feed again.',
    who: 'Jim',
    role: 'Cox Chevrolet',
    when: '2026-09',
  },
  {
    text: 'Very happy with the service so far. Thanks to you guys for getting me up and running so quickly. I would refer, but I don’t need the competition, lol.',
    who: 'David',
    role: 'Pine Belt Chevrolet',
    when: '2026-09',
  },
  {
    text: 'It’s working great, thanks for your diligence!',
    who: 'Sergio',
    role: 'Franks Irvine Subaru',
    when: '2026-09',
  },
];

export const TESTIMONIAL_NOTE =
  'Quotes are from customer messages to the AutoLander team, September 2026, reproduced word for '
  + 'word with first names and dealerships only. Results are what those customers reported, not a promise.';

// A ready-to-drop section for any SEO page: `sections: [ ..., testimonialsSection(), faq ]`.
// `pick` limits how many quotes a page shows (the order above is the display order).
export function testimonialsSection({ h2 = 'What dealers say', pick = 4, intro, id = 'what-dealers-say' } = {}) {
  return {
    type: 'quotes',
    id,
    h2,
    ...(intro ? { intro } : {}),
    quotes: TESTIMONIALS.slice(0, pick).map(({ text, who, role }) => ({ text, who, role })),
    note: TESTIMONIAL_NOTE,
  };
}
