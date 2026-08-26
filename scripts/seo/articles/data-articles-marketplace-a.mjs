// Marketplace silo — Avalanche batch A (2026-08-26). Six long-tail articles on the
// core Marketplace posting mechanics: the dealer posting walkthrough, listing limits,
// removals, visibility triage, renewals, and posting timing (the one data article —
// every figure in it comes from the published 2026 Marketplace report).
// Pure data per the article-system.mjs contract: no imports, string literals only.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // 1. /guide/post-a-car-on-facebook-marketplace-dealer/
  // ---------------------------------------------------------------------------
  {
    slug: 'post-a-car-on-facebook-marketplace-dealer',
    silo: 'marketplace',
    anchor: 'How to post a car on Facebook Marketplace as a dealer',
    crumb: 'Post a car',
    primaryKeyword: 'how to post a car on facebook marketplace as a dealer',
    secondaryKeywords: [
      'can a dealership post cars on facebook marketplace',
      'how to list a car on facebook marketplace',
      'what to include in a vehicle listing',
      'how long does it take to post a car',
    ],
    title: 'How to Post a Car on Facebook Marketplace as a Dealer (2026)',
    description:
      'How to post a car on Facebook Marketplace as a dealer: every field — category, photos, '
      + 'price, mileage, description — plus the per-unit time math.',
    eyebrow: 'Dealer guide',
    h1: 'How to post a car on Facebook Marketplace as a dealer',
    tldr:
      'To post a car on Facebook Marketplace as a dealer, open Marketplace from an established '
      + 'personal profile, create a Vehicle for sale listing, and complete every field: vehicle '
      + 'type, photos, price, mileage, year, make, model, description, and location. A single unit '
      + 'takes roughly ten to fifteen minutes done well; a full lot is hours of daily work, which '
      + 'is why most dealerships end up automating the posting.',
    sections: [
      {
        type: 'qa',
        q: 'How do you post a car on Facebook Marketplace as a dealer?',
        a: [
          'From a Facebook profile, open Marketplace, create a new listing, and choose Vehicle for '
          + 'sale. Facebook then walks you through the vehicle fields: vehicle type, photos, year, '
          + 'make, model, price, mileage, description, and location. Fill every field, publish, and '
          + 'the listing goes live to local buyers — usually within minutes, sometimes after a short '
          + 'review.',
          'That is the easy version. The dealer version has two complications: the free vehicle '
          + 'listing flow runs through a person’s profile rather than your dealership Page, and doing '
          + 'it well for a whole lot of inventory takes real time per unit, every day. This guide '
          + 'covers the fields, what belongs in them, and the math.',
        ],
      },
      {
        type: 'qa',
        q: 'Can a dealership post cars on Facebook Marketplace?',
        a: [
          'Yes — dealerships post to Marketplace every day, and for many independents it is their '
          + 'best free source of local buyers. But the free vehicle listing flow belongs to personal '
          + 'profiles: Facebook retired its Page-based dealer inventory programs years ago, so today '
          + 'the listing is created and managed by a person at the store — the owner, the internet '
          + 'manager, or a salesperson — from their own account.',
          'That has practical consequences. The profile that posts should be a real, established '
          + 'account in good standing that clearly identifies the store in each description. Buyers '
          + 'message that profile, so it needs to be one somebody actually checks. And because '
          + 'everything hangs off one person’s account, account health matters — the [Marketplace '
          + 'automation policy and safety guide](/guide/facebook-marketplace-automation/) covers how '
          + 'to keep that side clean.',
        ],
      },
      {
        type: 'steps',
        h2: 'How to list a car on Facebook Marketplace, field by field',
        intro:
          'The flow below is the vehicle listing as Facebook structures it. Get each field right '
          + 'the first time — edits after publishing can send a listing back through review.',
        steps: [
          {
            title: 'Start a vehicle listing',
            body:
              'From Marketplace, create a new listing and choose Vehicle for sale. Never post cars '
              + 'as general items — the vehicle flow is what gives you the year, make, model, and '
              + 'mileage fields buyers filter on.',
          },
          {
            title: 'Pick the right vehicle type',
            body:
              'Car or truck, motorcycle, RV or camper, trailer — choose what the unit actually is. '
              + 'Category mismatches are a common reason listings get removed or quietly buried in '
              + 'the wrong search results.',
          },
          {
            title: 'Load the photos',
            body:
              'Lead with a clean front three-quarter shot, then cover every angle, the interior, and '
              + 'the odometer. Skip promo frames and watermarked feed photos — buyers scroll past '
              + 'them, and heavy overlay graphics read as spam. This is where an [AI car photo '
              + 'editor](/ai-car-photo-editor/) earns its keep, turning lot shots into showroom-grade '
              + 'images without a reshoot.',
          },
          {
            title: 'Set the real price',
            body:
              'Post the actual advertised price. Placeholder prices — $1, $1,234 — fall outside the '
              + 'price-range filters buyers search with and flag the listing as low quality. If the '
              + 'price changes later, update the listing the same day.',
          },
          {
            title: 'Enter year, make, model, and mileage',
            body:
              'Exact trim helps serious shoppers self-qualify. Mileage must be the real odometer '
              + 'reading — it is one of the first things a buyer checks against the photos.',
          },
          {
            title: 'Write a description that answers the first five questions',
            body:
              'Condition, title status, key features, financing availability in plain language, and '
              + 'how to come see the car. Skip the wall of caps and emoji. AutoLander writes these '
              + 'automatically from your feed data if a blank box is the bottleneck.',
          },
          {
            title: 'Set the location and publish',
            body:
              'The listing should sit where the car sits — Marketplace is local-first, and buyers '
              + 'filter by distance from their own zip code. Publish, then confirm the listing '
              + 'actually went live rather than into pending review.',
          },
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What to include in a vehicle listing',
        intro: 'The listings that get messages share the same checklist:',
        items: [
          'Real photos of the actual unit — every angle, interior, odometer, flaws included.',
          'The true asking price, kept current with your website and your feed.',
          'Exact year, make, model, trim, and honest mileage.',
          'Title status and anything a buyer would find out at the lot anyway.',
          'A description built from features and condition, not slogans.',
          'The store name and how to reach a human fast — Marketplace buyers move on quickly, so '
          + '[speed to lead](/guide/car-sales-leads/) is part of the listing, not an afterthought.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/jeep-wrangler-before.webp',
        after: '/studio/jeep-wrangler-after.webp',
        beforeAlt: 'Jeep Wrangler in a cluttered dealer lot photo, before AutoLander',
        afterAlt: 'The same Jeep Wrangler re-staged in a clean outdoor scene by AutoLander’s AI Photo Studio',
        caption:
          'The photo field is where listings are won: the same Jeep Wrangler as a raw dealer lot '
          + 'shot (left) and re-staged by AutoLander’s AI Photo Studio (right). Same truck, same '
          + 'price — very different click.',
      },
      {
        type: 'qa',
        q: 'How long does it take to post a car on Facebook Marketplace?',
        a: [
          'Done properly — photos gathered, specs checked, description written, price confirmed — a '
          + 'single vehicle listing takes roughly ten to fifteen minutes. The flow itself is quick; '
          + 'the merchandising around it is what eats the clock.',
          'Now scale it. At that pace, posting 40 units by hand is an afternoon — and posting is only '
          + 'the first pass. Prices change, units sell, listings go stale and need renewing, and '
          + 'every one of those touches is another trip through Marketplace. That recurring grind is '
          + 'why hand-posting stores usually list a fraction of their inventory, and why dealers move '
          + 'to [bulk posting the whole lot](/bulk-post-cars-to-facebook-marketplace/) with a '
          + '[Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) that also handles '
          + 'price updates and sold-unit removal automatically.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'The posting flow is genuinely simple — Facebook made it easy on purpose. What is not '
          + 'simple is doing it accurately at volume, every day, without letting prices drift or sold '
          + 'units linger. And automating a personal-profile workflow is a policy gray area: '
          + 'AutoLander posts from a native desktop app through your own Facebook session on your '
          + 'own computer, which is a deliberate account-health choice, not a guarantee. Read the '
          + 'policy guide before you scale.',
      },
    ],
    faq: [
      ['Do you need a business account to post cars on Facebook Marketplace?',
        'No. Vehicle listings on Marketplace are created from a personal Facebook profile, not a '
        + 'business Page — Facebook retired its Page-based dealer inventory programs. Most '
        + 'dealerships designate an owner or internet manager whose established profile posts the '
        + 'inventory and clearly identifies the store in every description.'],
      ['Is it free to list a car on Facebook Marketplace?',
        'Yes — creating vehicle listings on Facebook Marketplace is free for personal profiles, '
        + 'which is exactly why it became a core channel for used-car dealers. The real costs are '
        + 'labor — posting and maintaining listings daily — and merchandising: photos and '
        + 'descriptions good enough to compete in the feed.'],
      ['How many photos should a car listing have?',
        'Enough to answer a buyer’s first questions without a message: a clean front three-quarter '
        + 'lead photo, every exterior side, interior front and rear, the odometer, and any flaws. '
        + 'Listings that lead with a single dark lot shot are the ones buyers scroll past on the '
        + 'way to yours.'],
      ['Can I post the same car more than once?',
        'No — duplicate listings for the same vehicle are one of the most common reasons car '
        + 'listings get removed. Keep one live listing per unit. When a listing goes stale, renew '
        + 'it when Facebook offers the option, or delete the old listing first and then repost it '
        + 'fresh.'],
      ['Who at the dealership should own Marketplace posting?',
        'One accountable person — typically the internet manager — posting from an established '
        + 'profile, with a named backup who watches messages on their shift. Splitting posting '
        + 'across many accounts invites inconsistent pricing, missed messages, and orphaned '
        + 'listings when someone leaves the store.'],
    ],
    cta: {
      heading: 'Post the whole lot without the afternoon of typing',
      sub:
        'AutoLander posts every unit in your inventory to Facebook Marketplace from your own '
        + 'computer — photos, specs, price, and description filled automatically from your feed.',
    },
  },

  // ---------------------------------------------------------------------------
  // 2. /guide/facebook-marketplace-car-listing-limits/
  // ---------------------------------------------------------------------------
  {
    slug: 'facebook-marketplace-car-listing-limits',
    silo: 'marketplace',
    anchor: 'Facebook Marketplace car listing limits for dealers',
    crumb: 'Listing limits',
    primaryKeyword: 'facebook marketplace car listing limits',
    secondaryKeywords: [
      'how many cars can you post on facebook marketplace',
      'facebook marketplace posting limits per day',
      'what happens if you hit the listing limit',
    ],
    title: 'Facebook Marketplace Car Listing Limits: What Dealers See',
    description:
      'Facebook Marketplace car listing limits explained honestly: what Meta publishes (nothing), '
      + 'what dealers actually observe, and a pacing playbook that scales.',
    eyebrow: 'Marketplace playbook',
    h1: 'Facebook Marketplace car listing limits: the honest answer',
    tldr:
      'Facebook does not publish exact Marketplace car listing limits. Limits exist, they vary by '
      + 'account, and they change without notice. What dealers consistently observe: newer accounts '
      + 'get far less headroom than established ones, sudden volume spikes draw friction — failed '
      + 'publishes, pending review, temporary blocks — and a steady daily posting pace runs clean '
      + 'where burst posting gets flagged. Pace the account; do not race it.',
    sections: [
      {
        type: 'qa',
        q: 'What are the car listing limits on Facebook Marketplace?',
        a: [
          'There is no published number. Facebook has never documented an official cap on vehicle '
          + 'listings per account or per day, and Marketplace enforcement does not work like a meter '
          + 'you can read. Limits absolutely exist — dealers hit them — but they are dynamic, '
          + 'account-specific, and adjusted without announcement.',
          'So treat any article or vendor quoting an exact figure — “you can post X cars per day” — '
          + 'as a guess. What follows is the honest version: what dealers actually observe in '
          + 'practice, what hitting the ceiling looks like, and a pacing playbook that keeps a whole '
          + 'lot posted without tripping it.',
        ],
      },
      {
        type: 'qa',
        q: 'How many cars can you post on Facebook Marketplace?',
        a: [
          'It depends almost entirely on the account doing the posting. The pattern dealers see over '
          + 'and over: an established personal profile with years of normal history and a clean '
          + 'selling record can list steadily at volumes a brand-new account never could. Newer '
          + 'accounts, accounts with prior Marketplace flags, and accounts that suddenly change '
          + 'behavior get far less headroom.',
          'The other consistent observation is that the change in volume matters as much as the '
          + 'volume itself. An account that has quietly posted a handful of vehicles a week and '
          + 'suddenly pushes an entire 60-unit lot in one evening looks, to an automated system, '
          + 'like a stolen account or a spammer. The same inventory, spread over days at a steady '
          + 'rhythm, reads like a dealer doing business.',
        ],
      },
      {
        type: 'qa',
        q: 'Is there a Facebook Marketplace posting limit per day?',
        a: [
          'A daily ceiling is the one dealers bump into most, and again Facebook does not say what '
          + 'it is. The useful mental model is not “find the number and post up to it” — it is that '
          + 'Marketplace scores behavior, and posting velocity is one of the loudest signals. Bursts '
          + 'invite review; rhythm does not.',
          'This is why steady daily posting beats burst posting on every axis: it stays under the '
          + 'friction threshold, it keeps fresh listings in front of buyers every day instead of one '
          + 'weekly splash that goes stale together, and it spreads the message load on whoever '
          + 'answers buyers. A [bulk posting tool](/bulk-post-cars-to-facebook-marketplace/) worth '
          + 'using paces posts for exactly this reason instead of firing the whole lot at once.',
        ],
      },
      {
        type: 'table',
        h2: 'Burst posting vs. steady pacing',
        head: ['', 'Burst posting', 'Steady daily pacing'],
        rows: [
          ['What it looks like',
            'Dozens of listings pushed in one sitting, then nothing for a week',
            'A consistent handful of posts every day, spread across the day'],
          ['How Marketplace tends to respond',
            'Pending review, failed publishes, temporary Marketplace blocks',
            'Listings publish normally while the account builds trusted history'],
          ['What buyers see',
            'One wave of listings that all go stale on the same schedule',
            'Fresh inventory appearing daily, every day of the week'],
          ['What it does to the store',
            'Feast-or-famine message volume and a jammed inbox one day a week',
            'Predictable lead flow your sales team can actually answer'],
        ],
      },
      {
        type: 'qa',
        q: 'What happens if you hit the listing limit?',
        a: [
          'The friction shows up in stages rather than one clear error. A typical sequence: a new '
          + 'listing fails to publish or sits in pending review far longer than normal; then listing '
          + 'creation is blocked for a stretch; in heavier cases the account loses Marketplace '
          + 'access temporarily, and repeat offenses escalate. Facebook rarely tells you which '
          + 'threshold you crossed.',
          'When it happens, stop pushing. Retrying the same listing over and over, or hopping to a '
          + 'second account to keep posting, both make it worse — duplicate listings and ban evasion '
          + 'are policy violations in their own right. Let the account cool down, let pending '
          + 'listings clear, then resume at a slower pace than the one that tripped the wall. If '
          + 'listings were removed along the way, appeal them rather than reposting.',
        ],
      },
      {
        type: 'steps',
        h2: 'A pacing playbook for a dealer lot',
        intro: 'The goal is full inventory coverage at a rhythm the platform reads as normal business.',
        steps: [
          {
            title: 'Start slower than you want to',
            body:
              'On an account new to volume, begin with a few listings a day and hold there for a '
              + 'week or two before ramping. The account’s history is being written; write a boring '
              + 'one.',
          },
          {
            title: 'Post daily, not weekly',
            body:
              'A fixed daily batch — new arrivals first, then the backlog — beats any burst. '
              + 'Consistency is the whole trick, and it is also the first thing hand-posting fails '
              + 'at.',
          },
          {
            title: 'Spread posts across the day',
            body:
              'A dozen listings published in ninety seconds is a bot signature. Space them out the '
              + 'way a person naturally would.',
          },
          {
            title: 'Keep the listings clean',
            body:
              'Real price, right category, one listing per unit, no recycled photos across cars. '
              + 'Removals compound the velocity signals, so listing hygiene is pacing too.',
          },
          {
            title: 'Remove sold units the day they sell',
            body:
              'A wall of stale, sold inventory is its own quality signal — and burned buyers report '
              + 'listings. Automatic [inventory sync](/facebook-marketplace-inventory-sync/) handles '
              + 'the removal without anyone remembering to.',
          },
          {
            title: 'Scale gradually and watch for friction',
            body:
              'If publishes start hanging in review, back off for a few days before resuming. The '
              + 'ceiling moves; respect the feedback.',
          },
        ],
      },
      {
        type: 'figure',
        before: '/studio/toyota-tundra-before.webp',
        after: '/studio/toyota-tundra-after.webp',
        beforeAlt: 'Toyota Tundra pickup in a crowded dealer lot photo, before AutoLander',
        afterAlt: 'The same Toyota Tundra staged in a clean studio-style scene by AutoLander’s AI Photo Studio',
        caption:
          'Pacing gets listings published; merchandising gets them clicked. The same Toyota Tundra '
          + 'as the raw feed photo (left) and after AutoLander’s AI Photo Studio re-staged it '
          + '(right).',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Nobody outside Meta knows the real limits — including us, and including every tool that '
          + 'promises you a safe number. What a dealer controls is the shape of the behavior: an '
          + 'established account, clean listings, a steady pace. AutoLander’s approach is to post '
          + 'through a native desktop app from your own computer and IP on a paced schedule — a '
          + 'deliberate account-health design, not a guarantee. The [safest auto '
          + 'poster](/safest-facebook-marketplace-auto-poster/) page explains the reasoning, and the '
          + '[policy guide](/guide/facebook-marketplace-automation/) covers the rules.',
      },
    ],
    faq: [
      ['Does Facebook publish Marketplace listing limits anywhere?',
        'No. Facebook’s help content and commerce policies describe what you may list, not how '
        + 'many or how fast. Every specific number in circulation comes from seller '
        + 'experimentation, and accounts differ enough that borrowing someone else’s number is '
        + 'unreliable. Assume the limit is dynamic and behavior-based, then pace accordingly.'],
      ['Do new Facebook accounts have lower posting limits?',
        'That is the most consistent pattern dealers report: brand-new accounts and accounts new '
        + 'to selling get very little headroom, and earn more with steady, clean history. If your '
        + 'store’s posting account is new, the ramp should be measured in weeks — slow, boring, '
        + 'and consistent — not days.'],
      ['Will deleting old listings let me post more?',
        'Deleting genuinely stale or sold listings is good hygiene, and clearing dead weight helps '
        + 'overall account quality — but there is no evidence of a simple slot system where '
        + 'deleting one listing frees a space. Avoid deleting and instantly reposting the same '
        + 'cars in bulk; that pattern reads as spam.'],
      ['Can I use a second account to get around the limit?',
        'No. Posting the same inventory from multiple accounts creates duplicate listings and '
        + 'reads as ban evasion — both policy violations that put every account involved at risk. '
        + 'One established, well-maintained profile posting at a sustainable pace outperforms a '
        + 'rotation of disposable accounts in every way that lasts.'],
      ['What is a safe number of cars to post per day?',
        'There is no universally safe number, and anyone quoting one is guessing. The honest '
        + 'guidance is relative: start with a few per day on an unproven account, hold the rhythm, '
        + 'and scale gradually while publishes stay clean. The steadier the pattern, the more '
        + 'volume accounts tend to sustain.'],
    ],
    cta: {
      heading: 'Full-lot coverage at a pace that stays boring',
      sub:
        'AutoLander posts your inventory on a steady schedule from your own computer — the whole '
        + 'lot live, without the volume spike that draws friction.',
    },
  },

  // ---------------------------------------------------------------------------
  // 3. /guide/facebook-marketplace-car-listing-removed/
  // ---------------------------------------------------------------------------
  {
    slug: 'facebook-marketplace-car-listing-removed',
    silo: 'marketplace',
    anchor: 'Why Facebook Marketplace removes car listings (and how to fix it)',
    crumb: 'Removed listings',
    primaryKeyword: 'facebook marketplace car listing removed',
    secondaryKeywords: [
      'why was my car listing removed on facebook marketplace',
      'facebook commerce policy vehicles',
      'how to appeal a removed listing',
    ],
    title: 'Facebook Marketplace Car Listing Removed? Causes & Fixes',
    description:
      'Facebook Marketplace car listing removed? The real causes — commerce policy, duplicates, '
      + 'price flags — how to appeal it, and how to stop the next one.',
    eyebrow: 'Marketplace troubleshooting',
    h1: 'Your Facebook Marketplace car listing was removed — now what?',
    tldr:
      'Car listings on Facebook Marketplace usually get removed for a short list of reasons: '
      + 'commerce-policy triggers in the text, duplicate listings of the same vehicle, category or '
      + 'price mismatches, spam-signal photos, or account-level flags from posting too fast. Appeal '
      + 'from your Support Inbox by requesting a review of the removed listing, and fix the '
      + 'underlying cause before reposting — repeat removals compound into account restrictions.',
    sections: [
      {
        type: 'qa',
        q: 'Why was my car listing removed on Facebook Marketplace?',
        a: [
          'Almost every vehicle-listing removal traces back to one of five causes: the listing '
          + 'tripped a commerce-policy filter, it duplicated another live listing of the same car, '
          + 'its category or price did not match the vehicle, its photos carried spam signals like '
          + 'heavy promo graphics, or the account posting it raised flags — usually by posting too '
          + 'much, too fast, from too new a profile.',
          'The removal notice rarely says which one. Facebook’s enforcement is automated, the '
          + 'stated reason is often generic, and genuinely clean listings do get swept by mistake. '
          + 'The playbook is the same either way: identify the likeliest cause from the table below, '
          + 'appeal if the listing was legitimate, and fix the pattern so the next one stays up.',
        ],
      },
      {
        type: 'table',
        h2: 'The common removal causes — and the fix for each',
        head: ['Removal cause', 'What trips it', 'The fix'],
        rows: [
          ['Commerce-policy language',
            'Text that reads as misleading or off-platform — giveaway framing, guarantee claims, '
            + 'contact info wedged into every line',
            'Describe the car factually: condition, features, title status, store name. Save the '
            + 'pitch for the phone call.'],
          ['Duplicate listings',
            'The same vehicle listed twice — often an old stale listing plus a fresh repost',
            'One live listing per unit. Delete the old listing first, then repost; never run both.'],
          ['Wrong category or vehicle type',
            'A car posted as a general item, an RV posted as a car, a trailer posted as a truck',
            'Use the vehicle listing flow and pick the type the unit actually is.'],
          ['Price mismatch',
            'Placeholder prices — $1, $123 — or a price wildly off the vehicle described',
            'Post the real advertised price and keep it synced with your website.'],
          ['Spam-signal photos',
            'Promo frames, heavy text overlays, watermarks, the same image reused across listings',
            'Clean, real photos of the actual unit — no frames, no overlays, no recycling.'],
          ['Account-level flags',
            'A new or suddenly aggressive account pushing high volume in bursts',
            'Slow down, post daily at a steady pace, and let the account build history.'],
        ],
      },
      {
        type: 'qa',
        q: 'What does Facebook’s commerce policy mean for vehicle listings?',
        a: [
          'Vehicles are explicitly allowed on Marketplace — the commerce policies exist to keep '
          + 'listings honest, not to keep dealers out. In practice the policy asks that a vehicle '
          + 'listing be a real, accurately described vehicle, offered at a real price, by a seller '
          + 'who is who they say they are. The trouble comes from the edges: wording that sounds '
          + 'like a scheme (“guaranteed approval, everyone rides”), listings that hide the actual '
          + 'price, contact-info workarounds, and anything that misrepresents what is being sold.',
          'Because enforcement is automated, it is pattern-matching your text and photos against '
          + 'millions of bad listings. The safest description is the boring one: what the car is, '
          + 'what it has, what it costs, where it is. Dealers who write like a window sticker '
          + 'rarely hear from the policy system.',
        ],
      },
      {
        type: 'steps',
        h2: 'How to appeal a removed listing',
        intro:
          'Appeals happen in your account’s support area — the exact labels shift over time, but '
          + 'the flow is stable:',
        steps: [
          {
            title: 'Open the removal notice',
            body:
              'Facebook notifies you when a listing comes down, and the notice links into your '
              + 'Support Inbox or account status area, where removed listings are itemized with the '
              + 'policy cited.',
          },
          {
            title: 'Find the removed listing and request a review',
            body:
              'Select the listing and choose the option to disagree with the decision or request a '
              + 'review. That single action is the appeal — there is no separate form to hunt for.',
          },
          {
            title: 'Add context if a field offers it',
            body:
              'Where a text box exists, keep it short and factual: this is a real vehicle, offered '
              + 'by our dealership at the listed price. Essays do not help an automated queue.',
          },
          {
            title: 'Wait — and do not repost meanwhile',
            body:
              'Reposting the same car while an appeal is pending creates the duplicate-listing '
              + 'problem and can convert one removal into an account restriction. Reviews commonly '
              + 'resolve in hours to a few days; some never get a response at all.',
          },
          {
            title: 'Act on the outcome',
            body:
              'Restored: leave it alone, and note what you will avoid next time. Denied or ignored: '
              + 'rebuild the listing clean — new photos, factual description, correct category and '
              + 'price — and publish it as a genuinely new, compliant listing.',
          },
        ],
      },
      {
        type: 'figure',
        before: '/studio/hyundai-sonata-before.webp',
        after: '/studio/hyundai-sonata-after.webp',
        beforeAlt: 'Hyundai Sonata sedan photographed on a cluttered dealer lot, before AutoLander',
        afterAlt: 'The same Hyundai Sonata re-staged in a clean showroom-style scene by AutoLander’s AI Photo Studio',
        caption:
          'Photos are evidence: this Sonata’s original lot shot (left) looks like the listings '
          + 'enforcement was built to catch; the AutoLander AI Photo Studio version (right) looks '
          + 'like a dealership with nothing to hide.',
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'The prevention checklist',
        intro: 'Removals are cheaper to prevent than to appeal. Before every publish:',
        items: [
          'One live listing per vehicle — delete the old one before any repost.',
          'Vehicle type, year, make, model, and mileage all match the actual unit.',
          'The real asking price — never $1, never “message for price.”',
          'Photos of the actual car, free of promo frames, phone numbers, and watermarks — an '
          + '[AI car photo editor](/ai-car-photo-editor/) strips the clutter without a reshoot.',
          'A factual description with no guarantee language and no contact-info workarounds.',
          'A posting pace the account has already proven it can sustain — pacing is a design '
          + 'feature of the [safest auto poster](/safest-facebook-marketplace-auto-poster/) '
          + 'approach, not an afterthought.',
          'Sold units removed the day they sell, so stale listings never pile up into reports — '
          + '[inventory sync](/facebook-marketplace-inventory-sync/) automates exactly this.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Some removals are simply wrong, and some appeals disappear into the void — automated '
          + 'enforcement at Facebook’s scale has false positives and no service-level promise. You '
          + 'cannot fully prevent that. What you control is making every listing so plainly '
          + 'legitimate that removals stay rare, isolated events on a healthy account instead of a '
          + 'pattern on a flagged one. That is account health, and it is the whole reason the '
          + '[policy and safety guide](/guide/facebook-marketplace-automation/) exists.',
      },
    ],
    faq: [
      ['Does a removed listing hurt my whole account?',
        'One isolated removal on an otherwise healthy account is routine and survivable. The '
        + 'danger is the pattern: repeated removals in a short window compound into Marketplace '
        + 'restrictions — losing listing privileges temporarily, then for longer. Treat the first '
        + 'removal as the warning, and fix the cause rather than just the listing.'],
      ['How long does a Marketplace appeal take?',
        'There is no published timeline. Dealers commonly see decisions within hours to a few '
        + 'days, and some appeals never receive a response at all. If an appeal has clearly '
        + 'stalled and the vehicle is still in stock, rebuild the listing cleanly and post it '
        + 'fresh rather than waiting indefinitely.'],
      ['Can I just repost a car after Facebook removes the listing?',
        'Not unchanged. Reposting the identical listing invites an identical removal, and doing it '
        + 'while an appeal is open creates a duplicate. Fix what likely tripped enforcement — '
        + 'price, category, photos, wording — then post it as a genuinely corrected listing, once, '
        + 'from the same account.'],
      ['Why do my listings keep getting flagged when private sellers’ don’t?',
        'Volume. A dealer posts more cars, faster, with more templated text and photography than a '
        + 'private seller, so automated systems get more chances to pattern-match something. That '
        + 'is not a reason to quit — it is the argument for clean templates, real photos, steady '
        + 'pacing, and disciplined listing hygiene.'],
      ['Are watermarked feed photos really a removal risk?',
        'Watermarks, dealer promo frames, and text-heavy overlays are classic spam signals, '
        + 'because scam listings lean on recycled, branded images. They also cost clicks with real '
        + 'buyers. Replacing them with clean shots of the actual unit removes the signal and '
        + 'improves the listing at the same time.'],
    ],
    cta: {
      heading: 'Listings that stay up',
      sub:
        'AutoLander publishes clean, complete, correctly categorized listings with real prices '
        + 'synced to your feed — and pulls sold units down before they turn into reports.',
    },
  },

  // ---------------------------------------------------------------------------
  // 4. /guide/facebook-marketplace-listing-not-showing-up/
  // ---------------------------------------------------------------------------
  {
    slug: 'facebook-marketplace-listing-not-showing-up',
    silo: 'marketplace',
    anchor: 'Facebook Marketplace listing not showing up: the dealer fix',
    crumb: 'Listing not showing',
    primaryKeyword: 'facebook marketplace listing not showing up',
    secondaryKeywords: [
      'facebook marketplace listing not showing in search',
      'why can’t buyers see my listing',
      'facebook marketplace listing pending review',
    ],
    title: 'Facebook Marketplace Listing Not Showing Up? Fix It Fast',
    description:
      'Facebook Marketplace listing not showing up? Triage it in order: pending review, quiet '
      + 'deranking, removal, or buyer filters — and when to renew or repost.',
    eyebrow: 'Marketplace troubleshooting',
    h1: 'Facebook Marketplace listing not showing up? Triage it in order',
    tldr:
      'When a Facebook Marketplace listing is not showing up, check four things in order: is it '
      + 'pending review (wait it out), was it removed (check your Support Inbox, then appeal), has '
      + 'it gone stale and been quietly deranked (renew or repost), or is it live but filtered out '
      + 'of the buyer’s view by distance, category, or price settings. Most “invisible” dealer '
      + 'listings turn out to be stale or price-filtered, not removed.',
    sections: [
      {
        type: 'qa',
        q: 'Why is my Facebook Marketplace listing not showing up?',
        a: [
          'Four distinct problems produce the same symptom, and they have four different fixes. The '
          + 'listing is either: still in pending review and not yet public; removed for a policy '
          + 'reason and sitting in your Support Inbox; live but stale, so Marketplace has stopped '
          + 'surfacing it in browse and search; or live and rankable but filtered out of a '
          + 'particular buyer’s view by their distance radius, category, or price-range settings.',
          'Dealers usually assume removal — the scary one — but the boring causes dominate. A '
          + 'listing several weeks old has quietly sunk beneath fresher inventory, and a listing '
          + 'with a placeholder price never matches the price filters buyers actually search with. '
          + 'Run the triage below in order before rewriting anything.',
        ],
      },
      {
        type: 'steps',
        h2: 'The triage tree: check these in order',
        intro: 'Each step rules out one cause. Stop at the first one that explains what you see.',
        steps: [
          {
            title: 'Open the listing from your selling view',
            body:
              'Its own status line answers half the cases immediately: live, pending review, or '
              + 'removed. Start here, not in search.',
          },
          {
            title: 'If it says pending review — wait',
            body:
              'Screening is normal for newer selling accounts and certain listing types, and it '
              + 'commonly clears within a day. Deleting and reposting during review restarts the '
              + 'clock and adds a spam signal.',
          },
          {
            title: 'Check your Support Inbox for a removal',
            body:
              'If the listing was taken down, the notice lives there with the cited policy. That '
              + 'path has its own playbook — appeal it, fix the cause, and only then repost.',
          },
          {
            title: 'Search like a buyer',
            body:
              'Have someone else search the year, make, and model from their own account, set to '
              + 'your area. Your own view of your own listing proves nothing about ranking.',
          },
          {
            title: 'Audit the fields buyers filter on',
            body:
              'Distance: the listing location must be the car’s real location. Category: it must '
              + 'be a vehicle listing of the right type. Price: a real number — a $1 placeholder '
              + 'falls outside every realistic price-range filter a car buyer sets.',
          },
          {
            title: 'Check the listing’s age',
            body:
              'If it has been live for weeks, staleness is your answer: Marketplace strongly '
              + 'favors fresh listings. Renew it when the option is offered, or delete it and '
              + 'repost with improved photos and price.',
          },
          {
            title: 'Still invisible? Fix quality, not metaphysics',
            body:
              'Thin photos, sparse description, missing specs, and an off-market price all '
              + 'suppress reach. Make it the best listing for that car in your zip code — '
              + 'showroom-grade [photos](/ai-car-photo-editor/) are the fastest upgrade — and '
              + 're-check in a few days.',
          },
        ],
      },
      {
        type: 'qa',
        q: 'Why is my listing not showing in Marketplace search?',
        a: [
          'Search visibility is a ranking, not a switch — and freshness is one of its strongest '
          + 'inputs. New listings surface aggressively; aging listings sink beneath the daily wave '
          + 'of newer inventory even when nothing is wrong with them. Incomplete listings sink '
          + 'faster: missing specs, a single photo, or a sparse description give the ranking '
          + 'little to match against a buyer’s search.',
          'Price outliers get quietly punished too. A price far off the market for that vehicle '
          + 'reads as low quality, and a placeholder price fails buyers’ filters outright. None of '
          + 'this is visible to you as the seller — there is no dashboard that says “deranked.” '
          + 'The tell is a live listing, correctly filtered searches, and silence.',
        ],
      },
      {
        type: 'qa',
        q: 'Why can’t buyers see my listing when it looks live to me?',
        a: [
          'Usually because their view of Marketplace is narrower than yours. Buyers browse within '
          + 'a distance radius of their own location — a listing parked forty miles away can sit '
          + 'outside it entirely. They filter by price range, so a wrong or placeholder price '
          + 'excludes you before ranking ever matters. And they browse within categories, so a '
          + 'unit posted under the wrong vehicle type is invisible in the aisle where they are '
          + 'shopping.',
          'This is why “my buddy can’t find it” is data, not proof of removal. Confirm the '
          + 'listing is live, then check what a buyer inside your radius, inside your price band, '
          + 'in the right category would actually see.',
        ],
      },
      {
        type: 'qa',
        q: 'What does “pending review” mean on Facebook Marketplace?',
        a:
          'It means the listing is being screened before going public — routine for newer selling '
          + 'accounts, high-velocity posting, and certain listing signals. Most reviews clear '
          + 'within hours to a day. The only wrong move is impatience: deleting and reposting '
          + 'during review looks like spam, stacks duplicate signals, and can escalate a routine '
          + 'screen into a restriction. Post it once and let the clock run.',
      },
      {
        type: 'figure',
        before: '/studio/nissan-kicks-before.webp',
        after: '/studio/nissan-kicks-after.webp',
        beforeAlt: 'Nissan Kicks crossover in a dark, cluttered dealer lot photo, before AutoLander',
        afterAlt: 'The same Nissan Kicks staged in a bright, clean scene by AutoLander’s AI Photo Studio',
        caption:
          'Reach follows quality: the same Nissan Kicks as the original dark lot photo (left) and '
          + 're-staged by AutoLander’s AI Photo Studio (right). The right-hand listing earns its '
          + 'ranking.',
      },
      {
        type: 'qa',
        q: 'How do renewals fix the staleness problem?',
        a: [
          'Marketplace is a freshness machine, and a dealer lot is a freshness problem: a unit '
          + 'that takes weeks to sell spends most of that time as an old listing. Renewing — when '
          + 'Facebook offers it on a listing — bumps it back toward the fresh end of browse and '
          + 'search without creating a duplicate. On a lot of any size, that becomes a standing '
          + 'weekly chore: walk the listings, renew what is eligible, repost what has gone truly '
          + 'cold.',
          'It is exactly the kind of repetitive maintenance that slips when the store gets busy, '
          + 'which is why a [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) '
          + 'treats renewals as part of the job — along with price updates and pulling sold units '
          + '— rather than something a person remembers on Tuesdays.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Marketplace ranking is a black box, and nobody selling you a visibility trick can see '
          + 'inside it either. There is no seller analytics view that explains a quiet listing. '
          + 'What is provable: fresh, complete, correctly priced, well-photographed listings from '
          + 'healthy accounts get seen, and stale or sloppy ones fade. Control those inputs and '
          + 'pace the account — the [safest auto poster](/safest-facebook-marketplace-auto-poster/) '
          + 'page explains that design philosophy — and let the box do what it does.',
      },
    ],
    faq: [
      ['How long does pending review take on Facebook Marketplace?',
        'Commonly a few hours, sometimes up to a day or so — there is no published timeline. New '
        + 'selling accounts and sudden posting bursts see review more often and for longer. If a '
        + 'listing has sat in review for several days, raise it through your Support Inbox rather '
        + 'than deleting and reposting it.'],
      ['Does editing a listing make it show up again?',
        'No — edits update the content but do not reliably reset freshness, and substantial edits '
        + 'can send a listing back through review. If the goal is visibility, use renew when it '
        + 'is offered, or delete the stale listing and publish a genuinely improved one: better '
        + 'photos, sharper price, complete specs.'],
      ['Why does my listing show for me but not for buyers?',
        'Your own selling view always shows your listing, so it proves only that the listing '
        + 'exists. Buyers see a ranked, filtered feed limited by their distance, category, and '
        + 'price settings. Have someone in your market search for the vehicle from their own '
        + 'account — that result is the truth.'],
      ['Should I delete and repost a listing that gets no views?',
        'As a last step, yes — after ruling out review, removal, and buyer-side filters, and '
        + 'after fixing what made it invisible: photos, price, and completeness. Delete the old '
        + 'listing first so you never run duplicates, then post the improved version and let it '
        + 'ride the fresh-listing wave.'],
      ['Do renewed listings perform as well as brand-new ones?',
        'Renewal pushes a listing back toward the fresh end of the feed, and for a healthy '
        + 'listing that is usually enough. But renewing cannot rescue weak merchandising — a dark '
        + 'photo set or an off-market price performs badly at any freshness. Fix the listing '
        + 'first, then keep it fresh.'],
    ],
    cta: {
      heading: 'Never wonder if the lot is actually live',
      sub:
        'AutoLander keeps every unit posted, fresh, priced right, and pulled down when it sells — '
        + 'so the listing a buyer searches for is the one they find.',
    },
  },

  // ---------------------------------------------------------------------------
  // 5. /guide/renew-facebook-marketplace-car-listings/
  // ---------------------------------------------------------------------------
  {
    slug: 'renew-facebook-marketplace-car-listings',
    silo: 'marketplace',
    anchor: 'How to renew Facebook Marketplace car listings at lot scale',
    crumb: 'Renew listings',
    primaryKeyword: 'how to renew facebook marketplace listing',
    secondaryKeywords: [
      'what does renew do on facebook marketplace',
      'how often can you renew a listing',
      'renew vs delete and repost',
    ],
    title: 'How to Renew a Facebook Marketplace Listing (Dealer Guide)',
    description:
      'How to renew a Facebook Marketplace listing, what renewing actually does, when '
      + 'delete-and-repost wins, and a cadence that works for a 30–60 unit lot.',
    eyebrow: 'Marketplace playbook',
    h1: 'How to renew Facebook Marketplace listings — at dealer scale',
    tldr:
      'To renew a Facebook Marketplace listing, open your listings from your selling view, find '
      + 'the vehicle, and choose Renew from its menu when Facebook offers it — roughly weekly per '
      + 'listing. Renewing bumps the listing back toward the fresh end of search and browse for '
      + 'free, without creating a duplicate. It beats delete-and-repost for healthy listings; '
      + 'delete-and-repost wins when a listing has gone cold and needs new photos or a new price.',
    sections: [
      {
        type: 'qa',
        q: 'How do you renew a Facebook Marketplace listing?',
        a: [
          'From your selling view, open your listings, find the vehicle, and use the listing’s '
          + 'menu — once the listing becomes eligible, a Renew option appears there. One tap and '
          + 'the listing is treated as fresh again. It is free, it keeps the same listing — same '
          + 'photos, same description, same buyer message threads — and it does not create a '
          + 'duplicate.',
          'The catch is that Renew is offered on Facebook’s schedule, not yours: the option '
          + 'surfaces once a listing has aged, typically on a roughly weekly cycle, and disappears '
          + 'once used until the listing ages again. You cannot renew on demand — which is exactly '
          + 'why renewal at dealer scale is a cadence problem, covered below.',
        ],
      },
      {
        type: 'qa',
        q: 'What does renew actually do on Facebook Marketplace?',
        a: [
          'One thing, and it is valuable: it resets the listing’s effective age, so Marketplace '
          + 'surfaces it the way it surfaces recent listings instead of letting it sink beneath '
          + 'the daily wave of newer inventory. Freshness is one of the strongest visibility '
          + 'inputs on the platform, and renewal is the free lever that controls it.',
          'What renew does not do: it does not change the listing’s content, fix weak photos, '
          + 'correct an off-market price, or guarantee placement anywhere. A renewed bad listing '
          + 'is a fresh bad listing. Renew preserves everything — including the message history — '
          + 'which is both its advantage over reposting and its limitation.',
        ],
      },
      {
        type: 'qa',
        q: 'How often can you renew a listing?',
        a:
          'As often as Facebook offers it, which in practice means on a roughly weekly rhythm per '
          + 'listing — the option appears once the listing has aged and goes away once used. There '
          + 'is no way to renew early and no published schedule, so the operational answer for a '
          + 'dealership is: sweep your listings on a regular weekly pass and renew everything '
          + 'showing the option, rather than trying to time individual units.',
      },
      {
        type: 'table',
        h2: 'Renew vs. delete-and-repost: which one, when',
        head: ['Situation', 'Do this', 'Why'],
        rows: [
          ['Listing is healthy — decent photos, right price, some saves or messages',
            'Renew',
            'Keeps the listing, its history, and its message threads while restoring freshness for free'],
          ['Listing ran for weeks with near-zero messages',
            'Delete, fix, repost',
            'Renewing reruns a listing the market already ignored — change the photos and price, then relaunch fresh'],
          ['Price changed',
            'Edit the price, then renew when offered',
            'The listing must always match the real advertised price; an edit alone does not restore freshness'],
          ['Vehicle sold',
            'Delete it the same day',
            'Never renew a sold unit — stale sold listings burn buyers and invite reports'],
          ['Listing was removed by Facebook',
            'Appeal, fix the cause, then post clean',
            'Renewal is not available on removed listings, and reposting unfixed content invites the next removal'],
        ],
      },
      {
        type: 'steps',
        h2: 'A renewal cadence for a 30–60 unit lot',
        intro:
          'Renewal only works as a system. This is the weekly rhythm that keeps a whole lot '
          + 'effectively fresh:',
        steps: [
          {
            title: 'Track posted dates in one place',
            body:
              'A simple sheet with unit, posting date, and last renewal. Without it, renewals '
              + 'happen to whichever cars someone remembers.',
          },
          {
            title: 'Run a fixed weekly renewal pass',
            body:
              'Same day every week: open your listings and renew every unit showing the option. '
              + 'Eligibility staggers as inventory turns, so the pass is weekly even though each '
              + 'listing renews on its own cycle.',
          },
          {
            title: 'Sort the non-renewals',
            body:
              'Units with buyer activity: leave them working. Units silent since posting: pull '
              + 'them out for rework instead of scheduling another identical week.',
          },
          {
            title: 'Rework the cold ones before relaunch',
            body:
              'New lead photo, tightened description, honest price check against the market. '
              + 'Re-staging the photos is the fastest lever — an [AI car photo '
              + 'editor](/ai-car-photo-editor/) turns the same feed shots into a visibly '
              + 'different listing.',
          },
          {
            title: 'Delete sold units daily, not weekly',
            body:
              'Sold-unit removal cannot wait for the weekly pass — buyers who drive out for a '
              + 'ghost car do not come back. Automatic [inventory '
              + 'sync](/facebook-marketplace-inventory-sync/) makes the deletion happen the '
              + 'moment the feed says sold.',
          },
        ],
      },
      {
        type: 'qa',
        q: 'How much work is renewal at dealer scale?',
        a: [
          'Each renewal is only a few taps — and that is the trap. At 30 to 60 units, a weekly '
          + 'pass means walking every listing, deciding renew versus rework versus leave, actually '
          + 'renewing the eligible ones, plus the daily sold-unit deletions and price edits in '
          + 'between. Call it an hour or two of focused tapping every single week, forever — a '
          + 'chore that quietly stops happening the first busy Saturday.',
          'This maintenance loop, not the original posting, is where hand-run Marketplace '
          + 'programs die. It is also precisely the part software does without getting bored: a '
          + '[Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) keeps every '
          + 'listing fresh on schedule, and [bulk posting](/bulk-post-cars-to-facebook-marketplace/) '
          + 'plus automatic sold-unit removal keeps the whole lot live and truthful without a '
          + 'weekly ritual.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/jeep-renegade-before.webp',
        after: '/studio/jeep-renegade-after.webp',
        beforeAlt: 'Jeep Renegade small SUV in a cluttered dealer lot photo, before AutoLander',
        afterAlt: 'The same Jeep Renegade re-staged in a clean scene by AutoLander’s AI Photo Studio',
        caption:
          'Make it worth renewing: led by the raw lot shot (left), this Renegade reruns the same '
          + 'silence every week; re-staged by AutoLander’s AI Photo Studio (right), the same car '
          + 'relaunches as a different listing.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Renewal is a freshness nudge, not a demand machine. If a unit sat for three weeks '
          + 'without a message, the market has voted on the listing — the photos, the price, or '
          + 'the car — and renewing the identical listing mostly schedules another quiet week. '
          + 'Renew what is working, rework what is not, and never let a sold car stay posted a '
          + 'single day.',
      },
    ],
    faq: [
      ['Is renewing a Facebook Marketplace listing free?',
        'Yes. Renew is a free action on your own listing and is separate from any paid promotion '
        + 'Facebook may offer. For a dealership, free renewal on a steady cadence is one of the '
        + 'highest-leverage habits on the platform: it keeps the whole lot surfacing like recent '
        + 'inventory without new spend.'],
      ['Why don’t I see a Renew button on my listing?',
        'The option only appears once a listing has aged into eligibility, and it disappears '
        + 'again right after you use it. If a listing is brand new, recently renewed, or was '
        + 'removed rather than expired, Renew will not show. Check again on your next weekly pass '
        + 'rather than hunting for it daily.'],
      ['Does renewing reset my listing’s saves, views, or messages?',
        'No — renewal keeps the same listing, so existing saves and buyer message threads stay '
        + 'attached. That continuity is renewal’s core advantage over delete-and-repost, which '
        + 'starts a genuinely new listing and leaves the old conversations behind. Choose based '
        + 'on whether the listing’s history is worth keeping.'],
      ['Should I renew or repost a car that is not selling?',
        'Ask what the listing has earned. If it drew saves and conversations, renew it and keep '
        + 'working the leads. If it ran silent for weeks, reposting identical content changes '
        + 'nothing — fix the lead photo, re-check the price against the market, then delete and '
        + 'relaunch it as a stronger listing.'],
      ['Can renewing too often get my account flagged?',
        'Renewing through Facebook’s own offered option, at the pace Facebook offers it, is '
        + 'normal platform behavior — the cycle itself throttles you. The patterns that draw '
        + 'friction are different ones: mass delete-and-repost sweeps, duplicate listings, and '
        + 'sudden volume spikes. Steady weekly renewal is the calm alternative to exactly those.'],
    ],
    cta: {
      heading: 'Every listing fresh, no weekly ritual',
      sub:
        'AutoLander renews and relists your Marketplace inventory on schedule, updates prices '
        + 'from your feed, and deletes sold units the day they sell.',
    },
  },

  // ---------------------------------------------------------------------------
  // 6. /guide/best-time-to-post-cars-on-facebook-marketplace/
  // ---------------------------------------------------------------------------
  {
    slug: 'best-time-to-post-cars-on-facebook-marketplace',
    silo: 'marketplace',
    anchor: 'Best time to post cars on Facebook Marketplace (2026 data)',
    crumb: 'Best time to post',
    primaryKeyword: 'best time to post on facebook marketplace',
    secondaryKeywords: [
      'best day to list a car on facebook marketplace',
      'should I post car listings on weekends',
      'when do car buyers browse marketplace',
    ],
    title: 'Best Time to Post on Facebook Marketplace: 2026 Car Data',
    description:
      'The best time to post on Facebook Marketplace, from 17,778 real dealer posts: Thursday is '
      + 'the crowded day, Sunday the open lane — and what matters more.',
    eyebrow: 'Marketplace data',
    h1: 'The best time to post cars on Facebook Marketplace, by the data',
    tldr:
      'Across 17,778 dealer posts in AutoLander’s 2026 Marketplace report, Thursday is the '
      + 'heaviest listing day (17.5% of posts) and Sunday the lightest (5.4%) — a 3.3× gap. That '
      + 'data measures dealer supply, not buyer demand: it means a car listed Sunday or Monday '
      + 'competes with the week’s thinnest wave of fresh listings. Timing is a real but small '
      + 'edge; posting every unit consistently matters far more.',
    sections: [
      {
        type: 'qa',
        q: 'What is the best time to post on Facebook Marketplace?',
        a: [
          'For car listings, the honest answer starts with the only hard data available: when '
          + 'dealers actually post. Across 17,778 dealer posts from 196 U.S. dealerships in '
          + '[AutoLander’s 2026 Marketplace report](/facebook-marketplace-used-car-report-2026/), '
          + 'Thursday is the single busiest listing day at 17.5% of all posts, weekdays run hot '
          + 'from Monday through Friday, and volume collapses on the weekend — Sunday carries just '
          + '5.4%, meaning Thursday sees 3.3× Sunday’s volume.',
          'Read correctly, that is a supply map, not a demand map. It tells you when your '
          + 'competitors’ fresh listings flood the feed — and therefore when a new listing of '
          + 'yours faces the most or least competition for the fresh-listing attention Marketplace '
          + 'gives new posts. The contrarian window is the weekend and Monday; the crowded pool is '
          + 'midweek.',
        ],
      },
      {
        type: 'table',
        h2: 'When dealers post: the full week, from 17,778 posts',
        intro:
          'Share of new dealer listings by day of week, from AutoLander’s 2026 Facebook '
          + 'Marketplace used-car report — 17,778 posts across 196 U.S. dealerships, May 23 to '
          + 'August 21, 2026.',
        head: ['Day', 'Posts', 'Share of the week'],
        rows: [
          ['Monday', '2,919', '16.4%'],
          ['Tuesday', '2,902', '16.3%'],
          ['Wednesday', '3,017', '17.0%'],
          ['Thursday', '3,118', '17.5%'],
          ['Friday', '2,830', '15.9%'],
          ['Saturday', '2,036', '11.5%'],
          ['Sunday', '956', '5.4%'],
        ],
        note:
          'n = 17,778 dealer posts over the 90 days ending August 21, 2026. The distribution '
          + 'reflects when dealers post — supply — not when buyers browse.',
      },
      {
        type: 'qa',
        q: 'What is the best day to list a car on Facebook Marketplace?',
        a: [
          'If you accept the supply logic, the underrated days are Sunday and Monday. A listing '
          + 'published Sunday enters a feed receiving the week’s fewest fresh dealer listings — '
          + '5.4% of weekly volume — so it spends its newest, most-surfaced hours against the '
          + 'thinnest competition. Thursday, the reflexive choice, is when 17.5% of the week’s '
          + 'dealer inventory lands on top of yours.',
          'Worth saying plainly: dealers do not cluster midweek because testing proved it works. '
          + 'They cluster midweek because that is when staff are at their desks. The Thursday peak '
          + 'is a staffing artifact — which is exactly why the quiet days are available as an edge '
          + 'to any store whose posting does not depend on who is standing at a keyboard.',
        ],
      },
      {
        type: 'qa',
        q: 'Should I post car listings on weekends?',
        a: [
          'The data says the weekend is the open lane: Saturday carries 11.5% of dealer posts and '
          + 'Sunday 5.4%, against roughly 16–17.5% on each weekday. A store that lists on Saturday '
          + 'and Sunday publishes into the platform’s thinnest supply of fresh dealer inventory — '
          + 'while plenty of shoppers have their first free browsing time of the week.',
          'The obstacle is operational, not strategic: nobody wants to spend Sunday hand-typing '
          + 'listings, and most stores are closed or skeleton-crewed. That is a solvable problem. '
          + 'A [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) posts on '
          + 'schedule whether or not anyone is at the keyboard, which turns the weekend gap from '
          + 'an excuse into an advantage.',
        ],
      },
      {
        type: 'qa',
        q: 'When do car buyers actually browse Marketplace?',
        a: [
          'Nobody outside Meta can tell you with data — including us. Our report measures dealer '
          + 'posting behavior; Facebook does not publish buyer-side browsing patterns for '
          + 'Marketplace. Common sense says evenings and weekends see heavy casual browsing, but '
          + 'we will not dress a hunch up as a statistic, and you should be suspicious of anyone '
          + 'who does.',
          'The good news: the launch minute matters less than it feels like it should. A vehicle '
          + 'listing is not a social post — it lives for days or weeks, gets resurfaced by '
          + 'renewals, and is found through search and filters long after publishing. Supply gaps '
          + 'are a real edge at the margin, but they are rounding errors next to photos, price, '
          + 'and whether the unit is posted at all.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/toyota-tacoma-before.webp',
        after: '/studio/toyota-tacoma-after.webp',
        beforeAlt: 'Toyota Tacoma pickup in a dark dealer lot photo, before AutoLander',
        afterAlt: 'The same Toyota Tacoma re-staged in a clean, bright scene by AutoLander’s AI Photo Studio',
        caption:
          'Timing gets a listing seen once; merchandising gets it clicked every time. The same '
          + 'Toyota Tacoma as the original lot photo (left) and after AutoLander’s AI Photo '
          + 'Studio (right) — and Tacomas are among the most-posted trucks on Marketplace, so the '
          + 'photo is the tiebreaker.',
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What outranks timing, every week',
        items: [
          'Coverage: every in-stock unit posted, not the twelve someone had time for — '
          + '[bulk posting](/bulk-post-cars-to-facebook-marketplace/) makes coverage the default.',
          'Photos: clean, bright, showroom-grade images buyers stop scrolling for.',
          'Price: real, current, and defensible against the comps buyers see in the same scroll.',
          'Freshness: renewals on cadence, so listings keep surfacing after week one.',
          'Truth: sold units removed the day they sell.',
          'Consistency: a steady daily rhythm beats any perfectly timed burst — on visibility and '
          + 'on account health alike.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Posting time is the smallest lever on this page. Our own data can only show when '
          + 'dealers post, not when buyers buy — and no vendor has the buyer-side numbers either. '
          + 'Take the Sunday–Monday gap because it is free, then spend your actual effort where '
          + 'the compounding is: full coverage, better photos, honest prices, and listings that '
          + 'never go stale.',
      },
    ],
    faq: [
      ['What time of day should I post a car on Facebook Marketplace?',
        'There is no reliable public data on buyer browsing hours for Marketplace, so treat '
        + 'clock-time advice skeptically. Listings live for days and resurface through search, '
        + 'filters, and renewals, so the posting minute is a minor factor. Spread posts through '
        + 'the day at a steady pace rather than bursting them all at once.'],
      ['Is Thursday a bad day to post a car?',
        'Not bad — crowded. Thursday is the heaviest dealer posting day at 17.5% of the 17,778 '
        + 'posts in [AutoLander’s 2026 report](/facebook-marketplace-used-car-report-2026/), so a '
        + 'Thursday listing debuts alongside the week’s biggest wave of competing fresh '
        + 'inventory. Post daily regardless — just do not save units up for a midweek dump.'],
      ['Why do so few dealers post on Sunday?',
        'Staffing. Sunday posting means someone typing listings on their day off, which is why '
        + 'only 5.4% of dealer posts in the 2026 report landed there. Automated posting removes '
        + 'that constraint entirely — the schedule stops depending on who is in the building, and '
        + 'the quiet-day advantage becomes free.'],
      ['Does posting time matter more than photos and price?',
        'No, and it is not close. Timing shifts how much fresh-listing competition a post debuts '
        + 'against; photos and price decide whether anyone clicks and messages at all, every hour '
        + 'the listing is live. Fix the merchandising first, then take the timing edge as a free '
        + 'bonus on top of it.'],
      ['How often should a dealership post to Facebook Marketplace?',
        'Daily. New arrivals should be posted the day they hit the lot, and the whole in-stock '
        + 'inventory should stay live continuously, with renewals keeping older listings fresh. '
        + 'A steady daily rhythm outperforms weekly batch days on visibility, message flow, and '
        + 'account health — and it is what automation makes sustainable.'],
    ],
    cta: {
      heading: 'Own the days your competitors sleep',
      sub:
        'AutoLander posts your inventory on schedule — Sundays included — so every unit debuts '
        + 'against the thinnest competition without anyone typing on their day off.',
    },
  },

];
