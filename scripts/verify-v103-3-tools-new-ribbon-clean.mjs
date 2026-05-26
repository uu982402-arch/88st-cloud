import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V103.3 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = read('tools/index.html');
if (!html.includes('data-v103-3-tools-new-ribbon-clean="active"')) fail('html marker missing');
if (!html.includes('/assets/css/v103-3-tools-new-ribbon-clean.css')) fail('css link missing');
for (const id of ['match','bonuspro','withdraw','domainmemo']) if (!html.includes(`data-v103-open="${id}"`)) fail('missing v103 tool '+id);
const css = read('assets/css/v103-3-tools-new-ribbon-clean.css');
if (!css.includes('.v103-unified-tool-card::after')) fail('hard clean after selector missing');
if (!css.includes('content:none!important')) fail('content none rule missing');
const oldCss = read('assets/css/v103-1-tools-section-unify.css');
if (/content:"NEW"/.test(oldCss)) fail('old v103-1 NEW pseudo rule still active');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const p = path.join(ROOT, sm);
    if (fs.existsSync(p) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V103.3 VERIFY PASS] tools NEW ribbon removed at source and override layers');
