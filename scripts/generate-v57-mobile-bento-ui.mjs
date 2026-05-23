#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-growth-conversion-v57';
const CSS = `/assets/css/v57.mobile-bento.css?v=${VERSION}`;
const JS = `/assets/js/v57.mobile-bento.js?v=${VERSION}`;

const vendors = [
  {id:'queenbee', en:'QUEENBEE', name:'여왕벌', img:'/assets/vendor-logos/v59/queenbee-card.svg', domainLabel:'qb-700.com', domain:'https://qb-700.com/?code=seoa', code:'seoa', desc:'신규·USDT 혜택 중심', badge:'검증 완료'},
  {id:'sk-holdings', en:'SK HOLDINGS', name:'SK 홀딩스', img:'/assets/vendor-logos/v59/sk-holdings-card.svg', domainLabel:'snk-99.com', domain:'https://snk-99.com/', code:'IRON888', desc:'입금 플러스·복귀 이벤트 중심', badge:'코드 확인'},
  {id:'anybet', en:'ANYBET', name:'ANYBET', img:'/assets/vendor-logos/v59/anybet-card.svg', domainLabel:'any-777.com', domain:'https://any-777.com/', code:'seoa', desc:'원화·USDT 첫충 혜택 중심', badge:'공식 확인'},
  {id:'udt', en:'UDT', name:'UDT', img:'/assets/vendor-logos/v59/udt-card.svg', domainLabel:'특공대.COM', domain:'https://특공대.com', code:'SEOA', desc:'미니게임·페이백 중심', badge:'검증 완료'},
  {id:'ddangkong', en:'DDANGKONG', name:'땅콩', img:'/assets/vendor-logos/v59/ddangkong-card.svg', domainLabel:'ddk-2025.com', domain:'https://ddk-2025.com', code:'ddk888', desc:'카지노·슬롯 콤프 중심', badge:'공식 확인'}
];

const tools = [
  ['official-url','공식주소 확인','주소 변조·서브도메인·HTTPS 신호를 빠르게 확인합니다.','주소','/tools/#tool-official-url','is-wide'],
  ['join-code','가입코드 확인','업체별 기준 코드와 입력값을 대조합니다.','코드','/tools/#tool-join-code',''],
  ['bonus-net','보너스 실수령','입금액·보너스율·롤링 배수를 함께 계산합니다.','보너스','/tools/#tool-bonus-net',''],
  ['rolling','롤링 조건 계산','필요 턴오버와 남은 롤링을 정리합니다.','롤링','/tools/#tool-rolling','is-tall'],
  ['withdraw','출금 가능 금액','최대 출금 한도와 조건 충족 금액을 비교합니다.','출금','/tools/#tool-withdrawable',''],
  ['first-recharge','첫충·매충 비교','첫 충전과 매 충전 혜택의 실수령 차이를 계산합니다.','혜택','/tools/#tool-first-recharge',''],
  ['overround','스포츠 환수율','배당판 오버라운드와 환수율을 계산합니다.','배당','/tools/#tool-overround','is-wide'],
  ['ev','EV 기대값','확률과 배당을 입력해 기대값을 수치로 확인합니다.','EV','/tools/#tool-ev',''],
  ['parlay','조합 배당 실수령','복수 선택 배당의 총 배당과 예상 수령액을 계산합니다.','조합','/tools/#tool-parlay',''],
  ['slot-rtp','슬롯 RTP 체감 손실','RTP와 세션 금액 기준 장기 기대 손실을 계산합니다.','RTP','/tools/#tool-slot-rtp',''],
  ['powerball','파워볼 파산 위험','마틴게일 단계별 필요 자본과 손실 위험을 계산합니다.','확률','/tools/#tool-powerball-ruin',''],
  ['phishing','피싱 URL 확인','유사문자·숫자 치환·도메인 불일치를 확인합니다.','보안','/tools/#tool-phishing','is-wide']
];

const guides = [
  ['스포츠토토','축구 1X2 배당판에서 오버라운드 계산하는 방법','배당판의 내재확률 합계와 하우스 마진을 분리해 읽는 기준입니다.','/blog/sports-toto/v47-football-1x2-overround-calculation.html'],
  ['온라인카지노','프라그마틱 라이브카지노 게임 종류 정리','라이브 테이블, 공급사 표기, 정산 흐름을 기준으로 확인합니다.','/blog/online-casino/pragmatic-live-casino-games.html'],
  ['온라인슬롯','노리밋시티 슬롯이 고변동성으로 분류되는 이유','xNudge·xWays·최대 노출 구조를 변동성 관점에서 정리합니다.','/blog/online-slot/nolimit-city-high-volatility.html'],
  ['보안·도메인','WHOIS 생성일로 운영 기간을 판단하는 방법','등록일, 갱신일, 네임서버 변화 신호를 공개 지표로 확인합니다.','/blog/game-guides/v47-whois-domain-creation-date-risk.html']
];

function write(file, content){ fs.mkdirSync(path.dirname(path.join(ROOT,file)), {recursive:true}); fs.writeFileSync(path.join(ROOT,file), content, 'utf8'); }
function read(file){ return fs.readFileSync(path.join(ROOT,file),'utf8'); }
function hasFile(file){ return fs.existsSync(path.join(ROOT,file)); }
function logo(){ return `<span class="v57-logo-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><span class="v57-logo-word"><b>88ST</b><em>.Cloud</em></span><span class="v57-logo-sub">Bento Trust Hub</span></span>`; }
function header(active='/'){
  const nav = [['/','메인'],['/blog/','블로그'],['/tools/','도구'],['/guaranteed/','보증업체'],['/consult/','고객센터']]
    .map(([href,label])=>`<a${href===active?' class="is-active"':''} href="${href}">${label}</a>`).join('');
  return `<header class="moon-header v57-header"><div class="moon-container moon-header__inner v57-header-row"><a aria-label="88ST.Cloud 홈" class="moon-brand v57-brand" href="/">${logo()}</a><nav aria-label="주요 메뉴" class="moon-nav v57-nav">${nav}</nav></div></header>`;
}
function footer(){ return `<footer class="moon-footer v57-footer"><div class="moon-container v57-footer-grid"><div><a aria-label="88ST.Cloud 홈" class="v57-brand" href="/">${logo()}</a><p>보증업체, 실사용 도구, 전문 가이드를 하나의 기준으로 정리합니다.</p></div><nav class="v57-footer-links" aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></footer>`; }
function head({title,desc,url}){ return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${title}</title><meta name="description" content="${desc}"/><meta name="robots" content="index,follow,max-image-preview:large"/><meta name="theme-color" content="#090D16"/><link rel="canonical" href="${url}"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/assets/vendor-logos/v59/queenbee-card.svg"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><link rel="stylesheet" href="/assets/css/v56.high-end-system.css?v=${VERSION}"/><link rel="stylesheet" href="${CSS}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="${title}"/><meta property="og:description" content="${desc}"/><meta property="og:url" content="${url}"/><meta property="og:image" content="https://88st.cloud/img/logo-v24.png"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json" data-v36-schema="primary">${JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://88st.cloud/#organization","name":"88ST.Cloud","url":"https://88st.cloud/","logo":"https://88st.cloud/img/logo-v24.png"},{"@type":"WebSite","@id":"https://88st.cloud/#website","url":"https://88st.cloud/","name":"88ST.Cloud","publisher":{"@id":"https://88st.cloud/#organization"}},{"@type":"WebPage","@id":url+"#webpage","url":url,"name":title,"description":desc,"isPartOf":{"@id":"https://88st.cloud/#website"},"inLanguage":"ko-KR"}]})}</script></head>`; }

const providerCardsHome = vendors.map(v => `<a class="v57-provider-card2" href="/guaranteed/${v.id}/" data-v57-search-item="${v.name} ${v.en} 보증업체 ${v.desc}"><div class="v57-provider-top"><span class="v57-provider-thumb"><img src="${v.img}" alt="${v.name} 로고" width="96" height="96" loading="lazy" decoding="async"/></span><span class="v57-provider-badge">${v.badge}</span></div><h3>${v.name}</h3><p>${v.desc}</p><span class="v57-provider-link">상세보기 →</span></a>`).join('');
const toolCards = tools.map(([id,title,desc,icon,href,variant]) => `<a class="v57-bento-card ${variant}" href="${href}" data-v57-search-item="${title} ${desc} ${icon}"><span class="v57-icon" aria-hidden="true">${icon.slice(0,2)}</span><strong>${title}</strong><p>${desc}</p><span>도구 열기 →</span></a>`).join('');
const guideCards = guides.map(([cat,title,desc,href]) => `<a class="v57-blog-card2" href="${href}" data-v57-search-item="${cat} ${title} ${desc}"><span class="v57-blog-thumb" aria-hidden="true"></span><span class="v57-blog-body"><em>${cat}</em><strong>${title}</strong><p>${desc}</p></span></a>`).join('');

write('index.html', `${head({title:'88ST.Cloud 메인 | 하이엔드 보증업체·도구 허브',desc:'보증업체, 12종 실사용 도구, 전문 가이드를 모바일 우선 Bento UI로 정리한 88ST.Cloud 메인 허브입니다.',url:'https://88st.cloud/'})}<body class="moon-page v57-high-end v57-home-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('/')}<main id="mainContent" class="v57-home-main"><section class="v57-hero"><div class="v57-container v57-hero-grid"><div class="v57-card v57-hero-copy"><div><span class="v57-kicker">88ST.Cloud Trust Dashboard</span><h1 class="v57-title">검증업체·도구·전문 가이드를 한 번에.</h1><p>공식 도메인 확인, 가입코드 대조, 보너스·롤링 계산, 전문 블로그 가이드를 하나의 다크모드 대시보드 흐름으로 정리했습니다.</p></div><div class="v57-hero-actions"><a class="v57-btn-primary" href="/tools/">도구 바로 열기</a><a class="v57-btn-secondary" href="/guaranteed/">보증업체 보기</a></div></div><aside class="v57-card v57-search-card" aria-label="빠른 검색"><div><span class="v57-kicker">Active Search</span><h2 class="v57-section-title" style="margin-top:12px">빠른 검색</h2><p class="v57-muted">도메인, 게임사, 도구명, 이벤트 조건을 입력해 메인 카드에서 바로 좁혀보세요.</p></div><div class="v57-search-box"><div class="v57-search-inner"><input data-v57-home-search type="search" placeholder="예: 롤링, 공식주소, 노리밋시티, 여왕벌" autocomplete="off"/><button type="button">검색</button></div></div><div class="v57-quick-stats"><a href="/tools/"><strong>12 Tools</strong><span>계산·검증 도구</span></a><a href="/guaranteed/"><strong>5 Providers</strong><span>보증업체 랜딩</span></a><a href="/blog/"><strong>Guides</strong><span>전문 블로그 허브</span></a><a href="/consult/"><strong>Center</strong><span>필요 시 고객센터</span></a></div><p data-v57-empty hidden class="v57-muted">검색 결과가 없습니다. 다른 키워드로 다시 입력해 주세요.</p></aside></div></section><section class="v57-section v57-container"><div class="v57-section-head"><div><span class="v57-kicker">Verified Providers</span><h2 class="v57-section-title">88ST 검증 완료 보증업체</h2><p>메인에서는 업체 이미지만 간결하게 확인하고, 상세 조건은 업체별 랜딩에서 확인합니다.</p></div><a href="/guaranteed/">전체 보기 →</a></div><div class="v57-provider-grid2">${providerCardsHome}</div></section><section class="v57-section v57-container"><div class="v57-section-head"><div><span class="v57-kicker">Core Dashboard Tools</span><h2 class="v57-section-title">12종 실사용 도구</h2><p>주소, 코드, 보너스, 롤링, 배당, RTP, 피싱 URL까지 방문자가 바로 쓸 수 있는 도구만 전면에 배치했습니다.</p></div><a href="/tools/">도구 전체 →</a></div><div class="v57-bento-grid">${toolCards}</div></section><section class="v57-section v57-container"><div class="v57-section-head"><div><span class="v57-kicker">Expert Guide & Blog</span><h2 class="v57-section-title">전문 가이드</h2><p>스포츠토토, 카지노, 슬롯, 보안 기준을 매거진형 카드로 빠르게 이동합니다.</p></div><a href="/blog/">블로그 전체 →</a></div><div class="v57-blog-grid2">${guideCards}</div></section><section class="v57-card v57-container v57-final"><div><span class="v57-kicker">Support</span><h2>확인이 더 필요할 때</h2><p>도구와 상세 랜딩에서 1차 확인 후, 추가 확인이 필요하면 고객센터로 이동하세요.</p></div><a class="v57-btn-primary" href="/consult/">고객센터 바로가기</a></section></main>${footer()}<script src="/assets/js/growth-conversion.v36.js?v=${VERSION}" defer></script><script src="${JS}" defer></script></body></html>`);

const guaranteedCards = vendors.map(v => `<article class="v57-premium-provider-card" data-v57-provider="${v.id}"><a class="v57-provider-logo-frame" href="/guaranteed/${v.id}/" aria-label="${v.name} 상세보기" style="--provider-logo:url('${v.img}')" data-fallback="${v.name}"><img src="${v.img}" alt="${v.name} 로고" width="640" height="240" loading="lazy" decoding="async"/></a><h2>${v.name}</h2><p class="v57-muted" style="position:relative;z-index:1;margin:0;font-size:13px">${v.desc}</p><div class="v57-provider-meta"><div><span>공식 도메인</span><a href="${v.domain}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v57-domain-click="${v.id}">${v.domainLabel}</a></div><div><span>가입코드</span><button type="button" data-v57-copy-code="${v.code}" aria-label="${v.name} 가입코드 복사">${v.code}</button></div></div><div class="v57-provider-actions"><a class="detail" href="/guaranteed/${v.id}/" data-v57-detail-click="${v.id}">상세보기</a><a class="go" href="${v.domain}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v57-domain-click="${v.id}">바로가기</a></div></article>`).join('');
write('guaranteed/index.html', `${head({title:'RUST 에이전시 보증 업체 | 88ST.Cloud',desc:'여왕벌, SK 홀딩스, ANYBET, UDT, 땅콩의 공식 도메인과 가입코드를 한 화면에서 확인하는 보증업체 허브입니다.',url:'https://88st.cloud/guaranteed/'})}<body class="moon-page v57-high-end v57-guaranteed-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('/guaranteed/')}<main id="mainContent" class="v57-guaranteed-main"><section class="v57-guaranteed-hero"><div class="v57-container v57-card"><span class="v57-kicker">RUST Guaranteed</span><h1>RUST 에이전시 보증 업체</h1><p>카드는 간결하게 유지하고, 업체 이미지는 안정적으로 표시되도록 이중 fallback을 적용했습니다. 혜택·이벤트·조건은 상세 페이지에서 확인하세요.</p></div></section><section class="v57-container v57-premium-provider-grid" aria-label="보증업체 카드">${guaranteedCards}</section></main>${footer()}<script src="/assets/js/growth-conversion.v36.js?v=${VERSION}" defer></script><script src="${JS}" defer></script></body></html>`);

function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules','.git','__MACOSX'].includes(name)) continue;
    const p = path.join(dir,name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p,out); else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}
function injectAssets(file) {
  let txt = fs.readFileSync(file,'utf8');
  if (!txt.includes('v57.mobile-bento.css')) {
    txt = txt.replace(/<\/head>/i, `<link rel="stylesheet" href="${CSS}"/>\n</head>`);
  }
  if (!txt.includes('v57.mobile-bento.js')) {
    txt = txt.replace(/<\/body>/i, `<script src="${JS}" defer></script>\n</body>`);
  }
  txt = txt.replace(/<body(\s[^>]*)?>/i, (m, attrs='') => {
    if (/class=/.test(attrs)) return m.replace(/class=["']([^"']*)["']/, (cm, cls) => `class="${cls.includes('v57-high-end') ? cls : cls + ' v57-high-end'}"`);
    return `<body${attrs} class="v57-high-end">`;
  });
  fs.writeFileSync(file, txt, 'utf8');
}
for (const f of walk(ROOT)) injectAssets(f);

const audit = {
  version:'v57',
  generatedAt:new Date().toISOString(),
  index:true,
  guaranteed:true,
  vendors:vendors.map(v=>({id:v.id,name:v.name,image:v.img,domain:v.domainLabel,code:v.code})),
  tools:tools.length,
  mobileFirst:true,
  providerImageFallback:true
};
write('assets/data/v57.mobile-bento.audit.json', JSON.stringify(audit,null,2)+'\n');


const pkgFile = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  const cmd = 'node scripts/generate-v57-mobile-bento-ui.mjs';
  if (!pkg.scripts.build.includes('generate-v57-mobile-bento-ui.mjs')) {
    if (pkg.scripts.build.includes('node scripts/generate-v56-high-end-design-system.mjs')) {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v56-high-end-design-system.mjs', 'node scripts/generate-v56-high-end-design-system.mjs && ' + cmd);
    } else {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v43-quality-data.mjs', cmd + ' && node scripts/generate-v43-quality-data.mjs');
    }
  }
  pkg.scripts['quality:v57'] = cmd;
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}


function patchVerifyForV57() {
  const vf = path.join(ROOT, 'scripts/verify-v36.mjs');
  if (!fs.existsSync(vf)) return;
  let s = fs.readFileSync(vf, 'utf8');
  const replacements = [
    ["if (!/premium-card/.test(g) || !/code-badge/.test(g)) fail(errors, \"guaranteed missing premium card code facts\");\n  if (!/>바로가기<|>바로가기\\s*</.test(g)) fail(errors, \"guaranteed missing shortcut button text\");\n  if (/class=[\"'][^\"']*moon-code|<button[^>]*data-g-copy/i.test(g)) fail(errors, \"guaranteed duplicate code button regression\");\n  const codeRows = (g.match(/class=[\"'][^\"']*code-badge/gi) || []).length;\n  if (codeRows !== 5) fail(errors, `guaranteed code badge count regression: ${codeRows}`);",
     "if (!/v57-guaranteed-page/.test(g)) {\n    if (!/premium-card/.test(g) || !/code-badge/.test(g)) fail(errors, \"guaranteed missing premium card code facts\");\n    const codeRows = (g.match(/class=[\"'][^\"']*code-badge/gi) || []).length;\n    if (codeRows !== 5) fail(errors, `guaranteed code badge count regression: ${codeRows}`);\n  }\n  if (!/>바로가기<|>바로가기\\s*</.test(g)) fail(errors, \"guaranteed missing shortcut button text\");\n  if (/class=[\"'][^\"']*moon-code|<button[^>]*data-g-copy/i.test(g)) fail(errors, \"guaranteed duplicate code button regression\");"],
    ["if ((g.match(/v48-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V48 guaranteed card count failed');\n    if ((g.match(/data-v47-copy-code=/g)||[]).length !== 5) fail(errors, 'V48 guaranteed code count failed');\n    if (!/v48-vendor-hero/.test(g)) fail(errors, 'V48 guaranteed image-first layout missing');",
     "if (!/v57-guaranteed-page/.test(g)) {\n      if ((g.match(/v48-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V48 guaranteed card count failed');\n      if ((g.match(/data-v47-copy-code=/g)||[]).length !== 5) fail(errors, 'V48 guaranteed code count failed');\n      if (!/v48-vendor-hero/.test(g)) fail(errors, 'V48 guaranteed image-first layout missing');\n    }"],
    ["if ((g.match(/v49-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V49 guaranteed card count failed');\n    if ((g.match(/data-v49-detail-click=/g)||[]).length !== 5) fail(errors, 'V49 detail button count failed');\n    if ((g.match(/data-v49-domain-click=/g)||[]).length < 5) fail(errors, 'V49 domain click tracking missing');\n    if (!/상세보기/.test(g)) fail(errors, 'V49 detail button text missing');",
     "if (!/v57-guaranteed-page/.test(g)) {\n      if ((g.match(/v49-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V49 guaranteed card count failed');\n      if ((g.match(/data-v49-detail-click=/g)||[]).length !== 5) fail(errors, 'V49 detail button count failed');\n      if ((g.match(/data-v49-domain-click=/g)||[]).length < 5) fail(errors, 'V49 domain click tracking missing');\n    }\n    if (!/상세보기/.test(g)) fail(errors, 'V49 detail button text missing');"],
    ["if (!/v50-guaranteed-page/.test(g)) fail(errors, 'V50 guaranteed page class missing');\n    if (!/v50-guarantee-container/.test(g)) fail(errors, 'V50 guaranteed compact container missing');\n    if ((g.match(/v50-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V50 guaranteed compact card count failed');\n    if ((g.match(/class=[\"'][^\"']*detail-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed detail buttons missing');\n    if ((g.match(/class=[\"'][^\"']*action-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed shortcut buttons missing');",
     "if (!/v57-guaranteed-page/.test(g)) {\n      if (!/v50-guaranteed-page/.test(g)) fail(errors, 'V50 guaranteed page class missing');\n      if (!/v50-guarantee-container/.test(g)) fail(errors, 'V50 guaranteed compact container missing');\n      if ((g.match(/v50-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V50 guaranteed compact card count failed');\n      if ((g.match(/class=[\"'][^\"']*detail-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed detail buttons missing');\n      if ((g.match(/class=[\"'][^\"']*action-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed shortcut buttons missing');\n    }"],
    ["if (!/v55-luminous-site/.test(txt)) fail(errors, 'V55 body class missing ' + route);\n      if (!/v55\\.luminous-sitewide\\.css/.test(txt)) fail(errors, 'V55 CSS link missing ' + route);\n      if (!/v55\\.luminous-sitewide\\.js/.test(txt)) fail(errors, 'V55 JS link missing ' + route);",
     "if (!/v55-luminous-site|v57-high-end/.test(txt)) fail(errors, 'V55/V57 body class missing ' + route);\n      if (!/v55\\.luminous-sitewide\\.css|v57\\.mobile-bento\\.css/.test(txt)) fail(errors, 'V55/V57 CSS link missing ' + route);\n      if (!/v55\\.luminous-sitewide\\.js|v57\\.mobile-bento\\.js/.test(txt)) fail(errors, 'V55/V57 JS link missing ' + route);"],
    ["if (!/v56-design-system/.test(txt) || !/v56\\.high-end-system\\.css/.test(txt) || !/v56\\.design-system\\.js/.test(txt)) missingV56++;",
     "if (!/v57-home-page|v57-guaranteed-page/.test(txt) && (!/v56-design-system/.test(txt) || !/v56\\.high-end-system\\.css/.test(txt) || !/v56\\.design-system\\.js/.test(txt))) missingV56++;"],
    ["if (hasHeaderBrand && !isRedirectOnly && (!/v56-logo-symbol/.test(txt) || !/v56-logo-main/.test(txt) || !/v56-logo-cloud/.test(txt))) missingLogo++;",
     "if (hasHeaderBrand && !isRedirectOnly && (!(/v56-logo-symbol/.test(txt) && /v56-logo-main/.test(txt) && /v56-logo-cloud/.test(txt)) && !/v57-logo-mark/.test(txt))) missingLogo++;"],
    ["if (!/v52-guaranteed-page/.test(g)) fail(errors, 'V52 guaranteed body class missing');\n    if (!/v52-guaranteed-grid/.test(g)) fail(errors, 'V52 guaranteed grid missing');\n    if ((g.match(/class=[\"'][^\"']*v52-provider-card/g)||[]).length !== 5) fail(errors, 'V52 provider card count failed');\n    if ((g.match(/data-v52-copy-code=/g)||[]).length !== 5) fail(errors, 'V52 copy code count failed');\n    if ((g.match(/data-v52-detail-click=/g)||[]).length !== 5) fail(errors, 'V52 detail click count failed');\n    if ((g.match(/data-v52-domain-click=/g)||[]).length < 5) fail(errors, 'V52 domain click count failed');",
     "if (!/v52-guaranteed-page|v57-guaranteed-page/.test(g)) fail(errors, 'V52/V57 guaranteed body class missing');\n    if (!/v52-guaranteed-grid|v57-premium-provider-grid/.test(g)) fail(errors, 'V52/V57 guaranteed grid missing');\n    if (!/v57-guaranteed-page/.test(g)) {\n      if ((g.match(/class=[\"'][^\"']*v52-provider-card/g)||[]).length !== 5) fail(errors, 'V52 provider card count failed');\n      if ((g.match(/data-v52-copy-code=/g)||[]).length !== 5) fail(errors, 'V52 copy code count failed');\n      if ((g.match(/data-v52-detail-click=/g)||[]).length !== 5) fail(errors, 'V52 detail click count failed');\n      if ((g.match(/data-v52-domain-click=/g)||[]).length < 5) fail(errors, 'V52 domain click count failed');\n    }"],
    ["if (!/v53-home-page/.test(h)) fail(errors, 'V53 home body class missing');\n    if (!/v53.main-open-ready.css/.test(h)) fail(errors, 'V53 main CSS missing');\n    if (!/assets\\/js\\/v53\\.main\\.js/.test(h)) fail(errors, 'V53 main JS missing');\n    if ((h.match(/class=[\"'][^\"']*v53-provider-card/g)||[]).length !== 5) fail(errors, 'V53 home provider card count failed');\n    if ((h.match(/class=[\"'][^\"']*v53-tool-card/g)||[]).length !== 6) fail(errors, 'V53 home tool card count failed');\n    if ((h.match(/class=[\"'][^\"']*v53-guide-card/g)||[]).length !== 4) fail(errors, 'V53 home guide card count failed');",
     "if (!/v53-home-page|v57-home-page/.test(h)) fail(errors, 'V53/V57 home body class missing');\n    if (!/v53.main-open-ready.css|v57.mobile-bento.css/.test(h)) fail(errors, 'V53/V57 main CSS missing');\n    if (!/assets\\/js\\/v53\\.main\\.js|assets\\/js\\/v57\\.mobile-bento\\.js/.test(h)) fail(errors, 'V53/V57 main JS missing');\n    if (!/v57-home-page/.test(h)) {\n      if ((h.match(/class=[\"'][^\"']*v53-provider-card/g)||[]).length !== 5) fail(errors, 'V53 home provider card count failed');\n      if ((h.match(/class=[\"'][^\"']*v53-tool-card/g)||[]).length !== 6) fail(errors, 'V53 home tool card count failed');\n      if ((h.match(/class=[\"'][^\"']*v53-guide-card/g)||[]).length !== 4) fail(errors, 'V53 home guide card count failed');\n    }"],
    ["if (/data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');",
     "if (!/v57-home-page/.test(h) && /data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');"]
  ];
  for (const [from, to] of replacements) s = s.replace(from, to);
  if (!s.includes('V57 mobile-first high-end bento checks')) {
    const insert = `\n\n// V57 mobile-first high-end bento checks\n{\n  const css = path.join(ROOT, 'assets/css/v57.mobile-bento.css');\n  const js = path.join(ROOT, 'assets/js/v57.mobile-bento.js');\n  const audit = path.join(ROOT, 'assets/data/v57.mobile-bento.audit.json');\n  if (!fs.existsSync(css)) fail(errors, 'V57 mobile bento CSS file missing');\n  if (!fs.existsSync(js)) fail(errors, 'V57 mobile bento JS file missing');\n  if (!fs.existsSync(audit)) fail(errors, 'V57 audit JSON missing');\n  const home = path.join(ROOT, 'index.html');\n  if (fs.existsSync(home)) {\n    const h = read(home);\n    if (!/v57-home-page/.test(h)) fail(errors, 'V57 home body class missing');\n    if ((h.match(/class=["'][^"']*v57-provider-card2/g)||[]).length !== 5) fail(errors, 'V57 home provider card count failed');\n    if ((h.match(/class=["'][^"']*v57-bento-card/g)||[]).length !== 12) fail(errors, 'V57 bento tool card count failed');\n    if ((h.match(/class=["'][^"']*v57-blog-card2/g)||[]).length !== 4) fail(errors, 'V57 blog card count failed');\n    if (/상담 전 체크|RUST 에이전시/.test(h)) fail(errors, 'V57 removed home copy returned');\n    if (/data-g-code=/.test(h)) fail(errors, 'V57 data-g-code leaked on home provider cards');\n  }\n  const guaranteed = path.join(ROOT, 'guaranteed/index.html');\n  if (fs.existsSync(guaranteed)) {\n    const g = read(guaranteed);\n    if (!/v57-guaranteed-page/.test(g)) fail(errors, 'V57 guaranteed body class missing');\n    if ((g.match(/class=["'][^"']*v57-premium-provider-card/g)||[]).length !== 5) fail(errors, 'V57 guaranteed card count failed');\n    if ((g.match(/class=["'][^"']*v57-provider-logo-frame/g)||[]).length !== 5) fail(errors, 'V57 guaranteed logo frame count failed');\n    if ((g.match(/data-v57-copy-code=/g)||[]).length !== 5) fail(errors, 'V57 copy code count failed');\n    for (const img of ['queenbee-logo-clean-v22.png','sk-holdings-logo.png','anybet-logo.png','udt-logo-transparent-v14.png','ddangkong-logo-v19.png']) {\n      if (!g.includes(img)) fail(errors, 'V57 missing provider image ' + img);\n      if (!fs.existsSync(path.join(ROOT, 'assets/provider-media', img))) fail(errors, 'V57 provider image asset missing ' + img);\n    }\n  }\n  const style = fs.existsSync(css) ? read(css) : '';\n  for (const token of ['@media (max-width:768px)', 'grid-template-columns:1fr', '#090D16', '#00F0FF', '#39FF14', 'v57-provider-logo-frame']) {\n    if (!style.includes(token)) fail(errors, 'V57 design token missing ' + token);\n  }\n}\n// END V57 mobile-first high-end bento checks\n`;
    s = s.replace('\nconst result = {', insert + '\nconst result = {');
  }
  fs.writeFileSync(vf, s, 'utf8');
}

patchVerifyForV57();

const genBuild = path.join(ROOT, 'scripts/gen-build-ver.mjs');
if (fs.existsSync(genBuild)) {
  fs.writeFileSync(genBuild, fs.readFileSync(genBuild, 'utf8').replace(/static-growth-conversion-v\d+-/g, 'static-growth-conversion-v57-'), 'utf8');
}

console.log('V57 mobile-first bento UI generated');
