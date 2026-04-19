(() => {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const E = () => window.RavenEngines || {};
  const modal = () => window.RavenResultModal;
  const money = (n) => `${Math.round(Number(n) || 0).toLocaleString()}원`;
  const pct100 = (n) => `${(Number(n) || 0).toFixed(1)}%`;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

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

  function sportsComment({ market, study, capital, line }) {
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

  function buildAvoidSignals({ market, study, line }) {
    const signals = [];
    if (study.fair.margin >= 0.07) signals.push('북마진 높음');
    if (study.bestEdge.ev.evRate <= 0) signals.push('플러스 EV 부족');
    if (study.confidence.score < 60) signals.push('신뢰도 낮음');
    if (study.marketVol.score >= 60) signals.push('변동성 큼');
    if (study.confidence.probGap < 0.03) signals.push('격차 좁음');
    if (market === '1x2' && study.lean.title.includes('무승부')) signals.push('무승부 경계');
    if ((market === 'ou' || market === 'hcp') && Number.isFinite(Number(line)) && Math.abs(Number(line)) >= 1.5) signals.push('라인 영향 큼');
    return signals.slice(0, 4);
  }

  function buildPlanNotes({ market, study, capital, line }) {
    const notes = [];
    notes.push(`${study.bestEdge.label} 기준 ${study.confidence.action.toLowerCase()} 흐름`);
    notes.push(capital > 0 ? `권장 ${money(study.bankroll.amount)} · 손절 ${money(study.bankroll.stopLoss)}` : `권장 ${(study.bankroll.ratio * 100).toFixed(1)}% · ${riskText(study.bankroll.mode)} 운용`);
    notes.push(study.fair.margin >= 0.07 ? '다른 북 한 군데 더 비교' : '현재 마진은 과도하지 않음');
    if (market === 'ou' && line) notes.push(`라인 ${line} 전후로 0.5 차이도 같이 보기`);
    else if (market === 'hcp' && line) notes.push(`핸디 ${line} 푸시·커버 시나리오 체크`);
    else notes.push('단일 선택보다 2순위와 격차 같이 보기');
    return notes.slice(0, 4);
  }

  function renderAssistIdle(assist, label) {
    if (!assist) return;
    assist.innerHTML = `
      <div class="sports-support-shell is-idle">
        <div class="sports-support-head">
          <div>
            <span class="sports-support-kicker">보조 분석</span>
            <strong>${esc(label)} 읽기 보조</strong>
          </div>
          <span class="sports-support-tone">입력 대기</span>
        </div>
        <div class="sports-support-grid">
          <article class="sports-support-card"><span>흐름</span><strong>대기</strong><small>입력 후 판단</small></article>
          <article class="sports-support-card"><span>회피 신호</span><strong>-</strong><small>마진 · 변동성</small></article>
          <article class="sports-support-card"><span>운영</span><strong>-</strong><small>기준금 · 손절</small></article>
          <article class="sports-support-card"><span>추가 체크</span><strong>-</strong><small>라인 · 비교</small></article>
        </div>
        <div class="sports-support-block-grid">
          <section class="sports-support-block"><div class="sports-support-block-head"><strong>회피 신호</strong><span>PASS 체크</span></div><ul><li>배당을 넣으면 회피 포인트를 같이 보여줍니다.</li></ul></section>
          <section class="sports-support-block"><div class="sports-support-block-head"><strong>운영 메모</strong><span>실전용</span></div><ul><li>분석하기를 누르면 결과는 모달에서 더 자세히 확인합니다.</li></ul></section>
        </div>
      </div>`;
  }

  function renderAssistPanel({ assist, market, study, capital, engines, line }) {
    if (!assist || !study) return;
    const signals = buildAvoidSignals({ market, study, line });
    const notes = buildPlanNotes({ market, study, capital, line });
    const marketLabel = MARKETS[market]?.label || '스포츠';
    const stakeText = capital > 0 ? money(study.bankroll.amount) : `${(study.bankroll.ratio * 100).toFixed(1)}%`;
    const signalTone = signals.length >= 3 ? '주의 높음' : signals.length >= 2 ? '주의 필요' : '진입 검토';
    assist.innerHTML = `
      <div class="sports-support-shell">
        <div class="sports-support-head">
          <div>
            <span class="sports-support-kicker">보조 분석</span>
            <strong>${esc(marketLabel)} 시장 해석</strong>
          </div>
          <span class="sports-support-tone">${esc(study.confidence.action)}</span>
        </div>
        <div class="sports-support-grid">
          <article class="sports-support-card"><span>흐름</span><strong>${esc(study.lean.title)}</strong><small>${esc(study.bestProb.label)} ${pct100(study.bestProb.probPct)}</small></article>
          <article class="sports-support-card"><span>회피 신호</span><strong>${esc(signalTone)}</strong><small>${signals.length ? esc(signals.slice(0, 2).join(' · ')) : '과도한 경고 없음'}</small></article>
          <article class="sports-support-card"><span>운영</span><strong>${esc(stakeText)}</strong><small>${esc(riskText(study.bankroll.mode))} · ${esc(study.marketVol.grade)}</small></article>
          <article class="sports-support-card"><span>추가 체크</span><strong>${esc(study.bestEdge.label)}</strong><small>${esc(engines.formatSignedPercent(study.bestEdge.ev.evRate * 100))} · 마진 ${cleanPercent(study.fair.margin * 100)}</small></article>
        </div>
        <div class="sports-support-block-grid">
          <section class="sports-support-block">
            <div class="sports-support-block-head"><strong>회피 신호</strong><span>${signals.length ? `${signals.length}개` : '양호'}</span></div>
            <ul>${(signals.length ? signals : ['과도한 회피 신호는 없지만 2순위와 격차는 같이 확인하세요.']).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </section>
          <section class="sports-support-block">
            <div class="sports-support-block-head"><strong>운영 메모</strong><span>${esc(study.confidence.label)}</span></div>
            <ul>${notes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </section>
        </div>
      </div>`;
  }

  function buildCompactResultHtml({ study, market, capital, engines, line }) {
    const marketLabel = MARKETS[market]?.label || '스포츠';
    const notes = sportsComment({ market, study, capital, line }).slice(0, 3);
    const visibleOutcomes = study.outcomes.slice(0, 3);
    return `
      <div class="sports-score-shell sports-score-shell--modal">
        <div class="sports-score-top">
          <div class="sports-score-copy">
            <strong>핵심 결과</strong>
            <span>${esc(marketLabel)}</span>
          </div>
          <small>북마진 ${cleanPercent(study.fair.margin * 100)}</small>
        </div>
        <div class="sports-summary-card">
          <span class="sports-summary-kicker">현재 포인트</span>
          <strong>${esc(`${study.bestProb.label} 공정확률 ${pct100(study.bestProb.probPct)}`)}</strong>
          <p>${esc(`${study.confidence.action} · ${study.bestEdge.label} 보정 EV ${engines.formatSignedPercent(study.bestEdge.ev.evRate * 100)}`)}</p>
        </div>
        <div class="sports-insight-grid sports-insight-grid--compact">
          <article class="sports-insight-card"><span>공정확률</span><strong>${esc(`${study.bestProb.label} ${pct100(study.bestProb.probPct)}`)}</strong><small>${esc(`공정오즈 ${study.bestProb.fairOdds.toFixed(2)}`)}</small></article>
          <article class="sports-insight-card"><span>기대값</span><strong>${esc(`${study.bestEdge.label} ${engines.formatSignedPercent(study.bestEdge.ev.evRate * 100)}`)}</strong><small>${esc(`격차 ${(study.confidence.edgeGap * 100).toFixed(1)}%p`)}</small></article>
          <article class="sports-insight-card"><span>운영</span><strong>${esc(capital ? money(study.bankroll.amount) : `${(study.bankroll.ratio * 100).toFixed(1)}%`)}</strong><small>${esc(`${riskText(study.bankroll.mode)} · ${study.confidence.action}`)}</small></article>
          <article class="sports-insight-card"><span>신뢰도</span><strong>${esc(`${Math.round(study.confidence.score)}점`)}</strong><small>${esc(study.lean.title)}</small></article>
        </div>
        <div class="sports-metric-list sports-metric-list--compact">
          ${visibleOutcomes.map((item) => `
            <div class="sports-metric sports-metric--row${item.label === '-' ? ' is-empty' : ''}">
              <div class="sports-metric-copy"><span>${esc(item.label)}</span><strong>${pct100(item.probPct)}</strong></div>
              <div class="sports-metric-track" aria-hidden="true"><i style="width:${Math.max(6, Math.min(100, item.probPct))}%"></i></div>
            </div>`).join('')}
        </div>
        <ul class="sports-notes-list sports-notes-list--compact">${notes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
      </div>`;
  }

  function buildModalHtml({ market, study, capital, engines, line, assistHtml }) {
    const title = `${MARKETS[market]?.label || '스포츠'} 분석 결과`;
    const mainHtml = buildCompactResultHtml({ study, market, capital, engines, line });
    return {
      title,
      html: `
        <div class="sports-modal-stack">
          <div class="sports-modal-callout"><strong>${esc(study.confidence.action)}</strong><span>신뢰도 ${Math.round(study.confidence.score)}점 · ${esc(study.lean.title)}</span></div>
          <div class="sports-modal-grid">
            <section class="sports-modal-pane sports-modal-pane--main">${mainHtml}</section>
            <section class="sports-modal-pane sports-modal-pane--assist">${assistHtml}</section>
          </div>
          <div class="sports-modal-foot"><a class="safety-link-btn ghost" href="/tools/ai-sports-odds-analysis/">상세 도구 열기</a></div>
        </div>`,
    };
  }

  function initSports() {
    const engines = E();
    const form = qs('[data-sports-mini-form]');
    const result = qs('[data-sports-mini-result]');
    const assist = qs('[data-sports-mini-assist]');
    const tabWrap = qs('[data-sports-tabs]');
    if (!form || !result || !tabWrap || !assist || !engines.fairProbability) return;

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
      renderAssistIdle(assist, label);
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
      const cleanLine = Number.isFinite(line) ? line : 0;
      const study = buildSportsStudy({ engines, market, odds, capital, riskMode, line: cleanLine, labels: cfg.resultLabels });
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
        const notes = sportsComment({ market, study, capital, line: cleanLine !== 0 ? cleanLine : '' });
        notesNode.innerHTML = notes.map((item) => `<li>${esc(item)}</li>`).join('');
      }
      renderAssistPanel({ assist, market, study, capital, engines, line: cleanLine !== 0 ? cleanLine : '' });
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
      const market = hiddenMarket.value || '1x2';
      const capital = Number(inputs.capital?.value || 0);
      const line = Number(inputs.line?.value || '');
      const modalPayload = buildModalHtml({
        market,
        study: lastStudy,
        capital,
        engines,
        line: Number.isFinite(line) && line !== 0 ? line : '',
        assistHtml: assist.innerHTML,
      });
      modal()?.open({ titleText: modalPayload.title, html: modalPayload.html });
    });

    applyMarket(hiddenMarket.value || '1x2');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSports); else initSports();
})();
