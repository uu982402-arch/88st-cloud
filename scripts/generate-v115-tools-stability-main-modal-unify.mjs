import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const cssHref = '/assets/css/v115-tools-stability-main-modal-unify.css?v=v115-tools-stability-main-modal-unify-20260527';
const jsHref = '/assets/js/v115-tools-stability-main-modal-unify.js?v=v115-tools-stability-main-modal-unify-20260527';
function patchPage(rel){
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-v115-tools-stability="active"')) html = html.replace(/<html([^>]*)>/, '<html$1 data-v115-tools-stability="active">');
  if (!html.includes('data-v115-tools-stability="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v115-tools-stability="true">');
  if (rel === 'index.html') {
    const replacement = `<div class="v71-tools-grid" data-v115-home-tools="true">
          <a class="v71-tool-card v71-glass" href="#home-tool-official" role="button" data-v115-main-tool="official" data-ga4-event="tool_open"><span class="v71-tool-icon">◇</span><strong>공식 주소 확인</strong><span>도메인·채널 일치 여부</span></a>
          <a class="v71-tool-card v71-glass" href="#home-tool-bonus" role="button" data-v115-main-tool="bonus" data-ga4-event="tool_open"><span class="v71-tool-icon">₩</span><strong>보너스 계산</strong><span>첫충·매충 실수령 계산</span></a>
          <a class="v71-tool-card v71-glass" href="#home-tool-rolling" role="button" data-v115-main-tool="rolling" data-ga4-event="tool_open"><span class="v71-tool-icon">%</span><strong>롤링 계산기</strong><span>조건 충족 금액 확인</span></a>
          <a class="v71-tool-card v71-glass" href="#home-tool-sports" role="button" data-v115-main-tool="sports" data-ga4-event="tool_open"><span class="v71-tool-icon">↗</span><strong>스포츠 배당 분석</strong><span>마진·확률·EV 점검</span></a>
          <a class="v71-tool-card v71-glass" href="#home-tool-slot" role="button" data-v115-main-tool="slot" data-ga4-event="tool_open"><span class="v71-tool-icon">▣</span><strong>슬롯 RTP 보기</strong><span>RTP·변동성 비교</span></a>
        </div>`;
    html = html.replace(/<div class="v71-tools-grid"(?:[^>]*)>[\s\S]*?<\/div>\s*<\/section>\s*<section class="v71-section v71-shell" aria-label="플랫폼 신뢰 지표">/, replacement + `
      </section>

      <section class="v71-section v71-shell" aria-label="플랫폼 신뢰 지표">`);
  }
  if (!html.includes('/assets/css/v115-tools-stability-main-modal-unify.css')) html = html.replace('</head>', `  <meta name="v115-tools-stability-main-modal-unify" content="V115_TOOLS_STABILITY_MAIN_MODAL_UNIFY_ACTIVE">\n  <link rel="stylesheet" href="${cssHref}" data-v115-tools-stability="true">\n</head>`);
  if (!html.includes('/assets/js/v115-tools-stability-main-modal-unify.js')) html = html.replace('</body>', `  <script src="${jsHref}" defer data-v115-tools-stability="true"></script>\n</body>`);
  fs.writeFileSync(file, html);
}
patchPage('index.html');
patchPage('tools/index.html');
fs.writeFileSync(path.join(ROOT,'build.txt'),'88ST.Cloud build V115 TOOLS STABILITY LOCK MAIN MODAL UNIFY PATCH\n2026-05-27T01:15:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'),"window.__RUST_BUILD_VERSION__ = 'V115-TOOLS-STABILITY-MAIN-MODAL-UNIFY-20260527';\nwindow.__RUST_BUILD_LABEL__ = 'V115 TOOLS STABILITY LOCK / MAIN TOOL MODAL UNIFY PATCH';\n");
console.log('[V115] tools stability and main modal unify applied');
