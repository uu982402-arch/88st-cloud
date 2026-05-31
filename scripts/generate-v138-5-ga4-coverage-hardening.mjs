import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_5_GA4_COVERAGE_HARDENING';
const GA_ID = 'G-KWT87FBY6S';
const V82 = '<meta name="v82-1-structure-ga4" content="V82_1_STRUCTURE_GA4_ACTIVE"><meta name="rust-ga4-id" content="G-KWT87FBY6S"><script defer src="/assets/js/v82.ga4-events.js?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"></script>';
const V89 = '<meta name="v89-ga4-event-depth" content="V89_GA4_EVENT_DEPTH_ACTIVE"><script defer src="/assets/js/v89.ga4-event-depth.js?v=static-v89-ga4-event-depth-20260526" data-v89-ga4-depth="true"></script>';
const FLAG = 'data-v138-5-ga4-coverage="active"';
const changed = new Set([
  'scripts/generate-v138-5-ga4-coverage-hardening.mjs',
  'scripts/verify-v138-5-ga4-coverage-hardening.mjs',
  'scripts/build-v138-5-cloudflare-pages-safe.mjs'
]);

function p(...parts){ return path.join(ROOT, ...parts); }
function read(file){ return fs.readFileSync(file, 'utf8'); }
function write(file, data){ fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, data); }
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir, {withFileTypes:true})){
    const fp = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(!['node_modules','.git'].includes(ent.name)) walk(fp, out);
    } else if(ent.isFile() && ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}
function rel(fp){ return path.relative(ROOT, fp).replace(/\\/g, '/'); }
function isOpsExcluded(r){ return /^(admin|ops|cert|analysis)(\/|$)/i.test(r); }
function hasNoindex(html){ return /<meta\b[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html); }
function ensureHtmlFlag(html){
  if(html.includes(FLAG)) return html;
  return html.replace(/<html\b(?![^>]*data-v138-5-ga4-coverage=)/i, `<html ${FLAG}`);
}
function ensureHeadSnippet(html, snippet){
  const hasV82 = snippet.includes('v82.ga4-events.js');
  const hasV89 = snippet.includes('v89.ga4-event-depth.js');
  if(hasV82 && html.includes('v82.ga4-events.js') && html.includes('name="rust-ga4-id"')) return html;
  if(hasV89 && html.includes('v89.ga4-event-depth.js')) return html;
  // Place after the viewport if possible, otherwise before </head>. Keep this early so queued gtag is ready before later feature scripts.
  const viewport = /(<meta\b[^>]+name=["']viewport["'][^>]*>)/i;
  if(viewport.test(html)) return html.replace(viewport, `$1\n  ${snippet}`);
  return html.replace(/<\/head>/i, `  ${snippet}\n</head>`);
}

const htmlFiles = walk(ROOT);
const injected = [];
const already = [];
const skipped = [];
for(const fp of htmlFiles){
  const r = rel(fp);
  let html = read(fp);
  if(isOpsExcluded(r) || hasNoindex(html)) { skipped.push(r); continue; }
  const before = html;
  html = ensureHtmlFlag(html);
  html = ensureHeadSnippet(html, V82);
  html = ensureHeadSnippet(html, V89);
  // avoid accidental duplicate exact meta/script insertions from older generators
  html = html.replace(/(<meta name="rust-ga4-id" content="G-KWT87FBY6S">)(\s*<meta name="rust-ga4-id" content="G-KWT87FBY6S">)+/g, '$1');
  html = html.replace(/(<script defer src="\/assets\/js\/v82\.ga4-events\.js\?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"><\/script>)(\s*<script defer src="\/assets\/js\/v82\.ga4-events\.js\?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"><\/script>)+/g, '$1');
  html = html.replace(/(<script defer src="\/assets\/js\/v89\.ga4-event-depth\.js\?v=static-v89-ga4-event-depth-20260526" data-v89-ga4-depth="true"><\/script>)(\s*<script defer src="\/assets\/js\/v89\.ga4-event-depth\.js\?v=static-v89-ga4-event-depth-20260526" data-v89-ga4-depth="true"><\/script>)+/g, '$1');
  if(html !== before){ write(fp, html); changed.add(r); injected.push(r); }
  else already.push(r);
}

function updatePackage(){
  const pkgPath = p('package.json');
  const pkg = JSON.parse(read(pkgPath) || '{}');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v138-5-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v138-5-ga4-coverage-hardening.mjs';
  pkg.scripts['quality:v138-5'] = 'node scripts/generate-v138-5-ga4-coverage-hardening.mjs';
  pkg.scripts['verify:v138-5'] = 'node scripts/verify-v138-5-ga4-coverage-hardening.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v138-5-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  changed.add('package.json');
}

function writeReports(){
  const generatedAt = new Date().toISOString();
  fs.mkdirSync(p('reports'), {recursive:true});
  const audit = {
    ok: true,
    version: VERSION,
    base: 'V138-4 BLOG RADIUS ROLLBACK TEXT SAFE FULL',
    measurementId: GA_ID,
    liveObserved: {
      home: 'https://88st.cloud/ reachable; public flow includes home/blog/tools/guaranteed/sports/search/tools/consult areas.',
      blog: 'https://88st.cloud/blog/ reachable; blog list exposes V133 season and V137/V137.2 posts.',
      tools: 'https://88st.cloud/tools/ reachable.',
      guaranteed: 'https://88st.cloud/guaranteed/ reachable.'
    },
    diagnosis: [
      'GA4 base loader is implemented by assets/js/v82.ga4-events.js with measurement id G-KWT87FBY6S and send_page_view:true.',
      'Additional interaction/depth events are implemented by assets/js/v89.ga4-event-depth.js.',
      'V138-4 ZIP had public pages without v82/v89 injection, especially V137/V137.2 blog posts and guaranteed detail pages; those pages would not reliably send GA4 page_view/events.'
    ],
    fix: [
      'Inject rust-ga4-id meta, v82.ga4-events.js, and v89.ga4-event-depth.js into every public HTML page except /admin/, /ops/, /cert/, /analysis/, and noindex pages.',
      'Keep /admin/ and /ops/ excluded from GA4 by path guard and noindex policy.',
      'Add V138-5 verify to fail build when a public page misses GA4 coverage, or when duplicate GA4 scripts are introduced.'
    ],
    publicHtmlTotal: htmlFiles.filter(fp => !isOpsExcluded(rel(fp)) && !hasNoindex(read(fp))).length,
    injectedFiles: injected.sort(),
    alreadyCoveredFiles: already.length,
    skippedFiles: skipped.sort(),
    changedFiles: Array.from(changed).sort(),
    deletedFiles: [],
    generatedAt
  };
  write(p('reports/v138-5-ga4-coverage-audit.json'), JSON.stringify(audit, null, 2));
  changed.add('reports/v138-5-ga4-coverage-audit.json');
  const manifest = {
    version: VERSION,
    patchType: 'ga4-coverage-hardening',
    rootOverwriteSafe: true,
    fullReplaceSafe: true,
    measurementId: GA_ID,
    changedFiles: Array.from(new Set([...changed, 'V138_5_PATCH_MANIFEST.json', 'V138_5_UPGRADE_REPORT.md'])).sort(),
    deletedFiles: [],
    generatedAt
  };
  write(p('V138_5_PATCH_MANIFEST.json'), JSON.stringify(manifest, null, 2));
  changed.add('V138_5_PATCH_MANIFEST.json');
  const md = [
    '# V138-5 GA4 COVERAGE HARDENING',
    '',
    'GA4 삽입 누락 페이지를 보강한 안전 패치입니다.',
    '',
    '## 확인 결과',
    '',
    `- 측정 ID: ${GA_ID}`,
    '- 기본 page_view: `assets/js/v82.ga4-events.js`에서 `send_page_view:true`로 처리',
    '- 클릭/스크롤/읽기 완료 이벤트: `assets/js/v89.ga4-event-depth.js`에서 처리',
    '- 누락 범위: V137/V137.2 신규 블로그 일부, sports-season 하위 글 일부, 보증업체 상세 7개',
    '',
    '## 수정',
    '',
    '- 공개 HTML 전 페이지에 GA4 meta/script 적용을 보장했습니다.',
    '- `/admin/`, `/ops/`, `/cert/`, `/analysis/`, noindex 페이지는 수집 제외로 유지했습니다.',
    '- 빌드 검증에서 공개 페이지 GA4 누락/중복 삽입을 실패 처리하도록 추가했습니다.',
    '',
    '## 유지',
    '',
    '- 화면 디자인 변경 없음',
    '- 블로그 본문 변경 없음',
    '- 라우팅 변경 없음',
    '- 삭제 파일 없음',
    ''
  ].join('\n');
  write(p('V138_5_UPGRADE_REPORT.md'), md);
  changed.add('V138_5_UPGRADE_REPORT.md');
}

// Include cumulative V138 delivery files so the patch remains safe when applied over V138-4 or when Cloudflare runs the current build chain.
// The PATCH artifact is intentionally cumulative for GA4: include every public HTML file so a root overwrite also fixes static source, not only the Cloudflare build output.
for(const fp of htmlFiles){
  const r = rel(fp);
  const h = read(fp);
  if(!isOpsExcluded(r) && !hasNoindex(h)) changed.add(r);
}

for(const file of [
  'cert/index.html',
  'assets/js/v82.ga4-events.js','assets/js/v89.ga4-event-depth.js',
  'assets/css/v138-modern-section-radius-dark-fix.css','assets/css/v138-2-live-header-text-visibility-fix.css','assets/css/v138-3-section-radius-rollback.css','assets/css/v138-4-blog-radius-rollback.css',
  'scripts/build-v138-4-cloudflare-pages-safe.mjs','scripts/generate-v138-4-blog-radius-rollback.mjs','scripts/verify-v138-4-blog-radius-rollback.mjs',
  'scripts/build-v138-3-cloudflare-pages-safe.mjs','scripts/generate-v138-3-section-radius-rollback.mjs','scripts/verify-v138-3-section-radius-rollback.mjs',
  'scripts/build-v138-2-cloudflare-pages-safe.mjs','scripts/generate-v138-2-live-header-text-visibility-fix.mjs','scripts/verify-v138-2-live-header-text-visibility-fix.mjs',
  'scripts/build-v138-1-cloudflare-pages-safe.mjs','scripts/generate-v138-1-cert-href-hotfix.mjs','scripts/verify-v138-1-cert-href-hotfix.mjs',
  'scripts/build-v138-cloudflare-pages-safe.mjs','scripts/generate-v138-modern-section-radius-dark-fix.mjs','scripts/verify-v138-modern-section-radius-dark-fix.mjs',
  'V138_4_PATCH_MANIFEST.json','V138_4_UPGRADE_REPORT.md','V138_3_PATCH_MANIFEST.json','V138_3_UPGRADE_REPORT.md','V138_2_PATCH_MANIFEST.json','V138_2_UPGRADE_REPORT.md','V138_1_PATCH_MANIFEST.json','V138_1_UPGRADE_REPORT.md','V138_PATCH_MANIFEST.json','V138_UPGRADE_REPORT.md'
]) if(fs.existsSync(p(file))) changed.add(file);

updatePackage();
writeReports();
console.log('[V138.5 GENERATE PASS]', JSON.stringify({ok:true, version:VERSION, measurementId:GA_ID, injected:injected.length, changedFiles:Array.from(changed).sort()}, null, 2));
