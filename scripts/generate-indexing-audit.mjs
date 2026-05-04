import fs from 'fs/promises';
import path from 'path';
import {
  ROOT, listIndexFiles, routeFromFile, isPublicRoute,
  extractTagText, extractMetaContent, writeText
} from './lib/site-automation.mjs';

const files = await listIndexFiles(ROOT);
const rows = [];

for (const file of files) {
  const route = routeFromFile(file);
  if (!isPublicRoute(route)) continue;
  const html = await fs.readFile(file, 'utf8');
  const robots = extractMetaContent(html, 'robots');
  if (/noindex/i.test(robots)) continue;

  const title = extractTagText(html, 'title');
  const description = extractMetaContent(html, 'description');
  const h1 = extractTagText(html, 'h1');
  const hasCanonical = /rel=["']canonical["']/i.test(html);
  const hasOg = /property=["']og:title["']/i.test(html);
  const hasSchema = /application\/ld\+json/i.test(html);
  const issue = [];
  if (!title) issue.push('title 없음');
  if (!description) issue.push('description 없음');
  if (!h1) issue.push('h1 없음');
  if (!hasCanonical) issue.push('canonical 없음');
  if (!hasOg) issue.push('OG 없음');
  if (!hasSchema) issue.push('구조화데이터 없음');
  rows.push({ route, titleLength: title.length, descriptionLength: description.length, issues: issue });
}

const issueRows = rows.filter((row) => row.issues.length);
const markdown = [
  '# 색인 점검 리포트',
  '',
  `- 공개 색인 대상 페이지 수: ${rows.length}`,
  `- 이슈 있는 페이지 수: ${issueRows.length}`,
  '',
  '## 상태',
  issueRows.length ? issueRows.map((row) => `- ${row.route} : ${row.issues.join(', ')}`).join('\n') : '- 이슈 0건',
  ''
].join('\n');

await writeText(path.join(ROOT, 'docs', 'indexing-audit-latest.md'), markdown);
await writeText(path.join(ROOT, 'assets', 'data', 'indexing.audit.v1.20260323.json'), JSON.stringify({ generatedAt: new Date().toISOString(), pages: rows }, null, 2));
console.log(`Indexing audit generated. issues=${issueRows.length}`);
