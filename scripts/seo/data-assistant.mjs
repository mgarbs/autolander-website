// ASSISTANT page (COMMERCIAL) — primary: facebook marketplace assistant. Also: facebook marketplace
// ai assistant, marketplace selling assistant, virtual assistant for facebook marketplace. Commercial
// intent — frames AutoLander as the always-on assistant that posts/enhances/maintains listings and
// routes buyer messages. Honest to what the site advertises (posting, photos, descriptions,
// sold-removal, message routing). NO pixel. Follows scripts/seo/shell.mjs contract.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.assistant.path;

const SOFTWARE_DESC =
  'AutoLander is a Facebook Marketplace assistant for car dealers: a native desktop app that lists your '
  + 'inventory, enhances every photo, writes the descriptions, removes sold units and helps route buyer '
  + 'messages — your always-on Marketplace assistant from $39/mo.';

export const PAGES = [
  {
    key: 'assistant',
    title: 'Facebook Marketplace Assistant for Car Dealers | AutoLander',
    description:
      'AutoLander is your Facebook Marketplace assistant — a native desktop app that automatically lists your '
      + 'inventory, enhances photos, writes descriptions, removes sold cars and helps route buyer messages. '
      + 'From $39/mo, 5 free posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace assistant for car dealers',
    bylineUpdated: true,
    tldr:
      'A Facebook Marketplace assistant is software that acts like a tireless team member for your Marketplace '
      + 'listings — posting your inventory, keeping it current, enhancing every photo and helping with buyer '
      + 'messages. AutoLander is that assistant for car dealers: a native desktop app that runs the busywork '
      + 'automatically, from $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Assistant', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is a Facebook Marketplace assistant?',
        a: [
          'A Facebook Marketplace assistant is software that takes the repetitive Marketplace work off a '
          + 'salesperson’s plate — listing every vehicle, keeping prices and details current, enhancing the '
          + 'photos, writing the descriptions, removing sold units, and helping route buyer messages back to your '
          + 'team. Think of it as a tireless assistant dedicated to your Marketplace presence.',
          'AutoLander is that assistant, built for car dealers. It runs as a native desktop app on your own '
          + 'computer and posts through your normal Facebook session, so the work happens on your machine rather '
          + 'than a shared cloud server. Under the hood it is the same engine as the '
          + '[Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/), packaged as an assistant that '
          + 'handles the whole listing lifecycle.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/hyundai-sonata-before.webp',
        after: '/studio/hyundai-sonata-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2024 Hyundai Sonata before AutoLander',
        afterAlt: 'The same 2024 Hyundai Sonata as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'Your assistant handles the photos too: AutoLander turns a raw 2024 Hyundai Sonata lot photo (left) into a showroom-grade Marketplace listing (right), automatically.',
      },
      {
        type: 'features',
        h2: 'What your AutoLander Marketplace assistant does',
        intro: 'The jobs you would hand a dedicated Marketplace person — handled automatically.',
        cards: [
          { title: 'Lists your inventory', body: 'Posts every vehicle from your feed to Marketplace at a human-like pace — the [listing software](/facebook-marketplace-listing-software/) at the core.' },
          { title: 'Enhances every photo', body: 'The AI Photo Studio swaps lot backgrounds for clean showroom backdrops so each listing looks professional.' },
          { title: 'Writes the descriptions', body: 'AI writes an accurate, VIN-specific description for every vehicle, so nothing is copy-pasted.' },
          { title: 'Keeps it current', body: 'Refreshes prices and removes sold units automatically via [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'Routes buyer messages', body: 'Helps get Messenger leads back to your team so a real person can close the deal.' },
          { title: 'Reports what sold', body: 'Post-to-sale attribution shows which listings actually moved metal.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers use AutoLander as their Marketplace assistant',
        items: [
          'It works around the clock — listing, refreshing and removing without anyone re-checking 150 VINs by hand.',
          'It is a native desktop app: the assistant runs on your own machine and Facebook session, not a shared cloud server.',
          'It handles the full lifecycle — post, enhance, maintain, attribute — not just one step.',
          'It scales from a single rep to a full rooftop, with a live manager dashboard, from $39/mo.',
        ],
      },
      {
        type: 'callout',
        title: 'An honest note',
        body: 'A Marketplace assistant that automates a personal Facebook profile is a gray area with any tool — '
          + 'Meta built Marketplace for individuals and sanctions the vehicle catalog for dealers. AutoLander keeps '
          + 'your session on your own machine and paces the work to lower technical triggers, but that is risk '
          + 'reduction, not a guarantee. See the [honest automation guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['Is the Facebook Marketplace assistant an AI tool?',
        'Yes — it uses AI for the photo enhancement and the written descriptions, and automation for the posting and sold-removal. It is one of the core [Facebook AI tools](/facebook-ai-tools/) AutoLander offers for car dealers.'],
      ['Does the assistant reply to buyers for me?',
        'AutoLander helps route Messenger leads back to your team quickly so a real person can answer and close — keeping a human in the loop on the actual sale, while the assistant handles the listing busywork around it.'],
      ['How much does a Facebook Marketplace assistant cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts and no credit card. See the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['Can the assistant manage my whole lot?',
        'Yes. It lists your entire inventory from a feed and keeps it in sync — new VINs auto-post, sold units auto-remove. See [bulk posting](/bulk-post-cars-to-facebook-marketplace/) and [inventory sync](/facebook-marketplace-inventory-sync/).'],
      ['Is using a Marketplace assistant against Facebook’s rules?',
        'Automating a personal profile — by any assistant or tool — is common but a gray area, and Meta’s sanctioned dealer route is the vehicle catalog. AutoLander lowers obvious technical triggers but cannot guarantee against a ban. Read the [automation guide](/guide/facebook-marketplace-automation/) first.'],
    ],
    cta: {
      heading: 'Put a Marketplace assistant on your lot',
      sub: 'See plans and book a demo — automatic listing, photo enhancement, sold-removal and lead routing, on your own inventory.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: { software: SOFTWARE_DESC },
  },
];
