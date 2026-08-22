// ASSISTANT page (COMMERCIAL) — primary: facebook marketplace assistant. Also: facebook marketplace
// ai assistant, marketplace selling assistant, virtual assistant for facebook marketplace. Commercial
// intent — frames AutoLander as the always-on assistant that posts/enhances/maintains listings.
// >>> AutoLander does NOT touch the Marketplace inbox (Michael, 2026-08-22): it does not reply to
// >>> buyers AND it does not route/forward/surface buyer messages. NEVER claim message routing.
// Honest to what the site advertises (posting, photos, descriptions, price sync, sold-removal).
// NO pixel. Follows scripts/seo/shell.mjs contract.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.assistant.path;

const SOFTWARE_DESC =
  'AutoLander is a Facebook Marketplace assistant for car dealers: a native desktop app that lists your '
  + 'inventory, enhances every photo, writes the descriptions, keeps prices in step with the feed and '
  + 'removes sold units automatically — from $39/mo.';

export const PAGES = [
  {
    key: 'assistant',
    title: 'Facebook Marketplace Assistant for Car Dealers | AutoLander',
    description:
      'Facebook Marketplace assistant for dealers: auto-post inventory, enhance photos, write descriptions, '
      + 'sync prices and remove sold units. From $39/mo.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace assistant for car dealers',
    bylineUpdated: true,
    tldr:
      'A Facebook Marketplace assistant is software that acts like a tireless team member for your Marketplace '
      + 'listings — posting your inventory, keeping it current and enhancing every photo. AutoLander handles the '
      + 'listing busywork; it does not go near your inbox, impersonate a salesperson or message buyers. Plans '
      + 'start at $39/mo with 5 free posts.',
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
          + 'salesperson’s plate — preparing eligible listings, keeping prices and details current, enhancing the '
          + 'photos, writing the descriptions and removing sold units. Think of it as a tireless assistant '
          + 'dedicated to your Marketplace listings — the conversations stay entirely with your people.',
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
          { title: 'Lists your inventory', body: 'Works through vehicles from your feed with a configurable posting queue — the [listing software](/facebook-marketplace-listing-software/) at the core.' },
          { title: 'Enhances every photo', body: 'The AI Photo Studio swaps lot backgrounds for clean showroom backdrops so each listing looks professional.' },
          { title: 'Writes the descriptions', body: 'AI writes an accurate, VIN-specific description for every vehicle, so nothing is copy-pasted.' },
          { title: 'Keeps it current', body: 'Refreshes prices and removes sold units automatically via [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'Keeps prices honest', body: 'Asking prices track the feed, so a buyer never opens a listing priced where the car was last month.' },
          { title: 'Reports what sold', body: 'Post-to-sale attribution shows which listings actually moved metal.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers use AutoLander as their Marketplace assistant',
        items: [
          'While the desktop app is running, it lists, refreshes and removes inventory without someone re-checking every VIN by hand.',
          'It is a native desktop app: the assistant runs on your own machine and Facebook session, not a shared cloud server.',
          'It handles the full lifecycle — post, enhance, maintain, attribute — not just one step.',
          'It scales from a single rep to a full rooftop, with a live manager dashboard, from $39/mo.',
        ],
      },
      {
        type: 'qa',
        q: 'Does AutoLander automate Facebook Marketplace messages?',
        a: [
          'No. AutoLander automates the inventory and listing workflow and stops there. It does not send buyer '
          + 'replies, negotiate, or pretend to be a salesperson — and it does not read, forward or manage your '
          + 'Marketplace inbox at all. Your team sees the messages in Messenger, exactly as they do today.',
          'That distinction matters when comparing Facebook Marketplace message automation tools: unsupervised '
          + 'auto-replies can invent promises about availability, pricing, financing or vehicle condition. What '
          + 'AutoLander contributes to a fast answer is upstream — accurate prices and specs on the listing, and '
          + 'sold units already pulled down, so whoever replies is working from facts.',
        ],
      },
      {
        type: 'callout',
        title: 'An honest note',
        body: 'Meta’s Terms prohibit unauthorized automated access, and Marketplace eligibility, limits and '
          + 'business options can change. AutoLander keeps the session on the dealer’s own machine, but local '
          + 'architecture is not Meta approval and cannot guarantee access. See the '
          + '[automation policy and safety guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['Is the Facebook Marketplace assistant an AI tool?',
        'Yes — it uses AI for the photo enhancement and the written descriptions, and automation for the posting and sold-removal. It is one of the core [Facebook AI tools](/facebook-ai-tools/) AutoLander offers for car dealers.'],
      ['Does AutoLander automate Facebook Marketplace messages?',
        'No. AutoLander does not send buyer replies and does not handle, forward or manage Marketplace messages in any form. Your salespeople answer in Messenger as they always have; AutoLander handles the listing busywork behind them.'],
      ['How much does a Facebook Marketplace assistant cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts and no credit card. See the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['Can the assistant manage my whole lot?',
        'AutoLander can load the whole inventory feed, manage a queue of eligible listings and keep published units in sync. Meta controls Marketplace access and listing limits, so software cannot promise that every VIN can be live at once. See [bulk posting](/bulk-post-cars-to-facebook-marketplace/) and [inventory sync](/facebook-marketplace-inventory-sync/).'],
      ['Is using a Marketplace assistant against Facebook’s rules?',
        'Meta prohibits unauthorized automated access, and eligibility varies by account and market. AutoLander’s local desktop architecture is not Meta approval and cannot guarantee access. Read the [automation policy and safety guide](/guide/facebook-marketplace-automation/) first.'],
    ],
    cta: {
      heading: 'Put a Marketplace assistant on your lot',
      sub: 'See plans and book a demo — automatic listing, photo enhancement, price sync and sold-removal, on your own inventory.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: { software: SOFTWARE_DESC },
  },
];
