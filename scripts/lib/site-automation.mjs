import fs from 'fs/promises';
import path from 'path';

export const ROOT = process.cwd();
export const SITE_ORIGIN = 'https://88st.cloud';
export const POSTS_FILE = path.join(ROOT, 'assets/data/posts.index.v1.20260318.json');
export const NOINDEX_PREFIXES = ['/admin/', '/ops/', '/seo/'];

export const CATEGORY_OG_IMAGES = {
  home: `${SITE_ORIGIN}/img/logo.png`,
  casino: `${SITE_ORIGIN}/img/landing/vegas-landing.webp`,
  slot: `${SITE_ORIGIN}/img/promotions/tronbet-card.webp`,
  bonus: `${SITE_ORIGIN}/img/img1.webp`,
  strategy: `${SITE_ORIGIN}/img/img2.webp`,
  news: `${SITE_ORIGIN}/img/img2.webp`,
  analysis: `${SITE_ORIGIN}/img/logo.png`,
  archive: `${SITE_ORIGIN}/img/logo.png`,
  guide: `${SITE_ORIGIN}/img/logo.png`,
  odds: `${SITE_ORIGIN}/img/logo.png`,
  default: `${SITE_ORIGIN}/img/logo.png`
};

export async function loadPosts() {
  const payload = JSON.parse(await fs.readFile(POSTS_FILE, 'utf8'));
  const posts = Array.isArray(payload?.posts) ? payload.posts : [];
  return { payload, posts };
}

export function normalizePath(pathname) {
  if (!pathname) return '/';
  let next = String(pathname).trim();
  if (!next.startsWith('/')) next = `/${next}`;
  if (!next.endsWith('/')) next += '/';
  return next.replace(/\/+/g, '/');
}

export function isNoindexPath(pathname) {
  const clean = normalizePath(pathname);
  return NOINDEX_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(prefix));
}

export function toFilePath(pathname) {
  const clean = normalizePath(pathname);
  if (clean === '/') return path.join(ROOT, 'index.html');
  return path.join(ROOT, clean.replace(/^\//, ''), 'index.html');
}

export function urlFor(pathname) {
  return `${SITE_ORIGIN}${normalizePath(pathname)}`;
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

export async function listHtmlRoutes() {
  const routes = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (['assets', 'config', 'docs', 'img', 'scripts', 'serverless', '.git', 'node_modules'].includes(entry.name)) continue;
        await walk(full);
        continue;
      }
      if (entry.name !== 'index.html') continue;
      let pathname = `/${path.dirname(rel)}/`.replace(/\/+/g, '/');
      if (pathname === '/./') pathname = '/';
      pathname = pathname.replace(/\/+/g, '/');
      if (pathname === '/index.html/') pathname = '/';
      if (pathname.endsWith('/./')) pathname = pathname.slice(0, -2);
      if (pathname === '//') pathname = '/';
      routes.push(normalizePath(pathname));
    }
  }
  await walk(ROOT);
  return [...new Set(routes)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b, 'ko')));
}

export function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

export function slugTokens(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/[^0-9a-z가-힣 ]+/g, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

export function uniq(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const clean = String(item ?? '').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}

export function inferCategoryFromPath(pathname) {
  const clean = normalizePath(pathname);
  if (clean === '/') return 'home';
  if (clean.startsWith('/casino/')) return 'casino';
  if (clean.startsWith('/slot/')) return 'slot';
  if (clean.startsWith('/bonus/')) return 'bonus';
  if (clean.startsWith('/strategy/')) return 'strategy';
  if (clean.startsWith('/news/')) return 'news';
  if (clean.startsWith('/analysis/')) return 'analysis';
  if (clean.startsWith('/archive/') || clean.endsWith('/archive/')) return 'archive';
  if (clean.startsWith('/play-guides/')) return 'guide';
  if (clean.startsWith('/odds/')) return 'odds';
  return 'default';
}

export function ogImageFor(pathname, post = null) {
  const category = post?.category || inferCategoryFromPath(pathname);
  return CATEGORY_OG_IMAGES[category] || CATEGORY_OG_IMAGES.default;
}

export function titleForCorePath(pathname) {
  const map = {
    '/': '레븐 | 카지노 · 슬롯 · 파워볼 콘텐츠',
    '/analysis/': '배당분석 | 레븐',
    '/casino/': '카지노 허브 | 레븐',
    '/slot/': '슬롯 허브 | 레븐',
    '/bonus/': '보너스 허브 | 레븐',
    '/strategy/': '전략 허브 | 레븐',
    '/news/': '뉴스 허브 | 레븐',
    '/play-guides/': '가이드 허브 | 레븐',
    '/latest/': '최신 글 | 레븐',
    '/popular/': '인기 글 | 레븐',
    '/archive/': '전체 글 아카이브 | 레븐',
    '/casino/archive/': '카지노 전체 글 | 레븐',
    '/slot/archive/': '슬롯 전체 글 | 레븐',
    '/bonus/archive/': '보너스 전체 글 | 레븐',
    '/strategy/archive/': '전략 전체 글 | 레븐'
  };
  return map[normalizePath(pathname)] || null;
}

export function descriptionForCorePath(pathname) {
  const map = {
    '/': '카지노 · 슬롯 · 파워볼 콘텐츠 허브 레븐. 카테고리와 추천 루트, 핵심 글을 빠르게 확인할 수 있습니다.',
    '/analysis/': '배당 체크와 스포츠 분석 흐름을 빠르게 확인하는 레븐 분석기 페이지입니다.',
    '/casino/': '바카라·블랙잭·룰렛과 카지노 운영 글을 한곳에 모은 허브입니다.',
    '/slot/': 'RTP·변동성·무료회전·운영 팁을 모은 슬롯 허브입니다.',
    '/bonus/': '첫충·매충·롤링·출금 조건을 확인하는 보너스 허브입니다.',
    '/strategy/': '자본 관리·손절·세션 체크를 다루는 전략 허브입니다.',
    '/news/': '스포츠 뉴스와 영향도 요약을 빠르게 확인하는 뉴스 허브입니다.',
    '/play-guides/': '처음 읽기 좋은 루트와 실전형 안내 글을 모은 가이드 허브입니다.',
    '/latest/': '최근 추가된 글을 빠르게 확인할 수 있는 최신 글 모음입니다.',
    '/popular/': '자주 보는 글을 묶어둔 인기 글 모음입니다.',
    '/archive/': '카테고리 전체 글을 한 번에 탐색할 수 있는 아카이브입니다.'
  };
  return map[normalizePath(pathname)] || null;
}

export function buildKeywords(post) {
  const keywords = uniq([
    ...(Array.isArray(post?.keywords) ? post.keywords : []),
    post?.label,
    post?.section,
    post?.tag,
    post?.badge,
    post?.category === 'casino' ? '바카라 가이드' : '',
    post?.category === 'slot' ? '슬롯 가이드' : '',
    post?.category === 'bonus' ? '보너스 조건' : '',
    post?.category === 'strategy' ? '운영 전략' : '',
    post?.category === 'news' ? '스포츠 뉴스' : '',
    '레븐'
  ]);
  return keywords;
}

export function breadcrumbJson(pathname, post = null) {
  const clean = normalizePath(pathname);
  const items = [{ '@type': 'ListItem', position: 1, name: '메인', item: `${SITE_ORIGIN}/` }];
  const category = post?.category || inferCategoryFromPath(clean);
  const categoryMap = {
    casino: ['카지노 허브', '/casino/'],
    slot: ['슬롯 허브', '/slot/'],
    bonus: ['보너스 허브', '/bonus/'],
    strategy: ['전략 허브', '/strategy/'],
    news: ['뉴스 허브', '/news/'],
    analysis: ['배당분석', '/analysis/'],
    guide: ['가이드 허브', '/play-guides/'],
    archive: ['아카이브', '/archive/']
  };
  if (post) {
    const categoryInfo = categoryMap[category];
    if (categoryInfo) items.push({ '@type': 'ListItem', position: items.length + 1, name: categoryInfo[0], item: urlFor(categoryInfo[1]) });
    items.push({ '@type': 'ListItem', position: items.length + 1, name: post.title, item: urlFor(post.path) });
  } else {
    const title = titleForCorePath(clean);
    const categoryInfo = categoryMap[category];
    if (clean !== '/' && categoryInfo) {
      items.push({ '@type': 'ListItem', position: items.length + 1, name: categoryInfo[0], item: urlFor(categoryInfo[1]) });
    }
    if (clean !== '/' && title) {
      items[items.length - 1] = { '@type': 'ListItem', position: items.length, name: title.replace(' | 레븐', ''), item: urlFor(clean) };
    }
  }
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

export function articleJson(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    name: post.title,
    description: post.seoDescription || post.excerpt || post.title,
    inLanguage: 'ko-KR',
    url: urlFor(post.path),
    datePublished: post.published || post.updated || '',
    dateModified: post.updated || post.published || '',
    articleSection: post.section || post.label || post.category || '블로그',
    keywords: buildKeywords(post),
    timeRequired: post.readingMins ? `PT${post.readingMins}M` : undefined,
    mainEntityOfPage: urlFor(post.path),
    image: [ogImageFor(post.path, post)],
    author: { '@type': 'Organization', name: '레븐' },
    publisher: {
      '@type': 'Organization',
      name: '레븐',
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/img/logo.png` }
    },
    isAccessibleForFree: true
  };
}

export function collectionJson(pathname) {
  const title = titleForCorePath(pathname) || '레븐 | 콘텐츠 허브';
  const description = descriptionForCorePath(pathname) || '카테고리 허브와 아카이브를 제공하는 레븐';
  return {
    '@context': 'https://schema.org',
    '@type': normalizePath(pathname) === '/' ? 'WebSite' : 'CollectionPage',
    name: title,
    url: urlFor(pathname),
    inLanguage: 'ko-KR',
    description
  };
}

export function formatDateDot(value) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return value || '';
  return `${m[2]}.${m[3]}`;
}
