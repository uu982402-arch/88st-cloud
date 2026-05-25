
(function(){
  var VERSION='V93_TOOLS_USABILITY_PASS_ACTIVE';
  var root=document.body;
  if(!root||!root.matches('.v73-tools-dashboard'))return;
  root.setAttribute('data-v93-tools-usability','true');
  if(!document.querySelector('meta[name="v93-tools-usability"]')){
    var meta=document.createElement('meta');
    meta.name='v93-tools-usability';
    meta.content=VERSION;
    document.head.appendChild(meta);
  }
  var modal=document.querySelector('[data-v73-modal]');
  var form=document.querySelector('[data-v73-form]');
  var resultBox=document.querySelector('.v73-result');
  var resultValue=document.querySelector('[data-v73-result-value]');
  var resultNote=document.querySelector('[data-v73-result-note]');
  var title=document.querySelector('[data-v73-modal-title]');

  function gtagEvent(name, params){
    try{
      if(typeof window.gtag==='function'){
        window.gtag('event', name, Object.assign({event_source:'v93_tools_usability'}, params||{}));
      }
    }catch(error){}
  }
  function textOf(node){return node?String(node.textContent||'').trim():'';}
  function copyText(text){
    if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(text).then(function(){return true;}).catch(function(){return false;});}
    return Promise.resolve(false);
  }
  function formatValue(input){
    if(!input)return '';
    var label=input.closest('.v73-field')?.querySelector('label')?.childNodes[0]?.textContent||input.name||'';
    var val=input.value||'0';
    if(input.name==='amount'||input.name==='stake'||input.name==='done'||input.name==='maxout'){
      return Number(val||0).toLocaleString('ko-KR')+'원';
    }
    if(input.name==='percent'||input.name==='rolling'||input.name==='prob'||input.name==='risk'||input.name==='adjust'){
      return val+'%';
    }
    if(/^o|odds|home|draw|away/.test(input.name))return val+'배';
    return val;
  }
  function enhanceField(field){
    if(!field||field.dataset.v93Enhanced==='true')return;
    var input=field.querySelector('input,select');
    if(!input)return;
    field.dataset.v93Enhanced='true';
    input.setAttribute('autocomplete', input.type==='text' ? 'off' : 'off');
    input.setAttribute('inputmode', input.type==='number'||input.type==='range' ? 'decimal' : 'text');
    var chip=document.createElement('span');
    chip.className='v93-value-chip';
    chip.dataset.v93ValueChip='true';
    chip.textContent=formatValue(input);
    field.appendChild(chip);
    var help=document.createElement('div');
    help.className='v93-field-help';
    help.textContent=input.type==='range'?'손가락으로 밀면 결과가 즉시 바뀝니다.':'숫자를 바꾸면 결과가 실시간 갱신됩니다.';
    field.appendChild(help);
  }
  function syncChips(){
    if(!form)return;
    form.querySelectorAll('.v73-field').forEach(function(field){
      enhanceField(field);
      var input=field.querySelector('input,select');
      var chip=field.querySelector('[data-v93-value-chip]');
      if(input&&chip)chip.textContent=formatValue(input);
    });
  }
  function pulseResult(){
    if(!resultBox)return;
    resultBox.classList.remove('is-pulsing');
    void resultBox.offsetWidth;
    resultBox.classList.add('is-pulsing');
    clearTimeout(window.__v93ResultPulse);
    window.__v93ResultPulse=setTimeout(function(){resultBox.classList.remove('is-pulsing');},420);
  }
  function ensureToolbar(){
    if(!resultBox||resultBox.querySelector('.v93-result-toolbar'))return;
    var bar=document.createElement('div');
    bar.className='v93-result-toolbar';
    bar.innerHTML='<span>실시간 계산</span><span>복사 가능</span><span>상담 공유 가능</span>';
    resultBox.appendChild(bar);
  }
  function currentPayload(){
    var name=textOf(title)||'도구 결과';
    return name+'\n결과: '+textOf(resultValue)+'\n'+textOf(resultNote)+'\n\nRUST 도구: https://88st.cloud/tools/';
  }
  function openState(){
    var open=modal&&modal.classList.contains('is-open');
    if(modal){
      modal.setAttribute('aria-hidden', open?'false':'true');
      if(open)modal.setAttribute('data-v93-modal-open','true');
      else modal.removeAttribute('data-v93-modal-open');
    }
    if(open){syncChips();ensureToolbar();}
  }
  var mo=new MutationObserver(openState);
  if(modal)mo.observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('click',function(event){
    var opener=event.target.closest('[data-open-tool]');
    if(opener){
      var toolId=opener.getAttribute('data-tool-id')||opener.getAttribute('data-open-tool')||'';
      var toolName=textOf(opener.querySelector('h2'))||toolId;
      gtagEvent('tool_open',{tool_id:toolId,tool_name:toolName});
      setTimeout(function(){syncChips();ensureToolbar();openState();},80);
    }
    if(event.target.closest('[data-v73-copy]')){
      gtagEvent('tool_result_copy',{tool_name:textOf(title)||'unknown'});
    }
    if(event.target.closest('[data-v73-telegram]')){
      gtagEvent('telegram_open',{source:'tools_modal',tool_name:textOf(title)||'unknown'});
    }
    if(event.target.closest('[data-v73-reset]')){
      gtagEvent('tool_reset',{tool_name:textOf(title)||'unknown'});
      setTimeout(function(){syncChips();pulseResult();},80);
    }
  },true);
  document.addEventListener('input',function(event){
    if(event.target.closest('[data-v73-form]')){
      syncChips();pulseResult();
    }
  },true);
  document.addEventListener('keydown',function(event){
    if(event.key==='Enter'&&event.target.closest('[data-v73-form]')){
      event.preventDefault();
      copyText(currentPayload()).then(function(ok){
        gtagEvent('tool_result_copy',{tool_name:textOf(title)||'unknown',via:'enter_key',success:ok});
      });
    }
  });
  window.RUST_V93_TOOLS_USABILITY={version:VERSION,sync:syncChips,payload:currentPayload};
  setTimeout(function(){syncChips();ensureToolbar();openState();},120);
})();
