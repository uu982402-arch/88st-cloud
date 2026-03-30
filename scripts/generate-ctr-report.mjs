import path from 'path';
import { ROOT, loadPosts, buildSeoTitle, trimDescription, writeText } from './lib/site-automation.mjs';

const posts = await loadPosts();

function score(post) {
  let total = 100;
  const title = post.seoTitle || buildSeoTitle(post.title, post.section);
  const desc = trimDescription(post.seoDescription || post.excerpt || post.title);
  if (title.length < 24) total -= 15;
  if (title.length > 52) total -= 10;
  if (desc.length < 55) total -= 10;
  if (desc.length > 120) total -= 10;
  if (/이유|기준|정리/.test(post.title) && !/(체크|방법|순서|가이드|확인)/.test(post.title)) total -= 8;
  if (!post.tag) total -= 5;
  return total;
}

const candidates = posts
  .map((post) => ({
    path: post.path,
    title: post.title,
    currentTitle: post.seoTitle || buildSeoTitle(post.title, post.section),
    currentDescription: trimDescription(post.seoDescription || post.excerpt || post.title),
    score: score(post),
    suggestedTitle: buildSeoTitle(`${post.title} 체크포인트`, post.section),
    suggestedDescription: trimDescription(`${post.title} 관련 핵심 기준과 실전 체크포인트를 한 번에 정리한 ${post.section || post.label || '블로그'} 글입니다.`)
  }))
  .sort((a, b) => a.score - b.score)
  .slice(0, 24);

const markdown = [
  '# CTR 개선 후보 리포트',
  '',
  '> 실제 CTR 수치는 Search Console에서 확인해야 합니다. 이 문서는 제목/설명 구조 기준의 로컬 개선 후보 리포트입니다.',
  '',
  ...candidates.map((item, index) => [
    `## ${index + 1}. ${item.path}`,
    `- 현재 제목: ${item.currentTitle}`,
    `- 현재 설명: ${item.currentDescription}`,
    `- 로컬 CTR 점수: ${item.score}`,
    `- 제안 제목: ${item.suggestedTitle}`,
    `- 제안 설명: ${item.suggestedDescription}`,
    ''
  ].join('\n'))
].join('\n');

await writeText(path.join(ROOT, 'docs', 'ctr-refresh-report-20260323.md'), markdown);
await writeText(path.join(ROOT, 'assets', 'data', 'ctr.refresh.v1.20260323.json'), JSON.stringify({ generatedAt: new Date().toISOString(), candidates }, null, 2));
console.log(`CTR report generated for ${candidates.length} candidates.`);
