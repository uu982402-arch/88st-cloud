import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const outDir = path.join(ROOT, 'tools');
fs.mkdirSync(outDir, { recursive: true });

const version = 'V73_TOOLS_DASHBOARD_ACTIVE';
const tools = [
  { id: 'official', icon: '⌁', name: '주소 확인', desc: '도메인·상담 채널·공식 안내 일치 여부를 빠르게 대조합니다.', href: '/tools/official-check/', base: 98, tone: 'rgba(16,185,129,.2)', strong: '#10B981', shadow: 'rgba(16,185,129,.22)' },
  { id: 'code', icon: '⌗', name: '가입코드 확인', desc: '업체명과 가입코드를 상담 전 한 번 더 확인하는 체크 도구입니다.', href: '/tools/code-check/', base: 94, tone: 'rgba(34,211,238,.2)', strong: '#22d3ee', shadow: 'rgba(34,211,238,.22)' },
  { id: 'bonus', icon: '₩', name: '보너스 실수령', desc: '첫충·매충·롤링·최대출금 조건을 실제 기준 금액으로 환산합니다.', href: '/tools/bonus-calculator/', base: 91, tone: 'rgba(251,191,36,.18)', strong: '#fbbf24', shadow: 'rgba(251,191,36,.18)' },
  { id: 'rolling', icon: '↻', name: '롤링 조건', desc: '필수 롤링 금액, 진행액, 잔여 조건을 한 화면에서 계산합니다.', href: '/tools/rolling-calculator/', base: 88, tone: 'rgba(139,92,246,.18)', strong: '#8b5cf6', shadow: 'rgba(139,92,246,.18)' },
  { id: 'margin', icon: '%', name: '배당 마진', desc: '배당에 포함된 마진과 내재 확률 합계를 빠르게 확인합니다.', href: '/tool-margin/', base: 86, tone: 'rgba(37,99,235,.2)', strong: '#2563EB', shadow: 'rgba(37,99,235,.18)' },
  { id: 'ev', icon: 'EV', name: '기대값 계산', desc: '예상 확률과 배당 기준으로 기대값과 예상 수익을 계산합니다.', href: '/tool-ev/', base: 84, tone: 'rgba(16,185,129,.18)', strong: '#10B981', shadow: 'rgba(16,185,129,.2)' },
  { id: 'sports', icon: '⚑', name: '스포츠 분석', desc: '1X2 배당을 공정확률 관점으로 정리해 기본 판단을 돕습니다.', href: '/tools/ai-sports-odds-analysis/', base: 81, tone: 'rgba(34,211,238,.18)', strong: '#22d3ee', shadow: 'rgba(34,211,238,.18)' },
  { id: 'event', icon: '✦', name: '이벤트 조건', desc: '보너스·롤링·최대출금 조건을 체크리스트형으로 압축합니다.', href: '/tools/event-checker/', base: 78, tone: 'rgba(251,191,36,.16)', strong: '#fbbf24', shadow: 'rgba(251,191,36,.16)' }
];

const cardHtml = tools.map((tool, index) => `
        <button class="v73-tool-card" type="button" data-open-tool="${tool.id}" data-tool-id="${tool.id}" data-base="${tool.base}" style="--tone:${tool.tone};--tone-strong:${tool.strong};--tone-shadow:${tool.shadow}">
          <span class="v73-tool-card__body">
            <span class="v73-tool-icon" aria-hidden="true">${tool.icon}</span>
            <h2>${tool.name}</h2>
            <p>${tool.desc}</p>
            <span class="v73-tool-meta">
              <span class="v73-tool-rank" data-rank>인기 ${index + 1}</span>
              <span class="v73-tool-open">도구 열기</span>
            </span>
          </span>
        </button>`).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>도구 | 88ST.Cloud</title>
  <meta name="description" content="88ST.Cloud 실사용 분석 도구 대시보드. 주소 확인, 가입코드, 보너스 실수령, 롤링 조건, 배당 마진, 기대값, 스포츠 분석, 이벤트 조건을 한 화면에서 실행합니다.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0B0F19">
  <link rel="canonical" href="https://88st.cloud/tools/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="stylesheet" href="/assets/css/v73.tools-dashboard.css?v=static-v73-tools-dashboard-20260524" data-v73-tools="true">
</head>
<body class="v73-tools-dashboard" data-v73-tools-page="true" data-build-marker="${version}">
  <!-- ${version} -->
  <header class="v73-header" data-v73-component="header">
    <div class="v73-shell v73-header__inner">
      <a class="v73-brand" href="/" aria-label="88ST.Cloud 홈">
        <span class="v73-brand__mark">88</span>
        <span>88ST.Cloud</span>
      </a>
      <nav class="v73-nav" aria-label="주요 메뉴">
        <a href="/">메인</a>
        <a href="/blog/">블로그</a>
        <a href="/tools/" aria-current="page">도구</a>
        <a href="/guaranteed/">보증업체</a>
        <a href="/consult/">상담</a>
      </nav>
      <a class="v73-header__cta" href="https://t.me/TRS999_bot">@TRS999_bot</a>
    </div>
  </header>

  <main class="v73-main" data-v73-component="tools-dashboard">
    <section class="v73-shell" aria-label="실사용 도구 대시보드">
      <div class="v73-tools-topline">
        <div class="v73-micro-status" aria-label="도구 상태">
          <span class="v73-chip is-hot">인기순 자동 정렬</span>
          <span class="v73-chip">8개 핵심 도구</span>
          <span class="v73-chip">모달 즉시 실행</span>
          <span class="v73-chip">결과 복사·텔레그램 공유</span>
        </div>
        <label class="v73-search">
          <span>⌕</span>
          <input data-v73-search type="search" placeholder="도구 검색" autocomplete="off" aria-label="도구 검색">
        </label>
      </div>

      <div class="v73-grid" data-v73-tools-grid>
${cardHtml}
      </div>

      <aside class="v73-footer-cta" aria-label="도구 결과 상담 연결">
        <div>
          <b>계산 결과가 애매하면 상담센터로 바로 넘기세요.</b>
          <span>도구 결과를 복사한 뒤 @TRS999_bot으로 공유하면 조건 확인이 빨라집니다.</span>
        </div>
        <a href="https://t.me/TRS999_bot">텔레그램 상담 연결</a>
      </aside>
    </section>
  </main>

  <nav class="v73-mobile-nav" aria-label="모바일 하단 내비게이션" data-v73-component="mobile-nav">
    <a href="/"><span>⌂</span>메인</a>
    <a href="/blog/"><span>▤</span>블로그</a>
    <a href="/tools/" aria-current="page"><span>◇</span>도구</a>
    <a href="/guaranteed/"><span>◆</span>보증</a>
    <a href="/consult/"><span>✦</span>상담</a>
  </nav>

  <a class="v73-fab" href="https://t.me/TRS999_bot" aria-label="공식 상담 연결"><span>✦</span><b>상담</b></a>

  <div class="v73-modal" data-v73-modal aria-hidden="true">
    <section class="v73-modal__panel" role="dialog" aria-modal="true" aria-labelledby="v73-modal-title">
      <header class="v73-modal__head">
        <div>
          <small data-v73-modal-type>SMART TOOL</small>
          <h2 id="v73-modal-title" data-v73-modal-title>도구 실행</h2>
        </div>
        <button class="v73-modal__close" type="button" data-v73-close aria-label="닫기">×</button>
      </header>
      <div class="v73-modal__body">
        <form data-v73-form onsubmit="return false"></form>
        <div class="v73-result" aria-live="polite">
          <div class="v73-result__value" data-v73-result-value>준비됨</div>
          <div class="v73-result__note" data-v73-result-note>도구를 선택하면 입력창과 결과가 표시됩니다.</div>
        </div>
        <div class="v73-modal__actions">
          <button class="v73-action v73-action--primary" type="button" data-v73-copy>결과 복사</button>
          <button class="v73-action v73-action--ghost" type="button" data-v73-telegram>텔레그램 공유</button>
          <button class="v73-action v73-action--ghost" type="button" data-v73-reset>초기화</button>
        </div>
      </div>
    </section>
  </div>

  <div class="v73-toast" data-v73-toast role="status" aria-live="polite">복사 완료</div>
  <script src="/assets/js/v73.tools-dashboard.js?v=static-v73-tools-dashboard-20260524" defer data-v73-tools="true"></script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

const packagePath = path.join(ROOT, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.scripts = packageJson.scripts || {};
  const v73Cmd = 'node scripts/generate-v73-tools-dashboard.mjs';
  const build = packageJson.scripts.build || '';
  if (build && !build.includes(v73Cmd)) {
    packageJson.scripts.build = build.includes('node scripts/gen-build-ver.mjs')
      ? build.replace(' && node scripts/gen-build-ver.mjs', ` && ${v73Cmd} && node scripts/gen-build-ver.mjs`)
      : `${build} && ${v73Cmd}`;
  }
  packageJson.scripts.verify = 'node scripts/verify-v73-tools-dashboard.mjs';
  packageJson.scripts['quality:v73'] = 'node scripts/generate-v73-tools-dashboard.mjs';
  packageJson.scripts['verify:v73'] = 'node scripts/verify-v73-tools-dashboard.mjs';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
}

console.log(`V73 tools dashboard generated: tools=${tools.length}`);
