const STORAGE_KEY = 'al_attrib';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function clean(value, max) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}

function defaultStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readOrganicAttribution(storage = defaultStorage()) {
  if (!storage) return null;
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return {
      utm_source: clean(parsed.utm_source, 180),
      utm_medium: clean(parsed.utm_medium, 180),
      utm_campaign: clean(parsed.utm_campaign, 180),
      utm_content: clean(parsed.utm_content, 180),
      utm_term: clean(parsed.utm_term, 180),
      landing_page: clean(parsed.landing_page, 500),
      referrer_url: clean(parsed.referrer_url, 1200),
      first_seen: clean(parsed.first_seen, 40),
    };
  } catch {
    return null;
  }
}

export function mergeOrganicAttribution(attribution, organicAttribution) {
  const current = attribution && typeof attribution === 'object' ? attribution : {};
  const currentUtms = current.utms && typeof current.utms === 'object' ? current.utms : {};
  const fallbackUtms = {};
  for (const key of UTM_KEYS) {
    const value = clean(organicAttribution?.[key], 180);
    if (value) fallbackUtms[key] = value;
  }
  return {
    ...current,
    // URL/cookie values from the existing attribution path are applied last so paid
    // UTMs always win without changing any Meta click-ID or first-touch behavior.
    utms: { ...fallbackUtms, ...currentUtms },
  };
}

function referrerDomain(value) {
  try {
    return value ? new URL(value).hostname.toLowerCase().replace(/^www\./, '').slice(0, 100) : '';
  } catch {
    return '';
  }
}

function landingPath(value) {
  const text = clean(value, 500);
  if (!text) return '';
  const path = text.split('?')[0] || '/';
  // Keep individual referral codes out of GA4's custom-dimension cardinality
  // while preserving the exact first landing page in GHL.
  const referralRoute = path.match(/^\/(ref|r)\/[^/]+\/?$/i);
  if (referralRoute) return `/${referralRoute[1].toLowerCase()}/:code`;
  if (/^\/pay\/[^/]+\/?$/.test(path)) return '/pay/:token';
  return path.slice(0, 100);
}

export function trackGoogleLead(attribution, organicAttribution, analytics) {
  let gtag = analytics;
  if (!gtag) {
    try {
      gtag = typeof window !== 'undefined' ? window.gtag : null;
    } catch {
      gtag = null;
    }
  }
  if (typeof gtag !== 'function') return false;

  const utms = attribution?.utms || {};
  try {
    gtag('event', 'generate_lead', {
      method: 'demo_application',
      lead_source: clean(utms.utm_source, 100),
      lead_medium: clean(utms.utm_medium, 100),
      first_landing_page: landingPath(organicAttribution?.landing_page),
      first_referrer_domain: referrerDomain(organicAttribution?.referrer_url),
    });
    return true;
  } catch {
    // Analytics must never interfere with a completed CRM submission.
    return false;
  }
}
