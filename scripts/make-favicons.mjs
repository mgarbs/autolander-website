// Render the brand mark (public/favicon.svg) into every icon format browsers
// and search engines use: PNG favicons, apple-touch-icon, a 512 PWA icon, and
// a real favicon.ico (Google prefers .ico at /favicon.ico). Run:
//   node scripts/make-favicons.mjs
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');
const render = (size) => sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

const [png16, png32, png180, png512] = await Promise.all([render(16), render(32), render(180), render(512)]);

// Single-image .ico wrapping a 32x32 PNG (modern browsers read PNG-in-ICO).
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // image size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)
  return Buffer.concat([header, entry, png]);
}

await writeFile('public/favicon-16.png', png16);
await writeFile('public/favicon-32.png', png32);
await writeFile('public/apple-touch-icon.png', png180);
await writeFile('public/icon-512.png', png512);
await writeFile('public/favicon.ico', pngToIco(png32, 32));

console.log('Wrote favicon-16.png, favicon-32.png, apple-touch-icon.png, icon-512.png, favicon.ico');
