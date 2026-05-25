import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const VERSION = 'V96_ZAKUM_AD_ACTIVE';
const stamp = 'static-v96-zakum-ad-20260526';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), data); };
const exists = (p) => fs.existsSync(path.join(root, p));

const vendors = [
  { slug:'sk-holdings', name:'SK 홀딩스', code:'IRON888', detail:'/guaranteed/sk-holdings/', href:'https://snk-99.com/', img:'/assets/img/guaranteed/cards/sk-holdings.webp', accent:'#67E8F9', imageKey:'sk-holdings' },
  { slug:'zakum', name:'자쿰', code:'zk888', detail:'/guaranteed/zakum/', href:'https://zk-777.com/?code=zk888', img:'/assets/img/guaranteed/cards/zakum.webp', fallback:'/assets/img/guaranteed/cards/zakum.svg', accent:'#f6c96b', imageKey:'zakum' },
  { slug:'udt', name:'UDT BET', code:'SEOA', detail:'/guaranteed/udt/', href:'https://udt-01.com/', img:'/assets/img/guaranteed/cards/udt-bet.webp', accent:'#10B981', imageKey:'udt' },
  { slug:'queenbee', name:'여왕벌', code:'SEOA', detail:'/guaranteed/queenbee/', href:'https://qb-700.com/?code=seoa', img:'/assets/img/guaranteed/cards/queenbee.webp', accent:'#F6C96B', imageKey:'queenbee' },
  { slug:'ddangkong', name:'땅콩 BET', code:'DDK888', detail:'/guaranteed/ddangkong/', href:'https://ddk-2024.com/', img:'/assets/img/guaranteed/cards/ddangkong-bet.webp', accent:'#FB7185', imageKey:'ddangkong' },
  { slug:'anybet', name:'ANY BET', code:'SEOA', detail:'/guaranteed/anybet/', href:'https://any-777.com/', img:'/assets/img/guaranteed/cards/anybet.webp', accent:'#A78BFA', imageKey:'anybet' }
];

function ensureHead(html, extra) {
  if (html.includes('data-v96-zakum-ad="true"')) return html;
  return html.replace('</head>', `${extra}\n</head>`);
}
function markBody(html) {
  return html.replace(/<body([^>]*)>/, (m, attrs) => {
    let next = attrs;
    if (!/data-v96-zakum-ad=/.test(next)) next += ` data-v96-zakum-ad="${VERSION}"`;
    if (/class="/.test(next)) next = next.replace(/class="([^"]*)"/, (mm, cls) => `class="${cls} v96-zakum-ad-active"`);
    else next += ' class="v96-zakum-ad-active"';
    return `<body${next}>`;
  });
}
function imageSrc(v) {
  const rel = v.img.replace(/^\//,'');
  if (exists(rel)) return v.img;
  if (v.fallback && exists(v.fallback.replace(/^\//,''))) return v.fallback;
  return v.img;
}
function renderPartnerCard(v, i, eager=false) {
  const loading = eager ? 'eager' : 'lazy';
  const priority = eager ? ' fetchpriority="high"' : ' fetchpriority="low"';
  return `<a class="v71-partner-card v71-glow-border" href="/guaranteed/" aria-label="${v.name} 보증업체 보기"><img src="${imageSrc(v)}" alt="${v.name} 보증업체 카드 이미지" loading="${loading}" decoding="async" width="960" height="540"${priority} data-v92-card-image="${v.imageKey}"></a>`;
}
function renderVendorCard(v, i) {
  const eager = i === 0;
  return `<article class="v74-1-vendor-card" data-vendor="${v.slug}" style="--vendor-accent:${v.accent}">
  <a class="v74-1-image-link" href="${v.detail}" aria-label="${v.name} 상세보기">
    <img src="${imageSrc(v)}" alt="${v.name} 보증업체 카드 이미지" loading="${eager ? 'eager':'lazy'}" decoding="async" width="960" height="540"${eager ? ' fetchpriority="high"':' fetchpriority="low"'} data-v92-card-image="${v.imageKey}">
  </a>
  <div class="v74-1-card-body">
    <div class="v74-1-name-row">
      <h2>${v.name}</h2>
      <span>Premium</span>
    </div>
    <div class="v74-1-info-grid" aria-label="${v.name} 핵심 정보">
      <div><small>보증 상태</small><b>상담 확인</b></div>
      <div><small>가입코드</small><code>${v.code}</code></div>
    </div>
    <div class="v74-1-actions">
      <a class="v74-1-btn v74-1-btn--detail" href="${v.detail}" data-v92-detail="true" data-ga4-event="vendor_detail_click" data-vendor="${v.name}" aria-label="${v.name} 상세보기">상세보기</a>
      <button class="v74-1-btn v74-1-btn--go" type="button" data-v74-go="true" data-v92-go="true" data-ga4-event="vendor_outbound_click" data-code="${v.code}" data-href="${v.href}" data-vendor="${v.name}" aria-label="${v.name} 가입코드 ${v.code} 복사 후 바로가기">바로가기</button>
    </div>
  </div>
</article>`;
}
function injectV96Assets(html) {
  return ensureHead(html, `  <meta name="v96-zakum-ad" content="${VERSION}">
  <link rel="stylesheet" href="/assets/css/v96-zakum-ad.css?v=${stamp}" data-v96-zakum-ad="true">`);
}
function updateMain() {
  let html = read('index.html');
  html = injectV96Assets(html);
  html = markBody(html);
  const cards = vendors.map((v,i)=>renderPartnerCard(v,i,i===0)).join('');
  html = html.replace(/(<div class="v71-partner-carousel"[^>]*>)[\s\S]*?(\s*<\/div>\s*<\/section>)/, `$1\n          ${cards}\n        $2`);
  html = html.replace(/(<div class="v71-partner-tile-grid">)[\s\S]*?(\s*<\/div>\s*<\/aside>)/, `$1\n            ${cards}\n          $2`);
  html = html.replace(/<strong>5<\/strong><span>프리미엄 파트너<\/span>/g, '<strong>6</strong><span>프리미엄 파트너</span>');
  html = html.replace(/<link rel="preload" as="image" href="\/assets\/img\/partners\/v71-sk-holdings\.webp">/, '<link rel="preload" as="image" href="/assets/img/guaranteed/cards/sk-holdings.webp">');
  write('index.html', html);
}
function updateGuaranteedIndex() {
  let html = read('guaranteed/index.html');
  html = injectV96Assets(html);
  html = markBody(html);
  html = html.replace(/SK 홀딩스, 여왕벌, ANY BET, UDT BET, 땅콩 BET/g, 'SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET');
  const cardHtml = vendors.map((v,i)=>renderVendorCard(v,i)).join('\n      ');
  html = html.replace(/(<section class="v74-shell v74-1-grid"[^>]*>)[\s\S]*?(\s*<\/section>\s*\n\s*<section class="v74-shell v74-1-bridge")/, `$1\n      ${cardHtml}\n    $2`);
  html = html.replace(/바로가기 클릭 시 가입코드가 먼저 복사됩니다\./g, '6개 보증업체 카드에서 바로가기 클릭 시 가입코드가 먼저 복사됩니다.');
  write('guaranteed/index.html', html);
}
function commonRustHeader(active='guaranteed') {
  const links = [
    ['/', '메인', 'main'], ['/blog/', '블로그', 'blog'], ['/tools/', '도구', 'tools'], ['/guaranteed/', '보증', 'guaranteed'], ['/consult/', '상담', 'consult']
  ];
  return `<header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true">
  <div class="rust-header-inner">
    <a class="rust-brand-lockup" href="/" aria-label="RUST 홈"><span class="rust-brand-mark"><img src="/assets/img/rust/rust-crest-32.png" alt="" width="32" height="32" loading="eager" decoding="async"></span><span class="rust-brand-text"><b>RUST</b><small>by 88ST</small></span></a>
    <nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴" data-rust-nav="desktop">${links.map(([href,label,key])=>`<a href="${href}"${key===active?' aria-current="page"':''}>${label}</a>`).join('')}</nav>
    <button class="rust-menu-toggle" type="button" aria-label="모바일 메뉴 열기" data-rust-menu-toggle="true"><span></span><span></span></button>
  </div>
  <nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴" data-rust-nav="mobile-menu">${links.map(([href,label,key])=>`<a href="${href}"${key===active?' aria-current="page"':''}>${label}</a>`).join('')}</nav>
</header>`;
}
function bottomNav(active='guaranteed') {
  const links = [['/','⌂','메인','main'],['/blog/','▤','블로그','blog'],['/tools/','◈','도구','tools'],['/guaranteed/','◆','보증','guaranteed'],['/consult/','✦','상담','consult']];
  return `<nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴" data-rust-nav="bottom">${links.map(([href,icon,label,key])=>`<a href="${href}"${key===active?' aria-current="page"':''}><span>${icon}</span>${label}</a>`).join('')}</nav>`;
}
function zakumLanding() {
  const v = vendors.find(x=>x.slug==='zakum');
  const head = `<!DOCTYPE html><html lang="ko" data-v96-zakum-ad="active"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>자쿰 보증업체 | 가입코드 zk888 및 이벤트 안내</title>
  <meta name="description" content="자쿰 보증업체 상세 페이지입니다. 도메인 zk-777.com, 가입코드 zk888, USDT 기반 시스템과 스포츠·미니게임·슬롯·카지노 이벤트 조건을 확인합니다.">
  <meta name="keywords" content="자쿰, 자쿰 보증업체, zk888, 자쿰 가입코드, 토토사이트추천, 입플사이트추천, 스포츠입플, 카지노입플, 미니게임입플사이트, RUST">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="https://88st.cloud/guaranteed/zakum/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="RUST by 88ST">
  <meta property="og:title" content="자쿰 보증업체 | 가입코드 zk888">
  <meta property="og:description" content="자쿰 도메인, 가입코드, 신규회원 이벤트, 스포츠·카지노·슬롯 조건을 RUST 기준으로 정리합니다.">
  <meta property="og:url" content="https://88st.cloud/guaranteed/zakum/">
  <meta property="og:image" content="https://88st.cloud/assets/img/guaranteed/cards/zakum.webp">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/rust/rust-crest-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="preload" as="image" href="/assets/img/guaranteed/cards/zakum.webp">
  <link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true">
  <link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true">
  <link rel="stylesheet" href="/assets/css/v54.vendor-landing.css?v=static-growth-conversion-v51-20260522">
  <link rel="stylesheet" href="/assets/css/v78.guaranteed-card-images.css?v=static-v78-1-guaranteed-card-images-asset-restore-20260525" data-v78-guaranteed-images="true">
  <link rel="stylesheet" href="/assets/css/v92-vendor-conversion-pass.css?v=static-v92-vendor-conversion-pass-20260526" data-v92-vendor-conversion="true">
  <meta name="v96-zakum-ad" content="${VERSION}">
  <link rel="stylesheet" href="/assets/css/v96-zakum-ad.css?v=${stamp}" data-v96-zakum-ad="true">
  <script type="application/ld+json" data-rust-schema="v96">${JSON.stringify({
    '@context':'https://schema.org', '@graph':[{
      '@type':'Organization','@id':'https://88st.cloud/#organization','name':'RUST by 88ST','url':'https://88st.cloud/','logo':'https://88st.cloud/assets/img/rust/rust-crest-192.png'
    },{
      '@type':'WebPage','@id':'https://88st.cloud/guaranteed/zakum/#webpage','url':'https://88st.cloud/guaranteed/zakum/','name':'자쿰 보증업체 | 가입코드 zk888','description':'자쿰 도메인, 가입코드, 신규회원 이벤트, 스포츠·카지노·슬롯 조건을 RUST 기준으로 정리합니다.','isPartOf':{'@id':'https://88st.cloud/#website'},'inLanguage':'ko-KR'
    },{
      '@type':'BreadcrumbList','@id':'https://88st.cloud/guaranteed/zakum/#breadcrumb','itemListElement':[{'@type':'ListItem','position':1,'name':'홈','item':'https://88st.cloud/'},{'@type':'ListItem','position':2,'name':'보증업체','item':'https://88st.cloud/guaranteed/'},{'@type':'ListItem','position':3,'name':'자쿰','item':'https://88st.cloud/guaranteed/zakum/'}]
    }]
  })}</script>
</head>`;
  return `${head}<body class="rust-brand-system v54-vendor-detail v92-vendor-conversion-active v96-zakum-ad-active" data-v96-zakum-ad="${VERSION}" data-v92-vendor-conversion-pass="V92_VENDOR_CONVERSION_PASS_ACTIVE">
${commonRustHeader('guaranteed')}
<main id="mainContent" class="v54-vendor-shell v96-zakum-detail">
  <section class="moon-container v49-vendor-landing v54-vendor-page">
    <nav class="v54-breadcrumb" aria-label="현재 위치"><a href="/guaranteed/">보증업체</a><span>/</span><strong>자쿰</strong></nav>
    <section class="v54-hero-card v96-zakum-hero">
      <div class="v54-visual-card"><img src="${imageSrc(v)}" alt="자쿰 보증업체 카드 이미지" loading="eager" decoding="async" width="960" height="540" fetchpriority="high" data-v92-detail-image="zakum"></div>
      <div class="v54-hero-copy"><span class="v54-eyebrow">ZAKUM GUARANTEED</span><h1>자쿰 보증업체 혜택 안내</h1><p>테더(USDT) 기반 시스템과 신규회원 전용 이벤트, 스포츠·미니게임·슬롯·카지노 혜택을 한 화면에서 확인할 수 있는 자쿰 전용 랜딩페이지입니다.</p><div class="v54-hero-actions"><a class="v54-btn v54-btn-ghost" href="/guaranteed/">전체 카드 보기</a><a class="v54-btn v54-btn-primary" href="${v.href}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v92-go="true" data-ga4-event="vendor_outbound_click" data-code="${v.code}" data-href="${v.href}" data-vendor="자쿰" aria-label="자쿰 가입코드 zk888 복사 후 공식 도메인 바로가기">공식 도메인 바로가기</a></div></div>
    </section>
    <section class="v54-fact-strip" aria-label="자쿰 핵심 정보"><a class="v54-fact" href="${v.href}" target="_blank" rel="nofollow sponsored noopener noreferrer"><span>공식 도메인</span><strong>zk-777.com</strong></a><button type="button" class="v54-fact v54-code-copy" data-v92-copy="true" data-ga4-event="vendor_copy_code" data-code="${v.code}" data-vendor="자쿰" aria-label="자쿰 가입코드 zk888 복사"><span>가입코드</span><strong>${v.code}</strong></button><div class="v54-fact"><span>시스템</span><strong>USDT 기반</strong></div></section>
    <section class="v54-section"><div class="v54-section-head"><span>NEW MEMBER EVENT</span><h2>자쿰 신규회원 전용 이벤트</h2></div><ul class="v54-benefit-grid"><li><b>01</b><span>신규회원 스포츠 첫충전 40%</span></li><li><b>02</b><span>신규회원 입플 5+3 · 10+5 · 50+20 · 100+35 · 200+70</span></li><li><b>03</b><span>이사 지원금 이벤트</span></li><li><b>04</b><span>신규정착 이벤트</span></li><li><b>05</b><span>스포츠 첫충 15%</span></li><li><b>06</b><span>미니게임 첫충 5%</span></li><li><b>07</b><span>슬롯 첫충 10% · 매충 7%</span></li><li><b>08</b><span>돌발: 스포츠 20% · 미니게임 10% · 카지노 1% 콤프 · 슬롯 10%</span></li></ul></section>
    <section class="v54-info-grid"><article class="v54-info-card"><h2>주요 이벤트</h2><ul><li>페이백 이벤트</li><li>연속출석 이벤트</li><li>월급날 이벤트</li><li>위로금 이벤트</li><li>생일 이벤트</li><li>간식 & 야식 이벤트</li><li>리뷰작성 이벤트</li><li>레벨UP 이벤트</li><li>지인추천 이벤트</li><li>누적 충전금 이벤트</li><li>충전왕 이벤트</li><li>텔레그램 채널 돌발 쿠폰 이벤트</li></ul></article><article class="v54-info-card"><h2>스포츠 전용 이벤트</h2><ul><li>신규회원 첫충전 이벤트</li><li>스포츠 대박 패키지 이벤트</li><li>스포츠 무제한 입플 이벤트</li><li>초대박 콤프 이벤트</li><li>농구 시리즈 이벤트</li></ul></article><article class="v54-info-card"><h2>카지노·슬롯 전용 이벤트</h2><ul><li>카지노 1% 콤프 적용</li><li>슬롯 프리스핀 이벤트</li><li>슬롯왕 이벤트</li><li>슬롯 잭팟 이벤트</li><li>슬롯 당일 페이백 이벤트</li><li>카지노 당일 페이백 이벤트</li><li>카지노 연승연패 이벤트</li><li>카지노&슬롯 무제한 입플 이벤트</li></ul></article></section>
    <section class="v54-section"><div class="v54-section-head"><span>CHECK TABLE</span><h2>조건 확인표</h2></div><div class="v54-table-wrap"><table><thead><tr><th>구분</th><th>확인 항목</th><th>운영 메모</th></tr></thead><tbody><tr><td>공식 도메인</td><td>zk-777.com</td><td>카드와 상세 랜딩에 표기된 도메인 기준으로 확인합니다.</td></tr><tr><td>가입코드</td><td>zk888</td><td>바로가기 클릭 시 코드가 먼저 복사되도록 구성했습니다.</td></tr><tr><td>게임 범위</td><td>카지노 금지게임 없음</td><td>모든 게임은 공지와 상담 답변 기준으로 조건을 확인합니다.</td></tr><tr><td>주의 항목</td><td>시간차·배당 하락·양방 배팅·VPN</td><td>불이익 방지를 위해 이용 전 조건과 접속 환경을 먼저 확인합니다.</td></tr></tbody></table></div></section>
    <section class="v54-contact-card"><div><span>COMMON CENTER</span><h2>공통 확인 채널</h2><p>자쿰 코드 적용, 이벤트 조건, 공식주소 변경 여부는 최신 업체 공지와 상담 답변 기준으로 확인합니다. 공통 연결 기준은 <a href="https://t.me/TRS999_bot?start=zakum" target="_blank" rel="nofollow noopener noreferrer">@TRS999_bot</a> 입니다.</p></div><a class="v54-btn v54-btn-primary" href="https://t.me/TRS999_bot?start=zakum" target="_blank" rel="nofollow noopener noreferrer" data-ga4-event="telegram_open">상담센터 연결</a></section>
    <section class="v54-neighbors"><h2>다른 보증업체 보기</h2><div>${vendors.filter(x=>x.slug!=='zakum').map(x=>`<a href="${x.detail}">${x.name}</a>`).join('')}</div></section>
  </section>
</main>
${bottomNav('guaranteed')}
<script src="/assets/js/v76.rust-brand-system.js?v=static-v76-rust-brand-system-20260524" defer data-v76-rust="true"></script>
<script src="/assets/js/v77.rust-logo-assets.js?v=static-v77-rust-logo-assets-20260524" defer data-v77-rust-logo="true"></script>
<script src="/assets/js/v92-vendor-conversion-pass.js?v=static-v92-vendor-conversion-pass-20260526" defer data-v92-vendor-conversion="true"></script>
<script src="/assets/js/v89.ga4-event-depth.js?v=static-v89-ga4-event-depth-20260526" defer data-v89-ga4-depth="true"></script>
</body></html>`;
}
function updateExistingVendorNeighbors() {
  for (const v of vendors.filter(x=>x.slug!=='zakum')) {
    const p = `${v.detail.replace(/^\//,'')}index.html`;
    if (!exists(p)) continue;
    let html = read(p);
    html = injectV96Assets(html);
    if (!html.includes('/guaranteed/zakum/')) {
      html = html.replace(/(<section class="v54-neighbors"><h2>다른 보증업체 보기<\/h2><div>)([\s\S]*?)(<\/div><\/section>)/, (m, a, links, c) => `${a}${links}<a href="/guaranteed/zakum/">자쿰</a>${c}`);
    }
    write(p, html);
  }
}
function updateSitemap() {
  const url = 'https://88st.cloud/guaranteed/zakum/';
  if (exists('sitemap.txt')) {
    let txt = read('sitemap.txt');
    if (!txt.includes(url)) {
      const lines = txt.trim().split(/\r?\n/);
      const idx = lines.findIndex(x=>x.includes('https://88st.cloud/guaranteed/'));
      lines.splice(idx >= 0 ? idx + 1 : lines.length, 0, url);
      txt = lines.join('\n') + '\n';
      write('sitemap.txt', txt);
    }
  }
  if (exists('sitemap.xml')) {
    let xml = read('sitemap.xml');
    if (!xml.includes(url)) {
      const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-05-26</lastmod>\n  </url>\n`;
      xml = xml.replace('</urlset>', `${entry}</urlset>`);
      write('sitemap.xml', xml);
    }
  }
}
function writeData() {
  write('assets/data/v96-zakum-ad.json', JSON.stringify({ version: VERSION, generatedAt: new Date().toISOString(), vendorCount: vendors.length, order: vendors.map(v=>v.name), zakum: vendors.find(v=>v.slug==='zakum') }, null, 2));
}

function updatePackageScripts() {
  const p = 'package.json';
  if (!exists(p)) return;
  const pkg = JSON.parse(read(p));
  const gen = 'node scripts/generate-v96-zakum-ad.mjs';
  const parts = String(pkg.scripts.build || '').split('&&').map(x => x.trim()).filter(Boolean).filter(x => x !== gen);
  parts.push(gen);
  pkg.scripts.build = parts.join(' && ');
  pkg.scripts.verify = 'node scripts/verify-v96-zakum-ad.mjs';
  pkg.scripts['quality:v96'] = gen;
  pkg.scripts['verify:v96'] = 'node scripts/verify-v96-zakum-ad.mjs';
  write(p, JSON.stringify(pkg, null, 2) + '\n');
}

function main() {
  updateMain();
  updateGuaranteedIndex();
  write('guaranteed/zakum/index.html', zakumLanding());
  updateExistingVendorNeighbors();
  updateSitemap();
  writeData();
  updatePackageScripts();
  console.log(`[V96] Zakum ad applied. vendors=${vendors.length}`);
}
main();
