const panelMeta = {
  dashboard: {
    title: '운영 대시보드',
    subtitle: '오늘 상태, 광고 노출, 그룹 허용, 오류 로그를 빠르게 확인할 수 있습니다.'
  },
  promos: {
    title: '프로모 / 인증놀이터 관리',
    subtitle: '광고 업체 추가, 수정, 순서 변경, 숨김 처리를 한 화면에서 관리합니다.'
  },
  groups: {
    title: '그룹 관리',
    subtitle: '허용 그룹, 차단 그룹, 최근 활동, 메모를 빠르게 확인합니다.'
  },
  texts: {
    title: '키워드 / 문구 관리',
    subtitle: '상태 메시지, 안내 문구, 버튼 라벨, 키워드를 운영자 화면에서 관리합니다.'
  },
  analysis: {
    title: '배당 분석 설정',
    subtitle: '내부 엔진 수치 노출 없이 운영 옵션만 켜고 끄는 구조를 권장합니다.'
  },
  landing: {
    title: '웹앱 / 랜딩 관리',
    subtitle: 'tg-match-entry, odds, playground 링크와 버튼 문구를 관리합니다.'
  },
  schedules: {
    title: '스케줄 / 뉴스 관리',
    subtitle: '뉴스 발송, TOP3, 드립, 테스트 실행 상태를 정리합니다.'
  },
  logs: {
    title: '로그 / 이력',
    subtitle: '오류, 관리자 액션, 결과 회수 로그를 빠르게 살펴봅니다.'
  },
  security: {
    title: '권한 / 보안',
    subtitle: 'Cloudflare Access, 관리자 세션, 감사 로그 연동 구조를 정리합니다.'
  }
};

const promoItems = [
  { status: 'on', order: 1, codeName: 'VEGAS', display: 'VEGAS', code: '6789', scope: '웹 / DM', period: '상시', action: '수정 · 복제 · 숨김' },
  { status: 'on', order: 2, codeName: '777', display: '777', code: '6767', scope: '웹 / DM', period: '상시', action: '수정 · 복제 · 숨김' },
  { status: 'on', order: 3, codeName: 'FIX', display: 'FIX', code: '7799', scope: '웹 / DM', period: '상시', action: '수정 · 복제 · 숨김' },
  { status: 'off', order: 4, codeName: 'NEW-A', display: '신규업체A', code: '9090', scope: '웹', period: '예약', action: '수정 · 복제 · 삭제' }
];

function renderPromoTable(items) {
  const body = document.getElementById('promo-table-body');
  if (!body) return;
  body.innerHTML = items.map((item) => `
    <tr>
      <td><span class="status ${item.status}">${item.status === 'on' ? 'ON' : 'OFF'}</span></td>
      <td>${item.order}</td>
      <td>${item.codeName}</td>
      <td>${item.display}</td>
      <td>${item.code}</td>
      <td>${item.scope}</td>
      <td>${item.period}</td>
      <td>${item.action}</td>
    </tr>
  `).join('');
}

function setActivePanel(panelId) {
  document.querySelectorAll('.menu-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.panel === panelId);
  });
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === panelId);
  });

  const meta = panelMeta[panelId];
  if (!meta) return;
  const title = document.getElementById('panel-title');
  const subtitle = document.getElementById('panel-subtitle');
  if (title) title.textContent = meta.title;
  if (subtitle) subtitle.textContent = meta.subtitle;
}

function initMenu() {
  document.querySelectorAll('.menu-item').forEach((button) => {
    button.addEventListener('click', () => setActivePanel(button.dataset.panel));
  });
}

function initPromoSearch() {
  const search = document.getElementById('promo-search');
  if (!search) return;
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const filtered = promoItems.filter((item) => {
      const hay = `${item.codeName} ${item.display} ${item.code} ${item.scope}`.toLowerCase();
      return hay.includes(q);
    });
    renderPromoTable(filtered);
  });
}

function init() {
  renderPromoTable(promoItems);
  initMenu();
  initPromoSearch();
}

document.addEventListener('DOMContentLoaded', init);
