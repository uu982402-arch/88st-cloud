import fs from 'fs';
import path from 'path';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(root, p), v);
const ensureDir = p => fs.mkdirSync(path.join(root, p), { recursive: true });
const indexPath = 'index.html';
let html = read(indexPath);
const beforeLength = html.length;

// Version marker
html = html.replace('<html ', '<html data-v125-main-clean-fold="active" ');
if (!html.includes('V125_MAIN_CLEAN_FIRST_FOLD_ACTIVE')) {
  html = html.replace('</head>', '  <meta name="v125-main-clean-first-fold" content="V125_MAIN_CLEAN_FIRST_FOLD_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v125-main-clean-first-fold.css?v=20260529" data-v125-main-clean-fold="true">\n</head>');
}
html = html.replace('<body ', '<body data-v125-main-clean-fold="true" ');

// Remove duplicated V120 first-screen quick check block.
const start = html.indexOf('      <section class="v71-section v71-shell v120-fold"');
const next = html.indexOf('<section class="v71-section v71-shell v71-main-hub"', start);
let removedV120Fold = false;
if (start !== -1 && next !== -1) {
  html = html.slice(0, start) + html.slice(next);
  removedV120Fold = true;
}
// Fallback: remove by marker if formatting changes.
html = html.replace(/\s*<section class="v71-section v71-shell v120-fold"[\s\S]*?<\/section>\s*/g, () => { removedV120Fold = true; return '\n'; });

// Refresh the bottom official bot copy only, not footer/nav links.
const oldConsult = `<section class="v71-section v71-shell" aria-label="공식 상담 센터">
        <div class="v71-consult-banner v71-glass v71-glow-border">
          <div>
            <h2>조건이 애매하면 공식 상담센터에서 바로 확인하세요.</h2>
            <p>가입코드, 주소, 이벤트 조건, 롤링 계산이 헷갈릴 때 @TRS999_bot으로 연결하면 필요한 정보를 빠르게 정리할 수 있습니다.</p>
          </div>
          <a class="v71-telegram" href="https://t.me/TRS999_bot" rel="nofollow noopener" target="_blank" data-ga4-event="consult_click">@TRS999_bot 상담 연결</a>
        </div>
      </section>`;
const newConsult = `<section class="v71-section v71-shell" aria-label="공식 상담 센터" data-v125-consult-polish="true">
        <div class="v71-consult-banner v71-glass v71-glow-border">
          <div>
            <span class="v125-consult-kicker">OFFICIAL BOT</span>
            <h2>애매한 조건은 공식 상담봇에서 깔끔하게 정리하세요.</h2>
            <p>가입코드, 공식주소, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 부분만 @TRS999_bot에서 짧고 명확하게 확인할 수 있습니다.</p>
          </div>
          <a class="v71-telegram" href="https://t.me/TRS999_bot" rel="nofollow noopener" target="_blank" data-ga4-event="consult_click">공식 상담봇 연결</a>
        </div>
      </section>`;
if (html.includes(oldConsult)) {
  html = html.replace(oldConsult, newConsult);
} else {
  html = html.replace(/<section class="v71-section v71-shell" aria-label="공식 상담 센터">[\s\S]*?<\/section>/, newConsult);
}

write(indexPath, html);

const css = `/* V125 MAIN CLEAN FIRST FOLD / DUPLICATE QUICK CHECK REMOVAL */
html[data-v125-main-clean-fold="active"],
html[data-v125-main-clean-fold="active"] body{max-width:100%;overflow-x:hidden}
/* Safety guard: if an older generator reinjects the V120 duplicate quick-check block, hide it. */
html[data-v125-main-clean-fold="active"] [data-v120-fold="true"],
html[data-v125-main-clean-fold="active"] .v120-fold{display:none!important}
html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"]{margin-top:clamp(12px,2vw,22px)}
html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"] .v71-consult-banner{display:flex;align-items:center;justify-content:space-between;gap:clamp(14px,2.2vw,24px);padding:clamp(18px,2.6vw,28px);border:1px solid rgba(246,201,107,.22);background:linear-gradient(135deg,rgba(246,201,107,.12),rgba(255,255,255,.075) 42%,rgba(103,232,249,.08));box-shadow:0 18px 52px rgba(0,0,0,.18);overflow:hidden}
html[data-v125-main-clean-fold="active"] .v125-consult-kicker{display:inline-flex;align-items:center;width:max-content;margin-bottom:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(246,201,107,.28);background:rgba(246,201,107,.11);color:#ffe4a8;font-size:12px;font-weight:950;letter-spacing:.06em}
html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"] h2{margin:0;color:#fff;font-size:clamp(20px,2.2vw,30px);line-height:1.16;letter-spacing:-.035em;text-wrap:balance}
html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"] p{margin:9px 0 0;color:#dbe7f5;line-height:1.66;font-size:clamp(13px,1.2vw,15px);max-width:66ch}
html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"] .v71-telegram{flex:0 0 auto;min-height:46px;padding:0 18px;border-radius:999px;background:linear-gradient(135deg,#f6c96b,#fff1bb);color:#171006!important;font-weight:950;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(246,201,107,.16)}
@media(max-width:720px){html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"] .v71-consult-banner{align-items:stretch;flex-direction:column;padding:18px}html[data-v125-main-clean-fold="active"] [data-v125-consult-polish="true"] .v71-telegram{width:100%}}
`;
write('assets/css/v125-main-clean-first-fold.css', css);

ensureDir('reports');
const audit = {
  version: 'V125_MAIN_CLEAN_FIRST_FOLD',
  source: 'V124 FULL',
  changedAt: new Date().toISOString(),
  removedV120DuplicateFold: removedV120Fold,
  beforeLength,
  afterLength: html.length,
  removedSectionTokens: ['RUST QUICK CHECK','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed'],
  consultCopy: {
    h2: '애매한 조건은 공식 상담봇에서 깔끔하게 정리하세요.',
    body: '가입코드, 공식주소, 이벤트 조건, 롤링 계산처럼 놓치기 쉬운 부분만 @TRS999_bot에서 짧고 명확하게 확인할 수 있습니다.',
    cta: '공식 상담봇 연결'
  },
  preserved: ['blog rotator','home guaranteed partner panel','sports/search hub rotation','tools modal triggers','bottom nav']
};
write('reports/v125-main-clean-first-fold-audit.json', JSON.stringify(audit, null, 2));
write('reports/v125-remove-candidates.txt', [
  'V125 removal candidates only - no files deleted.',
  '- assets/js/v120-main-conversion-polish.js: now unused on index after quick-check form removal, but kept because V120 detail image CSS/legacy verification assets remain.',
  '- assets/css/v120-main-conversion-polish.css: kept because it still controls main compact layout and guaranteed detail image caps.',
  '- No bottom related-link sections should be regenerated.'
].join('\n')+'\n');

const manifest = {
  version: 'V125 MAIN CLEAN FIRST FOLD / CONSULT COPY POLISH',
  base: 'V124 FULL',
  changedFiles: [
    'index.html',
    'assets/css/v125-main-clean-first-fold.css',
    'scripts/generate-v125-main-clean-first-fold.mjs',
    'scripts/verify-v125-main-clean-first-fold.mjs',
    'reports/v125-main-clean-first-fold-audit.json',
    'reports/v125-remove-candidates.txt',
    'package.json',
    'V125_PATCH_MANIFEST.json',
    'V125_UPGRADE_REPORT.md'
  ],
  deletedFiles: []
};
write('V125_PATCH_MANIFEST.json', JSON.stringify(manifest, null, 2));
write('V125_UPGRADE_REPORT.md', `# V125 MAIN CLEAN FIRST FOLD / CONSULT COPY POLISH\n\n- Removed duplicated V120 RUST QUICK CHECK first-screen block from the homepage.\n- Kept existing blog, guaranteed, sports/search, and tools sections lower on the page.\n- Polished the bottom official consultation bot copy with shorter premium wording.\n- Added a CSS guard so the duplicate quick-check block remains hidden if older generators reinsert it.\n- Deleted files: 0.\n`);
console.log('V125 generation complete:', JSON.stringify({removedV120Fold}, null, 2));
