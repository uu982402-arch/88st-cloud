import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const file = path.join(ROOT, 'tools/index.html');
if (!fs.existsSync(file)) throw new Error('tools/index.html missing');
const cssPath = path.join(ROOT, 'assets/css/v103-1-tools-section-unify.css');
if (!fs.existsSync(cssPath)) throw new Error('missing assets/css/v103-1-tools-section-unify.css');
const unifiedCards = `

        <button class="v73-tool-card v103-unified-tool-card" type="button" data-v103-open="match" data-tool-id="v103-match" data-base="76" data-ga4-event="tool_open" style="--tone:rgba(34,211,238,.18);--tone-strong:#22d3ee;--tone-shadow:rgba(34,211,238,.18)">
          <span class="v73-tool-card__body">
            <span class="v73-tool-icon" aria-hidden="true">⌗</span>
            <h2>가입코드 매칭 체크 PRO</h2>
            <p>업체명·코드·공식주소가 같은 흐름인지 상담 전 빠르게 확인합니다.</p>
            <span class="v73-tool-meta">
              <span class="v73-tool-rank" data-rank>신규 9</span>
              <span class="v73-tool-open">도구 열기</span>
            </span>
          </span>
        </button>

        <button class="v73-tool-card v103-unified-tool-card" type="button" data-v103-open="bonuspro" data-tool-id="v103-bonuspro" data-base="75" data-ga4-event="tool_open" style="--tone:rgba(251,191,36,.18);--tone-strong:#fbbf24;--tone-shadow:rgba(251,191,36,.18)">
          <span class="v73-tool-card__body">
            <span class="v73-tool-icon" aria-hidden="true">₩</span>
            <h2>보너스 실수령 PRO</h2>
            <p>입금액·보너스율·롤링 배수·최대출금을 한 번에 계산합니다.</p>
            <span class="v73-tool-meta">
              <span class="v73-tool-rank" data-rank>신규 10</span>
              <span class="v73-tool-open">도구 열기</span>
            </span>
          </span>
        </button>

        <button class="v73-tool-card v103-unified-tool-card" type="button" data-v103-open="withdraw" data-tool-id="v103-withdraw" data-base="74" data-ga4-event="tool_open" style="--tone:rgba(255,122,26,.18);--tone-strong:#ff7a1a;--tone-shadow:rgba(255,122,26,.18)">
          <span class="v73-tool-card__body">
            <span class="v73-tool-icon" aria-hidden="true">✓</span>
            <h2>출금 조건 체크리스트</h2>
            <p>보너스 사용, 롤링 완료, 제외게임, 최대출금 한도를 출금 전 점검합니다.</p>
            <span class="v73-tool-meta">
              <span class="v73-tool-rank" data-rank>신규 11</span>
              <span class="v73-tool-open">도구 열기</span>
            </span>
          </span>
        </button>

        <button class="v73-tool-card v103-unified-tool-card" type="button" data-v103-open="domainmemo" data-tool-id="v103-domainmemo" data-base="73" data-ga4-event="tool_open" style="--tone:rgba(139,92,246,.18);--tone-strong:#8b5cf6;--tone-shadow:rgba(139,92,246,.18)">
          <span class="v73-tool-card__body">
            <span class="v73-tool-icon" aria-hidden="true">↺</span>
            <h2>도메인 변경 메모장</h2>
            <p>주소 변경 이력과 상담 답변을 브라우저 안에 안전하게 기록합니다.</p>
            <span class="v73-tool-meta">
              <span class="v73-tool-rank" data-rank>신규 12</span>
              <span class="v73-tool-open">도구 열기</span>
            </span>
          </span>
        </button>
`;
let html = fs.readFileSync(file, 'utf8');
if (!html.includes('data-v103-1-tools-unified="active"')) html = html.replace('<html ', '<html data-v103-1-tools-unified="active" ');
if (!html.includes('data-v103-1-tools-unified="true"')) html = html.replace('<body ', '<body data-v103-1-tools-unified="true" ');
if (!html.includes('/assets/css/v103-1-tools-section-unify.css')) {
  html = html.replace('</head>', '  <meta name="v103-1-tools-section-unify" content="V103_1_TOOLS_SECTION_UNIFY_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v103-1-tools-section-unify.css?v=v103-1-tools-section-unify-20260526" data-v103-1-tools-unified="true">\n</head>');
}
html = html.replace(/\n\s*<section class="v103-tool-wrap"[\s\S]*?<\/section>\s*\n/, '\n');
html = html.replace(/\n\s*<button class="v73-tool-card v103-unified-tool-card"[\s\S]*?<\/button>\s*\n\s*<button class="v73-tool-card v103-unified-tool-card"[\s\S]*?<\/button>\s*\n\s*<button class="v73-tool-card v103-unified-tool-card"[\s\S]*?<\/button>\s*\n\s*<button class="v73-tool-card v103-unified-tool-card"[\s\S]*?<\/button>\s*/g, '\n');
html = html.replace(/(\s*<\/div>\s*\n\s*<aside class="v73-footer-cta")/, unifiedCards + '\n      </div>\n\n      <aside class="v73-footer-cta"');
fs.writeFileSync(file, html);
fs.writeFileSync(path.join(ROOT,'build.txt'), '88ST.Cloud build V103.1 TOOLS SECTION UNIFY PATCH\n2026-05-26T16:25:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V103.1-TOOLS-SECTION-UNIFY-PATCH-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V103.1 TOOLS SECTION UNIFY PATCH';\n");
console.log('[V103.1] tools section unified');
