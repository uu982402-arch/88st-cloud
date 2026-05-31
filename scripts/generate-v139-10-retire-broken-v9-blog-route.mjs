import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const VERSION = 'V139_10_RETIRE_BROKEN_V9_BLOG_ROUTE';
const brokenTitle = '미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유';
const brokenSlugs = [
  'minigame-streak-exclusion-guide.html',
  'minigame-losing-streak-event-exclusion-condition-guide.html',
  'minigame-losing-streak-event-exclusion-condition-first.html',
  'minigame-losing-streak-event-exclusion-condition-first/'
];
const brokenPaths = [
  '/blog/minigame-streak-exclusion-guide.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first'
];

function read(file) { return readFileSync(file, 'utf8'); }
function write(file, content) { writeFileSync(file, content); }
function walk(dir, out = []) {
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}
function count(haystack, needle) { return (haystack.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; }

let changed = [];
let blogCardRemoved = false;
const blogIndex = 'blog/index.html';
if (existsSync(blogIndex)) {
  let html = read(blogIndex);
  const before = html;
  const cardPatterns = [
    /<a\b[^>]*href="\/blog\/minigame-streak-exclusion-guide\.html"[\s\S]*?<\/a>/g,
    /<a\b[^>]*href="\/blog\/minigame\/minigame-losing-streak-event-exclusion-condition-guide\.html"[\s\S]*?<\/a>/g,
    /<a\b[^>]*data-title="미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유"[\s\S]*?<\/a>/g
  ];
  for (const pattern of cardPatterns) html = html.replace(pattern, '');
  html = html.replace('인기글 · 핵심글 · 최신글 76개', '인기글 · 핵심글 · 최신글 75개');
  html = html.replace('<span class="v72-blog-card__rank">V10</span><span class="v72-blog-card__tag">USDT</span>', '<span class="v72-blog-card__rank">V9</span><span class="v72-blog-card__tag">USDT</span>');
  html = html.replace(/\n{3,}/g, '\n\n');
  if (html !== before) {
    write(blogIndex, html);
    blogCardRemoved = true;
    changed.push(blogIndex);
  }
}

const sitemapFiles = ['sitemap.xml', 'sitemap.txt', 'serverless/sitemap.xml', 'serverless/sitemap.txt'].filter(existsSync);
for (const file of sitemapFiles) {
  let text = read(file);
  const before = text;
  for (const slug of brokenSlugs) {
    text = text.split('\n').filter(line => !line.includes(slug)).join('\n');
  }
  text = text.replace(/\n{3,}/g, '\n\n');
  if (text !== before) { write(file, text.endsWith('\n') ? text : text + '\n'); changed.push(file); }
}

const redirectsPath = '_redirects';
if (existsSync(redirectsPath)) {
  let text = read(redirectsPath);
  const before = text;
  // Remove older redirects for these paths first.
  text = text.split('\n').filter(line => {
    const t = line.trim();
    if (t === '# V139.10 retired broken V9 blog routes - keep users away from Cloudflare asset conflict') return false;
    return !brokenPaths.some(p => t.startsWith(p + ' '));
  }).join('\n');
  const block = [
    '# V139.10 retired broken V9 blog routes - keep users away from Cloudflare asset conflict',
    '/blog/minigame-streak-exclusion-guide.html /blog/ 302',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html /blog/ 302',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html /blog/ 302',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/ /blog/ 302',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first /blog/ 302'
  ].join('\n');
  text = text.replace(/\s+$/, '') + '\n' + block + '\n';
  if (text !== before) { write(redirectsPath, text); changed.push(redirectsPath); }
}

// Make sure package points at this safe chain.
const pkgPath = 'package.json';
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v139-10-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v139-10-retire-broken-v9-blog-route.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  changed.push(pkgPath);
}

const audit = {
  ok: true,
  version: VERSION,
  action: 'retired V9 broken blog route from visible/indexable surfaces',
  blogCardRemoved,
  brokenPaths,
  changedFiles: [...new Set(changed)],
  generatedAt: new Date().toISOString()
};
write('reports/v139-10-retire-broken-v9-blog-route-audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log('[V139.10 GENERATE PASS]', JSON.stringify(audit, null, 2));
