import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V137_BLOG_CONTENT_EXPANSION_DUPLICATE_SAFE_10_POSTS';
const p=(...a)=>path.join(ROOT,...a);
const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const write=(f,s)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const reportPath=p('reports/v137-blog-duplicate-audit.json');
let report={ok:true,version:VERSION,newPosts:[]};
try{ report=JSON.parse(read(reportPath)||'{}'); }catch{}
const posts=report.newPosts||[];
function ensureCss(html){
  if(!html.includes('/assets/css/v137-blog-content-expansion.css')){
    html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/v137-blog-content-expansion.css?v=20260530-1" data-v137-blog-expansion="true">\n</head>');
  }
  html=html.replace(/<html([^>]*)>/i,(m,a)=>a.includes('data-v137-blog-expansion')?m:`<html${a} data-v137-blog-expansion="active">`);
  html=html.replace(/<body([^>]*)>/i,(m,a)=>a.includes('data-v137-blog-expansion')?m:`<body${a} data-v137-blog-expansion="true">`);
  return html;
}
let touched=0;
for(const item of posts){
  const file=p(item.path);
  if(!fs.existsSync(file)) continue;
  const before=read(file);
  const after=ensureCss(before);
  if(after!==before){write(file,after); touched++;}
}
const idx=p('blog/index.html');
if(fs.existsSync(idx)){
  const before=read(idx); const after=ensureCss(before);
  if(after!==before){write(idx,after); touched++;}
}

// Keep Cloudflare build pointed to V137 after older base generators run.
const pkgFile=p('package.json');
try{
  const pkg=JSON.parse(read(pkgFile)||'{}');
  pkg.scripts=pkg.scripts||{};
  pkg.scripts.build='node scripts/build-v137-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v137-blog-content-expansion.mjs';
  pkg.scripts['quality:v137']='node scripts/generate-v137-blog-content-expansion.mjs';
  pkg.scripts['verify:v137']='node scripts/verify-v137-blog-content-expansion.mjs';
  write(pkgFile, JSON.stringify(pkg,null,2)+'\n');
}catch(e){ console.error('[V137 GENERATE FAIL] package update failed', e); process.exit(1); }

fs.mkdirSync(p('reports'),{recursive:true});
write(p('reports/v137-generate-report.json'), JSON.stringify({ok:true,version:VERSION,touched,newPosts:posts.length,generatedAt:new Date().toISOString()},null,2));
console.log(`[V137 GENERATE PASS] duplicate-safe blog content expansion. posts=${posts.length} touched=${touched}`);
