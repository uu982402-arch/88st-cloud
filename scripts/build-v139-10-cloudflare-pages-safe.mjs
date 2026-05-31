import { spawnSync } from 'node:child_process';

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    console.error(`[V139.10 BUILD SAFE FAIL] ${label} exited with ${result.status}`);
    process.exit(result.status || 1);
  }
}

run('generate', process.execPath, ['scripts/generate-v139-10-retire-broken-v9-blog-route.mjs']);
run('verify', process.execPath, ['scripts/verify-v139-10-retire-broken-v9-blog-route.mjs']);
console.log('[V139.10 BUILD SAFE PASS] broken V9 blog route retired safely');
