
import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const errors = [];
const workerPath = p('_worker.js');
const worker = fs.existsSync(workerPath) ? fs.readFileSync(workerPath, 'utf8') : '';
function need(cond, msg){ if(!cond) errors.push(msg); }
need(worker.includes('V139_7_DIRECT_BLOG_HTML'), '_worker.js missing V139_7_DIRECT_BLOG_HTML');
need(worker.includes('V139_7_DIRECT_BLOG_ROUTES'), '_worker.js missing direct blog route set');
need(worker.includes('/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html'), '_worker.js missing guide route');
need(!/V139_4_STALE_BLOG_ROUTE_REDIRECTS|v1394StaleRouteRedirect|V139_6_SAFE_BLOG_ROUTE_REDIRECTS|v1396SafeBlogRouteRedirect/.test(worker), '_worker.js still contains older conflicting v139 route symbols');
need(fs.existsSync(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html')), 'guide html missing');
const guide = fs.existsSync(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html')) ? fs.readFileSync(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html'),'utf8') : '';
need(/rust-ga4-id/.test(guide) && /v82\.ga4-events\.js/.test(guide) && /v89\.ga4-event-depth\.js/.test(guide), 'guide html missing GA4 coverage');
need(/rel="canonical" href="https:\/\/88st\.cloud\/blog\/minigame\/minigame-losing-streak-event-exclusion-condition-guide\.html"/.test(guide), 'guide html canonical not fixed to safe route');
const index = fs.existsSync(p('blog/index.html')) ? fs.readFileSync(p('blog/index.html'),'utf8') : '';
need(index.includes('/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html'), 'blog index does not link to safe guide route');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) need(!fs.existsSync(p(r)), `removed route directory regenerated: ${r}`);
if (/#"|href="#/.test(index + worker + guide)) errors.push('href="#" detected in v139-7 checked files');
if (errors.length) {
  console.error('[V139.7 VERIFY FAIL]');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log('[V139.7 VERIFY PASS] worker direct blog fallback OK');
