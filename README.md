# AutoLander Website

Static Vite/React marketing site for AutoLander.

## Chatbot

The site includes a guarded chatbot widget backed by a Cloudflare Worker. The Worker keeps the OpenAI key server-side, rate-limits requests before tokens are spent, and routes difficult questions to support.

See [CHATBOT.md](./CHATBOT.md) for deployment and configuration.

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` when the Worker is deployed:

```bash
cp .env.example .env.local
```

## Build

```bash
npm run build
```
