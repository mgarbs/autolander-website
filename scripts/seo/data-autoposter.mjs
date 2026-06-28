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
      'AutoLander is a Facebook autoposter for car dealers — a native desktop app that automatically posts your '
      + 'inventory to Facebook Marketplace, enhances photos and removes sold cars. Auto poster software from '
      + '$39/mo, 5 free posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook autoposter for car dealers',
    bylineUpdated: true,
    tldr:
      'A Facebook autoposter is software that automatically posts your listings to Facebook for you. For a car '
      + 'dealer, that means posting your inventory to Facebook Marketplace — where local buyers shop — instead of '
      + 'creating each listing by hand. AutoLander is a native desktop app that auto-posts your whole lot, '
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
          + 'Marketplace — the part of Facebook where local buyers actually browse for vehicles — so an autoposter '
          + 'reads your inventory and posts every car for you, then keeps the listings current.',
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
          { title: 'Auto-post at a human-like pace', body: 'AutoLander posts each vehicle from your own computer at a measured pace, not a suspicious burst — the account-safety reasoning is on the [safest auto poster](/safest-facebook-marketplace-auto-poster/) page.' },
          { title: 'Keep it accurate', body: 'New VINs auto-post and sold units auto-remove via [inventory sync](/facebook-marketplace-inventory-sync/).' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers pick AutoLander as their Facebook autoposter',
        items: [
          'It auto-posts your whole lot — see [bulk posting to Facebook Marketplace](/bulk-post-cars-to-facebook-marketplace/) — not just a handful of cars.',
          'It is a native desktop app: auto-posting runs through your own Facebook session on your machine, not a shared cloud server, with no ToS-exposed browser extension.',
          'It paces posts to look human, a deliberate account-safety choice rather than a mass blast.',
          'It bundles AI photos, AI descriptions, sold-removal and post-to-sale attribution — published plans from $39/mo, 5 free posts.',
        ],
      },
      {
        type: 'callout',
        title: 'Auto-posting a personal profile is a gray area',
        body: 'Marketplace was built for individuals, and Meta’s sanctioned dealer route is the vehicle catalog. '
          + 'Auto-posting from a personal profile — with any autoposter — is common but not officially blessed, and '
          + 'policies can change. AutoLander paces posting and keeps your session local to lower technical triggers, '
          + 'but no honest vendor can promise you will never be flagged. See the '
          + '[honest automation guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['What is the best Facebook autoposter for car dealers?',
        'It depends on automation depth, photo quality, account-safety model and price. AutoLander bundles auto-posting with AI photos and video, sold-removal and post-to-sale attribution at the lowest entry price — see the [2026 comparison](/compare/).'],
      ['Is a Facebook autoposter the same as a Marketplace auto poster?',
        'For a car dealer, effectively yes — the listings post to Facebook Marketplace, where buyers shop. "Facebook autoposter" is just the broader term. For the Marketplace-specific detail, see the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) page.'],
      ['How much does Facebook auto poster software cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts and no credit card. Competing tools run roughly $99–$249/mo. See [pricing](/facebook-marketplace-auto-poster-pricing/).'],
      ['Can the autoposter post my entire inventory automatically?',
        'Yes. AutoLander loads your whole inventory from a feed and auto-posts every vehicle, then keeps it in sync as the lot turns. See [bulk posting](/bulk-post-cars-to-facebook-marketplace/).'],
      ['Will a Facebook autoposter get my account banned?',
        'It is a gray area and no tool can guarantee against it. Auto-posting a personal profile is common but not sanctioned; Meta’s official dealer route is the vehicle catalog. AutoLander reduces obvious triggers by pacing posts and keeping your session on your own machine — risk reduction, not a guarantee. Read the [automation guide](/guide/facebook-marketplace-automation/) first.'],
    ],
    cta: {
      heading: 'Auto-post your lot to Facebook',
      sub: 'See plans and book a demo — automatic posting, showroom-grade photos and sold-removal, on your own inventory.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: { software: SOFTWARE_DESC },
  },
];
