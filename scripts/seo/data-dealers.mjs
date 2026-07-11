// DEALERS page — targets the use-case/playbook intent: facebook marketplace for car dealers.
// This is a broader, more educational query than the category spine's "auto poster" tool head
// term, so the page leads with the dealer playbook (can dealers sell there, current limits,
// how to do it well) and positions AutoLander as the automation — no cannibalization with the
// category page or /compare/. Funnels to the homepage demo-booking modal via SITE.ctaUrl.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.dealers.path;

const SOFTWARE_DESC =
  'AutoLander helps car dealers use Facebook Marketplace to sell more cars: a native desktop app that '
  + 'automatically lists your dealership inventory on Marketplace, syncs your feed, enhances every photo, '
  + 'removes sold units and ties listings back to actual car sales — from $39/mo.';

export const PAGES = [
  {
    key: 'dealers',
    title: 'Facebook Marketplace for Car Dealers (2026) | AutoLander',
    description:
      'Facebook Marketplace for car dealers: learn the rules, list your inventory and automate repetitive '
      + 'posting. From $39/mo with 5 free posts.',
    ogType: 'website',
    eyebrow: 'For car dealers & dealerships',
    h1: 'Facebook Marketplace for car dealers',
    bylineUpdated: true,
    tldr:
      'Facebook Marketplace can introduce vehicles to local shoppers, but [Meta says it is intended for consumers](https://www.facebook.com/help/1968285150185577) '
      + 'and that businesses listing there may be blocked or have listings removed. Dealers must confirm permission, '
      + 'account eligibility and current monthly limits before posting. AutoLander '
      + 'is a native desktop app that prepares and manages inventory listings, enhances photos, removes sold units '
      + 'and tracks which listings sold cars. It cannot override Meta’s rules or account limits. Plans start at '
      + '$39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'For car dealers', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'Can car dealers sell cars on Facebook Marketplace?',
        a: [
          'Dealers must confirm the current rules before participating. [Meta says Marketplace is intended for consumers](https://www.facebook.com/help/1968285150185577) and '
          + 'that businesses listing there may be blocked or have listings removed. Meta also '
          + 'discontinued vehicle listings from business Pages in major markets in 2023, and its Help Center '
          + 'documents monthly Marketplace listing limits.',
          'Before using any posting tool, confirm the rules shown in the account and read our practical '
          + '[guide to selling cars on Facebook Marketplace](/guide/how-to-sell-cars-on-facebook-marketplace/). '
          + 'AutoLander reduces repetitive inventory work, but it does not create Meta approval, bypass listing '
          + 'limits, or guarantee continued Marketplace access.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/jeep-wagoneer-before.webp',
        after: '/studio/jeep-wagoneer-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2024 Jeep Wagoneer before AutoLander',
        afterAlt: 'The same 2024 Jeep Wagoneer as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'What professional Marketplace listings look like: AutoLander turns a real 2024 Jeep Wagoneer lot photo (left) into a showroom-grade shot (right), automatically.',
      },
      {
        type: 'qa',
        q: 'Why does Facebook Marketplace work so well for car dealers?',
        a: [
          'Three reasons: reach, intent and cost. Marketplace puts your vehicles in front of a huge local audience '
          + 'that is already searching to buy, those buyers message you directly in Messenger so leads land in one '
          + 'place, and organic listings do not cost per-click the way paid ads do. For a lot of dealers it is the '
          + 'highest-ROI channel they have — when it is kept current.',
          'The catch is the manual grind: a 150-car lot means 150 listings to build, keep priced correctly, and '
          + 'take down when they sell. That is exactly the work AutoLander automates so the channel actually scales.',
        ],
      },
      {
        type: 'steps',
        h2: 'How to use Facebook Marketplace as a car dealer',
        intro: 'The dealers who win on Marketplace treat it like inventory, not a one-off post. Here is the playbook.',
        steps: [
          { title: 'Confirm eligibility first', body: 'Check the Marketplace access, vehicle category, monthly limits and commercial-seller rules shown for the account. Meta’s business inventory and paid-ad products vary by market; do not assume a personal-profile posting API is approved.' },
          { title: 'Get your inventory in', body: 'Pull vehicles from your feed or DMS instead of typing them — AutoLander syncs CarGurus, Cars.com or a custom export so listings match your real lot. See the [integrations](/integrations/) page.' },
          { title: 'Make every listing look professional', body: 'Lead with clean, well-ordered photos and an accurate, VIN-specific description. AutoLander’s AI Photo Studio swaps lot backgrounds for showroom backdrops and adds a walkaround video.' },
          { title: 'Respond fast and keep it current', body: 'Answer Messenger leads quickly, refresh prices, and take sold cars down immediately. AutoLander refreshes listings and removes sold units automatically via [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'Measure what actually sells', body: 'Track which listings led to real sales — not just views — so you double down on what works. AutoLander’s post-to-sale attribution does this for you.' },
        ],
      },
      {
        type: 'table',
        h2: 'Posting Marketplace by hand vs. with AutoLander',
        intro: 'The work is the same; the time and accuracy are not.',
        head: ['Job', 'By hand', 'With AutoLander'],
        alCol: 2,
        rows: [
          ['Getting inventory in', 'Type every car manually', 'Auto-synced from your feed or DMS'],
          ['Photos', 'Raw lot phone snaps', 'AI showroom backdrops + walkaround video'],
          ['Preparing the lot', 'One VIN at a time', 'Inventory queue with configurable posting controls'],
          ['Sold cars', 'You remember to delete them', 'Removed automatically when sold'],
          ['Knowing what sold', 'Guesswork', 'Post-to-sale attribution'],
          ['Platform risk', 'Lowest automation risk', 'Still subject to Meta eligibility, limits and enforcement'],
        ],
        note: 'Meta account eligibility, monthly listing limits, terms and enforcement still apply to every workflow.',
      },
      {
        type: 'features',
        h2: 'How AutoLander automates Facebook Marketplace for your dealership',
        intro: 'Everything below is built to make Marketplace scale without a salesperson re-listing VINs all week.',
        cards: [
          { title: 'Automatic inventory sync', body: 'Reads vehicles, prices and photos from your CarGurus or Cars.com feed, or a custom feed/export, so eligible Marketplace listings can track your lot.' },
          { title: 'AI Photo Studio', body: 'Replaces messy lot backgrounds with clean showroom backdrops so every listing looks like a professional shoot.' },
          { title: 'Native desktop app', body: 'Posts through your normal Facebook session on your own computer — not a browser extension or a shared cloud server.' },
          { title: 'Automatic sold-removal', body: 'Removes the matching listing after the feed marks a vehicle sold, reducing stale-listing inquiries.' },
          { title: 'Post-to-sale attribution', body: 'Shows which Marketplace listings led to actual vehicle sales, so you know your real ROI.' },
          { title: 'Team dashboard', body: 'A live manager dashboard for rooftops and dealer groups, plus support for individual reps.' },
        ],
      },
      {
        type: 'qa',
        q: 'What is a car dealer advertising tool for Facebook Marketplace?',
        a: [
          'A car dealer advertising tool for Facebook Marketplace turns live inventory data into consistent '
          + 'vehicle listings, keeps price and availability aligned, improves listing presentation, routes buyer '
          + 'inquiries and measures appointments or sales. The useful distinction is whether the product only '
          + 'creates posts or manages the full inventory lifecycle.',
          'AutoLander combines feed sync, listing preparation, AI photo tools, sold-unit removal and post-to-sale '
          + 'attribution. Dealers should still verify that their intended posting method is eligible for the '
          + 'Facebook account and market before automating it.',
        ],
      },
      {
        type: 'qa',
        q: 'How can a dealer sell more cars on Facebook Marketplace?',
        a: [
          'Start with accurate prices, complete vehicle fields and a strong lead photo; answer useful buyer '
          + 'questions quickly; offer a concrete appointment; and remove sold inventory immediately. Measure '
          + 'qualified conversations, appointments and sales instead of judging a listing only by views.',
          'Our [how to sell cars on Facebook Marketplace guide](/guide/how-to-sell-cars-on-facebook-marketplace/) '
          + 'covers the full listing, follow-up and transaction workflow. AutoLander handles repetitive inventory '
          + 'tasks so the sales team can focus on the buyer conversation.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What effective dealer Marketplace workflows have in common',
        items: [
          'They treat eligible Marketplace listings like live inventory — accurate fields, prompt updates and sold-unit reconciliation.',
          'Their listings look professional: clean photos, smart photo order, accurate VIN-specific descriptions.',
          'They follow the current eligibility and listing limits shown for the account instead of treating software as a way around platform rules.',
          'They measure post-to-sale, not vanity views, so they know which listings actually move metal.',
          'They automate the grind with a tool like AutoLander — published plans from $39/mo with 5 free posts to start.',
        ],
      },
      {
        type: 'callout',
        title: 'Be clear-eyed about the rules',
        body: 'Meta’s terms prohibit unauthorized automated access, and Marketplace eligibility, listing limits '
          + 'and business inventory options can change. AutoLander keeps the session on the dealer’s own machine, '
          + 'but that architecture is not Meta approval and cannot guarantee uninterrupted access. Read the '
          + '[honest automation guide](/guide/facebook-marketplace-automation/) and see the '
          + '[safest auto poster](/safest-facebook-marketplace-auto-poster/) page before you start.',
      },
    ],
    faq: [
      ['Is it against Facebook’s rules for dealers to use Marketplace?',
        '[Meta says Marketplace is intended for consumers](https://www.facebook.com/help/1968285150185577) and businesses that list may be blocked or have listings removed. Its Terms also prohibit unauthorized automated access. AutoLander’s local desktop architecture is not Meta permission and cannot guarantee access. Confirm the current rules shown for the account and read our [automation policy and safety guide](/guide/facebook-marketplace-automation/).'],
      ['How do car dealers post their inventory to Facebook Marketplace?',
        'Eligible dealers either prepare listings by hand or use [Facebook Marketplace listing software](/facebook-marketplace-listing-software/) to sync inventory and reduce repetitive entry. Any software workflow remains subject to Meta’s current account eligibility, monthly listing limits and policies.'],
      ['How many cars can a dealer list on Facebook Marketplace?',
        'Meta’s current Help Center documents monthly limits of 5 new listings in Vehicles and 20 total Marketplace listings. Availability and enforcement can vary, but every newly created listing can count even if deleted. AutoLander can prepare and manage a large feed, but it cannot override the limits shown for a Facebook account.'],
      ['Does Facebook Marketplace cost dealers anything?',
        'Meta does not currently publish a fee for creating an ordinary Marketplace listing, although optional ads and third-party tools have their own costs and product terms can change. AutoLander publishes self-serve plans from $39/mo with 5 free posts to start. See the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['What is the best tool for car dealers on Facebook Marketplace?',
        'It depends on workflow depth, photo quality, inventory sync, reporting and price. We compare the main options head-to-head in our [2026 comparison](/compare/). AutoLander is a strong fit for dealers that want inventory sync, AI photos and video, sold-removal and attribution in one desktop workflow.'],
      ['Can AutoLander remove sold cars from Marketplace automatically?',
        'Yes. When a car is marked sold or drops out of the feed, AutoLander removes the matching Marketplace listing during reconciliation, reducing stale-listing inquiries. The add-and-remove behavior is handled by [inventory sync](/facebook-marketplace-inventory-sync/).'],
    ],
    cta: {
      heading: 'Make Facebook Marketplace your best used-car channel',
      sub: 'See plans and book a demo — automatic listing, showroom-grade photos, sold-removal and post-to-sale attribution, on your own inventory.',
    },
    relatedHeading: 'Explore AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Facebook Marketplace listing software & tools', url: SITE.origin + NAV.listingSw.path },
        { name: 'Bulk post cars to Facebook Marketplace', url: SITE.origin + NAV.bulk.path },
        { name: 'Facebook Marketplace inventory sync & DMS feed', url: SITE.origin + NAV.inventory.path },
        { name: 'Safest Facebook Marketplace auto poster', url: SITE.origin + NAV.safety.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
        { name: 'Facebook Marketplace auto poster pricing', url: SITE.origin + NAV.pricing.path },
      ],
    },
  },
];
