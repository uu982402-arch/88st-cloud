import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = ['index.html','blog/index.html','guaranteed/index.html','tools/index.html','consult/index.html'];
const failures = [];
for (const file of required) {
  const p = path.join(root,file);
  if (!fs.existsSync(p)) { failures.push(`${file}: missing`); continue; }
  const html = fs.readFileSync(p,'utf8');
  const checks = [
    ['body class v70-platform', /<body[^>]*class=["'][^"']*v70-platform/.test(html)],
    ['single v70 header', (html.match(/class="v70-header"/g)||[]).length === 1],
    ['single v70 mobile nav', (html.match(/class="v70-mobile-nav"/g)||[]).length === 1],
    ['v70 css linked', html.includes('v70.stability-platform.css')],
    ['v70 js linked', html.includes('v70.stability-platform.js')],
    ['no v68 mobile nav', !html.includes('v68-mobile-nav')],
    ['no v68 fab', !html.includes('v68-fab')],
    ['no v69 mobile nav', !html.includes('v69-mobile-nav')],
    ['no v69 header', !html.includes('v69-header')],
    ['not empty shell', html.length > 3000]
  ];
  for (const [name, ok] of checks) if (!ok) failures.push(`${file}: ${name}`);
}
const css = fs.readFileSync(path.join(root,'assets/css/v70.stability-platform.css'),'utf8');
if (!/@media \(min-width:721px\)[\s\S]*\.v70-mobile-nav[^}]*display:none!important/.test(css)) failures.push('css: PC mobile nav hide rule missing');
if (!/@media \(max-width:720px\)[\s\S]*env\(safe-area-inset-bottom\)/.test(css)) failures.push('css: mobile safe-area rule missing');
const allHtml = fs.readdirSync(root,{recursive:true}).filter(f=>String(f).endsWith('.html'));
let leakCount = 0;
for (const file of allHtml) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  if (/<nav\b[^>]*class=[\"'][^\"']*v68-mobile-nav/.test(html) || /<a\b[^>]*class=[\"'][^\"']*v68-fab/.test(html)) leakCount++;
}
if (leakCount) failures.push(`legacy v68 nav/fab leak files=${leakCount}`);
if (!fs.existsSync(path.join(root,'V70_1_STABILITY_REPORT.md'))) failures.push('report missing');
if (failures.length) {
  console.error('V70 verification failed');
  for (const f of failures) console.error('- '+f);
  process.exit(1);
}
console.log(`V70 verification passed. html=${allHtml.length}`);
