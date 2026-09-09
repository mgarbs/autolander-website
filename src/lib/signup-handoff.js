import { getAttributionPayload } from './identity.js';
import { readOrganicAttribution } from './organic-attribution.js';

// Save the browser snapshot before opening a new tab. The setup page is a small
// static page with no analytics scripts; signed codes never reach Pixel or GA.
export function openSignupHandoff({ os = 'windows', referralCode = '', eventId = '', openApp = false } = {}) {
  try {
    window.localStorage.setItem('al_signup_handoff_context', JSON.stringify({
      saved_at: Date.now(), attribution: getAttributionPayload(), organic_attribution: readOrganicAttribution() || {},
    }));
  } catch { /* The setup page can still use cookies when storage is unavailable. */ }
  const url = new URL('/download/setup/', window.location.origin);
  url.searchParams.set('os', ['windows', 'mac', 'linux'].includes(os) ? os : 'windows');
  if (/^[a-z0-9]{4,64}$/.test(referralCode)) url.searchParams.set('ref', referralCode);
  if (eventId) url.searchParams.set('fb_event_id', eventId);
  if (openApp) url.searchParams.set('open', '1');
  // Keep this synchronous with the click so browser popup protection permits it.
  const tab = window.open(url.href, '_blank');
  if (tab) tab.opener = null;
  else window.location.assign(url.href);
}
