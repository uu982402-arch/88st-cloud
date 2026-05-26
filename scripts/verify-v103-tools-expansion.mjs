import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V103 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT,p),'utf8');
const html = read('tools/index.html');
if (!html.includes('data-v103-tools-expansion="active"')) fail('html marker missing');
if (!html.includes('/assets/css/v103-tools-expansion.css')) fail('css link missing');
if (!html.includes('/assets/js/v103-tools-expansion.js')) fail('js link missing');
if (!html.includes('data-v103-tools-section="true"')) fail('v103 section missing');
if (!html.includes('12개 실사용 도구')) fail('tool count chip not updated');
for (const id of ['match','bonuspro','withdraw','domainmemo']) {
  if (!html.includes(`data-v103-open="${id}"`)) fail(`missing v103 tool card: ${id}`);
}
const css = read('assets/css/v103-tools-expansion.css');
const js = read('assets/js/v103-tools-expansion.js');
try { execFileSync(process.execPath, ['--check', path.join(ROOT, 'assets/js/v103-tools-expansion.js')], { stdio: 'pipe' }); } catch (e) { fail('v103 js syntax check failed'); }
for (const key of ['v103-tool-grid','v103-modal','v103-form']) if (!css.includes(key)) fail(`css missing ${key}`);
for (const key of ['tool_calculate','tool_copy_result','tool_reset','v103_domain_memos']) if (!js.includes(key)) fail(`js missing ${key}`);
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT,r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smp=path.join(ROOT,sm);
    if (fs.existsSync(smp) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V103 VERIFY PASS] tools expansion practical calculators active');
