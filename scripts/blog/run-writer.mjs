import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { env as processEnv } from 'node:process';
import { fileURLToPath } from 'node:url';

const DEFAULT_MODEL = 'claude-opus-5-5[1m]';
const DEFAULT_FALLBACK_MODEL = 'claude-opus-5-5';
const DEFAULT_EFFORT = 'max';
const DEFAULT_MAX_TURNS = '80';
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

export function classifyWriterError(text) {
  const value = String(text || '');
  if (/usage limit|rate limit|limit reached|429|quota/i.test(value)) return 'usage_limit';
  if (/401|unauthori[sz]ed|invalid.*token|expired.*token|oauth|authentication/i.test(value)) return 'auth';
  if (/model.*(not (found|available|supported))|context.*(1m|window).*(not|unavailable)|extra usage|usage credits/i.test(value)) {
    return 'model_unavailable';
  }
  return 'other';
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

  const execute = (selectedModel) => {
    const args = buildClaudeArgs({
      model: selectedModel, effort, maxTurns, taskText, rulesPath, settingsPath,
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
    selectedModel = fallbackModel;
    attempt = await execute(selectedModel);
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
    errorKind: ok ? null : classifyWriterError(`${attempt.stderr}\n${attempt.stdout}`),
    resultPath,
  };
}

function cliValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

async function main() {
  const args = process.argv.slice(2);
  const contextDir = cliValue(args, '--context');
  const out = cliValue(args, '--out');
  const resultPath = resolve(contextDir || '.blog-context', 'result.json');
  let result;
  try {
    result = await runWriter({ contextDir: contextDir || '.blog-context' });
  } catch {
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
  process.exitCode = 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch {
    process.exitCode = 0;
  }
}
