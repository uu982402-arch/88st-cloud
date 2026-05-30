import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label, script){const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){console.error(`[V135.2 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1);}}
run('V135.2 footer/tone recovery generate','scripts/generate-v135-2-footer-tone-recovery.mjs');
run('V135.2 verify','scripts/verify-v135-2-footer-tone-recovery.mjs');
const report={ok:true,version:'V135_2_GLOBAL_FOOTER_TONE_RECOVERY',mode:'cloudflare-pages-safe-build',steps:['v135.2 generate','v135.2 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true}); fs.writeFileSync(path.join(ROOT,'reports/v135-2-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2)); fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}\n${report.generatedAt}\n`); console.log('[V135.2 BUILD SAFE PASS]',JSON.stringify(report,null,2));
