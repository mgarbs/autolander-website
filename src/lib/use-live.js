import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

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

/**
 * `live` is false while a prerendered page still shows its static island (the build-time mirror of everything
 * below the hero). Once the hydrated page is idle it becomes true in a transition (time-sliced, off the paint
 * path) and the page swaps the island for its live sections. `ensureLive()` makes it true synchronously, for
 * handlers that need a live node (the scan form, the video sections) before the idle swap has happened.
 *
 * If the page is on a fragment whose target was inside the island (opened on #scan-form, or an in-page link
 * tapped before the app was up) and the visitor has not scrolled since, its live copy is scrolled to after the swap.
 */
export function useLive(prerendered) {
  const [live, setLive] = useState(!prerendered);
  const liveRef = useRef(!prerendered);
  const rescrollRef = useRef(false);

  useEffect(() => {
    if (!prerendered) return undefined;
    // Only the browser's own fragment scroll counts: once the visitor scrolls or types, the swap leaves them be.
    let moved = false;
    const onInput = () => { moved = true; };
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    inputs.forEach((type) => window.addEventListener(type, onInput, { capture: true, passive: true }));
    const cancel = idle(() => {
      if (liveRef.current) return;
      liveRef.current = true;
      rescrollRef.current = !moved && Boolean(hashTarget()?.closest('[data-al-island]'));
      startTransition(() => setLive(true));
    });
    return () => {
      cancel();
      inputs.forEach((type) => window.removeEventListener(type, onInput, { capture: true }));
    };
  }, [prerendered]);

  useEffect(() => {
    if (!live || !rescrollRef.current) return;
    rescrollRef.current = false;
    hashTarget()?.scrollIntoView({ block: 'start' });
  }, [live]);

  const ensureLive = useCallback(() => {
    if (liveRef.current) return;
    liveRef.current = true;
    flushSync(() => setLive(true));
  }, []);

  return [live, ensureLive];
}
