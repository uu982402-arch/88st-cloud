import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V86_STRUCTURE_LOCK_HARDENING_ACTIVE';
const REPORT = 'assets/data/v86-structure-lock-report.json';

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
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

const failures = [];
function must(condition, message) {
  if (!condition) failures.push(message);
}

must(exists(REPORT), 'missing V86 structure lock report');
must(exists('scripts/generate-v86-structure-lock-hardening.mjs'), 'missing V86 generator');
must(exists('scripts/verify-v86-structure-lock-hardening.mjs'), 'missing V86 verifier');

const pkg = JSON.parse(read('package.json'));
must(String(pkg.scripts.build || '').trim().endsWith('node scripts/generate-v86-structure-lock-hardening.mjs'), 'V86 generator is not the final build step');
must(String(pkg.scripts.verify || '').includes('verify-v86-structure-lock-hardening.mjs'), 'package verify is not V86 verifier');

const report = exists(REPORT) ? JSON.parse(read(REPORT)) : { targetSeoPosts: 0 };
must(report.marker === MARKER, 'V86 report marker mismatch');
must(Number(report.targetSeoPosts) === 50, `expected 50 locked SEO posts, found ${report.targetSeoPosts}`);

const robots = read('robots.txt');
must(/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots), 'robots.txt missing sitemap line');

const keyChecks = [
  ['index.html', ['V81_2_MAIN_TITLE_CLEAN_ACTIVE', 'V81_1_MAIN_MOTION_FIX_ACTIVE', 'data-v811-blog-card=', 'data-v811-sports-card=', 'data-v811-guides-card=']],
  ['blog/index.html', ['V72_1_BLOG_LOCK_ACTIVE', 'V85_3_LIVE_LOCK_ACTIVE']],
  ['tools/index.html', ['V73_TOOLS_DASHBOARD_ACTIVE']],
  ['guaranteed/index.html', ['V74_1_GUARANTEED_CARD_LAYOUT_ACTIVE']],
  ['consult/index.html', ['data-v75-consult="active"']],
  ['sports-check/index.html', ['V79_RUST_LONGFORM_HUBS_ACTIVE']],
  ['search-guides/index.html', ['V79_RUST_LONGFORM_HUBS_ACTIVE']],
  ['ops/index.html', ['V80_OPS_CONTROL_CENTER_ACTIVE']],
  ['admin/index.html', ['noindex,nofollow,noarchive']]
];

for (const [file, needles] of keyChecks) {
  must(exists(file), `missing key page ${file}`);
  const html = exists(file) ? read(file) : '';
  for (const needle of needles) must(html.includes(needle), `${file} missing ${needle}`);
  must(html.includes(MARKER), `${file} missing V86 marker`);
}

const index = read('index.html');
const indexBanned = ['RUST MOTION HUB', '88ST.CLOUD PLATFORM', '보증업체 보기</a>', '자동 상담 시작</a>'];
for (const banned of indexBanned) must(!index.includes(banned), `index.html contains removed title/CTA: ${banned}`);
must((index.match(/data-v811-blog-card=/g) || []).length === 15, 'index blog card slot count is not 15');
must((index.match(/data-v811-sports-card=/g) || []).length === 5, 'index sports card slot count is not 5');
must((index.match(/data-v811-guides-card=/g) || []).length === 5, 'index guide card slot count is not 5');
must(index.includes('id="v81-1-blog-pool"'), 'index missing full blog pool JSON');
must(index.includes('id="v81-1-sports-pool"'), 'index missing sports pool JSON');
must(index.includes('id="v81-1-guides-pool"'), 'index missing search guides pool JSON');

const blogIndex = read('blog/index.html');
for (const banned of ['신규 유입 확장 콘텐츠', '토토·입플·보증업체·도구 연결 50개']) {
  must(!blogIndex.includes(banned), `blog/index.html contains forbidden section text: ${banned}`);
}
must(/총\s*503개|503개/.test(blogIndex), 'blog/index.html does not show/retain 503 total post count');

const targetFile = 'assets/data/v85-4-blog-post-shell-targets.json';
must(exists(targetFile), 'missing V85-4 SEO target list');
const targets = exists(targetFile) ? JSON.parse(read(targetFile)).targets || [] : [];
must(targets.length === 50, `expected 50 V85-4 targets, found ${targets.length}`);
const postForbidden = ['페이지 하단의 내부 링크', '관련 글과 다음 확인 루트', 'class="rust-header"', 'class="rust-nav"', 'class="rust-mobile-nav"'];
for (const rel of targets) {
  must(exists(rel), `missing SEO post ${rel}`);
  if (!exists(rel)) continue;
  const html = read(rel);
  for (const needle of ['V85_4_BLOG_POST_SHELL_LOCK_ACTIVE', 'class="rust-global-header"', 'class="rust-header-inner"', 'class="rust-bottom-nav"', MARKER]) {
    must(html.includes(needle), `${rel} missing ${needle}`);
  }
  for (const banned of postForbidden) {
    must(!html.includes(banned), `${rel} contains forbidden shell/tail text ${banned}`);
  }
}

const ops = read('ops/index.html');
const admin = read('admin/index.html');
must(/noindex,nofollow,noarchive/i.test(ops), 'ops missing noindex');
must(/noindex,nofollow,noarchive/i.test(admin), 'admin missing noindex');

for (const file of walk(ROOT)) {
  const relPath = path.relative(ROOT, file).replaceAll(path.sep, '/');
  const html = fs.readFileSync(file, 'utf8');
  must(!/<body\b[^>]*\sclass=["'][^"']*["'][^>]*\sclass=["']/i.test(html), `${relPath} has duplicate body class attributes`);
}

if (failures.length) {
  console.error('[V86] verify failed');
  for (const failure of failures.slice(0, 120)) console.error(' - ' + failure);
  if (failures.length > 120) console.error(`... ${failures.length - 120} more`);
  process.exit(1);
}

console.log(`[V86] verify ok. html=${walk(ROOT).length} lockedSeoPosts=${targets.length} marker=${MARKER}`);
