// Dealer-growth silo — MONEY pages (2026-08-20): AI chat (HONEST GUIDE — see below), AI car photo
// editor, RV dealer software. Commercial intent → homepage funnel. Product claims stay honest:
// >>> AutoLander has NO AI autoresponder (Michael, 2026-08-20) AND NO message handling at all
// >>> (Michael, 2026-08-22). NEVER claim AI replies to buyers, books appointments in chat,
// >>> "answers 24/7", or ROUTES / forwards / surfaces buyer messages. AutoLander does not touch
// >>> the Marketplace inbox. Truthful framing: listings stay accurate via sync, sold units come
// >>> down, coverage is complete — the dealer's own team reads and answers every message.
// The photo studio composites (never repaints) the vehicle; RV positioning is the Marketplace
// sales layer, not a DMS. No fabricated stats, prices from SITE.
// Follows the page-object contract in scripts/seo/shell.mjs. Static, NO pixel.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const aiToolsCrumb = { name: 'Facebook AI tools', url: SITE.origin + NAV.aiTools.path };

export const PAGES = [

  // ------------------------------------------- HONEST GUIDE: /ai-chat-for-car-dealers/
  // Target queries ("ai chat for car dealers", "ai chatbot for car dealerships") are served with
  // an evaluative category guide. AutoLander is positioned by what it actually does (accurate
  // synced listings + sold-unit removal + whole-lot coverage) — never as an auto-responder.
  // >>> AND never as a message router: AutoLander does NOT read, forward, surface or route
  // >>> Marketplace messages (Michael, 2026-08-22). The inbox is 100% the dealer's own.
  {
    key: 'aiChat',
    title: 'AI Chat for Car Dealers: The Honest Guide | AutoLander',
    description:
      'AI chat for car dealers, honestly: what inbox AI can and cannot do, the traps to avoid, and how '
      + 'AutoLander helps your team answer buyers faster.',
    eyebrow: 'Marketplace inbox & response speed',
    h1: 'AI chat for car dealers: the honest guide',
    bylineUpdated: true,
    tldr:
      'AI chat for car dealers is software that converses with buyers on a dealership’s behalf, most '
      + 'visibly on Facebook Marketplace. Done badly it invents prices and burns trust; done well it '
      + 'demands live inventory data and instant human handoff. AutoLander does neither: it sends no '
      + 'automated replies and does not handle your messages at all. It keeps every listing’s data '
      + 'accurate so the human who answers has the right facts.',
    breadcrumbs: [
      { name: 'Home', url: home },
      aiToolsCrumb,
      { name: 'AI chat for car dealers', url: SITE.origin + NAV.aiChat.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What is AI chat for car dealers?',
        a: [
          'It is software that holds conversations with car shoppers for a dealership — answering '
          + '"is it available?", quoting specs, asking qualifying questions — usually on Facebook '
          + 'Marketplace, a website widget, or SMS. The pitch is coverage: buyers message at 9pm and on '
          + 'Sunday, and the store that responds first usually gets the appointment.',
          'The category is real, but the execution bar is high. A chatbot that improvises a price, '
          + 'misses a trade-in question, or keeps "chatting" when an angry customer needs a human can '
          + 'cost more than the after-hours coverage is worth. Whatever tool you evaluate, the questions '
          + 'below separate the useful ones from the liability.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What to demand from any AI chat vendor',
        items: [
          'Live inventory truth: answers must come from your actual unit data — price, mileage, features — never a script that can invent numbers.',
          'Instant human handoff: negotiations, trade-ins and upset buyers must reach a person immediately, with the thread’s full context.',
          'Your own accounts: conversations should run through the dealership’s own channels, not a shared cloud account you cannot see or control.',
          'Notification you actually feel: if a hot lead is waiting, it should hit your team’s phones, not a dashboard nobody opens.',
          'A paper trail: every AI-touched conversation logged and reviewable, so you can audit what was said in your store’s name.',
          'Honest limits: no vendor can exempt you from Meta’s terms or make automated access "approved" — see the [policy and safety guide](/guide/facebook-marketplace-automation/).',
        ],
      },
      {
        type: 'table',
        h2: 'AI replies vs. fast human replies',
        intro: 'The goal is a fast, accurate first answer. There are two ways to get one.',
        head: ['What matters', 'AI auto-replies', 'Fast human replies (AutoLander’s approach)'],
        alCol: 2,
        rows: [
          ['Accuracy on price & specs', 'Only as good as its data feed — improvisation is the failure mode', 'Human answers, with the listing’s synced data in front of them'],
          ['Trust when the buyer shows up', 'Buyers dislike learning they negotiated with a bot', 'The person they messaged is the person they meet'],
          ['Negotiation & trade-ins', 'Needs immediate escalation to be safe', 'Already with the right person from message one'],
          ['After-hours coverage', 'Covers the clock — if guardrails hold', 'Whoever is on call answers from Messenger — against a listing still accurate at 11pm'],
          ['Accountability', 'Depends on vendor logging', 'Your team, your words, your inbox'],
        ],
        note: 'AutoLander does not send automated replies. It makes the human answer fast and accurate instead.',
      },
      {
        type: 'callout',
        title: 'Where AutoLander stands',
        body: 'AutoLander is not an autoresponder, does not reply to buyers for you, and does not touch your '
          + 'Marketplace inbox at all. What it does: keeps every listing’s price, mileage, photos and '
          + 'availability accurate through [inventory sync](/facebook-marketplace-inventory-sync/), and removes '
          + 'sold units before dead-end conversations start — so when your team answers, the facts are already '
          + 'right. The [Facebook Marketplace assistant](/facebook-marketplace-assistant/) covers that upkeep.',
      },
      {
        type: 'features',
        h2: 'How AutoLander makes your team the fastest answer in town',
        cards: [
          { title: 'Synced listing truth', body: 'Price and details stay current automatically, so whoever answers has the right numbers — no tab-hopping, no guessing. See [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'Your inbox stays yours', body: 'AutoLander never reads, answers or forwards a Marketplace message. Your team works Messenger exactly as they do now — no bot in the middle, nothing sitting behind a vendor.' },
          { title: 'No ghost conversations', body: 'Sold units come off Marketplace automatically, so buyers never message about a car that left Tuesday.' },
          { title: 'Whole-lot coverage', body: 'More listings, more conversations: the [auto poster](/facebook-marketplace-auto-poster/) keeps the full inventory live within your account’s limits.' },
          { title: 'Photos that start the chat', body: 'Showroom-grade images from the [AI car photo editor](/ai-car-photo-editor/) earn more clicks, which is where every conversation begins.' },
          { title: 'Proof of what sold', body: 'Post-to-sale attribution shows which listings became deliveries, so you double down where conversations convert.' },
        ],
      },
      {
        type: 'qa',
        q: 'How fast should the first reply be?',
        a: [
          'Under a minute during working hours, and as fast as your process allows outside them. '
          + 'Marketplace shoppers message several stores in one sitting and book with the one that '
          + 'answers first — response speed is the cheapest ratio-mover in the store. The full playbook '
          + 'is in [how to get more car sales leads](/guide/car-sales-leads/).',
        ],
      },
    ],
    faq: [
      ['Does AutoLander automatically reply to Facebook Marketplace messages?',
        'No — and it does not handle your messages at all. AutoLander has no autoresponder and no inbox feature. It keeps every listing’s data accurate and removes sold units, so when your team answers in Messenger they answer quickly and with the right information.'],
      ['What is the best AI chatbot for car dealerships?',
        'Judge any candidate on three questions: does it answer from your live inventory data (not a script), does it hand off to a human the moment a conversation needs judgment, and does it run through your own accounts? Many tools fail at least one. The broader landscape is covered in [AI for car dealerships](/guide/ai-for-car-dealerships/).'],
      ['Do AI chatbots make up prices?',
        'Poorly built ones do — improvised numbers are the category’s classic failure. Any conversational AI you allow near buyers must be constrained to your actual inventory data and escalate negotiations to people.'],
      ['How do dealers cover the Marketplace inbox at night and on weekends?',
        'With process: Messenger notifications on a phone, a named owner per shift, and listings whose data is accurate enough that anyone can answer confidently. AutoLander’s part is that last piece — accurate listings and sold units already removed; see [how to get more car sales leads](/guide/car-sales-leads/) for the speed-to-lead playbook.'],
    ],
    cta: {
      heading: 'Make your team the fastest answer in town',
      sub: 'Accurate listings, no ghost conversations, no bot in your inbox — AutoLander does the upkeep, your people do the talking.',
    },
  },

  // ---------------------------------------------------------------- MONEY: /ai-car-photo-editor/
  {
    key: 'photoEditor',
    title: 'AI Car Photo Editor for Dealers: Showroom Shots | AutoLander',
    description:
      'AI car photo editor for dealers: turn lot and feed photos into showroom-grade listing images — real '
      + 'cars, never repainted. From $39/mo.',
    eyebrow: 'AutoLander AI Photo Studio',
    h1: 'AI car photo editor: showroom photos from the shots you already have',
    bylineUpdated: true,
    tldr:
      'An AI car photo editor takes the vehicle photos a dealership already has — phone shots on a crowded '
      + 'lot, watermarked feed images — and replaces the background with a clean showroom, outdoor scene, or '
      + 'the dealer’s own storefront. AutoLander’s AI Photo Studio composites rather than repaints: the '
      + 'car’s real paint, wheels, trim and flaws stay exactly as photographed, so listings look professional '
      + 'and stay honest. It runs automatically on your whole inventory.',
    breadcrumbs: [
      { name: 'Home', url: home },
      aiToolsCrumb,
      { name: 'AI car photo editor', url: SITE.origin + NAV.photoEditor.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What does an AI car photo editor do?',
        a: [
          'It separates the vehicle from everything behind it, then rebuilds the scene: gone are the fence, '
          + 'the snow pile, the other cars and the power lines; in their place a clean showroom floor, a '
          + 'sunset lot, or your own dealership’s storefront. The car itself is untouched — same pixels, same '
          + 'color, same condition.',
          'For a dealership the point is consistency at scale. One good photo is easy; three hundred '
          + 'consistent, showroom-grade photos a week is a staffing problem — unless software does it. '
          + 'AutoLander’s studio processes your inventory’s existing feed photos automatically as part of '
          + 'listing preparation.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/infiniti-qx60-before.webp',
        after: '/studio/infiniti-qx60-after.webp',
        beforeAlt: 'Dealer feed photo of a 2023 Infiniti QX60 with branded frame overlay, before AutoLander',
        afterAlt: 'The same 2023 Infiniti QX60 composited into a clean showroom by AutoLander’s AI car photo editor',
        caption: 'A real feed photo (left) — branded frame and all — becomes a showroom listing image (right). Same QX60, same angle, nothing about the car altered.',
      },
      {
        type: 'figure',
        before: '/studio/genesis-gv70-before.webp',
        after: '/studio/genesis-gv70-after.webp',
        beforeAlt: 'Dealer feed photo of a Genesis GV70 with portal frame, before AutoLander',
        afterAlt: 'The same Genesis GV70 in a bright showroom scene after AutoLander’s AI Photo Studio',
        caption: 'The GV70’s paint flecks and chrome stay exactly as shot — the studio changes the scene, never the car.',
      },
      {
        type: 'features',
        h2: 'Built for dealership volume, not one-off edits',
        cards: [
          { title: 'Whole-inventory processing', body: 'Point it at your feed and every unit gets the treatment — no per-photo uploads, no seat licenses for a photo intern.' },
          { title: 'Composite, never repaint', body: 'The studio cuts out the real car and rebuilds the background. Color, wheels, badges, even the door ding stay honest — buyers get the car they saw.' },
          { title: 'Your storefront as the backdrop', body: 'A custom scene puts your own building behind every listing — rooftop branding on every photo, like the Tundra below.' },
          { title: 'Listing-ready ordering', body: 'Shots come back organized the way buyers browse: hero exterior first, interior, details — ready for [Marketplace listings](/facebook-marketplace-listing-software/).' },
          { title: 'AI walkaround video', body: 'One click turns a unit’s photos into a short walkaround video — motion content Marketplace and buyers favor, no filming.' },
          { title: 'Charged on delivery, refunded on failure', body: 'Media work is validated before it counts, and anything that fails to deliver is automatically refunded. You never pay for a blank.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/jeep-renegade-before.webp',
        after: '/studio/jeep-renegade-after.webp',
        beforeAlt: 'Jeep Renegade feed photo boxed in a third-party promo frame, before AutoLander',
        afterAlt: 'The same blue Jeep Renegade staged in a golden-hour lot scene by AutoLander’s AI car photo editor',
        caption: 'From boxed-in feed photo to golden-hour hero shot: the Renegade’s bright blue paint and black wheels stay exactly as photographed.',
      },
      {
        type: 'image',
        src: '/studio/toyota-tundra-after.webp',
        alt: 'A 2025 Toyota Tundra TRD Pro composited in front of the dealership’s own storefront by AutoLander’s AI Photo Studio',
        caption: 'The branded-backdrop option: the dealer’s actual storefront composited behind every unit — each listing photo doubles as an ad for the store.',
      },
      {
        type: 'steps',
        h2: 'From feed photo to showroom listing',
        steps: [
          { title: 'Your inventory syncs', body: 'AutoLander already reads your inventory feed to post it — the studio uses those same photos. Nothing to upload. See [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'Pick the look once', body: 'Showroom, outdoor scene, or a custom backdrop of your own storefront — set per store, applied consistently to every unit.' },
          { title: 'The studio does the set', body: 'Each vehicle’s photos are cut out, composited, and returned as a consistent, listing-ready set — with a walkaround video if you want one.' },
          { title: 'Listings go live looking like money', body: 'The processed set flows straight into your [Facebook Marketplace listings](/facebook-marketplace-auto-poster/), where the photo is the ad.' },
        ],
      },
      {
        type: 'callout',
        title: 'Why "never repaint" matters',
        body: 'Some tools regenerate the whole image — and quietly change the color, wheels or trim. That is how a '
          + 'buyer ends up test-driving a car that does not match its photos. AutoLander’s studio composites the '
          + 'genuine photograph onto a new scene, so the listing stays a photograph of the actual car. Honest photos '
          + 'close deals; pretty fakes bounce them.',
      },
    ],
    faq: [
      ['What is the best AI photo editor for car dealerships?',
        'For dealership use the bar is volume and honesty: it should process your entire feed automatically and never alter the vehicle itself. AutoLander’s AI Photo Studio does both and feeds the results straight into your Marketplace listings — see how it fits the full toolkit in [Facebook AI tools for car dealers](/facebook-ai-tools/).'],
      ['Does the AI change the color or hide damage on the car?',
        'No — and it must not. The studio composites the real photograph onto a new background; paint, wheels, trim and visible wear stay exactly as shot. Buyers should always meet the car they saw online.'],
      ['Can it work from regular phone photos?',
        'Yes. Phone shots and feed photos are exactly what it is built for — that is the "before" in every example on this page. No lightbox, no photographer, no reshoots.'],
      ['Can it put my dealership’s building behind the cars?',
        'Yes — a custom branded backdrop composites your own storefront behind every unit, which turns each listing photo into a small ad for the store itself.'],
      ['How much does the AI car photo editor cost?',
        'It is part of AutoLander (plans from $39/mo, 5 free posts to start). Media generation is charged per delivered output and automatically refunded if anything fails to deliver — details on the [pricing page](/facebook-marketplace-auto-poster-pricing/).'],
      ['Does it work on RVs and trailers?',
        'Yes — travel trailers, fifth wheels and motorhomes get the same studio treatment, alongside the RV-specific listing support in [RV dealer software](/rv-dealer-software/).'],
    ],
    cta: {
      heading: 'Make the whole lot look like a showroom',
      sub: 'Your existing photos in, showroom-grade listings out — automatically, for every unit you post.',
    },
  },

  // ---------------------------------------------------------------- MONEY: /rv-dealer-software/
  {
    key: 'rvDealers',
    title: 'RV Dealer Software for Facebook Marketplace | AutoLander',
    description:
      'RV dealer software that posts travel trailers, fifth wheels and motorhomes to Facebook Marketplace '
      + 'in the right category. From $39/mo.',
    eyebrow: 'For RV dealerships',
    h1: 'RV dealer software for Facebook Marketplace',
    bylineUpdated: true,
    tldr:
      'AutoLander is RV dealer software for the selling side: it syncs your RV inventory, posts every unit '
      + 'to Facebook Marketplace as an RV/Camper listing (not a mislabeled car), upgrades the photos with an '
      + 'AI studio, keeps asking prices in step with your feed, and removes sold units automatically. It is the '
      + 'Marketplace sales layer that works alongside your DMS — travel trailers, fifth wheels, motorhomes '
      + 'and toy haulers included.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'RV dealer software', url: SITE.origin + NAV.rvDealers.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What does RV dealer software need to do on Facebook Marketplace?',
        a: [
          'Four things, and most tools built for cars miss the first one: list RVs in Marketplace’s RV/Camper '
          + 'category with RV-appropriate details — a travel trailer posted as a "car" is invisible to the '
          + 'people actually shopping for one. Then the same fundamentals as any dealer: complete coverage of '
          + 'the inventory, photos that do the unit justice, and a team that answers buyers fast.',
          'AutoLander was built with RV feeds as first-class citizens: units sync from your inventory source, '
          + 'post in the right category with the right details, and come down automatically the day they sell.',
        ],
      },
      {
        type: 'image',
        src: '/studio/coachmen-catalina-studio.webp',
        alt: 'A 2027 Coachmen Catalina Legacy Edition travel trailer on a clean white studio background, processed by AutoLander’s AI Photo Studio for an RV dealer',
        caption: 'Straight from a working RV dealer’s AutoLander account: a 2027 Coachmen Catalina travel trailer, studio-processed for its Marketplace listing.',
      },
      {
        type: 'features',
        h2: 'What AutoLander does for an RV dealership',
        cards: [
          { title: 'RVs listed as RVs', body: 'Travel trailers, fifth wheels, Class A/B/C motorhomes and toy haulers post to Marketplace as RV/Camper listings — the category RV shoppers actually browse.' },
          { title: 'Inventory sync from your RV platform', body: 'Point AutoLander at your website or inventory feed and the lot stays in sync — new arrivals post, price changes follow, sold units come down. See [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'AI photos on 30-foot subjects', body: 'The [AI Photo Studio](/ai-car-photo-editor/) handles RVs like the Catalina above — clean backgrounds that make a big unit read clearly in a small thumbnail.' },
          { title: 'Seasonal pricing that keeps up', body: 'RV asking prices move with the season. Yours follow the feed automatically, so a spring listing is never still showing last autumn’s number.' },
          { title: 'Whole-lot coverage', body: 'Post the full inventory within your account’s limits — [bulk posting](/bulk-post-cars-to-facebook-marketplace/) without the seasonal data-entry marathon.' },
          { title: 'No ghost listings', body: 'The unit that delivered Saturday is off Marketplace before Monday’s calls — automatic sold detection keeps your listings honest.' },
        ],
      },
      {
        type: 'steps',
        h2: 'Getting an RV lot onto Marketplace',
        steps: [
          { title: 'Connect the inventory', body: 'Your website or feed is the source of truth — AutoLander reads it and builds Marketplace-ready listings, specs and photos included.' },
          { title: 'Set the look', body: 'Optionally run every unit through the AI studio for consistent, showroom-grade photos across the whole lot.' },
          { title: 'Post and maintain automatically', body: 'Units go live in the RV/Camper category and stay current — prices sync, sold units come down, new arrivals queue up.' },
          { title: 'Your team works the inbox', body: 'Buyers message you in Messenger exactly as they do now — AutoLander stays out of it. Its contribution is that the specs and price they are asking about are already correct.' },
        ],
      },
      {
        type: 'callout',
        title: 'What AutoLander is not',
        body: 'It is not a DMS and does not replace your F&I, service or accounting stack — it is the Facebook '
          + 'Marketplace sales layer that runs alongside them. And like every seller on Marketplace, your Meta '
          + 'account eligibility, categories and listing limits apply; see the [policy and safety guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['Can RV dealers post inventory on Facebook Marketplace?',
        'Yes — RVs and campers have their own Marketplace category, and eligible dealer accounts can list there. The practical challenge is volume and upkeep across a whole lot, which is the job AutoLander automates: posting, price sync and sold-unit removal.'],
      ['Does AutoLander support travel trailers, fifth wheels and motorhomes?',
        'All of them — units post as RV/Camper listings with RV-appropriate details rather than being shoehorned into car listings, which is where generic car-posting tools fall down.'],
      ['Where is the best place to sell RVs online?',
        'For local, ready-to-buy traffic at zero listing cost, Facebook Marketplace is the strongest channel most RV dealers underuse — buyers filter by type, price and distance and message directly. National RV portals add reach on top; Marketplace is the free foundation.'],
      ['Does the AI photo studio work on RVs?',
        'Yes — the Catalina travel trailer on this page is a real studio output from a working RV dealer’s account. Big units benefit most: clean backgrounds make a 30-foot trailer read instantly in a thumbnail.'],
      ['What does RV dealer software from AutoLander cost?',
        'Same simple model as for car dealers: plans from $39/mo with 5 free posts and no credit card to try it. See [pricing](/facebook-marketplace-auto-poster-pricing/).'],
    ],
    cta: {
      heading: 'Put the whole RV lot in front of local buyers',
      sub: 'Right category, showroom photos, synced prices, automatic sold-unit removal — from $39/mo.',
    },
  },
];
