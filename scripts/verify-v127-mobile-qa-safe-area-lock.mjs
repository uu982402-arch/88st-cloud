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

const cssFile = 'assets/css/v127-mobile-qa-safe-area-lock.css';
assert(exists(cssFile), 'Missing V127 CSS file');
const css = exists(cssFile) ? read(cssFile) : '';
for (const token of ['V127 MOBILE QA','--v127-safe-bottom','overflow-x:hidden','viewport-fit=cover','min-height:var(--v127-touch)','safe-area-inset-bottom','v127-ops-mobile-panel']) {
  assert(css.includes(token), `Missing V127 CSS token: ${token}`);
}

const keyPages = ['index.html','tools/index.html','guaranteed/index.html','blog/index.html','sports-check/index.html','search-guides/index.html','consult/index.html','ops/index.html'];
for (const file of keyPages) {
  assert(exists(file), `Missing key page: ${file}`);
  if (!exists(file)) continue;
  const h = read(file);
  assert(h.includes('data-v127-mobile-qa="active"'), `Missing html marker in ${file}`);
  assert(h.includes('data-v127-mobile-qa="true"'), `Missing body marker in ${file}`);
  assert(h.includes('V127_MOBILE_QA_SAFE_AREA_LOCK_ACTIVE'), `Missing V127 meta in ${file}`);
  assert(h.includes('v127-mobile-qa-safe-area-lock.css'), `Missing V127 CSS link in ${file}`);
  assert(/name=["']viewport["'][^>]+viewport-fit=cover/i.test(h), `Missing viewport-fit=cover in ${file}`);
}

const idx = read('index.html');
for (const token of ['RUST QUICK CHECK','검색·스포츠 체크·보증업체를 첫 화면에서 바로 확인','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed']) {
  assert(!idx.includes(token), `V120 duplicate first-fold token regenerated: ${token}`);
}
assert(idx.includes('data-v126-consult-polish="true"'), 'V126 bottom consult section missing');
assert(idx.includes('마지막 확인은 공식 상담봇에서 짧게 정리하세요.'), 'V126/V127 consult headline missing');
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

const allIndexMarkup = idx.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<meta[^>]*>/g, '');
for (const token of ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크','관련 링크','관련 확인','RELATED']) {
  assert(!allIndexMarkup.includes(token), `Bottom related token returned in index visible markup: ${token}`);
}

assert(exists('reports/v127-mobile-qa-audit.json'), 'Missing V127 audit report');
assert(exists('reports/v127-remove-candidates.txt'), 'Missing V127 remove candidates report');
assert(exists('V127_PATCH_MANIFEST.json'), 'Missing V127 patch manifest');
assert(exists('V127_UPGRADE_REPORT.md'), 'Missing V127 upgrade report');
const pkg = JSON.parse(read('package.json'));
assert(pkg.scripts.verify === 'node scripts/verify-v127-mobile-qa-safe-area-lock.mjs', 'package verify not locked to V127');
assert(pkg.scripts.build.includes('generate-v127-mobile-qa-safe-area-lock.mjs'), 'build chain missing V127 generator');

if (errors.length) {
  console.error('V127 verify failed:');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log('V127 verify passed.');
