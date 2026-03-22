import fs from 'fs/promises';
import path from 'path';
import { loadPosts, normalizePath, urlFor } from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const core = [
  '/',
  '/analysis/',
  '/casino/',
  '/slot/',
  '/bonus/',
  '/strategy/',
  '/news/',
  '/play-guides/',
  '/latest/',
  '/popular/',
  '/archive/'
];

const priorityPosts = [...posts]
  .sort((a, b) => Number(b.popular || 0) - Number(a.popular || 0) || String(b.updated || '').localeCompare(String(a.updated || '')))
  .slice(0, 24)
  .map((post) => ({
    path: normalizePath(post.path),
    title: post.title,
    category: post.category,
    reason: `${post.category} 대표글 / popular ${post.popular || 0}`
  }));

const sections = [
  { title: '1차 핵심 허브', items: core.map((path) => ({ path, title: path === '/' ? '메인' : path.replace(/^\//,'').replace(/\/$/,'') || '메인', reason: '허브/핵심 페이지' })) },
  { title: '2차 대표 게시글', items: priorityPosts }
];

const md = [
  '# 색인 우선순위',
  '',
  `- 생성 시각: ${new Date().toISOString()}`,
  '- 우선순위 기준: 허브 > 대표 게시글 > 최신/인기 중심',
  ''
];

for (const section of sections) {
  md.push(`## ${section.title}`, '');
  section.items.forEach((item, index) => {
    md.push(`${index + 1}. ${item.title} — ${urlFor(item.path)} (${item.reason})`);
  });
  md.push('');
}

await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'docs/indexing-priority-20260322.md'), `${md.join('\n')}\n`, 'utf8');
console.log('Indexing priority report generated.');
