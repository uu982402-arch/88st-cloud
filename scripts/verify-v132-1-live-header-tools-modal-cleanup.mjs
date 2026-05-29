import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd(); const fail=[];
function abs(rel){return path.join(ROOT,rel)} function exists(rel){return fs.existsSync(abs(rel))} function read(rel){return fs.readFileSync(abs(rel),'utf8')}
function walk(dir=ROOT,out=[]){ if(!fs.existsSync(dir)) return out; for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','.wrangler','.cache'].includes(name)) continue; const full=path.join(dir,name); const rel=path.relative(ROOT,full).replace(/\\/g,'/'); const st=fs.statSync(full); if(st.isDirectory()) walk(full,out); else out.push(rel); } return out; }
const required=['assets/css/v132-1-live-header-tool-cleanup.css','scripts/generate-v132-1-live-header-tools-modal-cleanup.mjs','scripts/verify-v132-1-live-header-tools-modal-cleanup.mjs','scripts/build-v132-1-cloudflare-pages-safe.mjs','V132_1_PATCH_MANIFEST.json','V132_1_UPGRADE_REPORT.md','reports/v132-1-live-header-tools-modal-cleanup-audit.json'];
for(const r of required) if(!exists(r)) fail.push(`missing ${r}`);
const core=['index.html','tools/index.html','guaranteed/index.html']; for(const r of core) if(!exists(r)) fail.push(`missing core ${r}`);
const htmls=walk().filter(r=>r.endsWith('.html'));
let missing=0, dup=0;
const forbidden=['v73-header','v74-header','v73-mobile-nav','v74-mobile-nav','v74-footer','SMART TOOL','PRACTICAL TOOL','v129-consult-strip'];
for(const rel of htmls){ const b=read(rel); if(!b.includes('data-v132-1-cleanup') || !b.includes('v132-1-live-header-tool-cleanup.css')) missing++; for(const f of forbidden){ if(b.includes(f)){ if(dup<40) fail.push(`${rel} forbidden duplicate token: ${f}`); dup++; } } }
if(missing) fail.push(`${missing} html missing V132.1 cleanup lock`);
if(exists('tools/index.html')){ const t=read('tools/index.html'); const v73=(t.match(/data-v73-modal(?:\s|>)/g)||[]).length; const v103=(t.match(/data-v103-modal(?:\s|>)/g)||[]).length; const unified=(t.match(/data-v1321-tool-modal/g)||[]).length; if(unified!==1) fail.push(`tools unified modal count expected 1 got ${unified}`); if(v73!==1) fail.push(`tools data-v73-modal count expected 1 got ${v73}`); if(v103!==1) fail.push(`tools data-v103-modal count expected 1 got ${v103}`); if((t.match(/rust-bottom-nav/g)||[]).length!==1) fail.push('tools rust-bottom-nav count is not 1'); if((t.match(/rust-global-header/g)||[]).length<1) fail.push('tools missing rust global header'); }
if(exists('guaranteed/index.html')){ const g=read('guaranteed/index.html'); if((g.match(/rust-bottom-nav/g)||[]).length!==1) fail.push('guaranteed rust-bottom-nav count is not 1'); if(g.includes('자동 상담 시작')) fail.push('guaranteed still has legacy auto consult CTA'); }
if(exists('index.html')){ const i=read('index.html'); if(!i.includes('@TRS999_bot')) fail.push('index missing compact bot label'); if(i.includes('v131-consult-copy')) fail.push('index long consult copy returned'); }
const pkg=exists('package.json')?JSON.parse(read('package.json')):{scripts:{}}; if(!(pkg.scripts?.build||'').includes('build-v132-1-cloudflare-pages-safe.mjs')) fail.push('package build is not V132.1 safe build'); if(!(pkg.scripts?.verify||'').includes('verify-v132-1-live-header-tools-modal-cleanup.mjs')) fail.push('package verify is not V132.1 verify');
const missingScripts=[]; for(const [name,cmd] of Object.entries(pkg.scripts||{})){ for(const m of cmd.matchAll(/scripts\/[A-Za-z0-9_.-]+\.mjs/g)){ if(!exists(m[0])) missingScripts.push(`${name} -> ${m[0]}`); } } if(missingScripts.length) fail.push(`package references missing scripts: ${missingScripts.slice(0,20).join(', ')}`);
if(fail.length){ console.error('[V132.1 VERIFY FAIL]'); for(const f of fail) console.error('- '+f); process.exit(1); }
console.log('[V132.1 VERIFY PASS] header/tools modal cleanup OK'); console.log(JSON.stringify({html_count:htmls.length},null,2));
