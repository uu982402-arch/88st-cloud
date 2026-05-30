import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
const errors=[];
const tools=read(path.join(ROOT,'tools/index.html'));
if(!tools) errors.push('missing tools/index.html');
const modals=[...tools.matchAll(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/gi)];
if(modals.length!==1) errors.push(`expected one unified tool modal, found ${modals.length}`);
if(modals[0]){
  const modal=modals[0][0];
  for(const bad of ['<footer','moon-footer','rust-bottom-nav','v56-footer-logo','88ST.Cloud']) if(modal.toLowerCase().includes(bad.toLowerCase())) errors.push(`tool modal contains forbidden footer/nav token: ${bad}`);
  for(const req of ['data-v73-modal','data-v103-modal','data-v73-form','data-v103-form','data-v73-result-value','data-v103-result','data-v73-copy','data-v103-copy','data-v73-reset','data-v103-reset','data-v73-toast','data-v103-toast']) if(!modal.includes(req)) errors.push(`tool modal missing ${req}`);
}
if(/<\/main>\s*<button\b[^>]*v103-close/i.test(tools)) errors.push('orphan v103 close fragment remains after main');
if(/<\/main>[\s\S]{0,1200}<\/header>\s*<div class="v103-actions"/i.test(tools)) errors.push('orphan v103 modal action fragment remains after main');
const footerMatches=[...tools.matchAll(/<footer\b[\s\S]*?<\/footer>/gi)];
if(footerMatches.length!==1) errors.push(`tools footer count expected 1, found ${footerMatches.length}`);
const footerPos=tools.search(/<footer\b/i); const mainEnd=tools.search(/<\/main>/i); const bodyEnd=tools.search(/<\/body>/i); const modalPos=tools.search(/<div class="v1321-tool-modal"/i);
if(footerPos>=0 && mainEnd>=0 && footerPos<mainEnd) errors.push('tools footer appears before main ends');
if(footerPos>=0 && modalPos>=0 && footerPos<modalPos) errors.push('tools footer appears before tool modal');
if(footerPos>=0 && bodyEnd>=0 && footerPos>bodyEnd) errors.push('tools footer appears after body end');
const pkg=JSON.parse(read(path.join(ROOT,'package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v135-6-cloudflare-pages-safe.mjs') errors.push('package build is not V135.6 safe build');
for(const f of ['scripts/generate-v135-6-tool-modal-footer-fix.mjs','scripts/verify-v135-6-tool-modal-footer-fix.mjs','scripts/build-v135-6-cloudflare-pages-safe.mjs','assets/css/v135-6-tool-modal-footer-fix.css']) if(!fs.existsSync(path.join(ROOT,f))) errors.push(`missing ${f}`);
// Make sure removed routes are still absent.
for(const r of ['faq','consult-motives','consult-result','provider-updates']){
  if(fs.existsSync(path.join(ROOT,r))) errors.push(`removed route directory regenerated: ${r}`);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
    const s=read(path.join(ROOT,sm));
    if(s.includes(`/${r}`)) errors.push(`${sm} contains removed route ${r}`);
  }
}
if(errors.length){console.error('[V135.6 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1);}
const report={ok:true,version:'V135_6_TOOL_MODAL_FOOTER_FIX',modalCount:modals.length,footerCount:footerMatches.length,generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v135-6-verify-report.json'),JSON.stringify(report,null,2));
console.log('[V135.6 VERIFY PASS] tool modal/footer placement OK');
