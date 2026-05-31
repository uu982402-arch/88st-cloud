import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script, required = true){
  if(!fs.existsSync(script)){
    if(required){ console.error(`[V139.6 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
    console.warn(`[V139.6 BUILD SAFE WARN] optional script missing, skipped: ${script}`); return;
  }
  const r = spawnSync(process.execPath, [script], {stdio:'inherit'});
  if(r.status !== 0){ console.error(`[V139.6 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status || 1); }
}
run('V139 blog content differentiation', 'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs', true);
run('V139.1 GA4 stale blog coverage hotfix', 'scripts/generate-v139-1-ga4-coverage-hotfix.mjs', true);
run('V139.2 upload resilient build hotfix', 'scripts/generate-v139-2-upload-resilient-build-hotfix.mjs', true);
run('V139.3 blog 403 route hotfix', 'scripts/generate-v139-3-blog-403-route-hotfix.mjs', true);
run('V139.4 direct HTML fallback hotfix', 'scripts/generate-v139-4-blog-direct-html-fallback.mjs', true);
run('V139.5 Worker duplicate symbol hotfix', 'scripts/generate-v139-5-worker-duplicate-symbol-hotfix.mjs', true);
run('V139.6 conflict safe route hotfix', 'scripts/generate-v139-6-blog-conflict-safe-route-hotfix.mjs', true);
run('V139.6 verify', 'scripts/verify-v139-6-blog-conflict-safe-route-hotfix.mjs', true);
fs.mkdirSync('reports', {recursive:true});
fs.writeFileSync('reports/v139-6-cloudflare-build-safe-report.json', JSON.stringify({ok:true, version:'V139_6_BLOG_CONFLICT_SAFE_ROUTE_HOTFIX', mode:'cloudflare-pages-internal-error-route-avoidance', generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V139.6 BLOG CONFLICT SAFE ROUTE HOTFIX PASS\n' + new Date().toISOString() + '\n');
console.log('[V139.6 BUILD SAFE PASS] blog conflict route redirected to safe html route');
