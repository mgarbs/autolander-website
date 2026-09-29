import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';

export const tagsSource = await readFile(new URL('../public/al-tags-v1.js', import.meta.url), 'utf8');
export function browser({ url = 'https://autolander.ai/', cookies = {}, tag = null, eager = false, ready = 'complete', gtag, zaraz, queue = [], referrer = '' } = {}) {
  function target() {
    const listeners = new Map();
    return {
      listeners,
      addEventListener(name, fn, options) { const list = listeners.get(name) || []; list.push({ fn, options }); listeners.set(name, list); },
      removeEventListener(name, fn) { listeners.set(name, (listeners.get(name) || []).filter((x) => x.fn !== fn)); },
      emit(name) { for (const { fn, options } of [...(listeners.get(name) || [])]) { fn(); if (options?.once) this.removeEventListener(name, fn); } },
    };
  }
  const jar = new Map(Object.entries(cookies).map(([k, v]) => [k, encodeURIComponent(v)]));
  const writes = [], scripts = [], timers = new Map(), session = new Map();
  let seq = 0;
  const document = { ...target(), title: 'Test', referrer, documentElement: {}, readyState: ready, visibilityState: 'visible',
    currentScript: { hasAttribute: (name) => name === 'data-ga-eager' && eager },
    createElement: () => ({}), head: { appendChild: (s) => scripts.push(s) },
  };
  Object.defineProperty(document, 'cookie', {
    get: () => [...jar].map(([k, v]) => `${k}=${v}`).join('; '),
    set: (value) => { writes.push(value); const pair = value.split(';')[0]; const i = pair.indexOf('='); jar.set(pair.slice(0, i), pair.slice(i + 1)); },
  });
  const node = tag === null ? null : { ...target(), getAttribute: () => tag };
  document.querySelector = () => node;
  const window = { ...target(), document, location: new URL(url), alTagsQ: queue,
    sessionStorage: { getItem: (k) => session.get(k) || null, setItem: (k, v) => session.set(k, String(v)) },
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout: (fn, delay) => { timers.set(++seq, { fn, delay }); return seq; },
    clearTimeout: (id) => timers.delete(id), innerWidth: 1000, innerHeight: 800, screen: {},
  };
  if (gtag) window.gtag = gtag;
  if (zaraz) window.zaraz = zaraz;
  const context = vm.createContext({ window, document, location: window.location, crypto: webcrypto, URL, URLSearchParams, Uint32Array });
  return { window, document, context, jar, writes, scripts, timers, node, session,
    read: (k) => decodeURIComponent(jar.get(k) || ''),
    run: () => vm.runInContext(tagsSource, context),
  };
}

export function installBrowser(t, harness) {
  for (const [key, value] of Object.entries({ window: harness.window, document: harness.document, navigator: { userAgent: 'Mozilla/5.0 test' } })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]);
  }
}

export async function trackerModule({ facade = false, mode = 'production' } = {}) {
  const base = new URL('../src/lib/', import.meta.url);
  const unique = `?test=${crypto.randomUUID()}`;
  let source = await readFile(new URL('tracker.js', base), 'utf8');
  for (const path of ['./identity.js', './tracking-qa.js', '../../shared/tracking-scope.js', '../../shared/meta-signal.js']) {
    source = source.replaceAll(`'${path}'`, JSON.stringify(new URL(path + unique, base).href));
  }
  source = source.replaceAll('import.meta.env', JSON.stringify({ MODE: mode, VITE_CAPI_URL: 'https://autolander.ai' }));
  const tracker = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  if (!facade) return import(tracker);
  source = (await readFile(new URL('tags.js', base), 'utf8'))
    .replaceAll("'./tracker.js'", JSON.stringify(tracker)).replaceAll("'./ga.js'", JSON.stringify(new URL('ga.js' + unique, base).href));
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
