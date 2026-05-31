
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const errors = [];
const posts = [
  { file: 'blog/mobile-addressbar-telegram-impersonation-scam.html', url: '/blog/mobile-addressbar-telegram-impersonation-scam.html', title: '모바일 주소창 사기와 텔레그램 사칭 먹튀', required: ['모바일 브라우저 주소창', '텔레그램', '보증 사이트 가입 링크 및 추천코드 안내'] },
  { file: 'blog/fake-evolution-pragmatic-api-parsing-site-check.html', url: '/blog/fake-evolution-pragmatic-api-parsing-site-check.html', title: '에볼루션이 가짜일 수 있다', required: ['에볼루션', '프라그마틱', '보증 사이트 바로가기 버튼'] },
  { file: 'blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html', url: '/blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html', title: 'USDT·TRX', required: ['USDT', 'TRX', 'TxID', '추천 보증 사이트 및 가입 코드 안내'] }
];
const retiredNeedles = ['minigame-streak-exclusion-guide','minigame-losing-streak-event-exclusion-condition-guide','minigame-losing-streak-event-exclusion-condition-first'];
const forbiddenRoutes = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];

function read(file) { return readFileSync(file, 'utf8'); }
function walk(dir, out = []) {
  for (const item of readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = join(dir, item);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}

if (!existsSync('blog/index.html')) errors.push('blog/index.html missing');
else {
  const blog = read('blog/index.html');
  if (!blog.includes('인기글 · 핵심글 · 최신글 78개')) errors.push('blog/index.html does not show 78 count');
  if (!blog.includes('V140_SECURITY_BLOG_CARDS_START')) errors.push('blog index missing V140 card block');
  for (const post of posts) {
    if (!blog.includes(`href="${post.url}"`)) errors.push(`blog index missing link: ${post.url}`);
    if (!blog.includes(post.title)) errors.push(`blog index missing title snippet: ${post.title}`);
  }
  if (blog.includes('미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유')) errors.push('blog index exposes retired V9 title');
  for (const needle of retiredNeedles) if (blog.includes(needle)) errors.push(`blog index contains retired route needle: ${needle}`);
}

for (const post of posts) {
  if (!existsSync(post.file)) errors.push(`new post missing: ${post.file}`);
  else {
    const text = read(post.file);
    if (!text.includes('rust-ga4-id')) errors.push(`${post.file} missing rust-ga4-id`);
    if (!text.includes('v82.ga4-events.js')) errors.push(`${post.file} missing v82 GA4 script`);
    if (!text.includes('v89.ga4-event-depth.js')) errors.push(`${post.file} missing v89 GA4 depth script`);
    if (!text.includes('<footer')) errors.push(`${post.file} missing footer`);
    if ((text.match(/<footer/g) || []).length !== 1) errors.push(`${post.file} has duplicate footer`);
    if (!text.includes(`<link rel="canonical" href="https://88st.cloud${post.url}"`)) errors.push(`${post.file} canonical mismatch`);
    if (text.includes('href="#"')) errors.push(`${post.file} contains href="#"`);
    for (const needle of post.required) if (!text.includes(needle)) errors.push(`${post.file} missing required content: ${needle}`);
  }
  const folderVariant = post.file.replace(/\.html$/, '/index.html');
  if (existsSync(folderVariant)) errors.push(`route collision folder variant exists: ${folderVariant}`);
}

for (const file of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']) {
  if (!existsSync(file)) { errors.push(`${file} missing`); continue; }
  const text = read(file);
  for (const post of posts) {
    const url = `https://88st.cloud${post.url}`;
    if (!text.includes(url)) errors.push(`${file} missing new post URL: ${url}`);
  }
  for (const needle of retiredNeedles) if (text.includes(needle)) errors.push(`${file} contains retired route needle: ${needle}`);
}

if (existsSync('assets/config/seo.meta.json')) {
  const seo = JSON.parse(read('assets/config/seo.meta.json'));
  for (const post of posts) if (!seo[post.url]) errors.push(`seo.meta.json missing ${post.url}`);
} else errors.push('seo.meta.json missing');

if (!existsSync('_worker.js')) errors.push('_worker.js missing');
else {
  const worker = read('_worker.js');
  if (!worker.includes('V139_11_RETIRED_BLOG_ROUTES')) errors.push('_worker.js lost V139-11 retired route lock');
  if (!worker.includes('isRetiredBlogRoute')) errors.push('_worker.js lost retired route guard');
  const check = spawnSync(process.execPath, ['--check', '_worker.js'], { encoding: 'utf8' });
  if (check.status !== 0) errors.push(`_worker.js syntax failed: ${check.stderr || check.stdout}`);
  const symbolMatches = worker.match(/const\s+([A-Z0-9_]+)\s*=/g) || [];
  const names = symbolMatches.map(x => x.replace(/const\s+/, '').replace(/\s*=.*/, ''));
  const dups = names.filter((name, i) => names.indexOf(name) !== i);
  if (dups.length) errors.push(`_worker.js duplicate const symbols: ${[...new Set(dups)].join(', ')}`);
}

const htmlFiles = walk('.').filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const text = read(file);
  if (text.includes('href="#"')) errors.push(`${file} contains href="#"`);
}
for (const route of forbiddenRoutes) if (existsSync(route)) errors.push(`forbidden route directory exists: ${route}`);
for (const file of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt'].filter(existsSync)) {
  const text = read(file);
  for (const route of forbiddenRoutes) if (text.includes(`/${route}`)) errors.push(`${file} contains forbidden route: ${route}`);
}

if (errors.length) {
  console.error('[V140 VERIFY FAIL]\n' + errors.map(e => '- ' + e).join('\n'));
  process.exit(1);
}
console.log('[V140 VERIFY PASS] security blog expansion, route integrity, GA4 and V139-11 lock OK');
