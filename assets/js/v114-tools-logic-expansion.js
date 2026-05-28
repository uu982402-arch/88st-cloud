(function(){
  if (window.__V114_TOOLS_LOGIC__) return;
  window.__V114_TOOLS_LOGIC__ = true;

  function n(v){ var x = Number(v); return isFinite(x) ? x : 0; }
  function money(v){ return Math.round(n(v)).toLocaleString('ko-KR') + '원'; }
  function pct(v){ return (Math.round(n(v) * 100) / 100).toFixed(2) + '%'; }
  function text(v){ return String(v == null ? '' : v).trim(); }
  function val(form, name){
    if (!form) return '';
    var el = form.querySelector('[name="' + name + '"]');
    return el ? (el.value || '') : '';
  }
  function gradeByScore(score){
    score = n(score);
    if (score >= 82) return '양호';
    if (score >= 62) return '보통';
    return '주의';
  }
  function safeDomain(raw){
    raw = text(raw).replace(/^https?:\/\//i,'').replace(/^www\./i,'').split('/')[0].toLowerCase();
    return raw || '미입력';
  }
  function impliedOdds(odds){
    odds = n(odds);
    return odds > 1 ? 1 / odds : 0;
  }
  function fairOdds(prob){
    prob = n(prob);
    return prob > 0 ? (1 / prob).toFixed(2) : '-';
  }
  function resultBoxFor(form){
    var modal = form && form.closest('.v73-modal,.v103-modal');
    if (!modal) return null;
    return modal.querySelector('.v73-result,.v103-result');
  }
  function titleFor(form){
    var modal = form && form.closest('.v73-modal,.v103-modal');
    if (!modal) return '';
    var t = modal.querySelector('[data-v73-modal-title],[data-v103-title]');
    return t ? text(t.textContent) : '';
  }
  function buildPanel(data){
    var chips = (data.chips || []).map(function(c){
      return '<div class="v114-logic-chip"><small>' + c[0] + '</small><b>' + c[1] + '</b></div>';
    }).join('');
    var items = (data.items || []).map(function(i){ return '<li>' + i + '</li>'; }).join('');
    return '<div class="v114-logic-head"><strong>고급 계산 근거</strong><span class="v114-logic-grade">' + (data.grade || '확인') + '</span></div>' +
      '<div class="v114-logic-grid">' + chips + '</div>' +
      '<ul class="v114-logic-list">' + items + '</ul>' +
      '<div class="v114-logic-actions"><button class="v114-logic-copy" type="button" data-v114-copy>고급 결과 복사</button></div>' +
      '<div class="v114-logic-note">최종 조건은 업체 공지와 상담 답변 기준으로 재확인하세요.</div>';
  }
  function setPanel(form, data){
    var box = resultBoxFor(form);
    if (!box) return;
    var panel = box.querySelector('.v114-logic-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'v114-logic-panel';
      panel.setAttribute('data-v114-logic-panel','true');
      box.appendChild(panel);
    }
    var nextHtml = buildPanel(data);
    if (panel.getAttribute('data-v114-html') === nextHtml) return;
    panel.setAttribute('data-v114-html', nextHtml);
    panel.innerHTML = nextHtml;
  }
  function analyzeV73(form){
    var title = titleFor(form);
    var data = { grade:'확인', chips:[], items:[] };

    if (/주소 확인/.test(title)) {
      var domain = safeDomain(val(form,'domain'));
      var channel = text(val(form,'channel'));
      var hasChannel = channel.indexOf('@') === 0 || /telegram|t\.me/i.test(channel);
      var score = (domain !== '미입력' ? 50 : 0) + (hasChannel ? 35 : 0) + (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) ? 15 : 0);
      data.grade = gradeByScore(score);
      data.chips = [['도메인', domain], ['상담채널', hasChannel ? '형식 양호' : '재확인'], ['점수', score + '/100']];
      data.items = ['도메인 철자, 하이픈, 숫자 위치를 상담 답변과 대조하세요.', '주소 변경이 잦으면 캡처와 상담 답변을 같이 보관하세요.', '공식 채널이 아닌 개인 DM 안내는 별도 확인이 필요합니다.'];
    } else if (/가입코드 확인/.test(title)) {
      var vendor = text(val(form,'vendor'));
      var code = text(val(form,'code'));
      var score2 = (vendor ? 40 : 0) + (code ? 45 : 0) + (/^[a-z0-9_-]{3,}$/i.test(code) ? 15 : 0);
      data.grade = gradeByScore(score2);
      data.chips = [['업체명', vendor || '미입력'], ['코드', code || '미입력'], ['코드형식', /^[a-z0-9_-]{3,}$/i.test(code) ? '양호' : '주의']];
      data.items = ['대소문자, 숫자, 하이픈 누락 여부를 그대로 비교하세요.', '가입 전 상담 답변에 표시된 코드와 랜딩 코드가 같은지 확인하세요.', '이미 가입 후 코드 변경은 제한될 수 있으니 입력 전 캡처를 권장합니다.'];
    } else if (/보너스 실수령/.test(title)) {
      var amount = n(val(form,'amount')), percent = n(val(form,'percent')), rolling = n(val(form,'rolling')), maxout = n(val(form,'maxout'));
      var bonus = amount * percent / 100, total = amount + bonus, need = total * rolling, cap = amount * maxout;
      var pressure = cap ? need / cap * 100 : 0;
      data.grade = pressure > 160 ? '조건 과중' : pressure > 90 ? '주의' : '검토 가능';
      data.chips = [['실사용', money(total)], ['필요롤링', money(need)], ['한도압박', pct(pressure)]];
      data.items = ['보너스율보다 필요 롤링 금액과 최대출금 한도를 먼저 비교하세요.', '한도압박이 100%를 넘으면 실수령보다 조건 부담이 커질 수 있습니다.', '제외게임, 최소배당, 회차 제한이 있으면 실제 난이도는 더 올라갑니다.'];
    } else if (/롤링 조건/.test(title)) {
      var amountR = n(val(form,'amount')), percentR = n(val(form,'percent')), rollingPct = n(val(form,'rolling')), done = n(val(form,'done'));
      var base = amountR + amountR * percentR / 100;
      var required = base * rollingPct / 100;
      var left = Math.max(0, required - done);
      var progress = required ? Math.min(100, done / required * 100) : 0;
      data.grade = left <= 0 ? '완료권' : progress >= 70 ? '마무리' : '진행 필요';
      data.chips = [['기준금액', money(base)], ['잔여롤링', money(left)], ['진행률', pct(progress)]];
      data.items = ['현재 진행액이 인정 게임 기준인지 확인해야 합니다.', '롤링률이 높을수록 보너스보다 거래량 부담이 커집니다.', '잔여 롤링이 남았으면 출금 전 상담 확인이 안전합니다.'];
    } else if (/배당 마진/.test(title)) {
      var o1 = n(val(form,'o1')), od = n(val(form,'od')), o2 = n(val(form,'o2'));
      var imp1 = impliedOdds(o1), impd = impliedOdds(od), imp2 = impliedOdds(o2);
      var sum = imp1 + impd + imp2;
      var margin = (sum - 1) * 100;
      data.grade = margin <= 3 ? '낮은 마진' : margin <= 7 ? '보통 마진' : '높은 마진';
      data.chips = [['마진', pct(margin)], ['공정 승', pct(imp1/sum*100)], ['공정 무/패', pct(impd/sum*100) + ' / ' + pct(imp2/sum*100)]];
      data.items = ['마진이 낮을수록 이론상 유저에게 덜 불리합니다.', '공정확률 기준 페어 배당: 승 ' + fairOdds(imp1/sum) + ' / 무 ' + fairOdds(impd/sum) + ' / 패 ' + fairOdds(imp2/sum), '같은 경기라도 시장별 마진이 다를 수 있으니 1X2, 핸디캡, O/U를 함께 비교하세요.'];
    } else if (/기대값 계산/.test(title)) {
      var odds = n(val(form,'odds')), prob = n(val(form,'prob')) / 100, stake = n(val(form,'stake')), risk = n(val(form,'risk'));
      var ev = (odds * prob - 1);
      var kelly = odds > 1 ? ((odds * prob - 1) / (odds - 1)) : 0;
      var suggested = Math.max(0, Math.min(stake * (risk/100), stake * kelly));
      data.grade = ev > .05 ? 'EV 양호' : ev > 0 ? '소폭 양수' : '음수 주의';
      data.chips = [['EV', pct(ev*100)], ['Kelly', pct(Math.max(0,kelly)*100)], ['권장상한', money(suggested)]];
      data.items = ['EV가 양수여도 확률 추정이 흔들리면 결과가 달라집니다.', 'Kelly는 과감한 기준이라 실전에서는 1/4~1/2 Kelly로 줄이는 편이 안전합니다.', '허용 손실률을 넘는 베팅은 도구 결과와 무관하게 피하는 것이 좋습니다.'];
    } else if (/스포츠 분석/.test(title)) {
      var home = n(val(form,'home')), draw = n(val(form,'draw')), away = n(val(form,'away')), adjust = n(val(form,'adjust'));
      var ih = impliedOdds(home), id = impliedOdds(draw), ia = impliedOdds(away), s = ih+id+ia;
      var hp = ih/s*100, dp = id/s*100, ap = ia/s*100;
      var band = Math.max(1, adjust);
      data.grade = '확률 밴드';
      data.chips = [['홈', pct(hp)], ['무', pct(dp)], ['원정', pct(ap)]];
      data.items = ['보정 전 공정확률 기준입니다. 신뢰 보정 밴드는 ±' + band + '%로 보세요.', '확률 차이가 작으면 무리한 단일 선택보다 시장 분산 확인이 필요합니다.', '라인 이동, 결장, 선발, 일정 변수를 반영하면 밴드가 더 넓어질 수 있습니다.'];
    } else {
      var amountE = n(val(form,'amount')), percentE = n(val(form,'percent')), maxoutE = n(val(form,'maxout')), rollingE = n(val(form,'rolling'));
      var bonusE = amountE * percentE / 100, totalE = amountE + bonusE, needE = totalE * rollingE;
      var ratio = maxoutE ? needE / maxoutE * 100 : 0;
      data.grade = ratio > 250 ? '조건 과중' : ratio > 120 ? '주의' : '검토 가능';
      data.chips = [['보너스', money(bonusE)], ['필요롤링', money(needE)], ['출금대비', pct(ratio)]];
      data.items = ['이벤트 문구보다 제외게임, 최대출금, 최소배당을 먼저 확인하세요.', '필요 롤링이 최대출금 대비 과도하면 체감 조건이 높습니다.', '상담 답변과 이벤트 공지를 같은 화면에 저장해두면 분쟁 예방에 도움이 됩니다.'];
    }
    setPanel(form, data);
  }
  function analyzeV103(form){
    var title = titleFor(form);
    var data = { grade:'확인', chips:[], items:[] };

    if (/가입코드 매칭/.test(title)) {
      var vendor = text(val(form,'vendor')), code = text(val(form,'code')), domain = text(val(form,'domain')), channel = text(val(form,'channel'));
      var normalized = safeDomain(domain);
      var hasCode = !!(code && domain.toLowerCase().indexOf(code.toLowerCase()) > -1);
      var hasProtocol = /^https?:\/\//i.test(domain);
      var hasChannel = channel.indexOf('@') === 0 || /t\.me/i.test(channel);
      var score = (vendor?20:0) + (code?25:0) + (normalized !== '미입력'?25:0) + (hasCode?15:0) + (hasProtocol?5:0) + (hasChannel?10:0);
      data.grade = gradeByScore(score);
      data.chips = [['매칭점수', score + '/100'], ['주소코드', hasCode ? '포함' : '미포함'], ['채널', hasChannel ? '확인' : '재확인']];
      data.items = ['코드가 주소 파라미터에 없어도 정상일 수 있으나 상담 답변과는 반드시 대조하세요.', '업체명, 주소, 코드, 상담 채널 4개가 동시에 맞을 때 신뢰도가 올라갑니다.', '복사 전 대소문자와 숫자 0/O 혼동을 확인하세요.'];
    } else if (/보너스 실수령/.test(title)) {
      var amount = n(val(form,'amount')), percent = n(val(form,'percent')), roll = n(val(form,'roll')), maxout = n(val(form,'maxout'));
      var bonus = amount*percent/100, total = amount+bonus, need = total*roll, pressure = maxout ? need/maxout*100 : 0;
      var netCap = maxout ? Math.max(0, maxout-total) : 0;
      data.grade = pressure > 180 ? '조건 과중' : pressure > 100 ? '주의' : '검토 가능';
      data.chips = [['실사용', money(total)], ['롤링부담', pct(pressure)], ['한도여유', maxout ? money(netCap) : '미입력']];
      data.items = ['보너스 금액이 커질수록 롤링 기준금액도 같이 커집니다.', '최대출금보다 필요 롤링이 과도하면 이벤트 체감 난이도가 높습니다.', '실수령 판단은 보너스율, 인정게임, 최대출금, 제한 시간을 같이 봐야 합니다.'];
    } else if (/출금 조건/.test(title)) {
      var bonusUse = text(val(form,'bonus')), rolling = text(val(form,'rolling')), excluded = text(val(form,'excluded')), limit = n(val(form,'limit'));
      var risk = 0;
      if (bonusUse === '사용') risk += 30;
      if (rolling === '미완료') risk += 40;
      if (excluded === '있음') risk += 25;
      if (limit > 0) risk += 5;
      data.grade = risk >= 70 ? '고위험' : risk >= 35 ? '주의' : '확인 양호';
      data.chips = [['위험점수', risk + '/100'], ['롤링', rolling || '미입력'], ['제외게임', excluded || '미입력']];
      data.items = ['출금 전에는 롤링 완료 기준과 제외게임 인정 여부가 핵심입니다.', '보너스를 사용했다면 최대출금, 최소배당, 회차 제한을 같이 확인하세요.', '문의 양식은 복사 후 상담센터에 그대로 전달하면 확인 속도가 빨라집니다.'];
    } else if (/도메인 변경/.test(title)) {
      var domain = safeDomain(val(form,'domain')), date = text(val(form,'date')), risk = text(val(form,'risk')), reply = text(val(form,'reply'));
      var level = risk === '높음' ? '주의' : risk === '낮음' ? '양호' : '보통';
      data.grade = level;
      data.chips = [['도메인', domain], ['확인일', date || new Date().toISOString().slice(0,10)], ['위험도', risk || '보통']];
      data.items = ['변경 사유, 새 주소, 이전 주소, 상담 답변을 한 번에 기록하세요.', '위험도가 높으면 같은 운영군 여부와 공식 채널 공지를 추가로 확인하세요.', reply ? '상담 답변 메모가 입력되어 추후 비교가 쉽습니다.' : '상담 답변이 비어 있으면 추후 검증 근거가 부족합니다.'];
    } else {
      data.grade = '확인';
      data.chips = [['도구', title || '실사용 도구'], ['상태', '보강 적용'], ['복사', '가능']];
      data.items = ['입력값을 조정하면 고급 계산 근거가 함께 갱신됩니다.', '도구 결과는 상담 전 조건 확인용 보조 자료로 활용하세요.'];
    }
    setPanel(form, data);
  }
  function run(form){
    if (!form) return;
    if (form.matches('[data-v73-form]')) analyzeV73(form);
    if (form.matches('[data-v103-form]')) analyzeV103(form);
  }
  function runAll(){
    document.querySelectorAll('[data-v73-form],[data-v103-form]').forEach(function(form){ run(form); });
  }
  function copyText(text){
    text = String(text || '').trim();
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function(){});
    else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      ta.remove();
    }
    try {
      if (window.gtag) window.gtag('event','tool_copy_result',{tool_version:'v114',source:'advanced_logic'});
    } catch(e) {}
  }
  document.addEventListener('DOMContentLoaded', runAll);
  if (document.readyState !== 'loading') runAll();
  document.addEventListener('click', function(e){
    var opener = e.target.closest('[data-open-tool],[data-v103-open]');
    if (opener) setTimeout(runAll, 80);
    var btn = e.target.closest('[data-v114-copy]');
    if (btn) {
      e.preventDefault();
      var panel = btn.closest('.v114-logic-panel');
      copyText(panel ? panel.innerText.replace(/고급 결과 복사/g,'').trim() : '');
      var toast = document.querySelector('[data-v108-toast],[data-v103-toast],[data-v73-toast]');
      if (toast) {
        toast.textContent = '고급 결과를 복사했습니다';
        toast.classList.add('is-show');
        setTimeout(function(){ toast.classList.remove('is-show'); }, 1600);
      }
    }
    if (e.target.closest('[data-v73-reset],[data-v103-reset]')) setTimeout(runAll, 80);
  }, true);
  document.addEventListener('input', function(e){
    var form = e.target && e.target.closest && e.target.closest('[data-v73-form],[data-v103-form]');
    if (form) setTimeout(function(){ run(form); }, 30);
  }, true);
  /* V114.1 hotfix:
     기존 MutationObserver가 panel.innerHTML 갱신을 다시 감지해 runAll()을 반복 호출하면서
     모바일/크롬에서 페이지가 멈추는 현상을 만들 수 있어 제거한다.
     모달 열기, 입력 변경, 초기화 이벤트에서만 계산 근거를 갱신한다. */
})();