
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v85-seo-content-30-20260525';
const MARKER = 'V85_SEO_CONTENT_30_ACTIVE';
const V821_MARKER = 'V82_1_STRUCTURE_GA4_ACTIVE';
const GA_ID = 'G-KWT87FBY6S';
const SITE = 'https://88st.cloud';
const POSTS = [
  {
    "slug": "toto-site-recommendation-detail-2026-ranking-signals",
    "title": "2026 토토사이트추천 세부 기준: 순위보다 먼저 볼 신호",
    "category": "토토사이트추천",
    "keyword": "2026 토토사이트추천",
    "summary": "토토사이트추천 순위를 보기 전 공식주소, 보증업체 연결, 가입코드, 롤링 조건을 세부 신호로 분해하는 기준입니다.",
    "intent": "순위형 검색 유입자가 광고성 추천보다 실제 확인 가능한 세부 기준을 먼저 보게 만드는 글입니다."
  },
  {
    "slug": "safe-toto-site-recommendation-longtail-guide",
    "title": "안전한 토토사이트추천 롱테일 검색어별 확인법",
    "category": "토토사이트추천",
    "keyword": "안전한토토사이트추천",
    "summary": "안전한토토사이트추천, 먹튀 없는 사이트, 보증업체 추천 같은 롱테일 검색어를 확인 순서로 바꾸는 가이드입니다.",
    "intent": "안전성 중심 검색어를 보증업체·검색가이드·상담 루트로 연결하는 글입니다."
  },
  {
    "slug": "online-sports-toto-site-recommendation-check-route",
    "title": "온라인스포츠토토사이트추천 검색 후 실제 체크 루트",
    "category": "스포츠토토",
    "keyword": "온라인스포츠토토사이트추천",
    "summary": "온라인스포츠토토사이트추천 검색 후 배당마진, 공식주소, 이벤트 조건, 상담 채널을 순서대로 확인하는 루트입니다.",
    "intent": "스포츠 검색 유입자를 분석 도구와 보증업체 카드로 자연스럽게 연결합니다."
  },
  {
    "slug": "toto-site-code-official-domain-match",
    "title": "토토사이트추천에서 가입코드와 공식 도메인이 맞는지 보는 법",
    "category": "가입코드",
    "keyword": "토토사이트 가입코드",
    "summary": "가입코드가 공식 도메인, 상세 랜딩, 상담 답변에서 같은 값으로 유지되는지 확인하는 방법입니다.",
    "intent": "코드 자동복사 전환 전에 사용자가 신뢰 기준을 이해하도록 돕는 글입니다."
  },
  {
    "slug": "ibple-site-recommendation-longtail-map",
    "title": "입플사이트추천 롱테일 키워드 맵: 스포츠·카지노·미니게임",
    "category": "입플사이트",
    "keyword": "입플사이트추천",
    "summary": "입플사이트추천 검색어를 스포츠입플, 카지노입플, 미니게임입플로 나누고 각각 확인 기준을 정리합니다.",
    "intent": "입플 계열 유입을 세부 카테고리 글로 확장하는 허브형 글입니다."
  },
  {
    "slug": "sports-ibple-vs-casino-ibple-compare",
    "title": "스포츠입플과 카지노입플 비교: 혜택률보다 조건표를 보는 이유",
    "category": "입플비교",
    "keyword": "스포츠입플 카지노입플 비교",
    "summary": "스포츠입플과 카지노입플의 롤링, 인정 게임, 배당 제한, 최대출금 차이를 비교합니다.",
    "intent": "비교 검색어에서 도구 사용과 상담 확인으로 이어지게 만드는 글입니다."
  },
  {
    "slug": "casino-ibple-site-recommendation-real-receive",
    "title": "카지노입플사이트추천 실수령 중심으로 보는 체크포인트",
    "category": "카지노입플",
    "keyword": "카지노입플사이트추천",
    "summary": "카지노입플 조건을 표면 보너스가 아니라 실수령, 롤링 인정률, 최대출금 기준으로 판단합니다.",
    "intent": "카지노입플 검색 유입자를 보너스 실수령 계산으로 연결합니다."
  },
  {
    "slug": "sports-ibple-bonus-turnover-risk",
    "title": "스포츠입플 보너스 롤링과 배당 제한 리스크",
    "category": "스포츠입플",
    "keyword": "스포츠입플 롤링",
    "summary": "스포츠입플 보너스에서 배당 제한, 낙첨 제외, 조합 제한, 롤링 인정률이 왜 중요한지 설명합니다.",
    "intent": "스포츠입플 유입을 배당마진·롤링 계산 도구로 연결합니다."
  },
  {
    "slug": "minigame-ibple-site-risk-before-join",
    "title": "미니게임입플사이트 가입 전 주의점: 회차 속도와 손실한도",
    "category": "미니게임입플",
    "keyword": "미니게임입플사이트",
    "summary": "파워볼, 사다리, 키노류 미니게임입플사이트에서 회차 속도와 손실한도를 먼저 확인해야 하는 이유입니다.",
    "intent": "미니게임 유입자가 무리한 반복 이용을 피하고 조건을 점검하도록 유도합니다."
  },
  {
    "slug": "powerball-ladder-ibple-condition-check",
    "title": "파워볼·사다리 입플 조건 확인법: 결과보다 조건이 먼저다",
    "category": "미니게임",
    "keyword": "파워볼 사다리 입플",
    "summary": "파워볼·사다리 입플 조건에서 회차 결과보다 롤링, 최대출금, 인정 게임 범위를 먼저 확인하는 기준입니다.",
    "intent": "미니게임 상세 키워드를 검색가이드와 도구 페이지로 연결합니다."
  },
  {
    "slug": "guaranteed-vendor-selection-standard-2026",
    "title": "2026 보증업체 선택 기준: 카드 이미지보다 운영 신호 보기",
    "category": "보증업체",
    "keyword": "보증업체 선택 기준",
    "summary": "보증업체 선택 시 카드 이미지, 공식주소, 가입코드, 상담 일관성, 혜택 3줄을 함께 확인하는 기준입니다.",
    "intent": "보증업체 페이지의 카드 클릭과 상세보기 전환을 보조하는 글입니다."
  },
  {
    "slug": "guaranteed-vendor-bonus-three-line-rule",
    "title": "보증업체 혜택 3줄 룰: 첫충·매충·수수료 지원 확인법",
    "category": "보증업체",
    "keyword": "보증업체 혜택",
    "summary": "보증업체 카드에 표시되는 혜택 3줄을 첫충, 매충, 수수료 지원, 롤링 조건으로 해석합니다.",
    "intent": "보증업체 카드 정보의 이해도를 높여 전환 전 문의 품질을 개선합니다."
  },
  {
    "slug": "muktu-site-identification-search-pattern",
    "title": "먹튀 구분법: 검색 결과에서 먼저 보이는 패턴",
    "category": "먹튀검증",
    "keyword": "먹튀 구분법",
    "summary": "먹튀 구분법을 검색 결과, 주소 변경, 후기 문구, 상담 응답, 출금 조건 패턴으로 나눠 설명합니다.",
    "intent": "먹튀 관련 검색 유입자를 검색가이드와 공식주소 확인 루트로 연결합니다."
  },
  {
    "slug": "muktu-review-filter-ad-vs-real-signal",
    "title": "먹튀 후기 필터링: 광고성 글과 실제 위험 신호 구분",
    "category": "먹튀검증",
    "keyword": "먹튀 후기 구분",
    "summary": "먹튀 후기를 볼 때 광고성 문장, 반복 후기, 날짜 불일치, 증거 부족을 걸러내는 기준입니다.",
    "intent": "검색가이드 하위 콘텐츠와 보증업체 체크 루트로 체류를 늘립니다."
  },
  {
    "slug": "rolling-real-receive-calculation-example-2026",
    "title": "롤링·실수령 계산 예시: 보너스가 커도 불리해지는 순간",
    "category": "롤링계산",
    "keyword": "롤링 실수령 계산",
    "summary": "입금액, 보너스, 롤링 배수, 인정률, 최대출금을 넣어 실수령이 줄어드는 구조를 예시로 설명합니다.",
    "intent": "롤링 계산기와 보너스 실수령 도구 사용을 유도합니다."
  },
  {
    "slug": "bonus-real-receive-first-recharge-recurring",
    "title": "첫충·매충 보너스 실수령 비교 공식",
    "category": "보너스계산",
    "keyword": "보너스 실수령 계산",
    "summary": "첫충과 매충 보너스를 같은 기준으로 비교하기 위해 실수령, 롤링 부담, 최대출금을 계산하는 방법입니다.",
    "intent": "보너스 계산 도구와 카지노입플 글로 내부 이동을 유도합니다."
  },
  {
    "slug": "ev-calculation-example-for-event-bonus",
    "title": "이벤트 보너스 EV 계산 예시: 기대값이 플러스인지 확인하기",
    "category": "EV계산",
    "keyword": "EV 계산 예시",
    "summary": "이벤트 보너스를 기대값 관점으로 환산하고, 실제 참여 가치가 있는지 보는 계산 예시입니다.",
    "intent": "EV 계산 도구의 사용 이유를 설명하는 분석형 글입니다."
  },
  {
    "slug": "sports-odds-margin-example-home-draw-away",
    "title": "스포츠 배당 마진 계산 예시: 승무패 3시장으로 보기",
    "category": "배당마진",
    "keyword": "스포츠 배당 마진 계산",
    "summary": "승무패 3시장 배당을 확률로 바꾸고 마진을 계산해 사이트별 차이를 비교하는 예시입니다.",
    "intent": "배당 마진 계산기와 스포츠 분석 도구로 이동시키는 글입니다."
  },
  {
    "slug": "casino-rolling-bonus-abuse-clause-check",
    "title": "카지노 롤링 조건과 보너스 어뷰즈 조항 확인법",
    "category": "카지노입플",
    "keyword": "카지노 롤링 조건",
    "summary": "카지노입플 조건에서 보너스 어뷰즈, 최대베팅, 제외 게임, 환전 제한 조항을 확인하는 방법입니다.",
    "intent": "카지노입플 유입자의 조건 해석 정확도를 높이는 글입니다."
  },
  {
    "slug": "slot-rtp-volatility-loss-control-guide",
    "title": "슬롯 RTP·변동성·손실한도 같이 보는 법",
    "category": "온라인슬롯",
    "keyword": "슬롯 RTP 변동성",
    "summary": "슬롯 RTP와 변동성을 장기 기대값과 단기 손실한도 관점으로 함께 설명합니다.",
    "intent": "슬롯 검색 유입을 도구와 보증업체 확인으로 연결합니다."
  },
  {
    "slug": "mini-game-speedkino-powerball-ladder-compare",
    "title": "스피드키노·파워볼·사다리게임 비교 체크노트",
    "category": "미니게임",
    "keyword": "스피드키노 파워볼 사다리게임",
    "summary": "스피드키노, 파워볼, 사다리게임을 회차 속도, 결과 확인, 손실한도, 이벤트 조건으로 비교합니다.",
    "intent": "미니게임 롱테일 검색 유입을 검색가이드 허브로 연결합니다."
  },
  {
    "slug": "official-address-domain-history-check",
    "title": "공식주소 변경 이력으로 안전성 보는 법",
    "category": "공식주소",
    "keyword": "공식주소 변경 이력",
    "summary": "도메인 변경 이력이 잦은 사이트에서 공지, 상담, 리다이렉트, 검색 결과를 교차 확인하는 방법입니다.",
    "intent": "검색가이드의 도메인 확인 콘텐츠와 자연스럽게 연결합니다."
  },
  {
    "slug": "join-code-copy-before-telegram-consult",
    "title": "가입코드 복사 후 텔레그램 상담에서 확인할 질문",
    "category": "가입코드",
    "keyword": "가입코드 텔레그램 상담",
    "summary": "가입코드를 복사한 뒤 상담센터에서 공식주소, 혜택, 롤링, 환전 조건을 확인하는 질문 리스트입니다.",
    "intent": "보증업체 바로가기와 상담 페이지 전환 품질을 높입니다."
  },
  {
    "slug": "rust-blog-tools-guaranteed-user-route-2026",
    "title": "RUST 이용 루트 2026: 블로그 → 도구 → 보증업체 → 상담",
    "category": "RUST활용법",
    "keyword": "RUST 88st cloud 이용법",
    "summary": "신규 유저가 RUST에서 블로그, 도구, 보증업체, 상담을 어떤 순서로 보면 좋은지 정리합니다.",
    "intent": "사이트 전체 구조를 이해시키고 여러 페이지를 순환하도록 만드는 글입니다."
  },
  {
    "slug": "toto-site-recommendation-mobile-checklist",
    "title": "모바일에서 토토사이트추천 정보를 볼 때 체크할 8가지",
    "category": "모바일체크",
    "keyword": "모바일 토토사이트추천",
    "summary": "모바일 환경에서 공식주소, 코드 복사, 버튼 위치, 상담 연결, 글 가독성을 기준으로 확인하는 체크리스트입니다.",
    "intent": "모바일 유입자를 핵심 CTA와 보증업체 카드로 연결합니다."
  },
  {
    "slug": "sports-toto-event-condition-small-print",
    "title": "스포츠토토 이벤트 조건표의 작은 글씨 해석법",
    "category": "스포츠토토",
    "keyword": "스포츠토토 이벤트 조건",
    "summary": "스포츠토토 이벤트 조건표에서 작은 글씨로 적힌 배당 제한, 낙첨 제외, 종목 제외를 해석합니다.",
    "intent": "스포츠 이벤트 검색 유입을 도구 계산으로 연결합니다."
  },
  {
    "slug": "casino-ibple-vs-slot-event-condition",
    "title": "카지노입플과 슬롯 이벤트 조건 차이",
    "category": "카지노입플",
    "keyword": "카지노입플 슬롯 이벤트",
    "summary": "카지노입플과 슬롯 이벤트의 인정 게임, 롤링 부담, 보너스 적용 범위를 비교합니다.",
    "intent": "카지노·슬롯 겹친 검색어에서 조건 비교 콘텐츠를 제공합니다."
  },
  {
    "slug": "vendor-card-image-trust-signal-guide",
    "title": "보증업체 카드 이미지에서 신뢰 신호를 읽는 법",
    "category": "보증업체",
    "keyword": "보증업체 카드 이미지",
    "summary": "보증업체 카드 이미지, 업체명, 가입코드, 상세보기, 바로가기 버튼이 같은 흐름인지 확인하는 방법입니다.",
    "intent": "광고카드 이미지 적용 이후 카드 클릭 전환을 보조합니다."
  },
  {
    "slug": "search-guide-before-deposit-risk-check",
    "title": "입금 전 검색가이드로 리스크 낮추는 5단계",
    "category": "검색가이드",
    "keyword": "입금 전 리스크 체크",
    "summary": "입금 전에 공식주소, 먹튀 후기, 도메인 이력, 보증업체, 상담 답변을 검색가이드 흐름으로 확인합니다.",
    "intent": "검색가이드 허브의 체류와 내부 순환을 높입니다."
  },
  {
    "slug": "ga4-gsc-content-feedback-loop-rust",
    "title": "GA4·GSC 데이터로 다음 콘텐츠 주제를 고르는 법",
    "category": "운영가이드",
    "keyword": "GA4 GSC 콘텐츠 전략",
    "summary": "GA4 이벤트와 Search Console 쿼리를 보고 다음 블로그 주제를 고르는 방식입니다.",
    "intent": "운영자가 V82 이후 콘텐츠 확장을 데이터 기반으로 판단하도록 돕는 글입니다."
  }
];

function file(...parts) { return path.join(ROOT, ...parts); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, body) { ensureDir(path.dirname(file(rel))); fs.writeFileSync(file(rel), body, 'utf8'); }
function esc(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
function route(post) { return `/blog/${post.slug}/`; }
function htmlRel(post) { return `blog/${post.slug}/index.html`; }
function isoDate() { return '2026-05-25'; }
function textSummary() { return 'RUST는 토토사이트추천, 입플사이트추천, 스포츠입플, 카지노입플, 미니게임입플사이트, 롤링 조건, EV 계산법, 먹튀 구분법을 구조화해 정리한 정보 플랫폼입니다.'; }
function coreLinks() { return [['도구로 계산하기','/tools/'],['보증업체 확인','/guaranteed/'],['검색 가이드 보기','/search-guides/'],['스포츠 체크 보기','/sports-check/'],['상담센터 연결','/consult/']]; }
function relatedPosts(post) {
  return POSTS.filter((item) => item.slug !== post.slug).filter((item) => item.category === post.category || item.keyword.split(' ')[0] === post.keyword.split(' ')[0]).slice(0, 4);
}
function bodySections(post) {
  const related = relatedPosts(post);
  const relatedHtml = (related.length ? related : POSTS.filter((item) => item.slug !== post.slug).slice(0, 4)).map((item) => `<a href="${route(item)}">${esc(item.title)}</a>`).join('');
  const linkPanel = coreLinks().map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  return `
    <p>${esc(post.intent)} ${textSummary()} 이 글은 단순히 추천 문구를 나열하는 방식이 아니라, 실제 사용자가 검색 결과에서 무엇을 확인하고 어떤 순서로 판단해야 하는지에 초점을 둡니다. 검색어가 비슷해 보여도 유저의 목적은 서로 다릅니다. 어떤 사용자는 보증업체를 찾고, 어떤 사용자는 롤링 계산법을 찾고, 또 다른 사용자는 공식주소나 가입코드가 맞는지 확인하려고 들어옵니다.</p>
    <p>${esc(post.keyword)} 계열 검색어에서 가장 위험한 흐름은 혜택률 하나만 보고 판단하는 것입니다. 혜택 문구는 짧고 강하게 보이지만, 실제 결과는 롤링 배수, 인정 게임, 최대출금, 배당 제한, 정산 예외, 상담 답변의 일관성에 따라 달라집니다. 그래서 RUST는 블로그, 도구, 보증업체, 검색가이드, 상담을 하나의 루트로 묶어 확인하게 만드는 구조를 유지합니다.</p>
    <div class="v82-note"><strong>핵심 요약</strong><br>${esc(post.summary)} 공식주소, 가입코드, 조건표, 상담 채널이 서로 맞는지 확인하고 숫자가 필요한 부분은 도구로 계산하는 것이 안전합니다.</div>
    <h2>${esc(post.keyword)}를 검색했을 때 먼저 볼 기준</h2>
    <p>첫 번째 기준은 정보의 일관성입니다. 같은 업체명이라도 도메인, 가입코드, 혜택 조건, 상담 채널이 서로 다르면 신뢰도가 낮아집니다. 검색 결과에서 본 문구가 보증업체 카드, 상세보기 페이지, 상담 답변에서도 같은 방식으로 설명되는지 확인해야 합니다. 특히 주소가 자주 바뀌는 경우에는 최근 공지와 실제 연결 링크를 같이 보는 것이 좋습니다.</p>
    <p>두 번째 기준은 조건의 완전성입니다. 첫충, 매충, 스포츠입플, 카지노입플, 미니게임입플 같은 문구는 혜택 이름일 뿐입니다. 실제 판단은 입금액, 보너스 비율, 롤링 배수, 인정 게임, 최대출금, 수수료 지원, 환전 제한을 한 줄로 정리했을 때 가능해집니다. 조건이 한 페이지에서 설명되지 않고 상담에서만 알려준다면 반드시 기록으로 남겨야 합니다.</p>
    <h2>보증업체와 가입코드를 같이 보는 이유</h2>
    <p>가입코드는 단순한 추천 코드가 아니라 혜택 적용과 유입 경로를 연결하는 기준입니다. 코드가 잘못 입력되면 같은 업체라도 이벤트가 적용되지 않거나 다른 조건으로 안내될 수 있습니다. 그래서 보증업체 카드에서 보이는 가입코드, 상세보기 페이지의 코드, 공식 상담에서 확인되는 코드가 같은지 보는 과정이 필요합니다.</p>
    <p>RUST의 보증업체 페이지는 카드 이미지, 업체명, 보증 상태, 가입코드, 상세보기, 바로가기 흐름을 분리해 배치합니다. 유저는 바로가기 버튼을 누르기 전에 상세보기에서 조건을 한 번 보고, 필요하면 상담센터에서 현재 조건이 유지되는지 확인할 수 있습니다. 이 과정이 귀찮아 보여도 실제 분쟁 가능성을 크게 줄입니다.</p>
    <h2>롤링과 실수령을 숫자로 바꾸는 관점</h2>
    <p>혜택률이 높아 보이는 이벤트라도 롤링이 높으면 실제 체감 가치는 낮아질 수 있습니다. 예를 들어 보너스가 30%라 하더라도 인정 게임이 제한되거나 최대출금이 낮으면 사용자가 생각한 실수령과 실제 결과가 달라집니다. 이때 필요한 것은 감이 아니라 계산입니다. 입금액과 보너스, 롤링 배수, 인정률을 넣어 총 요구 금액을 먼저 확인해야 합니다.</p>
    <p>EV와 배당 마진도 같은 맥락입니다. 스포츠 배당은 표면 배당만 보면 비교가 어렵습니다. 각 선택지의 역수를 더해 시장 마진을 계산하면 사이트가 어느 정도의 환수 구조를 갖고 있는지 볼 수 있습니다. 이벤트 조건은 보너스 계산으로, 스포츠 조건은 마진과 EV 계산으로 나눠 확인하면 판단이 훨씬 안정적입니다.</p>
    <div class="v82-note"><strong>실전 체크</strong><br>조건표를 읽을 때는 혜택률 → 롤링 배수 → 인정 게임 → 최대출금 → 상담 답변 순서로 확인하세요. 이 순서가 흐트러지면 높은 혜택처럼 보이는 문구에 끌려 판단이 흔들릴 수 있습니다.</div>
    <h2>먹튀 구분과 검색가이드 활용</h2>
    <p>먹튀 구분법은 특정 단어 하나로 끝나지 않습니다. 도메인 변경 이력, 후기의 날짜, 상담 채널의 응답 패턴, 공식주소 공지, 출금 조건, 이벤트 조건의 일관성을 같이 봐야 합니다. 검색 결과에서 같은 문구가 반복되거나, 실제 확인 가능한 기준 없이 혜택만 강조하는 페이지는 주의해야 합니다.</p>
    <p>검색가이드는 이런 신호를 나눠보는 역할을 합니다. 공식주소와 공지 채널을 먼저 확인하고, 후기의 출처와 반복 패턴을 보고, 보증업체 카드와 가입코드를 대조하면 불필요한 리스크를 줄일 수 있습니다. 특히 신규 유저는 검색 결과의 첫 페이지에 나온 문구만 믿기보다 여러 신호를 조합해서 판단해야 합니다.</p>
    <h2>카테고리별로 달라지는 확인 포인트</h2>
    <p>스포츠입플은 배당 제한, 조합 제한, 낙첨 제외, 종목 제외 여부가 중요합니다. 카지노입플은 롤링 인정 게임, 최대 베팅, 보너스 어뷰즈 조항, 최대출금이 중요합니다. 미니게임입플은 회차 속도와 손실한도, 결과 확인 방식이 중요합니다. 같은 입플이라는 단어를 쓰더라도 실제로 봐야 할 항목은 다릅니다.</p>
    <p>${esc(post.category)} 관점에서는 ${esc(post.keyword)}의 검색 의도를 먼저 분리해야 합니다. 정보형 사용자인지, 비교형 사용자인지, 바로 가입을 고민하는 사용자인지에 따라 필요한 링크가 달라집니다. 정보형은 블로그와 검색가이드가 먼저이고, 비교형은 도구와 보증업체 카드가 먼저이며, 전환 직전 사용자는 상담센터 연결이 가장 중요합니다.</p>
    <h2>RUST에서 추천하는 확인 순서</h2>
    <p>가장 안정적인 순서는 블로그에서 개념을 읽고, 도구에서 숫자를 계산하고, 보증업체에서 카드와 상세보기를 확인한 뒤, 상담센터에서 현재 조건을 재확인하는 것입니다. 이 순서는 사이트 구조를 복잡하게 만들기 위한 것이 아니라, 유저가 한 번의 판단으로 놓치기 쉬운 조건을 단계별로 확인하게 만드는 장치입니다.</p>
    <p>검색 유입이 늘수록 중요한 것은 글의 개수보다 연결 구조입니다. 한 글에서 끝나는 것이 아니라 관련 글, 도구, 보증업체, 상담으로 이어지는 흐름이 있어야 체류시간이 늘고, 크롤러도 사이트 주제를 더 명확하게 이해합니다. 그래서 신규 콘텐츠는 기존 허브와 자동 연결되어야 하고, sitemap에도 빠짐없이 반영되어야 합니다.</p>
    <div class="v82-link-panel">${linkPanel}</div>
    <h2>관련해서 같이 읽으면 좋은 글</h2>
    <p>아래 글들은 같은 주제를 다른 각도에서 보완합니다. 검색어 하나만 보고 결정하기보다, 혜택·검증·계산·상담 관점을 나눠서 보면 판단이 더 빨라집니다.</p>
    <div class="v82-link-panel">${relatedHtml}</div>
    <div class="v82-longform-cta"><div><strong>계산이 필요한 조건은 도구에서 먼저 확인하세요.</strong><span>롤링, 실수령, EV, 배당 마진을 숫자로 확인한 뒤 보증업체와 상담센터로 이어가면 실수 가능성이 줄어듭니다.</span></div><a href="/tools/">도구 열기</a></div>
  `;
}
function schema(post, canonical) {
  return JSON.stringify({
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Organization','@id':'https://88st.cloud/#organization','name':'RUST by 88ST','url':'https://88st.cloud/','logo':'https://88st.cloud/assets/img/rust/rust-crest-192.png'},
      {'@type':'WebSite','@id':'https://88st.cloud/#website','url':'https://88st.cloud/','name':'RUST','publisher':{'@id':'https://88st.cloud/#organization'}},
      {'@type':'BreadcrumbList','@id':canonical+'#breadcrumb','itemListElement':[{'@type':'ListItem','position':1,'name':'홈','item':'https://88st.cloud/'},{'@type':'ListItem','position':2,'name':'블로그','item':'https://88st.cloud/blog/'},{'@type':'ListItem','position':3,'name':post.title,'item':canonical}]},
      {'@type':'BlogPosting','@id':canonical+'#article','url':canonical,'headline':post.title,'description':post.summary,'inLanguage':'ko-KR','datePublished':'2026-05-25','dateModified':'2026-05-25','author':{'@type':'Organization','name':'RUST'},'publisher':{'@id':'https://88st.cloud/#organization'},'image':'https://88st.cloud/assets/img/rust/rust-og.jpg','mainEntityOfPage':canonical}
    ]
  });
}
function renderPost(post) {
  const canonical = `${SITE}${route(post)}`;
  const title = `${post.title} | RUST`;
  const description = `${post.summary} RUST가 ${post.keyword} 검색 유입자를 위해 정리한 2차 SEO 롱폼 가이드입니다.`;
  const keywords = ['RUST','88st.cloud',post.keyword,post.category,'토토사이트추천','입플사이트추천','스포츠입플','카지노입플','미니게임입플사이트','보증업체 선택 기준','먹튀 구분법','롤링 계산법','EV 계산법','배당 마진 계산법'].join(', ');
  return `<!doctype html><html lang="ko" data-v84-performance="active"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="keywords" content="${esc(keywords)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="RUST by 88ST"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://88st.cloud/assets/img/rust/rust-og.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="preconnect" href="https://www.googletagmanager.com" crossorigin data-v84-performance="preconnect"><link rel="dns-prefetch" href="//www.googletagmanager.com" data-v84-performance="dns-prefetch"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/img/rust/rust-crest-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="preload" as="image" href="/assets/img/rust/rust-crest-192.png" data-v77-rust-logo="true"><link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true"><link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true"><link rel="stylesheet" href="/assets/css/v82.structure-guard.css?v=static-v82-1-structure-ga4-20260525" data-v82-structure-guard="true"><link rel="stylesheet" href="/assets/css/v82.seo-content.css?v=static-v82-2-seo-content-20260525" data-v82-seo-content="true"><meta name="v82-1-structure-ga4" content="${V821_MARKER}"><meta name="v83-schema-structured-data" content="V83_SCHEMA_STRUCTURED_DATA_ACTIVE"><meta name="v85-seo-content-30" content="${MARKER}"><meta name="rust-ga4-id" content="${GA_ID}"><style data-v84-critical="true">img{max-width:100%;height:auto}a,button{touch-action:manipulation}</style><script defer src="/assets/js/v82.ga4-events.js?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"></script><script type="application/ld+json" data-rust-schema="v85">${schema(post, canonical)}</script></head><body class="rust-brand-system v82-seo-post" data-v85-seo="true"><div class="rust-page-shell"><header class="rust-header" data-rust-header="true"><a class="rust-brand" href="/" aria-label="RUST 메인으로 이동"><img src="/assets/img/rust/rust-crest-192.png" alt="RUST" width="38" height="38" loading="eager" decoding="async" fetchpriority="high"><span>RUST</span></a><nav class="rust-nav" aria-label="상단 메뉴"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav></header><main><article><section class="v82-longform-hero"><span class="v82-longform-hero__tag">${esc(post.category)} · ${esc(post.keyword)}</span><h1>${esc(post.title)}</h1><p>${esc(description)}</p></section><div class="v82-longform-body">${bodySections(post)}</div></article></main><nav class="rust-mobile-nav" aria-label="모바일 메뉴"><a href="/">홈</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증</a><a href="/consult/">상담</a></nav></div></body></html>`;
}
function postForPool(post, index) {
  return { href: route(post), title: post.title, summary: post.summary, excerpt: post.summary, category: post.category, score: 26000 - index * 113, views: 68000 - index * 309 };
}
function readJsonScript(html, id) {
  const re = new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)<\\/script>`);
  const match = html.match(re);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}
function writeJsonScript(html, id, data) {
  const re = new RegExp(`<script type="application/json" id="${id}">[\\s\\S]*?<\\/script>`);
  return html.replace(re, `<script type="application/json" id="${id}">${JSON.stringify(data)}</script>`);
}
function updateBlogIndex() {
  if (!exists('blog/index.html')) return;
  let html = read('blog/index.html');
  const additions = POSTS.map(postForPool);
  html = html.replace(/총\s*\d+개\s*\/\s*페이지당\s*50개/g, '총 503개 / 페이지당 50개');
  html = html.replace(/<meta name="v85-seo-content-30" content="[^"]*">\s*/g, '');
  html = html.replace(/<\/head>/i, `  <meta name="v85-seo-content-30" content="${MARKER}">\n</head>`);
  html = html.replace(/<section class="v82-seo-strip" data-v82-2-seo-strip="true" aria-label="신규 SEO 확장 콘텐츠 20개">/, '<section class="v82-seo-strip" data-v82-2-seo-strip="true" aria-label="신규 SEO 확장 콘텐츠 50개">');
  html = html.replace(/<div class="v82-seo-strip__head"><strong>신규 유입 확장 콘텐츠<\/strong><span>토토·입플·보증업체·도구 연결 20개<\/span><\/div>/, '<div class="v82-seo-strip__head"><strong>신규 유입 확장 콘텐츠</strong><span>토토·입플·보증업체·도구 연결 50개</span></div>');
  const current = readJsonScript(html, 'v81-1-blog-pool');
  if (Array.isArray(current)) {
    const seen = new Set(additions.map((item) => item.href));
    const merged = additions.concat(current.filter((item) => !seen.has(item.href)));
    html = writeJsonScript(html, 'v81-1-blog-pool', merged);
  }
  html = html.replace(/<script>window\.__V72_1_BLOG_POSTS__ = ([\s\S]*?);<\/script>/, (match, jsonText) => {
    try {
      const current = JSON.parse(jsonText);
      const seen = new Set(additions.map((item) => item.href));
      const merged = additions.concat(current.filter((item) => !seen.has(item.href)));
      return `<script>window.__V72_1_BLOG_POSTS__ = ${JSON.stringify(merged)};</script>`;
    } catch { return match; }
  });
  write('blog/index.html', html);
}
function updateHomePool() {
  if (!exists('index.html')) return;
  let html = read('index.html');
  html = html.replace(/<meta name="v85-seo-content-30" content="[^"]*">\s*/g, '');
  html = html.replace(/<\/head>/i, `  <meta name="v85-seo-content-30" content="${MARKER}">\n</head>`);
  const current = readJsonScript(html, 'v81-1-blog-pool');
  if (Array.isArray(current)) {
    const additions = POSTS.map((post, index) => ({ href: route(post), title: post.title, summary: post.summary, category: post.category, score: 26000 - index * 113 }));
    const seen = new Set(additions.map((item) => item.href));
    const merged = additions.concat(current.filter((item) => !seen.has(item.href)));
    html = writeJsonScript(html, 'v81-1-blog-pool', merged);
  }
  write('index.html', html);
}
function updateSitemap() {
  const urls = POSTS.map((post) => `${SITE}${route(post)}`);
  if (exists('sitemap.txt')) {
    let body = read('sitemap.txt');
    for (const url of urls) if (!body.includes(url)) body = body.trimEnd() + `\n${url}\n`;
    write('sitemap.txt', body);
  }
  if (exists('sitemap.xml')) {
    let xml = read('sitemap.xml');
    for (const url of urls) {
      if (!xml.includes(`<loc>${url}</loc>`)) {
        xml = xml.replace(/\s*<\/urlset>\s*$/i, `\n  <url><loc>${url}</loc><lastmod>${isoDate()}</lastmod></url>\n</urlset>\n`);
      }
    }
    write('sitemap.xml', xml);
  }
}
function updateIndexingTargets() {
  const rel = 'assets/data/v82-3-indexing-targets.json';
  if (!exists(rel)) return;
  try {
    const data = JSON.parse(read(rel));
    const urls = POSTS.map((post) => `${SITE}${route(post)}`);
    data.searchConsole = data.searchConsole || {};
    const list = Array.isArray(data.searchConsole.manualInspectionPriority) ? data.searchConsole.manualInspectionPriority : [];
    const seen = new Set(list);
    for (const url of urls) if (!seen.has(url)) list.push(url);
    data.searchConsole.manualInspectionPriority = list;
    data.searchConsole.v85AddedUrls = urls;
    data.searchConsole.v85AddedCount = urls.length;
    data.version = VERSION;
    data.marker = 'V82_3_INDEXING_MEASUREMENT_ACTIVE';
    data.generatedAt = new Date().toISOString();
    write(rel, JSON.stringify(data, null, 2) + '\n');
  } catch {}
}
function updatePackage() {
  const rel = 'package.json';
  const pkg = JSON.parse(read(rel));
  const generate = 'node scripts/generate-v85-seo-content-30.mjs';
  const verify = 'node scripts/verify-v85-seo-content-30.mjs';
  const chain = String(pkg.scripts?.build || '').split('&&').map((item) => item.trim()).filter(Boolean).filter((item) => item !== generate);
  chain.push(generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v85'] = generate;
  pkg.scripts['verify:v85'] = verify;
  write(rel, JSON.stringify(pkg, null, 2) + '\n');
}

for (const post of POSTS) write(htmlRel(post), renderPost(post));
updateBlogIndex();
updateHomePool();
updateSitemap();
updateIndexingTargets();
updatePackage();
console.log(`[V85] SEO content 30 generated. posts=${POSTS.length} marker=${MARKER}`);
