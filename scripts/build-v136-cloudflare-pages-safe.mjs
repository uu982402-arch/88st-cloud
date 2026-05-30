import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V136 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V136 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
// Keep latest mobile/modal state, then apply F-1 vendor addition.
run('V135.8 mobile home layout generate','scripts/generate-v135-8-mobile-home-layout-fix.mjs');
run('V136 F-1 vendor generate','scripts/generate-v136-f1-guaranteed-vendor.mjs');
run('V136 verify','scripts/verify-v136-f1-guaranteed-vendor.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v136-cloudflare-build-safe-report.json',JSON.stringify({ok:true,version:'V136_F1_GUARANTEED_VENDOR_ADDITION',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V136 F-1 GUARANTEED VENDOR BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V136 BUILD SAFE PASS] F-1 vendor addition');
