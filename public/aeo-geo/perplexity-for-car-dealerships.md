# Perplexity and car dealerships: how it picks the sources it cites

> How Perplexity picks and cites sources for car questions, what PerplexityBot and Perplexity-User do, and what its source labels mean for dealers.

Source: https://autolander.ai/aeo-geo/perplexity-for-car-dealerships/  
Author: Michael Garber, Co-founder, AutoLander  
Published: November 19, 2026  
Updated: November 19, 2026

**Short answer:** Perplexity for car dealerships works like a research engine: it searches the web in real time for each question, uses AI models to interpret it, and puts numbered citations to the original sources in every answer. PerplexityBot finds and links sites for those results and respects robots.txt, so a dealer should let it in. Perplexity says payments do not affect its source labels, and the questions it uses to rate sites, such as whether a site corrects its mistakes and says who wrote each piece, double as a trust checklist for a dealer website.

## How does Perplexity answer a car-buying question?

[Perplexity](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) searches the web in real time for each question, uses AI models to understand what the buyer is asking, and writes an answer with numbered citations that link to the original sources. For a car question, those sources can be review sites, model comparisons, listing sites and dealer pages that answer the question directly.

[Perplexity’s help center](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) names models such as OpenAI’s GPT-5 and Anthropic’s Claude among those it uses to interpret questions, and says each answer includes numbered citations linking to the original sources. Because the numbered sources sit right inside the answer, a buyer can click straight through to the page that supported a claim, including a page on your site.

The other assistants work in related ways with their own search and their own sources. For comparison, see [how ChatGPT recommends dealerships](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/) and [how Claude cites its sources](https://autolander.ai/aeo-geo/how-claude-cites-sources/).

Keeping a store’s facts and pages in shape for engines like this, and for every other assistant, is the core of [generative engine optimization for dealers](https://autolander.ai/aeo-geo-for-car-dealers/).

## What is PerplexityBot, and should a dealership allow it?

PerplexityBot is Perplexity’s search crawler: it finds and links websites in Perplexity’s results, and [Perplexity says](https://docs.perplexity.ai/guides/bots) it is not used to crawl content for AI foundation models. It respects robots.txt. A dealership that wants its pages cited in Perplexity answers should allow it, because blocking it keeps those pages out of what it crawls.

[Perplexity’s bot documentation](https://docs.perplexity.ai/guides/bots) adds that robots.txt changes can take up to 24 hours to be reflected. Blocking PerplexityBot does little for a dealer on the training question, since Perplexity says this crawler does not collect content for foundation models, and it costs the chance to be linked.

Check two places. Your robots.txt should not disallow PerplexityBot, and the security service in front of your site, such as a CDN or firewall with bot rules, should not challenge it. For a crawler-by-crawler decision, see [whether dealers should block AI crawlers](https://autolander.ai/aeo-geo/should-dealers-block-ai-crawlers/).

## What is Perplexity-User?

Perplexity-User is the fetcher Perplexity uses when a person asks a question and Perplexity visits a page to answer it. Because a user requested the visit, [Perplexity says](https://docs.perplexity.ai/guides/bots) Perplexity-User generally ignores robots.txt rules. It acts for one buyer’s live question, separate from the PerplexityBot crawler that surfaces sites in search results.

For a dealer, that has two practical effects. A robots.txt rule does not reliably stop Perplexity-User, and a firewall that challenges every automated visitor may stop it anyway, which can mean a buyer asking about a car on your lot gets an answer built without your page.

The simple setup for most stores: let both in. A live-question fetch can happen at the very moment a buyer is asking about your store or your inventory.

## What are Perplexity’s source labels?

They are tags [Perplexity](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels) puts on some cited domains: Government, Academic or Trusted. Perplexity rates whole websites using plain questions, such as whether the site corrects its mistakes and says who wrote each piece. Most domains carry no label, and Perplexity says having none is no negative judgment.

[Perplexity’s help article on source labels](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels) lists the questions its review uses, such as “Does the site correct its mistakes?”, and also asks whether a site keeps news separate from advertising. Since most domains have no label, a dealer site without one is in normal company. The questions themselves are the useful part: they describe what Perplexity looks for in a trustworthy source.

Ask them of your own site. Does your model comparison page say who wrote it? When a price or a spec on a page turns out wrong, is it corrected and dated? Are specials and promotional pages clearly marked and kept apart from the pages that answer questions?

## Can a dealership pay Perplexity for a label or a citation?

Not for a label. [Perplexity says](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels) its partnerships, payments and other business arrangements do not affect a site’s source label, which is set by its source review process alone. As for citations, no one can promise a dealer that Perplexity will cite a page, and anyone who does is guessing.

Google and OpenAI make similar statements about their own products: [Google says](https://support.google.com/business/answer/7091) there is no way to pay for a better local ranking, and [OpenAI says](https://openai.com/index/our-approach-to-advertising-and-expanding-access/) ads do not influence ChatGPT’s answers.

The dependable route is the slow one: pages that are accurate, attributed and kept current, on a site Perplexity can crawl.

## What did research on Perplexity citations find?

The key study is the paper that coined “generative engine optimization,” published at KDD 2024. [Testing on the live Perplexity engine](https://arxiv.org/html/2311.09735v3), its authors found that adding quotations improved a source’s visibility by 22% over baseline and adding statistics by up to 37%, in the study’s test setup. Those are lab results, never a forecast for a dealer.

[The GEO paper](https://arxiv.org/abs/2311.09735), by Pranjal Aggarwal and colleagues, built a benchmark of 10,000 queries and reported that its methods could raise visibility in generative engine responses by up to 40%, with results varying by domain. The [live Perplexity test](https://arxiv.org/html/2311.09735v3) is the part closest to a real answer engine.

What a dealer should take from it is the direction: pages that quote real sources and give specific, sourced figures gave the engine more to work with. A service page that lists every item your technicians inspect is more quotable than one that says “thorough inspection.” The size of any effect on your own store is unknown, and no one can promise it.

## What makes a car dealership page easier for Perplexity to cite?

Perplexity’s source-review questions point to a few habits: say who wrote the page, fix errors in the open, keep promotion apart from information, and state facts plainly with sources. None of these is a trick, and every one also helps a buyer who lands on the page.

- A named author or team. Put a byline on answer pages and model comparisons: the sales manager, the service director, or your store’s team with a line about who they are. Perplexity’s review asks whether a site [says who wrote each piece](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels).
- Dates and corrections. Show when a page was last updated, and when a fact changes, fix it and note the change. Perplexity’s review asks whether a site corrects its mistakes.
- Promotion kept apart. Keep specials and sponsored content clearly marked and separate from the pages that answer questions, the way Perplexity’s review asks whether news is kept separate from advertising.
- Sourced numbers. When a page cites fuel economy, a recall or a warranty term, link the manufacturer or government source. In the GEO study’s test setup, adding statistics and quotations raised visibility on Perplexity.
- Facts stated plainly. Hours, address, brands sold, services, and each vehicle’s price, mileage and VIN belong on the page as text, never locked inside images.
- One question per page. Short [answer-first dealer pages](https://autolander.ai/aeo-geo/answer-pages-for-car-dealerships/) give Perplexity a clean, single-topic source for each buyer question.

## Sources

- Perplexity Help Center, [How does Perplexity work?](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work), September 3, 2026
- Perplexity Help Center, [Understanding source labels](https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels), September 9, 2026
- Perplexity docs, [Perplexity crawlers](https://docs.perplexity.ai/guides/bots)
- Aggarwal and others, [GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735), KDD 2024, and the [full paper](https://arxiv.org/html/2311.09735v3)
- Google Business Profile Help, [How local results are ranked](https://support.google.com/business/answer/7091)
- OpenAI, [Our approach to advertising and expanding access](https://openai.com/index/our-approach-to-advertising-and-expanding-access/), January 16, 2026

## Frequently asked questions

### Does Perplexity use my website to train AI models?

Perplexity says PerplexityBot, the crawler that surfaces and links sites in its search results, is not used to crawl content for AI foundation models. PerplexityBot also respects robots.txt, so you control whether it visits.

### How fast does Perplexity see a robots.txt change?

Perplexity says changes can take up to 24 hours to be reflected for PerplexityBot. Perplexity-User, which fetches pages for a user’s live question, generally ignores robots.txt, so a robots.txt change does not reliably control it.

### Which AI models does Perplexity use?

[Perplexity says](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) it uses models such as GPT-5 and Claude to interpret questions, and it searches the web in real time for each one. For a dealer the search side matters more than the model: your pages have to be reachable and clear for Perplexity to cite them.

### Can I see Perplexity visits in GA4?

Usually. GA4 records the visit, but Google’s channel definitions do not name Perplexity among the AI Assistant examples, so add session source to your traffic report and look for perplexity.ai to see which channel its visits land in.

### Can I check how my store shows up in Perplexity?

By hand, yes: ask Perplexity a few local buyer questions that name your city and open the numbered sources. AutoLander’s free scan does not measure Perplexity; it asks ChatGPT and Claude up to 20 local buyer questions, 3 times each. The crawler access and vehicle-page fixes it finds are on your own website, which PerplexityBot crawls too.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [How ChatGPT decides which car dealerships to recommend](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/)
- [Google AI Overviews for car dealers: when they show and who gets cited](https://autolander.ai/aeo-geo/google-ai-overviews-for-car-dealers/)
- [How Claude finds and cites dealerships in its answers](https://autolander.ai/aeo-geo/how-claude-cites-sources/)
- [Google AI Mode for car dealers: query fan-out and your pages](https://autolander.ai/aeo-geo/google-ai-mode-for-car-dealers/)
- [Reddit and your dealership’s reputation in AI answers](https://autolander.ai/aeo-geo/reddit-and-dealership-reputation/)
- [AEO red flags: guarantees no one can keep, secret dashboards and AI spam](https://autolander.ai/aeo-geo/aeo-agency-red-flags/)
- [llms.txt for car dealerships: what it does and what it doesn’t](https://autolander.ai/aeo-geo/llms-txt-for-car-dealerships/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
