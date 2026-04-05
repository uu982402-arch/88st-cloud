(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const E = () => window.RavenEngines || {};
  const modal = () => window.RavenResultModal;
  const money = (n) => `${Math.round(Number(n)||0).toLocaleString()}원`;
  const pct100 = (n) => `${(Number(n)||0).toFixed(1)}%`;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const MARKETS = {
    '1x2': { label:'승·무·패', fields:['home','draw','away'], labels:{ home:'홈 배당', draw:'무 배당', away:'원정 배당' }, resultLabels:['홈','무','원정'] },
    moneyline: { label:'승·패', fields:['home','away'], labels:{ home:'홈 배당', away:'원정 배당' }, resultLabels:['홈','원정'] },
    ou: { label:'언더·오버', fields:['line','over','under'], labels:{ line:'기준점', over:'오버 배당', under:'언더 배당' }, resultLabels:['오버','언더'] },
    hcp: { label:'핸디캡', fields:['line','home','away'], labels:{ line:'기준점', home:'홈 배당', away:'원정 배당' }, resultLabels:['홈','원정'] },
  };

  function validOdds(vals) {
    return vals.every((v) => Number.isFinite(v) && v >= 1.02);
  }

  function riskText(mode) {
    return mode === 'safe' ? '보수' : mode === 'aggressive' ? '공격' : '중립';
  }

  function sportsComment({ market, bestProb, bestEdge, volatility, bankroll, line }) {
    const comments = [];
    if (bestEdge.ev.evRate > 0.015) comments.push(`${bestEdge.label} 쪽 보정 EV가 상대적으로 좋습니다.`);
    else comments.push(`${bestProb.label} 쪽 공정확률이 가장 높습니다.`);
    if (market === 'ou' && line) comments.push(`기준점 ${line} 기준으로 언더·오버 균형을 같이 보세요.`);
    if (market === 'hcp' && line) comments.push(`핸디 ${line}는 라인과 변동성을 함께 봐야 합니다.`);
    comments.push(`현재 구조의 변동성은 ${volatility.grade.toLowerCase()}입니다.`);
    if (bankroll.ratio > 0) comments.push(`${riskText(bankroll.mode)} 기준 추천 비중은 ${(bankroll.ratio*100).toFixed(1)}%입니다.`);
    return comments.slice(0,3);
  }

  function buildSportsModalHtml(state) {
    const metrics = state.metrics.map((item)=>`
      <div class="sports-metric sports-metric--row">
        <div class="sports-metric-copy"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong></div>
        <div class="sports-metric-track" aria-hidden="true"><i style="width:${item.width}%"></i></div>
      </div>`).join('');
    const notes = state.notes.map((item)=>`<li>${esc(item)}</li>`).join('');
    return `
      <div class="main-sports-result is-modal-view">
        <div class="sports-score-shell">
          <div class="sports-score-top">
            <div class="sports-score-copy">
              <strong>분석 결과</strong>
              <span>${esc(state.marketLabel)}</span>
            </div>
            <small>${esc(state.marginText)}</small>
          </div>
          <div class="sports-summary-card">
            <span class="sports-summary-kicker">현재 포인트</span>
            <strong>${esc(state.summary)}</strong>
            <p>${esc(state.subsummary)}</p>
          </div>
          <div class="sports-insight-grid">
            ${state.insights.map((item)=>`<article class="sports-insight-card"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong><small>${esc(item.note)}</small></article>`).join('')}
          </div>
          <div class="sports-metric-list">${metrics}</div>
          <ul class="sports-notes-list">${notes}</ul>
        </div>
      </div>`;
  }

  function initSports() {
    const engines = E();
    const form = qs('[data-sports-mini-form]');
    const tabWrap = qs('[data-sports-tabs]');
    if (!form || !tabWrap || !engines.fairProbability) return;

    const hiddenMarket = qs('input[name="market"]', form);
    const fieldMap = Object.fromEntries(['line','home','draw','away','over','under'].map((k)=>[k, qs(`[data-wrap="${k}"]`, form)]));
    const inputs = Object.fromEntries(['line','home','draw','away','over','under','capital','risk'].map((k)=>[k, qs(`[data-field="${k}"]`, form)]));
    let currentState = null;

    function applyMarket(market) {
      const cfg = MARKETS[market] || MARKETS['1x2'];
      hiddenMarket.value = market;
      qsa('[data-market]', tabWrap).forEach(btn => btn.classList.toggle('is-active', btn.dataset.market === market));
      Object.entries(fieldMap).forEach(([key, wrap]) => {
        if (!wrap) return;
        const active = cfg.fields.includes(key);
        wrap.hidden = !active;
        const label = qs('label', wrap);
        if (label && cfg.labels[key]) label.textContent = cfg.labels[key];
        if (!active && inputs[key]) inputs[key].value = '';
      });
      currentState = null;
      compute();
    }

    function compute() {
      const market = hiddenMarket.value || '1x2';
      const cfg = MARKETS[market] || MARKETS['1x2'];
      const odds = cfg.fields.filter((k) => k !== 'line').map((k) => Number(inputs[k]?.value || ''));
      const line = Number(inputs.line?.value || '');
      const capital = Number(inputs.capital?.value || 0);
      const riskMode = inputs.risk?.value || 'neutral';
      if (!validOdds(odds)) {
        currentState = null;
        return null;
      }
      const fair = engines.fairProbability({ odds, market });
      const labels = cfg.resultLabels;
      const outcomes = fair.fairProbabilities.map((prob, idx) => {
        const ev = engines.expectedValue({ probability: prob, odds: odds[idx], stake: capital || 100000 });
        const vol = engines.volatilityRisk({ probability: prob, odds: odds[idx], stake: Math.max(1000, (capital || 100000) * 0.01), plays: market === '1x2' ? 3 : 2 });
        return { idx, label: labels[idx], prob, probPct: prob * 100, odds: odds[idx], ev, vol };
      }).filter((item) => item.label && item.label !== '-');
      const bestProb = outcomes.slice().sort((a,b)=>b.prob-a.prob)[0];
      const bestEdge = outcomes.slice().sort((a,b)=>b.ev.evRate-a.ev.evRate)[0];
      const marketVolScore = outcomes.reduce((sum,item)=>sum+item.vol.volatilityScore,0) / Math.max(1,outcomes.length);
      const marketVol = { score: marketVolScore, grade: marketVolScore >= 75 ? '매우 높음' : marketVolScore >= 55 ? '높음' : marketVolScore >= 30 ? '보통' : '낮음' };
      const bankroll = engines.bankrollPlan({ capital, probability: bestEdge.prob, odds: bestEdge.odds, mode: riskMode, volatilityScore: marketVol.score });
      bankroll.mode = riskMode;
      currentState = {
        market,
        marketLabel: cfg.label,
        marginText: `북마진 ${(fair.margin * 100).toFixed(1)}%`,
        summary: `${bestProb.label} 공정확률 ${pct100(bestProb.probPct)} · ${engines.describeEdge(bestEdge.ev.evRate)}`,
        subsummary: `${bestEdge.label} 보정 EV ${engines.formatSignedPercent(bestEdge.ev.evRate * 100)} · ${marketVol.grade} 변동성`,
        insights: [
          { label:'공정확률', value:`${bestProb.label} ${pct100(bestProb.probPct)}`, note:`공정 오즈 ${fair.fairOdds[bestProb.idx].toFixed(2)}` },
          { label:'기대값', value:`${bestEdge.label} ${engines.formatSignedPercent(bestEdge.ev.evRate * 100)}`, note:`${bestEdge.ev.label} · 보정 EV 기준` },
          { label:'변동성', value:marketVol.grade, note:`5연속 미적중 ${pct100(bestProb.vol.streakLossProb * 100).replace('%%','%')}` },
          { label:'추천 비중', value:capital ? money(bankroll.amount) : `${(bankroll.ratio * 100).toFixed(1)}%`, note:`${riskText(riskMode)} · ${bankroll.label}` },
        ],
        metrics: outcomes.map((item)=>({ label:item.label, value:pct100(item.probPct), width:Math.max(6, Math.min(100, item.probPct)) })),
        notes: sportsComment({ market, bestProb, bestEdge, volatility: marketVol, bankroll, line: Number.isFinite(line) && line !== 0 ? line : '' }),
      };
      return currentState;
    }

    qsa('[data-market]', tabWrap).forEach((btn) => btn.addEventListener('click', () => applyMarket(btn.dataset.market || '1x2')));
    Object.values(inputs).forEach((input) => { if (input) input.addEventListener('input', compute); if (input && input.tagName === 'SELECT') input.addEventListener('change', compute); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const state = compute();
      if (!state) return;
      modal()?.open({ titleText:'스포츠 분석 결과', html: buildSportsModalHtml(state) });
    });
    applyMarket(hiddenMarket.value || '1x2');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSports); else initSports();
})();
