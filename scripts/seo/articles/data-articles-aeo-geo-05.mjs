// AEO and GEO silo, batch 05: the "How each AI assistant picks a dealer" cluster (engines).
// Publish numbers 2, 11, 20, 29, 38: the ChatGPT pillar, Google AI Overviews, Claude, Google AI
// Mode and Ask Maps (Gemini in Google Maps). Spec: the 2026-09-30 silo plan.
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Link rules (Michael, 2026-09-30): in-body sibling links use ONLY the publish-aware token
// [anchor](@slug) and point ONLY to lower publish numbers, so publishing in order never leaves a
// dead link. Later siblings connect through alsoRelated, which the builder renders once live.
// Every article links the money page /aeo-geo-for-car-dealers/ with its planned anchor.
// Facts: every number or third-party claim comes from the silo fact bank, linked to its source.
// House style: no em or en dashes, no "is not X. It is Y." cadence, never a promised mention or
// placement, and the free scan checks ChatGPT and Claude only.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #2. /aeo-geo/how-chatgpt-recommends-car-dealerships/  (engines pillar)
  // ---------------------------------------------------------------------------
  {
    slug: 'how-chatgpt-recommends-car-dealerships',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 2,
    anchor: 'How ChatGPT decides which car dealerships to recommend',
    crumb: 'How ChatGPT recommends dealers',
    primaryKeyword: 'how does chatgpt recommend dealerships',
    secondaryKeywords: [
      'how to get your dealership recommended by chatgpt',
      'how does chatgpt choose its sources',
      'does chatgpt use google or bing',
      'chatgpt local search',
      'oai-searchbot',
    ],
    alsoRelated: [
      'how-car-buyers-use-chatgpt',
      'google-ai-overviews-for-car-dealers',
      'how-claude-cites-sources',
      'best-car-dealership-near-me-ai',
      'track-ai-traffic-ga4-dealership',
      'perplexity-for-car-dealerships',
    ],
    augmentKeys: ['aiDealers'],
    title: 'How ChatGPT Decides Which Car Dealerships to Recommend',
    description: 'How ChatGPT decides which car dealerships to recommend: web search, location, OAI-SearchBot, cited sources, and what OpenAI says about placement.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How ChatGPT decides which car dealerships to recommend',
    tldr: 'How does ChatGPT recommend dealerships? When a buyer asks a local question, ChatGPT can search the web, may use the buyer’s general location to localize the search, ranks what it finds on several factors meant to surface relevant, reliable information, and can cite the pages it used. [OpenAI’s help page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) says placement is not guaranteed, and no one outside OpenAI can sell or promise a spot in the answer. What a dealership controls is whether OAI-SearchBot can read its site, whether store and vehicle facts sit in plain page text, and whether every public source tells the same story about the store.',
    sections: [
      {
        type: 'qa',
        id: 'how-chatgpt-decides',
        q: 'How does ChatGPT decide which dealerships to recommend?',
        a: [
          'ChatGPT decides which dealerships to recommend by searching the web when a question needs current local information, ranking the results on multiple factors meant to find relevant, reliable sources, and citing the pages it used. [OpenAI’s help page on ChatGPT search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) does not list those factors, and it says placement is not guaranteed.',
          'Here is an illustrative case. A buyer in a mid-size metro types, “Which used truck dealers near me have a good reputation?” ChatGPT turns “near me” into a place, runs one or more searches, reads what comes back, and writes a short answer that names a few stores and shows its sources. Because the answer is assembled from a live search, it can reflect whatever public pages about stores in that market the search turns up that day, such as dealer websites, review pages, listing sites, local news and forum threads.',
          'The audience is why this matters to a store. OpenAI says ChatGPT has [1.2 billion weekly users](https://openai.com/index/devday-2026-recap/), and a [Pew Research Center survey](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/) of 5,119 US adults in February 2026 found 44% use ChatGPT, with searching for information as the top reason people use AI chatbots.',
          'Making a store easy for ChatGPT to find, read and trust is the core of [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/): an open door for its search crawler, store and vehicle facts on the page as text, and the same store details on every site it might cite. Nothing on that list buys a mention, and the rest of this guide sticks to what OpenAI itself documents.',
        ],
      },
      {
        type: 'qa',
        id: 'when-chatgpt-searches',
        q: 'When does ChatGPT search the web?',
        a: [
          'ChatGPT can search the web on its own when a question would benefit from current information, and it can use location information to find local results. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) web search works on the Free, Go, Plus, Pro, Business, Enterprise and Edu plans, and people who are not signed in can use it too.',
          'Local car-buying questions are the kind that call for current information: which stores carry a model, who is open on Sunday, which dealer people trust for service. So when your buyer asks one, the answer is likely to be built from what ChatGPT finds on the web that day.',
          'Two practical consequences follow. First, the buyer needs no account and no paid plan to get a sourced, local answer, so the audience is anyone with a browser or the app. Second, a change you make on the web, such as opening your site to OpenAI’s search crawler or fixing wrong hours on a directory, can reach answers without waiting for a new version of the model.',
        ],
      },
      {
        type: 'qa',
        id: 'buyer-location',
        q: 'How does ChatGPT know where the buyer is?',
        a: [
          'ChatGPT may estimate a buyer’s general location from their IP address and share that general area with search providers to localize results. [OpenAI’s example](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) rewrites “good restaurants near me” into “top restaurants San Francisco.” Sharing precise device location is optional and off by default, so unless a buyer turns it on, the search works from an approximate area.',
          'For a dealer, “near me” becomes a place name. If your store sits in a suburb 15 miles from the city your metro is named after, the rewritten search can use the big city, your town, or both. Your site should say in plain sentences where you are and which nearby communities you serve, for example: “We are on Route 9 in Riverton, about 20 minutes from downtown Springfield.”',
          'Keep it honest and short: one clear sentence on your homepage, contact page and vehicle pages. A block of 40 town names pasted into the footer helps no reader and gives a search nothing it can quote.',
        ],
      },
      {
        type: 'qa',
        id: 'google-or-bing',
        q: 'Does ChatGPT use Google or Bing?',
        a: [
          '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) ChatGPT search sometimes partners with other search providers, rewriting the buyer’s question into targeted queries sent to them, and its help page links the privacy statements of Microsoft and Shopify. OpenAI does not publish a complete list of providers, so treat any claim that ChatGPT simply uses one engine as unproven.',
          'Plenty of marketing pages state it as settled fact anyway. For a dealership the question matters less than it seems, because you cannot optimize for an index nobody will name. What holds no matter which provider supplies the results is the page itself: whether a crawler can reach it, whether its facts load as text, and whether it answers the question the buyer asked. Pages that are crawlable, indexed and clearly written are the raw material every search system works from.',
        ],
      },
      {
        type: 'bullets',
        id: 'oai-searchbot',
        h2: 'What does OAI-SearchBot need from your website?',
        intro: 'OAI-SearchBot is the crawler OpenAI uses to surface websites in ChatGPT search. OpenAI says a site must allow it to crawl and must make sure its host or CDN lets traffic through from OpenAI’s published search bot IP addresses. The points below decide whether ChatGPT can read a dealer site at all.',
        items: [
          'Allow it in robots.txt. [OpenAI’s help page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) makes crawl access the condition for inclusion in ChatGPT search results, and its [publisher FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) says any public website can appear in ChatGPT search and tells site owners to make sure they are not blocking OAI-SearchBot.',
          'Let it through the security layer. Many dealer websites sit behind a CDN or bot-protection service that challenges automated visitors. Ask your website vendor to confirm in writing that OpenAI’s search bot IP ranges are allowed, because a robots.txt that says yes does nothing if the firewall says no.',
          'Expect about a day. [OpenAI’s crawler overview](https://developers.openai.com/api/docs/bots) says OAI-SearchBot is used to surface websites in search, is not used for training, respects robots.txt, and reflects a robots.txt change in about 24 hours.',
          'Decide on GPTBot separately. GPTBot collects content that may be used to train OpenAI’s models, and disallowing it signals that your content should stay out of training. OpenAI treats it as separate from OAI-SearchBot, so a store can block training and still allow search.',
          'Know what ChatGPT-User does. It fetches pages for actions a ChatGPT user starts, and OpenAI says robots.txt rules may not apply to it because a person asked for the page. Search visibility is managed through OAI-SearchBot.',
          'Put facts where a crawler can see them. A [2024 analysis by Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler) of traffic on its network found that OpenAI’s crawlers, OAI-SearchBot included, did not render JavaScript at the time, so prices and VINs that only appear after scripts run may never be read.',
          'Not sure where your site stands? Start with the walkthrough to [test whether AI crawlers can read your site](@can-chatgpt-see-my-dealer-website), which covers robots.txt, the firewall or CDN, JavaScript and what to send your website vendor.',
        ],
      },
      {
        type: 'qa',
        id: 'chatgpt-sources',
        q: 'Which sources does ChatGPT cite about dealers?',
        a: [
          'ChatGPT answers that use web search may include citations, and a Sources view lists the pages it cited plus other relevant links. [OpenAI](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) does not say which kinds of sites it favors for dealer questions, and it warns that search results and citations can be incomplete, outdated or incorrect.',
          'That sources list is the most useful part of a ChatGPT answer for a dealer. It shows which pages shaped the recommendation: your own site, a review page, your profile on a listing site, a local news story, a forum thread, or a competitor’s page. If a cited page is wrong about you, with old hours or a location you closed, fix it at the source, because that page can keep feeding answers until it changes.',
          'Answers change from run to run, so one check proves little. Our [free scan](/aeo-geo-for-car-dealers/#scan-form) asks ChatGPT and Claude, each with web search on, up to 20 questions a local buyer would ask, 3 times each, and lists the sources behind every answer, so you can see which sites the assistants lean on in your market.',
        ],
      },
      {
        type: 'callout',
        title: 'What OpenAI does not publish',
        body: 'OpenAI documents its crawlers, how it handles location and how citations appear. It does not publish its ranking factors, a full list of its search providers, or any list of sources it prefers for local businesses. Be wary of anyone who claims to know them, and of any offer that promises a spot in ChatGPT’s answers: OpenAI itself says placement is not guaranteed, so no one can deliver one.',
      },
      {
        type: 'steps',
        h2: 'How can a dealership become easier for ChatGPT to recommend?',
        intro: 'A dealership becomes easier for ChatGPT to recommend by removing the reasons to skip it: a crawler that cannot get in, facts hidden in images or scripts, store details that disagree from site to site, and buyer questions nobody has answered. None of these steps buys placement, and every one is under your control.',
        steps: [
          {
            title: 'Open the door to OAI-SearchBot',
            body: 'Check robots.txt and your CDN or bot-protection settings with your website vendor, and get the answer in writing. Allow OAI-SearchBot even if you decide to block GPTBot for training.',
          },
          {
            title: 'Put the facts in page text',
            body: 'Price, mileage, VIN, trim, hours, address and the brands you sell should be readable text in the page itself, not only inside photos, PDFs or widgets that load after the page opens.',
          },
          {
            title: 'Make your store details match everywhere',
            body: 'Use the same name, address, phone and hours on your website, Google Business Profile, Bing Places, Apple Business Connect, Yelp, Facebook and your listing-site profiles. When sources agree, an assistant has less reason to doubt which store it is describing.',
          },
          {
            title: 'Earn reviews and answer them',
            body: 'Ask every sold customer for a review with one neutral request, never with incentives and never only the happy ones, and reply to reviews in plain, specific words. Reviews and replies are public text that any search can find.',
          },
          {
            title: 'Publish answer pages',
            body: 'Write pages on your own site that each answer one buyer question in the first sentence, using only your store’s facts: how a trade-in works when you still owe money, what a first-time buyer needs for financing, when the service lane opens.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'track-chatgpt-visits',
        q: 'How do you track visits from ChatGPT?',
        a: [
          'ChatGPT adds utm_source=chatgpt.com to the links it sends people through, according to [OpenAI’s publisher FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq), so those visits show up under that source in Google Analytics and most other analytics tools. Filter your reports by that source to see which pages buyers land on and what they do next.',
          'Google Analytics 4 also added an AI Assistant channel in May 2026, and [Google’s announcement](https://support.google.com/analytics/answer/9164320) names ChatGPT, Gemini and Claude as examples, so referrals from AI assistants can be grouped in one place.',
          'Visit counts tell only part of the story. A buyer who reads a ChatGPT answer that names your store and then searches your name on Google arrives as a search visit, or calls without visiting at all. Pair the traffic numbers with a regular check of what ChatGPT actually says when your buyers ask.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI Help Center: Publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[OpenAI: Our approach to advertising and expanding access, January 16, 2026](https://openai.com/index/our-approach-to-advertising-and-expanding-access/)',
          '[OpenAI: DevDay 2026 recap, September 29, 2026](https://openai.com/index/devday-2026-recap/)',
          '[Pew Research Center: Americans and AI 2026, June 17, 2026](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/)',
          '[Vercel: The rise of the AI crawler, December 17, 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)',
          '[Google Analytics Help: What’s new in Google Analytics](https://support.google.com/analytics/answer/9164320)',
        ],
      },
    ],
    faq: [
      ['Can I pay ChatGPT to recommend my dealership?',
        'No. OpenAI’s [ads principles](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) say ads do not influence the answers ChatGPT gives, and that ads are always separate and clearly labeled. OpenAI also says placement in its search results is not guaranteed, so no one can sell you a spot inside the answer.'],
      ['How long does a robots.txt change take to reach ChatGPT?',
        'About 24 hours, according to [OpenAI’s crawler overview](https://developers.openai.com/api/docs/bots). That covers OAI-SearchBot picking up the new rule. Whether and when your pages then show up in answers depends on the questions buyers ask and what else the search finds, and OpenAI publishes no timeline for that.'],
      ['Does ChatGPT search work without logging in?',
        'Yes. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) people who are not signed in can use web search, and it is available on the Free, Go, Plus, Pro, Business, Enterprise and Edu plans. A buyer needs no account to get a local dealer answer with sources.'],
      ['Why does ChatGPT recommend a competitor instead of my store?',
        'There is no published answer, because OpenAI does not list its ranking factors. The practical way to find out is to read the sources under the answer: they show which pages the search found and trusted for that question. Then check the basics on your side, starting with whether OAI-SearchBot can reach your site and whether your facts are on the page as text.'],
    ],
    cta: {
      heading: 'Ask ChatGPT what your buyers ask',
      sub: 'The free scan puts up to 20 local buyer questions to ChatGPT and Claude, 3 times each with web search on, and shows who gets named, the sources behind each answer and the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // #11. /aeo-geo/google-ai-overviews-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'google-ai-overviews-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 11,
    anchor: 'Google AI Overviews for car dealers: when they show and who gets cited',
    crumb: 'Google AI Overviews',
    primaryKeyword: 'google ai overviews car dealership',
    secondaryKeywords: [
      'how to show up in ai overviews as a car dealer',
      'how to rank in google ai overviews',
      'ai overview citations dealership',
      'opt out of ai overviews',
    ],
    alsoRelated: [
      'google-ai-mode-for-car-dealers',
      'search-console-ai-report-dealers',
      'is-seo-dead-for-car-dealers',
      'ask-maps-for-car-dealers',
      'model-comparison-pages-for-dealers',
    ],
    augmentKeys: [],
    title: 'Google AI Overviews for Car Dealers: Who Gets Cited',
    description: 'How Google AI Overviews work for car dealers: when they appear, how Google picks the pages it cites, and what a dealership can and can’t control.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Google AI Overviews and car dealerships: when they show and whose pages get cited',
    tldr: 'Google AI Overviews are the AI summaries Google shows in its results for some searches, and for a car dealership the pages they cite come out of the same index and quality systems as ordinary search. [Google says](https://developers.google.com/search/docs/appearance/ai-features) there are no extra requirements or AI-only markup: a page has to be indexed and eligible for a snippet, and Google’s guide says [unique, first-hand content](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) is likely to matter most. In [Pew Research Center’s March 2025 data](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/), the summaries showed up most on question-style and long searches, and people clicked a link inside them on just 1% of visits.',
    sections: [
      {
        type: 'qa',
        id: 'how-ai-overviews-pick-pages',
        q: 'How do Google AI Overviews pick the pages they cite?',
        a: [
          'Google AI Overviews pick pages through Google’s core ranking systems, which retrieve relevant, up-to-date pages from the Search index; the model then reviews them and shows prominent, clickable links to supporting pages. [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says these features are rooted in the same ranking and quality systems as regular results.',
          '[Google also says](https://developers.google.com/search/docs/appearance/ai-features) AI Overviews may use a technique it calls query fan-out, running several related searches across subtopics and data sources to build one answer, which lets them show a wider set of links than a classic results page. So a dealer page may not need to rank first for the buyer’s exact words to be cited; it needs to be a strong answer to one of the pieces.',
          'Chat assistants take a different road. ChatGPT runs its own web search and cites what it finds, which we cover in [what ChatGPT looks at before it recommends a store](@how-chatgpt-recommends-car-dealerships). The overlap is large, though: crawlable pages, facts in plain text and content only your store could write help on both, and getting a dealership read and trusted across Google and the chat assistants is the work of [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/).',
        ],
      },
      {
        type: 'bullets',
        id: 'eligibility',
        h2: 'What does a page need to be eligible for AI Overviews?',
        intro: 'To be eligible for AI Overviews, Google says a page must be indexed and eligible to show in Google Search with a snippet, and the site must be included in the Search generative AI features setting in Search Console, which is on by default. Everything past that is ordinary technical SEO and useful content.',
        items: [
          'Indexed. The page has to be in Google’s index, per [Google’s AI features documentation](https://developers.google.com/search/docs/appearance/ai-features). For a dealer site, check that vehicle pages, service pages and model research pages are indexed, along with the homepage.',
          'Snippet-eligible. A nosnippet tag, or a max-snippet setting of zero, keeps a page’s text out of snippets, and Google uses those same preview controls for its AI features.',
          'Included in Search generative AI features. [Google’s guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) makes inclusion a condition, and [Search Console Help](https://support.google.com/webmasters/answer/16908024) says it is the default control for all properties unless an owner opts the site out.',
          'Crawlable by Googlebot. A CDN or bot-protection rule that challenges Googlebot can keep pages out of the index, and therefore out of AI Overviews as well.',
          'Worth retrieving. Google says its core ranking and quality systems do the retrieving, so thin, duplicated vehicle descriptions start at a disadvantage against a page with real detail.',
          'No certainty either way. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) indexing and serving aren’t guaranteed even when a page meets every requirement, and no one outside Google can change that.',
        ],
      },
      {
        type: 'qa',
        id: 'special-optimizations',
        q: 'Are there special optimizations for AI Overviews?',
        a: [
          'No. [Google says](https://developers.google.com/search/docs/appearance/ai-features) there are no additional requirements or special optimizations needed to appear in AI Overviews or AI Mode, and site owners do not need new machine-readable files, AI text files or special markup. [Structured data isn’t required](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) for generative AI search either, though it still matters for rich results.',
          'That should change how a dealer hears some sales pitches. An “AI Overviews package” built around an llms.txt file or special schema is selling something Google says its Search does without: [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) Google Search does not use llms.txt, and it warns that no third-party tool has access to its internal ranking or AI systems.',
          'What Google does ask for is familiar: pages its crawler can reach, text that answers the question, and content people find useful. Schema.org markup such as AutoDealer on your site and vehicle offers on each vehicle page is still worth having, since [Google says](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) it uses structured data to understand what a page is about. Just make sure nobody sells it to you as a ticket into the AI summary.',
        ],
      },
      {
        type: 'qa',
        id: 'which-searches-trigger',
        q: 'Which searches trigger AI Overviews?',
        a: [
          '[Pew Research Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) analyzed browsing data from 900 US adults and found that about 18% of their Google searches in March 2025 produced an AI summary. The share rose to 60% for searches phrased as questions and 53% for searches of ten or more words. We found no public source that gives the rate for car-shopping searches.',
          'The pattern points a dealer toward research questions more than store names. Questions like “How does a trade-in work if I still owe money on my car?” or “Is a hybrid worth it for a 40-mile commute?” are long and phrased as questions, the kind Pew found most likely to get a summary. Your sales, finance and service teams answer those every day, which makes them good raw material for pages Google can cite.',
          'The audience is large. At Google I/O in May 2026, [Sundar Pichai said](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/) AI Overviews has over 2.5 billion monthly active users, a figure Google reports about its own product.',
        ],
      },
      {
        type: 'qa',
        id: 'do-shoppers-click',
        q: 'Do shoppers click the links in AI Overviews?',
        a: [
          'Rarely, in Pew’s data. [Pew Research Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) found users clicked a link inside the AI summary on just 1% of visits, and clicked a traditional result on 8% of visits with a summary versus 15% without one. [Google says](https://developers.google.com/search/docs/appearance/ai-features) clicks from pages with AI Overviews are higher quality, with visitors more likely to stay longer.',
          'Pew also found people ended their browsing session on 26% of pages with an AI summary, compared with 16% of pages without one. Put together, a citation in an AI Overview works partly as exposure: a buyer may read your service explainer inside the summary and then call, or search your name later, without ever clicking the link.',
          'So judge the work on more than clicks. Watch calls, direct visits and searches for your store’s name alongside Search Console, and read the Pew figures for what they are: a March 2025 sample of 900 adults across every kind of search, rather than a measure of car shoppers.',
        ],
      },
      {
        type: 'bullets',
        id: 'opt-out',
        h2: 'Can a dealership keep its pages out of AI Overviews?',
        intro: 'Yes. Google says the controls for how a page appears in its AI features are the normal Search preview controls, and Search Console now offers a setting that excludes a whole site from its generative AI features. Most preview controls also change how a page shows in regular results, so use them with care.',
        items: [
          'nosnippet keeps a page’s text out of search snippets and out of AI Overviews, and it also blanks the snippet under the page’s regular listing. Use it rarely.',
          'data-nosnippet marks one part of a page, such as a legal disclaimer or a payment calculator’s fine print, as off-limits while the rest of the page stays eligible.',
          'max-snippet caps how many characters Google may show from the page.',
          'noindex removes the page from Google Search entirely, AI features included. [Google’s AI features documentation](https://developers.google.com/search/docs/appearance/ai-features) lists all four controls.',
          'The Search Console setting that excludes your site’s links and content from Search generative AI features covers AI Overviews, AI Mode and generative AI features in Discover. [Search Console Help](https://support.google.com/webmasters/answer/16908024) says exclusion generally takes a few days and does not affect AI training.',
          'Google-Extended is a different lever. [Google says](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) this robots.txt token controls whether your content may train Gemini models and ground answers in Gemini Apps and Vertex AI, and that it does not affect inclusion in Google Search, which is where AI Overviews live.',
          'For most dealers the better choice is to stay included, since AI Overviews answer exactly the research questions a store wants to be the source for.',
        ],
      },
      {
        type: 'qa',
        id: 'dealer-content-ai-overviews',
        q: 'What kind of dealer content do AI Overviews use?',
        a: [
          '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) unique, non-commodity content is likely to influence presence in its generative AI features more than any other suggestion in its guide, and it names first-hand experience as the model. For a dealership, that means pages only your store could write, drawn from your lot, your service lane and your customers’ real questions.',
          'Google’s own example of commodity content is a post called “7 Tips for First-Time Homebuyers,” and it warns against recycling what others have already said. The dealer version is a “10 tips for buying a used car” article that could sit on any site. First-hand versions look different. A store might explain how its techs inspect a trade before appraisal, compare two midsize trucks it stocks with real towing notes, or state how long a typical brake job takes in its service department and whether loaners are available.',
          'The format that fits is one buyer question per page, answered in the first sentence and backed by your own facts. Our guide to [answer pages for car dealerships](@answer-pages-for-car-dealerships) shows how to write one, and model comparisons and service answers follow the same pattern.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-overviews-impressions',
        q: 'How do you see AI Overviews impressions?',
        a: [
          'Search Console’s generative AI performance report shows organic impressions from AI Overviews and AI Mode over time, filterable by page, country, date and device, and [Google says](https://support.google.com/webmasters/answer/16984139) it reached all websites worldwide by August 31, 2026. The regular Performance report also counts this traffic, mixed into the Web search type totals.',
          'The generative AI report is built on impressions and needs enough of them to show data, so a single rooftop may see little at first. Look at which pages appear: service explainers and model research pages are the ones most likely to match the long, question-style searches where Pew found summaries most often.',
          'For the full picture, including the chat assistants Google’s tools cannot see, read [how to measure AI visibility](@measure-dealership-ai-visibility). Our free scan does not measure AI Overviews; it asks ChatGPT and Claude your buyers’ questions, and its crawler and vehicle-page fixes are the same basics Google’s guidance asks for.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[Google Search Central: Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Search Console Help: the Search generative AI features setting](https://support.google.com/webmasters/answer/16908024)',
          '[Search Console Help: the generative AI performance report](https://support.google.com/webmasters/answer/16984139)',
          '[Google Search Central: Google’s common crawlers, including Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)',
          '[Google Search Central: Introduction to structured data markup](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)',
          '[Pew Research Center: Google users are less likely to click on links when an AI summary appears, July 22, 2025](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)',
          '[Google: Sundar Pichai at Google I/O 2026, May 19, 2026](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)',
        ],
      },
    ],
    faq: [
      ['Does blocking Google-Extended remove my site from AI Overviews?',
        'No. [Google says](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) Google-Extended controls whether content it crawls may be used to train future Gemini models and to ground answers in Gemini Apps and Vertex AI, and that it does not affect a site’s inclusion in Google Search. AI Overviews are part of Search, so the preview controls and the Search Console setting are the levers there.'],
      ['Do I need schema markup to show in AI Overviews?',
        'No. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) structured data isn’t required for generative AI search and there is no special schema.org markup to add. AutoDealer and vehicle markup can still help machines read your pages, and on its own it will not get a page cited.'],
      ['Can AI Overviews show my dealership’s hours or address?',
        'They can. [Google '
        + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) AI '
        + 'responses can include information about local businesses and that Business Profiles can help '
        + 'businesses show up in them. Keep hours and address current on the profile and the website '
        + 'alike, and check what AI Overviews say about your store now and then, since Google tells '
        + 'searchers they can make mistakes.'],
      ['Why doesn’t the free scan measure Google AI Overviews?',
        'The free scan checks ChatGPT and Claude only, each with web search on, and it does not measure Google AI Overviews, AI Mode or Gemini. Google’s own generative AI report in Search Console shows your impressions there. The fixes the scan finds, such as crawler access and prices and VINs as page text, are basics Google’s guidance asks for too.'],
    ],
    cta: {
      heading: 'See what ChatGPT and Claude say about your store',
      sub: 'The free scan does not measure AI Overviews. It asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and its crawler and page fixes are the same basics Google’s guidance asks for.',
    },
  },

  // ---------------------------------------------------------------------------
  // #20. /aeo-geo/how-claude-cites-sources/
  // ---------------------------------------------------------------------------
  {
    slug: 'how-claude-cites-sources',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 20,
    anchor: 'How Claude finds and cites dealerships in its answers',
    crumb: 'How Claude cites sources',
    primaryKeyword: 'how claude cites local businesses',
    secondaryKeywords: [
      'claude web search for local businesses',
      'how to get cited by claude',
      'claude-searchbot',
      'claudebot vs claude-user',
    ],
    alsoRelated: [
      'should-dealers-block-ai-crawlers',
      'perplexity-for-car-dealerships',
      'ai-visibility-score-explained',
      'bing-places-for-car-dealers',
    ],
    augmentKeys: [],
    title: 'How Claude Finds and Cites Dealerships in Its Answers',
    description: 'How Claude searches the web and cites sources, what ClaudeBot, Claude-User and Claude-SearchBot do, and how a dealership stays readable to Claude.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How Claude answers local car-buying questions and which sources it cites',
    tldr: 'How does Claude pick and cite local businesses such as dealerships? When Claude searches the web, [Anthropic says](https://claude.com/blog/web-search) it gives direct citations so users can check the sources behind an answer. For a dealership, becoming one of those sources starts with two of Anthropic’s three bots, Claude-SearchBot and Claude-User, being able to reach your site, and with your store’s facts sitting in plain page text. Anthropic does not document which search index Claude uses, so the parts you control are access and content.',
    sections: [
      {
        type: 'qa',
        id: 'how-claude-cites',
        q: 'How does Claude pick and cite sources for local businesses?',
        a: [
          'Claude picks sources for a local question by searching the web, and it gives direct citations in its answer so users can open the pages and check the facts. [Anthropic launched web search](https://claude.com/blog/web-search) in preview for paid US users on March 20, 2025, and made it available on all Claude plans worldwide with an update on May 27, 2025.',
          'For a car buyer, that means a question such as “Which dealers near me are good for a used truck?” can come back with store names and the pages behind them: dealer websites, review pages, listing sites, local news. Each citation is a page Claude’s search could reach and read, which is the part of the process a dealership can influence.',
          'In outline the mechanics resemble ChatGPT’s, with different bots and different documentation; our guide to [how ChatGPT recommends dealerships](@how-chatgpt-recommends-car-dealerships) covers OpenAI’s side. Getting a store read, trusted and cited by both is what [generative engine optimization for dealers](/aeo-geo-for-car-dealers/) is about.',
        ],
      },
      {
        type: 'table',
        id: 'anthropic-bots',
        h2: 'Which Anthropic bots visit your website?',
        intro: 'Anthropic runs three bots, and each does a different job. ClaudeBot gathers content that may be used to train models, Claude-User fetches pages when a person asks Claude something, and Claude-SearchBot crawls to improve search results. Anthropic says blocking either of the last two reduces a site’s visibility in Claude.',
        head: ['Bot', 'What Anthropic says it does', 'If your site blocks it', 'Sensible dealer setting'],
        rows: [
          ['ClaudeBot', 'Collects web content that may be used to train Anthropic’s models', 'Signals that your content should be excluded from future training', 'Your call; Anthropic ties it to training'],
          ['Claude-User', 'Fetches pages when Claude users ask questions', 'Claude cannot retrieve your pages for those questions, which reduces visibility', 'Allow'],
          ['Claude-SearchBot', 'Crawls the web to improve search result quality for users', 'Your pages cannot be indexed for search, which reduces visibility in results', 'Allow'],
        ],
        note: 'Descriptions paraphrase Anthropic’s Claude Help Center article on its crawlers, dated April 7, 2026.',
      },
      {
        type: 'qa',
        id: 'blocking-claude-bots',
        q: 'What happens if your site blocks Claude-SearchBot or Claude-User?',
        a: [
          'If your site blocks Claude-SearchBot, [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) your pages cannot be indexed for Claude’s search, and if it blocks Claude-User, Claude cannot fetch them when a user asks. Either block reduces your visibility in Claude’s answers. Blocking ClaudeBot only signals that your content should stay out of future training.',
          'Blocks like these can arrive by accident. A robots.txt written years ago to allow only Googlebot, a security plugin with a single switch for every AI bot, or a CDN bot rule nobody revisited can shut Claude out without anyone at the store deciding to. In an illustrative case, a franchise store whose website vendor added a blanket AI-bot block during a redesign may still carry it long after the reason is forgotten.',
          'A store that wants to stay out of training but stay findable can disallow ClaudeBot and leave Claude-SearchBot and Claude-User allowed. To test your own setup, follow the steps to [check whether AI search bots can open your site](@can-chatgpt-see-my-dealer-website).',
        ],
      },
      {
        type: 'qa',
        id: 'claude-robots-txt',
        q: 'Does Claude honor robots.txt?',
        a: [
          'Yes. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) its bots honor robots.txt directives and support the Crawl-delay extension, which asks a crawler to slow down between requests. It also warns that blocking its bots by IP address may not work correctly, so robots.txt is the reliable way to allow or restrict them.',
          'If your website vendor manages robots.txt for hundreds of dealer sites, ask for the exact lines that apply to ClaudeBot, Claude-User and Claude-SearchBot on your site, in writing. A large inventory site worried about server load can set a Crawl-delay instead of a block.',
          'Also ask what the security layer in front of the site does with automated visitors. Because Anthropic says IP-based blocking may not work correctly, a firewall rule built on IP lists is a shaky way to manage its bots. Let robots.txt carry the decision, and make sure no firewall rule quietly overrides it.',
        ],
      },
      {
        type: 'qa',
        id: 'claude-search-engine',
        q: 'Which search engine does Claude use?',
        a: [
          'Anthropic does not document which search engine or index Claude’s web search relies on, and third-party guesses are no substitute for a statement from Anthropic. What Anthropic does document is its own search crawler, Claude-SearchBot, and the fetcher Claude-User, so the parts a dealership controls are access for those bots and the text on its pages.',
          'You will find confident claims online that Claude runs on one particular search engine. Treat them as guesses until Anthropic says otherwise, and do not build a plan around them.',
          'Good standing in the major search engines is worth keeping anyway, because the same crawlable, clearly written pages serve every system that reads the web. Google documents far more about its AI features than Anthropic does, and [how Google AI Overviews cite dealer pages](@google-ai-overviews-for-car-dealers) covers what it asks of a page.',
        ],
      },
      {
        type: 'qa',
        id: 'how-many-use-claude',
        q: 'How many people use Claude?',
        a: [
          'In a [Pew Research Center survey](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/) of 5,119 US adults in February 2026, 6% said they use Claude, compared with 44% for ChatGPT, 24% for Gemini and 17% for Microsoft Copilot. About half of US adults (49%) use AI chatbots of some kind, and searching for information was the top use.',
          'So Claude reaches a smaller share of US adults than ChatGPT does. It still earns a place on a dealer’s list, because the work that makes a store readable to Claude is the same work that helps with every other assistant: open doors for search crawlers, facts in page text, and consistent store details across the web.',
          'Our [free scan](/aeo-geo-for-car-dealers/#scan-form) checks both ChatGPT and Claude, each with web search on, because both are assistants US buyers use and both show the sources behind their answers.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-claude-needs',
        h2: 'What does Claude need to cite your dealership?',
        intro: 'Claude needs to be able to reach your pages, read your facts as text, and find the same store details wherever its search lands. None of this forces a citation, since Anthropic does not publish how Claude picks sources, but each item removes a reason for Claude to pass over your store.',
        items: [
          'Claude-SearchBot and Claude-User allowed in robots.txt, and not challenged by the CDN or bot filter in front of your site.',
          'Facts in the page text. A [2024 analysis by Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler) of traffic on its network found that Anthropic’s ClaudeBot, like the other major AI crawlers it tracked, did not render JavaScript at the time. Price, mileage, VIN, hours and address that only appear after scripts run may be invisible to a crawler like that.',
          'Clear store facts on every page: the store’s real-world name, street address, phone, sales and service hours, and the brands you sell, written in sentences a reader could quote.',
          'The same details everywhere a search might land: your Google Business Profile, Bing Places, Apple Business Connect, Yelp, DealerRater and your listing-site profiles.',
          'Answers to real buyer questions on your own site, each one leading with a direct answer: trade-in steps, financing for first-time buyers, service hours, which trims you keep in stock.',
          'Reviews you answer. Replies are public text too, and a specific reply shows a store that pays attention.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Anthropic, Claude Help Center: Does Anthropic crawl data from the web, and how can site owners block the crawler?](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Anthropic: Claude can now search the web, March 20, 2025, updated May 27, 2025](https://claude.com/blog/web-search)',
          '[Pew Research Center: Americans and AI 2026, June 17, 2026](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/)',
          '[Vercel: The rise of the AI crawler, December 17, 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)',
        ],
      },
    ],
    faq: [
      ['Should my dealership block ClaudeBot?',
        'That depends on how you feel about AI training. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) blocking ClaudeBot signals that your content should be excluded from future training, and it describes Claude-SearchBot and Claude-User as the bots tied to search and retrieval. Whatever you decide about ClaudeBot, keep those two allowed, since Anthropic says blocking them reduces visibility.'],
      ['Do I need separate pages written for Claude?',
        'No. Nothing Anthropic publishes asks for special content. The same crawlable pages, facts in '
        + 'plain text and consistent store details that help every assistant are what Claude’s search '
        + 'can read and cite, as long as Claude-SearchBot and Claude-User can reach them.'],
      ['Can Claude read vehicle pages built with JavaScript?',
        'Plan as if it cannot. A [2024 Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler) found that ClaudeBot did not render JavaScript at the time, and we have found no Anthropic statement saying its bots render it now. Put price, mileage, VIN and store details in the HTML your server sends, and check by viewing the page source.'],
      ['Does the free scan check Claude?',
        'Yes. The free scan asks Claude and ChatGPT, each with web search on, up to 20 questions a local buyer would ask, 3 times each. It reports who gets named, the sources each answer cited, whether AI crawlers can reach your site, whether up to five vehicle pages show price, mileage and VIN as text, a score out of 100 with a margin and the 3 fixes to make first, and a person walks you through it in 20 minutes.'],
    ],
    cta: {
      heading: 'Find out whether Claude names your store',
      sub: 'The free scan asks Claude and ChatGPT, web search on, what your buyers ask, 3 times each, and shows the sources behind every answer.',
    },
  },

  // ---------------------------------------------------------------------------
  // #29. /aeo-geo/google-ai-mode-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'google-ai-mode-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 29,
    anchor: 'Google AI Mode for car dealers: query fan-out and your pages',
    crumb: 'Google AI Mode',
    primaryKeyword: 'google ai mode car dealers',
    secondaryKeywords: [
      'what is ai mode',
      'query fan-out',
      'ai mode vs ai overviews',
      'ai mode local results',
    ],
    alsoRelated: [
      'ask-maps-for-car-dealers',
      'model-comparison-pages-for-dealers',
      'track-ai-traffic-ga4-dealership',
      'car-dealership-faq-page',
      'questions-car-buyers-ask-ai',
    ],
    augmentKeys: [],
    title: 'Google AI Mode for Car Dealers: Fan-Out and Your Pages',
    description: 'Google AI Mode for car dealers: how query fan-out works, why AI Mode questions run longer, and how dealer pages should answer the sub-questions.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Google AI Mode for car dealers: query fan-out and what it means for your pages',
    tldr: 'Google AI Mode is the conversational search mode [Google began rolling out](https://blog.google/products/search/google-search-ai-mode-update/) to everyone in the US on May 20, 2025; it breaks a question into subtopics and runs many related searches at once, a technique Google calls query fan-out. For car dealers, one buyer question can pull in pages about trims, safety, price and nearby stock, so a strong page answers the real sub-questions in plain text. [Google warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) against making a separate page for every variation, which it treats as scaled content abuse.',
    sections: [
      {
        type: 'qa',
        id: 'what-is-ai-mode',
        q: 'What is Google AI Mode?',
        a: [
          'Google AI Mode is a conversational search mode inside Google Search that [began rolling out](https://blog.google/products/search/google-search-ai-mode-update/) to everyone in the US on May 20, 2025. Google describes it as breaking a question into subtopics and issuing many searches at once, then answering in a back-and-forth conversation instead of a list of ten links.',
          'It has grown fast by Google’s own account. At Google I/O in May 2026, [Sundar Pichai said](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/) AI Mode passed 1 billion monthly active users within a year of launch, a figure Google reports about its own product.',
          'For a buyer it feels a lot like a chat assistant, and the dealer’s problem is the same: whether your store shows up depends on what the system can find and trust. Our guide to [how ChatGPT chooses a dealership](@how-chatgpt-recommends-car-dealerships) covers the chat side, and covering both kinds of surface is the work of [generative engine optimization for dealers](/aeo-geo-for-car-dealers/).',
        ],
      },
      {
        type: 'qa',
        id: 'ai-mode-vs-ai-overviews',
        q: 'How is AI Mode different from AI Overviews?',
        a: [
          'AI Overviews appear on the normal results page for some searches, while AI Mode is its own conversation where the buyer can keep asking follow-ups. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) both are grounded in its Search index through its core ranking systems, and neither has additional requirements beyond being indexed and eligible for a snippet.',
          'The page-level rules are the same, which is why this guide builds on [how AI Overviews choose the pages they cite](@google-ai-overviews-for-car-dealers). [Google’s documentation](https://developers.google.com/search/docs/appearance/ai-features) covers both features on one page and says there are no special optimizations for either.',
          'What changes in AI Mode is the length and depth of the questions, and that is where query fan-out starts to matter for a dealer’s pages.',
        ],
      },
      {
        type: 'qa',
        id: 'query-fan-out',
        q: 'What is query fan-out, in dealer terms?',
        a: [
          'Query fan-out is Google’s term for a set of concurrent, related queries the model generates to fetch more results for one question. [Google’s own example](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) turns a question about fixing a weedy lawn into searches such as “best herbicides for lawns.” For a dealer, it means one buyer question becomes several smaller searches.',
          'Here is an illustrative example, not a record of what Google actually ran. A buyer in a mid-size metro asks AI Mode, “Which three-row SUV is best for a family of six under $45,000, and who has one near me?” The fan-out could include searches about third-row legroom, crash-test ratings, typical prices for recent model years, and which nearby dealers list one in stock.',
          'Each of those smaller searches is a chance for a page to be retrieved. A dealer page that clearly answers several of them, for the models you actually stock, gives the system more to work with than a page that only lists the vehicle’s specs.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-mode-question-length',
        q: 'How long are AI Mode questions?',
        a: [
          '[Google says](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/) the average AI Mode search is about three times the length of a traditional Search query, and [it reports](https://blog.google/products-and-platforms/products/search/search-io-2026/) that AI Mode queries have more than doubled every quarter since launch. Both figures come from Google’s own blog in May 2026, so treat them as Google’s description of its product.',
          'Longer questions carry more about the buyer: budget, family size, commute, trade-in, the financing situation. Those details line up with sub-questions a dealer page can answer honestly, such as what you stock in that price band, how your trade-in appraisal works and which financing options you offer a first-time buyer.',
          'The same [AI Mode insights post](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/) says more than one in six US searches now use voice or images. A page that answers a full question in its first sentence, under a heading that asks it, works for a typed question, a spoken one and the follow-up alike.',
        ],
      },
      {
        type: 'bullets',
        id: 'answer-sub-questions',
        h2: 'How should dealer pages answer fanned-out sub-questions?',
        intro: 'Dealer pages should answer fanned-out sub-questions by covering the real questions around a topic on one strong page, in plain sentences. Google says its AI understands synonyms and general meaning, needs no special chunking, and treats a separate page for every search variation as scaled content abuse.',
        items: [
          'One strong page per real topic. For a model you sell a lot of, one page can cover trims, seating, towing, common ownership questions and what you have in stock, instead of ten thin pages. [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says a high quantity of pages does not make a website higher quality.',
          'Write the way buyers talk, and skip the keyword variants. Google says its AI systems understand synonyms and general meaning, so a page need not chase every long-tail phrasing.',
          'No chunking tricks. Google says there is no requirement to break content into tiny pieces and no ideal page length. Headings that ask the question with a direct answer underneath are enough.',
          'Lead with the answer, then the detail. A sub-question such as “does the base trim have a third row” deserves a yes or no in the first sentence.',
          'Use first-hand facts. Your techs’ notes, your real inventory, your service hours and your trade-in process are things no other site can copy.',
          'Start with the pages buyers need most. Our guide to [answer-first dealer pages](@answer-pages-for-car-dealerships) shows how to write one.',
          'Never spin up a page for every town or phrasing. Google’s guide says separate content for every variation of how people search, made mainly to manipulate rankings or AI responses, violates its scaled content abuse policy.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-mode-local-dealers',
        q: 'Does AI Mode show local dealers?',
        a: [
          '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) AI responses can include information about local businesses, and that Business Profiles and Merchant Center help products and services show up in AI responses as well as regular results. Google does not publish how often AI Mode names a dealership, so the practical step is a complete, accurate Business Profile.',
          'That means the basics, done carefully: your real business name, the most specific category, current sales and service hours, and the same address and phone as your website. A profile that disagrees with your own site gives any system a reason to doubt both.',
          'Google’s preferred sources feature, where a searcher picks sites they want to see more of, [now also applies](https://developers.google.com/search/docs/appearance/preferred-sources) in AI Mode and AI Overviews for sites included in Search generative AI features, at the domain or subdomain level only. For a dealer, that is one more reason to keep the store’s content on one well-kept domain.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-mode-traffic',
        q: 'How do you see AI Mode traffic?',
        a: [
          'Search Console counts AI Mode: [since June 16, 2025](https://developers.google.com/search/updates), its data has counted toward the totals in the Performance report, mixed in with regular web results. The generative AI performance report, which [Google says](https://support.google.com/webmasters/answer/16984139) reached all websites by August 31, 2026, breaks out organic impressions from AI Overviews and AI Mode.',
          'Our walkthrough of [Search Console’s generative AI report](@search-console-ai-report-dealers) covers what those numbers mean for a single rooftop. In Google Analytics, [Google’s channel definitions](https://support.google.com/analytics/answer/9756891) put visits from AI Overviews and AI Mode in Organic Search, outside the AI Assistant channel.',
          'Our free scan does not test AI Mode. It asks ChatGPT and Claude your buyers’ questions, and the crawler, page and profile fixes it names are ones Google’s guidance asks for too.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Google: AI Mode update, May 20, 2025](https://blog.google/products/search/google-search-ai-mode-update/)',
          '[Google Search Central: Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[Google: AI Mode insights from the US, May 19, 2026](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/)',
          '[Google: Search at I/O 2026, May 19, 2026](https://blog.google/products-and-platforms/products/search/search-io-2026/)',
          '[Google: Sundar Pichai at Google I/O 2026, May 19, 2026](https://blog.google/innovation-and-ai/sundar-pichai-io-2026/)',
          '[Google Search Central: Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)',
          '[Google Search Central: Documentation updates](https://developers.google.com/search/updates)',
          '[Search Console Help: the generative AI performance report](https://support.google.com/webmasters/answer/16984139)',
          '[Google Analytics Help: Default channel group](https://support.google.com/analytics/answer/9756891)',
          '[Google: The Gemini app passes 1 billion monthly users, August 11, 2026](https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/)',
          '[Google Search Central: Google’s common crawlers, including Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)',
          '[Search Console Help: the Search generative AI setting](https://support.google.com/webmasters/answer/16908024)',
        ],
      },
    ],
    faq: [
      ['Is Google AI Mode available to every US searcher?',
        '[Google said](https://blog.google/products/search/google-search-ai-mode-update/) on May 20, 2025 that AI Mode would start rolling out to everyone in the US that day. It lives inside Google Search, so a buyer needs no separate app to use it.'],
      ['Should I write a page for every fan-out question?',
        'No. [Google’s guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says creating separate content for every variation of how people search, including fan-out queries, mainly to manipulate rankings or AI responses, violates its scaled content abuse policy. Cover the real sub-questions on one strong page per topic instead.'],
      ['Can a dealer opt out of AI Mode but stay in AI Overviews?',
        'Not with one switch. [Google’s Search generative AI '
        + 'setting](https://support.google.com/webmasters/answer/16908024) in Search Console covers AI '
        + 'Overviews, AI Mode and generative AI features in Discover together, and the page-level '
        + 'preview controls such as nosnippet apply across Google’s AI features and regular results.'],
      ['Is Google AI Mode the same thing as the Gemini app?',
        'No. AI Mode is a mode inside Google Search, grounded in the Search index. The Gemini app is a separate assistant, which [Google says](https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/) passed 1 billion monthly users in August 2026. The controls differ too: [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) affects Gemini Apps grounding and model training, and Google says it does not affect inclusion in Google Search.'],
    ],
    cta: {
      heading: 'Start with the answers you can measure',
      sub: 'The free scan does not test Google AI Mode. It asks ChatGPT and Claude your buyers’ questions, 3 times each, and names the crawler, page and profile fixes that Google’s guidance asks for too.',
    },
  },

  // ---------------------------------------------------------------------------
  // #38. /aeo-geo/ask-maps-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'ask-maps-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'engines',
    publishOrder: 38,
    anchor: 'Ask Maps and Gemini in Google Maps: what it reads about your dealership',
    crumb: 'Ask Maps',
    primaryKeyword: 'ask maps business profile',
    secondaryKeywords: [
      'gemini in google maps',
      'ask maps reviews',
      'google ask maps for car dealers',
      'business profile q and a changes',
    ],
    alsoRelated: [
      'bing-places-for-car-dealers',
      'when-ai-gets-your-dealership-wrong',
      'google-business-profile-for-car-dealers',
      'car-dealer-review-sites-ai-answers',
    ],
    augmentKeys: [],
    title: 'Ask Maps and Gemini: What Google Maps Reads About Dealers',
    description: 'Ask Maps brings Gemini into Google Maps. What it reads about your dealership, how Business Profile answers and reviews feed it, and what to update.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Gemini in Google Maps (Ask Maps): what it reads about your dealership',
    tldr: 'Google Ask Maps is a conversational feature in Google Maps, announced on March 12, 2026, that answers complex questions about places by combining Maps data with Google’s Gemini models. [Google says](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/) it draws on over 300 million places and reviews from more than 500 million contributors, and questions asked in Maps now get [instant answers](https://support.google.com/business/thread/392024106) built from a business’s own answers and relevant reviews. For a dealership, the Business Profile is the part of Ask Maps you can influence: complete facts, answered customer questions and answered reviews.',
    sections: [
      {
        type: 'qa',
        id: 'what-is-ask-maps',
        q: 'What is Ask Maps in Google Maps?',
        a: [
          'Ask Maps is a conversational feature in Google Maps that answers complex, real-world questions about places. [Google announced it](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/) on March 12, 2026, as it brought its Gemini models into Maps, and said Ask Maps draws on information from over 300 million places, including reviews from more than 500 million contributors.',
          'Google said it was rolling out in the US and India on Android and iOS, with desktop coming soon. It is the Gemini surface closest to a buyer who is already out driving. In an illustrative case, a shopper parked near a cluster of stores asks, “Which dealer near here has a good service department and is open Saturday?” That question mixes hours, services and reputation, which is exactly what a Business Profile and its reviews hold.',
          'Ask Maps sits beside Google’s conversational surface in Search, which our guide to [Google AI Mode and query fan-out](@google-ai-mode-for-car-dealers) explains. Keeping a store accurate and trusted across Maps, Search and the chat assistants is the work of [generative engine optimization for dealers](/aeo-geo-for-car-dealers/).',
        ],
      },
      {
        type: 'qa',
        id: 'what-ask-maps-reads',
        q: 'What does Ask Maps read about a dealership?',
        a: [
          'Google has not published a full list of what Ask Maps reads about a business. It says Ask Maps draws on its places data and community reviews, and a Google employee announced in December 2025 that questions asked in Maps now get [an instant answer](https://support.google.com/business/thread/392024106) based on the business’s own answers and relevant reviews.',
          '[Google’s search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) adds that Business Profiles help products and services show up in AI responses as well as regular results, and that AI responses can include information about local businesses. Read together, the working assumption for a dealer is simple: your Business Profile, your answers to customer questions and your reviews are the raw material.',
          'Google has not said Ask Maps reads dealer inventory, so treat it as a place-and-reputation surface rather than a car search. The unit on your lot is still found through your website, the listing sites and Marketplace.',
        ],
      },
      {
        type: 'qa',
        id: 'business-profile-qa-change',
        q: 'What happened to Business Profile Q&A?',
        a: [
          'Google changed Business Profile Q&A in December 2025. [Instead of scrolling old questions](https://support.google.com/business/thread/392024106), customers ask in Google Maps and get an instant answer based on the business’s answers and relevant reviews, while businesses answer aggregated customer questions that Google reuses for similar ones. Older Q&A answers still inform Google’s understanding and may show in Maps.',
          'Google also [discontinued the My Business Q&A API](https://developers.google.com/my-business/content/qanda/change-log) on November 3, 2025, so third-party tools can no longer read or post Business Profile Q&A through it. If a vendor says it manages your Q&A automatically, ask how, since that API route has closed.',
          'For a dealership, the questions Google collects for you to answer now shape what buyers see in Maps. Treat them like a short FAQ written by your best salesperson: accurate, specific and current. “Do you take trade-ins you still owe money on?” deserves a real answer with your actual process, not “Call us!”',
        ],
      },
      {
        type: 'bullets',
        id: 'business-profile-facts',
        h2: 'Which Business Profile facts matter most for car dealers?',
        intro: 'Google’s Business Profile guidelines have specific rules for auto dealers. The facts that matter most are the ones buyers ask about and the guidelines spell out: your real business name, the most specific category, car sales hours, and separate profiles only for departments that truly operate as distinct entities.',
        items: [
          'Your real-world name. [Google’s guidelines](https://support.google.com/business/answer/3038177) say the business name must match your real-world name, with no added service, product or location keywords. “Lakeside Motors” stays “Lakeside Motors,” never “Lakeside Motors Best Used Cars.”',
          'The most specific category. Google says categories should be as specific as possible, so a franchise store picks its brand’s dealer category over a generic one.',
          'Car sales hours. Google says to list car sales hours, and if new and pre-owned sales hours differ, to use the new sales hours.',
          'Service and parts on their own profile only when they are a distinct entity. [Google says](https://support.google.com/business/answer/3038177) departments that operate as distinct entities, with a separate entrance and distinct categories, may have their own profiles. Its example is a Toyota store’s service and parts department listed as an Auto Repair Shop, while the main profile stays a Toyota dealer.',
          'One brand per profile. Google says not to combine brand names into a single Business Profile, so a multi-franchise rooftop follows the brand rules rather than one profile for every make.',
          'For the rest of the profile, [what AI answers take from your Business Profile](@google-business-profile-ai-answers) covers how the name, categories, hours, reviews and attributes reach AI answers.',
        ],
      },
      {
        type: 'qa',
        id: 'reviews-ask-maps',
        q: 'How do reviews shape Ask Maps answers?',
        a: [
          'Reviews shape Ask Maps answers in two ways Google has described. Relevant reviews feed the instant answers people get when they ask about a business in Maps, and Ask Maps draws on reviews from more than 500 million contributors. Separately, [Google says](https://support.google.com/business/answer/7091) more reviews and positive ratings can help a business’s local ranking.',
          'Specific reviews give an answer more to work with than generic praise. A review that says the finance manager walked through every fee, or that the service lane had a loaner ready, holds facts that can match a buyer’s question; “great experience!” holds none. Our guide on [how reviews shape AI recommendations](@dealership-reviews-ai-recommendations) covers how to ask for reviews and reply to them.',
          'Stay inside Google’s rules. The [Google Maps content policy](https://support.google.com/contributionpolicy/answer/7400114) bars paid or incentivized reviews and review gating, meaning asking only the happy customers, and [Google says](https://support.google.com/business/answer/7091) there is no way to request or pay for a better local ranking.',
        ],
      },
      {
        type: 'qa',
        id: 'ask-maps-vs-gemini-app',
        q: 'How is Ask Maps different from the Gemini app?',
        a: [
          'Ask Maps lives inside Google Maps and answers questions about places. The Gemini app is Google’s separate general assistant, which [Google says](https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/) passed 1 billion monthly users in August 2026. The controls differ as well: the Google-Extended robots.txt token governs Gemini Apps grounding and model training, and Google says it does not affect Search.',
          '[Google’s crawler documentation](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) describes Google-Extended as a robots.txt token with no separate user agent, covering Gemini training and grounding in Gemini Apps and Vertex AI. Your Business Profile lives in Google’s own systems rather than on your website, so treat Google-Extended as a decision about Gemini training and Gemini Apps; nothing Google has published ties it to your Business Profile.',
          'For how Google’s AI summaries in Search choose the pages they link, see [Google AI Overviews for car dealers](@google-ai-overviews-for-car-dealers).',
        ],
      },
      {
        type: 'bullets',
        id: 'update-this-week',
        h2: 'What should a dealer update this week?',
        intro: 'A dealer can make Maps answers about the store more accurate this week without new tools: answer the customer questions waiting in the Business Profile, fix hours and categories, reply to recent reviews and check the service department’s profile. Most of it takes minutes inside the profile you already have.',
        items: [
          'Answer the questions in your profile. Google now asks businesses to answer aggregated customer questions and reuses those answers for similar ones, so write them in plain sentences with real facts: hours, the trade-in process, whether you work with outside lenders.',
          'Fix hours, including holidays. List car sales hours, and if new and pre-owned hours differ, use the new sales hours, as [Google’s guidelines](https://support.google.com/business/answer/3038177) direct.',
          'Check the name and category against the guidelines, and remove any keywords added to the business name.',
          'Reply to the last 30 days of reviews, good and bad, in specific words. A reply that names what went right, or what the store changed, is useful text for the next buyer.',
          'Check the service department. If it runs as a distinct entity with its own entrance, confirm its profile and category; if it does not, make sure service hours are clear on the main profile.',
          'Match everything elsewhere. Your website, Bing Places, Apple Business Connect, Yelp and DealerRater should show the same name, address, phone and hours as the profile.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Google: Ask Maps and immersive navigation, March 12, 2026](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/)',
          '[Google Business Profile Community: changes to Business Profile Q&A, December 2025](https://support.google.com/business/thread/392024106)',
          '[Google for Developers: My Business Q&A API change log](https://developers.google.com/my-business/content/qanda/change-log)',
          '[Google Search Central: Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Business Profile Help: How to improve your local ranking on Google](https://support.google.com/business/answer/7091)',
          '[Google Business Profile Help: Guidelines for representing your business on Google](https://support.google.com/business/answer/3038177)',
          '[Google Maps User Contributed Content Policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[Google: The Gemini app passes 1 billion monthly users, August 11, 2026](https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/)',
          '[Google Search Central: Google’s common crawlers, including Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)',
          '[Google Business Profile Help: tips to get more reviews](https://support.google.com/business/answer/3474122)',
        ],
      },
    ],
    faq: [
      ['Is Ask Maps available to every Google Maps user?',
        'At launch it was not. [Google said](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/) on March 12, 2026 that Ask Maps was starting to roll out in the US and India on Android and iOS, with desktop coming soon. Check the Maps app on your own phone to see whether it has reached you, and remember your buyers may get it before you do.'],
      ['Can I see what Ask Maps says about my store?',
        'Ask it yourself on a phone where it is available, using the kinds of questions buyers ask, '
        + 'and note what it says and which reviews or answers it seems to draw on. The free scan does '
        + 'not check Ask Maps, so this one has to be done by hand.'],
      ['Should I reply to reviews differently because of Ask Maps?',
        'No new style is needed. Reply by name, promptly and without promotion, as [Google’s review '
        + 'tips](https://support.google.com/business/answer/3474122) ask, and correct wrong facts '
        + 'politely, since relevant reviews feed Maps’ instant answers and your replies sit right '
        + 'beside them.'],
      ['Why doesn’t the free scan check Gemini or Ask Maps?',
        'The free scan checks ChatGPT and Claude only, each with web search on, and it does not measure Gemini, Ask Maps or Google’s AI Overviews. According to Google, answers in Maps draw on your Business Profile and reviews, which you can check directly in the profile. The Business Profile work included in every AI Visibility plan is the same profile Maps reads.'],
    ],
    cta: {
      heading: 'Check the AI answers you can measure',
      sub: 'The free scan does not check Gemini or Ask Maps. It asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and every plan includes the Business Profile work that Maps reads too.',
    },
  },
];
