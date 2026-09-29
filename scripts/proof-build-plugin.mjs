import { PROOF, PROOF_ENTRIES } from '../shared/ai-visibility-proof.js';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LOCAL_PROOF = fileURLToPath(new URL('../shared/ai-visibility-proof.local.js', import.meta.url));

export function mergeProofEntries(committed, local) {
  const entries = new Map(local.map((entry) => [entry.id, entry]));
  for (const entry of committed) if (entry.verified === true) entries.set(entry.id, entry);
  return [...entries.values()];
}

// A query parameter is not a publication boundary. Strip unverified data before bundling,
// including source maps. Unpublished proof is reviewed in local Vite dev and in the
// `vite build --mode preview` output, which deploys only to the noindex, nofollow
// autolander-preview Cloudflare Pages project (docs/superpowers/preview-deploy.md), never to autolander.ai.
export function proofModuleSource({ development = false, entries = PROOF_ENTRIES } = {}) {
  const allowed = development ? entries : entries.filter((entry) => entry.verified === true);
  return `export const PROOF = ${JSON.stringify(allowed.length ? PROOF : null)};
export const PROOF_ENTRIES = ${JSON.stringify(allowed)};
export const publicProofEntries = () => PROOF_ENTRIES.filter((entry) => entry.verified === true);
export const proofEntriesFor = ({ preview = false } = {}) => preview ? PROOF_ENTRIES : publicProofEntries();`;
}

export function includesUnverifiedProof(config) {
  return config.command === 'serve' || (config.command === 'build' && config.mode === 'preview');
}

export function proofBuildPlugin({ localFile = LOCAL_PROOF, entries = PROOF_ENTRIES } = {}) {
  let development = false;
  return {
    name: 'al-proof-publication-gate',
    configResolved(config) { development = includesUnverifiedProof(config); },
    resolveId(id) { if (id === 'virtual:ai-visibility-proof') return '\0ai-visibility-proof'; },
    async load(id) {
      if (id !== '\0ai-visibility-proof') return;
      let merged = entries;
      // Do not stat, read or import the local drafts in a production Vite build.
      if (development && existsSync(localFile)) {
        this.addWatchFile(localFile);
        const url = pathToFileURL(localFile);
        url.searchParams.set('mtime', String(statSync(localFile).mtimeMs));
        const local = await import(url.href);
        merged = mergeProofEntries(entries, local.PROOF_ENTRIES);
      }
      return proofModuleSource({ development, entries: merged });
    },
  };
}
