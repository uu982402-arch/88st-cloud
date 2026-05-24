import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const VERSION = 'static-v71-main-homepage-20260524-hotfix2';

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

const partners = [
  { file: 'sk-holdings.svg', label: 'SK HOLDINGS', sub: 'IRON 888', a: '#f6c96b', b: '#10b981' },
  { file: 'queenbee.svg', label: 'QUEEN BEE', sub: 'VIP CLUB', a: '#f7b2ff', b: '#f6c96b' },
  { file: 'anybet.svg', label: 'ANY BET', sub: 'PREMIUM', a: '#93c5fd', b: '#10b981' },
  { file: 'udt-bet.svg', label: 'UDT BET', sub: 'SPORTS', a: '#60a5fa', b: '#22d3ee' },
  { file: 'ddangkong-bet.svg', label: 'DDK BET', sub: 'PEANUT', a: '#f59e0b', b: '#ef4444' }
];

for (const p of partners) {
  write(`assets/img/partners/v71-${p.file}`, `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="${p.label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/>
      <stop offset="1" stop-color="${p.b}"/>
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="35%" r="80%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="0.48" stop-color="${p.a}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="${p.b}" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="640" height="360" rx="48" fill="#07111f"/>
  <rect x="1" y="1" width="638" height="358" rx="47" fill="url(#r)"/>
  <rect x="32" y="32" width="576" height="296" rx="36" fill="#ffffff" fill-opacity="0.055" stroke="#ffffff" stroke-opacity="0.14"/>
  <circle cx="540" cy="78" r="96" fill="url(#g)" opacity="0.18"/>
  <circle cx="104" cy="292" r="118" fill="url(#g)" opacity="0.12"/>
  <g filter="url(#shadow)">
    <rect x="78" y="74" width="98" height="98" rx="30" fill="url(#g)"/>
    <path d="M108 126h38M127 106v40" stroke="#061117" stroke-width="12" stroke-linecap="round" opacity="0.9"/>
  </g>
  <text x="198" y="136" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="900" letter-spacing="-2" fill="#f8fafc">${p.label}</text>
  <text x="202" y="183" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="5" fill="url(#g)">${p.sub}</text>
  <rect x="202" y="216" width="238" height="4" rx="2" fill="url(#g)" opacity="0.85"/>
  <text x="202" y="260" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#cbd5e1" opacity="0.74">VERIFIED PARTNER</text>
</svg>`);
}

const css = `:root {
  --v71-bg: #0b0f19;
  --v71-bg-deep: #050816;
  --v71-panel: rgba(255,255,255,.074);
  --v71-panel-strong: rgba(255,255,255,.11);
  --v71-line: rgba(255,255,255,.12);
  --v71-line-strong: rgba(255,255,255,.22);
  --v71-text: #f8fafc;
  --v71-text-soft: #cbd5e1;
  --v71-muted: #94a3b8;
  --v71-primary: #10b981;
  --v71-secondary: #2563eb;
  --v71-gold: #f6c96b;
  --v71-radius: 12px;
  --v71-radius-lg: 22px;
  --v71-blur: 22px;
  --v71-shadow-sm: 0 12px 28px rgba(0,0,0,.22);
  --v71-shadow-lg: 0 30px 90px rgba(0,0,0,.42);
  --v71-shell: 1180px;
  --v71-safe-bottom: env(safe-area-inset-bottom, 0px);
  color-scheme: dark;
}

* { box-sizing: border-box; }
html { min-width: 320px; background: var(--v71-bg); color: var(--v71-text); -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body.v71-main-home { margin: 0; min-height: 100vh; overflow-x: hidden; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; background: radial-gradient(circle at 18% -6%, rgba(16,185,129,.105), transparent 26rem), radial-gradient(circle at 92% 12%, rgba(37,99,235,.085), transparent 28rem), linear-gradient(180deg, #050816 0%, #0b0f19 44%, #070b14 100%); }
body.v71-main-home::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .038; background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.42) 1px, transparent 0); background-size: 18px 18px; }
body.v71-main-home::after { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(180deg, rgba(255,255,255,.025), transparent 24%, rgba(0,0,0,.16)); }
a { color: inherit; text-decoration: none; }
button, input { font: inherit; }
img { display: block; max-width: 100%; }

.v71-bg-orb { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.v71-bg-orb::before, .v71-bg-orb::after { content: ""; position: absolute; border-radius: 999px; filter: blur(74px); opacity: .18; transform: translateZ(0); }
.v71-bg-orb::before { width: 280px; height: 280px; left: -110px; top: 132px; background: #10b981; }
.v71-bg-orb::after { width: 320px; height: 320px; right: -150px; top: 42px; background: #2563eb; }

.v71-page { position: relative; z-index: 1; min-height: 100vh; padding-bottom: calc(92px + var(--v71-safe-bottom)); }
.v71-shell { width: min(var(--v71-shell), calc(100% - 40px)); margin-inline: auto; }
.v71-glass { background: linear-gradient(180deg, rgba(255,255,255,.092), rgba(255,255,255,.034)), rgba(15,23,42,.68); border: 1px solid rgba(255,255,255,.105); box-shadow: 0 18px 46px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.075); backdrop-filter: blur(var(--v71-blur)) saturate(138%); -webkit-backdrop-filter: blur(var(--v71-blur)) saturate(138%); }
.v71-glow-border { position: relative; overflow: hidden; isolation: isolate; }
.v71-glow-border::before { content: ""; position: absolute; inset: 0; padding: 1px; border-radius: inherit; background: linear-gradient(135deg, rgba(16,185,129,.58), rgba(37,99,235,.24), rgba(255,255,255,.11)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: .72; z-index: 2; }
.v71-glow-border::after { content: ""; position: absolute; inset: -34%; border-radius: inherit; background: radial-gradient(circle at 28% 16%, rgba(16,185,129,.16), transparent 42%); opacity: .72; pointer-events: none; z-index: 0; }
.v71-glow-border > * { position: relative; z-index: 1; }

.v71-topbar { position: sticky; top: 0; z-index: 80; border-bottom: 1px solid rgba(255,255,255,.09); background: rgba(5,8,22,.72); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
.v71-topbar-inner { min-height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.v71-logo { display: inline-flex; align-items: center; gap: 10px; min-height: 52px; font-weight: 900; letter-spacing: -.04em; }
.v71-logo-mark { width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(135deg, var(--v71-primary), var(--v71-secondary)); color: #ecfeff; box-shadow: 0 12px 32px rgba(16,185,129,.28); }
.v71-logo-word { display: grid; line-height: 1; }
.v71-logo-word strong { font-size: 16px; }
.v71-logo-word span { color: var(--v71-muted); font-size: 11px; letter-spacing: .04em; }
.v71-desktop-nav { display: none; align-items: center; gap: 4px; }
.v71-desktop-nav a { min-height: 44px; padding: 0 13px; border-radius: 999px; color: var(--v71-text-soft); font-size: 13px; font-weight: 850; transition: all .25s ease; }
.v71-desktop-nav a:hover, .v71-desktop-nav a[aria-current="page"] { color: #fff; background: rgba(255,255,255,.09); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.v71-menu-btn { width: 44px; height: 44px; border-radius: 14px; border: 1px solid var(--v71-line); background: rgba(255,255,255,.06); color: var(--v71-text); display: grid; place-items: center; cursor: pointer; }
.v71-menu-btn span { width: 18px; height: 2px; border-radius: 99px; background: currentColor; box-shadow: 0 -6px 0 currentColor, 0 6px 0 currentColor; }

.v71-main { padding: 12px 0 52px; }
.v71-hero { padding: 8px 0 8px; }
.v71-hero-card { border-radius: var(--v71-radius-lg); padding: 16px; min-height: 0; display: grid; grid-template-columns: 1fr; gap: 14px; align-items: center; background: linear-gradient(180deg, rgba(255,255,255,.082), rgba(255,255,255,.032)), rgba(15,23,42,.66); }
.v71-kicker { width: fit-content; min-height: 30px; display: inline-flex; align-items: center; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(16,185,129,.34); background: rgba(16,185,129,.095); color: #a7f3d0; font-size: 10px; font-weight: 950; letter-spacing: .08em; }
.v71-hero-copy { display: grid; gap: 10px; }
.v71-value-line { margin: 0; max-width: 760px; color: var(--v71-text); font-size: clamp(17px, 4.8vw, 28px); line-height: 1.24; letter-spacing: -.045em; font-weight: 950; word-break: keep-all; }
.v71-value-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.v71-value-pills span { min-height: 30px; display: inline-flex; align-items: center; padding: 0 10px; border-radius: 999px; color: var(--v71-text-soft); background: rgba(255,255,255,.064); border: 1px solid rgba(255,255,255,.09); font-size: 11px; font-weight: 850; }
.v71-hero-actions { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
.v71-btn { min-height: 52px; border-radius: var(--v71-radius); display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 14px; font-weight: 950; font-size: 14px; transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease, background .28s ease, filter .28s ease; white-space: nowrap; border: 1px solid var(--v71-line); }
.v71-btn:hover { transform: translateY(-3px); filter: brightness(1.04); }
.v71-btn:active { transform: scale(.985); }
.v71-btn-primary { color: #03120e; background: linear-gradient(135deg, #34d399, #10b981 45%, #60a5fa); border-color: rgba(255,255,255,.2); box-shadow: 0 18px 46px rgba(16,185,129,.24); }
.v71-btn-ghost { color: var(--v71-text); background: rgba(255,255,255,.07); }

.v71-section { margin-top: 18px; }
.v71-section-head { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.v71-section-head h2 { margin: 0; font-size: 18px; letter-spacing: -.04em; }
.v71-section-head p { margin: 4px 0 0; color: var(--v71-muted); font-size: 12px; line-height: 1.5; }
.v71-more { color: #a7f3d0; font-size: 12px; font-weight: 900; white-space: nowrap; }

.v71-partner-carousel { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(230px, 74%); gap: 12px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; padding: 2px 20px 10px; margin-inline: -20px; scrollbar-width: none; }
.v71-partner-carousel::-webkit-scrollbar { display: none; }
.v71-partner-card { min-height: 136px; border-radius: 20px; overflow: hidden; scroll-snap-align: start; border: 1px solid rgba(255,255,255,.105); background: rgba(15,23,42,.62); box-shadow: 0 18px 44px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.06); transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
.v71-partner-card:active, .v71-partner-card:hover { transform: translateY(-4px) scale(1.01); border-color: rgba(16,185,129,.34); box-shadow: 0 26px 70px rgba(16,185,129,.12), 0 18px 50px rgba(0,0,0,.34); }
.v71-partner-card img { width: 100%; height: 100%; min-height: 136px; object-fit: cover; }
.v71-partner-card::after { inset: 0; background: linear-gradient(135deg, rgba(255,255,255,.045), transparent 38%, rgba(16,185,129,.055)); opacity: 1; }

.v71-main-hub { display: grid; gap: 18px; }
.v71-blog-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.v71-blog-card { position: relative; overflow: hidden; min-height: 132px; border-radius: var(--v71-radius); padding: 13px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; background: linear-gradient(180deg, rgba(255,255,255,.076), rgba(255,255,255,.032)), rgba(15,23,42,.58); border: 1px solid rgba(255,255,255,.095); box-shadow: 0 12px 30px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.055); transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease; }
.v71-blog-card::before { content: ""; position: absolute; inset: -40%; background: radial-gradient(circle at 28% 18%, rgba(16,185,129,.13), transparent 38%); opacity: 0; pointer-events: none; transition: opacity .28s ease; }
.v71-blog-card > * { position: relative; z-index: 1; }
.v71-blog-card:hover { transform: translateY(-4px); border-color: rgba(16,185,129,.30); box-shadow: 0 22px 58px rgba(16,185,129,.10), 0 14px 38px rgba(0,0,0,.30); }
.v71-blog-card:hover::before { opacity: 1; }
.v71-blog-card:active { transform: scale(.985); }
.v71-blog-card em { color: #a7f3d0; font-style: normal; font-size: 10px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
.v71-blog-card strong { font-size: 13px; line-height: 1.34; letter-spacing: -.04em; word-break: keep-all; }
.v71-blog-card span { color: var(--v71-muted); font-size: 11px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.v71-desktop-partner-panel { display: none; }
.v71-tools-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.v71-tool-card { position: relative; overflow: hidden; min-height: 116px; border-radius: var(--v71-radius); padding: 14px; display: grid; align-content: space-between; gap: 14px; background: linear-gradient(180deg, rgba(255,255,255,.085), rgba(255,255,255,.034)), rgba(15,23,42,.60); border: 1px solid rgba(255,255,255,.10); box-shadow: 0 12px 30px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.055); transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease; }
.v71-tool-card::before { content: ""; position: absolute; inset: -42%; background: radial-gradient(circle at 24% 16%, rgba(37,99,235,.15), transparent 40%); opacity: 0; pointer-events: none; transition: opacity .28s ease; }
.v71-tool-card > * { position: relative; z-index: 1; }
.v71-tool-card:hover { transform: translateY(-4px); border-color: rgba(37,99,235,.34); box-shadow: 0 22px 58px rgba(37,99,235,.10), 0 14px 38px rgba(0,0,0,.30); }
.v71-tool-card:hover::before { opacity: 1; }
.v71-tool-card:active { transform: scale(.985); }
.v71-tool-icon { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, rgba(16,185,129,.22), rgba(37,99,235,.2)); color: #d1fae5; font-size: 19px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.v71-tool-card strong { font-size: 13px; letter-spacing: -.035em; }
.v71-tool-card span { color: var(--v71-muted); font-size: 11px; line-height: 1.4; }

.v71-metrics { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
.v71-metric { border-radius: var(--v71-radius); padding: 14px; background: rgba(255,255,255,.064); border: 1px solid rgba(255,255,255,.1); }
.v71-metric strong { display: block; font-size: 22px; letter-spacing: -.05em; }
.v71-metric span { color: var(--v71-muted); font-size: 11px; font-weight: 850; }

.v71-consult-banner { border-radius: 26px; padding: 20px; background: radial-gradient(circle at 16% 18%, rgba(16,185,129,.17), transparent 20rem), linear-gradient(180deg, rgba(255,255,255,.092), rgba(255,255,255,.036)), rgba(15,23,42,.68); }
.v71-consult-banner h2 { margin: 0; font-size: 24px; line-height: 1.08; letter-spacing: -.06em; }
.v71-consult-banner p { margin: 10px 0 16px; color: var(--v71-text-soft); line-height: 1.65; font-size: 13px; word-break: keep-all; }
.v71-telegram { min-height: 54px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; color: #02120d; font-weight: 1000; background: linear-gradient(135deg, #a7f3d0, #10b981, #60a5fa); box-shadow: 0 22px 60px rgba(16,185,129,.25); }

.v71-footer { padding: 24px 0 38px; color: rgba(203,213,225,.68); font-size: 12px; line-height: 1.6; }
.v71-footer-inner { border-top: 1px solid rgba(255,255,255,.09); padding-top: 20px; display: grid; gap: 10px; }

.v71-mobile-nav { position: fixed; left: 12px; right: 12px; bottom: calc(10px + var(--v71-safe-bottom)); z-index: 90; display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 6px; max-width: 430px; margin-inline: auto; padding: 7px; border-radius: 22px; border: 1px solid rgba(255,255,255,.12); background: rgba(5,8,22,.86); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); box-shadow: 0 18px 64px rgba(0,0,0,.46); overflow: hidden; }
.v71-mobile-nav a { min-width: 0; min-height: 50px; border-radius: 17px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 2px; color: var(--v71-muted); font-size: 10px; font-weight: 900; white-space: nowrap; }
.v71-mobile-nav a span { font-size: 16px; line-height: 1; }
.v71-mobile-nav a[aria-current="page"] { color: #03120e; background: linear-gradient(135deg, #34d399, #60a5fa); }
.v71-fab { position: fixed; right: 16px; bottom: calc(82px + var(--v71-safe-bottom)); z-index: 91; width: 56px; height: 56px; border-radius: 20px; display: grid; place-items: center; color: #02120d; background: linear-gradient(135deg, #a7f3d0, #10b981, #60a5fa); box-shadow: 0 20px 58px rgba(16,185,129,.25); font-weight: 1000; }

@media (max-width: 380px) {
  .v71-shell { width: min(100% - 32px, var(--v71-shell)); }
  .v71-hero-actions { grid-template-columns: 1fr; }
  .v71-partner-carousel { grid-auto-columns: minmax(220px, 82%); padding-inline: 16px; margin-inline: -16px; }
  .v71-blog-grid { gap: 9px; }
  .v71-blog-card { padding: 12px; }
}

@media (min-width: 768px) {
  .v71-page { padding-bottom: 0; }
  .v71-menu-btn { display: none; }
  .v71-desktop-nav { display: flex; }
  .v71-main { padding: 26px 0 76px; }
  .v71-hero-card { padding: 20px; grid-template-columns: minmax(0, 1fr) 390px; }
  .v71-hero-actions { max-width: 390px; justify-self: end; width: 100%; }
  .v71-mobile-partners { display: none; }
  .v71-mobile-nav, .v71-fab { display: none !important; }
  .v71-footer { padding-bottom: 50px; }
}

@media (min-width: 1024px) {
  .v71-topbar-inner { min-height: 74px; }
  .v71-main-hub { grid-template-columns: minmax(0, 1.55fr) minmax(340px, .72fr); align-items: start; gap: 18px; }
  .v71-blog-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
  .v71-blog-card { min-height: 136px; padding: 14px; }
  .v71-blog-card strong { font-size: 14px; }
  .v71-desktop-partner-panel { display: grid; gap: 12px; position: sticky; top: 92px; }
  .v71-partner-tile-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
  .v71-partner-tile-grid .v71-partner-card:first-child { grid-column: 1 / -1; min-height: 162px; }
  .v71-partner-card { min-height: 118px; }
  .v71-partner-card img { min-height: 118px; }
  .v71-tools-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
  .v71-tool-card { min-height: 148px; }
  .v71-metrics { grid-template-columns: repeat(4, minmax(0,1fr)); }
  .v71-consult-banner { min-height: 210px; padding: 34px; display: grid; grid-template-columns: 1fr 320px; align-items: center; gap: 24px; }
  .v71-consult-banner h2 { font-size: 38px; }
  .v71-consult-banner p { font-size: 15px; margin-bottom: 0; }
}

@media (min-width: 1440px) {
  .v71-shell { --v71-shell: 1320px; }
  .v71-main-hub { grid-template-columns: minmax(0, 1.68fr) minmax(390px, .78fr); }
}
`;

const js = `(function () {
  var root = document.documentElement;
  root.classList.add('v71-main-ready');

  var menu = document.querySelector('[data-v71-menu]');
  if (menu) {
    menu.addEventListener('click', function () {
      var nav = document.querySelector('.v71-desktop-nav');
      if (nav) {
        nav.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  var carousel = document.querySelector('.v71-partner-carousel');
  if (carousel) {
    carousel.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
        carousel.scrollLeft += event.deltaY;
      }
    }, { passive: true });
  }
})();
`;

const blogs = [
  { href: '/blog/first-deposit-check-route/', cat: 'BONUS', title: '첫충 뜻과 확인 순서', desc: '신규 이벤트 조건을 가입 전 빠르게 점검하는 기준입니다.' },
  { href: '/blog/rolling-terms-reading/', cat: 'ROLLING', title: '롤링 조건 읽는 법', desc: '실수령과 출금 제한을 함께 보는 기본 루틴입니다.' },
  { href: '/blog/game-guides/rtp-volatility-simple-meaning.html', cat: 'SLOT', title: '슬롯 RTP와 변동성', desc: '게임 선택 전 확인해야 할 숫자를 쉽게 정리했습니다.' },
  { href: '/blog/safe-toto-site-selection/', cat: 'SPORTS', title: '스포츠 배당 보는 법', desc: '배당, 마진, 리스크를 한 번에 비교하는 방법입니다.' },
  { href: '/blog/toto-muktu-danger-signals/', cat: 'RISK', title: '먹튀 구분 핵심 신호', desc: '가입 전 피해야 할 패턴과 증거 확인 순서입니다.' },
  { href: '/blog/guaranteed-before-click-checks/', cat: 'CHECK', title: '보증업체 선택 기준', desc: '광고 문구보다 먼저 확인해야 할 운영 기준입니다.' },
  { href: '/blog/domain-ip-first-check-order/', cat: 'DOMAIN', title: '도메인·IP 조회 루틴', desc: '주소 변경과 유사 운영 흔적을 점검하는 순서입니다.' },
  { href: '/blog/max-withdraw-meaning/', cat: 'PAYOUT', title: '최대출금 조건 이해', desc: '보너스와 출금 제한이 같이 걸리는 지점을 확인합니다.' },
  { href: '/blog/major-site-criteria-15/', cat: 'MAJOR', title: '메이저 사이트 기준', desc: '오래 운영되는 사이트의 공통 체크포인트입니다.' },
  { href: '/blog/evidence-checklist-before-report/', cat: 'EVIDENCE', title: '증거 캡처 체크리스트', desc: '상담 전 준비하면 처리 속도가 빨라지는 자료입니다.' },
  { href: '/blog/bonus-withdraw-check-routine/', cat: 'WITHDRAW', title: '보너스 출금 확인 루틴', desc: '보너스 수령 후 출금 가능 조건을 순서대로 확인합니다.' },
  { href: '/blog/google-muktu-search-guide/', cat: 'SEARCH', title: '구글 먹튀 검색 요령', desc: '검색어 조합과 후기 필터링 기준을 함께 정리했습니다.' },
  { href: '/blog/major-playground-warning-signs/', cat: 'WARNING', title: '메이저 사칭 경고 신호', desc: '비슷한 이름과 복제 페이지를 구분하는 체크포인트입니다.' },
  { href: '/blog/online-casino/evolution-baccarat-before-check.html', cat: 'CASINO', title: '에볼루션 바카라 전 확인', desc: '테이블 규칙과 이벤트 적용 범위를 먼저 확인합니다.' },
  { href: '/blog/game-guides/terms-rolling-toxic-clause.html', cat: 'TERMS', title: '위험한 롤링 약관 패턴', desc: '조건 문구 안에 숨어 있는 제한 조항을 빠르게 찾습니다.' }
];

const tools = [
  { href: '/tools/official-check/', icon: '◇', title: '공식 주소 확인', desc: '도메인·채널 일치 여부' },
  { href: '/tools/bonus-calculator/', icon: '₩', title: '보너스 계산', desc: '첫충·매충 실수령 계산' },
  { href: '/tools/rolling-calculator/', icon: '%', title: '롤링 계산기', desc: '조건 충족 금액 확인' },
  { href: '/tools/ai-sports-odds-analysis/', icon: '↗', title: '스포츠 배당 분석', desc: '마진·확률·EV 점검' },
  { href: '/tools/slot-rtp/', icon: '▣', title: '슬롯 RTP 보기', desc: 'RTP·변동성 비교' }
];

const partnerImgs = partners.map((p) => `/assets/img/partners/v71-${p.file}`);

const partnerCards = partnerImgs.map((src, idx) => `<a class="v71-partner-card v71-glow-border" href="/guaranteed/" aria-label="프리미엄 보증업체 ${idx + 1} 보기"><img src="${src}" alt="" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async"></a>`).join('');
const blogCards = blogs.map((b) => `<a class="v71-blog-card v71-glass" href="${b.href}"><em>${b.cat}</em><strong>${b.title}</strong><span>${b.desc}</span></a>`).join('');
const toolCards = tools.map((t) => `<a class="v71-tool-card v71-glass" href="${t.href}"><span class="v71-tool-icon">${t.icon}</span><strong>${t.title}</strong><span>${t.desc}</span></a>`).join('');

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>88ST.Cloud | 보증업체·분석 도구·자동 상담 플랫폼</title>
  <meta name="description" content="88ST.Cloud는 보증업체 큐레이션, 최신 정보 콘텐츠, 실사용 분석 도구, 텔레그램 자동 상담을 한곳에 연결하는 정보 플랫폼입니다.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0B0F19">
  <link rel="canonical" href="https://88st.cloud/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="88ST.Cloud">
  <meta property="og:title" content="88ST.Cloud | 보증업체·분석 도구·자동 상담 플랫폼">
  <meta property="og:description" content="보증업체, 블로그 가이드, 분석 도구, 상담 연결을 모바일 퍼스트 대시보드로 제공합니다.">
  <link rel="preload" as="image" href="/assets/img/partners/v71-sk-holdings.svg">
  <link rel="stylesheet" href="/assets/css/v71.main-home.css?v=${VERSION}" data-v71-main="true">
</head>
<body class="v71-main-home">
  <div class="v71-bg-orb" aria-hidden="true"></div>
  <div class="v71-page">
    <header class="v71-topbar">
      <div class="v71-shell v71-topbar-inner">
        <a class="v71-logo" href="/" aria-label="88ST.Cloud 홈">
          <span class="v71-logo-mark">88</span>
          <span class="v71-logo-word"><strong>88ST.Cloud</strong><span>Verified Platform</span></span>
        </a>
        <nav class="v71-desktop-nav" aria-label="주요 메뉴">
          <a href="/" aria-current="page">메인</a>
          <a href="/blog/">블로그</a>
          <a href="/tools/">도구</a>
          <a href="/guaranteed/">보증업체</a>
          <a href="/consult/">상담</a>
        </nav>
        <button class="v71-menu-btn" type="button" aria-label="메뉴 열기" data-v71-menu><span></span></button>
      </div>
    </header>

    <main class="v71-main">
      <section class="v71-hero v71-shell" aria-label="플랫폼 빠른 시작">
        <div class="v71-hero-card v71-glass v71-glow-border">
          <div class="v71-hero-copy">
            <span class="v71-kicker">88ST.CLOUD PLATFORM</span>
            <p class="v71-value-line">보증업체, 최신 가이드, 분석 도구, 공식 상담을 한 화면에서 확인합니다.</p>
            <div class="v71-value-pills" aria-label="핵심 기능">
              <span>보증업체 큐레이션</span>
              <span>실사용 계산 도구</span>
              <span>텔레그램 상담 연결</span>
            </div>
          </div>
          <div class="v71-hero-actions">
            <a class="v71-btn v71-btn-primary" href="/guaranteed/">보증업체 보기</a>
            <a class="v71-btn v71-btn-ghost" href="/consult/">자동 상담 시작</a>
          </div>
        </div>
      </section>

      <section class="v71-section v71-mobile-partners" aria-label="프리미엄 보증업체">
        <div class="v71-shell v71-section-head">
          <div><h2>프리미엄 보증업체</h2><p>모바일에서는 이미지만 넘겨보는 가로 슬라이더로 표시합니다.</p></div>
          <a class="v71-more" href="/guaranteed/">전체 보기</a>
        </div>
        <div class="v71-partner-carousel" aria-label="보증업체 로고 슬라이더">
          ${partnerCards}
        </div>
      </section>

      <section class="v71-section v71-shell v71-main-hub" aria-label="블로그와 보증업체 허브">
        <div>
          <div class="v71-section-head">
            <div><h2>최신 정보 가이드</h2><p>검색 유입과 체류시간을 만드는 핵심 콘텐츠 15건입니다.</p></div>
            <a class="v71-more" href="/blog/">블로그 더보기</a>
          </div>
          <div class="v71-blog-grid">
            ${blogCards}
          </div>
        </div>
        <aside class="v71-desktop-partner-panel" aria-label="PC 보증업체 로고 패널">
          <div class="v71-section-head">
            <div><h2>Premium Partners</h2><p>PC에서는 우측 타일형 이미지 카드로 고정 노출합니다.</p></div>
          </div>
          <div class="v71-partner-tile-grid">
            ${partnerCards}
          </div>
        </aside>
      </section>

      <section class="v71-section v71-shell" aria-label="실사용 분석 도구">
        <div class="v71-section-head">
          <div><h2>실사용 분석 도구</h2><p>입력부터 결과 확인까지 모바일 터치 흐름에 맞춘 5개 핵심 도구입니다.</p></div>
          <a class="v71-more" href="/tools/">도구 전체</a>
        </div>
        <div class="v71-tools-grid">
          ${toolCards}
        </div>
      </section>

      <section class="v71-section v71-shell" aria-label="플랫폼 신뢰 지표">
        <div class="v71-metrics">
          <div class="v71-metric v71-glass"><strong>5</strong><span>프리미엄 파트너</span></div>
          <div class="v71-metric v71-glass"><strong>15</strong><span>상단 추천 가이드</span></div>
          <div class="v71-metric v71-glass"><strong>5</strong><span>핵심 분석 도구</span></div>
          <div class="v71-metric v71-glass"><strong>24H</strong><span>텔레그램 상담 연결</span></div>
        </div>
      </section>

      <section class="v71-section v71-shell" aria-label="공식 상담 센터">
        <div class="v71-consult-banner v71-glass v71-glow-border">
          <div>
            <h2>조건이 애매하면 공식 상담센터에서 바로 확인하세요.</h2>
            <p>가입코드, 주소, 이벤트 조건, 롤링 계산이 헷갈릴 때 @TRS999_bot으로 연결하면 필요한 정보를 빠르게 정리할 수 있습니다.</p>
          </div>
          <a class="v71-telegram" href="https://t.me/TRS999_bot" rel="nofollow noopener" target="_blank">@TRS999_bot 상담 연결</a>
        </div>
      </section>
    </main>

    <footer class="v71-footer">
      <div class="v71-shell v71-footer-inner">
        <strong>88ST.Cloud</strong>
        <span>보증업체 큐레이션, 최신 가이드, 계산 도구, 자동 상담 연결을 제공하는 모바일 퍼스트 정보 플랫폼입니다.</span>
      </div>
    </footer>
  </div>

  <a class="v71-fab" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener" aria-label="텔레그램 상담 연결">↗</a>
  <nav class="v71-mobile-nav" aria-label="모바일 하단 내비게이션">
    <a href="/" aria-current="page"><span>⌂</span>메인</a>
    <a href="/blog/"><span>▤</span>블로그</a>
    <a href="/tools/"><span>◇</span>도구</a>
    <a href="/guaranteed/"><span>◆</span>보증</a>
    <a href="/consult/"><span>✦</span>상담</a>
  </nav>
  <script src="/assets/js/v71.main-home.js?v=${VERSION}" defer data-v71-main="true"></script>
</body>
</html>
`;

const report = `# V71 Main Homepage Redesign Report\n\n## Scope\n- 메인 페이지 /index.html 전면 재설계\n- PC/모바일 분기형 레이아웃 적용\n- 기존 하위 페이지, Worker, 라우팅, 블로그/도구 본문 삭제 없음\n\n## Design Guide\n- Background: #0B0F19 / #050816\n- Primary: #10B981\n- Secondary: #2563EB\n- Radius: 12px base, 22px large glass cards\n- Blur: 22px backdrop-filter\n- Shadows: 0 12px 28px rgba(0,0,0,.22), 0 30px 90px rgba(0,0,0,.42)\n\n## Layout\n- Mobile: Compact quick-start band -> Partner carousel -> 15 Blog cards -> Tool grid -> Metrics -> Telegram CTA\n- PC: Compact quick-start band -> Left blog grid 5x3 + right partner logo tiles -> Tools 5-wide -> CTA banner\n\n## Tailwind Class Mapping\n- Glass card: bg-white/[0.07] backdrop-blur-[22px] border border-white/10 shadow-sm rounded-xl\n- Primary CTA: h-[52px] rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-400\n- Mobile shell: px-5 max-w-[430px]\n- PC hub: lg:grid lg:grid-cols-[1.55fr_.72fr] lg:gap-5\n- Blog grid: grid grid-cols-2 lg:grid-cols-5 gap-3, 15 cards for 5x3 desktop rows\n- Partner carousel: overflow-x-auto snap-x grid grid-flow-col auto-cols-[74%]\n\n## Verification Targets\n- index.html contains v71 stylesheet/script only for main redesign\n- v70 duplicate headers/navs are not present in index.html\n- partner cards: 5\n- blog cards: 10\n- tool cards: 5\n`;

write('assets/css/v71.main-home.css', css);
write('assets/js/v71.main-home.js', js);
write('index.html', html);
write('V71_MAIN_REDESIGN_REPORT.md', report);

const packagePath = 'package.json';
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.scripts.verify = 'node scripts/verify-v71-main-homepage.mjs';
packageJson.scripts['quality:v71'] = 'node scripts/generate-v71-main-homepage.mjs';
packageJson.scripts['verify:v71'] = 'node scripts/verify-v71-main-homepage.mjs';
if (!packageJson.scripts.build.includes('node scripts/generate-v71-main-homepage.mjs')) {
  packageJson.scripts.build = packageJson.scripts.build.replace(' && node scripts/gen-build-ver.mjs', ' && node scripts/generate-v71-main-homepage.mjs && node scripts/gen-build-ver.mjs');
}
write(packagePath, `${JSON.stringify(packageJson, null, 2)}
`);

console.log('[V71] Main homepage redesigned:', VERSION);
