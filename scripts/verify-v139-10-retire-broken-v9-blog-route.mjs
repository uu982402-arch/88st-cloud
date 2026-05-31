import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const brokenNeedles = [
  'minigame-streak-exclusion-guide.html',
  'minigame-losing-streak-event-exclusion-condition-guide.html',
  'minigame-losing-streak-event-exclusion-condition-first.html',
  '미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유'
];
const oldWorkerNeedles = [
  'V139_9_INLINE_BLOG_HTML',
  'V139_8_ROUTE_REDIRECTS',
  'V139_7_DIRECT_BLOG',
  'V139_4_STALE_BLOG_ROUTE_REDIRECTS',
  'v1394StaleRouteRedirect'
];
const errors = [];
function read(file) { return readFileSync(file, 'utf8'); }
function walk(dir, out = []) {
  for (const item of readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = join(dir, item);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

if (!existsSync('blog/index.html')) errors.push('blog/index.html missing');
else {
  const blog = read('blog/index.html');
  for (const needle of brokenNeedles) if (blog.includes(needle)) errors.push(`blog/index.html still exposes retired V9 content: ${needle}`);
}

for (const file of ['sitemap.xml', 'sitemap.txt', 'serverless/sitemap.xml', 'serverless/sitemap.txt']) {
  if (!existsSync(file)) continue;
  const text = read(file);
  for (const needle of brokenNeedles.slice(0, 3)) if (text.includes(needle)) errors.push(`${file} still indexes retired V9 route: ${needle}`);
}

if (!existsSync('_redirects')) errors.push('_redirects missing');
else {
  const r = read('_redirects');
  const required = [
    '/blog/minigame-streak-exclusion-guide.html /blog/ 302',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html /blog/ 302',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html /blog/ 302'
  ];
  for (const line of required) if (!r.includes(line)) errors.push(`_redirects missing retired route fallback: ${line}`);
}

if (!existsSync('_worker.js')) errors.push('_worker.js missing');
else {
  const worker = read('_worker.js');
  for (const needle of oldWorkerNeedles) if (worker.includes(needle)) errors.push(`_worker.js contains old unsafe symbol: ${needle}`);
  if (!worker.includes('V139_10_RETIRED_BLOG_ROUTES')) errors.push('_worker.js missing V139_10_RETIRED_BLOG_ROUTES');
  const check = spawnSync(process.execPath, ['--check', '_worker.js'], { encoding: 'utf8' });
  if (check.status !== 0) errors.push(`_worker.js syntax check failed: ${check.stderr || check.stdout}`);
}

const htmlFiles = walk('.').filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const text = read(file);
  if (text.includes('href="#"')) errors.push(`${file} still contains href="#"`);
}

const forbiddenRoutes = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
for (const route of forbiddenRoutes) {
  if (existsSync(route)) errors.push(`forbidden route directory exists: ${route}`);
}
for (const file of ['sitemap.xml', 'sitemap.txt', 'serverless/sitemap.xml', 'serverless/sitemap.txt'].filter(existsSync)) {
  const text = read(file);
  for (const route of forbiddenRoutes) if (text.includes(`/${route}`)) errors.push(`${file} contains forbidden route: ${route}`);
}

if (errors.length) {
  console.error('[V139.10 VERIFY FAIL]\n' + errors.map(e => '- ' + e).join('\n'));
  process.exit(1);
}
console.log('[V139.10 VERIFY PASS] retired broken V9 route removed from visible/indexable surfaces and worker is safe');
