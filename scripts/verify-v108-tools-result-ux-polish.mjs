import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V108 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const tools = read('tools/index.html');
if (!tools.includes('data-v108-tools-result-ux="active"')) fail('tools html marker missing');
if (!tools.includes('/assets/css/v108-tools-result-ux-polish.css')) fail('V108 css link missing');
if (!tools.includes('/assets/js/v108-tools-result-ux-polish.js')) fail('V108 js link missing');
if (!tools.includes('data-v73-modal')) fail('existing V73 modal missing');
if (!tools.includes('data-v103-modal')) fail('V103 modal missing');
for (const id of ['match','bonuspro','withdraw','domainmemo']) {
  if (!tools.includes(`data-v103-open="${id}"`)) fail(`new tool opener missing: ${id}`);
}
const css = read('assets/css/v108-tools-result-ux-polish.css');
const js = read('assets/js/v108-tools-result-ux-polish.js');
for (const token of ['.v108-result-head','요약 복사','position:sticky','data-v108-toast']) {
  if (!css.includes(token) && !js.includes(token)) fail(`V108 token missing: ${token}`);
}
if (!js.includes('window.__V108_TOOLS_RESULT_UX__')) fail('V108 duplicate guard missing');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath = path.join(ROOT, sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V108 VERIFY PASS] tools result UX polish markers and removed-route lock are valid');
