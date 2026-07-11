// FACEBOOK-LISTING page — targets the non-"marketplace" variants:
// facebook listing software (primary) and facebook listing tool. Kept distinct from the
// Marketplace listing-software page by leading with the BROADER "Facebook listing" scope —
// the broader Facebook-listing workflow, then cross-linking to the Marketplace-specific page.
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
    title: 'Facebook Listing Software for Car Dealers | AutoLander',
    description:
      'Facebook listing software for car dealers that auto-posts inventory to Marketplace, enhances photos and '
      + 'removes sold cars. From $39/mo, 5 free posts.',
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
          'Marketplace features, listing categories and dealer eligibility vary by account and market, so a dealer '
          + 'should first confirm that its account can create the vehicle listings it needs. AutoLander is a native '
          + 'desktop workflow for preparing and maintaining eligible Marketplace listings. If you specifically mean Marketplace, see our '
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
        q: 'Can every car dealer list vehicles on Facebook Marketplace?',
        a: [
          'No. Marketplace availability, vehicle categories and selling limits can vary by account, location and '
          + 'Meta product changes. Meta’s Help Center currently states a monthly limit of five new Vehicles listings '
          + 'and a total monthly limit of 20 Marketplace listings, but dealers should verify the current rules inside '
          + 'their own accounts before building a workflow around them.',
          'AutoLander helps an eligible dealer prepare listings from inventory data, enhance the creative, manage a '
          + 'configurable queue and reconcile sold units. It cannot unlock Marketplace access, change an account’s '
          + 'limits or create Meta approval. Our [dealer Marketplace guide](/guide/how-to-sell-cars-on-facebook-marketplace/) '
          + 'covers eligibility, limits and a practical workflow before you start.',
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
          { title: 'Automatic sold-removal', body: 'Removes the matching listing after the feed marks a vehicle sold, reducing stale-listing inquiries.' },
          { title: 'Post-to-sale attribution', body: 'Shows which Facebook listings led to actual vehicle sales — not just views, clicks or messages.' },
        ],
      },
      {
        type: 'steps',
        h2: 'How AutoLander lists your cars on Facebook',
        intro:
          'AutoLander is a native desktop app, so the listing workflow runs on your computer while the app is open. '
          + 'A configurable queue helps the team manage eligible listings within the account’s current limits.',
        steps: [
          { title: 'Connect your inventory feed', body: 'Point AutoLander at your CarGurus or Cars.com feed, or a custom export from your DMS or website. Your whole inventory loads automatically — see the [integrations](/integrations/) page for supported sources.' },
          { title: 'Enhance every listing', body: 'The AI Photo Studio cleans up each photo, smart photo-ordering leads with the shot buyers respond to, and an AI description is written for each VIN.' },
          { title: 'Manage eligible Marketplace listings', body: 'AutoLander works through a configurable queue from your own computer, using an accurate title, price and description. Meta account eligibility and current listing limits still apply.' },
          { title: 'Stay in sync', body: 'New VINs get listed automatically and sold units come down on their own via [inventory sync](/facebook-marketplace-inventory-sync/), so Facebook keeps matching your real inventory.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers choose AutoLander as their Facebook listing software',
        items: [
          'It helps dealers publish eligible inventory on Facebook Marketplace without re-entering every vehicle from scratch.',
          'It is a native desktop app: the workflow runs on your own computer while the app is open, with no browser extension required.',
          'It bundles inventory sync, an AI Photo Studio, AI walkaround video, automatic sold-removal and post-to-sale attribution in one tool.',
          'It is honestly priced — published self-serve plans from $39/mo with 5 free posts to start, no contract.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest version of Facebook automation',
        body: 'Meta’s Terms prohibit accessing its products by automated means without prior permission, and '
          + 'Marketplace eligibility, categories and listing limits can change. AutoLander’s local desktop '
          + 'architecture does not override those rules or guarantee uninterrupted access. Read the '
          + '[Marketplace policy and safety guide](/guide/facebook-marketplace-automation/) and '
          + '[compare your options](/compare/) before you start.',
      },
    ],
    faq: [
      ['What is the best Facebook listing software for car dealers?',
        'It depends on feed compatibility, record review, photo and video tools, sold-unit reconciliation, attribution, session architecture and price. AutoLander bundles those workflows with published plans from $39/mo — see how it differs in our [2026 comparison](/compare/).'],
      ['Is Facebook listing software the same as a Facebook Marketplace tool?',
        'For a car dealer, mostly yes — the place buyers browse for cars on Facebook is Marketplace, so "Facebook listing software" almost always means a Marketplace listing tool. If you specifically want the Marketplace details, see our [Facebook Marketplace listing software](/facebook-marketplace-listing-software/) page.'],
      ['Does Facebook listing software override Marketplace limits?',
        'No. Meta controls Marketplace access, categories and account-specific limits. AutoLander can prepare inventory, enhance listing assets, manage a queue and reconcile sold units, but it cannot unlock access or raise a Meta-imposed limit. Check the current rules in your account and use our [dealer Marketplace guide](/guide/how-to-sell-cars-on-facebook-marketplace/) to plan the workflow.'],
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
