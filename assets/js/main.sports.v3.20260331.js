(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const MARKET_CONFIG = {
    '1x2': {
      label: '승·무·패',
      show: ['home', 'draw', 'away'],
      labels: { home: '홈 배당', draw: '무 배당', away: '원정 배당' },
      placeholders: { home: '예: 2.10', draw: '예: 3.25', away: '예: 3.40' },
      outcomes: () => [{ key: 'home', label: '홈' }, { key: 'draw', label: '무' }, { key: 'away', label: '원정' }],
      empty: '승·무·패 배당 3개를 넣으면 결과가 자동 계산됩니다.'
    },
    moneyline: {
      label: '승·패',
      show: ['home', 'away'],
      labels: { home: '홈 배당', away: '원정 배당' },
      placeholders: { home: '예: 1.85', away: '예: 2.05' },
      outcomes: () => [{ key: 'home', label: '홈' }, { key: 'away', label: '원정' }],
      empty: '승·패 배당 2개를 넣으면 결과가 자동 계산됩니다.'
    },
    ou: {
      label: '언더·오버',
      show: ['line', 'over', 'under'],
      labels: { line: '기준점', over: '오버 배당', under: '언더 배당' },
      placeholders: { line: '예: 2.5', over: '예: 1.92', under: '예: 1.94' },
      outcomes: (line) => [{ key: 'over', label: `오버 ${line}` }, { key: 'under', label: `언더 ${line}` }],
      empty: '기준점과 오버·언더 배당을 넣으면 결과가 자동 계산됩니다.'
    },
    hcp: {
      label: '핸디캡',
      show: ['line', 'home', 'away'],
      labels: { line: '기준점', home: '홈 배당', away: '원정 배당' },
      placeholders: { line: '예: -1.5', home: '예: 1.91', away: '예: 1.95' },
      outcomes: (line) => [{ key: 'home', label: `홈 ${line}` }, { key: 'away', label: `원정 ${line}` }],
      empty: '기준점과 홈·원정 핸디 배당을 넣으면 결과가 자동 계산됩니다.'
    }
  };

  const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;
  const parseOdd = (value) => {
    const num = Number(String(value || '').replace(/,/g, '.').trim());
    return Number.isFinite(num) && num > 1.01 ? num : null;
  };
  const parseLine = (value) => {
    const num = Number(String(value || '').replace(/,/g, '.').trim());
    return Number.isFinite(num) ? num : null;
  };

  function normalize(odds) {
    const implied = odds.map((n) => 1 / n);
    const sum = implied.reduce((a, b) => a + b, 0);
    return { probs: implied.map((p) => p / sum), overround: sum - 1 };
  }

  function verdict(gap, overround, market, lineValue) {
    if (overround > 0.09) return '마진이 높은 구간입니다. 참고용으로만 보는 편이 낫습니다.';
    if ((market === 'ou' || market === 'hcp') && lineValue == null) return '기준점을 먼저 넣어야 같은 시장인지 판단하기 쉽습니다.';
    if (gap >= 0.12) return '우세가 비교적 또렷한 편입니다.';
    if (gap >= 0.06) return '우세는 보이지만 과신보다 보수 접근이 낫습니다.';
    return '확률 차이가 좁아 보수적으로 보는 편이 좋습니다.';
  }

  function renderDefault(result, market) {
    const config = MARKET_CONFIG[market];
    const labels = config.outcomes('기준').map((item) => item.label);
    result.innerHTML = `
      <div class="sports-score-shell">
        <div class="sports-score-top"><strong>입력 후 바로 확인</strong><span>${config.label}</span></div>
        <div class="sports-metric-grid">
          ${labels.map((label) => `<div class="sports-metric"><span>${label}</span><strong>-</strong></div>`).join('')}
        </div>
        <div class="sports-note">${config.empty}</div>
        <div class="sports-mini-links"><a href="/analysis/">분석기 전체 열기</a><a href="/guaranteed/">보증업체 보기</a></div>
      </div>`;
  }

  function initWidget() {
    const form = $('[data-sports-mini-form]');
    const result = $('[data-sports-mini-result]');
    const tabs = $$('[data-sports-tabs] .main-sports-market-btn');
    if (!form || !result || !tabs.length) return;

    const marketInput = $('[name="market"]', form);
    const wraps = {
      line: $('[data-wrap="line"]', form),
      home: $('[data-wrap="home"]', form),
      draw: $('[data-wrap="draw"]', form),
      away: $('[data-wrap="away"]', form),
      over: $('[data-wrap="over"]', form),
      under: $('[data-wrap="under"]', form)
    };
    const fields = {
      line: $('[data-field="line"]', form),
      home: $('[data-field="home"]', form),
      draw: $('[data-field="draw"]', form),
      away: $('[data-field="away"]', form),
      over: $('[data-field="over"]', form),
      under: $('[data-field="under"]', form)
    };

    function applyMarket(market) {
      const config = MARKET_CONFIG[market];
      marketInput.value = market;
      tabs.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.market === market));
      Object.entries(wraps).forEach(([key, wrap]) => {
        if (!wrap) return;
        const visible = config.show.includes(key);
        wrap.hidden = !visible;
        if (!visible && fields[key]) fields[key].value = '';
      });
      Object.entries(config.labels).forEach(([key, label]) => {
        const labelNode = wraps[key]?.querySelector('label');
        if (labelNode) labelNode.textContent = label;
      });
      Object.entries(config.placeholders).forEach(([key, placeholder]) => {
        if (fields[key]) fields[key].placeholder = placeholder;
      });
      renderDefault(result, market);
    }

    function update() {
      const market = marketInput.value || '1x2';
      const config = MARKET_CONFIG[market];
      const lineValue = config.show.includes('line') ? parseLine(fields.line?.value) : null;
      const outcomeDefs = config.outcomes(lineValue != null ? lineValue : '기준');
      const odds = [];
      const labels = [];

      for (const outcome of outcomeDefs) {
        const odd = parseOdd(fields[outcome.key]?.value);
        if (!odd) {
          renderDefault(result, market);
          return;
        }
        odds.push(odd);
        labels.push(outcome.label);
      }

      if (config.show.includes('line') && lineValue == null) {
        renderDefault(result, market);
        return;
      }

      const { probs, overround } = normalize(odds);
      const ranked = probs.map((prob, idx) => ({ prob, idx, label: labels[idx] })).sort((a, b) => b.prob - a.prob);
      const lead = ranked[0];
      const second = ranked[1] || ranked[0];
      const note = verdict(lead.prob - second.prob, overround, market, lineValue);

      result.innerHTML = `
        <div class="sports-score-shell">
          <div class="sports-score-top"><strong>${lead.label} 우세</strong><span>${config.label}</span></div>
          <div class="sports-metric-grid">
            ${labels.map((label, idx) => `<div class="sports-metric"><span>${label}</span><strong>${fmtPct(probs[idx])}</strong></div>`).join('')}
          </div>
          <div class="sports-note">마진 ${((overround + 1) * 100).toFixed(1)}% · ${note}</div>
          <div class="sports-mini-links"><a href="/analysis/">분석기 전체 열기</a><a href="/guaranteed/">보증업체 보기</a></div>
        </div>`;
    }

    tabs.forEach((btn) => btn.addEventListener('click', () => applyMarket(btn.dataset.market || '1x2')));
    form.addEventListener('input', update);
    form.addEventListener('submit', (e) => e.preventDefault());
    applyMarket('1x2');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWidget); else initWidget();
})();
