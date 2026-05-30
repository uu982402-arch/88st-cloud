import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd(); const fail=[];
function abs(rel){return path.join(ROOT,rel)} function exists(rel){return fs.existsSync(abs(rel))} function read(rel){return fs.readFileSync(abs(rel),'utf8')}
const required=['index.html','assets/css/v132-2-home-guaranteed-card-balance.css','assets/img/guaranteed/cards/ad-inquiry-01.webp','assets/img/guaranteed/cards/ad-inquiry-02.webp','scripts/build-v132-2-cloudflare-pages-safe.mjs','scripts/generate-v132-2-home-guaranteed-card-balance.mjs','scripts/verify-v132-2-home-guaranteed-card-balance.mjs','V132_2_PATCH_MANIFEST.json','V132_2_UPGRADE_REPORT.md','reports/v132-2-home-guaranteed-card-balance-audit.json'];
for(const r of required) if(!exists(r)) fail.push(`missing ${r}`);
if(exists('index.html')){
  const html=read('index.html');
  if(!html.includes('data-v132-2-home-card-balance')) fail.push('index missing V132.2 marker');
  if(!html.includes('v132-2-home-guaranteed-card-balance.css')) fail.push('index missing V132.2 css link');
  const grid=html.match(/<div class="v71-partner-tile-grid">([\s\S]*?)<\/div>\s*<\/aside>/);
  if(!grid) fail.push('home partner grid not found');
  else{
    const body=grid[1];
    const cards=[...body.matchAll(/<a\b[^>]*class="[^"]*v71-partner-card[^"]*"[\s\S]*?<\/a>/g)].map(m=>m[0]);
    if(cards.length!==8) fail.push(`home partner card count expected 8 got ${cards.length}`);
    if(!cards[6]?.includes('data-v1322-ad-card="inquiry-01"')) fail.push('inquiry-01 is not 7th / first of last two cards');
    if(!cards[7]?.includes('data-v1322-ad-card="inquiry-02"')) fail.push('inquiry-02 is not 8th / final card');
    const vendorTargets=['/guaranteed/sk-holdings/','/guaranteed/zakum/','/guaranteed/udt/','/guaranteed/queenbee/','/guaranteed/ddangkong/','/guaranteed/anybet/'];
    for(const href of vendorTargets) if(!body.includes(`href="${href}"`)) fail.push(`missing home vendor href ${href}`);
  }
  const forbidden=['RUST QUICK CHECK','조건 상담 후 이용','상담으로 조건 확인','확인 기준','관련 링크 포함','관련 허브 보기'];
  for(const f of forbidden) if(html.includes(f)) fail.push(`index forbidden token returned: ${f}`);
}
if(exists('guaranteed/index.html')){
  const g=read('guaranteed/index.html');
  const vendorLinks=(g.match(/href="\/guaranteed\/(sk-holdings|zakum|udt|queenbee|ddangkong|anybet)\//g)||[]).length;
  if(vendorLinks<6) fail.push(`guaranteed hub vendor link count too low: ${vendorLinks}`);
  if(g.includes('ad-inquiry-01')||g.includes('ad-inquiry-02')) fail.push('/guaranteed/ hub should not include inquiry image cards');
}
const css=exists('assets/css/v132-2-home-guaranteed-card-balance.css')?read('assets/css/v132-2-home-guaranteed-card-balance.css'):'';
if(!css.includes('grid-template-columns:repeat(2')) fail.push('V132.2 CSS missing desktop 2-column partner grid');
if(css.includes('max-height:106px')) fail.push('V132.2 CSS still contains too-small max-height 106px');
if(exists('package.json')){
  const pkg=JSON.parse(read('package.json'));
  if(!(pkg.scripts?.build||'').includes('build-v132-2-cloudflare-pages-safe.mjs')) fail.push('package build is not V132.2 safe build');
  if(!(pkg.scripts?.verify||'').includes('verify-v132-2-home-guaranteed-card-balance.mjs')) fail.push('package verify is not V132.2 verify');
  const missing=[]; for(const [name,cmd] of Object.entries(pkg.scripts||{})){ for(const m of cmd.matchAll(/scripts\/[A-Za-z0-9_.-]+\.mjs/g)){ if(!exists(m[0])) missing.push(`${name} -> ${m[0]}`); } }
  if(missing.length) fail.push(`package references missing scripts: ${missing.slice(0,20).join(', ')}`);
}
if(fail.length){ console.error('[V132.2 VERIFY FAIL]'); for(const f of fail) console.error('- '+f); process.exit(1); }
console.log('[V132.2 VERIFY PASS] home guaranteed card balance OK');
