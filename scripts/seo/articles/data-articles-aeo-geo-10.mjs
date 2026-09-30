// "AEO and GEO for car dealers" silo, batch 10 (2026-09-30): the dealer-types cluster.
// Five articles, in publish order: #8 independents (cluster pillar), #16 buy here pay here,
// #25 RV dealers, #34 powersports dealers, #41 dealer groups.
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Link rules (Michael, 2026-09-30): in-body sibling links use ONLY the publish-aware token
// [anchor](@slug) and point ONLY to lower publish numbers (plan.json inBodyLinks); later siblings
// connect through alsoRelated. Hand-written hrefs go only to the live money page
// /aeo-geo-for-car-dealers/ (and its #scan-form / #plans anchors), live NAV pages, and https://
// sources from the fact bank (the silo fact bank, read 2026-09-30).
// House style: no em or en dashes, no "is not X. It is Y." cadence, curly apostrophes, no promise
// of rankings, mentions or placements. The free scan measures ChatGPT and Claude only.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #8  /aeo-geo/ai-search-for-independent-dealers/   (dealer-types pillar)
  // ---------------------------------------------------------------------------
  {
    slug: 'ai-search-for-independent-dealers',
    silo: 'aeoGeo',
    cluster: 'dealer-types',
    publishOrder: 8,
    anchor: 'AI search for independent used car dealers: where a small lot should start',
    crumb: 'Independent dealers',
    primaryKeyword: 'ai search for independent dealers',
    secondaryKeywords: [
      'independent dealership and chatgpt',
      'small car lot marketing with ai',
      'used car dealer ai visibility',
      'franchise vs independent ai search',
      'ai search for used car dealers',
    ],
    alsoRelated: [
      'sell-cars-online-small-dealership',
      'used-car-dealer-advertising-on-a-budget',
      'google-business-profile-ai-answers',
      'vehicle-detail-page-ai-readable',
      'buy-here-pay-here-ai-answers',
      'dealer-group-ai-visibility',
    ],
    augmentKeys: ['aiDealers'],
    title: 'AI Search for Independent Used Car Dealers: Where to Start',
    description:
      'How AI search works for independent used car dealers: what used-car shoppers ask, what a '
      + 'small lot controls, and the first fixes that cost nothing.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'AI search for independent used car dealers: how a small lot gets into the answer',
    tldr:
      'AI search for independent dealers works the same way for a 30-car lot as for a franchise store: '
      + 'an assistant names the dealerships it can find, place and trust. An independent can show '
      + 'up in those answers, though no one can promise that it will. The first fixes cost nothing: '
      + 'let AI search crawlers read your site, put price, mileage and VIN on every vehicle page as '
      + 'text, complete your Google Business Profile and answer every review.',
    sections: [
      {
        type: 'qa',
        id: 'can-a-small-lot-show-up',
        q: 'Can a small independent lot show up in AI answers?',
        a: [
          'Yes, a small independent lot can show up in AI answers, though no one can promise that it '
          + 'will. ChatGPT, Claude and Google AI Overviews answer the exact question a buyer types, '
          + 'and a store whose facts are easy to read and check gives them something to work with. '
          + 'That work is [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/).',
          'The research that named GEO points in a useful direction, with a caveat attached. In the '
          + '[GEO paper by Aggarwal and colleagues](https://arxiv.org/html/2311.09735v3), published at '
          + 'KDD 2024, sites that ranked lower in search results gained the most from one rewrite '
          + 'method, citing sources. In the paper’s test setup, that method raised visibility 115.1% '
          + 'for sites ranked fifth, while the top-ranked site’s visibility fell 30.3% on average.',
          'Treat that as a lab result on a research benchmark. It says nothing about how a used-car '
          + 'store will do against the franchise store down the road. The practical reading is modest: '
          + 'pages that give an assistant something solid to cite are worth writing, whatever the size '
          + 'of the store.',
          'Picture a hypothetical 40-car independent in a mid-size town. When a buyer asks where to buy '
          + 'a reliable used truck nearby, the store’s website, Business Profile and reviews are among '
          + 'the sources an assistant can find, and if they are thin, stale or contradictory, it has '
          + 'little reason to name the store.',
        ],
      },
      {
        type: 'qa',
        id: 'how-used-car-buyers-use-ai',
        q: 'How do used-car buyers use AI?',
        a: [
          'Used-car buyers use AI tools and AI summaries to research cars and stores, though fewer of '
          + 'them do so than new-car buyers. In [Cox Automotive’s 2025 Car Buyer Journey '
          + 'Study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf), '
          + '17% of used-vehicle buyers used AI websites such as ChatGPT or Microsoft Copilot, or '
          + 'AI-generated overviews such as Google’s, while they shopped.',
          'Keep the qualifiers attached to that number. It comes from people who bought a vehicle in '
          + 'the previous 12 months, surveyed in fall 2025, and 2025 was the first year Cox tracked AI '
          + 'use in the study. The same release put the share at 19% of all buyers and 25% of '
          + 'new-vehicle buyers. For a used-car store, AI is one research step among several, and 17% '
          + 'is a first measurement to watch rather than a forecast.',
          'The questions are the ones your salespeople hear every day, typed out in full: which lots '
          + 'near me have a good reputation, where can I find a reliable SUV in my budget, is this store '
          + 'upfront about fees. These examples are illustrative, and every one of them is answered from '
          + 'facts a store either publishes or leaves out.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-an-independent-controls',
        h2: 'What does an independent control that a franchise store doesn’t?',
        intro:
          'An independent controls its own website, its own speed and its own voice, and all three '
          + 'matter in AI search. A franchise rooftop often works inside a manufacturer website program '
          + 'and a group’s approval chain. An independent owner can change a robots.txt line, add '
          + 'price as text or publish an answer page this week without asking anyone.',
        items: [
          'Website decisions. Most independents choose their own website vendor and can ask for a '
          + 'change directly. No manufacturer program decides which templates, scripts or pages the '
          + 'store may use.',
          'Speed. The owner is usually the approver. A fix that needs one yes from one person can go '
          + 'live in days instead of waiting for a quarterly review.',
          'Voice. The owner’s own words, reconditioning standards and reasons a car made the front line '
          + 'are first-hand material no national template has, the kind Google’s AI guidance asks for.',
          'Local knowledge. You know which roads are hard on front ends, which trims sell in your '
          + 'county and which questions your buyers ask twice.',
          'Direct review replies. The person who sold the car can answer its review the same week.',
        ],
      },
      {
        type: 'steps',
        h2: 'What are the first free fixes in AI search for independent dealers?',
        intro:
          'The first free fixes decide whether an assistant can read and place your store at all: '
          + 'crawler access, vehicle-page text, a complete Google Business Profile, matching store '
          + 'facts and review replies. Each one costs time instead of money, and each is something a '
          + 'small lot can finish in a week or two with its current website vendor.',
        steps: [
          {
            title: 'Let AI search crawlers in',
            body:
              'Read your robots.txt, and ask your website vendor whether the security service in front '
              + 'of your site blocks AI crawlers. [OpenAI says](https://developers.openai.com/api/docs/bots) '
              + 'OAI-SearchBot surfaces websites in ChatGPT’s search features and is separate from '
              + 'GPTBot, its training crawler. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
              + 'blocking Claude-SearchBot prevents indexing for search and reduces visibility. You can '
              + 'block training crawlers without blocking search. Start here: '
              + '[the 15-minute AI access check for dealer websites](@can-chatgpt-see-my-dealer-website).',
          },
          {
            title: 'Put price, mileage and VIN on every vehicle page as text',
            body:
              'If the price lives only inside a photo or loads after a click, an assistant may never see '
              + 'it. Ask your vendor to show price, mileage, VIN and trim as plain text on every vehicle '
              + 'detail page, the VDP.',
          },
          {
            title: 'Complete your Google Business Profile',
            body:
              'Correct name, address, phone, hours, categories, photos and a plain description. '
              + '[Google says](https://support.google.com/business/answer/7091) local results are based '
              + 'mainly on relevance, distance and prominence, and that there is no way to request or pay '
              + 'for a better local ranking. The profile work is free.',
          },
          {
            title: 'Make your store facts match everywhere',
            body:
              'The name, address, phone and hours on your website, your Business Profile and the '
              + 'listing sites should be identical. When they disagree, an assistant has a reason to '
              + 'doubt which one is right.',
          },
          {
            title: 'Answer every review',
            body:
              'Reply to new reviews within a few days, good and bad, in a calm voice. It costs nothing, '
              + 'and every reply is public text on your profile that the next buyer reads.',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'independent-reviews',
        h2: 'How should an independent handle reviews?',
        intro:
          'An independent should ask every sold customer for a review the same way, every time, and '
          + 'never pay for reviews or filter who gets asked. Reviews are one of the few trust signals a '
          + 'small lot can build steadily, and the rules are the same for a 30-car lot as for a '
          + 'franchise group.',
        items: [
          'Ask everyone, the same way. [Google’s review tips](https://support.google.com/business/answer/3474122) '
          + 'suggest reminding customers with a link or a QR code, replying to reviews, addressing '
          + 'reviewers by name and responding in a timely manner. A text with the direct link, sent a '
          + 'few days after delivery, covers it.',
          'No incentives. Google strictly prohibits offering free or discounted goods or services in '
          + 'exchange for reviews, so no oil change coupon, no gift card and no raffle entry.',
          'No gating. The [Google Maps content policy](https://support.google.com/contributionpolicy/answer/7400114) '
          + 'bars discouraging negative reviews or selectively asking for positive ones, and it bars '
          + 'reviews from current or former employees. Send the same request to the buyer who loved '
          + 'the car and the buyer who negotiated for two hours.',
          'Reply to every review. Keep replies short, specific and free of sales pitches; Google says '
          + 'replies should not be promotional.',
          'Read the pattern, not the single review. If three reviews in a month mention the same fee or '
          + 'the same delay, fix the process, then say so in your replies. For the bigger picture, read '
          + '[why reviews matter to AI assistants](@dealership-reviews-ai-recommendations).',
        ],
      },
      {
        type: 'qa',
        id: 'what-a-small-lot-can-publish',
        q: 'What can a small lot publish that big stores can’t?',
        a: [
          'A small lot can publish first-hand knowledge that a national template cannot copy: how the '
          + 'owner picks cars at auction, what the shop checks during reconditioning, and which '
          + 'vehicles hold up on local roads. [Google’s guidance on AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) puts '
          + 'unique, first-hand content ahead of recycled advice.',
          'Google’s AI optimization guide says unique, non-commodity content will likely influence '
          + 'presence in its generative AI search more than any other suggestion in the guide. It tells '
          + 'site owners, “Don’t just recycle what others on the internet have already said.” Its model '
          + 'of a unique point of view is the first-hand review, based on personal experience, set '
          + 'against a summary that only restates what exists elsewhere.',
          'For an independent, that material is already on the lot. Here are pages worth writing for a '
          + 'hypothetical store in a mid-size town: why we pass on most auction trucks with frame rust; '
          + 'what our inspection covers and what it leaves out; which used SUVs our service manager sees '
          + 'come back for the same repair; and what winter on our county roads means for tire choice. '
          + 'Each page answers one real buyer question in its first sentence, using only the store’s own '
          + 'facts. That is the idea behind [the answer page format](@answer-pages-for-car-dealerships).',
          'AI search is one channel among several; the [car dealership marketing '
          + 'playbook](/guide/car-dealership-marketing/) covers the channels around it.',
        ],
      },
      {
        type: 'table',
        id: 'ai-search-by-dealership-type',
        h2: 'How does AI search differ by dealership type?',
        intro:
          'AI search differs by dealership type mostly in the questions buyers ask, and so in the facts '
          + 'each store has to publish as text. The basics hold for everyone: open crawler access, '
          + 'matching store facts and answered reviews. This table shows where each type of store '
          + 'should start once those basics are in place.',
        head: ['Dealership type', 'What buyers often ask AI', 'First fix after the basics'],
        rows: [
          ['Independent used-car lot', 'Which nearby lot is honest, which one has a reliable car in my budget', 'Price, mileage and VIN as text on every vehicle page'],
          ['Buy here pay here', 'Where can I get approved with bad credit, what do I need to bring', 'A plain in-house financing page that explains how payments work'],
          ['RV dealer', 'Which floor plan sleeps six, can my truck tow it, who services RVs near me', 'Weights, length and sleeping capacity as text, not only in brochure images'],
          ['Powersports dealer', 'Which side-by-side suits farm work, who services ATVs near me', 'Hours, stock and service facts updated when the season turns'],
          ['Dealer group', 'Which store near me carries this brand, which rooftop has the better service department', 'One Business Profile and one clear store page per rooftop'],
        ],
        note: 'Buyer questions are illustrative examples, not survey results. They vary by market and by buyer.',
      },
      {
        type: 'callout',
        title: 'Where the free scan fits',
        body:
          'The [free scan](/aeo-geo-for-car-dealers/#scan-form) asks ChatGPT and Claude, each with web '
          + 'search on, up to 20 questions a buyer in your town would ask, 3 times each. It shows whether '
          + 'your lot gets named, which sources get cited, whether AI crawlers can read your site and up '
          + 'to five vehicle pages, a score out of 100 with a margin, and the 3 fixes to make first. A '
          + 'person checks the report and walks you through it in 20 minutes. It does not measure '
          + 'Gemini, Perplexity or Google AI Overviews, and no one can promise what any assistant will '
          + 'say next month.',
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every source below was read on September 30, 2026.',
        items: [
          '[Aggarwal and others, “GEO: Generative Engine Optimization” (KDD 2024)](https://arxiv.org/html/2311.09735v3)',
          '[Cox Automotive, 2025 Car Buyer Journey Study press release, January 13, '
          + '2026](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf)',
          '[OpenAI: overview of its crawlers](https://developers.openai.com/api/docs/bots)',
          '[Anthropic: how its crawlers work and how site owners control '
          + 'them](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Google Business Profile Help: how local results are ranked](https://support.google.com/business/answer/7091)',
          '[Google Business Profile Help: reviews, tips and the incentive rule](https://support.google.com/business/answer/3474122)',
          '[Google Maps User Contributed Content Policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
        ],
      },
    ],
    faq: [
      ['Is AI search worth it for a 30-car lot?',
        'The free part is worth it for any lot, because the first fixes also help a buyer who finds you '
        + 'on Google: readable vehicle pages, a complete Business Profile, matching store facts and '
        + 'answered reviews. Whether paid monthly work is worth it depends on your market and volume. '
        + 'Start with the scan and the free fixes, then decide.'],
      ['Do I need a website to show up in AI answers?',
        'You need somewhere an assistant can read your facts, and your own website is the one source you '
        + 'fully control. A Business Profile and listing sites help an assistant place your store, but '
        + 'they cannot hold your answer pages or your full vehicle text. A simple, fast site with every '
        + 'vehicle as text serves you better than a fancy one that hides the price.'],
      ['Can an independent dealer beat a franchise store in ChatGPT?',
        'No one can promise that. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
        + 'ChatGPT ranks search results using several factors and that placement is not guaranteed, so '
        + 'no one outside OpenAI controls it. ChatGPT answers each question from the sources it finds, '
        + 'and the result changes with the question, the town and the day. What an independent can do is '
        + 'be readable, consistent and well reviewed for the questions where it has a real case, such as '
        + 'used trucks in a budget or a make it knows well.'],
      ['What does it cost an independent dealer to start?',
        'The first fixes cost time, and the free scan costs nothing. If you want the work done every '
        + 'month, AutoLander’s AI Foundation plan is $997 a month plus a $997 one-time setup, month to '
        + 'month, and it was built for independent and franchise stores. AutoLander customers pay no '
        + 'setup fee once their AutoLander subscription at that rooftop has been active and paid for the '
        + 'prior 60 days.'],
    ],
    cta: {
      heading: 'Find out if AI names your lot',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions buyers in your town '
        + 'ask, 3 times each, then shows who gets named, what gets cited and the 3 fixes to make first. '
        + 'A person walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #16  /aeo-geo/buy-here-pay-here-ai-answers/
  // ---------------------------------------------------------------------------
  {
    slug: 'buy-here-pay-here-ai-answers',
    silo: 'aeoGeo',
    cluster: 'dealer-types',
    publishOrder: 16,
    anchor: 'Buy here pay here dealers in AI answers: bad-credit questions and honest pages',
    crumb: 'BHPH in AI answers',
    primaryKeyword: 'buy here pay here ai search',
    secondaryKeywords: [
      'bad credit car shoppers and ai',
      'buy here pay here reputation online',
      'in-house financing page',
      'bhph reviews',
    ],
    alsoRelated: [
      'buy-here-pay-here-marketing',
      'financing-questions-in-ai-answers',
      'how-to-respond-to-car-dealership-reviews',
      'best-car-dealership-near-me-ai',
    ],
    augmentKeys: [],
    title: 'Buy Here Pay Here Dealers in AI Answers: Honest Pages',
    description:
      'How buy here pay here dealers show up when shoppers ask AI about bad-credit car loans, and how '
      + 'to write honest in-house financing pages and replies.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Buy here pay here dealers in AI answers: bad-credit questions and honest pages',
    tldr:
      'Buy here pay here AI search starts with the questions bad-credit shoppers type into ChatGPT, '
      + 'Claude and Google: where can I get approved, what do I bring, how do payments work. A BHPH '
      + 'store gives those answers something honest to use by stating its terms in plain words on its '
      + 'own pages, keeping its Business Profile exact and answering every review calmly. Never promise '
      + 'approval, never say “no credit check” unless it is literally true, and never put a customer’s '
      + 'account details in a public reply.',
    sections: [
      {
        type: 'qa',
        id: 'what-bad-credit-shoppers-ask-ai',
        q: 'What do bad-credit shoppers ask AI?',
        a: [
          'Bad-credit shoppers ask AI the questions they would rather not ask a salesperson first: which '
          + 'lots near me work with bad credit, what do I need to bring to get approved, how much do I '
          + 'need down, and how do the payments work. These examples are illustrative, since the exact '
          + 'wording changes with every buyer and every town.',
          'They ask in full sentences, and that matters. [Pew Research '
          + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'found that about 18% of Google searches in March 2025 produced an AI summary, rising to 60% '
          + 'for searches phrased as questions and 53% for searches of 10 or more words. Pew’s numbers '
          + 'come from the browsing data of 900 US adults. A shopper typing “where can I buy a car with '
          + 'bad credit and no cosigner near me” is running the long, question-shaped kind of search '
          + 'where Pew saw AI summaries most often.',
          'That puts a BHPH store’s own words in a new position. When an assistant builds its answer, '
          + 'your financing page, your Business Profile and your reviews are among the sources it can '
          + 'find. A free [AI visibility scan for car dealers](/aeo-geo-for-car-dealers/#scan-form) asks '
          + 'ChatGPT and Claude the questions buyers in your town ask, 3 times each, and shows whether '
          + 'your store gets named and which sources get cited. For how buyers phrase these questions in '
          + 'general, see [the questions car buyers ask AI](@questions-car-buyers-ask-ai).',
        ],
      },
      {
        type: 'qa',
        id: 'why-bhph-answers-read-cautiously',
        q: 'Why do AI answers about buy here pay here read cautiously?',
        a: [
          'AI answers about buy here pay here draw on the sources an assistant trusts, and [a 2025 '
          + 'study](https://arxiv.org/abs/2509.08919) found AI search services lean heavily toward '
          + 'third-party sources over a business’s own pages and social posts. On a topic about credit '
          + 'and money, your pages may be read next to outside consumer advice, so they need to be just '
          + 'as plain.',
          'The study, a preprint by Chen, Wang, Chen and Koudas, also found that AI services differ from '
          + 'each other in how many different sites they draw on, how fresh those sources are and how '
          + 'much an answer shifts when the question is phrased differently. So no single trick carries '
          + 'across assistants. What holds up across all of them is a store whose facts match everywhere '
          + 'and whose pages say exactly what happens when a customer signs.',
          'Think about what a cautious answer needs from you. Say a shopper asks which in-house '
          + 'financing lots near a mid-size city are worth a visit. An assistant that finds a clear page '
          + 'explaining how down payments are set, how often payments are due, where to pay and what '
          + 'happens after a late payment has something concrete and checkable to work with. A page that '
          + 'only says “Everyone drives! Bad credit OK!” gives it nothing to cite.',
        ],
      },
      {
        type: 'bullets',
        id: 'in-house-financing-page',
        h2: 'What should an in-house financing page say?',
        intro:
          'An in-house financing page should explain in plain words how buying and paying works at your '
          + 'store: what a customer brings, how the down payment is set, how often payments are due, '
          + 'where and how to pay, and what happens if a payment is late. Write it for a nervous '
          + 'first-time buyer who is reading on a phone.',
        items: [
          'How it works, in three or four sentences: the store is the lender, the customer pays the '
          + 'store, and here is the order of events from application to keys.',
          'What to bring, listed exactly as your store requires it, such as a driver’s license, proof of '
          + 'income and proof of residence. If requirements vary, say what they depend on.',
          'How the down payment is set. If it varies by vehicle or by application, say so and explain '
          + 'what it depends on. Publish a figure only if it is a real, current policy your staff will '
          + 'honor.',
          'The payment schedule and methods: weekly, every two weeks or monthly; in person, by phone or '
          + 'online; and any fee tied to a payment method. State only what is true today.',
          'Where to pay: the address, the hours of the payment window and whether you take payments at '
          + 'more than one location.',
          'What happens after a late or missed payment, described calmly and accurately, including who '
          + 'to call first. A clear answer reads as more trustworthy than silence.',
          'Credit reporting, stated plainly. If your store reports payments to the credit bureaus, say '
          + 'so; if it does not, never imply that it does.',
          'The same questions and answers on [a dealership FAQ page](@car-dealership-faq-page), one '
          + 'question per answer, so each answer can be quoted on its own.',
          'A review by your attorney before the page goes live. This article is general guidance, and '
          + 'nothing in it is legal advice.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-bhph-should-never-say',
        h2: 'What should a buy here pay here store never say?',
        intro:
          'A buy here pay here store should never publish a claim it cannot honor for every customer: '
          + 'guaranteed approval, “no credit check” when a check happens, or payment figures that no real '
          + 'deal matches. An assistant may repeat your words to a buyer, and a buyer who was misled '
          + 'will say so in a review that stays up for years.',
        items: [
          'Never write “guaranteed approval” or “everyone is approved” if a single application can be '
          + 'declined; no page should promise what the desk cannot deliver.',
          'Never write “no credit check” unless it is literally true for every applicant. If you check '
          + 'credit in any form, say what you look at instead, such as income and time on the job.',
          'No payment banners that no real deal matches. A weekly payment in a headline teaches buyers, '
          + 'and any assistant that reads the page, the wrong number.',
          'No vague fee language. If there are fees, name them. “Small fees may apply” invites exactly '
          + 'the question you did not answer.',
          'Nothing your attorney has not seen. Financing copy is advertising copy, so check it with '
          + 'counsel before it goes on the website, the Business Profile or a listing.',
        ],
      },
      {
        type: 'bullets',
        id: 'bhph-reviews',
        h2: 'How do reviews work for a buy here pay here store?',
        intro:
          'Reviews at a buy here pay here store work the same way as anywhere else, with higher stakes: '
          + 'buyers read them closely, and they expect the owner to answer. Ask every customer the same '
          + 'way, never pay for reviews or filter who gets asked, and answer the hard ones in public with '
          + 'short, calm replies.',
        items: [
          'Buyers read recent reviews and the replies. In [BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/), 97% of '
          + 'consumers read reviews for local businesses, 89% expect owners to respond to reviews, and '
          + '74% look for reviews from the last three months.',
          'No incentives. [Google strictly prohibits](https://support.google.com/business/answer/3474122) '
          + 'offering free or discounted goods or services in exchange for reviews, so no discount on a '
          + 'payment, no gift card and no waived fee for a review.',
          'No gating. The [Google Maps content policy](https://support.google.com/contributionpolicy/answer/7400114) '
          + 'bars discouraging negative reviews and selectively asking for positive ones. Every customer '
          + 'gets the same request, including the one who is two weeks behind.',
          'Nothing the FTC rule bans. The [FTC’s rule on consumer reviews and '
          + 'testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'finalized August 14, 2024, bans fake or false reviews, buying positive or negative reviews, '
          + 'undisclosed insider reviews, company-controlled “independent” review sites and suppressing '
          + 'reviews through threats or intimidation.',
          'For the full picture of how reviews feed AI answers, read [how reviews shape AI '
          + 'recommendations](@dealership-reviews-ai-recommendations).',
        ],
      },
      {
        type: 'qa',
        id: 'reply-to-payment-complaints',
        q: 'How should you reply to payment or repossession complaints?',
        a: [
          'Reply to a payment or repossession complaint calmly, briefly and without a single account '
          + 'detail. Acknowledge the frustration, state your general policy in one plain sentence, and '
          + 'invite the customer to call a named person. The reply is written for the next shopper who '
          + 'reads it, and it stays public long after the dispute ends.',
          'Keep private details private. Never confirm a balance, a payment date, a repossession date or '
          + 'anything else from the customer’s account in a public reply, even if the reviewer posted it '
          + 'first. Move the conversation to the phone or the office, where you can confirm who you are '
          + 'talking to.',
          'Here is an example for a hypothetical store: “We’re sorry this has been stressful. We never '
          + 'discuss anyone’s account in public, but we want to look at this with you. Please call Dana, '
          + 'our office manager, at the store and she will go over it with you directly.” It is short and '
          + 'human, and nothing in it reads as a threat or an argument.',
          '[Google’s review tips](https://support.google.com/business/answer/3474122) apply here too: '
          + 'address the reviewer by name, respond in a timely manner and keep the reply free of '
          + 'promotion. A defensive reply full of dates and dollar amounts reads worse than the complaint '
          + 'it answers.',
        ],
      },
      {
        type: 'bullets',
        id: 'bhph-local-facts',
        h2: 'Which local facts matter most in buy here pay here AI search?',
        intro:
          'In buy here pay here AI search, the local facts that matter most are the ones a customer uses '
          + 'every week: hours, where to pay, the phone number that reaches the office, and a complete '
          + 'Google Business Profile. A BHPH relationship runs for months or years, so customers keep '
          + 'checking these facts long after the sale.',
        items: [
          'Payment hours as well as sales hours. If the payment window keeps different hours, say so on '
          + 'the website and in the Business Profile, and keep the two identical.',
          'Every place a customer can pay: the store, a second office or an online portal, each with '
          + 'its address or link and its hours.',
          'One phone number for payments and account questions, published the same way everywhere.',
          'A complete Google Business Profile: accurate categories, hours, holiday hours, photos of the '
          + 'real lot and office, and a plain description. Keep phrases such as “bad credit” out of the '
          + 'business name; [Google says](https://support.google.com/business/answer/3038177) names should '
          + 'match the real-world name without added keywords.',
          'The same facts on your website, your profile and the listing sites. The basics every lot '
          + 'shares are in [AI search for independent used car dealers](@ai-search-for-independent-dealers).',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'No one can promise that ChatGPT, Claude or any other assistant will name a buy here pay here '
          + 'store, or describe it the way you would. What you control is whether your own pages are '
          + 'clear, whether your facts match everywhere and whether your replies hold up in public. The '
          + 'free scan measures ChatGPT and Claude only; it does not measure Gemini, Perplexity, Microsoft '
          + 'Copilot or Google AI Overviews.',
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every source below was read on September 30, 2026.',
        items: [
          '[Pew Research Center, “Google users are less likely to click on links when an AI summary '
          + 'appears in the results,” July 22, '
          + '2025](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)',
          '[Chen, Wang, Chen and Koudas, 2025 preprint on AI search sources](https://arxiv.org/abs/2509.08919)',
          '[BrightLocal, Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
          '[Google Business Profile Help: reviews, tips and the incentive rule](https://support.google.com/business/answer/3474122)',
          '[Google Maps User Contributed Content Policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[Federal Trade Commission, final rule banning fake reviews and testimonials, August 14, '
          + '2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)',
          '[Google Business Profile Help: guidelines for representing your business](https://support.google.com/business/answer/3038177)',
        ],
      },
    ],
    faq: [
      ['Can a buy here pay here dealer advertise no credit check?',
        'Only if it is literally true for every applicant, and even then have your attorney approve the '
        + 'wording. If your store checks credit in any form, say what you look at instead, such as income '
        + 'and residence, in plain words. This is general guidance and not legal advice; rules for credit '
        + 'advertising vary, so check your copy with counsel.'],
      ['Should we publish down payment amounts?',
        'Publish a figure only if it is a real, current policy your staff will honor for the buyers it '
        + 'describes. If down payments vary by vehicle or application, say that and explain what they '
        + 'depend on. A number no real deal matches misleads buyers, and it can keep circulating in AI '
        + 'answers long after you change the page.'],
      ['How often should the in-house financing page be updated?',
        'Whenever a term changes, and on a set review date otherwise, with that date shown on the '
        + 'page. A stale down payment or payment schedule is the kind of out-of-date fact that turns '
        + 'into a misleading answer; Microsoft researchers writing on the Bing search blog say '
        + 'freshness is critical for AI answers for exactly that reason.'],
      ['Do AI assistants recommend buy here pay here lots?',
        'Sometimes, depending on the question, the town and the day, and no one can promise that any '
        + 'assistant will name your store. When a shopper asks where to buy a car with bad credit, an '
        + 'assistant may name local lots, point to general advice, or both. The free scan shows what '
        + 'ChatGPT and Claude actually say for your market.'],
    ],
    cta: {
      heading: 'See what AI tells shoppers in your town',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, the questions local buyers ask, 3 times '
        + 'each, then shows who gets named, what gets cited and the 3 fixes to make first. A person walks '
        + 'you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #25  /aeo-geo/rv-dealer-ai-search/
  // ---------------------------------------------------------------------------
  {
    slug: 'rv-dealer-ai-search',
    silo: 'aeoGeo',
    cluster: 'dealer-types',
    publishOrder: 25,
    anchor: 'RV dealers and AI search: answering the questions RV buyers ask',
    crumb: 'RV dealers',
    primaryKeyword: 'rv dealer ai search',
    secondaryKeywords: [
      'rv dealer seo',
      'rv buyers using chatgpt',
      'rv dealer near me in ai answers',
      'rv floor plan comparison pages',
    ],
    alsoRelated: [
      'vehicle-detail-page-ai-readable',
      'model-comparison-pages-for-dealers',
      'powersports-dealer-ai-search',
      'inventory-feeds-ai-shopping',
    ],
    augmentKeys: [],
    title: 'RV Dealers and AI Search: Answering RV Buyers’ Questions',
    description:
      'How RV dealers show up when buyers ask ChatGPT and other AI tools about campers and motorhomes, '
      + 'and the specs, pages and profiles that matter.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'RV dealers and AI search: answering the questions RV buyers ask ChatGPT',
    tldr:
      'RV dealer AI search runs on specs. RV buyers ask ChatGPT, Claude and Google about towing, '
      + 'weights, sleeping capacity and floor plans, and an assistant can only quote the numbers it can '
      + 'read as text. Put those specs on every unit page in plain words, write comparison pages for the '
      + 'floor plans buyers weigh against each other, set up your Business Profile with specific '
      + 'categories and answer your reviews.',
    sections: [
      {
        type: 'qa',
        id: 'what-rv-buyers-ask-ai',
        q: 'What do RV buyers ask AI?',
        a: [
          'RV buyers ask AI spec-heavy questions: can my half-ton truck tow this travel trailer, which '
          + 'floor plans sleep six, what separates a Class A from a Class C, and which dealer near me '
          + 'services what it sells. These examples are illustrative; real questions vary by buyer, by '
          + 'season and by region.',
          'Cox Automotive has described the broader shift for vehicle shoppers. In an [August 2026 '
          + 'article on AI and vehicle '
          + 'discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'Cox said shoppers now often start with a question to an AI tool instead of a marketplace or '
          + 'a dealer site, and use AI to research, compare and prepare for the dealership conversation. '
          + 'Its first recommendation to dealers was to enrich inventory data beyond year, make and '
          + 'model, and its list included seating and towing.',
          'For an RV store, those two words cover much of the question. A family asks how many the unit '
          + 'sleeps and whether their truck can pull it, and on some RV sites those numbers sit in a '
          + 'brochure image or a manufacturer PDF. A free [AI visibility scan for car '
          + 'dealers](/aeo-geo-for-car-dealers/#scan-form) asks ChatGPT and Claude up to 20 questions '
          + 'local buyers ask, 3 times each, and shows which stores get named and which sources get cited.',
          'Two earlier guides cover the ground under this one: [AI search for independent used car '
          + 'dealers](@ai-search-for-independent-dealers) for the basics every lot shares, and [the '
          + 'questions car buyers ask AI](@questions-car-buyers-ask-ai) for how buyers phrase what they '
          + 'want to know.',
        ],
      },
      {
        type: 'qa',
        id: 'why-rv-listings-need-more-text',
        q: 'Why do RV listings need more text than car listings?',
        a: [
          'RV listings need more text because the facts RV buyers ask about, such as floor plan, weights, '
          + 'length and sleeping capacity, can end up in images, brochures or PDFs instead of on the page. '
          + '[Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) images '
          + 'should reinforce a page’s text rather than serve as the only source of key information.',
          'Bing’s webmaster guidelines say pages are more likely to be selected for grounding and '
          + 'citations, meaning the sources an AI answer is built on, when content stands on its own: '
          + 'facts and definitions stated explicitly and, in Bing’s words, “Important information is '
          + 'visible on the URL itself.” The same guidelines ask for descriptive file names, alt text, '
          + 'and captions, transcripts or structured data for images and video.',
          'A car’s vehicle detail page can get by with year, make, model, trim, mileage and price. An RV '
          + 'page needs those plus a long list of numbers a buyer compares across three or four units. '
          + 'Take a hypothetical listing for a 28-foot travel trailer that shows a floor plan image and a '
          + 'line reading “see brochure for specs.” The buyer can open the brochure. An assistant asked '
          + 'whether a half-ton truck can tow that trailer has to find the weights somewhere else, and it '
          + 'may build its answer from another store’s page.',
        ],
      },
      {
        type: 'bullets',
        id: 'rv-detail-page',
        h2: 'What should an RV detail page include?',
        intro:
          'An RV detail page should state, as plain text, every fact a buyer uses to rule a unit in or '
          + 'out: class, length, dry weight, GVWR, hitch weight for towables, sleeping capacity, '
          + 'slide-outs, tank sizes and what it takes to tow or drive it. Price, mileage and the VIN '
          + 'belong on the page too.',
        items: [
          'Class or type, in the words buyers use: Class A, Class B, Class C, travel trailer, fifth '
          + 'wheel, toy hauler or pop-up. Use the same term on the page, in the title and in any '
          + 'structured data.',
          'Length, dry weight and GVWR, with units. For towables add hitch or pin weight; for motorized '
          + 'units add the chassis and the engine.',
          'Sleeping capacity and how it adds up, such as “sleeps 6: queen bed, dinette and bunks.” A '
          + 'number without the layout invites a follow-up question.',
          'Slide-outs, with the count and the rooms they expand.',
          'Tank capacities for fresh, gray and black water, and propane.',
          'What it takes to tow it, stated carefully: the unit’s weights, plus a plain reminder to check '
          + 'the tow vehicle’s own rating in its owner’s manual. Never state that a specific truck can tow '
          + 'a unit unless you have the numbers for that exact truck.',
          'The floor plan as text as well as an image: a short room-by-room description under the '
          + 'drawing, and alt text on the image itself.',
          'Price, mileage for motorized units, the VIN and the stock number, all as text.',
          'Condition notes for used units in plain words: roof and seal inspection, appliances tested, '
          + 'what your shop replaced. First-hand notes like these are hard for a template site to copy.',
        ],
      },
      {
        type: 'bullets',
        id: 'rv-comparison-pages',
        h2: 'Which RV comparison pages should a dealer write?',
        intro:
          'An RV dealer should write the comparison pages its buyers already ask for at the lot: one '
          + 'floor plan against another, one class against another, and new against used of the same '
          + 'model. Each page should settle the comparison in its first two sentences, then back it up '
          + 'with the specs as text and links to the units in stock.',
        items: [
          'Floor plan against floor plan, for the two or three layouts at the same length that buyers '
          + 'keep weighing: rear bath or front bath, bunkhouse or rear living.',
          'Class against class: Class A against Class C, or travel trailer against fifth wheel, with who '
          + 'each one suits and what each takes to tow or drive.',
          'New against used of the same model: what changed between model years, what to inspect on a '
          + 'used unit and what your service department looks for.',
          'Your store’s own angle: which units your service team sees most for seal work, and what local '
          + 'campgrounds and roads mean for length and weight. That first-hand material is the part no '
          + 'other site has.',
          'Pages tied to your stock: link each comparison to the live units it describes, and update the '
          + 'page when the model year turns over.',
          'The format for every one of these is the answer page; see [our answer page guide](@answer-pages-for-car-dealerships) for how to write one.',
        ],
      },
      {
        type: 'qa',
        id: 'rv-business-profile',
        q: 'How should an RV dealer set up its Business Profile?',
        a: [
          'An RV dealer should set up its Google Business Profile with the most specific category that '
          + 'fits, the real-world name on its sign, and hours that match its website. [Google’s '
          + 'guidelines](https://support.google.com/business/answer/3038177) also let a department that '
          + 'operates as its own entity, such as a service shop with its own entrance, have a separate '
          + 'profile.',
          'The example Google gives is a car dealer: a Toyota store’s main profile in the Toyota Dealer '
          + 'category, beside a separate service and parts profile in the Auto Repair Shop category. '
          + 'Google’s guidance for car dealers also asks for categories as specific as possible and a '
          + 'business name that matches the '
          + 'real-world name, with no added service, product or location keywords.',
          'Those rules are written with car dealers in mind, so read them against your own setup. For an '
          + 'RV store, the same discipline means choosing the most specific category that truly describes '
          + 'the business rather than a generic one, using the name on the sign without a string of '
          + 'keywords after it, keeping hours identical to the website, and creating a separate service '
          + 'profile only when the service shop truly runs on its own. The fields that matter most are in '
          + '[the Business Profile fields AI answers use](@google-business-profile-ai-answers).',
        ],
      },
      {
        type: 'qa',
        id: 'schema-for-rvs',
        q: 'Does schema.org have an RV type?',
        a: [
          'No, schema.org has no RV type. [Its Vehicle type](https://schema.org/Vehicle) lists four '
          + 'subtypes, Car, Motorcycle, BusOrCoach and MotorizedBicycle, and none of them describes a '
          + 'travel trailer or a motorhome well. The honest choice is the general Vehicle type with '
          + 'accurate properties that match what the page already shows as text.',
          'Structured data labels the facts on a page for machines, and it is worth doing right. Keep '
          + 'two limits in mind. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'structured data is not required for its generative AI search and there is no special markup '
          + 'to add for it. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'structured data may support clearer grounding but does not guarantee visibility, and that '
          + 'markup must accurately reflect the visible content.',
          'So the order of work is simple. Put the specs on the page as text first, then mark up the same '
          + 'facts. Markup that claims a sleeping capacity or a weight the page never shows is the '
          + 'mismatch Bing warns against. For the store itself, schema.org’s AutomotiveBusiness family '
          + 'includes AutoDealer, and an RV dealership can describe itself with the most specific type '
          + 'that honestly fits.',
        ],
      },
      {
        type: 'qa',
        id: 'rv-reviews-and-service',
        q: 'How do reviews and service reputation matter in RV dealer AI search?',
        a: [
          'In RV dealer AI search, reviews and service reputation matter because an RV buyer is also '
          + 'choosing the shop that will fix the unit. Buyers read recent reviews and expect answers: in '
          + '[BrightLocal’s 2026 survey](https://www.brightlocal.com/research/local-consumer-review-survey/), '
          + '89% of consumers expect owners to respond to reviews.',
          'The same survey found 97% of consumers read reviews for local businesses and 74% look for '
          + 'reviews from the last three months. For an RV store, service reviews can carry much of the '
          + 'story: a warranty repair that took a week, a slide-out fixed before a holiday trip, a delivery '
          + 'walkthrough that covered every system. Reply to each one with specifics, by name, and keep the '
          + 'reply free of promotion, as [Google’s review tips](https://support.google.com/business/answer/3474122) '
          + 'advise.',
          'Ask every buyer and every service customer the same way, a few days after delivery or pickup, '
          + 'and never offer anything in return. Google strictly prohibits offering free or discounted '
          + 'goods or services for reviews, and one neutral request to everyone keeps reviews arriving '
          + 'through the slow season too.',
        ],
      },
      {
        type: 'callout',
        title: 'If you also list RVs on Facebook Marketplace',
        body:
          'AI answers are one place RV buyers look, and Facebook Marketplace is another. If you post RV '
          + 'inventory there, AutoLander’s [RV dealer software](/rv-dealer-software/) posts units from your '
          + 'inventory feed, and the [guide to selling RVs on Facebook '
          + 'Marketplace](/guide/how-to-sell-rvs-on-facebook-marketplace/) covers the listing side. The '
          + 'spec text you write for AI search is the same text a Marketplace buyer reads. No one can '
          + 'promise what any AI assistant will say about your store, and the free scan measures ChatGPT '
          + 'and Claude only; it does not measure Gemini, Perplexity or Google AI Overviews.',
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every source below was read on September 30, 2026.',
        items: [
          '[Cox Automotive, “How AI is influencing vehicle discovery and what dealers can do about it,” '
          + 'August 26, '
          + '2026](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/)',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[schema.org: Vehicle](https://schema.org/Vehicle)',
          '[Google Business Profile Help: guidelines for representing your business](https://support.google.com/business/answer/3038177)',
          '[Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[BrightLocal, Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
          '[Google Business Profile Help: reviews, tips and the incentive rule](https://support.google.com/business/answer/3474122)',
        ],
      },
    ],
    faq: [
      ['Should towable and motorized RVs have separate pages?',
        'Yes, in most cases. Towable buyers ask about tow vehicles, hitch weight and hookups; motorhome '
        + 'buyers ask about the chassis, the engine, mileage and driving. Separate category pages, each '
        + 'with its own short answer at the top and links to live units, make it easier to match a page '
        + 'to a question. Keep one unit page per VIN underneath them.'],
      ['Which RV specs should be text on every listing?',
        'Class or type, length, dry weight, GVWR, hitch or pin weight for towables, sleeping capacity '
        + 'with the layout, slide-outs, tank capacities, price, mileage for motorized units, VIN and stock '
        + 'number. Add a room-by-room description under the floor plan image so the layout is readable '
        + 'without the picture.'],
      ['Should an RV service department have its own Business Profile?',
        'Only if it operates as a distinct entity, with its own entrance and its own category. Google’s '
        + 'guidelines allow separate profiles for departments like that, and the example Google gives is '
        + 'a car dealer’s service and parts department. If your service bay shares the showroom door and '
        + 'phone, one profile with accurate service hours is the cleaner choice.'],
      ['Should an RV dealer say which trucks can tow a unit?',
        'Be careful. Publish each unit’s weights from the manufacturer, such as dry weight, GVWR and '
        + 'hitch weight, and tell buyers to check their own truck’s tow rating in its manual or with '
        + 'its maker. A page that says a given truck can tow a trailer takes on a claim the dealer '
        + 'cannot check for every configuration.'],
    ],
    cta: {
      heading: 'See if AI names your RV store',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions local buyers ask, 3 '
        + 'times each, and shows who gets named, what gets cited and the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // #34  /aeo-geo/powersports-dealer-ai-search/
  // ---------------------------------------------------------------------------
  {
    slug: 'powersports-dealer-ai-search',
    silo: 'aeoGeo',
    cluster: 'dealer-types',
    publishOrder: 34,
    anchor: 'Powersports dealers and AI search: ATVs, UTVs, motorcycles and boats',
    crumb: 'Powersports dealers',
    primaryKeyword: 'powersports dealer ai search',
    secondaryKeywords: [
      'powersports seo',
      'motorcycle dealer and chatgpt',
      'powersports dealer near me in ai answers',
      'boat dealer ai',
    ],
    alsoRelated: [
      'car-dealership-schema-markup',
      'service-department-ai-answers',
      'model-comparison-pages-for-dealers',
      'dealer-group-ai-visibility',
    ],
    augmentKeys: [],
    title: 'Powersports Dealers and AI Search: ATVs, UTVs and Bikes',
    description:
      'How powersports dealers selling ATVs, UTVs, motorcycles and boats can show up in AI answers, with '
      + 'the pages, specs and profiles that matter most.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Powersports dealers and AI search: ATVs, UTVs, motorcycles and boats',
    tldr:
      'Powersports dealer AI search comes down to plain, current, specific facts: which side-by-side '
      + 'fits farm work, how many seats it has, what it tows and who services ATVs nearby. Put those '
      + 'specs on every unit page as text, update hours and stock when the season turns, give each brand '
      + 'line a clear page and answer your reviews. For the store itself, schema.org even has a '
      + 'MotorcycleDealer type.',
    sections: [
      {
        type: 'qa',
        id: 'what-powersports-buyers-ask-ai',
        q: 'What do powersports buyers ask AI?',
        a: [
          'Powersports buyers ask AI which machine fits a job and who near them sells and services it: '
          + 'which side-by-side suits farm work, which ATV suits a teenager on trails, how many seats a UTV '
          + 'has, what it can tow, and which dealer has a good service department. These examples are '
          + 'illustrative, and real questions vary by buyer and region.',
          'Many of these questions start from the job rather than the brand. A buyer who hunts, farms or '
          + 'rides with family describes what they need and asks the assistant to narrow the field, then '
          + 'asks where to buy and where to get it serviced. The facts that answer those questions are '
          + 'specs and store details, and both have to be readable on your own site.',
          'A free [AI visibility scan for car dealers](/aeo-geo-for-car-dealers/#scan-form) asks ChatGPT '
          + 'and Claude up to 20 local buyer questions, 3 times each, and shows which dealers get named and '
          + 'which sources get cited. The groundwork is the same as for any lot, covered in [AI search for '
          + 'independent used car dealers](@ai-search-for-independent-dealers), and the spec-heavy side '
          + 'looks a lot like [AI search for RV dealers](@rv-dealer-ai-search).',
        ],
      },
      {
        type: 'qa',
        id: 'powersports-schema-types',
        q: 'Which schema types fit a powersports store?',
        a: [
          'A powersports store has a close fit in schema.org: MotorcycleDealer, [listed under '
          + 'AutomotiveBusiness](https://schema.org/AutomotiveBusiness) next to AutoDealer and '
          + 'MotorcycleRepair. For the units, '
          + 'schema.org’s Vehicle type has a Motorcycle subtype. ATVs, UTVs and boats have no dedicated '
          + 'subtype, so the general Vehicle type with accurate properties is the honest choice.',
          'schema.org describes AutomotiveBusiness as businesses in car repair, sales or parts, and its more '
          + 'specific types include AutoBodyShop, AutoDealer, AutoPartsStore, AutoRepair, MotorcycleDealer '
          + 'and MotorcycleRepair. [Its Vehicle type](https://schema.org/Vehicle) has four subtypes: Car, '
          + 'Motorcycle, BusOrCoach and MotorizedBicycle. A store that mainly sells motorcycles, ATVs and '
          + 'side-by-sides can describe itself as a MotorcycleDealer; a store whose main line is boats should '
          + 'pick the business type that honestly matches what it sells.',
          '[Google’s LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'says to use the most specific LocalBusiness subtype possible. Its required properties are name '
          + 'and address, and it recommends properties such as geo, opening hours, telephone, url, '
          + 'priceRange and department, the last one for businesses with distinct departments. [Google '
          + 'also says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'structured data is not required for its generative AI search, so treat markup as labeling for '
          + 'facts that are already on the page.',
        ],
      },
      {
        type: 'bullets',
        id: 'powersports-unit-page',
        h2: 'What should a powersports unit page include as text?',
        intro:
          'A powersports unit page should include, as plain text, every fact a buyer uses to match a '
          + 'machine to a job: engine size, seats, payload and towing, intended use, price and the VIN or '
          + 'hull number. If a spec appears only in a photo or a manufacturer brochure, an assistant '
          + 'reading the page may never see it.',
        items: [
          'Engine size and type, drive type such as 2WD, 4WD or AWD, and the transmission.',
          'Seats, stated as a number. A two-seat and a four-seat side-by-side answer different questions.',
          'Payload, cargo bed capacity and towing capacity, with units, taken from the manufacturer’s '
          + 'spec sheet for that exact model year and trim.',
          'Intended use, in the buyer’s words: trail, farm and ranch, hunting, sport, youth, touring or '
          + 'fishing.',
          'Price as text, including what freight and setup add, if anything.',
          'Hours or miles for used units, the VIN, and the hull identification number for boats.',
          'Condition notes for used units in plain words: what your shop checked and what it replaced.',
          '[Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) pages are more '
          + 'likely to be selected for grounding and citations when important information is visible on '
          + 'the page itself. The rules for [vehicle detail pages AI can '
          + 'read](@vehicle-detail-page-ai-readable) apply to a UTV just as they do to a car.',
        ],
      },
      {
        type: 'qa',
        id: 'seasons-and-powersports-ai-search',
        q: 'How do seasons affect powersports dealer AI search?',
        a: [
          'Seasons affect powersports dealer AI search because the facts buyers ask about change with the '
          + 'calendar: hours, stock, service lead times and promotions. [Microsoft AI '
          + 'researchers](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'have written that freshness is critical for AI answers, because an out-of-date fact leads to a '
          + 'misleading answer.',
          'Picture a hypothetical dealer in a northern state. In October it shortens showroom hours, opens '
          + 'winterization and storage bookings and marks down leftover side-by-sides. If the website still '
          + 'shows summer hours and a spring promotion in December, a buyer who asks an assistant whether '
          + 'the store is open on Saturday can get the old answer, and the store loses the visit.',
          'Build the season change into a routine. Update hours on the website, the Business Profile and '
          + 'every listing site on the same day. Remove expired promotions. Add seasonal services such as '
          + 'winterization, storage and spring tune-ups as text. Refresh the in-stock pages so sold units '
          + 'do not linger. The same Microsoft researchers stressed that evidence used in answers needs '
          + 'clear provenance; for a dealer, one practical version is a dated page with the store’s name '
          + 'on it.',
        ],
      },
      {
        type: 'qa',
        id: 'multi-line-powersports-store',
        q: 'How should a multi-line store present its brands?',
        a: [
          'A multi-line powersports store should give each brand line its own clear page, with the same '
          + 'store name, address, phone and hours on every one. A buyer asking who sells a particular brand '
          + 'nearby needs a page that says so plainly, and an assistant needs store facts that never '
          + 'contradict each other from page to page.',
          'Each brand page should say which model families you carry, whether you sell and service that '
          + 'brand, what is usually in stock and which service work your techs handle for it. Link each '
          + 'page to live inventory for that brand. Keep every claim exact: if you sell a brand’s ATVs but '
          + 'not its motorcycles, say so.',
          'The Business Profile is where store facts get checked. Keep its name, categories and hours '
          + 'matched to the website. [Google publishes Business Profile '
          + 'guidelines](https://support.google.com/business/answer/3038177) with specific rules for auto '
          + 'dealers; those rules are written for car dealers, so read the general guidelines for how they '
          + 'apply to a powersports store rather than assuming the car-dealer rules carry over. The fields '
          + 'worth getting right are covered in [which Business Profile facts AI answers draw on](@google-business-profile-ai-answers).',
        ],
      },
      {
        type: 'bullets',
        id: 'powersports-service-and-parts',
        h2: 'Which service and parts facts matter?',
        intro:
          'The service and parts facts that matter are the ones a buyer checks before trusting a store '
          + 'with a machine: which brands your shop services, service hours, parts counter hours, seasonal '
          + 'services such as winterization and storage, and how to book. State them as text on a service '
          + 'page and keep them current through the year.',
        items: [
          'The brands and machine types your shop services, including whether you work on units bought '
          + 'elsewhere.',
          'Service department hours and parts counter hours, if they differ from sales hours.',
          'Seasonal services such as winterization, storage, spring tune-ups and battery care, with the '
          + 'dates you take bookings.',
          'How to book: phone, online form or walk-in, and an honest note about lead times in the busy '
          + 'season.',
          'Departments marked up as departments. [Google’s LocalBusiness '
          + 'documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'recommends a department property for businesses with distinct departments, so sales, service '
          + 'and parts can each carry their own hours and phone.',
          'The same facts everywhere: the website, the Business Profile and every listing site.',
        ],
      },
      {
        type: 'qa',
        id: 'powersports-reviews',
        q: 'How do reviews work for powersports stores?',
        a: [
          'Reviews work for powersports stores the way they work for any local business: buyers read recent '
          + 'reviews and expect answers. In [BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/), 74% of consumers '
          + 'look for reviews from the last three months and 89% expect owners to respond. For a seasonal '
          + 'store, that means keeping reviews coming in the off-season.',
          'Ask every buyer and every service customer the same way, a few days after delivery or pickup, '
          + 'with a direct link. Never offer anything for a review: [Google strictly '
          + 'prohibits](https://support.google.com/business/answer/3474122) offering free or discounted goods '
          + 'or services in exchange for reviews. Reply to each review by name, promptly and without '
          + 'promotion.',
          'Service reviews can name the tech and the machine, which gives your reply something specific to '
          + 'answer: thank the customer for the winterization booking, acknowledge a slow turnaround in May '
          + 'and say what you changed. Those replies are public text that any later reader can check.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'No one can promise that ChatGPT, Claude or any other assistant will name a powersports store, '
          + 'for any question or in any season. What you control is whether your specs are readable, your '
          + 'store facts are current and your reviews are answered. The free scan measures ChatGPT and '
          + 'Claude only; it does not measure Gemini, Perplexity, Microsoft Copilot or Google AI Overviews.',
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every source below was read on September 30, 2026.',
        items: [
          '[schema.org: AutomotiveBusiness](https://schema.org/AutomotiveBusiness)',
          '[schema.org: Vehicle](https://schema.org/Vehicle)',
          '[Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)',
          '[Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Microsoft Bing Search Blog, “Evolving role of the index: from ranking pages to supporting '
          + 'answers,” May 6, '
          + '2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)',
          '[Google Business Profile Help: guidelines for representing your business](https://support.google.com/business/answer/3038177)',
          '[Google Business Profile Help: reviews, tips and the incentive rule](https://support.google.com/business/answer/3474122)',
          '[BrightLocal, Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
        ],
      },
    ],
    faq: [
      ['Should we publish demo ride or rental details?',
        'If you offer demo rides or rentals, say so on a page with the rules: age and license '
        + 'requirements, gear, booking and cost. Buyers ask assistants who offers them nearby, and a '
        + 'plain page gives the answer a fact to repeat. If you do not offer them, one line saying so '
        + 'stops the guesswork.'],
      ['Should boats and ATVs have separate pages?',
        'Yes. A boat buyer and an ATV buyer ask different questions: hull, engine and trailer on one side, '
        + 'seats, payload and trail use on the other. Give each line its own category page with a short '
        + 'answer at the top and links to live units, and keep the store facts identical across them.'],
      ['Should we answer questions about models we don’t stock?',
        'Yes, when you can answer honestly and point to what you do carry or can order. A page comparing a '
        + 'model you sell with one you don’t can help a buyer if it sticks to published specs and says '
        + 'plainly what is in stock. Never imply that you sell or service a brand you don’t.'],
      ['How often should a powersports store update its hours online?',
        'Every time they change, on the same day, everywhere: the website, the Business Profile and every '
        + 'listing site. For a seasonal store that usually means at each season change and before '
        + 'holidays. Put a reminder on the calendar for the week the season turns.'],
    ],
    cta: {
      heading: 'See who AI names for powersports near you',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions local buyers ask, 3 '
        + 'times each, and shows who gets named, which sources get cited and the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // #41  /aeo-geo/dealer-group-ai-visibility/
  // ---------------------------------------------------------------------------
  {
    slug: 'dealer-group-ai-visibility',
    silo: 'aeoGeo',
    cluster: 'dealer-types',
    publishOrder: 41,
    anchor: 'Dealer groups and AI visibility: one clear entity per rooftop',
    crumb: 'Dealer groups',
    primaryKeyword: 'dealer group ai visibility',
    secondaryKeywords: [
      'multi-location seo for dealerships',
      'multiple google business profiles',
      'group site vs store site schema',
      'dealer group reputation management',
    ],
    alsoRelated: [
      'measure-dealership-ai-visibility',
      'when-ai-gets-your-dealership-wrong',
      'car-dealer-review-sites-ai-answers',
      'aeo-cost-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'Dealer Groups and AI Visibility: One Clear Store per Rooftop',
    description:
      'How dealer groups keep each rooftop clear to AI tools: separate Business Profiles, consistent '
      + 'names, group and store sites, schema and reviews.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Dealer groups and AI visibility: one clear entity per rooftop',
    tldr:
      'Dealer group AI visibility depends on each rooftop reading as one clear, separate store to an AI '
      + 'assistant: its own Business Profile, its own page on the group site with its own markup, a '
      + 'real-world name used the same way everywhere, and its own reviews and replies. Standardize the '
      + 'templates and rules at the group level, keep store facts and stories local, and measure each '
      + 'rooftop on its own market’s questions.',
    sections: [
      {
        type: 'qa',
        id: 'why-groups-get-confused',
        q: 'Why do dealer groups get confused in AI answers?',
        a: [
          'Dealer groups get confused in AI answers when rooftops blur together: similar names, a shared '
          + 'call-center number, one group page standing in for several stores, or brand names combined in '
          + 'one listing. An assistant that cannot tell which store is which may name the wrong rooftop, '
          + 'merge two stores into one, or leave both out.',
          '[Bing’s webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'ask for clear, consistent naming of people, organizations, products and locations, and give '
          + 'the reason plainly: “Clear entity definition improves grounding visibility and citation '
          + 'accuracy.” For a group, each rooftop is an entity. It needs one name, one address, one main '
          + 'phone and one main page, used the same way on the group site, the store site, the Business '
          + 'Profile and every listing.',
          'Take a hypothetical group with a Ford store and a used-car outlet on the same road, both known '
          + 'by the family name and sharing one BDC number. A buyer asks which store nearby has used trucks. '
          + 'The assistant finds a group page listing both addresses, a Business Profile with the shared '
          + 'number and reviews that mention “the dealership” without saying which one. It can easily mix '
          + 'the two up. The fix starts with the basics every store needs, the same ones in [AI search for '
          + 'independent used car dealers](@ai-search-for-independent-dealers), applied rooftop by rooftop.',
          '[AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/) works the same way for groups: '
          + 'one rooftop at a time, each with its own free scan and its own plan.',
        ],
      },
      {
        type: 'qa',
        id: 'business-profile-per-rooftop',
        q: 'Should each rooftop have its own Business Profile?',
        a: [
          'Yes, each rooftop should have its own Google Business Profile, and brands should never be '
          + 'combined in one. [Google’s guidelines](https://support.google.com/business/answer/3038177) say '
          + 'not to combine brand names into a single Business Profile, and they let departments that '
          + 'operate as distinct entities, such as a service and parts department with its own entrance, '
          + 'have their own profiles.',
          'Google’s example is a Toyota dealer whose main profile uses the Toyota Dealer category, with a '
          + 'separate profile for its service and parts department in the Auto Repair Shop category. The '
          + 'same guidelines ask for a business name that matches the real-world name, with no added '
          + 'service, product or location keywords, and categories as specific as possible. For hours, '
          + 'Google tells dealers to list car sales hours, and where new and pre-owned sales hours differ, '
          + 'to use the new sales hours.',
          'For a group, that turns into a rooftop inventory: every store, every brand it sells, every '
          + 'department that runs on its own, each with a verified profile, the right owner and manager '
          + 'access, and no duplicates left over from an acquisition or a rebrand. The fields worth getting '
          + 'right on each one are in [the Business Profile fields AI answers '
          + 'use](@google-business-profile-ai-answers).',
        ],
      },
      {
        type: 'bullets',
        id: 'group-website-store-pages',
        h2: 'How should a group website describe each store?',
        intro:
          'A group website should give each rooftop its own page that reads like that store’s front door: '
          + 'its real name, address, phone, hours, brands, departments and staff, with its own LocalBusiness '
          + 'or AutoDealer markup. Every fact on that page should match the rooftop’s Business Profile word '
          + 'for word, and the group page should link to each store page.',
        items: [
          'One page per rooftop, at a stable URL, with the store’s name as the page heading and its address '
          + 'and main phone as text.',
          'Markup that names the store as its own business. schema.org places '
          + '[AutoDealer](https://schema.org/AutoDealer) under LocalBusiness and AutomotiveBusiness, and '
          + '[Google’s LocalBusiness '
          + 'documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'says to use the most specific subtype possible, with name and address required.',
          'Departments marked up as departments. Google recommends a department property for businesses '
          + 'with distinct departments, so a rooftop’s sales, service and parts can each carry their own '
          + 'hours and phone.',
          'The group itself described once, as the parent organization, on the group’s about page, with '
          + 'each rooftop listed and linked.',
          'No shared markup across stores. Copying one rooftop’s markup onto another page, or stacking '
          + 'several stores’ addresses in one block, recreates the blur the page exists to fix.',
          'One main source per rooftop. If each store also runs its own website, decide which page is the '
          + 'main source, link the two both ways and keep the facts identical. The details are in [schema '
          + 'markup for car dealerships](@car-dealership-schema-markup).',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you keep names, addresses and phones consistent across rooftops?',
        intro:
          'Keep names, addresses and phones consistent with one master record per rooftop that every '
          + 'website, profile and listing copies from, a naming rule based on each store’s real-world name, '
          + 'and a quarterly audit that compares every public listing against the master. Changes go through '
          + 'the master first, never straight to a single listing.',
        steps: [
          {
            title: 'Build a master record per rooftop',
            body:
              'One sheet, one row per rooftop: the legal name, the name on the sign, the address, the main '
              + 'phone, sales and service phones, hours by department, brands, the website URL, the Business '
              + 'Profile link and who owns each account.',
          },
          {
            title: 'Name each store the way the sign reads',
            body:
              '[Google says](https://support.google.com/business/answer/3038177) business names should match '
              + 'the real-world name with no added service, product or location keywords. That rules out the '
              + 'store name plus “Best Truck Deals” and a city in a profile, and it keeps the name consistent '
              + 'with the markup and the website.',
          },
          {
            title: 'Give each rooftop its own main phone',
            body:
              'A shared BDC or call-center number across stores can blur them. Give each rooftop a distinct '
              + 'main number on its profile and store page, and route calls however you like behind the '
              + 'scenes.',
          },
          {
            title: 'Push changes from the master',
            body:
              'When hours, a phone number or a name change, update the master record first, then the '
              + 'website, the Business Profile and every listing on the same day.',
          },
          {
            title: 'Audit every quarter',
            body:
              'Check each rooftop’s profile, store page and main listings against the master record, fix '
              + 'mismatches, and look for duplicate or leftover profiles after moves, rebrands and '
              + 'acquisitions.',
          },
          {
            title: 'Ask the assistants what they know',
            body:
              'Ask ChatGPT and Claude, with web search on, where each rooftop is and what it sells. A wrong '
              + 'answer can point you to the source that still carries an old fact.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'group-reviews-and-replies',
        q: 'Who owns reviews and replies at a group?',
        a: [
          'Each rooftop should own its reviews and replies, answered in its own voice by people who know '
          + 'that store, under one group standard for tone, speed and escalation. [Google’s review '
          + 'tips](https://support.google.com/business/answer/3474122) ask businesses to reply, address '
          + 'reviewers by name, respond in a timely manner and keep replies free of promotion.',
          'The group standard can be short: who replies at each store, how fast, which reviews escalate to '
          + 'the group and which words never appear in a reply. The rooftop fills in the specifics: the '
          + 'salesperson’s name, the service advisor who fixed the problem, the fact that the store changed '
          + 'its delivery checklist after a complaint. A reply that any store in the group could have posted '
          + 'reads like a template, and buyers can tell.',
          'Keep the request process identical across rooftops: every sold customer gets the same neutral '
          + 'request, with no incentives and no filtering. [Google Maps’ content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114) bars selectively asking '
          + 'for positive reviews and asking staff to collect a set number of them, so leave review quotas '
          + 'out of pay plans. The mechanics of a good reply are in [how to respond to dealership '
          + 'reviews](@how-to-respond-to-car-dealership-reviews).',
        ],
      },
      {
        type: 'qa',
        id: 'measure-dealer-group-ai-visibility',
        q: 'How should you measure dealer group AI visibility by rooftop?',
        a: [
          'Measure dealer group AI visibility one rooftop at a time, on each market’s own questions. A '
          + 'group-level average hides the store that never gets named, and the questions that matter in one '
          + 'town differ from those in the next. Ask the same questions every month, several times each, and '
          + 'compare each rooftop with its own local competitors.',
          'Answers change from run to run, so a single check can mislead. That is why AutoLander’s free scan '
          + 'asks every question 3 times of ChatGPT and of Claude, each with web search on, and reports a '
          + 'score out of 100 with a margin for one dealership. For a group, run it per rooftop. The scan '
          + 'does not measure Gemini, Perplexity, Microsoft Copilot or Google AI Overviews, so check those '
          + 'surfaces by hand or with your own tools.',
          'When a group moves from measuring to monthly work, [AutoLander prices groups per '
          + 'rooftop](/aeo-geo-for-car-dealers/#plans) from the same plan table, and each rooftop can be on a '
          + 'different plan. A busy franchise rooftop might run AI Authority while a smaller used-car outlet '
          + 'runs AI Foundation. On Market Leader, a group’s same-brand rooftops count as one dealer for brand '
          + 'exclusivity, and that exclusivity covers only whom AutoLander sells its plans to; AI assistants '
          + 'may still name other dealers.',
        ],
      },
      {
        type: 'qa',
        id: 'standardize-or-keep-local',
        q: 'What should a group standardize and what should stay local?',
        a: [
          'A group should standardize the parts that have to be right everywhere, such as page templates, '
          + 'markup, crawler access, review rules and the master record, and leave local the parts only a '
          + 'store can supply: photos, staff, community news and answers about that store’s cars, service '
          + 'and neighborhood. Standards keep rooftops consistent, and local detail keeps them distinct.',
          'The split also settles who does what. The group’s digital team owns the templates, the robots.txt '
          + 'and security settings that decide whether AI crawlers can read every store site, the review '
          + 'policy and the quarterly audit. Each rooftop’s GM owns the store’s facts and stories and signs '
          + 'off on its own pages.',
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Standardize at the group',
          items: [
            'Store page and answer page templates',
            'AutoDealer and LocalBusiness markup patterns, with departments',
            'Crawler access settings, so AI search crawlers can read every store site',
            'Review request rules and the reply standard',
            'The master record and the quarterly audit',
            'One measurement method and question format for every rooftop',
          ],
        },
        right: {
          h2: 'Keep local at each rooftop',
          items: [
            'Photos of the real store, lot and people',
            'Staff names and roles on the store page',
            'Community news and local events',
            'Answers about that store’s inventory, service department and neighborhood',
            'Replies to that store’s reviews, in its own voice',
            'Hours, holiday hours and department phones, kept current in the master record',
          ],
        },
      },
      {
        type: 'callout',
        title: 'The honest part',
        body:
          'No one can promise what ChatGPT, Claude or any other assistant will say about a group or any of '
          + 'its rooftops, and no plan can keep competitors out of an AI answer. What a group controls is '
          + 'whether each rooftop is one clear, consistent store everywhere it appears, and whether each '
          + 'store keeps its facts current and its reviews answered.',
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every source below was read on September 30, 2026.',
        items: [
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Google Business Profile Help: guidelines for representing your business](https://support.google.com/business/answer/3038177)',
          '[Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)',
          '[schema.org: AutoDealer](https://schema.org/AutoDealer)',
          '[Google Business Profile Help: reviews, tips and the incentive rule](https://support.google.com/business/answer/3474122)',
          '[Google Maps User Contributed Content Policy](https://support.google.com/contributionpolicy/answer/7400114)',
        ],
      },
    ],
    faq: [
      ['Can one Business Profile cover two brands at the same address?',
        'Not as one combined listing: Google’s guidelines say not to combine brand names into a single '
        + 'Business Profile. Read '
        + '[Google’s guidelines](https://support.google.com/business/answer/3038177) before you set up a '
        + 'multi-brand rooftop, since they spell out how dealers represent brands and departments, and keep '
        + 'each profile’s name to the real-world name on the sign.'],
      ['Should the group site or the store site be the main source?',
        'Pick one main page per rooftop and make every other page agree with it. Some groups make each '
        + 'store’s own site the main source and give the group site a short page per store that links to '
        + 'it; others run everything from the group site. Either works when each rooftop has one clear main '
        + 'page, one set of facts and markup that matches what the page shows.'],
      ['How is AEO priced for a dealer group?',
        'AutoLander prices groups per rooftop from the same plan table: AI Foundation at $997 a month plus '
        + '$997 setup, AI Authority at $2,497 a month plus $997 setup, and Market Leader at $5,997 a month '
        + 'plus $2,997 setup, all month to month. AI Authority and Market Leader are by application. '
        + 'AutoLander customers pay no setup fee once their AutoLander subscription at that rooftop has been '
        + 'active and paid for the prior 60 days.'],
      ['Can each rooftop in a group be on a different plan?',
        'Yes. Each rooftop can be on a different plan, and each starts with its own free scan and '
        + 'walkthrough. For Market Leader’s brand exclusivity, a group’s same-brand rooftops count as one '
        + 'dealer, and exclusivity covers only whom AutoLander sells its plans to; AI assistants may still '
        + 'name other dealers.'],
    ],
    cta: {
      heading: 'Start with one rooftop',
      sub:
        'The free scan shows who ChatGPT and Claude name in that store’s market, which sources they cite '
        + 'and the 3 fixes to make first. A person walks you through it in 20 minutes.',
    },
  },
];
