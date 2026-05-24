(function(){
  var tools=[
    {id:'official',name:'주소 확인',unit:'도메인',type:'text',base:98,href:'/tools/official-check/'},
    {id:'code',name:'가입코드 확인',unit:'코드',type:'text',base:94,href:'/tools/code-check/'},
    {id:'bonus',name:'보너스 실수령',unit:'원',type:'bonus',base:91,href:'/tools/bonus-calculator/'},
    {id:'rolling',name:'롤링 조건',unit:'원',type:'rolling',base:88,href:'/tools/rolling-calculator/'},
    {id:'margin',name:'배당 마진',unit:'%',type:'margin',base:86,href:'/tool-margin/'},
    {id:'ev',name:'기대값 계산',unit:'EV',type:'ev',base:84,href:'/tool-ev/'},
    {id:'sports',name:'스포츠 분석',unit:'확률',type:'sports',base:81,href:'/tools/ai-sports-odds-analysis/'},
    {id:'event',name:'이벤트 조건',unit:'조건',type:'event',base:78,href:'/tools/event-checker/'}
  ];
  var modal=document.querySelector('[data-v73-modal]');
  var title=document.querySelector('[data-v73-modal-title]');
  var type=document.querySelector('[data-v73-modal-type]');
  var form=document.querySelector('[data-v73-form]');
  var result=document.querySelector('[data-v73-result-value]');
  var note=document.querySelector('[data-v73-result-note]');
  var toast=document.querySelector('[data-v73-toast]');
  var activeTool=null;

  function money(n){return Math.round(Number(n)||0).toLocaleString('ko-KR')+'원'}
  function pct(n){return (Math.round((Number(n)||0)*100)/100).toFixed(2)+'%'}
  function getUsage(id){return Number(localStorage.getItem('v73_tool_use_'+id)||0)}
  function addUsage(id){localStorage.setItem('v73_tool_use_'+id,String(getUsage(id)+1))}
  function showToast(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('is-show');clearTimeout(window.__v73Toast);window.__v73Toast=setTimeout(function(){toast.classList.remove('is-show')},1600)}
  function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){showToast('결과를 복사했습니다')}).catch(function(){showToast(text)})}else{showToast(text)}}
  function fieldHTML(label,name,value,min,max,step,range){return '<div class="v73-field"><label>'+label+'</label><input '+(range?'class="v73-range" type="range"':'type="number"')+' name="'+name+'" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></div>'}
  function textField(label,name,placeholder){return '<div class="v73-field"><label>'+label+'</label><input type="text" name="'+name+'" placeholder="'+placeholder+'"></div>'}
  function buildForm(tool){
    if(tool.type==='text'&&tool.id==='official')return '<div class="v73-form-grid">'+textField('확인할 도메인','domain','example.com')+textField('상담 채널','channel','TRS999 상담센터')+'</div>';
    if(tool.type==='text'&&tool.id==='code')return '<div class="v73-form-grid">'+textField('업체명','vendor','업체명 입력')+textField('가입코드','code','88ST')+'</div>';
    if(tool.type==='bonus')return '<div class="v73-form-grid">'+fieldHTML('입금액','amount',100000,10000,5000000,10000,true)+fieldHTML('보너스 %','percent',40,0,100,1,true)+fieldHTML('롤링 배수','rolling',3,1,20,1,false)+fieldHTML('최대출금 배수','maxout',10,1,50,1,false)+'</div>';
    if(tool.type==='rolling')return '<div class="v73-form-grid">'+fieldHTML('입금액','amount',100000,10000,5000000,10000,true)+fieldHTML('보너스 %','percent',20,0,100,1,true)+fieldHTML('롤링 %','rolling',300,100,2000,50,true)+fieldHTML('현재 진행액','done',0,0,10000000,10000,false)+'</div>';
    if(tool.type==='margin')return '<div class="v73-form-grid">'+fieldHTML('홈/승 배당','o1',1.95,1.01,20,.01,false)+fieldHTML('무 배당','od',3.40,1.01,20,.01,false)+fieldHTML('원정/패 배당','o2',3.80,1.01,20,.01,false)+fieldHTML('예상 베팅액','stake',100000,10000,5000000,10000,true)+'</div>';
    if(tool.type==='ev')return '<div class="v73-form-grid">'+fieldHTML('배당','odds',2.05,1.01,20,.01,false)+fieldHTML('예상 확률 %','prob',52,1,99,1,true)+fieldHTML('베팅액','stake',100000,10000,5000000,10000,true)+fieldHTML('허용 손실 %','risk',2,1,20,1,true)+'</div>';
    if(tool.type==='sports')return '<div class="v73-form-grid">'+fieldHTML('홈 배당','home',2.10,1.01,20,.01,false)+fieldHTML('무 배당','draw',3.30,1.01,20,.01,false)+fieldHTML('원정 배당','away',3.20,1.01,20,.01,false)+fieldHTML('신뢰 보정 %','adjust',5,0,20,1,true)+'</div>';
    return '<div class="v73-form-grid">'+fieldHTML('입금액','amount',100000,10000,5000000,10000,true)+fieldHTML('보너스 %','percent',30,0,100,1,true)+fieldHTML('최대 출금','maxout',1000000,100000,20000000,100000,true)+fieldHTML('필수 롤링 배수','rolling',5,1,20,1,false)+'</div>';
  }
  function read(){var data={}; if(!form)return data; Array.prototype.forEach.call(form.querySelectorAll('input'),function(i){data[i.name]=i.type==='text'?i.value:Number(i.value)});return data}
  function calculate(){
    if(!activeTool)return; var d=read(); var value='준비됨'; var detail='입력값을 조정하면 결과가 실시간으로 갱신됩니다.';
    if(activeTool.id==='official'){var ok=(d.domain||'').length>3&&(d.channel||'').indexOf('@')===0;value=ok?'확인 필요 2단계':'입력 대기';detail='도메인: '+(d.domain||'미입력')+'\n상담 채널: '+(d.channel||'미입력')+'\n공식 주소·채널·가입코드를 상담센터에서 한 번 더 대조하세요.'}
    else if(activeTool.id==='code'){var code=(d.code||'').trim();value=code?code:'코드 미입력';detail='업체명: '+(d.vendor||'미입력')+'\n가입코드가 안내받은 값과 일치하는지 상담 전 확인하세요.'}
    else if(activeTool.type==='bonus'){var bonus=d.amount*d.percent/100;var total=d.amount+bonus;value=money(total);detail='보너스 '+money(bonus)+' 포함 실사용 기준 금액입니다.\n예상 롤링 금액: '+money(total*d.rolling)+'\n최대 출금 참고선: '+money(d.amount*d.maxout)}
    else if(activeTool.type==='rolling'){var total=d.amount+(d.amount*d.percent/100);var required=total*d.rolling/100;var left=Math.max(0,required-d.done);value=money(left);detail='총 기준금액: '+money(total)+'\n필요 롤링: '+money(required)+'\n현재 진행 제외 잔여 롤링입니다.'}
    else if(activeTool.type==='margin'){var implied=(1/d.o1+1/d.od+1/d.o2)*100;value=pct(implied-100);detail='내재 확률 합계: '+pct(implied)+'\n마진이 낮을수록 유저에게 유리한 배당 구조입니다.'}
    else if(activeTool.type==='ev'){var ev=(d.odds*d.prob/100-1)*100;value=pct(ev);detail='예상 수익 기대값: '+money(d.stake*ev/100)+'\nEV가 양수라도 변동성과 손실 한도를 함께 봐야 합니다.'}
    else if(activeTool.type==='sports'){var sum=1/d.home+1/d.draw+1/d.away;var hp=(1/d.home/sum*100);var dp=(1/d.draw/sum*100);var ap=(1/d.away/sum*100);value='홈 '+pct(hp);detail='공정확률 추정\n홈 '+pct(hp)+' / 무 '+pct(dp)+' / 원정 '+pct(ap)+'\n신뢰 보정 '+d.adjust+'% 적용 전 기본값입니다.'}
    else {var bonus=d.amount*d.percent/100;var need=(d.amount+bonus)*d.rolling;var feasible=need<=d.maxout*10;value=feasible?'검토 가능':'조건 과중';detail='보너스: '+money(bonus)+'\n필수 롤링 추정: '+money(need)+'\n최대 출금: '+money(d.maxout)+'\n조건 문구는 상담 전 캡처해 두는 것이 좋습니다.'}
    if(result)result.textContent=value;if(note)note.textContent=detail;
  }
  function openTool(id){activeTool=tools.filter(function(t){return t.id===id})[0]||tools[0]; addUsage(activeTool.id); if(title)title.textContent=activeTool.name; if(type)type.textContent='SMART TOOL · '+activeTool.unit; if(form)form.innerHTML=buildForm(activeTool); calculate(); if(modal)modal.classList.add('is-open'); document.documentElement.style.overflow='hidden'}
  function close(){if(modal)modal.classList.remove('is-open');document.documentElement.style.overflow=''}
  function sortCards(){var grid=document.querySelector('[data-v73-tools-grid]'); if(!grid)return; var cards=Array.prototype.slice.call(grid.querySelectorAll('[data-tool-id]')); cards.sort(function(a,b){var aa=Number(a.getAttribute('data-base')||0)+getUsage(a.getAttribute('data-tool-id'))*8;var bb=Number(b.getAttribute('data-base')||0)+getUsage(b.getAttribute('data-tool-id'))*8;return bb-aa}); cards.forEach(function(c,i){var rank=c.querySelector('[data-rank]'); if(rank)rank.textContent='인기 '+(i+1); grid.appendChild(c)})}
  document.addEventListener('click',function(e){var opener=e.target.closest('[data-open-tool]'); if(opener){e.preventDefault();openTool(opener.getAttribute('data-open-tool'));sortCards()} if(e.target.closest('[data-v73-close]'))close(); if(e.target===modal)close(); if(e.target.closest('[data-v73-reset]')&&activeTool){form.innerHTML=buildForm(activeTool);calculate()} if(e.target.closest('[data-v73-copy]'))copy((title?title.textContent:'도구 결과')+'\n'+(result?result.textContent:'')+'\n'+(note?note.textContent:'')); if(e.target.closest('[data-v73-telegram]')){copy((title?title.textContent:'도구 결과')+'\n'+(result?result.textContent:'')+'\n'+(note?note.textContent:'')); setTimeout(function(){location.href='https://t.me/TRS999_bot'},300)}});
  document.addEventListener('input',function(e){if(e.target.closest('[data-v73-form]'))calculate(); var q=e.target.closest('[data-v73-search]'); if(q){var value=q.value.trim().toLowerCase();document.querySelectorAll('[data-tool-id]').forEach(function(card){var text=card.textContent.toLowerCase();card.style.display=text.indexOf(value)>-1?'':'none'})}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  sortCards();
})();
