import fs from 'fs';
import path from 'path';

const root = process.cwd();
const version = 'V79_RUST_LONGFORM_HUBS_ACTIVE';
const cssHref = '/assets/css/v79.rust-longform-hubs.css?v=static-v79-rust-longform-hubs-20260525';

const sportsTitleMap = new Map([
  ['sports-check/baseball/kbo-bullpen.html', ['KBO 불펜 운영 체크', '야구', '불펜 소모와 후반 실점 변수를 중심으로 보는 KBO 분석 기준입니다.']],
  ['sports-check/baseball/kbo-over-under.html', ['KBO 오버언더 체크', '야구', '선발, 불펜, 날씨, 라인 이동을 함께 보는 총점 분석 기준입니다.']],
  ['sports-check/baseball/kbo-rain-cancel.html', ['KBO 우천 취소 체크', '야구', '강수와 경기 운영 변수가 배당 판단에 미치는 영향을 정리합니다.']],
  ['sports-check/baseball/kbo-starting-pitcher.html', ['KBO 선발투수 체크', '야구', '선발 정보와 투구 타입, 최근 이닝 소화력을 기준화합니다.']],
  ['sports-check/basketball/handicap-quarter.html', ['농구 쿼터 핸디캡 체크', '농구', '쿼터 흐름과 로테이션 차이를 핸디캡 관점으로 해석합니다.']],
  ['sports-check/basketball/pace-scoring.html', ['농구 페이스 득점 체크', '농구', '공격 템포, 야투 효율, 자유투 변수를 합쳐 총점을 봅니다.']],
  ['sports-check/football/handicap-draw.html', ['축구 핸디캡 무승부 체크', '축구', '핸디캡 무승부와 저득점 구간의 상관성을 검토합니다.']],
  ['sports-check/football/lineup-injury.html', ['축구 라인업 부상 체크', '축구', '선발 라인업, 결장자, 포지션 공백을 배당 변동과 연결합니다.']],
  ['sports-check/football/over-under.html', ['축구 오버언더 체크', '축구', '득점 기대값, 전술 속도, 라인 흐름을 함께 보는 기준입니다.']],
  ['sports-check/volleyball/over-under.html', ['배구 오버언더 체크', '배구', '세트별 득점 흐름과 서브 리시브 안정성을 총점으로 연결합니다.']],
  ['sports-check/volleyball/rotation-form.html', ['배구 로테이션 폼 체크', '배구', '로테이션과 공격 옵션 분산도를 기준화합니다.']],
  ['sports-check/volleyball/set-handicap.html', ['배구 세트 핸디캡 체크', '배구', '세트 단위 전력 차와 승부 구간을 분리해서 봅니다.']],
]);

const guideTitleMap = new Map([
  ['search-guides/sk-holdings-iron888.html', ['SK 홀딩스 IRON888 코드 확인', '보증업체', '공식 코드와 주소 확인 흐름을 정리합니다.']],
  ['search-guides/queenbee-seoa-code.html', ['여왕벌 SEOA 코드 확인', '보증업체', '가입코드와 공식 연결 기준을 확인합니다.']],
  ['search-guides/anybet-seoa-code.html', ['ANY BET SEOA 코드 확인', '보증업체', 'ANY BET 이용 전 코드와 조건을 점검합니다.']],
  ['search-guides/udt-seoa-code.html', ['UDT BET SEOA 코드 확인', '보증업체', 'UDT BET 가입코드와 상담 연결 기준입니다.']],
  ['search-guides/ddangkong-ddk888-code.html', ['땅콩 BET DDK888 코드 확인', '보증업체', '땅콩 BET 공식 코드와 주소 확인 기준입니다.']],
]);

const fallbackLabels = {
  'baccarat-affiliate-settlement': '바카라 제휴 정산 확인',
  'baseball-rain-settlement': '야구 우천 정산 확인',
  'basketball-handicap-check': '농구 핸디캡 확인',
  'casino-comp-point': '카지노 콤프 포인트 확인',
  'casino-recharge-condition': '카지노 재충전 조건 확인',
  'casino-slot-comp-condition': '카지노 슬롯 콤프 조건 확인',
  'code-input-mistake': '가입코드 입력 실수 확인',
  'entry-game-check': '엔트리 게임 확인',
  'first-charge-rolling': '첫충 롤링 조건 확인',
  'football-over-under-check': '축구 오버언더 확인',
  'kbo-starting-pitcher-check': 'KBO 선발투수 확인',
  'lotus-odd-even-settlement': '로터스 홀짝 정산 확인',
  'minigame-rolling-condition': '미니게임 롤링 조건 확인',
  'nolimit-city-slot-check': '노리밋 슬롯 확인',
  'official-address-impersonation-check': '공식주소 사칭 구분법',
  'payout-delay-check': '환전 지연 체크',
  'payout-evidence-capture': '환전 증빙 캡처 기준',
  'payout-inquiry-template': '환전 문의 문구 정리',
  'pragmatic-slot-event': '프라그마틱 슬롯 이벤트 확인',
  'provider-official-address': '게임사 공식주소 확인',
  'roulette-coupon-check': '룰렛 쿠폰 조건 확인',
  'slot-payback-condition': '슬롯 페이백 조건 확인',
  'sports-betting-before-join': '스포츠 이용 전 체크',
  'sports-one-pick-event': '스포츠 원픽 이벤트 확인',
  'telegram-consult-trs999-bot': '텔레그램 TRS999 상담 연결',
  'toto-affiliate-code-management': '토토 제휴코드 관리 기준',
  'usdt-casino-benefit': 'USDT 카지노 혜택 확인',
  'usdt-deposit-provider-check': 'USDT 입금처 확인',
  'volleyball-set-handicap': '배구 세트 핸디캡 확인',
  'weekly-payback-condition': '주간 페이백 조건 확인',
};

const tools = [
  { name: '배당 마진 계산', href: '/tools/?tool=margin', icon: 'M', desc: '마진·정배당 기준을 빠르게 비교합니다.' },
  { name: '기대값 계산', href: '/tools/?tool=ev', icon: 'E', desc: '확률과 배당으로 EV 구간을 확인합니다.' },
  { name: '롤링 조건 계산', href: '/tools/?tool=rolling', icon: 'R', desc: '조건·배수·실사용 기준을 정리합니다.' },
  { name: '보너스 실수령', href: '/tools/?tool=bonus', icon: 'B', desc: '첫충·매충 조건의 실수령을 봅니다.' },
  { name: '스포츠 분석', href: '/tools/?tool=sports', icon: 'S', desc: '경기 전 체크 포인트를 압축합니다.' },
];

function walk(dir, out = []) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) walk(path.relative(root, full), out);
    else if (entry.name.endsWith('.html')) out.push(path.relative(root, full).replaceAll('\\', '/'));
  }
  return out;
}
function write(rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}
function slugTitle(rel) {
  const base = path.basename(rel, '.html');
  const label = fallbackLabels[base] || base.split('-').map(s => s.toUpperCase()).join(' ');
  return [label, rel.startsWith('sports-check') ? '스포츠 체크' : '검색 가이드', `${label} 기준을 RUST 방식으로 정리한 실사용 가이드입니다.`];
}
const sportsDetails = walk('sports-check').filter(p => !p.endsWith('/index.html')).sort();
const guideDetails = walk('search-guides').filter(p => !p.endsWith('/index.html')).sort();
const sportsItems = sportsDetails.map(rel => {
  const [title, category, desc] = sportsTitleMap.get(rel) || slugTitle(rel);
  return { rel, href: '/' + rel, title, category, desc };
});
const guideItems = guideDetails.map(rel => {
  const [title, category, desc] = guideTitleMap.get(rel) || slugTitle(rel);
  return { rel, href: '/' + rel, title, category, desc };
});
const popularSports = ['sports-check/football/over-under.html','sports-check/football/lineup-injury.html','sports-check/baseball/kbo-starting-pitcher.html','sports-check/basketball/pace-scoring.html','sports-check/volleyball/set-handicap.html'].map(rel => sportsItems.find(x => x.rel === rel)).filter(Boolean);
const popularGuides = ['search-guides/official-address-impersonation-check.html','search-guides/first-charge-rolling.html','search-guides/payout-delay-check.html','search-guides/sk-holdings-iron888.html','search-guides/telegram-consult-trs999-bot.html'].map(rel => guideItems.find(x => x.rel === rel)).filter(Boolean);

function esc(s) { return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function header(active) {
  const nav = [
    ['/', '메인'], ['/blog/', '블로그'], ['/tools/', '도구'], ['/guaranteed/', '보증업체'], ['/consult/', '상담']
  ];
  return `<header class="v79-header" data-v79-rust-longform="true"><div class="v79-header-inner"><a class="v79-brand" href="/" aria-label="RUST 메인"><img src="/assets/img/rust/rust-crest-64.png" alt="RUST"><span class="v79-brand-name">RUST</span></a><nav class="v79-nav" aria-label="상단 메뉴">${nav.map(([href,label]) => `<a href="${href}" class="${active===href?'active':''}">${label}</a>`).join('')}</nav></div></header>`;
}
function mobileNav(active) {
  const nav = [['/','⌂','메인'],['/blog/','▤','블로그'],['/tools/','◇','도구'],['/guaranteed/','◆','보증'],['/consult/','✦','상담']];
  return `<nav class="v79-mobile-nav" aria-label="모바일 하단 메뉴">${nav.map(([href,icon,label]) => `<a href="${href}" class="${active===href?'active':''}"><span>${icon}</span>${label}</a>`).join('')}</nav>`;
}
function head(title, desc, canonical) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="v79-rust-longform-hubs" content="${version}"><title>${esc(title)} | RUST</title><meta name="description" content="${esc(desc)}"><meta name="keywords" content="RUST, 러스트, 88st.cloud, 스포츠 체크, 검색 가이드, 토토사이트추천, 입플사이트추천, 롤링 조건, 배당 마진, 공식주소 확인"><link rel="canonical" href="https://88st.cloud${canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="RUST by 88ST"><meta property="og:title" content="${esc(title)} | RUST"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="https://88st.cloud/assets/img/rust/rust-og.jpg"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/assets/css/v79.rust-longform-hubs.css"></head>`;
}
function itemCard(item, rank = 1) {
  return `<a class="v79-card" href="${item.href}"><div><strong>${esc(item.title)}</strong><p>${esc(item.desc)}</p></div><div class="v79-chipline"><span class="v79-chip">${esc(item.category)}</span><span class="v79-chip">TOP ${rank}</span></div></a>`;
}
function toolCard(t) {
  return `<a class="v79-tool" href="${t.href}"><i>${t.icon}</i><b>${esc(t.name)}</b><span>${esc(t.desc)}</span></a>`;
}
function rails(items, contextLabel) {
  return `<section class="v79-hub-stack" aria-label="${esc(contextLabel)} 인기 자료와 분석 도구"><div><div class="v79-row-title"><span>POPULAR INSIGHT</span><small>많이 찾는 핵심 글 5개</small></div><div class="v79-rail">${items.slice(0,5).map((it,idx)=>itemCard(it,idx+1)).join('')}</div></div><div><div class="v79-row-title"><span>ANALYSIS TOOLS</span><small>실사용 분석 도구 5개</small></div><div class="v79-rail">${tools.map(toolCard).join('')}</div></div></section>`;
}
function pagination(total, current=1) {
  const pages = Math.max(1, Math.ceil(total / 50));
  let nums = [];
  for (let i=1;i<=Math.min(pages,6);i++) nums.push(i);
  return `<div class="v79-pagination"><a class="v79-page-btn" href="#">이전</a>${nums.map(n=>`<a class="v79-page-btn ${n===current?'active':''}" href="#">${n}</a>`).join('')}${pages>6?'<span class="v79-page-btn">…</span>':''}<a class="v79-page-btn" href="#">다음</a></div>`;
}
function layout(title, desc, canonical, active, content) {
  return `${head(title, desc, canonical)}<body class="v79-rust-longform-body"><div class="v79-shell">${header(active)}<main class="v79-main">${content}</main></div>${mobileNav(active)}</body></html>`;
}
function hubPage(kind) {
  const isSports = kind === 'sports';
  const items = isSports ? sportsItems : guideItems;
  const pop = isSports ? popularSports : popularGuides;
  const title = isSports ? '스포츠 체크' : '검색 가이드';
  const desc = isSports ? 'RUST 스포츠 체크 허브는 경기 전 확인해야 하는 배당, 라인업, 총점, 핸디캡 판단 기준을 다크 대시보드형 카드로 정리합니다.' : 'RUST 검색 가이드는 공식주소, 가입코드, 롤링, 환전, 이벤트 조건을 빠르게 확인할 수 있는 실사용 정보 허브입니다.';
  const cards = items.slice(0,50).map((it, idx) => itemCard(it, idx+1)).join('');
  const content = `${rails(pop, title)}<section class="v79-article"><div class="v79-article-kicker">${isSports?'SPORTS CHECK INDEX':'SEARCH GUIDE INDEX'}</div><h1 class="v79-article-title">${title} 전체 자료</h1><p class="v79-article-lead">큰 타이틀 배너와 반복 안내 섹션을 제거하고, 실제로 클릭할 글과 도구만 먼저 보이도록 재구성했습니다. PC에서는 넓은 그리드로, 모바일에서는 가로 슬라이더와 콤팩트 카드로 확인할 수 있습니다.</p><div class="v79-rail">${cards}</div>${pagination(items.length)}</section>`;
  return layout(title, desc, isSports?'/sports-check/':'/search-guides/', isSports?'/tools/':'/blog/', content);
}
function longformSections(item, context) {
  const subject = item.title;
  const category = item.category;
  const paragraphs = [
    [`${subject}를 볼 때 가장 먼저 정리해야 하는 것은 단일 정보가 아니라 기준의 순서입니다. RUST는 ${category} 정보를 단순히 나열하지 않고, 실제 판단에 영향을 주는 항목을 주소·조건·수치·변동 흐름으로 분리합니다. 이렇게 분리해야 과장된 문구나 이벤트성 표현에 흔들리지 않고, 유저가 직접 확인 가능한 기준으로 접근할 수 있습니다. 특히 모바일에서 빠르게 읽는 상황에서는 핵심 정보가 흩어져 있으면 판단 시간이 늘어나므로, 본문은 결론부터 확인하고 세부 근거로 내려가는 구조를 사용합니다.`],
    [`${subject}의 핵심은 표면적인 제목보다 조건이 실제로 어떻게 적용되는지 보는 데 있습니다. 예를 들어 스포츠 체크에서는 경기 전 라인업, 배당 변동, 총점 흐름, 핸디캡 기준이 서로 연결됩니다. 검색 가이드에서는 공식 주소, 가입코드, 롤링 조건, 환전 기준, 상담 채널의 일치 여부가 함께 움직입니다. 한 항목만 맞는다고 안전하다고 단정하지 않고, 여러 기준이 같은 방향을 가리킬 때 신뢰도를 높이는 방식이 실사용에 적합합니다.`],
    [`RUST 기준에서는 정보의 출처를 한 번 더 나눕니다. 첫째는 유저가 직접 보는 화면 정보이고, 둘째는 상담 또는 공식 채널에서 확인되는 운영 정보이며, 셋째는 계산 도구로 검산 가능한 수치 정보입니다. ${subject} 역시 이 세 갈래로 나누면 훨씬 선명해집니다. 화면에 적힌 조건이 아무리 좋아 보여도 실제 적용 기준이 다르면 의미가 약하고, 상담 답변이 좋아 보여도 수치 계산상 불리하면 재확인이 필요합니다.`],
    [`모바일 사용자는 긴 글을 한 번에 읽지 않습니다. 그래서 본문은 긴 문단만 쌓지 않고, 중간중간 핵심 요약 박스와 소형 배너로 구간을 끊는 편이 좋습니다. ${subject} 페이지도 같은 원칙으로 구성했습니다. 각 구간은 독립적으로 읽혀야 하며, 위에서 읽던 사용자가 중간부터 다시 들어와도 현재 무엇을 확인하는 문단인지 이해할 수 있어야 합니다. 이것이 검색 유입과 체류시간을 동시에 높이는 구조입니다.`],
    [`판단 기준을 세울 때는 “좋다” 또는 “나쁘다” 같은 단어보다 조건의 범위가 중요합니다. 롤링은 몇 배인지, 보너스는 실수령 기준인지, 환전은 지연 시 어떤 증빙을 요구하는지, 스포츠 배당은 마진이 얼마나 녹아 있는지 같은 식으로 숫자와 행위 기준을 같이 봐야 합니다. ${subject}를 확인하는 목적도 결국 이 범위를 좁히는 데 있습니다. 범위가 명확하면 상담 전후의 의사결정 속도가 빨라집니다.`],
    [`검색 가이드형 글은 특히 같은 단어가 여러 의미로 쓰이는 상황을 방지해야 합니다. 입플, 첫충, 매충, 롤링, 페이백, 공식주소, 가입코드 같은 단어는 사이트마다 설명 방식이 다를 수 있습니다. 따라서 본문에서는 단어의 뜻을 먼저 고정하고, 그 다음 실제 적용 예시를 설명하는 순서를 사용합니다. ${subject} 역시 이 방식으로 읽으면 광고성 표현과 실사용 조건을 분리하기 쉽습니다.`],
    [`스포츠 체크형 글에서는 결과 예측보다 리스크 분류가 더 중요합니다. 배당이 낮다고 항상 안전한 것은 아니고, 배당이 높다고 무조건 위험한 것도 아닙니다. 중요한 것은 시장이 어떤 정보를 이미 반영했는지, 아직 반영되지 않은 변수는 무엇인지, 그리고 유저가 선택하는 시점의 조건이 이전과 달라졌는지입니다. ${subject}를 읽을 때도 승패 하나보다 기준이 바뀐 지점을 찾는 것이 우선입니다.`],
    [`최종적으로 이 페이지는 결정을 대신 내려주는 글이 아니라, 확인 순서를 압축해 주는 문서입니다. 유저는 본문에서 핵심 변수를 확인하고, 필요한 경우 도구 페이지에서 마진·기대값·롤링·보너스를 계산한 뒤, 공식 상담으로 주소와 코드 상태를 재확인하면 됩니다. ${subject}는 이 흐름 안에서 사용할 때 가장 가치가 큽니다. 한 번에 모든 답을 얻는 방식보다, 기준을 따라가며 오류 가능성을 줄이는 방식이 안정적입니다.`],
    [`실전에서는 같은 조건도 시간에 따라 다르게 해석될 수 있습니다. 오전에 확인한 주소가 저녁에 바뀔 수 있고, 이벤트 문구가 유지되어도 세부 지급 기준이 조정될 수 있으며, 경기 전 배당은 라인업 발표나 시장 반응에 따라 빠르게 재평가됩니다. ${subject}를 확인할 때는 스냅샷처럼 한 번 보는 것보다, 현재 시점의 기준과 이전 기준이 어떤 차이를 보이는지 함께 살피는 것이 좋습니다. 이 차이를 기록해 두면 나중에 문제가 생겼을 때 원인을 추적하기 쉽습니다.`],
    [`또 하나의 핵심은 불필요한 정보량을 줄이는 것입니다. 긴 안내문이 많다고 해서 좋은 페이지가 되는 것은 아닙니다. 오히려 유저가 실제로 필요한 것은 현재 판단에 영향을 주는 조건, 계산 가능한 수치, 공식 채널로 재확인할 수 있는 단서입니다. 그래서 RUST 페이지는 하단에 반복되던 안내 문구와 추천 링크 묶음을 걷어내고, 본문 안에 필요한 근거만 남기는 방향으로 정리했습니다. ${subject} 역시 같은 기준으로 재구성되었습니다.`],
    [`검색 유입 사용자는 대부분 특정 문제를 해결하려고 들어옵니다. ${subject}를 찾은 사용자는 이미 주소, 코드, 배당, 롤링, 정산, 조건 중 하나에서 의문을 가진 상태일 가능성이 큽니다. 이런 사용자는 장황한 브랜드 소개보다 바로 적용할 수 있는 기준을 원합니다. 따라서 첫 화면에는 인기 자료와 도구를 먼저 배치하고, 본문은 문제를 해결하는 순서로 설계했습니다. 이 구조는 SEO에도 유리하고 실제 체류 시간에도 도움이 됩니다.`],
    [`마지막으로, 판단 이후의 행동도 중요합니다. 정보를 확인했다면 그대로 끝내지 말고, 계산이 필요한 항목은 도구로 검산하고, 주소나 코드처럼 실시간성이 강한 항목은 공식 상담에서 재확인하는 편이 안전합니다. 다만 상담 연결 버튼이나 반복 안내문을 과하게 노출하면 콘텐츠 집중도가 떨어지므로, 본문 자체는 정보 중심으로 유지했습니다. ${subject}는 읽는 페이지이면서 동시에 다음 확인 행동으로 이어지는 기준표 역할을 하도록 설계했습니다.`],
  ];
  return paragraphs;
}
function articlePage(item, groupItems, active, contextName) {
  const contentParas = longformSections(item, contextName);
  const content = `${rails(groupItems, contextName)}<article class="v79-article"><div class="v79-article-kicker">${esc(item.category)} · RUST LONGFORM</div><h1 class="v79-article-title">${esc(item.title)}</h1><p class="v79-article-lead">${esc(item.desc)} 불필요한 반복 안내 영역을 제거하고, 실사용 기준·계산 관점·모바일 가독성을 중심으로 3,000자 이상 롱폼 콘텐츠로 다시 구성했습니다.</p><div class="v79-content"><div class="v79-summary-box"><b>핵심 요약</b><p>${esc(item.title)}는 단독 문구보다 조건, 수치, 공식 채널, 계산 결과를 함께 확인해야 정확도가 올라갑니다. 본문은 판단 순서와 확인 기준을 먼저 정리하고, 이후 실제 적용 방식을 단계적으로 설명합니다.</p></div>${contentParas.map((arr, idx) => `${idx===2||idx===5?`<div class="v79-mini-banner"><span>${idx+1}</span><b>${idx===2?'수치·조건·공식 채널을 같은 기준으로 묶어 읽는 구간입니다.':'모바일에서 빠르게 재확인할 수 있도록 판단 기준을 압축한 구간입니다.'}</b></div>`:''}<h2>${idx+1}. ${sectionTitle(idx, item)}</h2><p>${esc(arr[0])}</p>`).join('')}<div class="v79-summary-box"><b>RUST 적용 기준</b><p>이 문서는 광고 문구를 늘리는 대신 확인 기준을 길게 설명하는 방식으로 제작되었습니다. 페이지 하단의 불필요한 복사 폼, 반복 추천 섹션, 자동 안내 문구는 제거했으며, 필요한 경우 상단 도구 카드와 공식 상담 버튼만 활용하면 됩니다.</p></div></div></article>`;
  return layout(item.title, item.desc, item.href, active, content);
}
function sectionTitle(idx, item) {
  const arr = ['기준을 먼저 정리해야 하는 이유','조건을 분리해서 읽는 방법','출처와 수치를 함께 확인하는 구조','모바일 롱폼 가독성 설계','숫자 기준으로 범위를 좁히는 법','용어 혼선을 줄이는 방식','스포츠 변수와 시장 반영 차이','최종 확인 흐름','시간에 따라 달라지는 조건','불필요한 정보량을 줄이는 이유','검색 유입 사용자의 행동 흐름','확인 이후의 실전 행동'];
  return arr[idx] || item.title;
}

write('sports-check/index.html', hubPage('sports'));
write('search-guides/index.html', hubPage('guides'));
for (const it of sportsItems) write(it.rel, articlePage(it, popularSports, '/tools/', '스포츠 체크'));
for (const it of guideItems) write(it.rel, articlePage(it, popularGuides, '/blog/', '검색 가이드'));

const report = {
  version,
  generatedAt: new Date().toISOString(),
  sportsDetails: sportsItems.length,
  guideDetails: guideItems.length,
  removedLegacyPhrases: ['오늘 확인해야 할 것','상담 전 먼저 확인할 것','함께 확인할 글','다음 단계: 자동화 상담으로 기준 정보를 확인하거나','복사/생성 폼'],
  hubs: ['/sports-check/','/search-guides/'],
  tools: tools.map(t => t.name)
};
write('V79_RUST_LONGFORM_HUBS_REPORT.json', JSON.stringify(report, null, 2));
console.log(`[V79] RUST longform hubs generated. sports=${sportsItems.length} guides=${guideItems.length}`);

// Keep V79 as the final build/verify target after older generators mutate package.json.
const packagePath = path.join(root, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  const qualityCmd = 'node scripts/generate-v79-rust-longform-hubs.mjs';
  const verifyCmd = 'node scripts/verify-v79-rust-longform-hubs.mjs';
  if (!String(pkg.scripts.build || '').includes(qualityCmd)) {
    pkg.scripts.build = `${pkg.scripts.build} && ${qualityCmd}`;
  }
  pkg.scripts.verify = verifyCmd;
  pkg.scripts['quality:v79'] = qualityCmd;
  pkg.scripts['verify:v79'] = verifyCmd;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
}
