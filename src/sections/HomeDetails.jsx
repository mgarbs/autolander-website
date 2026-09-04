// HomeDetails — the homepage's product detail, FAQ and full resource map, COLLAPSED by default.
//
// WHY: the homepage converts and is deliberately uncluttered, so this section adds no visual
// weight — five closed <details> rows. But everything inside them is in the DOM on mount, which
// is what makes it count: the 2026-09-02 diagnostic measured the homepage at 317 crawlable words
// and 16 internal links because the FAQ and the footer's link map both lived in a lazy chunk that
// mounts on scroll. <details> content is indexed normally (Google treats collapsed content as
// full-weight on mobile-first indexing), and it is what the static block in index.html mirrors,
// so this is a pre-render, not cloaking: a human who opens a row reads exactly what a crawler read.
//
// KEEP IN STEP with the static block in index.html (the AL_STATIC_HOME_DETAILS markers) and with
// scripts/seo/data-home.mjs, which renders the same facts into /index.md. test/agent-readiness
// asserts the built homepage clears the word and link thresholds.

import { ChevronDown } from 'lucide-react';
import { Eyebrow } from './StaticUi.jsx';

const HOME_DETAIL_FAQ = [
  ['What is AutoLander?',
    'AutoLander is Facebook Marketplace software for U.S. car dealerships and sales reps. It connects to a dealer inventory feed, posts vehicles to Facebook Marketplace, keeps prices current, removes sold units, enhances listing photos with AI and tracks which posts led to buyer conversations. It is built and operated by AutoLander LLC in Tampa, Florida.'],
  ['How much does AutoLander cost?',
    'Plans start at $39/month (Starter, 5 posts a day), $59/month (Growth, 10 a day) and $79/month (Pro, 15 a day), with Dealer and multi-rooftop plans from $117/month. Every demo includes 5 free posts and does not require a credit card. Pricing is published — no quote needed.'],
  ['What inventory feeds does AutoLander support?',
    'CarGurus and Cars.com are supported directly. vAuto, DealerCenter, Dealer.com, HomeNet, Frazer, CDK and Tekion are ingested via a custom feed or export, most dealer websites can be read directly, and SFTP and CSV drops are supported.'],
  ['Is automated posting to Facebook Marketplace allowed?',
    'Meta sets the rules, and they change. AutoLander posts through the dealer’s own logged-in session at a controlled pace rather than through an unofficial API, and it does not override eligibility rules or listing limits. No tool — including this one — can guarantee an account will never be actioned.'],
  ['Does AutoLander reply to buyers automatically?',
    'No, and it does not handle your messages at all. AutoLander has no autoresponder and no inbox feature: your team reads and answers buyers in Messenger. What AutoLander does is keep the listing they are asking about accurate, and pull sold units down so nobody wastes a reply on a car that is gone.'],
  ['What platforms does AutoLander run on?',
    'AutoLander is a native desktop application for Windows, macOS and Linux, paired with a cloud service that stores inventory and handles billing. The desktop app drives the Facebook session, which is why it runs on your machine rather than in a browser tab.'],
];

// Every page on the site, grouped. This is the crawlable link map the footer used to carry only
// inside its lazy chunk; here it is in the eager DOM (collapsed) so the homepage actually
// distributes authority to the pages it links.
const HOME_LINK_GROUPS = [
  ['Product', [
    ['/facebook-marketplace-auto-poster/', 'Facebook Marketplace auto poster'],
    ['/facebook-marketplace-listing-software/', 'Listing software'],
    ['/facebook-marketplace-automation/', 'Marketplace automation'],
    ['/facebook-marketplace-inventory-sync/', 'Inventory sync'],
    ['/bulk-post-cars-to-facebook-marketplace/', 'Bulk posting'],
    ['/facebook-marketplace-assistant/', 'Marketplace assistant'],
    ['/facebook-autoposter/', 'Autoposter'],
    ['/facebook-listing-software/', 'Facebook listing software'],
    ['/ai-car-photo-editor/', 'AI car photo editor'],
    ['/rv-dealer-software/', 'RV dealer software'],
    ['/safest-facebook-marketplace-auto-poster/', 'Account safety'],
    ['/facebook-marketplace-auto-poster-pricing/', 'Pricing'],
  ]],
  ['Integrations', [
    ['/integrations/', 'All integrations'],
    ['/integrations/cargurus-facebook-marketplace/', 'CarGurus'],
    ['/integrations/cars-com-facebook-marketplace/', 'Cars.com'],
    ['/integrations/vauto-facebook-marketplace/', 'vAuto'],
    ['/integrations/dealercenter-facebook-marketplace/', 'DealerCenter'],
    ['/integrations/dealer-com-facebook-marketplace/', 'Dealer.com'],
    ['/integrations/homenet-facebook-marketplace/', 'HomeNet'],
    ['/integrations/frazer-facebook-marketplace/', 'Frazer'],
    ['/integrations/cdk-facebook-marketplace/', 'CDK'],
    ['/integrations/tekion-facebook-marketplace/', 'Tekion'],
    ['/dealer-inventory-management/', 'Dealer inventory management'],
  ]],
  ['Compare', [
    ['/compare/', 'Best Marketplace posting tools (2026)'],
    ['/compare/carvid/', 'vs CARVID'],
    ['/compare/shiftly/', 'vs Shiftly'],
    ['/compare/autolisterpro/', 'vs AutoLister Pro'],
    ['/compare/relayauto/', 'vs RelayAuto'],
    ['/compare/drift/', 'vs Sell With Drift'],
    ['/compare/autobook/', 'vs AutoBook.io'],
    ['/compare/glo3d/', 'vs Glo3D'],
    ['/why-facebook-marketplace-only/', 'Why Marketplace only'],
    ['/why-we-dont-answer-your-buyers/', 'Why we don’t answer your buyers'],
  ]],
  ['Guides', [
    ['/guide/how-to-sell-cars-on-facebook-marketplace/', 'How to sell cars on Marketplace'],
    ['/guide/facebook-marketplace-automation/', 'Automation policy & safety'],
    ['/facebook-marketplace-for-car-dealers/', 'Marketplace for car dealers'],
    ['/guide/car-dealership-marketing/', 'Dealership marketing playbook'],
    ['/guide/car-sales-leads/', 'Car sales leads'],
    ['/guide/ai-for-car-dealerships/', 'AI for dealerships'],
    ['/ai-chat-for-car-dealers/', 'AI chat for car dealers'],
    ['/guide/how-to-sell-rvs-on-facebook-marketplace/', 'How to sell RVs on Marketplace'],
    ['/facebook-marketplace-used-car-report-2026/', 'Used-Car Report 2026 (original data)'],
    ['/about/', 'About AutoLander'],
    ['/contact/', 'Contact'],
  ]],
];

const ROW = 'group rounded-2xl border border-white/5 bg-white/[0.02] open:bg-white/[0.04] transition-colors';
const SUMMARY = 'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black uppercase italic tracking-tight text-white sm:px-6 [&::-webkit-details-marker]:hidden';
const BODY = 'px-5 pb-5 text-[15px] font-medium leading-relaxed text-slate-400 sm:px-6';
const Chev = () => <ChevronDown className="h-4 w-4 shrink-0 text-blue-400 transition-transform group-open:rotate-180" aria-hidden="true" />;

export default function HomeDetails({ openDemoBooking, onWarmDemo }) {
  return (
    <section id="details" aria-labelledby="details-heading" className="relative z-10 border-y border-white/5 bg-[#070707] py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Eyebrow>The short version, if you want it</Eyebrow>
        <h2 id="details-heading" className="mt-4 font-display text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
          What AutoLander does, exactly
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400 font-medium leading-relaxed">
          Everything below is closed on purpose. Open what you need.
        </p>

        <div className="mt-8 space-y-3">
          <details className={ROW}>
            <summary className={SUMMARY}>How it works, in three steps <Chev /></summary>
            <div className={BODY}>
              <ol className="space-y-3 list-decimal pl-5">
                <li><strong className="text-slate-200">Connect your inventory.</strong> Point AutoLander at the source you already run: CarGurus, Cars.com, a DMS export from vAuto, DealerCenter, Frazer, CDK, Tekion or HomeNet, an SFTP/CSV drop, or your dealer website. No new system of record and no re-keying.</li>
                <li><strong className="text-slate-200">Review and post.</strong> AutoLander builds a posting queue from the feed, prepares each listing with photos, mileage, price and description, and posts through your own logged-in Facebook session at a pace you control. Meta eligibility rules and listing limits still apply — AutoLander does not override them.</li>
                <li><strong className="text-slate-200">Keep it current.</strong> The feed is re-checked on a schedule. New arrivals are queued, price changes are pushed, and sold units are pulled down, so what a buyer sees on Marketplace matches the lot.</li>
              </ol>
            </div>
          </details>

          <details className={ROW}>
            <summary className={SUMMARY}>What it does — and what it deliberately does not <Chev /></summary>
            <div className={BODY}>
              <p className="text-slate-200 font-bold">Does</p>
              <ul className="mt-2 space-y-2 list-disc pl-5">
                <li>Posts vehicles from your inventory feed to Facebook Marketplace with photos, mileage, price and description filled in.</li>
                <li>Keeps asking prices in step with the feed, so a price drop on the lot reaches Marketplace.</li>
                <li>Removes sold units, so buyers stop messaging about cars that are already gone.</li>
                <li>Enhances listing photos with AI — real cars, never repainted or fabricated.</li>
                <li>Tracks which posts led to buyer conversations and sales.</li>
                <li>Supports cars, trucks and RV / camper inventory, posting each into the correct Marketplace category.</li>
              </ul>
              <p className="mt-5 text-slate-200 font-bold">Does not</p>
              <ul className="mt-2 space-y-2 list-disc pl-5">
                <li>Message buyers or manage your Marketplace inbox — your team reads and answers every conversation in Messenger. <a href="/why-we-dont-answer-your-buyers/" className="text-blue-400 hover:text-blue-300">Why.</a></li>
                <li>Post anywhere other than Facebook Marketplace — no Craigslist, OfferUp or eBay Motors. <a href="/why-facebook-marketplace-only/" className="text-blue-400 hover:text-blue-300">Why.</a></li>
                <li>Override Meta eligibility rules, listing limits or terms; no automation tool can guarantee an account will never be actioned.</li>
                <li>Invent vehicle facts: unknown mileage stays blank rather than guessed, and AI photo editing never repaints a car a colour it is not.</li>
              </ul>
            </div>
          </details>

          <details className={ROW}>
            <summary className={SUMMARY}>Who it is for <Chev /></summary>
            <div className={BODY}>
              <ul className="space-y-2 list-disc pl-5">
                <li>Franchise and independent used-car dealerships in the United States that want whole-lot Marketplace coverage without a dedicated poster.</li>
                <li>Dealer groups running several rooftops that need per-store inventory kept separate.</li>
                <li>Individual sales reps posting their own units who want the same automation at a single-seat price.</li>
                <li>RV and camper dealers, who need inventory posted into the RV/Camper category rather than as cars.</li>
              </ul>
              <p className="mt-4">Not a fit if you need multi-platform syndication, an inbox auto-reply, or service outside the U.S.</p>
            </div>
          </details>

          <details className={ROW}>
            <summary className={SUMMARY}>Questions dealers ask first <Chev /></summary>
            <div className={BODY}>
              <dl className="space-y-4">
                {HOME_DETAIL_FAQ.map(([q, a]) => (
                  <div key={q}>
                    <dt className="font-bold text-slate-200">{q}</dt>
                    <dd className="mt-1">{a}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5">
                <button
                  type="button"
                  onPointerEnter={onWarmDemo}
                  onFocus={onWarmDemo}
                  onClick={openDemoBooking}
                  className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold uppercase italic text-black transition-colors hover:bg-blue-500 hover:text-white"
                >
                  Book a demo
                </button>
                <a href="/pay" className="ml-4 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white">or start self-serve →</a>
              </p>
            </div>
          </details>

          <details className={ROW}>
            <summary className={SUMMARY}>Every AutoLander page, by topic <Chev /></summary>
            <div className={BODY}>
              <div className="grid gap-6 sm:grid-cols-2">
                {HOME_LINK_GROUPS.map(([group, links]) => (
                  <nav key={group} aria-label={group}>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{group}</p>
                    <ul className="space-y-1">
                      {links.map(([href, text]) => (
                        <li key={href}><a href={href} className="text-[13px] font-semibold text-slate-400 hover:text-blue-400">{text}</a></li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
