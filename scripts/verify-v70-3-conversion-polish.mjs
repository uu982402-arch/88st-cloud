import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const fail = (msg) => { console.error(msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const mustContain = (html, token, where) => { if (!html.includes(token)) fail(`${where} missing ${token}`); };
const guaranteed = read('guaranteed/index.html');
const consult = read('consult/index.html');
const css = read('assets/css/v70-3.conversion-polish.css');
const pkg = JSON.parse(read('package.json'));
for (const v of ['SK 홀딩스','여왕벌','ANY BET','UDT BET','땅콩 BET']) mustContain(guaranteed, v, '/guaranteed/');
mustContain(guaranteed, 'v70-3-vendor-card', '/guaranteed/');
mustContain(guaranteed, 'data-v70-copy', '/guaranteed/');
mustContain(guaranteed, '공식주소 확인', '/guaranteed/');
if (/rounded-full|border-radius:\s*9999px|vendor-avatar|logo-circle|원형/.test(guaranteed)) fail('/guaranteed/ has legacy circular-card token');
for (const t of ['업체 선택','코드 확인','텔레그램 이동']) mustContain(consult, t, '/consult/');
mustContain(consult, 'v70-3-funnel', '/consult/');
mustContain(css, '@media (min-width:721px)', 'v70-3 css');
mustContain(css, '.v70-2-mobile-nav.v70-3-mobile-nav', 'v70-3 css');
if (!pkg.scripts.build.includes('generate-v70-3-conversion-polish.mjs')) fail('build script missing v70-3 generator');
if (pkg.scripts.verify !== 'node scripts/verify-v70-3-conversion-polish.mjs') fail('verify script not pointing to v70-3');
const htmlFiles = fs.readdirSync(root,{recursive:true}).filter(f=>String(f).endsWith('.html')).map(String);
let tagged = 0;
for (const f of htmlFiles) {
  const html = read(f);
  if (html.includes('data-v70-3-polish="true"')) tagged++;
}
if (tagged < 600) fail(`too few v70-3 tagged html files: ${tagged}`);
console.log(`V70-3 verify passed. tagged=${tagged}`);
