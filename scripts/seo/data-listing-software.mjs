// LISTING-SOFTWARE page — targets the highest-value commercial cluster:
// facebook marketplace listing software (primary), facebook marketplace listing tool,
// facebook marketplace listing tools (plural), facebook marketplace posting software.
// These four are near-synonyms Google reads as one intent, so they share ONE strong page
// (separate pages would cannibalize). Deliberately does NOT re-target the "auto poster" head
// term (that lives on the category spine) or "best/reviews/tools" buyer-guide intent (that
// lives on /compare/). Funnels to the homepage demo-booking modal via SITE.ctaUrl.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.listingSw.path;

const SOFTWARE_DESC =
  'AutoLander is Facebook Marketplace listing software for car dealers: a native desktop app that '
  + 'automatically lists your whole dealership inventory on Facebook Marketplace, syncs your feed, '
  + 'enhances every photo with an AI Photo Studio, removes sold units and ties posts back to actual '
  + 'car sales — from $39/mo.';

export const PAGES = [
  {
    key: 'listingSw',
    title: 'Facebook Marketplace Listing Software for Car Dealers | AutoLander',
    description:
      'AutoLander is Facebook Marketplace listing software and a listing tool for car dealers — a native '
      + 'desktop app that automatically lists your whole inventory on Marketplace, syncs your feed, enhances '
      + 'photos and removes sold cars. Marketplace posting software from $39/mo, 5 free posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace listing software for car dealers',
    bylineUpdated: true,
    tldr:
      'AutoLander is Facebook Marketplace listing software for car dealers — also called a Marketplace '
      + 'listing tool or posting software. It is a native desktop app that automatically lists your whole '
      + 'inventory on Facebook Marketplace, refreshes listings as prices change, removes sold units, and turns '
      + 'raw lot photos into showroom-grade shots — with post-to-sale attribution so you know which listings '
      + 'actually sold cars. Plans from $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Listing software', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is Facebook Marketplace listing software?',
        a: [
          'Facebook Marketplace listing software is a tool that automatically creates and manages a car '
          + 'dealership’s Marketplace listings instead of a person building each one by hand. It is also called a '
          + 'Facebook Marketplace listing tool, Marketplace posting software, or an auto-lister. The software reads '
          + 'your vehicles — year, make, model, price, mileage, photos and a description — lists each one on '
          + 'Marketplace, and then keeps those listings current as your inventory changes.',
          'AutoLander is Facebook Marketplace listing software built specifically for car dealers and sales reps. '
          + 'It runs as a native desktop app on your own computer, so it lists through your normal Facebook session '
          + 'rather than a browser extension or a shared cloud server. The underlying posting engine is the same one '
          + 'covered on the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) page.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/kia-k5-before.webp',
        after: '/studio/kia-k5-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2022 Kia K5 before AutoLander',
        afterAlt: 'The same 2022 Kia K5 as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'AutoLander’s AI Photo Studio, automatically: a real dealer lot photo (left) becomes a showroom-grade Facebook Marketplace listing (right).',
      },
      {
        type: 'qa',
        q: 'What should the best Facebook Marketplace listing tool do for a dealership?',
        a: [
          'A good listing tool does five jobs: it syncs your inventory from a feed or DMS, lists every vehicle on '
          + 'Facebook Marketplace, keeps the listings fresh as prices and inventory change, removes sold units '
          + 'automatically, and routes buyer messages back to your team. The better tools also improve the photos '
          + 'and tie each listing back to an actual car sale.',
          'The payoff is more buyers on every vehicle, more Messenger leads and test drives, and faster inventory '
          + 'turn — without a salesperson manually re-listing 150 VINs by hand every week.',
        ],
      },
      {
        type: 'features',
        h2: 'What AutoLander’s Facebook Marketplace listing software includes',
        intro: 'Every feature is built around one goal: more buyers on every car, with less manual listing work.',
        cards: [
          { title: 'Native desktop app', body: 'Lists from your own computer through your normal Facebook session — no browser extension permissions and nothing operated from a shared cloud server.' },
          { title: 'Automatic inventory sync', body: 'Pulls vehicles, prices and photos from your CarGurus or Cars.com feed (or a custom feed/export) so your Marketplace listings always match your lot.' },
          { title: 'AI Photo Studio', body: 'Replaces messy lot backgrounds with clean showroom backdrops, so every listing looks like a professional shoot instead of a phone snap.' },
          { title: 'AI walkaround video', body: 'Generates a short walkaround video for each vehicle — Marketplace and buyers favor video over static photos.' },
          { title: 'Automatic sold-removal', body: 'Deletes a listing the moment the car sells or the feed marks it sold, so buyers never message about a unit that is gone.' },
          { title: 'Post-to-sale attribution', body: 'Tracks which Marketplace listings led to actual vehicle sales — not just clicks, views or messages.' },
          { title: 'Smart photo ordering', body: 'Leads with the front-three-quarter shot buyers respond to, automatically, on every vehicle.' },
          { title: 'AI-written descriptions', body: 'Writes a clear, accurate, VIN-specific description for each listing so you are not copying and pasting.' },
        ],
      },
      {
        type: 'steps',
        h2: 'How AutoLander lists your dealership inventory on Facebook Marketplace',
        steps: [
          { title: 'Connect your inventory', body: 'Point AutoLander at your CarGurus or Cars.com feed, or a custom export from your DMS or website. Your vehicles load automatically — see the supported sources on the [integrations](/integrations/) page.' },
          { title: 'Enhance photos and video', body: 'The AI Photo Studio swaps lot backgrounds for showroom backdrops and generates a walkaround video for each car before it goes up.' },
          { title: 'Auto-list from your own computer', body: 'AutoLander lists each vehicle on Marketplace through your normal session, at a human-like pace, with an accurate title, price and description — a deliberate account-safety choice covered on the [safest auto poster](/safest-facebook-marketplace-auto-poster/) page.' },
          { title: 'Keep it accurate and measure it', body: 'Listings refresh as prices change, sold units come down automatically via [inventory sync](/facebook-marketplace-inventory-sync/), and post-to-sale attribution shows which listings moved metal.' },
        ],
      },
      {
        type: 'qa',
        q: 'Is AutoLander a Facebook Marketplace posting software too, or just a listing tool?',
        a: [
          'Both — they are the same thing. "Listing software," "listing tool," "listing tools" and "posting '
          + 'software" all describe one job: getting your vehicles onto Facebook Marketplace automatically and '
          + 'keeping them accurate. AutoLander does the full loop — it posts each listing, refreshes it, and removes '
          + 'it when the car sells.',
          'If you want to put your entire lot up at once, AutoLander is also built to [bulk post cars to Facebook '
          + 'Marketplace](/bulk-post-cars-to-facebook-marketplace/) from your feed — at a safe, human-like pace '
          + 'rather than blasting every listing in one suspicious burst.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers choose AutoLander as their Facebook Marketplace listing software',
        items: [
          'It is a native desktop app — your Facebook session stays on your own computer, not stored or operated from a shared cloud server, and there is no browser extension to grant sensitive permissions to.',
          'It is the only listing tool that bundles automatic inventory sync, an AI Photo Studio (showroom backgrounds), AI walkaround video, automatic sold-removal and post-to-sale attribution in one flow.',
          'It is honestly priced: published, self-serve plans from $39/mo with 5 free posts to start — no enterprise quote, no contract.',
          'It works for both individual reps and full dealerships, with a live manager dashboard for teams.',
        ],
      },
      {
        type: 'callout',
        title: 'A note on account safety',
        body: 'Automating a personal Facebook profile is a gray area no matter which listing software you use — and '
          + 'the route Meta sanctions for dealers is its official vehicle inventory/catalog. AutoLander’s native-app '
          + 'approach keeps your session on your own machine and IP, which is a deliberate account-health choice, but '
          + 'no honest vendor can promise you will never be flagged. See our '
          + '[safest auto poster](/safest-facebook-marketplace-auto-poster/) page and '
          + '[honest automation guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['What is the best Facebook Marketplace listing software for car dealers?',
        'It depends on what you need — automation depth, photo quality, account-safety model and price. We put AutoLander head-to-head against the main tools (CARVID, Sell With Drift, RelayAuto, AutoLister Pro, Shiftly, AutoBook.io and Glo3D) in our [2026 comparison](/compare/) so you can judge for yourself. For most dealers, AutoLander wins on bundling inventory sync, AI photos and video, sold-removal and attribution at the lowest entry price.'],
      ['How much does Facebook Marketplace listing software cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts to start and no credit card required. Competing tools range from about $99/mo (Sell With Drift, AutoLister Pro) to $249/mo (CARVID), with some (Shiftly, RelayAuto) using custom quotes. See our [pricing page](/facebook-marketplace-auto-poster-pricing/) for the full breakdown.'],
      ['Is there free Facebook Marketplace listing software?',
        'Truly free options mean listing every car by hand. Most real listing software is paid because it is doing ongoing work — syncing your feed, enhancing photos, removing sold units. AutoLander gives you 5 free posts with no credit card so you can try the actual software before paying, then plans start at $39/mo.'],
      ['What is the difference between a Facebook Marketplace listing tool and posting software?',
        'Nothing meaningful — they are different names for the same category. Some dealers say "listing tool," others say "posting software" or "auto-lister." AutoLander is all of the above: it lists (posts) your vehicles on Marketplace, keeps them current, and takes them down when they sell.'],
      ['Can the listing software post my whole inventory at once?',
        'Yes — AutoLander loads your entire inventory from a feed and is built to [bulk post cars to Facebook Marketplace](/bulk-post-cars-to-facebook-marketplace/), but at a human-like pace rather than dumping every listing in one burst. A 150-car lot goes up safely over time and then stays in sync automatically.'],
      ['Does AutoLander work as a listing tool for a single sales rep?',
        'Yes. AutoLander works for one salesperson posting their own deals as well as for a full rooftop or dealer group. Plans start at $39/mo with 5 free posts and no credit card, so an individual rep can use the same Facebook Marketplace listing software a 150-car lot uses, just scaled down.'],
    ],
    cta: {
      heading: 'Put your Marketplace listings on autopilot',
      sub: 'See plans and book a demo — automatic listing, showroom-grade photos and post-to-sale attribution, on your own inventory.',
    },
    relatedHeading: 'Explore AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Facebook Marketplace for car dealers', url: SITE.origin + NAV.dealers.path },
        { name: 'Facebook listing software & tool', url: SITE.origin + NAV.fbListing.path },
        { name: 'Bulk post cars to Facebook Marketplace', url: SITE.origin + NAV.bulk.path },
        { name: 'Facebook Marketplace inventory sync & DMS feed', url: SITE.origin + NAV.inventory.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
        { name: 'Facebook Marketplace auto poster pricing', url: SITE.origin + NAV.pricing.path },
      ],
    },
  },
];
