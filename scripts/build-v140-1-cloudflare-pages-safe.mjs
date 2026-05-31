import { spawnSync } from 'node:child_process';
function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`[V140.1 BUILD SAFE FAIL] ${label} exited with ${result.status}`);
    process.exit(result.status || 1);
  }
}
// Run V139-11 generator to refresh the broken-route lock, then V140/V140.1 verification checks the final 78-post state.
run('v139-11 generate', process.execPath, ['scripts/generate-v139-11-live-broken-blog-route-kill-lock.mjs']);
run('v140 generate', process.execPath, ['scripts/generate-v140-security-blog-expansion.mjs']);
run('v140 verify', process.execPath, ['scripts/verify-v140-security-blog-expansion.mjs']);
run('v140-1 generate', process.execPath, ['scripts/generate-v140-1-security-blog-detail-polish.mjs']);
run('v140-1 verify', process.execPath, ['scripts/verify-v140-1-security-blog-detail-polish.mjs']);
console.log('[V140.1 BUILD SAFE PASS] security blog detail polish completed');
