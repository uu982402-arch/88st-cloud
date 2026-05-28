import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V114.1 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = read('tools/index.html');
const js = read('assets/js/v114-tools-logic-expansion.js');
if (!html.includes('v114-1-tools-runtime-hotfix-20260527')) fail('tools html script cache buster not updated');
if (!html.includes('data-v114-1-tools-runtime-hotfix="active"')) fail('tools html marker missing');
if (/new MutationObserver/.test(js)) fail('MutationObserver loop still present in v114 tools logic');
if (!/data-v114-html/.test(js)) fail('panel html guard missing');
if (!/고급 계산 근거/.test(js)) fail('advanced logic panel text missing');
for (const phrase of ['가입코드 매칭 체크 PRO','보너스 실수령 PRO','출금 조건 체크리스트','도메인 변경 메모장']) {
  if (!html.includes(phrase)) fail(`tools page missing ${phrase}`);
}
for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route regenerated: ${r}`);
}
console.log('[V114.1 VERIFY PASS] tools runtime hotfix is safe');
