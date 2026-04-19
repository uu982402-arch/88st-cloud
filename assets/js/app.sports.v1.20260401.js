(() => {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const E = () => window.RavenEngines || {};
  const modal = () => window.RavenResultModal;
  const money = (n) => `${Math.round(Number(n) || 0).toLocaleString()}원`;
  const pct100 = (n) => `${(Number(n) || 0).toFixed(1)}%`;

  const MARKETS = {
    '1x2': { label: '승·무·패', fields: ['home', 'draw', 'away'], labels: { home: '홈 배당', draw: '무 배당', away: '원정 배당' }, resultLabels: ['홈', '무', '원정'] },
    moneyline: { label: '승·패', fields: ['home', 'away'], labels: { home: '홈 배당', away: '원정 배당' }, resultLabels: ['홈', '원정'] },
    ou: { label: '언더·오버', fields: ['line', 'over', 'under'], labels: { line: '기준점', over: '오버 배당', under: '언더 배당' }, resultLabels: ['오버', '언더'] },
    hcp: { label: '핸디캡', fields: ['line', 'home', 'away'], labels: { line: '기준점', home: '홈 배당', away: '원정 배당' }, resultLabels: ['홈', '원정'] },
  };

  const PRESETS = {
    '1x2': [
      { label: '균형형', values: { home: 2.08, draw: 3.30, away: 3.48 } },
      { label: '정배형', values: { home: 1.74, draw: 3.78, away: 4.72 } },
    ],
    moneyline: [
      { label: '접전형', values: { home: 1.88, away: 1.98 } },
      { label: '우세형', values: { home: 1.56, away: 2.46 } },
    ],
    ou: [
      { label: '2.5 균형', values: { line: 2.5, over: 1.92, under: 1.94 } },
      { label: '3.5 고득점', values: { line: 3.5, over: 1.84, under: 2.02 } },
    ],
    hcp: [
      { label: '-1.0 기준', values: { line: -1.0, home: 2.02, away: 1.84 } },
      { label: '+1.5 기준', values: { line: 1.5, home: 1.78, away: 2.08 } },
    ],
  };

  function validOdds(vals) {
    return vals.every((v) => Number.isFinite(v) && v >= 1.02);
  }

  function riskText(mode) {
    return mode === 'safe' ? '보수' : mode === 'aggressive' ? '공격' : '중립';
  }

  function cleanPercent(value) {
    return `${(Number(value) || 0).toFixed(1)}%`;
  }

  function outcomeSort(outcomes, key) {
    return outcomes.slice().sort((a, b) => (b[key] || 0) - (a[key] || 0));
  }

  function buildSportsStudy({ engines, market, odds, capital, riskMode, line, labels }) {
    const fair = engines.fairProbability({ odds, market });
    const outcomes = fair.fairProbabilities.map((prob, idx) => {
      const stakeBase = capital || 100000;
      const ev = engines.expectedValue({ probability: prob, odds: odds[idx], stake: stakeBase });
      const vol = engines.volatilityRisk({ probability: prob, odds: odds[idx], stake: Math.max(1000, stakeBase * 0.01), plays: market === '1x2' ? 3 : 2 });
      return {
        idx,
        label: labels[idx],
        prob,
        probPct: prob * 100,
        odds: odds[idx],
        fairOdds: fair.fairOdds[idx],
        ev,
        vol,
      };
    }).filter((item) => item.label && item.label !== '-');
    const bestProb = outcomeSort(outcomes, 'prob')[0];
    const bestEdge = outcomes.slice().sort((a, b) => (b.ev.evRate || 0) - (a.ev.evRate || 0))[0];
    const marketVolScore = outcomes.reduce((sum, item) => sum + item.vol.volatilityScore, 0) / Math.max(1, outcomes.length);
    const marketVol = {
      score: marketVolScore,
      grade: marketVolScore >= 75 ? '매우 높음' : marketVolScore >= 55 ? '높음' : marketVolScore >= 30 ? '보통' : '낮음',
    };
    const bankroll = engines.bankrollPlan({ capital, probability: bestEdge.prob, odds: bestEdge.odds, mode: riskMode, volatilityScore: marketVol.score });
    bankroll.mode = riskMode;
    const confidence = engines.marketConfidence ? engines.marketConfidence({ fair, outcomes, market, line, volatilityScore: marketVol.score }) : { score: 50, label: '중립', action: '관망', probGap: 0, edgeGap: 0, reasons: [] };
    const lean = engines.marketLean ? engines.marketLean({ fair, outcomes, market, line }) : { title: '균형 시장', detail: '입력값 기반으로 시장 균형을 해석합니다.' };
    const secondProb = outcomeSort(outcomes, 'prob')[1];
    const secondEdge = outcomes.slice().sort((a, b) => (b.ev.evRate || 0) - (a.ev.evRate || 0))[1];
    return { fair, outcomes, bestProb, bestEdge, secondProb, secondEdge, marketVol, bankroll, confidence, lean, line };
  }

  function sportsComment({ market, study, capital }) {
    const comments = [];
    comments.push(`${study.lean.title} · ${study.lean.detail}`);
    if (study.bestEdge.ev.evRate > 0.02) comments.push(`${study.bestEdge.label} 쪽 보정 EV가 플러스 구간입니다.`);
    else if (study.bestEdge.ev.evRate > 0) comments.push(`${study.bestEdge.label} 쪽이 미세 우세라 소액 접근 정도가 적합합니다.`);
    else comments.push('입력 배당 기준 뚜렷한 가치 우위가 약해 관망 쪽이 더 안전합니다.');
    if (study.fair.margin >= 0.07) comments.push(`북마진 ${cleanPercent(study.fair.margin * 100)}로 높아 선택 전에 한 군데 더 비교하는 편이 좋습니다.`);
    else comments.push(`북마진 ${cleanPercent(study.fair.margin * 100)}로 과도하지는 않습니다.`);
    if (market === 'ou' && line) comments.push(`기준점 ${line}는 득점 기대치 자체라 배당보다 라인 변화도 같이 확인하세요.`);
    if (market === 'hcp' && line) comments.push(`핸디 ${line}는 승패보다 점수 차 가정이 중요해 주력보단 분산 접근이 낫습니다.`);
    comments.push(`${riskText(study.bankroll.mode)} 기준 권장 비중은 ${study.bankroll.ratio > 0 ? `${(study.bankroll.ratio * 100).toFixed(1)}%` : '관망'}입니다.`);
    if (capital > 0) comments.push(`자본 입력 기준 일일 손실 한도는 ${money(study.bankroll.stopLoss)}, 목표 이익은 ${money(study.bankroll.targetGain)}입니다.`);
    return comments.slice(0, 5);
  }

  function initSports() {
    const engines = E();
    const form = qs('[data-sports-mini-form]');
    const result = qs('[data-sports-mini-result]');
    const tabWrap = qs('[data-sports-tabs]');
    if (!form || !result || !tabWrap || !engines.fairProbability) return;

    const hiddenMarket = qs('input[name="market"]', form);
    const fieldMap = Object.fromEntries(['line', 'home', 'draw', 'away', 'over', 'under'].map((k) => [k, qs(`[data-wrap="${k}"]`, form)]));
    const inputs = Object.fromEntries(['line', 'home', 'draw', 'away', 'over', 'under', 'capital', 'risk'].map((k) => [k, qs(`[data-field="${k}"]`, form)]));
    const metricLabels = qsa('.sports-metric span', result);
    const metricRows = qsa('[data-metric-slot]', result);
    const metricValues = qsa('.sports-metric strong', result);
    const metricBars = qsa('.sports-metric-track i', result);
    const summary = qs('[data-sports-summary]', result);
    const subsummary = qs('[data-sports-subsummary]', result);
    const marginNode = qs('[data-sports-margin]', result);
    const marketLabelNode = qs('[data-sports-market-label]', result);
    const notesNode = qs('[data-sports-notes]', result);
    const formNote = qs('[data-sports-form-note]');
    const confidenceNode = qs('[data-sports-confidence-chip]');
    const actionNode = qs('[data-sports-action-chip]');
    const presetWrap = qs('[data-sports-presets]');
    const insightValue = (key) => qs(`[data-sports-insight="${key}"]`, result);
    const insightNote = (key) => qs(`[data-sports-insight-note="${key}"]`, result);
    let hasValidResult = false;
    let lastStudy = null;

    function setMetricLabels(labels) {
      metricLabels.forEach((node, idx) => {
        const label = labels[idx] || '-';
        node.textContent = label;
        if (metricRows[idx]) metricRows[idx].classList.toggle('is-empty', label === '-');
      });
    }

    function renderPresets(market) {
      if (!presetWrap) return;
      const list = PRESETS[market] || [];
      presetWrap.innerHTML = list.map((preset, idx) => `<button class="sports-preset-chip${idx === 0 ? ' is-primary' : ''}" type="button" data-sports-preset='${JSON.stringify({ market, values: preset.values })}'>${preset.label}</button>`).join('');
    }

    function setIdle(label) {
      hasValidResult = false;
      lastStudy = null;
      if (marketLabelNode) marketLabelNode.textContent = label;
      if (summary) summary.textContent = '입력 대기';
      if (subsummary) subsummary.textContent = '공정확률 · 기대값 · 변동성 · 추천 비중';
      if (marginNode) marginNode.textContent = '북마진 -';
      if (confidenceNode) confidenceNode.textContent = '신뢰도 대기';
      if (actionNode) actionNode.textContent = '판단 대기';
      if (formNote) formNote.textContent = `${label} 기준 빠른 비교만 먼저 계산합니다.`;
      ['fair', 'ev', 'vol', 'bank', 'conf', 'call'].forEach((key) => {
        if (insightValue(key)) insightValue(key).textContent = '-';
        if (insightNote(key)) insightNote(key).textContent = '-';
      });
      metricValues.forEach((node) => { node.textContent = '-'; });
      metricBars.forEach((bar) => { bar.style.width = '0%'; });
      if (notesNode) notesNode.innerHTML = '<li>배당 입력 전 대기</li>';
    }

    function applyMarket(market) {
      const cfg = MARKETS[market] || MARKETS['1x2'];
      hiddenMarket.value = market;
      qsa('[data-market]', tabWrap).forEach((btn) => btn.classList.toggle('is-active', btn.dataset.market === market));
      Object.entries(fieldMap).forEach(([key, wrap]) => {
        if (!wrap) return;
        const active = cfg.fields.includes(key);
        wrap.hidden = !active;
        const label = qs('label', wrap);
        if (label && cfg.labels[key]) label.textContent = cfg.labels[key];
        if (!active && inputs[key]) inputs[key].value = '';
      });
      renderPresets(market);
      setMetricLabels(market === '1x2' ? ['홈', '무', '원정'] : market === 'ou' ? ['오버', '언더', '-'] : ['홈', '원정', '-']);
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
      const study = buildSportsStudy({ engines, market, odds, capital, riskMode, line: Number.isFinite(line) ? line : 0, labels: cfg.resultLabels });
      lastStudy = study;
      hasValidResult = true;

      metricValues.forEach((node, idx) => { node.textContent = study.outcomes[idx] ? pct100(study.outcomes[idx].probPct) : '-'; });
      metricBars.forEach((bar, idx) => { bar.style.width = study.outcomes[idx] ? `${Math.max(6, Math.min(100, study.outcomes[idx].probPct))}%` : '0%'; });

      if (summary) summary.textContent = `${study.bestProb.label} 공정확률 ${pct100(study.bestProb.probPct)} · ${engines.describeEdge(study.bestEdge.ev.evRate)}`;
      if (subsummary) subsummary.textContent = `${study.confidence.action} · ${study.bestEdge.label} 보정 EV ${engines.formatSignedPercent(study.bestEdge.ev.evRate * 100)}`;
      if (marginNode) marginNode.textContent = `북마진 ${(study.fair.margin * 100).toFixed(1)}%`;
      if (confidenceNode) confidenceNode.textContent = `신뢰도 ${study.confidence.label}`;
      if (actionNode) actionNode.textContent = study.confidence.action;
      if (formNote) formNote.textContent = `${study.lean.title} · ${study.confidence.reasons.slice(0, 2).join(' · ')}`;

      if (insightValue('fair')) insightValue('fair').textContent = `${study.bestProb.label} ${pct100(study.bestProb.probPct)}`;
      if (insightNote('fair')) insightNote('fair').textContent = `공정 오즈 ${study.bestProb.fairOdds.toFixed(2)}`;

      if (insightValue('ev')) insightValue('ev').textContent = `${study.bestEdge.label} ${engines.formatSignedPercent(study.bestEdge.ev.evRate * 100)}`;
      if (insightNote('ev')) insightNote('ev').textContent = `2순위 대비 ${(study.confidence.edgeGap * 100).toFixed(1)}%p 차이`;

      if (insightValue('vol')) insightValue('vol').textContent = study.marketVol.grade;
      if (insightNote('vol')) insightNote('vol').textContent = `5연속 미적중 ${(study.bestProb.vol.streakLossProb * 100).toFixed(1)}%`;

      if (insightValue('bank')) insightValue('bank').textContent = capital ? money(study.bankroll.amount) : `${(study.bankroll.ratio * 100).toFixed(1)}%`;
      if (insightNote('bank')) insightNote('bank').textContent = `${riskText(riskMode)} · 손절 ${capital ? money(study.bankroll.stopLoss) : '자본 입력 시 표시'}`;

      if (insightValue('conf')) insightValue('conf').textContent = `${Math.round(study.confidence.score)}점`;
      if (insightNote('conf')) insightNote('conf').textContent = `확률 격차 ${(study.confidence.probGap * 100).toFixed(1)}%p`;

      if (insightValue('call')) insightValue('call').textContent = study.confidence.action;
      if (insightNote('call')) insightNote('call').textContent = study.lean.title;

      if (notesNode) {
        const notes = sportsComment({ market, study, capital, line: Number.isFinite(line) && line !== 0 ? line : '' });
        notesNode.innerHTML = notes.map((item) => `<li>${item}</li>`).join('');
      }
    }

    qsa('[data-market]', tabWrap).forEach((btn) => btn.addEventListener('click', () => applyMarket(btn.dataset.market || '1x2')));
    Object.values(inputs).forEach((input) => {
      if (input) input.addEventListener('input', compute);
      if (input && input.tagName === 'SELECT') input.addEventListener('change', compute);
    });
    presetWrap?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-sports-preset]');
      if (!button) return;
      const payload = JSON.parse(button.dataset.sportsPreset || '{}');
      applyMarket(payload.market || hiddenMarket.value || '1x2');
      Object.entries(payload.values || {}).forEach(([key, value]) => {
        if (inputs[key]) inputs[key].value = value;
      });
      compute();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      compute();
      if (!hasValidResult || !lastStudy) return;
      const title = `${MARKETS[hiddenMarket.value || '1x2']?.label || '스포츠'} 분석 결과`;
      const summaryHtml = `<div class="sports-modal-stack"><div class="sports-modal-callout"><strong>${lastStudy.confidence.action}</strong><span>신뢰도 ${Math.round(lastStudy.confidence.score)}점 · ${lastStudy.lean.title}</span></div>${result.innerHTML}<div class="sports-modal-foot"><a class="safety-link-btn ghost" href="/tools/ai-sports-odds-analysis/">상세 도구 열기</a></div></div>`;
      modal()?.open({ titleText: title, html: summaryHtml });
    });

    applyMarket(hiddenMarket.value || '1x2');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSports); else initSports();
})();
