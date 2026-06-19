// UX-invisible bot screen for the booking + conversion endpoints.
//
// The Worker runs on *.workers.dev, where Cloudflare Bot Fight Mode / WAF can't
// reach (those are zone features and autolander.ai is served by GitHub Pages,
// not Cloudflare). So we do a cheap User-Agent screen here instead: real
// browsers always send a long, normal UA, whereas scripted clients using a
// default agent (curl, python, Go-http-client, headless automation, generic
// crawlers) or no UA at all are refused.
//
// This is NOT a silver bullet — a determined attacker can spoof the UA — but it
// turns away the bulk of unsophisticated automated abuse with zero impact on
// real users. The single-use booking-token gate remains the real conversion
// guard. Deliberately NOT applied to the signed Calendly webhook, whose
// server-to-server agent would otherwise look bot-like.
const AUTOMATION_UA =
  /curl\/|wget\/|python-requests|python-urllib|libwww|httpclient|go-http-client|node-fetch|axios\/|okhttp|java\/|guzzle|scrapy|httpie|postmanruntime|insomnia|headlesschrome|phantomjs|puppeteer|playwright|selenium|googlebot|bingbot|yandexbot|ahrefsbot|semrushbot|facebookexternalhit|crawler|spider|\bbot\b/i;

export function looksLikeBot(request) {
  const ua = (request.headers.get('User-Agent') || '').trim();
  if (ua.length < 10) return { bot: true, reason: 'ua_missing' };
  if (AUTOMATION_UA.test(ua)) return { bot: true, reason: 'ua_automation' };
  return { bot: false, reason: '' };
}
