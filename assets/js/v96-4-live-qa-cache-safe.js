/* V96.4 LIVE QA / CACHE SAFE PATCH
 * 라이브 배포 후 캐시 혼재, Android Chrome/Samsung Internet viewport 재계산,
 * 하단바/FAB 겹침, 페이지 전체 overflow를 런타임에서 감지한다.
 */
(() => {
  const BUILD = 'V96.4-LIVE-QA-CACHE-SAFE-20260526';
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;
  root.classList.add('v96-4-cache-safe');
  body.classList.add('v96-4-live-qa-cache-safe');
  body.dataset.v964LiveQaCacheSafe = 'active';
  window.__RUST_V96_4_BUILD__ = BUILD;

  const ua = navigator.userAgent || '';
  if (/Chrome|CriOS|SamsungBrowser|EdgA|EdgiOS/i.test(ua)) root.classList.add('v96-4-chrome-web');
  if (/iPhone|iPad|iPod/i.test(ua)) root.classList.add('v96-4-ios-web');

  const guardedSelectors = [
    '.v71-page','.v71-main','.v71-shell','.v72-shell','.v73-shell','.v74-shell',
    '.v74-1-grid','.v75-shell','.v79-shell','.v80-shell','.v96-2-shell',
    '.rust-header-inner','.rust-mobile-menu','.v71-blog-grid','.v79-grid','.v74-vendor-grid'
  ];
  const allowedHorizontal = '.v71-partner-carousel,.guaranteed-slider,.vendor-strip,.table-wrap,.v96-2-table-wrap,pre';

  const state = { build: BUILD, overflowCandidates: [], lastViewportWidth: 0, checkedAt: null };
  window.__RUST_LIVE_QA__ = state;

  function viewportWidth(){
    const vv = window.visualViewport?.width || 0;
    return Math.floor(Math.max(root.clientWidth || 0, window.innerWidth || 0, vv));
  }
  function apply(){
    const vw = viewportWidth();
    state.lastViewportWidth = vw;
    state.checkedAt = new Date().toISOString();
    root.style.setProperty('--v96-4-js-vw', String(vw) + 'px');
    root.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';
    state.overflowCandidates = [];

    document.querySelectorAll(guardedSelectors.join(',')).forEach((el) => {
      el.style.minWidth = '0';
      el.style.maxWidth = '100%';
      if (!el.matches(allowedHorizontal) && el.scrollWidth > vw + 2) {
        el.dataset.v964OverflowGuard = 'true';
        state.overflowCandidates.push({ selector: el.className || el.tagName, scrollWidth: el.scrollWidth, vw });
      }
    });

    document.querySelectorAll('.v71-partner-carousel,.guaranteed-slider,.vendor-strip').forEach((el) => {
      el.style.overflowX = 'auto';
      el.style.overscrollBehaviorX = 'contain';
    });
  }

  let raf = 0;
  function schedule(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  }
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(schedule, 140), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedule, { passive: true });
    window.visualViewport.addEventListener('scroll', schedule, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  schedule();
})();
