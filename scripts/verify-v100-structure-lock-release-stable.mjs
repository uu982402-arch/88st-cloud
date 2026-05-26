import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const BUILD_ID = 'V100-STRUCTURE-LOCK-RELEASE-STABLE-20260526';
const errors = [];
const exists = p => fs.existsSync(path.join(ROOT,p));
const read = p => exists(p) ? fs.readFileSync(path.join(ROOT,p),'utf8') : '';
function walk(dir='.') { const out=[]; const abs=path.join(ROOT,dir); if(!fs.existsSync(abs)) return out; for(const ent of fs.readdirSync(abs,{withFileTypes:true})){ if(['node_modules','.git','.wrangler'].includes(ent.name)) continue; const rel=path.posix.join(dir,ent.name).replace(/^\.\//,''); if(ent.isDirectory()) out.push(...walk(rel)); else if(ent.isFile()) out.push(rel); } return out; }
function has(h, token){ return String(h).includes(token); }
const required = [
  'package.json','build.txt','assets/js/build.ver.js','_headers','robots.txt','sitemap.xml','sitemap.txt',
  'assets/css/v100-structure-lock-release-stable.css','assets/js/v100-structure-lock-release-stable.js','assets/data/v100-structure-lock-release-stable.json',
  'scripts/generate-v100-structure-lock-release-stable.mjs','scripts/verify-v100-structure-lock-release-stable.mjs','scripts/v100-structure-lock-release-stable-report.json'
];
for(const f of required) if(!exists(f)) errors.push(`missing ${f}`);
const pkg = JSON.parse(read('package.json') || '{}');
if(!pkg.scripts?.build?.includes('generate-v100-structure-lock-release-stable.mjs')) errors.push('build chain missing V100 generator');
if(pkg.scripts?.verify !== 'node scripts/verify-v100-structure-lock-release-stable.mjs') errors.push('default verify not V100');
if(!pkg.scripts?.['quality:v100'] || !pkg.scripts?.['verify:v100']) errors.push('V100 helper scripts missing');
if(!read('build.txt').includes(BUILD_ID)) errors.push('build.txt version mismatch');
if(!read('assets/js/build.ver.js').includes(BUILD_ID)) errors.push('build.ver.js version mismatch');
const core = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','admin/index.html'];
for(const f of core){
  if(!exists(f)){ errors.push(`missing core route ${f}`); continue; }
  const html=read(f);
  for(const token of ['v100-structure-lock-release','v100-structure-lock-release-stable.css','v100-structure-lock-release-stable.js',BUILD_ID,'viewport-fit=cover']) if(!has(html,token)) errors.push(`${f} missing ${token}`);
  if(!/<link rel="canonical" href="https:\/\/88st\.cloud\//.test(html)) errors.push(`${f} missing canonical`);
  if(f !== 'admin/index.html' && f !== 'ops/index.html'){
    if(!/<header\b/i.test(html) || !/data-rust-brand-header="true"/.test(html)) errors.push(`${f} missing RUST header marker`);
    if(!/data-rust-nav="bottom"|bottom-nav|mobile-bottom-nav/.test(html)) errors.push(`${f} missing mobile bottom nav marker`);
  }
}
const ops=read('ops/index.html'); if(!/<meta\s+name="robots"[^>]*noindex/i.test(ops)) errors.push('ops must remain noindex');
const admin=read('admin/index.html'); if(!/<meta\s+name="robots"[^>]*noindex/i.test(admin) || !/url=\/ops\/|location\.replace\('\/ops\/'/.test(admin)) errors.push('admin must remain noindex redirect to /ops/');
const hub=read('guaranteed/index.html');
const vendors = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
for(const slug of vendors){
  const detail = `guaranteed/${slug}/index.html`;
  if(!exists(detail)) errors.push(`missing guaranteed detail ${slug}`);
  const count = (hub.match(new RegExp(`/guaranteed/${slug}/`, 'g'))||[]).length;
  if(count < 1) errors.push(`guaranteed hub missing link for ${slug}`);
  const h = read(detail);
  for(const token of ['v96-3-mobile-safe-layout','v96-4-live-qa-cache-safe','v96-5-guaranteed-conversion','v98-performance-image','v100-structure-lock-release']) if(!has(h,token)) errors.push(`${detail} missing ${token}`);
  if(!/<header\b/i.test(h) || !/data-rust-nav="bottom"|bottom-nav|mobile-bottom-nav/.test(h)) errors.push(`${detail} missing header/bottom nav`);
}
if((hub.match(/data-vendor="(?:sk-holdings|zakum|udt|queenbee|ddangkong|anybet)"/g)||[]).length < 6) errors.push('guaranteed hub vendor card count below 6');
for(const f of ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html']){
  const html=read(f);
  for(const token of ['v96-3-mobile-safe-layout','v96-4-live-qa-cache-safe','v98-performance-image']) if(!has(html,token)) errors.push(`${f} missing mobile/cache/performance marker ${token}`);
}
const headers=read('_headers');
for(const token of ['/assets/*','Cache-Control: public, max-age=31536000, immutable','/build.txt','Cache-Control: no-store','/assets/js/build.ver.js','/ops/*','X-Robots-Tag: noindex']) if(!headers.includes(token)) errors.push(`_headers missing ${token}`);
const robots=read('robots.txt');
for(const token of ['Disallow: /analysis/','Disallow: /admin/','Disallow: /ops/','Sitemap: https://88st.cloud/sitemap.xml']) if(!robots.includes(token)) errors.push(`robots missing ${token}`);
const sitemap=read('sitemap.xml');
for(const banned of ['https://88st.cloud/analysis/','https://88st.cloud/admin/','https://88st.cloud/ops/']) if(sitemap.includes(banned)) errors.push(`sitemap includes banned ${banned}`);
for(const url of ['https://88st.cloud/','https://88st.cloud/blog/','https://88st.cloud/tools/','https://88st.cloud/guaranteed/','https://88st.cloud/consult/','https://88st.cloud/sports-check/','https://88st.cloud/search-guides/']) if(!sitemap.includes(`<loc>${url}</loc>`)) errors.push(`sitemap missing ${url}`);
const forbidden = ['RUST MOTION HUB','신규 유입 확장 콘텐츠','토토·입플·보증업체·도구 연결 50개','페이지 하단의 내부 링크','관련 글과 다음 확인 루트','CONSULT FLOW','상담 전 필요한 정보','오늘 확인해야 할 것','상담 전 먼저 확인할 것','함께 확인할 글'];
for(const f of walk('.').filter(x=>x.endsWith('.html'))){ const html=read(f); for(const phrase of forbidden) if(html.includes(phrase)) errors.push(`forbidden phrase ${phrase} in ${f}`); }
let report={}; try{ report=JSON.parse(read('scripts/v100-structure-lock-release-stable-report.json')||'{}'); }catch{ errors.push('report json invalid'); }
if(report.version !== BUILD_ID) errors.push('report version mismatch');
if(report.vendors?.length !== 6) errors.push('report vendor count mismatch');
if(report.forbiddenHits?.length) errors.push('report has forbidden hits');
const htmlFiles=walk('.').filter(f=>f.endsWith('.html'));
let missingV100=0; for(const f of htmlFiles){ const html=read(f); if(!html.includes('v100-structure-lock-release')) missingV100++; }
if(missingV100) errors.push(`${missingV100} html files missing V100 marker`);
if(errors.length){ console.error('[V100 VERIFY FAIL]'); for(const e of errors) console.error('-',e); process.exit(1); }
console.log(`[V100 VERIFY PASS] html=${htmlFiles.length} vendors=${vendors.length} build=${BUILD_ID}`);
