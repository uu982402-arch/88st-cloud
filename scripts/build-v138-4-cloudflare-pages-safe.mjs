import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){console.error(`[V138.4 BUILD SAFE FAIL] missing ${script}`);process.exit(1)}
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){console.error(`[V138.4 BUILD SAFE FAIL] ${label} exited with ${r.status}`);process.exit(r.status||1)}
}
run('V138.3 safe chain', 'scripts/build-v138-3-cloudflare-pages-safe.mjs');
run('V138.4 blog radius rollback', 'scripts/generate-v138-4-blog-radius-rollback.mjs');
run('V138.4 verify', 'scripts/verify-v138-4-blog-radius-rollback.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v138-4-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V138_4_BLOG_RADIUS_ROLLBACK_TEXT_SAFE',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V138-4 BLOG RADIUS ROLLBACK TEXT SAFE BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V138.4 BUILD SAFE PASS] blog radius rollback/text safe');
