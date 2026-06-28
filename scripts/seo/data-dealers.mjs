// DEALERS page — targets the use-case/playbook intent: facebook marketplace for car dealers.
// This is a broader, more educational query than the category spine's "auto poster" tool head
// term, so the page leads with the dealer playbook (can dealers sell there? catalog vs profile,
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
    title: 'Facebook Marketplace for Car Dealers: Sell More Cars in 2026 | AutoLander',
    description:
      'Facebook Marketplace for car dealers — how dealerships sell more cars on Marketplace: the rules, catalog '
      + 'vs profile, getting your inventory listed, and how to automate it with AutoLander. From $39/mo, 5 free '
      + 'posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & dealerships',
    h1: 'Facebook Marketplace for car dealers',
    bylineUpdated: true,
    tldr:
      'Facebook Marketplace is one of the biggest sources of local, high-intent car buyers — and dealers can sell '
      + 'there, but it was built for individuals, so how you do it matters. Meta sanctions the vehicle catalog '
      + 'route; the organic local reach lives in Marketplace itself. AutoLander is a native desktop app that '
      + 'automates the Marketplace side: it lists your whole inventory, enhances photos, removes sold units and '
      + 'tracks which listings sold cars. Plans from $39/mo with 5 free posts.',
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
          'Yes — Facebook Marketplace is one of the most popular places people shop for used cars locally, and '
          + 'dealers sell on it every day. But Marketplace was built for individuals, so there are two routes and '
          + 'they are not the same. Meta’s officially sanctioned route for dealers is the Facebook vehicle '
          + 'inventory/catalog, set up through Meta and your feed provider. The other route is posting your '
          + 'inventory from a profile into Marketplace, where the organic local browsing actually happens.',
          'Posting from a profile is where most of the unstructured local buyer traffic is — but automating a '
          + 'personal profile is a gray area, which is why how you post matters as much as that you post. AutoLander '
          + 'is built to automate that Marketplace side safely; the trade-offs are covered honestly throughout this '
          + 'page and in our [honest automation guide](/guide/facebook-marketplace-automation/).',
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
          { title: 'Decide your route', body: 'Run Meta’s sanctioned vehicle catalog for the structured route, and post to Marketplace for the organic local reach. Many dealers do both — see [Facebook listing software](/facebook-listing-software/) for the catalog-vs-Marketplace trade-off.' },
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
          ['Posting the lot', 'One VIN at a time', 'Whole lot queued, posted at a human-like pace'],
          ['Sold cars', 'You remember to delete them', 'Removed automatically when sold'],
          ['Knowing what sold', 'Guesswork', 'Post-to-sale attribution'],
          ['Account safety', 'Easy to over-post and get flagged', 'Paced posting from your own machine'],
        ],
        note: 'Marketplace was built for individuals; automating a personal profile is a gray area with any tool.',
      },
      {
        type: 'features',
        h2: 'How AutoLander automates Facebook Marketplace for your dealership',
        intro: 'Everything below is built to make Marketplace scale without a salesperson re-listing VINs all week.',
        cards: [
          { title: 'Automatic inventory sync', body: 'Lists vehicles, prices and photos straight from your CarGurus or Cars.com feed, or a custom feed/export, so Marketplace always matches your lot.' },
          { title: 'AI Photo Studio', body: 'Replaces messy lot backgrounds with clean showroom backdrops so every listing looks like a professional shoot.' },
          { title: 'Native desktop app', body: 'Posts through your normal Facebook session on your own computer — not a browser extension or a shared cloud server.' },
          { title: 'Automatic sold-removal', body: 'Takes a listing down the moment the car sells, so buyers never message about a unit that is gone.' },
          { title: 'Post-to-sale attribution', body: 'Shows which Marketplace listings led to actual vehicle sales, so you know your real ROI.' },
          { title: 'Team dashboard', body: 'A live manager dashboard for rooftops and dealer groups, plus support for individual reps.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What separates dealers who win on Facebook Marketplace',
        items: [
          'They treat Marketplace like live inventory — every car listed, always current, sold units gone within minutes.',
          'Their listings look professional: clean photos, smart photo order, accurate VIN-specific descriptions.',
          'They post at a human-like pace from their own machine instead of mass-blasting a profile and getting flagged.',
          'They measure post-to-sale, not vanity views, so they know which listings actually move metal.',
          'They automate the grind with a tool like AutoLander — published plans from $39/mo with 5 free posts to start.',
        ],
      },
      {
        type: 'callout',
        title: 'Be clear-eyed about the rules',
        body: 'Facebook Marketplace was built for individuals, and the route Meta sanctions for dealers is its '
          + 'official vehicle inventory/catalog. Posting a personal profile with any tool is common but a gray area, '
          + 'and Meta’s policies can change. AutoLander paces posting and keeps your session on your own machine to '
          + 'lower technical flag triggers, but no honest vendor can promise you will never be flagged. Read the '
          + '[honest automation guide](/guide/facebook-marketplace-automation/) and see the '
          + '[safest auto poster](/safest-facebook-marketplace-auto-poster/) page before you start.',
      },
    ],
    faq: [
      ['Is it against Facebook’s rules for dealers to use Marketplace?',
        'It is a gray area. Marketplace was built for individuals, and Meta’s sanctioned route for dealers is the official vehicle inventory/catalog. Posting inventory from a personal profile — by any tool — is common but not officially blessed, and policies can change. AutoLander reduces the obvious technical triggers by pacing posts and keeping your session on your own machine, but treat that as risk reduction, not a guarantee. See our [honest automation guide](/guide/facebook-marketplace-automation/).'],
      ['How do car dealers post their inventory to Facebook Marketplace?',
        'Either by hand — building each listing one VIN at a time — or with [Facebook Marketplace listing software](/facebook-marketplace-listing-software/) that syncs your feed and lists every vehicle for you. AutoLander does the latter and can [bulk post your whole lot](/bulk-post-cars-to-facebook-marketplace/) at a safe, human-like pace.'],
      ['How many cars can a dealer list on Facebook Marketplace?',
        'There is no hard cap in AutoLander — it can list 30 cars or 300 straight from your feed. The practical limit is your own account’s posting behavior, which is why AutoLander paces listings at a human-like rate instead of dumping everything at once. A big lot goes up safely over time.'],
      ['Does Facebook Marketplace cost dealers anything?',
        'Organic Marketplace listings are free to post. Meta’s vehicle catalog and any boosted/ad placements have their own costs. The tool you use to automate posting is the other cost — AutoLander publishes self-serve plans from $39/mo with 5 free posts to start. See the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['What is the best tool for car dealers on Facebook Marketplace?',
        'It depends on automation depth, photo quality, account-safety model and price. We compare the main options head-to-head in our [2026 comparison](/compare/). For most dealers AutoLander wins on bundling inventory sync, AI photos and video, sold-removal and attribution at the lowest entry price.'],
      ['Can AutoLander remove sold cars from Marketplace automatically?',
        'Yes. The moment a car sells or drops out of your feed, AutoLander takes its Marketplace listing down automatically, so buyers never message about a unit that is already gone. The add-and-remove behavior is handled by [inventory sync](/facebook-marketplace-inventory-sync/).'],
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
