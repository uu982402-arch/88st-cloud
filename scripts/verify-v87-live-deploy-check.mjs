import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V87_LIVE_DEPLOY_CHECK_ACTIVE';
const DATA = 'assets/data/v87-live-deploy-check.json';
const failures = [];
const warnings = [];

function abs(file) { return path.join(ROOT, file); }
function exists(file) { return fs.existsSync(abs(file)); }
function read(file) { return fs.readFileSync(abs(file), 'utf8'); }
function must(condition, message) { if (!condition) failures.push(message); }
function warn(condition, message) { if (!condition) warnings.push(message); }

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

must(exists('scripts/generate-v87-live-deploy-check.mjs'), 'missing V87 generator');
must(exists('scripts/verify-v87-live-deploy-check.mjs'), 'missing V87 verifier');
must(exists(DATA), 'missing V87 live check data');
must(exists('assets/css/v87-live-deploy-check.css'), 'missing V87 CSS');
must(exists('assets/js/v87-live-deploy-check.js'), 'missing V87 JS');

const pkg = exists('package.json') ? JSON.parse(read('package.json')) : { scripts: {} };
must(String(pkg.scripts?.build || '').trim().endsWith('node scripts/generate-v87-live-deploy-check.mjs'), 'V87 generator is not the final build step');
must(String(pkg.scripts?.verify || '').includes('verify-v87-live-deploy-check.mjs'), 'package verify is not V87 verifier');

const data = exists(DATA) ? JSON.parse(read(DATA)) : { keyUrls: [], forbiddenGlobal: [] };
must(data.marker === MARKER, 'V87 data marker mismatch');
must(Array.isArray(data.keyUrls) && data.keyUrls.length >= 10, 'V87 key URL list is too small');
must(Array.isArray(data.forbiddenGlobal) && data.forbiddenGlobal.length >= 5, 'V87 forbidden list is too small');

for (const item of data.keyUrls || []) {
  const file = item.file;
  must(exists(file), `missing key file ${file}`);
  if (!exists(file)) continue;
  const body = read(file);
  if (file.endsWith('.html')) must(body.includes(MARKER), `${file} missing V87 marker`);
  for (const needle of item.mustContain || []) must(body.includes(needle), `${file} missing required text/marker: ${needle}`);
  for (const banned of item.mustNotContain || []) must(!body.includes(banned), `${file} contains forbidden live text: ${banned}`);
}

const ops = exists('ops/index.html') ? read('ops/index.html') : '';
must(ops.includes('V87 LIVE DEPLOY CHECK'), 'ops missing V87 live check panel');
must(ops.includes('data-v87-run-live-check'), 'ops missing live check run button');
must(ops.includes('/assets/css/v87-live-deploy-check.css'), 'ops missing V87 CSS link');
must(ops.includes('/assets/js/v87-live-deploy-check.js'), 'ops missing V87 JS script');
must(/noindex,nofollow,noarchive/i.test(ops), 'ops noindex missing');

const admin = exists('admin/index.html') ? read('admin/index.html') : '';
must(/noindex,nofollow,noarchive/i.test(admin), 'admin noindex missing');

const robots = exists('robots.txt') ? read('robots.txt') : '';
must(/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots), 'robots.txt missing sitemap line');

const sitemap = exists('sitemap.xml') ? read('sitemap.xml') : '';
for (const url of ['https://88st.cloud/', 'https://88st.cloud/blog/', 'https://88st.cloud/tools/', 'https://88st.cloud/guaranteed/', 'https://88st.cloud/consult/']) {
  must(sitemap.includes(url), `sitemap missing ${url}`);
}

const index = exists('index.html') ? read('index.html') : '';
for (const banned of ['RUST MOTION HUB', '88ST.CLOUD PLATFORM', '보증업체 보기</a>', '자동 상담 시작</a>']) {
  must(!index.includes(banned), `index contains forbidden title/CTA ${banned}`);
}
must((index.match(/data-v811-blog-card=/g) || []).length === 15, 'index blog slot count changed from 15');
must((index.match(/data-v811-sports-card=/g) || []).length === 5, 'index sports slot count changed from 5');
must((index.match(/data-v811-guides-card=/g) || []).length === 5, 'index guide slot count changed from 5');

const blog = exists('blog/index.html') ? read('blog/index.html') : '';
for (const banned of ['신규 유입 확장 콘텐츠', '토토·입플·보증업체·도구 연결 50개']) {
  must(!blog.includes(banned), `blog/index.html contains forbidden section ${banned}`);
}

const targetFile = 'assets/data/v85-4-blog-post-shell-targets.json';
const targets = exists(targetFile) ? JSON.parse(read(targetFile)).targets || [] : [];
must(targets.length === 50, `expected 50 locked SEO posts, found ${targets.length}`);
for (const file of targets) {
  must(exists(file), `missing locked SEO post ${file}`);
  if (!exists(file)) continue;
  const html = read(file);
  for (const needle of ['V85_4_BLOG_POST_SHELL_LOCK_ACTIVE', 'class="rust-global-header"', 'class="rust-bottom-nav"', MARKER]) {
    must(html.includes(needle), `${file} missing ${needle}`);
  }
  for (const banned of ['페이지 하단의 내부 링크', '관련 글과 다음 확인 루트', 'class="rust-header"', 'class="rust-nav"', 'class="rust-mobile-nav"']) {
    must(!html.includes(banned), `${file} contains forbidden shell/tail ${banned}`);
  }
}

for (const file of walk(ROOT)) {
  const body = fs.readFileSync(file, 'utf8');
  const relPath = rel(file);
  must(!/<body\b[^>]*\sclass=["'][^"']*["'][^>]*\sclass=["']/i.test(body), `${relPath} has duplicate body class attributes`);
}

async function runLiveCheck() {
  const base = String(process.env.V87_LIVE_BASE_URL || data.baseUrl || 'https://88st.cloud').replace(/\/$/, '');
  const results = [];
  for (const item of data.keyUrls || []) {
    const url = base + item.url;
    try {
      const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
      const text = await res.text();
      const missing = (item.mustContain || []).filter((needle) => !text.includes(needle));
      const forbidden = (item.mustNotContain || []).filter((needle) => text.includes(needle));
      results.push({ url, status: res.status, ok: res.ok && missing.length === 0 && forbidden.length === 0, missing, forbidden });
    } catch (error) {
      results.push({ url, status: 0, ok: false, error: error.message });
    }
  }
  const failed = results.filter((item) => !item.ok);
  if (failed.length) {
    for (const item of failed) failures.push(`live check failed ${item.url} status=${item.status} missing=${(item.missing || []).join('|')} forbidden=${(item.forbidden || []).join('|')} error=${item.error || ''}`);
  }
  console.log(`[V87] live check complete base=${base} ok=${results.length - failed.length}/${results.length}`);
}

if (process.env.V87_LIVE_CHECK === '1') {
  await runLiveCheck();
} else {
  warn(false, 'live network check skipped; run `npm run verify:live` after deploy if needed');
}

if (warnings.length) {
  for (const message of warnings) console.warn('[V87 warn] ' + message);
}
if (failures.length) {
  console.error('[V87] verify failed');
  for (const failure of failures.slice(0, 160)) console.error(' - ' + failure);
  if (failures.length > 160) console.error(`... ${failures.length - 160} more`);
  process.exit(1);
}
console.log(`[V87] verify ok. html=${walk(ROOT).length} urls=${data.keyUrls?.length || 0} seoTargets=${targets.length} marker=${MARKER}`);
