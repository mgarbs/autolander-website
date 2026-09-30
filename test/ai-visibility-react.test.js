import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { PLANS } from '../shared/ai-visibility-content.js';
import * as AI_CONTENT from '../shared/ai-visibility-content.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');

test('AI Visibility content keeps the owner-approved plans and public copy rules', () => {
  assert.deepEqual(
    PLANS.map(({ name, monthly, setup, availability }) => ({ name, monthly, setup, availability })),
    [
      { name: 'AI Foundation', monthly: 997, setup: 997, availability: 'open' },
      { name: 'AI Authority', monthly: 2497, setup: 997, availability: 'by-application' },
      { name: 'Market Leader', monthly: 5997, setup: 2997, availability: 'by-application' },
    ],
  );

  const source = read('shared/ai-visibility-content.js');
  // One FAQ question may say "guarantee" (dealers type it); its answer starts with "No." (static test pins that).
  const guaranteeQuestions = AI_CONTENT.FAQ.filter((item) => /guarantee/i.test(item.q));
  assert.equal(guaranteeQuestions.length, 1);
  assert.equal(guaranteeQuestions[0].allow, true);
  const allowQ = guaranteeQuestions[0].q;
  const disallowed = [
    /[—–]/,
    /earned media/i,
    /backlinks?/i,
    /#1/i,
    /guarantee/i,
    /dominate/i,
    /Google posts/i,
    /service credit/i,
    /missed promise/i,
    /powered by/i,
  ];
  for (const pattern of disallowed) {
    const haystack = String(pattern) === String(/guarantee/i) ? source.replaceAll(allowQ, '') : source;
    assert.doesNotMatch(haystack, pattern);
  }
  const assistantNames = /\b(?:ChatGPT|Perplexity|Gemini|Copilot)\b/i;
  for (const [name, content] of Object.entries(AI_CONTENT)) {
    if (typeof content === 'function' || ['WHERE_BUYERS_ASK', 'RESULTS_VIEW', 'AEO_GEO'].includes(name)) continue;
    // FAQ items marked `names: true` are the only FAQ entries allowed to name an assistant brand.
    const checked = name === 'FAQ' ? content.filter((item) => !item.names) : content;
    assert.doesNotMatch(JSON.stringify(checked), assistantNames, name);
  }
  const sections = read('src/ai/AiSections.jsx').replace(/export function WhereBuyersAskSection\(\)[\s\S]*?(?=export function ReportSection)/, '');
  assert.doesNotMatch(sections, assistantNames);
  assert.doesNotMatch(read('src/ai/AiVisibilityApp.jsx'), assistantNames);
});

test('React scan form exposes native fallback, WebMCP and human-consent controls', () => {
  const app = read('src/ai/AiVisibilityApp.jsx');
  assert.match(app, /id="scan-form"[\s\S]*?method="post"[\s\S]*?action=\{`\$\{CAPI_URL\}\/api\/ai-scan`\}/);
  assert.match(app, /toolname=\{FORM\.webmcp\.toolname\}/);
  assert.match(app, /tooldescription=\{FORM\.webmcp\.tooldescription\}/);
  assert.doesNotMatch(app, /toolautosubmit/i);

  for (const name of ['dealershipName', 'website', 'location', 'fullName', 'role', 'email', 'phone']) {
    assert.ok(app.includes(`htmlFor="scan-${name}"`), `${name} needs an explicit label`);
    assert.ok(app.includes(`id="scan-${name}"`), `${name} needs a stable id`);
    assert.ok(app.includes(`name="${name}"`), `${name} needs its JSON field name`);
    assert.ok(app.includes(`toolparamdescription={FORM.fields.${name}.agentHint}`), `${name} needs its agent hint`);
    assert.ok(app.includes(`id="scan-${name}-error"`), `${name} needs its inline error`);
  }

  assert.match(app, /name="smsConsent" value="true" type="checkbox"/);
  assert.match(app, /name="smsConsent"[\s\S]*?aria-describedby="scan-sms-consent-hint"/);
  assert.match(app, /id="scan-sms-consent-hint"/);
  assert.match(app, /name="smsConsentVersion" value=\{SMS_CONSENT\.version\}/);
  assert.match(app, /name="submittedVia" value="form"/);
  assert.match(app, /document\.modelContext/);
  assert.match(app, /navigator\.modelContext/);
  assert.match(app, /event\.nativeEvent\?\.agentInvoked/);
});

test('fetch scan request identifies its submission path and consent version', () => {
  const source = read('src/ai/scan-request.js');
  assert.match(source, /submittedVia: 'fetch'/);
  assert.match(source, /smsConsentVersion: SMS_CONSENT\.version/);
});

test('React AI page renders required image assets and stable plan anchors', () => {
  const sections = read('src/ai/AiSections.jsx');
  assert.match(sections, /ResponsiveImage image=\{aiImage\(ILLUSTRATION_SLOTS.hero.image\)\} sizes=\{IMAGE_SIZES.aiHero\} eager/);
  // The H1's em-based max width keeps its line breaks identical in the fallback font and Archivo (no font-swap CLS).
  assert.match(sections, /<h1 className="mt-5 max-w-\[9\.2em\] /);
  assert.match(sections, /id=\{plan\.anchor\}/);
  assert.deepEqual(PLANS.map((plan) => plan.anchor), ['plan-ai-foundation', 'plan-ai-authority', 'plan-market-leader']);
  assert.match(sections, /id="plans"/);
  assert.match(sections, /id=\{RESULTS_CREDIT\.anchor\}/);
});

test('AI and Team JSX sources contain no em dash or en dash characters', () => {
  for (const file of [
    'src/ai/AiSections.jsx',
    'src/ai/AiVisibilityApp.jsx',
    'src/team/TeamApp.jsx',
    'src/team/TeamSections.jsx',
  ]) {
    assert.doesNotMatch(read(file), /[—–]/, file);
  }
});

test('Team copy avoids denial then reveal sentence cadence', () => {
  const cadence = /\b(?:not|isn['’]t|wasn['’]t)\b[^.!?]{0,160}[.!?]\s+(?:It|That|This)(?:['’]s|\s+is)?\b/i;
  for (const file of [
    'src/team/TeamApp.jsx',
    'src/team/TeamSections.jsx',
    'shared/team-content.js',
  ]) {
    assert.doesNotMatch(read(file), cadence, file);
  }
});

test('Team keeps four headline variants and uses each real screenshot once', () => {
  const content = read('shared/team-content.js');
  const app = read('src/team/TeamApp.jsx');
  const sections = read('src/team/TeamSections.jsx');
  for (const variant of ['a', 'b', 'c', 'd']) assert.ok(content.includes(`  ${variant}: [`));
  assert.match(app, /HEADLINE_SEGMENTS\[variant\]/);
  for (const slot of ['hero', 'access', 'dashboard', 'autopilot']) {
    assert.equal(sections.split(`image={TEAM_IMAGES.${slot}}`).length - 1, 1);
  }
});
