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

test('failed and needs-attention request rows can discard a missing article with confirmation', () => {
  // The failed/needs_attention + orphaned-slug rule lives in canDiscardFromRequest
  // (src/admin/lib/blog-studio.js, behavior-tested in blog-review-fixes.test.js).
  assert.match(studio, /canDiscardFromRequest\(request,\s*view,\s*data\?\.articles\)/);
  assert.match(studio, /request\.slug/);
  assert.match(studio, /request-discard/);
  assert.match(studio, /Confirm discard/);
  assert.match(studio, /discardDraft\(request\.slug\)/);
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

// 2026-09-30: the Content Publisher is collapsible (Blog Studio + one group per silo + one per
// cluster), filterable, and remembers its layout in localStorage. The collapse state lives in
// ContentPublisher, never in BlogStudio (BlogStudio stays free of storage; asserted above).
test('ContentPublisher groups are native <details> with remembered, guarded open state', () => {
  assert.match(publisher, /<details\b/);
  assert.ok((publisher.match(/<details\b/g) || []).length >= 3, 'Blog Studio, silo and cluster groups');
  assert.match(publisher, /onToggle=\{/);
  assert.match(publisher, /Expand all/);
  assert.match(publisher, /Collapse all/);
  assert.match(publisher, /aria-label="Filter articles"/);
  assert.match(publisher, /aria-label="Status filter"/);
  assert.match(publisher, /readStoredOpenState\(browserStorage\(\)\)/);
  assert.match(publisher, /writeStoredOpenState\(browserStorage\(\)/);
  // every direct localStorage touch in the panel sits inside a try block
  const storageFn = publisher.match(/function browserStorage\(\)[\s\S]*?\n\}/)?.[0] || '';
  assert.match(storageFn, /try \{[\s\S]*window\.localStorage[\s\S]*\} catch/);
  assert.equal((publisher.match(/window\.localStorage/g) || []).length, 1, 'window.localStorage is touched only inside browserStorage()');
  // Blog Studio is wrapped in its own <details>, still above Next up
  const blogDetails = publisher.lastIndexOf('<details', publisher.indexOf('<BlogStudio'));
  assert.ok(blogDetails >= 0 && blogDetails < publisher.indexOf('<BlogStudio'));
  assert.ok(publisher.indexOf('</details>', publisher.indexOf('<BlogStudio')) < publisher.indexOf('{nextUp &&'));
  // the silo publish number is shown on rows and in Next up
  assert.match(publisher, /numberLabel\(a\)/);
  assert.match(publisher, /numberLabel\(nextUp\)/);
  assert.doesNotMatch(publisher, /Confirm — go live/);
});

// 2026-09-30 fixes: a group collapsed while a filter is active is tracked (unpersisted) so the
// <details> element and React's `open` prop never disagree, and the Blog Studio summary shows the
// same failed / needs-attention pills a silo group does. Behaviour is unit-tested in
// test/content-groups.test.js (groupOpen, withFilterToggle, filterKeyOf) and test/blog-studio.test.js
// (blogStudioAttention); this pins the wiring.
test('ContentPublisher keeps filtered groups in sync and flags Blog Studio problems on its summary', () => {
  assert.match(publisher, /const isOpen = \(id\) => groupOpen\(id, \{ filterKey, filterOpen, openMap, defaults \}\)/);
  assert.match(publisher, /setFilterOpen\(\(cur\) => withFilterToggle\(cur, filterKey, id, next\)\)/);
  assert.match(publisher, /if \(!filterKeyOf\(nextQuery, nextStatus\)\) setFilterOpen\(null\)/);
  // no early return that ignores a toggle while filtering (the stuck-closed bug)
  assert.doesNotMatch(publisher, /if \(filtering && id !== BLOG_STUDIO_GROUP_ID\) return;/);
  const blogSummary = publisher.match(/<details[^>]*BLOG_STUDIO_GROUP_ID[\s\S]*?<\/summary>/)?.[0] || '';
  assert.match(blogSummary, /<GroupPills group=\{blogAttention\} \/>/);
  assert.match(publisher, /blogStudioAttention\(data, loadedAt\)/);
  assert.match(publisher, /needs' : 'need'\} attention/);
  assert.doesNotMatch(publisher, /[—–]\s*go live/);
});
