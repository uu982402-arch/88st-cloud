import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script){
  if(!fs.existsSync(script)){ console.error(`[V137 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(r.status!==0){ console.error(`[V137 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status||1); }
}
run('V136.1 safe base','scripts/build-v136-1-cloudflare-pages-safe.mjs');
run('V137 blog content expansion generate','scripts/generate-v137-blog-content-expansion.mjs');
run('V137.1 upload manifest/report backfill','scripts/generate-v137-1-upload-manifest-backfill.mjs');
run('V137 verify','scripts/verify-v137-blog-content-expansion.mjs');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/v137-cloudflare-build-safe-report.json',JSON.stringify({ok:true,version:'V137_BLOG_CONTENT_EXPANSION_DUPLICATE_SAFE_10_POSTS',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()},null,2));
fs.writeFileSync('build.txt','V137 BLOG CONTENT EXPANSION / DUPLICATE-SAFE 10 POSTS BUILD SAFE PASS\n'+new Date().toISOString()+'\n');
console.log('[V137 BUILD SAFE PASS] duplicate-safe blog expansion');
