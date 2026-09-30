import { startTransition, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const ISLAND = '[data-al-island]';
const FIELDS = 'input:not([type="hidden"]), select, textarea';

const idle = (fn) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 50);
  return () => window.clearTimeout(id);
};

const hashTarget = () => {
  try {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return id ? document.getElementById(id) : null;
  } catch {
    return null;
  }
};

const lower = (value) => String(value || '').toLowerCase();

/** A form control whose state differs from its markup: typed into, picked, ticked or autofilled. */
export function isDirtyField(el) {
  if (lower(el.tagName) === 'select') {
    const options = [...(el.options || [])];
    if (!options.length) return false;
    if (el.multiple) return options.some((o) => o.selected !== o.defaultSelected);
    let defaultIndex = 0;
    options.forEach((o, i) => { if (o.defaultSelected) defaultIndex = i; });
    return el.selectedIndex !== defaultIndex;
  }
  const type = lower(el.type);
  if (type === 'checkbox' || type === 'radio') return Boolean(el.checked) !== Boolean(el.defaultChecked);
  return String(el.value ?? '') !== String(el.defaultValue ?? '');
}

function selectionOf(el) {
  try {
    return typeof el.selectionStart === 'number' ? [el.selectionStart, el.selectionEnd] : null;
  } catch {
    return null;
  }
}

/**
 * What swapping the static island out would destroy right now: keyboard/screen-reader/typing focus inside it, and
 * every control a visitor changed there (by `name`; a checkbox as a boolean, a radio as its checked value).
 */
export function islandActivity(doc) {
  const islands = [...doc.querySelectorAll(ISLAND)];
  const active = doc.activeElement;
  const focused = Boolean(active) && islands.some((island) => island !== active && island.contains(active));
  let values = null;
  for (const island of islands) {
    for (const el of island.querySelectorAll(FIELDS)) {
      if (!el.name || !isDirtyField(el)) continue;
      const type = lower(el.type);
      if (type === 'radio' && !el.checked) continue;
      values = values || {};
      values[el.name] = type === 'checkbox' ? Boolean(el.checked) : String(el.value ?? '');
    }
  }
  const focus = focused ? {
    id: active.id || '',
    name: active.name || '',
    formId: active.form?.id || '',
    selection: selectionOf(active),
  } : null;
  return { focused, focus, values };
}

/**
 * A live form's initial state from `initial` plus the carried island `values`: only keys `initial` has, each coerced
 * to its type (a boolean only from `true`). `initial` itself when nothing was carried.
 */
export function carryValues(initial, values) {
  if (!values) return initial;
  const out = { ...initial };
  for (const key of Object.keys(initial)) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
    out[key] = typeof initial[key] === 'boolean' ? values[key] === true : String(values[key] ?? '');
  }
  return out;
}

/**
 * After a forced swap removed the focused island control, focus its live counterpart (same id, else the same name in
 * the form with the same id) with the caret where it was. Focus the visitor moved elsewhere is left alone.
 */
export function restoreIslandFocus(doc, focus) {
  if (!focus) return;
  const active = doc.activeElement;
  if (active && active !== doc.body && active.isConnected !== false) return;
  let el = focus.id ? doc.getElementById(focus.id) : null;
  if (el && focus.name && el.name !== focus.name) el = null;
  if (!el && focus.formId && focus.name) {
    const form = doc.getElementById(focus.formId);
    const named = form?.elements?.namedItem?.(focus.name);
    el = named && typeof named.focus === 'function' ? named : null;
  }
  if (!el) return;
  el.focus({ preventScroll: true });
  if (focus.selection) {
    try { el.setSelectionRange(focus.selection[0], focus.selection[1]); } catch { /* a type without a caret */ }
  }
}

/**
 * When the idle swap may run. Never while focus is inside an island (a visitor tabbing through it, or typing in the
 * /ai-visibility scan form they opened from #scan-form): it waits, and a focusout re-arms it (checked once idle, when
 * focus has settled). Anything a visitor changed in the island is carried into the live page by `swap(activity)`.
 * `schedule(fn)` returns a cancel function. `force()` claims the swap for ensureLive (false if already claimed).
 */
export function createIslandSwap({ doc, schedule, swap }) {
  let claimed = false;
  let held = false;
  let cancel = null;
  const attempt = () => {
    cancel = null;
    if (claimed) return;
    const activity = islandActivity(doc);
    held = activity.focused;
    if (held) return;
    claimed = true;
    swap(activity);
  };
  const onFocusOut = () => {
    if (claimed || !held || cancel) return;
    cancel = schedule(attempt);
  };
  doc.addEventListener('focusout', onFocusOut, true);
  cancel = schedule(attempt);
  return {
    force() {
      if (claimed) return false;
      claimed = true;
      return true;
    },
    dispose() {
      cancel?.();
      cancel = null;
      doc.removeEventListener('focusout', onFocusOut, true);
    },
  };
}

/**
 * True when the page opened on a fragment inside the island (#scan-form, or an in-page link tapped before the app
 * was up) and the visitor has not moved since that fragment navigation: no scroll, touch or key, before the app
 * loaded (the shell's boot loader notes it in __alInput, scripts/spa-shell.mjs) or after (movedSinceHydration).
 * Its live copy is then scrolled to after the swap.
 */
export function landedOnIslandFragment(target, win, movedSinceHydration = false) {
  return !movedSinceHydration && !win.__alInput && Boolean(target?.closest?.(ISLAND));
}

/**
 * `live` is false while a prerendered page still shows its static island (the build-time mirror of everything
 * below the hero). Once the hydrated page is idle, and focus is not inside the island, it becomes true in a
 * transition (time-sliced, off the paint path) and the page swaps the island for its live sections. `carried` is
 * what the visitor changed in the island's form controls ({ name: value } or null), for the live form's initial
 * state. `ensureLive()` makes the page live synchronously, for handlers that need a live node (the scan form, the
 * video sections), whether or not an idle swap has committed yet; it carries changes and focus too.
 */
export function useLive(prerendered) {
  const [state, setState] = useState(() => ({ live: !prerendered, carried: null }));
  const committedRef = useRef(!prerendered);
  const switchRef = useRef(null);
  const rescrollRef = useRef(false);

  useEffect(() => {
    if (!prerendered) return undefined;
    // Input after hydration (the boot loader records the input before it).
    let moved = false;
    const onInput = () => { moved = true; };
    const onHash = () => { moved = false; }; // a fragment link followed: that is where the visitor wants to be
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    inputs.forEach((type) => window.addEventListener(type, onInput, { capture: true, passive: true }));
    window.addEventListener('hashchange', onHash);
    const islandSwap = createIslandSwap({
      doc: document,
      schedule: idle,
      swap: (activity) => {
        rescrollRef.current = landedOnIslandFragment(hashTarget(), window, moved);
        startTransition(() => setState({ live: true, carried: activity.values }));
      },
    });
    switchRef.current = islandSwap;
    return () => {
      islandSwap.dispose();
      if (switchRef.current === islandSwap) switchRef.current = null;
      inputs.forEach((type) => window.removeEventListener(type, onInput, { capture: true }));
      window.removeEventListener('hashchange', onHash);
    };
  }, [prerendered]);

  useLayoutEffect(() => {
    if (state.live) committedRef.current = true;
  }, [state.live]);

  useEffect(() => {
    if (!state.live || !rescrollRef.current) return;
    rescrollRef.current = false;
    hashTarget()?.scrollIntoView({ block: 'start' });
  }, [state.live]);

  const ensureLive = useCallback(() => {
    if (committedRef.current) return;
    // Read before the swap removes the island (also when an idle swap is claimed but has not committed yet).
    const activity = islandActivity(document);
    switchRef.current?.force();
    rescrollRef.current = false;
    flushSync(() => setState({ live: true, carried: activity.values }));
    committedRef.current = true;
    restoreIslandFocus(document, activity.focus);
  }, []);

  return [state.live, ensureLive, state.carried];
}
