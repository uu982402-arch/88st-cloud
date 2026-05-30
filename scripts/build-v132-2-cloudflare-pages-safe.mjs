import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label,script){ const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){ console.error(`[V132.2 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1); } }
run('V132.1 safe build baseline','scripts/build-v132-1-cloudflare-pages-safe.mjs');
run('V132.2 home guaranteed card balance','scripts/generate-v132-2-home-guaranteed-card-balance.mjs');
run('V132.2 verify','scripts/verify-v132-2-home-guaranteed-card-balance.mjs');
const report={ok:true,version:'V132_2_HOME_GUARANTEED_CARD_BALANCE',mode:'cloudflare-pages-safe-build',steps:['v132.1 baseline','v132.2 generate','v132.2 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v132-2-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}\n${report.generatedAt}\n`);
console.log('[V132.2 BUILD SAFE PASS]',JSON.stringify(report,null,2));
