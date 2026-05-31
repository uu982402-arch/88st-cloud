import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root,...x);
const errors=[];
function need(cond,msg){ if(!cond) errors.push(msg); }
function read(file){ return fs.existsSync(file) ? fs.readFileSync(file,'utf8') : ''; }
const newRoute = '/blog/minigame-streak-exclusion-guide.html';
const newFile = p(newRoute.slice(1));
const worker = read(p('_worker.js'));
const article = read(newFile);
const index = read(p('blog/index.html'));
need(fs.existsSync(newFile), 'new top-level static V9 route missing');
need(index.includes(newRoute), 'blog index does not link to V139-8 static route');
need(article.includes('미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유'), 'new article content missing title');
need(article.includes(`https://88st.cloud${newRoute}`), 'new article canonical/absolute URL missing');
need(article.includes('rust-ga4-id') && article.includes('v82.ga4-events.js') && article.includes('v89.ga4-event-depth.js'), 'new article GA4 coverage missing');
need(worker.includes('static-growth-conversion-v139-8-20260531'), '_worker.js is not V139-8');
need(worker.includes('V139_8_ROUTE_REDIRECTS'), '_worker.js missing V139-8 redirect map');
need(!worker.includes('V139_7_DIRECT_BLOG_HTML'), '_worker.js still contains large direct inline HTML fallback');
need(!/V139_4_STALE_BLOG_ROUTE_REDIRECTS|v1394StaleRouteRedirect|V139_6_SAFE_BLOG_ROUTE_REDIRECTS|v1396SafeBlogRouteRedirect|V139_7_DIRECT_BLOG_ROUTES|v1397DirectBlogResponse/.test(worker), '_worker.js still contains old V139 route symbols');
for (const r of ['faq','consult-motives','consult-result','provider-updates']) need(!fs.existsSync(p(r)), `removed route regenerated: ${r}`);
const sitemaps = ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt'];
for (const s of sitemaps) {
  const t = read(p(s));
  if(t) {
    need(t.includes(newRoute), `${s} missing V139-8 static route`);
    need(!t.includes('/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html'), `${s} still contains old conflict .html route`);
  }
}
if (/#"|href="#/.test(worker + index + article)) errors.push('href="#" detected in V139-8 checked files');
if(errors.length){ console.error('[V139.8 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1); }
console.log('[V139.8 VERIFY PASS] static route worker safe hotfix OK');
