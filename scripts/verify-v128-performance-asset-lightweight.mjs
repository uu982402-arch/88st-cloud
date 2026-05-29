import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const exists = f => fs.existsSync(p(f));
const read = f => fs.readFileSync(p(f), 'utf8');
const errors = [];
const assert = (cond, msg) => { if (!cond) errors.push(msg); };

for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  assert(!exists(`${r}/index.html`), `Removed route regenerated: ${r}/index.html`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if (exists(sm)) assert(!read(sm).includes(`/${r}/`), `Removed route in ${sm}: ${r}`);
}

const cssFile = 'assets/css/v128-performance-asset-lightweight.css';
assert(exists(cssFile), 'Missing V128 CSS file');
const css = exists(cssFile) ? read(cssFile) : '';
for (const token of ['V128 PERFORMANCE','content-visibility:auto','contain-intrinsic-size','v128-ops-performance-panel','data-v128-img']) {
  assert(css.includes(token), `Missing V128 CSS token: ${token}`);
}
assert(exists('assets/asset-manifest-v128.json'), 'Missing V128 asset manifest');
assert(exists('reports/v128-performance-asset-audit.json'), 'Missing V128 performance asset audit');
assert(exists('reports/v128-remove-candidates.txt'), 'Missing V128 remove candidates report');
assert(exists('V128_PATCH_MANIFEST.json'), 'Missing V128 patch manifest');
assert(exists('V128_UPGRADE_REPORT.md'), 'Missing V128 upgrade report');

const keyPages = ['index.html','tools/index.html','guaranteed/index.html','blog/index.html','sports-check/index.html','search-guides/index.html','consult/index.html','ops/index.html'];
for (const file of keyPages) {
  assert(exists(file), `Missing key page: ${file}`);
  if (!exists(file)) continue;
  const h = read(file);
  assert(h.includes('data-v128-performance="active"'), `Missing html V128 marker in ${file}`);
  assert(h.includes('data-v128-performance="true"'), `Missing body V128 marker in ${file}`);
  assert(h.includes('V128_PERFORMANCE_ASSET_LIGHTWEIGHT_ACTIVE'), `Missing V128 meta in ${file}`);
  assert(h.includes('v128-performance-asset-lightweight.css'), `Missing V128 CSS link in ${file}`);
  assert(h.includes('v127-mobile-qa-safe-area-lock.css'), `V127 mobile CSS link lost in ${file}`);
  assert(h.includes('data-v128-img="lightweight"') || !h.includes('<img'), `No V128 image marker in ${file}`);
}

const idx = read('index.html');
for (const token of ['RUST QUICK CHECK','검색·스포츠 체크·보증업체를 첫 화면에서 바로 확인','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed']) {
  assert(!idx.includes(token), `V120 duplicate first-fold token regenerated: ${token}`);
}
assert(idx.includes('data-v126-consult-polish="true"'), 'V126 bottom consult section missing');
assert(idx.includes('마지막 확인은 공식 상담봇에서 짧게 정리하세요.'), 'V126 consult headline missing');
assert(!idx.includes('조건이 애매하면 공식 상담센터에서 바로 확인하세요.'), 'Old consult headline returned');
assert(!idx.includes('class="v71-fab"'), 'Floating Telegram FAB returned in index');
assert(idx.includes('data-v115-main-tool="sports"'), 'V115 home modal tool trigger missing');
assert(idx.includes('프리미엄 보증업체'), 'Home guaranteed section missing');

const guaranteed = read('guaranteed/index.html');
for (const token of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준']) {
  assert(!guaranteed.includes(token), `Forbidden guaranteed card token returned: ${token}`);
}
for (const slug of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  assert(exists(`guaranteed/${slug}/index.html`), `Missing vendor landing: ${slug}`);
}

const visibleIndex = idx.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<meta[^>]*>/g, '');
for (const token of ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크','관련 링크','관련 확인','RELATED']) {
  assert(!visibleIndex.includes(token), `Bottom related token returned in index visible markup: ${token}`);
}

const htmlFiles = [];
function walk(dir){
  for (const ent of fs.readdirSync(p(dir), { withFileTypes:true })) {
    const rel = path.join(dir, ent.name).replace(/\\/g,'/');
    if (['faq','consult-motives','consult-result','provider-updates'].some(r => rel === r || rel.startsWith(r + '/'))) continue;
    if (ent.isDirectory()) walk(rel);
    else if (ent.isFile() && rel.endsWith('.html')) htmlFiles.push(rel);
  }
}
walk('.');
let imgCount = 0, missingDecoding = 0, missingLoading = 0, lazyHighPriority = 0;
for (const file of htmlFiles) {
  const h = read(file);
  const imgs = h.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgs) {
    imgCount++;
    if (!/\sdecoding=["']async["']/i.test(tag)) missingDecoding++;
    if (!/\sloading=["'](lazy|eager)["']/i.test(tag)) missingLoading++;
    if (/loading=["']lazy["']/i.test(tag) && /fetchpriority=["']high["']/i.test(tag)) lazyHighPriority++;
  }
}
assert(imgCount > 0, 'No image tags found');
assert(missingDecoding === 0, `Image tags missing decoding async: ${missingDecoding}`);
assert(missingLoading === 0, `Image tags missing loading attr: ${missingLoading}`);
assert(lazyHighPriority === 0, `Lazy images with high fetchpriority: ${lazyHighPriority}`);

const ops = read('ops/index.html');
assert(ops.includes('id="v128-performance-center"'), 'OPS V128 panel missing');
assert(ops.includes('V128 PERFORMANCE LOCK ONLINE'), 'OPS V128 status text missing');

const pkg = JSON.parse(read('package.json'));
assert(pkg.scripts.verify === 'node scripts/verify-v128-performance-asset-lightweight.mjs', 'package verify not locked to V128');
assert(pkg.scripts.build.includes('generate-v128-performance-asset-lightweight.mjs'), 'build chain missing V128 generator');
assert(pkg.scripts['quality:v128'] === 'node scripts/generate-v128-performance-asset-lightweight.mjs', 'quality:v128 script missing');
assert(pkg.scripts['verify:v128'] === 'node scripts/verify-v128-performance-asset-lightweight.mjs', 'verify:v128 script missing');

if (errors.length) {
  console.error('V128 verify failed:');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log('V128 verify passed.');
