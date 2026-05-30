import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V135.4 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V135.4 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
// Preserve the latest footer placement repair first, then apply the header brand lock.
if(fs.existsSync('scripts/generate-v135-3-footer-placement-hotfix.mjs')) run('V135.3 footer placement hotfix generate','scripts/generate-v135-3-footer-placement-hotfix.mjs');
run('V135.4 global header brand generate','scripts/generate-v135-4-global-header-brand-unify.mjs');
run('V135.4 verify','scripts/verify-v135-4-global-header-brand-unify.mjs');
const report={ok:true,version:'V135_4_GLOBAL_HEADER_BRAND_UNIFY',mode:'cloudflare-pages-safe-build',steps:['v135.3 footer placement repair when available','v135.4 global header brand unify','v135.4 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v135-4-cloudflare-build-safe-report.json',JSON.stringify(report,null,2));
fs.writeFileSync('build.txt','V135.4 GLOBAL HEADER BRAND UNIFY BUILD SAFE PASS\n'+report.generatedAt+'\n');
console.log('[V135.4 BUILD SAFE PASS]',JSON.stringify(report,null,2));
