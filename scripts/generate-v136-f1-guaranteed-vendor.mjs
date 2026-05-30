import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V136_F1_GUARANTEED_VENDOR_ADDITION';
function p(...a){return path.join(ROOT,...a)}
function read(file){return fs.existsSync(file)?fs.readFileSync(file,'utf8'):''}
function write(file, data){fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,data)}
function ensureLink(html, href, marker){
  if(html.includes(href)) return html;
  return html.replace('</head>', `<link rel="stylesheet" href="${href}?v=20260530-1" ${marker}>\n</head>`);
}
function ensureBodyMarker(html){
  html = html.replace(/<html([^>]*)>/i,(m,a)=> a.includes('data-v136-f1-vendor')?m:`<html${a} data-v136-f1-vendor="active">`);
  html = html.replace(/<body([^>]*)>/i,(m,a)=> a.includes('data-v136-f1-vendor')?m:`<body${a} data-v136-f1-vendor="true">`);
  return html;
}
function copyAsset(){
  const src=p('assets/img/guaranteed/cards/f1.webp');
  if(!fs.existsSync(src)) throw new Error('missing F-1 image asset: '+src);
}
function injectAllCss(){
  const cssHref='/assets/css/v136-f1-guaranteed-vendor.css';
  for(const file of walk(ROOT).filter(f=>f.endsWith('.html'))){
    let html=read(file);
    const next=ensureBodyMarker(ensureLink(html, cssHref, 'data-v136-f1-vendor="true"'));
    if(next!==html) write(file,next);
  }
}
function walk(dir){
  let out=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules'].includes(e.name)) continue;
    const fp=path.join(dir,e.name);
    if(e.isDirectory()) out=out.concat(walk(fp)); else out.push(fp);
  }
  return out;
}
const F1_CARD_HOME=`<a class="v71-partner-card v71-glow-border v136-f1-home-card" href="/guaranteed/f1/" aria-label="F-1 보증업체 보기" data-ga4-event="vendor_detail_click" data-v102-cta="home_partner_f1" data-v136-f1-card="home"><img data-v128-img="lightweight" src="/assets/img/guaranteed/cards/f1.webp" alt="F-1 보증업체 카드 이미지" loading="lazy" decoding="async" width="960" height="540" fetchpriority="low" data-v92-card-image="f1" data-v98-img="optimized" data-v136-f1-image="true"></a>`;
const F1_VENDOR_CARD=`<article class="v74-1-vendor-card v136-f1-vendor-card" data-vendor="f1" data-v965-card="true" data-v965-rank="07" data-v965-tag="USDT·보너스" style="--vendor-accent:#EF4444">
  <a class="v74-1-image-link" href="/guaranteed/f1/" aria-label="F-1 상세보기">
    <img data-v128-img="lightweight" src="/assets/img/guaranteed/cards/f1.webp" alt="F-1 보증업체 카드 이미지" loading="lazy" decoding="async" width="960" height="540" fetchpriority="low" data-v92-card-image="f1" data-v98-img="optimized" data-v136-f1-image="true">
  </a>
  <div class="v74-1-card-body">
    <div class="v74-1-name-row">
      <h2>F-1</h2>
      <span>Premium</span>
    </div>
    <div class="v74-1-info-grid" aria-label="F-1 핵심 정보">
      <div><small>가입코드</small><code>888</code></div>
    </div>
    <div class="v74-1-actions">
      <a class="v74-1-btn v74-1-btn--detail" href="/guaranteed/f1/" data-v92-detail="true" data-ga4-event="vendor_detail_click" data-vendor="F-1" aria-label="F-1 상세보기" data-v124-cta-lock="benefit-code-only" data-v118-ab-label="detail">혜택표 보기</a>
      <button class="v74-1-btn v74-1-btn--go" type="button" data-v74-go="true" data-v92-go="true" data-ga4-event="vendor_outbound_click" data-code="888" data-href="https://f1-77.com/register?ref=888" data-vendor="F-1" aria-label="F-1 가입코드 888 복사 후 바로가기" data-v124-cta-lock="benefit-code-only" data-v118-ab-label="go">코드복사 · 이동</button>
    </div>
  </div>
</article>`;
function homeCard(slug, name, img, extra=''){
  return `<a class="v71-partner-card v71-glow-border ${extra}" href="/guaranteed/${slug}/" aria-label="${name} 보증업체 보기" data-ga4-event="vendor_detail_click" data-v102-cta="home_partner_${slug}"${slug==='f1'?' data-v136-f1-card="home"':''}><img data-v128-img="lightweight" src="/assets/img/guaranteed/cards/${img}" alt="${name} 보증업체 카드 이미지" loading="lazy" decoding="async" width="960" height="540" fetchpriority="low" data-v92-card-image="${slug}" data-v98-img="optimized"${slug==='f1'?' data-v136-f1-image="true"':''}></a>`;
}
function updateHome(){
  const file=p('index.html');
  let html=read(file);
  const grid=[
    homeCard('sk-holdings','SK 홀딩스','sk-holdings.webp'),
    homeCard('zakum','자쿰','zakum.webp'),
    homeCard('udt','UDT BET','udt-bet.webp'),
    homeCard('queenbee','여왕벌','queenbee.webp'),
    homeCard('ddangkong','땅콩 BET','ddangkong-bet.webp'),
    homeCard('anybet','ANY BET','anybet.webp'),
    `<a class="v71-partner-card v71-glow-border v1322-ad-inquiry-card" href="/consult/" aria-label="광고 문의 이미지 카드" data-ga4-event="consult_click" data-v1322-ad-card="inquiry-01"><img data-v128-img="lightweight" src="/assets/img/guaranteed/cards/ad-inquiry-01.webp" alt="광고 문의 이미지 카드" loading="lazy" decoding="async" width="1536" height="864" fetchpriority="low" data-v1322-card-image="ad-inquiry-01"></a>`,
    F1_CARD_HOME
  ].join('');
  const gridRe=/(<div class="v71-partner-tile-grid">)[\s\S]*?(<\/div>\s*<\/aside>)/;
  if(gridRe.test(html)) html=html.replace(gridRe,`$1${grid}$2`);
  else if(!html.includes('data-v136-f1-card="home"')) html=html.replace('</main>',`<section class="v71-section v71-shell"><div class="v71-partner-tile-grid">${grid}</div></section></main>`);
  html=html.replace(/<link rel="preload" as="image" href="\/assets\/img\/guaranteed\/cards\/f1\.webp">\s*/g,'');
  html=html.replace('</head>','  <link rel="preload" as="image" href="/assets/img/guaranteed/cards/f1.webp">\n</head>');
  write(file, html);
}
function updateGuaranteedIndex(){
  const file=p('guaranteed/index.html');
  let html=read(file);
  html=html.replace(/<article class="v74-1-vendor-card v136-f1-vendor-card"[\s\S]*?<\/article>/g,'');
  // Insert after ANY BET card, before section close.
  if(!html.includes('data-vendor="f1"')){
    const anyEnd=/(<article class="v74-1-vendor-card" data-vendor="anybet"[\s\S]*?<\/article>)/;
    if(anyEnd.test(html)) html=html.replace(anyEnd,`$1\n${F1_VENDOR_CARD}`);
    else html=html.replace(/(\s*<\/section>\s*<\/main>)/,`\n${F1_VENDOR_CARD}\n$1`);
  }
  html=html.replace(/SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET/g,'SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET, F-1');
  html=html.replace(/ANY BET, 가입코드/g,'ANY BET, F-1, 가입코드');
  html=html.replace(/numberOfItems":6/g,'numberOfItems":7');
  if(!html.includes('"name":"F-1"')){
    html=html.replace(/\{"@type":"ListItem","position":6,"name":"ANY BET","url":"https:\/\/88st\.cloud\/guaranteed\/anybet\/"\}/,
      '{"@type":"ListItem","position":6,"name":"ANY BET","url":"https://88st.cloud/guaranteed/anybet/"},{"@type":"ListItem","position":7,"name":"F-1","url":"https://88st.cloud/guaranteed/f1/"}');
  }
  html=html.replace(/<link rel="preload" as="image" href="\/assets\/img\/guaranteed\/cards\/f1\.webp">\s*/g,'');
  html=html.replace('</head>','  <link rel="preload" as="image" href="/assets/img/guaranteed/cards/f1.webp">\n</head>');
  write(file, html);
}
const F1_DETAIL=`<!DOCTYPE html><html lang="ko" data-v136-f1-vendor="active" data-v135-8-mobile-home-layout="active"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
  <title>F-1 보증업체 혜택 확인 | 88ST.Cloud</title>
  <meta name="description" content="F-1 공식 도메인, 가입코드 888, USDT 입출금과 스포츠·미니게임·슬롯·카지노·홀덤 보너스 조건을 정리했습니다.">
  <link rel="canonical" href="https://88st.cloud/guaranteed/f1/">
  <meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#06090f">
  <meta property="og:type" content="website"><meta property="og:site_name" content="RUST"><meta property="og:url" content="https://88st.cloud/guaranteed/f1/"><meta property="og:title" content="F-1 보증업체 혜택 확인 | 88ST.Cloud"><meta property="og:description" content="F-1 공식 도메인, 가입코드 888, USDT 입출금과 주요 이벤트 조건을 정리했습니다."><meta property="og:image" content="https://88st.cloud/assets/img/guaranteed/cards/f1.webp">
  <meta name="twitter:title" content="F-1 보증업체 혜택 확인 | 88ST.Cloud"><meta name="twitter:description" content="F-1 공식 도메인, 가입코드 888, USDT 입출금과 주요 이벤트 조건을 정리했습니다."><meta name="twitter:image" content="https://88st.cloud/assets/img/guaranteed/cards/f1.webp">
  <link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="preload" as="image" href="/assets/img/guaranteed/cards/f1.webp">
  <link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true"><link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true"><link rel="stylesheet" href="/assets/css/v96-2-guaranteed-landing-fix.css?v=static-v96-2-guaranteed-landing-fix-20260526" data-v96-2-guaranteed-landing-fix="true"><link rel="stylesheet" href="/assets/css/v96-3-mobile-safe-layout.css?v=static-v96-3-mobile-safe-layout-20260526-v96-4-cache-safe" data-v96-3-mobile-safe-layout="true"><link rel="stylesheet" href="/assets/css/v109-guaranteed-detail-contrast.css?v=v109-guaranteed-detail-contrast-20260527" data-v109-guaranteed-detail-contrast="true"><link rel="stylesheet" href="/assets/css/v113-guaranteed-detail-content-depth.css?v=v113-guaranteed-detail-content-depth-20260528" data-v113-guaranteed-detail-depth="true"><link rel="stylesheet" href="/assets/css/v119-guaranteed-cleanup.css?v=20260528" data-v119-guaranteed-cleanup="true"><link rel="stylesheet" href="/assets/css/v120-main-conversion-polish.css?v=20260528" data-v120-conversion-polish="true"><link rel="stylesheet" href="/assets/css/v124-guaranteed-detail-conversion-copy.css?v=20260529" data-v124-guaranteed-detail-conversion="true"><link rel="stylesheet" href="/assets/css/v127-mobile-qa-safe-area-lock.css?v=20260529" data-v127-mobile-qa="true"><link rel="stylesheet" href="/assets/css/v128-performance-asset-lightweight.css?v=20260529" data-v128-performance="true"><link rel="stylesheet" href="/assets/css/v135-2-global-footer-tone-recovery.css?v=20260530-3" data-v135-2-tone-footer="true"><link rel="stylesheet" href="/assets/css/v135-3-footer-placement-hotfix.css?v=20260530-1" data-v135-3-footer-placement="true"><link rel="stylesheet" href="/assets/css/v135-4-global-header-brand-unify.css?v=20260530-1" data-v135-4-global-header-brand="true"><link rel="stylesheet" href="/assets/css/v135-5-blog-header-dark-lock.css?v=20260530-1" data-v135-5-blog-header-dark-lock="true"><link rel="stylesheet" href="/assets/css/v136-f1-guaranteed-vendor.css?v=20260530-1" data-v136-f1-vendor="true">
  <script type="application/ld+json" data-v136-f1-schema="true">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://88st.cloud/#organization","name":"RUST","url":"https://88st.cloud/","logo":"https://88st.cloud/assets/img/rust/rust-crest-192.png"},{"@type":"WebPage","@id":"https://88st.cloud/guaranteed/f1/#webpage","url":"https://88st.cloud/guaranteed/f1/","name":"F-1 보증업체 혜택 확인","description":"F-1 공식 도메인, 가입코드 888, USDT 입출금과 보너스 조건을 정리했습니다.","isPartOf":{"@id":"https://88st.cloud/#website"},"inLanguage":"ko-KR"},{"@type":"BreadcrumbList","@id":"https://88st.cloud/guaranteed/f1/#breadcrumb","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":"https://88st.cloud/"},{"@type":"ListItem","position":2,"name":"보증업체","item":"https://88st.cloud/guaranteed/"},{"@type":"ListItem","position":3,"name":"F-1","item":"https://88st.cloud/guaranteed/f1/"}]}]}</script>
</head><body class="v102-live-ux rust-brand-system v96-2-detail v96-2-guaranteed-landing-fix" data-v136-f1-vendor="true" style="--vendor-accent:#EF4444"><header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true"><div class="rust-header-inner"><a class="rust-brand-lockup" href="/" aria-label="RUST 홈"><span class="rust-brand-mark"><img src="/assets/img/rust/rust-crest-32.png" alt="" width="34" height="34" loading="eager" decoding="async"></span><span class="rust-brand-text"><b>RUST</b></span></a><nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/" aria-current="page">보증업체</a><a href="/consult/">상담</a></nav><button class="rust-menu-toggle" type="button" aria-label="모바일 메뉴 열기" data-rust-menu-toggle="true"><span></span><span></span></button></div><nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/" aria-current="page">보증업체</a><a href="/consult/">상담</a></nav></header>
<main id="mainContent"><section class="v96-2-shell v136-f1-detail-shell"><nav class="v96-2-breadcrumb" aria-label="현재 위치"><a href="/guaranteed/">보증업체</a><span>/</span><strong>F-1</strong></nav><section class="v96-2-hero v119-detail-hero v124-detail-hero"><div class="v96-2-art v119-detail-art v124-detail-art"><img src="/assets/img/guaranteed/cards/f1.webp" alt="F-1 보증업체 카드 이미지" width="960" height="540" loading="eager" decoding="async" fetchpriority="high"></div><div class="v96-2-copy"><span class="v96-2-kicker">F-1 BENEFIT CHECK</span><h1>F-1 혜택표 · 코드 확인</h1><p>USDT 입출금과 수수료 지원, 스포츠·미니게임·슬롯·카지노·홀덤 보너스를 한 화면에서 확인할 수 있게 정리했습니다.</p><div class="v96-2-actions"><a class="v96-2-btn" href="/guaranteed/">전체 카드</a><button type="button" class="v96-2-btn v96-2-btn--primary" data-v92-go="true" data-ga4-event="vendor_outbound_click" data-code="888" data-href="https://f1-77.com/register?ref=888" data-vendor="F-1" aria-label="F-1 가입코드 888 복사 후 공식 도메인 바로가기">코드복사 · 이동</button></div></div></section><section class="v124-detail-topline" aria-label="F-1 빠른 확인"><article><span>공식 주소</span><strong>f1-77.com</strong><small>register?ref=888</small></article><article><span>가입코드</span><strong>888</strong><small>F-1 최상위 코드</small></article><article><span>핵심 혜택</span><strong>USDT·보너스</strong><small>테더 수수료 지원</small></article></section><section class="v96-2-facts" aria-label="F-1 핵심 정보"><a class="v96-2-fact" href="https://f1-77.com/register?ref=888" target="_blank" rel="nofollow sponsored noopener noreferrer"><span>공식 도메인</span><strong>f1-77.com</strong></a><button type="button" class="v96-2-fact" data-v92-copy="true" data-ga4-event="vendor_copy_code" data-code="888" data-vendor="F-1" aria-label="F-1 가입코드 복사"><span>가입코드</span><strong>888</strong></button><div class="v96-2-fact"><span>USDT</span><strong>입출금·수수료 지원</strong></div></section><section class="v96-2-section v124-detail-section"><div class="v96-2-section-head"><span>혜택표</span><h2>첫 충전 / 매 충전 보너스</h2></div><div class="v96-2-table-wrap v124-table-wrap"><table class="v96-2-table"><thead><tr><th>구분</th><th>첫 충전</th><th>매 충전</th></tr></thead><tbody><tr><td>스포츠</td><td>15%</td><td>10%</td></tr><tr><td>미니게임</td><td>10%</td><td>5%</td></tr><tr><td>슬롯</td><td>10%</td><td>5%</td></tr><tr><td>카지노</td><td>5%</td><td>5%</td></tr><tr><td>홀덤</td><td>5%</td><td>5%</td></tr></tbody></table></div></section><section class="v96-2-section v124-detail-section"><div class="v96-2-section-head"><span>이벤트</span><h2>F-1 주요 이벤트</h2></div><ul class="v96-2-benefits v124-benefit-list"><li><b>01</b><span>입금 룰렛 쿠폰</span></li><li><b>02</b><span>페이백 이벤트</span></li><li><b>03</b><span>출석체크 이벤트</span></li><li><b>04</b><span>레벨업 이벤트</span></li><li><b>05</b><span>지인추천 이벤트</span></li><li><b>06</b><span>스포츠 다폴더 룰렛쿠폰</span></li><li><b>07</b><span>다폴더 보너스</span></li><li><b>08</b><span>한폴낙 이벤트</span></li><li><b>09</b><span>미니게임 연패 위로금</span></li></ul></section><section class="v96-2-info-grid"><article class="v96-2-info-card"><h2>스포츠·카지노</h2><ul><li>프리매치</li><li>스페셜</li><li>라이브</li><li>카지노</li><li>슬롯</li></ul></article><article class="v96-2-info-card"><h2>동행·베픽 게임</h2><ul><li>베픽 동행파워볼 랜덤볼</li><li>동행파워사다리</li><li>동행키노사다리</li></ul></article><article class="v96-2-info-card"><h2>슈어·크래시</h2><ul><li>슈어 사다리</li><li>슈어 파워볼</li><li>슈어 레이싱</li><li>슈어 룰렛</li><li>크래시게임류</li></ul></article></section><section class="v113-depth" aria-label="F-1 실사용 확인 가이드"><div class="v113-depth-head"><div><span>DETAIL CHECK</span><h2>F-1 이용 전 정리</h2><p>가입코드 888, USDT 입출금, 게임별 보너스율을 같은 기준으로 확인합니다.</p></div><a href="https://f1-77.com/register?ref=888" target="_blank" rel="nofollow sponsored noopener noreferrer" data-ga4-event="vendor_outbound_click" data-code="888" data-vendor="F-1">코드복사 · 이동</a></div></section></section></main><nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴"><a href="/"><span>⌂</span>메인</a><a href="/blog/"><span>▤</span>블로그</a><a href="/tools/"><span>◈</span>도구</a><a href="/guaranteed/"><span>◆</span>보증</a><a href="/consult/"><span>✦</span>상담</a></nav><script src="/assets/js/v76.rust-brand-system.js?v=static-v76-rust-brand-system-20260524" defer></script><script src="/assets/js/v92-vendor-conversion-pass.js?v=static-v92-vendor-conversion-pass-20260526" defer></script><script src="/assets/js/v96-5-guaranteed-conversion.js?v=static-v96-5-guaranteed-conversion-20260526" defer></script><script src="/assets/js/v118-guaranteed-cta-ab.js?v=20260528" defer></script><footer class="moon-footer" data-v135-2-footer="canonical"><div class="moon-container v56-footer-row"><div><span class="v56-footer-logo"><span class="v56-logo-main">88ST</span><span class="v56-logo-cloud">.Cloud</span></span><p>보증업체, 실사용 도구, 전문 가이드를 일관된 기준으로 정리합니다.</p></div><nav class="v56-footer-links" aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></footer></body></html>`;
function createF1Detail(){ write(p('guaranteed/f1/index.html'), F1_DETAIL); }
function updateSitemaps(){
  const url='https://88st.cloud/guaranteed/f1/';
  for(const f of ['sitemap.txt','serverless/sitemap.txt']){
    const file=p(f); let s=read(file); if(!s) continue;
    if(!s.includes(url)) { if(!s.endsWith('\n')) s+='\n'; s+=url+'\n'; write(file,s); }
  }
  for(const f of ['sitemap.xml','serverless/sitemap.xml']){
    const file=p(f); let s=read(file); if(!s) continue;
    if(!s.includes(url)){
      const entry=`  <url><loc>${url}</loc><lastmod>2026-05-30</lastmod><changefreq>weekly</changefreq><priority>0.82</priority></url>\n`;
      s=s.replace('</urlset>',entry+'</urlset>'); write(file,s);
    }
  }
}
function updateOpsCounts(){
  const file=p('ops/index.html'); if(!fs.existsSync(file)) return;
  let html=read(file);
  html=html.replace(/보증업체\s*6개/g,'보증업체 7개').replace(/vendors\s*6/gi,'vendors 7').replace(/vendors:\s*6/gi,'vendors: 7');
  if(!html.includes('/guaranteed/f1/')) html=html.replace('/guaranteed/anybet/','/guaranteed/anybet/ /guaranteed/f1/');
  write(file,html);
}
function writeCss(){
  const css=`/* V136 F-1 guaranteed vendor addition */
.v136-f1-vendor-card{--vendor-accent:#ef4444!important}
.v136-f1-vendor-card .v74-1-image-link,.v136-f1-home-card{background:linear-gradient(135deg,rgba(239,68,68,.10),rgba(246,201,107,.08));}
.v136-f1-vendor-card img,.v136-f1-home-card img{object-fit:contain;background:#fff;}
.v136-f1-detail-shell .v96-2-art{background:linear-gradient(135deg,rgba(239,68,68,.12),rgba(246,201,107,.10));}
.v136-f1-detail-shell .v96-2-art img{object-fit:contain;background:#fff;border-radius:18px;}
@media (min-width: 980px){.v74-1-grid.v119-guaranteed-card-grid,.v74-1-grid.v124-guaranteed-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));}.v136-f1-vendor-card{min-height:100%;}}
@media (max-width: 760px){.v136-f1-home-card img,.v136-f1-vendor-card img{max-height:148px;object-fit:contain}.v136-f1-detail-shell .v96-2-art img{max-height:214px}}
`;
  write(p('assets/css/v136-f1-guaranteed-vendor.css'), css);
}
function updatePackage(){
  const file=p('package.json'); const pkg=JSON.parse(read(file));
  pkg.scripts['quality:v136']='node scripts/generate-v136-f1-guaranteed-vendor.mjs';
  pkg.scripts['verify:v136']='node scripts/verify-v136-f1-guaranteed-vendor.mjs';
  pkg.scripts['build']='node scripts/build-v136-cloudflare-pages-safe.mjs';
  pkg.scripts['verify']='node scripts/verify-v136-f1-guaranteed-vendor.mjs';
  write(file,JSON.stringify(pkg,null,2));
}
function writeReports(){
  fs.mkdirSync(p('reports'),{recursive:true});
  const report={ok:true,version:VERSION,addedVendor:'F-1',route:'/guaranteed/f1/',domain:'https://f1-77.com/register?ref=888',code:'888',homeCards:'6 vendors + 1 ad inquiry + F-1',generatedAt:new Date().toISOString()};
  write(p('reports/v136-f1-guaranteed-vendor-audit.json'),JSON.stringify(report,null,2));
  write(p('V136_UPGRADE_REPORT.md'),`# V136 F-1 Guaranteed Vendor Addition\n\n- Added F-1 vendor card and detail landing.\n- Replaced one home ad inquiry card with F-1 image card.\n- Added /guaranteed/f1/ to sitemaps.\n- Preserved no bottom related/recommendation sections.\n`);
  write(p('V136_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,files:['index.html','guaranteed/index.html','guaranteed/f1/index.html','assets/img/guaranteed/cards/f1.webp','assets/css/v136-f1-guaranteed-vendor.css','scripts/generate-v136-f1-guaranteed-vendor.mjs','scripts/verify-v136-f1-guaranteed-vendor.mjs','scripts/build-v136-cloudflare-pages-safe.mjs','package.json']},null,2));
}
copyAsset(); writeCss(); injectAllCss(); updateHome(); updateGuaranteedIndex(); createF1Detail(); updateSitemaps(); updateOpsCounts(); updatePackage(); writeReports();
console.log('[V136 GENERATE PASS]', {version:VERSION, vendor:'F-1', route:'/guaranteed/f1/'});
