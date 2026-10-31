# Should your dealership block AI crawlers? Search bots, training bots and the robots.txt lines

> Should a dealership block AI crawlers? Search bots vs training bots from OpenAI, Anthropic, Google, Perplexity and Apple, plus robots.txt examples.

Source: https://autolander.ai/aeo-geo/should-dealers-block-ai-crawlers/  
Author: Michael Garber, Co-founder, AutoLander  
Published: October 31, 2026  
Updated: October 31, 2026

**Short answer:** Should I block AI crawlers? For a car dealership, keep the AI search and retrieval bots allowed, because they are how ChatGPT, Claude and Perplexity read and cite your store. Blocking training bots such as GPTBot and ClaudeBot is a separate business choice, since OpenAI and Anthropic run training apart from search. Google-Extended needs more thought: Google says it does not affect inclusion in Google Search, but it also covers grounding in Gemini Apps. Write the rules bot by bot, and never block every crawler at once.

## Should a car dealership block AI crawlers?

No, not the ones that matter for being found. A dealership should keep AI search and retrieval bots such as OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot allowed so assistants can read and cite its pages. Blocking training bots is a separate business choice, because [OpenAI](https://developers.openai.com/api/docs/bots) and [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) run training on different crawlers from search.

The reasoning is simple for a store. Your website exists to put your name, your inventory and your service department in front of local buyers, and an assistant can only name or cite what its crawler was allowed to read. Anthropic says blocking Claude-SearchBot prevents indexing for search and reduces visibility in its search results, and that blocking Claude-User prevents retrieval when a user asks a question. Blocking those bots amounts to asking not to be read.

Before deciding anything, [check whether ChatGPT and Claude can read your website](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/) today, because a robots.txt file is easy to forget once it is written. Crawler access is the base layer of [AEO for car dealerships](https://autolander.ai/aeo-geo-for-car-dealers/): the answer pages, reviews and listings work that follows only counts if the assistants can get in.

## Which AI bots are search bots and which are training bots?

The major AI companies publish the names of their crawlers and what each one does. Search and retrieval bots read pages so an assistant can find, quote and cite them, while training bots collect content that may train future models. The table lists the ones a dealer will see, as each company describes them.

| Company | Crawler or token | Job | What to know before blocking |
| --- | --- | --- | --- |
| OpenAI | OAI-SearchBot | Search: surfaces sites in ChatGPT search, not used for training | OpenAI says sites must allow it to be eligible for ChatGPT search results |
| OpenAI | GPTBot | Training: content that may train OpenAI’s models | Disallowing it signals your content should not be used in training |
| OpenAI | ChatGPT-User | User actions: certain actions a ChatGPT user starts | OpenAI says robots.txt rules may not apply to it |
| Anthropic | Claude-SearchBot | Search: improves Claude’s search results | Anthropic says blocking it prevents indexing for search |
| Anthropic | Claude-User | Retrieval: fetches pages when a Claude user asks | Anthropic says blocking it prevents retrieval for user questions |
| Anthropic | ClaudeBot | Training: content that may train Anthropic’s models | Blocking it signals exclusion from future training data |
| Perplexity | PerplexityBot | Search: surfaces and links sites in Perplexity, not used to train foundation models | Respects robots.txt; changes can take up to 24 hours |
| Perplexity | Perplexity-User | User actions: visits a page to answer a user’s question | Perplexity says it generally ignores robots.txt |
| Google | Google-Extended | A robots.txt token for Gemini training and grounding in Gemini Apps and Vertex AI | Google says it does not affect inclusion in Google Search and has no separate user agent |
| Apple | Applebot | Crawler whose data feeds Apple search features in Spotlight, Siri and Safari | Separate from Apple’s training opt-out |
| Apple | Applebot-Extended | Opt-out token for training Apple’s generative models | Apple says it does not crawl pages itself |

_Descriptions paraphrase each company’s own crawler documentation as of September 2026. Sources are listed at the end of this article._

## What happens if your site blocks OAI-SearchBot?

Your site drops out of eligibility for ChatGPT search results. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) a site must allow OAI-SearchBot to crawl it, and must let OpenAI’s published search bot IP addresses through its host or CDN, to be eligible for inclusion. Of every line in a dealer’s robots.txt, this is the one to get right for ChatGPT.

There is a wrinkle. [OpenAI’s publisher FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) says that if a page is disallowed but OpenAI learns its URL from a third-party search provider or other pages, ChatGPT Atlas may still show the bare link and title. A noindex meta tag prevents that, and the crawler has to be allowed in to read the tag. So robots.txt controls reading, while noindex controls listing. For a dealer that wants to be found, the takeaway stays the same: allow OAI-SearchBot and give it pages worth quoting.

Being readable is the entry ticket, and what ChatGPT does with your pages depends on much more. For the rest of the picture, read [how ChatGPT chooses a dealership](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/) when local buyers ask for one.

## Does blocking Google-Extended remove you from AI Overviews?

No, based on how Google describes its controls. [Google says](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) Google-Extended governs whether its crawled content trains future Gemini models and grounds answers in Gemini Apps and Vertex AI, and that it does not affect inclusion in Google Search. Google AI Overviews and Google AI Mode sit under Search’s own controls.

[Google’s AI features page](https://developers.google.com/search/docs/appearance/ai-features) says the controls for how a page appears in its AI features are the normal Search preview controls: nosnippet, data-nosnippet, max-snippet and noindex. [Search Console](https://support.google.com/webmasters/answer/16908024) also has a generative AI setting, on by default for every property, that lets an owner exclude the site’s links and content from AI Overviews, AI Mode and generative AI features in Discover. Google says that exclusion does not affect AI training.

Putting those pages together is our reading of Google’s documentation, since Google does not state the combination in one place: Google-Extended is a training and Gemini grounding decision, and the AI Overviews decision lives in Search. For a dealer that wants to be cited, leave the Search Console setting on and avoid nosnippet on pages you want quoted. More on [Google AI Overviews for car dealers](https://autolander.ai/aeo-geo/google-ai-overviews-for-car-dealers/).

## Do all bots obey robots.txt?

No. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), the robots.txt standard, says its rules are not a form of access authorization, so compliance is up to each crawler. [OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt rules may not apply to ChatGPT-User, [Perplexity says](https://docs.perplexity.ai/guides/bots) Perplexity-User generally ignores them, and [Cloudflare notes](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) that robots.txt compliance is voluntary.

The user-triggered bots are a special case for a reason: they fetch a page because a person asked for it. If a buyer pastes one of your vehicle pages into ChatGPT and asks whether the price is fair, the fetch that may follow is that buyer’s request. Blocking fetches like that mostly gets in the way of your own shoppers.

For the crawlers that honor robots.txt, the file does its job. For anything else, the control sits at the security layer, which is where [Cloudflare’s AI bot settings](https://autolander.ai/aeo-geo/cloudflare-ai-bots-dealer-websites/) and similar tools come in. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) its bots honor robots.txt and that blocking them by IP address may not work correctly, so for Claude, robots.txt is the right tool.

## What robots.txt lines should a dealership use?

Use a robots.txt that names each AI search crawler and allows it, then adds training blocks only if the store has decided on them. The lines below are an example to adapt with your website vendor, never a file to paste over your current one, since that file may hold rules your site needs.

1. **Keep your existing rules** — Start from the current file. Rules that keep crawlers out of admin pages, internal search results or checkout flows usually belong there, and your vendor added them for a reason. Add the AI groups below them instead of starting over.
2. **Allow the search and retrieval bots by name** — Add one group per crawler: a line reading User-agent: OAI-SearchBot followed by a line reading Allow: /, then the same two lines for Claude-SearchBot, Claude-User and PerplexityBot. With a named group, each of these crawlers follows its own rules instead of the catch-all group.
3. **Decide on training, then write it down** — If the store opts out of model training, add User-agent: GPTBot with Disallow: /, and the same for ClaudeBot and Applebot-Extended. Weigh Google-Extended on its own, since Google says it also controls grounding in Gemini Apps. [Apple says](https://support.apple.com/en-us/119829) Applebot-Extended does not crawl pages; it only controls training use. Applebot, the crawler behind Apple’s search features in Spotlight, Siri and Safari, is a separate name.
4. **Check the catch-all group** — Look at User-agent: * last. If it says Disallow: /, every crawler without its own group is shut out, which is why the named Allow groups in step 2 matter. Never add a blanket Disallow: / to settle a training worry.
5. **Test after 24 hours** — [OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt changes take about 24 hours to be reflected, and [Perplexity says](https://docs.perplexity.ai/guides/bots) up to 24 hours. Open yourstore.com/robots.txt the next day, confirm every group reads the way you wrote it, and date the check.

## Is robots.txt the way to keep a page out of search?

No. [Google says](https://developers.google.com/search/docs/crawling-indexing/robots/intro) robots.txt mainly manages crawler traffic and is not a mechanism for keeping a page out of Google. To keep a page out of search results, use a noindex tag or password protection. OpenAI makes a similar point for ChatGPT Atlas, where a disallowed page can still show as a link and title.

This matters for pages a dealer genuinely wants hidden, such as a staff-only price sheet, a test landing page or an old campaign. Blocking them in robots.txt can leave the address findable with no description. A noindex tag, with the crawler allowed to read it, is the cleaner tool, and anything with private information belongs behind a login.

For everything a buyer should find, including inventory, the service menu, hours and directions, do the opposite: let the search crawlers in and make each page easy to quote. Getting those rules right, and keeping them right after every site change, is part of the monthly website work in our service.

## Sources

Every bot description in this article comes from the company that runs the bot: OpenAI, Anthropic, Perplexity, Google and Apple, plus the robots.txt standard and Cloudflare’s documentation. Crawler names and rules change from time to time, so check the live page before editing your file.

- [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)
- [OpenAI Help Center: Publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Anthropic: how Anthropic crawls the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)
- [Google Search Central: Google’s common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google Search Console Help: Search generative AI setting](https://support.google.com/webmasters/answer/16908024)
- [Google Search Central: introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Apple Support: About Applebot](https://support.apple.com/en-us/119829)
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
- [Cloudflare Docs: managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)

## Frequently asked questions

### Will blocking GPTBot keep my dealership out of ChatGPT?

Not out of ChatGPT search. [OpenAI describes](https://developers.openai.com/api/docs/bots) GPTBot as its training crawler and treats blocking it as separate from OAI-SearchBot, the crawler that surfaces sites in ChatGPT search. A store can disallow GPTBot and stay eligible for ChatGPT search results, as long as OAI-SearchBot and OpenAI’s published IP ranges are allowed.

### Can I block AI training but still allow AI search?

Yes. Name each crawler in robots.txt: allow OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot, and disallow GPTBot, ClaudeBot and Applebot-Extended if the store wants to opt out of training. Decide on Google-Extended separately, because Google says it also covers grounding in Gemini Apps. Avoid a blanket rule for every bot, which would block search along with training.

### Does Applebot matter for a car dealership?

It can. [Apple says](https://support.apple.com/en-us/119829) Applebot data feeds search features across Spotlight, Siri and Safari, so keep Applebot allowed. If the store wants to opt out of Apple’s model training, disallow Applebot-Extended, which Apple says does not crawl pages itself.

### How long do robots.txt changes take to work?

OpenAI says about 24 hours for OAI-SearchBot, and Perplexity says up to 24 hours for PerplexityBot. Check the live file the next day, then allow a few weeks before judging whether assistants have read your pages again, since crawling and answering run on their own schedules.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [Can ChatGPT and Claude read your dealership website? A 15-minute check](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/)
- [Cloudflare AI bot blocking on dealer websites: what to allow](https://autolander.ai/aeo-geo/cloudflare-ai-bots-dealer-websites/)
- [Vehicle detail pages AI can read: price, mileage and VIN as text](https://autolander.ai/aeo-geo/vehicle-detail-page-ai-readable/)
- [How ChatGPT decides which car dealerships to recommend](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/)
- [How Claude finds and cites dealerships in its answers](https://autolander.ai/aeo-geo/how-claude-cites-sources/)
- [ChatGPT ads for car dealers: how ads differ from being named in the answer](https://autolander.ai/aeo-geo/chatgpt-ads-for-car-dealers/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
