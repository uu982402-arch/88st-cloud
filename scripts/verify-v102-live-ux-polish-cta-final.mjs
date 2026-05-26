import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const removed=['faq','consult-motives','consult-result','provider-updates'];
const core=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','admin/index.html'];
const details=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'].map(s=>`guaranteed/${s}/index.html`);
const fail=[];
const p=r=>path.join(ROOT,r);
const exists=r=>fs.existsSync(p(r));
const read=r=>fs.readFileSync(p(r),'utf8');
function bad(m){fail.push(m);}
function walk(dir='.'){
 const base=p(dir), out=[]; if(!fs.existsSync(base)) return out;
 for(const name of fs.readdirSync(base)){
  if(['node_modules','.git','.wrangler'].includes(name)) continue;
  const full=path.join(base,name), rel=path.relative(ROOT,full).replaceAll(path.sep,'/'), st=fs.statSync(full);
  if(st.isDirectory()) out.push(...walk(rel)); else out.push(rel);
 }
 return out;
}
for(const f of [...core,...details]) if(!exists(f)) bad(`required route missing: ${f}`);
for(const r of removed) if(exists(r)) bad(`removed route regenerated: ${r}`);
for(const sp of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){
 if(!exists(sp)){bad(`missing sitemap: ${sp}`); continue;}
 const s=read(sp); for(const r of removed) if(s.includes(`https://88st.cloud/${r}`)||s.includes(`/${r}/`)) bad(`${sp} contains removed route ${r}`);
}
for(const f of walk('.').filter(x=>x.endsWith('.html'))){
 const s=read(f);
 if(removed.some(r=>f===r||f.startsWith(r+'/'))) bad(`removed html included: ${f}`);
 if(!s.includes('data-v102-live-ux="true"')) bad(`${f} missing V102 head marker`);
 if(!s.includes('v102-live-ux-polish-cta-final.css')) bad(`${f} missing V102 CSS`);
 if(!s.includes('v102-live-ux-polish-cta-final.js')) bad(`${f} missing V102 JS`);
 if(/href=["']\/(faq|consult-motives|consult-result|provider-updates)(?:\/|["'#?])/.test(s)) bad(`${f} links to removed route`);
}
const idx=exists('index.html')?read('index.html'):'';
if(idx){
 if(!idx.includes('v96-3-mobile-safe-layout')) bad('index missing mobile safe layout marker');
 if(!idx.includes('v100-structure-lock-release')) bad('index missing V100 structure marker');
 if((idx.match(/data-v102-cta="home_partner_/g)||[]).length<6) bad('home partner cards not decorated with V102 CTA markers');
 if(!idx.includes('data-ga4-event="tool_open"')) bad('home tool cards missing GA4 tool_open markers');
 if(!idx.includes('data-ga4-event="mobile_bottom_nav_click"')) bad('home mobile bottom nav missing GA4 marker');
}
const guaranteed=exists('guaranteed/index.html')?read('guaranteed/index.html'):'';
if(guaranteed){
 const count=(guaranteed.match(/class="v74-1-vendor-card/g)||[]).length;
 if(count!==6) bad(`guaranteed card count expected 6, got ${count}`);
 if(guaranteed.includes('v96-5-conversion-rail')) bad('guaranteed conversion rail returned');
 if(!guaranteed.includes('data-ga4-event="vendor_detail_click"')) bad('guaranteed detail CTA missing GA4 marker');
 if(!guaranteed.includes('data-ga4-event="vendor_outbound_click"')) bad('guaranteed outbound CTA missing GA4 marker');
}
const blog=exists('blog/index.html')?read('blog/index.html'):'';
if(blog){
 if(!blog.includes('v99-blog-index-seo-quality')) bad('blog index missing V99 SEO quality marker');
 if(!blog.includes('data-ga4-event="blog_card_click"')) bad('blog cards missing GA4 marker');
}
if(!exists('assets/css/v102-live-ux-polish-cta-final.css')) bad('V102 CSS asset missing');
if(!exists('assets/js/v102-live-ux-polish-cta-final.js')) bad('V102 JS asset missing');
if(!exists('assets/data/v102-live-ux-polish-cta-final.json')) bad('V102 QA data missing');
if(exists('package.json')){
 const pkg=JSON.parse(read('package.json'));
 if(!String(pkg.scripts?.build||'').includes('generate-v102-live-ux-polish-cta-final.mjs')) bad('package build missing V102 generator');
 if(String(pkg.scripts?.verify||'')!=='node scripts/verify-v102-live-ux-polish-cta-final.mjs') bad('package verify not pointing to V102 verifier');
}
if(process.env.V102_LIVE_CHECK==='1'){
 const urls=['https://88st.cloud/','https://88st.cloud/blog/','https://88st.cloud/tools/','https://88st.cloud/guaranteed/','https://88st.cloud/guaranteed/zakum/','https://88st.cloud/consult/'];
 for(const url of urls){
  try{
   const res=await fetch(url,{redirect:'follow'});
   if(!res.ok) bad(`live check failed ${url}: ${res.status}`);
  }catch(err){ bad(`live check error ${url}: ${err.message}`); }
 }
}
if(fail.length){ console.error('[V102 verify] FAILED'); for(const m of fail) console.error(' - '+m); process.exit(1); }
console.log('[V102 verify] OK - live UX polish, CTA markers, mobile nav, removed route lock, and QA checklist are stable.');
