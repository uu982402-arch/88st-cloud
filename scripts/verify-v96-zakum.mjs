import fs from 'fs';
import path from 'path';

const root = process.cwd();
const mustExist = [
  'index.html',
  'cert/index.html',
  'guaranteed/index.html',
  'guaranteed/jakum/index.html',
  'assets/js/j.cert.v56.20260217.js',
  'assets/css/v96-jakum-vendor.css',
  'assets/img/guaranteed/cards/jakum.webp',
  'img/jakum.webp',
  'sitemap.xml',
  'sitemap.txt',
  '_redirects',
];
const mustContain = [
  ['assets/js/j.cert.v56.20260217.js', 'card_jakum'],
  ['assets/js/j.cert.v56.20260217.js', 'vendor_detail_click'],
  ['assets/js/j.cert.v56.20260217.js', 'vendor_copy_code'],
  ['assets/js/j.cert.v56.20260217.js', 'vendor_outbound_click'],
  ['cert/index.html', 'id="pDetail"'],
  ['guaranteed/index.html', '보증업체'],
  ['guaranteed/jakum/index.html', 'zk888'],
  ['guaranteed/jakum/index.html', 'https://zk-777.com/?code=zk888'],
  ['sitemap.xml', 'https://88st.cloud/guaranteed/jakum/'],
  ['_redirects', '/cert/jakum/ /guaranteed/jakum/ 301'],
];
const banned = [
  'RUST MOTION HUB',
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개',
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  'CONSULT FLOW',
  '상담 전 필요한 정보',
  '오늘 확인해야 할 것',
  '상담 전 먼저 확인할 것',
  '함께 확인할 글',
];
let errors = [];
for (const rel of mustExist) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`missing: ${rel}`);
}
for (const [rel, token] of mustContain) {
  const p = path.join(root, rel);
  const s = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  if (!s.includes(token)) errors.push(`missing token in ${rel}: ${token}`);
}
for (const rel of ['index.html','cert/index.html','guaranteed/index.html','guaranteed/jakum/index.html','assets/js/j.cert.v56.20260217.js']) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  for (const token of banned) if (s.includes(token)) errors.push(`banned token in ${rel}: ${token}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('verify-v96-zakum: OK');
