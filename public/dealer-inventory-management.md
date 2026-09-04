# Dealer inventory management: getting cars from the DMS to buyers

> Dealer inventory management is two jobs: the DMS holds the record, distribution gets it in front of buyers. How the second job breaks, and how to keep every channel current.

Source: https://autolander.ai/dealer-inventory-management/  
Author: Michael Garber, Founder, AutoLander  
Updated: September 3, 2026

**Short answer:** Dealer inventory management has two halves. The system of record — a DMS or inventory platform like vAuto, DealerCenter, CDK, Tekion, Frazer or HomeNet — holds the truth about every unit: cost, price, mileage, photos, status. Distribution is the second half: getting that truth in front of buyers on the website, the portals and Facebook Marketplace, and keeping it true as prices move and cars sell. The DMS half is a solved problem. The distribution half breaks quietly, one stale listing at a time, and Marketplace is where it breaks most because nothing built into the DMS keeps it current. AutoLander is that missing leg: it reads the inventory you already manage and keeps Marketplace matched to it.

## What is dealer inventory management?

At a car dealership, inventory management is everything that happens to a unit between acquisition and delivery: stocking it in, recording cost and reconditioning, setting and adjusting the price, photographing it, describing it, publishing it wherever buyers look, and retiring it the day it sells. Most of that lives in a dealer management system or an inventory platform, and most dealers already run one well.

The part that is not solved by the DMS is the last mile. A DMS is a system of record — it is very good at knowing what is true about a car. It is not a system of distribution. Getting the record onto the dealer website is usually handled by the website provider; getting it onto paid portals is handled by syndication feeds. Getting it onto Facebook Marketplace, and keeping it right there, is handled by a person with a phone — or by nothing.

## Two jobs, two kinds of software

It helps to name which job a tool does. AutoLander does the second one, for one channel. It is not a DMS, does not replace one, and reads from the one you have.

|  | System of record (DMS / IMS) | Distribution (merchandising) |
| --- | --- | --- |
| The job | Know what is true about every unit | Put that truth in front of buyers and keep it true |
| Examples | vAuto, DealerCenter, CDK, Tekion, Frazer, HomeNet, Dealertrack | Website provider feeds, portal syndication, AutoLander for Facebook Marketplace |
| Owns | Cost, price, mileage, photos, status, deal | Listings, price sync, sold-unit removal, photo presentation |
| Fails when | Data is entered wrong | Data is right in the DMS and wrong on the channel |
| Who notices | Accounting, the desk | The buyer — usually by messaging about a sold car |

_Vendors listed as examples are named for orientation only; AutoLander connects to several of them via a feed or export and has no other relationship with any of them. See integrations._

## Where distribution breaks

Every one of these is a case where the DMS was right and the buyer saw something else. They are the reason "inventory management" is a distribution problem as much as a record-keeping one:

- The price moved in the DMS on Tuesday. The website updated overnight. Marketplace still shows Monday’s number on Friday, because the person who posted it is off and nobody else knows which listings are theirs.
- The unit sold Saturday. The DMS knows. The Marketplace listing is live until someone remembers, and three buyers message about it on Sunday.
- A new arrival stocked in with eight photos and a price. It reaches the website automatically. It never reaches Marketplace at all, because posting it is a fifteen-minute manual job and there are forty of them.
- The salesperson who posted a third of the lot left. Their listings are now on an account nobody at the store can reach, showing prices nobody at the store controls.
- Twelve listings carry the lot photo with the dumpster in frame, because the studio shots are in the DMS and the phone that posted them had the originals.

## Keeping the Marketplace leg current

The fix is the same one the website provider already applies to the website: treat the DMS as the source, and have software reconcile the channel against it on a schedule. This is what AutoLander does for Facebook Marketplace.

1. **Point it at the source you already run** — A CarGurus or Cars.com feed, a DMS export from vAuto, DealerCenter, CDK, Tekion, Frazer or HomeNet, an SFTP or CSV drop, or the dealer website itself. No re-keying, no second system of record.
2. **Let it build the queue** — Eligible units become Marketplace listings with year, make, model, mileage, price, photos and description filled from the feed. The auto poster works the queue at a pace you set, inside the account’s limits.
3. **Reconcile on a schedule** — The feed is re-read; price changes push to the live listing, sold units come down, new arrivals queue. The inventory sync page covers the cadence and what "sold" means to the feed.
4. **Present it properly** — Studio-grade photos from the AI photo editor, the right category for the unit, and no invented facts: unknown mileage stays blank rather than guessed.

## Does a dealer need Marketplace-specific inventory software?

Only if Marketplace matters to the store. For a dealer who posts two cars a month from a personal profile, no. For a dealer who wants the whole lot on the channel where local buyers message first — and wants it to stay accurate without a salesperson’s afternoon every day — yes, because nothing in the DMS or the website stack does that job.

The test is simple: pick five listings on your Marketplace right now and check them against the DMS. If the prices match and none of them sold last week, you do not need this. If they do not, the problem is distribution, and it will not fix itself.

## What AutoLander is not

It is not a DMS, an IMS, a pricing tool or a CRM, and it does not replace any of them. It reads the inventory you already manage and keeps one channel — Facebook Marketplace — matched to it. It also does not message buyers or touch your inbox; here is why.

## Frequently asked questions

### What is the difference between a DMS and dealer inventory management software?

A DMS is the dealership’s system of record — deals, accounting, inventory, service. Inventory management software usually means the merchandising layer on top: pricing, photos, descriptions and getting units published. Distribution — keeping each channel current — is the piece most often left to a person. AutoLander covers distribution for Facebook Marketplace only.

### Does AutoLander replace vAuto, DealerCenter, CDK or Tekion?

No. AutoLander connects to inventory from those systems through a feed or export and posts it to Facebook Marketplace. The DMS stays the source of truth for every field; AutoLander reads it and never writes back.

### How do I keep Facebook Marketplace listings in sync with my inventory?

Treat the DMS or feed as the source and have software reconcile Marketplace against it on a schedule: price changes pushed to the live listing, sold units removed, new arrivals queued. That is the job AutoLander does; it re-reads the feed and keeps the channel matched to the lot.

### Which inventory sources does AutoLander read?

CarGurus and Cars.com directly; vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK and Tekion via a custom feed or export; SFTP and CSV drops; and most dealer websites. Details for each are on the integrations page.

### What does dealer inventory management software cost?

DMS and IMS pricing is set by those vendors and usually quoted. AutoLander, which handles only the Marketplace distribution leg, publishes its pricing: Starter $39, Growth $59, Pro $79 and Dealer plans from $117 per month, with 5 free posts and no credit card to start.

## Related

- [Facebook Marketplace inventory sync & feed](https://autolander.ai/facebook-marketplace-inventory-sync/)
- [Facebook Marketplace integrations & DMS feeds](https://autolander.ai/integrations/)
- [Facebook Marketplace auto poster for car dealers](https://autolander.ai/facebook-marketplace-auto-poster/)
- [Bulk post cars to Facebook Marketplace](https://autolander.ai/bulk-post-cars-to-facebook-marketplace/)
- [Facebook Marketplace listing software & tools](https://autolander.ai/facebook-marketplace-listing-software/)
- [Facebook Marketplace for car dealers](https://autolander.ai/facebook-marketplace-for-car-dealers/)
- [Facebook Marketplace Used-Car Report 2026 (original data)](https://autolander.ai/facebook-marketplace-used-car-report-2026/)
- [Facebook Marketplace auto poster pricing](https://autolander.ai/facebook-marketplace-auto-poster-pricing/)

---
AutoLander — Facebook Marketplace software for car dealers. https://autolander.ai/
