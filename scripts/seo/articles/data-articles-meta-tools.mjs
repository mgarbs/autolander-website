// "Facebook's new seller tools" silo (2026-09-12). Two timely articles on the things Meta
// shipped for Marketplace sellers this year: the standalone Seller app (July 24, 2026) and the
// Muse personal AI agent (announced September 8, 2026). Both ride real search interest, both
// stay honest about what Meta has and has not said for vehicles, and both land on the same
// dealer truth: the tools change where buyers talk and how listings get read, not how eighty
// units get onto Marketplace from a feed and stay true to the lot.
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// House style for THIS file (Michael, 2026-09-12): no em-dashes, no "that's not X, it's Y"
// constructions. Every Meta fact below is from Meta's own launch posts or major-outlet coverage
// as of 2026-09-12; re-read them if Meta changes the products.
// Messaging honesty: AutoLander has no inbox feature and never guarantees account safety.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // 1. /guide/facebook-seller-app-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'facebook-seller-app-for-car-dealers',
    silo: 'metaTools',
    anchor: 'The Facebook Seller app for car dealers: what it does and where it fits',
    crumb: 'Facebook Seller app',
    primaryKeyword: 'facebook seller app',
    secondaryKeywords: [
      'meta seller app',
      'facebook marketplace seller app',
      'facebook seller app for cars',
      'seller app facebook marketplace review',
    ],
    title: 'Facebook Seller App for Car Dealers: What It Does (2026)',
    description:
      'The Facebook Seller app explained for car dealers: what Meta shipped on July 24, 2026, what '
      + 'it does for vehicle listings, and how it fits next to a posting tool.',
    eyebrow: 'Facebook’s new seller tools',
    h1: 'The Facebook Seller app: what it actually does for a car dealer',
    tldr:
      'Seller is a standalone Facebook app Meta released on July 24, 2026 for people who sell on '
      + 'Marketplace. It puts listing creation, a buyer inbox organized by item, inventory tools and '
      + 'performance numbers in one place, and Meta AI can draft a listing from a photo. It was built '
      + 'for resellers of everyday items. For a dealership it is a good inbox and a useful dashboard, '
      + 'and it leaves the two jobs that eat a dealer’s day untouched: getting every unit onto '
      + 'Marketplace from the feed, and keeping price, mileage and sold status matched to the lot.',
    sections: [
      {
        type: 'prose',
        paras: [
          'Meta releases a Marketplace app for sellers, and every dealer who posts cars by hand asks '
          + 'the same two questions: does this finally post my inventory for me, and will it get me in '
          + 'trouble. The short answers are no and no. The longer answers are worth ten minutes, because '
          + 'the app changes where your buyers’ messages live, it gives you numbers Marketplace never '
          + 'showed sellers before, and most dealers will hear about it from a salesperson who '
          + 'downloaded it first.',
        ],
      },
      {
        type: 'qa',
        q: 'What is the Facebook Seller app?',
        a: [
          'Seller is a separate app from Meta, released for iPhone in the United States on July 24, '
          + '2026, for anyone 18 or older who sells on Facebook Marketplace. You sign in with the '
          + 'Facebook account you already use, and your listings, buyer messages, ratings and selling '
          + 'history are already there. Anything you create or edit in Seller shows up on Marketplace, '
          + 'where the buyers are, and stays in sync.',
          'Inside, there are five pieces. A Seller Home screen lists what needs attention: buyers '
          + 'waiting on a reply, listings Meta thinks you should reprice, and a snapshot of what you '
          + 'sold. Listing creation takes photos and asks Meta AI to draft the title, description, '
          + 'category and a suggested price, with a bulk mode for several items at once. Listing '
          + 'management lets you view, edit, relist, reprice and delete from one screen. The inbox '
          + 'groups buyer conversations by the item they are about and keeps them away from your '
          + 'personal chats. And an insights tab shows views, saves, message threads and sold items '
          + 'per listing.',
          'Meta paired the launch with a free verification step. Take a selfie, prove there is a '
          + 'person behind the profile, and a check mark in a white circle appears on your Marketplace '
          + 'profile. It is separate from the paid Meta Verified subscription and its blue badge.',
          'Android and a web version were in testing at launch. Meta says Marketplace now carries more '
          + 'than 430 million listings a month and reaches over a billion people, and Seller is its '
          + 'first dedicated workspace for the people who post the most.',
        ],
      },
      {
        type: 'qa',
        q: 'Does the Seller app handle vehicle listings?',
        a: [
          'Meta built Seller around the person who sells furniture, clothes, electronics and '
          + 'collectibles, and its launch materials do not mention vehicles. That matters because a car '
          + 'listing on Marketplace is its own category with its own required fields: year, make, '
          + 'model, trim, mileage, transmission, vehicle type, and a title status a buyer will ask '
          + 'about within the first two messages. The AI draft feature is described for item photos, '
          + 'where a picture of a lamp is enough to guess a title and a price. A picture of a silver '
          + 'sedan is not enough to know it is the 2021 SEL with 41,000 miles rather than the 2019 SE '
          + 'with 78,000.',
          'So the honest answer, as of September 2026, is that the app is a Marketplace workspace '
          + 'first and a car tool second. Your existing vehicle listings sync into it, your buyer '
          + 'conversations about them land in the inbox, and the insights show which units get looked '
          + 'at. Creating a vehicle listing from scratch inside it is something to test with one car '
          + 'before you plan a process around it. Meta ships changes to Marketplace without much '
          + 'warning, and the vehicle flow could get the AI treatment any month.',
          'What the app leaves alone is the source of the numbers. Nothing in Seller reads your DMS, '
          + 'your website or your inventory feed. Every year, mileage and price still gets typed by a '
          + 'person, and every price change on the lot still has to be repeated by hand inside the '
          + 'app. That is the same gap a dealer has had since the vehicle category launched, now with '
          + 'a nicer screen around it.',
        ],
      },
      {
        type: 'table',
        h2: 'What the Seller app does, and what a dealership still needs',
        intro:
          'A dealership runs on the same Marketplace as a person clearing out a garage. The jobs are '
          + 'different in size, and size is the whole problem.',
        head: ['Job', 'Facebook Seller app', 'AutoLander'],
        alCol: 2,
        rows: [
          ['Draft a listing from photos', 'Yes. Meta AI drafts title, description, category and price for everyday items', 'Yes, from your inventory feed: year, make, model, trim, mileage, price and description'],
          ['Fill vehicle facts from your DMS or website', 'No', 'Yes. Every field comes from the feed you already run'],
          ['Post a 60-unit lot', 'One listing at a time, by hand, in the app', 'Queued and posted from the feed at a pace you set'],
          ['Keep price matched to the lot', 'Manual repricing, with Meta suggestions', 'Automatic when the feed changes'],
          ['Remove sold units', 'Manual', 'Automatic when the feed drops the car'],
          ['Buyer inbox', 'Yes, organized by item', 'No. Your team answers buyers in Messenger or in Seller'],
          ['Performance insights', 'Views, saves, messages and sold, per listing', 'Which posts produced buyer conversations and sales'],
          ['Photo quality', 'Whatever you upload', 'AI photo editing on the real car, never repainted'],
        ],
        note:
          'Seller feature descriptions are from Meta’s launch announcement and the app as of September '
          + '2026. Meta changes Marketplace without notice.',
      },
      {
        type: 'steps',
        h2: 'How to run the Seller app and AutoLander side by side',
        intro: 'The two tools never compete for the same job, which is why the setup is short.',
        steps: [
          {
            title: 'Let the feed do the posting',
            body:
              'Connect the inventory you already publish, whether that is a DMS export, a CSV or SFTP '
              + 'drop, or your dealer website, and let AutoLander create the Marketplace listings from '
              + 'it through your own logged-in Facebook session. Every unit gets the real price, the '
              + 'real mileage and a description built from the feed. The [inventory sync '
              + 'page](/facebook-marketplace-inventory-sync/) covers which sources connect.',
          },
          {
            title: 'Open Seller for the conversations',
            body:
              'Every buyer message about those listings lands in the Seller inbox, sorted by the '
              + 'vehicle it is about. That is where your salesperson lives. AutoLander has no inbox '
              + 'feature and never sees any of it. The first reply still comes from a human, and it '
              + 'still has to be fast; our [response time guide](/guide/marketplace-response-time-for-car-dealers/) '
              + 'explains why the first reply wins the appointment.',
          },
          {
            title: 'Read the insights, then act on the lot',
            body:
              'Seller shows which units get views and saves and which get messages. Use that the way '
              + 'you use website VDP traffic: a unit with views and no messages is usually a price '
              + 'problem, and a unit with no views is usually a photo problem.',
          },
          {
            title: 'Fix photos where the numbers say to',
            body:
              'Take the units that are getting skipped and run their lot photos through an [AI car '
              + 'photo editor](/ai-car-photo-editor/). Same car, same price, clean background and '
              + 'correct light, and the next week of insights tells you whether it worked.',
          },
          {
            title: 'Verify the posting profile',
            body:
              'Use the free selfie verification on the profile that carries your listings. It costs '
              + 'nothing, it adds a badge buyers can see, and an established, verified profile is the '
              + 'kind of account that runs into fewer review holds.',
          },
          {
            title: 'Leave price and sold status to the feed',
            body:
              'When the desk drops a price or the car sells, do nothing in Seller. AutoLander pushes '
              + 'the price change and pulls the sold listing down on the next feed check, which is the '
              + 'part that used to go stale first.',
          },
        ],
      },
      {
        type: 'figure',
        before: '/studio/hyundai-sonata-before.webp',
        after: '/studio/hyundai-sonata-after.webp',
        beforeAlt: 'Hyundai Sonata in a raw dealer lot photo, before AutoLander',
        afterAlt: 'The same Hyundai Sonata re-staged in a clean scene by AutoLander’s AI Photo Studio',
        caption:
          'The Seller app can tell you a listing is being skipped. It cannot fix why. The same '
          + 'Hyundai Sonata as a raw lot photo (left) and after AutoLander’s AI Photo Studio (right).',
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'What the Seller app gets right',
        intro: 'Credit where it is due. Four things in it are better than what dealers had a year ago.',
        items: [
          'An inbox that keeps Marketplace conversations apart from your personal messages, with each '
          + 'thread pinned to the listing it is about. Anyone who has lost a buyer inside a Messenger '
          + 'scroll knows what that is worth.',
          'Per-listing numbers. Views, saves, messages and sold, on the item, without exporting '
          + 'anything. Marketplace never gave sellers a clean version of this before.',
          'Free verification. A badge that says a real person is behind the profile is a small trust '
          + 'signal, and on a channel where buyers worry about scams it is a welcome one.',
          'Relist and reprice from one screen. Still manual, still one unit at a time, but faster than '
          + 'the old flow.',
        ],
      },
      {
        type: 'qa',
        q: 'Will the Seller app replace tools like AutoLander?',
        a: [
          'It replaces a different tool. Seller replaces the pile of Messenger threads and the notes '
          + 'app where a salesperson tracked what was live. It is a workspace for the person who has '
          + 'thirty things to sell and posts a few a week.',
          'A dealership has eighty VINs, a feed that changes every morning, and a price desk that '
          + 'moves numbers in the afternoon. The cost was never the screen. The cost is the ten to '
          + 'fifteen minutes per unit to post it well, repeated for every unit, and then the repeated '
          + 'trips back to fix prices and pull sold cars. Meta has never built anything that reads a '
          + 'dealer feed, and its history with dealer inventory programs suggests it is in no hurry '
          + 'to.',
          'That leaves the two jobs split cleanly. A [Facebook Marketplace auto '
          + 'poster](/facebook-marketplace-auto-poster/) gets the inventory onto Marketplace and keeps '
          + 'it true to the lot, from your own computer and your own session. Seller is where your '
          + 'people talk to the buyers that inventory brings in. If Meta ever adds feed-based vehicle '
          + 'posting to Seller, we will say so on this page. How we think about our own scope is in '
          + '[why we post to Marketplace only](/why-facebook-marketplace-only/) and [why we do not '
          + 'answer your buyers](/why-we-dont-answer-your-buyers/).',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Seller is new, it is iPhone-only in the United States as this is written, and Meta will '
          + 'change it. Nothing here is a guarantee about account safety on either side: Meta sets the '
          + 'rules, and no tool, including AutoLander, can promise a profile will never be actioned. '
          + 'AutoLander posts through your own logged-in session on your own machine, at a pace you '
          + 'control, and it has no inbox feature. Read the [automation policy '
          + 'guide](/guide/facebook-marketplace-automation/) before you scale anything.',
      },
    ],
    faq: [
      ['Is the Facebook Seller app free?',
        'Yes. Seller is a free download, and listing on Marketplace stays free. The only paid thing '
        + 'nearby is the Meta Verified subscription, which is separate from the free selfie '
        + 'verification the app offers.'],
      ['Is the Seller app available on Android?',
        'At launch on July 24, 2026 it was iPhone-only in the United States, with Android and a web '
        + 'version in testing. Check the Play Store for your region; Meta expands these in stages.'],
      ['Can I post cars with the Facebook Seller app?',
        'Your existing vehicle listings sync into the app and their buyer messages show in its inbox. '
        + 'Meta’s launch materials describe the AI listing draft for everyday items and say nothing '
        + 'about the vehicle category, so test creating one car listing inside the app before you '
        + 'build a process on it.'],
      ['Does the Seller app answer buyers for me?',
        'Meta AI can draft and send an availability reply built from your listing details if you turn '
        + 'that on when you create the listing, and you can preview and edit it. Everything past that '
        + 'is a human conversation. AutoLander has no inbox feature at all; your team answers buyers '
        + 'in Messenger or in Seller.'],
      ['Does AutoLander work with the Seller app?',
        'Yes, because they never touch the same job. AutoLander creates and maintains the listings '
        + 'from your inventory feed through your own Facebook session. Seller shows those listings, '
        + 'their messages and their numbers on your phone. There is nothing to integrate; both work '
        + 'from the same Marketplace account.'],
    ],
    cta: {
      heading: 'Let the feed post the lot. Keep the app for the buyers.',
      sub:
        'AutoLander posts every unit from your inventory feed to Facebook Marketplace and keeps '
        + 'price, mileage and sold status matched to the lot, from your own computer.',
    },
  },

  // ---------------------------------------------------------------------------
  // 2. /guide/meta-muse-ai-agent-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'meta-muse-ai-agent-for-car-dealers',
    silo: 'metaTools',
    anchor: 'Meta Muse for car dealers: getting your listings ready for an AI that shops',
    crumb: 'Meta Muse',
    primaryKeyword: 'meta muse',
    secondaryKeywords: [
      'meta muse ai agent',
      'what is meta muse',
      'muse ai facebook marketplace',
      'will meta muse buy cars',
      'muse ai shopping agent',
    ],
    title: 'Meta Muse AI Agent: What It Means for Car Dealers (2026)',
    description:
      'Meta Muse explained for car dealers: what the AI agent Meta announced on September 8, 2026 '
      + 'does, whether it can shop Facebook Marketplace, and how to get listings ready.',
    eyebrow: 'Facebook’s new seller tools',
    h1: 'Meta Muse: what happens to your listings when the buyer sends an AI',
    tldr:
      'Muse is a personal AI agent Meta announced on September 8, 2026. It runs on its own computer '
      + 'in Meta’s cloud, opens a browser, fills forms, negotiates, and checks out with the user’s '
      + 'card once they approve. It is US-only, invite-gated, and Meta has announced nothing for '
      + 'sellers or for vehicles. It still matters to a dealership, because an agent shopping for a '
      + 'buyer reads listing fields and skips anything with a placeholder price, missing mileage or '
      + 'a sold car still live. Everything that makes a Marketplace listing readable to Muse makes it '
      + 'sell better to a person today.',
    sections: [
      {
        type: 'prose',
        paras: [
          'Every few years a Meta announcement lands in the dealer world with the same feeling: '
          + 'something big changed, nobody explained it for cars, and the store that works it out first '
          + 'gets a quiet advantage for a season. Muse is that announcement for 2026. Meta built it for '
          + 'the buyer, so nothing in it is aimed at a dealership, and that is exactly why it deserves '
          + 'ten minutes of a dealer’s time. The buyer is about to arrive with software, and software '
          + 'reads a listing differently than a person does.',
        ],
      },
      {
        type: 'qa',
        q: 'What is Meta Muse?',
        a: [
          'Muse is a personal AI agent from Meta, announced on September 8, 2026. Where a chatbot '
          + 'answers questions, Muse does tasks. Each user gets a dedicated computer in Meta’s cloud '
          + 'with its own browser, and the agent uses it to send emails, manage a calendar, book a '
          + 'table or a flight, fill in forms, compare prices, negotiate, and buy things. Meta '
          + 'demonstrated it finding travel strollers, showing the price and the payment method, and '
          + 'waiting for a tap before paying.',
          'Access is tight. It is available in the United States only, for adults, through a '
          + 'waitlist and invite codes, on iPhone, Android, the muse.ai website and inside WhatsApp, '
          + 'with AI glasses promised later. There is a free tier and two paid plans, Power at $20 a '
          + 'month and Maximum at $100 a month. It runs on Meta’s own Muse Spark model.',
          'Two design choices matter for anyone selling online. First, the agent never sees the '
          + 'user’s passwords or card numbers; those are held outside it and swapped in at the edge, '
          + 'and purchases at new merchants use single-use card numbers. Second, a supervising system '
          + 'Meta calls Sentinel approves or blocks each action, and the person confirms a purchase '
          + 'before it happens. So a Muse buyer is a real person with a real card, with an assistant '
          + 'doing the legwork.',
          'Mark Zuckerberg has said Meta plans to take a small cut of transactions, potentially paid '
          + 'by the business on the other side. Meta’s own materials list Marketplace among the '
          + 'places Muse can act for its user. Meta has shown no car purchase, and it has announced '
          + 'nothing for sellers.',
        ],
      },
      {
        type: 'qa',
        q: 'Can Muse buy a car on Facebook Marketplace?',
        a: [
          'Nobody outside Meta knows yet, and the honest reading of the launch is that a full car '
          + 'purchase is a long way off. A car is a test drive, a title, a trade appraisal, financing '
          + 'paperwork and a signature, and none of that happens inside a browser session. What an '
          + 'agent can do today is everything a buyer does before they message you: search by budget '
          + 'and distance, filter by year and mileage, read every listing in the results, shortlist, '
          + 'and send the first message. Meta has shown Muse negotiating on price in other contexts, '
          + 'so a buyer telling it to ask for your best number is an ordinary request.',
          'That first pass is where a dealership wins or loses, and it is the pass a machine does '
          + 'with no patience at all. A person scrolling Marketplace will open a listing with a $1 '
          + 'price to see what it really costs. An agent with a budget filter never sees it. A person '
          + 'will forgive a blank mileage field and ask. An agent that was told “under 60,000 miles” '
          + 'drops the listing because the field is empty. A person messages about a car that sold '
          + 'last week and gets annoyed. An agent marks the seller unreliable and moves on.',
          'For a dealership the useful question is whether your listings survive being read by '
          + 'software. Most hand-posted dealer inventory does not, for reasons you can fix this week.',
        ],
      },
      {
        type: 'table',
        h2: 'What a human buyer forgives and an AI agent does not',
        intro: 'Marketplace listings were written for people. An agent reads the fields and ignores the charm.',
        head: ['Listing habit', 'A person scrolling', 'An agent with instructions'],
        rows: [
          ['$1 or $1,234 placeholder price', 'Opens it to find the real price', 'Outside every budget filter; never opened'],
          ['Mileage left blank', 'Asks in a message', 'Fails a mileage filter; skipped'],
          ['Year, make and model only, no trim', 'Guesses or asks', 'Cannot match a trim request; ranked below listings that state it'],
          ['Sold car still live', 'Messages, gets no reply, moves on annoyed', 'Marks the seller unreliable for the next search too'],
          ['Marketplace price higher than your website', 'May never notice', 'Cross-checks and reports the gap to the buyer'],
          ['Three dark lot photos', 'Scrolls past', 'Cannot verify condition; prefers listings with full angles'],
          ['Description in all caps with slogans', 'Skims it', 'Extracts nothing; title status and features read as missing'],
          ['One clean listing per unit, real fields filled', 'Messages', 'Shortlists and messages'],
        ],
        note:
          'Column three describes how a shopping agent with filters behaves in general. Meta has not '
          + 'published how Muse ranks Marketplace results.',
      },
      {
        type: 'bullets',
        h2: 'What an AI shopping agent needs from a car listing',
        intro: 'The list is short, and every item on it is also what a serious human buyer wants.',
        items: [
          'The real advertised price, the same number as your website and your feed, updated the day '
          + 'the desk changes it.',
          'Exact year, make, model and trim in the fields Marketplace provides, so a filter can match '
          + 'them without reading the description.',
          'True odometer mileage in the mileage field. An unknown reading should stay blank rather '
          + 'than guessed, and a blank should be rare.',
          'Photos of the actual unit from every angle, interior and odometer included. An agent '
          + 'checking condition wants evidence, and so does the person it reports to.',
          'A description that states title status, condition and key features in plain sentences, '
          + 'with the store name and how to reach a person.',
          'One live listing per unit, and no listing at all once the car is gone. Duplicates and '
          + 'ghosts are what a machine punishes hardest.',
          'A posting profile that is established and, now that it is free, verified with the selfie '
          + 'check on Marketplace.',
        ],
      },
      {
        type: 'steps',
        h2: 'Make your Marketplace inventory agent-ready in a week',
        intro: 'None of this needs Muse to exist. It pays off with the buyers you already have.',
        steps: [
          {
            title: 'Audit what is live today',
            body:
              'Open your Marketplace profile as a buyer would and count three things: units with a '
              + 'placeholder price, units with blank mileage, and units that sold but are still '
              + 'listed. Most stores that post by hand find all three in the first minute.',
          },
          {
            title: 'Make the feed the source of truth',
            body:
              'Put the price, mileage, trim and photos in the inventory you already publish, whether '
              + 'that is the DMS, the website or a CSV drop, and post from it. When every listing is '
              + 'generated from the feed, the fields are filled the same way every time and a price '
              + 'change on the lot reaches Marketplace without anyone remembering to do it. The '
              + '[inventory sync page](/facebook-marketplace-inventory-sync/) explains how that works.',
          },
          {
            title: 'Pull sold units the day they sell',
            body:
              'A car that sold on Tuesday and is still listed on Friday is the single fastest way to '
              + 'look unreliable to both a person and a program. Automate the removal or assign it to '
              + 'a named person with a daily deadline.',
          },
          {
            title: 'Fix the photos on the units that get skipped',
            body:
              'Lot photos at dusk with three other cars in frame give an agent nothing to verify. Run '
              + 'the skipped units through an [AI car photo editor](/ai-car-photo-editor/) that keeps '
              + 'the real car, cleans the scene, and never repaints a colour.',
          },
          {
            title: 'Write descriptions a parser can use',
            body:
              'State title status, condition, notable features and financing availability in plain '
              + 'sentences. Skip emoji and slogans. Put the dealership name and a phone number in '
              + 'every one.',
          },
          {
            title: 'Answer the first message like it counts',
            body:
              'When an agent sends the first message, a fast human reply is what turns a shortlist '
              + 'into an appointment. Speed to lead is covered in our [response time '
              + 'guide](/guide/marketplace-response-time-for-car-dealers/). AutoLander has no part in '
              + 'that step; your team does.',
          },
        ],
      },
      {
        type: 'figure',
        before: '/studio/kia-k5-before.webp',
        after: '/studio/kia-k5-after.webp',
        beforeAlt: 'Kia K5 in a raw dealer lot photo, before AutoLander',
        afterAlt: 'The same Kia K5 re-staged in a clean scene by AutoLander’s AI Photo Studio',
        caption:
          'Condition an agent can verify. The same Kia K5 as a raw lot photo (left) and after '
          + 'AutoLander’s AI Photo Studio (right). Same car, same price.',
      },
      {
        type: 'qa',
        q: 'What does Muse mean for the dealer who still posts by hand?',
        a: [
          'It raises the price of every shortcut. A placeholder price used to cost a few messages. A '
          + 'blank mileage field used to cost a question. A sold car left live used to cost one '
          + 'annoyed buyer. When the buyer arrives with software that filters, cross-checks and '
          + 'remembers, each of those shortcuts costs the listing entirely, and nobody at the store '
          + 'finds out it happened, because there is no message to miss.',
          'It also rewards the boring discipline that hand-posting stores rarely sustain: every unit '
          + 'posted, every field filled from the source, every price current, every sold car gone. A '
          + '[Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) that works from '
          + 'the feed does that discipline on a schedule, through your own logged-in session, and it '
          + 'is the same discipline behind the numbers in the [Marketplace Used-Car Report '
          + '2026](/facebook-marketplace-used-car-report-2026/). Muse leaves the definition of a good '
          + 'listing exactly where it was and takes away the tolerance for a bad one.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'Muse is in a closed alpha, US-only, and Meta has published nothing about how it treats '
          + 'Marketplace vehicle listings. Anyone selling you a Muse integration for car dealers in '
          + 'September 2026 is guessing. AutoLander does not use Muse, does not message buyers, and '
          + 'cannot guarantee how any Meta system ranks a listing. What it does is keep every listing '
          + 'generated from your inventory feed, priced to the lot and removed when sold, through '
          + 'your own Facebook session. Those are the fields an agent reads, and they are the same '
          + 'fields a person reads first.',
      },
    ],
    faq: [
      ['What is Meta Muse?',
        'Muse is a personal AI agent Meta announced on September 8, 2026. It runs on a dedicated '
        + 'computer in Meta’s cloud and does tasks for its user: email, bookings, forms, price '
        + 'comparison, negotiation and purchases, with the person confirming payments. It is separate '
        + 'from the Meta AI assistant inside Facebook and Instagram.'],
      ['Is Meta Muse available now?',
        'In limited form. At launch it is United States only, for adults, through a waitlist and '
        + 'invite codes, on iPhone, Android, muse.ai and WhatsApp. Wider access and AI glasses '
        + 'support were promised for later.'],
      ['How much does Muse cost?',
        'There is a free tier, plus two paid plans Meta announced at launch: Power at $20 a month and '
        + 'Maximum at $100 a month. Meta has also said it plans to take a small cut of transactions, '
        + 'possibly charged to the business on the other side.'],
      ['Will Muse negotiate car prices on Facebook Marketplace?',
        'Meta has shown Muse negotiating and checking out in other shopping contexts and lists '
        + 'Marketplace among the places it can act for a user, but it has not demonstrated a vehicle '
        + 'purchase or negotiation. Expect the first message and the first ask for a best price to '
        + 'arrive through an agent before any purchase does, and expect the person to still come in '
        + 'for the test drive.'],
      ['Does AutoLander work with Meta Muse?',
        'There is nothing to connect. AutoLander posts and maintains your vehicle listings from your '
        + 'inventory feed so the fields an agent reads are filled, current and removed when the car '
        + 'sells. It does not message buyers, and it does not integrate with Muse or any other AI '
        + 'agent.'],
    ],
    cta: {
      heading: 'Be the listing the agent picks',
      sub:
        'AutoLander posts every unit from your inventory feed with the real price, real mileage and '
        + 'real photos, keeps it current, and pulls it when the car sells.',
    },
  },
];
