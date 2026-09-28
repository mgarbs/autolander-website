import {
  existsSync, readFileSync, readdirSync,
} from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const studioPair = (name) => Object.freeze({
  before: `/studio/${name}-before.webp`,
  after: `/studio/${name}-after.webp`,
});

// Page data imports these paths, and PAGE_STUDIO_USAGES below feeds the same paths to
// the blog image ledger. Keep non-article studio usage here so rendered pages and the
// no-repeat validator cannot drift apart.
export const STUDIO_IMAGES = Object.freeze({
  bmwX5: studioPair('bmw-x5'),
  chevroletMalibu: studioPair('chevrolet-malibu'),
  chevroletTrax: studioPair('chevrolet-trax'),
  dodgeChallenger: studioPair('dodge-challenger'),
  fordExpedition: studioPair('ford-expedition'),
  fordF150: studioPair('ford-f-150'),
  fordMaverick: studioPair('ford-maverick'),
  genesisGv70: studioPair('genesis-gv70'),
  hyundaiSonata: studioPair('hyundai-sonata'),
  infinitiQx60: studioPair('infiniti-qx60'),
  jeepGladiator: studioPair('jeep-gladiator'),
  jeepRenegade: studioPair('jeep-renegade'),
  jeepWagoneer: studioPair('jeep-wagoneer'),
  jeepWrangler: studioPair('jeep-wrangler'),
  kiaK5: studioPair('kia-k5'),
  nissanKicks: studioPair('nissan-kicks'),
  ram1500: studioPair('ram-1500'),
  ram1500Laramie: studioPair('ram-1500-laramie'),
  teslaModelY: studioPair('tesla-model-y'),
  toyotaTacoma: studioPair('toyota-tacoma'),
  toyotaTundra: studioPair('toyota-tundra'),
  coachmenCatalina: Object.freeze({ src: '/studio/coachmen-catalina-studio.webp' }),
});

const paths = (...values) => values.flatMap((value) => Object.values(value));

export const PAGE_STUDIO_USAGES = Object.freeze([
  { slug: 'home', paths: paths(STUDIO_IMAGES.chevroletMalibu) },
  { slug: 'facebook-ai-tools', paths: paths(STUDIO_IMAGES.jeepWrangler) },
  { slug: 'facebook-marketplace-assistant', paths: paths(STUDIO_IMAGES.hyundaiSonata) },
  { slug: 'facebook-marketplace-automation', paths: paths(STUDIO_IMAGES.fordMaverick) },
  { slug: 'facebook-autoposter', paths: paths(STUDIO_IMAGES.nissanKicks) },
  { slug: 'bulk-post-cars-to-facebook-marketplace', paths: paths(STUDIO_IMAGES.toyotaTacoma) },
  { slug: 'facebook-marketplace-auto-poster', paths: paths(STUDIO_IMAGES.teslaModelY) },
  { slug: 'facebook-marketplace-for-car-dealers', paths: paths(STUDIO_IMAGES.jeepWagoneer) },
  { slug: 'facebook-listing-software', paths: paths(STUDIO_IMAGES.ram1500) },
  {
    slug: 'ai-car-photo-editor',
    paths: paths(
      STUDIO_IMAGES.infinitiQx60,
      STUDIO_IMAGES.genesisGv70,
      STUDIO_IMAGES.jeepRenegade,
      { src: STUDIO_IMAGES.toyotaTundra.after },
    ),
  },
  { slug: 'rv-dealer-software', paths: paths(STUDIO_IMAGES.coachmenCatalina) },
  { slug: 'car-dealership-marketing', paths: paths(STUDIO_IMAGES.jeepWagoneer) },
  { slug: 'car-dealership-marketing-ideas', paths: paths(STUDIO_IMAGES.fordMaverick) },
  { slug: 'social-media-for-car-dealers', paths: paths(STUDIO_IMAGES.chevroletMalibu) },
  { slug: 'how-to-sell-more-cars', paths: paths(STUDIO_IMAGES.hyundaiSonata) },
  { slug: 'ai-for-car-dealerships', paths: paths(STUDIO_IMAGES.fordExpedition) },
  { slug: 'integrations', paths: paths(STUDIO_IMAGES.fordMaverick) },
  { slug: 'cargurus-facebook-marketplace', paths: paths(STUDIO_IMAGES.hyundaiSonata) },
  { slug: 'cars-com-facebook-marketplace', paths: paths(STUDIO_IMAGES.nissanKicks) },
  { slug: 'vauto-facebook-marketplace', paths: paths(STUDIO_IMAGES.jeepWrangler) },
  { slug: 'dealercenter-facebook-marketplace', paths: paths(STUDIO_IMAGES.teslaModelY) },
  { slug: 'dealer-com-facebook-marketplace', paths: paths(STUDIO_IMAGES.fordExpedition) },
  { slug: 'homenet-facebook-marketplace', paths: paths(STUDIO_IMAGES.toyotaTacoma) },
  { slug: 'frazer-facebook-marketplace', paths: paths(STUDIO_IMAGES.chevroletMalibu) },
  { slug: 'cdk-facebook-marketplace', paths: paths(STUDIO_IMAGES.jeepRenegade) },
  { slug: 'tekion-facebook-marketplace', paths: paths(STUDIO_IMAGES.kiaK5) },
  { slug: 'facebook-marketplace-inventory-sync', paths: paths(STUDIO_IMAGES.fordExpedition) },
  { slug: 'facebook-marketplace-listing-software', paths: paths(STUDIO_IMAGES.kiaK5) },
  { slug: 'facebook-marketplace-auto-poster-pricing', paths: paths(STUDIO_IMAGES.chevroletMalibu) },
  { slug: 'safest-facebook-marketplace-auto-poster', paths: paths(STUDIO_IMAGES.jeepRenegade) },
]);

export function normalizeStudioPath(value) {
  if (typeof value !== 'string') return '';
  const path = value.trim().replace(/[?#].*$/, '');
  if (!path.startsWith('/studio/')) return '';
  return path.replace(/-550(?=\.[a-z0-9]+$)/i, '');
}

function ownerFor(value, fallback = 'unknown') {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return fallback;
  if (value.slug) return String(value.slug);
  if (value.key) return String(value.key);
  if (value.path) {
    const parts = String(value.path).split('/').filter(Boolean);
    return parts.at(-1) || 'home';
  }
  return fallback;
}

function sectionPaths(value) {
  const found = [];
  for (const section of value?.sections || []) {
    if (section?.type === 'figure') found.push(section.before, section.after);
    if (section?.type === 'image') found.push(section.src);
  }
  return found;
}

function addUsage(ledger, path, owner) {
  const normalized = normalizeStudioPath(path);
  if (!normalized) return;
  const owners = ledger.get(normalized) || [];
  if (!owners.includes(owner)) owners.push(owner);
  ledger.set(normalized, owners);
}

function addExtraUsages(ledger, extraUsages) {
  if (extraUsages instanceof Map) {
    for (const [path, owners] of extraUsages) {
      for (const owner of Array.isArray(owners) ? owners : [owners]) addUsage(ledger, path, String(owner));
    }
    return;
  }
  if (!Array.isArray(extraUsages)) return;
  for (const [index, usage] of extraUsages.entries()) {
    const owner = ownerFor(usage, `page-${index + 1}`);
    const usagePaths = usage?.paths || (usage?.path ? [usage.path] : sectionPaths(usage));
    for (const path of usagePaths || []) addUsage(ledger, path, owner);
  }
}

export function imageUsage({ articles = [], extraUsages = [] } = {}) {
  const ledger = new Map();
  for (const [index, article] of articles.entries()) {
    const owner = ownerFor(article, `article-${index + 1}`);
    for (const path of sectionPaths(article)) addUsage(ledger, path, owner);
  }
  addExtraUsages(ledger, extraUsages);
  return ledger;
}

export function studioFilesAt(root) {
  const studioDir = resolve(root, 'public', 'studio');
  const files = new Set();
  if (!existsSync(studioDir)) return files;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) {
        const webPath = relative(studioDir, file).split(sep).join('/');
        files.add(`/studio/${webPath}`);
      }
    }
  };
  visit(studioDir);
  return files;
}

const completePair = (pair, files) => [
  pair.before, pair.after, pair.before550, pair.after550,
].every((path) => typeof path === 'string' && files.has(path));

export function studioPairsAt(root, { studioFiles = studioFilesAt(root) } = {}) {
  const libraryPath = resolve(root, 'public', 'studio', 'library.json');
  let library = [];
  if (existsSync(libraryPath)) {
    try {
      const parsed = JSON.parse(readFileSync(libraryPath, 'utf8'));
      if (Array.isArray(parsed)) library = parsed;
    } catch {
      library = [];
    }
  }
  const libraryPairs = library
    .map((entry) => ({ ...entry, source: 'library' }))
    .filter((entry) => completePair(entry, studioFiles));

  const legacyPairs = [];
  for (const before of [...studioFiles].sort()) {
    if (before.startsWith('/studio/library/') || before.includes('-550.')) continue;
    const match = before.match(/^\/studio\/(.+)-before\.webp$/i);
    if (!match) continue;
    const stem = match[1];
    const pair = {
      key: stem,
      before,
      after: `/studio/${stem}-after.webp`,
      before550: `/studio/${stem}-before-550.webp`,
      after550: `/studio/${stem}-after-550.webp`,
      source: 'legacy',
    };
    if (completePair(pair, studioFiles)) legacyPairs.push(pair);
  }
  return [...libraryPairs, ...legacyPairs];
}

export function unusedStudioPairs({ pairs = [], usage = new Map(), selfSlug = '' } = {}) {
  return pairs.filter((pair) => [pair.before, pair.after].every((path) => {
    const owners = usage.get(normalizeStudioPath(path)) || [];
    return owners.every((owner) => owner === selfSlug);
  }));
}
