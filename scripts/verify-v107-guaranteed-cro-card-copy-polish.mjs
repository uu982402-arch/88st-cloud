import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V107 VERIFY FAIL]', msg); process.exit(1); };
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const pages = ['guaranteed/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
for (const p of pages) {
  const html = read(p);
  if (!html.includes('data-v107-guaranteed-cro="active"')) fail(`${p}: html marker missing`);
  if (!html.includes('/assets/css/v107-guaranteed-cro-card-copy-polish.css')) fail(`${p}: css link missing`);
  if (!html.includes('/assets/js/v107-guaranteed-cro-card-copy-polish.js')) fail(`${p}: js link missing`);
}
const hub = read('guaranteed/index.html');
for (const vendor of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!hub.includes(`/guaranteed/${vendor}/`)) fail(`hub missing vendor ${vendor}`);
}
if ((hub.match(/data-v92-go="true"/g)||[]).length !== 6) fail('hub must keep six outbound buttons');
if ((hub.match(/코드복사 · 이동/g)||[]).length !== 6) fail('hub CTA copy not polished for six cards');
if (hub.includes('>바로가기</button>')) fail('old hub outbound copy remains');
for (const p of pages.slice(1)) {
  const html = read(p);
  if (!html.includes('코드복사 · 공식 이동')) fail(`${p}: detail primary CTA copy missing`);
  if (!html.includes('상담 전 최종 확인')) fail(`${p}: contact copy missing`);
}
const css = read('assets/css/v107-guaranteed-cro-card-copy-polish.css');
if (!css.includes('.v74-1-vendor-card::before') || !css.includes('content:none')) fail('badge suppression rule missing');
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT,r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    if (fs.existsSync(path.join(ROOT,sm)) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V107 VERIFY PASS] guaranteed CRO and card copy polish locked');
