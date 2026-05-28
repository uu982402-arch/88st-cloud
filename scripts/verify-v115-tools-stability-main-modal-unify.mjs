import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V115 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const index = read('index.html');
const tools = read('tools/index.html');
const js = read('assets/js/v115-tools-stability-main-modal-unify.js');
if (!index.includes('data-v115-tools-stability="active"')) fail('index V115 html marker missing');
if (!tools.includes('data-v115-tools-stability="active"')) fail('tools V115 html marker missing');
if (!index.includes('/assets/css/v115-tools-stability-main-modal-unify.css')) fail('index V115 css missing');
if (!index.includes('/assets/js/v115-tools-stability-main-modal-unify.js')) fail('index V115 js missing');
if (!tools.includes('/assets/js/v115-tools-stability-main-modal-unify.js')) fail('tools V115 js missing');
const count = (index.match(/data-v115-main-tool=/g) || []).length;
if (count !== 5) fail(`main must expose exactly 5 modal tool cards, found ${count}`);
for (const id of ['official','bonus','rolling','sports','slot']) {
  if (!index.includes(`data-v115-main-tool="${id}"`)) fail(`main missing modal tool ${id}`);
}
if (/href="\/tools\/(official-check|bonus-calculator|rolling-calculator|ai-sports-odds-analysis|slot-rtp)\//.test(index)) fail('main tool cards still link to legacy tool landings');
if (!tools.includes('v114-1-tools-runtime-hotfix-20260527')) fail('V114.1 stable runtime cache buster missing');
if (/v114-2|V114\.2|V114_2/i.test(index + tools + js)) fail('V114.2 marker/script must not appear');
if (/new MutationObserver/.test(read('assets/js/v114-tools-logic-expansion.js'))) fail('MutationObserver must remain absent from V114 tools logic');
for (const phrase of ['가입코드 매칭 체크 PRO','보너스 실수령 PRO','출금 조건 체크리스트','도메인 변경 메모장']) {
  if (!tools.includes(phrase)) fail(`tools page missing ${phrase}`);
}
if ((tools.match(/data-tool-id=/g) || []).length < 12) fail('tools page must keep 12 tool cards');
for (const r of ['faq','consult-motives','consult-result','provider-updates']) {
  if (fs.existsSync(path.join(ROOT, r))) fail(`removed route regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const full = path.join(ROOT, sm);
    if (fs.existsSync(full) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
const check = spawnSync(process.execPath, ['--check', path.join(ROOT,'assets/js/v115-tools-stability-main-modal-unify.js')], {encoding:'utf8'});
if (check.status !== 0) fail(check.stderr || 'V115 JS syntax check failed');
console.log('[V115 VERIFY PASS] tools stability lock and main modal flow are active');
