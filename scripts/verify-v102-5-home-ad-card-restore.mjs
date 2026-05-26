import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V102.5 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const index = read('index.html');
const guaranteed = read('guaranteed/index.html');
const css = read('assets/css/v102-5-home-ad-card-restore.css');
if (!index.includes('data-v102-5-home-ad-restore="active"')) fail('index v102.5 html marker missing');
if (!index.includes('/assets/css/v102-5-home-ad-card-restore.css')) fail('index v102.5 css link missing');
if (!guaranteed.includes('/assets/css/v102-5-home-ad-card-restore.css')) fail('guaranteed v102.5 css link missing');
if (index.includes('v102-4-force-home-premium-layout')) fail('old v102.4 inline force style still exists');
if ((index.match(/<h2>프리미엄 보증업체<\/h2>/g) || []).length !== 1) fail('main premium title must exist exactly once');
const block = index.match(/<aside class="v71-desktop-partner-panel"[\s\S]*?<\/aside>/)?.[0] || '';
if ((block.match(/\/assets\/img\/guaranteed\/cards\//g) || []).length !== 6) fail('premium panel must contain exactly 6 vendor images');
for (const v of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!index.includes(`/guaranteed/${v}/`)) fail(`index missing ${v}`);
  if (!guaranteed.includes(`/guaranteed/${v}/`)) fail(`guaranteed missing ${v}`);
}
if (!css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) fail('PC wide 3-column portrait grid rule missing');
if (!css.includes('aspect-ratio:3/4')) fail('home portrait ratio missing');
if (!css.includes('flex:0 0 clamp(228px,76vw,324px)')) fail('mobile swipe restored card size rule missing');
if (!css.includes('section.v71-mobile-partners')) fail('duplicate top mobile partners lock missing');
if (!css.includes('aspect-ratio:16/9')) fail('guaranteed horizontal card ratio missing');
for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const sp = path.join(ROOT, sm);
    if (fs.existsSync(sp) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V102.5 VERIFY PASS] home ad card size restored, PC portrait grid and mobile swipe locked');
