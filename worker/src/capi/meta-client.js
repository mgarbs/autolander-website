const META_GRAPH_VERSION = 'v19.0';

export const ACTION_SOURCE = {
  website: 'website',
  systemGenerated: 'system_generated',
};

export function buildEvent({
  name,
  eventId,
  eventTime,
  sourceUrl,
  actionSource = ACTION_SOURCE.website,
  userData = {},
  customData = {},
}) {
  const cleanedUserData = {};
  for (const [key, value] of Object.entries(userData)) {
    if (value === null || value === undefined || value === '') continue;
    cleanedUserData[key] = value;
  }

  const cleanedCustomData = {};
  for (const [key, value] of Object.entries(customData)) {
    if (value === null || value === undefined) continue;
    cleanedCustomData[key] = value;
  }

  const event = {
    event_name: name,
    event_time: Math.floor(eventTime || Date.now() / 1000),
    event_id: eventId,
    action_source: actionSource,
    user_data: cleanedUserData,
  };

  if (sourceUrl) event.event_source_url = sourceUrl;
  if (Object.keys(cleanedCustomData).length > 0) event.custom_data = cleanedCustomData;

  return event;
}

export async function sendEvents(env, events, { logger = console, testEventCode = '' } = {}) {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    logger.warn?.('[capi] Missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN, skipping send');
    return { ok: false, reason: 'missing_credentials' };
  }

  const url = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/${env.META_PIXEL_ID}/events`);
  url.searchParams.set('access_token', env.META_CAPI_ACCESS_TOKEN);

  const body = { data: events };
  const resolvedTestEventCode = String(testEventCode || env.META_TEST_EVENT_CODE || '').trim();
  if (resolvedTestEventCode) body.test_event_code = resolvedTestEventCode;

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text();
      logger.error?.('[capi] Meta CAPI rejected events', response.status, detail.slice(0, 400));
      return { ok: false, status: response.status, detail: detail.slice(0, 400) };
    }

    return { ok: true };
  } catch (err) {
    logger.error?.('[capi] Meta CAPI request failed', err?.message || err);
    return { ok: false, reason: 'fetch_error' };
  }
}
