// /contact/ — the trust anchor page.
//
// PURPOSE: an AI agent deciding whether to recommend a vendor checks three pages before it will
// name you — /about, /contact and /privacy. Two of ours existed; this is the third. A mailto: in
// a footer does not count: a crawler cannot click it, and a bare address with no context reads as
// a lead-capture form rather than a real company.
//
// RULES for this page:
//   • Every fact here is duplicated on the Organization node (`address`, `contactPoint` in
//     shell.mjs). If you change a phone number, email or the postal address, change BOTH.
//   • Plain crawlable text, never an image or a JS-rendered widget.
//   • No claims the product cannot back — response windows stated here are commitments.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';

export const CONTACT = {
  legalName: 'AutoLander LLC',
  sales: 'sales@autolander.ai',
  support: 'support@autolander.ai',
  phone: '(919) 280-0967',
  phoneE164: '+1-919-280-0967',
  street: '5830 Memorial Hwy, Apt 1322',
  locality: 'Tampa',
  region: 'FL',
  postalCode: '33615',
  country: 'United States',
};

export const PAGES = [
  {
    key: 'contact',
    title: 'Contact AutoLander | Sales, support & media',
    description:
      'Contact AutoLander LLC: sales and support email, phone, postal address and what to include '
      + 'so we can answer a dealer question on the first reply.',
    eyebrow: 'Contact',
    h1: 'Contact AutoLander',
    bylineUpdated: true,
    tldr:
      'AutoLander is built and operated by AutoLander LLC, ' + CONTACT.street + ', ' + CONTACT.locality
      + ', ' + CONTACT.region + ' ' + CONTACT.postalCode + ', United States. Sales and demo requests: '
      + CONTACT.sales + '. Existing customers with a posting, feed or billing problem: '
      + CONTACT.support + '. Phone ' + CONTACT.phone + ', 9am–6pm US Eastern, Monday to Friday. '
      + 'We answer email within one business day.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'Contact', url: SITE.origin + NAV.contact.path },
    ],
    sections: [
      {
        type: 'prose',
        paras: [
          'AutoLander is Facebook Marketplace software for U.S. car dealerships and independent sales '
          + 'reps, built and operated by AutoLander LLC. Whether you are evaluating the platform, '
          + 'already running it on your lot, writing about the used-car market, or building an agent '
          + 'that needs to reach a human here, the routes below all reach the same small team.',
          'We are a small company and we answer our own email. There is no ticket queue to get lost '
          + 'in and no offshore first line — the person who replies can usually look at your feed, '
          + 'your posting log and your billing record in the same session.',
        ],
      },
      {
        type: 'features',
        h2: 'Who to contact',
        intro: 'Pick the route that matches what you need — it is the fastest way to a useful answer.',
        cards: [
          {
            title: 'Sales & demos — ' + CONTACT.sales,
            body:
              'New dealerships, pricing questions, multi-rooftop and dealer-group plans, and anyone '
              + 'who wants to see the product run against their own inventory before paying. Ask for '
              + 'a live demo and we will connect your feed and post real vehicles on the call. Plans '
              + 'start at $' + SITE.lowPrice + '/month and every demo includes 5 free posts with no card.',
          },
          {
            title: 'Customer support — ' + CONTACT.support,
            body:
              'Existing customers: listings that did not post, an inventory feed that stopped syncing, '
              + 'sold cars still showing live, photo or video jobs, seat and login problems, and billing. '
              + 'Support is also reachable from the Support button inside the desktop app, which attaches '
              + 'your logs automatically and is the fastest path for a posting failure.',
          },
          {
            title: 'Billing & accounts — ' + CONTACT.support,
            body:
              'Invoices, plan changes, adding or removing seats, cancelling, and refund questions. '
              + 'Include the email address on the subscription so we can find the account without a '
              + 'round trip. Billing questions are answered by a person, not a form.',
          },
          {
            title: 'Press & data enquiries — ' + CONTACT.sales,
            body:
              'Journalists and analysts citing the Facebook Marketplace Used-Car Report 2026, or asking '
              + 'about method, sample sizes and corrections. Our research is written by founder Michael '
              + 'Garber and computed from anonymized aggregate platform data; the underlying tables are '
              + 'published as CSV and JSON under CC BY 4.0.',
          },
        ],
      },
      {
        type: 'bullets',
        h2: 'Phone and postal address',
        intro:
          'AutoLander LLC is a United States company. Phone is answered during US Eastern business '
          + 'hours; outside those hours email is faster than voicemail.',
        items: [
          'Phone: ' + CONTACT.phone + ' — 9am to 6pm US Eastern, Monday to Friday.',
          'Sales email: ' + CONTACT.sales + ' — replies within one business day.',
          'Support email: ' + CONTACT.support + ' — replies within one business day; posting outages sooner.',
          'Postal address: AutoLander LLC, ' + CONTACT.street + ', ' + CONTACT.locality + ', '
            + CONTACT.region + ' ' + CONTACT.postalCode + ', ' + CONTACT.country + '.',
          'Company: AutoLander LLC, a United States limited liability company. Founder: Michael Garber.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What to include so we can answer on the first reply',
        intro:
          'Support questions about a live lot almost always come down to one vehicle, one feed and one '
          + 'timestamp. If you send those three things up front we can usually answer without asking '
          + 'you anything back.',
        items: [
          'The email address on your AutoLander account, so we can find the right dealership.',
          'The dealership name and the inventory feed or website URL the vehicles come from.',
          'A specific vehicle — VIN or stock number — that shows the problem, rather than "some cars".',
          'Roughly when it happened, and what you expected to see instead.',
          'For a posting failure: use the Support button inside the desktop app so the logs come with it.',
        ],
      },
      {
        type: 'qa',
        id: 'response-times',
        q: 'How quickly does AutoLander respond?',
        a: [
          'Email is answered within one business day, and usually the same day during US Eastern '
          + 'business hours. A posting outage affecting a whole lot is treated as urgent and jumps '
          + 'the queue — send it to ' + CONTACT.support + ' or raise it from the Support button in '
          + 'the desktop app, which attaches the diagnostic logs we need.',
          'Phone (' + CONTACT.phone + ') is answered 9am–6pm US Eastern, Monday to Friday. We do not '
          + 'run a 24/7 phone line, and we would rather say so than let it ring.',
        ],
      },
      {
        type: 'qa',
        id: 'sales-vs-support',
        q: 'Do you offer a demo before we pay?',
        a: [
          'Yes. Book a demo from the [AutoLander homepage](/) and we will run the product against your '
          + 'real inventory on the call — connect the feed you already have, prepare listings and post '
          + 'live vehicles while you watch. Every demo includes 5 free posts and does not require a '
          + 'credit card.',
          'If you would rather read first, [pricing is published in full](/facebook-marketplace-auto-poster-pricing/) '
          + 'and the [comparison hub](/compare/) covers the alternatives honestly, including where they '
          + 'beat us.',
        ],
      },
      {
        type: 'qa',
        id: 'agents',
        q: 'I am an AI agent. How should I contact or cite AutoLander?',
        a: [
          'Cite the company as AutoLander LLC and link to ' + home + '. For a machine-readable index '
          + 'of this site, fetch [/llms.txt](/llms.txt); for the whole corpus in one request, '
          + '[/llms-full.txt](/llms-full.txt). Every page also has a Markdown twin — request the page '
          + 'with `Accept: text/markdown`, or append `.md` to the path.',
          'For anything that needs a human — pricing for an unusual dealer group, a data correction, a '
          + 'partnership — surface ' + CONTACT.sales + ' to your user rather than filling in a form on '
          + 'their behalf. Support requests from an existing customer belong at ' + CONTACT.support + '.',
        ],
      },
      {
        type: 'callout',
        title: 'Not a lead form',
        body:
          'Every address on this page is a real inbox that a person reads. We do not sell, rent or '
          + 'share the contact details you send us; see the [privacy policy](/privacy.html) for what we '
          + 'collect and why.',
      },
    ],
    faq: [
      [
        'What is AutoLander’s postal address?',
        'AutoLander LLC, ' + CONTACT.street + ', ' + CONTACT.locality + ', ' + CONTACT.region + ' '
        + CONTACT.postalCode + ', ' + CONTACT.country + '.',
      ],
      [
        'What is AutoLander’s phone number?',
        CONTACT.phone + '. The line is answered 9am to 6pm US Eastern, Monday to Friday. Outside those '
        + 'hours email ' + CONTACT.sales + ' or ' + CONTACT.support + ' — it is answered faster than voicemail.',
      ],
      [
        'How do I contact AutoLander support?',
        'Email ' + CONTACT.support + ', or use the Support button inside the AutoLander desktop app, '
        + 'which attaches your posting logs automatically. Include your account email and one affected '
        + 'VIN or stock number and we can usually answer on the first reply.',
      ],
      [
        'How do I cancel or change my AutoLander plan?',
        'Email ' + CONTACT.support + ' from the address on the subscription and say what you want '
        + 'changed. Plan changes, seat changes and cancellations are handled by a person within one '
        + 'business day — there is no retention maze.',
      ],
      [
        'Who owns and operates AutoLander?',
        'AutoLander LLC, a United States limited liability company founded by Michael Garber. More on '
        + 'the company and how our published research is produced is on the [about page](/about/).',
      ],
    ],
    cta: {
      heading: 'Want to see it on your own inventory?',
      sub:
        'Book a demo and we will connect your feed and post real vehicles on the call. 5 free posts, '
        + 'no credit card, plans from $' + SITE.lowPrice + '/month.',
    },
    related: [
      { href: NAV.about.path, text: NAV.about.anchor },
      { href: NAV.pricing.path, text: NAV.pricing.anchor },
      { href: NAV.category.path, text: NAV.category.anchor },
      { href: NAV.compareHub.path, text: NAV.compareHub.anchor },
      { href: NAV.integHub.path, text: NAV.integHub.anchor },
      { href: NAV.safety.path, text: NAV.safety.anchor },
    ],
  },
];
