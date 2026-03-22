import fs from 'fs/promises';
import {
  ROOT, SITE_ORIGIN, BRAND,
  loadPosts, listIndexFiles, routeFromFile, normalizePath, toAbsoluteUrl,
  extractTagText, extractFirstParagraph, extractMetaContent,
  inferCategoryFromRoute, buildSeoTitle, trimDescription, keywordVariants,
  getOgImage, ogAltText, getRobots, classifyPage, buildBreadcrumb,
  makeCollectionSchema, makeWebsiteSchema, makeArticleSchema,
  cleanSchema, replaceOrInsertHead, stripExistingSeoBlocks, escapeHtml,
  isPublicRoute
} from './lib/site-automation.mjs';

const posts = await loadPosts();
const postsByPath = new Map(posts.map((post) => [normalizePath(post.path), post]));
const files = await listIndexFiles(ROOT);

const specialTitles = {
  '/': '레븐 | 카지노·슬롯·보너스 실전 가이드 허브',
  '/analysis/': '배당분석 | 오즈체크와 빠른 배당 확인 허브',
  '/archive/': '전체 글 아카이브 | 카지노·슬롯·보너스·전략 글 모음',
  '/latest/': '최신글 목록 | 최근 업데이트 글 모음',
  '/popular/': '인기글 목록 | 먼저 읽기 좋은 글 모음',
  '/casino/': '카지노 허브 | 바카라·블랙잭·룰렛 실전 가이드',
  '/slot/': '슬롯 허브 | RTP·변동성·무료회전 실전 가이드',
  '/bonus/': '보너스 허브 | 첫충·롤링·출금 조건 실전 가이드',
  '/strategy/': '전략 허브 | 자본 운영·손절·세션 관리 가이드',
  '/news/': '스포츠 뉴스 허브 | 해외 매체·한글 요약 브리핑',
  '/play-guides/': '가이드 허브 | 카지노·미니게임·이용 가이드'
};

const specialDescriptions = {
  '/': '카지노·슬롯·보너스·전략 핵심 글을 빠르게 찾고, 실전형 체크포인트까지 한 번에 확인할 수 있는 메인 허브입니다.',
  '/analysis/': '배당 흐름을 빠르게 확인하고 텔레그램 동선까지 연결해 보는 배당분석 허브입니다.',
  '/archive/': '전체 글을 카테고리 구분 없이 빠르게 훑는 아카이브입니다. 최신 글과 인기 글로도 바로 이동할 수 있습니다.',
  '/latest/': '최근 업데이트된 글을 최신순으로 정리한 목록입니다. 새로 추가된 카지노·슬롯·보너스 글을 빠르게 확인할 수 있습니다.',
  '/popular/': '먼저 읽기 좋은 인기 글을 모은 목록입니다. 입문 글과 운영 글을 빠르게 이어볼 수 있습니다.',
  '/casino/': '바카라·블랙잭·룰렛 중심의 카지노 글을 한곳에 모아, 입문·운영·주의 포인트를 빠르게 찾을 수 있게 정리한 허브입니다.',
  '/slot/': 'RTP·변동성·무료회전·세션 운영 글을 한곳에 모은 슬롯 허브입니다.',
  '/bonus/': '첫충, 매충, 롤링, 출금 인증, 리베이트까지 보너스 실전 확인 흐름을 정리한 허브입니다.',
  '/strategy/': '자본 운영, 손절 규칙, 수익 잠금, 기록 관리까지 실전 운영 기준을 정리한 전략 허브입니다.',
  '/news/': '해외 스포츠 매체와 한국 뉴스 흐름을 한글 중심으로 정리해 빠르게 읽을 수 있게 만든 뉴스 허브입니다.',
  '/play-guides/': '카지노·미니게임 이용 흐름과 체크포인트를 짧게 정리한 가이드 허브입니다.'
};

function buildPageMeta(route, html) {
  const post = postsByPath.get(route);
  const pageType = classifyPage(route, postsByPath);
  const category = post?.category || inferCategoryFromRoute(route);
  const h1 = extractTagText(html, 'h1');
  const fallbackTitle = specialTitles[route] || h1 || extractTagText(html, 'title') || BRAND;
  let title = post?.seoTitle || buildSeoTitle(fallbackTitle, post?.section || specialTitles[route] ? '' : '');
  title = title
    .replace(/\|\s*(카지노|슬롯|보너스|전략|뉴스) 블로그\s*\|\s*레븐/gi, '| $1 실전 가이드 | 레븐')
    .replace(/\|\s*블로그\s*\|\s*레븐/gi, '| 실전 가이드 | 레븐');
  const rawDescription = post?.seoDescription || post?.excerpt || specialDescriptions[route] || extractMetaContent(html, 'description') || extractFirstParagraph(html) || fallbackTitle;
  const description = trimDescription(rawDescription, fallbackTitle);
  const canonical = `${SITE_ORIGIN}${route}`;
  const keywords = keywordVariants(post || {}, route, fallbackTitle, category).join(', ');
  const ogImage = getOgImage(route, post);
  const robots = getRobots(route);
  const section = post?.section || (category && category !== 'default' ? category.toUpperCase() : '페이지');
  const published = post?.published || '';
  const updated = post?.updated || published || '';
  const articleTags = (post?.keywords || []).slice(0, 5);
  return { post, route, pageType, category, h1: fallbackTitle, title, description, canonical, keywords, ogImage, robots, section, published, updated, articleTags };
}

function buildSchema(meta) {
  const schemas = [];
  if (meta.route === '/') {
    schemas.push(cleanSchema(makeWebsiteSchema(meta.title, meta.description)));
    schemas.push(cleanSchema(makeCollectionSchema(meta.title, meta.description, meta.route)));
  } else if (meta.pageType === 'post' && meta.post) {
    schemas.push(cleanSchema(buildBreadcrumb(meta.route, meta.post.title || meta.h1, meta.category)));
    schemas.push(cleanSchema(makeArticleSchema(meta.post, meta.route, meta.title, meta.description, meta.ogImage, keywordVariants(meta.post, meta.route, meta.h1, meta.category))));
  } else if (isPublicRoute(meta.route)) {
    schemas.push(cleanSchema(buildBreadcrumb(meta.route, meta.h1, meta.category)));
    schemas.push(cleanSchema(makeCollectionSchema(meta.title, meta.description, meta.route)));
  }
  return schemas.filter(Boolean);
}

let changed = 0;
for (const file of files) {
  const original = await fs.readFile(file, 'utf8');
  const route = routeFromFile(file);
  const headMatch = original.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) continue;
  const meta = buildPageMeta(route, original);
  const preservedHead = stripExistingSeoBlocks(headMatch[1]);
  const headLines = [
    `<meta charset="utf-8"/>`,
    `<meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport"/>`,
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta content="${escapeHtml(meta.description)}" name="description"/>`,
    `<meta content="${escapeHtml(meta.keywords)}" name="keywords"/>`,
    `<meta content="${escapeHtml(meta.robots)}" name="robots"/>`,
    `<meta content="${escapeHtml(BRAND)}" name="author"/>`,
    `<link href="${escapeHtml(meta.canonical)}" rel="canonical"/>`,
    `<meta content="summary_large_image" name="twitter:card"/>`,
    `<meta content="${escapeHtml(meta.title)}" name="twitter:title"/>`,
    `<meta content="${escapeHtml(meta.description)}" name="twitter:description"/>`,
    `<meta content="${escapeHtml(meta.ogImage)}" name="twitter:image"/>`,
    `<meta content="${escapeHtml(ogAltText(meta.h1, meta.category))}" name="twitter:image:alt"/>`,
    `<meta content="website" property="og:type"/>`,
    `<meta content="${escapeHtml(BRAND)}" property="og:site_name"/>`,
    `<meta content="${escapeHtml(meta.title)}" property="og:title"/>`,
    `<meta content="${escapeHtml(meta.description)}" property="og:description"/>`,
    `<meta content="${escapeHtml(meta.canonical)}" property="og:url"/>`,
    `<meta content="${escapeHtml(meta.ogImage)}" property="og:image"/>`,
    `<meta content="${escapeHtml(ogAltText(meta.h1, meta.category))}" property="og:image:alt"/>`,
    `<meta content="ko_KR" property="og:locale"/>`
  ];
  if (meta.pageType === 'post') {
    headLines.push(`<meta content="article" property="og:type"/>`);
    if (meta.section) headLines.push(`<meta content="${escapeHtml(meta.section)}" property="article:section"/>`);
    if (meta.published) headLines.push(`<meta content="${escapeHtml(meta.published)}" property="article:published_time"/>`);
    if (meta.updated) headLines.push(`<meta content="${escapeHtml(meta.updated)}" property="article:modified_time"/>`);
    for (const tag of meta.articleTags) headLines.push(`<meta content="${escapeHtml(tag)}" property="article:tag"/>`);
  }
  const schemas = buildSchema(meta).map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  const nextHead = `${headLines.join('')}${schemas.join('')}${preservedHead ? `\n${preservedHead}` : ''}`;
  const next = replaceOrInsertHead(original, nextHead);
  if (next !== original) {
    await fs.writeFile(file, next, 'utf8');
    changed += 1;
  }
}
console.log(`SEO/OG/structured data refreshed for ${changed} files.`);
