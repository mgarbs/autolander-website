// /about/ — the author + publisher entity page.
//
// PURPOSE: this page exists to make AutoLander's research attributable. Answer engines and
// journalists both weight named, credentialed authorship, and the report's Article/Dataset nodes
// reference a Person by @id — that @id has to resolve to a real page. Keep everything here
// strictly factual and verifiable; an about page that overclaims is worse than none.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';

export const PAGES = [
  {
    key: 'about',
    title: 'About AutoLander | Who we are & how our data is made',
    description:
      'Who builds AutoLander, what the platform does, and how the figures in our published research '
      + 'are produced — sourcing, method and media contact.',
    eyebrow: 'About',
    h1: 'About AutoLander',
    bylineUpdated: true,
    author: true,
    tldr:
      'AutoLander is Facebook Marketplace software for U.S. car dealerships, built and operated by '
      + 'AutoLander LLC. Dealers connect an inventory feed; the platform posts vehicles to Marketplace, '
      + 'keeps prices current, removes sold units and runs AI photo editing on listing images. Our '
      + 'published research is written by founder Michael Garber and computed directly from anonymized, '
      + 'aggregate platform data — never from surveys or estimates.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'About', url: SITE.origin + '/about/' },
    ],
    sections: [
      {
        type: 'prose',
        paras: [
          'AutoLander LLC builds and operates AutoLander, a desktop application and cloud platform that '
          + 'car dealerships use to merchandise their inventory on Facebook Marketplace. A dealer connects '
          + 'the inventory source they already run — a DMS export, an SFTP or CSV feed, or their dealer '
          + 'website — and the platform handles the rest: creating listings, keeping asking prices in step '
          + 'with the feed, pulling sold units down, and preparing photos.',
          'We publish original research about the dealer side of Facebook Marketplace because almost '
          + 'nothing accurate exists in public. Our figures come from the platform itself, and we say '
          + 'exactly where each one comes from.',
        ],
      },
      {
        type: 'qa',
        id: 'author',
        q: 'Who writes AutoLander’s research?',
        a: [
          'Michael Garber, founder of AutoLander LLC. He built the platform the data comes from and runs '
          + 'it day to day, which is the whole of the claim to authority here — the numbers are not '
          + 'reported second-hand from an industry survey, they are computed from the production system '
          + 'he operates.',
          'For data questions, corrections or media enquiries: sales@autolander.ai, or (919) 280-0967.',
        ],
      },
      {
        type: 'qa',
        id: 'how-data-is-produced',
        q: 'How is the data in your reports produced?',
        a: [
          'Every published figure is computed by direct, read-only aggregation over anonymized production '
          + 'records — real dealer listings, real asking prices, real post timestamps. No surveys, no '
          + 'panel data, no modelling and no extrapolation. Medians are true percentiles rather than '
          + 'averages, because a handful of six-figure units would otherwise distort every price statistic.',
          'Sample sizes are stated next to each table. Where a metric could not be verified from platform '
          + 'data, it is omitted rather than estimated. No dealer-identifying information appears in any '
          + 'published aggregate.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What the platform covers',
        intro: 'The figures in our research are drawn from this footprint.',
        items: [
          '196 U.S. dealership rooftops operating 316 inventory feeds',
          '74,013 synced vehicles across those feeds',
          '10,850 units posted to Facebook Marketplace, 10,823 of them carrying a stated price',
          '17,778 new dealer listings in the trailing 90 days',
          '94,000+ listing photos processed through AI background replacement',
        ],
      },
      {
        type: 'qa',
        id: 'reuse',
        q: 'Can I quote your data?',
        a: [
          'Yes. Our published datasets are released under a [CC BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/) '
          + '— free to reuse, including commercially, with attribution. Machine-readable CSV and JSON '
          + 'copies sit on the report page itself, so you do not have to retype anything out of a table.',
          'Cite as: AutoLander, "The Facebook Marketplace Used-Car Report 2026," autolander.ai, August 2026, '
          + 'with a link to [the report](/facebook-marketplace-used-car-report-2026/). If you need a figure '
          + 'we have not published, ask — we would rather compute it properly than have it guessed at.',
        ],
      },
      {
        type: 'qa',
        id: 'trademarks',
        q: 'What is AutoLander’s relationship to Meta?',
        a: [
          'None. AutoLander is an independent product and is not affiliated with, endorsed by or '
          + 'sponsored by Meta Platforms, Inc. Facebook and Facebook Marketplace are trademarks of Meta '
          + 'Platforms, Inc. AutoLander does not override Meta eligibility rules, listing limits or terms '
          + '— see our [policy and safety guide](/guide/facebook-marketplace-automation/) for what that '
          + 'means in practice.',
        ],
      },
    ],
    faq: [
      [
        'Who is behind AutoLander?',
        'AutoLander is built and operated by AutoLander LLC. Its founder, Michael Garber, writes the '
        + 'company’s published research and can be reached at sales@autolander.ai or (919) 280-0967.',
      ],
      [
        'Where do AutoLander’s statistics come from?',
        'Anonymized, aggregate production data from the AutoLander platform — 196 U.S. dealerships '
        + 'posting real inventory to Facebook Marketplace. Figures are computed by direct read-only '
        + 'aggregation, never from surveys or estimates, and sample sizes are published alongside them.',
      ],
      [
        'Can journalists use AutoLander’s data?',
        'Yes, under CC BY 4.0 with attribution and a link to the source report. CSV and JSON copies are '
        + 'published on the report page. For questions or a figure we have not published, contact '
        + 'sales@autolander.ai.',
      ],
      [
        'Is AutoLander affiliated with Facebook or Meta?',
        'No. AutoLander is independent and is not affiliated with, endorsed by or sponsored by Meta '
        + 'Platforms, Inc. Facebook and Facebook Marketplace are trademarks of Meta Platforms, Inc.',
      ],
    ],
    cta: {
      heading: 'See what AutoLander does for a dealership',
      sub: 'Connect your inventory feed and post your whole lot to Facebook Marketplace — from $39/mo.',
    },
    related: [
      { href: NAV.report2026.path, text: NAV.report2026.anchor },
      { href: NAV.category.path, text: NAV.category.anchor },
      { href: NAV.dealers.path, text: NAV.dealers.anchor },
      { href: NAV.integHub.path, text: NAV.integHub.anchor },
      { href: NAV.pricing.path, text: NAV.pricing.anchor },
      { href: NAV.guide.path, text: NAV.guide.anchor },
    ],
  },
];
