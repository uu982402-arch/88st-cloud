import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V106 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT,p),'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT,p));
const removed = ['faq','consult-motives','consult-result','provider-updates'];
const coreFiles = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html'];
for (const f of coreFiles) {
  if (!exists(f)) fail(`core file missing: ${f}`);
  const html = read(f);
  if (!html.includes('data-v106-live-qa="active"')) fail(`V106 marker missing: ${f}`);
  if (!html.includes('/assets/css/v106-live-qa-broken-link-audit.css')) fail(`V106 css missing: ${f}`);
}
for (const r of removed) {
  if (exists(r)) fail(`removed route regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    if (exists(sm) && read(sm).includes(`/${r}/`)) fail(`removed route in ${sm}: ${r}`);
  }
}
const reportPath = 'assets/data/v106-live-qa-broken-link-audit.json';
if (!exists(reportPath)) fail('V106 audit report missing');
const report = JSON.parse(read(reportPath));
if (report.broken_internal_ref_count !== 0) fail(`broken internal refs: ${report.broken_internal_ref_count}`);
if (report.core_routes.some(r => !r.exists)) fail('one or more core routes missing in V106 audit report');
// Lightweight current local link audit
const htmlFiles=[];
function walk(dir){ for(const ent of fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})){ const rel=path.join(dir,ent.name); if(ent.isDirectory()) walk(rel); else if(ent.isFile() && rel.endsWith('.html')) htmlFiles.push(rel.replace(/\\/g,'/')); }}
walk('.');
const refRe=/(?:href|src)=["']([^"']+)["']/gi;
function routeExists(target){
  if (target === '/') return exists('index.html');
  let t = target.replace(/^\//,'');
  if (target.endsWith('/')) return exists(path.join(t,'index.html'));
  if (exists(t)) return true;
  if (!path.extname(t)) return exists(t+'.html') || exists(path.join(t,'index.html'));
  return false;
}
let broken=[];
for (const f of htmlFiles) {
  const html=read(f); let m;
  while((m=refRe.exec(html))){
    const raw=m[1].trim();
    if(!raw || /^#|^mailto:|^tel:|^javascript:|^data:|^https?:\/\//i.test(raw) || raw.startsWith('//')) continue;
    let target=raw;
    if(!target.startsWith('/')){
      const base='/' + path.dirname(f).replace(/^\.$/,'').replace(/\\/g,'/') + '/';
      target=new URL(raw,'https://88st.cloud'+base).pathname;
    }
    target=target.split('#')[0].split('?')[0];
    if(!routeExists(target)) broken.push({source:f,target,raw});
  }
}
if (broken.length) fail(`local broken links found: ${JSON.stringify(broken.slice(0,5))}`);
console.log('[V106 VERIFY PASS] live QA markers, removed route lock, sitemap hygiene, and local broken-link audit passed');
