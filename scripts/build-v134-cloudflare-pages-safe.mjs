
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function run(label,script){ const r=spawnSync(process.execPath,[script],{cwd:ROOT,stdio:'inherit'}); if(r.status!==0){ console.error(`[V134 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status??1); } }
run('V133 safe baseline','scripts/build-v133-cloudflare-pages-safe.mjs');
run('V134 blog live QA','scripts/generate-v134-blog-live-qa-season-index-polish.mjs');
run('V134 verify','scripts/verify-v134-blog-live-qa-season-index-polish.mjs');
const report={ok:true,version:'V134_BLOG_LIVE_QA_SPORTS_SEASON_INDEX_POLISH',mode:'cloudflare-pages-safe-build',steps:['v133 baseline','v134 generate','v134 verify'],generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/v134-cloudflare-build-safe-report.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(ROOT,'build.txt'),`${report.version}
${report.generatedAt}
`);
console.log('[V134 BUILD SAFE PASS]',JSON.stringify(report,null,2));
