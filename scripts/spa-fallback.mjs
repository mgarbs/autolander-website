import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const fallbackPath = join(distDir, '404.html');
const adminDir = join(distDir, 'admin');
const adminIndexPath = join(adminDir, 'index.html');

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run this after vite build.');
}

copyFileSync(indexPath, fallbackPath);
mkdirSync(adminDir, { recursive: true });
copyFileSync(indexPath, adminIndexPath);
