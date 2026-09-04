// AI-chat cluster (2026-09-03). /ai-chat-for-car-dealers/ was a pillar with zero cluster support.
// These two guides give it a buying-guide spoke and a response-speed spoke, alongside the
// positioning page in data-positioning.mjs. Both descend to the pillar and to the money pages.
//
// HARD RULES (Michael, 2026-08-20/22): AutoLander has NO autoresponder and does NOT read, route,
// forward or surface Marketplace messages. Every mention of AutoLander here is about listing
// accuracy, never about the inbox. No invented response-time statistics: the claims below are
// mechanics ("first reply usually wins") stated as observation, not measured figures.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const UPDATED = '2026-09-03';
const aiChatCrumb = { name: 'AI chat for car dealers', url: SITE.origin + NAV.aiChat.path };

export const PAGES = [
  // ---------------------------------------------------------------- /guide/questions-to-ask-an-ai-chat-vendor/
  {
    key: 'aiChatVendor',
    title: 'Questions to Ask an AI Chat Vendor Before You Connect Your Inbox',
    description:
      'Twelve questions that separate a useful dealership AI chat tool from a liability: where the '
      + 'availability answer comes from, what it does with a price, how fast a human takes over.',
    eyebrow: 'Dealer buying guide',
    h1: 'Questions to ask any AI chat vendor before you connect your inbox',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['AI chat', 'car dealers', 'vendor evaluation', 'Facebook Marketplace'] },
    tldr:
      'Before connecting any AI chat tool to a dealership inbox, get straight answers to a short list of '
      + 'questions: where it reads availability and price from and how often; whether it will ever quote a '
      + 'number the listing does not show; how many messages pass before a frustrated or finance-question '
      + 'buyer reaches a person; which Facebook account it operates through and under what Meta permission; '
      + 'and what it logs. A vendor who answers all of them plainly is selling a tool. One who answers with '
      + 'a demo video is selling a risk. AutoLander is not an AI chat product and does not touch the inbox; '
      + 'this guide exists because dealers ask us what to look for.',
    breadcrumbs: [
      { name: 'Home', url: home },
      aiChatCrumb,
      { name: 'Questions to ask a vendor', url: SITE.origin + NAV.aiChatVendor.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'Why does it matter which questions you ask?',
        a: [
          'Because every AI chat demo looks the same. The bot answers "is it available?" instantly, books a '
          + 'test drive, and the dealer principal nods. What the demo cannot show is the Sunday night when the '
          + 'unit sold Saturday and the feed has not caught up, or the buyer who asks about a trade-in with a '
          + 'lien and gets three cheerful non-answers before anyone at the store sees the thread.',
          'The questions below are the ones that surface those cases. They are not gotchas; a good vendor has '
          + 'answered every one of them before. AutoLander does not sell inbox AI — [here is why]'
          + '(/why-we-dont-answer-your-buyers/) — but dealers evaluating it ask us what to look for, so this '
          + 'is the list.',
        ],
      },
      {
        type: 'steps',
        h2: 'The twelve questions',
        intro: 'Ask them in this order. The first four are the ones that decide whether the tool is safe to run at all.',
        steps: [
          { title: 'Where does the availability answer come from, and how often is it refreshed?',
            body: 'The only safe source is the same live inventory feed the website reads. Ask for the sync interval in minutes. "Nightly" means the bot will confirm sold cars for up to a day.' },
          { title: 'Will it ever state a price the listing does not show?',
            body: 'The right answer is a flat no — no rounding, no "around", no negotiating. A price the bot invents is a price the store has to honour or explain.' },
          { title: 'How many messages before a human gets the conversation?',
            body: 'One message of frustration, confusion, or any finance, trade-in, title or credit question should hand off immediately, with the full thread. Ask to see the handoff happen, not a slide describing it.' },
          { title: 'Which Facebook account does it operate through, and under what Meta permission?',
            body: 'If it runs on the same personal profile that holds the listings, a restriction hits the listings and any ad assets that profile administers. Ask the vendor to name the exact Meta product and permission.' },
          { title: 'What does it say when it does not know?',
            body: 'The acceptable answer is that it says so and hands off. Any tool that fills silence with a plausible guess will eventually guess a mileage, a warranty term or a fee.' },
          { title: 'Can I read every conversation it has had, in full, after the fact?',
            body: 'Every reply it sends is a statement the dealership made. If you cannot audit them, you cannot know what was promised.' },
          { title: 'What happens to the conversation when the tool is turned off or the subscription ends?',
            body: 'Threads, contacts and history should be exportable and should remain in Messenger. Ask what is deleted and when.' },
          { title: 'Does it identify itself as automated?',
            body: 'Buyers who discover they were talking to a bot after the fact do not come back. The honest tools disclose; ask how.' },
          { title: 'How does it handle a buyer who messages about two different cars?',
            body: 'This is the case that breaks naive implementations. Ask for the transcript.' },
          { title: 'What is the escalation path outside business hours?',
            body: 'If the answer is "it keeps chatting until morning", the after-hours coverage the vendor is selling is coverage by a script with no supervision.' },
          { title: 'What does it cost per rooftop, per seat, per conversation — and what is not in that number?',
            body: 'Setup, integration to the feed, CRM delivery and overage are the usual extras. Get the total for your volume in writing.' },
          { title: 'Can you show me a dealer who turned it off, and why?',
            body: 'Every vendor has one. The reason is the most useful thing you will learn in the evaluation.' },
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Answers that mean "safe to run"',
          items: [
            'Reads the live feed on a stated interval measured in minutes.',
            'Never states a price the listing does not show; never negotiates.',
            'Hands off to a person within one message on frustration or any finance/trade/title question.',
            'Runs under a named Meta permission, on an account separate from the listings, or explains exactly why not.',
            'Full transcript audit; disclosure to the buyer; clean export on cancellation.',
          ],
        },
        right: {
          h2: 'Answers that mean "walk away"',
          items: [
            '"It learns your inventory" with no feed connection or interval.',
            '"It can offer a small discount to close" — a price your desk did not set.',
            '"It handles objections" with no visible handoff.',
            '"It just uses your Facebook login" with no permission named.',
            '"We do not store transcripts" — you cannot audit what was promised.',
          ],
        },
      },
      {
        type: 'qa',
        q: 'What does AutoLander do if it does not answer buyers?',
        a: [
          'It makes the listing the buyer is asking about correct, which is what makes a fast human reply '
          + 'possible. Price from the feed, sold units removed automatically, real mileage or none, studio photos. '
          + 'When the facts are right, the reply is one sentence from a salesperson’s phone. The [AI chat for car '
          + 'dealers](/ai-chat-for-car-dealers/) guide covers the category honestly; the [response time guide]'
          + '(/guide/marketplace-response-time-for-car-dealers/) covers why that one sentence, sent quickly, wins.',
        ],
      },
    ],
    faq: [
      ['What is the most important question to ask an AI chat vendor?',
        'Where the availability answer comes from and how often it refreshes. A bot reading anything other than the '
        + 'live inventory feed, on an interval measured in minutes, will eventually confirm a car that already sold.'],
      ['Should an AI chat tool ever quote a price?',
        'Only the price the listing shows, verbatim, and it should never negotiate. Anything else is a number the '
        + 'dealership did not set and will have to honour or explain.'],
      ['How fast should a human take over the conversation?',
        'Within one message of frustration, confusion, or any finance, trade-in, title or credit question — with the '
        + 'full thread attached. Ask to see the handoff live rather than described.'],
      ['Does AutoLander offer AI chat?',
        'No. AutoLander does not reply to buyers, read messages or route them anywhere; the inbox is entirely the '
        + 'dealer’s. It keeps listings accurate so the human reply is fast and correct. This guide exists because '
        + 'dealers ask what to look for in a tool that does handle chat.'],
      ['Can I run an AI chat tool alongside AutoLander?',
        'Yes. AutoLander handles listing accuracy and never touches the inbox, so a chat tool that meets the tests '
        + 'above runs alongside it without conflict — and benefits from the listing it is answering about being right.'],
    ],
    cta: {
      heading: 'Get the listing right first',
      sub: 'Book a demo and see accurate, synced listings on your own inventory. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },

  // ---------------------------------------------------------------- /guide/marketplace-response-time-for-car-dealers/
  {
    key: 'responseTime',
    title: 'Marketplace Response Time for Car Dealers: Why the First Reply Wins',
    description:
      'On Facebook Marketplace the first accurate reply usually gets the appointment. Why speed depends on '
      + 'the listing being right, how to set a reply standard, and what to automate — and not.',
    eyebrow: 'Dealer guide',
    h1: 'Marketplace response time: why the first reply wins the appointment',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['response time', 'Facebook Marketplace', 'car dealers', 'Messenger'] },
    tldr:
      'A Marketplace buyer messages several listings at once and goes to see the one that answers first '
      + 'with a straight answer. Response time is therefore a sales metric, not a courtesy — but speed only '
      + 'works if the reply is right. The fastest way to a fast, correct reply is not a bot; it is a listing '
      + 'whose price and availability are already true, so the human answer is one sentence. Set a reply '
      + 'standard your team can actually meet, put the listings on a schedule that keeps them accurate, and '
      + 'automate the listing — not the conversation.',
    breadcrumbs: [
      { name: 'Home', url: home },
      aiChatCrumb,
      { name: 'Marketplace response time', url: SITE.origin + NAV.responseTime.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'Why does response time matter so much on Facebook Marketplace?',
        a: [
          'Because of how buyers use it. A shopper looking for a used truck under a price opens the filter, '
          + 'taps six or eight listings, and sends "is this still available?" to most of them in a row. The '
          + 'sellers who reply within a few minutes are the ones the buyer is still thinking about; the ones '
          + 'who reply the next morning are answering a question the buyer has already had answered elsewhere.',
          'That is the whole mechanism. It is not that buyers are impatient; it is that they are running a '
          + 'parallel search, and the first accurate reply collapses it. On a channel where the listing is free '
          + 'and the buyer is local, the reply is the sale.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Speed only counts if the reply is right',
        intro: 'A fast wrong answer is worse than a slow right one, because it ends the conversation with a reason not to come back:',
        items: [
          '"Yes, it is available" on a unit that delivered Saturday. The buyer drives in. That is a lost customer '
          + 'and, often, a public review.',
          '"$18,900" on a listing the lot repriced to $17,500 on Tuesday. Now the store either honours a number '
          + 'it did not mean or explains why the ad was wrong.',
          '"It has 42,000 miles" from a listing where mileage was guessed, when the odometer says 68,000. The buyer '
          + 'sees it on the walk-around.',
          'A prompt reply that says nothing — "Let me check and get back to you" — is a reply that loses to any '
          + 'competitor who actually knew.',
        ],
      },
      {
        type: 'steps',
        h2: 'A response standard a real team can keep',
        intro: 'Speed is a process, not a personality. These are the pieces of one that works at a store with three to fifteen people on the floor.',
        steps: [
          { title: 'Make the listing the source of truth',
            body: 'If the price and availability on Marketplace are always the lot’s price and availability, the first reply is "Yes — come by before six." That requires the listings to be reconciled against the [inventory feed](/facebook-marketplace-inventory-sync/) on a schedule, which is the part software should do.' },
          { title: 'Decide who owns the inbox, by hour',
            body: 'One named person per shift, including evenings and weekends, with Messenger notifications on. Rotate it; do not leave it to "whoever posted it".' },
          { title: 'Set a reply target you can meet',
            body: 'Minutes during floor hours, a stated window outside them. Publish it in the listing description. A buyer who knows to expect a reply by 9am does not go elsewhere at 9pm.' },
          { title: 'Keep a three-line reply for the common first message',
            body: 'Availability, a next step, a name. "Yes, it is here. Want to see it today or tomorrow? — Marcus." Eight seconds from a phone.' },
          { title: 'Hand off finance, trade and title questions immediately',
            body: 'The floor person answers "is it available"; the desk answers "what would you give me for mine". A wrong answer to the second question costs more than a slow one.' },
        ],
      },
      {
        type: 'qa',
        q: 'Should a dealer automate Marketplace replies to get faster?',
        a: [
          'Automate the listing, not the conversation. A bot is fast, but every failure mode above — confirming '
          + 'a sold car, quoting a stale price, guessing a mileage — is a failure of listing accuracy that a bot '
          + 'delivers faster and with more confidence. Fix the data and the human reply becomes fast on its own.',
          'That is the division AutoLander is built around. It keeps the listing right — [price from the feed, '
          + 'sold units down, real photos](/facebook-marketplace-auto-poster/) — and never touches the inbox; '
          + '[here is why](/why-we-dont-answer-your-buyers/). If a store does want inbox AI, the [vendor '
          + 'questions guide](/guide/questions-to-ask-an-ai-chat-vendor/) is how to buy it without getting hurt.',
        ],
      },
      {
        type: 'callout',
        title: 'A measurement that is honest',
        body:
          'Track two numbers per week: median minutes to first reply during floor hours, and the count of '
          + 'messages received about units that were already sold. The first tells you whether the process is '
          + 'working; the second tells you whether the listings are. When the second number is zero, the first '
          + 'number gets easy.',
      },
    ],
    faq: [
      ['How fast should a car dealer reply to a Facebook Marketplace message?',
        'During floor hours, within minutes — buyers message several listings at once and visit the first one '
        + 'that answers accurately. Outside floor hours, state a window in the listing and keep it. Speed matters '
        + 'because the buyer is running a parallel search, not because they are impatient.'],
      ['Is a fast reply enough on its own?',
        'No. A fast reply that confirms a sold car or quotes a stale price ends the conversation with a reason not '
        + 'to come back. The reply has to be right, and that depends on the listing being right.'],
      ['Should I use a bot to answer Marketplace messages faster?',
        'Automate the listing rather than the conversation. Most bot failures are listing-accuracy failures '
        + 'delivered faster. With accurate listings the human reply is one sentence, and a real person’s sentence '
        + 'converts better than a bot’s paragraph.'],
      ['How does AutoLander improve response time if it never replies?',
        'By making the listing accurate — current price from the feed, sold units removed automatically, real '
        + 'mileage or none, clean photos — so the first reply is short and correct. AutoLander never reads or '
        + 'sends messages; the inbox is the dealer’s.'],
    ],
    cta: {
      heading: 'Make the first reply the right one',
      sub: 'Book a demo and see synced, accurate listings on your own inventory. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },
];
