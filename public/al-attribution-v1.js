(function () {
  'use strict';

  var KEY = 'al_attrib';
  var MAX_UTM_LENGTH = 180;
  // Google's official supported-domain list. Exact matching keeps Gmail, Docs,
  // and lookalike domains out of the Organic Search bucket.
  var GOOGLE_SEARCH_DOMAINS = (
    'google.com google.ad google.ae google.com.af google.com.ag google.al google.am google.co.ao google.com.ar google.as google.at google.com.au google.az google.ba google.com.bd google.be google.bf google.bg google.com.bh google.bi google.bj google.com.bn ' +
    'google.com.bo google.com.br google.bs google.bt google.co.bw google.by google.com.bz google.ca google.cd google.cf google.cg google.ch google.ci google.co.ck google.cl google.cm google.cn google.com.co google.co.cr google.com.cu google.cv google.com.cy ' +
    'google.cz google.de google.dj google.dk google.dm google.com.do google.dz google.com.ec google.ee google.com.eg google.es google.com.et google.fi google.com.fj google.fm google.fr google.ga google.ge google.gg google.com.gh google.com.gi google.gl ' +
    'google.gm google.gr google.com.gt google.gy google.com.hk google.hn google.hr google.ht google.hu google.co.id google.ie google.co.il google.im google.co.in google.iq google.is google.it google.je google.com.jm google.jo google.co.jp google.co.ke ' +
    'google.com.kh google.ki google.kg google.co.kr google.com.kw google.kz google.la google.com.lb google.li google.lk google.co.ls google.lt google.lu google.lv google.com.ly google.co.ma google.md google.me google.mg google.mk google.ml google.com.mm ' +
    'google.mn google.com.mt google.mu google.mv google.mw google.com.mx google.com.my google.co.mz google.com.na google.com.ng google.com.ni google.ne google.nl google.no google.com.np google.nr google.nu google.co.nz google.com.om google.com.pa google.com.pe google.com.pg ' +
    'google.com.ph google.com.pk google.pl google.pn google.com.pr google.ps google.pt google.com.py google.com.qa google.ro google.ru google.rw google.com.sa google.com.sb google.sc google.se google.com.sg google.sh google.si google.sk google.com.sl google.sn ' +
    'google.so google.sm google.sr google.st google.com.sv google.td google.tg google.co.th google.com.tj google.tl google.tm google.tn google.to google.com.tr google.tt google.com.tw google.co.tz google.com.ua google.co.ug google.co.uk google.com.uy google.co.uz ' +
    'google.com.vc google.co.ve google.co.vi google.com.vn google.vu google.ws google.rs google.co.za google.co.zm google.co.zw google.cat'
  ).split(' ');

  function clean(value, max) {
    return typeof value === 'string'
      ? value.replace(/\s+/g, ' ').trim().slice(0, max)
      : '';
  }

  function isHost(host, domain) {
    return host === domain || host.slice(-(domain.length + 1)) === '.' + domain;
  }

  function isExactOrWwwHost(host, domains) {
    var candidate = host.indexOf('www.') === 0 ? host.slice(4) : host;
    return domains.indexOf(candidate) !== -1;
  }

  function isYahooSearchHost(host) {
    return isHost(host, 'search.yahoo.com')
      || isExactOrWwwHost(host, [
        'search.yahoo.co.uk', 'search.yahoo.co.jp', 'search.yahoo.com.au',
        'search.yahoo.ca', 'search.yahoo.fr', 'search.yahoo.de',
        'search.yahoo.co.in', 'search.yahoo.com.br', 'search.yahoo.co.id',
        'search.yahoo.com.hk', 'search.yahoo.com.mx', 'search.yahoo.com.ph',
        'search.yahoo.com.sg', 'search.yahoo.com.tw', 'search.yahoo.co.nz',
        'search.yahoo.co.th', 'search.yahoo.es', 'search.yahoo.it'
      ]);
  }

  function classify(host) {
    // AI answer engines must be checked before the broader search-engine rules.
    if (isHost(host, 'chatgpt.com') || host === 'chat.openai.com') return ['chatgpt', 'ai'];
    if (isHost(host, 'perplexity.ai')) return ['perplexity', 'ai'];
    if (isHost(host, 'claude.ai')) return ['claude', 'ai'];
    if (isHost(host, 'copilot.microsoft.com')) return ['copilot', 'ai'];
    if (isHost(host, 'gemini.google.com')) return ['gemini', 'ai'];
    if (isHost(host, 'grok.com')) return ['grok', 'ai'];
    if (isHost(host, 'meta.ai')) return ['meta_ai', 'ai'];
    if (isHost(host, 'you.com')) return ['you', 'ai'];
    if (isHost(host, 'phind.com')) return ['phind', 'ai'];
    if (isHost(host, 'poe.com')) return ['poe', 'ai'];
    if (isHost(host, 'deepseek.com')) return ['deepseek', 'ai'];
    if (host === 'chat.mistral.ai') return ['mistral', 'ai'];

    // Search hosts are deliberately exact: mail/docs subdomains and lookalike
    // domains must remain referrals rather than inflating organic search.
    if (isExactOrWwwHost(host, GOOGLE_SEARCH_DOMAINS)
      || host === 'com.google.android.googlequicksearchbox') return ['google', 'organic'];
    if (isExactOrWwwHost(host, ['bing.com', 'bing.com.cn', 'cn.bing.com'])) return ['bing', 'organic'];
    if (isHost(host, 'duckduckgo.com')) return ['duckduckgo', 'organic'];
    if (isYahooSearchHost(host)) return ['yahoo', 'organic'];
    if (isHost(host, 'search.brave.com')) return ['brave', 'organic'];
    if (isHost(host, 'ecosia.org')) return ['ecosia', 'organic'];
    if (isHost(host, 'startpage.com')) return ['startpage', 'organic'];

    if (isHost(host, 'facebook.com') || isHost(host, 'instagram.com') || isHost(host, 'fb.com')) {
      return ['facebook', 'organic_social'];
    }
    if (host) return [host, 'referral'];
    return ['direct', 'none'];
  }

  try {
    if (window.localStorage.getItem(KEY)) return; // First touch wins; never overwrite it.

    var query = new URLSearchParams(window.location.search);
    var referrerUrl = document.referrer || '';
    var referrerHost = '';
    try {
      referrerHost = referrerUrl ? new URL(referrerUrl).hostname.toLowerCase() : '';
    } catch {
      referrerHost = '';
    }

    // Do not let navigation between www/non-www or static/SPA pages become a referral.
    if (isHost(referrerHost, 'autolander.ai')) {
      referrerUrl = '';
      referrerHost = '';
    }

    var source = clean(query.get('utm_source') || '', MAX_UTM_LENGTH);
    var medium = clean(query.get('utm_medium') || '', MAX_UTM_LENGTH);
    if (!source) {
      var detected = classify(referrerHost);
      source = detected[0];
      if (!medium) medium = detected[1];
    }

    window.localStorage.setItem(KEY, JSON.stringify({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: clean(query.get('utm_campaign') || '', MAX_UTM_LENGTH),
      utm_content: clean(query.get('utm_content') || '', MAX_UTM_LENGTH),
      utm_term: clean(query.get('utm_term') || '', MAX_UTM_LENGTH),
      landing_page: ((window.location.pathname || '/') + (window.location.search || '')).slice(0, 500),
      referrer_url: referrerUrl.slice(0, 1200),
      first_seen: new Date().toISOString()
    }));
  } catch {
    // Attribution is best-effort and must never interfere with rendering or form submission.
  }
})();
