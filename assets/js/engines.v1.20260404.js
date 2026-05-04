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


  function marketConfidence({ fair = null, outcomes = [], market = '', line = 0, volatilityScore = 40 } = {}) {
    const safeOutcomes = Array.isArray(outcomes) ? outcomes.filter(Boolean) : [];
    const sortedProb = safeOutcomes.slice().sort((a, b) => (b.prob || 0) - (a.prob || 0));
    const sortedEv = safeOutcomes.slice().sort((a, b) => (b.ev?.evRate || 0) - (a.ev?.evRate || 0));
    const bestProb = sortedProb[0] || null;
    const secondProb = sortedProb[1] || null;
    const bestEdge = sortedEv[0] || null;
    const secondEdge = sortedEv[1] || null;
    const probGap = bestProb && secondProb ? Math.max(0, (bestProb.prob || 0) - (secondProb.prob || 0)) : 0;
    const edgeGap = bestEdge && secondEdge ? Math.max(0, (bestEdge.ev?.evRate || 0) - (secondEdge.ev?.evRate || 0)) : Math.max(0, bestEdge?.ev?.evRate || 0);
    const margin = Math.max(0, Number(fair?.margin) || 0);
    const entropy = Number(fair?.entropy) || 0;
    const maxEntropy = market === '1x2' ? Math.log2(3) : Math.log2(2);
    const entropyPenalty = maxEntropy > 0 ? clamp((entropy / maxEntropy) * 26, 8, 26) : 12;
    const marginPenalty = clamp(margin * 640, 0, 34);
    const volatilityPenalty = clamp((Number(volatilityScore) || 0) * 0.26, 0, 24);
    const evBoost = clamp((bestEdge?.ev?.evRate || 0) * 1200, -18, 28);
    const edgeBoost = clamp(edgeGap * 4200, 0, 18);
    const probBoost = clamp(probGap * 220, 0, 14);
    const linePenalty = (market === 'ou' || market === 'hcp') && Number.isFinite(Number(line)) && Math.abs(Number(line)) >= 1.75 ? 6 : 0;
    const score = clamp(58 + evBoost + edgeBoost + probBoost - marginPenalty - volatilityPenalty - entropyPenalty - linePenalty, 8, 95);

    let label = '중립';
    let action = '관망';
    if ((bestEdge?.ev?.evRate || 0) <= 0 || margin >= 0.09) {
      label = '낮음';
      action = '관망';
    } else if (score >= 76 && edgeGap >= 0.005) {
      label = '높음';
      action = '우선 검토';
    } else if (score >= 60) {
      label = '보통';
      action = '소액 접근';
    } else {
      label = '낮음';
      action = '관망';
    }

    const reasons = [];
    if (margin >= 0.07) reasons.push('북마진이 높아 보수적으로 해석');
    else reasons.push('북마진이 과도하지 않음');
    if (probGap >= 0.05) reasons.push('1순위 확률 격차가 비교적 선명');
    else reasons.push('상위 선택 간 격차가 크지 않음');
    if ((bestEdge?.ev?.evRate || 0) > 0.02) reasons.push('보정 EV가 플러스 구간');
    else if ((bestEdge?.ev?.evRate || 0) > 0) reasons.push('미세 우세 구간');
    else reasons.push('가치 우위가 약함');

    return { score, label, action, probGap, edgeGap, reasons };
  }

  function marketLean({ fair = null, outcomes = [], market = '', line = 0 } = {}) {
    const safeOutcomes = Array.isArray(outcomes) ? outcomes.filter(Boolean) : [];
    if (!safeOutcomes.length) return { title: '대기', detail: '입력 후 시장 균형을 계산합니다.' };
    const sorted = safeOutcomes.slice().sort((a, b) => (b.prob || 0) - (a.prob || 0));
    const best = sorted[0];
    const second = sorted[1];
    const gap = second ? (best.prob || 0) - (second.prob || 0) : best.prob || 0;
    if (market === '1x2' && best.label === '무' && (best.prob || 0) >= 0.28) {
      return { title: '무승부 경계', detail: '정배 한쪽으로 쏠리지 않아 무승부 보정이 필요한 흐름입니다.' };
    }
    if ((market === 'ou' || market === 'hcp') && Number.isFinite(Number(line))) {
      const cleanLine = Number(line);
      if (Math.abs(cleanLine) >= 1.5) return { title: '라인 강도 높음', detail: `기준점 ${cleanLine} 자체 영향이 커서 배당보다 라인 해석 비중이 큽니다.` };
      if (gap <= 0.025) return { title: '균형 시장', detail: `기준점 ${cleanLine} 근처에서 상하 선택 차이가 크지 않습니다.` };
    }
    if (gap >= 0.07) return { title: '우세 흐름 선명', detail: `${best.label} 쪽 공정확률 우위가 비교적 또렷합니다.` };
    if (gap >= 0.03) return { title: '약우세 흐름', detail: `${best.label} 쪽이 앞서지만 단독 강승부로 보기엔 격차가 제한적입니다.` };
    return { title: '박빙 흐름', detail: '상위 선택 간 격차가 좁아 관망 또는 분산 접근이 낫습니다.' };
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
    marketConfidence,
    marketLean,
  };
})();
