import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const file = path.join(ROOT, 'tools/index.html');
const css = '/assets/css/v103-tools-expansion.css?v=v103-tools-expansion-20260526';
const js = '/assets/js/v103-tools-expansion.js?v=v103-tools-expansion-20260526';
const section = `

      <section class="v103-tool-wrap" aria-label="실사용 보강 도구" data-v103-tools-section="true">
        <div class="v103-tool-head">
          <div>
            <small>V103 PRACTICAL TOOLS</small>
            <h2>실사용 보강 도구</h2>
            <p>가입코드 매칭, 보너스 실수령, 출금 조건, 도메인 변경 메모를 외부 API 없이 브라우저 안에서 바로 확인합니다.</p>
          </div>
        </div>
        <div class="v103-tool-grid">
          <button class="v103-tool-card" type="button" data-v103-open="match" data-ga4-event="tool_open" style="--tone:rgba(34,211,238,.18);--tone-shadow:rgba(34,211,238,.16)"><span class="v103-tool-icon">⌗</span><b>가입코드 매칭 체크 PRO</b><span>업체명·코드·공식주소에 같은 코드가 맞게 들어갔는지 상담 전 확인합니다.</span><i class="v103-tool-open">실행하기</i></button>
          <button class="v103-tool-card" type="button" data-v103-open="bonuspro" data-ga4-event="tool_open" style="--tone:rgba(246,201,107,.18);--tone-shadow:rgba(246,201,107,.16)"><span class="v103-tool-icon">₩</span><b>보너스 실수령 PRO</b><span>입금액, 보너스율, 롤링 배수, 최대출금을 한 번에 계산합니다.</span><i class="v103-tool-open">실행하기</i></button>
          <button class="v103-tool-card" type="button" data-v103-open="withdraw" data-ga4-event="tool_open" style="--tone:rgba(255,122,26,.18);--tone-shadow:rgba(255,122,26,.16)"><span class="v103-tool-icon">✓</span><b>출금 조건 체크리스트</b><span>보너스 사용, 롤링 완료, 제외게임, 최대출금 한도를 출금 전 점검합니다.</span><i class="v103-tool-open">실행하기</i></button>
          <button class="v103-tool-card" type="button" data-v103-open="domainmemo" data-ga4-event="tool_open" style="--tone:rgba(139,92,246,.18);--tone-shadow:rgba(139,92,246,.16)"><span class="v103-tool-icon">↺</span><b>도메인 변경 메모장</b><span>주소 변경 이력과 상담 답변을 브라우저 localStorage에 기록합니다.</span><i class="v103-tool-open">실행하기</i></button>
        </div>
      </section>
`;
const modal = `
  <div class="v103-modal" data-v103-modal aria-hidden="true">
    <section class="v103-modal__panel" role="dialog" aria-modal="true" aria-labelledby="v103-modal-title">
      <header class="v103-modal__head">
        <div><small data-v103-label>PRACTICAL TOOL</small><h2 id="v103-modal-title" data-v103-title>실사용 도구</h2></div>
        <button class="v103-close" type="button" data-v103-close aria-label="닫기">×</button>
      </header>
      <div class="v103-modal__body">
        <form class="v103-form" data-v103-form onsubmit="return false"></form>
        <div class="v103-result"><b data-v103-result>준비됨</b><pre data-v103-note>도구를 선택하면 결과가 표시됩니다.</pre></div>
        <div class="v103-actions"><button class="is-primary" type="button" data-v103-copy>결과 복사</button><button type="button" data-v103-consult>상담 연결</button><button type="button" data-v103-reset>초기화</button></div>
      </div>
    </section>
  </div>
  <div class="v103-toast" data-v103-toast role="status" aria-live="polite">복사 완료</div>
`;
let html = fs.readFileSync(file, 'utf8');
if (!html.includes('data-v103-tools-expansion="active"')) html = html.replace('<html lang="ko" ', '<html lang="ko" data-v103-tools-expansion="active" ');
html = html.replaceAll('8개 핵심 도구', '12개 실사용 도구');
html = html.replaceAll('배당 마진, 기대값, 롤링 조건, 보너스 실수령, 스포츠 체크를 빠르게 계산하고 조건을 비교하는 RUST 도구 대시보드입니다.', '배당 마진, 기대값, 롤링 조건, 보너스 실수령, 출금 조건, 도메인 메모까지 빠르게 계산하고 조건을 비교하는 RUST 도구 대시보드입니다.');
html = html.replaceAll('RUST 도구 | 배당·EV·롤링·보너스 계산', 'RUST 도구 | 배당·EV·롤링·보너스·출금 체크');
if (!html.includes('/assets/css/v103-tools-expansion.css')) html = html.replace('</head>', `  <meta name="v103-tools-expansion" content="V103_TOOLS_EXPANSION_PRACTICAL_CALCULATOR_ACTIVE">\n  <link rel="stylesheet" href="${css}" data-v103-tools-expansion="true">\n</head>`);
if (!html.includes('data-v103-tools-expansion="true"')) html = html.replace('<body ', '<body data-v103-tools-expansion="true" ');
if (!html.includes('data-v103-tools-section="true"')) html = html.replace('      </div>\n\n      <aside class="v73-footer-cta"', '      </div>' + section + '\n\n      <aside class="v73-footer-cta"');
if (!html.includes('data-v103-modal')) html = html.replace('  <div class="v73-toast"', modal + '\n  <div class="v73-toast"');
if (!html.includes('/assets/js/v103-tools-expansion.js')) html = html.replace('</body>', `  <script src="${js}" defer data-v103-tools-expansion="true"></script>\n</body>`);
fs.writeFileSync(file, html);
fs.writeFileSync(path.join(ROOT,'build.txt'),'88ST.Cloud build V103 TOOLS EXPANSION PRACTICAL CALCULATOR PATCH\n2026-05-26T12:00:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'),"window.__RUST_BUILD_VERSION__ = 'V103-TOOLS-EXPANSION-PRACTICAL-CALCULATOR-PATCH-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V103 TOOLS EXPANSION PRACTICAL CALCULATOR PATCH';\n");
console.log('[V103] tools expansion practical calculators ensured');
