(function(){
  var tools = {
    match: {
      title: '가입코드 매칭 체크 PRO',
      label: 'CODE MATCH',
      fields: [
        ['업체명','vendor','text','예: 자쿰'],
        ['가입코드','code','text','예: zk888'],
        ['공식주소','domain','text','예: https://zk-777.com/?code=zk888'],
        ['상담채널','channel','text','예: @TRS999_bot']
      ],
      calc: function(d){
        var code = (d.code || '').trim();
        var domain = (d.domain || '').trim();
        var hasCode = !!(code && domain.toLowerCase().indexOf(code.toLowerCase()) > -1);
        var score = (d.vendor ? 25 : 0) + (code ? 30 : 0) + (domain ? 25 : 0) + (hasCode ? 15 : 0) + (String(d.channel || '').indexOf('@') === 0 ? 5 : 0);
        return {
          value: score >= 80 ? '매칭 양호' : '상담 확인 필요',
          note: '점수: ' + score + '/100\n업체명: ' + (d.vendor || '미입력') + '\n가입코드: ' + (code || '미입력') + '\n주소 내 코드 포함: ' + (hasCode ? '확인됨' : '미확인') + '\n가입 전 공식 상담 채널에서 주소·코드·이벤트 조건을 한 번 더 대조하세요.'
        };
      }
    },
    bonuspro: {
      title: '보너스 실수령 PRO',
      label: 'BONUS PRO',
      fields: [
        ['입금액','amount','number','100000'],
        ['보너스 %','percent','number','40'],
        ['롤링 배수','roll','number','5'],
        ['최대출금','maxout','number','1000000']
      ],
      calc: function(d){
        var amount = +d.amount || 0;
        var p = +d.percent || 0;
        var roll = +d.roll || 0;
        var max = +d.maxout || 0;
        var bonus = amount * p / 100;
        var total = amount + bonus;
        var need = total * roll;
        var cap = max && total > max ? '최대출금 제한 초과 가능' : '제한 전 확인';
        return {
          value: Math.round(total).toLocaleString('ko-KR') + '원',
          note: '보너스: ' + Math.round(bonus).toLocaleString('ko-KR') + '원\n실사용 기준금액: ' + Math.round(total).toLocaleString('ko-KR') + '원\n필요 롤링 추정: ' + Math.round(need).toLocaleString('ko-KR') + '원\n최대출금 체크: ' + cap + '\n보너스가 높아도 롤링·제외게임·최대출금 조건을 같이 확인하세요.'
        };
      }
    },
    withdraw: {
      title: '출금 조건 체크리스트',
      label: 'WITHDRAW',
      fields: [
        ['보너스 사용','bonus','select','사용|미사용'],
        ['롤링 완료','rolling','select','완료|미완료'],
        ['제외게임 이용','excluded','select','없음|있음'],
        ['최대출금 한도','limit','number','1000000']
      ],
      calc: function(d){
        var risks = [];
        if (d.bonus === '사용') risks.push('보너스 사용 조건표 확인');
        if (d.rolling === '미완료') risks.push('롤링 미완료 가능성');
        if (d.excluded === '있음') risks.push('제외게임 이용 여부 확인');
        if ((+d.limit || 0) > 0) risks.push('최대출금 한도 ' + (+d.limit).toLocaleString('ko-KR') + '원 확인');
        return {
          value: risks.length > 2 ? '고위험 확인' : '출금 전 확인',
          note: '체크 항목\n- ' + risks.join('\n- ') + '\n\n문의 양식:\n출금 전 조건 확인 요청합니다. 보너스 사용 여부, 롤링 완료 기준, 제외게임, 최대출금 한도를 확인 부탁드립니다.'
        };
      }
    },
    domainmemo: {
      title: '도메인 변경 메모장',
      label: 'DOMAIN MEMO',
      fields: [
        ['현재 주소','domain','text','example.com'],
        ['확인 날짜','date','date',''],
        ['상담 답변','reply','textarea','주소 변경 사유 / 안내받은 내용'],
        ['위험도','risk','select','낮음|보통|높음']
      ],
      calc: function(d){
        var item = {
          domain: d.domain || '',
          date: d.date || new Date().toISOString().slice(0,10),
          reply: d.reply || '',
          risk: d.risk || '보통',
          savedAt: new Date().toISOString()
        };
        try {
          var list = JSON.parse(localStorage.getItem('v103_domain_memos') || '[]');
          if (item.domain) {
            list.unshift(item);
            localStorage.setItem('v103_domain_memos', JSON.stringify(list.slice(0,20)));
          }
        } catch(e) {}
        return {
          value: '메모 저장 준비',
          note: '주소: ' + (item.domain || '미입력') + '\n확인일: ' + item.date + '\n위험도: ' + item.risk + '\n메모: ' + (item.reply || '미입력') + '\n최근 20개까지 이 브라우저에 저장됩니다.'
        };
      }
    }
  };

  var modal = document.querySelector('[data-v103-modal]');
  var form = document.querySelector('[data-v103-form]');
  var title = document.querySelector('[data-v103-title]');
  var label = document.querySelector('[data-v103-label]');
  var result = document.querySelector('[data-v103-result]');
  var note = document.querySelector('[data-v103-note]');
  var toast = document.querySelector('[data-v103-toast]');
  var current = null;

  function emit(name, params){
    try {
      if (window.gtag) window.gtag('event', name, params || {});
      document.dispatchEvent(new CustomEvent('rust:ga4', { detail: { event: name, params: params || {} } }));
    } catch(e) {}
  }
  function showToast(msg){
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(window.__v103Toast);
    window.__v103Toast = setTimeout(function(){ toast.classList.remove('is-show'); }, 1600);
  }
  function field(f){
    var name = f[1], type = f[2], ph = f[3] || '';
    if (type === 'select') {
      return '<div class="v103-field"><label>'+f[0]+'</label><select name="'+name+'">'+ph.split('|').map(function(v){return '<option value="'+v+'">'+v+'</option>';}).join('')+'</select></div>';
    }
    if (type === 'textarea') {
      return '<div class="v103-field" style="grid-column:1/-1"><label>'+f[0]+'</label><textarea name="'+name+'" placeholder="'+ph+'"></textarea></div>';
    }
    return '<div class="v103-field"><label>'+f[0]+'</label><input type="'+type+'" name="'+name+'" placeholder="'+ph+'" value="'+(type === 'number' ? ph : '')+'"></div>';
  }
  function read(){
    var d = {};
    if (!form) return d;
    form.querySelectorAll('input,select,textarea').forEach(function(el){ d[el.name] = el.value; });
    return d;
  }
  function run(){
    if (!current) return;
    var out = current.calc(read());
    if (result) result.textContent = out.value;
    if (note) note.textContent = out.note;
    emit('tool_calculate', { tool_name: current.title, tool_version: 'v103' });
  }
  function open(id){
    current = tools[id];
    if (!current) return;
    if (title) title.textContent = current.title;
    if (label) label.textContent = 'PRACTICAL TOOL · ' + current.label;
    if (form) form.innerHTML = current.fields.map(field).join('');
    run();
    if (modal) modal.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    emit('tool_open', { tool_name: current.title, tool_version: 'v103' });
  }
  function close(){
    if (modal) modal.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  }
  function copyText(){
    var text = (title ? title.textContent : '도구 결과') + '\n' + (result ? result.textContent : '') + '\n' + (note ? note.textContent : '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){ showToast('결과를 복사했습니다'); }).catch(function(){ showToast(text); });
    } else {
      showToast(text);
    }
    emit('tool_copy_result', { tool_name: current ? current.title : 'v103', tool_version: 'v103' });
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-v103-open]');
    if (btn) { e.preventDefault(); open(btn.getAttribute('data-v103-open')); }
    if (e.target.closest('[data-v103-close]') || e.target === modal) close();
    if (e.target.closest('[data-v103-copy]')) copyText();
    if (e.target.closest('[data-v103-reset]') && current) { form.innerHTML = current.fields.map(field).join(''); run(); emit('tool_reset', { tool_name: current.title, tool_version: 'v103' }); }
    if (e.target.closest('[data-v103-consult]')) { copyText(); setTimeout(function(){ location.href = 'https://t.me/TRS999_bot'; }, 250); }
  });
  document.addEventListener('input', function(e){
    if (e.target.closest('[data-v103-form]')) run();
    var q = e.target.closest('[data-v73-search]');
    if (q) {
      var v = q.value.trim().toLowerCase();
      document.querySelectorAll('[data-v103-open]').forEach(function(card){ card.style.display = card.textContent.toLowerCase().indexOf(v) > -1 ? '' : 'none'; });
    }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
})();
