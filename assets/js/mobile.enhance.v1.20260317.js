
(() => {
  const path = location.pathname || '/';
  if (window.Telegram?.WebApp || /\/tg-match-entry\/?$/i.test(path)) return;
  if (window.innerWidth > 980) return;
  if (document.querySelector('.mobile-dock')) return;

  const items = [
    { href: '/analysis/', label: '분석', icon: '⌁' },
    { href: '/', label: '홈', icon: '⌂' },
    { href: '/play-guides/', label: '가이드', icon: '☷', accent: true },
    { href: 'https://t.me/kakacloud', label: '문의', icon: '✦', external: true }
  ];

  const dock = document.createElement('nav');
  dock.className = 'mobile-dock';
  dock.setAttribute('aria-label', '모바일 빠른 이동');
  const list = document.createElement('div');
  list.className = 'mobile-dock__list';

  items.forEach((item) => {
    const a = document.createElement('a');
    a.className = 'mobile-dock__item' + (item.accent ? ' is-accent' : '');
    a.href = item.href;
    if (!item.external && (path === item.href || (item.href !== '/' && path.startsWith(item.href)))) {
      a.className += ' is-active';
      a.setAttribute('aria-current', 'page');
    }
    if (item.external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    a.innerHTML = `<b>${item.icon}</b><span>${item.label}</span>`;
    list.appendChild(a);
  });

  dock.appendChild(list);
  document.body.appendChild(dock);
  document.body.classList.add('has-mobile-dock');

  let dockSyncRaf = 0;
  function syncDockViewport() {
    const vv = window.visualViewport;
    let bottomGap = 0;
    if (vv) {
      bottomGap = Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
    }
    document.documentElement.style.setProperty('--mobile-dock-bottom-gap', `${bottomGap}px`);
    dock.style.transform = 'translate3d(0,0,0)';
  }
  function scheduleDockSync() {
    if (dockSyncRaf) cancelAnimationFrame(dockSyncRaf);
    dockSyncRaf = requestAnimationFrame(syncDockViewport);
  }
  scheduleDockSync();
  window.addEventListener('scroll', scheduleDockSync, { passive: true });
  window.addEventListener('resize', scheduleDockSync, { passive: true });
  window.addEventListener('orientationchange', scheduleDockSync, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleDockSync, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleDockSync, { passive: true });
  }
})();
