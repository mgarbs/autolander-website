// CATEGORY page — the new silo's spine. Targets SINGULAR product/category head terms
// (facebook marketplace auto poster [for car dealers], posting/listing/automation software,
// dealer software, vehicle listing software, car listing tool, auto lister). "Best/reviews/tools"
// buyer-guide intent intentionally lives on /compare/ (no cannibalization). Funnels to / and /#pricing.
//
// This file is the REFERENCE implementation of the page-object contract (see scripts/seo/shell.mjs).

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.category.path;

const SOFTWARE_DESC =
  'AutoLander is a Facebook Marketplace auto poster for car dealers: a native desktop app that '
  + 'automatically posts dealership inventory to Facebook Marketplace, syncs your feed, removes sold '
  + 'units, and enhances every photo with an AI Photo Studio and walkaround video — from $39/mo.';

export const PAGES = [
  {
    key: 'category',
    title: 'Facebook Marketplace Auto Poster for Car Dealers | AutoLander',
    description:
      'AutoLander is a Facebook Marketplace auto poster and posting software for car dealers — a native '
      + 'desktop app that automatically lists your whole inventory, syncs your feed, removes sold cars and '
      + 'enhances every photo. Vehicle listing software from $39/mo, 5 free posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace auto poster for car dealers',
    bylineUpdated: true,
    tldr:
      'AutoLander is a Facebook Marketplace auto poster for car dealers: a native desktop app that '
      + 'automatically posts your whole inventory to Marketplace, refreshes listings as prices change, '
      + 'removes sold units, and turns raw lot photos into showroom-grade shots — with post-to-sale '
      + 'attribution so you know which posts actually sold cars. Plans from $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is a Facebook Marketplace auto poster?',
        a: [
          'A Facebook Marketplace auto poster is software that automatically publishes a car dealership’s '
          + 'inventory to Facebook Marketplace instead of a person creating each listing by hand. It is also '
          + 'called Marketplace posting software, listing software, an auto lister, or Facebook Marketplace '
          + 'automation software. The tool reads your vehicles — year, make, model, price, mileage, photos and '
          + 'a description — and posts each one to Marketplace, then keeps the listings current as inventory changes.',
          'AutoLander is a Facebook Marketplace auto poster built specifically for car dealers and sales reps. '
          + 'It runs as a native desktop app on your own computer, so it posts through your normal Facebook '
          + 'session rather than a browser extension or a shared cloud server.',
        ],
      },
      {
        type: 'qa',
        q: 'What does a Facebook Marketplace auto poster do for a car dealership?',
        a: [
          'Good dealer software does five jobs: it syncs your inventory from a feed or DMS, posts every vehicle '
          + 'to Facebook Marketplace, keeps listings fresh as prices and inventory change, removes sold units '
          + 'automatically, and routes buyer messages back to your team. The better tools also improve the photos '
          + 'and tie posts back to actual car sales.',
          'The payoff is more buyers on every listing, more Messenger leads and test drives, and faster inventory '
          + 'turn — without a salesperson manually re-posting 150 VINs by hand every week.',
        ],
      },
      {
        type: 'features',
        h2: 'What AutoLander’s Facebook Marketplace posting software includes',
        intro: 'Every feature is built around one goal: more buyers on every car, with less manual work.',
        cards: [
          { title: 'Native desktop app', body: 'Posts from your own computer through your normal Facebook session — no browser extension permissions and nothing operated from a shared cloud server.' },
          { title: 'Automatic inventory sync', body: 'Pulls vehicles, prices and photos from your CarGurus or Cars.com feed (or a custom feed/export) so Marketplace always matches your lot.' },
          { title: 'AI Photo Studio', body: 'Replaces messy lot backgrounds with clean showroom backdrops, so every listing looks like a professional shoot instead of a phone snap.' },
          { title: 'AI walkaround video', body: 'Generates a short walkaround video for each vehicle — Marketplace and buyers favor video over static photos.' },
          { title: 'Automatic sold-removal', body: 'Deletes a listing the moment the car sells or the feed marks it sold, so buyers never message about a unit that is gone.' },
          { title: 'Post-to-sale attribution', body: 'Tracks which Marketplace posts led to actual vehicle sales — not just clicks, views or messages.' },
          { title: 'Smart photo ordering', body: 'Leads with the front-three-quarter shot buyers respond to, automatically, on every vehicle.' },
          { title: 'AI-written descriptions', body: 'Writes a clear, accurate, VIN-specific description for each listing so you are not copying and pasting.' },
        ],
      },
      {
        type: 'steps',
        h2: 'How AutoLander posts your dealership inventory to Facebook Marketplace',
        steps: [
          { title: 'Connect your inventory', body: 'Point AutoLander at your CarGurus or Cars.com feed, or a custom export from your DMS or website. Your vehicles load automatically.' },
          { title: 'Enhance photos and video', body: 'The AI Photo Studio swaps lot backgrounds for showroom backdrops and generates a walkaround video for each car.' },
          { title: 'Auto-post from your own computer', body: 'AutoLander posts each vehicle to Facebook Marketplace through your normal session, at a human-like pace, with an accurate title, price and description.' },
          { title: 'Keep it accurate and measure it', body: 'Listings refresh as prices change, sold units come down automatically, and post-to-sale attribution shows which posts moved metal.' },
        ],
      },
      {
        type: 'qa',
        q: 'Is AutoLander a good Facebook Marketplace listing tool for individual sales reps?',
        a: [
          'Yes. AutoLander works for a single salesperson posting their own deals as well as for a full rooftop or '
          + 'dealer group. Plans start at $39/mo and you get 5 free posts to try it with no credit card, so an '
          + 'individual rep can use the same vehicle listing software a 150-car lot uses, just scaled down.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers choose AutoLander as their Facebook Marketplace dealer software',
        items: [
          'It is a native desktop app — your Facebook session stays on your own computer, not stored or operated from a shared cloud server, and there is no browser extension to grant sensitive permissions to.',
          'It is the only option that bundles automatic inventory sync, an AI Photo Studio (showroom backgrounds), AI walkaround video, automatic sold-removal and post-to-sale attribution in one flow.',
          'It is honestly priced: published, self-serve plans from $39/mo with 5 free posts to start — no enterprise quote, no contract.',
          'It works for both individual reps and full dealerships, with a live manager dashboard for teams.',
        ],
      },
      {
        type: 'callout',
        title: 'A note on account safety',
        body: 'Automating a personal Facebook profile is a gray area no matter which tool you use. AutoLander’s '
          + 'native-app approach keeps your session on your own machine and IP, which is a deliberate account-health '
          + 'choice — but no honest vendor can promise you will never be flagged. See our safety page and automation guide.',
      },
    ],
    faq: [
      ['What is the best Facebook Marketplace auto poster for car dealers?',
        'It depends on what you need — automation depth, photo quality, account-safety model and price. We put AutoLander head-to-head against the main tools (CARVID, Sell With Drift, RelayAuto, AutoLister Pro, Shiftly, AutoBook.io and Glo3D) in our 2026 comparison so you can judge for yourself. For most dealers, AutoLander wins on bundling inventory sync, AI photos and video, sold-removal and attribution at the lowest entry price.'],
      ['How much does a Facebook Marketplace auto poster cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts to start and no credit card required. Competing tools range from about $99/mo (Sell With Drift, AutoLister Pro) to $249/mo (CARVID), with some (Shiftly, RelayAuto) using custom quotes. See our pricing page for the full breakdown.'],
      ['Does AutoLander work as Facebook Marketplace vehicle listing software for a whole lot?',
        'Yes. AutoLander syncs your entire inventory from a CarGurus or Cars.com feed (or a custom feed/export), posts every vehicle, and removes sold units automatically — so a 150-car lot stays accurate on Marketplace without manual re-posting.'],
      ['Can I bulk post my whole inventory to Facebook Marketplace at once?',
        'Yes — AutoLander is built to bulk post cars to Facebook Marketplace from your feed, at a human-like pace, rather than blasting everything in one suspicious burst. See the bulk-posting page for how it works.'],
      ['Is using a Facebook Marketplace auto poster against the rules?',
        'Marketplace was built for individuals, and Meta has a sanctioned dealer route via official vehicle inventory/catalog listings. Automating posts from a personal profile — by any tool — is common but a gray area, and Meta’s policies can change. AutoLander keeps your session on your own machine to lower technical flag triggers, but no tool can guarantee against a ban. Read our honest automation guide before you start.'],
    ],
    cta: {
      heading: 'Put your inventory on Facebook Marketplace autopilot',
      sub: 'See plans and book a demo — automatic posting, showroom-grade photos and post-to-sale attribution, on your own inventory.',
    },
    relatedHeading: 'Explore AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Facebook Marketplace inventory sync & DMS feed', url: SITE.origin + NAV.inventory.path },
        { name: 'Bulk post cars to Facebook Marketplace', url: SITE.origin + NAV.bulk.path },
        { name: 'Facebook Marketplace integrations & DMS feeds', url: SITE.origin + NAV.integHub.path },
        { name: 'Safest Facebook Marketplace auto poster', url: SITE.origin + NAV.safety.path },
        { name: 'Facebook Marketplace auto poster pricing', url: SITE.origin + NAV.pricing.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
      ],
    },
  },
];
