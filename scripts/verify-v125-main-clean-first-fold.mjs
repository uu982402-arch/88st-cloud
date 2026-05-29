import fs from 'fs';
import path from 'path';
const root = process.cwd();
const exists = p => fs.existsSync(path.join(root, p));
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const errors = [];
const assert = (cond, msg) => { if (!cond) errors.push(msg); };
for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  assert(!exists(`${r}/index.html`), `Removed route regenerated: ${r}/index.html`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if (exists(sm)) assert(!read(sm).includes(`/${r}/`), `Removed route in ${sm}: ${r}`);
}
const h = read('index.html');
assert(h.includes('data-v125-main-clean-fold="active"'), 'Missing V125 html marker');
assert(h.includes('V125_MAIN_CLEAN_FIRST_FOLD_ACTIVE'), 'Missing V125 meta marker');
assert(h.includes('v125-main-clean-first-fold.css'), 'Missing V125 CSS link');
assert(!h.includes('RUST QUICK CHECK'), 'Duplicate quick check kicker remained');
assert(!h.includes('검색·스포츠 체크·보증업체를 첫 화면에서 바로 확인'), 'Duplicate quick check H1 remained');
assert(!h.includes('data-v120-fold="true"'), 'V120 duplicate fold marker remained');
assert(!h.includes('data-v120-search-form="true"'), 'V120 quick search form remained');
assert(!h.includes('v120-action-sports'), 'V120 sports action card remained');
assert(!h.includes('v120-action-guaranteed'), 'V120 guaranteed action card remained');
assert(h.includes('최신 실사용 가이드'), 'Main guide section missing after cleanup');
assert(h.includes('프리미엄 보증업체'), 'Home guaranteed panel missing after cleanup');
assert(h.includes('스포츠 체크 · 검색 가이드'), 'Sports/search hub missing after cleanup');
assert(h.includes('data-v115-main-tool="sports"'), 'V115 home modal tool trigger missing');
assert(h.includes('애매한 조건은 공식 상담봇에서 깔끔하게 정리하세요.'), 'Consult headline not polished');
assert(h.includes('가입코드, 공식주소, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 부분만 @TRS999_bot에서 짧고 명확하게 확인할 수 있습니다.'), 'Consult body not polished');
assert(h.includes('공식 상담봇 연결'), 'Consult CTA not polished');
assert(!h.includes('조건이 애매하면 공식 상담센터에서 바로 확인하세요.'), 'Old consult headline remained');
assert(!h.includes('가입코드, 주소, 이벤트 조건, 롤링 계산이 헷갈릴 때 @TRS999_bot으로 연결하면 필요한 정보를 빠르게 정리할 수 있습니다.'), 'Old consult body remained');
assert(exists('assets/css/v125-main-clean-first-fold.css'), 'Missing V125 CSS file');
const css = read('assets/css/v125-main-clean-first-fold.css');
for (const token of ['[data-v120-fold="true"]','display:none!important','v125-consult-kicker','background:linear-gradient']) assert(css.includes(token), `Missing CSS token: ${token}`);
assert(exists('reports/v125-main-clean-first-fold-audit.json'), 'Missing V125 audit report');
assert(exists('reports/v125-remove-candidates.txt'), 'Missing V125 remove candidate report');
for (const token of ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크','관련 링크','관련 확인']) {
  assert(!h.includes(token), `Bottom related token remained on index: ${token}`);
}
if (errors.length) {
  console.error('V125 verify failed:');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log('V125 verify passed.');
