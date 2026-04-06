(() => {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const round = (n, d = 4) => Number(Number(n).toFixed(d));
  const pct = (n, d = 1) => `${(Number(n) * 100).toFixed(d)}%`;

  function normalizeOdds(odds = []) {
    return (Array.isArray(odds) ? odds : []).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 1.02);
  }

  function marketBiasFactor(market = '', odds = []) {
    const count = odds.length;
    const max = Math.max(...odds);
    const min = Math.min(...odds);
    const spread = min > 0 ? max / min : 1;
    let alpha = count >= 3 ? 1.035 : 1.02;
    if (market === 'ou' || market === 'moneyline') alpha = 1.018;
    if (spread >= 2.1) alpha += 0.012;
    if (spread >= 3.4) alpha += 0.01;
    return alpha;
  }

  function fairProbability({ odds = [], market = '' } = {}) {
    const clean = normalizeOdds(odds);
    if (!clean.length) {
      return { odds: [], implied: [], impliedTotal: 0, fairProbabilities: [], fairOdds: [], margin: 0, entropy: 0, alpha: 1 };
    }
    const implied = clean.map((v) => 1 / v);
    const impliedTotal = implied.reduce((a, b) => a + b, 0);
    const naive = implied.map((v) => v / impliedTotal);
    const alpha = marketBiasFactor(market, clean);
    const weighted = implied.map((v) => Math.pow(v, alpha));
    const weightedTotal = weighted.reduce((a, b) => a + b, 0);
    const fairProbabilities = weighted.map((v) => v / weightedTotal);
    const fairOdds = fairProbabilities.map((p) => (p > 0 ? 1 / p : 0));
    const entropy = fairProbabilities.reduce((sum, p) => sum + (p > 0 ? -p * Math.log2(p) : 0), 0);
    return {
      odds: clean,
      implied,
      impliedTotal,
      naiveProbabilities: naive,
      fairProbabilities,
      fairOdds,
      margin: Math.max(0, impliedTotal - 1),
      entropy,
      alpha,
    };
  }

  function expectedValue({ probability = 0, odds = 0, stake = 1 } = {}) {
    const p = clamp(Number(probability) || 0, 0, 1);
    const o = Number(odds) || 0;
    const s = Math.max(0, Number(stake) || 0);
    if (o < 1.02 || p <= 0 || s < 0) return { evRate: 0, expectedProfit: 0, expectedReturn: 0, label: '데이터 부족' };
    const evRate = p * o - 1;
    const expectedProfit = s * evRate;
    const expectedReturn = s + expectedProfit;
    let label = '보통';
    if (evRate >= 0.03) label = '유리';
    else if (evRate >= 0.005) label = '약우세';
    else if (evRate <= -0.03) label = '불리';
    else if (evRate <= -0.005) label = '약열세';
    return { evRate, expectedProfit, expectedReturn, label };
  }

  function volatilityRisk({ probability = 0, odds = 0, stake = 1, plays = 1 } = {}) {
    const p = clamp(Number(probability) || 0, 0, 1);
    const o = Number(odds) || 0;
    const s = Math.max(0, Number(stake) || 0);
    const n = Math.max(1, Number(plays) || 1);
    if (o < 1.02 || p <= 0 || s < 0) {
      return { variance: 0, stdDev: 0, volatilityScore: 0, grade: '낮음', streakLossProb: 0 };
    }
    const winProfit = s * (o - 1);
    const loss = -s;
    const ev = p * winProfit + (1 - p) * loss;
    const variance = p * ((winProfit - ev) ** 2) + (1 - p) * ((loss - ev) ** 2);
    const stdDev = Math.sqrt(Math.max(variance, 0) * n);
    const base = s > 0 ? stdDev / Math.max(s, 1) : 0;
    const volatilityScore = clamp((base / 2.6) * 100, 0, 100);
    const streakLossProb = Math.pow(Math.max(0, 1 - p), Math.min(5, n));
    let grade = '낮음';
    if (volatilityScore >= 75) grade = '매우 높음';
    else if (volatilityScore >= 55) grade = '높음';
    else if (volatilityScore >= 30) grade = '보통';
    return { variance, stdDev, volatilityScore, grade, streakLossProb };
  }

  function bankrollPlan({ capital = 0, probability = 0, odds = 0, mode = 'neutral', volatilityScore = 40 } = {}) {
    const cap = Math.max(0, Number(capital) || 0);
    const p = clamp(Number(probability) || 0, 0, 1);
    const o = Number(odds) || 0;
    if (o < 1.02) {
      return { ratio: 0, amount: 0, stopLoss: 0, targetGain: 0, label: '관망' };
    }
    const b = o - 1;
    const q = 1 - p;
    const rawKelly = b > 0 ? ((b * p) - q) / b : 0;
    const modeWeight = mode === 'safe' ? 0.45 : mode === 'aggressive' ? 0.9 : 0.65;
    const volatilityWeight = clamp(1 - (Number(volatilityScore) || 0) / 135, 0.35, 1);
    let ratio = Math.max(0, rawKelly) * modeWeight * volatilityWeight;
    const maxCap = mode === 'safe' ? 0.02 : mode === 'aggressive' ? 0.06 : 0.04;
    ratio = clamp(ratio, 0, maxCap);
    if (ratio === 0 && rawKelly <= 0) ratio = mode === 'safe' ? 0.005 : 0.0075;
    const amount = cap > 0 ? Math.round(cap * ratio) : 0;
    const stopLoss = cap > 0 ? Math.round(cap * (mode === 'safe' ? 0.12 : mode === 'aggressive' ? 0.22 : 0.16)) : 0;
    const targetGain = cap > 0 ? Math.round(cap * (mode === 'safe' ? 0.08 : mode === 'aggressive' ? 0.18 : 0.12)) : 0;
    let label = '관망';
    if (ratio >= 0.035) label = '공격';
    else if (ratio >= 0.015) label = '중립';
    else if (ratio > 0) label = '보수';
    return { ratio, amount, stopLoss, targetGain, label, rawKelly };
  }

  function formatSignedPercent(value) {
    const n = Number(value) || 0;
    return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
  }

  function describeEdge(evRate = 0) {
    if (evRate >= 0.03) return '가치 우세';
    if (evRate >= 0.005) return '미세 우세';
    if (evRate <= -0.03) return '가치 열세';
    if (evRate <= -0.005) return '약열세';
    return '중립';
  }

  window.RavenEngines = {
    pct,
    round,
    fairProbability,
    expectedValue,
    volatilityRisk,
    bankrollPlan,
    formatSignedPercent,
    describeEdge,
  };
})();
