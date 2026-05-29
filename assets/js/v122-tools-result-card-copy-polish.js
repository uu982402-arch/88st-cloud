(function(){
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
  function getBits(box){var modal=box.closest('.v73-modal,.v103-modal,.v115-tool-modal')||document;var title=text($('[data-v73-modal-title],[data-v103-title],[data-v115-title]',modal));var value=text($('[data-v73-result-value],[data-v103-result],[data-v115-value]',box));var note=text($('[data-v73-result-note],[data-v103-note],[data-v115-note]',box));var lines=note.split(/
+/).map(function(v){return v.trim()}).filter(Boolean);return {modal:modal,title:title,value:value,note:note,lines:lines};}
  function pick(lines,kind){if(!lines.length)return '입력값을 조정하면 결과가 자동 갱신됩니다.';var re=kind==='basis'?/(필요|예상|확률|합계|기준|진행|마진|보너스|RTP|배당|롤링)/:/(확인|주의|조건|상담|한도|안전|대조|캡처|변동성)/;var hit=lines.filter(function(l){return re.test(l)}).slice(0,2);return (hit.length?hit:lines.slice(0,2)).join(' · ');}
  function buildPayload(box){var b=getBits(box);var out=['[RUST 도구 결과]',b.title&&'도구: '+b.title,b.value&&'핵심: '+b.value,b.note&&'근거:
'+b.note].filter(Boolean).join('
');return out;}
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
})();