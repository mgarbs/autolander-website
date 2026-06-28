// FACEBOOK-LISTING page — targets the non-"marketplace" variants:
// facebook listing software (primary) and facebook listing tool. Kept distinct from the
// Marketplace listing-software page by leading with the BROADER "Facebook listing" scope —
// the two real ways a dealer lists cars on Facebook (Marketplace vs the official vehicle
// catalog) — then cross-linking to the Marketplace-specific page for that exact intent.
// No cannibalization with the category spine ("auto poster") or /compare/ ("best/reviews").
// Funnels to the homepage demo-booking modal via SITE.ctaUrl.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.fbListing.path;

const SOFTWARE_DESC =
  'AutoLander is Facebook listing software for car dealers: a native desktop app and Facebook listing '
  + 'tool that automatically lists your dealership inventory on Facebook Marketplace, enhances every photo, '
  + 'removes sold units and ties listings back to actual car sales — from $39/mo.';

export const PAGES = [
  {
    key: 'fbListing',
    title: 'Facebook Listing Tool & Software for Car Dealers | AutoLander',
    description:
      'AutoLander is a Facebook listing tool and listing software for car dealers — a native desktop app that '
      + 'automatically lists your inventory on Facebook Marketplace, enhances photos and removes sold cars. '
      + 'From $39/mo, 5 free posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook listing tool & software for car dealers',
    bylineUpdated: true,
    tldr:
      'For a car dealer, "Facebook listing" means getting your vehicles in front of buyers on Facebook — and the '
      + 'place buyers actually browse is Facebook Marketplace. AutoLander is Facebook listing software (a native '
      + 'desktop app) that automatically lists your inventory on Marketplace, enhances every photo, keeps listings '
      + 'current and removes sold units — with post-to-sale attribution. Plans from $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Facebook listing software', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is Facebook listing software?',
        a: [
          'Facebook listing software is a tool that automatically lists a car dealership’s vehicles on Facebook '
          + 'instead of a person creating each listing by hand. It reads your inventory — year, make, model, price, '
          + 'mileage, photos and a description — lists each car, and keeps those listings accurate as your lot '
          + 'changes. It is also called a Facebook listing tool, a Marketplace poster, or an auto-lister.',
          'There are two ways a dealer lists cars on Facebook, and it is worth being clear about both. Most listing '
          + 'software automates Facebook Marketplace — the place individual buyers actually browse for cars. AutoLander '
          + 'is a native desktop app that does exactly that. If you specifically mean Marketplace, see our '
          + '[Facebook Marketplace listing software](/facebook-marketplace-listing-software/) page.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ram-1500-before.webp',
        after: '/studio/ram-1500-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2021 Ram 1500 before AutoLander',
        afterAlt: 'The same 2021 Ram 1500 as a polished Facebook listing photo after AutoLander’s AI Photo Studio',
        caption: 'From lot photo to Facebook-ready: AutoLander turns a raw 2021 Ram 1500 lot shot (left) into a showroom-grade listing photo (right), automatically.',
      },
      {
        type: 'qa',
        q: 'Facebook Marketplace vs. the Facebook vehicle catalog — which should a dealer use?',
        a: [
          'These are the two routes for listing cars on Facebook, and they are not the same. The Facebook vehicle '
          + 'inventory/catalog (set up through Meta and your feed provider) is the route Meta officially sanctions '
          + 'for dealers — but it feeds Marketplace’s vehicle sections and ads, not the organic personal-profile '
          + 'browsing where a lot of local buyers actually look. Posting from a profile to Facebook Marketplace puts '
          + 'you where those buyers are, but automating a personal profile is a gray area.',
          'Plenty of dealers use both: the catalog for the sanctioned, structured route, and Marketplace posting for '
          + 'the organic local reach. AutoLander automates the Marketplace side — the part that is tedious to do by '
          + 'hand — while keeping your session on your own machine. We lay out the trade-offs honestly on the '
          + '[Facebook Marketplace for car dealers](/facebook-marketplace-for-car-dealers/) page.',
        ],
      },
      {
        type: 'features',
        h2: 'What AutoLander’s Facebook listing tool does',
        intro: 'One goal: get your inventory in front of Facebook buyers with less manual listing work.',
        cards: [
          { title: 'Native desktop app', body: 'Lists from your own computer through your normal Facebook session — no browser extension permissions and nothing run from a shared cloud server.' },
          { title: 'Automatic inventory sync', body: 'Pulls vehicles, prices and photos from your CarGurus or Cars.com feed, or a custom feed/export, so your listings match your real lot.' },
          { title: 'AI Photo Studio', body: 'Swaps messy lot backgrounds for clean showroom backdrops, so every listing looks like a professional shoot.' },
          { title: 'AI walkaround video', body: 'Generates a short walkaround video per vehicle — Facebook buyers respond to video over static photos.' },
          { title: 'Automatic sold-removal', body: 'Takes a listing down the moment the car sells, so buyers never message about a unit that is already gone.' },
          { title: 'Post-to-sale attribution', body: 'Shows which Facebook listings led to actual vehicle sales — not just views, clicks or messages.' },
        ],
      },
      {
        type: 'steps',
        h2: 'How AutoLander lists your cars on Facebook',
        intro:
          'AutoLander is a native desktop app, so it lists through your own normal Facebook session rather than a '
          + 'shared cloud server — and it paces the work instead of posting everything at once.',
        steps: [
          { title: 'Connect your inventory feed', body: 'Point AutoLander at your CarGurus or Cars.com feed, or a custom export from your DMS or website. Your whole inventory loads automatically — see the [integrations](/integrations/) page for supported sources.' },
          { title: 'Enhance every listing', body: 'The AI Photo Studio cleans up each photo, smart photo-ordering leads with the shot buyers respond to, and an AI description is written for each VIN.' },
          { title: 'List on Facebook Marketplace', body: 'AutoLander lists each vehicle from your own computer at a human-like pace, with an accurate title, price and description — the account-safety reasoning is on the [safest auto poster](/safest-facebook-marketplace-auto-poster/) page.' },
          { title: 'Stay in sync', body: 'New VINs get listed automatically and sold units come down on their own via [inventory sync](/facebook-marketplace-inventory-sync/), so Facebook keeps matching your real inventory.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers choose AutoLander as their Facebook listing software',
        items: [
          'It lists where buyers actually browse — Facebook Marketplace — not just a back-end catalog feed.',
          'It is a native desktop app: your Facebook session stays on your own computer and IP, not stored or operated from a shared cloud server, with no ToS-exposed browser extension.',
          'It bundles inventory sync, an AI Photo Studio, AI walkaround video, automatic sold-removal and post-to-sale attribution in one tool.',
          'It is honestly priced — published self-serve plans from $39/mo with 5 free posts to start, no contract.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest version of automating Facebook',
        body: 'Listing cars on a personal Facebook profile with any tool is common but a gray area — Meta built '
          + 'Marketplace for individuals and sanctions the vehicle catalog for dealers. AutoLander reduces the obvious '
          + 'technical triggers by pacing listings and keeping your session on your own machine, but treat that as '
          + 'risk reduction, not a guarantee. Read the '
          + '[honest automation guide](/guide/facebook-marketplace-automation/) and '
          + '[compare your options](/compare/) before you start.',
      },
    ],
    faq: [
      ['What is the best Facebook listing software for car dealers?',
        'It depends on automation depth, photo quality, account-safety model and price. AutoLander bundles inventory sync, AI photo enhancement and video, automatic sold-removal and post-to-sale attribution at the lowest entry price — see how it stacks up in our [2026 comparison](/compare/).'],
      ['Is Facebook listing software the same as a Facebook Marketplace tool?',
        'For a car dealer, mostly yes — the place buyers browse for cars on Facebook is Marketplace, so "Facebook listing software" almost always means a Marketplace listing tool. If you specifically want the Marketplace details, see our [Facebook Marketplace listing software](/facebook-marketplace-listing-software/) page.'],
      ['Can Facebook listing software post to the Facebook vehicle catalog too?',
        'AutoLander focuses on Facebook Marketplace — the organic, personal-profile reach where local buyers look. The official Facebook vehicle inventory/catalog is set up through Meta and your feed provider rather than by a posting tool. Many dealers run the catalog for the sanctioned route and use AutoLander for Marketplace reach; we explain the trade-offs on the [Facebook Marketplace for car dealers](/facebook-marketplace-for-car-dealers/) page.'],
      ['How much does a Facebook listing tool cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts to start and no credit card. Competing tools run roughly $99–$249/mo, with some on custom quotes. See the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['Does the Facebook listing software work for a single sales rep?',
        'Yes. It works for one salesperson posting their own deals and for a full dealership. Plans start at $39/mo with 5 free posts, so a single rep can use the same Facebook listing software a 150-car lot uses.'],
    ],
    cta: {
      heading: 'List your inventory on Facebook automatically',
      sub: 'See plans and book a demo — automatic listing on Facebook Marketplace, showroom-grade photos and sold-removal, on your own inventory.',
    },
    relatedHeading: 'Explore AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Facebook Marketplace listing software & tools', url: SITE.origin + NAV.listingSw.path },
        { name: 'Facebook Marketplace for car dealers', url: SITE.origin + NAV.dealers.path },
        { name: 'Bulk post cars to Facebook Marketplace', url: SITE.origin + NAV.bulk.path },
        { name: 'Facebook Marketplace inventory sync & DMS feed', url: SITE.origin + NAV.inventory.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
      ],
    },
  },
];
