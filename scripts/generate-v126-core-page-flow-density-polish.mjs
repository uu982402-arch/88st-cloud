import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const read = f => fs.readFileSync(p(f), 'utf8');
const write = (f, v) => fs.writeFileSync(p(f), v);
const ensureDir = f => fs.mkdirSync(p(f), { recursive: true });
let html = read('index.html');
const beforeLength = html.length;

// Version markers
if (!html.includes('data-v126-core-flow="active"')) {
  html = html.replace('<html ', '<html data-v126-core-flow="active" ');
}
if (!html.includes('data-v126-core-flow="true"')) {
  html = html.replace('<body ', '<body data-v126-core-flow="true" ');
}
if (!html.includes('V126_CORE_PAGE_FLOW_DENSITY_POLISH_ACTIVE')) {
  html = html.replace('</head>', '  <meta name="v126-core-page-flow-density-polish" content="V126_CORE_PAGE_FLOW_DENSITY_POLISH_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v126-core-page-flow-density-polish.css?v=20260529" data-v126-core-flow="true">\n</head>');
}

let removedMetrics = false;
let removedFloatingBotFab = false;

// Tighten visible section copy without changing routes or data pools.
html = html.replace('<div><h2>최신 실사용 가이드</h2><p>검색 후 이어서 볼 핵심 글만 압축했습니다.</p></div>', '<div><h2>최신 실사용 가이드</h2><p>주소·코드·조건 확인에 바로 쓰는 글만 보여줍니다.</p></div>');
html = html.replace('<div><h2>프리미엄 보증업체</h2><p>카드 이미지는 작게, 공식 이동 흐름은 빠르게 정리했습니다.</p></div>', '<div><h2>프리미엄 보증업체</h2><p>이미지와 코드, 공식 이동만 간결하게 확인합니다.</p></div>');
html = html.replace('<div><h2>스포츠 체크 · 검색 가이드</h2><p>스포츠 체크와 검색 가이드를 5개 슬롯으로 압축해 보여줍니다.</p></div>', '<div><h2>스포츠 체크 · 검색 가이드</h2><p>자주 확인하는 경기 변수와 검색 루트만 압축했습니다.</p></div>');
html = html.replace('<div><h2>실사용 분석 도구</h2><p>입력부터 결과 확인까지 모바일 터치 흐름에 맞춘 5개 핵심 도구입니다.</p></div>', '<div><h2>실사용 분석 도구</h2><p>계산·확인·복사를 한 화면에서 끝내는 핵심 도구입니다.</p></div>');

// Remove low-value metrics block shown near bottom (6/15/5/24H). It duplicated page content and made the bottom flow noisy.
html = html.replace(/\n\s*<section class="v71-section v71-shell" aria-label="플랫폼 신뢰 지표">[\s\S]*?<\/section>\s*\n/, () => { removedMetrics = true; return '\n'; });

// Replace bottom consultation bot banner with a compact, premium, non-hub style CTA.
const consultNew = `<section class="v71-section v71-shell v126-consult-section" aria-label="공식 상담봇 빠른 확인" data-v126-consult-polish="true">
        <div class="v126-consult-card v71-glass v71-glow-border">
          <div class="v126-consult-copy">
            <span class="v126-consult-kicker">OFFICIAL CHECK BOT</span>
            <h2>마지막 확인은 공식 상담봇에서 짧게 정리하세요.</h2>
            <p>공식주소, 가입코드, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 항목만 @TRS999_bot에서 빠르게 확인합니다.</p>
          </div>
          <a class="v126-consult-button" href="https://t.me/TRS999_bot" rel="nofollow noopener" target="_blank" data-ga4-event="consult_click">@TRS999_bot 열기</a>
        </div>
      </section>`;
html = html.replace(/<section class="v71-section v71-shell" aria-label="공식 상담 센터"[\s\S]*?<\/section>/, consultNew);
html = html.replace(/<section class="v71-section v71-shell v126-consult-section" aria-label="공식 상담봇 빠른 확인"[\s\S]*?<\/section>/, consultNew);

// Remove redundant floating Telegram FAB. The page still has the official bot CTA and /consult/ nav.
html = html.replace(/\n\s*<a class="v71-fab" href="https:\/\/t\.me\/TRS999_bot"[\s\S]*?<\/a>\s*/, () => { removedFloatingBotFab = true; return '\n'; });

// Footer copy: remove redundant automatic consultation phrasing from site description.
html = html.replace('보증업체 큐레이션, 최신 가이드, 계산 도구, 자동 상담 연결을 제공하는 모바일 퍼스트 정보 플랫폼입니다.', '보증업체 큐레이션, 최신 가이드, 계산 도구를 제공하는 모바일 퍼스트 정보 플랫폼입니다.');

write('index.html', html);

const css = `/* V126 CORE PAGE FLOW / CONTENT DENSITY POLISH */
html[data-v126-core-flow="active"],
html[data-v126-core-flow="active"] body{max-width:100%;overflow-x:hidden}
html[data-v126-core-flow="active"] .v71-main{padding-bottom:clamp(22px,4vw,42px)}
html[data-v126-core-flow="active"] .v71-section{margin-top:clamp(18px,3.2vw,38px)}
html[data-v126-core-flow="active"] .v71-section-head{gap:14px;align-items:flex-end}
html[data-v126-core-flow="active"] .v71-section-head h2{letter-spacing:-.045em;text-wrap:balance}
html[data-v126-core-flow="active"] .v71-section-head p{max-width:58ch;color:rgba(226,236,248,.78);line-height:1.55}
html[data-v126-core-flow="active"] .v71-blog-card span,
html[data-v126-core-flow="active"] .v81-1-hub-card span,
html[data-v126-core-flow="active"] .v71-tool-card span{line-height:1.5}
html[data-v126-core-flow="active"] .v126-consult-section{margin-top:clamp(20px,3.5vw,46px);margin-bottom:clamp(6px,1.2vw,14px)}
html[data-v126-core-flow="active"] .v126-consult-card{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:clamp(14px,2.6vw,28px);padding:clamp(18px,2.6vw,28px);border:1px solid rgba(148,163,184,.2);background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.045) 46%,rgba(246,201,107,.10));box-shadow:0 18px 52px rgba(0,0,0,.2);overflow:hidden}
html[data-v126-core-flow="active"] .v126-consult-card::before{content:"";position:absolute;inset:0 0 auto 0;height:1px;background:linear-gradient(90deg,transparent,rgba(246,201,107,.68),transparent);pointer-events:none}
html[data-v126-core-flow="active"] .v126-consult-copy{position:relative;z-index:1;min-width:0}
html[data-v126-core-flow="active"] .v126-consult-kicker{display:inline-flex;align-items:center;width:max-content;margin-bottom:8px;padding:5px 10px;border-radius:999px;border:1px solid rgba(246,201,107,.26);background:rgba(246,201,107,.09);color:#ffe7ac;font-size:11px;font-weight:950;letter-spacing:.075em}
html[data-v126-core-flow="active"] .v126-consult-card h2{margin:0;color:#fff;font-size:clamp(19px,2.05vw,28px);line-height:1.16;letter-spacing:-.045em;text-wrap:balance}
html[data-v126-core-flow="active"] .v126-consult-card p{margin:8px 0 0;max-width:64ch;color:rgba(226,236,248,.82);font-size:clamp(13px,1.2vw,15px);line-height:1.62}
html[data-v126-core-flow="active"] .v126-consult-button{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;background:linear-gradient(135deg,#f8d77d,#fff2be);color:#181107!important;font-weight:950;text-decoration:none;white-space:nowrap;box-shadow:0 14px 34px rgba(246,201,107,.16)}
html[data-v126-core-flow="active"] .v71-fab{display:none!important}
@media(max-width:820px){html[data-v126-core-flow="active"] .v126-consult-card{grid-template-columns:1fr;padding:18px}html[data-v126-core-flow="active"] .v126-consult-button{width:100%}}
@media(max-width:520px){html[data-v126-core-flow="active"] .v71-section{margin-top:22px}html[data-v126-core-flow="active"] .v71-section-head{align-items:flex-start}html[data-v126-core-flow="active"] .v126-consult-kicker{font-size:10px}html[data-v126-core-flow="active"] .v126-consult-card h2{font-size:20px}}
`;
write('assets/css/v126-core-page-flow-density-polish.css', css);

ensureDir('reports');
const audit = {
  version: 'V126_CORE_PAGE_FLOW_CONTENT_DENSITY_POLISH',
  base: 'V125 FULL',
  changedAt: new Date().toISOString(),
  liveObservation: {
    homepage: 'Live homepage still showed V120 RUST QUICK CHECK and old bottom consult copy before V125/V126 deployment.',
    bottomIssues: ['low-value metric strip near bottom', 'long consultation copy', 'redundant floating Telegram FAB']
  },
  changed: {
    removedMetrics,
    removedFloatingBotFab,
    compactedConsultBotBanner: true,
    tightenedMainSectionCopy: true,
    preservedBottomNavConsultLink: true,
    didNotAddBottomRelatedSections: true
  },
  preserved: ['blog rotator', 'home guaranteed panel', 'sports/search hub rotation', 'V115 home tool modal triggers', 'V121 no-bottom-related lock', 'V125 quick-check removal guard'],
  forbiddenRegeneration: ['RUST QUICK CHECK', 'v36-related-links', 'v70-2-related', '조건 상담 후 이용', '확인 기준', '상담 전 문의 템플릿']
};
write('reports/v126-core-page-flow-audit.json', JSON.stringify(audit, null, 2));
write('reports/v126-remove-candidates.txt', [
  'V126 removal candidates only - no files deleted.',
  '- assets/js/v120-main-conversion-polish.js: still kept for compatibility; V125/V126 hide the removed first-fold block if regenerated.',
  '- duplicated legacy nav systems remain structurally present; do not delete until live mobile nav is visually confirmed across devices.',
  '- floating v71-fab was removed from index.html only; related CSS/classes may remain in old assets and should be treated as cleanup candidates later.',
  '- no bottom related-link sections should be regenerated.'
].join('\n')+'\n');

const manifest = {
  version: 'V126 CORE PAGE FLOW / CONTENT DENSITY POLISH PATCH',
  base: 'V125 FULL',
  changedFiles: [
    'index.html',
    'assets/css/v126-core-page-flow-density-polish.css',
    'scripts/generate-v126-core-page-flow-density-polish.mjs',
    'scripts/verify-v126-core-page-flow-density-polish.mjs',
    'reports/v126-core-page-flow-audit.json',
    'reports/v126-remove-candidates.txt',
    'package.json',
    'V126_PATCH_MANIFEST.json',
    'V126_UPGRADE_REPORT.md'
  ],
  deletedFiles: []
};
write('V126_PATCH_MANIFEST.json', JSON.stringify(manifest, null, 2));
write('V126_UPGRADE_REPORT.md', `# V126 CORE PAGE FLOW / CONTENT DENSITY POLISH PATCH\n\n- Rechecked the live homepage bottom area and compacted the final consultation bot banner.\n- Removed the low-value metric strip near the bottom of the homepage.\n- Removed the redundant floating Telegram FAB from index.html while preserving the official bot CTA and /consult/ navigation.\n- Tightened main section descriptions without adding bottom related-link sections.\n- Kept V115 tools modal, V121 no-bottom-related lock, and V125 quick-check removal guard.\n- Deleted files: 0.\n`);

console.log('V126 generation complete:', JSON.stringify({removedMetrics, removedFloatingBotFab, beforeLength, afterLength: html.length}, null, 2));
