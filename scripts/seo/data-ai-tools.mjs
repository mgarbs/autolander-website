// AI-TOOLS educational hub — the top of the "educational silo" that pushes exact-match commercial
// pages. Primary: facebook ai tools. Also: ai tools for facebook marketplace, ai for selling cars
// on facebook, facebook marketplace ai. Informational/category intent → links DOWN to every
// commercial page with exact-match, keyword-rich anchors. Funnels to the homepage booking modal.
// Static, NO pixel. Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.aiTools.path;

const SOFTWARE_DESC =
  'AutoLander is an all-in-one suite of Facebook AI tools for car dealers: an AI Photo Studio, '
  + 'AI-written listings, AI auto-posting and a Marketplace assistant that lists your inventory on '
  + 'Facebook Marketplace and keeps it current — from a native desktop app, from $39/mo.';

export const PAGES = [
  {
    key: 'aiTools',
    title: 'Facebook AI Tools for Car Dealers (2026 Guide) | AutoLander',
    description:
      'Facebook AI tools for car dealers: enhance photos, write listings, auto-post inventory and route '
      + 'buyer messages. From $39/mo with 5 free posts.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook AI tools for car dealers',
    bylineUpdated: true,
    tldr:
      'Facebook AI tools are software that uses AI to do the work of selling on Facebook Marketplace for '
      + 'you — enhancing photos, writing listings, managing eligible vehicles in a queue, and assisting with '
      + 'buyer messages. AutoLander bundles all four in one native desktop app built for car dealers, from '
      + '$39/mo with 5 free posts and no credit card.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Facebook AI tools', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What are Facebook AI tools for car dealers?',
        a: [
          'Facebook AI tools are software that uses artificial intelligence to automate and improve how a car '
          + 'dealership sells on Facebook — mainly on Facebook Marketplace, where local buyers shop. Instead of a '
          + 'salesperson editing photos, writing descriptions and posting each VIN by hand, AI tools do that work: '
          + 'they clean up lot photos, write the listing copy, post your inventory automatically, and help handle '
          + 'incoming buyer messages.',
          'They fall into four buckets: AI photo enhancement, AI-written listings, AI auto-posting, and an AI '
          + 'Marketplace assistant. AutoLander combines all four in one native desktop app, so you are not stitching '
          + 'together four separate tools.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/jeep-wrangler-before.webp',
        after: '/studio/jeep-wrangler-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2026 Jeep Wrangler before AutoLander',
        afterAlt: 'The same 2026 Jeep Wrangler as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'One of the AI tools in action: AutoLander turns a raw 2026 Jeep Wrangler lot photo (left) into a showroom-grade Facebook Marketplace listing (right), automatically.',
      },
      {
        type: 'features',
        h2: 'The Facebook AI tools AutoLander brings to Marketplace',
        intro: 'Four AI capabilities, one app — each maps to a job a dealer used to do by hand. Follow any one to go deeper.',
        cards: [
          { title: 'AI Photo Studio', body: 'AI replaces messy lot backgrounds with clean showroom backdrops and orders the shots buyers respond to — the photo half of [Facebook Marketplace listing software](/facebook-marketplace-listing-software/).' },
          { title: 'AI-written listings', body: 'AI writes a clear, accurate, VIN-specific description for every vehicle, so each [Facebook listing](/facebook-listing-software/) reads professionally without copy-paste.' },
          { title: 'AI-assisted posting', body: 'AutoLander builds listings from your inventory and moves eligible vehicles through a configurable queue — the workflow behind the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) and [Facebook autoposter](/facebook-autoposter/).' },
          { title: 'AI Marketplace assistant', body: 'While the desktop app is running, it helps keep listings current, remove sold units and route buyer messages — your [Facebook Marketplace assistant](/facebook-marketplace-assistant/).' },
          { title: 'AI walkaround video', body: 'AI generates a short walkaround video per vehicle, which Marketplace and buyers favor over static photos.' },
          { title: 'Full Marketplace automation', body: 'Put it together and it is end-to-end [Facebook Marketplace automation](/facebook-marketplace-automation/): sync, post, refresh, remove — hands-off.' },
        ],
      },
      {
        type: 'qa',
        q: 'Does Facebook have its own AI tools for selling cars?',
        a: [
          'Meta offers AI features within some advertising products, but its products, availability and account '
          + 'eligibility change over time. For organic Marketplace listings, dealers still need to confirm that '
          + 'their account and listing category are eligible before using any third-party workflow. AutoLander helps '
          + 'prepare, queue and maintain eligible listings; it does not provide Meta approval or override limits.',
          'AutoLander runs as a native desktop app on your own computer, so the AI posts through your normal '
          + 'Facebook session rather than a shared cloud server or a browser extension.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'How car dealers use Facebook AI tools to sell more',
        items: [
          'Load the whole inventory feed, then manage eligible vehicles within the account’s current limits — see [bulk posting to Facebook Marketplace](/bulk-post-cars-to-facebook-marketplace/).',
          'Keep it accurate automatically: AI syncs prices and removes sold cars via [Facebook Marketplace inventory sync](/facebook-marketplace-inventory-sync/).',
          'Look professional on every listing: AI photos + AI descriptions make a phone snap look like a studio shoot.',
          'Measure what works: post-to-sale attribution shows which AI-posted listings actually sold cars.',
          'Check permission first: Meta’s Terms prohibit automated access without prior permission — see the [policy and safety guide](/guide/facebook-marketplace-automation/).',
        ],
      },
      {
        type: 'callout',
        title: 'AI helps — but be clear-eyed',
        body: 'AI tools can make listing preparation much faster, but they do not change Meta’s terms, account '
          + 'eligibility or current listing limits. Meta prohibits accessing its products by automated means without '
          + 'prior permission, and AutoLander cannot promise approval or uninterrupted access. Review the '
          + '[Marketplace policy and safety guide](/guide/facebook-marketplace-automation/) and compare the tools '
          + 'honestly on our [comparison hub](/compare/).',
      },
    ],
    faq: [
      ['What is the best AI tool for Facebook Marketplace?',
        'It depends on whether you need photo preparation, descriptions, a listing queue, inventory reconciliation, message routing, or all of them. AutoLander bundles those dealer workflows in one desktop app. Compare its fit with single-purpose and competing tools in our [2026 comparison](/compare/).'],
      ['Are there free Facebook AI tools for car dealers?',
        'Most capable AI tools are paid because they do ongoing work — generating photos, writing copy, posting and syncing. AutoLander gives you 5 free posts with no credit card to try the AI before paying, then plans start at $39/mo. See [pricing](/facebook-marketplace-auto-poster-pricing/).'],
      ['Can AI post my car listings to Facebook Marketplace automatically?',
        'AutoLander can read your inventory feed, prepare listings and work through a configurable posting queue for eligible Marketplace listings while the desktop app is running. Your Meta account, category and current listing limits still apply. See the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) and [Facebook autoposter](/facebook-autoposter/) pages for how it works.'],
      ['Does AI write the car descriptions too?',
        'Yes. AutoLander’s AI writes a VIN-specific description for each vehicle — accurate and readable — so your [Facebook Marketplace listings](/facebook-marketplace-listing-software/) do not all sound the same or take hours to write.'],
      ['Is using AI tools on Facebook Marketplace against the rules?',
        'Meta’s Terms prohibit accessing its products by automated means without prior permission. Account eligibility, categories and listing limits also apply, and AutoLander cannot make a workflow Meta-approved or guarantee against restriction. Read the [Marketplace policy and safety guide](/guide/facebook-marketplace-automation/) before using any automation.'],
    ],
    cta: {
      heading: 'Put every Facebook AI tool to work on your lot',
      sub: 'See plans and book a demo — AI photos, AI listings, AI auto-posting and an AI Marketplace assistant, on your own inventory.',
    },
    relatedHeading: 'Explore each AI tool',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
        { name: 'Facebook Marketplace listing software & tools', url: SITE.origin + NAV.listingSw.path },
        { name: 'Facebook Marketplace automation', url: SITE.origin + NAV.automation.path },
        { name: 'Facebook Marketplace assistant', url: SITE.origin + NAV.assistant.path },
        { name: 'Facebook autoposter', url: SITE.origin + NAV.autoposter.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
      ],
    },
  },
];
