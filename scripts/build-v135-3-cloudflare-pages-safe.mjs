import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V135.3 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V135.3 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
// Keep V135.2 color/footer cleanup behavior, then repair its footer insertion bug.
if(fs.existsSync('scripts/generate-v135-2-footer-tone-recovery.mjs')) run('V135.2 footer/tone recovery generate','scripts/generate-v135-2-footer-tone-recovery.mjs');
run('V135.3 footer placement hotfix generate','scripts/generate-v135-3-footer-placement-hotfix.mjs');
run('V135.3 verify','scripts/verify-v135-3-footer-placement-hotfix.mjs');
const report={ok:true,version:'V135_3_FOOTER_PLACEMENT_HOTFIX',mode:'cloudflare-pages-safe-build',steps:['v135.2 tone/footer recovery','v135.3 footer placement repair','v135.3 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v135-3-cloudflare-build-safe-report.json',JSON.stringify(report,null,2));
fs.writeFileSync('build.txt','V135.3 FOOTER PLACEMENT HOTFIX BUILD SAFE PASS\n'+report.generatedAt+'\n');
console.log('[V135.3 BUILD SAFE PASS]',JSON.stringify(report,null,2));
