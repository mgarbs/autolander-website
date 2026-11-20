# Dealer groups and AI visibility: one clear entity per rooftop

> How dealer groups keep each rooftop clear to AI tools: separate Business Profiles, consistent names, group and store sites, schema and reviews.

Source: https://autolander.ai/aeo-geo/dealer-group-ai-visibility/  
Author: Michael Garber, Co-founder, AutoLander  
Published: November 16, 2026  
Updated: November 16, 2026

**Short answer:** Dealer group AI visibility depends on each rooftop reading as one clear, separate store to an AI assistant: its own Business Profile, its own page on the group site with its own markup, a real-world name used the same way everywhere, and its own reviews and replies. Standardize the templates and rules at the group level, keep store facts and stories local, and measure each rooftop on its own market’s questions.

## Why do dealer groups get confused in AI answers?

Dealer groups get confused in AI answers when rooftops blur together: similar names, a shared call-center number, one group page standing in for several stores, or brand names combined in one listing. An assistant that cannot tell which store is which may name the wrong rooftop, merge two stores into one, or leave both out.

[Bing’s webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) ask for clear, consistent naming of people, organizations, products and locations, and give the reason plainly: “Clear entity definition improves grounding visibility and citation accuracy.” For a group, each rooftop is an entity. It needs one name, one address, one main phone and one main page, used the same way on the group site, the store site, the Business Profile and every listing.

Take a hypothetical group with a Ford store and a used-car outlet on the same road, both known by the family name and sharing one BDC number. A buyer asks which store nearby has used trucks. The assistant finds a group page listing both addresses, a Business Profile with the shared number and reviews that mention “the dealership” without saying which one. It can easily mix the two up. The fix starts with the basics every store needs, the same ones in [AI search basics for independent dealers](https://autolander.ai/aeo-geo/ai-search-for-independent-dealers/), applied rooftop by rooftop.

[AutoLander’s AEO and GEO service](https://autolander.ai/aeo-geo-for-car-dealers/) works the same way for groups: one rooftop at a time, each with its own free scan and its own plan.

## Should each rooftop have its own Business Profile?

Yes, each rooftop should have its own Google Business Profile, and brands should never be combined in one. [Google’s guidelines](https://support.google.com/business/answer/3038177) say not to combine brand names into a single Business Profile, and they let departments that operate as distinct entities, such as a service and parts department with its own entrance, have their own profiles.

Google’s example is a Toyota dealer whose main profile uses the Toyota Dealer category, with a separate profile for its service and parts department in the Auto Repair Shop category. The same guidelines ask for a business name that matches the real-world name, with no added service, product or location keywords, and categories as specific as possible. For hours, Google tells dealers to list car sales hours, and where new and pre-owned sales hours differ, to use the new sales hours.

For a group, that turns into a rooftop inventory: every store, every brand it sells, every department that runs on its own, each with a verified profile, the right owner and manager access, and no duplicates left over from an acquisition or a rebrand. The fields worth getting right on each one are in [the Business Profile fields AI answers use](https://autolander.ai/aeo-geo/google-business-profile-ai-answers/).

## How should a group website describe each store?

A group website should give each rooftop its own page that reads like that store’s front door: its real name, address, phone, hours, brands, departments and staff, with its own LocalBusiness or AutoDealer markup. Every fact on that page should match the rooftop’s Business Profile word for word, and the group page should link to each store page.

- One page per rooftop, at a stable URL, with the store’s name as the page heading and its address and main phone as text.
- Markup that names the store as its own business. schema.org places [AutoDealer](https://schema.org/AutoDealer) under LocalBusiness and AutomotiveBusiness, and [Google’s LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) says to use the most specific subtype possible, with name and address required.
- Departments marked up as departments. Google recommends a department property for businesses with distinct departments, so a rooftop’s sales, service and parts can each carry their own hours and phone.
- The group itself described once, as the parent organization, on the group’s about page, with each rooftop listed and linked.
- No shared markup across stores. Copying one rooftop’s markup onto another page, or stacking several stores’ addresses in one block, recreates the blur the page exists to fix.
- One main source per rooftop. If each store also runs its own website, decide which page is the main source, link the two both ways and keep the facts identical. The details are in [our dealership schema guide](https://autolander.ai/aeo-geo/car-dealership-schema-markup/).

## How do you keep names, addresses and phones consistent across rooftops?

Keep names, addresses and phones consistent with one master record per rooftop that every website, profile and listing copies from, a naming rule based on each store’s real-world name, and a quarterly audit that compares every public listing against the master. Changes go through the master first, never straight to a single listing.

1. **Build a master record per rooftop** — One sheet, one row per rooftop: the legal name, the name on the sign, the address, the main phone, sales and service phones, hours by department, brands, the website URL, the Business Profile link and who owns each account.
2. **Name each store the way the sign reads** — [Google says](https://support.google.com/business/answer/3038177) business names should match the real-world name with no added service, product or location keywords. That rules out the store name plus “Best Truck Deals” and a city in a profile, and it keeps the name consistent with the markup and the website.
3. **Give each rooftop its own main phone** — A shared BDC or call-center number across stores can blur them. Give each rooftop a distinct main number on its profile and store page, and route calls however you like behind the scenes.
4. **Push changes from the master** — When hours, a phone number or a name change, update the master record first, then the website, the Business Profile and every listing on the same day.
5. **Audit every quarter** — Check each rooftop’s profile, store page and main listings against the master record, fix mismatches, and look for duplicate or leftover profiles after moves, rebrands and acquisitions.
6. **Ask the assistants what they know** — Ask ChatGPT and Claude, with web search on, where each rooftop is and what it sells. A wrong answer can point you to the source that still carries an old fact.

## Who owns reviews and replies at a group?

Each rooftop should own its reviews and replies, answered in its own voice by people who know that store, under one group standard for tone, speed and escalation. [Google’s review tips](https://support.google.com/business/answer/3474122) ask businesses to reply, address reviewers by name, respond in a timely manner and keep replies free of promotion.

The group standard can be short: who replies at each store, how fast, which reviews escalate to the group and which words never appear in a reply. The rooftop fills in the specifics: the salesperson’s name, the service advisor who fixed the problem, the fact that the store changed its delivery checklist after a complaint. A reply that any store in the group could have posted reads like a template, and buyers can tell.

Keep the request process identical across rooftops: every sold customer gets the same neutral request, with no incentives and no filtering. [Google Maps’ content policy](https://support.google.com/contributionpolicy/answer/7400114) bars selectively asking for positive reviews and asking staff to collect a set number of them, so leave review quotas out of pay plans. The mechanics of a good reply are in [our review reply guide](https://autolander.ai/aeo-geo/how-to-respond-to-car-dealership-reviews/).

## How should you measure dealer group AI visibility by rooftop?

Measure dealer group AI visibility one rooftop at a time, on each market’s own questions. A group-level average hides the store that never gets named, and the questions that matter in one town differ from those in the next. Ask the same questions every month, several times each, and compare each rooftop with its own local competitors.

Answers change from run to run, so a single check can mislead. That is why AutoLander’s free scan asks every question 3 times of ChatGPT and of Claude, each with web search on, and reports a score out of 100 with a margin for one dealership. For a group, run it per rooftop. The scan does not measure Gemini, Perplexity, Microsoft Copilot or Google AI Overviews, so check those surfaces by hand or with your own tools.

When a group moves from measuring to monthly work, [AutoLander prices groups per rooftop](https://autolander.ai/aeo-geo-for-car-dealers/#plans) from the same plan table, and each rooftop can be on a different plan. A busy franchise rooftop might run AI Authority while a smaller used-car outlet runs AI Foundation. On Market Leader, a group’s same-brand rooftops count as one dealer for brand exclusivity, and that exclusivity covers only whom AutoLander sells its plans to; AI assistants may still name other dealers.

## What should a group standardize and what should stay local?

A group should standardize the parts that have to be right everywhere, such as page templates, markup, crawler access, review rules and the master record, and leave local the parts only a store can supply: photos, staff, community news and answers about that store’s cars, service and neighborhood. Standards keep rooftops consistent, and local detail keeps them distinct.

The split also settles who does what. The group’s digital team owns the templates, the robots.txt and security settings that decide whether AI crawlers can read every store site, the review policy and the quarterly audit. Each rooftop’s GM owns the store’s facts and stories and signs off on its own pages.

## Standardize at the group

- Store page and answer page templates
- AutoDealer and LocalBusiness markup patterns, with departments
- Crawler access settings, so AI search crawlers can read every store site
- Review request rules and the reply standard
- The master record and the quarterly audit
- One measurement method and question format for every rooftop

## Keep local at each rooftop

- Photos of the real store, lot and people
- Staff names and roles on the store page
- Community news and local events
- Answers about that store’s inventory, service department and neighborhood
- Replies to that store’s reviews, in its own voice
- Hours, holiday hours and department phones, kept current in the master record

## The honest part

No one can promise what ChatGPT, Claude or any other assistant will say about a group or any of its rooftops, and no plan can keep competitors out of an AI answer. What a group controls is whether each rooftop is one clear, consistent store everywhere it appears, and whether each store keeps its facts current and its reviews answered.

## Sources

Every source below was read on September 30, 2026.

- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [Google Business Profile Help: guidelines for representing your business](https://support.google.com/business/answer/3038177)
- [Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [schema.org: AutoDealer](https://schema.org/AutoDealer)
- [Google Business Profile Help: reviews, tips and the incentive rule](https://support.google.com/business/answer/3474122)
- [Google Maps User Contributed Content Policy](https://support.google.com/contributionpolicy/answer/7400114)

## Frequently asked questions

### Can one Business Profile cover two brands at the same address?

Not as one combined listing: Google’s guidelines say not to combine brand names into a single Business Profile. Read [Google’s guidelines](https://support.google.com/business/answer/3038177) before you set up a multi-brand rooftop, since they spell out how dealers represent brands and departments, and keep each profile’s name to the real-world name on the sign.

### Should the group site or the store site be the main source?

Pick one main page per rooftop and make every other page agree with it. Some groups make each store’s own site the main source and give the group site a short page per store that links to it; others run everything from the group site. Either works when each rooftop has one clear main page, one set of facts and markup that matches what the page shows.

### How is AEO priced for a dealer group?

AutoLander prices groups per rooftop from the same plan table: AI Foundation at $997 a month plus $997 setup, AI Authority at $2,497 a month plus $997 setup, and Market Leader at $5,997 a month plus $2,997 setup, all month to month. AI Authority and Market Leader are by application. AutoLander customers pay no setup fee once their AutoLander subscription at that rooftop has been active and paid for the prior 60 days.

### Can each rooftop in a group be on a different plan?

Yes. Each rooftop can be on a different plan, and each starts with its own free scan and walkthrough. For Market Leader’s brand exclusivity, a group’s same-brand rooftops count as one dealer, and exclusivity covers only whom AutoLander sells its plans to; AI assistants may still name other dealers.

**Get my free scan:** https://autolander.ai/aeo-geo-for-car-dealers/#scan-form

## Related

- [AEO and GEO for car dealers: free AI Visibility Scan and plans](https://autolander.ai/aeo-geo-for-car-dealers/)
- [AI for car dealerships: what actually works](https://autolander.ai/guide/ai-for-car-dealerships/)
- [Car dealership marketing: the 2026 playbook](https://autolander.ai/guide/car-dealership-marketing/)
- [About AutoLander — who we are and how our data is produced](https://autolander.ai/about/)
- [AI search for independent used car dealers: where a small lot should start](https://autolander.ai/aeo-geo/ai-search-for-independent-dealers/)
- [Buy here pay here dealers in AI answers: bad-credit questions and honest pages](https://autolander.ai/aeo-geo/buy-here-pay-here-ai-answers/)
- [RV dealers and AI search: answering the questions RV buyers ask](https://autolander.ai/aeo-geo/rv-dealer-ai-search/)
- [Powersports dealers and AI search: ATVs, UTVs, motorcycles and boats](https://autolander.ai/aeo-geo/powersports-dealer-ai-search/)
- [How to measure your dealership’s AI visibility: questions, repeat runs and margins](https://autolander.ai/aeo-geo/measure-dealership-ai-visibility/)
- [When AI gets your dealership wrong: fixing wrong hours, addresses and closed labels](https://autolander.ai/aeo-geo/when-ai-gets-your-dealership-wrong/)
- [Car dealer review sites and AI answers: where your store should show up](https://autolander.ai/aeo-geo/car-dealer-review-sites-ai-answers/)
- [How much does AEO cost for a car dealership?](https://autolander.ai/aeo-geo/aeo-cost-for-car-dealerships/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
