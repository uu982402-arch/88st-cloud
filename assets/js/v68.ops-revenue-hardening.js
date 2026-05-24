(function(){
  const ready = () => {
    document.documentElement.classList.add('v68-ready');
    const nav = document.querySelector('.v68-mobile-nav');
    if (nav) {
      const path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
      nav.querySelectorAll('a').forEach(a => {
        const route = a.getAttribute('data-v68-route') || a.getAttribute('href') || '/';
        if (route === '/' ? path === '/' : path.startsWith(route)) a.classList.add('is-active');
      });
      let lastY = window.scrollY;
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const now = window.scrollY;
          if (now > lastY && now > 120) nav.classList.add('is-hidden');
          else nav.classList.remove('is-hidden');
          lastY = now;
          ticking = false;
        });
      }, { passive: true });
    }
    const toast = document.createElement('div');
    toast.className = 'v68-toast';
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    document.body.appendChild(toast);
    const showToast = (msg) => {
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(window.__v68ToastTimer);
      window.__v68ToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
    };
    document.querySelectorAll('[data-v68-copy]').forEach(btn => {
      btn.addEventListener('click', async (event) => {
        event.preventDefault();
        const value = btn.getAttribute('data-v68-copy') || '';
        try {
          if (navigator.clipboard && value) await navigator.clipboard.writeText(value);
          showToast(value ? '가입코드가 복사됐습니다: ' + value : '복사할 코드가 없습니다');
        } catch (err) {
          showToast('복사를 지원하지 않는 환경입니다');
        }
      });
    });
    document.querySelectorAll('[data-v68-click]').forEach(el => {
      el.addEventListener('click', () => {
        try {
          const key = 'v68-click-' + (el.getAttribute('data-v68-click') || 'unknown');
          localStorage.setItem(key, String(Number(localStorage.getItem(key) || 0) + 1));
        } catch (err) {}
      });
    });
    if (document.querySelector('[data-v68-ops-root]')) {
      const result = document.querySelector('[data-v68-ops-result]');
      const checks = Array.from(document.querySelectorAll('[data-v68-check]'));
      const run = () => {
        const payload = { version:'V68', time:new Date().toISOString(), checks:checks.map(node => ({ id:node.getAttribute('data-v68-check'), text:node.textContent.trim().slice(0,90), ok:true })) };
        if (result) result.textContent = JSON.stringify(payload, null, 2);
      };
      document.querySelector('[data-v68-run-check]')?.addEventListener('click', run);
      run();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once:true }); else ready();
})();