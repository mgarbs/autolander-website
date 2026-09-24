// Stripe Checkout returns the customer to `/pay/<token>?state=success&session_id=cs_…`
// (cloud services/billing-links.js success_url). That session id, together with the pay
// token in the same URL, is what lets the cloud reveal the payer's e-mail on the success
// page — so it must never reach a third party. Root.jsx fires PageView (Meta Pixel + CAPI
// with the full page URL) on every route, /pay included, which is why main.jsx calls
// stashCheckoutSessionFromLocation() as its very first statement: the id moves out of the
// address bar into sessionStorage (+ a module-level copy) BEFORE any tracking can read
// window.location.href.
//
// Pure module on purpose — no import.meta, no React — so the node:test suite can load it.

export const PAY_SESSION_STORAGE_PREFIX = 'al_pay_session:';

// Same pattern as the Worker's booking/pay-proxy.js and the cloud's services/billing-links.js —
// change all three together if Stripe ever changes its id format.
const CHECKOUT_SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]{1,250}$/;
const PAY_TOKEN_PATH = /^\/pay\/([^/]+)\/?$/;
const SESSION_PARAM = 'session_id';

// token -> session id. Survives a sessionStorage that throws (Safari private mode, blocked
// storage) for the life of this page load, which is all the success view needs.
const memory = new Map();

const EMPTY_SPLIT = Object.freeze({ token: '', sessionId: '', cleanedHref: '' });

export function isCheckoutSessionId(value) {
  return typeof value === 'string' && CHECKOUT_SESSION_ID_PATTERN.test(value);
}

// '/pay/tok123' or '/pay/tok123/' -> 'tok123'; anything else (including a malformed
// %-escape) -> ''. Mirrors PayApp's tokenFromPath.
export function payTokenFromPath(pathname) {
  if (typeof pathname !== 'string') return '';
  const match = pathname.match(PAY_TOKEN_PATH);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return '';
  }
}

function paramName(pair) {
  const eq = pair.indexOf('=');
  const raw = (eq === -1 ? pair : pair.slice(0, eq)).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function paramValue(pair) {
  const eq = pair.indexOf('=');
  if (eq === -1) return '';
  const raw = pair.slice(eq + 1).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(raw);
  } catch {
    return '';
  }
}

// Split the Stripe session id out of a /pay/<token> URL.
//   -> { token, sessionId, cleanedHref }
// Only /pay/<token> URLs that actually carry a session_id param are split; everything else
// returns the empty result (so the homepage and every other route are a no-op). EVERY
// session_id pair is removed from the URL, valid or not, but `sessionId` is only set for a
// well-formed id. The remaining query pairs keep their exact bytes (never re-encoded), and
// `cleanedHref` is relative: pathname + remaining search + hash.
export function splitCheckoutSessionFromUrl(href) {
  let url;
  try {
    url = new URL(String(href ?? ''), 'https://autolander.ai');
  } catch {
    return EMPTY_SPLIT;
  }

  const token = payTokenFromPath(url.pathname);
  if (!token || !url.search) return EMPTY_SPLIT;

  const pairs = url.search.slice(1).split('&');
  const sessionPairs = pairs.filter((pair) => pair && paramName(pair) === SESSION_PARAM);
  if (sessionPairs.length === 0) return EMPTY_SPLIT;

  const sessionId = sessionPairs.map(paramValue).find(isCheckoutSessionId) || '';
  const kept = pairs.filter((pair) => pair && paramName(pair) !== SESSION_PARAM);
  return {
    token,
    sessionId,
    cleanedHref: `${url.pathname}${kept.length ? `?${kept.join('&')}` : ''}${url.hash}`,
  };
}

function browserWindow() {
  return typeof window === 'undefined' ? null : window;
}

// Called once, first thing in main.jsx. Never throws: a storage or history failure must not
// stop the site from rendering.
export function stashCheckoutSessionFromLocation(win = browserWindow()) {
  try {
    if (!win?.location) return;
    const { token, sessionId, cleanedHref } = splitCheckoutSessionFromUrl(win.location.href);
    if (!token || !cleanedHref) return;

    if (sessionId) {
      memory.set(token, sessionId);
      try {
        win.sessionStorage?.setItem(`${PAY_SESSION_STORAGE_PREFIX}${token}`, sessionId);
      } catch {
        /* storage is optional — the in-memory copy covers this page load */
      }
    }

    try {
      win.history?.replaceState?.(win.history.state, '', cleanedHref);
    } catch {
      /* a failed scrub must never break the page */
    }
  } catch {
    /* never block rendering */
  }
}

// The Stripe session id for this pay token, or ''. Looks in memory (this page load), then
// sessionStorage (a reload in the same tab), then the live URL (a stash that never ran).
export function checkoutSessionIdFor(token, win = browserWindow()) {
  if (typeof token !== 'string' || !token) return '';

  const remembered = memory.get(token);
  if (isCheckoutSessionId(remembered)) return remembered;

  try {
    const stored = win?.sessionStorage?.getItem(`${PAY_SESSION_STORAGE_PREFIX}${token}`);
    if (isCheckoutSessionId(stored)) return stored;
  } catch {
    /* storage unavailable — fall through to the URL */
  }

  try {
    const split = splitCheckoutSessionFromUrl(win?.location?.href);
    if (split.token === token && isCheckoutSessionId(split.sessionId)) return split.sessionId;
  } catch {
    /* ignore */
  }
  return '';
}
