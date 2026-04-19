
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  const ensureModalCleanup = () => {
    document.querySelectorAll('.hub-promo-modal__head p').forEach((node) => node.remove());
  };

  ready(() => {
    document.querySelectorAll('.header-actions a').forEach((link) => {
      const text = (link.textContent || '').trim();
      if (text && /제보|문의|telegram/i.test(text)) link.textContent = 'Telegram';
      link.setAttribute('aria-label', 'Telegram');
    });

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set(String(link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', Array.from(rel).join(' '));
    });

    document.querySelectorAll('table.toolkit-table, table.tool-storage-table').forEach((table) => {
      if (table.parentElement && table.parentElement.classList.contains('table-scroller')) return;
      const wrap = document.createElement('div');
      wrap.className = 'table-scroller';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });

    const homeQuickSearch = document.getElementById('homeQuickSearch');
    if (homeQuickSearch) homeQuickSearch.remove();

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-scroll-target]');
      if (!trigger) return;
      const id = trigger.getAttribute('data-scroll-target');
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      document.querySelectorAll('[data-scroll-target]').forEach((btn) => btn.classList.toggle('is-active', btn === trigger));
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    ensureModalCleanup();
    const observer = new MutationObserver(() => ensureModalCleanup());
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
