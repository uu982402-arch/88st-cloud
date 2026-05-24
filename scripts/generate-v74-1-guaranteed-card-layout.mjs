import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V74_1_GUARANTEED_CARD_LAYOUT_ACTIVE';
const HUB = path.join(ROOT, 'guaranteed', 'index.html');
const IMG_DIR = path.join(ROOT, 'assets', 'img', 'guaranteed', 'cards');

const vendors = [
  {
    id: 'sk-holdings',
    name: 'SK 홀딩스',
    code: 'IRON888',
    domain: 'snk-99.com',
    detail: '/guaranteed/sk-holdings/',
    detailFile: 'sk-holdings',
    official: 'https://snk-99.com/',
    image: '/assets/img/guaranteed/cards/sk-holdings.svg',
    imageTitle: 'SK HOLDINGS',
    glow: '#67E8F9',
    theme: '#67E8F9'
  },
  {
    id: 'queenbee',
    name: '여왕벌',
    code: 'SEOA',
    domain: 'qb-700.com',
    detail: '/guaranteed/queenbee/',
    detailFile: 'queenbee',
    official: 'https://qb-700.com/?code=seoa',
    image: '/assets/img/guaranteed/cards/queenbee.svg',
    imageTitle: 'QUEEN BEE',
    glow: '#F6C96B',
    theme: '#F6C96B'
  },
  {
    id: 'anybet',
    name: 'ANY BET',
    code: 'SEOA',
    domain: 'any-777.com',
    detail: '/guaranteed/anybet/',
    detailFile: 'anybet',
    official: 'https://any-777.com/',
    image: '/assets/img/guaranteed/cards/anybet.svg',
    imageTitle: 'ANY BET',
    glow: '#A78BFA',
    theme: '#A78BFA'
  },
  {
    id: 'udt',
    name: 'UDT BET',
    code: 'SEOA',
    domain: 'udt-01.com',
    detail: '/guaranteed/udt/',
    detailFile: 'udt',
    official: 'https://udt-01.com/',
    image: '/assets/img/guaranteed/cards/udt-bet.svg',
    imageTitle: 'UDT BET',
    glow: '#10B981',
    theme: '#10B981'
  },
  {
    id: 'ddangkong',
    name: '땅콩 BET',
    code: 'DDK888',
    domain: 'ddk-2024.com',
    detail: '/guaranteed/ddangkong/',
    detailFile: 'ddangkong',
    official: 'https://ddk-2024.com/',
    image: '/assets/img/guaranteed/cards/ddangkong-bet.svg',
    imageTitle: 'DDANGKONG BET',
    glow: '#FB7185',
    theme: '#FB7185'
  }
];

function esc(value){
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgFor(vendor){
  const title = esc(vendor.imageTitle);
  const name = esc(vendor.name);
  const color = vendor.theme;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-labelledby="title desc">
  <title id="title">${name} 카드 이미지 플레이스홀더</title>
  <desc id="desc">추후 실제 보증업체 이미지로 교체할 수 있는 ${name} 공통 이미지 경로입니다.</desc>
  <defs>
    <radialGradient id="g1" cx="26%" cy="14%" r="80%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.54"/>
      <stop offset="42%" stop-color="${color}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#0B0F19" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="line" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#F6C96B" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="${color}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.18"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="960" height="540" rx="56" fill="#0B0F19"/>
  <rect x="1" y="1" width="958" height="538" rx="55" fill="url(#g1)"/>
  <circle cx="738" cy="82" r="140" fill="${color}" opacity="0.12" filter="url(#blur)"/>
  <circle cx="132" cy="442" r="188" fill="#F6C96B" opacity="0.08" filter="url(#blur)"/>
  <rect x="32" y="32" width="896" height="476" rx="42" fill="rgba(255,255,255,0.045)" stroke="url(#line)" stroke-width="2"/>
  <text x="480" y="256" text-anchor="middle" font-family="Inter, Apple SD Gothic Neo, Noto Sans KR, Arial, sans-serif" font-size="72" font-weight="900" fill="#F8FAFC" letter-spacing="-3">${title}</text>
  <text x="480" y="314" text-anchor="middle" font-family="Inter, Apple SD Gothic Neo, Noto Sans KR, Arial, sans-serif" font-size="22" font-weight="800" fill="rgba(248,250,252,0.72)" letter-spacing="5">88ST GUARANTEED PARTNER</text>
</svg>`;
}

function ensureImages(){
  fs.mkdirSync(IMG_DIR, {recursive:true});
  for (const vendor of vendors){
    fs.writeFileSync(path.join(ROOT, vendor.image.replace(/^\//, '')), svgFor(vendor), 'utf8');
  }
}

function card(vendor){
  return `<article class="v74-1-vendor-card" data-vendor="${esc(vendor.id)}" style="--vendor-accent:${esc(vendor.theme)}">
  <a class="v74-1-image-link" href="${esc(vendor.detail)}" aria-label="${esc(vendor.name)} 상세보기">
    <img src="${esc(vendor.image)}" alt="${esc(vendor.name)} 보증업체 카드 이미지" loading="lazy" decoding="async" width="960" height="540">
  </a>
  <div class="v74-1-card-body">
    <div class="v74-1-name-row">
      <h2>${esc(vendor.name)}</h2>
      <span>Premium</span>
    </div>
    <div class="v74-1-info-grid" aria-label="${esc(vendor.name)} 핵심 정보">
      <div><small>보증 상태</small><b>상담 확인</b></div>
      <div><small>가입코드</small><code>${esc(vendor.code)}</code></div>
    </div>
    <div class="v74-1-actions">
      <a class="v74-1-btn v74-1-btn--detail" href="${esc(vendor.detail)}">상세보기</a>
      <button class="v74-1-btn v74-1-btn--go" type="button" data-v74-go="true" data-code="${esc(vendor.code)}" data-href="${esc(vendor.official)}" data-vendor="${esc(vendor.name)}">바로가기</button>
    </div>
  </div>
</article>`;
}

function generateHub(){
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>보증업체 | 88ST.Cloud</title>
  <meta name="description" content="88ST.Cloud 보증업체 큐레이션. SK 홀딩스, 여왕벌, ANY BET, UDT BET, 땅콩 BET의 보증 상태, 가입코드, 상세 랜딩, 공식주소를 빠르게 확인합니다.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0B0F19">
  <link rel="canonical" href="https://88st.cloud/guaranteed/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/v74.guaranteed-cro.css?v=20260524" data-v74-guaranteed="true">
  <link rel="stylesheet" href="/assets/css/v74-1.guaranteed-card-layout.css?v=20260524" data-v74-1-guaranteed="true">
</head>
<body class="v74-guaranteed-cro v74-1-guaranteed-layout" data-v74-page="guaranteed" data-v74-1-marker="${VERSION}">
  <header class="v74-header">
    <div class="v74-shell v74-header__inner">
      <a class="v74-brand" href="/" aria-label="88ST.Cloud 메인으로 이동">
        <span class="v74-brand__mark">88</span>
        <span>88ST.Cloud</span>
      </a>
      <nav class="v74-nav" aria-label="주요 메뉴">
        <a href="/">메인</a>
        <a href="/blog/">블로그</a>
        <a href="/tools/">도구</a>
        <a href="/guaranteed/" aria-current="page">보증업체</a>
        <a href="/consult/">상담</a>
      </nav>
      <a class="v74-header__cta" href="/consult/">자동 상담 시작</a>
    </div>
  </header>

  <main class="v74-1-main">
    <section class="v74-shell v74-1-grid" aria-label="보증업체 카드 대시보드">
      ${vendors.map(card).join('\n      ')}
    </section>

    <section class="v74-shell v74-1-bridge" aria-label="상담센터 연결">
      <div>
        <b>바로가기 클릭 시 가입코드가 먼저 복사됩니다.</b>
        <span>상세보기에서는 같은 카드 이미지를 사용하도록 경로를 통일했습니다. 나중에 이미지만 교체하면 허브와 상세 랜딩이 함께 맞춰집니다.</span>
      </div>
      <a href="https://t.me/TRS999_bot" target="_blank" rel="noopener noreferrer">@TRS999_bot 상담</a>
    </section>
  </main>

  <a class="v74-fab" href="https://t.me/TRS999_bot" target="_blank" rel="noopener noreferrer" aria-label="텔레그램 상담 연결"><span>✦</span><b>상담</b></a>

  <nav class="v74-mobile-nav" aria-label="모바일 하단 내비게이션">
    <a href="/"><span>⌂</span>메인</a>
    <a href="/blog/"><span>▤</span>블로그</a>
    <a href="/tools/"><span>◇</span>도구</a>
    <a href="/guaranteed/" aria-current="page"><span>◆</span>보증</a>
    <a href="/consult/"><span>✦</span>상담</a>
  </nav>

  <footer class="v74-footer">
    <div class="v74-shell v74-footer__inner">
      <div><b>88ST.Cloud</b><br>보증업체 큐레이션, 분석 도구, 블로그 가이드, 자동 상담을 연결하는 정보 플랫폼입니다.</div>
      <nav aria-label="하단 메뉴">
        <a href="/blog/">블로그</a>
        <a href="/tools/">도구</a>
        <a href="/guaranteed/">보증업체</a>
        <a href="/consult/">상담</a>
      </nav>
    </div>
  </footer>

  <div class="v74-toast" data-v74-toast role="status" aria-live="polite">가입코드가 자동 복사되었습니다!</div>
  <script src="/assets/js/v74.guaranteed-cro.js?v=20260524" defer data-v74-guaranteed="true"></script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(HUB), {recursive:true});
  fs.writeFileSync(HUB, html, 'utf8');
}

function updateDetailPages(){
  for (const vendor of vendors){
    const detailPath = path.join(ROOT, 'guaranteed', vendor.detailFile, 'index.html');
    if (!fs.existsSync(detailPath)) continue;
    let html = fs.readFileSync(detailPath, 'utf8');
    const imageAbs = `https://88st.cloud${vendor.image}`;
    html = html.replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="${imageAbs}"/>`);
    html = html.replace(/<link rel="preload" as="image" href="[^"]*"\/>/, `<link rel="preload" as="image" href="${vendor.image}"/>`);
    html = html.replace(/<img src="[^"]*" alt="[^"]* 대표 이미지" loading="eager" decoding="async" width="960" height="360"\/>/, `<img src="${vendor.image}" alt="${vendor.name} 보증업체 카드 이미지" loading="eager" decoding="async" width="960" height="540" data-guaranteed-card-image="${vendor.id}"/>`);
    if (!html.includes('data-guaranteed-card-image')) {
      html = html.replace(/(<div class="v54-visual-card">\s*)<img[^>]+>/, `$1<img src="${vendor.image}" alt="${vendor.name} 보증업체 카드 이미지" loading="eager" decoding="async" width="960" height="540" data-guaranteed-card-image="${vendor.id}"/>`);
    }
    if (!html.includes('v74-1-detail-image-map')) {
      html = html.replace('</head>', `<meta name="v74-1-detail-image-map" content="${vendor.image}"></head>`);
    }
    fs.writeFileSync(detailPath, html, 'utf8');
  }
}

function updatePackage(){
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const cmd = 'node scripts/generate-v74-1-guaranteed-card-layout.mjs';
  if (!pkg.scripts.build.includes(cmd)) {
    if (pkg.scripts.build.includes('node scripts/generate-v74-guaranteed-cro.mjs && node scripts/gen-build-ver.mjs')) {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v74-guaranteed-cro.mjs && node scripts/gen-build-ver.mjs', `node scripts/generate-v74-guaranteed-cro.mjs && ${cmd} && node scripts/gen-build-ver.mjs`);
    } else {
      pkg.scripts.build = pkg.scripts.build.replace(' && node scripts/gen-build-ver.mjs', ` && ${cmd} && node scripts/gen-build-ver.mjs`);
    }
  }
  pkg.scripts.verify = 'node scripts/verify-v74-1-guaranteed-card-layout.mjs';
  pkg.scripts['quality:v74-1'] = cmd;
  pkg.scripts['verify:v74-1'] = 'node scripts/verify-v74-1-guaranteed-card-layout.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

ensureImages();
generateHub();
updateDetailPages();
updatePackage();
console.log(`[V74-1] guaranteed compact card layout generated: vendors=${vendors.length} marker=${VERSION}`);
