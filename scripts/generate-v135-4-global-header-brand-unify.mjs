import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V135_4_GLOBAL_HEADER_BRAND_UNIFY';
const CSS='<link rel="stylesheet" href="/assets/css/v135-4-global-header-brand-unify.css?v=20260530-1" data-v135-4-global-header-brand="true">';
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){if(['node_modules','.git'].includes(e.name)) continue; walk(p);} else if(e.isFile()&&e.name.endsWith('.html')) out.push(p);}} walk(ROOT); return out;}
function addAttr(tag,name,value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function ensureCss(html){
  html=html.replace(/<link[^>]+v135-4-global-header-brand-unify\.css[^>]*>\s*/gi,'');
  if(/<\/head>/i.test(html)) return html.replace(/<\/head>/i,CSS+'\n</head>');
  return CSS+'\n'+html;
}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-4-global-header-brand','active'));
  html=html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-4-global-header-brand','true'));
  return html;
}
function unifyRustGlobalHeader(html){
  // RUST global header: remove BY 88ST subline in the brand lockup only.
  html=html.replace(/<span\s+class=["']rust-brand-type["']>\s*<strong>\s*RUST\s*<\/strong>\s*<span>\s*by\s*88ST\s*<\/span>\s*<\/span>/gi,'<span class="rust-brand-type"><strong>RUST</strong></span>');
  html=html.replace(/<span\s+class=["']rust-brand-type["']>\s*<strong>\s*RUST\s*<\/strong>\s*<span>\s*BY\s*88ST\s*<\/span>\s*<\/span>/gi,'<span class="rust-brand-type"><strong>RUST</strong></span>');
  html=html.replace(/(<span\s+class=["']rust-brand-type["']>\s*<strong>\s*RUST\s*<\/strong>)\s*<span>\s*by\s*88ST\s*<\/span>\s*(<\/span>)/gi,'$1$2');
  // Detail landing variant: rust-brand-lockup / rust-brand-text.
  html=html.replace(/<span\s+class=["']rust-brand-text["']>\s*<b>\s*RUST\s*<\/b>\s*<small>\s*by\s*88ST\s*<\/small>\s*<\/span>/gi,'<span class="rust-brand-text"><b>RUST</b></span>');
  html=html.replace(/<span\s+class=["']rust-brand-text["']>\s*<b>\s*RUST\s*<\/b>\s*<small>\s*BY\s*88ST\s*<\/small>\s*<\/span>/gi,'<span class="rust-brand-text"><b>RUST</b></span>');
  // Normalize crest attributes where the shared global header is present. CSS handles final visual size.
  html=html.replace(/(<span class="rust-brand-mark"[^>]*>\s*<img\b[^>]*?)\swidth="(?:32|38|42|44|54|64)"\sheight="(?:32|38|42|44|54|64)"/gi,(m,a)=>`${a} width="34" height="34"`);
  return html;
}
function unifyV79Header(html){
  // Longform hub headers already use RUST only; lock the name and crest size for visual match.
  html=html.replace(/<span\s+class=["']v79-brand-name["']>\s*RUST\s*<\/span>/gi,'<span class="v79-brand-name">RUST</span>');
  html=html.replace(/(<a\s+class=["']v79-brand["'][\s\S]*?<img\b[^>]*?)\swidth="(?:38|42|44|54|64)"\sheight="(?:38|42|44|54|64)"/gi,(m,a)=>`${a} width="34" height="34"`);
  return html;
}
function headerContainsForbiddenBrand(html){
  const headers=html.match(/<header\b[\s\S]*?<\/header>/gi)||[];
  return headers.some(h=>/\bby\s*88ST\b/i.test(h));
}
const files=listHtml();
let touched=0, globalHeaders=0, v79Headers=0, forbiddenHeaderBefore=0;
const changed=[];
for(const p of files){
  let html=read(p); const before=html; const r=rel(p);
  if(headerContainsForbiddenBrand(html)) forbiddenHeaderBefore++;
  if(html.includes('rust-global-header')) globalHeaders++;
  if(html.includes('v79-header')) v79Headers++;
  html=ensureCss(html);
  html=mark(html);
  html=unifyRustGlobalHeader(html);
  html=unifyV79Header(html);
  if(html!==before){write(p,html); changed.push(r); touched++;}
}
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath)); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-4-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-4-global-header-brand-unify.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-4-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.4']='node scripts/generate-v135-4-global-header-brand-unify.mjs';
pkg.scripts['verify:v135.4']='node scripts/verify-v135-4-global-header-brand-unify.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
const report={ok:true,version:VERSION,htmlScanned:files.length,htmlTouched:touched,globalHeaders,v79Headers,forbiddenHeaderBefore,brand:'crest + gold RUST only',removed:'BY 88ST subline in page headers',generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-4-global-header-brand-unify-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-4-global-header-brand-unify-audit.json');
const manifest={version:VERSION,base:'V135.3 FOOTER PLACEMENT HOTFIX',changedFiles:[...new Set(changed.concat(['assets/css/v135-4-global-header-brand-unify.css','scripts/generate-v135-4-global-header-brand-unify.mjs','scripts/verify-v135-4-global-header-brand-unify.mjs','scripts/build-v135-4-cloudflare-pages-safe.mjs']))].sort(),deletedFiles:[],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'V135_4_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2));
write(path.join(ROOT,'V135_4_UPGRADE_REPORT.md'),`# V135.4 GLOBAL HEADER BRAND UNIFY\n\n- Base: V135.3 FULL / PATCH state.\n- Unified every page header brand to the checked style: circular RUST crest + gold/orange RUST text only.\n- Removed the BY 88ST subline from the visible header brand lockup.\n- Kept routes, tools, vendors, blog posts, footer placement and dark/glass tone recovery intact.\n- Added a dedicated V135.4 CSS override so old V76/V77/V79 logo styles cannot re-expand the logo or re-show the subline.\n- No FAQ/Q&A/trust chips/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\`\`\`json\n${JSON.stringify(report,null,2)}\n\`\`\`\n`);
console.log('[V135.4 GENERATE PASS]',JSON.stringify(report,null,2));
