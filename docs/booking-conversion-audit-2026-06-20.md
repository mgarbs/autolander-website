# AutoLander — Booking & Conversion-Tracking Audit + Fix Report

**Date:** 2026-06-20
**Scope:** autolander.ai marketing site (GitHub Pages, React/Vite) + the `autolander-chatbot` Cloudflare Worker (booking API + Meta Conversions API) + Meta Ads configuration.
**Audience:** AutoLander team + the colleague who ran the original audit.

---

## TL;DR (read this if nothing else)

1. **The booking outage is fixed and live.** Real prospects (including Facebook/Instagram in-app browsers) can book again. The cause was an invisible Cloudflare Turnstile check that silently 403'd real users; it has been disabled server-side and removed from the booking UI, and the fix is deployed.
2. **The site/code is NOT the source of the inflated demo numbers.** The native calendar, the token‑gated thank‑you page, and the Pixel↔CAPI de‑duplication are all built correctly and verified live.
3. **The real money leak is ONE setting in Meta Ads:** the custom conversion **"Demo Booked Calendly"** is defined as *"PageView on a URL containing `/thank-you`."* That counts **every** visit, refresh, back‑button, bot, scanner, and shared link to `/thank-you` as a booked demo — independent of all the code‑level protections. **This is still active and must be rebuilt on the `Schedule` event.** This is the fix that stops the wasted spend.
4. The `fb:app_id` warning your colleague was shown is **cosmetic** — it does not affect ad delivery or conversion tracking.

**The colleague's original diagnosis of the *mechanism* (the `/thank-you` URL firing conversions on every visit) was correct.** What changed since that audit: the site code was hardened (token gate, dedup, Turnstile removed) — but the **Meta custom conversion rule itself was never changed**, so it keeps inflating. Fixing that rule is the remaining action.

---

## Status at a glance

| Area | Status | Evidence |
|---|---|---|
| Booking backend (`/api/book`) | ✅ Working, deployed | Live `POST /api/book` (no token) → `400 invalid_slot`, not `403 verification_failed` |
| Availability (`/api/availability`) | ✅ Healthy | 747–749 fresh slots returned live |
| Native in‑page calendar | ✅ Live on autolander.ai | Lazy chunk `InstantCalendar-*.js` contains `/api/book` + the booking UI |
| Thank‑you `Schedule` conversion | ✅ Gated (single‑use token) | Bare/refreshed/shared `/thank-you` fires **no** `Schedule` |
| Pixel ↔ CAPI dedup | ✅ Correct (shared `event_id`) | Both legs use `cal_<sha256(Calendly event URI)>` |
| `/capi/track` abuse | ✅ Refuses injected `Schedule` | Returns `403 event_not_allowed_here` |
| Worker secrets (Pixel, CAPI, Calendly) | ✅ All configured | `/capi/health` → all `true`, production mode |
| **Meta custom conversion** | ❌ **URL‑based — inflating** | Rule = `PageView AND URL contains /thank-you` (still firing) |
| `fb:app_id` meta tag | ⚠️ Missing (cosmetic) | Not the cause of any tracking problem |
| Banned ad account `50737337` | ⚠️ Disabled by Meta | "Flagged for unusual activity" — needs Meta appeal |

---

## 1. The booking outage (was real → now fixed)

**What happened:** A commit added an *invisible* Cloudflare Turnstile challenge to the booking form and turned on `REQUIRE_BOOK_TURNSTILE`. Invisible Turnstile tokens are frequently missing/blocked in privacy browsers and **especially the Facebook/Instagram in‑app webview that carries the paid traffic**, so real prospects were silently rejected with a 403 and saw a dead "Book a Demo" button.

**Fix (deployed):**
- `worker/wrangler.toml` → `REQUIRE_BOOK_TURNSTILE = "false"`.
- The Turnstile widget + token were removed from the booking UI (`InstantCalendar.jsx`, `booking.js`).
- Remaining protection on `/api/book`: honeypot field, server‑side bot/lead filter, IP rate‑limiting, and a single‑use booking token.

**Live verification:** `POST /api/book` with no token now reaches slot validation (`400 invalid_slot`) instead of being hard‑blocked (`403 verification_failed`).

---

## 2. The real money leak — Meta custom conversion (ACTION REQUIRED)

Your live custom conversion (read directly from the ad account):

> **"Demo Booked Calendly"** (id `1313794486918984`)
> Rule: `event = PageView AND URL i_contains "/thank-you"`
> Last fired: 2026‑06‑20 (still active)

**Why this inflates:** the campaign optimizes toward — and reports — *every* load of a `/thank-you` URL. Real bookings are a small fraction of that; the rest is refreshes, the back button, bookmarks, link previews, security scanners, and crawlers. Meta then spends budget chasing whatever produces more `/thank-you` loads (often cheap/bot traffic), not real dealers. This is the 107‑reported‑vs‑~12‑real gap, and it is **independent of every code fix** because it watches the URL, not the booking.

### The fix (in Meta Events Manager / Ads Manager)

**Goal:** count a conversion only when a real booking happens — i.e., on the `Schedule` event, which the site now fires only on a verified booking and de‑duplicates between browser and server.

**Recommended — optimize on the standard `Schedule` event:**
1. Ads Manager → your campaign/ad set → **Edit**.
2. **Performance goal / Conversion event** → Dataset **"AutoLander Web"** (pixel `2087440198847151`) → choose **`Schedule`**.
3. Save. The ad set now optimizes + reports on real, deduped bookings.

**OR — create a clean named custom conversion (if you want a custom name/value):**
1. Events Manager → **Custom Conversions** → **Create**.
2. Data source: **AutoLander Web**.
3. **Conversion event: `Schedule`** (a standard event) — **do NOT** choose "All URL traffic"/a URL rule.
4. (Optional) add rule `content_name = demo_booked` for extra specificity. **Do not add any URL condition.**
5. Name it e.g. **"Demo Booked (Verified)"**; set a value if you use value optimization.
6. Point the campaign/ad set at this new conversion.

**Critical:** do **not** simply duplicate "Demo Booked Calendly" — that reproduces the leak. Switch the campaign **off** the URL‑based one (archive/pause it once the new one is live).

**Optional cleanup — automatic events:** Meta's automatic event detection was inferring `SubscribedButtonClick` from time‑slot button clicks. As long as the campaign optimizes on `Schedule` (above), these are just noise, not counted conversions. If you want them gone: Events Manager → the dataset → **Settings** → turn off automatic/"track events without code" button detection.

---

## 3. What the site/code already does correctly (so you can trust the `Schedule` event)

- **Genuine‑booking gate:** the thank‑you page fires the browser `Schedule` pixel **only** after redeeming a **single‑use, 128‑bit, 30‑minute** token that `/api/book` mints **only** on a successful Calendly booking. A bare visit, refresh, shared link, or bot to `/thank-you` redeems nothing → no conversion.
- **Pixel ↔ CAPI dedup:** the browser `Schedule` and the server‑side (Calendly `invitee.created` webhook) `Schedule` carry the **same** `event_id` = `cal_<sha256(Calendly event URI)>`, so Meta merges them into **one** conversion.
- **Injection‑proof:** the open `/capi/track` endpoint hard‑refuses any attempt to inject a `Schedule` (returns 403 before sending anything).
- **Admin dashboard:** the headline "Booked Demos" number counts each signed Calendly booking exactly once (sourced from the webhook, dedupe‑guarded) — it is **not** doubled by the browser+server pixels and **cannot** be inflated by `/thank-you` reloads.

---

## 4. Live end‑to‑end proof (run 2026‑06‑20)

A real test booking was created against the live system and then cancelled:

```
availability      → 200, 749 slots
POST /api/book     → 200 {ok:true, redirectPath:/thank-you, bt:bd3a0bb3…}   (real booking + single-use token)
POST /capi/confirm → 200 {ok:true, eventId:"cal_b83ab1a5…"}                  (redeems token; returns SHARED dedup id)
confirm AGAIN      → 403 unrecognized_token                                  (single-use proven)
direct /thank-you (no token) → fires PageView only, NO Schedule
```

The test Calendly event was cancelled immediately (no real demo left on the calendar).

---

## 5. Independent verification

This wasn't a single opinion. The findings were cross‑checked by **three independent audit passes** plus an **independent model (Codex / GPT‑5.5)** reading the real repository:

- **Conversion‑misfire audit:** SAFE on all four axes (no fire without a booking; no double‑fire; no injection; single‑use token solid).
- **Booking‑success audit:** SHIP — no path shows "booked" without a real Calendly event; every failure surfaces a retryable message.
- **Admin‑counting audit:** the headline "Booked Demos" KPI is trustworthy.
- **Codex verdict:** **AGREE‑WITH‑NOTES** — confirmed the outage fix, the Meta‑URL inflation, and the dedup design, all with file‑level citations.

---

## 6. Small code hardening (this PR)

Additive, low‑risk, verified safe by the audits + Codex:

- **A. `/capi/confirm` now requires an `Origin` header** (mirrors `/capi/track`), so a leaked one‑time `bt` token can't be redeemed from a non‑browser context. (Browser CORS POSTs always send `Origin`, so real conversions are unaffected.)
- **B. Admin dedupe‑health metric excludes `Schedule`** (its browser leg bypasses the Worker, which was skewing the health %). The "Booked Demos" KPI is unchanged.
- **C. `fb:app_id` meta tag** — pending the Facebook App ID (see below).

---

## 7. About the `fb:app_id` warning

The validator message ("missing `fb:app_id`") is a **Sharing‑Debugger recommendation**, not a tracking or delivery problem. It only affects domain‑insights attribution on shared links. Adding it removes the warning; it will **not** change ad performance or conversions. It's a 1‑line meta tag we can add once you provide your Facebook App ID.

---

## 8. Other open items (your side, in Meta)

- **CAPI access token longevity:** the Conversions API token is configured and working. If it was generated as a short‑lived user token it will expire and the server‑side `Schedule` will stop. Recommended: use a **System User token** (Business Settings → System Users) with `ads_management` on the dataset, which doesn't expire.
- **Banned ad account `50737337`:** Meta disabled it ("unusual activity"). This needs a Meta account‑review appeal; it's unrelated to the site/code. The active account is `1965312034075450` ("Autolander").
- **Verify dedup in Events Manager:** open the `Schedule` event → it should show received from **Browser and Server** and **Deduplicated**.

---

## Bottom line for the colleague

The booking funnel is healthy and the conversion *plumbing* is correct and independently verified. The remaining inflation is a **single Meta Ads setting** — the `/thank-you` URL‑based custom conversion — which must be rebuilt on the `Schedule` event. Once that's switched, reported demos should track real CRM bookings, and the campaign will optimize toward actual dealers instead of `/thank-you` page loads.
