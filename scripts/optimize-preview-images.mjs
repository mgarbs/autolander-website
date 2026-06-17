// Downscale + convert generated preview imagery (public/preview/*.png|jpg) to
// web-sized .webp. Source files are large (multi-MB) AI renders; we ship only
// the optimized .webp. Run: node scripts/optimize-preview-images.mjs
import sharp from 'sharp';
import { readdir, rm } from 'node:fs/promises';
import { join, parse } from 'node:path';

const dir = 'public/preview';
const MAX_WIDTH = 1100;
const QUALITY = 80;

const files = (await readdir(dir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (files.length === 0) {
  console.log('No source images in public/preview/.');
  process.exit(0);
}

for (const file of files) {
  const { name } = parse(file);
  const input = join(dir, file);
  const output = join(dir, `${name}.webp`);
  const info = await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);
  console.log(`${file} -> ${name}.webp  ${(info.size / 1024).toFixed(0)}KB (${info.width}x${info.height})`);
  await rm(input); // drop the heavy source so it never ships
}
