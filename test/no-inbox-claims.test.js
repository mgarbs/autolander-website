// AutoLander has no inbox feature of any kind: it never opens, answers, routes or forwards a
// Marketplace message, and the dealer's own team answers every buyer. The article and blog
// tripwires only see drafts, so an evergreen page (data-*.mjs) shipped "remove sold buyer
// messages" / "assisting with buyer messages" straight into llms.txt and llms-full.txt, which AI
// engines quote verbatim. These checks run over the GENERATED output instead.
//
// Same file pins the entity line agents read first: AutoLander serves the United States, Canada
// and Spanish-speaking Latin America, so the llms.txt header and the Markdown 404 must not say
// "U.S. car dealerships". (Report figures like "196 U.S. dealerships" are a real U.S. sample and
// are not touched by this.)

import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { INBOX_CLAIMS } from '../scripts/seo/articles/content-rules.mjs';
import { notFoundMarkdown } from '../worker/src/agent/site.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = resolve(ROOT, 'public');
const read = (p) => readFileSync(p, 'utf8');

function textFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...textFiles(p));
    else if (/\.(?:md|txt)$/.test(name)) out.push(p);
  }
  return out;
}

test('no generated page, twin or llms file claims AutoLander handles buyer messages', () => {
  const files = textFiles(PUBLIC);
  assert.ok(files.some((f) => f.endsWith('llms-full.txt')), 'llms-full.txt must be generated before tests run');
  const hits = [];
  for (const file of files) {
    const body = read(file);
    for (const re of INBOX_CLAIMS) {
      const m = body.match(re);
      if (m) hits.push(`${relative(ROOT, file)}: "${body.slice(Math.max(0, m.index - 60), m.index + m[0].length + 20).replace(/\s+/g, ' ')}"`);
    }
  }
  assert.deepEqual(hits, [], `inbox claims found:\n${hits.join('\n')}`);
});

test('the inbox tripwires catch the phrasings that shipped before', () => {
  for (const bad of [
    'auto-post inventory and remove sold buyer messages.',
    'managing eligible vehicles in a queue, and assisting with buyer messages.',
    'post your inventory automatically, and help handle incoming buyer messages.',
    'AutoLander routes buyer messages to the sales team.',
  ]) {
    assert.ok(INBOX_CLAIMS.some((re) => re.test(bad)), `not caught: ${bad}`);
  }
  for (const fine of [
    'Your inbox stays yours: AutoLander never opens, answers or forwards a Marketplace message.',
    'RelayAuto runs posting, AI lead replies and appointment booking on its own servers.',
  ]) {
    assert.ok(!INBOX_CLAIMS.some((re) => re.test(fine)), `false positive: ${fine}`);
  }
});

test('llms.txt opens with the real markets and the no-inbox line', () => {
  const head = read(resolve(PUBLIC, 'llms.txt')).split('\n').slice(0, 12).join(' ').replace(/>\s*/g, '').replace(/\s+/g, ' ');
  assert.ok(!/for U\.S\. car dealerships/.test(head), 'header still says U.S.-only');
  assert.ok(head.includes('United States, Canada and Spanish-speaking Latin America'), 'header must name all three markets');
  assert.ok(head.includes('never opens, answers or forwards a buyer message'), 'header must carry the no-inbox line');
});

test('the Markdown 404 describes the real markets', () => {
  const body = notFoundMarkdown('/missing').replace(/\s+/g, ' ');
  assert.ok(!/U\.S\. car dealerships/.test(body));
  assert.ok(body.includes('United States, Canada and Spanish-speaking Latin America'));
});
