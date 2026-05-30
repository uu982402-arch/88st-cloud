import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const errors=[];
function fail(m){errors.push(m)}
function read(p){return fs.existsSync(path.join(ROOT,p))?fs.readFileSync(path.join(ROOT,p),'utf8'):'';}
function exists(p){return fs.existsSync(path.join(ROOT,p));}
function listHtml(dir){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()) walk(p); else if(e.isFile()&&e.name.endsWith('.html')) out.push(path.relative(ROOT,p).replace(/\\/g,'/'));}} if(fs.existsSync(path.join(ROOT,dir))) walk(path.join(ROOT,dir)); return out;}
const required=['assets/css/v135-1-blog-dark-tone-restore.css','scripts/generate-v135-1-blog-tone-restore.mjs','scripts/verify-v135-1-blog-tone-restore.mjs','scripts/build-v135-1-cloudflare-pages-safe.mjs','V135_1_PATCH_MANIFEST.json','V135_1_UPGRADE_REPORT.md','reports/v135-1-blog-tone-restore-audit.json'];
for(const f of required) if(!exists(f)) fail(`missing V135.1 file: ${f}`);
const css=read('assets/css/v135-1-blog-dark-tone-restore.css');
for(const token of ['#06090f','rgba(15,23,42,.68)','#f8fafc','v135-blog-full-audit']) if(!css.includes(token)) fail(`V135.1 CSS missing dark restore token: ${token}`);
if(/background:\s*#f8fafc/i.test(css) || /background:\s*#fff[;!]/i.test(css)) fail('V135.1 CSS contains direct light background');
const files=listHtml('blog');
if(files.length<500) fail(`blog html count too low: ${files.length}`);
let missing=0,badOrder=0;
for(const f of files){
  const s=read(f);
  const a=s.indexOf('v135-blog-full-post-page-audit.css');
  const b=s.indexOf('v135-1-blog-dark-tone-restore.css');
  if(b<0) missing++;
  if(a>=0 && b>=0 && b<a) badOrder++;
}
if(missing) fail(`${missing} blog html missing V135.1 tone CSS`);
if(badOrder) fail(`${badOrder} blog html load V135.1 before V135`);
const sample='blog/online-sports-toto-site-recommendation-check-route/index.html';
if(exists(sample)){const s=read(sample); if(!s.includes('v135-1-blog-dark-tone-restore.css')) fail('sample blog post missing V135.1 CSS');}
const pkg=JSON.parse(read('package.json'));
if(pkg.scripts.build!=='node scripts/build-v135-1-cloudflare-pages-safe.mjs') fail('package build is not V135.1 safe build');
if(pkg.scripts.verify!=='node scripts/verify-v135-1-blog-tone-restore.mjs') fail('package verify is not V135.1 verify');
const refs=JSON.stringify(pkg.scripts||{}).match(/scripts\/[\w.\-]+\.mjs/g)||[];
for(const r of refs) if(!exists(r)) fail(`package references missing script: ${r}`);
for(const banned of ['faq','consult-motives','consult-result','provider-updates']){
  for(const p of [banned,`${banned}/index.html`,`${banned}.html`]) if(exists(p)) fail(`removed route exists: ${p}`);
  for(const f of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){ if(read(f).includes(`/${banned}`)) fail(`${f} contains removed route: ${banned}`); }
}
if(errors.length){console.error('[V135.1 VERIFY FAIL]'); for(const e of errors) console.error('-',e); process.exit(1)}
console.log('[V135.1 VERIFY PASS] blog detail dark/glass tone restored');
