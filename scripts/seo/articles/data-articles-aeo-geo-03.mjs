// AEO and GEO silo, batch 03 (2026-09-30): five articles from the plan in
// the 2026-09-30 silo plan. Two cluster pillars and three spokes:
//   #6  aeo-vs-seo-for-car-dealers        basics pillar
//   #7  measure-dealership-ai-visibility  measurement pillar
//   #17 is-seo-dead-for-car-dealers       basics
//   #26 how-long-does-aeo-take-to-work    basics
//   #33 ai-visibility-score-explained     measurement
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Links: in-body sibling links use ONLY the publish-aware token [anchor](@slug), and only to
// siblings with a LOWER publish number (the plan's inBodyLinks), so publishing in order never
// creates a dead link. Forward connections come from alsoRelated (rendered once the target is
// published). Every article links the money page /aeo-geo-for-car-dealers/ with its planned
// anchor in the first two sections, and every third-party number or claim comes from the
// fact bank with its source URL linked in the sentence and repeated in the Sources list.
// House rules: no em or en dashes, no "is not X. It is Y." cadence, no promised rankings,
// mentions or placements (every promise/guarantee sentence carries a denial), and the free
// scan is described as ChatGPT and Claude only.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // 1. /aeo-geo/aeo-vs-seo-for-car-dealers/  (publish #6, cluster basics)
  // ---------------------------------------------------------------------------
  {
    slug: 'aeo-vs-seo-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'basics',
    publishOrder: 6,
    anchor: 'AEO vs SEO for car dealers: what changes and what stays the same',
    crumb: 'AEO vs SEO',
    primaryKeyword: 'aeo vs seo for car dealers',
    secondaryKeywords: [
      'difference between aeo and seo',
      'is aeo replacing seo',
      'do car dealers still need seo',
      'aeo vs geo vs seo',
      'seo vs geo for dealerships',
    ],
    alsoRelated: [
      'measure-dealership-ai-visibility',
      'how-to-choose-an-aeo-agency',
      'is-seo-dead-for-car-dealers',
      'how-long-does-aeo-take-to-work',
      'aeo-cost-for-car-dealerships',
      'google-ai-overviews-for-car-dealers',
    ],
    augmentKeys: ['aiDealers', 'mktgHub'],
    title: 'AEO vs SEO for Car Dealers: What Changes, What Stays',
    description:
      'AEO vs SEO for car dealers in plain terms: what Google, OpenAI and Microsoft say '
      + 'changed, what still counts, and where a dealership should start.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'AEO vs SEO for car dealers: what changes and what stays the same',
    tldr:
      'AEO vs SEO for car dealers comes down to the finish line. SEO earns your pages a place '
      + 'in the list of search results, AEO makes those pages easy for an AI assistant to '
      + 'quote, and GEO builds the kind of trust across the web that leads ChatGPT, Claude or '
      + 'Google AI Overviews to name a store. Google says optimizing for its AI search is still '
      + 'SEO, so keep your SEO and add the pieces most programs skip: AI crawler access, '
      + 'vehicle facts as text and trust on other sites.',
    sections: [
      {
        type: 'qa',
        id: 'difference-between-aeo-and-seo',
        q: 'What is the difference between AEO and SEO for a car dealership?',
        a: [
          'SEO, search engine optimization, works to earn your pages a spot in the list of '
            + 'search results. AEO, answer engine optimization, shapes those pages so an AI '
            + 'assistant can lift a short, direct answer from them. GEO, generative engine '
            + 'optimization, builds the trust that leads assistants to name and cite your '
            + 'store. All three share one foundation.',
          'For a dealership the difference shows up on the screen. A classic search for '
            + '“used trucks near me” returns a map pack, ads and a page of links, and your job '
            + 'is to rank on it. An AI answer to the same question names two or three stores, '
            + 'says why, and cites a handful of pages. Your job there is to be one of the '
            + 'stores it names and one of the pages it trusts. That second job is what [AEO and '
            + 'GEO for car dealers](/aeo-geo-for-car-dealers/) is about.',
        ],
      },
      {
        type: 'qa',
        id: 'what-google-says-about-aeo-geo',
        q: 'What does Google say about AEO and GEO?',
        a: [
          'Google says that, from its point of view, optimizing for generative AI search is '
            + 'optimizing for the search experience, “and thus still SEO.” Its AI features sit '
            + 'on its core ranking and quality systems, and it says no special files or markup '
            + 'are needed to appear in them. AEO and GEO are industry labels, not Google’s '
            + 'own terms.',
          'The details are in Google’s [guide to optimizing for its generative AI '
            + 'features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). '
            + 'It describes those features as “rooted in our core Search ranking and quality '
            + 'systems,” and it tells site owners to weigh outside AEO and GEO advice against '
            + 'its own guidance. Google’s [page on AI features and your '
            + 'website](https://developers.google.com/search/docs/appearance/ai-features) adds '
            + 'that you do not need new machine-readable files, AI text files or special markup '
            + 'to show up in AI Overviews or AI Mode, and that no additional requirements apply '
            + 'beyond regular search.',
          'Use that as a filter for any pitch you hear. If a vendor says Google needs a '
            + 'secret file or new markup before AI Overviews will show your store, Google’s '
            + 'documentation says otherwise. Our plain-language [definitions of AEO and GEO for '
            + 'a dealership](/aeo-geo-for-car-dealers/#what-is-aeo-geo) follow the same line.',
        ],
      },
      {
        type: 'qa',
        id: 'is-aeo-replacing-seo',
        q: 'Is AEO replacing SEO?',
        a: [
          'No. Google’s AI answers pull pages from the same search index its regular '
            + 'results use, and Bing says Microsoft Copilot runs on the same crawling, indexing '
            + 'and ranking foundation as traditional search. A page Google cannot index and '
            + 'show with a snippet cannot appear as a link in AI Overviews or AI Mode at all.',
          'Google describes its AI answers as grounded: its ranking systems retrieve '
            + 'relevant, current pages from the index, the model reviews them, and the answer '
            + 'shows “prominent, clickable links to relevant web pages” ([Google Search '
            + 'Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). '
            + 'Google says a page must be “indexed and eligible to be shown in Google Search '
            + 'with a snippet” to appear in those features ([Google Search '
            + 'Central](https://developers.google.com/search/docs/appearance/ai-features)).',
          'Bing’s [Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
            + 'say Bing and Copilot search experiences “rely on the same core crawling, '
            + 'indexing, and ranking foundation as traditional search.” A dealer who drops SEO '
            + 'to pay for AEO has it backwards: AEO and GEO sit on top of a crawlable, indexed '
            + 'site full of pages worth showing.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-changes-with-ai-answers',
        h2: 'What changes when buyers ask AI instead of searching?',
        intro:
          'Four things change for a dealership. The buyer sees a short answer naming a few '
          + 'stores instead of a page of links, the assistant rewrites and splits the question, '
          + 'it infers roughly where the buyer is, and the answer shows its sources. Being a '
          + 'named store, and a cited page, becomes the goal.',
        items: [
          'Fewer names on the screen. An answer to “where should I buy a used Tacoma near '
            + 'me” names a few dealers and gives reasons. A store left out of that answer gets '
            + 'nothing from that question.',
          'Questions get rewritten and split. Google says AI Overviews and AI Mode can run '
            + 'several related searches across subtopics to build one answer, a method it calls '
            + 'query fan-out, and can show a wider set of links as a result ([Google Search '
            + 'Central](https://developers.google.com/search/docs/appearance/ai-features)).',
          'Location is inferred. OpenAI says ChatGPT may estimate a user’s general location '
            + 'from their IP address to localize results, and its own example turns “good '
            + 'restaurants near me” into “top restaurants San Francisco” ([OpenAI Help '
            + 'Center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)). '
            + 'A buyer’s “dealer near me” question gets a local answer.',
          'Answers show their sources. Google’s AI features show links to the pages behind '
            + 'the answer, and Anthropic says Claude’s web search gives direct citations so '
            + 'people can check its sources ([Anthropic](https://claude.com/blog/web-search)). '
            + 'A buyer can see whether the answer came from your website, a review site or a '
            + 'competitor’s page. For one engine in detail, read [how ChatGPT chooses a dealership](@how-chatgpt-recommends-car-dealerships).',
        ],
      },
      {
        type: 'table',
        id: 'seo-aeo-geo-compared',
        h2: 'AEO vs SEO for car dealers: how do they compare, and where does GEO fit?',
        intro:
          'SEO, AEO and GEO share one foundation and aim at different spots on the screen. '
          + 'SEO aims at the list of results, AEO at the short direct answer, and GEO at the AI '
          + 'answer that names a store and cites its sources. Here they are side by side.',
        head: ['Compared on', 'SEO', 'AEO', 'GEO'],
        rows: [
          ['Goal', 'Rank your pages in the list of search results', 'Get a short, direct answer lifted from your pages', 'Get your store named and your pages cited in AI answers'],
          ['Where it shows', 'Google and Bing results pages and map results', 'Featured snippets, voice answers and direct answers at the top of a search', 'ChatGPT, Claude, Perplexity, Microsoft Copilot, Gemini, Google AI Overviews and Google AI Mode'],
          ['What it takes', 'A crawlable site, a page for every car, sound technical health and a complete Business Profile', 'Pages that answer a buyer question in the first sentence, with price, mileage and VIN as text', 'Matching store facts on every profile and listing, reviews you answer, AI search crawlers let in, and mentions on the sites assistants already cite'],
          ['Who measures it', 'Your website vendor or SEO agency', 'Your web team, through Search Console', 'You or an AEO provider, by asking the assistants directly'],
          ['How you check it', 'Rankings, clicks and queries in Search Console and Bing Webmaster Tools', 'Search Console, which counts Google’s AI features with regular results', 'The same questions asked several times, plus the AI reports in Search Console, Bing and GA4'],
        ],
        note:
          'Definitions follow AutoLander’s AEO and GEO page. Google calls optimizing for its AI '
          + 'search features SEO.',
      },
      {
        type: 'bullets',
        id: 'work-seo-programs-skip',
        h2: 'What new work do most SEO programs skip?',
        intro:
          'Many dealer SEO programs were built for Google’s list of results. They rarely '
          + 'check whether AI search crawlers can open the site, whether vehicle facts are '
          + 'readable text, whether store facts match everywhere, or what other sites say about '
          + 'the store. AEO and GEO work starts in those gaps.',
        items: [
          'Letting AI search crawlers in. OpenAI says a site must allow OAI-SearchBot, and '
            + 'let OpenAI’s published search crawler IP addresses through its host or CDN, to '
            + 'be eligible for ChatGPT search results ([OpenAI Help '
            + 'Center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)). '
            + 'Anthropic says blocking Claude-SearchBot prevents indexing for Claude’s search '
            + 'and reduces visibility there '
            + '([Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)). '
            + 'You can [check whether AI search bots can open your site](@can-chatgpt-see-my-dealer-website) in a few minutes.',
          'Vehicle facts as text. Price, mileage and the full VIN need to be on each '
            + 'vehicle detail page as plain text an assistant can read, instead of inside a '
            + 'photo or a script that loads later.',
          'The same name, address, phone and hours everywhere. Bing says “Clear entity '
            + 'definition improves grounding visibility and citation accuracy” ([Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). '
            + 'For a dealer, that means your Business Profile, Bing Places, Apple Business '
            + 'Connect, Yelp, DealerRater and the listing sites all describe the same store the '
            + 'same way.',
          'Trust from other sites. A 2025 study by Chen, Wang, Chen and Koudas, posted on '
            + 'arXiv as a preprint, found AI search services lean heavily toward third-party, '
            + 'authoritative sources over a brand’s own pages and social posts '
            + '([arXiv](https://arxiv.org/abs/2509.08919)). Reviews and mentions on sites '
            + 'assistants cite carry weight; see [how dealership reviews affect AI answers](@dealership-reviews-ai-recommendations).',
          'Pages written as answers. A page that answers one buyer question in its first '
            + 'sentence, using only your store’s facts, gives an assistant something clean to '
            + 'quote. The format is covered in [how to write a dealership answer page](@answer-pages-for-car-dealerships).',
          'Honest expectations. Bing’s guidelines put it bluntly: “GEO does not guarantee '
            + 'grounding or citations in AI experiences” ([Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). '
            + 'Treat any program that claims otherwise with care.',
        ],
      },
      {
        type: 'qa',
        id: 'measure-aeo-geo-next-to-seo',
        q: 'How do you measure AEO and GEO next to SEO?',
        a: [
          'Use three sources. Google Search Console counts AI Overviews and AI Mode traffic '
            + 'with your regular results and now has a generative AI report. Google Analytics 4 '
            + 'has an AI Assistant channel for visits from tools like ChatGPT. And you ask the '
            + 'assistants your buyers’ questions directly, several times each, because the '
            + 'answers change.',
          'Google says traffic from AI Overviews and AI Mode is counted in the Search '
            + 'Console Performance report under the Web search type, mixed into your totals '
            + '([Google Search '
            + 'Central](https://developers.google.com/search/docs/appearance/ai-features)). '
            + 'Search Console Help describes a newer generative AI performance report that '
            + 'shows impressions from AI Overviews and AI Mode by page, country, date and '
            + 'device, and says it had rolled out to all websites as of August 31, 2026 '
            + '([Search Console Help](https://support.google.com/webmasters/answer/16984139)).',
          'In Google Analytics 4, sessions from recognized AI assistants now land in an AI '
            + 'Assistant channel, and Google’s announcement names ChatGPT, Gemini and Claude as '
            + 'examples ([Google Analytics '
            + 'Help](https://support.google.com/analytics/answer/9164320)).',
          'The third check has no dashboard: ask ChatGPT and Claude your buyers’ questions, '
            + 'with your town in them, more than once each. A pattern across runs tells you far '
            + 'more than a single answer.',
        ],
      },
      {
        type: 'steps',
        h2: 'Where should a dealership start?',
        intro:
          'Start with three checks you can run this week: whether AI search crawlers can open '
          + 'your site, whether your vehicle pages show price, mileage and VIN as text, and '
          + 'whether your Business Profile facts match everywhere else. Each one costs nothing '
          + 'to check.',
        steps: [
          {
            title: 'Open the front door',
            body:
              'Pull up yourdomain.com/robots.txt and look for OAI-SearchBot, Claude-SearchBot '
              + 'and PerplexityBot, or a blanket rule that blocks every bot. Then ask your '
              + 'website vendor whether the security service in front of the site challenges '
              + 'automated visitors. Blocking training crawlers is a separate choice: OpenAI '
              + 'says disallowing GPTBot signals that your content should not be used for '
              + 'training, and that it is separate from blocking OAI-SearchBot '
              + '([OpenAI](https://developers.openai.com/api/docs/bots)).',
          },
          {
            title: 'Read three vehicle pages like a machine',
            body:
              'Pick three cars on your site and look at the page source. If price, mileage '
              + 'and the full VIN are missing as words, an assistant has nothing to quote about '
              + 'those cars.',
          },
          {
            title: 'Match your store facts',
            body:
              'Compare your name, address, phone and hours on your Business Profile, Bing '
              + 'Places, Apple Business Connect, Yelp, DealerRater and your Cars.com, CarGurus '
              + 'and Autotrader profiles. Fix the mismatches first.',
          },
          {
            title: 'Get a baseline before you change anything',
            body:
              '[The free scan](/aeo-geo-for-car-dealers/#scan-form) asks ChatGPT and Claude, '
              + 'each with web search on, up to 20 local buyer questions 3 times each, and a '
              + 'person walks you through the result and the 3 fixes in 20 minutes.',
          },
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro:
          'Checked September 30, 2026.',
        items: [
          '[Google Search Central: generative AI features '
            + 'guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Search Central: AI features and your '
            + 'website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[OpenAI Help Center: Searching the web with '
            + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[Anthropic: Claude’s '
            + 'crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Anthropic: Claude web search](https://claude.com/blog/web-search)',
          '[Microsoft Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Search Console Help: generative AI '
            + 'report](https://support.google.com/webmasters/answer/16984139)',
          '[Google Analytics Help: What’s new](https://support.google.com/analytics/answer/9164320)',
          '[Chen and others, arXiv preprint, 2025](https://arxiv.org/abs/2509.08919)',
          '[Google Search Central: spam '
            + 'policies](https://developers.google.com/search/docs/essentials/spam-policies)',
        ],
      },
    ],
    faq: [
      ['Do car dealers still need SEO if they invest in AEO?',
        'Yes. Google says its AI features are rooted in its core ranking systems, and a page '
        + 'has to be indexed and eligible for a snippet before it can appear as a link in AI '
        + 'Overviews or AI Mode. Keep the SEO your website vendor runs and add the AEO and GEO '
        + 'work on top of it.'],
      ['Is GEO the same thing as AEO?',
        'They overlap, and people often use the words interchangeably. AEO usually means '
        + 'shaping your own pages so an assistant can quote a short, direct answer. GEO usually '
        + 'means building trust across other sites, reviews and listings so an assistant names '
        + 'and cites your store. A dealership needs both.'],
      ['Does my website vendor’s SEO package cover AEO?',
        'Sometimes in part. Ask whether it checks that OAI-SearchBot and Claude-SearchBot can '
        + 'crawl the site, whether every vehicle page shows price, mileage and VIN as text, and '
        + 'who keeps your store facts, reviews and listings consistent off the site.'],
      ['Can AEO work hurt my Google rankings?',
        'Done honestly, it should not. Crawler access, facts as text, answer-first pages and '
        + 'consistent store details line up with what Google already asks for. What can hurt is '
        + 'spam: pages stuffed with repeated keywords, or paid links without the right tags, '
        + 'both covered in [Google’s spam '
        + 'policies](https://developers.google.com/search/docs/essentials/spam-policies).'],
    ],
    cta: {
      heading: 'See where your SEO stops and AEO starts',
      sub:
        'The free scan shows whether ChatGPT and Claude name your store for local buyer '
        + 'questions, which sources they cite and whether they can read your vehicle pages, '
        + 'with the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // 2. /aeo-geo/measure-dealership-ai-visibility/  (publish #7, cluster measurement)
  // ---------------------------------------------------------------------------
  {
    slug: 'measure-dealership-ai-visibility',
    silo: 'aeoGeo',
    cluster: 'measurement',
    publishOrder: 7,
    anchor: 'How to measure your dealership’s AI visibility: questions, repeat runs and margins',
    crumb: 'Measure AI visibility',
    primaryKeyword: 'how to measure ai visibility',
    secondaryKeywords: [
      'ai search visibility audit',
      'share of voice in ai answers',
      'prompt tracking',
      'why ai answers change',
    ],
    alsoRelated: [
      'how-to-choose-an-aeo-agency',
      'ai-visibility-score-explained',
      'search-console-ai-report-dealers',
      'track-ai-traffic-ga4-dealership',
      'bing-places-for-car-dealers',
      'questions-car-buyers-ask-ai',
    ],
    augmentKeys: ['aiDealers'],
    title: 'How to Measure Your Dealership’s AI Visibility Honestly',
    description:
      'How to measure whether AI assistants name your dealership: which questions to ask, why '
      + 'each question needs repeat runs, and what tools can’t see.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How to measure your dealership’s AI visibility: questions, repeat runs and margins',
    tldr:
      'How to measure AI visibility for a dealership: pick a fixed set of local buyer '
      + 'questions, ask each one several times of each assistant, record who gets named and '
      + 'which sources get cited, keep the raw answers, and repeat the same way every month. '
      + 'Add the free reports in Google Search Console, Bing Webmaster Tools and Google '
      + 'Analytics 4. One screenshot of one answer proves very little.',
    sections: [
      {
        type: 'qa',
        id: 'how-to-measure-dealership-ai-visibility',
        q: 'How do you measure a dealership’s AI visibility?',
        a: [
          'Fix a set of local buyer questions, ask each one several times of each '
            + 'assistant, and record who gets named, what gets cited and what the answer gets '
            + 'wrong about your store. Keep the raw answers, repeat the same questions monthly, '
            + 'and read the results next to Search Console, Bing Webmaster Tools and GA4.',
          'Think of it as two kinds of evidence. The first is a sample of what assistants '
            + 'say when a buyer in your town asks a question, which only you can collect by '
            + 'asking. The second is what Google and Microsoft report about their AI features '
            + 'sending impressions, citations and visits to your site. Neither one is complete '
            + 'on its own. If the vocabulary is new, start with [AEO vs SEO for car '
            + 'dealers](@aeo-vs-seo-for-car-dealers), which shows where AI answers sit next to '
            + 'regular search.',
          'The same discipline sits behind [AEO and GEO for car '
            + 'dealers](/aeo-geo-for-car-dealers/): measure first, change things, then measure '
            + 'again the same way so the before and after compare cleanly.',
        ],
      },
      {
        type: 'qa',
        id: 'why-one-test-misleads',
        q: 'Why does one test mislead?',
        a: [
          'Because AI answers vary. The same question can name different stores from one '
            + 'run to the next, from one person to the next and from one town to the next, and '
            + 'OpenAI tells users that search results and citations can be wrong or out of '
            + 'date. One screenshot is a single draw from a system that keeps moving.',
          'Location is one reason. OpenAI says ChatGPT may estimate a user’s general '
            + 'location from their IP address and share it with its search providers to '
            + 'localize results; its example turns “good restaurants near me” into “top '
            + 'restaurants San Francisco” ([OpenAI Help '
            + 'Center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)). '
            + 'Your sales manager at the store and your GM at home in the next county can get '
            + 'different answers to the same words.',
          'Accuracy is another. [OpenAI’s own help '
            + 'page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
            + 'warns: “Search results and citations can be incomplete, outdated, or incorrect.” '
            + 'An answer that names '
            + 'you with last year’s hours, or leaves you out because a directory lists you as '
            + 'closed, is still the answer a buyer sees. For how one engine picks stores, read '
            + '[how ChatGPT recommends dealerships](@how-chatgpt-recommends-car-dealerships).',
          'A hypothetical makes the point. A used-car store in a metro area asks ChatGPT '
            + 'once for the best place to buy a used SUV nearby, sees its own name and calls '
            + 'the job done. Asked twice more that afternoon, the same question could name two '
            + 'competitors instead. Repetition is the only defense against a lucky or unlucky '
            + 'single answer.',
        ],
      },
      {
        type: 'bullets',
        id: 'which-questions-to-track',
        h2: 'Which questions should you track?',
        intro:
          'Track the questions a buyer in your town actually asks, grouped by job: finding a '
          + 'dealer, finding a specific car, checking your reputation, trading in and getting '
          + 'service. Put your city or ZIP in every one, write them the way people talk, and '
          + 'keep the set fixed so month-to-month changes mean something.',
        items: [
          'Finding a dealer: “Where should I buy a used truck in Springfield?” or “Which '
            + 'Honda dealer near 45502 has the best reviews?”',
          'Specific cars: “Who has a certified pre-owned RAV4 under $30,000 near '
            + 'Springfield?” These test whether assistants can read your vehicle pages at all.',
          'Reputation: “Is [store name] a good place to buy a car?” and “What do buyers say '
            + 'about the finance office at [store name]?”, with your store’s real name in place '
            + 'of the brackets.',
          'Trade-ins: “Where can I get the most for my trade-in in Springfield?”',
          'Service: “Where should I get my F-150 serviced near 45502?” Fixed ops questions '
            + 'are worth tracking separately from sales questions.',
          'Write them long. Google says the average AI Mode search is about three times the '
            + 'length of a traditional search query '
            + '([Google](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/)), '
            + 'so a two-word test like “best dealer” tells you little. For the questions buyers '
            + 'bring to AI, read [how car buyers use ChatGPT](@how-car-buyers-use-chatgpt).',
        ],
      },
      {
        type: 'qa',
        id: 'how-many-runs-per-question',
        q: 'How many times should each question be asked?',
        a: [
          'At least three times per assistant, on the same day, with web search on. Three '
            + 'runs will not remove the variation, but they show whether a result holds: named '
            + 'in three of three runs is a different finding from named in one of three. More '
            + 'runs narrow the range further and take more time.',
          'AutoLander’s free scan uses this method. It asks ChatGPT and Claude, each with '
            + 'web search on, up to 20 local buyer questions, 3 times each, which comes to as '
            + 'many as 120 answers. A person on our team checks every match before the report '
            + 'goes out, and the score out of 100 carries a margin because answers change from '
            + 'run to run.',
          'Two habits make repeat runs useful. Start a fresh chat each time, so an earlier '
            + 'conversation does not steer the answer. And name the town in the question the '
            + 'way a buyer would, which gives a fairer read than relying on wherever your '
            + 'office computer happens to be.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-to-record',
        h2: 'What should you record for each answer?',
        intro:
          'Record the same fields for every answer so runs can be compared: whether your '
          + 'store was named, which competitors were named, which sources were cited and '
          + 'whether any were yours, anything the answer got wrong about your store, and the '
          + 'date, assistant and exact question. Keep the full answer text as well.',
        items: [
          'Named or not, and where in the answer. The first of three names reads '
            + 'differently from a passing mention at the end.',
          'Which competitors were named. Over a few months this shows which store the '
            + 'assistants treat as the default for each question.',
          'Which sources were cited, and whether any were yours. A citation to your own '
            + 'vehicle page is a different signal from a citation to a listing site or a review '
            + 'site.',
          'Factual errors. Wrong hours, an old address, a closed service department or a '
            + 'brand you no longer sell. These are fixable, and they are often the first fix.',
          'The date, the assistant, the exact wording of the question and whether web search was on.',
          'The raw answer, saved as text. A score summarizes; the raw answer is what you '
            + 'hand to a vendor or a manager when something needs fixing.',
        ],
      },
      {
        type: 'table',
        id: 'google-microsoft-ai-reports',
        h2: 'What can Google and Microsoft tools show you?',
        intro:
          'Three free tools show AI from your side of the screen. Google Search Console covers '
          + 'AI Overviews and AI Mode in two reports, Bing Webmaster Tools has an AI Performance '
          + 'report for Microsoft Copilot citations, and Google Analytics 4 has an AI Assistant '
          + 'channel for visits. Each one sees only part of the picture.',
        head: ['Tool', 'What it shows', 'What it misses'],
        rows: [
          ['Search Console generative AI performance report', 'Organic impressions from Google AI Overviews and AI Mode over time, by page, country, date and device. Google says it reached all websites as of August 31, 2026.', 'Search Labs experiments, and sites without enough impressions to show data. The help page lists impressions, not clicks.'],
          ['Search Console Performance report', 'Clicks and impressions from AI Overviews and AI Mode, counted inside your regular Web totals', 'A clean split between AI features and classic results'],
          ['Bing Webmaster Tools AI Performance', 'When your site is cited in Microsoft Copilot, AI summaries in Bing and select partners: total citations, cited pages per day, grounding queries and page-level counts. June 2026 added Intents, including Local, plus Topics, Citation Share and Compare.', 'ChatGPT, Claude, Gemini and Google’s AI features'],
          ['Google Analytics 4 AI Assistant channel', 'Sessions from recognized AI assistant referrers such as ChatGPT, Gemini, Claude, Copilot, Deepseek and Grok', 'Google AI Overviews and AI Mode visits, which GA4 counts as Organic Search, and visits that arrive without a referrer, which can land in Direct'],
        ],
        note:
          'From Google Search Console Help, Google Search Central, the Microsoft Bing blogs '
          + 'of February 10 and June 16, 2026, and Google Analytics Help. Links are in the '
          + 'sources list below.',
      },
      {
        type: 'qa',
        id: 'can-any-tool-see-inside-google-ai',
        q: 'Can any tool see inside Google’s AI?',
        a: [
          'No. Google states that “No third-party tool has access to our internal ranking '
            + 'or AI systems.” Any AI rank or visibility number you see from a vendor, ours '
            + 'included, comes from the outside: someone asked questions and recorded the '
            + 'answers. That can still be useful, as long as the method is shown to you.',
          'The warning comes from Google’s [guide to its generative AI '
            + 'features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), '
            + 'which tells site owners to be wary of third-party tools that promise ranking '
            + 'success or claim to use internal Google metrics, because an outside tool cannot '
            + 'see those systems.',
          'So ask any vendor three things: which assistants were asked, how many times each '
            + 'question ran, and whether you can read the raw answers. A number without those '
            + 'three answers tells you very little.',
          'Know the limits of your own sample too. AutoLander’s free scan measures ChatGPT '
            + 'and Claude only. It does not measure Google AI Overviews, AI Mode, Gemini, '
            + 'Perplexity or Microsoft Copilot, which is why the Search Console and Bing '
            + 'reports belong in the same monthly review.',
        ],
      },
      {
        type: 'qa',
        id: 'how-often-to-remeasure',
        q: 'How often should you re-measure?',
        a: [
          'Monthly, on the same question set, with the same assistants and the same number '
            + 'of runs, so each month compares cleanly with the last. Weekly checks on a '
            + 'handful of high-value questions can catch sudden changes, but the monthly run is '
            + 'the one to trend. Change the questions only when your market or inventory mix '
            + 'changes.',
          'Expect clicks and visibility to move separately. Bing notes that content can '
            + 'show up as impressions, citations or grounding references in Copilot without a '
            + 'click, and says “A decline in clicks does not always indicate a loss of '
            + 'visibility” ([Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). '
            + 'Jordi Ribas, Microsoft’s corporate vice president of search and AI, wrote in '
            + 'February 2026 that visibility is no longer defined only by rankings or clicks '
            + '([Microsoft Bing '
            + 'blog](https://blogs.bing.com/search/February-2026/Elevating-the-Role-of-Grounding-on-the-AI-Web)).',
          'A simple monthly sheet does the job: one row per question, one column per '
            + 'assistant and run, a cell for who was named and a cell for what was cited. Add '
            + 'the Search Console, Bing and GA4 numbers at the bottom. When something changes, '
            + 'the raw answers explain why.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro:
          'Checked September 30, 2026.',
        items: [
          '[OpenAI Help Center: Searching the web with '
            + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[Google Search Central: Optimizing your website for generative AI features on '
            + 'Google '
            + 'Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google: AI Mode insights from the US, May '
            + '2026](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/)',
          '[Google Search Console Help: Generative AI performance '
            + 'report](https://support.google.com/webmasters/answer/16984139)',
          '[Microsoft Bing Webmaster blog: AI Performance in Bing Webmaster Tools, February '
            + '10, '
            + '2026](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)',
          '[Microsoft Bing Search blog: Intents, Topics, Citation Share and Compare, June '
            + '16, '
            + '2026](https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare)',
          '[Microsoft Bing Search blog: the role of grounding, February 12, '
            + '2026](https://blogs.bing.com/search/February-2026/Elevating-the-Role-of-Grounding-on-the-AI-Web)',
          '[Microsoft Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Google Analytics Help: What’s new](https://support.google.com/analytics/answer/9164320)',
          '[Google Analytics Help: Default channel '
            + 'group](https://support.google.com/analytics/answer/9756891)',
        ],
      },
    ],
    faq: [
      ['Can I measure my dealership’s AI visibility myself?',
        'Yes. Write 15 to 20 local buyer questions, ask each one three times of ChatGPT and '
        + 'of Claude with web search on, and log who is named and what is cited. Add the Search '
        + 'Console, Bing Webmaster Tools and GA4 reports. The hard part is doing it the same '
        + 'way every month.'],
      ['Why did ChatGPT give my sales manager a different answer than me?',
        'Answers vary from run to run, and OpenAI says ChatGPT may estimate a user’s general '
        + 'location from their IP address to localize results. Two people in different places, '
        + 'or the same person twice, can see different stores. Repeat runs exist for exactly '
        + 'this reason.'],
      ['Is share of voice in AI answers a real metric?',
        'It can be, when it is measured openly: the share of runs, on a fixed question set, '
        + 'in which your store is named, compared with your competitors. Bing Webmaster Tools '
        + 'now reports a related figure, Citation Share, for citations in Microsoft Copilot and '
        + 'Bing’s AI summaries. Any share '
        + 'figure is a sample, so ask for the questions and runs behind it.'],
      ['Which assistants does the free scan measure?',
        'Two: ChatGPT and Claude, each with web search on, for up to 20 local buyer '
        + 'questions, 3 runs each. The scan does not measure Google Gemini, AI Overviews, AI '
        + 'Mode, Perplexity or Microsoft Copilot; for Google’s and Microsoft’s AI features, use '
        + 'Search Console and Bing Webmaster Tools.'],
    ],
    cta: {
      heading: 'Get a measured baseline',
      sub:
        'Up to 20 local buyer questions, 3 runs each, asked of ChatGPT and Claude with web '
        + 'search on, checked by a person and walked through with you in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // 3. /aeo-geo/is-seo-dead-for-car-dealers/  (publish #17, cluster basics)
  // ---------------------------------------------------------------------------
  {
    slug: 'is-seo-dead-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'basics',
    publishOrder: 17,
    anchor: 'Is SEO dead for car dealerships? What AI Overviews changed',
    crumb: 'Is SEO dead?',
    primaryKeyword: 'is seo dead for car dealerships',
    secondaryKeywords: [
      'is seo dead because of ai',
      'do ai overviews reduce dealership traffic',
      'zero click searches',
      'ai overviews click through rate',
    ],
    alsoRelated: [
      'how-long-does-aeo-take-to-work',
      'google-ai-mode-for-car-dealers',
      'track-ai-traffic-ga4-dealership',
      'aeo-cost-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'Is SEO Dead for Car Dealers? What AI Overviews Changed',
    description:
      'Is SEO dead for car dealerships? What Pew, Google and Microsoft data show about AI '
      + 'Overviews, zero-click searches and where dealer traffic goes now.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Is SEO dead for car dealerships? What AI Overviews changed and what they didn’t',
    tldr:
      'Is SEO dead for car dealerships? No. Google says its AI features are rooted in its '
      + 'core ranking systems, and Bing says Microsoft Copilot runs on the same search '
      + 'foundation, so a crawlable, indexed website still decides whether AI answers can use '
      + 'your pages. What changed is how many clicks a search result earns, so keep your SEO '
      + 'and add the AEO work AI answers depend on.',
    sections: [
      {
        type: 'qa',
        id: 'is-seo-dead-for-car-dealerships',
        q: 'Is SEO dead for car dealerships?',
        a: [
          'No. Google says its generative AI features are rooted in its core ranking and '
            + 'quality systems, and Bing says Copilot relies on the same crawling, indexing and '
            + 'ranking foundation as traditional search. A site search engines cannot read gives '
            + 'Google’s and Bing’s AI answers nothing to link to either. What changed is how many '
            + 'clicks a search result earns.',
          'Google’s [guide to optimizing for its generative AI '
            + 'features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
            + 'describes those features as “rooted in our core Search ranking and quality '
            + 'systems” and says SEO best practices still apply. Bing’s [Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
            + 'say its Copilot search experiences “rely on the same core crawling, indexing, '
            + 'and ranking foundation as traditional search.” Two of the biggest search '
            + 'companies, in their own documentation, describe AI answers as a layer built on '
            + 'search.',
          'So the useful question for a dealer principal is narrower: which parts of the '
            + 'old playbook still pay, and what has to be added. The additions are what [AEO '
            + 'and GEO for car dealers](/aeo-geo-for-car-dealers/) covers. The rest of this '
            + 'page sets the independent data available next to what Google says about itself.',
        ],
      },
      {
        type: 'qa',
        id: 'do-ai-overviews-reduce-clicks',
        q: 'Do AI Overviews reduce clicks to dealer websites?',
        a: [
          'Independent data shows fewer clicks on the searches where they appear. [Pew '
            + 'Research '
            + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/), '
            + 'studying the browsing of 900 US adults in March 2025, found '
            + 'people clicked a traditional result on 8% of Google visits that showed an AI '
            + 'summary, against 15% of visits without one. Google says total organic clicks '
            + 'have stayed relatively stable.',
          'Pew also found people clicked a link inside the AI summary itself on just 1% of '
            + 'visits ([Pew Research '
            + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)). '
            + 'The study covered every kind of search, with no focus on car shopping, so treat '
            + 'it as the general pattern and never as a dealer benchmark.',
          'Google reads its own numbers differently. Liz Reid, Google’s head of Search, '
            + 'wrote in August 2025 that total organic click volume from Google to websites has '
            + 'been relatively stable year over year, while traffic shifts between sites, with '
            + 'some gaining and some losing '
            + '([Google](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/)). '
            + 'Google also says clicks from results pages with AI Overviews are higher quality, '
            + 'meaning people are more likely to spend more time on the site ([Google Search '
            + 'Central](https://developers.google.com/search/docs/appearance/ai-features)). '
            + 'Both are Google’s claims about its own product.',
          'For a dealer, both can be true at once: fewer clicks on searches that show an AI summary, '
            + 'steady totals across the web, and a real shift in which sites win the clicks '
            + 'that remain. How those summaries choose the pages they link is covered in [what AI Overviews look for in a dealer page](@google-ai-overviews-for-car-dealers).',
        ],
      },
      {
        type: 'qa',
        id: 'which-searches-show-ai-summaries',
        q: 'Which searches show AI summaries most often?',
        a: [
          'Question-style and long searches. In Pew’s March 2025 data, about 18% of Google '
            + 'searches produced an AI summary. That share rose to 60% for searches phrased as '
            + 'questions and 53% for searches of 10 or more words. A buyer who types a full '
            + 'question is the buyer most likely to meet an AI summary first.',
          'The same Pew data found people ended their browsing session on 26% of pages with '
            + 'an AI summary, against 16% of pages without one ([Pew Research '
            + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)). '
            + 'A buyer who asks a full question and reads an AI summary is more likely to stop '
            + 'there.',
          'Map that onto a dealership’s traffic. Searches for your store’s name, your '
            + 'address or your service hours are short and direct. The questions that decide '
            + 'where a shopper goes, like “which dealer in town is fair on trade-in values” or '
            + '“best place to buy a used truck under $30,000 near me,” are long and phrased as '
            + 'questions. Those are the searches where an AI summary is most likely to answer '
            + 'the buyer before any click.',
        ],
      },
      {
        type: 'qa',
        id: 'zero-click-search',
        q: 'What is a zero-click search, and should a dealer care?',
        a: [
          'A zero-click search is one the buyer finishes on the results page without '
            + 'visiting any site, because an AI summary, the map or a quick answer told them '
            + 'enough. A dealer should care about it, and should also stop reading every drop '
            + 'in clicks as a drop in visibility. The two now move separately.',
          'Bing makes that point directly. Its guidelines note that content can appear as '
            + 'impressions, citations or grounding references in Copilot without a click, and '
            + 'say “A decline in clicks does not always indicate a loss of visibility” ([Bing '
            + 'Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). '
            + 'Jordi Ribas, Microsoft’s corporate vice president of search and AI, wrote in '
            + 'February 2026 that visibility is no longer defined only by rankings or clicks '
            + '([Microsoft Bing '
            + 'blog](https://blogs.bing.com/search/February-2026/Elevating-the-Role-of-Grounding-on-the-AI-Web)).',
          'For a store, a zero-click answer that names you with the right hours and a line '
            + 'about your reviews can still send a buyer to your lot, your phone or your '
            + 'Business Profile. A zero-click answer that names the store across the street '
            + 'does the opposite. You can watch the Google side of this in [Search Console’s '
            + 'generative AI report](@search-console-ai-report-dealers), which counts '
            + 'impressions from AI Overviews and AI Mode.',
        ],
      },
      {
        type: 'qa',
        id: 'where-ai-answers-get-links',
        q: 'Where do AI answers get their links?',
        a: [
          'For Google, from its own search index. Google says its AI answers retrieve '
            + 'relevant, up-to-date pages from the index, review them and show clickable links '
            + 'to the pages that support the answer. Pew found Wikipedia, YouTube and Reddit '
            + 'together made up 15% of the sources cited in Google’s AI summaries, against 17% '
            + 'of standard result links.',
          'Google calls this grounding: its core ranking systems do the retrieving, and the '
            + 'answer shows “prominent, clickable links to relevant web pages” ([Google Search '
            + 'Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). '
            + 'A page outside the index cannot be one of those links. The Pew source figures '
            + 'come from the same July 2025 report ([Pew Research '
            + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)).',
          'The practical reading for a dealer: the pages AI answers link to come from the '
            + 'pool search engines have already indexed and ranked. For a store, that pool '
            + 'includes your own website, review sites and the listing sites buyers use. SEO '
            + 'keeps your pages in the pool. AEO and GEO work on whether they get chosen.',
        ],
      },
      {
        type: 'qa',
        id: 'how-big-is-ai-search',
        q: 'How big is AI search now?',
        a: [
          'Big enough to plan around. At Google I/O in May 2026, Google said AI Overviews '
            + 'has over 2.5 billion monthly active users and that AI Mode queries had more than '
            + 'doubled every quarter since launch. Those are Google’s own figures about its own '
            + 'products, and they describe all searches, with no breakdown for car shopping.',
          'Sundar Pichai gave the AI Overviews figure in his [I/O 2026 '
            + 'keynote](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/), along '
            + 'with the claim that AI Mode passed 1 billion monthly active users within a year '
            + 'of launch. Google’s head of Search, Liz Reid, reported the quarterly '
            + 'doubling of AI Mode queries and an all-time high in Search queries in [Google’s '
            + 'I/O 2026 Search '
            + 'post](https://blog.google/products-and-platforms/products/search/search-io-2026/).',
          'Two things follow for a dealership. Buyers can meet AI answers inside Google '
            + 'without ever opening ChatGPT. And by Google’s account, search itself keeps '
            + 'growing, with overall queries at an all-time high, so the classic results and '
            + 'the AI answers both deserve a plan.',
        ],
      },
      {
        type: 'qa',
        id: 'keep-doing-and-add',
        q: 'What should a dealership keep doing, and what should it add?',
        a: [
          'Keep the SEO basics: pages search engines can crawl and index, sound technical '
            + 'health, a page for every car and a complete Business Profile. Add the AI layer: '
            + 'open the site to AI search crawlers, put vehicle facts on the page as text, '
            + 'write pages that answer buyer questions first, and build trust on other sites.',
          'The comparison in [AEO vs SEO for car dealers](@aeo-vs-seo-for-car-dealers) lays '
            + 'the two lists side by side. Before you cut a line from the SEO budget, check '
            + 'what the AI layer depends on: nearly all of it assumes the SEO floor is already '
            + 'in place.',
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Keep doing',
          items: [
            'Indexable pages: every vehicle, every model you carry, and service and finance '
              + 'pages that Google can crawl and show with a snippet.',
            'Technical health: working sitemaps, clean redirects and pages that load '
              + 'without errors on a phone.',
            'Your Google Business Profile: correct categories, hours, services and photos, '
              + 'with every review answered.',
            'Local consistency: the same name, address and phone number everywhere your '
              + 'store is listed.',
          ],
        },
        right: {
          h2: 'Add now',
          items: [
            'AI search crawler access: OAI-SearchBot, Claude-SearchBot and PerplexityBot '
              + 'allowed in robots.txt and through your security service.',
            'Facts as text: price, mileage and the full VIN readable on every vehicle page.',
            'Answer-first pages: one buyer question per page, answered in the first '
              + 'sentence with your store’s own facts.',
            'Trust from other sites: reviews you answer, accurate listings and mentions on '
              + 'the sites assistants already cite.',
          ],
        },
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro:
          'Checked September 30, 2026.',
        items: [
          '[Pew Research Center: Google users are less likely to click on links when an AI '
            + 'summary appears, July 22, '
            + '2025](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)',
          '[Google Search Central: Optimizing your website for generative AI features on '
            + 'Google '
            + 'Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Search Central: AI features and your '
            + 'website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[Google, Liz Reid: AI in Search is driving more queries and higher quality '
            + 'clicks, August 6, '
            + '2025](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/)',
          '[Google: Sundar Pichai at I/O '
            + '2026](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)',
          '[Google: Search at I/O '
            + '2026](https://blog.google/products-and-platforms/products/search/search-io-2026/)',
          '[Microsoft Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Microsoft Bing Search blog: the role of grounding, February 12, '
            + '2026](https://blogs.bing.com/search/February-2026/Elevating-the-Role-of-Grounding-on-the-AI-Web)',
        ],
      },
    ],
    faq: [
      ['Should a dealership cut its SEO budget because of AI?',
        'Not as a first move. Google and Bing both say their AI answers rest on the same '
        + 'crawling, indexing and ranking systems as search, so the SEO floor still matters. '
        + 'Review what the budget buys, drop reports nobody acts on, and move money toward '
        + 'crawler access, answer pages and reviews.'],
      ['What is a zero-click search?',
        'A search the person finishes on the results page without visiting a website, because '
        + 'an AI summary, a map or a quick answer gave them enough. In March 2025 browsing '
        + 'data, Pew found people clicked a traditional result on 8% of Google visits with an '
        + 'AI summary, against 15% without one.'],
      ['Do clicks from AI Overviews convert better?',
        'Google says clicks from results pages with AI Overviews are higher quality, meaning '
        + 'people are more likely to spend more time on the site. Treat that as Google’s claim '
        + 'about its own product, and check the engagement and lead numbers for Organic Search '
        + 'in your own Google Analytics before you rely on it.'],
      ['Is Google sending less traffic to websites overall?',
        'Google says no: its head of Search wrote in August 2025 that total organic clicks '
        + 'from Google to websites have been relatively stable year over year, while traffic '
        + 'shifts between sites. Pew’s browsing data shows fewer clicks on searches with an AI '
        + 'summary. Both can hold at once, and your own Search Console shows which side your '
        + 'store is on.'],
    ],
    cta: {
      heading: 'Before you cut or add budget, see what AI says today',
      sub:
        'The free scan shows whether ChatGPT and Claude name your store for up to 20 local '
        + 'buyer questions, which sources they cite, and the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // 4. /aeo-geo/how-long-does-aeo-take-to-work/  (publish #26, cluster basics)
  // ---------------------------------------------------------------------------
  {
    slug: 'how-long-does-aeo-take-to-work',
    silo: 'aeoGeo',
    cluster: 'basics',
    publishOrder: 26,
    anchor: 'How long does AEO take to work for a dealership? An honest 90-day timeline',
    crumb: 'How long AEO takes',
    primaryKeyword: 'how long does aeo take to work',
    secondaryKeywords: [
      'how long does geo take',
      'when will chatgpt mention my dealership',
      'aeo results timeline',
      'first 90 days of aeo',
    ],
    alsoRelated: [
      'aeo-cost-for-car-dealerships',
      'ai-visibility-score-explained',
      'should-dealers-block-ai-crawlers',
      'how-to-respond-to-car-dealership-reviews',
    ],
    augmentKeys: [],
    title: 'How Long Does AEO Take for a Dealership? A 90-Day View',
    description:
      'How long AEO takes for a dealership: what AI tools can pick up within days, what '
      + 'builds over months, and why no one can honestly promise a date.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How long does AEO take to work for a dealership? An honest 90-day timeline',
    tldr:
      'How long does AEO take to work? Some fixes are read within a day or two, such as a '
      + 'robots.txt change that lets AI search crawlers in. Profiles and listings take weeks, '
      + 'and reviews, mentions on other sites and answer pages build over months. No one can '
      + 'honestly promise when ChatGPT or any other assistant will name your store, so judge '
      + 'the first 90 days by work shipped and by the same questions measured again.',
    sections: [
      {
        type: 'qa',
        id: 'how-long-does-aeo-take',
        q: 'How long does AEO take to work for a dealership?',
        a: [
          'It depends on the fix. Crawler access can be read within about a day, profile '
            + 'and listing work takes weeks, and reviews, mentions and answer pages build over '
            + 'months. No one can promise the date an assistant will name your store, and '
            + 'OpenAI and Bing both say in writing that placement and citations are not '
            + 'guaranteed.',
          'OpenAI’s help page on ChatGPT search says results are ranked using multiple '
            + 'factors, and it never promises a spot: “Placement is not guaranteed” ([OpenAI Help '
            + 'Center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)). '
            + 'Bing’s guidelines say “GEO does not guarantee grounding or citations in AI '
            + 'experiences” ([Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)).',
          'So the honest answer splits the work by how fast each part can be read, then '
            + 'measures on a fixed schedule. For where this work sits next to regular search, '
            + 'see [AEO vs SEO for car dealers](@aeo-vs-seo-for-car-dealers). For what a '
            + 'monthly program covers, see [AEO for car '
            + 'dealerships](/aeo-geo-for-car-dealers/).',
        ],
      },
      {
        type: 'bullets',
        id: 'what-changes-within-days',
        h2: 'What can change within days?',
        intro:
          'Changes that touch a crawler or a profile photo move fastest. OpenAI and '
          + 'Perplexity both say their search crawlers pick up a robots.txt change within about '
          + 'a day, Google says new Business Profile photos can take 24 to 48 hours to appear, '
          + 'and IndexNow can tell some search engines about a changed page right away.',
        items: [
          'robots.txt for ChatGPT search. OpenAI says OAI-SearchBot follows robots.txt and '
            + 'that changes take about 24 hours to be reflected '
            + '([OpenAI](https://developers.openai.com/api/docs/bots)). If your site blocks it '
            + 'today, unblocking it is one of the fastest fixes in AEO.',
          'robots.txt for Perplexity. Perplexity says PerplexityBot respects robots.txt and '
            + 'that changes can take up to 24 hours to show '
            + '([Perplexity](https://docs.perplexity.ai/guides/bots)).',
          'Business Profile photos. Google’s help page says new photos can take 24 to 48 '
            + 'hours to appear ([Google Business Profile '
            + 'Help](https://support.google.com/business/answer/6103862)).',
          'IndexNow pings. IndexNow lets a site notify participating engines, including '
            + 'Bing, the moment a URL is added, changed or removed, and a submission to one is '
            + 'shared with the others. Google is not listed as a participant, and IndexNow says '
            + 'a submission does not guarantee immediate indexing '
            + '([IndexNow](https://www.indexnow.org/faq)).',
          'What “read” means. A crawler reading your site within a day starts the process. '
            + 'Whether an assistant then names your store is a separate decision it makes '
            + 'question by question and run by run.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-takes-weeks',
        h2: 'What takes weeks?',
        intro:
          'Work that depends on another company’s process takes weeks: completing and '
          + 'verifying profiles, claiming listings on sites like Bing Places and Apple Business '
          + 'Connect, and getting your website vendor to ship fixes. Each site runs its own '
          + 'verification on its own schedule, so the dates you control are the dates the work '
          + 'goes in.',
        items: [
          'Business Profile completion. On AutoLander’s plans, your profile is complete '
            + 'within 30 days of us getting manager access: categories, services, description, '
            + 'hours, attributes and photos. For the fields that matter most, see [which Business Profile facts AI answers draw on](@google-business-profile-ai-answers).',
          'Core listings. Claims and completions for Bing Places, Apple Business Connect, '
            + 'Yelp, your Facebook Page, DealerRater and your Cars.com, CarGurus and Autotrader '
            + 'dealer profiles are submitted within 45 days of kickoff. Each one goes live when '
            + 'that site finishes its own verification.',
          'Directory listings. The order for 40 directory listings plus the main data '
            + 'aggregators is placed within 30 days of kickoff, and every live link goes in '
            + 'your report.',
          'Website vendor fixes. The fix list reaches your vendor within 3 business days of '
            + 'kickoff. How fast the vendor ships is up to the vendor, which is why the list is '
            + 'chased every week and your site is re-checked until each fix is live.',
          'Review requests. The request template and cadence are set up in your own CRM or '
            + 'DMS within 14 days of kickoff, and they start sending when your system admin '
            + 'switches them on.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-takes-months',
        h2: 'What takes months?',
        intro:
          'Trust takes months. Reviews arrive one sold customer at a time, other sites '
          + 'mention a store on their own schedule, and new answer pages have to be crawled, '
          + 'indexed and chosen. Even then, Google says meeting every best practice does not '
          + 'mean a page will be crawled, indexed or served.',
        items: [
          'Reviews and replies. A neutral request to every sold customer, 2 to 5 days after '
            + 'delivery, builds a steady record, and answering every review keeps it current. '
            + 'There is no honest shortcut: Google prohibits offering incentives for reviews '
            + '([Google Business Profile '
            + 'Help](https://support.google.com/business/answer/3474122)), and its Maps content '
            + 'policy bars asking only happy customers ([Google Maps content '
            + 'policy](https://support.google.com/contributionpolicy/answer/7400114)).',
          'Mentions on other sites. Local news, community sites and the listing sites '
            + 'assistants cite decide on their own timeline whether and how to mention a store.',
          'Answer pages. Each page has to be approved, published by your vendor, crawled '
            + 'and indexed before any assistant can use it. Google’s guide says “Indexing and '
            + 'serving aren’t guaranteed,” and no one can shortcut that step ([Google Search '
            + 'Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).',
          'Cleanup across the web. Old listings with an old phone number or last year’s '
            + 'hours can linger on sites you do not control, and clearing them out is steady '
            + 'work.',
        ],
      },
      {
        type: 'steps',
        h2: 'What does a realistic first 90 days look like?',
        intro:
          'A realistic first 90 days is a schedule of work you can check, followed by a clean '
          + 're-measure. The milestones below are steps our service controls, counted from '
          + 'kickoff. What the assistants say at day 90 is the measurement, and nobody can '
          + 'promise it in advance.',
        steps: [
          {
            title: 'Before day 1: baseline and agreement',
            body:
              'Start with the free scan as your baseline: up to 20 local buyer questions, '
              + 'asked of ChatGPT and Claude 3 times each, then a 20-minute walkthrough. After '
              + 'a signed agreement, kickoff happens within 5 business days.',
          },
          {
            title: 'Days 1 to 14: fix list and review setup',
            body:
              'The website fix list reaches your vendor within 3 business days of kickoff, '
              + 'covering AI crawler access, price, mileage and VIN as text, and structured '
              + 'data where your platform lacks it. The review-request template and cadence are '
              + 'set up within 14 days.',
          },
          {
            title: 'Days 15 to 30: profile and directories',
            body:
              'Your Business Profile is complete within 30 days of manager access, and the '
              + 'directory order is placed within 30 days of kickoff. Crawler fixes go live '
              + 'when your vendor ships them, and your site is re-checked every week until they '
              + 'do.',
          },
          {
            title: 'Days 31 to 60: listings, answer pages and the first report',
            body:
              'Core listing claims are submitted within 45 days of kickoff. Each month’s '
              + 'answer-page drafts reach your approver by the 15th, and approved pages go to '
              + 'your vendor or CMS within 3 business days. Your first monthly report arrives '
              + 'by business day 5 of the next month.',
          },
          {
            title: 'Days 61 to 90: re-measure the same questions',
            body:
              'The monthly report asks the same questions the same way and shows the raw '
              + 'answers, each labelled by the assistant it came from. Compare it with the '
              + 'baseline question by question. Some answers may move and some may not; no one '
              + 'can promise which, and a report that hides the misses is worth little.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'why-no-one-can-promise-a-date',
        q: 'Why can’t anyone promise when ChatGPT will name your store?',
        a: [
          'Because the assistant decides, question by question and run by run, and no '
            + 'outside party controls that decision. OpenAI says ChatGPT ranks results using '
            + 'multiple factors and that placement is not guaranteed, Bing says GEO does not '
            + 'guarantee citations, and Google says no third-party tool can see inside its '
            + 'ranking or AI systems.',
          'Google adds a fourth line in its [guide to its generative AI '
            + 'features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): '
            + 'a page that meets every requirement may still never be crawled, indexed or '
            + 'served, because “Indexing and serving aren’t guaranteed.” The same guide warns '
            + 'about tools that claim to use internal Google metrics, since “No third-party '
            + 'tool has access to our internal ranking or AI systems.”',
          'A vendor who names a date for your first ChatGPT mention is guessing or selling. '
            + 'The warning signs are listed in [AEO red flags](@aeo-agency-red-flags). What an '
            + 'honest provider can commit to is the work: dates for fixes, profiles, listings '
            + 'and pages, each one checkable in a report.',
        ],
      },
      {
        type: 'bullets',
        id: 'signs-aeo-is-working',
        h2: 'How do you know it is working before AI names you?',
        intro:
          'Watch leading signs that show the groundwork is in place: AI search crawlers '
          + 'allowed and reaching your pages, the same store facts everywhere, AI Assistant '
          + 'sessions in Google Analytics 4 and AI Overviews impressions in Search Console. '
          + 'They tell you the inputs are right. The answers themselves are measured '
          + 'separately, on the same questions each month.',
        items: [
          'Crawler access confirmed. robots.txt allows OAI-SearchBot and Claude-SearchBot, '
            + 'your security service no longer challenges them, and your server logs can show '
            + 'their visits.',
          'Facts consistent. Name, address, phone and hours match on your Business Profile, '
            + 'Bing Places, Apple Business Connect, Yelp and the listing sites.',
          'AI Assistant sessions in GA4. Google Analytics 4 now groups visits from '
            + 'recognized AI assistants into an AI Assistant channel, and Google’s announcement '
            + 'names ChatGPT, Gemini and Claude as examples ([Google Analytics '
            + 'Help](https://support.google.com/analytics/answer/9164320)).',
          'Generative AI impressions in Search Console. Search Console’s generative AI '
            + 'performance report shows impressions from AI Overviews and AI Mode over time '
            + '([Search Console Help](https://support.google.com/webmasters/answer/16984139)).',
          'Fewer wrong facts. Watch whether old hours or a closed department drop out of '
            + 'the answers once the sources they cited are corrected.',
          'A method that stays the same. All of this only means something if the questions '
            + 'and runs stay fixed; [how to measure AI '
            + 'visibility](@measure-dealership-ai-visibility) sets out the method.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro:
          'Checked September 30, 2026.',
        items: [
          '[OpenAI Help Center: Searching the web with '
            + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)',
          '[Microsoft Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Google Search Central: Optimizing your website for generative AI features on '
            + 'Google '
            + 'Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Business Profile Help: photo '
            + 'guidelines](https://support.google.com/business/answer/6103862)',
          '[Google Business Profile Help: review '
            + 'policies](https://support.google.com/business/answer/3474122)',
          '[Google Maps user contributed content '
            + 'policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[IndexNow FAQ](https://www.indexnow.org/faq)',
          '[Google Analytics Help: What’s new](https://support.google.com/analytics/answer/9164320)',
          '[Google Search Console Help: Generative AI performance '
            + 'report](https://support.google.com/webmasters/answer/16984139)',
        ],
      },
    ],
    faq: [
      ['Can AEO work in 30 days?',
        'Some of it can be read in 30 days: a robots.txt fix within about a day, new Business '
        + 'Profile photos within 24 to 48 hours, a completed profile inside a month. Whether '
        + 'ChatGPT or Claude names your store within 30 days is a separate question, and no one '
        + 'can honestly promise it.'],
      ['How often should results be re-checked?',
        'Monthly, on the same questions, with the same assistants and the same number of '
        + 'runs. AutoLander’s AI Authority and Market Leader plans also re-run 10 buyer '
        + 'questions every week against 3 named competitors, which catches sudden changes '
        + 'between monthly reports.'],
      ['Why did ChatGPT name my store one day and not the next?',
        'Answers vary from run to run, and OpenAI says ChatGPT may localize results using a '
        + 'general location estimated from the user’s IP address. OpenAI also warns that search '
        + 'results and citations can be incomplete, outdated or incorrect. One day’s answer is '
        + 'a single sample, which is why every question gets asked more than once.'],
      ['What should I see in the first month of AEO work?',
        'Work you can check: a baseline scan, a kickoff, a fix list sent to your website '
        + 'vendor, review requests set up, your directory order placed and your Business '
        + 'Profile on its way to complete. Named mentions may or may not change in month one, '
        + 'and nobody can promise they will.'],
    ],
    cta: {
      heading: 'Start the clock with a baseline',
      sub:
        'The free scan records who ChatGPT and Claude name today for up to 20 local buyer '
        + 'questions, 3 runs each, so every later month has an honest point of comparison.',
    },
  },

  // ---------------------------------------------------------------------------
  // 5. /aeo-geo/ai-visibility-score-explained/  (publish #33, cluster measurement)
  // ---------------------------------------------------------------------------
  {
    slug: 'ai-visibility-score-explained',
    silo: 'aeoGeo',
    cluster: 'measurement',
    publishOrder: 33,
    anchor: 'AI visibility score: what a dealership’s score out of 100 means',
    crumb: 'AI visibility score',
    primaryKeyword: 'ai visibility score',
    secondaryKeywords: [
      'ai visibility score checker',
      'free ai visibility score',
      'what is a good ai visibility score',
      'margin of error in ai visibility',
    ],
    alsoRelated: [
      'how-claude-cites-sources',
      'aeo-cost-for-car-dealerships',
      'track-ai-traffic-ga4-dealership',
      'best-car-dealership-near-me-ai',
    ],
    augmentKeys: [],
    title: 'AI Visibility Score: What a Dealer’s Number Really Means',
    description:
      'What an AI visibility score out of 100 can and can’t tell a dealership, why a fair '
      + 'score has a margin, and how to read it next to the raw answers.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'AI visibility score: what a dealership’s score out of 100 can tell you, and what it can’t',
    tldr:
      'An AI visibility score is a summary number, usually out of 100, for how often AI '
      + 'assistants name your dealership and how ready your website is for them to read. A fair '
      + 'score comes with a margin, because the same question gets different answers from run '
      + 'to run. Read it next to the raw answers, compare it with your competitors and your own '
      + 'last month, and never treat it as a forecast of sales.',
    sections: [
      {
        type: 'qa',
        id: 'what-is-an-ai-visibility-score',
        q: 'What is an AI visibility score?',
        a: [
          'An AI visibility score is one number that summarizes how often AI assistants '
            + 'name your store for local buyer questions and how ready your site is for them to '
            + 'read. AutoLander’s is out of 100 and built from how often you are named, the '
            + 'sources that cite you, your reviews and your site’s technical readiness.',
          'Every provider builds its score differently, so two scores from two tools rarely '
            + 'compare. What matters is the method behind the number: which assistants were '
            + 'asked, which questions, how many runs, and who checked the matches. The method '
            + 'itself is laid out in [how to measure AI '
            + 'visibility](@measure-dealership-ai-visibility).',
          'A score is a starting point for the work in [AEO and GEO for car '
            + 'dealers](/aeo-geo-for-car-dealers/), where the goal is to fix what keeps '
            + 'assistants from reading and trusting your store, then measure again the same '
            + 'way.',
        ],
      },
      {
        type: 'qa',
        id: 'why-a-score-needs-a-margin',
        q: 'Why does a score need a margin?',
        a: [
          'Because the answers behind it change. Ask ChatGPT or Claude the same question '
            + 'three times and you can get three different sets of stores, and OpenAI warns '
            + 'that search results and citations can be incomplete, outdated or incorrect. A '
            + 'score built from sampled answers is an estimate, so an honest one shows its '
            + 'range.',
          'OpenAI’s help page puts the warning in one line: “Search results and citations '
            + 'can be incomplete, outdated, or incorrect” ([OpenAI Help '
            + 'Center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)). '
            + 'Add run-to-run variation and the way answers shift with a buyer’s location, and '
            + 'a single figure without a range overstates what anyone knows.',
          'Picture a franchise store in a mid-size market that scores 52 one month and 57 '
            + 'the next, each with a margin of several points. If the two ranges overlap, the '
            + 'honest reading is “about the same.” A vendor who celebrates the five points '
            + 'without showing the range is reading noise.',
        ],
      },
      {
        type: 'qa',
        id: 'good-ai-visibility-score',
        q: 'What is a good AI visibility score for a dealership?',
        a: [
          'There is no universal benchmark. A good score is one that beats the stores you '
            + 'compete with on the same questions and holds or rises against your own last '
            + 'month. A rural Chevrolet store and a metro used-car lot face different '
            + 'questions, different competitors and different sources, so their numbers never '
            + 'line up directly.',
          'Compare like with like. Run the same question set for your store and your three '
            + 'closest competitors, with the same number of runs, and read the gap. A 45 in a '
            + 'market where the leader scores 50 tells a different story from a 45 where the '
            + 'leader scores 80.',
          'Be wary of any industry average for AI visibility. Without the same questions, '
            + 'towns and runs behind every number in it, an average blends measurements that '
            + 'were never alike.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-a-score-cannot-tell-you',
        h2: 'What can a score not tell you?',
        intro:
          'A score cannot tell you what it did not test, what happens inside Google’s '
          + 'systems, or how many cars you will sell. It summarizes a sample of answers from '
          + 'specific assistants on specific days. Read it as a measurement of the past month, '
          + 'never as a forecast or a promise of what AI will say next.',
        items: [
          'Assistants it did not test. AutoLander’s free scan measures ChatGPT and Claude '
            + 'only. It does not measure Google AI Overviews, AI Mode, Gemini, Perplexity or '
            + 'Microsoft Copilot, so for Google’s AI features use [Search Console’s generative '
            + 'AI report](@search-console-ai-report-dealers).',
          'What happens inside Google. Google says “No third-party tool has access to our '
            + 'internal ranking or AI systems” ([Google Search '
            + 'Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). '
            + 'Every outside score, ours included, is built from what can be observed.',
          'Sales, leads or appointments. A score counts mentions and readiness. It does not '
            + 'count buyers, and a higher number is never a promise of more of them.',
          'What AI will say next month. No one can promise what an AI says. OpenAI states '
            + 'that placement is not guaranteed, and Bing says GEO “does not guarantee '
            + 'grounding or citations” ([OpenAI Help '
            + 'Center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), '
            + '[Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). '
            + 'Treat a vendor who ties a score to a promised result as a warning sign, since no '
            + 'one can deliver one; the other signs are in [AEO red '
            + 'flags](@aeo-agency-red-flags).',
        ],
      },
      {
        type: 'steps',
        h2: 'How is the free scan’s score built?',
        intro:
          'The free scan’s score comes from answers a person has checked. We ask ChatGPT and '
          + 'Claude, each with web search on, up to 20 local buyer questions, 3 times each, '
          + 'then combine how often you are named, the sources that cite you, your reviews and '
          + 'your site’s readiness into a score out of 100 with a margin.',
        steps: [
          {
            title: 'Questions for your town',
            body:
              'Up to 20 questions a buyer near you would ask, covering finding a dealer, '
              + 'specific cars, reputation and trade-ins, each naming your city or ZIP. If no '
              + 'cars can be found on your site, the car questions are skipped and the report '
              + 'says so.',
          },
          {
            title: 'Three runs per assistant',
            body:
              'Every question goes to ChatGPT and to Claude 3 times each with web search on, '
              + 'up to 120 answers in all, because answers change from run to run.',
          },
          {
            title: 'A person checks every match',
            body:
              'Someone on our team confirms each time your store is named, so the count '
              + 'reflects your store and only your store.',
          },
          {
            title: 'Your site’s front door',
            body:
              'We read your robots.txt, your homepage, your sitemap when needed and up to '
              + 'five vehicle pages. We check whether AI search crawlers are allowed, whether '
              + 'the security service in front of the site challenges automated visitors, and '
              + 'whether price, mileage and VIN are on the page as text.',
          },
          {
            title: 'The score, the margin and the 3 fixes',
            body:
              'The score out of 100 comes with its margin, next to who was named for each '
              + 'question and the sources each answer cited. The report ends with the 3 fixes we '
              + 'would make first, and a person walks you through it in 20 minutes.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'read-score-with-raw-answers',
        q: 'How should you read the score next to the raw answers?',
        a: [
          'Read the answers first and the score second. The answers show who was named '
            + 'instead of you, which sources they cited and what they got wrong about your '
            + 'store. The score folds all of that into one number, while the answers tell you '
            + 'what to fix and in what order.',
          'Work through three questions. Who was named instead, and for which questions? '
            + 'Which pages did the assistants cite, and are any of them yours, or sites where '
            + 'your store could be listed? What did the answers get wrong: hours, address, '
            + 'brands or a closed department? Each of those points to a specific fix.',
          'Hypothetically, a used-car store scores low on trade-in questions, and every '
            + 'answer cites the same two review sites where the store has no profile. The '
            + 'number says “low.” The answers say “claim those two profiles,” and that is the '
            + 'part you can act on this week.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-moves-a-score',
        h2: 'What moves a score over time?',
        intro:
          'The inputs a score measures can change: crawler access, consistent store facts, '
          + 'answered reviews and answer pages that assistants can quote. Fixing them improves '
          + 'what assistants can read about your store. Whether the number rises is still up to '
          + 'the assistants, and no one can promise a higher score.',
        items: [
          'Crawler access fixed. If AI search crawlers were blocked, opening robots.txt and '
            + 'the security service lets your pages be read again.',
          'Facts made consistent. The same name, address, phone and hours on every profile '
            + 'and listing gives assistants fewer reasons to doubt which store is yours.',
          'Reviews answered. Your reviews, and how you answer them, are part of what an '
            + 'assistant sees about your store.',
          'Answer pages live. Pages that answer one buyer question in the first sentence, '
            + 'using only your store’s facts, give assistants something clean to quote once '
            + 'they are indexed.',
          'Time. Most of this work is read over weeks and months, which [how long AEO '
            + 'takes](@how-long-does-aeo-take-to-work) lays out.',
          'What does not belong on the list: paid links without sponsored or nofollow tags '
            + 'and pages stuffed with repeated keywords, both covered in [Google’s spam '
            + 'policies](https://developers.google.com/search/docs/essentials/spam-policies), '
            + 'or rewards for reviews, which [Google '
            + 'prohibits](https://support.google.com/business/answer/3474122).',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro:
          'Checked September 30, 2026.',
        items: [
          '[OpenAI Help Center: Searching the web with '
            + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[Google Search Central: Optimizing your website for generative AI features on '
            + 'Google '
            + 'Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Microsoft Bing Webmaster '
            + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Google Search Central: spam '
            + 'policies](https://developers.google.com/search/docs/essentials/spam-policies)',
          '[Google Business Profile Help: review '
            + 'policies](https://support.google.com/business/answer/3474122)',
        ],
      },
    ],
    faq: [
      ['Is a free AI visibility score checker accurate?',
        'Only as accurate as its method. Ask which assistants it asked, how many questions '
        + 'and runs, whether web search was on, whether a person checked the matches and '
        + 'whether it shows a margin. A free checker that asks each question once and shows no '
        + 'range gives you a snapshot, with no way to tell signal from noise.'],
      ['Why did my score change when nothing changed at the store?',
        'Because the answers behind it vary from run to run, and competitors, review sites '
        + 'and the assistants themselves change every month. OpenAI warns that search results '
        + 'and citations can be incomplete, outdated or incorrect. Check whether the change is '
        + 'bigger than the margin before you read anything into it.'],
      ['Does a higher AI visibility score mean more sales?',
        'Not by itself. A score counts how often assistants name your store and how ready '
        + 'your site is; it never measures buyers, leads or sales, and no one can promise that '
        + 'a higher number brings more of them. Track leads and sales in your CRM and GA4, and '
        + 'read them next to the score.'],
      ['Which assistants go into the free scan’s score?',
        'ChatGPT and Claude, each with web search on, for up to 20 local buyer questions, 3 '
        + 'runs each. The free scan does not measure Google Gemini, AI Overviews, AI Mode, '
        + 'Perplexity or Microsoft Copilot, so its score says nothing about them.'],
    ],
    cta: {
      heading: 'See your own score, with its margin',
      sub:
        'Get a score out of 100 with its margin, plus who ChatGPT and Claude name for your '
        + 'local buyer questions and the sources they cite, checked by a person and walked '
        + 'through with you in 20 minutes.',
    },
  },
];
