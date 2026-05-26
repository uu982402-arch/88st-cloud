import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V102.4 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT,p), 'utf8');
const index = read('index.html');
const guaranteed = read('guaranteed/index.html');
if (/<section[^>]*class="[^"]*v71-mobile-partners[^"]*"/i.test(index)) fail('duplicate top mobile partners section still exists in index');
if ((index.match(/<h2>프리미엄 보증업체<\/h2>/g)||[]).length !== 1) fail('home premium heading must exist exactly once');
if (!index.includes('PC에서는 2개씩 세 줄, 모바일에서는 옆으로 넘겨 확인합니다.')) fail('home premium copy not updated');
if (!index.includes('v102-4-force-home-premium-layout')) fail('inline force style missing');
if (!index.includes('/assets/css/v102-4-home-premium-mobile-swipe-lock.css')) fail('index missing v102.4 css');
if (!guaranteed.includes('/assets/css/v102-4-home-premium-mobile-swipe-lock.css')) fail('guaranteed missing v102.4 css');
const premiumBlock = index.match(/<aside class="v71-desktop-partner-panel"[\s\S]*?<\/aside>/)?.[0] || '';
if ((premiumBlock.match(/\/assets\/img\/guaranteed\/cards\//g)||[]).length !== 6) fail('premium section must contain exactly 6 vendor images');
const css = read('assets/css/v102-4-home-premium-mobile-swipe-lock.css');
if (!css.includes('grid-template-columns:repeat(2,minmax(0,1fr))')) fail('desktop home 2x3 rule missing');
if (!css.includes('display:flex!important')) fail('mobile swipe flex rule missing');
if (!css.includes('overflow-x:auto!important')) fail('mobile swipe overflow rule missing');
if (!css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) fail('guaranteed 3x2 rule missing');
for (const v of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!index.includes(`/guaranteed/${v}/`)) fail(`index missing vendor ${v}`);
  if (!guaranteed.includes(`/guaranteed/${v}/`)) fail(`guaranteed missing vendor ${v}`);
}
for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  if (fs.existsSync(path.join(ROOT,r))) fail(`removed route regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath=path.join(ROOT,sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V102.4 VERIFY PASS] duplicate top ads removed, desktop 2x3 and mobile swipe locked');
