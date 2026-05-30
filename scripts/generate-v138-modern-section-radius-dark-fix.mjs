import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_MODERN_SECTION_RADIUS_SPORTS_SEARCH_DARK_TONE_FIX';
const CSS_REL = 'assets/css/v138-modern-section-radius-dark-fix.css';
const CSS_HREF = '/assets/css/v138-modern-section-radius-dark-fix.css?v=20260531-v138-radius-dark-fix';
const LINK_TAG = `<link rel="stylesheet" href="${CSS_HREF}" data-v138-modern-section-radius-dark-fix="true">`;
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');
const p = (...parts) => path.join(ROOT, ...parts);

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

const css = `/* V138 MODERN SECTION RADIUS / SPORTS · SEARCH DARK TONE FIX PATCH */
:root{
  --v138-page-bg:#090f19;
  --v138-page-bg-2:#111827;
  --v138-panel:rgba(15,23,42,.76);
  --v138-panel-2:rgba(17,24,39,.70);
  --v138-card:rgba(23,31,45,.72);
  --v138-card-strong:rgba(30,41,59,.78);
  --v138-line:rgba(255,255,255,.12);
  --v138-line-soft:rgba(255,255,255,.085);
  --v138-line-warm:rgba(246,201,107,.20);
  --v138-text:#f8fafc;
  --v138-soft:#e7edf7;
  --v138-muted:#aab6c8;
  --v138-muted-2:#8794a8;
  --v138-gold:#f6d58a;
  --v138-orange:#ff9a35;
  --v138-radius-section:clamp(26px,3.1vw,42px);
  --v138-radius-card:clamp(20px,2.1vw,30px);
  --v138-radius-inner:18px;
  --v138-shadow-section:0 24px 84px rgba(2,6,23,.34), inset 0 1px 0 rgba(255,255,255,.06);
  --v138-shadow-card:0 18px 54px rgba(2,6,23,.28), inset 0 1px 0 rgba(255,255,255,.055);
}
html[data-v138-modern-section-radius="active"]{
  background:var(--v138-page-bg)!important;
  color-scheme:dark;
  overflow-x:hidden;
}
body{overflow-x:hidden;}

/* Header visual policy: PC header uses 메인 / 블로그 / 도구 / 보증업체. /consult/ route remains reachable from mobile/footer/direct URL. */
:where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[href="/consult/"]{display:none!important;}
:where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[href="/guaranteed/"]{font-size:0!important;gap:0!important;}
:where(.rust-desktop-nav,.rust-mobile-menu,.v79-nav) > a[href="/guaranteed/"]::after{content:"보증업체";font-size:14px;line-height:1;font-weight:900;letter-spacing:-.02em;}

/* Main page section radius polish only: no new section, no content injection. */
body.v71-main-home .v71-main{padding-bottom:clamp(46px,7vw,84px)!important;}
body.v71-main-home :where(.v71-section,.v71-main-hub,.v81-1-hub-section,.v131-consult-dock){
  border-radius:var(--v138-radius-section)!important;
  border:1px solid var(--v138-line)!important;
  background:
    radial-gradient(circle at 12% -12%,rgba(246,213,138,.11),transparent 30rem),
    linear-gradient(180deg,rgba(255,255,255,.073),rgba(255,255,255,.031)),
    var(--v138-panel)!important;
  box-shadow:var(--v138-shadow-section)!important;
  overflow:hidden!important;
  clip-path:inset(0 round var(--v138-radius-section));
}
body.v71-main-home :where(.v71-section-head){border-radius:calc(var(--v138-radius-card) - 4px)!important;}
body.v71-main-home :where(.v71-blog-card,.v71-glass,.v71-tool-card,.v71-partner-card,.v71-partner-tile,.v81-1-hub-card,.v131-consult-dock a,.v131-consult-dock .v131-consult-card){
  border-radius:var(--v138-radius-card)!important;
  border-color:var(--v138-line)!important;
  background:
    linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.028)),
    var(--v138-card)!important;
  box-shadow:var(--v138-shadow-card)!important;
  overflow:hidden!important;
}
body.v71-main-home :where(.v71-tools-grid,.v71-blog-grid,.v71-partner-tile-grid,.v81-1-hub-shell){gap:clamp(12px,1.7vw,20px)!important;}
body.v71-main-home :where(.v71-section + .v71-section,.v71-section + .v131-consult-dock){margin-top:clamp(18px,2.8vw,34px)!important;}
body.v71-main-home :where(.v71-card-image,.v71-partner-image,.v71-partner-media,img){border-radius:calc(var(--v138-radius-card) - 8px)!important;}

/* Primary route card radius normalization without changing layouts. */
body :where(.v72-blog-direct,.v73-shell,.v74-shell,.v74-1-grid,.v75-consult-card,.v79-hub-stack,.v79-article,.v82-longform-hero,.v134-season-index__head,.v134-season-index__grid){
  border-radius:var(--v138-radius-section)!important;
  border-color:var(--v138-line)!important;
  box-shadow:var(--v138-shadow-section)!important;
}
body :where(.v72-blog-card,.v73-tool-card,.v74-vendor-card,.v74-1-vendor-card,.v79-card,.v79-tool,.v82-seo-card,.v117-intent-chip,.v134-season-index__card,.v136-f1-card,.v136-f1-home-card){
  border-radius:var(--v138-radius-card)!important;
  border-color:var(--v138-line)!important;
}

/* Sports-check + search-guides dark route lock: overrides V116/V117 light theme residue. */
body.v79-rust-longform-body,
body[data-v135-2-tone-page="sports-check"],
body[data-v135-2-tone-page="search-guides"],
body[data-v116-sports-check-polish="true"],
body[data-v117-search-guides-polish="true"]{
  color:var(--v138-text)!important;
  background:
    radial-gradient(circle at 18% -6%,rgba(246,213,138,.10),transparent 33rem),
    radial-gradient(circle at 82% 10%,rgba(59,130,246,.075),transparent 31rem),
    linear-gradient(180deg,var(--v138-page-bg) 0%,var(--v138-page-bg-2) 52%,var(--v138-page-bg) 100%)!important;
  color-scheme:dark;
}
body.v79-rust-longform-body :where(.v79-main,.v79-shell){background:transparent!important;max-width:100%;}
body.v79-rust-longform-body :where(.v79-hub-stack,.v79-article){
  background:
    radial-gradient(circle at 14% 0%,rgba(246,213,138,.10),transparent 26rem),
    linear-gradient(180deg,rgba(255,255,255,.070),rgba(255,255,255,.030)),
    var(--v138-panel)!important;
  border:1px solid var(--v138-line)!important;
  box-shadow:var(--v138-shadow-section)!important;
  overflow:hidden!important;
  clip-path:inset(0 round var(--v138-radius-section));
}
body.v79-rust-longform-body :where(.v79-card,.v79-tool,.v79-summary-box,.v79-mini-banner,.v91-depth-section,.v91-depth-callout,.v91-depth-faq,.v116-result-card,.v116-result-item,.v117-intent-chip,.v117-quality-card,.v117-quality-grid article){
  color:var(--v138-text)!important;
  border-color:var(--v138-line)!important;
  background:
    linear-gradient(180deg,rgba(255,255,255,.074),rgba(255,255,255,.029)),
    var(--v138-card)!important;
  box-shadow:var(--v138-shadow-card)!important;
}
body.v79-rust-longform-body :where(.v79-card strong,.v79-tool b,.v79-content h2,.v79-article-title,.v116-result-head h2,.v116-result-item strong,.v117-quality-card h2,.v117-quality-grid strong,.v117-intent-chip b,.v91-depth-section h2,.v91-depth-faq h2,summary){color:var(--v138-text)!important;}
body.v79-rust-longform-body :where(.v79-card p,.v79-tool span,.v79-article-lead,.v79-row-title small,.v79-content p,.v91-depth-content p,.v116-result-head p,.v116-result-item p,.v117-quality-card p,.v117-quality-grid span,.v117-intent-chip span,.v91-depth-callout p,.v91-depth-summary p){color:var(--v138-muted)!important;}
body.v79-rust-longform-body :where(.v79-chip,.v116-result-head span,.v116-checkline li,.v117-quality-card>span){border:1px solid var(--v138-line-warm)!important;background:rgba(246,213,138,.10)!important;color:#ffe3a3!important;}
body.v79-rust-longform-body :where(.v116-result-item b,.v79-tool i){color:#120904!important;background:linear-gradient(135deg,var(--v138-gold),var(--v138-orange))!important;}
body.v79-rust-longform-body :where(.v79-page-btn){background:rgba(255,255,255,.065)!important;border-color:var(--v138-line)!important;color:var(--v138-soft)!important;}
body.v79-rust-longform-body :where(.v79-page-btn.active){color:#120904!important;background:linear-gradient(135deg,var(--v138-gold),var(--v138-orange))!important;}

/* Any remaining inline or utility light surfaces inside sports/search are forced back to glass. */
body.v79-rust-longform-body :where([style*="background:#fff"],[style*="background: #fff"],[style*="background-color:#fff"],[style*="background-color: #fff"],[style*="background:white"],[style*="background: white"],[style*="background-color:white"],[style*="background-color: white"],.bg-white,.white,.surface-white,.light-card){
  color:var(--v138-text)!important;
  background:linear-gradient(180deg,rgba(255,255,255,.073),rgba(255,255,255,.030)),rgba(17,24,39,.88)!important;
  border-color:var(--v138-line)!important;
}
body.v79-rust-longform-body :where(table){max-width:100%!important;color:var(--v138-soft)!important;background:rgba(15,23,42,.58)!important;border-collapse:separate!important;border-spacing:0!important;}
body.v79-rust-longform-body :where(.v91-depth-content table,.v79-content table){display:block!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;white-space:nowrap!important;border-radius:var(--v138-radius-inner)!important;border:1px solid var(--v138-line)!important;}
body.v79-rust-longform-body :where(th,td){border-color:rgba(255,255,255,.10)!important;background:rgba(255,255,255,.035)!important;color:var(--v138-soft)!important;}

/* Footer and modal safety. */
.v73-modal :where(.moon-footer,.rust-footer,.site-footer,.v79-mobile-nav,.rust-bottom-nav){display:none!important;}
body :where(.moon-footer,.rust-footer,.site-footer){margin-top:clamp(28px,5vw,64px)!important;}

@media(max-width:860px){
  :root{--v138-radius-section:24px;--v138-radius-card:20px;}
  :where(.rust-mobile-menu,.v79-nav) > a[href="/guaranteed/"]::after{font-size:13px;}
  body.v71-main-home :where(.v71-section,.v131-consult-dock),body.v79-rust-longform-body :where(.v79-hub-stack,.v79-article){clip-path:inset(0 round 24px);}
  body.v79-rust-longform-body :where(.v79-rail){max-width:100%;}
}
@media(max-width:640px){
  body.v79-rust-longform-body :where(.v79-rail){display:grid!important;grid-template-columns:1fr!important;gap:12px!important;overflow:visible!important;margin-inline:0!important;padding-inline:0!important;}
  body.v79-rust-longform-body :where(.v79-card,.v79-tool){min-width:0!important;width:100%!important;}
  body.v79-rust-longform-body :where(.v116-result-grid,.v117-quality-grid,.v117-intent-strip){grid-template-columns:1fr!important;}
}
`;

const changed = new Set();
write(p(CSS_REL), css);
changed.add(CSS_REL);

const targetHtml = new Set([
  'index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','ops/index.html','admin/index.html',
  ...['sk-holdings','zakum','udt','queenbee','ddangkong','anybet','f1'].map((x)=>`guaranteed/${x}/index.html`),
  ...walk(p('sports-check'), (fp) => fp.endsWith('.html')).map(rel),
  ...walk(p('search-guides'), (fp) => fp.endsWith('.html')).map(rel)
]);

let injectedCount = 0;
let hrefFixes = 0;
for (const relFile of [...targetHtml].sort()) {
  const file = p(relFile);
  if (!fs.existsSync(file)) continue;
  let html = read(file);
  const before = html;
  if (!html.includes('data-v138-modern-section-radius="active"')) {
    html = html.replace(/<html\b(?![^>]*data-v138-modern-section-radius=)/i, '<html data-v138-modern-section-radius="active"');
  }
  if (!html.includes('data-v138-modern-section-radius-dark-fix="true"')) {
    html = html.replace(/<\/head>/i, `  <meta name="v138-modern-section-radius-dark-fix" content="${VERSION}">\n  ${LINK_TAG}\n</head>`);
    injectedCount += 1;
  }
  if (relFile === 'blog/index.html') {
    html = html.replace(/href="#"([^>]*aria-disabled="true"[^>]*>이전<\/a>)/g, 'href="/blog/"$1');
  }
  if (relFile === 'sports-check/index.html') {
    html = html.replace(/<a class="v79-page-btn" href="#">이전<\/a>/g, '<a class="v79-page-btn" href="/sports-check/" aria-disabled="true" tabindex="-1">이전</a>');
    html = html.replace(/<a class="v79-page-btn active" href="#">1<\/a>/g, '<a class="v79-page-btn active" href="/sports-check/" aria-current="page">1</a>');
    html = html.replace(/<a class="v79-page-btn" href="#">다음<\/a>/g, '<a class="v79-page-btn" href="/sports-check/" aria-disabled="true" tabindex="-1">다음</a>');
  }
  if (relFile === 'search-guides/index.html') {
    html = html.replace(/<a class="v79-page-btn" href="#">이전<\/a>/g, '<a class="v79-page-btn" href="/search-guides/" aria-disabled="true" tabindex="-1">이전</a>');
    html = html.replace(/<a class="v79-page-btn active" href="#">1<\/a>/g, '<a class="v79-page-btn active" href="/search-guides/" aria-current="page">1</a>');
    html = html.replace(/<a class="v79-page-btn" href="#">다음<\/a>/g, '<a class="v79-page-btn" href="/search-guides/" aria-disabled="true" tabindex="-1">다음</a>');
  }
  if (html !== before) {
    hrefFixes += (before.match(/href="#"/g) || []).length - (html.match(/href="#"/g) || []).length;
    write(file, html);
    changed.add(relFile);
  }
}

const pkgPath = p('package.json');
const pkg = JSON.parse(read(pkgPath));
pkg.scripts = pkg.scripts || {};
pkg.scripts.build = 'node scripts/build-v138-cloudflare-pages-safe.mjs';
pkg.scripts.verify = 'node scripts/verify-v138-modern-section-radius-dark-fix.mjs';
pkg.scripts['quality:v138'] = 'node scripts/generate-v138-modern-section-radius-dark-fix.mjs';
pkg.scripts['verify:v138'] = 'node scripts/verify-v138-modern-section-radius-dark-fix.mjs';
pkg.scripts['verify:deploy'] = 'node scripts/build-v138-cloudflare-pages-safe.mjs';
write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
changed.add('package.json');

function ensureOpsInSitemaps() {
  const today = '2026-05-31';
  for (const relPath of ['sitemap.txt', 'serverless/sitemap.txt']) {
    const fp = p(relPath);
    let txt = read(fp);
    if (!txt) continue;
    if (!txt.includes('https://88st.cloud/ops/')) {
      txt = txt.trimEnd() + '\nhttps://88st.cloud/ops/\n';
      write(fp, txt);
      changed.add(relPath);
    }
  }
  const xmlLine = `  <url><loc>https://88st.cloud/ops/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.4</priority></url>`;
  for (const relPath of ['sitemap.xml', 'serverless/sitemap.xml']) {
    const fp = p(relPath);
    let txt = read(fp);
    if (!txt) continue;
    if (!txt.includes('https://88st.cloud/ops/')) {
      txt = txt.includes('</urlset>') ? txt.replace(/\s*<\/urlset>\s*$/i, `\n${xmlLine}\n</urlset>\n`) : (txt.trimEnd() + '\n' + xmlLine + '\n');
      write(fp, txt);
      changed.add(relPath);
    }
  }
}
ensureOpsInSitemaps();

const removedRoutes = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const report = {
  ok: true,
  version: VERSION,
  base: 'V137.2 BLOG LIVE MATERIALIZE FULL',
  liveMainChecked: 'https://88st.cloud/ text/DOM checked before patch; sections observed: 실사용 가이드, 보증업체, 스포츠·검색 체크, 분석 도구, 공식 상담봇 strip, footer.',
  cssFile: CSS_REL,
  htmlInjected: injectedCount,
  hrefSharpFixed: hrefFixes,
  changedFiles: [...changed].sort(),
  deletedFiles: [],
  removedRoutePolicy: removedRoutes,
  removalCandidatesOnly: [
    'assets/config/seo.meta.json legacy metadata references for removed route names',
    'assets/data/auto.consult.v1.20260505.json legacy consult-motives URLs',
    'assets/data/consult.motives.v7.20260505.json legacy consult-motives URLs',
    'older v66-v68 generator scripts that still contain historical removed-route template strings'
  ],
  pagePolish: {
    home: ['hero/search area section radius', 'guaranteed cards area radius', 'blog card area radius', 'sports/search hub cards radius', 'tools card area radius', 'consult strip and footer spacing'],
    sportsCheck: ['hub and 12 detail pages inherit late V138 CSS', 'V116 white card tokens overridden', 'table/card overflow locked for mobile'],
    searchGuides: ['hub and 35 detail pages inherit late V138 CSS', 'V117 white card tokens overridden', 'table/card overflow locked for mobile']
  },
  forbiddenAdditions: ['AI Q&A snippet', 'FAQ box', 'trust chip', 'related/recommendation sections', 'bottom connection card block', 'new CTA conversion box'],
  generatedAt: new Date().toISOString()
};
write(p('reports/v138-modern-section-radius-dark-fix-audit.json'), JSON.stringify(report, null, 2));
changed.add('reports/v138-modern-section-radius-dark-fix-audit.json');

const generatedFiles = [
  'scripts/generate-v138-modern-section-radius-dark-fix.mjs',
  'scripts/verify-v138-modern-section-radius-dark-fix.mjs',
  'scripts/build-v138-cloudflare-pages-safe.mjs',
  'V138_UPGRADE_REPORT.md',
  'V138_PATCH_MANIFEST.json'
];
const manifest = {
  version: VERSION,
  base: 'V137.2 BLOG LIVE MATERIALIZE FULL',
  patchRootMode: 'copy/overwrite at repository root',
  fullZipMode: 'full replacement repository structure',
  changedFiles: [...new Set([...changed, ...generatedFiles])].sort(),
  deletedFiles: [],
  generatedAt: new Date().toISOString()
};
write(p('V138_PATCH_MANIFEST.json'), JSON.stringify(manifest, null, 2));
write(p('V138_UPGRADE_REPORT.md'), `# V138 MODERN SECTION RADIUS / SPORTS · SEARCH DARK TONE FIX PATCH\n\n## 기준\n\n- 기준 원본: V137.2 BLOG LIVE MATERIALIZE FULL\n- 작업 방식: 최신 FULL ZIP 내부 파일 기준 누적 패치\n- 산출 구조: GitHub / Cloudflare Pages 루트 덮어쓰기 가능\n- 삭제 파일: 0개\n\n## 공통 수정 원칙\n\n- 기존 라우팅과 기능을 유지했습니다.\n- 새 섹션, FAQ, 관련글, 추천글, 신뢰칩, 하단 연결 카드, 새 전환 박스는 추가하지 않았습니다.\n- 기존 화면 구조는 유지하고 섹션 모서리, 카드 모서리, 경계선, 그림자, 글래스 표면만 보정했습니다.\n- 스포츠체크/검색가이드의 V116/V117 계열 흰색 카드 토큰은 V138 후순위 CSS로 다크 톤 override 했습니다.\n- 헤더 시각 기준은 메인 / 블로그 / 도구 / 보증업체로 정리했습니다. 상담 페이지와 모바일/푸터 접근은 유지됩니다.\n\n## 페이지별 수정 포인트\n\n### 메인 /\n\n- hero/검색 흐름, 보증업체 카드, 블로그 카드, 스포츠·검색 체크, 도구, 상담봇 스트립, 푸터 전 여백의 각진 경계감을 완화했습니다.\n- F-1 카드와 광고 문의 카드는 구조·순서·비율을 건드리지 않았습니다.\n\n### 스포츠체크\n\n- /sports-check/ 허브와 12개 상세 페이지에 V138 다크 라우트 CSS를 주입했습니다.\n- V116의 흰색 카드/칩/결과 카드 배경을 다크 글래스 톤으로 덮었습니다.\n- 표와 카드의 모바일 overflow 방지를 유지했습니다.\n\n### 검색가이드\n\n- /search-guides/ 허브와 35개 상세 페이지에 V138 다크 라우트 CSS를 주입했습니다.\n- V117의 흰색 카드/품질 카드/인텐트 칩 배경을 다크 글래스 톤으로 덮었습니다.\n- 표와 카드의 모바일 overflow 방지를 유지했습니다.\n\n### 도구 /tools/\n\n- 기존 12개 도구와 V135.7 이후 단일 모달 구조는 유지했습니다.\n- 모달 내부 푸터/하단 네비 노출 방지 CSS를 추가했습니다.\n\n### 보증업체 /guaranteed/\n\n- 7개 업체 상세 라우트와 허브 구조를 유지했습니다.\n- 광고 카드 정책과 F-1 구조는 유지하고 카드 곡률만 보정했습니다.\n\n## 제거 후보\n\n이번 패치에서 삭제하지 않았습니다. 다음 정리 후보만 기록합니다.\n\n${report.removalCandidatesOnly.map((x) => `- ${x}`).join('\n')}\n\n## 변경 파일\n\n${manifest.changedFiles.map((x) => `- ${x}`).join('\n')}\n\n## 업로드 후 확인 URL\n\n- https://88st.cloud/\n- https://88st.cloud/blog/\n- https://88st.cloud/tools/\n- https://88st.cloud/guaranteed/\n- https://88st.cloud/guaranteed/f1/\n- https://88st.cloud/sports-check/\n- https://88st.cloud/search-guides/\n- https://88st.cloud/ops/\n- 스포츠체크 상세: /sports-check/baseball/kbo-bullpen.html, /sports-check/football/over-under.html, /sports-check/volleyball/set-handicap.html\n- 검색가이드 상세: /search-guides/anybet-seoa-code.html, /search-guides/payout-delay-check.html, /search-guides/sk-holdings-iron888.html\n`);

console.log('[V138 GENERATE PASS]', JSON.stringify(report, null, 2));
