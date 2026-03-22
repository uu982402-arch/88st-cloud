import fs from 'fs/promises';
import path from 'path';
import { loadPosts, slugTokens } from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const existing = posts.map((post) => ({
  title: post.title,
  slug: post.slug,
  category: post.category,
  tokens: new Set([...slugTokens(post.slug || ''), ...slugTokens(post.title || ''), ...slugTokens(post.tag || ''), ...(Array.isArray(post.keywords) ? post.keywords.flatMap((k) => slugTokens(k)) : [])])
}));

const candidates = {
  casino: [
    ['블랙잭 6대5 3대2 차이', '블랙잭 6대5와 3대2 테이블 차이가 큰 이유'],
    ['블랙잭 서렌더 기준', '블랙잭 서렌더를 언제 써야 하는지 정리'],
    ['용호 타이 베팅 위험', '용호 타이 베팅을 과신하면 안 되는 이유'],
    ['용호 세션 종료 기준', '용호는 왜 세션 종료 기준이 더 중요한가'],
    ['바카라 타이 기대값', '바카라 타이 베팅 기대값을 체감보다 불리하게 보는 이유'],
    ['라이브 카지노 테이블 선택', '라이브 카지노 테이블을 고를 때 먼저 보는 기준']
  ],
  slot: [
    ['메가웨이 슬롯 뜻', '메가웨이 슬롯 구조를 처음 이해하는 법'],
    ['홀드앤스핀 특징', '홀드앤스핀 슬롯의 특징과 착시 포인트'],
    ['보너스 바이 위험', '슬롯 보너스 바이 기능이 위험한 이유'],
    ['슬롯 세션 길이', '슬롯 세션 길이를 짧게 잡아야 하는 이유'],
    ['슬롯 잔고 분리', '슬롯 잔고를 단계별로 나누는 방법'],
    ['슬롯 스캐터 해석', '스캐터 심볼을 과신하면 안 되는 이유']
  ],
  bonus: [
    ['첫충 매충 우선순위', '첫충과 매충 중 무엇을 먼저 봐야 하는가'],
    ['입금플러스 해석', '입금플러스 이벤트를 해석하는 기준'],
    ['보너스 악용 사례', '보너스 악용으로 판단되는 대표 사례'],
    ['출금 거절 확인 순서', '출금 거절 시 약관에서 먼저 보는 항목'],
    ['VIP 혜택 비교', 'VIP 혜택은 어떤 기준으로 비교해야 하는가'],
    ['보너스 취소 방지', '보너스 취소를 피하려면 먼저 확인할 조건']
  ],
  strategy: [
    ['연패 복구심리 제어', '연패 뒤 복구 심리를 끊는 체크리스트'],
    ['수익 잠금 규칙', '짧은 수익 뒤 수익 잠금을 거는 기준'],
    ['세션 종료 타이밍', '세션 종료 타이밍을 미리 정해야 하는 이유'],
    ['운영 기록표 항목', '운영 기록표에 꼭 넣어야 할 항목'],
    ['분산 진입 기준', '한 경기 몰빵보다 분산 진입이 필요한 이유'],
    ['손실 복구 금지 문장', '손실 복구 심리에서 자주 나오는 위험한 문장']
  ],
  analysis: [
    ['오버언더 기준점', '오버언더 기준점을 처음 읽는 법'],
    ['핸디캡 숫자 해석', '핸디캡 숫자를 읽을 때 먼저 보는 포인트'],
    ['배당 급변 체크', '경기 직전 배당 급변을 보는 기본법'],
    ['전반 후반 분리 분석', '전반 후반을 분리해 보는 분석 기준']
  ],
  news: [
    ['뉴스 영향도 읽기', '뉴스 카드의 영향도 문구를 해석하는 기준'],
    ['부상 뉴스 배당 반응', '부상 뉴스가 배당에 반영되는 순서'],
    ['라인업 확정 체크', '라인업 확정 전후로 봐야 하는 변화']
  ]
};

function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  let inter = 0;
  for (const item of a) if (b.has(item)) inter += 1;
  return inter / union.size;
}

function candidateExists(category, keyword, title) {
  const tokens = new Set([...slugTokens(keyword), ...slugTokens(title)]);
  return existing.some((post) => {
    if (post.category !== category) return false;
    const sim = jaccard(tokens, post.tokens);
    return sim >= 0.6;
  });
}

const gaps = [];
for (const [category, items] of Object.entries(candidates)) {
  for (const [keyword, title] of items) {
    if (candidateExists(category, keyword, title)) continue;
    gaps.push({ category, keyword, title });
  }
}

const grouped = gaps.reduce((acc, item) => {
  (acc[item.category] ||= []).push(item);
  return acc;
}, {});

await fs.mkdir(path.join(process.cwd(), 'assets/data'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'assets/data/content.gaps.v1.20260322.json'), JSON.stringify({ generatedAt: new Date().toISOString(), gaps }, null, 2), 'utf8');
await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
const md = ['# 중복 제외 신규 글 로드맵', '', `- 생성 시각: ${new Date().toISOString()}`, '- 기존 글과 유사도가 높은 주제는 제외했습니다.', ''];
for (const [category, items] of Object.entries(grouped)) {
  md.push(`## ${category}`, '');
  items.forEach((item, idx) => {
    md.push(`${idx + 1}. ${item.title} — 키워드: ${item.keyword}`);
  });
  md.push('');
}
await fs.writeFile(path.join(process.cwd(), 'docs/content-gap-roadmap-20260322.md'), `${md.join('\n')}\n`, 'utf8');
console.log(`Content gap report generated (${gaps.length} topic ideas).`);
