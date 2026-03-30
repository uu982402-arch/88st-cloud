import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SITE = 'https://88st.cloud';
const dataPath = path.join(ROOT, 'assets', 'data', 'brand.results.v1.20260330.json');
const outDir = path.join(ROOT, 'muktu-police', 'brand');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
<link href="${escapeHtml(canonical)}" rel="canonical"/><meta content="summary_large_image" name="twitter:card"/>
<meta content="${escapeHtml(title)}" name="twitter:title"/>
<meta content="${escapeHtml(description)}" name="twitter:description"/>
<meta content="https://88st.cloud/img/logo.png" name="twitter:image"/><meta content="${escapeHtml(title)} 대표 이미지" name="twitter:image:alt"/>
<meta content="website" property="og:type"/><meta content="레븐" property="og:site_name"/>
<meta content="${escapeHtml(title)}" property="og:title"/>
<meta content="${escapeHtml(description)}" property="og:description"/>
<meta content="${escapeHtml(canonical)}" property="og:url"/><meta content="https://88st.cloud/img/logo.png" property="og:image"/><meta content="${escapeHtml(title)} 대표 이미지" property="og:image:alt"/><meta content="ko_KR" property="og:locale"/>
<script type="application/ld+json">${breadcrumbJson}</script>
<script type="application/ld+json">${pageJson}</script>
<meta name="theme-color" content="#07111f"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/>
<link rel="stylesheet" href="/assets/css/blog.rebuild.v2.20260318.css"/>
<link rel="stylesheet" href="/assets/css/mobile.enhance.v1.20260317.css"/>
<link rel="stylesheet" href="/assets/css/resource.tools.v1.20260324.css"/>
<link rel="stylesheet" href="/assets/css/safety.center.v2.20260330.css"/>
<link rel="stylesheet" href="/assets/css/luxury.refresh.v1.20260330.css"/></head>`;
}

function header(active = '') {
  const nav = [
    ['/', '메인', active === 'home'],
    ['/muktu-police/', '안전센터', active === 'hub'],
    ['/muktu-police/search/', '사례조회', active === 'search'],
    ['/muktu-police/check/', '도메인검사', active === 'check'],
    ['/muktu-police/brand/', '브랜드결과', active === 'brand'],
    ['/analysis/', '배당분석', active === 'analysis']
  ];
  return `<body data-safety-page="${escapeHtml(active || 'brand')}"><a class="skip-link" href="#mainContent">본문 바로가기</a><header class="site-header"><div class="container header-inner"><a aria-label="레븐 홈으로 이동" class="brand" href="/"><img alt="레븐" class="brand-logo" src="/img/logo.png"/><span class="brand-copy"><strong>레븐</strong><span>검증 · 분석 · 안전센터</span></span></a><nav aria-label="주요 메뉴" class="main-nav">${nav.map(([href, label, current]) => `<a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav><div class="header-actions"><a class="btn btn-primary btn-sm" href="https://t.me/TRK7878" rel="noopener noreferrer" target="_blank">텔레그램 문의</a></div></div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="container footer-inner"><div><strong>레븐</strong><p style="margin:8px 0 0">먹튀폴리스 · 검증 · 분석 플랫폼</p></div><div class="footer-links"><a href="/">메인</a><a href="/muktu-police/">안전센터</a><a href="/muktu-police/search/">사례조회</a><a href="/muktu-police/check/">도메인검사</a><a href="/muktu-police/brand/">브랜드결과</a><a href="/muktu-police/report/">결과페이지</a><a href="/analysis/">배당분석</a></div></div></footer><script defer src="/assets/js/mobile.enhance.v1.20260317.js"></script><script defer src="/assets/js/safety.center.v2.20260330.js"></script><script defer src="/assets/js/luxury.refresh.v1.20260330.js"></script></body></html>`;
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
  const title = '브랜드 결과 모음 | 메이저사이트 결과 랜딩 | 레븐';
  const description = '광고카드 4종과 연결되는 브랜드별 정적 결과 페이지 모음입니다. 브랜드명 검색, 도메인 검사, 결과 공유, 공식 주소 이동 흐름을 브랜드 단위로 정리했습니다.';
  const canonical = `${SITE}/muktu-police/brand/`;
  return `${pageHead({
    title,
    description,
    keywords: '브랜드 결과, 메이저사이트 결과, 광고카드 결과판, 먹튀폴리스 브랜드, 정적 랜딩',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과 모음', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero"><div class="safety-hero-grid"><div><span class="safety-kicker">BRAND RESULT DIRECTORY</span><h1>브랜드별 결과 페이지를 한곳에 모아<br/>검색 · 점검 · 이동 흐름을 짧게 정리했습니다.</h1><p>광고 카드에 연결되는 각 브랜드별 정적 결과 페이지를 모은 허브입니다. 브랜드명 검색, 도메인 검사, 결과 공유, 공식 주소 이동까지 한 흐름으로 연결해 모바일에서도 다시 찾기 쉽습니다.</p><div class="search-actions" style="margin-top:18px"><a class="safety-link-btn" href="/muktu-police/">안전센터</a><a class="safety-link-btn mint" href="/muktu-police/search/">사례 조회</a><a class="safety-link-btn ghost" href="/muktu-police/check/">도메인 검사</a></div><div class="hero-command-grid"><a class="hero-command" href="/muktu-police/search/"><span>STEP 01</span><strong>검색 흔적 확인</strong><small>브랜드명·도메인 기준 검색어를 바로 열 수 있습니다.</small></a><a class="hero-command is-mint" href="/muktu-police/check/"><span>STEP 02</span><strong>도메인 점검</strong><small>등록일, DNS, IP, ASN 정보를 한 화면에서 봅니다.</small></a><a class="hero-command is-red" href="/muktu-police/report/"><span>STEP 03</span><strong>결과 링크 생성</strong><small>공유용 결과 페이지를 만들고 저장하기 좋습니다.</small></a><a class="hero-command is-gold" href="#brandDirectory"><span>STEP 04</span><strong>브랜드 결과 열기</strong><small>각 브랜드별 결과 랜딩으로 바로 이동합니다.</small></a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>운영 포인트</h3><p>고정 URL 결과 페이지를 만들면 광고 카드와 상담 메시지에서 같은 랜딩을 반복 재사용하기 쉽습니다.</p></article><article class="glass-card"><h3>현재 연결 브랜드</h3><p>${payload.brands.map((b) => escapeHtml(b.name)).join(' · ')} 결과 페이지를 우선 연결해 두었습니다.</p></article></aside></div></section>
<section class="section" id="brandDirectory"><div class="section-head"><div><h2>브랜드 결과 바로가기</h2><p>브랜드 결과, 도메인 검사, 검색 포인트를 한 카드에서 읽기 쉽게 정리했습니다.</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="/muktu-police/report/">공유 결과 생성</a></div></div><div class="brand-directory-grid" data-brand-grid></div></section>
<section class="section"><div class="brand-rail-note">브랜드가 추가되면 <strong>assets/data/brand.results.v1.20260330.json</strong>을 수정한 뒤 <strong>node scripts/generate-brand-pages.mjs</strong>를 다시 실행하면 같은 구조의 정적 결과 페이지를 계속 늘릴 수 있습니다.</div></section>
</div></div></section></main>
${footer()}`;
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
<section class="safety-hero"><div class="safety-hero-grid"><div><span class="safety-kicker">${escapeHtml(brand.kicker)}</span><h1>${escapeHtml(brand.displayTitle)}<br/>브랜드 결과 랜딩</h1><p>${escapeHtml(brand.landingIntro || brand.summary)} <strong>공식 주소, 가입코드, 검색 포인트, 도메인 검사 링크</strong>를 한 화면에 모아 빠르게 다시 확인할 수 있게 정리했습니다.</p><div class="search-actions" style="margin-top:18px"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 바로가기</a><a class="safety-link-btn ghost" href="${escapeHtml(checkHref)}">도메인 검사</a></div><div class="brand-hero-audit"><div class="stat-pill"><b>한줄 요약</b><span>${escapeHtml(brand.oneLine || brand.summary)}</span></div><div class="stat-pill"><b>가입코드</b><span>${escapeHtml(brand.code)}</span></div><div class="stat-pill"><b>도메인</b><span>${escapeHtml(brand.officialDomain)}</span></div></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>운영 메모</h3><p>${escapeHtml(brand.headline)}</p></article><article class="glass-card"><h3>체크 우선순위</h3><p>${escapeHtml(brand.verdict)} 기준으로 검색 흔적, 도메인 이력, 실제 입출금 반응을 순서대로 보는 흐름이 안전합니다.</p></article></aside></div></section>
<section class="section"><div class="brand-story-grid"><article class="editorial-note"><blockquote>${escapeHtml(brand.editorialQuote || '검색 결과와 도메인 점검을 같이 보면 판단이 더 빨라집니다.')}</blockquote><cite>Editorial note · ${escapeHtml(brand.name)}</cite></article><div class="landing-copy-grid"><article class="landing-copy-card"><h3>왜 이 페이지를 먼저 보나</h3><p>${escapeHtml(brand.seoSummary || brand.summary)}</p></article><article class="landing-copy-card"><h3>권장 흐름</h3><p>검색 → 도메인 검사 → 코드 복사 → 공식 주소 이동 순서로 확인하면 모바일에서도 동선이 짧고 실수가 줄어듭니다.</p></article></div></div></section>
<section class="section"><div class="section-head"><div><h2>혜택 요약</h2><p>브랜드 카드와 결과 페이지의 문구 톤을 통일해, 읽는 순간 핵심만 바로 파악되도록 정리했습니다.</p></div></div><div class="promo-grid"><article class="promo-card" data-theme="${escapeHtml(brand.theme)}"><div class="promo-topline"><span class="promo-kicker">${escapeHtml(brand.kicker)}</span><span class="promo-status">${escapeHtml(brand.statusLabel)}</span></div><h3>${escapeHtml(brand.displayTitle)}</h3><p class="promo-summary">${escapeHtml(brand.oneLine || brand.rewardSummary)}</p><div class="promo-meta-grid"><div class="promo-meta"><span>공식 도메인</span><strong>${escapeHtml(brand.officialDomain)}</strong></div><div class="promo-meta"><span>가입코드</span><strong>${escapeHtml(brand.code)}</strong></div><div class="promo-meta"><span>운영 메모</span><strong>${escapeHtml(brand.verdict)}</strong></div></div><ul>${(brand.perks || brand.highlights || []).slice(0,3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="promo-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 바로가기</a><a class="safety-link-btn ghost" href="${escapeHtml(checkHref)}">도메인 검사</a></div></article></div></section>
<section class="section"><div class="section-head"><div><h2>핵심 체크 포인트</h2><p>무조건 길게 설명하지 않고, 실제 점검에 필요한 기준만 3개로 압축했습니다.</p></div></div><div class="safety-list-grid">${brand.checks.map((item, index) => `<article class="safety-list-card"><h3>체크 ${index + 1}</h3><p>${escapeHtml(item)}</p></article>`).join('')}</div></section>
<section class="section"><div class="section-head"><div><h2>바로 쓰는 검색 키워드</h2><p>브랜드명과 도메인을 따로 검색해 흔적이 반복되는지 먼저 비교해 보세요.</p></div></div><div class="link-grid">${brand.queries.map((item) => `<article class="quick-link-card"><a href="${googleUrl(item.query)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('')}</div></section>
<section class="section"><div class="section-head"><div><h2>다른 브랜드 결과도 보기</h2><p>광고 운영 중인 다른 브랜드도 같은 구조로 이어서 확인할 수 있습니다.</p></div></div><div class="brand-directory-grid" data-brand-grid></div></section>
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
