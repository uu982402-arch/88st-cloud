import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const consultDir = path.join(root, 'consult');
fs.mkdirSync(consultDir, { recursive: true });

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>공식 상담센터 | 88ST.Cloud</title>
  <meta name="description" content="88ST.Cloud 공식 텔레그램 상담센터 @TRS999_bot 연결 페이지입니다.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0B0F19">
  <link rel="canonical" href="https://88st.cloud/consult/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/v75.consult-minimal.css?v=static-v75-consult-minimal-20260524" data-v75-consult="true">
</head>
<body class="v75-consult-page" data-v75-consult="active">
  <div class="v75-consult-shell">
    <header class="v75-consult-header" aria-label="88ST.Cloud 상단 메뉴">
      <div class="v75-consult-header__inner">
        <a class="v75-consult-brand" href="/" aria-label="88ST.Cloud 메인으로 이동">
          <span class="v75-consult-brand__mark">88</span>
          <span class="v75-consult-brand__name">88ST.Cloud</span>
        </a>
        <nav class="v75-consult-nav" aria-label="주요 메뉴">
          <a href="/">메인</a>
          <a href="/blog/">블로그</a>
          <a href="/tools/">도구</a>
          <a href="/guaranteed/">보증업체</a>
          <a href="/consult/" aria-current="page">상담</a>
        </nav>
      </div>
    </header>

    <main class="v75-consult-main" aria-label="공식 상담센터">
      <section class="v75-consult-card" data-v75-consult-card="true" aria-label="88ST.Cloud 공식 텔레그램 상담센터">
        <span class="v75-consult-badge">Official Telegram</span>
        <strong class="v75-consult-bot">@TRS999_bot</strong>
        <div class="v75-consult-line" aria-hidden="true"></div>
        <p class="v75-consult-copy">보증업체, 가입코드, 공식주소 확인은 공식 상담센터에서 바로 연결됩니다.</p>
        <a class="v75-consult-cta" href="https://t.me/TRS999_bot" target="_blank" rel="noopener noreferrer" data-v75-consult-cta="true">
          텔레그램 상담 시작하기
        </a>
        <p class="v75-consult-micro">버튼을 누르면 상담센터 ID가 자동 복사된 뒤 새 창으로 이동합니다.</p>
      </section>
    </main>
  </div>

  <div class="v75-consult-toast" role="status" aria-live="polite" data-v75-consult-toast="true">공식 상담센터 ID가 복사되었습니다.</div>
  <script src="/assets/js/v75.consult-minimal.js?v=static-v75-consult-minimal-20260524" defer data-v75-consult="true"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(consultDir, 'index.html'), html, 'utf8');

const report = `# V75 Consult Minimal Remodeling Report

## Scope
- Target page: /consult/
- Goal: remove funnel/checklist style guidance and focus the page on one official Telegram consultation CTA.

## Applied
- Rebuilt consult/index.html with V75 single-card minimal layout.
- Removed legacy 3-step flow text from generated /consult/ page.
- Removed sticky CTA, floating consultation button, mobile bottom navigation, funnel cards, checklist panel from /consult/ page output.
- Added centered glassmorphism official consultation card.
- Added @TRS999_bot emphasis.
- Added one CTA button: 텔레그램 상담 시작하기.
- Added JavaScript auto-copy behavior for @TRS999_bot before opening Telegram.
- Added V75 verification marker: data-v75-consult="active".

## Preserved
- Existing routing.
- Existing subdirectories under consult/ for vendor-specific pages.
- Existing blog/tools/guaranteed/main files and scripts.
- No deletion of legacy assets.
`;
fs.writeFileSync(path.join(root, 'V75_CONSULT_MINIMAL_REPORT.md'), report, 'utf8');

function stabilizePackageScripts(){
  const pkgPath = path.join(root, 'package.json');
  if(!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts ||= {};
  const generateCmd = 'node scripts/generate-v75-consult-minimal.mjs';
  const genBuild = 'node scripts/gen-build-ver.mjs';
  let build = pkg.scripts.build || generateCmd;
  if(!build.includes(generateCmd)){
    if(build.includes(genBuild)) build = build.replace(genBuild, `${generateCmd} && ${genBuild}`);
    else build = `${build} && ${generateCmd}`;
  }
  pkg.scripts.build = build;
  pkg.scripts.verify = 'node scripts/verify-v75-consult-minimal.mjs';
  pkg.scripts['quality:v75'] = generateCmd;
  pkg.scripts['verify:v75'] = 'node scripts/verify-v75-consult-minimal.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

stabilizePackageScripts();

console.log('[V75] consult minimal remodeling generated: /consult/index.html');
