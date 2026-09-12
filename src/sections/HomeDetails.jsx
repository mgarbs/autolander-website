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
//
// The "Every AutoLander page, by topic" directory is NOT hand-maintained here any more: it is
// generated into src/generated/home-directory.json (and the matching static block in index.html)
// by scripts/build-seo-pages.mjs from scripts/seo/home-directory.mjs, which is how a drip-published
// /guide/ article shows up on the homepage in the same commit that publishes it.
// test/home-directory.test.js fails if either copy drifts from the generator.

import { ChevronDown } from 'lucide-react';
import { Eyebrow } from './StaticUi.jsx';
import DIRECTORY from '../generated/home-directory.json';

const HOME_DETAIL_FAQ = [
  ['What is AutoLander?',
    'AutoLander is Facebook Marketplace software for car dealerships and sales reps in the United States, Canada and Spanish-speaking Latin America, available in English, Spanish and French. It connects to a dealer inventory feed, posts vehicles to Facebook Marketplace, keeps prices current, removes sold units, enhances listing photos with AI and tracks which posts led to buyer conversations. It is built and operated by AutoLander LLC in Tampa, Florida.'],
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

// Customer quotes: verbatim from customer messages to the team (Sept 2026), first name + a role only
// where the message itself makes the role evident. Same list as scripts/seo/data-testimonials.mjs
// (the SEO pages and /index.md); the static block in index.html mirrors it. No Review/AggregateRating
// schema on purpose: Google excludes self-collected testimonials from rich results.
const HOME_TESTIMONIALS = [
  ['I think this is the best listing software I’ve ever used.', 'Jim', 'Cox Chevrolet'],
  ['I love it. Averaging about 2–3 deals a week from it.', 'Jullian', 'Sales rep, Lexus of Montgomery'],
  ['I’ve sold 3 in a week from AutoLander. It’s doing great. I had 15 people message me yesterday.', 'Zac', 'Sales rep, Westgate'],
  ['I like how it picked up on the price changes, which I also did. Not only is it more accurate, but it may push those listings to the top of the feed again.', 'Jim', 'Cox Chevrolet'],
];

// Every page on the site, grouped: the crawlable link map, in the eager DOM (collapsed) so the
// homepage actually distributes authority to the pages it links. Generated — see the header.
// Each group is its own collapsed <details>: a human sees eight short headings and opens one;
// a crawler sees every <a> in every <nav> regardless. Same content both ways.
const countLabel = (g) => `${g.links.length} ${g.kind === 'articles' ? 'guides' : 'pages'}`;

const ROW = 'group rounded-2xl border border-white/5 bg-white/[0.02] open:bg-white/[0.04] transition-colors';
const SUMMARY = 'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black uppercase italic tracking-tight text-white sm:px-6 [&::-webkit-details-marker]:hidden';
const BODY = 'px-5 pb-5 text-[15px] font-medium leading-relaxed text-slate-400 sm:px-6';
const DIR_ROW = 'group/dir rounded-xl border border-white/5 bg-white/[0.02] open:bg-white/[0.04]';
const DIR_SUMMARY = 'flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-300 [&::-webkit-details-marker]:hidden';
const Chev = () => <ChevronDown className="h-4 w-4 shrink-0 text-blue-400 transition-transform group-open:rotate-180" aria-hidden="true" />;
const DirChev = () => <ChevronDown className="h-3.5 w-3.5 shrink-0 text-blue-400 transition-transform group-open/dir:rotate-180" aria-hidden="true" />;

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
                <li>Franchise and independent used-car dealerships in the United States, Canada and Spanish-speaking Latin America that want whole-lot Marketplace coverage without a dedicated poster.</li>
                <li>Spanish- and French-speaking dealers and reps: the app, the listings and the Facebook session it drives run in English, Spanish or French, with miles or kilometres per dealership.</li>
                <li>Dealer groups running several rooftops that need per-store inventory kept separate.</li>
                <li>Individual sales reps posting their own units who want the same automation at a single-seat price.</li>
                <li>RV and camper dealers, who need inventory posted into the RV/Camper category rather than as cars.</li>
              </ul>
              <p className="mt-4">Not a fit if you need multi-platform syndication, an inbox auto-reply, or a market outside the United States, Canada and Spanish-speaking Latin America.</p>
            </div>
          </details>

          <details className={ROW}>
            <summary className={SUMMARY}>What dealers say <Chev /></summary>
            <div className={BODY}>
              <div className="grid gap-4 sm:grid-cols-2">
                {HOME_TESTIMONIALS.map(([text, who, role]) => (
                  <figure key={text} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <blockquote className="text-slate-200">“{text}”</blockquote>
                    <figcaption className="mt-3 text-[12px] font-bold uppercase tracking-wider text-slate-500">{who} <span className="font-medium normal-case tracking-normal text-slate-500">· {role}</span></figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-slate-500">Quotes are from customer messages to the AutoLander team, September 2026, word for word, first names and dealerships only. Results are what those customers reported, not a promise.</p>
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
              <div className="grid gap-3 sm:grid-cols-2 items-start">
                {DIRECTORY.groups.map((g) => (
                  <details key={g.id} className={DIR_ROW}>
                    <summary className={DIR_SUMMARY}>
                      <span>{g.label} <span className="font-medium normal-case tracking-normal text-slate-500">{countLabel(g)}</span></span>
                      <DirChev />
                    </summary>
                    <nav aria-label={g.label} className="px-4 pb-4">
                      <ul className="space-y-1 text-[13px] font-semibold">
                        {g.links.map((l) => (
                          <li key={l.href}><a href={l.href} className="text-slate-400 hover:text-blue-400">{l.text}</a></li>
                        ))}
                      </ul>
                    </nav>
                  </details>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
