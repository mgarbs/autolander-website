(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  var downloads = { windows: ['AutoLander-Setup.exe', 'Windows'], mac: ['AutoLander-Mac.dmg', 'Mac'], linux: ['AutoLander-Linux.AppImage', 'Linux'] };
  var platform = downloads[params.get('os')] || downloads.windows;
  var download = document.getElementById('download');
  var url = new URL('https://github.com/mgarbs/autolander-releases/releases/latest/download/' + platform[0]);
  var eventId = params.get('fb_event_id') || '';
  if (/^[A-Za-z0-9_-]{1,100}$/.test(eventId)) url.searchParams.set('fb_event_id', eventId);
  download.href = url.href;
  download.textContent = 'Download for ' + platform[1];
  var openApp = document.getElementById('open-app');
  var status = document.getElementById('status');
  var code = document.getElementById('setup-code');
  var validToken = function (value) { return typeof value === 'string' && value.length <= 8192 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value); };
  function stored(name) { try { return window.localStorage.getItem(name) || ''; } catch { return ''; } }
  function cookie(name) {
    try { var item = document.cookie.split('; ').find(function (part) { return part.indexOf(name + '=') === 0; }); return item ? decodeURIComponent(item.slice(name.length + 1)) : ''; } catch { return ''; }
  }
  function json(value) { try { return JSON.parse(value) || {}; } catch { return {}; } }
  function setCode(token) {
    var link = new URL('autolander://signup');
    var ref = params.get('ref') || '';
    if (/^[a-z0-9]{4,64}$/.test(ref)) link.searchParams.set('ref', ref);
    if (validToken(token)) { link.searchParams.set('attribution_token', token); code.value = token; }
    openApp.href = link.href;
    openApp.removeAttribute('aria-disabled');
  }
  document.getElementById('copy').addEventListener('click', async function () {
    var message = document.getElementById('copy-status');
    if (!code.value) { message.textContent = 'No setup code available. You can still open the app and sign up.'; return; }
    try { await navigator.clipboard.writeText(code.value); message.textContent = 'Copied. Paste it on the Sign Up screen.'; }
    catch { code.focus(); code.select(); message.textContent = 'Select and copy the code above.'; }
  });
  async function prepare() {
    var context = json(stored('al_signup_handoff_context'));
    var paid = json(cookie('al_attr'));
    if (!context.saved_at || Date.now() - context.saved_at > 300000) {
      context = { attribution: { fbp: cookie('_fbp'), fbc: cookie('_fbc'), utms: paid, firstTouch: paid, page: { landing_page: paid.landing_page || '', current_page: window.location.origin + '/', referrer: paid.referrer || '' } }, organic_attribution: json(stored('al_attrib')) };
    }
    context.previous_token = stored('al_signup_attribution_token');
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 7000);
    try {
      var response = await fetch('/api/attribution/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(context), signal: controller.signal });
      var result = await response.json();
      if (!response.ok || !validToken(result.token)) throw new Error('setup_unavailable');
      setCode(result.token);
      try { window.localStorage.setItem('al_signup_attribution_token', result.token); } catch { /* storage optional */ }
      status.textContent = 'Ready. Open the app when installation is complete.';
    } catch {
      // Downloads and free signup remain available during a tracking outage.
      setCode('');
      status.textContent = 'Setup details are temporarily unavailable. You can still open the app, or refresh this page to try again.';
    } finally { clearTimeout(timeout); }
  }
  void prepare();
  if (params.get('open') !== '1') {
    download.click();
    document.getElementById('download-status').textContent = 'If your download didn’t start, use the button below. Then install the app.';
  } else document.getElementById('download-status').textContent = 'Already installed? Continue below. Otherwise, download the app first.';
})();
