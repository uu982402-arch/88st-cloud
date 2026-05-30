import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V135_6_TOOL_MODAL_FOOTER_FIX';
const cssHref='/assets/css/v135-6-tool-modal-footer-fix.css?v=20260530-1';
const CSS_LINK=`<link rel="stylesheet" href="${cssHref}" data-v135-6-tool-modal-footer-fix="true">`;
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name))continue; walk(p);} else if(e.isFile()&&e.name.endsWith('.html')) out.push(p);}} walk(ROOT); return out;}
function addAttr(tag,name,value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-6-tool-modal-footer-fix','active'));
  html=html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-6-tool-modal-footer-fix','true'));
  return html;
}
function ensureCss(html){
  html=html.replace(/<link[^>]+v135-6-tool-modal-footer-fix\.css[^>]*>\s*/gi,'');
  if(/<\/head>/i.test(html)) return html.replace(/<\/head>/i,`${CSS_LINK}\n</head>`);
  return `${CSS_LINK}\n${html}`;
}
const toolModal = `
  <div class="v1321-tool-modal" data-v1321-tool-modal data-v73-modal data-v103-modal aria-hidden="true">
    <section class="v1321-tool-panel" role="dialog" aria-modal="true" aria-labelledby="v1321-tool-title">
      <header class="v1321-tool-head">
        <div><small data-v73-modal-type data-v103-label>TOOL</small><h2 id="v1321-tool-title" data-v73-modal-title data-v103-title>도구 실행</h2></div>
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
function normalizeToolsPage(html){
  const before=html;
  html=ensureCss(mark(html));
  // Remove any broken or complete v1321 modal block that may have swallowed scripts/nav/footer.
  const mainEnd=html.search(/<\/main>/i);
  if(mainEnd<0) return html;
  const afterMain=mainEnd + html.match(/<\/main>/i)[0].length;
  const tail=html.slice(afterMain);
  const firstScript=tail.search(/<script\b/i);
  const firstNav=tail.search(/<nav\b[^>]*rust-bottom-nav/i);
  const firstFooter=tail.search(/<footer\b/i);
  const candidates=[firstScript, firstNav, firstFooter].filter(n=>n>=0);
  if(candidates.length){
    const cut=Math.min(...candidates);
    const suffix=tail.slice(cut);
    html=html.slice(0,afterMain)+`\n${toolModal}\n`+suffix;
  } else {
    html=html.slice(0,afterMain)+`\n${toolModal}\n`+tail;
  }
  // Guard: if any footer/nav/script was still captured inside the modal by a malformed previous state, cut modal to a clean copy.
  html=html.replace(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/i, toolModal);
  // Remove orphan fragments from prior broken modal cleanup.
  html=html.replace(/<button\b[^>]*class="[^"]*v103-close[^"]*"[^>]*>×<\/button>\s*<\/header>\s*/gi,'');
  html=html.replace(/<div class="v103-actions">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>\s*<\/div>\s*/gi,'');
  return html;
}
function scanModalIssues(html){
  const issues=[];
  const m=html.match(/<div class="v1321-tool-modal"[\s\S]*?<\/section>\s*<\/div>/i);
  if(!m){ issues.push('missing unified tool modal'); return issues; }
  const modal=m[0];
  for(const term of ['<footer','rust-bottom-nav','88ST.Cloud','v56-footer-logo','moon-footer']) if(modal.toLowerCase().includes(term.toLowerCase())) issues.push(`modal contains ${term}`);
  for(const term of ['data-v73-form','data-v103-form','data-v73-result-value','data-v103-result','data-v73-copy','data-v103-copy','data-v73-reset','data-v103-reset','data-v73-toast','data-v103-toast']) if(!modal.includes(term)) issues.push(`modal missing ${term}`);
  const footerPos=html.search(/<footer\b/i);
  const modalPos=html.search(/<div class="v1321-tool-modal"/i);
  if(footerPos>=0 && modalPos>=0 && footerPos<modalPos) issues.push('footer appears before tool modal');
  if(/<\/main>\s*<button\b[^>]*v103-close/i.test(html)) issues.push('orphan v103 close after main');
  return issues;
}

function cleanRemovedRouteSitemaps(changed){
  const removed=['/faq','/consult-motives','/consult-result','/provider-updates'];
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
    const fp=path.join(ROOT,sm);
    if(!fs.existsSync(fp)) continue;
    const before=read(fp);
    let after=before.split(/\r?\n/).filter(line=>!removed.some(r=>line.includes(`https://88st.cloud${r}`)||line.includes(`<loc>https://88st.cloud${r}`)||line.includes(r+'/'))).join('\n');
    if(before.endsWith('\n')) after+='\n';
    if(after!==before){write(fp,after); changed.push(sm);}
  }
}

// CSS hard-lock: even if old footer markup leaks into modal on a partial deploy, hide it and keep panel usable.
write(path.join(ROOT,'assets/css/v135-6-tool-modal-footer-fix.css'),`/* V135.6: tool modal/footer placement recovery */\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-modal footer,\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-modal .moon-footer,\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-modal .rust-bottom-nav,\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-modal .v56-footer-row{display:none!important;}\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-modal{position:fixed!important;inset:0!important;z-index:9100!important;align-items:center;justify-content:center;padding:18px;background:rgba(2,6,23,.72)!important;backdrop-filter:blur(20px) saturate(130%)!important;-webkit-backdrop-filter:blur(20px) saturate(130%)!important;}\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-panel{width:min(640px,calc(100% - 28px));max-height:min(84vh,720px);overflow:auto;border-radius:22px;border:1px solid rgba(255,255,255,.14)!important;background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(2,6,23,.96))!important;color:#f8fafc!important;box-shadow:0 32px 110px rgba(0,0,0,.48)!important;}\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-body{padding:16px 18px 18px;display:grid;gap:14px;background:transparent!important;}\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-form{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-result{border:1px solid rgba(251,191,36,.22)!important;background:linear-gradient(180deg,rgba(251,191,36,.10),rgba(255,255,255,.035))!important;border-radius:18px;padding:14px;}\nhtml[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-note{white-space:pre-wrap;word-break:break-word;margin:8px 0 0;color:rgba(226,232,240,.86)!important;font-family:inherit;font-size:13px;line-height:1.55;}\n@media(max-width:720px){html[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-modal{padding:0!important;align-items:flex-end!important;}html[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-panel{width:100%;max-height:86vh;border-radius:22px 22px 0 0;border-bottom:0;}html[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-form{grid-template-columns:1fr;}html[data-v135-6-tool-modal-footer-fix="active"] .v1321-tool-body{padding:14px 16px calc(18px + env(safe-area-inset-bottom));}}\n`);
const changed=['assets/css/v135-6-tool-modal-footer-fix.css'];
let toolsFixed=false;
const toolsPath=path.join(ROOT,'tools/index.html');
if(fs.existsSync(toolsPath)){
  const before=read(toolsPath);
  const after=normalizeToolsPage(before);
  if(after!==before){write(toolsPath,after);changed.push('tools/index.html');toolsFixed=true;}
}
// Add CSS marker to all HTML for emergency hiding only; don't touch layout elsewhere.
let cssLinked=0;
for(const p of listHtml()){
  let html=read(p); const before=html;
  html=ensureCss(mark(html));
  if(html!==before){write(p,html); changed.push(rel(p)); cssLinked++;}
}
// Re-normalize tools after global marker insertion.
if(fs.existsSync(toolsPath)){
  const before=read(toolsPath);
  const after=normalizeToolsPage(before);
  if(after!==before){write(toolsPath,after); if(!changed.includes('tools/index.html'))changed.push('tools/index.html'); toolsFixed=true;}
}
cleanRemovedRouteSitemaps(changed);
const toolsHtml=read(toolsPath);
const modalIssues=scanModalIssues(toolsHtml);
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath)||'{}'); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-6-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-6-tool-modal-footer-fix.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-6-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.6']='node scripts/generate-v135-6-tool-modal-footer-fix.mjs';
pkg.scripts['verify:v135.6']='node scripts/verify-v135-6-tool-modal-footer-fix.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
const report={ok:modalIssues.length===0,version:VERSION,toolsFixed,htmlCssMarked:cssLinked,modalIssues,generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-6-tool-modal-footer-fix-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-6-tool-modal-footer-fix-audit.json');
const manifest={version:VERSION,base:'V135.5 BLOG HEADER DARK LOCK',changedFiles:[...new Set(changed.concat(['scripts/generate-v135-6-tool-modal-footer-fix.mjs','scripts/verify-v135-6-tool-modal-footer-fix.mjs','scripts/build-v135-6-cloudflare-pages-safe.mjs','V135_6_PATCH_MANIFEST.json','V135_6_UPGRADE_REPORT.md']))].sort(),deletedFiles:[],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'V135_6_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2));
write(path.join(ROOT,'V135_6_UPGRADE_REPORT.md'),`# V135.6 TOOL MODAL / FOOTER PLACEMENT HOTFIX\n\n- Base: V135.5 FULL/PATCH state.\n- Fixed the tools modal where the canonical footer/nav could appear inside the modal body.\n- Rebuilt /tools/ modal HTML as one clean unified modal for V73/V103 tools.\n- Footer remains only at the document bottom, never inside the tool modal.\n- Added a CSS guard that hides footer/nav only if a partial deploy leaks it into .v1321-tool-modal.\n- No FAQ/Q&A/trust chips/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\`\`\`json\n${JSON.stringify(report,null,2)}\n\`\`\`\n`);
if(modalIssues.length){console.error('[V135.6 GENERATE FAIL]',JSON.stringify(report,null,2));process.exit(1);} else console.log('[V135.6 GENERATE PASS]',JSON.stringify(report,null,2));
