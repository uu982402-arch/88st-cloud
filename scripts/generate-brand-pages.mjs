
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'assets/data/brand.results.v2.20260330.json');
const outBrandDir = path.join(rootDir, 'muktu-police/brand');
const outFaqDir = path.join(rootDir, 'muktu-police/faq');
const outCompareDir = path.join(rootDir, 'muktu-police/compare');
const outQueryDir = path.join(rootDir, 'muktu-police/query');
const manifestPath = path.join(rootDir, 'assets/data/generated.routes.v1.20260330.json');
const SITE = 'https://88st.cloud';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function slugPath(base, slug) {
  return `${base}/${slug}/`;
}
function pageHead({ title, description, keywords, canonical, breadcrumbJson, pageJson, extraJson = [] }) {
  const extras = extraJson.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('');
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
<script type="application/ld+json">${breadcrumbJson}</script><script type="application/ld+json">${pageJson}</script>${extras}
<meta content="#07111f" name="theme-color"/><link href="/favicon.ico" rel="icon" type="image/x-icon"/>
<link href="/assets/css/blog.rebuild.v2.20260318.css" rel="stylesheet"/>
<link href="/assets/css/mobile.enhance.v1.20260317.css" rel="stylesheet"/>
<link href="/assets/css/resource.tools.v1.20260324.css" rel="stylesheet"/>
<link href="/assets/css/safety.center.v2.20260330.css" rel="stylesheet"/>
<link href="/assets/css/luxury.refresh.v3.20260330.css" rel="stylesheet"/>
</head>`;
}
function header(current = '') {
  const nav = [
    ['home', '/', '메인'],
    ['hub', '/muktu-police/', '안전센터'],
    ['search', '/muktu-police/search/', '사례조회'],
    ['check', '/muktu-police/check/', '도메인검사'],
    ['brand', '/muktu-police/brand/', '브랜드결과'],
    ['faq', '/muktu-police/faq/', 'FAQ'],
    ['compare', '/muktu-police/compare/', '비교'],
    ['report', '/muktu-police/report/', '결과생성']
  ].map(([key, href, label]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<body data-safety-page="${escapeHtml(current || 'brand')}"><a class="skip-link" href="#mainContent">본문 바로가기</a><header class="site-header"><div class="container header-inner"><a aria-label="레븐 홈으로 이동" class="brand" href="/"><img alt="레븐" class="brand-logo" src="/img/logo.png"/><span class="brand-copy"><strong>레븐</strong><span>먹튀 · 도메인 · 자동결과</span></span></a><nav aria-label="주요 메뉴" class="main-nav">${nav}</nav><div class="header-actions"><a class="btn btn-primary btn-sm" href="https://t.me/TRK7878" rel="noopener noreferrer" target="_blank">텔레그램 문의</a></div></div></header>`;
}
function footer() {
  return `<footer class="footer"><div class="container footer-inner"><div><strong>레븐</strong><p style="margin:8px 0 0">먹튀 검증 · 도메인 점검 플랫폼</p></div><div class="footer-links"><a href="/">메인</a><a href="/muktu-police/">안전센터</a><a href="/muktu-police/brand/">브랜드결과</a><a href="/muktu-police/faq/">FAQ</a><a href="/muktu-police/compare/">비교</a><a href="/muktu-police/query/">SEO 검색팩</a><a href="/muktu-police/report/">결과생성</a></div></div></footer><script defer src="/assets/js/mobile.enhance.v1.20260317.js"></script><script defer src="/assets/js/safety.center.v4.20260330.js"></script><script defer src="/assets/js/luxury.refresh.v3.20260330.js"></script></body></html>`;
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
function faqSchema(brand) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (brand.faq || []).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };
}
function articleSchema(title, description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'ko-KR',
    url,
    datePublished: '2026-03-30',
    dateModified: '2026-03-30',
    author: { '@type': 'Organization', name: '레븐' },
    publisher: { '@type': 'Organization', name: '레븐', logo: { '@type': 'ImageObject', url: `${SITE}/img/logo.png` } },
    image: [`${SITE}/img/logo.png`]
  };
}

function hasFinalConsonant(value = '') {
  const str = String(value || '').trim();
  if (!str) return false;
  const code = str.charCodeAt(str.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return ((code - 0xac00) % 28) !== 0;
}
function joinAnd(left = '', right = '') {
  return `${left}${hasFinalConsonant(left) ? '과' : '와'} ${right}`;
}

function comparePairs(brands) {
  const pairs = [];
  for (let i = 0; i < brands.length; i += 1) {
    for (let j = i + 1; j < brands.length; j += 1) {
      pairs.push([brands[i], brands[j]]);
    }
  }
  return pairs;
}
function scoreText(brand) {
  return `${brand.status?.score || brand.benefitRank || 0} / 100`;
}
function statusBadge(brand) {
  const grade = brand.status?.grade || 'core';
  return `<span class="status-macro grade-${escapeHtml(grade)}">${escapeHtml(brand.status?.label || brand.statusLabel)}</span>`;
}
function cardTags(brand) {
  return (brand.badgeTags || brand.tags || []).slice(0, 4).map((tag) => `<span class="brand-chip">${escapeHtml(tag)}</span>`).join('');
}
function compareSlug(left, right) {
  return `${left.slug}-vs-${right.slug}`;
}
function queryRoute(item) {
  return `/muktu-police/query/${item.slug}/`;
}
function compareRoute(left, right) {
  return `/muktu-police/compare/${compareSlug(left, right)}/`;
}
function faqRoute(brand) {
  return `/muktu-police/faq/${brand.slug}/`;
}
function brandRoute(brand) {
  return `/muktu-police/brand/${brand.slug}/`;
}
function buildBrandIndexPage(payload, pairs) {
  const title = '브랜드 결과 모음 | 공식주소·가입코드·FAQ·비교 링크 | 레븐';
  const description = '광고 운영 브랜드의 공식 주소, 가입코드, 상태 배지, FAQ, 비교 링크, 검색 포인트를 한곳에 정리한 브랜드 결과 모음입니다.';
  const canonical = `${SITE}/muktu-police/brand/`;
  const totalQueries = payload.brands.reduce((sum, brand) => sum + (brand.seoLongtails || []).length, 0);
  return `${pageHead({
    title, description,
    keywords: '브랜드 결과, 가입코드, 공식주소, 브랜드 FAQ, 브랜드 비교, 메이저사이트 결과',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">AUTO RESULT DIRECTORY</span><h1>브랜드 결과 · FAQ · 비교 · SEO 검색팩을<br/>하나의 브랜드 DB로 묶었습니다.</h1><p>${escapeHtml(payload.directoryIntro)}</p><div class="search-actions compact-actions" style="margin-top:16px"><a class="safety-link-btn" href="/muktu-police/search/">사례 조회</a><a class="safety-link-btn mint" href="/muktu-police/check/">도메인 검사</a><a class="safety-link-btn ghost" href="/muktu-police/faq/">FAQ 허브</a><a class="safety-link-btn ghost" href="/muktu-police/compare/">비교 허브</a></div><div class="hero-micro-list"><span><b>${payload.brands.length}</b>개 브랜드</span><span><b>${pairs.length}</b>개 비교 페이지</span><span><b>${totalQueries}</b>개 롱테일 페이지</span></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>자동 생성 범위</h3><p>브랜드 결과, FAQ, 비교 페이지, 검색형 롱테일 페이지, 내부링크와 사이트맵 반영까지 같은 스크립트로 묶었습니다.</p></article></aside></div></section>
<section class="section" id="brandDirectory"><div class="section-head"><div><h2>브랜드 결과</h2><p>상태 배지, 코드, FAQ, 비교 링크까지 같은 카드 안에서 확인할 수 있습니다.</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="/muktu-police/query/">SEO 검색팩</a></div></div><div class="brand-directory-grid" data-brand-grid></div></section>
<section class="section"><div class="section-head"><div><h2>연결 허브</h2><p>브랜드 단위 정보만 필요한지, 질문형 페이지가 필요한지, 비교형 페이지가 필요한지 목적에 따라 바로 이동할 수 있습니다.</p></div></div><div class="tool-grid">
<article class="tool-card"><div class="tool-top"><span class="tool-badge">FAQ PACK</span></div><h3>브랜드 FAQ</h3><p>브랜드별 질문과 답변, 관련 비교 링크, 검색형 페이지를 함께 묶은 허브입니다.</p><div class="card-actions"><a class="safety-link-btn ghost" href="/muktu-police/faq/">FAQ 보기</a></div></article>
<article class="tool-card"><div class="tool-top"><span class="tool-badge">COMPARE</span></div><h3>브랜드 비교</h3><p>혜택 요약, 검색 흐름, 도메인 점검 포인트, 진입 문구를 두 브랜드 기준으로 정리했습니다.</p><div class="card-actions"><a class="safety-link-btn ghost" href="/muktu-police/compare/">비교 보기</a></div></article>
<article class="tool-card"><div class="tool-top"><span class="tool-badge">LONGTAIL SEO</span></div><h3>검색팩</h3><p>브랜드명 먹튀·후기·주소·가입코드 같은 롱테일 페이지를 정적 구조로 묶었습니다.</p><div class="card-actions"><a class="safety-link-btn ghost" href="/muktu-police/query/">검색팩 보기</a></div></article>
</div></section>
</div></div></section></main>
${footer()}`;
}
function buildBrandPage(brand, payload, pairs) {
  const canonical = `${SITE}${brandRoute(brand)}`;
  const compareCards = pairs.filter(([a,b]) => a.slug === brand.slug || b.slug === brand.slug).map(([a,b]) => {
    const other = a.slug === brand.slug ? b : a;
    return `<article class="quick-link-card"><a href="${compareRoute(a,b)}">${escapeHtml(brand.name)} vs ${escapeHtml(other.name)} ↗</a><p>${escapeHtml(other.oneLine)}</p></article>`;
  }).join('');
  const queryCards = (brand.seoLongtails || []).map((item) => `<article class="quick-link-card"><a href="${queryRoute(item)}">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('');
  const faqPreview = (brand.faq || []).slice(0, 3).map((item) => `<details class="faq-item"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('');
  const title = `${brand.displayTitle} 결과 | 공식주소·가입코드·FAQ·비교 | 레븐`;
  const description = `${brand.seoSummary || brand.summary} 공식 주소, 가입코드, 상태 배지, FAQ, 비교 링크, 검색형 페이지를 한 화면에 정리한 ${brand.name} 결과 랜딩입니다.`;
  return `${pageHead({
    title, description,
    keywords: `${brand.name}, ${brand.officialDomain}, ${brand.name} 먹튀, ${brand.name} 후기, ${brand.name} 가입코드, ${brand.name} 공식주소, ${brand.name} FAQ`,
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 결과', item: `${SITE}/muktu-police/brand/` }, { name: `${brand.displayTitle} 결과`, item: canonical }]),
    pageJson: collectionJson(title, description, canonical),
    extraJson: [faqSchema(brand), articleSchema(title, description, canonical)]
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell">
<section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">${escapeHtml(brand.kicker)}</span><h1>${escapeHtml(brand.displayTitle)}<br/>브랜드 결과 페이지</h1><p>${escapeHtml(brand.landingIntro || brand.summary)}</p><div class="search-actions compact-actions" style="margin-top:16px"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 이동</a><a class="safety-link-btn ghost" href="/muktu-police/check/?domain=${encodeURIComponent(brand.lookupDomain)}">도메인 검사</a><a class="safety-link-btn ghost" href="${faqRoute(brand)}">FAQ 보기</a></div><div class="hero-micro-list"><span><b>${escapeHtml(scoreText(brand))}</b>상태 점수</span><span><b>${escapeHtml(brand.status?.monitoring || '')}</b>모니터링</span><span><b>${escapeHtml(brand.status?.lastReviewed || '')}</b>최근 검토</span></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>상태 배지</h3><p>${escapeHtml(brand.status?.label || brand.statusLabel)}</p><div class="brand-chip-row">${cardTags(brand)}</div></article><article class="glass-card"><h3>먼저 볼 것</h3><p>${escapeHtml(brand.verdict)}</p></article></aside></div></section>
<section class="section"><div class="promo-grid">
<article class="promo-card" data-theme="${escapeHtml(brand.theme)}"><div class="promo-topline"><span class="promo-kicker">${escapeHtml(brand.kicker)}</span>${statusBadge(brand)}</div><h3>${escapeHtml(brand.displayTitle)}</h3><p class="promo-summary">${escapeHtml(brand.oneLine || brand.summary)}</p><div class="promo-meta-grid"><div class="promo-meta"><span>공식 도메인</span><strong>${escapeHtml(brand.officialDomain)}</strong></div><div class="promo-meta"><span>가입코드</span><strong>${escapeHtml(brand.code)}</strong></div><div class="promo-meta"><span>상태 점수</span><strong>${escapeHtml(scoreText(brand))}</strong></div></div><ul>${(brand.perks || []).slice(0,3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="promo-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 이동</a><a class="safety-link-btn ghost" href="/muktu-police/report/?brand=${escapeHtml(brand.slug)}&domain=${encodeURIComponent(brand.lookupDomain)}">공유 링크 만들기</a></div></article>
<article class="glass-card"><h3>핵심 체크 포인트</h3><div class="safety-list-grid">${(brand.checks || []).map((item, index) => `<article class="safety-list-card"><h3>체크 ${index + 1}</h3><p>${escapeHtml(item)}</p></article>`).join('')}</div></article>
</div></section>
<section class="section"><div class="section-head"><div><h2>광고 전환 문구 A/B</h2><p>빠르게 확인하고 이동할지, 검색과 점검을 다시 보고 이동할지 같은 브랜드 안에서도 두 방향으로 나눠 운용할 수 있습니다.</p></div></div><div class="ab-copy-grid">${(brand.conversionVariants || []).map((variant, index) => `<article class="ab-copy-card" data-variant="${index === 0 ? 'a' : 'b'}"><div class="ab-copy-head"><span class="ab-copy-label">${escapeHtml(variant.label)}</span><strong>${escapeHtml(variant.title)}</strong></div><p>${escapeHtml(variant.copy)}</p><div class="ab-copy-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn ghost" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(variant.cta)}</a></div></article>`).join('')}</div></section>
<section class="section"><div class="section-head"><div><h2>브랜드 FAQ</h2><p>가장 자주 반복되는 질문을 먼저 묶어 두었습니다. 더 자세한 항목은 FAQ 전용 페이지에서 바로 볼 수 있습니다.</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="${faqRoute(brand)}">전체 FAQ</a></div></div><div class="faq-list">${faqPreview}</div></section>
<section class="section"><div class="section-head"><div><h2>검색형 롱테일 페이지</h2><p>${escapeHtml(brand.name)} 관련 검색 의도를 페이지 단위로 따로 분리해 내부링크와 SEO 확장에 같이 쓰는 구조입니다.</p></div></div><div class="link-grid">${queryCards}</div></section>
<section class="section"><div class="section-head"><div><h2>비교 페이지 연결</h2><p>비슷한 브랜드끼리 혜택, 검색 흐름, 도메인 점검 포인트를 나란히 볼 수 있게 만들었습니다.</p></div></div><div class="link-grid">${compareCards}</div></section>
</div></div></section></main>
${footer()}`;
}
function buildFaqIndexPage(payload) {
  const canonical = `${SITE}/muktu-police/faq/`;
  const title = '브랜드 FAQ 허브 | 공식주소·가입코드·도메인 질문 모음 | 레븐';
  const description = '브랜드별 공식 주소, 가입코드, 먹튀 검색, 도메인 검사, 결과 페이지에 대한 자주 묻는 질문을 한곳에 묶은 FAQ 허브입니다.';
  return `${pageHead({
    title, description,
    keywords: '브랜드 FAQ, 가입코드 FAQ, 공식주소 FAQ, 도메인 검사 질문, 먹튀 질문',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: 'FAQ', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('faq')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell"><section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">FAQ AUTO PACK</span><h1>브랜드 질문을 FAQ 팩으로 묶어<br/>검색형 페이지와 같이 연결했습니다.</h1><p>공식 주소, 가입코드, 먹튀 검색, 도메인 검사, 결과 페이지 역할까지 브랜드별 질문을 같은 구조로 정리했습니다.</p></div><aside class="hero-side-stack"><article class="glass-card"><h3>FAQ 허브 역할</h3><p>질문형 검색 유입을 받으면서 동시에 브랜드 결과와 비교 페이지로 내부링크를 연결합니다.</p></article></aside></div></section><section class="section"><div class="brand-directory-grid">${payload.brands.map((brand) => `<article class="brand-card" data-theme="${escapeHtml(brand.theme)}"><div class="brand-topline"><span class="promo-kicker">${escapeHtml(brand.name)} FAQ</span>${statusBadge(brand)}</div><h3>${escapeHtml(brand.displayTitle)}</h3><p>${escapeHtml(brand.faq?.[0]?.a || brand.summary)}</p><div class="brand-chip-row">${cardTags(brand)}</div><div class="promo-actions"><a class="safety-link-btn" href="${faqRoute(brand)}">FAQ 열기</a><a class="safety-link-btn ghost" href="${brandRoute(brand)}">결과 페이지</a></div></article>`).join('')}</div></section></div></div></section></main>${footer()}`;
}
function buildFaqPage(brand, payload, pairs) {
  const canonical = `${SITE}${faqRoute(brand)}`;
  const title = `${brand.displayTitle} FAQ | 공식주소·가입코드·도메인 질문 | 레븐`;
  const description = `${brand.name} 공식 주소, 가입코드, 먹튀 검색, 도메인 검사, 결과 페이지에 대한 자주 묻는 질문을 정리한 FAQ 페이지입니다.`;
  const compareLinks = pairs.filter(([a,b]) => a.slug === brand.slug || b.slug === brand.slug).map(([a,b]) => {
    const other = a.slug === brand.slug ? b : a;
    return `<a href="${compareRoute(a,b)}">${escapeHtml(brand.name)} vs ${escapeHtml(other.name)}</a>`;
  }).join('');
  return `${pageHead({
    title, description,
    keywords: `${brand.name} FAQ, ${brand.name} 가입코드, ${brand.name} 공식주소, ${brand.name} 먹튀, ${brand.name} 도메인`,
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: 'FAQ', item: `${SITE}/muktu-police/faq/` }, { name: `${brand.name} FAQ`, item: canonical }]),
    pageJson: collectionJson(title, description, canonical),
    extraJson: [faqSchema(brand)]
  })}
${header('faq')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell"><section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">BRAND FAQ</span><h1>${escapeHtml(brand.displayTitle)}<br/>자주 묻는 질문</h1><p>질문형 검색 유입에 맞춰 공식 주소, 가입코드, 도메인 검사, 결과 페이지 역할을 짧고 명확하게 정리했습니다.</p><div class="search-actions compact-actions" style="margin-top:16px"><a class="safety-link-btn" href="${brandRoute(brand)}">결과 페이지</a><a class="safety-link-btn ghost" href="/muktu-police/check/?domain=${encodeURIComponent(brand.lookupDomain)}">도메인 검사</a><a class="safety-link-btn ghost" href="/muktu-police/query/${brand.slug}-muktu/">먹튀 검색팩</a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>브랜드 상태</h3><p>${escapeHtml(brand.status?.label || brand.statusLabel)}</p></article></aside></div></section><section class="section"><div class="faq-list">${(brand.faq || []).map((item) => `<details class="faq-item" open><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')}</div></section><section class="section"><div class="section-head"><div><h2>연결 페이지</h2><p>질문만 보고 끝나지 않도록 결과·비교·검색형 페이지를 같이 연결했습니다.</p></div></div><div class="inline-links"><a href="${brandRoute(brand)}">브랜드 결과</a>${compareLinks}<a href="/muktu-police/query/${brand.slug}-review/">후기 검색팩</a><a href="/muktu-police/query/${brand.slug}-domain/">도메인 변경 검색팩</a></div></section></div></div></section></main>${footer()}`;
}
function buildCompareIndexPage(payload, pairs) {
  const canonical = `${SITE}/muktu-police/compare/`;
  const title = '브랜드 비교 허브 | 결과·혜택·도메인 점검 비교 | 레븐';
  const description = '브랜드별 혜택 요약, 검색 흐름, 도메인 점검 포인트, 진입 문구를 비교 카드로 정리한 비교 허브입니다.';
  return `${pageHead({
    title, description,
    keywords: '브랜드 비교, 메이저사이트 비교, 가입코드 비교, 도메인 점검 비교',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 비교', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('compare')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell"><section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">COMPARE MODULE</span><h1>브랜드 비교 페이지를 자동 생성해<br/>비슷한 선택지를 한 화면에 묶었습니다.</h1><p>혜택 요약, 검색 흐름, 도메인 점검 포인트, 진입 문구를 두 브랜드 기준으로 나란히 볼 수 있습니다.</p></div></div></section><section class="section"><div class="link-grid">${pairs.map(([left,right]) => `<article class="quick-link-card"><a href="${compareRoute(left,right)}">${escapeHtml(left.name)} vs ${escapeHtml(right.name)} ↗</a><p>${escapeHtml(left.oneLine)} / ${escapeHtml(right.oneLine)}</p></article>`).join('')}</div></section></div></div></section></main>${footer()}`;
}
function compareCells(left, right) {
  const rows = [
    ['혜택 요약', left.compareFocus?.benefit || left.rewardSummary, right.compareFocus?.benefit || right.rewardSummary],
    ['검색 흐름', left.compareFocus?.search || left.oneLine, right.compareFocus?.search || right.oneLine],
    ['도메인 점검', left.compareFocus?.domain || left.headline, right.compareFocus?.domain || right.headline],
    ['진입 문구', left.compareFocus?.entry || left.conversionVariants?.[0]?.title, right.compareFocus?.entry || right.conversionVariants?.[0]?.title]
  ];
  return rows.map((row) => `<tr><th>${escapeHtml(row[0])}</th><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`).join('');
}
function buildComparePage(left, right) {
  const slug = compareSlug(left, right);
  const canonical = `${SITE}/muktu-police/compare/${slug}/`;
  const title = `${left.name} vs ${right.name} 비교 | 혜택·도메인·결과 흐름 | 레븐`;
  const description = `${joinAnd(left.name, right.name)}의 혜택 요약, 검색 흐름, 도메인 점검 포인트, 진입 문구를 비교한 정적 비교 페이지입니다.`;
  return `${pageHead({
    title, description,
    keywords: `${left.name} ${right.name} 비교, ${left.name} vs ${right.name}, 브랜드 비교, 도메인 비교`,
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: '브랜드 비교', item: `${SITE}/muktu-police/compare/` }, { name: `${left.name} vs ${right.name}`, item: canonical }]),
    pageJson: collectionJson(title, description, canonical),
    extraJson: [articleSchema(title, description, canonical)]
  })}
${header('compare')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell"><section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">COMPARE PAGE</span><h1>${escapeHtml(left.name)} vs ${escapeHtml(right.name)}<br/>핵심 비교</h1><p>두 브랜드의 혜택, 검색 흐름, 도메인 점검 포인트, 진입 문구를 같은 기준으로 정리했습니다. 광고카드를 보기 전 비교 기준이 필요한 사용자에게 맞춘 페이지입니다.</p><div class="search-actions compact-actions" style="margin-top:16px"><a class="safety-link-btn" href="${brandRoute(left)}">${escapeHtml(left.name)} 결과</a><a class="safety-link-btn" href="${brandRoute(right)}">${escapeHtml(right.name)} 결과</a><a class="safety-link-btn ghost" href="${faqRoute(left)}">${escapeHtml(left.name)} FAQ</a><a class="safety-link-btn ghost" href="${faqRoute(right)}">${escapeHtml(right.name)} FAQ</a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>비교 기준</h3><p>혜택 요약, 검색 흐름, 도메인 점검 포인트, 진입 문구 4개 축으로 비교합니다.</p></article></aside></div></section><section class="section"><div class="safety-table-wrap"><table class="safety-table compare-table"><thead><tr><th>항목</th><th>${escapeHtml(left.name)}</th><th>${escapeHtml(right.name)}</th></tr></thead><tbody>${compareCells(left, right)}</tbody></table></div></section><section class="section"><div class="promo-grid">
<article class="promo-card" data-theme="${escapeHtml(left.theme)}"><div class="promo-topline"><span class="promo-kicker">${escapeHtml(left.name)}</span>${statusBadge(left)}</div><h3>${escapeHtml(left.displayTitle)}</h3><p class="promo-summary">${escapeHtml(left.oneLine)}</p><div class="promo-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(left.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn ghost" href="${brandRoute(left)}">결과 보기</a></div></article>
<article class="promo-card" data-theme="${escapeHtml(right.theme)}"><div class="promo-topline"><span class="promo-kicker">${escapeHtml(right.name)}</span>${statusBadge(right)}</div><h3>${escapeHtml(right.displayTitle)}</h3><p class="promo-summary">${escapeHtml(right.oneLine)}</p><div class="promo-actions"><button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(right.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button><a class="safety-link-btn ghost" href="${brandRoute(right)}">결과 보기</a></div></article>
</div></section></div></div></section></main>${footer()}`;
}
function buildQueryIndexPage(payload) {
  const canonical = `${SITE}/muktu-police/query/`;
  const title = 'SEO 검색팩 허브 | 먹튀·후기·도메인 롱테일 페이지 | 레븐';
  const description = '브랜드명 먹튀, 후기, 메이저, 도메인 변경, 주소, 가입코드 같은 검색 의도를 브랜드별 정적 페이지로 묶은 SEO 검색팩 허브입니다.';
  const cards = payload.brands.flatMap((brand) => (brand.seoLongtails || []).slice(0, 3).map((item) => `<article class="quick-link-card"><a href="${queryRoute(item)}">${escapeHtml(item.query)} ↗</a><p>${escapeHtml(item.description)}</p></article>`)).join('');
  return `${pageHead({
    title, description,
    keywords: '먹튀 검색, 후기 검색, 도메인 변경 검색, 가입코드 검색, SEO 롱테일',
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: 'SEO 검색팩', item: canonical }]),
    pageJson: collectionJson(title, description, canonical)
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell"><section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">LONGTAIL SEO PACK</span><h1>브랜드명 + 먹튀·후기·주소·가입코드<br/>검색 의도를 정적 페이지로 분리했습니다.</h1><p>검색 의도를 페이지 단위로 분리해 내부링크와 사이트맵에 자동으로 반영하는 구조입니다. 브랜드를 추가하면 같은 규칙으로 같이 늘어납니다.</p></div></div></section><section class="section"><div class="link-grid">${cards}</div></section></div></div></section></main>${footer()}`;
}
function buildQueryPage(brand, item) {
  const canonical = `${SITE}${queryRoute(item)}`;
  const title = `${item.title} | 레븐`;
  const description = item.description;
  return `${pageHead({
    title, description,
    keywords: `${item.query}, ${brand.name}, ${brand.officialDomain}, 롱테일 검색, 먹튀 검색`,
    canonical,
    breadcrumbJson: breadcrumb([{ name: '메인', item: `${SITE}/` }, { name: '먹튀폴리스', item: `${SITE}/muktu-police/` }, { name: 'SEO 검색팩', item: `${SITE}/muktu-police/query/` }, { name: item.label, item: canonical }]),
    pageJson: collectionJson(title, description, canonical),
    extraJson: [articleSchema(title, description, canonical)]
  })}
${header('brand')}
<main id="mainContent"><section class="section"><div class="container"><div class="safety-shell"><section class="safety-hero hero-tight"><div class="safety-hero-grid compact-grid"><div><span class="safety-kicker">${escapeHtml(item.label)}</span><h1>${escapeHtml(item.query)}<br/>검색 포인트</h1><p>${escapeHtml(item.guide)}</p><div class="search-actions compact-actions" style="margin-top:16px"><a class="safety-link-btn" href="https://www.google.com/search?q=${encodeURIComponent(item.query)}" target="_blank" rel="noopener noreferrer">구글에서 보기</a><button class="safety-copy-btn ghost" type="button" data-copy-text="${escapeHtml(item.query)}"><span data-copy-label data-default-label="검색어 복사">검색어 복사</span></button><a class="safety-link-btn ghost" href="${brandRoute(brand)}">브랜드 결과</a><a class="safety-link-btn ghost" href="${faqRoute(brand)}">FAQ 보기</a></div></div><aside class="hero-side-stack"><article class="glass-card"><h3>권장 흐름</h3><p>검색 결과 → 도메인 검사 → 브랜드 결과 → 공식 주소 이동 순서로 보는 쪽이 실전 동선이 짧습니다.</p></article></aside></div></section><section class="section"><div class="tool-grid">
<article class="tool-card"><div class="tool-top"><span class="tool-badge">QUERY</span></div><h3>검색어</h3><p>${escapeHtml(item.query)}</p></article>
<article class="tool-card"><div class="tool-top"><span class="tool-badge">DOMAIN</span></div><h3>도메인 검사</h3><p>${escapeHtml(brand.officialDomain)} 기준으로 주소 이력을 같이 확인합니다.</p><div class="card-actions"><a class="safety-link-btn mint" href="/muktu-police/check/?domain=${encodeURIComponent(brand.lookupDomain)}">도메인 검사</a></div></article>
<article class="tool-card"><div class="tool-top"><span class="tool-badge">RESULT</span></div><h3>브랜드 결과</h3><p>${escapeHtml(brand.oneLine)}</p><div class="card-actions"><a class="safety-link-btn ghost" href="${brandRoute(brand)}">결과 보기</a></div></article>
</div></section></div></div></section></main>${footer()}`;
}
async function main() {
  const payload = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  const brands = Array.isArray(payload?.brands) ? payload.brands : [];
  const pairs = comparePairs(brands);
  await fs.mkdir(outBrandDir, { recursive: true });
  await fs.mkdir(outFaqDir, { recursive: true });
  await fs.mkdir(outCompareDir, { recursive: true });
  await fs.mkdir(outQueryDir, { recursive: true });

  await fs.writeFile(path.join(outBrandDir, 'index.html'), buildBrandIndexPage(payload, pairs), 'utf8');
  await fs.writeFile(path.join(outFaqDir, 'index.html'), buildFaqIndexPage(payload), 'utf8');
  await fs.writeFile(path.join(outCompareDir, 'index.html'), buildCompareIndexPage(payload, pairs), 'utf8');
  await fs.writeFile(path.join(outQueryDir, 'index.html'), buildQueryIndexPage(payload), 'utf8');

  const manifest = { updated: payload.updated, brands: [], faqRoutes: [], compareRoutes: [], queryRoutes: [] };
  for (const brand of brands) {
    const brandDir = path.join(outBrandDir, brand.slug);
    const faqDir = path.join(outFaqDir, brand.slug);
    await fs.mkdir(brandDir, { recursive: true });
    await fs.mkdir(faqDir, { recursive: true });
    await fs.writeFile(path.join(brandDir, 'index.html'), buildBrandPage(brand, payload, pairs), 'utf8');
    await fs.writeFile(path.join(faqDir, 'index.html'), buildFaqPage(brand, payload, pairs), 'utf8');
    manifest.brands.push(brandRoute(brand));
    manifest.faqRoutes.push(faqRoute(brand));
    for (const item of brand.seoLongtails || []) {
      const qDir = path.join(outQueryDir, item.slug);
      await fs.mkdir(qDir, { recursive: true });
      await fs.writeFile(path.join(qDir, 'index.html'), buildQueryPage(brand, item), 'utf8');
      manifest.queryRoutes.push(queryRoute(item));
    }
  }
  for (const [left, right] of pairs) {
    const cDir = path.join(outCompareDir, compareSlug(left, right));
    await fs.mkdir(cDir, { recursive: true });
    await fs.writeFile(path.join(cDir, 'index.html'), buildComparePage(left, right), 'utf8');
    manifest.compareRoutes.push(compareRoute(left, right));
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Generated ${brands.length} brands, ${manifest.faqRoutes.length} faq pages, ${manifest.compareRoutes.length} compare pages, ${manifest.queryRoutes.length} query pages.`);
}
await main();
