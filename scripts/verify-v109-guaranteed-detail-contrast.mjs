import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V109 VERIFY FAIL]', msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(ROOT,p), 'utf8');
const slugs = ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
for (const slug of slugs) {
  const file = `guaranteed/${slug}/index.html`;
  if (!fs.existsSync(path.join(ROOT,file))) fail(`missing page ${file}`);
  const html = read(file);
  if (!html.includes('data-v109-guaranteed-detail-contrast="active"')) fail(`${slug} html marker missing`);
  if (!html.includes('data-v109-guaranteed-detail-contrast="true"')) fail(`${slug} body marker missing`);
  if (!html.includes('/assets/css/v109-guaranteed-detail-contrast.css')) fail(`${slug} css link missing`);
  if (html.includes('페이지 기준 V54 디자인 보강')) fail(`${slug} old V54 copy still visible`);
  if (html.includes('BENEFIT SUMMARY') || html.includes('CHECK TABLE') || html.includes('COMMON CENTER')) fail(`${slug} old English section label still visible`);
  if (!html.includes('v96-2-table') || !html.includes('v96-2-benefits')) fail(`${slug} detail content structure missing`);
}
const css = read('assets/css/v109-guaranteed-detail-contrast.css');
for (const token of ['#F8FAFC','#D5E0F2','#FFE8B4','v96-2-table th','v96-5-detail-quickbar']) {
  if (!css.includes(token)) fail(`contrast css missing token ${token}`);
}
const removed = ['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) {
  if (fs.existsSync(path.join(ROOT,r))) fail(`removed route directory regenerated: ${r}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    const smPath = path.join(ROOT, sm);
    if (fs.existsSync(smPath) && read(sm).includes(`/${r}/`)) fail(`removed route appears in ${sm}: ${r}`);
  }
}
console.log('[V109 VERIFY PASS] guaranteed detail contrast/copy polish locked');
