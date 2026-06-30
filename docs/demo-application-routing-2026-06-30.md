# Demo Application Routing

As of 2026-06-30, the production form posts to the Cloudflare Worker route on the primary hostname:

`https://autolander.ai/api/apply`

The Worker is configured with routes for `autolander.ai/api/*` and `autolander.ai/capi/*`. These routes were verified with live `OPTIONS` and invalid `POST` checks after Cloudflare routing became active.

Production architecture:

- Website form -> `https://autolander.ai/api/apply`
- Thank-you conversion gate -> `https://autolander.ai/capi/confirm`
- Worker CORS allowlist -> `https://autolander.ai`, `https://www.autolander.ai`, approved preview/local origins
- Browser never receives GHL or Meta secrets
