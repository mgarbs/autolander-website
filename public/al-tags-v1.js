(function () { try {
  if (window.alTags && window.alTags.version) return;
  var own = document.currentScript, existing = typeof window.gtag === 'function';
  var mode = 'pending', queue = window.alTagsQ = window.alTagsQ || [];
  var id = 'G-30H80LZMCH';
  var NO_TRACK_PATH_SOURCE = '^/(admin|download/setup|demo|demo-clay|onboarding|training)(/|$)';
  window.alTags = { version: 1, mode: function () { return mode; }, ga: ga };
  if (!(location.protocol === 'https:' && (location.hostname === 'autolander.ai' || location.hostname === 'www.autolander.ai')) || new RegExp(NO_TRACK_PATH_SOURCE).test(location.pathname)) {
    mode = 'off'; queue.length = 0; return;
  }
  function redact(s) { return String(s || '').replace(/\/pay\/[^/?#\s]+/g, '/pay/:token'); }
  function read(n) {
    try { var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; } catch (e) { return ''; }
  }
  function write(n, v, ttl, domain) {
    document.cookie = n + '=' + encodeURIComponent(v) + '; Max-Age=' + ttl + '; Path=/; SameSite=Lax; Secure' + (domain ? '; Domain=autolander.ai' : '');
  }
  var match = read('_ga').match(/^GA1\.\d+\.(\d+\.\d+)$/);
  var cid = match ? match[1] : Math.floor(Math.random() * 2147483647) + '.' + Math.floor(Date.now() / 1000);
  if (!match) write('_ga', 'GA1.1.' + cid, 63072000, true);
  if (read('al_ga_cid') !== cid) write('al_ga_cid', cid, 63072000);
  if (!/^fb\.\d+\.\d+\.\d+$/.test(read('_fbp'))) write('_fbp', 'fb.1.' + Date.now() + '.' + crypto.getRandomValues(new Uint32Array(1))[0], 7776000);
  var click = new URLSearchParams(location.search).get('fbclid') || '', fbc = read('_fbc');
  if (click && click.length <= 1000 && !/\s/.test(click) && (!fbc || !fbc.endsWith('.' + click))) write('_fbc', 'fb.1.' + Date.now() + '.' + click, 7776000);
  function flat(params) {
    var out = {}, count = 0;
    Object.keys(params || {}).some(function (k) {
      var v = params[k];
      if (['string', 'number', 'boolean'].indexOf(typeof v) !== -1) {
        Object.defineProperty(out, k, { value: typeof v === 'string' ? redact(v).slice(0, 100) : v, enumerable: true });
        count++;
      }
      return count === 25;
    }); return out;
  }
  function ga(name, params) {
    try {
      if (mode === 'off') return false;
      if (mode === 'pending') { queue.push(['ga', name, params]); return true; }
      if (mode === 'zaraz') {
        var result = window.zaraz.track(name, flat(params));
        if (result && typeof result.catch === 'function') result.catch(function () {});
      } else window.gtag('event', name, flat(params));
      return true;
    } catch (e) { return false; }
  }
  function legacy() {
    if (existing) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // Explicit URLs also protect automatic enhanced-measurement events.
    var url = new URL(location.href); url.searchParams.delete('session_id');
    window.gtag('config', id, { page_location: redact(url.href), page_path: redact(url.pathname), page_referrer: redact(document.referrer) });
    var loaded = false, timer;
    function hidden() { if (document.visibilityState === 'hidden') load(); }
    function later() { if (!loaded) timer = window.setTimeout(load, 8000); }
    function load() {
      if (loaded) return; loaded = true;
      ['pointerdown', 'keydown', 'scroll'].forEach(function (e) { window.removeEventListener(e, load); });
      document.removeEventListener('visibilitychange', hidden); window.removeEventListener('load', later); window.clearTimeout(timer);
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(s);
    }
    ['pointerdown', 'keydown', 'scroll'].forEach(function (e) { window.addEventListener(e, load, { once: true, passive: true }); });
    document.addEventListener('visibilitychange', hidden);
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
    if (own && own.hasAttribute('data-ga-eager')) load();
  }
  function resolve() {
    try {
      if (mode !== 'pending') return;
      mode = !existing && window.zaraz && typeof window.zaraz.track === 'function' ? 'zaraz' : 'legacy';
      if (mode === 'legacy') legacy();
      queue.splice(0).forEach(function (q) { if (q[0] === 'ga') ga(q[1], q[2]); });
    } catch (e) {}
  }
  var tag = document.querySelector('script[data-al-zaraz]');
  if (existing || (window.zaraz && typeof window.zaraz.track === 'function') || !tag || /^(load|error)$/.test(tag.getAttribute('data-al-state'))) resolve();
  else { tag.addEventListener('load', resolve, { once: true }); tag.addEventListener('error', resolve, { once: true }); }
} catch (e) {} })();
