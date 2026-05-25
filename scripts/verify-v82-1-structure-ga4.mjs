import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V82_1_STRUCTURE_GA4_ACTIVE';
const GA_ID = 'G-KWT87FBY6S';

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

const failures = [];
function must(condition, message) {
  if (!condition) failures.push(message);
}

must(exists('assets/js/v82.ga4-events.js'), 'missing assets/js/v82.ga4-events.js');
must(exists('assets/css/v82.structure-guard.css'), 'missing assets/css/v82.structure-guard.css');
must(exists('scripts/generate-v82-1-structure-ga4.mjs'), 'missing generate-v82 script');

const pkg = JSON.parse(read('package.json'));
must(String(pkg.scripts.build || '').includes('generate-v82-1-structure-ga4.mjs'), 'package build does not include V82-1 generator');
must(String(pkg.scripts.verify || '').includes('verify-v82-1-structure-ga4.mjs'), 'package verify is not V82-1 verifier');

const robots = read('robots.txt');
must(/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots), 'robots.txt missing sitemap line');

const keyChecks = [
  ['index.html', 'V81_2_MAIN_TITLE_CLEAN_ACTIVE'],
  ['blog/index.html', 'V72_1_BLOG_LOCK_ACTIVE'],
  ['tools/index.html', 'V73_TOOLS_DASHBOARD_ACTIVE'],
  ['guaranteed/index.html', 'V74_1_GUARANTEED_CARD_LAYOUT_ACTIVE'],
  ['consult/index.html', 'data-v75-consult="active"'],
  ['sports-check/index.html', 'V79_RUST_LONGFORM_HUBS_ACTIVE'],
  ['search-guides/index.html', 'V79_RUST_LONGFORM_HUBS_ACTIVE'],
  ['ops/index.html', 'V80_OPS_CONTROL_CENTER_ACTIVE']
];

for (const [file, needle] of keyChecks) {
  const html = read(file);
  must(html.includes(needle), `${file} missing structure marker ${needle}`);
}

const index = read('index.html');
for (const banned of ['88ST.CLOUD PLATFORM', '자동 상담 시작', 'RUST MOTION HUB']) {
  must(!index.includes(banned), `index.html contains removed title/CTA text: ${banned}`);
}
must((index.match(/data-v811-blog-card=/g) || []).length === 15, 'index blog card slot count is not 15');
must((index.match(/data-v811-sports-card=/g) || []).length === 5, 'index sports card slot count is not 5');
must((index.match(/data-v811-guides-card=/g) || []).length === 5, 'index guide card slot count is not 5');

for (const file of walk(ROOT)) {
  const fileRel = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  must(html.includes(MARKER), `${fileRel} missing V82-1 marker`);

  if (!/^(ops|admin)\//.test(fileRel)) {
    must(html.includes(`name="rust-ga4-id" content="${GA_ID}"`), `${fileRel} missing GA4 meta id`);
    must(html.includes('/assets/js/v82.ga4-events.js'), `${fileRel} missing V82 GA4 event script`);
    must(html.includes('/assets/css/v82.structure-guard.css'), `${fileRel} missing V82 structure guard CSS`);
  }

  must(!/googletagmanager\.com\/gtag\/js\?id=/i.test(html), `${fileRel} still contains legacy direct gtag loader`);
}

const admin = read('admin/index.html');
const ops = read('ops/index.html');
must(/noindex,nofollow,noarchive/i.test(admin), 'admin is not noindex');
must(/noindex,nofollow,noarchive/i.test(ops), 'ops is not noindex');

if (failures.length) {
  console.error('[V82-1] verify failed');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}

console.log(`[V82-1] verify ok. html=${walk(ROOT).length} ga4=${GA_ID} marker=${MARKER}`);
