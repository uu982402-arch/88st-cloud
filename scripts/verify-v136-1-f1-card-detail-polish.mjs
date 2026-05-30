import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd(); const errors=[];
const p=(...a)=>path.join(ROOT,...a); const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
function exists(f){ if(!fs.existsSync(p(f))) errors.push('missing '+f); }
const vendors=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet','f1'];
for(const f of ['assets/css/v136-1-f1-card-detail-polish.css','scripts/generate-v136-1-f1-card-detail-polish.mjs','scripts/verify-v136-1-f1-card-detail-polish.mjs','scripts/build-v136-1-cloudflare-pages-safe.mjs','V136_1_PATCH_MANIFEST.json','V136_1_UPGRADE_REPORT.md']) exists(f);
const home=read(p('index.html'));
if(!home.includes('data-v136-1-f1-scale="true"')) errors.push('home F-1 scale marker missing');
if(!home.includes('/assets/css/v136-1-f1-card-detail-polish.css')) errors.push('home missing V136.1 css');
if(!home.includes('/guaranteed/f1/')) errors.push('home missing F-1 link');
const guaranteed=read(p('guaranteed/index.html'));
if(!guaranteed.includes('7개 보증업체')) errors.push('guaranteed hub count not updated to 7');
if((guaranteed.match(/data-vendor="f1"/g)||[]).length!==1) errors.push('guaranteed hub F-1 card not exactly one');
if(guaranteed.includes('F-1, F-1')) errors.push('guaranteed hub duplicate F-1 copy');
for(const slug of vendors){
  const rel=`guaranteed/${slug}/index.html`; const html=read(p(rel));
  if(!html) {errors.push('missing '+rel); continue;}
  if(!html.includes('/assets/css/v136-1-f1-card-detail-polish.css')) errors.push(rel+' missing V136.1 css');
  if(!html.includes('v136-1-guaranteed-detail-lock')) errors.push(rel+' missing detail lock class');
  if(html.includes('<section class="v96-2-neighbors"')) errors.push(rel+' still contains broken neighbors wrapper');
  if(!html.includes('<section class="v113-depth"')) errors.push(rel+' missing v113-depth bottom section');
  if(!html.includes('data-v136-1-detail-cta="true"')) errors.push(rel+' missing detail CTA marker');
  const footerBlock=html.match(/<footer class="moon-footer"[\s\S]*?<\/footer>/)?.[0]||'';
  if(footerBlock.includes('data-v136-1-detail-cta')) errors.push(rel+' footer contains detail CTA marker');
  const mainClose=html.indexOf('</main>'); const footer=html.indexOf('<footer class="moon-footer"');
  if(mainClose<0) errors.push(rel+' missing </main>');
  if(footer<0) errors.push(rel+' missing canonical footer');
  if(footer>=0 && mainClose>=0 && footer<mainClose) errors.push(rel+' footer appears before main close');
  if((html.match(/<footer class="moon-footer"/g)||[]).length!==1) errors.push(rel+' footer count not exactly one');
  for(const bad of ['조건 상담 후 이용','상담으로 조건 확인','확인 기준','다른 보증업체']) if(html.includes(bad)) errors.push(rel+' forbidden copy: '+bad);
}
const css=read(p('assets/css/v136-1-f1-card-detail-polish.css'));
for(const token of ['scale(1.075)','v113-depth-head','v96-2-neighbors{display:none']) if(!css.includes(token)) errors.push('V136.1 css missing '+token);
for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
  const s=read(p(sm)); if(!s.includes('https://88st.cloud/guaranteed/f1/')) errors.push(sm+' missing F-1 URL');
  for(const r of ['faq','consult-motives','consult-result','provider-updates']) if(s.includes('/'+r)) errors.push(sm+' contains removed route '+r);
}
const pkg=JSON.parse(read(p('package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v136-1-cloudflare-pages-safe.mjs') errors.push('package build not V136.1');
if(pkg.scripts?.verify!=='node scripts/verify-v136-1-f1-card-detail-polish.mjs') errors.push('package verify not V136.1');
for(const [name,cmd] of Object.entries(pkg.scripts||{})){
  for(const mm of cmd.matchAll(/node\s+(scripts\/[^\s&|]+\.mjs)/g)) if(!fs.existsSync(p(mm[1]))) errors.push(`package script ${name} references missing ${mm[1]}`);
}
if(errors.length){ console.error('[V136.1 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1); }
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v136-1-verify-report.json'), JSON.stringify({ok:true,version:'V136_1_F1_CARD_DETAIL_POLISH',vendors:vendors.length,generatedAt:new Date().toISOString()},null,2));
console.log('[V136.1 VERIFY PASS] F-1 card and guaranteed detail polish OK');
