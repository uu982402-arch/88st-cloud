import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const exists = p => fs.existsSync(path.join(root,p));
const fail = msg => { throw new Error(`[V96-1 verify] ${msg}`); };
const css = 'assets/css/v96-1-guaranteed-card-scale.css';
for (const p of [css,'assets/img/guaranteed/cards/zakum.webp','assets/img/partners/v71-zakum.webp','guaranteed/index.html','guaranteed/zakum/index.html']) if (!exists(p)) fail(`missing ${p}`);
const g = read('guaranteed/index.html');
const z = read('guaranteed/zakum/index.html');
const c = read(css);
for (const html of [['guaranteed/index.html',g],['guaranteed/zakum/index.html',z]]) {
  if (!html[1].includes('V96_1_GUARANTEED_CARD_SCALE_ACTIVE')) fail(`${html[0]} missing V96-1 marker`);
  if (!html[1].includes('v96-1-guaranteed-card-scale')) fail(`${html[0]} missing V96-1 body class`);
  if ((html[1].match(/v96-1-guaranteed-card-scale\.css/g)||[]).length !== 1) fail(`${html[0]} has duplicate/missing V96-1 css link`);
  if (html[1].includes('6개 보증업체 카드에서 6개 보증업체 카드에서')) fail(`${html[0]} duplicate bridge text remains`);
}
if (!c.includes('width:min(var(--v96-1-shell),calc(100% - 44px))')) fail('scale shell width rule missing');
if (!c.includes('aspect-ratio:2.18/1')) fail('desktop compact image aspect ratio missing');
if (!c.includes('data-v92-detail-image="zakum"')) fail('zakum detail image override missing');
if ((g.match(/class="v74-1-vendor-card"/g)||[]).length !== 6) fail('guaranteed card count not 6');
const order = ['sk-holdings.webp','zakum.webp','udt-bet.webp','queenbee.webp','ddangkong-bet.webp','anybet.webp'];
let pos = -1;
for (const needle of order) {
  const next = g.indexOf(needle, pos + 1);
  if (next < 0) fail(`guaranteed missing ${needle}`);
  if (next <= pos) fail(`guaranteed order broken at ${needle}`);
  pos = next;
}
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.trim().endsWith('node scripts/generate-v96-1-guaranteed-card-scale.mjs')) fail('V96-1 generator is not last in build');
if (pkg.scripts.verify !== 'node scripts/verify-v96-1-guaranteed-card-scale.mjs') fail('verify does not point to V96-1');
for (const bad of ['RUST MOTION HUB','신규 유입 확장 콘텐츠','페이지 하단의 내부 링크','관련 글과 다음 확인 루트','CONSULT FLOW']) {
  if (g.includes(bad) || z.includes(bad)) fail(`banned phrase resurfaced: ${bad}`);
}
console.log(JSON.stringify({ok:true,version:'V96_1_GUARANTEED_CARD_SCALE_ACTIVE',cards:6,order},null,2));
