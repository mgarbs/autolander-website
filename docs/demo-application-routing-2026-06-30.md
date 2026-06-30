# Demo Application Routing

As of 2026-06-30, the production form intentionally posts to the Cloudflare Worker hostname:

`https://autolander-chatbot.michaelegarber.workers.dev/api/apply`

The Worker is also configured with routes for `autolander.ai/api/*` and `autolander.ai/capi/*`, but those routes cannot intercept live traffic until the production hostname is proxied through Cloudflare. Current public DNS for `autolander.ai` resolves directly to GitHub Pages IPs, so `https://autolander.ai/api/apply` still returns the static host's `405`.

Temporary production architecture:

- Website form -> Worker URL `/api/apply`
- Thank-you conversion gate -> Worker URL `/capi/confirm`
- Worker CORS allowlist -> `https://autolander.ai`, `https://www.autolander.ai`, approved preview/local origins
- Browser never receives GHL or Meta secrets

When `autolander.ai` is proxied through Cloudflare, remove the public Worker URL values from `.env` and let the frontend use same-origin `/api/apply` and `/capi/confirm`.
