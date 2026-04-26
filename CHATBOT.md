# AutoLander Chatbot

This repo uses a first-party chatbot instead of a hosted AI widget:

- The website stays static Vite/React.
- A Cloudflare Worker holds the OpenAI API key and exposes `/chat` and `/support`.
- Cloudflare KV enforces global, per-IP daily, and per-IP hourly limits before OpenAI is called.
- Turnstile is optional, but can be required when spam becomes a problem.
- Difficult or account-specific questions route to support or demo booking.

## Why This Path

The cheap hosted-chat options usually become expensive once AI automation, knowledge bases, or team inbox features are enabled. This setup keeps the fixed platform cost near zero on Cloudflare's free Worker tier and lets us cap OpenAI spend directly.

The main tradeoff is that human support is simple by default: a support form can forward to a webhook, or it falls back to a prefilled email. If you later want a full inbox, point the support form at Slack, Discord, Zapier, Make, Help Scout, Crisp, or another webhook-compatible tool.

## Deploy The Worker

1. Copy the Worker config:

```bash
cp worker/wrangler.toml.example worker/wrangler.toml
```

2. Create Cloudflare KV namespaces:

```bash
npx wrangler kv namespace create CHAT_RATE_LIMITS --config worker/wrangler.toml
npx wrangler kv namespace create CHAT_RATE_LIMITS --preview --config worker/wrangler.toml
```

3. Paste the returned IDs into `worker/wrangler.toml`.

4. Set secrets:

```bash
npx wrangler secret put OPENAI_API_KEY --config worker/wrangler.toml
```

5. Optional anti-spam and handoff secrets:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY --config worker/wrangler.toml
npx wrangler secret put SUPPORT_WEBHOOK_URL --config worker/wrangler.toml
```

6. Deploy:

```bash
npx wrangler deploy --config worker/wrangler.toml
```

7. Add the deployed Worker URL to the website build environment:

```bash
VITE_CHAT_API_URL=https://autolander-chatbot.YOUR_SUBDOMAIN.workers.dev
```

If you enable Turnstile on the frontend, also set:

```bash
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

## Spend Controls

Defaults in `worker/wrangler.toml.example`:

- `DAILY_CHAT_LIMIT=160`
- `IP_DAILY_LIMIT=12`
- `IP_HOURLY_LIMIT=5`
- `MAX_OUTPUT_TOKENS=360`
- `OPENAI_MODEL=gpt-5.4-mini`

For a lower-cost model, change `OPENAI_MODEL` to `gpt-5.4-nano`. For stronger answers, keep `gpt-5.4-mini`.

Do not deploy without the `CHAT_RATE_LIMITS` KV binding unless `DISABLE_RATE_LIMITS=true` is used only for local testing. The Worker intentionally refuses chat requests when rate-limit storage is missing.

## Support Handoff

The model is instructed to answer known setup and troubleshooting topics first, including Facebook login, supported inventory-feed setup, English (US) language issues, macOS quarantine/xattr launch help, posting failures, and new Facebook account posting limits.

It hands off account-specific, billing, refund, unresolved Facebook restriction, outage, legal, security, unsupported feed, or uncertain questions.

If `SUPPORT_WEBHOOK_URL` is configured:

- `SUPPORT_WEBHOOK_TYPE=slack` posts `{ text }`
- `SUPPORT_WEBHOOK_TYPE=discord` posts `{ content }`
- otherwise the Worker posts a generic JSON payload

If no webhook is configured, the website opens a prefilled email to `support@autolander.ai`.
