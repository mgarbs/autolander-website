// BULK-POSTING page — targets the "bulk post / bulk upload a whole inventory" cluster:
// bulk post cars to facebook marketplace (primary), facebook marketplace bulk vehicle posting
// software, automatically post cars to facebook marketplace, post dealership inventory to facebook
// marketplace, facebook marketplace bulk upload tool. Deliberately does NOT target "auto lister"
// (that head term lives on the category page — no cannibalization). The throughline is HONEST bulk:
// post your whole lot SAFELY over time at a human pace, not a 200-listing burst.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const SOFTWARE_DESC =
  'AutoLander is Facebook Marketplace bulk vehicle posting software for car dealers: a native desktop '
  + 'app that loads your whole inventory from a feed and automatically posts every vehicle to Facebook '
  + 'Marketplace at a human-like pace, keeps listings fresh and removes sold units — from $39/mo.';

export const PAGES = [
  {
    key: 'bulk',
    title: 'Bulk Post Cars to Facebook Marketplace (Whole Inventory) | AutoLander',
    description:
      'Bulk post cars to Facebook Marketplace with AutoLander — load your whole dealership inventory from a '
      + 'feed and it automatically posts every vehicle at a safe, human-like pace, then removes sold units. '
      + 'Facebook Marketplace bulk vehicle posting software from $39/mo, 5 free posts, no credit card.',
    ogType: 'website',
    eyebrow: 'For car dealers & full lots',
    h1: 'Bulk post cars to Facebook Marketplace',
    bylineUpdated: true,
    tldr:
      'To bulk post cars to Facebook Marketplace, load your whole inventory from a feed and let AutoLander '
      + 'post every vehicle automatically — but at a human-like pace, not in one suspicious burst. AutoLander '
      + 'is a native desktop app that queues your entire lot, posts each car from your own computer over time, '
      + 'keeps listings fresh and removes sold units. Plans from $39/mo with 5 free posts to start.',
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
          + 'then let posting software publish each vehicle for you instead of creating every listing by hand. '
          + 'AutoLander reads your inventory — year, make, model, price, mileage, photos and a description — and '
          + 'automatically posts each car to Marketplace, then keeps the listings current as your lot changes.',
          'The important part is how it posts. AutoLander does not blast your entire inventory online in one '
          + 'burst — it queues every vehicle and posts them at a human-like pace from your own computer. That '
          + 'lets you put your whole lot on Marketplace without the manual grind of re-listing 150 VINs by hand. '
          + 'See how the underlying posting works on the '
          + '[Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) page.',
        ],
      },
      {
        type: 'steps',
        h2: 'How AutoLander bulk-posts your dealership inventory',
        intro:
          'AutoLander is a native desktop app, so it posts your whole lot through your own normal Facebook '
          + 'session rather than a shared cloud server — and it paces the work instead of dumping it all at once.',
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
            title: 'It posts at a human-like pace',
            body:
              'Rather than publishing 200 listings in one suspicious burst, AutoLander posts the queue from your '
              + 'own computer at a measured, human-like pace — a deliberate account-safety choice covered on the '
              + '[safest auto poster](/safest-facebook-marketplace-auto-poster/) page.',
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
        title: 'Bulk does not mean a 200-listing burst',
        body:
          'A lot of dealers picture "bulk posting" as uploading the whole lot to Facebook Marketplace in one '
          + 'click. AutoLander does the opposite on purpose. It posts your entire inventory, but it paces the '
          + 'work to look human — a documented account-safety best practice — because mass-posting a personal '
          + 'profile in seconds is exactly the pattern that gets accounts flagged. Think of bulk as "post your '
          + 'whole lot, safely, over time," not "spam Marketplace." The reasoning lives on our '
          + '[safest auto poster](/safest-facebook-marketplace-auto-poster/) page and the '
          + '[honest automation guide](/guide/facebook-marketplace-automation/).',
      },
      {
        type: 'qa',
        q: 'Can I post my entire dealership inventory to Facebook Marketplace?',
        a: [
          'Yes. AutoLander is built to post your entire dealership inventory to Facebook Marketplace straight '
          + 'from your feed, then keep it in sync as the lot turns. When a new VIN shows up in your feed it gets '
          + 'queued and posted automatically; when a car sells and drops out of the feed, its listing comes down '
          + 'automatically so buyers never message about a unit that is already gone.',
          'That means a full rooftop can keep its whole inventory live on Marketplace without a salesperson '
          + 're-posting VINs by hand every week. The automatic add-and-remove behavior is handled by '
          + '[inventory sync](/facebook-marketplace-inventory-sync/), and AutoLander still paces every post so a big lot '
          + 'goes up safely over time rather than all at once.',
        ],
      },
      {
        type: 'features',
        h2: 'What AutoLander’s Facebook Marketplace bulk posting software includes',
        intro: 'Everything is built around one goal: get your whole lot on Marketplace with less manual work — safely.',
        cards: [
          { title: 'Whole-inventory load', body: 'Pulls every vehicle from your CarGurus or Cars.com feed, or a custom feed/export, so you post the entire lot without entering cars one at a time.' },
          { title: 'Human-paced posting', body: 'Queues your inventory and posts it at a measured, human-like pace from your own computer — no instant mass-blast of every listing at once.' },
          { title: 'Native desktop app', body: 'Posts through your normal Facebook session on your own machine — no browser extension permissions and nothing run from a shared cloud server.' },
          { title: 'New VINs auto-post', body: 'When fresh inventory lands in your feed, AutoLander queues and posts it automatically — your lot stays fully represented on Marketplace.' },
          { title: 'Sold units auto-remove', body: 'The moment a car sells or drops from the feed, its Marketplace listing comes down automatically, so nothing stale stays up.' },
          { title: 'Per-vehicle enhancement', body: 'Each queued listing gets a clean photo, accurate title and price, and a VIN-specific description before it posts — at scale, automatically.' },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Why dealers bulk-post with AutoLander',
        items: [
          'You post your whole lot, not a handful of cars — the feed loads every vehicle so nothing gets left off Marketplace.',
          'It is paced, not a burst: AutoLander posts at a human-like rate from your own computer, which is the safer pattern for a personal profile.',
          'It stays accurate on its own — new VINs auto-post and sold units auto-remove via inventory sync, so a 150-car lot keeps matching reality.',
          'It is a native desktop app: your Facebook session stays on your machine and IP, not stored or operated from a shared cloud server.',
          'It is honestly priced — published self-serve plans from $39/mo with 5 free posts to start, no enterprise quote or contract.',
        ],
      },
      {
        type: 'callout',
        title: 'The most compliant route is Meta’s dealer catalog',
        body:
          'Be clear-eyed: Facebook Marketplace was built for individuals, and the route Meta sanctions for '
          + 'dealers is its official vehicle inventory/catalog listings. Bulk-posting a personal Facebook profile '
          + 'with any tool is common but a gray area, and Meta’s policies can change. AutoLander paces posting and '
          + 'keeps your session on your own machine to lower technical flag triggers, but no honest vendor can '
          + 'promise you will never be flagged. Read the '
          + '[honest automation guide](/guide/facebook-marketplace-automation/) before you start, and '
          + '[compare your options](/compare/) at the comparison hub.',
      },
    ],
    faq: [
      ['How many cars can I bulk post to Facebook Marketplace?',
        'There is no hard cap built into AutoLander — it can post your whole lot, whether that is 30 cars or 300, straight from your feed. The practical limit is your own Facebook account’s posting behavior, which is exactly why AutoLander paces posting at a human-like rate instead of dumping everything at once. A big lot simply goes up safely over time rather than all in one burst.'],
      ['Is bulk posting to Facebook Marketplace against Facebook’s rules — will it get me banned?',
        'Honestly: it is a gray area, and no tool can guarantee you won’t be flagged. Marketplace was built for individuals, and Meta’s sanctioned route for dealers is its official vehicle inventory/catalog. Automating a personal profile — by any tool — is common but not officially blessed, and Meta’s policies can change. AutoLander reduces the obvious technical triggers by pacing posts at a human-like rate and keeping your session on your own machine, but treat that as risk reduction, not a guarantee. See our [safest auto poster](/safest-facebook-marketplace-auto-poster/) page and [honest automation guide](/guide/facebook-marketplace-automation/) before you start.'],
      ['Does AutoLander post the cars automatically, or do I still click each one?',
        'Automatically. Once your feed is connected, AutoLander queues your inventory and posts each vehicle for you from your own computer — you are not manually creating 150 listings. It also re-posts new VINs and removes sold units on its own as your feed changes.'],
      ['Can it bulk-upload my inventory from my DMS feed or export?',
        'Yes. AutoLander loads your whole inventory from a CarGurus or Cars.com feed, or a custom feed/export from your DMS or website (for example vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK or Tekion). It is a native desktop app, so there is no spreadsheet to maintain — your real inventory becomes your Marketplace listings.'],
      ['How fast does AutoLander post my whole inventory?',
        'Deliberately not instantly. AutoLander paces posting at a human-like rate rather than blasting your entire lot online in seconds, because a sudden mass-post is a classic flag trigger for a personal profile. Your whole inventory goes up over time, and from then on new cars post and sold cars come down automatically as your feed updates.'],
      ['Is AutoLander a true Facebook Marketplace bulk upload tool, or just a queue?',
        'Both, by design. It loads your entire inventory in bulk from a feed (so you are not entering cars one by one), then it works through that queue at a human-like pace instead of uploading everything at once. The result is full coverage of your lot with safer, paced posting — not a one-click mass upload.'],
    ],
    cta: {
      heading: 'Bulk-post your whole lot to Facebook Marketplace',
      sub: 'See plans and book a demo — post every vehicle automatically, at a safe human pace.',
    },
    relatedHeading: 'Keep exploring AutoLander’s Facebook Marketplace tools',
    schema: {
      software: SOFTWARE_DESC,
    },
  },
];
