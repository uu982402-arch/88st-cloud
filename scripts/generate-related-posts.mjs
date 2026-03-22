import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const POSTS_FILE = path.join(ROOT, 'assets/data/posts.index.v1.20260318.json');
const postsPayload = JSON.parse(await fs.readFile(POSTS_FILE, 'utf8'));
const posts = Array.isArray(postsPayload?.posts) ? postsPayload.posts : [];
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));

const GENERIC_TOKENS = new Set([
  '레븐','블로그','카지노','슬롯','보너스','전략','가이드','뉴스','핵심','최신','운영','기초','기본','체크','가이드',
  'the','and','for','with','from','guide','basics'
]);

function normalizePath(value) {
  let next = String(value || '/').trim();
  if (!next.startsWith('/')) next = `/${next}`;
  return next.endsWith('/') ? next : `${next}/`;
}

function toFilePath(pathname) {
  return path.join(ROOT, pathname.replace(/^\//, ''), 'index.html');
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/gi, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !GENERIC_TOKENS.has(item));
}

function buildTokenSet(post) {
  const source = [post.slug, post.title, post.tag, ...(Array.isArray(post.keywords) ? post.keywords : [])].join(' ');
  return new Set(tokenize(source));
}

function overlapScore(a, b) {
  const hits = [...a].filter((item) => b.has(item));
  return hits.length;
}

function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  return overlapScore(a, b) / union.size;
}

function isNearDuplicate(current, candidate, currentTokens, candidateTokens) {
  if (current.slug === candidate.slug) return true;
  const slugA = new Set(tokenize(String(current.slug || '').replace(/-/g, ' ')));
  const slugB = new Set(tokenize(String(candidate.slug || '').replace(/-/g, ' ')));
  const slugSimilarity = jaccard(slugA, slugB);
  const titleSimilarity = jaccard(currentTokens, candidateTokens);
  return slugSimilarity >= 0.7 || titleSimilarity >= 0.7;
}

function scoreCandidate(current, candidate) {
  const currentTokens = buildTokenSet(current);
  const candidateTokens = buildTokenSet(candidate);
  if (isNearDuplicate(current, candidate, currentTokens, candidateTokens)) return -Infinity;

  let score = 0;
  if (candidate.category === current.category) score += 100;
  if (String(candidate.tag || '') && String(candidate.tag || '') === String(current.tag || '')) score += 24;
  score += overlapScore(currentTokens, candidateTokens) * 9;
  score += Math.min(Number(candidate.popular || 0), 100) / 10;

  const currentPublished = Number(String(current.published || '').replace(/-/g, '')) || 0;
  const candidatePublished = Number(String(candidate.published || '').replace(/-/g, '')) || 0;
  if (candidatePublished >= currentPublished) score += 4;
  return score;
}

function pickRelated(current) {
  const scored = posts
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({ candidate, score: scoreCandidate(current, candidate) }))
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score || String(b.candidate.popular || 0).localeCompare(String(a.candidate.popular || 0)));

  const picked = [];
  const usedSlugs = new Set();
  for (const entry of scored) {
    if (picked.length >= 3) break;
    const candidate = entry.candidate;
    if (usedSlugs.has(candidate.slug)) continue;
    picked.push(candidate);
    usedSlugs.add(candidate.slug);
  }
  return picked;
}

function buildRelatedMarkup(post) {
  const related = pickRelated(post);
  if (!related.length) return null;
  const relatedCards = related.map((item) => {
    const excerpt = stripHtml(item.excerpt || item.seoDescription || item.title).slice(0, 56);
    return `<a class="related-card" href="${item.path}"><strong>${item.title}</strong><p style="margin:8px 0 0;color:var(--muted)">${excerpt}</p></a>`;
  }).join('');
  const inlineLinks = related.map((item) => `<a href="${item.path}">${item.title}</a>`).join('');
  return { relatedCards, inlineLinks };
}

let changed = 0;
for (const post of posts) {
  const filePath = toFilePath(post.path);
  try {
    const original = await fs.readFile(filePath, 'utf8');
    const markup = buildRelatedMarkup(post);
    if (!markup) continue;
    let next = original;
    next = next.replace(/<div class="related-grid">[\s\S]*?<\/div>/i, `<div class="related-grid">${markup.relatedCards}</div>`);
    next = next.replace(/<div class="inline-links">[\s\S]*?<\/div>/i, `<div class="inline-links">${markup.inlineLinks}</div>`);
    if (next !== original) {
      await fs.writeFile(filePath, next, 'utf8');
      changed += 1;
    }
  } catch (error) {
    // ignore missing files
  }
}

console.log(`Related blocks refreshed for ${changed} post files.`);
