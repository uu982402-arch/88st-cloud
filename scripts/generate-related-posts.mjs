import fs from 'fs/promises';
import {
  loadPosts,
  normalizePath,
  toFilePath,
  stripHtml,
  slugTokens,
  uniq
} from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));

const GENERIC = new Set(['레븐','블로그','가이드','허브','최신','핵심','운영','기초','기본','체크','뉴스','콘텐츠']);

function tokenSet(post) {
  return new Set(
    uniq([
      ...slugTokens(post.slug || ''),
      ...slugTokens(post.title || ''),
      ...slugTokens(post.tag || ''),
      ...(Array.isArray(post.keywords) ? post.keywords.flatMap((k) => slugTokens(k)) : [])
    ]).filter((token) => token.length >= 2 && !GENERIC.has(token))
  );
}

function overlap(a, b) {
  let count = 0;
  for (const item of a) if (b.has(item)) count += 1;
  return count;
}

function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  return overlap(a, b) / union.size;
}

function nearDuplicate(current, candidate, currentTokens, candidateTokens) {
  const slugA = new Set(slugTokens((current.slug || '').replace(/-/g, ' ')));
  const slugB = new Set(slugTokens((candidate.slug || '').replace(/-/g, ' ')));
  return jaccard(slugA, slugB) >= 0.72 || jaccard(currentTokens, candidateTokens) >= 0.68;
}

function score(current, candidate, currentTokens, candidateTokens) {
  if (current.slug === candidate.slug) return -Infinity;
  if (nearDuplicate(current, candidate, currentTokens, candidateTokens)) return -Infinity;
  let total = 0;
  if (current.category === candidate.category) total += 90;
  if (String(current.tag || '') && current.tag === candidate.tag) total += 28;
  total += overlap(currentTokens, candidateTokens) * 11;
  total += Math.min(Number(candidate.popular || 0), 100) / 8;
  if ((candidate.badge || '') === '최신') total += 4;
  return total;
}

function anchorLabel(item) {
  const raw = String(item.title || '').trim();
  return raw.length > 36 ? `${raw.slice(0, 34).trim()}…` : raw;
}

function relatedMarkup(current) {
  const currentTokens = tokenSet(current);
  const scored = posts
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => {
      const candidateTokens = tokenSet(candidate);
      return { candidate, score: score(current, candidate, currentTokens, candidateTokens) };
    })
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.candidate.popular || 0) - Number(a.candidate.popular || 0));

  const selected = [];
  const seen = new Set();
  for (const entry of scored) {
    if (selected.length >= 3) break;
    if (seen.has(entry.candidate.slug)) continue;
    selected.push(entry.candidate);
    seen.add(entry.candidate.slug);
  }
  if (!selected.length) return null;
  return {
    cards: selected.map((item) => {
      const excerpt = stripHtml(item.excerpt || item.seoDescription || item.title).slice(0, 62);
      return `<a class="related-card" href="${item.path}" title="${item.title}"><strong>${item.title}</strong><p style="margin:8px 0 0;color:var(--muted)">${excerpt}</p><span class="related-cta">읽기</span></a>`;
    }).join(''),
    links: selected.map((item) => `<a href="${item.path}" title="${item.title}">${anchorLabel(item)}</a>`).join('')
  };
}

let changed = 0;
for (const post of posts) {
  const filePath = toFilePath(post.path);
  try {
    const original = await fs.readFile(filePath, 'utf8');
    const blocks = relatedMarkup(post);
    if (!blocks) continue;
    let next = original;
    next = next.replace(/<div class="related-grid">[\s\S]*?<\/div>/i, `<div class="related-grid">${blocks.cards}</div>`);
    next = next.replace(/<div class="inline-links">[\s\S]*?<\/div>/i, `<div class="inline-links">${blocks.links}</div>`);
    if (next !== original) {
      await fs.writeFile(filePath, next, 'utf8');
      changed += 1;
    }
  } catch {
    // skip missing files
  }
}

console.log(`Related links refreshed for ${changed} post files.`);
