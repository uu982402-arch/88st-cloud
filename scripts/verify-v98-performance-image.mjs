import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
function walk(dir,out=[]){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git'].includes(ent.name)) continue; const p=path.join(dir,ent.name); if(ent.isDirectory()) walk(p,out); else if(ent.isFile()) out.push(p);} return out;}
function fail(msg){console.error('[V98 VERIFY FAIL]',msg); process.exit(1)}
function read(p){return fs.readFileSync(path.join(ROOT,p),'utf8')}
for(const f of ['assets/css/v98-performance-image.css','assets/js/v98-performance-image.js','assets/data/v98-performance-image.json','scripts/generate-v98-performance-image.mjs']){if(!fs.existsSync(path.join(ROOT,f))) fail(`${f} missing`)}
const pkg=JSON.parse(read('package.json'));
if(!pkg.scripts.build.includes('generate-v98-performance-image.mjs')) fail('build chain missing V98 generator');
if(pkg.scripts.verify!=='node scripts/verify-v98-performance-image.mjs') fail('default verify not set to V98');
const htmlFiles=walk(ROOT).filter(f=>f.endsWith('.html'));
if(htmlFiles.length<600) fail(`unexpected html count ${htmlFiles.length}`);
let totalImgs=0, high=0, logoHigh=0, missingAttrs=0, visibleLogo192=0, missingMarker=0, nonWebpVendor=0;
for(const file of htmlFiles){
 const s=fs.readFileSync(file,'utf8');
 if(!s.includes('v98-performance-image')) missingMarker++;
 const tags=s.match(/<img\b[^>]*>/gi)||[];
 for(const tag of tags){
  totalImgs++;
  const src=(tag.match(/\ssrc="([^"]+)"/i)||[])[1]||'';
  for(const attr of ['width','height','loading','decoding']) if(!new RegExp(`\\s${attr}=`,'i').test(tag)) missingAttrs++;
  if(/fetchpriority="high"/i.test(tag)) high++;
  if(/rust-crest-.*\.png/i.test(src) && /fetchpriority="high"/i.test(tag)) logoHigh++;
  if(src==='/assets/img/rust/rust-crest-192.png' && /width="4[028]"/i.test(tag)) visibleLogo192++;
  if(src.includes('/assets/img/guaranteed/cards/') && !src.endsWith('.webp')) nonWebpVendor++;
 }
}
if(missingMarker) fail(`${missingMarker} html files missing V98 marker`);
if(totalImgs<700) fail(`unexpected image count ${totalImgs}`);
if(missingAttrs) fail(`${missingAttrs} image attr problems`);
if(logoHigh) fail(`${logoHigh} logo images still fetchpriority high`);
if(visibleLogo192) fail(`${visibleLogo192} visible header logos still use 192px asset`);
if(high>10) fail(`too many high priority images: ${high}`);
if(nonWebpVendor) fail(`${nonWebpVendor} vendor card images not webp`);
for(const p of ['guaranteed/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html']){
 const s=read(p); if(!s.includes('v96-5-guaranteed-conversion')) fail(`${p} lost V96.5 marker`); if(!s.includes('v98-performance-image')) fail(`${p} missing V98 marker`);
}
console.log(`[V98 VERIFY PASS] html=${htmlFiles.length} img=${totalImgs} high=${high}`);
