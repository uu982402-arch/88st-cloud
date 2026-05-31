import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V138.6 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r = spawnSync(process.execPath, [script], {stdio:'inherit'});
  if(r.status !== 0){ console.error(`[V138.6 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status || 1); }
}
run('V138.5 safe chain', 'scripts/build-v138-5-cloudflare-pages-safe.mjs');
run('V138.6 blog formula SEO refresh', 'scripts/generate-v138-6-blog-formula-seo-refresh.mjs');
run('V138.6 verify', 'scripts/verify-v138-6-blog-formula-seo-refresh.mjs');
fs.mkdirSync('reports', {recursive:true});
fs.writeFileSync('reports/v138-6-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V138_6_BLOG_FORMULA_SEO_REFRESH',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V138-6 BLOG FORMULA SEO REFRESH BUILD SAFE PASS\n' + new Date().toISOString() + '\n');
console.log('[V138.6 BUILD SAFE PASS] blog formula + SEO refresh');
