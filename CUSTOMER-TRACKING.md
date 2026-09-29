# Website and app customer tracking

This branch pairs with the app's `codex/customer-attribution-lifecycle` branch.
The companion desktop release is v3.80.7.

GA4 uses the first-party `al-tags-v1.js` facade: `zaraz` mode sends through
Cloudflare's GA4 tool; `legacy` mode loads gtag on interaction, tab hiding or
8 seconds after load; `off` sends nothing on previews and excluded paths.
The Worker controls injection through TRACKING KV `cfg:zaraz_mode`
(`off` / `canary` / `on`, with a 60-second cache). The default is off.

There is no browser pixel; Meta = `/capi/track` only for browser-originated
events. Verified Lead and AIScanRequest remain server-owned API events.
Static SEO pages remain GA-only, while preserving `_fbp`/`_fbc` for later
SPA events. The GA kill switch never affects Meta. Payment tokens are
redacted to `/pay/:token` in GA and Meta URLs, paths and referrers.
Known-visitor matching is implemented but defaults off.

Demo attribution falls back from organic first touch to paid cookie data, then
submit-time page/referrer and the request Referer. CRM utm_source/utm_medium default
to direct/none, using the existing field IDs. The contact source, tag, workflow,
Lead confirmation proof, deterministic Lead ID, Gateway and webhook set are preserved.

Downloads now open `/download/setup/`. That static page downloads the existing
installer asset and offers a plain Open AutoLander step. The signed attribution
handoff stays behind the button and is never rendered as a setup code. It has no
advertising/analytics scripts and sends no handoff token to GitHub. The snapshot
is captured before navigation. Browser storage is optional; cookie and safe direct
fallbacks keep downloads/signup usable during a tracking outage.

The Worker uses `ATTRIBUTION_SIGNING_SECRET` (random 32+ bytes) for these endpoints:

- `POST /api/attribution/token`: signs browser attribution, ignoring public CRM
  identity claims; can preserve trusted identity from a verified previous token.
- `POST /api/attribution/verify`: validates signature, issuer/audience, version,
  timestamps and size; returns accepted attribution to cloud.
- `POST /api/apply`: additionally returns a signed setup code after accepted GHL
  processing when signing is configured. Signing failure cannot break a demo lead.

Only cloud consumes the verified identity. GHL contact claims from a demo are bound
to signup email/phone hashes. Tokens expire in 30 days and responses are not cached.
No new shared secret is needed in cloud: its default verification URL is the Worker.

Deployment order: configure/deploy Worker -> additive app schema/backend -> new
desktop installers -> website handoff. Follow the app repository's local-test and
ship gates. Existing installed versions will ignore the new token until updated.

Validation commands: `npm test`, `npm run lint`, `npm run build`. Companion app
regressions cover signup, customer reuse, retries, billing identity and the desktop
handoff. Post-deployment checks must inspect actual Stripe customer.created,
PageView coverage, OutboundClick fields and Ads Manager Lead counts.
