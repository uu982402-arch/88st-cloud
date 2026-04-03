(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;
  const implied = (odds) => 1 / odds;

  function normalizeProbabilities(values) {
    const probs = values.map(implied);
    const sum = probs.reduce((a, b) => a + b, 0);
    return { probs: probs.map((p) => p / sum), overround: sum };
  }

  function verdict(top, second, overround) {
    const edge = top - second;
    if (overround > 1.12) return '마진이 커서 기준선만 짧게 참고하는 편이 좋습니다.';
    if (edge >= 0.12) return '우세가 비교적 선명합니다.';
    if (edge >= 0.06) return '우세는 있지만 과신보다 분산 접근이 무난합니다.';
    return '확률 차이가 좁아 보수적으로 보는 편이 좋습니다.';
  }

  function emptyState() {
    return `
      <div class="sports-score-shell">
        <div class="sports-score-top"><strong>입력 후 바로 확인</strong><span>초간단 위젯</span></div>
        <div class="sports-metric-grid">
          <div class="sports-metric"><span>홈</span><strong>-</strong></div>
          <div class="sports-metric"><span>무</span><strong>-</strong></div>
          <div class="sports-metric"><span>원정</span><strong>-</strong></div>
        </div>
        <div class="sports-note">홈 · 무 · 원정 배당 3개를 입력하면 즉시 정규화 확률과 한 줄 해석이 표시됩니다.</div>
        <div class="sports-mini-links">
          <a href="/">분석기 전체 열기</a>
          <a href="/guaranteed/">보증업체 보기</a>
        </div>
      </div>`;
  }

  function invalidState() {
    return `
      <div class="sports-score-shell">
        <div class="sports-score-top"><strong>입력을 다시 확인해 주세요.</strong><span>배당은 1.02 이상</span></div>
        <div class="sports-note">세 칸 모두 숫자로 입력하면 결과가 자동 계산됩니다.</div>
        <div class="sports-mini-links">
          <a href="/">분석기 전체 열기</a>
          <a href="/guaranteed/">보증업체 보기</a>
        </div>
      </div>`;
  }

  function resultState(probs, overround) {
    const entries = [
      { key: '홈', prob: probs[0] },
      { key: '무', prob: probs[1] },
      { key: '원정', prob: probs[2] }
    ].sort((a, b) => b.prob - a.prob);
    const lead = entries[0];
    const next = entries[1];
    const note = verdict(lead.prob, next.prob, overround);
    return `
      <div class="sports-score-shell">
        <div class="sports-score-top"><strong>${lead.key} 우세</strong><span>정규화 기준</span></div>
        <div class="sports-metric-grid">
          <div class="sports-metric"><span>홈</span><strong>${fmtPct(probs[0])}</strong></div>
          <div class="sports-metric"><span>무</span><strong>${fmtPct(probs[1])}</strong></div>
          <div class="sports-metric"><span>원정</span><strong>${fmtPct(probs[2])}</strong></div>
        </div>
        <div class="sports-note">마진 ${(overround * 100).toFixed(1)}% · ${note}</div>
        <div class="sports-mini-links">
          <a href="/">분석기 전체 열기</a>
          <a href="/guaranteed/">보증업체 보기</a>
        </div>
      </div>`;
  }

  function initWidget() {
    const form = $('[data-sports-mini-form]');
    const result = $('[data-sports-mini-result]');
    if (!form || !result) return;
    const inputs = ['home', 'draw', 'away'].map((name) => $(`[name="${name}"]`, form));

    const render = () => {
      const rawValues = inputs.map((input) => String(input.value || '').trim());
      if (rawValues.every((v) => !v)) {
        result.innerHTML = emptyState();
        return;
      }
      const values = rawValues.map((v) => Number(v));
      if (values.some((v) => !Number.isFinite(v) || v <= 1.01)) {
        result.innerHTML = invalidState();
        return;
      }
      const { probs, overround } = normalizeProbabilities(values);
      result.innerHTML = resultState(probs, overround);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      render();
    });

    inputs.forEach((input) => {
      input.addEventListener('input', render);
      input.addEventListener('change', render);
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
