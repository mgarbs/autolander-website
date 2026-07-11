// AUTOPOSTER page (COMMERCIAL) — primary: facebook autoposter (one word) + facebook auto poster.
// The NON-"marketplace" variant (pairs with the /facebook-marketplace-auto-poster/ spine the way
// /facebook-listing-software/ pairs with the marketplace listing page). Kept distinct by leading with
// the "Facebook (Marketplace is where it posts)" framing and linking to the spine for the exact
// marketplace term. NO pixel. Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.autoposter.path;

const SOFTWARE_DESC =
  'AutoLander is a Facebook autoposter for car dealers: a native desktop app that automatically posts '
  + 'your dealership inventory to Facebook Marketplace, enhances every photo, removes sold units and ties '
  + 'posts back to sales — from $39/mo.';

export const PAGES = [
  {
    key: 'autoposter',
    title: 'Facebook Autoposter for Car Dealers | AutoLander',
    description:
      'Facebook autoposter for car dealers: automatically post inventory to Marketplace, enhance photos and '
      + 'remove sold cars. From $39/mo, 5 free posts.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook autoposter for car dealers',
    bylineUpdated: true,
    tldr:
      'A Facebook autoposter is software that automatically posts your listings to Facebook for you. For a car '
      + 'dealer, that means posting your inventory to Facebook Marketplace — where local buyers shop — instead of '
      + 'creating each listing by hand. AutoLander is a native desktop app that loads your lot into a managed workflow, '
      + 'enhances every photo and removes sold units, from $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Facebook autoposter', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is a Facebook autoposter?',
        a: [
          'A Facebook autoposter (or auto poster) is software that automatically publishes listings to Facebook '
          + 'instead of a person posting each one by hand. For car dealers, the listings go to Facebook '
          + 'Marketplace, a local vehicle-discovery surface. An autoposter reads inventory data, prepares eligible '
          + 'listings and helps keep published listings current; Meta permission and account limits still apply.',
          'AutoLander is a Facebook autoposter built for car dealers. If you specifically mean Marketplace, the '
          + 'full detail is on the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) page; '
          + 'this page covers Facebook auto-posting for dealers more broadly. Either way, AutoLander runs as a '
          + 'native desktop app and posts through your normal Facebook session.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/nissan-kicks-before.webp',
        after: '/studio/nissan-kicks-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2025 Nissan Kicks before AutoLander',
        afterAlt: 'The same 2025 Nissan Kicks as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'The autoposter enhances as it posts: AutoLander turns a raw 2025 Nissan Kicks lot photo (left) into a showroom-grade Facebook listing (right), automatically.',
      },
      {
        type: 'steps',
        h2: 'How AutoLander auto-posts your cars to Facebook',
        steps: [
          { title: 'Connect your inventory', body: 'Point AutoLander at your CarGurus or Cars.com feed, or a custom feed/export. Your vehicles load automatically — see the [integrations](/integrations/) page.' },
          { title: 'Auto-enhance each listing', body: 'The AI Photo Studio swaps lot backgrounds for showroom backdrops, AI writes the description, and a walkaround video is generated.' },
          { title: 'Work through a posting queue', body: 'AutoLander prepares eligible listings and works through a configurable queue from your own computer while the app is running. Meta account eligibility and current listing limits still apply.' },
          { title: 'Keep it accurate', body: 'New VINs auto-post and sold units auto-remove via [inventory sync](/facebook-marketplace-inventory-sync/).' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers pick AutoLander as their Facebook autoposter',
        items: [
          'It loads your whole inventory feed, then manages eligible vehicles within the limits shown for the account — see [bulk posting to Facebook Marketplace](/bulk-post-cars-to-facebook-marketplace/).',
          'It is a native desktop app: the workflow runs through the Facebook session on your own machine, not AutoLander’s cloud, and no browser extension is required.',
          'It gives your team a configurable queue and posting controls instead of requiring each listing to be entered from scratch.',
          'It bundles AI photos, AI descriptions, sold-removal and post-to-sale attribution — published plans from $39/mo, 5 free posts.',
        ],
      },
      {
        type: 'callout',
        title: 'Automation does not override Meta’s rules',
        body: 'Meta’s Terms prohibit accessing its products by automated means without prior permission. Marketplace '
          + 'eligibility, category availability and current listing limits can also change by account and market. '
          + 'AutoLander provides a local desktop workflow and posting controls; it cannot make a workflow Meta-approved '
          + 'or guarantee an account will not be restricted. Read the '
          + '[Marketplace policy and safety guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['What is the best Facebook autoposter for car dealers?',
        'It depends on feed compatibility, listing review controls, photo and video tools, sold-unit reconciliation, attribution, session architecture and price. AutoLander bundles those workflows with published plans from $39/mo — see the [2026 comparison](/compare/).'],
      ['Is a Facebook autoposter the same as a Marketplace auto poster?',
        'For a car dealer, effectively yes — the listings post to Facebook Marketplace, where buyers shop. "Facebook autoposter" is just the broader term. For the Marketplace-specific detail, see the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) page.'],
      ['How much does Facebook auto poster software cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts and no credit card. Competing tools run roughly $99–$249/mo. See [pricing](/facebook-marketplace-auto-poster-pricing/).'],
      ['Can the autoposter post my entire inventory automatically?',
        'AutoLander can load the whole inventory feed and manage a queue of eligible vehicles, then keep those listings in sync as the lot turns. Meta controls Marketplace access and listing limits, so software cannot promise that every VIN can be live at once. See [bulk posting](/bulk-post-cars-to-facebook-marketplace/).'],
      ['Will a Facebook autoposter get my account banned?',
        'No vendor can guarantee that an account will not be restricted. Meta’s Terms prohibit automated access without prior permission, and Marketplace eligibility and listing limits still apply. AutoLander’s local desktop architecture does not create Meta approval. Read the [policy and safety guide](/guide/facebook-marketplace-automation/) first.'],
    ],
    cta: {
      heading: 'Auto-post your lot to Facebook',
      sub: 'See plans and book a demo — automatic posting, showroom-grade photos and sold-removal, on your own inventory.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: { software: SOFTWARE_DESC },
  },
];
