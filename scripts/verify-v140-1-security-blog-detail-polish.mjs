import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const errors = [];
const cssFile = 'assets/css/v140-1-security-blog-common-polish.css';
const cssHref = '/assets/css/v140-1-security-blog-common-polish.css?v=20260531-v140-1-security-blog-polish';
const posts = [
  { file: 'blog/fake-evolution-pragmatic-api-parsing-site-check.html', url: '/blog/fake-evolution-pragmatic-api-parsing-site-check.html', required: ['테이블·라운드 동기화', '다른 메이저 사이트와 실시간에 가깝게 맞아야', '눈으로 구별 못 합니다.', '본사 정품 API 계약과 보증 범위'] },
  { file: 'blog/mobile-addressbar-telegram-impersonation-scam.html', url: '/blog/mobile-addressbar-telegram-impersonation-scam.html', required: ['텔레그램 검색창 구별 팁', '구독자 수가 보이는 채널', '1:1 대화방 링크', '평생 도메인 센터'] },
  { file: 'blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html', url: '/blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html', required: ['TRC-20 입금 후 ERC-20 출금 핑계', '가짜 TxID', '추가 수수료 입금', '코인 먹튀는 개인이 바로 회수하기 어렵습니다.'] }
];
const retiredNeedles = ['minigame-streak-exclusion-guide','minigame-losing-streak-event-exclusion-condition-guide','minigame-losing-streak-event-exclusion-condition-first'];
const forbiddenRoutes = ['faq','consult-motives','consult-result','provider-updates'];
function read(f){ return readFileSync(f,'utf8'); }
function walk(dir,out=[]){ for(const item of readdirSync(dir)){ if(item==='node_modules'||item==='.git') continue; const full=join(dir,item); const st=statSync(full); if(st.isDirectory()) walk(full,out); else out.push(full);} return out; }
if (!existsSync(cssFile)) errors.push(`${cssFile} missing`);
else {
  const css = read(cssFile);
  for (const token of ['v140-fact-check','v140-conversion-bridge','focus-visible','@media(max-width:640px)']) if (!css.includes(token)) errors.push(`css missing ${token}`);
}
for (const post of posts) {
  if (!existsSync(post.file)) { errors.push(`${post.file} missing`); continue; }
  const text = read(post.file);
  if (!text.includes(cssHref)) errors.push(`${post.file} missing v140-1 css link`);
  if (!text.includes('data-v140-1-security-blog-polish="active"')) errors.push(`${post.file} missing html v140-1 marker`);
  if (!text.includes('rust-ga4-id') || !text.includes('v82.ga4-events.js') || !text.includes('v89.ga4-event-depth.js')) errors.push(`${post.file} GA4 coverage missing`);
  if (!text.includes(`<link rel="canonical" href="https://88st.cloud${post.url}"`)) errors.push(`${post.file} canonical mismatch`);
  if ((text.match(/<footer/g)||[]).length !== 1) errors.push(`${post.file} footer count not 1`);
  if (text.includes('href="#"')) errors.push(`${post.file} contains href="#"`);
  for (const r of post.required) if (!text.includes(r)) errors.push(`${post.file} missing required phrase: ${r}`);
  const fallback = post.file.replace(/\.html$/, '/index.html');
  if (existsSync(fallback)) errors.push(`route collision folder variant exists: ${fallback}`);
}
if (!existsSync('blog/index.html')) errors.push('blog/index.html missing');
else {
  const blog = read('blog/index.html');
  if (!blog.includes(cssHref)) errors.push('blog index missing v140-1 css');
  if (!blog.includes('인기글 · 핵심글 · 최신글 78개')) errors.push('blog index count is not 78');
  for (const post of posts) if (!blog.includes(`href="${post.url}"`)) errors.push(`blog index missing ${post.url}`);
  for (const needle of retiredNeedles) if (blog.includes(needle)) errors.push(`blog index contains retired route: ${needle}`);
}
if (existsSync('assets/config/seo.meta.json')) {
  const seo = JSON.parse(read('assets/config/seo.meta.json'));
  for (const post of posts) {
    if (!seo[post.url]) errors.push(`seo.meta missing ${post.url}`);
    else if (!String(seo[post.url].keywords || '').includes('RUST')) errors.push(`seo.meta keywords weak for ${post.url}`);
  }
} else errors.push('seo.meta.json missing');
for (const file of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']) {
  if (!existsSync(file)) { errors.push(`${file} missing`); continue; }
  const text = read(file);
  for (const post of posts) if (!text.includes(`https://88st.cloud${post.url}`)) errors.push(`${file} missing ${post.url}`);
  for (const needle of retiredNeedles) if (text.includes(needle)) errors.push(`${file} contains retired route: ${needle}`);
}
if (!existsSync('_worker.js')) errors.push('_worker.js missing');
else {
  const worker = read('_worker.js');
  if (!worker.includes('V139_11_RETIRED_BLOG_ROUTES')) errors.push('_worker.js lost V139-11 retired route lock');
  const check = spawnSync(process.execPath, ['--check', '_worker.js'], {encoding:'utf8'});
  if (check.status !== 0) errors.push(`_worker.js node --check failed: ${check.stderr || check.stdout}`);
}
const htmlFiles = walk('.').filter(f=>f.endsWith('.html'));
for (const file of htmlFiles) {
  const text = read(file);
  if (text.includes('href="#"')) errors.push(`${file} contains href="#"`);
}
for (const route of forbiddenRoutes) if (existsSync(route)) errors.push(`forbidden route exists: ${route}`);
if (errors.length) { console.error('[V140.1 VERIFY FAIL]\n' + errors.map(e=>'- '+e).join('\n')); process.exit(1); }
console.log('[V140.1 VERIFY PASS] security article content/detail polish and common design rules OK');
