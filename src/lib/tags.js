import * as tracker from './tracker.js';
import { gaEvent } from './ga.js';
export { gaEvent } from './ga.js';
export { newEventId } from './tracker.js';

const GA_MIRRORS = {
  ApplicationOpened: ['application_opened', ['content_name', 'content_category']],
  OutboundClick: ['outbound_click', ['content_name', 'content_label', 'content_category', 'action', 'destination', 'os']],
  ChatOpened: ['chat_opened', ['content_name', 'content_category']],
};
export function trackCustom(event, params = {}, opts = {}) {
  const eventId = tracker.trackCustom(event, params, opts);
  const mirror = GA_MIRRORS[event];
  if (mirror) gaEvent(mirror[0], Object.fromEntries(mirror[1]
    .filter((key) => Object.hasOwn(params, key)).map((key) => [key, params[key]])));
  return eventId;
}
export function track(event, params = {}, opts = {}) { return tracker.track(event, params, opts); }
export function pageView() { return tracker.pageView(); }
