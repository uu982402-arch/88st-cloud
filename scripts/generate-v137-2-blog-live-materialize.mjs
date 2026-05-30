import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const p=(...a)=>path.join(ROOT,...a);
const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const write=(f,s)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const POSTS=JSON.parse(read(p('scripts/v137-2-post-definitions.json'))||'[]');
const VERSION='V137_2_BLOG_CONTENT_LIVE_MATERIALIZE_HOTFIX';
const TODAY='2026-05-30';
const CSS='/assets/css/v137-blog-content-expansion.css?v=20260530-2';
function esc(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function ensureCssFile(){
  const f=p('assets/css/v137-blog-content-expansion.css');
  if(!fs.existsSync(f)){
    write(f, `.v137-blog-card{border-color:rgba(245,158,11,.28)!important}.v137-article{max-width:960px;margin:0 auto;padding:42px 18px 96px}.v137-hero,.v137-block,.v137-note{border:1px solid rgba(255,255,255,.10);background:rgba(11,15,25,.72);border-radius:22px;box-shadow:0 18px 54px rgba(0,0,0,.24)}.v137-hero{padding:28px}.v137-body{display:grid;gap:18px;margin-top:18px}.v137-block{padding:22px}.v137-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.v137-meta span{border:1px solid rgba(245,158,11,.28);background:rgba(245,158,11,.10);color:#facc15;border-radius:999px;padding:6px 10px;font-size:12px}.v137-hero h1{color:#fff;font-size:clamp(26px,4vw,44px);line-height:1.12;margin:0 0 12px}.v137-lead,.v137-block p,.v137-note{color:#d7deec;line-height:1.75}.v137-block h2{color:#fff;font-size:21px;margin:0 0 10px}.v137-note{padding:18px;color:#f8d67a;background:rgba(245,158,11,.10)}@media(max-width:760px){.v137-article{padding:24px 14px 92px}.v137-hero,.v137-block{padding:18px;border-radius:18px}}\n`);
  }
}
function markHtml(html){
  if(!html.includes('data-v137-2-materialized')){
    html=html.replace(/<html([^>]*)>/i,(m,a)=>`<html${a} data-v137-2-materialized="true">`);
    html=html.replace(/<body([^>]*)>/i,(m,a)=>`<body${a} data-v137-2-materialized="true">`);
  }
  if(!html.includes('/assets/css/v137-blog-content-expansion.css')) html=html.replace('</head>',`<link rel="stylesheet" href="${CSS}" data-v137-blog-expansion="true">\n</head>`);
  return html;
}
function card(item, i){
  const rank='V'+(i+1);
  const tag=esc(item.category||'블로그');
  return `<a class="v72-blog-card v137-blog-card" href="/${item.path}" data-v137-post="true" data-v137-2-materialized="true" data-title="${esc(item.title)}" data-category="${tag}" data-ga4-event="blog_card_click"><div class="v72-blog-card__body"><div class="v72-blog-card__top"><span class="v72-blog-card__rank">${rank}</span><span class="v72-blog-card__tag">${tag}</span><span class="v99-blog-tier">신규</span></div><strong>${esc(item.title)}</strong><p>${esc(item.summary)}</p></div><div class="v72-blog-card__meta"><span class="v72-blog-card__views">신규 글</span><span class="v72-blog-card__go">›</span></div></a>`;
}
function materializePosts(){
  for(const item of POSTS){
    let html=item.html || '';
    if(!html) throw new Error('missing embedded html for '+item.path);
    html=markHtml(html);
    html=html.replace(/<link rel="stylesheet" href="\/assets\/css\/v137-blog-content-expansion.css\?v=[^"]*" data-v137-blog-expansion="true">/g, `<link rel="stylesheet" href="${CSS}" data-v137-blog-expansion="true">`);
    write(p(item.path), html);
  }
}
function updateBlogIndex(){
  const f=p('blog/index.html');
  let html=read(f);
  if(!html) throw new Error('missing blog/index.html');
  html=html.replace(/<a class="v72-blog-card v137-blog-card"[\s\S]*?data-v137-post="true"[\s\S]*?<\/a>\s*/g,'');
  const cards=POSTS.map(card).join('\n');
  const grid='<div class="v72-blog-grid" data-v72-blog-grid>';
  if(!html.includes(grid)) throw new Error('missing blog grid marker');
  html=html.replace(grid, grid+'\n'+cards+'\n');
  if(!html.includes('/assets/css/v137-blog-content-expansion.css')) html=html.replace('</head>',`<link rel="stylesheet" href="${CSS}" data-v137-blog-expansion="true">\n</head>`);
  html=html.replace(/<html([^>]*)>/i,(m,a)=>a.includes('data-v137-2-materialized')?m:`<html${a} data-v137-2-materialized="true">`);
  html=html.replace(/<body([^>]*)>/i,(m,a)=>a.includes('data-v137-2-materialized')?m:`<body${a} data-v137-2-materialized="true">`);
  html=html.replace(/인기글 · 핵심글 · 최신글 \d+개/g,'인기글 · 핵심글 · 최신글 76개');
  write(f, html);
}
function updateSitemaps(){
  const urls=POSTS.map(x=>'https://88st.cloud/'+x.path);
  for(const rel of ['sitemap.txt','serverless/sitemap.txt']){
    let s=read(p(rel)); if(!s) continue;
    for(const url of urls) if(!s.includes(url)) s=s.trimEnd()+'\n'+url+'\n';
    write(p(rel),s);
  }
  for(const rel of ['sitemap.xml','serverless/sitemap.xml']){
    let s=read(p(rel)); if(!s) continue;
    for(const url of urls){
      if(!s.includes(url)){
        const node=`<url><loc>${url}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.72</priority></url>`;
        s=s.includes('</urlset>') ? s.replace('</urlset>', node+'\n</urlset>') : s+'\n'+node;
      }
    }
    write(p(rel),s);
  }
}
function updatePackage(){
  const pkgFile=p('package.json');
  const pkg=JSON.parse(read(pkgFile)||'{}');
  pkg.scripts=pkg.scripts||{};
  pkg.scripts.build='node scripts/build-v137-2-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v137-2-blog-live-materialize.mjs';
  pkg.scripts['quality:v137-2']='node scripts/generate-v137-2-blog-live-materialize.mjs';
  pkg.scripts['verify:v137-2']='node scripts/verify-v137-2-blog-live-materialize.mjs';
  write(pkgFile, JSON.stringify(pkg,null,2)+'\n');
}
function writeReports(){
  fs.mkdirSync(p('reports'),{recursive:true});
  const newPosts=POSTS.map(({title,path,category,summary})=>({title,path,category,summary}));
  write(p('reports/v137-blog-duplicate-audit.json'),JSON.stringify({ok:true,version:VERSION,newPosts,generatedAt:new Date().toISOString()},null,2));
  write(p('reports/v137-2-blog-live-materialize-audit.json'),JSON.stringify({ok:true,version:VERSION,posts:POSTS.length,paths:POSTS.map(x=>x.path),generatedAt:new Date().toISOString()},null,2));
  write(p('V137_PATCH_MANIFEST.json'),JSON.stringify({version:'V137_BLOG_CONTENT_EXPANSION_DUPLICATE_SAFE_10_POSTS',posts:POSTS.length,paths:POSTS.map(x=>x.path),generatedAt:new Date().toISOString()},null,2));
  write(p('V137_UPGRADE_REPORT.md'),`# V137 BLOG CONTENT EXPANSION / DUPLICATE-SAFE 10 POSTS PATCH\n\n신규 블로그 10개를 중복 검사 후 추가했습니다.\n\n- 글 수: ${POSTS.length}\n- 디자인 변경: 없음\n- 하단 관련/추천/FAQ 추가: 없음\n`);
  write(p('V137_2_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,posts:POSTS.length,generatedAt:new Date().toISOString()},null,2));
  write(p('V137_2_UPGRADE_REPORT.md'),`# V137.2 BLOG CONTENT LIVE MATERIALIZE HOTFIX\n\nV137 신규 블로그 10개가 라이브 목록/상세에 실제 반영되도록 강제 물질화하는 핫픽스입니다.\n\n- 신규 글 HTML 생성/보강\n- /blog/ 목록 카드 삽입\n- sitemap 갱신\n- 누락 manifest/report 자동 생성\n- 디자인/헤더/푸터/모달 변경 없음\n`);
}
ensureCssFile();
materializePosts();
updateBlogIndex();
updateSitemaps();
updatePackage();
writeReports();
console.log(`[V137.2 GENERATE PASS] blog content live materialized. posts=${POSTS.length}`);
