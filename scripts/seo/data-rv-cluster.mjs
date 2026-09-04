// RV cluster (2026-09-03). /rv-dealer-software/ was a pillar with zero cluster support. These two
// guides give it a selling-side spoke and a photo spoke, both descending back to the pillar and to
// the money pages an RV dealer actually needs. RV facts here are general Marketplace mechanics and
// AutoLander behaviour only — no invented statistics.
//
// Follows the page-object contract in scripts/seo/shell.mjs.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const UPDATED = '2026-09-03';
const rvCrumb = { name: 'RV dealer software', url: SITE.origin + NAV.rvDealers.path };

export const PAGES = [
  // ---------------------------------------------------------------- /guide/how-to-sell-rvs-on-facebook-marketplace/
  {
    key: 'rvSellGuide',
    title: 'How to Sell RVs on Facebook Marketplace as a Dealer (2026)',
    description:
      'How RV dealers sell travel trailers, fifth wheels and motorhomes on Facebook Marketplace: the '
      + 'RV/Camper category, the fields that matter, seasonal pricing and keeping a whole lot current.',
    eyebrow: 'RV dealer guide',
    h1: 'How to sell RVs on Facebook Marketplace as a dealer',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['RV dealers', 'Facebook Marketplace', 'travel trailers', 'motorhomes'] },
    tldr:
      'To sell RVs on Facebook Marketplace as a dealer, list every unit in the RV/Camper category — not as '
      + 'a car — with the RV type, length, sleeping capacity, year, make, model and a real price, led by a '
      + 'clean exterior photo. Buyers filter by type and price and message directly, so the listing that is '
      + 'accurate and answered first usually gets the visit. The hard part is not the first listing; it is '
      + 'keeping thirty to two hundred units current through seasonal repricing and sales, which is the job '
      + 'RV-aware software like AutoLander automates.',
    breadcrumbs: [
      { name: 'Home', url: home },
      rvCrumb,
      { name: 'How to sell RVs on Marketplace', url: SITE.origin + NAV.rvSellGuide.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'Can RV dealers sell on Facebook Marketplace?',
        a: [
          'Yes. Marketplace has a dedicated RV/Camper vehicle category, and eligible dealer accounts list there '
          + 'every day. For most RV dealers it is the strongest free source of local, ready-to-buy traffic they '
          + 'have — buyers browse by RV type, price and distance, and message the seller directly from the listing.',
          'The two things that go wrong are avoidable. The first is posting an RV as a car or a general item, '
          + 'which puts a travel trailer in front of people shopping for sedans and hides it from the people '
          + 'actually looking for one. The second is treating a listing as done once it is posted: RV prices '
          + 'move with the season and units sell, and a lot of stale listings costs a dealer more replies and '
          + 'more trust than no listings at all.',
        ],
      },
      {
        type: 'steps',
        h2: 'Listing an RV on Marketplace, field by field',
        intro: 'The RV/Camper flow asks for different fields than the car flow. Fill every one of them.',
        steps: [
          { title: 'Choose Vehicle for sale, then RV/Camper',
            body: 'This is the field that decides who sees the unit. Travel trailers, fifth wheels, Class A/B/C motorhomes, toy haulers and pop-ups all belong here — never under cars or general items.' },
          { title: 'Pick the RV type',
            body: 'Buyers filter on it. A fifth wheel listed as a travel trailer is a unit the fifth-wheel shopper never finds.' },
          { title: 'Enter year, make, model and length',
            body: 'Length is the first thing a buyer with a tow vehicle or a storage spot checks. Sleeping capacity and slide-outs belong in the description if the fields do not ask.' },
          { title: 'Set the real price',
            body: 'Post the advertised price, and change it the day the lot changes it. Placeholder prices fall outside the filters buyers actually use and read as low quality.' },
          { title: 'Lead with the right photo',
            body: 'A clean three-quarter exterior on a plain background, then the awning side, the interior from the door, the kitchen, the bedroom, the bath and the hitch or cab. The [RV photos guide](/guide/rv-photos-for-facebook-marketplace/) covers what makes a thirty-foot subject read in a thumbnail.' },
          { title: 'Write a description that names the store',
            body: 'Floorplan, length, dry weight, slides, generator, awning, any recent service, and the dealership name, city and hours. Buyers message the profile that posted; make sure it is one somebody checks.' },
        ],
      },
      {
        type: 'bullets',
        h2: 'Why RV lots go stale faster than car lots',
        items: [
          'Seasonal repricing. RV asking prices move with the calendar in a way car prices do not; a spring listing '
          + 'showing last autumn’s number is a common sight and an easy one for a buyer to spot.',
          'Fewer units, longer descriptions. An RV listing carries more fields worth getting right, so each manual '
          + 'edit takes longer and gets postponed longer.',
          'One profile, one person. The listings usually live on a single salesperson’s account. When that person is '
          + 'off, the whole lot’s prices are frozen.',
          'Sold units linger. A fifth wheel that delivered Saturday is still live Monday, and the three buyers who '
          + 'messaged about it are now three people who think the store does not answer.',
        ],
      },
      {
        type: 'qa',
        q: 'How does an RV dealer keep a whole lot current on Marketplace?',
        a: [
          'The same way the website is kept current: treat the inventory feed as the source and let software '
          + 'reconcile Marketplace against it. AutoLander was built with RV feeds as first-class citizens. It reads '
          + 'your inventory source, posts each unit into the RV/Camper category with RV-appropriate details, pushes '
          + 'price changes from the feed, removes sold units automatically, and queues new arrivals — all from your '
          + 'own logged-in session, within the account’s listing limits. The [RV dealer software page]'
          + '(/rv-dealer-software/) covers the workflow; the [inventory sync page](/facebook-marketplace-inventory-sync/) '
          + 'covers the feed cadence.',
          'What it does not do is talk to buyers. Messages arrive in Messenger and your team answers them, as now. '
          + 'AutoLander’s contribution is that the length, price and availability the buyer is asking about are already right.',
        ],
      },
      {
        type: 'callout',
        title: 'Meta’s rules still apply',
        body:
          'Marketplace eligibility, category rules and listing limits are Meta’s, and they change. No tool — '
          + 'including AutoLander — can guarantee an account will never be actioned. The [policy and safety guide]'
          + '(/guide/facebook-marketplace-automation/) is the honest version of what that means for a dealer.',
      },
    ],
    faq: [
      ['Which Marketplace category should an RV dealer use?',
        'RV/Camper, under Vehicle for sale. It has the RV-specific fields and it is the category RV shoppers browse '
        + 'and filter. Posting an RV as a car or a general item hides it from the buyers who want it.'],
      ['Can I list travel trailers, fifth wheels and motorhomes the same way?',
        'Yes — all of them go in RV/Camper, distinguished by the RV type field. Pick the exact type, because buyers '
        + 'filter on it and a mislabeled unit is invisible to the right shopper.'],
      ['How often should RV prices on Marketplace be updated?',
        'The day the lot reprices. Seasonal moves are the norm in RV retail, and a listing showing a stale number is '
        + 'the first thing a returning buyer notices. Software that reads the feed on a schedule removes the '
        + 'dependence on someone remembering.'],
      ['Does AutoLander post RVs as RVs?',
        'Yes. Units from an RV feed post into the RV/Camper category with RV-appropriate details, not as mislabeled '
        + 'cars. Price sync, sold-unit removal and new-arrival queueing work the same as for car inventory.'],
      ['Does AutoLander answer Marketplace messages for RV dealers?',
        'No. AutoLander never touches the inbox — no auto-replies, no message routing. Your team answers buyers in '
        + 'Messenger; AutoLander keeps the listing they are asking about accurate.'],
    ],
    cta: {
      heading: 'See your RV lot on Marketplace, in the right category',
      sub: 'Book a demo and we will post real units from your feed on the call. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },

  // ---------------------------------------------------------------- /guide/rv-photos-for-facebook-marketplace/
  {
    key: 'rvPhotos',
    title: 'RV Photos That Sell on Facebook Marketplace | AutoLander',
    description:
      'How to photograph a travel trailer, fifth wheel or motorhome so it reads in a Marketplace thumbnail: '
      + 'the shot list, the lead photo, and what an AI studio can and cannot fix.',
    eyebrow: 'RV dealer guide',
    h1: 'RV photos that sell on Facebook Marketplace',
    bylineUpdated: true,
    author: true,
    updated: UPDATED,
    article: { datePublished: UPDATED, tags: ['RV photography', 'Facebook Marketplace', 'listing photos', 'AI photo editing'] },
    tldr:
      'An RV photo has to do something a car photo does not: make a thirty-foot subject read clearly in a '
      + 'thumbnail the size of a thumb. That means a lead shot from a three-quarter angle with the whole unit '
      + 'in frame and nothing behind it, followed by a fixed shot list — awning side, interior from the door, '
      + 'kitchen, bedroom, bath, hitch or cab, and the data plate. A clean background is worth more on an RV '
      + 'than on any car, which is why AI background replacement earns its keep here; it cannot fix a crooked '
      + 'horizon, a slide-out left closed, or an interior shot with the lights off.',
    breadcrumbs: [
      { name: 'Home', url: home },
      rvCrumb,
      { name: 'RV photos for Marketplace', url: SITE.origin + NAV.rvPhotos.path },
    ],
    sections: [
      {
        type: 'qa',
        q: 'What makes RV photos different from car photos?',
        a: [
          'Scale and context. A sedan fills a frame from ten feet away and reads as a sedan at any size. A '
          + 'travel trailer photographed from ten feet is a wall of white fiberglass; from fifty feet, with the '
          + 'whole unit in frame, it is a small shape competing with everything behind it — other units, the '
          + 'fence, the sky, the lot. In a Marketplace thumbnail, the background wins that fight unless it is removed.',
          'The second difference is that RV buyers shop the inside as hard as the outside. A car listing can get '
          + 'by on exteriors; an RV listing without the kitchen, the bed and the bath is a listing buyers scroll past, '
          + 'because the floorplan is the purchase.',
        ],
      },
      {
        type: 'steps',
        h2: 'The RV shot list',
        intro: 'Shoot every unit the same way. Consistency across the lot reads as a dealership; variety reads as a classified.',
        steps: [
          { title: 'Lead: front three-quarter, whole unit, plain background',
            body: 'Stand far enough back to get the entire unit with a margin, at the corner that shows the front cap and the entry side. This is the thumbnail. If the background is busy, this is the frame the AI studio fixes first.' },
          { title: 'Awning side, awning out',
            body: 'The living side of the unit is the one buyers picture themselves next to. Extend the awning, open the slides.' },
          { title: 'Interior from the entry door',
            body: 'Lights on, blinds open, slides out. This single frame tells a buyer the floorplan faster than any description.' },
          { title: 'Kitchen, bedroom, bath',
            body: 'One frame each, wide, from the doorway or the far wall. Counters clear, bed made, shower door open.' },
          { title: 'Hitch or cab, and the data plate',
            body: 'Fifth-wheel pin or trailer coupler; for motorhomes, the driver’s seat and dash. The data plate with model and dry weight saves a dozen questions.' },
          { title: 'Odometer or hour meter, where there is one',
            body: 'Motorhomes and generators. Photograph the real number; never guess mileage in the listing, and leave it blank if it is unknown.' },
        ],
      },
      {
        type: 'bullets',
        h2: 'What an AI photo studio fixes on an RV, and what it does not',
        intro:
          'AutoLander’s [AI photo editor](/ai-car-photo-editor/) classifies every frame and replaces the background '
          + 'on full-exterior shots only, leaving interiors and closeups alone. On RVs that is exactly the right '
          + 'division of labour:',
        items: [
          'Fixes: the busy lot behind the lead shot. A thirty-foot unit on a clean studio background is the difference '
          + 'between a thumbnail that reads and one that does not.',
          'Fixes: inconsistency across the lot. Fifty units shot on fifty days in fifty kinds of weather come out '
          + 'looking like one dealership.',
          'Does not fix: a crooked horizon, a closed slide-out, an awning left in, or an interior shot taken with the '
          + 'lights off. Shoot it right; the studio makes it consistent.',
          'Does not fix — and will not attempt: the colour of the unit. AutoLander never repaints a vehicle; the photo '
          + 'shows the RV the buyer will see on the lot.',
        ],
      },
      {
        type: 'qa',
        q: 'How many photos should an RV listing have?',
        a: [
          'Enough to answer the floorplan question without a message: the six-to-eight frames above is the floor, '
          + 'and a full walk-through of twelve to fifteen is common for a higher-value unit. The order matters more '
          + 'than the count. Lead with the exterior that reads in a thumbnail, put the interior-from-the-door second, '
          + 'and keep the data plate and odometer at the end for the buyer who is already serious.',
          'On a whole lot, the question is not how many photos per unit but whether every unit has the same set. '
          + 'That is a process problem, and it is why RV dealers using [RV dealer software](/rv-dealer-software/) '
          + 'tend to shoot to a checklist and let the software handle presentation and posting.',
        ],
      },
    ],
    faq: [
      ['What is the best lead photo for an RV listing?',
        'A front three-quarter shot with the entire unit in frame, a margin around it, and a plain background. It is '
        + 'the frame that becomes the Marketplace thumbnail, and on an RV the background decides whether the unit '
        + 'reads at that size.'],
      ['Should RV listings include interior photos?',
        'Always. RV buyers shop the floorplan. The interior from the entry door, the kitchen, the bedroom and the bath '
        + 'are the frames that stop a scroll; a listing without them gets skipped for one that has them.'],
      ['Does AI background replacement work on RVs?',
        'Yes. AutoLander’s studio handles large subjects like travel trailers and motorhomes, replacing the background '
        + 'on full-exterior shots while leaving interiors untouched, and never changes the unit’s colour.'],
      ['Do I need a professional photographer for RV listings?',
        'No. A phone, a consistent shot list, slides out, lights on and a clean background — or an AI studio that '
        + 'supplies one — produce listings that read as a dealership. What a professional adds is consistency, and '
        + 'a checklist gets most of that.'],
    ],
    cta: {
      heading: 'See a real RV lot, studio-processed and posted',
      sub: 'Book a demo and we will run your own units through the studio on the call. 5 free posts, no credit card, from $39/mo.',
    },
    relatedHeading: 'Keep exploring',
  },
];
