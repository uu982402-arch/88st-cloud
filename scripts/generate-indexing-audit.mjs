import fs from 'fs/promises';
import path from 'path';
import {
  ROOT,
  POSTS_FILE,
  loadPosts,
  listHtmlFiles,
  fileToPathname,
  normalizePathname,
  isPrivatePath,
  isIgnoredPath,
  writeTextIfChanged,
  TODAY
} from './lib/site-automation.mjs';

const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');
const REPORT_JSON = path.join(ROOT, 'assets/data/indexing.audit.v1.20260322.json');
const REPORT_MD = path.join(ROOT, 'docs/indexing-audit-20260322.md');
const REPORT_MOBILE_MD = path.join(ROOT, 'docs/mobile-speed-audit-20260322.md');

function has(html, regex) { return regex.test(html); }
function extractMany(html, regex) {
  const out = [];
  let m;
  while ((m = regex.exec(html))) out.push(m[1]);
  return out;
}

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePathname(post.path), post]));
const htmlFiles = await listHtmlFiles();
const sitemapXml = await fs.readFile(SITEMAP_FILE, 'utf8').catch(() => '');
const sitemapUrls = new Set(extractMany(sitemapXml, /<loc>([^<]+)<\/loc>/g));

const issues = [];
const summary = {
  generatedAt: TODAY,
  scannedHtml: 0,
  publicHtml: 0,
  privateHtml: 0,
  missingTitle: 0,
  missingDescription: 0,
  missingCanonical: 0,
  missingOgImage: 0,
  missingJsonLd: 0,
  missingViewport: 0,
  blockingScripts: 0,
  genericInternalAnchors: 0,
  missingSitemapUrls: 0,
  privateInSitemap: 0,
  missingLazyImages: 0,
  missingImageAlt: 0,
  missingImageDimensions: 0
};

const genericAnchorRegex = /<a\b[^>]*href=["'](\/[^"']*)["'][^>]*>(?:\s|<[^>]+>)*(글 보기|허브 보기|상세 보기|글 읽기|보기|읽기)(?:\s|<[^>]+>)*<\/a>/ig;

for (const filePath of htmlFiles) {
  const pathname = fileToPathname(filePath);
  if (isIgnoredPath(pathname) || pathname.includes('index.orig.html')) continue;
  const html = await fs.readFile(filePath, 'utf8');
  summary.scannedHtml += 1;
  const isPrivate = isPrivatePath(pathname);
  if (isPrivate) summary.privateHtml += 1; else summary.publicHtml += 1;

  const pageIssues = [];
  if (!has(html, /<title>[\s\S]*?<\/title>/i)) { summary.missingTitle += 1; pageIssues.push('title 누락'); }
  if (!has(html, /<meta\b[^>]*name=["']description["']/i)) { summary.missingDescription += 1; pageIssues.push('description 누락'); }
  if (!has(html, /<link\b[^>]*rel=["']canonical["']/i)) { summary.missingCanonical += 1; pageIssues.push('canonical 누락'); }
  if (!has(html, /<meta\b[^>]*property=["']og:image["']/i)) { summary.missingOgImage += 1; pageIssues.push('og:image 누락'); }
  if (!has(html, /<script\b[^>]*type=["']application\/ld\+json["']/i)) { summary.missingJsonLd += 1; pageIssues.push('JSON-LD 누락'); }
  if (!has(html, /<meta\b[^>]*name=["']viewport["']/i)) { summary.missingViewport += 1; pageIssues.push('viewport 누락'); }

  const blockingScripts = extractMany(html, /<script\b((?=[^>]*\bsrc=)[^>]*src=["'][^"']+["'][^>]*)><\/script>/ig)
    .filter((attrs) => !/\bdefer\b|\basync\b|application\/ld\+json/i.test(attrs));
  if (blockingScripts.length) {
    summary.blockingScripts += blockingScripts.length;
    pageIssues.push(`defer/async 없는 script ${blockingScripts.length}개`);
  }

  const genericAnchors = [...html.matchAll(genericAnchorRegex)].length;
  if (genericAnchors) {
    summary.genericInternalAnchors += genericAnchors;
    pageIssues.push(`일반 링크 문구 ${genericAnchors}개`);
  }

  const imgTags = [...html.matchAll(/<img\b([^>]*?)>/ig)].map((m) => m[1]);
  const nonSvgImages = imgTags.filter((attrs) => !/\.svg(["']|\s|$)/i.test(attrs));
  const missingLazy = nonSvgImages.filter((attrs) => !/\bloading=["'](?:lazy|eager)["']/i.test(attrs) && !/brand-logo/i.test(attrs));
  const missingAlt = imgTags.filter((attrs) => !/\balt=["'][^"']*["']/i.test(attrs));
  const missingDims = nonSvgImages.filter((attrs) => !/\bwidth=["'][^"']+["']/i.test(attrs) || !/\bheight=["'][^"']+["']/i.test(attrs));
  if (missingLazy.length) { summary.missingLazyImages += missingLazy.length; pageIssues.push(`loading 속성 없는 이미지 ${missingLazy.length}개`); }
  if (missingAlt.length) { summary.missingImageAlt += missingAlt.length; pageIssues.push(`alt 없는 이미지 ${missingAlt.length}개`); }
  if (missingDims.length) { summary.missingImageDimensions += missingDims.length; pageIssues.push(`width/height 없는 이미지 ${missingDims.length}개`); }

  if (!isPrivate) {
    const expected = `https://88st.cloud${pathname === '/' ? '/' : pathname}`;
    if (!sitemapUrls.has(expected)) {
      summary.missingSitemapUrls += 1;
      pageIssues.push('사이트맵 누락');
    }
  } else {
    const privateUrl = `https://88st.cloud${pathname === '/' ? '/' : pathname}`;
    if (sitemapUrls.has(privateUrl)) {
      summary.privateInSitemap += 1;
      pageIssues.push('비공개 페이지가 사이트맵에 포함됨');
    }
  }

  if (pageIssues.length) {
    issues.push({ pathname, private: isPrivate, issues: pageIssues });
  }
}

// posts index coverage
const missingPostFiles = [];
for (const post of posts) {
  const filePath = path.join(ROOT, post.path.replace(/^\//, ''), 'index.html');
  try { await fs.access(filePath); } catch { missingPostFiles.push(post.path); }
}

const payload = { summary, issues, missingPostFiles };
await writeTextIfChanged(REPORT_JSON, JSON.stringify(payload, null, 2));

const lines = [
  '# 색인/SEO 자동 점검 리포트',
  '',
  `- 생성일: ${TODAY}`,
  `- 스캔 HTML: ${summary.scannedHtml}`,
  `- 공개 HTML: ${summary.publicHtml}`,
  `- 비공개 HTML: ${summary.privateHtml}`,
  '',
  '## 핵심 수치',
  '',
  `- title 누락: ${summary.missingTitle}`,
  `- description 누락: ${summary.missingDescription}`,
  `- canonical 누락: ${summary.missingCanonical}`,
  `- og:image 누락: ${summary.missingOgImage}`,
  `- JSON-LD 누락: ${summary.missingJsonLd}`,
  `- viewport 누락: ${summary.missingViewport}`,
  `- defer/async 없는 script: ${summary.blockingScripts}`,
  `- 일반 내부링크 문구: ${summary.genericInternalAnchors}`,
  `- 사이트맵 누락 공개 URL: ${summary.missingSitemapUrls}`,
  `- 사이트맵에 들어간 비공개 URL: ${summary.privateInSitemap}`,
  `- loading 속성 없는 이미지: ${summary.missingLazyImages}`,
  `- alt 없는 이미지: ${summary.missingImageAlt}`,
  `- width/height 없는 이미지: ${summary.missingImageDimensions}`,
  `- posts.index 기준 누락 파일: ${missingPostFiles.length}`,
  '',
  '## 우선 조치',
  '',
  '1. defer/async 없는 스크립트 정리',
  '2. 사이트맵 누락 URL 보완',
  '3. 일반적인 내부 링크 문구를 제목형 링크로 치환',
  '4. loading/alt/width/height 없는 이미지 보강',
  '',
  '## 이슈 상세',
  ''
];
for (const issue of issues.slice(0, 120)) {
  lines.push(`- ${issue.pathname} :: ${issue.issues.join(' / ')}`);
}
if (missingPostFiles.length) {
  lines.push('', '## posts.index 누락 파일', '');
  for (const item of missingPostFiles) lines.push(`- ${item}`);
}
await writeTextIfChanged(REPORT_MD, `${lines.join('\n')}\n`);

const perfLines = [
  '# 모바일·속도 점검 리포트',
  '',
  `- 생성일: ${TODAY}`,
  '',
  '## 자동 점검 기준',
  '',
  '- viewport 존재 여부',
  '- defer/async 없는 스크립트',
  '- loading 속성 없는 이미지',
  '- alt 누락 이미지',
  '- width/height 누락 이미지',
  '- 일반적인 내부 링크 문구',
  '',
  '## 요약',
  '',
  `- viewport 누락: ${summary.missingViewport}`,
  `- defer/async 없는 script: ${summary.blockingScripts}`,
  `- loading 속성 없는 이미지: ${summary.missingLazyImages}`,
  `- alt 없는 이미지: ${summary.missingImageAlt}`,
  `- width/height 없는 이미지: ${summary.missingImageDimensions}`,
  `- 일반 내부링크 문구: ${summary.genericInternalAnchors}`,
  '',
  '## 권장 순서',
  '',
  '1. 이미지 width/height 고정',
  '2. 본문 아래 이미지 lazy 로드 정리',
  '3. 일반 버튼 문구를 주제형 링크로 치환',
  '4. render-blocking script 제거 또는 defer 처리'
];
await writeTextIfChanged(REPORT_MOBILE_MD, `${perfLines.join('\n')}\n`);

console.log(`Indexing audit generated. Issues: ${issues.length}, missing post files: ${missingPostFiles.length}.`);
