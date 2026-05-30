import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const errors=[];
function fail(m){errors.push(m)}
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):''}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name)) continue; walk(p)} else if(e.isFile()&&e.name.endsWith('.html')) out.push(p)}} walk(ROOT); return out}
const required=['assets/css/v135-3-footer-placement-hotfix.css','scripts/generate-v135-3-footer-placement-hotfix.mjs','scripts/verify-v135-3-footer-placement-hotfix.mjs','scripts/build-v135-3-cloudflare-pages-safe.mjs','V135_3_PATCH_MANIFEST.json','V135_3_UPGRADE_REPORT.md','reports/v135-3-footer-placement-hotfix-audit.json'];
for(const r of required) if(!fs.existsSync(path.join(ROOT,r))) fail(`missing required file: ${r}`);
const pkg=JSON.parse(read(path.join(ROOT,'package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v135-3-cloudflare-pages-safe.mjs') fail('package build is not V135.3 safe build');
if(pkg.scripts?.verify!=='node scripts/verify-v135-3-footer-placement-hotfix.mjs') fail('package verify is not V135.3 verify');
const htmlFiles=listHtml();
let footerCount=0;
for(const p of htmlFiles){
  const r=path.relative(ROOT,p).replace(/\\/g,'/');
  const html=read(p);
  const headEnd=html.search(/<\/head>/i);
  const bodyStart=html.search(/<body\b/i);
  const firstFooter=html.search(/<footer\b/i);
  const footers=(html.match(/<footer\b/gi)||[]).length;
  footerCount += footers;
  if(footers!==1) fail(`${r} footer count ${footers}, expected 1`);
  if(firstFooter>=0 && headEnd>=0 && firstFooter<headEnd) fail(`${r} footer is inside head`);
  if(firstFooter>=0 && bodyStart>=0 && firstFooter<bodyStart) fail(`${r} footer appears before body`);
  if(!html.includes('v135-3-footer-placement-hotfix.css')) fail(`${r} missing V135.3 CSS`);
  if(!html.includes('data-v135-3-footer-placement="active"')) fail(`${r} missing V135.3 html marker`);
  if(html.includes('보증업체 큐레이션, 계산 도구, 자동 상담을 연결하는 정보 플랫폼입니다')) fail(`${r} old crossed footer copy remains`);
  if((r.startsWith('sports-check/')||r.startsWith('search-guides/'))){
    const mainIdx=html.search(/<main\b/i);
    const lastMainClose=html.toLowerCase().lastIndexOf('</main>');
    if(firstFooter>=0 && mainIdx>=0 && firstFooter<mainIdx) fail(`${r} footer appears before main`);
    if(firstFooter>=0 && lastMainClose>=0 && firstFooter<lastMainClose) fail(`${r} footer appears before main close`);
  }
}
for(const forbidden of ['faq/index.html','consult-motives/index.html','consult-result/index.html','provider-updates/index.html']) if(fs.existsSync(path.join(ROOT,forbidden))) fail(`removed route regenerated: ${forbidden}`);
if(errors.length){console.error('[V135.3 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1)}
console.log(`[V135.3 VERIFY PASS] footer placement fixed. html=${htmlFiles.length} footers=${footerCount}`);
