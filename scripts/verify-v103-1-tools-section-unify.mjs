import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (m) => { console.error('[V103.1 VERIFY FAIL]', m); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT,p),'utf8');
const html = read('tools/index.html');
if (!html.includes('data-v103-1-tools-unified="active"')) fail('html marker missing');
if (!html.includes('/assets/css/v103-1-tools-section-unify.css')) fail('css link missing');
if (html.includes('<section class="v103-tool-wrap"')) fail('separate v103 section still exists');
const gridBlock = html.match(/<div class="v73-grid"[\s\S]*?<aside class="v73-footer-cta"/)?.[0] || '';
const count = (gridBlock.match(/<button class="v73-tool-card/g)||[]).length;
if (count !== 12) fail('v73 unified grid must contain 12 tool cards, found '+count);
for (const id of ['match','bonuspro','withdraw','domainmemo']) if (!gridBlock.includes(`data-v103-open="${id}"`)) fail('missing unified v103 card '+id);
if (!html.includes('data-v103-modal')) fail('v103 modal missing');
for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  if (fs.existsSync(path.join(ROOT,r))) fail('removed route regenerated '+r);
}
console.log('[V103.1 VERIFY PASS] new tools are unified into existing v73 grid');
