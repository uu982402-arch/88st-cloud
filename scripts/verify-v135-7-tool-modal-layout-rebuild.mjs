import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
const errors=[];
const tools=read(path.join(ROOT,'tools/index.html'));
if(!tools) errors.push('missing tools/index.html');
const modals=[...tools.matchAll(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/gi)];
if(modals.length!==1) errors.push(`expected one v1321 tool modal, found ${modals.length}`);
if(modals[0]){
  const modal=modals[0][0];
  const headEnd=modal.indexOf('</header>');
  const bodyStart=modal.indexOf('v1321-tool-body');
  if(headEnd<0) errors.push('modal missing </header>');
  if(bodyStart<0) errors.push('modal missing body');
  if(headEnd>bodyStart) errors.push('modal body is inside header');
  for(const req of ['data-v73-modal','data-v103-modal','data-v73-close','data-v103-close','data-v73-form','data-v103-form','data-v73-result-value','data-v103-result','data-v73-copy','data-v103-copy','data-v73-reset','data-v103-reset','data-v73-toast','data-v103-toast']) if(!modal.includes(req)) errors.push(`modal missing ${req}`);
  for(const bad of ['<footer','rust-bottom-nav','88ST.Cloud','moon-footer','v56-footer-logo','v56-footer-row']) if(modal.toLowerCase().includes(bad.toLowerCase())) errors.push(`modal contains forbidden token ${bad}`);
}
if(!tools.includes('/assets/css/v135-7-tool-modal-layout-rebuild.css')) errors.push('tools page missing V135.7 CSS link');
if(!tools.includes('data-v135-7-tool-modal-layout="true"')) errors.push('tools body missing V135.7 marker');
const footerCount=(tools.match(/<footer\b/gi)||[]).length;
if(footerCount!==1) errors.push(`tools footer count expected 1, found ${footerCount}`);
const footerPos=tools.search(/<footer\b/i), mainEnd=tools.search(/<\/main>/i), modalPos=tools.search(/<div class="v1321-tool-modal"/i), bodyEnd=tools.search(/<\/body>/i);
if(footerPos>=0 && mainEnd>=0 && footerPos<mainEnd) errors.push('footer appears before </main>');
if(footerPos>=0 && modalPos>=0 && footerPos<modalPos) errors.push('footer appears before tool modal');
if(footerPos>=0 && bodyEnd>=0 && footerPos>bodyEnd) errors.push('footer appears after </body>');
const pkg=JSON.parse(read(path.join(ROOT,'package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v135-7-cloudflare-pages-safe.mjs') errors.push('package build is not V135.7 safe build');
for(const file of ['assets/css/v135-7-tool-modal-layout-rebuild.css','scripts/generate-v135-7-tool-modal-layout-rebuild.mjs','scripts/verify-v135-7-tool-modal-layout-rebuild.mjs','scripts/build-v135-7-cloudflare-pages-safe.mjs']) if(!fs.existsSync(path.join(ROOT,file))) errors.push('missing '+file);
for(const r of ['faq','consult-motives','consult-result','provider-updates']){
  if(fs.existsSync(path.join(ROOT,r))) errors.push(`removed route directory regenerated: ${r}`);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
    const s=read(path.join(ROOT,sm));
    if(s.includes('/'+r)) errors.push(`${sm} contains removed route ${r}`);
  }
}
if(errors.length){console.error('[V135.7 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1);}
const report={ok:true,version:'V135_7_TOOL_MODAL_LAYOUT_REBUILD',modalCount:modals.length,footerCount,generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v135-7-verify-report.json'),JSON.stringify(report,null,2));
console.log('[V135.7 VERIFY PASS] tool modal layout rebuilt');
