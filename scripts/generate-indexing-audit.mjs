import fs from 'fs/promises';
import path from 'path';
import {
  loadPosts,
  listHtmlRoutes,
  normalizePath,
  toFilePath,
  isNoindexPath,
  readFileSafe,
  urlFor,
  fileExists
} from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));
const routes = await listHtmlRoutes();
const sitemapText = await readFileSafe(path.join(process.cwd(), 'sitemap.txt'));
const sitemapUrls = new Set(String(sitemapText || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean));

function extractAttr(tag, attr) {
  const match = String(tag).match(new RegExp(`${attr}=["']([^"']*)["']`, 'i'));
  return match?.[1]?.trim() || '';
}

function findMeta(html, key, value) {
  const tags = [...String(html).matchAll(/<meta\b[^>]*>/ig)].map((m) => m[0]);
  return tags.find((tag) => new RegExp(`${key}=["']${value}["']`, 'i').test(tag)) || '';
}

function findLink(html, rel) {
  const tags = [...String(html).matchAll(/<link\b[^>]*>/ig)].map((m) => m[0]);
  return tags.find((tag) => new RegExp(`rel=["']${rel}["']`, 'i').test(tag)) || '';
}

const issues = [];
const warnings = [];
let postMissingFiles = 0;
let postNoStructuredData = 0;
let publicRoutes = 0;

for (const post of posts) {
  const filePath = toFilePath(post.path);
  if (!(await fileExists(filePath))) {
    issues.push({ type: 'missing-post-file', path: normalizePath(post.path), message: 'posts.index에 있으나 실제 파일이 없습니다.' });
    postMissingFiles += 1;
  }
}

for (const pathname of routes) {
  const filePath = toFilePath(pathname);
  const html = await readFileSafe(filePath);
  if (!html) continue;
  const robotsTag = findMeta(html, 'name', 'robots');
  const descTag = findMeta(html, 'name', 'description');
  const canonicalTag = findLink(html, 'canonical');
  const noindex = /noindex/i.test(extractAttr(robotsTag, 'content'));
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const desc = extractAttr(descTag, 'content');
  const canonical = extractAttr(canonicalTag, 'href');
  const hasBreadcrumb = /"@type":"BreadcrumbList"/.test(html);
  const hasArticle = /"@type":"Article"/.test(html);
  const hasCollection = /"@type":"CollectionPage"/.test(html) || /"@type":"WebSite"/.test(html);
  const url = urlFor(pathname);
  const isNoindex = isNoindexPath(pathname) || noindex;

  if (!isNoindex) publicRoutes += 1;
  if (!title) issues.push({ type: 'missing-title', path: pathname, message: 'title 태그가 비어 있습니다.' });
  if (!desc) issues.push({ type: 'missing-description', path: pathname, message: 'description 메타가 비어 있습니다.' });
  if (!canonical) issues.push({ type: 'missing-canonical', path: pathname, message: 'canonical 링크가 없습니다.' });
  if (canonical && canonical !== url) warnings.push({ type: 'canonical-mismatch', path: pathname, message: `canonical이 ${canonical} 로 설정되어 있습니다.` });

  if (!isNoindex && !sitemapUrls.has(url)) {
    warnings.push({ type: 'not-in-sitemap', path: pathname, message: '공개 페이지인데 sitemap.txt에 없습니다.' });
  }
  if (isNoindex && sitemapUrls.has(url)) {
    issues.push({ type: 'noindex-in-sitemap', path: pathname, message: 'noindex 페이지가 사이트맵에 포함되어 있습니다.' });
  }
  const post = postMap.get(normalizePath(pathname));
  if (post && (!hasArticle || !hasBreadcrumb)) {
    warnings.push({ type: 'post-structured-data-missing', path: pathname, message: '게시글 구조화데이터가 일부 누락됐습니다.' });
    postNoStructuredData += 1;
  }
  if (!post && !isNoindex && !hasCollection) {
    warnings.push({ type: 'page-structured-data-missing', path: pathname, message: '허브/페이지 구조화데이터가 없습니다.' });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  publicRoutes,
  indexedCandidatePosts: posts.length,
  missingPostFiles: postMissingFiles,
  postsWithStructuredDataWarnings: postNoStructuredData,
  issueCount: issues.length,
  warningCount: warnings.length
};

await fs.mkdir(path.join(process.cwd(), 'assets/data'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'assets/data/indexing.audit.v1.20260322.json'), JSON.stringify({ summary, issues, warnings }, null, 2), 'utf8');
await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
const md = [
  '# 색인 점검 리포트',
  '',
  `- 생성 시각: ${summary.generatedAt}`,
  `- 공개 후보 URL: ${summary.publicRoutes}`,
  `- posts.index 게시글 수: ${summary.indexedCandidatePosts}`,
  `- 누락 게시글 파일: ${summary.missingPostFiles}`,
  `- 이슈: ${summary.issueCount}`,
  `- 경고: ${summary.warningCount}`,
  '',
  '## 핵심 결과',
  '',
  summary.issueCount === 0 ? '- 치명적 색인 이슈 없음' : `- 치명적 색인 이슈 ${summary.issueCount}건`,
  summary.warningCount === 0 ? '- 경고 없음' : `- 경고 ${summary.warningCount}건`,
  '',
  '## 주요 이슈',
  '',
  ...(issues.length ? issues.map((item) => `- ${item.path} · ${item.message}`) : ['- 없음']),
  '',
  '## 주요 경고',
  '',
  ...(warnings.slice(0, 30).length ? warnings.slice(0, 30).map((item) => `- ${item.path} · ${item.message}`) : ['- 없음'])
].join('\n');
await fs.writeFile(path.join(process.cwd(), 'docs/indexing-audit-20260322.md'), `${md}\n`, 'utf8');

console.log(`Indexing audit generated (${issues.length} issues, ${warnings.length} warnings).`);
