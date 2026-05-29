import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
function run(label, script){
  const res = spawnSync(process.execPath, [script], { cwd: ROOT, stdio: 'inherit' });
  if(res.status !== 0){ console.error(`[V131.1 BUILD SAFE FAIL] ${label} exited with ${res.status}`); process.exit(res.status ?? 1); }
}
run('V130.2 upload recovery', 'scripts/generate-v130-2-upload-recovery.mjs');
run('V131 live visual deploy polish', 'scripts/generate-v131-live-visual-deploy-polish.mjs');
run('V131.1 lock backfill', 'scripts/generate-v131-1-upload-lock-backfill.mjs');
run('V131 verify', 'scripts/verify-v131-live-visual-deploy-polish.mjs');
const report = { ok:true, version:'V131_1_UPLOAD_PATCH_LOCK_BACKFILL', mode:'cloudflare-pages-safe-build', steps:['v130.2 recovery','v131 generate','v131.1 lock backfill','v131 verify'], generatedAt:new Date().toISOString() };
fs.mkdirSync(path.join(ROOT,'reports'), { recursive:true });
fs.writeFileSync(path.join(ROOT,'reports/v131-1-cloudflare-build-safe-report.json'), JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'), `${report.version}\n${report.generatedAt}\n`);
console.log('[V131.1 BUILD SAFE PASS]', JSON.stringify(report, null, 2));
