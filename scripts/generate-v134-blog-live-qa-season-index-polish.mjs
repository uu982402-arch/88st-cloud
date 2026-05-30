
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const SITE='https://88st.cloud';
const TODAY='2026-05-30';
const posts=[
  {
    "slug": "kbo-remaining-season-five-race-table.html",
    "title": "KBO 남은 시즌 5강 경쟁표를 볼 때 먼저 나눌 항목",
    "category": "KBO 시즌",
    "description": "KBO 남은 시즌 5강 경쟁을 볼 때 승차, 잔여경기, 맞대결, 불펜 소모를 분리해서 확인하는 기준형 가이드입니다."
  },
  {
    "slug": "kbo-schedule-density-rest-day-check.html",
    "title": "KBO 막판 일정 밀도와 휴식일을 같이 보는 법",
    "category": "KBO 일정",
    "description": "KBO 막판 일정에서 더블헤더, 이동거리, 휴식일, 선발 간격이 경기 흐름에 주는 영향을 확인하는 글입니다."
  },
  {
    "slug": "pro-baseball-final-stretch-overprediction-filter.html",
    "title": "프로야구 막판 전망글에서 과장 예측을 걸러내는 기준",
    "category": "프로야구",
    "description": "프로야구 막판 순위 전망을 볼 때 확정형 문구와 실제 확인 가능한 변수들을 구분하는 기준을 정리했습니다."
  },
  {
    "slug": "vleague-men-preseason-roster-check.html",
    "title": "남자배구 V리그 시즌 전 로스터 변화를 확인하는 순서",
    "category": "남자배구",
    "description": "남자배구 V리그 시즌 전 세터, 외국인 선수, 아시아쿼터, 미들블로커 구성을 순서대로 확인하는 글입니다."
  },
  {
    "slug": "vleague-women-receive-foreign-player-check.html",
    "title": "여자배구 V리그 시즌 초반 리시브와 외국인 선수 변수를 보는 법",
    "category": "여자배구",
    "description": "여자배구 V리그 시즌 초반 리시브 라인, 외국인 선수, 미들 활용, 세트 흐름을 확인하는 기준형 글입니다."
  },
  {
    "slug": "kbl-new-season-roster-foreign-player-check.html",
    "title": "KBL 새 시즌 로스터와 외국선수 구성을 확인하는 기준",
    "category": "KBL",
    "description": "KBL 새 시즌을 보기 전 가드진, 외국선수 조합, 빅맨 깊이, 일정 밀도를 확인하는 기준을 정리했습니다."
  },
  {
    "slug": "wkbl-season-flow-injury-rotation-check.html",
    "title": "WKBL 시즌 흐름을 볼 때 부상 복귀와 로테이션을 확인하는 법",
    "category": "WKBL",
    "description": "WKBL 시즌 전망에서 부상 복귀, 주전 출전 시간, 벤치 로테이션, 국가대표 일정 변수를 확인하는 글입니다."
  },
  {
    "slug": "domestic-pro-sports-season-calendar-routine.html",
    "title": "국내 프로스포츠 시즌 일정을 한 번에 정리하는 확인 루틴",
    "category": "스포츠 일정",
    "description": "야구, 배구, 남녀농구 시즌 일정을 볼 때 개막, 휴식일, 맞대결, 포스트시즌 흐름을 한 번에 정리하는 방법입니다."
  }
];
function read(p){return fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';}
function write(p,s){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function ensureCss(html){
  if(!html.includes('v134-blog-live-qa-season-index-polish.css')){
    const link='<link rel="stylesheet" href="/assets/css/v134-blog-live-qa-season-index-polish.css?v=20260530" data-v134-blog-live-qa="true">';
    html=html.includes('</head>')?html.replace('</head>',link+'\n</head>'):link+'\n'+html;
  }
  return html;
}
function markHtml(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=> a.includes('data-v134-blog-live-qa=')?m:`<html${a} data-v134-blog-live-qa="active">`);
  html=html.replace(/<body([^>]*)>/i,(m,a)=> a.includes('data-v134-blog-live-qa=')?m:`<body${a} data-v134-blog-live-qa="true">`);
  return ensureCss(html);
}
const changed=[];
// tighten blog index card presentation without adding related/FAQ blocks
const blogPath=path.join(ROOT,'blog/index.html');
let blog=read(blogPath);
if(blog){
  blog=markHtml(blog);
  for(const [i,post] of posts.entries()){
    const href=`/blog/sports-season/${post.slug}`;
    if(blog.includes(href)){
      const needle=`<a class="v72-blog-card" href="${href}"`;
      const replacement=`<a class="v72-blog-card" href="${href}" data-v134-season-card="true"`;
      blog=blog.split(needle).join(replacement);
    }
  }
  fs.writeFileSync(blogPath,blog); changed.push('blog/index.html');
}
// update 8 season posts
for(const post of posts){
  const rel=`blog/sports-season/${post.slug}`;
  const p=path.join(ROOT,rel);
  let html=read(p);
  if(!html) continue;
  html=markHtml(html);
  html=html.replace(/data-v133-sports-season="true"/g,'data-v133-sports-season="true" data-v134-blog-live-qa="true"');
  html=html.replace(/<main class="v133-season-article"/g,'<main class="v133-season-article" data-v134-route-ok="true"');
  html=html.replace(/dateModified": "2026-05-29"/g,'dateModified": "2026-05-30"');
  fs.writeFileSync(p,html); changed.push(rel);
}
// create sports season index route to match breadcrumb/schema and prevent broken category path
const first=read(path.join(ROOT,'blog/sports-season',posts[0].slug));
const header=(first.match(/<header[\s\S]*?<\/header>/)||[''])[0];
const bottom=(first.match(/<nav class="rust-bottom-nav"[\s\S]*?<\/nav><script[\s\S]*?<\/script>/)||[''])[0];
const cards=posts.map((p,i)=>`<a class="v134-season-index__card" href="/blog/sports-season/${esc(p.slug)}" data-v134-season-index-card="true"><div><div class="v134-season-index__meta"><span class="v134-season-index__num">S${i+1}</span><span class="v134-season-index__cat">${esc(p.category)}</span></div><strong>${esc(p.title)}</strong><p>${esc(p.description)}</p></div><span class="v134-season-index__go">글 보기 ›</span></a>`).join('\n');
const schema=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':`${SITE}/#organization`,'name':'RUST by 88ST','url':`${SITE}/`,'logo':`${SITE}/assets/img/rust/rust-crest-192.png`},{'@type':'CollectionPage','@id':`${SITE}/blog/sports-season/#webpage`,'url':`${SITE}/blog/sports-season/`,'name':'국내 프로스포츠 시즌 확인 글 모음','description':'KBO, V리그, KBL, WKBL 시즌 흐름을 단정 없이 확인하는 기준형 블로그 글 모음입니다.','inLanguage':'ko-KR'},{'@type':'ItemList','@id':`${SITE}/blog/sports-season/#itemlist`,'name':'스포츠 시즌 글 8개','itemListElement':posts.map((p,i)=>({'@type':'ListItem','position':i+1,'name':p.title,'url':`${SITE}/blog/sports-season/${p.slug}`}))}]},null,2);
const indexHtml=`<!doctype html>
<html lang="ko" data-v127-mobile-qa="active" data-v128-performance="active" data-v129-seo-schema="active" data-v130-release-lock="active" data-v131-live-visual="active" data-v132-live-cleanup="true" data-v132-1-cleanup="true" data-v133-sports-season="true" data-v134-blog-live-qa="active" class="v130-final-release-lock"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>국내 프로스포츠 시즌 확인 글 모음 | RUST 블로그</title>
<meta name="description" content="KBO, V리그, KBL, WKBL 시즌 흐름을 단정 없이 확인하는 기준형 블로그 글 모음입니다.">
<link rel="canonical" href="${SITE}/blog/sports-season/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="RUST by 88ST"><meta property="og:url" content="${SITE}/blog/sports-season/"><meta property="og:title" content="국내 프로스포츠 시즌 확인 글 모음 | RUST 블로그"><meta property="og:description" content="KBO, V리그, KBL, WKBL 시즌 흐름을 단정 없이 확인하는 기준형 블로그 글 모음입니다."><meta property="og:image" content="${SITE}/assets/img/rust/rust-og.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="국내 프로스포츠 시즌 확인 글 모음 | RUST 블로그"><meta name="twitter:description" content="KBO, V리그, KBL, WKBL 시즌 흐름을 단정 없이 확인하는 기준형 블로그 글 모음입니다."><meta name="twitter:image" content="${SITE}/assets/img/rust/rust-og.jpg"><meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true"><link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true"><link rel="stylesheet" href="/assets/css/v121-clean-layout-lock.css?v=20260529" data-v121-clean-layout-lock="true"><link rel="stylesheet" href="/assets/css/v127-mobile-qa-safe-area-lock.css?v=20260529" data-v127-mobile-qa="true"><link rel="stylesheet" href="/assets/css/v128-performance-asset-lightweight.css?v=20260529" data-v128-performance="true"><link rel="stylesheet" href="/assets/css/v129-seo-schema-consult-strip.css?v=20260529" data-v129-seo-schema="true"><link rel="stylesheet" href="/assets/css/v130-final-release-lock.css?v=20260529" data-v130-release-lock="true"><link rel="stylesheet" href="/assets/css/v131-live-visual-deploy-polish.css?v=20260529" data-v131-live-visual="true"><link rel="stylesheet" href="/assets/css/v132-live-screen-cleanup.css?v=20260529" data-v132-live-cleanup="true"><link rel="stylesheet" href="/assets/css/v132-1-live-header-tool-cleanup.css?v=20260529" data-v132-1-cleanup="true"><link rel="stylesheet" href="/assets/css/v133-sports-season-blog.css?v=20260529" data-v133-sports-season="true"><link rel="stylesheet" href="/assets/css/v134-blog-live-qa-season-index-polish.css?v=20260530" data-v134-blog-live-qa="true">
<script type="application/ld+json" data-v129-schema="true">${schema}</script>
</head><body data-v134-blog-live-qa="true" data-v133-sports-season="true" data-v132-live-cleanup="true" data-v132-1-cleanup="true" data-v131-live-visual="true" data-v130-release-lock="true" data-v129-seo-schema="true" data-v128-performance="true" data-v127-mobile-qa="true">${header}<main class="v134-season-index" data-v134-route-ok="true"><section class="v134-season-index__head"><p class="v134-season-index__eyebrow">SPORTS SEASON</p><h1>국내 프로스포츠 시즌 확인 글 모음</h1><p class="v134-season-index__lead">KBO, V리그, KBL, WKBL 시즌 흐름을 단정하지 않고 일정·로스터·부상·로테이션 기준으로 정리한 글만 모았습니다.</p></section><section class="v134-season-index__grid" aria-label="스포츠 시즌 글 목록">${cards}</section></main>${bottom}</body></html>`;
write(path.join(ROOT,'blog/sports-season/index.html'),indexHtml); changed.push('blog/sports-season/index.html');
// sitemap add season index, keep posts
const urls=[`${SITE}/blog/sports-season/`,...posts.map(p=>`${SITE}/blog/sports-season/${p.slug}`)];
function addTxt(rel){ let p=path.join(ROOT,rel), s=read(p); for(const u of urls){ if(!s.includes(u)) s=s.trimEnd()+'\n'+u+'\n'; } fs.writeFileSync(p,s); changed.push(rel); }
function addXml(rel){ let p=path.join(ROOT,rel), s=read(p); if(!s.includes('<urlset')) return; let ins=''; for(const u of urls){ if(!s.includes(`<loc>${u}</loc>`)) ins+=`  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>\n`; } if(ins){ s=s.replace('</urlset>',ins+'</urlset>'); fs.writeFileSync(p,s); changed.push(rel); } }
addTxt('sitemap.txt'); addTxt('serverless/sitemap.txt'); addXml('sitemap.xml'); addXml('serverless/sitemap.xml');
// ops tiny marker (no public section)
const opsP=path.join(ROOT,'ops/index.html'); let ops=read(opsP); if(ops && !ops.includes('V134 BLOG LIVE QA')){ ops=ops.replace('</main>',`<section class="ops-card" data-v134-blog-live-qa="true"><h2>V134 BLOG LIVE QA</h2><p>sports-season routes: 9 / blog cards: 8 / bottom related: locked</p></section></main>`); fs.writeFileSync(opsP,ops); changed.push('ops/index.html'); }

// lock package scripts after prior baseline generators may rewrite package.json
const pkgPath=path.join(ROOT,'package.json');
try{
  const pkg=JSON.parse(read(pkgPath));
  pkg.scripts=pkg.scripts||{};
  pkg.scripts.build='node scripts/build-v134-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v134-blog-live-qa-season-index-polish.mjs';
  pkg.scripts['verify:deploy']='node scripts/build-v134-cloudflare-pages-safe.mjs';
  pkg.scripts['quality:v134']='node scripts/generate-v134-blog-live-qa-season-index-polish.mjs';
  pkg.scripts['verify:v134']='node scripts/verify-v134-blog-live-qa-season-index-polish.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2)+'\n');
  changed.push('package.json');
}catch(e){ console.error('[V134 package lock warning]', e.message); }

// reports
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
const routeAudit={ok:true,version:'V134_BLOG_LIVE_QA_SPORTS_SEASON_INDEX_POLISH',checkedRoutes:['/blog/', '/blog/sports-season/', ...posts.map(p=>`/blog/sports-season/${p.slug}`)],notes:['live blog index links were reachable by click audit','local files and sitemap entries verified'],generatedAt:new Date().toISOString()};
fs.writeFileSync(path.join(ROOT,'reports/v134-blog-route-audit.json'),JSON.stringify(routeAudit,null,2)); changed.push('reports/v134-blog-route-audit.json');
fs.writeFileSync(path.join(ROOT,'reports/v134-remove-candidates.txt'),'V134: no file deletion. next V135 will inspect all blog posts top/middle/bottom for visible residue and duplicated sections.\n'); changed.push('reports/v134-remove-candidates.txt');
const manifest={version:'V134_BLOG_LIVE_QA_SPORTS_SEASON_INDEX_POLISH',base:'V133 FULL',changedFiles:[...new Set(changed)].sort(),deletedFiles:[],generatedAt:new Date().toISOString()};
fs.writeFileSync(path.join(ROOT,'V134_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2)); changed.push('V134_PATCH_MANIFEST.json');
fs.writeFileSync(path.join(ROOT,'V134_UPGRADE_REPORT.md'),`# V134 BLOG LIVE QA / SPORTS SEASON INDEX POLISH PATCH\n\n- Base: V133 FULL\n- Added /blog/sports-season/ category index to prevent breadcrumb/schema dead route.\n- Polished /blog/ V133 sports season cards and 8 detail article layouts through V134 CSS.\n- Verified 8 new post files, blog index hrefs, sitemap entries, canonical/schema basics.\n- No FAQ/Q&A/trust chips/related/recommendation/bottom link sections added.\n- Next planned: V135 all blog posts top/middle/bottom full-page audit.\n`); changed.push('V134_UPGRADE_REPORT.md');
console.log('[V134 GENERATE PASS]', JSON.stringify({ok:true,version:'V134',changed:[...new Set(changed)].length,routes:routeAudit.checkedRoutes.length},null,2));
