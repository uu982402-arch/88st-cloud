(() => {
  const blocks = Array.from(document.querySelectorAll('.strategy-tester'));
  if (!blocks.length) return;

  const nf = new Intl.NumberFormat('ko-KR');
  const parseNum = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const fmt = (value) => `${nf.format(Math.round(value || 0))}`;

  function fibAt(index) {
    const seq = [1, 1];
    for (let i = 2; i <= index; i += 1) seq[i] = seq[i - 1] + seq[i - 2];
    return seq[index] || 1;
  }

  function englishKellyFraction(odds, edgePct) {
    const o = Math.max(1.01, parseNum(odds, 2));
    const edge = Math.max(0, parseNum(edgePct, 0)) / 100;
    const implied = 1 / o;
    const p = Math.min(0.92, Math.max(0.02, implied + edge));
    const b = o - 1;
    const q = 1 - p;
    const fraction = ((b * p) - q) / b;
    return Math.max(0, Math.min(0.25, fraction));
  }

  function parseSeq(raw, fallback) {
    const out = String(raw || '').split(',').map((value) => parseInt(value, 10)).filter((n) => Number.isFinite(n) && n > 0);
    return out.length ? out : fallback.slice();
  }

  function buildNote(state) {
    const info = {
      'flat-betting': '정액 베팅은 매 회차 동일 금액으로 진행합니다. 기법보다 진입 품질과 손절 기준이 더 중요합니다.',
      'martingale': '마틴게일은 패배 시 두 배로 커집니다. 연패 구간에서 자본 소모 속도가 급격히 빨라집니다.',
      'grand-martingale': '그랜드 마틴게일은 손실 회복분에 기본 단위를 더 얹어 더 공격적으로 진행합니다.',
      'paroli': '파롤리는 승리 구간에서만 베팅을 키워 연승일 때 이익을 확장하는 방식입니다.',
      'dalembert': '달랑베르는 선형 증가형이라 표면상 부드럽지만, 긴 세션에서는 누적 노출을 계속 확인해야 합니다.',
      'fibonacci': '피보나치는 패배 시 다음 수열, 승리 시 두 단계 후퇴 규칙으로 회복 속도를 조절합니다.',
      'labouchere': `현재 숫자열: ${state.seq ? state.seq.join('-') : '-'} · 세션 목표를 분리해서 기록하기 쉬운 구조입니다.`,
      'oscars-grind': '오스카 그라인드는 세션 목표 1단위를 달성하면 다시 기본 단위로 돌아가는 승리 추종형입니다.',
      'one-three-two-six': `현재 단계: ${state.stepIndex + 1}/4 · 연승이 끊기면 기본 단계로 즉시 복귀합니다.`,
      'one-three-two-four': `현재 단계: ${state.stepIndex + 1}/4 · 1-3-2-6보다 마지막 부담이 낮은 보수형 시퀀스입니다.`,
      'kelly-criterion': `켈리 기준 비율 ${Math.round(state.kellyFraction * 1000) / 10}% 적용 · 추정 우위가 틀리면 과베팅 위험이 커집니다.`,
      'half-kelly': `하프 켈리 비율 ${Math.round(state.kellyFraction * 1000) / 10}% 적용 · 전체 켈리보다 변동성을 낮춘 보수형입니다.`,
      'proportional-staking': `현재 자본의 ${Math.round(state.stakePct * 10) / 10}% 비율로 다음 베팅을 계산합니다.`,
      'reverse-labouchere': `현재 숫자열: ${state.seq ? state.seq.join('-') : '-'} · 연승 구간에서 리스트가 길어질수록 베팅이 확대됩니다.`,
      'stop-loss-stop-win': `현재 자본의 ${Math.round(state.stakePct * 10) / 10}% 베팅 · 손절 ${fmt(state.stopLoss)} / 수익잠금 ${fmt(state.stopWin)} 기준입니다.`
    };
    let text = info[state.strategy] || '현재 전략 규칙에 맞춰 다음 베팅 금액과 누적 흐름을 자동으로 계산합니다.';
    if (state.locked && state.lockReason) text += ` 진행 잠금: ${state.lockReason}`;
    return text;
  }

  function computeNextBet(state) {
    const bankroll = Math.max(0, state.bankrollLeft);
    let nextBet = state.base;

    switch (state.strategy) {
      case 'flat-betting':
        nextBet = state.base;
        break;
      case 'martingale':
        nextBet = state.currentStakeUnits * state.base;
        break;
      case 'grand-martingale':
        nextBet = state.currentStakeUnits * state.base;
        break;
      case 'paroli':
        nextBet = state.currentStakeUnits * state.base;
        break;
      case 'dalembert':
        nextBet = state.currentStakeUnits * state.base;
        break;
      case 'fibonacci':
        nextBet = fibAt(state.fibIndex) * state.base;
        break;
      case 'labouchere': {
        if (!state.seq.length) state.seq = state.defaultSeq.slice();
        const units = state.seq.length === 1 ? state.seq[0] : state.seq[0] + state.seq[state.seq.length - 1];
        nextBet = units * state.base;
        break;
      }
      case 'oscars-grind':
        nextBet = state.currentStakeUnits * state.base;
        break;
      case 'one-three-two-six':
      case 'one-three-two-four':
        nextBet = state.sequence[state.stepIndex] * state.base;
        break;
      case 'kelly-criterion':
      case 'half-kelly':
        nextBet = Math.max(state.base, bankroll * state.kellyFraction);
        break;
      case 'proportional-staking':
      case 'stop-loss-stop-win':
        nextBet = Math.max(state.base, bankroll * state.stakePct / 100);
        break;
      case 'reverse-labouchere': {
        if (!state.seq.length) state.seq = state.defaultSeq.slice();
        const units = state.seq.length === 1 ? state.seq[0] : state.seq[0] + state.seq[state.seq.length - 1];
        nextBet = units * state.base;
        break;
      }
      default:
        nextBet = state.base;
    }

    nextBet = Math.max(0, Math.round(nextBet));

    state.locked = false;
    state.lockReason = '';

    if (state.strategy === 'stop-loss-stop-win') {
      if (state.profit <= -state.stopLoss) {
        state.locked = true;
        state.lockReason = '손절 기준에 도달했습니다. 세션 종료 후 재정비하는 구간입니다.';
        nextBet = 0;
      } else if (state.profit >= state.stopWin) {
        state.locked = true;
        state.lockReason = '수익잠금 기준에 도달했습니다. 이익 보호를 위해 세션을 종료합니다.';
        nextBet = 0;
      }
    }

    if (!state.locked && nextBet > bankroll && bankroll > 0) {
      state.locked = true;
      state.lockReason = '현재 자본으로 다음 단계 금액을 감당할 수 없습니다.';
      nextBet = 0;
    }

    if (!state.locked && bankroll <= 0) {
      state.locked = true;
      state.lockReason = '잔여 자본이 0이 되어 더 진행할 수 없습니다.';
      nextBet = 0;
    }

    state.nextBet = nextBet;
    state.maxBet = Math.max(state.maxBet, nextBet || 0);
  }

  function computeSignal(state) {
    const drawdownPct = state.startBankroll > 0 ? Math.max(0, ((state.peakBankroll - state.bankrollLeft) / state.startBankroll) * 100) : 0;
    const nextPct = state.bankrollLeft > 0 ? (state.nextBet / state.bankrollLeft) * 100 : 100;
    if (state.locked) return '중지 구간';
    if (drawdownPct >= 18 || nextPct >= 22) return '주의 구간';
    if (drawdownPct >= 10 || nextPct >= 12) return '재확인 구간';
    return '운용 가능';
  }

  function recoveryWins(state) {
    if (state.profit >= 0) return 0;
    const unitWin = Math.max(1, Math.round(state.base * Math.max(0.01, state.odds - 1)));
    return Math.ceil(Math.abs(state.profit) / unitWin);
  }

  function ensureExtras(block) {
    const stats = block.querySelector('.tester-stats');
    if (stats && !stats.querySelector('.js-max-dd')) {
      stats.insertAdjacentHTML('beforeend', `<div class="tester-stat"><span>최대 낙폭</span><strong class="js-max-dd">0%</strong><em>시작 자본 기준 최대 하락폭</em></div><div class="tester-stat"><span>회복 필요 승수</span><strong class="js-recovery">0회</strong><em>기본 단위 기준 대략 필요한 승리 횟수</em></div><div class="tester-stat"><span>현재 신호</span><strong class="js-signal">운용 가능</strong><em>과열·중지 여부를 빠르게 보기 위한 요약</em></div>`);
    }
    const actions = block.querySelector('.tester-actions');
    if (actions && !actions.querySelector('.tester-quick')) {
      const wrap = document.createElement('div');
      wrap.className = 'tester-quick';
      wrap.innerHTML = `<button type="button" class="btn btn-ghost js-quick-win">연승 3회 테스트</button><button type="button" class="btn btn-ghost js-quick-lose">연패 3회 테스트</button>`;
      actions.appendChild(wrap);
    }
  }

  function render(block, state) {
    ensureExtras(block);
    block.querySelector('.js-next-bet').textContent = state.nextBet ? `${fmt(state.nextBet)}원` : '중지';
    block.querySelector('.js-profit').textContent = `${state.profit >= 0 ? '+' : ''}${fmt(state.profit)}원`;
    block.querySelector('.js-bankroll-left').textContent = `${fmt(state.bankrollLeft)}원`;
    block.querySelector('.js-max-bet').textContent = `${fmt(state.maxBet)}원`;
    const ddPct = state.startBankroll > 0 ? Math.max(0, ((state.peakBankroll - state.bankrollLeft) / state.startBankroll) * 100) : 0;
    block.querySelector('.js-max-dd').textContent = `${Math.round(state.maxDrawdownPct * 10) / 10}%`;
    block.querySelector('.js-recovery').textContent = `${recoveryWins(state)}회`;
    block.querySelector('.js-signal').textContent = computeSignal(state);
    block.querySelector('.js-rounds').textContent = `${state.rounds}회 진행`;
    block.querySelector('.js-note').textContent = buildNote(state);
    const log = block.querySelector('.js-log');
    if (!state.logs.length) {
      log.innerHTML = '<div class="tester-log-empty">아직 기록이 없습니다. 승리 / 패배 버튼을 눌러 흐름을 확인하세요.</div>';
    } else {
      log.innerHTML = state.logs.map((entry) => `<div class="tester-log-item">${entry}</div>`).join('');
    }
    const winBtn = block.querySelector('.js-win');
    const loseBtn = block.querySelector('.js-lose');
    if (winBtn) winBtn.disabled = !!state.locked || state.nextBet <= 0;
    if (loseBtn) loseBtn.disabled = !!state.locked || state.nextBet <= 0;
  }

  function updateStakeAfterResult(state, result, currentBet, payout) {
    switch (state.strategy) {
      case 'martingale':
        state.currentStakeUnits = result === 'win' ? 1 : Math.max(1, state.currentStakeUnits * 2);
        break;
      case 'grand-martingale':
        state.currentStakeUnits = result === 'win' ? 1 : Math.max(1, (state.currentStakeUnits * 2) + 1);
        break;
      case 'paroli':
        state.currentStakeUnits = result === 'win' ? Math.max(1, state.currentStakeUnits * 2) : 1;
        break;
      case 'dalembert':
        state.currentStakeUnits = result === 'win' ? Math.max(1, state.currentStakeUnits - 1) : state.currentStakeUnits + 1;
        break;
      case 'fibonacci':
        state.fibIndex = result === 'win' ? Math.max(0, state.fibIndex - 2) : state.fibIndex + 1;
        break;
      case 'labouchere': {
        const units = Math.max(1, Math.round(currentBet / Math.max(1, state.base)));
        if (result === 'win') {
          if (state.seq.length <= 1) state.seq = [];
          else state.seq = state.seq.slice(1, -1);
          if (!state.seq.length) {
            state.seq = state.defaultSeq.slice();
            state.logs.unshift('<b>목표열 완료</b> → 기본 숫자열로 다시 시작');
          }
        } else {
          state.seq = state.seq.concat(units);
        }
        break;
      }
      case 'oscars-grind': {
        if (result === 'win') {
          if ((state.profit - state.sessionStartProfit) >= state.base) {
            state.sessionStartProfit = state.profit;
            state.currentStakeUnits = 1;
            state.logs.unshift('<b>세션 목표 +1단위 달성</b> → 기본 단위로 재시작');
          } else {
            state.currentStakeUnits += 1;
          }
        }
        break;
      }
      case 'one-three-two-six':
      case 'one-three-two-four':
        state.stepIndex = result === 'win'
          ? (state.stepIndex >= state.sequence.length - 1 ? 0 : state.stepIndex + 1)
          : 0;
        break;
      case 'kelly-criterion':
      case 'half-kelly':
        state.kellyFraction = state.strategy === 'half-kelly'
          ? englishKellyFraction(state.odds, state.edgePct) / 2
          : englishKellyFraction(state.odds, state.edgePct);
        break;
      case 'proportional-staking':
        break;
      case 'reverse-labouchere': {
        const units = Math.max(1, Math.round(currentBet / Math.max(1, state.base)));
        if (result === 'win') {
          state.seq = state.seq.concat(units);
        } else {
          if (state.seq.length <= 1) state.seq = [];
          else state.seq = state.seq.slice(1, -1);
          if (!state.seq.length) {
            state.seq = state.defaultSeq.slice();
            state.logs.unshift('<b>리스트 축소 종료</b> → 기본 숫자열로 다시 시작');
          }
        }
        break;
      }
      case 'stop-loss-stop-win':
        break;
      default:
        break;
    }
  }

  function applyResult(block, state, result) {
    if (state.locked || state.nextBet <= 0) return;
    const currentBet = state.nextBet;
    const payout = result === 'win'
      ? Math.round(currentBet * (Math.max(1.01, state.odds) - 1))
      : -currentBet;
    state.bankrollLeft = Math.max(0, state.bankrollLeft + payout);
    state.peakBankroll = Math.max(state.peakBankroll, state.bankrollLeft);
    state.profit = state.bankrollLeft - state.startBankroll;
    const ddPct = state.startBankroll > 0 ? Math.max(0, ((state.peakBankroll - state.bankrollLeft) / state.startBankroll) * 100) : 0;
    state.maxDrawdownPct = Math.max(state.maxDrawdownPct, ddPct);
    state.rounds += 1;
    updateStakeAfterResult(state, result, currentBet, payout);
    state.maxBet = Math.max(state.maxBet, currentBet);

    const badge = result === 'win' ? '승리' : '패배';
    const desc = `${state.rounds}회 · <b>${badge}</b> · 베팅 ${fmt(currentBet)}원 · 손익 ${payout >= 0 ? '+' : ''}${fmt(payout)}원 · 누적 ${state.profit >= 0 ? '+' : ''}${fmt(state.profit)}원`;
    state.logs.unshift(desc);
    state.logs = state.logs.slice(0, 18);
    computeNextBet(state);
    render(block, state);
  }

  function createState(block) {
    const base = Math.max(1, parseNum(block.dataset.defaultBase, 1000));
    const odds = Math.max(1.01, parseNum(block.dataset.defaultOdds, 2));
    const bankroll = Math.max(base * 20, parseNum(block.querySelector('.js-bankroll')?.value, 100000));
    const strategy = block.dataset.strategy || 'flat-betting';
    const edgePct = parseNum(block.dataset.edge, 5);
    const stakePct = Math.max(0.5, parseNum(block.dataset.stake, 2));
    const defaultSeq = parseSeq(block.dataset.seq, [1, 2, 3, 4]);
    const state = {
      strategy,
      base,
      odds,
      startBankroll: bankroll,
      bankrollLeft: bankroll,
      profit: 0,
      rounds: 0,
      logs: [],
      maxBet: base,
      nextBet: base,
      currentStakeUnits: 1,
      fibIndex: 0,
      stepIndex: 0,
      sequence: strategy === 'one-three-two-four' ? [1, 3, 2, 4] : [1, 3, 2, 6],
      edgePct,
      stakePct,
      seq: defaultSeq.slice(),
      defaultSeq: defaultSeq.slice(),
      locked: false,
      lockReason: '',
      stopLoss: Math.round(bankroll * 0.05),
      stopWin: Math.round(bankroll * 0.06),
      sessionStartProfit: 0,
      kellyFraction: 0,
      peakBankroll: bankroll,
      maxDrawdownPct: 0
    };
    state.kellyFraction = strategy === 'half-kelly'
      ? englishKellyFraction(odds, edgePct) / 2
      : englishKellyFraction(odds, edgePct);
    computeNextBet(state);
    return state;
  }

  blocks.forEach((block) => {
    const baseInput = block.querySelector('.js-base');
    const oddsInput = block.querySelector('.js-odds');
    const bankrollInput = block.querySelector('.js-bankroll');

    function resetFromInputs() {
      if (baseInput) baseInput.value = parseNum(baseInput.value || block.dataset.defaultBase, parseNum(block.dataset.defaultBase, 1000));
      if (oddsInput) oddsInput.value = parseNum(oddsInput.value || block.dataset.defaultOdds, parseNum(block.dataset.defaultOdds, 2)).toFixed(2);
      if (bankrollInput && !bankrollInput.value) bankrollInput.value = '100000';
      const state = createState(block);
      state.base = Math.max(1, parseNum(baseInput?.value, state.base));
      state.odds = Math.max(1.01, parseNum(oddsInput?.value, state.odds));
      state.startBankroll = Math.max(state.base * 20, parseNum(bankrollInput?.value, state.startBankroll));
      state.bankrollLeft = state.startBankroll;
      state.stopLoss = Math.round(state.startBankroll * 0.05);
      state.stopWin = Math.round(state.startBankroll * 0.06);
      state.kellyFraction = state.strategy === 'half-kelly'
        ? englishKellyFraction(state.odds, state.edgePct) / 2
        : englishKellyFraction(state.odds, state.edgePct);
      computeNextBet(state);
      block._testerState = state;
      render(block, state);
    }

    if (baseInput && !baseInput.value) baseInput.value = block.dataset.defaultBase || '1000';
    if (oddsInput && !oddsInput.value) oddsInput.value = Number(block.dataset.defaultOdds || 2).toFixed(2);
    if (bankrollInput && !bankrollInput.value) bankrollInput.value = '100000';

    resetFromInputs();

    block.querySelector('.js-win')?.addEventListener('click', () => applyResult(block, block._testerState, 'win'));
    block.querySelector('.js-lose')?.addEventListener('click', () => applyResult(block, block._testerState, 'lose'));
    block.querySelector('.js-reset')?.addEventListener('click', resetFromInputs);
    block.querySelector('.js-quick-win')?.addEventListener('click', () => { for (let i = 0; i < 3; i += 1) applyResult(block, block._testerState, 'win'); });
    block.querySelector('.js-quick-lose')?.addEventListener('click', () => { for (let i = 0; i < 3; i += 1) applyResult(block, block._testerState, 'lose'); });
    [baseInput, oddsInput, bankrollInput].forEach((input) => {
      input?.addEventListener('change', resetFromInputs);
    });
  });
})();
