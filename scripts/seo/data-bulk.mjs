// BULK-POSTING page — targets the "bulk post / bulk upload a whole inventory" cluster:
// bulk post cars to facebook marketplace (primary), facebook marketplace bulk vehicle posting
// software, automatically post cars to facebook marketplace, post dealership inventory to facebook
// marketplace, facebook marketplace bulk upload tool. Deliberately does NOT target "auto lister"
// (that head term lives on the category page — no cannibalization). The throughline is HONEST bulk:
// load a complete feed, then manage an account-eligible queue within Meta's current rules and limits.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const SOFTWARE_DESC =
  'AutoLander is Facebook Marketplace bulk vehicle posting software for car dealers: a native desktop '
  + 'app that loads your inventory from a feed, manages a configurable vehicle queue and removes sold '
  + 'units. Meta account eligibility and listing limits still apply — plans start at $39/mo.';

export const PAGES = [
  {
    key: 'bulk',
    title: 'Bulk Post Cars to Facebook Marketplace | AutoLander',
    description:
      'Load car inventory into a Facebook Marketplace posting queue and auto-remove sold units. Meta '
      + 'eligibility and listing limits apply. Plans from $39/mo.',
    ogType: 'website',
    eyebrow: 'For car dealers & full lots',
    h1: 'Bulk post cars to Facebook Marketplace',
    bylineUpdated: true,
    tldr:
      'To bulk post cars to Facebook Marketplace, load your whole inventory from a feed and let AutoLander '
      + 'build a configurable queue of eligible vehicles. AutoLander runs on your own computer, keeps feed data '
      + 'current and removes sold units. Meta’s Help Center currently says sellers may create up to 5 new Vehicles '
      + 'listings per calendar month and 20 new listings total per calendar month; the limits shown in your '
      + 'account control, and AutoLander cannot override them. Plans start at $39/mo.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Bulk posting', url: SITE.origin + NAV.bulk.path },
    ],
    sections: [
      {
        type: 'figure',
        before: '/studio/toyota-tacoma-before.webp',
        after: '/studio/toyota-tacoma-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2025 Toyota Tacoma before AutoLander',
        afterAlt: 'The same 2025 Toyota Tacoma as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'Posted at scale, still polished — a raw 2025 Toyota Tacoma lot photo (left) becomes a showroom-grade Marketplace listing (right), automatically.',
      },
      {
        type: 'qa',
        q: 'How do you bulk post cars to Facebook Marketplace?',
        a: [
          'To bulk post cars to Facebook Marketplace, you load your whole dealership inventory from a feed once, '
          + 'then use posting software to prepare and manage eligible vehicles instead of entering each one by hand. '
          + 'AutoLander reads your inventory — year, make, model, price, mileage, photos and a description — and '
          + 'builds a configurable posting queue, then keeps the source data current as your lot changes.',
          'Bulk feed loading is not permission to publish every VIN. Meta currently documents monthly limits of '
          + '5 new Vehicles listings and 20 new listings total, and eligibility or features can vary by account '
          + 'and market. AutoLander cannot bypass those limits or guarantee approval. See the '
          + '[Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) page for the workflow and the '
          + '[dealer posting guide](/guide/how-to-sell-cars-on-facebook-marketplace/) for current-limit checks.',
        ],
      },
      {
        type: 'steps',
        h2: 'How AutoLander bulk-posts your dealership inventory',
        intro:
          'AutoLander is a native desktop app, so it processes your selected vehicle queue through your normal Facebook '
          + 'session rather than operating the session from AutoLander’s cloud. Dealers control the vehicle queue.',
        steps: [
          {
            title: 'Connect your inventory feed',
            body:
              'Point AutoLander at your CarGurus or Cars.com feed, or a custom feed/export from your DMS or '
              + 'website. Your entire inventory loads automatically — no spreadsheets, no copy-paste. '
              + 'See the supported sources on the [integrations](/integrations/) page.',
          },
          {
            title: 'It queues every vehicle',
            body:
              'AutoLander builds a posting queue from your whole lot, enhancing each listing with clean photos, '
              + 'an accurate title, the right price and a VIN-specific description before it goes up.',
          },
          {
            title: 'Choose eligible vehicles for the queue',
            body:
              'Select which feed vehicles should enter the configurable posting queue, then review the queue '
              + 'against the eligibility and listing limits shown in your Marketplace account. Queue capacity '
              + 'does not override Meta’s publication limits.',
          },
          {
            title: 'It keeps the lot fresh and removes sold cars',
            body:
              'As your feed changes, listings refresh, newly added VINs get queued and posted, and sold units come '
              + 'down automatically — so Marketplace keeps matching your real inventory without you touching it. '
              + 'More on this on the [inventory sync](/facebook-marketplace-inventory-sync/) page.',
          },
        ],
      },
      {
        type: 'callout',
        title: 'Bulk feed loading is not unlimited Marketplace publishing',
        body:
          '“Bulk” means AutoLander can import and organize a full dealership feed; it does not mean Facebook '
          + 'will allow every vehicle to be published. Meta’s Help Center currently states a limit of 5 new '
          + 'Vehicles listings per calendar month and 20 new listings total per calendar month. Limits, features '
          + 'and eligibility can change, so always follow what your account displays. AutoLander cannot bypass '
          + 'those controls. Review the '
          + '[current dealer guide](/guide/how-to-sell-cars-on-facebook-marketplace/) before building your queue.',
      },
      {
        type: 'qa',
        q: 'Can I post my entire dealership inventory to Facebook Marketplace?',
        a: [
          'You can load an entire dealership feed into AutoLander, but the number of vehicles you may publish to '
          + 'Marketplace is controlled by Meta and your account. Meta’s Help Center currently lists 5 new Vehicles '
          + 'listings per calendar month and 20 new listings total per calendar month. AutoLander cannot increase '
          + 'those limits or restore eligibility.',
          'Within the limits available to your account, AutoLander can keep the source feed organized, queue '
          + 'eligible vehicles, detect new VINs and remove sold units. The feed-to-queue behavior is explained on '
          + 'the [inventory sync](/facebook-marketplace-inventory-sync/) page.',
        ],
      },
      {
        type: 'features',
        h2: 'What AutoLander’s Facebook Marketplace bulk posting software includes',
        intro: 'Load and manage a complete inventory feed while respecting the eligibility and limits Meta applies.',
        cards: [
          { title: 'Whole-inventory load', body: 'Pulls every vehicle from your CarGurus or Cars.com feed, or a custom feed/export, so you can choose eligible vehicles without entering them one at a time.' },
          { title: 'Configurable posting queue', body: 'Lets you organize and review feed vehicles in a queue on your own computer. Meta eligibility and account listing limits still control publication.' },
          { title: 'Native desktop app', body: 'Posts through your normal Facebook session on your own machine — no browser extension permissions and nothing run from a shared cloud server.' },
          { title: 'New VIN detection', body: 'When fresh inventory lands in your feed, AutoLander can add it to the queue for review against the current eligibility and listing limits.' },
          { title: 'Sold-unit reconciliation', body: 'When a car is marked sold or drops from the feed, AutoLander removes the matching Marketplace listing during reconciliation, reducing stale-listing inquiries.' },
          { title: 'Per-vehicle enhancement', body: 'Each queued listing gets a clean photo, accurate title and price, and a VIN-specific description before it posts — at scale, automatically.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers bulk-post with AutoLander',
        items: [
          'The feed can load your whole lot so your team can choose eligible vehicles without re-entering inventory details.',
          'A configurable queue gives the dealer visibility into which vehicles are prepared for posting and which should wait.',
          'It stays current — new VINs can enter the queue and sold units auto-remove via inventory sync.',
          'It is a native desktop app: your Facebook session stays on your machine and IP, not stored or operated from a shared cloud server.',
          'It is honestly priced — published self-serve plans from $39/mo with 5 free posts to start, no enterprise quote or contract.',
        ],
      },
      {
        type: 'callout',
        title: 'Meta’s terms and account limits control',
        body:
          'Meta’s Terms prohibit unauthorized automated access. Account eligibility, Marketplace features and '
          + 'listing limits can vary or change, and a desktop architecture does not create permission. AutoLander '
          + 'cannot override Meta limits or guarantee account safety or listing approval. Read the '
          + '[current dealer posting guide](/guide/how-to-sell-cars-on-facebook-marketplace/) before you start, and '
          + '[compare your options](/compare/) at the comparison hub.',
      },
    ],
    faq: [
      ['How many cars can I bulk post to Facebook Marketplace?',
        'AutoLander can load a full inventory feed, but Meta controls how many listings may be published. Meta’s Help Center currently says sellers may create up to 5 new Vehicles listings per calendar month and 20 new listings total per calendar month. The limits shown in your account control and can change; AutoLander cannot override them.'],
      ['Is bulk posting to Facebook Marketplace against Facebook’s rules — will it get me banned?',
        'Meta’s Terms prohibit automated access without prior permission, and no tool can guarantee that an account will remain eligible or that listings will be approved. AutoLander’s local desktop architecture and queue controls do not override Meta’s rules or account limits. See the [account-safety page](/safest-facebook-marketplace-auto-poster/) and [current dealer posting guide](/guide/how-to-sell-cars-on-facebook-marketplace/) before you start.'],
      ['Does AutoLander post the cars automatically, or do I still click each one?',
        'AutoLander processes the selected vehicle queue from your own computer, so you do not have to re-enter every listing by hand. Actual publication remains subject to the eligibility and listing limits displayed by Meta. New VINs can enter the queue and sold units can be removed as the feed changes.'],
      ['Can it bulk-upload my inventory from my DMS feed or export?',
        'Yes. AutoLander loads your whole inventory from a CarGurus or Cars.com feed, or a custom feed/export from your DMS or website (for example vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK or Tekion). It is a native desktop app, so there is no spreadsheet to maintain — your real inventory becomes your Marketplace listings.'],
      ['How fast does AutoLander post my whole inventory?',
        'AutoLander uses a configurable queue rather than promising that an entire feed will publish. Actual posting depends on your settings, computer availability, Marketplace eligibility and the current limits shown by Meta. Sold units can be removed as the connected feed updates.'],
      ['Is AutoLander a true Facebook Marketplace bulk upload tool, or just a queue?',
        'It combines bulk feed import with a configurable vehicle queue. The feed can contain your complete inventory, while actual Marketplace publication remains subject to Meta’s current eligibility and account-specific listing limits. It is not a promise of unlimited one-click publishing.'],
    ],
    cta: {
      heading: 'Bulk-manage your inventory for Facebook Marketplace',
      sub: 'See plans and book a demo — load your feed, manage the queue and keep sold units current.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
    },
  },
];
