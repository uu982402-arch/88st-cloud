import fs from 'fs/promises';
import {
  ROOT,
  loadPosts,
  pathnameToFile,
  stripHtml,
  tokenize,
  shortText,
  normalizePathname,
  baseMetaSpec,
  listHtmlFiles,
  fileToPathname,
  isIgnoredPath,
  writeTextIfChanged,
  humanCategory
} from './lib/site-automation.mjs';

const GENERIC_TOKENS = new Set([
  '레븐','블로그','카지노','슬롯','보너스','전략','가이드','뉴스','핵심','최신','운영','기초','기본','체크','가이드',
  'the','and','for','with','from','guide','basics','글','허브','보기','상세','읽기'
]);

const GENERIC_LINK_LABELS = new Set(['글 보기','허브 보기','상세 보기','글 읽기','바로 보기','자세히 보기','보기','읽기']);

function buildTokenSet(post) {
  const source = [post.slug, post.title, post.tag, ...(Array.isArray(post.keywords) ? post.keywords : [])].join(' ');
  return new Set(tokenize(source).filter((item) => item.length >= 2 && !GENERIC_TOKENS.has(item)));
}

function overlapScore(a, b) {
  let hits = 0;
  for (const item of a) if (b.has(item)) hits += 1;
  return hits;
}

function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  return overlapScore(a, b) / union.size;
}

function isNearDuplicate(current, candidate, currentTokens, candidateTokens) {
  if (current.slug === candidate.slug) return true;
  const slugA = new Set(tokenize(String(current.slug || '').replace(/-/g, ' ')).filter((item) => !GENERIC_TOKENS.has(item)));
  const slugB = new Set(tokenize(String(candidate.slug || '').replace(/-/g, ' ')).filter((item) => !GENERIC_TOKENS.has(item)));
  return jaccard(slugA, slugB) >= 0.7 || jaccard(currentTokens, candidateTokens) >= 0.68;
}

function scoreCandidate(current, candidate) {
  const currentTokens = buildTokenSet(current);
  const candidateTokens = buildTokenSet(candidate);
  if (isNearDuplicate(current, candidate, currentTokens, candidateTokens)) return -Infinity;
  let score = 0;
  if (candidate.category === current.category) score += 120;
  if (String(candidate.tag || '') && String(candidate.tag || '') === String(current.tag || '')) score += 28;
  score += overlapScore(currentTokens, candidateTokens) * 10;
  score += Math.min(Number(candidate.popular || 0), 120) / 8;
  const currentPublished = Number(String(current.published || '').replace(/-/g, '')) || 0;
  const candidatePublished = Number(String(candidate.published || '').replace(/-/g, '')) || 0;
  if (candidatePublished >= currentPublished) score += 4;
  return score;
}

function pickRelated(posts, current) {
  return posts
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({ candidate, score: scoreCandidate(current, candidate) }))
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score || (b.candidate.popular || 0) - (a.candidate.popular || 0))
    .map((entry) => entry.candidate)
    .slice(0, 3);
}

function buildRelatedMarkup(post, related) {
  const relatedCards = related.map((item) => {
    const excerpt = shortText(item.excerpt || item.seoDescription || item.title, 72);
    return `<a class="related-card" href="${item.path}"><strong>${item.title}</strong><p style="margin:8px 0 0;color:var(--muted)">${excerpt}</p><span class="related-cta">읽기</span></a>`;
  }).join('');
  const inlineLinks = related.map((item) => `<a href="${item.path}">${item.title}</a>`).join('');
  return { relatedCards, inlineLinks };
}

function optimizeGenericAnchors(html, titleMap) {
  return html.replace(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig, (full, pre, href, post, text) => {
    const clean = stripHtml(text);
    if (!GENERIC_LINK_LABELS.has(clean)) return full;
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return full;
    const key = normalizePathname(href);
    const replacement = titleMap.get(key);
    if (!replacement) return full;
    return `<a${pre}href="${href}"${post}>${replacement}</a>`;
  });
}

const { posts } = await loadPosts();
const titleMap = new Map(posts.map((post) => [normalizePathname(post.path), post.title]));
for (const filePath of await listHtmlFiles()) {
  const pathname = fileToPathname(filePath);
  if (isIgnoredPath(pathname)) continue;
  const html = await fs.readFile(filePath, 'utf8');
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (m && !titleMap.has(normalizePathname(pathname))) titleMap.set(normalizePathname(pathname), stripHtml(m[1]).replace(/\s*\|\s*레븐.*$/, ''));
}
titleMap.set('/casino/', '카지노 허브');
titleMap.set('/slot/', '슬롯 허브');
titleMap.set('/bonus/', '보너스 허브');
titleMap.set('/strategy/', '전략 허브');
titleMap.set('/news/', '뉴스 허브');
titleMap.set('/analysis/', '배당분석');
titleMap.set('/play-guides/', '가이드 라이브러리');
titleMap.set('/', '메인');

let changed = 0;
for (const post of posts) {
  const filePath = pathnameToFile(post.path);
  try {
    const original = await fs.readFile(filePath, 'utf8');
    const related = pickRelated(posts, post);
    if (!related.length) continue;
    const markup = buildRelatedMarkup(post, related);
    let next = original
      .replace(/<div class="related-grid">[\s\S]*?<\/div>/i, `<div class="related-grid">${markup.relatedCards}</div>`)
      .replace(/<div class="inline-links">[\s\S]*?<\/div>/i, `<div class="inline-links">${markup.inlineLinks}</div>`);
    next = optimizeGenericAnchors(next, titleMap);
    if (await writeTextIfChanged(filePath, next)) changed += 1;
  } catch {}
}

let anchorChanged = 0;
const htmlFiles = await listHtmlFiles();
for (const filePath of htmlFiles) {
  const pathname = fileToPathname(filePath);
  if (isIgnoredPath(pathname)) continue;
  const original = await fs.readFile(filePath, 'utf8');
  const next = optimizeGenericAnchors(original, titleMap);
  if (await writeTextIfChanged(filePath, next)) anchorChanged += 1;
}

console.log(`Related blocks refreshed for ${changed} post files. Anchor text optimized in ${anchorChanged} HTML files.`);
