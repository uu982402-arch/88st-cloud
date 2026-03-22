import fs from 'fs/promises';
import {
  ROOT,
  loadPosts,
  listHtmlRoutes,
  normalizePath,
  toFilePath,
  urlFor,
  escapeHtml,
  escapeRegExp,
  stripHtml,
  ogImageFor,
  titleForCorePath,
  descriptionForCorePath,
  buildKeywords,
  breadcrumbJson,
  articleJson,
  collectionJson,
  inferCategoryFromPath,
  isNoindexPath,
  uniq,
  fileExists
} from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));
const routes = await listHtmlRoutes();

function removeMeta(headInner, attr, value) {
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}=["']${escapeRegExp(value)}["'][^>]*>\\s*`, 'ig');
  return headInner.replace(re, '');
}

function removeLinkRel(headInner, rel) {
  const re = new RegExp(`<link\\b[^>]*\\brel=["']${escapeRegExp(rel)}["'][^>]*>\\s*`, 'ig');
  return headInner.replace(re, '');
}

function removeJsonLdByType(headInner, typeName) {
  const re = new RegExp(`<script[^>]*type=["']application/ld\\+json["'][^>]*>\\s*([\\s\\S]*?)<\\/script>`, 'ig');
  return headInner.replace(re, (full, jsonText) => {
    try {
      const payload = JSON.parse(jsonText.trim());
      const types = Array.isArray(payload?.['@type']) ? payload['@type'] : [payload?.['@type']].filter(Boolean);
      if (types.includes(typeName)) return '';
    } catch {}
    return full;
  });
}

function upsertHead(html, spec) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return html;
  let headInner = headMatch[1];

  headInner = headInner.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
  headInner = removeLinkRel(headInner, 'canonical');
  headInner = removeMeta(headInner, 'name', 'description');
  headInner = removeMeta(headInner, 'name', 'keywords');
  headInner = removeMeta(headInner, 'name', 'robots');
  headInner = removeMeta(headInner, 'name', 'twitter:card');
  headInner = removeMeta(headInner, 'name', 'twitter:title');
  headInner = removeMeta(headInner, 'name', 'twitter:description');
  headInner = removeMeta(headInner, 'name', 'twitter:image');
  headInner = removeMeta(headInner, 'name', 'twitter:image:alt');
  ['og:type','og:site_name','og:title','og:description','og:url','og:image','og:image:alt','og:locale','article:section','article:published_time','article:modified_time'].forEach((name) => {
    headInner = removeMeta(headInner, 'property', name);
  });
  headInner = headInner.replace(/<meta\b[^>]*\bproperty=["']article:tag["'][^>]*>\s*/ig, '');
  headInner = removeJsonLdByType(headInner, 'BreadcrumbList');
  headInner = removeJsonLdByType(headInner, 'Article');
  headInner = removeJsonLdByType(headInner, 'CollectionPage');
  headInner = removeJsonLdByType(headInner, 'WebSite');

  const headLines = [
    `<title>${escapeHtml(spec.title)}</title>`,
    `<link href="${escapeHtml(spec.canonical)}" rel="canonical"/>`,
    `<meta content="${escapeHtml(spec.description)}" name="description"/>`,
    `<meta content="${escapeHtml(spec.keywords)}" name="keywords"/>`,
    `<meta content="${escapeHtml(spec.robots)}" name="robots"/>`,
    `<meta content="summary_large_image" name="twitter:card"/>`,
    `<meta content="${escapeHtml(spec.title)}" name="twitter:title"/>`,
    `<meta content="${escapeHtml(spec.description)}" name="twitter:description"/>`,
    `<meta content="${escapeHtml(spec.ogImage)}" name="twitter:image"/>`,
    `<meta content="${escapeHtml(spec.title)} 대표 이미지" name="twitter:image:alt"/>`,
    `<meta content="${escapeHtml(spec.ogType)}" property="og:type"/>`,
    `<meta content="레븐" property="og:site_name"/>`,
    `<meta content="ko_KR" property="og:locale"/>`,
    `<meta content="${escapeHtml(spec.title)}" property="og:title"/>`,
    `<meta content="${escapeHtml(spec.description)}" property="og:description"/>`,
    `<meta content="${escapeHtml(spec.canonical)}" property="og:url"/>`,
    `<meta content="${escapeHtml(spec.ogImage)}" property="og:image"/>`,
    `<meta content="${escapeHtml(spec.title)} 대표 이미지" property="og:image:alt"/>`
  ];

  if (spec.articleSection) headLines.push(`<meta content="${escapeHtml(spec.articleSection)}" property="article:section"/>`);
  if (spec.published) headLines.push(`<meta content="${escapeHtml(spec.published)}" property="article:published_time"/>`);
  if (spec.updated) headLines.push(`<meta content="${escapeHtml(spec.updated)}" property="article:modified_time"/>`);
  for (const tag of spec.articleTags || []) {
    headLines.push(`<meta content="${escapeHtml(tag)}" property="article:tag"/>`);
  }
  for (const schema of spec.schemas || []) {
    headLines.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  headInner = `${headLines.join('')}\n${headInner.trim()}`;
  return html.replace(headMatch[0], `<head>${headInner}</head>`);
}

function buildSpec(pathname, post, html) {
  const clean = normalizePath(pathname);
  const isPost = !!post;
  const category = post?.category || inferCategoryFromPath(clean);
  const title = isPost
    ? String(post.seoTitle || `${post.title} | ${post.section || post.label || '블로그'} | 레븐`).trim()
    : (titleForCorePath(clean) || stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '레븐 | 콘텐츠 허브'));
  const description = isPost
    ? String(post.seoDescription || post.excerpt || post.title).trim()
    : (descriptionForCorePath(clean) || stripHtml(html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] || title));
  const keywords = isPost
    ? buildKeywords(post)
    : uniq([category, title.replace(/\|.*$/, '').trim(), '레븐', '카지노', '슬롯', '보너스']).join(', ');
  const canonical = urlFor(clean);
  const ogImage = ogImageFor(clean, post);
  const robots = isNoindexPath(clean) ? 'noindex,nofollow,noarchive,nosnippet' : 'index,follow';
  const schemas = [];
  if (isPost) {
    schemas.push(breadcrumbJson(clean, post));
    schemas.push(articleJson({ ...post, updated: post.updated || post.published }));
  } else if (!isNoindexPath(clean)) {
    schemas.push(collectionJson(clean));
    const crumb = breadcrumbJson(clean, null);
    if (crumb.itemListElement.length > 1) schemas.push(crumb);
  }
  return {
    title,
    description,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    canonical,
    ogImage,
    ogType: isPost ? 'article' : 'website',
    robots,
    articleSection: isPost ? (post.section || post.label || category) : '',
    published: isPost ? (post.published || post.updated || '') : '',
    updated: isPost ? (post.updated || post.published || '') : '',
    articleTags: isPost ? buildKeywords(post).filter((item) => !['레븐', post.section, post.label].includes(item)).slice(0, 6) : [],
    schemas
  };
}

let changed = 0;
let processed = 0;
for (const pathname of routes) {
  const filePath = toFilePath(pathname);
  if (!(await fileExists(filePath))) continue;
  const original = await fs.readFile(filePath, 'utf8');
  const post = postMap.get(normalizePath(pathname)) || null;
  const spec = buildSpec(pathname, post, original);
  const next = upsertHead(original, spec);
  processed += 1;
  if (next !== original) {
    await fs.writeFile(filePath, next, 'utf8');
    changed += 1;
  }
}

console.log(`SEO/OG refreshed for ${processed} HTML routes (${changed} changed).`);
