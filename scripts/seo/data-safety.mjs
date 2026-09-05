// SAFETY page — targets account-safety intent for the Facebook Marketplace auto-poster
// category: "safest facebook marketplace auto poster", "...without getting banned",
// "facebook marketplace account safety", "native desktop app". Tone mirrors GUIDE/SESSION_FAQ
// in compare-data.mjs: honest, fair, NON-GUARANTEE. This page MUST NOT promise safety from bans.
// The safest policy posture is manual use within Meta's current terms, eligibility rules and limits.
//
// Written to the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const canonical = SITE.origin + NAV.safety.path;

const SOFTWARE_DESC =
  'AutoLander is a native desktop app that auto-posts car dealership inventory to Facebook '
  + 'Marketplace from your own computer and normal Facebook session, with a configurable queue and '
  + 'local session storage. Meta account eligibility, listing limits and enforcement still apply.';

export const PAGES = [
  {
    key: 'safety',
    title: 'Safest Facebook Marketplace Auto Poster? | AutoLander',
    description:
      'Compare Facebook Marketplace auto-poster safety models, account risks and warning signs. Learn why no '
      + 'automation tool can guarantee against bans.',
    ogType: 'article',
    eyebrow: 'Account safety, honestly',
    h1: 'The safest way to use a Facebook Marketplace auto poster',
    bylineUpdated: true,
    tldr:
      'No Facebook Marketplace auto poster can guarantee account safety or listing approval. Meta’s Terms '
      + 'prohibit accessing or collecting data from its products through automated means without prior '
      + 'permission, and Marketplace eligibility, features and limits can change by account or market. '
      + 'AutoLander is a native desktop app with local session storage and a configurable posting queue, '
      + 'but that architecture does not create Meta permission or override Meta’s rules. Review the '
      + '[current dealer posting guide](/guide/how-to-sell-cars-on-facebook-marketplace/) before using any tool.',
    softwareDesc: SOFTWARE_DESC,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Facebook Marketplace auto poster', url: SITE.origin + NAV.category.path },
      { name: 'Account safety', url: SITE.origin + NAV.safety.path },
    ],
    sections: [
      {
        type: 'figure',
        before: '/studio/jeep-renegade-before.webp',
        after: '/studio/jeep-renegade-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2019 Jeep Renegade before AutoLander',
        afterAlt: 'The same 2019 Jeep Renegade as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
        caption: 'Enhanced on your own machine: AutoLander turns a raw 2019 Jeep Renegade lot photo (left) into a showroom-grade Marketplace listing (right).',
      },
      {
        type: 'qa',
        q: 'What is the safest way to auto-post to Facebook Marketplace?',
        a: [
          'The lowest-risk answer is manual posting that follows Meta’s current Terms, Marketplace eligibility '
          + 'rules and account-specific limits. Meta’s Terms prohibit automated access or data collection without '
          + 'prior permission. A vendor cannot turn an unapproved workflow into an approved one simply by calling '
          + 'it a desktop app, integration or dealer tool.',
          'If you evaluate automation, verify what the product does, where credentials and session data are stored, '
          + 'whether Meta has granted permission for the exact workflow, and what controls let you stop or review '
          + 'activity. AutoLander cannot guarantee safety, approval or continued access. Our '
          + '[dealer posting guide](/guide/how-to-sell-cars-on-facebook-marketplace/) explains the current limits '
          + 'and a practical manual-review workflow.',
        ],
      },
      {
        type: 'qa',
        q: 'What does AutoLander’s native desktop architecture change?',
        a: [
          'AutoLander is a native desktop app, which means it posts from your own computer, through your normal '
          + 'Facebook session, with session data kept locally rather than operated from AutoLander’s cloud. It also '
          + 'uses a configurable queue so the dealer can choose which eligible vehicles are prepared for posting.',
          'Those are product-architecture facts, not claims of Meta approval. A local session, queue setting or '
          + 'posting schedule does not bypass Meta limits, grant API access or guarantee that a listing or account '
          + 'will remain available. Dealers remain responsible for confirming eligibility and following the terms '
          + 'and limits shown in their own Marketplace account.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Facebook Marketplace account-safety checks for car dealers',
        intro: 'Use this policy-first checklist before posting vehicles or enabling any automation:',
        items: [
          'Read Meta’s current Terms and Marketplace Help Center guidance; features, eligibility and limits can vary or change.',
          '[Meta says Marketplace is intended for consumers](https://www.facebook.com/help/1968285150185577) and that businesses that list there may be blocked or have listings removed. Confirm permission for the dealership’s exact workflow.',
          'Meta’s Help Center currently says sellers may create up to 5 new Vehicles listings per calendar month and 20 new listings total per calendar month. The limits shown in your account control.',
          'Confirm that every vehicle is eligible and that its price, mileage, condition, availability and photos are accurate before publishing.',
          'Do not share your Facebook password with a vendor. Ask exactly where credentials, cookies and session data are stored and how access is revoked.',
          'Treat claims such as “ban-proof,” “100% safe” or “Meta-approved” as unverified unless the vendor can document Meta’s permission for the exact workflow.',
          'Keep a person responsible for reviewing queued vehicles, monitoring account notices and stopping the workflow if Meta changes access or requirements.',
        ],
      },
      {
        type: 'callout',
        title: 'What AutoLander can and cannot promise',
        body: 'AutoLander cannot and does not guarantee that you will not be banned or restricted — no honest '
          + 'vendor can, and anyone claiming "100% safe," "ban-proof," or "Meta-approved" personal-profile '
          + 'automation should provide evidence of permission for the exact workflow. AutoLander keeps its session '
          + 'local and provides queue controls, but it cannot override Meta’s account eligibility, monthly listing '
          + 'limits, review decisions or policy enforcement. Dealers must review and follow the rules shown by Meta.',
      },
      {
        type: 'bullets',
        h2: 'Questions to ask any Facebook Marketplace vendor',
        intro: 'Before you trust any tool with your dealership’s Facebook account, get straight answers to these:',
        items: [
          'What exact actions does the product perform, and has Meta granted permission for that specific automated workflow?',
          'Where are my Facebook credentials, cookies and session data stored, and how can I revoke access?',
          'How does the product respond when my account reaches a listing limit, loses Marketplace eligibility or receives a review notice?',
          'Can I review, pause and remove vehicles from the queue before any Marketplace action occurs?',
          'If I cancel, do my listings and account access stay intact, or do they disappear with the subscription?',
          'Does the vendor clearly state that it cannot override Meta limits or guarantee account safety and listing approval?',
        ],
      },
      {
        type: 'qa',
        q: 'So is AutoLander the "safest" Facebook Marketplace auto poster?',
        a: [
          'AutoLander’s native-desktop model keeps session data on the dealer’s machine and provides a configurable '
          + 'vehicle queue. That may be useful when comparing product architecture, but it is not evidence that Meta '
          + 'has approved the workflow and it does not make AutoLander categorically safer than every alternative.',
          'The safest policy posture is manual use within Meta’s current rules. If you choose software, verify '
          + 'permission, protect credentials, review every queued vehicle and stop when your account reaches its '
          + 'limit or loses eligibility. Read the '
          + '[current dealer posting guide](/guide/how-to-sell-cars-on-facebook-marketplace/) for the full checklist.',
        ],
      },
    ],
    faq: [
      ['Is there a Facebook Marketplace auto poster that is 100% safe from bans?',
        'No. No vendor can guarantee account safety, continued Marketplace eligibility or listing approval. Meta’s Terms prohibit unauthorized automated access, and Meta can change product features, limits and enforcement. Ask for evidence before accepting any claim that a workflow is Meta-approved.'],
      ['Will AutoLander get my Facebook account banned?',
        'AutoLander cannot guarantee that your account will not be restricted or that a listing will be approved. It keeps session data locally and uses a configurable vehicle queue, but those architecture choices do not create Meta permission or override account eligibility, listing limits or enforcement.'],
      ['Is a cloud tool or a desktop app safer for Facebook Marketplace posting?',
        'Neither architecture is automatically safe or approved. A cloud service and a desktop app store and operate session data differently, so ask where credentials and cookies are kept and how access is revoked. Regardless of architecture, Meta’s terms, eligibility rules and account-specific limits still apply.'],
      ['Is automating Facebook Marketplace against the rules?',
        'Meta’s Terms prohibit accessing or collecting data from its products using automated means without prior permission. Whether a particular workflow is permitted depends on Meta’s permission and current product rules; a vendor’s marketing claim is not proof. Review Meta’s current terms before using any automation.'],
      ['Why does a native desktop app lower ban risk versus a browser extension?',
        'They drive the Facebook session differently, and the page can see the difference. A browser extension fills the listing form from a content script, so every keystroke and click it fires reaches Facebook as a synthetic event (isTrusted: false); only the browser’s own input pipeline can produce a trusted event, and an extension has no route to it short of the debugger API, which shows an automation banner. Extensions also run under Manifest V3 limits (the background worker is suspended after about thirty seconds idle, and Chrome throttles timers in tabs that are not in front), share one profile with every other extension and cookie on the machine, and wait on Chrome Web Store review for fixes when Facebook changes the form. AutoLander launches its own dedicated browser profile and drives it through the operating system’s input pipeline with a humanized cadence, owns the process so pacing holds whether or not the window is in front, persists the profile so an antibot challenge is solved once, reads every dropdown back after selecting it, and ships fixes itself within hours. We still do not claim any of this guarantees lower ban risk: Meta’s permission, eligibility rules, listing limits and enforcement apply regardless of architecture, and bad pacing on a fresh account beats any architecture. The [extension-vs-desktop section of the comparison](/compare/#extension-vs-desktop) lays out the questions to ask any vendor.'],
      ['What is the single most important thing I can do to protect my dealership’s Facebook account?',
        'Follow Meta’s current Terms and the eligibility and limits displayed in the account. Keep credentials private, verify every vehicle’s accuracy, review queued activity, monitor Meta notices and stop if access or requirements change. AutoLander cannot override those rules or guarantee account safety.'],
    ],
    cta: {
      heading: 'Want the native-app approach?',
      sub: 'See how AutoLander keeps your Facebook session on your own machine — and book a demo.',
    },
    relatedHeading: 'Read this before you automate',
    schema: {
      software: SOFTWARE_DESC,
    },
  },
];
