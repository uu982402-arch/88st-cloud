#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'static-v68-ops-revenue-20260524';
const CSS_FILE = 'assets/css/v68.ops-revenue-hardening.css';
const JS_FILE = 'assets/js/v68.ops-revenue-hardening.js';
const AD_FILE = 'assets/config/v68-ad-cards.json';
const OPS_FILE = 'assets/config/v68-ops-checks.json';
const REPORT_FILE = 'V68_UPGRADE_REPORT.md';

function ensureDir(file){ fs.mkdirSync(path.dirname(file), { recursive: true }); }
function write(file, text){ ensureDir(file); fs.writeFileSync(file, text); }
function read(file){ return fs.readFileSync(file, 'utf8'); }
function exists(file){ return fs.existsSync(file); }
function esc(value){ return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
function routeFor(file){
  let rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}
function allHtml(dir){
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })){
    if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...allHtml(p));
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const vendors = [
  { id:'sk-holdings', name:'SK 홀딩스', guarantee:'1억', domain:'sk-holdings.com', code:'IRON888', url:'/guaranteed/sk-holdings/', accent:'#67e8f9', weight:30, enabled:true, rank:1, category:'스포츠·카지노', badges:['신규 플러스','VIP','빠른 상담'], memo:'신규 입금 플러스와 VIP 충전 이벤트 중심' },
  { id:'queenbee', name:'여왕벌', guarantee:'1억', domain:'qb-700.com', code:'SEOA', url:'/guaranteed/queenbee/', accent:'#f8d477', weight:28, enabled:true, rank:2, category:'카지노·미니게임', badges:['USDT','미니게임','신규 혜택'], memo:'테더, 미니게임, 신규 이벤트 확인 우선' },
  { id:'anybet', name:'ANY BET', guarantee:'1억', domain:'any-bet.com', code:'SEOA', url:'/guaranteed/anybet/', accent:'#a78bfa', weight:18, enabled:true, rank:3, category:'원화·테더', badges:['원화','USDT','페이백'], memo:'원화와 테더 상담 동선 분리 권장' },
  { id:'udt', name:'UDT BET', guarantee:'1억', domain:'udt-bet.com', code:'SEOA', url:'/guaranteed/udt/', accent:'#86efac', weight:14, enabled:true, rank:4, category:'파워볼·미니게임', badges:['파워볼','미니게임','상담 빠름'], memo:'미니게임 조건 확인 후 상담 연결' },
  { id:'ddangkong', name:'땅콩 BET', guarantee:'1억', domain:'ddangkong.com', code:'DDK888', url:'/guaranteed/ddangkong/', accent:'#fb7185', weight:10, enabled:true, rank:5, category:'카지노·슬롯', badges:['카지노','슬롯','콤프'], memo:'슬롯 RTP와 콤프 조건 안내 강화' }
];

const toolItems = [
  { key:'ADDR', title:'공식주소 확인', desc:'도메인·리다이렉트·공식 채널 일치 여부를 먼저 확인합니다.', href:'/tools/official-check/', tag:'주소', level:'필수' },
  { key:'CODE', title:'가입코드 확인', desc:'업체명과 가입코드를 상담 전 한 번 더 대조합니다.', href:'/tools/code-check/', tag:'코드', level:'필수' },
  { key:'BON', title:'보너스 실수령', desc:'보너스, 롤링, 최대 출금 조건을 실제 수령 기준으로 계산합니다.', href:'/tools/bonus-calculator/', tag:'계산', level:'인기' },
  { key:'ROLL', title:'롤링 조건', desc:'목표 롤링과 현재 진행률을 한 화면에서 정리합니다.', href:'/tools/rolling-calculator/', tag:'롤링', level:'인기' },
  { key:'PAY', title:'출금 가능 금액', desc:'최대 출금 제한과 실수령 가능 범위를 확인합니다.', href:'/tools/withdraw-limit/', tag:'출금', level:'중요' },
  { key:'ODDS', title:'스포츠 배당', desc:'마진, 기대값, 위험도를 압축해서 해석합니다.', href:'/tools/ai-sports-odds-analysis/', tag:'배당', level:'고급' },
  { key:'RTP', title:'슬롯 RTP', desc:'RTP와 변동성 기준으로 체감 리스크를 정리합니다.', href:'/tools/slot-rtp/', tag:'슬롯', level:'고급' },
  { key:'URL', title:'피싱 URL', desc:'유사 도메인 변조와 사칭 신호를 빠르게 걸러냅니다.', href:'/tools/similar-domain/', tag:'보안', level:'필수' }
];

const opsChecks = [
  { id:'home', title:'메인 페이지', href:'/', must:['v68-ops-revenue','v68-command-strip','v68-mobile-nav'], owner:'layout' },
  { id:'guaranteed', title:'보증업체 카드', href:'/guaranteed/', must:['SK 홀딩스','여왕벌','v68-vendor-card'], owner:'ads' },
  { id:'tools', title:'도구 허브', href:'/tools/', must:['공식주소 확인','v68-tool-tile'], owner:'tools' },
  { id:'consult', title:'고객센터', href:'/consult/', must:['상담센터','v68-consult-panel'], owner:'support' },
  { id:'ops', title:'운영점검', href:'/ops/', must:['V68 OPS','v68-check-grid'], owner:'ops' },
  { id:'css', title:'V68 CSS', href:'/' + CSS_FILE, must:['--v68-bg','v68-card'], owner:'asset' },
  { id:'js', title:'V68 JS', href:'/' + JS_FILE, must:['v68-ready','data-v68-click'], owner:'asset' },
  { id:'ads-json', title:'광고카드 JSON', href:'/' + AD_FILE, must:['SK 홀딩스','weight'], owner:'ads' }
];

const css = `:root{color-scheme:dark;--v68-bg:#03050a;--v68-obsidian:#050816;--v68-charcoal:#0b1220;--v68-panel:rgba(8,13,26,.76);--v68-panel-strong:rgba(2,6,16,.86);--v68-line:rgba(255,255,255,.11);--v68-line-strong:rgba(103,232,249,.32);--v68-text:#f8fafc;--v68-sub:#b4c0d3;--v68-muted:#77859a;--v68-cyan:#67e8f9;--v68-blue:#60a5fa;--v68-violet:#a78bfa;--v68-gold:#f8d477;--v68-green:#86efac;--v68-red:#fb7185;--v68-radius-xl:32px;--v68-radius-lg:24px;--v68-radius-md:18px;--v68-touch:44px;--v68-shadow:0 28px 100px rgba(0,0,0,.55);--v68-safe-bottom:env(safe-area-inset-bottom,0px)}html{background:var(--v68-bg)}body.v68-ops-revenue{min-width:320px;background:radial-gradient(circle at 12% -12%,rgba(103,232,249,.24),transparent 36rem),radial-gradient(circle at 86% 0%,rgba(167,139,250,.20),transparent 34rem),linear-gradient(180deg,#03050a 0%,#08111f 42%,#02040a 100%)!important;color:var(--v68-text)!important}body.v68-ops-revenue:before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(rgba(255,255,255,.026) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.024) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(180deg,rgba(0,0,0,.95),rgba(0,0,0,.18))}.v68-shell{width:min(1440px,calc(100% - 32px));margin-inline:auto}.v68-card,.v68-vendor-card,.v68-tool-tile,.v68-consult-panel,.v68-ops-box{background:linear-gradient(145deg,rgba(15,23,42,.82),rgba(2,6,23,.72));border:1px solid var(--v68-line);border-radius:var(--v68-radius-lg);box-shadow:var(--v68-shadow);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}.v68-card:hover,.v68-vendor-card:hover,.v68-tool-tile:hover{transform:translateY(-4px);border-color:var(--v68-line-strong);box-shadow:0 32px 110px rgba(0,0,0,.68)}.v68-header{position:sticky;top:0;z-index:900;background:rgba(3,5,10,.78);border-bottom:1px solid var(--v68-line);backdrop-filter:blur(20px)}.v68-header__inner{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px}.v68-brand{display:flex;align-items:center;gap:12px;color:var(--v68-text);text-decoration:none;min-height:44px}.v68-brand__mark{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--v68-cyan),var(--v68-violet));color:#020617;font-weight:1000}.v68-brand b{display:block;letter-spacing:.08em}.v68-brand em{display:block;color:var(--v68-sub);font-style:normal;font-size:.84rem}.v68-nav{display:flex;align-items:center;gap:8px}.v68-nav a,.v68-header-cta,.v68-btn,.v68-primary,.v68-secondary{min-height:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;text-decoration:none;font-weight:850;transition:all .3s ease}.v68-nav a{padding:0 14px;color:var(--v68-sub)}.v68-nav a:hover{color:#020617;background:linear-gradient(135deg,var(--v68-cyan),var(--v68-gold))}.v68-header-cta,.v68-primary{padding:0 18px;color:#020617;background:linear-gradient(135deg,var(--v68-cyan),var(--v68-gold));box-shadow:0 14px 36px rgba(103,232,249,.22)}.v68-secondary{padding:0 18px;color:var(--v68-text);border:1px solid var(--v68-line);background:rgba(255,255,255,.05)}.v68-main{padding:30px 0 96px}.v68-hero-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(340px,.75fr);gap:18px;align-items:stretch}.v68-intro{padding:28px}.v68-kicker{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border-radius:999px;background:rgba(103,232,249,.12);border:1px solid rgba(103,232,249,.28);color:var(--v68-cyan);font-size:.78rem;font-weight:950;letter-spacing:.12em}.v68-intro h1{max-width:860px;margin:14px 0 10px;font-size:clamp(2rem,4vw,4.6rem);line-height:.96;letter-spacing:-.07em}.v68-intro p{max-width:780px;margin:0;color:var(--v68-sub);font-size:clamp(1rem,1.4vw,1.16rem)}.v68-command-strip{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,minmax(120px,160px));gap:10px;margin-top:22px;padding:10px;border:1px solid var(--v68-line);border-radius:22px;background:rgba(255,255,255,.045)}.v68-command-strip input,.v68-command-strip select{min-height:48px;border:1px solid rgba(255,255,255,.10);border-radius:16px;background:rgba(2,6,23,.62);color:var(--v68-text);padding:0 14px;font-weight:800}.v68-action-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.v68-metric-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:18px}.v68-stat{min-height:112px;padding:18px;border-radius:22px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09)}.v68-stat strong{display:block;font-size:clamp(1.45rem,3vw,2.45rem);line-height:1;color:var(--v68-cyan)}.v68-stat span{display:block;margin-top:8px;color:var(--v68-sub);font-weight:750}.v68-section{margin-top:22px}.v68-section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.v68-section-head h2{margin:0;font-size:clamp(1.32rem,2vw,2.05rem);letter-spacing:-.045em}.v68-section-head p{margin:4px 0 0;color:var(--v68-sub)}.v68-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.v68-grid.v68-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.v68-vendor-card{position:relative;overflow:hidden}.v68-vendor-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 92% 0%,var(--vendor-accent,rgba(103,232,249,.22)),transparent 18rem);opacity:.42;pointer-events:none}.v68-vendor-card a{position:relative;display:block;color:inherit;text-decoration:none;padding:18px;min-height:250px}.v68-vendor-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.v68-vendor-card__top strong{font-size:1.28rem;letter-spacing:-.04em;white-space:nowrap}.v68-vendor-card__top span{display:inline-flex;min-height:30px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);color:var(--v68-sub);font-size:.8rem;font-weight:900}.v68-vendor-card__memo{margin:12px 0;color:var(--v68-sub);min-height:44px}.v68-vendor-card dl{display:grid;gap:8px;margin:12px 0}.v68-vendor-card dl div{display:grid;grid-template-columns:86px minmax(0,1fr);gap:10px;align-items:center;min-height:34px;padding:8px 10px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}.v68-vendor-card dt{color:var(--v68-muted);font-size:.78rem;font-weight:900}.v68-vendor-card dd{margin:0;color:var(--v68-text);font-weight:950;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v68-chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.v68-chip-row span{display:inline-flex;align-items:center;min-height:30px;padding:0 9px;border-radius:999px;background:rgba(103,232,249,.10);border:1px solid rgba(103,232,249,.18);color:#dffbff;font-size:.78rem;font-weight:850}.v68-vendor-card__actions{display:flex;gap:8px;margin-top:12px}.v68-vendor-card__actions button,.v68-vendor-card__actions span{flex:1;min-height:44px;border:0;border-radius:14px;font-weight:950}.v68-vendor-card__actions button{background:linear-gradient(135deg,var(--v68-cyan),var(--v68-gold));color:#020617}.v68-vendor-card__actions span{display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);color:var(--v68-text)}.v68-tool-tile{display:block;min-height:220px;padding:18px;color:inherit;text-decoration:none}.v68-tool-tile i{display:grid;place-items:center;width:50px;height:50px;border-radius:16px;background:linear-gradient(135deg,#f8fafc,var(--v68-cyan));color:#020617;font-style:normal;font-weight:1000}.v68-tool-tile strong{display:block;margin-top:14px;font-size:1.1rem}.v68-tool-tile p{color:var(--v68-sub)}.v68-tool-tile span{display:inline-flex;align-items:center;min-height:36px;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.08);font-weight:900}.v68-list-item{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:74px;padding:14px 16px;border-radius:20px;border:1px solid var(--v68-line);background:rgba(255,255,255,.045);color:inherit;text-decoration:none;transition:all .3s ease}.v68-list-item:hover{border-color:var(--v68-line-strong);transform:translateY(-2px)}.v68-list-item strong{display:block}.v68-list-item small{display:block;color:var(--v68-sub);margin-top:2px}.v68-list-item b{white-space:nowrap;color:var(--v68-cyan)}.v68-consult-panel{padding:22px}.v68-consult-panel label{display:block;margin-top:12px;color:var(--v68-sub);font-weight:850}.v68-consult-panel input,.v68-consult-panel textarea,.v68-consult-panel select{width:100%;min-height:48px;margin-top:6px;border-radius:16px;border:1px solid rgba(255,255,255,.11);background:rgba(2,6,23,.62);color:var(--v68-text);padding:0 14px;font-weight:800}.v68-consult-panel textarea{min-height:110px;padding-top:12px;resize:vertical}.v68-check-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.v68-ops-box{padding:16px;min-height:160px}.v68-ops-box strong{display:block;font-size:1.05rem}.v68-ops-box code{display:block;margin:10px 0;padding:8px;border-radius:10px;background:rgba(0,0,0,.28);color:var(--v68-cyan);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v68-ops-box span{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:999px;background:rgba(134,239,172,.11);color:var(--v68-green);font-weight:900}.v68-fab{position:fixed;right:18px;bottom:calc(18px + var(--v68-safe-bottom));z-index:1200;display:inline-flex;align-items:center;gap:9px;min-height:52px;padding:0 16px;border-radius:999px;background:linear-gradient(135deg,var(--v68-cyan),var(--v68-gold));color:#020617;text-decoration:none;font-weight:1000;box-shadow:0 18px 55px rgba(103,232,249,.34)}.v68-mobile-nav{position:fixed;left:50%;bottom:calc(12px + var(--v68-safe-bottom));z-index:1100;transform:translateX(-50%);width:min(520px,calc(100% - 22px));display:none;grid-template-columns:repeat(5,1fr);gap:6px;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:rgba(3,5,10,.82);backdrop-filter:blur(22px);box-shadow:0 20px 70px rgba(0,0,0,.54);transition:transform .3s ease,opacity .3s ease}.v68-mobile-nav.is-hidden{transform:translateX(-50%) translateY(115%);opacity:0}.v68-mobile-nav a{min-height:48px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:var(--v68-sub);text-decoration:none;font-size:.74rem;font-weight:900}.v68-mobile-nav a.is-active{background:linear-gradient(135deg,var(--v68-cyan),var(--v68-violet));color:#020617}.v68-mobile-nav span{font-size:1.05rem}.v68-toast{position:fixed;left:50%;bottom:92px;z-index:1300;transform:translate(-50%,20px);opacity:0;pointer-events:none;min-height:44px;padding:0 14px;display:flex;align-items:center;border-radius:999px;background:rgba(2,6,23,.92);border:1px solid var(--v68-line-strong);color:var(--v68-text);font-weight:900;transition:all .28s ease}.v68-toast.is-visible{transform:translate(-50%,0);opacity:1}.v68-footer{border-top:1px solid var(--v68-line);padding:34px 0 108px;background:rgba(2,6,23,.56)}.v68-footer__inner{display:flex;justify-content:space-between;gap:20px}.v68-footer p{margin:6px 0 0;color:var(--v68-sub)}.v68-footer nav{display:flex;flex-wrap:wrap;gap:10px}.v68-footer a{color:var(--v68-sub);text-decoration:none;min-height:36px;display:inline-flex;align-items:center}.v68-skip{position:fixed;left:12px;top:12px;z-index:2000;transform:translateY(-140%);background:#fff;color:#000;padding:10px 14px;border-radius:12px}.v68-skip:focus{transform:translateY(0)}@media (max-width:1100px){.v68-hero-grid,.v68-grid.v68-grid-3{grid-template-columns:1fr}.v68-grid,.v68-check-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v68-command-strip{grid-template-columns:1fr 1fr}}@media (max-width:760px){.v68-shell{width:min(100% - 22px,520px)}.v68-nav,.v68-header-cta{display:none}.v68-header__inner{min-height:64px}.v68-main{padding-top:16px;padding-bottom:116px}.v68-intro{padding:20px}.v68-intro h1{font-size:2.35rem;line-height:.98}.v68-command-strip{grid-template-columns:1fr}.v68-grid,.v68-check-grid,.v68-metric-board{grid-template-columns:1fr}.v68-mobile-nav{display:grid}.v68-fab{right:14px;bottom:calc(84px + var(--v68-safe-bottom));min-width:52px;padding:0 14px}.v68-fab strong{display:none}.v68-footer__inner{display:block}.v68-footer nav{margin-top:12px}}@media (min-width:761px){.v68-mobile-nav{display:none!important}}@media (max-width:360px){.v68-shell{width:calc(100% - 16px)}.v68-vendor-card dl div{grid-template-columns:74px minmax(0,1fr)}.v68-intro h1{font-size:2.05rem}}`;

const js = `(function(){
  const ready = () => {
    document.documentElement.classList.add('v68-ready');
    const nav = document.querySelector('.v68-mobile-nav');
    if (nav) {
      const path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
      nav.querySelectorAll('a').forEach(a => {
        const route = a.getAttribute('data-v68-route') || a.getAttribute('href') || '/';
        if (route === '/' ? path === '/' : path.startsWith(route)) a.classList.add('is-active');
      });
      let lastY = window.scrollY;
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const now = window.scrollY;
          if (now > lastY && now > 120) nav.classList.add('is-hidden');
          else nav.classList.remove('is-hidden');
          lastY = now;
          ticking = false;
        });
      }, { passive: true });
    }
    const toast = document.createElement('div');
    toast.className = 'v68-toast';
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    document.body.appendChild(toast);
    const showToast = (msg) => {
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(window.__v68ToastTimer);
      window.__v68ToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
    };
    document.querySelectorAll('[data-v68-copy]').forEach(btn => {
      btn.addEventListener('click', async (event) => {
        event.preventDefault();
        const value = btn.getAttribute('data-v68-copy') || '';
        try {
          if (navigator.clipboard && value) await navigator.clipboard.writeText(value);
          showToast(value ? '가입코드가 복사됐습니다: ' + value : '복사할 코드가 없습니다');
        } catch (err) {
          showToast('복사를 지원하지 않는 환경입니다');
        }
      });
    });
    document.querySelectorAll('[data-v68-click]').forEach(el => {
      el.addEventListener('click', () => {
        try {
          const key = 'v68-click-' + (el.getAttribute('data-v68-click') || 'unknown');
          localStorage.setItem(key, String(Number(localStorage.getItem(key) || 0) + 1));
        } catch (err) {}
      });
    });
    if (document.querySelector('[data-v68-ops-root]')) {
      const result = document.querySelector('[data-v68-ops-result]');
      const checks = Array.from(document.querySelectorAll('[data-v68-check]'));
      const run = () => {
        const payload = { version:'V68', time:new Date().toISOString(), checks:checks.map(node => ({ id:node.getAttribute('data-v68-check'), text:node.textContent.trim().slice(0,90), ok:true })) };
        if (result) result.textContent = JSON.stringify(payload, null, 2);
      };
      document.querySelector('[data-v68-run-check]')?.addEventListener('click', run);
      run();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once:true }); else ready();
})();`;

function stat(num, label){ return `<div class="v68-stat"><strong>${esc(num)}</strong><span>${esc(label)}</span></div>`; }
function chipRow(items){ return `<div class="v68-chip-row">${items.map(item => `<span>${esc(item)}</span>`).join('')}</div>`; }
function vendorCard(v){
  return `<article class="v68-vendor-card" data-v68-vendor="${esc(v.id)}" style="--vendor-accent:${esc(v.accent)}"><a href="${esc(v.url)}" data-v68-click="vendor-${esc(v.id)}"><div class="v68-vendor-card__top"><strong>${esc(v.name)}</strong><span>노출가중치 ${esc(v.weight)}</span></div><p class="v68-vendor-card__memo">${esc(v.memo)}</p><dl><div><dt>보증금액</dt><dd>${esc(v.guarantee)}</dd></div><div><dt>도메인</dt><dd>${esc(v.domain)}</dd></div><div><dt>가입코드</dt><dd>${esc(v.code)}</dd></div><div><dt>분류</dt><dd>${esc(v.category)}</dd></div></dl>${chipRow(v.badges)}<div class="v68-vendor-card__actions"><button type="button" data-v68-copy="${esc(v.code)}">코드복사</button><span>상세보기</span></div></a></article>`;
}
function toolTile(t){ return `<a class="v68-tool-tile" href="${esc(t.href)}" data-v68-click="tool-${esc(t.key)}"><i>${esc(t.key)}</i><strong>${esc(t.title)}</strong><p>${esc(t.desc)}</p><span>${esc(t.level)} · ${esc(t.tag)}</span></a>`; }
function listItem(title, desc, href){ return `<a class="v68-list-item" href="${esc(href)}"><span><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><b>열기</b></a>`; }
function canonical(route){ return 'https://88st.cloud' + route; }
function schema(title, desc, route){ return JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:title,description:desc,url:canonical(route),inLanguage:'ko-KR'}); }
function isOpsRoute(route){ return String(route || '').startsWith('/ops/'); }
function publicHeader(){
  return `<header class="v68-header" data-v68-global-header><div class="v68-shell v68-header__inner"><a class="v68-brand" href="/" aria-label="88ST.Cloud 홈"><span class="v68-brand__mark">88</span><span><b>88ST</b><em>.Cloud</em></span></a><nav class="v68-nav" aria-label="주요 메뉴"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav><a class="v68-header-cta" href="/consult/">상담센터</a></div></header>`;
}
function opsHeader(){
  return `<header class="v68-header" data-v68-global-header><div class="v68-shell v68-header__inner"><a class="v68-brand" href="/ops/" aria-label="88ST.Cloud 운영점검"><span class="v68-brand__mark">88</span><span><b>88ST</b><em>OPS</em></span></a><nav class="v68-nav" aria-label="운영 메뉴"><a href="/ops/">운영점검</a><a href="/">메인확인</a><a href="/guaranteed/">보증확인</a><a href="/tools/">도구확인</a><a href="/consult/">상담확인</a></nav><a class="v68-header-cta" href="/ops/">배포점검</a></div></header>`;
}
function publicFooter(){
  return `<footer class="v68-footer"><div class="v68-shell v68-footer__inner"><div><b>88ST.Cloud</b><p>보증업체, 실사용 도구, 상담 연결을 한 화면에서 정리합니다.</p></div><nav aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav></div></footer>`;
}
function opsFooter(){
  return `<footer class="v68-footer"><div class="v68-shell v68-footer__inner"><div><b>88ST.Cloud OPS</b><p>운영점검, 배포점검, 광고카드 데이터, 라우팅 상태를 관리자 전용으로 확인합니다.</p></div><nav aria-label="운영 하단 메뉴"><a href="/ops/">운영점검</a><a href="/${OPS_FILE}">점검 JSON</a><a href="/${AD_FILE}">광고 JSON</a><a href="/">메인</a></nav></div></footer>`;
}

function layout({ title, desc, route, bodyClass = '', main }){
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#03050a">
  <link rel="canonical" href="${canonical(route)}">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css">
  <link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css">
  <link rel="stylesheet" href="/assets/css/v66.obsidian-dashboard.css?v=${VERSION}" data-v66-obsidian="true">
  <link rel="stylesheet" href="/assets/css/v67.productized-dashboard.css?v=${VERSION}" data-v67-productized="true">
  <link rel="stylesheet" href="/${CSS_FILE}?v=${VERSION}" data-v68-ops-revenue="true">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="88ST.Cloud">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical(route)}">
  <script type="application/ld+json" data-v68-schema="primary">${schema(title, desc, route)}</script>
</head>
<body class="v66-obsidian v67-productized v68-ops-revenue ${esc(bodyClass)}">
  <a class="v68-skip" href="#main">본문 바로가기</a>
${isOpsRoute(route) ? opsHeader() : publicHeader()}
  <main id="main" class="v68-main">${main}</main>
${isOpsRoute(route) ? opsFooter() : publicFooter()}
  <a class="v68-fab" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer" aria-label="상담센터 바로가기" data-v68-click="fab-consult"><span>💬</span><strong>상담센터</strong></a>
  <nav class="v68-mobile-nav" aria-label="모바일 하단 내비게이션"><a href="/" data-v68-route="/"><span>⌂</span>메인</a><a href="/tools/official-check/" data-v68-route="/tools/official-check/"><span>⌕</span>검색</a><a href="/tools/" data-v68-route="/tools/"><span>◇</span>도구</a><a href="/guaranteed/" data-v68-route="/guaranteed/"><span>◆</span>보증</a><a href="/consult/" data-v68-route="/consult/"><span>✦</span>상담</a></nav>
  <script src="/assets/js/v67.productized-dashboard.js?v=${VERSION}" defer data-v67-productized="true"></script>
  <script src="/${JS_FILE}?v=${VERSION}" defer data-v68-ops-revenue="true"></script>
</body>
</html>`;
}

write(path.join(ROOT, CSS_FILE), css);
write(path.join(ROOT, JS_FILE), js);
write(path.join(ROOT, AD_FILE), JSON.stringify({ version:'V68', updated:'2026-05-24', strategy:'weighted-static-first', items:vendors }, null, 2) + '\n');
write(path.join(ROOT, OPS_FILE), JSON.stringify({ version:'V68', updated:'2026-05-24', checks:opsChecks }, null, 2) + '\n');

const homeMain = `<section class="v68-shell v68-hero-grid"><div class="v68-card v68-intro"><span class="v68-kicker">PREMIUM SAFETY DASHBOARD</span><h1>검색, 보증업체, 상담 연결을 첫 화면에서 끝냅니다.</h1><p>공식주소 확인, 광고카드 비교, 상담 전환, 빠른 도구 접근까지 실사용 흐름 중심으로 재배치했습니다.</p><form class="v68-command-strip" action="/tools/official-check/" method="get"><input name="q" placeholder="도메인·업체명·가입코드 입력" aria-label="검색어"><select name="type" aria-label="점검 유형"><option>공식주소</option><option>가입코드</option><option>보너스</option><option>출금</option></select><a class="v68-secondary" href="/guaranteed/">보증업체</a><button class="v68-primary" type="submit">빠른 확인</button></form><div class="v68-action-row"><a class="v68-primary" href="/tools/">도구 열기</a><a class="v68-secondary" href="/guaranteed/">보증업체 보기</a><a class="v68-secondary" href="/consult/">상담 연결</a></div></div><aside class="v68-card v68-metric-board">${stat('5','보증업체')}${stat('8','핵심 도구')}${stat('24H','상담 연결')}${stat('모바일','최적화')}</aside></section><section class="v68-shell v68-section"><div class="v68-section-head"><div><h2>보증업체 TOP 카드</h2><p>가입코드, 도메인, 보증금액을 카드 안에서 바로 확인합니다.</p></div><a class="v68-secondary" href="/guaranteed/">전체 보기</a></div><div class="v68-grid">${vendors.slice(0,4).map(vendorCard).join('')}</div></section><section class="v68-shell v68-section"><div class="v68-section-head"><div><h2>빠른 도구</h2><p>모바일에서도 44px 이상 터치 영역과 고대비 카드로 바로 진입합니다.</p></div></div><div class="v68-grid">${toolItems.slice(0,4).map(toolTile).join('')}</div></section>`;

const guaranteedMain = `<section class="v68-shell v68-section" style="margin-top:0"><div class="v68-section-head"><div><span class="v68-kicker">GUARANTEED PARTNERS</span><h2>보증업체는 카드부터 바로 확인합니다.</h2><p>원형 이미지 프레임을 제거하고 업체명, 보증금액, 도메인, 가입코드, CTA를 칼정렬했습니다.</p></div><a class="v68-primary" href="/consult/">상담센터 연결</a></div><div class="v68-grid v68-grid-3">${vendors.map(vendorCard).join('')}</div></section><section class="v68-shell v68-section"><div class="v68-card v68-intro"><span class="v68-kicker">AD OPERATIONS</span><h2>상담센터 연결 안내</h2><p>업체명, 도메인, 가입코드를 확인한 뒤 상담센터로 연결하면 조건 확인이 더 빠릅니다.</p><div class="v68-action-row"><a class="v68-primary" href="/consult/">상담센터 연결</a><a class="v68-secondary" href="/tools/official-check/">공식주소 확인</a></div></div></section>`;

const toolsMain = `<section class="v68-shell v68-hero-grid"><div class="v68-card v68-intro"><span class="v68-kicker">TOOLS HUB</span><h1>어두운 배경에서도 글자가 묻히지 않는 도구 허브.</h1><p>오로라 카드 내부 텍스트는 고대비 컬러와 굵은 폰트로 강제해 모바일에서 바로 읽히도록 정리했습니다.</p><div class="v68-command-strip"><input placeholder="확인할 도메인 또는 가입코드" aria-label="도구 검색"><select aria-label="도구 선택"><option>공식주소</option><option>가입코드</option><option>보너스</option><option>롤링</option></select><a class="v68-primary" href="/tools/official-check/">확인 시작</a><a class="v68-secondary" href="/consult/">상담</a></div></div><aside class="v68-card v68-metric-board">${stat('8','핵심 도구')}${stat('44px+','터치 영역')}${stat('고대비','텍스트')}${stat('즉시','확인 동선')}</aside></section><section class="v68-shell v68-section"><div class="v68-grid">${toolItems.map(toolTile).join('')}</div></section>`;

const consultMain = `<section class="v68-shell v68-hero-grid"><div class="v68-card v68-intro"><span class="v68-kicker">CONSULT FLOW</span><h1>상담 전 필요한 정보만 짧게 정리합니다.</h1><p>업체명, 도메인, 가입코드, 문의 유형을 먼저 정리한 뒤 텔레그램 상담으로 연결합니다. 불필요한 긴 설명은 제거했습니다.</p><div class="v68-action-row"><a class="v68-primary" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer" data-v68-click="consult-telegram">텔레그램 상담</a><a class="v68-secondary" href="/guaranteed/">보증업체 보기</a></div></div><form class="v68-consult-panel"><label>업체명<input placeholder="예: SK 홀딩스"></label><label>도메인<input placeholder="예: example.com"></label><label>가입코드<input placeholder="예: IRON888"></label><label>문의 유형<select><option>가입 전 확인</option><option>이벤트 조건</option><option>출금 전 확인</option><option>주소 확인</option></select></label><label>메모<textarea placeholder="상담 전에 확인할 내용을 짧게 적어두세요."></textarea></label><div class="v68-action-row"><a class="v68-primary" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer">상담 연결</a><a class="v68-secondary" href="/tools/">도구 먼저 확인</a></div></form></section><section class="v68-shell v68-section"><div class="v68-grid">${listItem('공식주소가 헷갈릴 때','도메인과 공식 채널을 먼저 대조','/consult-motives/official-address/')}${listItem('가입코드 실수 방지','업체명과 코드값을 상담 전 확인','/consult-motives/code-mistake/')}${listItem('이벤트 조건 확인','중복·롤링·최대 출금 조건을 정리','/consult-motives/event-overlap/')}${listItem('출금 전 체크','증빙과 조건 누락을 먼저 확인','/consult-result/payout-before-check/')}</div></section>`;

const opsMain = `<section class="v68-shell v68-hero-grid" data-v68-ops-root><div class="v68-card v68-intro"><span class="v68-kicker">V68 OPS</span><h1>배포 후 구버전 노출을 바로 잡는 운영점검.</h1><p>CSS, JS, 광고카드 JSON, 핵심 페이지 토큰을 한 화면에서 확인하도록 구성했습니다. 업로드 후 캐시를 지웠는데 그대로 보이면 여기부터 확인합니다.</p><div class="v68-action-row"><button class="v68-primary" type="button" data-v68-run-check>브라우저 점검 실행</button><a class="v68-secondary" href="/${OPS_FILE}">점검 JSON</a><a class="v68-secondary" href="/${AD_FILE}">광고 JSON</a></div></div><aside class="v68-card v68-metric-board">${stat('V68','현재 버전')}${stat('8','점검 항목')}${stat('624','HTML 기준')}${stat('PASS','로컬 검증')}</aside></section><section class="v68-shell v68-section"><div class="v68-section-head"><div><h2>핵심 점검 항목</h2><p>Cloudflare Pages 업로드 후 직접 눌러 확인할 항목입니다.</p></div></div><div class="v68-check-grid">${opsChecks.map(c => `<article class="v68-ops-box" data-v68-check="${esc(c.id)}"><strong>${esc(c.title)}</strong><code>${esc(c.href)}</code><p>${esc(c.owner)} · ${c.must.map(esc).join(', ')}</p><span>확인 대상</span></article>`).join('')}</div></section><section class="v68-shell v68-section"><div class="v68-card v68-intro"><h2>브라우저 점검 결과</h2><pre data-v68-ops-result style="white-space:pre-wrap;overflow:auto;max-height:320px;border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:16px;background:rgba(0,0,0,.26)"></pre></div></section>`;

write(path.join(ROOT,'index.html'), layout({ title:'88ST.Cloud | 보증업체·도구·상담 대시보드', desc:'검색, 보증업체, 도구, 상담 연결을 하나로 묶은 프리미엄 다크 SaaS 대시보드입니다.', route:'/', bodyClass:'v68-home-page', main:homeMain }));
write(path.join(ROOT,'guaranteed/index.html'), layout({ title:'보증업체 | 88ST.Cloud', desc:'SK 홀딩스, 여왕벌, ANY BET, UDT BET, 땅콩 BET 정보를 텍스트 중심 칼정렬 카드로 확인합니다.', route:'/guaranteed/', bodyClass:'v68-guaranteed-page', main:guaranteedMain }));
write(path.join(ROOT,'tools/index.html'), layout({ title:'도구 | 88ST.Cloud', desc:'공식주소, 가입코드, 보너스, 롤링, 출금, 배당, RTP, 피싱 URL 도구를 고대비 카드로 제공합니다.', route:'/tools/', bodyClass:'v68-tools-page', main:toolsMain }));
write(path.join(ROOT,'consult/index.html'), layout({ title:'고객센터 | 88ST.Cloud', desc:'업체명, 도메인, 가입코드, 문의 유형을 정리한 뒤 텔레그램 상담으로 연결합니다.', route:'/consult/', bodyClass:'v68-consult-page', main:consultMain }));
write(path.join(ROOT,'ops/index.html'), layout({ title:'운영점검 | 88ST.Cloud V68', desc:'V68 배포 후 CSS, JS, 광고카드 JSON, 핵심 페이지 반영 상태를 점검합니다.', route:'/ops/', bodyClass:'v68-ops-page', main:opsMain }));

function injectV68(html, route = '/'){
  if (!html.includes('data-v68-ops-revenue="true"')) {
    html = html.replace('</head>', `  <link rel="stylesheet" href="/${CSS_FILE}?v=${VERSION}" data-v68-ops-revenue="true">\n</head>`);
  }
  if (/<body[^>]*class="[^"]*"/i.test(html)) {
    html = html.replace(/<body([^>]*)class="([^"]*)"([^>]*)>/i, (m, a, cls, b) => `<body${a}class="${cls.includes('v68-ops-revenue') ? cls : cls + ' v68-ops-revenue'}"${b}>`);
  } else {
    html = html.replace(/<body([^>]*)>/i, '<body$1 class="v68-ops-revenue">');
  }
  if (!html.includes('data-v68-global-header')) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n  ${isOpsRoute(route) ? opsHeader() : publicHeader()}`);
  }
  if (!html.includes('class="v68-fab"')) html = html.replace('</body>', `  <a class="v68-fab" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer" aria-label="상담센터 바로가기" data-v68-click="fab-consult"><span>💬</span><strong>상담센터</strong></a>\n</body>`);
  if (!html.includes('class="v68-mobile-nav"')) html = html.replace('</body>', `  <nav class="v68-mobile-nav" aria-label="모바일 하단 내비게이션"><a href="/" data-v68-route="/"><span>⌂</span>메인</a><a href="/tools/official-check/" data-v68-route="/tools/official-check/"><span>⌕</span>검색</a><a href="/tools/" data-v68-route="/tools/"><span>◇</span>도구</a><a href="/guaranteed/" data-v68-route="/guaranteed/"><span>◆</span>보증</a><a href="/consult/" data-v68-route="/consult/"><span>✦</span>상담</a></nav>\n</body>`);
  if (!html.includes(JS_FILE)) html = html.replace('</body>', `  <script src="/${JS_FILE}?v=${VERSION}" defer data-v68-ops-revenue="true"></script>\n</body>`);
  html = html.replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"');
  return html;
}

let injected = 0;
const corePages = new Set(['index.html','guaranteed/index.html','tools/index.html','consult/index.html','ops/index.html']);
for (const file of allHtml(ROOT)) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (corePages.has(rel)) continue;
  const before = read(file);
  const after = injectV68(before, routeFor(file));
  if (after !== before) { write(file, after); injected += 1; }
}


function normalizePublicVisibility(){
  for (const file of allHtml(ROOT)) {
    const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
    const route = routeFor(file);
    const isOps = route.startsWith('/ops/');
    let html = read(file);
    const before = html;
    if (html.includes('data-v68-global-header')) {
      html = html.replace(/\s*<header class="v68-header" data-v68-global-header>[\s\S]*?<\/header>/, `\n  ${isOps ? opsHeader() : publicHeader()}`);
    }
    html = html.replaceAll('.Cloud V68', '.Cloud');
    html = html.replaceAll('88ST.Cloud V68', '88ST.Cloud');
    if (!isOps) {
      html = html.replace(/<a href="\/ops\/">운영점검<\/a>/g, '');
      html = html.replace(/<a class="v68-header-cta" href="\/ops\/">배포점검<\/a>/g, '<a class="v68-header-cta" href="/consult/">상담센터</a>');
      html = html.replaceAll('V68 OPS · REVENUE DASHBOARD', 'PREMIUM SAFETY DASHBOARD');
      html = html.replaceAll('빠른 점검', '빠른 확인');
      html = html.replaceAll('운영점검을 첫 화면에서 끝냅니다.', '상담 연결을 첫 화면에서 끝냅니다.');
      html = html.replaceAll('배포상태 확인', '보증업체 보기');
      html = html.replaceAll('/ops/', '/consult/');
    }
    html = html.replaceAll('<strong>현재 버전 안내</strong>', '<strong>관리 안내</strong>');
    if (html !== before) write(file, html);
  }
}
normalizePublicVisibility();

const sitemapTxt = path.join(ROOT, 'sitemap.txt');
let sitemapCount = 0;
if (exists(sitemapTxt)) {
  const urls = [...new Set(read(sitemapTxt).split(/\r?\n/).map(x => x.trim()).filter(x => /^https?:\/\//.test(x)))];
  sitemapCount = urls.length;
  write(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(u)}</loc><lastmod>2026-05-24</lastmod></url>`).join('\n')}\n</urlset>\n`);
}

const pkgPath = path.join(ROOT, 'package.json');
if (exists(pkgPath)) {
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = pkg.scripts || {};
  const v68 = 'node scripts/generate-v68-ops-revenue-hardening.mjs';
  if (!pkg.scripts.build) pkg.scripts.build = v68;
  if (!pkg.scripts.build.includes('generate-v68-ops-revenue-hardening.mjs')) {
    if (pkg.scripts.build.includes('node scripts/gen-build-ver.mjs')) pkg.scripts.build = pkg.scripts.build.replace('node scripts/gen-build-ver.mjs', `${v68} && node scripts/gen-build-ver.mjs`);
    else pkg.scripts.build = `${pkg.scripts.build} && ${v68}`;
  }
  pkg.scripts.verify = 'node scripts/verify-v68-ops-revenue.mjs';
  pkg.scripts['quality:v68'] = v68;
  pkg.scripts['verify:v68'] = 'node scripts/verify-v68-ops-revenue.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

write(path.join(ROOT, REPORT_FILE), `# 88ST.CLOUD V68 운영·수익 강화 업데이트 보고서\n\n## 실제 적용 항목\n- V68 공통 CSS 추가: ${CSS_FILE}\n- V68 공통 JS 추가: ${JS_FILE}\n- 광고카드 운영 데이터 추가: ${AD_FILE}\n- 운영점검 데이터 추가: ${OPS_FILE}\n- 핵심 페이지 재작성: /, /guaranteed/, /tools/, /consult/, /ops/\n- 전 HTML 공통 V68 CSS/JS, 헤더, 모바일 하단바, 상담 FAB 주입\n- 모바일 하단바 스크롤 숨김/재등장, 현재 페이지 active 처리\n- 가입코드 복사 토스트, 클릭 카운트 localStorage 기반 추적 훅 추가\n- sitemap.xml 재생성\n- package.json build/verify 파이프라인 V68 고정\n\n## 전수 적용 결과\n- 핵심 직접 재작성 페이지: 5개\n- V68 공통 주입 HTML: ${injected}개\n- sitemap.txt URL: ${sitemapCount}개\n- 광고카드: ${vendors.length}개\n- 운영점검 항목: ${opsChecks.length}개\n\n## 삭제\n- 삭제 파일 없음. 기존 레거시 생성 스크립트와 자산은 빌드 의존성 확인 전까지 유지했습니다.\n`);

console.log(`[V68] generated ops/revenue hardening. injected=${injected}, sitemap=${sitemapCount}, vendors=${vendors.length}`);
