(() => {
  const page = document.body?.dataset?.communityPage || '';
  const targets = new Set(['home', 'blog', 'tools', 'guaranteed']);
  if (!targets.has(page)) return;

  const STORAGE_KEY = 'raven_hub_promo_hide_until_v1';
  const PROVIDERS_URL = '/assets/data/guaranteed.providers.v1.20260330.json';
  const ORDER = ['anybet', 'udt'];
  const DELAY = page === 'home' ? 900 : page === 'guaranteed' ? 1500 : 1150;
  const isSoft = page === 'guaranteed';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const todayKey = () => {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${m}-${d}`;
  };
  const isHiddenToday = () => {
    try { return localStorage.getItem(STORAGE_KEY) === todayKey(); }
    catch (_) { return false; }
  };
  const hideToday = () => {
    try { localStorage.setItem(STORAGE_KEY, todayKey()); }
    catch (_) {}
  };
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ''));
      return true;
    } catch (_) {
      try {
        const ta = document.createElement('textarea');
        ta.value = String(text || '');
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

  function renderBenefitGroups(item) {
    const groups = Array.isArray(item.modalBenefitGroups) ? item.modalBenefitGroups.filter(Boolean) : [];
    if (!groups.length) {
      const items = Array.isArray(item.benefits) ? item.benefits.filter(Boolean).slice(0, 5) : [];
      if (!items.length) return '';
      return `<section class="hub-promo-card__benefits" aria-label="혜택 안내"><strong class="hub-promo-card__benefit-title">혜택 안내</strong><ul class="hub-promo-card__benefit-list">${items.map((entry) => `<li>${esc(entry)}</li>`).join('')}</ul></section>`;
    }
    const title = item.modalBenefitTitle || '혜택 안내';
    return `<section class="hub-promo-card__benefits" aria-label="${esc(title)}"><strong class="hub-promo-card__benefit-title">${esc(title)}</strong>${groups.map((group) => {
      const groupTitle = group && group.title ? `<span class="hub-promo-card__benefit-group-title">${esc(group.title)}</span>` : '';
      const items = Array.isArray(group?.items) ? group.items.filter(Boolean) : [];
      if (!items.length) return '';
      return `<div class="hub-promo-card__benefit-group">${groupTitle}<ul class="hub-promo-card__benefit-list">${items.map((entry) => `<li>${esc(entry)}</li>`).join('')}</ul></div>`;
    }).join('')}</section>`;
  }

  function buildCard(item) {
    const style = `--promo-pos:${esc(item.imagePosition || 'center center')};--promo-scale:${esc(item.imageScale || '1')};--promo-pad:${esc(item.imagePadding || '10px 16px')}`;
    const benefits = renderBenefitGroups(item);
    return `<article class="hub-promo-card" data-slug="${esc(item.slug)}"><div class="hub-promo-card__media" style="${style}"><img src="${esc(item.imageUrl)}" alt="${esc(item.imageAlt || `${item.name} 로고`)}" loading="eager" decoding="async"></div><div class="hub-promo-card__body"><div class="hub-promo-card__top"><h3 class="hub-promo-card__title">${esc(item.name)}</h3></div>${benefits}<div class="hub-promo-card__code"><span class="hub-promo-card__code-label">가입코드</span><strong class="hub-promo-card__code-value">${esc(item.code)}</strong></div><div class="hub-promo-card__actions"><button class="hub-promo-btn hub-promo-btn--secondary" type="button" data-hub-copy="${esc(item.code)}">코드 복사</button><a class="hub-promo-btn hub-promo-btn--primary" href="${esc(item.officialUrl)}" target="_blank" rel="noopener noreferrer">공식 주소 바로가기</a></div></div></article>`;
  }

  function createModal(items) {
    const root = document.createElement('div');
    root.className = `hub-promo-modal${isSoft ? ' is-soft' : ''}`;
    root.hidden = true;
    const title = isSoft ? '보증업체 빠른 확인' : '오늘 확인할 보증업체';
    root.innerHTML = `<div class="hub-promo-modal__backdrop" data-hub-promo-close></div><div class="hub-promo-modal__sheet" role="dialog" aria-modal="true" aria-labelledby="hubPromoTitle"><div class="hub-promo-modal__head"><div><span class="hub-promo-modal__eyebrow">${isSoft ? '빠른 안내' : '허브 추천'}</span><strong id="hubPromoTitle">${title}</strong></div><button class="hub-promo-modal__close" type="button" aria-label="닫기" data-hub-promo-close>×</button></div><div class="hub-promo-modal__body"><div class="hub-promo-grid">${items.map(buildCard).join('')}</div></div><div class="hub-promo-modal__foot"><div class="hub-promo-modal__hint">오늘 다시 보지 않기를 누르면 같은 브라우저에서는 오늘 하루 동안 다시 열리지 않습니다.</div><div class="hub-promo-modal__foot-actions"><button class="hub-promo-modal__ghost" type="button" data-hub-hide-today>오늘 다시 보지 않기</button><button class="hub-promo-modal__ghost" type="button" data-hub-promo-close>닫기</button></div></div></div>`;
    document.body.appendChild(root);

    const close = () => {
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-hub-promo-open');
    };
    const open = () => {
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-hub-promo-open');
    };

    root.addEventListener('click', async (event) => {
      const closeTrigger = event.target.closest('[data-hub-promo-close]');
      if (closeTrigger) {
        close();
        return;
      }
      const hideTrigger = event.target.closest('[data-hub-hide-today]');
      if (hideTrigger) {
        hideToday();
        close();
        return;
      }
      const copyTrigger = event.target.closest('[data-hub-copy]');
      if (copyTrigger) {
        const ok = await copyText(copyTrigger.getAttribute('data-hub-copy') || '');
        const original = copyTrigger.textContent;
        copyTrigger.textContent = ok ? '복사 완료' : '복사 제한';
        window.setTimeout(() => { copyTrigger.textContent = original; }, 1400);
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
    const selected = ORDER.map((slug) => providers.find((item) => item && !item.pending && item.slug === slug && item.officialUrl && item.code && item.imageUrl)).filter(Boolean);
    if (!selected.length) return;
    const modal = createModal(selected);
    window.setTimeout(() => modal.open(), DELAY);
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });
})();
