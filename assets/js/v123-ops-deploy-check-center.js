/* V123 OPS DASHBOARD / DEPLOY CHECK CENTER PATCH */
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
  function urls(){return (data.coreUrls||[]).map(function(x){return 'https://88st.cloud'+x.url;}).join('
');}
  renderRows('[data-v123-route-list]',data.coreUrls||[]);
  renderRows('[data-v123-lock-list]',data.locks||[]);
  renderMini('[data-v123-vendor-list]',data.vendors||[]);
  renderMini('[data-v123-tool-list]',data.tools||[]);
  $$('[data-v123-copy="urls"]').forEach(function(btn){btn.addEventListener('click',function(){copyText(urls(),'핵심 URL 복사 완료');});});
  $$('[data-v123-copy="report"]').forEach(function(btn){btn.addEventListener('click',function(){copyText(JSON.stringify(data,null,2),'V123 점검 데이터 복사 완료');});});
  var log=$('[data-v123-live-log]');
  $('[data-v123-run]')&&$('[data-v123-run]').addEventListener('click',function(){
    if(!log) return;
    log.textContent='같은 도메인 기준 fetch 점검을 시작합니다...
';
    var list=(data.coreUrls||[]).slice(0,12);
    var done=0;
    list.forEach(function(it){
      fetch(it.url,{cache:'no-store'}).then(function(res){
        log.textContent+='['+res.status+'] '+it.url+'
';
      }).catch(function(err){
        log.textContent+='[ERR] '+it.url+' - '+(err&&err.message?err.message:'fetch failed')+'
';
      }).finally(function(){done++; if(done===list.length) log.textContent+='완료: '+done+'개 URL 확인
';});
    });
  });
})();
