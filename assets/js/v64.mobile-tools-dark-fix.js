(() => {
  const V64 = 'static-growth-conversion-v64';
  const navItems = [
    ['/', '홈', '메인'],
    ['/blog/', '블로그', '블로그'],
    ['/tools/', '도구', '도구'],
    ['/guaranteed/', '보증', '보증업체'],
    ['/consult/', '센터', '고객센터']
  ];
  const normalizePath = (p) => (p || '/').replace(/index\.html$/, '').replace(/\/$/, '/') || '/';
  const current = normalizePath(location.pathname);
  const setNav = (nav) => {
    if (!nav || nav.dataset.v64NavFixed === '1') return;
    const isBottom = /bottom/i.test(nav.className || '') || nav.matches('.v58-bottom-nav,.v62-bottom,.mobile-bottom-nav,[class*="bottom-nav"]');
    if (!isBottom) return;
    nav.innerHTML = navItems.map(([href, short, label]) => {
      const active = current === href || (href !== '/' && current.startsWith(href));
      return `<a href="${href}" class="${active ? 'is-active' : ''}" ${active ? 'aria-current="page"' : ''}><span>${short}</span><small>${label}</small></a>`;
    }).join('');
    nav.dataset.v64NavFixed = '1';
  };
  const fixAllNav = () => document.querySelectorAll('.v58-bottom-nav,.v62-bottom,.mobile-bottom-nav,[class*="bottom-nav"]').forEach(setNav);
  const fixImages = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (img.dataset.v64ImgReady === '1') return;
      img.dataset.v64ImgReady = '1';
      img.addEventListener('error', () => {
        const parent = img.parentElement;
        img.style.display = 'none';
        if (parent && !parent.querySelector('.v64-img-fallback')) {
          const fallback = document.createElement('span');
          fallback.className = 'v64-img-fallback';
          fallback.textContent = (img.alt || '88ST').replace(/\s*로고\s*/g, '').slice(0, 10);
          Object.assign(fallback.style, {
            display: 'grid', placeItems: 'center', width: '100%', height: '100%', minHeight: '96px',
            color: '#fff', fontWeight: '950', letterSpacing: '-0.06em', background: '#020305', borderRadius: '16px'
          });
          parent.appendChild(fallback);
        }
      }, { once: true });
    });
  };
  const fixToolCards = () => {
    document.querySelectorAll('.v51-tool-card,.v52-tool-card,.v58-tool-card,.v62-tool-card,.tool-card,[class*="tool-card"]').forEach((card) => {
      card.classList.add('v64-dark-tool-card');
      card.style.removeProperty('background-image');
    });
  };
  const boot = () => { fixAllNav(); fixImages(); fixToolCards(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  new MutationObserver(() => boot()).observe(document.documentElement, { childList: true, subtree: true });
  window.__V64_MOBILE_TOOLS_DARK_FIX__ = V64;
})();
