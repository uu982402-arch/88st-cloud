import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (rel) => fs.existsSync(p(rel));
const read = (rel) => fs.readFileSync(p(rel), 'utf8');
const fail = (msg) => { console.error('[VERIFY FAIL]', msg); process.exit(1); };
const assert = (cond, msg) => { if(!cond) fail(msg); };
const runPrev = (script) => { const r = spawnSync(process.execPath, [script], { cwd: root, stdio: 'inherit' }); assert(r.status === 0, `${script} must pass`); };
const vendors = [
  ['sk-holdings','SK 홀딩스','assets/img/guaranteed/cards/sk-holdings.webp'],
  ['zakum','자쿰','assets/img/guaranteed/cards/zakum.webp'],
  ['udt','UDT BET','assets/img/guaranteed/cards/udt-bet.webp'],
  ['queenbee','여왕벌','assets/img/guaranteed/cards/queenbee.webp'],
  ['ddangkong','땅콩 BET','assets/img/guaranteed/cards/ddangkong-bet.webp'],
  ['anybet','ANY BET','assets/img/guaranteed/cards/anybet.webp'],
];
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
runPrev('scripts/verify-v117-search-guides-index-quality.mjs');
for (const route of removedRoutes){
  assert(!exists(route), `removed route directory regenerated: ${route}`);
  assert(!exists(`${route}.html`), `removed route file regenerated: ${route}.html`);
}
for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){
  if(!exists(sm)) continue;
  const s = read(sm);
  for (const route of removedRoutes) assert(!s.includes(`/${route}/`) && !s.includes(`/${route}.html`), `${sm} contains removed route ${route}`);
}
const hub = read('guaranteed/index.html');
assert(hub.includes('v119-guaranteed-cleanup.css'), 'guaranteed hub missing V119 CSS');
assert((hub.match(/class="v74-1-vendor-card"/g)||[]).length === 6, 'guaranteed hub must keep exactly 6 cards');
assert(!hub.includes('조건 상담 후 이용'), 'hub still contains condition consult CTA variant');
assert(!hub.includes('상담 후 이용'), 'hub still contains 상담 후 이용 text');
assert(!hub.includes('확인 기준'), 'hub still contains 확인 기준 card label');
assert(!hub.includes('상담으로 조건 확인'), 'hub still contains consult CTA text');
assert(!hub.includes('v118-consult-btn'), 'hub still contains third consult CTA button');
assert((hub.match(/data-ga4-event="vendor_detail_click"/g)||[]).length >= 6, 'detail CTA events missing');
assert((hub.match(/data-ga4-event="vendor_outbound_click"/g)||[]).length >= 6, 'outbound CTA events missing');
assert((hub.match(/data-v118-cta-variants=/g)||[]).length >= 12, 'CTA variant attributes unexpectedly removed');
for (const [slug,name,img] of vendors){
  const rel = `guaranteed/${slug}/index.html`;
  assert(exists(rel), `${rel} missing`);
  const s = read(rel);
  assert(s.includes('v119-guaranteed-cleanup.css'), `${rel} missing V119 CSS`);
  assert(s.includes('v119-detail-art'), `${rel} missing reinforced image wrapper marker`);
  assert(exists(img), `vendor image missing: ${img}`);
  assert(s.includes(path.basename(img)), `${rel} does not reference expected card image`);
  assert(!s.includes('조건 상담 후 이용'), `${rel} still has condition consult variant`);
  assert(!s.includes('상담으로 조건 확인'), `${rel} still has consult CTA text`);
  assert(!s.includes('v118-detail-consult'), `${rel} still has hero consult CTA`);
  assert(!s.includes('class="v96-2-contact"'), `${rel} still has bottom consult/contact section`);
  assert(s.includes('data-ga4-event="vendor_copy_code"'), `${rel} missing copy event`);
  assert(s.includes('data-ga4-event="vendor_outbound_click"'), `${rel} missing outbound event`);
}
const css = read('assets/css/v119-guaranteed-cleanup.css');
assert(css.includes('object-fit:contain!important'), 'V119 image contain rule missing');
assert(css.includes('v96-2-contact') && css.includes('display:none'), 'V119 defensive bottom contact hide rule missing');
for (const report of ['reports/v119-route-audit.json','reports/v119-cta-audit.json','reports/v119-asset-audit.json','reports/v119-seo-audit.json','reports/v119-remove-candidates.txt','V119_PATCH_MANIFEST.json','V119_UPGRADE_REPORT.md']) assert(exists(report), `${report} missing`);
const home = read('index.html');
assert((home.match(/프리미엄 보증업체/g)||[]).length === 1, 'home premium guaranteed section must remain exactly one');
const tools = read('tools/index.html');
assert((tools.match(/data-tool-id=/g)||[]).length >= 12 || (tools.match(/data-v115-tool-id=/g)||[]).length >= 12 || tools.includes('가입코드 매칭 체크 PRO'), 'tools page 12-tool stability signal missing');
const blob = ['index.html','tools/index.html','assets/js/v115-tools-stability-main-modal-unify.js'].filter(exists).map(read).join('\n');
assert(!/v114-2|V114\.2|V114_2/i.test(blob), 'V114.2 marker/script reappeared');
console.log('[V119 VERIFY PASS] deploy QA and guaranteed cleanup checks passed');
