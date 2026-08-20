// Dealer-growth silo — informational hub + spokes (2026-08-20).
// Persona targets (verified >100/mo, mostly Easy KD): car dealership marketing (+ideas/strategies),
// car sales leads (+app), lead generation for car dealers, social media for car dealers/dealerships,
// (how to) sell more cars, ai for car dealerships. Every spoke funnels DOWN to a money page
// (AI chat, AI photo editor, auto poster category) and every page CTAs to the homepage /#pricing.
// Follows the page-object contract in scripts/seo/shell.mjs. Static, NO pixel, no fabricated stats.

import { SITE, NAV } from './registry.mjs';

const home = SITE.origin + '/';
const hubCrumb = { name: 'Car dealership marketing', url: SITE.origin + NAV.mktgHub.path };

export const PAGES = [

  // ---------------------------------------------------------------- HUB: /guide/car-dealership-marketing/
  {
    key: 'mktgHub',
    title: 'Car Dealership Marketing: The 2026 Playbook | AutoLander',
    description:
      'Car dealership marketing in 2026: where buyers actually shop, which channels are worth paying for, '
      + 'and a 7-step playbook you can run without an agency.',
    eyebrow: 'Dealer growth guide',
    h1: 'Car dealership marketing: the 2026 playbook',
    bylineUpdated: true,
    tldr:
      'Car dealership marketing is the work of putting your actual inventory in front of people who are '
      + 'ready to buy a car, making each vehicle look worth the money, and answering interested buyers fast. '
      + 'In 2026 the highest-intent free channel for used inventory is Facebook Marketplace, followed by '
      + 'Google (your Business Profile and reviews) and your own website. Paid channels work only after '
      + 'those three are handled.',
    breadcrumbs: [{ name: 'Home', url: home }, hubCrumb],
    sections: [
      {
        type: 'qa',
        q: 'What is car dealership marketing?',
        a: [
          'Car dealership marketing is everything a dealership does to get in-market buyers to see its '
          + 'inventory, trust the store, and make contact — listings, photos, ads, reviews, social posts, '
          + 'email and follow-up. It has exactly three jobs: be visible where buyers already shop, make every '
          + 'vehicle look worth the asking price, and respond before the buyer moves on to the next listing.',
          'Most dealership marketing fails at job one. Buyers are not browsing your website first — they are '
          + 'searching Facebook Marketplace, Google, and the big listing portals. Marketing that starts '
          + 'anywhere other than "where do buyers already look" is decoration.',
        ],
      },
      {
        type: 'table',
        h2: 'Where car buyers actually look in 2026',
        intro: 'Rank channels by buyer intent first, cost second. High intent + low cost is where an independent store wins.',
        head: ['Channel', 'Buyer intent', 'Cost', 'The job it does'],
        rows: [
          ['Facebook Marketplace', 'Very high — people filter by car, price, distance', 'Free to list', 'Puts every unit in front of local ready-to-buy shoppers'],
          ['Google Business Profile + reviews', 'High — "used car dealer near me" searches', 'Free', 'Wins the trust check almost every buyer runs on your name'],
          ['Your website + SEO', 'High — buyers verify the car and the store', 'Low', 'Converts lookers into calls, texts and credit apps'],
          ['Listing portals (CarGurus, Cars.com, AutoTrader)', 'Very high', 'Paid packages', 'Reach beyond your zip code; price-competition pressure'],
          ['Paid social & search ads', 'Medium — interrupts rather than answers', 'Paid, auction', 'Retargeting lot visitors and pushing aged units'],
          ['Email / SMS to your own list', 'Medium-high — past customers and leads', 'Near zero', 'Repeat sales, service-to-sales, referrals'],
        ],
        note: 'Intent ranking reflects how each channel is used: Marketplace and portals are where buyers search inventory; ads interrupt people who were not searching.',
      },
      {
        type: 'steps',
        h2: 'The 7-step dealership marketing playbook',
        intro: 'Run these in order. Each step compounds the one before it.',
        steps: [
          { title: 'Get every unit on Facebook Marketplace, every day', body: 'It is the largest pool of local used-car buyers and listing is free. Posting a full inventory by hand takes hours, which is why most stores list a fraction of their units — a [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) keeps the whole lot live without hiring for it.' },
          { title: 'Fix the photos before you spend a dollar on ads', body: 'Buyers scroll past dark, cluttered lot shots. Clean, consistent, showroom-grade photos raise clicks on the same car at the same price — an [AI car photo editor](/ai-car-photo-editor/) does it automatically from your existing feed photos.' },
          { title: 'Answer in seconds, not hours', body: 'Marketplace buyers message five dealers at once and buy from the one who answers. If nobody covers the inbox nights and weekends, [AI chat for car dealers](/ai-chat-for-car-dealers/) replies instantly, answers vehicle questions and books the appointment.' },
          { title: 'Own your Google Business Profile', body: 'Claim it, fill every field, add lot photos, and ask every happy buyer for a review the day they take delivery. Reviews are the single cheapest trust signal in car retail.' },
          { title: 'Make your website prove the car', body: 'Fast pages, real photos, a price, a payment estimator and a one-tap way to text the store. Every extra form field costs you leads.' },
          { title: 'Spend paid dollars only on aged units and retargeting', body: 'Ads work when they have a specific job: move the 60-day-old truck, re-catch the shopper who viewed a VDP. Broad "brand awareness" spend is where dealership ad budgets go to die.' },
          { title: 'Track posts to sales, then double down', body: 'If you cannot say which channel sold last month’s cars, you cannot allocate next month’s budget. AutoLander’s post-to-sale attribution shows which Marketplace listings actually turned into sold units.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/toyota-tundra-before.webp',
        after: '/studio/toyota-tundra-after.webp',
        beforeAlt: 'Raw dealership feed photo of a 2025 Toyota Tundra TRD Pro before AutoLander',
        afterAlt: 'The same 2025 Toyota Tundra composited in front of the dealership storefront by AutoLander’s AI Photo Studio',
        caption: 'Merchandising is marketing: AutoLander’s AI Photo Studio turns a raw feed photo (left) into a branded storefront shot (right) — the dealership’s own building behind every listing.',
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Rules independent dealers can win with',
        items: [
          'Fish where the fish are: a free Marketplace listing seen by 500 local shoppers beats a paid impression seen by nobody in-market.',
          'Every car, every channel, every day — coverage beats cleverness. See [bulk posting](/bulk-post-cars-to-facebook-marketplace/) to keep the whole lot live.',
          'Photos are the ad. The listing photo does more selling than the headline, the description and the ad budget combined.',
          'Speed is a feature: the store that answers first gets the test drive. See [how to get more car sales leads](/guide/car-sales-leads/).',
          'Sold cars still advertised burn trust — automatic [inventory sync](/facebook-marketplace-inventory-sync/) removes them before a buyer drives out for a ghost.',
          'Your past customers are your cheapest future customers. Text them at trade-in equity moments, not just birthdays.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'No channel fixes overpriced inventory or bad photos. Marketing multiplies what the merchandising '
          + 'already says — get the [photos](/ai-car-photo-editor/), price and response speed right, then scale '
          + 'the channels. And keep automation inside the rules: see the [Marketplace policy and safety guide](/guide/facebook-marketplace-automation/).',
      },
    ],
    faq: [
      ['What is the most effective marketing for a car dealership?',
        'For used inventory, the highest-return combination in 2026 is free, high-intent channels done completely: every unit listed on Facebook Marketplace daily with showroom-grade photos, a fully built Google Business Profile with fresh reviews, and sub-minute responses to inquiries. Paid portals and ads come after those are consistent.'],
      ['How much should a car dealership spend on marketing?',
        'Spend follows leaks, not formulas. Before adding paid budget, max out the free channels: full Marketplace coverage, Google Business Profile, review flow and fast follow-up. Most independents find their cheapest incremental sales there, then add portal or ad spend for aged units and conquest.'],
      ['Is Facebook Marketplace still worth it for car dealers in 2026?',
        'Yes — it remains the largest free source of local, in-market used-car shoppers, and dealers who post inventory consistently with good photos and fast replies get a steady flow of messages. The work is volume and consistency, which is what [Facebook Marketplace software for dealers](/facebook-marketplace-auto-poster/) automates.'],
      ['Do I need a marketing agency for my dealership?',
        'Not to start. The plays that move metal first — Marketplace coverage, photos, reviews, response speed — are software problems, not agency problems. An agency earns its fee later, on paid media strategy and creative, once the fundamentals run themselves.'],
      ['What are the best car dealership marketing ideas?',
        'We keep a working list of [27 dealership marketing ideas](/guide/car-dealership-marketing-ideas/) ranked by cost and effort — from free Marketplace plays to local partnerships and retention campaigns.'],
    ],
    cta: {
      heading: 'Run the whole playbook from one app',
      sub: 'AutoLander posts your inventory to Facebook Marketplace, makes the photos showroom-grade, answers buyers 24/7 and shows you which posts sold cars.',
    },
    relatedHeading: 'The dealer growth library',
    schema: {
      itemList: [
        { name: 'Car dealership marketing ideas that sell cars', url: SITE.origin + NAV.mktgIdeas.path },
        { name: 'How to get more car sales leads', url: SITE.origin + NAV.salesLeads.path },
        { name: 'Social media for car dealers', url: SITE.origin + NAV.socialMedia.path },
        { name: 'How to sell more cars', url: SITE.origin + NAV.sellMore.path },
        { name: 'AI for car dealerships: what actually works', url: SITE.origin + NAV.aiDealers.path },
        { name: 'AI chat for car dealers', url: SITE.origin + NAV.aiChat.path },
        { name: 'AI car photo editor for dealers', url: SITE.origin + NAV.photoEditor.path },
      ],
    },
  },

  // ------------------------------------------------- SPOKE: /guide/car-dealership-marketing-ideas/
  {
    key: 'mktgIdeas',
    title: '27 Car Dealership Marketing Ideas That Sell Cars (2026)',
    description:
      '27 car dealership marketing ideas ranked by cost and effort — free Marketplace plays, photo '
      + 'upgrades, local moves and retention that move metal.',
    eyebrow: 'Dealer growth guide',
    h1: '27 car dealership marketing ideas that actually sell cars',
    bylineUpdated: true,
    tldr:
      'The dealership marketing ideas that reliably sell cars are unglamorous: list every unit on Facebook '
      + 'Marketplace daily, upgrade the photos, answer messages in seconds, farm reviews, and remarket to '
      + 'your own customer list. Below are 27 ideas grouped by what they cost — start with the free ones; '
      + 'they outperform most paid ones.',
    breadcrumbs: [{ name: 'Home', url: home }, hubCrumb, { name: 'Marketing ideas', url: SITE.origin + NAV.mktgIdeas.path }],
    sections: [
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Free ideas that sell cars this week (1–8)',
        intro: 'Zero budget, high intent. If you only do one group, do this one.',
        items: [
          '1. List every single unit on Facebook Marketplace, every day — most stores list a fraction of the lot because manual posting is slow; an [auto poster](/facebook-marketplace-auto-poster/) fixes the volume problem overnight.',
          '2. Re-shoot your worst 10 listings with clean backgrounds — or run them through an [AI car photo editor](/ai-car-photo-editor/) and keep the same photos you already have.',
          '3. Reply to every Marketplace message within one minute — use [AI chat](/ai-chat-for-car-dealers/) for nights, weekends and lunch rushes.',
          '4. Remove sold units the hour they sell — nothing torches trust like a buyer messaging about a car that left Tuesday; [inventory sync](/facebook-marketplace-inventory-sync/) does it automatically.',
          '5. Ask for a Google review at delivery, in person, phone in hand — the ask-at-the-moment rate embarrasses every follow-up email.',
          '6. Fill out every field on your Google Business Profile and add 20 real photos of the lot, the office and the team.',
          '7. Put a price on everything — "message for price" filters you out of every price-filtered search on every platform.',
          '8. Write listing descriptions that answer the first three questions buyers always ask: condition, history, and why the price is fair.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Merchandising ideas that make the same car look worth more (9–15)',
        items: [
          '9. Showroom-grade photo backgrounds on every listing — consistency across the whole inventory reads as "real dealership," not "guy with a yard."',
          '10. A branded storefront backdrop behind every unit — AutoLander’s studio can composite your own building behind each car.',
          '11. Walkaround videos: Marketplace and buyers both favor motion; AI can generate one per vehicle so you never film a thing.',
          '12. Lead photo discipline: front three-quarter shot, no snow, no fingers, no other cars.',
          '13. Order photos the way buyers look: exterior, interior, odometer, tires, flaws last but honestly.',
          '14. Standardize titles: year, make, model, trim, mileage — skip the emojis and the ALL CAPS.',
          '15. Show the flaw before they find it: a clear photo of the door ding builds more trust than hiding it costs.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ford-maverick-before.webp',
        after: '/studio/ford-maverick-after.webp',
        beforeAlt: 'Raw lot photo of a Ford Maverick before AutoLander',
        afterAlt: 'The same Ford Maverick on a clean showroom background after AutoLander’s AI Photo Studio',
        caption: 'Idea #9 in practice: same truck, same phone photo — the AI studio background is the only change.',
      },
      {
        type: 'bullets',
        h2: 'Local machine ideas (16–21)',
        items: [
          '16. Partner with 3 local mechanics: they refer buyers to you, you send inspections and reconditioning to them.',
          '17. Sponsor one visible local thing your buyers attend — a league, a school event, a car meet on your lot.',
          '18. Run a "we buy cars" lane: acquisition marketing fills inventory cheaper than auctions and creates a second reason for locals to know your name.',
          '19. Text (with consent) your service customers when their vehicle hits positive equity — trade-up offers to warm names beat any cold ad.',
          '20. Put the inventory QR code on the lot fence facing the road: after-hours walkers become weekend appointments.',
          '21. Answer the phone with a human during posted hours; forward to a text line after. Missed calls are the quietest lead leak in the store.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Paid & retention ideas — once the free ones run (22–27)',
        items: [
          '22. Retarget your website visitors with the exact VINs they viewed; skip broad awareness campaigns.',
          '23. Put ad dollars behind aged units only — give every 45-day-old car a specific job and budget.',
          '24. Portal packages (CarGurus, Cars.com) for reach beyond your zip — then [sync those same feeds to Marketplace](/integrations/) so every channel carries the whole lot.',
          '25. A monthly email to your owned list: new arrivals, one financing tip, one customer story. Short, useful, unsubscribable.',
          '26. Birthday-of-the-loan messages: "your Silverado is worth more than you owe" outperforms happy-birthday fluff.',
          '27. Referral bounty your buyers remember: a real number, paid fast, promoted at delivery when goodwill peaks.',
        ],
      },
      {
        type: 'callout',
        title: 'Sequencing beats selection',
        body: 'Ideas 1–8 compound: full Marketplace coverage feeds the photo upgrade, which feeds response volume, '
          + 'which feeds reviews. Run them as a system — the [2026 dealership marketing playbook](/guide/car-dealership-marketing/) '
          + 'puts them in order.',
      },
    ],
    faq: [
      ['What are the best free marketing ideas for a car dealership?',
        'Full daily Facebook Marketplace coverage of your inventory, clean listing photos, sub-minute replies to messages, Google reviews asked for at delivery, and a complete Google Business Profile. All five are free and all five out-pull typical paid campaigns for used inventory.'],
      ['How do small or independent dealerships compete with big-store ad budgets?',
        'By winning the free, high-intent channels the big stores execute poorly: complete Marketplace coverage, faster responses, better photos and more recent reviews. Budget buys reach; consistency buys buyers.'],
      ['How many cars should I list on Facebook Marketplace?',
        'All of them, refreshed continuously — coverage is the whole game, subject to your account’s eligibility and current listing limits. Manual posting caps most stores at a handful of units, which is the problem [bulk posting software](/bulk-post-cars-to-facebook-marketplace/) exists to solve.'],
      ['Which marketing ideas work for RV dealers too?',
        'Nearly all of them — Marketplace coverage, photo upgrades, response speed and reviews translate directly. RVs additionally need the right Marketplace category and RV-specific details; see [RV dealer software](/rv-dealer-software/).'],
    ],
    cta: {
      heading: 'Ideas 1–4, automated tonight',
      sub: 'AutoLander lists the whole lot on Marketplace, upgrades every photo, answers buyers instantly and pulls sold units — the top of this list, running by itself.',
    },
  },

  // ---------------------------------------------------------------- SPOKE: /guide/car-sales-leads/
  {
    key: 'salesLeads',
    title: 'How to Get Car Sales Leads in 2026 (Without Buying Them)',
    description:
      'How to get car sales leads that close: rank sources by intent, turn Facebook Marketplace into a '
      + 'lead engine, and answer buyers in seconds.',
    eyebrow: 'Dealer growth guide',
    h1: 'How to get car sales leads (without buying them)',
    bylineUpdated: true,
    tldr:
      'The strongest car sales leads are people already messaging about a specific vehicle — which makes '
      + 'your own inventory listings the best lead generation channel a dealership has. Put every unit on '
      + 'Facebook Marketplace with real photos and prices, answer within a minute at any hour, capture a '
      + 'phone number early, and book the appointment in the same conversation. Bought third-party leads are '
      + 'shared, cold and slow by comparison.',
    breadcrumbs: [{ name: 'Home', url: home }, hubCrumb, { name: 'Car sales leads', url: SITE.origin + NAV.salesLeads.path }],
    sections: [
      {
        type: 'qa',
        q: 'What counts as a car sales lead?',
        a: [
          'A car sales lead is a real person who raised their hand about buying a vehicle from you — a '
          + 'Marketplace message about a specific unit, a website form, a call, a text, a walk-in. The quality '
          + 'spread is enormous: a buyer messaging about one specific truck at your price is close to a sale; a '
          + 'name on a purchased list who "showed interest in SUVs" is close to a cold call.',
          'Rank every lead source by one question: did this person choose a specific car of ours, or did a '
          + 'vendor choose us for them?',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Car sales lead sources, ranked by intent',
        items: [
          'Inbound message on a specific listing (Facebook Marketplace, your site, a portal) — the buyer picked the car. Highest intent, free on Marketplace.',
          '"Is it available?" quick-taps — lower effort from the buyer, still car-specific; the win is in the speed and quality of the first reply.',
          'Google Business Profile calls and direction requests — store-level intent from "dealer near me" searches.',
          'Website credit applications and payment-calculator submits — finance-ready buyers who prove intent with paperwork.',
          'Your owned list (past customers, service customers, prior leads) — warm, cheap, and the only source competitors cannot buy.',
          'Purchased third-party leads — shared with other stores, minutes-to-days old, and price-shopped. Buy them only to fill capacity you cannot fill above.',
        ],
      },
      {
        type: 'steps',
        h2: 'Turn Facebook Marketplace into your lead engine',
        intro: 'Marketplace is where local used-car demand already is. The system:',
        steps: [
          { title: 'Coverage: every unit live, every day', body: 'Leads scale with listings shoppers can find. A [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) keeps the full lot posted within your account’s limits — no Sunday-night posting marathons.' },
          { title: 'Merchandising: photos that stop the scroll', body: 'Same car, same price, better photo = more messages. An [AI car photo editor](/ai-car-photo-editor/) makes every listing look showroom-grade automatically.' },
          { title: 'Price honestly and visibly', body: 'Price-filtered search is how buyers browse. A fair, visible price generates messages; "$1" games and hidden prices generate silence.' },
          { title: 'Answer in seconds — at 9pm, at Sunday lunch', body: 'Marketplace buyers message several stores at once and buy where the conversation starts. [AI chat for car dealers](/ai-chat-for-car-dealers/) replies instantly from your own inventory data, asks the qualifying questions and hands hot buyers to your team.' },
          { title: 'Capture and book in the same thread', body: 'Get a name and phone number early, offer two appointment windows, confirm by text. A lead that leaves the thread without a next step is a lead you donated to the next dealer.' },
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Do',
          items: [
            'Measure speed-to-first-reply in seconds, per hour of the week',
            'Route after-hours messages to [AI chat](/ai-chat-for-car-dealers/) instead of a morning pile-up',
            'Keep sold units off the channels with [inventory sync](/facebook-marketplace-inventory-sync/)',
            'Work your owned list monthly — equity alerts, lease endings, service-to-sales',
            'Track every lead to sold/lost with a reason',
          ],
        },
        right: {
          h2: 'Don’t',
          items: [
            'Buy shared leads while your own inbox goes unanswered for hours',
            'Hide prices to "start conversations" — it starts silences',
            'Let listings go stale; refreshed, accurate listings signal a live store',
            'Reply with "call the store" — buyers chose chat for a reason',
            'Count leads without counting appointments kept',
          ],
        },
      },
      {
        type: 'callout',
        title: 'About bought leads',
        body: 'Third-party leads can fill gaps, but you are paying for a name that two or three other stores also '
          + 'bought, hours after the buyer moved on. The same money spent on coverage, photos and response speed '
          + 'generates exclusive leads that message you first. Fix the engine before renting one.',
      },
    ],
    faq: [
      ['How do car dealerships get more leads without buying them?',
        'List the entire inventory where local buyers already search (Facebook Marketplace first — it is free), make photos showroom-grade, show real prices, and answer every message within a minute at any hour. Those four moves generate exclusive, car-specific leads instead of shared vendor names.'],
      ['What is a good response time for car sales leads?',
        'Under one minute. Marketplace and web shoppers message multiple dealers in one sitting, and the first real answer usually wins the appointment. That response window is why dealers put [AI chat](/ai-chat-for-car-dealers/) on the inbox for nights, weekends and busy floors.'],
      ['Is there an app for managing car sales leads?',
        'AutoLander’s desktop app manages the Marketplace side end-to-end: it posts every unit, keeps prices and availability current, answers buyer messages instantly with AI, captures contact info and books appointments — then hands qualified buyers to your team.'],
      ['Are Facebook Marketplace leads any good for car dealers?',
        'They are among the highest-intent free leads in used-car retail: local shoppers who selected a specific vehicle at your price and started a conversation. Quality problems usually trace to slow replies or stale listings, not the channel.'],
    ],
    cta: {
      heading: 'Exclusive leads from your own inventory',
      sub: 'AutoLander posts every unit, answers buyers in seconds around the clock, and books the appointment — leads no other store is also working.',
    },
  },

  // ------------------------------------------------- SPOKE: /guide/social-media-for-car-dealers/
  {
    key: 'socialMedia',
    title: 'Social Media for Car Dealers: Post Where Buyers Shop (2026)',
    description:
      'Social media for car dealers that sells cars: why Marketplace is the channel that transacts, what '
      + 'belongs on your page, and a weekly cadence.',
    eyebrow: 'Dealer growth guide',
    h1: 'Social media for car dealers: post where buyers actually shop',
    bylineUpdated: true,
    tldr:
      'For car dealers, social media splits into two different jobs: Facebook Marketplace is where local '
      + 'buyers search inventory and transactions start — it deserves daily, full-inventory coverage. Your '
      + 'Facebook page, Reels and Google posts are the trust layer buyers check before they visit. Most '
      + 'stores over-invest in engagement content and under-invest in the channel that actually sells cars.',
    breadcrumbs: [{ name: 'Home', url: home }, hubCrumb, { name: 'Social media', url: SITE.origin + NAV.socialMedia.path }],
    sections: [
      {
        type: 'qa',
        q: 'Does social media actually sell cars?',
        a: [
          'One part of it does, directly: Facebook Marketplace, where shoppers filter by vehicle, price and '
          + 'distance and message the seller. That is inventory search, not social scrolling — and it is free. '
          + 'The rest of social (page posts, Reels, community content) sells indirectly: it is what a buyer '
          + 'checks to decide whether your store looks real, active and trustworthy before driving out.',
          'Budget your effort accordingly: Marketplace gets systems and daily coverage; the trust layer gets a '
          + 'sustainable weekly cadence.',
        ],
      },
      {
        type: 'features',
        h2: 'What to post where',
        intro: 'Each surface has one job. Content that ignores the job gets ignored.',
        cards: [
          { title: 'Facebook Marketplace — the store shelf', body: 'Every unit, real photos, real price, refreshed and answered fast. This is the surface that transacts; keep it complete with an [auto poster](/facebook-marketplace-auto-poster/).' },
          { title: 'Facebook page — the trust check', body: 'Delivery photos with happy buyers (with permission), new arrivals, team faces, reviews reposted. Two to four posts a week beats a daily firehose you abandon by March.' },
          { title: 'Reels / Shorts — the reach lever', body: 'Short walkarounds of interesting units. AutoLander can generate an AI walkaround video per vehicle, so motion content exists without a videographer.' },
          { title: 'Google Business Profile posts — the search bonus', body: 'Cross-post arrivals and offers. Buyers see them at the exact "dealer near me" moment.' },
          { title: 'Marketplace inbox — where deals start', body: 'Social attention converts in chat. Cover it around the clock with [AI chat for car dealers](/ai-chat-for-car-dealers/), so a Sunday-night message becomes a Monday appointment.' },
          { title: 'Photos everywhere — the constant', body: 'Consistent, showroom-grade vehicle photos raise performance on every surface at once — the job of the [AI car photo editor](/ai-car-photo-editor/).' },
        ],
      },
      {
        type: 'steps',
        h2: 'A weekly cadence a small store can actually keep',
        steps: [
          { title: 'Daily (automated)', body: 'Inventory posted and refreshed on Marketplace, sold units removed, messages answered instantly — all software, zero staff time.' },
          { title: 'Monday', body: 'Post the weekend’s deliveries on the page: buyer, car, first name, big smile (with permission).' },
          { title: 'Wednesday', body: 'One Reel: 30-second walkaround of the most interesting unit in stock.' },
          { title: 'Friday', body: 'New-arrivals roundup on the page and Google Business Profile — three units, three lines, link to inventory.' },
          { title: 'Monthly', body: 'Repost the best review as an image; retire what got no traction; check which posts preceded actual sales, not just likes.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/chevrolet-malibu-before.webp',
        after: '/studio/chevrolet-malibu-after.webp',
        beforeAlt: 'Raw lot photo of a Chevrolet Malibu before AutoLander',
        afterAlt: 'The same Chevrolet Malibu on a clean studio background after AutoLander’s AI Photo Studio',
        caption: 'The same Malibu, before and after the AI studio — the version on the right earns the click on every social surface.',
      },
      {
        type: 'callout',
        title: 'Play it straight',
        body: 'Marketplace listings belong on accounts that are eligible to sell vehicles, inside Meta’s rules and '
          + 'current listing limits — no engagement-bait games, no personal-profile tricks. The [policy and safety guide](/guide/facebook-marketplace-automation/) '
          + 'covers what automation can and cannot do honestly.',
      },
    ],
    faq: [
      ['What should a car dealership post on social media?',
        'Split it by job: full inventory with prices on Facebook Marketplace daily (that is the selling surface), and trust content on the page — deliveries, arrivals, team, reviews — two to four times a week. Short walkaround videos are the highest-leverage reach format for dealers.'],
      ['How often should a dealership post on Facebook Marketplace?',
        'Inventory should be complete and current every day — new arrivals listed, sold units removed, prices synced. That is a software cadence, not a staffing cadence; see [Facebook Marketplace automation](/facebook-marketplace-automation/).'],
      ['Do Reels and TikTok sell cars for dealerships?',
        'They build reach and make the store familiar, which lowers the barrier to the message that does sell the car. Treat short video as the top of the funnel and the Marketplace listing plus fast chat reply as the bottom.'],
      ['Should salespeople post inventory on their personal Facebook profiles?',
        'Follow Meta’s rules: vehicles should be listed by accounts eligible to sell them, and personal-profile automation is a gray area we do not recommend gaming. The durable play is full coverage on eligible accounts with honest listings — the approach in our [safety guide](/safest-facebook-marketplace-auto-poster/).'],
    ],
    cta: {
      heading: 'The selling half of social, automated',
      sub: 'AutoLander keeps Marketplace complete, current and answered around the clock — you keep the page human.',
    },
  },

  // ---------------------------------------------------------------- SPOKE: /guide/how-to-sell-more-cars/
  {
    key: 'sellMore',
    title: 'How to Sell More Cars in 2026: The Six Levers | AutoLander',
    description:
      'How to sell more cars without more ad spend: six levers — coverage, photos, price, speed, leaks, '
      + 'attribution — plus a 30-day plan for dealers.',
    eyebrow: 'Dealer growth guide',
    h1: 'How to sell more cars: the six levers that actually move units',
    bylineUpdated: true,
    tldr:
      'Dealerships sell more cars by pulling six levers, in order: get every unit in front of more in-market '
      + 'buyers (coverage), make each unit look worth the money (photos and description), price into the '
      + 'search filters, answer first (speed), stop advertising sold cars (leaks), and put budget only where '
      + 'attribution says cars actually came from. None of the six requires more ad spend.',
    breadcrumbs: [{ name: 'Home', url: home }, hubCrumb, { name: 'Sell more cars', url: SITE.origin + NAV.sellMore.path }],
    sections: [
      {
        type: 'qa',
        q: 'What actually makes a dealership sell more cars?',
        a: [
          'At-bats and conversion. At-bats are how many ready-to-buy shoppers see your actual inventory this '
          + 'week; conversion is how many of those turn into conversations, appointments and deliveries. '
          + 'Everything that reliably sells more cars improves one of those two numbers — more listings in '
          + 'front of more buyers, or a higher percentage of lookers becoming talkers.',
          'The trap is spending on reach while conversion leaks: great ad, dark photos, hidden price, and a '
          + 'message that sat unanswered from Saturday 7pm to Monday 9am.',
        ],
      },
      {
        type: 'features',
        h2: 'The six levers',
        cards: [
          { title: '1. Coverage — every unit, everywhere buyers look', body: 'A car nobody sees is a car nobody buys. Full daily [Facebook Marketplace coverage](/bulk-post-cars-to-facebook-marketplace/) is the cheapest at-bats in used-car retail.' },
          { title: '2. Merchandising — photos do the selling', body: 'Showroom-grade photos lift clicks and messages on identical cars at identical prices. The [AI car photo editor](/ai-car-photo-editor/) upgrades the whole lot automatically.' },
          { title: '3. Price into the filters', body: 'Buyers search with price caps. A visible, defensible price puts you in the result set; games keep you out of it.' },
          { title: '4. Speed — first real answer wins', body: 'The store that responds in seconds gets the test drive. [AI chat](/ai-chat-for-car-dealers/) makes "in seconds" true at 11pm too.' },
          { title: '5. Plug the leaks', body: 'Sold cars still listed, stale prices, dead links — every one burns a real buyer. [Inventory sync](/facebook-marketplace-inventory-sync/) keeps channels truthful automatically.' },
          { title: '6. Attribution — feed what works', body: 'Track which listings and channels produced delivered units, then shift effort there. AutoLander’s post-to-sale attribution closes that loop for Marketplace.' },
        ],
      },
      {
        type: 'steps',
        h2: 'The 30-day more-cars plan',
        steps: [
          { title: 'Week 1 — Coverage', body: 'Get 100% of retail-ready inventory listed on Marketplace with prices. Automate the posting so it stays at 100% without anyone’s Saturday.' },
          { title: 'Week 2 — Merchandising', body: 'Run every listing photo through the AI studio; rewrite the ten worst descriptions to answer condition, history and why-this-price.' },
          { title: 'Week 3 — Speed', body: 'Turn on 24/7 AI chat, set escalation to your closers’ phones, and start measuring minutes-to-first-reply like you measure gross.' },
          { title: 'Week 4 — Truth & measure', body: 'Automate sold-unit removal and price sync; pull the first post-to-sale report; put next month’s energy behind whatever the report says sold cars.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/hyundai-sonata-before.webp',
        after: '/studio/hyundai-sonata-after.webp',
        beforeAlt: 'Raw lot photo of a Hyundai Sonata before AutoLander',
        afterAlt: 'The same Hyundai Sonata on a showroom background after AutoLander’s AI Photo Studio',
        caption: 'Lever #2: identical Sonata, identical price — the right-hand photo is the one that gets the message.',
      },
      {
        type: 'callout',
        title: 'The math is boring on purpose',
        body: 'More listings seen × better first impression × faster answers = more appointments, and appointments '
          + 'sell cars. Every lever here is measurable within a month — no brand-lift hand-waving required. Start '
          + 'with the [full marketing playbook](/guide/car-dealership-marketing/) if you want the channel-by-channel version.',
      },
    ],
    faq: [
      ['How can a small dealership sell more cars without spending more on ads?',
        'Pull the free levers first: complete daily Marketplace coverage, showroom-grade photos, visible fair prices, sub-minute replies at all hours, and instant sold-unit removal. Most independents find a month of those fundamentals outperforms their ad budget.'],
      ['How do I sell more cars on Facebook Marketplace specifically?',
        'Coverage, photos, price, speed — the full workflow is in our step-by-step guide to [selling cars on Facebook Marketplace](/guide/how-to-sell-cars-on-facebook-marketplace/), and the software that runs it is the [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/).'],
      ['What is a good closing ratio on internet leads?',
        'Ratios vary too much by market and pricing to quote a universal number honestly — what matters is your trend: appointments per 100 leads and deliveries per 100 appointments, measured monthly. Speed of first response is usually the cheapest ratio-mover in the stack.'],
      ['Does AI really help sell more cars?',
        'AI moves three of the six levers directly: photos (AI studio), speed (24/7 AI chat) and coverage (automated posting). What actually works and what is hype is covered in [AI for car dealerships](/guide/ai-for-car-dealerships/).'],
    ],
    cta: {
      heading: 'Four levers, one app, live this week',
      sub: 'Coverage, photos, 24/7 answers and sold-unit truth — AutoLander runs them while your floor sells.',
    },
  },

  // ---------------------------------------------------------------- SPOKE: /guide/ai-for-car-dealerships/
  {
    key: 'aiDealers',
    title: 'AI for Car Dealerships: What Actually Works | AutoLander',
    description:
      'AI for car dealerships without the hype: the three uses that pay today — AI photos, 24/7 inbox '
      + 'chat, listing copy — and what AI still cannot do.',
    eyebrow: 'Dealer growth guide',
    h1: 'AI for car dealerships: what actually works in 2026',
    bylineUpdated: true,
    tldr:
      'The AI that pays for itself at a car dealership today does jobs the store already knows it needs done: '
      + 'turning lot photos into showroom images, answering buyer messages instantly around the clock, and '
      + 'writing accurate listing descriptions for every VIN. AI that promises to "transform" the store '
      + 'without naming the job it does usually transforms the software budget instead.',
    breadcrumbs: [{ name: 'Home', url: home }, hubCrumb, { name: 'AI for dealerships', url: SITE.origin + NAV.aiDealers.path }],
    sections: [
      {
        type: 'qa',
        q: 'What is AI for car dealerships?',
        a: [
          'AI for car dealerships is software that does judgment work a person used to do — recognizing what '
          + 'is in a photo and replacing the background, reading an inventory feed and writing a description, '
          + 'understanding a buyer’s question and answering it correctly at 11pm. It is not one product; it is '
          + 'a set of workers you hire for specific jobs.',
          'The useful evaluation question is never "should we use AI" — it is "which job in this store is '
          + 'high-volume, repetitive, and losing us money when it goes undone?" Photos, buyer messages and '
          + 'listing copy top that list at almost every independent store.',
        ],
      },
      {
        type: 'table',
        h2: 'Dealership AI use cases, honestly ranked',
        head: ['Use case', 'What the AI does', 'Payback reality', 'Where it fits'],
        alCol: 3,
        rows: [
          ['AI vehicle photos', 'Replaces cluttered lot backgrounds with showroom or branded-storefront scenes; keeps the actual car untouched', 'Immediate — better photos lift clicks on every listing', 'AI Photo Studio in AutoLander'],
          ['AI chat on the sales inbox', 'Answers buyer messages in seconds 24/7 from real inventory data, qualifies, books appointments, escalates to humans', 'Immediate — after-hours messages become appointments instead of morning backlog', 'AI chat for car dealers in AutoLander'],
          ['AI listing descriptions', 'Writes an accurate, VIN-specific description for every unit', 'High — hours of copy work disappear; listings stop sounding identical', 'Built into AutoLander listings'],
          ['AI walkaround video', 'Generates a short video per vehicle from photos', 'Solid — motion content without a videographer', 'Optional per-vehicle in AutoLander'],
          ['AI pricing / appraisal tools', 'Suggests prices from market comps', 'Useful as an input; dangerous as an autopilot — local knowledge still prices the car', 'Standalone tools'],
          ['Generic "AI transformation" platforms', 'Unclear by design', 'Ask which specific job it does; if the answer is a slide, pass', '—'],
        ],
      },
      {
        type: 'qa',
        q: 'What does AI photo enhancement do for a dealership?',
        a: [
          'It takes the photos your feed already has — phone shots on a crowded lot, watermarked frames from a '
          + 'portal — cuts out the actual vehicle, and composites it onto a clean scene: a showroom, an outdoor '
          + 'backdrop, even your own storefront. The car’s pixels stay real; the environment gets replaced. '
          + 'Buyers see a professional store before they read a single word.',
          'Done right it is compositing, not repainting — the color, trim, wheels and flaws of the car stay '
          + 'exactly as shot, which keeps the listing honest. See it on the [AI car photo editor](/ai-car-photo-editor/) page.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ford-expedition-before.webp',
        after: '/studio/ford-expedition-after.webp',
        beforeAlt: 'Raw dealership lot photo of a Ford Expedition before AutoLander',
        afterAlt: 'The same Ford Expedition on a showroom background after AutoLander’s AI Photo Studio',
        caption: 'Compositing, not repainting: the Expedition’s paint, trim and wheels are untouched — only the scene changed.',
      },
      {
        type: 'qa',
        q: 'How does AI chat work for a car dealership?',
        a: [
          'Buyer messages — mostly from Facebook Marketplace listings — get an instant, accurate reply drawn '
          + 'from your actual inventory data: the real mileage, the real price, the real features of that unit. '
          + 'The AI asks qualifying questions, captures a name and number, offers appointment times, and hands '
          + 'the thread to a human the moment it should — a hot buyer, a trade-in negotiation, an upset customer.',
          'The honest constraints matter: it should answer from data, not improvise; escalate rather than '
          + 'guess; and run through your own store’s Facebook session rather than some shared cloud account. '
          + 'That is how [AutoLander’s AI chat](/ai-chat-for-car-dealers/) is built.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'How to evaluate any dealership AI vendor',
        items: [
          'Name the job: which specific task does it complete without a human — and what is the measurable output?',
          'Demand your data: does the chat answer from your live inventory, or from a script that can invent a price?',
          'Check the escalation: how fast does a hot or angry buyer reach a human, and how is your team notified?',
          'Ask where it runs: your own machine and accounts, or a shared cloud fleet you cannot see?',
          'Verify the charge model: are you billed for work that failed to deliver? (AutoLander refunds undelivered media automatically.)',
          'Keep policy honest: no AI vendor can exempt you from Meta’s terms, eligibility or listing limits — read the [automation policy guide](/guide/facebook-marketplace-automation/).',
        ],
      },
      {
        type: 'callout',
        title: 'What AI cannot do',
        body: 'AI cannot make a bad price good, cannot conjure Marketplace eligibility your account does not have, '
          + 'and should never invent vehicle facts to close a chat. Use it to do real jobs faster — photos, answers, '
          + 'copy — and keep the judgment calls human.',
      },
    ],
    faq: [
      ['What is the best AI tool for a car dealership?',
        'The one that completes a job you are currently losing money on. For most independents that is AI photo enhancement and 24/7 AI chat on the Marketplace inbox — both ship inside AutoLander, alongside AI-written listings. See the [Facebook AI tools guide](/facebook-ai-tools/) for the full breakdown.'],
      ['Will AI replace car salespeople?',
        'No — it replaces the parts of the job salespeople already hate: retyping listings, editing photos, and answering "is it available?" at midnight. The test drive, the trade walk and the close stay human; good AI just makes sure a human gets the chance.'],
      ['How much does AI for a car dealership cost?',
        'AutoLander plans start at $39/mo with 5 free posts to trial, and AI media work is charged per delivered output — with automatic refunds if a photo or video fails to deliver. See [pricing](/facebook-marketplace-auto-poster-pricing/).'],
      ['Is AI-generated car photography misleading to buyers?',
        'Not when it composites instead of repaints. The vehicle itself — paint, wheels, trim, visible wear — must stay exactly as photographed; only the background scene changes. That is the standard AutoLander’s studio enforces, and it keeps listings honest.'],
      ['Can AI respond to Facebook Marketplace messages for my dealership?',
        'Yes. AutoLander’s [AI chat for car dealers](/ai-chat-for-car-dealers/) answers Marketplace buyers in seconds from your real inventory data, qualifies them, books appointments and escalates to your team — running through your own store’s session, not a shared bot farm.'],
    ],
    cta: {
      heading: 'Hire AI for the jobs, keep humans for the close',
      sub: 'AI photos, AI listings, and a 24/7 AI-answered inbox — one desktop app, on your own inventory.',
    },
    schema: {
      itemList: [
        { name: 'AI chat for car dealers', url: SITE.origin + NAV.aiChat.path },
        { name: 'AI car photo editor for dealers', url: SITE.origin + NAV.photoEditor.path },
        { name: 'Facebook AI tools for car dealers', url: SITE.origin + NAV.aiTools.path },
        { name: 'Facebook Marketplace assistant', url: SITE.origin + NAV.assistant.path },
      ],
    },
  },
];
