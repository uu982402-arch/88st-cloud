import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root=process.cwd();
function file(p){return join(root,p)}
function read(p){return readFileSync(file(p),'utf8')}
function fail(m){console.error('V121 VERIFY FAIL:',m);process.exit(1)}
function ok(c,m){if(!c)fail(m)}
function listHtml(){const out=[];function walk(abs){for(const name of readdirSync(abs)){const p=join(abs,name);const st=statSync(p);if(st.isDirectory()){if(['node_modules','.git'].includes(name))continue;walk(p)}else if(name.endsWith('.html'))out.push(relative(root,p).replace(/\\/g,'/'))}}walk(root);return out}
for(const r of ['faq','consult-motives','consult-result','provider-updates']){
  ok(!existsSync(file(r)),`removed route regenerated: ${r}`);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if(existsSync(file(sm))) ok(!read(sm).includes('/'+r),`removed route in ${sm}: ${r}`);
}
ok(existsSync(file('assets/css/v121-clean-layout-lock.css')),'V121 css missing');
ok(existsSync(file('reports/v121-no-bottom-related-audit.json')),'V121 audit report missing');
const htmlFiles=listHtml();
const banned=[
  'class="v36-related-links"','class="v36-growth-hubs"','class="v36-conversion-cta"','class="v70-2-related"','class="pro-related"','class="article-related-panel"','data-v70-2-related="true"','data-v36-related','quick-resource-grid','consult-motive-section','consult-motive-card','같이 보면 좋은 링크','<h2>관련 링크</h2>','<h2>관련 확인</h2>','<span>RELATED</span>','aria-label="상담 전환"'
];
for(const p of htmlFiles){
  const t=read(p);
  for(const bad of banned) ok(!t.includes(bad),`${bad} remains in ${p}`);
}
for(const p of ['index.html','tools/index.html','blog/index.html','guaranteed/index.html','sports-check/index.html','search-guides/index.html']){
  const t=read(p);
  ok(t.includes('v121-clean-layout-lock.css'),`v121 css link missing: ${p}`);
}
const home=read('index.html');
ok(home.includes('data-v120-fold="true"'),'V120 first fold missing');
ok(home.includes('v115-tools-stability-main-modal-unify.js'),'V115 modal runtime missing');
ok(home.includes('data-v115-main-tool="sports"'),'home tool modal trigger missing');
ok(home.includes('v102-6-hub-rotation-fix.js'),'V102.6 rotation runtime missing');
const gh=read('guaranteed/index.html');
for(const bad of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준']) ok(!gh.includes(bad),`guaranteed banned text remains: ${bad}`);
for(const slug of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']){
  const p=`guaranteed/${slug}/index.html`;
  ok(existsSync(file(p)),`detail missing: ${slug}`);
  const t=read(p);
  ok(t.includes('v120-main-conversion-polish.css'),`V120 detail image css missing: ${slug}`);
  ok(!t.includes('상담 전 문의 템플릿'),`consult template remains: ${slug}`);
  ok(!t.includes('data-ga4-event="consult_click">상담</a>'),`consult quickbar remains: ${slug}`);
}
const report=JSON.parse(read('reports/v121-no-bottom-related-audit.json'));
ok(report.deleted_files===0,'deleted_files must be 0');
ok(Object.keys(report.removed_blocks_by_file||{}).length>=1,'audit should record removed blocks');
console.log('V121 VERIFY PASS: no bottom related/link sections, V120/V115/V102 locks preserved');
