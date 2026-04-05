(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const E = () => window.RavenEngines || {};
  const modal = () => window.RavenResultModal;
  const money = (n) => `${Math.round(Number(n)||0).toLocaleString()}원`;
  const pct100 = (n) => `${(Number(n)||0).toFixed(1)}%`;

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
    if (market === 'ou' && line) comments.push(`기준점 ${line} 기준으로 균형이 크게 벌어지지 않는지 같이 보세요.`);
    if (market === 'hcp' && line) comments.push(`핸디 ${line}는 라인 자체보다 변동성까지 같이 봐야 합니다.`);
    comments.push(`현재 구조의 변동성은 ${volatility.grade.toLowerCase()}입니다.`);
    if (bankroll.ratio > 0) comments.push(`${riskText(bankroll.mode)} 기준 추천 비중은 ${(bankroll.ratio*100).toFixed(1)}%입니다.`);
    return comments.slice(0,3);
  }

  function initSports() {
    const engines = E();
    const form = qs('[data-sports-mini-form]');
    const result = qs('[data-sports-mini-result]');
    const tabWrap = qs('[data-sports-tabs]');
    if (!form || !result || !tabWrap || !engines.fairProbability) return;

    const hiddenMarket = qs('input[name="market"]', form);
    const fieldMap = Object.fromEntries(['line','home','draw','away','over','under'].map((k)=>[k, qs(`[data-wrap="${k}"]`, form)]));
    const inputs = Object.fromEntries(['line','home','draw','away','over','under','capital','risk'].map((k)=>[k, qs(`[data-field="${k}"]`, form)]));
    const metricLabels = qsa('.sports-metric span', result);
    const metricRows = qsa('[data-metric-slot]', result);
    const metricValues = qsa('.sports-metric strong', result);
    const metricBars = qsa('.sports-metric-track i', result);
    const summary = qs('[data-sports-summary]', result);
    const subsummary = qs('[data-sports-subsummary]', result);
    const marginNode = qs('[data-sports-margin]', result);
    const marketLabelNode = qs('[data-sports-market-label]', result);
    const notesNode = qs('[data-sports-notes]', result);
    const insightValue = (key) => qs(`[data-sports-insight="${key}"]`, result);
    const insightNote = (key) => qs(`[data-sports-insight-note="${key}"]`, result);
    let hasValidResult = false;

    function setMetricLabels(labels) {
      metricLabels.forEach((node, idx) => {
        const label = labels[idx] || '-';
        node.textContent = label;
        if (metricRows[idx]) metricRows[idx].classList.toggle('is-empty', label === '-');
      });
    }

    function setIdle(label) {
      hasValidResult = false;
      if (marketLabelNode) marketLabelNode.textContent = label;
      if (summary) summary.textContent = '입력 대기';
      if (subsummary) subsummary.textContent = '공정확률 · 기대값 · 변동성 · 추천 비중';
      if (marginNode) marginNode.textContent = '북마진 -';
      ['fair','ev','vol','bank'].forEach((key) => {
        if (insightValue(key)) insightValue(key).textContent = '-';
        if (insightNote(key)) insightNote(key).textContent = '-';
      });
      metricValues.forEach((node) => node.textContent = '-');
      metricBars.forEach((bar) => { bar.style.width = '0%'; });
      if (notesNode) notesNode.innerHTML = '<li>배당 입력 전 대기</li>';
    }

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
      setMetricLabels(market === '1x2' ? ['홈','무','원정'] : market === 'ou' ? ['오버','언더','-'] : ['홈','원정','-']);
      setIdle(cfg.label);
      compute();
    }

    function compute() {
      const market = hiddenMarket.value || '1x2';
      const cfg = MARKETS[market] || MARKETS['1x2'];
      const odds = cfg.fields.filter((k) => k !== 'line').map((k) => Number(inputs[k]?.value || ''));
      const line = Number(inputs.line?.value || '');
      const capital = Number(inputs.capital?.value || 0);
      const riskMode = inputs.risk?.value || 'neutral';
      if (marketLabelNode) marketLabelNode.textContent = cfg.label;
      if (!validOdds(odds)) {
        setIdle(cfg.label);
        return;
      }
      hasValidResult = true;
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

      metricValues.forEach((node, idx) => { node.textContent = outcomes[idx] ? pct100(outcomes[idx].probPct) : '-'; });
      metricBars.forEach((bar, idx) => { bar.style.width = outcomes[idx] ? `${Math.max(6, Math.min(100, outcomes[idx].probPct))}%` : '0%'; });

      if (summary) summary.textContent = `${bestProb.label} 공정확률 ${pct100(bestProb.probPct)} · ${engines.describeEdge(bestEdge.ev.evRate)}`;
      if (subsummary) subsummary.textContent = `${bestEdge.label} 보정 EV ${engines.formatSignedPercent(bestEdge.ev.evRate * 100)} · ${marketVol.grade} 변동성`;
      if (marginNode) marginNode.textContent = `북마진 ${(fair.margin * 100).toFixed(1)}%`;
      if (insightValue('fair')) insightValue('fair').textContent = `${bestProb.label} ${pct100(bestProb.probPct)}`;
      if (insightNote('fair')) insightNote('fair').textContent = `공정 오즈 ${fair.fairOdds[bestProb.idx].toFixed(2)}`;
      if (insightValue('ev')) insightValue('ev').textContent = `${bestEdge.label} ${engines.formatSignedPercent(bestEdge.ev.evRate * 100)}`;
      if (insightNote('ev')) insightNote('ev').textContent = `${bestEdge.ev.label} · 보정 EV 기준`;
      if (insightValue('vol')) insightValue('vol').textContent = marketVol.grade;
      if (insightNote('vol')) insightNote('vol').textContent = `5연속 미적중 ${pct100(bestProb.vol.streakLossProb * 100).replace('%%','%')}`;
      if (insightValue('bank')) insightValue('bank').textContent = capital ? money(bankroll.amount) : `${(bankroll.ratio * 100).toFixed(1)}%`;
      if (insightNote('bank')) insightNote('bank').textContent = `${riskText(riskMode)} · ${bankroll.label}`;
      if (notesNode) {
        const notes = sportsComment({ market, bestProb, bestEdge, volatility: marketVol, bankroll, line: Number.isFinite(line) && line !== 0 ? line : '' });
        notesNode.innerHTML = notes.map((item) => `<li>${item}</li>`).join('');
      }
    }

    qsa('[data-market]', tabWrap).forEach((btn) => btn.addEventListener('click', () => applyMarket(btn.dataset.market || '1x2')));
    Object.values(inputs).forEach((input) => { if (input) input.addEventListener('input', compute); if (input && input.tagName === 'SELECT') input.addEventListener('change', compute); });
    form.addEventListener('submit', (e) => { e.preventDefault(); compute(); if (!hasValidResult) { return; } modal()?.open({ titleText:'스포츠 분석 결과', html: result.innerHTML }); });
    applyMarket(hiddenMarket.value || '1x2');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSports); else initSports();
})();
