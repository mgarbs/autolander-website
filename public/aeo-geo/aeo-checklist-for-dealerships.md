# AEO checklist for car dealerships: 25 things your internet manager can check this week

> AEO checklist for car dealerships: 25 checks your internet manager can run this week on crawlers, vehicle pages, profiles, reviews and content.

Source: https://autolander.ai/aeo-geo/aeo-checklist-for-dealerships/  
Author: Michael Garber, Co-founder, AutoLander  
Published: November 10, 2026  
Updated: November 10, 2026

**Short answer:** This AEO checklist gives your internet manager 25 yes-or-no checks in five groups: crawler access, vehicle pages, Business Profile and listings, reviews, and content and measurement. None needs a paid tool, and most take a few minutes. Start with crawler access, because a crawler that is shut out of your site brings back nothing an assistant can quote.

## What should an AEO checklist for a dealership cover?

An AEO checklist for a dealership should cover five areas with five checks each: whether AI search crawlers can reach your site, whether vehicle pages show their facts as text, whether your Business Profile and listings agree, whether reviews follow the rules, and whether you publish answers and measure what assistants say.

Every check is a yes or a no, and none needs a paid tool. A browser, your robots.txt file, your CDN or security dashboard, your Business Profile, GA4 and Search Console cover all 25. Mark each one, fix the ones that fail in the order at the end of this page, and run the list again next quarter.

The list covers what your own team can check today. The monthly version of this work, with the raw answers from ChatGPT and Claude every month, is what [AEO and GEO for car dealers](https://autolander.ai/aeo-geo-for-car-dealers/) from AutoLander does, and you can run every check here without us.

## Crawler access: which 5 checks come first?

Crawler access comes first because a page an assistant’s crawler cannot open gives it nothing to quote. Check that robots.txt allows the search crawlers from OpenAI, Anthropic and Perplexity, that your host or CDN lets OpenAI’s published IP addresses through, and that your security service keeps AI search bots allowed.

- Check 1: robots.txt allows OAI-SearchBot. Open yoursite.com/robots.txt and look for a Disallow rule that names OAI-SearchBot or blocks every bot. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) a site must allow OAI-SearchBot to be eligible for ChatGPT search results. Blocking GPTBot, OpenAI’s training crawler, is a [separate choice](https://developers.openai.com/api/docs/bots).
- Check 2: robots.txt allows Claude-SearchBot and Claude-User. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) blocking Claude-SearchBot prevents indexing for search and blocking Claude-User prevents retrieval when Claude users ask questions, and both reduce visibility. ClaudeBot, its training crawler, is a separate choice.
- Check 3: robots.txt allows PerplexityBot. [Perplexity says](https://docs.perplexity.ai/guides/bots) PerplexityBot surfaces and links sites in its search results, respects robots.txt and is not used to crawl content for AI foundation models.
- Check 4: your host or CDN lets OpenAI’s published IP addresses through. OpenAI’s help page names this as the second condition for ChatGPT search eligibility, next to robots.txt. Ask whoever runs your CDN or firewall to confirm it in writing.
- Check 5: your security service keeps AI search bots allowed. [Cloudflare announced](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) that from September 15, 2026, new domains would get defaults that block bots it classifies as Training or Agent on pages that display ads, while Search bots stay allowed. Confirm what your own setting says. Use our guide to [check whether ChatGPT and Claude can read your website](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/) for the step-by-step.

## Vehicle pages: which 5 checks matter?

Vehicle detail pages matter because they carry the facts buyers ask about. Check that price, mileage, VIN and availability show as text when the page loads, that the facts are in the HTML without scripts, that descriptions go beyond year, make and model, that sold units are handled, and that markup matches the page.

- Check 6: price, mileage, VIN and availability are visible on load. Google’s [vehicle ads requirements](https://support.google.com/merchants/answer/15312145) ask for the dealership name and location, price, VIN, mileage for used vehicles and availability, clearly visible without extra clicks such as “More Details.” That is a sound standard for any VDP an assistant reads.
- Check 7: those facts are in the HTML itself. Use your browser’s view-source on one VDP and search for the VIN. [A 2024 analysis by Vercel and MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) found none of the major AI crawlers it measured rendered JavaScript at the time, while Gemini, through Googlebot, did.
- Check 8: descriptions go beyond year, make and model. [Cox Automotive recommends](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) that dealers enrich inventory data with features, packages, fuel economy, safety tech, seating and towing.
- Check 9: sold units are handled. A sold car’s page says sold or points to similar inventory, and dead vehicle URLs get cleaned up. In the same 2024 [Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler), ChatGPT’s crawler spent 34.82% of its fetches on pages that returned 404.
- Check 10: structured data matches the visible page. If your platform adds AutoDealer, Vehicle or Offer markup, the price and mileage in it must match what the page shows. [Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) say markup must accurately reflect visible content, and [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) structured data is not required for generative AI search. Our guide to [VDPs that AI tools can read](https://autolander.ai/aeo-geo/vehicle-detail-page-ai-readable/) covers the fields.

## Business Profile and listings: which 5 checks matter?

Your Business Profile and listings are the public record of who you are, so they need to agree. Check that the profile uses your real-world name without keywords, the most specific categories and car sales hours, that service has its own profile only if it runs as a separate entity, and that name, address and phone match everywhere.

- Check 11: the profile name matches your real-world name. [Google’s guidelines](https://support.google.com/business/answer/3038177) say business names must match the real-world name, with no added service, product or location keywords. Your store’s name alone passes; the name plus “best used cars” and a city fails.
- Check 12: categories are as specific as possible. The same guidelines ask for the most specific category that fits, such as a brand dealer category for a franchise store rather than a generic one.
- Check 13: hours are car sales hours. For dealerships, Google says to list car sales hours, and to use the new-car sales hours if new and pre-owned hours differ.
- Check 14: service has its own profile only if it operates as a distinct entity. Google’s guidelines allow separate profiles for departments with their own entrance and distinct categories; its example is a Service & Parts profile categorized as Auto Repair Shop next to a Toyota Dealer main profile. Brand names should not be combined into one profile. See [how your Business Profile feeds AI answers](https://autolander.ai/aeo-geo/google-business-profile-ai-answers/) for the rest.
- Check 15: name, address and phone match everywhere. Compare your website footer, Business Profile, Bing Places, Apple Business Connect, Facebook Page, DealerRater and marketplace dealer profiles. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) clear entity definition improves grounding visibility and citation accuracy.

## Reviews: which 5 checks matter?

Reviews need five checks: that you actually ask with a link or QR code, that replies go out promptly and read like a person rather than an ad, and that nothing in your process offers incentives, filters out unhappy buyers or gives staff a review quota. Google’s own help pages set these rules.

- Check 16: every sold customer gets a review link or QR code. [Google’s review tips](https://support.google.com/business/answer/3474122) suggest reminding customers to leave reviews through a link or QR code.
- Check 17: replies go out in a timely manner and never read like an ad. The same page asks businesses to reply, address reviewers by name and respond promptly, and says replies should not be promotional.
- Check 18: no incentives. Google [strictly prohibits](https://support.google.com/business/answer/3474122) offering free or discounted goods or services in exchange for reviews, and the [FTC’s rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) bans buying positive or negative reviews.
- Check 19: no review gating. [Google’s Maps content policy](https://support.google.com/contributionpolicy/answer/7400114) bars discouraging negative reviews or selectively asking for positive ones. If your survey sends only happy customers on to Google, turn that step off.
- Check 20: no staff quotas. The same policy says businesses should not ask staff to collect a certain number of reviews, or ask for reviews that name a staff member. Check the pay plan and the sales board.

## Content and measurement: which 5 checks matter?

The last five checks ask whether you publish answers to buyer questions and whether you can see AI in your own numbers: an FAQ and answer pages on your site, the AI Assistant channel in GA4, ChatGPT’s referral tag in your reports, Search Console’s generative AI report, and a fixed question set you ask monthly.

- Check 21: an FAQ page and answer pages exist. Your site answers the questions buyers ask before they visit, such as trade-in steps, financing options and service hours, each in its first sentence, from your own facts. [Cox Automotive recommends](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) that dealers publish content answering shopper questions, including comparisons, trade-in guidance and financing FAQs.
- Check 22: GA4’s AI Assistant channel is in your reports. [Google added](https://support.google.com/analytics/answer/9164320) an AI Assistant channel to GA4’s default channel group, naming ChatGPT, Gemini and Claude as examples. Visits from AI Overviews and AI Mode count as Organic Search under [GA4’s channel definitions](https://support.google.com/analytics/answer/9756891).
- Check 23: utm_source=chatgpt.com shows up. [OpenAI says](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) ChatGPT adds utm_source=chatgpt.com to referral links. Search your GA4 traffic sources for it.
- Check 24: someone read Search Console’s generative AI report this month. [Google says](https://support.google.com/webmasters/answer/16984139) the Generative AI performance report shows impressions from AI Overviews and AI Mode by page, country, date and device, and that it rolled out to all websites as of August 31, 2026.
- Check 25: a fixed set of buyer questions gets asked every month. Write down 10 to 20 questions a local buyer would ask, put each to ChatGPT and Claude several times, and record who gets named and which sources are cited. Keep the questions the same so changes mean something.

## What should you fix first?

Fix in this order: crawler access, vehicle-page text, Business Profile facts, reviews, then content. Each step makes the next one count. An answer page does little if crawlers are blocked, and a perfect profile cannot help much if your vehicle pages hide the price an assistant needs to quote.

1. **Open the doors (checks 1 to 5)** — Fix robots.txt and your security settings first. These are small edits, and [OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt changes take about 24 hours to be reflected for OAI-SearchBot.
2. **Put the facts on the page (checks 6 to 10)** — Send your website vendor one written request covering price, mileage, VIN and availability as HTML text, richer descriptions, sold-unit handling and markup that matches the page. If your site runs on an OEM website program, ask whether the change needs the program’s approval.
3. **Correct the profile (checks 11 to 15)** — Fix the name, categories and hours on your Business Profile, then make every listing match it, starting with Bing Places, Apple Business Connect and DealerRater.
4. **Clean up reviews (checks 16 to 20)** — Remove any incentive, gating or quota from the process, then set a steady ask and a reply routine. The BDC manager or a sales manager can own it.
5. **Publish and measure (checks 21 to 25)** — Start with the questions your fixed question set shows you missing from, answer each on its own page, and watch GA4 and Search Console. If you would rather hand the monthly work to someone, use our guide on [choosing an AEO partner](https://autolander.ai/aeo-geo/how-to-choose-an-aeo-agency/) to vet them.

## Sources

Each check that rests on a platform rule or a study links to it above. Checked September 30, 2026.

- [OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), the [publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) and the [overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots).
- [Anthropic: how Claude’s crawlers work](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) and [Perplexity: bots](https://docs.perplexity.ai/guides/bots).
- [Cloudflare Docs: block AI bots](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) and [Vercel: the rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler) (December 17, 2024).
- [Google Merchant Center: vehicle ads activation](https://support.google.com/merchants/answer/15312145), [Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) and [Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- [Google Business Profile Help: guidelines](https://support.google.com/business/answer/3038177), [review tips](https://support.google.com/business/answer/3474122) and the [Maps user content policy](https://support.google.com/contributionpolicy/answer/7400114); the [FTC final rule on fake reviews](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials).
- [Cox Automotive: how AI is influencing vehicle discovery](https://www.coxautoinc.com/insights/how-ai-is-influencing-vehicle-discovery-and-what-dealers-can-do-about-it/) (August 26, 2026).
- [Google Analytics Help: what’s new](https://support.google.com/analytics/answer/9164320), [default channel group](https://support.google.com/analytics/answer/9756891) and [Search Console Help: Generative AI performance report](https://support.google.com/webmasters/answer/16984139).

## Frequently asked questions

### How long does this AEO checklist take?

Most checks take a few minutes each with a browser and the right logins, so one person can mark all 25 in an afternoon. Fixing the ones that fail takes longer, mostly where your website vendor has to make the change.

### Who at the dealership should run the checklist?

The internet or digital marketing manager is the natural owner, with help from whoever manages your website vendor, your Business Profile and your review process. In a smaller store that may be the GM. The BDC manager is a good owner for the five review checks.

### Do I need paid tools to run an AEO audit?

No. A browser, your robots.txt file, your CDN or security dashboard, your Business Profile, GA4 and Search Console cover all 25 checks. A paid tool can save time on the monthly question set, but Google says no third-party tool has access to its internal ranking or AI systems, so treat any tool’s score as an outside measurement.

### What if my website vendor controls most of these checks?

Then your job is the request. Send one written list of the failing checks, ask for a date on each, and re-check the live site when the vendor reports it done. Crawler access and vehicle-page text often sit with the vendor, so this is a normal conversation to have.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [How to choose an AEO agency for your dealership: 15 questions to ask](https://autolander.ai/aeo-geo/how-to-choose-an-aeo-agency/)
- [AEO red flags: guarantees no one can keep, secret dashboards and AI spam](https://autolander.ai/aeo-geo/aeo-agency-red-flags/)
- [ChatGPT ads for car dealers: how ads differ from being named in the answer](https://autolander.ai/aeo-geo/chatgpt-ads-for-car-dealers/)
- [Can ChatGPT and Claude read your dealership website? A 15-minute check](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/)
- [Should your dealership block AI crawlers? Search bots vs training bots](https://autolander.ai/aeo-geo/should-dealers-block-ai-crawlers/)
- [How to respond to car dealership reviews, with examples](https://autolander.ai/aeo-geo/how-to-respond-to-car-dealership-reviews/)
- [Answer pages for car dealerships: what they are and how to write one](https://autolander.ai/aeo-geo/answer-pages-for-car-dealerships/)
- [How to measure your dealership’s AI visibility: questions, repeat runs and margins](https://autolander.ai/aeo-geo/measure-dealership-ai-visibility/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
