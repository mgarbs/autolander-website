// AEO and GEO silo, batch 07 (2026-09-30): the reputation cluster's first four articles
// (publish numbers 4, 12, 21 and 30) plus the buyers cluster's trust article (31).
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Plan: the 2026-09-30 silo plan. Facts: fact-bank.md (every number and every
// third-party claim below comes from it, with its source URL linked in the sentence or listed in
// the article's Sources section). Service facts: shared/ai-visibility-content.js.
//
// Link rules (Michael, 2026-09-30): in-body sibling links use ONLY the publish-aware token
// [anchor](@slug), and ONLY to articles with a LOWER publish number, in the section the plan
// assigns. Later siblings connect through alsoRelated, which the builder renders once they are
// live. The money page (/aeo-geo-for-car-dealers/) is live and linked from every article.
//
// House style: no em or en dashes, no "is not X. It is Y." cadence, no promise without a denial,
// no invented numbers, customers or results. Example reviews and replies are labelled
// hypothetical and use placeholders instead of names.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #4 /aeo-geo/dealership-reviews-ai-recommendations/ (reputation pillar)
  // ---------------------------------------------------------------------------
  {
    slug: 'dealership-reviews-ai-recommendations',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 4,
    anchor: 'Dealership reviews and AI recommendations: volume, recency and what the words say',
    crumb: 'Reviews and AI',
    primaryKeyword: 'do reviews affect ai recommendations',
    secondaryKeywords: [
      'dealership reviews ai visibility',
      'google reviews and chatgpt',
      'review recency',
      'ai review summaries',
    ],
    alsoRelated: [
      'answer-pages-for-car-dealerships',
      'google-business-profile-for-car-dealers',
      'how-to-respond-to-car-dealership-reviews',
      'car-dealer-review-sites-ai-answers',
      'reddit-and-dealership-reputation',
      'do-car-buyers-trust-ai-recommendations',
    ],
    augmentKeys: ['aiDealers', 'mktgHub'],
    title: 'Dealership Reviews and AI Recommendations: What Counts',
    description:
      'How dealership reviews shape AI recommendations: volume, recency, replies and what reviews '
      + 'say, plus the review rules Google and the FTC enforce.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Dealership reviews and AI recommendations: volume, recency and what the words say',
    tldr:
      'Yes, reviews affect AI recommendations, most clearly on Google. Google says more reviews and '
      + 'positive ratings can help a business’s local ranking, and Google Maps now builds instant '
      + 'answers from a business’s own answers and relevant reviews. ChatGPT, Claude and other '
      + 'assistants do not publish how they weigh reviews, but car buyers say they want AI to summarize '
      + 'dealership reviews, and nearly every AI user sometimes checks AI picks against real reviews. '
      + 'Recent, specific, honestly collected reviews with a reply to each one are the safe bet.',
    sections: [
      {
        type: 'qa',
        id: 'do-reviews-affect-ai-recommendations',
        q: 'Do reviews affect AI recommendations?',
        a: [
          'Reviews affect AI recommendations most clearly on Google. [Google '
          + 'says](https://support.google.com/business/answer/7091) more reviews and positive ratings '
          + 'can help a business’s local ranking, and Google Maps now answers shopper questions from a '
          + 'business’s own answers and relevant reviews. ChatGPT, Claude, Perplexity and Microsoft '
          + 'Copilot do not document how they weigh reviews, so treat reviews as one important input.',
          'Google’s local results rest mainly on three things: relevance, distance and prominence. '
          + 'Prominence draws on information such as how many websites link to the business and how '
          + 'many reviews it has. On Maps, a Google employee’s announcement in the [Business Profile '
          + 'community](https://support.google.com/business/thread/392024106) describes shoppers asking '
          + 'a question and getting “an updated, instant answer based on your answers and relevant '
          + 'reviews.” For a dealership, the words in your reviews can become the words in the answer.',
          'Other assistants say much less. OpenAI, Anthropic, Perplexity and Microsoft have not published '
          + 'a review weighting for local recommendations, so treat any vendor who quotes a review count '
          + 'or star rating that supposedly earns a ChatGPT mention with suspicion. Buyer demand is better '
          + 'documented: in [CarGurus’ 2025 consumer '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html) of 3,030 people who had '
          + 'bought or sold a vehicle in the past four months, summarizing reviews on dealerships (36%) '
          + 'and on cars (39%) were among the uses people most wanted from AI. For the mechanics on '
          + 'OpenAI’s side, see [how ChatGPT picks which dealers to name](@how-chatgpt-recommends-car-dealerships).',
          'Reviews are one of the trust signals that [AEO and GEO for car '
          + 'dealers](/aeo-geo-for-car-dealers/) works on, alongside your Business Profile, your listings '
          + 'and the text on your own website. None of them is a switch, and no one can promise what an '
          + 'assistant will say. Each one gives an assistant, and the buyer reading after it, fewer '
          + 'reasons to doubt your store.',
        ],
      },
      {
        type: 'qa',
        id: 'what-buyers-read-in-reviews',
        q: 'What do buyers read in reviews now?',
        a: [
          'Shoppers read reviews closely, and they read them fresh. [BrightLocal’s 2026 Local Consumer '
          + 'Review Survey](https://www.brightlocal.com/research/local-consumer-review-survey/) of 1,002 '
          + 'US adults found 97% of consumers read reviews for local businesses, 74% look for reviews '
          + 'from the last three months, 68% require at least a 4-star rating and 82% read AI-generated '
          + 'review summaries.',
          'The same survey found 31% only use businesses rated 4.5 stars or higher, and that Google was '
          + 'used by 71% of consumers to read reviews, down from 83% in its previous survey. BrightLocal also '
          + 'reported that 45% of consumers used AI tools such as ChatGPT to find local business '
          + 'recommendations, up from 6% a year earlier, though the question wording may have changed '
          + 'between years.',
          'Two habits stand out for a dealership. Shoppers now meet your reviews twice, once as the raw '
          + 'text and once as a summary written by software, and both are built from the same words. '
          + 'And AI has become one more place a shopper starts; [how shoppers use AI to buy cars](@how-car-buyers-use-chatgpt) covers what that looks like for vehicle shopping in '
          + 'particular.',
        ],
      },
      {
        type: 'qa',
        id: 'why-review-recency-matters',
        q: 'Why does review recency matter?',
        a: [
          'Review recency matters because shoppers and AI answers both lean on what is current. '
          + '[BrightLocal found](https://www.brightlocal.com/research/local-consumer-review-survey/) 74% '
          + 'of consumers look for reviews from the last three months, and '
          + '[Microsoft researchers writing on the Bing search '
          + 'blog](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'said freshness is critical for AI answers, because an out-of-date fact leads to a misleading '
          + 'answer.',
          'Think about what a pile of old reviews says. Picture a used-car store in a metro area that '
          + 'collected most of its reviews in one big push two years ago and few since. The star average '
          + 'may look fine, but the recent reviews a shopper filters for are thin, and the old ones '
          + 'describe salespeople, managers and a process that may have changed.',
          'The fix is a steady rhythm. Send the same neutral request to every sold customer and every '
          + 'service customer, every month, so the newest reviews always describe the store as it runs '
          + 'today. A steady flow also means one bad week never becomes most of what a shopper reads.',
        ],
      },
      {
        type: 'qa',
        id: 'does-what-a-review-says-matter',
        q: 'Does what a review says matter?',
        a: [
          'What a review says matters, because AI review summaries and Google Maps instant answers draw '
          + 'on the words in reviews as well as the star average. A review that mentions a service '
          + 'loaner, a no-haggle price or a quick trade-in appraisal gives an answer something specific '
          + 'to repeat when a shopper asks that exact question.',
          'Picture a shopper on your Google Maps listing asking whether you offer loaners during service. '
          + 'Google says the instant answer draws on the business’s own answers and relevant reviews, so '
          + 'the store whose customers have written about loaners has material to work with, and the '
          + 'store whose reviews all say “great experience” has very little.',
          'You cannot script this, and you should not try. Google’s [Maps content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114) says merchants should '
          + 'not ask for reviews that include specific content identifying a staff member, and a review '
          + 'that reads as dictated helps nobody. Specific reviews come from specific experiences, plus a '
          + 'request that reaches the customer while the details are still fresh, a few days after '
          + 'delivery or service.',
        ],
      },
      {
        type: 'qa',
        id: 'do-review-replies-matter-for-ai',
        q: 'Do review replies matter for AI?',
        a: [
          'Review replies matter for AI indirectly. A reply is public text beside the review, so anything '
          + 'that reads the review can read your answer, and [Google’s review '
          + 'tips](https://support.google.com/business/answer/3474122) ask owners to reply by name, '
          + 'promptly and without promotion. BrightLocal found 89% of consumers expect owners to respond. '
          + 'No one can show that replies alone change what an assistant says.',
          'Replies do three useful things for a dealership. They show the next shopper that someone is '
          + 'paying attention. They let you correct a fact in public, such as new Saturday hours or a '
          + 'department that moved. And they turn a complaint into evidence of how the store handles '
          + 'problems, which is often what a careful buyer is looking for.',
          'Keep replies plain. Google’s tips say replies should not be promotional, so skip the sales '
          + 'pitch, the phone number in every reply and the list of models in stock. A short reply that '
          + 'names what the customer mentioned reads as real, and a template pasted under every review '
          + 'reads as a template.',
        ],
      },
      {
        type: 'table',
        id: 'review-signals-at-a-glance',
        h2: 'Which review signals can a dealership control?',
        intro:
          'A dealership controls how it asks for reviews, how fast it replies and whether its store facts '
          + 'stay current. It does not control the star average or what customers choose to write. This '
          + 'table maps each review signal to what Google, BrightLocal or the FTC actually say and to the '
          + 'part your store can act on.',
        head: ['Signal', 'What the source says', 'What your store controls'],
        rows: [
          ['Number of reviews', 'Google: more reviews and positive ratings can help local ranking', 'Asking every sold and service customer, every month'],
          ['Star rating', 'BrightLocal 2026: 68% of consumers require at least 4 stars', 'Fixing the problems that low reviews describe'],
          ['Recency', 'BrightLocal 2026: 74% look for reviews from the last three months', 'A steady monthly flow of requests'],
          ['What reviews say', 'Google Maps instant answers draw on relevant reviews', 'Asking while details are fresh, never scripting'],
          ['Replies', 'Google: reply by name, promptly, without promotion. BrightLocal: 89% expect a response', 'A named owner and a reply window'],
          ['Review rules', 'Google bans incentives and gating; the FTC bans fake and bought reviews', 'One neutral request to every customer'],
        ],
        note: 'Sources are listed at the end of this article.',
      },
      {
        type: 'bullets',
        id: 'ask-for-reviews-by-the-rules',
        h2: 'How do you ask for reviews without breaking the rules?',
        intro:
          'Ask every customer the same neutral way, make leaving a review easy with a direct link or QR '
          + 'code, and never pay, filter or pressure anyone. Google’s review guidelines, its Maps content '
          + 'policy and the Federal Trade Commission’s 2024 rule on consumer reviews set the lines, and '
          + 'each item below comes straight from one of them.',
        items: [
          'Send a direct link or QR code. [Google’s own '
          + 'tips](https://support.google.com/business/answer/3474122) suggest reminding customers to '
          + 'leave a review through a link or QR code, and a text a few days after delivery or service is '
          + 'the easiest version.',
          'No incentives. Google [strictly '
          + 'prohibits](https://support.google.com/business/answer/3474122) offering free or discounted '
          + 'goods or services in exchange for reviews, so no discounted oil change, gift card or '
          + 'accessory for a review.',
          'No gating. Google’s [Maps content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114) bars discouraging '
          + 'negative reviews and selectively soliciting positive ones, so the unhappy customer gets the '
          + 'same request as the happy one.',
          'No staff quotas. The same policy says merchants should not ask staff to solicit a certain '
          + 'number of reviews, or ask for reviews that include specific content identifying a staff '
          + 'member.',
          'No reviews from your own people. The policy bars reviews based on conflicts of interest, such '
          + 'as current or former employment.',
          'No on-site requirement. The policy also bars requiring customers to leave a review on your '
          + 'premises, so send the link and let them write it on their own time.',
          'Nothing the FTC bans. The [FTC’s rule on consumer reviews and '
          + 'testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'finalized August 14, 2024, bans fake reviews, buying positive or negative reviews, '
          + 'undisclosed insider reviews, company-controlled review sites posing as independent, and '
          + 'suppressing reviews through threats or intimidation.',
        ],
      },
      {
        type: 'qa',
        id: 'where-else-reviews-count',
        q: 'Where besides Google do reviews count?',
        a: [
          'Beyond Google, reviews count wherever shoppers and assistants look for a second opinion: '
          + 'automotive sites such as DealerRater, Cars.com and CarGurus, and general sites such as Yelp '
          + 'and your Facebook Page. Which of those an assistant cites changes by market and by question, '
          + 'so check the sources behind real answers before you spread effort thin.',
          'Shoppers already spread out. BrightLocal found Google was used by 71% of consumers to read '
          + 'reviews in 2026, down from 83% in its previous survey, which suggests more of that reading now '
          + 'happens elsewhere. Claim and complete your profiles on the automotive sites, keep the store '
          + 'name, address, phone and hours identical to your Business Profile, and answer reviews there '
          + 'with the same care.',
          'Our free scan asks ChatGPT and Claude, each with web search on, up to 20 questions a local '
          + 'buyer would ask, 3 times each, and lists the sources cited in every answer, so you can see '
          + 'which review sites show up in your market. The scan does not measure Google’s AI Overviews, '
          + 'AI Mode or Gemini, and a person checks every report before it reaches you.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Every number and rule in this article comes from these pages, read on September 30, 2026.',
        items: [
          '[Google Business Profile Help: how Google determines local '
          + 'ranking](https://support.google.com/business/answer/7091)',
          '[Google Business Profile Help: tips to get and reply to '
          + 'reviews](https://support.google.com/business/answer/3474122)',
          '[Google Maps user contributed content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[Google Business Profile Community: the Q&A changes '
          + 'announcement](https://support.google.com/business/thread/392024106)',
          '[Federal Trade Commission: final rule banning fake reviews and testimonials, August 14, '
          + '2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)',
          '[BrightLocal: Local Consumer Review Survey '
          + '2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
          '[CarGurus: 2025 consumer insights '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html)',
          '[Microsoft Bing search blog: the evolving role of the index, May '
          + '2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)',
          '[Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)',
        ],
      },
    ],
    faq: [
      ['Can a dealership offer a discount for a review?',
        'No. Google strictly prohibits offering incentives such as free or discounted goods or services '
        + 'in exchange for reviews, and the [FTC’s 2024 '
        + 'rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) '
        + 'bans buying positive or negative reviews. A discount on the next service visit, a gift card '
        + 'or a free accessory all fall on the wrong side of that line. Send the same plain request to '
        + 'every customer instead.'],
      ['Can we ask only happy customers for reviews?',
        'No. Google’s Maps content policy bars selectively soliciting positive reviews and discouraging '
        + 'negative ones, a practice often called review gating. Send the same request to every sold and '
        + 'service customer, and handle the unhappy ones by fixing the problem and replying to what they '
        + 'write.'],
      ['Can our employees leave reviews for the store?',
        'No. The [Google Maps content '
        + 'policy](https://support.google.com/contributionpolicy/answer/7400114) bars reviews based on '
        + 'conflicts of interest, such as current or former employment, and the [FTC’s rule on consumer '
        + 'reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) '
        + 'bans undisclosed insider reviews. Reviews should come from real sold and service customers, '
        + 'asked the same neutral way.'],
      ['Should we show our Google reviews on our own website?',
        'You can show real reviews, but do not mark up your own star rating. [Google’s LocalBusiness '
        + 'documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
        + 'says review rating markup is only for sites that capture reviews about other businesses. '
        + 'Link to your Business Profile and review pages so a shopper, or an assistant, can check the '
        + 'originals.'],
    ],
    cta: {
      heading: 'See which sources AI uses for your store',
      sub: 'The free scan asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and shows '
        + 'who gets named in your market and the sources behind each answer, review sites included. A '
        + 'person checks it and walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #12 /aeo-geo/google-business-profile-ai-answers/
  // ---------------------------------------------------------------------------
  {
    slug: 'google-business-profile-ai-answers',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 12,
    anchor: 'Google Business Profile in AI answers: what AI reads about your dealership',
    crumb: 'Business Profile for AI',
    primaryKeyword: 'google business profile ai search',
    secondaryKeywords: [
      'business profile for ai overviews',
      'does google business profile affect ai answers',
      'business profile attributes for dealerships',
      'consistent business listings for ai',
    ],
    alsoRelated: [
      'google-business-profile-for-car-dealers',
      'ask-maps-for-car-dealers',
      'dealer-group-ai-visibility',
      'service-department-ai-answers',
      'when-ai-gets-your-dealership-wrong',
      'bing-places-for-car-dealers',
    ],
    augmentKeys: [],
    title: 'Google Business Profile for AI Answers: What AI Reads',
    description:
      'How a dealership’s Google Business Profile feeds AI answers: the facts AI Overviews and Maps '
      + 'draw on, listing consistency, reviews as evidence, Q&A and attributes.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How your Google Business Profile feeds AI answers about your dealership',
    tldr:
      'Google says Business Profiles can help businesses show up in AI responses, and Google Maps now '
      + 'answers shopper questions from a business’s own answers and relevant reviews. What AI takes '
      + 'from a dealership’s profile is plain facts: the name, categories, hours, departments, '
      + 'attributes, your answers to customer questions and the words in your reviews. Those facts help '
      + 'most when your website and every other listing say the same thing, and there is no way to pay '
      + 'Google for a better local position.',
    sections: [
      {
        type: 'qa',
        id: 'does-business-profile-affect-ai-answers',
        q: 'Does Google Business Profile affect AI search answers?',
        a: [
          'Google Business Profile feeds Google’s own AI answers. [Google’s AI optimization '
          + 'guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says '
          + 'Business Profiles can help businesses show up in AI responses as well as other Google Search '
          + 'results, and that AI responses can include local business information. Google Maps now '
          + 'answers shopper questions from business answers and relevant reviews.',
          'On Maps, a Google employee’s [announcement in the Business Profile '
          + 'community](https://support.google.com/business/thread/392024106) says shoppers ask a question '
          + 'and get “an updated, instant answer based on your answers and relevant reviews.” That puts '
          + 'review text inside the answer too; see [the review signals AI answers pick up](@dealership-reviews-ai-recommendations). For Google’s AI Overviews, the '
          + 'profile works alongside the web pages Google has indexed; see [how Google AI Overviews cite '
          + 'dealer pages](@google-ai-overviews-for-car-dealers).',
          'ChatGPT and Claude are a different case. They run their own web searches, and [OpenAI '
          + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) ChatGPT '
          + 'search sometimes partners with other search providers, so no documented path runs from your '
          + 'Business Profile into their answers. They read the pages and listings their searches turn '
          + 'up, which is why keeping the profile, your website and every listing in agreement is a core '
          + 'part of [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/).',
          'This article covers what AI answers take from a profile that already exists. For building one '
          + 'from scratch, from verification and categories to hours and photos, start with [our Google '
          + 'Business Profile setup guide for car dealerships](@google-business-profile-for-car-dealers).',
        ],
      },
      {
        type: 'table',
        id: 'business-profile-fields-for-ai',
        h2: 'Which Business Profile facts do AI answers draw on?',
        intro:
          'AI answers draw on the parts of a profile that state plain facts: the name and address, the '
          + 'categories, the hours, which departments exist, the attributes, your answers to customer '
          + 'questions and the text of your reviews. The table shows where each one can surface and what '
          + 'to check.',
        head: ['Profile fact', 'Where it can surface in AI answers', 'What to check'],
        rows: [
          ['Name, address and phone', 'Any answer that has to decide whether two listings describe the same store', 'The same name, address and phone on your website and every listing'],
          ['Categories', 'Answers that match a store to what the shopper asked for, such as a used car dealer or a Toyota dealer', 'The most specific categories that honestly fit'],
          ['Hours', 'Questions about who is open now, on Saturday or on a holiday', 'Holiday hours set in advance and matching your website'],
          ['Departments', 'Service and parts questions, when service has its own profile', 'Each profile’s hours and phone match its page on your site'],
          ['Attributes', 'Google says attributes show on Search, Maps and other Google platforms and may match searches for places with those attributes', 'Only attributes that are true today'],
          ['Your answers to customer questions', 'Instant answers in Google Maps, built from your answers and relevant reviews', 'Old answers about hours, financing or departments that have changed'],
          ['Review text', 'Instant answers in Maps and the AI review summaries shoppers read', 'Replies that correct wrong facts politely'],
        ],
        note: 'Sources are listed at the end of this article.',
      },
      {
        type: 'qa',
        id: 'consistency-across-listings',
        q: 'Why does consistency across listings matter for AI answers?',
        a: [
          'An AI answer is assembled from several sources, and a store that looks different from one '
          + 'source to the next is harder to describe with confidence. [Bing’s '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say “Clear '
          + 'entity definition improves grounding visibility and citation accuracy.” Matching name, '
          + 'address, phone and hours everywhere lets each source confirm the others.',
          'That reaches past Google. OpenAI says ChatGPT search sometimes partners with other search '
          + 'providers and rewrites a question into targeted searches, so what ChatGPT reads about your store comes from '
          + 'whatever pages and listings those searches return. The same facts need to live on your '
          + 'website, Bing Places, Apple Business Connect and the listing sites, as well as on your '
          + 'Business Profile.',
          'Hours are the fact most likely to drift. Holidays, weather closures and staffing changes all '
          + 'move them, and Microsoft researchers writing on the [Bing search '
          + 'blog](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'said freshness is critical for AI answers, because out-of-date facts lead to misleading '
          + 'responses. Change the profile and the website in the same sitting, every time.',
        ],
      },
      {
        type: 'qa',
        id: 'reviews-as-evidence',
        q: 'How do reviews work as evidence in AI answers?',
        a: [
          'Reviews give an AI answer something concrete to repeat about your store. Google says Maps '
          + 'builds instant answers from a business’s answers and relevant reviews, and [Ask '
          + 'Maps](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/) '
          + 'draws on reviews from more than 500 million contributors. A review saying the finance office '
          + 'walked through every fee hands an answer a specific fact.',
          'Shoppers read the software’s version as well as the original. [BrightLocal’s 2026 Local '
          + 'Consumer Review Survey](https://www.brightlocal.com/research/local-consumer-review-survey/) '
          + 'found 82% of consumers read AI-generated review summaries, and [Google '
          + 'says](https://support.google.com/business/answer/7091) more reviews and positive ratings can '
          + 'help a business’s local ranking.',
          'Reviews only work as evidence when they are real. Google [strictly '
          + 'prohibits](https://support.google.com/business/answer/3474122) offering incentives for '
          + 'reviews, and the [Google Maps content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114) bars review gating and '
          + 'asking staff to collect a set number. A reply is also the fastest public place to correct a '
          + 'wrong fact a reviewer wrote, such as old hours.',
        ],
      },
      {
        type: 'qa',
        id: 'business-profile-qa-and-attributes',
        q: 'How do customer questions and attributes feed Maps answers?',
        a: [
          'Customer questions and attributes are two places where facts you supply reach an answer '
          + 'directly. Shoppers ask questions in Google Maps and get an instant answer built from the '
          + 'business’s answers and relevant reviews, and Google says attributes show on Search, Maps and '
          + 'other Google platforms and may match searches for places with those attributes.',
          'Google changed Business Profile Q&A in late 2025: businesses now answer customer questions that '
          + 'Google groups together, and those answers are reused for similar questions. The same '
          + 'announcement says existing Q&A answers keep powering Google’s understanding of the business '
          + 'and may still show in Maps, so an old answer about hours, financing or a department you '
          + 'closed can still shape what a shopper is told. Google also [discontinued the My Business Q&A '
          + 'API](https://developers.google.com/my-business/content/qanda/change-log) on November 3, 2025, '
          + 'so a tool that says it posts Q&A answers through that API cannot do it that way anymore.',
          'Attributes are small yes-or-no facts with the same reach. [Google’s help page on '
          + 'attributes](https://support.google.com/business/answer/9049526) says some can be edited '
          + 'directly while others may be filled in from what visiting customers report, and that a '
          + 'review of edits usually takes about 10 minutes but can take up to 30 days. Check them after '
          + 'any change at the store, and never mark one that is no longer true.',
        ],
      },
      {
        type: 'bullets',
        id: 'business-profile-ai-check',
        h2: 'What should a dealership check before AI reads its profile?',
        intro:
          'Check the profile the way an assistant meets it: next to your website and your other '
          + 'listings. The goal is one set of facts everywhere, current answers to customer questions, '
          + 'attributes that are still true and reviews with replies that fix wrong details. Each check '
          + 'below takes minutes and needs no special tool.',
        items: [
          'Name, address and phone: open your profile, your website footer, Bing Places and Apple '
          + 'Business Connect side by side, and fix any difference, however small.',
          'Hours: compare regular and holiday hours on the profile with your website’s hours page, and '
          + 'set special hours before the next holiday instead of after the first confused call.',
          'Departments: if service has its own profile, its hours and phone should match the service page '
          + 'on your site.',
          'Old answers: read every answer your store has given to customer questions, and update any that '
          + 'describe hours, financing or departments that have changed.',
          'Attributes: remove or change any attribute that is no longer true.',
          'Reviews: reply to recent reviews, and correct a wrong fact politely in the reply.',
          'Setup gaps: if the profile is unverified or a basic field is empty, fix that first with the '
          + 'setup guide linked above, since AI answers can only repeat facts the profile holds.',
        ],
      },
      {
        type: 'qa',
        id: 'pay-google-for-better-position',
        q: 'Can you pay Google for a better position?',
        a: [
          'No. [Google says](https://support.google.com/business/answer/7091) there is no way to request '
          + 'or pay for a better local ranking. Local results rest mainly on relevance, distance and '
          + 'prominence, and prominence draws on information such as how many websites link to the '
          + 'business and how many reviews it has. What you control is accuracy, completeness and reviews.',
          'So be wary of anyone who sells a set Maps position: Google says no such purchase exists, and no '
          + 'one can promise one. The work that helps is the unglamorous kind, done every month.',
          'Every AutoLander AEO and GEO plan runs your Business Profile as a manager while you stay the '
          + 'owner. Categories, services, description, hours, attributes and photos are kept current, every '
          + 'change is e-mailed to you within 48 hours, and we never change your business name, address or '
          + 'main category without your sign-off.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Every number and rule in this article comes from these pages, read on September 30, 2026.',
        items: [
          '[Google Search Central: AI optimization '
          + 'guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Business Profile Community: the Q&A changes '
          + 'announcement](https://support.google.com/business/thread/392024106)',
          '[Google for Developers: My Business Q&A API change '
          + 'log](https://developers.google.com/my-business/content/qanda/change-log)',
          '[Google Business Profile Help: manage your business '
          + 'attributes](https://support.google.com/business/answer/9049526)',
          '[Google: Ask Maps announcement, March '
          + '2026](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/)',
          '[Google Business Profile Help: how Google determines local '
          + 'ranking](https://support.google.com/business/answer/7091)',
          '[Google Business Profile Help: tips to get more '
          + 'reviews](https://support.google.com/business/answer/3474122)',
          '[Google Maps User Contributed Content '
          + 'Policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[BrightLocal: Local Consumer Review Survey '
          + '2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
          '[OpenAI Help Center: searching the web with '
          + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[Microsoft Bing Webmaster '
          + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Microsoft Bing search blog: the evolving role of the index, May '
          + '2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)',
        ],
      },
    ],
    faq: [
      ['Does ChatGPT read my Google Business Profile?',
        'No documented path runs from your Business Profile into ChatGPT’s answers. OpenAI says ChatGPT '
        + 'search sometimes partners with other search providers, so it reads whatever pages and listings '
        + 'those searches return. That is why the facts on your profile need to match your website and '
        + 'every other listing.'],
      ['How long do Business Profile edits take to show?',
        'Google’s help page on attributes says a review of edits usually takes about 10 minutes but can '
        + 'take up to 30 days, and Google says new photos can take 24 to 48 hours to appear. AI answers '
        + 'catch up on their own schedule after that, so check the profile and a few AI answers again a '
        + 'week or two later.'],
      ['Is Business Profile work the same as AEO?',
        'It is one part of it. AEO and GEO also cover whether AI crawlers can read your website, whether '
        + 'vehicle pages show price, mileage and VIN as text, and what review and listing sites say about '
        + 'the store. The profile is where Google’s own answers start, so it is usually the first fix.'],
      ['Should I update my website or my Business Profile first?',
        'Do both in the same sitting. When the profile and the website disagree, neither a shopper nor an '
        + 'assistant can tell which is right, and out-of-date facts are how misleading answers start. '
        + 'Change the profile, the website’s hours and contact pages and Bing Places together, then check '
        + 'each one the next day.'],
    ],
    cta: {
      heading: 'See what ChatGPT and Claude say about your store',
      sub: 'The free scan asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and shows '
        + 'who gets named and the sources behind each answer. On every plan, we run your Business Profile '
        + 'as a manager while you stay the owner.',
    },
  },

  // ---------------------------------------------------------------------------
  // #21 /aeo-geo/when-ai-gets-your-dealership-wrong/
  // ---------------------------------------------------------------------------
  {
    slug: 'when-ai-gets-your-dealership-wrong',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 21,
    anchor: 'When AI gets your dealership wrong: fixing wrong hours, addresses and closed labels',
    crumb: 'Fix wrong AI answers',
    primaryKeyword: 'chatgpt wrong information about my business',
    secondaryKeywords: [
      'fix what chatgpt says about my business',
      'google ai overview wrong information',
      'ai hallucination about my business',
      'report a wrong ai answer',
    ],
    alsoRelated: [
      'bing-places-for-car-dealers',
      'ask-maps-for-car-dealers',
      'car-dealer-review-sites-ai-answers',
      'dealer-group-ai-visibility',
    ],
    augmentKeys: [],
    title: 'When AI Gets Your Dealership Wrong: How to Fix It',
    description:
      'What to do when ChatGPT, Google AI Overviews or other assistants get your dealership’s hours, '
      + 'address or status wrong, and how to fix the source.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'When AI gets your dealership wrong: fixing wrong hours, addresses and closed labels',
    tldr:
      'When ChatGPT has wrong information about your business, or Google AI Overviews shows old hours or '
      + 'a closed label, the fix happens at the source the answer relied on. Open the cited sources, find '
      + 'the page that states the wrong fact, correct it there and everywhere else it appears, then '
      + 're-ask the same question on a schedule. No one can promise how fast an assistant picks up the '
      + 'change, but a correct, consistent set of sources is the only lasting fix.',
    sections: [
      {
        type: 'qa',
        id: 'why-ai-gets-dealership-facts-wrong',
        q: 'Why do ChatGPT and other AI assistants get dealership facts wrong?',
        a: [
          'AI assistants get dealership facts wrong because they repeat their sources, and sources go '
          + 'stale or disagree. [Google tells searchers](https://support.google.com/websearch/answer/14901683) '
          + 'that AI Overviews can and will make mistakes, and [OpenAI '
          + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) ChatGPT '
          + 'search results and citations can be incomplete, outdated or incorrect. An old directory '
          + 'listing or a forgotten page can be where it starts.',
          'OpenAI also tells ChatGPT users to open the source and check it, which is exactly what a careful '
          + 'buyer does. Microsoft researchers writing on the [Bing search '
          + 'blog](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'add that freshness is critical for AI answers, since an out-of-date fact leads to a misleading '
          + 'response. And [Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) ask for clear, '
          + 'consistent naming of organizations and locations, because clear entity definition improves '
          + 'citation accuracy. When your store’s name, address or hours differ from one source to the '
          + 'next, an assistant has to pick one.',
          'Two kinds of source deserve special attention. Google Maps builds instant answers partly from '
          + '[relevant reviews](https://support.google.com/business/thread/392024106), so an old review '
          + 'that mentions old hours is part of the picture; see [why reviews matter to AI assistants](@dealership-reviews-ai-recommendations). And [Google '
          + 'says](https://developers.google.com/search/docs/appearance/ai-features) a page must be '
          + 'indexed and eligible for a snippet to appear in its AI features, so an old hours page on your '
          + 'own site that is still indexed stays in the pool; see [what AI Overviews look for in a dealer page](@google-ai-overviews-for-car-dealers).',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you find the source of a wrong answer?',
        intro:
          'Find the source of a wrong answer by opening its citations. ChatGPT answers that use web search '
          + 'can include citations and a Sources view, and Google’s AI features link to pages too. Work '
          + 'from the answer back to the exact page that states the wrong fact, then list every other '
          + 'place online that repeats it.',
        steps: [
          {
            title: 'Ask the question a buyer would ask',
            body:
              'Use a fresh chat and plain words, such as what time your store closes on Saturday or '
              + 'whether it is still at its old address. Save the answer with the date. Ask more than '
              + 'once, because answers change from run to run; our [AI visibility scan for car '
              + 'dealers](/aeo-geo-for-car-dealers/#scan-form) asks every question 3 times for that reason.',
          },
          {
            title: 'Open the sources',
            body:
              'In ChatGPT, open the Sources view, which [OpenAI '
              + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) lists '
              + 'cited sources and other relevant links. In Google’s AI Overviews, open the pages the '
              + 'answer links to. Read each one for the wrong fact.',
          },
          {
            title: 'Find the page that states it',
            body:
              'Look for the specific page that states the wrong fact: an old directory listing, a Business '
              + 'Profile field, a location page from before a move, a third-party article or a review. '
              + 'Screenshot it and note the URL.',
          },
          {
            title: 'Search for the same error elsewhere',
            body:
              'Search your store’s name together with the wrong detail, such as the old phone number or '
              + 'the old street, and check every listing you know about. OpenAI says ChatGPT search '
              + 'sometimes partners with other search providers, so the sources behind a ChatGPT answer may '
              + 'differ from what you see on Google; [what ChatGPT looks at before it recommends a store](@how-chatgpt-recommends-car-dealerships) covers that side.',
          },
          {
            title: 'Write the fix list',
            body:
              'For each source, record the page, the wrong fact, the right fact and who can change it: '
              + 'you, your website vendor, or the site that owns the listing. That list is the whole job '
              + 'for the next section.',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'fix-wrong-hours-or-addresses',
        h2: 'How do you fix wrong hours or addresses?',
        intro:
          'Fix wrong hours or addresses at every source at once, starting with the ones you control: your '
          + 'Google Business Profile, your website, Bing Places and your main listings. Bing’s guidelines '
          + 'say clear, consistent naming of organizations and locations improves grounding and citation '
          + 'accuracy in its AI answers, so the goal is every source saying the same thing.',
        items: [
          'Google Business Profile first. For car dealerships, [Google '
          + 'says](https://support.google.com/business/answer/3038177) to list car sales hours, and to use '
          + 'the new sales hours if new and pre-owned hours differ. Set special hours for holidays. Why '
          + 'hours carry so much weight is covered in [which Business Profile facts AI answers draw on](@google-business-profile-ai-answers).',
          'Your website next: the contact page, the footer, the hours page, every location page and any '
          + 'structured data your platform adds. The website has to say exactly what the profile says.',
          'Bing Places and Apple Business Connect: claim them if you have not, then correct the same '
          + 'fields.',
          'Automotive listing profiles: your Cars.com, CarGurus, Autotrader and DealerRater dealer '
          + 'profiles, which are easy to forget after a change.',
          'Your Facebook Page and Yelp listing, plus any directory that still shows a former address or '
          + 'phone number.',
          'Old pages you forgot: a landing page for a closed location, a press release with old hours, a '
          + 'vendor’s microsite. Update them or redirect them to the current page.',
          'Reviews that state old facts: you cannot edit them, but a short reply with the current fact, '
          + 'such as the new Saturday hours, puts the correction right beside the old claim.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-says-store-closed-or-moved',
        q: 'What if AI says your store is closed or moved?',
        a: [
          'If AI says your store is closed or moved, check your Google Business Profile status first, then '
          + 'the pages the answer cites. A wrong closed label can come from a profile setting, an old '
          + 'listing or a page still describing a former location. Fix each one, then tell search engines '
          + 'which pages changed, using IndexNow where you can.',
          '[Bing’s webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'tell site owners to use IndexNow when URLs are added, updated or removed, saying timely '
          + 'notifications “reduce outdated or incorrect URL references in Copilot responses.” According '
          + 'to the [IndexNow FAQ](https://www.indexnow.org/faq), a submission is shared with the '
          + 'participating engines, including Bing, Yandex, Naver, Seznam.cz, Amazon and Yep, and Google '
          + 'is not listed among them. IndexNow also says a submission does not mean immediate indexing.',
          'Picture a pre-owned store that moved across town last year. The profile shows the new address, '
          + 'but an old location page on the website still describes the former lot, and two directories '
          + 'never got updated. Update or redirect the old page, correct the directories, notify the '
          + 'changed URLs, and the sources an assistant finds start telling one story.',
        ],
      },
      {
        type: 'qa',
        id: 'report-a-wrong-ai-answer',
        q: 'Can you report a wrong AI answer?',
        a: [
          'Reporting a wrong AI answer is worth doing, but it is the weak fix. If the assistant offers a '
          + 'feedback option on an answer, use it, but no channel we know of lets a dealer edit what an AI '
          + 'says about a store. The lasting fix is correcting the source the answer cited.',
          'Where you can correct the source yourself, do that first: your Business Profile, your website '
          + 'and the listings you have claimed. Where the source is a site you do not control, such as a '
          + 'directory or an article, use that site’s own correction process or contact its owner. Keep a '
          + 'record of each request and the date.',
          'Skip the hunt for a person at Google or OpenAI who can change one answer. Answers that use web '
          + 'search are built from the sources the assistant finds, so time spent on the sources pays off '
          + 'across every assistant that reads them.',
        ],
      },
      {
        type: 'qa',
        id: 'how-long-until-a-fix-shows-up',
        q: 'How long until a fix shows up?',
        a: [
          'No one can say exactly how long a fix takes to show up. Assistants that search the web read '
          + 'current pages when they find them, but each one decides when to crawl and what to cite, and '
          + '[OpenAI’s help '
          + 'page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) says '
          + 'ChatGPT ranks search results using multiple factors and that placement cannot be assured.',
          'In practice, the pages you control change the moment you publish. What an assistant says next '
          + 'depends on when it reads those pages again. Notifying changed URLs with IndexNow helps the '
          + 'engines that take part in it, and it cannot hurry Google, which is not listed as a '
          + 'participant.',
          'So re-check on a schedule instead of daily. Ask the same questions in the same words a week '
          + 'after the fix and then monthly, save each answer with its date and sources, and look for the '
          + 'wrong fact to disappear across runs rather than in a single answer. Every AutoLander plan '
          + 're-asks a fixed set of buyer questions each month and shows you the raw answers.',
        ],
      },
      {
        type: 'bullets',
        id: 'keep-it-from-happening-again',
        h2: 'How do you keep it from happening again?',
        intro:
          'Keep wrong answers from coming back by giving one person ownership of the store’s facts, '
          + 'changing every source in the same sitting when a fact changes, and re-asking the same buyer '
          + 'questions every month. A single forgotten listing can restart the problem, so the habit '
          + 'matters more than any one fix.',
        items: [
          'Name one owner for store facts: legal name, address, main phone, department phones, hours by '
          + 'department, website address and the list of brands sold.',
          'Keep a master list of every profile and listing, with who holds the login for each.',
          'Use a change checklist for every holiday, weather closure, hours change, phone system change, '
          + 'move or website vendor switch, and work through the whole list the same day.',
          'Set special hours on the Business Profile before each holiday, ahead of the first confused call.',
          'Notify changed URLs with IndexNow if your website platform supports it, and redirect retired '
          + 'pages to their current versions.',
          'Reply to reviews that state old facts with the current fact, plainly and without promotion.',
          'Re-ask the same questions every month in ChatGPT, Claude and the other assistants your buyers '
          + 'use, and save each answer with its sources and date.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Every number and rule in this article comes from these pages, read on September 30, 2026.',
        items: [
          '[Google Search Help: AI Overviews and AI responses in '
          + 'Search](https://support.google.com/websearch/answer/14901683)',
          '[Google Search Central: AI features and your '
          + 'website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[OpenAI Help Center: searching the web with '
          + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[Microsoft Bing Webmaster '
          + 'Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Microsoft Bing search blog: the evolving role of the index, May '
          + '2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)',
          '[Google Business Profile Help: guidelines for representing your business on '
          + 'Google](https://support.google.com/business/answer/3038177)',
          '[Google Business Profile Community: the Q&A changes '
          + 'announcement](https://support.google.com/business/thread/392024106)',
          '[IndexNow FAQ](https://www.indexnow.org/faq)',
        ],
      },
    ],
    faq: [
      ['Can I ask ChatGPT to correct what it says about my store?',
        'You can tell it in your own chat, but that does not fix anything at the source. Answers that use '
        + 'web search are built from what the search finds, and OpenAI says those responses may include '
        + 'citations to the pages used. Correct the cited page, and the listings that repeat it, instead.'],
      ['Why does AI still show our old hours?',
        'Usually because at least one source it reads still shows them. OpenAI says ChatGPT search results and '
        + 'citations can be outdated, and Microsoft researchers note that out-of-date facts lead to '
        + 'misleading AI answers. Open the sources behind the answer, find the page with the old hours and '
        + 'fix it, along with every listing that copies it.'],
      ['Will fixing my Business Profile fix ChatGPT’s answer?',
        'Not by itself. OpenAI says ChatGPT search sometimes partners with other search providers, and its '
        + 'help page links privacy statements from Microsoft and Shopify as providers, so ChatGPT may be '
        + 'reading other sources entirely. Fix the Business Profile, your website, Bing Places and your '
        + 'main listings together so every source says the same thing.'],
      ['What if the wrong fact comes from a site I don’t control?',
        'Ask that site to correct it through its business listing tools or support contact, and fix '
        + 'every source you do control so the correct version outnumbers the wrong one. Bing says '
        + 'clear, consistent naming of organizations and locations improves citation accuracy, so '
        + 'matching facts across many sources helps even while one stays wrong.'],
    ],
    cta: {
      heading: 'Find the source behind every wrong answer',
      sub: 'The free scan asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and shows '
        + 'the exact sources behind each answer about your store. A person checks it and walks you through '
        + 'it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #30 /aeo-geo/how-to-respond-to-car-dealership-reviews/
  // ---------------------------------------------------------------------------
  {
    slug: 'how-to-respond-to-car-dealership-reviews',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 30,
    anchor: 'How to respond to car dealership reviews, with examples',
    crumb: 'Responding to reviews',
    primaryKeyword: 'how to respond to car dealership reviews',
    secondaryKeywords: [
      'dealership review response examples',
      'reply to a negative dealership review',
      'review reply templates for car dealers',
      'fake review on my dealership',
    ],
    alsoRelated: [
      'google-business-profile-for-car-dealers',
      'car-dealer-review-sites-ai-answers',
      'reddit-and-dealership-reputation',
      'dealer-group-ai-visibility',
      'service-department-ai-answers',
    ],
    augmentKeys: [],
    title: 'How to Respond to Car Dealership Reviews (With Examples)',
    description:
      'How to respond to car dealership reviews, with example replies for 5-star, 1-star and suspicious '
      + 'reviews, and the Google and FTC rules to follow.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How to reply to car dealership reviews: examples for good, bad and fake ones',
    tldr:
      'To respond to car dealership reviews well, reply to every one, use the reviewer’s name, answer '
      + 'promptly and leave out the sales pitch, which is what Google’s own review tips ask for. Thank '
      + 'specific praise specifically, move complaints offline with a named manager, never share deal or '
      + 'financing details, and flag suspicious reviews instead of fighting them. The sample replies below '
      + 'cover sales, service and finance reviews.',
    sections: [
      {
        type: 'qa',
        id: 'how-should-a-dealership-respond-to-reviews',
        q: 'How should a dealership respond to reviews?',
        a: [
          'A dealership should respond to reviews the way [Google’s review '
          + 'tips](https://support.google.com/business/answer/3474122) describe: reply to them, address the '
          + 'reviewer by name, respond in a timely manner and keep the reply non-promotional. Write for the '
          + 'next shopper reading the page, because the reviewer has already decided how they feel and the '
          + 'next buyer has not.',
          'Shoppers do read them. [BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/) found 97% of '
          + 'consumers read reviews for local businesses and 82% read AI-generated review summaries, so your '
          + 'reviews reach shoppers directly and through summaries, and your replies sit right beside them. '
          + 'The wider picture of [how reviews shape AI '
          + 'recommendations](@dealership-reviews-ai-recommendations) explains why recency and specifics '
          + 'matter as much as the star average.',
          'Every good reply has the same four parts: the reviewer’s name, a thank-you or an acknowledgment, '
          + 'one specific detail from their review, and a next step when one is needed. Reviews are also one '
          + 'part of [AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/), next to the Business '
          + 'Profile, listings and website fixes, because a buyer and an assistant read the same public page.',
        ],
      },
      {
        type: 'qa',
        id: 'how-fast-should-a-dealership-reply',
        q: 'How fast should a dealership reply?',
        a: [
          'A dealership should reply within a business day or two. [BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/) found 89% of '
          + 'consumers expect owners to respond to reviews and 19% expect a same-day response, and Google’s '
          + 'tips say to respond in a timely manner. A reply that lands a month later tells the next reader '
          + 'nobody was watching.',
          'Speed comes from routing. Send new-review alerts to one named owner, route every 1-star and '
          + '2-star review to the general manager the same day, and decide in advance who covers weekends '
          + 'and days off.',
          'Replies post publicly on your Business Profile next to the review, alongside the categories '
          + 'and hours covered in [what AI answers take from your Business Profile](@google-business-profile-ai-answers). A reply is also the fastest public place to correct '
          + 'a fact, such as new hours, that a reviewer got wrong.',
        ],
      },
      {
        type: 'qa',
        id: 'reply-to-a-5-star-review',
        q: 'What should a reply to a 5-star review say?',
        a: [
          'A reply to a 5-star review should thank the customer by name, mention the specific thing they '
          + 'praised and the department involved, and stop there. Skip the sales pitch, the phone number and '
          + 'the list of models in stock: Google’s tips say replies should not be promotional, and a short, '
          + 'specific thank-you reads as genuine.',
          'Name staff only if the customer did, and pass the praise along to them. Vary your wording from '
          + 'reply to reply; fifty identical thank-yous in a row read as if a machine wrote them, whoever '
          + 'did.',
        ],
      },
      {
        type: 'callout',
        title: 'Sample reply: 5-star sales review',
        body:
          'Hypothetical review: a buyer gives five stars and says the trade-in number matched what the '
          + 'website showed. Sample reply: “Thanks, [first name]. We’ll pass this along to [salesperson’s '
          + 'name]. A trade-in number that matches what you saw online is how it should work, and we’re '
          + 'glad it did. Enjoy the new car.”',
      },
      {
        type: 'callout',
        title: 'Sample reply: 5-star service review',
        body:
          'Hypothetical review: a service customer says the wait was short and the advisor explained every '
          + 'line of the invoice. Sample reply: “Thank you, [first name]. Clear explanations are something '
          + 'our service team works hard on, and we’ll share your note with [advisor’s name]. See you at '
          + 'your next visit.”',
      },
      {
        type: 'qa',
        id: 'reply-to-a-1-star-review',
        q: 'How do you reply to a 1-star review without making it worse?',
        a: [
          'Reply to a 1-star review with a calm acknowledgment, one relevant fact if you have it, and an '
          + 'offer to talk offline with a named manager and a direct number. Never argue, never share the '
          + 'customer’s deal, loan or payment details, and never hint at consequences for posting. The '
          + 'reply is for everyone else reading.',
          'The line on consequences comes from federal rules as well as good sense: the [FTC’s rule on '
          + 'consumer '
          + 'reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'finalized August 14, 2024, bans suppressing reviews through threats or intimidation. A reply '
          + 'that argues point by point, or reveals what the customer financed, turns a private dispute into '
          + 'a public one.',
          'Finance complaints need the most care, because the details are private and emotions run high. '
          + 'Stick to an apology for the experience and an invitation to go through the paperwork together '
          + 'in person. If your store finances in house, the same rule carries extra weight, and [buy here '
          + 'pay here dealers in AI answers](@buy-here-pay-here-ai-answers) covers the rest of that picture.',
        ],
      },
      {
        type: 'callout',
        title: 'Sample reply: 1-star service review',
        body:
          'Hypothetical review: a customer says the car came back from service with the same warning light '
          + 'on. Sample reply: “[First name], we’re sorry the light came back on after your visit. That '
          + 'shouldn’t happen, and we want to get the car back in and find out why. Please call [service '
          + 'manager’s name], our service manager, at [direct number] so we can set it up.”',
      },
      {
        type: 'callout',
        title: 'Sample reply: 1-star finance review',
        body:
          'Hypothetical review: a buyer says the monthly payment ended up higher than they expected. Sample '
          + 'reply: “[First name], we hear you, and we want to go through the paperwork with you line by '
          + 'line. We keep every customer’s deal details private, so please call [finance manager’s name] '
          + 'at [direct number] and we’ll sit down together.”',
      },
      {
        type: 'table',
        id: 'dealership-review-reply-guide',
        h2: 'What should each type of dealership review reply include?',
        intro:
          'Each dealership review reply should match the review in front of it: praise gets a specific '
          + 'thank-you, a mixed review gets thanks plus a fix, a complaint gets a named contact, and a '
          + 'suspicious review gets a flag and one polite line. This table covers the review types a sales, '
          + 'service or finance team is likely to see.',
        head: ['Review type', 'The reply should', 'Leave out'],
        rows: [
          ['5-star sales', 'Thank by name, echo the specific praise, pass it to the salesperson the customer named', 'Pitches, phone numbers, model lists'],
          ['5-star service', 'Thank by name, mention the service detail they praised', 'Upsells and coupons'],
          ['3-star mixed', 'Thank them for the good part, acknowledge the miss, say what changes', 'Excuses and blame'],
          ['1-star sales', 'Acknowledge, one relevant fact, a named manager and a direct number', 'Arguments and deal numbers'],
          ['1-star service', 'Apologize for the experience, invite them back to look again', 'Technical debate in public'],
          ['1-star finance', 'Offer to go through the paperwork privately with a named manager', 'Any loan, payment or personal detail'],
          ['Suspected fake', 'Flag it under Google’s policy, then one polite line saying you cannot find the visit', 'Accusations and threats'],
          ['Former employee', 'Flag it as a conflict of interest under Google’s policy', 'Personnel details'],
        ],
        note: 'Examples are hypothetical. Rules summarized from Google’s review tips, Google’s Maps content policy and the FTC’s consumer reviews rule.',
      },
      {
        type: 'qa',
        id: 'what-if-a-review-looks-fake',
        q: 'What if a review looks fake?',
        a: [
          'If a review looks fake, check your sales and service records first, then flag it through Google '
          + 'under its [Maps content policy](https://support.google.com/contributionpolicy/answer/7400114), '
          + 'which bars incentivized reviews and reviews based on conflicts of interest. Reply once, '
          + 'politely, saying you cannot find a record of the visit and inviting the person to call. Never '
          + 'pressure or retaliate against a reviewer.',
          'Conflicts of interest include your own people. Google’s policy names current or former '
          + 'employment, so a glowing review from your own salesperson and an angry one from a former '
          + 'employee both qualify for a flag. The [FTC’s 2024 '
          + 'rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) '
          + 'bans fake reviews and undisclosed insider reviews, and it bans suppressing reviews through '
          + 'threats or intimidation, so a real review you dislike stays a matter for a reply.',
          'Google decides what comes down. No one can promise that a review will be removed, and we never '
          + 'do; what you control is a calm, factual record on the page for the next shopper to read.',
        ],
      },
      {
        type: 'qa',
        id: 'mention-models-or-departments-in-replies',
        q: 'Should replies mention models or departments?',
        a: [
          'Replies should mention a model or department only where it fits, such as naming the service '
          + 'department when the review was about service. Stuffing model names, city names or “best used '
          + 'cars” into every reply reads as spam, and [Google’s spam '
          + 'policies](https://developers.google.com/search/docs/essentials/spam-policies) call the same '
          + 'habit on web pages keyword stuffing.',
          'Google’s review tips also say replies should not be promotional. The natural version is to echo '
          + 'what the customer said in plain words: if they praised the loaner car during a brake job, say '
          + 'you’re glad the loaner helped. That reply is specific, honest and useful to the next shopper '
          + 'with the same question.',
        ],
      },
      {
        type: 'qa',
        id: 'who-writes-and-approves-replies',
        q: 'Who should write and approve replies?',
        a: [
          'One named owner should write or review every reply, usually the internet manager or a BDC lead, '
          + 'with the general manager approving every 1-star and 2-star reply before it posts. Department '
          + 'managers supply the facts for reviews about their areas. A shared inbox with no owner is how '
          + 'reviews sit unanswered for weeks.',
          'On AutoLander’s plans, every Google review is answered within 2 business days on AI Foundation '
          + 'and within 1 business day on AI Authority and Market Leader, in the reviewer’s language. Our '
          + 'team drafts the responses, you name who approves bad-review responses at kickoff, a person '
          + 'approves every reply to a 1-star or 2-star review, and you hear about those reviews the same '
          + 'day.',
          'Plans cover replies on Google only. Replies on DealerRater, Cars.com, CarGurus, Yelp and your '
          + 'Facebook Page stay with your team, using the same habits.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Every number and rule in this article comes from these pages, read on September 30, 2026.',
        items: [
          '[Google Business Profile Help: tips to get and reply to '
          + 'reviews](https://support.google.com/business/answer/3474122)',
          '[Google Maps user contributed content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114)',
          '[Federal Trade Commission: final rule banning fake reviews and testimonials, August 14, '
          + '2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)',
          '[BrightLocal: Local Consumer Review Survey '
          + '2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
          '[Google Search Central: spam '
          + 'policies](https://developers.google.com/search/docs/essentials/spam-policies)',
        ],
      },
    ],
    faq: [
      ['Should a dealership reply to every review?',
        'Yes, positive and negative alike. BrightLocal’s 2026 survey found 89% of consumers expect owners '
        + 'to respond to reviews, and Google’s tips ask businesses to reply. A short, specific reply to a '
        + '5-star review takes a minute, and a thoughtful reply to a 1-star review can matter more to the '
        + 'next shopper than the review itself.'],
      ['Can we get a negative review removed?',
        'Only if it breaks Google’s policy, for example a review from a current or former employee or one '
        + 'that was paid for. Flag it through Google and let Google decide. No one can promise a removal, '
        + 'and disagreeing with a review is not one of the reasons the policy lists, so answer it calmly '
        + 'instead.'],
      ['Is it OK to use AI to draft review replies?',
        'Yes, as a first draft. A person should read every reply before it posts, check the facts, remove '
        + 'anything private and make sure it answers what this customer actually said, since identical '
        + 'replies under every review read as automated. Google’s tips still apply: reply by name, promptly '
        + 'and without promotion. On our plans, our team drafts every Google reply, and a person approves '
        + 'every reply to a 1-star or 2-star review before it posts.'],
      ['Should we reply to reviews on DealerRater and Yelp too?',
        'Yes, wherever you have claimed your profile and shoppers can see the review. The same habits '
        + 'apply: the reviewer’s name, specifics, no pitch and a named contact for problems. Each site has '
        + 'its own rules, so read them before you ask for or flag anything there. Our plans cover Google '
        + 'review replies only, and they never send Yelp review requests.'],
    ],
    cta: {
      heading: 'See how your reviews show up in AI answers',
      sub: 'The free scan asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and shows '
        + 'who gets named in your market and the sources behind each answer. Your reviews count toward the '
        + 'score out of 100, and a person walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #31 /aeo-geo/do-car-buyers-trust-ai-recommendations/ (buyers cluster)
  // ---------------------------------------------------------------------------
  {
    slug: 'do-car-buyers-trust-ai-recommendations',
    silo: 'aeoGeo',
    cluster: 'buyers',
    publishOrder: 31,
    anchor: 'Do car buyers trust AI recommendations? What the surveys say',
    crumb: 'Do buyers trust AI?',
    primaryKeyword: 'do car buyers trust ai',
    secondaryKeywords: [
      'ai bias car shopping',
      'do people double check ai recommendations',
      'trust in ai car search tools',
      'ai recommendations and reviews',
    ],
    alsoRelated: [
      'dealership-reviews-ai-recommendations',
      'car-dealer-review-sites-ai-answers',
      'how-to-respond-to-car-dealership-reviews',
      'measure-dealership-ai-visibility',
    ],
    augmentKeys: [],
    title: 'Do Car Buyers Trust AI Recommendations? What Surveys Say',
    description:
      'Do car buyers trust AI recommendations? What Cars.com, BrightLocal and Cox Automotive surveys '
      + 'found, and why buyers still check your reviews and site.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Do car buyers trust AI recommendations? What the surveys say',
    tldr:
      'Car buyers trust AI recommendations, with a check. In a Cars.com survey released November 20, '
      + '2025, 71% of respondents said they have at least a moderate amount of trust in AI tools for '
      + 'vehicle information, while '
      + '63% of shoppers worried those tools could recommend cars in a biased way, and BrightLocal found '
      + '97% of AI users sometimes double-check AI recommendations against real reviews. For a dealership, '
      + 'an AI mention sends the buyer to your reviews and your vehicle pages, so both have to hold up.',
    sections: [
      {
        type: 'qa',
        id: 'do-car-buyers-trust-ai-recommendations',
        q: 'Do car buyers trust AI recommendations?',
        a: [
          'Car buyers mostly trust AI recommendations, with checks. In a [Cars.com '
          + 'survey](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'released November 20, 2025, 71% of respondents said they have at least a moderate amount of '
          + 'trust in AI tools to give unbiased, accurate vehicle information, yet 63% of shoppers worried '
          + 'AI might recommend cars in a biased way. Trust and doubt sit side by side.',
          'BrightLocal’s [follow-up analysis](https://www.brightlocal.com/research/lcrs-ai-trust/) of its '
          + '2026 consumer survey found the same pattern for local businesses in general: 63% of active AI '
          + 'users trust AI tools’ recommendations, and 97% of AI users '
          + 'sometimes double-check them against real reviews. The Cars.com figures are about AI tools for '
          + 'car shopping; BrightLocal’s cover local businesses of every kind.',
          'Use is already broad. The same Cars.com release says 44% of the consumers it surveyed used '
          + 'AI-powered car search tools on marketplaces such as Cars.com, and among AI users, 97% say AI '
          + 'will impact their purchase decisions. For the wider '
          + 'picture, see [our look at car buyers and AI](@how-car-buyers-use-chatgpt), and our [AI visibility '
          + 'scan for car dealers](/aeo-geo-for-car-dealers/#scan-form) shows what ChatGPT and Claude tell '
          + 'those buyers about your store.',
        ],
      },
      {
        type: 'qa',
        id: 'what-buyers-do-after-an-ai-recommendation',
        q: 'What do buyers do after an AI recommendation?',
        a: [
          'After an AI recommendation, most AI users keep researching. Cars.com found 59% of AI users treat '
          + 'AI as a starting point for further research, while 30% find it gives a satisfactory final '
          + 'answer. [BrightLocal found](https://www.brightlocal.com/research/lcrs-ai-trust/) 97% of AI '
          + 'users sometimes double-check AI recommendations against real reviews, so your reviews and '
          + 'pages get the next look.',
          'Picture the path. A buyer asks an assistant for the best dealer near them for a used truck and '
          + 'gets a short list with a line or two about each store; [how AI answers best dealer near '
          + 'me](@best-car-dealership-near-me-ai) walks through how that list gets built. Then the buyer '
          + 'opens reviews, the website and the inventory for the names on it. The recommendation opens '
          + 'the door, and your own pages decide whether the buyer walks through it.',
          'That is the practical takeaway for a store. An AI mention is worth little if the buyer who checks '
          + 'finds three months of silence in your reviews, a price that differs from what the assistant '
          + 'said, or hours that do not match.',
        ],
      },
      {
        type: 'qa',
        id: 'why-buyers-worry-about-ai-bias',
        q: 'Why do buyers worry about AI bias and mistakes?',
        a: [
          'Buyers have reason to worry about AI bias and mistakes, and the AI companies say so themselves. '
          + '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'ChatGPT search results and citations can be incomplete, outdated or incorrect, and [Google '
          + 'tells searchers](https://support.google.com/websearch/answer/14901683) that AI Overviews can '
          + 'and will make mistakes. Add Cars.com’s finding that 63% of shoppers worry about biased car '
          + 'recommendations, and double-checking looks sensible.',
          'On paid influence, OpenAI’s [advertising '
          + 'principles](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) say '
          + '“Ads do not influence the answers ChatGPT gives you.” How any assistant chooses its sources is '
          + 'still mostly out of view; OpenAI’s help page says ChatGPT ranks search results using multiple '
          + 'factors meant to find relevant, reliable information.',
          'Mistakes about your own store are the part you can act on. If an assistant has your hours, '
          + 'address or status wrong, the buyer who double-checks finds the conflict, and the fix happens at '
          + 'the source; see [fixing wrong AI answers about your store](@when-ai-gets-your-dealership-wrong).',
        ],
      },
      {
        type: 'table',
        id: 'car-buyer-ai-trust-surveys',
        h2: 'What do the surveys say, side by side?',
        intro:
          'The surveys agree on the shape of trust: buyers use AI, mostly trust it and check it against '
          + 'reviews and other sources. Each figure below keeps its own base, because the studies asked '
          + 'different people different questions, and none of them should be merged into one number.',
        head: ['Study', 'Who the figure covers', 'Finding'],
        rows: [
          ['Cars.com, released Nov 20, 2025', 'Survey respondents', '71% have at least a moderate amount of trust in AI tools to give unbiased, accurate vehicle information'],
          ['Cars.com, released Nov 20, 2025', 'Shoppers surveyed', '63% worry AI tools might recommend cars in a biased way'],
          ['Cars.com, released Nov 20, 2025', 'AI users', '59% treat AI as a starting point for further research; 30% find it gives a satisfactory final answer'],
          ['BrightLocal AI trust analysis, Mar 10, 2026', 'Active AI users', '63% trust AI tools’ recommendations'],
          ['BrightLocal AI trust analysis, Mar 10, 2026', 'AI users', '97% sometimes double-check AI recommendations against real reviews'],
          ['BrightLocal Local Consumer Review Survey 2026', '1,002 US adults', '74% look for reviews from the last three months; 89% expect owners to respond'],
          ['Cox Automotive Car Buyer Journey, Jan 13, 2026', 'Mostly-digital buyers who engaged AI assistants', '84% were highly satisfied with the overall buying process'],
          ['CarGurus 2025 consumer study', '3,030 people who bought or sold a vehicle in the past four months', 'Summarizing dealership reviews (36%) was among the most wanted AI uses'],
        ],
        note: 'Sources and links are listed at the end of this article.',
      },
      {
        type: 'qa',
        id: 'are-ai-assisted-buyers-happier',
        q: 'Are AI-assisted buyers happier with the purchase?',
        a: [
          'In Cox Automotive’s research, many buyers who used AI assistants report high satisfaction. Cox’s '
          + '[2025 Car Buyer Journey '
          + 'study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
          + 'found “84% of mostly-digital buyers who engaged AI assistants were highly satisfied” with the '
          + 'overall buying process, and 59% of respondents reported high satisfaction with AI-powered '
          + 'assistance itself.',
          'Cox also found buyers named real-time answers, personalized recommendations and interactive '
          + 'quizzes as the top benefits of AI. Read the figures for what they are: satisfaction reported by '
          + 'people who used AI along the way. They do not show that AI caused the satisfaction, and they '
          + 'say nothing about a particular dealership.',
          'For a store, the useful point is simpler. Real-time answers were one of the benefits buyers '
          + 'named, and a dealership can give real-time answers of its own through clear vehicle pages, '
          + 'current reviews and a sales team that gets back to people quickly.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-the-double-check-means',
        h2: 'What does the double-check mean for a dealership?',
        intro:
          'The double-check means an AI mention is only the first step: the buyer then reads your reviews, '
          + 'your replies and your vehicle pages to confirm what the assistant said. BrightLocal found 74% of '
          + 'consumers look for reviews from the last three months and 89% expect owners to respond, so '
          + 'stale or unanswered reviews weaken the recommendation.',
        items: [
          'Recent reviews. Send the same neutral request to every sold and service customer every month, so '
          + 'the last three months always hold something to read ([BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/)).',
          'Answered reviews. Reply to each one by name, promptly and without promotion, as [Google’s review '
          + 'tips](https://support.google.com/business/answer/3474122) ask.',
          'Summaries that reflect the store. BrightLocal found 82% of consumers read AI-generated review '
          + 'summaries, and those summaries are built from what your customers wrote.',
          'Vehicle pages that agree with the answer. If an assistant describes a car at one price and your '
          + 'page shows another, the buyer has reason to doubt both.',
          'The same store facts everywhere: name, address, phone and hours on your website, your Business '
          + 'Profile and your listings.',
        ],
      },
      {
        type: 'bullets',
        id: 'make-it-easy-to-verify',
        h2: 'What should your store make easy to verify?',
        intro:
          'Make every fact a buyer might check easy to find in plain text: the price, the mileage, the VIN, '
          + 'your fees, your hours, your replies to reviews and who to contact. When a buyer double-checks '
          + 'an AI answer, each of these should confirm it within a click or two, on your own site and your '
          + 'profiles.',
        items: [
          'Price as text on every vehicle page, matching what your listings show; [our vehicle page guide](@vehicle-detail-page-ai-readable) covers how to set that up.',
          'Mileage and the full VIN as text, next to the price.',
          'Fees stated plainly: your documentation fee and any add-ons, so the number a buyer hears later '
          + 'matches the one they read.',
          'Hours by department, the same on your site and your Business Profile.',
          'Replies to your reviews, which show how the store handles problems.',
          'A named contact for each kind of question: a specific car, a trade-in, financing and service.',
          'Sold units marked sold or removed quickly, so buyers stop finding cars you no longer have.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Every number and claim in this article comes from these pages, read on September 30, 2026.',
        items: [
          '[Cars.com: survey on AI’s growing influence on car shopping, November 20, '
          + '2025](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping)',
          '[BrightLocal: consumer trust in AI recommendations, March 10, '
          + '2026](https://www.brightlocal.com/research/lcrs-ai-trust/)',
          '[BrightLocal: Local Consumer Review Survey '
          + '2026](https://www.brightlocal.com/research/local-consumer-review-survey/)',
          '[Cox Automotive: 2025 Car Buyer Journey press release, January 13, '
          + '2026](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf)',
          '[CarGurus: 2025 consumer insights '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html)',
          '[OpenAI Help Center: searching the web with '
          + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI: our approach to advertising, January 16, '
          + '2026](https://openai.com/index/our-approach-to-advertising-and-expanding-access/)',
          '[Google Search Help: AI Overviews and AI responses in '
          + 'Search](https://support.google.com/websearch/answer/14901683)',
          '[Pew Research Center: Americans and AI 2026, June 17, 2026](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/)',
          '[Google Business Profile Help: tips to get more reviews](https://support.google.com/business/answer/3474122)',
        ],
      },
    ],
    faq: [
      ['Which AI assistants do US adults use most?',
        'ChatGPT leads by a wide margin. [Pew Research Center’s February 2026 '
        + 'survey](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/) '
        + 'found 44% of US adults use ChatGPT, 24% Gemini, 17% Copilot, 14% Meta AI, 8% Grok and 6% '
        + 'Claude. Car shoppers may differ, so ask your own buyers which one they used.'],
      ['Do buyers who use AI still want to visit the dealership?',
        'Most do. [Cox Automotive’s 2025 buyer '
        + 'study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
        + 'found 53% of buyers completed every step at the dealership and 63% said the ideal experience '
        + 'mixes online and in-person steps. Cox says shoppers use AI to arrive prepared, and the visit '
        + 'is still part of their plan.'],
      ['Should salespeople ask buyers whether they used AI?',
        'It is worth adding to your intake questions. Knowing which assistant a buyer used and what '
        + 'it said shows which sources shape your market, and it gives the salesperson a chance to '
        + 'correct anything the answer got wrong.'],
      ['Should a dealer worry about AI mistakes about their store?',
        'Worry less and check more. Google says AI Overviews can and will make mistakes, and OpenAI says '
        + 'ChatGPT search results can be outdated or incorrect. Ask the questions your buyers ask, open the '
        + 'sources behind each answer and fix any wrong fact at the source. The free scan does this for '
        + 'ChatGPT and Claude, and it does not measure Google’s AI Overviews.'],
    ],
    cta: {
      heading: 'See what AI tells buyers before they check',
      sub: 'The free scan asks ChatGPT and Claude up to 20 local buyer questions, 3 times each, and shows '
        + 'who they name, what they cite and the 3 fixes to make first. A person checks it and walks you '
        + 'through it in 20 minutes.',
    },
  },
];
