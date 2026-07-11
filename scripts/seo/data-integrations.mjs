// INTEGRATIONS silo — hub + one spoke per inventory/DMS/feed system in INTEGRATIONS.
// Primary intent: "{System} to Facebook Marketplace" / "{System} facebook marketplace integration".
// Hub owns "dms facebook marketplace integration" and routes authority to the 9 spokes.
//
// HONESTY CONTRACT (see registry INTEGRATIONS.system):
//   • system:'feed'   (CarGurus, Cars.com) -> AutoLander reads that feed DIRECTLY (supported source).
//   • system:'custom' (vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, Tekion)
//       -> custom feed/export workflow ONLY. Each such page MUST state plainly that AutoLander has
//          NO one-click native integration with that system. Never imply one exists.
// AutoLander is a native desktop app; verified feed support is "CarGurus, Cars.com & custom feeds/exports".
//
// Declarative page objects only — no HTML (see scripts/seo/shell.mjs PAGE OBJECT CONTRACT).

import {
  SITE,
  NAV,
  INTEGRATIONS,
  integrationPath,
  relatedFor,
  siblingSpokes,
} from './registry.mjs';

const HUB_PATH = NAV.integHub.path; // '/integrations/'
const INVENTORY_PATH = NAV.inventory.path; // '/facebook-marketplace-inventory-sync/'

// ---------------------------------------------------------------------------
// Per-system editorial copy. Keeps each spoke genuinely useful and distinct
// instead of templated boilerplate. Keyed by slug.
//   blurb/setup fields are grounded in each provider's official public documentation.
//   Exact availability still depends on the dealer's subscription, permissions and vendor approval.
// ---------------------------------------------------------------------------
const COPY = {
  'cargurus-facebook-marketplace': {
    blurb:
      'CarGurus is an automotive shopping marketplace. Its dealer onboarding materials tell dealers to '
      + 'manage inventory through the Dealer Dashboard and their inventory-management system (IMS), '
      + 'including photos, trim and options.',
    feedNoun: 'CarGurus inventory feed',
    note:
      'CarGurus is a directly supported AutoLander source. CarGurus account configuration remains separate: '
      + 'AutoLander does not change your Dealer Dashboard settings, listing package or dealer-fee disclosure.',
    connectIntro:
      'Start with the same CarGurus inventory source your dealership already maintains, then verify that '
      + 'the source is complete before AutoLander reads it.',
    firstStep: {
      title: 'Audit the CarGurus source inventory',
      body: 'Confirm each active VIN has the intended price, mileage, trim, options and at least one usable '
        + 'photo in your IMS or CarGurus Dealer Dashboard.',
    },
    secondStep: {
      title: 'Connect the supported feed to AutoLander',
      body: 'Provide the existing CarGurus inventory-feed source through the AutoLander onboarding flow, '
        + 'then compare several loaded VINs against the Dealer Dashboard before posting.',
    },
    setupHeading: 'CarGurus-specific checks before posting',
    setupIntro: 'CarGurus has dealer-side requirements that are separate from AutoLander.',
    setupItems: [
      'CarGurus tells dealers to keep photos, trim and options current in the Dealer Dashboard and their IMS. '
        + 'Review those fields before handing the feed to AutoLander. '
        + '[See CarGurus dealer onboarding](https://products.cargurus.com/welcome-to-cargurus).',
      'CarGurus says an all-in price in the inventory feed does not replace its Dealer Fee Setup step. Dealers '
        + 'must still confirm their fee configuration in the Dashboard. '
        + '[Read the official fee-transparency guidance](https://dealers.cargurus.com/blog/fee-transparency-update).',
      'After connection, spot-check at least one new arrival, one price change and one sold unit. The feed '
        + 'must reflect each change before AutoLander can mirror it to Marketplace.',
    ],
    limitation:
      'Supported feed does not mean shared account administration. AutoLander reads dealership inventory data; '
      + 'your team remains responsible for CarGurus package, pricing, fee and merchandising settings.',
    sourceFaq: [
      'Does an all-in price in my CarGurus feed finish the dealer-fee setup?',
      'No. CarGurus says dealers sending all-in prices must still use Dealer Fee Setup and confirm that fees are '
        + 'included in the inventory feed. AutoLander cannot make that dealer-account selection for you. '
        + '[CarGurus explains the requirement here](https://dealers.cargurus.com/blog/fee-transparency-update).',
    ],
  },
  'cars-com-facebook-marketplace': {
    blurb:
      'Cars.com is an automotive shopping marketplace whose dealer products publish full dealership '
      + 'inventory with pricing, photos, seller notes and vehicle status supplied by the dealer.',
    feedNoun: 'Cars.com inventory feed',
    note:
      'Cars.com is a directly supported AutoLander source. Cars.com listing-policy compliance still belongs '
      + 'to the dealership; AutoLander does not rewrite your Cars.com account or package settings.',
    connectIntro:
      'Use the current Cars.com inventory source, but check it against Cars.com pricing and availability '
      + 'rules before you let the same data drive Marketplace posts.',
    firstStep: {
      title: 'Clean the Cars.com inventory source',
      body: 'Verify each vehicle has an actual all-in list price, current availability, accurate identifiers '
        + 'and the photo set you want buyers to see.',
    },
    secondStep: {
      title: 'Connect and sample the supported feed',
      body: 'Connect the Cars.com inventory feed in AutoLander, then compare several VINs, prices and photo '
        + 'orders against your Cars.com inventory before enabling posting.',
    },
    setupHeading: 'Cars.com-specific feed checks',
    setupIntro: 'Cars.com publishes concrete rules for price, availability and merchandising.',
    setupItems: [
      'Cars.com requires a real total vehicle list price and prohibits $0, “contact for price” and conditional '
        + 'pricing in dealer listings. Use the compliant source price you actually want syndicated. '
        + '[Read the vehicle-listing policy](https://www.carscommerce.inc/marketplace/vehicle-listing-policy/).',
      'Cars.com requires dealers to promptly remove sold, unavailable, reserved or pending vehicles from the '
        + 'listing feed. That status discipline is what lets AutoLander remove Marketplace posts reliably. '
        + '[Review the availability rule](https://www.carscommerce.inc/marketplace/vehicle-listing-policy/).',
      'Cars.com supports up to 99 photos for used vehicles and 32 for new vehicles. Choose and order the source '
        + 'photos deliberately before AutoLander processes them. '
        + '[See Cars.com merchandising guidance](https://www.carscommerce.inc/marketplace/merchandising/).',
    ],
    limitation:
      'AutoLander can mirror only what the Cars.com feed reports. A stale status, conditional price or weak '
      + 'photo order should be corrected in the inventory source first.',
    sourceFaq: [
      'Which Cars.com status changes matter to AutoLander?',
      'Cars.com specifically calls out sold, unavailable, reserved and pending vehicles as statuses dealers '
        + 'must remove promptly from the listing feed. Keep those states accurate so AutoLander can remove '
        + 'matching Marketplace listings. [See the official policy](https://www.carscommerce.inc/marketplace/vehicle-listing-policy/).',
    ],
  },
  'vauto-facebook-marketplace': {
    blurb:
      'vAuto (a Cox Automotive product) is inventory-management and merchandising software dealers use '
      + 'to appraise, price and stage used vehicles.',
    feedNoun: 'vAuto inventory export or feed file',
    note:
      'AutoLander does not have a one-click native vAuto integration. vAuto publicly documents third-party '
      + 'listing syndication, but not a universal self-serve download or open feed specification.',
    connectIntro:
      'Identify the dealer-authorized syndication route in your vAuto setup first. The exact outbound feed '
      + 'depends on the products and permissions on the dealership account.',
    firstStep: {
      title: 'Identify the vAuto merchandising source',
      body: 'Confirm whether Provision/vAuto Merchandising or an existing website syndication feed owns the '
        + 'final price, photos and listing content for your store.',
    },
    secondStep: {
      title: 'Request an authorized outbound handoff',
      body: 'Ask your vAuto/Cox account contact or current feed provider for a dealer-approved outbound feed '
        + 'that AutoLander can ingest; do not scrape the vAuto interface.',
    },
    setupHeading: 'What to verify in a vAuto handoff',
    setupIntro: 'vAuto syndication is product- and account-specific, so confirm the actual source of truth.',
    setupItems: [
      'vAuto says Provision supports automated listing syndication and photo management. Confirm that the '
        + 'price and photo version in that workflow is the version you intend to send. '
        + '[See Provision details](https://www.vauto.com/products/provision/).',
      'vAuto Merchandising can organize photos, update listings and syndicate inventory to third-party sites. '
        + 'Use an approved content-export or syndication function rather than a screen scrape. '
        + '[See vAuto Merchandising](https://www.vauto.com/products/merchandising/).',
      'Test the outbound data with a small VIN sample: active status, retail price, mileage, trim, comments and '
        + 'photo URLs/order should agree with the dealership’s intended listing.',
    ],
    limitation:
      'vAuto’s public materials do not publish a generic CSV/SFTP schema, delivery cadence or open-vendor '
      + 'onboarding path. Availability and approval must be confirmed for the dealership’s products and account.',
    sourceFaq: [
      'Can I download a generic vAuto CSV for AutoLander?',
      'Do not assume so. vAuto advertises third-party listing syndication and product-specific content export, '
        + 'but its public product pages do not document a universal CSV, SFTP or public API workflow. Ask the '
        + 'dealership’s vAuto/Cox contact for an approved outbound feed. '
        + '[Review vAuto’s merchandising documentation](https://www.vauto.com/products/merchandising/).',
    ],
  },
  'dealercenter-facebook-marketplace': {
    blurb:
      'DealerCenter is a popular all-in-one dealer management system (DMS) for independent and BHPH '
      + 'dealers, covering inventory, desking, F&I and CRM.',
    feedNoun: 'DealerCenter inventory export or syndication feed',
    note:
      'AutoLander does not have a one-click native DealerCenter integration. DealerCenter documents '
      + 'listing import/export and third-party advertising exports, but does not publish a generic open '
      + 'feed specification for AutoLander.',
    connectIntro:
      'Confirm which DealerCenter digital-marketing or website export your store is entitled to use, then '
      + 'request a feed that can be handed to AutoLander.',
    firstStep: {
      title: 'Confirm DealerCenter export access',
      body: 'Check whether the account has Online Ad Posting, third-party listings or a dealer-website feed '
        + 'that already exports the active inventory and photos.',
    },
    secondStep: {
      title: 'Request the approved inventory output',
      body: 'Work with DealerCenter support or the existing website/feed vendor to provide the authorized '
        + 'file or endpoint, then test several VINs before connecting it to AutoLander.',
    },
    setupHeading: 'DealerCenter-specific setup checks',
    setupIntro: 'DealerCenter has several advertising paths; use the one attached to your account.',
    setupItems: [
      'DealerCenter’s official overview says its inventory tools can import/export listings and automatically '
        + 'export inventory to third-party advertising sites. Confirm which export is active for your store. '
        + '[See the DealerCenter solution overview](https://support.dealercenter.net/hc/en-us/articles/209111226-Explore-the-DealerCenter-Solution-A-Complete-Overview-for-Your-Dealership).',
      'DealerCenter’s support catalog lists its own Facebook Marketplace Auto-Uploader. That is a separate '
        + 'DealerCenter workflow and is not evidence of a native DealerCenter-to-AutoLander integration. '
        + '[See DealerCenter digital-marketing support](https://support.dealercenter.net/hc/en-us/sections/200312179-Digital-Marketing-Custom-Websites).',
      'Before onboarding, verify that the approved output includes active/sold status, VIN or stock number, '
        + 'year/make/model, price, mileage, comments and usable photo URLs.',
    ],
    limitation:
      'DealerCenter’s public support pages do not provide an open export schema, transport method or guarantee '
      + 'that an arbitrary destination is enabled. DealerCenter or the current feed vendor must authorize it.',
    sourceFaq: [
      'Is DealerCenter’s Facebook uploader the same as AutoLander?',
      'No. DealerCenter lists its own Facebook Marketplace Auto-Uploader in its digital-marketing support '
        + 'catalog. AutoLander is separate and has no one-click DealerCenter plugin; it requires an approved '
        + 'inventory feed/export. [See DealerCenter support](https://support.dealercenter.net/hc/en-us/sections/200312179-Digital-Marketing-Custom-Websites).',
    ],
  },
  'dealer-com-facebook-marketplace': {
    blurb:
      'Dealer.com (a Cox Automotive product) is a dealer website platform that publishes your inventory '
      + 'online and powers your retail storefront.',
    feedNoun: 'Dealer.com inventory feed or export',
    note:
      'AutoLander does not have a one-click native Dealer.com integration. Dealer.com supports outbound '
      + 'inventory-feed requests, but the third party and request must go through Dealer.com’s authorized '
      + 'inventory/partner process.',
    connectIntro:
      'Dealer.com has a documented request path for feeds sent “From Dealer.com (to 3rd Party).” The dealer '
      + 'and receiving provider need to supply the required account and feed details.',
    firstStep: {
      title: 'Open an outbound inventory request',
      body: 'Use Dealer.com’s official 3rd Party Inventory Request and identify the dealership, Dealer.com '
        + 'account, third-party contact and that the feed travels from Dealer.com.',
    },
    secondStep: {
      title: 'Define the feed scope and examples',
      body: 'Specify new and/or used inventory plus all data, prices, images and comments as needed. Include '
        + 'sample stock numbers when diagnosing missing or incorrect vehicles.',
    },
    setupHeading: 'What Dealer.com asks for',
    setupIntro: 'The official request form makes this workflow more structured than a generic CSV handoff.',
    setupItems: [
      'Dealer.com’s inventory form supports new feeds and exports, replacements and filters. It asks whether '
        + 'the feed runs to or from Dealer.com and records a provider ID or filename when applicable. '
        + '[Open the official inventory request form](https://www.dealer.com/support/inventory/).',
      'The request identifies new versus used inventory and whether the payload supplies all data, prices, '
        + 'images or comments. Agree on that scope with AutoLander before Dealer.com builds the export.',
      'Dealer.com says third-party vendors must participate in its Integrated Partner Program. A request may '
        + 'therefore require provider enrollment or approval; AutoLander is not presented here as an existing '
        + 'Dealer.com partner. [See the partner requirement](https://forms.dealer.com/integrated-partner-program.htm).',
    ],
    limitation:
      'Dealer.com does not publicly guarantee format, transport, timing or approval for every destination. '
      + 'Inventory/pricing configuration changes can also require dealer approval.',
    sourceFaq: [
      'What information is needed for a Dealer.com export request?',
      'Dealer.com asks for the dealership and DDC account, dealership URL, third-party contact, feed direction, '
        + 'new/used condition, requested data scope and provider ID/filename when available. '
        + '[See the official request form](https://www.dealer.com/support/inventory/).',
    ],
  },
  'homenet-facebook-marketplace': {
    blurb:
      'HomeNet (a Cox Automotive product) is inventory-management and syndication software that pushes '
      + 'dealer inventory out to third-party shopping sites.',
    feedNoun: 'HomeNet syndication feed or export',
    note:
      'AutoLander does not have a one-click native HomeNet integration. HomeNet has a documented export '
      + 'request for website and marketplace destinations, with recipient-defined file and delivery settings.',
    connectIntro:
      'HomeNet exports are configured for a named destination. Agree on AutoLander’s accepted file and '
      + 'delivery requirements before requesting the HomeNet output.',
    firstStep: {
      title: 'Agree on the HomeNet export specification',
      body: 'Confirm new/used scope, CSV/TSV/pipe-delimited format, headers, photo URL handling and whether '
        + 'the receiver expects one dealer file or a multi-dealer layout.',
    },
    secondStep: {
      title: 'Authorize FTP delivery and test it',
      body: 'Coordinate the dealer, HomeNet and AutoLander details for the destination FTP location, then '
        + 'validate a sample file and photo URLs before enabling recurring delivery.',
    },
    setupHeading: 'HomeNet export choices that matter',
    setupIntro: 'HomeNet publicly documents the transport and formatting decisions for an outbound feed.',
    setupItems: [
      'HomeNet’s export request supports CSV, TSV and pipe-delimited files, optional headers, new/used vehicle '
        + 'selection and zipped or unzipped delivery. '
        + '[Review the official export request](https://www.homenetauto.com/vfsr/).',
      'Photo URLs can be appended to the inventory file at original resolution or resized. Preserve the source '
        + 'resolution AutoLander needs before HomeNet builds the recurring export.',
      'The form supports FTP delivery and either combined or separate dealer files/accounts. It also warns that '
        + 'custom template work may carry added fees, so settle the specification first.',
    ],
    limitation:
      'HomeNet package scope varies. Its EULA distinguishes single- versus multi-destination products and says '
      + 'near-real-time updates are an Overdrive feature; do not assume every subscription has the same cadence. '
      + '[See HomeNet’s IOL terms](https://www.homenetauto.com/eula/).',
    sourceFaq: [
      'Which file formats can HomeNet send?',
      'HomeNet’s export request lists CSV, TSV and pipe-delimited inventory files, with optional field headers, '
        + 'photo URLs, ZIP packaging and FTP delivery. Customization may add cost. '
        + '[See HomeNet’s export specification form](https://www.homenetauto.com/vfsr/).',
    ],
  },
  'frazer-facebook-marketplace': {
    blurb:
      'Frazer is a long-running, widely used dealer management system (DMS) for independent used-car '
      + 'dealers, handling inventory, accounting and deals.',
    feedNoun: 'Frazer inventory export or feed file',
    note:
      'AutoLander does not have a one-click native Frazer integration. Frazer documents both configurable '
      + 'CSV/TXT exports and vendor uploads over FTP/SFTP, so the correct route depends on whether a recurring '
      + 'vendor destination has been approved.',
    connectIntro:
      'Choose between a manual/custom data export and Frazer’s recurring Vehicle Uploads workflow. Do not '
      + 'assume AutoLander already appears in Frazer’s configured vendor list.',
    firstStep: {
      title: 'Choose a Frazer export route',
      body: 'For a file handoff, create a CSV or tab-delimited TXT export with the required inventory fields. '
        + 'For recurring delivery, ask whether a Vehicle Upload destination can be configured.',
    },
    secondStep: {
      title: 'Map fields, photos and delivery',
      body: 'Confirm the vehicle-selection flag, field headers, price, status and photo delivery, then test '
        + 'the resulting file or FTP/SFTP upload with AutoLander.',
    },
    setupHeading: 'Frazer-specific export paths',
    setupIntro: 'Frazer’s own help manual documents two materially different ways to get data out.',
    setupItems: [
      'Frazer’s Export Data tool can create CSV or tab-delimited TXT files with dealer-selected fields and '
        + 'saved presets. That can support a controlled file handoff when recurring vendor upload is unavailable. '
        + '[See Frazer Export Data](https://www.frazerhelp.com/help-manual/exportdata.htm).',
      'Frazer Vehicle Uploads takes an inventory snapshot, converts it to CSV/TXT and sends data—often with '
        + 'photos—over FTP or SFTP to configured vendors. '
        + '[Read Frazer’s upload architecture](https://www.frazerhelp.com/help-manual/technical-details-and-custom-u.htm).',
      'Frazer says scheduled uploads require the main computer to remain on, and unlisted vendors must use its '
        + 'partner process. Confirm destination approval before promising a hands-off recurring feed. '
        + '[See Vehicle Upload setup](https://www.frazerhelp.com/help-manual/vehicle_uploads.htm).',
    ],
    limitation:
      'A manual CSV/TXT export is not automatically a live sync, while a recurring vendor upload requires '
      + 'configuration and potentially Frazer partner onboarding. AutoLander is not claimed as a native Frazer vendor.',
    sourceFaq: [
      'Can Frazer send a recurring inventory file?',
      'Yes, for configured upload vendors. Frazer documents scheduled CSV/TXT inventory snapshots delivered by '
        + 'FTP/SFTP, often with photos. Its desktop workflow requires the main computer to stay on, and an '
        + 'unlisted vendor may need partner setup. [See Frazer’s official guide](https://www.frazerhelp.com/help-manual/vehicle_uploads.htm).',
    ],
  },
  'cdk-facebook-marketplace': {
    blurb:
      'CDK Global is an enterprise dealer management system (DMS) used by franchise and larger dealer '
      + 'groups to run inventory, F&I, service and accounting.',
    feedNoun: 'CDK inventory export or syndication feed',
    note:
      'AutoLander does not have a one-click native CDK integration. CDK offers secure data-export tools, '
      + 'but their raw DMS output requires authorization, technical mapping and secure delivery—it is not '
      + 'automatically a Marketplace-ready feed.',
    connectIntro:
      'First determine whether the dealership already has a vehicle-only website/syndication feed. If not, '
      + 'CDK’s own export tools require a deliberately scoped technical implementation.',
    firstStep: {
      title: 'Choose an existing feed or CDK export',
      body: 'Prefer an approved vehicle-inventory feed already used by the dealer website when available. '
        + 'Otherwise scope the CDK Data Export Tool to the smallest required vehicle dataset.',
    },
    secondStep: {
      title: 'Secure and map the CDK delivery',
      body: 'Arrange the authorized SFTP/PGP delivery and map CDK fields into AutoLander’s inventory format. '
        + 'Test a single rooftop and a small VIN sample before expanding.',
    },
    setupHeading: 'What a CDK export actually requires',
    setupIntro: 'CDK’s official data tools are powerful, but they are intended for technical implementations.',
    setupItems: [
      'CDK’s Data Export Tool schedules predefined datasets to SFTP, uses PGP encryption and MFA, and can '
        + 'share dealership data with chosen partners. '
        + '[See CDK Data Export tools](https://www2.cdkglobal.com/data-your-way).',
      'CDK says the export path requires knowledge of its file structure and dealership operations plus an '
        + 'in-house data warehouse. Confirm AutoLander accepts the mapped vehicle-only output before provisioning '
        + 'a broad DMS dataset.',
      'CDK’s Export/Import option uses legacy API packages, including Vehicle data, and requires SOAP API '
        + 'expertise. That is a developer integration—not a one-click dealer setting.',
    ],
    limitation:
      'A CDK license or data tool does not prove a native AutoLander connection. Exact fields, cadence, '
      + 'security, partner authorization and mapping remain implementation-specific.',
    sourceFaq: [
      'Is a CDK Data Export ready to load directly into AutoLander?',
      'Not automatically. CDK describes secure, broad DMS datasets delivered to SFTP and says implementers need '
        + 'file-structure knowledge and a data warehouse. A vehicle-only subset must be authorized, mapped and '
        + 'tested for AutoLander. [Read CDK’s technical overview](https://www2.cdkglobal.com/data-your-way).',
    ],
  },
  'tekion-facebook-marketplace': {
    blurb:
      'Tekion is a modern, cloud-native dealer management system (DMS) used by franchise dealers to run '
      + 'the store from inventory through service on a single platform.',
    feedNoun: 'Tekion inventory export or syndication feed',
    note:
      'AutoLander does not have a one-click native Tekion integration. Tekion’s public integration route is '
      + 'Automotive Partner Cloud (APC), where API/webhook access is controlled by partner enrollment and dealer '
      + 'authorization—not an open anonymous feed.',
    connectIntro:
      'Ask the dealership which Tekion-authorized export, website feed or syndication partner already has '
      + 'permission to access inventory. Do not treat APC as a public API key you can simply copy.',
    firstStep: {
      title: 'Identify an authorized Tekion data path',
      body: 'Confirm whether the dealer already sends inventory to a website or syndication provider. If not, '
        + 'the receiving provider needs to evaluate Tekion APC enrollment and dealer authorization.',
    },
    secondStep: {
      title: 'Define scope and update behavior',
      body: 'Request only the vehicle fields, statuses and media AutoLander needs, then verify whether changes '
        + 'arrive by file, API or webhook and how failures are surfaced.',
    },
    setupHeading: 'Tekion access and approval checks',
    setupIntro: 'Tekion emphasizes partner APIs, webhooks and dealer-controlled access rather than a generic feed.',
    setupItems: [
      'Tekion says Automotive Partner Cloud gives registered partners secure access to dealership data through '
        + 'familiar APIs and self-service tooling. Partner registration is part of the workflow. '
        + '[See Tekion APC](https://tekion.com/products/apc).',
      'APC advertises real-time synchronization through APIs and webhooks, but that capability applies to an '
        + 'approved implementation; it does not establish a native AutoLander integration.',
      'Before build-out, document dealer authorization, accessible inventory endpoints/fields, update cadence, '
        + 'revocation and who owns support when a vehicle or photo stops syncing.',
    ],
    limitation:
      'Tekion’s public APC page does not publish a generic downloadable inventory file, open endpoint list or '
      + 'guaranteed access for an arbitrary vendor. Enrollment and data access must be confirmed.',
    sourceFaq: [
      'Can any dealership vendor call Tekion inventory APIs?',
      'Not by default. Tekion presents API and webhook access through Automotive Partner Cloud, which includes '
        + 'partner registration and dealer-controlled access. AutoLander is not claimed here as an existing '
        + 'Tekion partner. [See Tekion’s partner platform](https://tekion.com/products/apc).',
    ],
  },
};

// ---- AI Photo Studio before/after pool — one distinct vehicle per spoke ----
const STUDIO = [
  { slug: 'hyundai-sonata', vehicle: '2024 Hyundai Sonata' },
  { slug: 'nissan-kicks', vehicle: '2025 Nissan Kicks' },
  { slug: 'jeep-wrangler', vehicle: '2026 Jeep Wrangler' },
  { slug: 'tesla-model-y', vehicle: '2023 Tesla Model Y' },
  { slug: 'ford-expedition', vehicle: '2024 Ford Expedition' },
  { slug: 'toyota-tacoma', vehicle: '2025 Toyota Tacoma' },
  { slug: 'chevrolet-malibu', vehicle: '2022 Chevrolet Malibu' },
  { slug: 'jeep-renegade', vehicle: '2019 Jeep Renegade' },
  { slug: 'kia-k5', vehicle: '2022 Kia K5' },
];
function studioFigure(v) {
  return {
    type: 'figure',
    before: `/studio/${v.slug}-before.webp`,
    after: `/studio/${v.slug}-after.webp`,
    beforeAlt: `Raw dealership lot photo of a ${v.vehicle} before AutoLander`,
    afterAlt: `The same ${v.vehicle} as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio`,
    caption: `AutoLander’s AI Photo Studio: a raw dealer lot photo of a ${v.vehicle} (left) becomes a showroom-grade Facebook Marketplace listing (right), automatically.`,
  };
}

// ---------------------------------------------------------------------------
// Spoke builder — maps INTEGRATIONS so every spoke is consistent yet varied.
// ---------------------------------------------------------------------------
function buildSpoke(s, i) {
  const path = integrationPath(s.slug);
  const isFeed = s.system === 'feed';
  const c = COPY[s.slug];
  const feedNoun = c.feedNoun;

  // Honest "native integration?" answer, per connection type.
  const nativeAnswer = isFeed
    ? `AutoLander does not need a separate plugin for ${s.name} because ${s.name} is a directly `
      + `supported feed source. AutoLander reads your ${feedNoun} and loads those vehicles into its `
      + `Marketplace workflow — there is no one-click "app store" button or separate plugin to install.`
    : `No. AutoLander does not offer a one-click native ${s.name} integration. The connection works `
      + `through a dealer-authorized custom feed/export from ${s.name} or an existing inventory-syndication `
      + `provider. AutoLander reads that approved output to prepare and sync eligible Marketplace listings.`;

  // Title / H1 framing differs by connection type.
  const title = isFeed
    ? `Post ${s.name} Inventory to Facebook Marketplace | AutoLander`
    : `${s.name} to Facebook Marketplace | AutoLander`;
  const h1 = isFeed
    ? `Post your ${s.name} inventory to Facebook Marketplace`
    : `${s.name} to Facebook Marketplace via custom feed/export`;

  const description = isFeed
    ? `${s.name} to Facebook Marketplace: connect your supported inventory feed, manage eligible listings and `
      + `remove sold cars. From $${SITE.lowPrice}/mo with 5 free posts.`
    : `${s.name} to Facebook Marketplace via custom feed/export. Prepare listings, enhance photos and `
      + `remove sold cars. From $${SITE.lowPrice}/mo with 5 free posts.`;

  const tldr = isFeed
    ? `Yes — ${s.name} is a directly supported feed source. AutoLander reads your ${feedNoun}, builds a `
      + `configurable queue of eligible Marketplace listings, refreshes prices, and reconciles sold units. `
      + `It also upgrades listing assets with an AI Photo Studio, walkaround video and post-to-sale `
      + `attribution. Plans from $${SITE.lowPrice}/mo.`
    : `AutoLander does not have a one-click native ${s.name} integration. Instead it connects through a `
      + `dealer-authorized custom feed/export, AutoLander reads that output, and it `
      + `prepares and syncs eligible vehicles on Facebook Marketplace — with AI photos, walkaround video and `
      + `automatic sold-removal. Plans from $${SITE.lowPrice}/mo.`;

  const connectIntro = c.connectIntro || (isFeed
    ? `${s.name} is already a supported source, so connecting it is mostly pointing AutoLander at the feed `
      + `you have.`
    : `There is no native plugin — ${s.name} connects through a feed or export file.`);

  const sections = [
    {
      type: 'qa',
      q: `Can AutoLander post my ${s.name} inventory to Facebook Marketplace?`,
      a: isFeed
        ? [
            `Yes. ${s.name} is a directly supported feed source, so AutoLander can load your ${s.name} `
            + `inventory into a managed Marketplace workflow. AutoLander reads your ${feedNoun} — year, `
            + `make, model, price, mileage, photos and descriptions — and prepares eligible listings, then `
            + `keeps them current as your lot changes. Meta account eligibility and listing limits still apply.`,
            `Because AutoLander runs as a native desktop app on your own computer, it posts through your `
            + `normal Facebook session instead of a shared cloud server or a browser extension.`,
          ]
        : [
            `Yes — but to be clear about how: AutoLander does not have a one-click native ${s.name} `
            + `integration. ${s.name} stays your system of record, and you give AutoLander a custom `
            + `dealer-authorized feed/export of that inventory. AutoLander reads the ${feedNoun}, builds a `
            + `configurable queue of eligible Marketplace listings, and keeps them in sync as inventory and prices change. `
            + `Meta account eligibility and listing limits still apply.`,
            `AutoLander runs as a native desktop app, so it posts through your normal Facebook session on `
            + `your own machine rather than a shared cloud server.`,
          ],
    },
    {
      type: 'qa',
      q: `What is ${s.name}?`,
      a: c.blurb,
    },
    {
      type: 'callout',
      title: 'Connection reality',
      body: c.note,
    },
    {
      type: 'bullets',
      h2: c.setupHeading,
      intro: c.setupIntro,
      items: c.setupItems,
    },
    {
      type: 'callout',
      title: `${s.name} limitation to plan for`,
      body: c.limitation,
    },
    {
      type: 'steps',
      h2: `How ${s.name} connects to AutoLander`,
      intro: connectIntro,
      steps: [
        c.firstStep,
        c.secondStep,
        {
          title: 'It manages eligible listings and keeps them in sync',
          body: `AutoLander works through eligible vehicles with a configurable queue, refreshes listings as `
            + `prices change, and removes sold units during reconciliation after your feed marks them gone. Meta `
            + `account eligibility and listing limits still apply. See how the [Facebook Marketplace inventory sync](${INVENTORY_PATH}) works.`,
        },
      ],
    },
    {
      type: 'features',
      h2: `What AutoLander adds on top of your ${s.name} data`,
      intro: `${s.name} tells AutoLander what is on the lot. AutoLander turns that raw data into `
        + `high-performing Marketplace listings.`,
      cards: [
        {
          title: 'AI Photo Studio',
          body: 'Replaces messy lot backgrounds with clean showroom backdrops, so every listing looks '
            + 'like a professional shoot instead of a phone snap.',
        },
        {
          title: 'AI walkaround video',
          body: 'Generates a short walkaround video for each vehicle — Marketplace and buyers favor video '
            + 'over static photos.',
        },
        {
          title: 'Automatic sold-removal',
          body: `When your ${s.name} feed marks a unit sold, AutoLander removes the matching Marketplace `
            + `listing during reconciliation, reducing stale-listing inquiries.`,
        },
        {
          title: 'Post-to-sale attribution',
          body: 'Tracks which Marketplace posts led to actual vehicle sales — not just clicks, views or '
            + 'messages.',
        },
      ],
    },
  ];
  sections.splice(1, 0, studioFigure(STUDIO[i % STUDIO.length]));

  const faq = [
    [
      `Does AutoLander have a native ${s.name} integration?`,
      nativeAnswer,
    ],
    [
      `How does the ${s.name} connection work?`,
      isFeed
        ? `AutoLander reads your ${feedNoun} directly. You point AutoLander at the feed, your vehicles load `
          + `automatically, and AutoLander prepares eligible Marketplace listings and keeps them in sync as `
          + `prices and inventory change. Meta’s account limits still apply. See the [inventory-sync details](${INVENTORY_PATH}).`
        : `The dealer authorizes a ${feedNoun} from ${s.name} or an existing syndication provider. You point `
          + `AutoLander at that approved output, your vehicles load, and AutoLander prepares eligible Marketplace `
          + `listings and keeps them in sync. Meta’s account limits still apply. See how [ongoing inventory sync](${INVENTORY_PATH}) works.`,
    ],
    c.sourceFaq,
    [
      `How much does it cost to post ${s.name} inventory to Facebook Marketplace?`,
      `AutoLander publishes self-serve plans from $${SITE.lowPrice}/mo with 5 free posts to start and no `
      + `credit card required. The same pricing applies however you connect — see all integration options `
      + `on the [Facebook Marketplace integrations page](${HUB_PATH}).`,
    ],
    [
      `What if I use a different system than ${s.name}?`,
      `AutoLander's verified feed support is CarGurus, Cars.com and custom feeds/exports. Another system may `
      + `connect if its provider can produce a dealer-authorized export in a supported format. Confirm the `
      + `format and delivery method before buying; see the [integrations hub](${HUB_PATH}).`,
    ],
  ].filter(Boolean);

  return {
    path,
    title,
    description,
    ogType: 'website',
    eyebrow: isFeed ? 'Supported feed source' : 'Custom feed / export',
    h1,
    bylineUpdated: true,
    tldr,
    breadcrumbs: [
      { name: 'Home', url: SITE.origin + '/' },
      { name: 'Integrations', url: SITE.origin + HUB_PATH },
      { name: `${s.name} → Facebook Marketplace`, url: SITE.origin + path },
    ],
    related: [...siblingSpokes(s.slug, 3), ...relatedFor('integrationSpoke')],
    sections,
    faq,
    cta: {
      heading: `Post your ${s.name} inventory to Facebook Marketplace`,
      sub: 'See plans and book a demo — connect your feed and manage eligible Marketplace listings.',
    },
    schema: {
      software: isFeed
        ? `AutoLander reads your ${s.name} inventory feed and prepares eligible Facebook Marketplace listings `
          + `from a native desktop app, with an AI Photo Studio, walkaround video and sold-unit reconciliation.`
        : `AutoLander connects to ${s.name} via a custom feed/export (no one-click native integration) and `
          + `prepares eligible Facebook Marketplace listings from a native desktop app, with AI photos, `
          + `walkaround video and sold-unit reconciliation.`,
    },
  };
}

// ---------------------------------------------------------------------------
// HUB
// ---------------------------------------------------------------------------
const HUB_SOFTWARE_DESC =
  'AutoLander connects your dealership inventory system to Facebook Marketplace — reading a supported '
  + 'feed (CarGurus, Cars.com) or a custom feed/export from a dealer inventory system — and prepares '
  + 'eligible listings from a native desktop app, with AI photos, walkaround video and sold-unit reconciliation.';

const hub = {
  key: 'integHub',
  title: 'Facebook Marketplace Integrations for Car Dealers',
  description:
    'Connect dealer inventory feeds to Facebook Marketplace with AutoLander. Supports CarGurus, Cars.com '
    + 'and custom DMS exports. From $39/mo.',
  ogType: 'website',
  eyebrow: 'For car dealers & dealer groups',
  h1: 'Facebook Marketplace integrations & DMS feeds',
  bylineUpdated: true,
  tldr:
    'AutoLander connects your inventory to Facebook Marketplace in one of two honest ways: it reads a '
    + 'directly supported feed source (CarGurus or Cars.com), or it ingests a custom feed/export from '
    + 'your DMS or website platform (vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, '
    + 'Tekion). Either way, AutoLander loads the inventory, manages a queue of eligible Marketplace listings, '
    + 'refreshes prices and reconciles sold units — with AI photos, walkaround video and post-to-sale attribution. '
    + 'Meta account eligibility and listing limits still apply. Plans from $39/mo.',
  softwareDesc: HUB_SOFTWARE_DESC,
  breadcrumbs: [
    { name: 'Home', url: SITE.origin + '/' },
    { name: 'Integrations', url: SITE.origin + HUB_PATH },
  ],
  sections: [
    {
      type: 'figure',
      before: '/studio/ford-maverick-before.webp',
      after: '/studio/ford-maverick-after.webp',
      beforeAlt: 'Raw dealership lot photo of a 2026 Ford Maverick before AutoLander',
      afterAlt: 'The same 2026 Ford Maverick as a showroom-grade Facebook Marketplace listing photo after AutoLander’s AI Photo Studio',
      caption: 'From your feed to a showroom-grade listing: a raw 2026 Ford Maverick lot photo (left) becomes a polished Facebook Marketplace listing (right), automatically.',
    },
    {
      type: 'qa',
      q: 'What is a DMS Facebook Marketplace integration?',
      a: [
        'A DMS Facebook Marketplace integration connects the system that holds your inventory — your '
        + 'dealer management system (DMS), inventory-management tool or dealer website platform — to '
        + 'a Marketplace workflow, reducing repeated VIN entry. AutoLander reads authorized inventory data '
        + '(year, make, model, price, mileage, photos and descriptions), builds a queue of eligible listings, '
        + 'and reconciles published listings as the lot changes. Meta permission and account limits still apply.',
        'AutoLander runs as a native desktop app on your own computer, so it posts through your normal '
        + 'Facebook session rather than a shared cloud server or a browser extension.',
      ],
    },
    {
      type: 'qa',
      q: 'How does AutoLander connect to my inventory system?',
      a: [
        'There are two honest connection types. The first is a directly supported feed source: AutoLander '
        + 'reads your existing CarGurus or Cars.com feed with nothing new to build. The second is a custom '
        + 'feed/export: when a provider supplies a dealer-authorized inventory export in a supported format, '
        + 'AutoLander reads that file to prepare and sync eligible listings.',
        'AutoLander does not provide one-click native plugins for individual DMS products like vAuto, '
        + 'DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global or Tekion. The exact export path, format, '
        + 'delivery method, provider approval and update cadence must be confirmed for each system.',
      ],
    },
    {
      type: 'features',
      h2: 'Inventory systems that can feed AutoLander’s Marketplace workflow',
      intro:
        'Pick your system to see exactly how it connects. CarGurus and Cars.com are directly supported '
        + 'feed sources; the rest connect via a custom feed/export.',
      cards: INTEGRATIONS.map((s) => ({
        title: s.anchor,
        body:
          (s.system === 'feed'
            ? `${s.name} is a directly supported feed source — AutoLander reads your feed and posts your lot. `
            : `${s.name} connects via custom feed/export (no one-click native integration). `)
          + `See the [${s.name} integration setup](${integrationPath(s.slug)}).`,
      })),
    },
    {
      type: 'twocol',
      left: {
        h2: 'Directly supported feed sources',
        items: [
          'CarGurus — AutoLander reads your existing CarGurus inventory feed.',
          'Cars.com — AutoLander reads your existing Cars.com inventory feed.',
          'Dealer-authorized custom inventory feeds/exports, subject to format and delivery review.',
          'CarGurus and Cars.com do not require a separate AutoLander plugin.',
        ],
      },
      right: {
        h2: 'Connect via custom feed / export',
        items: [
          'vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global, Tekion.',
          'No one-click native plugin — the provider must authorize an export in a supported format.',
          'AutoLander reads the approved feed and manages eligible listing data and reconciliation.',
          'Format, delivery method, provider approval and update cadence are confirmed before setup.',
        ],
      },
    },
    {
      type: 'steps',
      h2: 'How an inventory feed becomes a managed Marketplace workflow',
      steps: [
        {
          title: 'Connect your feed',
          body: 'Point AutoLander at a supported feed (CarGurus, Cars.com) or a custom feed/export from '
            + 'your DMS or website. Your vehicles load automatically.',
        },
        {
          title: 'Enhance every listing',
          body: 'The AI Photo Studio swaps lot backgrounds for showroom backdrops and generates a '
            + 'walkaround video for each vehicle.',
        },
        {
          title: 'Manage the posting queue from your own computer',
          body: 'While the desktop app is running, AutoLander works through eligible Marketplace listings with a '
            + 'configurable queue and accurate title, price and description fields. Meta’s account limits still apply.',
        },
        {
          title: 'Stay accurate and measure it',
          body: `Listings refresh as prices change, sold units are removed during reconciliation, and post-to-sale `
            + `attribution shows which posts moved metal. See the [inventory-sync details](${INVENTORY_PATH}).`,
        },
      ],
    },
    {
      type: 'callout',
      title: 'An honest note on "integrations"',
      body:
        'AutoLander’s verified support is CarGurus, Cars.com and custom feeds/exports. We do not '
        + 'claim one-click native integrations with individual dealer-system products. If your provider can '
        + 'produce a dealer-authorized feed/export in a supported format, AutoLander can load it into a managed '
        + 'workflow for eligible Marketplace listings. Provider approval, Meta permission and account limits still apply.',
    },
  ],
  faq: [
    [
      'Which inventory systems work with AutoLander?',
      'AutoLander reads directly supported feed sources (CarGurus and Cars.com). Other systems — including '
      + 'vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global and Tekion — may connect through a '
      + 'dealer-authorized custom feed/export after its format and delivery method are confirmed. AutoLander '
      + 'can then load supported data into a managed workflow for eligible Marketplace listings.',
    ],
    [
      'Does AutoLander have a native one-click integration with my DMS?',
      'For CarGurus and Cars.com, AutoLander reads your feed directly, so there is nothing extra to build. '
      + 'For DMS and website platforms like vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK Global '
      + 'and Tekion, there is no one-click native integration — they connect through a custom feed/export. '
      + 'We are deliberately honest about this rather than implying plugins that do not exist.',
    ],
    [
      'What is a custom feed/export?',
      'A custom feed/export is a standard inventory file — a CSV, XML or syndication feed — that your DMS '
      + 'or website platform generates to describe every vehicle on your lot. AutoLander reads that file '
      + 'to prepare eligible Marketplace listings and keep them in sync, reducing manual re-entry of VINs, '
      + 'prices or photos by hand.',
    ],
    [
      'What if my inventory system is not listed?',
      'You may still be able to connect if your provider can produce a dealer-authorized inventory feed or '
      + 'export in a supported format. Contact us with the system name, export format and delivery method, and '
      + 'we will confirm whether AutoLander can ingest it before you buy.',
    ],
    [
      'How much does an inventory-to-Marketplace connection cost?',
      `AutoLander publishes self-serve plans from $${SITE.lowPrice}/mo with 5 free posts to start and no `
      + 'credit card required. The same pricing applies whether you connect via a supported feed or a '
      + 'custom feed/export.',
    ],
  ],
  cta: {
    heading: 'Connect your inventory to Facebook Marketplace',
    sub: 'See plans and book a demo — point AutoLander at your feed and manage eligible Marketplace listings.',
  },
  relatedHeading: 'Keep exploring',
  schema: {
    software: HUB_SOFTWARE_DESC,
    itemList: INTEGRATIONS.map((s) => ({
      name: s.anchor,
      url: SITE.origin + integrationPath(s.slug),
    })),
  },
};

export const PAGES = [hub, ...INTEGRATIONS.map(buildSpoke)];
