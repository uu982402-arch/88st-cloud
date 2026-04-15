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
  '/': '88ST.Cloud | 메인 허브',
  '/blog/': '블로그 허브 | 실사용 중심 가이드 정리',
  '/tools/': '도구 허브 | 검색·도메인·계산 도구 모음',
  '/guaranteed/': '보증업체 허브 | 공식주소·가입코드 정리',
  '/muktu-police/': '먹튀폴리스 허브 | 도메인 검사·먹튀 사례 조회·메이저 가이드',
  '/muktu-police/search/': '먹튀 사례 조회 | 사이트명 + 먹튀 구글링 생성기',
  '/muktu-police/check/': '도메인 검사 | WHOIS·IP·네임서버 기초 분석',
  '/muktu-police/report/': '결과 페이지 | 도메인 검증 결과 공유 링크'
};

const specialDescriptions = {
  '/': '메인에서 검색·스포츠·핵심 허브만 빠르게 접근할 수 있도록 정리한 시작 페이지입니다.',
  '/blog/': '실사용 중심 글과 체크리스트를 모아둔 블로그 허브입니다.',
  '/tools/': '검색·도메인·조건 해석·계산 도구를 한 번에 모아둔 도구 허브입니다.',
  '/guaranteed/': '보증업체 카드와 공식주소·가입코드 확인 동선을 정리한 허브입니다.',
  '/muktu-police/': '먹튀 사례 조회, 도메인 검사, WHOIS·IP 분석, 메이저 선정 기준을 한 허브에 묶은 페이지입니다.',
  '/muktu-police/search/': '사이트명과 도메인을 입력하면 먹튀, 후기, 메이저 관련 구글 검색을 바로 실행할 수 있는 도구형 페이지입니다.',
  '/muktu-police/check/': '도메인을 넣으면 생성일, 만료일, A 레코드, 네임서버, IP 위치를 함께 확인할 수 있는 기초 점검 페이지입니다.',
  '/muktu-police/report/': '도메인 검사 결과를 결과 페이지 링크 형태로 확인하고 복사할 수 있는 공유형 페이지입니다.'
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
