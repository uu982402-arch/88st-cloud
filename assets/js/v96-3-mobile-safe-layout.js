/* V96.3 MOBILE SAFE LAYOUT PATCH - Chrome/Samsung Internet/iPhone Safari viewport guard */
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;
  root.classList.add('v96-3-overflow-locked');
  body.classList.add('v96-3-mobile-safe-layout');
  body.dataset.v963MobileSafe = 'active';

  const ua = navigator.userAgent || '';
  if (/Chrome|CriOS|SamsungBrowser|EdgA|EdgiOS/i.test(ua)) root.classList.add('v96-3-chrome-web');
  if (/iPhone|iPad|iPod/i.test(ua)) root.classList.add('v96-3-ios-web');

  const selectors = [
    '.v71-page','.v71-main','.v71-shell','.v71-partner-carousel','.v71-blog-grid',
    '.v72-shell','.v72-blog-grid','.v73-shell','.v74-shell','.v74-1-grid','.v74-vendor-grid',
    '.v75-shell','.v79-shell','.v80-shell','.v96-2-shell','.rust-header-inner','.rust-mobile-menu'
  ];

  const apply = () => {
    const vw = Math.max(root.clientWidth || 0, window.innerWidth || 0);
    root.style.setProperty('--v96-3-js-vw', vw + 'px');
    root.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      el.style.minWidth = '0';
      el.style.maxWidth = '100%';
      if (el.scrollWidth > vw + 2 && !el.matches('.v71-partner-carousel,.guaranteed-slider,.vendor-strip,.v96-2-table-wrap')) {
        el.dataset.v963WidthGuard = 'true';
      }
    });
  };

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  };
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(schedule, 120), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
    window.visualViewport.addEventListener('scroll', schedule, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  schedule();
})();
