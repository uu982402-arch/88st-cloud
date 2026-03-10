const tg = window.Telegram?.WebApp ?? null;
const LS_KEYS = {
  favoriteLeagues: '88st.matchEntry.favoriteLeagues',
  recentPicks: '88st.matchEntry.recentPicks',
  recentLeagues: '88st.matchEntry.recentLeagues',
};
const state = {
  catalog: null,
  sportCode: '',
  stage: 'ALL',
  regionFilter: 'ALL',
  leagueCode: '',
  homeTeamId: '',
  awayTeamId: '',
  favorites: [],
  recentPicks: [],
  recentLeagues: [],
};

const el = {
  sportsGrid: document.getElementById('sportsGrid'),
  sportCount: document.getElementById('sportCount'),
  stageTabs: document.getElementById('stageTabs'),
  regionSelect: document.getElementById('regionSelect'),
  favoriteRail: document.getElementById('favoriteRail'),
  recentRail: document.getElementById('recentRail'),
  favoriteLeagueBtn: document.getElementById('favoriteLeagueBtn'),
  clearRecentBtn: document.getElementById('clearRecentBtn'),
  leagueSearch: document.getElementById('leagueSearch'),
  leagueCount: document.getElementById('leagueCount'),
  leagueList: document.getElementById('leagueList'),
  teamCount: document.getElementById('teamCount'),
  homeSearch: document.getElementById('homeSearch'),
  awaySearch: document.getElementById('awaySearch'),
  homeSelect: document.getElementById('homeSelect'),
  awaySelect: document.getElementById('awaySelect'),
  manualHome: document.getElementById('manualHome'),
  manualAway: document.getElementById('manualAway'),
  kickoffInput: document.getElementById('kickoffInput'),
  stageLabelInput: document.getElementById('stageLabelInput'),
  summaryCard: document.getElementById('summaryCard'),
  copyPayloadBtn: document.getElementById('copyPayloadBtn'),
  sendTelegramBtn: document.getElementById('sendTelegramBtn'),
  toast: document.getElementById('toast'),
};

const stageMeta = [
  { code: 'ALL', name: '전체', desc: '선택한 종목 전체' },
  { code: 'LEAGUE', name: '리그', desc: '정규리그 중심' },
  { code: 'CLUB_CUP', name: '클럽 대항전', desc: 'UCL · 메이저 · 컵' },
  { code: 'INTL', name: '국가대표/국제전', desc: '월드컵 · 국제대회' },
  { code: 'WOMEN', name: '여자', desc: '여자 경기' },
  { code: 'YOUTH', name: '유소년', desc: '연령별 대회' },
];

function toast(message) {
  el.toast.hidden = false;
  el.toast.textContent = message;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.toast.hidden = true; }, 1400);
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function pushCap(arr, item, limit = 8, match = (a, b) => a === b) {
  const next = [item, ...arr.filter((x) => !match(x, item))];
  return next.slice(0, limit);
}

function currentSport() {
  return state.catalog?.sports.find(s => s.code === state.sportCode) ?? null;
}

function currentLeague() {
  return filteredLeagues().find(l => l.code === state.leagueCode) || state.catalog?.leagues.find(l => l.code === state.leagueCode) || null;
}

function stageName(code) {
  return stageMeta.find(x => x.code === code)?.name || code || '기타';
}

function regionLabel(league) {
  return clean(league?.countryName || league?.regionLabel || league?.region || '전체');
}

function filteredLeagues() {
  if (!state.catalog) return [];
  const q = clean(el.leagueSearch.value).toLowerCase();
  return state.catalog.leagues.filter((league) => {
    if (state.sportCode && league.sportCode !== state.sportCode) return false;
    if (state.stage !== 'ALL' && league.stage !== state.stage) return false;
    if (state.regionFilter !== 'ALL' && regionLabel(league) !== state.regionFilter) return false;
    if (!q) return true;
    return `${league.name} ${league.code} ${regionLabel(league)} ${league.countryName || ''}`.toLowerCase().includes(q);
  });
}

function filteredTeams(searchValue) {
  const league = currentLeague();
  if (!league) return [];
  const q = clean(searchValue).toLowerCase();
  const teams = Array.isArray(league.teams) ? league.teams.slice() : [];
  if (!q) return teams;
  return teams.filter(team => `${team.label} ${team.id}`.toLowerCase().includes(q));
}

function syncTelegramButton(payload) {
  const sendable = Boolean(payload);
  if (!tg) return;
  tg.ready();
  tg.expand();
  const btn = tg.MainButton || tg.BottomButton;
  if (!btn) return;
  btn.setText(sendable ? '텔레그램으로 적용' : '경기를 먼저 선택하세요');
  if (sendable) btn.show(); else btn.hide();
  btn.onClick?.(() => {
    if (!payload) return;
    saveRecentPick(payload);
    tg.sendData(JSON.stringify(payload));
  });
}

function buildPayload() {
  const sport = currentSport();
  const league = currentLeague();
  const teams = league?.teams ?? [];
  const homeManual = clean(el.manualHome.value);
  const awayManual = clean(el.manualAway.value);
  const homeSel = teams.find(team => team.id === state.homeTeamId) ?? null;
  const awaySel = teams.find(team => team.id === state.awayTeamId) ?? null;
  const home = homeManual || homeSel?.label || '';
  const away = awayManual || awaySel?.label || '';
  if (!sport || !league || !home || !away || home === away) return null;
  const eventId = [sport.code, league.code, (homeSel?.id || home).slice(0, 24), (awaySel?.id || away).slice(0, 24)]
    .join('-')
    .replace(/[^A-Za-z0-9가-힣-]+/g, '-')
    .toLowerCase();
  return {
    kind: 'MATCH_PICK',
    v: 2,
    sportCode: sport.code,
    sportName: sport.name,
    leagueCode: league.code,
    leagueName: league.name,
    stageLabel: clean(el.stageLabelInput.value) || stageName(league.stage),
    countryName: clean(league.countryName || ''),
    regionLabel: regionLabel(league),
    homeTeam: { id: homeSel?.id || '', label: home },
    awayTeam: { id: awaySel?.id || '', label: away },
    kickoff: clean(el.kickoffInput.value),
    eventLabel: `${league.name} · ${home} vs ${away}`,
    eventId,
  };
}

function regionOptions() {
  const source = (state.catalog?.leagues || []).filter((league) => !state.sportCode || league.sportCode === state.sportCode);
  const labels = Array.from(new Set(source.map(regionLabel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ko'));
  return ['ALL', ...labels];
}

function renderRegionOptions() {
  const opts = regionOptions();
  if (!opts.includes(state.regionFilter)) state.regionFilter = 'ALL';
  el.regionSelect.innerHTML = '';
  for (const item of opts) {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item === 'ALL' ? '전체' : item;
    option.selected = state.regionFilter === item;
    el.regionSelect.appendChild(option);
  }
}

function renderSports() {
  if (!state.catalog) return;
  el.sportsGrid.innerHTML = '';
  el.sportCount.textContent = `${state.catalog.sports.length}개`;
  const tpl = document.getElementById('sportChipTpl');
  for (const sport of state.catalog.sports) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.innerHTML = `<strong>${sport.emoji} ${sport.name}</strong><span>${sport.code}</span>`;
    node.classList.toggle('active', state.sportCode === sport.code);
    node.addEventListener('click', () => {
      state.sportCode = sport.code;
      state.stage = 'ALL';
      state.regionFilter = 'ALL';
      state.leagueCode = '';
      state.homeTeamId = '';
      state.awayTeamId = '';
      el.leagueSearch.value = '';
      el.homeSearch.value = '';
      el.awaySearch.value = '';
      renderAll();
    });
    el.sportsGrid.appendChild(node);
  }
}

function renderStages() {
  el.stageTabs.innerHTML = '';
  const tpl = document.getElementById('stageChipTpl');
  for (const stage of stageMeta) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.innerHTML = `<strong>${stage.name}</strong><span>${stage.desc}</span>`;
    node.classList.toggle('active', state.stage === stage.code);
    node.addEventListener('click', () => {
      state.stage = stage.code;
      state.leagueCode = '';
      state.homeTeamId = '';
      state.awayTeamId = '';
      renderAll();
    });
    el.stageTabs.appendChild(node);
  }
}

function saveRecentLeague(code) {
  if (!code) return;
  state.recentLeagues = pushCap(state.recentLeagues, code, 10);
  writeJson(LS_KEYS.recentLeagues, state.recentLeagues);
}

function saveRecentPick(payload) {
  state.recentPicks = pushCap(state.recentPicks, payload, 8, (a, b) => a.eventId === b.eventId);
  writeJson(LS_KEYS.recentPicks, state.recentPicks);
}

function toggleFavoriteCurrentLeague() {
  const league = currentLeague();
  if (!league) {
    toast('먼저 리그를 선택하세요');
    return;
  }
  if (state.favorites.includes(league.code)) {
    state.favorites = state.favorites.filter((x) => x !== league.code);
    toast('즐겨찾기 해제');
  } else {
    state.favorites = pushCap(state.favorites, league.code, 16);
    toast('즐겨찾기 저장');
  }
  writeJson(LS_KEYS.favoriteLeagues, state.favorites);
  renderRails();
}

function renderPillRail(target, items, buildText, emptyText, onClick) {
  target.innerHTML = '';
  if (!items.length) {
    target.classList.add('empty');
    target.textContent = emptyText;
    return;
  }
  target.classList.remove('empty');
  const tpl = document.getElementById('pillTpl');
  items.forEach((item) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.innerHTML = buildText(item);
    node.addEventListener('click', () => onClick(item));
    target.appendChild(node);
  });
}

function applyRecentPick(payload) {
  const league = state.catalog?.leagues.find((x) => x.code === payload.leagueCode);
  if (!league) {
    toast('카탈로그에 없는 경기입니다');
    return;
  }
  state.sportCode = payload.sportCode || league.sportCode;
  state.stage = league.stage || 'ALL';
  state.regionFilter = regionLabel(league);
  state.leagueCode = league.code;
  state.homeTeamId = payload.homeTeam?.id || '';
  state.awayTeamId = payload.awayTeam?.id || '';
  el.manualHome.value = payload.homeTeam?.label || '';
  el.manualAway.value = payload.awayTeam?.label || '';
  el.kickoffInput.value = payload.kickoff || '';
  el.stageLabelInput.value = payload.stageLabel || '';
  renderAll();
}

function renderRails() {
  const favoriteLeagues = state.favorites
    .map((code) => state.catalog?.leagues.find((x) => x.code === code))
    .filter(Boolean);
  renderPillRail(
    el.favoriteRail,
    favoriteLeagues,
    (league) => `<strong>${league.name}</strong><span>${regionLabel(league)} · ${stageName(league.stage)}</span>`,
    '저장된 즐겨찾기 없음',
    (league) => {
      state.sportCode = league.sportCode;
      state.stage = league.stage || 'ALL';
      state.regionFilter = regionLabel(league);
      state.leagueCode = league.code;
      state.homeTeamId = '';
      state.awayTeamId = '';
      el.homeSearch.value = '';
      el.awaySearch.value = '';
      renderAll();
    }
  );

  renderPillRail(
    el.recentRail,
    state.recentPicks,
    (pick) => `<strong>${pick.leagueName}</strong><span>${pick.homeTeam?.label || '-'} vs ${pick.awayTeam?.label || '-'}${pick.kickoff ? ` · ${pick.kickoff}` : ''}</span>`,
    '아직 선택한 경기 없음',
    applyRecentPick,
  );
}

function renderLeagues() {
  const leagues = filteredLeagues();
  if (!state.leagueCode && leagues[0]) state.leagueCode = leagues[0].code;
  if (state.leagueCode && !leagues.some(league => league.code === state.leagueCode)) {
    state.leagueCode = leagues[0]?.code || '';
  }
  el.leagueCount.textContent = `${leagues.length}개`;
  el.leagueList.innerHTML = '';
  const tpl = document.getElementById('leagueCardTpl');
  for (const league of leagues) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.league-name').textContent = league.name;
    node.querySelector('.league-meta').textContent = `${regionLabel(league)} · ${stageName(league.stage)}\n${league.code} · ${league.teams.length}팀`;
    node.classList.toggle('active', state.leagueCode === league.code);
    node.addEventListener('click', () => {
      state.leagueCode = league.code;
      state.homeTeamId = '';
      state.awayTeamId = '';
      el.homeSearch.value = '';
      el.awaySearch.value = '';
      saveRecentLeague(league.code);
      renderAll();
    });
    el.leagueList.appendChild(node);
  }
}

function fillSelect(select, teams, selectedId) {
  select.innerHTML = '';
  for (const team of teams) {
    const option = document.createElement('option');
    option.value = team.id;
    option.textContent = `${team.label} (${team.id})`;
    option.selected = selectedId === team.id;
    select.appendChild(option);
  }
}

function renderTeams() {
  const league = currentLeague();
  const homeTeams = filteredTeams(el.homeSearch.value);
  const awayTeams = filteredTeams(el.awaySearch.value);
  el.teamCount.textContent = league ? `${league.teams.length}팀` : '0팀';
  fillSelect(el.homeSelect, homeTeams, state.homeTeamId);
  fillSelect(el.awaySelect, awayTeams, state.awayTeamId);
}

function renderSummary() {
  const payload = buildPayload();
  if (!payload) {
    el.summaryCard.classList.add('empty');
    el.summaryCard.innerHTML = `
      <div class="summary-title">아직 경기 선택 전</div>
      <div class="summary-body">종목과 리그, 팀을 고르면 여기에서 텔레그램으로 보낼 내용을 미리 확인할 수 있습니다.</div>
    `;
    el.sendTelegramBtn.disabled = true;
    el.copyPayloadBtn.disabled = true;
    syncTelegramButton(null);
    return;
  }
  el.summaryCard.classList.remove('empty');
  el.summaryCard.innerHTML = `
    <div class="summary-title">${payload.eventLabel}</div>
    <div class="summary-body">종목: ${payload.sportName}\n리그/대회: ${payload.leagueName}\n권역: ${payload.countryName || payload.regionLabel || '미지정'}\n구분: ${payload.stageLabel || '미입력'}\n시간: ${payload.kickoff || '미입력'}\n\n텔레그램에서는 이 경기 정보가 먼저 반영되고, 이후 배당과 적중/미적중만 빠르게 입력하면 됩니다.</div>
  `;
  el.sendTelegramBtn.disabled = false;
  el.copyPayloadBtn.disabled = false;
  syncTelegramButton(payload);
}

function renderAll() {
  renderSports();
  renderStages();
  renderRegionOptions();
  renderRails();
  renderLeagues();
  renderTeams();
  renderSummary();
}

async function copySummary() {
  const payload = buildPayload();
  if (!payload) return;
  const text = JSON.stringify(payload, null, 2);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  saveRecentPick(payload);
  renderRails();
  toast('요약 복사 완료');
}

function sendToTelegram() {
  const payload = buildPayload();
  if (!payload) return;
  saveRecentPick(payload);
  renderRails();
  if (!tg?.sendData) {
    copySummary();
    toast('일반 브라우저에서는 요약만 복사됩니다');
    return;
  }
  tg.sendData(JSON.stringify(payload));
}

async function boot() {
  try {
    const res = await fetch('./data/catalog.88st.json', { cache: 'no-store' });
    state.catalog = await res.json();
  } catch (error) {
    console.error(error);
    toast('카탈로그 로딩 실패');
    return;
  }

  state.favorites = readJson(LS_KEYS.favoriteLeagues, []);
  state.recentPicks = readJson(LS_KEYS.recentPicks, []);
  state.recentLeagues = readJson(LS_KEYS.recentLeagues, []);
  state.sportCode = state.catalog.sports[0]?.code || '';

  const lastLeagueCode = state.recentLeagues[0];
  const lastLeague = state.catalog.leagues.find((x) => x.code === lastLeagueCode);
  if (lastLeague) {
    state.sportCode = lastLeague.sportCode;
    state.leagueCode = lastLeague.code;
    state.stage = lastLeague.stage || 'ALL';
    state.regionFilter = regionLabel(lastLeague);
  }

  el.leagueSearch.addEventListener('input', renderAll);
  el.regionSelect.addEventListener('change', () => { state.regionFilter = el.regionSelect.value; state.leagueCode = ''; renderAll(); });
  el.homeSearch.addEventListener('input', renderTeams);
  el.awaySearch.addEventListener('input', renderTeams);
  el.homeSelect.addEventListener('change', () => { state.homeTeamId = el.homeSelect.value; el.manualHome.value = ''; renderSummary(); });
  el.awaySelect.addEventListener('change', () => { state.awayTeamId = el.awaySelect.value; el.manualAway.value = ''; renderSummary(); });
  el.manualHome.addEventListener('input', () => { state.homeTeamId = ''; renderSummary(); });
  el.manualAway.addEventListener('input', () => { state.awayTeamId = ''; renderSummary(); });
  el.kickoffInput.addEventListener('input', renderSummary);
  el.stageLabelInput.addEventListener('input', renderSummary);
  el.copyPayloadBtn.addEventListener('click', copySummary);
  el.sendTelegramBtn.addEventListener('click', sendToTelegram);
  el.favoriteLeagueBtn.addEventListener('click', toggleFavoriteCurrentLeague);
  el.clearRecentBtn.addEventListener('click', () => {
    state.recentPicks = [];
    writeJson(LS_KEYS.recentPicks, state.recentPicks);
    renderRails();
    toast('최근 경기 비움');
  });

  if (tg) {
    document.documentElement.style.setProperty('--primary', tg.themeParams?.button_color || '#3e8cff');
    document.documentElement.style.setProperty('--primary-2', tg.themeParams?.link_color || '#60a5ff');
  }

  renderAll();
}

boot();
