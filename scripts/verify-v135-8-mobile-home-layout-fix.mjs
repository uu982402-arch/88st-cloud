import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
const errors=[];
const index=read(path.join(ROOT,'index.html'));
if(!index) errors.push('missing index.html');
if(!index.includes('/assets/css/v135-8-mobile-home-layout-fix.css')) errors.push('index missing V135.8 mobile CSS link');
if(!index.includes('data-v135-8-mobile-home-layout="active"')) errors.push('html missing V135.8 marker');
if(!index.includes('data-v135-8-mobile-home-layout="true"')) errors.push('body missing V135.8 marker');
for(const token of ['v81-1-hub-lane-wrap','v81-1-hub-card','v71-tools-grid','rust-bottom-nav']) if(!index.includes(token)) errors.push('index missing '+token);
const css=read(path.join(ROOT,'assets/css/v135-8-mobile-home-layout-fix.css'));
for(const req of ['@media (max-width: 760px)','overflow-x:hidden','v81-1-hub-card:nth-child(n+2)','grid-template-columns:1fr','padding-bottom:calc(118px','rust-bottom-nav']) if(!css.includes(req)) errors.push('V135.8 CSS missing '+req);
const pkg=JSON.parse(read(path.join(ROOT,'package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v135-8-cloudflare-pages-safe.mjs') errors.push('package build is not V135.8 safe build');
if(pkg.scripts?.verify!=='node scripts/verify-v135-8-mobile-home-layout-fix.mjs') errors.push('package verify is not V135.8 verify');
for(const file of ['assets/css/v135-8-mobile-home-layout-fix.css','scripts/generate-v135-8-mobile-home-layout-fix.mjs','scripts/verify-v135-8-mobile-home-layout-fix.mjs','scripts/build-v135-8-cloudflare-pages-safe.mjs']) if(!fs.existsSync(path.join(ROOT,file))) errors.push('missing '+file);
// Preserve V135.7 modal guard.
const tools=read(path.join(ROOT,'tools/index.html'));
const modalMatch=tools.match(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/i);
if(!modalMatch) errors.push('tools modal missing after V135.8');
else{
  const modal=modalMatch[0].toLowerCase();
  for(const bad of ['<footer','rust-bottom-nav','88st.cloud','moon-footer']) if(modal.includes(bad.toLowerCase())) errors.push('tool modal contains forbidden token '+bad);
}
for(const r of ['faq','consult-motives','consult-result','provider-updates']){
  if(fs.existsSync(path.join(ROOT,r))) errors.push(`removed route directory regenerated: ${r}`);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
    const s=read(path.join(ROOT,sm));
    if(s.includes('/'+r)) errors.push(`${sm} contains removed route ${r}`);
  }
}
if(errors.length){console.error('[V135.8 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1);}
const report={ok:true,version:'V135_8_MOBILE_HOME_LAYOUT_FIX',checks:['mobile css linked','home rotation overflow lock','tools grid mobile lock','bottom nav safe-area lock','tool modal footer guard preserved'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v135-8-verify-report.json'),JSON.stringify(report,null,2));
console.log('[V135.8 VERIFY PASS] mobile home layout fixed');
