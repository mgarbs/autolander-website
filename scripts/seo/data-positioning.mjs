// POSITIONING pages (2026-09-03). Two deliberate scope choices — Marketplace-only, and no buyer
// auto-reply — read as feature-matrix absences on competitor listicles because the site never
// stated them as principles. These pages do. Each is an argument, not a feature page: it names the
// trade-off, says who it is wrong for, and descends to the money page it defends.
//
// HARD RULES (Michael, 2026-08-20/22): AutoLander has NO autoresponder and does NOT read, route,
// forward or surface Marketplace messages. Nothing here may imply otherwise.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const UPDATED = '2026-09-03';

export const PAGES = [
  // ---------------------------------------------------------------- /why-facebook-marketplace-only/
  {
    key: 'whyMarketplaceOnly',
    title: 'Why AutoLander Posts to Facebook Marketplace Only | AutoLander',
    description:
      'AutoLander posts to Facebook Marketplace and nowhere else — on purpose. The trade-off, who it '
      + 'is wrong for, and why one channel done right beats five done shallow.',
    eyebrow: 'A scope decision, stated plainly',
    h1: 'Why AutoLander posts to Facebook Marketplace only',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['Facebook Marketplace', 'multi-platform posting', 'product scope'] },
    tldr:
      'AutoLander does not post to Craigslist, OfferUp, eBay Motors or any channel other than Facebook '
      + 'Marketplace. That is a decision, not a gap. Marketplace is the one free channel where a '
      + 'dealer’s local buyers already are, where the listing format is vehicle-native, and where '
      + 'keeping a whole lot accurate — prices, sold units, photos — is a daily job worth doing '
      + 'perfectly. Doing that one job well is harder than doing five channels shallowly, and the '
      + 'dealers who get the most from Marketplace are the ones whose listings are never stale.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'Facebook Marketplace for car dealers', url: SITE.origin + NAV.dealers.path },
      { name: 'Why Marketplace only', url: SITE.origin + NAV.whyMarketplaceOnly.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'Does AutoLander post to Craigslist, OfferUp or eBay Motors?',
        a: [
          'No. AutoLander posts dealer inventory to Facebook Marketplace and only to Facebook Marketplace. '
          + 'If a comparison table lists "multi-platform posting" and shows a dash in the AutoLander column, '
          + 'the dash is accurate. This page explains why it is there.',
          'Several tools in this category advertise syndication to five or more channels. Some do it well. '
          + 'We looked at building it, priced what it would cost in engineering and — more importantly — in '
          + 'listing quality, and decided the product is better for a dealer if it does one channel completely '
          + 'than several partially.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What "one channel, done completely" actually means',
        intro:
          'A Marketplace listing is not a one-time post. It is a record that has to stay true for as long as '
          + 'the car is on the lot, and disappear the day it is not. Every one of these is a job AutoLander does '
          + 'for the whole inventory, every day:',
        items: [
          'Posts eligible vehicles into the correct Marketplace category — a car as a car, a travel trailer as an '
          + 'RV/Camper — with year, make, model, mileage, price and description filled from the feed. See the '
          + '[auto poster page](/facebook-marketplace-auto-poster/) for how the queue works.',
          'Pushes every price change from the feed to the live listing, so a Tuesday markdown is on Marketplace '
          + 'Tuesday, not whenever someone remembers.',
          'Pulls sold units down automatically as the [inventory feed](/facebook-marketplace-inventory-sync/) '
          + 'marks them sold, so buyers stop messaging about cars that are gone.',
          'Re-queues new arrivals without anyone opening Marketplace, and works the whole lot inside the '
          + 'account’s listing limits rather than around them — the [safety page](/safest-facebook-marketplace-auto-poster/) '
          + 'covers what those limits are.',
          'Runs [AI photo editing](/ai-car-photo-editor/) built around Marketplace’s thumbnail sizes and feed '
          + 'layout, because the first photo is what gets the tap.',
        ],
      },
      {
        type: 'qa',
        q: 'Why not just add the other channels too?',
        a: [
          'Because every additional channel has its own listing format, its own category rules, its own '
          + 'limits and its own way of going stale — and each one halves the attention the product can give the '
          + 'channel that actually produces a dealer’s conversations. Craigslist vehicle posts are paid in most '
          + 'metros and expire on a schedule. OfferUp is phone-first with a different photo pipeline. eBay Motors '
          + 'is a national auction-and-fixed-price format with fees and a listing lifecycle that has nothing in '
          + 'common with a local Marketplace post.',
          'A tool that syndicates to all of them tends to publish the same flat listing everywhere and refresh '
          + 'it rarely. That is fine for a one-off private sale. For a dealer with sixty to three hundred units '
          + 'that turn every month, a listing that was true on posting day and wrong by Friday is a liability on '
          + 'every channel it was pushed to. We would rather be the tool that keeps one channel perfectly current '
          + 'than the tool that keeps five approximately current.',
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'AutoLander is the right fit if',
          items: [
            'Facebook Marketplace is where your local buyers message you, and you want the whole lot on it, kept accurate.',
            'Stale listings — old prices, sold cars still up — are a real cost to your team’s time and reputation.',
            'You want published pricing from $39/mo rather than a syndication platform priced for a dealer group.',
            'You post from your own logged-in session on your own machine and want to keep it that way.',
          ],
        },
        right: {
          h2: 'AutoLander is the wrong fit if',
          items: [
            'You need one tool to push inventory to Craigslist, OfferUp, eBay Motors and Marketplace from a single screen — some tools on our [comparison page](/compare/) do that.',
            'Your Marketplace listings are a minor channel and you would rather not maintain them at all.',
            'You are outside the United States; AutoLander serves U.S. dealers and sales reps.',
            'You want software to answer buyers for you — we do not do that either, and [here is why](/why-we-dont-answer-your-buyers/).',
          ],
        },
      },
      {
        type: 'callout',
        title: 'The honest version',
        body:
          'Scope is a promise about where the effort goes. Ours goes into the Marketplace listing being right '
          + 'every day it is live. If a dealer needs breadth over depth, we will say so on a demo call and '
          + 'point at a tool that has it. That has cost us some sales and kept the product sharp.',
      },
    ],
    faq: [
      ['Does AutoLander support multi-platform posting?',
        'No. AutoLander posts to Facebook Marketplace only. It does not syndicate to Craigslist, OfferUp, eBay Motors, '
        + 'Autotrader or any other channel, and there is no plan to add them. The product is built to keep one '
        + 'channel completely current for a whole dealer lot.'],
      ['Is Facebook Marketplace enough on its own for a dealership?',
        'For local, free, buyer-initiated conversations it is the strongest single channel most dealers have, and '
        + 'the one most often under-maintained. It is not a replacement for paid portals or the dealer website. '
        + 'AutoLander is the Marketplace layer; it runs alongside whatever else you use.'],
      ['Why does keeping listings current matter so much?',
        'A Marketplace listing with the wrong price or a sold car still live costs the team a reply and the buyer '
        + 'their trust. Across a lot that turns monthly, that happens constantly unless something is watching the '
        + 'feed every day. That daily upkeep, not the first post, is where AutoLander spends its effort.'],
      ['Can I use AutoLander alongside a multi-channel syndication tool?',
        'Yes. Many dealers run a syndication or DMS-driven distribution product for other portals and use AutoLander '
        + 'specifically for Facebook Marketplace, because the two jobs are different. Nothing in AutoLander conflicts '
        + 'with another tool posting elsewhere.'],
    ],
    cta: {
      heading: 'See one channel, done completely',
      sub: 'Book a demo and we will post real cars from your feed on the call. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },

  // ---------------------------------------------------------------- /why-we-dont-answer-your-buyers/
  {
    key: 'whyNoAutoReply',
    title: 'Why AutoLander Doesn’t Answer Your Buyers | AutoLander',
    description:
      'AutoLander has no autoresponder and never touches your Marketplace inbox. The reasoning, the risk we '
      + 'refuse to sell you, and what we do instead.',
    eyebrow: 'A scope decision, stated plainly',
    h1: 'Why AutoLander does not answer your buyers for you',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['Marketplace inbox', 'AI auto-reply', 'product scope'] },
    tldr:
      'AutoLander does not reply to buyers, does not read your Marketplace messages, and does not route, '
      + 'forward or summarize them. Your team answers every conversation in Messenger, exactly as it does '
      + 'now. We made that choice because an automated reply that quotes a wrong price, misses a trade-in, '
      + 'or keeps chatting when a buyer needs a person does more damage than the after-hours coverage is '
      + 'worth — and because the thing that actually makes a fast reply useful is the listing being right. '
      + 'That part we do.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'AI chat for car dealers', url: SITE.origin + NAV.aiChat.path },
      { name: 'Why we don’t answer your buyers', url: SITE.origin + NAV.whyNoAutoReply.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'Does AutoLander reply to Facebook Marketplace messages?',
        a: [
          'No. AutoLander has no autoresponder, no AI chat, and no inbox feature of any kind. It does not read '
          + 'incoming messages, does not send replies, does not forward or route conversations to a CRM, and does '
          + 'not surface them in its own interface. When a buyer messages you about a listing, that message '
          + 'arrives in Messenger and a person on your team answers it — the same as it works today.',
          'If a feature comparison shows "AI auto-reply" with a dash next to AutoLander, that is correct. Several '
          + 'competitors on our [comparison page](/compare/) do offer it. This page is about why we do not.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What an automated reply gets wrong, and what it costs',
        intro:
          'The pitch for inbox automation is coverage: buyers message at 9pm and on Sunday, and the store that '
          + 'answers first often gets the appointment. That is true. Here is the part the pitch leaves out:',
        items: [
          'It answers "is it available?" from whatever data it has — and if the feed marked the unit sold an hour '
          + 'ago, it just confirmed a car that is gone. The buyer drives in. That is a lost customer and a review.',
          'It quotes a price. If the number came from a listing that was not updated when the lot repriced, the '
          + 'store now has to honor it or explain it. Neither is a good first impression.',
          'It keeps chatting. A buyer who is angry, confused, or asking about financing, a trade-in or a title '
          + 'issue needs a person within one message. Most bots need three.',
          'It speaks in the store’s name with no one watching. Every reply is a promise the dealership made, '
          + 'whether or not anyone at the dealership saw it.',
          'It runs on the same personal account the listings run on. If Meta decides the reply pattern looks '
          + 'automated, the restriction does not stop at the inbox — it can reach the listings and any ad assets '
          + 'the profile administers. See the [account safety page](/safest-facebook-marketplace-auto-poster/).',
        ],
      },
      {
        type: 'qa',
        q: 'What does AutoLander do instead?',
        a: [
          'It makes the human reply fast and right by making the listing right. Every question a buyer asks in '
          + 'the first message — is it available, what is the price, what is the mileage, can I see more photos '
          + '— is a question about the listing. AutoLander keeps the answer to each one true: the [inventory feed]'
          + '(/facebook-marketplace-inventory-sync/) drives the price, sold units come down the day they sell, '
          + 'mileage is the odometer or blank rather than a guess, and the photos are the [studio-processed]'
          + '(/ai-car-photo-editor/) shots rather than the lot snapshot.',
          'When the listing is right, the reply is short. "Yes, it is here — come by any time before six." That '
          + 'is a message a salesperson sends in eight seconds from a phone, and it converts better than any '
          + 'paragraph a bot writes, because the buyer can tell there is a person on the other end.',
        ],
      },
      {
        type: 'steps',
        h2: 'If you do want inbox AI, how to buy it without getting hurt',
        intro:
          'We are not against the category. Some dealers run it well. If you evaluate one, these are the questions '
          + 'that separate a useful product from a liability — we keep the full list on the [AI chat for car '
          + 'dealers](/ai-chat-for-car-dealers/) guide.',
        steps: [
          { title: 'Ask where the availability answer comes from',
            body: 'If it is not reading your live inventory feed — the same one your website reads — it will eventually confirm a sold car. Ask for the sync interval in minutes.' },
          { title: 'Ask what it does with a price question',
            body: 'The safe answer is "it never quotes a price the listing does not show, and it never negotiates." Anything else is a promise your F&I office did not make.' },
          { title: 'Ask how fast a human gets the conversation',
            body: 'One message of frustration, confusion, or any finance, trade or title question should hand off immediately. Ask to see the handoff, not the slide about it.' },
          { title: 'Ask which account it runs on and what Meta permission it uses',
            body: 'If it operates through the same personal profile that holds your listings, a restriction hits everything at once. Ask the vendor to name the exact Meta product and permission.' },
        ],
      },
      {
        type: 'callout',
        title: 'The honest version',
        body:
          'AutoLander’s job ends when the listing is live and correct. The conversation is yours. We think that '
          + 'is the right line for a dealership’s reputation, and we would rather lose a deal to a vendor who '
          + 'promises a bot than sell you one that quotes the wrong price on a car you already sold.',
      },
    ],
    faq: [
      ['Does AutoLander have an AI autoresponder for Facebook Marketplace?',
        'No. AutoLander does not reply to buyers, does not read or route Marketplace messages, and has no inbox '
        + 'feature. Your team answers every conversation in Messenger. This is a deliberate product decision, '
        + 'not a feature that is coming later.'],
      ['Why not offer auto-reply as an option dealers can switch on?',
        'Because the failure modes — confirming a sold car, quoting a stale price, chatting past an angry buyer — '
        + 'land on the dealership’s reputation and the dealership’s Facebook account, not on ours. We are not '
        + 'willing to sell that risk as a convenience.'],
      ['How does AutoLander help my team respond faster, then?',
        'By making the listing the buyer is asking about correct: current price from the feed, sold units removed '
        + 'automatically, real mileage or none, and clean photos. When the facts are right, the human reply is one '
        + 'sentence, and one sentence from a real salesperson beats a paragraph from a bot.'],
      ['Will AutoLander ever route messages to my CRM?',
        'No. AutoLander does not touch the inbox in any direction — it does not read, forward, summarize or route '
        + 'messages. Lead delivery to a CRM is a job for a tool that is designed and permitted to handle '
        + 'conversations; AutoLander is designed to handle listings.'],
      ['What if I want inbox AI anyway?',
        'Buy it from a vendor who reads your live feed, never quotes a price the listing does not show, hands off '
        + 'to a person within one message, and can name the Meta permission it runs under. AutoLander will keep the '
        + 'listings accurate alongside it; the two do not conflict.'],
    ],
    cta: {
      heading: 'See what a correct listing does for reply speed',
      sub: 'Book a demo and we will post real cars from your feed on the call. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },
];
