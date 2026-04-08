
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const out = path.join(rootDir, 'assets/data/generated.routes.v1.20260330.json');
const payload = {
  updated: '2026-03-30',
  routes: [
    '/', '/blog/', '/blog/safe-toto-site-selection/', '/blog/domain-ip-check-basics/', '/blog/google-muktu-search-guide/',
    '/tools/', '/muktu-police/', '/muktu-police/search/', '/muktu-police/check/', '/muktu-police/faq/', '/guaranteed/'
  ]
};
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Route manifest refreshed for ${payload.routes.length} routes.`);
