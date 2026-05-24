import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=['index.html','guaranteed/index.html','tools/index.html','consult/index.html','assets/css/v69.platform-redesign.css','assets/js/v69.platform-redesign.js','scripts/generate-v69-platform-redesign.mjs'];
const fail=[];
for(const f of required){if(!fs.existsSync(path.join(root,f))) fail.push(`missing:${f}`);}
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const index=read('index.html');
for(const text of ['안전한 보증업체 안내','실시간 이벤트·조건 분석 도구','자동 상담 시스템 연결','보증업체 보기','자동 상담 시작']){if(!index.includes(text)) fail.push(`index missing:${text}`);}
const guaranteed=read('guaranteed/index.html');
for(const text of ['SK 홀딩스','여왕벌','ANY BET','UDT BET','땅콩 BET','가입코드 복사','공식주소']){if(!guaranteed.includes(text)) fail.push(`guaranteed missing:${text}`);}
if(/USER TOOLS|Customer Center|V68 OPS|운영점검|배포점검/.test(index+guaranteed+read('tools/index.html')+read('consult/index.html'))) fail.push('user page leaked legacy ops/title text');
const css=read('assets/css/v69.platform-redesign.css');
for(const text of ['--v69-primary:#10b981','min-height:52px','@media (min-width:721px)','display:none!important']){if(!css.includes(text)) fail.push(`css missing:${text}`);}
const pkg=JSON.parse(read('package.json'));
if(!pkg.scripts.build.includes('generate-v69-platform-redesign.mjs')) fail.push('package build missing v69 generator');
if(!pkg.scripts.verify.includes('verify-v69-platform-redesign.mjs')) fail.push('package verify not v69');
const sitemap=read('sitemap.txt');
const urls=sitemap.split(/\r?\n/).filter(Boolean);
if(urls.length<500) fail.push(`sitemap too small:${urls.length}`);
if(fail.length){console.error('V69 verify failed'); for(const x of fail) console.error('-',x); process.exit(1);} 
console.log('V69 verify passed');
console.log(`checked files: ${required.length}`);
console.log(`sitemap urls: ${urls.length}`);
