// /pay success next-step copy (src/pay/lib/next-steps.js + TokenCheckout's NextSteps).
//
// Pins the team's sentence verbatim (with and without a known payer e-mail), the Clay tel:
// link, the download link per device, and the success view's no-pixel invariant. The trial
// screen ("Your free trial is live") has its own sentence (Notion #14): the cloud already
// created the account and mailed the login, so it never says "create your account".

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  CLAY_TEL_HREF,
  DOWNLOAD_SETUP_PATH,
  detectDesktopOs,
  downloadSetupHref,
  isMobileDevice,
  nextStepsSegments,
  nextStepsText,
  normalizePayerEmail,
  TRIAL_EMAIL_FALLBACK,
  trialNextStepsSegments,
  trialNextStepsText,
} from '../src/pay/lib/next-steps.js';
import { normalizeSummary } from '../src/pay/lib/summary.js';

const WITH_EMAIL =
  'Next: download AutoLander and create your account or sign in with this same e-mail (buyer@example.com) '
  + 'so your plan shows up automatically. Already have an account under a different e-mail? '
  + 'Text Clay at (919) 280-0967 and he\'ll link it for you.';

const WITHOUT_EMAIL =
  'Next: download AutoLander and create your account or sign in with the same e-mail you paid with '
  + 'so your plan shows up automatically. Already have an account under a different e-mail? '
  + 'Text Clay at (919) 280-0967 and he\'ll link it for you.';

const TRIAL_WITH_EMAIL =
  'Your login is on its way to buyer@example.com. Download AutoLander and sign in with it.';

const TRIAL_WITHOUT_EMAIL =
  'Your login is on its way to the e-mail you signed up with. Download AutoLander and sign in with it.';

const INVALID_EMAILS = ['', null, undefined, '   ', 'not-an-email', 42, 'a@b', '<script>@x.com', 'a b@c.com', {}, []];

const UA = {
  windowsChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
};

test('with a known payer e-mail the copy is the team sentence verbatim, e-mail normalized', () => {
  assert.equal(nextStepsText('Buyer@Example.com '), WITH_EMAIL);
  assert.equal(nextStepsText('buyer@example.com'), WITH_EMAIL);
});

test('an unknown or invalid e-mail falls back to "the same e-mail you paid with"', () => {
  for (const value of ['', null, undefined, '   ', 'not-an-email', 42, 'a@b', '<script>@x.com', 'a b@c.com', {}, []]) {
    assert.equal(nextStepsText(value), WITHOUT_EMAIL, JSON.stringify(value));
  }
});

test('segments: one download link, one Clay tel: link, an e-mail segment only when valid', () => {
  const withEmail = nextStepsSegments('buyer@example.com');
  const tel = withEmail.filter((segment) => segment.kind === 'tel');
  assert.deepEqual(tel, [{ kind: 'tel', text: '(919) 280-0967', href: 'tel:9192800967' }]);
  assert.equal(CLAY_TEL_HREF, 'tel:9192800967');
  assert.equal(withEmail.filter((segment) => segment.kind === 'download').length, 1);
  assert.equal(withEmail.find((segment) => segment.kind === 'download').text, 'download AutoLander');
  assert.deepEqual(withEmail.filter((segment) => segment.kind === 'email'), [{ kind: 'email', text: 'buyer@example.com' }]);

  const withoutEmail = nextStepsSegments('');
  assert.equal(withoutEmail.filter((segment) => segment.kind === 'email').length, 0);
  assert.equal(withoutEmail.filter((segment) => segment.kind === 'tel').length, 1);
  assert.equal(withoutEmail.filter((segment) => segment.kind === 'download').length, 1);
  for (const segment of [...withEmail, ...withoutEmail]) {
    assert.ok(['text', 'download', 'email', 'tel'].includes(segment.kind), segment.kind);
    assert.equal(typeof segment.text, 'string');
  }
});

test('trial screen: "login on its way" sentence verbatim, e-mail normalized, never "create your account"', () => {
  assert.equal(trialNextStepsText('Buyer@Example.com '), TRIAL_WITH_EMAIL);
  assert.equal(trialNextStepsText('buyer@example.com'), TRIAL_WITH_EMAIL);
  for (const sentence of [TRIAL_WITH_EMAIL, TRIAL_WITHOUT_EMAIL]) {
    assert.doesNotMatch(sentence, /create your account|sign in with this same e-mail|Text Clay/);
  }
  // The paid ("Payment received") sentence is untouched by the trial variant.
  assert.equal(nextStepsText('buyer@example.com'), WITH_EMAIL);
});

test('trial screen falls back when the payer e-mail is unknown or invalid', () => {
  assert.equal(TRIAL_EMAIL_FALLBACK, 'the e-mail you signed up with');
  for (const value of INVALID_EMAILS) {
    assert.equal(trialNextStepsText(value), TRIAL_WITHOUT_EMAIL, JSON.stringify(value));
  }
});

test('trial segments: one "Download AutoLander" link, an e-mail segment only when valid, no tel segment', () => {
  const withEmail = trialNextStepsSegments('buyer@example.com');
  const withoutEmail = trialNextStepsSegments('');
  for (const segments of [withEmail, withoutEmail]) {
    const downloads = segments.filter((segment) => segment.kind === 'download');
    assert.equal(downloads.length, 1);
    assert.equal(downloads[0].text, 'Download AutoLander');
    assert.equal(segments.filter((segment) => segment.kind === 'tel').length, 0);
    for (const segment of segments) {
      assert.ok(['text', 'download', 'email', 'tel'].includes(segment.kind), segment.kind);
      assert.equal(typeof segment.text, 'string');
    }
  }
  assert.deepEqual(withEmail.filter((segment) => segment.kind === 'email'), [{ kind: 'email', text: 'buyer@example.com' }]);
  assert.deepEqual(withoutEmail.filter((segment) => segment.kind === 'email'), []);
});

test('normalizePayerEmail keeps plausible addresses and drops markup-ish or oversized input', () => {
  assert.equal(normalizePayerEmail(' Owner@Dealer.COM '), 'owner@dealer.com');
  assert.equal(normalizePayerEmail('first.last+tag@sub.dealer.co'), 'first.last+tag@sub.dealer.co');
  assert.equal(normalizePayerEmail('<script>@x.com'), '');
  assert.equal(normalizePayerEmail('x@y.com<img>'), '');
  assert.equal(normalizePayerEmail('(x)@y.com'), '');
  assert.equal(normalizePayerEmail(`${'a'.repeat(250)}@x.com`), '');
  assert.equal(normalizePayerEmail(null), '');
});

test('downloadSetupHref points at the existing download page for the detected computer', () => {
  assert.equal(DOWNLOAD_SETUP_PATH, '/download/setup/');
  assert.equal(downloadSetupHref({ userAgent: UA.windowsChrome }), '/download/setup/?os=windows');
  assert.equal(downloadSetupHref({ userAgent: UA.macSafari }), '/download/setup/?os=mac');
  assert.equal(downloadSetupHref({ userAgent: UA.linux }), '/download/setup/?os=linux');
  // A phone never auto-downloads an installer it cannot run.
  assert.equal(downloadSetupHref({ userAgent: UA.iphone }), '/download/setup/?os=mac&open=1');
  assert.equal(downloadSetupHref({ userAgent: UA.macSafari, maxTouchPoints: 5 }), '/download/setup/?os=mac&open=1');
  assert.equal(downloadSetupHref({ userAgent: UA.android }), '/download/setup/?os=linux&open=1');
  assert.equal(downloadSetupHref(), '/download/setup/?os=windows');

  assert.equal(detectDesktopOs(''), 'windows');
  assert.equal(isMobileDevice({ userAgent: UA.macSafari, maxTouchPoints: 0 }), false);
  assert.equal(isMobileDevice({ userAgent: UA.macSafari, maxTouchPoints: 1 }), false);
  assert.equal(isMobileDevice({ userAgent: UA.windowsChrome, maxTouchPoints: 10 }), false);
});

test('normalizeSummary carries a normalized payerEmail ("" when absent or invalid)', () => {
  assert.equal(normalizeSummary({ payerEmail: ' Buyer@Example.com ' }).payerEmail, 'buyer@example.com');
  assert.equal(normalizeSummary({}).payerEmail, '');
  assert.equal(normalizeSummary({ payerEmail: null }).payerEmail, '');
  assert.equal(normalizeSummary({ payerEmail: 'nope' }).payerEmail, '');
  assert.equal(normalizeSummary(null).payerEmail, '');
});

test('source guard: TokenCheckout renders NextSteps on both success branches (trial variant on the trial one) and fires no pixel', async () => {
  const [tokenCheckout, mainSource, payApp, payApi] = await Promise.all([
    readFile(new URL('../src/pay/TokenCheckout.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pay/PayApp.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pay/lib/pay-api.js', import.meta.url), 'utf8'),
  ]);

  assert.match(tokenCheckout, /from '\.\/lib\/next-steps\.js'/);
  assert.equal((tokenCheckout.match(/<NextSteps/g) || []).length, 2);
  // Notion #14: the trial branch carries variant="trial"; the "Payment received" branch keeps
  // the paid sentence (plain call, no variant).
  assert.match(tokenCheckout, /trialNextStepsSegments/);
  assert.equal((tokenCheckout.match(/<NextSteps [^>]*variant="trial"/g) || []).length, 1);
  assert.equal((tokenCheckout.match(/<NextSteps payerEmail=\{summary\?\.payerEmail\} \/>/g) || []).length, 1);
  const trialHeadingAt = tokenCheckout.indexOf('Your free trial is live');
  const trialVariantAt = tokenCheckout.indexOf('variant="trial"');
  const paidHeadingAt = tokenCheckout.indexOf('Payment received');
  assert.ok(trialHeadingAt !== -1 && paidHeadingAt !== -1, 'both success headings present');
  assert.ok(trialHeadingAt < trialVariantAt, 'variant="trial" sits after the trial heading');
  assert.ok(trialVariantAt < paidHeadingAt, 'variant="trial" sits before the Payment received branch');
  assert.doesNotMatch(tokenCheckout, /fbq\(|trackCustom\(|track\(['"]Purchase/);
  assert.match(tokenCheckout, /getPaySummary\(token, \{ sessionId: isSuccessReturn \? sessionId : '' \}\)/);
  assert.match(tokenCheckout, /rel="noopener"/);

  // The scrub must run before React mounts (and so before Root's pageView()).
  const stashAt = mainSource.indexOf('stashCheckoutSessionFromLocation(');
  const importAt = mainSource.indexOf("from './pay/lib/checkout-session.js'");
  const createRootAt = mainSource.indexOf('createRoot(');
  assert.ok(importAt !== -1, 'main.jsx imports the checkout-session scrub');
  assert.ok(stashAt !== -1 && stashAt > importAt, 'main.jsx calls stashCheckoutSessionFromLocation()');
  assert.ok(stashAt < createRootAt, 'stashCheckoutSessionFromLocation() runs before createRoot()');

  assert.match(payApp, /checkoutSessionIdFor\(token\)/);
  assert.match(payApp, /sessionId=\{sessionId\}/);
  assert.match(payApi, /isCheckoutSessionId\(sessionId\)/);
});
