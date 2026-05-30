import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V135_1_BLOG_DETAIL_TONE_RESTORE_HOTFIX';
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}
function listHtml(dir){const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()) walk(p); else if(e.isFile()&&e.name.endsWith('.html')) out.push(p);}} if(fs.existsSync(dir)) walk(dir); return out;}
const cssLink='<link rel="stylesheet" href="/assets/css/v135-1-blog-dark-tone-restore.css?v=20260530-1" data-v135-1-blog-tone="true">';
const files=listHtml(path.join(ROOT,'blog'));
const changed=[];
let linked=0, reordered=0;
for(const p of files){
  let html=read(p); const before=html;
  // Ensure V135.1 link exists after V135 CSS so it wins the cascade.
  if(!html.includes('v135-1-blog-dark-tone-restore.css')){
    if(html.includes('v135-blog-full-post-page-audit.css')){
      html=html.replace(/(<link[^>]+v135-blog-full-post-page-audit\.css[^>]*>)/i, `$1\n${cssLink}`);
    }else if(html.includes('</head>')){
      html=html.replace('</head>', `${cssLink}\n</head>`);
    }else{
      html=cssLink+'\n'+html;
    }
    linked++;
  }
  // If a future/manual edit put the link before V135, move it behind V135.
  const v135Idx=html.indexOf('v135-blog-full-post-page-audit.css');
  const v1351Idx=html.indexOf('v135-1-blog-dark-tone-restore.css');
  if(v135Idx>-1 && v1351Idx>-1 && v1351Idx<v135Idx){
    html=html.replace(/\n?<link[^>]+v135-1-blog-dark-tone-restore\.css[^>]*>/i,'');
    html=html.replace(/(<link[^>]+v135-blog-full-post-page-audit\.css[^>]*>)/i, `$1\n${cssLink}`);
    reordered++;
  }
  html=html.replace(/<html([^>]*)>/i,(m,a)=>a.includes('data-v135-1-blog-tone=')?m:`<html${a} data-v135-1-blog-tone="active">`);
  html=html.replace(/<body([^>]*)>/i,(m,a)=>a.includes('data-v135-1-blog-tone=')?m:`<body${a} data-v135-1-blog-tone="true">`);
  if(html!==before){write(p,html); changed.push(rel(p));}
}
const pkgPath=path.join(ROOT,'package.json');
const pkg=JSON.parse(read(pkgPath));
pkg.scripts=pkg.scripts||{};
pkg.scripts.build='node scripts/build-v135-1-cloudflare-pages-safe.mjs';
pkg.scripts.verify='node scripts/verify-v135-1-blog-tone-restore.mjs';
pkg.scripts['verify:deploy']='node scripts/build-v135-1-cloudflare-pages-safe.mjs';
pkg.scripts['quality:v135.1']='node scripts/generate-v135-1-blog-tone-restore.mjs';
pkg.scripts['verify:v135.1']='node scripts/verify-v135-1-blog-tone-restore.mjs';
write(pkgPath,JSON.stringify(pkg,null,2)+'\n'); changed.push('package.json');
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
const report={ok:true,version:VERSION,blogHtml:files.length,linked,reordered,changedFiles:[...new Set(changed)].length,reason:'V135 common CSS forced blog detail pages into a light theme. V135.1 restores dark/glass article tone and keeps V135 cleanup.',generatedAt:new Date().toISOString()};
write(path.join(ROOT,'reports/v135-1-blog-tone-restore-audit.json'),JSON.stringify(report,null,2)); changed.push('reports/v135-1-blog-tone-restore-audit.json');
write(path.join(ROOT,'V135_1_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,base:'V135 FULL',changedFiles:[...new Set(changed,'assets/css/v135-1-blog-dark-tone-restore.css')].sort?.()||[],deletedFiles:[],generatedAt:new Date().toISOString()},null,2));
write(path.join(ROOT,'V135_1_UPGRADE_REPORT.md'),`# V135.1 BLOG DETAIL TONE RESTORE HOTFIX\n\n- Base: V135 FULL\n- Cause: V135 common blog audit CSS overrode old blog detail dark/glass styling with light cards.\n- Fix: Add a post-loaded V135.1 CSS lock for blog detail pages.\n- Blog HTML scanned: ${files.length}\n- CSS links added: ${linked}\n- Link order corrected: ${reordered}\n- No new FAQ/Q&A/trust chips/related/recommendation sections.\n- No file deletion.\n`);
console.log('[V135.1 GENERATE PASS]',JSON.stringify(report,null,2));
