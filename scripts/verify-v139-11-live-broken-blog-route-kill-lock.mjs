import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const errors = [];
const retiredRoutes = [
  '/blog/minigame-streak-exclusion-guide.html',
  '/blog/minigame-streak-exclusion-guide',
  '/blog/minigame-streak-exclusion-guide/',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide/',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/'
];
const sitemapNeedles = [
  'minigame-streak-exclusion-guide',
  'minigame-losing-streak-event-exclusion-condition-guide',
  'minigame-losing-streak-event-exclusion-condition-first'
];
const oldUnsafeWorkerNeedles = [
  'V139_9_INLINE_BLOG_HTML',
  'V139_8_ROUTE_REDIRECTS',
  'V139_7_DIRECT_BLOG',
  'V139_4_STALE_BLOG_ROUTE_REDIRECTS',
  'v1394StaleRouteRedirect',
  'V139_10_RETIRED_BLOG_ROUTES'
];
const expectedStubFiles = [
  'blog/minigame-streak-exclusion-guide.html',
  'blog/minigame-streak-exclusion-guide/index.html',
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html',
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-guide/index.html',
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html',
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'
];

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
  if (!blog.includes('인기글 · 핵심글 · 최신글 75개')) errors.push('blog/index.html does not show 75 count');
  if (blog.includes('인기글 · 핵심글 · 최신글 76개')) errors.push('blog/index.html still shows 76 count');
  if (blog.includes('미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유')) errors.push('blog/index.html still exposes retired V9 title');
  for (const needle of sitemapNeedles) if (blog.includes(needle)) errors.push(`blog/index.html still exposes retired route needle: ${needle}`);
}

for (const file of expectedStubFiles) {
  if (!existsSync(file)) errors.push(`retired fallback stub missing: ${file}`);
  else {
    const text = read(file);
    if (!text.includes('noindex,nofollow')) errors.push(`${file} missing noindex fallback`);
    if (!text.includes('/blog/')) errors.push(`${file} missing /blog/ fallback link`);
  }
}

for (const file of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']) {
  if (!existsSync(file)) continue;
  const text = read(file);
  for (const needle of sitemapNeedles) if (text.includes(needle)) errors.push(`${file} still indexes retired route needle: ${needle}`);
}

if (!existsSync('_redirects')) errors.push('_redirects missing');
else {
  const redirects = read('_redirects');
  for (const route of retiredRoutes) {
    const line = `${route} /blog/ 302`;
    if (!redirects.includes(line)) errors.push(`_redirects missing retired route fallback: ${line}`);
  }
}

if (!existsSync('_worker.js')) errors.push('_worker.js missing');
else {
  const worker = read('_worker.js');
  if (!worker.includes('V139_11_RETIRED_BLOG_ROUTES')) errors.push('_worker.js missing V139_11_RETIRED_BLOG_ROUTES');
  if (!worker.includes('isRetiredBlogRoute')) errors.push('_worker.js missing normalized retired route guard');
  for (const route of retiredRoutes) if (!worker.includes(route)) errors.push(`_worker.js missing retired route: ${route}`);
  for (const needle of oldUnsafeWorkerNeedles) if (worker.includes(needle)) errors.push(`_worker.js contains old unsafe symbol: ${needle}`);
  const check = spawnSync(process.execPath, ['--check', '_worker.js'], { encoding: 'utf8' });
  if (check.status !== 0) errors.push(`_worker.js syntax check failed: ${check.stderr || check.stdout}`);
  const constMatches = worker.match(/const\s+(V139_[A-Z0-9_]+)/g) || [];
  const symbols = constMatches.map(x => x.replace(/^const\s+/, ''));
  const dups = symbols.filter((s, i) => symbols.indexOf(s) !== i);
  if (dups.length) errors.push(`_worker.js duplicate const symbols: ${[...new Set(dups)].join(', ')}`);
}

const htmlFiles = walk('.').filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const text = read(file);
  if (text.includes('href="#"')) errors.push(`${file} still contains href="#"`);
}

const forbiddenRoutes = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
for (const route of forbiddenRoutes) if (existsSync(route)) errors.push(`forbidden route directory exists: ${route}`);
for (const file of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt'].filter(existsSync)) {
  const text = read(file);
  for (const route of forbiddenRoutes) if (text.includes(`/${route}`)) errors.push(`${file} contains forbidden route: ${route}`);
}

if (errors.length) {
  console.error('[V139.11 VERIFY FAIL]\n' + errors.map(e => '- ' + e).join('\n'));
  process.exit(1);
}
console.log('[V139.11 VERIFY PASS] live broken V9 route family is removed, redirected, noindexed and worker-safe');
