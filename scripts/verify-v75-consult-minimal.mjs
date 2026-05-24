import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const consultPath = path.join(root, 'consult', 'index.html');
const cssPath = path.join(root, 'assets', 'css', 'v75.consult-minimal.css');
const jsPath = path.join(root, 'assets', 'js', 'v75.consult-minimal.js');

const failures = [];
function must(condition, message){ if(!condition) failures.push(message); }

must(fs.existsSync(consultPath), 'consult/index.html missing');
must(fs.existsSync(cssPath), 'assets/css/v75.consult-minimal.css missing');
must(fs.existsSync(jsPath), 'assets/js/v75.consult-minimal.js missing');

const html = fs.existsSync(consultPath) ? fs.readFileSync(consultPath, 'utf8') : '';
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';

must(html.includes('data-v75-consult="active"'), 'V75 active marker missing');
must(html.includes('@TRS999_bot'), '@TRS999_bot missing');
must(html.includes('텔레그램 상담 시작하기'), 'single Telegram CTA missing');
must(html.includes('/assets/css/v75.consult-minimal.css'), 'V75 CSS link missing');
must(html.includes('/assets/js/v75.consult-minimal.js'), 'V75 JS link missing');
must(!html.includes('상담은 3단계'), 'legacy 3-step title still present');
must(!html.includes('업체 선택</h2>'), 'legacy 업체 선택 funnel still present');
must(!html.includes('코드 확인</h2>'), 'legacy 코드 확인 funnel still present');
must(!html.includes('텔레그램 이동</h2>'), 'legacy 텔레그램 이동 funnel still present');
must(!html.includes('상담 전 준비하면 좋은 정보'), 'legacy checklist panel still present');
must(!html.includes('v70-3-funnel'), 'legacy v70-3 funnel class still present');
must(!html.includes('v70-2-mobile-nav'), 'legacy mobile bottom nav still present on consult');
must(!html.includes('v70-2-sticky-cta'), 'legacy sticky CTA still present on consult');
must(!html.includes('v70-2-fab'), 'legacy FAB still present on consult');
must(!/<h1\b/i.test(html), 'consult page should not contain h1 title section');
must((html.match(/v75-consult-cta/g) || []).length >= 1, 'consult CTA class missing');
must(css.includes('backdrop-filter:blur(22px)'), 'glass blur style missing');
must(css.includes('radial-gradient'), 'spotlight background missing');
must(js.includes('navigator.clipboard'), 'clipboard auto-copy logic missing');
must(js.includes('https://t.me/TRS999_bot'), 'Telegram open URL missing in JS');

if(failures.length){
  console.error('[V75 verify] failed');
  for(const failure of failures) console.error('-', failure);
  process.exit(1);
}

console.log('[V75 verify] passed: consult minimal page active');
