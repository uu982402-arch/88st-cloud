(() => {
  const path = location.pathname || '/';
  const isHome = path === '/';
  const isBlog = path === '/blog/' || path.startsWith('/blog/');
  const isTools = path === '/tools/' || path.startsWith('/tools/');
  const isGuaranteed = path === '/guaranteed/' || path.startsWith('/guaranteed/');
  if (!(isHome || isBlog || isTools) || isGuaranteed) return;

  const STORAGE_KEY = 'raven_hub_promo_compact_hide_until_v6';
  const PROVIDERS_URL = '/assets/data/guaranteed.providers.v1.20260330.json';
  const ORDER = ['queenbee', 'skholdings', 'anybet', 'udt', 'chess'];
  const CONSULT_URLS = {
    queenbee: '/consult/queenbee/',
    skholdings: '/consult/sk-holdings/',
    anybet: '/consult/anybet/',
    udt: '/consult/udt/',
    chess: '/consult/chess/'
  };
  const DELAY = isHome ? 900 : 1300;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const track = (name, params = {}) => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, { event_category: 'compact_join_modal', page_path: location.pathname, ...params });
      }
    } catch (_) {}
  };
  const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  };
  const isHiddenToday = () => {
    try { return localStorage.getItem(STORAGE_KEY) === todayKey(); } catch (_) { return false; }
  };
  const hideToday = () => {
    try { localStorage.setItem(STORAGE_KEY, todayKey()); } catch (_) {}
  };
  const copyText = async (text) => {
    const value = String(text || '');
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        return true;
      } catch (__) {
        return false;
      }
    }
  };

  function buildCard(item) {
    const consult = CONSULT_URLS[item.slug] || '/consult/';
    const label = (item.name || '').replace(/❤️/g, '').trim() || item.name || '업체';
    return `<article class="hub-promo-card hub-promo-card--compact" data-slug="${esc(item.slug)}">
      <div class="hub-promo-card__body">
        <div class="hub-promo-card__compact-head">
          <h3 class="hub-promo-card__title">${esc(label)}</h3>
          <strong class="hub-promo-card__code-value">${esc(item.code)}</strong>
        </div>
        <p class="hub-promo-card__compact-copy">공식주소와 이벤트 조건은 상담 페이지에서 확인하세요.</p>
        <div class="hub-promo-card__actions hub-promo-card__actions--compact">
          <button class="hub-promo-btn" type="button" data-hub-copy="${esc(item.code)}" data-provider="${esc(item.slug)}">코드 복사</button>
          <a class="hub-promo-btn hub-promo-btn--primary" href="${esc(consult)}" data-provider="${esc(item.slug)}">상담 보기</a>
        </div>
      </div>
    </article>`;
  }

  function createModal(items) {
    const root = document.createElement('div');
    root.className = 'hub-promo-modal hub-promo-modal--compact';
    root.hidden = true;
    root.innerHTML = `<div class="hub-promo-modal__backdrop" data-hub-promo-close></div>
      <div class="hub-promo-modal__sheet" role="dialog" aria-modal="true" aria-labelledby="hubPromoTitle">
        <div class="hub-promo-modal__head">
          <div><span class="hub-promo-modal__eyebrow">빠른 가입 안내</span><strong id="hubPromoTitle">가입코드 확인이 필요하신가요?</strong><p>상담 전 코드만 먼저 확인하고, 자세한 조건은 자동상담에서 이어서 확인하세요.</p></div>
          <button class="hub-promo-modal__close" type="button" aria-label="닫기" data-hub-promo-close>×</button>
        </div>
        <div class="hub-promo-modal__body"><div class="hub-promo-grid">${items.map(buildCard).join('')}</div></div>
        <div class="hub-promo-modal__foot">
          <div class="hub-promo-modal__hint">모든 안내는 정보 확인 목적이며 조건은 변경될 수 있습니다.</div>
          <div class="hub-promo-modal__foot-actions"><button class="hub-promo-modal__ghost" type="button" data-hub-hide-today>오늘 다시 보지 않기</button><button class="hub-promo-modal__ghost" type="button" data-hub-promo-close>닫기</button></div>
        </div>
      </div>`;
    document.body.appendChild(root);

    const close = () => {
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-hub-promo-open');
      track('compact_modal_close');
    };
    const open = () => {
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-hub-promo-open');
      track('compact_modal_open');
    };

    root.addEventListener('click', async (event) => {
      const closeTrigger = event.target.closest('[data-hub-promo-close]');
      if (closeTrigger) { close(); return; }
      const hideTrigger = event.target.closest('[data-hub-hide-today]');
      if (hideTrigger) { hideToday(); close(); track('compact_modal_hide_today'); return; }
      const copyTrigger = event.target.closest('[data-hub-copy]');
      if (copyTrigger) {
        const code = copyTrigger.getAttribute('data-hub-copy') || '';
        const ok = await copyText(code);
        const original = copyTrigger.textContent;
        copyTrigger.textContent = ok ? '복사 완료' : '복사 제한';
        track('compact_modal_code_copy', { provider: copyTrigger.getAttribute('data-provider') || '', code });
        window.setTimeout(() => { copyTrigger.textContent = original; }, 1400);
        return;
      }
      const consultLink = event.target.closest('a.hub-promo-btn--primary');
      if (consultLink) {
        track('compact_modal_consult_click', { provider: consultLink.getAttribute('data-provider') || '' });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !root.hidden) close();
    });
    return { open, close, root };
  }

  async function init() {
    if (isHiddenToday()) return;
    let payload = null;
    try {
      const res = await fetch(PROVIDERS_URL, { cache: 'no-store' });
      payload = await res.json();
    } catch (_) {
      return;
    }
    const providers = Array.isArray(payload?.providers) ? payload.providers : [];
    const selected = ORDER.map((slug) => providers.find((item) => item && !item.pending && item.slug === slug && item.code)).filter(Boolean).slice(0,4);
    if (!selected.length) return;
    const modal = createModal(selected);
    window.setTimeout(() => modal.open(), DELAY);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else window.addEventListener('DOMContentLoaded', init, { once: true });
})();
