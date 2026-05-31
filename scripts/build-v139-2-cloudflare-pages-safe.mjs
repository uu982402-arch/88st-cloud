import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

function run(label, script, required = true){
  if(!fs.existsSync(script)){
    if(required){
      console.error(`[V139.2 BUILD SAFE FAIL] missing ${script}`);
      process.exit(1);
    }
    console.warn(`[V139.2 BUILD SAFE WARN] optional script missing, skipped: ${script}`);
    return;
  }
  const r = spawnSync(process.execPath, [script], {stdio:'inherit'});
  if(r.status !== 0){
    console.error(`[V139.2 BUILD SAFE FAIL] ${label} exited with ${r.status}`);
    process.exit(r.status || 1);
  }
}

// Do not require older manifest/report files here. GitHub web uploads can omit root artifacts or keep stale files.
// The actual repository state is regenerated and verified below.
run('V139 blog content differentiation', 'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs', true);
run('V139.1 GA4 stale blog coverage hotfix', 'scripts/generate-v139-1-ga4-coverage-hotfix.mjs', true);
run('V139.2 upload resilient build hotfix', 'scripts/generate-v139-2-upload-resilient-build-hotfix.mjs', true);
run('V139.2 verify', 'scripts/verify-v139-2-upload-resilient-build-hotfix.mjs', true);

fs.mkdirSync('reports', {recursive:true});
fs.writeFileSync('reports/v139-2-cloudflare-build-safe-report.json', JSON.stringify({ok:true, version:'V139_2_UPLOAD_RESILIENT_BUILD_HOTFIX', mode:'cloudflare-pages-safe-build', fixed:'removed V139_PATCH_MANIFEST.json hard dependency', generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V139.2 UPLOAD RESILIENT BUILD HOTFIX PASS\n' + new Date().toISOString() + '\n');
console.log('[V139.2 BUILD SAFE PASS] upload-resilient V139 chain completed');
