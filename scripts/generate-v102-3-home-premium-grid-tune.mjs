import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const cssPath = path.join(ROOT, 'assets/css/v102-3-home-premium-grid-tune.css');
const cssVersion = 'v102-3-home-premium-grid-tune-20260526';
const pages = ['index.html','guaranteed/index.html'];
const ensure = (file) => {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('data-v102-3-home-premium-grid="active"')) {
    html = html.replace('<html ', '<html data-v102-3-home-premium-grid="active" ');
  }
  if (!html.includes('/assets/css/v102-3-home-premium-grid-tune.css')) {
    html = html.replace('</head>', `  <meta name="v102-3-home-premium-grid-tune" content="V102_3_HOME_PREMIUM_GRID_TUNE_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v102-3-home-premium-grid-tune.css?v=${cssVersion}" data-v102-3-home-premium-grid="true">\n</head>`);
  }
  if (!html.includes('data-v102-3-home-premium-grid="true"')) {
    html = html.replace('<body ', '<body data-v102-3-home-premium-grid="true" ');
  }
  if (file === 'index.html') {
    html = html.replace('보증업체 이미지를 3개씩 두 줄로 정리해 보여줍니다.', '보증업체 이미지를 2개씩 세 줄로 정리해 보여줍니다.');
  }
  fs.writeFileSync(full, html);
};
if (!fs.existsSync(cssPath)) throw new Error('missing css asset: assets/css/v102-3-home-premium-grid-tune.css');
for (const page of pages) ensure(page);
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V102.3 HOME PREMIUM GRID TUNE PATCH\n2026-05-26T08:15:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V102.3-HOME-PREMIUM-GRID-TUNE-PATCH-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V102.3 HOME PREMIUM GRID TUNE PATCH';\n");
console.log('[V102.3] Home premium 2x3 / guaranteed 3x2 grid tune applied');
