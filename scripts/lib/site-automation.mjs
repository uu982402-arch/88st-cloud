import fs from 'fs/promises';
import path from 'path';

export const ROOT = process.cwd();
export const SITE_ORIGIN = 'https://88st.cloud';
export const POSTS_FILE = path.join(ROOT, 'assets/data/posts.index.v1.20260318.json');
export const BRAND = '레븐';

export const PRIVATE_PATH_PREFIXES = ['/admin/', '/ops/', '/seo/'];
export const NOINDEX_ROUTE_PREFIXES = [];
export const CATEGORY_LABELS = {
  casino: '카지노',
  slot: '슬롯',
  bonus: '보너스',
  strategy: '전략',
  news: '뉴스',
  analysis: '배당분석',
  guide: '가이드',
  archive: '아카이브',
  safety: '먹튀폴리스'
};

export const CATEGORY_OG_MAP = {
  casino: '/img/og/88st-casino-guide-og.webp',
  slot: '/img/og/88st-slot-guide-og.webp',
  bonus: '/img/og/88st-bonus-guide-og.webp',
  strategy: '/img/og/88st-strategy-guide-og.webp',
  news: '/img/og/88st-news-guide-og.webp',
  analysis: '/img/og/88st-analysis-guide-og.webp',
  guide: '/img/og/88st-default-guide-og.png',
  archive: '/img/logo.png',
  safety: '/img/logo.png',
  default: '/img/logo.png'
};

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

export function normalizePath(pathname = '/') {
  let next = String(pathname || '/').trim();
  if (!next.startsWith('/')) next = `/${next}`;
  if (!next.endsWith('/')) next = `${next}/`;
  return next.replace(/\/+/g, '/');
}

export function routeFromFile(filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return '/';
  return normalizePath(`/${relative.replace(/\/index\.html$/, '/')}`);
}

export function fileFromRoute(route) {
  if (route === '/') return path.join(ROOT, 'index.html');
  return path.join(ROOT, route.replace(/^\//, ''), 'index.html');
}

export function toAbsoluteUrl(inputPath = '/') {
  if (String(inputPath).startsWith('http')) return String(inputPath);
  if (String(inputPath).startsWith('/img/') || /\.[a-z0-9]+$/i.test(String(inputPath))) return `${SITE_ORIGIN}${String(inputPath)}`;
  return `${SITE_ORIGIN}${normalizePath(inputPath)}`;
}

export function isPrivateRoute(route) {
  return PRIVATE_PATH_PREFIXES.some((prefix) => normalizePath(route).startsWith(prefix));
}

export function isNoindexRoute(route) {
  const normalized = normalizePath(route);
  return NOINDEX_ROUTE_PREFIXES.some((prefix) => normalized.startsWith(normalizePath(prefix)));
}

export function isPublicRoute(route) {
  return !isPrivateRoute(route) && !isNoindexRoute(route);
}

export async function loadPosts() {
  const payload = JSON.parse(await fs.readFile(POSTS_FILE, 'utf8'));
  return Array.isArray(payload?.posts) ? payload.posts : [];
}

export async function listIndexFiles(dir = ROOT) {
  const output = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'node_modules') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name === 'index.html') {
        output.push(full);
      }
    }
  }
  await walk(dir);
  return output.sort();
}

export function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractMetaContent(html, name) {
  const byName = html.match(new RegExp(`<meta\\b[^>]*\\bname=["']${escapeRegExp(name)}["'][^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i'));
  if (byName) return stripHtml(byName[1]);
  const byContent = html.match(new RegExp(`<meta\\b[^>]*\\bcontent=["']([^"']*)["'][^>]*\\bname=["']${escapeRegExp(name)}["'][^>]*>`, 'i'));
  return byContent ? stripHtml(byContent[1]) : '';
}

export function extractTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

export function extractFirstParagraph(html) {
  const preferred = html.match(/<p[^>]*class=["'][^"']*(?:hero-desc|article-intro)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  if (preferred) return stripHtml(preferred[1]);
  const generic = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  return generic ? stripHtml(generic[1]) : '';
}

export function inferCategoryFromRoute(route) {
  const normalized = normalizePath(route);
  if (normalized.startsWith('/casino/')) return 'casino';
  if (normalized.startsWith('/slot/')) return 'slot';
  if (normalized.startsWith('/bonus/')) return 'bonus';
  if (normalized.startsWith('/strategy/')) return 'strategy';
  if (normalized.startsWith('/news/')) return 'news';
  if (normalized.startsWith('/odds/')) return 'analysis';
  if (normalized.startsWith('/play-guides/')) return 'guide';
  if (normalized.startsWith('/muktu-police/')) return 'safety';
  if (normalized.startsWith('/archive/') || normalized.startsWith('/latest/') || normalized.startsWith('/popular/')) return 'archive';
  return 'default';
}

export function trimDescription(value, fallback = '') {
  const text = stripHtml(value || fallback).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length <= 120) return text;
  return `${text.slice(0, 117).trim()}...`;
}

export function buildSeoTitle(baseTitle, section = '') {
  const cleaned = String(baseTitle || '').trim();
  if (!cleaned) return `${BRAND} | 88ST.Cloud`;
  if (cleaned.includes(BRAND)) return cleaned;
  const sectionLabel = String(section || '').trim();
  if (!sectionLabel) return `${cleaned} | ${BRAND}`;
  if (cleaned.includes(sectionLabel)) return `${cleaned} | ${BRAND}`;
  return `${cleaned} | ${sectionLabel} 실전 가이드 | ${BRAND}`;
}

export function uniqueKeywords(...groups) {
  const seen = new Set();
  const items = groups.flat().map((item) => String(item || '').trim()).filter(Boolean);
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function keywordVariants(post, route, pageTitle, category) {
  const section = CATEGORY_LABELS[category] || post?.section || '';
  const tag = post?.tag || '';
  return uniqueKeywords(
    post?.keywords || [],
    [section, `${section} 가이드`, `${section} 블로그`, tag, pageTitle, BRAND, '88ST.Cloud'],
    route.includes('archive') ? [`${section} 목록`, `${section} 아카이브`] : [],
    route === '/odds/' ? ['배당분석', '배당 계산', '오즈체크'] : []
  );
}

export function getOgImage(route, post) {
  const category = post?.category || inferCategoryFromRoute(route);
  return toAbsoluteUrl(CATEGORY_OG_MAP[category] || CATEGORY_OG_MAP.default);
}

export function ogAltText(title, category) {
  const section = CATEGORY_LABELS[category] || '블로그';
  return `${title} | ${section} 대표 이미지`;
}

export function getRobots(route) {
  if (isPrivateRoute(route)) return 'noindex,nofollow,noarchive,nosnippet';
  if (isNoindexRoute(route)) return 'noindex,follow,max-image-preview:large';
  return 'index,follow,max-image-preview:large';
}

export function classifyPage(route, postsByPath) {
  const normalized = normalizePath(route);
  if (postsByPath.has(normalized)) return 'post';
  if (normalized === '/') return 'home';
  if (normalized.endsWith('/archive/') || normalized === '/archive/' || normalized === '/latest/' || normalized === '/popular/') return 'archive';
  if (['/casino/','/slot/','/bonus/','/strategy/','/news/','/odds/','/play-guides/','/muktu-police/'].includes(normalized)) return 'hub';
  return 'page';
}

export function buildBreadcrumb(route, pageTitle, category) {
  const items = [{ name: '메인', item: `${SITE_ORIGIN}/` }];
  const normalized = normalizePath(route);
  const sectionLabel = CATEGORY_LABELS[category] || '';
  if (normalized !== '/') {
    if (category && ['casino','slot','bonus','strategy','news'].includes(category) && normalized !== `/${category}/`) {
      items.push({ name: `${sectionLabel} 허브`, item: `${SITE_ORIGIN}/${category}/` });
    } else if (category === 'analysis') {
      items.push({ name: '배당분석', item: `${SITE_ORIGIN}/odds/` });
    } else if (category === 'guide') {
      items.push({ name: '가이드', item: `${SITE_ORIGIN}/play-guides/` });
    } else if (category === 'safety') {
      items.push({ name: '먹튀폴리스', item: `${SITE_ORIGIN}/muktu-police/` });
    }
    items.push({ name: pageTitle, item: `${SITE_ORIGIN}${normalized}` });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.item }))
  };
}

export function makeCollectionSchema(title, description, route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    inLanguage: 'ko-KR',
    url: `${SITE_ORIGIN}${normalizePath(route)}`
  };
}

export function makeWebsiteSchema(title, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: SITE_ORIGIN,
    inLanguage: 'ko-KR',
    description: description || title
  };
}

export function makeArticleSchema(post, route, title, description, ogImage, keywords) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title || title,
    name: post.title || title,
    description,
    inLanguage: 'ko-KR',
    url: `${SITE_ORIGIN}${normalizePath(route)}`,
    datePublished: post.published || post.updated || '',
    dateModified: post.updated || post.published || '',
    articleSection: post.section || CATEGORY_LABELS[post.category] || '',
    keywords,
    image: [ogImage],
    timeRequired: post.readingMins ? `PT${post.readingMins}M` : undefined,
    mainEntityOfPage: `${SITE_ORIGIN}${normalizePath(route)}`,
    author: { '@type': 'Organization', name: BRAND },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/img/logo.png` }
    },
    isAccessibleForFree: true
  };
}

export function cleanSchema(obj) {
  if (Array.isArray(obj)) return obj.map(cleanSchema).filter(Boolean);
  if (!obj || typeof obj !== 'object') return obj;
  const next = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleaned = cleanSchema(value);
    if (cleaned === undefined) continue;
    if (Array.isArray(cleaned) && !cleaned.length) continue;
    if (typeof cleaned === 'string' && !cleaned.trim()) continue;
    next[key] = cleaned;
  }
  return next;
}

export function replaceOrInsertHead(html, newHeadInner) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return html;
  return html.replace(headMatch[0], `<head>${newHeadInner}</head>`);
}

export function stripExistingSeoBlocks(headInner) {
  let next = headInner;
  next = next.replace(/<title>[\s\S]*?<\/title>\s*/ig, '');
  next = next.replace(/<meta\b[^>]*\bcharset=["']?[^>]*>\s*/ig, '');
  next = next.replace(/<meta\b[^>]*\bname=["']viewport["'][^>]*>\s*/ig, '');
  next = next.replace(/<meta\b[^>]*\bname=["'](?:description|keywords|robots|author|twitter:card|twitter:title|twitter:description|twitter:image|twitter:image:alt)["'][^>]*>\s*/ig, '');
  next = next.replace(/<meta\b[^>]*\bproperty=["'](?:og:type|og:site_name|og:title|og:description|og:url|og:image|og:image:alt|og:locale|article:section|article:published_time|article:modified_time|article:tag)["'][^>]*>\s*/ig, '');
  next = next.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/ig, '');
  next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/ig, '');
  return next.trim();
}

export async function writeText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}
