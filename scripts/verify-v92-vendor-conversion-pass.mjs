import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const vendors = [
  { id:'sk-holdings', detail:'guaranteed/sk-holdings/index.html', name:'SK 홀딩스', code:'IRON888', image:'/assets/img/guaranteed/cards/sk-holdings.webp' },
  { id:'queenbee', detail:'guaranteed/queenbee/index.html', name:'여왕벌', code:'SEOA', image:'/assets/img/guaranteed/cards/queenbee.webp' },
  { id:'anybet', detail:'guaranteed/anybet/index.html', name:'ANY BET', code:'SEOA', image:'/assets/img/guaranteed/cards/anybet.webp' },
  { id:'udt', detail:'guaranteed/udt/index.html', name:'UDT BET', code:'SEOA', image:'/assets/img/guaranteed/cards/udt-bet.webp' },
  { id:'ddangkong', detail:'guaranteed/ddangkong/index.html', name:'땅콩 BET', code:'DDK888', image:'/assets/img/guaranteed/cards/ddangkong-bet.webp' }
];
function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8');}
function fail(msg){throw new Error(`[V92 VERIFY] ${msg}`);}
function count(h,n){return (h.match(new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;}
for(const rel of ['assets/css/v92-vendor-conversion-pass.css','assets/js/v92-vendor-conversion-pass.js','assets/data/v92-vendor-conversion-pass.json','scripts/generate-v92-vendor-conversion-pass.mjs']){ if(!fs.existsSync(path.join(ROOT,rel))) fail(`missing ${rel}`); }
const hub = read('guaranteed/index.html');
if(!hub.includes('V92_VENDOR_CONVERSION_PASS_ACTIVE')) fail('hub marker missing');
if(!hub.includes('v92-vendor-conversion-pass.css') || !hub.includes('v92-vendor-conversion-pass.js')) fail('hub V92 assets missing');
for(const v of vendors){
  const imgRel = v.image.slice(1);
  if(!fs.existsSync(path.join(ROOT,imgRel))) fail(`image missing ${imgRel}`);
  const stat = fs.statSync(path.join(ROOT,imgRel));
  if(stat.size < 1000) fail(`image too small ${imgRel}`);
  if(!hub.includes(v.image)) fail(`hub missing image ${v.image}`);
  if(!hub.includes(`alt="${v.name} 보증업체 카드 이미지"`)) fail(`hub missing alt ${v.name}`);
  if(!hub.includes(`data-v92-go="true"`) || !hub.includes(`data-code="${v.code}"`)) fail(`hub missing go/code ${v.name}`);
  if(!hub.includes('data-ga4-event="vendor_outbound_click"')) fail('hub outbound event missing');
  const detail = read(v.detail);
  if(!detail.includes('V92_VENDOR_CONVERSION_PASS_ACTIVE')) fail(`detail marker missing ${v.detail}`);
  if(!detail.includes(v.image)) fail(`detail missing image ${v.detail}`);
  if(!detail.includes(`data-v92-detail-image="${v.id}"`)) fail(`detail image marker missing ${v.detail}`);
  if(!detail.includes('data-v92-copy="true"')) fail(`detail copy marker missing ${v.detail}`);
  if(!detail.includes('data-ga4-event="vendor_outbound_click"')) fail(`detail outbound event missing ${v.detail}`);
  if(!detail.includes('target="_blank"') || !detail.includes('noopener')) fail(`detail external safety missing ${v.detail}`);
}
const css = read('assets/css/v92-vendor-conversion-pass.css');
for(const needle of ['min-height:52px','focus-visible','v92-copy-toast']) if(!css.includes(needle)) fail(`css missing ${needle}`);
const js = read('assets/js/v92-vendor-conversion-pass.js');
for(const needle of ['vendor_copy_code','vendor_outbound_click','window.open','navigator.clipboard','stopImmediatePropagation']) if(!js.includes(needle)) fail(`js missing ${needle}`);
if(count(hub,'data-v92-card-image') < 5) fail('hub less than 5 v92 card images');
console.log(JSON.stringify({ok:true,version:'V92',vendors:vendors.length,hubImages:count(hub,'data-v92-card-image')},null,2));
