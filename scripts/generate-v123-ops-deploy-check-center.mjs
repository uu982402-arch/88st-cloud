import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const VERSION = 'V123_OPS_DASHBOARD_DEPLOY_CHECK_CENTER';
const CSS_PATH = 'assets/css/v123-ops-deploy-check-center.css';
const JS_PATH = 'assets/js/v123-ops-deploy-check-center.js';
const CSS = `/* V123 OPS DASHBOARD / DEPLOY CHECK CENTER PATCH */
html[data-v123-ops-deploy-check="active"],html[data-v123-ops-deploy-check="active"] body{max-width:100%;overflow-x:hidden}
body.v123-ops-deploy-check .v123-ops-panel{margin:14px 0 0;border:1px solid rgba(148,163,184,.22);border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.028));box-shadow:0 24px 70px rgba(2,6,23,.34),inset 0 1px 0 rgba(255,255,255,.07);padding:18px;overflow:hidden;position:relative}
body.v123-ops-deploy-check .v123-ops-panel:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 8% 0,rgba(56,189,248,.12),transparent 34%),radial-gradient(circle at 96% 8%,rgba(251,191,36,.10),transparent 30%);pointer-events:none}
body.v123-ops-deploy-check .v123-ops-panel>*{position:relative;z-index:1}
body.v123-ops-deploy-check .v123-ops-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
body.v123-ops-deploy-check .v123-kicker{display:inline-flex;align-items:center;gap:7px;min-height:26px;padding:0 10px;border-radius:999px;border:1px solid rgba(56,189,248,.26);background:rgba(56,189,248,.12);color:#e0f2fe;font-size:11px;font-weight:950;letter-spacing:.08em}
body.v123-ops-deploy-check .v123-kicker:before{content:"";width:7px;height:7px;border-radius:999px;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.14)}
body.v123-ops-deploy-check .v123-ops-head h2{margin:10px 0 6px;color:#f8fafc;font-size:clamp(21px,3vw,30px);line-height:1.08;letter-spacing:-.045em}
body.v123-ops-deploy-check .v123-ops-head p{margin:0;color:#cbd5e1;line-height:1.55;font-weight:700;word-break:keep-all}
body.v123-ops-deploy-check .v123-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
body.v123-ops-deploy-check .v123-btn{min-height:40px;border-radius:14px;border:1px solid rgba(148,163,184,.24);background:rgba(15,23,42,.62);color:#f8fafc;font-size:12px;font-weight:950;padding:0 13px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
body.v123-ops-deploy-check .v123-btn.is-primary{border:0;background:linear-gradient(135deg,#38bdf8,#e0f2fe 60%,#60a5fa);color:#06111f;box-shadow:0 14px 40px rgba(56,189,248,.22)}
body.v123-ops-deploy-check .v123-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}
body.v123-ops-deploy-check .v123-summary-card{min-width:0;border:1px solid rgba(148,163,184,.19);border-radius:20px;background:rgba(15,23,42,.58);padding:13px;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)}
body.v123-ops-deploy-check .v123-summary-card small{display:block;color:#9fb0c7;font-size:11px;font-weight:900;letter-spacing:-.01em}
body.v123-ops-deploy-check .v123-summary-card strong{display:block;margin:6px 0 4px;color:#f8fafc;font-size:clamp(22px,3vw,32px);line-height:1;letter-spacing:-.045em}
body.v123-ops-deploy-check .v123-summary-card span{display:block;color:#cbd5e1;font-size:12px;line-height:1.42;font-weight:750;word-break:keep-all}
body.v123-ops-deploy-check .v123-check-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:12px}
body.v123-ops-deploy-check .v123-card{min-width:0;border:1px solid rgba(148,163,184,.18);border-radius:22px;background:rgba(2,6,23,.34);padding:14px;overflow:hidden}
body.v123-ops-deploy-check .v123-card h3{margin:0 0 9px;color:#f8fafc;font-size:15px;letter-spacing:-.03em}
body.v123-ops-deploy-check .v123-row-list{display:grid;gap:7px;max-height:330px;overflow:auto;padding-right:3px}
body.v123-ops-deploy-check .v123-row{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;border:1px solid rgba(148,163,184,.14);border-radius:14px;background:rgba(15,23,42,.46);padding:9px 10px;min-width:0}
body.v123-ops-deploy-check .v123-row b{color:#f8fafc;font-size:12.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
body.v123-ops-deploy-check .v123-row span{color:#cbd5e1;font-size:11.5px;font-weight:850;word-break:keep-all}
body.v123-ops-deploy-check .v123-row .ok{color:#86efac}.v123-row .warn{color:#fcd34d}.v123-row .fail{color:#fecaca}
body.v123-ops-deploy-check .v123-pill{display:inline-flex;align-items:center;min-height:24px;padding:0 8px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.62);font-size:11px;font-weight:950;color:#dbeafe;white-space:nowrap}
body.v123-ops-deploy-check .v123-pill.ok{border-color:rgba(34,197,94,.28);background:rgba(34,197,94,.12);color:#bbf7d0}
body.v123-ops-deploy-check .v123-pill.warn{border-color:rgba(251,191,36,.30);background:rgba(251,191,36,.12);color:#fde68a}
body.v123-ops-deploy-check .v123-log{margin:12px 0 0;white-space:pre-wrap;word-break:keep-all;overflow:auto;max-height:180px;border:1px solid rgba(148,163,184,.16);border-radius:18px;background:rgba(2,6,23,.62);color:#dbe7f7;padding:12px;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
body.v123-ops-deploy-check .v123-mini-table{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
body.v123-ops-deploy-check .v123-mini{border:1px solid rgba(148,163,184,.14);border-radius:14px;background:rgba(15,23,42,.46);padding:9px 10px;min-width:0}
body.v123-ops-deploy-check .v123-mini b{display:block;color:#f8fafc;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v123-mini span{display:block;margin-top:3px;color:#cbd5e1;font-size:11px;font-weight:800}
body.v123-ops-deploy-check .v80-metrics [data-metric="vendors"],body.v123-ops-deploy-check .v80-metrics [data-metric="tools"]{color:#e0f2fe;text-shadow:0 12px 30px rgba(56,189,248,.22)}
body.v123-ops-deploy-check .v123-toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(16px);opacity:0;pointer-events:none;z-index:700;padding:10px 14px;border-radius:999px;border:1px solid rgba(56,189,248,.30);background:rgba(15,23,42,.98);color:#fff;font-weight:950;font-size:12px;box-shadow:0 18px 55px rgba(0,0,0,.42);transition:.2s ease;white-space:nowrap}.v123-toast.is-show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:980px){body.v123-ops-deploy-check .v123-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}body.v123-ops-deploy-check .v123-check-grid{grid-template-columns:1fr}}
@media(max-width:560px){body.v123-ops-deploy-check .v123-ops-panel{padding:14px;border-radius:22px}body.v123-ops-deploy-check .v123-ops-head{display:grid}body.v123-ops-deploy-check .v123-actions{justify-content:stretch}body.v123-ops-deploy-check .v123-btn{width:100%}body.v123-ops-deploy-check .v123-summary-grid,.v123-mini-table{grid-template-columns:1fr!important}body.v123-ops-deploy-check .v123-row{grid-template-columns:1fr}body.v123-ops-deploy-check .v123-row b{white-space:normal}}
`;
const JS = `/* V123 OPS DASHBOARD / DEPLOY CHECK CENTER PATCH */
(function(){
  var dataEl=document.getElementById('v123-deploy-data');
  if(!dataEl) return;
  var data={};
  try{data=JSON.parse(dataEl.textContent||'{}');}catch(e){data={};}
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function pill(status){var c=status==='ok'?'ok':(status==='warn'?'warn':'');return '<span class="v123-pill '+c+'">'+status+'</span>';}
  function renderRows(sel,items){var box=$(sel);if(!box)return;box.innerHTML=(items||[]).map(function(it){return '<div class="v123-row"><b title="'+it.url+'">'+it.label+'</b><span class="'+(it.status||'ok')+'">'+(it.note||it.url||'확인')+'</span></div>';}).join('');}
  function renderMini(sel,items){var box=$(sel);if(!box)return;box.innerHTML=(items||[]).map(function(it){return '<div class="v123-mini"><b>'+it.name+'</b><span>'+it.note+'</span></div>';}).join('');}
  function toast(msg){var t=$('.v123-toast');if(!t){t=document.createElement('div');t.className='v123-toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('is-show');setTimeout(function(){t.classList.remove('is-show');},1500);}
  function copyText(txt,msg){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast(msg||'복사 완료');}).catch(function(){toast('복사 실패');});}else{var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast(msg||'복사 완료');}}
  function urls(){return (data.coreUrls||[]).map(function(x){return 'https://88st.cloud'+x.url;}).join('\n');}
  renderRows('[data-v123-route-list]',data.coreUrls||[]);
  renderRows('[data-v123-lock-list]',data.locks||[]);
  renderMini('[data-v123-vendor-list]',data.vendors||[]);
  renderMini('[data-v123-tool-list]',data.tools||[]);
  $$('[data-v123-copy="urls"]').forEach(function(btn){btn.addEventListener('click',function(){copyText(urls(),'핵심 URL 복사 완료');});});
  $$('[data-v123-copy="report"]').forEach(function(btn){btn.addEventListener('click',function(){copyText(JSON.stringify(data,null,2),'V123 점검 데이터 복사 완료');});});
  var log=$('[data-v123-live-log]');
  $('[data-v123-run]')&&$('[data-v123-run]').addEventListener('click',function(){
    if(!log) return;
    log.textContent='같은 도메인 기준 fetch 점검을 시작합니다...\n';
    var list=(data.coreUrls||[]).slice(0,12);
    var done=0;
    list.forEach(function(it){
      fetch(it.url,{cache:'no-store'}).then(function(res){
        log.textContent+='['+res.status+'] '+it.url+'\n';
      }).catch(function(err){
        log.textContent+='[ERR] '+it.url+' - '+(err&&err.message?err.message:'fetch failed')+'\n';
      }).finally(function(){done++; if(done===list.length) log.textContent+='완료: '+done+'개 URL 확인\n';});
    });
  });
})();
`;

const vendors = [
  ['SK 홀딩스','/guaranteed/sk-holdings/','IRON888'],
  ['자쿰','/guaranteed/zakum/','ZAKUM'],
  ['UDT BET','/guaranteed/udt/','SEOA'],
  ['여왕벌','/guaranteed/queenbee/','SEOA'],
  ['땅콩 BET','/guaranteed/ddangkong/','DDK888'],
  ['ANY BET','/guaranteed/anybet/','SEOA']
];
const tools = [
  ['주소 확인','official','/tools/'],['가입코드 확인','code','/tools/'],['보너스 실수령','bonus','/tools/'],['롤링 조건','rolling','/tools/'],['배당 마진','margin','/tools/'],['기대값 계산','ev','/tools/'],['스포츠 분석','sports','/tools/'],['이벤트 조건','event','/tools/'],['가입코드 매칭 체크 PRO','match','/tools/'],['보너스 실수령 PRO','bonuspro','/tools/'],['출금 조건 체크리스트','withdraw','/tools/'],['도메인 변경 메모장','domainmemo','/tools/']
];
const coreUrls = [
  ['메인','/','index.html'],['블로그','/blog/','blog/index.html'],['도구','/tools/','tools/index.html'],['보증업체','/guaranteed/','guaranteed/index.html'],['상담','/consult/','consult/index.html'],['스포츠 체크','/sports-check/','sports-check/index.html'],['검색 가이드','/search-guides/','search-guides/index.html'],['운영센터','/ops/','ops/index.html'],['관리자 리다이렉트','/admin/','admin/index.html'],['sitemap.xml','/sitemap.xml','sitemap.xml'],['robots.txt','/robots.txt','robots.txt']
];
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
function file(p){return join(root,p)}
function read(p){return readFileSync(file(p),'utf8')}
function write(p,v){writeFileSync(file(p),v)}
function ensureDir(p){mkdirSync(file(p),{recursive:true})}
function exists(p){return existsSync(file(p))}
function listHtml(){const out=[];function walk(abs){for(const name of readdirSync(abs)){const p=join(abs,name);const st=statSync(p);if(st.isDirectory()){if(['node_modules','.git'].includes(name))continue;walk(p)}else if(name.endsWith('.html'))out.push(relative(root,p).replace(/\\/g,'/'))}}walk(root);return out}
function addHtmlAttr(t){return /data-v123-ops-deploy-check="active"/.test(t)?t:t.replace(/<html\b/i,'<html data-v123-ops-deploy-check="active"')}
function addBodyClass(t){if(/<body\b[^>]*class="/.test(t)) return t.replace(/<body\b([^>]*?)class="([^"]*)"/i,(m,a,c)=>c.split(/\s+/).includes('v123-ops-deploy-check')?m:`<body${a}class="${c} v123-ops-deploy-check"`);return t.replace(/<body\b/i,'<body class="v123-ops-deploy-check"')}
function addHeadAssets(t){if(!t.includes(CSS_PATH)){const tag=`  <meta name="v123-ops-dashboard-deploy-check-center" content="${VERSION}_ACTIVE">\n  <link rel="stylesheet" href="/${CSS_PATH}?v=20260529" data-v123-ops-deploy-check="true">`;t=t.replace('</head>',tag+'\n</head>');}return t}
function addFootAssets(t){if(!t.includes(JS_PATH)){const tag=`  <script src="/${JS_PATH}?v=20260529" defer data-v123-ops-deploy-check="true"></script>`;t=t.replace('</body>',tag+'\n</body>');}return t}
function routeStatus([label,url,path]){return {label,url,path,status:exists(path)?'ok':'warn',note:exists(path)?'파일 존재':'파일 확인 필요'};}
function vendorStatus([name,url,code]){return {name,note:`${url} · 코드 ${code}`};}
function toolStatus([name,id,url]){return {name,note:`${id} · 모달/도구 유지`};}

ensureDir('assets/css');ensureDir('assets/js');ensureDir('reports');
write(CSS_PATH,CSS);write(JS_PATH,JS);

const routeAudit = coreUrls.map(routeStatus);
const lockAudit = [
  {label:'삭제 확정 4개 경로',status:removedRoutes.every(r=>!exists(r))?'ok':'fail',note:removedRoutes.every(r=>!exists(r))?'재생성 없음':'재생성 의심'},
  {label:'V115 메인 도구 모달',status:read('index.html').includes('data-v115-main-tool="sports"')?'ok':'warn',note:'메인 도구 카드 모달 유지'},
  {label:'V121 하단 관련섹션 잠금',status:exists('assets/css/v121-clean-layout-lock.css')?'ok':'warn',note:'no-bottom-related CSS 유지'},
  {label:'V122 도구 결과 UX',status:exists('assets/js/v122-tools-result-card-copy-polish.js')?'ok':'warn',note:'결과 복사 UX 유지'},
  {label:'보증업체 6개 상세',status:vendors.every(v=>exists(v[1].replace(/^\//,'')+'index.html'))?'ok':'warn',note:'6개 랜딩 존재'},
  {label:'도구 12개 카드',status:(read('tools/index.html').match(/class="v73-tool-card/g)||[]).length>=12?'ok':'warn',note:'12개 도구 카드 유지'}
];
const deployData = {
  version:'V123',
  name:'OPS DASHBOARD / DEPLOY CHECK CENTER PATCH',
  base:'V122 FULL',
  generated_at:'2026-05-29',
  summary:{core_urls:coreUrls.length,vendors:vendors.length,tools:tools.length,removed_routes_locked:removedRoutes.length},
  coreUrls:routeAudit,
  vendors:vendors.map(vendorStatus),
  tools:tools.map(toolStatus),
  locks:lockAudit,
  reports:['reports/v123-route-audit.json','reports/v123-ops-dashboard-audit.json','reports/v123-remove-candidates.txt']
};
write('reports/v123-route-audit.json',JSON.stringify({version:'V123',core_urls:routeAudit,removed_routes:removedRoutes.map(r=>({route:r,exists:exists(r)}))},null,2));
write('reports/v123-ops-dashboard-audit.json',JSON.stringify(deployData,null,2));
write('reports/v123-remove-candidates.txt',`V123 OPS DASHBOARD / DEPLOY CHECK CENTER\n\n삭제 파일: 0개\n\n이번 버전은 /ops/에 배포 점검 센터를 추가하고, 실제 삭제는 하지 않았습니다.\n\n후속 제거 후보:\n- V80 OPS 내부의 과거 5개 보증업체/8개 도구 문구가 다른 스크립트에서 재생성되는지 계속 감시\n- 사용하지 않는 구버전 OPS CSS/JS 후보는 다음 버전에서 리포트만 확장\n- V114.2 계열 흔적은 기존 검증 체인을 유지하며 재등장 여부만 확인\n`);

let ops = read('ops/index.html');
ops = addHtmlAttr(addBodyClass(addHeadAssets(addFootAssets(ops))));
ops = ops.replace(/<title>RUST OPS \| 통합 관리자 센터<\/title>/,'<title>RUST OPS | V123 배포 점검 센터</title>');
ops = ops.replace(/V80 CONTROL ONLINE/g,'V123 DEPLOY CHECK ONLINE');
ops = ops.replace(/<b data-metric="vendors">[^<]*<\/b><span>노출 보증업체<\/span>/,'<b data-metric="vendors">6</b><span>보증업체 상세</span>');
ops = ops.replace(/<b data-metric="tools">[^<]*<\/b><span>활성 도구<\/span>/,'<b data-metric="tools">12</b><span>활성 도구</span>');
ops = ops.replace(/<b data-metric="keywords">[^<]*<\/b><span>SEO 키워드<\/span>/,'<b data-metric="keywords">V123</b><span>배포 점검</span>');
if(!ops.includes('href="#v123-deploy-center"')){
  ops = ops.replace('<a href="#deploy">배포검증</a>','<a href="#v123-deploy-center">V123점검</a>\n        <a href="#deploy">배포검증</a>');
}
const dataScript = `<script type="application/json" id="v123-deploy-data">${JSON.stringify(deployData).replace(/</g,'\\u003c')}</script>`;
const section = `\n      <!-- V123 OPS DASHBOARD / DEPLOY CHECK CENTER START -->\n      <section class="v123-ops-panel" id="v123-deploy-center" data-v123-ops-deploy-check="${VERSION}_ACTIVE" aria-label="V123 배포 점검 센터">\n        <div class="v123-ops-head">\n          <div>\n            <span class="v123-kicker">V123 DEPLOY CHECK CENTER</span>\n            <h2>배포 직후 핵심 상태 점검</h2>\n            <p>메인, 도구, 보증업체, sports-check, search-guides, sitemap, noindex, 삭제 확정 경로를 한 화면에서 확인합니다. 하단 관련/연결 섹션은 추가하지 않습니다.</p>\n          </div>\n          <div class="v123-actions">\n            <button class="v123-btn is-primary" type="button" data-v123-run>현재 도메인 점검</button>\n            <button class="v123-btn" type="button" data-v123-copy="urls">URL 복사</button>\n            <button class="v123-btn" type="button" data-v123-copy="report">점검 데이터 복사</button>\n          </div>\n        </div>\n        <div class="v123-summary-grid">\n          <div class="v123-summary-card"><small>핵심 URL</small><strong>${coreUrls.length}</strong><span>업로드 후 우선 확인</span></div>\n          <div class="v123-summary-card"><small>보증업체</small><strong>${vendors.length}</strong><span>상세 랜딩 유지</span></div>\n          <div class="v123-summary-card"><small>도구</small><strong>${tools.length}</strong><span>모달/결과 UX 유지</span></div>\n          <div class="v123-summary-card"><small>삭제 잠금</small><strong>${removedRoutes.length}</strong><span>재생성 금지 경로</span></div>\n        </div>\n        <div class="v123-check-grid">\n          <article class="v123-card"><h3>핵심 URL / 파일 존재</h3><div class="v123-row-list" data-v123-route-list></div></article>\n          <article class="v123-card"><h3>버전 잠금 / 재생성 방지</h3><div class="v123-row-list" data-v123-lock-list></div></article>\n          <article class="v123-card"><h3>보증업체 6개</h3><div class="v123-mini-table" data-v123-vendor-list></div></article>\n          <article class="v123-card"><h3>도구 12개</h3><div class="v123-mini-table" data-v123-tool-list></div></article>\n        </div>\n        <pre class="v123-log" data-v123-live-log>대기 중입니다. 배포 후 버튼을 누르면 같은 도메인의 핵심 URL을 fetch 기준으로 확인합니다.</pre>\n        ${dataScript}\n      </section>\n      <!-- V123 OPS DASHBOARD / DEPLOY CHECK CENTER END -->\n`;
if(!ops.includes('id="v123-deploy-center"')) ops = ops.replace('      <!-- V87 LIVE DEPLOY CHECK START -->',section+'\n      <!-- V87 LIVE DEPLOY CHECK START -->');
const defaults = {
  vendors: vendors.map(([name,landing,code])=>({id:landing.split('/').filter(Boolean).pop(),name,code,status:'노출 유지',landing,target:'#',image:`/assets/img/guaranteed/cards/${landing.split('/').filter(Boolean).pop()==='udt'?'udt-bet':landing.split('/').filter(Boolean).pop()==='ddangkong'?'ddangkong-bet':landing.split('/').filter(Boolean).pop()}.webp`,active:true})),
  tools: tools.map(([name,id,href],i)=>({id,name,href,active:true,usage:98-i*2})),
  consultBot:'@TRS999_bot',
  seoKeywords:['토토','온라인스포츠토토사이트추천','토토사이트추천','입플사이트추천','스포츠입플','카지노입플','미니게임입플사이트','카지노입플사이트추천','2026토토사이트추천','안전한토토사이트추천'],
  popularPosts:['2026 토토사이트추천 기준 정리','스포츠입플 조건 비교 체크리스트','카지노입플 보너스 실수령 계산법','미니게임입플사이트 가입코드 확인법','먹튀 없는 보증업체 선택 기준','배당 마진 계산과 기대값 해석','롤링 조건을 읽는 실전 기준','온라인스포츠토토사이트추천 검증 순서']
};
ops = ops.replace(/<script>window\.RUST_OPS_DEFAULTS=[\s\S]*?<\/script>/,`<script>window.RUST_OPS_DEFAULTS=${JSON.stringify(defaults)};</script>`);
write('ops/index.html',ops);

write('V123_UPGRADE_REPORT.md',`# V123 OPS DASHBOARD / DEPLOY CHECK CENTER PATCH\n\n- V122 FULL 기준 누적 반영\n- /ops/에 V123 배포 점검 센터 추가\n- 핵심 URL, 보증업체 6개, 도구 12개, 삭제 확정 4개 경로 잠금 상태 표시\n- /ops/ 기존 5개 업체/8개 도구 기본값을 6개/12개 최신 기준으로 갱신\n- V121 하단 관련/연결 섹션 금지 정책 유지\n- V122 도구 결과 UX 유지\n- 삭제 파일 0개\n`);
const changed = ['ops/index.html',CSS_PATH,JS_PATH,'reports/v123-route-audit.json','reports/v123-ops-dashboard-audit.json','reports/v123-remove-candidates.txt','V123_UPGRADE_REPORT.md','V123_PATCH_MANIFEST.json','scripts/generate-v123-ops-deploy-check-center.mjs','scripts/verify-v123-ops-deploy-check-center.mjs','package.json'];
write('V123_PATCH_MANIFEST.json',JSON.stringify({version:'V123',name:'OPS DASHBOARD / DEPLOY CHECK CENTER PATCH',base:'V122 FULL',deleted_files:0,changed_files:changed.sort()},null,2));

const pkgPath=file('package.json');
const pkg=JSON.parse(readFileSync(pkgPath,'utf8'));
pkg.scripts=pkg.scripts||{};
if(!String(pkg.scripts.build||'').includes('generate-v123-ops-deploy-check-center.mjs')) pkg.scripts.build=String(pkg.scripts.build||'')+' && node scripts/generate-v123-ops-deploy-check-center.mjs';
pkg.scripts['quality:v123']='node scripts/generate-v123-ops-deploy-check-center.mjs';
pkg.scripts['verify:v123']='node scripts/verify-v123-ops-deploy-check-center.mjs';
pkg.scripts.verify='node scripts/verify-v123-ops-deploy-check-center.mjs';
writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n');

console.log('V123 generated: ops deploy check center added, reports created, package scripts updated');
