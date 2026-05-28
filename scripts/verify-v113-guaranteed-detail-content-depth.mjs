import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const fail=(m)=>{console.error('[V113 VERIFY FAIL]',m);process.exit(1)};
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const vendors=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
for(const slug of vendors){const file=`guaranteed/${slug}/index.html`; if(!fs.existsSync(path.join(ROOT,file))) fail(`missing ${file}`); const h=read(file); if(!h.includes('data-v113-guaranteed-detail-depth="true"')) fail(`${slug} missing body marker`); if(!h.includes('v113-guaranteed-detail-content-depth.css')) fail(`${slug} missing css`); if(!h.includes('v113-guaranteed-detail-content-depth.js')) fail(`${slug} missing js`); if(!h.includes('실사용 확인 루트')) fail(`${slug} missing depth section`); if(!h.includes('조건 확인 매트릭스')) fail(`${slug} missing matrix`); if(!h.includes('상담 전 문의 템플릿')) fail(`${slug} missing template`); if(!h.includes('코드복사 · 공식 이동')) fail(`${slug} CTA missing`);}
for(const p of ['assets/css/v113-guaranteed-detail-content-depth.css','assets/js/v113-guaranteed-detail-content-depth.js']) if(!fs.existsSync(path.join(ROOT,p))) fail(`missing ${p}`);
for(const r of ['faq','consult-motives','consult-result','provider-updates']){ if(fs.existsSync(path.join(ROOT,r))) fail(`removed route regenerated: ${r}`); for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if(fs.existsSync(path.join(ROOT,sm)) && read(sm).includes(`/${r}/`)) fail(`removed route in ${sm}: ${r}`);}
console.log('[V113 VERIFY PASS] guaranteed detail content depth locked');
