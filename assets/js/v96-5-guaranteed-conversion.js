/* V96.5 GUARANTEED CONVERSION PATCH */
(() => {
  'use strict';
  const VERSION = 'static-v96-5-guaranteed-conversion-20260526';
  if (!document.body || !location.pathname.startsWith('/guaranteed/')) return;
  document.documentElement.classList.add('v96-5-guaranteed-conversion');
  document.body.classList.add('v96-5-guaranteed-conversion');
  document.body.dataset.v965GuaranteedConversion = 'active';
  window.__RUST_V96_5_BUILD__ = 'V96.5-GUARANTEED-CONVERSION-20260526';

  const vendorData = {"sk-holdings": {"slug": "sk-holdings", "name": "SK 홀딩스", "short": "SK", "code": "IRON888", "domain": "snk-99.com", "href": "https://snk-99.com/", "accent": "#67E8F9", "img": "/assets/img/guaranteed/cards/sk-holdings.webp", "tag": "입금 플러스", "order": 1}, "zakum": {"slug": "zakum", "name": "자쿰", "short": "자쿰", "code": "zk888", "domain": "zk-777.com", "href": "https://zk-777.com/?code=zk888", "accent": "#F6C96B", "img": "/assets/img/guaranteed/cards/zakum.webp", "tag": "USDT 시스템", "order": 2}, "udt": {"slug": "udt", "name": "UDT BET", "short": "UDT", "code": "SEOA", "domain": "udt-01.com", "href": "https://udt-01.com/", "accent": "#10B981", "img": "/assets/img/guaranteed/cards/udt-bet.webp", "tag": "스포츠·미니", "order": 3}, "queenbee": {"slug": "queenbee", "name": "여왕벌", "short": "여왕벌", "code": "SEOA", "domain": "qb-700.com", "href": "https://qb-700.com/?code=seoa", "accent": "#F6C96B", "img": "/assets/img/guaranteed/cards/queenbee.webp", "tag": "첫충·USDT", "order": 4}, "ddangkong": {"slug": "ddangkong", "name": "땅콩 BET", "short": "땅콩", "code": "DDK888", "domain": "ddk-2024.com", "href": "https://ddk-2024.com/", "accent": "#FB7185", "img": "/assets/img/guaranteed/cards/ddangkong-bet.webp", "tag": "콤프·룰렛", "order": 5}, "anybet": {"slug": "anybet", "name": "ANY BET", "short": "ANY", "code": "SEOA", "domain": "any-777.com", "href": "https://any-777.com/", "accent": "#A78BFA", "img": "/assets/img/guaranteed/cards/anybet.webp", "tag": "원화·테더", "order": 6}};
  let toastTimer;
  function emit(name, params) {
    const payload = Object.assign({rust_version: VERSION, page_path: location.pathname, page_title: document.title}, params || {});
    if (window.RUST_GA4 && typeof window.RUST_GA4.event === 'function') return window.RUST_GA4.event(name, payload);
    if (typeof window.gtag === 'function') window.gtag('event', name, payload);
  }
  function showToast(message) {
    let el = document.querySelector('.v96-5-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'v96-5-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 1850);
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','readonly');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch(e) { ok = false; }
    ta.remove();
    return ok;
  }
  function copyText(text) {
    text = String(text || '').trim();
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function vendorFromCard(card) {
    const slug = card?.getAttribute('data-vendor') || '';
    const data = vendorData[slug] || {};
    return {
      slug,
      name: card?.querySelector('h2')?.textContent?.trim() || data.name || '보증업체',
      code: card?.querySelector('code')?.textContent?.trim() || data.code || '',
      detail: card?.querySelector('[data-v92-detail]')?.getAttribute('href') || `/guaranteed/${slug}/`,
      href: card?.querySelector('[data-v92-go]')?.getAttribute('data-href') || data.href || ''
    };
  }
  document.querySelectorAll('.v74-1-vendor-card[data-v965-card="true"] .v74-1-info-grid code').forEach((code) => {
    code.setAttribute('role','button');
    code.setAttribute('tabindex','0');
    code.setAttribute('aria-label', `${code.textContent.trim()} 가입코드 복사`);
  });

  document.addEventListener('click', (ev) => {
    const codeChip = ev.target.closest('.v74-1-vendor-card[data-v965-card="true"] .v74-1-info-grid code');
    if (codeChip) {
      ev.preventDefault();
      ev.stopPropagation();
      const card = codeChip.closest('.v74-1-vendor-card');
      const vendor = vendorFromCard(card);
      copyText(vendor.code).then((ok) => {
        codeChip.classList.remove('v96-5-copy-pulse');
        void codeChip.offsetWidth;
        codeChip.classList.add('v96-5-copy-pulse');
        showToast(ok ? `${vendor.name} 가입코드 ${vendor.code} 복사 완료` : `${vendor.name} 가입코드: ${vendor.code}`);
        emit('vendor_copy_code', {vendor_name: vendor.name, vendor_code: vendor.code, source: 'v96_5_code_chip'});
      });
      return;
    }

    const card = ev.target.closest('.v74-1-vendor-card[data-v965-card="true"]');
    if (card && !ev.target.closest('a,button,input,select,textarea,[role="button"]')) {
      const vendor = vendorFromCard(card);
      if (vendor.detail) {
        emit('vendor_detail_click', {vendor_name: vendor.name, link_url: vendor.detail, source: 'v96_5_card_body'});
        location.href = vendor.detail;
      }
    }
  }, false);

  document.addEventListener('keydown', (ev) => {
    if ((ev.key !== 'Enter' && ev.key !== ' ') || !ev.target.matches('.v74-1-info-grid code')) return;
    ev.preventDefault();
    ev.target.click();
  });

  document.addEventListener('click', (ev) => {
    const primary = ev.target.closest('.v96-5-detail-quickbar [data-v92-go], .v96-5-detail-quickbar [data-v92-copy]');
    if (primary) emit(primary.hasAttribute('data-v92-go') ? 'vendor_outbound_click' : 'vendor_copy_code', {vendor_name: primary.getAttribute('data-vendor') || '', vendor_code: primary.getAttribute('data-code') || '', source: 'v96_5_quickbar'});
  }, true);

  window.RUST_GUARANTEED_CONVERSION = Object.freeze({version: VERSION, marker: 'V96_5_GUARANTEED_CONVERSION_ACTIVE', vendors: Object.keys(vendorData)});
})();
