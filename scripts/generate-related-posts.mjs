import fs from 'fs/promises';
import path from 'path';
import { ROOT, loadPosts, normalizePath } from './lib/site-automation.mjs';

const posts = await loadPosts();

const GENERIC_TOKENS = new Set([
  '레븐','블로그','카지노','슬롯','보너스','전략','가이드','뉴스','핵심','최신','운영','기초','기본','체크',
  '실전','정리','이유','보기','사이트','허브'
]);

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
  return new Set(tokenize([post.slug, post.title, post.tag, ...(post.keywords || [])].join(' ')));
}

function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  const hit = [...a].filter((item) => b.has(item)).length;
  return hit / union.size;
}

function isNearDuplicate(current, candidate) {
  const currentTokens = buildTokenSet(current);
  const candidateTokens = buildTokenSet(candidate);
  return jaccard(currentTokens, candidateTokens) >= 0.72;
}

function score(current, candidate) {
  if (current.slug === candidate.slug) return -Infinity;
  if (isNearDuplicate(current, candidate)) return -Infinity;
  let total = 0;
  if (current.category === candidate.category) total += 100;
  if (current.tag && current.tag === candidate.tag) total += 30;
  const currentTokens = buildTokenSet(current);
  const candidateTokens = buildTokenSet(candidate);
  total += [...currentTokens].filter((item) => candidateTokens.has(item)).length * 10;
  total += Number(candidate.popular || 0) / 10;
  return total;
}

function anchorText(post) {
  const section = post.section || post.label || '';
  const tag = post.tag ? ` · ${post.tag}` : '';
  return `${section}${tag} 글: ${post.title}`;
}

function relatedMarkup(current) {
  const picked = posts
    .map((candidate) => ({ candidate, score: score(current, candidate) }))
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.candidate);

  if (!picked.length) return null;

  const relatedCards = picked.map((item) => {
    const excerpt = stripHtml(item.excerpt || item.seoDescription || item.title).slice(0, 62);
    return `<a class="related-card" href="${item.path}" aria-label="${anchorText(item)}"><strong>${item.title}</strong><p style="margin:8px 0 0;color:var(--muted)">${excerpt}</p></a>`;
  }).join('');

  const inlineLinks = picked.map((item) => `<a href="${item.path}" aria-label="${anchorText(item)}">${item.title}</a>`).join('');
  return { relatedCards, inlineLinks };
}

let changed = 0;
for (const post of posts) {
  const filePath = toFilePath(normalizePath(post.path));
  try {
    const original = await fs.readFile(filePath, 'utf8');
    const markup = relatedMarkup(post);
    if (!markup) continue;
    let next = original;
    next = next.replace(/<div class="related-grid">[\s\S]*?<\/div>/i, `<div class="related-grid">${markup.relatedCards}</div>`);
    next = next.replace(/<div class="inline-links">[\s\S]*?<\/div>/i, `<div class="inline-links">${markup.inlineLinks}</div>`);
    if (next !== original) {
      await fs.writeFile(filePath, next, 'utf8');
      changed += 1;
    }
  } catch {
    // ignore missing files
  }
}
console.log(`Related blocks refreshed for ${changed} post files.`);
