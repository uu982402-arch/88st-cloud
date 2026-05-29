import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root=process.cwd();
function file(p){return join(root,p)}
function read(p){return readFileSync(file(p),'utf8')}
function fail(m){console.error('V122 VERIFY FAIL:',m);process.exit(1)}
function ok(c,m){if(!c)fail(m)}
function listHtml(){const out=[];function walk(abs){for(const name of readdirSync(abs)){const p=join(abs,name);const st=statSync(p);if(st.isDirectory()){if(['node_modules','.git'].includes(name))continue;walk(p)}else if(name.endsWith('.html'))out.push(relative(root,p).replace(/\\/g,'/'))}}walk(root);return out}
for(const r of ['faq','consult-motives','consult-result','provider-updates']){
  ok(!existsSync(file(r)),`removed route regenerated: ${r}`);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if(existsSync(file(sm))) ok(!read(sm).includes('/'+r),`removed route in ${sm}: ${r}`);
}
ok(existsSync(file('assets/css/v122-tools-result-card-copy-polish.css')),'V122 css missing');
ok(existsSync(file('assets/js/v122-tools-result-card-copy-polish.js')),'V122 js missing');
ok(existsSync(file('reports/v122-tools-result-ux-audit.json')),'V122 audit report missing');
for(const p of ['index.html','tools/index.html']){
  const t=read(p);
  ok(t.includes('v122-tools-result-card-copy-polish.css'),`V122 css link missing: ${p}`);
  ok(t.includes('v122-tools-result-card-copy-polish.js'),`V122 js link missing: ${p}`);
  ok(t.includes('data-v122-tools-result-ux="active"'),`V122 html attr missing: ${p}`);
}
const home=read('index.html');
ok(home.includes('v115-tools-stability-main-modal-unify.js'),'V115 home modal runtime missing');
ok(home.includes('data-v115-main-tool="sports"'),'V115 home sports modal trigger missing');
ok(home.includes('v120-fold'),'V120 main first fold missing');
ok(home.includes('v121-clean-layout-lock.css'),'V121 clean layout lock missing on home');
const tools=read('tools/index.html');
ok(tools.includes('v73-result__value'),'V73 result value missing');
ok(tools.includes('data-v73-copy'),'V73 copy button missing');
ok(tools.includes('v103-result'),'V103 result panel missing');
ok(!tools.includes('class="v73-footer-cta"'),'tools footer consult CTA remains');
ok(!tools.includes('class="v73-fab"'),'tools floating consult FAB remains');
ok(!tools.includes('data-v103-consult'),'legacy v103 consult button remains');
ok(tools.includes('v121-clean-layout-lock.css'),'V121 no-bottom lock missing on tools');
for(const p of listHtml().filter(p=>p.startsWith('tools/'))){
  const t=read(p);
  ok(t.includes('v122-tools-result-card-copy-polish.css'),`V122 css missing from tools page: ${p}`);
  for(const bad of ['class="v70-2-sticky-cta"','class="v70-2-fab"','class="v73-footer-cta"','class="v73-fab"','data-v103-consult']) ok(!t.includes(bad),`${bad} remains in ${p}`);
  for(const bad of ['class="v36-related-links"','class="v36-growth-hubs"','class="v36-conversion-cta"','class="v70-2-related"','quick-resource-grid','같이 보면 좋은 링크','<h2>관련 확인</h2>','<span>RELATED</span>']) ok(!t.includes(bad),`V121 banned bottom marker returned in ${p}: ${bad}`);
}
const gh=read('guaranteed/index.html');
for(const bad of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준']) ok(!gh.includes(bad),`guaranteed banned text returned: ${bad}`);
const audit=JSON.parse(read('reports/v122-tools-result-ux-audit.json'));
ok(audit.deleted_files===0,'deleted_files must be 0');
ok((audit.touched_files||[]).includes('tools/index.html'),'audit should include tools/index.html');
ok((audit.touched_files||[]).includes('index.html'),'audit should include index.html');
console.log('V122 VERIFY PASS: tools result cards/copy UX polished, bottom consult UI locked out, V115/V120/V121 preserved');
