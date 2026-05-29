import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const exists = f => fs.existsSync(p(f));
const read = f => fs.readFileSync(p(f), 'utf8');
const errors = [];
const assert = (cond, msg) => { if (!cond) errors.push(msg); };
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  assert(!exists(`${r}/index.html`), `Removed route regenerated: ${r}/index.html`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if (exists(sm)) assert(!read(sm).includes(`/${r}/`), `Removed route in ${sm}: ${r}`);
}
const reqFiles = ['assets/css/v129-seo-schema-consult-strip.css','reports/v129-seo-schema-audit.json','reports/v129-remove-candidates.txt','V129_PATCH_MANIFEST.json','V129_UPGRADE_REPORT.md'];
for (const f of reqFiles) assert(exists(f), `Missing V129 file: ${f}`);
const css = exists('assets/css/v129-seo-schema-consult-strip.css') ? read('assets/css/v129-seo-schema-consult-strip.css') : '';
for (const token of ['V129 SEO META','v129-consult-strip','min-height:54px','v129-ops-seo-panel']) assert(css.includes(token), `Missing V129 CSS token: ${token}`);
const keyPages = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','sports-check/index.html','search-guides/index.html','consult/index.html','ops/index.html'];
for (const file of keyPages) {
  assert(exists(file), `Missing key page: ${file}`);
  if (!exists(file)) continue;
  const h = read(file);
  assert(h.includes('data-v129-seo-schema="active"'), `Missing html V129 marker: ${file}`);
  assert(h.includes('data-v129-seo-schema="true"'), `Missing body V129 marker: ${file}`);
  assert(h.includes('V129_SEO_META_OG_SCHEMA_FINAL_ACTIVE'), `Missing V129 meta marker: ${file}`);
  assert(h.includes('v129-seo-schema-consult-strip.css'), `Missing V129 CSS link: ${file}`);
  assert(/<link rel="canonical" href="https:\/\/88st\.cloud\//.test(h), `Missing canonical: ${file}`);
  assert(/<meta property="og:url" content="https:\/\/88st\.cloud\//.test(h), `Missing og:url: ${file}`);
  assert(/<meta property="og:title" content="[^"]{8,}"/.test(h), `Missing og:title: ${file}`);
  assert(/<meta property="og:description" content="[^"]{40,}"/.test(h), `Missing og:description: ${file}`);
  assert(h.includes('data-v129-schema="true"'), `Missing V129 JSON-LD schema: ${file}`);
  assert(h.includes('BreadcrumbList'), `Missing BreadcrumbList schema: ${file}`);
}
const idx = read('index.html');
assert(idx.includes('data-v129-consult-strip="true"'), 'V129 compact consult strip missing in index');
assert(idx.includes('공식 상담봇'), 'Compact consult label missing');
assert(idx.includes('@TRS999_bot 열기'), 'Compact consult button missing');
for (const token of ['마지막 확인은 공식 상담봇에서 짧게 정리하세요.','공식주소, 가입코드, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 항목만','조건이 애매하면 공식 상담센터에서 바로 확인하세요.','RUST QUICK CHECK','검색·스포츠 체크·보증업체를 첫 화면에서 바로 확인','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed','class="v71-fab"','24H']) {
  assert(!idx.includes(token), `Forbidden/redundant index token returned: ${token}`);
}
const guaranteed = read('guaranteed/index.html');
for (const token of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준']) assert(!guaranteed.includes(token), `Forbidden guaranteed token returned: ${token}`);
for (const slug of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) assert(exists(`guaranteed/${slug}/index.html`), `Missing vendor landing: ${slug}`);
const visibleIndex = idx.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<meta[^>]*>/g, '');
for (const token of ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크','관련 링크','관련 확인','RELATED']) assert(!visibleIndex.includes(token), `Bottom related token returned in visible index: ${token}`);
const ops = read('ops/index.html');
assert(ops.includes('id="v129-seo-center"'), 'OPS V129 SEO panel missing');
assert(ops.includes('V129 SEO SCHEMA LOCK ONLINE'), 'OPS V129 status missing');
const pkg = JSON.parse(read('package.json'));
assert(pkg.scripts.verify === 'node scripts/verify-v129-seo-meta-og-schema-final.mjs', 'package verify not locked to V129');
assert(pkg.scripts.build.includes('generate-v129-seo-meta-og-schema-final.mjs'), 'build chain missing V129 generator');
assert(pkg.scripts['quality:v129'] === 'node scripts/generate-v129-seo-meta-og-schema-final.mjs', 'quality:v129 missing');
assert(pkg.scripts['verify:v129'] === 'node scripts/verify-v129-seo-meta-og-schema-final.mjs', 'verify:v129 missing');
if (errors.length) {
  console.error('V129 verify failed:');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log('V129 verify passed.');
