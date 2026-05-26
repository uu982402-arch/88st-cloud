import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const errors = [];
const read = f => fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : '';
const exists = f => fs.existsSync(path.join(root, f));
const vendors = [
  ['sk-holdings','SK 홀딩스','IRON888','https://snk-99.com/'],
  ['zakum','자쿰','zk888','https://zk-777.com/?code=zk888'],
  ['udt','UDT BET','SEOA','https://udt-01.com/'],
  ['queenbee','여왕벌','SEOA','https://qb-700.com/?code=seoa'],
  ['ddangkong','땅콩 BET','DDK888','https://ddk-2024.com/'],
  ['anybet','ANY BET','SEOA','https://any-777.com/']
];
const mustExist = [
  'assets/css/v96-5-guaranteed-conversion.css',
  'assets/js/v96-5-guaranteed-conversion.js',
  'assets/data/v96-5-guaranteed-conversion.json',
  'scripts/generate-v96-5-guaranteed-conversion.mjs',
  'scripts/verify-v96-5-guaranteed-conversion.mjs',
  'build.txt',
  'assets/js/build.ver.js'
];
for (const f of mustExist) if (!exists(f)) errors.push(`missing file: ${f}`);
const pkg = JSON.parse(read('package.json') || '{}');
if (!pkg.scripts?.build?.includes('generate-v96-5-guaranteed-conversion.mjs')) errors.push('package build missing V96.5 generator');
if (pkg.scripts?.verify !== 'node scripts/verify-v96-5-guaranteed-conversion.mjs') errors.push('package verify is not V96.5 verifier');
if (!pkg.scripts?.['quality:v96-5'] || !pkg.scripts?.['verify:v96-5']) errors.push('package V96.5 helper scripts missing');
const css = read('assets/css/v96-5-guaranteed-conversion.css');
for (const token of ['V96.5 GUARANTEED CONVERSION PATCH','v96-5-conversion-rail','v96-5-detail-quickbar','object-fit','safe-area-inset-bottom','data-v965-card']) {
  if (!css.includes(token)) errors.push(`V96.5 CSS missing token: ${token}`);
}
const js = read('assets/js/v96-5-guaranteed-conversion.js');
for (const token of ['__RUST_V96_5_BUILD__','RUST_GUARANTEED_CONVERSION','vendor_copy_code','vendor_detail_click','v96_5_card_body']) {
  if (!js.includes(token)) errors.push(`V96.5 JS missing token: ${token}`);
}
const data = JSON.parse(read('assets/data/v96-5-guaranteed-conversion.json') || '{}');
if (!Array.isArray(data.vendors) || data.vendors.length !== 6) errors.push('V96.5 data does not contain 6 vendors');
const hub = read('guaranteed/index.html');
if (!hub.includes('data-v965-conversion-rail="true"')) errors.push('guaranteed hub missing V96.5 conversion rail');
if (!hub.includes('data-rust-schema="v96-5"')) errors.push('guaranteed hub schema not updated to V96.5');
if (hub.includes('/guaranteed/udt-bet/') || hub.includes('/guaranteed/ddangkong-bet/')) errors.push('guaranteed hub schema still contains old vendor routes');
for (const [slug,name,code,href] of vendors) {
  if (!hub.includes(`/guaranteed/${slug}/`)) errors.push(`hub missing ${slug} route`);
  if (!hub.includes(`data-vendor="${slug}" data-v965-card="true"`)) errors.push(`hub missing V96.5 card marker for ${slug}`);
  const file = `guaranteed/${slug}/index.html`;
  const html = read(file);
  if (!html) { errors.push(`missing detail page: ${file}`); continue; }
  for (const token of ['V96_5_GUARANTEED_CONVERSION_ACTIVE','data-v96-5-guaranteed-conversion="true"','v96-5-guaranteed-conversion.js','data-v965-quickbar="true"']) {
    if (!html.includes(token)) errors.push(`${file}: missing ${token}`);
  }
  if (!html.includes(`data-code="${code}"`)) errors.push(`${file}: missing code ${code}`);
  if (!html.includes(`data-href="${href}"`)) errors.push(`${file}: missing outbound href ${href}`);
  const headerCount = (html.match(/<header\b/g) || []).length;
  if (headerCount !== 1) errors.push(`${file}: expected one header, got ${headerCount}`);
}
for (const file of ['guaranteed/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html']) {
  const html = read(file);
  if (!html.includes('v96-4-live-qa-cache-safe')) errors.push(`${file}: V96.4 marker lost`);
  if (!html.includes('v96-3-mobile-safe-layout')) errors.push(`${file}: V96.3 marker lost`);
}
if (!read('build.txt').includes('static-v96-5-guaranteed-conversion-20260526')) errors.push('build.txt missing V96.5 version');
if (!read('assets/js/build.ver.js').includes('V96.5-GUARANTEED-CONVERSION-20260526')) errors.push('build.ver.js missing V96.5 build id');
const forbidden = ['RUST MOTION HUB','신규 유입 확장 콘텐츠','토토·입플·보증업체·도구 연결 50개','페이지 하단의 내부 링크','관련 글과 다음 확인 루트','CONSULT FLOW','상담 전 필요한 정보','오늘 확인해야 할 것','상담 전 먼저 확인할 것','함께 확인할 글'];
for (const file of ['guaranteed/index.html', ...vendors.map(v => `guaranteed/${v[0]}/index.html`)]) {
  const html = read(file);
  for (const phrase of forbidden) if (html.includes(phrase)) errors.push(`${file}: forbidden phrase detected: ${phrase}`);
}
if (errors.length) {
  console.error('[V96.5 verify failed]');
  for (const err of errors) console.error('-', err);
  process.exit(1);
}
console.log('[V96.5 verify ok] guaranteed conversion patch verified');
