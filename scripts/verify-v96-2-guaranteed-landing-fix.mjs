import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
const fail = msg => { throw new Error(`[V96-2 verify] ${msg}`); };
const pages = ['sk-holdings','udt','queenbee','ddangkong','anybet','zakum'].map(slug => `guaranteed/${slug}/index.html`);
for (const p of ['assets/css/v96-2-guaranteed-landing-fix.css','assets/js/v96-2-guaranteed-landing-fix.js','assets/data/v96-2-guaranteed-landing-fix.json','guaranteed/index.html', ...pages]) if (!exists(p)) fail(`missing ${p}`);
const css = read('assets/css/v96-2-guaranteed-landing-fix.css');
if (!css.includes('object-fit:contain!important')) fail('image crop rollback rule missing');
if (!css.includes('.v96-2-detail')) fail('detail design rules missing');
const hub = read('guaranteed/index.html');
if (!hub.includes('V96_2_GUARANTEED_LANDING_FIX_ACTIVE')) fail('hub missing V96-2 marker');
if (!hub.includes('v96-2-guaranteed-landing-fix.css')) fail('hub missing V96-2 css');
for (const p of pages) {
  const html = read(p);
  if (!html.includes('V96_2_GUARANTEED_LANDING_FIX_ACTIVE')) fail(`${p} missing V96-2 marker`);
  if (!html.includes('v96-2-detail')) fail(`${p} missing v96-2 detail class`);
  if ((html.match(/<header\b/g) || []).length !== 1) fail(`${p} has duplicate/missing header`);
  if (html.includes('V54 디자인 보강')) fail(`${p} still exposes V54 marker`);
  if (html.includes('<header class="v67-header"') || html.includes('moon-header v39-header v54-header')) fail(`${p} still contains legacy header`);
  if (html.includes('/ fetchpriority')) fail(`${p} has malformed image tag`);
  if (!html.includes('data-v92-go="true"') || !html.includes('data-v92-copy="true"')) fail(`${p} missing copy/outbound hooks`);
  if (!html.includes('data-ga4-event="vendor_outbound_click"') || !html.includes('data-ga4-event="vendor_copy_code"')) fail(`${p} missing GA4 event hooks`);
  if (!html.includes('object-fit')) { /* CSS carries this rule; no-op check kept simple */ }
}
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.trim().endsWith('node scripts/generate-v96-2-guaranteed-landing-fix.mjs')) fail('V96-2 generator is not last in build');
if (pkg.scripts.verify !== 'node scripts/verify-v96-2-guaranteed-landing-fix.mjs') fail('verify does not point to V96-2');
for (const bad of ['RUST MOTION HUB','신규 유입 확장 콘텐츠','토토·입플·보증업체·도구 연결 50개','페이지 하단의 내부 링크','관련 글과 다음 확인 루트','CONSULT FLOW','상담 전 필요한 정보','오늘 확인해야 할 것','상담 전 먼저 확인할 것','함께 확인할 글']) {
  if (hub.includes(bad) || pages.some(p => read(p).includes(bad))) fail(`banned phrase resurfaced: ${bad}`);
}
console.log(JSON.stringify({ok:true,version:'V96_2_GUARANTEED_LANDING_FIX_ACTIVE',pages:pages.length,checks:['single header','image contain rollback','copy/outbound hooks','GA4 hooks']}, null, 2));
