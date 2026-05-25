import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v82-2-seo-content-20260525';
const MARKER = 'V82_2_SEO_CONTENT_ACTIVE';
const V821_MARKER = 'V82_1_STRUCTURE_GA4_ACTIVE';
const GA_ID = 'G-KWT87FBY6S';
const CSS_HREF = `/assets/css/v82.seo-content.css?v=${VERSION}`;
const POSTS = [
  {
    "slug": "2026-toto-site-recommendation-safe-checklist",
    "title": "2026 토토사이트추천 기준표: 안전성·주소·가입코드 체크",
    "category": "토토사이트추천",
    "keyword": "2026토토사이트추천",
    "summary": "2026년에 토토사이트추천 정보를 확인할 때 공식주소, 가입코드, 보증업체 연결, 롤링 조건을 함께 비교하는 실전 기준입니다.",
    "intent": "토토사이트추천 검색 유입자가 안전성, 주소, 가입코드, 보증업체 확인 순서를 한 번에 이해하도록 설계한 글입니다."
  },
  {
    "slug": "sports-ibple-site-before-join",
    "title": "입플사이트추천 전 확인해야 할 스포츠입플 조건",
    "category": "스포츠입플",
    "keyword": "입플사이트추천",
    "summary": "스포츠입플 조건을 볼 때 첫충, 매충, 롤링, 배당 제한, 정산 예외를 함께 점검하는 방법을 정리합니다.",
    "intent": "스포츠입플 조건표를 보고 바로 가입하기보다 실제 실수령과 제한 조건을 먼저 판단하게 만드는 글입니다."
  },
  {
    "slug": "casino-ibple-real-receive-guide",
    "title": "카지노입플사이트추천: 롤링·최대출금·실수령 계산",
    "category": "카지노입플",
    "keyword": "카지노입플사이트추천",
    "summary": "카지노입플 혜택을 실수령 기준으로 환산하고, 롤링 조건과 최대출금 제한을 같이 비교하는 가이드입니다.",
    "intent": "카지노입플 이벤트의 표면 혜택률보다 실제 환전 가능 금액을 보는 기준을 제공합니다."
  },
  {
    "slug": "minigame-ibple-code-check-order",
    "title": "미니게임입플사이트 가입코드 확인 순서",
    "category": "미니게임",
    "keyword": "미니게임입플사이트",
    "summary": "미니게임입플사이트 이용 전 가입코드, 공식주소, 정산 규칙, 회차별 결과 확인을 순서대로 점검하는 방법입니다.",
    "intent": "파워볼·사다리·키노류 미니게임 유입자에게 코드와 정산 기준을 확인시키는 글입니다."
  },
  {
    "slug": "safe-toto-site-vendor-checklist",
    "title": "안전한토토사이트추천을 판단하는 보증업체 체크리스트",
    "category": "보증업체",
    "keyword": "안전한토토사이트추천",
    "summary": "안전한토토사이트추천을 찾을 때 보증업체 표시, 공식주소, 상담 채널, 코드 일치 여부를 확인하는 체크리스트입니다.",
    "intent": "보증업체 큐레이션 페이지로 내부 이동을 유도하는 안전성 중심 콘텐츠입니다."
  },
  {
    "slug": "sports-ibple-event-hidden-conditions",
    "title": "스포츠입플 이벤트의 함정: 배당 제한·정산 조건",
    "category": "스포츠입플",
    "keyword": "스포츠입플",
    "summary": "스포츠입플 이벤트에서 자주 놓치는 배당 제한, 낙첨 제외, 특정 종목 제외, 롤링 인정률을 설명합니다.",
    "intent": "혜택 문구만 보고 판단하는 사용자를 도구와 상담으로 연결하기 위한 글입니다."
  },
  {
    "slug": "first-recharge-real-receive-calculation",
    "title": "카지노 첫충·매충 차이와 실수령 계산법",
    "category": "보너스",
    "keyword": "첫충 뜻 매충 뜻",
    "summary": "첫충과 매충의 차이를 실수령 관점으로 정리하고 보너스 계산기와 함께 보는 기준을 안내합니다.",
    "intent": "초보 검색 유입자를 보너스 실수령 계산 도구로 연결하는 글입니다."
  },
  {
    "slug": "slot-rtp-volatility-event-reading",
    "title": "슬롯 RTP와 변동성, 이벤트 혜택을 같이 보는 법",
    "category": "온라인슬롯",
    "keyword": "슬롯 RTP",
    "summary": "슬롯 RTP, 변동성, 보너스 빈도, 이벤트 롤링을 함께 해석하여 과장된 혜택 문구를 구분하는 방법입니다.",
    "intent": "슬롯 관련 검색어를 슬롯 RTP 도구와 보증업체 확인 흐름으로 연결합니다."
  },
  {
    "slug": "official-address-risk-routine",
    "title": "먹튀 없는 사이트를 찾기 전 공식주소 검증 루틴",
    "category": "먹튀검증",
    "keyword": "먹튀 없는 사이트",
    "summary": "먹튀 리스크를 줄이기 위해 공식주소, 공지 채널, 도메인 변경 이력, 상담 답변을 교차 확인하는 루틴입니다.",
    "intent": "먹튀 관련 검색 유입자가 search-guides와 보증업체 페이지를 함께 보도록 설계했습니다."
  },
  {
    "slug": "online-sports-toto-search-differentiation",
    "title": "온라인스포츠토토사이트추천 검색 시 구분해야 할 신호",
    "category": "스포츠토토",
    "keyword": "온라인스포츠토토사이트추천",
    "summary": "온라인스포츠토토사이트추천 검색 결과에서 광고성 문구와 실제 확인 가능한 기준을 구분하는 방법입니다.",
    "intent": "검색 결과에서 들어온 유저에게 RUST의 기준형 콘텐츠와 도구를 소개하는 글입니다."
  },
  {
    "slug": "guaranteed-detail-page-seven-signals",
    "title": "보증업체 상세보기에서 확인할 7가지 지표",
    "category": "보증업체",
    "keyword": "보증업체 선택 기준",
    "summary": "보증업체 상세 페이지에서 이미지, 가입코드, 공식주소, 혜택 3줄, 상담 연결까지 확인하는 순서를 정리합니다.",
    "intent": "/guaranteed/ 카드와 개별 랜딩페이지의 전환율을 높이는 내부 링크용 글입니다."
  },
  {
    "slug": "auto-copy-code-domain-match",
    "title": "가입코드 자동복사 전 도메인 매칭 확인법",
    "category": "가입코드",
    "keyword": "가입코드 확인",
    "summary": "바로가기 버튼을 누르기 전 가입코드와 도메인이 같은 업체 흐름인지 확인하는 기준을 설명합니다.",
    "intent": "코드 복사 이벤트와 공식주소 클릭 전 신뢰 체크를 강화하는 글입니다."
  },
  {
    "slug": "rolling-calculator-before-use-example",
    "title": "롤링 조건 계산기 사용 전 알아야 할 실전 예시",
    "category": "롤링조건",
    "keyword": "롤링 조건 계산법",
    "summary": "롤링 계산기를 쓰기 전에 입금액, 보너스, 인정률, 최대출금 조건을 어떻게 입력해야 하는지 예시로 설명합니다.",
    "intent": "도구 페이지의 롤링 계산기 사용률을 높이기 위한 정보형 글입니다."
  },
  {
    "slug": "ev-calculation-bonus-comparison",
    "title": "EV 계산법으로 보너스 혜택을 비교하는 방법",
    "category": "EV계산",
    "keyword": "EV 계산법",
    "summary": "보너스 혜택률만 보지 않고 기대값, 손익분기점, 롤링 부담을 함께 비교하는 EV 계산법입니다.",
    "intent": "EV·배당 마진 도구로 이동시키는 분석형 콘텐츠입니다."
  },
  {
    "slug": "sports-margin-low-site-formula",
    "title": "스포츠 배당 마진이 낮은 사이트를 찾는 기본 공식",
    "category": "배당마진",
    "keyword": "배당 마진 계산법",
    "summary": "스포츠 배당 마진을 계산하고 시장별 환수율 차이를 비교하여 조건을 해석하는 기본 공식입니다.",
    "intent": "배당 마진 계산기와 스포츠 분석 도구로 연결하는 글입니다."
  },
  {
    "slug": "powerball-ladder-minigame-loss-limit",
    "title": "파워볼·사다리 미니게임 이용 전 손실한도 설정법",
    "category": "미니게임",
    "keyword": "파워볼 사다리게임",
    "summary": "파워볼, 사다리, 키노류 미니게임에서 회차 속도와 손실한도를 먼저 정하는 이유를 설명합니다.",
    "intent": "미니게임 검색 유입을 안전한 조건 확인 흐름으로 전환하는 글입니다."
  },
  {
    "slug": "usdt-deposit-event-condition-reading",
    "title": "USDT 입금 이벤트 조건을 읽는 법",
    "category": "USDT",
    "keyword": "USDT 카지노입플",
    "summary": "USDT 입금 이벤트에서 환율 기준, 수수료 지원, 롤링 인정률, 환전 제한을 함께 보는 방법입니다.",
    "intent": "테더 입금 관련 유입을 카지노입플·상담 연결로 이어가는 글입니다."
  },
  {
    "slug": "telegram-consult-question-list",
    "title": "텔레그램 상담 전 준비할 질문 리스트",
    "category": "상담",
    "keyword": "텔레그램 상담",
    "summary": "공식 상담센터에 문의하기 전 주소, 코드, 혜택, 롤링, 환전 조건을 빠르게 정리하는 질문 리스트입니다.",
    "intent": "/consult/ 단일 CTA 페이지로 연결하는 실전 문의 준비 글입니다."
  },
  {
    "slug": "search-guide-risk-lowering-route",
    "title": "검색 가이드로 먹튀 리스크 낮추는 방법",
    "category": "검색가이드",
    "keyword": "먹튀 구분법",
    "summary": "검색 가이드를 활용해 도메인, 후기, 공지, 상담 채널을 교차 확인하고 리스크를 낮추는 방법입니다.",
    "intent": "/search-guides/ 허브와 하위 가이드로 내부 체류를 늘리는 글입니다."
  },
  {
    "slug": "rust-route-blog-tools-guaranteed",
    "title": "RUST에서 블로그·도구·보증업체를 같이 보는 루트",
    "category": "RUST활용법",
    "keyword": "RUST 88st cloud",
    "summary": "RUST에서 블로그, 도구, 보증업체, 상담을 어떤 순서로 보면 좋은지 신규 유저용 루트를 정리합니다.",
    "intent": "첫 방문자가 사이트 구조를 이해하고 여러 페이지를 순환하도록 만드는 안내 글입니다."
  }
];
const SITE = 'https://88st.cloud';

function file(...parts) { return path.join(ROOT, ...parts); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, body) { ensureDir(path.dirname(file(rel))); fs.writeFileSync(file(rel), body, 'utf8'); }
function esc(value) { return String(value || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
function route(post) { return `/blog/${post.slug}/`; }
function htmlRel(post) { return `blog/${post.slug}/index.html`; }
function today() { return '2026-05-25'; }

function baseLinks() {
  return [['보증업체 확인','/guaranteed/'],['분석 도구 열기','/tools/'],['검색 가이드 보기','/search-guides/'],['스포츠 체크 보기','/sports-check/'],['상담센터 연결','/consult/']];
}
function relatedPosts(post) {
  return POSTS.filter((item) => item.slug !== post.slug).filter((item) => item.category === post.category || item.keyword.split(' ')[0] === post.keyword.split(' ')[0]).slice(0, 3);
}
function articleSections(post) {
  const links = baseLinks();
  const related = relatedPosts(post);
  const relatedText = related.length ? related.map((item) => `<a href="${route(item)}">${esc(item.title)}</a>`).join('') : `<a href="/blog/">블로그 허브</a><a href="/tools/">도구 허브</a>`;
  return `
    <p>${esc(post.intent)} RUST는 단순 홍보 문구보다 사용자가 실제로 확인할 수 있는 기준을 우선합니다. ${esc(post.keyword)} 검색으로 들어온 사용자는 보통 혜택률, 가입코드, 공식주소, 정산 조건 중 하나만 보고 판단하기 쉽지만, 실제로는 이 네 가지가 동시에 맞아야 리스크를 줄일 수 있습니다.</p>
    <p>이 글은 ${esc(post.category)} 흐름에서 먼저 볼 항목과 나중에 확인할 항목을 분리합니다. 페이지 하단의 내부 링크를 따라가면 관련 도구, 보증업체 카드, 검색 가이드, 공식 상담 연결까지 이어지도록 구성했습니다. 신규 유입자가 한 글만 읽고 끝나는 것이 아니라, 필요한 기준을 순서대로 확인하도록 돕는 구조입니다.</p>
    <div class="v82-note"><strong>핵심 요약</strong><br>${esc(post.summary)} 표면 혜택이나 짧은 추천 문구보다 공식주소 일치, 가입코드 일치, 롤링 조건, 출금 조건, 상담 채널의 일관성을 같이 확인하는 것이 우선입니다.</div>
    <h2>${esc(post.keyword)}를 볼 때 첫 번째 기준</h2>
    <p>첫 번째 기준은 확인 가능한 정보가 남아 있는가입니다. 이벤트 문구가 아무리 좋아도 공식주소가 자주 바뀌거나, 가입코드 안내가 채널마다 다르거나, 출금 조건이 질문할 때마다 달라진다면 안정적인 선택으로 보기 어렵습니다. 특히 ${esc(post.keyword)} 계열 검색어는 광고성 문구가 섞이기 쉬우므로, 같은 문장을 반복하는 페이지보다 조건을 분해해 설명하는 페이지를 먼저 보는 것이 좋습니다.</p>
    <p>RUST에서는 이 기준을 세 가지로 나눕니다. 첫째, 도메인과 공식 채널의 일치입니다. 둘째, 가입코드와 혜택 조건의 연결성입니다. 셋째, 롤링·최대출금·정산 예외가 실제 이용 전에 확인되는지입니다. 이 세 가지가 맞지 않으면 혜택률이 높아도 결과적으로 실수령이 줄어들 수 있습니다.</p>
    <h2>가입코드와 공식주소를 같이 확인해야 하는 이유</h2>
    <p>가입코드는 단순한 문자가 아니라 유입 경로, 혜택 조건, 상담 이력, 전환 추적이 연결되는 기준값입니다. 그래서 바로가기 버튼을 누르기 전에는 코드가 자동으로 복사되더라도, 해당 코드가 실제 페이지에서 인정되는지 다시 확인해야 합니다. 보증업체 카드에서 코드가 표시되고, 상세보기에서도 같은 코드가 유지되며, 상담센터에서도 같은 코드로 안내된다면 일관성이 높다고 볼 수 있습니다.</p>
    <p>공식주소 역시 마찬가지입니다. 주소가 동일하더라도 서브도메인, 리다이렉트, 공지 채널, 텔레그램 연결이 엇갈리면 유저 입장에서는 신뢰도를 판단하기 어렵습니다. 검색 결과에서 바로 접속하기보다 RUST의 보증업체 허브와 검색 가이드를 함께 보는 이유가 여기에 있습니다.</p>
    <h2>롤링 조건과 실수령 관점</h2>
    <p>많은 사용자가 혜택률만 먼저 봅니다. 하지만 실제로 중요한 것은 조건을 충족한 뒤 얼마를 환전할 수 있는지입니다. 예를 들어 보너스가 커도 롤링 배수가 높거나, 특정 게임 인정률이 낮거나, 최대출금 제한이 촘촘하면 체감 혜택은 크게 줄어듭니다. 이때는 보너스 계산기나 롤링 계산기를 같이 사용해야 판단이 선명해집니다.</p>
    <p>${esc(post.keyword)} 관련 조건을 볼 때는 입금액, 보너스, 요구 롤링, 인정 게임, 최대출금, 정산 예외를 한 줄로 정리하는 습관이 필요합니다. 이 값들이 분리되어 있으면 광고 문구가 좋아 보여도 실제 부담이 숨어 있을 수 있습니다. RUST의 도구 페이지는 이런 값을 빠르게 비교하기 위한 보조 장치입니다.</p>
    <h2>검색 결과에서 걸러야 할 신호</h2>
    <p>검색 결과에는 같은 문구를 반복하거나, 주소만 바꿔가며 유사한 페이지를 만드는 사례가 많습니다. 지나치게 높은 혜택만 강조하고, 조건표나 공식 상담 연결이 없는 페이지는 신중하게 봐야 합니다. 반대로 혜택이 조금 낮더라도 조건표가 명확하고, 코드와 주소가 일관되며, 상담 응답이 기록 가능한 형태라면 비교할 가치가 있습니다.</p>
    <p>특히 ${esc(post.category)} 주제는 단기간 이벤트와 장기 운영 안정성을 분리해야 합니다. 오늘의 이벤트가 좋아도 다음 주에 정산 조건이 달라질 수 있으므로, 페이지에 남은 문구와 상담 응답을 함께 보관하는 것이 좋습니다. 이 글의 목적은 단일 추천이 아니라, 사용자가 직접 판단할 수 있는 기준을 제공하는 것입니다.</p>
    <h2>RUST에서 추천하는 확인 순서</h2>
    <p>첫째, 블로그에서 기본 개념을 읽습니다. 둘째, 도구 페이지에서 숫자로 계산합니다. 셋째, 보증업체 페이지에서 카드와 상세보기를 확인합니다. 넷째, 상담센터에서 현재 조건이 유지되는지 확인합니다. 이 순서대로 보면 정보가 흩어지지 않고, 같은 조건을 여러 번 확인할 수 있습니다.</p>
    <p>새로운 유저가 가장 자주 하는 실수는 조건을 한 곳에서만 확인하는 것입니다. 검색 결과, 업체 페이지, 상담 답변, 도구 계산값이 서로 맞아야 실제 판단이 가능합니다. RUST는 이 흐름을 한 사이트 안에서 이어지게 만드는 방향으로 설계되어 있습니다.</p>
    <div class="v82-link-panel">${links.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</div>
    <h2>관련 글과 다음 확인 루트</h2>
    <p>이 주제를 더 정확하게 보려면 아래 관련 글도 같이 확인하는 것이 좋습니다. 비슷한 키워드라도 검색 의도는 다를 수 있으므로, 혜택형·검증형·계산형·상담형 콘텐츠를 나눠 읽으면 판단이 빨라집니다.</p>
    <div class="v82-link-panel">${relatedText}</div>
    <div class="v82-longform-cta"><div><strong>조건이 애매하면 도구로 먼저 계산하세요.</strong><span>보너스, 롤링, 배당 마진, EV를 숫자로 확인한 뒤 보증업체와 상담센터로 이어가면 판단이 훨씬 안정적입니다.</span></div><a href="/tools/">도구 열기</a></div>`;
}
function renderPost(post) {
  const canonical = `${SITE}${route(post)}`;
  const title = `${post.title} | RUST`;
  const description = `${post.summary} RUST가 ${post.keyword} 검색 유입자를 위해 정리한 실전 가이드입니다.`;
  const keywords = ['RUST','88st.cloud',post.keyword,post.category,'토토사이트추천','입플사이트추천','스포츠입플','카지노입플','보증업체','롤링 조건','EV 계산법'].join(', ');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="keywords" content="${esc(keywords)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="RUST by 88ST"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://88st.cloud/assets/img/rust/rust-og.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/img/rust/rust-crest-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true"><link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true"><link rel="stylesheet" href="/assets/css/v82.structure-guard.css?v=static-v82-1-structure-ga4-20260525" data-v82-structure-guard="true"><link rel="stylesheet" href="${CSS_HREF}" data-v82-seo-content="true"><meta name="v82-1-structure-ga4" content="${V821_MARKER}"><meta name="v82-2-seo-content" content="${MARKER}"><meta name="rust-ga4-id" content="${GA_ID}"><script defer src="/assets/js/v82.ga4-events.js?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"></script></head><body class="rust-brand-system v82-seo-post" data-v82-2-seo="true"><div class="rust-page-shell"><header class="rust-header" data-rust-header="true"><a class="rust-brand" href="/" aria-label="RUST 메인으로 이동"><img src="/assets/img/rust/rust-crest-192.png" alt="RUST" width="38" height="38"><span>RUST</span></a><nav class="rust-nav" aria-label="상단 메뉴"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav></header><main><article><section class="v82-longform-hero"><span class="v82-longform-hero__tag">${esc(post.category)} · ${esc(post.keyword)}</span><h1>${esc(post.title)}</h1><p>${esc(description)}</p></section><div class="v82-longform-body">${articleSections(post)}</div></article></main><nav class="rust-mobile-nav" aria-label="모바일 메뉴"><a href="/">홈</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증</a><a href="/consult/">상담</a></nav></div></body></html>`;
}
function postCard(post, index) { return `<a class="v82-seo-card" href="${route(post)}" data-v82-seo-card="${index + 1}"><small>${esc(post.category)} · ${esc(post.keyword)}</small><b>${esc(post.title)}</b></a>`; }
function injectCss(html) { let next = html.replace(/<link\b[^>]*v82\.seo-content\.css[^>]*>\s*/gi, ''); return /<\/head>/i.test(next) ? next.replace(/<\/head>/i, `  <link rel="stylesheet" href="${CSS_HREF}" data-v82-seo-content="true">\n</head>`) : `<link rel="stylesheet" href="${CSS_HREF}" data-v82-seo-content="true">\n${next}`; }
function updateBlogIndex() {
  const rel = 'blog/index.html';
  let html = injectCss(read(rel));
  html = html.replace(/\s*<!-- V82-2 SEO CONTENT START -->[\s\S]*?<!-- V82-2 SEO CONTENT END -->\s*/g, '\n');
  html = html.replace(/총\s*\d+개\s*\/\s*페이지당\s*50개/g, '총 473개 / 페이지당 50개');
  const block = `\n<!-- V82-2 SEO CONTENT START -->\n<section class="v82-seo-strip" data-v82-2-seo-strip="true" aria-label="신규 SEO 확장 콘텐츠 20개">\n  <div class="v82-seo-strip__head"><strong>신규 유입 확장 콘텐츠</strong><span>토토·입플·보증업체·도구 연결 20개</span></div>\n  <div class="v82-seo-strip__grid">\n    ${POSTS.map(postCard).join('\n    ')}\n  </div>\n</section>\n<!-- V82-2 SEO CONTENT END -->\n`;
  html = html.replace(/(<main class="v72-blog-main">\s*<h1 class="v72-sr-only">[\s\S]*?<\/h1>)/, `$1${block}`);
  html = html.replace(/<script>window\.__V72_1_BLOG_POSTS__ = ([\s\S]*?);<\/script>/, (match, jsonText) => {
    try { const current = JSON.parse(jsonText); const additions = POSTS.map((post, index) => ({ title: post.title, href: route(post), category: post.category, excerpt: post.summary, score: 21000 - index * 137, views: 52000 - index * 417 })); const seen = new Set(additions.map((item) => item.href)); const merged = additions.concat(current.filter((item) => !seen.has(item.href))); return `<script>window.__V72_1_BLOG_POSTS__ = ${JSON.stringify(merged)};</script>`; } catch { return match; }
  });
  write(rel, html);
}
function updateHomePool() {
  const rel = 'index.html'; if (!fs.existsSync(file(rel))) return;
  let html = injectCss(read(rel));
  html = html.replace(/<script type="application\/json" id="v81-1-blog-pool">([\s\S]*?)<\/script>/, (match, jsonText) => {
    try { const current = JSON.parse(jsonText); const additions = POSTS.map((post) => ({ href: route(post), title: post.title, summary: post.summary, category: post.category })); const seen = new Set(additions.map((item) => item.href)); const merged = additions.concat(current.filter((item) => !seen.has(item.href))); return `<script type="application/json" id="v81-1-blog-pool">${JSON.stringify(merged)}</script>`; } catch { return match; }
  });
  write(rel, html);
}
function updateSitemap() {
  const urls = POSTS.map((post) => `${SITE}${route(post)}`);
  const txtPath = file('sitemap.txt'); if (fs.existsSync(txtPath)) { let body = fs.readFileSync(txtPath, 'utf8'); for (const url of urls) if (!body.includes(url)) body = body.trimEnd() + `\n${url}\n`; fs.writeFileSync(txtPath, body, 'utf8'); }
  const xmlPath = file('sitemap.xml'); if (fs.existsSync(xmlPath)) { let xml = fs.readFileSync(xmlPath, 'utf8'); for (const url of urls) if (!xml.includes(`<loc>${url}</loc>`)) xml = xml.replace(/\s*<\/urlset>\s*$/i, `\n  <url><loc>${url}</loc><lastmod>${today()}</lastmod></url>\n</urlset>\n`); fs.writeFileSync(xmlPath, xml, 'utf8'); }
}
function updatePackage() {
  const pkgPath = file('package.json'); const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); const generate = 'node scripts/generate-v82-2-seo-content.mjs'; const verify = 'node scripts/verify-v82-2-seo-content.mjs'; const chain = String(pkg.scripts?.build || '').split('&&').map((item) => item.trim()).filter(Boolean).filter((item) => item !== generate); chain.push(generate); pkg.scripts = pkg.scripts || {}; pkg.scripts.build = chain.join(' && '); pkg.scripts.verify = verify; pkg.scripts['quality:v82-2'] = generate; pkg.scripts['verify:v82-2'] = verify; fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}
for (const post of POSTS) write(htmlRel(post), renderPost(post));
updateBlogIndex(); updateHomePool(); updateSitemap(); updatePackage();
console.log(`[V82-2] SEO content expansion generated. posts=${POSTS.length} marker=${MARKER}`);
