// INVENTORY-DISTRIBUTION page (2026-09-03). Targets "dealer inventory management" (≈200/mo, KD 3)
// and "car dealer inventory management" (≈100/mo, KD 6) — the one classical-demand cluster the
// site can win. The head term "dealer inventory management software" belongs to vAuto, CDK,
// Dealertrack, Tekion, Reynolds — AutoLander's integration partners, not its rivals — so this page
// NEVER positions AutoLander as a DMS. The wedge is merchandising and distribution: "your DMS holds
// the inventory; here is how it reaches buyers, and why the Marketplace leg is the one that
// goes stale."
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const UPDATED = '2026-09-03';

export const PAGES = [
  {
    key: 'inventoryDist',
    title: 'Dealer Inventory Management: From the DMS to the Buyer | AutoLander',
    description:
      'Dealer inventory management is two jobs: the DMS holds the record, distribution gets it in front '
      + 'of buyers. How the second job breaks, and how to keep every channel current.',
    eyebrow: 'Dealer inventory management',
    h1: 'Dealer inventory management: getting cars from the DMS to buyers',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['dealer inventory management', 'inventory distribution', 'DMS', 'merchandising'] },
    tldr:
      'Dealer inventory management has two halves. The system of record — a DMS or inventory platform like '
      + 'vAuto, DealerCenter, CDK, Tekion, Frazer or HomeNet — holds the truth about every unit: cost, price, '
      + 'mileage, photos, status. Distribution is the second half: getting that truth in front of buyers on '
      + 'the website, the portals and Facebook Marketplace, and keeping it true as prices move and cars sell. '
      + 'The DMS half is a solved problem. The distribution half breaks quietly, one stale listing at a time, '
      + 'and Marketplace is where it breaks most because nothing built into the DMS keeps it current. '
      + 'AutoLander is that missing leg: it reads the inventory you already manage and keeps Marketplace '
      + 'matched to it.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Dealer inventory management', url: SITE.origin + NAV.inventoryDist.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is dealer inventory management?',
        a: [
          'At a car dealership, inventory management is everything that happens to a unit between acquisition '
          + 'and delivery: stocking it in, recording cost and reconditioning, setting and adjusting the price, '
          + 'photographing it, describing it, publishing it wherever buyers look, and retiring it the day it '
          + 'sells. Most of that lives in a dealer management system or an inventory platform, and most dealers '
          + 'already run one well.',
          'The part that is not solved by the DMS is the last mile. A DMS is a system of record — it is very good '
          + 'at knowing what is true about a car. It is not a system of distribution. Getting the record onto the '
          + 'dealer website is usually handled by the website provider; getting it onto paid portals is handled by '
          + 'syndication feeds. Getting it onto Facebook Marketplace, and keeping it right there, is handled by a '
          + 'person with a phone — or by nothing.',
        ],
      },
      {
        type: 'table',
        h2: 'Two jobs, two kinds of software',
        intro:
          'It helps to name which job a tool does. AutoLander does the second one, for one channel. It is not '
          + 'a DMS, does not replace one, and reads from the one you have.',
        head: ['', 'System of record (DMS / IMS)', 'Distribution (merchandising)'],
        rows: [
          ['The job', 'Know what is true about every unit', 'Put that truth in front of buyers and keep it true'],
          ['Examples', 'vAuto, DealerCenter, CDK, Tekion, Frazer, HomeNet, Dealertrack', 'Website provider feeds, portal syndication, AutoLander for Facebook Marketplace'],
          ['Owns', 'Cost, price, mileage, photos, status, deal', 'Listings, price sync, sold-unit removal, photo presentation'],
          ['Fails when', 'Data is entered wrong', 'Data is right in the DMS and wrong on the channel'],
          ['Who notices', 'Accounting, the desk', 'The buyer — usually by messaging about a sold car'],
        ],
        note:
          'Vendors listed as examples are named for orientation only; AutoLander connects to several of them via '
          + 'a feed or export and has no other relationship with any of them. See [integrations](/integrations/).',
      },
      {
        type: 'bullets',
        h2: 'Where distribution breaks',
        intro:
          'Every one of these is a case where the DMS was right and the buyer saw something else. They are the '
          + 'reason "inventory management" is a distribution problem as much as a record-keeping one:',
        items: [
          'The price moved in the DMS on Tuesday. The website updated overnight. Marketplace still shows Monday’s '
          + 'number on Friday, because the person who posted it is off and nobody else knows which listings are theirs.',
          'The unit sold Saturday. The DMS knows. The Marketplace listing is live until someone remembers, and '
          + 'three buyers message about it on Sunday.',
          'A new arrival stocked in with eight photos and a price. It reaches the website automatically. It never '
          + 'reaches Marketplace at all, because posting it is a fifteen-minute manual job and there are forty of them.',
          'The salesperson who posted a third of the lot left. Their listings are now on an account nobody at the '
          + 'store can reach, showing prices nobody at the store controls.',
          'Twelve listings carry the lot photo with the dumpster in frame, because the studio shots are in the DMS '
          + 'and the phone that posted them had the originals.',
        ],
      },
      {
        type: 'steps',
        h2: 'Keeping the Marketplace leg current',
        intro:
          'The fix is the same one the website provider already applies to the website: treat the DMS as the '
          + 'source, and have software reconcile the channel against it on a schedule. This is what AutoLander does '
          + 'for Facebook Marketplace.',
        steps: [
          { title: 'Point it at the source you already run',
            body: 'A [CarGurus or Cars.com feed](/integrations/), a DMS export from vAuto, DealerCenter, CDK, Tekion, Frazer or HomeNet, an SFTP or CSV drop, or the dealer website itself. No re-keying, no second system of record.' },
          { title: 'Let it build the queue',
            body: 'Eligible units become Marketplace listings with year, make, model, mileage, price, photos and description filled from the feed. The [auto poster](/facebook-marketplace-auto-poster/) works the queue at a pace you set, inside the account’s limits.' },
          { title: 'Reconcile on a schedule',
            body: 'The feed is re-read; price changes push to the live listing, sold units come down, new arrivals queue. The [inventory sync page](/facebook-marketplace-inventory-sync/) covers the cadence and what "sold" means to the feed.' },
          { title: 'Present it properly',
            body: 'Studio-grade photos from the [AI photo editor](/ai-car-photo-editor/), the right category for the unit, and no invented facts: unknown mileage stays blank rather than guessed.' },
        ],
      },
      {
        type: 'qa',
        q: 'Does a dealer need Marketplace-specific inventory software?',
        a: [
          'Only if Marketplace matters to the store. For a dealer who posts two cars a month from a personal '
          + 'profile, no. For a dealer who wants the whole lot on the channel where local buyers message first — '
          + 'and wants it to stay accurate without a salesperson’s afternoon every day — yes, because nothing in '
          + 'the DMS or the website stack does that job.',
          'The test is simple: pick five listings on your Marketplace right now and check them against the DMS. '
          + 'If the prices match and none of them sold last week, you do not need this. If they do not, the '
          + 'problem is distribution, and it will not fix itself.',
        ],
      },
      {
        type: 'callout',
        title: 'What AutoLander is not',
        body:
          'It is not a DMS, an IMS, a pricing tool or a CRM, and it does not replace any of them. It reads the '
          + 'inventory you already manage and keeps one channel — Facebook Marketplace — matched to it. It also '
          + 'does not message buyers or touch your inbox; [here is why](/why-we-dont-answer-your-buyers/).',
      },
    ],
    faq: [
      ['What is the difference between a DMS and dealer inventory management software?',
        'A DMS is the dealership’s system of record — deals, accounting, inventory, service. Inventory management '
        + 'software usually means the merchandising layer on top: pricing, photos, descriptions and getting units '
        + 'published. Distribution — keeping each channel current — is the piece most often left to a person. '
        + 'AutoLander covers distribution for Facebook Marketplace only.'],
      ['Does AutoLander replace vAuto, DealerCenter, CDK or Tekion?',
        'No. AutoLander connects to inventory from those systems through a feed or export and posts it to Facebook '
        + 'Marketplace. The DMS stays the source of truth for every field; AutoLander reads it and never writes back.'],
      ['How do I keep Facebook Marketplace listings in sync with my inventory?',
        'Treat the DMS or feed as the source and have software reconcile Marketplace against it on a schedule: '
        + 'price changes pushed to the live listing, sold units removed, new arrivals queued. That is the job '
        + 'AutoLander does; it re-reads the feed and keeps the channel matched to the lot.'],
      ['Which inventory sources does AutoLander read?',
        'CarGurus and Cars.com directly; vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK and Tekion via a '
        + 'custom feed or export; SFTP and CSV drops; and most dealer websites. Details for each are on the '
        + 'integrations page.'],
      ['What does dealer inventory management software cost?',
        'DMS and IMS pricing is set by those vendors and usually quoted. AutoLander, which handles only the '
        + 'Marketplace distribution leg, publishes its pricing: Starter $39, Growth $59, Pro $79 and Dealer plans '
        + 'from $117 per month, with 5 free posts and no credit card to start.'],
    ],
    cta: {
      heading: 'See your inventory reach Marketplace — and stay current',
      sub: 'Book a demo and we will connect your feed and post real vehicles on the call. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },
];
