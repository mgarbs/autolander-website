// Node 20, no dependencies. Default: GET + diff only. --apply is an operator action.
// Git Bash operators should set MSYS_NO_PATHCONV=1; API paths are built here.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const TID = 'G-30H80LZMCH';
const clone = (value) => JSON.parse(JSON.stringify(value));
const gaTools = (config) => Object.entries(config.tools || {}).filter(([, tool]) => tool.settings?.tid === TID);
const refs = (value, visit) => {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (['firingTriggers', 'blockingTriggers'].includes(key)) visit(value, key, item);
    else refs(item, visit);
  }
};

export function validateConfig(live, desired, merged, { allowSecretRoundtrip = false } = {}) {
  for (const section of ['triggers', 'variables', 'tools']) {
    for (const id of Object.keys(desired[section] || {})) {
      if (!id.startsWith('al')) throw new Error(`Desired ${section} ids must start with al`);
    }
  }
  if (gaTools(merged).length > 1) throw new Error('Duplicate GA4 measurement ID');
  if (Object.values(merged.tools || {}).some((tool) => /facebook/i.test(tool.component || ''))) throw new Error('Facebook tools are forbidden');
  if (Object.values(desired.variables || {}).some((v) => v.type === 'secret')) throw new Error('Desired secret variables are forbidden');
  if (!allowSecretRoundtrip && Object.values(live.variables || {}).some((v) => v.type === 'secret')) throw new Error('Live secret variables require --allow-secret-roundtrip');
  refs(merged, (_parent, _key, ids) => {
    if (!Array.isArray(ids) || ids.some((id) => !Object.hasOwn(merged.triggers || {}, id))) throw new Error('Unknown trigger reference');
  });
  const blockIds = ['alBlockHost', 'alBlockPath'].map((id) => {
    const name = desired.triggers?.[id]?.name || (id === 'alBlockHost' ? 'AL block: non-production host' : 'AL block: untracked paths');
    return Object.keys(merged.triggers || {}).find((key) => merged.triggers[key].name === name) || id;
  });
  for (const tool of Object.values(merged.tools || {})) {
    if ((tool.permissions || []).some((p) => ['client_network_requests', 'execute_unsafe_scripts'].includes(p))) throw new Error('Browser network/script permission is forbidden');
    if (tool.enabled && merged.settings?.autoInjectScript !== false) throw new Error('Enabled tools require autoInjectScript=false');
    if (tool.component === 'google-analytics_v4') {
      for (const action of Object.values(tool.actions || {})) {
        if (blockIds.some((id) => !action.blockingTriggers?.includes(id))) throw new Error('GA4 action is missing host/path blocking triggers');
      }
    }
  }
}

export function mergeZarazConfig(live, desired, options = {}) {
  const merged = clone(live);
  merged.settings = { ...merged.settings, ...desired.settings };
  for (const key of ['dataLayer', 'historyChange']) if (Object.hasOwn(desired, key)) merged[key] = desired[key];
  const triggerIds = {};
  merged.triggers = merged.triggers || {};
  for (const [id, trigger] of Object.entries(desired.triggers || {})) {
    // Dashboard-generated ids can be adopted by our stable AL names.
    if (!id.startsWith('al') || !/^AL (block|event): /.test(trigger.name || '')) throw new Error('Managed triggers require al ids and AL names');
    const target = Object.keys(merged.triggers).find((key) => merged.triggers[key].name === trigger.name) || id;
    if (['Pageview', 'AllTracks'].includes(target)) throw new Error('Cannot replace built-in triggers');
    triggerIds[id] = target;
    merged.triggers[target] = clone(trigger);
  }
  merged.variables = { ...merged.variables, ...clone(desired.variables || {}) };
  merged.tools = merged.tools || {};
  for (const [id, tool] of Object.entries(desired.tools || {})) {
    const target = tool.component === 'google-analytics_v4' && tool.settings?.tid === TID
      ? gaTools(live).find(([, t]) => t.component === 'google-analytics_v4')?.[0] || id : id;
    const previous = merged.tools[target] || {};
    const managedFields = ['settings', 'defaultFields', 'blockingTriggers', 'actions', 'enabled', 'permissions'];
    const next = merged.tools[target]
      ? { ...previous, ...Object.fromEntries(managedFields.filter((key) => Object.hasOwn(tool, key)).map((key) => [key, clone(tool[key])])) }
      : clone(tool);
    if (previous.permissions && tool.permissions.every((p) => previous.permissions.includes(p))) next.permissions = [...previous.permissions];
    refs(next, (parent, key, ids) => { parent[key] = ids.map((ref) => triggerIds[ref] || ref); });
    merged.tools[target] = next;
  }
  validateConfig(live, desired, merged, options);
  return merged;
}

export function redactConfig(value) {
  if (Array.isArray(value)) return value.map(redactConfig);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    key === 'debugKey' || (key === 'value' && value.type === 'secret') ? '[REDACTED]' : redactConfig(item)]));
}

export function diffConfig(before, after) {
  const changes = [];
  function walk(a, b, path) {
    if (isDeepStrictEqual(a, b)) return;
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      for (const key of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
        if (key !== 'debugKey') walk(a[key], b[key], path ? `${path}.${key}` : key);
      }
    } else changes.push(`${path}: ${JSON.stringify(redactConfig(a)) ?? 'undefined'} → ${JSON.stringify(redactConfig(b)) ?? 'undefined'}`);
  }
  walk(redactConfig(before), redactConfig(after), '');
  return changes;
}

function parseArgs(args) {
  const opts = { apply: false, desired: 'scripts/zaraz/zaraz-config.json' };
  const modes = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--apply' || arg === '--dry-run') { modes.add(arg); opts.apply = arg === '--apply'; }
    else if (arg === '--disable-ga4' || arg === '--enable-ga4') {
      if (opts.enabled !== undefined) throw new Error('Choose only one GA4 switch');
      opts.enabled = arg === '--enable-ga4';
    } else if (arg === '--show-live') opts.showLive = true;
    else if (arg === '--allow-secret-roundtrip') opts.allowSecretRoundtrip = true;
    else if (arg === '--desired' || arg === '--backup-dir') {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      opts[arg === '--desired' ? 'desired' : 'backupDir'] = value;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (modes.size > 1) throw new Error('Choose --dry-run or --apply');
  return opts;
}

export async function main(args = process.argv.slice(2), {
  fetchImpl = fetch, env = process.env, home = os.homedir(), log = console.log, error = console.error,
} = {}) {
  let token = '', debugKey = '';
  const safe = (value) => {
    let text = String(value);
    for (const secret of [token, debugKey]) if (secret) text = text.split(secret).join('[REDACTED]');
    return text;
  };
  try {
    const opts = parseArgs(args);
    let fileEnv = {};
    if (!env.CLOUDFLARE_ZARAZ_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
      const text = await readFile(join(home, '.autolander-cloudflare.env'), 'utf8');
      fileEnv = Object.fromEntries(text.split(/\r?\n/).filter((line) => line.includes('=') && !line.trim().startsWith('#'))
        .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]));
    }
    token = env.CLOUDFLARE_ZARAZ_API_TOKEN || fileEnv.CLOUDFLARE_ZARAZ_API_TOKEN;
    const zone = env.CLOUDFLARE_ZONE_ID || fileEnv.CLOUDFLARE_ZONE_ID;
    if (!token || !zone) throw new Error('Missing Cloudflare credentials in environment or home env file');
    const base = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zone)}/settings/zaraz`;
    async function api(path, method = 'GET', body) {
      const response = await fetchImpl(`${base}/${path}`, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (response.status === 403) throw new Error('Cloudflare 403: token needs Zone Zaraz Read/Edit on this zone');
      // Do not echo API bodies: an error may reflect credentials or the debug key.
      if (!response.ok) throw new Error(`Cloudflare ${method} failed (${response.status})`);
      const data = await response.json();
      if (data.success === false) throw new Error(`Cloudflare ${method} returned success=false`);
      return data.result;
    }
    const live = await api('config');
    debugKey = live.debugKey || '';
    const workflow = await api('workflow');
    if (opts.apply && (workflow?.value ?? workflow?.workflow ?? workflow) !== 'realtime') throw new Error('Apply requires realtime workflow; preview needs a separate publish');
    if (opts.showLive) log(safe(JSON.stringify(redactConfig(live), null, 2)));
    const desired = opts.enabled === undefined ? JSON.parse(await readFile(resolve(opts.desired), 'utf8')) : {};
    const merged = opts.enabled === undefined ? mergeZarazConfig(live, desired, opts) : clone(live);
    if (opts.enabled !== undefined) {
      const matches = gaTools(merged);
      if (matches.length !== 1) throw new Error('GA4 switch requires exactly one existing measurement tool');
      matches[0][1].enabled = opts.enabled;
      validateConfig(live, desired, merged, opts);
    }
    const diff = diffConfig(live, merged);
    for (const line of diff) log(safe(line));
    if (opts.apply) {
      const dir = resolve(opts.backupDir || join(home, '.autolander', 'zaraz-backups'));
      const inside = relative(resolve('.'), dir);
      if (!inside || (!inside.startsWith('..') && !isAbsolute(inside))) throw new Error('Backup directory must be outside the public repository');
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, `zaraz-live-${new Date().toISOString().replaceAll(':', '-')}.json`), JSON.stringify(live, null, 2), { mode: 0o600, flag: 'wx' });
      await api('config', 'PUT', merged);
      const verified = await api('config');
      const managed = opts.enabled === undefined ? mergeZarazConfig(verified, desired, opts) : clone(verified);
      if (opts.enabled !== undefined) {
        const target = gaTools(managed);
        if (target.length !== 1) throw new Error('Verification: GA4 tool missing or duplicated');
        target[0][1].enabled = opts.enabled;
      }
      if (diffConfig(verified, managed).length) throw new Error('Verification failed: managed values differ');
      log(safe(`zarazVersion ${verified.zarazVersion}`));
    }
    log(`${diff.length} changes`);
    return 0;
  } catch (err) { error(safe(err.message)); return 1; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main();
