import assert from 'node:assert/strict';
import test from 'node:test';
import {
  carryValues, createIslandSwap, isDirtyField, islandActivity, landedOnIslandFragment, restoreIslandFocus,
} from '../src/lib/use-live.js';

// A minimal DOM: just what lib/use-live.js reads. Elements know their parent, so contains()/closest() work.
class El {
  constructor(tag, props = {}, parent = null) {
    Object.assign(this, { tagName: tag.toUpperCase(), id: '', name: '', type: '', value: '', defaultValue: '', ...props });
    this.parent = parent;
    this.children = [];
    this.isConnected = true;
    this.focusCalls = [];
    this.selections = [];
    if (parent) parent.children.push(this);
  }
  contains(other) {
    for (let node = other; node; node = node.parent) if (node === this) return true;
    return false;
  }
  closest(selector) {
    for (let node = this; node; node = node.parent) {
      if (selector === '[data-al-island]' && node.island) return node;
    }
    return null;
  }
  descendants() { return this.children.flatMap((child) => [child, ...child.descendants()]); }
  querySelectorAll() {
    // Only ever asked for the island's form controls: inputs that are not hidden, selects and textareas.
    return this.descendants().filter((el) => ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) && el.type !== 'hidden');
  }
  focus(options) { this.focusCalls.push(options); this.doc.activeElement = this; }
  setSelectionRange(start, end) {
    if (this.type === 'email') throw new Error('InvalidStateError');
    this.selections.push([start, end]);
  }
}

function islandPage({ focusName = null } = {}) {
  const doc = {
    listeners: [],
    addEventListener(type, fn, capture) { this.listeners.push({ type, fn, capture }); },
    removeEventListener(type, fn) { this.listeners = this.listeners.filter((l) => l.type !== type || l.fn !== fn); },
    fire(type) { this.listeners.filter((l) => l.type === type).forEach((l) => l.fn({})); },
  };
  const body = new El('body');
  const island = new El('div', { island: true }, body);
  const form = new El('form', { id: 'scan-form' }, island);
  const field = (tag, props) => { const el = new El(tag, props, form); el.form = form; return el; };
  const fields = {
    dealershipName: field('input', { id: 'scan-dealershipName', name: 'dealershipName', type: 'text' }),
    email: field('input', { id: 'scan-email', name: 'email', type: 'email' }),
    role: field('select', { id: 'scan-role', name: 'role', selectedIndex: 0,
      options: [{ defaultSelected: false, selected: true }, { defaultSelected: false, selected: false }] }),
    smsConsent: field('input', { id: 'scan-sms-consent', name: 'smsConsent', type: 'checkbox', checked: false, defaultChecked: false }),
    submissionId: field('input', { name: 'submissionId', type: 'hidden', value: 'x' }),
  };
  const link = new El('a', { id: 'faq-link' }, island);
  const outside = new El('button', { id: 'nav-cta' }, body);
  for (const el of [body, island, form, ...Object.values(fields), link, outside]) el.doc = doc;
  Object.assign(doc, {
    body,
    activeElement: focusName ? fields[focusName] : body,
    querySelectorAll: () => [island],
    getElementById: (id) => [island, form, ...Object.values(fields), link, outside].find((el) => el.id === id) || null,
  });
  return { doc, body, island, form, fields, link, outside };
}

function scheduler() {
  const queue = [];
  const schedule = (fn) => { const job = { fn, cancelled: false }; queue.push(job); return () => { job.cancelled = true; }; };
  const run = () => { const jobs = queue.splice(0); jobs.filter((job) => !job.cancelled).forEach((job) => job.fn()); return jobs.length; };
  return { schedule, run, pending: () => queue.filter((job) => !job.cancelled).length };
}

test('dirty means changed from the markup: typed, picked, ticked or autofilled', () => {
  assert.equal(isDirtyField({ tagName: 'INPUT', type: 'text', value: '', defaultValue: '' }), false);
  assert.equal(isDirtyField({ tagName: 'INPUT', type: 'text', value: 'Acme', defaultValue: '' }), true);
  assert.equal(isDirtyField({ tagName: 'TEXTAREA', value: 'x', defaultValue: 'x' }), false);
  assert.equal(isDirtyField({ tagName: 'INPUT', type: 'checkbox', checked: true, defaultChecked: false }), true);
  assert.equal(isDirtyField({ tagName: 'INPUT', type: 'checkbox', checked: false, defaultChecked: false }), false);
  const opts = (defaultAt) => [0, 1, 2].map((i) => ({ defaultSelected: i === defaultAt }));
  // No `selected` attribute: the first option is the markup's own choice, not a change.
  assert.equal(isDirtyField({ tagName: 'SELECT', options: opts(-1), selectedIndex: 0 }), false);
  assert.equal(isDirtyField({ tagName: 'SELECT', options: opts(-1), selectedIndex: 2 }), true);
  assert.equal(isDirtyField({ tagName: 'SELECT', options: opts(1), selectedIndex: 1 }), false);
  assert.equal(isDirtyField({ tagName: 'SELECT', options: [], selectedIndex: -1 }), false);
});

test('a focused, dirty island form: the idle swap waits, then carries every change once focus leaves', () => {
  const page = islandPage({ focusName: 'dealershipName' });
  const { doc, fields } = page;
  fields.dealershipName.value = 'Acme Motors';
  fields.dealershipName.selectionStart = 5;
  fields.dealershipName.selectionEnd = 5;
  fields.role.selectedIndex = 1;
  fields.role.value = 'Owner';
  fields.smsConsent.checked = true;

  const activity = islandActivity(doc);
  assert.equal(activity.focused, true);
  assert.deepEqual(activity.values, { dealershipName: 'Acme Motors', role: 'Owner', smsConsent: true });
  assert.deepEqual(activity.focus, { id: 'scan-dealershipName', name: 'dealershipName', formId: 'scan-form', selection: [5, 5] });

  const idle = scheduler();
  const swaps = [];
  const islandSwap = createIslandSwap({ doc, schedule: idle.schedule, swap: (a) => swaps.push(a) });
  idle.run();
  assert.equal(swaps.length, 0, 'never swapped out from under a focused field (typing, mobile keyboard)');
  assert.equal(idle.pending(), 0, 'no polling while held');

  // Tabbing to another island control: re-checked once idle, still inside, still held.
  doc.activeElement = fields.email;
  doc.fire('focusout');
  doc.fire('focusout');
  assert.equal(idle.pending(), 1, 'one re-arm, however many focusouts');
  idle.run();
  assert.equal(swaps.length, 0);

  // Focus leaves the island (tap outside / Tab past it): the swap runs and carries the changes.
  fields.email.value = 'gm@acme.test';
  doc.activeElement = page.outside;
  doc.fire('focusout');
  idle.run();
  assert.equal(swaps.length, 1);
  assert.deepEqual(swaps[0].values, { dealershipName: 'Acme Motors', email: 'gm@acme.test', role: 'Owner', smsConsent: true });
  assert.equal(swaps[0].focused, false);
  doc.fire('focusout');
  assert.equal(idle.pending(), 0, 'done: nothing more is scheduled');
  islandSwap.dispose();
  assert.equal(doc.listeners.length, 0, 'dispose removes the focusout listener');
});

test('keyboard or screen-reader focus on an island link also holds the swap', () => {
  const page = islandPage();
  page.doc.activeElement = page.link;
  const idle = scheduler();
  const swaps = [];
  createIslandSwap({ doc: page.doc, schedule: idle.schedule, swap: (a) => swaps.push(a) });
  idle.run();
  assert.equal(swaps.length, 0);
  page.doc.activeElement = page.body;
  page.doc.fire('focusout');
  idle.run();
  assert.equal(swaps.length, 1);
  assert.equal(swaps[0].values, null, 'nothing changed, nothing carried');
});

test('an untouched, unfocused island swaps on the first idle; force() claims it for ensureLive', () => {
  const page = islandPage();
  const idle = scheduler();
  const swaps = [];
  const first = createIslandSwap({ doc: page.doc, schedule: idle.schedule, swap: (a) => swaps.push(a) });
  idle.run();
  assert.equal(swaps.length, 1);
  assert.equal(first.force(), false, 'already claimed by the idle swap');

  const forced = createIslandSwap({ doc: page.doc, schedule: idle.schedule, swap: (a) => swaps.push(a) });
  assert.equal(forced.force(), true);
  idle.run();
  assert.equal(swaps.length, 1, 'a forced swap is never repeated by the idle one');
  forced.dispose();
});

test('a forced swap puts focus and the caret back on the live copy of the field', () => {
  const page = islandPage();
  const live = islandPage();
  // The island is gone: focus fell to <body>; the live form has the same ids.
  live.doc.activeElement = live.body;
  restoreIslandFocus(live.doc, { id: 'scan-dealershipName', name: 'dealershipName', formId: 'scan-form', selection: [3, 7] });
  assert.equal(live.doc.activeElement, live.fields.dealershipName);
  assert.deepEqual(live.fields.dealershipName.focusCalls, [{ preventScroll: true }]);
  assert.deepEqual(live.fields.dealershipName.selections, [[3, 7]]);

  // Same name, different id (the island's scan-sms-consent is the live scan-smsConsent): found by form + name.
  live.doc.activeElement = live.body;
  live.form.elements = { namedItem: (name) => (name === 'smsConsent' ? live.fields.email : null) };
  restoreIslandFocus(live.doc, { id: 'scan-sms-consent-gone', name: 'smsConsent', formId: 'scan-form', selection: null });
  assert.equal(live.doc.activeElement, live.fields.email);

  // An email field has no caret API: focus still moves, nothing throws.
  live.doc.activeElement = live.body;
  restoreIslandFocus(live.doc, { id: 'scan-email', name: 'email', formId: 'scan-form', selection: [1, 1] });
  assert.equal(live.doc.activeElement, live.fields.email);

  // Focus the visitor already moved (e.g. the CTA they tapped) is left where it is.
  live.doc.activeElement = live.outside;
  restoreIslandFocus(live.doc, { id: 'scan-dealershipName', name: 'dealershipName', formId: 'scan-form', selection: null });
  assert.equal(live.doc.activeElement, live.outside);
  restoreIslandFocus(page.doc, null);
});

test('carried values fill only the live form keys, typed as the live form expects', () => {
  const initial = { dealershipName: '', role: '', smsConsent: false, company: '' };
  assert.equal(carryValues(initial, null), initial);
  assert.deepEqual(carryValues(initial, { dealershipName: 'Acme', smsConsent: true, submissionId: 'x', toString: 'y' }),
    { dealershipName: 'Acme', role: '', smsConsent: true, company: '' });
  assert.deepEqual(carryValues(initial, { smsConsent: 'true' }).smsConsent, false, 'a boolean only from true');
});

test('the live copy of a fragment target is scrolled to only if the visitor has not moved since landing on it', () => {
  const island = { island: true };
  const target = (inIsland = true) => ({ closest: (sel) => (sel === '[data-al-island]' && inIsland ? island : null) });
  assert.equal(landedOnIslandFragment(target(), {}), true, 'opened on #scan-form and left there');
  assert.equal(landedOnIslandFragment(target(), { __alInput: 1 }), false, 'scrolled or touched before the app loaded');
  assert.equal(landedOnIslandFragment(target(), { __alInput: 0 }), true, 'a fragment link followed since (hashchange)');
  assert.equal(landedOnIslandFragment(target(), {}, true), false, 'moved after hydration');
  assert.equal(landedOnIslandFragment(target(false), {}), false, 'a target outside the island stays where it is');
  assert.equal(landedOnIslandFragment(null, {}), false, 'no fragment');
});
