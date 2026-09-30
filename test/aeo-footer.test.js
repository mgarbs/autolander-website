import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { AI_VISIBILITY_PATH, FOOTER_NAV } from '../shared/ai-visibility-content.js';
import { renderAiVisibilityMirror } from '../src/ai/static-mirror.js';

const read = (file) => readFileSync(file, 'utf8');

// Michael, 2026-09-30: the AEO and GEO page's footer stays on topic (AEO and GEO links plus a short
// path back to AutoLander) instead of the site-wide Marketplace product footer.
test('the AEO and GEO page footer is on topic and shared by React and the no-JS page', () => {
  assert.deepEqual(FOOTER_NAV.map((column) => column.heading), ['AEO & GEO', 'AutoLander', 'Company']);
  const aeo = FOOTER_NAV[0].links.map((link) => link.href);
  for (const hash of ['#scan-form', '#what-is-aeo-geo', '#plans', '#faq']) {
    assert.ok(aeo.includes(`${AI_VISIBILITY_PATH}${hash}`), hash);
  }
  const all = FOOTER_NAV.flatMap((column) => column.links);
  assert.ok(all.length <= 14, 'short, focused footer');
  for (const productPath of ['/facebook-marketplace-auto-poster/', '/bulk-post-cars-to-facebook-marketplace/', '/integrations/', '/compare/']) {
    assert.ok(!all.some((link) => link.href === productPath), `no ${productPath}`);
  }

  const app = read('src/ai/AiVisibilityApp.jsx');
  assert.match(app, /<SiteFooter extraLine=\{FOOTER\.line\} mobileCtaPadding columns=\{FOOTER_NAV\} \/>/);

  const mirror = renderAiVisibilityMirror();
  for (const link of all) assert.ok(mirror.includes(`href="${link.href}"`), link.label);
  assert.doesNotMatch(mirror, /href="\/bulk-post-cars-to-facebook-marketplace\/"/);
});

test('every other page keeps the site-wide footer columns', () => {
  const footer = read('src/components/SiteFooter.jsx');
  assert.match(footer, /columns \? <PageColumns columns=\{columns\} \/> : \(<>/);
  for (const label of ['Product', 'Integrations', 'Compare', 'Company']) assert.match(footer, new RegExp(`aria-label="${label}"`));
});
