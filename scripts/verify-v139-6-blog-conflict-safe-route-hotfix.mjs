import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const ROOT = process.cwd();
const p=(...parts)=>path.join(ROOT,...parts);
const read=fp=>fs.existsSync(fp)?fs.readFileSync(fp,'utf8'):'';
const errors=[]; const fail=m=>errors.push(m);
const OLD_HTML='/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html';
const OLD_CLEAN='/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/';
const NEW_ROUTE='/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html';
const newArticle=read(p(NEW_ROUTE.slice(1)));
if(!newArticle) fail('new safe V9 article missing');
for(const token of ['data-v139-6-conflict-safe-route','rust-ga4-id','/assets/js/v82.ga4-events.js','/assets/js/v89.ga4-event-depth.js',`https://88st.cloud${NEW_ROUTE}`]) if(!newArticle.includes(token)) fail('new V9 safe article missing '+token);
const idx=read(p('blog/index.html'));
if(!idx.includes(`href="${NEW_ROUTE}"`)) fail('blog index does not link safe V9 route');
if(idx.includes(`href="${OLD_HTML}"`) || idx.includes(`href="${OLD_CLEAN}"`)) fail('blog index still links old conflict V9 route');
const worker=read(p('_worker.js'));
function count(s,t){return (s.match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;}
if(count(worker,'V139_6_SAFE_BLOG_ROUTE_REDIRECTS') !== 2) fail('V139.6 worker map token count invalid');
if(count(worker,'v1396SafeBlogRouteRedirect') !== 2) fail('V139.6 worker function token count invalid');
for(const bad of ['V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS','v1393RouteHotfixRedirect','V139_4_STALE_BLOG_ROUTE_REDIRECTS','v1394StaleRouteRedirect','V139_5_SAFE_BLOG_ROUTE_REDIRECTS','v1395SafeBlogRouteRedirect']) if(worker.includes(bad)) fail('old worker redirect token remained: '+bad);
if(!worker.includes(`["${OLD_HTML}", "${NEW_ROUTE}"]`)) fail('worker missing old html to safe route redirect');
const check=spawnSync(process.execPath,['--check','_worker.js'],{cwd:ROOT,encoding:'utf8'}); if(check.status!==0) fail('node --check _worker.js failed: '+(check.stderr||check.stdout||''));
const redirects=read(p('_redirects'));
if(!redirects.includes(`${OLD_HTML} ${NEW_ROUTE} 301`)) fail('_redirects missing old html to safe route redirect');
for(const rel of ['sitemap.xml','serverless/sitemap.xml','sitemap.txt','serverless/sitemap.txt']){const t=read(p(rel)); if(!t.includes('https://88st.cloud'+NEW_ROUTE)) fail(rel+' missing safe route'); if(t.includes('https://88st.cloud'+OLD_HTML)) fail(rel+' still contains old conflict route');}
const pkg=JSON.parse(read(p('package.json'))||'{}');
if(pkg.scripts?.build !== 'node scripts/build-v139-6-cloudflare-pages-safe.mjs') fail('package build not v139-6');
if(pkg.scripts?.verify !== 'node scripts/verify-v139-6-blog-conflict-safe-route-hotfix.mjs') fail('package verify not v139-6');
let hrefSharp=[]; function walk(d){for(const ent of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','.git'].includes(ent.name)) continue; const fp=path.join(d,ent.name); if(ent.isDirectory()) walk(fp); else if(ent.isFile()&&ent.name.endsWith('.html')){if(/href=["']#["']/.test(read(fp))) hrefSharp.push(path.relative(ROOT,fp).replaceAll(path.sep,'/'));}}}
walk(ROOT); if(hrefSharp.length) fail('href="#" remained: '+hrefSharp.slice(0,8).join(', '));
for(const bad of ['faq','consult-motives','consult-result','provider-updates']) if(fs.existsSync(p(bad))) fail('removed route regenerated: '+bad);
if(errors.length){console.error('[V139.6 VERIFY FAIL]\n- '+errors.join('\n- ')); process.exit(1);}
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v139-6-verify-report.json'), JSON.stringify({ok:true, version:'V139_6_BLOG_CONFLICT_SAFE_ROUTE_HOTFIX', generatedAt:new Date().toISOString()}, null, 2));
console.log('[V139.6 VERIFY PASS] V9 blog conflict route redirected to safe html route');
