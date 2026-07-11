// PRICING page — targets buyer-intent pricing/cost terms for a Facebook Marketplace auto poster.
// Answers "how much does it cost", states AutoLander's published self-serve pricing honestly
// (Starter $39, Growth $59, Pro $79, Dealer Plan from $117 monthly, 5 free posts, no card), compares published entry
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
      'AutoLander pricing: Starter $39, Growth $59, Pro $79 and Dealer plans from $117 monthly. '
      + 'Start with 5 free posts and no credit card.',
    ogType: 'website',
    eyebrow: 'Pricing & plans',
    h1: 'Facebook Marketplace auto poster pricing',
    bylineUpdated: true,
    tldr:
      'AutoLander has four published monthly options: Starter is $39 for 5 posts/day, Growth is $59 for '
      + '10 posts/day, Pro is $79 for 20 posts/day, and the Dealer Plan starts at $117 for a three-seat team. '
      + 'Start with 5 free posts and no credit card; annual billing is optional at a lower monthly equivalent.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Pricing', url: SITE.origin + NAV.pricing.path },
    ],
    sections: [
      {
        type: 'figure',
        before: '/studio/chevrolet-malibu-before.webp',
        after: '/studio/chevrolet-malibu-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2022 Chevrolet Malibu before AutoLander',
        afterAlt: 'The same 2022 Chevrolet Malibu as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'Included from $39/mo: AutoLander turns a raw 2022 Chevrolet Malibu lot photo (left) into a showroom-grade Marketplace listing (right).',
      },
      {
        type: 'qa',
        q: 'How much does a Facebook Marketplace auto poster cost?',
        a: [
          'AutoLander’s individual monthly plans are Starter at $39 for 5 posts/day, Growth at $59 for '
          + '10 posts/day, and Pro at $79 for 20 posts/day. The Dealer Plan starts at $117/mo for three '
          + 'Starter seats and can mix Starter, Growth and Pro seats for the team. Annual billing is optional '
          + 'and lowers the monthly equivalent.',
          'Across the wider market, a Facebook Marketplace auto poster typically costs anywhere from about '
          + '$39/mo at the low end to $249/mo or more, and several dealer tools only quote a custom price. '
          + 'AutoLander deliberately publishes its pricing so you can see the cost before you ever talk to '
          + 'sales. See the full feature-by-feature comparison on our compare page, or what the tool actually '
          + 'does on the Facebook Marketplace auto poster overview.',
        ],
      },
      {
        type: 'features',
        h2: 'AutoLander plans from $39/mo',
        intro: 'Three individual tiers plus a flexible team plan — all published, with 5 free posts to start and no credit card.',
        cards: [
          {
            title: 'Starter — $39/mo',
            body: 'For an individual rep posting up to 5 vehicles per day. Includes inventory sync, auto queue, '
              + 'standard AI descriptions and 25 welcome AI Studio credits.',
          },
          {
            title: 'Growth — $59/mo',
            body: 'For higher-volume reps posting up to 10 vehicles per day. Adds Pro AI descriptions, priority '
              + 'syncing and 50 welcome AI Studio credits.',
          },
          {
            title: 'Pro — $79/mo',
            body: 'For power users posting up to 20 vehicles per day. Adds concierge setup, dedicated support '
              + 'and 150 welcome AI Studio credits.',
          },
          {
            title: 'Dealer Plan — from $117/mo',
            body: 'For dealerships with at least three seats in any Starter, Growth or Pro mix. Adds a live manager '
              + 'dashboard, real-time team presence, attribution and team analytics.',
          },
          {
            title: '5 free posts to start',
            body: 'Every plan starts with 5 free posts and no credit card, so you can post real vehicles and see '
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
          ['AutoLander', 'from $39/mo', 'Starter $39, Growth $59, Pro $79; Dealer Plan from $117/mo for 3 seats. 5 free posts, no card.'],
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
        q: 'What is the cheapest Facebook Marketplace auto poster?',
        a: [
          'There is no permanently cheapest tool because competitor plans, betas and usage charges change. '
          + 'AutoLander’s current published entry price is $39/mo for Starter, with 5 free posts and no credit card. '
          + 'That makes the cost visible before a sales call rather than hidden behind a custom quote.',
          'Compare the live vendor price, included posting allowance, setup costs, AI credits, support and contract '
          + 'terms on the day you buy. A free beta or pay-as-you-go tool may cost less for occasional use, while a '
          + 'flat plan can be easier to budget for a recurring dealership workflow. See our comparison page before '
          + 'deciding on price alone.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What makes AutoLander’s pricing dealer-friendly',
        items: [
          'Published and self-serve — Starter $39, Growth $59, Pro $79 and Dealer Plan from $117 monthly.',
          'Month-to-month with no annual contract or enterprise lock-in — cancel anytime.',
          'Flat monthly price with no per-listing or per-VIN fee stacked on top.',
          'A published $39/mo entry price, so you can compare the plan without requesting a sales quote.',
          '5 free posts to start with no credit card, so you can test the workflow before paying.',
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
        body: 'AutoLander’s pricing above (Starter $39, Growth $59, Pro $79, Dealer Plan from $117 monthly, '
          + '5 free posts, no card) '
          + 'is our own published pricing. Competitor prices are listed as publicly advertised or reported and can '
          + 'change at any time — always verify on each vendor’s site. Meta account eligibility, listing limits and '
          + 'terms apply regardless of the plan you buy, and no vendor can guarantee Meta approval or access. Daily '
          + 'plan allowances describe AutoLander workflow capacity, not permission to exceed the limits shown by Meta.',
      },
    ],
    faq: [
      ['How much does a Facebook Marketplace auto poster cost?',
        'AutoLander costs $39/mo for Starter, $59/mo for Growth, $79/mo for Pro, or from $117/mo for a '
        + 'three-seat Dealer Plan. Start with 5 free posts and no credit card. Across the market, '
        + 'other tools generally range from about $99/mo to $249/mo, and some only quote custom pricing.'],
      ['Is there a free trial?',
        'Yes — every plan starts with 5 free posts and no credit card required, so you can post real vehicles '
        + 'to Facebook Marketplace and see the results before you pay anything.'],
      ['How do I get a demo?',
        'Use the "See plans & book a demo" button to schedule a walkthrough. A demo shows automatic posting, '
        + 'the AI-enhanced photos and the team dashboard running on your own dealership inventory.'],
      ['What is the cheapest Facebook Marketplace auto poster?',
        'There is no permanently cheapest option because plans and usage charges change. AutoLander publishes its '
        + 'current Starter price at $39/mo, with 5 free posts and no credit card. Compare each vendor’s live price, '
        + 'allowances, setup fees, AI credits and contract terms on the day you buy.'],
      ['Is there a contract or commitment?',
        'No annual contract is required. Monthly billing is available, or you can choose annual billing for a '
        + 'lower monthly equivalent. Pricing is published rather than hidden behind a sales quote.'],
      ['What is included in each plan?',
        'Starter ($39/mo) supports 5 posts/day, Growth ($59/mo) supports 10, and Pro ($79/mo) supports 20, '
        + 'with increasing AI and support allowances. The Dealer Plan starts at three seats, allows any tier mix, '
        + 'and adds the live manager dashboard, team presence and attribution analytics.'],
    ],
    cta: {
      heading: 'See AutoLander plans & book a demo',
      sub: 'Plans from $39/mo with 5 free posts to start — no credit card.',
    },
    relatedHeading: 'Keep comparing & exploring',
    schema: {
      software: SOFTWARE_DESC,
      // The renderer deliberately holds SoftwareApplication schema until genuine review data exists.
    },
  },
];
