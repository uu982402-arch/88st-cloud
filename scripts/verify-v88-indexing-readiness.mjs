import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://88st.cloud';
const MARKER = 'V88_INDEXING_READINESS_ACTIVE';
const DATA_PATH = 'assets/data/v88-indexing-readiness.json';
const failures = [];
const warnings = [];

function abs(file) { return path.join(ROOT, file); }
function exists(file) { return fs.existsSync(abs(file)); }
function read(file) { return fs.readFileSync(abs(file), 'utf8'); }
function must(ok, msg) { if (!ok) failures.push(msg); }
function warn(ok, msg) { if (!ok) warnings.push(msg); }
function urlToFile(url) {
  const u = new URL(url);
  let p = decodeURIComponent(u.pathname);
  if (p === '/') return 'index.html';
  if (p.endsWith('/')) return p.slice(1) + 'index.html';
  return p.slice(1);
}
function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
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

must(exists('scripts/generate-v88-indexing-readiness.mjs'), 'missing V88 generator');
must(exists('scripts/verify-v88-indexing-readiness.mjs'), 'missing V88 verifier');
must(exists(DATA_PATH), 'missing V88 indexing data');
must(exists('assets/css/v88-indexing-readiness.css'), 'missing V88 CSS');
must(exists('assets/js/v88-indexing-readiness.js'), 'missing V88 JS');

const pkg = exists('package.json') ? JSON.parse(read('package.json')) : { scripts: {} };
must(String(pkg.scripts?.build || '').trim().endsWith('node scripts/generate-v88-indexing-readiness.mjs'), 'V88 generator is not the final build step');
must(String(pkg.scripts?.build || '').includes('generate-v87-live-deploy-check.mjs'), 'V87 live check generator missing before V88');
must(String(pkg.scripts?.verify || '').includes('verify-v88-indexing-readiness.mjs'), 'package verify is not V88 verifier');

const data = exists(DATA_PATH) ? JSON.parse(read(DATA_PATH)) : {};
must(data.marker === MARKER, 'V88 marker mismatch');
must(data.sitemap?.count > 0, 'V88 sitemap count missing');
must((data.newSeoPosts || []).length === 50, `expected 50 new SEO posts, found ${(data.newSeoPosts || []).length}`);
must((data.sportsCheckUrls || []).length >= 10, 'sports-check detail URL list too small');
must((data.searchGuideUrls || []).length >= 30, 'search-guides detail URL list too small');
must((data.indexingPriorityUrls || []).length >= 90, 'indexing priority URL list too small');

const sitemapTxt = exists('sitemap.txt') ? read('sitemap.txt').split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];
const sitemapXml = exists('sitemap.xml') ? read('sitemap.xml') : '';
must(sitemapTxt.length === data.sitemap.count, `sitemap.txt count ${sitemapTxt.length} != data count ${data.sitemap.count}`);
must(sitemapXml.includes('<changefreq>weekly</changefreq>'), 'sitemap.xml missing changefreq');
must(sitemapXml.includes('<priority>'), 'sitemap.xml missing priority');
for (const url of ['https://88st.cloud/', 'https://88st.cloud/blog/', 'https://88st.cloud/tools/', 'https://88st.cloud/guaranteed/', 'https://88st.cloud/consult/', 'https://88st.cloud/sports-check/', 'https://88st.cloud/search-guides/']) {
  must(sitemapTxt.includes(url), `sitemap.txt missing core url ${url}`);
  must(sitemapXml.includes(`<loc>${url}</loc>`), `sitemap.xml missing core url ${url}`);
}
for (const bad of ['/admin/', '/ops/', '/api/']) {
  must(!sitemapTxt.some(url => new URL(url).pathname.startsWith(bad)), `sitemap.txt contains blocked prefix ${bad}`);
  must(!sitemapXml.includes(`https://88st.cloud${bad}`), `sitemap.xml contains blocked prefix ${bad}`);
}

const sorted = [...sitemapTxt].sort((a, b) => a.localeCompare(b, 'ko'));
warn(JSON.stringify(sitemapTxt.slice(7)) === JSON.stringify(sorted.filter(url => !['https://88st.cloud/','https://88st.cloud/blog/','https://88st.cloud/tools/','https://88st.cloud/guaranteed/','https://88st.cloud/consult/','https://88st.cloud/sports-check/','https://88st.cloud/search-guides/'].includes(url))), 'sitemap non-core segment has custom priority ordering');

for (const url of sitemapTxt) {
  const file = urlToFile(url);
  must(exists(file), `sitemap URL has no matching file: ${url} -> ${file}`);
  if (exists(file) && file.endsWith('.html')) {
    const html = read(file);
    must(!hasNoindex(html), `sitemap URL points to noindex page: ${url}`);
    const canonical = url;
    must(html.includes(`rel="canonical" href="${canonical}"`) || html.includes(`rel="canonical" href='${canonical}'`), `missing or mismatched canonical for ${url}`);
  }
}

for (const post of data.newSeoPosts || []) {
  must(exists(post.file), `missing new SEO post ${post.file}`);
  if (exists(post.file)) {
    const html = read(post.file);
    must(html.includes('V85_4_BLOG_POST_SHELL_LOCK_ACTIVE'), `${post.file} missing V85-4 shell marker`);
    must(html.includes(MARKER), `${post.file} missing V88 marker`);
    must(!html.includes('페이지 하단의 내부 링크'), `${post.file} contains forbidden internal link sentence`);
  }
}

const robots = exists('robots.txt') ? read('robots.txt') : '';
must(/Disallow:\s*\/admin\//i.test(robots), 'robots missing /admin disallow');
must(/Disallow:\s*\/ops\//i.test(robots), 'robots missing /ops disallow');
must(/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots), 'robots missing sitemap line');

const ops = exists('ops/index.html') ? read('ops/index.html') : '';
must(ops.includes('V88 INDEXING READINESS'), 'ops missing V88 indexing panel');
must(ops.includes('data-v88-copy-indexing'), 'ops missing V88 copy indexing button');
must(ops.includes('/assets/css/v88-indexing-readiness.css'), 'ops missing V88 CSS link');
must(ops.includes('/assets/js/v88-indexing-readiness.js'), 'ops missing V88 JS script');
must(/noindex,nofollow,noarchive/i.test(ops), 'ops noindex missing');

const admin = exists('admin/index.html') ? read('admin/index.html') : '';
must(/noindex,nofollow,noarchive/i.test(admin), 'admin noindex missing');

const index = exists('index.html') ? read('index.html') : '';
for (const banned of ['RUST MOTION HUB', '88ST.CLOUD PLATFORM', '보증업체 보기</a>', '자동 상담 시작</a>']) {
  must(!index.includes(banned), `index contains forbidden title/CTA ${banned}`);
}
must((index.match(/data-v811-blog-card=/g) || []).length === 15, 'index blog slot count changed from 15');
must((index.match(/data-v811-sports-card=/g) || []).length === 5, 'index sports slot count changed from 5');
must((index.match(/data-v811-guides-card=/g) || []).length === 5, 'index guide slot count changed from 5');

const blog = exists('blog/index.html') ? read('blog/index.html') : '';
for (const banned of ['신규 유입 확장 콘텐츠', '토토·입플·보증업체·도구 연결 50개']) must(!blog.includes(banned), `blog/index.html contains ${banned}`);

if (warnings.length) for (const w of warnings) console.warn('[V88 warn] ' + w);
if (failures.length) {
  console.error('[V88] verify failed');
  for (const failure of failures.slice(0, 200)) console.error(' - ' + failure);
  if (failures.length > 200) console.error(`... ${failures.length - 200} more`);
  process.exit(1);
}
console.log(`[V88] verify ok. html=${walk(ROOT).length} sitemap=${sitemapTxt.length} newSeo=${(data.newSeoPosts || []).length} priority=${(data.indexingPriorityUrls || []).length} marker=${MARKER}`);
