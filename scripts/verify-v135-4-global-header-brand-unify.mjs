import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const errors=[];
function fail(m){errors.push(m)}
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):''}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name)) continue; walk(p)} else if(e.isFile()&&e.name.endsWith('.html')) out.push(p)}} walk(ROOT); return out}
const required=['assets/css/v135-4-global-header-brand-unify.css','scripts/generate-v135-4-global-header-brand-unify.mjs','scripts/verify-v135-4-global-header-brand-unify.mjs','scripts/build-v135-4-cloudflare-pages-safe.mjs','V135_4_PATCH_MANIFEST.json','V135_4_UPGRADE_REPORT.md','reports/v135-4-global-header-brand-unify-audit.json'];
for(const r of required) if(!fs.existsSync(path.join(ROOT,r))) fail(`missing required file: ${r}`);
const pkg=JSON.parse(read(path.join(ROOT,'package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v135-4-cloudflare-pages-safe.mjs') fail('package build is not V135.4 safe build');
if(pkg.scripts?.verify!=='node scripts/verify-v135-4-global-header-brand-unify.mjs') fail('package verify is not V135.4 verify');
const htmlFiles=listHtml();
let cssLinked=0, headers=0, v79=0, footerCount=0;
for(const p of htmlFiles){
  const r=path.relative(ROOT,p).replace(/\\/g,'/');
  const html=read(p);
  if(!html.includes('v135-4-global-header-brand-unify.css')) fail(`${r} missing V135.4 header brand CSS`); else cssLinked++;
  if(!html.includes('data-v135-4-global-header-brand="active"')) fail(`${r} missing V135.4 html marker`);
  const pageHeaders=html.match(/<header\b[\s\S]*?<\/header>/gi)||[];
  headers += pageHeaders.length;
  if(html.includes('v79-header')) v79++;
  for(const h of pageHeaders){
    if(/\bby\s*88ST\b/i.test(h)) fail(`${r} header still contains BY 88ST subline`);
    if(h.includes('rust-global-header')){
      const okType=/<span\s+class=["']rust-brand-type["']>\s*<strong>\s*RUST\s*<\/strong>\s*<\/span>/i.test(h);
      const okLockup=/<span\s+class=["']rust-brand-text["']>\s*<b>\s*RUST\s*<\/b>\s*<\/span>/i.test(h);
      if(!okType && !okLockup) fail(`${r} rust-global-header brand is not single RUST text`);
    }
    if(h.includes('v79-header') && !/<span\s+class=["']v79-brand-name["']>\s*RUST\s*<\/span>/i.test(h)) fail(`${r} v79 header brand name missing RUST`);
  }
  footerCount += (html.match(/<footer\b/gi)||[]).length;
}
for(const forbidden of ['faq/index.html','consult-motives/index.html','consult-result/index.html','provider-updates/index.html']) if(fs.existsSync(path.join(ROOT,forbidden))) fail(`removed route regenerated: ${forbidden}`);
if(errors.length){console.error('[V135.4 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1)}
console.log(`[V135.4 VERIFY PASS] global header brand unified. html=${htmlFiles.length} css=${cssLinked} headers=${headers} v79=${v79} footers=${footerCount}`);
