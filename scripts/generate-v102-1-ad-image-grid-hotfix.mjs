import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'v102-1-ad-image-grid-hotfix-20260526';
const CSS_HREF = `/assets/css/v102-1-ad-image-grid-hotfix.css?v=${VERSION}`;
const targets = ['index.html', 'guaranteed/index.html'];
function read(p){ return fs.readFileSync(path.join(ROOT,p),'utf8'); }
function write(p,s){ fs.writeFileSync(path.join(ROOT,p),s); }
function inject(file){
  let html = read(file);
  html = html.replace(/<html([^>]*)>/, (m, attrs) => attrs.includes('data-v102-1-ad-image-grid') ? m : `<html${attrs} data-v102-1-ad-image-grid="active">`);
  html = html.replace(/<body([^>]*)>/, (m, attrs) => attrs.includes('data-v102-1-ad-image-grid') ? m : `<body${attrs} data-v102-1-ad-image-grid="true">`);
  if (!html.includes('name="v102-1-ad-image-grid-hotfix"')) {
    html = html.replace(/<head>/, `<head>\n  <meta name="v102-1-ad-image-grid-hotfix" content="V102_1_AD_IMAGE_GRID_HOTFIX_ACTIVE">`);
  }
  const link = `<link rel="stylesheet" href="${CSS_HREF}" data-v102-1-ad-image-grid="true">`;
  if (!html.includes('v102-1-ad-image-grid-hotfix.css')) {
    if (html.includes('data-v102-live-ux="true">')) {
      html = html.replace(/(<link rel="stylesheet" href="\/assets\/css\/v102-live-ux-polish-cta-final\.css[^>]*data-v102-live-ux="true">)/, `$1\n  ${link}`);
    } else {
      html = html.replace('</head>', `  ${link}\n</head>`);
    }
  }
  if (file === 'index.html') {
    html = html.replace('카드 이미지를 넘겨 보고 상세에서 조건을 확인합니다.', '광고 이미지를 3개씩 두 줄로 정리했습니다.');
    html = html.replace('PC에서는 보증업체 이미지를 타일형으로 정리해 보여줍니다.', '보증업체 이미지를 3개씩 두 줄로 정리해 보여줍니다.');
  }
  write(file, html);
}
for (const file of targets) inject(file);
fs.writeFileSync(path.join(ROOT,'build.txt'), `88ST.Cloud build V102.1 AD IMAGE GRID HOTFIX\n${new Date().toISOString()}\n`);
const buildVer = `window.__RUST_BUILD_VERSION__ = 'V102.1-AD-IMAGE-GRID-HOTFIX-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V102.1 AD IMAGE GRID HOTFIX';\n`;
fs.mkdirSync(path.join(ROOT,'assets/js'), { recursive:true });
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'), buildVer);
console.log('V102.1 ad image grid hotfix applied:', targets.join(', '));
