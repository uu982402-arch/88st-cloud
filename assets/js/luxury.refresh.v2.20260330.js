(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  function copyText(text) {
    if (!text) return Promise.reject(new Error('empty'));
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const input = document.createElement('textarea');
      input.value = text; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.appendChild(input); input.focus(); input.select();
      try { document.execCommand('copy') ? resolve() : reject(new Error('copy')); } catch (err) { reject(err); } finally { input.remove(); }
    });
  }
  function pulseCopied(btn, originalLabel) {
    btn.classList.add('is-copied');
    const labelNode = btn.querySelector('[data-copy-label]');
    if (labelNode) labelNode.textContent = '복사';
    clearTimeout(btn._copiedTimer);
    btn._copiedTimer = setTimeout(() => {
      btn.classList.remove('is-copied');
      if (labelNode) labelNode.textContent = originalLabel || labelNode.dataset.defaultLabel || '복사';
    }, 1800);
  }
  function normalizeCopyLabels() {
    qsa('[data-copy-code], [data-copy-text], .btn-copy[data-copy-target]').forEach((btn) => {
      if (!btn.querySelector('[data-copy-label]')) {
        const label = btn.textContent.trim() || '복사';
        btn.innerHTML = `<span data-copy-label data-default-label="${label}">${label}</span>`;
      }
    });
  }
  function wireGlobalCopy() {
    document.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-copy-code], [data-copy-text], [data-copy-target]');
      if (!btn) return;
      const targetId = btn.getAttribute('data-copy-target');
      const target = targetId ? document.getElementById(targetId) : null;
      const text = btn.getAttribute('data-copy-code') || btn.getAttribute('data-copy-text') || (target ? target.textContent.trim() : '');
      if (!text) return;
      const labelNode = btn.querySelector('[data-copy-label]');
      const originalLabel = labelNode ? (labelNode.dataset.defaultLabel || labelNode.textContent.trim()) : btn.textContent.trim();
      if (labelNode && !labelNode.dataset.defaultLabel) labelNode.dataset.defaultLabel = originalLabel;
      try { await copyText(text); pulseCopied(btn, originalLabel); } catch (err) { btn.classList.remove('is-copied'); }
    });
  }
  function wireShowcaseControls() {
    const grid = qs('[data-showcase-grid]');
    if (!grid) return;
    const filters = qsa('[data-showcase-filter]');
    const sort = qs('[data-showcase-sort]');
    function cards(){ return qsa('.promo-showcase-card', grid); }
    function apply(){
      const active = qs('[data-showcase-filter].is-active')?.getAttribute('data-showcase-filter') || 'all';
      const sortValue = sort?.value || 'featured';
      const list = cards();
      list.forEach((card) => {
        const categories = String(card.getAttribute('data-categories') || '').split('|').filter(Boolean);
        card.hidden = !(active === 'all' || categories.includes(active));
      });
      const visible = list.filter((card) => !card.hidden);
      visible.sort((a, b) => {
        if (sortValue === 'name') return String(a.dataset.brand || '').localeCompare(String(b.dataset.brand || ''), 'ko');
        if (sortValue === 'benefit') return Number(b.dataset.benefitRank || 0) - Number(a.dataset.benefitRank || 0);
        if (sortValue === 'code') return String(a.dataset.code || '').localeCompare(String(b.dataset.code || ''), 'ko');
        return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
      }).forEach((card) => grid.appendChild(card));
      let empty = qs('.showcase-empty', grid.parentElement);
      if (!visible.length) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'showcase-empty';
          empty.textContent = '조건에 맞는 브랜드 카드가 없습니다.';
          grid.insertAdjacentElement('afterend', empty);
        }
      } else if (empty) empty.remove();
    }
    filters.forEach((btn) => btn.addEventListener('click', () => { filters.forEach((el) => el.classList.remove('is-active')); btn.classList.add('is-active'); apply(); }));
    if (sort) sort.addEventListener('change', apply);
    apply();
  }
  document.addEventListener('DOMContentLoaded', () => { normalizeCopyLabels(); wireGlobalCopy(); wireShowcaseControls(); });
})();
