import fs from 'fs';
import path from 'path';
const root = process.cwd();
const requiredAssets = [
  'assets/img/guaranteed/cards/sk-holdings.webp',
  'assets/img/guaranteed/cards/queenbee.webp',
  'assets/img/guaranteed/cards/anybet.webp',
  'assets/img/guaranteed/cards/udt-bet.webp',
  'assets/img/guaranteed/cards/ddangkong-bet.webp',
  'assets/img/partners/v71-sk-holdings.webp',
  'assets/img/partners/v71-queenbee.webp',
  'assets/img/partners/v71-anybet.webp',
  'assets/img/partners/v71-udt-bet.webp',
  'assets/img/partners/v71-ddangkong-bet.webp',
  'assets/css/v78.guaranteed-card-images.css',
];
const requiredPages = [
  'index.html',
  'guaranteed/index.html',
  'guaranteed/sk-holdings/index.html',
  'guaranteed/queenbee/index.html',
  'guaranteed/anybet/index.html',
  'guaranteed/udt/index.html',
  'guaranteed/ddangkong/index.html',
];
const requiredRefs = [
  '/assets/img/guaranteed/cards/sk-holdings.webp',
  '/assets/img/guaranteed/cards/queenbee.webp',
  '/assets/img/guaranteed/cards/anybet.webp',
  '/assets/img/guaranteed/cards/udt-bet.webp',
  '/assets/img/guaranteed/cards/ddangkong-bet.webp',
];
const mainRefs = [
  '/assets/img/partners/v71-sk-holdings.webp',
  '/assets/img/partners/v71-queenbee.webp',
  '/assets/img/partners/v71-anybet.webp',
  '/assets/img/partners/v71-udt-bet.webp',
  '/assets/img/partners/v71-ddangkong-bet.webp',
];
const failures = [];
for (const rel of requiredAssets) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) failures.push(`missing asset: ${rel}`);
  else if (rel.endsWith('.webp') && fs.statSync(p).size < 1024) failures.push(`image asset too small or broken: ${rel}`);
}
for (const rel of requiredPages) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`missing page: ${rel}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('v78-guaranteed-card-images')) failures.push(`missing V78 marker: ${rel}`);
  if (rel.startsWith('guaranteed/')) {
    for (const ref of requiredRefs) {
      if (rel === 'guaranteed/index.html' && !html.includes(ref)) failures.push(`missing guaranteed ref ${ref} in ${rel}`);
    }
    if (html.includes('/assets/img/guaranteed/cards/sk-holdings.svg') || html.includes('/assets/img/guaranteed/cards/queenbee.svg') || html.includes('/assets/img/guaranteed/cards/anybet.svg') || html.includes('/assets/img/guaranteed/cards/udt-bet.svg') || html.includes('/assets/img/guaranteed/cards/ddangkong-bet.svg')) {
      failures.push(`legacy SVG card ref remains in ${rel}`);
    }
  }
}
const main = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const ref of mainRefs) {
  if (!main.includes(ref)) failures.push(`missing main partner ref: ${ref}`);
}
if (main.includes('/assets/img/partners/v71-sk-holdings.svg') || main.includes('/assets/img/partners/v71-queenbee.svg') || main.includes('/assets/img/partners/v71-anybet.svg') || main.includes('/assets/img/partners/v71-udt-bet.svg') || main.includes('/assets/img/partners/v71-ddangkong-bet.svg')) failures.push('legacy main partner SVG ref remains in index.html');
if (failures.length) {
  console.error('[V78 verify] failed');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log('[V78-1 verify] ok: guaranteed card images exist, are webp-linked, and are protected against missing-asset build failure.');
