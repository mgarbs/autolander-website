import { getAttributionPayload } from '../../lib/identity.js';

// Builds the `attribution` object the cloud CheckoutRequest.attribution /
// Stripe metadata block expects (design doc §1/§4/§7): reuses the same
// al_vid visitor id + al_attr UTM/meta-id cookie + fbp/fbc that the rest of
// the site already tracks with (src/lib/identity.js), just remapped onto the
// field names the cloud contract uses. The Worker pay proxy additionally
// stamps client_ip + user_agent server-side — we never send those from the
// browser (a browser-supplied IP/UA would be worthless for fraud/attribution
// review).
export function buildAttributionSnapshot() {
  const payload = getAttributionPayload();
  const utms = payload.utms || {};
  const firstTouch = payload.firstTouch || {};
  const page = payload.page || {};

  return {
    source: 'website',
    utm_source: utms.utm_source || '',
    utm_medium: utms.utm_medium || '',
    utm_campaign: utms.utm_campaign || '',
    utm_content: utms.utm_content || '',
    utm_term: utms.utm_term || '',
    meta_campaign_id: utms.campaign_id || utms.utm_id || '',
    meta_adset_id: utms.adset_id || '',
    meta_ad_id: utms.ad_id || '',
    fbc: payload.fbc || '',
    fbp: payload.fbp || '',
    fbclid: payload.fbclid || '',
    first_touch_source: firstTouch.utm_source || firstTouch.site_source_name || '',
    last_touch_source: utms.utm_source || utms.site_source_name || '',
    visitor_id: payload.vid || '',
    event_source_url: page.current_page || (typeof window !== 'undefined' ? window.location.href : ''),
    referrer: page.referrer || (typeof document !== 'undefined' ? document.referrer || '' : ''),
  };
}
