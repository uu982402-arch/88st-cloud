import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'V139_3_BLOG_403_ROUTE_HOTFIX';
function p(...parts){ return path.join(ROOT, ...parts); }
function read(f){ return fs.existsSync(f) ? fs.readFileSync(f,'utf8') : ''; }
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const fp = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(!['node_modules','.git'].includes(ent.name)) walk(fp,out);
    } else if(ent.isFile() && ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}
const errors = [];
const required = [
  'scripts/build-v139-3-cloudflare-pages-safe.mjs',
  'scripts/generate-v139-3-blog-403-route-hotfix.mjs',
  'scripts/verify-v139-3-blog-403-route-hotfix.mjs',
  'reports/v139-3-blog-403-route-hotfix-audit.json',
  'V139_3_PATCH_MANIFEST.json',
  'V139_3_UPGRADE_REPORT.md',
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html',
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html',
  'blog/queenbee-telegram-seoa69.html'
];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing ' + f);
let pkg = null;
try { pkg = JSON.parse(read(p('package.json'))); } catch { errors.push('package.json unreadable'); }
if(pkg){
  if(pkg.scripts?.build !== 'node scripts/build-v139-3-cloudflare-pages-safe.mjs') errors.push('package build not V139.3');
  if(pkg.scripts?.verify !== 'node scripts/verify-v139-3-blog-403-route-hotfix.mjs') errors.push('package verify not V139.3');
}
const problemHtmlRoute = '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html';
const problemCleanRoute = '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/';
const queenRoute = '/blog/queenbee-telegram-seoa69.html';
const queenTarget = '/search-guides/queenbee-seoa-code.html';
const blogIndex = read(p('blog/index.html'));
if(blogIndex.includes(problemHtmlRoute)) errors.push('blog index still links to direct .html 403 route');
if(!blogIndex.includes(problemCleanRoute)) errors.push('blog index missing clean route link');
const clean = read(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'));
if(!clean.includes(`https://88st.cloud${problemCleanRoute}`)) errors.push('clean route canonical not set');
if(!clean.includes('v82.ga4-events.js') || !clean.includes('v89.ga4-event-depth.js') || !clean.includes('rust-ga4-id')) errors.push('clean route GA4 incomplete');
if(!clean.includes('data-v139-blog-quality="active"')) errors.push('clean route missing V139 flag');
const direct = read(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html'));
if(!direct.includes('v82.ga4-events.js') || !direct.includes('v89.ga4-event-depth.js') || !direct.includes('rust-ga4-id')) errors.push('direct route GA4 incomplete');
const queen = read(p('blog/queenbee-telegram-seoa69.html'));
if(!queen.includes('noindex,follow') || !queen.includes(queenTarget) || !queen.includes('v82.ga4-events.js') || !queen.includes('rust-ga4-id')) errors.push('queenbee stale safe page incomplete');
const worker = read(p('_worker.js'));
if(!worker.includes('V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS')) errors.push('worker missing V139.3 redirect map');
if(!worker.includes(problemHtmlRoute) || !worker.includes(queenRoute)) errors.push('worker missing problem/stale route redirect');
for(const rfile of ['_redirects','serverless/_redirects']){
  const r = read(p(rfile));
  if(!r.includes(`${problemHtmlRoute} ${problemCleanRoute} 301`)) errors.push(rfile + ' missing problem html redirect');
  if(!r.includes(`${queenRoute} ${queenTarget} 301`)) errors.push(rfile + ' missing queen stale redirect');
}
for(const sm of ['sitemap.txt','serverless/sitemap.txt']){
  const t = read(p(sm));
  if(t.includes('https://88st.cloud' + problemHtmlRoute)) errors.push(sm + ' still contains problem html URL');
  if(t.includes('https://88st.cloud' + queenRoute)) errors.push(sm + ' contains stale queen URL');
  if(!t.includes('https://88st.cloud' + problemCleanRoute)) errors.push(sm + ' missing clean URL');
}
for(const sm of ['sitemap.xml','serverless/sitemap.xml']){
  const t = read(p(sm));
  if(t.includes('https://88st.cloud' + problemHtmlRoute)) errors.push(sm + ' still contains problem html URL');
  if(t.includes('https://88st.cloud' + queenRoute)) errors.push(sm + ' contains stale queen URL');
  if(!t.includes('https://88st.cloud' + problemCleanRoute)) errors.push(sm + ' missing clean URL');
}
let seo = {};
try { seo = JSON.parse(read(p('assets/config/seo.meta.json'))); } catch { errors.push('seo.meta.json unreadable'); }
if(!seo[problemCleanRoute]) errors.push('seo missing clean route');
if(!seo[problemHtmlRoute]) errors.push('seo missing direct route compatibility entry');
if(!seo[queenRoute]) errors.push('seo missing queen stale entry');
const allHtml = walk(ROOT);
let hrefSharp = [];
let ga4BlogMissing = [];
for(const fp of allHtml){
  const rel = path.relative(ROOT, fp).replace(/\\/g,'/');
  const h = read(fp);
  if(/href\s*=\s*["']#["']/i.test(h)) hrefSharp.push(rel);
  if(rel.startsWith('blog/') && (!h.includes('v82.ga4-events.js') || !h.includes('v89.ga4-event-depth.js') || !h.includes('rust-ga4-id'))) ga4BlogMissing.push(rel);
}
if(hrefSharp.length) errors.push('href="#" remains: ' + hrefSharp.slice(0,5).join(', '));
if(ga4BlogMissing.length) errors.push('blog GA4 missing: ' + ga4BlogMissing.slice(0,5).join(', '));
for(const route of ['faq','consult-motives','consult-result','provider-updates']){
  if(fs.existsSync(p(route))) errors.push('removed route directory regenerated: ' + route);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
    if(read(p(sm)).includes('/' + route + '/')) errors.push(sm + ' contains removed route ' + route);
  }
}
let audit = null;
try { audit = JSON.parse(read(p('reports/v139-3-blog-403-route-hotfix-audit.json'))); } catch { errors.push('audit unreadable'); }
if(audit && (audit.version !== VERSION || !audit.ok)) errors.push('audit invalid');
if(audit && audit.deletedFiles?.length) errors.push('deletedFiles not empty');
if(errors.length){
  console.error('[V139.3 VERIFY FAIL]');
  for(const e of errors) console.error('- ' + e);
  process.exit(1);
}
fs.mkdirSync(p('reports'), {recursive:true});
fs.writeFileSync(p('reports/v139-3-verify-report.json'), JSON.stringify({ok:true, version:VERSION, htmlFiles:allHtml.length, checkedProblemRoute:true, generatedAt:new Date().toISOString()}, null, 2));
console.log('[V139.3 VERIFY PASS] blog 403 route hotfix OK', JSON.stringify({htmlFiles:allHtml.length, cleanRoute:problemCleanRoute}, null, 2));
