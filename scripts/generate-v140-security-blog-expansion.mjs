
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const VERSION = 'V140_SECURITY_BLOG_EXPANSION';
const SITE = 'https://88st.cloud';
const today = '2026-05-31';
const retiredNeedles = [
  'minigame-streak-exclusion-guide',
  'minigame-losing-streak-event-exclusion-condition-guide',
  'minigame-losing-streak-event-exclusion-condition-first'
];

const posts = [
  {
    slug: 'mobile-addressbar-telegram-impersonation-scam',
    path: 'blog/mobile-addressbar-telegram-impersonation-scam.html',
    url: '/blog/mobile-addressbar-telegram-impersonation-scam.html',
    rank: 'V140-1',
    category: '모바일피싱',
    title: '모바일 주소창 사기와 텔레그램 사칭 먹튀: 공식센터 아이디 하나 차이로 당하는 피싱 수법',
    description: '모바일 브라우저 주소창 은닉, 가짜 공식센터 텔레그램 아이디, 사칭 상담방으로 이어지는 먹튀 피싱 수법을 쉬운 비유로 정리했습니다.',
    keywords: '모바일 주소창 사기, 텔레그램 사칭 먹튀, 공식 고객센터 사칭, 주소창 숨김 스크립트, 토토 피싱, 카지노 피싱, 보증 사이트, 가입코드 확인, RUST, 88ST.Cloud',
    intro: '모바일에서 사이트를 열었는데 주소창이 갑자기 사라지거나, 텔레그램 상담 아이디가 공식과 아주 비슷하게 보인다면 그냥 디자인 문제가 아닐 수 있습니다. 간판은 비슷하지만 문 안쪽은 전혀 다른 가짜 매장일 수 있습니다.',
    sections: [
      ['모바일 주소창 사기는 왜 눈치채기 어려운가', [
        '모바일 브라우저는 화면이 작습니다. 사기 사이트는 이 점을 이용해 상단 주소창이 덜 보이게 만들거나, 사용자가 스크롤하는 순간 주소를 확인하기 어렵게 꾸밉니다. 쉽게 말하면 택시 간판을 잠깐 가리고 손님을 엉뚱한 차에 태우는 방식과 비슷합니다.',
        '일반 유저는 화면에 로고가 있고 버튼이 정상으로 보이면 안심하기 쉽습니다. 하지만 진짜 확인해야 하는 것은 로고가 아니라 현재 주소, 공지된 공식 도메인, 상담 채널, 가입코드가 서로 맞는지입니다.'
      ]],
      ['텔레그램 공식센터 사칭은 아이디 한 글자로 시작된다', [
        '가장 흔한 수법은 공식 아이디 뒤에 알파벳 하나를 더 붙이거나 숫자를 비슷하게 바꾸는 것입니다. 예를 들어 공식 상담센터처럼 보이게 만들고 마지막에 l, i, 1 같은 문자를 섞으면 작은 화면에서는 거의 구별되지 않습니다.',
        '사칭 상담방은 먼저 친절하게 응대합니다. 그다음 “지금 주소가 바뀌었다”, “이쪽 링크로 재가입하면 혜택이 크다”, “입금 확인을 위해 지갑 주소를 바꿔야 한다”는 식으로 사용자를 다른 경로로 이동시킵니다.'
      ]],
      ['중학생도 이해하는 피싱 확인 비유', [
        '진짜 학교 앞 문방구와 똑같은 간판을 단 가짜 가게가 옆 골목에 있다고 생각하면 됩니다. 물건 진열과 계산대는 비슷하지만, 영수증도 다르고 주인도 다르고 문제가 생겼을 때 책임지는 곳도 다릅니다.',
        '모바일 피싱도 같습니다. 화면이 비슷하다고 같은 사이트가 아닙니다. 주소, 공지 채널, 텔레그램 아이디, 가입코드가 모두 맞아야 같은 사이트라고 볼 수 있습니다.'
      ]],
      ['접속 전 최소 확인 순서', [
        '첫째, 검색 결과에서 바로 입금하지 말고 보증업체 페이지의 현재 주소를 먼저 확인해야 합니다. 둘째, 텔레그램 아이디는 복사해서 비교하고 마지막 글자까지 봐야 합니다. 셋째, 코드 입력 전에는 공식 상담센터에서 현재 코드가 유지되는지 확인하는 것이 안전합니다.',
        '주소가 조금이라도 이상하거나, 상담원이 외부 링크를 급하게 보내거나, 지금 바로 입금해야 혜택이 유지된다고 압박하면 멈추는 것이 맞습니다.'
      ]]
    ],
    bullets: ['주소창이 갑자기 숨거나 확인이 어려운 화면', '공식 텔레그램 아이디와 한 글자만 다른 상담방', '가입코드·도메인·공지 채널이 서로 맞지 않는 상황'],
    conclusion: '이런 복잡한 피싱 사이트를 일반 유저가 일일이 구별하는 것은 불가능합니다. 본사 기술팀이 24시간 도메인과 보안을 실시간 감시하는 안전 보증 사이트를 이용하는 것이 가장 확실한 정답입니다.',
    ctaTitle: '[보증 사이트 가입 링크 및 추천코드 안내]',
    ctaText: '보증업체 페이지에서 현재 공식주소, 추천코드, 상담 연결 상태를 먼저 확인하세요.'
  },
  {
    slug: 'fake-evolution-pragmatic-api-parsing-site-check',
    path: 'blog/fake-evolution-pragmatic-api-parsing-site-check.html',
    url: '/blog/fake-evolution-pragmatic-api-parsing-site-check.html',
    rank: 'V140-2',
    category: '가짜API',
    title: '내가 접속한 에볼루션이 가짜일 수 있다: 프라그마틱·카지노 API 파싱 사이트 조작 구별법',
    description: '에볼루션, 프라그마틱 로고와 화면만 베낀 가짜 API 파싱 사이트가 왜 위험한지, 일반 유저 기준으로 확인할 신호를 정리했습니다.',
    keywords: '가짜 에볼루션 API, 프라그마틱 가짜 API, 카지노 파싱 사이트, 슬롯 조작 구별법, 에볼루션 먹튀, 프라그마틱 먹튀, 정품 API 연동, 보증 카지노, RUST, 88ST.Cloud',
    intro: '로고가 같고 화면이 비슷하다고 정품 게임이라고 단정하면 위험합니다. 가짜 API 파싱 사이트는 유명 게임사의 겉모습만 따라 만들고, 내부 결과 처리와 정산 흐름은 운영자가 마음대로 만질 수 있게 꾸미는 경우가 있습니다.',
    sections: [
      ['정품 화면과 가짜 화면은 눈으로 구별하기 어렵다', [
        '일반 유저가 가장 많이 착각하는 부분은 “화면이 똑같으니 정품일 것”이라는 생각입니다. 하지만 요즘은 로고, 버튼, 게임 로딩 화면, 배경 이미지를 거의 똑같이 베낄 수 있습니다. 겉모습만 보면 진짜 영화관 티켓처럼 보이지만, 실제로는 복사한 종이일 수 있습니다.',
        '그래서 단순히 화면을 보고 판단하면 안 됩니다. 공급사 공식 연동 여부, 게임 진입 방식, 로딩 흐름, 결과 처리, 출금 정산 조건을 함께 봐야 합니다.'
      ]],
      ['가짜 API 파싱 사이트에서 자주 보이는 신호', [
        '첫 번째 신호는 미세한 로딩 지연입니다. 진짜 공급사 서버와 직접 연결되는 구조가 아니라 중간 화면을 한 번 더 거치면, 게임 진입이나 라운드 전환이 이상하게 무겁게 느껴질 수 있습니다.',
        '두 번째는 공급사 로고를 눌러도 반응이 없거나, 공식 정보로 연결되지 않는 경우입니다. 진짜 서비스라면 공급사 표기와 게임 정보가 자연스럽게 맞아야 하는데, 가짜는 그림만 붙여둔 경우가 많습니다.'
      ]],
      ['결과값 조작은 사용자가 보기 어렵다', [
        '가짜 사이트의 무서운 점은 조작이 눈앞에서 대놓고 보이지 않는다는 것입니다. 사용자는 게임이 정상으로 돌아가는 것처럼 느끼지만, 내부에서는 배당 제한, 당첨 반영 지연, 결과값 표시 조작, 정산 예외가 섞일 수 있습니다.',
        '이런 구조는 일반 유저가 개발자 도구를 열거나 네트워크를 분석한다고 쉽게 밝히기 어렵습니다. 그래서 “내가 직접 구별하겠다”보다 처음부터 정품 API 연동과 보증 조건이 검증된 곳을 고르는 것이 현실적인 방어입니다.'
      ]],
      ['카지노·슬롯 유저가 먼저 확인할 것', [
        '에볼루션, 프라그마틱, 노리밋, 기타 슬롯 공급사 이름이 보인다고 바로 신뢰하면 안 됩니다. 현재 접속 주소가 보증업체 페이지의 공식 도메인과 같은지, 상담센터가 같은 안내를 하는지, 출금 분쟁 시 보증 범위가 명확한지 먼저 봐야 합니다.',
        '특히 “정품 API”라는 말만 크게 걸어두고 실제 보증 범위나 분쟁 처리 기준이 없는 곳은 주의가 필요합니다.'
      ]]
    ],
    bullets: ['공급사 로고 클릭 시 반응이 없거나 정보가 어색한 화면', '게임 로딩이 반복적으로 느리거나 중간 화면이 많은 구조', '당첨·배당·정산 결과가 공지 조건과 다르게 처리되는 상황'],
    conclusion: '조작된 가짜 게임에서 돈을 잃고 후회하지 마세요. 오직 정품 100% API 연동과 먹튀 발생 시 100% 환불을 보장하는 아래 안전 보증 사이트에서 안전하게 플레이하세요.',
    ctaTitle: '[보증 사이트 바로가기 버튼]',
    ctaText: '정품 API 연동 여부와 보증 범위를 먼저 확인할 수 있는 보증업체 페이지로 이동하세요.'
  },
  {
    slug: 'usdt-trx-coin-deposit-withdrawal-scam-txid-guide',
    path: 'blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html',
    url: '/blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html',
    rank: 'V140-3',
    category: '코인먹튀',
    title: '코인 토토사이트 먹튀 수법: USDT·TRX 입금 사기와 TxID 추적 전 꼭 확인할 것',
    description: 'USDT, TRX 코인 입출금을 이용한 먹튀 수법과 TxID 보관 이유, 익명성 지갑 사기 예방 기준을 초보자 눈높이로 정리했습니다.',
    keywords: '코인 토토사이트 먹튀, USDT 입금 사기, TRX 먹튀, 테더 입출금 카지노, TxID 추적, 트론 지갑 사기, 코인 먹튀 예방, 보증업체 추천코드, RUST, 88ST.Cloud',
    intro: '코인은 빠르고 편리하지만, 이 장점을 먹튀 사이트가 악용하기도 합니다. “통장보다 안전하다”는 말을 앞세워 USDT나 TRX 입금을 유도한 뒤, 문제가 생기면 지갑 주소만 바꾸고 사라지는 방식입니다.',
    sections: [
      ['코인 입출금이 무조건 안전하다는 착각', [
        'USDT와 TRX는 입출금 속도가 빠르고 기록이 남습니다. 그래서 초보자는 “기록이 남으니 안전하겠지”라고 생각하기 쉽습니다. 하지만 기록이 남는 것과 돈을 돌려받을 수 있는 것은 전혀 다른 문제입니다.',
        '사기 사이트는 이 차이를 이용합니다. 입금 주소는 계속 바꾸고, 상담방은 닫고, 도메인은 갈아타면서 “블록체인에는 입금이 보이지 않는다”거나 “다른 네트워크로 보냈다”는 식으로 책임을 돌립니다.'
      ]],
      ['TxID를 반드시 확보해야 하는 이유', [
        'TxID는 택배 운송장 번호와 비슷합니다. 내가 언제, 어느 지갑에서, 어느 지갑으로, 얼마를 보냈는지 확인할 수 있는 기본 기록입니다. 먹튀가 발생했을 때 최소한의 증거가 되기 때문에 입금 직후 반드시 보관해야 합니다.',
        '단, TxID가 있다고 해서 개인이 모든 추적을 끝낼 수 있는 것은 아닙니다. 중간 지갑, 거래소 입금, 여러 주소 분산, 믹싱성 이동이 섞이면 일반 유저가 흐름을 따라가기 어렵습니다.'
      ]],
      ['익명성 지갑을 악용하는 양아치 사이트들', [
        '문제는 코인의 기술이 아니라 그것을 악용하는 운영 방식입니다. 일부 양아치 사이트는 “코인은 빠르다”, “계좌보다 안전하다”, “수수료를 지원한다”는 말로 입금을 유도합니다. 하지만 정작 출금 때는 지연, 점검, 네트워크 오류, 추가 인증을 핑계로 시간을 끕니다.',
        '더 나쁜 경우에는 입금 주소만 받고 사이트와 상담방을 동시에 닫습니다. 이런 곳은 처음부터 정산할 생각이 없기 때문에 혜택 문구가 아무리 좋아도 피해야 합니다.'
      ]],
      ['코인 입출금 전 확인해야 할 기준', [
        '첫째, 보증업체 페이지에서 해당 업체의 현재 도메인과 상담 채널을 확인해야 합니다. 둘째, 입금 지갑 주소를 받았다면 상담 내용, 주소, TxID, 시간, 금액을 함께 캡처해야 합니다. 셋째, 수수료 지원 조건과 최소 입출금 금액을 기록으로 남겨야 합니다.',
        '코인 입출금은 익명성과 속도가 장점이지만, 보증 구조가 없는 곳에서는 오히려 책임 회피에 악용될 수 있습니다.'
      ]]
    ],
    bullets: ['입금 전 지갑 주소·네트워크·최소 금액 캡처', '입금 직후 TxID와 상담 내용 보관', '출금 지연 시 추가 입금 요구가 나오면 즉시 중단'],
    conclusion: '개인이 코인 트랙킹을 하는 것은 사실상 불가능합니다. 코인 입출금의 익명성은 지키되, 자본력이 검증되어 절대로 코인 먹튀를 하지 않는 자사 보증 업체를 추천합니다.',
    ctaTitle: '[추천 보증 사이트 및 가입 코드 안내]',
    ctaText: 'USDT·TRX 입출금 조건과 추천코드는 보증업체 페이지에서 현재 기준으로 확인하세요.'
  }
];

function read(file) { return readFileSync(file, 'utf8'); }
function write(file, text) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text, 'utf8'); }
function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function stripTags(s) { return String(s).replace(/<[^>]*>/g, ''); }

function renderArticle(post) {
  const url = SITE + post.url;
  const sections = post.sections.map(([h, ps]) => `<h2>${esc(h)}</h2>\n${ps.map(p => `<p>${esc(p)}</p>`).join('\n')}`).join('\n');
  const bullets = post.bullets.map(b => `<li>${esc(b)}</li>`).join('\n');
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url,
    datePublished: today,
    dateModified: today,
    inLanguage: 'ko-KR',
    publisher: { '@type': 'Organization', name: 'RUST', url: SITE + '/' },
    mainEntityOfPage: url
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="ko" data-v140-security-blog="active" data-v139-blog-quality="active" data-v138-6-blog-seo-refresh="active">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(post.title)} | RUST 블로그</title>
  <meta name="description" content="${esc(post.description)}">
  <meta name="keywords" content="${esc(post.keywords)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="RUST">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(post.title)}">
  <meta property="og:description" content="${esc(post.description)}">
  <meta property="og:image" content="${SITE}/assets/img/rust/rust-og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(post.title)}">
  <meta name="twitter:description" content="${esc(post.description)}">
  <meta name="twitter:image" content="${SITE}/assets/img/rust/rust-og.jpg">
  <meta name="rust-ga4-id" content="G-KWT87FBY6S">
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
  <link rel="dns-prefetch" href="//www.googletagmanager.com">
  <link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true">
  <link rel="stylesheet" href="/assets/css/v71.main-home.css?v=static-v71-main-effects-refinement-20260524" data-v71-main="true">
  <link rel="stylesheet" href="/assets/css/v72-1.blog-lock.css?v=static-v72-1-blog-lock-20260524" data-v72-blog="true">
  <link rel="stylesheet" href="/assets/css/v82.structure-guard.css?v=static-v82-1-structure-ga4-20260525" data-v82-structure-guard="true">
  <link rel="stylesheet" href="/assets/css/v82.seo-content.css?v=static-v82-2-seo-content-20260525" data-v82-seo-content="true">
  <link rel="stylesheet" href="/assets/css/v135-1-blog-dark-tone-restore.css?v=20260530-1" data-v135-1-blog-tone="true">
  <link rel="stylesheet" href="/assets/css/v135-2-global-footer-tone-recovery.css?v=20260530-3" data-v135-2-tone-footer="true">
  <link rel="stylesheet" href="/assets/css/v135-3-footer-placement-hotfix.css?v=20260530-1" data-v135-3-footer-placement="true">
  <link rel="stylesheet" href="/assets/css/v135-4-global-header-brand-unify.css?v=20260530-1" data-v135-4-global-header-brand="true">
  <link rel="stylesheet" href="/assets/css/v135-5-blog-header-dark-lock.css?v=20260530-1" data-v135-5-blog-header-dark-lock="true">
  <link rel="stylesheet" href="/assets/css/v135-6-tool-modal-footer-fix.css?v=20260530-1" data-v135-6-tool-modal-footer-fix="true">
  <link rel="stylesheet" href="/assets/css/v135-8-mobile-home-layout-fix.css?v=20260530-1" data-v135-8-mobile-home-layout="true">
  <link rel="stylesheet" href="/assets/css/v138-6-blog-content-seo-refresh.css?v=20260531-v138-6-blog-seo-refresh" data-v138-6-blog-seo-refresh="true">
  <link rel="stylesheet" href="/assets/css/v139-blog-content-differentiation.css?v=20260531-v139-blog-quality" data-v139-blog-quality="true">
  <link rel="stylesheet" href="/assets/css/v140-security-blog-expansion.css?v=20260531-v140-security-blog" data-v140-security-blog="true">
  <script defer src="/assets/js/v82.ga4-events.js?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"></script>
  <script defer src="/assets/js/v89.ga4-event-depth.js?v=static-v89-ga4-event-depth-20260525" data-v89-ga4-depth="true"></script>
  <script type="application/ld+json" data-v140-schema="true">${schema}</script>
</head>
<body class="rust-brand-system v82-seo-post v85-2-seo-post v85-4-seo-post-shell v96-3-mobile-safe-layout v96-4-live-qa-cache-safe v98-performance-image v100-structure-lock-release" data-v140-security-blog="true">
<header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true" data-v85-4-post-shell="true"> <div class="rust-header-inner"> <a class="rust-brand" href="/" aria-label="RUST 메인으로 이동"> <span class="rust-brand-mark" aria-hidden="true"><img src="/assets/img/rust/rust-crest-64.png" alt="" width="34" height="34" decoding="async" loading="eager"></span> <span class="rust-brand-type"><strong>RUST</strong></span> </a> <nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴" data-rust-nav="desktop"><a href="/">메인</a><a href="/blog/" class="is-active" aria-current="page">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav> <button class="rust-menu-button" type="button" aria-label="메뉴 열기" aria-expanded="false" data-rust-menu-toggle><span></span><span></span></button> </div> <nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴" data-rust-nav="mobile-menu"><a href="/">메인</a><a href="/blog/" class="is-active" aria-current="page">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav> </header>
<div class="rust-page-shell"><main><article>
<section class="v82-longform-hero"><span class="v82-longform-hero__tag">${esc(post.category)} · V140 보안 가이드</span><h1>${esc(post.title)}</h1><p>${esc(post.description)}</p></section>
<div class="v82-longform-body">
<p>${esc(post.intro)}</p>
<div class="v140-security-note"><strong>핵심 요약</strong><br>${esc(post.description)}</div>
${sections}
<h2>유저가 바로 확인할 위험 신호</h2>
<ul class="v140-warning-list">${bullets}</ul>
<h2>보증 사이트를 먼저 확인해야 하는 이유</h2>
<p>피싱, 가짜 API, 코인 입출금 먹튀는 화면만 보고 판단하기 어렵습니다. 그래서 주소, 코드, 상담 채널, 보증 범위가 한 화면에서 이어지는 구조를 먼저 확인해야 합니다.</p>
<p>RUST는 블로그에서 위험 수법을 설명하고, 보증업체 페이지에서 현재 공식주소와 가입코드를 확인하는 흐름을 유지합니다. 바로 입금하기보다 확인 루트를 먼저 고정하는 것이 가장 안전합니다.</p>
<div class="v140-cta-space" data-v140-cta="guaranteed"><h2>${esc(post.ctaTitle)}</h2><p>${esc(post.conclusion)}</p><p>${esc(post.ctaText)}</p><div class="v140-cta-actions"><a href="/guaranteed/" data-ga4-event="v140_guaranteed_click">보증업체 확인</a><a href="/consult/" data-ga4-event="v140_consult_click">상담센터 확인</a></div></div>
</div></article></main></div>
<script defer src="/assets/js/v76.rust-brand-system.js?v=static-v76-rust-brand-system-20260524" data-v76-rust="true"></script>
<script defer src="/assets/js/v77.rust-logo-assets.js?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true"></script>
<nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴" data-rust-bottom-nav="true" data-v85-4-post-shell="true" data-rust-nav="bottom"><a href="/" data-ga4-event="mobile_bottom_nav_click"><span>⌂</span>메인</a><a href="/blog/" class="is-active" aria-current="page" data-ga4-event="mobile_bottom_nav_click"><span>▤</span>블로그</a><a href="/tools/" data-ga4-event="mobile_bottom_nav_click"><span>◇</span>도구</a><a href="/guaranteed/" data-ga4-event="mobile_bottom_nav_click"><span>◆</span>보증업체</a><a href="/consult/" data-ga4-event="mobile_bottom_nav_click"><span>✦</span>상담</a></nav>
<script src="/assets/js/v96-3-mobile-safe-layout.js?v=static-v96-3-mobile-safe-layout-20260526-v96-4-cache-safe" defer data-v96-3-mobile-safe-layout="true"></script>
<script src="/assets/js/v96-4-live-qa-cache-safe.js?v=static-v96-4-live-qa-cache-safe-20260526" defer data-v96-4-live-qa-cache-safe="true"></script>
<script defer src="/assets/js/v97-content-seo-clean.js?v=static-v97-content-seo-clean-20260526" data-v97-content-seo-clean="true"></script>
<script defer src="/assets/js/v98-performance-image.js?v=static-v98-performance-image-20260526" data-v98-performance-image="true"></script>
<footer class="moon-footer" data-v135-2-footer="canonical"><div class="moon-container v56-footer-row"><div><span class="v56-footer-logo"><span class="v56-logo-main">88ST</span><span class="v56-logo-cloud">.Cloud</span></span><p>보증업체, 실사용 도구, 전문 가이드를 일관된 기준으로 정리합니다.</p></div><nav class="v56-footer-links" aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></footer>
</body></html>`;
}

for (const post of posts) write(post.path, renderArticle(post));

// Update blog index cards and count.
if (!existsSync('blog/index.html')) throw new Error('blog/index.html missing');
let blog = read('blog/index.html');
blog = blog.replace(/\n?<!-- V140_SECURITY_BLOG_CARDS_START -->[\s\S]*?<!-- V140_SECURITY_BLOG_CARDS_END -->\n?/g, '\n');
blog = blog.replace(/인기글 · 핵심글 · 최신글 \d+개/g, '인기글 · 핵심글 · 최신글 78개');
if (!blog.includes('/assets/css/v140-security-blog-expansion.css')) {
  blog = blog.replace('</head>', '  <link rel="stylesheet" href="/assets/css/v140-security-blog-expansion.css?v=20260531-v140-security-blog" data-v140-security-blog="true">\n</head>');
}
blog = blog.replace('data-v139-blog-quality="active"', 'data-v140-security-blog="active" data-v139-blog-quality="active"');
const cards = posts.map(post => `<a class="v72-blog-card v140-security-blog-card" href="${post.url}" data-v140-security-blog="true" data-title="${esc(post.title)}" data-category="${esc(post.category)}" data-ga4-event="blog_card_click"><div class="v72-blog-card__body"><div class="v72-blog-card__top"><span class="v72-blog-card__rank">${post.rank}</span><span class="v72-blog-card__tag">${esc(post.category)}</span><span class="v99-blog-tier">보안</span></div><strong>${esc(post.title)}</strong><p>${esc(post.description)}</p></div><div class="v72-blog-card__meta"><span class="v72-blog-card__views">V140 신규</span><span class="v72-blog-card__go">›</span></div></a>`).join('\n');
const block = `<!-- V140_SECURITY_BLOG_CARDS_START -->\n${cards}\n<!-- V140_SECURITY_BLOG_CARDS_END -->\n`;
if (!blog.includes('<!-- V140_SECURITY_BLOG_CARDS_START -->')) {
  blog = blog.replace('<div class="v72-blog-grid" data-v72-blog-grid>', '<div class="v72-blog-grid" data-v72-blog-grid>\n' + block);
}
write('blog/index.html', blog);

// Update sitemap files.
const newUrls = posts.map(p => SITE + p.url);
for (const file of ['sitemap.txt', 'serverless/sitemap.txt']) {
  if (!existsSync(file)) continue;
  let text = read(file);
  for (const url of newUrls) {
    if (!text.includes(url)) text = text.trimEnd() + '\n' + url + '\n';
  }
  write(file, text);
}
for (const file of ['sitemap.xml', 'serverless/sitemap.xml']) {
  if (!existsSync(file)) continue;
  let text = read(file);
  const entries = newUrls.map(url => `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.72</priority></url>`).join('\n');
  for (const url of newUrls) {
    if (!text.includes(`<loc>${url}</loc>`)) text = text.replace(/\s*<\/urlset>\s*$/i, '\n' + entries + '\n</urlset>\n');
  }
  write(file, text);
}

// Update SEO meta config.
if (existsSync('assets/config/seo.meta.json')) {
  const seo = JSON.parse(read('assets/config/seo.meta.json'));
  for (const post of posts) {
    seo[post.url] = { title: `${post.title} | RUST 블로그`, description: post.description, keywords: post.keywords };
  }
  write('assets/config/seo.meta.json', JSON.stringify(seo, null, 2) + '\n');
}

const report = {
  ok: true,
  version: VERSION,
  addedPosts: posts.map(p => ({ title: p.title, url: p.url, file: p.path })),
  blogCount: 78,
  deletedFiles: [],
  generatedAt: new Date().toISOString()
};
mkdirSync('reports', { recursive: true });
write('reports/v140-security-blog-expansion-audit.json', JSON.stringify(report, null, 2) + '\n');
write('V140_PATCH_MANIFEST.json', JSON.stringify(report, null, 2) + '\n');
write('V140_UPGRADE_REPORT.md', `# V140 SECURITY BLOG EXPANSION\n\n- Added 3 security-focused blog posts.\n- Updated blog index count to 78.\n- Updated sitemap and seo.meta.json.\n- V139-11 broken V9 route lock is preserved.\n- Deleted files: 0.\n\nGenerated: ${report.generatedAt}\n`);
console.log('[V140 GENERATE PASS]', JSON.stringify(report, null, 2));
