const TRACKING_KEYS = [
  'ghl_contact_id',
  'external_id',
  'fbc',
  'fbp',
  'fbclid',
  'campaign_id',
  'adset_id',
  'ad_id',
  'event_source_url',
];

const DEFAULT_SUCCESS_URL = 'https://autolander.ai/thank-you.html?checkout=success';
const DEFAULT_CANCEL_URL = 'https://autolander.ai/admin';

function stripeKey(env) {
  return env.STRIPE_SECRET_KEY || env.STRIPE_RESTRICTED_KEY || '';
}

function cloudBase(env) {
  return String(
    env.AUTOLANDER_CLOUD_URL || env.CLOUD_API_URL || 'https://autolander-cloud.onrender.com',
  ).replace(/\/+$/, '');
}

async function resolveAccountCustomer(env, orgId, signal) {
  if (!env.OPS_ADMIN_TOKEN) {
    return { ok: false, status: 503, reason: 'ops_not_configured', message: 'Account customer resolution is not configured.' };
  }
  let response;
  try {
    response = await fetch(`${cloudBase(env)}/api/ops/billing/customer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPS_ADMIN_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orgId }),
      signal,
    });
  } catch (error) {
    return { ok: false, status: 502, reason: 'customer_resolution_failed', message: String(error?.message || error).slice(0, 200) };
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.customerId || body.orgId !== orgId || !body.autolanderUserId) {
    return {
      ok: false,
      status: response.status >= 400 && response.status < 500 ? response.status : 502,
      reason: 'customer_resolution_failed',
      message: body.message || 'The selected account billing customer could not be resolved.',
    };
  }
  return { ok: true, ...body };
}

function normalizeText(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeEmail(value) {
  return normalizeText(value, 320).toLowerCase();
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeInterval(value) {
  const raw = normalizeText(value, 20).toLowerCase();
  if (raw === 'annual' || raw === 'year' || raw === 'yearly') {
    return { form: 'year', metadata: 'annual' };
  }
  return { form: 'month', metadata: 'monthly' };
}

function normalizeAmountCents(body) {
  const rawCents = body.amountCents ?? body.amount_cents;
  if (rawCents !== undefined && rawCents !== null && rawCents !== '') {
    const cents = Number(rawCents);
    return Number.isInteger(cents) ? cents : NaN;
  }

  const dollars = Number(String(body.amount || body.amountDollars || '').replace(/[$,]/g, ''));
  if (!Number.isFinite(dollars)) return NaN;
  return Math.round(dollars * 100);
}

function collectTracking(body) {
  const tracking = {};
  const sources = [
    body?.tracking && typeof body.tracking === 'object' ? body.tracking : null,
    body,
  ];

  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of TRACKING_KEYS) {
      if (tracking[key]) continue;
      const value = normalizeText(source[key], key === 'event_source_url' ? 1000 : 500);
      if (value) tracking[key] = value;
    }
  }

  return tracking;
}

function appendMetadata(params, prefix, metadata) {
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(`${prefix}[${key}]`, String(value).slice(0, 500));
  }
}

export async function createAdminSubscriptionLink(request, env) {
  const key = stripeKey(env);
  if (!key) {
    return {
      ok: false,
      status: 503,
      body: { ok: false, reason: 'stripe_not_configured' },
    };
  }

  const body = await safeJson(request);
  const amountCents = normalizeAmountCents(body);
  if (!Number.isInteger(amountCents) || amountCents < 100) {
    return {
      ok: false,
      status: 400,
      body: { ok: false, reason: 'invalid_amount', message: 'Amount must be at least $1.00.' },
    };
  }

  if (amountCents > 10000000) {
    return {
      ok: false,
      status: 400,
      body: { ok: false, reason: 'amount_too_large', message: 'Amount is too large.' },
    };
  }

  const interval = normalizeInterval(body.interval);
  const customerEmail = normalizeEmail(body.customerEmail || body.email);
  if (customerEmail && !looksLikeEmail(customerEmail)) {
    return {
      ok: false,
      status: 400,
      body: { ok: false, reason: 'invalid_email', message: 'Customer email is invalid.' },
    };
  }

  const customerName = normalizeText(body.customerName || body.name, 160);
  const customerPhone = normalizeText(body.customerPhone || body.phone, 64);
  const label = normalizeText(body.label || body.planLabel || 'AutoLander Subscription', 120);
  // Optional fully-automatic account linking: when the admin picks an account,
  // orgId rides along in BOTH metadata and subscription_data[metadata] below, so
  // the cloud checkout webhook provisions that org with zero manual steps.
  // pickedOrgName is for humans reading the Stripe dashboard only.
  const orgId = normalizeText(body.orgId || body.org_id, 200);
  const pickedOrgName = normalizeText(body.pickedOrgName || body.orgName, 160);
  const tracking = collectTracking(body);
  const clientReferenceId = normalizeText(
    tracking.ghl_contact_id || tracking.external_id || customerEmail || customerPhone,
    200,
  );

  const customerIdentity = orgId
    ? await resolveAccountCustomer(env, orgId, request.signal)
    : null;
  if (customerIdentity && !customerIdentity.ok) {
    return {
      ok: false,
      status: customerIdentity.status,
      body: {
        ok: false,
        reason: customerIdentity.reason,
        message: customerIdentity.message,
      },
    };
  }

  const metadata = {
    source: 'website_admin_subscription_link',
    purchase_source: 'website_admin',
    product: 'posting_subscription',
    plan: label,
    interval: interval.metadata,
    amount_cents: String(amountCents),
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    ...(customerName ? { customer_name: customerName } : {}),
    ...(customerPhone ? { customer_phone: customerPhone } : {}),
    ...(orgId ? { orgId } : {}),
    ...(orgId ? { autolander_account_id: orgId } : {}),
    ...(customerIdentity?.autolanderUserId
      ? { autolander_user_id: customerIdentity.autolanderUserId }
      : {}),
    ...(orgId && pickedOrgName ? { pickedOrgName } : {}),
    ...tracking,
  };

  const successUrl = normalizeText(body.successUrl, 1000) || env.STRIPE_MANUAL_SUCCESS_URL || DEFAULT_SUCCESS_URL;
  const cancelUrl = normalizeText(body.cancelUrl, 1000) || env.STRIPE_MANUAL_CANCEL_URL || DEFAULT_CANCEL_URL;

  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('payment_method_types[0]', 'card');
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', String(amountCents));
  params.append('line_items[0][price_data][recurring][interval]', interval.form);
  params.append('line_items[0][price_data][product_data][name]', label);
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('phone_number_collection[enabled]', 'true');
  params.append('billing_address_collection', 'required');
  params.append('automatic_tax[enabled]', 'true');
  if (customerIdentity?.customerId) params.append('customer', customerIdentity.customerId);
  else if (customerEmail) params.append('customer_email', customerEmail);
  if (clientReferenceId) params.append('client_reference_id', clientReferenceId);
  appendMetadata(params, 'metadata', metadata);
  appendMetadata(params, 'subscription_data[metadata]', metadata);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const stripeBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status >= 500 ? 502 : response.status,
      body: {
        ok: false,
        reason: 'stripe_error',
        message: stripeBody?.error?.message || 'Stripe could not create the checkout link.',
      },
    };
  }

  return {
    ok: true,
    status: 200,
    body: {
      ok: true,
      checkoutUrl: stripeBody.url,
      sessionId: stripeBody.id,
      amountCents,
      interval: interval.metadata,
      metadata,
    },
  };
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
