
(function(){
  function tune(){
    var root = document.getElementById('sprtBrief');
    if(root){
      var label = root.querySelector('.vvip-brief-score .lab');
      if(label){
        var t = (label.textContent||'').trim();
        label.classList.remove('is-good','is-warn','is-bad','is-mid');
        if(t === '안정') label.classList.add('is-good');
        else if(t === '양호') label.classList.add('is-mid');
        else if(t === '재확인') label.classList.add('is-warn');
        else if(t === '주의') label.classList.add('is-bad');
      }
      var n = root.querySelector('.vvip-brief-score .n');
      if(n){
        var score = parseFloat((n.textContent||'').replace(/[^0-9.]/g,''));
        n.style.color = isFinite(score) ? (score >= 85 ? '#8ff0d2' : score >= 70 ? '#dfe9ff' : score >= 55 ? '#ffd690' : '#ffb8b8') : '#dfe9ff';
      }
    }
    var note = document.getElementById('noteVol');
    if(note && !note.querySelector('.analysis-note-k')){
      note.innerHTML = '<span class="analysis-note-k" style="display:inline-flex;min-width:56px;height:22px;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,.08);margin-right:8px;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#fff">NOTE</span>' + note.innerHTML;
    }
    buildInterpretation();
  }

  function getState(){
    var root = document.getElementById('sprtBrief');
    var label = root ? (root.querySelector('.vvip-brief-score .lab')||{}).textContent || '' : '';
    var scoreTxt = root ? (root.querySelector('.vvip-brief-score .n')||{}).textContent || '' : '';
    var score = parseFloat(String(scoreTxt).replace(/[^0-9.]/g,''));
    var line = document.querySelector('#summaryOut .sum-line--lead') || document.querySelector('#summaryOut .sum-line');
    var summary = line ? (line.textContent||'').trim() : '';
    return { label: label.trim(), score: isFinite(score)? score : 0, summary: summary };
  }

  function buildInterpretation(){
    var host = document.getElementById('summaryOut');
    if(!host) return;
    var state = getState();
    var decision = '재확인 대기';
    var novice = '현재는 숫자만 보고 서두르지 말고, 상태·신뢰 라벨을 먼저 보는 편이 좋습니다.';
    var advanced = '라인 변동과 가격 매력도를 함께 보면서, 과열 구간이면 기다리는 편이 좋습니다.';
    var combo = '조합 베팅은 상태가 좋아 보여도 과열일 때 기대값을 더 악화시킬 수 있습니다.';

    if(state.label === '안정' && state.score >= 85){
      decision = '선별 진입 가능';
      novice = '안정 구간이어도 한 번에 크게 들어가기보다 기본 단위로 확인하는 편이 좋습니다.';
      advanced = '가격과 라인 왜곡이 심하지 않다면 선별 진입을 검토할 수 있습니다.';
      combo = '단일 판단이 우선이며, 조합은 신뢰가 높아도 과도하게 넓히지 않는 편이 좋습니다.';
    } else if(state.label === '양호' || state.score >= 70){
      decision = '보수적으로 확인';
      novice = '진입 자체보다 왜 양호인지 설명 문구를 먼저 읽는 것이 좋습니다.';
      advanced = '기본 방향은 남아 있어도 가격 메리트와 재확인 요소를 같이 봐야 합니다.';
      combo = '조합보다는 단일 접근이 더 해석하기 쉽습니다.';
    } else if(state.label === '주의' || state.score < 55){
      decision = '대기 우선';
      novice = '현재는 쉬어가는 판단이 더 나을 수 있습니다. 급하게 해석하지 않는 편이 좋습니다.';
      advanced = '시장 과열·근거 약화 가능성을 먼저 의심하고 대기하는 편이 합리적입니다.';
      combo = '주의 구간에서는 조합 베팅을 특히 피하는 편이 좋습니다.';
    }

    var wrap = host.querySelector('.analysis-interpret');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = 'analysis-interpret';
      host.appendChild(wrap);
    }
    wrap.innerHTML = `
      <div class="analysis-interpret__head">
        <span>READING GUIDE</span>
        <strong>결과 해석 보조</strong>
      </div>
      <div class="analysis-interpret__grid">
        <div class="analysis-interpret__card"><b>현재 행동</b><p>${decision}</p></div>
        <div class="analysis-interpret__card"><b>초보 해석</b><p>${novice}</p></div>
        <div class="analysis-interpret__card"><b>숙련자 해석</b><p>${advanced}</p></div>
        <div class="analysis-interpret__card"><b>조합 주의</b><p>${combo}</p></div>
      </div>`;
  }

  var start = function(){
    tune();
    var target = document.getElementById('proResult');
    if(target){
      var mo = new MutationObserver(function(){ tune(); });
      mo.observe(target, { childList:true, subtree:true, characterData:true });
    }
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
