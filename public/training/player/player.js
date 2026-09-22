/* global YT */
'use strict';
// Course player: ONE YouTube video (ePsAvCZWw_A, the full 24:28 Training V12 render) driven through
// the IFrame Player API on the youtube-nocookie host. Every lesson in the inline course-data JSON is
// a [combinedStart, combinedEnd) window of that video:
//   - selecting a lesson seeks to lesson.combinedStart (and plays when the learner clicked);
//   - while playing, a 500 ms poll pauses at lesson.combinedEnd and points at "Next lesson";
//   - resume positions are stored per lesson as an offset into the lesson (getCurrentTime() minus
//     combinedStart) in the same browser-local store the MP4 player used;
//   - if the learner scrubs the YouTube timeline into another lesson, the page follows.
// Captions come from YouTube (cc_load_policy=1), so the old caption band/toggle are gone.
// Lesson list, role routes, search, objectives, practice checkpoints, transcript panel and
// localStorage progress are unchanged from the original player.
// If the API script cannot load (blocked network), lesson buttons fall back to reloading a plain
// embed with ?start=&end= for the lesson window (positions are not saved in that mode).
// Published next to the course page (player.js) by scripts/training/build-training-mirror.mjs —
// edit scripts/training/templates/player.js, then run `npm run training:build`.
(() => {
  const data = JSON.parse(document.getElementById('course-data').textContent);
  const $ = id => document.getElementById(id);
  const VIDEO_ID = data.youtubeVideoId;
  const EMBED_BASE = 'https://www.youtube-nocookie.com/embed/' + VIDEO_ID
    + '?cc_load_policy=1&cc_lang_pref=en&rel=0&enablejsapi=1&playsinline=1';
  const WATCH_URL = 'https://www.youtube.com/watch?v=' + VIDEO_ID;
  const END_TOLERANCE = 0.35; // seconds before combinedEnd at which the lesson counts as finished
  const FOLLOW_SLACK = 1.5;   // seconds outside the lesson window before the page follows the video
  const API_TIMEOUT_MS = 8000;
  const mount = $('film');
  const lessons = data.lessons;
  const byId = new Map(lessons.map(row => [row.id, row]));
  const statusLabels = {unmarked:'Not assessed',independent:'Independent',coaching:'Needs coaching',blocked:'Blocked by setup/access',not_my_role:'Not my role'};
  const statusDefinitions = {independent:'I can do this check without prompting.',coaching:'I need help with this task.',blocked:'Setup or access prevents trying.',not_my_role:'This task is not assigned to me.'};
  const key = 'autolander-training-v09:' + data.scriptSha256.slice(0, 16) + ':' + location.pathname;
  let state = {version:1,lastLesson:lessons[0].id,positions:{},checkpoints:{},role:'all'};
  let storageAvailable = true;
  let current = null;
  let initialResume = null;

  // ---- YouTube player state ----
  let player = null;
  let playerReady = false;
  let fallbackFrame = null;
  let pollTimer = null;
  let apiTimer = null;
  let lastSavedSecond = -1;
  let endReached = false;
  let pendingAction = null; // {lesson, offset, play} requested before the API was ready

  function time(seconds) {
    if (!Number.isFinite(seconds)) return 'Duration pending';
    const whole = Math.max(0, Math.floor(seconds));
    return (whole >= 3600 ? Math.floor(whole / 3600) + ':' + String(Math.floor(whole / 60) % 60).padStart(2, '0') : Math.floor(whole / 60)) + ':' + String(whole % 60).padStart(2, '0');
  }
  function storageNotice() {
    $('storage-message').textContent = storageAvailable
      ? 'Playback position and checkpoint choices stay in this browser only. Nothing is sent to AutoLander.'
      : 'This browser does not allow local saving here. You can still watch, navigate and use the workbook; these choices will not survive a reload.';
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { storageAvailable = false; storageNotice(); }
  }
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (raw && raw.version === 1) {
      if (byId.has(raw.lastLesson)) state.lastLesson = raw.lastLesson;
      for (const lesson of lessons) {
        const pos = raw.positions && raw.positions[lesson.id];
        if (typeof pos === 'number' && Number.isFinite(pos) && pos >= 0 && pos < (lesson.duration || 24 * 3600)) state.positions[lesson.id] = pos;
        const reported = raw.checkpoints && raw.checkpoints[lesson.id];
        if (Object.hasOwn(statusLabels, reported)) state.checkpoints[lesson.id] = reported;
      }
      if (raw.role === 'all' || Object.hasOwn(data.roleRoutes, raw.role)) state.role = raw.role;
    }
  } catch { storageAvailable = false; }
  storageNotice();
  if ((state.positions[state.lastLesson] || 0) > 1) initialResume = {id:state.lastLesson,time:state.positions[state.lastLesson]};

  function setLink(id, href) {
    const a = $(id);
    if (href) { a.href = href; a.hidden = false; a.removeAttribute('aria-disabled'); }
    else { a.removeAttribute('href'); a.hidden = true; a.setAttribute('aria-disabled', 'true'); }
  }
  function updateProgress() {
    const count = lessons.filter(l => state.checkpoints[l.id] && state.checkpoints[l.id] !== 'unmarked').length;
    $('progress-count').textContent = count + ' / ' + lessons.length;
    $('progress-bar').value = count;
  }
  function route() {
    const source = data.roleRoutes[state.role];
    return source ? source.map(value => {
      const [id, ...notes] = value.split(':');
      return {id, note:notes.join(':')};
    }) : lessons.map(l => ({id:l.id,note:''}));
  }
  function renderList() {
    const list = $('lesson-list');
    list.replaceChildren();
    const query = $('lesson-search').value.trim().toLowerCase();
    const available = route();
    let displayed = 0;
    const trackOrder = state.role === 'all' ? ['A','B','C'] : ['route'];
    for (const track of trackOrder) {
      const matching = available.filter(item => {
        const lesson = byId.get(item.id);
        return lesson && (track === 'route' || lesson.track === track) &&
          (!query || [lesson.shortId, lesson.title, lesson.objective, lesson.transcript, ...lesson.navigation].join(' ').toLowerCase().includes(query));
      });
      if (!matching.length) continue;
      const section = document.createElement('div');
      const heading = document.createElement('h2');
      heading.className = 'track-heading';
      const badge = document.createElement('span'); badge.className = 'track-badge'; badge.textContent = track === 'route' ? '→' : track;
      const title = document.createElement('span'); title.textContent = track === 'route' ? 'Your suggested lesson order' : data.tracks[track];
      heading.append(badge, title); section.append(heading);
      for (const item of matching) {
        const lesson = byId.get(item.id);
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'lesson-button'; button.dataset.lessonId = lesson.id;
        button.setAttribute('aria-current', String(current && current.id === lesson.id));
        const code = document.createElement('span'); code.className = 'lesson-code'; code.textContent = lesson.shortId;
        const words = document.createElement('span');
        const titleSpan = document.createElement('span'); titleSpan.className = 'lesson-button-title'; titleSpan.textContent = lesson.title;
        const meta = document.createElement('span'); meta.className = 'lesson-meta'; meta.textContent = time(lesson.duration) + (item.note ? ' · ' + item.note : '');
        const checkpoint = state.checkpoints[lesson.id];
        if (checkpoint && checkpoint !== 'unmarked') {
          const status = document.createElement('span'); status.className = 'lesson-state'; status.textContent = '· ' + statusLabels[checkpoint]; meta.append(status);
        }
        words.append(titleSpan, meta); button.append(code, words);
        button.addEventListener('click', () => selectLesson(lesson.id, {play:true, focus:matchMedia('(max-width:760px)').matches}));
        section.append(button); displayed += 1;
      }
      list.append(section);
    }
    $('empty-search').hidden = displayed !== 0;
    $('route-note').textContent = state.role === 'all' ? 'Suggestions do not change your app permissions.' : 'Suggested order only. Optional and role-specific steps are marked; your app permissions still apply.';
  }
  function showCheckpointFeedback() {
    const status = state.checkpoints[current.id] || 'unmarked';
    $('checkpoint-status').value = status;
    $('checkpoint-feedback').textContent = status === 'unmarked' ? 'Choose a result after trying the checkpoint. Watching alone does not mark it complete.' :
      'Your self-report: ' + statusLabels[status] + ' — ' + statusDefinitions[status] + ' ' + (storageAvailable ? 'Saved in this browser only.' : 'Kept for this session only.');
  }
  function updateLessonNav() {
    const sequence = route().map(item => item.id);
    const index = sequence.indexOf(current.id);
    $('previous-lesson').disabled = index <= 0;
    $('next-lesson').disabled = index === sequence.length - 1 || index < 0;
    $('next-lesson').textContent = index === sequence.length - 1 ? 'Last lesson in this route' : 'Next lesson →';
  }

  // ---- video helpers ----
  function lessonAt(t) {
    return lessons.find(l => t >= l.combinedStart && t < l.combinedEnd) || null;
  }
  function clampOffset(lesson, offset) {
    return Math.max(0, Math.min(Number(offset) || 0, Math.max(0, lesson.duration - 0.5)));
  }
  function currentTime() {
    if (!playerReady) return null;
    try {
      const t = player.getCurrentTime();
      return Number.isFinite(t) ? t : null;
    } catch { return null; }
  }
  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }
  function mediaMessage(text, link) {
    const box = $('media-message');
    if (!text) { box.hidden = true; box.replaceChildren(); return; }
    if (link) {
      const a = document.createElement('a');
      a.href = link.href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = link.text;
      box.replaceChildren(text + ' ', a, '.');
    } else {
      box.textContent = text;
    }
    box.hidden = false;
  }
  function savePosition(offset) {
    if (!current) return;
    if (offset == null) {
      const t = currentTime();
      if (t == null) return;
      offset = t - current.combinedStart;
    }
    if (offset < 0 || offset > current.duration + 1) return;
    state.positions[current.id] = clampOffset(current, offset);
    state.lastLesson = current.id;
    save();
  }
  function fallbackSrc(lesson, offset, autoplay) {
    return EMBED_BASE + '&start=' + Math.floor(lesson.combinedStart + clampOffset(lesson, offset))
      + '&end=' + Math.ceil(lesson.combinedEnd) + (autoplay ? '&autoplay=1' : '');
  }
  function showFallbackFrame() {
    if (fallbackFrame || playerReady) return;
    clearTimeout(apiTimer);
    const frame = document.createElement('iframe');
    frame.title = 'AutoLander training lesson video';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = fallbackSrc(current || byId.get(state.lastLesson) || lessons[0], 0, false);
    mount.replaceChildren(frame);
    fallbackFrame = frame;
    $('playback-speed').disabled = true;
    mediaMessage('Lesson buttons reload the video at the lesson start in this browser. Playback positions are not saved until the YouTube player can load.');
  }
  // Seek the single course video to `offset` seconds into `lesson`; play when the learner asked for it.
  function goTo(lesson, offset, play) {
    endReached = false;
    lastSavedSecond = -1;
    const target = lesson.combinedStart + clampOffset(lesson, offset);
    if (playerReady) {
      let playerState = -1;
      try { playerState = player.getPlayerState(); } catch { /* treat as unstarted */ }
      const unstarted = playerState === YT.PlayerState.UNSTARTED || playerState === YT.PlayerState.CUED;
      if (!play && unstarted) {
        // seekTo() would start playback on a cued player; re-cue at the new spot instead.
        player.cueVideoById({videoId: VIDEO_ID, startSeconds: Math.floor(target)});
      } else {
        player.seekTo(target, true);
        if (play) player.playVideo();
      }
    } else if (fallbackFrame) {
      fallbackFrame.src = fallbackSrc(lesson, offset, play);
    } else {
      pendingAction = {lesson, offset, play};
    }
  }
  function finishSegment() {
    endReached = true;
    stopPoll();
    try { player.pauseVideo(); } catch { /* player is mid-transition */ }
    savePosition(current.duration);
    $('resume-lesson').hidden = true;
    $('checkpoint-feedback').textContent = $('next-lesson').disabled
      ? 'Video for this lesson finished. Try the checkpoint, then record your own assessment. No completion status was set automatically.'
      : 'Video for this lesson finished. Try the checkpoint, record your own assessment, then use Next lesson →.';
  }
  function tick() {
    const t = currentTime();
    if (t == null || !current) return;
    if (!endReached && t >= current.combinedEnd - END_TOLERANCE) { finishSegment(); return; }
    if (t < current.combinedStart - FOLLOW_SLACK || t >= current.combinedEnd + FOLLOW_SLACK) {
      // The learner scrubbed the YouTube timeline (or kept playing past the end): follow the video.
      const there = lessonAt(t);
      if (there && there.id !== current.id) {
        if (t >= current.combinedEnd) savePosition(current.duration);
        selectLesson(there.id, {follow:true});
      }
      return;
    }
    const second = Math.floor(t);
    if (second !== lastSavedSecond && second % 3 === 0) { lastSavedSecond = second; savePosition(t - current.combinedStart); }
  }
  function onStateChange(event) {
    stopPoll();
    if (event.data === YT.PlayerState.PLAYING) {
      pollTimer = setInterval(tick, 500);
      tick();
    } else if (event.data === YT.PlayerState.PAUSED) {
      if (!endReached) savePosition();
    } else if (event.data === YT.PlayerState.ENDED) {
      savePosition(current ? current.duration : 0);
      $('checkpoint-feedback').textContent = 'Video ended. Try the checkpoint, then record your own assessment. No completion status was set automatically.';
    }
  }
  function buildPlayer() {
    if (player) return;
    clearTimeout(apiTimer);
    const startLesson = current || byId.get(state.lastLesson) || lessons[0];
    const target = document.createElement('div');
    mount.replaceChildren(target);
    fallbackFrame = null;
    const playerVars = { cc_load_policy:1, cc_lang_pref:'en', rel:0, playsinline:1, start:Math.floor(startLesson.combinedStart) };
    if (/^https?:$/.test(location.protocol)) playerVars.origin = location.origin;
    player = new YT.Player(target, {
      host: 'https://www.youtube-nocookie.com',
      videoId: VIDEO_ID,
      width: '100%',
      height: '100%',
      playerVars,
      events: {
        onReady: () => {
          playerReady = true;
          mediaMessage('');
          try { player.setPlaybackRate(Number($('playback-speed').value)); } catch { /* rate not supported yet */ }
          if (pendingAction) { const action = pendingAction; pendingAction = null; goTo(action.lesson, action.offset, action.play); }
        },
        onStateChange,
        onError: () => mediaMessage('The video could not be loaded from YouTube. Check your internet connection and reload this page, or', {href:WATCH_URL, text:'open the full course on YouTube'}),
      },
    });
  }
  function loadApi() {
    window.onYouTubeIframeAPIReady = buildPlayer;
    if (window.YT && window.YT.Player) { buildPlayer(); return; }
    const api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    api.async = true;
    api.addEventListener('error', showFallbackFrame);
    document.head.append(api);
    apiTimer = setTimeout(() => { if (!player) showFallbackFrame(); }, API_TIMEOUT_MS);
  }

  function selectLesson(id, options = {}) {
    const lesson = byId.get(id);
    if (!lesson) return;
    if (current && !options.follow && !endReached) savePosition();
    current = lesson;
    $('lesson-label').textContent = 'LESSON ' + lesson.shortId + ' / ' + data.tracks[lesson.track];
    $('lesson-duration').textContent = time(lesson.duration);
    $('lesson-title').textContent = lesson.title;
    $('lesson-objective').textContent = lesson.objective;
    document.title = lesson.shortId + ' · ' + lesson.title + ' · AutoLander Training';
    $('practice-prompt').textContent = lesson.practice.prompt;
    $('success-check').textContent = lesson.practice.success_looks_like;
    $('navigation-paths').replaceChildren(...lesson.navigation.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    $('transcript-body').replaceChildren(...lesson.transcript.split(/\n\s*\n/).map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    setLink('learner-pdf', data.resources.learner ? data.resources.learner + '#page=' + lesson.workbookPage : null);
    $('workbook-page').textContent = 'Lesson ' + lesson.shortId + ' · page ' + lesson.workbookPage;
    setLink('transcript-file', lesson.transcriptFile); setLink('vtt-file', lesson.vtt); setLink('srt-file', lesson.srt);
    const position = state.positions[id] || 0;
    $('resume-lesson').hidden = !(position > 1 && position < (lesson.duration || Infinity) - 1);
    $('resume-lesson').textContent = 'Resume at ' + time(position);
    state.lastLesson = id;
    updateLessonNav();
    showCheckpointFeedback(); renderList(); updateProgress();
    try { history.replaceState(null, '', '#' + lesson.shortId); } catch { /* local-browser restriction */ }
    save();
    if (options.follow) { endReached = false; lastSavedSecond = -1; }
    else if (options.resume) goTo(lesson, position, true);
    else if (options.play) goTo(lesson, 0, true);
    else if (options.seek) goTo(lesson, 0, false);
    if (options.focus) { $('lesson').focus({preventScroll:true}); $('lesson').scrollIntoView({behavior:'auto',block:'start'}); }
  }

  $('draft-banner').hidden = !data.draft;
  $('role-filter').value = state.role;
  $('role-filter').addEventListener('change', event => {
    state.role = event.target.value;
    const choices = route().map(item => item.id);
    if (choices.includes(current.id)) { save(); renderList(); updateLessonNav(); }
    else selectLesson(choices[0], {seek:true});
  });
  $('lesson-search').addEventListener('input', renderList);
  $('playback-speed').addEventListener('change', event => {
    if (playerReady) { try { player.setPlaybackRate(Number(event.target.value)); } catch { /* rate not supported */ } }
  });
  $('resume-lesson').addEventListener('click', () => goTo(current, state.positions[current.id] || 0, true));
  $('restart-lesson').addEventListener('click', () => { state.positions[current.id] = 0; save(); $('resume-lesson').hidden = true; goTo(current, 0, true); });
  $('previous-lesson').addEventListener('click', () => { const ids = route().map(r => r.id); selectLesson(ids[Math.max(0, ids.indexOf(current.id) - 1)], {play:true}); });
  $('next-lesson').addEventListener('click', () => { const ids = route().map(r => r.id); selectLesson(ids[Math.min(ids.length - 1, ids.indexOf(current.id) + 1)], {play:true}); });
  $('checkpoint-status').addEventListener('change', event => {
    if (!Object.hasOwn(statusLabels, event.target.value)) return;
    state.checkpoints[current.id] = event.target.value;
    save(); showCheckpointFeedback(); renderList(); updateProgress();
  });
  $('clear-progress').addEventListener('click', () => {
    if (!confirm('Clear only this course’s saved playback positions and self-reported checkpoints from this browser? This does not change the app, videos or workbook files.')) return;
    stopPoll();
    if (playerReady) { try { player.pauseVideo(); } catch { /* ignore */ } }
    state.positions = {}; state.checkpoints = {}; state.lastLesson = current.id; initialResume = null;
    save(); $('resume-banner').hidden = true; $('resume-lesson').hidden = true;
    showCheckpointFeedback(); renderList(); updateProgress();
  });
  window.addEventListener('pagehide', () => { if (!endReached) savePosition(); });
  window.addEventListener('hashchange', () => {
    const id = 'COURSE_' + location.hash.slice(1);
    if (byId.has(id) && (!current || current.id !== id)) selectLesson(id, {play:true});
  });
  setLink('manager-pdf', data.resources.manager);
  setLink('rep-manual', data.resources.repManual);
  setLink('manager-manual', data.resources.managerManual);
  setLink('manual-index', data.resources.manualIndex);
  if (initialResume) {
    $('resume-message').textContent = 'Continue ' + byId.get(initialResume.id).shortId + ' at ' + time(initialResume.time) + ' where you left off.';
    $('resume-banner').hidden = false;
    $('resume-course').addEventListener('click', () => { selectLesson(initialResume.id, {resume:true}); $('resume-banner').hidden = true; });
  }
  const fragmentId = 'COURSE_' + location.hash.slice(1);
  selectLesson(byId.has(fragmentId) ? fragmentId : state.lastLesson);
  loadApi();
})();
