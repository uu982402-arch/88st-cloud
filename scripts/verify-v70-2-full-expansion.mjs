import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const mustFiles = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html'];
const failures = [];
function read(file){return fs.existsSync(path.join(root,file)) ? fs.readFileSync(path.join(root,file),'utf8') : '';}
for (const file of mustFiles) {
  const html = read(file);
  if (!html) failures.push(`${file}: missing`);
  if (!html.includes('data-v70-2-expansion="true"')) failures.push(`${file}: missing v70-2 css/js marker`);
  if (!html.includes('data-v70-2-component="global-header"')) failures.push(`${file}: missing v70-2 header`);
  if (!html.includes('data-v70-2-component="mobile-nav"')) failures.push(`${file}: missing v70-2 mobile nav`);
  if (/<header\b[^>]*class="[^"]*(v68-header|v67-header|moon-header)/i.test(html)) failures.push(`${file}: legacy header source still in core page`);
}
const css = read('assets/css/v70-2.full-expansion.css');
if (!css.includes('@media (min-width:721px)')) failures.push('css: missing desktop media guard');
if (!css.includes('.v70-2-mobile-nav,.v70-2-sticky-cta{display:none!important}')) failures.push('css: missing desktop mobile-nav hidden rule');
if (!css.includes('env(safe-area-inset-bottom)')) failures.push('css: missing safe-area handling');
const blogFiles = fs.readdirSync(path.join(root,'blog'),{withFileTypes:true}).filter(d=>d.isFile() && d.name.endsWith('.html') && d.name!=='index.html').map(d=>`blog/${d.name}`);
let missingRelated = 0;
for (const file of blogFiles.slice(0,25)) {
  const html = read(file);
  if (!html.includes('data-v70-2-related="true"')) missingRelated++;
  if (!html.includes('data-v70-2-component="global-header"')) failures.push(`${file}: missing v70-2 header`);
}
if (missingRelated) failures.push(`blog details sampled missing related CTA: ${missingRelated}`);
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.includes('generate-v70-2-full-expansion.mjs')) failures.push('package build missing V70-2 generator');
if (pkg.scripts.verify !== 'node scripts/verify-v70-2-full-expansion.mjs') failures.push('package verify not set to V70-2');
if (failures.length) {
  console.error('V70-2 verify failed');
  for (const f of failures) console.error('- '+f);
  process.exit(1);
}
console.log(`V70-2 verify passed. core=${mustFiles.length} sampledBlog=${blogFiles.slice(0,25).length}`);
