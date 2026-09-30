// AEO and GEO silo, batch 04 (2026-09-30): the commercial batch. Choosing an agency, red flags,
// ChatGPT ads, what AEO costs, and the do-it-yourself checklist.
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Plan: the 2026-09-30 silo plan (publish numbers 9, 18, 27, 35, 36).
// Facts: every third-party number or claim comes from the silo fact bank, with its source URL
// linked in the sentence and listed again in each article’s Sources section.
// Links: in-body sibling links use ONLY the publish-aware token [anchor](@slug) and ONLY point to
// LOWER publish numbers, so publishing in order never creates a dead link. Later siblings connect
// through alsoRelated, which the builder renders once they are live.
// House rules (content-rules.mjs plus the silo tests): no long dashes, no contrast cadence, assistant
// names spelled in full, every sentence with promise or guarantee carries a denial, the free scan
// measures ChatGPT and Claude only, and plan prices are exactly $997 / $2,497 / $5,997 a month plus
// $997 / $997 / $2,997 setup.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #9  /aeo-geo/how-to-choose-an-aeo-agency/   (choosing-help pillar)
  // ---------------------------------------------------------------------------
  {
    slug: 'how-to-choose-an-aeo-agency',
    silo: 'aeoGeo',
    cluster: 'choosing-help',
    publishOrder: 9,
    anchor: 'How to choose an AEO agency for your dealership: 15 questions to ask',
    crumb: 'Choosing an AEO agency',
    primaryKeyword: 'how to choose an aeo agency',
    secondaryKeywords: [
      'questions to ask an aeo agency',
      'geo agency for dealerships',
      'what does an aeo agency do',
      'aeo agency vs seo agency',
    ],
    alsoRelated: [
      'aeo-agency-red-flags',
      'aeo-checklist-for-dealerships',
      'aeo-cost-for-car-dealerships',
      'chatgpt-ads-for-car-dealers',
      'local-pr-for-car-dealerships',
    ],
    augmentKeys: ['aiDealers'],
    title: 'Choosing an AEO Agency for Your Dealership: 15 Questions',
    description:
      'How to choose an AEO or GEO agency for your dealership: 15 questions to ask about method, '
      + 'measurement, reviews, content and contracts before you sign.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How to choose an AEO agency for your dealership: 15 questions to ask',
    tldr:
      'Knowing how to choose an AEO agency comes down to asking questions whose answers you can check. '
      + 'A good agency shows you the raw answers ChatGPT, Claude and other assistants give, follows '
      + 'Google’s review and spam rules, lets you approve every page, works through manager access '
      + 'instead of your passwords, and never promises a spot in an AI answer. Use the 15 questions '
      + 'below on every vendor you talk to, AutoLander included.',
    sections: [
      {
        type: 'qa',
        id: 'what-an-aeo-agency-does',
        q: 'What does an AEO agency do for a dealership?',
        a: [
          'An AEO agency, sometimes called a GEO agency, does the work that helps AI assistants find, '
          + 'trust and name your store. It keeps AI search crawlers able to read your site and vehicle '
          + 'pages, runs your Business Profile and listings, handles reviews by the rules, writes answer '
          + 'pages and measures what assistants actually say about you.',
          'Much of that sits on top of ordinary search work. [Google says](https://developers.google.com/search/docs/appearance/ai-features) '
          + 'there are no additional requirements to appear in AI Overviews or AI Mode beyond being indexed '
          + 'and eligible for a snippet, which is the SEO your website vendor already sells. An AEO agency '
          + 'adds what assistants read and repeat: robots.txt rules for OAI-SearchBot, Claude-SearchBot and '
          + 'PerplexityBot, prices and mileage as text on every VDP, and the same store facts on every '
          + 'listing. Our explainer on [the difference between AEO and SEO](@aeo-vs-seo-for-car-dealers) draws the '
          + 'line between the two.',
          'For a dealership the jobs have dealer names: the sales and service Business Profiles, DealerRater '
          + 'and the marketplace dealer profiles, review requests from your own CRM or DMS, and a fix list '
          + 'your website provider or OEM website program has to apply. That is the scope of '
          + '[AEO and GEO for car dealers](/aeo-geo-for-car-dealers/) as AutoLander sells it, and the scope '
          + 'to hold any agency to.',
        ],
      },
      {
        type: 'bullets',
        id: 'ask-about-measurement',
        h2: 'What should you ask about how they measure?',
        intro:
          'Ask which AI assistants they check, how many times they ask each question, whether you see '
          + 'the raw answers, and whether the score comes with a margin. Answers change from run to run, '
          + 'so one screenshot proves little. Google also warns that no outside tool can see inside its '
          + 'ranking or AI systems.',
        items: [
          'Which assistants, by name? ChatGPT, Claude, Gemini, Perplexity, Microsoft Copilot, Google AI '
          + 'Overviews and Google AI Mode pick their sources in different ways. A report that just says '
          + '“AI” cannot be checked.',
          'How many runs per question? The same question can get a different answer on the next run, so '
          + 'ask how many runs sit behind every number.',
          'Do you get the raw answers, with a margin? Each report should show the text every assistant '
          + 'returned, labeled by assistant, with its sources and a score range. A move inside that range '
          + 'is noise.',
          'Does the tool claim inside data? [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says “No third-party tool has access to our internal ranking or AI systems.”',
          'What do you read in my own numbers? Ask how they use GA4 and Search Console. Our guide on '
          + '[how to measure AI visibility](@measure-dealership-ai-visibility) lays out a method you can '
          + 'run yourself.',
        ],
      },
      {
        type: 'qa',
        id: 'why-no-honest-guarantee',
        q: 'Why can’t an honest agency guarantee results?',
        a: [
          'An honest agency cannot guarantee results because no one outside the companies that build the '
          + 'assistants controls what they say, and OpenAI, Google and Microsoft each say so in their own '
          + 'documentation. An agency controls its own work, such as fixes shipped, pages published and '
          + 'reviews answered, and it should put dates on those.',
          '[OpenAI’s help page on ChatGPT search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'says results are ranked using multiple factors meant to find relevant, reliable information, '
          + 'and that placement is not guaranteed, so no one can sell a dealer a spot there. '
          + '[Microsoft’s Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'say “GEO does not guarantee grounding or citations in AI experiences.” And '
          + '[Google’s Business Profile help](https://support.google.com/business/answer/7091) says there '
          + 'is no way to request or pay for a better local ranking on Google.',
          'So read every proposal for its verbs. “We send your fix list to your vendor within 3 business '
          + 'days” is a commitment you can check. “ChatGPT will recommend you within 90 days” is a claim no '
          + 'one can back.',
        ],
      },
      {
        type: 'bullets',
        id: 'ask-about-reviews',
        h2: 'What should you ask about reviews?',
        intro:
          'Ask exactly how the agency gets more reviews, because Google and the FTC both set rules here. '
          + 'The safe answer is a neutral request to every sold customer through a link or QR code, with '
          + 'no gifts, no filtering out unhappy buyers and no staff quotas. Gifts, filtering or quotas '
          + 'break rules your profile depends on.',
        items: [
          'Do you offer anything for a review? [Google’s review guidance](https://support.google.com/business/answer/3474122) '
          + 'says incentives such as free or discounted goods or services in exchange for reviews are '
          + 'strictly prohibited. A free oil change for a review counts.',
          'Do you only ask the happy ones? [Google’s Maps content policy](https://support.google.com/contributionpolicy/answer/7400114) '
          + 'bars selectively asking for positive reviews, often called review gating.',
          'Do salespeople get review quotas? The same policy says businesses should not ask staff to '
          + 'collect a certain number of reviews.',
          'Would anything break the FTC’s rule? The [FTC’s final rule on fake reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'announced August 14, 2024, bans fake reviews, buying positive or negative reviews and '
          + 'undisclosed insider reviews.',
          'Who approves the hard replies? Google recommends replying in a timely manner and says replies '
          + 'should not be promotional. Ask who at your store signs off on a reply to a 1-star review, and '
          + 'see our guide on [how reviews shape AI recommendations](@dealership-reviews-ai-recommendations).',
        ],
      },
      {
        type: 'bullets',
        id: 'ask-about-content',
        h2: 'What should you ask about content?',
        intro:
          'Ask who writes each page, who at your store approves it, what first-hand facts it adds, and '
          + 'why the number of pages makes sense. Google’s spam policies cover mass-produced pages made '
          + 'mainly to game rankings however they are made, including with AI, so page count alone should '
          + 'never impress you.',
        items: [
          'Who writes, and who approves? A page about your trade-in process should be checked by the '
          + 'person who runs trade-ins, and nothing should go live without your sign-off.',
          'What does each page add that only you know? Your reconditioning steps, your loaner policy, the '
          + 'lenders you actually use. Google’s [guidance on generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) '
          + 'says generating many pages without adding value for users may violate its scaled content '
          + 'abuse policy.',
          'How many pages, and why? [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says “a high quantity of pages doesn’t make a website higher quality.”',
          'Where do prices come from? A page that states last week’s price hands an assistant a wrong '
          + 'fact to repeat. Our guide to [answer pages for car dealerships](@answer-pages-for-car-dealerships) '
          + 'shows how a good one stays current.',
        ],
      },
      {
        type: 'bullets',
        id: 'ask-about-placements',
        h2: 'What should you ask about sponsored placements and links?',
        intro:
          'Ask whether any paid mention is labeled as advertising and whether its links carry a sponsored '
          + 'or nofollow tag. Paying for an article that mentions your store can be legitimate. Paying for '
          + 'hidden links meant to lift rankings is link spam under Google’s rules, and unlabeled ads run '
          + 'into FTC guidance.',
        items: [
          'Is it labeled as an ad? The [FTC’s native advertising guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses) '
          + 'says an ad should not suggest it is anything other than an ad, and names clear labels such as '
          + '“Advertisement” and “Sponsored Advertising Content.”',
          'Are the links tagged? [Google’s spam policies](https://developers.google.com/search/docs/essentials/spam-policies) '
          + 'treat links bought for ranking as link spam and accept paid links for advertising when they '
          + 'carry rel="sponsored" or rel="nofollow". Google also [asks site owners](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) '
          + 'to mark paid placements with the sponsored value.',
          'Why that publication? A placement is worth paying for only where buyers and assistants already '
          + 'read about your market.',
          'Who checks each delivery? On AutoLander’s AI Authority and Market Leader plans, every placement '
          + 'is labeled as sponsored, its links are tagged, and we check each delivery for the link, your '
          + 'store’s name, the tag and the label.',
        ],
      },
      {
        type: 'bullets',
        id: 'ask-about-access',
        h2: 'What should you ask about access and ownership?',
        intro:
          'Ask for manager roles and user invites, never your passwords, and get it in writing that you '
          + 'own every profile, listing, page and video the agency builds. If you leave, you should keep '
          + 'all of it, and the agency’s access should be removed on a date you can check.',
        items: [
          'Will you ask for any password? The work runs on manager roles and user invites; an agency that '
          + 'wants your Google login is asking for more control than the job needs.',
          'Who is the owner of record? You should own the Business Profile and every listing, and answer '
          + 'pages should live on your own website.',
          'Will you log in to my DMS or CRM? Review requests can run inside your own system, switched on by '
          + 'your admin.',
          'What happens when I leave? Get the dates for access removal and data deletion in writing. At '
          + 'AutoLander that is within 5 business days for access and 30 days for your scan data and '
          + 'reports.',
        ],
      },
      {
        type: 'bullets',
        id: 'fifteen-questions',
        h2: 'How to choose an AEO agency: which 15 questions should you ask before you sign?',
        intro:
          'Print these 15 questions and ask them of every agency you talk to, AutoLander included. Good '
          + 'answers are specific, dated and checkable. Vague answers, secret tools and any claim of a '
          + 'guaranteed spot in ChatGPT or Google, which no one can deliver, are your cue to keep looking.',
        items: [
          '1. Which AI assistants do you check, by name, and how many times do you ask each question?',
          '2. Will I see the raw answers and cited sources every month, labeled by assistant?',
          '3. Does your score come with a margin, and how big a change counts as real?',
          '4. Does any tool you use claim access to Google’s internal ranking or AI data?',
          '5. What will you never promise me, and will you put that list in writing?',
          '6. What happens in the first 30 days, with dates I can check?',
          '7. Which website fixes go to my vendor, and who chases them until they are live?',
          '8. Will you ever change my business name, address or main category without my sign-off?',
          '9. How do you ask for reviews, and do you confirm no incentives, no gating and no staff quotas?',
          '10. Who drafts review replies, and who at my store approves a reply to a 1-star review?',
          '11. Who writes each page, what first-hand facts does it add, and does anything go live without my approval?',
          '12. Are paid placements labeled as ads, with links tagged sponsored or nofollow?',
          '13. Do you need any of my passwords, or only manager roles and user invites?',
          '14. Do I own every profile, listing, page and video you build, including after I leave?',
          '15. Is the contract month to month, and when is your access removed and my data deleted if I cancel?',
        ],
      },
      {
        type: 'callout',
        title: 'How we answer the same 15',
        body:
          'We hold our own service to this list. The free scan asks ChatGPT and Claude, web search on, up '
          + 'to 20 local buyer questions, 3 times each, and shows who gets named, the sources cited and a '
          + 'score out of 100 with a margin; it does not measure Gemini, Perplexity or Google’s AI Overviews. '
          + 'A person checks it and walks you through it in 20 minutes. Plans are month '
          + 'to month, access runs through manager roles and user invites, never passwords, and what we '
          + 'never promise is listed in the '
          + '[plans section of our service page](/aeo-geo-for-car-dealers/#plans).',
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every platform rule on this page links to the page it came from. Checked September 30, 2026.',
        items: [
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) and the [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).',
          '[Google Search Central: spam policies](https://developers.google.com/search/docs/essentials/spam-policies), [qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) and [generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).',
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt).',
          '[Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[Google Business Profile Help: local ranking](https://support.google.com/business/answer/7091), [review tips](https://support.google.com/business/answer/3474122) and the [Maps user content policy](https://support.google.com/contributionpolicy/answer/7400114).',
          '[FTC: final rule on fake reviews and testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) and the [native advertising guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses).',
          '[OpenAI: overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
        ],
      },
    ],
    faq: [
      ['Should my current SEO agency also do AEO?',
        'It can, if it answers the same 15 questions well. Much of the work overlaps with SEO. Ask about '
        + 'the parts a classic SEO report leaves out: AI search crawler access, review handling by '
        + 'Google’s rules, and the raw answers ChatGPT and Claude give for your market.'],
      ['Is an AI visibility dashboard enough proof of work?',
        'No. Ask for the raw answers behind it, labeled by assistant, plus links to every fix, page and '
        + 'review reply made that month. Google says no third-party tool has access to its internal '
        + 'ranking or AI systems, so any score is an outside measurement with a margin.'],
      ['How long should an AEO contract be?',
        'Month to month is a fair ask. [OpenAI says](https://developers.openai.com/api/docs/bots) '
        + 'robots.txt updates take about 24 hours to be reflected for OAI-SearchBot, while reviews and '
        + 'mentions on other sites build over months. That is a reason to keep checking the work, and no '
        + 'reason for a long lock-in. AutoLander’s plans are month to month.'],
      ['What should an AEO agency never ask for?',
        'Your passwords, your customer list, or the right to publish pages and review replies without '
        + 'your approval. Manager roles and user invites cover the profiles and listings, and every page '
        + 'should need your sign-off.'],
    ],
    cta: {
      heading: 'Ask us the same 15 questions',
      sub:
        'Start with the free scan: ChatGPT and Claude, web search on, up to 20 local buyer questions, 3 '
        + 'runs each. Then put all 15 questions to us on your 20-minute walkthrough.',
    },
  },

  // ---------------------------------------------------------------------------
  // #18  /aeo-geo/aeo-agency-red-flags/
  // ---------------------------------------------------------------------------
  {
    slug: 'aeo-agency-red-flags',
    silo: 'aeoGeo',
    cluster: 'choosing-help',
    publishOrder: 18,
    anchor: 'AEO red flags: guarantees no one can keep, secret dashboards and AI spam',
    crumb: 'AEO red flags',
    primaryKeyword: 'aeo agency red flags',
    secondaryKeywords: [
      'guaranteed chatgpt ranking',
      'can you pay to be recommended by chatgpt',
      'geo scams',
      'ai seo scams',
    ],
    alsoRelated: [
      'chatgpt-ads-for-car-dealers',
      'aeo-cost-for-car-dealerships',
      'aeo-checklist-for-dealerships',
      'llms-txt-for-car-dealerships',
      'local-pr-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'AEO Red Flags: Guarantees No One Can Keep and AI Spam',
    description:
      'AEO and GEO red flags for car dealers: placement promises no one can keep, tools claiming Google '
      + 'data, mass AI pages, bought reviews and paid links.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'AEO red flags: guarantees no one can keep, secret dashboards and AI pages that hurt you',
    tldr:
      'The biggest AEO agency red flags are promises no one can keep and shortcuts the platforms ban: a '
      + 'guaranteed spot in ChatGPT, a tool that claims to see inside Google’s AI, hundreds of AI-written '
      + 'pages, bought reviews or links, and hidden prompts aimed at assistants. OpenAI, Google and '
      + 'Microsoft each say in writing that placement, citations or serving are not guaranteed, so no one '
      + 'can promise them. Honest work shows you the raw answers and puts dates on its own tasks.',
    sections: [
      {
        type: 'qa',
        id: 'no-guaranteed-chatgpt-spot',
        q: 'Why can’t anyone guarantee your dealership shows up in ChatGPT?',
        a: [
          'No one can guarantee your dealership shows up in ChatGPT because no one outside OpenAI controls '
          + 'the answer. ChatGPT can search the web when a question benefits from current information, '
          + 'ranks what it finds using multiple factors and writes a fresh answer each time. OpenAI’s own help page '
          + 'says placement is not guaranteed, so no one can sell it.',
          'The source is [OpenAI’s help page on searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), '
          + 'which says results are ranked on multiple factors meant to find relevant, reliable '
          + 'information. The other platforms say the same thing in their own words. '
          + '[Microsoft’s Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'say “GEO does not guarantee grounding or citations in AI experiences.” '
          + '[Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says meeting every requirement and best practice does not mean Google will crawl, index or '
          + 'serve a page.',
          'What an agency can honestly sell is work: fixes to your site, a complete Business Profile, '
          + 'reviews handled by the rules, pages that answer buyer questions. Our explainer on '
          + '[how ChatGPT recommends dealerships](@how-chatgpt-recommends-car-dealerships) walks through '
          + 'what ChatGPT reads when it picks a store. [AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/) '
          + 'is built the same way: every commitment is a step we control, with a date on it, and our list '
          + 'of what we never promise starts with any position in any AI answer.',
        ],
      },
      {
        type: 'qa',
        id: 'tools-claiming-google-data',
        q: 'Is a tool that claims to see inside Google’s AI a red flag?',
        a: [
          'Yes. Google says no third-party tool has access to its internal ranking or AI systems. It also '
          + 'tells site owners to be wary of tools that claim to use Google’s internal metrics or offer '
          + 'ranking success. An agency whose pitch rests on inside Google data is selling access that '
          + 'Google says no outside tool has.',
          'The line in [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'is short enough to quote: “No third-party tool has access to our internal ranking or AI '
          + 'systems.” The guide is about Google’s AI features, which include AI Overviews and AI Mode. '
          + 'What outside tools can do is ask assistants questions and record the answers. That is useful '
          + 'when the method is shown and the margin is honest.',
          'Treat a dashboard as a red flag when it shows a score with no raw answers, no count of runs '
          + 'per question and no margin. A secret method is a method you cannot check. Our guide on '
          + '[measuring your store’s AI visibility](@measure-dealership-ai-visibility) shows a method your own '
          + 'team can run and compare against any vendor’s numbers.',
        ],
      },
      {
        type: 'qa',
        id: 'mass-ai-pages',
        q: 'Are hundreds of AI-written pages or city pages a red flag?',
        a: [
          'Yes. Google’s spam policies treat many pages made mainly to manipulate rankings as scaled '
          + 'content abuse, however they are produced, including with generative AI. City pages that exist '
          + 'only to funnel shoppers to one inventory page fall under doorway abuse. A plan that measures '
          + 'its value in page count is measuring the wrong thing.',
          '[Google’s spam policies](https://developers.google.com/search/docs/essentials/spam-policies) '
          + 'define scaled content abuse as many pages generated mainly to manipulate rankings rather than '
          + 'help users, whatever tool made them, and list pages aimed at specific regions or cities that '
          + 'funnel users to one page as doorway abuse. Google’s '
          + '[AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'adds that making separate content for every variation of a search, mainly to manipulate '
          + 'rankings or AI responses, violates the same policy, and that “a high quantity of pages doesn’t '
          + 'make a website higher quality.” Its [guidance on generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) '
          + 'says generating many pages without adding value for users may violate that policy too.',
          'Picture a used-car store in a metro area that gets pitched 200 pages: one per suburb, one per '
          + 'model, each written by a tool and none checked by anyone at the store. That is the pattern '
          + 'these policies describe. The honest version is a small number of pages, each answering one '
          + 'real buyer question with facts only your store has, approved by someone who knows the answer. '
          + 'Our guide to [answer-first dealer pages](@answer-pages-for-car-dealerships) shows the '
          + 'difference.',
        ],
      },
      {
        type: 'bullets',
        id: 'buying-mentions-links-reviews',
        h2: 'Are bought mentions, links or reviews AEO agency red flags?',
        intro:
          'Yes, on all three counts. Google says its spam systems filter inauthentic mentions, treats '
          + 'links bought for ranking as spam and bans review incentives, and the FTC’s rule bans buying '
          + 'reviews outright. Paid placements are fine only when they are labeled as ads and their links '
          + 'are tagged.',
        items: [
          'Bought mentions. [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says its AI features can reflect what is said about products and services across blogs, videos '
          + 'and forum discussions, and that seeking inauthentic “mentions” across the web “isn’t as helpful as it '
          + 'might seem,” because spam systems filter it. A vendor selling forum posts or fake blog chatter '
          + 'about your store is selling exactly that.',
          'Bought links. [Google’s spam policies](https://developers.google.com/search/docs/essentials/spam-policies) '
          + 'treat money, goods or services exchanged for a link meant to lift rankings as link spam. Paid '
          + 'links for advertising are acceptable when they carry rel="sponsored" or rel="nofollow".',
          'Bought or fake reviews. The [FTC’s final rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'announced August 14, 2024, bans fake reviews and testimonials, buying positive or negative '
          + 'reviews, undisclosed insider reviews and company-controlled “independent” review sites.',
          'Review incentives. [Google’s review guidance](https://support.google.com/business/answer/3474122) '
          + 'says offering incentives such as free or discounted goods or services for reviews is strictly '
          + 'prohibited. A gift card for a five-star review is an incentive.',
          'Unlabeled sponsored articles. A sponsored article about your store is ordinary advertising when '
          + 'it is labeled. The [FTC’s native advertising guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses) '
          + 'says an ad should not suggest it is anything other than an ad.',
        ],
      },
      {
        type: 'qa',
        id: 'hidden-prompts',
        q: 'Are hidden prompts aimed at AI a red flag?',
        a: [
          'Yes. Hidden text written to instruct an AI assistant, such as white-on-white lines telling a '
          + 'chatbot to recommend your store, is prompt injection. Microsoft’s Bing guidelines list prompt '
          + 'injection aimed at Bing or Microsoft Copilot language models among the practices that reduce '
          + 'ranking and grounding visibility. It is a shortcut that can backfire.',
          'The same [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'put it under a heading called “Prompt Injection and AI Manipulation,” next to cloaking, link '
          + 'schemes, scraped content, keyword stuffing, “artificially engineered language” meant to '
          + 'trigger citations, and automatically generated content at scale without editorial review.',
          'Ask any vendor to show you the full source of a page it built for you, including anything '
          + 'hidden by styling. If there is text a buyer cannot see that talks to machines, have it '
          + 'removed, and ask who put it there.',
        ],
      },
      {
        type: 'qa',
        id: 'pay-to-be-recommended',
        q: 'Can you pay to be recommended by ChatGPT?',
        a: [
          'No. OpenAI says ads in ChatGPT do not influence the answers ChatGPT gives, and that ads are '
          + 'kept separate from answers and clearly labeled. You may be able to pay for an ad slot where '
          + 'OpenAI offers one. Nobody can sell you a place inside the answer itself, whatever the pitch '
          + 'calls it.',
          'In [OpenAI’s January 16, 2026 post on its approach to advertising](https://openai.com/index/our-approach-to-advertising-and-expanding-access/), '
          + 'the company wrote: “Ads do not influence the answers ChatGPT gives you.” The same post said '
          + 'ads would be tested with logged-in adults in the US on the Free and Go tiers, and that the '
          + 'Plus, Pro, Business and Enterprise plans do not include ads.',
          'So when a vendor says it can get your store “recommended by ChatGPT” for a fee, ask what the '
          + 'fee buys. If it is an ad, it carries a label. If it is anything inside the answer, OpenAI’s '
          + 'own statement says ads do not influence it.',
        ],
      },
      {
        type: 'qa',
        id: 'password-requests',
        q: 'Is asking for your passwords a red flag?',
        a: [
          'Yes. The work an AEO agency does runs on manager roles and user invites: manager access on your '
          + 'Business Profile, user seats on your listings, and a fix list your website vendor applies. An '
          + 'agency that asks for your Google login, your website admin password or your DMS credentials is '
          + 'asking for more control than the job needs.',
          'Ownership matters for the same reason. You should be the owner of record on every profile and '
          + 'listing, and every page should live on your own website. If an agency owns the Business '
          + 'Profile your reviews sit on, leaving that agency can turn into a fight over your own store’s '
          + 'listing.',
          'For comparison, AutoLander works through manager roles and user invites only, never asks for '
          + 'passwords, and you own every profile, listing and page we build. If you leave, our access is '
          + 'removed within 5 business days.',
        ],
      },
      {
        type: 'bullets',
        id: 'honest-aeo-work',
        h2: 'What does honest AEO work look like instead?',
        intro:
          'Honest AEO work is visible and checkable. You see the raw answers each month, every fix has a '
          + 'date and a link, paid placements carry labels and tagged links, reviews follow Google’s and '
          + 'the FTC’s rules, and the contract runs month to month so the agency keeps earning your '
          + 'business.',
        items: [
          'Raw answers every month, labeled by assistant, with the sources each one cited and a note on '
          + 'how many runs sit behind every number.',
          'A dated task list: fixes sent to your website vendor, profile changes, listings claimed and '
          + 'pages published, each with a link you can open.',
          'Commitments about work, never about what an AI will say. “Your fix list goes to your vendor '
          + 'within 3 business days” can be checked. “You will be named by ChatGPT in 60 days” cannot.',
          'Reviews asked for the same way from every sold customer, with no incentives, no gating and no '
          + 'staff quotas.',
          'Sponsored placements labeled as advertising, with links tagged sponsored or nofollow, checked '
          + 'on every delivery.',
          'Month-to-month terms, manager access instead of passwords, and everything built in your name.',
          'Before you sign with anyone, run through the 15 questions in our guide on '
          + '[how to choose an AEO agency](@how-to-choose-an-aeo-agency).',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Every rule quoted on this page links to the platform’s own page. Checked September 30, 2026.',
        items: [
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) and [OpenAI: our approach to advertising](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) (January 16, 2026).',
          '[Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) and [generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).',
          '[Google Business Profile Help: review tips](https://support.google.com/business/answer/3474122).',
          '[FTC: final rule on fake reviews and testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) and the [native advertising guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses).',
        ],
      },
    ],
    faq: [
      ['How do I check an agency’s claimed results?',
        'Ask for the raw answers behind any before-and-after claim: the questions, the assistants, '
        + 'the number of runs and the dates. The same question can name different stores from one run '
        + 'to the next, so a single screenshot proves very little. If the agency will not show its '
        + 'method, treat the result as a story.'],
      ['Are AI-written pages against Google’s rules?',
        'Not by themselves. Google’s guidance on generative AI content asks for accuracy, quality and '
        + 'relevance, and says generating many pages without adding value for users may violate its scaled '
        + 'content abuse policy. The trouble is volume without value, however the pages get written. A page '
        + 'a person at your store checked, built on facts only you have, is fine.'],
      ['Is paying for a best dealer award a red flag?',
        'It can be. An award that exists because you paid for it is advertising. The FTC’s native '
        + 'advertising guidance says an ad should not suggest it is anything other than an ad, so the award '
        + 'page should say it is sponsored, and any link to your site should be tagged sponsored or '
        + 'nofollow under Google’s rules. If a vendor presents a paid award as independent recognition, '
        + 'walk away.'],
      ['What if my current agency promised rankings no one can deliver?',
        'Ask them for the raw answers behind their report and a dated list of the work done this quarter. '
        + 'Then hold that list against the 15 questions in our agency guide. You do not have to fire anyone '
        + 'on the spot, but a promise no one can keep should give way to commitments about work you can '
        + 'check.'],
    ],
    cta: {
      heading: 'See the raw answers first',
      sub:
        'The free scan shows what ChatGPT and Claude, web search on, actually say when local buyers ask '
        + 'about stores like yours, and the sources they cite. We never promise what an AI will say, and '
        + 'the 3 fixes in your report are yours to keep.',
    },
  },

  // ---------------------------------------------------------------------------
  // #27  /aeo-geo/chatgpt-ads-for-car-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'chatgpt-ads-for-car-dealers',
    silo: 'aeoGeo',
    cluster: 'choosing-help',
    publishOrder: 27,
    anchor: 'ChatGPT ads for car dealers: how ads differ from being named in the answer',
    crumb: 'ChatGPT ads',
    primaryKeyword: 'chatgpt ads for car dealers',
    secondaryKeywords: [
      'advertise on chatgpt',
      'chatgpt ads for local businesses',
      'oai-adsbot',
      'do chatgpt ads affect answers',
    ],
    alsoRelated: [
      'should-dealers-block-ai-crawlers',
      'aeo-cost-for-car-dealerships',
      'local-pr-for-car-dealerships',
      'best-car-dealership-near-me-ai',
    ],
    augmentKeys: [],
    title: 'ChatGPT Ads for Car Dealers: How Ads Differ From Answers',
    description:
      'What ChatGPT ads are, what OpenAI says about ads and answers, who sees them, and why a paid ad is '
      + 'a different thing from being named in the answer.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'ChatGPT ads for car dealers: what they are and how they differ from being named in an answer',
    tldr:
      'ChatGPT ads for car dealers are the labeled ad placements OpenAI said on January 16, '
      + '2026 it would test with logged-in adults in the US on its Free and Go tiers. OpenAI says those '
      + 'ads do not influence ChatGPT’s answers and are kept separate from them. An ad buys the ad slot; '
      + 'being named in the answer still depends on what ChatGPT’s web search finds and ranks.',
    sections: [
      {
        type: 'qa',
        id: 'what-are-chatgpt-ads',
        q: 'What are ChatGPT ads?',
        a: [
          'ChatGPT ads are paid placements that OpenAI announced on January 16, 2026 it would begin '
          + 'testing for logged-in adults in the United States on the Free and Go tiers. OpenAI says every '
          + 'ad is kept separate from the answer and clearly labeled, so a buyer can tell which part was '
          + 'paid for and which part ChatGPT wrote.',
          'The source for all of it is [OpenAI’s post on its approach to advertising](https://openai.com/index/our-approach-to-advertising-and-expanding-access/), '
          + 'published under Fidji Simo’s name. It reads as a set of principles: ads do not change '
          + 'answers, ads are labeled and separate, and some paid plans carry no ads at all.',
          'What the post does not settle is everything a media buyer asks next: formats, targeting, '
          + 'minimum spend, which business categories can advertise, and when a business can buy on its '
          + 'own. Those details may have changed since January, and the ad details on this page are only '
          + 'what OpenAI published on January 16, 2026. Check OpenAI’s current advertising pages before you '
          + 'plan a budget.',
        ],
      },
      {
        type: 'qa',
        id: 'do-ads-change-answers',
        q: 'Do ads change what ChatGPT recommends?',
        a: [
          'No, according to OpenAI. Its advertising principles say ads do not influence the answers '
          + 'ChatGPT gives. When a buyer asks which dealership to visit, the stores ChatGPT names come from '
          + 'what its web search finds and ranks, and the ad, if one appears, sits apart from that answer '
          + 'with a label on it.',
          'OpenAI put it in one line: “Ads do not influence the answers ChatGPT gives you.” For the answer '
          + 'itself, [OpenAI’s help page on ChatGPT search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'says results are ranked using multiple factors meant to find relevant, reliable information, '
          + 'and that placement is not guaranteed, which means no one can buy or sell it.',
          'Dealers tend to blur this part. A store can run an ad and be missing from the answer, or '
          + 'be named in the answer with no ad at all. Our explainer on '
          + '[how ChatGPT picks which dealers to name](@how-chatgpt-recommends-car-dealerships) covers what the '
          + 'answer depends on: crawler access, readable vehicle pages, consistent store facts and what '
          + 'other sites say about you. Improving those is the job of '
          + '[AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/), which includes no paid ads of '
          + 'any kind.',
        ],
      },
      {
        type: 'qa',
        id: 'who-sees-chatgpt-ads',
        q: 'Who sees ChatGPT ads?',
        a: [
          'Per OpenAI’s January 16, 2026 announcement, ads were planned for logged-in adults in the United '
          + 'States using ChatGPT’s Free and Go tiers. OpenAI said the Plus, Pro, Business and Enterprise '
          + 'plans do not include ads, so buyers who pay for those plans, or use ChatGPT through an '
          + 'employer’s account on them, would not see ads under that plan.',
          'For a dealer, that splits the audience. A shopper on the free app might see an ad near an '
          + 'answer about your market. A shopper who pays for Plus sees only the answer. Being named in '
          + 'the answer is the one position that reaches both.',
          'The audience is large either way. In its DevDay 2026 recap, published September 29, 2026, '
          + '[OpenAI said](https://openai.com/index/devday-2026-recap/) ChatGPT has 1.2 billion weekly '
          + 'users. That figure covers every tier and every topic, so it says nothing about how many of '
          + 'those users are shopping for a car in your market this month.',
        ],
      },
      {
        type: 'qa',
        id: 'what-is-oai-adsbot',
        q: 'What is OAI-AdsBot?',
        a: [
          'OAI-AdsBot is the crawler OpenAI uses to check the safety of web pages submitted as ads on '
          + 'ChatGPT. OpenAI says the data it collects is not used for training. It matters only if you '
          + 'run ChatGPT ads: it looks at the landing pages you submit, and it has nothing to do with '
          + 'whether ChatGPT names you.',
          '[OpenAI’s crawler documentation](https://developers.openai.com/api/docs/bots) lists it next to '
          + 'the company’s other bots, each with its own job: OAI-SearchBot surfaces sites in ChatGPT '
          + 'search, GPTBot collects content that may be used for training, ChatGPT-User handles certain '
          + 'actions a user asks for, and OAI-AdsBot checks ad pages. OpenAI publishes a separate IP list '
          + 'for each, in files such as searchbot.json and adsbot.json.',
          'The bot that decides whether ChatGPT search can show your pages is OAI-SearchBot. '
          + '[OpenAI’s help page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'says a site must allow it, and let OpenAI’s published IP addresses through its host or CDN, to '
          + 'be eligible for ChatGPT search results. If you do run ads, make sure your security settings '
          + 'let OAI-AdsBot reach the landing pages you submit, since that is the bot OpenAI uses to check '
          + 'them.',
        ],
      },
      {
        type: 'table',
        id: 'ad-vs-answer',
        h2: 'How is an ad different from being named in an answer?',
        intro:
          'A ChatGPT ad and a mention in ChatGPT’s answer differ on every line that matters to a dealer. '
          + 'You pay for the ad and OpenAI labels it; ChatGPT decides the answer on its own. The ad reaches '
          + 'only the tiers that show ads, while the answer reaches anyone who asks that question.',
        head: ['Question', 'A ChatGPT ad', 'Named in ChatGPT’s answer'],
        rows: [
          ['Who decides', 'You choose to buy it; OpenAI checks the landing page and labels the ad', 'ChatGPT, from what its web search finds and ranks'],
          ['What it costs', 'Whatever OpenAI charges for the placement; check its current ad pages', 'Nothing paid to OpenAI; the cost is the work on your site, profiles and reviews'],
          ['Label', 'Clearly labeled as an ad, per OpenAI', 'No label; it is part of the answer'],
          ['Who sees it', 'Logged-in US adults on Free and Go, per the January 2026 plan', 'Anyone on any tier whose question leads ChatGPT to name you'],
          ['How long it lasts', 'While you keep paying', 'It can change with every question and run; the sources behind it stay up after the work is done'],
          ['How you measure it', 'The ad platform’s reporting, plus your own UTM tags', 'Asking the same questions repeatedly, plus visits tagged utm_source=chatgpt.com in GA4'],
          ['Does it change the answer', 'No, per OpenAI', 'It is the answer'],
        ],
        note:
          'Ad details are from OpenAI’s January 16, 2026 post. Formats, pricing and eligibility may have '
          + 'changed since; check OpenAI’s current advertising pages.',
      },
      {
        type: 'qa',
        id: 'should-dealers-test-chatgpt-ads',
        q: 'Are ChatGPT ads for car dealers worth testing?',
        a: [
          'ChatGPT ads can be worth a small test for a dealer with a clear offer and clean tracking, if '
          + 'OpenAI’s ad program is open to your business. Treat it like any new channel: one offer, one '
          + 'landing page, a fixed budget and a date to judge it. Check OpenAI’s current ads pages first.',
          'Two cautions keep the test honest. First, rollout details after OpenAI’s January 16, 2026 post '
          + 'are not confirmed on this page, so any date, format or price you hear secondhand needs '
          + 'checking against OpenAI’s own pages. Second, an ad cannot fix what the answer says. If '
          + 'ChatGPT describes your store with old hours, or leaves you out of the answer, a paid ad on '
          + 'the same screen does not change that.',
          'Be wary of anyone who sells ChatGPT ads as a way into the answer. OpenAI says ads do not '
          + 'influence answers, so that pitch belongs on our list of [AEO red flags](@aeo-agency-red-flags). '
          + 'For the record, AutoLander’s AEO and GEO plans do not include paid ads of any kind. The work '
          + 'is on what the answer draws from.',
        ],
      },
      {
        type: 'callout',
        title: 'A hypothetical test',
        body:
          'Picture a franchise store in a mid-size metro that wants to try ChatGPT ads on its certified '
          + 'pre-owned inventory. Before spending, the internet manager asks ChatGPT ten buyer questions '
          + 'about certified pre-owned cars in town, three times each, and writes down who gets named. '
          + 'Then the ad runs to one landing page with its own UTM tags for a fixed month. At the end, the '
          + 'store has two separate readings: what the ad produced, and whether the answers changed. They '
          + 'measure different things, so they stay in separate columns.',
      },
      {
        type: 'bullets',
        id: 'before-buying-ads',
        h2: 'What should a dealership do before buying ads?',
        intro:
          'Before buying ChatGPT ads, make sure ChatGPT can read your website and that your store’s facts '
          + 'agree everywhere, so the answer and the ad tell the same story. An ad that promotes a price '
          + 'your vehicle page hides, or hours your Business Profile contradicts, pays to send buyers into '
          + 'confusion.',
        items: [
          'Let OAI-SearchBot in. [OpenAI’s help page](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'says a site must allow OAI-SearchBot, and let OpenAI’s published IP addresses through its host '
          + 'or CDN, to be eligible for ChatGPT search results. Check your robots.txt and your security '
          + 'service.',
          'Put price, mileage and the full VIN on every vehicle page as plain text, visible when the page '
          + 'loads, so the page an ad or an answer sends a buyer to shows the facts.',
          'Make your store facts match everywhere: name, address, phone and sales hours on your website, '
          + 'Business Profile, Bing Places, Apple Business Connect and your marketplace dealer profiles.',
          'Separate the two in GA4. [OpenAI says](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) '
          + 'ChatGPT adds utm_source=chatgpt.com to referral links from its search, so give any ad its own '
          + 'UTM tags and you can tell ad visits from answer visits.',
          'See what ChatGPT says today. Ask it the questions your buyers ask, several times each, and write '
          + 'down which stores it names and which sources it cites. That baseline is what an ad test gets '
          + 'judged against.',
          'If you hire help, hold them to the questions in our guide on '
          + '[picking an AEO agency](@how-to-choose-an-aeo-agency), and keep ad spend and answer work '
          + 'on separate lines of the budget.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Everything OpenAI says on this page links to OpenAI’s own pages. Checked September 30, 2026.',
        items: [
          '[OpenAI: our approach to advertising and expanding access](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) (January 16, 2026).',
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) and the [publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq).',
          '[OpenAI: overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots).',
          '[OpenAI: DevDay 2026 recap](https://openai.com/index/devday-2026-recap/) (September 29, 2026).',
        ],
      },
    ],
    faq: [
      ['How should a dealer measure a ChatGPT ad test?',
        'Use the ad platform’s reporting and your own campaign tags on the ad’s link, then compare '
        + 'leads from those visits with your other channels. Keep ad visits in their own tags so they '
        + 'never mix with the organic visits ChatGPT’s answers send.'],
      ['Do ChatGPT Plus users see ads?',
        'Not under the plan OpenAI announced on January 16, 2026. It said Plus, Pro, Business and '
        + 'Enterprise do not include ads, and that the test would cover logged-in US adults on the Free and '
        + 'Go tiers. Check OpenAI’s current pages for any change since.'],
      ['Does AutoLander run ChatGPT ads for dealers?',
        'No. AutoLander’s AEO and GEO plans do not include paid ads of any kind. The work covers what '
        + 'ChatGPT and other assistants read: your site’s crawler access and vehicle-page text, your '
        + 'Business Profile and listings, reviews, and answer pages on your own website.'],
      ['Do I need to allow OAI-AdsBot on my website?',
        'Only if you run ChatGPT ads. OpenAI uses OAI-AdsBot to check the safety of pages submitted as ads '
        + 'and says its data is not used for training. For being found in ChatGPT search, the bot that '
        + 'matters is OAI-SearchBot, which OpenAI says a site must allow to be eligible for its search '
        + 'results.'],
    ],
    cta: {
      heading: 'See what ChatGPT says before you buy the ad',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions local buyers ask, 3 '
        + 'times each, and shows who gets named and which sources they cite. A person walks you through it '
        + 'in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #35  /aeo-geo/aeo-cost-for-car-dealerships/   (basics cluster)
  // ---------------------------------------------------------------------------
  {
    slug: 'aeo-cost-for-car-dealerships',
    silo: 'aeoGeo',
    cluster: 'basics',
    publishOrder: 35,
    anchor: 'How much does AEO cost for a car dealership?',
    crumb: 'AEO cost',
    primaryKeyword: 'how much does aeo cost',
    secondaryKeywords: [
      'aeo agency pricing',
      'geo agency cost per month',
      'ai visibility service price',
      'month to month aeo contract',
      'aeo vs paid search budget',
    ],
    alsoRelated: [
      'how-to-choose-an-aeo-agency',
      'aeo-checklist-for-dealerships',
      'local-pr-for-car-dealerships',
      'dealer-group-ai-visibility',
    ],
    augmentKeys: [],
    title: 'How Much Does AEO Cost for a Car Dealership?',
    description:
      'What AEO and GEO cost a car dealership: what drives the price, what you can do free, what never '
      + 'belongs on an invoice, and AutoLander’s plan prices.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How much should a car dealership spend on AEO?',
    tldr:
      'How much does AEO cost for a car dealership? The first fixes, such as letting AI search crawlers '
      + 'into your site, completing your Business Profile and answering reviews, cost staff time more '
      + 'than money. Monthly outside help is priced by scope: AutoLander’s plans are $997, $2,497 or '
      + '$5,997 a month plus a one-time setup of $997, $997 or $2,997, month to month, and every plan '
      + 'starts with a free scan.',
    sections: [
      {
        type: 'qa',
        id: 'aeo-cost-for-a-dealership',
        q: 'How much does AEO cost for a car dealership?',
        a: [
          'AEO costs a car dealership as much as the monthly work it needs, and many first fixes cost '
          + 'nothing but staff time. Crawler settings, Business Profile facts, review replies and vehicle-page text are '
          + 'jobs your own team can start. Outside help is priced by scope; AutoLander’s plans run $997, '
          + '$2,497 or $5,997 a month plus a one-time setup fee.',
          'The price follows the work, so it helps to know what the work is. Most of it sits on top of the '
          + 'SEO your website vendor already does: [Google says](https://developers.google.com/search/docs/appearance/ai-features) '
          + 'there are no additional requirements to appear in AI Overviews or AI Mode beyond being indexed '
          + 'and eligible for a snippet. What AEO adds is attention to what AI assistants read: crawler '
          + 'access, facts as plain text, consistent store details, reviews, and pages that answer buyer '
          + 'questions. Our [AEO vs SEO for car dealers](@aeo-vs-seo-for-car-dealers) explainer draws the '
          + 'line between the two budgets.',
          'Here is how that looks on our own price list. [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/) '
          + 'from AutoLander starts with a free scan and a 20-minute walkthrough, and the 3 fixes in your '
          + 'report are yours to keep whether or not you hire us. If you want the monthly work done, AI '
          + 'Foundation is $997 a month plus $997 setup, AI Authority is $2,497 a month plus $997 setup, '
          + 'and Market Leader is $5,997 a month plus $2,997 setup, all month to month.',
        ],
      },
      {
        type: 'bullets',
        id: 'free-aeo-work',
        h2: 'Which parts of AEO can a dealership do for free?',
        intro:
          'A dealership can do the first round of AEO for free: check that robots.txt and your security '
          + 'service let AI search crawlers in, complete your Google Business Profile, answer every review, '
          + 'and put price, mileage and VIN on vehicle pages as plain text. Google says there is no way to '
          + 'pay for a better local ranking anyway.',
        items: [
          'Crawler access. Open your robots.txt and confirm it allows OAI-SearchBot, Claude-SearchBot and '
          + 'PerplexityBot. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'a site must allow OAI-SearchBot, and let its published IP addresses through the host or CDN, '
          + 'to be eligible for ChatGPT search results.',
          'Your security service. If your site sits behind Cloudflare or a similar service, check that AI '
          + 'search bots are allowed along with Googlebot. That costs a settings review, not a subscription.',
          'Business Profile. [Google says](https://support.google.com/business/answer/7091) there is no way '
          + 'to request or pay for a better local ranking on Google. Accurate categories, hours and services '
          + 'cost only the time it takes to check them.',
          'Review replies. [Google’s review tips](https://support.google.com/business/answer/3474122) ask '
          + 'businesses to reply to reviews, address reviewers by name and respond in a timely manner, and '
          + 'say replies should not be promotional. That takes a person, not a vendor.',
          'Vehicle-page text. Ask your website vendor whether price, mileage and the full VIN appear as '
          + 'plain text when a VDP loads. The ask costs one email.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-you-pay-for',
        h2: 'What are you paying for when you hire help?',
        intro:
          'When you hire AEO help, you pay for recurring work that is easy to let slide: profile upkeep, '
          + 'listings, review replies, chasing your website vendor on fixes, answer pages, sponsored '
          + 'placements, video, and measurement that shows the raw answers. The one-time fixes are cheap; '
          + 'keeping them true month after month is the cost.',
        items: [
          'Profile and listing upkeep. Hours change, departments add services, photos age. Someone has to '
          + 'keep the Business Profile, Bing Places, Apple Business Connect, DealerRater and your '
          + 'marketplace dealer profiles saying the same thing.',
          'Review replies on a clock. Every Google review answered within a set window, with a person '
          + 'approving the replies to 1-star and 2-star reviews.',
          'Vendor follow-up. Website fixes live with your website provider or OEM website program, and the '
          + 'hard part of a fix is often the weekly chase until it ships.',
          'Answer pages. Pages on your own site that each answer one buyer question from your own facts, '
          + 'approved by you before they go live.',
          'Sponsored placements and video. On higher tiers, labeled sponsored articles in publications '
          + 'assistants already cite, and short video answers made from your own footage.',
          'Measurement. A fixed set of buyer questions asked every month, with the raw answers and a '
          + 'margin, so you can see whether anything moved.',
        ],
      },
      {
        type: 'table',
        id: 'autolander-plans',
        h2: 'What does each AutoLander plan include?',
        intro:
          'Each AutoLander plan includes the same core work, including a monthly scan and report, a website '
          + 'fix list, Business Profile management, listings and reviews done by the rules. The plans differ '
          + 'in answer pages, sponsored placements, video, review reply speed, competitor tracking and how '
          + 'often you meet with us. Every plan is month to month.',
        head: ['What you get', 'AI Foundation', 'AI Authority', 'Market Leader'],
        rows: [
          ['Monthly price', '$997', '$2,497', '$5,997'],
          ['One-time setup fee', '$997', '$997', '$2,997'],
          ['Setup fee for AutoLander customers', 'None after 60 active, paid days', 'None after 60 active, paid days', 'None after 60 active, paid days'],
          ['Monthly scan and report', 'Yes', 'Yes', 'Yes'],
          ['Website fix list, including structured data', 'Yes', 'Yes', 'Yes'],
          ['Google Business Profile run for you', 'Yes', 'Yes', 'Yes'],
          ['Core listings, plus 40 directory listings ordered in month 1', 'Yes', 'Yes', 'Yes'],
          ['Answer pages on your own website', '2 a month', '4 a month', '8 a month'],
          ['Sponsored publication placements', 'None', '1 a month', '4 a month'],
          ['Video answers for your YouTube channel', 'None', 'None', '2 a month'],
          ['Google review replies', 'Within 2 business days', 'Within 1 business day', 'Within 1 business day'],
          ['Weekly 10-question competitor watch', 'No', 'Yes', 'Yes'],
          ['Review calls', 'Kickoff, then every quarter', 'Kickoff, then a 30-minute call every month', 'Kickoff, a monthly call and a quarterly planning meeting'],
          ['Brand exclusivity in your market', 'No', 'No', 'Yes'],
          ['How it starts', 'Written agreement after your walkthrough', 'Application after your walkthrough', 'Application'],
        ],
        note:
          'Prices in US dollars, month to month, from AutoLander’s plan table updated September 29, 2026. '
          + 'AI Authority and Market Leader are by application.',
      },
      {
        type: 'callout',
        title: 'The full plan details',
        body:
          'The complete list, including what every plan includes, what we never promise and what no plan '
          + 'includes, is in the [plans section of our service page](/aeo-geo-for-car-dealers/#plans). '
          + 'Dealer groups are priced per rooftop from the same table, and each rooftop can be on a '
          + 'different plan. AutoLander customers pay no setup fee once their AutoLander subscription at '
          + 'that rooftop has been active and paid for the prior 60 days.',
      },
      {
        type: 'bullets',
        id: 'never-on-an-invoice',
        h2: 'What should never be on an AEO invoice?',
        intro:
          'Five things should never be on an AEO invoice: a guaranteed placement in any AI answer, a paid '
          + 'boost to your local ranking, paid links without a sponsored or nofollow tag, bought reviews, '
          + 'and a tool fee justified by access to Google’s internal data. Each one is either impossible '
          + 'or against the platforms’ own rules.',
        items: [
          'A guaranteed spot in ChatGPT or Bing’s AI answers, which no one can sell. '
          + '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'placement in ChatGPT search is not guaranteed, and '
          + '[Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say '
          + 'GEO does not guarantee grounding or citations.',
          'A paid local ranking boost. [Google says](https://support.google.com/business/answer/7091) there '
          + 'is no way to request or pay for a better local ranking on Google.',
          'Paid links without a tag. [Google’s spam policies](https://developers.google.com/search/docs/essentials/spam-policies) '
          + 'treat links bought for ranking as link spam; paid links are fine for advertising when they '
          + 'carry rel="sponsored" or rel="nofollow".',
          'Bought reviews. The [FTC’s rule on fake reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) '
          + 'bans buying positive or negative reviews, and Google prohibits offering incentives for them.',
          'A fee for inside Google data. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'no third-party tool has access to its internal ranking or AI systems.',
          'If a proposal includes any of these, our list of [AEO agency red flags](@aeo-agency-red-flags) explains '
          + 'what to ask next.',
        ],
      },
      {
        type: 'qa',
        id: 'aeo-budget-vs-paid-search',
        q: 'How should a dealer budget AEO next to paid search?',
        a: [
          'Budget AEO as its own line next to paid search, because the two buy different things. Ads buy a '
          + 'labeled slot for as long as you pay. AEO work improves what assistants read about your store, '
          + 'and OpenAI says ChatGPT’s ads do not influence its answers, so ad spend cannot stand in for '
          + 'that work.',
          '[OpenAI’s post on its approach to advertising](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) '
          + 'is plain on the point: “Ads do not influence the answers ChatGPT gives you.” Google draws the '
          + 'same line for local results, where there is no way to pay for a better ranking. Paid search, '
          + 'vehicle ads and ChatGPT ads, where you run them, are placements you rent by the month. A '
          + 'mention in the answer rests on your site, your profiles and what other sites say about you.',
          'A practical setup: fund AEO from the marketing budget, but judge it on its own numbers. Are '
          + 'assistants naming the store for its key buyer questions? Do visits from AI assistants show up '
          + 'in GA4? Are the store facts assistants repeat correct? For the ad side, see our guide to '
          + '[ChatGPT ads for car dealers](@chatgpt-ads-for-car-dealers).',
        ],
      },
      {
        type: 'qa',
        id: 'month-to-month-aeo',
        q: 'Is a month-to-month contract normal?',
        a: [
          'A month-to-month contract is a fair thing to ask any AEO provider for, and every AutoLander plan '
          + 'is month to month. You can cancel any time before your next billing date and keep every '
          + 'profile, listing, page and video built in your name. A long lock-in mainly protects the '
          + 'agency, since results in AI answers are never guaranteed.',
          'Some of the work registers quickly and some takes months. [OpenAI says](https://developers.openai.com/api/docs/bots) '
          + 'robots.txt changes take about 24 hours to be reflected for OAI-SearchBot, while reviews, '
          + 'answer pages and mentions on other sites build over months. Our guide on '
          + '[how long AEO takes](@how-long-does-aeo-take-to-work) lays out a realistic timeline, and like '
          + 'us it never promises an outcome.',
          'If you leave AutoLander, our access is removed within 5 business days, and we delete your scan '
          + 'data and reports within 30 days and confirm it in writing.',
        ],
      },
      {
        type: 'qa',
        id: 'does-outside-ai-help-pay-off',
        q: 'Does an outside AI partner pay off?',
        a: [
          'An outside AI partner can pay off, but no survey proves it will for your store. In Cox '
          + 'Automotive’s AI in Auto Retail Tracker, released August 11, 2026, dealers with an external AI '
          + 'partner were more likely to report using AI optimally and seeing revenue growth from it. That '
          + 'is a survey correlation, so measure your own results.',
          'The figures, from [Cox Automotive’s release](https://www.coxautoinc.com/press-releases/new-cox-automotive-ai-in-auto-retail-tracker/): '
          + 'dealers with an outside AI partner were more likely to say they use AI optimally (66% vs 46%), '
          + 'to be highly confident in AI outputs (30% vs 8%) and to have seen sales or revenue growth from '
          + 'AI (36% vs 21%). Only 13% of dealers had an outside AI partner. The tracker covers AI across '
          + 'the dealership, from follow-up to content, so it says nothing specific about AEO.',
          'The same tracker shows how often expectations run ahead of results: 69% of dealers expected AI '
          + 'to drive sales and revenue growth, only 22% had seen it, and about 1 in 3 were not measuring '
          + 'AI’s impact or lacked clarity on it. That last group is the one to stay out of. Set a baseline '
          + 'before you spend: the questions buyers ask, what assistants answer today, and the AI Assistant '
          + 'visits in GA4.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Third-party rules and figures on this page link to their sources. Plan prices are AutoLander’s own. Checked September 30, 2026.',
        items: [
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) and the [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).',
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), [OpenAI: our approach to advertising](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) and the [overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots).',
          '[Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[Google Business Profile Help: local ranking](https://support.google.com/business/answer/7091) and [review tips](https://support.google.com/business/answer/3474122).',
          '[Google Search Central: spam policies](https://developers.google.com/search/docs/essentials/spam-policies) and the [FTC final rule on fake reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials).',
          '[Cox Automotive: AI in Auto Retail Tracker release](https://www.coxautoinc.com/press-releases/new-cox-automotive-ai-in-auto-retail-tracker/) (August 11, 2026).',
        ],
      },
    ],
    faq: [
      ['Is there a setup fee for AEO?',
        'At AutoLander, yes: $997 for AI Foundation or AI Authority and $2,997 for Market Leader, charged '
        + 'once. AutoLander customers pay no setup fee once their AutoLander subscription at that rooftop '
        + 'has been active and paid for the prior 60 days. Other providers set their own terms, so ask what '
        + 'the setup fee covers.'],
      ['What does the free scan cost?',
        'Nothing. It asks ChatGPT and Claude, each with web search on, up to 20 local buyer questions '
        + '3 times each, and a person walks you through the result and the 3 fixes in 20 minutes.'],
      ['Do AutoLander Marketplace customers pay a setup fee?',
        'Not after 60 days. AutoLander customers pay no setup fee on any AEO and GEO plan once their '
        + 'AutoLander subscription at that rooftop has been active and paid for the prior 60 days. The '
        + 'monthly plan price stays the same.'],
      ['Is AEO cheaper than SEO?',
        'It depends on scope, and the two overlap. Google says there are no additional requirements to '
        + 'appear in AI Overviews or AI Mode, so AEO builds on the SEO your website vendor already does '
        + 'rather than replacing it. Many AEO fixes, such as crawler access and review replies, cost time '
        + 'rather than money; the monthly cost comes from keeping that work going.'],
    ],
    cta: {
      heading: 'Price it against your own gaps',
      sub:
        'The free scan names the 3 fixes to make first, and they are yours to keep whether or not you hire '
        + 'us. ChatGPT and Claude, web search on, up to 20 local buyer questions, 3 runs each, walked '
        + 'through with a person in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #36  /aeo-geo/aeo-checklist-for-dealerships/
  // ---------------------------------------------------------------------------
  {
    slug: 'aeo-checklist-for-dealerships',
    silo: 'aeoGeo',
    cluster: 'choosing-help',
    publishOrder: 36,
    anchor: 'AEO checklist for car dealerships: 25 checks for this week',
    crumb: 'AEO checklist',
    primaryKeyword: 'aeo checklist',
    secondaryKeywords: [
      'geo checklist',
      'ai search checklist for dealerships',
      'ai visibility audit checklist',
      'aeo audit',
    ],
    alsoRelated: [
      'should-dealers-block-ai-crawlers',
      'how-to-respond-to-car-dealership-reviews',
      'answer-pages-for-car-dealerships',
      'car-dealership-schema-markup',
      'measure-dealership-ai-visibility',
      'llms-txt-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'AEO Checklist for Car Dealerships: 25 Checks This Week',
    description:
      'AEO checklist for car dealerships: 25 checks your internet manager can run this week on crawlers, '
      + 'vehicle pages, profiles, reviews and content.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'AEO checklist for car dealerships: 25 things your internet manager can check this week',
    tldr:
      'This AEO checklist gives your internet manager 25 yes-or-no checks in five groups: crawler access, '
      + 'vehicle pages, Business Profile and listings, reviews, and content and measurement. None needs a '
      + 'paid tool, and most take a few minutes. Start with crawler access, because a crawler that is '
      + 'shut out of your site brings back nothing an assistant can quote.',
    sections: [
      {
        type: 'qa',
        id: 'what-the-checklist-covers',
        q: 'What should an AEO checklist for a dealership cover?',
        a: [
          'An AEO checklist for a dealership should cover five areas with five checks each: whether AI '
          + 'search crawlers can reach your site, whether vehicle pages show their facts as text, whether '
          + 'your Business Profile and listings agree, whether reviews follow the rules, and whether you '
          + 'publish answers and measure what assistants say.',
          'Every check is a yes or a no, and none needs a paid tool. A browser, your robots.txt file, your '
          + 'CDN or security dashboard, your Business Profile, GA4 and Search Console cover all 25. Mark '
          + 'each one, fix the ones that fail in the order at the end of this page, and run the list again '
          + 'next quarter.',
          'The list covers what your own team can check today. The monthly version of this work, with the '
          + 'raw answers from ChatGPT and Claude every month, is what [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/) '
          + 'from AutoLander does, and you can run every check here without us.',
        ],
      },
      {
        type: 'bullets',
        id: 'crawler-access-checks',
        h2: 'Crawler access: which 5 checks come first?',
        intro:
          'Crawler access comes first because a page an assistant’s crawler cannot open gives it nothing '
          + 'to quote. Check that robots.txt allows the search crawlers from OpenAI, Anthropic and '
          + 'Perplexity, that your host or CDN lets OpenAI’s published IP addresses through, and that your '
          + 'security service keeps AI search bots allowed.',
        items: [
          'Check 1: robots.txt allows OAI-SearchBot. Open yoursite.com/robots.txt and look for a Disallow '
          + 'rule that names OAI-SearchBot or blocks every bot. '
          + '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) a '
          + 'site must allow OAI-SearchBot to be eligible for ChatGPT search results. Blocking GPTBot, '
          + 'OpenAI’s training crawler, is a [separate choice](https://developers.openai.com/api/docs/bots).',
          'Check 2: robots.txt allows Claude-SearchBot and Claude-User. '
          + '[Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'blocking Claude-SearchBot prevents indexing for search and blocking Claude-User prevents '
          + 'retrieval when Claude users ask questions, and both reduce visibility. ClaudeBot, its training '
          + 'crawler, is a separate choice.',
          'Check 3: robots.txt allows PerplexityBot. [Perplexity says](https://docs.perplexity.ai/guides/bots) '
          + 'PerplexityBot surfaces and links sites in its search results, respects robots.txt and is not '
          + 'used to crawl content for AI foundation models.',
          'Check 4: your host or CDN lets OpenAI’s published IP addresses through. OpenAI’s help page names '
          + 'this as the second condition for ChatGPT search eligibility, next to robots.txt. Ask whoever '
          + 'runs your CDN or firewall to confirm it in writing.',
          'Check 5: your security service keeps AI search bots allowed. '
          + '[Cloudflare announced](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) '
          + 'that from September 15, 2026, new domains would get defaults that block bots it classifies as '
          + 'Training or Agent on pages that display ads, while Search bots stay allowed. Confirm what your own setting says. '
          + 'Use our guide to [check whether ChatGPT and Claude can read your website](@can-chatgpt-see-my-dealer-website) '
          + 'for the step-by-step.',
        ],
      },
      {
        type: 'bullets',
        id: 'vehicle-page-checks',
        h2: 'Vehicle pages: which 5 checks matter?',
        intro:
          'Vehicle detail pages matter because they carry the facts buyers ask about. Check that price, '
          + 'mileage, VIN and availability show as text when the page loads, that the facts are in the HTML '
          + 'without scripts, that descriptions go beyond year, make and model, that sold units are '
          + 'handled, and that markup matches the page.',
        items: [
          'Check 6: price, mileage, VIN and availability are visible on load. Google’s '
          + '[vehicle ads requirements](https://support.google.com/merchants/answer/15312145) ask for the '
          + 'dealership name and location, price, VIN, mileage for used vehicles and availability, clearly '
          + 'visible without extra clicks such as “More Details.” That is a sound standard for any VDP an '
          + 'assistant reads.',
          'Check 7: those facts are in the HTML itself. Use your browser’s view-source on one VDP and '
          + 'search for the VIN. [A 2024 analysis by Vercel and MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) '
          + 'found none of the major AI crawlers it measured rendered JavaScript at the time, while Gemini, '
          + 'through Googlebot, did.',
          'Check 8: descriptions go beyond year, make and model. '
          + '[Cox Automotive recommends](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'that dealers enrich inventory data with features, packages, fuel economy, safety tech, seating '
          + 'and towing.',
          'Check 9: sold units are handled. A sold car’s page says sold or points to similar inventory, and '
          + 'dead vehicle URLs get cleaned up. In the same 2024 '
          + '[Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler), ChatGPT’s crawler spent '
          + '34.82% of its fetches on pages that returned 404.',
          'Check 10: structured data matches the visible page. If your platform adds AutoDealer, Vehicle '
          + 'or Offer markup, the price and mileage in it must match what the page shows. '
          + '[Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say '
          + 'markup must accurately reflect visible content, and '
          + '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'structured data is not required for generative AI search. Our guide to '
          + '[VDPs that AI tools can read](@vehicle-detail-page-ai-readable) covers the fields.',
        ],
      },
      {
        type: 'bullets',
        id: 'business-profile-checks',
        h2: 'Business Profile and listings: which 5 checks matter?',
        intro:
          'Your Business Profile and listings are the public record of who you are, so they need to agree. '
          + 'Check that the profile uses your real-world name without keywords, the most specific '
          + 'categories and car sales hours, that service has its own profile only if it runs as a separate '
          + 'entity, and that name, address and phone match everywhere.',
        items: [
          'Check 11: the profile name matches your real-world name. '
          + '[Google’s guidelines](https://support.google.com/business/answer/3038177) say business names '
          + 'must match the real-world name, with no added service, product or location keywords. Your '
          + 'store’s name alone passes; the name plus “best used cars” and a city fails.',
          'Check 12: categories are as specific as possible. The same guidelines ask for the most specific '
          + 'category that fits, such as a brand dealer category for a franchise store rather than a '
          + 'generic one.',
          'Check 13: hours are car sales hours. For dealerships, Google says to list car sales hours, and to '
          + 'use the new-car sales hours if new and pre-owned hours differ.',
          'Check 14: service has its own profile only if it operates as a distinct entity. Google’s '
          + 'guidelines allow separate profiles for departments with their own entrance and distinct '
          + 'categories; its example is a Service & Parts profile categorized as Auto Repair Shop next to a '
          + 'Toyota Dealer main profile. Brand names should not be combined into one profile. See '
          + '[how your Business Profile feeds AI answers](@google-business-profile-ai-answers) for the rest.',
          'Check 15: name, address and phone match everywhere. Compare your website footer, Business '
          + 'Profile, Bing Places, Apple Business Connect, Facebook Page, DealerRater and marketplace dealer '
          + 'profiles. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) clear '
          + 'entity definition improves grounding visibility and citation accuracy.',
        ],
      },
      {
        type: 'bullets',
        id: 'review-checks',
        h2: 'Reviews: which 5 checks matter?',
        intro:
          'Reviews need five checks: that you actually ask with a link or QR code, that replies go out '
          + 'promptly and read like a person rather than an ad, and that nothing in your process offers '
          + 'incentives, filters out unhappy buyers or gives staff a review quota. Google’s own help pages '
          + 'set these rules.',
        items: [
          'Check 16: every sold customer gets a review link or QR code. '
          + '[Google’s review tips](https://support.google.com/business/answer/3474122) suggest reminding '
          + 'customers to leave reviews through a link or QR code.',
          'Check 17: replies go out in a timely manner and never read like an ad. The same page asks '
          + 'businesses to reply, address reviewers by name and respond promptly, and says replies should '
          + 'not be promotional.',
          'Check 18: no incentives. Google '
          + '[strictly prohibits](https://support.google.com/business/answer/3474122) offering free or '
          + 'discounted goods or services in exchange for reviews, and the '
          + '[FTC’s rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) '
          + 'bans buying positive or negative reviews.',
          'Check 19: no review gating. [Google’s Maps content policy](https://support.google.com/contributionpolicy/answer/7400114) '
          + 'bars discouraging negative reviews or selectively asking for positive ones. If your survey sends '
          + 'only happy customers on to Google, turn that step off.',
          'Check 20: no staff quotas. The same policy says businesses should not ask staff to collect a '
          + 'certain number of reviews, or ask for reviews that name a staff member. Check the pay plan and '
          + 'the sales board.',
        ],
      },
      {
        type: 'bullets',
        id: 'content-measurement-checks',
        h2: 'Content and measurement: which 5 checks matter?',
        intro:
          'The last five checks ask whether you publish answers to buyer questions and whether you can see '
          + 'AI in your own numbers: an FAQ and answer pages on your site, the AI Assistant channel in GA4, '
          + 'ChatGPT’s referral tag in your reports, Search Console’s generative AI report, and a fixed '
          + 'question set you ask monthly.',
        items: [
          'Check 21: an FAQ page and answer pages exist. Your site answers the questions buyers ask before '
          + 'they visit, such as trade-in steps, financing options and service hours, each in its first '
          + 'sentence, from your own facts. [Cox Automotive recommends](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'that dealers publish content answering shopper questions, including comparisons, trade-in '
          + 'guidance and financing FAQs.',
          'Check 22: GA4’s AI Assistant channel is in your reports. '
          + '[Google added](https://support.google.com/analytics/answer/9164320) an AI Assistant channel to '
          + 'GA4’s default channel group, naming ChatGPT, Gemini and Claude as examples. Visits from AI '
          + 'Overviews and AI Mode count as Organic Search under '
          + '[GA4’s channel definitions](https://support.google.com/analytics/answer/9756891).',
          'Check 23: utm_source=chatgpt.com shows up. '
          + '[OpenAI says](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) '
          + 'ChatGPT adds utm_source=chatgpt.com to referral links. Search your GA4 traffic sources for it.',
          'Check 24: someone read Search Console’s generative AI report this month. '
          + '[Google says](https://support.google.com/webmasters/answer/16984139) the Generative AI '
          + 'performance report shows impressions from AI Overviews and AI Mode by page, country, date and '
          + 'device, and that it rolled out to all websites as of August 31, 2026.',
          'Check 25: a fixed set of buyer questions gets asked every month. Write down 10 to 20 questions a '
          + 'local buyer would ask, put each to ChatGPT and Claude several times, and record who gets named '
          + 'and which sources are cited. Keep the questions the same so changes mean something.',
        ],
      },
      {
        type: 'steps',
        h2: 'What should you fix first?',
        intro:
          'Fix in this order: crawler access, vehicle-page text, Business Profile facts, reviews, then '
          + 'content. Each step makes the next one count. An answer page does little if crawlers are '
          + 'blocked, and a perfect profile cannot help much if your vehicle pages hide the price an '
          + 'assistant needs to quote.',
        steps: [
          {
            title: 'Open the doors (checks 1 to 5)',
            body:
              'Fix robots.txt and your security settings first. These are small edits, and '
              + '[OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt changes take about '
              + '24 hours to be reflected for OAI-SearchBot.',
          },
          {
            title: 'Put the facts on the page (checks 6 to 10)',
            body:
              'Send your website vendor one written request covering price, mileage, VIN and availability '
              + 'as HTML text, richer descriptions, sold-unit handling and markup that matches the page. If '
              + 'your site runs on an OEM website program, ask whether the change needs the program’s '
              + 'approval.',
          },
          {
            title: 'Correct the profile (checks 11 to 15)',
            body:
              'Fix the name, categories and hours on your Business Profile, then make every listing match '
              + 'it, starting with Bing Places, Apple Business Connect and DealerRater.',
          },
          {
            title: 'Clean up reviews (checks 16 to 20)',
            body:
              'Remove any incentive, gating or quota from the process, then set a steady ask and a reply '
              + 'routine. The BDC manager or a sales manager can own it.',
          },
          {
            title: 'Publish and measure (checks 21 to 25)',
            body:
              'Start with the questions your fixed question set shows you missing from, answer each on its '
              + 'own page, and watch GA4 and Search Console. If you would rather hand the monthly work to '
              + 'someone, use our guide on [choosing an AEO partner](@how-to-choose-an-aeo-agency) to '
              + 'vet them.',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Each check that rests on a platform rule or a study links to it above. Checked September 30, 2026.',
        items: [
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), the [publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) and the [overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots).',
          '[Anthropic: how Claude’s crawlers work](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) and [Perplexity: bots](https://docs.perplexity.ai/guides/bots).',
          '[Cloudflare Docs: block AI bots](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) and [Vercel: the rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler) (December 17, 2024).',
          '[Google Merchant Center: vehicle ads activation](https://support.google.com/merchants/answer/15312145), [Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) and [Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).',
          '[Google Business Profile Help: guidelines](https://support.google.com/business/answer/3038177), [review tips](https://support.google.com/business/answer/3474122) and the [Maps user content policy](https://support.google.com/contributionpolicy/answer/7400114); the [FTC final rule on fake reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials).',
          '[Cox Automotive: how AI is influencing vehicle discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) (August 26, 2026).',
          '[Google Analytics Help: what’s new](https://support.google.com/analytics/answer/9164320), [default channel group](https://support.google.com/analytics/answer/9756891) and [Search Console Help: Generative AI performance report](https://support.google.com/webmasters/answer/16984139).',
        ],
      },
    ],
    faq: [
      ['How long does this AEO checklist take?',
        'Most checks take a few minutes each with a browser and the right logins, so one person can mark '
        + 'all 25 in an afternoon. Fixing the ones that fail takes longer, mostly where your website vendor '
        + 'has to make the change.'],
      ['Who at the dealership should run the checklist?',
        'The internet or digital marketing manager is the natural owner, with help from whoever manages '
        + 'your website vendor, your Business Profile and your review process. In a smaller store that may '
        + 'be the GM. The BDC manager is a good owner for the five review checks.'],
      ['Do I need paid tools to run an AEO audit?',
        'No. A browser, your robots.txt file, your CDN or security dashboard, your Business Profile, GA4 '
        + 'and Search Console cover all 25 checks. A paid tool can save time on the monthly question set, '
        + 'but Google says no third-party tool has access to its internal ranking or AI systems, so treat '
        + 'any tool’s score as an outside measurement.'],
      ['What if my website vendor controls most of these checks?',
        'Then your job is the request. Send one written list of the failing checks, ask for a date on '
        + 'each, and re-check the live site when the vendor reports it done. Crawler access and '
        + 'vehicle-page text often sit with the vendor, so this is a normal conversation to have.'],
    ],
    cta: {
      heading: 'Want a second pair of eyes on the checklist?',
      sub:
        'The free scan checks your AI crawler access and security service, reads up to five of your '
        + 'vehicle pages, asks ChatGPT and Claude up to 20 local buyer questions 3 times each, and names the '
        + '3 fixes to make first.',
    },
  },
];
