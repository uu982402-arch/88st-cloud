
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const exists = (p) => fs.existsSync(path.join(root,p));
const fail = (m) => { console.error('[VERIFY FAIL]', m); process.exit(1); };
const ok = (m) => console.log(m);
function walk(dir){
  const out=[]; const base=path.join(root,dir);
  if(!fs.existsSync(base)) return out;
  for(const ent of fs.readdirSync(base,{withFileTypes:true})){
    const rel=path.join(dir,ent.name).replace(/\\/g,'/');
    if(ent.isDirectory()) out.push(...walk(rel)); else out.push(rel);
  }
  return out;
}
function assert(cond,msg){ if(!cond) fail(msg); }
function runPrev(script){ const r=spawnSync(process.execPath,[script],{cwd:root,stdio:'inherit'}); assert(r.status===0, script+' must pass'); }
function removedLock(){
  const removed=['faq','consult-motives','consult-result','provider-updates'];
  for (const route of removed){
    assert(!exists(route), 'removed route directory regenerated: '+route);
    assert(!exists(route+'.html'), 'removed route file regenerated: '+route+'.html');
  }
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){
    if(!exists(sm)) continue;
    const s=read(sm);
    for (const route of removed){ assert(!s.includes('/'+route+'/') && !s.includes('/'+route+'.html'), sm+' contains removed route '+route); }
  }
}
function sitemapLinksExist(prefix){
  const sm = exists('sitemap.txt') ? read('sitemap.txt') : '';
  for (const m of sm.matchAll(/https:\/\/88st\.cloud\/(.*?)\s/g)){
    const u=m[1]; if(!u.startsWith(prefix)) continue;
    const rel = u.endsWith('/') ? u+'index.html' : u;
    assert(exists(rel), 'sitemap URL has no file: /'+u);
  }
}
function noV1142(){ const blob=['index.html','tools/index.html','assets/js/v115-tools-stability-main-modal-unify.js'].filter(exists).map(read).join('\n'); assert(!/v114-2|V114\.2|V114_2/i.test(blob),'V114.2 marker/script reappeared'); }

runPrev('scripts/verify-v115-tools-stability-main-modal-unify.mjs');
removedLock();
noV1142();
const sports = walk('sports-check').filter(f=>f.endsWith('.html'));
assert(sports.length >= 13, 'sports-check html count too low');
for (const f of sports){ const s=read(f); assert(s.includes('v116-sports-check-result-polish.css'), f+' missing V116 css'); assert(s.includes('data-v116-sports-check-polish="true"'), f+' missing V116 body marker'); }
for (const f of sports.filter(f=>!f.endsWith('/index.html') && f!=='sports-check/index.html')){ const s=read(f); assert(s.includes('data-v116-result-card="true"'), f+' missing result card'); assert(s.includes('배당') && s.includes('라인') && s.includes('변수') && s.includes('주의'), f+' result card categories missing'); }
const main=read('index.html');
assert(main.includes('data-v102-6-hub-rotation') && main.includes('v102-6-hub-rotation-fix.js'), 'main hub rotation marker/script missing');
sitemapLinksExist('sports-check/');
ok('[V116 VERIFY PASS] sports-check UX and result card polish active');
