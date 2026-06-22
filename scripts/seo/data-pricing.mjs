// PRICING page — targets buyer-intent pricing/cost terms for a Facebook Marketplace auto poster.
// Answers "how much does it cost", states AutoLander's published self-serve pricing honestly
// (Starter $39/mo, Pro $79/mo, month-to-month, 5 free posts, no card), compares published entry
// prices across tools (labeled "as published; verify"), and is honest about "cheapest". Funnels to
// /#pricing (book a demo), with deep links to /compare/ and /facebook-marketplace-auto-poster/.
//
// Follows the page-object contract (see scripts/seo/shell.mjs). All fields are PLAIN TEXT.

import { SITE, NAV } from './registry.mjs';

const SOFTWARE_DESC =
  'AutoLander is a Facebook Marketplace auto poster for car dealers with published, self-serve '
  + 'pricing from $39/mo, month-to-month, and 5 free posts to start with no credit card.';

export const PAGES = [
  {
    key: 'pricing',
    title: 'Facebook Marketplace Auto Poster Pricing (2026) | AutoLander',
    description:
      'How much does a Facebook Marketplace auto poster cost? AutoLander publishes self-serve plans — '
      + 'Starter $39/mo and Pro $79/mo, month-to-month, with 5 free posts to start and no credit card. '
      + 'See 2026 pricing vs other tools, the free trial and how to book a demo.',
    ogType: 'website',
    eyebrow: 'Pricing & plans',
    h1: 'Facebook Marketplace auto poster pricing',
    bylineUpdated: true,
    tldr:
      'AutoLander has published, self-serve pricing for its Facebook Marketplace auto poster: Starter is '
      + '$39/mo and Pro is $79/mo, both month-to-month, with 5 free posts to start and no credit card. '
      + 'That $39/mo Starter is the lowest published entry price among dealer-focused tools — most others '
      + 'start at $99–$249/mo or quote custom. Try it free, then book a demo to see it on your own inventory.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Pricing', url: SITE.origin + NAV.pricing.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'How much does a Facebook Marketplace auto poster cost?',
        a: [
          'For AutoLander, it costs $39/mo for the Starter plan or $79/mo for the Pro plan. Both are '
          + 'month-to-month with no annual contract, and you get 5 free posts to start with no credit card. '
          + 'You can post your dealership inventory to Facebook Marketplace, enhance the photos and keep '
          + 'listings current for that flat monthly price — there is no per-listing or per-VIN fee on top.',
          'Across the wider market, a Facebook Marketplace auto poster typically costs anywhere from about '
          + '$39/mo at the low end to $249/mo or more, and several dealer tools only quote a custom price. '
          + 'AutoLander deliberately publishes its pricing so you can see the cost before you ever talk to '
          + 'sales. See the full feature-by-feature comparison on our compare page, or what the tool actually '
          + 'does on the Facebook Marketplace auto poster overview.',
        ],
      },
      {
        type: 'features',
        h2: 'AutoLander plans: Starter $39/mo and Pro $79/mo',
        intro: 'Two simple, published plans — month-to-month, with 5 free posts to start and no credit card.',
        cards: [
          {
            title: 'Starter — $39/mo',
            body: 'Built for an individual sales rep posting their own deals to Facebook Marketplace. '
              + 'Automatic posting, AI-enhanced photos and listings that stay current — the lowest published '
              + 'entry price for a dealer-focused auto poster. Month-to-month, cancel anytime.',
          },
          {
            title: 'Pro — $79/mo',
            body: 'Built for a dealership or team. Everything in Starter plus the team features for running '
              + 'Marketplace across a rooftop, including a live manager dashboard so a manager can see posting '
              + 'and activity across the team. Still month-to-month, still no annual contract.',
          },
          {
            title: '5 free posts to start',
            body: 'Both plans start with 5 free posts and no credit card, so you can post real vehicles and see '
              + 'how listings look before you pay anything.',
          },
          {
            title: 'No contract, no surprises',
            body: 'Pricing is published and self-serve, billed month-to-month. No annual lock-in, no enterprise '
              + 'quote required, and no per-listing fee stacked on top of the monthly price.',
          },
        ],
      },
      {
        type: 'table',
        h2: 'Facebook Marketplace auto poster pricing compared (2026)',
        intro:
          'Published entry prices in 2026, as advertised by each vendor — always verify the current number on '
          + 'each vendor’s own site, since plans and pricing change. Some tools only quote custom, and '
          + '"dealer-reported" figures come from dealers, not the vendor’s public price list.',
        alCol: 1,
        head: ['Tool', 'Published entry price', 'Notes'],
        rows: [
          ['AutoLander', 'from $39/mo', 'Self-serve, published. Starter $39/mo, Pro $79/mo, month-to-month, 5 free posts, no card.'],
          ['Sell With Drift', 'from $99/mo', 'As published; verify on vendor site.'],
          ['AutoLister Pro', 'from $99/mo', 'As published; verify on vendor site.'],
          ['CARVID', '$249/mo (flat)', 'As published; verify on vendor site.'],
          ['Glo3D', '~$198–$395/mo', 'Third-party reported range; verify on vendor site.'],
          ['Shiftly', 'Custom quote', 'No public price; dealer-reported ~$1,000/mo. Verify with vendor.'],
          ['RelayAuto', 'Per-user + platform fee', 'Contact sales; no public flat price. Verify with vendor.'],
          ['AutoBook.io', 'Pay-as-you-go', 'Free open beta at time of writing. Verify current pricing.'],
        ],
        note:
          'Prices are as published or publicly reported as of June 2026 and can change at any time — confirm '
          + 'the current price on each vendor’s own site. AutoLander’s $39/mo is its self-serve Starter price. '
          + 'See the full feature comparison for what each price actually buys.',
      },
      {
        type: 'qa',
        q: 'Is AutoLander the cheapest Facebook Marketplace auto poster?',
        a: [
          'Among dealer-focused tools, yes — AutoLander has the lowest published entry price at $39/mo, where '
          + 'the next options start around $99/mo and some run to $249/mo or quote custom. Because the price is '
          + 'published and self-serve, there is no enterprise quote between you and getting started.',
          'To be honest about it: cheapest depends on volume. AutoBook.io is running a free open beta with a '
          + 'pay-as-you-go model at the time of writing, so for a handful of posts that can be cheaper than any '
          + 'monthly plan. For a dealer or rep posting inventory regularly on a predictable flat monthly price, '
          + 'AutoLander’s $39/mo Starter is the lowest published cost. Compare what you actually get at each '
          + 'price on our comparison page before you decide on price alone.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What makes AutoLander’s pricing dealer-friendly',
        items: [
          'Published and self-serve — you see Starter $39/mo and Pro $79/mo before you ever talk to sales.',
          'Month-to-month with no annual contract or enterprise lock-in — cancel anytime.',
          'Flat monthly price with no per-listing or per-VIN fee stacked on top.',
          'The lowest published entry price ($39/mo) among dealer-focused Facebook Marketplace auto posters.',
          '5 free posts to start with no credit card, so you can try it on real vehicles risk-free.',
        ],
      },
      {
        type: 'qa',
        q: 'Is there a free trial or demo?',
        a: [
          'Yes. Every plan starts with 5 free posts and no credit card, so you can post real vehicles to '
          + 'Facebook Marketplace and see how the listings look before you pay anything. That is the free trial — '
          + 'there is no separate trial sign-up and no card to enter up front.',
          'If you want a guided walkthrough on your own inventory first, book a demo using the button below. '
          + 'A demo is the fastest way to see automatic posting, the AI-enhanced photos and the team dashboard '
          + 'running on cars from your actual lot.',
        ],
      },
      {
        type: 'callout',
        title: 'A note on honesty',
        body: 'AutoLander’s pricing above ($39/mo Starter, $79/mo Pro, month-to-month, 5 free posts, no card) '
          + 'is our own published pricing. Competitor prices are listed as publicly advertised or reported and can '
          + 'change at any time — always verify on each vendor’s site. And automating a personal Facebook profile '
          + 'is a gray area no matter which tool you pay for; no honest vendor can promise you will never be flagged.',
      },
    ],
    faq: [
      ['How much does a Facebook Marketplace auto poster cost?',
        'AutoLander costs $39/mo for the Starter plan or $79/mo for the Pro plan, both month-to-month, with '
        + '5 free posts to start and no credit card. There is no per-listing fee on top. Across the market, '
        + 'other tools generally range from about $99/mo to $249/mo, and some only quote custom pricing.'],
      ['Is there a free trial?',
        'Yes — every plan starts with 5 free posts and no credit card required, so you can post real vehicles '
        + 'to Facebook Marketplace and see the results before you pay anything.'],
      ['How do I get a demo?',
        'Use the "See plans & book a demo" button to schedule a walkthrough. A demo shows automatic posting, '
        + 'the AI-enhanced photos and the team dashboard running on your own dealership inventory.'],
      ['What is the cheapest Facebook Marketplace auto poster?',
        'AutoLander has the lowest published entry price among dealer-focused tools at $39/mo. For a very small '
        + 'number of posts, AutoBook.io’s pay-as-you-go free open beta (at the time of writing) can be cheaper. '
        + 'For dealers posting inventory regularly on a flat monthly price, AutoLander’s $39/mo Starter is the '
        + 'lowest published cost.'],
      ['Is there a contract or commitment?',
        'No. Both AutoLander plans are billed month-to-month with no annual contract and no enterprise lock-in. '
        + 'You can cancel anytime, and the pricing is published and self-serve rather than quote-based.'],
      ['What is included in each plan?',
        'Starter ($39/mo) is built for an individual rep: automatic posting to Facebook Marketplace, '
        + 'AI-enhanced photos and listings that stay current. Pro ($79/mo) adds the team features for a '
        + 'dealership, including a live manager dashboard to see posting and activity across the team. Both '
        + 'include 5 free posts to start and are month-to-month with no credit card up front.'],
    ],
    cta: {
      heading: 'See AutoLander plans & book a demo',
      sub: 'Plans from $39/mo with 5 free posts to start — no credit card.',
    },
    relatedHeading: 'Keep comparing & exploring',
    schema: {
      software: SOFTWARE_DESC,
      // faq auto-derived from page.faq by the renderer; SoftwareApplication already nests an Offer at $39 —
      // do NOT add a standalone Offer here.
    },
  },
];
