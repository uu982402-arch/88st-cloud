#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'static-v68-mobile-title-hotfix-20260524';
const CSS_FILE = 'assets/css/v68.mobile-title-hotfix.css';
const JS_FILE = 'assets/js/v68.mobile-title-hotfix.js';
const REPORT_FILE = 'V68_MOBILE_TITLE_HOTFIX_REPORT.md';

function ensureDir(file){ fs.mkdirSync(path.dirname(file), { recursive: true }); }
function write(file, text){ ensureDir(file); fs.writeFileSync(file, text); }
function read(file){ return fs.readFileSync(file, 'utf8'); }
function routeFor(file){
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}
function allHtml(dir){
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes:true })){
    if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...allHtml(p));
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const css = `:root{--v68hf-bg:#03050a;--v68hf-panel:rgba(8,13,26,.82);--v68hf-line:rgba(255,255,255,.12);--v68hf-text:#f8fafc;--v68hf-sub:#aeb9ca;--v68hf-cyan:#67e8f9;--v68hf-gold:#f8d477;--v68hf-green:#22f45f;--v68hf-bottom:env(safe-area-inset-bottom,0px)}html,body{max-width:100%;overflow-x:hidden}body.v68-mobile-title-hotfix{background:radial-gradient(circle at 18% -10%,rgba(103,232,249,.18),transparent 30rem),radial-gradient(circle at 92% 0%,rgba(167,139,250,.14),transparent 28rem),linear-gradient(180deg,#03050a 0%,#07101d 48%,#02040a 100%)!important}.v68-header{border-bottom:1px solid rgba(255,255,255,.09)!important}.v68-main{padding-top:18px!important}.v68-section-head{margin-bottom:12px!important}.v68-section-head h1,.v68-section-head h2,.v68-intro h1,.v68-intro>h2,.v66-hero h1,.v67-hero h1,.hero h1,.page-hero h1,.hub-hero h1,.page-title,h1.page-title{display:none!important}.v68-section-head p,.v68-intro>p,.hero-subtitle,.page-subtitle,.hub-subtitle{font-size:14px!important;line-height:1.55!important;color:var(--v68hf-sub)!important;margin-top:0!important}.v68-kicker{min-height:28px!important;padding:0 10px!important;font-size:11px!important;letter-spacing:.08em!important}.v68-hero-grid{grid-template-columns:1fr!important;gap:14px!important}.v68-intro{padding:18px!important}.v68-command-strip{grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important}.v68-command-strip select{display:none!important}.v68-grid,.v68-grid.v68-grid-3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))!important;gap:12px!important}.v68-vendor-card{border-radius:24px!important;overflow:hidden!important}.v68-vendor-card__top strong{font-size:clamp(20px,5vw,28px)!important;letter-spacing:-.055em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.v68-vendor-card__top span{display:none!important}.v68-vendor-card__memo{font-size:13px!important;line-height:1.5!important;min-height:auto!important}.v68-vendor-card dl{grid-template-columns:repeat(2,minmax(0,1fr))!important}.v68-vendor-card dd{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.v68-vendor-card__actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}.v68-vendor-card__actions button,.v68-vendor-card__actions span{min-height:44px!important;border-radius:14px!important}.v68-tool-tile{color:#020617!important;background:linear-gradient(135deg,rgba(103,232,249,.96),rgba(248,212,119,.94))!important;border-color:rgba(255,255,255,.2)!important}.v68-tool-tile strong,.v68-tool-tile p,.v68-tool-tile span,.v68-tool-tile small{color:#020617!important;text-shadow:none!important;font-weight:950!important}.v68-fab{position:fixed!important;right:16px!important;bottom:calc(86px + var(--v68hf-bottom))!important;z-index:950!important;width:56px!important;height:56px!important;min-width:56px!important;max-width:56px!important;padding:0!important;border-radius:22px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:0!important;overflow:hidden!important;border:1px solid rgba(34,244,95,.45)!important;background:linear-gradient(135deg,#67e8f9,#22f45f)!important;box-shadow:0 18px 54px rgba(34,244,95,.25)!important;color:#03120a!important}.v68-fab strong,.v68-fab .fab-label{display:none!important}.v68-fab span{font-size:22px!important;line-height:1!important}.v68-mobile-nav{position:fixed!important;left:12px!important;right:12px!important;bottom:calc(10px + var(--v68hf-bottom))!important;z-index:940!important;width:auto!important;max-width:430px!important;margin:0 auto!important;transform:none!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;padding:7px!important;border-radius:23px!important;border:1px solid rgba(255,255,255,.12)!important;background:rgba(3,5,10,.91)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important;box-shadow:0 20px 70px rgba(0,0,0,.58)!important;overflow:hidden!important}.v68-mobile-nav a{min-width:0!important;min-height:52px!important;padding:0!important;border-radius:17px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;color:#b4c0d3!important;font-size:11px!important;font-weight:900!important;white-space:nowrap!important;text-decoration:none!important;transition:all .3s ease!important}.v68-mobile-nav a span{font-size:17px!important;line-height:1!important}.v68-mobile-nav a.is-active,.v68-mobile-nav a[aria-current=page]{color:#041014!important;background:linear-gradient(135deg,var(--v68hf-cyan),var(--v68hf-gold))!important;box-shadow:0 10px 26px rgba(103,232,249,.22)!important}.v68-footer{padding-bottom:calc(104px + var(--v68hf-bottom))!important}@media (min-width:721px){.v68-mobile-nav{display:none!important}.v68-fab{bottom:24px!important;width:auto!important;max-width:none!important;min-width:58px!important;padding:0 18px!important}.v68-fab strong{display:inline!important}.v68-main{padding-top:24px!important}}@media (max-width:720px){.v68-shell,.v68-header__inner,.v68-footer__inner{width:calc(100% - 24px)!important;max-width:100%!important}.v68-main{padding-bottom:calc(112px + var(--v68hf-bottom))!important}.v68-nav,.v68-header-cta{display:none!important}.v68-brand__mark{width:38px!important;height:38px!important}.v68-brand b{font-size:18px!important}.v68-brand em{font-size:14px!important}.v68-command-strip{display:grid!important;grid-template-columns:1fr!important}.v68-command-strip input,.v68-command-strip a,.v68-command-strip button{width:100%!important}.v68-metric-board{display:none!important}.v68-vendor-card dl{grid-template-columns:1fr 1fr!important;gap:8px!important}.v68-vendor-card{padding:16px!important}.v68-card,.v68-vendor-card,.v68-tool-tile,.v68-consult-panel,.v68-ops-box{border-radius:22px!important}.v68-section{margin-top:14px!important}}@media (max-width:360px){.v68-mobile-nav{left:8px!important;right:8px!important;gap:4px!important;padding:6px!important}.v68-mobile-nav a{font-size:10px!important;min-height:50px!important}.v68-vendor-card dl{grid-template-columns:1fr!important}}`;

const js = `(function(){
  var nav = document.querySelector('.v68-mobile-nav');
  if (nav) {
    var path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function(a){
      var route = a.getAttribute('data-v68-route') || a.getAttribute('href') || '/';
      var normalized = route.endsWith('/') ? route : route + '/';
      if (path === normalized || (normalized !== '/' && path.indexOf(normalized) === 0)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current','page');
      }
    });
    var lastY = window.scrollY || 0;
    window.addEventListener('scroll', function(){
      var y = window.scrollY || 0;
      if (y > 160 && y > lastY + 8) nav.style.transform = 'translateY(calc(100% + 24px))';
      else if (y < lastY - 8) nav.style.transform = 'translateY(0)';
      lastY = y;
    }, { passive:true });
  }
  document.documentElement.setAttribute('data-v68-mobile-title-hotfix','ready');
})();`;

function removeExistingMobileNav(html){
  html = html.replace(/\s*<nav\b[^>]*class="[^"]*v68-mobile-nav[^"]*"[\s\S]*?<\/nav>\s*/gi, '\n');
  html = html.replace(/\s*<nav\b[^>]*class="[^"]*mobile-nav[^"]*"[\s\S]*?<\/nav>\s*/gi, '\n');
  return html;
}
function removeExistingFab(html){
  html = html.replace(/\s*<a\b[^>]*class="[^"]*v68-fab[^"]*"[\s\S]*?<\/a>\s*/gi, '\n');
  html = html.replace(/\s*<a\b[^>]*class="[^"]*fab[^"]*"[\s\S]*?<\/a>\s*/gi, '\n');
  return html;
}
function ensureBodyClass(html){
  if (/<body[^>]*class="[^"]*"/i.test(html)) {
    return html.replace(/<body([^>]*)class="([^"]*)"([^>]*)>/i, (m,a,c,b) => `<body${a}class="${c.includes('v68-mobile-title-hotfix') ? c : c + ' v68-mobile-title-hotfix'}"${b}>`);
  }
  return html.replace(/<body([^>]*)>/i, '<body$1 class="v68-mobile-title-hotfix">');
}
function injectAssets(html){
  if (!html.includes(CSS_FILE)) html = html.replace('</head>', `  <link rel="stylesheet" href="/${CSS_FILE}?v=${VERSION}" data-v68-mobile-title-hotfix="true">\n</head>`);
  if (!html.includes(JS_FILE)) html = html.replace('</body>', `  <script src="/${JS_FILE}?v=${VERSION}" defer data-v68-mobile-title-hotfix="true"></script>\n</body>`);
  return html;
}
function publicMobileNav(){
  return `  <nav class="v68-mobile-nav" aria-label="모바일 하단 내비게이션"><a href="/" data-v68-route="/"><span>⌂</span>메인</a><a href="/blog/" data-v68-route="/blog/"><span>▤</span>블로그</a><a href="/tools/" data-v68-route="/tools/"><span>◇</span>도구</a><a href="/guaranteed/" data-v68-route="/guaranteed/"><span>◆</span>보증</a><a href="/consult/" data-v68-route="/consult/"><span>✦</span>상담</a></nav>\n`;
}
function publicFab(){
  return `  <a class="v68-fab" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer" aria-label="상담센터 바로가기" data-v68-click="fab-consult"><span>💬</span><strong>상담센터</strong></a>\n`;
}
function compactTopContent(html, route){
  if (route === '/guaranteed/') {
    html = html.replace(/<main id="main" class="v68-main">[\s\S]*?<section class="v68-shell v68-section"><div class="v68-card v68-intro"><span class="v68-kicker">AD OPERATIONS<\/span>[\s\S]*?<\/section><\/main>/, `<main id="main" class="v68-main"><section class="v68-shell v68-section" style="margin-top:0"><div class="v68-section-head"><div><span class="v68-kicker">GUARANTEED</span><p>업체명, 보증금액, 도메인, 가입코드만 바로 확인합니다.</p></div><a class="v68-primary" href="/consult/">상담센터</a></div><div class="v68-grid v68-grid-3"><article class="v68-vendor-card" data-v68-vendor="sk-holdings" style="--vendor-accent:#67e8f9"><a href="/guaranteed/sk-holdings/" data-v68-click="vendor-sk-holdings"><div class="v68-vendor-card__top"><strong>SK 홀딩스</strong><span>보증</span></div><p class="v68-vendor-card__memo">신규 입금 플러스와 VIP 이벤트 중심</p><dl><div><dt>보증금액</dt><dd>1억</dd></div><div><dt>도메인</dt><dd>sk-holdings.com</dd></div><div><dt>가입코드</dt><dd>IRON888</dd></div><div><dt>분류</dt><dd>스포츠·카지노</dd></div></dl><div class="v68-chip-row"><span>신규 플러스</span><span>VIP</span><span>빠른 상담</span></div><div class="v68-vendor-card__actions"><button type="button" data-v68-copy="IRON888">코드복사</button><span>상세보기</span></div></a></article><article class="v68-vendor-card" data-v68-vendor="queenbee" style="--vendor-accent:#f8d477"><a href="/guaranteed/queenbee/" data-v68-click="vendor-queenbee"><div class="v68-vendor-card__top"><strong>여왕벌</strong><span>보증</span></div><p class="v68-vendor-card__memo">테더, 미니게임, 신규 이벤트 확인</p><dl><div><dt>보증금액</dt><dd>1억</dd></div><div><dt>도메인</dt><dd>qb-700.com</dd></div><div><dt>가입코드</dt><dd>SEOA</dd></div><div><dt>분류</dt><dd>카지노·미니게임</dd></div></dl><div class="v68-chip-row"><span>USDT</span><span>미니게임</span><span>신규 혜택</span></div><div class="v68-vendor-card__actions"><button type="button" data-v68-copy="SEOA">코드복사</button><span>상세보기</span></div></a></article><article class="v68-vendor-card" data-v68-vendor="anybet" style="--vendor-accent:#a78bfa"><a href="/guaranteed/anybet/" data-v68-click="vendor-anybet"><div class="v68-vendor-card__top"><strong>ANY BET</strong><span>보증</span></div><p class="v68-vendor-card__memo">원화와 테더 상담 동선 분리</p><dl><div><dt>보증금액</dt><dd>1억</dd></div><div><dt>도메인</dt><dd>any-bet.com</dd></div><div><dt>가입코드</dt><dd>SEOA</dd></div><div><dt>분류</dt><dd>원화·테더</dd></div></dl><div class="v68-chip-row"><span>원화</span><span>USDT</span><span>페이백</span></div><div class="v68-vendor-card__actions"><button type="button" data-v68-copy="SEOA">코드복사</button><span>상세보기</span></div></a></article><article class="v68-vendor-card" data-v68-vendor="udt" style="--vendor-accent:#86efac"><a href="/guaranteed/udt/" data-v68-click="vendor-udt"><div class="v68-vendor-card__top"><strong>UDT BET</strong><span>보증</span></div><p class="v68-vendor-card__memo">파워볼과 미니게임 조건 확인</p><dl><div><dt>보증금액</dt><dd>1억</dd></div><div><dt>도메인</dt><dd>udt-bet.com</dd></div><div><dt>가입코드</dt><dd>SEOA</dd></div><div><dt>분류</dt><dd>파워볼·미니게임</dd></div></dl><div class="v68-chip-row"><span>파워볼</span><span>미니게임</span><span>상담 빠름</span></div><div class="v68-vendor-card__actions"><button type="button" data-v68-copy="SEOA">코드복사</button><span>상세보기</span></div></a></article><article class="v68-vendor-card" data-v68-vendor="ddangkong" style="--vendor-accent:#fb7185"><a href="/guaranteed/ddangkong/" data-v68-click="vendor-ddangkong"><div class="v68-vendor-card__top"><strong>땅콩 BET</strong><span>보증</span></div><p class="v68-vendor-card__memo">슬롯 RTP와 콤프 조건 안내</p><dl><div><dt>보증금액</dt><dd>1억</dd></div><div><dt>도메인</dt><dd>ddangkong.com</dd></div><div><dt>가입코드</dt><dd>DDK888</dd></div><div><dt>분류</dt><dd>카지노·슬롯</dd></div></dl><div class="v68-chip-row"><span>카지노</span><span>슬롯</span><span>콤프</span></div><div class="v68-vendor-card__actions"><button type="button" data-v68-copy="DDK888">코드복사</button><span>상세보기</span></div></a></article></div></section><section class="v68-shell v68-section"><div class="v68-card v68-intro"><span class="v68-kicker">CONSULT</span><p>주소와 코드를 확인한 뒤 상담센터에서 최종 조건을 확인하세요.</p><div class="v68-action-row"><a class="v68-primary" href="/consult/">상담센터 연결</a><a class="v68-secondary" href="/tools/official-check/">공식주소 확인</a></div></div></section></main>`);
  }
  return html;
}
function processHtml(html, route){
  html = ensureBodyClass(html);
  html = compactTopContent(html, route);
  html = removeExistingMobileNav(html);
  html = removeExistingFab(html);
  html = injectAssets(html);
  html = html.replace('</body>', publicFab() + publicMobileNav() + '</body>');
  html = html.replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"');
  return html;
}

write(path.join(ROOT, CSS_FILE), css + '\n');
write(path.join(ROOT, JS_FILE), js + '\n');
let touched = 0;
let htmlCount = 0;
for (const file of allHtml(ROOT)) {
  htmlCount += 1;
  const route = routeFor(file);
  const before = read(file);
  const after = processHtml(before, route);
  if (after !== before) {
    write(file, after);
    touched += 1;
  }
}
write(path.join(ROOT, REPORT_FILE), `# V68 Mobile Title Hotfix\n\n- HTML processed: ${htmlCount}\n- HTML changed: ${touched}\n- Fixed: mobile bottom nav clipping, FAB overlap, PC mobile nav leakage, top title visual removal, /guaranteed compact vendor layout.\n- Deleted files: 0\n`);
console.log(`[v68-hotfix] html=${htmlCount} changed=${touched}`);
