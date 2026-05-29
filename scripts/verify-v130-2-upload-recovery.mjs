import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const fail = [];
const warn = [];
const removedRoutes = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const coreFiles = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','sitemap.xml','robots.txt'];
const vendorFiles = ['guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const forbiddenUi = ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크'];
const forbiddenIndex = ['RUST QUICK CHECK','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed','class="v71-fab"','24H</'];
const forbiddenGuaranteed = ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준','상담 전 최종 확인','COMMON CENTER','공통 확인 채널','상담센터 연결','상담 전 문의 템플릿','상담에서 재확인','v118-detail-consult','v96-2-contact'];
function abs(rel){ return path.join(ROOT, rel); }
function exists(rel){ return fs.existsSync(abs(rel)); }
function read(rel){ return fs.readFileSync(abs(rel),'utf8'); }
function walk(dir=ROOT,out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const name of fs.readdirSync(dir)){
    if(['node_modules','.git','.wrangler','.cache'].includes(name)) continue;
    const full=path.join(dir,name);
    const rel=path.relative(ROOT,full).replace(/\\/g,'/');
    const st=fs.statSync(full);
    if(st.isDirectory()) walk(full,out); else out.push(rel);
  }
  return out;
}
function assert(ok,msg){ if(!ok) fail.push(msg); }
function soft(ok,msg){ if(!ok) warn.push(msg); }

for(const f of coreFiles) assert(exists(f), `missing core file: ${f}`);
for(const f of vendorFiles) assert(exists(f), `missing vendor file: ${f}`);
for(const r of removedRoutes){
  assert(!exists(r), `removed route directory exists: ${r}`);
  assert(!exists(`${r}.html`), `removed route file exists: ${r}.html`);
  assert(!exists(`${r}/index.html`), `removed route index exists: ${r}/index.html`);
}
assert(exists('assets/css/v130-final-release-lock.css'), 'missing v130 css');
assert(exists('V130_2_PATCH_MANIFEST.json'), 'missing V130.2 patch manifest');
assert(exists('V130_2_UPGRADE_REPORT.md'), 'missing V130.2 upgrade report');
assert(exists('reports/v130-2-upload-recovery-audit.json'), 'missing V130.2 recovery audit');

const htmls = walk().filter((rel)=>rel.endsWith('.html'));
assert(htmls.length >= 500, `unexpected html count: ${htmls.length}`);
let missingV130=0, missingSeo=0, forbiddenCount=0;
for(const rel of htmls){
  const body=read(rel);
  if(!body.includes('v130-final-release-lock') || !body.includes('data-v130-release-lock')) missingV130++;
  if(!/<title>[^<]+<\/title>/i.test(body) || !/<meta\s+name=["']description["']/i.test(body) || !/<link\s+rel=["']canonical["']/i.test(body) || !/property=["']og:title["']/i.test(body) || !/application\/ld\+json/i.test(body)) missingSeo++;
  for(const token of forbiddenUi){
    if(body.includes(token)) { forbiddenCount++; if(forbiddenCount <= 15) fail.push(`${rel} forbidden bottom marker: ${token}`); }
  }
}
assert(missingV130 === 0, `${missingV130} html files missing V130 marker`);
assert(missingSeo === 0, `${missingSeo} html files missing SEO/OG/schema basics`);
assert(forbiddenCount === 0, `${forbiddenCount} forbidden bottom markers found`);

if(exists('index.html')){
  const index=read('index.html');
  for(const token of forbiddenIndex) assert(!index.includes(token), `index forbidden token: ${token}`);
}
for(const rel of ['guaranteed/index.html', ...vendorFiles]){
  if(!exists(rel)) continue;
  const body=read(rel);
  for(const token of forbiddenGuaranteed) assert(!body.includes(token), `${rel} forbidden guaranteed token: ${token}`);
}
const pkg = exists('package.json') ? JSON.parse(read('package.json')) : {};
assert((pkg.scripts?.build || '').includes('build-v130-2-cloudflare-pages-safe.mjs'), 'package build is not V130.2 safe build');
assert((pkg.scripts?.verify || '').includes('verify-v130-2-upload-recovery.mjs'), 'package verify is not V130.2 verify');
soft(Boolean(pkg.scripts?.['build:legacy-full-chain']), 'build:legacy-full-chain not present');

if(warn.length){ console.log('[V130.2 VERIFY WARN]'); for(const w of warn) console.log('- '+w); }
if(fail.length){ console.error('[V130.2 VERIFY FAIL]'); for(const f of fail) console.error('- '+f); process.exit(1); }
console.log('[V130.2 VERIFY PASS] upload recovery lock OK');
console.log(JSON.stringify({html_count:htmls.length, core:coreFiles.length, vendors:vendorFiles.length, warnings:warn.length}, null, 2));
