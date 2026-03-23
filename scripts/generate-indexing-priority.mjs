import path from 'path';
import { loadPosts, writeTextIfChanged, ROOT, TODAY } from './lib/site-automation.mjs';

const OUT = path.join(ROOT, 'docs/indexing-priority-20260322.md');
const { posts } = await loadPosts();

function sortLatest(list){
  return [...list].sort((a,b) => (Date.parse(b.updated || b.published || 0) || 0) - (Date.parse(a.updated || a.published || 0) || 0) || (b.popular || 0) - (a.popular || 0));
}
function sortPopular(list){
  return [...list].sort((a,b) => (b.popular || 0) - (a.popular || 0) || (Date.parse(b.updated || b.published || 0) || 0) - (Date.parse(a.updated || a.published || 0) || 0));
}
const hubs = [
  '/', '/analysis/', '/casino/', '/slot/', '/bonus/', '/strategy/', '/news/', '/play-guides/', '/latest/', '/popular/'
];
const firstWave = [
  ...hubs,
  ...sortPopular(posts.filter((post) => ['casino','slot','bonus','strategy'].includes(post.category))).slice(0, 12).map((post) => post.path)
];
const secondWave = sortLatest(posts).filter((post) => !firstWave.includes(post.path)).slice(0, 20).map((post) => post.path);
const lines = [
  '# 수동 색인 요청 우선순위',
  '',
  `- 생성일: ${TODAY}`,
  '',
  '## 1차 요청',
  ''
];
firstWave.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`));
lines.push('', '## 2차 요청', '');
secondWave.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`));
lines.push('', '## 운영 기준', '', '- 허브/대표글 먼저 요청', '- 하루 단위로 10~20개씩만 요청', '- 새 글 발행 후 허브 노출과 함께 색인 요청');
await writeTextIfChanged(OUT, `${lines.join('\n')}\n`);
console.log(`Indexing priority doc generated (${firstWave.length + secondWave.length} URLs).`);
