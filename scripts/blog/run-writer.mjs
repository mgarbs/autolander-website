import { spawn } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { env as processEnv } from 'node:process';
import { fileURLToPath } from 'node:url';

import { cleanWriterBlogChanges } from './finalize-draft.mjs';

const DEFAULT_MODEL = 'claude-opus-5-5[1m]';
const DEFAULT_FALLBACK_MODEL = 'claude-opus-5-5';
const DEFAULT_EFFORT = 'max';
const DEFAULT_MAX_TURNS = '80';
const FALLBACK_CONTEXT_BLOCK = [
  '## 200K fallback context mode',
  '',
  'This final block is pipeline-authored and overrides only step 2 of the required reading in `.blog-context/rules.md`.',
  'The active model has a 200K context window.',
  'Read `.blog-context/site-index.md` completely before selecting source pages.',
  'Never read `.blog-context/site-full.md` as a whole.',
  'Use the site index to choose every page directly relevant to the assigned topic and every internal page you plan to link.',
  'For each selected page, remove any query or fragment from its canonical URL for lookup. Treat `/#pricing` as the homepage URL.',
  'Use Grep to locate each selected page\'s exact `URL:` header in `.blog-context/site-full.md`, matching the canonical URL value. Grep snippets alone are insufficient.',
  'Use Read with offset and limit to include the heading immediately before that URL header and the page\'s complete section. Continue in chunks until the next `URL:` header or the end of the file.',
  'Before final validation, confirm that you read the complete section for every internal page linked by the post.',
  'This bounded-read requirement applies to every page you link.',
].join('\n');
const ALLOWED_TOOLS = [
  'Read',
  'Glob',
  'Grep',
  'Edit(scripts/seo/articles/blog/**)',
  'Bash(node scripts/blog/validate-post.mjs *)',
].join(',');

export function buildClaudeArgs({
  model, effort, maxTurns, taskText, rulesPath, settingsPath,
}) {
  return [
    '-p', taskText,
    '--model', model,
    '--effort', effort,
    '--max-turns', String(maxTurns),
    '--output-format', 'json',
    '--permission-mode', 'dontAsk',
    '--append-system-prompt-file', rulesPath,
    '--settings', settingsPath,
    '--allowedTools', ALLOWED_TOOLS,
    '--disallowedTools', 'WebFetch,WebSearch',
  ];
}

// `oneMillion` is true while classifying the [1m] attempt: there, "extra usage" / "usage credits"
// and context-length errors mean the 1M window is unavailable and the 200K fallback should run.
// On the fallback model the same subscription wording is an ordinary usage limit.
export function classifyWriterError(text, { oneMillion = true } = {}) {
  const value = String(text || '');
  if (oneMillion && /context (length|window)|prompt is too long|extra usage|usage credits|1m context/i.test(value)) {
    return 'model_unavailable';
  }
  if (/model.*(not (found|available|supported))|context.*(1m|window).*(not|unavailable)/i.test(value)) {
    return 'model_unavailable';
  }
  if (/usage limit|rate limit|limit reached|429|quota/i.test(value)) return 'usage_limit';
  if (/401|unauthori[sz]ed|invalid.*token|expired.*token|oauth|authentication/i.test(value)) return 'auth';
  return 'other';
}

function fallbackTaskText(taskText) {
  return `${taskText.trimEnd()}\n\n${FALLBACK_CONTEXT_BLOCK}\n`;
}

function invoke(command, args, options) {
  return new Promise((finish) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const complete = (result) => {
      if (settled) return;
      settled = true;
      finish({ stdout, stderr, ...result });
    };

    let child;
    try {
      child = spawn(command, args, {
        ...options,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      complete({ exitCode: 1, stderr: error instanceof Error ? error.message : String(error) });
      return;
    }

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', (error) => {
      stderr += `${stderr ? '\n' : ''}${error instanceof Error ? error.message : String(error)}`;
      complete({ exitCode: 1 });
    });
    child.once('close', (code) => complete({ exitCode: Number.isInteger(code) ? code : 1 }));
  });
}

const contextWindowFor = (model) => model.endsWith('[1m]') ? '1m' : '200k';

export async function runWriter({ claudeCmd = ['claude'], env = processEnv, contextDir }) {
  const absoluteContextDir = resolve(contextDir);
  const workingDirectory = dirname(absoluteContextDir);
  const taskText = readFileSync(resolve(absoluteContextDir, 'task.md'), 'utf8');
  const rulesFile = resolve(absoluteContextDir, 'rules.md');
  const rulesPath = relative(workingDirectory, rulesFile).replaceAll('\\', '/');
  const settingsFile = resolve(absoluteContextDir, 'settings.json');
  const settingsPath = relative(workingDirectory, settingsFile).replaceAll('\\', '/');
  const resultPath = resolve(absoluteContextDir, 'result.json');
  const stderrPath = resolve(absoluteContextDir, 'writer.stderr');
  const model = env.BLOG_MODEL || DEFAULT_MODEL;
  const fallbackModel = env.BLOG_MODEL_FALLBACK || DEFAULT_FALLBACK_MODEL;
  const effort = env.BLOG_EFFORT || DEFAULT_EFFORT;
  const maxTurns = env.BLOG_MAX_TURNS || DEFAULT_MAX_TURNS;
  const childEnv = { ...env, CLAUDE_CODE_EFFORT_LEVEL: effort };
  delete childEnv.ANTHROPIC_API_KEY;
  delete childEnv.ANTHROPIC_AUTH_TOKEN;

  mkdirSync(absoluteContextDir, { recursive: true });

  const execute = (selectedModel, selectedTaskText = taskText) => {
    const args = buildClaudeArgs({
      model: selectedModel, effort, maxTurns, taskText: selectedTaskText, rulesPath, settingsPath,
    });
    return invoke(claudeCmd[0], [...claudeCmd.slice(1), ...args], {
      cwd: workingDirectory,
      env: childEnv,
    });
  };

  let selectedModel = model;
  let attempt = await execute(selectedModel);
  const firstErrorKind = classifyWriterError(`${attempt.stderr}\n${attempt.stdout}`);
  let capturedStderr = attempt.stderr;

  if (attempt.exitCode !== 0 && firstErrorKind === 'model_unavailable' && model.endsWith('[1m]')) {
    // The failed 1M attempt may have left a half-written post; the fallback must start clean or
    // finalize sees two new files and records no_output.
    try {
      cleanWriterBlogChanges(workingDirectory);
    } catch { /* not a git checkout (hermetic tests) or nothing to clean */ }
    selectedModel = fallbackModel;
    attempt = await execute(selectedModel, fallbackTaskText(taskText));
    capturedStderr = [capturedStderr, attempt.stderr].filter(Boolean).join('\n');
  }

  writeFileSync(resultPath, attempt.stdout, 'utf8');
  writeFileSync(stderrPath, capturedStderr, 'utf8');

  const ok = attempt.exitCode === 0;
  return {
    ok,
    exitCode: attempt.exitCode,
    model: selectedModel,
    contextWindow: contextWindowFor(selectedModel),
    errorKind: ok ? null : classifyWriterError(`${attempt.stderr}\n${attempt.stdout}`, {
      oneMillion: selectedModel.endsWith('[1m]'),
    }),
    resultPath,
  };
}

function cliValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

// Log-safe evidence for a failed writer run (the public Actions log is the only place it can
// surface). stderr stays private on disk; only a short head is logged, after masking every request
// value (prompt, keyword, feedback, original prompt), anything token-shaped, and ANSI codes.
const SECRET_SHAPED = /sk-ant-[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9]{10,}|github_pat_[A-Za-z0-9_]+|(authorization|bearer)\s*[:=]?\s*\S+/gi;
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

function readRequestValues(contextDir) {
  try {
    const request = JSON.parse(readFileSync(resolve(contextDir, 'request.json'), 'utf8'));
    return [request.prompt, request.keyword, request.feedback, request.originalPrompt]
      .filter((value) => typeof value === 'string' && value.trim().length >= 3)
      .flatMap((value) => [value, ...value.split(/\r?\n/)])
      .map((value) => value.trim())
      .filter((value) => value.length >= 3)
      .sort((a, b) => b.length - a.length);
  } catch {
    return [];
  }
}

export function writerDiagnostics(result, { contextDir, error } = {}) {
  const lines = [
    `writer: ok=${result.ok} exit=${result.exitCode} model=${result.model} context=${result.contextWindow} errorKind=${result.errorKind}`,
  ];
  if (result.ok) return lines;
  const mask = (text) => {
    let value = String(text || '').replace(ANSI, '');
    for (const secret of readRequestValues(contextDir)) value = value.split(secret).join('[request]');
    return value.replace(SECRET_SHAPED, '[redacted]');
  };
  try {
    if (result.resultPath && existsSync(result.resultPath)) {
      const parsed = JSON.parse(readFileSync(result.resultPath, 'utf8'));
      lines.push(`writer result: subtype=${mask(parsed?.subtype)} is_error=${parsed?.is_error} turns=${parsed?.num_turns ?? '-'}`);
    }
  } catch { lines.push('writer result: not JSON'); }
  try {
    const stderr = readFileSync(resolve(contextDir, 'writer.stderr'), 'utf8');
    const head = mask(stderr).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 8).join(' | ');
    if (head) lines.push(`writer stderr (masked head): ${head.slice(0, 600)}`);
  } catch { /* no stderr file */ }
  if (error) lines.push(`writer exception: ${mask(error?.message || error).slice(0, 300)}`);
  return lines;
}

async function main() {
  const args = process.argv.slice(2);
  const contextDir = cliValue(args, '--context');
  const out = cliValue(args, '--out');
  const resultPath = resolve(contextDir || '.blog-context', 'result.json');
  let result;
  let failure;
  try {
    result = await runWriter({ contextDir: contextDir || '.blog-context' });
  } catch (error) {
    failure = error;
    result = {
      ok: false,
      exitCode: 1,
      model: processEnv.BLOG_MODEL || DEFAULT_MODEL,
      contextWindow: contextWindowFor(processEnv.BLOG_MODEL || DEFAULT_MODEL),
      errorKind: 'other',
      resultPath,
    };
  }

  if (out) {
    const outPath = resolve(out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }
  try {
    for (const line of writerDiagnostics(result, { contextDir: contextDir || '.blog-context', error: failure })) {
      console.log(line);
    }
  } catch { /* diagnostics are best-effort */ }
  process.exitCode = 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch {
    process.exitCode = 0;
  }
}
