#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
const ROOT = process.cwd();
const errors = [];
const warnings = [];
function walk(dir,out=[]){ for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','__MACOSX'].includes(name)) continue; const p=path.join(dir,name); const st=fs.statSync(p); if(st.isDirectory()) walk(p,out); else out.push(p);} return out; }
function read(p){ return fs.readFileSync(p,'utf8'); }
function rel(p){ return path.relative(ROOT,p).replaceAll(path.sep,'/'); }
function fail(m){ errors.push(m); }
const files = walk(ROOT);
const htmls = files.filter(f=>f.endsWith('.html'));
for (const f of files.filter(f=>/\.(js|mjs)$/.test(f) && !rel(f).startsWith('node_modules/'))) {
  const r = spawnSync(process.execPath, ['--check', f], {encoding:'utf8'});
  if (r.status !== 0) fail(`JS syntax failed ${rel(f)}: ${r.stderr || r.stdout}`);
}
for (const must of ['assets/css/v66.obsidian-dashboard.css','assets/js/v66.obsidian-dashboard.js','scripts/generate-v66-obsidian-renewal.mjs']) if(!fs.existsSync(path.join(ROOT,must))) fail(`missing ${must}`);
const pkg = JSON.parse(read(path.join(ROOT,'package.json')));
if (!pkg.scripts?.build?.includes('generate-v66-obsidian-renewal.mjs')) fail('package build does not run V66 finalizer');
if (!pkg.scripts?.verify?.includes('verify-v66-obsidian.mjs')) fail('package verify does not run V66 verifier');
for (const f of htmls) {
  const t=read(f);
  if(!/<body[^>]*class=["'][^"']*v66-obsidian/i.test(t)) fail(`missing v66 body ${rel(f)}`);
  if(!/v66\.obsidian-dashboard\.css/i.test(t)) fail(`missing v66 css ${rel(f)}`);
  if(!/v66\.obsidian-dashboard\.js/i.test(t)) fail(`missing v66 js ${rel(f)}`);
  if(!/v66-fab/i.test(t)) fail(`missing v66 fab ${rel(f)}`);
  if(!/v66-mobile-nav/i.test(t)) fail(`missing v66 mobile nav ${rel(f)}`);
  if(!/<meta\b(?=[^>]*\bname=["']description["'])/i.test(t)) fail(`missing description ${rel(f)}`);
  if(!/<link\b(?=[^>]*\brel=["']canonical["'])/i.test(t)) fail(`missing canonical ${rel(f)}`);
}
const core = {
 'index.html':['v66-hero-grid','검증·도구·상담','v66-vendor-grid','v66-tools-grid'],
 'guaranteed/index.html':['v66-guaranteed-page','SK 홀딩스','여왕벌','ANY BET','UDT BET','땅콩 BET','code-badge'],
 'tools/index.html':['v66-tools-page','오로라','v66-tool-tile','color:#000'],
 'consult/index.html':['v66-consult-page','상담 전 빠른 입력','v66-consult-layout']
};
for (const [file, needles] of Object.entries(core)) {
  const fp=path.join(ROOT,file); if(!fs.existsSync(fp)){ fail(`missing core ${file}`); continue; }
  const t=read(fp)+read(path.join(ROOT,'assets/css/v66.obsidian-dashboard.css'));
  for (const n of needles) if(!t.includes(n)) fail(`core ${file} missing ${n}`);
}
const smTxt = fs.existsSync(path.join(ROOT,'sitemap.txt')) ? read(path.join(ROOT,'sitemap.txt')).trim().split(/\r?\n/).filter(Boolean) : [];
let checked=0, missing=[];
for (const url of smTxt) {
  const u = new URL(url);
  let route = decodeURIComponent(u.pathname);
  const fp = route==='/' ? path.join(ROOT,'index.html') : route.endsWith('/') ? path.join(ROOT, route.slice(1), 'index.html') : path.join(ROOT, route.slice(1));
  checked++;
  if(!fs.existsSync(fp)) missing.push(route);
}
if (missing.length) fail(`sitemap missing ${missing.length}: ${missing.slice(0,10).join(', ')}`);
const g=read(path.join(ROOT,'guaranteed/index.html'));
const cardCount=(g.match(/v66-vendor-card/g)||[]).length;
const codeCount=(g.match(/code-badge/g)||[]).length;
if(cardCount < 5) fail(`guaranteed card count ${cardCount}`);
if(codeCount < 5) fail(`guaranteed code badge count ${codeCount}`);
const css=read(path.join(ROOT,'assets/css/v66.obsidian-dashboard.css'));
for (const n of ['backdrop-filter','min-height:44px','transition:all .3s ease-in-out','@media (min-width:761px)','display:none!important']) if(!css.includes(n)) fail(`css missing ${n}`);
const result={ok:errors.length===0, html:htmls.length, sitemapTxt:smTxt.length, errors, warnings, checkedAt:new Date().toISOString()};
console.log(JSON.stringify(result,null,2));
if(errors.length) process.exit(1);
