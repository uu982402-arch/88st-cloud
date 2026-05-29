import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label,script){ const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){ console.error(`[V132.1 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1); } }
run('V132 safe build baseline','scripts/build-v132-cloudflare-pages-safe.mjs');
run('V132.1 header/tools cleanup','scripts/generate-v132-1-live-header-tools-modal-cleanup.mjs');
run('V132.1 verify','scripts/verify-v132-1-live-header-tools-modal-cleanup.mjs');
const report={ok:true,version:'V132_1_LIVE_HEADER_TOOLS_MODAL_CLEANUP',mode:'cloudflare-pages-safe-build',steps:['v132 baseline','v132.1 cleanup','v132.1 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true}); fs.writeFileSync(path.join(ROOT,'reports/v132-1-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2)); fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}\n${report.generatedAt}\n`); console.log('[V132.1 BUILD SAFE PASS]',JSON.stringify(report,null,2));
