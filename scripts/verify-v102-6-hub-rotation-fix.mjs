import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const fail=(msg)=>{ console.error('[V102.6 VERIFY FAIL]',msg); process.exit(1); };
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const index=read('index.html');
if(!index.includes('data-v102-6-hub-rotation="active"')) fail('index html marker missing');
if(!index.includes('/assets/css/v102-6-hub-rotation-fix.css')) fail('v102.6 css link missing');
if(!index.includes('/assets/js/v102-6-hub-rotation-fix.js')) fail('v102.6 js link missing');
if(!index.includes('id="v81-1-sports-pool"')) fail('sports pool missing');
if(!index.includes('id="v81-1-guides-pool"')) fail('guides pool missing');
const sportsJson=(index.match(/<script type="application\/json" id="v81-1-sports-pool">([\s\S]*?)<\/script>/)||[])[1];
const guidesJson=(index.match(/<script type="application\/json" id="v81-1-guides-pool">([\s\S]*?)<\/script>/)||[])[1];
let sports=[],guides=[];
try{ sports=JSON.parse(sportsJson||'[]'); guides=JSON.parse(guidesJson||'[]'); }catch(e){ fail('rotation pool JSON invalid'); }
if(sports.length<12) fail(`sports pool too small: ${sports.length}`);
if(guides.length<35) fail(`guides pool too small: ${guides.length}`);
if((index.match(/data-v811-sports-card=/g)||[]).length!==5) fail('sports visible slot count must remain 5');
if((index.match(/data-v811-guides-card=/g)||[]).length!==5) fail('guide visible slot count must remain 5');
const js=read('assets/js/v102-6-hub-rotation-fix.js');
for(const token of ['setInterval','visibilitychange','data-v102-6-rotated','v81-1-sports-pool','v81-1-guides-pool']) if(!js.includes(token)) fail(`js missing token: ${token}`);
for(const v of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) if(!index.includes(`/guaranteed/${v}/`)) fail(`main missing vendor link ${v}`);
const removed=['faq','consult-motives','consult-result','provider-updates'];
for(const r of removed){
  if(fs.existsSync(path.join(ROOT,r))) fail(`removed route directory regenerated: ${r}`);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if(fs.existsSync(path.join(ROOT,sm)) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
}
console.log('[V102.6 VERIFY PASS] sports/search guide hub rotation locked');
