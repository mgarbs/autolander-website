// Homepage Markdown twin (/index.md) + the facts the static pre-render block in index.html states.
//
// WHY THIS EXISTS: the homepage is a React SPA, so `/` has no crawlable body. Two things fix that:
//   1. index.html carries a static block inside #root (real text before any JS runs), and
//   2. this module renders /index.md — the Markdown representation the Worker serves when a client
//      asks for `/` with `Accept: text/markdown` (acceptmarkdown.com content negotiation).
//
// This page object is deliberately NOT added to the ALL array in build-seo-pages.mjs. That array
// writes <path>/index.html for every entry, and for path '/' that would overwrite the SPA shell —
// i.e. delete the actual website. Only the .md twin is generated from it.
//
// KEEP IN STEP: HOME_FACTS.h1 / .subhead / .trustLine are duplicated as visible copy in
// src/sections/Hero.jsx and in the static block in index.html. test/agent-readiness.test.js
// asserts all three still agree, so a copy change in one place fails the build rather than
// silently drifting.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';

// The literal above-the-fold copy, in plain text. Single source of truth for the drift test.
export const HOME_FACTS = {
  eyebrow: 'Facebook Marketplace Automation — For Car Dealers & Sales Reps',
  h1: 'Sell more cars on Facebook Marketplace—without posting them one by one.',
  subhead:
    'AutoLander is Facebook Marketplace auto posting software for car dealers and sales reps. It '
    + 'creates listings from your inventory in minutes, keeps prices current, flags sold units, '
    + 'and tracks which posts generate buyer conversations.',
  trustLine: '5 free posts in your demo · No credit card required · Plans from $39/month',
};

export const HOME = {
  key: 'home',
  title: 'AutoLander | Facebook Marketplace Software for Car Dealers',
  description:
    'Facebook Marketplace software for car dealers that auto-posts inventory, updates prices, '
    + 'removes sold cars and tracks sales. From $' + SITE.lowPrice + '/mo.',
  eyebrow: HOME_FACTS.eyebrow,
  h1: HOME_FACTS.h1,
  bylineUpdated: true,
  tldr:
    'AutoLander is a native desktop application that car dealerships and independent sales reps use '
    + 'to merchandise inventory on Facebook Marketplace. Connect the inventory source you already '
    + 'run — a DMS export, an SFTP or CSV feed, or your dealer website — and AutoLander prepares and '
    + 'posts listings, keeps asking prices in step with the feed, removes sold units, enhances listing '
    + 'photos with AI, and reports which posts produced buyer conversations. Plans start at $'
    + SITE.lowPrice + '/month; every demo includes 5 free posts and requires no credit card.',
  breadcrumbs: [{ name: 'Home', url: home }],
  sections: [
    {
      type: 'prose',
      paras: [
        HOME_FACTS.subhead,
        'Posting a lot to Facebook Marketplace by hand is the bottleneck: a hundred-car lot is a '
        + 'hundred manual listings, each with photos, mileage, price and description, and every one '
        + 'of them goes stale the moment the price changes or the car sells. AutoLander closes that '
        + 'gap — it reads the inventory you already publish and keeps Marketplace matched to the lot.',
      ],
    },
    {
      type: 'bullets',
      h2: 'What AutoLander does',
      items: [
        'Posts vehicles from your inventory feed to Facebook Marketplace, with photos, mileage, price and description filled in.',
        'Keeps asking prices in step with the feed, so a price drop on the lot reaches Marketplace.',
        'Removes sold units, so buyers stop messaging about cars that are already gone.',
        'Enhances listing photos with AI — real cars, never repainted or fabricated.',
        'Routes buyer messages from the Marketplace inbox to your team and tracks which posts led to sales.',
        'Supports cars, trucks and RV / camper inventory, posting each into the correct Marketplace category.',
      ],
    },
    {
      type: 'steps',
      h2: 'How it works',
      steps: [
        {
          title: 'Connect your inventory',
          body:
            'Point AutoLander at the inventory source you already run: CarGurus, Cars.com, a DMS '
            + 'export from vAuto, DealerCenter, Frazer, CDK, Tekion or HomeNet, an SFTP/CSV drop, or '
            + 'your dealer website. No new system of record and no re-keying.',
        },
        {
          title: 'Review and post',
          body:
            'AutoLander builds a posting queue from the feed, prepares each listing, and posts through '
            + 'your own logged-in Facebook session at a pace you control. Meta eligibility rules and '
            + 'listing limits still apply — AutoLander does not override them.',
        },
        {
          title: 'Keep it current',
          body:
            'The feed is re-checked on a schedule. New arrivals are queued, price changes are pushed, '
            + 'and sold units are pulled down, so what a buyer sees on Marketplace matches the lot.',
        },
      ],
    },
    {
      type: 'bullets',
      h2: 'Who it is for',
      items: [
        'Franchise and independent used-car dealerships in the United States that want whole-lot Marketplace coverage without a dedicated poster.',
        'Dealer groups running several rooftops that need per-store inventory kept separate.',
        'Individual sales reps posting their own units who want the same automation at a single-seat price.',
        'RV and camper dealers, who need inventory posted into the RV/Camper category rather than as cars.',
      ],
    },
    {
      type: 'bullets',
      h2: 'Pricing',
      intro:
        'Published pricing, monthly, no setup fee. Every plan starts with 5 free posts and no credit card.',
      items: [
        'Starter — $39/month.',
        'Growth — $59/month.',
        'Pro — $79/month.',
        'Dealer plans from $117/month, including multi-rooftop dealer groups.',
        'Full plan detail: ' + SITE.origin + NAV.pricing.path,
      ],
    },
    {
      type: 'callout',
      title: 'What AutoLander does not do',
      body:
        'AutoLander does not auto-reply to buyers on your behalf — it routes Marketplace messages to '
        + 'your team, and a human writes the reply. It does not override Meta eligibility rules, '
        + 'listing limits or terms, and no automation tool can guarantee an account will never be '
        + 'actioned. It does not invent vehicle facts: unknown mileage stays blank rather than being '
        + 'guessed, and AI photo editing never repaints a car a colour it is not.',
    },
  ],
  faq: [
    [
      'What is AutoLander?',
      'AutoLander is Facebook Marketplace software for U.S. car dealerships and sales reps. It '
      + 'connects to a dealer inventory feed, posts vehicles to Facebook Marketplace, keeps prices '
      + 'current, removes sold units, enhances listing photos with AI and tracks which posts led to '
      + 'buyer conversations. It is built and operated by AutoLander LLC.',
    ],
    [
      'How much does AutoLander cost?',
      'Plans start at $39/month (Starter), $59/month (Growth) and $79/month (Pro), with dealer and '
      + 'multi-rooftop plans from $117/month. Every demo includes 5 free posts and does not require '
      + 'a credit card.',
    ],
    [
      'What inventory feeds does AutoLander support?',
      'CarGurus and Cars.com are supported directly. vAuto, DealerCenter, Dealer.com, HomeNet, '
      + 'Frazer, CDK and Tekion are ingested via a custom feed or export, and most dealer websites '
      + 'can be read directly. SFTP and CSV drops are also supported.',
    ],
    [
      'Is automated posting to Facebook Marketplace allowed?',
      'Meta sets the rules, and they change. AutoLander posts through the dealer’s own logged-in '
      + 'session at a controlled pace rather than through an unofficial API, and it does not override '
      + 'eligibility rules or listing limits. No tool — including this one — can guarantee an account '
      + 'will never be actioned; the honest version is at ' + SITE.origin + NAV.safety.path + '.',
    ],
    [
      'Does AutoLander reply to buyers automatically?',
      'No. AutoLander surfaces and routes Marketplace messages to your team so they get answered '
      + 'faster, but a human writes the reply. Any vendor claiming a hands-off AI that closes car '
      + 'deals for you is overselling.',
    ],
    [
      'What platforms does AutoLander run on?',
      'AutoLander is a native desktop application for Windows, macOS and Linux, paired with a cloud '
      + 'service that stores inventory and handles billing. The desktop app drives the Facebook '
      + 'session, which is why it runs on your machine rather than in a browser tab.',
    ],
  ],
  cta: {
    heading: 'See it run on your own inventory',
    sub:
      'Book a demo and we will connect your feed and post real vehicles on the call. 5 free posts, '
      + 'no credit card, plans from $' + SITE.lowPrice + '/month. Contact: sales@autolander.ai · (919) 280-0967.',
  },
  related: [
    { href: NAV.category.path, text: NAV.category.anchor },
    { href: NAV.pricing.path, text: NAV.pricing.anchor },
    { href: NAV.integHub.path, text: NAV.integHub.anchor },
    { href: NAV.dealers.path, text: NAV.dealers.anchor },
    { href: NAV.compareHub.path, text: NAV.compareHub.anchor },
    { href: NAV.safety.path, text: NAV.safety.anchor },
    { href: NAV.about.path, text: NAV.about.anchor },
    { href: NAV.contact.path, text: NAV.contact.anchor },
  ],
};
