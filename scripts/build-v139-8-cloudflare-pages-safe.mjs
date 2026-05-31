import { spawnSync } from 'child_process';
function run(cmd,args){ const res = spawnSync(cmd,args,{stdio:'inherit',shell:false}); if(res.status!==0){ console.error(`[V139.8 BUILD SAFE FAIL] ${cmd} ${args.join(' ')} exited with ${res.status}`); process.exit(res.status||1);} }
run('node',['scripts/generate-v139-8-static-route-worker-safe-hotfix.mjs']);
run('node',['scripts/verify-v139-8-static-route-worker-safe-hotfix.mjs']);
run('node',['--check','_worker.js']);
console.log('[V139.8 BUILD SAFE PASS] static route worker safe hotfix completed');
