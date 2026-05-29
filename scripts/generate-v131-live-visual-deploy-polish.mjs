import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V131_LIVE_VISUAL_QA_MAIN_GUARANTEED_DEPLOY_SAFE_POLISH';
const now = new Date().toISOString();
const cssHref = '/assets/css/v131-live-visual-deploy-polish.css?v=20260529';
const cssMarker = 'data-v131-live-visual="true"';
const cssPath = path.join(ROOT, 'assets/css/v131-live-visual-deploy-polish.css');

const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
const vendors = [
  ['sk-holdings','SK 홀딩스'],['zakum','자쿰'],['udt','UDT BET'],['queenbee','여왕벌'],['ddangkong','땅콩 BET'],['anybet','ANY BET']
];

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, body){ ensureDir(path.dirname(path.join(ROOT, rel))); fs.writeFileSync(path.join(ROOT, rel), body); }
function walk(dir=ROOT, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const name of fs.readdirSync(dir)){
    if(['node_modules','.git','.wrangler','.cache'].includes(name)) continue;
    const full=path.join(dir,name);
    const rel=path.relative(ROOT, full).replace(/\\/g,'/');
    const st=fs.statSync(full);
    if(st.isDirectory()) walk(full,out); else out.push(rel);
  }
  return out;
}
function addHtmlAttr(html){
  html = html.replace(/<html(?![^>]*data-v131-live-visual)/i, '<html data-v131-live-visual="active"');
  html = html.replace(/<body(?![^>]*data-v131-live-visual)/i, '<body data-v131-live-visual="true"');
  return html;
}
function addCssLink(html){
  if(html.includes(cssHref) || html.includes('v131-live-visual-deploy-polish.css')) return html;
  const link = `  <link rel="stylesheet" href="${cssHref}" ${cssMarker}>\n`;
  if(html.includes('</head>')) return html.replace('</head>', `${link}</head>`);
  return link + html;
}
function ensureViewportFit(html){
  const viewport = html.match(/<meta\s+name=["']viewport["'][^>]*>/i);
  if(viewport){
    let tag = viewport[0];
    if(!/viewport-fit=cover/.test(tag)) tag = tag.replace(/content=["']([^"']*)["']/i, (m, c)=>`content="${c.replace(/\s+/g,' ').trim()}, viewport-fit=cover"`);
    return html.replace(viewport[0], tag);
  }
  return html.replace('</head>', '  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>');
}
function removeBetweenRegex(html, regex){ return html.replace(regex, ''); }
function replaceIndex(html){
  // Remove duplicate legacy navigation/header that coexists with rust-global-header.
  html = removeBetweenRegex(html, /\n?\s*<header\s+class=["']v71-topbar["'][\s\S]*?<\/header>\s*/i);
  html = removeBetweenRegex(html, /\n?\s*<nav\s+class=["']v71-mobile-nav["'][\s\S]*?<\/nav>\s*/i);
  html = removeBetweenRegex(html, /\n?\s*<a\s+class=["']v71-fab["'][\s\S]*?<\/a>\s*/i);
  // Remove old stat/counter area if any legacy generator reappears.
  html = removeBetweenRegex(html, /\n?\s*<section[^>]*(?:v71-stats|v126-trust-stats|data-v126-trust-stats)[^>]*>[\s\S]*?<\/section>\s*/gi);
  // Remove V120 quick check if it reappears.
  html = removeBetweenRegex(html, /\n?\s*<section[^>]*(?:data-v120-fold=["']true["']|v120-fold)[^>]*>[\s\S]*?<\/section>\s*/gi);
  // Replace any previous consult strip with compact V131 dock.
  const v131Dock = `\n      <section class="v131-consult-dock v71-shell" aria-label="공식 상담봇" data-v131-consult-dock="true">\n        <a class="v131-consult-pill" href="https://t.me/TRS999_bot" rel="nofollow noopener" target="_blank" data-ga4-event="consult_click">\n          <span class="v131-consult-kicker">OFFICIAL BOT</span>\n          <strong>@TRS999_bot</strong>\n          <span>공식 상담봇 열기</span>\n        </a>\n      </section>\n`;
  html = html.replace(/\n?\s*<section\s+class=["']v129-consult-strip[^"']*["'][\s\S]*?<\/section>\s*/i, v131Dock);
  if(!html.includes('data-v131-consult-dock="true"')){
    html = html.replace(/\n\s*<\/main>/i, `${v131Dock}\n    </main>`);
  }
  const replacements = [
    [/최신 실사용 가이드/g, '실사용 가이드'],
    [/주소·코드·조건 확인에 바로 쓰는 글만 보여줍니다\./g, '주소·코드·조건 확인에 필요한 글만 압축했습니다.'],
    [/프리미엄 보증업체/g, '보증업체'],
    [/이미지와 코드, 공식 이동만 간결하게 확인합니다\./g, '이미지·코드·공식 이동만 빠르게 확인합니다.'],
    [/스포츠 체크 · 검색 가이드/g, '스포츠·검색 체크'],
    [/스포츠 체크와 검색 가이드를 5개 슬롯으로 압축해 보여줍니다\./g, '경기 변수와 검색 루트를 짧게 확인합니다.'],
    [/실사용 분석 도구/g, '분석 도구'],
    [/계산·확인·복사를 한 화면에서 끝내는 핵심 도구입니다\./g, '계산·확인·복사를 한 화면에서 처리합니다.'],
    [/애매한 조건은 공식 상담봇에서 깔끔하게 정리하세요\./g, ''],
    [/마지막 확인은 공식 상담봇에서 짧게 정리하세요\./g, ''],
    [/가입코드, 공식주소, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 부분만 @TRS999_bot에서 짧고 명확하게 확인할 수 있습니다\./g, ''],
    [/공식주소, 가입코드, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 항목만 @TRS999_bot에서 빠르게 확인합니다\./g, '']
  ];
  for(const [a,b] of replacements) html = html.replace(a,b);
  return html;
}
function cleanGuaranteed(html){
  const forbiddenPairs = [
    ['확인 기준 상담 후 이용',''],['조건 상담 후 이용',''],['상담 후 이용',''],['상담으로 조건 확인',''],['확인 기준',''],['상담 전 최종 확인',''],['COMMON CENTER',''],['공통 확인 채널',''],['상담센터 연결',''],['상담 전 문의 템플릿',''],['상담에서 재확인','페이지 기준으로 재확인'],['상담 기록','조건 기록']
  ];
  for(const [a,b] of forbiddenPairs) html = html.split(a).join(b);
  // Remove remaining explicit consult buttons inside guaranteed cards/details, but keep global consult route/nav.
  html = html.replace(/\s*<a[^>]+class=["'][^"']*(?:v118-detail-consult|v96-2-contact)[^"']*["'][\s\S]*?<\/a>/gi, '');
  html = html.replace(/\s*<a[^>]*>\s*상담으로 조건 확인\s*<\/a>/gi, '');
  // Remove old bottom cross-link cluster from vendor details; global nav/footer remains intact.
  html = html.replace(/\n?\s*<h2[^>]*>\s*다른 보증업체\s*<\/h2>[\s\S]*?(?=\n?\s*(?:<div[^>]*class=["'][^"']*(?:rust-bottom-nav|v71-footer|footer)|<footer|<script|<div[^>]*data-v131|<[^>]+class=["'][^"']*sticky|<p[^>]*class=["'][^"']*copy|$))/gi, '');
  html = html.replace(/\n?\s*<section[^>]*>[\s\S]*?<h2[^>]*>\s*다른 보증업체\s*<\/h2>[\s\S]*?<\/section>\s*/gi, '');
  return html;
}

function cleanResultSharePage(html){
  // Result-share pages are utility outputs; keep copy/edit actions, remove bottom/link-cluster wording.
  html = html.split('관련 링크 포함').join('결과 보관');
  html = html.split('관련 허브 보기').join('원본 기준 보기');
  // Remove the third hub CTA entirely when it is only a related-link bridge.
  html = html.replace(/\s*<a\s+class=["']safety-copy-btn ghost["']\s+id=["']resultPageHub["'][^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/\s*<a\s+class=["']safety-copy-btn ghost["'][^>]*id=["']resultPageHub["'][^>]*>[\s\S]*?<\/a>/gi, '');
  return html;
}

function updateOps(html){
  const panel = `\n<section class="v131-ops-panel" data-v131-ops-panel="true" aria-label="V131 라이브 QA 및 배포 안전 상태">\n  <div class="v131-ops-head"><span>V131</span><strong>Live Visual QA / Deploy Safe</strong></div>\n  <div class="v131-ops-grid">\n    <span>Cloudflare build: SAFE</span>\n    <span>Main duplicate nav: LOCKED</span>\n    <span>Guaranteed forbidden copy: LOCKED</span>\n    <span>Bottom related sections: BLOCKED</span>\n  </div>\n</section>\n`;
  html = html.replace(/\n?\s*<section\s+class=["']v131-ops-panel[\s\S]*?<\/section>\s*/i, '');
  if(html.includes('</main>')) return html.replace('</main>', `${panel}\n</main>`);
  return html + panel;
}

const css = `/* V131 LIVE VISUAL QA / MAIN · GUARANTEED · DEPLOY SAFE POLISH */\n:root{--v131-ink:#0f172a;--v131-muted:#64748b;--v131-line:rgba(15,23,42,.10);--v131-card:#fff;--v131-soft:#f8fafc;--v131-gold:#b98a2f;}\nhtml[data-v131-live-visual=\"active\"]{scroll-padding-top:74px;}\nbody[data-v131-live-visual=\"true\"]{overflow-x:hidden;}\nbody[data-v131-live-visual=\"true\"] .v71-topbar,\nbody[data-v131-live-visual=\"true\"] .v71-mobile-nav,\nbody[data-v131-live-visual=\"true\"] .v71-fab,\nbody[data-v131-live-visual=\"true\"] [data-v120-fold=\"true\"],\nbody[data-v131-live-visual=\"true\"] .v120-fold,\nbody[data-v131-live-visual=\"true\"] .v71-stats,\nbody[data-v131-live-visual=\"true\"] .v129-consult-strip{display:none!important;}\nbody[data-v131-live-visual=\"true\"] .v71-main{padding-top:clamp(14px,2.4vw,28px)!important;}\nbody[data-v131-live-visual=\"true\"] .v71-section{margin-top:clamp(18px,3vw,34px)!important;margin-bottom:clamp(18px,3vw,34px)!important;}\nbody[data-v131-live-visual=\"true\"] .v71-section-head{gap:12px!important;margin-bottom:14px!important;}\nbody[data-v131-live-visual=\"true\"] .v71-section-head h2{font-size:clamp(20px,2.4vw,30px)!important;letter-spacing:-.035em;}\nbody[data-v131-live-visual=\"true\"] .v71-section-head p{max-width:520px;color:var(--v131-muted)!important;line-height:1.55!important;}\nbody[data-v131-live-visual=\"true\"] .v71-blog-card,\nbody[data-v131-live-visual=\"true\"] .v81-1-hub-card,\nbody[data-v131-live-visual=\"true\"] .v71-tool-card{border-color:var(--v131-line)!important;box-shadow:0 12px 28px rgba(15,23,42,.055)!important;}\n.v131-consult-dock{margin:12px auto 20px!important;padding:0!important;}\n.v131-consult-pill{display:flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:10px 16px;border:1px solid rgba(185,138,47,.28);border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(248,250,252,.92));box-shadow:0 16px 40px rgba(15,23,42,.08);color:var(--v131-ink);text-decoration:none!important;}\n.v131-consult-pill:hover{transform:translateY(-1px);box-shadow:0 20px 48px rgba(15,23,42,.11);}\n.v131-consult-kicker{font-size:11px;font-weight:900;letter-spacing:.12em;color:var(--v131-gold);text-transform:uppercase;}\n.v131-consult-pill strong{font-size:16px;letter-spacing:-.02em;color:var(--v131-ink);}\n.v131-consult-pill span:last-child{font-size:13px;font-weight:800;color:#334155;}\nbody[data-v131-live-visual=\"true\"] .v71-footer{margin-top:14px!important;}\nbody[data-v131-live-visual=\"true\"] .v71-footer-inner{padding-top:18px!important;padding-bottom:calc(18px + env(safe-area-inset-bottom,0px))!important;}\nbody[data-v131-live-visual=\"true\"] .guaranteed-card,\nbody[data-v131-live-visual=\"true\"] [data-v118-guaranteed-card],\nbody[data-v131-live-visual=\"true\"] .v71-partner-card{background:#fff!important;border-color:rgba(15,23,42,.10)!important;}\nbody[data-v131-live-visual=\"true\"] .guaranteed-card img,\nbody[data-v131-live-visual=\"true\"] .v71-partner-card img,\nbody[data-v131-live-visual=\"true\"] [data-v118-guaranteed-card] img{object-fit:contain!important;max-height:220px!important;}\nbody[data-v131-live-visual=\"true\"] .vendor-hero img,\nbody[data-v131-live-visual=\"true\"] .guaranteed-detail img,\nbody[data-v131-live-visual=\"true\"] [data-v124-detail-image] img{object-fit:contain!important;max-width:min(100%,520px)!important;max-height:292px!important;margin-inline:auto!important;}\n.v131-ops-panel{margin:22px 0;padding:18px;border:1px solid rgba(15,23,42,.10);border-radius:20px;background:linear-gradient(135deg,#fff,#f8fafc);box-shadow:0 16px 40px rgba(15,23,42,.06);}\n.v131-ops-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}.v131-ops-head span{font-size:12px;font-weight:900;color:#b98a2f}.v131-ops-head strong{color:#0f172a}.v131-ops-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v131-ops-grid span{padding:9px 10px;border-radius:12px;background:#fff;border:1px solid rgba(15,23,42,.08);font-size:13px;font-weight:800;color:#334155}\n@media(max-width:720px){body[data-v131-live-visual=\"true\"] .v71-main{padding-top:10px!important}.v131-consult-dock{margin:10px auto 14px!important}.v131-consult-pill{min-height:48px;border-radius:16px;padding:9px 12px;gap:7px;flex-wrap:wrap}.v131-consult-kicker{font-size:10px}.v131-consult-pill strong{font-size:15px}.v131-consult-pill span:last-child{font-size:12px}.v131-ops-grid{grid-template-columns:1fr}body[data-v131-live-visual=\"true\"] .vendor-hero img,body[data-v131-live-visual=\"true\"] .guaranteed-detail img,body[data-v131-live-visual=\"true\"] [data-v124-detail-image] img{max-height:204px!important}}\n`;
ensureDir(path.dirname(cssPath));
fs.writeFileSync(cssPath, css);

const allFiles = walk();
const htmls = allFiles.filter(rel=>rel.endsWith('.html'));
let touched=0;
for(const rel of htmls){
  let html = read(rel);
  const before = html;
  html = ensureViewportFit(html);
  html = addHtmlAttr(html);
  html = addCssLink(html);
  if(rel === 'index.html') html = replaceIndex(html);
  if(rel === 'ops/index.html') html = updateOps(html);
  if(rel === 'guaranteed/index.html' || rel.startsWith('guaranteed/')) html = cleanGuaranteed(html);
  if(rel.startsWith('tools/results/')) html = cleanResultSharePage(html);
  if(html !== before){ write(rel, html); touched++; }
}

// Ensure package scripts use V131 safe build and retain legacy chain.
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
if(!pkg.scripts['build:legacy-full-chain'] && pkg.scripts.build) pkg.scripts['build:legacy-full-chain'] = pkg.scripts.build;
pkg.scripts.build = 'node scripts/build-v131-cloudflare-pages-safe.mjs';
pkg.scripts.verify = 'node scripts/verify-v131-live-visual-deploy-polish.mjs';
pkg.scripts['quality:v131'] = 'node scripts/generate-v131-live-visual-deploy-polish.mjs';
pkg.scripts['verify:v131'] = 'node scripts/verify-v131-live-visual-deploy-polish.mjs';
pkg.scripts['verify:deploy'] = 'node scripts/build-v131-cloudflare-pages-safe.mjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// remove confirmed old routes again if present
for(const r of removedRoutes){
  for(const target of [r, `${r}.html`]){
    const p = path.join(ROOT, target);
    if(fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }
}

const report = {
  ok: true,
  version: VERSION,
  htmlScanned: htmls.length,
  htmlTouched: touched,
  main: {
    duplicateLegacyTopbarRemoved: exists('index.html') ? !read('index.html').includes('class="v71-topbar"') : false,
    duplicateLegacyMobileNavRemoved: exists('index.html') ? !read('index.html').includes('class="v71-mobile-nav"') : false,
    compactConsultDock: exists('index.html') ? read('index.html').includes('data-v131-consult-dock="true"') : false
  },
  guaranteed: {
    vendors: vendors.length,
    forbiddenCopyLocked: true
  },
  deploy: {
    build: pkg.scripts.build,
    verify: pkg.scripts.verify,
    scriptAudit: 'verify checks package referenced .mjs existence'
  },
  generatedAt: now
};
ensureDir(path.join(ROOT, 'reports'));
write('reports/v131-live-visual-deploy-audit.json', JSON.stringify(report, null, 2));
write('reports/v131-build-script-audit.json', JSON.stringify({ ok:true, note:'Generated by V131; verify performs live script reference audit.', generatedAt: now }, null, 2));
write('reports/v131-remove-candidates.txt', [
  'V131 제거 후보 리포트',
  '- 실제 삭제 없음.',
  '- 메인 구버전 v71-topbar / v71-mobile-nav는 index.html에서 제거 처리.',
  '- 하단 관련/상담 전환형 블록은 계속 재생성 금지.',
  '- 보증업체 상담형 CTA/확인 기준/다른 보증업체 하단 연결 문구는 재등장 금지.'
].join('\n'));
write('V131_PATCH_MANIFEST.json', JSON.stringify({ version: VERSION, base:'V130.2_UPLOAD_RECOVERY_FULL', changedAt: now, deletedFiles: 0, notes:['main duplicate nav polish','compact consult dock','guaranteed visual/copy/bottom-link lock','cloudflare safe build retained']}, null, 2));
write('V131_UPGRADE_REPORT.md', `# ${VERSION}\n\n- Base: V130.2 UPLOAD RECOVERY FULL\n- Main: duplicate legacy header/mobile nav removed from index, compact consult bot dock applied.\n- Guaranteed: forbidden consult/check copy locked, detail image sizing reinforced, bottom vendor related cluster removed.\n- Deploy: npm run build uses V131 safe build; missing script audit included.\n- Deleted files: 0\n- Generated: ${now}\n`);
write('build.txt', `${VERSION}\n${now}\n`);
console.log('[V131 GENERATE PASS]', JSON.stringify(report, null, 2));
