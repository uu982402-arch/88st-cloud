import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){console.error(`[V138.3 BUILD SAFE FAIL] missing ${script}`);process.exit(1)}
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){console.error(`[V138.3 BUILD SAFE FAIL] ${label} exited with ${r.status}`);process.exit(r.status||1)}
}
run('V138.2 safe chain', 'scripts/build-v138-2-cloudflare-pages-safe.mjs');
run('V138.3 section radius rollback', 'scripts/generate-v138-3-section-radius-rollback.mjs');
run('V138.3 verify', 'scripts/verify-v138-3-section-radius-rollback.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v138-3-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V138_3_SECTION_RADIUS_ROLLBACK_TEXT_SAFE_FINAL',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V138-3 SECTION RADIUS ROLLBACK TEXT SAFE FINAL BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V138.3 BUILD SAFE PASS] section radius rollback/text safe final');
