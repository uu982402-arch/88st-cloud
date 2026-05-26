import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const pages = ['index.html','guaranteed/index.html'];
const cssPath = path.join(ROOT, 'assets/css/v102-4-home-premium-mobile-swipe-lock.css');
if (!fs.existsSync(cssPath)) throw new Error('missing css asset: assets/css/v102-4-home-premium-mobile-swipe-lock.css');
const removeMobilePartners = (html) => html.replace(/\n?\s*<section[^>]*class="[^"]*v71-mobile-partners[^"]*"[\s\S]*?<\/section>\s*/g, '\n');
const inlineCss = `\n<style id="v102-4-force-home-premium-layout">\nbody[data-v102-4-home-premium-mobile-swipe="true"] section.v71-mobile-partners,body[data-v102-4-home-premium-mobile-swipe="true"] .v71-mobile-partners{display:none!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;visibility:hidden!important;pointer-events:none!important}\nbody[data-v102-4-home-premium-mobile-swipe="true"] .v71-desktop-partner-panel .v71-partner-tile-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(8px,1.8vw,15px)!important;width:min(760px,100%)!important;max-width:760px!important;margin-inline:auto!important;overflow:visible!important}\nbody[data-v102-4-home-premium-mobile-swipe="true"] .v71-desktop-partner-panel .v71-partner-card{aspect-ratio:3/4!important;width:100%!important;min-width:0!important;display:grid!important;place-items:center!important;overflow:hidden!important}\nbody[data-v102-4-home-premium-mobile-swipe="true"] .v71-desktop-partner-panel .v71-partner-card img{width:100%!important;height:100%!important;object-fit:contain!important;padding:clamp(6px,1.15vw,12px)!important}\n@media(max-width:720px){body[data-v102-4-home-premium-mobile-swipe="true"] .v71-desktop-partner-panel .v71-partner-tile-grid{display:flex!important;grid-template-columns:none!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x proximity!important;-webkit-overflow-scrolling:touch!important;padding:0 12px 8px!important;margin-inline:0!important;width:100%!important;max-width:100%!important;scrollbar-width:none!important}body[data-v102-4-home-premium-mobile-swipe="true"] .v71-desktop-partner-panel .v71-partner-tile-grid::-webkit-scrollbar{display:none!important}body[data-v102-4-home-premium-mobile-swipe="true"] .v71-desktop-partner-panel .v71-partner-card{flex:0 0 clamp(156px,43vw,210px)!important;width:clamp(156px,43vw,210px)!important;max-width:210px!important;scroll-snap-align:start!important}}\n</style>\n`;
for (const file of pages) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, 'utf8');
  html = removeMobilePartners(html);
  if (!html.includes('data-v102-4-home-premium-mobile-swipe="active"')) html = html.replace(/<html([^>]*)>/, '<html$1 data-v102-4-home-premium-mobile-swipe="active">');
  if (!html.includes('/assets/css/v102-4-home-premium-mobile-swipe-lock.css')) html = html.replace('</head>', '  <meta name="v102-4-home-premium-mobile-swipe-lock" content="V102_4_HOME_PREMIUM_MOBILE_SWIPE_LOCK_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v102-4-home-premium-mobile-swipe-lock.css?v=v102-4-home-premium-mobile-swipe-lock-20260526" data-v102-4-home-premium-mobile-swipe="true">\n</head>');
  if (file === 'index.html' && !html.includes('v102-4-force-home-premium-layout')) html = html.replace('</head>', inlineCss + '</head>');
  if (!html.includes('data-v102-4-home-premium-mobile-swipe="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v102-4-home-premium-mobile-swipe="true">');
  if (file === 'index.html') {
    html = html.replace(/보증업체 이미지를 [23]개씩 [두세] 줄로 정리해 보여줍니다\./g, 'PC에서는 2개씩 세 줄, 모바일에서는 옆으로 넘겨 확인합니다.');
    html = html.replace('PC에서는 보증업체 이미지를 타일형으로 정리해 보여줍니다.', 'PC에서는 2개씩 세 줄, 모바일에서는 옆으로 넘겨 확인합니다.');
  }
  fs.writeFileSync(full, html);
}
fs.writeFileSync(path.join(ROOT,'build.txt'), '88ST.Cloud build V102.4 HOME PREMIUM MOBILE SWIPE LOCK\n2026-05-26T08:40:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V102.4-HOME-PREMIUM-MOBILE-SWIPE-LOCK-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V102.4 HOME PREMIUM MOBILE SWIPE LOCK';\n");
console.log('[V102.4] duplicate top vendor block removed, home premium mobile swipe restored');
