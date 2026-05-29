import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd(); const fail=[]; const warn=[];
function abs(rel){return path.join(ROOT,rel)} function exists(rel){return fs.existsSync(abs(rel))} function read(rel){return fs.readFileSync(abs(rel),'utf8')}
function walk(dir=ROOT,out=[]){ if(!fs.existsSync(dir)) return out; for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','.wrangler','.cache'].includes(name)) continue; const full=path.join(dir,name); const rel=path.relative(ROOT,full).replace(/\\/g,'/'); const st=fs.statSync(full); if(st.isDirectory()) walk(full,out); else out.push(rel);} return out; }
const core=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html'];
const vendors=['guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const removedRoutes=['faq','consult-motives','consult-result','provider-updates'];
const forbidden=[
  'v71-topbar','v71-mobile-nav','v71-fab','v65-chat-bubble','v65-chat','v70-2-sticky-cta','v70-2-fab','v73-footer-cta','v73-fab','v74-fab','v74-mobile-nav','v70-2-header','v68-header','v67-header','moon-header',
  'v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section',
  'RUST QUICK CHECK','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed','24H</',
  '조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준','상담 전 최종 확인','COMMON CENTER','공통 확인 채널','상담센터 연결','상담 전 문의 템플릿','상담에서 재확인','다른 보증업체','상담 기록',
  '관련 링크 포함','관련 허브 보기','같이 보면 좋은 링크','관련 확인','계산 결과가 애매하면 상담센터로 바로 넘기세요','텔레그램 상담 연결','data-v103-consult','v129-consult-strip'
];
for(const f of core) if(!exists(f)) fail.push(`missing core file: ${f}`);
for(const f of vendors) if(!exists(f)) fail.push(`missing vendor file: ${f}`);
for(const r of removedRoutes){ for(const rel of [r, `${r}.html`, `${r}/index.html`]) if(exists(rel)) fail.push(`removed route exists: ${rel}`); }
for(const rel of ['assets/css/v132-live-screen-cleanup.css','scripts/generate-v132-live-screen-cleanup-duplicate-ui.mjs','scripts/build-v132-cloudflare-pages-safe.mjs','V132_PATCH_MANIFEST.json','V132_UPGRADE_REPORT.md','reports/v132-live-screen-cleanup-audit.json']) if(!exists(rel)) fail.push(`missing V132 file: ${rel}`);
const htmls=walk().filter(rel=>rel.endsWith('.html'));
let missingV132=0, forbiddenHits=0;
for(const rel of htmls){ const body=read(rel); if(!body.includes('data-v132-live-cleanup') || !body.includes('v132-live-screen-cleanup.css')) missingV132++; for(const token of forbidden){ if(body.includes(token)){ forbiddenHits++; if(forbiddenHits<=30) fail.push(`${rel} forbidden token: ${token}`); } } }
if(htmls.length < 500) fail.push(`unexpected html count: ${htmls.length}`);
if(missingV132) fail.push(`${missingV132} html files missing V132 cleanup lock`);
if(forbiddenHits) fail.push(`${forbiddenHits} forbidden duplicate/related/consult tokens found`);
if(exists('index.html')){ const index=read('index.html'); if(!index.includes('OFFICIAL BOT')) fail.push('index missing OFFICIAL BOT compact consult label'); if(!index.includes('@TRS999_bot')) fail.push('index missing @TRS999_bot compact label'); if(index.includes('v131-consult-copy')) fail.push('index still has long consult copy'); if(!index.includes('rust-global-header')) fail.push('index missing rust global header'); if(!index.includes('rust-bottom-nav')) fail.push('index missing rust bottom nav'); }
if(exists('tools/index.html')){ const tools=read('tools/index.html'); if(/상담 연결|텔레그램 상담 연결|계산 결과가 애매/.test(tools)) fail.push('tools index still has consult/telegram conversion residue'); }
const pkg = exists('package.json') ? JSON.parse(read('package.json')) : {scripts:{}};
if(!(pkg.scripts?.build||'').includes('build-v132-cloudflare-pages-safe.mjs')) fail.push('package build is not V132 safe build');
if(!(pkg.scripts?.verify||'').includes('verify-v132-live-screen-cleanup-duplicate-ui.mjs')) fail.push('package verify is not V132 verify');
const missingScripts=[]; for(const [name,cmd] of Object.entries(pkg.scripts||{})){ for(const m of cmd.matchAll(/scripts\/[A-Za-z0-9_.-]+\.mjs/g)){ if(!exists(m[0])) missingScripts.push(`${name} -> ${m[0]}`); } }
if(missingScripts.length) fail.push(`package references missing scripts: ${missingScripts.slice(0,20).join(', ')}`);
if(fail.length){ console.error('[V132 VERIFY FAIL]'); for(const f of fail) console.error('- '+f); process.exit(1); }
console.log('[V132 VERIFY PASS] live screen cleanup + duplicate UI removal OK');
console.log(JSON.stringify({html_count:htmls.length, core:core.length, vendors:vendors.length, forbiddenHits, missingV132}, null, 2));
