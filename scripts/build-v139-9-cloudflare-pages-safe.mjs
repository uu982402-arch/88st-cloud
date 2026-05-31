import { spawnSync } from "node:child_process";
const run=(cmd,args)=>{ const r=spawnSync(cmd,args,{stdio:"inherit",shell:false}); if(r.status!==0) process.exit(r.status||1); };
run(process.execPath,["scripts/generate-v139-9-worker-inline-route-final-hotfix.mjs"]);
run(process.execPath,["scripts/verify-v139-9-worker-inline-route-final-hotfix.mjs"]);
console.log("[V139.9 BUILD SAFE PASS] worker inline route final hotfix completed");
