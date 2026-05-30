import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const errors=[];
function fail(m){errors.push(m)}
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):''}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name)) continue; walk(p)} else if(e.isFile()&&e.name.endsWith('.html')) out.push(p)}} walk(ROOT); return out}
const required=['assets/css/v135-5-blog-header-dark-lock.css','assets/css/v135-blog-full-post-page-audit.css','scripts/generate-v135-5-blog-header-dark-lock.mjs','scripts/verify-v135-5-blog-header-dark-lock.mjs','scripts/build-v135-5-cloudflare-pages-safe.mjs','V135_5_PATCH_MANIFEST.json','V135_5_UPGRADE_REPORT.md','reports/v135-5-blog-header-dark-lock-audit.json'];
for(const r of required) if(!fs.existsSync(path.join(ROOT,r))) fail(`missing required file: ${r}`);
const pkg=JSON.parse(read(path.join(ROOT,'package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v135-5-cloudflare-pages-safe.mjs') fail('package build is not V135.5 safe build');
if(pkg.scripts?.verify!=='node scripts/verify-v135-5-blog-header-dark-lock.mjs') fail('package verify is not V135.5 verify');
const oldCss=read(path.join(ROOT,'assets/css/v135-blog-full-post-page-audit.css'));
for(const token of ['background:#f8fafc','background: #f8fafc','background:#fff','background: #fff','color:#111827','color: #111827']){
  if(oldCss.includes(token)) fail(`old V135 blog audit CSS still contains white/light token: ${token}`);
}
const htmlFiles=listHtml();
let css=0, oldLinks=0, brandBad=0, blogPages=0;
for(const p of htmlFiles){
  const r=path.relative(ROOT,p).replace(/\\/g,'/');
  const html=read(p);
  if(!html.includes('v135-5-blog-header-dark-lock.css')) fail(`${r} missing V135.5 dark lock CSS`); else css++;
  if(!html.includes('data-v135-5-blog-header-dark-lock="active"')) fail(`${r} missing V135.5 html marker`);
  if(/v135-blog-full-post-page-audit\.css/i.test(html)){ oldLinks++; fail(`${r} still links old V135 white/gray blog audit CSS`); }
  const headers=html.match(/<header\b[\s\S]*?<\/header>/gi)||[];
  for(const h of headers){ if(/RUST\s+by\s+88ST/i.test(h)){ brandBad++; fail(`${r} header still contains RUST by 88ST`); } }
  if(/^blog\//.test(r) || r==='blog/index.html'){
    blogPages++;
    if(/background:\s*#f8fafc|background:\s*#fff|background:\s*#ffffff/i.test(html)) fail(`${r} contains inline white blog background`);
  }
}
for(const forbidden of ['faq/index.html','consult-motives/index.html','consult-result/index.html','provider-updates/index.html']) if(fs.existsSync(path.join(ROOT,forbidden))) fail(`removed route regenerated: ${forbidden}`);
if(errors.length){console.error('[V135.5 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1)}
console.log(`[V135.5 VERIFY PASS] blog/header dark lock OK. html=${htmlFiles.length} css=${css} blog=${blogPages} oldLinks=${oldLinks} brandBad=${brandBad}`);
