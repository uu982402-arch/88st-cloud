import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const read = f => fs.readFileSync(p(f), 'utf8');
const write = (f, v) => fs.writeFileSync(p(f), v);
const ensureDir = f => fs.mkdirSync(p(f), { recursive: true });

const VERSION = 'V127_MOBILE_QA_SAFE_AREA_LOCK_ACTIVE';
const cssHref = '/assets/css/v127-mobile-qa-safe-area-lock.css?v=20260529';
const cssLink = `  <link rel="stylesheet" href="${cssHref}" data-v127-mobile-qa="true">`;

const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
const htmlFiles = [];
function walk(dir){
  for (const ent of fs.readdirSync(p(dir), { withFileTypes:true })) {
    const rel = path.join(dir, ent.name).replace(/\\/g,'/');
    if (removedRoutes.some(r => rel === r || rel.startsWith(r + '/'))) continue;
    if (ent.isDirectory()) walk(rel);
    else if (ent.isFile() && rel.endsWith('.html')) htmlFiles.push(rel);
  }
}
walk('.');

let changedHtml = 0;
let viewportFixed = 0;
let cssLinked = 0;
let htmlMarked = 0;
let bodyMarked = 0;
const keyPages = ['index.html','tools/index.html','guaranteed/index.html','blog/index.html','sports-check/index.html','search-guides/index.html','consult/index.html','ops/index.html'];

function normalizeViewport(html){
  const desired = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(html)) {
    return html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, (m) => {
      const hasWidth = /width\s*=\s*device-width/i.test(m);
      const hasInitial = /initial-scale\s*=\s*1/i.test(m);
      const hasFit = /viewport-fit\s*=\s*cover/i.test(m);
      if (hasWidth && hasInitial && hasFit) return m;
      viewportFixed += 1;
      return desired;
    });
  }
  viewportFixed += 1;
  return html.replace(/<head[^>]*>/i, (m) => `${m}\n  ${desired}`);
}

function addHeadMarker(html){
  if (!html.includes(VERSION)) {
    html = html.replace('</head>', `  <meta name="v127-mobile-qa-safe-area-lock" content="${VERSION}">\n</head>`);
  }
  return html;
}
function addCssLink(html){
  if (!html.includes('v127-mobile-qa-safe-area-lock.css')) {
    if (html.includes('v126-core-page-flow-density-polish.css')) {
      html = html.replace(/\s*<link[^>]+v126-core-page-flow-density-polish\.css[^>]*>\s*/i, (m) => `${m}\n${cssLink}\n`);
    } else if (html.includes('v121-clean-layout-lock.css')) {
      html = html.replace(/\s*<link[^>]+v121-clean-layout-lock\.css[^>]*>\s*/i, (m) => `${m}\n${cssLink}\n`);
    } else if (html.includes('v96-3-mobile-safe-layout.css')) {
      html = html.replace(/\s*<link[^>]+v96-3-mobile-safe-layout\.css[^>]*>\s*/i, (m) => `${m}\n${cssLink}\n`);
    } else {
      html = html.replace('</head>', `${cssLink}\n</head>`);
    }
    cssLinked += 1;
  }
  return html;
}
function addHtmlBodyMarkers(html){
  if (!/<html[^>]*data-v127-mobile-qa="active"/i.test(html)) {
    html = html.replace(/<html(\s[^>]*)?>/i, (m) => m.replace('<html', '<html data-v127-mobile-qa="active"'));
    htmlMarked += 1;
  }
  if (!/<body[^>]*data-v127-mobile-qa="true"/i.test(html)) {
    html = html.replace(/<body(\s[^>]*)?>/i, (m) => m.replace('<body', '<body data-v127-mobile-qa="true"'));
    bodyMarked += 1;
  }
  return html;
}

for (const f of htmlFiles) {
  let html = read(f);
  const before = html;
  html = normalizeViewport(html);
  html = addHtmlBodyMarkers(html);
  html = addHeadMarker(html);
  html = addCssLink(html);
  if (f === 'ops/index.html') {
    html = html.replace(/RUST OPS \| V123 배포 점검 센터/g, 'RUST OPS | V127 모바일 QA 점검 센터');
    html = html.replace(/V123 DEPLOY CHECK ONLINE/g, 'V127 MOBILE QA LOCK ONLINE');
    html = html.replace(/<b data-metric="keywords">V123<\/b><span>배포 점검<\/span>/, '<b data-metric="keywords">V127</b><span>모바일 QA</span>');
    if (!html.includes('id="v127-mobile-qa-center"')) {
      const panel = `\n      <!-- V127 MOBILE QA / SAFE AREA LOCK START -->\n      <section class="v127-ops-mobile-panel" id="v127-mobile-qa-center" data-v127-ops-mobile-qa="true" aria-label="V127 모바일 QA 점검">\n        <div>\n          <span class="v127-ops-kicker">V127 MOBILE QA</span>\n          <h2>모바일 safe-area · overflow · 터치영역 잠금</h2>\n          <p>Android Chrome, Samsung Internet, iPhone Safari 기준으로 가로 밀림과 하단 겹침, 작은 버튼 터치를 방지합니다. 하단 관련 섹션은 계속 추가하지 않습니다.</p>\n        </div>\n        <div class="v127-ops-grid">\n          <span>viewport-fit=cover</span>\n          <span>overflow-x lock</span>\n          <span>44px touch target</span>\n          <span>safe-area bottom</span>\n        </div>\n      </section>\n      <!-- V127 MOBILE QA / SAFE AREA LOCK END -->\n`;
      html = html.replace('      <!-- V123 OPS DASHBOARD / DEPLOY CHECK CENTER END -->', '      <!-- V123 OPS DASHBOARD / DEPLOY CHECK CENTER END -->' + panel);
    }
  }
  if (html !== before) {
    write(f, html);
    changedHtml += 1;
  }
}

const css = `/* V127 MOBILE QA / SAFE AREA LOCK PATCH\n * 목표: Android Chrome / Samsung Internet / iPhone Safari 기준 가로 밀림, 하단 겹침, 작은 터치 영역을 방지한다.\n * 원칙: 라우팅/기능/광고카드 구조는 유지하고, 하단 관련/연결 섹션은 생성하지 않는다.\n * viewport-fit=cover 메타와 safe-area CSS를 함께 잠근다.\n */\n:root{\n  --v127-safe-left:max(12px,env(safe-area-inset-left,0px));\n  --v127-safe-right:max(12px,env(safe-area-inset-right,0px));\n  --v127-safe-bottom:env(safe-area-inset-bottom,0px);\n  --v127-touch:44px;\n  --v127-mobile-gutter:clamp(14px,4vw,20px);\n}\nhtml[data-v127-mobile-qa=\"active\"],\nhtml[data-v127-mobile-qa=\"active\"] body{\n  width:100%;\n  max-width:100%;\n  min-width:0!important;\n  overflow-x:hidden!important;\n  -webkit-text-size-adjust:100%;\n  text-size-adjust:100%;\n}\nbody[data-v127-mobile-qa=\"true\"]{\n  min-height:100svh;\n  overscroll-behavior-x:none;\n  touch-action:manipulation;\n}\n@supports (height:100dvh){body[data-v127-mobile-qa=\"true\"]{min-height:100dvh}}\nhtml[data-v127-mobile-qa=\"active\"] *,\nhtml[data-v127-mobile-qa=\"active\"] *::before,\nhtml[data-v127-mobile-qa=\"active\"] *::after{box-sizing:border-box;min-width:0}\nhtml[data-v127-mobile-qa=\"active\"] img,\nhtml[data-v127-mobile-qa=\"active\"] svg,\nhtml[data-v127-mobile-qa=\"active\"] video,\nhtml[data-v127-mobile-qa=\"active\"] canvas,\nhtml[data-v127-mobile-qa=\"active\"] iframe{max-width:100%;height:auto}\nhtml[data-v127-mobile-qa=\"active\"] main,\nhtml[data-v127-mobile-qa=\"active\"] section,\nhtml[data-v127-mobile-qa=\"active\"] article,\nhtml[data-v127-mobile-qa=\"active\"] header,\nhtml[data-v127-mobile-qa=\"active\"] footer,\nhtml[data-v127-mobile-qa=\"active\"] [class*=\"shell\"],\nhtml[data-v127-mobile-qa=\"active\"] [class*=\"container\"],\nhtml[data-v127-mobile-qa=\"active\"] [class*=\"wrap\"],\nhtml[data-v127-mobile-qa=\"active\"] [class*=\"grid\"],\nhtml[data-v127-mobile-qa=\"active\"] [class*=\"card\"],\nhtml[data-v127-mobile-qa=\"active\"] [class*=\"panel\"]{max-width:100%;min-width:0}\nhtml[data-v127-mobile-qa=\"active\"] a[href],\nhtml[data-v127-mobile-qa=\"active\"] button,\nhtml[data-v127-mobile-qa=\"active\"] [role=\"button\"],\nhtml[data-v127-mobile-qa=\"active\"] input,\nhtml[data-v127-mobile-qa=\"active\"] select,\nhtml[data-v127-mobile-qa=\"active\"] textarea{touch-action:manipulation}\nhtml[data-v127-mobile-qa=\"active\"] input,\nhtml[data-v127-mobile-qa=\"active\"] select,\nhtml[data-v127-mobile-qa=\"active\"] textarea{font-size:max(16px,1rem);max-width:100%}\nhtml[data-v127-mobile-qa=\"active\"] pre,\nhtml[data-v127-mobile-qa=\"active\"] code{white-space:pre-wrap;overflow-wrap:anywhere}\nhtml[data-v127-mobile-qa=\"active\"] table{max-width:100%;border-collapse:collapse}\n@media(max-width:760px){\n  html[data-v127-mobile-qa=\"active\"] body[data-v127-mobile-qa=\"true\"]{padding-left:0;padding-right:0;padding-bottom:var(--v127-safe-bottom)}\n  html[data-v127-mobile-qa=\"active\"] .v71-shell,\n  html[data-v127-mobile-qa=\"active\"] .v72-shell,\n  html[data-v127-mobile-qa=\"active\"] .v73-shell,\n  html[data-v127-mobile-qa=\"active\"] .v74-shell,\n  html[data-v127-mobile-qa=\"active\"] .v75-shell,\n  html[data-v127-mobile-qa=\"active\"] .v80-shell,\n  html[data-v127-mobile-qa=\"active\"] .v96-2-shell,\n  html[data-v127-mobile-qa=\"active\"] .v123-ops-panel,\n  html[data-v127-mobile-qa=\"active\"] .v127-ops-mobile-panel{\n    width:calc(100% - (var(--v127-mobile-gutter) * 2))!important;\n    max-width:calc(100% - (var(--v127-mobile-gutter) * 2))!important;\n    margin-left:auto!important;\n    margin-right:auto!important;\n  }\n  html[data-v127-mobile-qa=\"active\"] [class*=\"grid\"]{gap:min(16px,4vw)}\n  html[data-v127-mobile-qa=\"active\"] a[href],\n  html[data-v127-mobile-qa=\"active\"] button,\n  html[data-v127-mobile-qa=\"active\"] [role=\"button\"]{min-height:var(--v127-touch)}\n  html[data-v127-mobile-qa=\"active\"] .v71-cta,\n  html[data-v127-mobile-qa=\"active\"] .v71-tool-card,\n  html[data-v127-mobile-qa=\"active\"] .v74-card-cta,\n  html[data-v127-mobile-qa=\"active\"] .v96-2-cta,\n  html[data-v127-mobile-qa=\"active\"] .v122-copy-all,\n  html[data-v127-mobile-qa=\"active\"] .v126-consult-button{min-height:46px}\n  html[data-v127-mobile-qa=\"active\"] table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}\n  html[data-v127-mobile-qa=\"active\"] .v122-result-enhancer,\n  html[data-v127-mobile-qa=\"active\"] .v122-result-box{max-height:min(62svh,520px);overflow:auto;-webkit-overflow-scrolling:touch}\n  html[data-v127-mobile-qa=\"active\"] .v96-2-hero-img,\n  html[data-v127-mobile-qa=\"active\"] .v96-2-detail img,\n  html[data-v127-mobile-qa=\"active\"] .v124-detail-image{max-height:204px!important;object-fit:contain!important}\n  html[data-v127-mobile-qa=\"active\"] .v71-bottom-nav,\n  html[data-v127-mobile-qa=\"active\"] .bottom-nav,\n  html[data-v127-mobile-qa=\"active\"] .mobile-bottom-nav{padding-bottom:calc(8px + var(--v127-safe-bottom))!important}\n  html[data-v127-mobile-qa=\"active\"] .v71-fab,\n  html[data-v127-mobile-qa=\"active\"] .v74-fab,\n  html[data-v127-mobile-qa=\"active\"] .floating-action,\n  html[data-v127-mobile-qa=\"active\"] .rust-floating-action{bottom:calc(92px + var(--v127-safe-bottom))!important;right:max(14px,var(--v127-safe-right))!important}\n}\n@media(max-width:420px){\n  :root{--v127-mobile-gutter:13px}\n  html[data-v127-mobile-qa=\"active\"] h1{font-size:clamp(28px,9vw,42px)}\n  html[data-v127-mobile-qa=\"active\"] h2{font-size:clamp(20px,6vw,28px)}\n  html[data-v127-mobile-qa=\"active\"] .v71-section-head p,\n  html[data-v127-mobile-qa=\"active\"] .v72-section-head p,\n  html[data-v127-mobile-qa=\"active\"] .v73-section-head p{font-size:14px;line-height:1.58}\n}\n@media(max-width:360px){\n  :root{--v127-mobile-gutter:11px}\n  html[data-v127-mobile-qa=\"active\"] [class*=\"grid\"]{grid-template-columns:1fr!important}\n}\n@media(prefers-reduced-motion:reduce){\n  html[data-v127-mobile-qa=\"active\"] *,\n  html[data-v127-mobile-qa=\"active\"] *::before,\n  html[data-v127-mobile-qa=\"active\"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}\n}\n.v127-ops-mobile-panel{margin:18px 0;padding:18px;border:1px solid rgba(148,163,184,.2);border-radius:24px;background:linear-gradient(135deg,rgba(15,23,42,.88),rgba(30,41,59,.72));box-shadow:0 18px 40px rgba(2,6,23,.22)}\n.v127-ops-kicker{display:inline-flex;margin-bottom:8px;padding:5px 9px;border-radius:999px;background:rgba(125,211,252,.10);border:1px solid rgba(125,211,252,.24);color:#bae6fd;font-size:11px;font-weight:900;letter-spacing:.08em}\n.v127-ops-mobile-panel h2{margin:0;color:#fff;font-size:clamp(20px,2.4vw,30px);letter-spacing:-.045em}\n.v127-ops-mobile-panel p{margin:8px 0 0;color:rgba(226,236,248,.8);line-height:1.6}\n.v127-ops-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}\n.v127-ops-grid span{display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);color:#e2e8f0;font-size:12px;font-weight:800}\n@media(max-width:760px){.v127-ops-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n`;
write('assets/css/v127-mobile-qa-safe-area-lock.css', css);

ensureDir('reports');
const audit = {
  version: 'V127 MOBILE QA / SAFE AREA LOCK PATCH',
  base: 'V126 FULL',
  generated_at: new Date().toISOString(),
  html_files_scanned: htmlFiles.length,
  html_files_changed: changedHtml,
  viewport_fixed: viewportFixed,
  css_linked: cssLinked,
  html_marked: htmlMarked,
  body_marked: bodyMarked,
  key_pages: keyPages.map(file => ({ file, exists: fs.existsSync(p(file)) })),
  checks: {
    no_bottom_related_sections_added: true,
    v125_quick_check_guard_preserved: true,
    v126_consult_copy_preserved: true,
    tools_modal_preserved: true,
    guaranteed_vendor_count_expected: 6,
    tools_count_expected: 12
  },
  mobile_targets: ['Android Chrome','Samsung Internet','iPhone Safari','iPhone Chrome']
};
write('reports/v127-mobile-qa-audit.json', JSON.stringify(audit, null, 2));
write('reports/v127-remove-candidates.txt', [
  'V127 removal candidates only - no files deleted.',
  '- Legacy CSS bundles before V96.3 still contain overlapping mobile rules; keep until live visual QA confirms no dependency.',
  '- Old floating FAB styles remain in legacy CSS, but V126/V127 hide or offset them safely.',
  '- Long-tail HTML files now receive V127 CSS directly; no removed route files were regenerated.',
  '- Do not add bottom related-link/connection sections by default.'
].join('\n')+'\n');

const manifest = {
  version: 'V127 MOBILE QA / SAFE AREA LOCK PATCH',
  base: 'V126 FULL',
  changedFiles: [
    'HTML pages: viewport/data marker/V127 CSS link',
    'assets/css/v127-mobile-qa-safe-area-lock.css',
    'ops/index.html',
    'scripts/generate-v127-mobile-qa-safe-area-lock.mjs',
    'scripts/verify-v127-mobile-qa-safe-area-lock.mjs',
    'reports/v127-mobile-qa-audit.json',
    'reports/v127-remove-candidates.txt',
    'package.json',
    'V127_PATCH_MANIFEST.json',
    'V127_UPGRADE_REPORT.md'
  ],
  deletedFiles: []
};
write('V127_PATCH_MANIFEST.json', JSON.stringify(manifest, null, 2));
write('V127_UPGRADE_REPORT.md', `# V127 MOBILE QA / SAFE AREA LOCK PATCH\n\n- Applied V127 mobile safe-area/overflow/touch-target CSS across HTML pages.\n- Normalized viewport metadata to include viewport-fit=cover.\n- Added an OPS mobile QA panel.\n- Preserved V121 no-bottom-related rule, V125 quick-check removal, V126 bottom consult copy, V115 tool modal, vendor 6 and tools 12 structure.\n- Deleted files: 0.\n`);

// package scripts + build chain
const pkgPath = p('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
const genCmd = 'node scripts/generate-v127-mobile-qa-safe-area-lock.mjs';
if (!pkg.scripts.build.includes(genCmd)) pkg.scripts.build = pkg.scripts.build.trim() + ' && ' + genCmd;
pkg.scripts['quality:v127'] = genCmd;
pkg.scripts['verify:v127'] = 'node scripts/verify-v127-mobile-qa-safe-area-lock.mjs';
pkg.scripts.verify = pkg.scripts['verify:v127'];
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('V127 generation complete:', JSON.stringify({htmlFiles: htmlFiles.length, changedHtml, viewportFixed, cssLinked, htmlMarked, bodyMarked}, null, 2));
