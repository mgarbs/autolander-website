// AEO and GEO silo (aeoGeo), batch 09: the content cluster ("Answer pages and content AI can
// quote"), publish numbers 23, 32, 40, 45 and 49. Written 2026-09-30 from
// the 2026-09-30 silo plan, fact-bank.md and keywords.md.
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// House rules for this file: no em-dashes or en-dashes, no negation-then-reveal cadence, no
// invented numbers, studies, quotes, customers or results. Every third-party number or claim
// comes from the fact bank and links its source URL in the sentence. Nothing here promises a
// ranking, a mention, a citation or a placement.
//
// Links: in-body sibling links use ONLY the publish-aware token [anchor](@slug), and ONLY to
// siblings with a LOWER publish number (plan inBodyLinks), so publishing in order never
// creates a dead link. Later siblings connect through alsoRelated, which the builder renders
// once the target is live. Every article links the live money page /aeo-geo-for-car-dealers/
// with its assigned anchor in the first two sections.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #23 /aeo-geo/service-department-ai-answers/
  // ---------------------------------------------------------------------------
  {
    slug: 'service-department-ai-answers',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 23,
    anchor: 'Service department questions in AI answers: a fixed ops guide',
    crumb: 'Service questions',
    primaryKeyword: 'dealership service department ai search',
    secondaryKeywords: [
      'fixed ops seo',
      'service department seo',
      'service hours in ai answers',
      'recall questions in ai answers',
    ],
    alsoRelated: [
      'how-to-respond-to-car-dealership-reviews',
      'car-dealership-schema-markup',
      'when-ai-gets-your-dealership-wrong',
    ],
    augmentKeys: [],
    title: 'Service Department Questions in AI Answers: Fixed Ops Guide',
    description:
      'What owners ask AI about your service department, from hours and recalls to loaners and '
      + 'prices, and how fixed ops pages and profiles should answer.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Service department questions in AI answers: hours, recalls, loaners and prices',
    tldr:
      'Dealership service department AI search runs on plain questions: are you open Saturday, do '
      + 'you take walk-ins, is there a loaner, can you do my recall, and what does an oil change '
      + 'cost. Assistants answer from your Business Profile, your service pages and what other sites '
      + 'say about you, so every service fact has to match everywhere. Give service its own profile '
      + 'only if it runs as a distinct department, publish only prices you honor, explain recalls as '
      + 'simple steps, and answer service reviews the way you answer sales reviews.',
    sections: [
      {
        type: 'qa',
        id: 'what-owners-ask-ai-about-service',
        q: 'What do owners ask AI search about a dealership service department?',
        a: [
          'Owners ask AI the questions they used to phone in: whether the service department is open '
          + 'Saturday, whether it takes walk-ins, whether loaners are available, whether it handles '
          + 'recall work, what an oil change or brake job costs, and whether warranty work is covered. '
          + 'The answers draw on your profiles, your pages and what other sites say about you.',
          'The phrasing is conversational and local. Picture an owner of a four-year-old SUV typing '
          + '“dealer service open Saturday near me with loaner cars” into ChatGPT, or asking Gemini on '
          + 'a phone whether the store down the road can do a recall without an appointment. These '
          + 'examples are illustrative. What they share is the shape of the question: the owner wants '
          + 'a yes or no, a time and a way to book.',
          '[Cox Automotive’s guidance to dealers on AI and vehicle '
          + 'discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'tells stores to keep business information, hours, locations and services consistent '
          + 'everywhere they appear. For fixed ops that list is long, because a service department has '
          + 'its own hours, its own phone line, often its own entrance, and a menu of jobs that '
          + 'changes with the season.',
          'Helping ChatGPT, Claude, Gemini and Google AI Overviews get those answers right is part of '
          + '[AEO for car dealerships](/aeo-geo-for-car-dealers/). The work starts with the facts you '
          + 'control: your Business Profile, your service pages and the words your advisors use on '
          + 'the phone. No one can promise what an assistant will say, and a store whose facts agree '
          + 'everywhere gives it far less to get wrong.',
        ],
      },
      {
        type: 'qa',
        id: 'separate-service-business-profile',
        q: 'Does your service department need its own Business Profile?',
        a: [
          'A service department needs its own profile only when it runs as a distinct entity. '
          + '[Google’s Business Profile guidelines](https://support.google.com/business/answer/3038177) '
          + 'allow that for a department with its own entrance and categories. Google’s example is a '
          + 'South Bay Toyota Service & Parts profile in the Auto Repair Shop category, beside the '
          + 'main Toyota Dealer profile.',
          'Walk your own building before you decide. If service has its own door, its own phone line, '
          + 'its own hours and a different category of work, a separate profile matches reality. If the '
          + 'service desk sits '
          + 'inside the showroom and shares one entrance and one number, one complete profile is the '
          + 'more accurate choice. [The same '
          + 'guidelines](https://support.google.com/business/answer/3038177) tell multi-brand stores not '
          + 'to combine brand names into a single profile, so check how each franchise is listed before '
          + 'you add service.',
          'Two more rules from those guidelines shape the setup. For car dealerships, [Google '
          + 'says](https://support.google.com/business/answer/3038177) the main profile lists car sales '
          + 'hours, using the new car sales hours when new and pre-owned hours differ, '
          + 'so service hours need a clear home too: the service profile when service runs separately, '
          + 'and always your website’s service page. And a profile name must match the real-world '
          + 'name, with no added service or location keywords. Whichever setup fits, complete '
          + 'the categories, services, hours, phone, website link and a plain description; '
          + '[how your Business Profile feeds AI answers](@google-business-profile-ai-answers) explains '
          + 'why each one counts.',
        ],
      },
      {
        type: 'bullets',
        id: 'service-facts-that-must-match',
        h2: 'Which service facts must match everywhere?',
        intro:
          'Every fact an owner acts on has to match everywhere it appears: service hours, the service '
          + 'phone number, the service entrance address, the makes and jobs you handle, loaner and '
          + 'shuttle rules, and how to book. When two sources disagree, an assistant may repeat the '
          + 'wrong one, and the owner blames your store when the door is locked.',
        items: [
          'Hours, by day. Weekday, Saturday and Sunday hours, early drop-off and after-hours key drop, '
          + 'the same on your Business Profile, your website service page, your manufacturer’s dealer '
          + 'locator, your online scheduler and your phone greeting.',
          'The service phone number. One number for service, used everywhere, and a separate one from '
          + 'sales only if it really rings at the service desk.',
          'The service entrance. If the service drive sits on a different street or behind the '
          + 'building, say so in words and in the directions on the profile.',
          'Makes and jobs. Which makes you service, which jobs you do in house and which you send '
          + 'out, such as tires, alignments, body work or EV battery work. List what you actually do.',
          'Loaners, shuttles and rentals. Who qualifies, whether a reservation is needed and what the '
          + 'owner should bring.',
          'How to book. The scheduler link, the phone number and your walk-in policy for quick jobs, '
          + 'stated the same way on every page.',
          'One name. [Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) ask for '
          + 'clear, consistent naming of organizations, products and locations, and say clear entity '
          + 'definition improves citation accuracy. Call the department the same thing everywhere, '
          + 'whether that is Service, Service & Parts or Service Center.',
          'One page that holds it all. A service section on [a dealership FAQ '
          + 'page](@car-dealership-faq-page) gives assistants a single place where hours, loaners, '
          + 'walk-ins and booking are written in full sentences, and gives your advisors a link to send.',
        ],
      },
      {
        type: 'callout',
        title: 'A two-minute test',
        body:
          'Ask ChatGPT, Claude or Gemini the question an owner would ask about your store: is the '
          + 'service department open Saturday, and do you have loaners. Check the answer against the '
          + 'truth. If it is wrong and the answer cites a source, that source is the first one to fix. '
          + 'If it cites nothing, the fix usually starts with your own profile and service page.',
      },
      {
        type: 'qa',
        id: 'service-price-questions',
        q: 'How should a service page answer price questions?',
        a: [
          'A service page should answer price questions with real prices only: the job, what the price '
          + 'includes, which vehicles it covers and the date it was last checked. When the price '
          + 'depends on the vehicle, say so and explain how to get a quote. Never publish an invented '
          + '“starting at” figure your service drive would not honor.',
          'Price is the service answer that hurts most when it is wrong. A line an assistant can quote '
          + 'safely names the job and the scope in one sentence: a synthetic oil change for most '
          + 'four-cylinder models, up to five quarts, filter included, price checked on the first of '
          + 'the month.',
          'Give each common job its own short answer, the way [dealer answer pages](@answer-pages-for-car-dealerships) work: the question as the heading, the '
          + 'direct answer first, then what is included and what is left out. Put specials and '
          + 'coupons on the same page with their expiration dates in the text, and take them down the '
          + 'day they end. An expired special left online is exactly the kind of stale fact an '
          + 'assistant can keep repeating.',
          'Warranty questions follow the same rule. Say whether you perform warranty work for the '
          + 'makes you sell, what the owner should bring, and who to call with a coverage question. '
          + 'Leave coverage details to the manufacturer’s warranty booklet instead of paraphrasing it.',
        ],
      },
      {
        type: 'qa',
        id: 'recall-questions',
        q: 'How should you answer recall questions?',
        a: [
          'Answer recall questions with your process, in plain steps: the owner sends or brings the '
          + 'VIN, your advisor checks it for open recalls, the store confirms whether parts are in '
          + 'stock, and the owner books a time. Say whether you handle recall work for every model of '
          + 'your brand and roughly how long the visit takes.',
          'Recall questions carry more worry than most. An owner who just got a letter in the mail '
          + 'wants to know three things: is my car affected, is it safe to keep driving, and how soon '
          + 'can you fix it. Your page can answer the first and third directly. For the second, point '
          + 'owners to the manufacturer’s recall notice for their vehicle and to your service '
          + 'advisors, and resist writing safety advice of your own. State what the owner pays for '
          + 'the repair in the same words the manufacturer’s notice uses.',
          'Used-car buyers ask the same question from the other side: does this car have open '
          + 'recalls. If your used-car team checks for open recalls before a vehicle goes on the lot, '
          + 'say so on the vehicle page with the date it was checked. A recall check at a dealership '
          + 'is a small service, and once it is written down it becomes an answer an assistant can '
          + 'quote.',
        ],
      },
      {
        type: 'qa',
        id: 'service-structured-data',
        q: 'Which structured data fits a service department?',
        a: [
          'A service department fits LocalBusiness structured data as a department of the dealership. '
          + '[Google’s LocalBusiness '
          + 'documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'recommends a department property for businesses with distinct departments and the most '
          + 'specific subtype available. On [schema.org](https://schema.org/AutomotiveBusiness), '
          + 'AutoRepair sits under AutomotiveBusiness beside AutoDealer, so the service department can '
          + 'be marked up as AutoRepair.',
          'In practice, the dealership’s AutoDealer markup carries a department entry for service '
          + 'with its own name, plus the telephone and openingHoursSpecification '
          + '[properties Google '
          + 'recommends](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'for local businesses. Your website vendor usually controls '
          + 'this code, so the job is to hand them the exact facts and check the result against the '
          + 'page.',
          'Keep expectations straight. Google says in its [guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that '
          + 'structured data is not required for generative AI search, and [Bing’s '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say markup '
          + 'may support clearer grounding but does not guarantee visibility, and must accurately '
          + 'reflect what is on the page. Markup that repeats accurate, visible service facts is worth '
          + 'having; markup that claims hours or services the page does not show is a liability.',
        ],
      },
      {
        type: 'qa',
        id: 'service-reviews',
        q: 'How should service reviews be handled?',
        a: [
          'Handle service reviews the same way as sales reviews: reply to each one in a timely manner, '
          + 'address the reviewer by name, and keep the reply free of promotion. [Google’s review '
          + 'tips](https://support.google.com/business/answer/3474122) ask for exactly that. A service '
          + 'reply should also name the next step, since the next owner wants to see how problems get '
          + 'handled.',
          'Service produces a steady stream of reviews, because an owner may visit several times a '
          + 'year. Those reviews are what an owner reads before booking, and they are part of the '
          + 'record an assistant may summarize when someone asks which dealer in town is good for '
          + 'service. [CarGurus’ 2025 consumer study](https://www.cargurus.com/press/2025_consumer_insights.html) '
          + 'of 3,030 people who had recently bought or sold a vehicle found 36% wanted AI to '
          + 'summarize reviews of dealerships.',
          'A calm, specific reply to a bad service review, one that names the fix or gives the service '
          + 'manager’s direct line, reads better to the next owner than a wall of five-star '
          + 'thank-yous. For the bigger picture, see [how dealership reviews affect AI answers](@dealership-reviews-ai-recommendations).',
          'On AutoLander’s AEO and GEO plans, our team answers every Google review within the plan’s '
          + 'window, service reviews included: 2 business days on AI Foundation, 1 business day on AI '
          + 'Authority and Market Leader. A person approves every reply to a 1-star or 2-star review. Review requests follow the rules: no incentives, and no filtering out '
          + 'unhappy customers.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Cox Automotive: how AI is influencing vehicle discovery and what dealers can do about '
          + 'it](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'August 26, 2026.',
          '[Google Business Profile Help: guidelines for representing your business on '
          + 'Google](https://support.google.com/business/answer/3038177).',
          '[Google Business Profile Help: review tips](https://support.google.com/business/answer/3474122).',
          '[Google Search Central: LocalBusiness structured '
          + 'data](https://developers.google.com/search/docs/appearance/structured-data/local-business).',
          '[Google Search Central: guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).',
          '[schema.org: AutomotiveBusiness](https://schema.org/AutomotiveBusiness).',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
          '[CarGurus 2025 consumer insights](https://www.cargurus.com/press/2025_consumer_insights.html), '
          + 'December 3, 2025.',
        ],
      },
    ],
    faq: [
      ['Should the service department have its own phone number online?',
        'Yes, if service has its own line that a person at the service desk answers. List that number '
        + 'wherever service appears: the service profile if you have one, the website service page and '
        + 'your online scheduler. If every call goes through one main number, say so, and make sure the '
        + 'phone menu gets an owner to service quickly.'],
      ['Should a dealership publish oil change prices?',
        'Publish them if they are real, current and honored at the service drive. State what is '
        + 'included, which vehicles the price covers and the date it was last checked. If the price '
        + 'varies too much by vehicle, say that plainly, explain how to get a quote and leave out the '
        + 'invented “starting at” number.'],
      ['How do we list Saturday service hours on Google?',
        'If service runs as a distinct department with its own entrance and categories, [Google’s '
        + 'guidelines](https://support.google.com/business/answer/3038177) allow it a separate profile, '
        + 'and its Saturday hours go there. The main dealership profile carries car sales hours under '
        + 'Google’s rules for dealers, so if service shares that profile, the website service page is '
        + 'where Saturday service hours must be spelled out. Either way, use the same hours on your '
        + 'website service page and your scheduler.'],
      ['Should we list service specials online?',
        'Only the ones you honor at every visit, with the end date shown. A special that outlives its '
        + 'date is a stale fact an assistant can repeat, and an owner who arrives expecting it becomes '
        + 'the next review.'],
    ],
    cta: {
      heading: 'See whether AI answers in your town name your store',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions a buyer in your town '
        + 'would ask, 3 times each. You see who gets named, which sources are cited and the 3 fixes to '
        + 'make first, checked by a person and walked through with you in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #32 /aeo-geo/trade-in-questions-in-ai-answers/
  // ---------------------------------------------------------------------------
  {
    slug: 'trade-in-questions-in-ai-answers',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 32,
    anchor: 'Trade-in questions in AI answers: what your trade-in page should say',
    crumb: 'Trade-in questions',
    primaryKeyword: 'dealership trade-in page',
    secondaryKeywords: [
      'trade-in questions buyers ask chatgpt',
      'trade-in value questions for dealers',
      'instant cash offer page',
      'trade in questions ai',
    ],
    alsoRelated: [
      'financing-questions-in-ai-answers',
      'service-department-ai-answers',
      'model-comparison-pages-for-dealers',
    ],
    augmentKeys: [],
    title: 'Trade-In Questions in AI Answers: What Your Page Should Say',
    description:
      'What car buyers ask AI about trade-in value, where those answers come from, and what a '
      + 'dealership trade-in page should say so buyers get it right.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Trade-in questions in AI answers: what buyers ask and what your trade page should say',
    tldr:
      'A dealership trade-in page should answer the questions no valuation tool can: how your '
      + 'appraisal works, how long it takes, what to bring, how payoffs are handled and how long an '
      + 'offer stands. Buyers ask AI what their car is worth and how trading in works, and the value '
      + 'answers tend to lean on third-party sites you do not control. No assistant can give an exact '
      + 'number for a car it has never seen, so your page earns its place by explaining the process '
      + 'honestly and stating your real policy in the first sentence.',
    sections: [
      {
        type: 'qa',
        id: 'what-buyers-ask-ai-about-trade-ins',
        q: 'What do buyers ask AI about trade-ins?',
        a: [
          'Buyers ask AI two kinds of trade-in questions: what their car is worth, and how trading it '
          + 'in actually works. A November 2025 [Cars.com '
          + 'survey](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'found shoppers most often used AI to compare models, find price estimates and answer '
          + 'reliability questions, and [Cox '
          + 'Automotive](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'lists trade-in guidance among the content dealers should publish.',
          'The value questions sound like this, and these examples are illustrative: “What is my 2019 '
          + 'Silverado worth as a trade-in?” “Is an instant cash offer from a dealer fair?” The process '
          + 'questions are the ones your used-car manager hears at the desk: “Can I trade in a car I '
          + 'still owe money on?” “Do I need my title?” “Will a dealer near me buy my car if I don’t buy '
          + 'one of theirs?” “How long does an appraisal take?”',
          'Trade-in questions sit alongside [the questions car buyers ask '
          + 'AI](@questions-car-buyers-ask-ai) about models, prices and stores, and a buyer who asks '
          + 'about the process is often already thinking about a visit. [Cox makes the same '
          + 'point](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'about shoppers in general: they use AI to research, compare and prepare for the dealership '
          + 'conversation, rather than to avoid it.',
          'Making sure your store’s answer is the one those buyers find is everyday work in [AEO for '
          + 'car dealerships](/aeo-geo-for-car-dealers/): clear pages on your own site, consistent facts '
          + 'across your profiles, and an honest read on which sources the assistants cite today.',
        ],
      },
      {
        type: 'qa',
        id: 'where-trade-in-value-answers-come-from',
        q: 'Where do AI answers about trade-in value come from?',
        a: [
          'AI answers about trade-in value tend to lean on third-party sources, such as valuation tools '
          + 'and marketplace sites, more than on a dealer’s own page. A [2025 research '
          + 'paper](https://arxiv.org/abs/2509.08919) found AI search services lean heavily toward '
          + 'third-party sources over brand-owned content, and [OpenAI '
          + 'warns](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) that '
          + 'search results and citations can be incomplete, outdated or incorrect.',
          'The paper, a [preprint by Chen, Wang, Chen and Koudas](https://arxiv.org/abs/2509.08919), '
          + 'describes a systematic tilt toward '
          + 'independent, authoritative sources over content a brand publishes about itself and over '
          + 'social posts. It also found the services differ from each other in how varied and how '
          + 'fresh their sources are, and in how much the wording of a question changes the answer. '
          + 'For a dealer, the practical reading is simple: when a buyer asks what a car is worth, the '
          + 'number in the answer is likely to come from somewhere you do not control.',
          'Your page still has a job, and it covers the part those sites cannot. A valuation tool can '
          + 'estimate a range for a model, year and mileage. It cannot tell a buyer how your appraisal '
          + 'works, how long it takes, how you handle a payoff or whether you will buy the car '
          + 'outright. Those answers exist only on your site, and when they are written clearly, an '
          + 'assistant has something from your store to quote next to the estimate.',
        ],
      },
      {
        type: 'qa',
        id: 'why-ai-cannot-give-an-exact-trade-in-number',
        q: 'Why can’t an AI answer give an exact trade-in number?',
        a: [
          'An AI answer cannot give an exact trade-in number because it has never seen the car. The '
          + 'real figure depends on condition, history, mileage, equipment, local demand and the market '
          + 'on the day of the appraisal. An honest trade-in page says that plainly and explains how '
          + 'your appraisal turns those facts into an offer.',
          'An online estimate works from general information: model, year, mileage and an assumed '
          + 'condition. The offer at your desk comes from the car in front of the appraiser: the '
          + 'scuffed bumper, the second key that is missing, the service records in the glovebox, the '
          + 'tires that need replacing, and how quickly that model sells on your lot this month. The '
          + 'gap between the two is where trust breaks, especially when the buyer arrives with a '
          + 'screenshot.',
          'Picture a hypothetical used-car store in a metro area. A buyer asks ChatGPT what her sedan '
          + 'is worth, gets a range, and walks in expecting the top of it. If the store’s trade-in page '
          + 'already explained what the appraisal checks and why offers can differ from online '
          + 'estimates, the conversation at the desk starts from shared facts instead of a surprise. '
          + 'If the page says nothing, the desk has to explain everything at the worst possible moment.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-a-trade-in-page-should-say',
        h2: 'What should a dealership trade-in page say?',
        intro:
          'A dealership trade-in page should answer the process questions no valuation tool can: how '
          + 'your appraisal works, how long it takes, which documents to bring, how payoffs and titles '
          + 'are handled, what raises or lowers the offer, and how long an offer stands. Write each as '
          + 'a short, direct answer under its own heading.',
        items: [
          'How the appraisal works. Who does it, what they check (exterior, interior, tires, warning '
          + 'lights, a short drive, a vehicle history report if you pull one) and whether the owner can '
          + 'watch.',
          'How long it takes. Your store’s real number of minutes, and whether booking ahead shortens it.',
          'What to bring. The title, or the lender name and account details if there is a loan; '
          + 'current registration; photo ID for everyone on the title; every key and remote; service '
          + 'records if the owner has them. Check the list with your title clerk.',
          'Loans and payoffs. How you handle a car with a loan on it, what happens when the payoff is '
          + 'more than the offer, and who contacts the lender.',
          'What raises or lowers the offer. Service records, a second key, clean history, accident '
          + 'repairs, warning lights, worn tires or brakes, aftermarket parts, and local demand for that '
          + 'model.',
          'How long an offer stands. In days, within how many added miles, and what would change it.',
          'How the offer is paid. Applied to a car on your lot, paid as a check, or either, depending '
          + 'on your policy.',
          'Instant cash offer tools. If you use one, say what it gives: an estimate that the in-person '
          + 'appraisal confirms or changes.',
          'The format. Put each answer under its own question heading with the direct answer first, '
          + 'the pattern that makes [dealer answer pages](@answer-pages-for-car-dealerships) '
          + 'easy for buyers and assistants to quote.',
        ],
      },
      {
        type: 'qa',
        id: 'should-you-publish-trade-in-value-ranges',
        q: 'Should you publish trade-in value ranges?',
        a: [
          'Publish trade-in value ranges only if they are real, current and backed by your own recent '
          + 'appraisals, and only if your desk will stand behind them. An invented range can get '
          + 'repeated by assistants and then contradicted at your appraisal desk, which is a quick way '
          + 'to lose a buyer who trusted the number.',
          'Most stores are better off publishing the method instead of the number. Explain which '
          + 'factors your appraiser weighs, describe how records and condition move an offer, and say '
          + 'the offer is written after the appraisal. That gives an assistant a truthful passage to '
          + 'quote, and it sets an expectation your desk can meet.',
          'If you do publish figures, attach everything that makes them true: the models and model '
          + 'years, the mileage band, the condition assumed and the date. Update them on a schedule, '
          + 'and take them down the moment nobody is checking them. A range with no date on it can keep '
          + 'circulating long after the market has moved.',
        ],
      },
      {
        type: 'qa',
        id: 'will-you-buy-my-car-outright',
        q: 'How should you answer buyers who ask if you’ll buy their car outright?',
        a: [
          'State your store’s real policy in the first sentence: yes, you buy cars outright even if '
          + 'the owner buys nothing, or no, you only take trades toward a purchase, or it depends on the '
          + 'vehicle. Then say how to start, what you buy and do not buy, and how payment works.',
          'Put the answer first because that is where readers and machines look. [Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) advise '
          + 'putting essential information near the top of a page and avoiding long introductions, '
          + 'because early clarity improves what Bing calls grounding visibility: how readily a page is '
          + 'picked as a source for AI answers. A trade-in page that opens with three '
          + 'paragraphs of store history and mentions outright purchases at the bottom leaves an '
          + 'assistant guessing.',
          'Be specific about the edges of the policy. A hypothetical independent store might write: '
          + '“Yes, we buy cars even if you don’t buy one from us. We buy most cars, trucks and SUVs. '
          + 'Bring the title and every key.” Then add the appraisal time your desk really quotes. Every '
          + 'clause in that answer is something the store controls and can keep true.',
        ],
      },
      {
        type: 'bullets',
        id: 'connect-trade-in-financing-inventory',
        h2: 'How do trade-in pages connect to inventory and financing pages?',
        intro:
          'On your own site, the trade-in page should point to the financing page and the FAQ, and all '
          + 'three should state the same facts about payoffs, documents, appraisal timing and how a '
          + 'trade is applied to a purchase. When they disagree, an assistant reading them may repeat '
          + 'the wrong one.',
        items: [
          'Trade-in to financing. One sentence on how trade equity, or a payoff larger than the offer, '
          + 'affects the deal, then a link to your financing page for the rest.',
          'Trade-in to FAQ. The short trade-in answers belong on [a dealership FAQ '
          + 'page](@car-dealership-faq-page) too, in the same words, so the two pages never drift apart.',
          'Trade-in to inventory. A buyer ready to trade is usually shopping a specific car, so link to '
          + 'your inventory and make sure your [vehicle detail pages AI can '
          + 'read](@vehicle-detail-page-ai-readable) show price, mileage and the VIN as text.',
          'One owner for the facts. The used-car manager signs off on every trade-in answer, and the '
          + 'page shows the date it was last checked.',
          'The same process at the desk. What the page says the appraiser checks is what the appraiser '
          + 'checks, so update the page the day the process changes.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Cars.com survey on AI and car shopping](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping), '
          + 'November 20, 2025.',
          '[Cox Automotive: how AI is influencing vehicle discovery and what dealers can do about '
          + 'it](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'August 26, 2026.',
          '[Chen, Wang, Chen and Koudas, preprint on AI search sources](https://arxiv.org/abs/2509.08919), '
          + 'arXiv, September 10, 2025.',
          '[OpenAI Help Center: searching the web with '
          + 'ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt).',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
        ],
      },
    ],
    faq: [
      ['Should a trade-in page include an instant offer tool?',
        'It can, if the page says what the tool gives: an estimate that the in-person appraisal '
        + 'confirms or changes. Explain what the appraiser checks, how long an offer stands and what can '
        + 'move it. A tool with no explanation leaves buyers treating the estimate as a final number.'],
      ['What documents should buyers bring for a trade-in?',
        'Publish your store’s own list and check it with your title clerk. A typical list covers the '
        + 'title, or the lender and payoff details if there is a loan, current registration, photo ID '
        + 'for everyone on the title, and every key and remote. Tell buyers what to do if something is '
        + 'missing.'],
      ['Should a trade-in page compare trading in with selling privately?',
        'It can, honestly. Explain what a trade-in saves the owner in time and paperwork, how a '
        + 'payoff is handled and whether your state reduces sales tax on a trade, and never claim a '
        + 'trade-in beats a private sale on price. A page that admits the tradeoff reads as more '
        + 'trustworthy than one that hides it.'],
      ['How often should a trade-in page be updated?',
        'Whenever the process changes: new appraisal hours, a new offer window, new documents to '
        + 'bring. Values on valuation sites move constantly, which is one more reason to describe your '
        + 'process on the page and leave live numbers to the appraisal.'],
    ],
    cta: {
      heading: 'See what AI tells trade-in buyers in your town',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions a buyer in your town '
        + 'would ask, 3 times each. You see who gets named, which sources are cited and the 3 fixes to '
        + 'make first, checked by a person and walked through with you in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #40 /aeo-geo/financing-questions-in-ai-answers/
  // ---------------------------------------------------------------------------
  {
    slug: 'financing-questions-in-ai-answers',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 40,
    anchor: 'Car financing questions in AI answers: how dealers should answer them honestly',
    crumb: 'Financing questions',
    primaryKeyword: 'dealership financing page',
    secondaryKeywords: [
      'finance questions car buyers ask ai',
      'how to explain dealer financing on a website',
      'first-time buyer financing page',
      'financing faq for dealership website',
    ],
    alsoRelated: [
      'buy-here-pay-here-marketing',
      'model-comparison-pages-for-dealers',
      'questions-car-buyers-ask-ai',
      'answer-pages-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'Car Financing Questions in AI Answers: Answer Them Honestly',
    description:
      'What car buyers ask AI about dealer financing, and how a dealership’s financing page and FAQ '
      + 'should answer honestly, with no rate or approval claims.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Car financing questions in AI answers: how dealers should answer them honestly',
    tldr:
      'Buyers now put dealer financing questions to AI in plain words: how does dealer financing '
      + 'work, is a bank loan better, what does a first-time buyer need, can I get approved. Your '
      + 'dealership financing page and FAQ should answer them in simple steps, with no rates, no approval claims '
      + 'and nothing your compliance lead has not approved. Searches phrased as questions are the '
      + 'ones most likely to get an AI summary, so the page an assistant quotes may be the only '
      + 'version of your answer a buyer reads.',
    sections: [
      {
        type: 'qa',
        id: 'dealer-financing-questions-buyers-ask-ai',
        q: 'What dealer financing questions do car buyers ask AI?',
        a: [
          'Car buyers ask AI dealer financing questions about process and fit: how dealer financing '
          + 'works, whether a bank or credit union loan is better, what a first-time buyer needs, what '
          + 'changes a monthly payment, and whether they can get approved. [Cox '
          + 'Automotive](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'lists financing FAQs among the content dealers should publish for shoppers who start with AI.',
          'In their own words, and these examples are illustrative: “How does financing at a car '
          + 'dealership work?” “Is it better to get a car loan from my bank or the dealer?” “What do I '
          + 'need to finance a car for the first time?” “Why is my payment higher than the calculator '
          + 'said?” “Can I get approved with no credit history?” Each is a real decision point, and '
          + 'many get asked before the buyer ever talks to your F&I office.',
          'Financing questions travel with trade-in questions, because the trade often shapes the down '
          + 'payment. Answer both on your own site, starting with [what your trade-in page should '
          + 'say](@trade-in-questions-in-ai-answers), and keep the shared facts identical on both pages.',
          'Helping assistants find and quote those answers accurately is part of [AEO for car '
          + 'dealerships](/aeo-geo-for-car-dealers/). On finance topics the bar is higher than anywhere '
          + 'else on your site, because a wrong sentence can mislead a buyer about money.',
        ],
      },
      {
        type: 'qa',
        id: 'why-finance-questions-get-ai-summaries',
        q: 'Why do finance questions get AI summaries so often?',
        a: [
          'Finance questions are likely to get AI summaries because buyers phrase them as questions, '
          + 'and question-shaped searches trigger summaries far more than searches overall. [Pew Research '
          + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'found about 18% of Google searches in March 2025 produced an AI summary, rising to 60% for '
          + 'searches phrased as questions and 53% for searches of ten or more words.',
          '[Pew’s '
          + 'figures](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'come from the browsing data of 900 US adults and cover Google searches in general, not '
          + 'finance searches in particular. They show a second shift too: '
          + 'users ended their browsing session on 26% of pages with an AI summary, against 16% of '
          + 'pages without one. For a finance question, the summary may be the whole answer a buyer '
          + 'reads before deciding whether to call you.',
          'That shift is why dealers keep asking [whether SEO is dead for '
          + 'dealers](@is-seo-dead-for-car-dealers). The groundwork has not changed: [Google '
          + 'says](https://developers.google.com/search/docs/appearance/ai-features) a page has to be '
          + 'indexed and eligible to show with a snippet in Google Search to appear in AI Overviews or '
          + 'AI Mode. Finance pages are a good place to start, because the questions are predictable '
          + 'and the answers about process change slowly.',
        ],
      },
      {
        type: 'steps',
        id: 'how-dealer-financing-works',
        h2: 'How should a dealership explain how dealer financing works?',
        intro:
          'Explain dealer financing as a short sequence of plain steps: the buyer applies, the '
          + 'dealership sends the application to lenders it works with, a lender makes an offer, and '
          + 'the buyer reviews and signs a contract. Leave rates and approval odds out, and have your '
          + 'F&I manager and compliance lead approve the wording.',
        steps: [
          {
            title: 'The buyer applies',
            body:
              'Say where and how: an online form, in the store, or both, and what the application asks '
              + 'for. If buyers ask whether applying affects their credit, answer in words your '
              + 'compliance lead has approved.',
          },
          {
            title: 'The store sends it to lenders',
            body:
              'Explain in plain words whether your store works with one lender or several, and which '
              + 'kinds, such as banks, credit unions or a manufacturer’s finance company, if that is true '
              + 'for you. Say whether buyers can bring their own financing.',
          },
          {
            title: 'A lender makes an offer',
            body:
              'If your store arranges financing through outside lenders, explain that the lender '
              + 'decides whether to approve and on what terms, and that your team walks through the '
              + 'offer before anything is signed. Leave rates and sample payments out unless compliance '
              + 'has cleared them.',
          },
          {
            title: 'The buyer reviews and signs',
            body:
              'Say what the buyer sees before signing: the amount financed, the term, the payment and '
              + 'any optional products, each explained by a person who answers questions. Say the buyer '
              + 'can take the time to read everything.',
          },
          {
            title: 'The FAQ says the same thing',
            body:
              'Put the short version of each step on [a dealership FAQ page](@car-dealership-faq-page) '
              + 'in the same words, so the financing page and the FAQ never disagree.',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'what-never-to-say-on-a-financing-page',
        h2: 'What should you never say on a financing page?',
        intro:
          'Never put anything on a financing page that your store cannot honor for every buyer or that '
          + 'your compliance lead has not approved. That rules out guaranteed or instant approval '
          + 'claims, rates you cannot honor, and payment examples without the terms behind them. An '
          + 'assistant may keep repeating a bad line after you fix it.',
        items: [
          'Never “guaranteed approval,” “everyone is approved” or “no credit, no problem.” No store can '
          + 'say that truthfully about every buyer.',
          'Rates or APRs you cannot honor today for the buyers who will read them.',
          'Monthly payment figures your compliance lead has not reviewed, or any payment shown without '
          + 'the terms behind it.',
          'Claims that financing with you will repair a buyer’s credit. No page can say that about every '
          + 'buyer.',
          'Lender or vendor template copy that describes programs your store does not offer.',
          'Legal or tax advice. Send those questions to a professional.',
          'Anything your F&I manager would not say across the desk to a buyer’s face.',
        ],
      },
      {
        type: 'callout',
        title: 'Nothing here is legal advice',
        body:
          'Finance advertising rules are specific and can vary by state. Run every financing sentence '
          + 'past your compliance lead or the counsel your store already uses before it goes live, and '
          + 'keep a record of who approved it and when.',
      },
      {
        type: 'qa',
        id: 'first-time-buyer-and-credit-questions',
        q: 'How do you answer first-time buyer and credit questions?',
        a: [
          'Answer first-time buyer and credit questions with preparation instead of predictions: list '
          + 'the documents buyers usually bring, explain what a co-signer is and when lenders may ask '
          + 'for one, cover down payment basics, and name the person at your store who answers '
          + 'questions privately. Leave approval odds and rates out.',
          'A first-time buyer page earns trust by removing surprises. List the documents your F&I '
          + 'office typically asks for, such as a driver’s license, proof of income, proof of residence '
          + 'and proof of insurance, and tell buyers to confirm the list with your team. Explain in one '
          + 'or two sentences what a co-signer is. Explain that a larger down payment lowers the amount '
          + 'financed. Then name someone the buyer can talk to privately, by phone or in the store.',
          'Write for the nervous reader. A first-time buyer asking an assistant “can I buy a car with no '
          + 'credit history” wants to know whether a visit is worth it at all. An honest answer tells '
          + 'them what to bring and who to ask, and leaves the lending decision where it belongs.',
          'Buyers with damaged credit ask different questions, and stores that finance in-house answer '
          + 'them differently. That ground is covered in [buy here pay here dealers in AI '
          + 'answers](@buy-here-pay-here-ai-answers).',
        ],
      },
      {
        type: 'qa',
        id: 'who-should-review-finance-content',
        q: 'Who should review finance content?',
        a: [
          'Your F&I manager should write or check every financing answer, and your compliance lead, or '
          + 'the outside counsel your store uses, should approve it before it goes live. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) trust '
          + 'is the most important part of E-E-A-T, and finance pages are where a wrong sentence can cost '
          + 'a buyer money.',
          'The same [helpful content '
          + 'guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) '
          + 'asks creators to make clear who wrote a page, how it was made and why. On a financing '
          + 'page, that means a visible reviewer, such as “Reviewed by our F&I manager,” and a '
          + 'last-reviewed date. The buyer sees a real person behind the words, and your team gets a '
          + 'reminder to recheck them.',
          'Set a review schedule. Lender programs, store policies and the rules around finance '
          + 'advertising all change, so a page that was accurate last year may be wrong today. A '
          + 'quarterly check by the F&I manager, with changes approved by compliance, keeps the page and '
          + 'the desk saying the same thing.',
          'On AutoLander’s plans, answer pages use only your own facts and go live only after you '
          + 'approve them, which leaves room for your compliance lead to read every financing page first.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Cox Automotive: how AI is influencing vehicle discovery and what dealers can do about '
          + 'it](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'August 26, 2026.',
          '[Pew Research Center: Google users are less likely to click on links when an AI summary '
          + 'appears](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/), '
          + 'July 22, 2025.',
          '[Google Search Central: AI features and your '
          + 'website](https://developers.google.com/search/docs/appearance/ai-features).',
          '[Google Search Central: creating helpful, reliable, people-first '
          + 'content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).',
        ],
      },
    ],
    faq: [
      ['Can a dealership list current interest rates online?',
        'Only with care. Rates change with the lender, the buyer and the day, so a published rate goes '
        + 'stale fast and an assistant may keep repeating it. If your store does publish a rate, your '
        + 'compliance lead should approve the wording and the terms around it, and someone should own '
        + 'keeping it current.'],
      ['Should a dealer website say everyone is approved?',
        'No. No store can say that truthfully about every buyer, and it is the first line a compliance '
        + 'review should strike. Say what you can stand behind: which kinds of lenders you work with, '
        + 'that a person reviews every application, and who the buyer can talk to.'],
      ['Is dealer financing more expensive than a bank loan?',
        'It depends on the lender, the buyer and the offer, so no honest page can answer that for '
        + 'everyone. A useful page explains that buyers can compare a dealer-arranged offer with a bank '
        + 'or credit union preapproval, and says whether your store accepts outside financing.'],
      ['Should the finance manager write the financing pages?',
        'The F&I manager should supply the facts and check every sentence, because nobody knows your '
        + 'process better. A marketing lead or outside writer can shape the page, and your compliance '
        + 'lead approves it before it goes live. Put the reviewer’s role and a last-reviewed date on '
        + 'the page.'],
    ],
    cta: {
      heading: 'See what ChatGPT and Claude tell buyers in your town',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions a buyer in your town '
        + 'would ask, 3 times each, and shows who they name, what they cite and the 3 fixes to make '
        + 'first. A person checks every report and walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #45 /aeo-geo/model-comparison-pages-for-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'model-comparison-pages-for-dealers',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 45,
    anchor: 'Model comparison pages for car dealers: how to write them',
    crumb: 'Model comparison pages',
    primaryKeyword: 'model comparison pages for dealerships',
    secondaryKeywords: [
      'car comparison page seo',
      'vs pages for dealerships',
      'trim comparison page',
      'model research content for dealers',
    ],
    alsoRelated: [
      'youtube-for-car-dealerships-ai',
      'rv-dealer-ai-search',
      'powersports-dealer-ai-search',
      'inventory-feeds-ai-shopping',
      'google-ai-overviews-for-car-dealers',
    ],
    augmentKeys: [],
    title: 'Model Comparison Pages for Car Dealers: How to Write Them',
    description:
      'How car dealers can write model comparison pages that shoppers and AI tools trust: which '
      + 'matchups to pick, what to include and what to leave out.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Model comparison pages AI answers can use, and how dealers should write them',
    tldr:
      'Model comparison pages for dealerships answer a question shoppers already bring to AI: which '
      + 'of these two fits me better. Start with the matchups your sales team hears every week, add '
      + 'the first-hand experience a national review site does not have, source every spec to the '
      + 'manufacturer with the model year and a date, and say fairly where the rival wins. One strong '
      + 'page per real matchup serves buyers better than a stack of near-duplicates.',
    sections: [
      {
        type: 'qa',
        id: 'why-publish-model-comparison-pages',
        q: 'Why should a dealership publish model comparison pages?',
        a: [
          'A dealership should publish model comparison pages because comparing models is one of the '
          + 'main things shoppers use AI for. [CarGurus’ 2025 consumer '
          + 'study](https://www.cargurus.com/press/2025_consumer_insights.html) found comparing vehicles '
          + 'was the top use buyers and sellers wanted from AI, at 44%, and a [Cars.com '
          + 'survey](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'found shoppers most often used AI to identify and compare models.',
          'The [CarGurus figure](https://www.cargurus.com/press/2025_consumer_insights.html) comes from '
          + '3,030 people who had bought or sold a vehicle in the previous '
          + 'four months, surveyed in May and June 2025. [Cox Automotive’s 2025 Car Buyer Journey '
          + 'study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
          + 'shows why the comparison question stays open so long: 71% of buyers started with an open '
          + 'mind about what to buy, and 66% considered both new and used vehicles.',
          'A buyer who has not decided is exactly the buyer who asks an assistant to compare, a pattern '
          + 'that runs through [how car buyers use ChatGPT](@how-car-buyers-use-chatgpt) for shopping in '
          + 'general. [Cox’s guidance to '
          + 'dealers](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'lists comparisons among the content dealers should publish, and recommends vehicle data '
          + 'that goes past year, make and model: features, packages, fuel economy, safety technology, '
          + 'seating and towing.',
          'Being a source the assistants can use for those comparisons is what [generative engine '
          + 'optimization for dealers](/aeo-geo-for-car-dealers/) works toward. No one can promise an '
          + 'assistant will pick your page, and a clear, first-hand comparison gives it a reason to.',
        ],
      },
      {
        type: 'bullets',
        id: 'which-comparisons-to-write-first',
        h2: 'Which comparisons should a dealer write first?',
        intro:
          'Write first the comparisons your sales team already hears on the lot: the models you stock '
          + 'against the models buyers cross-shop them with, new against used of the same model, and '
          + 'trim against trim for your best sellers. Those are the questions buyers bring to the lot, '
          + 'and your store can answer them from experience.',
        items: [
          'Your model against its main rival. Ask your salespeople which competing model buyers '
          + 'mention most when they come in for yours, and start there. A franchise store in a suburban '
          + 'market, for example, might hear the same compact SUV rival named week after week.',
          'New against used of the same model. With 66% of buyers in [Cox’s 2025 '
          + 'study](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf) '
          + 'considering both new and used, a page comparing this year’s model with a two- or '
          + 'three-year-old one of the same nameplate answers a real question.',
          'Trim against trim. The step from one trim to the next is a question your salespeople answer '
          + 'constantly, and it is where knowing which trims you actually stock pays off.',
          'Body style against body style. A three-row SUV against a minivan, or a midsize truck against '
          + 'a full-size one, if your floor has that conversation often.',
          'Models with inventory behind them. Tie each comparison to units you have, and make sure the '
          + 'linked [vehicle detail pages AI can read](@vehicle-detail-page-ai-readable) carry price, '
          + 'mileage and the VIN as text.',
          'Skip matchups nobody asks about, however easy they would be to write.',
        ],
      },
      {
        type: 'qa',
        id: 'dealer-comparison-vs-review-sites',
        q: 'What makes a dealer comparison different from Edmunds or Car and Driver?',
        a: [
          'A dealer comparison can offer what a national review site does not have: first-hand, local '
          + 'experience with the cars on your lot. [Google '
          + 'says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) unique, '
          + 'non-commodity content is likely to influence presence in generative AI search more than any '
          + 'other suggestion in its guide, and it holds up first-hand reviews as the model.',
          '[Google’s guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'is blunt about the alternative: “Don’t just recycle what others on the '
          + 'internet have already said.” A dealer page that restates the manufacturer’s brochure adds '
          + 'nothing an assistant cannot already find. A dealer page that says what your team learned '
          + 'on a test drive adds something nobody else can.',
          'That first-hand material is easy to collect once you ask for it. Examples, all illustrative: '
          + 'how a rear-facing car seat fits behind the driver in each model, how the third row folds '
          + 'when the cargo area is full, how the hybrid felt on the highway near your store, what '
          + 'owners mention when they come back for their first service, and which trims actually '
          + 'arrive on your lot. Write it down in your team’s own words and put a name on it.',
          'Structure each comparison the way [dealer answer pages](@answer-pages-for-car-dealerships) are structured: the matchup as a question '
          + 'in the heading, a two- or three-sentence verdict first, then the detail.',
        ],
      },
      {
        type: 'table',
        id: 'what-a-comparison-page-includes',
        h2: 'What should model comparison pages for dealerships include?',
        intro:
          'Model comparison pages for dealerships should include the facts buyers compare and the '
          + 'verdict they came for: manufacturer specs, seating, towing, fuel economy and safety '
          + 'technology, the trims you actually stock, and a plain verdict by buyer type. Each row below '
          + 'is something a buyer can check on your lot or ask a salesperson about.',
        head: ['Part of the page', 'What goes in it', 'Where it comes from'],
        rows: [
          ['The question', 'The matchup as buyers say it, such as which is better for a family of five', 'Your sales team and your lead notes'],
          ['The direct answer', 'Two or three sentences with the verdict by buyer type', 'Your team’s first-hand view'],
          ['Specs side by side', 'Seating, cargo space, towing, fuel economy or range, drivetrain', 'Each manufacturer’s published specs for that model year'],
          ['Safety technology', 'Standard and optional driver-assistance features by trim', 'Manufacturer spec sheets for the trims compared'],
          ['Trims you stock', 'Which trims and colors are on your lot this month, linked to inventory', 'Your inventory feed'],
          ['First-hand notes', 'Test-drive impressions, car seat fit, what owners mention at service', 'Your staff, in their own words'],
          ['Where the rival wins', 'An honest point or two in the other model’s favor', 'Your team, checked against specs'],
          ['Last updated', 'The date the page was checked and who checked it', 'Whoever owns the page'],
        ],
        note:
          'Put the model year on every spec. Specs change from one model year to the next, and '
          + 'sometimes within one.',
      },
      {
        type: 'bullets',
        id: 'keep-comparison-specs-accurate',
        h2: 'How do you keep specs accurate?',
        intro:
          'Keep specs accurate by sourcing every figure to the manufacturer for the right model year, '
          + 'putting a last-updated date on the page, and rechecking when a new model year or a midyear '
          + 'change lands. Stale comparison specs mislead buyers and the assistants that read your '
          + 'page, and the error shows up at the lot.',
        items: [
          'Freshness matters to the assistants too. Microsoft AI researchers wrote on the [Bing Search '
          + 'Blog](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'that freshness is critical for AI answers, because an outdated fact leads to a misleading '
          + 'response.',
          'Source every figure to the manufacturer’s published specifications for that model year and '
          + 'trim, and name the source on the page.',
          'Put the model year in the page title, the table header and every spec row, never just the '
          + 'model name.',
          'Add a last-updated date and the name or role of the person who checked it.',
          'Recheck each comparison when the new model year reaches your lot, and retire pages for '
          + 'models you no longer sell.',
          'Never estimate a spec. If you cannot source it, leave it out.',
        ],
      },
      {
        type: 'qa',
        id: 'compare-brands-you-dont-sell',
        q: 'Should you compare against brands you don’t sell?',
        a: [
          'Yes, if you do it fairly. Buyers cross-shop across brands, and a comparison that admits '
          + 'what the other model does better reads as honest to buyers and gives an assistant a '
          + 'balanced passage to quote. Say where the rival wins, say where yours wins, and let the '
          + 'verdict depend on the buyer’s needs.',
          'Buyers are watching for bias. A November 2025 [Cars.com '
          + 'survey](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping) '
          + 'of 936 people found 63% worried that AI tools might recommend cars in a biased way. A '
          + 'dealer page that always picks its own badge feeds that worry. A page that says “the rival '
          + 'has more cargo room behind the third row; ours has the stronger standard safety package; '
          + 'here is who each suits” helps the buyer decide, and the buyer remembers who helped.',
          'Franchise dealers should check their franchise agreement and their manufacturer’s '
          + 'advertising rules for anything on comparative claims, and keep every statement about the '
          + 'other model factual and sourced. Never say anything about another dealer’s prices, service '
          + 'or stock.',
        ],
      },
      {
        type: 'bullets',
        id: 'what-a-comparison-page-should-avoid',
        h2: 'What should a comparison page avoid?',
        intro:
          'A comparison page should avoid anything that makes it look written for search engines '
          + 'instead of buyers: a separate page for every phrasing of the same matchup, keyword '
          + 'stuffing, specs you cannot source and one-sided verdicts. One strong page per real matchup, '
          + 'kept current, serves buyers better.',
        items: [
          'A page for every phrasing. [Google '
          + 'warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) that '
          + 'making separate content for every variation of how people search, including fan-out '
          + 'queries, mainly to manipulate rankings or AI responses violates its scaled content abuse '
          + 'policy, and that a high quantity of pages does not make a site higher quality.',
          'A page for every sub-question. Google says [AI Overviews and AI Mode may run a query '
          + 'fan-out](https://developers.google.com/search/docs/appearance/ai-features), several related '
          + 'searches that build one answer, so one thorough page that covers the sub-questions is the '
          + 'better bet. [Google AI Mode and query fan-out](@google-ai-mode-for-car-dealers) explains '
          + 'how that works.',
          'Keyword stuffing. [Google’s spam '
          + 'policies](https://developers.google.com/search/docs/essentials/spam-policies) define it as '
          + 'filling a page with keywords to manipulate rankings, such as repeating phrases so often it '
          + 'sounds unnatural. Write model names the way a person says them.',
          'Specs you cannot source, including anything remembered from a forum or an old brochure.',
          'Claims about another dealer’s prices, service or stock.',
          'A verdict that always favors the badge you sell.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[CarGurus 2025 consumer insights](https://www.cargurus.com/press/2025_consumer_insights.html), '
          + 'December 3, 2025.',
          '[Cars.com survey on AI and car shopping](https://investor.cars.com/2025-11-20-Cars-com-Survey-Reveals-AIs-Growing-Influence-on-Car-Shopping-97-of-AI-Users-Say-it-Will-Impact-Purchase-Decisions-and-Almost-Half-Have-Already-Leveraged-the-Tech-for-Car-Shopping), '
          + 'November 20, 2025.',
          '[Cox Automotive 2025 Car Buyer Journey press '
          + 'release](https://www.coxautoinc.com/wp-content/uploads/2026/01/2025-Cox-Automotive-Car-Buyer-Journey-Press-Release.pdf), '
          + 'January 13, 2026.',
          '[Cox Automotive: how AI is influencing vehicle discovery and what dealers can do about '
          + 'it](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/), '
          + 'August 26, 2026.',
          '[Google Search Central: guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).',
          '[Google Search Central: AI features and your '
          + 'website](https://developers.google.com/search/docs/appearance/ai-features).',
          '[Google Search Central: spam policies](https://developers.google.com/search/docs/essentials/spam-policies).',
          '[Bing Search Blog: the evolving role of the '
          + 'index](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers), '
          + 'May 6, 2026.',
        ],
      },
    ],
    faq: [
      ['Can a franchise dealer compare its brand with a competitor?',
        'Yes. Buyers cross-shop brands, and a fair comparison helps them decide. Check your franchise '
        + 'agreement and your manufacturer’s advertising rules for anything on comparative claims, '
        + 'source every spec to the manufacturer, and say honestly where the other model is stronger.'],
      ['Where should a dealer get accurate specs for comparisons?',
        'From each manufacturer’s published specifications for the exact model year and trim. Put the '
        + 'model year next to every figure, link or name the source, and recheck when the next model '
        + 'year arrives. Leave out any spec you cannot trace to the manufacturer.'],
      ['Should comparison pages link to inventory?',
        'Yes. A buyer who finishes a comparison is ready to look at cars, so link each model to the '
        + 'matching units you stock. Keep the links current, and say which trims are on your lot this '
        + 'month so the page stays true to your inventory.'],
      ['How many comparison pages should a dealer publish?',
        'As many as there are real matchups your buyers ask about, and no more. Start with the few '
        + 'your sales team hears every week, do them well, and add others when new questions show up. '
        + '[Google warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
        + 'that a high quantity of pages does not make a site higher quality.'],
    ],
    cta: {
      heading: 'Find out whether AI names your store for buyers in your town',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions a buyer in your town '
        + 'would ask, 3 times each. You see who gets named, which sources are cited and the 3 fixes to '
        + 'make first, checked by a person and walked through with you in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #49 /aeo-geo/youtube-for-car-dealerships-ai/
  // ---------------------------------------------------------------------------
  {
    slug: 'youtube-for-car-dealerships-ai',
    silo: 'aeoGeo',
    cluster: 'content',
    publishOrder: 49,
    anchor: 'YouTube for car dealerships: video answers people and AI can find',
    crumb: 'YouTube video answers',
    primaryKeyword: 'youtube for car dealerships',
    secondaryKeywords: [
      'dealership video seo',
      'answer videos for dealers',
      'video transcripts and chapters',
      'youtube citations in ai answers',
    ],
    alsoRelated: [
      'car-walkaround-video-for-dealers',
      'local-pr-for-car-dealerships',
      'reddit-and-dealership-reputation',
    ],
    augmentKeys: [],
    title: 'YouTube for Car Dealerships: Video Answers AI Can Find',
    description:
      'How car dealerships can use YouTube video answers that people and AI tools can find: which '
      + 'questions to film, transcripts, chapters and disclosure.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'YouTube and video answers for car dealerships',
    tldr:
      'YouTube for car dealerships works best as a library of short video answers: one buyer '
      + 'question per video, answered in the first seconds and filmed at your store with your own '
      + 'people and cars. Give every video a question-style title, chapters and a checked transcript, '
      + 'then embed it on the matching page of your website with the answer written out as text. Keep '
      + 'it real: no AI-generated presenters posing as staff or customers, and a disclosure on any '
      + 'realistic altered footage.',
    sections: [
      {
        type: 'qa',
        id: 'why-answer-buyer-questions-on-youtube',
        q: 'Why should a dealership answer buyer questions on YouTube?',
        a: [
          'A dealership should answer buyer questions on YouTube because video is one of the sources '
          + 'AI answers draw on. [Pew Research '
          + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'found Wikipedia, YouTube and Reddit together made up 15% of the sources cited in Google’s '
          + 'AI summaries, and [Google '
          + 'says](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/) '
          + 'people increasingly seek videos and posts with first-hand perspectives.',
          '[Pew’s '
          + 'numbers](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
          + 'come from March 2025 browsing data from 900 US adults, and the same three '
          + 'sites made up 17% of the links in standard results. The point for a dealer is simple: '
          + 'video is a normal part of what Google’s AI summaries cite. [Google’s guide to generative '
          + 'AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'adds that its AI features can show what is said about products and services across the '
          + 'web, videos included.',
          'For how those summaries choose and cite pages in general, see [how Google AI Overviews cite '
          + 'dealer pages](@google-ai-overviews-for-car-dealers).',
          'Video answers are one part of [generative engine optimization for '
          + 'dealers](/aeo-geo-for-car-dealers/). No one can promise that a particular video will be '
          + 'cited, and [the same Google '
          + 'guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) warns '
          + 'that chasing inauthentic mentions is less helpful '
          + 'than it seems. Real answers from your own store are the version worth making.',
        ],
      },
      {
        type: 'qa',
        id: 'video-answer-vs-walkaround',
        q: 'What is a video answer, and how is it different from a walkaround?',
        a: [
          'A video answer answers one buyer question in its first seconds, then shows the proof. A '
          + 'walkaround shows one car on your lot so a shopper can see its condition and features. A '
          + 'walkaround sells a unit; a video answer explains something buyers keep asking, and it stays '
          + 'useful long after that car is sold.',
          'Titles for video answers read like the questions buyers type, and these are illustrative: '
          + '“How do you fold the third row flat?” “How long does a trade-in appraisal take at our '
          + 'store?” “Where do I drop off my car for service before 7 a.m.?” Each one earns its place '
          + 'because buyers keep asking it, whatever is on the lot this week.',
          'Walkarounds still matter for moving individual units, and they have their own guide in the '
          + 'Keep exploring links on this page. This guide covers the other kind: the video that answers '
          + 'a question and keeps answering it for years.',
        ],
      },
      {
        type: 'bullets',
        id: 'questions-for-video-answers',
        h2: 'Which questions make good video answers?',
        intro:
          'Good video answers come from questions where seeing helps: comparisons between models you '
          + 'sell, how your trade-in appraisal works, what happens at a service walk-in, and how to use '
          + 'features on the models on your lot. Pick questions your staff answers every week, and film '
          + 'the answer in your store.',
        items: [
          'Model against model. The video version of your [model comparison '
          + 'pages](@model-comparison-pages-for-dealers), filmed with both vehicles side by side where '
          + 'you have them, with the verdict by buyer type spoken in the first seconds.',
          'The trade-in process. What the appraiser looks at, how long it takes and what to bring, '
          + 'shown at your appraisal lane.',
          'The service walk-in. Where to pull in, who greets the owner, and how loaners and shuttles '
          + 'work, filmed at your service drive.',
          'Feature how-tos on models you sell. Pairing a phone, folding the third row, setting up '
          + 'driver-assistance features, or charging at home if you sell EVs.',
          'Questions from your FAQ. Every entry on [a dealership FAQ page](@car-dealership-faq-page) '
          + 'that people also ask on the phone every week is a candidate for a short video answer.',
          'Leave out price quotes, rates and anything that changes weekly. Those belong on the page, '
          + 'where they are easy to update.',
        ],
      },
      {
        type: 'steps',
        id: 'how-to-structure-a-video-answer',
        h2: 'How should a video answer be structured?',
        intro:
          'Structure a video answer in four parts: say the answer in the first seconds, show it on the '
          + 'real vehicle or in your store, recap it in one sentence, and point viewers to the page on '
          + 'your website with the details. Keep each one as short as the answer allows.',
        steps: [
          {
            title: 'Say the answer first',
            body:
              'Open with the question and the answer in one or two sentences, spoken by someone from '
              + 'your store. A viewer who stops watching after ten seconds should still leave with the '
              + 'answer.',
          },
          {
            title: 'Show it',
            body:
              'Film the proof on a real vehicle or in the real place: the third row folding, the '
              + 'appraisal lane, the service drive. [Google '
              + 'describes](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
              + 'a first-hand review as offering a unique perspective based on personal experience, '
              + 'and footage from your own store is exactly that.',
          },
          {
            title: 'Recap it',
            body: 'Say the answer again in one sentence at the end, for viewers who skipped ahead.',
          },
          {
            title: 'Point to the page',
            body:
              'Tell viewers where the full answer lives on your website, and put that link at the top '
              + 'of the description.',
          },
          {
            title: 'Title it as the question',
            body:
              'Use the buyer’s own words for the title, add a chapter for each part, and upload a '
              + 'checked transcript before you publish.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'transcripts-titles-and-chapters',
        q: 'Why do transcripts, titles and chapters matter?',
        a: [
          'Transcripts, titles and chapters matter because they turn what is said in a video into text '
          + 'that search engines and AI assistants can read. [Bing’s webmaster '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say images '
          + 'and video should reinforce a page’s text, never be the only source of key information, and '
          + 'carry descriptive names plus captions, transcripts or structured data.',
          'Treat the words around the video as part of the answer. Title it with the buyer’s question. '
          + 'Open the description with the answer in one or two sentences, then add chapters for each '
          + 'step so a viewer can jump to the part they need. Give the file a descriptive name before '
          + 'you upload it, as [Bing '
          + 'recommends](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a). Upload a transcript or check the automatic captions line '
          + 'by line, because automatic captions can mangle model names, trim levels and your store’s '
          + 'name.',
          'Use your dealership’s real name on the channel, spelled exactly as it appears on your '
          + 'Business Profile and website. [The same Bing '
          + 'guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say clear, '
          + 'consistent naming of '
          + 'organizations and locations improves citation accuracy, and a channel with a clever '
          + 'nickname makes the connection harder.',
        ],
      },
      {
        type: 'qa',
        id: 'embed-video-answers-on-your-website',
        q: 'Should the video live on your website too?',
        a: [
          'Yes. Embed each video answer on the matching page of your own website, with the transcript '
          + 'or a written summary as text on the page. [Bing '
          + 'says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) video should '
          + 'reinforce the text, so the '
          + 'page carries the answer in words and the video adds the proof, and buyers who find either '
          + 'one reach the other.',
          'The natural home is one of your [answer pages](@answer-pages-for-car-dealerships): the question as the heading, the direct '
          + 'answer in text, the video below it, and the full transcript or a written summary after '
          + 'that. A buyer who finds the page gets the answer in words; a buyer who finds the video on '
          + 'YouTube gets a link back to the page with the details.',
          'Ask your website vendor to add structured data for the embedded video where your platform '
          + 'supports it; [Bing '
          + 'lists](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) structured data '
          + 'alongside captions and transcripts as a way to '
          + 'make media understandable. Keep the page and the video saying the same thing, and update '
          + 'both when the answer changes.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-generated-or-altered-video',
        q: 'What about AI-generated or altered video?',
        a: [
          'Keep dealer video real. Film your own staff, your own cars and your own store, label any '
          + 'realistic altered or synthetic footage the way YouTube asks, and never show an '
          + 'AI-generated person as an employee or a customer. A video answer earns trust because it is '
          + 'first-hand, and a synthetic presenter spends that trust.',
          'That is how AutoLander handles video answers on its Market Leader plan: 2 video answers a '
          + 'month for your YouTube channel, made from your own footage and photos and posted only after '
          + 'you approve them. Realistic altered or synthetic content is disclosed under YouTube’s '
          + 'rules, and no AI-generated person is ever shown as your staff or a customer. There is no '
          + 'shoot at your store; the videos use footage and photos you already have.',
          'The same honesty applies to what a video claims. A video answer should never promise a '
          + 'price, a payment or an approval, and any figure it shows should match the page it points to.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        intro: 'Checked September 30, 2026.',
        items: [
          '[Pew Research Center: Google users are less likely to click on links when an AI summary '
          + 'appears](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/), '
          + 'July 22, 2025.',
          '[Google: AI in Search is driving more queries and higher quality '
          + 'clicks](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/), '
          + 'August 6, 2025.',
          '[Google Search Central: guide to generative AI '
          + 'search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).',
          '[Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).',
        ],
      },
    ],
    faq: [
      ['Do YouTube videos show up in Google AI Overviews?',
        'They can. [Pew Research '
        + 'Center](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) '
        + 'found Wikipedia, YouTube and Reddit together made up 15% of sources cited in Google’s AI '
        + 'summaries in its March 2025 data. No one can promise a given video will be cited, and our '
        + 'free scan checks ChatGPT and Claude only, so it does not measure Google AI Overviews.'],
      ['How long should a dealership video answer be?',
        'As long as the answer needs and no longer. Say the answer in the first seconds, show it, '
        + 'recap it and point to the page. A simple question may take a minute or two; a feature '
        + 'walkthrough may need more. Use chapters so viewers can jump to the part they need.'],
      ['Does a dealership need a professional video crew?',
        'No. A steady phone, clean audio and someone who knows the answer cover most video answers. '
        + '[Google says](https://blog.google/products-and-platforms/products/search/ai-search-driving-more-queries-higher-quality-clicks/) '
        + 'people seek videos with authentic voices and first-hand perspectives. On AutoLander’s Market '
        + 'Leader plan, video answers are made from footage and photos you already have, with no shoot '
        + 'at your store.'],
      ['Can we use an AI-generated presenter in our videos?',
        'We advise against it. Buyers watch a dealer video to see real people and real cars, and an '
        + 'AI-generated person presented as your staff misleads them. If any footage is realistically '
        + 'altered or synthetic, disclose it under YouTube’s rules. AutoLander never shows an '
        + 'AI-generated person as your staff or a customer.'],
    ],
    cta: {
      heading: 'See which sources the assistants cite in your market',
      sub:
        'The free scan asks ChatGPT and Claude, web search on, up to 20 questions a buyer in your town '
        + 'would ask, 3 times each, and lists the sources they cite, videos included. A person checks it '
        + 'and walks you through the 3 fixes in 20 minutes.',
    },
  },
];
