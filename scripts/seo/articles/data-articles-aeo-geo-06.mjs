// AEO and GEO silo, batch 06 (2026-09-30): five articles for the /aeo-geo/ drip library.
//   #3  how-car-buyers-use-chatgpt        (buyers pillar)
//   #13 questions-car-buyers-ask-ai       (buyers)
//   #22 best-car-dealership-near-me-ai    (buyers)
//   #43 perplexity-for-car-dealerships    (engines)
//   #47 bing-places-for-car-dealers       (engines)
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Links: every in-body sibling link is a publish-aware token [anchor](@slug) that points only to
// a LOWER publish number, so publishing in order never creates a dead link; later siblings come
// in through alsoRelated. Every article links the live money page /aeo-geo-for-car-dealers/.
// Facts: every number and third-party claim comes from the silo fact bank (researched
// 2026-09-30) and is linked to its source in the sentence and in each Sources list.
// House style: no em-dashes or en-dashes, no negation-then-reveal cadence, nothing promised
// about rankings, mentions or citations. The free scan measures ChatGPT and Claude only.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // 1. #3 /aeo-geo/how-car-buyers-use-chatgpt/
  // ---------------------------------------------------------------------------
  {
    slug: 'how-car-buyers-use-chatgpt',
    silo: 'aeoGeo',
    cluster: 'buyers',
    publishOrder: 3,
    anchor: 'How car buyers use ChatGPT and other AI tools to shop, and what it means for dealers',
    crumb: 'How buyers use AI',
    primaryKeyword: 'how car buyers use chatgpt',
    secondaryKeywords: [
      'chatgpt car buying',
      'ai car buying',
      'car buyers using ai statistics',
      'which ai do car shoppers use',
    ],
    alsoRelated: [
      'dealership-reviews-ai-recommendations',
      'questions-car-buyers-ask-ai',
      'ai-search-for-independent-dealers',
      'measure-dealership-ai-visibility',
      'do-car-buyers-trust-ai-recommendations',
      'trade-in-questions-in-ai-answers',
    ],
    augmentKeys: [
      'aiDealers',
    ],
    title: 'How Car Buyers Use ChatGPT and AI to Shop (2026 Data)',
    description:
      'How car buyers use ChatGPT and other AI tools to shop, per Cox Automotive, Cars.com, '
      + 'CarGurus and Pew research, and what it means for your store.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How car buyers use ChatGPT and other AI tools to shop, and what it means for your store',
    tldr:
      'How car buyers use ChatGPT and other AI tools depends on the study you read, but each '
      + 'major survey finds a real share of shoppers already doing it: Cox Automotive found 19% '
      + 'of recent buyers used AI sites or AI overviews, Cars.com found 44% of its respondents '
      + 'had used AI car search tools, and CarGurus found 26% of recent buyers and sellers '
      + 'already use AI. Shoppers use it to compare models, estimate prices and check '
      + 'reliability, many want it to summarize dealership reviews, and Cox found a majority '
      + 'still completed every step at the dealership. For a store, what AI can read about you '
      + 'on your website, your Business Profile and the review sites can shape who makes the '
      + 'shortlist.',
    sections: [
      {
        type: 'qa',
        id: 'how-many-car-buyers-use-ai',
        q: 'How many car buyers use AI to shop?',
        a: [
          'It depends on the study and on how each one defines AI use. [Cox '
          + 'Automotive](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
          + 'found 19% of all recent vehicle buyers and 25% of new-vehicle buyers used AI '
          + 'websites or AI-generated overviews while shopping. '
          + '[Cars.com](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'found 44% of its survey respondents had used AI car search tools, and '
          + '[CarGurus](https://www.cargurus.com/press/2025_consumer_insights.html) found 26% '
          + 'already use AI.',
          'The three numbers measure different things, so read them one at a time and never '
          + 'add them together. [Cox Automotive’s 2025 Car Buyer Journey '
          + 'Study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
          + 'covered people who bought a vehicle in the previous 12 months, surveyed in fall '
          + '2025, and counted anyone who used an AI website such as ChatGPT or Microsoft '
          + 'Copilot, or an AI-generated overview such as Google’s. Among used-vehicle buyers '
          + 'the share was 17%. It was the first year Cox tracked AI at all, and its [study '
          + 'summary](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Study-Summary.pdf) '
          + 'puts the sample at 2,344 buyers (1,574 new and 770 used), surveyed online from '
          + 'August 6 to September 5, 2025.',
          'The [Cars.com '
          + 'survey](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'asked 936 people between November 4 and 10, 2025, and 44% had used AI-powered car '
          + 'search tools. Among those AI users, 97% said AI will affect their purchase '
          + 'decisions, a figure that describes AI users only and never all shoppers. [CarGurus’ '
          + '2025 consumer study](https://www.cargurus.com/press/2025_consumer_insights.html) of '
          + '3,030 people who bought or sold a vehicle in the previous four months found 26% '
          + 'already use AI and 80% are open to it.',
          'Every one of these studies finds a real share of buyers asking an AI tool something '
          + 'before they buy. Helping AI tools find, trust and name your store is the job of '
          + '[AEO and GEO for car dealers](/aeo-geo-for-car-dealers/): answer engine '
          + 'optimization shapes your pages so an assistant can lift a direct answer, and '
          + 'generative engine optimization builds the consistent facts and reputation that help '
          + 'it decide to name you.',
        ],
      },
      {
        type: 'qa',
        id: 'which-ai-tools-do-shoppers-use',
        q: 'Which AI tools do shoppers use?',
        a: [
          'ChatGPT leads by a wide margin. In [Pew Research '
          + 'Center’s](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/) '
          + 'February 2026 survey of US adults, 44% said they use ChatGPT, 24% Gemini, 17% '
          + 'Microsoft Copilot and 6% Claude. For local business recommendations specifically, '
          + '[BrightLocal](https://www.brightlocal.com/research/lcrs-ai-trust/) found 31% of '
          + 'consumers used ChatGPT and 23% used Google AI Mode.',
          'None of these surveys splits out car shoppers, so treat them as a guide to which '
          + 'assistants matter most, not as a car-market share. [Pew’s '
          + 'survey](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/) '
          + 'of 5,119 US adults, taken February 17 to 23, 2026, also found about half of adults '
          + '(49%) use AI chatbots, and the most common use was searching for information. '
          + '[BrightLocal’s follow-up '
          + 'analysis](https://www.brightlocal.com/research/lcrs-ai-trust/) adds the local '
          + 'angle: among AI users, 63% trust AI recommendations, yet 97% sometimes double-check '
          + 'them against real reviews. For a dealer, the AI answer and the review profile work '
          + 'as one first impression.',
          'Google’s AI features count too. Cox included AI-generated overviews like Google’s '
          + 'in its 19%, so watch Google AI Overviews and Google AI Mode alongside ChatGPT, '
          + 'Gemini, Claude, Perplexity and Microsoft Copilot.',
        ],
      },
      {
        type: 'bullets',
        id: 'how-car-buyers-use-chatgpt-while-shopping',
        h2: 'How do car buyers use ChatGPT and other AI tools while they shop?',
        intro:
          'Mostly for research and comparison. Cars.com found shoppers most often used AI to '
          + 'identify and compare models, find price estimates and answer reliability questions. '
          + 'CarGurus found the uses people most wanted were comparing vehicles, finding '
          + 'listings and summarizing reviews of cars and of dealerships. Each use points at a '
          + 'page or profile your store controls.',
        items: [
          'Comparing models. '
          + '[Cars.com](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'lists identifying and comparing models among the most common uses, and 44% of '
          + 'respondents in [CarGurus’ '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html) wanted AI to '
          + 'compare vehicles. Your answer lives in model comparison content and in vehicle '
          + 'pages that list trims, packages and features as text.',
          'Estimating a fair price. Price estimates were another top use in the Cars.com '
          + 'survey. Your answer lives on the vehicle detail page (VDP): the price, the mileage '
          + 'and the VIN written as plain text an assistant can read.',
          'Answering reliability questions. A service department that publishes plain answers '
          + 'about the maintenance it sees on the brands it sells gives an assistant local '
          + 'material to work with.',
          'Finding listings. In the CarGurus study, 40% wanted AI to find listings for them. '
          + 'That only works for your store if your inventory is readable on your own site and '
          + 'in the feeds you send to marketplaces.',
          'Summarizing dealership reviews. CarGurus found 36% wanted AI to summarize reviews '
          + 'of dealerships, and 39% reviews of cars. Your answer lives in your Google Business '
          + 'Profile, DealerRater and the other review sites, and in how you reply.',
          'Turning a question into a search. In the Cars.com survey, 73% of AI users said it '
          + 'saves time to have AI turn a conversational question into targeted search results.',
        ],
      },
      {
        type: 'qa',
        id: 'where-ai-fits-in-the-buying-journey',
        q: 'Where does AI fit in the buying journey?',
        a: [
          'Near the start, and as preparation for the store visit. [Cox '
          + 'Automotive](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'says shoppers now often begin with a question to an AI tool instead of a '
          + 'marketplace or dealer site, and use AI to research, compare and prepare for '
          + 'dealership conversations rather than to avoid the dealership. Only a small share '
          + 'buy entirely online.',
          'The wider journey explains why. In [Cox’s Car Buyer Journey '
          + 'release](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf), '
          + '71% of buyers started with an open mind, unsure which vehicle they would buy, and '
          + 'just 29% were certain at the start, down from 37% in 2020. An open-minded shopper '
          + 'asks open questions, such as which midsize SUV fits three car seats or which store '
          + 'nearby treats people well, and an AI tool answers those with a short list.',
          'The same release found 53% of buyers completed all steps at the dealership and only '
          + '7% bought entirely online, while 63% said the ideal experience mixes online and '
          + 'in-person steps. Cox’s [article on AI and vehicle '
          + 'discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'draws the dealer conclusion: shoppers use AI to arrive prepared, not to avoid the '
          + 'store. If your store is missing from the AI shortlist, your sales process may never '
          + 'get its turn with that buyer.',
        ],
      },
      {
        type: 'qa',
        id: 'will-more-buyers-use-ai-next-time',
        q: 'Will more buyers use AI next time?',
        a: [
          'Most shoppers say they will. [Cox Automotive’s AI in Auto Retail '
          + 'Tracker](https://www.coxautoinc.com/press-releases/new-cox-automotive-ai-in-auto-retail-tracker/) '
          + 'found 63% of shoppers say they will definitely or probably use AI on their next '
          + 'vehicle purchase, while only 29% of dealers have started adjusting to AI-powered '
          + 'search. That gap between shopper intent and dealer readiness is the opening.',
          'The '
          + '[tracker](https://www.coxautoinc.com/press-releases/new-cox-automotive-ai-in-auto-retail-tracker/) '
          + 'surveyed franchise and independent dealers and consumers planning to buy within 12 '
          + 'months: 504 dealers and 1,505 consumers in the first quarter of 2026, and 483 '
          + 'dealers and 1,502 consumers in the second. A separate [Cox '
          + 'article](https://www.coxautoinc.com/insights/what-new-research-reveals-about-ais-growing-role-in-auto-retail/) '
          + 'citing the same tracker put the share of shoppers planning to use AI at 61%, likely '
          + 'from a different survey wave, so read either figure with its source.',
          'Looking further out, [Cox’s Car Buyer Journey '
          + 'release](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
          + 'reports 83% of consumers say AI will affect how they buy vehicles within 10 years. '
          + 'No one can say how fast that happens in your market, and no one can promise you a '
          + 'share of it.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-this-means-for-a-dealership',
        h2: 'What does this mean for a dealership?',
        intro:
          'Cox Automotive’s own advice to dealers comes down to three jobs: give AI richer '
          + 'inventory data than year, make and model, keep your business facts the same '
          + 'everywhere, and publish content that answers the questions shoppers ask. None of '
          + 'the three needs a new tool. All three need someone to own them every month.',
        items: [
          'Richer inventory data. [Cox '
          + 'recommends](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'going past year, make and model to features, packages, fuel economy, safety tech, '
          + 'seating and towing. On your VDPs that means the equipment list, the price, the '
          + 'mileage and the full VIN as text on the page, never only inside a photo or a script '
          + 'that loads later.',
          'The same facts everywhere. Cox also tells dealers to keep business information, '
          + 'hours, locations and services consistent across the web. An assistant that finds '
          + 'two phone numbers and three sets of hours has less reason to be sure it is looking '
          + 'at one store.',
          'Content that answers real questions. Cox lists comparisons, trade-in guidance, '
          + 'financing FAQs, family vehicle picks and EV ownership as topics worth publishing. '
          + 'Short, direct answer pages on your own site give an assistant something specific to '
          + 'quote.',
          'Know how the assistants choose. Each one finds and weighs sources its own way. '
          + 'Start with [how ChatGPT recommends '
          + 'dealerships](@how-chatgpt-recommends-car-dealerships), since ChatGPT is the '
          + 'most-used assistant in Pew’s survey.',
        ],
      },
      {
        type: 'steps',
        h2: 'What should a dealer do first?',
        intro:
          'Start by looking, then fix what blocks AI from reading your store, then fix the '
          + 'facts it reads. Much of this is ordinary housekeeping seen from an assistant’s '
          + 'point of view, and the order below shows you where the real gaps are before you '
          + 'spend anything on outside help.',
        steps: [
          {
            title: 'Ask the questions your buyers ask',
            body:
              'Open ChatGPT and Claude with web search on and ask three or four questions a '
              + 'local buyer would ask, each naming your city. Note who gets named and which '
              + 'sources get cited, and ask each one more than once, because answers change from '
              + 'run to run.',
          },
          {
            title: 'Make sure AI crawlers can get in',
            body:
              'Your robots.txt file and the security service in front of your website decide '
              + 'whether AI search crawlers can read your pages at all. [Check whether ChatGPT '
              + 'and Claude can read your website](@can-chatgpt-see-my-dealer-website) before '
              + 'you change anything else, because nothing downstream matters if the door is '
              + 'locked.',
          },
          {
            title: 'Put the car facts in text',
            body:
              'Open five of your vehicle detail pages. If the price, mileage and VIN appear '
              + 'only inside images, or load after the page does, an assistant may never see '
              + 'them. Ask your website vendor to show them as plain text on every VDP.',
          },
          {
            title: 'Line up your business facts',
            body:
              'Compare your name, address, phone number and hours on your website, Google '
              + 'Business Profile, Bing Places, Apple Business Connect, Yelp, DealerRater and '
              + 'the listing sites. Fix every mismatch at the source.',
          },
          {
            title: 'Answer every review',
            body:
              'Reviews and the way a store replies are part of what an assistant sees about '
              + 'it. Reply to every Google review with something specific to that customer, and '
              + 'keep the replies free of sales pitches.',
          },
          {
            title: 'Get an outside read',
            body:
              'The free scan does step one at scale: up to 20 local buyer questions asked of '
              + 'ChatGPT and Claude, 3 times each, plus your AI crawler access, up to five '
              + 'vehicle pages, a score out of 100 with a margin and the 3 fixes to make first. '
              + 'A person walks you through it in 20 minutes. [Request the free '
              + 'scan](/aeo-geo-for-car-dealers/#scan-form).',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          'Cox Automotive, [2025 Car Buyer Journey Study press '
          + 'release](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf), '
          + 'January 13, 2026, and [study '
          + 'summary](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Study-Summary.pdf), '
          + 'January 2026',
          'Cox Automotive, [AI in Auto Retail Tracker '
          + 'release](https://www.coxautoinc.com/press-releases/new-cox-automotive-ai-in-auto-retail-tracker/), '
          + 'August 11, 2026',
          'Cox Automotive, [How AI is influencing vehicle discovery and what dealers can do '
          + 'about '
          + 'it](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'August 26, 2026',
          'Cox Automotive, [What new research reveals about AI’s growing role in auto '
          + 'retail](https://www.coxautoinc.com/insights/what-new-research-reveals-about-ais-growing-role-in-auto-retail/), '
          + 'August 21, 2026',
          'Cars.com, [survey release on AI in car '
          + 'shopping](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping), '
          + 'November 20, 2025',
          'CarGurus, [2025 consumer '
          + 'insights](https://www.cargurus.com/press/2025_consumer_insights.html), December 3, '
          + '2025',
          'Pew Research Center, [Americans and AI '
          + '2026](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/), '
          + 'June 17, 2026',
          'BrightLocal, [AI trust '
          + 'analysis](https://www.brightlocal.com/research/lcrs-ai-trust/), March 10, 2026',
        ],
      },
    ],
    faq: [
      ['How many websites does a car buyer visit before buying?',
        'In [Cox Automotive’s 2025 Car Buyer Journey '
        + 'Study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf), '
        + 'buyers visited 4.6 websites on average. Third-party sites were used by 75%, dealership sites '
        + 'by 59% and AI sites by 12%, a category Cox tracked for the first time that year. AI is one '
        + 'stop among several, so your store needs to look the same at each one.'],
      ['Do car buyers use ChatGPT more than Google’s AI?',
          'None of the studies here splits that out for car buyers. Among all US adults, Pew '
          + 'found 44% use ChatGPT and 24% use Gemini. For local business recommendations, '
          + 'BrightLocal found 31% of consumers used ChatGPT and 23% used Google AI Mode. Google '
          + 'AI Overviews also appear inside ordinary Google searches, so many buyers see '
          + 'Google’s AI without choosing it. Watch both.'],
      ['Do used car buyers use AI as much as new car buyers?',
          'Somewhat less, in Cox Automotive’s data. Its 2025 Car Buyer Journey Study found 25% '
          + 'of new-vehicle buyers and 17% of used-vehicle buyers used AI websites or '
          + 'AI-generated overviews while shopping. That is still a real share of used buyers.'],
      ['Will AI replace dealership websites for car shoppers?',
          'Nothing in the research says so. Cox found shoppers use AI to research and prepare '
          + 'for the dealership, and the assistants that search the web read dealer websites to '
          + 'build their answers. Your website becomes one of the sources an assistant reads, so '
          + 'it has to be readable: AI crawlers allowed in, and price, mileage and VIN on each '
          + 'vehicle page as text.'],
    ],
    cta: {
      heading: 'See what AI tells buyers in your town',
      sub:
        'Find out what ChatGPT and Claude tell local buyers about your store. The free scan '
        + 'asks up to 20 local buyer questions, 3 times each, and shows who gets named, which '
        + 'sources get cited and the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // 2. #13 /aeo-geo/questions-car-buyers-ask-ai/
  // ---------------------------------------------------------------------------
  {
    slug: 'questions-car-buyers-ask-ai',
    silo: 'aeoGeo',
    cluster: 'buyers',
    publishOrder: 13,
    anchor: 'The questions car shoppers ask AI before they choose a dealer',
    crumb: 'Questions buyers ask AI',
    primaryKeyword: 'questions car buyers ask ai',
    secondaryKeywords: [
      'chatgpt car buying prompt',
      'what to ask chatgpt when buying a car',
      'ai car shopping questions',
      'local buyer questions for dealerships',
    ],
    alsoRelated: [
      'car-dealership-faq-page',
      'best-car-dealership-near-me-ai',
      'trade-in-questions-in-ai-answers',
      'financing-questions-in-ai-answers',
      'service-department-ai-answers',
    ],
    augmentKeys: [],
    title: 'The Questions Car Buyers Ask AI Before Picking a Dealer',
    description:
      'The questions car buyers ask ChatGPT and other AI tools before choosing a dealer, '
      + 'grouped by stage, and how your pages and profiles should answer.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'The questions car shoppers ask AI before they choose a dealer',
    tldr:
      'The questions car buyers ask AI before choosing a dealer sort into five groups: which '
      + 'car, which dealer, price and trade-in, trust and reviews, and service and ownership. '
      + 'Survey data from Cars.com and CarGurus puts comparing models, estimating prices and '
      + 'summarizing reviews near the top of the list. Each group has a home where your store '
      + 'should answer it: your Business Profile, the vehicle page, an answer page, an FAQ or '
      + 'your review replies.',
    sections: [
      {
        type: 'qa',
        id: 'what-questions-do-car-buyers-ask-ai',
        q: 'What questions do car buyers ask AI before choosing a dealer?',
        a: [
          'They sort into five groups: which car, which dealer, price and trade-in, trust and '
          + 'reviews, and service and ownership. '
          + '[Cars.com](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'found shoppers most often used AI to compare models, estimate prices and check '
          + 'reliability, and '
          + '[CarGurus](https://www.cargurus.com/press/2025_consumer_insights.html) found '
          + 'summarizing dealership reviews among the uses buyers most want. The “which dealer” '
          + 'questions decide whether your store gets named.',
          'The five groups follow the buying journey. A shopper who starts with an open mind '
          + 'asks which car first, then where to buy it, then what it should cost and what the '
          + 'trade is worth, then whether the store can be trusted, and later where to get it '
          + 'serviced. The numbers behind that journey, including which assistants buyers use, '
          + 'are in [how car buyers use ChatGPT](@how-car-buyers-use-chatgpt).',
          'You can see which of these questions name your store with an [AI visibility scan '
          + 'for car dealers](/aeo-geo-for-car-dealers/#scan-form), which asks ChatGPT and '
          + 'Claude up to 20 local buyer questions, 3 times each, with web search on.',
          'One caution before the lists: every example question on this page is illustrative, '
          + 'written by us to show the pattern the surveys describe. None of them is a measured '
          + '“most asked” query.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-questions-vs-search-keywords',
        q: 'How are AI questions different from search keywords?',
        a: [
          'They are longer, phrased as full questions, and can be localized behind the scenes. '
          + '[Google '
          + 'says](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/) '
          + 'the average AI Mode search is about three times the length of a traditional search, '
          + 'and [OpenAI '
          + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'ChatGPT can use a user’s general location to localize a “near me” question, adding '
          + 'the city the buyer never typed.',
          'The same [Google post on AI '
          + 'Mode](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/), '
          + 'from May 2026, says more than one in six US searches now use voice or images. '
          + '[OpenAI’s help page on ChatGPT '
          + 'search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'gives its own example of a “near me” question about restaurants rewritten as “top '
          + 'restaurants San Francisco.” A buyer who types “honest used car dealer near me” may '
          + 'be searched as the same question with the buyer’s city in it.',
          'Question phrasing also changes what Google shows. In [Pew Research Center’s '
          + 'analysis](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'of browsing data from 900 US adults in March 2025, about 18% of Google searches '
          + 'produced an AI summary, rising to 60% for searches phrased as questions and 53% for '
          + 'searches of 10 or more words. The longer and more question-like the search, the '
          + 'more often an AI summary appeared.',
          'For a dealer, that means writing for the whole question. A page titled “Used '
          + 'trucks” answers a keyword. A page that says which used trucks you have under a '
          + 'given price, with the mileage and the price on the page as text, answers the '
          + 'question a buyer actually asks.',
        ],
      },
      {
        type: 'bullets',
        id: 'which-dealer-questions',
        h2: 'Which “which dealer” questions come up?',
        intro:
          'These are the questions that decide whether your store gets named at all. The '
          + 'examples below are illustrative, written to show the pattern rather than measured '
          + 'from any query log. Each one names a place, and each one asks the assistant to '
          + 'choose a few stores and explain why it picked them.',
        items: [
          '“Who is the best place to buy a used truck in [city]?” An assistant answering this '
          + 'has to find stores in that city and decide which ones look trustworthy, so your '
          + 'Business Profile, your reviews and your listing-site profiles all feed it.',
          '“Which dealers near [ZIP] are honest?” Honesty questions lean on reviews and '
          + 'complaints. What buyers say about you, and how you reply, is the raw material.',
          '“Who has the best service department in [city]?” A service question can name a '
          + 'store that never comes up for sales questions, and the reverse. Service reviews and '
          + 'a clear service page both count.',
          '“Which dealer near me has the most [model] in stock?” The answer depends on your '
          + 'inventory being readable, on your own site and on the listing sites, with each '
          + 'vehicle’s details on its own page as text.',
          '“Which dealership near [city] has Spanish-speaking salespeople?” Attribute '
          + 'questions reward stores that state what they offer plainly, on the website and in '
          + 'the Business Profile.',
        ],
      },
      {
        type: 'bullets',
        id: 'car-and-price-questions',
        h2: 'Which car and price questions come up?',
        intro:
          'Cars.com found that comparing models, estimating prices and checking reliability '
          + 'were the most common ways shoppers used AI for car shopping. The illustrative '
          + 'examples below show each type next to the place your store’s answer should live, so '
          + 'an assistant has a local page to read.',
        items: [
          'Compare models: “Is the RAV4 or the CR-V better for a family of four?” The answer '
          + 'lives in a model comparison page on your site that states the differences plainly, '
          + 'with the trims you actually stock. Comparing models is among the most common uses '
          + 'in the [Cars.com '
          + 'survey](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping).',
          'Fair price: “What should I pay for a 2022 F-150 XLT with 40,000 miles?” The answer '
          + 'lives on the vehicle detail page: price, mileage, trim and VIN in text, so an '
          + 'assistant can read your number next to the car it belongs to.',
          'Reliability: “Which used midsize SUVs hold up past 100,000 miles?” The answer lives '
          + 'in service-department content: the maintenance items your technicians see and what '
          + 'they check on every used unit.',
          'Which trim: “What is the difference between the SE and the SEL?” The answer lives '
          + 'in the equipment list on each VDP, written as text, and in short trim pages for the '
          + 'models you sell most.',
          'Availability: “Who has a hybrid minivan in stock near [city]?” The answer depends '
          + 'on your inventory being readable on your own site and in the feeds you send out.',
        ],
      },
      {
        type: 'bullets',
        id: 'trust-and-reputation-questions',
        h2: 'Which trust and reputation questions come up?',
        intro:
          'Before a buyer drives over, they want to know whether the store is worth the trip. '
          + 'CarGurus found 36% of people in its 2025 study wanted AI to summarize reviews of '
          + 'dealerships. The illustrative questions below all lean on reviews, complaints and '
          + 'how a store answers them, which puts your review replies inside what an assistant '
          + 'sees.',
        items: [
          '“Summarize the reviews for [dealership].” An assistant can only summarize the '
          + 'review pages its search finds, such as your Google reviews, DealerRater or Yelp. '
          + 'The [CarGurus '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html) found it is one '
          + 'of the uses buyers most want.',
          '“Does [dealership] have complaints?” Old complaints with no reply read as '
          + 'unresolved. A calm, specific reply shows the store dealt with it.',
          '“Which dealers near [city] don’t add hidden fees?” An assistant can only repeat a '
          + 'clear policy if one exists in writing, so publish your documentation fee and add-on '
          + 'policy in plain words on your own site.',
          '“Is [dealership] legit?” The same name, address and phone number across the web, '
          + 'plus a steady review history, give an assistant a consistent picture to describe.',
          'Reviews carry a lot of this weight. The details, including what the platforms '
          + 'allow, are in [how dealership reviews affect AI answers](@dealership-reviews-ai-recommendations).',
        ],
      },
      {
        type: 'bullets',
        id: 'trade-in-financing-service-questions',
        h2: 'Which trade-in, financing and service questions come up?',
        intro:
          'These questions come later in the journey, and they ask about how your store works. '
          + 'Cox Automotive lists trade-in guidance and financing FAQs among the content it '
          + 'recommends dealers publish. The illustrative examples below cover all three groups, '
          + 'and each is best answered on your own pages in plain words.',
        items: [
          'Trade-in: “How do dealers in [city] value a trade-in that still has a loan on it?” '
          + 'Explain your appraisal steps and what paperwork to bring. [Cox’s article on AI and '
          + 'vehicle '
          + 'discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'names trade-in guidance as content worth publishing.',
          'Financing: “Can I get approved at a dealership with a new job?” Keep the answer '
          + 'general and accurate, explain what your F&I office needs to see, and never promise '
          + 'approval.',
          'Financing terms: “Do dealers near [city] accept outside financing?” A plain yes or '
          + 'no, stated on your site, gives an assistant an answer where silence gives it '
          + 'nothing.',
          'Service: “Where can I get a [brand] recall done near [ZIP] on a Saturday?” Hours, '
          + 'services and brands serviced belong on your Business Profile and your service page, '
          + 'and the two have to match.',
          'Ownership: “How often does a [model] need an oil change?” Fixed ops content that '
          + 'answers maintenance questions gives an assistant a local page to cite long after '
          + 'the sale.',
          'Answering these well is the job of [answer pages for car '
          + 'dealerships](@answer-pages-for-car-dealerships): short pages on your own site, each '
          + 'built around one question.',
        ],
      },
      {
        type: 'table',
        id: 'where-to-answer-each-question',
        h2: 'Where should your store answer each type of question?',
        intro:
          'Every question type has a home. When the answer lives in the right place and '
          + 'matches everywhere else, an assistant has a clear source to read. The table maps '
          + 'each group to where the answer should live and who at a typical store owns it. '
          + 'Adjust the owners to fit how your store is staffed.',
        head: [
          'Question type',
          'Illustrative example',
          'Where the answer should live',
          'Who usually owns it',
        ],
        rows: [
          [
            'Which dealer',
            'Best used truck dealer in [city]',
            'Google Business Profile, Bing Places, Apple Business Connect and listing-site '
            + 'profiles',
            'GM or marketing manager',
          ],
          [
            'Which car',
            'RAV4 or CR-V for a family of four',
            'Model comparison pages on your site',
            'Internet or marketing manager',
          ],
          [
            'Fair price',
            'What to pay for a 2022 F-150 XLT',
            'Vehicle detail page with price, mileage and VIN in text',
            'Used-car manager and website vendor',
          ],
          [
            'Trust and reviews',
            'Is [dealership] honest?',
            'Google reviews, DealerRater, Yelp and your replies',
            'GM, with a named reply owner',
          ],
          [
            'Fees and policies',
            'Does [dealership] add hidden fees?',
            'A plain policy or FAQ page on your site',
            'GM and F&I manager',
          ],
          [
            'Trade-in',
            'How is a trade with a loan valued?',
            'A trade-in answer page',
            'Used-car manager',
          ],
          [
            'Financing',
            'Do dealers take outside financing?',
            'A financing FAQ page',
            'F&I manager',
          ],
          [
            'Service',
            'Saturday recall appointment near [ZIP]',
            'Business Profile hours and services, plus the service page',
            'Service manager (fixed ops)',
          ],
        ],
        note:
          'Examples are illustrative. Owners vary by store; what matters is that each answer '
          + 'has one.',
      },
      {
        type: 'qa',
        id: 'find-questions-that-name-competitors',
        q: 'How do you find which questions name your competitors?',
        a: [
          'Ask them the way a buyer would, more than once. Answers change from run to run, so '
          + 'a single check can mislead. AutoLander’s free scan asks ChatGPT and Claude, with '
          + 'web search on, up to 20 local buyer questions, 3 times each, and lists which '
          + 'dealers each answer names and which sources it cites.',
          'You can start by hand. Pick ten questions from the lists above, put your city or '
          + 'ZIP in each, and ask them in ChatGPT and Claude with web search on. Write down '
          + 'every store named and every source cited. The pattern that matters is repetition: '
          + 'when a competitor is named in most runs, the sources cited next to its name show '
          + 'you where your own work starts. For a repeatable method, see [how to '
          + 'measure AI visibility](@measure-dealership-ai-visibility).',
          'The scan does the same thing at scale and adds the technical checks: whether your '
          + 'robots.txt and the security service in front of your site let AI crawlers in, '
          + 'whether up to five of your vehicle pages show price, mileage and VIN as text, a '
          + 'score out of 100 with a margin, and the 3 fixes to make first. A person on our team '
          + 'checks every match and walks you through the report in 20 minutes. [Request the '
          + 'free scan](/aeo-geo-for-car-dealers/#scan-form); no logins needed.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          'Cars.com, [survey release on AI in car '
          + 'shopping](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping), '
          + 'November 20, 2025',
          'CarGurus, [2025 consumer '
          + 'insights](https://www.cargurus.com/press/2025_consumer_insights.html), December 3, '
          + '2025',
          'Google, [AI Mode insights from the '
          + 'US](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/), '
          + 'May 19, 2026',
          'OpenAI Help Center, [Searching the web with '
          + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), '
          + 'read September 30, 2026',
          'Pew Research Center, [Google users are less likely to click on links when an AI '
          + 'summary '
          + 'appears](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/), '
          + 'July 22, 2025',
          'Cox Automotive, [How AI is influencing vehicle discovery and what dealers can do '
          + 'about '
          + 'it](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'August 26, 2026',
        ],
      },
    ],
    faq: [
      ['Are these real questions buyers typed into ChatGPT?',
          'They are illustrative. We wrote them to show the patterns the surveys describe: '
          + 'comparing models, checking prices, finding listings and summarizing dealership '
          + 'reviews. None comes from an assistant’s query data, so treat any list sold as “the '
          + 'most asked questions” with care.'],
      ['How long are the questions car buyers type into AI?',
          'Longer than search keywords. Google says the average AI Mode search is about three '
          + 'times the length of a traditional Search query. That figure covers all AI Mode '
          + 'searches, so read it as a direction for car questions rather than a measurement of '
          + 'them.'],
      ['Do buyers include their city in AI questions?',
          'Often they do not need to. OpenAI says ChatGPT can estimate a user’s general '
          + 'location from their IP address and use it to localize results, turning a “near me” '
          + 'question into a search with the city in it. Sharing a device’s precise location is '
          + 'optional and off by default.'],
      ['How many questions does the free scan ask?',
          'Up to 20 local buyer questions, each asked 3 times of ChatGPT and 3 times of Claude '
          + 'with web search on, so up to 120 answers. If we cannot find cars on your site, we '
          + 'skip the car questions and say so in your report. The scan measures ChatGPT and '
          + 'Claude only.'],
    ],
    cta: {
      heading: 'Find out which questions name your store',
      sub:
        'See which of these questions name your store in ChatGPT and Claude, and which name '
        + 'the dealer down the road. Free, with a 20-minute walkthrough.',
    },
  },

  // ---------------------------------------------------------------------------
  // 3. #22 /aeo-geo/best-car-dealership-near-me-ai/
  // ---------------------------------------------------------------------------
  {
    slug: 'best-car-dealership-near-me-ai',
    silo: 'aeoGeo',
    cluster: 'buyers',
    publishOrder: 22,
    anchor: 'Best car dealership near me: how AI assistants decide who gets named',
    crumb: 'Best dealer near me in AI',
    primaryKeyword: 'best car dealership near me ai',
    secondaryKeywords: [
      'who does chatgpt recommend for car dealers',
      'best used car dealerships near me',
      'honest car dealerships near me',
      'ai local recommendations',
    ],
    alsoRelated: [
      'aeo-agency-red-flags',
      'do-car-buyers-trust-ai-recommendations',
      'ask-maps-for-car-dealers',
      'car-dealer-review-sites-ai-answers',
      'measure-dealership-ai-visibility',
    ],
    augmentKeys: [],
    title: 'Best Car Dealership Near Me: How AI Picks Who Gets Named',
    description:
      'When a buyer asks AI for the best car dealership near me, how ChatGPT, Google and '
      + 'others build the answer, and what decides which stores get named.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: '“Best car dealership near me”: how AI assistants answer it and who gets named',
    tldr:
      'When a buyer asks an AI assistant for the best car dealership near me, the assistant '
      + 'turns “near me” into a place, searches, and names a few stores with reasons and cited '
      + 'sources. What it can find shapes who gets named: Business Profiles, reviews and '
      + 'replies, third-party sites and the dealer’s own pages. No dealership can pay to be '
      + 'named, and the answer changes between assistants and between runs, so one screenshot '
      + 'proves very little.',
    sections: [
      {
        type: 'qa',
        id: 'how-ai-answers-best-dealer-near-me',
        q: 'How do AI assistants answer “best car dealership near me”?',
        a: [
          'They turn “near me” into a place, search the web for stores there, and name a few '
          + 'with reasons and links. [OpenAI '
          + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'ChatGPT can use location information to find local results and may cite its '
          + 'sources, and [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'its AI answers are grounded in pages retrieved from its Search index.',
          '[OpenAI’s help page on ChatGPT '
          + 'search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'explains the first step: ChatGPT may estimate a user’s general location from their '
          + 'IP address and share it with search providers to localize results, the way its own '
          + 'example turns a restaurant question into “top restaurants San Francisco.” Responses '
          + 'that use web search may include citations, with a Sources view that lists them. '
          + '[Google '
          + 'describes](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'its AI answers as retrieval: its ranking systems pull relevant, current pages from '
          + 'the index, the model reviews them, and the answer shows links to supporting pages.',
          'So the answer can only be as good as what the assistant finds about the stores in '
          + 'that place. “Best dealer near me” is also one of many questions buyers put to AI; '
          + '[the questions car buyers ask AI](@questions-car-buyers-ask-ai) covers the rest, '
          + 'and [how car buyers use ChatGPT](@how-car-buyers-use-chatgpt) covers how many '
          + 'shoppers ask at all.',
          'Making your store easy to find, check and name in answers like this is what [AEO '
          + 'and GEO for car dealers](/aeo-geo-for-car-dealers/) covers: the profiles, reviews, '
          + 'listings and website fixes an assistant reads before it writes a short list.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-answer-vs-map-pack',
        q: 'How is an AI answer different from the Google map pack?',
        a: [
          'The map pack ranks nearby businesses; an AI answer picks a few and explains why. '
          + '[Google says](https://support.google.com/business/answer/7091) local results weigh '
          + 'relevance, distance and prominence. An assistant reads profiles, reviews and web '
          + 'pages, then writes a short list with reasons, and Google’s Ask Maps now answers '
          + 'place questions conversationally from profiles and reviews.',
          'Prominence, [Google '
          + 'adds](https://support.google.com/business/answer/7091), draws on things like how '
          + 'many websites link to the business and how many reviews it has. The map pack is a '
          + 'ranked list: the buyer sees several stores with stars and hours, and does the '
          + 'choosing.',
          'An AI answer does the choosing for the buyer. It names a handful of stores and '
          + 'gives reasons drawn from what it read. [Ask '
          + 'Maps](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/), '
          + 'which Google announced in March 2026 and began rolling out in the US and India, '
          + 'answers complex place questions using over 300 million places and reviews from more '
          + 'than 500 million contributors. And [Google’s change to Business Profile '
          + 'Q&A](https://support.google.com/business/thread/392024106) means a customer who '
          + 'asks a question in Maps gets an instant answer built from the business’s own '
          + 'answers and relevant reviews.',
          'Here is the practical difference. In the map pack, a store listed further down with '
          + 'good stars still gets seen. In an AI answer, a store that goes unnamed simply '
          + 'misses that buyer’s question.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources-behind-a-best-dealer-answer',
        h2: 'Which sources feed a “best dealer” answer?',
        intro:
          'Several kinds of sources feed the answer, and a store that looks the same in all of '
          + 'them is easier to name. Google points to Business Profiles, reviews feed the local '
          + 'layer, and a 2025 study of AI search found a strong lean toward third-party sources '
          + 'over a brand’s own pages. The main inputs are below.',
        items: [
          'Business Profiles. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'Merchant Center and Business Profiles can help products and services show up in '
          + 'both AI responses and regular Search, and that AI responses can include information '
          + 'about local businesses. Keep your Bing Places and Apple Business Connect listings '
          + 'matched to it.',
          'Reviews and review answers. After [Google’s change to Business Profile '
          + 'Q&A](https://support.google.com/business/thread/392024106), Maps answers customer '
          + 'questions from the business’s answers and relevant reviews. Review sites such as '
          + 'DealerRater, Yelp, Cars.com and CarGurus add their own record of what buyers say.',
          'Third-party sites. [A 2025 study of AI search '
          + 'services](https://arxiv.org/abs/2509.08919), a preprint that has not been peer '
          + 'reviewed, found a systematic, heavy bias toward '
          + 'third-party, authoritative sources over brand-owned and social content, and found '
          + 'the services differ from each other in how varied and fresh their sources are. '
          + 'Local news sites, community pages and listing sites all sit in that third-party '
          + 'group.',
          'Your own website. Your pages still matter as the place where facts are stated '
          + 'first: hours, brands sold, services, and each vehicle with its price, mileage and '
          + 'VIN in text.',
          'What does not work. [Google '
          + 'warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'that chasing inauthentic mentions across the web is less helpful than it looks, '
          + 'because its spam systems filter them. Planted forum posts and self-written “best '
          + 'dealer” lists fall into that bucket.',
          'For the ChatGPT side in detail, see [what ChatGPT looks at before it recommends a store](@how-chatgpt-recommends-car-dealerships).',
        ],
      },
      {
        type: 'qa',
        id: 'why-the-answer-changes',
        q: 'Why does the answer change between assistants and between runs?',
        a: [
          'Each assistant searches differently, and each run is a fresh answer. '
          + '[ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'sometimes partners with other search providers and rewrites the question into its '
          + 'own queries, Google grounds answers in its own index, and location, wording and the '
          + 'run itself shift the result. OpenAI also warns that results and citations can be '
          + 'incomplete or outdated.',
          'Microsoft adds a third route. [Microsoft '
          + 'documents](https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access) '
          + 'that Microsoft Copilot, with web search on, fetches information from the Bing '
          + 'search service using a short generated query. Different search systems can return '
          + 'different pages, and different pages can produce different short lists.',
          'Within one assistant, the same question asked twice can name different stores. '
          + 'Location matters, wording matters, and the assistant writes a new answer each time. '
          + '[OpenAI tells '
          + 'users](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'to open a cited source and check it, which is good advice for a dealer reading an '
          + 'answer about their own store.',
          'That is why one screenshot proves little, whether it shows your store at the top or '
          + 'missing. A fair read asks the same question several times, on more than one '
          + 'assistant, and counts how often each store comes up.',
        ],
      },
      {
        type: 'qa',
        id: 'can-a-dealership-pay-to-be-named',
        q: 'Can a dealership pay to be named the best?',
        a: [
          'No. [Google says](https://support.google.com/business/answer/7091) there is no way '
          + 'to request or pay for a better local ranking, [OpenAI '
          + 'says](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) '
          + 'ads do not influence the answers ChatGPT gives, and OpenAI’s help page says '
          + 'placement in ChatGPT search is not guaranteed, so no one can sell you a spot in an '
          + 'AI answer.',
          'OpenAI’s [advertising '
          + 'principles](https://openai.com/index/our-approach-to-advertising-and-expanding-access/), '
          + 'published January 16, 2026, add that ads are always separate from the answer and '
          + 'clearly labeled. The [ChatGPT search help '
          + 'page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'says results are ranked on multiple factors meant to find relevant, reliable '
          + 'information, and it describes no paid route into that ranking.',
          'Anyone selling “guaranteed” AI placement is selling something no one can deliver. '
          + 'What a store can do is make itself easy to find, easy to verify and well reviewed, '
          + 'and let the answers follow the evidence.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-makes-a-store-easier-to-name',
        h2: 'What makes a store easier to name?',
        intro:
          'Clear, consistent facts and a healthy review record make a store easier for an '
          + 'assistant to pick and to describe correctly. Bing and Google both publish guidance '
          + 'that points the same way, and none of it involves tricks. These are the levers a '
          + 'dealership controls, roughly in the order most stores should work them.',
        items: [
          'One name, one address, one phone number, everywhere. [Bing’s '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say '
          + 'clear, consistent naming of organizations and locations improves grounding '
          + 'visibility and citation accuracy. Match your website, Google Business Profile, Bing '
          + 'Places, Apple Business Connect, Yelp, DealerRater and your Cars.com, CarGurus and '
          + 'Autotrader profiles.',
          'More reviews, and replies to them. [Google '
          + 'says](https://support.google.com/business/answer/7091) more reviews and positive '
          + 'ratings can help local ranking, and its [review '
          + 'tips](https://support.google.com/business/answer/3474122) ask businesses to reply '
          + 'to reviews, address reviewers by name and respond in a timely way, without '
          + 'promotional replies.',
          'Pages that state facts plainly. [Bing '
          + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) pages are '
          + 'more likely to be selected for grounding and citations when facts are explicit and '
          + 'the important information is visible on the URL itself. Put hours, brands sold, '
          + 'services, and each car’s price, mileage and VIN on the page as text.',
          'Real mentions outside your site. Honest coverage on local news sites, community '
          + 'pages and listing sites gives an assistant something beyond your own pages to read.',
          'Honest review requests only. [Google '
          + 'prohibits](https://support.google.com/business/answer/3474122) offering incentives '
          + 'for reviews, and its [Maps content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114) bars review '
          + 'gating, meaning soliciting only happy customers. AI changes none of those rules.',
          'Reviews deserve their own plan; [how dealership reviews affect AI answers](@dealership-reviews-ai-recommendations) covers what matters and '
          + 'what the platforms allow.',
        ],
      },
      {
        type: 'qa',
        id: 'see-who-gets-named-in-your-town',
        q: 'How do you see who gets named in your town?',
        a: [
          'Ask the “which dealer” questions yourself, several times, on more than one '
          + 'assistant, and write down every store named and every source cited. AutoLander’s '
          + 'free scan does this for ChatGPT and Claude: up to 20 local buyer questions for your '
          + 'city, 3 runs each, with who gets named and the sources behind each answer.',
          'A hand check works like this. Use ChatGPT and Claude with web search on. Ask “best '
          + 'car dealership near [your city],” “best used car dealer in [city]” and “most honest '
          + 'dealership near [ZIP],” each three times. Tally the names. Then open the cited '
          + 'sources: they show which profiles, review sites and pages the assistants lean on in '
          + 'your market.',
          'The scan runs that at scale and adds what a hand check leaves out: whether your '
          + 'robots.txt and the security service in front of your site let AI crawlers in, '
          + 'whether up to five vehicle pages show price, mileage and VIN as text, a score out '
          + 'of 100 with a margin, and the 3 fixes to make first. A person checks every match '
          + 'and walks you through the report in 20 minutes. It measures ChatGPT and Claude '
          + 'only, and it does not measure Google AI Overviews, Google AI Mode, Ask Maps, '
          + 'Gemini, Perplexity or Microsoft Copilot. [Request the free '
          + 'scan](/aeo-geo-for-car-dealers/#scan-form).',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          'OpenAI Help Center, [Searching the web with '
          + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), '
          + 'read September 30, 2026',
          'OpenAI, [Our approach to advertising and expanding '
          + 'access](https://openai.com/index/our-approach-to-advertising-and-expanding-access/), '
          + 'January 16, 2026',
          'Google Search Central, [AI optimization '
          + 'guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), '
          + 'July 10, 2026',
          'Google Business Profile Help, [How local results are '
          + 'ranked](https://support.google.com/business/answer/7091) and [review '
          + 'tips](https://support.google.com/business/answer/3474122)',
          'Google Business Profile Community, [Q&A changes '
          + 'announcement](https://support.google.com/business/thread/392024106), December 3, '
          + '2025',
          'Google Maps, [User contributed content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114)',
          'Google, [Ask Maps '
          + 'announcement](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/), '
          + 'March 12, 2026',
          'Microsoft Bing, [Webmaster '
          + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a), '
          + 'read September 30, 2026',
          'Microsoft Learn, [Copilot public web '
          + 'access](https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access), '
          + 'August 18, 2026',
          'Chen, Wang, Chen and Koudas, [study of AI search source '
          + 'bias](https://arxiv.org/abs/2509.08919), arXiv preprint, September 10, 2025',
        ],
      },
    ],
    faq: [
      ['Does ChatGPT know where I am when I ask for a dealer near me?',
          'Roughly. OpenAI says ChatGPT may estimate your general location from your IP '
          + 'address and share that general location with search providers to localize results. '
          + 'Sharing your device’s precise location is optional and off by default.'],
      ['Do AI assistants favor big dealer groups?',
        'No assistant we know of has published a rule that favors size. What an assistant can find '
        + 'shapes the answer: Business Profiles, reviews, listings and pages that state a store’s facts '
        + 'plainly. A single-rooftop store with current facts everywhere gives an assistant plenty to '
        + 'work with.'],
      ['Should our website say we are the best dealer in town?',
        'Only if an outside source says it and you can link to it. A [2025 preprint '
        + 'study](https://arxiv.org/abs/2509.08919) found AI search services lean heavily toward '
        + 'third-party sources over a brand’s own pages, so a claim of “best” with nothing behind it '
        + 'gives an assistant little to repeat. A specific, real review quote carries more weight.'],
      ['Does Google Maps use my reviews in its AI answers?',
          'Google says so for customer questions. After its change to Business Profile Q&A, a '
          + 'customer who asks a question in Google Maps gets an instant answer based on the '
          + 'business’s answers and relevant reviews. Google also says Ask Maps draws on reviews '
          + 'from more than 500 million contributors.'],
    ],
    cta: {
      heading: 'See who gets named for “best dealer” in your town',
      sub:
        'The free scan asks ChatGPT and Claude the “which dealer” questions for your city, 3 '
        + 'times each, and shows who gets named and the sources behind every answer.',
    },
  },

  // ---------------------------------------------------------------------------
  // 4. #43 /aeo-geo/perplexity-for-car-dealerships/
  // ---------------------------------------------------------------------------
  {
    slug: 'perplexity-for-car-dealerships',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 43,
    anchor: 'Perplexity for car dealerships: how it picks the sources it cites',
    crumb: 'Perplexity',
    primaryKeyword: 'perplexity for car dealerships',
    secondaryKeywords: [
      'how does perplexity work',
      'perplexitybot',
      'perplexity-user robots.txt',
      'perplexity source labels',
    ],
    alsoRelated: [
      'bing-places-for-car-dealers',
      'reddit-and-dealership-reputation',
      'aeo-agency-red-flags',
      'llms-txt-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'Perplexity for Car Dealerships: How It Picks Sources',
    description:
      'How Perplexity picks and cites sources for car questions, what PerplexityBot and '
      + 'Perplexity-User do, and what its source labels mean for dealers.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Perplexity and car dealerships: how it picks the sources it cites',
    tldr:
      'Perplexity for car dealerships works like a research engine: it searches the web in '
      + 'real time for each question, uses AI models to interpret it, and puts numbered '
      + 'citations to the original sources in every answer. PerplexityBot finds and links sites '
      + 'for those results and respects robots.txt, so a dealer should let it in. Perplexity '
      + 'says payments do not affect its source labels, and the questions it uses to rate sites, '
      + 'such as whether a site corrects its mistakes and says who wrote each piece, double as a '
      + 'trust checklist for a dealer website.',
    sections: [
      {
        type: 'qa',
        id: 'how-perplexity-answers-a-car-question',
        q: 'How does Perplexity answer a car-buying question?',
        a: [
          '[Perplexity](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) '
          + 'searches the web in real time for each question, uses AI models to understand what '
          + 'the buyer is asking, and writes an answer with numbered citations that link to the '
          + 'original sources. For a car question, those sources can be review sites, model '
          + 'comparisons, listing sites and dealer pages that answer the question directly.',
          '[Perplexity’s help '
          + 'center](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) '
          + 'names models such as OpenAI’s GPT-5 and Anthropic’s Claude among those it uses to '
          + 'interpret questions, and says each answer includes numbered citations linking to '
          + 'the original sources. Because the numbered sources sit '
          + 'right inside the answer, a buyer can click straight through to the page that '
          + 'supported a claim, including a page on your site.',
          'The other assistants work in related ways with their own search and their own '
          + 'sources. For comparison, see [how ChatGPT recommends '
          + 'dealerships](@how-chatgpt-recommends-car-dealerships) and [how Claude cites its '
          + 'sources](@how-claude-cites-sources).',
          'Keeping a store’s facts and pages in shape for engines like this, and for every '
          + 'other assistant, is the core of [generative engine optimization for '
          + 'dealers](/aeo-geo-for-car-dealers/).',
        ],
      },
      {
        type: 'qa',
        id: 'what-is-perplexitybot',
        q: 'What is PerplexityBot, and should a dealership allow it?',
        a: [
          'PerplexityBot is Perplexity’s search crawler: it finds and links websites in '
          + 'Perplexity’s results, and [Perplexity says](https://docs.perplexity.ai/guides/bots) '
          + 'it is not used to crawl content for AI foundation models. It respects robots.txt. A '
          + 'dealership that wants its pages cited in Perplexity answers should allow it, '
          + 'because blocking it keeps those pages out of what it crawls.',
          '[Perplexity’s bot documentation](https://docs.perplexity.ai/guides/bots) adds that '
          + 'robots.txt changes can take up to 24 hours to be reflected. Blocking PerplexityBot '
          + 'does little for a dealer on the '
          + 'training question, since Perplexity says this crawler does not collect content for '
          + 'foundation models, and it costs the chance to be linked.',
          'Check two places. Your robots.txt should not disallow PerplexityBot, and the '
          + 'security service in front of your site, such as a CDN or firewall with bot rules, '
          + 'should not challenge it. For a crawler-by-crawler decision, see [which AI crawlers '
          + 'to block and which to allow](@should-dealers-block-ai-crawlers).',
        ],
      },
      {
        type: 'qa',
        id: 'what-is-perplexity-user',
        q: 'What is Perplexity-User?',
        a: [
          'Perplexity-User is the fetcher Perplexity uses when a person asks a question and '
          + 'Perplexity visits a page to answer it. Because a user requested the visit, '
          + '[Perplexity says](https://docs.perplexity.ai/guides/bots) Perplexity-User generally '
          + 'ignores robots.txt rules. It acts for one buyer’s live question, separate from the '
          + 'PerplexityBot crawler that surfaces sites in search results.',
          'For a dealer, that has two practical effects. A robots.txt rule does not reliably '
          + 'stop Perplexity-User, and a firewall that challenges every '
          + 'automated visitor may stop it anyway, which can mean a buyer asking about a car on '
          + 'your lot gets an answer built without your page.',
          'The simple setup for most stores: let both in. A live-question fetch can happen at '
          + 'the very moment a buyer is asking about your store or your inventory.',
        ],
      },
      {
        type: 'qa',
        id: 'perplexity-source-labels',
        q: 'What are Perplexity’s source labels?',
        a: [
          'They are tags '
          + '[Perplexity](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels) '
          + 'puts on some cited domains: Government, Academic or Trusted. Perplexity rates whole '
          + 'websites using plain questions, such as whether the site corrects its mistakes and '
          + 'says who wrote each piece. Most domains carry no label, and Perplexity says having '
          + 'none is no negative judgment.',
          '[Perplexity’s help article on source '
          + 'labels](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels) '
          + 'lists the questions its review uses, such as “Does the site correct its '
          + 'mistakes?”, and also asks whether a site keeps news separate from advertising. '
          + 'Since most domains have no label, a dealer site without '
          + 'one is in normal company. The questions themselves are the useful part: they '
          + 'describe what Perplexity looks for in a trustworthy source.',
          'Ask them of your own site. Does your model comparison page say who wrote it? When a '
          + 'price or a spec on a page turns out wrong, is it corrected and dated? Are specials '
          + 'and promotional pages clearly marked and kept apart from the pages that answer '
          + 'questions?',
        ],
      },
      {
        type: 'qa',
        id: 'can-a-dealership-pay-perplexity',
        q: 'Can a dealership pay Perplexity for a label or a citation?',
        a: [
          'Not for a label. [Perplexity '
          + 'says](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels) '
          + 'its partnerships, payments and other business arrangements do not affect a site’s '
          + 'source label, which is set by its source review process alone. As for citations, no '
          + 'one can promise a dealer that Perplexity will cite a page, and anyone who does is '
          + 'guessing.',
          'Google and OpenAI make similar statements about their own products: [Google '
          + 'says](https://support.google.com/business/answer/7091) there is no way to pay for a '
          + 'better local ranking, and [OpenAI '
          + 'says](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) '
          + 'ads do not influence ChatGPT’s answers.',
          'The dependable route is the slow one: pages that are accurate, attributed and kept '
          + 'current, on a site Perplexity can crawl.',
        ],
      },
      {
        type: 'qa',
        id: 'research-on-perplexity-citations',
        q: 'What did research on Perplexity citations find?',
        a: [
          'The key study is the paper that coined “generative engine optimization,” published '
          + 'at KDD 2024. [Testing on the live Perplexity '
          + 'engine](https://arxiv.org/html/2311.09735v3), its authors found that adding '
          + 'quotations improved a source’s visibility by 22% over baseline and adding '
          + 'statistics by up to 37%, in the study’s test setup. Those are lab results, never a '
          + 'forecast for a dealer.',
          '[The GEO paper](https://arxiv.org/abs/2311.09735), by Pranjal Aggarwal and '
          + 'colleagues, built a benchmark of 10,000 queries and reported that its methods could '
          + 'raise visibility in generative engine responses by up to 40%, with results varying '
          + 'by domain. The [live Perplexity test](https://arxiv.org/html/2311.09735v3) is the '
          + 'part closest to a real answer engine.',
          'What a dealer should take from it is the direction: pages that quote real sources '
          + 'and give specific, sourced figures gave the engine more to work with. A service '
          + 'page that lists every item your technicians inspect is more quotable than one that '
          + 'says “thorough inspection.” The size of any effect on your own store is unknown, '
          + 'and no one can promise it.',
        ],
      },
      {
        type: 'bullets',
        id: 'easier-for-perplexity-to-cite',
        h2: 'What makes a car dealership page easier for Perplexity to cite?',
        intro:
          'Perplexity’s source-review questions point to a few habits: say who wrote the page, '
          + 'fix errors in the open, keep promotion apart from information, and state facts '
          + 'plainly with sources. None of these is a trick, and every one also helps a buyer '
          + 'who lands on the page.',
        items: [
          'A named author or team. Put a byline on answer pages and model comparisons: the '
          + 'sales manager, the service director, or your store’s team with a line about who '
          + 'they are. Perplexity’s review asks whether a site [says who wrote each '
          + 'piece](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels).',
          'Dates and corrections. Show when a page was last updated, and when a fact changes, '
          + 'fix it and note the change. Perplexity’s review asks whether a site corrects its '
          + 'mistakes.',
          'Promotion kept apart. Keep specials and sponsored content clearly marked and '
          + 'separate from the pages that answer questions, the way Perplexity’s review asks '
          + 'whether news is kept separate from advertising.',
          'Sourced numbers. When a page cites fuel economy, a recall or a warranty term, link '
          + 'the manufacturer or government source. In the GEO study’s test setup, adding '
          + 'statistics and quotations raised visibility on Perplexity.',
          'Facts stated plainly. Hours, address, brands sold, services, and each vehicle’s '
          + 'price, mileage and VIN belong on the page as text, never locked inside images.',
          'One question per page. Short [answer-first dealer pages](@answer-pages-for-car-dealerships) give Perplexity a clean, '
          + 'single-topic source for each buyer question.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          'Perplexity Help Center, [How does Perplexity '
          + 'work?](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work), '
          + 'September 3, 2026',
          'Perplexity Help Center, [Understanding source '
          + 'labels](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels), '
          + 'September 9, 2026',
          'Perplexity docs, [Perplexity crawlers](https://docs.perplexity.ai/guides/bots)',
          'Aggarwal and others, [GEO: Generative Engine '
          + 'Optimization](https://arxiv.org/abs/2311.09735), KDD 2024, and the [full '
          + 'paper](https://arxiv.org/html/2311.09735v3)',
          'Google Business Profile Help, [How local results are '
          + 'ranked](https://support.google.com/business/answer/7091)',
          'OpenAI, [Our approach to advertising and expanding '
          + 'access](https://openai.com/index/our-approach-to-advertising-and-expanding-access/), '
          + 'January 16, 2026',
        ],
      },
    ],
    faq: [
      ['Does Perplexity use my website to train AI models?',
          'Perplexity says PerplexityBot, the crawler that surfaces and links sites in its '
          + 'search results, is not used to crawl content for AI foundation models. '
          + 'PerplexityBot also respects robots.txt, so you control whether it visits.'],
      ['How fast does Perplexity see a robots.txt change?',
          'Perplexity says changes can take up to 24 hours to be reflected for PerplexityBot. '
          + 'Perplexity-User, which fetches pages for a user’s live question, generally ignores '
          + 'robots.txt, so a robots.txt change does not reliably control it.'],
      ['Which AI models does Perplexity use?',
        '[Perplexity '
        + 'says](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) '
        + 'it uses models such as GPT-5 and Claude to interpret questions, and it searches the web in '
        + 'real time for each one. For a dealer the search side matters more than the model: your pages '
        + 'have to be reachable and clear for Perplexity to cite them.'],
      ['Can I see Perplexity visits in GA4?',
        'Usually. GA4 records the visit, but Google’s channel definitions do not name Perplexity '
        + 'among the AI Assistant examples, so add session source to your traffic report and look for '
        + 'perplexity.ai to see which channel its visits land in.'],
      ['Can I check how my store shows up in Perplexity?',
          'By hand, yes: ask Perplexity a few local buyer questions that name your city and '
          + 'open the numbered sources. AutoLander’s free scan does not measure Perplexity; it '
          + 'asks ChatGPT and Claude up to 20 local buyer questions, 3 times each. The crawler '
          + 'access and vehicle-page fixes it finds are on your own website, which PerplexityBot '
          + 'crawls too.'],
    ],
    cta: {
      heading: 'Check the site the assistants read',
      sub:
        'The free scan does not measure Perplexity. It asks ChatGPT and Claude, and the '
        + 'crawler and vehicle-page fixes it finds are on the same site PerplexityBot crawls.',
    },
  },

  // ---------------------------------------------------------------------------
  // 5. #47 /aeo-geo/bing-places-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'bing-places-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 47,
    anchor: 'Bing Places for car dealers: what Microsoft Copilot reads',
    crumb: 'Bing Places and Copilot',
    primaryKeyword: 'bing places for car dealers',
    secondaryKeywords: [
      'bing places for business',
      'copilot local results',
      'bing webmaster tools ai performance',
      'indexnow for dealer websites',
    ],
    alsoRelated: [
      'when-ai-gets-your-dealership-wrong',
      'inventory-feeds-ai-shopping',
      'dealer-website-provider-ai-search',
      'car-dealer-review-sites-ai-answers',
    ],
    augmentKeys: [],
    title: 'Bing Places for Car Dealers: What Microsoft Copilot Reads',
    description:
      'Why Bing Places and Bing’s index matter to Microsoft Copilot, what Bing’s guidelines '
      + 'say about AI citations, and how dealers track Copilot visibility.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Microsoft Copilot and Bing Places: the dealership listing Copilot reads',
    tldr:
      'Bing Places for car dealers matters because Microsoft Copilot, with web search on, draws '
      + 'on the Bing search service, and Bing says clear, consistent names and '
      + 'locations make grounding and citations more accurate. Claim and verify your Bing Places '
      + 'listing, match it to your Google Business Profile, keep vehicle pages readable without '
      + 'heavy scripts, and use IndexNow when inventory URLs change. Bing Webmaster Tools now '
      + 'shows when Copilot cites your site, and Bing says plainly that GEO does not guarantee '
      + 'citations.',
    sections: [
      {
        type: 'qa',
        id: 'where-copilot-gets-its-information',
        q: 'Where does Microsoft Copilot get its information?',
        a: [
          'From Bing, when web search is on. [Microsoft '
          + 'documents](https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access) '
          + 'that Microsoft Copilot and Copilot Chat can fetch information from the Bing search '
          + 'service to ground their answers, sending a short generated search query rather than '
          + 'the full prompt. [Bing’s own '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'cover Bing search, Copilot and grounding results alike, so one set of rules applies '
          + 'to all three.',
          '[Bing’s Webmaster '
          + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'warn that not following them can reduce a site’s eligibility for grounding or lead '
          + 'to delisting, and Bing says its Copilot experiences rely on the same core crawling, '
          + 'indexing and ranking foundation as traditional search. A dealer site that does well '
          + 'in Bing search is, by Bing’s own description, standing on the same ground Copilot '
          + 'draws from.',
          'For a dealer, the practical meaning is simple. What Bing knows about your store, '
          + 'from Bing Places, your website and the rest of the web, is much of what Copilot has '
          + 'to work with when a buyer asks it about dealers nearby.',
          'Keeping those sources accurate and readable across every engine is the work of '
          + '[generative engine optimization for dealers](/aeo-geo-for-car-dealers/), and the '
          + 'rest of this page covers the Bing side of it.',
        ],
      },
      {
        type: 'qa',
        id: 'why-bing-places-matters',
        q: 'Why does Bing Places matter for car dealers?',
        a: [
          'Bing Places is where your store’s name, address, phone, hours and category live on '
          + 'Bing, and Copilot looks to Bing. [Bing '
          + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) clear, '
          + 'consistent naming of organizations and locations improves grounding visibility and '
          + 'citation accuracy, so a Bing Places listing that matches your Google Business '
          + 'Profile and website reduces doubt about which store is which.',
          'Bing’s phrase for this is “clear entity definition,” and for a dealership the entity '
          + 'is the store. If Bing Places lists the '
          + 'store under a short name, Google under the full franchise name, and the website '
          + 'footer shows a third phone number, an assistant has three weak signals where it '
          + 'could have one strong one.',
          'Treat Bing Places like your Google Business Profile: claim it, verify it, and keep '
          + 'the name, address, phone, hours, categories and website link matched to your other '
          + 'listings. Every AutoLander AEO and GEO plan claims, completes and keeps consistent '
          + 'a set of core listings, among them Bing Places, Apple Business Connect, your '
          + 'Facebook Page, DealerRater and your Cars.com, CarGurus and Autotrader dealer '
          + 'profiles, with Yelp claimed and completed.',
          'The same logic runs through Google’s side. See [the Business Profile fields AI '
          + 'answers use](@google-business-profile-ai-answers) and [what Ask Maps reads about '
          + 'your store](@ask-maps-for-car-dealers).',
        ],
      },
      {
        type: 'bullets',
        id: 'what-helps-a-page-get-cited-in-bing',
        h2: 'What do Bing’s guidelines say helps a page get cited?',
        intro:
          'Bing spells out what helps a page get selected for grounding and citations. The '
          + 'points below come from its Webmaster Guidelines and its February 2026 AI '
          + 'Performance announcement, and each one maps to something your website vendor can '
          + 'change on vehicle pages, model pages and answer pages.',
        items: [
          'Facts that stand on their own. [Bing '
          + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) pages are '
          + 'more likely to be selected for grounding and citations when facts and definitions '
          + 'are explicit and important information is visible on the URL itself. On a VDP, that '
          + 'means price, mileage, trim and VIN in text, on that page.',
          'One topic per URL, key facts near the top. [Bing '
          + 'recommends](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'that each URL focus on a single topic, with essential information near the top and '
          + 'no long introductions. A model comparison page should answer the comparison in its '
          + 'first paragraph.',
          'Media that backs up the text. [Bing '
          + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) images '
          + 'and video should reinforce the page’s text and never be the only source of key '
          + 'information, with descriptive file names, alt text, and captions, transcripts or '
          + 'structured data. A walkaround video helps; the specs still belong in text.',
          'Headings, tables and FAQs. In its [AI Performance '
          + 'announcement](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), '
          + 'Bing advised that clear headings, tables and FAQ sections help AI systems reference '
          + 'content accurately, that regular updates keep AI referencing current content, and '
          + 'that claims should be backed with examples, data and cited sources.',
          'For the Google side of the same question, see [how AI Overviews choose the pages they cite](@google-ai-overviews-for-car-dealers).',
        ],
      },
      {
        type: 'bullets',
        id: 'what-hurts-in-bing-and-copilot',
        h2: 'What hurts a dealer site in Bing and Copilot?',
        intro:
          'Bing names the practices that reduce visibility in search and grounding, and '
          + 'several apply directly to dealer websites. Some are tricks no honest store would '
          + 'try; others are technical defaults that a website platform may have set years ago '
          + 'without anyone noticing. Check for all of them.',
        items: [
          'Content that only appears after scripts run. [Bing '
          + 'warns](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) against '
          + 'hiding critical content behind client-side rendering, saying content that cannot be '
          + 'reliably rendered may not be indexed or selected for grounding. Vehicle pages that '
          + 'fill in price and mileage with JavaScript after the page loads carry exactly this '
          + 'risk.',
          'NOARCHIVE and NOCACHE tags. In [Bing’s '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a), '
          + 'NOARCHIVE keeps content out of Copilot responses and grounding results, and NOCACHE '
          + 'limits Copilot to the URL, title and snippet. NOSNIPPET and DATA-NOSNIPPET may '
          + 'limit citation quality too. Have your vendor confirm none of these sit on pages you want cited.',
          'Cloaking, link schemes and stuffing. [Bing '
          + 'lists](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'cloaking, link schemes, scraped content, keyword stuffing, “artificially engineered '
          + 'language” meant to trigger citations, and automatically generated content at scale '
          + 'without editorial review as practices that reduce ranking and grounding visibility.',
          'Prompt injection. The same list includes prompt injection aimed at Bing or '
          + 'Copilot’s language models. Anyone who suggests hiding text for AI on your pages is '
          + 'offering you a way to lose visibility.',
          'Inconsistent facts. Two addresses or two phone numbers across Bing Places, Google '
          + 'and your site work against the clear entity naming Bing asks for.',
        ],
      },
      {
        type: 'qa',
        id: 'indexnow-for-dealer-websites',
        q: 'What is IndexNow, and should a dealer site use it?',
        a: [
          '[IndexNow](https://www.indexnow.org/faq) is a protocol that tells participating '
          + 'search engines right away when a URL is added, updated or deleted, and a submission '
          + 'to one engine is shared with the others. [Bing '
          + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) timely '
          + 'notifications reduce outdated or incorrect URL references in Copilot answers, which '
          + 'makes it a good fit for inventory that changes daily.',
          '[IndexNow’s FAQ](https://www.indexnow.org/faq) lists Bing, Yandex, Naver, '
          + 'Seznam.cz, Amazon and Yep among participating engines; Google does not appear on '
          + 'that list. So IndexNow reaches Bing and the other participants, and Google is left '
          + 'to its own crawling.',
          'For a dealer, every sold car is a removed URL and every new unit is an added one. A '
          + 'website platform that sends IndexNow notices on those changes gives Bing prompt '
          + 'word that a car sold last week is gone. Ask your vendor whether yours does. '
          + 'IndexNow’s own FAQ says [a submission does not guarantee immediate '
          + 'indexing](https://www.indexnow.org/faq): each engine still decides what to crawl '
          + 'and when.',
        ],
      },
      {
        type: 'qa',
        id: 'see-copilot-citations',
        q: 'How do you see Copilot citations?',
        a: [
          'In Bing Webmaster Tools. Its [AI Performance '
          + 'report](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), '
          + 'in public preview since February 2026, shows when your site is cited in Microsoft '
          + 'Copilot, AI summaries in Bing and some partner integrations, with total citations, '
          + 'cited pages and the grounding queries behind them. A June 2026 update added '
          + 'Intents, including a Local category, Topics and Citation Share.',
          '[Bing’s February 2026 '
          + 'announcement](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview) '
          + 'lists the metrics: total citations, average cited pages per day, grounding queries '
          + '(the phrases the AI used to retrieve cited content) and citation counts per page. '
          + 'The [June 2026 '
          + 'update](https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare) '
          + 'grouped grounding queries into Intents, including Local, clustered them into '
          + 'Topics, added Citation Share, which shows a site’s share of all citations shown for '
          + 'a grounding query, and added Compare for looking back at a previous period.',
          'Read it with one caution from [Bing’s '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a): '
          + 'content can show up as a citation or grounding reference in Copilot without a '
          + 'click, so a drop in clicks does not always mean a loss of visibility. For the '
          + 'Google side, see [Search Console’s generative AI '
          + 'report](@search-console-ai-report-dealers).',
        ],
      },
      {
        type: 'qa',
        id: 'why-no-one-can-guarantee-a-copilot-citation',
        q: 'Why can’t anyone guarantee a Copilot citation?',
        a: [
          'Because Bing itself says so. Its [Webmaster '
          + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'state that SEO does not guarantee rankings or traffic and that GEO does not '
          + 'guarantee grounding or citations in AI experiences. Copilot decides what to cite '
          + 'for each question from what Bing retrieves, and no outside vendor controls that '
          + 'choice.',
          'The exact line, “GEO does not guarantee grounding or citations in AI experiences,” '
          + 'is worth keeping on file. No one can promise Copilot placement, so treat any '
          + 'proposal that does as a warning sign.',
          'What a dealer can control is the evidence: a claimed and consistent Bing Places '
          + 'listing, pages Bing can render and read, honest reviews, and fast updates when '
          + 'inventory changes. Whether Copilot names the store for a given question stays '
          + 'Copilot’s call.',
          'AutoLander’s [free scan](/aeo-geo-for-car-dealers/#scan-form) does not measure '
          + 'Microsoft Copilot; it asks ChatGPT and Claude, 3 times each, and checks your AI '
          + 'crawler access and up to five vehicle pages. Bing Places is part of the core '
          + 'listing work in every plan.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          'Microsoft Learn, [Copilot public web '
          + 'access](https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access), '
          + 'August 18, 2026',
          'Microsoft Bing, [Webmaster '
          + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a), '
          + 'read September 30, 2026',
          'Microsoft Bing Webmaster Blog, [Introducing AI Performance in Bing Webmaster '
          + 'Tools](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), '
          + 'February 10, 2026',
          'Microsoft Bing Search Blog, [New AI visibility insights in Bing Webmaster '
          + 'Tools](https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare), '
          + 'June 16, 2026',
          'IndexNow, [FAQ](https://www.indexnow.org/faq)',
        ],
      },
    ],
    faq: [
      ['What is Citation Share in Bing Webmaster Tools?',
        'A [June 2026 '
        + 'addition](https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare) '
        + 'that shows how much of the citation space your site receives for a grounding query. Bing '
        + 'added it alongside Intents, which groups grounding queries into categories including Local, '
        + 'plus Topics and a Compare view for earlier periods.'],
      ['Does Google use IndexNow?',
          'Google does not appear among IndexNow’s participating engines, which include Bing, '
          + 'Yandex, Naver, Seznam.cz, Amazon and Yep. IndexNow reaches Bing, which Copilot draws '
          + 'on; for Google, keep your XML sitemap current.'],
      ['Can NOARCHIVE keep my pages out of Copilot answers?',
          'Yes. Bing’s guidelines say NOARCHIVE prevents content from being used in Copilot '
          + 'responses and grounding results, and NOCACHE limits Copilot to the URL, title and '
          + 'snippet. Make sure neither is on pages you want cited, such as vehicle pages and '
          + 'answer pages.'],
      ['Does Copilot show which searches it ran?',
        'In Copilot Chat, yes, for a short time. [Microsoft '
        + 'says](https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access) web '
        + 'search query citations show the exact queries Copilot sent to Bing, and they stay available '
        + 'in the thread for 24 hours.'],
    ],
    cta: {
      heading: 'See what ChatGPT and Claude say about your store',
      sub:
        'The free scan does not measure Copilot. It asks ChatGPT and Claude up to 20 local '
        + 'buyer questions, 3 times each, and Bing Places is part of every plan’s listing work.',
    },
  },
];
