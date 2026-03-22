import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://88st.cloud';
const POSTS_FILE = path.join(ROOT, 'assets/data/posts.index.v1.20260318.json');
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/img/logo.png`;

const postsPayload = JSON.parse(await fs.readFile(POSTS_FILE, 'utf8'));
const posts = Array.isArray(postsPayload?.posts) ? postsPayload.posts : [];

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toFilePath = (pathname) => path.join(ROOT, pathname.replace(/^\//, ''), 'index.html');
const normalizePathname = (pathname) => {
  if (!pathname) return '/';
  let next = String(pathname).trim();
  if (!next.startsWith('/')) next = `/${next}`;
  return next.endsWith('/') ? next : `${next}/`;
};

function uniqueKeywords(post) {
  const seed = [
    ...(Array.isArray(post.keywords) ? post.keywords : []),
    post.label,
    post.section,
    post.tag,
    post.badge,
    '레븐'
  ];
  const seen = new Set();
  return seed
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

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
  ['description', 'keywords', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].forEach(stripMetaByName);
  ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'article:section', 'article:published_time', 'article:modified_time'].forEach(stripMetaByProp);

  const articleTagRe = /<meta\b[^>]*\bproperty=["']article:tag["'][^>]*>\s*/ig;
  headInner = headInner.replace(articleTagRe, '');

  const headLines = [
    `<title>${escapeHtml(spec.title)}</title>`,
    `<link href="${escapeHtml(spec.canonical)}" rel="canonical"/>`,
    `<meta content="${escapeHtml(spec.description)}" name="description"/>`,
    `<meta content="${escapeHtml(spec.keywords)}" name="keywords"/>`,
    `<meta content="summary" name="twitter:card"/>`,
    `<meta content="${escapeHtml(spec.title)}" name="twitter:title"/>`,
    `<meta content="${escapeHtml(spec.description)}" name="twitter:description"/>`,
    `<meta content="${escapeHtml(spec.ogImage)}" name="twitter:image"/>`,
    `<meta content="article" property="og:type"/>`,
    `<meta content="레븐" property="og:site_name"/>`,
    `<meta content="${escapeHtml(spec.title)}" property="og:title"/>`,
    `<meta content="${escapeHtml(spec.description)}" property="og:description"/>`,
    `<meta content="${escapeHtml(spec.canonical)}" property="og:url"/>`,
    `<meta content="${escapeHtml(spec.ogImage)}" property="og:image"/>`,
    `<meta content="${escapeHtml(spec.title)} 대표 이미지" property="og:image:alt"/>`,
    `<meta content="${escapeHtml(spec.section)}" property="article:section"/>`,
    `<meta content="${escapeHtml(spec.published)}" property="article:published_time"/>`,
    `<meta content="${escapeHtml(spec.updated)}" property="article:modified_time"/>`
  ];

  spec.articleTags.forEach((tag) => {
    headLines.push(`<meta content="${escapeHtml(tag)}" property="article:tag"/>`);
  });

  headInner = `${headLines.join('')}\n${headInner.trim()}`;
  return html.replace(headMatch[0], `<head>${headInner}</head>`);
}

let changed = 0;
for (const post of posts) {
  const filePath = toFilePath(post.path);
  try {
    const original = await fs.readFile(filePath, 'utf8');
    const canonical = `${SITE_ORIGIN}${normalizePathname(post.path)}`;
    const keywords = uniqueKeywords(post).join(', ');
    const title = String(post.seoTitle || `${post.title} | ${post.section || post.label || '블로그'} | 레븐`).trim();
    const description = String(post.seoDescription || post.excerpt || post.title).trim();
    const section = String(post.section || post.label || post.category || '블로그').trim();
    const published = String(post.published || post.updated || '').trim();
    const updated = String(post.updated || post.published || '').trim();
    const articleTags = uniqueKeywords(post).filter((item) => !['레븐', section].includes(item)).slice(0, 4);
    const next = upsertHeadMeta(original, {
      title,
      description,
      canonical,
      keywords,
      ogImage: DEFAULT_OG_IMAGE,
      section,
      published,
      updated,
      articleTags
    });
    if (next !== original) {
      await fs.writeFile(filePath, next, 'utf8');
      changed += 1;
    }
  } catch (error) {
    // ignore missing files
  }
}

console.log(`SEO/OG refreshed for ${changed} post files.`);
