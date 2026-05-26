import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const removed = ['faq','consult-motives','consult-result','provider-updates'];
const required = ['index.html','guaranteed/index.html','assets/css/v102-1-ad-image-grid-hotfix.css'];
const vendors = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
let fail = [];
for (const p of required) if (!fs.existsSync(path.join(ROOT,p))) fail.push(`missing ${p}`);
for (const d of removed) if (fs.existsSync(path.join(ROOT,d))) fail.push(`removed route regenerated: ${d}`);
const index = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const guaranteed = fs.readFileSync(path.join(ROOT,'guaranteed/index.html'),'utf8');
const css = fs.readFileSync(path.join(ROOT,'assets/css/v102-1-ad-image-grid-hotfix.css'),'utf8');
for (const [name, html] of [['index', index], ['guaranteed', guaranteed]]) {
  if (!html.includes('v102-1-ad-image-grid-hotfix.css')) fail.push(`${name} missing V102.1 CSS`);
  if (!html.includes('data-v102-1-ad-image-grid')) fail.push(`${name} missing V102.1 marker`);
}
if (!/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/.test(css)) fail.push('CSS missing forced 3-column grid rule');
if (!/aspect-ratio:3\/4!important/.test(css)) fail.push('CSS missing main vertical image frame');
if (!/aspect-ratio:16\/9!important/.test(css)) fail.push('CSS missing guaranteed horizontal image frame');
if (!/object-fit:contain!important/.test(css)) fail.push('CSS missing contain image protection');
for (const v of vendors) {
  if (!index.includes(`/guaranteed/${v === 'sk-holdings' ? 'sk-holdings' : v}/`)) fail.push(`home missing vendor link ${v}`);
  if (!guaranteed.includes(`data-vendor="${v}"`)) fail.push(`guaranteed missing vendor card ${v}`);
}
const sitemapFiles = ['sitemap.xml','sitemap.txt','serverless/sitemap.xml'].filter(p=>fs.existsSync(path.join(ROOT,p)));
for (const sm of sitemapFiles) {
  const text = fs.readFileSync(path.join(ROOT,sm),'utf8');
  for (const d of removed) if (text.includes(`/${d}/`) || text.includes(`/${d}`)) fail.push(`${sm} contains removed route ${d}`);
}
if (fail.length) { console.error('V102.1 verification failed:\n' + fail.join('\n')); process.exit(1); }
console.log('V102.1 verification passed');
