import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { parseAst } from 'rollup/parseAst';
import test from 'node:test';
import { AI_VISIBILITY_IMAGES } from '../shared/ai-images.js';
import { FORM, FOOTER, WHERE_BUYERS_ASK } from '../shared/ai-visibility-content.js';
import { assertClassCoverage } from '../scripts/route-css.mjs';
import { renderAiVisibility, renderTeam } from './helpers/route-render.js';
import { HTMLParser } from './helpers/html-text.js';

const read = (path) => readFileSync(path, 'utf8');
const hasDist = existsSync('dist/team/index.html');
const allowlist = JSON.parse(read('scripts/route-css-allowlist.json'));

test('route shells carry covered inline CSS and preserve full CSS on the shared shells', { skip: !hasDist }, () => {
  for (const route of ['team', 'ai-visibility']) {
    const html = read(`dist/${route}/index.html`);
    const styles = [...html.matchAll(/<style data-inline-route-css>([\s\S]*?)<\/style>/g)];
    assert.equal(styles.length, 1, route);
    assert.doesNotMatch(html, /<link\b[^>]*rel="stylesheet"[^>]*href="\/assets\//);
    const root = html.match(/<!--AL_STATIC_PAGE_START-->([\s\S]*?)<!--AL_STATIC_PAGE_END-->/)[1];
    assertClassCoverage(root, styles[0][1], allowlist);
    assertClassCoverage(route === 'team' ? renderTeam() : renderAiVisibility(), styles[0][1], allowlist);
  }
  assert.equal(existsSync('dist/.vite'), false);
  for (const route of ['index.html', '404.html', 'admin/index.html', 'pay/index.html']) {
    const html = read(`dist/${route}`);
    assert.equal((html.match(/<style data-inline-app-css>/g) || []).length, 1, route);
    assert.doesNotMatch(html, /data-inline-route-css/);
  }
});

test('team static JS import closure contains no AI page copy or AI image descriptions', { skip: !hasDist }, () => {
  const shell = read('dist/team/index.html');
  const entry = shell.match(/<link rel="modulepreload" data-al-route-entry[^>]*href="([^"]+)"/)?.[1];
  assert.ok(entry, 'the manifest-selected route entry is preloaded');
  const files = new Set();
  const visit = (file) => {
    if (files.has(file)) return;
    files.add(file);
    for (const node of parseAst(read(file)).body) {
      if (!['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type)) continue;
      const target = node.source?.value;
      if (target?.startsWith('.') && target.endsWith('.js')) visit(resolve(dirname(file), target));
    }
  };
  visit(resolve('dist', entry.slice(1)));
  assert.ok(files.size > 1, 'the assertion includes shared chunks too');
  const forbidden = [WHERE_BUYERS_ASK.h2Grad, ...AI_VISIBILITY_IMAGES.map(({ alt }) => alt)];
  for (const file of files) for (const phrase of forbidden) assert.ok(!read(file).includes(phrase), `${file}: AI copy leaked into team closure`);
});

test('Phase 2 fallback keeps native mirrors and the established React boot, with no hydration sender', { skip: !hasDist }, () => {
  for (const route of ['team', 'ai-visibility']) {
    const html = read(`dist/${route}/index.html`);
    assert.match(html, /id="al-static-page"/);
    assert.match(html, /<script type="module"[^>]*src="\/assets\//);
    assert.doesNotMatch(html, /data-al-route-boot|data-al-route-pageview|data-al-layout-fence/);
  }
});

test('required-note and both footer lines use the accessible contrast color', () => {
  const text = (html) => new HTMLParser().textOf(html);
  for (const html of [renderAiVisibility(), renderTeam()]) {
    const paragraphs = [...html.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)];
    for (const copy of [FORM.requiredNote, FOOTER.line, '\u00a9 2026 AutoLander. All rights reserved.']) {
      const node = paragraphs.find((m) => text(m[2]) === copy);
      if (copy === FORM.requiredNote || copy === FOOTER.line) {
        if (html.includes('data-headline-variant')) continue;
      }
      assert.ok(node?.[1].includes('text-slate-400'), copy);
    }
  }
});

test('team keeps its approved FAQ heading and both pricing fragment targets', () => {
  const html = renderTeam();
  assert.match(html, /<h2\b[^>]*>FAQ<\/h2>/);
  assert.match(html, /<section id="team-pricing"/);
  assert.match(html, /id="pricing"/);
});
