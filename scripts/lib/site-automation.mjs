import fs from 'fs/promises';
import path from 'path';

export const ROOT = process.cwd();
export const SITE_ORIGIN = 'https://88st.cloud';
export const POSTS_FILE = path.join(ROOT, 'assets/data/posts.index.v1.20260318.json');
export const TODAY = '2026-03-22';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/img/logo.png`;

export const PRIVATE_PATH_PREFIXES = ['/admin/', '/ops/', '/seo/'];
export const IGNORED_PATH_PREFIXES = ['/serverless/'];

export const CATEGORY_OG_IMAGE_MAP = {
  casino: `${SITE_ORIGIN}/img/img1.webp`,
  slot: `${SITE_ORIGIN}/img/img2.webp`,
  bonus: `${SITE_ORIGIN}/img/img1.jpg`,
  strategy: `${SITE_ORIGIN}/img/img2.jpg`,
  news: `${SITE_ORIGIN}/img/img2.webp`,
  analysis: `${SITE_ORIGIN}/img/img1.webp`,
  guide: `${SITE_ORIGIN}/img/img2.jpg`,
  archive: `${SITE_ORIGIN}/img/logo.png`,
  home: `${SITE_ORIGIN}/img/logo.png`
};

export const PUBLIC_PAGE_CONFIG = {
  '/': {
    pageType: 'website',
    title: '레븐 | 카지노 · 슬롯 · 파워볼 콘텐츠',
    description: '카지노 · 슬롯 · 파워볼 콘텐츠 허브 레븐. 카테고리, 추천 묶음, 초보 추천 루트를 메인에서 바로 확인할 수 있습니다.',
    keywords: ['레븐','카지노','슬롯','파워볼','카지노 허브','슬롯 허브','보너스','전략','뉴스'],
    ogImage: CATEGORY_OG_IMAGE_MAP.home,
    collectionName: '레븐 | 카지노·슬롯 블로그 허브'
  },
  '/analysis/': {
    pageType: 'collection',
    title: '스포츠 배당 체크 센터 | 승무패·승패·오버언더·핸디캡 | 레븐',
    description: '스포츠 전종목에 공통으로 쓸 수 있는 간단 배당 체크 UI. 승무패, 승패, 오버·언더, 핸디캡 시장을 하나의 구조로 묶어 마진과 공정배당을 확인합니다.',
    keywords: ['배당분석','스포츠 배당','오버언더','핸디캡','승무패','승패','배당 계산'],
    ogImage: CATEGORY_OG_IMAGE_MAP.analysis,
    collectionName: '스포츠 배당 분석 | 레븐'
  },
  '/casino/': {
    pageType: 'collection',
    title: '카지노 허브 | 바카라·룰렛·블랙잭·라이브 카지노 아카이브 | 레븐',
    description: '바카라, 룰렛, 블랙잭, 라이브 카지노, 배팅기법, 자본 운영 글을 블로그 아카이브처럼 읽을 수 있게 재정리한 레븐 카지노 허브.',
    keywords: ['카지노','바카라','룰렛','블랙잭','라이브 카지노','카지노 글 모음','카지노 허브'],
    ogImage: CATEGORY_OG_IMAGE_MAP.casino,
    collectionName: '카지노 허브 | 바카라·룰렛·블랙잭·라이브 카지노 아카이브 | 레븐'
  },
  '/slot/': {
    pageType: 'collection',
    title: '슬롯 허브 | RTP·변동성·무료회전·구조 아카이브 | 레븐',
    description: 'RTP, 변동성, 무료회전, 멀티플라이어, 구조 읽기, 세션 운영 글을 블로그 아카이브처럼 묶은 레븐 슬롯 허브.',
    keywords: ['슬롯','RTP','변동성','무료회전','슬롯 허브','슬롯 글 모음'],
    ogImage: CATEGORY_OG_IMAGE_MAP.slot,
    collectionName: '슬롯 허브 | RTP·변동성·무료회전·구조 아카이브 | 레븐'
  },
  '/bonus/': {
    pageType: 'collection',
    title: '보너스 허브 | 가입 보너스·롤링 조건·VIP 혜택 아카이브 | 레븐',
    description: '가입 보너스, 롤링 조건, 제외 게임, VIP 혜택, 프로모션 캘린더까지 블로그 아카이브처럼 읽을 수 있게 재정리한 레븐 보너스 허브.',
    keywords: ['보너스','가입 보너스','롤링 조건','VIP 혜택','보너스 허브'],
    ogImage: CATEGORY_OG_IMAGE_MAP.bonus,
    collectionName: '보너스 허브 | 가입 보너스·롤링 조건·VIP 혜택 아카이브 | 레븐'
  },
  '/strategy/': {
    pageType: 'collection',
    title: '전략 허브 | 자본 운영·손절·세션 체크리스트 아카이브 | 레븐',
    description: '자본 운영, 손절 규칙, 세션 체크리스트, 회복 착각, 기록 습관까지 블로그 아카이브처럼 읽을 수 있게 재정리한 레븐 전략 허브.',
    keywords: ['전략','자본 운영','손절','세션 체크리스트','전략 허브'],
    ogImage: CATEGORY_OG_IMAGE_MAP.strategy,
    collectionName: '전략 허브 | 자본 운영·손절·세션 체크리스트 아카이브 | 레븐'
  },
  '/news/': {
    pageType: 'collection',
    title: '스포츠 뉴스 허브 | 해외 매체 · 한국 뉴스 요약 | 레븐',
    description: '해외 스포츠 매체 뉴스와 한국 뉴스 흐름을 한글 중심으로 정리한 레븐 뉴스 허브. 메인과 같은 피드를 별도 허브에서도 확인합니다.',
    keywords: ['스포츠 뉴스','해외 스포츠 뉴스','국내 스포츠 뉴스','뉴스 허브'],
    ogImage: CATEGORY_OG_IMAGE_MAP.news,
    collectionName: '스포츠 뉴스 허브 | 해외 매체 · 한국 뉴스 요약 | 레븐'
  },
  '/archive/': {
    pageType: 'collection',
    title: '전체 글 아카이브 | 카지노·슬롯·보너스·전략 글 모음 | 레븐',
    description: '카테고리별로 쌓인 게시글을 한 번에 확인하는 전체 아카이브 페이지.',
    keywords: ['전체 글','아카이브','카지노 글 모음','슬롯 글 모음','보너스 글 모음','전략 글 모음'],
    ogImage: CATEGORY_OG_IMAGE_MAP.archive,
    collectionName: '전체 글 아카이브 | 레븐'
  },
  '/latest/': {
    pageType: 'collection',
    title: '최신 글 | 최근 업데이트된 핵심 글 모음 | 레븐',
    description: '최근 업데이트된 핵심 글을 카테고리별로 빠르게 확인하는 최신 글 페이지.',
    keywords: ['최신 글','최근 업데이트','카지노 최신 글','슬롯 최신 글'],
    ogImage: CATEGORY_OG_IMAGE_MAP.archive,
    collectionName: '최신 글 | 레븐'
  },
  '/popular/': {
    pageType: 'collection',
    title: '인기 글 | 많이 읽는 핵심 글 모음 | 레븐',
    description: '많이 읽는 핵심 글을 카테고리별로 정리한 인기 글 페이지.',
    keywords: ['인기 글','많이 보는 글','카지노 인기 글','슬롯 인기 글'],
    ogImage: CATEGORY_OG_IMAGE_MAP.archive,
    collectionName: '인기 글 | 레븐'
  },
  '/play-guides/': {
    pageType: 'collection',
    title: '가이드 라이브러리 | 카지노 배팅기법·미니게임 가이드 | 레븐',
    description: '카지노 배팅기법과 미니게임 운영 가이드를 한 번에 모아 본 라이브러리 페이지.',
    keywords: ['가이드','카지노 배팅기법','미니게임 가이드','가이드 라이브러리'],
    ogImage: CATEGORY_OG_IMAGE_MAP.guide,
    collectionName: '가이드 라이브러리 | 레븐'
  },
  '/odds/': {
    pageType: 'webpage',
    title: '오즈 체크 | 확률·공정배당 계산 보조 페이지 | 레븐',
    description: '배당률과 확률을 빠르게 계산하는 오즈 체크 보조 페이지.',
    keywords: ['오즈 체크','공정배당','확률 계산','배당 계산'],
    ogImage: CATEGORY_OG_IMAGE_MAP.analysis,
    collectionName: '오즈 체크 | 레븐'
  }
};

export function normalizePathname(pathname) {
  if (!pathname) return '/';
  let next = String(pathname).trim();
  next = next.replace(/\\/g, '/');
  if (!next.startsWith('/')) next = `/${next}`;
  if (next.endsWith('/index.html')) next = next.slice(0, -'index.html'.length);
  return next.endsWith('/') ? next : `${next}/`;
}

export function pathnameToFile(pathname) {
  return path.join(ROOT, pathname.replace(/^\//, ''), 'index.html');
}

export function fileToPathname(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return normalizePathname(rel.replace(/\/index\.html$/i, '/'));
}

export function urlFor(pathname) {
  return `${SITE_ORIGIN}${normalizePathname(pathname)}`;
}

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export async function loadPosts() {
  const payload = await readJson(POSTS_FILE);
  const posts = Array.isArray(payload?.posts) ? payload.posts : [];
  return { payload, posts };
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function shortText(value, max = 150) {
  const clean = stripHtml(value);
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}

export function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/gi, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function dedupeList(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const value = String(item ?? '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export function keywordSeed(post) {
  return dedupeList([
    ...(Array.isArray(post?.keywords) ? post.keywords : []),
    post?.label,
    post?.section,
    post?.tag,
    post?.badge,
    post?.category,
    '레븐'
  ]);
}

export function pickOgImage(postOrConfig) {
  const direct = postOrConfig?.heroImage || postOrConfig?.image || postOrConfig?.ogImage || postOrConfig?.coverImage;
  if (direct) {
    if (String(direct).startsWith('http')) return direct;
    return `${SITE_ORIGIN}${String(direct).startsWith('/') ? direct : `/${direct}`}`;
  }
  const category = String(postOrConfig?.category || postOrConfig?.pageType || '').toLowerCase();
  return CATEGORY_OG_IMAGE_MAP[category] || DEFAULT_OG_IMAGE;
}

export function isPrivatePath(pathname) {
  return PRIVATE_PATH_PREFIXES.some((prefix) => normalizePathname(pathname).startsWith(prefix));
}

export function isIgnoredPath(pathname) {
  return IGNORED_PATH_PREFIXES.some((prefix) => normalizePathname(pathname).startsWith(prefix));
}

export async function listHtmlFiles(dir = ROOT) {
  const files = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git'].includes(entry.name)) continue;
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(full);
      }
    }
  }
  await walk(dir);
  return files.sort();
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
}

export function buildArticleJsonLd(post, canonical, ogImage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    name: post.title,
    description: String(post.seoDescription || post.excerpt || post.title).trim(),
    inLanguage: 'ko-KR',
    url: canonical,
    image: [ogImage],
    datePublished: String(post.published || post.updated || TODAY).trim(),
    dateModified: String(post.updated || post.published || TODAY).trim(),
    articleSection: String(post.section || post.label || post.category || '블로그').trim(),
    keywords: keywordSeed(post),
    timeRequired: `PT${Math.max(1, Number(post.readingMins || 2))}M`,
    mainEntityOfPage: canonical,
    author: { '@type': 'Organization', name: '레븐' },
    publisher: {
      '@type': 'Organization',
      name: '레븐',
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/img/logo.png` }
    },
    isAccessibleForFree: true
  };
}

export function buildCollectionJsonLd(config, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': config.pageType === 'website' ? 'CollectionPage' : (config.pageType === 'webpage' ? 'WebPage' : 'CollectionPage'),
    name: config.collectionName || config.title,
    headline: config.collectionName || config.title,
    description: config.description,
    inLanguage: 'ko-KR',
    url: canonical,
    image: [pickOgImage(config)],
    dateModified: TODAY
  };
}

export function buildWebsiteJsonLd(canonical, config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '레븐',
    url: canonical,
    inLanguage: 'ko-KR',
    description: config.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ORIGIN}/archive/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function humanCategory(category) {
  const map = {
    casino: '카지노',
    slot: '슬롯',
    bonus: '보너스',
    strategy: '전략',
    news: '뉴스',
    guide: '가이드',
    analysis: '배당분석'
  };
  return map[String(category || '').toLowerCase()] || String(category || '콘텐츠');
}

export function baseMetaSpec(pathname, html) {
  const normalized = normalizePathname(pathname);
  const config = PUBLIC_PAGE_CONFIG[normalized];
  if (config) return config;
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = stripHtml(titleMatch?.[1] || '레븐 콘텐츠');
  const descMatch = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const description = stripHtml(descMatch?.[1] || `${title} 페이지`);
  const pageType = normalized.includes('/archive/') ? 'collection' : 'webpage';
  return {
    pageType,
    title,
    description,
    keywords: dedupeList([title, '레븐']),
    ogImage: pickOgImage({ pageType })
  };
}

export async function writeTextIfChanged(filePath, next) {
  let prev = null;
  try {
    prev = await fs.readFile(filePath, 'utf8');
  } catch {}
  if (prev === next) return false;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, next, 'utf8');
  return true;
}
