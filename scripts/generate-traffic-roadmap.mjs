import path from 'path';
import { ROOT, loadPosts, writeText } from './lib/site-automation.mjs';

const posts = await loadPosts();
const existingTitles = new Set(posts.map((post) => post.title.trim()));

const ideas = [
  ['casino','바카라 슈 흐름을 과신하면 위험한 이유와 확인 순서'],
  ['casino','블랙잭 6대5 테이블과 3대2 테이블 차이'],
  ['casino','블랙잭 서렌더 규칙을 언제 쓰는가'],
  ['casino','용호 타이 배당을 과신하면 안 되는 이유'],
  ['slot','슬롯 메가웨이 구조는 왜 변동성이 크게 느껴지나'],
  ['slot','홀드앤스핀 슬롯은 어떤 구간에서 체감이 달라지나'],
  ['slot','슬롯 보너스 바이 기능이 위험한 이유'],
  ['bonus','출금 전 롤링 계산을 빠르게 확인하는 방법'],
  ['bonus','동일 IP 경고가 뜰 때 먼저 확인할 항목'],
  ['bonus','입금플러스 이벤트와 첫충 이벤트 차이'],
  ['strategy','연승 뒤 단위를 올리면 무너지는 이유'],
  ['strategy','기록표에 남겨야 하는 최소 항목 5가지'],
  ['analysis','배당분석 페이지를 더 빠르게 쓰는 순서'],
  ['news','오늘 변수 체크용 해외 매체 뉴스 읽는 순서'],
  ['guide','미니게임 기록표를 짧게 남기는 방법'],
  ['guide','파워볼 구간 대기 후 진입이 필요한 이유']
].filter(([, title]) => !existingTitles.has(title));

const markdown = [
  '# 트래픽 업그레이드 목록',
  '',
  '## 1차 운영 우선순위',
  '- Search Console에서 핵심 15~20개 URL 색인 요청',
  '- 새 글 발행 시 허브/최신글/관련글 내부링크 즉시 반영',
  '- 텔레그램 공유는 메인보다 상세글 URL 중심으로 운영',
  '- CTR 낮은 페이지는 제목/설명부터 재작업',
  '',
  '## 2차 신규 글 후보',
  ...ideas.map(([category, title]) => `- [${category}] ${title}`),
  '',
  '## 3차 운영 체크',
  '- 색인되지 않은 페이지는 canonical/noindex/robots 우선 점검',
  '- 상위 유입 글은 관련글 3개 + 허브 복귀 링크 유지',
  '- 광고보다 검색형 상세글 수를 먼저 늘리기',
  ''
].join('\n');

await writeText(path.join(ROOT, 'docs', 'traffic-upgrade-roadmap-20260323.md'), markdown);
await writeText(path.join(ROOT, 'assets', 'data', 'traffic.upgrade.v1.20260323.json'), JSON.stringify({ generatedAt: new Date().toISOString(), ideas }, null, 2));
console.log(`Traffic roadmap generated with ${ideas.length} ideas.`);
