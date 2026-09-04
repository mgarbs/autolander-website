// CATEGORY page — the new silo's execution spine. Targets the SINGULAR auto-poster head term
// with a deliberately narrow job: queueing eligible inventory, controlling posting pace and
// executing whole-lot work. Listing construction/field quality lives on /facebook-marketplace-
// listing-software/; "best/reviews/tools" buyer-guide intent lives on /compare/.
//
// This file is the REFERENCE implementation of the page-object contract (see scripts/seo/shell.mjs).

import { SITE, NAV } from './registry.mjs';
import { testimonialsSection } from './data-testimonials.mjs';

const canonical = SITE.origin + NAV.category.path;

const SOFTWARE_DESC =
  'AutoLander is a Facebook Marketplace auto poster for car dealers: a native desktop app that '
  + 'loads dealership inventory into a posting queue, provides pacing controls, executes posts from '
  + 'the dealer’s own computer, syncs changes and removes sold units — from $39/mo.';

export const PAGES = [
  {
    key: 'category',
    title: 'Facebook Marketplace Auto Poster for Dealers | AutoLander',
    description:
      'Facebook Marketplace auto poster for dealers: manage a whole-lot posting queue, control pacing, sync '
      + 'inventory and remove sold units. From $39/mo.',
    ogType: 'website',
    eyebrow: 'For car dealers & sales reps',
    h1: 'Facebook Marketplace auto poster for car dealers',
    bylineUpdated: true,
    tldr:
      'A Facebook Marketplace auto poster is the execution layer for dealership posting: it takes eligible '
      + 'vehicles from your inventory, puts them into a controlled queue and works through that queue without '
      + 'a salesperson reopening Marketplace for every VIN. AutoLander runs the queue from your own computer, '
      + 'provides pacing controls, refreshes price changes and removes sold units. It can manage a whole-lot '
      + 'workflow, while actual publishing remains subject to Meta’s eligibility and listing limits. Plans '
      + 'start at $39/mo with 5 free posts.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: canonical },
    ],
    sections: [
      {
        type: 'figure',
        before: '/studio/tesla-model-y-before.webp',
        after: '/studio/tesla-model-y-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2023 Tesla Model Y before AutoLander',
        afterAlt: 'The same 2023 Tesla Model Y as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'Before a vehicle enters the queue, AutoLander can prepare its photo assets; the auto poster then handles the repeated work of getting queue-ready inventory published.',
      },
      {
        type: 'qa',
        q: 'What is a Facebook Marketplace auto poster built to execute?',
        a: [
          'A Facebook Marketplace auto poster is software built to carry out the publishing workload after vehicle '
          + 'data and creative are ready. It accepts eligible inventory, creates a posting queue, moves units through '
          + 'that queue and keeps the work organized as the lot changes. The defining question is not merely whether '
          + 'the software can construct one listing; it is whether the software can execute a backlog of vehicle posts '
          + 'without a rep reopening Marketplace and repeating the same clicks for every VIN.',
          'AutoLander imports inventory from a CarGurus or Cars.com feed, or a custom feed/export, and runs the '
          + 'posting queue as a native desktop app on your own computer. Pacing controls govern how the queue is '
          + 'worked through your normal Facebook session. For the separate job of improving fields, photos and '
          + 'descriptions before a vehicle enters that queue, see our [Facebook Marketplace listing software]'
          + '(/facebook-marketplace-listing-software/) page.',
        ],
      },
      {
        type: 'qa',
        q: 'How does the posting queue handle a whole dealership lot?',
        a: [
          'A feed changes every day: new VINs arrive, prices move and sold vehicles disappear. A whole-lot auto '
          + 'poster turns those changes into posting work. New eligible inventory can enter the queue, current '
          + 'listings can reflect feed changes, and sold units can be removed when the feed marks them sold. That '
          + 'replaces the spreadsheet-and-memory process in which one employee must notice and handle every change.',
          'Whole-lot execution does not mean dumping every vehicle online in one uncontrolled burst. AutoLander '
          + 'uses pacing controls and works locally while the dealer’s computer is running. The queue reduces '
          + 'repeated labor; it does not promise unlimited listings, override Meta’s rules or guarantee that every '
          + 'vehicle will be eligible to publish. The [bulk-posting guide]'
          + '(/bulk-post-cars-to-facebook-marketplace/) explains that distinction in more detail.',
        ],
      },
      {
        type: 'features',
        h2: 'Posting controls for running AutoLander across your inventory',
        intro: 'These are execution controls: they organize what needs posting, how the queue advances and how live inventory stays aligned with the lot.',
        cards: [
          { title: 'Whole-lot queue', body: 'Loads inventory into one posting workflow so a rep does not rebuild the same process one VIN at a time.' },
          { title: 'Pacing controls', body: 'Controls the posting rate while AutoLander works through eligible vehicles instead of releasing an uncontrolled burst.' },
          { title: 'Local execution', body: 'Runs from your own computer through your normal Facebook session rather than operating the queue on a shared cloud server.' },
          { title: 'New-inventory intake', body: 'Uses feed changes to bring newly added vehicles into the posting workflow without maintaining a separate manual list.' },
          { title: 'Price-change refresh', body: 'Keeps posted inventory aligned when vehicle pricing changes in the connected source.' },
          { title: 'Automatic sold-removal', body: 'Takes a listing down when the connected feed marks the vehicle sold, reducing inquiries on unavailable units.' },
          { title: 'Queue-ready creative', body: 'Can prepare photos, walkaround video and VIN-specific descriptions before each vehicle is posted.' },
          { title: 'Post-to-sale attribution', body: 'Connects Marketplace posts to vehicle-sale outcomes so the dealer can evaluate the executed workload.' },
        ],
      },
      {
        type: 'steps',
        h2: 'From feed to queue to live post: the AutoLander execution loop',
        steps: [
          { title: 'Load the lot', body: 'Connect a CarGurus or Cars.com feed, or a custom export from your DMS or website, so the posting workload starts from current inventory.' },
          { title: 'Build the eligible queue', body: 'AutoLander organizes the vehicles that are ready for Marketplace and prepares the assets required for each post.' },
          { title: 'Control and execute posting', body: 'Use pacing controls while the native app works through the queue from your own computer and normal Facebook session.' },
          { title: 'Process inventory changes', body: 'Price changes stay aligned, sold units come down when the feed marks them sold, and attribution connects posts with sales.' },
        ],
      },
      {
        type: 'qa',
        q: 'Can one sales rep run the same whole-lot posting workflow?',
        a: [
          'Yes. AutoLander can support one salesperson posting an eligible set of vehicles or a dealership '
          + 'managing a larger inventory workflow. The queue scales the repeated work; Meta still controls the '
          + 'listing access and limits attached to each account. Plans start at $39/mo, with 5 free posts and no '
          + 'credit card required to try the workflow.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers choose AutoLander to execute Marketplace posting',
        items: [
          'The queue starts from connected inventory instead of a second spreadsheet or repeated manual entry.',
          'Pacing controls keep the dealer in charge of how the posting workload advances.',
          'The native desktop app keeps the Facebook session on the dealer’s own computer rather than a shared cloud server.',
          'Feed-driven price changes and sold-unit removal reduce the cleanup that follows initial posting.',
          'Published self-serve plans start at $39/mo, with 5 free posts and no credit card required.',
        ],
      },
      {
        type: 'callout',
        title: 'A posting queue does not override Meta’s limits',
        body: 'Marketplace eligibility, commercial-seller rules, vehicle-category availability and listing limits '
          + 'can vary by account and market. [Meta’s Help Center](https://www.facebook.com/help/811082570742714) '
          + 'currently documents monthly new-listing limits that include five vehicle listings and 20 listings total. Meta’s Terms also '
          + 'prohibit automated access without prior permission, and no vendor can promise approval or uninterrupted '
          + 'access. AutoLander’s local session and queue controls do not create Meta permission or endorsement. '
          + 'Check the rules shown in your account and read the [policy and safety guide]'
          + '(/guide/facebook-marketplace-automation/) before posting.',
      },
      testimonialsSection({ pick: 4 }),
    ],
    faq: [
      ['What is the best Facebook Marketplace auto poster for car dealers?',
        'Judge an auto poster on execution: how it builds and advances the posting queue, what pacing controls it provides, where the Facebook session runs, how it processes price and sold-status changes, and whether it reports outcomes. Our [2026 comparison](/compare/) shows how AutoLander and the main alternatives handle those trade-offs.'],
      ['How much does a Facebook Marketplace auto poster cost?',
        'AutoLander publishes self-serve plans from $39/mo with 5 free posts to start and no credit card required. Competing tools range from about $99/mo (Sell With Drift, AutoLister Pro) to $249/mo (CARVID), with some (Shiftly, RelayAuto) using custom quotes. See our pricing page for the full breakdown.'],
      ['Does AutoLander work as Facebook Marketplace vehicle listing software for a whole lot?',
        'AutoLander can load and manage a whole dealership inventory from a CarGurus or Cars.com feed, or a custom feed/export, and removes units when the source marks them sold. Actual posting remains subject to Marketplace availability, the account’s eligibility and Meta’s current listing limits.'],
      ['Can I bulk post my whole inventory to Facebook Marketplace at once?',
        'AutoLander can load your whole inventory into a managed workflow, but "whole-lot" does not mean an instant unlimited upload. It works through eligible vehicles with pacing controls, while Meta determines category availability and listing limits. See the [bulk-posting page](/bulk-post-cars-to-facebook-marketplace/) for the execution model.'],
      ['Is using a Facebook Marketplace auto poster against the rules?',
        'Meta’s Terms prohibit automated access without prior permission, while Marketplace eligibility, commercial-seller rules and listing limits can change. AutoLander keeps session data on your own machine and provides queue controls, but those measures do not create Meta approval or guarantee against restrictions. Read the [policy and safety guide](/guide/facebook-marketplace-automation/) and the rules shown in your account before posting.'],
    ],
    faqHeading: 'Facebook Marketplace auto-poster questions',
    cta: {
      heading: 'Put your inventory on Facebook Marketplace autopilot',
      sub: 'See plans and book a demo — automatic posting, showroom-grade photos and post-to-sale attribution, on your own inventory.',
    },
    relatedHeading: 'Explore AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
      itemList: [
        { name: 'Facebook Marketplace inventory sync & DMS feed', url: SITE.origin + NAV.inventory.path },
        { name: 'Bulk post cars to Facebook Marketplace', url: SITE.origin + NAV.bulk.path },
        { name: 'Facebook Marketplace integrations & DMS feeds', url: SITE.origin + NAV.integHub.path },
        { name: 'Safest Facebook Marketplace auto poster', url: SITE.origin + NAV.safety.path },
        { name: 'Facebook Marketplace auto poster pricing', url: SITE.origin + NAV.pricing.path },
        { name: 'Best Facebook Marketplace tools — 2026 comparison', url: SITE.origin + NAV.compareHub.path },
      ],
    },
  },
];
