
import { spawnSync } from 'child_process';
function run(cmd,args){ const res = spawnSync(cmd,args,{stdio:'inherit',shell:false}); if(res.status!==0){ console.error(`[V139.7 BUILD SAFE FAIL] ${cmd} ${args.join(' ')} exited with ${res.status}`); process.exit(res.status||1);} }
run('node',['scripts/generate-v139-7-worker-direct-blog-fallback.mjs']);
run('node',['scripts/verify-v139-7-worker-direct-blog-fallback.mjs']);
run('node',['--check','_worker.js']);
console.log('[V139.7 BUILD SAFE PASS] worker direct blog fallback completed');
