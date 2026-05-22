#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://88st.cloud';
const VERSION = 'static-growth-conversion-v51-20260522';
const BOT = '@TRS999_bot';
const BOT_URL = 'https://t.me/TRS999_bot?start=guaranteed_vendor';

const vendors = [
  {
    slug: 'queenbee',
    name: '여왕벌',
    label: 'QUEENBEE',
    img: '/assets/provider-media/queenbee-logo-clean-v22.png',
    domain: 'qb-700.com',
    href: 'https://qb-700.com/?code=seoa',
    code: 'seoa',
    summary: '신규 첫 충전, 미니게임 첫 충전, 무한 매충, USDT 충전 보조 혜택을 한 화면에서 확인하는 여왕벌 전용 안내입니다.',
    highlights: ['신규 가입 첫 충전 50%', '신규 가입 첫 미니게임 20%', '무한 매충 10%', 'USDT 충전 시 프리미엄 룰렛 쿠폰', '테더 가스비 수수료 지원', '테더 카지노·슬롯 콤프 지급'],
    eventGroups: [
      {title:'신규 회원 이벤트', items:['첫 충전 50% 조건 확인', '첫 미니게임 20% 조건 확인', '무한 매충 10% 적용 범위 확인']},
      {title:'USDT 가입 이벤트', items:['1일 1회 테더 충전 시 프리미엄 룰렛 쿠폰 지급', '당일 페이백·주간 페이백 확인', '테더 가스비 수수료 지원 범위 확인', '테더 카지노·슬롯 콤프 지급 기준 확인']},
      {title:'운영 메모', items:['미니게임 무제재 환경을 강조하는 업체 메모가 포함됨', '코드 입력 후 이벤트 적용 여부는 접속 전 공지 기준으로 재확인 권장']}
    ],
    tags: ['#여왕벌토토','#여왕벌입플','#여왕벌정사이트','#여왕벌무사고','#안전한토토사이트','#입플사이트추천','#토토입플사이트','#미니게임무제재','#무한첫충사이트','#신규50프로입플','#미겜첫충20','#여왕벌먹튀검증']
  },
  {
    slug: 'sk-holdings',
    name: 'SK 홀딩스',
    label: 'SK HOLDINGS',
    img: '/assets/provider-media/sk-holdings-logo.png',
    domain: 'snk-99.com',
    href: 'https://snk-99.com/',
    code: 'IRON888',
    summary: '입금 플러스, 첫충·매충, 스포츠·카지노·슬롯·미니게임 이벤트를 구분해 확인할 수 있는 SK 홀딩스 전용 안내입니다.',
    highlights: ['입금 플러스 3+2부터 200+50 외 30%', '스포츠 첫 10% / 매 5%', '미니게임 첫 10% / 매 5%', '슬롯 첫 20% / 매 10%', 'VIP 100만 이상 충전 시 5% 추가', '당일 환전 5회 달성 시 룰렛 쿠폰 5장'],
    eventGroups: [
      {title:'신규 입금 플러스', items:['3+2, 5+3, 10+5, 20+7, 30+10, 50+20, 100+35, 200+50 외 30%', '스포츠·카지노·슬롯·미니게임 입금 플러스 이용 가능']},
      {title:'첫충전 및 매충전', items:['스포츠 첫 10% / 매 5%', '미니게임 첫 10% / 매 5%', '슬롯 첫 20% / 매 10%', 'VIP 단일 1,000,000원 이상 충전 시 5% 추가 지급']},
      {title:'이벤트 목록', items:['월요일 입금플러스', '주간 페이백', '출석체크', '출근길·심야 이벤트', '지인추천', '누적 충전', '스포츠 전용 이벤트', '복귀 회원 이벤트']}
    ],
    tags: ['#SK홀딩스토토','#SK홀딩스입플','#SK홀딩스주소','#안전한토토사이트','#입플사이트추천','#토토입플','#메이저입플사이트','#신규첫30프로','#매첫충10프로','#매충5프로','#토토안전놀이터','#실시간입플']
  },
  {
    slug: 'anybet',
    name: 'ANYBET',
    label: 'ANYBET',
    img: '/assets/provider-media/anybet-logo.png',
    domain: 'any-777.com',
    href: 'https://any-777.com/',
    code: 'seoa',
    summary: '원화 가입 혜택과 테더 무기명 가입 혜택, 주간 페이백·롤링·컴프 이벤트를 구분해 정리한 ANYBET 전용 안내입니다.',
    highlights: ['원화 신규 스포츠 첫 충전 40%', '원화 신규 슬롯 첫 충전 20%', '테더 첫 코인 충전 50%', '코인 입금 수수료 전액 지원', '주간 페이백 5%', '롤링·컴프·출석 체크 이벤트'],
    eventGroups: [
      {title:'원화 가입 혜택', items:['신규 회원 스포츠 첫 충전 시 40% 추가 증정', '신규 회원 슬롯 첫 충전 시 20% 추가 증정']},
      {title:'테더 가입 혜택', items:['코인 입금 시 수수료 전액 지원', '첫 코인 충전 시 50% 추가 증정']},
      {title:'회원 서비스', items:['모든 게임에서 충전 보너스 제공', '주간 페이백 5% 지급', '롤링 및 컴프 이벤트 운영', '출석 체크 포함 8개 이벤트 예정']}
    ],
    tags: ['#에니벳토토','#에니벳테더','#에니벳페이백','#안전한테더사이트','#테더입출사이트','#테더가입토토','#입플사이트추천','#토토입플사이트','#usdt토토사이트','#테더첫충50','#원화첫충40','#페이백사이트추천']
  },
  {
    slug: 'udt',
    name: 'UDT',
    label: 'UDT',
    img: '/assets/provider-media/udt-logo-transparent-v14.png',
    domain: '특공대.COM',
    href: 'https://특공대.com',
    code: 'SEOA',
    summary: '스포츠 첫충, 슬롯 매충, 파워볼·사다리·동행류 미니게임 목록과 이벤트를 정리한 UDT 전용 안내입니다.',
    highlights: ['스포츠 첫충 10%', '슬롯 매충 20%', '보글 파워볼·보글 사다리 지원', 'EOS5분·PBG 파워볼 지원', '동행 파워볼·키노 사다리 지원', '실시간 연승·연패 이벤트'],
    eventGroups: [
      {title:'충전 혜택', items:['스포츠 첫충 10%', '슬롯 매충 20%']},
      {title:'미니게임 목록', items:['보글 파워볼', '보글 사다리', 'EOS5분', 'PBG 파워볼', '동행 파워볼', '키노 사다리']},
      {title:'이벤트 목록', items:['실시간 연승/연패 이벤트', '주간 페이백', '출석 이벤트', '생일 축하 이벤트', '지인추천 이벤트']}
    ],
    tags: ['#UDT토토','#UDT미니게임','#UDT요율','#미니게임제재없는','#파워볼요율문의','#미겜맛집추천','#승부제재없는사이트','#안전한토토사이트','#토토입플사이트','#마틴루틴무제재','#고액배터추천','#미니게임페이백']
  },
  {
    slug: 'ddangkong',
    name: '땅콩',
    label: 'DDANGKONG',
    img: '/assets/provider-media/ddangkong-logo-v19.png',
    domain: 'ddk-2025.com',
    href: 'https://ddk-2025.com',
    code: 'ddk888',
    summary: '스포츠·미니게임 충전 포인트 선택, 카지노·슬롯 콤프, 룰렛 쿠폰, 지인추천 이벤트를 정리한 땅콩 전용 안내입니다.',
    highlights: ['스포츠·미니게임 10% 또는 5% 충전 포인트 선택', '신규 가입 즉시 카지노 1% 콤프', '신규 가입 즉시 슬롯 3% 콤프', '충전 금액 비례 룰렛 쿠폰', '지인 추천 이벤트 준비', '무기명 카지노·슬롯 중심 안내'],
    eventGroups: [
      {title:'충전 포인트', items:['스포츠·미니게임에 한해 10% 또는 5% 충전 포인트 선택 가능']},
      {title:'콤프 설정', items:['신규가입 즉시 카지노 1% 콤프 설정', '신규가입 즉시 슬롯 3% 콤프 설정']},
      {title:'부가 이벤트', items:['충전 금액 비례 룰렛 쿠폰 지급', '지인 추천 이벤트 준비']}
    ],
    tags: ['#땅콩카지노','#땅콩슬롯','#무기명토토사이트','#무기명카지노가입','#슬롯콤프많이주는곳','#카지노콤프추천','#슬롯맛집사이트','#안전한카지노사이트','#슬롯3프로콤프','#카지노1프로콤프','#무기명안전주소','#프라그마틱슬롯추천']
  }
];

function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function write(p, s){ ensureDir(path.dirname(p)); fs.writeFileSync(p, s, 'utf8'); }
function read(p){ return fs.existsSync(p) ? fs.readFileSync(p,'utf8') : ''; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function attr(s){ return esc(s); }
function strip(s){ return String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function routeToFile(route){ return route === '/' ? path.join(ROOT,'index.html') : route.endsWith('/') ? path.join(ROOT, route.slice(1), 'index.html') : path.join(ROOT, route.slice(1)); }
function header(active='guaranteed'){
  const nav=[['/','메인','home'],['/blog/','블로그','blog'],['/tools/','도구','tools'],['/guaranteed/','보증업체','guaranteed'],['/consult/','고객센터','consult']];
  return `<header class="moon-header v39-header v49-header"><div class="moon-container moon-header__inner v39-header__inner"><a aria-label="88ST.Cloud 홈" class="moon-brand v39-brand" href="/"><img alt="88ST.Cloud" decoding="async" fetchpriority="high" height="66" loading="eager" src="/img/logo-v24.png" width="260"/></a><nav aria-label="주요 메뉴" class="moon-nav v39-nav">${nav.map(([href,label,key])=>`<a${key===active?' class="is-active"':''} href="${href}">${label}</a>`).join('')}</nav></div></header>`;
}
function footer(){ return `<footer class="moon-footer"><div class="moon-container moon-footer__grid"><div><strong>88ST.Cloud</strong><p>보증업체별 공식 도메인, 가입코드, 이벤트 기준을 정리합니다.</p></div><div><span>상담센터</span><p>공통 확인 기준은 <a href="${BOT_URL}" target="_blank" rel="nofollow noopener noreferrer">${BOT}</a> 입니다.</p></div><div><span>업데이트</span><p>이벤트와 조건은 업체 공지 기준으로 달라질 수 있습니다.</p></div></div></footer>`; }
function head({title, desc, route, image='/img/logo-v24.png', type='website'}){
  const url = DOMAIN + route;
  const graph = {"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${DOMAIN}/#organization`,"name":"88ST.Cloud","url":`${DOMAIN}/`,"logo":`${DOMAIN}/img/logo-v24.png`},{"@type":"WebSite","@id":`${DOMAIN}/#website`,"url":`${DOMAIN}/`,"name":"88ST.Cloud","publisher":{"@id":`${DOMAIN}/#organization`}},{"@type":"WebPage","@id":`${url.replace(/\/$/,'')}/#webpage`,"url":url,"name":title,"description":desc,"isPartOf":{"@id":`${DOMAIN}/#website`},"inLanguage":"ko-KR"}]};
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${esc(title)} | 88ST.Cloud</title><meta name="description" content="${esc(desc)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><meta name="theme-color" content="#03070d"/><link rel="canonical" href="${url}"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/img/logo-v24.png"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/pro.blog.v1.20260504.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><meta property="og:type" content="${type}"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:url" content="${url}"/><meta property="og:image" content="${DOMAIN}${image}"/><script type="application/ld+json" data-v36-schema="primary">${JSON.stringify(graph)}</script></head>`;
}

function vendorCard(v){
  return `<article class="premium-card v47-guaranteed-card v48-guaranteed-card v49-guaranteed-card" data-v49-provider="${attr(v.name)}"><a class="vendor-hero v48-vendor-hero v49-vendor-hero" href="/guaranteed/${v.slug}/" aria-label="${attr(v.name)} 상세보기"><img src="${v.img}" alt="${attr(v.name)} 로고" loading="lazy" decoding="async" width="640" height="240" onerror="this.closest('.premium-card').classList.add('is-logo-missing')"/></a><div class="card-body v49-card-body"><div class="v49-card-title-row"><span>${esc(v.label)}</span><h2 class="vendor-title">${esc(v.name)}</h2></div><div class="info-row"><span class="info-label">공식 도메인</span><a class="domain-link" href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v49-domain-click="${attr(v.slug)}">${esc(v.domain)} ↗</a></div><div class="info-row"><span class="info-label">가입코드</span><button type="button" class="code-badge" data-v47-copy-code="${attr(v.code)}" data-v49-copy-code="${attr(v.slug)}" aria-label="${attr(v.name)} 가입코드 복사">${esc(v.code)}</button></div><div class="v49-card-actions"><a class="detail-btn" href="/guaranteed/${v.slug}/" data-v49-detail-click="${attr(v.slug)}">상세보기</a><a class="action-btn" href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v49-domain-click="${attr(v.slug)}">바로가기</a></div></div></article>`;
}

function renderIndex(){
  const title = 'RUST 에이전시 보증 업체';
  const desc = '여왕벌, SK 홀딩스, ANYBET, UDT, 땅콩의 공식 도메인, 가입코드, 상세 안내를 카드형으로 정리한 보증업체 허브입니다.';
  const cards = vendors.map(vendorCard).join('\n');
  const body = `<body class="moon-page moon-guaranteed v47-guaranteed-page v48-guaranteed-page v49-guaranteed-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('guaranteed')}<main class="moon-shell" id="mainContent"><section class="moon-container v47-guaranteed-hero v48-guaranteed-hero v49-guaranteed-hero"><span>RUST GUARANTEED</span><h1>${title}</h1><p>카드는 간결하게 유지하고, 혜택·이벤트·조건은 업체별 상세 페이지에서 확인하도록 분리했습니다.</p></section><section class="moon-container guarantee-container v48-guarantee-container v49-guarantee-container" aria-label="RUST 에이전시 보증 업체 카드">${cards}</section></main>${footer()}<script defer src="/assets/js/v49.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/v47.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
  write(path.join(ROOT,'guaranteed/index.html'), head({title,desc,route:'/guaranteed/',image:'/img/logo-v24.png'}) + body);
}

function eventBlock(group){
  return `<section class="v49-vendor-section"><h2>${esc(group.title)}</h2><ul>${group.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
}
function renderVendor(v, idx){
  const route = `/guaranteed/${v.slug}/`;
  const title = `${v.name} 이벤트 혜택 및 공식 도메인 안내`;
  const desc = `${v.name} 공식 도메인 ${v.domain}, 가입코드 ${v.code}, 이벤트 혜택과 조건표를 한 페이지에서 확인할 수 있는 상세 안내입니다.`;
  const siblingLinks = vendors.filter(x=>x.slug!==v.slug).map(x=>`<a href="/guaranteed/${x.slug}/">${esc(x.name)}</a>`).join('');
  const html = head({title,desc,route,image:v.img}) + `<body class="moon-page moon-guaranteed v49-vendor-detail"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('guaranteed')}<main class="moon-shell" id="mainContent"><section class="moon-container v49-vendor-landing"><div class="v49-vendor-landing__hero"><div class="v49-vendor-visual"><img src="${v.img}" alt="${esc(v.name)} 대표 이미지" loading="eager" decoding="async" width="960" height="360"/></div><div class="v49-vendor-summary"><span>${esc(v.label)} GUARANTEED DETAIL</span><h1>${esc(v.name)} 이벤트 혜택 및 공식 도메인 안내</h1><p>${esc(v.summary)}</p><div class="v49-vendor-actions"><a class="detail-btn" href="/guaranteed/">전체 카드 보기</a><a class="action-btn" href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v49-domain-click="${attr(v.slug)}">공식 도메인 바로가기</a></div></div></div><section class="v49-fact-grid" aria-label="${esc(v.name)} 핵심 정보"><div><span>공식 도메인</span><a href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer">${esc(v.domain)}</a></div><div><span>가입코드</span><button type="button" class="code-badge" data-v47-copy-code="${attr(v.code)}" data-v49-copy-code="${attr(v.slug)}">${esc(v.code)}</button></div><div><span>업데이트 기준</span><strong>업체 메모 기준 V49</strong></div></section><section class="v49-vendor-section"><h2>${esc(v.name)} 핵심 혜택 요약</h2><div class="v49-benefit-list">${v.highlights.map((x,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span>${esc(x)}</span></div>`).join('')}</div></section>${v.eventGroups.map(eventBlock).join('')}<section class="v49-vendor-section"><h2>조건 확인표</h2><div class="v49-table-wrap"><table><thead><tr><th>구분</th><th>확인 항목</th><th>운영 메모</th></tr></thead><tbody><tr><td>도메인</td><td>${esc(v.domain)}</td><td>주소 변경 가능성이 있으므로 접속 전 최신 카드 기준을 우선 확인합니다.</td></tr><tr><td>가입코드</td><td>${esc(v.code)}</td><td>코드는 대소문자 표기가 다를 수 있어 카드의 복사 버튼 기준으로 사용합니다.</td></tr><tr><td>이벤트</td><td>충전·페이백·콤프·룰렛 쿠폰 등</td><td>이벤트는 게임 카테고리, 충전 수단, 레벨, 회차 기준에 따라 달라질 수 있습니다.</td></tr><tr><td>출금/롤링</td><td>조건표와 제외 게임 확인</td><td>혜택 적용 시 출금 가능 조건과 제외 게임 목록을 먼저 비교합니다.</td></tr></tbody></table></div></section><section class="v49-vendor-section"><h2>#태그 메모</h2><div class="v49-tag-cloud">${v.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div></section><section class="v49-vendor-contact"><h2>공통 확인 채널</h2><p>상세 조건이 바뀌었거나 최신 공지 확인이 필요한 경우 공통 상담 기준은 <a href="${BOT_URL}" target="_blank" rel="nofollow noopener noreferrer">${BOT}</a> 입니다.</p><a class="action-btn" href="${BOT_URL}" target="_blank" rel="nofollow noopener noreferrer">상담센터 연결</a></section><section class="v49-vendor-neighbors"><h2>다른 보증업체 상세보기</h2><div>${siblingLinks}</div></section></section></main>${footer()}<script defer src="/assets/js/v49.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/v47.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
  write(path.join(ROOT,'guaranteed',v.slug,'index.html'), html);
}
function updateAssets(){
  const cssPath = path.join(ROOT,'assets/css/growth-conversion.v36.css');
  let css = read(cssPath).replace(/\/\* V49 GUARANTEED LANDINGS START \*\/[\s\S]*?\/\* V49 GUARANTEED LANDINGS END \*\//g,'');
  css += `\n/* V49 GUARANTEED LANDINGS START */\n.v49-guaranteed-page,.v49-vendor-detail{background:radial-gradient(circle at 12% -8%,rgba(99,102,241,.16),transparent 34%),radial-gradient(circle at 88% 0,rgba(16,185,129,.12),transparent 30%),linear-gradient(180deg,#03070d,#07101c 44%,#03070d)!important;color:#e7eefb!important}.v49-guaranteed-hero{padding:28px 0 12px!important}.v49-guaranteed-hero p{max-width:760px;margin:10px 0 0;color:rgba(231,238,251,.72);line-height:1.65}.v49-guarantee-container{align-items:stretch}.v49-guaranteed-card{display:flex!important;flex-direction:column;min-height:100%;border-radius:24px!important;background:linear-gradient(180deg,rgba(25,28,41,.82),rgba(9,13,25,.94))!important}.v49-vendor-hero{aspect-ratio:16/7!important;background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(99,102,241,.08))!important}.v49-vendor-hero img{object-fit:contain!important;padding:20px!important}.v49-card-body{display:grid;gap:12px;position:relative;z-index:1;padding:20px!important;flex:1}.v49-card-title-row span{display:block;color:#8bd5ff;font-size:11px;font-weight:950;letter-spacing:.15em}.v49-card-title-row .vendor-title{margin:4px 0 0!important;color:#fff4df!important}.v49-card-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}.detail-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(14,165,233,.10);color:#dff6ff!important;text-decoration:none;font-weight:900}.v49-card-actions .action-btn{margin-top:0!important;min-height:44px;display:inline-flex!important;align-items:center;justify-content:center}.v49-vendor-landing{padding:clamp(22px,5vw,54px) 0 64px}.v49-vendor-landing__hero{display:grid;grid-template-columns:minmax(260px,.95fr) minmax(280px,1.05fr);gap:24px;align-items:center;margin-bottom:20px}.v49-vendor-visual{border:1px solid rgba(215,228,255,.14);border-radius:28px;overflow:hidden;background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(99,102,241,.10));box-shadow:0 24px 80px rgba(0,0,0,.32)}.v49-vendor-visual img{width:100%;aspect-ratio:16/7;object-fit:contain;padding:30px;filter:drop-shadow(0 22px 34px rgba(0,0,0,.42))}.v49-vendor-summary span{display:block;color:#8bd5ff;font-size:12px;font-weight:950;letter-spacing:.16em}.v49-vendor-summary h1{margin:8px 0 12px;color:#fff4df;font-size:clamp(32px,5vw,58px);line-height:1.06;letter-spacing:-.05em}.v49-vendor-summary p{color:rgba(231,238,251,.78);line-height:1.72}.v49-vendor-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.v49-vendor-actions .action-btn,.v49-vendor-actions .detail-btn{width:auto;padding:0 18px}.v49-fact-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0}.v49-fact-grid>div{padding:16px;border:1px solid rgba(215,228,255,.14);border-radius:18px;background:rgba(255,255,255,.06)}.v49-fact-grid span{display:block;color:#94a3b8;font-size:12px;font-weight:900;margin-bottom:8px}.v49-fact-grid a,.v49-fact-grid strong{color:#e7f7ff}.v49-vendor-section,.v49-vendor-contact,.v49-vendor-neighbors{margin-top:18px;padding:clamp(18px,3vw,26px);border:1px solid rgba(215,228,255,.14);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));box-shadow:0 18px 60px rgba(0,0,0,.18)}.v49-vendor-section h2,.v49-vendor-contact h2,.v49-vendor-neighbors h2{margin:0 0 12px;color:#fff4df;letter-spacing:-.025em}.v49-vendor-section p,.v49-vendor-contact p,.v49-vendor-section li{color:#dbe5f1;line-height:1.72}.v49-vendor-section ul{margin:0;padding-left:20px}.v49-benefit-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.v49-benefit-list div{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:16px;background:rgba(2,6,23,.34);border:1px solid rgba(215,228,255,.10)}.v49-benefit-list b{color:#8bd5ff}.v49-benefit-list span{color:#e7eefb}.v49-table-wrap{overflow-x:auto}.v49-table-wrap table{width:100%;min-width:720px;border-collapse:collapse}.v49-table-wrap th,.v49-table-wrap td{padding:13px 14px;border-bottom:1px solid rgba(215,228,255,.12);text-align:left;color:#dbe5f1}.v49-table-wrap th{color:#fff4df;background:rgba(245,215,139,.08)}.v49-tag-cloud{display:flex;gap:8px;flex-wrap:wrap}.v49-tag-cloud span{padding:8px 10px;border:1px solid rgba(125,211,252,.16);border-radius:999px;background:rgba(14,165,233,.08);color:#dff6ff;font-size:13px;font-weight:800}.v49-vendor-contact a{color:#8bd5ff}.v49-vendor-contact .action-btn{max-width:260px}.v49-vendor-neighbors div{display:flex;gap:8px;flex-wrap:wrap}.v49-vendor-neighbors a{padding:9px 11px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(215,228,255,.12);color:#dbe5f1;text-decoration:none;font-weight:850}.v49-copy-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:#111827;color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:999px;padding:12px 16px;box-shadow:0 14px 50px rgba(0,0,0,.32)}@media(max-width:820px){.v49-vendor-landing__hero{grid-template-columns:1fr}.v49-fact-grid{grid-template-columns:1fr}.v49-card-actions{grid-template-columns:1fr}.v49-vendor-actions .action-btn,.v49-vendor-actions .detail-btn{width:100%}}\n/* V49 GUARANTEED LANDINGS END */\n`;
  write(cssPath, css);
  write(path.join(ROOT,'assets/js/v49.guaranteed.js'), `document.addEventListener('click',async(e)=>{const copy=e.target.closest('[data-v49-copy-code]');if(copy){const code=copy.getAttribute('data-v47-copy-code')||copy.textContent.trim();try{await navigator.clipboard.writeText(code)}catch(_){const t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}document.querySelectorAll('.v49-copy-toast').forEach(x=>x.remove());const toast=document.createElement('div');toast.className='v49-copy-toast';toast.textContent='가입코드가 복사되었습니다';document.body.appendChild(toast);setTimeout(()=>toast.remove(),1600);window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'guaranteed_code_copy',provider:copy.getAttribute('data-v49-copy-code')||''});}const domain=e.target.closest('[data-v49-domain-click]');if(domain){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'guaranteed_domain_click',provider:domain.getAttribute('data-v49-domain-click')||''});}const detail=e.target.closest('[data-v49-detail-click]');if(detail){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'guaranteed_detail_click',provider:detail.getAttribute('data-v49-detail-click')||''});}});\n`);
  write(path.join(ROOT,'assets/data/v49.guaranteed.vendors.json'), JSON.stringify({version:'V49',generatedAt:new Date().toISOString(),consultBot:BOT,vendors:vendors.map(v=>({slug:v.slug,name:v.name,domain:v.domain,code:v.code,image:v.img,route:`/guaranteed/${v.slug}/`,tags:v.tags}))}, null, 2));
}
function updateSitemaps(){
  const htmls = [];
  function walk(dir){
    for (const name of fs.readdirSync(dir)) {
      if (['node_modules','.git','__MACOSX'].includes(name)) continue;
      const p = path.join(dir,name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p); else if (p.endsWith('.html')) htmls.push(p);
    }
  }
  walk(ROOT);
  const routes = [];
  for (const f of htmls) {
    const rel = path.relative(ROOT,f).replaceAll(path.sep,'/');
    const txt = read(f);
    if (/noindex/i.test(txt)) continue;
    let route = '/' + rel;
    if (route === '/index.html') route = '/';
    else if (route.endsWith('/index.html')) route = route.slice(0,-10);
    if (!routes.includes(route)) routes.push(route);
  }
  routes.sort((a,b)=> a==='/'?-1:b==='/'?1:a.localeCompare(b));
  const today = new Date().toISOString().slice(0,10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${DOMAIN}${r}</loc><lastmod>${today}</lastmod><changefreq>${r==='/'?'daily':'weekly'}</changefreq><priority>${r==='/'?'1.00':r.startsWith('/guaranteed/')?'0.88':r==='/blog/'?'0.90':'0.70'}</priority></url>`).join('\n')}\n</urlset>\n`;
  write(path.join(ROOT,'sitemap.xml'), xml);
  write(path.join(ROOT,'sitemap.txt'), routes.map(r=>DOMAIN+r).join('\n')+'\n');
  ensureDir(path.join(ROOT,'serverless'));
  write(path.join(ROOT,'serverless/sitemap.xml'), xml);
  write(path.join(ROOT,'serverless/sitemap.txt'), routes.map(r=>DOMAIN+r).join('\n')+'\n');
  write(path.join(ROOT,'assets/data/indexing.priority.v49.json'), JSON.stringify({version:'V49',generatedAt:new Date().toISOString(),priority:['/','/guaranteed/','/guaranteed/queenbee/','/guaranteed/sk-holdings/','/guaranteed/anybet/','/guaranteed/udt/','/guaranteed/ddangkong/','/blog/','/tools/','/consult/'].map((route,i)=>({rank:i+1,url:DOMAIN+route}))}, null, 2));
}
function updatePackageVersionReferences(){
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts.build = 'node scripts/generate-brand-pages.mjs && node scripts/seo-intelligence-v36.mjs && node scripts/generate-v47-comprehensive-upgrade.mjs && node scripts/generate-v48-content-dedupe-visual-stability.mjs && node scripts/generate-v49-guaranteed-vendor-landings.mjs && node scripts/generate-v50-guaranteed-tools-upgrade.mjs && node scripts/generate-v51-user-facing-tools.mjs && node scripts/generate-v43-quality-data.mjs && node scripts/gen-build-ver.mjs';
  pkg.scripts['quality:v49'] = 'node scripts/generate-v49-guaranteed-vendor-landings.mjs';
  write(pkgPath, JSON.stringify(pkg,null,2)+'\n');
  const gen = path.join(ROOT,'scripts/gen-build-ver.mjs');
  if (fs.existsSync(gen)) write(gen, read(gen).replace(/static-growth-conversion-v\d+-/g,'static-growth-conversion-v50-'));
}

renderIndex();
vendors.forEach(renderVendor);
updateAssets();
updateSitemaps();
updatePackageVersionReferences();
console.log(`V49 guaranteed vendor landings generated: ${vendors.length} detail pages`);
