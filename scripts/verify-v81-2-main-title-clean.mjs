import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const indexPath = path.join(ROOT, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const required = [
  'V81_2_MAIN_TITLE_CLEAN_ACTIVE',
  'v81-2.main-title-clean.css',
  'data-v81-2-main-title-clean="true"',
  'data-v811-blog-rotator="true"',
  'data-v811-hub-section="true"'
];

const forbidden = [
  '88ST.CLOUD PLATFORM',
  '보증업체, 최신 가이드, 분석 도구, 공식 상담을 한 화면에서 확인합니다.',
  '<span>보증업체 큐레이션</span>',
  '<span>실사용 계산 도구</span>',
  '<span>텔레그램 상담 연결</span>',
  '>보증업체 보기</a>',
  '>자동 상담 시작</a>',
  'class="v71-hero v71-shell"'
];

const failures = [];
for (const token of required) {
  if (!html.includes(token)) failures.push(`missing required token: ${token}`);
}
for (const token of forbidden) {
  if (html.includes(token)) failures.push(`forbidden token remains: ${token}`);
}

const blogSlots = (html.match(/data-v811-blog-card="/g) || []).length;
const sportsSlots = (html.match(/data-v811-sports-card="/g) || []).length;
const guideSlots = (html.match(/data-v811-guides-card="/g) || []).length;
if (blogSlots !== 15) failures.push(`expected 15 blog slots, got ${blogSlots}`);
if (sportsSlots !== 5) failures.push(`expected 5 sports slots, got ${sportsSlots}`);
if (guideSlots !== 5) failures.push(`expected 5 guide slots, got ${guideSlots}`);

if (failures.length) {
  console.error('[V81-2] verify failed');
  for (const f of failures) console.error('-', f);
  process.exit(1);
}

console.log(`[V81-2] verify ok. blogSlots=${blogSlots} sportsSlots=${sportsSlots} guideSlots=${guideSlots}`);
