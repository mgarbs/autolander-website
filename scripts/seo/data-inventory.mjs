// INVENTORY SYNC page — the silo spoke for keeping Marketplace listings matched to the live lot.
// Targets "facebook marketplace inventory sync" (primary), "facebook marketplace inventory feed for
// car dealers", "dealership website to facebook marketplace", "inventory feed", "price updates",
// "new arrivals", "automatic sold unit removal". NO cannibalization of "dms facebook marketplace
// integration" (that phrase is owned by /integrations/) — this page stays focused on sync / feed /
// keeping listings accurate, and links to /integrations/ for specific DMS/website systems.
//
// Follows the page-object contract in scripts/seo/shell.mjs; matches data-category.mjs in style.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.inventory.path;

const SOFTWARE_DESC =
  'AutoLander keeps a car dealership’s Facebook Marketplace listings automatically synced to its live '
  + 'inventory: a native desktop app that pulls vehicles, photos and prices from a CarGurus, Cars.com or '
  + 'custom feed, posts new arrivals, updates prices, and removes sold units automatically — from $39/mo.';

export const PAGES = [
  {
    key: 'inventory',
    title: 'Facebook Marketplace Inventory Sync for Car Dealers | AutoLander',
    description:
      'Facebook Marketplace inventory sync that keeps your listings matched to your live lot — auto-posts new '
      + 'arrivals, updates prices when your feed changes, and removes sold units automatically. Connect a '
      + 'CarGurus, Cars.com or custom feed (incl. your dealership website). From $39/mo, 5 free posts.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace inventory sync',
    bylineUpdated: true,
    tldr:
      'Facebook Marketplace inventory sync keeps your Marketplace listings automatically matched to your live '
      + 'lot — instead of editing posts by hand. AutoLander pulls vehicles, photos and prices from your '
      + 'CarGurus, Cars.com or custom feed, posts new arrivals as new VINs appear, updates a listing when its '
      + 'feed price changes, and takes a listing down the moment the feed marks the car sold. Plans from $39/mo '
      + 'with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Inventory sync', url: SITE.origin + NAV.inventory.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is Facebook Marketplace inventory sync?',
        a: [
          'Facebook Marketplace inventory sync is keeping your Marketplace listings automatically matched to your '
          + 'live lot: new arrivals get posted, prices update when they change, and sold units come down — all '
          + 'without anyone manually editing posts. Instead of a salesperson re-checking 150 VINs by hand every '
          + 'week, an inventory feed drives the listings so Marketplace always reflects what is actually for sale.',
          'AutoLander is a native desktop app that runs this sync for car dealers. It reads an inventory feed — '
          + 'your vehicles, photos and prices — and continuously reconciles your Marketplace listings against it, '
          + 'so the lot on Marketplace and the lot in your system stay in step. For a one-time push of your '
          + 'existing inventory, see how AutoLander does the initial bulk post; the Facebook Marketplace auto '
          + 'poster overview covers the whole workflow.',
        ],
      },
      {
        type: 'qa',
        q: 'How does AutoLander sync your inventory to Facebook Marketplace?',
        a: [
          'AutoLander connects to an inventory feed and treats it as the source of truth for your Marketplace '
          + 'listings. It supports a CarGurus or Cars.com feed directly, or a custom feed/export — including an '
          + 'export from your dealership website or inventory provider. It reads each vehicle’s year, make, model, '
          + 'price, mileage, photos and description, then posts, updates or removes the matching listing.',
          'For specific systems — vAuto, CDK, Dealer.com, DealerCenter, HomeNet, Frazer, Tekion and similar — '
          + 'AutoLander ingests a custom feed/export from that platform; the Facebook Marketplace integrations '
          + 'page lists how each one connects. Once a feed is connected the sync runs on its own: as the feed '
          + 'changes, your Marketplace listings change to match.',
        ],
      },
      {
        type: 'features',
        h2: 'What inventory sync keeps accurate on Marketplace',
        intro: 'Three jobs run continuously off your feed so your Marketplace lot never drifts from your real one.',
        cards: [
          { title: 'New arrivals post automatically', body: 'When a new VIN appears in your feed, AutoLander posts it to Marketplace — photos, price and description included — so fresh inventory goes live without anyone creating the listing by hand.' },
          { title: 'Price updates flow through', body: 'When a vehicle’s feed price changes, its Marketplace listing updates to match. No stale prices, and no buyers arriving expecting last week’s number.' },
          { title: 'Automatic sold-unit removal', body: 'The moment your feed marks a car sold, AutoLander takes the listing down — so buyers never message about a car that is already gone.' },
          { title: 'Listing details stay in step', body: 'Mileage, photos and descriptions are pulled from the feed, so an edit in your system flows through to Marketplace instead of being re-typed.' },
        ],
      },
      {
        type: 'steps',
        h2: 'How a dealership website or feed becomes Marketplace listings',
        intro: 'From a dealer site or inventory feed to live, self-maintaining Marketplace listings — in four steps.',
        steps: [
          { title: 'Connect your feed', body: 'Point AutoLander at your CarGurus or Cars.com feed, or a custom feed/export from your dealership website, DMS or inventory provider. Your vehicles load automatically.' },
          { title: 'Map and enhance', body: 'AutoLander reads each vehicle’s details and photos from the feed and builds an accurate listing — with showroom-grade photos and a clear description, ready for Marketplace.' },
          { title: 'Post and reconcile', body: 'New arrivals post from your own computer at a human-like pace, and existing listings are reconciled against the feed so the Marketplace lot matches your real lot.' },
          { title: 'Stay accurate on autopilot', body: 'On every sync, price changes flow through, new VINs get posted, and sold units come down — so your dealership website to Facebook Marketplace pipeline runs without manual edits.' },
        ],
      },
      {
        type: 'qa',
        q: 'Can AutoLander post from my dealership website to Facebook Marketplace?',
        a: [
          'Yes — if your dealership website can produce an inventory feed or export, AutoLander can use it as the '
          + 'source for your Marketplace listings. Most dealer website platforms can output a feed (or you can '
          + 'export your inventory on a schedule), and AutoLander turns that feed into posted, self-maintaining '
          + 'Marketplace listings: new arrivals go up, prices update, and sold cars come down to match.',
          'If your inventory lives in a website platform or DMS rather than a named feed source, AutoLander '
          + 'connects via a custom feed/export from that system — the integrations page covers the specific '
          + 'platforms. Either way the result is the same: your site or feed becomes accurate Facebook '
          + 'Marketplace listings.',
        ],
      },
      {
        type: 'qa',
        q: 'Why does Marketplace listing accuracy matter?',
        a: [
          'Accurate listings protect buyer trust and your team’s time. When a price on Marketplace is stale or a '
          + 'sold car is still up, buyers message about cars they cannot get — dead leads that waste a '
          + 'salesperson’s day and leave shoppers annoyed before they ever reach you. Inventory sync removes that '
          + 'friction by keeping prices current and pulling sold units down automatically.',
          'Accurate, current listings are also the healthier way to use Marketplace: they reflect real, available '
          + 'cars at real prices, which is what the platform is meant for. Keeping your feed and your listings in '
          + 'step means fewer dead leads, more trust, and a cleaner footprint than a pile of out-of-date posts.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers run inventory sync with AutoLander',
        items: [
          'Your Marketplace lot mirrors your real lot automatically — new arrivals, price updates and sold-unit removal all driven by your inventory feed, not by manual edits.',
          'It works from the feeds you already have: CarGurus, Cars.com, or a custom feed/export from your dealership website, DMS or inventory provider.',
          'It is a native desktop app — listings post and reconcile through your own Facebook session on your own computer, not a shared cloud server or a browser extension.',
          'Fewer dead leads: buyers stop messaging about sold cars and stale prices, so your team spends time on real, available inventory.',
          'It pairs with the initial bulk post (to load your existing lot once) and the auto-poster overview (for the full posting workflow).',
        ],
      },
      {
        type: 'callout',
        title: 'Sync depends on a feed, and on account health',
        body: 'Inventory sync is only as current as the feed behind it — if your feed updates daily, your '
          + 'Marketplace listings track it daily. AutoLander supports CarGurus, Cars.com and custom feeds/exports '
          + '(named DMS and website systems connect via a custom export — see the integrations page). And because '
          + 'automating a personal Facebook profile is a gray area no matter the tool, AutoLander keeps your '
          + 'session on your own machine as a deliberate account-health choice — but no honest vendor can promise '
          + 'you will never be flagged.',
      },
    ],
    faq: [
      ['Which feeds and DMS does AutoLander support for inventory sync?',
        'AutoLander syncs directly from a CarGurus or Cars.com feed, or from a custom feed/export. Named systems like vAuto, CDK, Dealer.com, DealerCenter, HomeNet, Frazer and Tekion are supported via a custom feed/export from that platform rather than a one-click button — see the integrations page for how each one connects.'],
      ['How often does AutoLander sync my Marketplace listings?',
        'AutoLander reconciles your listings against your feed on a recurring basis, so new arrivals, price changes and sold units flow through automatically. How current your listings are depends on how often your feed itself updates — a feed that refreshes daily keeps Marketplace tracking daily.'],
      ['Does AutoLander remove sold cars from Facebook Marketplace automatically?',
        'Yes. When your feed marks a vehicle sold, AutoLander takes the matching Marketplace listing down automatically — so buyers never message about a car that is already gone, and your team stops chasing dead leads.'],
      ['Can AutoLander post from my dealership website to Facebook Marketplace?',
        'Yes, if your website can produce an inventory feed or scheduled export. AutoLander uses that feed as the source for your listings, then posts new arrivals, updates prices and removes sold units to keep Marketplace matched to your site.'],
      ['What about a DMS like vAuto or CDK — is it a direct integration?',
        'Not a named one-click integration. AutoLander ingests inventory from systems like vAuto or CDK via a custom feed/export from that platform, then runs the same sync — new arrivals, price updates and automatic sold-removal. The integrations page covers the specific systems and how they connect.'],
      ['Does inventory sync also bulk post my existing lot?',
        'Inventory sync keeps your listings accurate over time; for the first push of your existing inventory, AutoLander does an initial bulk post of your whole lot from the feed. After that, the sync takes over — posting new arrivals, updating prices and removing sold units.'],
    ],
    cta: {
      heading: 'Keep your Marketplace listings in sync automatically',
      sub: 'See plans and book a demo — auto-sync your feed, update prices and remove sold cars on autopilot.',
    },
    relatedHeading: 'Explore AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Bulk post cars to Facebook Marketplace', url: SITE.origin + NAV.bulk.path },
        { name: 'Facebook Marketplace integrations & DMS feeds', url: SITE.origin + NAV.integHub.path },
        { name: 'Facebook Marketplace auto poster for car dealers', url: SITE.origin + NAV.category.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
        { name: 'Facebook Marketplace auto poster pricing', url: SITE.origin + NAV.pricing.path },
      ],
    },
  },
];
