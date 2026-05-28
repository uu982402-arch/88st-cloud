
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

runPrev('scripts/verify-v116-sports-check-result-polish.mjs');
removedLock(); noV1142();
const files = walk('search-guides').filter(f=>f.endsWith('.html'));
assert(files.length >= 35, 'search-guides html count too low');
const titles=new Map(), descs=new Map();
for (const f of files){
  const s=read(f);
  assert(s.includes('v117-search-guides-index-quality.css'), f+' missing V117 css');
  assert(s.includes('data-v117-search-guides-polish="true"'), f+' missing V117 marker');
  assert(!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(s), f+' has noindex');
  assert(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/88st\.cloud\/search-guides\//i.test(s), f+' canonical missing');
  const t=(s.match(/<title>(.*?)<\/title>/s)||[])[1]||'';
  const d=(s.match(/<meta name="description" content="(.*?)"/s)||[])[1]||'';
  assert(t.trim() && d.trim(), f+' title/description empty');
  const tk=t.trim(), dk=d.trim();
  assert(!titles.has(tk), 'duplicate search-guide title: '+tk+' in '+f+' and '+titles.get(tk)); titles.set(tk,f);
  assert(!descs.has(dk), 'duplicate search-guide description: '+dk+' in '+f+' and '+descs.get(dk)); descs.set(dk,f);
}
for (const f of files.filter(f=>f!=='search-guides/index.html')){ assert(read(f).includes('data-v117-quality-card="true"'), f+' missing quality card'); }
const main=read('index.html');
assert(main.includes('data-v102-6-hub-rotation') && main.includes('v102-6-hub-rotation-fix.js'), 'main hub rotation marker/script missing');
sitemapLinksExist('search-guides/');
ok('[V117 VERIFY PASS] search-guides index quality and SEO lock active');
