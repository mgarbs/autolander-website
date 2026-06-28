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
      'The Facebook AI tools that help car dealers sell more on Marketplace — an AI Photo Studio, '
      + 'AI-written descriptions, AI auto-posting and an AI Marketplace assistant. See how each works, '
      + 'and the all-in-one tool from $39/mo with 5 free posts.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook AI tools for car dealers',
    bylineUpdated: true,
    tldr:
      'Facebook AI tools are software that uses AI to do the work of selling on Facebook Marketplace for '
      + 'you — enhancing photos, writing listings, auto-posting your whole inventory, and assisting with '
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
          { title: 'AI auto-posting', body: 'AI posts your whole inventory to Marketplace at a human-like pace — the engine behind the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) and [Facebook autoposter](/facebook-autoposter/).' },
          { title: 'AI Marketplace assistant', body: 'AI keeps listings current, removes sold units and helps route buyer messages — your always-on [Facebook Marketplace assistant](/facebook-marketplace-assistant/).' },
          { title: 'AI walkaround video', body: 'AI generates a short walkaround video per vehicle, which Marketplace and buyers favor over static photos.' },
          { title: 'Full Marketplace automation', body: 'Put it together and it is end-to-end [Facebook Marketplace automation](/facebook-marketplace-automation/): sync, post, refresh, remove — hands-off.' },
        ],
      },
      {
        type: 'qa',
        q: 'Does Facebook have its own AI tools for selling cars?',
        a: [
          'Facebook (Meta) offers some AI features inside its ad and catalog products, and a sanctioned vehicle '
          + 'inventory/catalog route for dealers. But for the organic Marketplace listings where most local buyers '
          + 'actually browse, there is no native one-click "AI lister" — that is the gap third-party Facebook AI '
          + 'tools like AutoLander fill, by automating the posting and enhancing every listing.',
          'AutoLander runs as a native desktop app on your own computer, so the AI posts through your normal '
          + 'Facebook session rather than a shared cloud server or a browser extension.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'How car dealers use Facebook AI tools to sell more',
        items: [
          'Bulk-list the whole lot: AI posts every vehicle from your feed — see [bulk posting to Facebook Marketplace](/bulk-post-cars-to-facebook-marketplace/).',
          'Keep it accurate automatically: AI syncs prices and removes sold cars via [Facebook Marketplace inventory sync](/facebook-marketplace-inventory-sync/).',
          'Look professional on every listing: AI photos + AI descriptions make a phone snap look like a studio shoot.',
          'Measure what works: post-to-sale attribution shows which AI-posted listings actually sold cars.',
          'Stay honest about risk: AI automation of a personal profile is a gray area — see the [automation guide](/guide/facebook-marketplace-automation/).',
        ],
      },
      {
        type: 'callout',
        title: 'AI helps — but be clear-eyed',
        body: 'AI tools make Marketplace dramatically faster for a dealer, but automating a personal Facebook '
          + 'profile (with any tool, AI or not) is a gray area, and Meta’s sanctioned route is its vehicle catalog. '
          + 'AutoLander keeps your session on your own machine to lower technical flag triggers — risk reduction, '
          + 'not a guarantee. Compare the AI tools honestly on our [comparison hub](/compare/).',
      },
    ],
    faq: [
      ['What is the best AI tool for Facebook Marketplace?',
        'It depends on whether you need photos, descriptions, posting, or all of it. AutoLander bundles the AI Photo Studio, AI-written listings, AI auto-posting and a Marketplace assistant in one tool, which is why most dealers pick it over single-purpose tools. See the full head-to-head on our [2026 comparison](/compare/).'],
      ['Are there free Facebook AI tools for car dealers?',
        'Most capable AI tools are paid because they do ongoing work — generating photos, writing copy, posting and syncing. AutoLander gives you 5 free posts with no credit card to try the AI before paying, then plans start at $39/mo. See [pricing](/facebook-marketplace-auto-poster-pricing/).'],
      ['Can AI post my car listings to Facebook Marketplace automatically?',
        'Yes — that is what AI auto-posting does. AutoLander reads your inventory feed and posts every vehicle to Marketplace at a human-like pace. See the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) and [Facebook autoposter](/facebook-autoposter/) pages for how it works.'],
      ['Does AI write the car descriptions too?',
        'Yes. AutoLander’s AI writes a VIN-specific description for each vehicle — accurate and readable — so your [Facebook Marketplace listings](/facebook-marketplace-listing-software/) do not all sound the same or take hours to write.'],
      ['Is using AI tools on Facebook Marketplace against the rules?',
        'Marketplace was built for individuals, and automating a personal profile — with AI or any tool — is common but a gray area; Meta’s sanctioned dealer route is the vehicle catalog. AutoLander lowers the obvious technical triggers but cannot guarantee against a ban. Read the [honest automation guide](/guide/facebook-marketplace-automation/) first.'],
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
