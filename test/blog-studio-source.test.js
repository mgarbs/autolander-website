import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const readSource = (url) => (existsSync(url) ? readFileSync(url, 'utf8') : '');
const studio = readSource(new URL('../src/admin/BlogStudio.jsx', import.meta.url));
const publisher = readSource(new URL('../src/admin/ContentPublisher.jsx', import.meta.url));

test('ContentPublisher places BlogStudio above the drip publisher and excludes blog rows', () => {
  assert.match(publisher, /import BlogStudio from ['"]\.\/BlogStudio\.jsx['"]/);
  const tag = publisher.match(/<BlogStudio\b[\s\S]*?\/>/)?.[0] || '';
  assert.match(tag, /data=\{data\}/);
  assert.match(tag, /reload=\{load\}/);
  assert.match(tag, /onUnauthorized=\{onUnauthorized\}/);

  assert.ok(publisher.indexOf('<BlogStudio') >= 0);
  assert.ok(publisher.indexOf('<BlogStudio') < publisher.indexOf('{nextUp &&'));
  assert.match(publisher, /const dripArticles\s*=/);
  assert.match(publisher, /liveCount\s*=\s*dripArticles\.filter/);
  assert.match(publisher, /dripArticles\.find/);
  assert.ok((publisher.match(/dripArticles/g) || []).length >= 4);
});

test('ContentPublisher polls for backend blog activity and optimistic local work', () => {
  assert.match(publisher, /isBlogActivityInFlight/);
  assert.match(publisher, /blogBusy/);
  assert.match(publisher, /onBusyChange=\{/);
  const inFlightBlock = publisher.match(/const anyInFlight[\s\S]{0,500}/)?.[0] || '';
  assert.match(inFlightBlock, /blogBusy|isBlogActivityInFlight/);
});

test('BlogStudio composer uses accessible fields, exact copy, and API helpers', () => {
  assert.match(studio, /apiGet/);
  assert.match(studio, /apiPost/);
  assert.match(studio, /ApiError/);
  assert.doesNotMatch(studio, /\bfetch\s*\(/);
  assert.match(studio, /What should the post cover\? Audience, angle, anything it must include\./);
  assert.match(
    studio,
    /Opus 5\.5 · max effort · reads the whole site · uses your Claude subscription · usually 5 to 15 min/,
  );
  assert.match(studio, />\s*Write draft\s*</);
  assert.match(studio, /\/admin\/blog\/generate/);
  assert.match(studio, /maxLength=\{?6000\}?/);
  assert.match(studio, /maxLength=\{?80\}?/);
  assert.match(studio, /Target keyword/i);
});

test('BlogStudio shows recent request state, elapsed time, excerpts, failures, and run links', () => {
  assert.match(studio, /blogRequests/);
  assert.match(studio, /sortBlogRequests/);
  assert.match(studio, /requestPresentation/);
  assert.match(studio, /promptExcerpt/);
  assert.match(studio, /blogFailureMessage/);
  assert.match(studio, /target="_blank"/);
  assert.match(studio, /rel="noreferrer"/);
});

test('draft cards expose SEO facts and all guarded actions', () => {
  for (const field of [
    'primaryKeyword',
    'validationOk',
    'validationErrors',
    'wordCount',
    'outboundLinks',
    'inboundFrom',
    'augmentKeys',
    'description',
  ]) {
    assert.ok(studio.includes(field), `missing SEO field ${field}`);
  }
  for (const label of ['Preview', 'Revise', 'Send revision', 'Publish', 'Discard']) {
    assert.ok(studio.includes(label), `missing action ${label}`);
  }
  assert.match(studio, /\/admin\/blog\/revise/);
  assert.match(studio, /\/admin\/content\/publish/);
  assert.match(studio, /\/admin\/blog\/discard/);
  assert.match(studio, /Confirm publish/i);
  assert.match(studio, /Confirm discard/i);
  assert.match(studio, /disabled=\{[^}]*validationOk/);
  assert.match(studio, /status\s*===\s*['"]published['"]/);
  assert.match(studio, /isBlogSlugInFlight/);
  assert.match(studio, /publishPresentation/);
  assert.match(studio, /publishing/i);
  assert.match(studio, /last publish failed/i);
});

test('preview is a script-disabled accessible dialog with keyboard and focus handling', () => {
  assert.match(studio, /\/admin\/blog\/preview\?slug=/);
  assert.match(studio, /role="dialog"/);
  assert.match(studio, /aria-modal="true"/);
  assert.match(studio, /aria-(?:label|labelledby)=/);
  assert.match(studio, /event\.key\s*===\s*['"]Escape['"]/);
  assert.match(studio, /autoFocus|\.focus\(\)/);
  assert.match(studio, /onFocus=\{/);
  assert.match(studio, /aria-label="Close preview"/);
  assert.match(studio, /<iframe/);
  assert.match(studio, /sandbox=""/);
  assert.match(studio, /srcDoc=\{/);
  assert.match(studio, /title="Preview"/);
  assert.match(studio, /(?:min-)?h-\[[^\]]+\]/);
  assert.doesNotMatch(studio, /dangerouslySetInnerHTML/);
});

test('BlogStudio stays mobile-safe and follows the UI copy and privacy constraints', () => {
  assert.match(studio, /grid-cols-1/);
  assert.match(studio, /sm:grid-cols-/);
  assert.match(studio, /min-h-9/);
  assert.match(studio, /min-w-0|break-words/);
  assert.doesNotMatch(studio, /overflow-x-auto/);
  assert.doesNotMatch(studio, /[—–]/);
  assert.doesNotMatch(studio, /\bnot [^.?!]{1,100}\.\s+(?:It|That)'s\b/i);
  assert.doesNotMatch(studio, /\b(?:answers?|routes?|replies? to) (?:buyer|customer) messages\b/i);
  assert.doesNotMatch(studio, /localStorage|sessionStorage|console\./);
});
