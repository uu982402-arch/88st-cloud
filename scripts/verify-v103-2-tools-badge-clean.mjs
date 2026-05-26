import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V103.2 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const tools = read('tools/index.html');
const css = read('assets/css/v103-2-tools-badge-clean.css');
if (!tools.includes('data-v103-2-tools-badge-clean="active"')) fail('html marker missing');
if (!tools.includes('/assets/css/v103-2-tools-badge-clean.css')) fail('css link missing');
if (!tools.includes('data-v103-tools-expansion="true"')) fail('V103 tools expansion marker missing');
if (!tools.includes('data-v103-1-tools-unified="true"')) fail('V103.1 unified marker missing');
if (!css.includes('.v103-unified-tool-card::after') || !css.includes('content:none!important')) fail('badge pseudo override missing');
for (const name of ['가입코드 매칭 체크 PRO','보너스 실수령 PRO','출금 조건 체크리스트','도메인 변경 메모장']) {
  if (!tools.includes(name)) fail(`new tool missing: ${name}`);
}
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath = path.join(ROOT, sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V103.2 VERIFY PASS] tools NEW pseudo badges removed, unified tools retained');
