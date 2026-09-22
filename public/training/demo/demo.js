/* global YT */
// Demo page player: the AutoLander product demo on YouTube (i5uUB5OxIhk), driven through the
// IFrame Player API on the youtube-nocookie host. The chapter buttons seekTo() their timestamp;
// if the API script cannot load, the buttons fall back to reloading a plain embed with ?start=.
// Published next to the demo page (demo.js) by scripts/training/build-training-mirror.mjs —
// edit scripts/training/templates/demo.js, then run `npm run training:build`.
(() => {
  'use strict';
  const VIDEO_ID = 'i5uUB5OxIhk';
  const EMBED_BASE = 'https://www.youtube-nocookie.com/embed/' + VIDEO_ID
    + '?cc_load_policy=1&cc_lang_pref=en&rel=0&enablejsapi=1&playsinline=1';
  const WATCH_URL = 'https://www.youtube.com/watch?v=' + VIDEO_ID;
  const API_TIMEOUT_MS = 8000;

  const mount = document.getElementById('demo');
  const status = document.getElementById('play-status');
  const chapters = [...document.querySelectorAll('.chapters [data-time]')];
  let player = null;
  let ready = false;
  let fallbackFrame = null;
  let pollTimer = null;
  let apiTimer = null;

  function mark(t) {
    let selected = chapters[0];
    for (const b of chapters) if (Number(b.dataset.time) <= t + 0.1) selected = b;
    for (const b of chapters) b.setAttribute('aria-current', String(b === selected));
  }
  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }
  function poll() {
    if (!ready) return;
    try { mark(player.getCurrentTime()); } catch { /* player is mid-transition; try again next tick */ }
  }
  function fallbackSrc(seconds, autoplay) {
    return EMBED_BASE + '&start=' + Math.max(0, Math.floor(seconds)) + (autoplay ? '&autoplay=1' : '');
  }
  function showFallbackFrame() {
    if (fallbackFrame || ready) return;
    clearTimeout(apiTimer);
    const frame = document.createElement('iframe');
    frame.src = fallbackSrc(0, false);
    frame.title = 'AutoLander product demo';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    mount.replaceChildren(frame);
    fallbackFrame = frame;
    status.textContent = 'Chapter buttons reload the video at the chosen time in this browser.';
  }
  function seekTo(seconds, title) {
    if (ready) {
      player.seekTo(seconds, true);
      player.playVideo();
    } else {
      showFallbackFrame();
      fallbackFrame.src = fallbackSrc(seconds, true);
    }
    mark(seconds);
    status.textContent = 'Playing from: ' + title + '.';
  }
  for (const b of chapters) {
    b.addEventListener('click', () => seekTo(Number(b.dataset.time), b.dataset.title));
  }

  function showLoadError() {
    const link = document.createElement('a');
    link.href = WATCH_URL;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'open it on YouTube';
    status.replaceChildren('The video could not be loaded. Check your internet connection and reload this page, or ', link, '.');
  }
  function buildPlayer() {
    if (player) return;
    clearTimeout(apiTimer);
    const target = document.createElement('div');
    mount.replaceChildren(target);
    fallbackFrame = null;
    const playerVars = { cc_load_policy: 1, cc_lang_pref: 'en', rel: 0, playsinline: 1 };
    if (/^https?:$/.test(location.protocol)) playerVars.origin = location.origin;
    player = new YT.Player(target, {
      host: 'https://www.youtube-nocookie.com',
      videoId: VIDEO_ID,
      width: '100%',
      height: '100%',
      playerVars,
      events: {
        onReady: () => { ready = true; status.textContent = ''; },
        onStateChange: (event) => {
          stopPoll();
          if (event.data === YT.PlayerState.PLAYING) pollTimer = setInterval(poll, 500);
          else poll();
        },
        onError: showLoadError,
      },
    });
  }

  window.onYouTubeIframeAPIReady = buildPlayer;
  if (window.YT && window.YT.Player) {
    buildPlayer();
  } else {
    const api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    api.async = true;
    api.addEventListener('error', showFallbackFrame);
    document.head.append(api);
    apiTimer = setTimeout(() => { if (!player) showFallbackFrame(); }, API_TIMEOUT_MS);
  }
  mark(0);
})();
