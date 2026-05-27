import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const slugs = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
const css = '/assets/css/v109-guaranteed-detail-contrast.css?v=v109-guaranteed-detail-contrast-20260527';
for (const slug of slugs) {
  const file = path.join(ROOT, 'guaranteed', slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`missing detail page: ${slug}`);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-v109-guaranteed-detail-contrast="active"')) html = html.replace(/<html([^>]*)>/, '<html$1 data-v109-guaranteed-detail-contrast="active">');
  if (!html.includes('data-v109-guaranteed-detail-contrast="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v109-guaranteed-detail-contrast="true">');
  if (!html.includes('/assets/css/v109-guaranteed-detail-contrast.css')) {
    html = html.replace('</head>', `  <meta name="v109-guaranteed-detail-contrast" content="V109_GUARANTEED_DETAIL_CONTRAST_ACTIVE">\n  <link rel="stylesheet" href="${css}" data-v109-guaranteed-detail-contrast="true">\n</head>`);
  }
  html = html
    .replaceAll('BENEFIT SUMMARY','핵심 혜택')
    .replaceAll('CHECK TABLE','확인표')
    .replaceAll('COMMON CENTER','최종 확인')
    .replaceAll('보증업체 혜택 안내','보증업체 혜택 확인')
    .replaceAll('혜택 안내','혜택 확인')
    .replaceAll('조건 확인표','조건 확인')
    .replaceAll('다른 보증업체 보기','다른 보증업체')
    .replaceAll('전체 카드 보기','전체 카드')
    .replaceAll('페이지 기준 V54 디자인 보강','코드·주소 재확인')
    .replaceAll('공통 확인 채널','상담 전 최종 확인')
    .replaceAll('상담센터 연결','상담으로 조건 확인');
  fs.writeFileSync(file, html);
}
fs.writeFileSync(path.join(ROOT,'build.txt'), '88ST.Cloud build V109 GUARANTEED DETAIL CONTRAST POLISH PATCH\n2026-05-27T04:40:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V109-GUARANTEED-DETAIL-CONTRAST-POLISH-20260527';\nwindow.__RUST_BUILD_LABEL__ = 'V109 GUARANTEED DETAIL CONTRAST POLISH PATCH';\n");
console.log('[V109] guaranteed detail contrast and copy polish applied');
