import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'assets/data/brand.results.v1.20260330.json');
const outDir = path.join(rootDir, 'muktu-police/brand');
const SITE = 'https://88st.cloud';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function googleUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function pageHead({ title, description, keywords, canonical, breadcrumbJson, pageJson }) {
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport"/>
<title>${escapeHtml(title)}</title>
<meta content="${escapeHtml(description)}" name="description"/>
<meta content="${escapeHtml(keywords)}" name="keywords"/>
<meta content="index,follow,max-image-preview:large" name="robots"/><meta content="레븐" name="author"/>
<link href="${escapeHtml(canonical)}" rel="canonical"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="${escapeHtml(title)}" name="twitter:title"/>
<meta content="${escapeHtml(description)}" name="twitter:description"/>
<meta content="${SITE}/img/logo.png" name="twitter:image"/><meta content="레븐 먹튀 검증 대표 이미지" name="twitter:image:alt"/>
<meta content="website" property="og:type"/><meta content="레븐" property="og:site_name"/>
<meta content="${escapeHtml(title)}" property="og:title"/>
<meta content="${escapeHtml(description)}" property="og:description"/>
<meta content="${escapeHtml(canonical)}" property="og:url"/><meta content="${SITE}/img/logo.png" property="og:image"/>
<meta content="레븐 먹튀 검증 대표 이미지" property="og:image:alt"/><meta content="ko_KR" property="og:locale"/>
<script type="application/ld+json">${breadcrumbJson}</script><script type="application/ld+json">${pageJson}</script>
<meta content="#07111f" name="theme-color"/><link href="/favicon.ico" rel="icon" type="image/x-icon"/>
<link href="/assets/css/blog.rebuild.v2.20260318.css" rel="stylesheet"/>
<link href="/assets/css/mobile.enhance.v1.20260317.css" rel="stylesheet"/>
<link href="/assets/css/safety.center.v2.20260330.css" rel="stylesheet"/>
<link href="/assets/css/luxury.refresh.v2.20260330.css" rel="stylesheet"/>
</head>`;
}

function header(current = '') {
  const nav = [
    ['home', '/', '메인'],
    ['hub', '/muktu-police/', '안전센터'],
    ['search', '/muktu-police/search/', '사례조회'],
    ['check', '/muktu-police/check/', '도메인검사'],
    ['brand', '/muktu-police/brand/', '브랜드결과'],
    ['report', '/muktu-police/report/', '결과생성']
  ].map(([key, href, label]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<body data-safety-page="${escapeHtml(current || 'brand')}"><a class="skip-link" href="#mainContent">본문 바로가기</a><header class="site-header"><div class="container header-inner"><a aria-label="레븐 홈으로 이동" class="brand" href="/"><img alt="레븐" class="brand-logo" src="/img/logo.png"/><span class="brand-copy"><strong>레븐</strong><span>먹튀 · 도메인 · 브랜드결과</span></span></a><nav aria-label="주요 메뉴" class="main-nav">${nav}</nav><div class="header-actions"><a class="btn btn-primary btn-sm" href="https://t.me/TRK7878" rel="noopener noreferrer" target="_blank">텔레그램 문의</a></div></div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="container footer-inner"><div><strong>레븐</strong><p style="margin:8px 0 0">먹튀 검증 · 도메인 점검 플랫폼</p></div><div class="footer-links"><a href="/">메인</a><a href="/muktu-police/">안전센터</a><a href="/muktu-police/search/">사례조회</a><a href="/muktu-police/check/">도메인검사</a><a href="/muktu-police/brand/">브랜드결과</a><a href="/muktu-police/report/">결과생성</a></div></div></footer><script defer src="/assets/js/mobile.enhance.v1.20260317.js"></script><script defer src="/assets/js/safety.center.v3.20260330.js"></script><script defer src="/assets/js/luxury.refresh.v2.20260330.js"></script></body></html>`;
}

function breadcrumb(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.item }))
  });
}

function collectionJson(title, description, url) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    inLanguage: 'ko-KR',
    url
  });
}

function buildBrandIndexPage(payload) {
  const title = '브랜드 결과 모음 | 공식주소·가입코드·검색 포인트 | 레븐';
  const description = '광고 운영 브랜드의 공식 주소, 가입코드, 검색 포인트, 도메인 검사 링크를 한곳에 정리한 브랜드 결과 모음입니다.';
  const canonical = `${SITE}/muktu-police/brand/`;
  return `${pageHead({
    title,
    description,
    keywords: '브랜드 결과, 메이저사이트 결과, 공식주소, 가입코드, 먹튀 검색, 도메인 검사',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과 모음', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero"><div class="safety-hero-grid"><div><span class="safety-kicker">BRAND RESULT DIRECTORY</span><h1>브랜드별 결과 페이지를 한곳에 모아<br/>검색 · 점검 · 이동 순서를 짧게 정리했습니다.</h1><p>공식 주소, 가입코드, 검색 키워드, 도메인 검사 링크를 브랜드 단위로 다시 모아둔 허브입니다. 광고카드를 누르기 전 필요한 정보만 다시 확인하기 좋게 구성했습니다.</p><div class="search-actions" style="margin-top:18px"><a class="safety-link-btn" href="/muktu-police/search/">사례 조회</a><a class="safety-link-btn mint" href="/muktu-police/check/">도메인 검사</a><a class="safety-link-btn ghost" href="/muktu-police/report/">결과 생성</a></div><div class="hero-command-grid"><a class="hero-command" href="/muktu-police/search/"><span>STEP 01</span><strong>검색 흔적 확인</strong><small>브랜드명·도메인 기준 검색어를 바로 열 수 있습니다.</small></a><a class="hero-command is-mint" href="/muktu-police/check/"><span>STEP 02</span><strong>도메인 점검</strong><small>등록일, DNS, IP, ASN 정보를 한 화면에서 봅니다.</small></a><a class="hero-command is-red" href="#brandDirectory"><span>STEP 03</span><strong>브랜드 결과 열기</strong><small>공식 주소, 코드, 검색 포인트를 카드별로 확인합니다.</small></a><a class="hero-command is-gold" href="/muktu-police/report/"><span>STEP 04</span><strong>결과 링크 생성</strong><small>상담과 공유에 쓰는 결과 링크를 바로 만듭니다.</small></a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>현재 연결 브랜드</h3><p>${payload.brands.map((b) => escapeHtml(b.name)).join(' · ')}</p></article><article class="glass-card"><h3>운영 원칙</h3><p>공식 주소로 바로 보내기보다, 검색 흔적과 도메인 이력을 먼저 다시 보게 만드는 흐름을 기본으로 둡니다.</p></article></aside></div></section>
<section class="section" id="brandDirectory"><div class="section-head"><div><h2>브랜드 결과 바로가기</h2><p>카드별로 공식 주소, 가입코드, 검색 포인트, 검사 링크를 차분하게 다시 확인할 수 있습니다.</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="/muktu-police/">안전센터 허브</a></div></div><div class="brand-directory-grid" data-brand-grid></div></section>
</div></div></section></main>
${footer()}`;
}

function buildVariantCards(brand) {
  const variants = Array.isArray(brand.conversionVariants) && brand.conversionVariants.length ? brand.conversionVariants : [
    { label: 'A안', title: '코드 확인 후 이동', copy: '가입코드와 공식 주소를 짧게 확인한 뒤 이동하는 문구입니다.', cta: '확인 후 이동' },
    { label: 'B안', title: '검색·검사 후 이동', copy: '검색 흔적과 도메인 이력을 다시 본 뒤 이동하는 문구입니다.', cta: '검토 후 이동' }
  ];
  return variants.map((variant, index) => `<article class="ab-copy-card" data-variant="${index === 0 ? 'a' : 'b'}"><div class="ab-copy-head"><span class="ab-copy-label">${escapeHtml(variant.label)}</span><strong>${escapeHtml(variant.title)}</strong></div><p>${escapeHtml(variant.copy)}</p><div class="ab-copy-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn ghost" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(variant.cta)}</a></div></article>`).join('');
}

function buildBrandPage(brand) {
  const title = `${brand.displayTitle} 결과 | 가입코드·공식 주소·검색 포인트 | 레븐`;
  const description = `${brand.seoSummary || brand.summary} 공식 주소, 가입코드, 검색 포인트, 도메인 검사 링크를 한 페이지에 정리한 ${brand.name} 브랜드 전용 결과 랜딩입니다.`;
  const canonical = `${SITE}/muktu-police/brand/${brand.slug}/`;
  const checkHref = `/muktu-police/check/?domain=${encodeURIComponent(brand.lookupDomain)}`;
  const reportHref = `/muktu-police/report/?domain=${encodeURIComponent(brand.lookupDomain)}`;
  return `${pageHead({
    title,
    description,
    keywords: `${brand.name}, ${brand.officialDomain}, ${brand.name} 먹튀, ${brand.name} 후기, 가입코드, 공식 주소, 도메인 검사, 브랜드 결과`,
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과 모음', item: `${SITE}/muktu-police/brand/` }, { name: `${brand.displayTitle} 결과`, item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero"><div class="safety-hero-grid"><div><span class="safety-kicker">${escapeHtml(brand.kicker)}</span><h1>${escapeHtml(brand.displayTitle)}<br/>브랜드 결과 페이지</h1><p>${escapeHtml(brand.landingIntro || brand.summary)} <strong>공식 주소, 가입코드, 검색 포인트, 도메인 검사 링크</strong>를 한 화면에 두어 다시 판단하기 쉽게 정리했습니다.</p><div class="search-actions" style="margin-top:18px"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 이동</a><a class="safety-link-btn ghost" href="${escapeHtml(checkHref)}">도메인 검사</a></div><div class="brand-hero-audit"><div class="stat-pill"><b>한줄 요약</b><span>${escapeHtml(brand.oneLine || brand.summary)}</span></div><div class="stat-pill"><b>가입코드</b><span>${escapeHtml(brand.code)}</span></div><div class="stat-pill"><b>도메인</b><span>${escapeHtml(brand.officialDomain)}</span></div></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>먼저 볼 것</h3><p>${escapeHtml(brand.verdict)}</p></article><article class="glass-card"><h3>운영 메모</h3><p>${escapeHtml(brand.headline)}</p></article></aside></div></section>
<section class="section"><div class="brand-story-grid"><article class="editorial-note"><blockquote>${escapeHtml(brand.editorialQuote || '검색 결과와 도메인 점검을 같이 보면 판단이 더 빨라집니다.')}</blockquote><cite>Editorial note · ${escapeHtml(brand.name)}</cite></article><div class="landing-copy-grid"><article class="landing-copy-card"><h3>왜 이 페이지를 먼저 보나</h3><p>${escapeHtml(brand.seoSummary || brand.summary)}</p></article><article class="landing-copy-card"><h3>권장 흐름</h3><p>검색 → 도메인 검사 → 코드 복사 → 공식 주소 이동 순서로 보면 모바일에서도 동선이 짧고 실수가 줄어듭니다.</p></article></div></div></section>
<section class="section"><div class="section-head"><div><h2>혜택 요약</h2><p>과장 없이 필요한 혜택과 확인 포인트만 보이도록 정리했습니다.</p></div></div><div class="promo-grid"><article class="promo-card" data-theme="${escapeHtml(brand.theme)}"><div class="promo-topline"><span class="promo-kicker">${escapeHtml(brand.kicker)}</span><span class="promo-status">${escapeHtml(brand.statusLabel)}</span></div><h3>${escapeHtml(brand.displayTitle)}</h3><p class="promo-summary">${escapeHtml(brand.oneLine || brand.rewardSummary)}</p><div class="promo-meta-grid"><div class="promo-meta"><span>공식 도메인</span><strong>${escapeHtml(brand.officialDomain)}</strong></div><div class="promo-meta"><span>가입코드</span><strong>${escapeHtml(brand.code)}</strong></div><div class="promo-meta"><span>판단 포인트</span><strong>${escapeHtml(brand.verdict)}</strong></div></div><ul>${(brand.perks || brand.highlights || []).slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="promo-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 이동</a><a class="safety-link-btn ghost" href="${escapeHtml(checkHref)}">도메인 검사</a></div></article></div></section>
<section class="section"><div class="section-head"><div><h2>광고 전환 문구 A/B</h2><p>결과 페이지 안에서 바로 비교할 수 있게 전환 문구를 두 버전으로 분리했습니다.</p></div></div><div class="ab-copy-grid">${buildVariantCards(brand)}</div></section>
<section class="section"><div class="section-head"><div><h2>핵심 체크 포인트</h2><p>실제 점검에 필요한 기준만 3개로 압축했습니다.</p></div></div><div class="safety-list-grid">${brand.checks.map((item, index) => `<article class="safety-list-card"><h3>체크 ${index + 1}</h3><p>${escapeHtml(item)}</p></article>`).join('')}</div></section>
<section class="section"><div class="section-head"><div><h2>바로 쓰는 검색 키워드</h2><p>브랜드명과 도메인을 따로 검색해 흔적이 반복되는지 먼저 비교해 보세요.</p></div></div><div class="link-grid">${brand.queries.map((item) => `<article class="quick-link-card"><a href="${googleUrl(item.query)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('')}</div></section>
<section class="section"><div class="section-head"><div><h2>공유 결과 연결</h2><p>상담이나 운영용으로 다시 써야 할 때는 결과 링크를 따로 생성해 두면 편합니다.</p></div></div><div class="card-actions"><a class="safety-link-btn ghost" href="${escapeHtml(reportHref)}">결과 링크 생성</a><a class="safety-link-btn ghost" href="/muktu-police/brand/">다른 브랜드 보기</a></div></section>
</div></div></section></main>
${footer()}`;
}

async function main() {
  const payload = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  const brands = Array.isArray(payload?.brands) ? payload.brands : [];
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'index.html'), buildBrandIndexPage(payload), 'utf8');
  for (const brand of brands) {
    const dir = path.join(outDir, brand.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), buildBrandPage(brand), 'utf8');
  }
  console.log(`Generated ${brands.length} brand pages + directory.`);
}

await main();
