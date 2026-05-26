import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const fail = (msg) => { console.error('[V104 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const blog = read('blog/index.html');
const css = read('assets/css/v104-blog-list-comfort-density.css');
const js = read('assets/js/v104-blog-list-comfort-density.js');

if (!blog.includes('data-v104-blog-comfort="active"')) fail('blog html marker missing');
if (!blog.includes('/assets/css/v104-blog-list-comfort-density.css')) fail('V104 CSS link missing');
if (!blog.includes('/assets/js/v104-blog-list-comfort-density.js')) fail('V104 JS script missing');
if (!blog.includes('data-v104-density-toggle')) fail('density toggle missing');
if (!blog.includes('촘촘히') || !blog.includes('편하게')) fail('density toggle labels missing');
if (!css.includes('grid-template-columns:repeat(4,minmax(0,1fr))')) fail('desktop 4-column compact rule missing');
if (!css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) fail('comfort/medium 3-column rule missing');
if (!css.includes('grid-template-columns:repeat(2,minmax(0,1fr))')) fail('mobile 2-column rule missing');
if (!css.includes('data-blog-density="comfort"')) fail('comfort density selector missing');
if (!js.includes('rust.blogDensity.v104')) fail('density localStorage key missing');

const cards = (blog.match(/class="v72-blog-card"/g) || []).length;
if (cards < 40) fail(`too few blog cards in index: ${cards}`);
const longSummary = [...blog.matchAll(/<a class="v72-blog-card"[\s\S]*?<p>([\s\S]*?)<\/p>/g)]
  .map((m) => m[1].replace(/<[^>]*>/g,'').trim())
  .filter((s) => s.length > 110);
if (longSummary.length > 0) fail(`long blog card summaries remain: ${longSummary.length}`);

const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const p = path.join(ROOT, sm);
    if (fs.existsSync(p) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}

console.log('[V104 VERIFY PASS] blog list comfort/density patch is active');
