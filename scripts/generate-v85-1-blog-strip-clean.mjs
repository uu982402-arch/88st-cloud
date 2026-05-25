import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogIndexPath = path.join(root, 'blog', 'index.html');

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}
function write(file, data) {
  fs.writeFileSync(file, data, 'utf8');
}
function removeSeoStrip(html) {
  let next = html;
  next = next.replace(/\n?<!-- V82-2 SEO CONTENT START -->[\s\S]*?<!-- V82-2 SEO CONTENT END -->\n?/g, '\n');
  next = next.replace(/\n?<section\s+class="v82-seo-strip"[\s\S]*?<\/section>\n?/g, '\n');
  next = next.replace(/\n{3,}/g, '\n\n');
  return next;
}

let html = read(blogIndexPath);
if (!html) throw new Error('blog/index.html not found');
const before = html;
html = removeSeoStrip(html);
html = html.replace('data-v85-seo-content-30="true"', 'data-v85-seo-content-30="true" data-v85-1-blog-strip-clean="true"');
if (!html.includes('data-v85-1-blog-strip-clean="true"')) {
  html = html.replace('<main class="v72-blog-main">', '<main class="v72-blog-main" data-v85-1-blog-strip-clean="true">');
}
write(blogIndexPath, html);

const changed = before !== html;
console.log(`[V85-1] blog SEO strip cleaned. changed=${changed}`);
