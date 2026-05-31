import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V139 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r = spawnSync(process.execPath, [script], {stdio:'inherit'});
  if(r.status !== 0){ console.error(`[V139 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status || 1); }
}
run('V138.6 safe chain', 'scripts/build-v138-6-cloudflare-pages-safe.mjs');
run('V139 blog content differentiation', 'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs');
run('V139 verify', 'scripts/verify-v139-blog-content-differentiation-seo-intent.mjs');
fs.mkdirSync('reports', {recursive:true});
fs.writeFileSync('reports/v139-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V139_BLOG_CONTENT_DIFFERENTIATION_SEO_INTENT',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V139 BLOG CONTENT DIFFERENTIATION SEO INTENT BUILD SAFE PASS\n' + new Date().toISOString() + '\n');
console.log('[V139 BUILD SAFE PASS] blog content differentiation + SEO intent split');
