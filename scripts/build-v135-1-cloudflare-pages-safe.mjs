import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label,script){const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){console.error(`[V135.1 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1);}}
run('V135 safe baseline','scripts/build-v135-cloudflare-pages-safe.mjs');
run('V135.1 blog tone restore','scripts/generate-v135-1-blog-tone-restore.mjs');
run('V135.1 verify','scripts/verify-v135-1-blog-tone-restore.mjs');
const report={ok:true,version:'V135_1_BLOG_DETAIL_TONE_RESTORE_HOTFIX',mode:'cloudflare-pages-safe-build',steps:['v135 baseline','v135.1 generate','v135.1 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v135-1-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}\n${report.generatedAt}\n`);
console.log('[V135.1 BUILD SAFE PASS]',JSON.stringify(report,null,2));
