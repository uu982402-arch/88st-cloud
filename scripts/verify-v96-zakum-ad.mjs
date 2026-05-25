import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const exists = p => fs.existsSync(path.join(root,p));
const fail = msg => { throw new Error(`[V96 verify] ${msg}`); };
const order = ['sk-holdings.webp','zakum.webp','udt-bet.webp','queenbee.webp','ddangkong-bet.webp','anybet.webp'];
for (const img of ['sk-holdings.webp','zakum.webp','udt-bet.webp','queenbee.webp','ddangkong-bet.webp','anybet.webp']) {
  if (!exists(`assets/img/guaranteed/cards/${img}`)) fail(`missing card image ${img}`);
}
if (!exists('assets/img/partners/v71-zakum.webp')) fail('missing partner zakum image');
if (!exists('guaranteed/zakum/index.html')) fail('missing zakum landing');
const main = read('index.html');
const guaranteed = read('guaranteed/index.html');
const zakum = read('guaranteed/zakum/index.html');
for (const file of [['index.html',main],['guaranteed/index.html',guaranteed],['guaranteed/zakum/index.html',zakum]]) {
  if (!file[1].includes('v96-zakum-ad')) fail(`${file[0]} missing V96 marker`);
}
function assertOrder(label, html) {
  let pos = -1;
  for (const needle of order) {
    const next = html.indexOf(needle, pos + 1);
    if (next < 0) fail(`${label} missing ${needle}`);
    if (next <= pos) fail(`${label} order broken at ${needle}`);
    pos = next;
  }
}
assertOrder('main', main);
assertOrder('guaranteed', guaranteed);
if ((guaranteed.match(/class="v74-1-vendor-card"/g)||[]).length !== 6) fail('guaranteed card count is not 6');
for (const s of ['자쿰','zk888','https://zk-777.com/?code=zk888','신규회원 스포츠 첫충전 40%','카지노 금지게임 없음']) {
  if (!zakum.includes(s)) fail(`zakum landing missing ${s}`);
}
if (!read('sitemap.xml').includes('https://88st.cloud/guaranteed/zakum/')) fail('sitemap.xml missing zakum URL');
if (!read('sitemap.txt').includes('https://88st.cloud/guaranteed/zakum/')) fail('sitemap.txt missing zakum URL');
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.trim().endsWith('node scripts/generate-v96-zakum-ad.mjs')) fail('V96 generator is not last in build chain');
if (pkg.scripts.verify !== 'node scripts/verify-v96-zakum-ad.mjs') fail('verify does not point to V96');
for (const bad of ['RUST MOTION HUB','신규 유입 확장 콘텐츠','페이지 하단의 내부 링크','관련 글과 다음 확인 루트','CONSULT FLOW']) {
  if (main.includes(bad) || guaranteed.includes(bad) || zakum.includes(bad)) fail(`banned phrase resurfaced: ${bad}`);
}
console.log(JSON.stringify({ ok:true, version:'V96_ZAKUM_AD_ACTIVE', guaranteedCards:6, order }, null, 2));
