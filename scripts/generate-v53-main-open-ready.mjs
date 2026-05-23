import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://88st.cloud';
const VERSION = 'static-growth-conversion-v51-20260522';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const write = (p, s) => { const fp = path.join(ROOT, p); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, s, 'utf8'); };
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const providers = [
  { slug:'queenbee', name:'여왕벌', img:'/assets/vendor-logos/v59/queenbee-card.svg', detail:'/guaranteed/queenbee/', alt:'여왕벌 보증업체 이미지' },
  { slug:'sk-holdings', name:'SK 홀딩스', img:'/assets/vendor-logos/v59/sk-holdings-card.svg', detail:'/guaranteed/sk-holdings/', alt:'SK 홀딩스 보증업체 이미지' },
  { slug:'anybet', name:'ANYBET', img:'/assets/vendor-logos/v59/anybet-card.svg', detail:'/guaranteed/anybet/', alt:'ANYBET 보증업체 이미지' },
  { slug:'udt', name:'UDT', img:'/assets/vendor-logos/v59/udt-card.svg', detail:'/guaranteed/udt/', alt:'UDT 보증업체 이미지' },
  { slug:'ddangkong', name:'땅콩', img:'/assets/vendor-logos/v59/ddangkong-card.svg', detail:'/guaranteed/ddangkong/', alt:'땅콩 보증업체 이미지' }
];

const toolHighlights = [
  { title:'공식주소 확인', desc:'주소 변조·서브도메인·HTTPS 신호를 빠르게 확인합니다.', href:'/tools/#tool-official-url', tag:'주소' },
  { title:'코드 확인', desc:'업체별 기준 코드와 입력값을 대조합니다.', href:'/tools/#tool-join-code', tag:'코드' },
  { title:'보너스 실수령', desc:'입금액·보너스율·롤링 배수를 함께 계산합니다.', href:'/tools/#tool-bonus-net', tag:'보너스' },
  { title:'롤링 조건 계산', desc:'필요 턴오버와 남은 롤링을 정리합니다.', href:'/tools/#tool-rolling', tag:'롤링' },
  { title:'스포츠 환수율', desc:'배당판 오버라운드와 환수율을 계산합니다.', href:'/tools/#tool-overround', tag:'배당' },
  { title:'피싱 URL 확인', desc:'유사문자·숫자 치환·도메인 불일치를 확인합니다.', href:'/tools/#tool-phishing', tag:'보안' }
];

const guides = [
  { cat:'스포츠토토', title:'축구 1X2 배당판에서 오버라운드 계산하는 방법', desc:'배당판의 내재확률 합계와 하우스 마진을 분리해 읽는 기준입니다.', href:'/blog/sports-toto/v47-football-1x2-overround-calculation.html' },
  { cat:'온라인카지노', title:'프라그마틱 라이브카지노 게임 종류 정리', desc:'라이브 테이블, 공급사 표기, 정산 흐름을 기준으로 확인합니다.', href:'/blog/online-casino/pragmatic-live-casino-games.html' },
  { cat:'온라인슬롯', title:'노리밋시티 슬롯이 고변동성으로 분류되는 이유', desc:'xNudge·xWays·최대 노출 구조를 변동성 관점에서 정리합니다.', href:'/blog/online-slot/nolimit-city-high-volatility.html' },
  { cat:'보안·도메인', title:'WHOIS 생성일로 운영 기간을 판단하는 방법', desc:'등록일, 갱신일, 네임서버 변화 신호를 공개 지표로 확인합니다.', href:'/blog/game-guides/v47-whois-domain-creation-date-risk.html' }
];

function schema() {
  return JSON.stringify({
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Organization','@id':`${DOMAIN}/#organization`,name:'88ST.Cloud',url:`${DOMAIN}/`,logo:`${DOMAIN}/img/logo-v24.png`},
      {'@type':'WebSite','@id':`${DOMAIN}/#website`,url:`${DOMAIN}/`,name:'88ST.Cloud',publisher:{'@id':`${DOMAIN}/#organization`}},
      {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'홈',item:`${DOMAIN}/`}]},
      {'@type':'WebPage','@id':`${DOMAIN}/#webpage`,url:`${DOMAIN}/`,name:'88ST.Cloud 메인 | Team RUST MAIN',description:'보증업체, 실사용 도구, 전문 가이드를 한 화면에서 정리한 88ST.Cloud 메인 허브입니다.',isPartOf:{'@id':`${DOMAIN}/#website`},inLanguage:'ko-KR'}
    ]
  });
}

function head() {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>88ST.Cloud 메인 | Team RUST MAIN</title><meta name="description" content="보증업체, 실사용 도구, 전문 가이드를 한 화면에서 정리한 88ST.Cloud 메인 허브입니다."/><meta name="robots" content="index,follow,max-image-preview:large"/><meta name="theme-color" content="#050b13"/><link rel="canonical" href="${DOMAIN}/"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/img/logo-v24.png"/><link rel="preload" as="image" href="/assets/vendor-logos/v59/queenbee-card.svg"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><link rel="stylesheet" href="/assets/css/v52.open-ready.css?v=${VERSION}"/><link rel="stylesheet" href="/assets/css/v53.main-open-ready.css?v=${VERSION}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="88ST.Cloud 메인 | Team RUST MAIN"/><meta property="og:description" content="보증업체, 실사용 도구, 전문 가이드를 한 화면에서 정리한 메인 허브입니다."/><meta property="og:url" content="${DOMAIN}/"/><meta property="og:image" content="${DOMAIN}/img/logo-v24.png"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json" data-v36-schema="primary">${schema()}</script></head>`;
}

function header() {
  return `<body class="moon-page v53-home-page"><a class="skip-link" href="#mainContent">본문 바로가기</a><header class="moon-header v39-header v52-header v53-header"><div class="moon-container moon-header__inner v39-header__inner v52-header__inner"><a aria-label="88ST.Cloud 홈" class="moon-brand v39-brand v52-brand" href="/"><img alt="88ST.Cloud" decoding="async" fetchpriority="high" height="66" loading="eager" src="/img/logo-v24.png" width="260"/></a><nav aria-label="주요 메뉴" class="moon-nav v39-nav v52-nav"><a class="is-active" href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></header>`;
}

function providerCards() {
  return providers.map(p => `<article class="v53-provider-card" data-v53-search-item="${esc(p.name)} 보증업체"><a class="v53-provider-image" href="${p.detail}" aria-label="${esc(p.name)} 상세보기"><img src="${p.img}" alt="${esc(p.alt)}" width="420" height="150" loading="lazy" decoding="async"/></a><div class="v53-provider-foot"><strong>${esc(p.name)}</strong><a href="${p.detail}">상세보기</a></div></article>`).join('');
}

function toolCards() {
  return toolHighlights.map(t => `<a class="v53-tool-card" href="${t.href}" data-v53-search-item="${esc(t.title + ' ' + t.desc + ' ' + t.tag)}"><span>${esc(t.tag)}</span><strong>${esc(t.title)}</strong><p>${esc(t.desc)}</p></a>`).join('');
}

function guideCards() {
  return guides.map(g => `<a class="v53-guide-card" href="${g.href}" data-v53-search-item="${esc(g.cat + ' ' + g.title + ' ' + g.desc)}"><span>${esc(g.cat)}</span><strong>${esc(g.title)}</strong><p>${esc(g.desc)}</p></a>`).join('');
}

function body() {
  return `<main id="mainContent" class="v53-home-shell"><section class="v53-hero moon-container"><div class="v53-hero-copy"><span class="v53-kicker">Team RUST MAIN</span><h1>확인할 곳만 빠르게 정리한 메인 허브</h1><p>보증업체 상세, 실사용 계산 도구, 전문 가이드를 한 화면에서 바로 이동할 수 있게 정리했습니다.</p><div class="v53-hero-actions"><a class="v53-primary" href="/guaranteed/">보증업체 보기</a><a class="v53-secondary" href="/tools/">도구 열기</a></div></div><div class="v53-hero-panel" aria-label="핵심 연결"><a href="/guaranteed/"><b>보증업체</b><span>이미지 카드와 상세 랜딩</span></a><a href="/tools/"><b>실사용 도구</b><span>계산기·확인기 12종</span></a><a href="/blog/"><b>전문 가이드</b><span>스포츠·카지노·슬롯·보안</span></a><a href="/consult/"><b>고객센터</b><span>필요 시 단일 연결</span></a></div></section><section class="v53-search moon-container"><div><h2>빠른 검색</h2><p>도메인, 게임사, 도구명, 이벤트 조건을 입력하면 메인 카드에서 바로 좁혀봅니다.</p></div><label><span class="sr-only">메인 검색</span><input id="v53HomeSearch" type="search" placeholder="예: 공식주소, 롤링, 노리밋시티, 여왕벌" autocomplete="off"/></label></section><section class="v53-section moon-container"><div class="v53-section-head"><div><span>GUARANTEED</span><h2>보증업체 바로가기</h2></div><a href="/guaranteed/">전체 보기</a></div><div class="v53-provider-grid">${providerCards()}</div></section><section class="v53-section moon-container"><div class="v53-section-head"><div><span>TOOLS</span><h2>많이 쓰는 도구</h2></div><a href="/tools/">도구 전체</a></div><div class="v53-tool-grid">${toolCards()}</div></section><section class="v53-section moon-container"><div class="v53-section-head"><div><span>GUIDES</span><h2>최신 전문 가이드</h2></div><a href="/blog/">블로그 전체</a></div><div class="v53-guide-grid">${guideCards()}</div></section><section class="v53-final-cta moon-container"><div><span>CENTER</span><h2>필요한 정보가 정리되지 않았을 때</h2><p>도구와 보증업체 상세 페이지를 먼저 확인한 뒤, 추가 확인이 필요하면 고객센터로 이동하세요.</p></div><a href="/consult/">고객센터 바로가기</a></section></main>`;
}

function foot() {
  return `<footer class="moon-footer v52-footer v53-footer"><div class="moon-container"><strong>88ST.Cloud</strong><p>보증업체, 도구, 전문 가이드를 한 화면에서 정리합니다.</p></div></footer><script src="/assets/js/growth-conversion.v36.js?v=${VERSION}" defer></script><script src="/assets/js/v53.main.js?v=${VERSION}" defer></script></body></html>`;
}

function renderIndex() { write('index.html', head() + header() + body() + foot()); }

function writeAssets() {
  write('assets/css/v53.main-open-ready.css', `:root{--v53-bg:#050b13;--v53-card:rgba(12,20,33,.76);--v53-card2:rgba(17,28,45,.88);--v53-line:rgba(148,163,184,.20);--v53-text:#eef6ff;--v53-muted:#9fb0c7;--v53-gold:#f5c451;--v53-blue:#6ee7ff;--v53-green:#75f0b4}html,body.v53-home-page{background:radial-gradient(circle at 20% 0%,rgba(45,75,120,.34),transparent 34rem),linear-gradient(180deg,#050b13,#070b10 58%,#04070d)!important;color:var(--v53-text)!important}.v53-home-page *{box-sizing:border-box}.v53-home-page a{text-decoration:none}.v53-home-shell{padding:22px 0 64px}.v53-header{border-bottom:1px solid rgba(148,163,184,.18)!important;background:rgba(5,11,19,.82)!important;backdrop-filter:blur(16px)}.v53-hero{display:grid;grid-template-columns:minmax(0,1.04fr) minmax(320px,.72fr);gap:22px;align-items:stretch;padding-top:24px}.v53-hero-copy,.v53-hero-panel,.v53-search,.v53-section,.v53-final-cta{position:relative}.v53-hero-copy,.v53-hero-panel{border:1px solid var(--v53-line);background:linear-gradient(145deg,rgba(12,20,33,.84),rgba(7,12,21,.68));border-radius:28px;box-shadow:0 22px 70px rgba(0,0,0,.38)}.v53-hero-copy{padding:34px}.v53-kicker,.v53-section-head span,.v53-final-cta span{display:inline-flex;align-items:center;width:max-content;border:1px solid rgba(245,196,81,.24);background:rgba(245,196,81,.08);color:#ffe6a3;border-radius:999px;padding:6px 11px;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.v53-hero h1{margin:16px 0 0;font-size:clamp(32px,5vw,58px);line-height:1.02;letter-spacing:-.055em;color:#fff}.v53-hero p{margin:16px 0 0;max-width:680px;color:var(--v53-muted);font-size:16px;line-height:1.72}.v53-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.v53-primary,.v53-secondary,.v53-final-cta a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:14px;padding:0 16px;font-weight:900}.v53-primary,.v53-final-cta a{background:linear-gradient(135deg,#f7d06b,#d99f22);color:#15100a!important;box-shadow:0 14px 34px rgba(245,196,81,.16)}.v53-secondary{border:1px solid rgba(110,231,255,.28);background:rgba(110,231,255,.09);color:#dffaff!important}.v53-hero-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:18px}.v53-hero-panel a{display:flex;flex-direction:column;justify-content:space-between;min-height:112px;border:1px solid rgba(148,163,184,.14);background:rgba(255,255,255,.045);border-radius:18px;padding:16px;color:#fff;transition:.18s ease}.v53-hero-panel a:hover,.v53-tool-card:hover,.v53-guide-card:hover,.v53-provider-card:hover{transform:translateY(-3px);border-color:rgba(110,231,255,.38)}.v53-hero-panel b{font-size:17px}.v53-hero-panel span{margin-top:8px;color:var(--v53-muted);font-size:13px;line-height:1.45}.v53-search{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:22px;border:1px solid var(--v53-line);background:rgba(12,20,33,.62);border-radius:22px;padding:18px 20px}.v53-search h2,.v53-section h2,.v53-final-cta h2{margin:0;color:#fff;letter-spacing:-.04em}.v53-search p{margin:5px 0 0;color:var(--v53-muted);line-height:1.5}.v53-search label{width:min(420px,100%)}.v53-search input{width:100%;min-height:46px;border-radius:14px;border:1px solid rgba(148,163,184,.24);background:rgba(3,7,13,.72);color:#fff;padding:0 15px;outline:none}.v53-search input:focus{border-color:rgba(110,231,255,.55);box-shadow:0 0 0 4px rgba(110,231,255,.08)}.v53-section{margin-top:24px;border:1px solid var(--v53-line);background:rgba(8,14,24,.56);border-radius:26px;padding:22px}.v53-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px}.v53-section-head a{color:#dffaff;font-weight:900;font-size:14px}.v53-provider-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:13px}.v53-provider-card{overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(18,30,48,.82),rgba(7,12,21,.88));border-radius:19px;transition:.18s ease;min-height:168px}.v53-provider-image{display:flex;align-items:center;justify-content:center;height:116px;padding:14px;background:radial-gradient(circle at 50% 0%,rgba(110,231,255,.10),transparent 70%),rgba(0,0,0,.22)}.v53-provider-image img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 10px 20px rgba(0,0,0,.34))}.v53-provider-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 13px;border-top:1px solid rgba(148,163,184,.12)}.v53-provider-foot strong{font-size:14px;color:#fff;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v53-provider-foot a{flex:0 0 auto;border-radius:999px;background:rgba(245,196,81,.12);border:1px solid rgba(245,196,81,.24);color:#ffe6a3;padding:7px 10px;font-size:12px;font-weight:900}.v53-tool-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.v53-tool-card,.v53-guide-card{border:1px solid rgba(148,163,184,.15);background:var(--v53-card);border-radius:18px;padding:17px;color:#fff;min-height:150px;transition:.18s ease}.v53-tool-card span,.v53-guide-card span{display:inline-flex;border-radius:999px;background:rgba(117,240,180,.10);color:#a8ffd4;border:1px solid rgba(117,240,180,.18);padding:5px 9px;font-size:11px;font-weight:900}.v53-tool-card strong,.v53-guide-card strong{display:block;margin-top:14px;font-size:18px;letter-spacing:-.03em}.v53-tool-card p,.v53-guide-card p{margin:9px 0 0;color:var(--v53-muted);line-height:1.58;font-size:14px}.v53-guide-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.v53-guide-card{min-height:174px}.v53-final-cta{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:24px;border:1px solid rgba(245,196,81,.20);background:linear-gradient(135deg,rgba(245,196,81,.12),rgba(12,20,33,.72));border-radius:26px;padding:24px}.v53-final-cta p{margin:8px 0 0;color:var(--v53-muted);line-height:1.6}.v53-footer{background:#04070d!important;border-top:1px solid rgba(148,163,184,.16)!important}.v53-is-hidden{display:none!important}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:980px){.v53-hero{grid-template-columns:1fr}.v53-provider-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.v53-tool-grid,.v53-guide-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v53-search{align-items:stretch;flex-direction:column}.v53-search label{width:100%}}@media(max-width:620px){.v53-home-shell{padding-top:10px}.v53-hero{padding-top:14px}.v53-hero-copy{padding:24px;border-radius:22px}.v53-hero h1{font-size:34px}.v53-hero-panel{grid-template-columns:1fr}.v53-provider-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v53-provider-image{height:92px}.v53-provider-foot{display:block}.v53-provider-foot a{margin-top:8px;display:inline-flex}.v53-tool-grid,.v53-guide-grid{grid-template-columns:1fr}.v53-section{padding:16px;border-radius:22px}.v53-section-head,.v53-final-cta{align-items:flex-start;flex-direction:column}.v53-final-cta a{width:100%}}`);
  write('assets/js/v53.main.js', `(()=>{const input=document.getElementById('v53HomeSearch');if(!input)return;const items=[...document.querySelectorAll('[data-v53-search-item]')];input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();items.forEach(el=>{const hay=(el.getAttribute('data-v53-search-item')||el.textContent||'').toLowerCase();el.classList.toggle('v53-is-hidden',!!q&&!hay.includes(q));});});document.addEventListener('click',e=>{const a=e.target.closest('.v53-provider-card a,.v53-tool-card,.v53-guide-card,.v53-final-cta a,.v53-hero-actions a');if(a){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'main_cta_click',label:(a.textContent||a.getAttribute('aria-label')||'').trim(),href:a.getAttribute('href')||''});}});})();\n`);
}

function updatePackage() {
  const pkg = JSON.parse(read('package.json'));
  const v53 = 'node scripts/generate-v53-main-open-ready.mjs';
  if (!pkg.scripts.build.includes('generate-v53-main-open-ready.mjs')) {
    if (pkg.scripts.build.includes('node scripts/generate-v52-open-ready-ui.mjs')) pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v52-open-ready-ui.mjs', 'node scripts/generate-v52-open-ready-ui.mjs && ' + v53);
    else pkg.scripts.build = pkg.scripts.build + ' && ' + v53;
  }
  pkg.scripts['quality:v53'] = v53;
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
}

function updateBuildVersion() {
  const p = path.join(ROOT, 'scripts/gen-build-ver.mjs');
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/const version = `static-growth-conversion-v\d+-\$\{compact\}`;/, 'const version = `static-growth-conversion-v53-${compact}`;');
  fs.writeFileSync(p, s, 'utf8');
}

function updateVerify() {
  const p = path.join(ROOT, 'scripts/verify-v36.mjs');
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/\n\/\/ V53 main open ready checks[\s\S]*?\/\/ END V53 main open ready checks\n?/g, '\n');
  const block = `\n// V53 main open ready checks\n{\n  const home = path.join(ROOT, 'index.html');\n  if (!fs.existsSync(home)) fail(errors, 'V53 home index missing');\n  else {\n    const h = read(home);\n    if (!/v53-home-page/.test(h)) fail(errors, 'V53 home body class missing');\n    if (!/v53.main-open-ready.css/.test(h)) fail(errors, 'V53 main CSS missing');\n    if (!/assets\\/js\\/v53\\.main\\.js/.test(h)) fail(errors, 'V53 main JS missing');\n    if ((h.match(/class=[\"'][^\"']*v53-provider-card/g)||[]).length !== 5) fail(errors, 'V53 home provider card count failed');\n    if ((h.match(/class=[\"'][^\"']*v53-tool-card/g)||[]).length !== 6) fail(errors, 'V53 home tool card count failed');\n    if ((h.match(/class=[\"'][^\"']*v53-guide-card/g)||[]).length !== 4) fail(errors, 'V53 home guide card count failed');\n    if (/RUST 에이전시/.test(h)) fail(errors, 'V53 removed title returned on home');\n    if (/상담 전 체크/.test(h)) fail(errors, 'V53 old consult-check card returned on home');\n    if (/data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');\n    if (/href=[\"']#[\"']|javascript:void\\(0\\)/i.test(h)) fail(errors, 'V53 bad href in home');\n  }\n  const css = path.join(ROOT, 'assets/css/v53.main-open-ready.css');\n  const js = path.join(ROOT, 'assets/js/v53.main.js');\n  const audit = path.join(ROOT, 'assets/data/v53.main.audit.json');\n  if (!fs.existsSync(css)) fail(errors, 'V53 main CSS file missing');\n  if (!fs.existsSync(js)) fail(errors, 'V53 main JS file missing');\n  if (!fs.existsSync(audit)) fail(errors, 'V53 audit JSON missing');\n}\n// END V53 main open ready checks\n`;
  s = s.replace(/const result = \{/, block + '\nconst result = {');
  fs.writeFileSync(p, s, 'utf8');
}

function writeAudit() {
  write('assets/data/v53.main.audit.json', JSON.stringify({
    version: VERSION,
    generatedAt: new Date().toISOString(),
    page: '/',
    providers: providers.map(({slug,name,detail}) => ({slug,name,detail})),
    toolCards: toolHighlights.map(({title,href}) => ({title,href})),
    guideCards: guides.map(({cat,title,href}) => ({cat,title,href})),
    checks: ['home_provider_cards_5','home_tool_cards_6','home_guide_cards_4','no_provider_code_on_home','no_domain_text_on_home','no_old_consult_check_card','no_hash_only_href']
  }, null, 2));
}

renderIndex();
writeAssets();
writeAudit();
updatePackage();
updateBuildVersion();
updateVerify();
console.log('V53 main open-ready page generated');
