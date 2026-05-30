import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const SITE='https://88st.cloud';
const VERSION='V135_BLOG_FULL_POST_PAGE_AUDIT_TOP_MIDDLE_BOTTOM_CLEANUP';
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(dir){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()) walk(p); else if(e.isFile()&&e.name.endsWith('.html')) out.push(p);}} if(fs.existsSync(dir)) walk(dir); return out;}
function ensureCss(html){
  const link='<link rel="stylesheet" href="/assets/css/v135-blog-full-post-page-audit.css?v=20260530" data-v135-blog-full-audit="true">';
  if(!html.includes('v135-blog-full-post-page-audit.css')) html=html.includes('</head>')?html.replace('</head>',link+'\n</head>'):link+'\n'+html;
  return html;
}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>a.includes('data-v135-blog-full-audit=')?m:`<html${a} data-v135-blog-full-audit="active">`);
  html=html.replace(/<body([^>]*)>/i,(m,a)=>a.includes('data-v135-blog-full-audit=')?m:`<body${a} data-v135-blog-full-audit="true">`);
  return ensureCss(html);
}
function removeBlocks(html, markers){
  let removed=0;
  for(const marker of markers){
    const esc=marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const rx=new RegExp(`<(?<tag>section|div|aside|nav|footer)[^>]*(?:class|id|data-[^=]+|aria-label)=["'][^"']*${esc}[^"']*["'][^>]*>[\\s\\S]*?<\\/(?<tag2>section|div|aside|nav|footer)>`,'gi');
    html=html.replace(rx,(m)=>{removed++;return `<!-- V135 removed legacy blog block -->`;});
  }
  return {html,removed};
}
function cleanupContent(html){
  let removed=0, replacements=0;
  const markers=['v90-quality-faq','v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','v73-footer-cta','v73-fab','v70-2-sticky-cta','v70-2-fab','v65-chat-bubble','v71-fab','v74-fab','related-posts','related-links','recommend-posts'];
  let r=removeBlocks(html,markers); html=r.html; removed+=r.removed;
  // FAQ / related tail generated in older blog posts
  html=html.replace(/<section[^>]*(?:class="[^"]*v90-quality-faq[^"]*"|data-v90-blog-quality="faq")[^>]*>[\s\S]*?<\/section>/gi,()=>{removed++;return '<!-- V135 removed old blog block -->';});
  html=html.replace(/<h2>\s*<\/h2>\s*<p>이 주제를 더 정확하게 보려면[\s\S]*?<\/p>\s*<a\s+href="\/tools\/"\s*>\s*<\/a>/gi,()=>{removed++;return '<!-- V135 removed old blog tail -->';});
  html=html.replace(/<p>이 주제를 더 정확하게 보려면[\s\S]*?<\/p>/gi,()=>{removed++;return '<!-- V135 removed old blog paragraph -->';});
  html=html.replace(/<h2>\s*<\/h2>/gi,()=>{removed++;return '';});
  html=html.replace(/<a\s+href="\/tools\/"\s*>\s*<\/a>/gi,()=>{removed++;return '';});
  html=html.replace(/<p>[^<]*를 따라가면 관련 도구, 보증업체 카드, 검색 가이드, 공식\.?[^<]*<\/p>/gi,()=>{replacements++;return '<p>필요한 기준은 본문 순서대로 확인할 수 있도록 정리했습니다. 한 가지 문구보다 주소, 코드, 조건, 계산값을 나눠 보는 편이 안전합니다.</p>';});
  const before=html;
  html=html
    .replace(/상담센터에서도 같은 코드로 안내된다면/g,'공식 안내에서도 같은 코드가 유지된다면')
    .replace(/상담센터에서 현재 조건이 유지되는지 확인합니다/g,'현재 조건이 유지되는지 다시 확인합니다')
    .replace(/상담 응답의 일관성/g,'공식 안내의 일관성')
    .replace(/상담 응답을 함께 보관/g,'공식 안내 내용을 함께 보관')
    .replace(/공식 상담 연결/g,'공식 안내')
    .replace(/상담 채널의 일관성/g,'공식 안내의 일관성')
    .replace(/상담 이력/g,'확인 이력')
    .replace(/상담 답변/g,'공식 안내')
    .replace(/공식 안내이/g,'공식 안내가')
    .replace(/상담 확인/g,'현재 조건 확인');
  if(before!==html) replacements++;
  // Normalize accidental duplicate V134 attributes created by prior patches
  html=html.replace(/(data-v134-blog-live-qa="(?:active|true)")\s+\1/g,'$1');
  return {html,removed,replacements};
}
function hrefTarget(h){
  if(!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) return null;
  if(h.startsWith('http')){ if(!h.startsWith(SITE)) return null; h=h.slice(SITE.length); }
  if(!h.startsWith('/')) return null;
  h=h.split('#')[0].split('?')[0];
  if(!h || h==='/') return 'index.html';
  let p=h.replace(/^\//,'');
  if(p.endsWith('/')) p+='index.html'; else if(!p.endsWith('.html')) p+='/index.html';
  return p;
}
const blogDir=path.join(ROOT,'blog');
const files=listHtml(blogDir);
const changed=[]; const audit=[];
let totalRemoved=0,totalReplacements=0;
for(const p of files){
  let html=read(p); const original=html;
  html=mark(html);
  const c=cleanupContent(html); html=c.html; totalRemoved+=c.removed; totalReplacements+=c.replacements;
  if(c.removed || c.replacements || html!==original){
    write(p,html); changed.push(rel(p));
  }
  const route='/'+rel(p).replace(/index\.html$/,'').replace(/\\/g,'/');
  audit.push({file:rel(p),route:route.endsWith('/')?route:route,removedBlocks:c.removed,textReplacements:c.replacements,hasCanonical:html.includes('rel="canonical"'),hasSchema:html.includes('application/ld+json')});
}
// Also ensure blog index has CSS marker but do not add new visual section
const blogIndex=path.join(ROOT,'blog/index.html');
if(fs.existsSync(blogIndex)){
  let s=read(blogIndex); const before=s; s=mark(s); if(s!==before){write(blogIndex,s); if(!changed.includes('blog/index.html')) changed.push('blog/index.html');}
}
// route/broken href audit for all blog hrefs
const broken=[];
for(const p of files){
  const s=read(p);
  const hrefs=[...s.matchAll(/href=["']([^"']+)["']/g)].map(m=>m[1]);
  for(const h of hrefs){ const t=hrefTarget(h); if(t && t.startsWith('blog/') && !fs.existsSync(path.join(ROOT,t))) broken.push({source:rel(p),href:h,target:t}); }
}
// sitemap consistency for blog URLs
const sitemapTxt=read(path.join(ROOT,'sitemap.txt'));
const missingFromSitemap=[];
for(const p of files){
  const r=rel(p); const url=SITE+'/'+(r.endsWith('index.html')?r.replace(/index\.html$/,''):r);
  if(!sitemapTxt.includes(url)) missingFromSitemap.push(url);
}
// ops marker
const opsP=path.join(ROOT,'ops/index.html');
if(fs.existsSync(opsP)){
  let ops=read(opsP);
  if(!ops.includes('V135 BLOG FULL POST AUDIT')){
    ops=ops.replace('</main>',`<section class="ops-card" data-v135-blog-full-audit="true"><h2>V135 BLOG FULL POST AUDIT</h2><p>blog html: ${files.length} / removed blocks: ${totalRemoved} / broken blog hrefs: ${broken.length}</p></section></main>`);
    write(opsP,ops); changed.push('ops/index.html');
  }
}
// package scripts lock
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath));
pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-blog-full-post-page-audit.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135']='node scripts/generate-v135-blog-full-post-page-audit.mjs';
pkg.scripts['verify:v135']='node scripts/verify-v135-blog-full-post-page-audit.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
// reports and manifest
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
const report={ok:true,version:VERSION,blogHtml:files.length,changedFiles:[...new Set(changed)].length,totalRemovedBlocks:totalRemoved,totalTextReplacements:totalReplacements,brokenBlogHrefs:broken,missingFromSitemap:missingFromSitemap.slice(0,50),audit,generatedAt:new Date().toISOString(),next:'V136 full blog visual/live sample QA if needed'};
write(path.join(ROOT,'reports/v135-blog-full-post-page-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-blog-full-post-page-audit.json');
write(path.join(ROOT,'reports/v135-broken-blog-route-audit.json'),JSON.stringify({ok:broken.length===0,broken,checkedFiles:files.length,generatedAt:new Date().toISOString()},null,2)); changed.push('reports/v135-broken-blog-route-audit.json');
write(path.join(ROOT,'reports/v135-remove-candidates.txt'),`V135 removed visible blog residue in HTML, not files.\nFiles scanned: ${files.length}\nRemoved legacy/FAQ/related blocks: ${totalRemoved}\nText replacements: ${totalReplacements}\nBroken blog hrefs: ${broken.length}\nNo physical deletion.\n`); changed.push('reports/v135-remove-candidates.txt');
write(path.join(ROOT,'V135_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,base:'V134 FULL',changedFiles:[...new Set(changed)].sort(),deletedFiles:[],generatedAt:new Date().toISOString()},null,2)); changed.push('V135_PATCH_MANIFEST.json');
write(path.join(ROOT,'V135_UPGRADE_REPORT.md'),`# V135 BLOG FULL POST PAGE AUDIT / TOP · MIDDLE · BOTTOM CLEANUP PATCH\n\n- Base: V134 FULL\n- Scanned blog HTML files: ${files.length}\n- Removed old FAQ/related/tools-tail/legacy conversion blocks: ${totalRemoved}\n- Replaced over-promotional consultation wording: ${totalReplacements}\n- Checked blog-internal href targets: ${broken.length} broken\n- Added common V135 blog article CSS and markers.\n- No FAQ/Q&A/trust chips/related/recommendation/bottom link sections added.\n- No physical file deletion.\n`); changed.push('V135_UPGRADE_REPORT.md');
console.log('[V135 GENERATE PASS]',JSON.stringify({ok:true,version:VERSION,blogHtml:files.length,changed:[...new Set(changed)].length,totalRemoved,totalReplacements,brokenBlogHrefs:broken.length},null,2));
