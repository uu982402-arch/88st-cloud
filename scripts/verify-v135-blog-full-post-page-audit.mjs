import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const errors=[];
function fail(m){errors.push(m)}
function read(p){return fs.existsSync(path.join(ROOT,p))?fs.readFileSync(path.join(ROOT,p),'utf8'):'';}
function exists(p){return fs.existsSync(path.join(ROOT,p));}
function listHtml(dir){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()) walk(p); else if(e.isFile()&&e.name.endsWith('.html')) out.push(path.relative(ROOT,p).replace(/\\/g,'/'));}} if(fs.existsSync(path.join(ROOT,dir))) walk(path.join(ROOT,dir)); return out;}
function hrefTarget(h){
  const SITE='https://88st.cloud';
  if(!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) return null;
  if(h.startsWith('http')){ if(!h.startsWith(SITE)) return null; h=h.slice(SITE.length); }
  if(!h.startsWith('/')) return null;
  h=h.split('#')[0].split('?')[0];
  if(!h || h==='/') return 'index.html';
  let p=h.replace(/^\//,'');
  if(p.endsWith('/')) p+='index.html'; else if(!p.endsWith('.html')) p+='/index.html';
  return p;
}
const files=listHtml('blog');
if(files.length<500) fail(`blog html count too low: ${files.length}`);
const requiredFiles=['assets/css/v135-blog-full-post-page-audit.css','scripts/generate-v135-blog-full-post-page-audit.mjs','scripts/verify-v135-blog-full-post-page-audit.mjs','scripts/build-v135-cloudflare-pages-safe.mjs','V135_PATCH_MANIFEST.json','V135_UPGRADE_REPORT.md','reports/v135-blog-full-post-page-audit.json','reports/v135-broken-blog-route-audit.json'];
for(const f of requiredFiles) if(!exists(f)) fail(`missing V135 file: ${f}`);
const forbidden=[/v90-quality-faq/i,/data-v90-blog-quality="faq"/i,/자주 묻는 질문/,/이 주제를 더 정확하게 보려면/,/<h2>\s*<\/h2>/i,/<a\s+href="\/tools\/"\s*>\s*<\/a>/i,/같이 보면 좋은 링크/,/관련글/,/추천글/,/RUST QUICK CHECK/,/조건 상담 후 이용/,/확인 기준/];
let missingCss=0, missingMarker=0, broken=[];
for(const f of files){
  const s=read(f);
  if(!s.includes('v135-blog-full-post-page-audit.css')) missingCss++;
  if(!s.includes('data-v135-blog-full-audit')) missingMarker++;
  for(const rx of forbidden){ if(rx.test(s)) fail(`${f} forbidden residue: ${rx}`); }
  if(!s.includes('<link rel="canonical"')) fail(`${f} missing canonical`);
  const hrefs=[...s.matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]);
  for(const h of hrefs){ const t=hrefTarget(h); if(t && t.startsWith('blog/') && !exists(t)) broken.push({source:f,href:h,target:t}); }
}
if(missingCss) fail(`${missingCss} blog html missing V135 css`);
if(missingMarker) fail(`${missingMarker} blog html missing V135 marker`);
if(broken.length) fail(`broken blog hrefs: ${JSON.stringify(broken.slice(0,10))}`);
for(const banned of ['faq','consult-motives','consult-result','provider-updates']){
  for(const p of [banned,`${banned}/index.html`,`${banned}.html`]) if(exists(p)) fail(`removed route exists: ${p}`);
  for(const f of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){ if(read(f).includes(`/${banned}`)) fail(`${f} contains removed route: ${banned}`); }
}
const pkg=JSON.parse(read('package.json'));
if(pkg.scripts.build!=='node scripts/build-v135-cloudflare-pages-safe.mjs') fail('package build is not V135 safe build');
if(pkg.scripts.verify!=='node scripts/verify-v135-blog-full-post-page-audit.mjs') fail('package verify is not V135 verify');
const refs=JSON.stringify(pkg.scripts||{}).match(/scripts\/[\w.\-]+\.mjs/g)||[];
for(const r of refs) if(!exists(r)) fail(`package references missing script: ${r}`);
if(errors.length){console.error('[V135 VERIFY FAIL]'); for(const e of errors) console.error('-',e); process.exit(1)}
console.log('[V135 VERIFY PASS] blog full post page top/middle/bottom cleanup OK');
