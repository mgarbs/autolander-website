// AEO and GEO silo, batch 02 (2026-09-30): the website and measurement how-tos.
// Publish numbers 15, 19, 24, 37 and 46 from the 2026-09-30 silo plan:
//   15 search-console-ai-report-dealers   (measurement)
//   19 vehicle-detail-page-ai-readable    (website)
//   24 track-ai-traffic-ga4-dealership    (measurement)
//   37 car-dealership-schema-markup       (website)
//   46 inventory-feeds-ai-shopping        (website)
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Link rules: in-body sibling links use ONLY the publish-aware token [anchor](@slug), and only
// to slugs with a LOWER publish number than the article they sit in (plan inBodyLinks), so
// publishing in order never creates a dead link. Later siblings connect through alsoRelated,
// which the builder renders only once the target is live. Every article links the money page
// /aeo-geo-for-car-dealers/ in body copy with its planned anchor.
// House style: no em or en dashes, no "is not X. It is Y." cadence, no invented numbers.
// Every third-party number or claim comes from the silo fact bank, with its source linked
// inline or in the Sources list. Nothing here promises a ranking, a mention or a placement.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // 15. /aeo-geo/search-console-ai-report-dealers/
  // ---------------------------------------------------------------------------
  {
    slug: 'search-console-ai-report-dealers',
    silo: 'aeoGeo',
    cluster: 'measurement',
    publishOrder: 15,
    anchor: 'Search Console’s generative AI report for dealers: AI Overviews and AI Mode impressions',
    crumb: 'Search Console AI report',
    primaryKeyword: 'search console generative ai report',
    secondaryKeywords: [
      'search console ai mode',
      'ai overviews impressions in search console',
      'generative ai performance report',
      'search console generative ai setting',
    ],
    alsoRelated: [
      'track-ai-traffic-ga4-dealership',
      'google-ai-mode-for-car-dealers',
      'is-seo-dead-for-car-dealers',
      'bing-places-for-car-dealers',
    ],
    augmentKeys: [],
    title: 'Search Console’s Generative AI Report for Car Dealers',
    description:
      'How car dealers read Search Console’s generative AI report: AI Overviews and AI Mode '
      + 'impressions by page, and what the report leaves out.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Search Console’s generative AI report for dealers: reading AI Overviews and AI Mode impressions',
    tldr:
      'The Search Console generative AI report shows how often your dealership’s pages appeared as '
      + 'links in Google AI Overviews and Google AI Mode, and Google says it reached every website '
      + 'worldwide as of Aug 31, 2026. You can slice it by page, country, date and device. Google’s '
      + 'help page lists impressions as its measure and does not list clicks or search terms, and the '
      + 'report covers Google only. Its best use for a dealer is plain: find which pages Google’s AI '
      + 'features already show, then build more pages like them.',
    sections: [
      {
        type: 'qa',
        id: 'what-the-report-shows',
        q: 'What does Search Console’s generative AI report show?',
        a: [
          'Search Console’s generative AI report shows organic impressions your site earned in Google '
          + 'AI Overviews and Google AI Mode, filterable by page, country, date and device. '
          + '[Google’s help page for the report](https://support.google.com/webmasters/answer/16984139) '
          + 'says it excludes Search Labs experiments, groups data by canonical URL and was rolled out '
          + 'to all websites worldwide as of Aug 31, 2026.',
          'An impression here means a link to one of your pages appeared in an AI answer on a searcher’s '
          + 'results page. '
          + 'Picture a franchise store with a busy service drive. A shopper asks Google how often a '
          + 'certain SUV needs its transmission fluid changed, the AI Overview links the store’s service '
          + 'page, and that counts as an impression for that page. Add up the model research, financing '
          + 'and service questions and you get a map of where Google’s AI features already treat your '
          + 'site as a useful source.',
          'Because the report uses canonical URLs, a page that points its canonical tag at another URL '
          + 'reports under that other URL. If your vehicle pages carry tracking parameters or several '
          + 'URL versions, the numbers roll up to whichever address the canonical tag names, so check '
          + 'that before you compare pages.',
          'Why Google links one page and skips another is its own topic, covered in '
          + '[how Google AI Overviews cite dealer pages](@google-ai-overviews-for-car-dealers). This guide sticks '
          + 'to reading the numbers.',
        ],
      },
      {
        type: 'qa',
        id: 'performance-report-difference',
        q: 'How is it different from the regular Performance report?',
        a: [
          'The regular Performance report already counts AI feature traffic, but blends it into your '
          + 'totals. [Google’s AI features documentation](https://developers.google.com/search/docs/appearance/ai-features) '
          + 'says AI Overviews and AI Mode are counted under the Web search type, and '
          + '[Google’s updates log](https://developers.google.com/search/updates) says AI Mode data has '
          + 'counted toward the totals since June 16, 2025. The new report separates the AI impressions.',
          'That separation matters when numbers move. Say a used-car store in a metro area sees total '
          + 'impressions on its financing page jump in one month. Before, nobody could tell whether '
          + 'regular results or an AI answer did it. Now the internet manager can open the generative AI '
          + 'report, filter to that page and see whether the AI share moved with the total.',
          'The Performance report stays the place for search terms and clicks across all of Google '
          + 'Search. Use the two side by side: the Performance report for the whole picture, the '
          + 'generative AI report for the AI slice of it.',
          'Both reports see Google and nothing else. For ChatGPT and Claude, which Search Console never '
          + 'sees, an [AI visibility scan for car dealers](/aeo-geo-for-car-dealers/#scan-form) asks '
          + 'those two assistants directly; the scan does not measure AI Overviews or AI Mode, which is '
          + 'exactly what this report is for.',
        ],
      },
      {
        type: 'bullets',
        id: 'dealer-pages-to-check',
        h2: 'Which dealer pages should you look for in it?',
        intro:
          'Filter the report by page and sort your site into groups: model research and comparison '
          + 'pages, service pages, FAQ and answer pages, vehicle detail pages and the homepage. The '
          + 'useful question is which groups earn AI impressions and which never do, because that shows '
          + 'the kind of page Google’s AI features already link.',
        items: [
          'Model research and comparison pages. If a trim comparison or a “which SUVs have a third row” '
          + 'page earns AI impressions, it is your template. Write the next one the same way: a direct '
          + 'answer first, then the detail.',
          'Service and parts pages. Fixed ops questions such as maintenance intervals, recall '
          + 'appointments and what a brake job includes are natural fits for an AI answer. A service page '
          + 'with impressions shows your service department can be a source for Google’s AI features.',
          'FAQ and answer pages. Financing, trade-in and what-to-bring pages each exist to answer one '
          + 'question. If one shows nothing after a few months, check whether the answer sits in the '
          + 'first sentence or three paragraphs down.',
          'Vehicle detail pages. VDPs come and go with the inventory, so read them as a group. '
          + 'Impressions on the VDP of a car you sold weeks ago mean the page is still live and still '
          + 'read, which is a sold-car handling problem to fix.',
          'The homepage and about page. Questions about the store itself, such as hours, location and '
          + 'the brands you sell, should land here. Make sure those facts match your Google Business '
          + 'Profile word for word.',
          'Pages with no AI impressions at all. Put one next to a page that earns them and look for the '
          + 'differences in structure: a clear question, a direct answer, facts written as text.',
        ],
      },
      {
        type: 'qa',
        id: 'no-data',
        q: 'Why might your site show no data?',
        a: [
          'Your site may show no data for two reasons. Google’s help page says the report needs enough '
          + 'impressions to show data, so a smaller store may see an empty chart at first. And [Google’s guide to its generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says a site must be included in Search generative AI features in Search Console to be '
          + 'eligible for them.',
          'That setting is on by default for every property, according to '
          + '[Google’s help page for the control](https://support.google.com/webmasters/answer/16908024), '
          + 'so no opt-in is needed. It is still worth a look if an agency or a past website vendor had '
          + 'owner access to your Search Console, because an exclusion someone else set would keep the '
          + 'report empty.',
          'Two more checks. Make sure you are in the property for the host name your pages actually '
          + 'live on; if your inventory is served from a different host name than the main site, it '
          + 'needs to be covered by the property you are reading. And remember that data rolls up to '
          + 'canonical URLs, so a page that names another URL as canonical will look empty on its own.',
        ],
      },
      {
        type: 'qa',
        id: 'generative-ai-setting',
        q: 'What is the Search generative AI setting, and should you change it?',
        a: [
          'The Search generative AI setting is a Search Console control, on by default for every '
          + 'property, that decides whether your site is eligible for Google’s generative AI features. '
          + 'Excluding removes your links and content from AI Overviews, AI Mode and generative AI '
          + 'features in Discover. Google says exclusion generally takes a few days and does not affect AI '
          + 'training.',
          'Most dealers should leave it on. Buyers ask Google about trims, financing, trade-ins and '
          + 'service, and excluding your site takes your pages out of those answers while every other '
          + 'store in town stays in them. Few dealership situations make that trade worth it.',
          'Note what the setting leaves alone. Since it does not affect AI training, it is the wrong '
          + 'tool for a store that wants its content kept out of model training. That choice lives in '
          + 'robots.txt and in the security service in front of your site, and it is separate from '
          + 'whether Google’s AI features may link you.',
          'Google says the control was rolled out to all websites worldwide as of Aug 31, 2026, the '
          + 'same date it gives for the report.',
        ],
      },
      {
        type: 'table',
        id: 'reports-side-by-side',
        h2: 'How do you use the Search Console generative AI report alongside GA4 and Bing?',
        intro:
          'Give each free report its own question. Search Console’s generative AI report shows how '
          + 'often Google’s AI features showed your pages. GA4’s AI Assistant channel shows visits that '
          + 'came from chat assistants. Bing Webmaster Tools’ AI Performance report, a public preview '
          + 'since February 2026, shows when Microsoft Copilot and Bing’s AI summaries cited your site.',
        head: ['Tool', 'What it tells a dealer', 'What it leaves out'],
        rows: [
          ['Search Console generative AI report', 'Impressions your pages earned in Google AI Overviews and Google AI Mode, by page, country, date and device', 'Clicks, search terms and every assistant outside Google'],
          ['GA4 AI Assistant channel', 'Sessions from recognized AI assistants such as ChatGPT, Gemini and Claude, marked with the medium ai-assistant', 'Visits from AI Overviews and AI Mode, which GA4 counts as Organic Search, and answers that named you without a click'],
          ['Bing Webmaster Tools AI Performance', 'Citations of your site across Microsoft Copilot, AI-generated summaries in Bing and select partner integrations, with grounding queries and page-level counts', 'Google, ChatGPT and Claude'],
          ['Asking the assistants yourself', 'Whether ChatGPT and Claude name your store for local buyer questions, and which sources they cite', 'Any assistant you don’t ask'],
        ],
        note:
          'Report descriptions from Google Search Console Help, Google Analytics Help and the Bing '
          + 'Webmaster Blog, read September 30, 2026. Google and Microsoft rename menus and reports from '
          + 'time to time.',
      },
      {
        type: 'bullets',
        id: 'what-the-report-leaves-out',
        h2: 'What does the report not show?',
        intro:
          'It shows Google AI impressions and little else. Google’s help page lists impressions as the '
          + 'measure and page, country, date and device as the filters, so read it as a count of how '
          + 'often Google’s AI features showed your links. It says nothing about clicks, search terms or '
          + 'any assistant outside Google.',
        items: [
          'Clicks. The help page lists impressions as the report’s metric. For visits, use GA4 and the '
          + 'regular Performance report.',
          'Search terms. No query filter is listed, so you can’t see which questions produced an AI '
          + 'Overview that linked you.',
          'Search Labs experiments, which Google leaves out of the report.',
          'Mentions without a link. The report counts your pages, so an AI answer that names your store '
          + 'without linking your site leaves it nothing to count.',
          'ChatGPT, Claude, Perplexity and Microsoft Copilot. None of them report into Search Console. '
          + 'GA4 catches some of their visits, Bing’s AI Performance report covers Copilot citations, '
          + 'and the rest takes asking the assistants.',
          'For a method that covers all of these, see [how to measure AI visibility](@measure-dealership-ai-visibility): '
          + 'repeated questions to the assistants on one side, these traffic reports on the other.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Google Search Console Help: Generative AI performance report](https://support.google.com/webmasters/answer/16984139)',
          '[Google Search Console Help: the Search generative AI control](https://support.google.com/webmasters/answer/16908024)',
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[Google Search Central: documentation updates log (AI Mode in Performance totals, June 16, 2025)](https://developers.google.com/search/updates)',
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Analytics Help: What’s new (AI Assistant channel)](https://support.google.com/analytics/answer/9164320)',
          '[Google Analytics Help: default channel group definitions](https://support.google.com/analytics/answer/9756891)',
          '[OpenAI Help Center: publishers and developers FAQ (utm_source=chatgpt.com)](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)',
          '[Bing Webmaster Blog: AI Performance in Bing Webmaster Tools, February 10, 2026](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)',
        ],
      },
    ],
    faq: [
      ['Does the report show which searches triggered an AI Overview?',
        'No. Google’s help page lists page, country, date and device as the ways to filter it, and no search-term view. The regular Performance report has search terms, but Google counts AI Overviews and AI Mode inside its Web totals there, so you can’t split AI results from regular ones by search term.'],
      ['Do I need to opt in to see the generative AI report?',
        'No. Google says the Search generative AI setting is on by default for every property, and that the report rolled out to all websites as of Aug 31, 2026. If yours is empty, the likely causes are too few AI impressions so far or a setting someone changed to exclude the site.'],
      ['Does Search Console show ChatGPT visibility?',
        'No. Search Console covers Google Search only. GA4’s AI Assistant channel shows visits that came from ChatGPT and other assistants, and OpenAI says ChatGPT adds utm_source=chatgpt.com to the links it sends. To see whether ChatGPT names your store when nobody clicks, you have to ask it, which our free scan does for ChatGPT and Claude.'],
      ['Why can’t I see the generative AI report for my site?',
        'Check three things: that you are in the property for the host name your pages live on, that the Search generative AI setting has not been switched to exclude, and that your site has enough AI impressions for Google to show data. Google’s help page says the report needs enough impressions to show anything.'],
    ],
    cta: {
      heading: 'See what ChatGPT and Claude say about your store',
      sub: 'Search Console covers Google’s AI features, which our free scan does not measure. The scan asks ChatGPT and Claude, web search on, up to 20 questions local buyers ask, 3 times each, and a person walks you through the answers and the 3 fixes in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // 19. /aeo-geo/vehicle-detail-page-ai-readable/
  // ---------------------------------------------------------------------------
  {
    slug: 'vehicle-detail-page-ai-readable',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 19,
    anchor: 'Vehicle detail pages AI can read: price, mileage and VIN as text',
    crumb: 'VDPs AI can read',
    primaryKeyword: 'vehicle detail page seo',
    secondaryKeywords: [
      'vdp seo',
      'vdp best practices',
      'vehicle descriptions for search',
      'window sticker text',
      'javascript-only vdps',
    ],
    alsoRelated: [
      'car-dealership-schema-markup',
      'inventory-feeds-ai-shopping',
      'model-comparison-pages-for-dealers',
      'rv-dealer-ai-search',
      'dealer-website-provider-ai-search',
    ],
    augmentKeys: [],
    title: 'Vehicle Detail Pages AI Can Read: Price, Miles and VIN',
    description:
      'How to make vehicle detail pages that AI tools and search engines can read: price, mileage, '
      + 'VIN and features as text, not locked in images or scripts.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Vehicle detail pages AI can read: price, mileage, VIN and features as page text',
    tldr:
      'Vehicle detail page SEO now has a second reader: AI assistants that search the web and quote '
      + 'what they find. A vehicle detail page is readable to them when the price, mileage, VIN, '
      + 'availability and the store’s name and location sit on the page as plain text the moment it '
      + 'loads, rather than inside photos, window-sticker images or scripts that run later. Google’s '
      + 'vehicle ads rules make a good checklist, and most fixes are template and feed settings your '
      + 'website vendor can change without building a new site.',
    sections: [
      {
        type: 'qa',
        id: 'what-makes-a-vdp-readable',
        q: 'What makes a vehicle detail page readable to AI?',
        a: [
          'A vehicle detail page is readable to AI when the facts a buyer asks about are in the page '
          + 'text as soon as it loads: price, mileage, VIN, trim, features, availability and where '
          + 'the car sits. [Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'say pages are more likely to be selected for grounding and citations when “important '
          + 'information is visible on the URL itself.”',
          'The same guidelines warn against hiding critical content behind client-side rendering, '
          + 'because content that can’t be rendered reliably may not be indexed or picked to ground an '
          + 'answer. On a dealer site, the critical content is the handful of facts a shopper checks '
          + 'before calling: the price, the miles, the trim and whether the car is still on the lot.',
          'Buyers bring exactly those questions to assistants. '
          + '[Cox Automotive wrote in August 2026](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'that shoppers now often start with a question to an AI tool instead of a marketplace or '
          + 'dealer site, and our guide on [how car buyers use ChatGPT](@how-car-buyers-use-chatgpt) '
          + 'covers what they ask. When an assistant opens your VDP to answer, it can only use what it '
          + 'can read.',
          'That makes the vehicle page the most practical part of '
          + '[AEO for car dealerships](/aeo-geo-for-car-dealers/): no new content to write, just the '
          + 'facts you already have, made readable.',
        ],
      },
      {
        type: 'table',
        id: 'vdp-facts-as-text',
        h2: 'Which facts must be on every vehicle page as text?',
        intro:
          'Use Google’s vehicle ads landing-page rules as the bar. Google requires the dealership name '
          + 'and location, the price, MSRP for new vehicles, the VIN, mileage for used vehicles and '
          + 'availability, clearly visible when the page loads with no extra clicks. A page that clears '
          + 'that bar gives any assistant the facts buyers ask about.',
        head: ['Fact', 'Show it as', 'Matching schema.org property'],
        rows: [
          ['Dealership name and location', 'Store name, street address and city in the page text, near the price', 'seller on the Offer, pointing to your AutoDealer'],
          ['Price', 'The selling price as a number, never “call for price” or “click for price”', 'price and priceCurrency on the Offer'],
          ['MSRP (new vehicles)', 'A labeled line next to the selling price', 'Keep it as labeled page text'],
          ['VIN', 'The full VIN as text, not only inside an image or a PDF', 'vehicleIdentificationNumber'],
          ['Mileage (used vehicles)', 'The odometer reading as text, with the unit', 'mileageFromOdometer'],
          ['Availability', 'In stock, in transit or sold, in words', 'availability on the Offer'],
          ['Trim, engine, drivetrain and colors', 'A plain spec block under the photos', 'vehicleConfiguration, vehicleEngine, driveWheelConfiguration, color, vehicleInteriorColor'],
        ],
        note:
          'Required facts from Google’s vehicle ads activation page. Property names from schema.org’s '
          + 'Vehicle and Offer types. Both checked September 30, 2026.',
      },
      {
        type: 'qa',
        id: 'photos-and-window-stickers',
        q: 'Why do photos and window stickers need a text version?',
        a: [
          'Photos and window stickers need a text version because an image can hide the facts. '
          + '[Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say '
          + 'images and video should reinforce a page’s text rather than be the only source of key '
          + 'information. A window sticker posted only as an image keeps its packages away from anything '
          + 'that reads text.',
          'Picture a franchise store that uploads the window sticker as a photo for every new truck. '
          + 'The sticker lists the technology package, the tow package and the upgraded audio, and none '
          + 'of it exists as text anywhere on the page. A buyer asks an assistant which nearby trucks '
          + 'have the tow package, and your truck has no words on the page to match. Type the packages '
          + 'into the spec block and keep the sticker image as proof.',
          'The same goes for a price stamped on the first photo, a reconditioning checklist shared as a '
          + 'scan and a history-report button that opens another site. Keep the image or the button, '
          + 'and put the facts it carries on the page as text.',
          'Bing also asks for descriptive file names, alt text, and captions, transcripts or structured '
          + 'data on images and video. For alt text, describe the car in the photo: “2022 midsize SUV, '
          + 'front three-quarter view, dark gray” tells a reader something, and “IMG_4432” tells nobody '
          + 'anything.',
        ],
      },
      {
        type: 'qa',
        id: 'javascript-prices',
        q: 'Do AI crawlers see prices loaded by JavaScript?',
        a: [
          'AI crawlers can miss prices loaded by JavaScript. A '
          + '2024 analysis by [Vercel and MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) of '
          + 'traffic on Vercel’s network found none of the major AI crawlers rendered JavaScript at the '
          + 'time, including OpenAI’s and Anthropic’s, while Google’s crawler, which Gemini uses, and '
          + 'Applebot did.',
          'Treat that as vendor data from December 2024: crawlers change, and the study measured one '
          + 'network. The safe rule still follows from it, and Vercel recommended the same thing: put '
          + 'the price, the mileage and the VIN in the HTML your server sends, before any script runs. '
          + '[Google’s own guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says Google can process JavaScript as long as it isn’t blocked, and adds that SEO on '
          + 'JavaScript-framework sites is generally more complex.',
          'A quick test any internet manager can run: open a vehicle page, view the page source rather '
          + 'than the rendered page, and search for the VIN and the price. If they aren’t in the source, '
          + 'a script adds them later, and a crawler that doesn’t run scripts sees a vehicle page with no '
          + 'price on it.',
          'Crawler access comes first, though. If your robots.txt or your security service turns AI '
          + 'crawlers away, the page text never gets read. Here is how to '
          + '[check whether ChatGPT and Claude can read your website](@can-chatgpt-see-my-dealer-website).',
        ],
      },
      {
        type: 'bullets',
        id: 'vehicle-description',
        h2: 'What should the vehicle description say?',
        intro:
          'The vehicle description should answer what a buyer would ask about this exact car. Cox '
          + 'Automotive recommends going beyond year, make and model to features, packages, fuel economy, '
          + 'safety tech, seating and towing. Then add what only your store knows: what reconditioning '
          + 'found, what was replaced and who the car suits.',
        items: [
          'Packages and options by name, typed from the window sticker, so “technology package” and '
          + '“tow package” exist as words on the page.',
          'Fuel economy, seating and towing capacity wherever they apply, because those are the '
          + 'comparisons buyers make between two cars.',
          'Safety and driver-assist features by their plain names: blind-spot monitoring, adaptive '
          + 'cruise control, lane keeping.',
          'First-hand notes from your shop. '
          + '[Google’s guide to its AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says unique, non-commodity content will likely matter more than any other suggestion it '
          + 'makes, and holds up first-hand experience as the model. “New front pads and rotors at '
          + 'reconditioning, both keys, owner’s manual in the glovebox” is a sentence no other page on '
          + 'the web can write.',
          'History facts you can back up, such as the number of previous owners and service records on '
          + 'file, when your history report supports them.',
          'No boilerplate. The same paragraph of financing copy on every page tells a buyer nothing about '
          + 'this car.',
          'Longer questions, such as which trim tows more or what a certified pre-owned warranty covers, '
          + 'belong on [answer pages for car dealerships](@answer-pages-for-car-dealerships), linked from '
          + 'the vehicle page.',
        ],
      },
      {
        type: 'qa',
        id: 'sold-car-pages',
        q: 'What happens to sold cars’ pages?',
        a: [
          'Sold cars’ pages cause trouble when they stay up with old facts. '
          + '[Microsoft researchers wrote in May 2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'that freshness is critical for AI answers, because stale facts lead to misleading '
          + 'responses. A sold car still marked available can send a buyer to your store for a vehicle '
          + 'that left last week.',
          'Dead pages cost something too. The same '
          + '[2024 Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler) found ChatGPT’s '
          + 'crawler spent 34.82% of its fetches and Claude’s crawler 34.16% on 404 pages, against 8.22% '
          + 'for Googlebot. A dealer site, with cars arriving and selling every week, produces a steady '
          + 'supply of URLs that stop working.',
          'Pick one rule for sold units and put it in the template. Either keep the page up briefly with '
          + 'a clear sold notice and links to similar cars, or redirect it to the closest matching '
          + 'inventory results, and take the URL out of your sitemap either way. '
          + '[Bing asks site owners](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'to use IndexNow when URLs are added, updated or removed, saying timely notice reduces '
          + 'outdated or incorrect URL references in Microsoft Copilot responses.',
        ],
      },
      {
        type: 'qa',
        id: 'price-must-match',
        q: 'Does the price have to match everywhere?',
        a: [
          'For Google vehicle ads, the price has to match exactly. '
          + '[Google’s vehicle ads policy](https://support.google.com/merchants/answer/11544533) says the '
          + 'price in your data source and structured data must match the price on your landing page, '
          + 'and mileage must be accurate on both. Treat that as the rule for every channel, because '
          + 'a buyer who finds two prices for one car trusts neither.',
          'Mismatches come from two places: timing and fine print. The website updates when the DMS '
          + 'changes, a marketplace feed runs overnight, and for a few hours the same car carries two '
          + 'prices. Or the page shows a price after rebates that only some buyers qualify for, while the '
          + 'feed carries the price before them. Decide which number is the advertised price, use it '
          + 'everywhere, and state any conditions in words right next to it.',
        ],
      },
      {
        type: 'bullets',
        id: 'vdp-fixes-without-new-site',
        h2: 'What can a dealer change for vehicle detail page SEO without a new website?',
        intro:
          'Most of the work is template and feed settings your website vendor can change once for every '
          + 'car on the lot: a text spec block, a real price in the page source, a dealer comments '
          + 'template, a sold-car rule and a complete feed. None of it needs a redesign, and each fix '
          + 'reaches every VDP at once.',
        items: [
          'A text spec block under the photos: price, mileage, VIN, stock number, trim, engine, '
          + 'drivetrain, colors and availability.',
          'The price, mileage and VIN in the HTML your server sends, instead of added later by a script.',
          'A dealer comments template your used-car manager fills in: two lines on reconditioning, one on '
          + 'who the car suits, one on anything a buyer should know before the test drive.',
          'Window sticker packages typed into text for every new car, with the sticker image kept as '
          + 'proof.',
          'One sold-car rule, applied by the template the day a car sells, plus an IndexNow notice and a '
          + 'sitemap update.',
          'A complete inventory feed. The fields your feed carries become the fields your page can show, '
          + 'so a feed without packages or fuel economy produces pages without them.',
          'A monthly spot check: open five vehicle pages, view the source and confirm the price, mileage '
          + 'and VIN are there as text.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Bing Webmaster Guidelines (visible facts, client-side rendering, images, IndexNow)](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Google Merchant Center Help: vehicle ads activation](https://support.google.com/merchants/answer/15312145)',
          '[Google Merchant Center Help: vehicle ads policies](https://support.google.com/merchants/answer/11544533)',
          '[Vercel: The rise of the AI crawler, December 17, 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)',
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Cox Automotive: how AI is influencing vehicle discovery, August 26, 2026](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/)',
          '[Microsoft Bing Search Blog: the evolving role of the index, May 6, 2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)',
          '[schema.org: Vehicle](https://schema.org/Vehicle)',
          '[schema.org: Offer](https://schema.org/Offer)',
        ],
      },
    ],
    faq: [
      ['Should vehicle pages show the full VIN?',
        'Yes. Google’s vehicle ads rules list the VIN among the facts a landing page must show, and schema.org has a vehicleIdentificationNumber property for it. Some stores show only part of the VIN to slow down scrapers, but a partial VIN also stops a buyer or an assistant from confirming which car the page describes.'],
      ['Do dealer comments help a vehicle page?',
        'When they say something specific, yes. Google’s guide to its AI features puts unique, first-hand content ahead of recycled text. “One owner, new tires at reconditioning, both keys” gives an assistant a fact to quote, and “won’t last long, call today” gives it nothing.'],
      ['What happens if a vehicle page says call for price?',
        'Then there is no price to read. Google’s vehicle ads rules require the price to be visible on load, so a call-for-price page falls short of that bar, and an assistant asked what the car costs has nothing on your page to quote. It may quote a marketplace listing for the same car, or leave the car out.'],
      ['How many vehicle pages does the free scan check?',
        'Up to five. Along with your robots.txt, your homepage and your sitemap when needed, the free scan opens up to five of your vehicle pages and checks whether price, mileage and VIN are on the page as plain text an assistant can read. If your site blocks the check, the block goes in your report as a finding.'],
    ],
    cta: {
      heading: 'Find out if AI can read your vehicle pages',
      sub: 'The free scan opens up to five of your vehicle pages and checks whether price, mileage and VIN are readable text, then asks ChatGPT and Claude up to 20 local buyer questions. A person walks you through the 3 fixes in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // 24. /aeo-geo/track-ai-traffic-ga4-dealership/
  // ---------------------------------------------------------------------------
  {
    slug: 'track-ai-traffic-ga4-dealership',
    silo: 'aeoGeo',
    cluster: 'measurement',
    publishOrder: 24,
    anchor: 'How to track ChatGPT and AI assistant traffic to your dealership website in GA4',
    crumb: 'AI traffic in GA4',
    primaryKeyword: 'track chatgpt traffic ga4',
    secondaryKeywords: [
      'ai assistant channel in ga4',
      'ai referral traffic',
      'utm_source chatgpt.com',
      'perplexity traffic in ga4',
    ],
    alsoRelated: [
      'ai-visibility-score-explained',
      'bing-places-for-car-dealers',
      'perplexity-for-car-dealerships',
      'how-claude-cites-sources',
    ],
    augmentKeys: [],
    title: 'Track ChatGPT and AI Traffic to Your Dealer Site in GA4',
    description:
      'How to track ChatGPT, Gemini, Claude and Copilot visits to your dealership website in GA4, '
      + 'what the AI Assistant channel counts and what it misses.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'How to track ChatGPT and AI assistant traffic to your dealership website in GA4',
    tldr:
      'To track ChatGPT traffic in GA4, open your traffic acquisition report and look for the AI '
      + 'Assistant channel, which Google added to GA4’s default channel group in May 2026 for visits '
      + 'from assistants such as ChatGPT, Gemini and Claude. Two traps are easy to miss: visits from '
      + 'Google AI Overviews and AI Mode land in Organic Search, and assistant visits that arrive with '
      + 'no referrer can land in Direct. GA4 shows the visits; it can’t show the answers where your '
      + 'store was named and nobody clicked.',
    sections: [
      {
        type: 'qa',
        id: 'see-chatgpt-traffic',
        q: 'How do you track ChatGPT traffic in GA4?',
        a: [
          'Track ChatGPT traffic in GA4 through the AI Assistant channel. '
          + '[Google added it to the default channel group](https://support.google.com/analytics/answer/9164320), '
          + 'naming ChatGPT, Gemini and Claude as examples, and sessions from recognized assistants get '
          + 'the medium ai-assistant. [OpenAI says](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) '
          + 'ChatGPT also adds utm_source=chatgpt.com to the links it sends.',
          'In a standard property, the channel shows up in the traffic acquisition report when the '
          + 'primary dimension is the session default channel group. If the AI Assistant row is missing, '
          + 'widen the date range; a channel with no sessions in the range doesn’t appear. For ChatGPT '
          + 'specifically, add session source and look for chatgpt.com, which the tag makes easy to spot.',
          'A visit from ChatGPT means the assistant put a link to your site in front of a shopper and the '
          + 'shopper chose it. Why a store gets linked at all is a separate question, covered in '
          + '[how ChatGPT recommends dealerships](@how-chatgpt-recommends-car-dealerships).',
          'GA4 counts the click. It can’t tell you what ChatGPT said before the click, or whether it '
          + 'named a competitor first; an [AI visibility scan for car dealers](/aeo-geo-for-car-dealers/#scan-form) '
          + 'asks ChatGPT and Claude those questions directly.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-assistant-channel',
        q: 'What does the AI Assistant channel include?',
        a: [
          'The AI Assistant channel includes visits from chat assistants. '
          + '[Google’s channel definitions](https://support.google.com/analytics/answer/9756891) say it '
          + 'covers sources like ChatGPT, Gemini, Deepseek, Copilot or Grok, and that it excludes Google’s '
          + 'AI Overviews and AI Mode. So the channel counts assistants that send a visitor to your site, '
          + 'and leaves Google Search’s own AI answers to another channel.',
          'Perplexity is a special case worth checking. Google’s definition page doesn’t name it among '
          + 'the examples, so look at your own data instead of assuming: add session source to the report, '
          + 'search for perplexity.ai and note which channel your property puts it in. Do the same for '
          + 'any other assistant your buyers mention.',
          'It also pays to scan the Referral channel for assistant domains now and then. If an assistant '
          + 'your shoppers use shows up there, you know to count it with the AI Assistant row in your own '
          + 'reports.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-overviews-visits',
        q: 'Where do AI Overviews visits show up?',
        a: [
          'AI Overviews visits show up in Organic Search. GA4’s channel definitions put Google’s AI '
          + 'Overviews and AI Mode inside Organic Search, together with regular Google results, and keep '
          + 'them out of the AI Assistant channel. GA4’s default channels don’t separate an AI Overview click '
          + 'from a regular Google click, so a dealer needs Search Console for that side.',
          '[Search Console’s generative AI report](@search-console-ai-report-dealers) shows how often your '
          + 'pages appeared in AI Overviews and AI Mode, page by page. It counts impressions, and GA4 '
          + 'counts the visits that followed, so the two together tell the Google story.',
          'A practical habit: once a month, list the pages with the most AI impressions in Search Console, '
          + 'then check those same pages as Organic Search landing pages in GA4. A page that earns AI '
          + 'impressions and leads is worth copying; a page that earns impressions and no leads needs a '
          + 'clearer next step, such as a visible phone number or a link to live inventory.',
        ],
      },
      {
        type: 'qa',
        id: 'ai-visits-in-direct',
        q: 'Why do some AI visits look like Direct traffic?',
        a: [
          'Some AI visits look like Direct traffic because they arrive without a referrer. GA4 files a '
          + 'session under Direct when it has no source information, as with a saved link or a typed '
          + 'address. A buyer who pastes a link from an assistant’s app into a browser, or an app that '
          + 'passes no referrer, can arrive looking like that.',
          'That means the AI Assistant row can undercount. ChatGPT’s utm_source=chatgpt.com tag helps, '
          + 'because the tag travels inside the link itself, so a ChatGPT visit can keep its label even '
          + 'when the referrer is missing.',
          'A useful signal to watch: Direct sessions that land deep in the site, on a single VDP or an '
          + 'answer page, arrived through a link someone had rather than a typed address, since nobody '
          + 'types a VDP URL from memory. A rise in those, with no email or text campaign to explain it, '
          + 'is worth a closer look.',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you build a report for AI visits?',
        intro:
          'Build the report once and save it, so the whole team reads the same numbers each month. The '
          + 'steps use GA4’s standard traffic acquisition and landing page reports with a channel filter. '
          + 'GA4 menu names shift from time to time, so look for the report names rather than exact click '
          + 'paths.',
        steps: [
          {
            title: 'Open traffic acquisition',
            body:
              'In GA4, go to Reports, then Acquisition, then Traffic acquisition. Set the primary '
              + 'dimension to session default channel group and find the AI Assistant row.',
          },
          {
            title: 'Add the source',
            body:
              'Add session source as a secondary dimension so chatgpt.com, gemini.google.com and the '
              + 'others appear as separate rows. Look for perplexity.ai too, and note which channel your '
              + 'property puts it in.',
          },
          {
            title: 'Compare landing pages',
            body:
              'Open the landing page report and filter it to the AI Assistant channel. You want to know '
              + 'where assistants send people: VDPs, model pages, service pages, finance pages or the '
              + 'homepage.',
          },
          {
            title: 'Tie it to key events',
            body:
              'Add the key events your store tracks as columns: lead forms, calls, test-drive requests, '
              + 'finance applications and service appointments. The key event rate shows whether AI '
              + 'visitors act like your other shoppers.',
          },
          {
            title: 'Save it and set a monthly date',
            body:
              'Save the report to your library, then read it on the same day each month next to Search '
              + 'Console’s generative AI report, with the same date range in both.',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'connect-ai-visits',
        h2: 'What should AI visits be connected to?',
        intro:
          'Connect AI visits to the actions that sell cars and fill service bays. A visit count alone '
          + 'says little. The useful number is how many AI Assistant sessions ended in a lead form, a '
          + 'call, a test-drive request, a finance application or a service appointment, compared with '
          + 'the same actions from your other channels.',
        items: [
          'Lead form submits, split by form, so a price-quote request and a general contact form don’t '
          + 'blur together.',
          'Calls, through click-to-call events on mobile or the tracking numbers your call tracking '
          + 'vendor assigns to each channel.',
          'Test-drive and appointment requests, the clearest sign a shopper is close to a visit.',
          'Finance applications, which tell your F&I office where its most serious shoppers came from.',
          'VDP views per session. An AI visitor who opens three VDPs is shopping your inventory; one who '
          + 'reads your hours page is checking the store.',
          'Service scheduling, since fixed ops questions such as recall work and maintenance intervals '
          + 'send buyers to your service pages too.',
          'Your BDC’s notes. When a caller or a chat says “ChatGPT told me about you,” log it; that '
          + 'first-hand line fills a gap no analytics tool covers.',
        ],
      },
      {
        type: 'qa',
        id: 'what-ga4-cannot-tell',
        q: 'What can GA4 not tell you?',
        a: [
          'GA4 can’t tell you when an assistant named your store and nobody clicked. '
          + '[Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) note '
          + 'that content can appear as impressions, citations or grounding references in Copilot without '
          + 'a click, and say “a decline in clicks does not always indicate a loss of visibility.”',
          'It also can’t tell you who else the assistant named, what it said about your prices or '
          + 'reviews, or which sources it cited. A store can be recommended in many chats and see a '
          + 'handful of sessions, or be left out entirely and see the same handful, and GA4 '
          + 'looks the same either way.',
          'That gap is why [how to measure AI visibility](@measure-dealership-ai-visibility) starts with '
          + 'asking the assistants the questions your buyers ask, more than once each, and uses GA4 and '
          + 'Search Console for the traffic side.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Google Analytics Help: What’s new (AI Assistant channel, May 13, 2026)](https://support.google.com/analytics/answer/9164320)',
          '[Google Analytics Help: default channel group definitions](https://support.google.com/analytics/answer/9756891)',
          '[OpenAI Help Center: publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)',
          '[Bing Webmaster Guidelines (visibility without clicks)](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
        ],
      },
    ],
    faq: [
      ['Does GA4 show Perplexity traffic?',
        'GA4 records the visit, but Google’s channel definition page doesn’t name Perplexity among its AI Assistant examples, so check your own property. Add session source to the traffic acquisition report, look for perplexity.ai and note which channel it lands in before you build a report around it.'],
      ['Why is my AI assistant traffic so small?',
        'Assistants answer inside the chat, so a buyer can get a shortlist of stores without clicking any of them. On top of that, assistant visits that arrive with no referrer can count as Direct, and clicks from Google’s AI Overviews count as Organic Search. Read the AI Assistant row as a floor, not the full count.'],
      ['Does ChatGPT tag the links it sends?',
        'Yes. OpenAI says ChatGPT adds utm_source=chatgpt.com to referral URLs, so its visits carry a clear source label in GA4. Filter session source for chatgpt.com to see them.'],
      ['Are AI Overviews clicks counted as AI Assistant traffic in GA4?',
        'No. Google’s GA4 channel definitions put AI Overviews and AI Mode in Organic Search and exclude them from the AI Assistant channel. Use Search Console’s generative AI report to see how often those features showed your pages.'],
    ],
    cta: {
      heading: 'See the answers behind the visits',
      sub: 'GA4 shows who clicked. Our free scan asks ChatGPT and Claude up to 20 questions local buyers ask, 3 times each with web search on, and shows who they name, what they cite and the 3 fixes to make first.',
    },
  },

  // ---------------------------------------------------------------------------
  // 37. /aeo-geo/car-dealership-schema-markup/
  // ---------------------------------------------------------------------------
  {
    slug: 'car-dealership-schema-markup',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 37,
    anchor: 'Schema markup for car dealerships: AutoDealer, Vehicle and Offer',
    crumb: 'Dealership schema',
    primaryKeyword: 'car dealership schema markup',
    secondaryKeywords: [
      'autodealer schema',
      'vehicle schema markup',
      'car schema json-ld',
      'offer schema price',
      'schema markup for ai search',
    ],
    alsoRelated: [
      'inventory-feeds-ai-shopping',
      'llms-txt-for-car-dealerships',
      'dealer-group-ai-visibility',
      'dealer-website-provider-ai-search',
      'powersports-dealer-ai-search',
    ],
    augmentKeys: [],
    title: 'Car Dealership Schema Markup: AutoDealer, Vehicle, Offer',
    description:
      'Schema markup for car dealerships: AutoDealer, Vehicle and Offer properties, what Google '
      + 'retired, and what structured data can and can’t do for AI.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Schema markup for car dealerships: AutoDealer, Car, Vehicle and Offer',
    tldr:
      'Car dealership schema markup comes down to two jobs: AutoDealer markup that describes the '
      + 'store, with departments for sales, service and parts, and Car or Vehicle markup with an Offer '
      + 'on every vehicle detail page, in JSON-LD, the format Google recommends. Keep expectations '
      + 'straight: Google says structured data isn’t required for its AI search features, Google '
      + 'stopped showing vehicle listing rich results in 2025, and Bing says markup may support '
      + 'clearer grounding, does not guarantee visibility and must match what the page shows.',
    sections: [
      {
        type: 'qa',
        id: 'which-schema',
        q: 'What schema markup should a car dealership use?',
        a: [
          'A car dealership should use AutoDealer for the store and Car, a type of Vehicle, with an '
          + 'Offer on each vehicle page. [schema.org places AutoDealer](https://schema.org/AutoDealer) '
          + 'under LocalBusiness and AutomotiveBusiness, and an Offer carries the sale terms: price, '
          + 'currency, availability and condition. Google recommends JSON-LD, though valid Microdata and '
          + 'RDFa work too.',
          'Put the AutoDealer block on the homepage and the contact page, where the store’s name, '
          + 'address, hours and phone already appear. Put a Car block with its Offer on every VDP, and '
          + 'have the Offer’s seller point back to the same AutoDealer so the car and the store connect. '
          + 'On schema.org, [Car sits under Product and Vehicle](https://schema.org/Vehicle), and the Offer '
          + 'names the car as its itemOffered.',
          'Markup only labels what the page already says, so start with '
          + '[vehicle detail pages AI can read](@vehicle-detail-page-ai-readable): price, mileage and '
          + 'VIN as visible text first, markup second.',
        ],
      },
      {
        type: 'qa',
        id: 'schema-required-for-ai',
        q: 'Is schema markup required to show up in AI answers?',
        a: [
          'Schema markup is not required for AI answers. '
          + '[Google’s guide to its generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'says “Structured data isn’t required for generative AI search,” and there is no special '
          + 'schema.org markup to add. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'structured data may support clearer grounding but “does not guarantee visibility or '
          + 'grounding traffic.”',
          'So why bother? [Google says](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) '
          + 'it uses structured data it finds on the web to understand the content of a page, and its AI '
          + 'guide says markup is still worth using where it makes a page eligible for rich results. '
          + 'There is a practical reason too: markup is a second copy of your facts, so when it disagrees '
          + 'with the page, you have found a template bug.',
          'Bing adds the condition that matters most: markup must accurately reflect the visible '
          + 'content. For how Google’s AI answers pick the pages they link, see '
          + '[how Google AI Overviews cite dealer pages](@google-ai-overviews-for-car-dealers).',
          'Structured data is one line on the website fix list in '
          + '[AEO and GEO for car dealers](/aeo-geo-for-car-dealers/), next to AI crawler access and the '
          + 'vehicle-page text it has to match.',
        ],
      },
      {
        type: 'qa',
        id: 'vehicle-listing-rich-results',
        q: 'What happened to Google’s vehicle listing rich results?',
        a: [
          'Google retired vehicle listing rich results. On June 12, 2025, Google said it would phase out '
          + 'several structured data features to simplify its results page, and on Sept 9, 2025 it '
          + 'removed the vehicle listing structured data documentation because the feature no longer '
          + 'appeared in Google Search results. Guides that still sell it as live are out of date.',
          'Accurate vehicle markup can stay, since Google still reads structured data to understand '
          + 'pages. What changed is the payoff: nobody should pay for a setup whose '
          + 'selling point is a rich result Google no longer shows.',
        ],
      },
      {
        type: 'callout',
        title: 'Dated notice, checked September 30, 2026',
        body:
          'Google’s [documentation updates log](https://developers.google.com/search/updates) shows the '
          + 'vehicle listing structured data page removed on Sept 9, 2025, together with course info, '
          + 'estimated salary, learning video and special announcement. If a vendor proposal still offers '
          + 'vehicle listing rich results, ask which current Google page documents them.',
      },
      {
        type: 'bullets',
        id: 'autodealer-markup',
        h2: 'How should AutoDealer markup describe the store?',
        intro:
          'AutoDealer markup should match your Google Business Profile and your contact page, fact for '
          + 'fact. Google’s LocalBusiness guidance requires a name and address, recommends geo, opening '
          + 'hours, telephone, url and department for businesses with distinct departments, and says to '
          + 'use the most specific subtype. For a dealership, that subtype is AutoDealer.',
        items: [
          'name: the store’s name exactly as it appears on your Business Profile and your sign, with no '
          + 'city or keyword added.',
          'address: street, city, state and ZIP, written the same way everywhere the store is listed.',
          'geo: the latitude and longitude of the showroom, so the map pin and the markup agree.',
          'openingHoursSpecification: sales hours here, with service and parts hours in their own '
          + 'departments.',
          'telephone and url: the main number and the homepage.',
          'department: one entry each for sales, service and parts, with their own hours and phone '
          + 'numbers. [schema.org lists AutoRepair and AutoPartsStore](https://schema.org/AutomotiveBusiness) '
          + 'as types under AutomotiveBusiness, which fit a service department and a parts counter.',
          'Keep every value identical to [the Business Profile fields AI answers use](@google-business-profile-ai-answers), '
          + 'so every source a buyer or an assistant checks tells the same story about the store.',
        ],
      },
      {
        type: 'table',
        id: 'vehicle-properties',
        h2: 'Which Vehicle properties belong on a vehicle detail page?',
        intro:
          'Mark up the Vehicle properties that match facts the page already shows. The core set for a '
          + 'dealer is the VIN, mileage, trim, body style, fuel type, transmission, drivetrain, engine and '
          + 'colors, plus previous owners and known damage when your history report supports them. Each '
          + 'value must match the visible field word for word.',
        head: ['schema.org property', 'What it holds', 'Visible field it must match'],
        rows: [
          ['vehicleIdentificationNumber', 'The VIN', 'The full VIN in the spec block'],
          ['mileageFromOdometer', 'The odometer reading and its unit', 'The mileage shown near the price'],
          ['vehicleConfiguration', 'The trim or configuration', 'The trim in the title and spec block'],
          ['bodyType', 'Body style, such as SUV or crew cab pickup', 'The body style in the spec block'],
          ['fuelType', 'Gas, diesel, hybrid or electric', 'The fuel type in the spec block'],
          ['vehicleTransmission', 'Automatic, manual or CVT', 'The transmission in the spec block'],
          ['driveWheelConfiguration', 'FWD, RWD, AWD or 4WD', 'The drivetrain in the spec block'],
          ['vehicleEngine', 'The engine', 'The engine line in the spec block'],
          ['color and vehicleInteriorColor', 'Exterior and interior colors', 'The colors on the page, in the same words'],
          ['numberOfPreviousOwners', 'The owner count', 'The owner count your history report supports'],
          ['knownVehicleDamages', 'Disclosed damage', 'Any damage disclosure on the page'],
        ],
        note:
          'Property names from schema.org’s Vehicle type, checked September 30, 2026. Car is a subtype '
          + 'of Vehicle, so a Car block can use every property above.',
      },
      {
        type: 'qa',
        id: 'offer-price',
        q: 'How should price go in Offer markup?',
        a: [
          'Price goes in an Offer attached to the car, with '
          + '[price, priceCurrency, availability, itemCondition and seller](https://schema.org/Offer), '
          + 'plus priceValidUntil when a price has an end date. The number must match the page: '
          + '[Google’s vehicle ads policy](https://support.google.com/merchants/answer/11544533) requires '
          + 'the price in the feed and in structured data to exactly match the landing page, and Bing '
          + 'requires markup to reflect visible content.',
          'Price mismatches can start in the template, when the markup pulls one price field while the page '
          + 'shows another, such as an internet price in the code and a price after conditional rebates '
          + 'on screen. Pick the advertised price, use it in both places, and describe any conditions in '
          + 'plain text next to it.',
          'Set itemCondition to new or used to match the page, and update availability the day a car '
          + 'sells. schema.org defines priceValidUntil as the date after which the price is no longer '
          + 'available, so use it for a dated special and leave it out for everyday prices.',
        ],
      },
      {
        type: 'qa',
        id: 'star-rating-markup',
        q: 'Should a dealership mark up its own star rating?',
        a: [
          'A dealership should not mark up its own star rating. '
          + '[Google’s LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'limits aggregateRating markup to sites that capture reviews about other local businesses, '
          + 'and a dealer rating itself on its own site falls outside that. Let reviews live where buyers '
          + 'read them, on your Business Profile and review sites, and answer them there.',
          'The same goes for testimonials on your VDPs or homepage. Show them as text if you like, and '
          + 'leave them out of Review markup.',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you check car dealership schema markup against the page?',
        intro:
          'Spot-check three live vehicle pages against their own markup, then fix any mismatch in the '
          + 'template instead of by hand. Pick a new car, a used car and one with a price change this '
          + 'week, because each one exercises a different part of the template: MSRP, mileage and a '
          + 'freshly updated price.',
        steps: [
          {
            title: 'Pick three vehicle pages',
            body:
              'One new car, one used car and one whose price changed in the last few days. Note the '
              + 'price, VIN, mileage, trim, colors and availability shown on each page.',
          },
          {
            title: 'Find the markup',
            body:
              'Open the page source, not the rendered page, and search for application/ld+json. If '
              + 'there is none, look for Microdata attributes. If there is still nothing, your platform '
              + 'may add no vehicle markup at all, which is worth knowing before anything else.',
          },
          {
            title: 'Compare value by value',
            body:
              'Check the price, VIN, mileage, trim, colors and availability in the markup against what '
              + 'you noted. Write down every mismatch, including small ones such as a rounded price or '
              + 'a color named differently.',
          },
          {
            title: 'Fix it at the template',
            body:
              'Hand edits get overwritten on the next inventory update. Send your website vendor the '
              + 'mismatch list and ask for the template to read both the page and the markup from the '
              + 'same field.',
          },
          {
            title: 'Confirm AI crawlers can reach the page',
            body:
              'Markup does nothing on a page AI crawlers can’t open, so '
              + '[check whether ChatGPT and Claude can read your website](@can-chatgpt-see-my-dealer-website) '
              + 'before you polish the code.',
          },
          {
            title: 'Repeat after every platform update',
            body:
              'A template update can change the markup without anyone at the store noticing. Re-run the '
              + 'three-page check after each update and once a month.',
          },
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Bing Webmaster Guidelines (structured data and grounding)](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Google Search Central: introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)',
          '[Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)',
          '[Google Search Central: documentation updates log (vehicle listing removal)](https://developers.google.com/search/updates)',
          '[schema.org: AutoDealer](https://schema.org/AutoDealer)',
          '[schema.org: AutomotiveBusiness](https://schema.org/AutomotiveBusiness)',
          '[schema.org: Vehicle](https://schema.org/Vehicle)',
          '[schema.org: Offer](https://schema.org/Offer)',
          '[Google Merchant Center Help: vehicle ads policies](https://support.google.com/merchants/answer/11544533)',
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
        ],
      },
    ],
    faq: [
      ['Does Google still show vehicle listing rich results?',
        'No. Google removed the vehicle listing structured data documentation on Sept 9, 2025 because the feature no longer appears in Google Search results. Vehicle markup can still help machines read a page, but it no longer produces that rich result.'],
      ['Is JSON-LD better than Microdata for a dealer website?',
        'Google recommends JSON-LD and says Microdata and RDFa are equally fine if valid. JSON-LD sits in one block per template, which makes it easier for a website vendor to keep in sync with the page and easier for you to check.'],
      ['Should the service department have its own markup?',
        'Yes, as a department of your AutoDealer. Google recommends the department property for businesses with distinct departments, and schema.org’s AutoRepair type fits a service department. Give it its own hours and phone number, matching your Business Profile.'],
      ['Will schema markup get my cars into ChatGPT answers?',
        'No one can promise that: Google says structured data isn’t required for its AI search features, Bing says structured data does not guarantee visibility or grounding traffic, and OpenAI says placement in ChatGPT search is not guaranteed. Markup helps a machine read facts your page already shows, and that is its whole job.'],
    ],
    cta: {
      heading: 'Start with whether AI can read the page',
      sub: 'Dealer and vehicle structured data is on every plan’s website fix list wherever your platform doesn’t already add it. The free scan starts one step earlier: it checks whether AI crawlers can reach your site and whether up to five vehicle pages show price, mileage and VIN as readable text.',
    },
  },

  // ---------------------------------------------------------------------------
  // 46. /aeo-geo/inventory-feeds-ai-shopping/
  // ---------------------------------------------------------------------------
  {
    slug: 'inventory-feeds-ai-shopping',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 46,
    anchor: 'Vehicle inventory feeds and AI shopping: what dealers need',
    crumb: 'Inventory feeds and AI',
    primaryKeyword: 'vehicle inventory feed ai',
    secondaryKeywords: [
      'google vehicle ads feed',
      'inventory syndication for dealers',
      'ai shopping for cars',
      'sold vehicle pages',
    ],
    alsoRelated: [
      'dealer-website-provider-ai-search',
      'bing-places-for-car-dealers',
      'model-comparison-pages-for-dealers',
      'rv-dealer-ai-search',
    ],
    augmentKeys: [],
    title: 'Vehicle Inventory Feeds and AI Shopping: What Dealers Need',
    description:
      'How vehicle inventory feeds reach AI shopping answers and Google vehicle ads, why complete and '
      + 'matching data matters, and how to keep sold cars out.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Inventory feeds and AI shopping: getting your cars into the places AI reads',
    tldr:
      'A vehicle inventory feed reaches AI shopping answers by three roads: the feeds you send to '
      + 'Google and marketplaces, the vehicle pages crawlers read on your site, and what other sites say '
      + 'about your cars and store. Microsoft’s advertising team, writing for retailers, says data '
      + 'completeness matters more than cleverness, and Google says Merchant Center and Business '
      + 'Profiles can help products show up in its AI responses. Keep every feed complete, keep prices '
      + 'matched to your pages and get sold cars out fast, knowing no one can promise your cars will '
      + 'show up inside an assistant.',
    sections: [
      {
        type: 'qa',
        id: 'feeds-reach-ai',
        q: 'How do vehicle inventory feeds reach AI answers?',
        a: [
          'Vehicle inventory feeds reach AI answers through feeds, crawled pages and off-site data. '
          + '[Microsoft Advertising’s January 2026 GEO guide](https://about.ads.microsoft.com/en/blog/post/january-2026/from-discovery-to-influence-a-guide-to-geo), '
          + 'written for retailers, frames those as the paths into AI shopping. '
          + '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'Merchant Center and Business Profiles can help products and services show up in its AI '
          + 'responses.',
          'For a dealership, the three roads look like this. The feed is the inventory file your DMS or '
          + 'inventory provider sends to your website, to marketplace sites and, if you run vehicle ads, '
          + 'to Google Merchant Center. The crawled data is your VDPs. The off-site data is everything '
          + 'else a machine can find about the car and the store: marketplace listings, your Business '
          + 'Profile and your reviews.',
          'Take a used-car store in a metro area with a few dozen cars. The same SUV shows up in its '
          + 'website feed, on two marketplace sites and on its own VDP. If all four agree on price, '
          + 'mileage and status, an assistant has one consistent story to repeat. If the marketplace '
          + 'still shows last week’s price, it has two.',
          'Keeping those roads in agreement runs through the monthly work in '
          + '[AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/), from the website fix list to '
          + 'the listings we keep consistent.',
        ],
      },
      {
        type: 'qa',
        id: 'google-vehicle-ads',
        q: 'What are Google vehicle ads, and are they free?',
        a: [
          'Google vehicle ads are a paid, feed-based ad format, and they cost money like any other ad. '
          + '[Google’s Merchant Center help](https://support.google.com/merchants/answer/11189169) says '
          + 'dealers, retailers, aggregators and manufacturers, but not private sellers, can use them to '
          + 'promote their inventory on Google Search, and that the format is fully released in the United '
          + 'States, Australia, Canada and Japan.',
          'This guide covers vehicle ads for their data rules, and those rules are useful even to a store '
          + 'that never buys an ad. Google spells out what a vehicle landing page must show and how '
          + 'closely the feed must match it, which is the same discipline that makes a page readable to an '
          + 'assistant. AutoLander’s AEO and GEO plans include no paid ads of any kind.',
        ],
      },
      {
        type: 'bullets',
        id: 'vehicle-ads-landing-page',
        h2: 'What does a vehicle ads landing page need?',
        intro:
          'Google’s vehicle ads rules list the facts every landing page must show on load, with no extra '
          + 'clicks: the dealership’s name and location, the price, MSRP for new vehicles, the VIN, '
          + 'mileage for used vehicles and availability. Merchant Center also requires the VIN attribute '
          + 'and a linked Google Business Profile.',
        items: [
          'The dealership name and location on the vehicle page itself, near the car’s details.',
          'The vehicle price, visible on load. A “click for price” button fails the no-extra-clicks rule.',
          'MSRP for new vehicles, clearly labeled.',
          'The VIN, as text. [Google Ads help](https://support.google.com/google-ads/answer/14154510) '
          + 'lists the VIN attribute as required, with exceptions only for some European countries, Japan '
          + 'and build-to-order offers.',
          'Mileage for used vehicles, accurate on both the page and the feed.',
          'Availability, so a sold or in-transit unit says so in words.',
          'A linked Google Business Profile, with each vehicle tied to its rooftop through the store_code '
          + 'attribute. That matters most for groups: a car at the north store should never carry the '
          + 'south store’s code.',
          'Keep the profile itself accurate as well; here are '
          + '[the Business Profile fields AI answers use](@google-business-profile-ai-answers).',
        ],
      },
      {
        type: 'qa',
        id: 'feed-price-match',
        q: 'Why must feed prices match the website?',
        a: [
          'Feed prices must match the website because '
          + '[Google’s vehicle ads policy](https://support.google.com/merchants/answer/11544533) says the '
          + 'price in your data source and structured data must exactly match the price on your landing '
          + 'page, and mileage must be accurate on both. A mismatch breaks that policy and leaves a '
          + 'buyer, or an assistant comparing sources, with two prices for one car.',
          'Freshness is the other half. '
          + '[Microsoft researchers wrote in May 2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers) '
          + 'that freshness is critical for AI answers, because stale facts lead to misleading responses. '
          + 'A price that changed on the lot yesterday and in the feed next week is exactly that kind of '
          + 'stale fact.',
          'The usual culprits are timing, rebates and add-ons. One system updates hourly and another '
          + 'overnight; the page shows a price after conditional rebates and the feed shows it before '
          + 'them; an add-on package lands in one price and not the other. Pick one advertised price and '
          + 'carry it everywhere.',
          'The structured data half of that match is covered in '
          + '[schema markup for car dealerships](@car-dealership-schema-markup).',
        ],
      },
      {
        type: 'bullets',
        id: 'complete-feed',
        h2: 'What makes an inventory feed complete?',
        intro:
          'A complete inventory feed carries everything a buyer might ask about the car. Cox Automotive '
          + 'recommends enriching inventory data beyond year, make and model with features, packages, '
          + 'fuel economy, safety tech, seating and towing, and Microsoft’s retail GEO guide says data '
          + 'completeness matters more than cleverness.',
        items: [
          'Identity: VIN, stock number, year, make, model, trim, body style, drivetrain, engine and '
          + 'transmission.',
          'Condition: new, used or certified, the mileage, and the number of owners when your history '
          + 'report supports it.',
          'Price: the same advertised price your VDP shows, plus MSRP for new vehicles.',
          'Features and packages by name, the way the window sticker lists them, plus fuel economy, '
          + 'safety tech, seating and towing capacity where they apply. '
          + '[Cox Automotive’s August 2026 article](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) '
          + 'names exactly these as the data to add beyond year, make and model.',
          'Real photos of the actual car, in the order a buyer would walk around it.',
          'Dealer comments with first-hand notes from reconditioning.',
          'Location: which rooftop has the car, for dealer groups.',
          'Every field in the feed should land on the page as text, which '
          + '[vehicle detail pages AI can read](@vehicle-detail-page-ai-readable) covers in detail.',
        ],
      },
      {
        type: 'qa',
        id: 'sold-cars-in-feeds',
        q: 'What happens when sold cars stay in feeds and pages?',
        a: [
          'Sold cars left in feeds and pages create wrong answers and wasted crawls. A sold car still '
          + 'marked available is the kind of stale fact Microsoft researchers link to misleading AI '
          + 'answers. And a [2024 Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler) '
          + 'found ChatGPT’s crawler spent 34.82% of its fetches and Claude’s 34.16% on 404 pages, against '
          + '8.22% for Googlebot.',
          'The Vercel numbers are vendor data from December 2024, measured on one network, so treat '
          + 'them as a warning sign. The fix is the same either way. Remove a sold car from every feed as '
          + 'soon as the deal is done, update its VDP with a sold notice or a redirect to similar cars, '
          + 'and take the URL out of your sitemap.',
          'Then tell the search engines. '
          + '[Bing asks site owners](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'to use IndexNow when URLs are added, updated or removed, saying timely notice reduces '
          + 'outdated or incorrect URL references in Microsoft Copilot responses.',
        ],
      },
      {
        type: 'qa',
        id: 'cars-inside-chatgpt',
        q: 'Can your cars appear inside ChatGPT or Claude?',
        a: [
          'Your cars can appear inside ChatGPT or Claude when an assistant with web search quotes a dealer '
          + 'page or a marketplace listing, but no one can promise it will. '
          + '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'ChatGPT ranks search results by several factors meant to find relevant, reliable '
          + 'information, and it does not guarantee placement.',
          'AutoLander never promises that your cars will show up inside any assistant. What the plans do '
          + 'is remove the reasons an assistant might skip or misquote them: missing prices, missing '
          + 'VINs, script-only pages and sold units still listed. The monthly report then shows which '
          + 'questions about cars in stock return your inventory, as a separate “cars AI can find” check.',
          'Whether an assistant mentions your store at all, before it gets to any one car, is covered in '
          + '[how ChatGPT recommends dealerships](@how-chatgpt-recommends-car-dealerships).',
        ],
      },
      {
        type: 'qa',
        id: 'autolander-feed',
        q: 'Where does your AutoLander feed fit?',
        a: [
          'If you already use AutoLander, the inventory feed you post from can carry straight into the '
          + 'AEO and GEO work. If you don’t, a CSV, XML or SFTP file from your inventory provider is set up '
          + 'at kickoff. Either way, answer pages and the monthly cars AI can find check come from that '
          + 'live feed.',
          'The same feed already drives AutoLander’s Facebook Marketplace posting, explained on the '
          + '[dealer inventory management](/dealer-inventory-management/) page, so one source keeps your '
          + 'listings and your AI visibility reporting on the same prices and the same sold dates.',
          'Plans, setup and the free scan are laid out on the page for '
          + '[AutoLander’s AEO and GEO service](/aeo-geo-for-car-dealers/). AutoLander customers pay no '
          + 'setup fee once their subscription at that rooftop has been active and paid for the prior 60 '
          + 'days. The free scan itself needs no feed: it may read up to five vehicle pages straight from '
          + 'your site.',
        ],
      },
      {
        type: 'bullets',
        id: 'sources',
        h2: 'Sources',
        items: [
          '[Microsoft Advertising: From discovery to influence, a guide to GEO, January 6, 2026](https://about.ads.microsoft.com/en/blog/post/january-2026/from-discovery-to-influence-a-guide-to-geo)',
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Merchant Center Help: about vehicle ads](https://support.google.com/merchants/answer/11189169)',
          '[Google Merchant Center Help: vehicle ads activation](https://support.google.com/merchants/answer/15312145)',
          '[Google Merchant Center Help: vehicle ads policies](https://support.google.com/merchants/answer/11544533)',
          '[Google Ads Help: vehicle ads requirements (VIN, Business Profile, store_code)](https://support.google.com/google-ads/answer/14154510)',
          '[Google Merchant Center Help: vehicle ads and Business Profile locations](https://support.google.com/merchants/answer/15786784)',
          '[Cox Automotive: how AI is influencing vehicle discovery, August 26, 2026](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/)',
          '[Microsoft Bing Search Blog: the evolving role of the index, May 6, 2026](https://blogs.bing.com/search/May-2026/Evolving-role-of-the-index-From-ranking-pages-to-supporting-answers)',
          '[Vercel: The rise of the AI crawler, December 17, 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)',
          '[Bing Webmaster Guidelines (IndexNow)](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
        ],
      },
    ],
    faq: [
      ['Are Google vehicle ads free?',
        'No. Google’s Merchant Center help describes vehicle ads as a paid, feed-based format for dealers, retailers, aggregators and manufacturers. Their landing-page and price rules are still a useful standard for your vehicle pages, even if you never run them.'],
      ['Do I need a Google Business Profile for vehicle ads?',
        'Yes. Google requires a linked Business Profile for vehicle ads, and each vehicle is tied to its dealership location through the store_code attribute. The VIN attribute is required in Merchant Center as well.'],
      ['How fast should sold cars come off my website?',
        'As fast as your feed can carry the change, ideally the same day. A sold car still marked available is a stale fact, and Microsoft researchers wrote that stale facts lead to misleading AI answers. Update the page, drop it from your sitemap and send an IndexNow notice, which Bing asks for when URLs are removed.'],
      ['Will a better inventory feed get my cars into ChatGPT?',
        'No one can promise that, and OpenAI does not guarantee placement in ChatGPT search. A complete, current feed removes the reasons an assistant might skip or misquote your cars: missing prices, missing VINs and sold units still listed. That is the part a dealer controls.'],
    ],
    cta: {
      heading: 'Check the pages your feed produces',
      sub: 'The free scan checks whether AI can read up to five of the vehicle pages your feed produces, whether AI crawlers can reach your site, and what ChatGPT and Claude say when local buyers ask where to buy.',
    },
  },
];
