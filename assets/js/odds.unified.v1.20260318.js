(() => {
  const widgets = document.querySelectorAll('.odds-widget');
  if (!widgets.length) return;

  const MARKET_NAMES = {
    '1x2': '승무패',
    moneyline: '승패',
    ou: '오버·언더',
    hcp: '핸디캡'
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parseOdds(value) {
    const num = Number(String(value || '').replace(/,/g, '.'));
    return Number.isFinite(num) && num > 1 ? num : null;
  }

  function parseLine(value) {
    if (value == null || value === '') return null;
    const num = Number(String(value).replace(/,/g, '.').trim());
    return Number.isFinite(num) ? num : null;
  }

  function formatPct(num, digits = 1) {
    return `${(num * 100).toFixed(digits)}%`;
  }

  function formatOdds(num) {
    return Number.isFinite(num) ? num.toFixed(2) : '-';
  }

  function formatNum(num, digits = 2) {
    return Number.isFinite(num) ? num.toFixed(digits) : '-';
  }

  function buildOutcomes(market, values, lineLabel) {
    if (market === '1x2') return [
      { key: 'home', label: '홈 승', odds: parseOdds(values.home) },
      { key: 'draw', label: '무승부', odds: parseOdds(values.draw) },
      { key: 'away', label: '원정 승', odds: parseOdds(values.away) }
    ];
    if (market === 'ou') return [
      { key: 'over', label: `오버 ${lineLabel || '기준점'}`, odds: parseOdds(values.over) },
      { key: 'under', label: `언더 ${lineLabel || '기준점'}`, odds: parseOdds(values.under) }
    ];
    if (market === 'hcp') return [
      { key: 'home', label: `홈 ${lineLabel || '핸디'}`, odds: parseOdds(values.home) },
      { key: 'away', label: `원정 ${lineLabel || '핸디'}`, odds: parseOdds(values.away) }
    ];
    return [
      { key: 'home', label: '홈 승', odds: parseOdds(values.home) },
      { key: 'away', label: '원정 승', odds: parseOdds(values.away) }
    ];
  }

  function calculateEntropy(probabilities) {
    const n = probabilities.length;
    if (!n || n === 1) return 0;
    const entropy = -probabilities.reduce((sum, p) => {
      if (!p) return sum;
      return sum + p * Math.log(p);
    }, 0);
    return entropy / Math.log(n);
  }

  function marginState(overround) {
    if (overround <= 0.03) return { text: '낮음', cls: 'ok' };
    if (overround <= 0.055) return { text: '보통', cls: 'warn' };
    return { text: '높음', cls: 'danger' };
  }

  function marginScore(overround) {
    return Math.round(clamp(100 - overround * 900, 0, 100));
  }

  function clarityScore(market, gap) {
    const base = market === '1x2' ? 0.12 : 0.18;
    return Math.round(clamp((gap / base) * 100, 0, 100));
  }

  function directionalScore(entropy) {
    return Math.round(clamp((1 - entropy) * 125, 0, 100));
  }

  function lineScore(market, lineNumber) {
    if (market !== 'ou' && market !== 'hcp') return 100;
    if (lineNumber == null) return 0;
    return 100;
  }

  function calculateEngine(market, outcomes, lineValue) {
    const implied = outcomes.map((item) => 1 / item.odds);
    const total = implied.reduce((sum, value) => sum + value, 0);
    const fairProb = implied.map((value) => value / total);
    const fairOdds = fairProb.map((value) => 1 / value);
    const overround = Math.max(0, total - 1);
    const entropy = calculateEntropy(fairProb);
    const sorted = fairProb
      .map((p, index) => ({ p, index }))
      .sort((a, b) => b.p - a.p);
    const top = sorted[0];
    const second = sorted[1] || sorted[0];
    const gap = top.p - second.p;
    const marginClean = marginScore(overround);
    const clarity = clarityScore(market, gap);
    const directional = directionalScore(entropy);
    const lineClean = lineScore(market, lineValue);
    const composite = Math.round(
      market === '1x2'
        ? marginClean * 0.34 + clarity * 0.38 + directional * 0.28
        : market === 'moneyline'
        ? marginClean * 0.42 + clarity * 0.40 + directional * 0.18
        : marginClean * 0.35 + clarity * 0.28 + directional * 0.17 + lineClean * 0.20
    );

    return {
      implied,
      total,
      fairProb,
      fairOdds,
      overround,
      entropy,
      topIndex: top.index,
      topProb: top.p,
      secondProb: second.p,
      gap,
      marginClean,
      clarity,
      directional,
      lineClean,
      composite
    };
  }

  function getState(engine) {
    if (engine.overround > 0.065) {
      return { label: '재확인', cls: 'danger' };
    }
    if (engine.composite >= 78 && engine.gap >= 0.08) {
      return { label: '우세 명확', cls: 'ok' };
    }
    if (engine.composite >= 58) {
      return { label: '체크 가능', cls: 'warn' };
    }
    return { label: '보수 접근', cls: 'warn' };
  }

  function getPressureLabel(market, topProb, entropy, gap) {
    if (market === '1x2') {
      if (topProb >= 0.50 && gap >= 0.08) return '단일 우세';
      if (topProb < 0.42 && entropy > 0.94) return '분산형';
      return '혼합형';
    }
    if (topProb >= 0.56) return '강한 압력';
    if (topProb >= 0.52) return '우세 압력';
    if (entropy > 0.97) return '균형 압력';
    return '미세 압력';
  }

  function lineComment(market, lineValue) {
    if (market !== 'ou' && market !== 'hcp') return '기준점 없는 시장입니다.';
    if (lineValue == null) return '기준점을 넣어야 같은 시장인지 판단할 수 있습니다.';
    return `${MARKET_NAMES[market]} 시장은 기준점 ${lineValue > 0 ? '+' : ''}${formatNum(lineValue, 2)} 자체가 해석의 일부입니다.`;
  }

  function actionLine(market, engine, outcomes, lineValue) {
    const leader = outcomes[engine.topIndex]?.label || '-';
    if (engine.overround > 0.065) {
      return '마진이 높은 편이라 같은 시장의 다른 가격과 비교한 뒤 판단하는 쪽이 더 안전합니다.';
    }
    if (market === '1x2' && engine.topProb < 0.42 && engine.entropy > 0.94) {
      return '승무패 분포가 넓게 퍼져 있습니다. 한 방향 몰빵보다 관찰 또는 회피가 더 나은 구간입니다.';
    }
    if ((market === 'ou' || market === 'hcp') && lineValue == null) {
      return '기준점이 비어 있으면 오버·언더/핸디캡은 정확한 해석이 어렵습니다.';
    }
    if (engine.composite >= 78 && engine.gap >= 0.08) {
      return `${leader} 쪽 압력이 상대적으로 또렷합니다. 다만 진입 전 라인업·결장·일정 변수는 다시 확인하는 편이 좋습니다.`;
    }
    if (engine.composite >= 58) {
      return '가격 구조는 읽히지만 강한 한쪽 신호라고 보긴 이릅니다. 단위 축소나 관찰 위주가 무난합니다.';
    }
    return '가격과 분포가 애매한 구간입니다. 손절 기준 없이 억지 진입하는 쪽은 비효율적일 수 있습니다.';
  }

  function noviceLine(market, engine) {
    if (engine.overround > 0.065) {
      return '초보자는 마진이 큰 시장보다 더 깨끗한 가격대부터 찾는 편이 좋습니다.';
    }
    if (market === '1x2' && engine.entropy > 0.94) {
      return '승무패가 균형에 가까우면 “배당이 높다”는 이유만으로 방향을 정하기 어렵습니다.';
    }
    if ((market === 'ou' || market === 'hcp')) {
      return '기준점 시장은 숫자를 먼저 읽고 그다음 가격을 봐야 오류가 줄어듭니다.';
    }
    return '짧은 배당이 자동으로 안전한 것은 아닙니다. 단위와 종료 기준을 먼저 잡고 보는 쪽이 낫습니다.';
  }

  function formulaLine(market, engine) {
    const linePart = market === 'ou' || market === 'hcp'
      ? `기준점 체크 ${engine.lineClean}`
      : '기준점 체크 100';
    return `공정확률=(1/배당)÷Σ(1/배당), 정보량=엔트로피, 종합점수=${engine.marginClean}·${engine.clarity}·${engine.directional}·${linePart}`;
  }

  function marketGuide(market) {
    if (market === '1x2') return '승무패는 홈·무·원정 3개 배당이 모두 필요합니다.';
    if (market === 'moneyline') return '승패는 양쪽 가격 차이와 마진 청결도를 함께 봅니다.';
    if (market === 'ou') return '오버·언더는 기준점과 양쪽 가격이 함께 있어야 같은 시장으로 읽을 수 있습니다.';
    return '핸디캡은 기준점 방향과 양쪽 가격을 같이 읽어야 해석이 닫힙니다.';
  }

  function emptyStateText(market) {
    if (market === '1x2') return '홈·무·원정 배당 3개를 모두 입력하면 결과가 계산됩니다.';
    if (market === 'moneyline') return '홈·원정 배당 2개를 모두 입력하면 결과가 계산됩니다.';
    if (market === 'ou') return '기준점, 오버, 언더 값을 넣으면 결과가 계산됩니다.';
    return '기준점, 홈 핸디, 원정 핸디 값을 넣으면 결과가 계산됩니다.';
  }

  function render(widget) {
    const market = widget.querySelector('[data-field="market"]')?.value || '1x2';
    const lineRaw = widget.querySelector('[data-field="line"]')?.value?.trim() || '';
    const lineNumber = parseLine(lineRaw);
    const lineLabel = lineRaw || '';
    const values = {
      home: widget.querySelector('[data-field="home"]')?.value,
      draw: widget.querySelector('[data-field="draw"]')?.value,
      away: widget.querySelector('[data-field="away"]')?.value,
      over: widget.querySelector('[data-field="over"]')?.value,
      under: widget.querySelector('[data-field="under"]')?.value
    };

    const outcomes = buildOutcomes(market, values, lineLabel).filter((item) => item.odds);
    const result = widget.querySelector('[data-role="result"]');
    if (!result) return;

    const needed = market === '1x2' ? 3 : 2;
    const needsLine = market === 'ou' || market === 'hcp';
    if (outcomes.length < needed || (needsLine && lineNumber == null)) {
      result.innerHTML = `<div class="empty-state">${emptyStateText(market)}</div>`;
      return;
    }

    const engine = calculateEngine(market, outcomes, lineNumber);
    const state = getState(engine);
    const pressure = getPressureLabel(market, engine.topProb, engine.entropy, engine.gap);
    const margin = marginState(engine.overround);

    const outcomeHtml = outcomes.map((item, index) => `
      <div class="outcome-item">
        <div>
          <b>${item.label}</b>
          <small>입력 ${formatOdds(item.odds)} · 공정 ${formatOdds(engine.fairOdds[index])}</small>
        </div>
        <div class="outcome-metrics">
          <span>확률 ${formatPct(engine.fairProb[index])}</span>
        </div>
      </div>`).join('');

    result.innerHTML = `
      <div class="result-topline">
        <div class="result-status ${state.cls}">${state.label}</div>
        <div class="meta-line">
          <span class="meta-pill">시장 ${MARKET_NAMES[market]}</span>
          ${needsLine ? `<span class="meta-pill">기준점 ${lineLabel}</span>` : ''}
          <span class="meta-pill">압력 ${pressure}</span>
        </div>
      </div>
      <div class="kpi-grid analysis-kpi-grid">
        <div class="kpi">
          <b>종합 점수</b>
          <strong>${engine.composite}</strong>
          <span>가격·분포·기준점 조합</span>
        </div>
        <div class="kpi">
          <b>시장 마진</b>
          <strong>${(engine.overround * 100).toFixed(2)}%</strong>
          <span>${margin.text} · 청결도 ${engine.marginClean}</span>
        </div>
        <div class="kpi">
          <b>우세 격차</b>
          <strong>${formatPct(engine.gap)}</strong>
          <span>${outcomes[engine.topIndex]?.label || '-'} 우세</span>
        </div>
        <div class="kpi">
          <b>정보량</b>
          <strong>${Math.round(engine.entropy * 100)}</strong>
          <span>분산도 기준</span>
        </div>
      </div>
      <div class="outcome-list">${outcomeHtml}</div>
      <div class="brief-box brief-box-tight">
        <b>간단 해석</b>
        <div>${actionLine(market, engine, outcomes, lineNumber)}</div>
      </div>
      <div class="brief-box brief-box-muted">
        <b>초보 체크</b>
        <div>${noviceLine(market, engine)}</div>
      </div>
      <div class="brief-box brief-box-plain">
        <b>계산 기준</b>
        <div>${formulaLine(market, engine)}</div>
        <small class="result-small">${lineComment(market, lineNumber)}</small>
      </div>`;
  }

  widgets.forEach((widget) => {
    const marketField = widget.querySelector('[data-field="market"]');
    const drawField = widget.querySelector('[data-wrap="draw"]');
    const lineField = widget.querySelector('[data-wrap="line"]');
    const lineInput = widget.querySelector('[data-field="line"]');
    const secondaryOver = widget.querySelector('[data-wrap="over"]');
    const secondaryUnder = widget.querySelector('[data-wrap="under"]');
    const awayWrap = widget.querySelector('[data-wrap="away"]');
    const homeInput = widget.querySelector('[data-field="home"]');
    const awayInput = widget.querySelector('[data-field="away"]');
    const drawInput = widget.querySelector('[data-field="draw"]');
    const overInput = widget.querySelector('[data-field="over"]');
    const underInput = widget.querySelector('[data-field="under"]');
    const homeLabel = widget.querySelector('[data-label="home"]');
    const awayLabel = widget.querySelector('[data-label="away"]');
    const lineLabel = widget.querySelector('[data-label="line"]');
    const helper = widget.querySelector('[data-role="helper"]');

    function clearInactive(market) {
      if (market === '1x2') {
        if (lineInput) lineInput.value = '';
        if (overInput) overInput.value = '';
        if (underInput) underInput.value = '';
      } else if (market === 'moneyline') {
        if (lineInput) lineInput.value = '';
        if (drawInput) drawInput.value = '';
        if (overInput) overInput.value = '';
        if (underInput) underInput.value = '';
      } else if (market === 'ou') {
        if (homeInput) homeInput.value = '';
        if (awayInput) awayInput.value = '';
        if (drawInput) drawInput.value = '';
      } else if (market === 'hcp') {
        if (drawInput) drawInput.value = '';
        if (overInput) overInput.value = '';
        if (underInput) underInput.value = '';
      }
    }

    function toggleWrap(node, show) {
      if (!node) return;
      node.hidden = !show;
      node.style.display = show ? '' : 'none';
    }

    function syncFields(resetUnused = false) {
      const market = marketField?.value || '1x2';
      const is1x2 = market === '1x2';
      const isMoneyline = market === 'moneyline';
      const isOU = market === 'ou';
      const isHcp = market === 'hcp';

      if (resetUnused) clearInactive(market);

      toggleWrap(drawField, is1x2);
      toggleWrap(lineField, isOU || isHcp);
      toggleWrap(secondaryOver, isOU);
      toggleWrap(secondaryUnder, isOU);
      toggleWrap(awayWrap, !isOU);
      const homeWrap = homeInput?.closest('.field');
      toggleWrap(homeWrap, !isOU);

      if (homeLabel) homeLabel.textContent = isHcp ? '홈 핸디 배당' : '홈 배당';
      if (awayLabel) awayLabel.textContent = isHcp ? '원정 핸디 배당' : '원정 배당';
      if (lineLabel) lineLabel.textContent = isOU ? '기준점' : '핸디 기준점';

      if (homeInput) homeInput.placeholder = isHcp ? '예: 2.05' : '예: 1.92';
      if (awayInput) awayInput.placeholder = isHcp ? '예: 1.80' : '예: 2.05';
      if (lineInput) lineInput.placeholder = isOU ? '예: 2.5' : '예: -1.5';
      if (helper) helper.textContent = marketGuide(market);

      render(widget);
    }

    widget.addEventListener('input', () => render(widget));
    marketField?.addEventListener('change', () => syncFields(true));

    widget.querySelector('[data-action="fill-demo"]')?.addEventListener('click', () => {
      const market = marketField?.value || '1x2';
      widget.querySelectorAll('input').forEach((input) => { input.value = ''; });
      if (market === '1x2') {
        if (homeInput) homeInput.value = '2.04';
        if (drawInput) drawInput.value = '3.32';
        if (awayInput) awayInput.value = '3.65';
      } else if (market === 'moneyline') {
        if (homeInput) homeInput.value = '1.76';
        if (awayInput) awayInput.value = '2.08';
      } else if (market === 'ou') {
        if (lineInput) lineInput.value = '2.5';
        if (overInput) overInput.value = '1.92';
        if (underInput) underInput.value = '1.94';
      } else {
        if (lineInput) lineInput.value = '-1.5';
        if (homeInput) homeInput.value = '2.05';
        if (awayInput) awayInput.value = '1.80';
      }
      render(widget);
    });

    widget.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      widget.querySelectorAll('input').forEach((input) => { input.value = ''; });
      render(widget);
    });

    syncFields();
  });
})();
