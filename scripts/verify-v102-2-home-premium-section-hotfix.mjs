import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V102.2 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const index = read('index.html');
const guaranteed = read('guaranteed/index.html');
if (!index.includes('data-v102-2-home-premium="active"')) fail('index html marker missing');
if (!index.includes('/assets/css/v102-2-home-premium-section-hotfix.css')) fail('V102.2 css link missing');
if (/v71-section v71-mobile-partners/.test(index)) fail('duplicated top mobile partners section still exists');
if ((index.match(/<h2>프리미엄 보증업체<\/h2>/g) || []).length !== 1) fail('main premium vendor section must exist exactly once');
const premiumBlock = index.match(/<aside class="v71-desktop-partner-panel"[\s\S]*?<\/aside>/)?.[0] || '';
const homeVendorImgs = (premiumBlock.match(/\/assets\/img\/guaranteed\/cards\//g) || []).length;
if (homeVendorImgs !== 6) fail(`main premium section must contain exactly 6 vendor card images, found ${homeVendorImgs}`);
if (!/v71-desktop-partner-panel[\s\S]*v71-partner-tile-grid/.test(index)) fail('premium partner section grid missing');
const vendors = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
for (const v of vendors) {
  if (!index.includes(`/guaranteed/${v}/`)) fail(`main missing vendor link ${v}`);
  if (!guaranteed.includes(`/guaranteed/${v}/`)) fail(`guaranteed missing vendor link ${v}`);
}
if (!guaranteed.includes('data-v102-1-ad-image-grid="true"')) fail('guaranteed image grid marker missing');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    if (fs.existsSync(path.join(ROOT, sm)) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V102.2 VERIFY PASS] home premium section only, duplicated top ads removed');
