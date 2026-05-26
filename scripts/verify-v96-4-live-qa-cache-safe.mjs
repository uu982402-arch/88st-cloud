import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warn = [];
const read = (file) => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '';
const exists = (file) => fs.existsSync(path.join(root, file));

const criticalHtml = [
  'index.html',
  'blog/index.html',
  'tools/index.html',
  'guaranteed/index.html',
  'guaranteed/sk-holdings/index.html',
  'guaranteed/udt/index.html',
  'guaranteed/queenbee/index.html',
  'guaranteed/ddangkong/index.html',
  'guaranteed/anybet/index.html',
  'guaranteed/zakum/index.html',
  'consult/index.html',
  'sports-check/index.html',
  'search-guides/index.html',
  'ops/index.html'
];
const mustExist = [
  'assets/css/v96-4-live-qa-cache-safe.css',
  'assets/js/v96-4-live-qa-cache-safe.js',
  'assets/data/v96-4-live-qa-cache-safe.json',
  'scripts/generate-v96-4-live-qa-cache-safe.mjs',
  'scripts/verify-v96-4-live-qa-cache-safe.mjs',
  'assets/js/build.ver.js',
  'build.txt',
  '_headers'
];
for (const file of mustExist) if (!exists(file)) errors.push(`missing file: ${file}`);

const pkg = JSON.parse(read('package.json') || '{}');
if (!pkg.scripts?.build?.includes('generate-v96-4-live-qa-cache-safe.mjs')) errors.push('package build missing V96.4 generator');
if (pkg.scripts?.verify !== 'node scripts/verify-v96-4-live-qa-cache-safe.mjs') errors.push('package verify is not V96.4 verifier');
if (!pkg.scripts?.['quality:v96-4'] || !pkg.scripts?.['verify:v96-4']) errors.push('package V96.4 helper scripts missing');

const css = read('assets/css/v96-4-live-qa-cache-safe.css');
for (const token of ['V96.4 LIVE QA', 'overflow-x:hidden', 'v96-4-chrome-web', 'object-fit:contain', 'env(safe-area-inset-bottom', 'data-v964-overflow-guard']) {
  if (!css.includes(token)) errors.push(`V96.4 CSS missing token: ${token}`);
}
const js = read('assets/js/v96-4-live-qa-cache-safe.js');
for (const token of ['visualViewport', '__RUST_V96_4_BUILD__', '__RUST_LIVE_QA__', 'v96-4-chrome-web', 'orientationchange']) {
  if (!js.includes(token)) errors.push(`V96.4 JS missing token: ${token}`);
}

for (const file of criticalHtml) {
  if (!exists(file)) { errors.push(`missing critical html: ${file}`); continue; }
  const html = read(file);
  if (!html.includes('data-v96-4-live-qa-cache-safe="true"')) errors.push(`${file}: missing V96.4 asset marker`);
  if (!html.includes('V96_4_LIVE_QA_CACHE_SAFE_ACTIVE')) errors.push(`${file}: missing V96.4 meta`);
  if (!html.includes('rust-build-version')) errors.push(`${file}: missing rust build version meta`);
  if (!/viewport-fit=cover/.test(html)) errors.push(`${file}: missing viewport-fit=cover`);
  if (!/interactive-widget=resizes-content/.test(html)) errors.push(`${file}: missing interactive-widget`);
  if (!/class="[^"]*v96-4-live-qa-cache-safe/.test(html)) errors.push(`${file}: missing V96.4 body class`);
  if (!html.includes('v96-3-mobile-safe-layout.css?v=static-v96-3-mobile-safe-layout-20260526-v96-4-cache-safe')) errors.push(`${file}: V96.3 CSS query not cache-busted`);
  if (!html.includes('v96-3-mobile-safe-layout.js?v=static-v96-3-mobile-safe-layout-20260526-v96-4-cache-safe')) errors.push(`${file}: V96.3 JS query not cache-busted`);
}

const headers = read('_headers');
for (const token of ['/*', 'Cache-Control: public, max-age=0, must-revalidate', '/assets/*', 'Cache-Control: public, max-age=31536000, immutable', '/ops/*', 'X-Robots-Tag: noindex']) {
  if (!headers.includes(token)) errors.push(`_headers missing token: ${token}`);
}
if (/^\/build\.txt Cache-Control/m.test(headers)) errors.push('_headers still contains malformed single-line rule');

const buildTxt = read('build.txt');
if (!buildTxt.includes('static-v96-4-live-qa-cache-safe-20260526')) errors.push('build.txt missing V96.4 version');
if (!read('assets/js/build.ver.js').includes('static-v96-4-live-qa-cache-safe-20260526')) errors.push('build.ver.js missing V96.4 version');

const sitemap = read('sitemap.xml');
for (const route of ['/', '/blog/', '/tools/', '/guaranteed/', '/guaranteed/zakum/', '/consult/', '/sports-check/', '/search-guides/']) {
  if (!sitemap.includes(`https://88st.cloud${route}`)) errors.push(`sitemap missing ${route}`);
}
if (sitemap.includes('https://88st.cloud/ops/')) errors.push('sitemap should not include /ops/ because it is noindex');
const robots = read('robots.txt');
if (!robots.includes('Disallow: /ops/')) errors.push('robots missing /ops/ disallow');
const ops = read('ops/index.html');
if (!ops.includes('noindex,nofollow')) errors.push('/ops/ missing noindex meta');

const guaranteed = read('guaranteed/index.html');
for (const vendor of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!guaranteed.includes(`/guaranteed/${vendor}/`)) errors.push(`guaranteed index missing route: ${vendor}`);
}
for (const img of ['assets/img/guaranteed/cards/sk-holdings.webp','assets/img/guaranteed/cards/zakum.webp','assets/img/guaranteed/cards/udt-bet.webp','assets/img/guaranteed/cards/queenbee.webp','assets/img/guaranteed/cards/ddangkong-bet.webp','assets/img/guaranteed/cards/anybet.webp']) {
  if (!exists(img)) errors.push(`missing vendor image: ${img}`);
}

const forbidden = [
  'RUST MOTION HUB',
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개',
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  'CONSULT FLOW',
  '상담 전 필요한 정보',
  '오늘 확인해야 할 것',
  '상담 전 먼저 확인할 것',
  '함께 확인할 글'
];
for (const file of criticalHtml) {
  const html = read(file);
  for (const phrase of forbidden) if (html.includes(phrase)) errors.push(`${file}: forbidden phrase detected: ${phrase}`);
}

// Critical asset references must resolve locally for CSS/JS/image paths we own.
const assetRegex = /(?:href|src)="(\/(?:assets|img|favicon|apple-touch-icon|icon-192|icon-512)[^"?#]*)(?:[?#][^"]*)?"/g;
for (const file of criticalHtml) {
  const html = read(file);
  let m;
  while ((m = assetRegex.exec(html))) {
    const asset = m[1].replace(/^\//, '');
    if (!exists(asset)) errors.push(`${file}: missing referenced asset ${m[1]}`);
  }
}

if (errors.length) {
  console.error('[V96.4 verify failed]');
  for (const err of errors) console.error('-', err);
  if (warn.length) for (const item of warn) console.warn('warn:', item);
  process.exit(1);
}
console.log('[V96.4 verify ok] live QA/cache safe patch verified');
