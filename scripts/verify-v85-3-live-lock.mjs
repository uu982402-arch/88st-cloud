import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V85_3_LIVE_LOCK_ACTIVE';
function file(...parts) { return path.join(ROOT, ...parts); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function readSlugsFromScript(rel) {
  if (!exists(rel)) return [];
  const src = read(rel);
  return Array.from(src.matchAll(/"slug"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
}
function must(cond, msg) { if (!cond) throw new Error(msg); }

const slugs = Array.from(new Set([
  ...readSlugsFromScript('scripts/generate-v82-2-seo-content.mjs'),
  ...readSlugsFromScript('scripts/generate-v85-seo-content-30.mjs')
]));
must(slugs.length === 50, `Expected 50 new SEO posts, got ${slugs.length}`);

const forbiddenBlog = [
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개',
  '토토·입플·보증업체·도구 연결 20개',
  'class="v82-seo-strip"',
  'data-v82-2-seo-strip="true"'
];
const blogIndex = read('blog/index.html');
must(blogIndex.includes(MARKER), 'Missing V85-3 marker in blog/index.html');
for (const needle of forbiddenBlog) {
  must(!blogIndex.includes(needle), `Forbidden blog strip remains in blog/index.html: ${needle}`);
}
must(blogIndex.includes('총 503개 / 페이지당 50개'), 'Blog index count did not remain 503');

const forbiddenPost = [
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  '관련해서 같이 읽으면 좋은 글',
  '관련 계산기와 다음 확인 루트',
  '다음 확인 루트',
  'class="v82-link-panel"',
  'class="v82-longform-cta"',
  '<a href="/tools/">도구 열기</a>',
  '<a href="/guaranteed/">보증업체 확인</a>',
  '<a href="/consult/">상담 연결</a>',
  '계산이 필요한 조건은 도구에서 먼저 확인하세요.'
];
let checked = 0;
for (const slug of slugs) {
  const rel = `blog/${slug}/index.html`;
  must(exists(rel), `Missing SEO post file: ${rel}`);
  const html = read(rel);
  must(html.includes(MARKER), `Missing V85-3 marker: ${rel}`);
  must(html.includes('rust-header'), `Missing RUST header: ${rel}`);
  must(html.includes('v76.rust-brand-system.css'), `Missing RUST brand css: ${rel}`);
  for (const needle of forbiddenPost) {
    must(!html.includes(needle), `Forbidden post internal-link residue remains in ${rel}: ${needle}`);
  }
  checked += 1;
}
console.log(`[V85-3] verified. blogStripRemoved=true posts=${checked} internalLinkTailsRemoved=true`);
