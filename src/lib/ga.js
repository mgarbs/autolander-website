export const GA_EVENTS = Object.freeze(['generate_lead', 'ai_scan_request', 'application_opened', 'outbound_click', 'chat_opened']);

export function gaEvent(name, params = {}) {
  if (!GA_EVENTS.includes(name) || typeof window === 'undefined') return false;
  try {
    if (window.alTags?.ga) return window.alTags.ga(name, params);
    (window.alTagsQ = window.alTagsQ || []).push(['ga', name, params]);
    return true;
  } catch { return false; }
}
