import fs from 'fs';
import path from 'path';
const ROOT=process.cwd();
function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(['node_modules','.git'].includes(ent.name)) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walk(p));
    else if(ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function assertFile(p){ if(!fs.existsSync(path.join(ROOT,p))) throw new Error(`Missing required file: ${p}`); }
[
  'assets/img/rust/rust-crest-transparent.png',
  'assets/img/rust/rust-crest-32.png',
  'assets/img/rust/rust-crest-192.png',
  'assets/img/rust/rust-crest-512.png',
  'assets/img/rust/rust-og.jpg',
  'assets/css/v77.rust-logo-assets.css',
  'assets/js/v77.rust-logo-assets.js',
  'favicon.ico',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'site.webmanifest',
  'V77_RUST_LOGO_ASSET_MANIFEST.json'
].forEach(assertFile);
const files=walk(ROOT).filter(f=>!path.relative(ROOT,f).replaceAll('\\','/').startsWith('admin/'));
const bad=[];
for(const f of files){
  const r=path.relative(ROOT,f).replaceAll('\\','/');
  const s=fs.readFileSync(f,'utf8');
  if(s.includes('/assets/img/rust/rust-emblem.svg')) bad.push(`${r}: old rust-emblem.svg reference`);
  if(s.includes('apple-touch-icon-v24.png') || s.includes('apple-touch-icon-v23.png') || s.includes('apple-touch-icon-v19.png') || s.includes('apple-touch-icon-180.png')) bad.push(`${r}: old apple icon reference`);
  if(s.includes('/img/logo-v24.png')) bad.push(`${r}: old logo preload/reference`);
  if(!r.startsWith('ops/') && !s.includes('v77.rust-logo-assets.css')) bad.push(`${r}: missing V77 CSS`);
  if(!r.startsWith('ops/') && !s.includes('v77.rust-logo-assets.js')) bad.push(`${r}: missing V77 JS`);
}
if(fs.existsSync(path.join(ROOT,'assets/img/rust/rust-emblem.svg'))) bad.push('old rust-emblem.svg file still exists');
if(bad.length){
  console.error(bad.slice(0,50).join('\n'));
  throw new Error(`V77 logo asset verification failed: ${bad.length} issue(s)`);
}
console.log(`[verify-v77] ok html=${files.length}`);
