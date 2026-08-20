// Dealer-growth silo — MONEY pages (2026-08-20): AI chat, AI car photo editor, RV dealer software.
// Commercial intent → homepage funnel. Product claims stay honest: chat answers from real inventory
// data and escalates instead of guessing; the photo studio composites (never repaints) the vehicle;
// RV positioning is the Marketplace sales layer, not a DMS. No fabricated stats, prices from SITE.
// Follows the page-object contract in scripts/seo/shell.mjs. Static, NO pixel.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const aiToolsCrumb = { name: 'Facebook AI tools', url: SITE.origin + NAV.aiTools.path };

export const PAGES = [

  // ---------------------------------------------------------------- MONEY: /ai-chat-for-car-dealers/
  {
    key: 'aiChat',
    title: 'AI Chat for Car Dealers: 24/7 Marketplace Inbox | AutoLander',
    description:
      'AI chat for car dealers: answers Marketplace buyers in seconds 24/7 with real inventory data, books '
      + 'appointments, hands hot leads to your team.',
    eyebrow: 'AutoLander AI Responder',
    h1: 'AI chat for car dealers: every buyer answered in seconds, 24/7',
    bylineUpdated: true,
    tldr:
      'AI chat for car dealers is an AI salesperson on your Facebook Marketplace inbox: it answers every '
      + 'buyer message in seconds at any hour, pulls its answers from your real inventory data instead of '
      + 'guessing, captures the buyer’s name and number, books the appointment, and hands hot or sensitive '
      + 'conversations to your team. AutoLander’s AI chat runs through your own store’s Facebook session '
      + 'inside its desktop app — not a shared cloud bot.',
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
          'It is software that holds the first conversation with a car buyer for you. When someone messages '
          + 'about a listing — "is it available?", "what’s the mileage?", "would you take $12,500?" — the AI '
          + 'replies immediately with accurate answers drawn from that exact vehicle’s data, asks the '
          + 'qualifying questions a good salesperson would ask, and moves the buyer toward an appointment.',
          'The difference between AI chat and the chatbots dealers learned to hate is truth and handoff: '
          + 'AutoLander’s AI answers from your live inventory rather than a script, and it is designed to hand '
          + 'the thread to a human instead of improvising when a conversation needs judgment — a negotiation, '
          + 'a trade-in, an upset buyer.',
        ],
      },
      {
        type: 'features',
        h2: 'What the AI Responder does on your inbox',
        cards: [
          { title: 'Answers in seconds, around the clock', body: 'Marketplace buyers message several stores at once; the first real answer usually wins. Nights, weekends, lunch rush — the AI is the fastest responder in your market.' },
          { title: 'Real answers from real inventory', body: 'Price, mileage, features, availability — pulled from the actual unit’s data. It is built to answer from facts it has, not invent ones it does not.' },
          { title: 'Qualifies like a pro', body: 'Payment or cash, trade-in, timeline, must-haves — the AI asks, records, and scores the lead so your team opens the thread already knowing the buyer.' },
          { title: 'Books the appointment', body: 'It offers times that fit your store hours and gets the visit on the calendar while the buyer is still hot.' },
          { title: 'Captures contact info', body: 'Names and phone numbers collected in-thread, so a Marketplace conversation becomes a lead you own.' },
          { title: 'Hands off the moment it should', body: 'Hot buyer, price negotiation, angry customer, anything sensitive — the AI escalates to your team instead of winging it, and flags the thread so nothing slips.' },
        ],
      },
      {
        type: 'table',
        h2: 'What the AI handles vs. what your team gets',
        head: ['Conversation stage', 'AI Responder', 'Your salespeople'],
        alCol: 1,
        rows: [
          ['"Is this still available?" at 11:40pm', 'Instant, accurate reply', 'Asleep — as they should be'],
          ['Vehicle questions (mileage, features, history)', 'Answered from the unit’s real data', 'Freed from repeating the listing'],
          ['Qualifying (trade, timeline, financing)', 'Asked and recorded automatically', 'Opens every thread pre-qualified'],
          ['Appointment setting', 'Offered and booked in-thread', 'Shows up to a scheduled test drive'],
          ['Negotiation, trade values, complaints', 'Escalated immediately, never improvised', 'Takes over with full context'],
        ],
      },
      {
        type: 'steps',
        h2: 'How it works in your store',
        steps: [
          { title: 'Connect your inventory', body: 'AutoLander already syncs your units to post them — the AI answers from the same source of truth, so chat and listings never disagree. See [inventory sync](/facebook-marketplace-inventory-sync/).' },
          { title: 'Set the guardrails', body: 'Your hours, your handoff rules, what the AI may discuss and what always goes to a human. You stay in control of the voice of your store.' },
          { title: 'The AI works the inbox', body: 'Every new Marketplace message gets an instant, accurate, courteous reply — through your own store’s Facebook session in the AutoLander desktop app, not a shared cloud account.' },
          { title: 'Your team closes', body: 'Qualified, scheduled, phone-number-attached buyers land with your salespeople. The AI did the night shift; humans do the handshake.' },
        ],
      },
      {
        type: 'callout',
        title: 'The honest constraints',
        body: 'The AI Responder replies while the AutoLander desktop app is running with your store’s Facebook '
          + 'session, and your Meta account eligibility and Marketplace rules always apply — see the '
          + '[policy and safety guide](/guide/facebook-marketplace-automation/). It is designed to answer from '
          + 'your data and escalate instead of guessing; no vendor should promise you an AI that "handles '
          + 'everything," and we don’t.',
      },
    ],
    faq: [
      ['What is the best AI chatbot for car dealerships?',
        'The useful test is three questions: does it answer from your live inventory data (not a script), does it hand off to humans the moment a conversation needs judgment, and does it run through your own accounts rather than a shared bot fleet? AutoLander’s AI Responder is built to pass all three — compare approaches in [AI for car dealerships](/guide/ai-for-car-dealerships/).'],
      ['Can AI really answer Facebook Marketplace messages for a dealership?',
        'Yes — that is the AI Responder’s whole job. It replies in seconds with the real price, mileage and details of the exact unit, qualifies the buyer, books a time, and escalates negotiations or sensitive threads to your team.'],
      ['Will the AI make up prices or discounts?',
        'It is designed not to: answers come from your inventory data, and conversations that move into negotiation are handed to your team. An AI that improvises numbers costs more than it saves, so ours escalates instead.'],
      ['Does AI chat work after hours and on weekends?',
        'That is where it earns its keep — evenings and weekends are when Marketplace buyers browse and when unanswered messages quietly die. The AI answers instantly whenever the AutoLander desktop app is running, and your team picks up warm, scheduled buyers in the morning.'],
      ['How much does AI chat for car dealers cost?',
        'It ships as part of AutoLander — plans from $39/mo with 5 free posts and no credit card to start. See [pricing](/facebook-marketplace-auto-poster-pricing/) for current plans.'],
    ],
    cta: {
      heading: 'Put an AI salesperson on the night shift',
      sub: 'Every Marketplace buyer answered in seconds, qualified and booked — your team just shows up to the test drive.',
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
        before: '/studio/toyota-tundra-before.webp',
        after: '/studio/toyota-tundra-after.webp',
        beforeAlt: 'CarGurus feed photo of a 2025 Toyota Tundra TRD Pro before AutoLander',
        afterAlt: 'The same 2025 Toyota Tundra in front of the dealership’s own storefront, composited by AutoLander',
        caption: 'The branded-backdrop option: the dealer’s actual storefront composited behind a real feed photo of the Tundra.',
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
      + 'AI studio, answers buyer messages around the clock, and removes sold units automatically. It is the '
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
          + 'the inventory, photos that do the unit justice, and someone answering buyers at 9pm.',
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
          { title: 'Buyers answered 24/7', body: 'RV shoppers browse on weekend evenings. [AI chat](/ai-chat-for-car-dealers/) answers instantly with the unit’s real specs and price, captures the lead and books the walkthrough.' },
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
          { title: 'Let the AI work the inbox', body: 'Every "is this still available?" gets an instant, accurate answer, and serious buyers land on your calendar.' },
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
        'Yes — RVs and campers have their own Marketplace category, and eligible dealer accounts can list there. The practical challenge is volume and upkeep across a whole lot, which is the job AutoLander automates: posting, price sync, buyer chat and sold-unit removal.'],
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
      sub: 'Right category, showroom photos, 24/7 answers, automatic sold-unit removal — from $39/mo.',
    },
  },
];
