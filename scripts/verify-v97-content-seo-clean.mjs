import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const errors = [];
const read = f => fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : '';
const exists = f => fs.existsSync(path.join(root, f));
function walk(dir='.') {
  const out=[];
  for (const ent of fs.readdirSync(path.join(root,dir), {withFileTypes:true})) {
    const rel=path.posix.join(dir, ent.name).replace(/^\.\//,'');
    if (ent.isDirectory()) { if (!['node_modules','.git','.wrangler'].includes(ent.name)) out.push(...walk(rel)); }
    else if (ent.isFile()) out.push(rel);
  }
  return out;
}
const mustExist = [
  'assets/css/v97-content-seo-clean.css',
  'assets/js/v97-content-seo-clean.js',
  'assets/data/v97-content-seo-clean.json',
  'scripts/generate-v97-content-seo-clean.mjs',
  'scripts/verify-v97-content-seo-clean.mjs',
  'build.txt',
  'assets/js/build.ver.js',
  'robots.txt',
  'sitemap.xml',
  'sitemap.txt'
];
for (const f of mustExist) if (!exists(f)) errors.push(`missing file: ${f}`);
const pkg = JSON.parse(read('package.json') || '{}');
if (!pkg.scripts?.build?.includes('generate-v97-content-seo-clean.mjs')) errors.push('package build missing V97 generator');
if (pkg.scripts?.verify !== 'node scripts/verify-v97-content-seo-clean.mjs') errors.push('package verify is not V97 verifier');
if (!pkg.scripts?.['quality:v97'] || !pkg.scripts?.['verify:v97']) errors.push('package V97 helper scripts missing');
for (const [file, tokens] of Object.entries({
  'assets/css/v97-content-seo-clean.css':['V97 CONTENT / SEO CLEAN PATCH','v97-clean-badge','-webkit-line-clamp'],
  'assets/js/v97-content-seo-clean.js':['__RUST_V97_BUILD__','__RUST_SEO_CLEAN__','v97FallbackSummary'],
  'build.txt':['static-v97-content-seo-clean-20260526'],
  'assets/js/build.ver.js':['V97-CONTENT-SEO-CLEAN-20260526']
})) {
  const t = read(file);
  for (const token of tokens) if (!t.includes(token)) errors.push(`${file}: missing ${token}`);
}
const core = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html'];
for (const file of core) {
  const html = read(file);
  if (!html) { errors.push(`missing core page: ${file}`); continue; }
  for (const token of ['v97-content-seo-clean','v97-content-seo-clean.css','v97-content-seo-clean.js','<link rel="canonical"']) {
    if (!html.includes(token)) errors.push(`${file}: missing ${token}`);
  }
  if (!/<meta name="description" content="[^"]{35,180}">/.test(html)) errors.push(`${file}: missing clean length description`);
  if (!/<meta name="robots" content="index,follow,max-image-preview:large">/.test(html)) errors.push(`${file}: robots index marker missing`);
}
const blogHub = read('blog/index.html');
if (blogHub.includes('수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST.Cloud 전문 정보 문서입니다')) errors.push('blog hub still has old repeated generic summary');
if (!blogHub.includes('핵심 글 50개 우선 노출')) errors.push('blog hub chip text not cleaned');
const home = read('index.html');
if (home.includes('RUST 블로그는 토토사이트추천, 스포츠입플, 카지노입플, 미니게임입플사이트')) errors.push('home still has repeated generic blog summary');
if (!home.includes('주요 글 15개를 자동 순환')) errors.push('home blog intro not cleaned');
const sports = read('sports-check/index.html');
const search = read('search-guides/index.html');
if (sports.includes('큰 타이틀 배너와 반복 안내 섹션')) errors.push('sports-check still has generated scaffold text');
if (search.includes('큰 타이틀 배너와 반복 안내 섹션')) errors.push('search-guides still has generated scaffold text');
if (search.includes('기준 기준')) errors.push('search-guides still has duplicated 기준 기준 text');
const ops = read('ops/index.html');
const admin = read('admin/index.html');
if (ops && !/<meta name="robots" content="noindex,nofollow,noarchive">/.test(ops)) errors.push('ops page is not noindex');
if (admin && !/<meta name="robots" content="noindex,nofollow,noarchive">/.test(admin)) errors.push('admin page is not noindex');
const robots = read('robots.txt');
for (const line of ['Disallow: /admin/','Disallow: /ops/','Disallow: /api/','Disallow: /analysis/','Sitemap: https://88st.cloud/sitemap.xml']) if (!robots.includes(line)) errors.push(`robots missing ${line}`);
const sitemap = read('sitemap.xml');
if (sitemap.includes('https://88st.cloud/ops/') || sitemap.includes('https://88st.cloud/admin/') || sitemap.includes('https://88st.cloud/analysis/')) errors.push('sitemap contains noindex/admin/analysis routes');
if (!sitemap.includes('<lastmod>2026-05-26</lastmod>')) errors.push('sitemap lastmod not refreshed');
const htmlFiles = walk('.').filter(f => f.endsWith('.html'));
let missingCanonical = 0;
for (const f of htmlFiles) {
  const html = read(f);
  if (!/<link rel="canonical" href="https:\/\/88st\.cloud\//.test(html)) missingCanonical++;
}
if (missingCanonical) errors.push(`${missingCanonical} html files missing canonical`);
const forbidden = ['RUST MOTION HUB','신규 유입 확장 콘텐츠','토토·입플·보증업체·도구 연결 50개','페이지 하단의 내부 링크','관련 글과 다음 확인 루트','CONSULT FLOW','상담 전 필요한 정보','오늘 확인해야 할 것','상담 전 먼저 확인할 것','함께 확인할 글'];
for (const file of core.concat(['ops/index.html','admin/index.html'])) {
  const html = read(file);
  for (const phrase of forbidden) if (html.includes(phrase)) errors.push(`${file}: forbidden phrase detected: ${phrase}`);
}
let data = {};
try { data = JSON.parse(read('assets/data/v97-content-seo-clean.json') || '{}'); } catch { errors.push('V97 data json invalid'); }
if (data.version !== 'V97-CONTENT-SEO-CLEAN-20260526') errors.push('V97 data version mismatch');
if (!data.counts || data.counts.htmlFiles < 600) errors.push('V97 data counts look incomplete');
if (errors.length) {
  console.error('[V97 verify failed]');
  for (const e of errors) console.error('-', e);
  process.exit(1);
}
console.log(`[V97 verify ok] content/seo cleanup verified across ${htmlFiles.length} html files`);
