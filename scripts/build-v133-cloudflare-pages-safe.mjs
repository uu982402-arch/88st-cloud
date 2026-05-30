import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label,script){ const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){ console.error(`[V133 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1); } }
run('V132.2 safe baseline','scripts/build-v132-2-cloudflare-pages-safe.mjs');
run('V133 sports season content','scripts/generate-v133-sports-season-content.mjs');
run('V133 verify','scripts/verify-v133-sports-season-content.mjs');
const report={ok:true,version:'V133_SPORTS_SEASON_CONTENT_DUPLICATE_SAFE',mode:'cloudflare-pages-safe-build',steps:['v132.2 baseline','v133 generate','v133 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v133-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}\n${report.generatedAt}\n`);
console.log('[V133 BUILD SAFE PASS]',JSON.stringify(report,null,2));
