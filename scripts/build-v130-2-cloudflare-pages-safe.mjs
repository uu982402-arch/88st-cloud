import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
function run(label, script) {
  const res = spawnSync(process.execPath, [script], { cwd: ROOT, stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`[V130.2 BUILD SAFE FAIL] ${label} exited with ${res.status}`);
    process.exit(res.status ?? 1);
  }
}

run('generate recovery', 'scripts/generate-v130-2-upload-recovery.mjs');
run('verify recovery', 'scripts/verify-v130-2-upload-recovery.mjs');

const report = {
  ok: true,
  version: 'V130.2_UPLOAD_BUILD_RECOVERY',
  mode: 'cloudflare-pages-build-time-recovery',
  note: 'Build first materializes missing final-lock files/markers for partial GitHub uploads, then verifies deploy-ready static output.',
  generatedAt: new Date().toISOString()
};
fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports/v130-2-cloudflare-build-safe-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(ROOT, 'build.txt'), `V130.2_UPLOAD_BUILD_RECOVERY\n${report.generatedAt}\n`);
console.log('[V130.2 BUILD SAFE PASS]', JSON.stringify(report, null, 2));
