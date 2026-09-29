import { isNoTrackPath } from '../../../shared/tracking-scope.js';

export const ZARAZ_MODE_KEY = 'cfg:zaraz_mode';
export const ZARAZ_MODES = ['off', 'canary', 'on'];
export const ZARAZ_TAG = `<script src="/cdn-cgi/zaraz/i.js" referrerpolicy="origin" defer data-al-zaraz onload="this.setAttribute('data-al-state','load')" onerror="this.setAttribute('data-al-state','error')"></script>`;

export async function readZarazMode(env) {
  try {
    const value = await env.TRACKING?.get(ZARAZ_MODE_KEY, { cacheTtl: 60 });
    if (ZARAZ_MODES.includes(value)) return value;
  } catch { /* KV failure must leave the environment kill switch usable. */ }
  return ZARAZ_MODES.includes(env.ZARAZ_MODE) ? env.ZARAZ_MODE : 'off';
}

export function zarazEligibility({ method, pathname, mode, cookieHeader = '' }) {
  const cookie = String(cookieHeader || '').match(/(?:^|;\s*)al_zaraz=([^;]*)/)?.[1];
  const reason = method !== 'GET' ? 'method'
    : isNoTrackPath(pathname) ? 'no_track_path'
      : cookie === '0' ? 'opt_out'
        : !ZARAZ_MODES.includes(mode) || mode === 'off' ? 'mode_off'
          : mode === 'canary' && cookie !== '1' ? 'not_canary' : 'ok';
  return { eligible: reason === 'ok', reason };
}

export async function maybeInjectZaraz(request, response, { eligible, reason, mode }) {
  try {
    if (!(response.headers.get('Content-Type') || '').toLowerCase().includes('text/html')) return response;
    const headers = new Headers(response.headers);
    if (!eligible || ![200, 404].includes(response.status)) {
      headers.set('X-AL-Zaraz', `skip:${eligible ? 'status' : reason}`);
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    headers.delete('ETag'); headers.delete('Last-Modified'); headers.delete('Content-Length');
    if (typeof HTMLRewriter === 'function') {
      let seen = false, hasAlTags = false, legacyGa = false, buf = '', inHead = false;
      headers.set('X-AL-Zaraz', `armed:${mode}`);
      const rewriter = new HTMLRewriter()
        .on('head', { element(el) {
          inHead = true;
          el.onEndTag((end) => {
            if (!seen && hasAlTags && !legacyGa) end.before(ZARAZ_TAG, { html: true });
            inHead = false;
          });
        } })
        .on('script', {
          element(el) {
            const src = el.getAttribute('src') || '';
            if (src === '/cdn-cgi/zaraz/i.js') seen = true;
            if (inHead && src === '/al-tags-v1.js') hasAlTags = true;
            if (/googletagmanager\.com\/gtag\/js|G-30H80LZMCH/.test(src)) legacyGa = true;
            buf = '';
          },
          text(t) {
            // Check before truncating: a long chunk may contain the entire match.
            const chunk = buf + t.text;
            if (/googletagmanager\.com\/gtag\/js|G-30H80LZMCH/.test(chunk)) legacyGa = true;
            buf = chunk.slice(-256);
          },
        });
      return rewriter.transform(new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
    }
    // Clone so a read/transform failure can still return the untouched origin body.
    const html = await response.clone().text();
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    const src = (attrs) => attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] || '';
    const hasAlTags = [...head.matchAll(/<script\b([^>]*)>/gi)].some((s) => src(s[1]) === '/al-tags-v1.js');
    const seen = scripts.some((s) => src(s[1]) === '/cdn-cgi/zaraz/i.js');
    const legacyGa = scripts.some((s) => /googletagmanager\.com\/gtag\/js|G-30H80LZMCH/.test(src(s[1]) + s[2]));
    const skip = seen ? 'already_present' : !hasAlTags ? 'no_al_tags' : legacyGa ? 'legacy_gtag' : '';
    headers.set('X-AL-Zaraz', skip ? `skip:${skip}` : `injected:${mode}`);
    return new Response(skip ? html : html.replace(/<\/head>/i, `${ZARAZ_TAG}</head>`), { status: response.status, statusText: response.statusText, headers });
  } catch { return response; }
}
