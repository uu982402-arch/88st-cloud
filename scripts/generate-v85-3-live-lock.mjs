import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v85-3-live-lock-20260525';
const MARKER = 'V85_3_LIVE_LOCK_ACTIVE';

function file(...parts) { return path.join(ROOT, ...parts); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, body) { fs.mkdirSync(path.dirname(file(rel)), { recursive: true }); fs.writeFileSync(file(rel), body, 'utf8'); }
function unique(list) { return Array.from(new Set(list.filter(Boolean))); }
function readSlugsFromScript(rel) {
  if (!exists(rel)) return [];
  const src = read(rel);
  return Array.from(src.matchAll(/"slug"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
}

function ensureMeta(html) {
  html = html.replace(/<meta name="v85-3-live-lock" content="[^"]*">\s*/g, '');
  if (html.includes('</head>')) {
    return html.replace(/<\/head>/i, `  <meta name="v85-3-live-lock" content="${MARKER}">\n</head>`);
  }
  return html;
}

function removeBetweenComments(html, start, end) {
  while (html.includes(start) && html.includes(end)) {
    const s = html.indexOf(start);
    const e = html.indexOf(end, s);
    if (s < 0 || e < 0) break;
    html = html.slice(0, s) + html.slice(e + end.length);
  }
  return html;
}

function removeContainerContaining(html, needle) {
  while (html.includes(needle)) {
    const idx = html.indexOf(needle);
    const starts = ['<section', '<div', '<article'];
    let start = -1;
    let tag = '';
    for (const candidate of starts) {
      const s = html.lastIndexOf(candidate, idx);
      if (s > start) { start = s; tag = candidate.slice(1); }
    }
    if (start < 0) {
      html = html.replace(needle, '');
      continue;
    }
    const close = `</${tag}>`;
    const end = html.indexOf(close, idx);
    if (end < 0) {
      html = html.replace(needle, '');
      continue;
    }
    html = html.slice(0, start) + html.slice(end + close.length);
  }
  return html;
}

function cleanBlogIndex(html) {
  html = removeBetweenComments(html, '<!-- V82-2 SEO CONTENT START -->', '<!-- V82-2 SEO CONTENT END -->');
  html = html.replace(/\s*<section[^>]*class="[^"]*v82-seo-strip[^"]*"[\s\S]*?<\/section>\s*/g, '\n');
  html = removeContainerContaining(html, '신규 유입 확장 콘텐츠');
  html = removeContainerContaining(html, '토토·입플·보증업체·도구 연결 50개');
  html = removeContainerContaining(html, '토토·입플·보증업체·도구 연결 20개');
  html = html.replace(/신규 유입 확장 콘텐츠/g, '');
  html = html.replace(/토토·입플·보증업체·도구 연결\s*(?:20|50)개/g, '');
  html = ensureMeta(html);
  html = html.replace(/\n{3,}/g, '\n\n');
  return html;
}

function removeHeadingToBodyClose(html, heading) {
  let guard = 0;
  while (html.includes(heading) && guard < 20) {
    guard += 1;
    const s = html.indexOf(heading);
    // Prefer cutting to the first body/content div close after the generated tail.
    const divClose = html.indexOf('</div>', s);
    if (divClose >= 0) {
      html = html.slice(0, s) + html.slice(divClose);
      continue;
    }
    const nextHeading = html.indexOf('<h2', s + heading.length);
    const end = nextHeading >= 0 ? nextHeading : html.indexOf('</article>', s);
    if (end >= 0) html = html.slice(0, s) + html.slice(end);
    else html = html.replace(heading, '');
  }
  return html;
}

function cleanPost(html) {
  html = ensureMeta(html);
  // Remove explicit wording that promised bottom internal links.
  html = html.replace(/\s*페이지 하단의 내부 링크[^<.。]*?구성했습니다\./g, '');
  html = html.replace(/페이지 하단의 내부 링크[^<.。]*?구성했습니다\./g, '');
  // Remove generated related-link / route tail sections.
  html = removeHeadingToBodyClose(html, '<h2>관련 글과 다음 확인 루트</h2>');
  html = removeHeadingToBodyClose(html, '<h2>관련해서 같이 읽으면 좋은 글</h2>');
  html = removeHeadingToBodyClose(html, '<h2>관련 계산기와 다음 확인 루트</h2>');
  html = removeHeadingToBodyClose(html, '<h2>다음 확인 루트</h2>');
  html = html.replace(/\s*<div class="v82-link-panel"[\s\S]*?<\/div>\s*/g, '\n');
  html = html.replace(/\s*<div class="v82-longform-cta"[\s\S]*?<\/div>\s*/g, '\n');
  html = html.replace(/\s*<a href="\/tools\/">도구 열기<\/a>\s*/g, '\n');
  html = html.replace(/\s*<a href="\/guaranteed\/">보증업체 확인<\/a>\s*/g, '\n');
  html = html.replace(/\s*<a href="\/consult\/">상담 연결<\/a>\s*/g, '\n');
  html = html.replace(/계산이 필요한 조건은 도구에서 먼저 확인하세요\./g, '');
  html = html.replace(/\n{3,}/g, '\n\n');
  return html;
}

function updatePackage() {
  const rel = 'package.json';
  const pkg = JSON.parse(read(rel));
  const generate = 'node scripts/generate-v85-3-live-lock.mjs';
  const verify = 'node scripts/verify-v85-3-live-lock.mjs';
  const chain = String(pkg.scripts?.build || '')
    .split('&&')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== generate);
  chain.push(generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v85-3'] = generate;
  pkg.scripts['verify:v85-3'] = verify;
  write(rel, JSON.stringify(pkg, null, 2) + '\n');
}

const slugs = unique([
  ...readSlugsFromScript('scripts/generate-v82-2-seo-content.mjs'),
  ...readSlugsFromScript('scripts/generate-v85-seo-content-30.mjs')
]);
if (slugs.length !== 50) {
  throw new Error(`Expected 50 new SEO post slugs, got ${slugs.length}`);
}

let changedPosts = 0;
for (const slug of slugs) {
  const rel = `blog/${slug}/index.html`;
  if (!exists(rel)) throw new Error(`Missing new SEO post file: ${rel}`);
  const before = read(rel);
  const after = cleanPost(before);
  if (before !== after) {
    write(rel, after);
    changedPosts += 1;
  }
}

const blogRel = 'blog/index.html';
const beforeBlog = read(blogRel);
const afterBlog = cleanBlogIndex(beforeBlog);
if (beforeBlog !== afterBlog) write(blogRel, afterBlog);

updatePackage();
console.log(`[V85-3] live lock applied. posts=${slugs.length} changedPosts=${changedPosts} blogIndexChanged=${beforeBlog !== afterBlog} marker=${MARKER} version=${VERSION}`);
