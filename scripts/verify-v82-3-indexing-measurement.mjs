import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V82_3_INDEXING_MEASUREMENT_ACTIVE';
const GA_ID = 'G-KWT87FBY6S';
const required = [
  'package.json',
  'ops/index.html',
  'robots.txt',
  'sitemap.xml',
  'assets/css/v82-3-indexing-ops.css',
  'assets/js/v82-3-indexing-ops.js',
  'assets/data/v82-3-indexing-targets.json',
  'scripts/generate-v82-3-indexing-measurement.mjs',
  'scripts/verify-v82-3-indexing-measurement.mjs'
];
function file(rel) { return path.join(ROOT, rel); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function must(condition, message) { if (!condition) throw new Error(message); }
function htmlFiles(dir) {
  const out = [];
  const start = file(dir);
  if (!fs.existsSync(start)) return out;
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const p = path.join(current, item.name);
      if (item.isDirectory()) stack.push(p);
      else if (item.isFile() && item.name.endsWith('.html')) out.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    }
  }
  return out.sort();
}
for (const rel of required) must(exists(rel), `missing ${rel}`);
const pkg = JSON.parse(read('package.json'));
must(String(pkg.scripts.build || '').includes('generate-v82-3-indexing-measurement.mjs'), 'build chain missing V82-3 generator');
must(String(pkg.scripts.verify || '').includes('verify-v82-3-indexing-measurement.mjs'), 'verify script is not V82-3 verifier');
const ops = read('ops/index.html');
must(ops.includes(MARKER), 'ops missing V82-3 marker');
must(ops.includes('/assets/css/v82-3-indexing-ops.css'), 'ops missing V82-3 CSS');
must(ops.includes('/assets/js/v82-3-indexing-ops.js'), 'ops missing V82-3 JS');
must(ops.includes('색인 · GA4 측정 안정화 센터'), 'ops missing indexing center UI');
must(ops.includes('href="#indexing"'), 'ops sidebar missing indexing anchor');
must(/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(ops), '/ops must remain noindex');
const admin = exists('admin/index.html') ? read('admin/index.html') : '';
must(!admin || /noindex/i.test(admin), '/admin must remain noindex');
const robots = read('robots.txt');
must(/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots), 'robots.txt missing sitemap line');
const data = JSON.parse(read('assets/data/v82-3-indexing-targets.json'));
must(data.marker === MARKER, 'data marker mismatch');
must(data.ga4.measurementId === GA_ID, 'GA4 measurement id mismatch');
must(Array.isArray(data.ga4.events) && data.ga4.events.length >= 8, 'GA4 event list too short');
must(Array.isArray(data.newSeoPosts) && data.newSeoPosts.length === 20, 'new SEO post count is not 20');
must(Array.isArray(data.indexingUrls) && data.indexingUrls.length >= 30, 'indexing URL list too short');
const sitemap = read('sitemap.xml');
for (const post of data.newSeoPosts) {
  must(sitemap.includes(post.url), `sitemap missing ${post.url}`);
  const rel = post.path || post.url.replace('https://88st.cloud/', '').replace(/\/$/, '.html');
  must(exists(rel), `missing new SEO post file ${rel}`);
}
for (const rel of ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html']) {
  must(exists(rel), `missing core page ${rel}`);
  const html = read(rel);
  must(/<link\s+rel=["']canonical["']/i.test(html), `${rel} missing canonical`);
  must(!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html), `${rel} unexpectedly noindex`);
  must(html.includes('/assets/js/v82.ga4-events.js'), `${rel} missing GA4 event script`);
}
const allHtml = htmlFiles('.');
let ga4Tagged = 0;
for (const rel of allHtml) {
  const html = read(rel);
  if (html.includes('/assets/js/v82.ga4-events.js')) ga4Tagged += 1;
}
must(ga4Tagged >= 600, `too few GA4 tagged html files: ${ga4Tagged}`);
console.log(`[V82-3 verify] ok html=${allHtml.length} ga4Tagged=${ga4Tagged} newSeo=${data.newSeoPosts.length} indexing=${data.indexingUrls.length}`);
