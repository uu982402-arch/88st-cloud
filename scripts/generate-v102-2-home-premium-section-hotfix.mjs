import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V102.2_HOME_PREMIUM_SECTION_HOTFIX';
const cssHref = '/assets/css/v102-2-home-premium-section-hotfix.css?v=v102-2-home-premium-section-hotfix-20260526';
const indexPath = path.join(ROOT, 'index.html');
const cssPath = path.join(ROOT, 'assets/css/v102-2-home-premium-section-hotfix.css');

const css = `/* V102.2 HOME PREMIUM SECTION HOTFIX
   목적: 메인 최상단에 잘못 추가된 6개 광고 이미지 블록 제거.
   광고카드 이미지는 기존 프리미엄 보증업체 섹션 안에서만 3 x 2 배치 유지. */
:root{--v102-2-gap:clamp(7px,1.7vw,14px)}
html[data-v102-2-home-premium="active"],
html[data-v102-2-home-premium="active"] body{width:100%;max-width:100%;overflow-x:hidden}
body[data-v102-2-home-premium="true"] .v71-mobile-partners{display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;visibility:hidden!important}
body[data-v102-2-home-premium="true"] .v71-main{padding-top:clamp(10px,2.5vw,18px)!important}
body[data-v102-2-home-premium="true"] .v71-main-hub{margin-top:0!important}
body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel{min-width:0;max-width:100%}
body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-section-head p{font-size:12px;line-height:1.45}
body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-tile-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-flow:row!important;gap:var(--v102-2-gap)!important;width:100%!important;max-width:100%!important;margin-inline:auto!important;padding:0!important;overflow:visible!important;scroll-snap-type:none!important}
body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-card,
body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-card:first-child{grid-column:auto!important;display:grid!important;place-items:center!important;width:100%!important;min-width:0!important;max-width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:3/4!important;flex:none!important;overflow:hidden!important;border-radius:clamp(13px,2.4vw,22px)!important;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(238,242,247,.94))!important;transform:none!important}
body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-card img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;object-fit:contain!important;object-position:center!important;padding:clamp(5px,1.2vw,12px)!important;transform:none!important;filter:none!important;background:transparent!important}
@media(max-width:1023px){
  body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel{display:grid!important;gap:12px!important;position:static!important;top:auto!important;margin-top:18px!important}
  body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-section-head{margin-bottom:10px!important}
  body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-section-head p{display:none!important}
}
@media(max-width:720px){
  body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-tile-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
}
@media(max-width:360px){
  body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-tile-grid{gap:6px!important}
  body[data-v102-2-home-premium="true"] .v71-desktop-partner-panel .v71-partner-card{border-radius:11px!important}
}
`;
fs.mkdirSync(path.dirname(cssPath), { recursive: true });
fs.writeFileSync(cssPath, css, 'utf8');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/ data-v102-2-home-premium="active"/g, '').replace(/ data-v102-2-home-premium="true"/g, '');
html = html.replace(/<meta name="v102-2-home-premium-section-hotfix"[^>]*>\s*/g, '');
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/css\/v102-2-home-premium-section-hotfix\.css[^>]*>\s*/g, '\n');

// Remove the duplicated top mobile/intro ad block only. The existing premium partner section inside the main hub remains.
html = html.replace(/\n\s*<section class="v71-section v71-mobile-partners" aria-label="프리미엄 보증업체">[\s\S]*?\n\s*<\/section>\n\s*\n\s*(?=<section class="v71-section v71-shell v71-main-hub")/, '\n');

html = html.replace(/<html([^>]*)>/, (m, attrs) => `<html${attrs} data-v102-2-home-premium="active">`);
html = html.replace(/<body([^>]*)>/, (m, attrs) => `<body${attrs} data-v102-2-home-premium="true">`);
html = html.replace(/(<meta name="v102-1-ad-image-grid-hotfix"[^>]*>)/, `$1\n  <meta name="v102-2-home-premium-section-hotfix" content="${VERSION}">`);
html = html.replace(/(<link rel="stylesheet" href="\/assets\/css\/v102-1-ad-image-grid-hotfix\.css[^>]*>)/, `$1\n  <link rel="stylesheet" href="${cssHref}" data-v102-2-home-premium="true">`);
html = html.replace(/광고 이미지를 3개씩 두 줄로 정리했습니다\./g, '보증업체 이미지를 기존 프리미엄 섹션 안에서만 정리합니다.');
html = html.replace(/보증업체 이미지를 3개씩 두 줄로 정리해 보여줍니다\./g, '보증업체 이미지를 3개씩 두 줄로 정리해 보여줍니다.');
fs.writeFileSync(indexPath, html, 'utf8');

fs.writeFileSync(path.join(ROOT, 'build.txt'), `88ST.Cloud build V102.2 HOME PREMIUM SECTION HOTFIX\n${new Date().toISOString()}\n`, 'utf8');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), `window.__RUST_BUILD_VERSION__ = 'V102.2-HOME-PREMIUM-SECTION-HOTFIX-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V102.2 HOME PREMIUM SECTION HOTFIX';\n`, 'utf8');
console.log('[V102.2] home premium section hotfix applied');
