import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://88st.cloud';
const VERSION = 'static-v88-indexing-readiness-20260526';
const MARKER = 'V88_INDEXING_READINESS_ACTIVE';
const DATA_PATH = 'assets/data/v88-indexing-readiness.json';
const CSS_HREF = '/assets/css/v88-indexing-readiness.css?v=static-v88-indexing-readiness-20260526';
const JS_SRC = '/assets/js/v88-indexing-readiness.js?v=static-v88-indexing-readiness-20260526';

function abs(file) { return path.join(ROOT, file); }
function exists(file) { return fs.existsSync(abs(file)); }
function read(file) { return fs.readFileSync(abs(file), 'utf8'); }
function write(file, body) {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), body, 'utf8');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}
function rel(file) { return path.relative(ROOT, file).replaceAll(path.sep, '/'); }
function fileToUrl(file) {
  let r = file.replaceAll('\\', '/');
  if (r === 'index.html') return `${DOMAIN}/`;
  if (r.endsWith('/index.html')) return `${DOMAIN}/${r.slice(0, -'index.html'.length)}`;
  if (r.endsWith('.html')) return `${DOMAIN}/${r}`;
  return `${DOMAIN}/${r}`;
}
function urlToFile(url) {
  const u = new URL(url);
  let p = decodeURIComponent(u.pathname);
  if (p === '/') return 'index.html';
  if (p.endsWith('/')) return p.slice(1) + 'index.html';
  return p.slice(1);
}
function titleOf(html, fallback) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : fallback;
}
function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}
function ensureHeadMeta(html, name, tag) {
  const safe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let next = html.replace(new RegExp(`\\s*<meta[^>]+name=["']${safe}["'][^>]*>`, 'gi'), '');
  if (/<\/head>/i.test(next)) return next.replace(/<\/head>/i, `  ${tag}\n</head>`);
  return next;
}
function ensureCssJs(html) {
  let next = html;
  next = next.replace(/\s*<link[^>]+v88-indexing-readiness\.css[^>]*>/gi, '');
  next = next.replace(/\s*<script[^>]+v88-indexing-readiness\.js[^>]*><\/script>/gi, '');
  next = next.replace(/<\/head>/i, `  <link rel="stylesheet" href="${CSS_HREF}" data-v88-indexing="true">\n</head>`);
  next = next.replace(/<\/body>/i, `  <script src="${JS_SRC}" defer data-v88-indexing="true"></script>\n</body>`);
  return next;
}
function canonicalUrlForFile(file) {
  return fileToUrl(file);
}
function normalizeCanonical(html, file) {
  if (!/<head[\s>]/i.test(html)) return html;
  const canonical = canonicalUrlForFile(file);
  let next = html.replace(/\s*<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
  next = next.replace(/<\/head>/i, `  <link rel="canonical" href="${canonical}">\n</head>`);
  return next;
}

const noSitemapPrefixes = ['/admin/', '/ops/', '/api/'];
const publicHtml = [];
const noindexPublic = [];
const htmlFiles = walk(ROOT).map(rel).sort();
for (const file of htmlFiles) {
  if (file.startsWith('admin/') || file.startsWith('ops/')) continue;
  const url = fileToUrl(file);
  const pathname = new URL(url).pathname;
  if (noSitemapPrefixes.some(prefix => pathname.startsWith(prefix))) continue;
  const html = read(file);
  if (hasNoindex(html)) {
    noindexPublic.push({ file, url, title: titleOf(html, file) });
    continue;
  }
  publicHtml.push({ file, url, title: titleOf(html, file) });
}

const coreUrls = [
  `${DOMAIN}/`,
  `${DOMAIN}/blog/`,
  `${DOMAIN}/tools/`,
  `${DOMAIN}/guaranteed/`,
  `${DOMAIN}/consult/`,
  `${DOMAIN}/sports-check/`,
  `${DOMAIN}/search-guides/`
];

function loadTargets() {
  const f = 'assets/data/v85-4-blog-post-shell-targets.json';
  if (!exists(f)) return [];
  try {
    const data = JSON.parse(read(f));
    return (data.targets || []).filter(file => exists(file)).map(file => ({ file, url: fileToUrl(file), title: titleOf(read(file), file) }));
  } catch {
    return [];
  }
}
const newSeoPosts = loadTargets();

function collectHubDetails(prefix) {
  return publicHtml
    .filter(item => item.file.startsWith(`${prefix}/`) && item.file !== `${prefix}/index.html`)
    .map(item => ({ file: item.file, url: item.url, title: item.title }))
    .sort((a, b) => a.url.localeCompare(b.url, 'ko'));
}
const sportsCheckUrls = collectHubDetails('sports-check');
const searchGuideUrls = collectHubDetails('search-guides');

function priorityOf(url) {
  const p = new URL(url).pathname;
  const order = ['/', '/blog/', '/tools/', '/guaranteed/', '/consult/', '/sports-check/', '/search-guides/'];
  const idx = order.indexOf(p);
  if (idx >= 0) return idx;
  if (p.startsWith('/blog/')) return 20;
  if (p.startsWith('/sports-check/')) return 30;
  if (p.startsWith('/search-guides/')) return 40;
  if (p.startsWith('/tools/')) return 50;
  if (p.startsWith('/guaranteed/')) return 60;
  return 90;
}
const existingSitemapUrls = exists('sitemap.txt') ? read('sitemap.txt').split(/\r?\n/).map(s => s.trim()).filter(s => s.startsWith(DOMAIN)) : [];
const urlSet = new Set([...existingSitemapUrls, ...publicHtml.map(item => item.url), ...coreUrls]);
for (const bad of [...urlSet]) {
  const pathName = new URL(bad).pathname;
  if (noSitemapPrefixes.some(prefix => pathName.startsWith(prefix))) urlSet.delete(bad);
  const f = urlToFile(bad);
  if (!exists(f)) urlSet.delete(bad);
  else if (hasNoindex(read(f))) urlSet.delete(bad);
}
const sortedUrls = [...urlSet].sort((a, b) => priorityOf(a) - priorityOf(b) || a.localeCompare(b, 'ko'));

const today = new Date().toISOString().slice(0, 10);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sortedUrls.map(url => {
    const p = new URL(url).pathname;
    let priority = '0.60';
    if (p === '/') priority = '1.00';
    else if (coreUrls.includes(url)) priority = '0.90';
    else if (p.startsWith('/blog/')) priority = '0.72';
    else if (p.startsWith('/sports-check/') || p.startsWith('/search-guides/')) priority = '0.74';
    return `  <url><loc>${escapeHtml(url)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  }).join('\n') +
  `\n</urlset>\n`;
write('sitemap.xml', sitemapXml);
write('sitemap.txt', sortedUrls.join('\n') + '\n');

let robots = exists('robots.txt') ? read('robots.txt') : 'User-agent: *\n';
if (!/Disallow:\s*\/admin\//i.test(robots)) robots += 'Disallow: /admin/\n';
if (!/Disallow:\s*\/ops\//i.test(robots)) robots += 'Disallow: /ops/\n';
if (!/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots)) robots += 'Sitemap: https://88st.cloud/sitemap.xml\n';
write('robots.txt', robots.replace(/\n{3,}/g, '\n\n').trim() + '\n');

const canonicalFixed = [];
const canonicalTargets = new Set([...publicHtml.map(item => item.file), ...newSeoPosts.map(item => item.file), 'index.html', 'blog/index.html', 'tools/index.html', 'guaranteed/index.html', 'consult/index.html', 'sports-check/index.html', 'search-guides/index.html']);
for (const file of canonicalTargets) {
  if (!exists(file) || file.startsWith('admin/') || file.startsWith('ops/')) continue;
  const before = read(file);
  let after = normalizeCanonical(before, file);
  after = ensureHeadMeta(after, 'v88-indexing-readiness', `<meta name="v88-indexing-readiness" content="${MARKER}" data-v88-indexing="true">`);
  if (after !== before) {
    write(file, after);
    canonicalFixed.push(file);
  }
}

function ensureOpsPanel() {
  const file = 'ops/index.html';
  if (!exists(file)) return false;
  let html = read(file);
  html = ensureHeadMeta(html, 'v88-indexing-readiness', `<meta name="v88-indexing-readiness" content="${MARKER}" data-v88-indexing="true">`);
  html = ensureCssJs(html);
  if (!html.includes('href="#indexing-readiness"')) {
    html = html.replace(/(<a href="#live-check">라이브검증<\/a>)/, `$1\n        <a href="#indexing-readiness">색인준비</a>`);
  }
  html = html.replace(/<!-- V88 INDEXING READINESS START -->[\s\S]*?<!-- V88 INDEXING READINESS END -->\s*/g, '');
  const panel = `
      <!-- V88 INDEXING READINESS START -->
      <section class="v88-index-panel" id="indexing-readiness" data-v88-indexing="${MARKER}" aria-label="색인 안정화 준비 센터">
        <div class="v88-index-head">
          <div>
            <span class="v88-index-kicker">V88 INDEXING READINESS</span>
            <h2>색인 안정화 준비 센터</h2>
            <p>sitemap, canonical, noindex, 신규 SEO 글 50개, sports-check/search-guides 상세 URL을 업로드 직후 바로 확인합니다.</p>
          </div>
          <div class="v88-index-actions">
            <button type="button" class="v88-index-btn is-primary" data-v88-copy-indexing>색인 URL 복사</button>
            <button type="button" class="v88-index-btn" data-v88-copy-new-posts>신규 글 50개 복사</button>
          </div>
        </div>
        <div class="v88-index-metrics">
          <div><small>사이트맵 URL</small><strong>${sortedUrls.length}</strong><span>noindex 제외 후 정렬</span></div>
          <div><small>신규 SEO 글</small><strong>${newSeoPosts.length}</strong><span>색인 요청 우선</span></div>
          <div><small>스포츠 체크</small><strong>${sportsCheckUrls.length}</strong><span>상세 URL</span></div>
          <div><small>검색 가이드</small><strong>${searchGuideUrls.length}</strong><span>상세 URL</span></div>
        </div>
        <div class="v88-index-grid" data-v88-indexing-list></div>
        <pre class="v88-index-log" data-v88-indexing-log>Search Console URL 검사에 넣을 우선 URL을 복사할 수 있습니다.</pre>
      </section>
      <!-- V88 INDEXING READINESS END -->`;
  if (html.includes('<!-- V87 LIVE DEPLOY CHECK END -->')) html = html.replace('<!-- V87 LIVE DEPLOY CHECK END -->', `<!-- V87 LIVE DEPLOY CHECK END -->\n${panel}`);
  else if (html.includes('</main>')) html = html.replace('</main>', `${panel}\n    </main>`);
  else html += panel;
  write(file, html);
  return true;
}
const opsUpdated = ensureOpsPanel();

const indexingPriorityUrls = [
  ...coreUrls,
  ...newSeoPosts.map(item => item.url),
  ...sportsCheckUrls.map(item => item.url),
  ...searchGuideUrls.map(item => item.url)
].filter((url, idx, arr) => arr.indexOf(url) === idx);

const data = {
  version: VERSION,
  marker: MARKER,
  generatedAt: new Date().toISOString(),
  domain: DOMAIN,
  sitemap: {
    url: `${DOMAIN}/sitemap.xml`,
    txt: `${DOMAIN}/sitemap.txt`,
    count: sortedUrls.length,
    lastmod: today,
    excludedPrefixes: noSitemapPrefixes
  },
  canonical: {
    fixedCount: canonicalFixed.length,
    fixedFiles: canonicalFixed.slice(0, 250)
  },
  noindex: {
    expected: ['/ops/', '/admin/'],
    publicNoindexNotInSitemapCount: noindexPublic.length,
    publicNoindexSamples: noindexPublic.slice(0, 30)
  },
  indexingPriorityUrls,
  newSeoPosts: newSeoPosts.map(item => ({ title: item.title, file: item.file, url: item.url })),
  sportsCheckUrls: sportsCheckUrls.map(item => ({ title: item.title, file: item.file, url: item.url })),
  searchGuideUrls: searchGuideUrls.map(item => ({ title: item.title, file: item.file, url: item.url })),
  coreUrls,
  checklist: [
    'Search Console에 sitemap.xml 제출 상태 확인',
    '신규 SEO 글 50개 URL 검사 우선 요청',
    'sports-check/search-guides 상세 URL 색인 가능 여부 확인',
    'noindex는 /ops, /admin만 의도된 제외로 관리',
    'canonical과 sitemap URL이 서로 같은지 확인'
  ]
};
write(DATA_PATH, JSON.stringify(data, null, 2) + '\n');

function updatePackage() {
  const pkg = JSON.parse(read('package.json'));
  const v854 = 'node scripts/generate-v85-4-blog-post-shell-lock.mjs';
  const v86 = 'node scripts/generate-v86-structure-lock-hardening.mjs';
  const v87 = 'node scripts/generate-v87-live-deploy-check.mjs';
  const v88 = 'node scripts/generate-v88-indexing-readiness.mjs';
  const verify = 'node scripts/verify-v88-indexing-readiness.mjs';
  const build = String(pkg.scripts?.build || '').split('&&').map(s => s.trim()).filter(Boolean).filter(s => ![v854, v86, v87, v88].includes(s));
  build.push(v854, v86, v87, v88);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = build.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v88'] = v88;
  pkg.scripts['verify:v88'] = verify;
  fs.writeFileSync(abs('package.json'), JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}
updatePackage();

console.log(`[V88] indexing readiness generated. sitemap=${sortedUrls.length} newSeo=${newSeoPosts.length} sports=${sportsCheckUrls.length} guides=${searchGuideUrls.length} opsUpdated=${opsUpdated} canonicalFixed=${canonicalFixed.length}`);
