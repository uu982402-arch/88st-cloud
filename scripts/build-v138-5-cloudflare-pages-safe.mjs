import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){console.error(`[V138.5 BUILD SAFE FAIL] missing ${script}`);process.exit(1)}
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){console.error(`[V138.5 BUILD SAFE FAIL] ${label} exited with ${r.status}`);process.exit(r.status||1)}
}
run('V138.4 safe chain', 'scripts/build-v138-4-cloudflare-pages-safe.mjs');
run('V138.5 GA4 coverage hardening', 'scripts/generate-v138-5-ga4-coverage-hardening.mjs');
run('V138.5 verify', 'scripts/verify-v138-5-ga4-coverage-hardening.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v138-5-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V138_5_GA4_COVERAGE_HARDENING',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V138-5 GA4 COVERAGE HARDENING BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V138.5 BUILD SAFE PASS] GA4 coverage hardening');
