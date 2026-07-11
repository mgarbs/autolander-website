import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const host = 'autolander.ai';
const key = '6bf0e211a89e4c20b34a1984a31f76d0';
const keyLocation = `https://${host}/${key}.txt`;
const sitemap = readFileSync(join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());

if (!urlList.length) throw new Error('No URLs were found in public/sitemap.xml.');
if (urlList.some((url) => new URL(url).host !== host)) {
  throw new Error(`Every IndexNow URL must belong to ${host}.`);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (!response.ok && response.status !== 202) {
  const body = await response.text();
  throw new Error(`IndexNow rejected the submission (${response.status}): ${body.slice(0, 500)}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs (${response.status}).`);
