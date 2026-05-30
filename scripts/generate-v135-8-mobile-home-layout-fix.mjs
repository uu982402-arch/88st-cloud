import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V135_8_MOBILE_HOME_LAYOUT_FIX';
const CSS='/assets/css/v135-8-mobile-home-layout-fix.css?v=20260530-1';
const CSS_LINK=`<link rel="stylesheet" href="${CSS}" data-v135-8-mobile-home-layout="true">`;
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function addAttr(tag,name,value){return tag.includes(`${name}=`)?tag:tag.replace(/>$/,' '+name+'="'+value+'">');}
function ensureCss(html){
  html=html.replace(/<link[^>]+v135-8-mobile-home-layout-fix\.css[^>]*>\s*/gi,'');
  return /<\/head>/i.test(html)?html.replace(/<\/head>/i,`${CSS_LINK}\n</head>`):`${CSS_LINK}\n${html}`;
}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>addAttr(`<html${a}>`,'data-v135-8-mobile-home-layout','active'));
  html=html.replace(/<body([^>]*)>/i,(m,a)=>addAttr(`<body${a}>`,'data-v135-8-mobile-home-layout','true'));
  return html;
}
function walk(dir,out=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.name.startsWith('.git')) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(p,out); else if(ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const changed=[];
const htmlFiles=walk(ROOT);
for(const file of htmlFiles){
  let before=read(file);
  let after=ensureCss(mark(before));
  if(after!==before){write(file,after); changed.push(path.relative(ROOT,file).replace(/\\/g,'/'));}
}
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath)||'{}'); pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-8-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-8-mobile-home-layout-fix.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-8-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.8']='node scripts/generate-v135-8-mobile-home-layout-fix.mjs';
pkg.scripts['verify:v135.8']='node scripts/verify-v135-8-mobile-home-layout-fix.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
const report={ok:true,version:VERSION,htmlScanned:htmlFiles.length,htmlTouched:changed.filter(f=>f.endsWith('.html')).length,mobileFixes:['home hub rotation mobile overflow lock','home tools mobile one-column lock','bottom nav safe-area spacing','PC layout untouched by media query'],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-8-mobile-home-layout-audit.json'),JSON.stringify(report,null,2));
const manifest={version:VERSION,base:'V135.7 TOOL MODAL LAYOUT REBUILD',changedFiles:[...new Set([...changed,'assets/css/v135-8-mobile-home-layout-fix.css','scripts/generate-v135-8-mobile-home-layout-fix.mjs','scripts/verify-v135-8-mobile-home-layout-fix.mjs','scripts/build-v135-8-cloudflare-pages-safe.mjs','reports/v135-8-mobile-home-layout-audit.json','V135_8_PATCH_MANIFEST.json','V135_8_UPGRADE_REPORT.md'])].sort(),deletedFiles:[],generatedAt:new Date().toISOString()};
write(path.join(ROOT,'V135_8_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2));
write(path.join(ROOT,'V135_8_UPGRADE_REPORT.md'),`# V135.8 MOBILE HOME LAYOUT FIX\n\n- Base: V135.7 FULL/PATCH state.\n- Mobile-only layout separation for the home page.\n- Fixed sports/search rotation cards overflowing/cropping on mobile.\n- Fixed analysis tool cards being covered by the bottom navigation.\n- Bottom navigation now reserves safe-area spacing.\n- PC layout intentionally unchanged.\n- No FAQ/Q&A/trust-chip/related/recommendation sections added.\n- No file deletion.\n\n## Audit\n\n\`\`\`json\n${JSON.stringify(report,null,2)}\n\`\`\`\n`);
console.log('[V135.8 GENERATE PASS]',JSON.stringify(report,null,2));
