import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V137.2 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V137.2 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
run('V136.1 safe base','scripts/build-v136-1-cloudflare-pages-safe.mjs');
run('V137.2 blog live materialize','scripts/generate-v137-2-blog-live-materialize.mjs');
run('V137.2 verify','scripts/verify-v137-2-blog-live-materialize.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v137-2-cloudflare-build-safe-report.json',JSON.stringify({ok:true,version:'V137_2_BLOG_CONTENT_LIVE_MATERIALIZE_HOTFIX',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V137.2 BLOG CONTENT LIVE MATERIALIZE HOTFIX BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V137.2 BUILD SAFE PASS] blog content live materialized');
