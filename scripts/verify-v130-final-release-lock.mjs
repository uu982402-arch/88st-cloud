import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const fail = [];
const warn = [];
const REMOVED_ROUTES = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const CORE_FILES = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','sitemap.xml','robots.txt'];
const VENDOR_FILES = ['guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const TOOL_LABELS = ['주소 확인','가입코드 확인','보너스 실수령','롤링 조건','배당 마진','기대값 계산','스포츠 분석','이벤트 조건','가입코드 매칭 체크 PRO','보너스 실수령 PRO','출금 조건 체크리스트','도메인 변경 메모장'];
const FORBIDDEN_UI_MARKERS = ['v36-related-links','v36-growth-hubs','v36-conversion-cta','v70-2-related','quick-resource-grid','pro-related','consult-motive-section','같이 보면 좋은 링크'];
const FORBIDDEN_INDEX = ['RUST QUICK CHECK','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed','class="v71-fab"','24H</'];
const FORBIDDEN_GUARANTEED = ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준','상담 전 최종 확인','COMMON CENTER','공통 확인 채널','상담센터 연결','상담 전 문의 템플릿','상담에서 재확인','v118-detail-consult','v96-2-contact'];

function file(p){ return path.join(ROOT, p); }
function exists(p){ return fs.existsSync(file(p)); }
function read(p){ return fs.readFileSync(file(p), 'utf8'); }
function walk(dir, out=[]){
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules','.git'].includes(name)) continue;
      walk(full, out);
    } else out.push(rel);
  }
  return out;
}
function assert(ok, msg){ if (!ok) fail.push(msg); }
function soft(ok, msg){ if (!ok) warn.push(msg); }

for (const f of CORE_FILES) assert(exists(f), `missing core file: ${f}`);
for (const f of VENDOR_FILES) assert(exists(f), `missing vendor file: ${f}`);
for (const r of REMOVED_ROUTES) {
  assert(!exists(r), `removed route directory exists: ${r}`);
  assert(!exists(`${r}.html`), `removed route file exists: ${r}.html`);
  assert(!exists(`${r}/index.html`), `removed route index exists: ${r}/index.html`);
}

const files = walk(ROOT);
const htmls = files.filter(p => p.endsWith('.html'));
assert(htmls.length >= 600, `unexpected html count: ${htmls.length}`);
assert(exists('assets/css/v130-final-release-lock.css'), 'missing v130 css');
assert(exists('reports/v130-final-release-audit.json'), 'missing final release audit');
assert(exists('reports/v130-deploy-checklist.md'), 'missing deploy checklist');
assert(exists('V130_PATCH_MANIFEST.json'), 'missing patch manifest');
assert(exists('V130_UPGRADE_REPORT.md'), 'missing upgrade report');

const index = exists('index.html') ? read('index.html') : '';
assert(index.includes('v130-final-release-lock'), 'index missing v130 meta/css marker');
assert(index.includes('data-v130-release-lock'), 'index missing v130 html/body marker');
assert(index.includes('data-v127-mobile-qa'), 'index missing v127 mobile marker');
assert(index.includes('data-v128-performance'), 'index missing v128 performance marker');
assert(index.includes('data-v129-seo-schema'), 'index missing v129 seo marker');
assert(index.includes('v129-seo-meta-og-schema-final'), 'index missing v129 seo meta marker');
for (const token of FORBIDDEN_INDEX) assert(!index.includes(token), `index forbidden token: ${token}`);

const tools = exists('tools/index.html') ? read('tools/index.html') : '';
for (const label of TOOL_LABELS) soft(tools.includes(label), `tool label not found in tools/index.html: ${label}`);

const guaranteedFiles = ['guaranteed/index.html', ...VENDOR_FILES];
for (const gf of guaranteedFiles) {
  const body = exists(gf) ? read(gf) : '';
  for (const token of FORBIDDEN_GUARANTEED) assert(!body.includes(token), `${gf} forbidden guaranteed token: ${token}`);
}

const siteMaps = ['sitemap.xml','sitemap.txt','serverless/sitemap.xml'].filter(exists).map(p => [p, read(p)]);
for (const [p, body] of siteMaps) {
  for (const r of REMOVED_ROUTES) assert(!body.includes(`/${r}`), `${p} contains removed route: ${r}`);
  for (const v of ['/guaranteed/sk-holdings/','/guaranteed/zakum/','/guaranteed/udt/','/guaranteed/queenbee/','/guaranteed/ddangkong/','/guaranteed/anybet/']) assert(body.includes(v), `${p} missing vendor url: ${v}`);
}

for (const p of htmls) {
  const body = read(p);
  for (const token of FORBIDDEN_UI_MARKERS) assert(!body.includes(token), `${p} forbidden bottom-related marker: ${token}`);
  if (/v114[._-]?2/i.test(body) || /generate-v114-2/i.test(body)) fail.push(`V114.2 marker in ${p}`);
}

let missingV130 = 0;
let missingSeo = 0;
for (const p of htmls) {
  const body = read(p);
  if (!body.includes('v130-final-release-lock') || !body.includes('data-v130-release-lock')) missingV130++;
  if (!/<title>[^<]+<\/title>/i.test(body) || !/<meta\s+name=["']description["']/i.test(body) || !/<link\s+rel=["']canonical["']/i.test(body) || !/property=["']og:title["']/i.test(body) || !/application\/ld\+json/i.test(body)) missingSeo++;
}
assert(missingV130 === 0, `${missingV130} html files missing V130 marker`);
assert(missingSeo === 0, `${missingSeo} html files missing SEO/OG/schema basics`);

const pkg = exists('package.json') ? JSON.parse(read('package.json')) : {};
assert(pkg.scripts?.verify === 'node scripts/verify-v130-final-release-lock.mjs', 'package verify is not V130');
assert(pkg.scripts?.['quality:v130'], 'missing quality:v130 script');
assert(pkg.scripts?.['verify:v130'], 'missing verify:v130 script');
assert(pkg.scripts?.build?.includes('generate-v130-final-release-lock.mjs'), 'build chain missing V130 generator');

if (warn.length) {
  console.log('[V130 WARN]');
  for (const w of warn) console.log('- ' + w);
}
if (fail.length) {
  console.error('[V130 VERIFY FAIL]');
  for (const f of fail) console.error('- ' + f);
  process.exit(1);
}
console.log('[V130 VERIFY PASS] FINAL RELEASE LOCK OK');
console.log(JSON.stringify({ html_count: htmls.length, core_files: CORE_FILES.length, vendors: VENDOR_FILES.length, warnings: warn.length }, null, 2));
