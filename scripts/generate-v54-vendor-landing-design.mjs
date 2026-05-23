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
    img: '/assets/vendor-logos/v59/queenbee-card.svg',
    domain: 'qb-700.com',
    href: 'https://qb-700.com/?code=seoa',
    code: 'seoa',
    tone: '신규 첫 충전, 미니게임 첫 충전, 매충, USDT 충전 보조 혜택을 한 페이지에서 정리한 여왕벌 전용 보증업체 안내입니다.',
    bullets: ['신규 가입 첫 충전 50%', '신규 가입 첫 미니게임 20%', '무한 매충 10%', 'USDT 충전 시 프리미엄 룰렛 쿠폰', '테더 가스비 수수료 지원', '테더 카지노·슬롯 콤프 지급'],
    sections: [
      ['신규 회원 이벤트', ['첫 충전 50% 조건 확인', '첫 미니게임 20% 조건 확인', '무한 매충 10% 적용 범위 확인']],
      ['USDT 가입 이벤트', ['1일 1회 테더 충전 시 프리미엄 룰렛 쿠폰 지급', '당일 페이백·주간 페이백 확인', '테더 가스비 수수료 지원 범위 확인', '테더 카지노·슬롯 콤프 지급 기준 확인']],
      ['운영 메모', ['미니게임 무제재 환경을 강조하는 업체 메모가 포함됨', '코드 입력 후 이벤트 적용 여부는 접속 전 공지 기준으로 재확인 권장']]
    ],
    tags: ['#여왕벌토토','#여왕벌입플','#여왕벌정사이트','#여왕벌무사고','#안전한토토사이트','#입플사이트추천','#토토입플사이트','#미니게임무제재','#무한첫충사이트','#신규50프로입플','#미겜첫충20','#여왕벌먹튀검증']
  },
  {
    slug: 'sk-holdings',
    name: 'SK 홀딩스',
    label: 'SK HOLDINGS',
    img: '/assets/vendor-logos/v59/sk-holdings-card.svg',
    domain: 'snk-99.com',
    href: 'https://snk-99.com/',
    code: 'IRON888',
    tone: '입금 플러스, 첫충·매충, 스포츠·카지노·슬롯·미니게임 이벤트를 구분해 확인할 수 있는 SK 홀딩스 전용 보증업체 안내입니다.',
    bullets: ['입금 플러스 3+2부터 200+50 외 30%', '스포츠 첫 10% / 매 5%', '미니게임 첫 10% / 매 5%', '슬롯 첫 20% / 매 10%', 'VIP 100만 이상 충전 시 5% 추가', '당일 환전 5회 달성 시 룰렛 쿠폰 5장'],
    sections: [
      ['신규 입금 플러스', ['3+2, 5+3, 10+5, 20+7, 30+10, 50+20, 100+35, 200+50 외 30%', '스포츠·카지노·슬롯·미니게임 입금 플러스 이용 가능']],
      ['첫충전 및 매충전', ['스포츠 첫 10% / 매 5%', '미니게임 첫 10% / 매 5%', '슬롯 첫 20% / 매 10%', 'VIP 단일 1,000,000원 이상 충전 시 5% 추가 지급']],
      ['이벤트 목록', ['월요일 입금플러스', '주간 페이백', '출석체크', '출근길·심야 이벤트', '지인추천', '누적 충전', '스포츠 전용 이벤트', '복귀 회원 이벤트']]
    ],
    tags: ['#SK홀딩스토토','#SK홀딩스입플','#SK홀딩스주소','#안전한토토사이트','#입플사이트추천','#토토입플','#메이저입플사이트','#신규첫30프로','#매첫충10프로','#매충5프로','#토토안전놀이터','#실시간입플']
  },
  {
    slug: 'anybet',
    name: 'ANYBET',
    label: 'ANYBET',
    img: '/assets/vendor-logos/v59/anybet-card.svg',
    domain: 'any-777.com',
    href: 'https://any-777.com/',
    code: 'seoa',
    tone: '원화 가입 혜택과 테더 무기명 가입 혜택, 주간 페이백·롤링·컴프 이벤트를 구분해 정리한 ANYBET 전용 보증업체 안내입니다.',
    bullets: ['원화 신규 스포츠 첫 충전 40%', '원화 신규 슬롯 첫 충전 20%', '테더 첫 코인 충전 50%', '코인 입금 수수료 전액 지원', '주간 페이백 5%', '롤링·컴프·출석 체크 이벤트'],
    sections: [
      ['원화 가입 혜택', ['신규 회원 스포츠 첫 충전 시 40% 추가 증정', '신규 회원 슬롯 첫 충전 시 20% 추가 증정']],
      ['테더 가입 혜택', ['코인 입금 시 수수료 전액 지원', '첫 코인 충전 시 50% 추가 증정']],
      ['회원 서비스', ['모든 게임에서 충전 보너스 제공', '주간 페이백 5% 지급', '롤링 및 컴프 이벤트 운영', '출석 체크 포함 8개 이벤트 예정']]
    ],
    tags: ['#에니벳토토','#에니벳테더','#에니벳페이백','#안전한테더사이트','#테더입출사이트','#테더가입토토','#입플사이트추천','#토토입플사이트','#usdt토토사이트','#테더첫충50','#원화첫충40','#페이백사이트추천']
  },
  {
    slug: 'udt',
    name: 'UDT',
    label: 'UDT',
    img: '/assets/vendor-logos/v59/udt-card.svg',
    domain: '특공대.COM',
    href: 'https://특공대.com',
    code: 'SEOA',
    tone: '스포츠 첫충, 슬롯 매충, 파워볼·사다리·동행류 미니게임 목록과 이벤트를 정리한 UDT 전용 보증업체 안내입니다.',
    bullets: ['스포츠 첫충 10%', '슬롯 매충 20%', '보글 파워볼·보글 사다리 지원', 'EOS5분·PBG 파워볼 지원', '동행 파워볼·키노 사다리 지원', '실시간 연승·연패 이벤트'],
    sections: [
      ['충전 혜택', ['스포츠 첫충 10%', '슬롯 매충 20%']],
      ['미니게임 목록', ['보글 파워볼', '보글 사다리', 'EOS5분', 'PBG 파워볼', '동행 파워볼', '키노 사다리']],
      ['이벤트 목록', ['실시간 연승/연패 이벤트', '주간 페이백', '출석 이벤트', '생일 축하 이벤트', '지인추천 이벤트']]
    ],
    tags: ['#UDT토토','#UDT미니게임','#UDT요율','#미니게임제재없는','#파워볼요율문의','#미겜맛집추천','#승부제재없는사이트','#안전한토토사이트','#토토입플사이트','#마틴루틴무제재','#고액배터추천','#미니게임페이백']
  },
  {
    slug: 'ddangkong',
    name: '땅콩',
    label: 'DDANGKONG',
    img: '/assets/vendor-logos/v59/ddangkong-card.svg',
    domain: 'ddk-2025.com',
    href: 'https://ddk-2025.com',
    code: 'ddk888',
    tone: '스포츠·미니게임 충전 포인트 선택, 카지노·슬롯 콤프, 룰렛 쿠폰, 지인추천 이벤트를 정리한 땅콩 전용 보증업체 안내입니다.',
    bullets: ['스포츠·미니게임 10% 또는 5% 충전 포인트 선택', '신규 가입 즉시 카지노 1% 콤프', '신규 가입 즉시 슬롯 3% 콤프', '충전 금액 비례 룰렛 쿠폰', '지인 추천 이벤트 준비', '무기명 카지노·슬롯 중심 안내'],
    sections: [
      ['충전 포인트', ['스포츠·미니게임에 한해 10% 또는 5% 충전 포인트 선택 가능']],
      ['콤프 설정', ['신규가입 즉시 카지노 1% 콤프 설정', '신규가입 즉시 슬롯 3% 콤프 설정']],
      ['부가 이벤트', ['충전 금액 비례 룰렛 쿠폰 지급', '지인 추천 이벤트 준비']]
    ],
    tags: ['#땅콩카지노','#땅콩슬롯','#무기명토토사이트','#무기명카지노가입','#슬롯콤프많이주는곳','#카지노콤프추천','#슬롯맛집사이트','#안전한카지노사이트','#슬롯3프로콤프','#카지노1프로콤프','#무기명안전주소','#프라그마틱슬롯추천']
  }
];

function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function write(p,s){ ensureDir(path.dirname(p)); fs.writeFileSync(p,s,'utf8'); }
function read(p){ return fs.existsSync(p) ? fs.readFileSync(p,'utf8') : ''; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function attr(s){ return esc(s); }
function header(){
  return `<header class="moon-header v39-header v54-header"><div class="moon-container moon-header__inner v39-header__inner"><a aria-label="88ST.Cloud 홈" class="moon-brand v39-brand" href="/"><img alt="88ST.Cloud" decoding="async" fetchpriority="high" height="66" loading="eager" src="/img/logo-v24.png" width="260"/></a><nav aria-label="주요 메뉴" class="moon-nav v39-nav"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a class="is-active" href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></header>`;
}
function footer(){
  return `<footer class="moon-footer v54-footer"><div class="moon-container moon-footer__grid"><div><strong>88ST.Cloud</strong><p>보증업체별 공식 도메인, 가입코드, 이벤트 기준을 정리합니다.</p></div><div><span>상담센터</span><p>공통 확인 기준은 <a href="${BOT_URL}" target="_blank" rel="nofollow noopener noreferrer">${BOT}</a> 입니다.</p></div><div><span>업데이트</span><p>이벤트와 조건은 업체 공지 기준으로 달라질 수 있습니다.</p></div></div></footer>`;
}
function head(v){
  const title = `${v.name} 보증업체 이벤트 혜택 안내`;
  const desc = `${v.name} 공식 도메인 ${v.domain}, 가입코드 ${v.code}, 이벤트 혜택과 조건표를 보기 좋게 정리한 보증업체 상세 랜딩입니다.`;
  const route = `/guaranteed/${v.slug}/`;
  const url = DOMAIN + route;
  const schema = {"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${DOMAIN}/#organization`,"name":"88ST.Cloud","url":`${DOMAIN}/`,"logo":`${DOMAIN}/img/logo-v24.png`},{"@type":"WebSite","@id":`${DOMAIN}/#website`,"url":`${DOMAIN}/`,"name":"88ST.Cloud","publisher":{"@id":`${DOMAIN}/#organization`}},{"@type":"WebPage","@id":`${url.replace(/\/$/,'')}/#webpage`,"url":url,"name":title,"description":desc,"isPartOf":{"@id":`${DOMAIN}/#website`},"inLanguage":"ko-KR"}]};
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${esc(title)} | 88ST.Cloud</title><meta name="description" content="${esc(desc)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><meta name="theme-color" content="#03070d"/><link rel="canonical" href="${url}"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/img/logo-v24.png"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/pro.blog.v1.20260504.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><link rel="stylesheet" href="/assets/css/v54.vendor-landing.css?v=${VERSION}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:url" content="${url}"/><meta property="og:image" content="${DOMAIN}${v.img}"/><script type="application/ld+json" data-v36-schema="primary">${JSON.stringify(schema)}</script></head>`;
}
function summaryCards(v){
  return `<section class="v54-fact-strip" aria-label="${attr(v.name)} 핵심 정보"><a class="v54-fact" href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer"><span>공식 도메인</span><strong>${esc(v.domain)}</strong></a><button type="button" class="v54-fact v54-code-copy" data-v54-copy-code="${attr(v.code)}" data-v54-provider="${attr(v.slug)}"><span>가입코드</span><strong>${esc(v.code)}</strong></button><div class="v54-fact"><span>페이지 기준</span><strong>V54 디자인 보강</strong></div></section>`;
}
function render(v){
  const others = vendors.filter(x=>x.slug!==v.slug).map(x=>`<a href="/guaranteed/${x.slug}/">${esc(x.name)}</a>`).join('');
  const benefits = v.bullets.map((b,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b><span>${esc(b)}</span></li>`).join('');
  const sections = v.sections.map(([title,items])=>`<article class="v54-info-card"><h2>${esc(title)}</h2><ul>${items.map(it=>`<li>${esc(it)}</li>`).join('')}</ul></article>`).join('');
  const tableRows = [
    ['공식 도메인', v.domain, '카드와 상세 랜딩에 표기된 도메인 기준으로 확인합니다.'],
    ['가입코드', v.code, '코드 표기는 대소문자까지 그대로 복사해 사용하는 흐름을 권장합니다.'],
    ['이벤트 범위', '충전·페이백·콤프·쿠폰 등', '게임 카테고리, 충전 수단, 회원 등급, 회차 기준에 따라 달라질 수 있습니다.'],
    ['조건 확인', '롤링·제외 게임·최대 한도', '혜택 적용 전 조건표와 제외 항목을 먼저 비교합니다.']
  ].map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('');
  const tags = v.tags.map(t=>`<span>${esc(t)}</span>`).join('');
  return `${head(v)}<body class="moon-page moon-guaranteed v49-vendor-detail v54-vendor-detail"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header()}<main id="mainContent" class="v54-vendor-shell"><section class="moon-container v49-vendor-landing v54-vendor-page"><nav class="v54-breadcrumb" aria-label="현재 위치"><a href="/guaranteed/">보증업체</a><span>/</span><strong>${esc(v.name)}</strong></nav><section class="v54-hero-card"><div class="v54-visual-card"><img src="${v.img}" alt="${attr(v.name)} 대표 이미지" loading="eager" decoding="async" width="960" height="360"/></div><div class="v54-hero-copy"><span class="v54-eyebrow">${esc(v.label)} GUARANTEED</span><h1>${esc(v.name)} 보증업체 혜택 안내</h1><p>${esc(v.tone)}</p><div class="v54-hero-actions"><a class="v54-btn v54-btn-ghost" href="/guaranteed/">전체 카드 보기</a><a class="v54-btn v54-btn-primary" href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v54-domain-click="${attr(v.slug)}">공식 도메인 바로가기</a></div></div></section>${summaryCards(v)}<section class="v54-section"><div class="v54-section-head"><span>BENEFIT SUMMARY</span><h2>${esc(v.name)} 핵심 혜택 요약</h2></div><ul class="v54-benefit-grid">${benefits}</ul></section><section class="v54-info-grid">${sections}</section><section class="v54-section"><div class="v54-section-head"><span>CHECK TABLE</span><h2>조건 확인표</h2></div><div class="v54-table-wrap"><table><thead><tr><th>구분</th><th>확인 항목</th><th>운영 메모</th></tr></thead><tbody>${tableRows}</tbody></table></div></section><section class="v54-section"><div class="v54-section-head"><span>KEYWORD MEMO</span><h2>#태그 메모</h2></div><div class="v54-tag-cloud">${tags}</div></section><section class="v54-contact-card"><div><span>COMMON CENTER</span><h2>공통 확인 채널</h2><p>이벤트 조건, 코드 적용, 도메인 변경 여부는 최신 업체 공지를 기준으로 확인합니다. 공통 연결 기준은 <a href="${BOT_URL}" target="_blank" rel="nofollow noopener noreferrer">${BOT}</a> 입니다.</p></div><a class="v54-btn v54-btn-primary" href="${BOT_URL}" target="_blank" rel="nofollow noopener noreferrer">상담센터 연결</a></section><section class="v54-neighbors"><h2>다른 보증업체 보기</h2><div>${others}</div></section></section></main>${footer()}<script defer src="/assets/js/v54.vendor-landing.js?v=${VERSION}"></script><script defer src="/assets/js/v49.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/v47.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
}

for (const v of vendors) write(path.join(ROOT,'guaranteed',v.slug,'index.html'), render(v));
write(path.join(ROOT,'assets/data/v54.vendor-landing.audit.json'), JSON.stringify({version:'V54',generatedAt:new Date().toISOString(),pages:vendors.map(v=>({slug:v.slug,route:`/guaranteed/${v.slug}/`,name:v.name,image:v.img,domain:v.domain,code:v.code})),checks:{topImage:'compact 16:7 visual card',layout:'hero card + fact strip + benefit grid + info cards',contactBot:BOT}}, null, 2));


const packageFile = path.join(ROOT, 'package.json');
if (fs.existsSync(packageFile)) {
  const pkg = JSON.parse(read(packageFile));
  const v54 = 'node scripts/generate-v54-vendor-landing-design.mjs';
  if (!pkg.scripts.build.includes('generate-v54-vendor-landing-design.mjs')) {
    if (pkg.scripts.build.includes('node scripts/generate-v53-main-open-ready.mjs')) pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v53-main-open-ready.mjs', 'node scripts/generate-v53-main-open-ready.mjs && ' + v54);
    else pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v43-quality-data.mjs', v54 + ' && node scripts/generate-v43-quality-data.mjs');
  }
  pkg.scripts['quality:v54'] = v54;
  write(packageFile, JSON.stringify(pkg, null, 2) + '\n');
}
const genBuildFile = path.join(ROOT, 'scripts/gen-build-ver.mjs');
if (fs.existsSync(genBuildFile)) {
  const next = read(genBuildFile).replace(/static-growth-conversion-v\d+-/g, 'static-growth-conversion-v54-');
  write(genBuildFile, next);
}
console.log(`V54 vendor landing design generated: ${vendors.length} pages`);
