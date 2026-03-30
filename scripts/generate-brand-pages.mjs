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
<link rel="stylesheet" href="/assets/css/safety.center.v2.20260330.css"/></head>`;
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
  return `<footer class="footer"><div class="container footer-inner"><div><strong>레븐</strong><p style="margin:8px 0 0">먹튀폴리스 · 검증 · 분석 플랫폼</p></div><div class="footer-links"><a href="/">메인</a><a href="/muktu-police/">안전센터</a><a href="/muktu-police/search/">사례조회</a><a href="/muktu-police/check/">도메인검사</a><a href="/muktu-police/brand/">브랜드결과</a><a href="/muktu-police/report/">결과페이지</a><a href="/analysis/">배당분석</a></div></div></footer><script defer src="/assets/js/mobile.enhance.v1.20260317.js"></script><script defer src="/assets/js/safety.center.v2.20260330.js"></script></body></html>`;
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
  const title = '브랜드 결과 모음 | 광고카드 연동 정적 결과판 | 레븐';
  const description = '광고카드 4종에 연결되는 브랜드별 정적 결과 페이지 모음입니다. 검색, 도메인 검사, 결과 공유 흐름을 브랜드 단위로 바로 이동할 수 있습니다.';
  const canonical = `${SITE}/muktu-police/brand/`;
  return `${pageHead({
    title,
    description,
    keywords: '브랜드 결과, 정적 결과 페이지, 광고카드 결과판, 먹튀폴리스 브랜드, 메이저사이트 결과',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과 모음', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero"><div class="safety-hero-grid"><div><span class="safety-kicker">BRAND RESULT DIRECTORY</span><h1>광고카드와 연결되는 브랜드별<br/>정적 결과 페이지 모음입니다.</h1><p>광고카드에서 바로 이동하기 전에 <strong>브랜드별 결과판</strong>을 먼저 열어 공식 주소, 가입코드, 검색 포인트, 도메인 검사 동선을 빠르게 확인할 수 있게 정리했습니다. 정적 페이지라서 공유가 쉽고, 메인·안전센터·상담 동선 어디서든 동일한 결과 구조를 재사용하기 좋습니다.</p><div class="search-actions" style="margin-top:18px"><a class="safety-link-btn" href="/muktu-police/">안전센터 허브</a><a class="safety-link-btn mint" href="/muktu-police/search/">사례 조회</a><a class="safety-link-btn ghost" href="/muktu-police/check/">도메인 검사</a></div><div class="hero-command-grid"><a class="hero-command" href="/muktu-police/search/"><span>Step 01</span><strong>검색 흔적 확인</strong><small>브랜드명 먹튀·후기 검색부터 실행</small></a><a class="hero-command is-mint" href="/muktu-police/check/"><span>Step 02</span><strong>도메인 검사</strong><small>생성일·만료일·DNS·IP 점검</small></a><a class="hero-command is-red" href="/muktu-police/report/"><span>Step 03</span><strong>결과 링크 생성</strong><small>공유 가능한 운영용 결과 링크 생성</small></a><a class="hero-command is-gold" href="#brandDirectory"><span>Step 04</span><strong>브랜드 결과 이동</strong><small>각 브랜드별 정적 결과판 바로 열기</small></a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>왜 정적 결과판인가</h3><p>광고 운영 중인 브랜드를 검색/검사/상담 흐름에 맞춰 고정 URL로 관리하면, 모바일에서도 재진입이 빠르고 운영 응대도 단순해집니다.</p></article><article class="glass-card"><h3>현재 연결 범위</h3><p>양심, 칠벳, 베가스, 어벤저스벳 4종을 우선 결과판 구조로 연결했습니다.</p></article></aside></div></section>
<section class="section" id="brandDirectory"><div class="section-head"><div><h2>브랜드 결과 바로가기</h2><p>각 카드에서 정적 결과 페이지, 도메인 검사, 공식 주소 이동 흐름을 분리해 두었습니다.</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="/muktu-police/report/">공유 결과 생성</a></div></div><div class="brand-directory-grid" data-brand-grid></div></section>
<section class="section"><div class="brand-rail-note">브랜드가 추가되면 <strong>assets/data/brand.results.v1.20260330.json</strong>만 수정한 뒤 <strong>node scripts/generate-brand-pages.mjs</strong>를 다시 실행하면 동일 구조의 정적 페이지를 계속 늘릴 수 있습니다.</div></section>
</div></div></section></main>
${footer()}`;
}

function buildBrandPage(brand) {
  const title = `${brand.displayTitle} 결과 | 공식 주소·가입코드·검색 포인트 | 레븐`;
  const description = `${brand.displayTitle} 관련 공식 주소, 가입코드, 검색 포인트, 도메인 검사 링크를 한 페이지에 정리한 브랜드별 정적 결과판입니다.`;
  const canonical = `${SITE}/muktu-police/brand/${brand.slug}/`;
  const checkHref = `/muktu-police/check/?domain=${encodeURIComponent(brand.lookupDomain)}`;
  const reportHref = `/muktu-police/report/?domain=${encodeURIComponent(brand.lookupDomain)}`;
  return `${pageHead({
    title,
    description,
    keywords: `${brand.name}, ${brand.officialDomain}, 가입코드, 공식 주소, 도메인 검사, 먹튀 검색, 브랜드 결과`,
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과 모음', item: `${SITE}/muktu-police/brand/` }, { name: `${brand.displayTitle} 결과`, item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero"><div class="safety-hero-grid"><div><span class="safety-kicker">${escapeHtml(brand.kicker)}</span><h1>${escapeHtml(brand.displayTitle)}<br/>브랜드별 정적 결과판</h1><p>${escapeHtml(brand.summary)} 현재 결과판에서는 <strong>공식 주소·가입코드·검색 키워드·도메인 검사 링크</strong>를 한 화면에 정리해 두었고, 필요 시 결과 링크 공유 페이지와 바로 연결되도록 만들었습니다.</p><div class="search-actions" style="margin-top:18px"><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식 주소</a><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}">가입코드 복사</button><a class="safety-link-btn ghost" href="${escapeHtml(checkHref)}">도메인 검사</a></div><div class="hero-command-grid"><a class="hero-command" href="${googleUrl(`${brand.searchName} 먹튀`)}" target="_blank" rel="noopener noreferrer"><span>검색 01</span><strong>${escapeHtml(brand.name)} 먹튀</strong><small>브랜드명 기준 기본 검색</small></a><a class="hero-command is-mint" href="${googleUrl(`${brand.officialDomain} 먹튀`)}" target="_blank" rel="noopener noreferrer"><span>검색 02</span><strong>${escapeHtml(brand.officialDomain)} 먹튀</strong><small>도메인 기준 검색</small></a><a class="hero-command is-red" href="${escapeHtml(reportHref)}"><span>운영 03</span><strong>공유 결과 생성</strong><small>링크형 결과 페이지 바로 열기</small></a><a class="hero-command is-gold" href="/muktu-police/brand/"><span>이동 04</span><strong>브랜드 모음</strong><small>다른 브랜드 결과판 보기</small></a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>운영 메모</h3><p>${escapeHtml(brand.headline)}</p></article><article class="glass-card"><h3>우선 체크</h3><p>${escapeHtml(brand.verdict)} 단계에서는 검색 흔적과 도메인 이력을 먼저 보고, 실제 입출금은 소액 테스트로 분리해서 확인하는 흐름이 안전합니다.</p></article></aside></div></section>
<section class="section"><div class="metric-grid">
<article class="metric-card"><span class="kicker">공식 도메인</span><strong>${escapeHtml(brand.officialDomain)}</strong><small>도메인 검사로 바로 연결 가능</small></article>
<article class="metric-card"><span class="kicker">가입코드</span><strong>${escapeHtml(brand.code)}</strong><small>모바일에서도 즉시 복사 가능</small></article>
<article class="metric-card"><span class="kicker">광고 운영 요약</span><strong>${escapeHtml(brand.rewardSummary)}</strong><small>핵심 이벤트 요약</small></article>
<article class="metric-card"><span class="kicker">연결 흐름</span><strong>검색 → 검사 → 결과 → 이동</strong><small>정적 결과판 기준 운영 동선</small></article>
</div></section>
<section class="section"><div class="section-head"><div><h2>핵심 이벤트 요약</h2><p>광고카드에 노출되는 요약을 브랜드별 결과판에서도 같은 톤으로 재사용합니다.</p></div></div><div class="promo-grid"><article class="promo-card" data-theme="${escapeHtml(brand.theme)}"><div class="promo-topline"><span class="promo-kicker">${escapeHtml(brand.kicker)}</span><span class="promo-status">${escapeHtml(brand.statusLabel)}</span></div><h3>${escapeHtml(brand.displayTitle)}</h3><p class="promo-summary">${escapeHtml(brand.rewardSummary)}</p><div class="promo-meta-grid"><div class="promo-meta"><span>공식 도메인</span><strong>${escapeHtml(brand.officialDomain)}</strong></div><div class="promo-meta"><span>가입코드</span><strong>${escapeHtml(brand.code)}</strong></div><div class="promo-meta"><span>운영 메모</span><strong>${escapeHtml(brand.verdict)}</strong></div></div><ul>${brand.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="promo-actions"><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식 주소</a><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}">코드 복사</button><a class="safety-link-btn ghost" href="${escapeHtml(checkHref)}">도메인 검사</a></div></article></div></section>
<section class="section"><div class="section-head"><div><h2>브랜드별 체크 포인트</h2><p>정적 결과판에서는 아래 3개 기준을 항상 같이 보여주는 구조로 유지합니다.</p></div></div><div class="safety-list-grid">${brand.checks.map((item, index) => `<article class="safety-list-card"><h3>체크 ${index + 1}</h3><p>${escapeHtml(item)}</p></article>`).join('')}</div></section>
<section class="section"><div class="section-head"><div><h2>바로 쓰는 검색 키워드</h2><p>브랜드명과 도메인을 함께 검색해 흔적이 반복되는지 먼저 보는 흐름입니다.</p></div></div><div class="link-grid">${brand.queries.map((item) => `<article class="quick-link-card"><a href="${googleUrl(item.query)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('')}</div></section>
<section class="section"><div class="brand-rail-note">이 결과판은 정적 페이지라서 <strong>광고카드 → 브랜드 결과 → 도메인 검사 → 결과 링크 공유</strong> 흐름을 고정 경로로 유지하기 좋습니다. 브랜드가 추가되면 같은 템플릿으로 바로 늘릴 수 있습니다.</div></section>
<section class="section"><div class="section-head"><div><h2>다른 브랜드 결과도 같이 보기</h2><p>현재 운영 중인 다른 브랜드 결과판도 같은 구조로 열 수 있습니다.</p></div></div><div class="brand-directory-grid" data-brand-grid></div></section>
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
