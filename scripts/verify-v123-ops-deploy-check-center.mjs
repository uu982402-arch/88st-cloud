import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root=process.cwd();
function file(p){return join(root,p)}
function read(p){return readFileSync(file(p),'utf8')}
function fail(m){console.error('V123 VERIFY FAIL:',m);process.exit(1)}
function ok(c,m){if(!c)fail(m)}
function listHtml(){const out=[];function walk(abs){for(const name of readdirSync(abs)){const p=join(abs,name);const st=statSync(p);if(st.isDirectory()){if(['node_modules','.git'].includes(name))continue;walk(p)}else if(name.endsWith('.html'))out.push(relative(root,p).replace(/\\/g,'/'))}}walk(root);return out}
const removed=['faq','consult-motives','consult-result','provider-updates'];
for(const r of removed){ok(!existsSync(file(r)),`removed route regenerated: ${r}`);for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if(existsSync(file(sm))) ok(!read(sm).includes('/'+r),`removed route in ${sm}: ${r}`)}
for(const p of ['assets/css/v123-ops-deploy-check-center.css','assets/js/v123-ops-deploy-check-center.js','reports/v123-route-audit.json','reports/v123-ops-dashboard-audit.json','reports/v123-remove-candidates.txt']) ok(existsSync(file(p)),`missing ${p}`);
const ops=read('ops/index.html');
ok(ops.includes('data-v123-ops-deploy-check="active"'),'ops html attr missing');
ok(ops.includes('v123-ops-deploy-check-center.css'),'ops css missing');
ok(ops.includes('v123-ops-deploy-check-center.js'),'ops js missing');
ok(ops.includes('id="v123-deploy-center"'),'V123 deploy center section missing');
ok(ops.includes('V123 DEPLOY CHECK CENTER'),'V123 title missing');
ok(ops.includes('<b data-metric="vendors">6</b>'),'ops vendor metric not updated to 6');
ok(ops.includes('<b data-metric="tools">12</b>'),'ops tool metric not updated to 12');
ok(ops.includes('/guaranteed/zakum/'),'zakum landing missing in ops defaults');
ok(ops.includes('/guaranteed/udt/'),'udt landing missing or old route remains');
ok(ops.includes('/guaranteed/ddangkong/'),'ddangkong landing missing or old route remains');
ok(!ops.includes('/guaranteed/udt-bet/'),'old udt-bet route remains in ops defaults');
ok(!ops.includes('/guaranteed/ddangkong-bet/'),'old ddangkong-bet route remains in ops defaults');
ok(ops.includes('가입코드 매칭 체크 PRO') && ops.includes('도메인 변경 메모장'),'V103 new tools missing in ops defaults');
ok(ops.includes('meta name="robots" content="noindex,nofollow,noarchive"'),'ops noindex missing');
const dataMatch=ops.match(/<script type="application\/json" id="v123-deploy-data">([\s\S]*?)<\/script>/);
ok(dataMatch,'V123 deploy data JSON missing');
const data=JSON.parse(dataMatch[1]);
ok(data.summary && data.summary.vendors===6,'deploy data vendor count wrong');
ok(data.summary.tools===12,'deploy data tool count wrong');
ok((data.coreUrls||[]).length>=11,'deploy data core URL count too small');
ok((data.locks||[]).some(x=>x.label.includes('삭제 확정')),'removed route lock missing in deploy data');
const routeAudit=JSON.parse(read('reports/v123-route-audit.json'));
ok(routeAudit.removed_routes.every(x=>x.exists===false),'route audit says removed route exists');
for(const p of ['index.html','tools/index.html']){const t=read(p);ok(t.includes('v122-tools-result-card-copy-polish'),`V122 tools UX missing in ${p}`);}
const home=read('index.html');
ok(home.includes('data-v115-main-tool="sports"'),'V115 home modal trigger missing');
ok(home.includes('v120-fold'),'V120 first fold missing');
ok(home.includes('v121-clean-layout-lock.css'),'V121 clean layout lock missing on home');
const tools=read('tools/index.html');
ok((tools.match(/class="v73-tool-card/g)||[]).length>=12,'tools page has fewer than 12 tool cards');
ok(tools.includes('data-v73-copy'),'tools copy button missing');
const gh=read('guaranteed/index.html');
for(const bad of ['조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준']) ok(!gh.includes(bad),`guaranteed banned text returned: ${bad}`);
for(const p of listHtml().filter(p=>p.startsWith('tools/'))){const t=read(p);for(const bad of ['class="v36-related-links"','class="v36-growth-hubs"','class="v36-conversion-cta"','class="v70-2-related"','quick-resource-grid','같이 보면 좋은 링크','<h2>관련 확인</h2>','<span>RELATED</span>']) ok(!t.includes(bad),`V121 banned bottom marker returned in ${p}: ${bad}`)}
console.log('V123 VERIFY PASS: ops deploy check center added, vendor/tool metrics current, V115/V120/V121/V122 locks preserved');
