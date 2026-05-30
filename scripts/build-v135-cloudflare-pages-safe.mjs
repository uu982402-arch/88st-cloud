import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label,script){const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){console.error(`[V135 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1);}}
run('V134 safe baseline','scripts/build-v134-cloudflare-pages-safe.mjs');
run('V135 blog full page audit','scripts/generate-v135-blog-full-post-page-audit.mjs');
run('V135 verify','scripts/verify-v135-blog-full-post-page-audit.mjs');
const report={ok:true,version:'V135_BLOG_FULL_POST_PAGE_AUDIT_TOP_MIDDLE_BOTTOM_CLEANUP',mode:'cloudflare-pages-safe-build',steps:['v134 baseline','v135 generate','v135 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v135-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}\n${report.generatedAt}\n`);
console.log('[V135 BUILD SAFE PASS]',JSON.stringify(report,null,2));
