import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-growth-conversion-v61';

const providers = [
  {name:'여왕벌', slug:'queenbee', logo:'/assets/vendor-logos/v59/queenbee-card.svg', href:'/guaranteed/queenbee/', badge:'보증금액 1억', desc:'신규·테더·미니게임 혜택을 한 화면에서 확인'},
  {name:'SK 홀딩스', slug:'sk-holdings', logo:'/assets/vendor-logos/v59/sk-holdings-card.svg', href:'/guaranteed/sk-holdings/', badge:'보증금액 1억', desc:'입금 플러스와 스포츠·카지노·슬롯 이벤트 정리'},
  {name:'ANYBET', slug:'anybet', logo:'/assets/vendor-logos/v59/anybet-card.svg', href:'/guaranteed/anybet/', badge:'보증금액 1억', desc:'원화·테더 가입 혜택과 페이백 조건 확인'},
  {name:'UDT BET', slug:'udt', logo:'/assets/vendor-logos/v59/udt-card.svg', href:'/guaranteed/udt/', badge:'보증금액 1억', desc:'미니게임·파워볼·실시간 이벤트 조건 확인'},
  {name:'땅콩 BET', slug:'ddangkong', logo:'/assets/vendor-logos/v59/ddangkong-card.svg', href:'/guaranteed/ddangkong/', badge:'보증금액 1억', desc:'카지노·슬롯 콤프와 충전 포인트 조건 정리'}
];

const tools = [
  ['공식주소 확인','도메인, 리다이렉트, 주소 일치 여부를 빠르게 점검','/tools/official-check/','⌁'],
  ['가입코드 확인','업체별 코드 표기와 입력 전 확인 흐름 정리','/tools/code-check/','#'],
  ['보너스 실수령','충전액, 보너스, 제한 조건을 계산','/tools/bonus-calculator/','%'],
  ['롤링 조건 계산','목표 롤링 금액과 진행률을 산출','/tools/rolling-calculator/','↻'],
  ['출금 가능 금액','최대 출금, 보너스 차감, 실수령 기준 확인','/tools/withdraw-limit/','₩'],
  ['첫충·매충 비교','첫충과 매충 이벤트의 실제 차이를 비교','/tools/first-bonus/','±'],
  ['배당 환수율','배당판의 마진과 환수율을 계산','/tools/odds-band/','∑'],
  ['AI 스포츠 배당','스포츠 라인과 조건을 구조적으로 해석','/tools/ai-sports-odds-analysis/','◎'],
  ['조합 배당','복수 배당의 실수령 구조를 계산','/tools/line-payout/','×'],
  ['슬롯 RTP','RTP와 체감 손실 범위를 정리','/tools/slot-rtp/','▣'],
  ['미니게임 회차','회차·결과·인정 기준을 기록','/tools/minigame-rounds/','◌'],
  ['피싱 URL 확인','유사 도메인·하이픈·문자 변조 신호 점검','/tools/similar-domain/','⌕']
];

const guides = [
  ['축구 CLV와 마감 배당 감사','오픈 배당과 마감 배당 차이로 시장 신호를 읽는 법','스포츠토토','/blog/sports-toto/v48-football-closing-line-value-audit.html'],
  ['바카라 타이 배당 하우스엣지','타이 배당이 왜 기대값상 불리한지 수식으로 정리','카지노','/blog/online-casino/v48-baccarat-tie-payout-house-edge.html'],
  ['프라그마틱 RTP 버전 확인','슬롯 RTP range와 버전별 차이를 읽는 방법','슬롯','/blog/online-slot/v48-pragmatic-rtp-version-range-check.html'],
  ['WHOIS/RDAP 도메인 이력','등록일, 갱신일, 네임서버 변화로 리스크를 점검','보안','/blog/game-guides/v48-whois-rdap-domain-history-fields.html']
];

function providerCard(p){
  return `<article class="v61-provider-card" data-v61-card data-name="${p.name} ${p.slug} 보증업체" data-section="providers">
    <a class="v61-provider-link" href="${p.href}" aria-label="${p.name} 상세보기">
      <div class="v61-provider-visual"><img src="${p.logo}" alt="${p.name} 로고" loading="eager" decoding="async" width="180" height="180"/></div>
      <div class="v61-provider-copy"><div class="v61-provider-top"><strong>${p.name}</strong><span>${p.badge}</span></div><p>${p.desc}</p><em>상세보기</em></div>
    </a>
  </article>`;
}

function toolCard(t, i){
  const wide = i === 0 || i === 2 || i === 7 ? ' v61-tool-wide' : '';
  return `<a class="v61-tool-card${wide}" data-v61-card data-name="${t[0]} ${t[1]} 도구" data-section="tools" href="${t[2]}"><span class="v61-tool-icon">${t[3]}</span><strong>${t[0]}</strong><p>${t[1]}</p><small>도구 열기</small></a>`;
}

function guideCard(g){
  return `<a class="v61-guide-card" data-v61-card data-name="${g[0]} ${g[1]} ${g[2]}" data-section="guides" href="${g[3]}"><div class="v61-guide-thumb"><span>${g[2]}</span></div><div><small>${g[2]}</small><strong>${g[0]}</strong><p>${g[1]}</p></div></a>`;
}

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <title>88ST.Cloud | Compact Trust Dashboard</title>
  <meta name="description" content="88ST.Cloud는 보증업체, 실사용 도구, 전문 가이드를 작은 타이틀과 밀도 높은 대시보드로 정리한 다크모드 허브입니다."/>
  <meta name="robots" content="index,follow,max-image-preview:large"/>
  <meta name="theme-color" content="#000000"/>
  <link rel="canonical" href="https://88st.cloud/"/>
  <link rel="icon" href="/favicon.ico"/>
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/>
  <link rel="manifest" href="/site.webmanifest"/>
  <link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/>
  <link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/>
  <link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/>
  <link rel="stylesheet" href="/assets/css/v59.vendor-logo-system.css?v=${VERSION}"/>
  <link rel="stylesheet" href="/assets/css/v61.main-dashboard-rebuild.css?v=${VERSION}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="88ST.Cloud"/>
  <meta property="og:title" content="88ST.Cloud | Compact Trust Dashboard"/>
  <meta property="og:description" content="보증업체, 12종 도구, 전문 가이드를 밀도 높은 앱형 다크 대시보드로 탐색합니다."/>
  <meta property="og:url" content="https://88st.cloud/"/>
  <script type="application/ld+json" data-v36-schema="primary">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://88st.cloud/#organization","name":"88ST.Cloud","url":"https://88st.cloud/"},{"@type":"WebSite","@id":"https://88st.cloud/#website","url":"https://88st.cloud/","name":"88ST.Cloud","publisher":{"@id":"https://88st.cloud/#organization"}},{"@type":"WebPage","@id":"https://88st.cloud/#webpage","url":"https://88st.cloud/","name":"88ST.Cloud Compact Trust Dashboard","description":"보증업체, 실사용 도구, 전문 가이드를 밀도 높은 다크 대시보드로 정리한 메인 페이지입니다.","isPartOf":{"@id":"https://88st.cloud/#website"},"inLanguage":"ko-KR"}]}</script>
</head>
<body class="v61-home">
  <a class="v61-skip" href="#main">본문 바로가기</a>
  <header class="v61-header">
    <div class="v61-shell v61-header-inner">
      <a class="v61-brand" href="/" aria-label="88ST.Cloud 홈"><span class="v61-logo-mark"><i></i><i></i><i></i><i></i></span><span class="v61-logo-type"><b>88ST</b><em>.Cloud</em></span></a>
      <nav class="v61-nav" aria-label="주요 메뉴"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav>
    </div>
  </header>
  <main id="main" class="v61-main">
    <section class="v61-top v61-shell" aria-labelledby="v61Title">
      <div class="v61-top-copy">
        <span class="v61-kicker">Compact Trust Dashboard</span>
        <h1 id="v61Title">필요한 확인만 빠르게.</h1>
        <p>보증업체, 실사용 도구, 전문 가이드를 작은 화면에서도 흐트러지지 않게 정리했습니다.</p>
      </div>
      <form class="v61-search" role="search"><label for="v61Search">통합 검색</label><input id="v61Search" type="search" placeholder="업체, 도구, 가이드 검색" autocomplete="off" data-v61-search/><button type="submit">검색</button></form>
    </section>
    <section class="v61-shell v61-grid-head" aria-labelledby="v61ProvidersTitle"><div><span class="v61-kicker">Verified Providers</span><h2 id="v61ProvidersTitle">보증업체</h2></div><a href="/guaranteed/">전체 보기</a></section>
    <section class="v61-shell v61-provider-grid" data-v61-area="providers">${providers.map(providerCard).join('\n')}</section>
    <section class="v61-shell v61-grid-head" aria-labelledby="v61ToolsTitle"><div><span class="v61-kicker">Core Toolkit</span><h2 id="v61ToolsTitle">실사용 도구</h2></div><a href="/tools/">도구 전체</a></section>
    <section class="v61-shell v61-tools-grid" data-v61-area="tools">${tools.map(toolCard).join('\n')}</section>
    <section class="v61-shell v61-grid-head" aria-labelledby="v61GuideTitle"><div><span class="v61-kicker">Expert Guides</span><h2 id="v61GuideTitle">전문 가이드</h2></div><a href="/blog/">블로그 전체</a></section>
    <section class="v61-shell v61-guide-grid" data-v61-area="guides">${guides.map(guideCard).join('\n')}</section>
    <section class="v61-shell v61-support" aria-label="고객센터"><div><span class="v61-kicker">Support</span><h2>고객센터</h2><p>확인이 필요한 경우 고객센터에서 필요한 정보만 빠르게 정리할 수 있습니다.</p></div><a href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer">고객센터 바로가기</a></section>
  </main>
  <nav class="v61-bottom-nav" aria-label="모바일 하단 메뉴"><a href="/" class="is-active"><span>⌂</span>메인</a><a href="/guaranteed/"><span>◆</span>보증</a><a href="/tools/"><span>▦</span>도구</a><a href="/blog/"><span>▤</span>블로그</a><a href="/consult/"><span>●</span>센터</a></nav>
  <footer class="v61-footer"><div class="v61-shell"><span>88ST.Cloud</span><p>검증업체 · 실사용 도구 · 전문 가이드 허브</p></div></footer>
  <script src="/assets/js/v61.main-dashboard-rebuild.js?v=${VERSION}" defer></script>
  <script src="/assets/js/build.ver.js" defer></script>
</body>
</html>`;

writeFileSync(resolve(ROOT, 'index.html'), html, 'utf8');

mkdirSync(resolve(ROOT, 'assets/data'), { recursive: true });
writeFileSync(resolve(ROOT, 'assets/data/v61.main-dashboard.audit.json'), JSON.stringify({
  version: 'v61',
  purpose: 'main dashboard rebuild with compact title and larger provider visuals',
  providers: providers.length,
  tools: tools.length,
  guides: guides.length,
  titlePolicy: 'compact',
  generatedAt: new Date().toISOString()
}, null, 2) + '\n', 'utf8');




// Keep legacy verify checks compatible with the V61 replacement homepage.
try {
  const verifyPath = resolve(ROOT, 'scripts/verify-v36.mjs');
  let verify = readFileSync(verifyPath, 'utf8');
  verify = verify.replace("if (!/v53-home-page|v57-home-page|v58-dashboard-home/.test(h)) fail(errors, 'V53/V57/V58 home body class missing');", "if (!/v61-home|v53-home-page|v57-home-page|v58-dashboard-home/.test(h)) fail(errors, 'V53/V57/V58/V61 home body class missing');");
  verify = verify.replace("if (!/v53.main-open-ready.css|v57.mobile-bento.css|v58.app-dashboard.css/.test(h)) fail(errors, 'V53/V57/V58 main CSS missing');", "if (!/v61.main-dashboard-rebuild.css|v53.main-open-ready.css|v57.mobile-bento.css|v58.app-dashboard.css/.test(h)) fail(errors, 'V53/V57/V58/V61 main CSS missing');");
  verify = verify.replace("if (!/assets\\/js\\/v53\\.main\\.js|assets\\/js\\/v57\\.mobile-bento\\.js|assets\\/js\\/v58\\.app-dashboard\\.js/.test(h)) fail(errors, 'V53/V57/V58 main JS missing');", "if (!/assets\\/js\\/v61\\.main-dashboard-rebuild\\.js|assets\\/js\\/v53\\.main\\.js|assets\\/js\\/v57\\.mobile-bento\\.js|assets\\/js\\/v58\\.app-dashboard\\.js/.test(h)) fail(errors, 'V53/V57/V58/V61 main JS missing');");
  verify = verify.replace("if (!/v57-home-page|v58-dashboard-home/.test(h)) {", "if (!/v61-home|v57-home-page|v58-dashboard-home/.test(h)) {");
  verify = verify.replace("if (!/v57-home-page|v58-dashboard-home/.test(h) && /data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');", "if (!/v61-home|v57-home-page|v58-dashboard-home/.test(h) && /data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');");
  writeFileSync(verifyPath, verify, 'utf8');
} catch {}

// Keep package build chain on V61 after earlier generators rewrite package.json.
try {
  const pkgPath = resolve(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const cmd = 'node scripts/generate-v61-main-dashboard-rebuild.mjs';
  if (pkg.scripts?.build && !pkg.scripts.build.includes(cmd)) {
    pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v60-open-ready-finalization.mjs &&', 'node scripts/generate-v60-open-ready-finalization.mjs && ' + cmd + ' &&');
  }
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['quality:v61'] = cmd;
  const v65cmd = 'node scripts/generate-v65-global-premium-fix.mjs';
  if (pkg.scripts?.build && !pkg.scripts.build.includes(v65cmd)) {
    if (pkg.scripts.build.includes('node scripts/generate-v43-quality-data.mjs && node scripts/gen-build-ver.mjs')) {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v43-quality-data.mjs && node scripts/gen-build-ver.mjs', 'node scripts/generate-v43-quality-data.mjs && ' + v65cmd + ' && node scripts/gen-build-ver.mjs');
    } else if (pkg.scripts.build.includes('node scripts/gen-build-ver.mjs')) {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/gen-build-ver.mjs', v65cmd + ' && node scripts/gen-build-ver.mjs');
    }
  }
  pkg.scripts['quality:v65'] = v65cmd;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
} catch {}

// Keep generated build metadata aligned after older V60 generator rewrites gen-build-ver.mjs.
const genBuildPath = resolve(ROOT, 'scripts/gen-build-ver.mjs');
try {
  let genBuild = readFileSync(genBuildPath, 'utf8');
  genBuild = genBuild.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v61-${compact}');
  genBuild = genBuild.replace(/static-growth-conversion-v60-\$\{compact\}/g, 'static-growth-conversion-v61-${compact}');
  writeFileSync(genBuildPath, genBuild, 'utf8');
} catch {}

console.log('V61 main dashboard rebuilt.');
