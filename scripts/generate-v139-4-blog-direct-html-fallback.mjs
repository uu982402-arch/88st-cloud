import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V139_4_BLOG_DIRECT_HTML_403_FALLBACK';
const GA4='G-KWT87FBY6S';
const problemBase='/blog/minigame/minigame-losing-streak-event-exclusion-condition-first';
const problemHtml=problemBase+'.html';
const problemClean=problemBase+'/';
const changed=new Set();
const p=(...x)=>path.join(ROOT,...x);
const rel=(x)=>path.relative(ROOT,x).replaceAll(path.sep,'/');
const read=(x)=>fs.existsSync(x)?fs.readFileSync(x,'utf8'):'';
function write(x,t){fs.mkdirSync(path.dirname(x),{recursive:true});fs.writeFileSync(x,t);changed.add(rel(x));}
function ensureGa4(h){
  if(!h.includes('name="rust-ga4-id"')&&!h.includes("name='rust-ga4-id'")) h=h.replace('</head>',`<meta name="rust-ga4-id" content="${GA4}">\n</head>`);
  if(!h.includes('/assets/js/v82.ga4-events.js')) h=h.replace('</body>','<script src="/assets/js/v82.ga4-events.js" defer></script>\n</body>');
  if(!h.includes('/assets/js/v89.ga4-event-depth.js')) h=h.replace('</body>','<script src="/assets/js/v89.ga4-event-depth.js" defer></script>\n</body>');
  return h;
}
function fixLabels(h){return h.replace(/(<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>)\s*보증\s*(<\/a>)/g,'$1보증업체$2').replace(/(<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*[^<]*?)(보증)(\s*<\/a>)/g,'$1보증업체$3');}
function setCanonical(h,route){const url='https://88st.cloud'+route; if(/<link\b[^>]+rel=["']canonical["'][^>]*>/i.test(h)) h=h.replace(/<link\b[^>]+rel=["']canonical["'][^>]*>/i,`<link rel="canonical" href="${url}">`); else h=h.replace('</head>',`<link rel="canonical" href="${url}">\n</head>`); h=h.replace(/<meta\b[^>]+property=["']og:url["'][^>]*>/i,`<meta property="og:url" content="${url}">`); h=h.split('https://88st.cloud'+problemClean).join(url).split('https://88st.cloud'+problemHtml).join(url); return h;}
let src=p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html');
if(!fs.existsSync(src)) src=p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html');
if(!fs.existsSync(src)){console.error('[V139.4 GENERATE FAIL] source article missing'); process.exit(1);}
let h=read(src); h=ensureGa4(fixLabels(setCanonical(h,problemHtml))).replace(/<meta\s+http-equiv=["']refresh["'][^>]*>\s*/ig,'');
if(!h.includes('data-v139-4-direct-html-fallback="true"')) h=h.includes('<html ')?h.replace('<html ','<html data-v139-4-direct-html-fallback="true" '):h.replace('<html>','<html data-v139-4-direct-html-fallback="true">');
write(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html'),h);
write(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'),h);
let b=read(p('blog/index.html'));
if(b){ b=b.split(problemClean).join(problemHtml); b=ensureGa4(fixLabels(b)); if(!b.includes('v139-4-blog-direct-html-fallback.css')) b=b.replace('</head>','<link rel="stylesheet" href="/assets/css/v139-4-blog-direct-html-fallback.css">\n</head>'); write(p('blog/index.html'),b); }
write(p('assets/css/v139-4-blog-direct-html-fallback.css'),'/* V139.4 direct HTML fallback: no visual change; keeps blog route hotfix traceable. */\n');
function cleanRedirects(file){let txt=read(file); if(!txt)return; const lines=txt.split(/\r?\n/).filter(line=>{const s=line.trim(); return !(s.startsWith(problemHtml+' ')||s.startsWith(problemBase+' '));}); write(file,lines.join('\n').trim()+'\n');}
cleanRedirects(p('_redirects')); if(fs.existsSync(p('serverless/_redirects'))) cleanRedirects(p('serverless/_redirects'));
let w=read(p('_worker.js')); if(w){ w=w.replace(/\s*\["\/blog\/minigame\/minigame-losing-streak-event-exclusion-condition-first\.html",\s*"\/blog\/minigame\/minigame-losing-streak-event-exclusion-condition-first\/"\],\n/g,'').replace(/\s*\["\/blog\/minigame\/minigame-losing-streak-event-exclusion-condition-first",\s*"\/blog\/minigame\/minigame-losing-streak-event-exclusion-condition-first\/"\],\n/g,'').replaceAll('V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS','V139_4_STALE_BLOG_ROUTE_REDIRECTS').replaceAll('v1393RouteHotfixRedirect','v1394StaleRouteRedirect'); write(p('_worker.js'),w); }
for(const f of ['sitemap.txt','serverless/sitemap.txt']){let txt=read(p(f)); if(!txt)continue; let lines=txt.split(/\r?\n/).filter(x=>x.trim()!=='https://88st.cloud'+problemClean); if(!lines.includes('https://88st.cloud'+problemHtml)) lines.push('https://88st.cloud'+problemHtml); write(p(f),lines.join('\n').trim()+'\n');}
for(const f of ['sitemap.xml','serverless/sitemap.xml']){let txt=read(p(f)); if(!txt)continue; const cu='https://88st.cloud'+problemClean, hu='https://88st.cloud'+problemHtml; txt=txt.replace(new RegExp('\\s*<url><loc>'+cu.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'<\\/loc><lastmod>[^<]*<\\/lastmod><\\/url>','g'),''); if(!txt.includes(`<loc>${hu}</loc>`)) txt=txt.replace('</urlset>',`  <url><loc>${hu}</loc><lastmod>2026-05-31</lastmod></url>\n</urlset>`); write(p(f),txt);}
let seo={}; try{seo=JSON.parse(read(p('assets/config/seo.meta.json'))||'{}')}catch{}; const meta={title:'미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유 | RUST 블로그',description:'미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유를 회차 독립성, 지급률, 손실한도, 정산 기준 중심으로 보강했습니다.',keywords:'미니게임 연패 위로금, 회차 제외 조건, 최소 참여금액, 신청 시간, 미니게임 롤링, RUST, 러스트, 88st.cloud, 88ST, 보증업체, 가입코드, 공식주소'}; seo[problemHtml]=seo[problemHtml]||meta; seo[problemClean]=seo[problemClean]||meta; write(p('assets/config/seo.meta.json'),JSON.stringify(seo,null,2)+'\n');
let pkg=JSON.parse(read(p('package.json'))); pkg.scripts=pkg.scripts||{}; pkg.scripts.build='node scripts/build-v139-4-cloudflare-pages-safe.mjs'; pkg.scripts.verify='node scripts/verify-v139-4-blog-direct-html-fallback.mjs'; pkg.scripts['quality:v139-4']='node scripts/generate-v139-4-blog-direct-html-fallback.mjs'; pkg.scripts['verify:v139-4']='node scripts/verify-v139-4-blog-direct-html-fallback.mjs'; write(p('package.json'),JSON.stringify(pkg,null,2)+'\n');
fs.mkdirSync(p('reports'),{recursive:true}); const audit={ok:true,version:VERSION,purpose:'Make the V9 minigame article directly serve on .html and remove redirect-to-folder risk that caused live 403.',directRoute:problemHtml,cleanDuplicate:problemClean,changedFiles:[...changed].sort(),deletedFiles:[],generatedAt:new Date().toISOString()}; write(p('reports/v139-4-blog-direct-html-fallback-audit.json'),JSON.stringify(audit,null,2)+'\n'); const manifest={version:VERSION,base:'V139.3 BLOG 403 ROUTE HOTFIX',changedFiles:[...changed].sort(),deletedFiles:[],uploadMode:'PATCH root overwrite; FULL full replacement',generatedAt:new Date().toISOString()}; write(p('V139_4_PATCH_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n'); write(p('V139_4_UPGRADE_REPORT.md'),`# ${VERSION}\n\n- Directly serves the V9 minigame article on the .html route to avoid the live redirect/folder 403 risk.\n- Keeps a clean-route duplicate, but sitemap/blog list now prefer the direct .html route.\n- Removes the V139-3 problem-route redirect from _redirects and _worker.js.\n- Keeps V139 content differentiation, GA4 coverage, and upload-resilient build chain.\n- Deleted files: 0\n`); console.log('[V139.4 GENERATE PASS]',JSON.stringify({ok:true,version:VERSION,changedFiles:changed.size,directRoute:problemHtml},null,2));
