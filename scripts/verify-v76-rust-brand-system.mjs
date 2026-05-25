import fs from 'fs';
import path from 'path';
const ROOT=process.cwd();
function read(p){return fs.readFileSync(path.join(ROOT,p),'utf8');}
const required=[
  'assets/css/v76.rust-brand-system.css',
  'assets/js/v76.rust-brand-system.js',
  'assets/img/rust/rust-emblem.svg',
  'scripts/generate-v76-rust-brand-system.mjs'
];
const missing=required.filter(p=>!fs.existsSync(path.join(ROOT,p)));
if(missing.length){console.error('V76 missing files',missing);process.exit(1);}
const pages=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html'];
const errors=[];
for(const p of pages){
  const h=read(p);
  if(!h.includes('rust-global-header')) errors.push(`${p}: missing RUST header`);
  if(!h.includes('rust-bottom-nav')) errors.push(`${p}: missing RUST bottom nav`);
  if(!h.includes('v76.rust-brand-system.css')) errors.push(`${p}: missing V76 CSS`);
  if(!h.includes('v76.rust-brand-system.js')) errors.push(`${p}: missing V76 JS`);
  if(!h.includes('RUST')) errors.push(`${p}: missing RUST brand`);
  if(!h.includes('온라인스포츠토토사이트추천')) errors.push(`${p}: missing target keywords`);
}
const index=read('index.html');
if(!/<title>RUST \| 2026 토토사이트추천 및 입플사이트 분석 허브<\/title>/.test(index)) errors.push('index: title template mismatch');
if(!read('assets/css/v76.rust-brand-system.css').includes('--rust-orange:#f97316')) errors.push('css: rust orange token missing');
if(errors.length){console.error('V76 verification failed');for(const e of errors) console.error('-',e);process.exit(1);}
console.log('V76 verification passed', {pages:pages.length});
