import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const p=(...a)=>path.join(ROOT,...a);
const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const errors=[];
const report=JSON.parse(read(p('reports/v137-blog-duplicate-audit.json'))||'{}');
const posts=report.newPosts||[];
if(posts.length!==10) errors.push(`expected 10 new posts, got ${posts.length}`);
for(const f of ['assets/css/v137-blog-content-expansion.css','scripts/build-v137-cloudflare-pages-safe.mjs','scripts/generate-v137-blog-content-expansion.mjs','scripts/verify-v137-blog-content-expansion.mjs','V137_PATCH_MANIFEST.json','V137_UPGRADE_REPORT.md','reports/v137-blog-duplicate-audit.json']){
  if(!fs.existsSync(p(f))) errors.push('missing '+f);
}
const titles=new Set(); const slugs=new Set();
for(const item of posts){
  const file=p(item.path);
  const html=read(file);
  if(!html) {errors.push('missing new post '+item.path); continue;}
  if(!html.includes('data-v137-blog-expansion')) errors.push(item.path+' missing V137 marker');
  if(!html.includes('/assets/css/v137-blog-content-expansion.css')) errors.push(item.path+' missing V137 css');
  if(!html.includes('<footer class="moon-footer"')) errors.push(item.path+' missing canonical footer');
  if((html.match(/<footer class="moon-footer"/g)||[]).length!==1) errors.push(item.path+' footer count not exactly one');
  for(const bad of ['FAQ','자주 묻는 질문','관련글','추천글','관련 링크','같이 보면 좋은','신뢰칩','확인 기준 박스','Q&A 스니펫']) if(html.includes(bad)) errors.push(item.path+' forbidden content marker '+bad);
  const m=html.match(/<title>(.*?)<\/title>/i); if(m){ const clean=m[1].replace(/\s*\|\s*RUST 블로그\s*$/,'').trim(); if(titles.has(clean)) errors.push('duplicate new title '+clean); titles.add(clean); }
  if(slugs.has(item.path)) errors.push('duplicate new slug '+item.path); slugs.add(item.path);
  const main=html.indexOf('<main'); const footer=html.indexOf('<footer class="moon-footer"'); if(footer>=0 && main>=0 && footer<main) errors.push(item.path+' footer before main');
}
const blog=read(p('blog/index.html'));
for(const item of posts){ if(!blog.includes('/'+item.path)) errors.push('blog index missing '+item.path); }
if(!blog.includes('/assets/css/v137-blog-content-expansion.css')) errors.push('blog index missing V137 css');
for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
  const s=read(p(sm)); if(!s) {errors.push('missing '+sm); continue;}
  for(const item of posts){ const url='https://88st.cloud/'+item.path; if(!s.includes(url)) errors.push(sm+' missing '+url); }
  for(const r of ['faq','consult-motives','consult-result','provider-updates']) if(s.includes('/'+r)) errors.push(sm+' contains removed route '+r);
}
// Check no exact title duplicate against all blog html.
const allTitles=new Map();
function walk(dir){ let out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const fp=path.join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(fp)); else if(fp.endsWith('.html')) out.push(fp); } return out; }
for(const file of walk(p('blog'))){
  const h=read(file); const m=h.match(/<title>(.*?)<\/title>/i); if(!m) continue;
  const t=m[1].replace(/\s*\|\s*RUST 블로그\s*$/,'').trim();
  const rel=path.relative(ROOT,file).replaceAll('\\','/');
  if(allTitles.has(t)) errors.push(`duplicate title: ${t} (${allTitles.get(t)} / ${rel})`); else allTitles.set(t,rel);
}
const pkg=JSON.parse(read(p('package.json'))||'{}');
if(pkg.scripts?.build!=='node scripts/build-v137-cloudflare-pages-safe.mjs') errors.push('package build not V137');
if(pkg.scripts?.verify!=='node scripts/verify-v137-blog-content-expansion.mjs') errors.push('package verify not V137');
for(const [name,cmd] of Object.entries(pkg.scripts||{})){
  for(const mm of cmd.matchAll(/node\s+(scripts\/[^\s&|]+\.mjs)/g)) if(!fs.existsSync(p(mm[1]))) errors.push(`package script ${name} references missing ${mm[1]}`);
}
if(errors.length){ console.error('[V137 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1); }
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v137-verify-report.json'),JSON.stringify({ok:true,version:'V137_BLOG_CONTENT_EXPANSION_DUPLICATE_SAFE_10_POSTS',newPosts:posts.length,blogHtml:walk(p('blog')).length,generatedAt:new Date().toISOString()},null,2));
console.log('[V137 VERIFY PASS] duplicate-safe 10 blog posts OK');
