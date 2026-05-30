import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V136.1 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V136.1 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
// Re-apply V136 first for PATCH upload safety, then polish the F-1 card and guaranteed landing bottoms.
run('V136 F-1 vendor generate','scripts/generate-v136-f1-guaranteed-vendor.mjs');
run('V136.1 card/detail polish generate','scripts/generate-v136-1-f1-card-detail-polish.mjs');
run('V136.1 verify','scripts/verify-v136-1-f1-card-detail-polish.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v136-1-cloudflare-build-safe-report.json',JSON.stringify({ok:true,version:'V136_1_F1_CARD_DETAIL_POLISH',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V136.1 F-1 CARD / GUARANTEED DETAIL POLISH BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V136.1 BUILD SAFE PASS] F-1 card and guaranteed detail polish');
