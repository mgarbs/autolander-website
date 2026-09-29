import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { leanBaseCss, cssEscape, assertClassCoverage, assertModuleCoverage } from '../scripts/route-css.mjs';

test('lean base removes exactly the top-level utilities block and preserves other CSS', () => {
  const before = '@layer theme,base,utilities;/* { */@font-face{src:url("{font}")}';
  const after = '@layer components{.x{color:red}}@keyframes spin{to{transform:rotate(360deg)}}@property --x{syntax:"*";inherits:false}';
  assert.equal(leanBaseCss(`${before}@layer utilities{.x{color:blue}@media(a){.y{color:red}}}${after}`), before + after);
  assert.throws(() => leanBaseCss('@layer utilities;'), /found 0/);
  assert.throws(() => leanBaseCss('@layer utilities{}@layer utilities{}'), /found 2/);
  assert.throws(() => leanBaseCss('@layer utilities{'), /incomplete/);
  assert.equal(leanBaseCss(String.raw`@layer utilities{.content-\[\'\{\'\]{--content:"}"}}@layer base{p{margin:0}}`), '@layer base{p{margin:0}}');
});

test('class coverage checks escaped responsive and arbitrary selectors and explicit hooks', () => {
  const tokens = ['sm:text-lg', 'bg-white/10', ['w-', '[25.33%]'].join(''), ['2xl', 'flex'].join(':')];
  assert.equal(cssEscape(tokens[3]), '\\32 xl\\:flex');
  const html = `<p class="${tokens.join(' ')} group">copy</p>`;
  const css = tokens.map((t) => `.${cssEscape(t)}{color:red}`).join('');
  assert.doesNotThrow(() => assertClassCoverage(html, css, { group: 'Parent state marker' }));
  assert.throws(() => assertClassCoverage(html, css), /group/);
  assert.throws(() => assertClassCoverage('<p class="missing">', css), /missing/);
  assert.throws(() => assertClassCoverage('<p class="foo">', '.foo-bar{}'), /foo/);
  const encoded = '[&amp;::-webkit-details-marker]:hidden';
  assert.doesNotThrow(() => assertClassCoverage(`<summary class="${encoded}">`, `.${cssEscape(encoded.replace('&amp;', '&'))}{display:none}`));
});

test('module coverage includes files used only by interactive states', () => {
  const cssPath = resolve('src/team/team.css');
  const modules = [resolve('src/team/TeamApp.jsx'), resolve('src/components/DemoApplication.jsx')];
  assert.throws(() => assertModuleCoverage(modules, cssPath, '@source "./";'), /DemoApplication/);
  assert.doesNotThrow(() => assertModuleCoverage(modules, cssPath, '@source "./"; @source "../components/DemoApplication.jsx";'));
});
