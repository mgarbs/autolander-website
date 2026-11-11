# Schema markup for car dealerships: AutoDealer, Car, Vehicle and Offer

> Schema markup for car dealerships: AutoDealer, Vehicle and Offer properties, what Google retired, and what structured data can and can’t do for AI.

Source: https://autolander.ai/aeo-geo/car-dealership-schema-markup/  
Author: Michael Garber, Co-founder, AutoLander  
Published: November 11, 2026  
Updated: November 11, 2026

**Short answer:** Car dealership schema markup comes down to two jobs: AutoDealer markup that describes the store, with departments for sales, service and parts, and Car or Vehicle markup with an Offer on every vehicle detail page, in JSON-LD, the format Google recommends. Keep expectations straight: Google says structured data isn’t required for its AI search features, Google stopped showing vehicle listing rich results in 2025, and Bing says markup may support clearer grounding, does not guarantee visibility and must match what the page shows.

## What schema markup should a car dealership use?

A car dealership should use AutoDealer for the store and Car, a type of Vehicle, with an Offer on each vehicle page. [schema.org places AutoDealer](https://schema.org/AutoDealer) under LocalBusiness and AutomotiveBusiness, and an Offer carries the sale terms: price, currency, availability and condition. Google recommends JSON-LD, though valid Microdata and RDFa work too.

Put the AutoDealer block on the homepage and the contact page, where the store’s name, address, hours and phone already appear. Put a Car block with its Offer on every VDP, and have the Offer’s seller point back to the same AutoDealer so the car and the store connect. On schema.org, [Car sits under Product and Vehicle](https://schema.org/Vehicle), and the Offer names the car as its itemOffered.

Markup only labels what the page already says, so start with [vehicle detail pages AI can read](https://autolander.ai/aeo-geo/vehicle-detail-page-ai-readable/): price, mileage and VIN as visible text first, markup second.

## Is schema markup required to show up in AI answers?

Schema markup is not required for AI answers. [Google’s guide to its generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says “Structured data isn’t required for generative AI search,” and there is no special schema.org markup to add. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) structured data may support clearer grounding but “does not guarantee visibility or grounding traffic.”

So why bother? [Google says](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) it uses structured data it finds on the web to understand the content of a page, and its AI guide says markup is still worth using where it makes a page eligible for rich results. There is a practical reason too: markup is a second copy of your facts, so when it disagrees with the page, you have found a template bug.

Bing adds the condition that matters most: markup must accurately reflect the visible content. For how Google’s AI answers pick the pages they link, see [Google AI Overviews for car dealers](https://autolander.ai/aeo-geo/google-ai-overviews-for-car-dealers/).

Structured data is one line on the website fix list in [AEO and GEO for car dealers](https://autolander.ai/aeo-geo-for-car-dealers/), next to AI crawler access and the vehicle-page text it has to match.

## What happened to Google’s vehicle listing rich results?

Google retired vehicle listing rich results. On June 12, 2025, Google said it would phase out several structured data features to simplify its results page, and on Sept 9, 2025 it removed the vehicle listing structured data documentation because the feature no longer appeared in Google Search results. Guides that still sell it as live are out of date.

Accurate vehicle markup can stay, since Google still reads structured data to understand pages. What changed is the payoff: nobody should pay for a setup whose selling point is a rich result Google no longer shows.

## Dated notice, checked September 30, 2026

Google’s [documentation updates log](https://developers.google.com/search/updates) shows the vehicle listing structured data page removed on Sept 9, 2025, together with course info, estimated salary, learning video and special announcement. If a vendor proposal still offers vehicle listing rich results, ask which current Google page documents them.

## How should AutoDealer markup describe the store?

AutoDealer markup should match your Google Business Profile and your contact page, fact for fact. Google’s LocalBusiness guidance requires a name and address, recommends geo, opening hours, telephone, url and department for businesses with distinct departments, and says to use the most specific subtype. For a dealership, that subtype is AutoDealer.

- name: the store’s name exactly as it appears on your Business Profile and your sign, with no city or keyword added.
- address: street, city, state and ZIP, written the same way everywhere the store is listed.
- geo: the latitude and longitude of the showroom, so the map pin and the markup agree.
- openingHoursSpecification: sales hours here, with service and parts hours in their own departments.
- telephone and url: the main number and the homepage.
- department: one entry each for sales, service and parts, with their own hours and phone numbers. [schema.org lists AutoRepair and AutoPartsStore](https://schema.org/AutomotiveBusiness) as types under AutomotiveBusiness, which fit a service department and a parts counter.
- Keep every value identical to [the Business Profile fields AI answers use](https://autolander.ai/aeo-geo/google-business-profile-ai-answers/), so every source a buyer or an assistant checks tells the same story about the store.

## Which Vehicle properties belong on a vehicle detail page?

Mark up the Vehicle properties that match facts the page already shows. The core set for a dealer is the VIN, mileage, trim, body style, fuel type, transmission, drivetrain, engine and colors, plus previous owners and known damage when your history report supports them. Each value must match the visible field word for word.

| schema.org property | What it holds | Visible field it must match |
| --- | --- | --- |
| vehicleIdentificationNumber | The VIN | The full VIN in the spec block |
| mileageFromOdometer | The odometer reading and its unit | The mileage shown near the price |
| vehicleConfiguration | The trim or configuration | The trim in the title and spec block |
| bodyType | Body style, such as SUV or crew cab pickup | The body style in the spec block |
| fuelType | Gas, diesel, hybrid or electric | The fuel type in the spec block |
| vehicleTransmission | Automatic, manual or CVT | The transmission in the spec block |
| driveWheelConfiguration | FWD, RWD, AWD or 4WD | The drivetrain in the spec block |
| vehicleEngine | The engine | The engine line in the spec block |
| color and vehicleInteriorColor | Exterior and interior colors | The colors on the page, in the same words |
| numberOfPreviousOwners | The owner count | The owner count your history report supports |
| knownVehicleDamages | Disclosed damage | Any damage disclosure on the page |

_Property names from schema.org’s Vehicle type, checked September 30, 2026. Car is a subtype of Vehicle, so a Car block can use every property above._

## How should price go in Offer markup?

Price goes in an Offer attached to the car, with [price, priceCurrency, availability, itemCondition and seller](https://schema.org/Offer), plus priceValidUntil when a price has an end date. The number must match the page: [Google’s vehicle ads policy](https://support.google.com/merchants/answer/11544533) requires the price in the feed and in structured data to exactly match the landing page, and Bing requires markup to reflect visible content.

Price mismatches can start in the template, when the markup pulls one price field while the page shows another, such as an internet price in the code and a price after conditional rebates on screen. Pick the advertised price, use it in both places, and describe any conditions in plain text next to it.

Set itemCondition to new or used to match the page, and update availability the day a car sells. schema.org defines priceValidUntil as the date after which the price is no longer available, so use it for a dated special and leave it out for everyday prices.

## Should a dealership mark up its own star rating?

A dealership should not mark up its own star rating. [Google’s LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) limits aggregateRating markup to sites that capture reviews about other local businesses, and a dealer rating itself on its own site falls outside that. Let reviews live where buyers read them, on your Business Profile and review sites, and answer them there.

The same goes for testimonials on your VDPs or homepage. Show them as text if you like, and leave them out of Review markup.

## How do you check car dealership schema markup against the page?

Spot-check three live vehicle pages against their own markup, then fix any mismatch in the template instead of by hand. Pick a new car, a used car and one with a price change this week, because each one exercises a different part of the template: MSRP, mileage and a freshly updated price.

1. **Pick three vehicle pages** — One new car, one used car and one whose price changed in the last few days. Note the price, VIN, mileage, trim, colors and availability shown on each page.
2. **Find the markup** — Open the page source, not the rendered page, and search for application/ld+json. If there is none, look for Microdata attributes. If there is still nothing, your platform may add no vehicle markup at all, which is worth knowing before anything else.
3. **Compare value by value** — Check the price, VIN, mileage, trim, colors and availability in the markup against what you noted. Write down every mismatch, including small ones such as a rounded price or a color named differently.
4. **Fix it at the template** — Hand edits get overwritten on the next inventory update. Send your website vendor the mismatch list and ask for the template to read both the page and the markup from the same field.
5. **Confirm AI crawlers can reach the page** — Markup does nothing on a page AI crawlers can’t open, so [check whether ChatGPT and Claude can read your website](https://autolander.ai/aeo-geo/can-chatgpt-see-my-dealer-website/) before you polish the code.
6. **Repeat after every platform update** — A template update can change the markup without anyone at the store noticing. Re-run the three-page check after each update and once a month.

## Sources

- [Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Bing Webmaster Guidelines (structured data and grounding)](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [Google Search Central: introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Search Central: documentation updates log (vehicle listing removal)](https://developers.google.com/search/updates)
- [schema.org: AutoDealer](https://schema.org/AutoDealer)
- [schema.org: AutomotiveBusiness](https://schema.org/AutomotiveBusiness)
- [schema.org: Vehicle](https://schema.org/Vehicle)
- [schema.org: Offer](https://schema.org/Offer)
- [Google Merchant Center Help: vehicle ads policies](https://support.google.com/merchants/answer/11544533)
- [OpenAI Help Center: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)

## Frequently asked questions

### Should sold vehicles keep their markup?

Not as a car for sale. If the page stays up briefly with a sold notice, change the Offer’s availability or remove the Offer so the markup matches the page; if the page redirects, the markup goes with it. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) markup must accurately reflect visible content.

### Is JSON-LD better than Microdata for a dealer website?

Google recommends JSON-LD and says Microdata and RDFa are equally fine if valid. JSON-LD sits in one block per template, which makes it easier for a website vendor to keep in sync with the page and easier for you to check.

### Should the service department have its own markup?

Yes, as a department of your AutoDealer. Google recommends the department property for businesses with distinct departments, and schema.org’s AutoRepair type fits a service department. Give it its own hours and phone number, matching your Business Profile.

### Will schema markup get my cars into ChatGPT answers?

No one can promise that: Google says structured data isn’t required for its AI search features, Bing says structured data does not guarantee visibility or grounding traffic, and OpenAI says placement in ChatGPT search is not guaranteed. Markup helps a machine read facts your page already shows, and that is its whole job.

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
- [Powersports dealers and AI search: ATVs, UTVs, motorcycles and boats](https://autolander.ai/aeo-geo/powersports-dealer-ai-search/)

---
AutoLander: AEO and GEO for car dealers. https://autolander.ai/aeo-geo-for-car-dealers/
