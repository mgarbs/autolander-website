# llms.txt for car dealerships: what it does and what it doesn’t

> What llms.txt is, what Google says about it, whether a car dealership needs one, and what to put in it if you decide to publish one anyway.

Source: https://autolander.ai/aeo-geo/llms-txt-for-car-dealerships/  
Author: Michael Garber, Co-founder, AutoLander  
Published: November 18, 2026  
Updated: November 18, 2026

**Short answer:** llms.txt for car dealerships is optional. It began as a 2024 proposal for a Markdown file that gives AI tools a short guide to a website, and [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) Google Search does not use it and that one will neither help nor harm your visibility there. When we checked in September 2026, we found no official statement from OpenAI, Anthropic, Perplexity or Microsoft committing to use it. Publish one only after crawler access, vehicle page text and your Business Profile are right, and never pay for it as a ranking fix.

## What is llms.txt?

llms.txt is a proposal, first published on September 3, 2024 by Jeremy Howard and hosted by Answer.AI, for a Markdown file at yoursite.com/llms.txt that gives AI agents a curated summary of a website. [The proposal](https://llmstxt.org/) requires only an H1 with the site name, and a short blockquote summary comes next.

The idea is practical. A web page carries menus, scripts, pop-ups and footers, and an AI tool reading it has to dig the useful text out. An llms.txt file hands over a clean list of the pages that matter, in plain Markdown, with a line on what each one covers. The site itself describes llms.txt as a proposal for a standard, and it has not been adopted as one.

For AI search in general, the bigger levers sit elsewhere: [generative engine optimization for dealers](https://autolander.ai/aeo-geo-for-car-dealers/) starts with whether assistants can read your site and trust what it says, and an llms.txt file is a small, cheap addition on top of that work.

## Does Google use llms.txt?

No. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) Google Search does not use llms.txt or similar special AI files, and that creating one for other services is fine but “will neither harm nor help your site’s visibility or rankings in Google Search.” [Google also says](https://developers.google.com/search/docs/appearance/ai-features) you need no new AI text files or special markup for its AI features.

That covers Google AI Overviews and Google AI Mode too, since they are features of Google Search. [Google’s guidance](https://developers.google.com/search/docs/appearance/ai-features) for appearing there is ordinary search work: a page has to be indexed and eligible to show with a snippet. If a vendor tells you llms.txt will lift your Google rankings or get you into AI Overviews, that claim conflicts with Google’s own documentation.

## Do ChatGPT, Claude or Perplexity use llms.txt?

We found no official statement from OpenAI, Anthropic, Perplexity or Microsoft committing to use llms.txt for ranking or citations when we researched this article in September 2026. Some tools and AI agents may read the file, and the proposal is written for them, but none of those companies had published a commitment we could find.

What those companies have documented is how their crawlers work. [OpenAI’s](https://developers.openai.com/api/docs/bots) search crawler is OAI-SearchBot, [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) runs Claude-SearchBot and Claude-User, and [Perplexity](https://docs.perplexity.ai/guides/bots) runs PerplexityBot. Each company says its search crawler respects robots.txt, and each crawler reads ordinary web pages. That is where a dealer’s attention belongs first.

This could change. If one of these companies announces llms.txt support, a correct file becomes more useful, and because it is cheap to publish, having one ready costs little. Until then, treat it as a courtesy to the tools that look for it.

## Should a car dealership publish an llms.txt file?

A car dealership can publish an llms.txt file if it wants, since it is optional and costs little, but it belongs at the bottom of the list. Do it only after AI search crawlers can reach the site, vehicle pages show price, mileage and VIN as text, and your Business Profile facts match your website.

The order matters because each earlier item decides whether anything gets read at all. A perfect llms.txt behind a robots.txt that blocks OAI-SearchBot, or in front of vehicle pages that load their prices by script, does little for a buyer asking ChatGPT about your store. Start with the 15-minute routine to [test whether AI crawlers can read your site](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/).

Then decide on llms.txt with your website vendor. Some dealer website platforms may already generate a file, and a second hand-made one could conflict with it. Ask before anyone uploads anything.

## What would a dealership llms.txt contain?

A dealership llms.txt would contain the store name as a heading, a one-paragraph summary, and short lists of links to the pages a buyer or an AI tool needs most. Every fact in it should match the website word for word, so it never becomes a second, stale version of your store.

1. **Start with one H1 line** — The first line is the store name after a single pound sign, for example “# Your Store Name”. [The proposal](https://llmstxt.org/) requires this line and nothing else, so everything below it is your choice.
2. **Add a short summary** — Next comes a blockquote line starting with >, holding one or two sentences: the brands you sell, new or used or both, the city, and the departments, such as sales, service, parts and finance. Write it as plain fact, the way you would describe the store to a new hire.
3. **List the pages buyers shop from** — Under a heading such as “## Shopping”, add links to new inventory, used inventory, specials and the trade-in page, one per line in Markdown link format, each with a few words on what the page holds.
4. **List the store facts** — Under a heading such as “## Store”, link hours and directions, contact, service scheduling, financing and the FAQ page. These are the pages that answer the practical questions buyers ask before they visit.
5. **Upload it to the site root** — Your vendor places the file at yoursite.com/llms.txt. Open that address afterward to confirm it loads as plain text and that every link works.
6. **Keep it matched to the site** — Put a reminder on the calendar to update the file whenever hours, departments or page addresses change. A file that lists last year’s hours is worse than no file, because it hands a tool a confident wrong answer.

## What matters more than llms.txt for car dealerships?

Four things matter more than llms.txt for a dealership: crawler access, readable vehicle pages, structured data that matches the page, and store facts that agree everywhere. Each one affects whether an assistant can read, understand and trust your store. Fix these first, in this order, and llms.txt becomes a finishing touch.

- Crawler access. Let OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot through robots.txt and the security service in front of the site. Our guide on [which AI crawlers to block and which to allow](https://autolander.ai/aeo-geo/should-dealers-block-ai-crawlers/) has the bot-by-bot table.
- Vehicle page text. Price, mileage and the full VIN belong in the HTML the server sends, so no script has to run first. [Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) warn against hiding critical content behind client-side rendering.
- Structured data that matches the page: AutoDealer or LocalBusiness markup for the store, and Vehicle and Offer markup on vehicle pages, with the same price a buyer sees. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) structured data is not required for its generative AI search, so treat it as a clarity aid. See [structured data for dealer websites](https://autolander.ai/aeo-geo/car-dealership-schema-markup/) for what to include.
- Consistent store facts. Use the same name, address, phone and hours on your website, Google Business Profile, Bing Places, Apple Business Connect, DealerRater and the listing sites. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) clear entity definition improves grounding visibility and citation accuracy.
- Pages that answer real buyer questions, from trade-in steps to service hours, so an assistant has specific text about your store to work with.

## Should you pay for an llms.txt service?

Treat a paid llms.txt service sold as a ranking fix as a red flag. Google says the file will neither harm nor help visibility in Google Search, and [it warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) site owners to be wary of third-party tools claiming ranking success, noting that no third-party tool has access to its internal ranking or AI systems.

An internet manager can write a dealership llms.txt with the steps above in a short sitting, and your website vendor can upload it. If someone quotes a monthly fee for llms.txt alone, ask what it changes that you can measure. A good answer names specific tools that read the file. A weak answer mentions Google rankings or AI Overviews.

The same test applies to any AI search vendor: the pitch should match what Google, OpenAI and Anthropic actually document. Our list of [warning signs in AEO pitches](https://autolander.ai/aeo-geo/aeo-agency-red-flags/) covers the other promises no one can keep.

## Sources

The claims about llms.txt come from the proposal’s own site and from Google’s published guidance, and the crawler details come from OpenAI, Anthropic, Perplexity and Microsoft Bing. The note about missing statements reflects our research in September 2026, so check again before you decide.

- [llmstxt.org: the llms.txt proposal](https://llmstxt.org/)
- [Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [Anthropic: how Anthropic crawls the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)
- [Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)

## Frequently asked questions

### Is llms.txt an official web standard?

No. It is a proposal, first published in September 2024 by Jeremy Howard and hosted by Answer.AI, and its own site presents it as a proposal for a standard. We found no major search engine or AI company that has announced it as a requirement.

### Will an llms.txt file get my dealership into ChatGPT?

Not on its own, and no one can promise what ChatGPT says. OpenAI’s documented requirement for ChatGPT search is letting OAI-SearchBot crawl your site and letting its published IP addresses through your host or CDN. We found no official OpenAI statement committing to use llms.txt, so get crawler access right first.

### Should llms.txt list every vehicle?

No. Inventory changes daily, and a file that lists last week’s cars hands AI tools stale facts. Point to your inventory page and key store pages instead, and leave hours and addresses out unless someone will update the file with every change.

### Does my dealer website platform create llms.txt for me?

Ask your provider. Platforms differ, and some may generate a file automatically while others leave it to you. Open yoursite.com/llms.txt to see whether one exists, and if it does, read it for wrong or outdated facts before adding anything.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [Can ChatGPT and Claude read your dealership website? A 15-minute check](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/)
- [Cloudflare AI bot blocking on dealer websites: what to allow](https://autolander.ai/aeo-geo/cloudflare-ai-bots-dealer-websites/)
- [Vehicle detail pages AI can read: price, mileage and VIN as text](https://autolander.ai/aeo-geo/vehicle-detail-page-ai-readable/)
- [Should your dealership block AI crawlers? Search bots vs training bots](https://autolander.ai/aeo-geo/should-dealers-block-ai-crawlers/)
- [How Claude finds and cites dealerships in its answers](https://autolander.ai/aeo-geo/how-claude-cites-sources/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
