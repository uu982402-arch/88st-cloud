import { spawnSync } from 'node:child_process';

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`[V140 BUILD SAFE FAIL] ${label} exited with ${result.status}`);
    process.exit(result.status || 1);
  }
}

// Keep the V139-11 broken route kill lock, then apply V140 on top.
// Do not run the old V139-11 blog-count verifier here because V140 intentionally changes the blog count from 75 to 78.
run('v139-11 route lock generate', process.execPath, ['scripts/generate-v139-11-live-broken-blog-route-kill-lock.mjs']);
run('v140 generate', process.execPath, ['scripts/generate-v140-security-blog-expansion.mjs']);
run('v140 verify', process.execPath, ['scripts/verify-v140-security-blog-expansion.mjs']);
console.log('[V140 BUILD SAFE PASS] security blog expansion completed');
