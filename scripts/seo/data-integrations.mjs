// INTEGRATIONS silo — hub + one spoke per inventory/DMS/feed system in INTEGRATIONS.
// Primary intent: "{System} to Facebook Marketplace" / "{System} facebook marketplace integration".
// Hub owns "dms facebook marketplace integration" and routes authority to the 9 spokes.
//
// HONESTY CONTRACT (see registry INTEGRATIONS.system):
//   • system:'feed'   (CarGurus, Cars.com) -> AutoLander reads that feed DIRECTLY (supported source).
//   • system:'custom' (vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, Tekion)
//       -> custom feed/export workflow ONLY. Each such page MUST state plainly that AutoLander has
//          NO one-click native integration with that system. Never imply one exists.
// AutoLander is a native desktop app; verified feed support is "CarGurus, Cars.com & custom feeds/exports".
//
// Declarative page objects only — no HTML (see scripts/seo/shell.mjs PAGE OBJECT CONTRACT).

import {
  SITE,
  NAV,
  INTEGRATIONS,
  integrationPath,
  relatedFor,
  siblingSpokes,
} from './registry.mjs';

const HUB_PATH = NAV.integHub.path; // '/integrations/'
const INVENTORY_PATH = NAV.inventory.path; // '/facebook-marketplace-inventory-sync/'

// ---------------------------------------------------------------------------
// Per-system editorial copy. Keeps each spoke genuinely useful and distinct
// instead of templated boilerplate. Keyed by slug.
//   blurb   : 1–2 sentences on what the system is / who uses it (uses s.kind context)
//   feedNoun: how a dealer typically gets data OUT of that system (export/feed wording)
//   note    : a system-specific honesty/nuance line surfaced as a callout
// ---------------------------------------------------------------------------
const COPY = {
  'cargurus-facebook-marketplace': {
    blurb:
      'CarGurus is one of the largest used-car shopping marketplaces, and most dealers who advertise '
      + 'on it already publish a standard inventory feed of their lot.',
    feedNoun: 'CarGurus inventory feed',
    note:
      'CarGurus is a directly supported feed source. AutoLander reads your existing CarGurus feed, so '
      + 'there is usually nothing new to build — you point AutoLander at the feed you already have.',
  },
  'cars-com-facebook-marketplace': {
    blurb:
      'Cars.com is a major third-party automotive marketplace, and dealers listing there generate a '
      + 'standard inventory feed describing every vehicle on the lot.',
    feedNoun: 'Cars.com inventory feed',
    note:
      'Cars.com is a directly supported feed source. If you already advertise on Cars.com you already '
      + 'have the feed AutoLander needs — no new export to set up in most cases.',
  },
  'vauto-facebook-marketplace': {
    blurb:
      'vAuto (a Cox Automotive product) is inventory-management and merchandising software dealers use '
      + 'to appraise, price and stage used vehicles.',
    feedNoun: 'vAuto inventory export or feed file',
    note:
      'AutoLander does not have a one-click native vAuto integration. vAuto is the system of record for '
      + 'your inventory; AutoLander ingests a feed or export of that inventory and posts it to Facebook '
      + 'Marketplace. Many dealers route the same syndication feed vAuto already produces.',
  },
  'dealercenter-facebook-marketplace': {
    blurb:
      'DealerCenter is a popular all-in-one dealer management system (DMS) for independent and BHPH '
      + 'dealers, covering inventory, desking, F&I and CRM.',
    feedNoun: 'DealerCenter inventory export or syndication feed',
    note:
      'AutoLander does not have a one-click native DealerCenter integration. Instead, DealerCenter '
      + 'produces an inventory export or syndication feed, and AutoLander reads that file to post and '
      + 'sync your vehicles on Marketplace.',
  },
  'dealer-com-facebook-marketplace': {
    blurb:
      'Dealer.com (a Cox Automotive product) is a dealer website platform that publishes your inventory '
      + 'online and powers your retail storefront.',
    feedNoun: 'Dealer.com inventory feed or export',
    note:
      'AutoLander does not have a one-click native Dealer.com integration. Dealer.com already publishes '
      + 'your inventory as a feed for syndication; AutoLander consumes a feed or export of that same '
      + 'inventory and posts it to Facebook Marketplace.',
  },
  'homenet-facebook-marketplace': {
    blurb:
      'HomeNet (a Cox Automotive product) is inventory-management and syndication software that pushes '
      + 'dealer inventory out to third-party shopping sites.',
    feedNoun: 'HomeNet syndication feed or export',
    note:
      'AutoLander does not have a one-click native HomeNet integration. HomeNet is built to syndicate '
      + 'feeds, so AutoLander reads a HomeNet feed or export of your inventory and posts it to Marketplace '
      + 'on top of wherever else you already syndicate.',
  },
  'frazer-facebook-marketplace': {
    blurb:
      'Frazer is a long-running, widely used dealer management system (DMS) for independent used-car '
      + 'dealers, handling inventory, accounting and deals.',
    feedNoun: 'Frazer inventory export or feed file',
    note:
      'AutoLander does not have a one-click native Frazer integration. Frazer can export or feed your '
      + 'inventory, and AutoLander reads that file to post your vehicles to Facebook Marketplace and keep '
      + 'them in sync.',
  },
  'cdk-facebook-marketplace': {
    blurb:
      'CDK Global is an enterprise dealer management system (DMS) used by franchise and larger dealer '
      + 'groups to run inventory, F&I, service and accounting.',
    feedNoun: 'CDK inventory export or syndication feed',
    note:
      'AutoLander does not have a one-click native CDK Global integration. CDK can produce an inventory '
      + 'export or syndication feed, and AutoLander ingests that feed to post and sync your inventory on '
      + 'Facebook Marketplace.',
  },
  'tekion-facebook-marketplace': {
    blurb:
      'Tekion is a modern, cloud-native dealer management system (DMS) used by franchise dealers to run '
      + 'the store from inventory through service on a single platform.',
    feedNoun: 'Tekion inventory export or syndication feed',
    note:
      'AutoLander does not have a one-click native Tekion integration. Tekion can output an inventory '
      + 'feed or export, and AutoLander reads that file to post your vehicles to Facebook Marketplace and '
      + 'keep listings current.',
  },
};

// ---- AI Photo Studio before/after pool — one distinct vehicle per spoke ----
const STUDIO = [
  { slug: 'hyundai-sonata', vehicle: '2024 Hyundai Sonata' },
  { slug: 'nissan-kicks', vehicle: '2025 Nissan Kicks' },
  { slug: 'jeep-wrangler', vehicle: '2026 Jeep Wrangler' },
  { slug: 'tesla-model-y', vehicle: '2023 Tesla Model Y' },
  { slug: 'ford-expedition', vehicle: '2024 Ford Expedition' },
  { slug: 'toyota-tacoma', vehicle: '2025 Toyota Tacoma' },
  { slug: 'chevrolet-malibu', vehicle: '2022 Chevrolet Malibu' },
  { slug: 'jeep-renegade', vehicle: '2019 Jeep Renegade' },
  { slug: 'kia-k5', vehicle: '2022 Kia K5' },
];
function studioFigure(v) {
  return {
    type: 'figure',
    before: `/studio/${v.slug}-before.webp`,
    after: `/studio/${v.slug}-after.webp`,
    beforeAlt: `Raw dealership lot photo of a ${v.vehicle} before AutoLander`,
    afterAlt: `The same ${v.vehicle} as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio`,
    caption: `AutoLander’s AI Photo Studio: a raw dealer lot photo of a ${v.vehicle} (left) becomes a showroom-grade Facebook Marketplace listing (right), automatically.`,
  };
}

// ---------------------------------------------------------------------------
// Spoke builder — maps INTEGRATIONS so every spoke is consistent yet varied.
// ---------------------------------------------------------------------------
function buildSpoke(s, i) {
  const path = integrationPath(s.slug);
  const isFeed = s.system === 'feed';
  const c = COPY[s.slug];
  const feedNoun = c.feedNoun;

  // Honest "native integration?" answer, per connection type.
  const nativeAnswer = isFeed
    ? `AutoLander does not need a separate plugin for ${s.name} because ${s.name} is a directly `
      + `supported feed source. AutoLander reads your ${feedNoun} and posts those vehicles to Facebook `
      + `Marketplace — there is no one-click "app store" button, but there is nothing extra to build.`
    : `No. AutoLander does not offer a one-click native ${s.name} integration. The connection works `
      + `through a custom feed/export: ${s.name} produces a feed or export of your inventory, and `
      + `AutoLander reads that file to post and sync your vehicles on Marketplace. That is the honest, `
      + `reliable way to get ${s.name} inventory onto Facebook Marketplace today.`;

  // Title / H1 framing differs by connection type.
  const title = isFeed
    ? `Post ${s.name} Inventory to Facebook Marketplace | AutoLander`
    : `${s.name} to Facebook Marketplace via Custom Feed/Export | AutoLander`;
  const h1 = isFeed
    ? `Post your ${s.name} inventory to Facebook Marketplace`
    : `${s.name} to Facebook Marketplace via custom feed/export`;

  const description = isFeed
    ? `${s.name} is a directly supported feed source in AutoLander. Read your ${feedNoun} and auto-post `
      + `your whole lot to Facebook Marketplace — with AI photos, walkaround video and automatic `
      + `sold-removal. Plans from $${SITE.lowPrice}/mo.`
    : `AutoLander has no one-click native ${s.name} integration — it connects via a custom feed/export. `
      + `Export your ${s.name} inventory, point AutoLander at it, and auto-post to Facebook Marketplace `
      + `with AI photos, video and sold-removal. From $${SITE.lowPrice}/mo.`;

  const tldr = isFeed
    ? `Yes — ${s.name} is a directly supported feed source. AutoLander reads your ${feedNoun} and `
      + `automatically posts every vehicle to Facebook Marketplace, refreshes prices, and removes sold `
      + `units. It also upgrades each listing with an AI Photo Studio, a walkaround video and post-to-sale `
      + `attribution. Plans from $${SITE.lowPrice}/mo.`
    : `AutoLander does not have a one-click native ${s.name} integration. Instead it connects through a `
      + `custom feed/export: you export your inventory from ${s.name}, AutoLander reads that file, and it `
      + `posts and syncs your vehicles on Facebook Marketplace — with AI photos, walkaround video and `
      + `automatic sold-removal. Plans from $${SITE.lowPrice}/mo.`;

  const connectIntro = isFeed
    ? `${s.name} is already a supported source, so connecting it is mostly pointing AutoLander at the feed `
      + `you have.`
    : `There is no native plugin — ${s.name} connects through a feed or export file, which is simpler and `
      + `more dependable than a brittle screen integration.`;

  const sections = [
    {
      type: 'qa',
      q: `Can AutoLander post my ${s.name} inventory to Facebook Marketplace?`,
      a: isFeed
        ? [
            `Yes. ${s.name} is a directly supported feed source, so AutoLander can post your ${s.name} `
            + `inventory to Facebook Marketplace automatically. AutoLander reads your ${feedNoun} — year, `
            + `make, model, price, mileage, photos and descriptions — and publishes each vehicle to `
            + `Marketplace, then keeps the listings current as your lot changes.`,
            `Because AutoLander runs as a native desktop app on your own computer, it posts through your `
            + `normal Facebook session instead of a shared cloud server or a browser extension.`,
          ]
        : [
            `Yes — but to be clear about how: AutoLander does not have a one-click native ${s.name} `
            + `integration. ${s.name} stays your system of record, and you give AutoLander a custom `
            + `feed/export of that inventory. AutoLander reads the ${feedNoun} and posts every vehicle to `
            + `Facebook Marketplace, then keeps listings in sync as inventory and prices change.`,
            `AutoLander runs as a native desktop app, so it posts through your normal Facebook session on `
            + `your own machine rather than a shared cloud server.`,
          ],
    },
    {
      type: 'qa',
      q: `What is ${s.name}?`,
      a: c.blurb,
    },
    {
      type: 'steps',
      h2: `How ${s.name} connects to AutoLander`,
      intro: connectIntro,
      steps: [
        {
          title: isFeed ? `Get your ${s.name} feed` : `Export your ${s.name} inventory`,
          body: isFeed
            ? `Grab the ${feedNoun} you already use to advertise — most dealers running ${s.name} already `
              + `have this feed available.`
            : `Have ${s.name} produce a ${feedNoun}. Most DMS and inventory platforms can generate a `
              + `standard inventory file or syndication feed of your lot.`,
        },
        {
          title: 'Point AutoLander at it',
          body: `Connect AutoLander to that feed or file. Your vehicles load automatically — no manual `
            + `re-keying of VINs, prices or photos.`,
        },
        {
          title: 'It posts and keeps everything in sync',
          body: `AutoLander posts each vehicle to Facebook Marketplace at a human-like pace, refreshes `
            + `listings as prices change, and removes sold units automatically when your feed marks them `
            + `gone. See how the ongoing inventory sync works at ${INVENTORY_PATH}.`,
        },
      ],
    },
    {
      type: 'features',
      h2: `What AutoLander adds on top of your ${s.name} data`,
      intro: `${s.name} tells AutoLander what is on the lot. AutoLander turns that raw data into `
        + `high-performing Marketplace listings.`,
      cards: [
        {
          title: 'AI Photo Studio',
          body: 'Replaces messy lot backgrounds with clean showroom backdrops, so every listing looks '
            + 'like a professional shoot instead of a phone snap.',
        },
        {
          title: 'AI walkaround video',
          body: 'Generates a short walkaround video for each vehicle — Marketplace and buyers favor video '
            + 'over static photos.',
        },
        {
          title: 'Automatic sold-removal',
          body: `When your ${s.name} feed marks a unit sold, AutoLander pulls the Marketplace listing down `
            + `automatically, so buyers never message about a car that is gone.`,
        },
        {
          title: 'Post-to-sale attribution',
          body: 'Tracks which Marketplace posts led to actual vehicle sales — not just clicks, views or '
            + 'messages.',
        },
      ],
    },
  ];
  sections.splice(1, 0, studioFigure(STUDIO[i % STUDIO.length]));

  const faq = [
    [
      `Does AutoLander have a native ${s.name} integration?`,
      nativeAnswer,
    ],
    [
      `How does the ${s.name} connection work?`,
      isFeed
        ? `AutoLander reads your ${feedNoun} directly. You point AutoLander at the feed, your vehicles load `
          + `automatically, and AutoLander posts them to Facebook Marketplace and keeps the listings in `
          + `sync as prices and inventory change. See the inventory-sync details at ${INVENTORY_PATH}.`
        : `${s.name} produces a ${feedNoun}, and AutoLander reads that file. You point AutoLander at the `
          + `export or feed, your vehicles load, and AutoLander posts them to Facebook Marketplace and keeps `
          + `them in sync. See how ongoing sync works at ${INVENTORY_PATH}.`,
    ],
    [
      `How much does it cost to post ${s.name} inventory to Facebook Marketplace?`,
      `AutoLander publishes self-serve plans from $${SITE.lowPrice}/mo with 5 free posts to start and no `
      + `credit card required. The same pricing applies however you connect — see all integration options `
      + `at ${HUB_PATH}.`,
    ],
    [
      `What if I use a different system than ${s.name}?`,
      `AutoLander's verified feed support is CarGurus, Cars.com and custom feeds/exports, so most DMS and `
      + `inventory platforms can connect through a custom feed/export. See the full list and how each one `
      + `connects at ${HUB_PATH}.`,
    ],
  ];

  return {
    path,
    title,
    description,
    ogType: 'website',
    eyebrow: isFeed ? 'Supported feed source' : 'Custom feed / export',
    h1,
    bylineUpdated: true,
    tldr,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Integrations', url: SITE.origin + HUB_PATH },
      { name: `${s.name} → Facebook Marketplace`, url: SITE.origin + path },
    ],
    related: [...siblingSpokes(s.slug, 3), ...relatedFor('integrationSpoke')],
    sections,
    faq,
    cta: {
      heading: `Post your ${s.name} inventory to Facebook Marketplace`,
      sub: 'See plans and book a demo — connect your feed and auto-post your lot.',
    },
    schema: {
      software: isFeed
        ? `AutoLander reads your ${s.name} inventory feed and automatically posts every vehicle to Facebook `
          + `Marketplace from a native desktop app, with an AI Photo Studio, walkaround video and automatic `
          + `sold-removal.`
        : `AutoLander connects to ${s.name} via a custom feed/export (no one-click native integration) and `
          + `automatically posts your inventory to Facebook Marketplace from a native desktop app, with AI `
          + `photos, walkaround video and automatic sold-removal.`,
    },
  };
}

// ---------------------------------------------------------------------------
// HUB
// ---------------------------------------------------------------------------
const HUB_SOFTWARE_DESC =
  'AutoLander connects your dealership inventory system to Facebook Marketplace — reading a supported '
  + 'feed (CarGurus, Cars.com) or a custom feed/export from your DMS — and automatically posts every '
  + 'vehicle from a native desktop app, with AI photos, walkaround video and automatic sold-removal.';

const hub = {
  key: 'integHub',
  title: 'Facebook Marketplace Integrations & DMS Feeds for Car Dealers | AutoLander',
  description:
    'Connect your inventory system to Facebook Marketplace with AutoLander. Supported feed sources '
    + '(CarGurus, Cars.com) plus custom feed/export for vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, '
    + 'CDK Global and Tekion. Auto-post your whole lot from $39/mo.',
  ogType: 'website',
  eyebrow: 'For car dealers & dealer groups',
  h1: 'Facebook Marketplace integrations & DMS feeds',
  bylineUpdated: true,
  tldr:
    'AutoLander connects your inventory to Facebook Marketplace in one of two honest ways: it reads a '
    + 'directly supported feed source (CarGurus or Cars.com), or it ingests a custom feed/export from '
    + 'your DMS or website platform (vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, '
    + 'Tekion). Either way, AutoLander auto-posts your whole lot, refreshes prices and removes sold '
    + 'units — with AI photos, walkaround video and post-to-sale attribution. Plans from $39/mo.',
  softwareDesc: HUB_SOFTWARE_DESC,
  breadcrumbs: [
    { name: 'Home', url: SITE.origin + '/' },
    { name: 'Integrations', url: SITE.origin + HUB_PATH },
  ],
  sections: [
    {
      type: 'figure',
      before: '/studio/ford-maverick-before.webp',
      after: '/studio/ford-maverick-after.webp',
      beforeAlt: 'Raw dealership lot photo of a 2026 Ford Maverick before AutoLander',
      afterAlt: 'The same 2026 Ford Maverick as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
      caption: 'From your feed to a showroom-grade listing: a raw 2026 Ford Maverick lot photo (left) becomes a polished Facebook Marketplace listing (right), automatically.',
    },
    {
      type: 'qa',
      q: 'What is a DMS Facebook Marketplace integration?',
      a: [
        'A DMS Facebook Marketplace integration connects the system that holds your inventory — your '
        + 'dealer management system (DMS), inventory-management tool or dealer website platform — to '
        + 'Facebook Marketplace, so your vehicles get posted automatically instead of one VIN at a time '
        + 'by hand. AutoLander reads your inventory data (year, make, model, price, mileage, photos and '
        + 'descriptions) and publishes each car to Marketplace, then keeps the listings current as your '
        + 'lot changes.',
        'AutoLander runs as a native desktop app on your own computer, so it posts through your normal '
        + 'Facebook session rather than a shared cloud server or a browser extension.',
      ],
    },
    {
      type: 'qa',
      q: 'How does AutoLander connect to my inventory system?',
      a: [
        'There are two honest connection types. The first is a directly supported feed source: AutoLander '
        + 'reads your existing CarGurus or Cars.com feed with nothing new to build. The second is a custom '
        + 'feed/export: for most DMS and website platforms, you generate a standard inventory export or '
        + 'syndication feed, and AutoLander reads that file to post and sync your vehicles.',
        'AutoLander does not provide one-click native plugins for individual DMS products like vAuto, '
        + 'DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global or Tekion. The custom feed/export path is '
        + 'deliberately simple and more dependable than a brittle screen integration — and it works with '
        + 'virtually any system that can produce an inventory feed.',
      ],
    },
    {
      type: 'features',
      h2: 'Inventory systems AutoLander posts to Facebook Marketplace',
      intro:
        'Pick your system to see exactly how it connects. CarGurus and Cars.com are directly supported '
        + 'feed sources; the rest connect via a custom feed/export.',
      cards: INTEGRATIONS.map((s) => ({
        title: s.anchor,
        body:
          (s.system === 'feed'
            ? `${s.name} is a directly supported feed source — AutoLander reads your feed and posts your lot. `
            : `${s.name} connects via custom feed/export (no one-click native integration). `)
          + `See the ${s.name} setup at ${integrationPath(s.slug)}.`,
      })),
    },
    {
      type: 'twocol',
      left: {
        h2: 'Directly supported feed sources',
        items: [
          'CarGurus — AutoLander reads your existing CarGurus inventory feed.',
          'Cars.com — AutoLander reads your existing Cars.com inventory feed.',
          'Any standard custom inventory feed or export you can provide.',
          'Nothing new to build if you already advertise on these sources.',
        ],
      },
      right: {
        h2: 'Connect via custom feed / export',
        items: [
          'vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, Tekion.',
          'No one-click native plugin — you export a feed/file from your system.',
          'AutoLander reads that feed and posts + syncs your inventory.',
          'Works with virtually any platform that can produce an inventory feed.',
        ],
      },
    },
    {
      type: 'steps',
      h2: 'How posting your inventory to Facebook Marketplace works',
      steps: [
        {
          title: 'Connect your feed',
          body: 'Point AutoLander at a supported feed (CarGurus, Cars.com) or a custom feed/export from '
            + 'your DMS or website. Your vehicles load automatically.',
        },
        {
          title: 'Enhance every listing',
          body: 'The AI Photo Studio swaps lot backgrounds for showroom backdrops and generates a '
            + 'walkaround video for each vehicle.',
        },
        {
          title: 'Auto-post from your own computer',
          body: 'AutoLander posts each vehicle to Facebook Marketplace through your normal session, at a '
            + 'human-like pace, with an accurate title, price and description.',
        },
        {
          title: 'Stay accurate and measure it',
          body: `Listings refresh as prices change, sold units come down automatically, and post-to-sale `
            + `attribution shows which posts moved metal. See the inventory-sync details at ${INVENTORY_PATH}.`,
        },
      ],
    },
    {
      type: 'callout',
      title: 'An honest note on "integrations"',
      body:
        'AutoLander’s verified support is CarGurus, Cars.com and custom feeds/exports. We do not '
        + 'claim one-click native integrations with individual DMS products. If your system can output an '
        + 'inventory feed or export — and almost all can — AutoLander can post that inventory to Facebook '
        + 'Marketplace and keep it in sync.',
    },
  ],
  faq: [
    [
      'Which inventory systems work with AutoLander?',
      'AutoLander reads directly supported feed sources (CarGurus and Cars.com) and connects to most '
      + 'other systems — vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, Tekion and more — '
      + 'through a custom feed/export. If your DMS, inventory tool or website can produce an inventory '
      + 'feed, AutoLander can post that inventory to Facebook Marketplace.',
    ],
    [
      'Does AutoLander have a native one-click integration with my DMS?',
      'For CarGurus and Cars.com, AutoLander reads your feed directly, so there is nothing extra to build. '
      + 'For DMS and website platforms like vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global '
      + 'and Tekion, there is no one-click native integration — they connect through a custom feed/export. '
      + 'We are deliberately honest about this rather than implying plugins that do not exist.',
    ],
    [
      'What is a custom feed/export?',
      'A custom feed/export is a standard inventory file — a CSV, XML or syndication feed — that your DMS '
      + 'or website platform generates to describe every vehicle on your lot. AutoLander reads that file '
      + 'to post your inventory to Facebook Marketplace and keep it in sync, so you never re-key VINs, '
      + 'prices or photos by hand.',
    ],
    [
      'What if my inventory system is not listed?',
      'You can almost certainly still connect. As long as your system can produce an inventory feed or '
      + 'export — which the vast majority can — AutoLander can ingest it. Pick the closest system on this '
      + 'page, or contact us with your setup, and we will confirm the feed/export path.',
    ],
    [
      'How much does an inventory-to-Marketplace connection cost?',
      `AutoLander publishes self-serve plans from $${SITE.lowPrice}/mo with 5 free posts to start and no `
      + 'credit card required. The same pricing applies whether you connect via a supported feed or a '
      + 'custom feed/export.',
    ],
  ],
  cta: {
    heading: 'Connect your inventory to Facebook Marketplace',
    sub: 'See plans and book a demo — point AutoLander at your feed and auto-post your whole lot.',
  },
  relatedHeading: 'Keep exploring',
  schema: {
    software: HUB_SOFTWARE_DESC,
    itemList: INTEGRATIONS.map((s) => ({
      name: s.anchor,
      url: SITE.origin + integrationPath(s.slug),
    })),
  },
};

export const PAGES = [hub, ...INTEGRATIONS.map(buildSpoke)];
