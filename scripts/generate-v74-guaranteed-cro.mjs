import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'guaranteed', 'index.html');
const VERSION = 'V74_GUARANTEED_CRO_ACTIVE';

const vendors = [
  {
    id: 'sk-holdings',
    name: 'SK 홀딩스',
    code: 'IRON888',
    domain: 'snk-99.com',
    detail: '/guaranteed/sk-holdings/',
    official: 'https://snk-99.com/',
    glow: 'rgba(103,232,249,.17)',
    placeholder: 'SK HOLDINGS',
    benefits: ['스포츠 첫 충전 10%', '미니게임 10% · 슬롯 20%', '주간 페이백 · 룰렛 쿠폰']
  },
  {
    id: 'queenbee',
    name: '여왕벌',
    code: 'SEOA',
    domain: 'qb-700.com',
    detail: '/guaranteed/queenbee/',
    official: 'https://qb-700.com/?code=seoa',
    glow: 'rgba(246,201,107,.20)',
    placeholder: 'QUEEN BEE',
    benefits: ['USDT 수수료 지원', '프리미엄 룰렛 쿠폰', '코드 기준 공식 상담']
  },
  {
    id: 'anybet',
    name: 'ANY BET',
    code: 'SEOA',
    domain: 'any-777.com',
    detail: '/guaranteed/anybet/',
    official: 'https://any-777.com/',
    glow: 'rgba(167,139,250,.18)',
    placeholder: 'ANY BET',
    benefits: ['원화 스포츠 첫충 40%', '원화 슬롯 첫충 20%', '테더 입금 수수료 지원']
  },
  {
    id: 'udt',
    name: 'UDT BET',
    code: 'SEOA',
    domain: 'udt-01.com',
    detail: '/guaranteed/udt/',
    official: 'https://udt-01.com/',
    glow: 'rgba(16,185,129,.19)',
    placeholder: 'UDT BET',
    benefits: ['신규 첫충 10%', '슬롯 첫충·매충 20%', '주간 페이백 5%']
  },
  {
    id: 'ddangkong',
    name: '땅콩 BET',
    code: 'DDK888',
    domain: 'ddk-2024.com',
    detail: '/guaranteed/ddangkong/',
    official: 'https://ddk-2024.com/',
    glow: 'rgba(251,113,133,.18)',
    placeholder: 'DDANGKONG',
    benefits: ['공식 도메인 확인', '가입코드 ddk888', '이벤트 조건 확인']
  }
];

function esc(value){
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function vendorCard(vendor){
  const benefits = vendor.benefits.map(item => `<li>${esc(item)}</li>`).join('');
  return `<article class="v74-vendor-card" data-vendor="${esc(vendor.id)}" style="--vendor-glow:${esc(vendor.glow)}">
  <div class="v74-card-inner">
    <div class="v74-placeholder" aria-label="${esc(vendor.name)} 이미지 영역">
      <div class="v74-placeholder__logo">${esc(vendor.placeholder)}<small>IMAGE PLACEHOLDER</small></div>
    </div>
    <div class="v74-vendor-title">
      <h2>${esc(vendor.name)} - ${esc(vendor.code)}</h2>
      <code>${esc(vendor.code)}</code>
    </div>
    <ul class="v74-benefits">${benefits}</ul>
    <div class="v74-meta">
      <div><small>도메인</small><b>${esc(vendor.domain)}</b></div>
      <div><small>보증 상태</small><b>상담 확인</b></div>
    </div>
    <div class="v74-actions">
      <a class="v74-btn v74-btn--glass" href="${esc(vendor.detail)}">상세보기</a>
      <button class="v74-btn v74-btn--primary" type="button" data-v74-go="true" data-code="${esc(vendor.code)}" data-href="${esc(vendor.official)}" data-vendor="${esc(vendor.name)}">바로가기</button>
    </div>
  </div>
</article>`;
}

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>보증업체 | 88ST.Cloud</title>
  <meta name="description" content="88ST.Cloud 보증업체 큐레이션. SK 홀딩스, 여왕벌, ANY BET, UDT BET, 땅콩 BET의 가입코드와 공식주소 이동을 빠르게 확인합니다.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0B0F19">
  <link rel="canonical" href="https://88st.cloud/guaranteed/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/v74.guaranteed-cro.css?v=20260524" data-v74-guaranteed="true">
</head>
<body class="v74-guaranteed-cro" data-v74-page="guaranteed" data-v74-marker="${VERSION}">
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

  <main class="v74-main">
    <section class="v74-shell v74-status-row" aria-label="보증업체 상태">
      <div class="v74-status-chips">
        <span class="v74-chip v74-chip--gold">Premium Guaranteed</span>
        <span class="v74-chip">업체 5곳</span>
        <span class="v74-chip">코드 자동 복사</span>
        <span class="v74-chip">상세 랜딩 연결</span>
      </div>
      <span class="v74-status-note">이미지 영역은 추후 전달 이미지로 교체 가능</span>
    </section>

    <section class="v74-shell v74-vendor-grid" aria-label="보증업체 카드 대시보드">
      ${vendors.map(vendorCard).join('\n      ')}
    </section>

    <section class="v74-shell v74-bridge" aria-label="상담센터 연결">
      <div>
        <b>코드·주소·이벤트 조건이 애매하면 상담센터에서 먼저 확인하세요.</b>
        <span>바로가기 클릭 시 가입코드가 자동 복사되고, 업체 공식주소가 새 창으로 열립니다.</span>
      </div>
      <a href="https://t.me/TRS999_bot" target="_blank" rel="noopener noreferrer">@TRS999_bot 연결</a>
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

fs.mkdirSync(path.dirname(OUT), {recursive:true});
fs.writeFileSync(OUT, html, 'utf8');


function updatePackage(){
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const v74Cmd = 'node scripts/generate-v74-guaranteed-cro.mjs';
  if (!pkg.scripts.build.includes(v74Cmd)) {
    pkg.scripts.build = pkg.scripts.build.replace(' && node scripts/gen-build-ver.mjs', ` && ${v74Cmd} && node scripts/gen-build-ver.mjs`);
  }
  pkg.scripts.verify = 'node scripts/verify-v74-guaranteed-cro.mjs';
  pkg.scripts['quality:v74'] = 'node scripts/generate-v74-guaranteed-cro.mjs';
  pkg.scripts['verify:v74'] = 'node scripts/verify-v74-guaranteed-cro.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

updatePackage();
console.log(`[V74] guaranteed CRO generated: vendors=${vendors.length} marker=${VERSION}`);
