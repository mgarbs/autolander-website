import { AUTOLANDER_KNOWLEDGE } from './autolander-knowledge.js';
import { sha256Hex } from './capi/hash.js';
import { saveSupportRequest } from './support/storage.js';
import { handleSiteRequest, isApiPath } from './agent/site.js';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://autolander.ai',
  'https://www.autolander.ai',
  'https://mgarbs.github.io',
  'http://localhost:5173',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5176',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'handoff', 'handoffReason', 'suggestedAction'],
  properties: {
    answer: {
      type: 'string',
      description:
        'A concise, user-facing answer. Keep it under 180 words; short numbered steps are OK for setup or troubleshooting.',
    },
    handoff: {
      type: 'boolean',
      description: 'True when a human should handle the next step.',
    },
    handoffReason: {
      type: 'string',
      description: 'Short reason for handoff, or an empty string when not needed.',
    },
    suggestedAction: {
      type: 'string',
      enum: ['continue', 'book_demo', 'contact_support', 'download'],
      description: 'Best next action for the user.',
    },
  },
};

const SUPPORT_SUBJECT = 'AutoLander support request';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname.toLowerCase() === 'www.autolander.ai') {
      url.protocol = 'https:';
      url.hostname = 'autolander.ai';
      url.port = '';
      return Response.redirect(url.toString(), 308);
    }

    // Public-site requests (everything that is not one of this Worker's API endpoints).
    // The zone route is autolander.ai/*, so the Worker now sees ordinary page traffic; it must
    // pass it straight through to GitHub Pages, only stepping in for Accept-negotiated Markdown
    // and agent-recoverable 404s. See worker/src/agent/site.js.
    //
    // This runs BEFORE the CORS/allowed-origin gate below on purpose: that gate answers 403 to
    // any request carrying an unknown Origin, which is correct for a JSON API and catastrophic
    // for a web page. It also fails OPEN — any error and we serve exactly what the origin serves,
    // so a bug in the agent layer can never take the marketing site down.
    //
    // Gated to the apex host on purpose. This Worker is ALSO reachable on
    // autolander-chatbot.<account>.workers.dev (preview builds call it there, see .env.preview),
    // and there is no static origin behind that hostname — a passthrough fetch() would resolve
    // straight back into this Worker and loop until Cloudflare killed the subrequest chain.
    if (url.hostname.toLowerCase() === 'autolander.ai' && !isApiPath(url.pathname)) {
      try {
        return await handleSiteRequest(request, url);
      } catch (err) {
        try {
          console.error('[worker] agent-layer fallthrough', url.pathname, err?.stack || err);
        } catch { /* ignore */ }
        return fetch(request);
      }
    }

    const corsHeaders = getCorsHeaders(request, env);

    try {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const originCheck = isAllowedOrigin(request, env);
    if (!originCheck.ok) {
      return jsonResponse(
        {
          message: 'This endpoint is only available from approved AutoLander sites.',
        },
        403,
        corsHeaders
      );
    }

    if (url.pathname.startsWith('/capi/')) {
      const { handleCapi } = await import('./capi/router.js');
      return handleCapi(request, env, corsHeaders, ctx);
    }

    if (url.pathname.startsWith('/api/')) {
      const { handleBooking } = await import('./booking/router.js');
      return handleBooking(request, env, corsHeaders, ctx);
    }

    if (url.pathname.startsWith('/admin-api/')) {
      const { handleAdmin } = await import('./admin/router.js');
      return handleAdmin(request, env, corsHeaders, ctx);
    }

    if (url.pathname === '/chat' && request.method === 'POST') {
      return handleChat(request, env, corsHeaders);
    }

    if (url.pathname === '/support' && request.method === 'POST') {
      return handleSupport(request, env, corsHeaders);
    }

    if (url.pathname === '/health') {
      return jsonResponse({ ok: true }, 200, corsHeaders);
    }

    return jsonResponse({ message: 'Not found' }, 404, corsHeaders);
    } catch (err) {
      // Never let a handler throw a bare 500 (no CORS headers) — that surfaces in
      // the browser as an opaque "Failed to fetch". Return a real, CORS-clean error.
      try {
        console.error('[worker] unhandled', request.method, new URL(request.url).pathname, err?.stack || err);
      } catch { /* ignore */ }
      return jsonResponse(
        { ok: false, reason: 'server_error', error: String(err?.message || err).slice(0, 200) },
        500,
        corsHeaders,
      );
    }
  },

  // No-op after the demo flow moved from calendar booking to CRM applications.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.resolve({ ok: true }));
  },
};

async function handleChat(request, env, headers) {
  if (!env.OPENAI_API_KEY) {
    return handoffResponse(
      'Chat is not configured yet. Email sales@autolander.ai or book a demo and we will help directly.',
      'Missing OPENAI_API_KEY',
      503,
      headers
    );
  }

  const body = await safeJson(request);
  const message = sanitizeText(body.message, 600);
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];

  if (!message) {
    return jsonResponse({ message: 'Message is required.' }, 400, headers);
  }

  const turnstile = await verifyTurnstile(request, env, body.turnstileToken);
  if (!turnstile.ok) {
    return handoffResponse(
      'Chat is protected from automated abuse. Refresh the page and try again, or contact support directly.',
      turnstile.reason,
      403,
      headers
    );
  }

  const rateLimit = await enforceRateLimits(request, env, 'chat');
  if (!rateLimit.ok) {
    return handoffResponse(
      `Chat volume is capped for now to protect service costs. Email ${supportEmail(env)} or book a demo and we will help directly.`,
      rateLimit.reason,
      rateLimit.status,
      headers
    );
  }

  const input = buildModelInput(conversation, message);
  const modelResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-5.4-mini',
      instructions: buildInstructions(env),
      input,
      max_output_tokens: Number(env.MAX_OUTPUT_TOKENS || 360),
      store: false,
      text: {
        format: {
          type: 'json_schema',
          name: 'autolander_chat_response',
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
    }),
  });

  if (!modelResponse.ok) {
    const detail = await modelResponse.text();
    console.error('OpenAI request failed', modelResponse.status, detail.slice(0, 500));
    return handoffResponse(
      `I cannot answer from chat right now. Email ${supportEmail(env)} or book a demo and we will help directly.`,
      'OpenAI request failed',
      502,
      headers
    );
  }

  const data = await modelResponse.json();
  const parsed = parseStructuredResponse(data);
  if (!parsed) {
    return handoffResponse(
      `I am not confident enough to answer that automatically. Email ${supportEmail(env)} or book a demo and we will help directly.`,
      'Unparseable model response',
      200,
      headers
    );
  }

  return jsonResponse(
    {
      answer: parsed.answer,
      handoff: parsed.handoff,
      handoffReason: parsed.handoffReason,
      suggestedAction: parsed.suggestedAction,
    },
    200,
    headers
  );
}

async function handleSupport(request, env, headers) {
  const body = await safeJson(request);
  const name = sanitizeText(body.name, 120);
  const email = sanitizeText(body.email, 160);
  const phone = sanitizeText(body.phone, 40);
  const details = sanitizeText(body.details, 1500);
  const transcript = sanitizeText(body.transcript, 3000);

  if (!isEmail(email) || !phone || !details) {
    return jsonResponse(
      {
        message: 'A valid email, phone number, and support details are required.',
      },
      400,
      headers
    );
  }

  const turnstile = await verifyTurnstile(request, env, body.turnstileToken);
  if (!turnstile.ok) {
    return jsonResponse({ message: 'Turnstile verification failed.' }, 403, headers);
  }

  const rateLimit = await enforceRateLimits(request, env, 'support');
  if (!rateLimit.ok) {
    return jsonResponse(
      {
        message: 'Support request limit reached. Please email support directly.',
        mailFallback: true,
        mailto: supportMailto(env, { name, email, phone, details, transcript }),
      },
      rateLimit.status,
      headers
    );
  }

  const stored = await saveSupportRequest(env, request, { name, email, phone, details, transcript });

  if (!env.SUPPORT_WEBHOOK_URL) {
    if (stored.ok) {
      return jsonResponse({ ok: true, delivery: 'stored', supportRequestId: stored.id }, 200, headers);
    }
    return jsonResponse(
      {
        message: 'Support storage is not configured. Please email support directly.',
        mailFallback: true,
        mailto: supportMailto(env, { name, email, phone, details, transcript }),
      },
      503,
      headers
    );
  }

  const sent = await sendSupportWebhook(env, { name, email, phone, details, transcript });
  if (!sent.ok) {
    if (stored.ok) {
      return jsonResponse(
        {
          ok: true,
          delivery: 'stored',
          supportRequestId: stored.id,
          warning: 'Support webhook failed, but the request was saved in the admin inbox.',
        },
        200,
        headers
      );
    }
    return jsonResponse(
      {
        message: 'Support webhook failed. Please email support directly.',
        mailFallback: true,
        mailto: supportMailto(env, { name, email, phone, details, transcript }),
      },
      502,
      headers
    );
  }

  return jsonResponse(
    { ok: true, delivery: stored.ok ? 'webhook_and_stored' : 'webhook', supportRequestId: stored.id || null },
    200,
    headers
  );
}

function buildInstructions(env) {
  return `
You are AutoLander's website support assistant.
Use only the knowledge below. Do not invent features, pricing, integrations, policies, or guarantees.
Keep answers concise, practical, and sales/support oriented.
Answer known setup and troubleshooting topics from the knowledge first, including Facebook login, Cars.com/CarGurus feed setup, English (US) language issues, "node not clickable", macOS quarantine/xattr, posting failures, and new Facebook account posting limits.
If the known steps do not resolve the issue, or the user asks about account-specific issues, billing, refunds, legal policy, outages, security, unsupported feed sources, or anything you are not confident about, set handoff=true and route them to support or the demo application.
When your troubleshooting steps do not resolve the issue, tell the user they can open a support ticket from the Support tab inside the AutoLander app (fill out the support form and submit it) or email the team at sales@autolander.ai. On the website, the built-in Contact Support button opens the same kind of ticket.
If the user is ready to buy, compare plans, or wants implementation details for their dealership, suggest submitting the demo application.
If the user asks how to start, mention the free trial and app download.

Support email: ${supportEmail(env)}
Demo URL: ${demoUrl(env)}

Knowledge:
${AUTOLANDER_KNOWLEDGE}
`;
}

function buildModelInput(conversation, message) {
  const sanitized = conversation
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: sanitizeText(item.content, 700),
    }))
    .filter((item) => item.content);

  return [...sanitized, { role: 'user', content: message }];
}

function parseStructuredResponse(data) {
  const text = extractOutputText(data);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    return {
      answer: sanitizeText(parsed.answer, 900),
      handoff: Boolean(parsed.handoff),
      handoffReason: sanitizeText(parsed.handoffReason || '', 200),
      suggestedAction: ['continue', 'book_demo', 'contact_support', 'download'].includes(
        parsed.suggestedAction
      )
        ? parsed.suggestedAction
        : 'continue',
    };
  } catch {
    return null;
  }
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  return '';
}

async function enforceRateLimits(request, env, scope) {
  if (env.DISABLE_RATE_LIMITS === 'true') return { ok: true };
  if (!env.CHAT_RATE_LIMITS) {
    return {
      ok: false,
      status: 503,
      reason: 'Rate limit KV binding is not configured.',
    };
  }

  const now = new Date();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  const fingerprint = await sha256(`${ip}:${userAgent.slice(0, 120)}`);
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);

  const isSupport = scope === 'support';
  const limits = [
    {
      key: `${scope}:global:${day}`,
      limit: numberFromEnv(env, isSupport ? 'DAILY_SUPPORT_LIMIT' : 'DAILY_CHAT_LIMIT', isSupport ? 40 : 160),
      ttl: secondsUntilTomorrow(now),
      reason: 'Daily global limit reached.',
    },
    {
      key: `${scope}:ip:${fingerprint}:${day}`,
      limit: numberFromEnv(env, isSupport ? 'SUPPORT_IP_DAILY_LIMIT' : 'IP_DAILY_LIMIT', isSupport ? 3 : 12),
      ttl: secondsUntilTomorrow(now),
      reason: 'Daily visitor limit reached.',
    },
    {
      key: `${scope}:ip:${fingerprint}:${hour}`,
      limit: numberFromEnv(env, isSupport ? 'SUPPORT_IP_HOURLY_LIMIT' : 'IP_HOURLY_LIMIT', isSupport ? 2 : 5),
      ttl: 60 * 60 + 120,
      reason: 'Hourly visitor limit reached.',
    },
  ];

  const currentValues = await Promise.all(
    limits.map(async (limit) => {
      const value = await env.CHAT_RATE_LIMITS.get(limit.key);
      return Number(value || 0);
    })
  );

  const blocked = limits.find((limit, index) => currentValues[index] >= limit.limit);
  if (blocked) {
    return { ok: false, status: 429, reason: blocked.reason };
  }

  await Promise.all(
    limits.map((limit, index) =>
      env.CHAT_RATE_LIMITS.put(limit.key, String(currentValues[index] + 1), {
        expirationTtl: limit.ttl,
      })
    )
  );

  return { ok: true };
}

async function verifyTurnstile(request, env, token) {
  const requiresTurnstile = env.REQUIRE_TURNSTILE === 'true';
  if (!env.TURNSTILE_SECRET_KEY) {
    return requiresTurnstile
      ? { ok: false, reason: 'TURNSTILE_SECRET_KEY is required.' }
      : { ok: true };
  }

  if (!token) {
    return requiresTurnstile ? { ok: false, reason: 'Missing Turnstile token.' } : { ok: true };
  }

  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  formData.append('remoteip', request.headers.get('CF-Connecting-IP') || '');

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const result = await response.json().catch(() => ({}));

  return result.success ? { ok: true } : { ok: false, reason: 'Turnstile verification failed.' };
}

async function sendSupportWebhook(env, payload) {
  const text = [
    'New AutoLander support request',
    `Name: ${payload.name || 'Not provided'}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || 'Not provided'}`,
    '',
    payload.details,
    payload.transcript ? `\nRecent chat:\n${payload.transcript}` : '',
  ].join('\n');

  const type = (env.SUPPORT_WEBHOOK_TYPE || 'generic').toLowerCase();
  const body =
    type === 'discord'
      ? { content: text }
      : type === 'slack'
        ? { text }
        : { event: 'autolander_support_request', ...payload };

  const response = await fetch(env.SUPPORT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return { ok: response.ok };
}

function handoffResponse(answer, reason, status, headers) {
  return jsonResponse(
    {
      answer,
      handoff: true,
      handoffReason: reason,
      suggestedAction: 'contact_support',
    },
    status,
    headers
  );
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function supportEmail(env) {
  return env.SUPPORT_EMAIL || 'sales@autolander.ai';
}

function demoUrl(env) {
  return env.DEMO_URL || 'https://autolander.ai/';
}

function supportMailto(env, payload) {
  const body = [
    payload.details,
    '',
    `Name: ${payload.name || 'Not provided'}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || 'Not provided'}`,
    payload.transcript ? `\nRecent chat:\n${payload.transcript}` : '',
  ].join('\n');

  return `mailto:${supportEmail(env)}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}&body=${encodeURIComponent(body)}`;
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = isAllowedOrigin(request, env);

  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
  if (allowed.ok && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return { ok: true };

  const allowedOrigins = listFromEnv(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);
  if (allowedOrigins.includes(origin)) return { ok: true };
  if (env.ALLOW_LOCALHOST === 'true' && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return { ok: true };
  }
  // Cloudflare Pages previews for this project (e.g. autolander-book.pages.dev, branch previews).
  if (/^https:\/\/([a-z0-9-]+\.)?autolander-[a-z0-9-]+\.pages\.dev$/.test(origin)) return { ok: true };

  return { ok: false };
}

function listFromEnv(value, fallback) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberFromEnv(env, key, fallback) {
  const value = Number(env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function secondsUntilTomorrow(date) {
  const tomorrow = new Date(date);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return Math.max(60, Math.ceil((tomorrow.getTime() - date.getTime()) / 1000));
}

async function sha256(value) {
  return sha256Hex(value);
}
