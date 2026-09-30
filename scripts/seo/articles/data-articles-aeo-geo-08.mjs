// AEO and GEO silo, batch 08 (2026-09-30): the content pillar and the FAQ page (cluster
// "content"), then Reddit, review sites and local PR (cluster "reputation").
// Publish numbers: 5, 14, 39, 44, 48 (plan.json `order`, mirrored in `publishOrder`).
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Link rules (Michael, 2026-09-30): in-body sibling links use ONLY the publish-aware token
// [anchor](@slug) and point ONLY to articles with a LOWER publish number, so publishing in order
// never creates a dead link. Later siblings connect through alsoRelated, which the builder renders
// once they are live. The only hand-written internal href is the live money page.
// House style: no em or en dashes, no negation-then-reveal cadence, every third-party number or
// claim from the silo fact bank with its source linked, nothing promised that no one can promise.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #5 /aeo-geo/answer-pages-for-car-dealerships/  (content pillar)
  // ---------------------------------------------------------------------------
  {
    slug: 'answer-pages-for-car-dealerships',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 5,
    anchor: 'Answer pages for car dealerships: what they are and how to write one',
    crumb: 'Answer pages',
    primaryKeyword: 'answer pages for car dealerships',
    secondaryKeywords: [
      'aeo content for dealerships',
      'answer-first writing',
      'how to write for ai overviews',
      'question pages for dealer websites',
    ],
    alsoRelated: [
      'aeo-vs-seo-for-car-dealers',
      'car-dealership-faq-page',
      'model-comparison-pages-for-dealers',
      'google-ai-overviews-for-car-dealers',
      'google-ai-mode-for-car-dealers',
      'youtube-for-car-dealerships-ai',
    ],
    augmentKeys: ['aiDealers'],
    title: 'Answer Pages for Car Dealerships: How to Write One',
    description:
      'What an answer page is, why AI tools and search engines quote pages written this way, and a '
      + 'step-by-step template for your buyer questions.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Answer pages for car dealerships: what they are and how to write one',
    tldr:
      'Answer pages for car dealerships are pages on your own website that each answer one buyer '
      + 'question in the first sentence, using only your store’s facts, then give the detail, the '
      + 'local specifics, a short FAQ and a last-updated date. They match what [Bing '
      + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) makes a page more '
      + 'likely to be cited: explicit facts, near the top, that stand on their own. Start with the '
      + 'questions where AI answers name other stores today, write one page per question, and keep '
      + 'every fact current.',
    sections: [
      {
        type: 'qa',
        id: 'what-is-an-answer-page',
        q: 'What is an answer page?',
        a: [
          'An answer page is a page on your dealership’s own website that answers one buyer question '
          + 'in its first sentence, using only your store’s facts. Below that direct answer it gives '
          + 'the detail, the local specifics a buyer needs, a short FAQ and a date showing when the '
          + 'facts were last checked.',
          'Think of the questions your salespeople, BDC and service advisors answer every day, such '
          + 'as “Do you take trades on cars you didn’t sell?” or “Can I buy from out of state?” Each '
          + 'can be a page that says what your store actually does, in plain words, so a buyer, a '
          + 'search engine or an AI assistant can take the answer without guessing.',
          'Answer pages are the content half of [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/). '
          + 'The technical fixes let AI tools read your site; answer pages give them something worth '
          + 'quoting when a local buyer asks. This guide uses the same format it teaches: question '
          + 'headings, a short answer under each one and an FAQ at the end.',
        ],
      },
      {
        type: 'qa',
        id: 'why-ai-quotes-answer-pages',
        q: 'Why do AI answers quote pages written this way?',
        a: [
          'Pages written this way are easier for AI answers to use, and the search engines say so. '
          + '[Bing’s webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'say pages are more likely to be picked for grounding and citations when facts stand on '
          + 'their own and key information sits near the top, and Google’s ranking systems already '
          + 'judge individual passages of a page.',
          'Bing asks for explicit facts visible on the URL itself, one topic per URL and the '
          + 'essential information near the top. When it announced its AI Performance report in '
          + 'February 2026, [Bing '
          + 'added](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview) '
          + 'that clear headings, tables and FAQ sections help AI systems reference content '
          + 'accurately, and that claims should be supported with examples, data and cited sources.',
          '[Google’s ranking systems guide](https://developers.google.com/search/docs/appearance/ranking-systems-guide) '
          + 'describes passage ranking, which judges individual sections of a page, so one '
          + 'well-written section can answer a question on a page that covers more. Our guide to [how ChatGPT picks which dealers to name](@how-chatgpt-recommends-car-dealerships) covers what '
          + 'ChatGPT reads when it searches the web.',
        ],
      },
      {
        type: 'table',
        id: 'answer-page-vs-blog-vs-faq',
        h2: 'How is an answer page different from a blog post or FAQ page?',
        intro:
          'An answer page covers one buyer question in depth and answers it in the first sentence. A '
          + 'blog post usually tells a story or shares news and can take its time, and an FAQ page '
          + 'collects many short answers in one place. All three belong on a dealer site, and each '
          + 'does a different job.',
        head: ['Compared on', 'Answer page', 'Blog post', 'FAQ page'],
        rows: [
          ['Scope', 'One buyer question, fully answered', 'A story, an event or store news', 'Many common questions, one short answer each'],
          ['Opening', 'The direct answer in the first sentence', 'Often a hook or an introduction', 'Each question followed by its answer'],
          ['Facts', 'Only your store’s facts: policies, hours, services, process', 'Opinions, updates and announcements', 'Short versions of your policies'],
          ['Length', 'As long as the real follow-up questions need', 'Any length', 'Two to four sentences per answer'],
          ['Updates', 'Whenever a fact changes, with a last-updated date', 'Rarely touched after publishing', 'Reviewed on a schedule, such as quarterly'],
          ['Links', 'Up to the department page and across to related answer pages', 'To related posts and offers', 'Out to the answer page that goes deeper'],
        ],
        note: 'An FAQ entry can give the short version of a question and link to the full answer page.',
      },
      {
        type: 'bullets',
        id: 'choosing-questions',
        h2: 'How do you choose which questions to answer?',
        intro:
          'Start with the buyer questions where AI assistants name other dealers and leave your store '
          + 'out, then add the topics Cox Automotive recommends dealers cover: model comparisons, '
          + 'trade-in guidance, financing FAQs, family vehicle picks and EV ownership. Choose '
          + 'questions real buyers in your market ask, one question per page.',
        items: [
          'Questions where you are missing today. Ask ChatGPT and Claude, with web search on, what a '
          + 'buyer in your town would ask, and note which stores get named. The free scan does this '
          + 'for up to 20 local buyer questions, 3 runs each.',
          'The topics Cox Automotive names. A [Cox Automotive article on AI and vehicle '
          + 'discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + '(August 2026) says shoppers now often start with a question to an AI tool, and it '
          + 'recommends dealers publish content that answers those questions.',
          'What buyers ask your people. Read a month of BDC call notes, chat transcripts and '
          + 'service-drive questions. Our guide to [how car buyers use ChatGPT](@how-car-buyers-use-chatgpt) '
          + 'shows the research buyers now do before they call.',
          'Questions only your store can answer, such as “Do you service hybrids from other brands?” '
          + 'No national site can answer those for you.',
          'One question, one page. [Google '
          + 'warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that '
          + 'separate content for every variation of a search, made mainly to manipulate rankings or '
          + 'AI responses, violates its scaled content abuse policy.',
          'Be honest about what depends on someone else. If the true answer is “it depends on the '
          + 'lender,” say so and explain what it depends on.',
        ],
      },
      {
        type: 'steps',
        h2: 'How should answer pages for car dealerships be structured?',
        intro:
          'An answer page should open with the buyer’s question as its heading and a direct answer '
          + 'of 40 to 60 words under it. The detail comes next, then your local facts, the sources you '
          + 'relied on, a short FAQ and a last-updated date. The same order works for every question '
          + 'you write.',
        steps: [
          {
            title: 'Put the question in the heading',
            body:
              'Use the words a buyer would use, such as “Can I trade in a car I still owe money on?” '
              + '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
              + 'its AI systems understand synonyms and general meaning, so skip the keyword variations.',
          },
          {
            title: 'Answer in the first 40 to 60 words',
            body:
              'The first sentence answers the question and names what it is about. Bing’s guidelines '
              + 'warn against long introductions before the main topic.',
          },
          {
            title: 'Give the detail',
            body:
              'Explain how it works at your store: steps, documents, timing and exceptions, with a '
              + 'short list or table where a buyer compares options.',
          },
          {
            title: 'Add your local facts',
            body:
              'Name the rooftop, the department, the hours and the people who handle it. No other site '
              + 'has these facts.',
          },
          {
            title: 'Show your sources',
            body:
              'Link the source for anything about a lender, a manufacturer or a state rule, and label '
              + 'your own policy as yours.',
          },
          {
            title: 'End with a short FAQ',
            body: 'Add three to five follow-up questions with two- or three-sentence answers.',
          },
          {
            title: 'Date it, then make sure AI can read it',
            body:
              'Show a last-updated date that changes only when you check the facts. Then [run the AI crawler access check](@can-chatgpt-see-my-dealer-website): '
              + 'a page behind a blocked crawler or a bot challenge cannot be read by the assistants it '
              + 'blocks.',
          },
        ],
      },
      {
        type: 'callout',
        title: 'A hypothetical example',
        body:
          'A used-car store in a metro area asks ChatGPT and Claude where to trade in a car that still '
          + 'has a loan on it, and both name other stores. It writes one answer page: the question as '
          + 'the heading, a 50-word answer explaining that the store pays off the lender and applies '
          + 'any equity to the next car, the steps, the appraisal hours, a short FAQ and a '
          + 'last-updated date. No one can promise the store gets named next month, and the assistants '
          + 'now have a clear, local answer to read.',
      },
      {
        type: 'qa',
        id: 'answer-page-length',
        q: 'How long should an answer page be?',
        a: [
          'An answer page should be as long as the question needs and no longer. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) there '
          + 'is no ideal length for its AI search features and no requirement to break content into '
          + 'tiny chunks. Cover the real follow-up questions a buyer would ask, answer each one '
          + 'plainly, then stop.',
          'A simple policy question such as “Do you buy cars you didn’t sell?” may need a few hundred '
          + 'words. A bigger one such as “Should I lease or buy my next truck?” may need a comparison '
          + 'table and several sections. Both are right when every paragraph answers something a buyer '
          + 'would ask. Padding does the opposite: a long opening or the same answer said three ways '
          + 'pushes the useful part down the page.',
        ],
      },
      {
        type: 'bullets',
        id: 'worth-citing',
        h2: 'What makes an answer page worth citing?',
        intro:
          'An answer page is worth citing when it says something no other page can: your store’s real '
          + 'policies, first-hand experience from your staff and facts a reader can check. Google says '
          + 'unique, non-commodity content likely matters more for its generative AI search than '
          + 'anything else in its guide, and it warns against recycling what the web already says.',
        items: [
          'Facts only your store has. Google’s [guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) uses '
          + 'a generic tips list for first-time homebuyers as its example of commodity content. A '
          + 'generic list of used-car buying tips is the dealer version; yours names your own '
          + 'inspection and reconditioning process.',
          'First-hand experience. Google gives the first-hand review as its model of a unique point of '
          + 'view. Let your service manager explain what she sees on high-mileage trade-ins, under her '
          + 'own name.',
          'A clear who, how and why. Google’s [helpful content '
          + 'guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) '
          + 'asks whether it is obvious who wrote a page, how it was made, including any use of AI, '
          + 'and why it exists.',
          'Sources, numbers and real quotes. The [GEO paper by Aggarwal and '
          + 'others](https://arxiv.org/html/2311.09735v3) found citing sources, adding statistics and '
          + 'adding quotations worked best of the methods it tested, with a 30 to 40% relative '
          + 'improvement on its position-adjusted word count measure in its own test setup. That setup '
          + 'does not promise the same result for any dealership, so use only real numbers and real '
          + 'quotes.',
          'Tables and FAQs where they help. Bing says headings, tables and FAQ sections help AI '
          + 'systems reference content accurately.',
          'Current facts. A page with last year’s service hours can mislead a buyer more than no page at '
          + 'all. Bing '
          + 'also says regular updates keep AI systems referencing current content.',
        ],
      },
      {
        type: 'bullets',
        id: 'answer-page-mistakes',
        h2: 'What should an answer page never do?',
        intro:
          'An answer page should never exist only to catch a search phrase. Google’s spam policies '
          + 'name the common shortcuts: a separate page for every phrasing, mass-produced AI pages '
          + 'that add nothing, city pages that funnel to one page and keyword stuffing. None of them '
          + 'helps a buyer choose your store.',
        items: [
          'A page per phrasing. “Trade-in value near me” and “what is my trade worth” are one '
          + 'question, and Google says a high quantity of pages does not make a website higher '
          + 'quality.',
          'Mass AI pages. Google defines scaled content abuse as many pages made mainly to manipulate '
          + 'rankings rather than help people, however they are created, and its [guidance on '
          + 'generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) '
          + 'says generating many pages without adding value may violate that policy.',
          'City doorway pages. Fifty copies of one page with the town name swapped look like the '
          + 'doorway pages [Google’s spam '
          + 'policies](https://developers.google.com/search/docs/essentials/spam-policies) describe: '
          + 'pages aimed at specific cities or regions that funnel people to one page.',
          'Keyword stuffing. Google’s spam policies define it as repeating words or phrases so often '
          + 'that the text sounds unnatural, like “best used car dealer in Springfield” in every '
          + 'paragraph.',
          'Commit to what someone else decides. Leave out rates, approvals, trade values and '
          + 'delivery dates that depend on a lender or a factory, and state only what your store '
          + 'controls.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Google Search Central, guidance on generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated July 10, 2026.',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[Bing Webmaster Blog, AI Performance report announcement](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), February 10, 2026.',
          '[Google ranking systems guide](https://developers.google.com/search/docs/appearance/ranking-systems-guide).',
          '[Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies).',
          '[Google on helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).',
          '[Google on generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).',
          '[Cox Automotive on AI and vehicle discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), August 26, 2026.',
          '[Aggarwal and others, the GEO paper](https://arxiv.org/html/2311.09735v3), arXiv, June 28, 2024.',
          '[OpenAI Help Center on ChatGPT search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt).',
        ],
      },
    ],
    faq: [
      ['How many answer pages does a dealership need?',
        'Enough to cover the questions buyers in your market actually ask, written a few at a time and '
        + 'kept current. Start with the questions where AI assistants name other dealers today. '
        + 'AutoLander’s plans add 2, 4 or 8 answer pages a month, depending on the plan, and each one '
        + 'goes live only after the store approves it.'],
      ['Can AI write our dealership’s answer pages?',
        'AI can help with a draft, but the facts and the final check have to come from your store. '
        + '[Google says](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) '
        + 'using generative AI to produce many pages without adding value may violate its scaled '
        + 'content abuse policy. A person who knows the store should approve every page.'],
      ['Should an answer page list our inventory?',
        'Keep live inventory out of the answer text, because units and prices change daily. Place your '
        + 'website vendor’s live inventory block beside the answer instead, so the page never shows a '
        + 'stale price.'],
      ['Will an answer page get cited by ChatGPT?',
        'No one can promise that. [OpenAI '
        + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) ChatGPT '
        + 'ranks search results on several factors meant to find relevant, reliable information and '
        + 'that no page is assured a place, and [Google '
        + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) meeting '
        + 'every best practice does not assure indexing or serving. A clear answer page gives an '
        + 'assistant a good passage to use, and the free scan shows whether it is being used.'],
    ],
    cta: {
      heading: 'Start with the questions AI answers without you',
      sub:
        'The free scan asks ChatGPT and Claude, with web search on, up to 20 questions local buyers '
        + 'ask, 3 times each, and shows which ones name other stores. Those questions are your first '
        + 'answer pages. A person checks the report and walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #14 /aeo-geo/car-dealership-faq-page/
  // ---------------------------------------------------------------------------
  {
    slug: 'car-dealership-faq-page',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 14,
    anchor: 'The car dealership FAQ page: 40 buyer questions to answer',
    crumb: 'Dealership FAQ page',
    primaryKeyword: 'car dealership faq',
    secondaryKeywords: [
      'dealership faq examples',
      'car sales faq',
      'faq schema for dealerships',
      'faq page for car dealers',
    ],
    alsoRelated: [
      'service-department-ai-answers',
      'trade-in-questions-in-ai-answers',
      'financing-questions-in-ai-answers',
      'car-dealership-schema-markup',
    ],
    augmentKeys: [],
    title: 'Car Dealership FAQ Page: 40 Buyer Questions to Answer',
    description:
      'A car dealership FAQ page built for buyers and AI tools: 40 questions to answer across sales, '
      + 'trade-ins, financing and service, and how to write each.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'The car dealership FAQ page AI can quote: 40 questions to answer',
    tldr:
      'A car dealership FAQ page should answer the questions buyers and owners ask before they call, '
      + 'each in 40 to 60 words, using your store’s own facts. Group them by sales and inventory, '
      + 'trade-in and financing, service and parts, and store policies, and link each answer to the '
      + 'page that goes deeper. Below are 40 questions to start from, with what a good answer to each '
      + 'one contains.',
    sections: [
      {
        type: 'qa',
        id: 'what-to-include',
        q: 'What should a car dealership FAQ page include?',
        a: [
          'A car dealership FAQ page should include the questions buyers and owners ask before they '
          + 'call or visit, each answered in 40 to 60 words with your store’s own facts. Group the '
          + 'questions by department, such as sales, trade-in and financing, service and store '
          + 'policies, so a buyer, or an AI assistant, finds the right answer fast.',
          'The questions come from the same places your answer pages do: BDC call notes, chat logs, '
          + 'the questions service advisors hear at the write-up counter, and the questions buyers now '
          + 'type into AI assistants. Our list of [the questions car buyers ask '
          + 'AI](@questions-car-buyers-ask-ai) is a good cross-check against your own.',
          'An FAQ page is one of the simplest pieces of [AEO for car '
          + 'dealerships](/aeo-geo-for-car-dealers/): it puts your store’s answers on your own site, '
          + 'in plain text, where search engines and AI assistants can read them. Adapt the 40 '
          + 'questions below to your store.',
        ],
      },
      {
        type: 'qa',
        id: 'why-faq-pages-help',
        q: 'Why do FAQ pages help AI answers?',
        a: [
          'FAQ pages can help AI answers because each answer is a short, self-contained fact attached to '
          + 'the exact question a buyer asks. [Bing '
          + 'says](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview) '
          + 'FAQ sections, clear headings and tables help AI systems reference content accurately, and '
          + '[its guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) ask '
          + 'for explicit facts that are visible on the page itself.',
          'Google Maps has moved in the same direction. In a [pinned Business Profile community '
          + 'announcement](https://support.google.com/business/thread/392024106) in December 2025, a '
          + 'Google employee explained that customers now ask their question in Google Maps and get an '
          + 'instant answer based on the business’s own answers and relevant reviews.',
          'Google’s AI features in Search read web pages too; our guide to [how AI Overviews choose the pages they cite](@google-ai-overviews-for-car-dealers) covers what Google says it looks '
          + 'for. An FAQ page gives every common question one clear home on your site.',
        ],
      },
      {
        type: 'bullets',
        id: 'sales-inventory-questions',
        h2: 'Which sales and inventory questions belong on it?',
        intro:
          'Sales and inventory questions cover how a buyer reserves, sees, prices and takes home a '
          + 'car. These ten are illustrations to adapt to your store. After each question, the note '
          + 'says what a good answer contains; your page gives the actual answer in two to four '
          + 'sentences, using your store’s real policy.',
        items: [
          '“Can I hold a car with a deposit?” Whether you take deposits, how much, whether they are '
          + 'refundable and how long the car is held.',
          '“Can I book a test drive online, and what should I bring?” How to book, the documents '
          + 'you ask for and how long a drive usually takes.',
          '“Is the price on your website the price I pay?” What the listed price includes and '
          + 'excludes, with every extra charge named in plain words.',
          '“What fees do you charge on top of the vehicle price?” Each fee by name, what it covers '
          + 'and whether it is required, noting that taxes and registration vary by state.',
          '“Do you sell to out-of-state buyers?” Whether you do, how temporary tags and registration '
          + 'work for them and what paperwork to expect.',
          '“Do you deliver, and how far?” Your delivery area, any charge and how the paperwork gets '
          + 'signed.',
          '“What does certified pre-owned mean at your store?” Which program you follow, what the '
          + 'inspection covers and where to read the manufacturer’s own terms.',
          '“Can I see the vehicle history report?” Which report you provide, whether it is free and '
          + 'where to find it on each vehicle page.',
          '“What if the car I want sells before I get there?” How you confirm availability and '
          + 'whether you hold cars for booked appointments.',
          '“Do you have cars that aren’t on your website yet?” How often the site updates and whether '
          + 'incoming units are listed before they arrive.',
        ],
      },
      {
        type: 'bullets',
        id: 'trade-in-financing-questions',
        h2: 'Which trade-in and financing questions belong on it?',
        intro:
          'Trade-in and financing questions cover payoffs, titles, co-signers, applications and '
          + 'documents. Answer them with your process and what the buyer should bring, and never with a '
          + 'promised rate, approval or trade value, because those depend on the vehicle, the lender '
          + 'and the buyer. These ten are illustrations to adapt.',
        items: [
          '“Can I trade in a car I still owe money on?” Yes or no, how the payoff works and how '
          + 'positive or negative equity carries into the next deal.',
          '“How do you decide what my trade is worth?” The inspection, the market data you use and '
          + 'how long an offer stands. No dollar figures.',
          '“Will you buy my car if I don’t buy one from you?” Your policy and how to book an '
          + 'appraisal.',
          '“What do I need to bring for my trade-in?” Title or payoff details, registration, every key '
          + 'and remote, and anything else you ask for.',
          '“What if my title is lost or held by my lender?” What your office handles and what the '
          + 'owner must request.',
          '“What do I need to apply for financing?” The documents you usually ask for, such as proof '
          + 'of income and residence, and where to apply.',
          '“Can I apply for financing online before I visit?” Where the application lives, how it '
          + 'is protected and when someone follows up.',
          '“Do you work with buyers who were turned down elsewhere?” What you can honestly offer, such '
          + 'as sending an application to several lenders, with no approval implied.',
          '“Can I add a co-signer?” Whether your lenders allow one and what the co-signer needs to '
          + 'bring.',
          '“Can I bring my own financing from my bank?” Yes or no, what you need from the buyer’s '
          + 'lender and how it changes the paperwork.',
        ],
      },
      {
        type: 'bullets',
        id: 'service-parts-questions',
        h2: 'Which service and parts questions belong on it?',
        intro:
          'Service and parts questions come from owners, including people who bought their car '
          + 'somewhere else. Cover hours, appointments, loaners, recalls and warranty work with your '
          + 'department’s real policies, and link each answer to the service page that goes deeper. '
          + 'These ten are illustrations to adapt to your fixed ops department.',
        items: [
          '“What are your service hours?” Weekday and weekend hours for service and for parts, and '
          + 'holiday closures.',
          '“Do I need an appointment for an oil change?” Whether you take walk-ins, how to book and '
          + 'what wait to expect.',
          '“Do you offer loaner cars or shuttle rides?” Who qualifies, how to reserve one and what the '
          + 'driver needs to bring.',
          '“How do I check whether my car has an open recall?” Where to check with the VIN and how to '
          + 'book the repair with you.',
          '“Do you service vehicles you don’t sell?” The brands and powertrains you work on, '
          + 'including hybrids and EVs if you do.',
          '“Will servicing my car here keep the warranty valid?” What the manufacturer’s warranty '
          + 'booklet says about maintenance records, and where to read it.',
          '“Can I wait while my car is serviced?” Your waiting area, Wi-Fi and roughly how long '
          + 'common jobs take.',
          '“Do you sell parts and accessories over the counter?” Parts counter hours, whether you '
          + 'ship and how to order.',
          '“How can I pay for service?” Payment methods, and any online payment link.',
          '“What does warranty work cost me?” What is covered, when a deductible applies and how you '
          + 'confirm coverage before work starts.',
        ],
      },
      {
        type: 'bullets',
        id: 'store-policy-questions',
        h2: 'Which store and policy questions belong on it?',
        intro:
          'Store and policy questions cover what a buyer checks before driving over: when you are '
          + 'open, where each department is, who speaks their language and what happens if something '
          + 'goes wrong after the sale. Keep these answers identical to your Google Business Profile '
          + 'and every listing. These ten are illustrations to adapt.',
        items: [
          '“What are your sales hours?” Hours by day, plus holiday hours, matching your Google '
          + 'Business Profile exactly.',
          '“Where do I go when I arrive?” Parking, the sales and service entrances and who to ask '
          + 'for.',
          '“Do you have staff who speak Spanish?” Languages spoken by department and how to request '
          + 'someone.',
          '“Is the showroom accessible?” Wheelchair access, accessible parking and any '
          + 'accommodations you offer.',
          '“Do you have a return or exchange policy?” Whether you have one and its exact terms, or a '
          + 'plain statement that sales are final.',
          '“Can I buy a car completely online?” Which steps can be done remotely and which need a '
          + 'visit or a signature in person.',
          '“How do I reach a manager?” A title, a direct line or e-mail address and when to expect a '
          + 'reply.',
          '“Do you have EV chargers on site?” Whether you do, what kind and who may use them.',
          '“What happens at delivery?” The feature walkthrough, phone pairing, and a full tank or '
          + 'charge if you provide one.',
          '“How do you handle my personal information?” A link to your privacy policy and a plain '
          + 'summary of who sees a buyer’s details.',
        ],
      },
      {
        type: 'steps',
        h2: 'How should each answer be written?',
        intro:
          'Each answer on a car dealership FAQ page should answer the question in its first sentence, '
          + 'in plain words, with your store’s real facts. Keep it to 40 to 60 words, then link to the '
          + 'page that explains more. Google says its AI systems understand synonyms, so write the way '
          + 'your buyers talk.',
        steps: [
          {
            title: 'Answer first',
            body:
              'Start with yes, no or the direct fact: “Yes, we buy cars even if you don’t buy one from '
              + 'us.”',
          },
          {
            title: 'Use plain words',
            body:
              '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
              + 'its AI systems understand synonyms and general meaning, so skip the keyword variations '
              + 'and write “payoff” if that is what buyers say.',
          },
          {
            title: 'Use your own facts',
            body:
              'Name the department, the hours, the documents and the policy. A generic answer gives an '
              + 'assistant no reason to use yours.',
          },
          {
            title: 'Make each answer stand on its own',
            body:
              'An answer may be read without the rest of the page, so repeat the key noun: “Our '
              + 'service department opens at 7 a.m.”',
          },
          {
            title: 'Link to the page that goes deeper',
            body:
              'Link each short answer to the full trade-in page, the finance page or the answer page '
              + 'that covers the question. Our guide to [answer pages for car '
              + 'dealerships](@answer-pages-for-car-dealerships) shows how to write those.',
          },
          {
            title: 'Match everything else',
            body:
              'Hours, phone numbers and policies must match your Google Business Profile, your '
              + 'listings and the rest of your site, or a buyer cannot tell which version is right.',
          },
          {
            title: 'Review it on a schedule',
            body: 'Give the page a named owner and a quarterly review date.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'faq-schema',
        q: 'Should you add FAQ schema?',
        a: [
          'FAQ schema is optional for a car dealership FAQ page. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'structured data is not required for generative AI search and that there is no special '
          + 'markup to add for it. If you do add FAQPage markup, keep it identical to the questions and '
          + 'answers visible on the page.',
          '[Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'say structured data may support clearer grounding, with no assurance of visibility or '
          + 'traffic, and that markup must accurately reflect the visible content. So the order is '
          + 'simple: the visible text comes first, and any schema repeats it word for word.',
          'No one can promise a special search result from markup. Your website vendor’s platform may '
          + 'already add some, so ask before you add more.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Bing Webmaster Blog, AI Performance report announcement](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), February 10, 2026.',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[Google Search Central, guidance on generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated July 10, 2026.',
          '[Google Business Profile Community, announcement on Q&A changes](https://support.google.com/business/thread/392024106), December 3, 2025.',
          '[Google Search Central Blog, changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes), August 8, 2023.',
          '[Google Search Central, documentation updates](https://developers.google.com/search/updates), May 8 and June 15, 2026 entries on the FAQ rich result.',
        ],
      },
    ],
    faq: [
      ['How many questions should a dealership FAQ page have?',
        'As many as your buyers really ask, grouped by department. Forty is a practical starting set '
        + 'for a full-line store, and a small used-car lot may need twenty. When a question needs more '
        + 'than a few sentences, give it its own answer page and link to it from the FAQ.'],
      ['Should each department have its own FAQ?',
        'On larger sites it helps. Keep one main FAQ page with the most common questions from every '
        + 'department, and put the longer service or finance FAQs on those department pages. When a '
        + 'question appears in both places, use the same answer word for word so nothing conflicts.'],
      ['Will FAQ schema give my dealership rich results?',
        'No. In [August 2023, Google limited FAQ rich '
        + 'results](https://developers.google.com/search/blog/2023/08/howto-faq-changes) to well-known, '
        + 'authoritative government and health websites, which leaves car dealers out. Google has since '
        + 'gone further: its [documentation updates log](https://developers.google.com/search/updates) '
        + 'says the FAQ rich result stopped appearing in Google Search on May 7, 2026. Add FAQ markup '
        + 'only if it matches the visible text exactly, and judge the page by how well it answers '
        + 'buyers.'],
      ['How often should a dealership update its FAQ page?',
        'Whenever a fact changes, and on a set schedule such as every quarter. Hours, fees, holiday '
        + 'closures and service policies drift. [Bing '
        + 'says](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview) '
        + 'regular updates keep AI systems referencing current content, and a wrong answer on your own '
        + 'site is the easiest wrong answer to prevent.'],
    ],
    cta: {
      heading: 'See which questions AI answers with another store',
      sub:
        'The free scan asks ChatGPT and Claude, with web search on, up to 20 questions local buyers '
        + 'ask, 3 times each, and shows which ones they answer about your store and which they answer '
        + 'with someone else. A person checks it and walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #39 /aeo-geo/reddit-and-dealership-reputation/
  // ---------------------------------------------------------------------------
  {
    slug: 'reddit-and-dealership-reputation',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 39,
    anchor: 'Reddit and your dealership’s reputation in AI answers',
    crumb: 'Reddit and reputation',
    primaryKeyword: 'reddit dealership reviews',
    secondaryKeywords: [
      'reddit ai citations',
      'a reddit thread about my dealership',
      'how to respond on reddit as a business',
      'forums in ai answers',
    ],
    alsoRelated: [
      'local-pr-for-car-dealerships',
      'car-dealer-review-sites-ai-answers',
      'perplexity-for-car-dealerships',
      'youtube-for-car-dealerships-ai',
    ],
    augmentKeys: [],
    title: 'Reddit and Your Dealership’s Reputation in AI Answers',
    description:
      'Why Reddit threads about your dealership can surface in AI answers, what Google and Pew say '
      + 'about forums, and how to respond without spamming.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Reddit and your dealership’s reputation in AI answers',
    tldr:
      'Reddit dealership reviews and threads can be among the sources AI answers draw on: [Pew '
      + 'Research Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
      + 'found Wikipedia, YouTube and Reddit together made up 15% of the sources cited in Google’s AI '
      + 'summaries. You cannot control what people post, and you should not try. Fix the real '
      + 'problem, reply once as the business under a real name, follow each community’s posted rules '
      + 'and never post as a customer.',
    sections: [
      {
        type: 'qa',
        id: 'reddit-in-ai-answers',
        q: 'Do Reddit threads show up in AI answers about dealerships?',
        a: [
          'Reddit threads can show up in AI answers about dealerships. In a July 2025 analysis, [Pew '
          + 'Research Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'found that Wikipedia, YouTube and Reddit together made up 15% of the sources cited in '
          + 'Google’s AI summaries, compared with 17% of the links in standard results.',
          '[Google '
          + 'says](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/) '
          + 'people increasingly look for forums, videos, podcasts and posts where they hear authentic '
          + 'voices and first-hand perspectives. For one store, that means a thread in your city’s '
          + 'community asking about your finance office, or a post in a car-buying forum about a '
          + 'service visit, can be one of the pages an assistant reads when a buyer asks about you by '
          + 'name. How often depends on the assistant, the question and your market, and no one can '
          + 'predict it thread by thread.',
          'Forum threads sit beside your reviews, and our guide to [why reviews matter to AI assistants](@dealership-reviews-ai-recommendations) covers the review side of the '
          + 'same picture. [AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/) works on the '
          + 'parts a store controls: its website, its profiles and listings, its reviews and replies, '
          + 'and the store facts that should match everywhere.',
        ],
      },
      {
        type: 'qa',
        id: 'why-ai-uses-forums',
        q: 'Why do AI tools lean on forums and outside voices?',
        a: [
          'AI tools favor outside voices over a store describing itself. A 2025 study of AI search '
          + 'services by Chen, Wang, Chen and Koudas found a systematic, heavy preference for '
          + 'third-party, authoritative sources over brand-owned and social content. Forums are a '
          + 'different kind of outside voice: first-hand customer experience, which Google says people '
          + 'increasingly look for.',
          'Read the [study](https://arxiv.org/abs/2509.08919) carefully. It ranks independent, '
          + 'authoritative sources ahead of both a brand’s own pages and social content, so a forum '
          + 'thread is one outside voice among several, and the rest of your reputation, from review '
          + 'sites to local news, matters as much. The same study found that AI search services differ '
          + 'from one another in how many domains they draw on, how fresh their sources are and how '
          + 'sensitive they are to the wording of a question.',
          'Google’s [guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says '
          + 'its AI features can show what people say about products and services across the web, '
          + 'including forum discussions. For a dealership, that makes forums a mirror more than a '
          + 'channel. The threads reflect what customers lived through, and the work that changes them '
          + 'happens on the lot, in the F&I office and in the service drive, long before anyone posts.',
        ],
      },
      {
        type: 'steps',
        h2: 'What should you do when a thread criticizes your store?',
        intro:
          'When a Reddit thread criticizes your store, read the whole thread, find out what really '
          + 'happened and fix it first. Then, if the community’s posted rules allow a business to '
          + 'reply, post one calm reply as the business under a real name, and move the details to a '
          + 'private conversation.',
        steps: [
          {
            title: 'Read the whole thread',
            body:
              'Read every comment, not only the top post. Note what the poster says happened, when, '
              + 'and in which department, and whether other people describe the same thing.',
          },
          {
            title: 'Find out what happened',
            body:
              'Pull the deal jacket, the repair order or the call recording, and talk to the people '
              + 'involved before anyone replies.',
          },
          {
            title: 'Fix the real problem',
            body:
              'If the store got it wrong, make it right with the customer directly and fix the process '
              + 'that caused it. A good reply cannot cover a problem that is still happening.',
          },
          {
            title: 'Read the community’s posted rules',
            body:
              'Each community posts its own rules. Some welcome a reply from a business and some do '
              + 'not. Follow what is posted, and if you are unsure, message the moderators and ask '
              + 'before you reply.',
          },
          {
            title: 'Reply once, as the business',
            body:
              'Use an account that clearly belongs to the store or to a named manager. Say who you are '
              + 'and your role, acknowledge the experience, state facts without arguing and give a '
              + 'direct way to reach you. The principles in our guide on [how to respond to dealership '
              + 'reviews](@how-to-respond-to-car-dealership-reviews) apply here too.',
          },
          {
            title: 'Take it offline',
            body:
              'Handle the details by phone or in person. Never post a customer’s name, deal details '
              + 'or service history in public, even to correct the record.',
          },
          {
            title: 'Let the customer decide what to post',
            body:
              'If the customer is satisfied, they may choose to update the thread. Never make a fix '
              + 'conditional on deleting or editing the post.',
          },
        ],
      },
      {
        type: 'callout',
        title: 'A hypothetical example',
        body:
          'A franchise store in a mid-size market finds a year-old thread in the city’s community about '
          + 'an add-on the buyer only noticed at signing. The general manager reads it, pulls the deal, '
          + 'confirms the add-on was never explained, refunds it and changes how the F&I menu is '
          + 'presented. She replies once, under her name and title, with what changed and a direct '
          + 'number. The thread stays up, and anyone who finds it now sees a store that fixed the '
          + 'problem.',
      },
      {
        type: 'qa',
        id: 'posting-own-threads',
        q: 'Can a dealership post its own threads or pay for mentions?',
        a: [
          'A dealership should never post threads posing as a customer or pay for mentions. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'seeking inauthentic mentions is less helpful than it seems because its spam systems '
          + 'filter them, and the FTC’s rule on reviews and testimonials bans undisclosed insider '
          + 'reviews and fake social media indicators.',
          'The [FTC '
          + 'rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'finalized August 14, 2024, also bans fake or false reviews and testimonials, buying '
          + 'positive or negative reviews, company-controlled review sites that pose as independent, '
          + 'and review suppression through threats or intimidation. A salesperson praising the store '
          + 'from a personal account without saying where they work looks a lot like the insider '
          + 'reviews the rule describes.',
          '[Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) list link '
          + 'schemes, keyword stuffing, artificially engineered language meant to trigger citations '
          + 'and prompt injection aimed at its language models among the practices that reduce '
          + 'visibility. A vendor offering to seed threads or sell upvotes is selling manipulation, and '
          + 'the risk lands on your store’s name. Our list of [AEO red '
          + 'flags](@aeo-agency-red-flags) covers how to spot these offers.',
        ],
      },
      {
        type: 'bullets',
        id: 'finding-threads',
        h2: 'How do you find Reddit dealership reviews and threads about your store?',
        intro:
          'You find Reddit dealership reviews and threads about your store by searching your store '
          + 'name with the word reddit, checking your local and brand communities, and opening the '
          + 'sources AI answers cite when you ask about your store by name. Put the check on the '
          + 'calendar once a month and keep a log.',
        items: [
          'Search your store’s name plus the word reddit in Google, and try the nicknames, '
          + 'abbreviations and misspellings buyers use.',
          'Check the community for your city or region, and the communities for the brands you sell.',
          'Look in general car-buying and car-sales communities for your store’s name and your '
          + 'group’s name.',
          'Ask ChatGPT and Claude about your store by name, with web search on, and open every '
          + 'source they cite. A thread that appears there deserves a close read.',
          'Keep a simple log: link, date, topic, department and what you did about it. A pattern in '
          + 'the log points at a process to fix.',
          'Check the other outside sources at the same time, from review sites to local news. A '
          + 'forum thread is one source among several.',
        ],
      },
      {
        type: 'bullets',
        id: 'never-on-reddit',
        h2: 'What should never happen?',
        intro:
          'Some responses to a bad thread make things worse, and some can break the law. Staff should '
          + 'never post as customers, the store should never buy upvotes or run fake accounts, and no '
          + 'one should threaten or pressure a poster. The FTC rule on reviews and testimonials covers '
          + 'several of these directly.',
        items: [
          'Staff posting as customers. Salespeople, managers or their families praising the store '
          + 'without saying who they are. The FTC rule bans undisclosed insider reviews.',
          'Bought upvotes or comments. Paying anyone to push a thread up or bury it, including '
          + 'vendors who sell it as reputation management.',
          'Sock-puppet accounts. Several accounts run by one person or one agency to fake agreement. '
          + 'The FTC rule bans fake social media indicators.',
          'Threats against posters. Legal threats, calls to the poster’s employer or pressure to '
          + 'delete. The FTC rule bans review suppression through threats or intimidation.',
          'Trading favors for edits. A discount or a refund offered in exchange for deleting or '
          + 'softening a post turns a fix into a trade.',
          'Posting customer details. No names, deal numbers or service history in a reply, ever.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Pew Research Center, on Google users and AI summaries](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/), July 22, 2025.',
          '[Google, The Keyword, on AI in Search and clicks](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/), August 6, 2025.',
          '[Google Search Central, guidance on generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated July 10, 2026.',
          '[Chen, Wang, Chen and Koudas, study of AI search services](https://arxiv.org/abs/2509.08919), arXiv preprint, September 2025.',
          '[Federal Trade Commission, final rule on fake reviews and testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), August 14, 2024.',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
        ],
      },
    ],
    faq: [
      ['Should salespeople post about our dealership on Reddit?',
        'Never as customers, and never without saying where they work. The [FTC’s '
        + 'rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) '
        + 'bans undisclosed insider reviews. A salesperson who wants to answer a car question in a '
        + 'community should follow its posted rules and name the store every time.'],
      ['Can we ask a moderator to remove a thread about us?',
        'You can ask when a post breaks the community’s posted rules, such as a rule against sharing '
        + 'personal information. Moderators decide under their own rules, and a critical '
        + 'thread that follows them may stay up. Never pressure a moderator or a poster: the FTC rule '
        + 'bans review suppression through threats or intimidation.'],
      ['Does one bad Reddit thread mean AI will call us a bad dealer?',
        'One thread on its own rarely tells the whole story. Research on AI search services found a '
        + 'strong preference for third-party, authoritative sources over social content, and a steady '
        + 'record of recent reviews with thoughtful replies, consistent profiles and a clear website '
        + 'gives an assistant much more to go on than one old post. Fix the problem the thread '
        + 'describes, so the next customer has a different story to tell.'],
      ['Is it worth having an official Reddit account for the store?',
        'Only if someone will use it well: follow each community’s posted rules, say plainly who they '
        + 'are, answer questions helpfully and never pitch in threads that did not ask. For most '
        + 'stores, a named manager replying when a thread needs it is enough.'],
    ],
    cta: {
      heading: 'See which sources AI cites about your store',
      sub:
        'The free scan asks ChatGPT and Claude, with web search on, up to 20 questions local buyers '
        + 'ask, 3 times each, and lists every source each answer cited, so you can see whether forum '
        + 'threads are among them. A person checks it and walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #44 /aeo-geo/car-dealer-review-sites-ai-answers/
  // ---------------------------------------------------------------------------
  {
    slug: 'car-dealer-review-sites-ai-answers',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 44,
    anchor: 'Car dealer review sites and AI answers: where your store should show up',
    crumb: 'Review sites',
    primaryKeyword: 'car dealer review sites',
    secondaryKeywords: [
      'dealerrater profile for dealers',
      'cars.com dealer reviews for dealers',
      'cargurus dealer rating for dealers',
      'review sites ai cites for dealerships',
      'dealer listings consistency',
    ],
    alsoRelated: [
      'local-pr-for-car-dealerships',
      'google-business-profile-for-car-dealers',
      'bing-places-for-car-dealers',
      'dealer-group-ai-visibility',
    ],
    augmentKeys: [],
    title: 'Car Dealer Review Sites and AI Answers: Where to Show Up',
    description:
      'The car dealer review sites that matter as AI sources, from DealerRater, Cars.com and CarGurus '
      + 'to Yelp and BBB, and how to keep them consistent.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Car dealer review sites and AI answers: DealerRater, Cars.com, CarGurus, Yelp and BBB',
    tldr:
      'Among car dealer review sites, Google comes first: [BrightLocal’s 2026 '
      + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/) found 71% of '
      + 'consumers used Google to read reviews. Next come the automotive sites (DealerRater, Cars.com, '
      + 'CarGurus and Autotrader), then Yelp, the BBB and your Facebook Page. Which of them AI '
      + 'assistants cite varies by market, so check your own, keep every profile identical and answer '
      + 'Google reviews first.',
    sections: [
      {
        type: 'qa',
        id: 'which-review-sites',
        q: 'Which car dealer review sites matter most?',
        a: [
          'Google matters most among car dealer review sites: [BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/) found 71% of '
          + 'consumers used Google to read reviews of local businesses. After Google come the '
          + 'automotive sites, DealerRater, Cars.com, CarGurus and Autotrader, then the general sites '
          + 'buyers check, such as Yelp, the Better Business Bureau and Facebook.',
          'The same BrightLocal survey found 97% of consumers read reviews for local businesses and '
          + '74% look for reviews from the last three months, and the share using Google to read '
          + 'reviews was down from 83%. Each site has its own audience and its own rules for '
          + 'businesses, so treat each one as a separate profile to claim, complete and keep current.',
          'Reviews on these sites are part of what an assistant can find about your store, and our '
          + 'guide to [the review signals AI answers pick up](@dealership-reviews-ai-recommendations) '
          + 'covers why. [AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/) claims, '
          + 'completes and keeps consistent the core profiles every store needs; the rest of this page '
          + 'shows how to do the same work yourself.',
        ],
      },
      {
        type: 'qa',
        id: 'why-third-party-sites',
        q: 'Why do third-party sites matter to AI answers?',
        a: [
          'Third-party sites matter to AI answers because they are someone other than the store '
          + 'describing the store. A 2025 study of AI search services found a systematic, heavy '
          + 'preference for third-party, authoritative sources over brand-owned content, and Google '
          + 'says its AI features can show what people say about products and services across the '
          + 'web.',
          'The [study](https://arxiv.org/abs/2509.08919), by Chen, Wang, Chen and Koudas, also found '
          + 'that AI search services differ in how many domains they draw on, how fresh their sources '
          + 'are and how sensitive they are to the wording of a question. That helps explain why the review sites '
          + 'cited for your store can change from one assistant to the next, and between two '
          + 'phrasings of the same question.',
          'Buyers want this summary too. In [CarGurus’ 2025 consumer '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html) of 3,030 people who '
          + 'bought or sold a vehicle in the previous four months, summarizing reviews of dealerships '
          + 'was one of the top uses they wanted from AI, at 36%. Google adds a warning in its [guide '
          + 'to generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): '
          + 'seeking inauthentic mentions is less helpful than it seems, because its spam systems '
          + 'filter them. Thin profiles and staff-written reviews add noise and no trust.',
        ],
      },
      {
        type: 'qa',
        id: 'find-cited-sites',
        q: 'How do you find which sites AI cites in your market?',
        a: [
          'You find which sites AI cites in your market by asking the assistants the questions your '
          + 'buyers ask, with web search on, and opening every source in the answers. Ask each question '
          + 'more than once, because answers change from run to run, and note which review and listing '
          + 'sites keep appearing.',
          'Use the questions a real buyer would type: “best Toyota dealer near Lakeland,” “is this '
          + 'dealership trustworthy,” “where should I buy a used truck in my town.” Ask ChatGPT and '
          + 'Claude, and if your buyers use them, Gemini, Perplexity and Microsoft Copilot too. Keep '
          + 'a sheet with the question, the assistant, the date and the cited sites. Markets differ, so '
          + 'the list that matters for a store in one town can look different one county over.',
          'The free scan runs this for ChatGPT and Claude: up to 20 local buyer questions, 3 runs '
          + 'each, with every cited source listed as a link you can click. It does not measure Gemini, '
          + 'Perplexity or Microsoft Copilot. Our guide on [how to measure AI '
          + 'visibility](@measure-dealership-ai-visibility) explains how to run your own checks '
          + 'honestly.',
        ],
      },
      {
        type: 'bullets',
        id: 'profile-facts',
        h2: 'What should every dealer profile say?',
        intro:
          'Every dealer profile should say exactly the same thing about your store: the same name, '
          + 'address, main phone number, hours by department, website and list of services. Bing says '
          + 'clear, consistent naming of organizations and locations improves grounding visibility and '
          + 'citation accuracy, and a mismatch gives buyers a reason to doubt which version is right.',
        items: [
          'The same store name, spelled one way. Pick the exact trading name, including whether the '
          + 'brand or group name comes first, and use it everywhere. [Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) explain '
          + 'why clear entity naming matters.',
          'The same address, formatted one way, with the same suite or building details.',
          'The same main phone number. If you use call-tracking numbers, keep the main number listed '
          + 'the same way everywhere.',
          'Hours by department, for sales, service and parts, with the same holiday hours on every '
          + 'site.',
          'The same website address, pointing to your homepage or the matching department page.',
          'The brands you sell and the services you offer, described in the same words.',
          'A current logo and real photos of the store, so buyers can tell it is the same place.',
        ],
      },
      {
        type: 'bullets',
        id: 'review-rules',
        h2: 'What review rules apply across sites?',
        intro:
          'The same review rules apply on every site: never pay or reward customers for reviews, never '
          + 'write or post reviews yourself, never ask only happy customers, and never threaten anyone '
          + 'over a review. Google’s policies and the FTC’s rule on reviews and testimonials spell '
          + 'these out, and each site adds its own terms.',
        items: [
          'No incentives. [Google strictly prohibits](https://support.google.com/business/answer/3474122) '
          + 'offering free or discounted goods or services in exchange for reviews, and a discount on '
          + 'the next oil change is a discounted service.',
          'No gating. [Google’s Maps content '
          + 'policy](https://support.google.com/contributionpolicy/answer/7400114) bars discouraging '
          + 'negative reviews and selectively asking for positive ones. Ask every sold customer the '
          + 'same way.',
          'No staff quotas. The same policy says merchants should not ask staff to collect a set '
          + 'number of reviews, or ask for reviews that name a staff member.',
          'No fake or insider reviews. The [FTC’s '
          + 'rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), '
          + 'finalized August 14, 2024, bans fake reviews, buying positive or negative reviews, '
          + 'undisclosed insider reviews and review suppression through threats or intimidation.',
          'One neutral request, never a Yelp request. AutoLander’s plans set up one neutral review '
          + 'request to every sold customer in the store’s own CRM or DMS, sent 2 to 5 days after '
          + 'delivery with at most one reminder, and never a Yelp review request.',
          'Each site’s own terms. Read the business rules of every review site before you ask for '
          + 'reviews there.',
        ],
      },
      {
        type: 'qa',
        id: 'respond-every-site',
        q: 'Should you respond to reviews on every site?',
        a: [
          'Respond to reviews wherever buyers read them, starting with Google. [BrightLocal’s 2026 '
          + 'survey](https://www.brightlocal.com/research/local-consumer-review-survey/) found 89% of '
          + 'consumers expect business owners to respond to reviews. Answer every Google review first, '
          + 'then the review sites your own checks show AI assistants cite for your market, then the '
          + 'rest as time allows.',
          'A reply is written for the next buyer as much as for the reviewer: thank them, address the '
          + 'specific point, state facts without arguing and give a direct way to reach a manager. Our '
          + 'guide on [how to respond to dealership reviews](@how-to-respond-to-car-dealership-reviews) '
          + 'has examples by situation.',
          'On AutoLander’s plans, every Google review gets a reply within 2 business days on AI '
          + 'Foundation, or 1 business day on AI Authority and Market Leader, and a person approves '
          + 'every reply to a 1-star or 2-star review. Replies on other review sites stay with your '
          + 'team, because no plan includes them.',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you keep a dozen profiles consistent?',
        intro:
          'You keep a dozen profiles consistent with one master fact sheet, one named owner for each '
          + 'site, a change log and a quarterly audit. Every change to hours, phone numbers or '
          + 'services starts on the fact sheet and goes out to every profile the same week, so no site '
          + 'is left saying something different.',
        steps: [
          {
            title: 'Write the master fact sheet',
            body:
              'One document with the exact name, address, phone numbers, hours by department, '
              + 'website, brands, services and payment options. It is the only place anyone copies '
              + 'from.',
          },
          {
            title: 'List every profile and its owner',
            body:
              'Google Business Profile, Bing Places, Apple Business Connect, Yelp, your Facebook Page, '
              + 'DealerRater, and your Cars.com, CarGurus and Autotrader dealer profiles, plus the BBB '
              + 'and any other site you find. Put one person’s name next to each, and keep the login '
              + 'owned by the store.',
          },
          {
            title: 'Log every change',
            body:
              'When hours, a phone number or a department changes, note the date and update every '
              + 'profile the same week. Put holiday hours on the calendar a month ahead.',
          },
          {
            title: 'Audit every quarter',
            body:
              'Open each profile, compare it line by line with the fact sheet and fix anything that '
              + 'drifted. Look for duplicate listings, old addresses and closed departments.',
          },
          {
            title: 'Check what AI says about you',
            body:
              'Ask the assistants about your store by name. If an answer repeats a wrong fact, trace it '
              + 'to the source it cited and fix it there. Our guide to [fixing wrong AI answers about '
              + 'your store](@when-ai-gets-your-dealership-wrong) walks through the process.',
          },
          {
            title: 'Hand it off if you need to',
            body:
              'AutoLander’s plans claim, complete and keep consistent the core listings: Bing Places, '
              + 'Apple Business Connect, Yelp (claim and complete only), your Facebook Page, '
              + 'DealerRater, and your Cars.com, CarGurus and Autotrader dealer profiles. The store '
              + 'owns every profile.',
          },
        ],
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[BrightLocal, Local Consumer Review Survey](https://www.brightlocal.com/research/local-consumer-review-survey/), February 11, 2026.',
          '[Chen, Wang, Chen and Koudas, study of AI search services](https://arxiv.org/abs/2509.08919), arXiv preprint, September 2025.',
          '[CarGurus, 2025 consumer insights](https://www.cargurus.com/press/2025_consumer_insights.html), December 3, 2025.',
          '[Google Search Central, guidance on generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated July 10, 2026.',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[Google Business Profile Help, review policy](https://support.google.com/business/answer/3474122) and [Google Maps user contributed content policy](https://support.google.com/contributionpolicy/answer/7400114).',
          '[Federal Trade Commission, final rule on fake reviews and testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), August 14, 2024.',
        ],
      },
    ],
    faq: [
      ['Is a DealerRater profile still worth claiming?',
        'Yes, for most dealerships. It takes little time to claim and complete, it gives buyers another '
        + 'place to read about your store, and an unclaimed profile can carry old or wrong details. '
        + 'Check whether it appears among the sources AI assistants cite for your market to decide how '
        + 'much ongoing time it deserves.'],
      ['Do Cars.com and CarGurus reviews show up in ChatGPT answers?',
        'They can, when ChatGPT searches the web and cites those pages, and how often depends on the '
        + 'question and the market. No one can promise that a particular site will be cited. Ask '
        + 'ChatGPT about dealers in your town with web search on and open its sources, or use the free '
        + 'scan, which lists every source ChatGPT and Claude cited.'],
      ['How many listing sites does a dealership need?',
        'Start with the core profiles: Google Business Profile, Bing Places, Apple Business Connect, '
        + 'Yelp, your Facebook Page and the automotive sites you sell on. Past that, directory listings '
        + 'help only when they carry the same facts. AutoLander’s plans order 40 directory listings plus '
        + 'the main data aggregators in month 1 and list every live link in the report.'],
      ['What if my address is different on two review sites?',
        'Fix the wrong one as soon as you find it, then find where the wrong version came from, such as '
        + 'an old suite number or a previous location, and fix it there too. Bing says clear, '
        + 'consistent naming improves citation accuracy, and a mismatch gives buyers a reason to doubt '
        + 'which address is right.'],
    ],
    cta: {
      heading: 'Find out which sites AI cites in your town',
      sub:
        'The free scan asks ChatGPT and Claude, with web search on, up to 20 questions local buyers '
        + 'ask, 3 times each, and lists every review site and page they cited for dealers in your '
        + 'market. A person checks the report and walks you through the 3 fixes in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #48 /aeo-geo/local-pr-for-car-dealerships/
  // ---------------------------------------------------------------------------
  {
    slug: 'local-pr-for-car-dealerships',
    silo: 'aeoGeo',
    cluster: 'reputation',
    publishOrder: 48,
    anchor: 'Local PR for car dealerships: news, best-of lists and sponsored articles',
    crumb: 'Local PR',
    primaryKeyword: 'local pr for car dealerships',
    secondaryKeywords: [
      'best of city awards for dealerships',
      'sponsored content disclosure',
      'community sponsorships for dealers',
      'local news coverage for dealerships',
    ],
    alsoRelated: [
      'youtube-for-car-dealerships-ai',
      'aeo-cost-for-car-dealerships',
      'how-to-choose-an-aeo-agency',
    ],
    augmentKeys: [],
    title: 'Local PR for Car Dealerships in the Age of AI Answers',
    description:
      'Local news, best-of awards and labeled sponsored articles for car dealerships: which mentions '
      + 'matter to AI tools and the disclosure rules to follow.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Local news, best-of lists and sponsored articles: the mentions that build a dealer’s reputation',
    tldr:
      'Local PR for car dealerships means real mentions in outside publications: news about things your '
      + 'store actually did, community sponsorships with a public record, best-of lists from real '
      + 'publications and staff quoted as experts. [A 2025 study](https://arxiv.org/abs/2509.08919) '
      + 'found AI search services favor third-party sources over a brand’s own pages, which is why '
      + 'these mentions matter. Sponsored articles are fine when clearly labeled with tagged links, and '
      + 'no one can promise any of it gets your store named by an AI assistant.',
    sections: [
      {
        type: 'qa',
        id: 'why-outside-mentions-matter',
        q: 'Why do outside mentions matter to AI answers?',
        a: [
          'Outside mentions matter to AI answers because they are other people describing your store. '
          + 'A 2025 study of AI search services by Chen, Wang, Chen and Koudas found a systematic, heavy '
          + 'preference for third-party, authoritative sources over brand-owned content, and Google says '
          + 'its AI features can show what is said across the web while its spam systems filter '
          + 'inauthentic mentions.',
          'Google makes that point in its [guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), and '
          + 'the [study](https://arxiv.org/abs/2509.08919) adds that AI search services differ in how '
          + 'fresh their sources are and how many domains they draw on. Your own website still matters '
          + 'for facts like hours, inventory and policies. For reputation questions, such as which '
          + 'dealer in town people trust, an assistant has more reason to lean on what reviewers, '
          + 'reporters and community groups say.',
          'Our guides to [how reviews shape AI recommendations](@dealership-reviews-ai-recommendations) '
          + 'and [Reddit threads about your dealership](@reddit-and-dealership-reputation) cover the '
          + 'other outside voices. [AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/) treats '
          + 'outside mentions as one part of the monthly work, alongside site fixes, the Business '
          + 'Profile, listings and reviews.',
        ],
      },
      {
        type: 'bullets',
        id: 'local-coverage-types',
        h2: 'What counts as good local PR for car dealerships?',
        intro:
          'Good local PR for car dealerships is coverage of real things: news about events and changes '
          + 'at the store, community sponsorships with a public record, best-of lists run by real '
          + 'publications with real judging, and staff quoted as experts on local car questions. Each '
          + 'one is an outside source describing your store.',
        items: [
          'News about real events. A new service building, a scholarship, a charity drive with a '
          + 'result, a long-serving technician retiring. Send the facts to the reporter who covers '
          + 'local business, with a name and a phone number.',
          'Community sponsorships with a public record. A youth team, a school program or a food bank '
          + 'drive where the organization lists its sponsors on its own site.',
          'Best-of lists from real publications. Readers’ choice lists from a local paper or magazine '
          + 'where readers vote and winners do not pay to win.',
          'Expert quotes. Your service manager on getting a car ready for winter, or your used-car '
          + 'manager on what is happening with trade-ins locally. Offer a named expert to local '
          + 'reporters for car questions.',
          'Consistent review and listing profiles. Your profiles on [the review sites that matter for '
          + 'dealers](@car-dealer-review-sites-ai-answers) are outside sources too, and the easiest '
          + 'ones to keep accurate.',
          'Labeled sponsored articles. Paid articles in publications your buyers read, clearly marked '
          + 'as advertising, covered in the next section.',
        ],
      },
      {
        type: 'qa',
        id: 'are-sponsored-articles-allowed',
        q: 'Are sponsored articles allowed?',
        a: [
          'Sponsored articles are allowed when readers can tell they are advertising. [The FTC’s native '
          + 'advertising guidance](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses) '
          + 'says an ad should not suggest it is anything other than an ad, names clear labels such as '
          + '“Sponsored Advertising Content,” warns that a term like “Promoted” can be ambiguous and '
          + 'says logos alone are likely not enough.',
          'The same guidance also lists “Ad,” “Advertisement” and “Paid Advertisement” as clear '
          + 'labels. In practice, '
          + 'that means a label a reader sees before the story starts, in words like those, and a '
          + 'byline that does not pretend the publication’s newsroom wrote it.',
          'Before paying for any placement, ask the publication or agency in writing how the label will '
          + 'read, where it will sit and how the links will be tagged.',
        ],
      },
      {
        type: 'qa',
        id: 'sponsored-links-seo',
        q: 'Do sponsored links help SEO?',
        a: [
          'Sponsored links are the wrong tool for SEO. [Google’s spam '
          + 'policies](https://developers.google.com/search/docs/essentials/spam-policies) treat buying '
          + 'or selling links for ranking as link spam, and say paid links for advertising or '
          + 'sponsorship are fine when they carry rel="sponsored" or rel="nofollow". Google’s site '
          + 'reputation abuse policy also covers content placed on a host site mainly to exploit its '
          + 'ranking signals.',
          'Google’s guidance on [qualifying outbound '
          + 'links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) '
          + 'asks for the sponsored value on links that are ads or paid placements, and still accepts '
          + 'nofollow. So the value of a sponsored article is its audience and the mention itself: '
          + 'people in your market reading about your store in a publication they trust, clearly '
          + 'labeled.',
          'If a vendor sells sponsored articles as a way to pass link value or lift rankings, walk away. '
          + 'That pitch describes the exact practice Google calls link spam.',
        ],
      },
      {
        type: 'qa',
        id: 'placement-chatgpt',
        q: 'Will a placement get my store named by ChatGPT?',
        a: [
          'No one can promise that a placement will get your store named by ChatGPT. [OpenAI '
          + 'says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) ChatGPT '
          + 'ranks search results using several factors meant to find relevant, reliable information, '
          + 'and that no page is assured a place. A labeled article in a publication the assistants '
          + 'already cite adds one more credible outside source.',
          'The same caution applies to every AI assistant, including Google AI Overviews, Gemini, '
          + 'Claude, Perplexity and Microsoft Copilot. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) no '
          + 'third-party tool has access to its internal ranking or AI systems, so an agency that '
          + 'claims it can place your store inside an AI answer is claiming something it cannot '
          + 'control.',
        ],
      },
      {
        type: 'qa',
        id: 'autolander-sponsored-placements',
        q: 'How do AutoLander’s sponsored placements work?',
        a: [
          'AutoLander’s sponsored placements put your store in a publication that AI assistants already '
          + 'cite for your market’s questions, on a topic you approve. Each article is labeled as '
          + 'sponsored, its links are tagged sponsored or nofollow, and every delivery is checked for '
          + 'the live link, your store’s name, the tag and the label.',
          'Placements come with the higher plans of [AutoLander’s AEO and GEO '
          + 'service](/aeo-geo-for-car-dealers/): 1 a month on AI Authority and 4 a month on Market '
          + 'Leader, both by application. AI Foundation includes none. Topics come from the sources '
          + 'ChatGPT and Claude cited in your scan, and each month’s topic reaches you for approval by '
          + 'business day 10.',
          'AutoLander never promises that a placement will be cited by an AI assistant or pass search '
          + 'value to your site. A placement is a labeled, checked mention in a publication the '
          + 'assistants already cite, and nothing more is claimed for it.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-to-avoid',
        h2: 'What should a dealer avoid?',
        intro:
          'A dealer should avoid any mention that has to hide how it was made: pay-to-play award sites, '
          + 'unlabeled advertorials, link packages sold for rankings, fake mentions and anything Bing '
          + 'lists as manipulation. If the arrangement would embarrass the store once a reader or a '
          + 'reporter found out, skip it.',
        items: [
          'Pay-to-play awards. Best-dealer badges from sites where nearly every entrant wins and the '
          + 'winner pays for the plaque. If money decides the award, readers are being misled.',
          'Unlabeled advertorials. Paid articles dressed up as news, with no clear label. The FTC’s '
          + 'guidance says an ad should not suggest it is anything other than an ad.',
          'Link packages. Bundles of articles or directory links sold to lift rankings. Google calls '
          + 'buying links for ranking link spam, and [Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) list link '
          + 'schemes among the practices that reduce visibility.',
          'Fake mentions. Blog networks, spun articles and planted forum posts meant to look like '
          + 'independent praise. Google says its spam systems filter inauthentic mentions.',
          'Text written to trigger AI citations. Bing lists keyword stuffing, artificially engineered '
          + 'language meant to trigger citations and prompt injection aimed at its language models as '
          + 'practices that reduce visibility.',
          'Vendors selling spots in AI answers. No one can promise what an assistant says. Our list of '
          + '[AEO red flags](@aeo-agency-red-flags) covers how to spot these offers.',
        ],
      },
      {
        type: 'callout',
        title: 'A hypothetical example',
        body:
          'A family-owned store in a small city sponsors the high school robotics team, which lists its '
          + 'sponsors on the school district’s site. The service manager offers to answer winter-driving '
          + 'questions for the local paper and is quoted in two stories that season. The store also buys '
          + 'one sponsored article in a regional magazine that assistants cite for car questions, '
          + 'labeled as advertising, with its links tagged sponsored. No one can promise an AI mention '
          + 'from any of it, and all of it is true, public and easy for a reader to check.',
      },
      {
        type: 'bullets',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Chen, Wang, Chen and Koudas, study of AI search services](https://arxiv.org/abs/2509.08919), arXiv preprint, September 2025.',
          '[Google Search Central, guidance on generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated July 10, 2026.',
          '[Federal Trade Commission, native advertising guide for businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses), December 2015.',
          '[Google Search Central, spam policies](https://developers.google.com/search/docs/essentials/spam-policies), updated August 28, 2026.',
          '[Google Search Central, qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).',
          '[OpenAI Help Center, searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt).',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
        ],
      },
    ],
    faq: [
      ['Are paid best dealer awards worth it?',
        'Only when the award is real: a publication with real readers, open voting or judging, and no '
        + 'payment required to win. If you must pay to win or to display the badge, treat it as '
        + 'advertising and label it that way. An award anyone can buy adds little trust and can mislead '
        + 'buyers.'],
      ['How do I find the local sites AI already cites?',
        'Ask ChatGPT and Claude the questions buyers ask about dealers in your town, and open the '
        + 'sources each answer cites. Local news sites, community pages and review sites that show up '
        + 'more than once are the places worth reaching first.'],
      ['Should a dealer sponsor local community events?',
        'If the store would support them anyway, yes. A real sponsorship can earn mentions on local '
        + 'news and community pages that assistants read, but plan it for the community, since no one '
        + 'can promise it changes an AI answer.'],
      ['Can a press release get my dealership into AI answers?',
        'No one can promise that. A press release is the store’s own words, and the 2025 study of AI '
        + 'search services found a strong preference for third-party sources over brand-owned content. '
        + 'A release about a real event, sent to the reporter who covers local business, has a better '
        + 'chance of becoming a story someone else writes.'],
    ],
    cta: {
      heading: 'See which publications AI cites for your market',
      sub:
        'The free scan asks ChatGPT and Claude, with web search on, up to 20 questions local buyers '
        + 'ask, 3 times each, and lists every source each answer cited, from review sites to local '
        + 'publications. A person checks it and walks you through it in 20 minutes.',
    },
  },
];
