(() => {
  const PROVIDERS_URL = '/assets/data/guaranteed.providers.v1.20260330.json';
  const TARGET_SLUGS = ['udt', 'anybet'];
  const HIDE_KEY = 'raven_hub_promo_hide_today_v1';
  const PATH_VARIANTS = {
    '/': 'focus',
    '/blog': 'focus',
    '/tools': 'focus',
    '/guaranteed': 'soft'
  };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const normalizePath = (pathname = '') => {
    const raw = String(pathname || '').trim() || '/';
    if (raw === '/') return '/';
    return raw.replace(/\/+$/, '') || '/';
  };

  const currentPath = normalizePath(window.location.pathname);
  const variant = PATH_VARIANTS[currentPath];
  if (!variant) return;

  const pageLabel = (() => {
    if (currentPath === '/') return '메인';
    if (currentPath === '/blog') return '블로그';
    if (currentPath === '/tools') return '도구';
    if (currentPath === '/guaranteed') return '보증업체';
    return '허브';
  })();

  const todayKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getStoredHideDate = () => {
    try { return localStorage.getItem(HIDE_KEY) || ''; }
    catch (_) { return ''; }
  };

  const hideForToday = () => {
    try { localStorage.setItem(HIDE_KEY, todayKey()); }
    catch (_) {}
  };

  if (getStoredHideDate() === todayKey()) return;

  const toast = (message) => {
    let node = document.getElementById('hubPromoToast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'hubPromoToast';
      node.className = 'hub-promo-toast';
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('is-show');
    clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => node.classList.remove('is-show'), 1500);
  };

  const copyText = async (text) => {
    const value = String(text || '').trim();
    if (!value) return false;
    try {
      await navigator.clipboard.writeText(value);
      toast('가입코드를 복사했습니다.');
      return true;
    } catch (_) {
      try {
        const area = document.createElement('textarea');
        area.value = value;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        toast('가입코드를 복사했습니다.');
        return true;
      } catch (__){
        toast('복사 권한을 확인해 주세요.');
        return false;
      }
    }
  };

  const buildCard = (item) => {
    const mediaKind = item.imageKind || ((item.imageUrl || '').toLowerCase().endsWith('.png') ? 'logo' : 'cover');
    const mediaStyle = [
      `--promo-media-pos:${esc(item.imagePosition || 'center center')}`,
      `--promo-media-scale:${esc(item.imageScale || (mediaKind === 'logo' ? '1' : '1.08'))}`,
      `--promo-media-pad:${esc(item.imagePadding || (mediaKind === 'logo' ? '12px 16px' : '0px'))}`
    ].join(';');
    const chips = [item.officialDomain || '', item.code ? `코드 ${item.code}` : ''].filter(Boolean);
    const summary = item.oneLine || '공식 주소와 가입코드를 빠르게 확인할 수 있게 정리했습니다.';
    return `
      <article class="hub-promo-card" data-variant="${esc(variant)}">
        <div class="hub-promo-card__media ${mediaKind === 'logo' ? 'is-logo' : ''}" style="${mediaStyle}">
          <img src="${esc(item.imageUrl || '')}" alt="${esc(item.imageAlt || item.name || '광고 이미지')}" loading="lazy" decoding="async">
        </div>
        <div class="hub-promo-card__body">
          <div class="hub-promo-card__head">
            <strong>${esc(item.name || '')}</strong>
            <div class="hub-promo-chip-row">${chips.map((chip) => `<span class="hub-promo-chip">${esc(chip)}</span>`).join('')}</div>
          </div>
          <p class="hub-promo-card__copy">${esc(summary)}</p>
          <div class="hub-promo-card__actions">
            <button class="hub-promo-btn hub-promo-btn--ghost" type="button" data-hub-promo-copy="${esc(item.code || '')}">
              <span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span>
            </button>
            <a class="hub-promo-btn" href="${esc(item.officialUrl || '#')}" target="_blank" rel="noopener noreferrer">공식 주소</a>
          </div>
        </div>
      </article>`;
  };

  const buildModalHtml = (providers) => {
    const isSoft = variant === 'soft';
    const kicker = isSoft ? '추가 확인' : '추천 업체';
    const title = isSoft ? '추가로 확인해볼 업체' : `${pageLabel}에서 바로 확인할 수 있는 업체`;
    const desc = isSoft
      ? '보증업체 페이지에서는 흐름을 방해하지 않도록 가볍게 보여줍니다.'
      : '공식 주소와 가입코드만 빠르게 확인할 수 있도록 UDT와 Any Bet를 모달로 정리했습니다.';
    return `
      <div class="hub-promo-modal__backdrop" data-hub-promo-close></div>
      <div class="hub-promo-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="hubPromoTitle" data-variant="${esc(variant)}">
        <button class="hub-promo-modal__close" type="button" aria-label="닫기" data-hub-promo-close>×</button>
        <div class="hub-promo-modal__hero">
          <span class="hub-promo-kicker">${esc(kicker)}</span>
          <h2 id="hubPromoTitle">${esc(title)}</h2>
          <p>${esc(desc)}</p>
        </div>
        <div class="hub-promo-modal__grid">
          ${providers.map(buildCard).join('')}
        </div>
        <div class="hub-promo-modal__foot">
          <button class="hub-promo-text-btn" type="button" data-hub-promo-hide>오늘 다시 보지 않기</button>
          <button class="hub-promo-text-btn is-primary" type="button" data-hub-promo-close>닫기</button>
        </div>
      </div>`;
  };

  const ensureRoot = () => {
    let root = document.getElementById('hubPromoModal');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'hubPromoModal';
    root.className = 'hub-promo-modal';
    root.hidden = true;
    document.body.appendChild(root);
    return root;
  };

  const closeModal = () => {
    const root = document.getElementById('hubPromoModal');
    if (!root) return;
    root.hidden = true;
    document.body.classList.remove('is-hub-promo-open');
  };

  const openModal = (providers) => {
    if (!providers.length) return;
    const root = ensureRoot();
    root.innerHTML = buildModalHtml(providers);
    root.hidden = false;
    document.body.classList.add('is-hub-promo-open');
    const closeBtn = root.querySelector('[data-hub-promo-close]');
    closeBtn?.focus({ preventScroll: true });
  };

  const wireRootEvents = () => {
    const root = ensureRoot();
    if (root.dataset.bound === '1') return;
    root.dataset.bound = '1';
    root.addEventListener('click', async (event) => {
      const closeTarget = event.target.closest('[data-hub-promo-close]');
      if (closeTarget) {
        closeModal();
        return;
      }
      const hideTarget = event.target.closest('[data-hub-promo-hide]');
      if (hideTarget) {
        hideForToday();
        closeModal();
        toast('오늘은 다시 표시하지 않습니다.');
        return;
      }
      const copyTarget = event.target.closest('[data-hub-promo-copy]');
      if (copyTarget) {
        const ok = await copyText(copyTarget.getAttribute('data-hub-promo-copy') || '');
        const label = copyTarget.querySelector('[data-copy-label]');
        const defaultLabel = label?.getAttribute('data-default-label') || '가입코드 복사';
        if (ok && label) {
          label.textContent = '복사 완료';
          window.setTimeout(() => { label.textContent = defaultLabel; }, 1300);
        }
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !root.hidden) closeModal();
    });
  };

  const fetchProviders = async () => {
    const response = await fetch(PROVIDERS_URL, { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    const providers = Array.isArray(data.providers) ? data.providers : [];
    const filtered = TARGET_SLUGS
      .map((slug) => providers.find((item) => item && item.slug === slug && !item.pending && item.officialUrl && item.code && item.imageUrl))
      .filter(Boolean);
    return filtered;
  };

  const start = async () => {
    wireRootEvents();
    try {
      const providers = await fetchProviders();
      if (!providers.length) return;
      const delay = variant === 'soft' ? 1250 : 850;
      window.setTimeout(() => {
        if (getStoredHideDate() === todayKey()) return;
        openModal(providers);
      }, delay);
    } catch (_) {
      // noop
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
