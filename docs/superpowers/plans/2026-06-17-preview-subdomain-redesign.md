# AutoLander Preview-Subdomain Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an elevated, on-brand rebuild of the AutoLander marketing page to a Cloudflare Pages preview at `preview.autolander.ai`, with all existing machinery (tracking, booking, referral, downloads, chat, admin) preserved and the Meta pixel disabled on preview.

**Architecture:** Keep `App.jsx` as the stateful orchestrator (booking/referral/download/tracking logic stays centralized — lowest regression risk). Extract the presentation into focused section components under `src/sections/` that receive data + callbacks via props. Add a build-time env flag (`vite --mode preview`) that (a) disables the Meta pixel/CAPI and (b) marks the build `noindex`. Deploy the `dist` output to a new Cloudflare Pages project, isolated from the GitHub Pages prod deploy.

**Tech Stack:** Vite 6, React 19, Tailwind 4, Framer Motion 12, lucide-react. Higgsfield MCP for vehicle imagery. Playwright MCP for verification. `npx wrangler` for Cloudflare Pages deploy.

## Global Constraints

- Stay on brand: base `#050505`, electric blue `#2563eb`/blue-500/600 → indigo, **bold uppercase italic** display type.
- **Do not modify `main` or anything that affects `autolander.ai`** until the user approves; all work on branch `preview-subdomain-redesign`.
- **Preserve, do not regress** (additive only): Meta Pixel + CAPI with matching `event_id`; UTM + visitor-ID attribution on booking/download URLs; native `InstantCalendar` booking (worker `/api/availability` + `/api/book`) + Calendly fallback; `/ref/:code` referral hero + offer; OS-gated download / Start-Free-Trial flow; `ChatAssistant`; `/admin` route.
- **Operating test for every line & visual:** "Would a random consumer think this is a car for sale?" If yes → rewrite. Reads as **software for dealers**, never a car-for-sale ad.
- **Cars:** clean / **no fabricated emblems**, shown **in-product** (listing cards / Marketplace context), never a standalone beauty shot.
- **No ROI calculator.** **Pixel OFF on preview.** Carry forward existing claims/testimonials (no new result claims).
- Performance: GPU-cheap motion (transform/opacity only), `prefers-reduced-motion` honored, simplified on mobile. Target Lighthouse mobile ≥ 90.
- Commit frequently, one logical change per commit. Stage only files belonging to the change (the repo root has many unrelated untracked files — never `git add -A`).

---

### Task 1: Design foundation — tokens, motion primitives, shared UI

**Files:**
- Modify: `src/index.css` (design tokens, base type, reduced-motion, `content-visibility` helper)
- Create: `src/sections/_ui.jsx` (shared primitives: `Eyebrow`, `SectionHeading`, `GlassCard`, `Stat` count-up, `FadeIn` moved here, motion variants)
- Reference: current `src/App.jsx:196-234` (existing `FadeIn`, `FeatureCard`, `Step`)

**Interfaces:**
- Produces: `FadeIn`, `Eyebrow`, `SectionHeading`, `GlassCard`, `Stat({value,label,suffix})`, `useReducedMotionSafe()`, exported motion `variants`. Later tasks import these from `src/sections/_ui.jsx`.

- [ ] **Step 1:** Read `src/index.css` and `src/App.css` to capture existing tokens/utilities before changing anything.
- [ ] **Step 2:** Add CSS custom properties for the elevated scale (spacing rhythm, display type sizes, a `--beam` gradient, glass surface vars) without removing anything prod relies on. Add a global `@media (prefers-reduced-motion: reduce)` block that neutralizes transforms/animations.
- [ ] **Step 3:** Create `src/sections/_ui.jsx` with the primitives. `Stat` animates a number count-up with Framer Motion `useInView` + `animate`, and renders the final value immediately when reduced-motion is set.
- [ ] **Step 4 (verify):** `npm run dev`, open `http://localhost:5173` via Playwright, mount a temporary demo of the primitives (or verify via the hero in Task 3). Confirm no console errors and `npm run lint` passes.
- [ ] **Step 5:** Commit `git add src/index.css src/sections/_ui.jsx` → `feat(preview): design tokens + shared UI primitives`.

---

### Task 2: Generate clean vehicle imagery (Higgsfield)

**Files:**
- Create: `public/preview/listing-truck.webp`, `public/preview/listing-suv.webp`, `public/preview/listing-sedan.webp` (3 clean cards' worth; add more only if a section needs them)

**Interfaces:**
- Produces: image asset paths consumed by the hero (Task 3) and any listing-card mock.

- [ ] **Step 1:** Use the `higgsfield-generate` (or `higgsfield-product-photoshoot`) skill to generate photoreal but **badge-free** vehicles. Prompt guardrails: "no brand logos, no emblems, no badges, generic unbranded vehicle," choose **rear-3/4 or side angles** that avoid grille/badge close-ups; body styles = pickup truck, SUV, sedan; neutral dealer-lot or clean studio setting; lighting that matches a dark UI.
- [ ] **Step 2:** Review every output at full size. **Reject any with a visible fabricated emblem or warped geometry; regenerate.** This is the whole reason the old images were pulled — do not repeat it.
- [ ] **Step 3:** Downscale/convert to `.webp` (target ≤ ~120KB each, ~1200px longest edge) and save under `public/preview/`.
- [ ] **Step 4 (verify):** Confirm files exist and open cleanly; note their dimensions for `width`/`height` attrs (avoid CLS).
- [ ] **Step 5:** Commit `git add public/preview/` → `feat(preview): clean badge-free vehicle imagery`.

---

### Task 3: Product-first hero + retire old car assets

**Files:**
- Create: `src/sections/Hero.jsx`
- Modify: `src/App.jsx` (render `<Hero/>`, pass `openDemoBooking`, referral props, attribution helpers; remove `HERO_CARS_*` constants + the desktop/mobile car `<img>` blocks at `App.jsx:478-496` and `637-654`)
- Modify: `index.html` (remove the two `hero-cars-layer-*` `<link rel="preload">` at lines 33-34)

**Interfaces:**
- Consumes: `openDemoBooking`, `showDownloadButtons`, `openDownload`, `hasReferral`, `referralCode`, `copyReferralCode`, `openInstalledApp`, `openSpecificDownload` (existing handlers in `App.jsx`), and `FadeIn/Eyebrow/SectionHeading` from `_ui.jsx`.
- Produces: `<Hero {...props} />`.

- [ ] **Step 1:** Build the non-referral hero: eyebrow ("Facebook Marketplace automation for dealers & sales reps"), execution-gap headline, subhead, co-equal **Book a Demo** + **Start Free Trial** CTAs (wired to existing `openDemoBooking`), and the price strip. Keep the `hasReferral` variant behavior (delegate to existing referral markup or a `HeroReferral` sub-component — preserve all referral logic/handlers verbatim).
- [ ] **Step 2:** Build the animated **command center**: a dashboard frame containing Marketplace **listing cards** (using Task 2 imagery) that reveal one-by-one, a "X cars posted today" `Stat` count-up, lead-notification pings, and the electric-blue "posting beam." All transform/opacity; pauses under reduced-motion. Desktop-rich, simplified on mobile.
- [ ] **Step 3:** Remove `HERO_CARS_DESKTOP_SRC`/`HERO_CARS_MOBILE_SRC` constants and both car `<img>` layers from `App.jsx`; remove the two preloads from `index.html`. Grep to confirm no remaining references: `rg "hero-cars" src index.html`.
- [ ] **Step 4 (verify):** `npm run build` succeeds; `npm run lint` clean. Playwright: load dev, screenshot at 1440px and 390px; confirm **Book a Demo** opens the `InstantCalendar`; confirm no console errors; confirm `rg hero-cars` returns nothing.
- [ ] **Step 5:** Commit the hero + asset retirement → `feat(preview): product-first animated hero; retire emblem car images`.

---

### Task 4: Trust strip + "execution gap" section

**Files:** Create `src/sections/TrustStrip.jsx`, `src/sections/ExecutionGap.jsx`; modify `src/App.jsx` to render them after the hero.

- [ ] **Step 1:** `TrustStrip`: a quiet, auto-scrolling marquee of feed/DMS names (CarGurus, Cars.com, vAuto, DealerCenter, DealerTrack, VINCue) as styled text/badges (no third-party logos to avoid trademark issues). Pauses on hover / reduced-motion.
- [ ] **Step 2:** `ExecutionGap`: the golden-thread section — headline "Dealers don't have a demand problem. They have an execution problem.", supporting copy (buyers already shop Marketplace; the bottleneck is consistent posting), 3 stat tiles (`1B+ monthly`, `3.5M+ daily listings`, `only 14% start on a dealer site`) using `Stat`.
- [ ] **Step 3 (verify):** build + lint clean; Playwright screenshot desktop+mobile; stats animate once and settle on correct values.
- [ ] **Step 4:** Commit → `feat(preview): trust strip + execution-gap section`.

---

### Task 5: How it works + Manual-vs-AutoLander

**Files:** Create `src/sections/HowItWorks.jsx`, `src/sections/Comparison.jsx`; modify `src/App.jsx`.

- [ ] **Step 1:** `HowItWorks`: 3 steps (Connect feed → Enhance/auto-describe → Auto-post & track), elevated `Step` styling, animated connector beam.
- [ ] **Step 2:** `Comparison`: keep the real playbook numbers — rows: Time per vehicle **13 min → 2 min**, Vehicles/hour **~4 → 30 (6.5×)**, Copy **inconsistent → AI-optimized**, Photos **random → front-view first**, Attribution **none → post-to-sale**, Result **burnout → full automation**. Responsive table that becomes stacked cards < 640px.
- [ ] **Step 3 (verify):** build + lint clean; Playwright check table readable at 390px (no horizontal scroll).
- [ ] **Step 4:** Commit → `feat(preview): how-it-works + manual-vs-autolander`.

---

### Task 6: Features grid + AI Photo Studio (preserve before/after + video)

**Files:** Create `src/sections/Features.jsx`, `src/sections/Studio.jsx`; modify `src/App.jsx`. Preserve the `featuresSectionRef` `ViewContent` tracking and the existing studio tab/video lazy-load logic verbatim.

- [ ] **Step 1:** `Features`: elevated `FeatureCard`s for the core capabilities (Automatic Sync, AI Posting & Photo Studio, Auto Updates, Continuous Queue, Zero Setup, Lead Acceleration). Keep the `ref` used for the `ViewContent` pixel event (move the ref/observer wiring to stay functional — keep observer in `App.jsx`, pass `ref` down).
- [ ] **Step 2:** `Studio`: reuse `bronco-before.jpg`/`bronco-after.jpg` + the walkaround `<video>` click-to-load exactly as today (tabs Before/After/Walkaround, lazy `videoLoaded`). Restyle the shell only; **do not change the video/asset wiring.**
- [ ] **Step 3 (verify):** build + lint clean; Playwright: the features `ViewContent` still fires on scroll **in a prod-mode build** (defer the network assertion to Task 12 where pixel-mode is exercised); studio tabs switch; video loads on click.
- [ ] **Step 4:** Commit → `feat(preview): features grid + AI studio (logic preserved)`.

---

### Task 7: Proof/testimonials + Who-it's-for / Who-it's-NOT-for

**Files:** Create `src/sections/Proof.jsx`, `src/sections/Audience.jsx`; modify `src/App.jsx`.

- [ ] **Step 1:** `Proof`: carry forward the existing testimonials verbatim (no new claims) in elevated cards.
- [ ] **Step 2:** `Audience`: two columns — **For** (dealership owners, GMs, used-car/BDC/internet-sales managers, sales reps) vs **Not for** (people trying to buy a car; teams unwilling to post consistently). This is straight from the playbook landing-page formula and sharpens dealer targeting.
- [ ] **Step 3 (verify):** build + lint clean; Playwright screenshot desktop+mobile.
- [ ] **Step 4:** Commit → `feat(preview): proof + who-it's-for`.

---

### Task 8: Pricing + FAQ + Final CTA + Footer

**Files:** Create `src/sections/Pricing.jsx`, `src/sections/Faq.jsx`, `src/sections/FinalCta.jsx`, `src/sections/Footer.jsx`; modify `src/App.jsx`. Keep the `pricing` data array + billing toggle + referral-offer pricing logic (`App.jsx:376-433`, `800-971`) intact — move markup to `Pricing.jsx`, keep state in `App.jsx`.

- [ ] **Step 1:** `Pricing`: same plans/data/toggle/referral logic, elevated cards; CTAs call existing handlers (`openDemoBooking` / `openDownload`).
- [ ] **Step 2:** `Faq`: refreshed FAQ pulling accurate answers from the playbook Part 10 (account safety, who uses it, time-to-start, cancel anytime, free trial, sync cadence). Keep existing accurate product specifics.
- [ ] **Step 3:** `FinalCta` + `Footer`: elevated, existing links/handlers preserved.
- [ ] **Step 4 (verify):** build + lint clean; Playwright: billing toggle works; `/ref/demo123` route still shows the referral offer; CTAs open the calendar.
- [ ] **Step 5:** Commit → `feat(preview): pricing + faq + final cta + footer`.

---

### Task 9: Persistent mobile "Book a Demo" bar

**Files:** Create `src/sections/MobileCtaBar.jsx`; modify `src/App.jsx`.

- [ ] **Step 1:** A fixed bottom bar shown only `< md` and only after the hero scrolls out of view (IntersectionObserver), with a single **Book a Demo** button → `openDemoBooking`. Safe-area-inset padding; does not cover the chat widget (offset it). This fixes the known "mobile has no CTA" funnel leak.
- [ ] **Step 2 (verify):** Playwright at 390px: scroll past hero → bar appears, tap opens calendar; at 1440px → bar absent; chat button not obscured.
- [ ] **Step 3:** Commit → `feat(preview): mobile sticky book-a-demo bar`.

---

### Task 10: Pixel-OFF preview build + noindex + canonical

**Files:** Create `.env.production`, `.env.preview`; modify `index.html` (guard inline `fbq`), `src/lib/meta-pixel.js` and `src/lib/tracker.js` (no-op when disabled), `package.json` (add `build:preview` script).

**Interfaces:**
- Produces: `import.meta.env.VITE_META_PIXEL_ID` (real on prod, empty on preview); `import.meta.env.VITE_DEPLOY_TARGET` (`prod`|`preview`).

- [ ] **Step 1:** Read `src/lib/meta-pixel.js` and `src/lib/tracker.js` to see exactly how `fbq`/CAPI are called.
- [ ] **Step 2:** `.env.production` → `VITE_META_PIXEL_ID=2087440198847151`, `VITE_DEPLOY_TARGET=prod`. `.env.preview` → `VITE_META_PIXEL_ID=` (empty), `VITE_DEPLOY_TARGET=preview`.
- [ ] **Step 3:** In `index.html`, gate the inline init so an empty/invalid id is a no-op:
  ```html
  <script>
    window.__AL_PIXEL_ID__ = '%VITE_META_PIXEL_ID%';
    if (/^\d{6,}$/.test(window.__AL_PIXEL_ID__)) {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', window.__AL_PIXEL_ID__);
      fbq('track', 'PageView');
    }
  </script>
  ```
  Also gate the `<noscript>` pixel `<img>` the same way (or accept it only renders with JS off — simplest: leave it; it only fires without JS, negligible). Add a build-conditional `<meta name="robots" content="noindex">` for preview (inject via a tiny Vite `transformIndexHtml` plugin in `vite.config.js` keyed on `VITE_DEPLOY_TARGET`, or hardcode noindex and override on prod — prefer the plugin so prod stays indexable). Keep `<link rel="canonical" href="https://autolander.ai/">` unchanged.
- [ ] **Step 4:** In `meta-pixel.js` and `tracker.js`, add `const TRACKING_ENABLED = /^\d{6,}$/.test(import.meta.env.VITE_META_PIXEL_ID || '')` and early-return from `track`/`trackCustom`/`pageView`/CAPI calls when false (so no `fbq` queue buildup and no worker CAPI POST on preview).
- [ ] **Step 5:** Add `"build:preview": "vite build --mode preview && node scripts/spa-fallback.mjs"` to `package.json`.
- [ ] **Step 6 (verify):** `npm run build:preview`; `npx vite preview --port 4173`; Playwright load `http://localhost:4173`, capture **network requests** → assert **zero** requests to `connect.facebook.net` or `facebook.com/tr`, and none to the worker CAPI endpoint. Then `npm run build` (prod mode) + preview → assert the pixel **does** load and `PageView` fires. Confirm `noindex` present only on the preview build.
- [ ] **Step 7:** Commit → `feat(preview): disable pixel/CAPI + noindex on preview build`.

---

### Task 11: Cloudflare Pages deploy + worker CORS origins

**Files:** Modify `worker/wrangler.toml` (`ALLOWED_ORIGINS`); create `docs/superpowers/preview-deploy.md` (the exact commands handed to the user).

- [ ] **Step 1:** Append preview origins to `worker/wrangler.toml:9` `ALLOWED_ORIGINS`: add `https://preview.autolander.ai` and `https://autolander-preview.pages.dev` (keep all existing). Additive only.
- [ ] **Step 2:** Write `docs/superpowers/preview-deploy.md` with the exact, copy-pasteable sequence (uses `npx`, since `wrangler` isn't globally installed):
  ```bash
  # one-time auth (interactive — run in the session with the ! prefix):
  npx wrangler login

  # build the pixel-off preview bundle:
  npm run build:preview

  # create + deploy the Pages project (first run creates it):
  npx wrangler pages deploy dist --project-name autolander-preview --branch preview

  # redeploy the worker with the added CORS origins:
  npx wrangler deploy --config worker/wrangler.toml
  ```
  Plus the manual Cloudflare-dashboard steps to map the custom domain `preview.autolander.ai` (Pages project → Custom domains → add → confirm the auto-created CNAME), and a note that the `*.pages.dev` URL is shareable immediately while DNS propagates.
- [ ] **Step 3 (verify):** This task's deploy commands require the user's Cloudflare auth, so **STOP here for the user** — do not assume auth. Confirm the doc is accurate and `worker/wrangler.toml` diff is additive (`git diff worker/wrangler.toml`).
- [ ] **Step 4:** Commit → `chore(preview): add preview CORS origins + deploy runbook`.

---

### Task 12: Full verification pass + handoff

**Files:** none (verification only).

- [ ] **Step 1:** `npm run build` and `npm run build:preview` both succeed; `npm run lint` clean.
- [ ] **Step 2:** Playwright full sweep on the **preview** build (`npx vite preview`): desktop (1440) + mobile (390) screenshots of every section; console clean; **no `facebook.net`/`facebook.com/tr` requests**; Book-a-Demo opens calendar on both viewports; mobile sticky bar works; `/ref/demo123` shows the offer.
- [ ] **Step 3:** (Optional, if Lighthouse available) mobile performance ≥ 90; note any quick wins.
- [ ] **Step 4:** Summarize for the user: what changed, the local preview URL/screenshots, and the exact `preview-deploy.md` commands they run (with their Cloudflare auth) to publish `preview.autolander.ai`.

---

## Self-Review

**Spec coverage:** Hero/cars (T2,T3) · golden thread + proof (T4) · how-it-works + real numbers (T5) · features + studio preserved (T6) · who-it's-for (T7) · pricing/faq/cta (T8) · mobile CTA (T9) · pixel-off + noindex (T10) · Cloudflare Pages + CORS (T11) · perf/verify (T12) · brand/motion/perf constraints (T1 + Global). Machinery-preservation is called out per task (booking, referral, downloads, tracking, ViewContent ref). No ROI calculator anywhere. ✅

**Placeholder scan:** Infra/risk steps carry exact code (pixel gate, env, deploy). Visual sections specify exact content (real comparison numbers, real stats, audience lists) + design direction; final JSX is produced during execution with the frontend-design skill — acceptable for a creative rebuild, not a hidden TODO. ✅

**Consistency:** Env var names (`VITE_META_PIXEL_ID`, `VITE_DEPLOY_TARGET`), the `/^\d{6,}$/` guard, project name `autolander-preview`, and `_ui.jsx` exports are used identically across T1/T10/T11/T12. ✅
