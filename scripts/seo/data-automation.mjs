// AUTOMATION page (COMMERCIAL) — primary: facebook marketplace automation. Also: automate facebook
// marketplace, automated facebook marketplace posting, facebook marketplace automation software/tool.
// Commercial/transactional intent. Distinct from /guide/facebook-marketplace-automation/ (the
// EDUCATIONAL "honest version" deep-dive) — this page sells the automation; the guide explains the
// risks and links up to it. No cannibalization (informational vs commercial split). NO pixel.
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.automation.path;

const SOFTWARE_DESC =
  'AutoLander is Facebook Marketplace automation software for car dealers: a native desktop app that '
  + 'automatically posts your inventory, refreshes prices, removes sold units and enhances every photo — '
  + 'hands-off Marketplace posting from $39/mo.';

export const PAGES = [
  {
    key: 'automation',
    title: 'Facebook Marketplace Automation for Car Dealers | AutoLander',
    description:
      'Facebook Marketplace automation for car dealers: auto-post inventory, update prices, remove sold cars '
      + 'and enhance photos. From $39/mo, 5 free posts.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace automation for car dealers',
    bylineUpdated: true,
    tldr:
      'Facebook Marketplace automation is software that runs your Marketplace listings for you — posting your '
      + 'whole inventory, refreshing prices, and removing sold units automatically instead of by hand. AutoLander '
      + 'is a native desktop app with a configurable posting queue, and enhances every photo with an '
      + 'AI Photo Studio. Plans from $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Automation', url: canonical },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is Facebook Marketplace automation?',
        a: [
          'Facebook Marketplace automation is software that handles your Marketplace listings automatically '
          + 'instead of a person doing each step by hand. It posts your inventory, keeps prices and details '
          + 'current, removes sold units, and can improve the photos and descriptions — so your lot stays fully '
          + 'and accurately represented on Marketplace without constant manual work.',
          'AutoLander automates Facebook Marketplace for car dealers from a native desktop app on your own '
          + 'computer, posting through your normal Facebook session. The underlying posting is the same engine as '
          + 'the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/); this page is about '
          + 'automating the whole workflow end to end.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ford-maverick-before.webp',
        after: '/studio/ford-maverick-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2026 Ford Maverick before AutoLander',
        afterAlt: 'The same 2026 Ford Maverick as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'Automation includes the photos: AutoLander turns a raw 2026 Ford Maverick lot photo (left) into a showroom-grade Marketplace listing (right), automatically.',
      },
      {
        type: 'steps',
        h2: 'What AutoLander automates on Facebook Marketplace',
        intro: 'Connect your feed once; while the desktop app is running, it handles the repetitive inventory workflow.',
        steps: [
          { title: 'Auto-post your inventory', body: 'AutoLander reads your CarGurus or Cars.com feed (or a custom feed/export) and works through eligible vehicles with a configurable posting queue — see [bulk posting](/bulk-post-cars-to-facebook-marketplace/).' },
          { title: 'Auto-enhance every listing', body: 'The AI Photo Studio swaps lot backgrounds for showroom backdrops, AI writes each description, and a walkaround video is generated per vehicle.' },
          { title: 'Refresh and reconcile', body: 'Prices update as your feed changes and sold units are removed during [inventory sync](/facebook-marketplace-inventory-sync/), reducing stale-listing inquiries.' },
          { title: 'Measure it', body: 'Post-to-sale attribution shows which automated listings actually sold cars, not just views.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers automate Facebook Marketplace with AutoLander',
        items: [
          'It automates the whole loop — post, enhance, refresh, remove — not just the initial post.',
          'It is a native desktop app: the session stays on your machine rather than a shared cloud server, and no browser extension is required.',
          'It gives dealers configurable queue and pacing controls; those controls organize work but do not create Meta approval or override listing limits.',
          'It is honestly priced: published self-serve plans from $39/mo with 5 free posts, no contract.',
        ],
      },
      {
        type: 'callout',
        title: 'Automation requires a policy check',
        body: 'Meta’s Terms prohibit unauthorized automated access, and Marketplace eligibility, listing limits '
          + 'and business products can change. Keeping a session local is an architectural choice, not Meta '
          + 'approval. Read the full [automation policy and safety guide](/guide/facebook-marketplace-automation/) '
          + 'and confirm the rules shown for the account before you start.',
      },
    ],
    faq: [
      ['Can you automate Facebook Marketplace posting for a whole dealership?',
        'AutoLander can load an entire inventory feed, build a configurable queue of eligible vehicles and keep published listings in sync as prices and availability change. Meta controls Marketplace access and listing limits, so software cannot promise that a 150-car lot can be live at once. See [bulk posting](/bulk-post-cars-to-facebook-marketplace/).'],
      ['How much does Facebook Marketplace automation software cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts and no credit card. Competing tools run roughly $99–$249/mo, some on custom quotes. See the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['Is automating Facebook Marketplace against the rules?',
        'Meta’s Terms prohibit unauthorized automated access, while eligibility and business products vary by account and market. AutoLander’s local desktop architecture is not Meta approval and cannot guarantee access. See the [automation policy and safety guide](/guide/facebook-marketplace-automation/).'],
      ['What is the difference between this and the automation guide?',
        'This page is about the automation software itself — what AutoLander automates and what it costs. The [automation guide](/guide/facebook-marketplace-automation/) is the honest deep-dive on whether and how to automate Marketplace safely. Read both.'],
      ['Does the automation also improve my photos and descriptions?',
        'Yes — automation is not just posting. AutoLander’s AI Photo Studio replaces lot backgrounds with showroom backdrops and AI writes each VIN-specific description, so every automated listing looks professional. More on the [listing software](/facebook-marketplace-listing-software/) page.'],
    ],
    cta: {
      heading: 'Automate your whole Marketplace workflow',
      sub: 'See plans and book a demo — automatic posting, photo enhancement, price refresh and sold-removal, on your own inventory.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: { software: SOFTWARE_DESC },
  },
];
