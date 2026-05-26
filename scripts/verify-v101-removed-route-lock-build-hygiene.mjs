import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const REMOVED = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const CORE = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','admin/index.html'];
const DETAIL = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'].map(s=>`guaranteed/${s}/index.html`);
const VENDOR_NAMES = ['SK 홀딩스','자쿰','UDT BET','여왕벌','땅콩 BET','ANY BET'];
let failures=[];
function fail(msg){ failures.push(msg); }
function exists(p){ return fs.existsSync(path.join(ROOT,p)); }
function read(p){ return fs.readFileSync(path.join(ROOT,p),'utf8'); }
function walk(dir='.'){
  const base=path.join(ROOT,dir); const out=[];
  if(!fs.existsSync(base)) return out;
  for(const name of fs.readdirSync(base)){
    if(['node_modules','.git','.wrangler'].includes(name)) continue;
    const full=path.join(base,name); const rel=path.relative(ROOT,full).replaceAll(path.sep,'/');
    const st=fs.statSync(full);
    if(st.isDirectory()) out.push(...walk(rel)); else out.push(rel);
  }
  return out;
}
for(const r of REMOVED){ if(exists(r)) fail(`removed route directory still exists: ${r}`); }
for(const r of CORE){ if(!exists(r)) fail(`core route missing: ${r}`); }
for(const r of DETAIL){ if(!exists(r)) fail(`guaranteed detail route missing: ${r}`); }
for(const sp of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){
  if(!exists(sp)){ fail(`sitemap file missing: ${sp}`); continue; }
  const s=read(sp);
  for(const r of REMOVED){ if(s.includes(`https://88st.cloud/${r}`) || s.includes(`/${r}/`)) fail(`${sp} contains removed route: ${r}`); }
}
if(exists('_redirects')){
  const s=read('_redirects');
  for(const r of REMOVED){ if(new RegExp(`(^|\\s)/${r}(?:/|\\*|\\s|$)`,'m').test(s)) fail(`_redirects contains removed route: ${r}`); }
}
const htmlFiles=walk('.').filter(f=>f.endsWith('.html'));
const hrefRx = /href=["']\/(faq|consult-motives|consult-result|provider-updates)(?:\/|["'#?])/g;
for(const file of htmlFiles){
  if(REMOVED.some(r=>file===r || file.startsWith(r+'/'))) fail(`removed html file included: ${file}`);
  const s=read(file);
  let m; while((m=hrefRx.exec(s))) fail(`${file} has internal link to removed route: ${m[1]}`);
  if(!s.includes('data-v101-removed-route-lock')) fail(`${file} missing V101 route lock marker`);
}
const guaranteed = exists('guaranteed/index.html') ? read('guaranteed/index.html') : '';
if(guaranteed){
  if(guaranteed.includes('v96-5-conversion-rail')) fail('guaranteed/index.html still contains V96.5 conversion rail above cards');
  if(guaranteed.includes('v74-1-bridge')) fail('guaranteed/index.html still contains old bridge notice');
  if(!guaranteed.includes('data-v101-guaranteed-clean="true"')) fail('guaranteed/index.html missing V101 clean marker');
  const cardCount=(guaranteed.match(/class="v74-1-vendor-card"/g)||[]).length;
  if(cardCount!==6) fail(`guaranteed card count expected 6, got ${cardCount}`);
  for(const n of VENDOR_NAMES){ if(!guaranteed.includes(n)) fail(`guaranteed vendor missing: ${n}`); }
}
const idx = exists('index.html') ? read('index.html') : '';
if(idx && !idx.includes('v96-3-mobile-safe-layout')) fail('mobile safe layout marker missing on index.html');
if(idx && !idx.includes('v100-structure-lock-release')) fail('V100 structure lock marker missing on index.html');
if(!exists('assets/css/v101-removed-route-lock-build-hygiene.css')) fail('V101 CSS asset missing');
if(!exists('assets/js/v101-removed-route-lock-build-hygiene.js')) fail('V101 JS asset missing');
if(exists('package.json')){
  const pkg=JSON.parse(read('package.json'));
  const build=pkg.scripts?.build || '';
  if(!build.includes('generate-v101-removed-route-lock-build-hygiene.mjs')) fail('package build does not append V101 generator');
  if((pkg.scripts?.verify || '') !== 'node scripts/verify-v101-removed-route-lock-build-hygiene.mjs') fail('package verify is not V101 verifier');
}
if(failures.length){ console.error('[V101 verify] FAILED'); for(const f of failures) console.error(' - '+f); process.exit(1); }
console.log('[V101 verify] OK - removed routes locked, sitemap/internal links clean, guaranteed cards stable.');
