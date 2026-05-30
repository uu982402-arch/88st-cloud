import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V135_5_BLOG_HEADER_DARK_LOCK';
const CSS='<link rel="stylesheet" href="/assets/css/v135-5-blog-header-dark-lock.css?v=20260530-1" data-v135-5-blog-header-dark-lock="true">';
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name)) continue; walk(p);} else if(e.isFile()&&e.name.endsWith('.html')) out.push(p);}} walk(ROOT); return out;}
function addAttr(tag,name,value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function ensureCss(html){
  html=html.replace(/<link[^>]+v135-5-blog-header-dark-lock\.css[^>]*>\s*/gi,'');
  // V135 white/gray audit CSS is removed from pages; file is overwritten to dark-only for safety.
  html=html.replace(/<link[^>]+v135-blog-full-post-page-audit\.css[^>]*>\s*/gi,'');
  return /<\/head>/i.test(html)?html.replace(/<\/head>/i, CSS+'\n</head>'):CSS+'\n'+html;
}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-5-blog-header-dark-lock','active'));
  html=html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-5-blog-header-dark-lock','true'));
  return html;
}
function normalizeBrand(html){
  html=html.replace(/RUST\s+by\s+88ST/gi,'RUST');
  html=html.replace(/RUST\s+BY\s+88ST/gi,'RUST');
  html=html.replace(/<span\s+class=["']rust-brand-type["']>\s*<strong>\s*RUST\s*<\/strong>\s*<span>[^<]*<\/span>\s*<\/span>/gi,'<span class="rust-brand-type"><strong>RUST</strong></span>');
  html=html.replace(/<span\s+class=["']rust-brand-text["']>\s*<b>\s*RUST\s*<\/b>\s*<small>[^<]*<\/small>\s*<\/span>/gi,'<span class="rust-brand-text"><b>RUST</b></span>');
  html=html.replace(/(<span class="rust-brand-mark"[^>]*>\s*<img\b[^>]*?)\swidth="(?:32|34|38|42|44|54|64)"\sheight="(?:32|34|38|42|44|54|64)"/gi,(m,a)=>`${a} width="34" height="34"`);
  return html;
}
function cleanOldVisibleHeaderDupes(html){
  // Keep canonical rust-global-header; old duplicated V71/V72 top bars are only tolerated when hidden by previous cleanup.
  html=html.replace(/<header\b[^>]*(?:v71-topbar|v70-2-header|moon-header|v68-header|v67-header)[\s\S]*?<\/header>\s*/gi,'');
  html=html.replace(/<nav\b[^>]*(?:v71-mobile-nav|v70-2-mobile-nav|v73-mobile-nav|v74-mobile-nav)[\s\S]*?<\/nav>\s*/gi,'');
  return html;
}
const files=listHtml();
let touched=0, removedOldAuditLinks=0, blogPages=0, brandRewrites=0;
const changed=[];
for(const p of files){
  let html=read(p); const before=html; const r=rel(p);
  if(/(^|\/)blog\//.test(r) || r==='blog/index.html') blogPages++;
  if(/v135-blog-full-post-page-audit\.css/i.test(html)) removedOldAuditLinks++;
  if(/RUST\s+by\s+88ST/i.test(html)) brandRewrites++;
  html=ensureCss(html);
  html=mark(html);
  html=normalizeBrand(html);
  html=cleanOldVisibleHeaderDupes(html);
  if(html!==before){write(p,html); changed.push(r); touched++;}
}
// Ensure the old CSS file cannot bring back white/gray even if a cached page links it.
const oldCssPath=path.join(ROOT,'assets/css/v135-blog-full-post-page-audit.css');
write(oldCssPath,`/* V135.5 override: previous V135 blog audit white/gray surface removed. */\nhtml[data-v135-blog-full-audit="active"]{scroll-padding-top:84px;background:#05070b!important;color:#f8fafc!important;color-scheme:dark!important;}\nhtml[data-v135-blog-full-audit="active"] body{overflow-x:hidden;background:#05070b!important;color:#f8fafc!important;}\nhtml[data-v135-blog-full-audit="active"] .v82-longform-hero,html[data-v135-blog-full-audit="active"] .v82-longform-body,html[data-v135-blog-full-audit="active"] .v133-season-hero,html[data-v135-blog-full-audit="active"] .v133-season-body,html[data-v135-blog-full-audit="active"] .v133-season-block{background:linear-gradient(180deg,rgba(17,24,39,.86),rgba(15,23,42,.74))!important;border:1px solid rgba(255,255,255,.10)!important;color:#f8fafc!important;border-radius:24px;box-shadow:0 20px 70px rgba(0,0,0,.28)!important;}\nhtml[data-v135-blog-full-audit="active"] h1,html[data-v135-blog-full-audit="active"] h2,html[data-v135-blog-full-audit="active"] h3{color:#f8fafc!important;}\nhtml[data-v135-blog-full-audit="active"] p,html[data-v135-blog-full-audit="active"] li{color:rgba(226,232,240,.86)!important;}\n`);
changed.push('assets/css/v135-blog-full-post-page-audit.css');
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath)||'{}'); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-5-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-5-blog-header-dark-lock.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-5-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.5']='node scripts/generate-v135-5-blog-header-dark-lock.mjs';
pkg.scripts['verify:v135.5']='node scripts/verify-v135-5-blog-header-dark-lock.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
const report={ok:true,version:VERSION,htmlScanned:files.length,htmlTouched:touched,blogPages,removedOldAuditLinks,brandRewrites,whiteGrayBlogCss:'overwritten-dark-only',generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-5-blog-header-dark-lock-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-5-blog-header-dark-lock-audit.json');
const manifest={version:VERSION,base:'V135.4 GLOBAL HEADER BRAND UNIFY',changedFiles:[...new Set(changed.concat(['assets/css/v135-5-blog-header-dark-lock.css','scripts/generate-v135-5-blog-header-dark-lock.mjs','scripts/verify-v135-5-blog-header-dark-lock.mjs','scripts/build-v135-5-cloudflare-pages-safe.mjs','V135_5_PATCH_MANIFEST.json','V135_5_UPGRADE_REPORT.md']))].sort(),deletedFiles:[],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'V135_5_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2));
write(path.join(ROOT,'V135_5_UPGRADE_REPORT.md'),`# V135.5 BLOG HEADER DARK LOCK\n\n- Base: V135.4 FULL / PATCH state.\n- Fixed /blog/ header tone break caused by the V135 blog audit CSS.\n- Removed the white/gray blog audit CSS link from HTML and overwrote the old file with dark-only rules.\n- Re-locked every page header brand to RUST only.\n- Removed visible RUST by 88ST header/site-name remnants.\n- Kept footer placement and route structure intact.\n- No FAQ/Q&A/trust chips/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\`\`\`json\n${JSON.stringify(report,null,2)}\n\`\`\`\n`);
console.log('[V135.5 GENERATE PASS]',JSON.stringify(report,null,2));
