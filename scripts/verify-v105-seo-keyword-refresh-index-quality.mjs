import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const fail = (msg) => { console.error('[V105 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const removed = ['faq','consult-motives','consult-result','provider-updates'];

for (const file of ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','sports-check/index.html','search-guides/index.html','consult/index.html']) {
  if (!exists(file)) fail(`required hub missing: ${file}`);
  const html = read(file);
  if (!html.includes('data-v105-seo-keyword-refresh="active"')) fail(`v105 marker missing: ${file}`);
  if (!/<meta\s+name=["']description["']\s+content=["'][^"']{50,170}["']/.test(html)) fail(`description length invalid: ${file}`);
  if (!/<link[^>]+rel=["']canonical["']/.test(html)) fail(`canonical missing: ${file}`);
}
const blogIndex = read('blog/index.html');
if (!blogIndex.includes('data-v105-keyword-buckets')) fail('blog keyword bucket bar missing');
if ((blogIndex.match(/<a class="v72-blog-card"/g) || []).length < 40) fail('blog card count unexpectedly low');

const titleMap = new Map();
const descMap = new Map();
let noindex = [];
let shortDesc = [];
let missingCanon = [];
let missingH1 = [];
function walk(dir){
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const rel = path.relative(ROOT, p).replaceAll(path.sep,'/');
      const html = fs.readFileSync(p,'utf8');
      const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
      const desc = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i)?.[1]?.trim();
      if (title) titleMap.set(title, [...(titleMap.get(title)||[]), rel]);
      if (desc) {
        descMap.set(desc, [...(descMap.get(desc)||[]), rel]);
        if (desc.length < 50) shortDesc.push(rel);
      } else shortDesc.push(rel);
      if (/<meta\s+name=["']robots["']\s+content=["']noindex/i.test(html)) noindex.push(rel);
      if (!/<link[^>]+rel=["']canonical["']/.test(html)) missingCanon.push(rel);
      if (rel !== 'blog/index.html' && !/<h1[^>]*>/i.test(html)) missingH1.push(rel);
    }
  }
}
walk(path.join(ROOT,'blog'));
const dupTitles = [...titleMap.values()].filter(v => v.length > 1);
const dupDescs = [...descMap.values()].filter(v => v.length > 1);
if (dupTitles.length) fail(`duplicate blog title count: ${dupTitles.length}`);
if (dupDescs.length) fail(`duplicate blog description count: ${dupDescs.length}`);
if (shortDesc.length) fail(`short/missing blog description count: ${shortDesc.length}`);
if (noindex.length) fail(`blog noindex count: ${noindex.length}`);
if (missingCanon.length) fail(`blog canonical missing count: ${missingCanon.length}`);
if (missingH1.length) fail(`blog h1 missing count: ${missingH1.length}`);

for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    if (exists(sm) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
if (exists('robots.txt')) {
  const robots = read('robots.txt');
  for (const dis of ['/analysis/','/faq/','/consult-motives/','/consult-result/','/provider-updates/']) {
    if (!robots.includes(`Disallow: ${dis}`)) fail(`robots missing ${dis}`);
  }
}
console.log('[V105 VERIFY PASS] SEO keyword refresh, duplicate meta, canonical, noindex, and removed-route checks passed');
