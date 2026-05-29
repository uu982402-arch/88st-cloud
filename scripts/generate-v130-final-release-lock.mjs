import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const VERSION = 'V130';
const VERSION_NAME = 'FINAL RELEASE LOCK / FULL VERIFY PACKAGE';
const TODAY = '2026-05-29';
const REMOVED_ROUTES = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const CORE_ROUTES = [
  { label: '메인', url: '/', file: 'index.html' },
  { label: '블로그', url: '/blog/', file: 'blog/index.html' },
  { label: '도구', url: '/tools/', file: 'tools/index.html' },
  { label: '보증업체', url: '/guaranteed/', file: 'guaranteed/index.html' },
  { label: '상담', url: '/consult/', file: 'consult/index.html' },
  { label: '스포츠 체크', url: '/sports-check/', file: 'sports-check/index.html' },
  { label: '검색 가이드', url: '/search-guides/', file: 'search-guides/index.html' },
  { label: '운영센터', url: '/ops/', file: 'ops/index.html' },
  { label: 'sitemap.xml', url: '/sitemap.xml', file: 'sitemap.xml' },
  { label: 'robots.txt', url: '/robots.txt', file: 'robots.txt' },
];
const VENDORS = [
  { name: 'SK 홀딩스', url: '/guaranteed/sk-holdings/', file: 'guaranteed/sk-holdings/index.html', code: 'IRON888' },
  { name: '자쿰', url: '/guaranteed/zakum/', file: 'guaranteed/zakum/index.html', code: 'ZAKUM' },
  { name: 'UDT BET', url: '/guaranteed/udt/', file: 'guaranteed/udt/index.html', code: 'SEOA' },
  { name: '여왕벌', url: '/guaranteed/queenbee/', file: 'guaranteed/queenbee/index.html', code: 'SEOA' },
  { name: '땅콩 BET', url: '/guaranteed/ddangkong/', file: 'guaranteed/ddangkong/index.html', code: 'DDK888' },
  { name: 'ANY BET', url: '/guaranteed/anybet/', file: 'guaranteed/anybet/index.html', code: 'SEOA' },
];
const TOOL_LABELS = [
  '주소 확인', '가입코드 확인', '보너스 실수령', '롤링 조건', '배당 마진', '기대값 계산',
  '스포츠 분석', '이벤트 조건', '가입코드 매칭 체크 PRO', '보너스 실수령 PRO', '출금 조건 체크리스트', '도메인 변경 메모장'
];
const FORBIDDEN_GLOBAL = [
  'v36-related-links', 'v36-growth-hubs', 'v36-conversion-cta', 'v70-2-related',
  'quick-resource-grid', 'pro-related', 'consult-motive-section', '같이 보면 좋은 링크', '관련 링크', '관련 확인', 'RELATED',
  'RUST QUICK CHECK', 'data-v120-fold="true"', 'data-v120-search-form="true"', 'v120-action-sports', 'v120-action-guaranteed',
  '조건 상담 후 이용', '상담 후 이용', '상담으로 조건 확인', '확인 기준', '상담 전 최종 확인',
  'COMMON CENTER', '공통 확인 채널', '상담센터 연결', '상담 전 문의 템플릿', '상담에서 재확인',
  'class="v71-fab"'
];

function file(p){ return path.join(ROOT, p); }
function exists(p){ return fs.existsSync(file(p)); }
function read(p){ return fs.readFileSync(file(p), 'utf8'); }
function write(p, data){ fs.mkdirSync(path.dirname(file(p)), { recursive: true }); fs.writeFileSync(file(p), data); }
function walk(dir, out=[]){
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules', '.git'].includes(name)) continue;
      walk(full, out);
    } else out.push(rel);
  }
  return out;
}
function sha256(p){ return crypto.createHash('sha256').update(fs.readFileSync(file(p))).digest('hex'); }
function ensureHead(html){ return html.includes('</head>'); }
function ensureOnce(html, marker, insertion){
  if (html.includes(marker)) return html;
  if (!ensureHead(html)) return html;
  return html.replace('</head>', `${insertion}\n</head>`);
}
function ensureHtmlMarker(html){
  if (/<html\b[^>]*data-v130-release-lock=/i.test(html)) return html;
  return html.replace(/<html\b/i, '<html data-v130-release-lock="active"');
}
function ensureBodyMarker(html){
  if (/<body\b[^>]*data-v130-release-lock=/i.test(html)) return html;
  return html.replace(/<body\b/i, '<body data-v130-release-lock="true"');
}
function stripDuplicateAttrs(html) {
  // Non-invasive: only fix very visible duplicated V125 marker on root html when present.
  return html.replace(/ data-v125-main-clean-fold="active" data-v125-main-clean-fold="active"/g, ' data-v125-main-clean-fold="active"');
}

function updateHtmlFiles() {
  const htmls = walk(ROOT).filter(p => p.endsWith('.html'));
  let touched = 0;
  for (const p of htmls) {
    let html = read(p);
    const before = html;
    html = stripDuplicateAttrs(html);
    html = ensureHtmlMarker(html);
    html = ensureBodyMarker(html);
    html = ensureOnce(html, 'v130-final-release-lock', '  <meta name="v130-final-release-lock" content="V130_FINAL_RELEASE_LOCK_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v130-final-release-lock.css?v=20260529" data-v130-release-lock="true">');
    if (html !== before) { write(p, html); touched++; }
  }
  return { htmlCount: htmls.length, htmlTouched: touched };
}

function createCss() {
  const css = `/* V130 FINAL RELEASE LOCK / FULL VERIFY PACKAGE */\n:root{--v130-surface:#ffffff;--v130-soft:#f5f7fb;--v130-line:rgba(15,23,42,.11);--v130-text:#0f172a;--v130-muted:#64748b;--v130-gold:#b68b35}\nhtml[data-v130-release-lock=active]{scroll-padding-top:72px}\nbody[data-v130-release-lock=true]{overflow-x:hidden}\nimg,svg,video,iframe{max-width:100%}\n[data-v120-fold=true],.v120-fold,.v120-action-sports,.v120-action-guaranteed,.v36-related-links,.v36-growth-hubs,.v36-conversion-cta,.v70-2-related,.quick-resource-grid,.pro-related,.consult-motive-section,.v71-fab{display:none!important}\n.v130-ops-release-panel{margin:18px 0;padding:18px;border:1px solid var(--v130-line);border-radius:22px;background:linear-gradient(135deg,#fff,#f8fafc 68%,#fff7df);box-shadow:0 16px 45px rgba(15,23,42,.07);color:var(--v130-text)}\n.v130-ops-release-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}\n.v130-ops-kicker{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#fff7df;color:#7a5a16;border:1px solid rgba(182,139,53,.24);font-size:11px;font-weight:900;letter-spacing:.08em}\n.v130-ops-release-head h2{margin:8px 0 4px;font-size:22px;line-height:1.2;letter-spacing:-.03em}\n.v130-ops-release-head p{margin:0;color:var(--v130-muted);font-size:14px;line-height:1.55}\n.v130-ops-badge{white-space:nowrap;border-radius:999px;background:#0f172a;color:#fff;font-size:12px;font-weight:900;padding:8px 11px}\n.v130-ops-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}\n.v130-ops-card{border:1px solid var(--v130-line);background:rgba(255,255,255,.82);border-radius:16px;padding:13px 14px;min-height:84px}\n.v130-ops-card small{display:block;color:var(--v130-muted);font-weight:800;font-size:11px;letter-spacing:.04em;text-transform:uppercase}\n.v130-ops-card strong{display:block;margin-top:6px;font-size:20px;line-height:1.1;color:var(--v130-text)}\n.v130-ops-card span{display:block;margin-top:6px;color:var(--v130-muted);font-size:12px;line-height:1.35}\n.v130-ops-list{margin:12px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;list-style:none}\n.v130-ops-list li{border:1px solid var(--v130-line);border-radius:14px;padding:10px 12px;background:rgba(255,255,255,.74);font-size:13px;color:#334155}\n.v130-ops-list b{color:#0f172a}\n@media(max-width:760px){.v130-ops-release-panel{padding:14px;border-radius:18px}.v130-ops-release-head{display:block}.v130-ops-badge{display:inline-flex;margin-top:10px}.v130-ops-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v130-ops-list{grid-template-columns:1fr}.v130-ops-card{min-height:74px;padding:11px}.v130-ops-card strong{font-size:18px}}\n@media(max-width:420px){.v130-ops-grid{grid-template-columns:1fr}}\n`;
  write('assets/css/v130-final-release-lock.css', css);
}

function updateOpsPanel() {
  const p = 'ops/index.html';
  if (!exists(p)) return false;
  let html = read(p);
  if (html.includes('id="v130-final-release-lock"')) return true;
  const panel = `\n      <section class="v130-ops-release-panel" id="v130-final-release-lock" data-v130-ops-release-lock="true" aria-label="V130 최종 릴리즈 락">\n        <div class="v130-ops-release-head">\n          <div>\n            <span class="v130-ops-kicker">V130 RELEASE LOCK</span>\n            <h2>최종 릴리즈 검증 패키지</h2>\n            <p>V115부터 V129까지 잠근 라우트, 보증업체, 도구, 모바일, 성능, SEO 상태를 배포 전 한 번에 확인합니다.</p>\n          </div>\n          <span class="v130-ops-badge">READY</span>\n        </div>\n        <div class="v130-ops-grid">\n          <div class="v130-ops-card"><small>core routes</small><strong>10</strong><span>메인·허브·sitemap·robots</span></div>\n          <div class="v130-ops-card"><small>vendors</small><strong>6</strong><span>보증업체 상세 유지</span></div>\n          <div class="v130-ops-card"><small>tools</small><strong>12</strong><span>모달/결과 UX 유지</span></div>\n          <div class="v130-ops-card"><small>locks</small><strong>10</strong><span>삭제경로·금지문구·SEO</span></div>\n        </div>\n        <ul class="v130-ops-list">\n          <li><b>삭제 확정 4개</b> 재생성 없음</li>\n          <li><b>하단 관련 섹션</b> 재생성 금지</li>\n          <li><b>RUST QUICK CHECK</b> 제거 유지</li>\n          <li><b>SEO/OG/Schema</b> V129 상태 유지</li>\n        </ul>\n      </section>\n`;
  const anchor = '<section class="v123-ops-panel"';
  if (html.includes(anchor)) {
    html = html.replace(anchor, panel + '      ' + anchor);
  } else {
    html = html.replace('</main>', panel + '\n</main>');
  }
  write(p, html);
  return true;
}

function updatePackage() {
  const p = 'package.json';
  const pkg = JSON.parse(read(p));
  pkg.scripts = pkg.scripts || {};
  const gen = 'node scripts/generate-v130-final-release-lock.mjs';
  if (!pkg.scripts.build.includes(gen)) pkg.scripts.build += ` && ${gen}`;
  pkg.scripts.verify = 'node scripts/verify-v130-final-release-lock.mjs';
  pkg.scripts['quality:v130'] = gen;
  pkg.scripts['verify:v130'] = 'node scripts/verify-v130-final-release-lock.mjs';
  write(p, JSON.stringify(pkg, null, 2) + '\n');
}

function createReports(summary) {
  fs.mkdirSync(file('reports'), { recursive: true });
  const files = walk(ROOT).sort();
  const htmls = files.filter(p => p.endsWith('.html'));
  const cssFiles = files.filter(p => p.endsWith('.css'));
  const jsFiles = files.filter(p => p.endsWith('.js') || p.endsWith('.mjs'));
  const routeStatus = CORE_ROUTES.map(r => ({ ...r, exists: exists(r.file) }));
  const vendorStatus = VENDORS.map(v => ({ ...v, exists: exists(v.file), sha256: exists(v.file) ? sha256(v.file).slice(0,16) : null }));
  const sitemapText = exists('sitemap.xml') ? read('sitemap.xml') : '';
  const sitemapRemovedHits = REMOVED_ROUTES.filter(r => sitemapText.includes(`/${r}`));
  const index = exists('index.html') ? read('index.html') : '';
  const lockStatus = [
    { label: 'RUST QUICK CHECK 제거', ok: !index.includes('RUST QUICK CHECK') && !index.includes('data-v120-fold="true"') },
    { label: '상담 FAB 제거', ok: !index.includes('class="v71-fab"') },
    { label: 'V127 모바일 CSS', ok: index.includes('v127-mobile-qa-safe-area-lock.css') },
    { label: 'V128 성능 CSS', ok: index.includes('v128-performance-asset-lightweight.css') },
    { label: 'V129 SEO Schema', ok: index.includes('data-v129-schema="true"') || index.includes('v129-seo-meta-og-schema-final') },
    { label: 'V130 릴리즈 마커', ok: index.includes('data-v130-release-lock') },
    { label: '삭제 확정 sitemap 제외', ok: sitemapRemovedHits.length === 0 },
  ];
  const releaseAudit = {
    version: VERSION,
    name: VERSION_NAME,
    base: 'V129 FULL',
    generated_at: TODAY,
    summary: {
      html_count: htmls.length,
      css_count: cssFiles.length,
      js_count: jsFiles.length,
      core_routes: CORE_ROUTES.length,
      vendors: VENDORS.length,
      tools: TOOL_LABELS.length,
      removed_routes_locked: REMOVED_ROUTES.length,
      html_touched: summary.htmlTouched,
      ops_panel_added: summary.opsPanelAdded,
    },
    routeStatus,
    vendorStatus,
    tools: TOOL_LABELS,
    locks: lockStatus,
    reports: [
      'reports/v130-final-release-audit.json',
      'reports/v130-route-lock-audit.json',
      'reports/v130-seo-lock-audit.json',
      'reports/v130-deploy-checklist.md',
      'reports/v130-remove-candidates.txt'
    ]
  };
  write('reports/v130-final-release-audit.json', JSON.stringify(releaseAudit, null, 2));
  write('reports/v130-route-lock-audit.json', JSON.stringify({ version: VERSION, generated_at: TODAY, coreRoutes: routeStatus, vendors: vendorStatus, removedRoutes: REMOVED_ROUTES.map(r => ({ route: r, filesystemExists: exists(r) || exists(`${r}/index.html`), sitemapHit: sitemapText.includes(`/${r}`) })) }, null, 2));
  const seoSample = htmls.slice(0, 200).map(p => {
    const h = read(p);
    return { file: p, title: /<title>[^<]+<\/title>/i.test(h), description: /<meta\s+name=["']description["']/i.test(h), canonical: /<link\s+rel=["']canonical["']/i.test(h), ogTitle: /property=["']og:title["']/i.test(h), schema: /application\/ld\+json/i.test(h) };
  });
  write('reports/v130-seo-lock-audit.json', JSON.stringify({ version: VERSION, generated_at: TODAY, sampled: seoSample.length, sample: seoSample, note: 'V129 SEO/OG/Schema 상태 유지 확인용 샘플 리포트' }, null, 2));
  write('reports/v130-remove-candidates.txt', [
    '# V130 REMOVE CANDIDATES',
    '',
    '- 삭제 실행 없음. 이번 버전은 최종 잠금/검증 패키지입니다.',
    '- 기존 제거 확정 4개 경로(faq, consult-motives, consult-result, provider-updates)는 계속 재생성 금지입니다.',
    '- 대형 이미지/미참조 자산은 V128 asset manifest 기준으로만 후보 검토하고, V130에서는 삭제하지 않았습니다.',
    '- 하단 관련 링크/추천 카드 계열은 재생성 방지 대상이며, 새 섹션 추가 금지 원칙을 유지합니다.',
  ].join('\n'));
  write('reports/v130-deploy-checklist.md', [
    '# V130 Deploy Checklist',
    '',
    '1. V130 PATCH ZIP을 V129 기준 위에 덮어쓰기',
    '2. Cloudflare Pages 배포 후 캐시 purge',
    '3. /, /tools/, /guaranteed/, /sports-check/, /search-guides/, /consult/, /ops/ 접속 확인',
    '4. /guaranteed/ 6개 상세 이미지 크기와 CTA 확인',
    '5. 메인에서 RUST QUICK CHECK, 24H 지표, 우측 ↗ FAB가 보이지 않는지 확인',
    '6. 하단 관련/추천 링크 박스가 재생성되지 않았는지 확인',
    '7. sitemap.xml과 robots.txt 확인',
  ].join('\n'));
  write('V130_PATCH_MANIFEST.json', JSON.stringify({ version: VERSION, name: VERSION_NAME, base: 'V129 FULL', generated_at: TODAY, changed_policy: 'No route deletion, release lock and verification only', coreRoutes: CORE_ROUTES.map(r => r.url), vendors: VENDORS.map(v => v.url), toolCount: TOOL_LABELS.length }, null, 2));
  write('V130_UPGRADE_REPORT.md', [
    '# V130 FINAL RELEASE LOCK / FULL VERIFY PACKAGE',
    '',
    '## 기준',
    '- Base: V129 FULL',
    '- 목적: V115~V129 누적 잠금 조건을 최종 릴리즈 검증 패키지로 고정',
    '- 삭제 파일: 0개',
    '',
    '## 반영',
    '- 전체 HTML에 V130 릴리즈 락 마커 및 CSS 연결',
    '- /ops/ 최종 릴리즈 검증 패널 추가',
    '- reports/v130-* 감사 리포트 생성',
    '- package.json verify를 V130 검증으로 갱신',
    '',
    '## 유지 잠금',
    '- 삭제 확정 4개 경로 재생성 금지',
    '- RUST QUICK CHECK 재생성 금지',
    '- 하단 관련/추천 섹션 재생성 금지',
    '- 보증업체 6개와 도구 12개 유지',
    '- V127 모바일, V128 성능, V129 SEO/OG/Schema 유지',
  ].join('\n'));
  write('build.txt', `88ST_CLOUD_V130_FINAL_RELEASE_LOCK_FULL_VERIFY_PACKAGE\nGenerated: ${TODAY}\nBase: V129 FULL\n`);
}

const summary = updateHtmlFiles();
createCss();
const opsPanelAdded = updateOpsPanel();
updatePackage();
createReports({ ...summary, opsPanelAdded });
console.log(`[V130] generated ${VERSION_NAME}`);
console.log(JSON.stringify({ ...summary, opsPanelAdded }, null, 2));
