import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v81-2-main-title-clean-20260525';
const MARKER = 'V81_2_MAIN_TITLE_CLEAN_ACTIVE';
const indexPath = path.join(ROOT, 'index.html');
const cssHref = `/assets/css/v81-2.main-title-clean.css?v=${VERSION}`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function ensureHead(html) {
  html = html.replace(/<meta name="v81-2-main-title-clean"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/v81-2\.main-title-clean\.css[^>]*>\n?/g, '');
  const insert = `  <meta name="v81-2-main-title-clean" content="${MARKER}">\n  <link rel="stylesheet" href="${cssHref}" data-v81-2-main-title-clean="true">\n`;
  return html.replace('</head>', `${insert}</head>`);
}

function removeHeroSection(html) {
  const heroRe = /\n\s*<section class="v71-hero v71-shell"[^>]*>[\s\S]*?<\/section>\s*\n(?=\s*<section class="v71-section v71-mobile-partners")/;
  if (!heroRe.test(html)) {
    // A previous run may already have removed it. In that case, continue safely.
    return html;
  }
  return html.replace(heroRe, '\n');
}

function cleanLegacyVisibleTexts(html) {
  // These strings were only part of the removed title/CTA band. Remove any accidental remnants from visible body.
  return html
    .replace(/88ST\.CLOUD PLATFORM/g, '')
    .replace(/보증업체, 최신 가이드, 분석 도구, 공식 상담을 한 화면에서 확인합니다\./g, '')
    .replace(/<span>보증업체 큐레이션<\/span>/g, '')
    .replace(/<span>실사용 계산 도구<\/span>/g, '')
    .replace(/<span>텔레그램 상담 연결<\/span>/g, '')
    .replace(/<a class="v71-btn v71-btn-primary" href="\/guaranteed\/">보증업체 보기<\/a>/g, '')
    .replace(/<a class="v71-btn v71-btn-ghost" href="\/consult\/">자동 상담 시작<\/a>/g, '');
}

let html = read(indexPath);
html = ensureHead(html);
html = removeHeroSection(html);
html = cleanLegacyVisibleTexts(html);
html = html.replace(/<body([^>]*)>/, '<body$1 data-v81-2-main-title-clean="true" class="v81-2-title-clean">');
write(indexPath, html);

const report = {
  ok: true,
  version: VERSION,
  marker: MARKER,
  removed: [
    '88ST.CLOUD PLATFORM title band',
    'hero value line',
    'hero feature pills',
    '보증업체 보기 CTA',
    '자동 상담 시작 CTA'
  ],
  kept: [
    'V81-1 blog auto rotation',
    'sports-check auto rotation',
    'search-guides auto rotation',
    'partner card section',
    'tools section'
  ],
  generatedAt: new Date().toISOString(),
};
write(path.join(ROOT, 'V81_2_MAIN_TITLE_CLEAN_REPORT.json'), JSON.stringify(report, null, 2));

try {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts ||= {};
  const cmd = 'node scripts/generate-v81-2-main-title-clean.mjs';
  if (!String(pkg.scripts.build || '').includes(cmd)) {
    pkg.scripts.build = pkg.scripts.build ? `${pkg.scripts.build} && ${cmd}` : cmd;
  }
  pkg.scripts.verify = 'node scripts/verify-v81-2-main-title-clean.mjs';
  pkg.scripts['quality:v81-2'] = cmd;
  pkg.scripts['verify:v81-2'] = 'node scripts/verify-v81-2-main-title-clean.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
} catch (error) {
  console.warn('[V81-2] package.json update skipped', error && error.message);
}

console.log(`[V81-2] main title/CTA band removed. marker=${MARKER}`);
