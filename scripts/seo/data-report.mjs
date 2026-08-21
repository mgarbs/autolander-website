// The Facebook Marketplace Used-Car Report 2026 — AutoLander's original-data study.
// PURPOSE: the site's citable asset. Every number below was computed 2026-08-21 from anonymized,
// aggregate production data (readonly-report-stats probe; SELECT-only). NO fabricated stats — if a
// metric could not be verified it was excluded (e.g. days-to-sold). Update numbers only from a
// fresh probe run. N and methodology are stated on-page. Guest posts cite THIS page.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';

export const PAGES = [
  {
    key: 'report2026',
    title: 'Facebook Marketplace Used-Car Report 2026 | AutoLander',
    description:
      'Original data from 196 dealerships and 10,800+ dealer listings on Facebook Marketplace: median '
      + 'prices, mileage, top models and posting patterns.',
    ogType: 'article',
    eyebrow: 'Original research',
    h1: 'The Facebook Marketplace Used-Car Report 2026',
    bylineUpdated: true,
    tldr:
      'AutoLander analyzed anonymized data from 196 U.S. dealerships using its platform — 74,000+ synced '
      + 'vehicles and 10,823 priced dealer listings posted to Facebook Marketplace, including 17,700+ '
      + 'posts in the last 90 days. Headline findings: the median asking price of a dealer unit posted to '
      + 'Marketplace is $28,295; 45% of posted units are priced above $30,000; the five most-listed '
      + 'vehicles are all pickups and 4x4s, led by the Ford F-150; 22.6% of listings change price after '
      + 'going live; and Thursday is the biggest day for new dealer listings — 3.3× busier than Sunday.',
    breadcrumbs: [
      { name: 'Home', url: home },
      { name: 'Car dealership marketing', url: SITE.origin + NAV.mktgHub.path },
      { name: 'Marketplace Report 2026', url: SITE.origin + NAV.report2026.path },
    ],
    sections: [
      {
        type: 'prose',
        paras: [
          'Facebook Marketplace has become a primary destination for local used-car shopping, but almost '
          + 'all public commentary about it is anecdote. This report replaces anecdote with numbers: '
          + 'anonymized, aggregate data from the dealerships that post their inventory to Marketplace '
          + 'through [AutoLander](/), covering what dealers actually list, at what prices and mileage, '
          + 'which models dominate, and when listings go live.',
          'Every figure on this page was computed directly from platform data on August 21, 2026. '
          + 'Methodology and sample sizes are at the bottom; media and researchers are welcome to cite '
          + 'this report with attribution.',
        ],
      },
      {
        type: 'table',
        h2: 'Headline numbers',
        head: ['Metric', 'Value', 'Base'],
        rows: [
          ['Median asking price, dealer units posted to Marketplace', '$28,295', '10,823 priced listings'],
          ['Middle 50% of asking prices', '$19,199 – $42,000', '10,823 priced listings'],
          ['Share of posted units priced $30,000+', '45%', '10,823 priced listings'],
          ['Median mileage', '50,534 miles', 'Posted units with known mileage'],
          ['Median model year', '2023', 'Posted units'],
          ['Listings that changed price after going live', '22.6%', '10,798 comparable listings'],
          ['Busiest listing day', 'Thursday (3.3× Sunday volume)', '17,778 posts, last 90 days'],
          ['Dealerships in sample', '196', 'U.S. rooftops on AutoLander'],
        ],
        note: 'Aggregates from anonymized AutoLander platform data, computed August 21, 2026.',
      },
      {
        type: 'qa',
        q: 'What does a dealer car on Facebook Marketplace actually cost?',
        a: [
          'More than the platform’s garage-sale reputation suggests. The median asking price across 10,823 '
          + 'priced dealer listings is $28,295, and the middle half of the market sits between $19,199 and '
          + '$42,000. Only 6.6% of posted units are priced under $10,000 — while 45% are priced above '
          + '$30,000. Dealers are not using Marketplace to clear beaters; they are merchandising late-model '
          + 'retail inventory (median model year: 2023, median mileage: 50,534).',
        ],
      },
      {
        type: 'table',
        h2: 'Price bands: where dealer Marketplace inventory sits',
        head: ['Asking price', 'Share of posted units', 'Count'],
        rows: [
          ['Under $10,000', '6.6%', '714'],
          ['$10,000 – $19,999', '21.1%', '2,283'],
          ['$20,000 – $29,999', '26.9%', '2,907'],
          ['$30,000 and up', '45.4%', '4,919'],
        ],
        note: 'n = 10,823 dealer listings with a stated price above $500.',
      },
      {
        type: 'qa',
        q: 'What are the most-listed vehicles on Facebook Marketplace?',
        a: [
          'Trucks — by a wide margin. The five most-posted models by dealers on the platform are the Ford '
          + 'F-150, Chevrolet Silverado 1500, Ram 1500, Jeep Wrangler and GMC Sierra 1500. Exactly one '
          + 'sedan cracks the top ten: the Toyota Camry, in tenth place. If you sell trucks and SUVs, '
          + 'Marketplace is where your competition already lists them.',
        ],
      },
      {
        type: 'table',
        h2: 'Top 10 most-listed models (dealer listings)',
        head: ['Rank', 'Vehicle', 'Listings'],
        rows: [
          ['1', 'Ford F-150', '370'],
          ['2', 'Chevrolet Silverado 1500', '304'],
          ['3', 'Ram 1500', '283'],
          ['4', 'Jeep Wrangler', '194'],
          ['5', 'GMC Sierra 1500', '185'],
          ['6', 'Toyota Tacoma', '144'],
          ['7', 'Ram 2500', '141'],
          ['8 (tie)', 'Jeep Grand Cherokee', '141'],
          ['9 (tie)', 'Chevrolet Equinox', '141'],
          ['10', 'Toyota Camry', '139'],
        ],
        note: 'Among 10,850 dealer units posted to Marketplace through AutoLander.',
      },
      {
        type: 'qa',
        q: 'How often do dealers change the price after a listing goes live?',
        a: [
          'Constantly: 22.6% of posted listings — 2,443 of 10,798 with comparable data — carried a '
          + 'different price later than the price they were posted at. That churn is why stale listings '
          + 'are endemic on Marketplace: a price cut made in the DMS does not update a listing by itself. '
          + 'It is also the argument for [automatic inventory sync](/facebook-marketplace-inventory-sync/): '
          + 'the ad has to follow the price, or the showroom conversation starts with an apology.',
        ],
      },
      {
        type: 'qa',
        q: 'When do dealers post to Facebook Marketplace?',
        a: [
          'Midweek. Thursday is the single biggest day for new dealer listings (17.5% of the last 90 days’ '
          + '17,778 posts), with Monday through Friday all running hot and volume collapsing on the '
          + 'weekend — Sunday sees 3.3× fewer new dealer listings than Thursday. The practical read for '
          + 'dealers: weekend shoppers are browsing midweek inventory, so a store that lists on Saturday '
          + 'and Sunday competes against the platform’s thinnest supply of the week.',
        ],
      },
      {
        type: 'table',
        h2: 'New dealer listings by day of week (last 90 days)',
        head: ['Day', 'Posts', 'Share'],
        rows: [
          ['Monday', '2,919', '16.4%'],
          ['Tuesday', '2,902', '16.3%'],
          ['Wednesday', '3,017', '17.0%'],
          ['Thursday', '3,118', '17.5%'],
          ['Friday', '2,830', '15.9%'],
          ['Saturday', '2,036', '11.5%'],
          ['Sunday', '956', '5.4%'],
        ],
        note: 'n = 17,778 dealer listings posted in the 90 days ending August 21, 2026.',
      },
      {
        type: 'qa',
        q: 'How much AI is in dealer listings now?',
        a: [
          'A meaningful and growing amount on the photo side: dealerships on the platform have run 94,000+ '
          + 'listing photos through [AI background replacement](/ai-car-photo-editor/) across 3,237 '
          + 'processing jobs, turning lot shots and watermarked feed photos into showroom-style images. '
          + 'AI-generated walkaround video is earlier on the curve, with the first deliveries now in '
          + 'production use.',
        ],
      },
      {
        type: 'callout',
        title: 'How to cite this report',
        body: 'Cite as: AutoLander, "The Facebook Marketplace Used-Car Report 2026," autolander.ai, August '
          + '2026 — with a link to this page. Journalists and bloggers may reproduce individual statistics '
          + 'and tables with attribution. For questions about the data, contact sales@autolander.ai.',
      },
      {
        type: 'qa',
        q: 'Methodology',
        a: [
          'Source: anonymized, aggregate production data from the AutoLander platform, computed August 21, '
          + '2026. Sample: 196 U.S. dealerships operating 316 inventory feeds; 74,013 synced vehicles; '
          + '10,850 units posted to Facebook Marketplace, of which 10,823 carried a stated price above '
          + '$500 (the base for price statistics). Posting-volume figures cover the trailing 90 days '
          + '(n = 17,778). Medians are computed as true percentiles, not averages. No dealer-identifying '
          + 'information is included, and no figure is estimated or extrapolated — metrics that could not '
          + 'be verified from platform data were omitted.',
        ],
      },
    ],
    faq: [
      ['What is the average price of a dealer car on Facebook Marketplace?',
        'The median asking price is $28,295, based on 10,823 priced dealer listings posted through AutoLander (data computed August 2026). The middle half of listings sits between $19,199 and $42,000.'],
      ['What is the most-listed vehicle on Facebook Marketplace by dealers?',
        'The Ford F-150. Trucks dominate: F-150, Silverado 1500, Ram 1500, Wrangler and Sierra 1500 are the five most-posted models, and the Toyota Camry is the only sedan in the top ten.'],
      ['What day do most dealer listings go live on Facebook Marketplace?',
        'Thursday — 17.5% of dealer posts in the trailing 90 days — with Sunday the quietest day at 3.3× less volume. Weekend shoppers largely browse inventory listed midweek.'],
      ['Can I use these statistics in my article?',
        'Yes — cite "AutoLander, Facebook Marketplace Used-Car Report 2026" and link this page. The full citation format is in the "How to cite" section above.'],
      ['Where does the data come from?',
        'Anonymized aggregates from 196 U.S. dealerships that post inventory to Facebook Marketplace through the [AutoLander](/) platform — real listings, real prices, no surveys and no estimates. Full details are in the Methodology section.'],
    ],
    cta: {
      heading: 'Put your inventory where this data says the buyers are',
      sub: 'AutoLander posts your whole lot to Facebook Marketplace, keeps prices synced and photos showroom-grade — from $39/mo.',
    },
    relatedHeading: 'Act on the data',
  },
];
