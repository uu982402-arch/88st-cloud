
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

runPrev('scripts/verify-v117-search-guides-index-quality.mjs');
removedLock(); noV1142();
const hub=read('guaranteed/index.html');
assert(hub.includes('v118-guaranteed-image-cta-ab.css') && hub.includes('v118-guaranteed-cta-ab.js'), 'guaranteed hub missing V118 assets');
const cardCount=(hub.match(/class="v74-1-vendor-card"/g)||[]).length;
assert(cardCount===6, 'guaranteed hub must have exactly 6 cards, found '+cardCount);
assert((hub.match(/data-ga4-event="vendor_detail_click"/g)||[]).length>=6, 'vendor detail events missing');
assert((hub.match(/data-ga4-event="vendor_outbound_click"/g)||[]).length>=6, 'vendor outbound events missing');
assert((hub.match(/data-ga4-event="consult_click"/g)||[]).length>=6, 'consult click events missing on hub');
assert(hub.includes('object-fit:contain') || read('assets/css/v118-guaranteed-image-cta-ab.css').includes('object-fit:contain'), 'contain image rule missing');
for (const slug of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']){
  const f='guaranteed/'+slug+'/index.html'; assert(exists(f), f+' missing');
  const s=read(f); assert(s.includes('v118-guaranteed-image-cta-ab.css'), f+' missing V118 css');
  assert(s.includes('v118-guaranteed-cta-ab.js'), f+' missing V118 js');
  assert(s.includes('data-ga4-event="vendor_copy_code"'), f+' missing copy event');
  assert(s.includes('data-ga4-event="vendor_outbound_click"'), f+' missing outbound event');
  assert(s.includes('data-ga4-event="consult_click"'), f+' missing consult event');
}
const home=read('index.html');
assert(home.includes('v118-guaranteed-image-cta-ab.css'), 'home missing V118 css');
const premiumCount=(home.match(/프리미엄 보증업체/g)||[]).length;
assert(premiumCount===1, 'home premium guaranteed section label should appear once, found '+premiumCount);
for (const img of ['assets/img/guaranteed/cards/sk-holdings.webp','assets/img/guaranteed/cards/zakum.webp','assets/img/guaranteed/cards/udt-bet.webp','assets/img/guaranteed/cards/queenbee.webp','assets/img/guaranteed/cards/ddangkong-bet.webp','assets/img/guaranteed/cards/anybet.webp']) assert(exists(img), 'vendor image missing: '+img);
ok('[V118 VERIFY PASS] guaranteed image and CTA A/B polish active');
