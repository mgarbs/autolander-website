# How to track ChatGPT and AI assistant traffic to your dealership website in GA4

> How to track ChatGPT, Gemini, Claude and Copilot visits to your dealership website in GA4, what the AI Assistant channel counts and what it misses.

Source: https://autolander.ai/aeo-geo/track-ai-traffic-ga4-dealership/  
Author: Michael Garber, Co-founder, AutoLander  
Published: October 26, 2026  
Updated: October 26, 2026

**Short answer:** To track ChatGPT traffic in GA4, open your traffic acquisition report and look for the AI Assistant channel, which Google added to GA4’s default channel group in May 2026 for visits from assistants such as ChatGPT, Gemini and Claude. Two traps are easy to miss: visits from Google AI Overviews and AI Mode land in Organic Search, and assistant visits that arrive with no referrer can land in Direct. GA4 shows the visits; it can’t show the answers where your store was named and nobody clicked.

## How do you track ChatGPT traffic in GA4?

Track ChatGPT traffic in GA4 through the AI Assistant channel. [Google added it to the default channel group](https://support.google.com/analytics/answer/9164320), naming ChatGPT, Gemini and Claude as examples, and sessions from recognized assistants get the medium ai-assistant. [OpenAI says](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) ChatGPT also adds utm_source=chatgpt.com to the links it sends.

In a standard property, the channel shows up in the traffic acquisition report when the primary dimension is the session default channel group. If the AI Assistant row is missing, widen the date range; a channel with no sessions in the range doesn’t appear. For ChatGPT specifically, add session source and look for chatgpt.com, which the tag makes easy to spot.

A visit from ChatGPT means the assistant put a link to your site in front of a shopper and the shopper chose it. Why a store gets linked at all is a separate question, covered in [how ChatGPT picks which dealers to name](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/).

GA4 counts the click. It can’t tell you what ChatGPT said before the click, or whether it named a competitor first; an [AI visibility scan for car dealers](https://autolander.ai/aeo-geo-for-car-dealers/#scan-form) asks ChatGPT and Claude those questions directly.

## What does the AI Assistant channel include?

The AI Assistant channel includes visits from chat assistants. [Google’s channel definitions](https://support.google.com/analytics/answer/9756891) say it covers sources like ChatGPT, Gemini, Deepseek, Copilot or Grok, and that it excludes Google’s AI Overviews and AI Mode. So the channel counts assistants that send a visitor to your site, and leaves Google Search’s own AI answers to another channel.

Perplexity is a special case worth checking. Google’s definition page doesn’t name it among the examples, so look at your own data instead of assuming: add session source to the report, search for perplexity.ai and note which channel your property puts it in. Do the same for any other assistant your buyers mention.

It also pays to scan the Referral channel for assistant domains now and then. If an assistant your shoppers use shows up there, you know to count it with the AI Assistant row in your own reports.

## Where do AI Overviews visits show up?

AI Overviews visits show up in Organic Search. GA4’s channel definitions put Google’s AI Overviews and AI Mode inside Organic Search, together with regular Google results, and keep them out of the AI Assistant channel. GA4’s default channels don’t separate an AI Overview click from a regular Google click, so a dealer needs Search Console for that side.

[Search Console’s generative AI report](https://autolander.ai/aeo-geo/search-console-ai-report-dealers/) shows how often your pages appeared in AI Overviews and AI Mode, page by page. It counts impressions, and GA4 counts the visits that followed, so the two together tell the Google story.

A practical habit: once a month, list the pages with the most AI impressions in Search Console, then check those same pages as Organic Search landing pages in GA4. A page that earns AI impressions and leads is worth copying; a page that earns impressions and no leads needs a clearer next step, such as a visible phone number or a link to live inventory.

## Why do some AI visits look like Direct traffic?

Some AI visits look like Direct traffic because they arrive without a referrer. GA4 files a session under Direct when it has no source information, as with a saved link or a typed address. A buyer who pastes a link from an assistant’s app into a browser, or an app that passes no referrer, can arrive looking like that.

That means the AI Assistant row can undercount. ChatGPT’s utm_source=chatgpt.com tag helps, because the tag travels inside the link itself, so a ChatGPT visit can keep its label even when the referrer is missing.

A useful signal to watch: Direct sessions that land deep in the site, on a single VDP or an answer page, arrived through a link someone had rather than a typed address, since nobody types a VDP URL from memory. A rise in those, with no email or text campaign to explain it, is worth a closer look.

## How do you build a report for AI visits?

Build the report once and save it, so the whole team reads the same numbers each month. The steps use GA4’s standard traffic acquisition and landing page reports with a channel filter. GA4 menu names shift from time to time, so look for the report names rather than exact click paths.

1. **Open traffic acquisition** — In GA4, go to Reports, then Acquisition, then Traffic acquisition. Set the primary dimension to session default channel group and find the AI Assistant row.
2. **Add the source** — Add session source as a secondary dimension so chatgpt.com, gemini.google.com and the others appear as separate rows. Look for perplexity.ai too, and note which channel your property puts it in.
3. **Compare landing pages** — Open the landing page report and filter it to the AI Assistant channel. You want to know where assistants send people: VDPs, model pages, service pages, finance pages or the homepage.
4. **Tie it to key events** — Add the key events your store tracks as columns: lead forms, calls, test-drive requests, finance applications and service appointments. The key event rate shows whether AI visitors act like your other shoppers.
5. **Save it and set a monthly date** — Save the report to your library, then read it on the same day each month next to Search Console’s generative AI report, with the same date range in both.

## What should AI visits be connected to?

Connect AI visits to the actions that sell cars and fill service bays. A visit count alone says little. The useful number is how many AI Assistant sessions ended in a lead form, a call, a test-drive request, a finance application or a service appointment, compared with the same actions from your other channels.

- Lead form submits, split by form, so a price-quote request and a general contact form don’t blur together.
- Calls, through click-to-call events on mobile or the tracking numbers your call tracking vendor assigns to each channel.
- Test-drive and appointment requests, the clearest sign a shopper is close to a visit.
- Finance applications, which tell your F&I office where its most serious shoppers came from.
- VDP views per session. An AI visitor who opens three VDPs is shopping your inventory; one who reads your hours page is checking the store.
- Service scheduling, since fixed ops questions such as recall work and maintenance intervals send buyers to your service pages too.
- Your BDC’s notes. When a caller or a chat says “ChatGPT told me about you,” log it; that first-hand line fills a gap no analytics tool covers.

## What can GA4 not tell you?

GA4 can’t tell you when an assistant named your store and nobody clicked. [Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) note that content can appear as impressions, citations or grounding references in Copilot without a click, and say “a decline in clicks does not always indicate a loss of visibility.”

It also can’t tell you who else the assistant named, what it said about your prices or reviews, or which sources it cited. A store can be recommended in many chats and see a handful of sessions, or be left out entirely and see the same handful, and GA4 looks the same either way.

That gap is why [how to measure AI visibility](https://autolander.ai/aeo-geo/measure-dealership-ai-visibility/) starts with asking the assistants the questions your buyers ask, more than once each, and uses GA4 and Search Console for the traffic side.

## Sources

- [Google Analytics Help: What’s new (AI Assistant channel, May 13, 2026)](https://support.google.com/analytics/answer/9164320)
- [Google Analytics Help: default channel group definitions](https://support.google.com/analytics/answer/9756891)
- [OpenAI Help Center: publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [Bing Webmaster Guidelines (visibility without clicks)](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)

## Frequently asked questions

### Does GA4 show Perplexity traffic?

GA4 records the visit, but Google’s channel definition page doesn’t name Perplexity among its AI Assistant examples, so check your own property. Add session source to the traffic acquisition report, look for perplexity.ai and note which channel it lands in before you build a report around it.

### Why is my AI assistant traffic so small?

Assistants answer inside the chat, so a buyer can get a shortlist of stores without clicking any of them. On top of that, assistant visits that arrive with no referrer can count as Direct, and clicks from Google’s AI Overviews count as Organic Search. Read the AI Assistant row as a floor, not the full count.

### Does ChatGPT tag the links it sends?

Yes. OpenAI says ChatGPT adds utm_source=chatgpt.com to referral URLs, so its visits carry a clear source label in GA4. Filter session source for chatgpt.com to see them.

### How long should I wait before judging AI traffic?

A few months. AI visits are usually a small slice of traffic, so one week can swing on a handful of sessions. Compare the same months year over year once you have them, and read the trend next to your Search Console and Bing numbers.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [How to measure your dealership’s AI visibility: questions, repeat runs and margins](https://autolander.ai/aeo-geo/measure-dealership-ai-visibility/)
- [Search Console’s generative AI report for dealers: AI Overviews and AI Mode impressions](https://autolander.ai/aeo-geo/search-console-ai-report-dealers/)
- [Can ChatGPT and Claude read your dealership website? A 15-minute check](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/)
- [How ChatGPT decides which car dealerships to recommend](https://autolander.ai/aeo-geo/how-chatgpt-recommends-car-dealerships/)
- [How Claude finds and cites dealerships in its answers](https://autolander.ai/aeo-geo/how-claude-cites-sources/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
