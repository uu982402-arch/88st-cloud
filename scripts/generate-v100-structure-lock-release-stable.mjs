import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATE = '2026-05-26';
const VERSION = 'V100_STRUCTURE_LOCK_RELEASE_STABLE_ACTIVE';
const BUILD_ID = 'V100-STRUCTURE-LOCK-RELEASE-STABLE-20260526';
const SITE = 'https://88st.cloud';
const cssHref = `/assets/css/v100-structure-lock-release-stable.css?v=${BUILD_ID}`;
const jsSrc = `/assets/js/v100-structure-lock-release-stable.js?v=${BUILD_ID}`;
const SKIP_DIRS = new Set(['node_modules','.git','.wrangler']);
const coreRoutes = [
  { file:'index.html', url:'/' },
  { file:'blog/index.html', url:'/blog/' },
  { file:'tools/index.html', url:'/tools/' },
  { file:'guaranteed/index.html', url:'/guaranteed/' },
  { file:'consult/index.html', url:'/consult/' },
  { file:'sports-check/index.html', url:'/sports-check/' },
  { file:'search-guides/index.html', url:'/search-guides/' },
  { file:'ops/index.html', url:'/ops/', noindex:true },
  { file:'admin/index.html', url:'/admin/', noindex:true, redirect:'/ops/' }
];
const vendors = [
  { slug:'sk-holdings', name:'SK 홀딩스', code:'IRON888' },
  { slug:'zakum', name:'자쿰', code:'zk888' },
  { slug:'udt', name:'UDT BET', code:'SEOA' },
  { slug:'queenbee', name:'여왕벌', code:'SEOA' },
  { slug:'ddangkong', name:'땅콩 BET', code:'DDK888' },
  { slug:'anybet', name:'ANY BET', code:'SEOA' }
];
const forbiddenPhrases = [
  'RUST MOTION HUB', '신규 유입 확장 콘텐츠', '토토·입플·보증업체·도구 연결 50개',
  '페이지 하단의 내부 링크', '관련 글과 다음 확인 루트', 'CONSULT FLOW',
  '상담 전 필요한 정보', '오늘 확인해야 할 것', '상담 전 먼저 확인할 것', '함께 확인할 글'
];
const report = {
  version: BUILD_ID,
  date: DATE,
  htmlUpdated: 0,
  coreRoutes: [],
  vendors: [],
  cacheFiles: [],
  sitemapUrls: 0,
  forbiddenHits: [],
  notes: [
    'V99 FULL 기준 누적 구조 잠금 패치',
    '라우팅/보증업체/모바일 safe layout/캐시/SEO 마커 검증 체인 통합',
    '삭제 파일 없음'
  ]
};

const abs = p => path.join(ROOT, p);
const exists = p => fs.existsSync(abs(p));
const read = p => fs.readFileSync(abs(p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(abs(p)), { recursive:true }); fs.writeFileSync(abs(p), data); };
function walk(dir='.') {
  const out=[]; const base=abs(dir); if(!fs.existsSync(base)) return out;
  for(const ent of fs.readdirSync(base,{withFileTypes:true})){
    if(SKIP_DIRS.has(ent.name)) continue;
    const rel = path.posix.join(dir, ent.name).replace(/^\.\//,'');
    if(ent.isDirectory()) out.push(...walk(rel));
    else if(ent.isFile()) out.push(rel);
  }
  return out;
}
function urlForFile(file){
  let p=file.replace(/\\/g,'/').replace(/^\.\//,'');
  if(p==='index.html') return `${SITE}/`;
  if(p.endsWith('/index.html')) p=p.slice(0,-'index.html'.length);
  return `${SITE}/${p}`;
}
function esc(s=''){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function ensureMetaName(html, name, content, extra=''){
  const tag = `<meta name="${name}" content="${esc(content)}"${extra}>`;
  const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function ensureViewport(html){
  const content = 'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content';
  const tag = `<meta name="viewport" content="${content}">`;
  if(/<meta\s+name=["']viewport["'][^>]*>/i.test(html)) return html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, tag);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function ensureCss(html){
  const tag = `<link rel="stylesheet" href="${cssHref}" data-v100-structure-lock="true">`;
  if(/data-v100-structure-lock=["']true["'][^>]*rel=["']stylesheet/i.test(html) || html.includes('v100-structure-lock-release-stable.css')){
    return html.replace(/<link\s+[^>]*v100-structure-lock-release-stable\.css[^>]*>/i, tag);
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}
function ensureJs(html){
  const tag = `<script src="${jsSrc}" defer data-v100-structure-lock="true"></script>`;
  if(html.includes('v100-structure-lock-release-stable.js')) return html.replace(/<script\s+[^>]*v100-structure-lock-release-stable\.js[^>]*><\/script>/i, tag);
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `  ${tag}\n</body>`) : html + `\n${tag}\n`;
}
function ensureBodyMarker(html){
  return html.replace(/<body\b([^>]*)>/i, (m, attrs) => {
    let a = attrs;
    if(/class=["'][^"']*["']/i.test(a)) a = a.replace(/class=["']([^"']*)["']/i, (mm, cls) => `class="${Array.from(new Set((cls + ' v100-structure-lock-release').trim().split(/\s+/))).join(' ')}"`);
    else a += ' class="v100-structure-lock-release"';
    if(/data-v100-structure-lock=/i.test(a)) a = a.replace(/data-v100-structure-lock=["'][^"']*["']/i, 'data-v100-structure-lock="active"');
    else a += ' data-v100-structure-lock="active"';
    return `<body${a}>`;
  });
}
function ensureCanonical(html, file){
  const href = urlForFile(file);
  const tag = `<link rel="canonical" href="${href}">`;
  return /<link\s+rel=["']canonical["'][^>]*>/i.test(html) ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function ensureRobotsNoindex(html){
  const tag = '<meta name="robots" content="noindex,nofollow,noarchive">';
  if(/<meta\s+name=["']robots["'][^>]*>/i.test(html)) return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, tag);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function ensureAdminRedirect(html){
  if(!/<meta\s+http-equiv=["']refresh["'][^>]*url=\/ops\//i.test(html)){
    html = html.replace(/<head[^>]*>/i, m => `${m}\n  <meta http-equiv="refresh" content="0;url=/ops/">`);
  }
  if(!/location\.replace\(['"]\/ops\//.test(html)){
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `  <script>location.replace('/ops/');</script>\n</body>`) : html + `\n<script>location.replace('/ops/');</script>\n`;
  }
  return html;
}

function cleanForbiddenText(html){
  const replacements = new Map([
    ['RUST MOTION HUB','RUST 플랫폼'],
    ['신규 유입 확장 콘텐츠','검색 안내 콘텐츠'],
    ['토토·입플·보증업체·도구 연결 50개','핵심 안내 목록'],
    ['페이지 하단의 내부 링크','하단 참고 링크'],
    ['관련 글과 다음 확인 루트','연관 확인 루트'],
    ['CONSULT FLOW','상담 흐름'],
    ['상담 전 필요한 정보','상담 기본 정보'],
    ['오늘 확인해야 할 것','핵심 확인 항목'],
    ['상담 전 먼저 확인할 것','상담 기본 확인 항목'],
    ['함께 확인할 글','연관 자료']
  ]);
  for(const [from,to] of replacements) html = html.split(from).join(to);
  return html;
}
function ensureHeaderBottomMarkers(html){
  if(/<header\b/i.test(html) && !/data-rust-brand-header=["']true["']/i.test(html)){
    html = html.replace(/<header\b([^>]*)>/i, (m, attrs) => /data-rust-brand-header=/i.test(attrs) ? `<header${attrs}>` : `<header${attrs} data-rust-brand-header="true">`);
  }
  if(/<nav\b[^>]*(?:v79-mobile-nav|bottom-nav|mobile-bottom-nav|rust-mobile-nav)[^>]*>/i.test(html) && !/data-rust-nav=["']bottom["']/i.test(html)){
    html = html.replace(/<nav\b([^>]*(?:v79-mobile-nav|bottom-nav|mobile-bottom-nav|rust-mobile-nav)[^>]*)>/i, (m, attrs) => /data-rust-nav=/i.test(attrs) ? `<nav${attrs}>` : `<nav${attrs} data-rust-nav="bottom">`);
  }
  return html;
}

function processHtml(file){
  let html = read(file); const original=html;
  html = cleanForbiddenText(html);
  html = ensureHeaderBottomMarkers(html);
  html = ensureViewport(html);
  html = ensureMetaName(html, 'v100-structure-lock-release', VERSION, ' data-v100-structure-lock="true"');
  html = ensureMetaName(html, 'rust-build-version', BUILD_ID);
  html = ensureCss(html);
  html = ensureJs(html);
  html = ensureBodyMarker(html);
  if(coreRoutes.some(r => r.file === file) || file.startsWith('guaranteed/') || file.startsWith('blog/')) html = ensureCanonical(html, file);
  const core = coreRoutes.find(r => r.file === file);
  if(core?.noindex) html = ensureRobotsNoindex(html);
  if(file === 'admin/index.html') html = ensureAdminRedirect(html);
  if(html !== original){ write(file, html); report.htmlUpdated++; }
}
function writeAssets(){
  write('assets/css/v100-structure-lock-release-stable.css', `/* V100 STRUCTURE LOCK / RELEASE STABLE PATCH */\n:root{--rust-v100-release:"${BUILD_ID}";--rust-safe-bottom:env(safe-area-inset-bottom,0px)}\nhtml,body{width:100%;max-width:100%;overflow-x:clip;overscroll-behavior-x:none}\n@supports not (overflow:clip){html,body{overflow-x:hidden}}\nbody{min-height:100dvh;touch-action:manipulation}\nmain,.site-main,.main-shell,.page-shell,.content-wrap,.home-wrap,.rust-shell,.rust-page,.v72-blog-direct,.v73-tools-shell,.v74-guaranteed-shell,.v96-2-vendor-shell{width:100%;max-width:100%;min-width:0;box-sizing:border-box}\nimg,svg,video,canvas,iframe{max-width:100%;height:auto}\n[data-rust-nav="bottom"],.mobile-bottom-nav,.bottom-nav,.rust-mobile-nav{left:max(12px,env(safe-area-inset-left,0px));right:max(12px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));width:auto;max-width:none;box-sizing:border-box}\n.floating-action,.floating-cta,.rust-floating,.consult-floating{bottom:calc(96px + env(safe-area-inset-bottom,0px));right:max(16px,env(safe-area-inset-right,0px))}\n.vendor-strip,.guaranteed-slider,.v74-card-grid,.v96-5-vendor-strip{max-width:100%;min-width:0;overscroll-behavior-inline:contain}\n.v74-card,.guaranteed-card,.vendor-card,[data-vendor]{min-width:0;box-sizing:border-box}\n.v72-blog-grid,.blog-grid,.home-blog-grid{width:100%;max-width:100%;min-width:0;grid-template-columns:repeat(2,minmax(0,1fr))}\n@media(max-width:360px){.v72-blog-grid,.blog-grid,.home-blog-grid{grid-template-columns:1fr}}\n[data-v100-overflow-guard="true"]{overflow-x:hidden!important}\n`);
  write('assets/js/v100-structure-lock-release-stable.js', `(()=>{\n  const BUILD='${BUILD_ID}';\n  const root=document.documentElement;\n  root.dataset.rustBuild=BUILD;\n  root.dataset.v100StructureLock='active';\n  const setViewportVars=()=>{\n    const vv=window.visualViewport;\n    root.style.setProperty('--rust-vv-width', Math.round((vv?.width||window.innerWidth))+'px');\n    root.style.setProperty('--rust-vv-height', Math.round((vv?.height||window.innerHeight))+'px');\n    const overflow=Math.max(document.body?.scrollWidth||0, root.scrollWidth||0) - Math.ceil(window.innerWidth);\n    if(overflow>2){ document.body?.setAttribute('data-v100-overflow-guard','true'); root.setAttribute('data-v100-overflow-detected', String(overflow)); }\n    else { document.body?.removeAttribute('data-v100-overflow-guard'); root.removeAttribute('data-v100-overflow-detected'); }\n  };\n  setViewportVars();\n  window.addEventListener('resize', setViewportVars, {passive:true});\n  window.addEventListener('orientationchange', ()=>setTimeout(setViewportVars,180), {passive:true});\n  window.visualViewport?.addEventListener('resize', setViewportVars, {passive:true});\n  window.RUST_BUILD_VERSION=BUILD;\n  window.RUST_STRUCTURE_LOCK='V100';\n})();\n`);
  report.cacheFiles.push('assets/css/v100-structure-lock-release-stable.css','assets/js/v100-structure-lock-release-stable.js');
}
function writeManifest(){
  const manifest = {
    version: BUILD_ID,
    date: DATE,
    fixedRoutes: coreRoutes.map(r => ({...r, exists: exists(r.file)})),
    vendors: vendors.map(v => ({...v, detail:`/guaranteed/${v.slug}/`, file:`guaranteed/${v.slug}/index.html`, exists:exists(`guaranteed/${v.slug}/index.html`)})),
    requiredMarkers: ['v96-3-mobile-safe-layout','v96-4-live-qa-cache-safe','v96-5-guaranteed-conversion','v97-content-seo-clean','v98-performance-image','v99-blog-index-seo-quality','v100-structure-lock-release'],
    uploadMode: 'PATCH ZIP preferred, FULL ZIP retained as recovery baseline',
    deletionPolicy: 'deletedFiles=0'
  };
  write('assets/data/v100-structure-lock-release-stable.json', JSON.stringify(manifest,null,2));
}
function updateHeaders(){
  let h = exists('_headers') ? read('_headers') : '';
  if(!h.includes('/assets/*')) h += '\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n';
  if(!h.includes('/build.txt')) h += '\n/build.txt\n  Cache-Control: no-store, max-age=0\n';
  if(!h.includes('/assets/js/build.ver.js')) h += '\n/assets/js/build.ver.js\n  Cache-Control: no-store, max-age=0\n';
  for(const block of ['/api/*','/admin/*','/ops/*']){
    if(!h.includes(block)) h += `\n${block}\n  X-Robots-Tag: noindex, nofollow, noarchive\n`;
  }
  write('_headers', h.trimEnd()+'\n');
}
function updateRobots(){
  let r = exists('robots.txt') ? read('robots.txt') : 'User-agent: *\nAllow: /\nSitemap: https://88st.cloud/sitemap.xml\n';
  if(!/^User-agent:\s*\*/mi.test(r)) r = 'User-agent: *\n' + r;
  for(const line of ['Disallow: /analysis/','Disallow: /admin/','Disallow: /ops/','Disallow: /api/']){
    if(!r.includes(line)) r = r.replace(/User-agent:\s*\*\s*/i, m => `${m}${line}\n`);
  }
  if(!r.includes('Sitemap: https://88st.cloud/sitemap.xml')) r = r.trimEnd() + '\nSitemap: https://88st.cloud/sitemap.xml\n';
  write('robots.txt', r.trimEnd()+'\n');
}
function updateBuildFiles(){
  write('build.txt', `${BUILD_ID}\nbase=V99_BLOG_INDEX_SEO_QUALITY_FULL\ndate=${DATE}\n`);
  write('assets/js/build.ver.js', `window.RUST_BUILD_VERSION='${BUILD_ID}';\nwindow.RUST_BUILD_LABEL='V100 Structure Lock / Release Stable Patch';\nwindow.RUST_RELEASE_LOCK='stable';\n`);
}
function updateSitemap(){
  if(!exists('sitemap.xml')) return;
  let xml = read('sitemap.xml').replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${DATE}</lastmod>`);
  write('sitemap.xml', xml);
  if(exists('serverless/sitemap.xml')) write('serverless/sitemap.xml', xml);
  report.sitemapUrls = (xml.match(/<loc>/g)||[]).length;
}
function updatePackage(){
  const pkg = JSON.parse(read('package.json'));
  pkg.scripts ||= {};
  const step = 'node scripts/generate-v100-structure-lock-release-stable.mjs';
  if(!pkg.scripts.build.includes('generate-v100-structure-lock-release-stable.mjs')) pkg.scripts.build = `${pkg.scripts.build} && ${step}`;
  pkg.scripts.verify = 'node scripts/verify-v100-structure-lock-release-stable.mjs';
  pkg.scripts['quality:v100'] = step;
  pkg.scripts['verify:v100'] = 'node scripts/verify-v100-structure-lock-release-stable.mjs';
  write('package.json', JSON.stringify(pkg,null,2)+'\n');
}
function collectReport(){
  const guaranteed = exists('guaranteed/index.html') ? read('guaranteed/index.html') : '';
  report.coreRoutes = coreRoutes.map(r => ({ file:r.file, url:r.url, exists:exists(r.file), noindex:r.noindex||false }));
  report.vendors = vendors.map(v => ({ slug:v.slug, name:v.name, code:v.code, detailExists:exists(`guaranteed/${v.slug}/index.html`), hubLinks:(guaranteed.match(new RegExp(`/guaranteed/${v.slug}/`, 'g'))||[]).length }));
  const htmlFiles = walk('.').filter(f=>f.endsWith('.html'));
  for(const f of htmlFiles){
    const html=read(f);
    for(const phrase of forbiddenPhrases){ if(html.includes(phrase)) report.forbiddenHits.push({file:f, phrase}); }
  }
}

writeAssets();
writeManifest();
for(const file of walk('.').filter(f=>f.endsWith('.html'))) processHtml(file);
updateHeaders();
updateRobots();
updateBuildFiles();
updateSitemap();
updatePackage();
collectReport();
write('scripts/v100-structure-lock-release-stable-report.json', JSON.stringify(report,null,2));
console.log(`[V100 GENERATE PASS] htmlUpdated=${report.htmlUpdated} sitemapUrls=${report.sitemapUrls} vendors=${report.vendors.length}`);
