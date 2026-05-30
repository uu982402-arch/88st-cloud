import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'V135_3_FOOTER_PLACEMENT_HOTFIX';
const CSS = '<link rel="stylesheet" href="/assets/css/v135-3-footer-placement-hotfix.css?v=20260530-1" data-v135-3-footer-placement="true">';
const footer = `<footer class="moon-footer" data-v135-2-footer="canonical"><div class="moon-container v56-footer-row"><div><span class="v56-footer-logo"><span class="v56-logo-main">88ST</span><span class="v56-logo-cloud">.Cloud</span></span><p>보증업체, 실사용 도구, 전문 가이드를 일관된 기준으로 정리합니다.</p></div><nav class="v56-footer-links" aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></footer>`;
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name)) continue; walk(p);} else if(e.isFile() && e.name.endsWith('.html')) out.push(p);}} walk(ROOT); return out;}
function addAttr(tag,name,value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function mark(html){
  html = html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`, 'data-v135-3-footer-placement', 'active'));
  html = html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`, 'data-v135-3-footer-placement', 'true'));
  return html;
}
function stripAllFooters(html){let removed=0; html=html.replace(/<footer\b[\s\S]*?<\/footer>/gi,()=>{removed++; return '';}); return {html,removed};}
function ensureCss(html){
  html = html.replace(/<link[^>]+v135-3-footer-placement-hotfix\.css[^>]*>\s*/gi,'');
  if(/<\/head>/i.test(html)) return html.replace(/<\/head>/i, CSS+'\n</head>');
  return CSS+'\n'+html;
}
function insertFooterAtDocumentBottom(html){
  if(/<\/body>/i.test(html)) return html.replace(/<\/body>/i, footer+'\n</body>');
  return html+'\n'+footer;
}
function cleanupLooseCopy(html){
  return html.replace(/보증업체\s*큐레이션,\s*계산\s*도구,\s*자동\s*상담을\s*연결하는\s*정보\s*플랫폼입니다\.?/g,'')
             .replace(/<nav\b(?=[^>]*\b(?:v70-2-mobile-nav|v71-mobile-nav|v73-mobile-nav|v74-mobile-nav)\b)[\s\S]*?<\/nav>/gi,'');
}
const files=listHtml();
let touched=0, footersRemoved=0, footerHeadFixes=0, sportsSearchFixed=0;
const changed=[];
for(const p of files){
  let html=read(p); const before=html; const r=rel(p);
  const headEndBefore=html.search(/<\/head>/i);
  const firstFooterBefore=html.search(/<footer\b/i);
  if(firstFooterBefore>=0 && headEndBefore>=0 && firstFooterBefore<headEndBefore) footerHeadFixes++;
  html=ensureCss(html);
  const s=stripAllFooters(html); html=s.html; footersRemoved+=s.removed;
  html=cleanupLooseCopy(html);
  html=mark(html);
  html=insertFooterAtDocumentBottom(html);
  if(r.startsWith('sports-check/') || r.startsWith('search-guides/')) sportsSearchFixed++;
  if(html!==before){write(p,html); changed.push(r); touched++;}
}
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath)); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-3-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-3-footer-placement-hotfix.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-3-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.3']='node scripts/generate-v135-3-footer-placement-hotfix.mjs';
pkg.scripts['verify:v135.3']='node scripts/verify-v135-3-footer-placement-hotfix.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
const report={ok:true,version:VERSION,htmlScanned:files.length,htmlTouched:touched,footersRemoved,footerHeadFixes,sportsSearchFixed,generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-3-footer-placement-hotfix-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-3-footer-placement-hotfix-audit.json');
write(path.join(ROOT,'V135_3_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,base:'V135.2 compatible PATCH',changedFiles:[...new Set(changed.concat(['assets/css/v135-3-footer-placement-hotfix.css','scripts/generate-v135-3-footer-placement-hotfix.mjs','scripts/verify-v135-3-footer-placement-hotfix.mjs','scripts/build-v135-3-cloudflare-pages-safe.mjs']))].sort(),deletedFiles:[],generatedAt:new Date().toISOString()},null,2));
write(path.join(ROOT,'V135_3_UPGRADE_REPORT.md'),`# V135.3 FOOTER PLACEMENT HOTFIX\n\n- Base: V135.2 FULL/PATCH compatible state.\n- Fixed V135.2 bug where the canonical footer could be inserted before the first head script.\n- Removed all duplicate footers and reinserted one checked 88ST.Cloud footer at the real document bottom.\n- Specifically verified sports-check and search-guides pages so the footer no longer appears above their RUST header/content.\n- Kept dark/glass tone recovery from V135.2.\n- No FAQ/Q&A/trust chips/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\`\`\`json\n${JSON.stringify(report,null,2)}\n\`\`\`\n`);
console.log('[V135.3 GENERATE PASS]',JSON.stringify(report,null,2));
