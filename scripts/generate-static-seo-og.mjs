import fs from 'fs/promises';
import path from 'path';
import {
  ROOT,
  SITE_ORIGIN,
  loadPosts,
  listHtmlFiles,
  normalizePathname,
  fileToPathname,
  urlFor,
  escapeHtml,
  escapeRegExp,
  keywordSeed,
  pickOgImage,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildWebsiteJsonLd,
  isPrivatePath,
  isIgnoredPath,
  humanCategory,
  baseMetaSpec,
  writeTextIfChanged,
  TODAY
} from './lib/site-automation.mjs';

function upsertHeadMeta(html, spec) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return html;
  let headInner = headMatch[1];

  const stripMetaByName = (name) => {
    const re = new RegExp(`<meta\\b[^>]*\\bname=["']${escapeRegExp(name)}["'][^>]*>\\s*`, 'ig');
    headInner = headInner.replace(re, '');
  };
  const stripMetaByProp = (prop) => {
    const re = new RegExp(`<meta\\b[^>]*\\bproperty=["']${escapeRegExp(prop)}["'][^>]*>\\s*`, 'ig');
    headInner = headInner.replace(re, '');
  };
  const stripLinkRel = (rel) => {
    const re = new RegExp(`<link\\b[^>]*\\brel=["']${escapeRegExp(rel)}["'][^>]*>\\s*`, 'ig');
    headInner = headInner.replace(re, '');
  };

  headInner = headInner.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
  stripLinkRel('canonical');
  ['viewport','description','keywords','robots','author','twitter:card','twitter:title','twitter:description','twitter:image'].forEach(stripMetaByName);
  ['og:type','og:site_name','og:title','og:description','og:url','og:image','og:image:alt','og:locale','article:section','article:published_time','article:modified_time'].forEach(stripMetaByProp);
  headInner = headInner.replace(/<meta\b[^>]*\bproperty=["']article:tag["'][^>]*>\s*/ig, '');
  headInner = headInner.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*data-auto-seo=["']1["'][^>]*>[\s\S]*?<\/script>\s*/ig, '');

  // make non-critical local scripts defer to reduce blocking
  headInner = headInner.replace(/<script((?=[^>]*\bsrc=)[^>]*?)><\/script>/ig, (full, attrs) => {
    if (/\btype=["']application\/ld\+json["']/i.test(attrs) || /\bdefer\b/i.test(attrs) || /\basync\b/i.test(attrs)) return full;
    if (/\bsrc=["']https?:/i.test(attrs)) return full;
    return `<script${attrs} defer=""></script>`;
  });

  const lines = [
    `<title>${escapeHtml(spec.title)}</title>`,
    `<link href="${escapeHtml(spec.canonical)}" rel="canonical"/>`,
    `<meta content="width=device-width, initial-scale=1" name="viewport"/>`,
    `<meta content="${escapeHtml(spec.description)}" name="description"/>`,
    `<meta content="${escapeHtml(spec.keywords)}" name="keywords"/>`,
    `<meta content="${escapeHtml(spec.robots)}" name="robots"/>`,
    `<meta content="레븐" name="author"/>`,
    `<meta content="summary_large_image" name="twitter:card"/>`,
    `<meta content="${escapeHtml(spec.title)}" name="twitter:title"/>`,
    `<meta content="${escapeHtml(spec.description)}" name="twitter:description"/>`,
    `<meta content="${escapeHtml(spec.ogImage)}" name="twitter:image"/>`,
    `<meta content="${escapeHtml(spec.ogType)}" property="og:type"/>`,
    `<meta content="레븐" property="og:site_name"/>`,
    `<meta content="ko_KR" property="og:locale"/>`,
    `<meta content="${escapeHtml(spec.title)}" property="og:title"/>`,
    `<meta content="${escapeHtml(spec.description)}" property="og:description"/>`,
    `<meta content="${escapeHtml(spec.canonical)}" property="og:url"/>`,
    `<meta content="${escapeHtml(spec.ogImage)}" property="og:image"/>`,
    `<meta content="${escapeHtml(spec.title)} 대표 이미지" property="og:image:alt"/>`
  ];

  if (spec.articleSection) lines.push(`<meta content="${escapeHtml(spec.articleSection)}" property="article:section"/>`);
  if (spec.published) lines.push(`<meta content="${escapeHtml(spec.published)}" property="article:published_time"/>`);
  if (spec.updated) lines.push(`<meta content="${escapeHtml(spec.updated)}" property="article:modified_time"/>`);
  for (const tag of spec.articleTags || []) {
    lines.push(`<meta content="${escapeHtml(tag)}" property="article:tag"/>`);
  }
  for (const json of spec.jsonLd || []) {
    lines.push(`<script data-auto-seo="1" type="application/ld+json">${JSON.stringify(json)}</script>`);
  }

  headInner = `${lines.join('')}${headInner.trim() ? `\n${headInner.trim()}` : ''}`;
  return html.replace(headMatch[0], `<head>${headInner}</head>`);
}

function buildPostSpec(post, pathname) {
  const canonical = urlFor(pathname);
  const keywords = keywordSeed(post);
  const title = String(post.seoTitle || `${post.title} | ${post.section || post.label || humanCategory(post.category)} | 레븐`).trim();
  const description = String(post.seoDescription || post.excerpt || post.title).trim();
  const ogImage = pickOgImage(post);
  const section = String(post.section || post.label || humanCategory(post.category)).trim();
  const published = String(post.published || post.updated || TODAY).trim();
  const updated = String(post.updated || post.published || TODAY).trim();
  const articleTags = keywords.filter((item) => !['레븐', section].includes(item)).slice(0, 6);
  const breadcrumb = [
    { name: '메인', item: `${SITE_ORIGIN}/` },
    { name: `${humanCategory(post.category)} 허브`, item: urlFor(`/${post.category}/`) },
    { name: post.title, item: canonical }
  ];
  return {
    title,
    description,
    canonical,
    keywords: keywords.join(', '),
    robots: 'index,follow,max-image-preview:large',
    ogImage,
    ogType: 'article',
    articleSection: section,
    published,
    updated,
    articleTags,
    jsonLd: [
      buildBreadcrumbJsonLd(breadcrumb),
      buildArticleJsonLd(post, canonical, ogImage)
    ]
  };
}


function optimizeMarkup(html) {
  let next = html.replace(/<script((?=[^>]*\bsrc=)[^>]*?)><\/script>/ig, (full, attrs) => {
    if (/\btype=["']application\/ld\+json["']/i.test(attrs) || /\bdefer\b/i.test(attrs) || /\basync\b/i.test(attrs)) return full;
    if (/\bsrc=["']https?:/i.test(attrs)) return full;
    return `<script${attrs} defer=""></script>`;
  });
  next = next.replace(/<img([^>]*class=["'][^"']*brand-logo[^"']*["'][^>]*)>/ig, (full, attrs) => {
    let out = attrs;
    if (!/\bwidth=/i.test(out)) out += ' width="40"';
    if (!/\bheight=/i.test(out)) out += ' height="40"';
    if (!/\bdecoding=/i.test(out)) out += ' decoding="async"';
    if (!/\bfetchpriority=/i.test(out)) out += ' fetchpriority="high"';
    return `<img${out}>`;
  });
  return next;
}

function buildPageSpec(pathname, html) {
  const meta = baseMetaSpec(pathname, html);
  const canonical = urlFor(pathname);
  const keywords = Array.isArray(meta.keywords) ? meta.keywords.join(', ') : String(meta.keywords || '레븐');
  const jsonLd = [];
  if (pathname === '/') jsonLd.push(buildWebsiteJsonLd(canonical, meta));
  jsonLd.push(buildCollectionJsonLd(meta, canonical));
  return {
    title: meta.title,
    description: meta.description,
    canonical,
    keywords,
    robots: isPrivatePath(pathname) ? 'noindex,nofollow,noarchive,nosnippet' : 'index,follow,max-image-preview:large',
    ogImage: pickOgImage(meta),
    ogType: meta.pageType === 'website' ? 'website' : 'website',
    articleSection: null,
    published: '',
    updated: TODAY,
    articleTags: [],
    jsonLd
  };
}

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePathname(post.path), post]));
const htmlFiles = await listHtmlFiles();
let changed = 0;
let processed = 0;

for (const filePath of htmlFiles) {
  const pathname = fileToPathname(filePath);
  if (isIgnoredPath(pathname) || pathname.includes('index.orig.html')) continue;
  const original = await fs.readFile(filePath, 'utf8');
  const post = postMap.get(pathname);
  const spec = post ? buildPostSpec(post, pathname) : buildPageSpec(pathname, original);
  const next = optimizeMarkup(upsertHeadMeta(original, spec));
  if (await writeTextIfChanged(filePath, next)) changed += 1;
  processed += 1;
}

console.log(`SEO/OG + structured data refreshed for ${changed} / ${processed} HTML files.`);
