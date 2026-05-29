import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const VERSION = 'V122_TOOLS_RESULT_CARD_COPY_UX_POLISH';
const CSS_PATH = 'assets/css/v122-tools-result-card-copy-polish.css';
const JS_PATH = 'assets/js/v122-tools-result-card-copy-polish.js';
const CSS = `/* V122 TOOLS RESULT CARD / COPY UX POLISH PATCH */
html[data-v122-tools-result-ux="active"],
html[data-v122-tools-result-ux="active"] body{max-width:100%;overflow-x:hidden}
body.v122-tools-result-ux .v73-footer-cta,
body.v122-tools-result-ux .v73-fab,
body.v122-tools-result-ux .v70-2-sticky-cta,
body.v122-tools-result-ux .v70-2-fab{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}
body.v122-tools-result-ux :where(.v73-modal__panel,.v103-modal__panel,.v115-tool-panel){border-radius:24px!important;border:1px solid rgba(148,163,184,.24)!important;box-shadow:0 28px 80px rgba(2,6,23,.50),inset 0 1px 0 rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(7,12,22,.98))!important;overflow:hidden!important}
body.v122-tools-result-ux :where(.v73-modal__head,.v103-modal__head,.v115-tool-head){background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025))!important;border-bottom:1px solid rgba(148,163,184,.18)!important}
body.v122-tools-result-ux :where(.v73-modal__head h2,.v103-modal__head h2,.v115-tool-head h2){letter-spacing:-.04em!important;color:#f8fafc!important}
body.v122-tools-result-ux :where(.v73-modal__head small,.v103-modal__head small,.v115-tool-head small){color:#cbd5e1!important;font-weight:900!important;letter-spacing:.08em!important}
body.v122-tools-result-ux :where(.v73-form-grid,.v103-form,.v115-form-grid){gap:10px!important}
body.v122-tools-result-ux :where(.v73-field,.v103-field,.v115-field){min-width:0!important}
body.v122-tools-result-ux :where(.v73-field label,.v103-field label,.v115-field label){display:block!important;margin:0 0 6px!important;color:#dbe7f7!important;font-size:11.5px!important;font-weight:900!important;letter-spacing:-.01em!important}
body.v122-tools-result-ux :where(.v73-field input,.v73-field select,.v103-field input,.v103-field select,.v103-field textarea,.v115-field input,.v115-field select){min-height:46px!important;width:100%!important;border-radius:14px!important;border:1px solid rgba(148,163,184,.24)!important;background:rgba(2,6,23,.68)!important;color:#f8fafc!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;font-weight:800!important}
body.v122-tools-result-ux :where(.v73-field input:focus,.v73-field select:focus,.v103-field input:focus,.v103-field select:focus,.v103-field textarea:focus,.v115-field input:focus,.v115-field select:focus){outline:none!important;border-color:rgba(56,189,248,.56)!important;box-shadow:0 0 0 3px rgba(56,189,248,.14),inset 0 1px 0 rgba(255,255,255,.05)!important}
body.v122-tools-result-ux :where(.v73-result,.v103-result,.v115-result){position:relative!important;display:grid!important;gap:12px!important;padding:15px!important;border-radius:21px!important;border:1px solid rgba(56,189,248,.25)!important;background:radial-gradient(circle at 14% 0,rgba(56,189,248,.14),transparent 38%),linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025))!important;box-shadow:0 18px 54px rgba(2,6,23,.34),inset 0 1px 0 rgba(255,255,255,.06)!important;min-width:0!important;overflow:hidden!important}
body.v122-tools-result-ux .v122-result-top{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-width:0!important;order:-2!important}
body.v122-tools-result-ux .v122-result-labels{display:flex!important;align-items:center!important;gap:6px!important;flex-wrap:wrap!important;min-width:0!important}
body.v122-tools-result-ux .v122-result-labels span{display:inline-flex!important;align-items:center!important;min-height:25px!important;padding:0 9px!important;border-radius:999px!important;border:1px solid rgba(148,163,184,.22)!important;background:rgba(15,23,42,.62)!important;color:#dbeafe!important;font-size:11px!important;font-weight:950!important;letter-spacing:-.01em!important}
body.v122-tools-result-ux .v122-result-labels span:first-child{border-color:rgba(56,189,248,.30)!important;background:rgba(56,189,248,.12)!important;color:#e0f2fe!important}
body.v122-tools-result-ux .v122-copy-mini{flex:0 0 auto!important;min-height:32px!important;padding:0 11px!important;border-radius:999px!important;border:1px solid rgba(56,189,248,.28)!important;background:rgba(56,189,248,.12)!important;color:#f8fafc!important;font-size:11.5px!important;font-weight:950!important;cursor:pointer!important}
body.v122-tools-result-ux .v122-copy-mini:active{transform:translateY(1px)}
body.v122-tools-result-ux :where(.v73-result__value,.v103-result b[data-v103-result],.v115-result strong[data-v115-value]){display:block!important;color:#eff6ff!important;font-size:clamp(21px,4vw,32px)!important;line-height:1.08!important;letter-spacing:-.045em!important;word-break:keep-all!important;margin:0!important;text-shadow:0 8px 30px rgba(56,189,248,.20)!important}
body.v122-tools-result-ux :where(.v73-result__note,.v103-result pre[data-v103-note],.v115-result pre[data-v115-note]){display:block!important;white-space:pre-wrap!important;word-break:keep-all!important;overflow-wrap:anywhere!important;margin:0!important;color:#dbe7f7!important;line-height:1.58!important;font-family:inherit!important;font-size:13.1px!important;max-height:min(30vh,230px)!important;overflow:auto!important;padding-right:4px!important}
body.v122-tools-result-ux .v122-breakdown{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin-top:0!important}
body.v122-tools-result-ux .v122-breakdown-card{min-width:0!important;border-radius:16px!important;border:1px solid rgba(148,163,184,.18)!important;background:rgba(15,23,42,.54)!important;padding:10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important}
body.v122-tools-result-ux .v122-breakdown-card b{display:block!important;margin-bottom:5px!important;color:#f8fafc!important;font-size:11.5px!important;letter-spacing:-.01em!important}
body.v122-tools-result-ux .v122-breakdown-card span{display:block!important;color:#cbd5e1!important;font-size:12px!important;line-height:1.45!important;word-break:keep-all!important;overflow-wrap:anywhere!important}
body.v122-tools-result-ux .v122-breakdown-card.is-point{border-color:rgba(56,189,248,.26)!important;background:rgba(56,189,248,.10)!important}
body.v122-tools-result-ux .v122-result-state{display:flex!important;align-items:center!important;gap:7px!important;color:#b9c6d9!important;font-size:11.5px!important;line-height:1.35!important}
body.v122-tools-result-ux .v122-result-state:before{content:"";width:7px;height:7px;border-radius:999px;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.13);flex:0 0 auto}
body.v122-tools-result-ux :where(.v73-modal__actions,.v103-actions,.v115-actions){display:grid!important;grid-template-columns:1.12fr 1fr 1fr!important;gap:8px!important;align-items:center!important}
body.v122-tools-result-ux :where(.v73-action,.v103-actions button,.v103-actions a,.v115-action){min-height:46px!important;border-radius:15px!important;font-size:12px!important;font-weight:950!important;text-decoration:none!important}
body.v122-tools-result-ux :where(.v73-action--primary,.v103-actions .is-primary,.v115-action.is-primary){background:linear-gradient(135deg,#38bdf8,#e0f2fe 58%,#60a5fa)!important;color:#06111f!important;border:0!important;box-shadow:0 16px 42px rgba(56,189,248,.22)!important}
body.v122-tools-result-ux .v103-actions [data-v103-consult]{display:none!important}
body.v122-tools-result-ux .v103-actions:has([data-v103-consult]){grid-template-columns:1fr 1fr!important}
body.v122-tools-result-ux .v122-toast{position:fixed;left:50%;bottom:calc(112px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(18px);opacity:0;pointer-events:none;z-index:620;padding:10px 14px;border-radius:999px;border:1px solid rgba(56,189,248,.30);background:rgba(15,23,42,.98);color:#fff;font-weight:950;font-size:12px;box-shadow:0 18px 55px rgba(0,0,0,.42);transition:.2s ease;white-space:nowrap}
body.v122-tools-result-ux .v122-toast.is-show{opacity:1;transform:translateX(-50%) translateY(0)}
@supports not selector(:has(*)){body.v122-tools-result-ux .v103-actions{grid-template-columns:1fr 1fr!important}}
@media(max-width:760px){
  body.v122-tools-result-ux :where(.v73-modal,.v103-modal,.v115-tool-modal){align-items:flex-end!important;padding:8px!important}
  body.v122-tools-result-ux :where(.v73-modal__panel,.v103-modal__panel,.v115-tool-panel){width:100%!important;max-height:calc(94dvh - env(safe-area-inset-bottom,0px))!important;border-radius:24px 24px 18px 18px!important}
  body.v122-tools-result-ux :where(.v73-modal__body,.v103-modal__body,.v115-tool-body){padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))!important}
  body.v122-tools-result-ux .v122-breakdown{grid-template-columns:1fr!important}
  body.v122-tools-result-ux :where(.v73-modal__actions,.v103-actions,.v115-actions){position:sticky!important;bottom:0!important;z-index:5!important;grid-template-columns:1fr!important;padding:10px!important;margin:0 -10px -4px!important;border-radius:18px!important;border:1px solid rgba(148,163,184,.16)!important;background:linear-gradient(180deg,rgba(10,15,24,.92),rgba(8,12,21,.98))!important;backdrop-filter:blur(14px)!important}
  body.v122-tools-result-ux :where(.v73-action,.v103-actions button,.v103-actions a,.v115-action){min-height:48px!important;width:100%!important}
  body.v122-tools-result-ux .v122-result-top{align-items:flex-start!important}
}
@media(max-width:390px){body.v122-tools-result-ux :where(.v73-result__value,.v103-result b[data-v103-result],.v115-result strong[data-v115-value]){font-size:22px!important}body.v122-tools-result-ux :where(.v73-result__note,.v103-result pre[data-v103-note],.v115-result pre[data-v115-note]){font-size:12.5px!important;max-height:28vh!important}}
@media(prefers-reduced-motion:reduce){body.v122-tools-result-ux *{transition-duration:.01ms!important;animation-duration:.01ms!important}}
`;
const JS = `(function(){
  'use strict';
  if(window.__V122_TOOLS_RESULT_CARD_COPY_POLISH__) return;
  window.__V122_TOOLS_RESULT_CARD_COPY_POLISH__ = true;
  var toastTimer=null;
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function emit(name,params){try{if(window.gtag)window.gtag('event',name,params||{});document.dispatchEvent(new CustomEvent('rust:ga4',{detail:{event:name,params:params||{}}}));}catch(e){}}
  function toast(msg){var t=$('[data-v122-toast]');if(!t){t=document.createElement('div');t.className='v122-toast';t.setAttribute('data-v122-toast','true');t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t);}t.textContent=msg||'완료되었습니다';t.classList.add('is-show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('is-show')},1700)}
  function text(el){return (el&&el.textContent||'').trim()}
  function copyText(payload,tool){payload=String(payload||'').trim();if(!payload){toast('복사할 결과가 없습니다');return;}function done(ok){toast(ok?'결과 요약을 복사했습니다':'복사 내용을 다시 확인하세요');emit('tool_result_copy',{tool_id:tool||'unknown',tool_version:'v122',success:!!ok});}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(payload).then(function(){done(true)}).catch(function(){fallback()});}else fallback();
    function fallback(){var ta=document.createElement('textarea');ta.value=payload;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.focus();ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();done(ok);}
  }
  function getBits(box){var modal=box.closest('.v73-modal,.v103-modal,.v115-tool-modal')||document;var title=text($('[data-v73-modal-title],[data-v103-title],[data-v115-title]',modal));var value=text($('[data-v73-result-value],[data-v103-result],[data-v115-value]',box));var note=text($('[data-v73-result-note],[data-v103-note],[data-v115-note]',box));var lines=note.split(/\n+/).map(function(v){return v.trim()}).filter(Boolean);return {modal:modal,title:title,value:value,note:note,lines:lines};}
  function pick(lines,kind){if(!lines.length)return '입력값을 조정하면 결과가 자동 갱신됩니다.';var re=kind==='basis'?/(필요|예상|확률|합계|기준|진행|마진|보너스|RTP|배당|롤링)/:/(확인|주의|조건|상담|한도|안전|대조|캡처|변동성)/;var hit=lines.filter(function(l){return re.test(l)}).slice(0,2);return (hit.length?hit:lines.slice(0,2)).join(' · ');}
  function buildPayload(box){var b=getBits(box);var out=['[RUST 도구 결과]',b.title&&'도구: '+b.title,b.value&&'핵심: '+b.value,b.note&&'근거:\n'+b.note].filter(Boolean).join('\n');return out;}
  function renderBreakdown(box){var b=getBits(box);var target=$('[data-v122-breakdown]',box);if(!target){target=document.createElement('div');target.className='v122-breakdown';target.setAttribute('data-v122-breakdown','true');var note=$('[data-v73-result-note],[data-v103-note],[data-v115-note]',box);if(note&&note.parentNode){note.parentNode.insertBefore(target,note.nextSibling);}else box.appendChild(target);}var summary=b.value||'결과 대기';var basis=pick(b.lines,'basis');var caution=pick(b.lines,'caution');target.innerHTML='<div class="v122-breakdown-card is-point"><b>핵심</b><span>'+escapeHtml(summary)+'</span></div><div class="v122-breakdown-card"><b>계산근거</b><span>'+escapeHtml(basis)+'</span></div><div class="v122-breakdown-card"><b>확인포인트</b><span>'+escapeHtml(caution)+'</span></div>';
    var state=$('[data-v122-result-state]',box);if(state){state.textContent='방금 결과가 갱신되었습니다.';clearTimeout(state.__timer);state.__timer=setTimeout(function(){state.textContent='입력값 변경 시 결과가 자동 갱신됩니다.'},1600);}
  }
  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function decorateBox(box,type){if(!box||box.dataset.v122Decorated==='true')return;box.dataset.v122Decorated='true';box.setAttribute('data-v122-result-card',type||'tool');var top=document.createElement('div');top.className='v122-result-top';top.innerHTML='<div class="v122-result-labels"><span>결과 카드</span><span>요약</span><span>근거</span></div><button class="v122-copy-mini" type="button" data-v122-copy-panel>전체 복사</button>';box.insertBefore(top,box.firstChild);var state=document.createElement('div');state.className='v122-result-state';state.setAttribute('data-v122-result-state','true');state.textContent='입력값 변경 시 결과가 자동 갱신됩니다.';box.appendChild(state);renderBreakdown(box);var obs=new MutationObserver(function(){renderBreakdown(box)});['[data-v73-result-value]','[data-v73-result-note]','[data-v103-result]','[data-v103-note]','[data-v115-value]','[data-v115-note]'].forEach(function(sel){var node=$(sel,box);if(node)obs.observe(node,{childList:true,characterData:true,subtree:true});});box.__v122Observer=obs;}
  function decorate(){document.documentElement.setAttribute('data-v122-runtime','ready');document.body&&document.body.classList.add('v122-tools-result-ux');decorateBox($('.v73-result'),'v73');decorateBox($('.v103-result'),'v103');decorateBox($('.v115-result'),'v115');}
  document.addEventListener('click',function(e){var copy=e.target.closest('[data-v122-copy-panel]');if(copy){e.preventDefault();var box=copy.closest('.v73-result,.v103-result,.v115-result');copyText(buildPayload(box),box&&box.getAttribute('data-v122-result-card'));return;}if(e.target.closest('[data-v73-copy],[data-v103-copy],[data-v115-copy]')){setTimeout(function(){toast('결과를 복사했습니다')},80);}if(e.target.closest('[data-v73-reset],[data-v103-reset],[data-v115-reset]')){setTimeout(function(){toast('입력값을 초기화했습니다')},80);emit('tool_reset',{tool_version:'v122'});}},true);
  document.addEventListener('input',function(e){var box=e.target.closest('.v73-modal,.v103-modal,.v115-tool-modal');if(box)setTimeout(decorate,0);},true);
  var mo=new MutationObserver(function(){decorate();});
  function start(){decorate();if(document.body)mo.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();`;

function file(p){return join(root,p)}
function read(p){return readFileSync(file(p),'utf8')}
function write(p,v){writeFileSync(file(p),v)}
function ensureDir(p){mkdirSync(file(p),{recursive:true})}
function listHtml(){const out=[];function walk(abs){for(const name of readdirSync(abs)){const p=join(abs,name);const st=statSync(p);if(st.isDirectory()){if(['node_modules','.git'].includes(name))continue;walk(p)}else if(name.endsWith('.html'))out.push(relative(root,p).replace(/\\/g,'/'))}}walk(root);return out}
function addHtmlAttr(t){return /data-v122-tools-result-ux="active"/.test(t)?t:t.replace(/<html\b/i,'<html data-v122-tools-result-ux="active"')}
function addBodyClass(t){
  if(/<body\b[^>]*class="/.test(t)) return t.replace(/<body\b([^>]*?)class="([^"]*)"/i,(m,a,c)=>c.split(/\s+/).includes('v122-tools-result-ux')?m:`<body${a}class="${c} v122-tools-result-ux"`);
  return t.replace(/<body\b/i,'<body class="v122-tools-result-ux"');
}
function addHeadAssets(t,{script=false}={}){
  if(!t.includes(CSS_PATH)){
    const tag=`  <meta name="v122-tools-result-card-copy-polish" content="${VERSION}_ACTIVE">\n  <link rel="stylesheet" href="/${CSS_PATH}?v=20260529" data-v122-tools-result-ux="true">`;
    t=t.replace('</head>',tag+'\n</head>');
  }
  if(script && !t.includes(JS_PATH)){
    const tag=`  <script src="/${JS_PATH}?v=20260529" defer data-v122-tools-result-ux="true"></script>`;
    t=t.replace('</body>',tag+'\n</body>');
  }
  return t;
}
function hasClass(open,cls){const m=open.match(/class\s*=\s*(["'])(.*?)\1/i);return m?m[2].split(/\s+/).includes(cls):false}
function findTagEnd(html,tag,start){const re=new RegExp(`<\\/?${tag}\\b[^>]*>`,'ig');re.lastIndex=start;let depth=0;let m;while((m=re.exec(html))){const s=m[0];if(!/^<\//.test(s)&&!/\/\s*>$/.test(s))depth++;if(/^<\//.test(s)){depth--;if(depth===0)return re.lastIndex}}return -1}
function removeTagByClass(html,tag,cls){let count=0,pos=0;const re=new RegExp(`<${tag}\\b[^>]*>`,'ig');while(true){re.lastIndex=pos;const m=re.exec(html);if(!m)break;if(!hasClass(m[0],cls)){pos=re.lastIndex;continue}const end=findTagEnd(html,tag,m.index);if(end<0){pos=re.lastIndex;continue}html=html.slice(0,m.index)+html.slice(end);count++;pos=m.index}return {html,count}}
function removeButtonByAttr(html,attr){let count=0;const re=new RegExp(`<button\\b[^>]*${attr}[^>]*>[\\s\\S]*?<\\/button>`,'gi');html=html.replace(re,()=>{count++;return ''});return {html,count}}

ensureDir('assets/css');ensureDir('assets/js');ensureDir('reports');
write(CSS_PATH,CSS);write(JS_PATH,JS);

const htmlFiles=listHtml();
const touched=[];const removals={};
for(const p of htmlFiles){
  const isTarget=p==='index.html'||p==='tools/index.html'||p.startsWith('tools/');
  if(!isTarget) continue;
  let src=read(p);let next=src;const counts={};
  next=addHtmlAttr(next);next=addBodyClass(next);next=addHeadAssets(next,{script:p==='index.html'||p==='tools/index.html'});
  for(const [tag,cls] of [['aside','v73-footer-cta'],['a','v73-fab'],['div','v70-2-sticky-cta'],['a','v70-2-fab']]){const r=removeTagByClass(next,tag,cls);next=r.html;if(r.count)counts[`${tag}.${cls}`]=r.count;}
  const rb=removeButtonByAttr(next,'data-v103-consult');next=rb.html;if(rb.count)counts['button[data-v103-consult]']=rb.count;
  if(next!==src){write(p,next);touched.push(p);if(Object.keys(counts).length)removals[p]=counts;}
}

const targetFiles=htmlFiles.filter(p=>p==='index.html'||p==='tools/index.html'||p.startsWith('tools/')).sort();
const effectiveTouched=Array.from(new Set(touched.concat(targetFiles))).sort();
const audit={
  version:'V122',
  name:'TOOLS RESULT CARD / COPY UX POLISH PATCH',
  base:'V121 FULL',
  deleted_files:0,
  touched_files:effectiveTouched,
  css:CSS_PATH,
  js:JS_PATH,
  removed_bottom_or_consult_ui:removals,
  result_targets:['index.html','tools/index.html'],
  policy:['No bottom related/connection sections','No legacy floating consult CTA on tools pages','Preserve V115 home modal runtime','Preserve V121 clean layout lock']
};
write('reports/v122-tools-result-ux-audit.json',JSON.stringify(audit,null,2));
write('reports/v122-remove-candidates.txt',`V122 TOOLS RESULT CARD / COPY UX POLISH\n\n삭제 파일: 0개\n\n이번 버전은 도구 결과 UX와 복사 동작을 보강하고, tools 계열에 남아 있던 하단/플로팅 상담 CTA를 제거했습니다.\n실제 파일 삭제는 하지 않았습니다.\n\n후속 제거 후보:\n- 오래된 v70/v68/v67 중복 헤더/푸터 마크업\n- tools 상세페이지 안의 중복 스크립트/스타일\n- 사용되지 않는 구버전 CTA 스크립트\n`);
write('V122_UPGRADE_REPORT.md',`# V122 TOOLS RESULT CARD / COPY UX POLISH PATCH\n\n- V121 FULL 기준 누적 반영\n- /tools/ 결과 카드 시각 구조 보강\n- 메인 V115 모달 결과 카드 보강\n- 요약/계산근거/확인포인트 3분할 결과 카드 추가\n- 전체 복사 버튼 추가\n- tools 계열 하단/플로팅 상담 CTA 제거\n- V121 no-bottom-related 정책 유지\n- 삭제 파일 0개\n`);
write('V122_PATCH_MANIFEST.json',JSON.stringify({
  version:'V122',
  name:'TOOLS RESULT CARD / COPY UX POLISH PATCH',
  base:'V121 FULL',
  deleted_files:0,
  changed_files:effectiveTouched.concat([CSS_PATH,JS_PATH,'reports/v122-tools-result-ux-audit.json','reports/v122-remove-candidates.txt','V122_UPGRADE_REPORT.md','V122_PATCH_MANIFEST.json','scripts/generate-v122-tools-result-card-copy-polish.mjs','scripts/verify-v122-tools-result-card-copy-polish.mjs','package.json']).filter((v,i,a)=>a.indexOf(v)===i).sort()
},null,2));

const pkgPath=file('package.json');
const pkg=JSON.parse(readFileSync(pkgPath,'utf8'));
pkg.scripts=pkg.scripts||{};
if(!String(pkg.scripts.build||'').includes('generate-v122-tools-result-card-copy-polish.mjs')) pkg.scripts.build=String(pkg.scripts.build||'')+' && node scripts/generate-v122-tools-result-card-copy-polish.mjs';
pkg.scripts['quality:v122']='node scripts/generate-v122-tools-result-card-copy-polish.mjs';
pkg.scripts['verify:v122']='node scripts/verify-v122-tools-result-card-copy-polish.mjs';
pkg.scripts.verify='node scripts/verify-v122-tools-result-card-copy-polish.mjs';
writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n');
console.log(`V122 generated: ${touched.length} HTML files touched, ${Object.keys(removals).length} files removed legacy bottom/consult UI`);
