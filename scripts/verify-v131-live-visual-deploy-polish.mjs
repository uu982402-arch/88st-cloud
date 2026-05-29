import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail=[]; const warn=[];
const coreFiles = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','sitemap.xml','robots.txt'];
const vendorFiles = ['guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
const forbiddenUi = ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크','관련 링크','관련 확인','관련 허브 보기','관련 링크 포함'];
const forbiddenIndex = ['RUST QUICK CHECK','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed','class="v71-fab"','24H</','애매한 조건은 공식 상담봇에서 깔끔하게 정리하세요','마지막 확인은 공식 상담봇에서 짧게 정리하세요','가입코드, 공식주소, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 부분만','공식주소, 가입코드, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 항목만','class="v71-topbar"','class="v71-mobile-nav"','v129-consult-strip'];
const forbiddenGuaranteed = ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준','상담 전 최종 확인','COMMON CENTER','공통 확인 채널','상담센터 연결','상담 전 문의 템플릿','상담에서 재확인','v118-detail-consult','v96-2-contact','다른 보증업체','상담 기록'];
function abs(rel){return path.join(ROOT,rel)} function exists(rel){return fs.existsSync(abs(rel))} function read(rel){return fs.readFileSync(abs(rel),'utf8')}
function walk(dir=ROOT,out=[]){ if(!fs.existsSync(dir)) return out; for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','.wrangler','.cache'].includes(name)) continue; const full=path.join(dir,name); const rel=path.relative(ROOT,full).replace(/\\/g,'/'); const st=fs.statSync(full); if(st.isDirectory()) walk(full,out); else out.push(rel);} return out; }
function assert(ok,msg){ if(!ok) fail.push(msg) } function soft(ok,msg){ if(!ok) warn.push(msg) }
for(const f of coreFiles) assert(exists(f), `missing core file: ${f}`);
for(const f of vendorFiles) assert(exists(f), `missing vendor file: ${f}`);
for(const r of removedRoutes){ assert(!exists(r), `removed route directory exists: ${r}`); assert(!exists(`${r}.html`), `removed route file exists: ${r}.html`); assert(!exists(`${r}/index.html`), `removed route index exists: ${r}/index.html`); }
assert(exists('assets/css/v131-live-visual-deploy-polish.css'), 'missing v131 css');
assert(exists('V131_PATCH_MANIFEST.json'), 'missing V131 patch manifest');
assert(exists('V131_UPGRADE_REPORT.md'), 'missing V131 upgrade report');
assert(exists('reports/v131-live-visual-deploy-audit.json'), 'missing V131 live visual audit');
assert(exists('reports/v131-build-script-audit.json'), 'missing V131 build script audit');
const htmls = walk().filter(rel=>rel.endsWith('.html'));
assert(htmls.length >= 500, `unexpected html count: ${htmls.length}`);
let missingV131=0, missingSeo=0, missingV127=0, missingV128=0, missingV129=0, missingV130=0, forbiddenCount=0;
for(const rel of htmls){
  const body = read(rel);
  if(!body.includes('data-v131-live-visual') || !body.includes('v131-live-visual-deploy-polish.css')) missingV131++;
  if(!body.includes('data-v127-mobile-qa') || !body.includes('v127-mobile-qa-safe-area-lock.css')) missingV127++;
  if(!body.includes('data-v128-performance') || !body.includes('v128-performance-asset-lightweight.css')) missingV128++;
  if(!body.includes('data-v129-seo-schema') || !body.includes('v129-seo-schema-consult-strip.css')) missingV129++;
  if(!body.includes('v130-final-release-lock') || !body.includes('data-v130-release-lock')) missingV130++;
  if(!/<title>[^<]+<\/title>/i.test(body) || !/<meta\s+name=["']description["']/i.test(body) || !/<link\s+rel=["']canonical["']/i.test(body) || !/property=["']og:title["']/i.test(body) || !/application\/ld\+json/i.test(body)) missingSeo++;
  for(const token of forbiddenUi){ if(body.includes(token)){ forbiddenCount++; if(forbiddenCount <= 20) fail.push(`${rel} forbidden bottom marker: ${token}`); } }
}
assert(missingV131 === 0, `${missingV131} html files missing V131 marker/css`);
assert(missingV127 === 0, `${missingV127} html files missing V127 mobile lock`);
assert(missingV128 === 0, `${missingV128} html files missing V128 performance lock`);
assert(missingV129 === 0, `${missingV129} html files missing V129 seo/schema lock`);
assert(missingV130 === 0, `${missingV130} html files missing V130 release lock`);
assert(missingSeo === 0, `${missingSeo} html files missing SEO/OG/schema basics`);
assert(forbiddenCount === 0, `${forbiddenCount} forbidden bottom markers found`);
if(exists('index.html')){
  const index = read('index.html');
  for(const token of forbiddenIndex) assert(!index.includes(token), `index forbidden token: ${token}`);
  assert(index.includes('data-v131-consult-dock="true"'), 'index missing V131 compact consult dock');
  assert(index.includes('@TRS999_bot'), 'index missing bot label');
  assert(index.includes('class="rust-bottom-nav"'), 'index missing rust bottom nav');
  assert(index.includes('class="rust-global-header"'), 'index missing rust global header');
}
for(const rel of ['guaranteed/index.html', ...vendorFiles]){
  if(!exists(rel)) continue; const body = read(rel);
  for(const token of forbiddenGuaranteed) assert(!body.includes(token), `${rel} forbidden guaranteed token: ${token}`);
}
const pkg = exists('package.json') ? JSON.parse(read('package.json')) : {};
assert((pkg.scripts?.build || '').includes('build-v131-cloudflare-pages-safe.mjs'), 'package build is not V131 safe build');
assert((pkg.scripts?.verify || '').includes('verify-v131-live-visual-deploy-polish.mjs'), 'package verify is not V131 verify');
assert((pkg.scripts?.['quality:v131'] || '').includes('generate-v131-live-visual-deploy-polish.mjs'), 'quality:v131 missing');
assert((pkg.scripts?.['verify:v131'] || '').includes('verify-v131-live-visual-deploy-polish.mjs'), 'verify:v131 missing');
soft(Boolean(pkg.scripts?.['build:legacy-full-chain']), 'build:legacy-full-chain not present');
// Full script-reference audit to prevent MODULE_NOT_FOUND regressions.
const missingScripts=[];
for(const [name,cmd] of Object.entries(pkg.scripts || {})){
  for(const match of cmd.matchAll(/scripts\/[A-Za-z0-9_.-]+\.mjs/g)){
    if(!exists(match[0])) missingScripts.push(`${name} -> ${match[0]}`);
  }
}
assert(missingScripts.length === 0, `package references missing scripts: ${missingScripts.slice(0,20).join(', ')}`);
if(warn.length){ console.log('[V131 VERIFY WARN]'); for(const w of warn) console.log('- '+w); }
if(fail.length){ console.error('[V131 VERIFY FAIL]'); for(const f of fail) console.error('- '+f); process.exit(1); }
console.log('[V131 VERIFY PASS] live visual QA + deploy safe polish OK');
console.log(JSON.stringify({html_count:htmls.length, core:coreFiles.length, vendors:vendorFiles.length, scriptAudit:'PASS', warnings:warn.length}, null, 2));
