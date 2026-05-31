import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

function run(label, script){
  if(!fs.existsSync(script)){
    console.error(`[V139.1 BUILD SAFE FAIL] missing ${script}`);
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [script], {stdio:'inherit'});
  if(r.status !== 0){
    console.error(`[V139.1 BUILD SAFE FAIL] ${label} exited with ${r.status}`);
    process.exit(r.status || 1);
  }
}
for(const f of [
  'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/verify-v139-blog-content-differentiation-seo-intent.mjs',
  'assets/css/v139-blog-content-differentiation.css',
  'V139_PATCH_MANIFEST.json',
  'V139_UPGRADE_REPORT.md'
]){
  if(!fs.existsSync(f)){
    console.error(`[V139.1 BUILD SAFE FAIL] V139 base artifact missing: ${f}`);
    process.exit(1);
  }
}
run('V139 blog content differentiation', 'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs');
run('V139.1 GA4 stale blog coverage hotfix', 'scripts/generate-v139-1-ga4-coverage-hotfix.mjs');
run('V139.1 verify', 'scripts/verify-v139-1-ga4-coverage-hotfix.mjs');
fs.mkdirSync('reports', {recursive:true});
fs.writeFileSync('reports/v139-1-cloudflare-build-safe-report.json', JSON.stringify({ok:true, version:'V139_1_GA4_STALE_BLOG_COVERAGE_HOTFIX', base:'V139 content differentiation + post-generate GA4 repair', mode:'cloudflare-pages-safe-build', generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V139.1 GA4 STALE BLOG COVERAGE HOTFIX BUILD SAFE PASS\n' + new Date().toISOString() + '\n');
console.log('[V139.1 BUILD SAFE PASS] stale blog GA4 coverage repaired after V139 generation');
