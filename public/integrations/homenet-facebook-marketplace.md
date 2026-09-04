# HomeNet to Facebook Marketplace via custom feed/export

> HomeNet to Facebook Marketplace via custom feed/export. Prepare listings, enhance photos and remove sold cars. From $39/mo with 5 free posts.

Source: https://autolander.ai/integrations/homenet-facebook-marketplace/  
Author: The AutoLander team  
Updated: September 3, 2026

**Short answer:** AutoLander does not have a one-click native HomeNet integration. Instead it connects through a dealer-authorized custom feed/export, AutoLander reads that output, and it prepares and syncs eligible vehicles on Facebook Marketplace — with AI photos, walkaround video and automatic sold-removal. Plans from $39/mo.

## Can AutoLander post my HomeNet inventory to Facebook Marketplace?

Yes — but to be clear about how: AutoLander does not have a one-click native HomeNet integration. HomeNet stays your system of record, and you give AutoLander a custom dealer-authorized feed/export of that inventory. AutoLander reads the HomeNet syndication feed or export, builds a configurable queue of eligible Marketplace listings, and keeps them in sync as inventory and prices change. Meta account eligibility and listing limits still apply.

AutoLander runs as a native desktop app, so it posts through your normal Facebook session on your own machine rather than a shared cloud server.

_AutoLander’s AI Photo Studio: a raw dealer lot photo of a 2025 Toyota Tacoma (left) becomes a showroom-grade Facebook Marketplace listing (right), automatically._

## What is HomeNet?

HomeNet (a Cox Automotive product) is inventory-management and syndication software that pushes dealer inventory out to third-party shopping sites.

## Connection reality

AutoLander does not have a one-click native HomeNet integration. HomeNet has a documented export request for website and marketplace destinations, with recipient-defined file and delivery settings.

## HomeNet export choices that matter

HomeNet publicly documents the transport and formatting decisions for an outbound feed.

- HomeNet’s export request supports CSV, TSV and pipe-delimited files, optional headers, new/used vehicle selection and zipped or unzipped delivery. Review the official export request.
- Photo URLs can be appended to the inventory file at original resolution or resized. Preserve the source resolution AutoLander needs before HomeNet builds the recurring export.
- The form supports FTP delivery and either combined or separate dealer files/accounts. It also warns that custom template work may carry added fees, so settle the specification first.

## HomeNet limitation to plan for

HomeNet package scope varies. Its EULA distinguishes single- versus multi-destination products and says near-real-time updates are an Overdrive feature; do not assume every subscription has the same cadence. See HomeNet’s IOL terms.

## How HomeNet connects to AutoLander

HomeNet exports are configured for a named destination. Agree on AutoLander’s accepted file and delivery requirements before requesting the HomeNet output.

1. **Agree on the HomeNet export specification** — Confirm new/used scope, CSV/TSV/pipe-delimited format, headers, photo URL handling and whether the receiver expects one dealer file or a multi-dealer layout.
2. **Authorize FTP delivery and test it** — Coordinate the dealer, HomeNet and AutoLander details for the destination FTP location, then validate a sample file and photo URLs before enabling recurring delivery.
3. **It manages eligible listings and keeps them in sync** — AutoLander works through eligible vehicles with a configurable queue, refreshes listings as prices change, and removes sold units during reconciliation after your feed marks them gone. Meta account eligibility and listing limits still apply. See how the Facebook Marketplace inventory sync works.

## What AutoLander adds on top of your HomeNet data

HomeNet tells AutoLander what is on the lot. AutoLander turns that raw data into high-performing Marketplace listings.

### AI Photo Studio

Replaces messy lot backgrounds with clean showroom backdrops, so every listing looks like a professional shoot instead of a phone snap.

### AI walkaround video

Generates a short walkaround video for each vehicle — Marketplace and buyers favor video over static photos.

### Automatic sold-removal

When your HomeNet feed marks a unit sold, AutoLander removes the matching Marketplace listing during reconciliation, reducing stale-listing inquiries.

### Post-to-sale attribution

Tracks which Marketplace posts led to actual vehicle sales — not just clicks, views or messages.

## Frequently asked questions

### Does AutoLander have a native HomeNet integration?

No. AutoLander does not offer a one-click native HomeNet integration. The connection works through a dealer-authorized custom feed/export from HomeNet or an existing inventory-syndication provider. AutoLander reads that approved output to prepare and sync eligible Marketplace listings.

### How does the HomeNet connection work?

The dealer authorizes a HomeNet syndication feed or export from HomeNet or an existing syndication provider. You point AutoLander at that approved output, your vehicles load, and AutoLander prepares eligible Marketplace listings and keeps them in sync. Meta’s account limits still apply. See how ongoing inventory sync works.

### Which file formats can HomeNet send?

HomeNet’s export request lists CSV, TSV and pipe-delimited inventory files, with optional field headers, photo URLs, ZIP packaging and FTP delivery. Customization may add cost. See HomeNet’s export specification form.

### How much does it cost to post HomeNet inventory to Facebook Marketplace?

AutoLander publishes self-serve plans from $39/mo with 5 free posts to start and no credit card required. The same pricing applies however you connect — see all integration options on the Facebook Marketplace integrations page.

### What if I use a different system than HomeNet?

AutoLander's verified feed support is CarGurus, Cars.com and custom feeds/exports. Another system may connect if its provider can produce a dealer-authorized export in a supported format. Confirm the format and delivery method before buying; see the integrations hub.

## Related

- [Frazer to Facebook Marketplace](https://autolander.ai/integrations/frazer-facebook-marketplace/)
- [CDK to Facebook Marketplace](https://autolander.ai/integrations/cdk-facebook-marketplace/)
- [Tekion to Facebook Marketplace](https://autolander.ai/integrations/tekion-facebook-marketplace/)
- [Facebook Marketplace integrations & DMS feeds](https://autolander.ai/integrations/)
- [Facebook Marketplace inventory sync & feed](https://autolander.ai/facebook-marketplace-inventory-sync/)
- [Bulk post cars to Facebook Marketplace](https://autolander.ai/bulk-post-cars-to-facebook-marketplace/)
- [Facebook Marketplace auto poster for car dealers](https://autolander.ai/facebook-marketplace-auto-poster/)
- [Best Facebook Marketplace auto-posting tools (2026 comparison)](https://autolander.ai/compare/)
- [Facebook Marketplace auto poster pricing](https://autolander.ai/facebook-marketplace-auto-poster-pricing/)

---
AutoLander — Facebook Marketplace software for car dealers. https://autolander.ai/
