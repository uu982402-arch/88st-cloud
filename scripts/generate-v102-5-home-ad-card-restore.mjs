import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const css = 'assets/css/v102-5-home-ad-card-restore.css';
if (!fs.existsSync(path.join(ROOT, css))) throw new Error(`missing ${css}`);
const pages = ['index.html','guaranteed/index.html'];
for (const page of pages) {
  const full = path.join(ROOT, page);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('data-v102-5-home-ad-restore="active"')) html = html.replace('<html ', '<html data-v102-5-home-ad-restore="active" ');
  html = html.replace(/\n?<style id="v102-4-force-home-premium-layout">[\s\S]*?<\/style>\n?/g, '\n');
  if (!html.includes('/assets/css/v102-5-home-ad-card-restore.css')) {
    html = html.replace('</head>', '  <meta name="v102-5-home-ad-card-restore" content="V102_5_HOME_AD_CARD_RESTORE_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v102-5-home-ad-card-restore.css?v=v102-5-home-ad-card-restore-20260526" data-v102-5-home-ad-restore="true">\n</head>');
  }
  if (!html.includes('data-v102-5-home-ad-restore="true"')) html = html.replace('<body ', '<body data-v102-5-home-ad-restore="true" ');
  if (page === 'index.html') {
    html = html.replace('PC에서는 2개씩 세 줄, 모바일에서는 옆으로 넘겨 확인합니다.', 'PC에서는 크게 보이는 세로형 추천 카드, 모바일에서는 옆으로 넘겨 확인합니다.');
    html = html.replace('PC에서는 보증업체 이미지를 타일형으로 정리해 보여줍니다.', 'PC에서는 크게 보이는 세로형 추천 카드, 모바일에서는 옆으로 넘겨 확인합니다.');
    html = html.replace('보증업체 이미지를 2개씩 세 줄로 정리해 보여줍니다.', 'PC에서는 크게 보이는 세로형 추천 카드, 모바일에서는 옆으로 넘겨 확인합니다.');
  }
  fs.writeFileSync(full, html);
}
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V102.5 HOME AD CARD RESTORE PATCH\n2026-05-26T08:55:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V102.5-HOME-AD-CARD-RESTORE-PATCH-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V102.5 HOME AD CARD RESTORE PATCH';\n");
console.log('[V102.5] home ad card restore applied');
