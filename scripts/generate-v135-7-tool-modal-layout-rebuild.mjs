import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V135_7_TOOL_MODAL_LAYOUT_REBUILD';
const CSS='/assets/css/v135-7-tool-modal-layout-rebuild.css?v=20260530-1';
const CSS_LINK=`<link rel="stylesheet" href="${CSS}" data-v135-7-tool-modal-layout="true">`;
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function addAttr(tag,name,value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-7-tool-modal-layout','active'));
  html=html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-7-tool-modal-layout','true'));
  return html;
}
function ensureCss(html){
  html=html.replace(/<link[^>]+v135-7-tool-modal-layout-rebuild\.css[^>]*>\s*/gi,'');
  return /<\/head>/i.test(html)?html.replace(/<\/head>/i,`${CSS_LINK}\n</head>`):`${CSS_LINK}\n${html}`;
}
const modal=`
  <div class="v1321-tool-modal" data-v1321-tool-modal data-v73-modal data-v103-modal aria-hidden="true">
    <section class="v1321-tool-panel" role="dialog" aria-modal="true" aria-labelledby="v1321-tool-title">
      <header class="v1321-tool-head">
        <div class="v1321-tool-titlebox">
          <small data-v73-modal-type data-v103-label>SMART TOOL</small>
          <h2 id="v1321-tool-title" data-v73-modal-title data-v103-title>도구 실행</h2>
        </div>
        <button class="v1321-tool-close v73-modal__close v103-close" type="button" data-v73-close data-v103-close aria-label="닫기">×</button>
      </header>
      <div class="v1321-tool-body v73-modal__body v103-modal__body">
        <div class="v1321-tool-form v73-form-grid v103-form" data-v73-form data-v103-form></div>
        <div class="v1321-tool-result v73-result v103-result">
          <strong class="v1321-tool-value v73-result__value" data-v73-result-value data-v103-result>결과 대기</strong>
          <pre class="v1321-tool-note v73-result__note" data-v73-result-note data-v103-note>도구를 열면 계산 결과가 여기에 표시됩니다.</pre>
        </div>
        <div class="v1321-tool-actions v73-modal__actions v103-actions">
          <button class="is-primary v73-action v73-action--primary" type="button" data-v73-copy data-v103-copy>결과 복사</button>
          <button class="v73-action v73-action--ghost" type="button" data-v73-reset data-v103-reset>초기화</button>
        </div>
        <p class="v1321-tool-toast v73-toast v103-toast" data-v73-toast data-v103-toast role="status" aria-live="polite"></p>
      </div>
    </section>
  </div>`;
function cleanTools(html){
  html=ensureCss(mark(html));
  const mainClose=html.match(/<\/main>/i);
  if(!mainClose) return html;
  const mainEnd=html.search(/<\/main>/i)+mainClose[0].length;
  const head=html.slice(0,mainEnd);
  let tail=html.slice(mainEnd);
  const firstCandidates=[tail.search(/<script\b/i),tail.search(/<nav\b[^>]*rust-bottom-nav/i),tail.search(/<footer\b/i)].filter(n=>n>=0);
  const keepAt=firstCandidates.length?Math.min(...firstCandidates):0;
  tail=tail.slice(keepAt);
  // Remove any broken/orphan modal pieces before scripts/nav/footer.
  tail=tail.replace(/^[\s\S]*?(?=<script\b|<nav\b[^>]*rust-bottom-nav|<footer\b|$)/i,'');
  let next=`${head}\n${modal}\n${tail}`;
  // If an old modal survived elsewhere, remove duplicate blocks and keep the first clean one after main.
  let seen=false;
  next=next.replace(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/gi,(m)=>{ if(!seen){seen=true; return modal;} return ''; });
  return next;
}
const changed=[];
const tools=path.join(ROOT,'tools/index.html');
if(!fs.existsSync(tools)){console.error('[V135.7 GENERATE FAIL] missing tools/index.html'); process.exit(1);}
let before=read(tools), after=cleanTools(before);
if(after!==before){write(tools,after); changed.push('tools/index.html');}
// Optional main marker/css only; do not touch main modal structure.
for(const file of ['index.html']){
  const fp=path.join(ROOT,file); if(!fs.existsSync(fp)) continue;
  const b=read(fp); let a=ensureCss(mark(b));
  if(a!==b){write(fp,a); changed.push(file);}
}
// Ensure package/build chain.
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath)||'{}'); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-7-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-7-tool-modal-layout-rebuild.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-7-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.7']='node scripts/generate-v135-7-tool-modal-layout-rebuild.mjs';
pkg.scripts['verify:v135.7']='node scripts/verify-v135-7-tool-modal-layout-rebuild.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
const html=read(tools);
const m=html.match(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/i);
const modalHtml=m?m[0]:'';
const issues=[];
if(!m) issues.push('missing modal');
if(modalHtml && modalHtml.indexOf('</header>')>modalHtml.indexOf('v1321-tool-body')) issues.push('modal body is inside header');
for(const bad of ['<footer','rust-bottom-nav','88ST.Cloud','moon-footer','v56-footer-logo']) if(modalHtml.toLowerCase().includes(bad.toLowerCase())) issues.push('modal contains '+bad);
for(const req of ['data-v73-close','data-v103-close','data-v73-form','data-v103-form','data-v73-result-value','data-v103-result','data-v73-copy','data-v103-copy','data-v73-reset','data-v103-reset']) if(!modalHtml.includes(req)) issues.push('modal missing '+req);
const report={ok:issues.length===0,version:VERSION,changed:[...new Set(changed)].sort(),issues,generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-7-tool-modal-layout-audit.json'),JSON.stringify(report,null,2));
const manifest={version:VERSION,base:'V135.6 TOOL MODAL FOOTER FIX',changedFiles:[...new Set([...changed,'assets/css/v135-7-tool-modal-layout-rebuild.css','scripts/generate-v135-7-tool-modal-layout-rebuild.mjs','scripts/verify-v135-7-tool-modal-layout-rebuild.mjs','scripts/build-v135-7-cloudflare-pages-safe.mjs','reports/v135-7-tool-modal-layout-audit.json','V135_7_PATCH_MANIFEST.json','V135_7_UPGRADE_REPORT.md'])].sort(),deletedFiles:[],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'V135_7_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2));
write(path.join(ROOT,'V135_7_UPGRADE_REPORT.md'),`# V135.7 TOOL MODAL LAYOUT REBUILD\n\n- Base: V135.6 FULL/PATCH state.\n- Rebuilt the /tools/ unified modal HTML so the body is outside the header.\n- Restored close button, form grid, result card, copy/reset actions, and toast area.\n- Footer/nav is forbidden inside the modal.\n- Kept existing tool logic and routing.\n- No new FAQ/Q&A/trust-chip/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\
\
\
json\n${JSON.stringify(report,null,2)}\n\
\
\
\n`);
if(issues.length){console.error('[V135.7 GENERATE FAIL]',JSON.stringify(report,null,2)); process.exit(1);} else console.log('[V135.7 GENERATE PASS]',JSON.stringify(report,null,2));
