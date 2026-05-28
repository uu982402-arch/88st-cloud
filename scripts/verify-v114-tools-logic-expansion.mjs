import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V114 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const tools = read('tools/index.html');
if (!tools.includes('data-v114-tools-logic="active"')) fail('tools html marker missing');
if (!tools.includes('/assets/css/v114-tools-logic-expansion.css')) fail('V114 css link missing');
if (!tools.includes('/assets/js/v114-tools-logic-expansion.js')) fail('V114 js link missing');
if (!tools.includes('/assets/js/v103-tools-expansion.js')) fail('V103 practical tools script missing');
if (!tools.includes('/assets/js/v108-tools-result-ux-polish.js')) fail('V108 result UX script missing');
const css = read('assets/css/v114-tools-logic-expansion.css');
const js = read('assets/js/v114-tools-logic-expansion.js');
for (const token of ['v114-logic-panel','고급 계산 근거','v114-logic-copy']) {
  if (!css.includes(token) && !js.includes(token)) fail(`V114 token missing: ${token}`);
}
for (const token of ['가입코드 매칭 체크 PRO','보너스 실수령 PRO','출금 조건 체크리스트','도메인 변경 메모장']) {
  if (!tools.includes(token)) fail(`new practical tool missing: ${token}`);
}
for (const token of ['Kelly','한도압박','공정확률','위험점수','매칭점수']) {
  if (!js.includes(token)) fail(`expanded logic missing: ${token}`);
}
const check = spawnSync(process.execPath, ['--check', path.join(ROOT, 'assets/js/v114-tools-logic-expansion.js')], { encoding:'utf8' });
if (check.status !== 0) fail(`V114 JS syntax error: ${check.stderr || check.stdout}`);
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath = path.join(ROOT, sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V114 VERIFY PASS] tools logic expansion active');
