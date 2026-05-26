import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V102.3 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const index = read('index.html');
const guaranteed = read('guaranteed/index.html');
if (!index.includes('data-v102-3-home-premium-grid="active"')) fail('index html marker missing');
if (!guaranteed.includes('data-v102-3-home-premium-grid="active"')) fail('guaranteed html marker missing');
if (!index.includes('/assets/css/v102-3-home-premium-grid-tune.css')) fail('index missing v102.3 css');
if (!guaranteed.includes('/assets/css/v102-3-home-premium-grid-tune.css')) fail('guaranteed missing v102.3 css');
if (!index.includes('보증업체 이미지를 2개씩 세 줄로 정리해 보여줍니다.')) fail('home section copy not updated');
const premiumBlock = index.match(/<aside class="v71-desktop-partner-panel"[\s\S]*?<\/aside>/)?.[0] || '';
if ((premiumBlock.match(/\/assets\/img\/guaranteed\/cards\//g) || []).length !== 6) fail('main premium section must contain 6 vendor images');
for (const v of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!index.includes(`/guaranteed/${v}/`)) fail(`index missing ${v}`);
  if (!guaranteed.includes(`/guaranteed/${v}/`)) fail(`guaranteed missing ${v}`);
}
const css = read('assets/css/v102-3-home-premium-grid-tune.css');
if (!css.includes('grid-template-columns:repeat(2,minmax(0,1fr))')) fail('home premium 2-column grid rule missing');
if (!css.includes('aspect-ratio:3/4')) fail('home vertical aspect ratio rule missing');
if (!css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) fail('guaranteed 3-column grid rule missing');
if (!css.includes('aspect-ratio:16/9')) fail('guaranteed 16:9 ratio rule missing');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath = path.join(ROOT, sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V102.3 VERIFY PASS] home premium 2x3 grid and guaranteed 3x2 grid locked');
