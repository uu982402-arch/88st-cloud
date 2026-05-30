import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_2_LIVE_HEADER_TEXT_VISIBILITY_FIX';
const CSS_REL = 'assets/css/v138-2-live-header-text-visibility-fix.css';
const CSS_HREF = '/assets/css/v138-2-live-header-text-visibility-fix.css?v=20260531-v138-2-live-visibility';
const LINK_TAG = `<link rel="stylesheet" href="${CSS_HREF}" data-v138-2-live-header-text-visibility-fix="true">`;
const changed = new Set();
const headerTouched = new Set();
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const p = (...parts) => path.join(ROOT, ...parts);
const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');

function walk(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fp, predicate));
    else if (entry.isFile() && predicate(fp)) out.push(fp);
  }
  return out;
}

const css = `/* V138-2 LIVE HEADER TEXT VISIBILITY FIX
   Purpose: keep the V138 rounded/dark polish, but remove risky text-hiding tricks.
   No new sections. No FAQ/related/trust/conversion blocks. */
html[data-v138-2-live-visibility-fix="active"]{
  --v1382-header-text:#f8fafc;
  --v1382-header-muted:#dbe4f0;
  --v1382-header-line:rgba(255,255,255,.13);
  --v1382-focus:rgba(246,213,138,.28);
}

/* Header recovery: V138 used display:none and font-size:0 for nav labels.
   This layer restores real text so PC/mobile browsers do not drop menu words. */
html[data-v138-2-live-visibility-fix="active"] :where(.rust-global-header,.v79-header,.rust-header-inner,.v79-header-inner){
  overflow:visible!important;
}
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav){
  overflow:visible!important;
  min-width:0!important;
}
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a,
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[href="/consult/"],
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[href="/guaranteed/"]{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  visibility:visible!important;
  opacity:1!important;
  pointer-events:auto!important;
  font-size:14px!important;
  line-height:1.15!important;
  min-width:max-content!important;
  max-width:none!important;
  text-indent:0!important;
  white-space:nowrap!important;
  color:var(--v1382-header-text)!important;
  gap:6px!important;
  overflow:visible!important;
}
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[href="/guaranteed/"]::after{
  content:""!important;
}
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a:hover,
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a.active,
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a.is-active,
html[data-v138-2-live-visibility-fix="active"] :where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[aria-current="page"]{
  color:#fff7ed!important;
  background:rgba(246,213,138,.10)!important;
  border-color:var(--v1382-focus)!important;
}

/* Rounded section recovery: keep the modern radius but stop clipping real text/badges.
   Image/media wrappers remain clipped separately, so the design still looks rounded. */
html[data-v138-2-live-visibility-fix="active"] body.v71-main-home :where(.v71-section,.v71-main-hub,.v81-1-hub-section,.v131-consult-dock),
html[data-v138-2-live-visibility-fix="active"] body.v79-rust-longform-body :where(.v79-hub-stack,.v79-article){
  clip-path:none!important;
  overflow:visible!important;
  background-clip:padding-box!important;
}
html[data-v138-2-live-visibility-fix="active"] body.v71-main-home :where(.v71-blog-card,.v71-glass,.v71-tool-card,.v71-partner-card,.v71-partner-tile,.v81-1-hub-card,.v131-consult-dock a,.v131-consult-dock .v131-consult-card),
html[data-v138-2-live-visibility-fix="active"] body.v79-rust-longform-body :where(.v79-card,.v79-tool,.v79-summary-box,.v79-mini-banner,.v91-depth-section,.v91-depth-callout,.v91-depth-faq,.v116-result-card,.v116-result-item,.v117-intent-chip,.v117-quality-card,.v117-quality-grid article){
  overflow:visible!important;
  background-clip:padding-box!important;
}
html[data-v138-2-live-visibility-fix="active"] body.v71-main-home :where(.v71-card-image,.v71-partner-image,.v71-partner-media,.v136-f1-media),
html[data-v138-2-live-visibility-fix="active"] body.v79-rust-longform-body :where(.v79-card img,.v79-tool img,.v116-result-item img,.v117-quality-card img){
  overflow:hidden!important;
}

/* Text contrast guard for places that became too close to the new glass surface. */
html[data-v138-2-live-visibility-fix="active"] body.v71-main-home :where(.v71-section h1,.v71-section h2,.v71-section h3,.v71-section strong,.v71-section b,.v71-section .v71-card-title,.v71-section .v71-partner-title,.v81-1-hub-card strong,.v131-consult-dock strong){
  color:#f8fafc!important;
  opacity:1!important;
}
html[data-v138-2-live-visibility-fix="active"] body.v71-main-home :where(.v71-section p,.v71-section span,.v71-section small,.v71-section li,.v71-section .v71-card-copy,.v71-section .v71-partner-meta,.v81-1-hub-card p,.v131-consult-dock p),
html[data-v138-2-live-visibility-fix="active"] body.v79-rust-longform-body :where(.v79-card p,.v79-tool span,.v79-row-title small,.v79-article-lead,.v79-content p,.v91-depth-content p,.v116-result-item p,.v117-quality-card p,.v117-quality-grid span){
  color:#cbd5e1!important;
  opacity:1!important;
}
html[data-v138-2-live-visibility-fix="active"] body :where(a,button,[role="button"]){
  text-decoration-thickness:1px;
  text-underline-offset:3px;
}

/* Mobile guard: no horizontal scroll and no nav label clipping. */
@media(max-width:860px){
  html[data-v138-2-live-visibility-fix="active"] :where(.rust-mobile-menu) > a,
  html[data-v138-2-live-visibility-fix="active"] :where(.v79-nav) > a{
    font-size:13px!important;
    min-width:0!important;
    width:auto!important;
  }
  html[data-v138-2-live-visibility-fix="active"] :where(.rust-header-inner,.v79-header-inner){
    width:min(100% - 24px, var(--rust-max, 1180px))!important;
  }
}
@media(max-width:640px){
  html[data-v138-2-live-visibility-fix="active"] body.v71-main-home :where(.v71-section,.v71-main-hub,.v81-1-hub-section,.v131-consult-dock),
  html[data-v138-2-live-visibility-fix="active"] body.v79-rust-longform-body :where(.v79-hub-stack,.v79-article){
    border-radius:24px!important;
  }
}
`;

write(p(CSS_REL), css);
changed.add(CSS_REL);

const targetHtml = new Set([
  'index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','ops/index.html','admin/index.html','cert/index.html',
  ...['sk-holdings','zakum','udt','queenbee','ddangkong','anybet','f1'].map((x)=>`guaranteed/${x}/index.html`),
  ...walk(p('sports-check'), (fp) => fp.endsWith('.html')).map(rel),
  ...walk(p('search-guides'), (fp) => fp.endsWith('.html')).map(rel)
]);

function ensureLinkAfterV138(html) {
  if (html.includes('data-v138-2-live-header-text-visibility-fix="true"')) return html;
  const v138LinkPattern = /(<link[^>]+data-v138-modern-section-radius-dark-fix="true"[^>]*>)/i;
  if (v138LinkPattern.test(html)) return html.replace(v138LinkPattern, `$1\n  ${LINK_TAG}`);
  return html.replace(/<\/head>/i, `  <meta name="v138-2-live-header-text-visibility-fix" content="${VERSION}">\n  ${LINK_TAG}\n</head>`);
}

function activateHtmlFlag(html) {
  if (html.includes('data-v138-2-live-visibility-fix="active"')) return html;
  return html.replace(/<html\b(?![^>]*data-v138-2-live-visibility-fix=)/i, '<html data-v138-2-live-visibility-fix="active"');
}

function normalizeTargetHeaders(html) {
  let out = html;
  out = out.replace(/(<nav class="rust-desktop-nav"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
  out = out.replace(/(<nav class="rust-mobile-menu"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
  return out;
}

for (const relFile of [...targetHtml].sort()) {
  const file = p(relFile);
  if (!fs.existsSync(file)) continue;
  const before = read(file);
  let html = before;
  html = activateHtmlFlag(html);
  html = ensureLinkAfterV138(html);
  const beforeHeader = html;
  html = normalizeTargetHeaders(html);
  if (html !== beforeHeader) headerTouched.add(relFile);
  if (html !== before) {
    write(file, html);
    changed.add(relFile);
  }
}

function updatePackage() {
  const pkgPath = p('package.json');
  const pkg = JSON.parse(read(pkgPath) || '{}');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v138-2-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['quality:v138'] = 'node scripts/generate-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['verify:v138'] = 'node scripts/verify-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['quality:v138-1'] = 'node scripts/generate-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['verify:v138-1'] = 'node scripts/verify-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['quality:v138-2'] = 'node scripts/generate-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['verify:v138-2'] = 'node scripts/verify-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v138-2-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  changed.add('package.json');
}

function writeReports() {
  fs.mkdirSync(p('reports'), { recursive: true });
  const generatedAt = new Date().toISOString();
  const changedFiles = Array.from(changed).sort();
  const payload = {
    ok: true,
    version: VERSION,
    base: 'V137.2 BLOG LIVE MATERIALIZE FULL + V138 + V138-1',
    liveObserved: {
      home: 'Live text/DOM shows header/nav and main sections: 실사용 가이드, 보증업체, 스포츠·검색 체크, 분석 도구, 공식 상담봇, footer.',
      issue: 'V138 CSS hid /consult/ nav and set /guaranteed/ nav font-size:0, which can make header labels disappear. Rounded sections also used clip-path/overflow hidden, which can clip badges/text on some widths.'
    },
    fix: [
      'Restore real nav text visibility; do not hide /consult/ in CSS.',
      'Do not use font-size:0 pseudo-label replacement for /guaranteed/.',
      'Normalize visible target-page header label from 보증 to 보증업체.',
      'Keep rounded design but remove clip-path text clipping from section/card shells.',
      'Add contrast guard for main/sports/search card text.'
    ],
    changedFiles,
    headerTouched: Array.from(headerTouched).sort(),
    deletedFiles: [],
    generatedAt
  };
  write(p('reports', 'v138-2-live-header-text-visibility-fix-audit.json'), JSON.stringify(payload, null, 2));
  write(p('V138_2_PATCH_MANIFEST.json'), JSON.stringify({
    version: VERSION,
    patchType: 'live-visibility-hotfix',
    rootOverwriteSafe: true,
    fullReplaceSafe: true,
    changedFiles: [...changedFiles, 'reports/v138-2-live-header-text-visibility-fix-audit.json', 'V138_2_PATCH_MANIFEST.json', 'V138_2_UPGRADE_REPORT.md'].sort(),
    deletedFiles: [],
    generatedAt
  }, null, 2));
  const reportMd = [
    '# V138-2 LIVE HEADER / TEXT VISIBILITY HOTFIX',
    '',
    '실시간 확인 후 V138-1에서 발생 가능한 헤더 메뉴 누락과 라운드 처리 후 텍스트 클리핑을 수정한 최종 핫픽스입니다.',
    '',
    '## 원인',
    '',
    '- V138 CSS가 /consult/ 메뉴를 display:none으로 숨겼습니다.',
    '- V138 CSS가 /guaranteed/ 메뉴를 font-size:0으로 숨기고 ::after 텍스트로 대체했습니다. 일부 환경에서 이 방식은 메뉴 글자 누락으로 보일 수 있습니다.',
    '- 라운드 마감용 clip-path + overflow:hidden이 카드 내부 배지/문구를 자를 수 있었습니다.',
    '',
    '## 수정',
    '',
    '- 실제 HTML 헤더 텍스트를 우선 사용하도록 복구했습니다.',
    '- /consult/ 메뉴를 다시 보이게 했습니다.',
    '- /guaranteed/ 메뉴의 font-size:0 방식을 무력화하고 대상 페이지 헤더 문구를 보증업체로 정리했습니다.',
    '- 섹션 라운드는 유지하되 본문/배지 클리핑 위험을 제거했습니다.',
    '- 메인/스포츠체크/검색가이드 카드 글자 대비를 보강했습니다.',
    '',
    '## 유지',
    '',
    '- 새 섹션 추가 없음',
    '- 블로그 게시글 본문 수정 없음',
    '- 기존 라우팅 유지',
    '- 삭제 파일 없음',
    '- 제거 확정 4개 경로 재생성 없음',
    ''
  ].join('\n');
  write(p('V138_2_UPGRADE_REPORT.md'), reportMd);
  changed.add('reports/v138-2-live-header-text-visibility-fix-audit.json');
  changed.add('V138_2_PATCH_MANIFEST.json');
  changed.add('V138_2_UPGRADE_REPORT.md');
}


const deliveryFiles = [
  'scripts/build-v138-cloudflare-pages-safe.mjs',
  'scripts/generate-v138-modern-section-radius-dark-fix.mjs',
  'scripts/verify-v138-modern-section-radius-dark-fix.mjs',
  'scripts/build-v138-1-cloudflare-pages-safe.mjs',
  'scripts/generate-v138-1-cert-href-hotfix.mjs',
  'scripts/verify-v138-1-cert-href-hotfix.mjs',
  'scripts/build-v138-2-cloudflare-pages-safe.mjs',
  'scripts/generate-v138-2-live-header-text-visibility-fix.mjs',
  'scripts/verify-v138-2-live-header-text-visibility-fix.mjs',
  'V138_PATCH_MANIFEST.json',
  'V138_UPGRADE_REPORT.md',
  'V138_1_PATCH_MANIFEST.json',
  'V138_1_UPGRADE_REPORT.md',
  'reports/v138-modern-section-radius-dark-fix-audit.json',
  'reports/v138-verify-report.json',
  'reports/v138-cloudflare-build-safe-report.json',
  'reports/v138-1-cert-href-hotfix-audit.json',
  'reports/v138-1-verify-report.json',
  'reports/v138-1-cloudflare-build-safe-report.json'
];
for (const file of deliveryFiles) if (fs.existsSync(p(file))) changed.add(file);

updatePackage();
writeReports();
console.log('[V138.2 GENERATE PASS]', JSON.stringify({ ok: true, version: VERSION, changedFiles: Array.from(changed).sort(), headerTouched: Array.from(headerTouched).sort() }, null, 2));
