import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const postsPath = path.join(root, 'assets', 'data', 'posts.index.v1.20260318.json');
const outPath = path.join(root, 'assets', 'data', 'generated.routes.v1.20260330.json');

const payload = JSON.parse(await fs.readFile(postsPath, 'utf8'));
const routes = [...new Set((payload.posts || []).map((item) => item.path).concat(['/muktu-police/review/', '/muktu-police/logs/', '/muktu-police/faq/']))].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
await fs.writeFile(outPath, JSON.stringify({ updated: '2026-03-30', routes }, null, 2), 'utf8');
console.log(`Community route manifest refreshed for ${routes.length} routes.`);
