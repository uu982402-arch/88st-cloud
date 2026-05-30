import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V135.7 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V135.7 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
run('V135.7 tool modal layout generate','scripts/generate-v135-7-tool-modal-layout-rebuild.mjs');
run('V135.7 verify','scripts/verify-v135-7-tool-modal-layout-rebuild.mjs');
const report={ok:true,version:'V135_7_TOOL_MODAL_LAYOUT_REBUILD',mode:'cloudflare-pages-safe-build',steps:['v135.7 generate','v135.7 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v135-7-cloudflare-build-safe-report.json',JSON.stringify(report,null,2));
fs.writeFileSync('build.txt','V135.7 TOOL MODAL LAYOUT REBUILD BUILD SAFE PASS\n'+report.generatedAt+'\n');
console.log('[V135.7 BUILD SAFE PASS]',JSON.stringify(report,null,2));
