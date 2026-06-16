# AutoLander — Leveled-Up Site on `preview.autolander.ai` (Design Spec)

- **Date:** 2026-06-16
- **Status:** Approved direction (brainstorming complete) — pending spec review
- **Branch:** `preview-subdomain-redesign`
- **Author:** Claude Code (frontend-design)

## 1. Goal

Ship a world-class, on-brand, "elevated evolution" of the AutoLander marketing site to a
**preview subdomain** (`preview.autolander.ai`) that the team can circulate **before** it goes
live. The root domain (`autolander.ai`, GitHub Pages) stays **100% untouched**.

The site must:
- Stay on brand (near-black `#050505`, electric blue→indigo, bold uppercase italic display type).
- Feel like a $20k design: modern, premium motion that appeals to car dealers & sales reps.
- Be **extremely fast** and **great on mobile** (Lighthouse mobile 90+ target).
- Have **world-class B2B marketing** anchored to the AutoLander playbook.
- Include cars — but **clean, badge-free** vehicles generated with Higgsfield, shown **in a
  software/Marketplace context**, never as a standalone car-for-sale glamour shot. The current
  hero's hallucinated-emblem car images are retired.

## 2. Decisions locked (from brainstorming)

| Decision | Choice |
|---|---|
| Who builds it | **Claude directly** (frontend-design skill + Higgsfield MCP) |
| Ambition | **Elevated evolution** (keep brand DNA + proven flow, raise craft) |
| Cars | **In, via Higgsfield** — clean/no fake emblems, in-product context |
| Subdomain | **`preview.autolander.ai`** |
| Preview host | **Cloudflare Pages** (new project, isolated from GitHub Pages prod) |
| Pixel on preview | **OFF** (no Meta tracking from internal review traffic) |
| ROI calculator | **Out** (removed on prod recently; do not re-add) |

## 3. Non-negotiable constraints (preserve — additive only)

This is a **presentation-layer rebuild**, not a greenfield rewrite. The following machinery must
carry over and keep working exactly as today (regression risk = real; tracking health is already
fragile per `incorrect-data.txt`):

- **Meta Pixel + CAPI tracking** with matching `event_id` (`src/lib/meta-pixel.js`, `tracker.js`,
  `identity.js`): `PageView`, `ViewContent` (features), `Lead` (chat), `InitiateCheckout` +
  `AppDownload` (downloads). *On the preview build only, these are gated OFF.*
- **UTM + visitor-ID attribution** passthrough on every booking/download URL (`withAttribution`,
  `withUtms`, `ATTR_KEYS`).
- **Native booking** via `InstantCalendar` (worker `/api/availability` + `/api/book`) with the
  Calendly popup as fallback (`openCalendlyPopup`). Role selector + scarcity logic preserved.
- **`/ref/:code` referral** hero variant + 25%-off offer block.
- **OS-gated download / Start Free Trial** flow (desktop-only buttons, OS detection).
- **`ChatAssistant`** (lazy-loaded).
- **`/admin`** dashboard route (`Root.jsx`) — untouched.
- Do NOT break the thank-you-page pixel, Calendly config, or Free-Trial flow (`changes.txt.txt`).

## 4. Messaging strategy

Anchor everything to the golden thread:

> **"Dealers don't have a Marketplace demand problem. They have a Marketplace *execution* problem."**

The **operating test** for every line/visual: *"Would a random consumer think this is a car for
sale?"* If yes → rewrite. Frame 1 names the **seller**, not the buyer. The visual screams
**software for dealerships**.

- **Above the fold** must instantly read as: *Facebook Marketplace listing automation for auto
  dealers & sales reps* — with **Book a Demo** (primary) + **Start Free Trial** (co-equal).
- **Offer:** 5 free posts on a live demo, no strings. $39/mo individual · $117/mo team · cancel
  anytime.
- **Proof** (carry forward existing claims; do not invent new ones — testimonials & specific
  result claims are the user's compliance call per playbook Part 11):
  - Manual vs AutoLander: **13 min → 2 min/car**, **~4 → 30 cars/hr (6.5×)**, AI-optimized copy,
    front-view photos, post-to-sale attribution.
  - Marketplace conviction: **1B+ monthly visitors**, **3.5M+ daily listings**, only **14%** start
    on a dealer site vs **~48%** on a third-party marketplace.
  - Account safety / human-like posting (~99%), no contracts.
- **Hooks** to draw from (playbook 7.2): "Your sales reps should be selling cars, not copy-pasting
  VINs." / "Car dealers: your reps are wasting hours manually posting Marketplace listings."
- **Banned language:** fake income/guarantee claims, "bypass Facebook rules," vague "grow with
  AI," luxury-car hype, AI-avatar gimmicks, hero car beauty shots.

## 5. Visual design language (elevated, on-brand)

- **Palette/type unchanged in DNA**: `#050505` base, blue-500/600 → indigo accents, bold uppercase
  italic display. Add a refined type scale, tighter spacing rhythm, mono eyebrow labels, improved
  measure/line-height for readability.
- **Signature device:** an electric-blue "posting beam"/trace that connects inventory → Marketplace,
  reused as a visual through-line.
- **Premium motion** (all GPU-cheap: transform/opacity only; `prefers-reduced-motion` honored;
  reduced/disabled on mobile): scroll-linked reveals, stat **count-ups**, magnetic CTA hovers,
  a quiet **feed/DMS logo marquee** (CarGurus, Cars.com, vAuto, DealerCenter, …), and an animated
  **"posting" sequence** in the hero.
- Glass cards, subtle gradient mesh, crisp borders — the polish that reads as "designed," not
  templated.

## 6. Hero — product-first ("cars in it," done right)

Replace the floating car PNG with an animated **AutoLander "command center"**:
- Dealer inventory flows into **clean Marketplace listing cards** that post **one-by-one**.
- Live **"X cars posted today"** count-up; **lead-notification** pings; a compact dashboard frame.
- **This is where the cars live** — inside listing-card mockups, in-context. Satisfies "cars for
  sure" *and* the playbook's "must read as dealer software."

## 7. Car imagery plan (Higgsfield)

- Generate **clean, badge-free** vehicles via Higgsfield (`higgsfield-product-photoshoot` /
  `higgsfield-generate`): framing/angles that avoid emblem close-ups; generic recognizable body
  styles (truck, SUV, sedan).
- Place them **inside listing-card mockups** and the **AI Studio before/after** — never as a
  standalone beauty shot.
- Retire `/hero-cars-layer-full-v2.webp` + `/hero-cars-layer-900-v2.webp` from the new build (and
  their `index.html` preloads). Existing **real** assets (logo, `bronco-before/after`, walkaround
  video/poster) are reused as-is.

## 8. Page structure (IA)

1. Hero (product-first, animated)
2. Trust / feed-&-DMS logo strip
3. **The execution gap** (golden thread)
4. How it works — 3 steps
5. **Manual vs AutoLander** (real numbers)
6. Features grid
7. **AI Photo Studio** (before/after + walkaround)
8. Proof / stats + testimonials (carried forward)
9. **Who it's for / who it's NOT for** (playbook landing-page formula)
10. Pricing (Starter/Growth/Pro/Team — current data)
11. FAQ (playbook Part 10)
12. Final CTA
- **Persistent mobile "Book a Demo" bar** — fixes the chronic "mobile has no CTA" funnel leak.

## 9. Performance & mobile

- Reuse the fast stack (Vite 6 / React 19 / Tailwind 4 / Framer Motion).
- Lazy-load below-fold + heavy components; `content-visibility` on long sections; preload only the
  real hero asset (remove retired car preloads); keep large blur orbs desktop-only.
- Respect `prefers-reduced-motion`; cheapen motion on mobile.
- Target: Lighthouse mobile Performance 90+, no layout shift on hero.

## 10. Deployment — `preview.autolander.ai`

- **New Cloudflare Pages project** `autolander-preview`, separate from GitHub Pages prod. Build
  `npm run build` → `dist`; deploy `wrangler pages deploy dist --project-name autolander-preview`.
  *(Requires the user's Cloudflare auth: `! wrangler login` or `CLOUDFLARE_API_TOKEN`. I prep the
  exact command.)*
- Instant shareable `*.pages.dev` URL for circulating immediately; map custom domain
  `preview.autolander.ai` via one DNS CNAME (user-controlled).
- **Pixel/CAPI disabled** on this build via a build-time Vite env flag (covers both the inline
  `fbq` init in `index.html` and `meta-pixel.js` calls).
- **`noindex`** on preview; keep `canonical → https://autolander.ai/` so it never competes in search.
- Add preview origins (`https://preview.autolander.ai`, `https://autolander-preview.pages.dev`) to
  the worker `ALLOWED_ORIGINS` (additive) so booking/chat work.
- All redesign code lives on branch `preview-subdomain-redesign`; `main` (→ prod) is never pushed
  until the user approves.

## 11. Out of scope

- The root domain / production GitHub Pages deploy (untouched).
- ROI calculator (explicitly excluded).
- `/admin` dashboard redesign (route preserved, not restyled).
- New/changed result claims or testimonials beyond what's already live (compliance is the user's
  call).
- Worker API logic changes beyond the additive CORS origin allow-list.

## 12. Success criteria

- Preview loads at a shareable URL; root domain unchanged.
- Instantly reads as B2B dealer software (passes the operating test); no hallucinated-emblem cars;
  clean Higgsfield cars present in-context.
- All preserved machinery works on preview (booking, referral, downloads, chat) **with pixel OFF**.
- Mobile: looks great, has a visible CTA, Lighthouse 90+.
- On-brand and visibly "leveled up" vs. current.
