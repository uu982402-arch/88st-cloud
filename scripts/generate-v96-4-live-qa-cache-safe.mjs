import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v96-4-live-qa-cache-safe-20260526';
const BUILD_ID = 'V96.4-LIVE-QA-CACHE-SAFE-20260526';
const V963_LOCK = 'static-v96-3-mobile-safe-layout-20260526-v96-4-cache-safe';
const cssHref = `/assets/css/v96-4-live-qa-cache-safe.css?v=${VERSION}`;
const jsSrc = `/assets/js/v96-4-live-qa-cache-safe.js?v=${VERSION}`;

const criticalPaths = [
  '/',
  '/blog/',
  '/tools/',
  '/guaranteed/',
  '/guaranteed/sk-holdings/',
  '/guaranteed/udt/',
  '/guaranteed/queenbee/',
  '/guaranteed/ddangkong/',
  '/guaranteed/anybet/',
  '/guaranteed/zakum/',
  '/consult/',
  '/sports-check/',
  '/search-guides/',
  '/ops/'
];

const vendorImages = [
  '/assets/img/guaranteed/cards/sk-holdings.webp',
  '/assets/img/guaranteed/cards/zakum.webp',
  '/assets/img/guaranteed/cards/udt-bet.webp',
  '/assets/img/guaranteed/cards/queenbee.webp',
  '/assets/img/guaranteed/cards/ddangkong-bet.webp',
  '/assets/img/guaranteed/cards/anybet.webp'
];

function ensureDir(filePath){ fs.mkdirSync(path.dirname(filePath), { recursive: true }); }
function read(file){ return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
function write(file, content){ ensureDir(file); fs.writeFileSync(file, content); }
function walk(dir){
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git','node_modules','.wrangler'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
function rel(file){ return path.relative(ROOT, file).replaceAll('\\\\','/'); }

const css = `/* V96.4 LIVE QA / CACHE SAFE PATCH
 * 목적: V96.3 모바일 안정화 이후, 라이브/캐시/브라우저별 잔여 충돌을 잠근다.
 * 원칙: 기존 라우팅·기능·카드 구조를 유지하고 삭제 없이 추가 보강만 수행한다.
 */
:root{
  --v96-4-build:'${BUILD_ID}';
  --v96-4-page-max:100%;
  --v96-4-safe-bottom:env(safe-area-inset-bottom,0px);
  --v96-4-nav-bottom:calc(12px + var(--v96-4-safe-bottom));
  --v96-4-fab-bottom:calc(98px + var(--v96-4-safe-bottom));
}
html.v96-4-cache-safe,
html.v96-4-cache-safe body{
  width:100%;
  max-width:100%;
  overflow-x:hidden!important;
}
body.v96-4-live-qa-cache-safe{
  min-width:0!important;
  overflow-x:hidden!important;
  background:#06090f;
  touch-action:manipulation;
}
body.v96-4-live-qa-cache-safe *,
body.v96-4-live-qa-cache-safe *::before,
body.v96-4-live-qa-cache-safe *::after{box-sizing:border-box}
body.v96-4-live-qa-cache-safe img{max-width:100%;height:auto}

/* 캐시 혼재로 구 CSS가 먼저 먹어도 최종 폭은 V96.4가 이긴다. */
body.v96-4-live-qa-cache-safe :where(.v71-page,.v71-main,.v71-shell,.v72-shell,.v73-shell,.v74-shell,.v74-1-grid,.v75-shell,.v79-shell,.v80-shell,.v96-2-shell,.rust-header-inner,.rust-mobile-menu,main,section,article,header,footer){
  max-width:100%!important;
  min-width:0!important;
}
body.v96-4-live-qa-cache-safe :where(.v71-page,.v74-page,.v96-2-detail,main){
  overflow-x:hidden;
}
@supports (overflow:clip){body.v96-4-live-qa-cache-safe :where(.v71-page,.v74-page,.v96-2-detail,main){overflow-x:clip}}

/* Android Chrome / Samsung Internet 주소창 리사이즈 후 오른쪽 빈 면 방지 */
html.v96-4-chrome-web body.v96-4-live-qa-cache-safe{contain:none}
html.v96-4-chrome-web body.v96-4-live-qa-cache-safe :where([style*="100vw"]){max-width:100%!important}

/* 광고/보증업체 슬라이더만 가로 이동 허용 */
body.v96-4-live-qa-cache-safe :where(.v71-partner-carousel,.guaranteed-slider,.vendor-strip){
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  overscroll-behavior-x:contain;
  -webkit-overflow-scrolling:touch;
  scroll-snap-type:x proximity;
}
body.v96-4-live-qa-cache-safe :where(.v71-partner-card,.v74-1-vendor-card,.vendor-card,.guaranteed-card){
  min-width:0!important;
  max-width:100%!important;
  scroll-snap-align:start;
}
body.v96-4-live-qa-cache-safe :where(.v71-partner-card img,.v74-1-image-link img,.v54-visual-card img,.v96-2-art img,.vendor-card img,.guaranteed-card img,.vendor-hero img){
  object-fit:contain!important;
  object-position:center!important;
  transform:none!important;
}

/* 블로그/도구/허브 카드 폭 재계산 잠금 */
body.v96-4-live-qa-cache-safe :where(.v71-blog-grid,.v72-blog-grid,.v73-tool-grid,.v74-vendor-grid,.v96-2-benefits,.v96-2-info-grid,.home-blog-grid,.blog-grid,.v79-grid){
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
}
body.v96-4-live-qa-cache-safe :where(.v71-blog-card,.v72-blog-card,.v73-tool-card,.v74-vendor-card,.v74-1-vendor-card,.v96-2-info-card,.v79-card,.blog-card){
  min-width:0!important;
  max-width:100%!important;
  overflow-wrap:anywhere;
}
body.v96-4-live-qa-cache-safe :where(table,pre,code){max-width:100%}
body.v96-4-live-qa-cache-safe :where(pre,.table-wrap,.v96-2-table-wrap){overflow-x:auto;-webkit-overflow-scrolling:touch}

/* 하단바/FAB는 뷰포트 기준 고정. content wrapper 폭에 끌려가지 않게 한다. */
@media (max-width:760px){
  body.v96-4-live-qa-cache-safe{padding-bottom:calc(106px + env(safe-area-inset-bottom,0px))!important}
  body.v96-4-live-qa-cache-safe :where(.rust-bottom-nav,.v71-mobile-nav,.v74-mobile-nav,.v79-mobile-nav,.mobile-bottom-nav){
    position:fixed!important;
    left:max(12px,env(safe-area-inset-left,0px))!important;
    right:max(12px,env(safe-area-inset-right,0px))!important;
    bottom:var(--v96-4-nav-bottom)!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    transform:none!important;
    z-index:220!important;
  }
  body.v96-4-live-qa-cache-safe :where(.v71-fab,.v74-fab,.floating-action,.rust-floating-action){
    position:fixed!important;
    right:max(16px,env(safe-area-inset-right,0px))!important;
    bottom:var(--v96-4-fab-bottom)!important;
    z-index:221!important;
  }
  body.v96-4-live-qa-cache-safe :where(.v71-shell,.v72-shell,.v73-shell,.v74-shell,.v75-shell,.v79-shell,.v80-shell,.v96-2-shell,.rust-header-inner,.rust-mobile-menu){
    width:calc(100% - 28px)!important;
    max-width:100%!important;
    margin-left:auto!important;
    margin-right:auto!important;
  }
}
@media (max-width:360px){
  body.v96-4-live-qa-cache-safe :where(.v71-blog-grid,.home-blog-grid,.blog-grid,.v74-vendor-grid,.v74-shell.v74-1-grid){grid-template-columns:1fr!important}
}

/* JS가 실제 overflow 후보를 감지하면 해당 요소만 안전 잠금 */
body.v96-4-live-qa-cache-safe [data-v964-overflow-guard="true"]{
  max-width:100%!important;
  min-width:0!important;
  overflow-x:hidden!important;
}
`;

const js = `/* V96.4 LIVE QA / CACHE SAFE PATCH
 * 라이브 배포 후 캐시 혼재, Android Chrome/Samsung Internet viewport 재계산,
 * 하단바/FAB 겹침, 페이지 전체 overflow를 런타임에서 감지한다.
 */
(() => {
  const BUILD = '${BUILD_ID}';
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;
  root.classList.add('v96-4-cache-safe');
  body.classList.add('v96-4-live-qa-cache-safe');
  body.dataset.v964LiveQaCacheSafe = 'active';
  window.__RUST_V96_4_BUILD__ = BUILD;

  const ua = navigator.userAgent || '';
  if (/Chrome|CriOS|SamsungBrowser|EdgA|EdgiOS/i.test(ua)) root.classList.add('v96-4-chrome-web');
  if (/iPhone|iPad|iPod/i.test(ua)) root.classList.add('v96-4-ios-web');

  const guardedSelectors = [
    '.v71-page','.v71-main','.v71-shell','.v72-shell','.v73-shell','.v74-shell',
    '.v74-1-grid','.v75-shell','.v79-shell','.v80-shell','.v96-2-shell',
    '.rust-header-inner','.rust-mobile-menu','.v71-blog-grid','.v79-grid','.v74-vendor-grid'
  ];
  const allowedHorizontal = '.v71-partner-carousel,.guaranteed-slider,.vendor-strip,.table-wrap,.v96-2-table-wrap,pre';

  const state = { build: BUILD, overflowCandidates: [], lastViewportWidth: 0, checkedAt: null };
  window.__RUST_LIVE_QA__ = state;

  function viewportWidth(){
    const vv = window.visualViewport?.width || 0;
    return Math.floor(Math.max(root.clientWidth || 0, window.innerWidth || 0, vv));
  }
  function apply(){
    const vw = viewportWidth();
    state.lastViewportWidth = vw;
    state.checkedAt = new Date().toISOString();
    root.style.setProperty('--v96-4-js-vw', String(vw) + 'px');
    root.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';
    state.overflowCandidates = [];

    document.querySelectorAll(guardedSelectors.join(',')).forEach((el) => {
      el.style.minWidth = '0';
      el.style.maxWidth = '100%';
      if (!el.matches(allowedHorizontal) && el.scrollWidth > vw + 2) {
        el.dataset.v964OverflowGuard = 'true';
        state.overflowCandidates.push({ selector: el.className || el.tagName, scrollWidth: el.scrollWidth, vw });
      }
    });

    document.querySelectorAll('.v71-partner-carousel,.guaranteed-slider,.vendor-strip').forEach((el) => {
      el.style.overflowX = 'auto';
      el.style.overscrollBehaviorX = 'contain';
    });
  }

  let raf = 0;
  function schedule(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  }
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(schedule, 140), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
    window.visualViewport.addEventListener('scroll', schedule, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  schedule();
})();
`;

const data = {
  version: BUILD_ID,
  generatedAt: new Date().toISOString(),
  scope: 'V96.4 LIVE QA / CACHE SAFE PATCH',
  principles: [
    '기존 구조/라우팅/기능 유지',
    '삭제 없이 캐시·라이브 점검 보강',
    'HTML은 no-cache, fingerprint query asset은 long cache',
    '모바일 Chrome/Samsung Internet/iPhone Safari 폭 안정성 유지'
  ],
  criticalPaths,
  vendorImages,
  assets: [cssHref, jsSrc, `/assets/css/v96-3-mobile-safe-layout.css?v=${V963_LOCK}`, `/assets/js/v96-3-mobile-safe-layout.js?v=${V963_LOCK}`]
};

write(path.join(ROOT, 'assets/css/v96-4-live-qa-cache-safe.css'), css);
write(path.join(ROOT, 'assets/js/v96-4-live-qa-cache-safe.js'), js);
write(path.join(ROOT, 'assets/data/v96-4-live-qa-cache-safe.json'), JSON.stringify(data, null, 2));

function patchViewport(html){
  if (/<meta name="viewport"[^>]*>/i.test(html)) {
    return html.replace(/<meta name="viewport"[^>]*>/i, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">');
  }
  return html.replace(/<head[^>]*>/i, (m) => `${m}\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`);
}
function patchHead(html){
  html = html
    .replace(/\n?\s*<meta name="v96-4-live-qa-cache-safe"[^>]*>/g, '')
    .replace(/\n?\s*<meta name="rust-build-version"[^>]*>/g, '')
    .replace(/\n?\s*<link rel="stylesheet" href="\/assets\/css\/v96-4-live-qa-cache-safe\.css\?v=[^"]+"[^>]*>/g, '')
    .replace(/\?v=static-v96-3-mobile-safe-layout-20260526(?:-v96-4-cache-safe)?/g, `?v=${V963_LOCK}`);
  const headBlock = `\n  <meta name="v96-4-live-qa-cache-safe" content="V96_4_LIVE_QA_CACHE_SAFE_ACTIVE">\n  <meta name="rust-build-version" content="${BUILD_ID}">\n  <link rel="stylesheet" href="${cssHref}" data-v96-4-live-qa-cache-safe="true">`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${headBlock}\n</head>`);
  return html;
}
function patchBody(html){
  html = html
    .replace(/\n?\s*<script src="\/assets\/js\/v96-4-live-qa-cache-safe\.js\?v=[^"]+"[^>]*><\/script>/g, '')
    .replace(/\n?\s*<script defer src="\/assets\/js\/v96-4-live-qa-cache-safe\.js\?v=[^"]+"[^>]*><\/script>/g, '');
  html = html.replace(/<body([^>]*)>/i, (m, attrs) => {
    let next = attrs || '';
    if (/class="([^"]*)"/i.test(next)) {
      next = next.replace(/class="([^"]*)"/i, (_, cls) => {
        const parts = new Set(cls.split(/\s+/).filter(Boolean));
        parts.add('v96-4-live-qa-cache-safe');
        return `class="${Array.from(parts).join(' ')}"`;
      });
    } else {
      next += ' class="v96-4-live-qa-cache-safe"';
    }
    if (/data-v96-4-live-qa-cache-safe=/i.test(next)) {
      next = next.replace(/data-v96-4-live-qa-cache-safe="[^"]*"/i, 'data-v96-4-live-qa-cache-safe="active"');
    } else {
      next += ' data-v96-4-live-qa-cache-safe="active"';
    }
    return `<body${next}>`;
  });
  const script = `\n  <script src="${jsSrc}" defer data-v96-4-live-qa-cache-safe="true"></script>`;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${script}\n</body>`);
  return `${html}${script}\n`;
}
function patchHtmlFile(file){
  let html = read(file);
  html = patchViewport(html);
  html = patchHead(html);
  html = patchBody(html);
  write(file, html);
}

const htmlFiles = walk(ROOT).filter((f) => f.endsWith('.html'));
for (const file of htmlFiles) patchHtmlFile(file);

// sitemap lastmod for live QA touched core routes. Do not add ops to sitemap because ops is noindex.
function patchSitemap(file){
  if (!fs.existsSync(file)) return;
  let xml = read(file);
  for (const route of criticalPaths.filter((p) => p !== '/ops/')) {
    const loc = `https://88st.cloud${route}`;
    const re = new RegExp(`(<url><loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc><lastmod>)([^<]+)(<\\/lastmod>)`, 'g');
    xml = xml.replace(re, `$12026-05-26$3`);
  }
  write(file, xml);
}
patchSitemap(path.join(ROOT, 'sitemap.xml'));
patchSitemap(path.join(ROOT, 'serverless/sitemap.xml'));

// Valid Cloudflare Pages _headers. HTML is revalidated; fingerprinted static assets stay immutable.
const headers = `/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin-allow-popups
  Strict-Transport-Security: max-age=15552000
  X-Permitted-Cross-Domain-Policies: none
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.google-analytics.com https://stats.g.doubleclick.net https://static.cloudflareinsights.com; connect-src 'self' https: https://*.google-analytics.com https://stats.g.doubleclick.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/img/*
  Cache-Control: public, max-age=0, must-revalidate

/build.txt
  Cache-Control: no-store, max-age=0

/assets/js/build.ver.js
  Cache-Control: no-store, max-age=0

/api/*
  X-Robots-Tag: noindex, nofollow, noarchive

/admin/*
  X-Robots-Tag: noindex, nofollow, noarchive

/ops/*
  X-Robots-Tag: noindex, nofollow, noarchive
`;
write(path.join(ROOT, '_headers'), headers);

const buildVer = `window.__BUILD_VER__ = "${VERSION}";\nwindow.__BUILD_TIME__ = "2026-05-26T00:00:00.000Z";\nwindow.__CACHE_BUSTER__ = "20260526-v96-4";\nwindow.__WORKER_MODE__ = "safe";\nwindow.__CONSULT_BOT__ = "@TRS999_bot";\nwindow.__RUST_LIVE_QA__ = window.__RUST_LIVE_QA__ || {};\nwindow.__RUST_LIVE_QA__.expectedBuild = "${BUILD_ID}";\n`;
write(path.join(ROOT, 'assets/js/build.ver.js'), buildVer);
write(path.join(ROOT, 'build.txt'), `build=2026-05-26T00:00:00.000Z\nversion=${VERSION}\ncache=20260526-v96-4\nhtml=${htmlFiles.length}\nsitemap=${read(path.join(ROOT, 'sitemap.xml')).split('<url>').length - 1}\nworker=safe-mode\nconsultBot=@TRS999_bot\n`);

// package scripts: append generator after V96.3 and make verify point to V96.4.
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(read(pkgPath));
if (pkg.scripts?.build && !pkg.scripts.build.includes('generate-v96-4-live-qa-cache-safe.mjs')) {
  pkg.scripts.build = `${pkg.scripts.build} && node scripts/generate-v96-4-live-qa-cache-safe.mjs`;
}
pkg.scripts.verify = 'node scripts/verify-v96-4-live-qa-cache-safe.mjs';
pkg.scripts['quality:v96-4'] = 'node scripts/generate-v96-4-live-qa-cache-safe.mjs';
pkg.scripts['verify:v96-4'] = 'node scripts/verify-v96-4-live-qa-cache-safe.mjs';
write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`[V96.4] live QA/cache safe patch applied: ${htmlFiles.length} html files`);
