import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v96-3-mobile-safe-layout-20260526';
const cssHref = `/assets/css/v96-3-mobile-safe-layout.css?v=${VERSION}`;
const jsSrc = `/assets/js/v96-3-mobile-safe-layout.js?v=${VERSION}`;

const css = `/* V96.3 MOBILE SAFE LAYOUT PATCH
 * viewport guard: width=device-width / viewport-fit=cover / Chrome visual viewport 대응
 * 목적: 국내 모바일 Chrome/Samsung Internet 및 iPhone Safari에서 페이지 전체 가로 밀림,
 *       390/420/480px 폭 고정, 보증업체 슬라이더 overflow 전파, 하단바/FAB 겹침을 방지한다.
 * 원칙: 기존 라우팅/기능/카드 구조를 변경하지 않고 CSS + 보조 JS만 추가한다.
 */
:root{
  --v96-3-safe-x: max(12px, env(safe-area-inset-left, 0px));
  --v96-3-safe-r: max(12px, env(safe-area-inset-right, 0px));
  --v96-3-safe-bottom: env(safe-area-inset-bottom, 0px);
  --v96-3-mobile-gutter: 14px;
  --v96-3-bottom-nav-h: 86px;
  --v96-3-fab-bottom: calc(96px + var(--v96-3-safe-bottom));
}
html{
  width:100%;
  max-width:100%;
  min-width:0!important;
  overflow-x:hidden!important;
  -webkit-text-size-adjust:100%;
  text-size-adjust:100%;
  background:#06090f;
}
body{
  width:100%;
  max-width:100%;
  min-width:0!important;
  min-height:100dvh;
  overflow-x:hidden!important;
  overscroll-behavior-x:none;
  background:#06090f;
}
@supports not (height:100dvh){body{min-height:100vh}}
*,*::before,*::after{box-sizing:border-box}
img,svg,video,canvas,iframe{max-width:100%;height:auto}

/* 1) 공통 wrapper 폭 잠금 해제: 390/420/480px 고정폭이 상위 레이아웃을 잡아먹지 않게 방지 */
.v96-3-mobile-safe-layout,
.v96-3-mobile-safe-layout .v71-page,
.v96-3-mobile-safe-layout .v71-main,
.v96-3-mobile-safe-layout .v72-blog-page,
.v96-3-mobile-safe-layout .v73-tools-page,
.v96-3-mobile-safe-layout .v74-page,
.v96-3-mobile-safe-layout .v74-1-main,
.v96-3-mobile-safe-layout .v75-consult-page,
.v96-3-mobile-safe-layout .v79-hub-page,
.v96-3-mobile-safe-layout .v80-ops-page,
.v96-3-mobile-safe-layout .v96-2-detail,
.v96-3-mobile-safe-layout main,
.v96-3-mobile-safe-layout section,
.v96-3-mobile-safe-layout article,
.v96-3-mobile-safe-layout header,
.v96-3-mobile-safe-layout footer{
  max-width:100%;
  min-width:0;
}
.v96-3-mobile-safe-layout .v71-page,
.v96-3-mobile-safe-layout .v74-page,
.v96-3-mobile-safe-layout .v96-2-detail{
  width:100%;
  overflow-x:hidden;
}
@supports (overflow:clip){
  .v96-3-mobile-safe-layout .v71-page,
  .v96-3-mobile-safe-layout .v74-page,
  .v96-3-mobile-safe-layout .v96-2-detail,
  .v96-3-mobile-safe-layout main{overflow-x:clip}
}

/* 2) Chrome Android / Samsung Internet: 100vw 부작용 완화, 주소창 접힘/펼침 보정 */
.v96-3-mobile-safe-layout .v71-bg-orb,
.v96-3-mobile-safe-layout body::before,
.v96-3-mobile-safe-layout body::after{max-width:100%;overflow:hidden}
.v96-3-mobile-safe-layout [style*="100vw"]{max-width:100%!important}

/* 3) 콘텐츠 셸은 화면 폭 안에서만 확장 */
.v96-3-mobile-safe-layout .v71-shell,
.v96-3-mobile-safe-layout .v72-shell,
.v96-3-mobile-safe-layout .v73-shell,
.v96-3-mobile-safe-layout .v74-shell,
.v96-3-mobile-safe-layout .v74-1-grid,
.v96-3-mobile-safe-layout .v74-1-bridge,
.v96-3-mobile-safe-layout .v75-shell,
.v96-3-mobile-safe-layout .v79-shell,
.v96-3-mobile-safe-layout .v80-shell,
.v96-3-mobile-safe-layout .v96-2-shell,
.v96-3-mobile-safe-layout .rust-header-inner,
.v96-3-mobile-safe-layout .rust-mobile-menu{
  max-width:100%;
  min-width:0;
}

/* 4) 보증업체/광고 슬라이더만 가로 스크롤 허용. 페이지 전체 overflow 전파 방지 */
.v96-3-mobile-safe-layout .v71-mobile-partners,
.v96-3-mobile-safe-layout .v71-partner-carousel,
.v96-3-mobile-safe-layout .v74-vendor-grid,
.v96-3-mobile-safe-layout .v74-1-grid,
.v96-3-mobile-safe-layout .guaranteed-slider,
.v96-3-mobile-safe-layout .vendor-strip{
  min-width:0;
  max-width:100%;
}
.v96-3-mobile-safe-layout .v71-partner-carousel,
.v96-3-mobile-safe-layout .guaranteed-slider,
.v96-3-mobile-safe-layout .vendor-strip{
  width:100%;
  overflow-x:auto;
  overflow-y:hidden;
  overscroll-behavior-x:contain;
  -webkit-overflow-scrolling:touch;
  scroll-snap-type:x proximity;
}
.v96-3-mobile-safe-layout .v71-partner-card,
.v96-3-mobile-safe-layout .vendor-card,
.v96-3-mobile-safe-layout .guaranteed-card{
  min-width:0;
  max-width:100%;
  scroll-snap-align:start;
}
.v96-3-mobile-safe-layout .v71-partner-card img,
.v96-3-mobile-safe-layout .v74-1-image-link img,
.v96-3-mobile-safe-layout .v54-visual-card img,
.v96-3-mobile-safe-layout .v96-2-art img,
.v96-3-mobile-safe-layout .vendor-card img,
.v96-3-mobile-safe-layout .guaranteed-card img,
.v96-3-mobile-safe-layout .vendor-hero img{
  width:100%;
  height:100%;
  object-fit:contain!important;
  object-position:center!important;
  transform:none!important;
  background:#fff;
}
.v96-3-mobile-safe-layout .v71-partner-card,
.v96-3-mobile-safe-layout .v74-1-image-link,
.v96-3-mobile-safe-layout .v54-visual-card,
.v96-3-mobile-safe-layout .v96-2-art{
  background:linear-gradient(180deg,#fff,#f4f6f8)!important;
}

/* 5) 블로그/도구 그리드 폭 잠금 방지 */
.v96-3-mobile-safe-layout .v71-blog-grid,
.v96-3-mobile-safe-layout .v72-blog-grid,
.v96-3-mobile-safe-layout .v73-tool-grid,
.v96-3-mobile-safe-layout .v74-vendor-grid,
.v96-3-mobile-safe-layout .v96-2-benefits,
.v96-3-mobile-safe-layout .v96-2-info-grid,
.v96-3-mobile-safe-layout .home-blog-grid,
.v96-3-mobile-safe-layout .blog-grid{
  width:100%;
  max-width:100%;
  min-width:0;
}
.v96-3-mobile-safe-layout .v71-blog-card,
.v96-3-mobile-safe-layout .v72-blog-card,
.v96-3-mobile-safe-layout .v73-tool-card,
.v96-3-mobile-safe-layout .v74-vendor-card,
.v96-3-mobile-safe-layout .v74-1-vendor-card,
.v96-3-mobile-safe-layout .v96-2-info-card,
.v96-3-mobile-safe-layout .blog-card{
  min-width:0;
  max-width:100%;
  overflow-wrap:anywhere;
}

/* 6) 표/코드/긴 링크는 내부만 스크롤 */
.v96-3-mobile-safe-layout table,
.v96-3-mobile-safe-layout pre,
.v96-3-mobile-safe-layout code{
  max-width:100%;
}
.v96-3-mobile-safe-layout pre,
.v96-3-mobile-safe-layout .v96-2-table-wrap,
.v96-3-mobile-safe-layout .table-wrap{
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
}

@media (max-width:760px){
  :root{--v96-3-mobile-gutter:14px;--v96-3-bottom-nav-h:88px}
  html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}
  body.v96-3-mobile-safe-layout{padding-bottom:calc(var(--v96-3-bottom-nav-h) + 18px + var(--v96-3-safe-bottom))}

  .v96-3-mobile-safe-layout .v71-shell,
  .v96-3-mobile-safe-layout .v72-shell,
  .v96-3-mobile-safe-layout .v73-shell,
  .v96-3-mobile-safe-layout .v74-shell,
  .v96-3-mobile-safe-layout .v74-shell.v74-1-grid,
  .v96-3-mobile-safe-layout .v74-1-bridge,
  .v96-3-mobile-safe-layout .v75-shell,
  .v96-3-mobile-safe-layout .v79-shell,
  .v96-3-mobile-safe-layout .v80-shell,
  .v96-3-mobile-safe-layout .v96-2-shell,
  .v96-3-mobile-safe-layout .rust-header-inner,
  .v96-3-mobile-safe-layout .rust-mobile-menu{
    width:calc(100% - (var(--v96-3-mobile-gutter) * 2))!important;
    max-width:100%!important;
    min-width:0!important;
    margin-left:auto!important;
    margin-right:auto!important;
  }

  .v96-3-mobile-safe-layout .v71-main,
  .v96-3-mobile-safe-layout .v74-main,
  .v96-3-mobile-safe-layout .v74-1-main,
  .v96-3-mobile-safe-layout .v96-2-detail main{
    width:100%!important;
    max-width:100%!important;
    min-width:0!important;
  }

  .v96-3-mobile-safe-layout .v71-partner-carousel{
    display:flex!important;
    gap:12px!important;
    width:100%!important;
    max-width:100%!important;
    padding:2px var(--v96-3-mobile-gutter) 10px!important;
    margin-left:0!important;
    margin-right:0!important;
    grid-auto-columns:unset!important;
  }
  .v96-3-mobile-safe-layout .v71-partner-card{
    flex:0 0 clamp(184px,46vw,236px)!important;
    width:clamp(184px,46vw,236px)!important;
    max-width:236px!important;
    min-height:122px!important;
    aspect-ratio:16/9;
  }
  .v96-3-mobile-safe-layout .v71-partner-card img{min-height:0!important}

  .v96-3-mobile-safe-layout .v71-blog-grid,
  .v96-3-mobile-safe-layout .home-blog-grid,
  .v96-3-mobile-safe-layout .blog-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:10px!important;
  }
  .v96-3-mobile-safe-layout .v71-blog-card,
  .v96-3-mobile-safe-layout .v72-blog-card{
    min-width:0!important;
    max-width:100%!important;
  }

  .v96-3-mobile-safe-layout .v74-shell.v74-1-grid,
  .v96-3-mobile-safe-layout .v74-vendor-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:9px!important;
  }

  .v96-3-mobile-safe-layout .v96-2-hero,
  .v96-3-mobile-safe-layout .v96-2-facts,
  .v96-3-mobile-safe-layout .v96-2-benefits,
  .v96-3-mobile-safe-layout .v96-2-info-grid{
    grid-template-columns:1fr!important;
  }

  .v96-3-mobile-safe-layout .rust-bottom-nav,
  .v96-3-mobile-safe-layout .v71-mobile-nav,
  .v96-3-mobile-safe-layout .v74-mobile-nav,
  .v96-3-mobile-safe-layout .mobile-bottom-nav{
    position:fixed!important;
    left:max(12px,env(safe-area-inset-left,0px))!important;
    right:max(12px,env(safe-area-inset-right,0px))!important;
    bottom:calc(12px + env(safe-area-inset-bottom,0px))!important;
    width:auto!important;
    max-width:none!important;
    margin-left:0!important;
    margin-right:0!important;
    transform:none!important;
    z-index:120!important;
  }
  .v96-3-mobile-safe-layout .v71-fab,
  .v96-3-mobile-safe-layout .v74-fab,
  .v96-3-mobile-safe-layout .floating-action,
  .v96-3-mobile-safe-layout .rust-floating-action{
    position:fixed!important;
    right:max(16px,env(safe-area-inset-right,0px))!important;
    bottom:calc(96px + env(safe-area-inset-bottom,0px))!important;
    z-index:121!important;
  }
  .v96-3-mobile-safe-layout .v74-toast,
  .v96-3-mobile-safe-layout .v96-2-toast{
    bottom:calc(108px + env(safe-area-inset-bottom,0px))!important;
    max-width:calc(100% - 28px)!important;
  }
}

@media (max-width:380px){
  :root{--v96-3-mobile-gutter:11px}
  .v96-3-mobile-safe-layout .v71-blog-grid,
  .v96-3-mobile-safe-layout .home-blog-grid,
  .v96-3-mobile-safe-layout .blog-grid{gap:8px!important}
  .v96-3-mobile-safe-layout .v71-blog-card{padding:11px!important}
}
@media (max-width:340px){
  .v96-3-mobile-safe-layout .v71-blog-grid,
  .v96-3-mobile-safe-layout .home-blog-grid,
  .v96-3-mobile-safe-layout .blog-grid,
  .v96-3-mobile-safe-layout .v74-shell.v74-1-grid,
  .v96-3-mobile-safe-layout .v74-vendor-grid{grid-template-columns:1fr!important}
}

@media (min-width:761px) and (max-width:1023px){
  .v96-3-mobile-safe-layout .v71-shell,
  .v96-3-mobile-safe-layout .v74-shell,
  .v96-3-mobile-safe-layout .v96-2-shell{width:calc(100% - 36px)!important;max-width:100%!important}
  .v96-3-mobile-safe-layout .v71-partner-carousel{margin-left:0!important;margin-right:0!important;max-width:100%!important}
}

/* Chrome 계열에서 visualViewport 리사이즈 후 생기는 오른쪽 빈 면 방지 보조 클래스 */
html.v96-3-chrome-web body.v96-3-mobile-safe-layout{contain:none}
html.v96-3-overflow-locked,html.v96-3-overflow-locked body{overflow-x:hidden!important}
`;

const js = `/* V96.3 MOBILE SAFE LAYOUT PATCH - Chrome/Samsung Internet/iPhone Safari viewport guard */
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;
  root.classList.add('v96-3-overflow-locked');
  body.classList.add('v96-3-mobile-safe-layout');
  body.dataset.v963MobileSafe = 'active';

  const ua = navigator.userAgent || '';
  if (/Chrome|CriOS|SamsungBrowser|EdgA|EdgiOS/i.test(ua)) root.classList.add('v96-3-chrome-web');
  if (/iPhone|iPad|iPod/i.test(ua)) root.classList.add('v96-3-ios-web');

  const selectors = [
    '.v71-page','.v71-main','.v71-shell','.v71-partner-carousel','.v71-blog-grid',
    '.v72-shell','.v72-blog-grid','.v73-shell','.v74-shell','.v74-1-grid','.v74-vendor-grid',
    '.v75-shell','.v79-shell','.v80-shell','.v96-2-shell','.rust-header-inner','.rust-mobile-menu'
  ];

  const apply = () => {
    const vw = Math.max(root.clientWidth || 0, window.innerWidth || 0);
    root.style.setProperty('--v96-3-js-vw', vw + 'px');
    root.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      el.style.minWidth = '0';
      el.style.maxWidth = '100%';
      if (el.scrollWidth > vw + 2 && !el.matches('.v71-partner-carousel,.guaranteed-slider,.vendor-strip,.v96-2-table-wrap')) {
        el.dataset.v963WidthGuard = 'true';
      }
    });
  };

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(schedule, 120), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
    window.visualViewport.addEventListener('scroll', schedule, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  schedule();
})();
`;

function ensureDir(file){ fs.mkdirSync(path.dirname(file), { recursive: true }); }
function write(file, content){ ensureDir(file); fs.writeFileSync(file, content); }

write(path.join(ROOT, 'assets/css/v96-3-mobile-safe-layout.css'), css);
write(path.join(ROOT, 'assets/js/v96-3-mobile-safe-layout.js'), js);

const targets = [];
function walk(dir){
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) targets.push(full);
  }
}
walk(ROOT);

let changed = 0;
for (const file of targets) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  if (!/<html[\s>]/i.test(html) || !/<\/head>/i.test(html)) continue;

  html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">');
  if (!/<meta\s+name=["']viewport["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`);
  }

  html = html.replace(/\n?\s*<link[^>]+data-v96-3-mobile-safe-layout=["']true["'][^>]*>/g, '');
  html = html.replace(/\n?\s*<script[^>]+data-v96-3-mobile-safe-layout=["']true["'][^>]*><\/script>/g, '');
  html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${cssHref}" data-v96-3-mobile-safe-layout="true">\n</head>`);

  html = html.replace(/<body\b([^>]*)>/i, (match, attrs) => {
    attrs = attrs.replace(/\s+data-v96-3-mobile-safe-layout=[\"'][^\"']*[\"']/gi, '');
    if (/class\s*=/.test(attrs)) {
      return '<body' + attrs.replace(/class=(['"])(.*?)\1/i, (m, q, cls) => `class=${q}${cls.includes('v96-3-mobile-safe-layout') ? cls : `${cls} v96-3-mobile-safe-layout`}${q}`) + ' data-v96-3-mobile-safe-layout="active">';
    }
    return `<body${attrs} class="v96-3-mobile-safe-layout" data-v96-3-mobile-safe-layout="active">`;
  });
  html = html.replace(/<\/body>/i, `  <script src="${jsSrc}" defer data-v96-3-mobile-safe-layout="true"></script>\n</body>`);

  if (html !== before) { fs.writeFileSync(file, html); changed++; }
}


const pkgFile = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgFile)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    pkg.scripts = pkg.scripts || {};
    const genCmd = 'node scripts/generate-v96-3-mobile-safe-layout.mjs';
    const verifyCmd = 'node scripts/verify-v96-3-mobile-safe-layout.mjs';
    if (pkg.scripts.build) {
      pkg.scripts.build = pkg.scripts.build
        .split(' && ')
        .filter((cmd) => !cmd.includes('generate-v96-3-mobile-safe-layout.mjs'))
        .join(' && ');
      pkg.scripts.build += ` && ${genCmd}`;
    } else {
      pkg.scripts.build = genCmd;
    }
    pkg.scripts['quality:v96-3'] = genCmd;
    pkg.scripts['verify:v96-3'] = verifyCmd;
    pkg.scripts.verify = verifyCmd;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
  } catch (err) {
    console.warn('[V96.3] package script update skipped:', err.message);
  }
}

console.log(`[V96.3] mobile safe layout patch applied: ${changed} html files`);
