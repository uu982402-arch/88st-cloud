
(() => {
  const widgets = document.querySelectorAll('.odds-widget');
  if (!widgets.length) return;

  function parseOdds(value) {
    const num = Number(String(value || '').replace(/,/g, '.'));
    return Number.isFinite(num) && num > 1 ? num : null;
  }

  function formatPct(num) {
    return `${(num * 100).toFixed(1)}%`;
  }

  function formatOdds(num) {
    return num ? num.toFixed(2) : '-';
  }

  function buildOutcomes(market, values, lineValue) {
    if (market === '1x2') return [
      { key:'home', label:'홈 승', odds:parseOdds(values.home) },
      { key:'draw', label:'무승부', odds:parseOdds(values.draw) },
      { key:'away', label:'원정 승', odds:parseOdds(values.away) }
    ];
    if (market === 'ou') return [
      { key:'over', label:`오버 ${lineValue || '기준점'}`, odds:parseOdds(values.over) },
      { key:'under', label:`언더 ${lineValue || '기준점'}`, odds:parseOdds(values.under) }
    ];
    if (market === 'hcp') return [
      { key:'home', label:`홈 ${lineValue || '핸디'}`, odds:parseOdds(values.home) },
      { key:'away', label:`원정 ${lineValue || '핸디'}`, odds:parseOdds(values.away) }
    ];
    return [
      { key:'home', label:'홈 승', odds:parseOdds(values.home) },
      { key:'away', label:'원정 승', odds:parseOdds(values.away) }
    ];
  }

  function concentrationLabel(top) {
    if (top >= 0.60) return '한쪽 쏠림';
    if (top >= 0.48) return '우세 구간';
    return '균형 구간';
  }

  function marginLabel(overround) {
    if (overround <= 0.025) return { text:'낮음', state:'ok' };
    if (overround <= 0.055) return { text:'보통', state:'warn' };
    return { text:'높음', state:'danger' };
  }

  function actionLine(overround, topProb, market) {
    if (overround > 0.055) return '마진이 큰 편이라 같은 시장의 다른 가격과 함께 재확인하는 쪽이 안전합니다.';
    if (topProb >= 0.60) return '한쪽으로 많이 기운 시장입니다. 접근한다면 단일 판단보다 기준점과 부상·라인업 변수를 먼저 다시 확인하는 편이 좋습니다.';
    if (market === 'ou' || market === 'hcp') return '기준점 시장은 숫자 자체가 해석의 핵심입니다. 같은 배당이어도 기준점이 달라지면 완전히 다른 시장으로 봐야 합니다.';
    return '구조상 과열은 크지 않습니다. 다만 확률 차이가 작을수록 진입보다 관찰이 더 유리할 수 있습니다.';
  }

  function noviceLine(overround, topProb) {
    if (overround > 0.055) return '초보자는 이 구간을 억지로 잡기보다 가격이 더 깨끗한 시장을 찾는 편이 좋습니다.';
    if (topProb >= 0.58) return '배당이 낮다고 안전한 시장은 아닙니다. 한쪽 우세 구간은 수익 대비 리스크가 작지 않을 수 있습니다.';
    return '배당 구조가 균형형에 가깝습니다. 방향성보다 손절 기준과 베팅 단위부터 먼저 정해 두는 쪽이 낫습니다.';
  }

  function render(widget) {
    const market = widget.querySelector('[data-field="market"]')?.value || '1x2';
    const lineValue = widget.querySelector('[data-field="line"]')?.value?.trim() || '';
    const values = {
      home: widget.querySelector('[data-field="home"]')?.value,
      draw: widget.querySelector('[data-field="draw"]')?.value,
      away: widget.querySelector('[data-field="away"]')?.value,
      over: widget.querySelector('[data-field="over"]')?.value,
      under: widget.querySelector('[data-field="under"]')?.value,
    };
    const outcomes = buildOutcomes(market, values, lineValue).filter((item) => item.odds);
    const result = widget.querySelector('[data-role="result"]');
    if (!result) return;
    const needed = market === '1x2' ? 3 : 2;
    if (outcomes.length < needed) {
      result.innerHTML = '<div class="empty-state">배당을 모두 입력하면 공정확률, 공정배당, 시장 마진, 간단 해석이 바로 계산됩니다.</div>';
      return;
    }

    const implied = outcomes.map((item) => 1 / item.odds);
    const total = implied.reduce((sum, value) => sum + value, 0);
    const fair = implied.map((value) => value / total);
    const fairOdds = fair.map((value) => 1 / value);
    const overround = Math.max(0, total - 1);
    const topProb = Math.max(...fair);
    const topIndex = fair.indexOf(topProb);
    const margin = marginLabel(overround);
    const state = overround > 0.055 ? '재확인' : topProb > 0.60 ? '주의' : '무난';

    const outcomeHtml = outcomes.map((item, index) => {
      return `
        <div class="outcome-item">
          <div>
            <b>${item.label}</b>
            <small>입력 배당 ${formatOdds(item.odds)}</small>
          </div>
          <div class="outcome-metrics">
            <span>공정확률 ${formatPct(fair[index])}</span>
            <span>공정배당 ${formatOdds(fairOdds[index])}</span>
          </div>
        </div>`;
    }).join('');

    result.innerHTML = `
      <div class="result-topline">
        <div class="result-status ${margin.state}">${state}</div>
        <div class="meta-line">
          <span class="meta-pill">시장: ${market === '1x2' ? '승무패' : market === 'moneyline' ? '승패' : market === 'ou' ? '오버·언더' : '핸디캡'}</span>
          ${lineValue && (market === 'ou' || market === 'hcp') ? `<span class="meta-pill">기준점 ${lineValue}</span>` : ''}
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi">
          <b>시장 마진</b>
          <strong>${(overround * 100).toFixed(2)}%</strong>
          <span>${margin.text}</span>
        </div>
        <div class="kpi">
          <b>시장 균형도</b>
          <strong>${concentrationLabel(topProb)}</strong>
          <span>최대 공정확률 ${formatPct(topProb)}</span>
        </div>
        <div class="kpi">
          <b>현재 우세</b>
          <strong>${outcomes[topIndex]?.label || '-'}</strong>
          <span>가격보다 구조 해석이 먼저입니다</span>
        </div>
      </div>
      <div class="outcome-list">${outcomeHtml}</div>
      <div class="brief-box">
        <b>간단 해석</b>
        <div>${actionLine(overround, topProb, market)}</div>
      </div>
      <div class="brief-box" style="margin-top:10px;background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.06)">
        <b>초보 체크</b>
        <div>${noviceLine(overround, topProb)}</div>
      </div>`;
  }

  widgets.forEach((widget) => {
    const marketField = widget.querySelector('[data-field="market"]');
    const drawField = widget.querySelector('[data-wrap="draw"]');
    const lineField = widget.querySelector('[data-wrap="line"]');
    const secondaryOver = widget.querySelector('[data-wrap="over"]');
    const secondaryUnder = widget.querySelector('[data-wrap="under"]');
    const awayWrap = widget.querySelector('[data-wrap="away"]');
    const homeLabel = widget.querySelector('[data-label="home"]');
    const awayLabel = widget.querySelector('[data-label="away"]');
    const helper = widget.querySelector('[data-role="helper"]');

    function syncFields() {
      const market = marketField?.value || '1x2';
      const is1x2 = market === '1x2';
      const isMoneyline = market === 'moneyline';
      const isOU = market === 'ou';
      const isHcp = market === 'hcp';
      if (drawField) drawField.hidden = !is1x2;
      if (lineField) lineField.hidden = !(isOU || isHcp);
      if (secondaryOver) secondaryOver.hidden = !(isOU);
      if (secondaryUnder) secondaryUnder.hidden = !(isOU);
      if (awayWrap) awayWrap.hidden = isOU;
      if (homeLabel) homeLabel.textContent = isOU ? '오버 배당' : (isHcp ? '홈 핸디 배당' : '홈 배당');
      if (awayLabel) awayLabel.textContent = isHcp ? '원정 핸디 배당' : '원정 배당';
      if (helper) {
        helper.textContent = is1x2
          ? '승무패는 3개 배당을 모두 넣으면 균형도와 공정배당을 바로 계산합니다.'
          : isMoneyline
          ? '승패 시장은 두 개 배당만 입력하면 됩니다.'
          : isOU
          ? '오버·언더는 기준점과 양쪽 배당을 함께 입력해야 구조가 정확해집니다.'
          : '핸디캡은 기준점과 양쪽 배당을 함께 보아야 같은 시장인지 판단할 수 있습니다.';
      }
      render(widget);
    }

    widget.addEventListener('input', () => render(widget));
    widget.addEventListener('change', syncFields);
    widget.querySelector('[data-action="fill-demo"]')?.addEventListener('click', () => {
      const market = marketField?.value || '1x2';
      if (market === '1x2') {
        widget.querySelector('[data-field="home"]').value = '2.04';
        widget.querySelector('[data-field="draw"]').value = '3.32';
        widget.querySelector('[data-field="away"]').value = '3.65';
      } else if (market === 'moneyline') {
        widget.querySelector('[data-field="home"]').value = '1.76';
        widget.querySelector('[data-field="away"]').value = '2.08';
      } else if (market === 'ou') {
        widget.querySelector('[data-field="line"]').value = '2.5';
        widget.querySelector('[data-field="over"]').value = '1.92';
        widget.querySelector('[data-field="under"]').value = '1.94';
      } else {
        widget.querySelector('[data-field="line"]').value = '-1.5';
        widget.querySelector('[data-field="home"]').value = '2.05';
        widget.querySelector('[data-field="away"]').value = '1.80';
      }
      render(widget);
    });
    widget.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      widget.querySelectorAll('input').forEach((input) => input.value = '');
      render(widget);
    });

    syncFields();
  });
})();
