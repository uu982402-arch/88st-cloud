(() => {
  const path = location.pathname || '/';
  if (window.Telegram?.WebApp || /\/tg-match-entry\/?$/i.test(path)) return;
  const title = (document.title || '페이지').replace(/\s*\|\s*88ST.*$/,'').trim() || '페이지';
  const storeKey = '88st_recent_pages_v1';

  function saveRecent() {
    try {
      const raw = localStorage.getItem(storeKey);
      const list = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(list) ? list.filter((item) => item && item.href !== location.pathname) : [];
      filtered.unshift({ href: location.pathname, title, ts: Date.now() });
      localStorage.setItem(storeKey, JSON.stringify(filtered.slice(0, 8)));
    } catch (_) {}
  }

  function getRecent() {
    try {
      const raw = localStorage.getItem(storeKey);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch (_) { return []; }
  }

  saveRecent();
  if (window.innerWidth > 980) return;
  if (document.querySelector('.mobile-dock')) return;

  const items = [
    { href: '/', label: '홈', icon: '⌂' },
    { href: '/analysis/', label: '분석', icon: '⌁' },
    { href: '/play-guides/', label: '가이드', icon: '☰' },
    { href: '#recent', label: '최근', icon: '↺', recent: true },
    { href: 'https://t.me/kakacloud', label: '문의', icon: '✦', external: true, accent: true }
  ];

  const dock = document.createElement('nav');
  dock.className = 'mobile-dock';
  dock.setAttribute('aria-label', '모바일 빠른 이동');
  const list = document.createElement('div');
  list.className = 'mobile-dock__list';

  const sheet = document.createElement('div');
  sheet.className = 'recent-sheet';
  sheet.setAttribute('aria-hidden', 'true');
  sheet.innerHTML = `
    <div class="recent-sheet__backdrop"></div>
    <div class="recent-sheet__panel" role="dialog" aria-modal="true" aria-label="최근 본 페이지">
      <div class="recent-sheet__head">
        <div>
          <div class="recent-sheet__title">최근 본 페이지</div>
          <small>모바일에서 다시 이동하기 쉽게 최근 방문 경로를 저장합니다.</small>
        </div>
        <button type="button" class="recent-sheet__close" aria-label="닫기">✕</button>
      </div>
      <div class="recent-sheet__list"></div>
    </div>`;

  function renderRecent() {
    const host = sheet.querySelector('.recent-sheet__list');
    if (!host) return;
    const recents = getRecent().filter((item) => item.href && item.href !== '#recent').slice(0, 6);
    if (!recents.length) {
      host.innerHTML = '<div class="recent-sheet__empty">아직 저장된 최근 페이지가 없습니다.</div>';
      return;
    }
    host.innerHTML = recents.map((item) => {
      const when = new Date(item.ts || Date.now());
      const stamp = new Intl.DateTimeFormat('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).format(when);
      return `<a class="recent-sheet__item" href="${item.href}"><strong>${item.title || item.href}</strong><small>${stamp} · ${item.href}</small></a>`;
    }).join('');
  }

  function openSheet() {
    renderRecent();
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('recent-sheet-open');
  }
  function closeSheet() {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('recent-sheet-open');
  }

  items.forEach((item) => {
    const a = document.createElement('a');
    a.className = 'mobile-dock__item' + (item.accent ? ' is-accent' : '');
    a.href = item.href;
    if (!item.external && !item.recent && (path === item.href || (item.href !== '/' && path.startsWith(item.href)))) {
      a.className += ' is-active';
      a.setAttribute('aria-current', 'page');
    }
    if (item.external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    if (item.recent) {
      a.addEventListener('click', (event) => {
        event.preventDefault();
        openSheet();
      });
    }
    a.innerHTML = `<b>${item.icon}</b><span>${item.label}</span>`;
    list.appendChild(a);
  });

  dock.appendChild(list);
  document.body.appendChild(dock);
  document.body.appendChild(sheet);
  document.body.classList.add('has-mobile-dock');

  sheet.querySelector('.recent-sheet__backdrop')?.addEventListener('click', closeSheet);
  sheet.querySelector('.recent-sheet__close')?.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
  });
})();
