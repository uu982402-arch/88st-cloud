import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v87-live-deploy-check-20260525';
const MARKER = 'V87_LIVE_DEPLOY_CHECK_ACTIVE';
const DATA_PATH = 'assets/data/v87-live-deploy-check.json';
const CSS_HREF = '/assets/css/v87-live-deploy-check.css?v=static-v87-live-deploy-check-20260525';
const JS_SRC = '/assets/js/v87-live-deploy-check.js?v=static-v87-live-deploy-check-20260525';

const keyPages = [
  { label: '메인', url: '/', file: 'index.html', mustContain: ['V81_2_MAIN_TITLE_CLEAN_ACTIVE', 'V81_1_MAIN_MOTION_FIX_ACTIVE'], mustNotContain: ['RUST MOTION HUB', '88ST.CLOUD PLATFORM', '보증업체 보기</a>', '자동 상담 시작</a>'] },
  { label: '블로그', url: '/blog/', file: 'blog/index.html', mustContain: ['V72_1_BLOG_LOCK_ACTIVE', 'V85_3_LIVE_LOCK_ACTIVE'], mustNotContain: ['신규 유입 확장 콘텐츠', '토토·입플·보증업체·도구 연결 50개'] },
  { label: '도구', url: '/tools/', file: 'tools/index.html', mustContain: ['V73_TOOLS_DASHBOARD_ACTIVE'], mustNotContain: ['TOOLS HUB', '# 어두운 배경에서도 글자가 묻히지 않는 도구 허브'] },
  { label: '보증업체', url: '/guaranteed/', file: 'guaranteed/index.html', mustContain: ['V74_1_GUARANTEED_CARD_LAYOUT_ACTIVE'], mustNotContain: ['GUARANTEED CURATION', '# 보증업체를 광고가 아니라 확인 카드로 정리했습니다.'] },
  { label: '상담', url: '/consult/', file: 'consult/index.html', mustContain: ['data-v75-consult="active"'], mustNotContain: ['CONSULT FLOW', '상담 전 필요한 정보만 짧게 정리합니다', '업체 선택', '코드 확인', '텔레그램 이동'] },
  { label: '스포츠 체크', url: '/sports-check/', file: 'sports-check/index.html', mustContain: ['V79_RUST_LONGFORM_HUBS_ACTIVE'], mustNotContain: ['오늘 확인해야 할 것', '상담 전 먼저 확인할 것', '함께 확인할 글'] },
  { label: '검색 가이드', url: '/search-guides/', file: 'search-guides/index.html', mustContain: ['V79_RUST_LONGFORM_HUBS_ACTIVE'], mustNotContain: ['오늘 확인해야 할 것', '상담 전 먼저 확인할 것', '함께 확인할 글'] },
  { label: '운영센터', url: '/ops/', file: 'ops/index.html', mustContain: ['V80_OPS_CONTROL_CENTER_ACTIVE', 'noindex,nofollow,noarchive'], mustNotContain: [] },
  { label: '구 관리자', url: '/admin/', file: 'admin/index.html', mustContain: ['noindex,nofollow,noarchive'], mustNotContain: [] },
  { label: '사이트맵', url: '/sitemap.xml', file: 'sitemap.xml', mustContain: ['https://88st.cloud/'], mustNotContain: [] },
  { label: 'robots', url: '/robots.txt', file: 'robots.txt', mustContain: ['Sitemap: https://88st.cloud/sitemap.xml'], mustNotContain: [] }
];

const forbiddenGlobal = [
  'RUST MOTION HUB',
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개',
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  'CONSULT FLOW'
];

const seoPostTargetFile = 'assets/data/v85-4-blog-post-shell-targets.json';

function abs(file) { return path.join(ROOT, file); }
function exists(file) { return fs.existsSync(abs(file)); }
function read(file) { return fs.readFileSync(abs(file), 'utf8'); }
function write(file, body) {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), body, 'utf8');
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

function injectHeadTag(html, markerName, tag) {
  const escaped = markerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\s*<meta[^>]+name=[\"']${escaped}[\"'][^>]*>`, 'gi');
  let next = html.replace(re, '');
  if (/<\/head>/i.test(next)) return next.replace(/<\/head>/i, `  ${tag}\n</head>`);
  return next;
}

function injectCssJs(html) {
  let next = html;
  next = next.replace(/\s*<link[^>]+v87-live-deploy-check\.css[^>]*>/gi, '');
  next = next.replace(/\s*<script[^>]+v87-live-deploy-check\.js[^>]*><\/script>/gi, '');
  next = next.replace(/<\/head>/i, `  <link rel="stylesheet" href="${CSS_HREF}" data-v87-live-deploy="true">\n</head>`);
  next = next.replace(/<\/body>/i, `  <script src="${JS_SRC}" defer data-v87-live-deploy="true"></script>\n</body>`);
  return next;
}

function ensureOpsPanel() {
  const file = 'ops/index.html';
  if (!exists(file)) return false;
  let html = read(file);
  html = injectHeadTag(html, 'v87-live-deploy-check', `<meta name="v87-live-deploy-check" content="${MARKER}" data-v87-live-deploy="true">`);
  html = injectCssJs(html);
  html = html.replace(/<\/script><\/script>/gi, '</script>');

  if (!html.includes('href="#live-check"')) {
    html = html.replace(/(<a href="#deploy">배포검증<\/a>)/, `<a href="#live-check">라이브검증</a>\n        $1`);
  }

  html = html.replace(/<!-- V87 LIVE DEPLOY CHECK START -->[\s\S]*?<!-- V87 LIVE DEPLOY CHECK END -->\s*/g, '');
  const panel = `
      <!-- V87 LIVE DEPLOY CHECK START -->
      <section class="v87-live-panel" id="live-check" data-v87-live-deploy="${MARKER}" aria-label="라이브 배포 검증 자동화">
        <div class="v87-live-head">
          <div>
            <span class="v87-live-kicker">V87 LIVE DEPLOY CHECK</span>
            <h2>라이브 배포 검증 자동화</h2>
            <p>업로드 직후 핵심 URL, 금지 문구, noindex, sitemap, robots, GA4/구조 잠금 마커를 한 번에 점검합니다.</p>
          </div>
          <div class="v87-live-actions">
            <button type="button" class="v87-live-btn is-primary" data-v87-run-live-check>현재 도메인 점검</button>
            <button type="button" class="v87-live-btn" data-v87-copy-urls>URL 목록 복사</button>
          </div>
        </div>
        <div class="v87-live-metrics">
          <div><small>핵심 URL</small><strong>11</strong><span>페이지/시스템 경로</span></div>
          <div><small>금지 문구</small><strong>6</strong><span>재등장 즉시 실패</span></div>
          <div><small>신규 SEO 글</small><strong>50</strong><span>shell lock 유지</span></div>
          <div><small>검증 모드</small><strong>LOCAL + LIVE</strong><span>빌드/브라우저 점검</span></div>
        </div>
        <div class="v87-live-grid" data-v87-live-list></div>
        <pre class="v87-live-log" data-v87-live-log>대기 중입니다. 버튼을 누르면 라이브 HTML을 fetch 하여 상태를 표시합니다.</pre>
      </section>
      <!-- V87 LIVE DEPLOY CHECK END -->`;

  if (html.includes('<section class="v80-layout" id="vendors"')) {
    html = html.replace(/(<section class="v80-layout" id="vendors")/, `${panel}\n\n      $1`);
  } else if (html.includes('</main>')) {
    html = html.replace('</main>', `${panel}\n    </main>`);
  } else {
    html += panel;
  }

  write(file, html);
  return true;
}

function ensureMarkerOnKeyPages() {
  const pages = new Set(keyPages.map((item) => item.file).filter((file) => file.endsWith('.html')));
  if (exists(seoPostTargetFile)) {
    try {
      const data = JSON.parse(read(seoPostTargetFile));
      for (const target of data.targets || []) pages.add(target);
    } catch {}
  }

  let count = 0;
  for (const file of pages) {
    if (!exists(file)) continue;
    let html = read(file);
    const before = html;
    html = injectHeadTag(html, 'v87-live-deploy-check', `<meta name="v87-live-deploy-check" content="${MARKER}" data-v87-live-deploy="true">`);
    if (html !== before) {
      write(file, html);
      count += 1;
    }
  }
  return count;
}

function loadSeoTargets() {
  if (!exists(seoPostTargetFile)) return [];
  try {
    const data = JSON.parse(read(seoPostTargetFile));
    return Array.isArray(data.targets) ? data.targets : [];
  } catch {
    return [];
  }
}

function writeData() {
  const seoTargets = loadSeoTargets();
  const htmlCount = walk(ROOT).length;
  const data = {
    version: VERSION,
    marker: MARKER,
    generatedAt: new Date().toISOString(),
    baseUrl: 'https://88st.cloud',
    htmlCount,
    seoPostTargets: seoTargets.length,
    keyUrls: keyPages.map((item) => ({
      label: item.label,
      url: item.url,
      file: item.file,
      mustContain: item.mustContain,
      mustNotContain: item.mustNotContain
    })),
    forbiddenGlobal,
    liveCheckNotes: [
      'Cloudflare 캐시 제거 후 /ops/에서 현재 도메인 점검 버튼을 누르세요.',
      'sitemap.xml과 robots.txt가 200으로 열리는지 확인하세요.',
      '금지 문구가 하나라도 검출되면 해당 배포는 최신 구조가 아닙니다.'
    ]
  };
  write(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
  return data;
}

function updatePackage() {
  const pkg = JSON.parse(read('package.json'));
  const v854 = 'node scripts/generate-v85-4-blog-post-shell-lock.mjs';
  const v86 = 'node scripts/generate-v86-structure-lock-hardening.mjs';
  const generate = 'node scripts/generate-v87-live-deploy-check.mjs';
  const verify = 'node scripts/verify-v87-live-deploy-check.mjs';
  const build = String(pkg.scripts?.build || '')
    .split('&&')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== v854 && item !== v86 && item !== generate);
  build.push(v854, v86, generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = build.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v87'] = generate;
  pkg.scripts['verify:v87'] = verify;
  pkg.scripts['verify:live'] = 'V87_LIVE_CHECK=1 node scripts/verify-v87-live-deploy-check.mjs';
  fs.writeFileSync(abs('package.json'), JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

const opsUpdated = ensureOpsPanel();
const markedPages = ensureMarkerOnKeyPages();
const data = writeData();
updatePackage();

console.log(`[V87] live deploy check generated. html=${data.htmlCount} urls=${data.keyUrls.length} seoTargets=${data.seoPostTargets} opsUpdated=${opsUpdated} marked=${markedPages}`);
