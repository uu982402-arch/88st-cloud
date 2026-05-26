import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V103.4 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT,p),'utf8');
const tools = read('tools/index.html');
const guaranteed = read('guaranteed/index.html');
const css = read('assets/css/v103-4-tools-guaranteed-live-fix.css');
if (!tools.includes('data-v103-4-tools-ribbon-clean="true"')) fail('tools body marker missing');
if (!guaranteed.includes('data-v103-4-guaranteed-card-compact="true"')) fail('guaranteed compact marker missing');
if (tools.includes('v103-unified-tool-card')) fail('v103-unified-tool-card class still present');
for (const word of ['>신규 9<','>신규 10<','>신규 11<','>신규 12<']) if (tools.includes(word)) fail(`new rank text remains: ${word}`);
for (const id of ['match','bonuspro','withdraw','domainmemo']) if (!tools.includes(`data-v103-open="${id}"`)) fail(`missing v103 tool open: ${id}`);
if (!css.includes('.v73-tool-card[data-v103-open] .v73-tool-rank')) fail('tools rank cleanup rule missing');
if (!css.includes('--v103-4-compact-shell:980px')) fail('guaranteed compact shell rule missing');
if (!css.includes('max-height:136px')) fail('guaranteed image max-height compact rule missing');
if (!css.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) fail('guaranteed 3-column rule missing');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath = path.join(ROOT, sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V103.4 VERIFY PASS] tools ribbon removed and guaranteed cards compacted');
