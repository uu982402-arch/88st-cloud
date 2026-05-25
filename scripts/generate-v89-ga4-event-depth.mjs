import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v89-ga4-event-depth-20260526';
const MARKER = 'V89_GA4_EVENT_DEPTH_ACTIVE';
const PUBLIC_JS = `/assets/js/v89.ga4-event-depth.js?v=${VERSION}`;
const OPS_CSS = `/assets/css/v89-ga4-event-depth.css?v=${VERSION}`;
const OPS_JS = `/assets/js/v89-ga4-depth-ops.js?v=${VERSION}`;
const DATA_PATH = 'assets/data/v89-ga4-event-depth.json';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}
function rel(file){ return path.relative(ROOT, file).replace(/\\/g,'/'); }
function read(file){ return fs.readFileSync(file,'utf8'); }
function write(file, body){ fs.writeFileSync(file, body, 'utf8'); }
function isPrivate(fileRel){ return /^(ops|admin)\//.test(fileRel); }
function stripV89(html){
  return html
    .replace(/\s*<meta\s+name=["']v89-ga4-event-depth["'][^>]*>\s*/gi, '')
    .replace(/\s*<script\b[^>]*v89\.ga4-event-depth\.js[^>]*>\s*<\/script>\s*/gi, '')
    .replace(/\s*<link\b[^>]*v89-ga4-event-depth\.css[^>]*>\s*/gi, '')
    .replace(/\s*<script\b[^>]*v89-ga4-depth-ops\.js[^>]*>\s*<\/script>\s*/gi, '');
}
function injectPublic(fileRel, html){
  let next = stripV89(html);
  const meta = `<meta name="v89-ga4-event-depth" content="${MARKER}">`;
  if (isPrivate(fileRel)) {
    return next.replace(/<\/head>/i, `  ${meta}\n</head>`);
  }
  const block = `  ${meta}\n  <script defer src="${PUBLIC_JS}" data-v89-ga4-depth="true"></script>\n`;
  return next.replace(/<\/head>/i, `${block}</head>`);
}
function addOpsPanel(html){
  let next = stripV89(html);
  next = next.replace(/\s*<!-- V89 GA4 EVENT DEPTH START -->[\s\S]*?<!-- V89 GA4 EVENT DEPTH END -->\s*/g, '\n');
  next = next.replace(/<\/head>/i, `  <link rel="stylesheet" href="${OPS_CSS}" data-v89-ga4-depth="true">\n</head>`);
  next = next.replace(/<\/body>/i, `  <script src="${OPS_JS}" defer data-v89-ga4-depth="true"></script>\n</body>`);
  if (!next.includes('href="#ga4-depth"')) {
    next = next.replace(/(<a href="#indexing-readiness">색인준비<\/a>)/, `$1\n        <a href="#ga4-depth">GA4심화</a>`);
  }
  const data = JSON.parse(read(path.join(ROOT, DATA_PATH)));
  const cards = `
        <div><small>측정 ID</small><strong>${data.measurementId}</strong><span>전역 GA4 기준</span></div>
        <div><small>심화 이벤트</small><strong>${data.events.length}</strong><span>전환/완독/탐색</span></div>
        <div><small>제외 경로</small><strong>/ops · /admin</strong><span>관리 페이지 noindex</span></div>
        <div><small>검증</small><strong>V89</strong><span>스크립트/마커 검사</span></div>`;
  const panel = `
      <!-- V89 GA4 EVENT DEPTH START -->
      <section class="v89-ga-panel" id="ga4-depth" data-v89-ga4-depth="${MARKER}" aria-label="GA4 이벤트 심화 점검">
        <div class="v89-ga-head">
          <div>
            <span class="v89-ga-kicker">V89 GA4 EVENT DEPTH</span>
            <h2>GA4 이벤트 심화 점검</h2>
            <p>상담, 보증업체, 도구, 블로그, sports-check, search-guides, 모바일 하단바, 상세글 완독 이벤트를 한곳에서 확인합니다.</p>
          </div>
          <div class="v89-ga-actions">
            <button type="button" class="v89-ga-btn is-primary" data-v89-copy-events>이벤트명 복사</button>
            <a class="v89-ga-btn" href="/assets/data/v89-ga4-event-depth.json" target="_blank" rel="noopener">데이터 열기</a>
          </div>
        </div>
        <div class="v89-ga-grid">${cards}</div>
        <div class="v89-ga-list" data-v89-ga-list></div>
        <pre class="v89-ga-log" data-v89-ga-log>V89 GA4 이벤트 목록을 불러오는 중입니다.</pre>
      </section>
      <!-- V89 GA4 EVENT DEPTH END -->
`;
  const anchor = '<section class="v80-layout" id="deploy"';
  if (next.includes(anchor)) return next.replace(anchor, `${panel}\n      ${anchor}`);
  return next.replace(/<\/main>/i, `${panel}\n    </main>`);
}
function updatePackage(){
  const pkgPath = path.join(ROOT,'package.json');
  const pkg = JSON.parse(read(pkgPath));
  const generate = 'node scripts/generate-v89-ga4-event-depth.mjs';
  const verify = 'node scripts/verify-v89-ga4-event-depth.mjs';
  const chain = String(pkg.scripts?.build || '').split('&&').map(s=>s.trim()).filter(Boolean).filter(s => s !== generate);
  chain.push(generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v89'] = generate;
  pkg.scripts['verify:v89'] = verify;
  write(pkgPath, JSON.stringify(pkg,null,2)+'\n');
}
let touched = 0;
for (const file of walk(ROOT)) {
  const fileRel = rel(file);
  let html = read(file);
  let next = injectPublic(fileRel, html);
  if (fileRel === 'ops/index.html') next = addOpsPanel(next);
  if (next !== html) { write(file, next); touched += 1; }
}
updatePackage();
console.log(`[V89] GA4 event depth applied. html=${walk(ROOT).length} touched=${touched} marker=${MARKER}`);
