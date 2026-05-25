import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function must(condition, message) {
  if (!condition) {
    console.error(`[V85-1 verify] ${message}`);
    process.exit(1);
  }
}
function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const blogIndex = read(path.join(root, 'blog', 'index.html'));
must(blogIndex, 'blog/index.html missing');
must(blogIndex.includes('data-v85-1-blog-strip-clean="true"'), 'V85-1 clean marker missing');
must(!blogIndex.includes('v82-seo-strip'), 'v82 SEO strip class still remains in blog index');
must(!blogIndex.includes('신규 유입 확장 콘텐츠'), 'new traffic expansion section title still remains');
must(!blogIndex.includes('토토·입플·보증업체·도구 연결 50개'), 'new traffic expansion section subtitle still remains');
must(!blogIndex.includes('신규 SEO 확장 콘텐츠 50개'), 'new SEO expansion aria label still remains');
must(blogIndex.includes('총 503개 / 페이지당 50개'), 'blog total count 503/page 50 missing');
must(blogIndex.includes('window.__V72_1_BLOG_POSTS__'), 'blog pool JSON missing');

const requiredPosts = [
  '/blog/toto-site-recommendation-detail-2026-ranking-signals/',
  '/blog/2026-toto-site-recommendation-safe-checklist/',
  '/blog/ga4-gsc-content-feedback-loop-rust/'
];
for (const href of requiredPosts) {
  must(blogIndex.includes(href), `expected SEO post missing from all-post pool: ${href}`);
  const file = path.join(root, href.replace(/^\//, ''), 'index.html');
  must(fs.existsSync(file), `expected SEO post file missing: ${file}`);
}

must(blogIndex.includes('data-v72-blog-grid'), 'existing all-post grid missing');
must(blogIndex.includes('data-v72-blog-search'), 'existing blog search missing');
must(blogIndex.includes('data-v72-pagination'), 'existing pagination missing');

console.log('[V85-1 verify] ok: separate SEO section removed, posts remain in all-post pool.');
