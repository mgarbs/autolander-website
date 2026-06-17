# Publishing the preview to `preview.autolander.ai`

The leveled-up site lives on the `preview-subdomain-redesign` branch and deploys to a **separate
Cloudflare Pages project** (`autolander-preview`), fully isolated from the GitHub Pages production
deploy. Production (`autolander.ai`) is never touched by any of this.

`wrangler` isn't installed globally, so every command uses `npx wrangler` (downloads on first run).
You can also `npm i -g wrangler` if you prefer.

## 1. Authenticate (interactive — opens a browser)

Run this in the session with the `!` prefix so the browser handshake completes:

```
! npx wrangler login
```

## 2. Build the pixel-off preview bundle

```
npm run build:preview
```

This produces `dist/` with the Meta Pixel **disabled** and a `noindex` tag, so internal review
traffic never pollutes your live Meta attribution and the preview never competes with the
production site in search. Booking + chat still work (they use the shared Worker).

## 3. Create + deploy the Cloudflare Pages project

First run creates the project; later runs redeploy it.

```
npx wrangler pages deploy dist --project-name autolander-preview --branch production
```

The command prints a live URL like `https://autolander-preview.pages.dev` — **shareable
immediately** with your team while DNS for the custom domain propagates.

## 4. Map the custom domain `preview.autolander.ai`

In the Cloudflare dashboard: **Workers & Pages → autolander-preview → Custom domains → Set up a
custom domain → `preview.autolander.ai` → Activate**.

- If `autolander.ai` DNS is on Cloudflare, the required `CNAME` is created automatically.
- If DNS is elsewhere, add a `CNAME` record: `preview` → `autolander-preview.pages.dev`.

The root `autolander.ai` record is untouched.

## 5. Allow the preview origin on the Worker (one-time)

The native booking calendar + chat call the `autolander-chatbot` Worker, which checks an
allow-list. The preview origins (`https://preview.autolander.ai`,
`https://autolander-preview.pages.dev`) are already added to `worker/wrangler.toml`
`ALLOWED_ORIGINS` (additive — every existing origin is preserved). Redeploy the Worker once to
apply:

```
cd worker
npx wrangler deploy
cd ..
```

> This redeploys the **production** Worker. The change is purely additive (new origins only), so it
> does not affect existing traffic. If you'd rather not redeploy code, you can instead edit the
> `ALLOWED_ORIGINS` variable on the Worker in the Cloudflare dashboard. Until this is done, booking
> on the preview gracefully falls back to the Calendly popup, so the preview is still usable.

## Re-deploying after more changes

```
npm run build:preview
npx wrangler pages deploy dist --project-name autolander-preview --branch production
```

## When you're ready to go live

This preview is intentionally separate. Promoting it to production is a normal merge of
`preview-subdomain-redesign` → `main` (which triggers the existing GitHub Pages deploy to
`autolander.ai`). Do that only after sign-off — and note the production build keeps the Meta Pixel
**on** (the pixel-off + noindex behavior is preview-only).
