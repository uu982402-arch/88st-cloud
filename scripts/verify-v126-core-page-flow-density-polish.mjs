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

const h = read('index.html');
const visible = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<meta[^>]*>/g, '');
assert(h.includes('data-v126-core-flow="active"'), 'Missing V126 html marker');
assert(h.includes('data-v126-core-flow="true"'), 'Missing V126 body marker or CSS marker');
assert(h.includes('V126_CORE_PAGE_FLOW_DENSITY_POLISH_ACTIVE'), 'Missing V126 meta marker');
assert(h.includes('v126-core-page-flow-density-polish.css'), 'Missing V126 CSS link');
assert(exists('assets/css/v126-core-page-flow-density-polish.css'), 'Missing V126 CSS file');
assert(exists('reports/v126-core-page-flow-audit.json'), 'Missing V126 audit report');
assert(exists('reports/v126-remove-candidates.txt'), 'Missing V126 remove candidates report');

// V125 first-fold cleanup must remain locked.
for (const token of ['RUST QUICK CHECK','검색·스포츠 체크·보증업체를 첫 화면에서 바로 확인','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed']) {
  assert(!h.includes(token), `V120 duplicate first-fold token remained: ${token}`);
}
assert(h.includes('최신 실사용 가이드'), 'Main guide section missing');
assert(h.includes('프리미엄 보증업체'), 'Home guaranteed panel missing');
assert(h.includes('스포츠 체크 · 검색 가이드'), 'Sports/search hub missing');
assert(h.includes('data-v115-main-tool="sports"'), 'V115 home modal tool trigger missing');

// V126 consult copy and layout.
assert(h.includes('data-v126-consult-polish="true"'), 'Missing V126 consult marker');
assert(h.includes('마지막 확인은 공식 상담봇에서 짧게 정리하세요.'), 'V126 consult headline missing');
assert(h.includes('공식주소, 가입코드, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 항목만 @TRS999_bot에서 빠르게 확인합니다.'), 'V126 consult body missing');
assert(h.includes('@TRS999_bot 열기'), 'V126 consult CTA missing');
assert(!h.includes('애매한 조건은 공식 상담봇에서 깔끔하게 정리하세요.'), 'V125 consult headline remained');
assert(!h.includes('가입코드, 공식주소, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 부분만 @TRS999_bot에서 짧고 명확하게 확인할 수 있습니다.'), 'V125 consult body remained');
assert(!h.includes('조건이 애매하면 공식 상담센터에서 바로 확인하세요.'), 'Old live consult headline remained');
assert(!h.includes('가입코드, 주소, 이벤트 조건, 롤링 계산이 헷갈릴 때 @TRS999_bot으로 연결하면 필요한 정보를 빠르게 정리할 수 있습니다.'), 'Old live consult body remained');
assert(!h.includes('aria-label="플랫폼 신뢰 지표"'), 'Low-value metrics section remained');
assert(!h.includes('class="v71-fab"'), 'Floating Telegram FAB remained');
assert(h.includes('<a href="/consult/"'), 'Consult route nav link should remain');

for (const token of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준','상담 전 문의 템플릿','COMMON CENTER','공통 확인 채널','상담센터 연결']) {
  assert(!visible.includes(token), `Forbidden consultation/vendor token remained in visible index markup: ${token}`);
}
for (const token of ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크','관련 링크','관련 확인','RELATED']) {
  assert(!visible.includes(token), `Bottom related token remained in visible index markup: ${token}`);
}

const css = read('assets/css/v126-core-page-flow-density-polish.css');
for (const token of ['v126-consult-card','v126-consult-button','v71-fab{display:none!important}','overflow-x:hidden']) {
  assert(css.includes(token), `Missing V126 CSS token: ${token}`);
}

if (errors.length) {
  console.error('V126 verify failed:');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log('V126 verify passed.');
