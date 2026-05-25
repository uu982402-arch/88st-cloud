import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v85-2-blog-post-polish-20260525';
const MARKER = 'V85_2_BLOG_POST_POLISH_ACTIVE';
const CSS_HREF = `/assets/css/v85-2-blog-post-polish.css?v=${VERSION}`;
const JS_V76 = '/assets/js/v76.rust-brand-system.js?v=static-v76-rust-brand-system-20260524';
const JS_V77 = '/assets/js/v77.rust-logo-assets.js?v=static-v77-rust-logo-assets-20260524';

function file(...parts) { return path.join(ROOT, ...parts); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, body) { fs.mkdirSync(path.dirname(file(rel)), { recursive: true }); fs.writeFileSync(file(rel), body, 'utf8'); }
function readSlugsFromScript(rel) {
  if (!exists(rel)) return [];
  const src = read(rel);
  return Array.from(src.matchAll(/"slug"\s*:\s*"([^"]+)"/g)).map((m) => m[1]);
}
function unique(list) { return Array.from(new Set(list.filter(Boolean))); }
function ensureHeadLink(html, href, attrs = '') {
  if (html.includes(href)) return html;
  return html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${href}" ${attrs}>\n</head>`);
}
function ensureHeadMeta(html) {
  html = html.replace(/<meta name="v85-2-blog-post-polish" content="[^"]*">\s*/g, '');
  return html.replace(/<\/head>/i, `  <meta name="v85-2-blog-post-polish" content="${MARKER}">\n</head>`);
}
function ensureScript(html, src, attrs = '') {
  if (html.includes(src)) return html;
  return html.replace(/<\/body>/i, `  <script defer src="${src}" ${attrs}></script>\n</body>`);
}
function removeInternalLinkBlocks(html) {
  // Remove the explicit related heading/paragraph that was auto-inserted for SEO linking.
  html = html.replace(/\s*<h2>관련해서 같이 읽으면 좋은 글<\/h2>\s*<p>[\s\S]*?<\/p>\s*/g, '\n');
  // Remove all generated internal link panels from the new SEO posts. Existing article paragraphs remain untouched.
  html = html.replace(/\s*<div class="v82-link-panel">[\s\S]*?<\/div>\s*/g, '\n');
  // Remove generated bottom CTA/banner blocks that were not requested.
  html = html.replace(/\s*<div class="v82-longform-cta">[\s\S]*?<\/div>\s*/g, '\n');
  // Clean repeated blank lines after removals.
  html = html.replace(/\n{3,}/g, '\n\n');
  return html;
}
function normalizePost(html) {
  html = ensureHeadLink(html, CSS_HREF, 'data-v85-2-blog-post-polish="true"');
  html = ensureHeadMeta(html);
  html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
    if (match.includes('v85-2-seo-post')) return match;
    const hasClass = /class\s*=\s*"([^"]*)"/i.exec(match);
    if (hasClass) {
      const next = hasClass[1].includes('v85-2-seo-post') ? hasClass[1] : `${hasClass[1]} v85-2-seo-post`;
      return match.replace(hasClass[0], `class="${next.trim()}"`);
    }
    return `<body${attrs} class="v85-2-seo-post">`;
  });
  html = removeInternalLinkBlocks(html);
  html = ensureScript(html, JS_V76, 'data-v76-rust="true"');
  html = ensureScript(html, JS_V77, 'data-v77-rust-logo="true"');
  return html;
}
function updatePackage() {
  const rel = 'package.json';
  const pkg = JSON.parse(read(rel));
  const requiredTail = [
    'node scripts/generate-v82-3-indexing-measurement.mjs',
    'node scripts/generate-v85-seo-content-30.mjs',
    'node scripts/generate-v85-1-blog-strip-clean.mjs',
    'node scripts/generate-v85-2-blog-post-polish.mjs'
  ];
  const verify = 'node scripts/verify-v85-2-blog-post-polish.mjs';
  const chain = String(pkg.scripts?.build || '').split('&&').map((item) => item.trim()).filter(Boolean).filter((item) => !requiredTail.includes(item));
  chain.push(...requiredTail);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v85-2'] = 'node scripts/generate-v85-2-blog-post-polish.mjs';
  pkg.scripts['verify:v85-2'] = verify;
  write(rel, JSON.stringify(pkg, null, 2) + '\n');
}

const slugs = unique([
  ...readSlugsFromScript('scripts/generate-v82-2-seo-content.mjs'),
  ...readSlugsFromScript('scripts/generate-v85-seo-content-30.mjs')
]);
let changed = 0;
let missing = [];
for (const slug of slugs) {
  const rel = `blog/${slug}/index.html`;
  if (!exists(rel)) { missing.push(rel); continue; }
  const before = read(rel);
  const after = normalizePost(before);
  if (before !== after) {
    write(rel, after);
    changed += 1;
  }
}
if (missing.length) {
  throw new Error(`Missing new SEO post html files: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ' ...' : ''}`);
}
updatePackage();
console.log(`[V85-2] blog post polish applied. posts=${slugs.length} changed=${changed} marker=${MARKER}`);
