# How Claude answers local car-buying questions and which sources it cites

> How Claude searches the web and cites sources, what ClaudeBot, Claude-User and Claude-SearchBot do, and how a dealership stays readable to Claude.

Source: https://autolander.ai/aeo-geo/how-claude-cites-sources/  
Author: Michael Garber, Co-founder, AutoLander  
Published: October 23, 2026  
Updated: October 23, 2026

**Short answer:** How does Claude pick and cite local businesses such as dealerships? When Claude searches the web, [Anthropic says](https://claude.com/blog/web-search) it gives direct citations so users can check the sources behind an answer. For a dealership, becoming one of those sources starts with two of Anthropic’s three bots, Claude-SearchBot and Claude-User, being able to reach your site, and with your store’s facts sitting in plain page text. Anthropic does not document which search index Claude uses, so the parts you control are access and content.

## How does Claude pick and cite sources for local businesses?

Claude picks sources for a local question by searching the web, and it gives direct citations in its answer so users can open the pages and check the facts. [Anthropic launched web search](https://claude.com/blog/web-search) in preview for paid US users on March 20, 2025, and made it available on all Claude plans worldwide with an update on May 27, 2025.

For a car buyer, that means a question such as “Which dealers near me are good for a used truck?” can come back with store names and the pages behind them: dealer websites, review pages, listing sites, local news. Each citation is a page Claude’s search could reach and read, which is the part of the process a dealership can influence.

In outline the mechanics resemble ChatGPT’s, with different bots and different documentation; our guide to [how ChatGPT recommends dealerships](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/) covers OpenAI’s side. Getting a store read, trusted and cited by both is what [generative engine optimization for dealers](https://autolander.ai/aeo-geo-for-car-dealers/) is about.

## Which Anthropic bots visit your website?

Anthropic runs three bots, and each does a different job. ClaudeBot gathers content that may be used to train models, Claude-User fetches pages when a person asks Claude something, and Claude-SearchBot crawls to improve search results. Anthropic says blocking either of the last two reduces a site’s visibility in Claude.

| Bot | What Anthropic says it does | If your site blocks it | Sensible dealer setting |
| --- | --- | --- | --- |
| ClaudeBot | Collects web content that may be used to train Anthropic’s models | Signals that your content should be excluded from future training | Your call; Anthropic ties it to training |
| Claude-User | Fetches pages when Claude users ask questions | Claude cannot retrieve your pages for those questions, which reduces visibility | Allow |
| Claude-SearchBot | Crawls the web to improve search result quality for users | Your pages cannot be indexed for search, which reduces visibility in results | Allow |

_Descriptions paraphrase Anthropic’s Claude Help Center article on its crawlers, dated April 7, 2026._

## What happens if your site blocks Claude-SearchBot or Claude-User?

If your site blocks Claude-SearchBot, [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) your pages cannot be indexed for Claude’s search, and if it blocks Claude-User, Claude cannot fetch them when a user asks. Either block reduces your visibility in Claude’s answers. Blocking ClaudeBot only signals that your content should stay out of future training.

Blocks like these can arrive by accident. A robots.txt written years ago to allow only Googlebot, a security plugin with a single switch for every AI bot, or a CDN bot rule nobody revisited can shut Claude out without anyone at the store deciding to. In an illustrative case, a franchise store whose website vendor added a blanket AI-bot block during a redesign may still carry it long after the reason is forgotten.

A store that wants to stay out of training but stay findable can disallow ClaudeBot and leave Claude-SearchBot and Claude-User allowed. To test your own setup, follow the steps to [check whether AI search bots can open your site](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/).

## Does Claude honor robots.txt?

Yes. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) its bots honor robots.txt directives and support the Crawl-delay extension, which asks a crawler to slow down between requests. It also warns that blocking its bots by IP address may not work correctly, so robots.txt is the reliable way to allow or restrict them.

If your website vendor manages robots.txt for hundreds of dealer sites, ask for the exact lines that apply to ClaudeBot, Claude-User and Claude-SearchBot on your site, in writing. A large inventory site worried about server load can set a Crawl-delay instead of a block.

Also ask what the security layer in front of the site does with automated visitors. Because Anthropic says IP-based blocking may not work correctly, a firewall rule built on IP lists is a shaky way to manage its bots. Let robots.txt carry the decision, and make sure no firewall rule quietly overrides it.

## Which search engine does Claude use?

Anthropic does not document which search engine or index Claude’s web search relies on, and third-party guesses are no substitute for a statement from Anthropic. What Anthropic does document is its own search crawler, Claude-SearchBot, and the fetcher Claude-User, so the parts a dealership controls are access for those bots and the text on its pages.

You will find confident claims online that Claude runs on one particular search engine. Treat them as guesses until Anthropic says otherwise, and do not build a plan around them.

Good standing in the major search engines is worth keeping anyway, because the same crawlable, clearly written pages serve every system that reads the web. Google documents far more about its AI features than Anthropic does, and [how Google AI Overviews cite dealer pages](https://autolander.ai/aeo-geo/google-ai-overviews-for-car-dealers/) covers what it asks of a page.

## How many people use Claude?

In a [Pew Research Center survey](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/) of 5,119 US adults in February 2026, 6% said they use Claude, compared with 44% for ChatGPT, 24% for Gemini and 17% for Microsoft Copilot. About half of US adults (49%) use AI chatbots of some kind, and searching for information was the top use.

So Claude reaches a smaller share of US adults than ChatGPT does. It still earns a place on a dealer’s list, because the work that makes a store readable to Claude is the same work that helps with every other assistant: open doors for search crawlers, facts in page text, and consistent store details across the web.

Our [free scan](https://autolander.ai/aeo-geo-for-car-dealers/#scan-form) checks both ChatGPT and Claude, each with web search on, because both are assistants US buyers use and both show the sources behind their answers.

## What does Claude need to cite your dealership?

Claude needs to be able to reach your pages, read your facts as text, and find the same store details wherever its search lands. None of this forces a citation, since Anthropic does not publish how Claude picks sources, but each item removes a reason for Claude to pass over your store.

- Claude-SearchBot and Claude-User allowed in robots.txt, and not challenged by the CDN or bot filter in front of your site.
- Facts in the page text. A [2024 analysis by Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler) of traffic on its network found that Anthropic’s ClaudeBot, like the other major AI crawlers it tracked, did not render JavaScript at the time. Price, mileage, VIN, hours and address that only appear after scripts run may be invisible to a crawler like that.
- Clear store facts on every page: the store’s real-world name, street address, phone, sales and service hours, and the brands you sell, written in sentences a reader could quote.
- The same details everywhere a search might land: your Google Business Profile, Bing Places, Apple Business Connect, Yelp, DealerRater and your listing-site profiles.
- Answers to real buyer questions on your own site, each one leading with a direct answer: trade-in steps, financing for first-time buyers, service hours, which trims you keep in stock.
- Reviews you answer. Replies are public text too, and a specific reply shows a store that pays attention.

## Sources

- [Anthropic, Claude Help Center: Does Anthropic crawl data from the web, and how can site owners block the crawler?](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Anthropic: Claude can now search the web, March 20, 2025, updated May 27, 2025](https://claude.com/blog/web-search)
- [Pew Research Center: Americans and AI 2026, June 17, 2026](https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/)
- [Vercel: The rise of the AI crawler, December 17, 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)

## Frequently asked questions

### Should my dealership block ClaudeBot?

That depends on how you feel about AI training. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) blocking ClaudeBot signals that your content should be excluded from future training, and it describes Claude-SearchBot and Claude-User as the bots tied to search and retrieval. Whatever you decide about ClaudeBot, keep those two allowed, since Anthropic says blocking them reduces visibility.

### Do I need separate pages written for Claude?

No. Nothing Anthropic publishes asks for special content. The same crawlable pages, facts in plain text and consistent store details that help every assistant are what Claude’s search can read and cite, as long as Claude-SearchBot and Claude-User can reach them.

### Can Claude read vehicle pages built with JavaScript?

Plan as if it cannot. A [2024 Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler) found that ClaudeBot did not render JavaScript at the time, and we have found no Anthropic statement saying its bots render it now. Put price, mileage, VIN and store details in the HTML your server sends, and check by viewing the page source.

### Does the free scan check Claude?

Yes. The free scan asks Claude and ChatGPT, each with web search on, up to 20 questions a local buyer would ask, 3 times each. It reports who gets named, the sources each answer cited, whether AI crawlers can reach your site, whether up to five vehicle pages show price, mileage and VIN as text, a score out of 100 with a margin and the 3 fixes to make first, and a person walks you through it in 20 minutes.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [How ChatGPT decides which car dealerships to recommend](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/)
- [Google AI Overviews for car dealers: when they show and who gets cited](https://autolander.ai/aeo-geo/google-ai-overviews-for-car-dealers/)
- [When AI gets your dealership wrong: fixing wrong hours, addresses and closed labels](https://autolander.ai/aeo-geo/when-ai-gets-your-dealership-wrong/)
- [Best car dealership near me: how AI assistants decide who gets named](https://autolander.ai/aeo-geo/best-car-dealership-near-me-ai/)
- [Should your dealership block AI crawlers? Search bots vs training bots](https://autolander.ai/aeo-geo/should-dealers-block-ai-crawlers/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
