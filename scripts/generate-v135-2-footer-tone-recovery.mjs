import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'V135_2_GLOBAL_FOOTER_TONE_RECOVERY';
const CSS = '<link rel="stylesheet" href="/assets/css/v135-2-global-footer-tone-recovery.css?v=20260530-3" data-v135-2-tone-footer="true">';
const footer = `<footer class="moon-footer" data-v135-2-footer="canonical"><div class="moon-container v56-footer-row"><div><span class="v56-footer-logo"><span class="v56-logo-main">88ST</span><span class="v56-logo-cloud">.Cloud</span></span><p>보증업체, 실사용 도구, 전문 가이드를 일관된 기준으로 정리합니다.</p></div><nav class="v56-footer-links" aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></footer>`;
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(e.name==='node_modules') continue; walk(p);} else if(e.isFile() && e.name.endsWith('.html')) out.push(p);}} walk(ROOT); return out;}
function addAttr(tag, name, value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function markPage(html, pageType){
  html = html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-2-visual-recovery','active'));
  html = html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-2-visual-recovery','true'));
  if(pageType){
    html = html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-2-tone-page',pageType));
    html = html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-2-tone-page',pageType));
  }
  return html;
}
function pageTypeFromRel(r){
  if(r==='sports-check/index.html' || r.startsWith('sports-check/')) return 'sports-check';
  if(r==='search-guides/index.html' || r.startsWith('search-guides/')) return 'search-guides';
  if(r==='tools/index.html' || r.startsWith('tools/')) return 'tools';
  return '';
}
function insertFooter(html){
  // V135.3 safety: never insert footer before head scripts. Footer must live at document bottom.
  if(/<\/body>/i.test(html)) return html.replace(/<\/body>/i, footer+'\n</body>');
  return html+'\n'+footer;
}
function stripDuplicateFooters(html){
  let removed=0;
  html = html.replace(/<footer\b[\s\S]*?<\/footer>/gi,()=>{removed++; return '';});
  return {html, removed};
}
function stripLegacyMobileNav(html){
  let removed=0;
  html = html.replace(/<nav\b(?=[^>]*\b(?:v70-2-mobile-nav|v71-mobile-nav|v73-mobile-nav|v74-mobile-nav)\b)[\s\S]*?<\/nav>/gi,()=>{removed++; return '';});
  return {html, removed};
}
const files=listHtml();
let cssAdded=0, footersRemoved=0, mobileNavRemoved=0, touched=0, toneMarked=0;
const changed=[];
for(const p of files){
  const r=rel(p); let html=read(p); const before=html;
  if(!html.includes('v135-2-global-footer-tone-recovery.css')){
    if(html.includes('</head>')) html=html.replace('</head>',CSS+'\n</head>'); else html=CSS+'\n'+html;
    cssAdded++;
  }
  const s1=stripDuplicateFooters(html); html=s1.html; footersRemoved+=s1.removed;
  const s2=stripLegacyMobileNav(html); html=s2.html; mobileNavRemoved+=s2.removed;
  const pt=pageTypeFromRel(r); if(pt){toneMarked++;}
  html=markPage(html,pt);
  html=insertFooter(html);
  // Remove crossed-out/footer duplicate copy in loose text if any survived outside footer.
  html=html.replace(/보증업체\s*큐레이션,\s*계산\s*도구,\s*자동\s*상담을\s*연결하는\s*정보\s*플랫폼입니다\.?/g,'');
  if(html!==before){write(p,html); changed.push(r); touched++;}
}
const pkgPath=path.join(ROOT,'package.json'); const pkg=JSON.parse(read(pkgPath)); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-2-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-2-footer-tone-recovery.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-2-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.2']='node scripts/generate-v135-2-footer-tone-recovery.mjs';
pkg.scripts['verify:v135.2']='node scripts/verify-v135-2-footer-tone-recovery.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
const report={ok:true,version:VERSION,htmlScanned:files.length,htmlTouched:touched,cssAdded,footersRemoved,mobileNavRemoved,toneMarked,targets:['all footers','blog detail tone','sports-check pages','search-guides pages','tools modal'],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-2-footer-tone-recovery-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-2-footer-tone-recovery-audit.json');
write(path.join(ROOT,'V135_2_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,base:'V135.1/V135 compatible PATCH',changedFiles:[...new Set(changed.concat(['assets/css/v135-2-global-footer-tone-recovery.css','scripts/generate-v135-2-footer-tone-recovery.mjs','scripts/verify-v135-2-footer-tone-recovery.mjs','scripts/build-v135-2-cloudflare-pages-safe.mjs']))].sort(),deletedFiles:[],generatedAt:new Date().toISOString()},null,2));
write(path.join(ROOT,'V135_2_UPGRADE_REPORT.md'),`# V135.2 GLOBAL FOOTER / BLOG HUB TOOL TONE RECOVERY\n\n- Base: V135.1 FULL, PATCH compatible with V135+ live state.\n- Restored dark/glass tone for blog detail pages.\n- Recovered common dark tone for sports-check and search-guides pages.\n- Recovered dark/glass styling for the whole tools modal.\n- Replaced duplicate footers with the checked single 88ST.Cloud footer.\n- Removed crossed-out old footer copy and legacy mobile nav duplication.\n- No FAQ/Q&A/trust chips/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\
\
\
json\n${JSON.stringify(report,null,2)}\n\
\
\
\n`);
console.log('[V135.2 GENERATE PASS]',JSON.stringify(report,null,2));
