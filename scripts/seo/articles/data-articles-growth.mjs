// Dealer-growth silo — Avalanche long-tail articles (growth batch, 2026-08-26).
// Pure content data per the article-system contract: NO imports — string/array/object
// literals only. Consumed by scripts/seo/articles/article-system.mjs (buildArticlePage).
// The only statistics used are from the published 2026 Marketplace report, cited with
// an inline link to /facebook-marketplace-used-car-report-2026/ every time.
// Messaging honesty: AutoLander has no autoresponder and never touches the inbox.
// The follow-up and Marketplace-messaging articles are MANUAL playbooks a human runs;
// AutoLander's contribution is upstream only (listings live, priced right, gone when sold).

export const ARTICLES = [

  // ---------------------------------------------- /guide/used-car-dealer-advertising-on-a-budget/
  {
    slug: 'used-car-dealer-advertising-on-a-budget',
    silo: 'growth',
    anchor: 'Used car dealership advertising on a budget: the $0-first ladder',
    crumb: 'Advertising on a budget',
    primaryKeyword: 'used car dealership advertising',
    secondaryKeywords: [
      'car dealership advertising ideas',
      'low budget car dealer advertising',
      'how much do dealerships spend on advertising',
    ],
    title: 'Used Car Dealership Advertising on a Budget (2026)',
    description:
      'Used car dealership advertising on a budget: what to run at $0, where the first paid '
      + 'dollars go, and why free coverage beats ad spend for small stores.',
    eyebrow: 'Dealer growth guide',
    h1: 'Used car dealership advertising on a budget',
    tldr:
      'Used car dealership advertising on a budget follows a strict ladder: exhaust the free, '
      + 'high-intent channels before the first paid dollar. That means every unit on Facebook '
      + 'Marketplace daily, a fully built Google Business Profile with fresh reviews, and photos '
      + 'that compete — all of which cost time, not money. When real budget exists, paid spend '
      + 'gets a narrow job: moving aged units and retargeting shoppers who already looked.',
    sections: [
      {
        type: 'qa',
        q: 'What does used car dealership advertising look like on a small budget?',
        a: [
          'It looks like an ordered ladder, not a media plan. Rung one costs nothing but hours: every '
          + 'unit listed on Facebook Marketplace every day, a Google Business Profile filled out to the '
          + 'last field, a steady stream of reviews, and photos clean enough to win the scroll. Rung two '
          + 'is the first real dollars, spent buying back those hours and upgrading the merchandising. '
          + 'Rung three — actual ad spend — comes last, and only with a narrow, measurable job attached.',
          'Most small stores run the ladder upside down. They buy a little radio, boost a few posts, '
          + 'maybe carry a portal package — while half the lot never makes it onto Marketplace and the '
          + 'Google profile shows six photos from three years ago. At that point budget is not the '
          + 'constraint. Coverage is.',
        ],
      },
      {
        type: 'table',
        h2: 'The used car advertising budget ladder',
        intro: 'Each rung assumes the one below it is already running. Skipping rungs is how ad money gets wasted.',
        head: ['Budget level', 'What you run', 'The job it does'],
        rows: [
          ['$0 — coverage first', 'Every unit on Facebook Marketplace daily; Google Business Profile fully built; review asks at every delivery; disciplined lot photos; inventory posted to your own social pages', 'Be visible everywhere a local buyer already searches, for free'],
          ['First real dollars', 'A posting tool that keeps the whole lot live; photo upgrades; a single listing-portal package if the market demands it', 'Buy back the hours coverage costs and make every listing compete on presentation'],
          ['Established budget', 'Retargeting for site and listing viewers; paid pushes on specific aged units; conquest offers around your strongest segments', 'Give paid spend a narrow, trackable job — never vague awareness'],
        ],
        note: 'The ladder is a sequence, not a menu. A store that cannot keep 40 listings live and current has no business paying for impressions.',
      },
      {
        type: 'steps',
        h2: 'The $0 advertising stack, in order',
        intro: 'Run these before any paid dollar leaves the store. Each one compounds the others.',
        steps: [
          { title: 'List every unit on Facebook Marketplace, every day', body: 'It is the largest pool of free, local, in-market used-car buyers, and a listing costs nothing. The hidden price is labor — posting 40 units by hand is an afternoon, every day, which is why most stores list a fraction of the lot. A [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) exists for exactly that gap, but however you do it, full coverage is rung one.' },
          { title: 'Build the Google Business Profile all the way out', body: 'Claim it, pick honest categories, complete the hours, load real photos of the lot and the people, and answer the questions buyers ask. Nearly every shopper who finds your car runs a trust check on your name minutes later — this is where they land.' },
          { title: 'Ask for a review at every delivery', body: 'Reviews are the cheapest trust signal in car retail, and delivery day is the one moment a buyer is glad to help. Ask in person, text the link on the spot, and reply to what comes in — including the rough ones.' },
          { title: 'Fix the photos with what you have', body: 'Pick one clean spot on the lot, shoot every car from the same angles in open shade, and keep promo frames and clutter out of the shot. Presentation is the ad — the photo does more selling than any headline you will ever pay for.' },
          { title: 'Answer every inquiry like it cost you $50', body: 'A lead ignored for three hours is ad spend burned, whatever the channel. Put one named person on replies per shift and hold the response to minutes — the [speed-to-lead playbook](/guide/car-sales-leads/) is the discipline that makes every other rung pay.' },
          { title: 'Track what actually sold cars before spending', body: 'Before allocating a single paid dollar, know which channel produced last month’s sold units. AutoLander’s post-to-sale attribution ties Marketplace listings to sales; whatever tool you use, spend follows evidence, not habit.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/nissan-kicks-before.webp',
        after: '/studio/nissan-kicks-after.webp',
        beforeAlt: 'Nissan Kicks crossover in a cluttered dealer lot photo with distracting background, before editing',
        afterAlt: 'The same Nissan Kicks re-staged in a clean studio scene by AutoLander’s AI Photo Studio',
        caption: 'The cheapest upgrade on the ladder: the same Nissan Kicks, from cluttered lot shot to a clean scene with [AutoLander’s AI Photo Studio](/ai-car-photo-editor/). The click happens before a buyer reads a single word.',
      },
      {
        type: 'qa',
        q: 'Where should the first paid advertising dollars go?',
        a: [
          'Two places, in this order: aged units and retargeting. A 60-day-old truck with fixed photos '
          + 'and a market-correct price is a legitimate target for a paid push, because the free channels '
          + 'have already had their shot and the money has a measurable job. Retargeting people who viewed '
          + 'your inventory is the second-best dollar — they already raised a hand.',
          'What the first dollars should never buy is broad awareness. A boosted post shown to thousands '
          + 'of people who are not shopping for a car this month loses to a free Marketplace listing seen '
          + 'by fifty people who are. The full [car dealership marketing playbook](/guide/car-dealership-marketing/) '
          + 'covers how the paid tier fits once the free tier runs itself.',
        ],
      },
      {
        type: 'qa',
        q: 'How much do dealerships spend on advertising?',
        a: 'Franchise stores typically treat advertising as a per-vehicle cost baked into every deal, and '
          + 'the totals vary wildly by brand, market, and month — which is exactly why copying their spend '
          + 'is the wrong exercise for an independent. The useful question is not what the store across town '
          + 'spends; it is whether any paid dollar of yours has a job the free channels could not do. For '
          + 'most small stores, the honest answer for the first several rungs is no.',
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'Low budget car dealer advertising ideas that still work',
        items: [
          'Feature one real car with a real price on your social pages every week — inventory posts outperform slogans.',
          'Put a QR code to your inventory on the service counter; your service customers are your warmest buyers.',
          'Ask every delivery for a referral as well as a review — a thank-you gesture where your state allows it.',
          'Partner with one local business you actually use — cross-promotion costs a handshake.',
          'Keep a working list of plays ranked by cost in the [dealership marketing ideas](/guide/car-dealership-marketing-ideas/) library and run one new one per month.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Free is free like a second job is free. The $0 rung costs hours every single day — posting, '
          + 'renewing, repricing, pulling sold units, answering messages — and the stores that fail at it '
          + 'usually fail from fatigue, not ignorance. Software can buy the hours back, but nothing removes '
          + 'the work of answering buyers and asking for reviews. Budget for time before you budget for money.',
      },
    ],
    faq: [
      ['What is the cheapest way to advertise a used car dealership?',
        'Full Facebook Marketplace coverage. Listing vehicles is free, the audience is local and actively shopping, and the only real cost is the labor of posting and maintaining listings. Pair it with a complete Google Business Profile and steady reviews and you have the two highest-return channels in used-car retail at essentially zero media cost.'],
      ['Is Facebook Marketplace really free for car dealers?',
        'Listing vehicles from a profile is free — there is no per-listing charge. The cost is operational: posting each unit, keeping prices current, renewing listings, and removing sold cars. Dealers pay in hours or in software; posting tools that automate the workflow start around $39 a month, which is far below any paid media channel.'],
      ['Should a small dealership run Facebook or Google ads?',
        'Only after free coverage is complete and only with a narrow job: pushing a specific aged unit or retargeting people who already viewed inventory. Broad awareness campaigns are where small-store ad budgets disappear. If you cannot name the unit or audience a campaign exists to move, it is not ready to fund.'],
      ['How do I advertise my dealership with no money at all?',
        'Post every unit to Facebook Marketplace daily, build out your Google Business Profile completely, ask every buyer for a review at delivery, keep photos clean and consistent, and answer every inquiry within minutes. That stack costs nothing but discipline and reliably outperforms small paid budgets spent on top of poor coverage.'],
      ['When is a dealership ready to start paying for advertising?',
        'When the free tier runs without heroics — every unit listed and current, reviews flowing, replies fast — and you can name which channel sold last month’s cars. Paid spend added before that point mostly amplifies gaps; added after it, the money lands on aged units and warm audiences where it can be measured.'],
    ],
    cta: {
      heading: 'Get full coverage before you buy a single ad',
      sub: 'AutoLander posts your whole lot to Facebook Marketplace from your own computer, keeps prices current, pulls sold units, and shows which posts sold cars — plans from $39 a month.',
    },
  },

  // ---------------------------------------------------- /guide/free-places-to-advertise-used-cars/
  {
    slug: 'free-places-to-advertise-used-cars',
    silo: 'growth',
    anchor: 'Free places to advertise used cars (and the free-ish ones)',
    crumb: 'Free car advertising',
    primaryKeyword: 'advertise cars for free',
    secondaryKeywords: [
      'free car listing sites',
      'where can dealers list cars for free',
      'list cars online free',
    ],
    title: 'Advertise Cars for Free: Where Dealers Can Really List',
    description:
      'Advertise cars for free: the channels that cost dealers nothing, the free-ish ones like '
      + 'Craigslist, and what each is actually worth to a used car lot.',
    eyebrow: 'Dealer growth guide',
    h1: 'Where can dealers advertise cars for free?',
    tldr:
      'The genuinely free list is short: Facebook Marketplace, your Google Business Profile, your '
      + 'own website, and organic social pages. Craigslist looks free but charges dealers for every '
      + 'vehicle listing, and the big portals are paid outright. Facebook Marketplace is the anchor — '
      + 'the largest pool of local, in-market buyers at zero listing cost — and the real price of every '
      + 'free channel is the labor of keeping listings live, current, and gone when sold.',
    sections: [
      {
        type: 'qa',
        q: 'Where can you advertise cars for free?',
        a: [
          'Four places are genuinely free for a dealership: Facebook Marketplace (free vehicle listings '
          + 'in front of local shoppers), your Google Business Profile (free presence on the searches '
          + 'buyers run on your name and on "used cars near me"), your own website, and your organic '
          + 'social pages. One familiar name is only free-ish — Craigslist charges dealers for each '
          + 'vehicle listing even though private sellers post free. Everything else that moves metal, '
          + 'from CarGurus to AutoTrader, is a paid product.',
          'Free does not mean low value. Marketplace in particular is the highest-intent no-cost channel '
          + 'in used-car retail — buyers filter by vehicle, price, and distance, then message you '
          + 'directly. The catch on every free channel is the same: the platform charges nothing, and '
          + 'the work of listing 40 or 60 units and keeping them accurate lands on you.',
        ],
      },
      {
        type: 'table',
        h2: 'Free car listing sites and channels, compared honestly',
        intro: 'Worth is a function of buyer intent. Rank by who is actually shopping, not by follower counts.',
        head: ['Channel', 'Really free for dealers?', 'What it is worth', 'The catch'],
        rows: [
          ['Facebook Marketplace', 'Yes — vehicle listings are free', 'The largest pool of local, in-market used-car shoppers; they filter by price and distance and message you directly', 'Listing at volume is manual work: posting, renewing, repricing, pulling sold units'],
          ['Google Business Profile', 'Yes', 'Wins the trust check nearly every buyer runs on your name; puts the store on the map searches', 'It advertises the store, not each car — it needs listings somewhere else to point at'],
          ['Your own website', 'Listing is free; hosting is cheap', 'The place a serious buyer verifies the unit, the price, and the phone number', 'Nobody browses it cold — the other channels have to send them'],
          ['Organic social pages', 'Yes', 'Keeps past customers warm; occasional in-market reach when a real car with a real price is posted', 'Low intent — a follower is rarely a shopper this week'],
          ['Craigslist', 'No — dealers pay per vehicle listing', 'Still real local traffic in some metros, especially for cheap transportation cars', 'By-dealer fees stack up across a full lot, and lead quality varies wildly by market'],
          ['Listing portals (CarGurus, Cars.com, AutoTrader)', 'No — paid packages', 'High-intent shoppers comparing price across every store in the radius', 'Real money, and your unit sits in a lineup beside every competitor’s'],
        ],
        note: 'Craigslist’s by-owner section is free for private individuals; dealer inventory belongs in by-dealer, which is fee-per-listing.',
      },
      {
        type: 'qa',
        q: 'Is Craigslist free for car dealers?',
        a: 'No. Private sellers list by-owner for free, but dealer vehicle listings are paid per unit, '
          + 'and posting inventory as a fake private seller is a fast way to get flagged. Whether the fee '
          + 'is worth it depends on your metro — cheap, high-utility cars still get real Craigslist '
          + 'traffic in some markets — but for a full lot, the per-listing math loses badly to a channel '
          + 'where listing costs nothing.',
      },
      {
        type: 'qa',
        q: 'Why Facebook Marketplace is the anchor free channel',
        a: [
          'Intent plus scale. Marketplace shoppers are local, they search with a price filter and a '
          + 'distance radius, and messaging the seller is one tap. For a used-car lot that shows up '
          + 'consistently with clean photos and real prices, it functions like a classified section the '
          + 'whole town actually reads — the full case is in [Facebook Marketplace for car dealers](/facebook-marketplace-for-car-dealers/).',
          'The grind is coverage and freshness: every unit posted, prices matching the window sticker, '
          + 'sold cars pulled the day they deliver, listings renewed before they go stale. That workflow '
          + 'is exactly what a [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) '
          + 'automates — but automated or manual, the standard is the same: the whole lot, live and '
          + 'accurate, every day.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/kia-k5-before.webp',
        after: '/studio/kia-k5-after.webp',
        beforeAlt: 'Kia K5 sedan photographed on a crowded dealer lot with promo clutter, before editing',
        afterAlt: 'The same Kia K5 re-staged in a clean, well-lit scene by AutoLander’s AI Photo Studio',
        caption: 'On a free channel every listing costs the same — presentation is the differentiator. The same Kia K5, as the feed delivered it and as AutoLander’s AI Photo Studio re-staged it.',
      },
      {
        type: 'steps',
        h2: 'How to list cars online free without it eating your week',
        intro: 'The free channels reward volume and punish staleness. A repeatable routine beats a heroic weekend.',
        steps: [
          { title: 'Start from one source of truth', body: 'Your DMS export, website feed, or portal feed is the master list. Every listing everywhere should trace back to it, so a price change happens once instead of five times.' },
          { title: 'Shoot once, reuse everywhere', body: 'One disciplined photo set per unit — same angles, clean background — feeds Marketplace, your site, and your social pages. Re-shooting per channel is where the hours go to die.' },
          { title: 'Post in a daily batch, not on impulse', body: 'Block the time, work the list, and get every new arrival live within a day of recon. Coverage is the metric: units listed everywhere divided by units on the lot.' },
          { title: 'Keep price and status current on every channel', body: 'A buyer who catches a stale price stops trusting all of your listings. This is the step most worth automating — [automatic price updates and sold-unit removal](/facebook-marketplace-inventory-sync/) exist because humans forget.' },
          { title: 'Pull sold units the day they deliver', body: 'A ghost listing wastes a buyer’s drive and earns the review that follows. Marking a car sold everywhere it lives is part of delivering it.' },
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Free channels bill you in hours. Posting a 50-unit lot by hand, renewing what goes stale, '
          + 'repricing across every channel, and pulling sold cars is a real part-time job, and the '
          + 'moment it slips, the free channels quietly stop producing. The choice is not free versus '
          + 'paid — it is labor versus software versus a half-covered lot.',
      },
    ],
    faq: [
      ['What is the best free car listing site?',
        'Facebook Marketplace, by intent and by scale. Buyers filter by car, price, and distance, and message directly — behavior no other free channel matches. Your Google Business Profile is the essential companion: it does not list individual cars the same way, but it wins the trust check those Marketplace buyers run on your name.'],
      ['Can dealerships post cars on Facebook Marketplace for free?',
        'Yes. Vehicle listings posted from a profile are free — there is no per-listing fee for the listing itself. The real cost is workflow: photographing, posting, renewing, repricing, and removing each unit. Dealers either staff that work or automate it with posting software built for inventory.'],
      ['Where can dealers list cars for free besides Facebook?',
        'Your Google Business Profile, your own website, and your organic social pages — all free, all worth doing, none a substitute for a listing channel where buyers search inventory. Beyond those, genuinely free dealer channels are scarce: Craigslist charges dealers per listing, and the major portals are paid products.'],
      ['Are paid listing portals worth it for a small dealer?',
        'Sometimes — after the free tier is maxed. Portals deliver high-intent shoppers but put your unit beside every competitor’s, so they reward sharp pricing and punish weak photos. Prove you can keep the free channels covered and current first; a portal package on top of poor coverage just rents you a bigger audience for the same gaps.'],
      ['How do free car listings go wrong?',
        'Staleness. Prices that no longer match the website, listings that expired unnoticed, and sold cars still advertised — each one burns buyer trust that took months to earn. The fix is a daily routine or software that syncs price and status automatically; the free channel itself is rarely the problem.'],
    ],
    cta: {
      heading: 'Put the whole lot on the biggest free channel',
      sub: 'AutoLander posts every unit to Facebook Marketplace, keeps prices matched to your feed, and removes sold cars automatically — the free channel, minus the labor bill.',
    },
  },

  // ------------------------------------------------------- /guide/sell-cars-online-small-dealership/
  {
    slug: 'sell-cars-online-small-dealership',
    silo: 'growth',
    anchor: 'How to sell cars online as a small dealership',
    crumb: 'Sell cars online',
    primaryKeyword: 'how to sell cars online',
    secondaryKeywords: [
      'sell cars online small dealership',
      'online car sales process',
      'selling cars online without a big website',
    ],
    title: 'How to Sell Cars Online as a Small Dealership (2026)',
    description:
      'How to sell cars online as a small dealership: list where buyers look, photos that compete, '
      + 'one owner for replies, and a simple path to the handshake.',
    eyebrow: 'Dealer growth guide',
    h1: 'How to sell cars online as a small dealership',
    tldr:
      'Selling cars online as a small dealership takes four pieces, not a tech stack: inventory '
      + 'listed everywhere local buyers actually search (Facebook Marketplace first), photos that '
      + 'compete with the franchise store’s, one named person owning every reply, and a simple '
      + 'path from chat to appointment to paperwork. The internet sells the appointment; the lot '
      + 'still sells the car. Consistency beats sophistication every month.',
    sections: [
      {
        type: 'qa',
        q: 'How do you sell cars online as a small dealership?',
        a: [
          'You build the minimum viable machine: (1) every unit listed where buyers already search — '
          + 'Facebook Marketplace first because it is free and local, portals as budget allows; (2) '
          + 'photos clean enough to compete with stores ten times your size; (3) one named owner for '
          + 'replies on every shift, answering in minutes; and (4) a rehearsed path from online '
          + 'conversation to test drive to signed paperwork. Nothing on that list requires a big website '
          + 'or a big budget.',
          'What it does require is showing up every single day. The small stores that win online are '
          + 'rarely the cleverest — they are the ones whose whole lot is live, priced right, and '
          + 'answered fast on week 30, not just week 1.',
        ],
      },
      {
        type: 'prose',
        paras: [
          'Start by letting go of the idea that selling online means building a dealership website with '
          + 'checkout buttons. Buyers do not browse small-store websites cold; they find the car on a '
          + 'listing channel, then visit your site for maybe ninety seconds to verify the store is real. '
          + 'Your site’s job is verification — real photos, a price that matches the listing, an '
          + 'address, and a phone number that gets answered. The listing is the storefront.',
          'That inversion is good news for a small dealership: the channels where the actual shopping '
          + 'happens cost little or nothing to enter, and the wider [car dealership marketing '
          + 'playbook](/guide/car-dealership-marketing/) stacks them in order of return.',
        ],
      },
      {
        type: 'steps',
        h2: 'The online car sales process, end to end',
        intro: 'From unit in recon to keys handed over — the loop a two-person store can actually run.',
        steps: [
          { title: 'Keep one source of truth for inventory', body: 'Your DMS export or website feed is the master record — year, trim, miles, price, photos. Every listing everywhere derives from it, so updates happen once. Tools connect to it directly; AutoLander, for example, syncs from CarGurus, Cars.com, or a custom feed export.' },
          { title: 'List every unit where buyers search', body: 'Facebook Marketplace is the free anchor; portals extend reach when budget allows. Posting the whole lot daily is the chore that breaks most stores, which is what a [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) is for — coverage without the afternoon of clicking.' },
          { title: 'Make the photos compete', body: 'Buyers compare your listing against a franchise store’s in the same scroll. Consistent angles and clean backgrounds close most of the gap; an [AI car photo editor](/ai-car-photo-editor/) closes the rest by re-staging your existing lot shots into showroom-grade scenes.' },
          { title: 'Price to the market you are listed in', body: 'Online, the price is the filter — a unit priced against live local comps gets the click; a unit priced on hope gets scrolled past. Check comps when the car lists and on a schedule after.' },
          { title: 'Put one name on every reply, per shift', body: 'Split ownership means missed messages. One person owns the inbox each shift, phone in pocket, and answers in minutes — buyers message several stores at once and buy from the one that answers first. The [speed-to-lead playbook](/guide/car-sales-leads/) is the standard.' },
          { title: 'Advance every conversation toward a visit', body: 'Answer the question, then ask one: their name, their timing, whether they have a trade. Offer two concrete appointment windows instead of "come by anytime." The goal of online chat is a firm visit, not a pen-pal.' },
          { title: 'Prepare the paperwork path before they arrive', body: 'Know your out-the-door number, have financing options and required documents listed plainly, and settle your deposit-and-hold policy in advance. Online buyers arrive further down the funnel — fumbling the desk work un-sells a sold car.' },
          { title: 'Deliver, mark sold, and remove the listings', body: 'The last step of every online sale is taking the listing down everywhere it lives. A sold car still advertised wastes the next buyer’s drive and earns the review you do not want.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/tesla-model-y-before.webp',
        after: '/studio/tesla-model-y-after.webp',
        beforeAlt: 'Tesla Model Y photographed in a busy dealer lot with distracting background, before editing',
        afterAlt: 'The same Tesla Model Y re-staged in a clean studio scene by AutoLander’s AI Photo Studio',
        caption: 'Small store, big-store presentation: the same Tesla Model Y from the same feed photo, re-staged by AutoLander’s AI Photo Studio. Online, nobody can tell how big your building is.',
      },
      {
        type: 'twocol',
        left: {
          h2: 'Do',
          items: [
            'Show a real price on every listing, everywhere',
            'Answer during the hours you say you are open',
            'Sign replies with a first name — people buy from people',
            'Photograph the actual car, flaws included',
            'Ask for the visit in every conversation',
          ],
        },
        right: {
          h2: 'Don’t',
          items: [
            'Post "call for price" and expect messages',
            'Let listings go stale while the car sits in the showroom',
            'Paste one canned paragraph at every question',
            'Hide fees until the desk — online buyers compare out-the-door',
            'Leave sold units live "for the leads"',
          ],
        },
      },
      {
        type: 'qa',
        q: 'What does selling a car online actually close?',
        a: 'The appointment. For a local dealership, almost every online sale still ends with a person on '
          + 'your lot — the internet’s job is to get the right buyer to the right car with the right '
          + 'expectations. Measure your online machine by appointments set and show rate, not by whether '
          + 'someone clicked a buy button. Stores that internalize this stop chasing e-commerce theater '
          + 'and start answering messages faster.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'The machine gets buyers to the door; it does not close them. A store with fast replies and '
          + 'clean listings but a chaotic desk will still lose deals at the last step, and no software '
          + 'fixes that. The other failure mode is week-three abandonment — the system works only as long '
          + 'as every unit stays listed, priced, and answered, which is a daily discipline, not a launch.',
      },
    ],
    faq: [
      ['Can a small dealership really compete online?',
        'Yes — online, nobody can see the size of your building. A buyer comparing listings sees photos, price, and how fast you answered. Those three are execution problems, not budget problems, and a disciplined two-person store routinely beats a sloppy twenty-person one on all three.'],
      ['Do I need my own website to sell cars online?',
        'You need a credible one, not a big one. Buyers find cars on listing channels and visit your site briefly to verify the store exists — so it needs real photos, matching prices, an address, hours, and a phone number that gets answered. Checkout flows and configurators are optional at best for a small store.'],
      ['What software does a small dealership need to sell online?',
        'A camera with a routine, an inventory feed or DMS export as the source of truth, a posting tool that keeps the lot live on Facebook Marketplace, and somewhere to track leads — even a shared sheet beats memory. Add paid portals when the free coverage is already running without heroics.'],
      ['How fast should we respond to online car leads?',
        'Within minutes during business hours. Online shoppers message several dealers in one sitting, and the store that answers first usually gets the appointment. Assign one owner per shift rather than sharing the inbox — shared ownership is how messages sit for three hours with everyone assuming someone else replied.'],
      ['Where should a small dealer list cars first?',
        'Facebook Marketplace, because it is free and full of local, in-market buyers. Then your own site as the verification layer, then a Google Business Profile so the trust check comes back clean. Paid portals come after those are consistently covered — they amplify a machine that already works.'],
    ],
    cta: {
      heading: 'Run a big store’s online machine with a small store’s staff',
      sub: 'AutoLander posts the whole lot to Facebook Marketplace, upgrades the photos, syncs every price change, and pulls sold units — the daily grind of selling online, automated.',
    },
  },

  // ------------------------------------------------------------- /guide/buy-here-pay-here-marketing/
  {
    slug: 'buy-here-pay-here-marketing',
    silo: 'growth',
    anchor: 'Buy here pay here marketing plays that actually work',
    crumb: 'Buy here pay here',
    primaryKeyword: 'buy here pay here marketing',
    secondaryKeywords: [
      'bhph marketing ideas',
      'how to get buy here pay here customers',
      'bhph advertising rules',
    ],
    title: 'Buy Here Pay Here Marketing: What Actually Works',
    description:
      'Buy here pay here marketing that works: honest Marketplace listings, a referral engine, '
      + 'service-drive plays, and the compliance line you never cross.',
    eyebrow: 'Dealer growth guide',
    h1: 'Buy here pay here marketing that actually works',
    tldr:
      'Buy here pay here marketing works when it matches how BHPH buyers shop: payment-first, '
      + 'locally, and urgently. The plays that fill the payment book are full Facebook Marketplace '
      + 'coverage with honest prices, a Google profile with real reviews, a deliberate referral '
      + 'engine, and retention through the payment desk. The line you never cross is deceptive '
      + 'credit promises — plain, honest claims are both the law’s demand and the better ad.',
    sections: [
      {
        type: 'qa',
        q: 'What marketing actually works for a buy here pay here dealership?',
        a: [
          'The marketing that works is the marketing that meets a BHPH buyer where they are: they need '
          + 'transportation this week, they shop by monthly payment before sticker price, they search '
          + 'locally, and many arrive braced to be treated badly. So the winning stack is unglamorous — '
          + 'every unit on Facebook Marketplace with a real price and honest photos, a Google Business '
          + 'Profile whose reviews say "they treated me with respect," a referral engine that turns '
          + 'customers into recruiters, and plain-language credit messaging that never overpromises.',
          'Gimmicks underperform here more than anywhere else in car retail, because the BHPH customer '
          + 'has usually heard every gimmick already. Being findable, honest, and fast is the '
          + 'differentiator.',
        ],
      },
      {
        type: 'qa',
        q: 'How do BHPH customers actually shop?',
        a: 'Payment-first and trust-second. The question in their head is "can I get approved, and what '
          + 'is it per month," not "what is the best Camry within 50 miles." They search close to home, '
          + 'often in the evening, often from a phone, and they move fast because the need is urgent — a '
          + 'job to get to, a family to move. That is why local visibility and reply speed beat clever '
          + 'creative: the store that answers tonight, plainly, usually gets the customer. The '
          + '[speed-to-lead discipline](/guide/car-sales-leads/) matters double in this segment.',
      },
      {
        type: 'steps',
        h2: 'BHPH marketing ideas, ranked by payoff',
        intro: 'Run them in this order. Each play feeds the one after it.',
        steps: [
          { title: 'Full Marketplace coverage with honest listings', body: 'BHPH inventory is exactly what Marketplace’s budget-minded local shoppers filter for. List every unit with a real cash price and honest photos, and note plainly that in-house financing is available with terms depending on income and down payment — no more, no less. The case for the channel is laid out in [Facebook Marketplace for car dealers](/facebook-marketplace-for-car-dealers/).' },
          { title: 'A Google Business Profile that survives the trust check', body: 'Your next customer will read the reviews before they call. Complete the profile, load real photos, and ask every delivery for a review — in this segment, "they were straight with me" is the single most valuable sentence on the internet.' },
          { title: 'A deliberate referral engine', body: 'BHPH is a referral business — your customers know exactly who else needs a car and a chance. Ask at delivery and again when an account pays off; a modest, clearly stated thank-you for referrals, where your state allows it, formalizes what already happens.' },
          { title: 'The payment desk as a retention channel', body: 'Every on-time payer is a future repeat buyer and a walking testimonial. Treat the payment interaction as marketing: congratulate payoff milestones, offer trade-up conversations to customers in good standing, and make the collections tone one you would be comfortable reading in a review.' },
          { title: 'Community anchors and seasonal timing', body: 'Employers, churches, and tax offices are where your buyers already are — a relationship beats an ad. And plan inventory and staffing around tax season, when down payments cluster and demand spikes.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/jeep-renegade-before.webp',
        after: '/studio/jeep-renegade-after.webp',
        beforeAlt: 'Jeep Renegade on a crowded buy here pay here lot with cluttered background, before editing',
        afterAlt: 'The same Jeep Renegade re-staged in a clean studio scene by AutoLander’s AI Photo Studio',
        caption: 'Payment-friendly inventory deserves showroom presentation: the same Jeep Renegade, from cluttered lot shot to clean scene via AutoLander’s AI Photo Studio. Respect for the buyer starts in the photo.',
      },
      {
        type: 'qa',
        q: 'What are the BHPH advertising rules?',
        a: [
          'The short version: advertise credit honestly or not at all. In the U.S., ads that state '
          + 'specific credit terms — a payment amount, a down payment, a rate — generally trigger '
          + 'federal truth-in-lending disclosure requirements, and state regulators watch this segment '
          + 'closely. Claims like "everyone rides" or "guaranteed approval" invite trouble the moment '
          + 'any applicant is declined or conditioned.',
          'The safe pattern is also the persuasive one: keep the ad plain ("in-house financing '
          + 'available — approval based on income and down payment"), put the numbers in the '
          + 'conversation where they can be accurate for that buyer, and have your compliance attorney '
          + 'review anything that mentions terms. This article is a marketing playbook, not legal advice.',
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Do',
          items: [
            'Say in-house financing is available and that approval depends on income and down payment',
            'Show a real price on every advertised unit',
            'Keep the story identical in the ad, on the phone, and at the desk',
            'Disclose fully whenever an ad states specific terms',
            'Describe vehicle condition honestly, flaws included',
          ],
        },
        right: {
          h2: 'Don’t',
          items: [
            'Promise "guaranteed approval" or "everyone is approved"',
            'Advertise a payment that only exists with an unstated giant down payment',
            'Use "no credit check" if you check anything at all',
            'Bury fees that surface for the first time at signing',
            'Let the ad write a check the finance desk will not cash',
          ],
        },
      },
      {
        type: 'qa',
        q: 'How do you get buy here pay here customers without big ad spend?',
        a: 'Be findable and be fast. Full [Marketplace coverage](/facebook-marketplace-for-car-dealers/) '
          + 'puts your units in front of the exact budget-and-payment shoppers you serve, at no listing '
          + 'cost; a strong review profile converts them; referrals from treated-well customers compound '
          + 'them; and answering inquiries within minutes wins the tie every time. Big ad spend in BHPH '
          + 'mostly amplifies whatever reputation already exists — build the reputation machine first.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'In BHPH, the collections experience is the brand. Reviews get written about how the '
          + 'fourteenth payment call went, not the delivery-day balloons — and no marketing outruns a '
          + 'reputation for hair-trigger repossession or moving-target fees. Marketing multiplies what '
          + 'the operation already is. If the [broader playbook](/guide/car-dealership-marketing/) is '
          + 'the engine, how you treat people mid-loan is the fuel.',
      },
    ],
    faq: [
      ['Does Facebook Marketplace work for buy here pay here dealers?',
        'Very well — Marketplace shoppers skew local and budget-conscious, which is the BHPH customer exactly. List every unit with a real price and honest photos, mention in-house financing plainly in the description, and answer messages fast. The listing sells the car; the financing conversation belongs on the phone or at the desk where it can be accurate.'],
      ['Can a BHPH dealer advertise guaranteed approval?',
        'Treat it as off-limits. Approval at a BHPH store still depends on income, down payment, and identity verification, so "guaranteed" is untrue for someone — and untrue credit claims draw both regulators and chargebacks of trust. "Approval based on income and down payment" is honest, compliant in spirit, and still communicates accessibility. Confirm specifics with your compliance attorney.'],
      ['What should a BHPH listing say about financing?',
        'One plain sentence: in-house financing is available, and approval is based on income and down payment. Keep specific numbers out of the listing — a payment quoted publicly must be accurate and fully disclosed, and it rarely survives contact with an individual buyer’s situation. Put real numbers in the real conversation.'],
      ['When is buy here pay here demand highest?',
        'Tax season is the famous spike — refunds become down payments, and prepared stores stock up and staff up ahead of it. Beyond that, demand follows urgency year-round: job changes, family changes, and breakdowns. The store that is findable and fast in an ordinary week owns the customer before the seasonal rush even starts.'],
      ['How important are reviews for a BHPH dealership?',
        'More important than in any other segment of car retail, because your customers arrive expecting to be mistreated. A profile full of recent reviews saying the store was straight, patient, and respectful converts skeptics no ad can reach. Earn them at delivery, at payoff, and — hardest but most valuable — through decent collections behavior.'],
    ],
    cta: {
      heading: 'Fill the payment book from the biggest local channel',
      sub: 'AutoLander keeps every BHPH unit live on Facebook Marketplace with honest prices and clean photos, and removes sold cars before they waste a buyer’s trip.',
    },
  },

  // ------------------------------------------------------------ /guide/car-sales-follow-up-templates/
  {
    slug: 'car-sales-follow-up-templates',
    silo: 'growth',
    anchor: 'Car sales follow-up templates your salespeople can send today',
    crumb: 'Follow-up templates',
    primaryKeyword: 'car sales follow up templates',
    secondaryKeywords: [
      'car sales text message templates',
      'how to follow up with car leads',
      'internet lead follow up',
    ],
    title: 'Car Sales Follow Up Templates That Get Replies',
    description:
      'Car sales follow up templates a real salesperson sends — first touch, day 2, day 5, price '
      + 'drop, anniversary — plus the cadence table that gets replies.',
    eyebrow: 'Dealer playbook',
    h1: 'Car sales follow-up templates that get replies',
    tldr:
      'Five follow-up templates cover almost every used-car lead: the first touch within minutes, a '
      + 'day-2 nudge, a day-5 value add, a same-day price-drop alert, and a delivery-anniversary '
      + 'check-in. The rules that make them work: short enough to read on a lock screen, one '
      + 'question per message, personalized fill-ins, and sent by a real salesperson — a template is '
      + 'a starting point for a human, never a canned blast.',
    sections: [
      {
        type: 'qa',
        q: 'What are the best car sales follow up templates?',
        a: [
          'The best templates are the five that map to how car leads actually behave: a first touch '
          + 'sent within minutes of the inquiry, a day-2 nudge that restarts the conversation, a day-5 '
          + 'message that adds new information instead of pressure, a price-drop alert sent the day the '
          + 'number changes, and a delivery-anniversary check-in that quietly farms trades and '
          + 'referrals. Each is below, with fill-ins.',
          'One thing before the copy: these are messages a human sends. A template saves your '
          + 'salesperson the blank-screen problem — it does not replace them. Buyers reply to people, '
          + 'and every message here is written to sound like one.',
        ],
      },
      {
        type: 'prose',
        paras: [
          'Ground rules for all five: text beats email for speed and read rates, so default to text '
          + 'once a buyer has given a number. Keep every message under four sentences with exactly one '
          + 'question. Fill in the braces — {first name}, {vehicle}, {store} — from the actual lead, '
          + 'because a template with the wrong car does more damage than no follow-up at all. And log '
          + 'every touch where the next shift can see it.',
        ],
      },
      {
        type: 'steps',
        h2: 'The five templates: copy, fill in, send',
        intro: 'Written for texting; trim the greeting and they work as email openers too.',
        steps: [
          { title: 'First touch — within minutes of the lead', body: '"Hi {first name}, this is {your name} at {store}. You asked about the {year} {make} {model} — it’s here and available. Would this afternoon or tomorrow morning work to come see it? I’ll have it pulled up front either way." Speed is the whole play — the buyer messaged other stores in the same sitting, and the first real answer usually gets the appointment. The [speed-to-lead playbook](/guide/car-sales-leads/) covers the discipline behind the template.' },
          { title: 'Day 2 — the nudge', body: '"Hi {first name}, {your name} at {store} again. The {model} you asked about is still here. Anything I can answer — payments, trade, more photos? Happy to send a quick walkaround video too." Low pressure, one open question, and an offer that costs the buyer nothing to accept.' },
          { title: 'Day 5 — value, not pressure', body: '"Hi {first name} — no rush from me. Two things on the {model}: the history report came back clean and I can send it over, and if you’re weighing numbers I can put a real value on your current vehicle in about ten minutes. Want either?" The rule: day 5 earns attention with new information. "Just checking in" is not new information.' },
          { title: 'Price drop — the same day it happens', body: '"Hi {first name}, {your name} at {store}. Heads up — the {year} {model} you looked at dropped to {new price} today. Wanted you to hear it from me first. Still interested?" This is the highest-reply template in the set, and it only works if the listing the buyer re-opens shows the same new number — [automatic price updates](/facebook-marketplace-inventory-sync/) keep the posted listing matching the message.' },
          { title: 'Delivery anniversary — the long game', body: '"Happy one year with the {model}, {first name}! Hope it’s been treating you well. If you ever want a quick trade-in number — or know someone who’s looking — I’m easy to find. {your name} at {store}." Cheap, kind, and where next year’s trades and referrals come from.' },
        ],
      },
      {
        type: 'table',
        h2: 'The follow-up cadence at a glance',
        intro: 'Tape it to the CRM monitor. The cadence matters more than any single message.',
        head: ['Touch', 'When', 'Channel', 'Goal'],
        rows: [
          ['First touch', 'Within minutes of the lead', 'Text (or call, then text)', 'Confirm availability, offer two visit windows'],
          ['Nudge', 'Day 2', 'Text', 'Restart the thread with one easy question'],
          ['Value add', 'Day 5', 'Text or email', 'Give new information: report, trade number, video'],
          ['Price drop', 'The day the price changes', 'Text', 'A genuine reason to reconnect — highest reply rate'],
          ['Long-term', 'Every few weeks, then anniversary', 'Text or email', 'Stay the store they call when timing changes'],
        ],
        note: 'After the day-5 touch, slow to every couple of weeks. Persistence wins deals; pestering writes bad reviews.',
      },
      {
        type: 'qa',
        q: 'How do you follow up with internet car leads?',
        a: [
          'Reference the exact car and the exact source in the first line — "you asked about the '
          + 'Silverado on our site last night" — because an internet lead is often three tabs deep in '
          + 'other stores and needs the memory jog. Then run the cadence above: minutes, day 2, day 5, '
          + 'then every couple of weeks. Five to six touches over two weeks, logged in the CRM, before '
          + 'sliding to a monthly rhythm.',
          'And know when to stop pushing: after a buyer says no or goes quiet for a month, one '
          + 'graceful exit text ("I’ll stop bugging you — if the {model} is still here when '
          + 'you’re ready, you know where I am") preserves the relationship for the next cycle.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Templates cannot rescue a broken upstream. If the listing still shows last week’s '
          + 'price, the photos hide the dent, or the car quietly sold on Tuesday, the best-written '
          + 'follow-up in the world opens with an apology. To be clear about our own lane: AutoLander '
          + 'never sends messages for you and has no access to your inbox — every template here is sent by '
          + 'your salesperson. What AutoLander does is [keep the listing behind the lead](/facebook-marketplace-auto-poster/) '
          + 'live, priced right, and gone when sold, so the follow-up never contradicts what the buyer '
          + 'is looking at.',
      },
    ],
    faq: [
      ['How many times should you follow up with a car lead?',
        'Five to six touches across the first two weeks — minutes, day 2, day 5, then spaced out — followed by a light monthly rhythm until they buy, say stop, or go permanently quiet. Most salespeople quit after one or two touches, which is why the store that politely persists picks up deals everyone else abandoned.'],
      ['Should car sales follow-up be text or email?',
        'Text, once the buyer has shared a number — it gets read in minutes, where email waits hours or forever. Email still earns its keep for long attachments like history reports and for the slow monthly rhythm. Whichever channel, the same rules hold: short, personal, one question, sent by a person.'],
      ['How fast should the first follow-up go out?',
        'Within minutes of the lead arriving, during business hours. Car shoppers inquire at several stores in one sitting and the first useful human answer usually wins the appointment. If a lead lands overnight, it goes out first thing next morning — never batch first touches to the afternoon.'],
      ['Can I automate car sales follow-up messages?',
        'CRMs can remind your team and schedule tasks, and that is worth doing — but the messages that get replies read like they came from a person, because they did. AutoLander does not send messages at all and has no inbox access. Its job is upstream, keeping the listing a lead came from live and priced right so your human follow-up holds up.'],
      ['What do you text a car lead who went quiet?',
        'One graceful exit after the cadence runs out: "Sounds like the timing isn’t right — I’ll stop bugging you. If the {model} is still here when you’re ready, you know where I am." It costs nothing, reads like respect, and quietly converts weeks later more often than any pressure play.'],
    ],
    cta: {
      heading: 'Make every follow-up point at a live listing',
      sub: 'AutoLander never sends messages — it keeps the listings behind your leads posted, priced right, and removed when sold, so your follow-ups always match what the buyer sees.',
    },
  },

  // ------------------------------------------------- /guide/how-to-price-used-cars-competitively/
  {
    slug: 'how-to-price-used-cars-competitively',
    silo: 'growth',
    anchor: 'How to price used cars competitively (price-to-market)',
    crumb: 'Pricing used cars',
    primaryKeyword: 'how to price used cars',
    secondaryKeywords: [
      'used car pricing strategy',
      'price to market used cars',
      'when to drop the price on a used car',
    ],
    title: 'How to Price Used Cars: The Price-to-Market Playbook',
    description:
      'How to price used cars with price-to-market discipline: live comps, the four Marketplace '
      + 'price bands from 10,823 dealer listings, and when to drop the price.',
    eyebrow: 'Dealer playbook',
    h1: 'How to price used cars competitively',
    tldr:
      'Price used cars to the market, not to the money in them: position each unit against the live '
      + 'comparable listings a shopper actually sees, adjust for miles and condition, put one price '
      + 'on every channel, and review it on a calendar. Repricing is routine — 22.6% of dealer '
      + 'Marketplace listings changed price after going live in AutoLander’s 2026 report — so '
      + 'build the cadence in from day one instead of treating a drop as defeat.',
    sections: [
      {
        type: 'qa',
        q: 'How do you price used cars competitively?',
        a: [
          'You price to market: find the comparable units a buyer in your radius actually sees today, '
          + 'position your car deliberately against them, and let cost inform the exit plan rather than '
          + 'the sticker. Online, price is a filter before it is a negotiation — shoppers cap their '
          + 'search and never see the listings above it, so a unit priced on hope is not "negotiable," '
          + 'it is invisible.',
          'The market you are pricing into is knowable. Across 10,823 priced dealer listings in '
          + '[AutoLander’s 2026 Marketplace report](/facebook-marketplace-used-car-report-2026/), '
          + 'the median asking price was $28,295 — real dealers posting real inventory to the channel '
          + 'where local buyers filter hardest on price. Discipline, not instinct, is what competes '
          + 'there.',
        ],
      },
      {
        type: 'steps',
        h2: 'Price-to-market in six steps',
        intro: 'Run the loop when the unit hits the lot, then on a schedule until it leaves.',
        steps: [
          { title: 'Pull the comps a buyer actually sees', body: 'Search your own market like a shopper: same model, similar year and miles, within the radius a buyer would drive. Marketplace, the portals, and nearby store sites — screenshot the field into the deal jacket so the pricing conversation starts from evidence.' },
          { title: 'Adjust for what buyers compare', body: 'Miles, trim and options, and visible condition — in that order. A one-owner with records and better photos earns a premium over the same car with neither; a salvage-adjacent history has to lead the field on price to move at all.' },
          { title: 'Choose the position on purpose', body: 'Front of the field for volume goals, aged risk, or common cars in deep supply; middle of the field for fresh, desirable units with a story. What is never a strategy is pricing above the field and waiting — the filter hides you.' },
          { title: 'Sanity-check the floor', body: 'Acquisition plus recon plus a realistic holding cost is your floor. If the market clears below it, that is an acquisition lesson to feed back into buying — not a reason to price above the market and hope.' },
          { title: 'Put one price everywhere', body: 'The Marketplace listing, the portal, the website, and the windshield must agree — a buyer who catches a mismatch assumes the worst about all four. This is the step most worth automating: [automatic price updates](/facebook-marketplace-inventory-sync/) push every reprice to the posted listings the moment the feed changes.' },
          { title: 'Schedule the review before emotions arrive', body: 'A weekly pricing touch on every unit, with hard checkpoints at 30, 45, and 60 days. Calendar-driven repricing removes the sales-meeting argument — the calendar made the decision when the car was priced.' },
        ],
      },
      {
        type: 'table',
        h2: 'Where dealer Marketplace listings actually price',
        intro: 'From AutoLander’s 2026 Marketplace report — 10,823 priced dealer listings across 196 U.S. dealerships, May through August 2026. This is the field your unit enters when it posts.',
        head: ['Price band', 'Share of dealer listings'],
        rows: [
          ['Under $10,000', '6.6%'],
          ['$10,000–$19,999', '21.1%'],
          ['$20,000–$29,999', '26.9%'],
          ['$30,000+', '45.4%'],
        ],
        note: 'Median asking price: $28,295, with the middle half of listings between $19,199 and $42,000. Data CC BY 4.0.',
      },
      {
        type: 'prose',
        paras: [
          'Two practical reads from that table. Nearly half of posted dealer inventory sits at $30,000 '
          + 'and up — so a sharply priced unit under $20,000 enters a thinner field with outsized '
          + 'attention, which is exactly what budget-capped Marketplace shoppers are filtering for. '
          + 'And at the crowded $20,000–$30,000 heart of the market, position within the band decides '
          + 'who gets the click: at the median price point, a few hundred dollars moves you past a '
          + 'dozen lookalike listings.',
        ],
      },
      {
        type: 'qa',
        q: 'When should you drop the price on a used car?',
        a: [
          'On a schedule, in meaningful moves. The working cadence: touch every unit weekly; if views '
          + 'and leads are flat by day 30, take a real drop, not a nibble — a cut that crosses a common '
          + 'search threshold (from $20,500 to $19,900, say) puts the car in front of every buyer whose '
          + 'filter ends at $20,000, which a $100 trim never does. Repeat the hard look at 45 and 60 '
          + 'days with the exit plan on the table.',
          'Treat repricing as normal retailing, not surrender: 22.6% of dealer listings changed price '
          + 'after going live across the 10,823-listing sample in '
          + '[the 2026 report](/facebook-marketplace-used-car-report-2026/). Roughly one unit in five '
          + 'gets repriced — the stores that do it on a calendar just do it sooner, and cheaper.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ram-1500-before.webp',
        after: '/studio/ram-1500-after.webp',
        beforeAlt: 'Ram 1500 pickup in a dark, cluttered dealer lot photo, before editing',
        afterAlt: 'The same Ram 1500 re-staged in a clean, well-lit scene by AutoLander’s AI Photo Studio',
        caption: 'Price and presentation set position together: the same Ram 1500, lot clutter versus a clean scene from [AutoLander’s AI Photo Studio](/ai-car-photo-editor/). At the same price, the better-presented truck gets the click.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Price-to-market cannot rescue a bad buy — if the market clears below your all-in cost, '
          + 'the pricing decision is really a timing decision about how small the loss will be, and '
          + 'week 2 is almost always cheaper than week 10. The other honesty: a transparent price only '
          + 'builds trust if the desk honors it. A sharp number online followed by surprise fees at '
          + 'signing converts your best marketing into your worst review.',
      },
    ],
    faq: [
      ['Should you price used cars high to leave room to negotiate?',
        'No — online, an above-market price is not an opening position, it is a filter that hides the car. Shoppers cap their search and never see your listing, so you lose the click you were hoping to negotiate with. Price to the field, hold closer to the number, and let the desk win on trade and terms instead.'],
      ['How often should a dealership reprice used cars?',
        'Touch every unit weekly, with hard checkpoints at 30, 45, and 60 days on the lot. Weekly touches catch market shifts while they are cheap to correct; the checkpoints force the bigger conversation — meaningful drop, merchandising fix, or exit — before holding costs quietly eat the deal.'],
      ['Why do price drops restart interest in a listing?',
        'Mostly filter mechanics: shoppers search with a price ceiling, so a drop that crosses a common threshold — $20,000, $15,000, $10,000 — exposes the car to an audience that literally could not see it the day before. That is why meaningful moves outperform $100 trims: a nibble rarely crosses anyone’s line.'],
      ['What if my price is different on Marketplace than on my website?',
        'Fix it today — a mismatch is worse than either number. Buyers screenshot the lower price and open the negotiation there, or assume bait-and-switch and never contact you at all. One price everywhere is the rule, and syncing posted listings to your feed automatically is the only way it survives a busy month.'],
      ['Do I need a pricing tool to price to market?',
        'A tool helps, but the discipline is the strategy: real comps pulled like a shopper would, a deliberate position in the field, one price on every channel, and a calendar that forces the reprice conversation. A store that runs that loop with screenshots beats a store with an expensive tool and no cadence.'],
    ],
    cta: {
      heading: 'Reprice once, update everywhere',
      sub: 'AutoLander syncs every price change from your feed to your posted Facebook Marketplace listings automatically — so the number the buyer sees is always the number you meant.',
    },
  },

  // --------------------------------------------- /guide/google-business-profile-for-car-dealers/
  {
    slug: 'google-business-profile-for-car-dealers',
    silo: 'growth',
    anchor: 'Google Business Profile setup for car dealerships, field by field',
    crumb: 'Google Business Profile',
    primaryKeyword: 'google business profile for car dealership',
    secondaryKeywords: [
      'how to get more dealership reviews',
      'google business profile photos dealership',
      'dealership not showing on google maps',
    ],
    title: 'Google Business Profile for Car Dealerships: Full Setup',
    description:
      'Google Business Profile for car dealership trust: every field that matters, the photos to '
      + 'add, a delivery-day review script, and Google Maps troubleshooting.',
    eyebrow: 'Dealer growth guide',
    h1: 'Google Business Profile for car dealerships, field by field',
    tldr:
      'A car dealership’s Google Business Profile is the trust check nearly every buyer runs '
      + 'before visiting: claim and verify it, use your exact real-world name, pick honest '
      + 'categories, complete the hours, load real photos of the lot and the people, point the '
      + 'website link at your inventory, seed the Q&A, and build a steady review rhythm with a '
      + 'delivery-day ask. Local search visibility follows completeness and review velocity.',
    sections: [
      {
        type: 'qa',
        q: 'How should a car dealership set up its Google Business Profile?',
        a: [
          'Completely, honestly, and once — then feed it forever. The profile is what appears when a '
          + 'buyer who found your car somewhere else searches your name, and it is how you show up on '
          + 'the map for "used car dealer near me." Every empty field is a question a buyer answers '
          + 'with a guess: no hours means "probably closed," six stale photos means "probably a '
          + 'shabby lot," unanswered reviews mean "probably doesn’t care."',
          'The build below takes an afternoon. The review rhythm that follows is the part that '
          + 'compounds — recency and volume of reviews, plus how you answer them, drive both the '
          + 'trust decision and your local search visibility.',
        ],
      },
      {
        type: 'steps',
        h2: 'The field-by-field build',
        intro: 'Work top to bottom. None of this requires an agency — just accuracy and an afternoon.',
        steps: [
          { title: 'Claim and verify the profile', body: 'Search your dealership’s name, claim the listing if you have not, and complete Google’s verification. Unverified profiles are invisible or uneditable — nothing else on this list matters until this is done.' },
          { title: 'Use your exact real-world name', body: 'The name on the profile must match the sign on the building. Resist stuffing extra descriptive words into the name field — it violates Google’s rules and is a common suspension trigger that takes the whole profile off the map.' },
          { title: 'Pick categories deliberately', body: 'Primary category "Used car dealer" for a used lot (or your true primary business), then secondary categories only for what you genuinely do — car dealer, auto repair if you have a service drive. Categories decide which searches you can appear for.' },
          { title: 'Complete the hours — including the odd ones', body: 'Regular hours, weekend hours, holiday closures. Wrong hours produce the angriest one-star reviews a store can earn: someone drove out to a locked gate.' },
          { title: 'Load real photos, then keep them coming', body: 'The building and signage a visitor should look for, the showroom, lot rows, a few current vehicles, and the actual people. No stock photos — buyers can smell them. Add a fresh handful monthly so the profile never looks abandoned.' },
          { title: 'Point every link where buyers act', body: 'Website link to your inventory page, not a generic homepage — the buyer checking you out wants the cars. Phone number that rings a human during posted hours; calls from the profile deserve the same [speed you give any lead](/guide/car-sales-leads/).' },
          { title: 'Seed and watch the Q&A', body: 'Anyone can ask and answer questions on your profile, so get there first: post and answer the questions you hear daily — financing available? trades welcome? test drives walk-in? — and check back for new ones.' },
          { title: 'Turn on the review rhythm', body: 'The delivery-day ask below, plus a reply to every review within a few days. This is the ongoing engine; everything above is setup.' },
        ],
      },
      {
        type: 'qa',
        q: 'How do you get more dealership reviews?',
        a: [
          'Ask every buyer, in person, on delivery day — the one moment they are demonstrably happy '
          + 'with you. The script that works: "Before you head out — would you take sixty seconds and '
          + 'leave us a Google review? It’s the single biggest thing that helps a small store like '
          + 'ours. I’ll text you the link right now." Then actually text the link while they are '
          + 'standing there; asks that depend on the buyer remembering later mostly evaporate.',
          'Velocity and recency beat totals: a steady flow of fresh reviews with thoughtful replies '
          + 'outperforms a big stale pile. And two hard rules — ask everyone rather than pre-screening '
          + 'the happy ones (selectively gating reviews violates Google’s policy), and never pay '
          + 'or incentivize a review.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What photos belong on a dealership’s profile',
        intro: 'Buyers use profile photos to answer one question: what will it feel like to show up?',
        items: [
          'The building and signage from the road — the "you have arrived" shot',
          'The lot with rows of clean inventory, shot on a bright day',
          'The showroom and customer area, so the visit feels predictable',
          'A rotating handful of current vehicles — real units, not renders',
          'The team, named where people are comfortable — buyers pick stores where they can picture the handshake',
          'Anything that proves the odd amenities: service bays, kids’ corner, coffee',
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Do',
          items: [
            'Ask every buyer for a review on delivery day, in person',
            'Text the direct review link on the spot',
            'Reply to every review, good and bad, within days',
            'Mention the salesperson’s name in the ask — reviews that name people read as real',
            'Report fake or wrong-business reviews through the profile tools',
          ],
        },
        right: {
          h2: 'Don’t',
          items: [
            'Screen for happy customers and only ask them — gating violates Google’s policy',
            'Pay, discount, or gift for reviews',
            'Argue in review replies — the reply is for the next reader, not the reviewer',
            'Blast the same customer with repeated requests',
            'Let a month of reviews sit unanswered',
          ],
        },
      },
      {
        type: 'qa',
        q: 'Why is my dealership not showing on Google Maps?',
        a: [
          'Run the checklist in order. First: is the profile actually verified? Second: is it '
          + 'suspended? Name changes, names stuffed with extra words, address edits, and virtual-office '
          + 'addresses are the classic triggers — you will see a notice when you open the profile '
          + 'manager. Third: duplicates — an old listing for the same lot splits your identity; find '
          + 'and merge or remove it. Fourth: category and address accuracy — a wrong primary category '
          + 'or a mismatched address quietly buries you.',
          'If all of that is clean, remember that map results are local by design: you appear '
          + 'strongest near your actual location, and a competitor outranking you on their side of '
          + 'town is normal, not a penalty. The levers you control are completeness, review velocity, '
          + 'and consistency of your name, address, and phone everywhere they appear on the web.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'A perfect profile does not list your cars — buyers find the unit on '
          + '[Facebook Marketplace](/facebook-marketplace-for-car-dealers/) or a portal, then run the '
          + 'Google check on your name minutes later. The profile wins or loses that second search, '
          + 'not the first one. Treat it as the trust layer of the '
          + '[broader marketing stack](/guide/car-dealership-marketing/): essential, cheap, and '
          + 'useless in isolation.',
      },
    ],
    faq: [
      ['How many Google reviews does a car dealership need?',
        'There is no magic number — buyers read the newest handful and your replies, then decide. A store adding a few fresh reviews every month with thoughtful responses beats a store with hundreds of old ones and silence. Aim for rhythm over volume: every delivery gets the ask, every review gets a reply.'],
      ['Should a dealership respond to negative reviews?',
        'Always, within days, and calmly — the reply is written for the next hundred readers, not the angry author. Acknowledge, state your side factually without arguing, and offer to make it right offline with a name and number. A composed reply under a harsh review often builds more trust than the five-star ones.'],
      ['Can you reward customers for leaving reviews?',
        'No. Paying, discounting, or gifting for reviews violates Google’s policies and risks the whole profile — and buyers increasingly spot bought reviews anyway. The compliant version is simply removing friction: ask in person at delivery and text the direct link so the review takes sixty seconds.'],
      ['How often should a dealership add photos to its profile?',
        'A small batch monthly is plenty — a few current vehicles, a fresh lot shot, anything new about the store. Steady additions signal an open, active business to both buyers and the map results, while a profile whose newest photo is two years old quietly reads as closed.'],
      ['Does a Google Business Profile replace a dealership website?',
        'No — they answer different questions. The profile proves the store is real, open, and reviewed; the website proves the specific car with photos and a matching price. A buyer typically touches both within minutes, so the phone number, hours, and prices need to agree everywhere they look.'],
    ],
    cta: {
      heading: 'Win the trust check and the car search',
      sub: 'Google proves your store — AutoLander keeps every unit live on Facebook Marketplace with clean photos and current prices, so both searches a local buyer runs come back strong.',
    },
  },

  // ------------------------------------- /guide/respond-to-facebook-marketplace-messages-dealer/
  {
    slug: 'respond-to-facebook-marketplace-messages-dealer',
    silo: 'growth',
    anchor: 'How to respond to Facebook Marketplace messages as a dealer',
    crumb: 'Answering Marketplace messages',
    primaryKeyword: 'how to respond to facebook marketplace messages',
    secondaryKeywords: [
      'facebook marketplace message templates for sellers',
      'is this available reply',
      'marketplace buyers who stop responding',
    ],
    title: 'How to Respond to Facebook Marketplace Messages (Dealer)',
    description:
      'How to respond to Facebook Marketplace messages as a dealer: the "Is this available?" '
      + 'reply, six buyer-message templates, and the path to an appointment.',
    eyebrow: 'Marketplace playbook',
    h1: 'How to respond to Facebook Marketplace messages as a dealer',
    tldr:
      'Respond to Facebook Marketplace messages within minutes, like a person: confirm the car is '
      + 'available, give your name, and ask one question that advances the deal — their timing, '
      + 'their name, or their trade. Never send a bare "yes." From there the ladder is chat to '
      + 'phone to a booked appointment with two offered time windows. Every reply here is one a '
      + 'human salesperson sends — the inbox is yours, not software’s.',
    sections: [
      {
        type: 'qa',
        q: 'How should a dealer respond to Facebook Marketplace messages?',
        a: [
          'Fast, human, and always advancing. The formula for nearly every reply: answer the actual '
          + 'question, give a first name, and ask exactly one question back that moves toward a visit '
          + '— when they could come by, what name to put the appointment under, whether they have a '
          + 'trade. One question, not three; an interrogation kills more Marketplace threads than any '
          + 'price ever has.',
          'Speed sets the ceiling on everything else. Marketplace buyers message several sellers in '
          + 'one scrolling session, and the listing that answers first — within minutes, not hours — '
          + 'usually gets the appointment. Put one named person on the inbox each shift with the '
          + 'phone in their pocket.',
        ],
      },
      {
        type: 'qa',
        q: 'What is the right reply to "Is this available?"',
        a: [
          'Confirm availability, introduce yourself, and attach one advancing question: "Yes — the '
          + '{year} {make} {model} is still available. I’m {name} at {store}. Are you hoping to '
          + 'come see it this week? Tell me roughly when and I’ll have it pulled up front." '
          + 'Availability plus a name plus a soft commitment question, in three sentences.',
          'Do not read the message as low intent just because it took one tap — Facebook offers '
          + 'buyers that pre-filled question, so it is simply how Marketplace conversations begin. '
          + 'Treat it as a raised hand: the buyer filtered by price and distance, opened your '
          + 'listing, and started a conversation. Your reply does the qualifying, not the button.',
        ],
      },
      {
        type: 'table',
        h2: 'Templates for the six messages every dealer gets',
        intro: 'Fill in the braces and send them as written — short, plain, one question each.',
        head: ['Buyer message', 'What they are really asking', 'A reply that advances'],
        rows: [
          ['"Is this available?"', 'Is this listing real and current?', '"Yes, still available — I’m {name} at {store}. Want to come see it this week? Tell me when and I’ll have it up front."'],
          ['"What’s your best price?"', 'Will negotiating be painful?', '"It’s listed at {price}, priced against everything comparable nearby. Come drive it — if it’s not worth the number in person, tell me to my face."'],
          ['"Will you take {low offer}?"', 'How flexible are you, really?', '"I can’t do {offer}, but if you’re serious, come see it — bring your trade if you have one and we’ll make the numbers real at the desk."'],
          ['"Any problems? Been in an accident?"', 'Can I trust you?', '"Fair question — {honest condition summary}. I can send the history report right now if you want it. What else should I check for you?"'],
          ['"Can you send more photos / the VIN?"', 'I’m verifying before I drive out', '"Absolutely — sending both now. Anything specific you want a close-up of? And when were you thinking of coming by?"'],
          ['"Where are you located?"', 'I’m planning the trip', '"We’re at {address}, open until {time} today. Want me to set the {model} aside for a time that works? Morning or afternoon better?"'],
        ],
        note: 'The condition question deserves the flaw included in the answer. Honesty in chat is cheap; a buyer discovering the dent in person is expensive.',
      },
      {
        type: 'steps',
        h2: 'From chat to appointment in five moves',
        intro: 'Chat is where deals start, not where they close. Climb the ladder deliberately.',
        steps: [
          { title: 'Answer inside minutes during posted hours', body: 'Assign the inbox to one named person per shift. Overnight messages get answered first thing in the morning — never batched into the afternoon. Speed is the discipline the whole [speed-to-lead playbook](/guide/car-sales-leads/) is built on.' },
          { title: 'Trade names early', body: 'Give yours in the first reply and use theirs once you have it. Named conversations survive; anonymous ones evaporate. It also sets up the appointment: "I’ll put it under {first name}."' },
          { title: 'Offer two concrete windows, never "come by whenever"', body: '"Would tomorrow morning or Thursday after work suit you better?" A choice between two real options books; an open invitation drifts. Confirm which car, which day, which time, out loud.' },
          { title: 'Move to phone or text for logistics', body: 'Once a visit is real, ask for a number to text directions and a confirmation. The thread got the appointment; the phone keeps it — and a buyer who shares a number is measurably further down the funnel.' },
          { title: 'Confirm morning-of, with the car’s status', body: '"Still on for 4:30 — the {model} is washed and up front." One text, sent by you, that separates the stores buyers rave about from the ones they ghost.' },
        ],
      },
      {
        type: 'qa',
        q: 'What about Marketplace buyers who stop responding?',
        a: [
          'Expect it — ghosting is the default behavior on Marketplace, because buyers open several '
          + 'conversations and pursue the one that answered best. Send one bump the next day: "Hi '
          + '{first name}, the {model} is still available — happy to answer anything or set up a '
          + 'quick look. If the timing’s wrong, no worries at all." Then stop. A second unsolicited '
          + 'push reads as pressure and earns reports, not replies.',
          'The durable fix is upstream: threads mostly die when the reply was slow or the listing '
          + 'looked stale. Fast first responses and accurate listings quietly cut your ghost rate '
          + 'more than any recovery message ever will.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'None of this is automated, and none of it should be: AutoLander does not read, route, '
          + 'or answer Marketplace messages — the inbox is entirely yours. Its contribution happens '
          + 'before the conversation starts: the listing the buyer is asking about is live, the '
          + 'price is current, and sold units are '
          + '[removed the day they deliver](/facebook-marketplace-inventory-sync/) — because the '
          + 'worst reply in car retail is "sorry, that one actually sold last week."',
      },
    ],
    faq: [
      ['How fast should a dealer respond to Marketplace messages?',
        'Within minutes during business hours — Marketplace buyers message several sellers in one sitting, and the first useful, human answer usually wins the appointment. Overnight messages get a reply first thing next morning. One named owner per shift, phone in pocket, beats a shared inbox every time.'],
      ['Should you give your phone number in Marketplace chat?',
        'Yes, once the conversation is real and a visit is forming — moving to phone or text for directions and confirmation is how chats become appointments. Be wary of the reverse pattern: a "buyer" pushing to move off-platform immediately, before asking anything about the car, is usually not a buyer.'],
      ['How do you spot scam messages on Marketplace?',
        'The classics: someone asking you to read back a verification code sent to your phone, overpayment or shipping offers on a local car, and instant requests to continue on some other site through a link. Real buyers ask about the car, the price, and when they can see it. When a message fits the scam shape, stop replying.'],
      ['Can you use auto-replies on Facebook Marketplace?',
        'Keeping canned openers saved on your phone to paste and personalize is fine — a human is still reading and sending. Full automation of a personal inbox is different territory for both policy and trust, covered honestly in the [Marketplace automation guide](/guide/facebook-marketplace-automation/). AutoLander itself stays out of the inbox entirely: it automates listings, never conversations.'],
      ['What if the car sold but messages keep coming in?',
        'Mark it sold and pull the listing everywhere the moment it delivers — every message after that is a buyer you are about to disappoint. If a straggler asks anyway, answer honestly and pivot once: "That one sold, but here’s what else I have near that price." Then update your removal routine so it stops happening.'],
    ],
    cta: {
      heading: 'Walk into every chat with a listing you can stand behind',
      sub: 'AutoLander never touches your inbox — it keeps the listing behind the message live, priced right, and removed the day the car sells.',
    },
  },

  // --------------------------------------------------------- /guide/aged-inventory-used-car-dealers/
  {
    slug: 'aged-inventory-used-car-dealers',
    silo: 'growth',
    anchor: 'The 30/45/60-day aged inventory playbook for used car dealers',
    crumb: 'Aged inventory',
    primaryKeyword: 'aged inventory car dealership',
    secondaryKeywords: [
      'how to move aged inventory',
      '60 day old used car strategy',
      'aged unit marketing ideas',
    ],
    title: 'Aged Inventory at a Car Dealership: The 30/45/60 Playbook',
    description:
      'Aged inventory car dealership playbook: why units age, the 30/45/60-day triage — reprice, '
      + 'reshoot, renew — and when paying to boost finally makes sense.',
    eyebrow: 'Dealer playbook',
    h1: 'Aged inventory: the 30/45/60-day playbook',
    tldr:
      'Aged inventory is any unit past your day-supply comfort line — commonly flagged at 30, 45, '
      + 'and 60 days on a used lot. Units age for three reasons: price position, presentation, or '
      + 'coverage, and the triage runs in that order of cost — check exposure first, reshoot the '
      + 'photos, reprice meaningfully, refresh the listing, and only pay to boost once price and '
      + 'photos are proven fixed. Past 60 days, the cheapest loss is usually the earliest one.',
    sections: [
      {
        type: 'qa',
        q: 'What counts as aged inventory at a car dealership?',
        a: [
          'Any unit whose days-on-lot have crossed the line where holding costs and depreciation '
          + 'start eating the deal — most used-car operations flag 30 days as a warning, 45 as an '
          + 'alarm, and 60 as a decision point. The clock starts at acquisition, not at the first '
          + 'listing, because the money is committed either way: floorplan interest or trapped '
          + 'capital, insurance, lot space, and a retail value that only moves one direction.',
          'The management answer is a calendar, not a feeling. Aged units accumulate wherever the '
          + 'reprice conversation happens by argument in a sales meeting; they clear wherever a '
          + 'written triage fires automatically at 30, 45, and 60 days.',
        ],
      },
      {
        type: 'qa',
        q: 'Why do units actually age?',
        a: 'Three causes, in rough order of frequency: price position (the car is listed above the '
          + 'field a buyer actually sees, so the filter hides it), presentation (the photos lose the '
          + 'scroll to better-merchandised listings at the same price), and coverage (the unit was '
          + 'never live everywhere it should be — or a listing quietly expired weeks ago). The '
          + 'diagnosis matters because the fixes cost wildly different amounts, and a mispriced car '
          + 'and an invisible car look identical on the aging report. Check coverage first; it is '
          + 'the free fix, and the [marketing playbook](/guide/car-dealership-marketing/) treats it '
          + 'as the foundation for a reason.',
      },
      {
        type: 'steps',
        h2: 'The 30/45/60-day triage playbook',
        intro: 'Written as a standing routine: every unit, every week, actions firing on the calendar.',
        steps: [
          { title: 'Day 1: put every unit on the age clock', body: 'The aging report runs weekly, sorted oldest first, with one named owner. Nothing below works if the list is only consulted when the lot feels full.' },
          { title: 'Day 30: audit exposure before touching price', body: 'Is the unit actually live on Marketplace, the portals, and your site — at the current price, with the listing not expired? Flat leads on a live listing and a listing that silently died are different diseases. A [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) makes this a non-question by keeping the whole lot posted and renewed.' },
          { title: 'Day 30: reshoot the photos', body: 'A new lead photo is the cheapest facelift a listing can get. An [AI car photo editor](/ai-car-photo-editor/) re-stages the existing shots into clean scenes in minutes — no re-photographing, no waiting for a sunny day — and a walkaround-style video gives the listing a second wind of attention.' },
          { title: 'Day 30–45: reprice meaningfully', body: 'Pull fresh comps and take a move that crosses a common search threshold, not a $100 nibble. Repricing is normal retailing, not defeat — 22.6% of dealer listings changed price after going live across 10,823 listings in [AutoLander’s 2026 Marketplace report](/facebook-marketplace-used-car-report-2026/).' },
          { title: 'Day 45: refresh the listing itself', body: 'Renew it so it stops sitting under weeks of newer listings, reorder the gallery behind the new lead photo, and rewrite the first line of the description — the aged unit should read like it was listed this morning, because to the next shopper it was.' },
          { title: 'Day 60: now — and only now — consider paid', body: 'A boost on a mispriced, badly shot listing is burned money. By day 60 the price is proven market-correct and the photos compete, so a small paid push or retargeting finally has a fair test — and a measurable one.' },
          { title: 'Day 60+: set the exit', body: 'Decide the wholesale floor and the date you will take it, in writing, before emotions argue for week twelve. The cheapest loss is almost always the earliest one you were willing to book.' },
        ],
      },
      {
        type: 'figure',
        before: '/studio/toyota-tundra-before.webp',
        after: '/studio/toyota-tundra-after.webp',
        beforeAlt: 'Toyota Tundra pickup in a dark, cluttered dealer lot photo, before editing',
        afterAlt: 'The same Toyota Tundra re-staged in a clean, well-lit scene by AutoLander’s AI Photo Studio',
        caption: 'Sixty days on the lot is often a photo problem: the same Toyota Tundra, dark lot shot versus the clean scene AutoLander’s AI Photo Studio built from it. A new lead photo makes an old listing new.',
      },
      {
        type: 'table',
        h2: 'The triage at a glance',
        head: ['Day mark', 'Question to answer', 'Action'],
        rows: [
          ['30', 'Was it ever really seen?', 'Verify coverage everywhere; reshoot the photos'],
          ['45', 'Is the price telling the truth?', 'Meaningful reprice across a threshold; renew and refresh the listing'],
          ['60', 'Is retail still the right exit?', 'Paid push on the fixed listing — or book the wholesale loss now'],
        ],
        note: 'Each action assumes the previous one happened. Paying to promote a unit that failed steps one and two just advertises the problem.',
      },
      {
        type: 'bullets',
        h2: 'Aged unit marketing ideas that actually move cars',
        intro: 'Once coverage, photos, and price are fixed, these add attention without adding much cost.',
        items: [
          'Lead with a brand-new hero photo and a reordered gallery — returning shoppers see a different car',
          'Add a walkaround-style video; listings with motion hold attention longer than stills',
          'Move the unit physically to the front row — lot position is marketing too',
          'Feature it honestly on your social pages: "priced to leave this week" with the real number',
          'Reprice across a filter threshold so an entirely new price-capped audience sees it for the first time',
          'Pair it in conversation: every buyer who passes on a fresher unit hears about the aged one and its sharper price',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Some cars age because they were bought wrong — too much money in the trade, the wrong '
          + 'unit for your market — and no triage fixes acquisition. What the playbook does is '
          + 'separate the savable from the sunk sooner, while the loss is small. And a word on '
          + 'renewals: refreshing a listing simply puts it back in front of shoppers browsing newest '
          + 'listings — it is real, it is worth doing on schedule, and it is not magic. Nothing '
          + 'outruns a wrong price.',
      },
    ],
    faq: [
      ['How long is too long for a used car to sit on the lot?',
        'Most used-car operations treat 30 days as a warning, 45 as an alarm, and 60 as a decision point — beyond that, holding costs and depreciation usually outrun any remaining retail upside. The exact line varies by store economics; what matters is that the line exists in writing and triggers action automatically.'],
      ['Should I drop the price or fix the photos first on an aged unit?',
        'Photos first, by a few days — a reshoot costs minutes with an AI editor and works even when the price was right, while a price cut on an ugly listing rarely lands. Then reprice meaningfully if leads stay flat. By day 45 both should be done; they compound rather than compete.'],
      ['Does renewing a Facebook Marketplace listing help an aged car?',
        'Yes, modestly and mechanically: a renewed listing stops sitting beneath weeks of newer inventory and gets back in front of shoppers browsing recent posts. Pair it with a new lead photo and a real price move and the unit genuinely reads as new; renew alone, with the same stale photo and number, and shoppers scroll past it a second time.'],
      ['When should you wholesale an aged unit instead of retailing it?',
        'When the triage has genuinely run — coverage verified, photos fixed, price at the front of the field — and the unit still is not turning by your 60-day mark, the question becomes which loss is smaller. Book the wholesale exit you pre-committed to; the retail hope that argues for week twelve is how small losses become big ones.'],
      ['Do paid boosts work on aged inventory?',
        'Only as the last step. Paid attention on a mispriced or badly photographed listing just shows more people the reason it is not selling. Fix coverage, photos, and price first; then a small, unit-specific paid push at day 60 has a fair, measurable test — and if it still fails, the market has answered.'],
    ],
    cta: {
      heading: 'Stop building next month’s aged list',
      sub: 'AutoLander keeps every unit posted and renewed on Facebook Marketplace, re-stages photos with its AI studio, and syncs each reprice automatically — the triage, running daily.',
    },
  },

];
