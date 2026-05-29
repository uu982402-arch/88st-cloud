import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
function run(label, script){ const res=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(res.status!==0){ console.error(`[V132 BUILD SAFE FAIL] ${label} exited with ${res.status}`); process.exit(res.status ?? 1); } }
run('V131.1 safe build baseline', 'scripts/build-v131-cloudflare-pages-safe.mjs');
run('V132 live screen cleanup', 'scripts/generate-v132-live-screen-cleanup-duplicate-ui.mjs');
run('V132 verify', 'scripts/verify-v132-live-screen-cleanup-duplicate-ui.mjs');
const report={ok:true,version:'V132_LIVE_SCREEN_CLEANUP_DUPLICATE_UI_REMOVAL',mode:'cloudflare-pages-safe-build',steps:['v131.1 baseline','v132 cleanup','v132 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v132-cloudflare-build-safe-report.json'), JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'), `${report.version}\n${report.generatedAt}\n`);
console.log('[V132 BUILD SAFE PASS]', JSON.stringify(report,null,2));
