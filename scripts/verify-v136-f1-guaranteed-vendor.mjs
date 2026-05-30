import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd(); const errors=[];
const p=(...a)=>path.join(ROOT,...a); const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
function exists(f){ if(!fs.existsSync(p(f))) errors.push('missing '+f); }
for(const f of ['assets/img/guaranteed/cards/f1.webp','assets/css/v136-f1-guaranteed-vendor.css','guaranteed/f1/index.html','scripts/generate-v136-f1-guaranteed-vendor.mjs','scripts/verify-v136-f1-guaranteed-vendor.mjs','scripts/build-v136-cloudflare-pages-safe.mjs','V136_PATCH_MANIFEST.json','V136_UPGRADE_REPORT.md']) exists(f);
const home=read(p('index.html')); const guaranteed=read(p('guaranteed/index.html')); const detail=read(p('guaranteed/f1/index.html'));
if(!home.includes('/guaranteed/f1/')) errors.push('home missing F-1 card link');
if((home.match(/data-v1322-ad-card="inquiry-/g)||[]).length!==1) errors.push('home ad inquiry cards must be exactly 1');
if(!home.includes('/assets/img/guaranteed/cards/f1.webp')) errors.push('home missing F-1 image');
if(!guaranteed.includes('data-vendor="f1"')) errors.push('guaranteed hub missing F-1 vendor card');
if(!guaranteed.includes('data-code="888"')) errors.push('guaranteed hub missing F-1 code 888');
if(!guaranteed.includes('https://f1-77.com/register?ref=888')) errors.push('guaranteed hub missing F-1 domain');
const vendorCards=(guaranteed.match(/class="v74-1-vendor-card/g)||[]).length;
if(vendorCards<7) errors.push('guaranteed hub vendor cards less than 7: '+vendorCards);
for(const token of ['F-1','가입코드','888','USDT','스포츠','미니게임','슬롯','카지노','홀덤','입금 룰렛 쿠폰','크래시게임류']) if(!detail.includes(token)) errors.push('F-1 detail missing '+token);
for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
  const s=read(p(sm)); if(!s.includes('https://88st.cloud/guaranteed/f1/')) errors.push(sm+' missing /guaranteed/f1/');
  for(const r of ['faq','consult-motives','consult-result','provider-updates']) if(s.includes('/'+r)) errors.push(sm+' contains removed route '+r);
}
const pkg=JSON.parse(read(p('package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v136-cloudflare-pages-safe.mjs') errors.push('package build not V136');
if(pkg.scripts?.verify!=='node scripts/verify-v136-f1-guaranteed-vendor.mjs') errors.push('package verify not V136');
for(const [name,cmd] of Object.entries(pkg.scripts||{})){
  const m=[...cmd.matchAll(/node\s+(scripts\/[^\s&|]+\.mjs)/g)];
  for(const mm of m) if(!fs.existsSync(p(mm[1]))) errors.push(`package script ${name} references missing ${mm[1]}`);
}
for(const bad of ['조건 상담 후 이용','상담으로 조건 확인','확인 기준']) if(guaranteed.includes(bad)||detail.includes(bad)) errors.push('forbidden vendor copy found: '+bad);
if(errors.length){ console.error('[V136 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1); }
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v136-verify-report.json'), JSON.stringify({ok:true,version:'V136_F1_GUARANTEED_VENDOR_ADDITION',vendorCards,generatedAt:new Date().toISOString()},null,2));
console.log('[V136 VERIFY PASS] F-1 vendor addition OK');
