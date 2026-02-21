/* 88ST PRO SUITE (v1)
 * - Sports: Risk briefing, line-move interpreter, CLV tracker, bet sizing, parlay risk check
 * - Casino/Minigame: Ruin simulator, streak illusion (run probability)
 * - Cert: Bonus terms interpreter + popup sticky action (copy+go)
 * Safe global loader: does nothing unless target containers exist.
 */
(function(){
  'use strict';

  function qs(root, sel){ return (root||document).querySelector(sel); }
  function qsa(root, sel){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function fmt(n, digits){
    if(!isFinite(n)) return '—';
    var d = (digits==null)? 2 : digits;
    return Number(n).toLocaleString(undefined, {maximumFractionDigits:d});
  }

  function parseNums(text){
    if(!text) return [];
    var m = (text+'').match(/-?\d+(?:\.\d+)?/g);
    return (m||[]).map(function(x){ return parseFloat(x); }).filter(function(x){ return isFinite(x) && x>0; });
  }

  function impliedProb(od){ return 1/od; }
  function overround(ods){
    var s=0;
    for(var i=0;i<ods.length;i++) s+= impliedProb(ods[i]);
    return s;
  }
  function marginPct(ods){ return (overround(ods)-1)*100; }

  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

  function scoreToLabel(s){
    if(s>=80) return '매우 높음';
    if(s>=60) return '높음';
    if(s>=40) return '보통';
    return '낮음';
  }

  function makeTags(root, tags){
    var wrap = qs(root,'.ps-tags');
    if(!wrap) return;
    wrap.innerHTML='';
    tags.forEach(function(t){
      var sp = document.createElement('span');
      sp.className = 'ps-tag' + (t.level?(' '+t.level):'');
      sp.textContent = t.text;
      wrap.appendChild(sp);
    });
  }

  // --- Tool 7: probability of at least one run of length k in n trials ---
  function probAtLeastOneRun(n, p, k){
    n = Math.max(0, Math.floor(n||0));
    k = Math.max(1, Math.floor(k||1));
    p = clamp(+p || 0, 0, 1);
    var q = 1 - p;

    // dp[j] = prob of no-run-yet after current i with current run length j (0..k-1)
    var dp = new Array(k).fill(0);
    dp[0] = 1;
    for(var i=0;i<n;i++){
      var ndp = new Array(k).fill(0);
      for(var j=0;j<k;j++){
        var v = dp[j];
        if(!v) continue;
        // fail -> run resets
        ndp[0] += v*q;
        // success -> run increases; if hits k, it's excluded from no-run states
        if(j+1 < k) ndp[j+1] += v*p;
      }
      dp = ndp;
    }
    var noRun = dp.reduce(function(a,b){return a+b;},0);
    return 1 - noRun;
  }

  // --- Tool 6: Monte Carlo ruin simulator (simple win/lose model) ---
  function ruinSim(params){
    var bankroll = Math.max(0, +params.bankroll || 0);
    var bet = Math.max(0, +params.bet || 0);
    var n = Math.max(1, Math.floor(+params.n || 200));
    var sims = Math.max(300, Math.min(6000, Math.floor(+params.sims || 2000)));

    // even-money by default
    var payout = Math.max(0.5, +params.payout || 1); // win profit = bet*payout
    var houseEdge = clamp((+params.houseEdge || 1.2)/100, 0, 0.2);

    // for even-money: EV per bet = p*payout - (1-p)*1
    // choose p so that EV = -houseEdge
    // => p = (1 - houseEdge) / (payout + 1)
    var p = clamp((1 - houseEdge) / (payout + 1), 0.001, 0.999);

    var ruin=0;
    var finals=[];
    var mdds=[];

    for(var s=0;s<sims;s++){
      var b = bankroll;
      var peak = b;
      var mdd = 0;
      for(var i=0;i<n;i++){
        if(b <= 0){ break; }
        var stake = Math.min(b, bet);
        var r = Math.random();
        if(r < p){
          b += stake * payout;
        }else{
          b -= stake;
        }
        if(b > peak) peak = b;
        var dd = peak - b;
        if(dd > mdd) mdd = dd;
      }
      if(b <= 0) ruin++;
      finals.push(b);
      mdds.push(mdd);
    }

    function pct(arr, q){
      var a = arr.slice().sort(function(x,y){return x-y;});
      var idx = Math.floor((a.length-1)*q);
      return a[idx];
    }

    return {
      pWin: p,
      ruinProb: ruin/sims,
      finalP50: pct(finals, 0.5),
      finalP05: pct(finals, 0.05),
      finalP95: pct(finals, 0.95),
      mddP50: pct(mdds, 0.5),
      mddP95: pct(mdds, 0.95)
    };
  }

  // --- Tool 8: Bonus terms interpreter ---
  function interpretBonus(text){
    var t = (text||'') + '';
    var lower = t.toLowerCase();

    var out = {
      items: [],
      tags: []
    };

    function pick(re){
      var m = t.match(re);
      return m ? m[0] : '';
    }

    function addItem(k, v){ if(v){ out.items.push({k:k, v:v}); } }
    function addTag(text, level){ out.tags.push({text:text, level:level}); }

    // rolling
    var roll = pick(/(롤링|rolling)[^\n\r]{0,60}/i);
    addItem('롤링', roll);

    // first deposit / cashback / payback
    if(/첫\s*충|첫충|첫\s*입금/i.test(t)) addTag('첫충', 'good');
    if(/페이백|payback|캐시백|cashback/i.test(t)) addTag('페이백', 'good');

    // max odds / max bet / max payout
    var maxOdds = pick(/(최대\s*배당|max\s*odds)[^\n\r]{0,60}/i);
    var maxBet = pick(/(최대\s*베팅|max\s*bet)[^\n\r]{0,60}/i);
    var maxOut = pick(/(최대\s*지급|max\s*payout|max\s*win)[^\n\r]{0,60}/i);
    addItem('최대 배당', maxOdds);
    addItem('최대 베팅', maxBet);
    addItem('최대 지급', maxOut);

    // excluded games / restricted
    var excl = pick(/(제외\s*게임|제외게임|excluded?\s*games?)[^\n\r]{0,120}/i);
    addItem('제외 게임', excl);

    // withdrawal limits
    var wd = pick(/(출금\s*제한|출금제한|withdraw(al)?\s*limit)[^\n\r]{0,80}/i);
    addItem('출금 제한', wd);

    // time limit
    var term = pick(/(유효\s*기간|기간|within\s*\d+\s*days|\d+\s*일\s*이내)[^\n\r]{0,60}/i);
    addItem('기간', term);

    // risk tags
    if(excl) addTag('제외게임 있음', 'warn');
    if(maxOdds) addTag('최대배당 제한', 'warn');
    if(maxBet) addTag('최대베팅 제한', 'warn');
    if(/원금\s*제외|보너스\s*제외|bonus\s*excluded/i.test(t)) addTag('원금/보너스 제외', 'bad');
    if(/양방|arbitrage|arb/i.test(t)) addTag('양방/arb 금지', 'warn');

    if(!out.items.length) out.items.push({k:'분석', v:'키워드를 찾지 못했습니다. 원문을 그대로 붙여넣고 다시 시도하세요.'});
    return out;
  }

  // --- Sports suite rendering ---
  function renderSports(container){
    container.classList.add('ps-stack');
    container.innerHTML = [
      '<details class="ps-acc" open>',
      '  <summary><span>🧾 오늘의 경기 리스크 브리핑</span><span class="ps-badge">점수·주의·추천</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">배당(오픈/현재)과 마켓 특성만으로 <b>리스크(변동성/정보/마진)</b>를 점수화합니다. (예측 도구 아님)</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>종목/리그(선택)</label><input data-k="league" placeholder="예: EPL / KBO / e스포츠"/></div>',
      '      <div class="ps-field"><label>마켓</label><select data-k="market"><option value="1x2">승/무/패(1X2)</option><option value="2way">2-way</option><option value="ou">오버/언더</option><option value="handicap">핸디캡</option></select></div>',
      '      <div class="ps-field"><label>유동성(체감)</label><select data-k="liq"><option value="major">메이저(라인 안정)</option><option value="mid">중간</option><option value="minor">마이너(무브 잦음)</option></select></div>',
      '    </div>',
      '    <div class="ps-row cols2" style="margin-top:10px;">',
      '      <div class="ps-field"><label>오픈 배당(붙여넣기)</label><textarea data-k="open" placeholder="예: 1.80 3.70 4.40\n예: 2.5 1.91 1.91"></textarea></div>',
      '      <div class="ps-field"><label>현재 배당(붙여넣기)</label><textarea data-k="cur" placeholder="예: 1.72 3.90 4.80\n예: 2.5 1.88 1.96"></textarea></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="run">브리핑 생성</button>',
      '      <button class="ps-btn ghost" data-act="fill">현재→오픈 복사</button>',
      '      <button class="ps-btn secondary" data-act="reset">초기화</button>',
      '    </div>',
      '    <div class="ps-kpis cols3">',
      '      <div class="ps-kpi"><div class="k">리스크 점수</div><div class="v" data-out="score">—</div><div class="s" data-out="label">—</div></div>',
      '      <div class="ps-kpi"><div class="k">마진(현재)</div><div class="v" data-out="margin">—</div><div class="s">오버라운드−1</div></div>',
      '      <div class="ps-kpi"><div class="k">무브 강도</div><div class="v" data-out="move">—</div><div class="s">Δ암시확률 최대</div></div>',
      '    </div>',
      '    <div class="ps-tags"></div>',
      '    <div class="ps-out" data-out="box" style="display:none;"></div>',
      '  </div>',
      '</details>',

      '<details class="ps-acc">',
      '  <summary><span>📉 라인 무브 해석기</span><span class="ps-badge">문장 템플릿</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">오픈 대비 현재 배당 변화로 시장 심리를 <b>짧은 문장</b>으로 해석합니다. (뉴스/부상/라인업은 별도 확인)</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>마켓</label><select data-k="lmMarket"><option value="1x2">1X2</option><option value="2way">2-way</option><option value="ou">O/U</option><option value="handicap">핸디</option></select></div>',
      '      <div class="ps-field"><label>오픈 배당</label><input data-k="lmOpen" placeholder="예: 1.80 3.70 4.40"/></div>',
      '      <div class="ps-field"><label>현재 배당</label><input data-k="lmCur" placeholder="예: 1.72 3.90 4.80"/></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="lmRun">해석 생성</button>',
      '      <button class="ps-btn secondary" data-act="lmReset">초기화</button>',
      '    </div>',
      '    <div class="ps-out" data-out="lmOut" style="display:none;"></div>',
      '  </div>',
      '</details>',

      '<details class="ps-acc">',
      '  <summary><span>📌 CLV 트래커</span><span class="ps-badge">베팅 가격 평가</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">베팅 당시 배당 vs 마감(클로징) 배당으로 <b>가격(라인) 유리함</b>을 평가합니다. (수익 보장 아님)</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>베팅 당시 배당</label><input data-k="clvBet" inputmode="decimal" placeholder="예: 2.05"/></div>',
      '      <div class="ps-field"><label>마감 배당</label><input data-k="clvClose" inputmode="decimal" placeholder="예: 1.92"/></div>',
      '      <div class="ps-field"><label>마켓(선택)</label><select data-k="clvMkt"><option value="general">일반</option><option value="ou">O/U</option><option value="handicap">핸디</option></select></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="clvRun">CLV 계산</button>',
      '      <button class="ps-btn secondary" data-act="clvReset">초기화</button>',
      '    </div>',
      '    <div class="ps-kpis cols3">',
      '      <div class="ps-kpi"><div class="k">CLV(배당)</div><div class="v" data-out="clvOdds">—</div><div class="s">(Close−Bet)/Close</div></div>',
      '      <div class="ps-kpi"><div class="k">CLV(확률)</div><div class="v" data-out="clvProb">—</div><div class="s">pClose−pBet</div></div>',
      '      <div class="ps-kpi"><div class="k">판정</div><div class="v" data-out="clvLabel" style="font-size:16px;">—</div><div class="s">가격 기준</div></div>',
      '    </div>',
      '    <div class="ps-tags"></div>',
      '  </div>',
      '</details>',

      '<details class="ps-acc">',
      '  <summary><span>💸 베팅 금액 추천기</span><span class="ps-badge">리스크 제한형</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">켈리 기반이지만 <b>분수 켈리 + 최대 손실 제한 + 연패 보호</b>로 현실적으로 추천합니다. (참고용)</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>자금(원)</label><input data-k="bk" inputmode="numeric" placeholder="예: 500000"/></div>',
      '      <div class="ps-field"><label>배당</label><input data-k="od" inputmode="decimal" placeholder="예: 1.95"/></div>',
      '      <div class="ps-field"><label>승률 추정(%)</label><input data-k="p" inputmode="decimal" placeholder="예: 54"/></div>',
      '    </div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>방식</label><select data-k="frac"><option value="0.25">켈리 1/4(권장)</option><option value="0.125">켈리 1/8(보수)</option><option value="0.5">켈리 1/2(공격)</option></select></div>',
      '      <div class="ps-field"><label>최대 손실(자금%)</label><input data-k="cap" inputmode="decimal" value="2"/></div>',
      '      <div class="ps-field"><label>최근 연패(회)</label><input data-k="loss" inputmode="numeric" value="0"/></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="sizeRun">추천 계산</button>',
      '      <button class="ps-btn secondary" data-act="sizeReset">초기화</button>',
      '    </div>',
      '    <div class="ps-kpis cols3">',
      '      <div class="ps-kpi"><div class="k">추천 베팅</div><div class="v" data-out="stake">—</div><div class="s">원</div></div>',
      '      <div class="ps-kpi"><div class="k">켈리 기준</div><div class="v" data-out="kel">—</div><div class="s">f*</div></div>',
      '      <div class="ps-kpi"><div class="k">캡 적용</div><div class="v" data-out="capv">—</div><div class="s">최대손실 제한</div></div>',
      '    </div>',
      '    <div class="ps-out" data-out="sizeOut" style="display:none;"></div>',
      '  </div>',
      '</details>',

      '<details class="ps-acc">',
      '  <summary><span>🧩 파롤리 위험도 체크</span><span class="ps-badge">상관/중복 경고</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">다리(legs)를 줄마다 붙여넣으면 <b>같은 경기/같은 팀/같은 방향</b> 중복을 감지해 리스크를 표시합니다.</div>',
      '    <div class="ps-row cols2" style="margin-top:10px;">',
      '      <div class="ps-field"><label>파롤리 다리 목록</label><textarea data-k="legs" placeholder="예: 맨시티 승\n예: 맨시티 -1.0\n예: 맨시티 오버 2.5"></textarea></div>',
      '      <div class="ps-field"><label>옵션</label>',
      '        <div class="ps-note" style="margin-bottom:8px;">추천: 같은 경기 다리 2개↑면 상관 리스크가 급상승합니다.</div>',
      '        <div class="ps-row"><div class="ps-field"><label>허용 중복(경기/팀)</label><select data-k="dup"><option value="1">1개까지</option><option value="2">2개까지</option><option value="3">3개까지</option></select></div></div>',
      '      </div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="parRun">체크</button>',
      '      <button class="ps-btn secondary" data-act="parReset">초기화</button>',
      '    </div>',
      '    <div class="ps-tags"></div>',
      '    <div class="ps-out" data-out="parOut" style="display:none;"></div>',
      '  </div>',
      '</details>'
    ].join('');

    // --- risk briefing ---
    var els = {
      league: qs(container,'[data-k="league"]'),
      market: qs(container,'[data-k="market"]'),
      liq: qs(container,'[data-k="liq"]'),
      open: qs(container,'[data-k="open"]'),
      cur: qs(container,'[data-k="cur"]'),
      score: qs(container,'[data-out="score"]'),
      label: qs(container,'[data-out="label"]'),
      margin: qs(container,'[data-out="margin"]'),
      move: qs(container,'[data-out="move"]'),
      box: qs(container,'[data-out="box"]')
    };

    function runBrief(){
      var openNums = parseNums(els.open.value);
      var curNums = parseNums(els.cur.value);
      // allow line+odds: if 3 nums and first looks like a line (<=15), take last two
      function normalize(nums){
        if(nums.length===3 && Math.abs(nums[0])<=15 && nums[1]>1 && nums[2]>1) return [nums[1],nums[2]];
        if(nums.length>=3 && els.market.value==='1x2') return nums.slice(0,3);
        if(nums.length>=2 && (els.market.value==='2way' || els.market.value==='ou' || els.market.value==='handicap')) return nums.slice(-2);
        if(nums.length>=2) return nums.slice(0,2);
        return nums;
      }
      var o = normalize(openNums);
      var c = normalize(curNums);

      var tags=[];
      var warns=[];
      var recos=[];

      var mPct = (c.length>=2) ? marginPct(c) : NaN;
      var moveMax = NaN;
      if(o.length===c.length && c.length>=2){
        moveMax = 0;
        for(var i=0;i<c.length;i++){
          var dp = Math.abs(impliedProb(c[i]) - impliedProb(o[i]))*100;
          if(dp>moveMax) moveMax=dp;
        }
      }

      // base score from margin + move + liquidity
      var s = 10;
      if(isFinite(mPct)){
        s += clamp(mPct*6, 0, 45); // 0~45
        if(mPct>=6) warns.push('마진이 높습니다(수수료/왜곡 가능).');
        if(mPct<=3) tags.push({text:'마진 낮음', level:'good'});
      }else{
        warns.push('현재 배당(숫자) 입력이 부족합니다.');
      }

      if(isFinite(moveMax)){
        s += clamp(moveMax*8, 0, 35); // 0~35
        if(moveMax>=2.0) warns.push('무브 강도가 큽니다(정보/자금 유입 가능).');
        if(moveMax>=3.5) tags.push({text:'큰 무브', level:'warn'});
      }else{
        tags.push({text:'무브 미측정(오픈 입력 없음)', level:'good'});
      }

      var liq = els.liq.value;
      if(liq==='minor'){ s+=18; warns.push('마이너 리그는 라인 변동/스파이크가 잦습니다.'); tags.push({text:'저유동성', level:'warn'}); }
      else if(liq==='mid'){ s+=10; }
      else { s+=4; tags.push({text:'유동성 양호', level:'good'}); }

      // market nuance
      var mk = els.market.value;
      if(mk==='ou' || mk==='handicap'){
        recos.push('라인(O/U·핸디)은 뉴스/라인업에 민감합니다. 변동 구간에서는 <b>라이브 대기</b>가 유리할 수 있습니다.');
      }else{
        recos.push('승/패형 마켓은 큰 무브가 나오면 <b>원인(부상/라인업/정보)</b> 확인이 우선입니다.');
      }

      // recommendation based on score
      s = clamp(Math.round(s), 0, 100);
      var lab = scoreToLabel(s);
      if(s>=80){ recos.unshift('이번 라인은 <b>패스/관망</b> 또는 <b>소액 테스트</b> 권장.'); }
      else if(s>=60){ recos.unshift('무리 금지. <b>분할</b> 또는 <b>라인 확정 후</b> 접근 권장.'); }
      else if(s>=40){ recos.unshift('중간 리스크. 마진 낮은 북/라인 선택 + 손실캡 설정 권장.'); }
      else { recos.unshift('리스크 낮음. 그래도 <b>손실 캡</b>은 항상 유지하세요.'); }

      if(els.league.value.trim()){ tags.push({text: els.league.value.trim(), level:'good'}); }

      els.score.textContent = String(s);
      els.label.textContent = lab;
      els.margin.textContent = isFinite(mPct) ? (fmt(mPct,2) + '%') : '—';
      els.move.textContent = isFinite(moveMax) ? (fmt(moveMax,2) + 'p') : '—';

      makeTags(container, tags);

      // output box
      els.box.style.display = 'block';
      els.box.innerHTML = [
        '<h4>주의</h4>',
        '<ul>' + (warns.length? warns.map(function(x){return '<li>'+x+'</li>';}).join('') : '<li>특별한 경고 없음(입력 기준).</li>') + '</ul>',
        '<div class="ps-divider"></div>',
        '<h4>추천 접근</h4>',
        '<ul>' + recos.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul>',
        '<div class="ps-note" style="margin-top:10px;">※ 이 브리핑은 “결과 예측”이 아니라, <b>마진/변동성/정보 리스크</b>로 판단을 보조합니다.</div>'
      ].join('');
    }

    qs(container,'[data-act="run"]').addEventListener('click', runBrief);
    qs(container,'[data-act="fill"]').addEventListener('click', function(){ els.open.value = els.cur.value; });
    qs(container,'[data-act="reset"]').addEventListener('click', function(){
      els.league.value=''; els.open.value=''; els.cur.value='';
      els.score.textContent='—'; els.label.textContent='—'; els.margin.textContent='—'; els.move.textContent='—';
      var box = els.box; box.style.display='none'; box.innerHTML='';
      makeTags(container, []);
    });

    // --- line move interpreter ---
    var lmOut = qs(container,'[data-out="lmOut"]');
    qs(container,'[data-act="lmRun"]').addEventListener('click', function(){
      var mk2 = qs(container,'[data-k="lmMarket"]').value;
      var o = parseNums(qs(container,'[data-k="lmOpen"]').value);
      var c = parseNums(qs(container,'[data-k="lmCur"]').value);
      // normalize
      function norm(nums){
        if(nums.length===3 && Math.abs(nums[0])<=15 && nums[1]>1 && nums[2]>1) return [nums[1],nums[2]];
        if(nums.length>=3 && mk2==='1x2') return nums.slice(0,3);
        if(nums.length>=2) return nums.slice(0,2);
        return nums;
      }
      o = norm(o); c = norm(c);
      if(!(o.length>=2 && c.length>=2 && o.length===c.length)){
        lmOut.style.display='block';
        lmOut.innerHTML = '<h4>입력 오류</h4><div class="ps-note">오픈/현재 배당을 같은 개수로 입력하세요. (1X2=3개, 2-way=2개)</div>';
        return;
      }
      var msgs=[];
      var tags=[];
      var maxDp=0;
      for(var i=0;i<c.length;i++) maxDp=Math.max(maxDp, Math.abs(impliedProb(c[i])-impliedProb(o[i]))*100);

      // direction summary
      function dir(i){
        var d = c[i]-o[i];
        if(Math.abs(d)<0.01) return '유지';
        return d<0 ? '하락(강세)' : '상승(약세)';
      }
      if(mk2==='1x2'){
        msgs.push('홈: '+dir(0)+', 무: '+dir(1)+', 원정: '+dir(2)+' 입니다.');
        // interpret: if one side drops, market leans
        var minIdx=0; var minOd=c[0];
        for(i=1;i<3;i++){ if(c[i]<minOd){ minOd=c[i]; minIdx=i; } }
        var side = (minIdx===0?'홈':(minIdx===1?'무':'원정'));
        msgs.push('현재 기준 최저 배당은 <b>'+side+'</b> 쪽입니다. (시장 선호 가능)');
      } else {
        msgs.push('오픈→현재 변화가 반영되었습니다. (우세 방향: 배당 하락)');
      }

      if(maxDp>=3.5){ tags.push({text:'큰 무브(정보성)', level:'bad'}); msgs.push('Δ암시확률 변화가 큽니다. 라인업/부상/공지 확인 후 접근하세요.'); }
      else if(maxDp>=2.0){ tags.push({text:'무브 큼', level:'warn'}); msgs.push('변동 구간입니다. 분할/라이브 대기 전략이 유리할 수 있습니다.'); }
      else { tags.push({text:'무브 작음', level:'good'}); msgs.push('변동이 크지 않습니다. 마진 낮은 북 기준으로 비교하면 효율적입니다.'); }

      lmOut.style.display='block';
      lmOut.innerHTML = '<h4>해석</h4><ul>' + msgs.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul>';

      // put tags under the same tool block (use nearest ps-tags under this details)
      var det = lmOut.closest('details');
      var tmpRoot = det || container;
      makeTags(tmpRoot, tags);
    });
    qs(container,'[data-act="lmReset"]').addEventListener('click', function(){
      qs(container,'[data-k="lmOpen"]').value='';
      qs(container,'[data-k="lmCur"]').value='';
      lmOut.style.display='none'; lmOut.innerHTML='';
      var det = lmOut.closest('details');
      if(det) makeTags(det, []);
    });

    // --- CLV ---
    qs(container,'[data-act="clvRun"]').addEventListener('click', function(){
      var bet = parseFloat(qs(container,'[data-k="clvBet"]').value);
      var close = parseFloat(qs(container,'[data-k="clvClose"]').value);
      var det = qs(container,'[data-k="clvBet"]').closest('details') || container;
      var tags=[];
      if(!(isFinite(bet)&&bet>1 && isFinite(close)&&close>1)){
        qs(container,'[data-out="clvOdds"]').textContent='—';
        qs(container,'[data-out="clvProb"]').textContent='—';
        qs(container,'[data-out="clvLabel"]').textContent='입력 필요';
        makeTags(det, [{text:'배당 입력 필요', level:'warn'}]);
        return;
      }
      var clvO = ((close - bet)/close)*100;
      var pBet = 1/bet, pClose = 1/close;
      var clvP = (pClose - pBet)*100;
      qs(container,'[data-out="clvOdds"]').textContent = (fmt(clvO,2) + '%');
      qs(container,'[data-out="clvProb"]').textContent = (fmt(clvP,2) + 'p');
      var label;
      if(clvP > 0.6){ label='좋음(양의 CLV)'; tags.push({text:'양의 CLV', level:'good'}); }
      else if(clvP > 0.0){ label='약간 유리'; tags.push({text:'미세 양의 CLV', level:'good'}); }
      else if(clvP > -0.6){ label='중립/미세 불리'; tags.push({text:'중립', level:'warn'}); }
      else { label='불리(음의 CLV)'; tags.push({text:'음의 CLV', level:'bad'}); }
      qs(container,'[data-out="clvLabel"]').textContent = label;
      makeTags(det, tags);
    });
    qs(container,'[data-act="clvReset"]').addEventListener('click', function(){
      qs(container,'[data-k="clvBet"]').value='';
      qs(container,'[data-k="clvClose"]').value='';
      qs(container,'[data-out="clvOdds"]').textContent='—';
      qs(container,'[data-out="clvProb"]').textContent='—';
      qs(container,'[data-out="clvLabel"]').textContent='—';
      var det = qs(container,'[data-k="clvBet"]').closest('details') || container;
      makeTags(det, []);
    });

    // --- bet sizing ---
    var sizeOut = qs(container,'[data-out="sizeOut"]');
    qs(container,'[data-act="sizeRun"]').addEventListener('click', function(){
      var bk = parseFloat(qs(container,'[data-k="bk"]').value);
      var od = parseFloat(qs(container,'[data-k="od"]').value);
      var p = parseFloat(qs(container,'[data-k="p"]').value)/100;
      var frac = parseFloat(qs(container,'[data-k="frac"]').value);
      var cap = parseFloat(qs(container,'[data-k="cap"]').value)/100;
      var loss = Math.max(0, parseInt(qs(container,'[data-k="loss"]').value||'0',10));

      var stakeEl = qs(container,'[data-out="stake"]');
      var kelEl = qs(container,'[data-out="kel"]');
      var capEl = qs(container,'[data-out="capv"]');

      if(!(isFinite(bk)&&bk>0 && isFinite(od)&&od>1 && isFinite(p)&&p>0&&p<1)){
        stakeEl.textContent='—'; kelEl.textContent='—'; capEl.textContent='—';
        sizeOut.style.display='block';
        sizeOut.innerHTML='<h4>입력 필요</h4><div class="ps-note">자금/배당/승률(%)을 입력하세요.</div>';
        return;
      }
      var b = od - 1;
      var q = 1 - p;
      var f = (b*p - q)/b; // kelly
      f = clamp(f, 0, 0.25); // hard guard
      var fAdj = f * frac;
      // losing streak guard
      if(loss>=2) fAdj *= 0.6;
      if(loss>=4) fAdj *= 0.4;

      var stake = bk * fAdj;
      var capAmt = bk * cap;
      var finalStake = Math.min(stake, capAmt);

      stakeEl.textContent = fmt(Math.round(finalStake),0);
      kelEl.textContent = fmt(f,3);
      capEl.textContent = fmt(Math.round(capAmt),0);

      sizeOut.style.display='block';
      var lines=[];
      if(f<=0){ lines.push('입력 승률 기준으로는 <b>엣지(우위)</b>가 부족합니다. 소액 테스트/패스 권장.'); }
      else lines.push('분수 켈리('+fmt(frac,3)+') 기준 추천입니다. (연패 '+loss+'회 보호 적용)');
      lines.push('무조건 금액을 늘리기보다, <b>최대 손실 캡</b>을 지키는 것이 장기 생존에 중요합니다.');
      sizeOut.innerHTML = '<h4>설명</h4><ul>' + lines.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul>';
    });
    qs(container,'[data-act="sizeReset"]').addEventListener('click', function(){
      ['bk','od','p'].forEach(function(k){ qs(container,'[data-k="'+k+'\"]').value=''; });
      qs(container,'[data-k="loss"]').value='0';
      qs(container,'[data-k="cap"]').value='2';
      qs(container,'[data-out="stake"]').textContent='—';
      qs(container,'[data-out="kel"]').textContent='—';
      qs(container,'[data-out="capv"]').textContent='—';
      sizeOut.style.display='none'; sizeOut.innerHTML='';
    });

    // --- parlay risk ---
    var parOut = qs(container,'[data-out="parOut"]');
    qs(container,'[data-act="parRun"]').addEventListener('click', function(){
      var txt = (qs(container,'[data-k="legs"]').value||'').trim();
      var dupLimit = parseInt(qs(container,'[data-k="dup"]').value||'1',10);
      var det = qs(container,'[data-k="legs"]').closest('details') || container;
      if(!txt){
        makeTags(det, [{text:'다리 목록 입력', level:'warn'}]);
        parOut.style.display='block';
        parOut.innerHTML='<h4>입력 필요</h4><div class="ps-note">줄마다 다리를 입력하세요. (같은 경기/팀 감지)</div>';
        return;
      }
      var lines = txt.split(/\n+/).map(function(s){return s.trim();}).filter(Boolean);
      var norm = function(s){ return s.toLowerCase().replace(/[^a-z0-9가-힣\s]/g,' ').replace(/\s+/g,' ').trim(); };

      // crude entity extraction: first 2 tokens treated as "team/match key"
      var keys = lines.map(function(s){
        var n = norm(s);
        var toks = n.split(' ').filter(Boolean);
        return toks.slice(0,2).join(' ');
      });

      var count = {};
      keys.forEach(function(k){ if(!k) return; count[k] = (count[k]||0)+1; });

      var overlaps = Object.keys(count).filter(function(k){return count[k] > 1;}).map(function(k){return {k:k, n:count[k]};});

      var tags=[];
      var msgs=[];

      if(overlaps.length){
        overlaps.sort(function(a,b){return b.n-a.n;});
        msgs.push('중복 감지: ' + overlaps.map(function(o){return '<b>'+o.k+'</b> ×'+o.n;}).join(', '));
        var maxN = overlaps[0].n;
        if(maxN > dupLimit){ tags.push({text:'상관 리스크 높음', level:'bad'}); msgs.push('허용 중복('+dupLimit+')을 초과했습니다. 같은 경기 다리를 줄이세요.'); }
        else { tags.push({text:'중복 있음', level:'warn'}); msgs.push('중복이 있습니다. 시장이 같은 방향으로 움직이면 손실도 같이 커질 수 있습니다.'); }
      } else {
        tags.push({text:'중복 낮음', level:'good'});
        msgs.push('큰 중복은 감지되지 않았습니다. (텍스트 기반 감지이므로 완전하지 않음)');
      }

      // keyword correlation heuristics
      var kwSame = 0;
      var kwSet = ['승','패','무','오버','언더','핸디','-','+'];
      lines.forEach(function(s){
        var n = norm(s);
        for(var i=0;i<kwSet.length;i++) if(n.indexOf(kwSet[i])>=0) { kwSame++; break; }
      });
      if(lines.length>=4) msgs.push('다리 수가 많을수록 실현 확률이 급격히 낮아집니다. 2~3다리로 테스트 권장.');

      makeTags(det, tags);
      parOut.style.display='block';
      parOut.innerHTML = '<h4>체크 결과</h4><ul>' + msgs.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul>' +
        '<div class="ps-note" style="margin-top:10px;">TIP) 같은 경기(팀) 다리는 <b>상관</b> 때문에 기대값이 나빠질 수 있습니다.</div>';
    });
    qs(container,'[data-act="parReset"]').addEventListener('click', function(){
      qs(container,'[data-k="legs"]').value='';
      parOut.style.display='none'; parOut.innerHTML='';
      var det = qs(container,'[data-k="legs"]').closest('details') || container;
      makeTags(det, []);
    });
  }

  // --- Casino suite rendering ---
  function renderCasino(container){
    container.classList.add('ps-stack');
    container.innerHTML = [
      '<details class="ps-acc">',
      '  <summary><span>🧨 변동성/파산 확률 시뮬레이터</span><span class="ps-badge">예산 생존</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">하우스엣지/베팅단위/횟수로 <b>파산 확률</b>과 <b>최대 낙폭</b>을 추정합니다. (단순 모델)</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>자금(원)</label><input data-k="rb" inputmode="numeric" placeholder="예: 500000"/></div>',
      '      <div class="ps-field"><label>1회 베팅(원)</label><input data-k="bet" inputmode="numeric" placeholder="예: 10000"/></div>',
      '      <div class="ps-field"><label>횟수(N)</label><input data-k="n" inputmode="numeric" value="200"/></div>',
      '    </div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>하우스엣지(%)</label><input data-k="he" inputmode="decimal" value="1.2"/></div>',
      '      <div class="ps-field"><label>승리 수익배수(+) </label><input data-k="pay" inputmode="decimal" value="1"/></div>',
      '      <div class="ps-field"><label>시뮬 횟수</label><select data-k="sims"><option value="1200">1,200</option><option value="2000" selected>2,000</option><option value="4000">4,000</option></select></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="sim">시뮬레이션</button>',
      '      <button class="ps-btn secondary" data-act="simReset">초기화</button>',
      '    </div>',
      '    <div class="ps-kpis cols3">',
      '      <div class="ps-kpi"><div class="k">파산 확률</div><div class="v" data-out="ruin">—</div><div class="s">bankroll ≤ 0</div></div>',
      '      <div class="ps-kpi"><div class="k">최종자금(P50)</div><div class="v" data-out="final">—</div><div class="s">중앙값</div></div>',
      '      <div class="ps-kpi"><div class="k">MDD(P95)</div><div class="v" data-out="mdd">—</div><div class="s">최악권 낙폭</div></div>',
      '    </div>',
      '    <div class="ps-out" data-out="simOut" style="display:none;"></div>',
      '  </div>',
      '</details>',

      '<details class="ps-acc">',
      '  <summary><span>🧠 스트릭(연속) 착각 방지</span><span class="ps-badge">연속은 흔함</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">N회 중 <b>연속 K번</b>이 최소 1번 이상 나올 확률을 계산합니다. “조작” 판단 전에 체크.</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>시도 횟수(N)</label><input data-k="sn" inputmode="numeric" value="200"/></div>',
      '      <div class="ps-field"><label>성공 확률(p)</label><input data-k="sp" inputmode="decimal" value="0.5"/></div>',
      '      <div class="ps-field"><label>연속 길이(K)</label><input data-k="sk" inputmode="numeric" value="8"/></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="streak">계산</button>',
      '      <button class="ps-btn secondary" data-act="stReset">초기화</button>',
      '    </div>',
      '    <div class="ps-kpis cols3">',
      '      <div class="ps-kpi"><div class="k">발생 확률</div><div class="v" data-out="sp1">—</div><div class="s">≥ 1회</div></div>',
      '      <div class="ps-kpi"><div class="k">판정</div><div class="v" data-out="spLab" style="font-size:16px;">—</div><div class="s">체감 vs 현실</div></div>',
      '      <div class="ps-kpi"><div class="k">참고</div><div class="v" data-out="spHint" style="font-size:16px;">—</div><div class="s">리스크</div></div>',
      '    </div>',
      '    <div class="ps-out" data-out="stOut" style="display:none;"></div>',
      '  </div>',
      '</details>'
    ].join('');

    // ruin sim handlers
    var outBox = qs(container,'[data-out="simOut"]');
    qs(container,'[data-act="sim"]').addEventListener('click', function(){
      var rb = parseFloat(qs(container,'[data-k="rb"]').value);
      var bet = parseFloat(qs(container,'[data-k="bet"]').value);
      var n = parseInt(qs(container,'[data-k="n"]').value||'200',10);
      var he = parseFloat(qs(container,'[data-k="he"]').value);
      var pay = parseFloat(qs(container,'[data-k="pay"]').value);
      var sims = parseInt(qs(container,'[data-k="sims"]').value||'2000',10);

      if(!(isFinite(rb)&&rb>0 && isFinite(bet)&&bet>0)){
        outBox.style.display='block';
        outBox.innerHTML='<h4>입력 필요</h4><div class="ps-note">자금/1회 베팅을 입력하세요.</div>';
        return;
      }

      var r = ruinSim({bankroll:rb, bet:bet, n:n, houseEdge:he, payout:pay, sims:sims});
      qs(container,'[data-out="ruin"]').textContent = fmt(r.ruinProb*100,1)+'%';
      qs(container,'[data-out="final"]').textContent = fmt(Math.round(r.finalP50),0);
      qs(container,'[data-out="mdd"]').textContent = fmt(Math.round(r.mddP95),0);

      var msg=[];
      msg.push('승률(p) 추정값: <b>'+fmt(r.pWin,3)+'</b> (하우스엣지 '+fmt(he,2)+'% 가정)');
      msg.push('최종자금 분포: P05 <b>'+fmt(Math.round(r.finalP05),0)+'</b> / P50 <b>'+fmt(Math.round(r.finalP50),0)+'</b> / P95 <b>'+fmt(Math.round(r.finalP95),0)+'</b>');
      msg.push('MDD(낙폭): P50 <b>'+fmt(Math.round(r.mddP50),0)+'</b> / P95 <b>'+fmt(Math.round(r.mddP95),0)+'</b>');
      if(r.ruinProb>0.25) msg.push('<b>파산 확률이 큽니다.</b> 베팅 단위를 낮추거나, 횟수를 줄이고 손절 기준을 설정하세요.');
      else msg.push('파산 확률이 낮아도, 장기적으로는 하우스엣지 때문에 기대값이 불리할 수 있습니다.');

      outBox.style.display='block';
      outBox.innerHTML='<h4>요약</h4><ul>'+msg.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
    });
    qs(container,'[data-act="simReset"]').addEventListener('click', function(){
      qs(container,'[data-k="rb"]').value='';
      qs(container,'[data-k="bet"]').value='';
      qs(container,'[data-k="n"]').value='200';
      qs(container,'[data-k="he"]').value='1.2';
      qs(container,'[data-k="pay"]').value='1';
      qs(container,'[data-out="ruin"]').textContent='—';
      qs(container,'[data-out="final"]').textContent='—';
      qs(container,'[data-out="mdd"]').textContent='—';
      outBox.style.display='none'; outBox.innerHTML='';
    });

    // streak handlers
    var stBox = qs(container,'[data-out="stOut"]');
    qs(container,'[data-act="streak"]').addEventListener('click', function(){
      var n = parseInt(qs(container,'[data-k="sn"]').value||'200',10);
      var p = parseFloat(qs(container,'[data-k="sp"]').value);
      var k = parseInt(qs(container,'[data-k="sk"]').value||'8',10);
      if(!(isFinite(n)&&n>0 && isFinite(p)&&p>=0&&p<=1 && isFinite(k)&&k>0)){
        stBox.style.display='block';
        stBox.innerHTML='<h4>입력 필요</h4><div class="ps-note">N, p(0~1), K를 입력하세요.</div>';
        return;
      }
      var pr = probAtLeastOneRun(n, p, k);
      qs(container,'[data-out="sp1"]').textContent = fmt(pr*100,1)+'%';
      var lab = pr>0.7 ? '흔함' : (pr>0.3 ? '가능' : '드묾');
      qs(container,'[data-out="spLab"]').textContent = lab;
      qs(container,'[data-out="spHint"]').textContent = (k+'연속');

      var msg=[];
      msg.push('N='+n+', p='+fmt(p,3)+'에서 <b>'+k+'연속</b>이 1번 이상 나올 확률은 <b>'+fmt(pr*100,1)+'%</b> 입니다.');
      msg.push('즉, 연속이 나왔다고 해서 “조작”이라고 단정하기 어렵습니다. 표본이 커질수록 긴 연속도 자연스럽게 등장합니다.');
      msg.push('대응: 연속 구간에서는 <b>베팅 단위 축소</b>·<b>쿨다운</b>·<b>손절 캡</b>을 우선 적용하세요.');

      stBox.style.display='block';
      stBox.innerHTML='<h4>해석</h4><ul>'+msg.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
    });
    qs(container,'[data-act="stReset"]').addEventListener('click', function(){
      qs(container,'[data-k="sn"]').value='200';
      qs(container,'[data-k="sp"]').value='0.5';
      qs(container,'[data-k="sk"]').value='8';
      qs(container,'[data-out="sp1"]').textContent='—';
      qs(container,'[data-out="spLab"]').textContent='—';
      qs(container,'[data-out="spHint"]').textContent='—';
      stBox.style.display='none'; stBox.innerHTML='';
    });
  }

  // --- Minigame suite (streak tool only) ---
  function renderMinigame(container){
    container.classList.add('ps-stack');
    container.innerHTML = [
      '<details class="ps-acc">',
      '  <summary><span>🧠 스트릭(연속) 확률 체크</span><span class="ps-badge">오해 방지</span></summary>',
      '  <div class="ps-acc-body">',
      '    <div class="ps-note">최근 N회에서 <b>K연속</b>은 생각보다 자주 나옵니다. 과몰입을 막기 위한 체크 도구입니다.</div>',
      '    <div class="ps-row cols3" style="margin-top:10px;">',
      '      <div class="ps-field"><label>시도 횟수(N)</label><input data-k="n" inputmode="numeric" value="120"/></div>',
      '      <div class="ps-field"><label>성공 확률(p)</label><input data-k="p" inputmode="decimal" value="0.5"/></div>',
      '      <div class="ps-field"><label>연속 길이(K)</label><input data-k="k" inputmode="numeric" value="7"/></div>',
      '    </div>',
      '    <div class="ps-actions">',
      '      <button class="ps-btn primary" data-act="run">계산</button>',
      '      <button class="ps-btn secondary" data-act="reset">초기화</button>',
      '    </div>',
      '    <div class="ps-kpis cols3">',
      '      <div class="ps-kpi"><div class="k">발생 확률</div><div class="v" data-out="p1">—</div><div class="s">≥1회</div></div>',
      '      <div class="ps-kpi"><div class="k">판정</div><div class="v" data-out="lab" style="font-size:16px;">—</div><div class="s">체감</div></div>',
      '      <div class="ps-kpi"><div class="k">권장</div><div class="v" data-out="rec" style="font-size:16px;">—</div><div class="s">세션</div></div>',
      '    </div>',
      '    <div class="ps-out" data-out="out" style="display:none;"></div>',
      '  </div>',
      '</details>'
    ].join('');

    var out = qs(container,'[data-out="out"]');
    qs(container,'[data-act="run"]').addEventListener('click', function(){
      var n = parseInt(qs(container,'[data-k="n"]').value||'120',10);
      var p = parseFloat(qs(container,'[data-k="p"]').value);
      var k = parseInt(qs(container,'[data-k="k"]').value||'7',10);
      var pr = probAtLeastOneRun(n,p,k);
      qs(container,'[data-out="p1"]').textContent = fmt(pr*100,1)+'%';
      var lab = pr>0.7 ? '흔함' : (pr>0.3 ? '가능' : '드묾');
      qs(container,'[data-out="lab"]').textContent = lab;
      qs(container,'[data-out="rec"]').textContent = pr>0.5 ? '단위↓/쿨다운' : '중립';
      out.style.display='block';
      out.innerHTML = '<h4>해석</h4><ul>'+
        '<li>N='+n+', p='+fmt(p,3)+'에서 <b>'+k+'연속</b>이 1번 이상 나올 확률: <b>'+fmt(pr*100,1)+'%</b></li>'+
        '<li>연속이 나온다고 확률이 “보정”되지는 않습니다. 다음 결과는 여전히 p에 가깝습니다.</li>'+
        '<li>대응: 연속 구간에는 베팅 단위를 줄이고, 손절/시간 제한을 우선 적용하세요.</li>'+
      '</ul>';
    });
    qs(container,'[data-act="reset"]').addEventListener('click', function(){
      qs(container,'[data-k="n"]').value='120';
      qs(container,'[data-k="p"]').value='0.5';
      qs(container,'[data-k="k"]').value='7';
      qs(container,'[data-out="p1"]').textContent='—';
      qs(container,'[data-out="lab"]').textContent='—';
      qs(container,'[data-out="rec"]').textContent='—';
      out.style.display='none'; out.innerHTML='';
    });
  }

  // --- Cert suite (bonus interpreter + popup enhance) ---
  function renderCert(container){
    container.classList.add('ps-stack');
    container.innerHTML = [
      '<div class="ps-note">약관/공지 문장을 그대로 붙여넣으면 <b>핵심 제한</b>을 체크리스트로 분해합니다.</div>',
      '<div class="ps-row cols2" style="margin-top:10px;">',
      '  <div class="ps-field"><label>보너스/페이백 조건 원문</label><textarea data-k="txt" placeholder="예: 스포츠 롤링 3% / 카지노 1.2% / 페이백 5%\n최대배당 2.0, 최대베팅 30만, 제외게임 있음..."></textarea></div>',
      '  <div class="ps-field"><label>결과</label><div class="ps-out" data-out="res" style="margin-top:0;">원문을 입력하고 “해석”을 누르세요.</div></div>',
      '</div>',
      '<div class="ps-actions">',
      '  <button class="ps-btn primary" data-act="run">해석</button>',
      '  <button class="ps-btn secondary" data-act="reset">초기화</button>',
      '</div>',
      '<div class="ps-tags"></div>'
    ].join('');

    var res = qs(container,'[data-out="res"]');
    qs(container,'[data-act="run"]').addEventListener('click', function(){
      var txt = qs(container,'[data-k="txt"]').value || '';
      var r = interpretBonus(txt);
      var rows = r.items.map(function(it){ return '<li><b>'+it.k+'</b> · '+(it.v || '—')+'</li>'; }).join('');
      res.innerHTML = '<h4>체크리스트</h4><ul>'+rows+'</ul>'+
        '<div class="ps-note" style="margin-top:10px;">TIP) “최대배당/최대베팅/제외게임/출금제한”은 분쟁의 핵심 포인트입니다.</div>';
      makeTags(container, r.tags);
    });
    qs(container,'[data-act="reset"]').addEventListener('click', function(){
      qs(container,'[data-k="txt"]').value='';
      res.textContent='원문을 입력하고 “해석”을 누르세요.';
      makeTags(container, []);
    });
  }

  function ensureCertPopupSticky(){
    var popup = qs(document,'#cardPopup');
    var box = popup ? qs(popup,'.popup-box') : null;
    if(!popup || !box) return;
    if(qs(box,'.ps-sticky')) return; // already

    var sticky = document.createElement('div');
    sticky.className = 'ps-sticky';
    sticky.innerHTML = [
      '<div class="row">',
      '  <button class="ps-btn primary" type="button" data-act="copygo">원클릭 복사+이동</button>',
      '  <button class="ps-btn ghost" type="button" data-act="copy">코드 복사</button>',
      '</div>',
      '<div class="ps-note" style="margin-top:8px;">* 모바일에서 상단 고정. (복사 후 새 탭 이동)</div>'
    ].join('');

    // insert after close button so it stays at top
    var closeBtn = qs(box,'#closeBtn');
    if(closeBtn && closeBtn.nextSibling) box.insertBefore(sticky, closeBtn.nextSibling);
    else box.insertBefore(sticky, box.firstChild);

    function copySync(text){
      try{
        var ta = document.createElement('textarea');
        ta.value = text || '';
        ta.setAttribute('readonly','');
        ta.style.position='fixed';
        ta.style.left='-9999px';
        ta.style.top='-9999px';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        return !!ok;
      }catch(e){ return false; }
    }

    function toast(msg){
      var t = qs(document,'#copyToast');
      if(!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(function(){ t.classList.remove('show'); }, 1600);
    }

    function getCode(){
      var el = qs(box,'#pCode');
      return el ? (el.textContent||'').trim() : '';
    }
    function getLink(){
      var a = qs(box,'#pLink');
      return a ? (a.getAttribute('href')||'').trim() : '';
    }

    qs(sticky,'[data-act="copy"]').addEventListener('click', function(){
      var code = getCode();
      if(!code){ toast('복사할 코드가 없습니다'); return; }
      if(copySync(code)) toast('가입코드가 복사되었습니다');
      else toast('복사 실패(브라우저 설정 확인)');
    });

    qs(sticky,'[data-act="copygo"]').addEventListener('click', function(){
      var code = getCode();
      var link = getLink();
      if(!link || link==='#'){ toast('이동 링크가 없습니다'); return; }
      // Do sync copy first (keeps user gesture on mobile)
      if(code) copySync(code);
      try{ window.open(link, '_blank', 'noopener'); } catch(e){ location.href = link; }
      toast('코드 복사 후 이동');
    });
  }

  // --- Boot ---
  function boot(){
    // sports
    qsa(document,'[data-prosuite="sports"]').forEach(function(el){ renderSports(el); });

    // casino
    qsa(document,'[data-prosuite="casino"]').forEach(function(el){ renderCasino(el); });

    // minigame
    qsa(document,'[data-prosuite="minigame"]').forEach(function(el){ renderMinigame(el); });

    // cert
    qsa(document,'[data-prosuite="cert"]').forEach(function(el){ renderCert(el); });

    // cert popup enhancement (even if no cert container)
    ensureCertPopupSticky();

    // In case popup is injected later
    try{
      var popup = qs(document,'#cardPopup');
      if(popup && window.MutationObserver){
        var mo = new MutationObserver(function(){ ensureCertPopupSticky(); });
        mo.observe(popup, {subtree:true, childList:true});
      }
    }catch(e){}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
