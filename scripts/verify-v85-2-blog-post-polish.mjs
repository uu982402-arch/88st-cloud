import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V85_2_BLOG_POST_POLISH_ACTIVE';
function file(...parts) { return path.join(ROOT, ...parts); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function readSlugsFromScript(rel) {
  if (!exists(rel)) return [];
  const src = read(rel);
  return Array.from(src.matchAll(/"slug"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
}
const slugs = Array.from(new Set([
  ...readSlugsFromScript('scripts/generate-v82-2-seo-content.mjs'),
  ...readSlugsFromScript('scripts/generate-v85-seo-content-30.mjs')
]));
if (slugs.length !== 50) throw new Error(`Expected 50 new SEO posts, got ${slugs.length}`);
const forbidden = [
  'class="v82-link-panel"',
  'class="v82-longform-cta"',
  '관련해서 같이 읽으면 좋은 글',
  '계산이 필요한 조건은 도구에서 먼저 확인하세요.'
];
let checked = 0;
for (const slug of slugs) {
  const rel = `blog/${slug}/index.html`;
  if (!exists(rel)) throw new Error(`Missing post: ${rel}`);
  const html = read(rel);
  if (!html.includes(MARKER)) throw new Error(`Missing V85-2 marker: ${rel}`);
  if (!html.includes('v85-2-blog-post-polish.css')) throw new Error(`Missing V85-2 css: ${rel}`);
  if (!html.includes('rust-header')) throw new Error(`Missing RUST header: ${rel}`);
  if (!html.includes('v76.rust-brand-system.css')) throw new Error(`Missing RUST brand css: ${rel}`);
  if (!html.includes('v77.rust-logo-assets.css')) throw new Error(`Missing RUST logo css: ${rel}`);
  if (!html.includes('v82.ga4-events.js')) throw new Error(`Missing GA4 event script: ${rel}`);
  for (const needle of forbidden) {
    if (html.includes(needle)) throw new Error(`Forbidden generated internal link/banner remains in ${rel}: ${needle}`);
  }
  checked += 1;
}
const blogIndex = read('blog/index.html');
if (!blogIndex.includes('총 503개 / 페이지당 50개')) throw new Error('Blog index count did not remain 503');
console.log(`[V85-2] verified. posts=${checked} removedInternalPanels=true structure=kept`);
