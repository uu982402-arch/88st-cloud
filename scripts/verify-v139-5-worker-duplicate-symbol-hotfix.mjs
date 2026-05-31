import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const ROOT = process.cwd();
const errors = [];
const p = (...parts) => path.join(ROOT, ...parts);
const read = fp => fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '';
const fail = msg => errors.push(msg);
function count(txt, token){ return (txt.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; }
const worker = read(p('_worker.js'));
if(!worker) fail('_worker.js missing');
if(count(worker, 'V139_5_SAFE_BLOG_ROUTE_REDIRECTS') !== 2) fail('V139.5 route map token should appear exactly twice (declaration + reference)');
if(count(worker, 'v1395SafeBlogRouteRedirect') !== 2) fail('V139.5 redirect function token should appear exactly twice (function + call)');
for(const token of ['V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS','v1393RouteHotfixRedirect','V139_4_STALE_BLOG_ROUTE_REDIRECTS','v1394StaleRouteRedirect']){
  if(worker.includes(token)) fail('_worker.js still contains old duplicate-prone token: ' + token);
}
if(worker.includes('minigame-losing-streak-event-exclusion-condition-first.html", "/blog/minigame-losing') || worker.includes('minigame-losing-streak-event-exclusion-condition-first.html", "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/')) fail('worker must not redirect the direct .html route back to clean route');
if(!worker.includes('["/blog/minigame/minigame-losing-streak-event-exclusion-condition-first", "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html"]')) fail('worker missing non-html to html fallback');
const check = spawnSync(process.execPath, ['--check', '_worker.js'], {cwd: ROOT, encoding:'utf8'});
if(check.status !== 0) fail('node --check _worker.js failed: ' + (check.stderr || check.stdout || '').slice(0, 800));
const pkg = JSON.parse(read(p('package.json')) || '{}');
if(pkg.scripts?.build !== 'node scripts/build-v139-5-cloudflare-pages-safe.mjs') fail('package build not v139-5');
if(pkg.scripts?.verify !== 'node scripts/verify-v139-5-worker-duplicate-symbol-hotfix.mjs') fail('package verify not v139-5');
const article = read(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html'));
if(!article.includes('data-v139-4-direct-html-fallback="true"')) fail('V9 direct article fallback marker missing');
for(const token of ['rust-ga4-id','/assets/js/v82.ga4-events.js','/assets/js/v89.ga4-event-depth.js']) if(!article.includes(token)) fail('V9 article missing '+token);
const blogIndex = read(p('blog/index.html'));
if(!blogIndex.includes('href="/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html"')) fail('blog index missing direct .html V9 href');
for(const bad of ['faq','consult-motives','consult-result','provider-updates']){ if(fs.existsSync(p(bad))) fail('removed route regenerated: '+bad); }
const hrefSharp=[]; function walk(d){ for(const ent of fs.readdirSync(d,{withFileTypes:true})){ const fp=path.join(d,ent.name); if(['node_modules','.git'].includes(ent.name)) continue; if(ent.isDirectory()) walk(fp); else if(ent.isFile() && ent.name.endsWith('.html')){ const txt=read(fp); if(/href=["']#["']/.test(txt)) hrefSharp.push(path.relative(ROOT,fp).replaceAll(path.sep,'/')); } } }
walk(ROOT);
if(hrefSharp.length) fail('href="#" remained: '+hrefSharp.slice(0,8).join(', '));
if(errors.length){ console.error('[V139.5 VERIFY FAIL]\n- ' + errors.join('\n- ')); process.exit(1); }
fs.mkdirSync(p('reports'), {recursive:true});
fs.writeFileSync(p('reports/v139-5-verify-report.json'), JSON.stringify({ok:true, version:'V139_5_WORKER_DUPLICATE_SYMBOL_HOTFIX', workerSyntax:'node --check PASS', generatedAt:new Date().toISOString()}, null, 2));
console.log('[V139.5 VERIFY PASS] Worker duplicate declarations removed and syntax-safe for Cloudflare Pages Functions');
