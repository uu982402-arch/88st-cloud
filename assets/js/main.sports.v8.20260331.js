
(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const clamp = (n) => Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  const pct = (n) => `${clamp(n).toFixed(1)}%`;

  const MARKETS = {
    '1x2': {
      label: '승·무·패',
      fields: ['home','draw','away'],
      labels: { home:'홈 배당', draw:'무 배당', away:'원정 배당' },
      resultLabels: ['홈','무','원정'],
      note: '승·무·패 배당 3개를 넣으면 정규화 확률을 바로 보여줍니다.'
    },
    moneyline: {
      label: '승·패',
      fields: ['home','away'],
      labels: { home:'홈 배당', away:'원정 배당' },
      resultLabels: ['홈','원정'],
      note: '승·패 배당 2개를 넣으면 양쪽 확률을 바로 보여줍니다.'
    },
    ou: {
      label: '언더·오버',
      fields: ['line','over','under'],
      labels: { line:'기준점', over:'오버 배당', under:'언더 배당' },
      resultLabels: ['오버','언더'],
      note: '기준점과 오버·언더 배당을 넣으면 양쪽 확률을 정리합니다.'
    },
    hcp: {
      label: '핸디캡',
      fields: ['line','home','away'],
      labels: { line:'기준점', home:'홈 배당', away:'원정 배당' },
      resultLabels: ['홈','원정'],
      note: '핸디 기준점과 양쪽 배당을 넣으면 확률을 정리합니다.'
    }
  };

  function normalizeProbabilities(odds) {
    const implied = odds.map(v => 1 / v);
    const total = implied.reduce((a,b)=>a+b,0);
    return { total, probs: implied.map(v => (v / total) * 100) };
  }

  function interpret(market, probs, total) {
    const margin = (total - 1) * 100;
    if (!probs.length) return '값을 입력하면 결과가 자동으로 계산됩니다.';
    const [a,b,c] = probs;
    if (market === '1x2') {
      if (a >= 46) return `마진 ${margin.toFixed(1)}% · 홈 우세가 비교적 선명합니다.`;
      if (c >= 46) return `마진 ${margin.toFixed(1)}% · 원정 우세가 비교적 선명합니다.`;
      if (b >= 30) return `마진 ${margin.toFixed(1)}% · 무승부 비중이 다소 높습니다.`;
      return `마진 ${margin.toFixed(1)}% · 한쪽으로 크게 기울지 않은 구간입니다.`;
    }
    if (market === 'moneyline' || market === 'hcp') {
      const high = Math.max(a,b);
      const side = a >= b ? '홈' : '원정';
      if (high >= 58) return `마진 ${margin.toFixed(1)}% · ${side} 쪽 확률이 높게 잡힙니다.`;
      return `마진 ${margin.toFixed(1)}% · 양쪽이 크게 벌어지지 않은 구간입니다.`;
    }
    if (market === 'ou') {
      const side = a >= b ? '오버' : '언더';
      const high = Math.max(a,b);
      if (high >= 55) return `마진 ${margin.toFixed(1)}% · ${side} 쪽이 조금 더 우세합니다.`;
      return `마진 ${margin.toFixed(1)}% · 오버·언더가 비교적 비슷합니다.`;
    }
    return `마진 ${margin.toFixed(1)}% · 입력값을 기준으로 자동 계산했습니다.`;
  }

  function initSports() {
    const form = qs('[data-sports-mini-form]');
    const result = qs('[data-sports-mini-result]');
    const tabWrap = qs('[data-sports-tabs]');
    if (!form || !result || !tabWrap) return;

    const hiddenMarket = qs('input[name="market"]', form);
    const fieldMap = {
      line: qs('[data-wrap="line"]', form),
      home: qs('[data-wrap="home"]', form),
      draw: qs('[data-wrap="draw"]', form),
      away: qs('[data-wrap="away"]', form),
      over: qs('[data-wrap="over"]', form),
      under: qs('[data-wrap="under"]', form)
    };
    const inputs = {
      line: qs('[data-field="line"]', form),
      home: qs('[data-field="home"]', form),
      draw: qs('[data-field="draw"]', form),
      away: qs('[data-field="away"]', form),
      over: qs('[data-field="over"]', form),
      under: qs('[data-field="under"]', form)
    };

    function setMetricLabels(labels) {
      const metricLabels = qsa('.sports-metric span', result);
      metricLabels.forEach((node, idx) => { node.textContent = labels[idx] || '-'; });
    }

    function resetResult(note, marketLabel) {
      const vals = qsa('.sports-metric strong', result);
      vals.forEach((n) => { n.textContent = '-'; });
      const head = qs('.sports-score-top span', result);
      const noteNode = qs('.sports-note', result);
      if (head) head.textContent = marketLabel || '승·무·패';
      if (noteNode) noteNode.textContent = note || '값을 입력하면 결과가 자동으로 계산됩니다.';
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
      if (market === '1x2') setMetricLabels(['홈','무','원정']);
      if (market === 'moneyline' || market === 'hcp') setMetricLabels(['홈','원정','-']);
      if (market === 'ou') setMetricLabels(['오버','언더','-']);
      resetResult(cfg.note, cfg.label);
      compute();
    }

    function validOdds(vals) {
      return vals.every(v => Number.isFinite(v) && v >= 1.02);
    }

    function compute() {
      const market = hiddenMarket.value || '1x2';
      const cfg = MARKETS[market] || MARKETS['1x2'];
      const activeOdds = cfg.fields.filter(k => k !== 'line').map(k => Number(inputs[k]?.value || ''));
      const head = qs('.sports-score-top span', result);
      const noteNode = qs('.sports-note', result);
      const vals = qsa('.sports-metric strong', result);
      if (head) head.textContent = cfg.label;
      if (!validOdds(activeOdds)) {
        resetResult(cfg.note, cfg.label);
        return;
      }
      const { total, probs } = normalizeProbabilities(activeOdds);
      vals.forEach((node, idx) => { node.textContent = probs[idx] != null ? pct(probs[idx]) : '-'; });
      if (noteNode) noteNode.textContent = interpret(market, probs, total);
    }

    qsa('[data-market]', tabWrap).forEach(btn => btn.addEventListener('click', () => applyMarket(btn.dataset.market || '1x2')));
    Object.values(inputs).forEach(input => { if (input) input.addEventListener('input', compute); });
    form.addEventListener('submit', (e) => { e.preventDefault(); compute(); });
    applyMarket(hiddenMarket.value || '1x2');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSports); else initSports();
})();
