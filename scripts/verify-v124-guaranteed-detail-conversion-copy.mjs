import fs from 'fs';
import path from 'path';
const root = process.cwd();
const vendors = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
let errors=[];
function exists(p){ return fs.existsSync(path.join(root,p)); }
function read(p){ return fs.readFileSync(path.join(root,p),'utf8'); }
function assert(cond,msg){ if(!cond) errors.push(msg); }
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  assert(!exists(`${r}/index.html`), `Removed route regenerated: ${r}/index.html`);
  if (exists('sitemap.xml')) assert(!read('sitemap.xml').includes(`/${r}/`), `Removed route in sitemap.xml: ${r}`);
  if (exists('sitemap.txt')) assert(!read('sitemap.txt').includes(`/${r}/`), `Removed route in sitemap.txt: ${r}`);
}
assert(exists('assets/css/v124-guaranteed-detail-conversion-copy.css'), 'Missing V124 CSS');
const css = read('assets/css/v124-guaranteed-detail-conversion-copy.css');
for (const token of ['max-height:292px','max-height:204px','object-fit:contain','v124-detail-topline']) assert(css.includes(token), `Missing CSS token: ${token}`);
const hub = read('guaranteed/index.html');
assert(hub.includes('data-v124-guaranteed-card-grid="true"'), 'Guaranteed hub missing V124 grid marker');
assert(hub.includes('v124-guaranteed-detail-conversion-copy.css'), 'Guaranteed hub missing V124 CSS link');
for (const bad of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준']) {
  assert(!hub.includes(bad), `Forbidden hub phrase remained: ${bad}`);
}
for (const slug of vendors) {
  const file = `guaranteed/${slug}/index.html`;
  assert(exists(file), `Missing vendor detail page: ${file}`);
  const html = read(file);
  for (const token of [
    'data-v124-guaranteed-detail-conversion="active"',
    'V124_GUARANTEED_DETAIL_CONVERSION_COPY_ACTIVE',
    'v124-guaranteed-detail-conversion-copy.css',
    'data-v124-detail-hero="true"',
    'data-v124-detail-art="true"',
    'data-v124-detail-topline="true"',
    'data-v124-benefit-list="true"',
    'data-v124-table-wrap="true"',
    '코드복사 · 이동',
    '혜택표',
    '주소·코드 일치'
  ]) assert(html.includes(token), `${file} missing token: ${token}`);
  for (const bad of [
    '상담으로 조건 확인',
    '상담 전 최종 확인',
    'COMMON CENTER',
    '공통 확인 채널',
    '상담센터 연결',
    '상담 전 문의 템플릿',
    '상담에서 재확인',
    'v36-related-links',
    'v36-growth-hubs',
    'v36-conversion-cta',
    'v70-2-related',
    'quick-resource-grid',
    'pro-related',
    'consult-motive-section'
  ]) assert(!html.includes(bad), `${file} forbidden token remained: ${bad}`);
}
assert(exists('reports/v124-guaranteed-detail-conversion-audit.json'), 'Missing V124 audit report');
assert(exists('reports/v124-remove-candidates.txt'), 'Missing V124 remove candidates report');
if (errors.length) {
  console.error('V124 verify failed:');
  for (const e of errors) console.error('- '+e);
  process.exit(1);
}
console.log('V124 verify passed.');
