import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V139_3_BLOG_403_ROUTE_HOTFIX';
const GA4_ID = 'G-KWT87FBY6S';
function p(...parts){ return path.join(ROOT, ...parts); }
function rel(fp){ return path.relative(ROOT, fp).replace(/\\/g, '/'); }
function read(fp){ return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : ''; }
function write(fp, text){ fs.mkdirSync(path.dirname(fp), {recursive:true}); fs.writeFileSync(fp, text); changed.add(rel(fp)); }
function escReg(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const changed = new Set();

const problemBase = '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first';
const problemHtmlRoute = problemBase + '.html';
const problemCleanRoute = problemBase + '/';
const problemFile = p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html');
const problemCleanFile = p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html');

function ensureCss(h, cssPath){
  if(h.includes(cssPath)) return h;
  return h.replace('</head>', `<link rel="stylesheet" href="/${cssPath}">\n</head>`);
}
function ensureGa4(h){
  if(!h.includes('name="rust-ga4-id"') && !h.includes("name='rust-ga4-id'")){
    h = h.replace('</head>', `<meta name="rust-ga4-id" content="${GA4_ID}">\n</head>`);
  }
  if(!h.includes('/assets/js/v82.ga4-events.js')) h = h.replace('</body>', `<script src="/assets/js/v82.ga4-events.js" defer></script>\n</body>`);
  if(!h.includes('/assets/js/v89.ga4-event-depth.js')) h = h.replace('</body>', `<script src="/assets/js/v89.ga4-event-depth.js" defer></script>\n</body>`);
  return h;
}
function setCanonical(h, route){
  const url = 'https://88st.cloud' + route;
  if(/<link\b[^>]+rel=["']canonical["'][^>]*>/i.test(h)){
    h = h.replace(/<link\b[^>]+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}">`);
  } else h = h.replace('</head>', `<link rel="canonical" href="${url}">\n</head>`);
  h = h.replace(/<meta\b[^>]+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${url}">`);
  h = h.replaceAll('https://88st.cloud' + problemHtmlRoute, url);
  return h;
}
function markV139(h){
  if(!h.includes('data-v139-blog-quality="active"')){
    h = h.replace(/<body([^>]*)>/i, (m, attrs) => `<body${attrs} data-v139-blog-quality="active">`);
  }
  return h;
}
function fixHeaderLabels(h){
  return h.replace(/(<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>)\s*보증\s*(<\/a>)/g, '$1보증업체$2')
          .replace(/(<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*[^<]*?)(보증)(\s*<\/a>)/g, '$1보증업체$3');
}

if(!fs.existsSync(problemFile)){
  throw new Error('required blog source missing: ' + rel(problemFile));
}
let problem = read(problemFile);
problem = ensureCss(problem, 'assets/css/v139-blog-content-differentiation.css');
problem = ensureGa4(problem);
problem = markV139(problem);
problem = fixHeaderLabels(problem);
problem = setCanonical(problem, problemCleanRoute);
write(problemFile, problem);
write(problemCleanFile, problem);

// Blog list must no longer point at the direct .html route that produced a live 403 on Cloudflare.
const blogIndexFile = p('blog/index.html');
let blogIndex = read(blogIndexFile);
if(blogIndex){
  blogIndex = blogIndex.replaceAll(problemHtmlRoute, problemCleanRoute);
  blogIndex = ensureCss(blogIndex, 'assets/css/v139-blog-content-differentiation.css');
  blogIndex = ensureGa4(blogIndex);
  blogIndex = markV139(blogIndex);
  blogIndex = fixHeaderLabels(blogIndex);
  write(blogIndexFile, blogIndex);
}

// Create a safe overwrite for an old GitHub-only stale article that previously appeared in deploy logs.
const queenRoute = '/blog/queenbee-telegram-seoa69.html';
const queenTarget = '/search-guides/queenbee-seoa-code.html';
const queenFile = p('blog/queenbee-telegram-seoa69.html');
const queenHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>여왕벌 SEOA 코드 안내 이동 | RUST 블로그</title>
<meta name="robots" content="noindex,follow">
<meta name="description" content="이전 여왕벌 텔레그램 안내 글은 최신 여왕벌 SEOA 코드 검색가이드로 이동했습니다. 공식주소, 가입코드, 상담 연결 기준을 최신 페이지에서 확인하세요.">
<meta name="keywords" content="여왕벌, SEOA, 가입코드, 공식주소, 검색가이드, RUST, 러스트, 88st.cloud, 88ST, 보증업체">
<meta name="rust-ga4-id" content="${GA4_ID}">
<link rel="canonical" href="https://88st.cloud${queenTarget}">
<meta property="og:type" content="article"><meta property="og:site_name" content="RUST"><meta property="og:url" content="https://88st.cloud${queenTarget}"><meta property="og:title" content="여왕벌 SEOA 코드 안내 이동 | RUST 블로그"><meta property="og:description" content="이전 여왕벌 텔레그램 안내 글은 최신 여왕벌 SEOA 코드 검색가이드로 이동했습니다."><meta property="og:image" content="https://88st.cloud/assets/img/rust/rust-og.jpg">
<link rel="stylesheet" href="/assets/css/v139-blog-content-differentiation.css">
<meta http-equiv="refresh" content="0; url=${queenTarget}">
</head>
<body data-v139-blog-quality="active">
<header class="rust-header"><a href="/">RUST</a><nav><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav></header>
<main class="v135-post-shell" style="max-width:760px;margin:80px auto;padding:24px;color:#f8fafc;background:#111827;border:1px solid rgba(255,255,255,.12);border-radius:18px">
<h1>최신 여왕벌 SEOA 코드 안내로 이동합니다</h1>
<p>이전 블로그 경로는 최신 검색가이드로 통합됐습니다. 자동 이동되지 않으면 아래 버튼을 눌러 이동하세요.</p>
<p><a href="${queenTarget}" style="color:#fde68a">여왕벌 SEOA 코드 검색가이드 보기</a></p>
</main>
<script src="/assets/js/v82.ga4-events.js" defer></script>
<script src="/assets/js/v89.ga4-event-depth.js" defer></script>
</body>
</html>
`;
write(queenFile, queenHtml);

// SEO config keeps both the new clean route and stale safe overwrite explicit.
const seoFile = p('assets/config/seo.meta.json');
let seo = {};
try { seo = JSON.parse(read(seoFile) || '{}'); } catch { seo = {}; }
const problemMeta = seo[problemHtmlRoute] || {
  title: '미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유 | RUST 블로그',
  description: '미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유를 회차 독립성, 지급률, 손실한도, 정산 기준 중심으로 보강했습니다.',
  keywords: '미니게임 연패 위로금, 회차 제외 조건, 최소 참여금액, 신청 시간, 미니게임 롤링, RUST, 러스트, 88st.cloud, 88ST, 보증업체, 가입코드, 공식주소'
};
seo[problemCleanRoute] = problemMeta;
seo[problemHtmlRoute] = problemMeta;
seo[queenRoute] = {
  title: '여왕벌 SEOA 코드 안내 이동 | RUST 블로그',
  description: '이전 여왕벌 텔레그램 안내 글은 최신 여왕벌 SEOA 코드 검색가이드로 이동했습니다. 공식주소, 가입코드, 상담 연결 기준을 확인하세요.',
  keywords: '여왕벌, SEOA, 여왕벌 가입코드, 공식주소, 검색가이드, RUST, 러스트, 88st.cloud, 88ST, 보증업체'
};
write(seoFile, JSON.stringify(seo, null, 2) + '\n');

function ensureRedirects(file){
  let txt = read(file);
  const lines = [
    `${problemHtmlRoute} ${problemCleanRoute} 301`,
    `/blog/minigame/minigame-losing-streak-event-exclusion-condition-first ${problemCleanRoute} 301`,
    `${queenRoute} ${queenTarget} 301`,
    `/blog/queenbee-telegram-seoa69 ${queenTarget} 301`
  ];
  for(const line of lines){
    const from = line.split(/\s+/)[0];
    const re = new RegExp('^' + escReg(from) + '\\s+', 'm');
    if(!re.test(txt)) txt = line + '\n' + txt;
  }
  write(file, txt);
}
ensureRedirects(p('_redirects'));
if(fs.existsSync(p('serverless/_redirects'))) ensureRedirects(p('serverless/_redirects'));

// Worker-level redirect runs before ASSETS.fetch, preventing ASSETS 403 passthrough for stale/problem paths.
const workerFile = p('_worker.js');
let worker = read(workerFile);
if(worker && !worker.includes('V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS')){
  const block = `\nconst V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS = new Map([\n  ["${problemHtmlRoute}", "${problemCleanRoute}"],\n  ["/blog/minigame/minigame-losing-streak-event-exclusion-condition-first", "${problemCleanRoute}"],\n  ["${queenRoute}", "${queenTarget}"],\n  ["/blog/queenbee-telegram-seoa69", "${queenTarget}"]\n]);\n\nfunction v1393RouteHotfixRedirect(pathname) {\n  const target = V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS.get(pathname);\n  return target ? new Response(null, { status: 301, headers: { location: target, 'cache-control': 'no-store' } }) : null;\n}\n`;
  worker = worker.replace('export default {', block + '\nexport default {');
  worker = worker.replace('try {\n      if (url.pathname.startsWith("/api/")) {', 'try {\n      const v1393Redirect = v1393RouteHotfixRedirect(url.pathname);\n      if (v1393Redirect) return v1393Redirect;\n\n      if (url.pathname.startsWith("/api/")) {');
  write(workerFile, worker);
}

function updateSitemapTxt(file){
  let txt = read(file);
  if(!txt) return;
  txt = txt.split(/\r?\n/).filter(line => line.trim() !== 'https://88st.cloud' + problemHtmlRoute && line.trim() !== 'https://88st.cloud' + queenRoute).join('\n');
  if(!txt.includes('https://88st.cloud' + problemCleanRoute)) txt += '\nhttps://88st.cloud' + problemCleanRoute;
  write(file, txt.replace(/\n{3,}/g, '\n\n').trim() + '\n');
}
function updateSitemapXml(file){
  let txt = read(file);
  if(!txt) return;
  const oldUrl = 'https://88st.cloud' + problemHtmlRoute;
  const cleanUrl = 'https://88st.cloud' + problemCleanRoute;
  txt = txt.replace(new RegExp('\\s*<url><loc>' + escReg(oldUrl) + '<\\/loc><lastmod>[^<]*<\\/lastmod><\\/url>', 'g'), '');
  txt = txt.replace(new RegExp('\\s*<url><loc>' + escReg('https://88st.cloud' + queenRoute) + '<\\/loc><lastmod>[^<]*<\\/lastmod><\\/url>', 'g'), '');
  if(!txt.includes(`<loc>${cleanUrl}</loc>`)){
    txt = txt.replace('</urlset>', `  <url><loc>${cleanUrl}</loc><lastmod>2026-05-31</lastmod></url>\n</urlset>`);
  }
  write(file, txt);
}
for(const sm of ['sitemap.txt','serverless/sitemap.txt']) if(fs.existsSync(p(sm))) updateSitemapTxt(p(sm));
for(const sm of ['sitemap.xml','serverless/sitemap.xml']) if(fs.existsSync(p(sm))) updateSitemapXml(p(sm));

// Package script handoff.
const pkgFile = p('package.json');
let pkg = JSON.parse(read(pkgFile));
pkg.scripts = pkg.scripts || {};
pkg.scripts.build = 'node scripts/build-v139-3-cloudflare-pages-safe.mjs';
pkg.scripts.verify = 'node scripts/verify-v139-3-blog-403-route-hotfix.mjs';
pkg.scripts['quality:v139-3'] = 'node scripts/generate-v139-3-blog-403-route-hotfix.mjs';
pkg.scripts['verify:v139-3'] = 'node scripts/verify-v139-3-blog-403-route-hotfix.mjs';
write(pkgFile, JSON.stringify(pkg, null, 2) + '\n');

fs.mkdirSync(p('reports'), {recursive:true});
const audit = {
  ok: true,
  version: VERSION,
  purpose: 'Fix live 403 for V137/V139 blog detail and harden stale GitHub blog route handling.',
  problemRoute: problemHtmlRoute,
  cleanRoute: problemCleanRoute,
  staleRoute: queenRoute,
  staleTarget: queenTarget,
  changedFiles: [...changed].sort(),
  deletedFiles: [],
  generatedAt: new Date().toISOString()
};
write(p('reports/v139-3-blog-403-route-hotfix-audit.json'), JSON.stringify(audit, null, 2) + '\n');

const manifest = {
  version: VERSION,
  base: 'V139.2 upload resilient build hotfix',
  changedFiles: [...changed].sort(),
  deletedFiles: [],
  uploadMode: 'PATCH root overwrite; FULL full replacement',
  generatedAt: new Date().toISOString()
};
write(p('V139_3_PATCH_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
write(p('V139_3_UPGRADE_REPORT.md'), `# ${VERSION}\n\n- Fixed live 403-prone blog route by adding a clean directory route and worker/_redirects redirects.\n- Overwrote old GitHub-only queenbee telegram stale route with a noindex safe redirect page.\n- Kept V139 blog SEO/content differentiation, V139-1 GA4 stale repair, and V139-2 upload-resilient build chain.\n- Deleted files: 0\n\n## Changed files\n\n${[...changed].sort().map(f => '- ' + f).join('\n')}\n`);
changed.add('V139_3_UPGRADE_REPORT.md');
changed.add('V139_3_PATCH_MANIFEST.json');
console.log('[V139.3 GENERATE PASS]', JSON.stringify({ok:true, version:VERSION, changedFiles: changed.size, problemRoute: problemHtmlRoute, cleanRoute: problemCleanRoute, staleRoute: queenRoute}, null, 2));
