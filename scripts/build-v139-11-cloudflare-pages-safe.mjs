import { spawnSync } from 'node:child_process';

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`[V139.11 BUILD SAFE FAIL] ${label} exited with ${result.status}`);
    process.exit(result.status || 1);
  }
}

run('generate', process.execPath, ['scripts/generate-v139-11-live-broken-blog-route-kill-lock.mjs']);
run('verify', process.execPath, ['scripts/verify-v139-11-live-broken-blog-route-kill-lock.mjs']);
console.log('[V139.11 BUILD SAFE PASS] live broken blog route kill lock completed');
