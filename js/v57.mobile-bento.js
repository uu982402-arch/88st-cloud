(() => {
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      input.remove();
      return ok;
    }
  };

  document.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-v57-copy-code]');
    if (!btn) return;
    const value = btn.getAttribute('data-v57-copy-code') || btn.textContent.trim();
    const original = btn.textContent;
    const ok = await copyText(value);
    btn.textContent = ok ? '복사됨' : '복사 실패';
    btn.classList.add('is-copied');
    window.setTimeout(() => { btn.textContent = original; btn.classList.remove('is-copied'); }, 1400);
  });

  document.querySelectorAll('.v57-provider-logo-frame img').forEach((img) => {
    const card = img.closest('.v57-premium-provider-card, .v57-provider-card2');
    img.addEventListener('error', () => {
      if (card) card.classList.add('v57-logo-missing');
      img.style.display = 'none';
    });
    if (img.complete && img.naturalWidth === 0 && card) card.classList.add('v57-logo-missing');
  });

  const search = document.querySelector('[data-v57-home-search]');
  if (search) {
    const items = [...document.querySelectorAll('[data-v57-search-item]')];
    const empty = document.querySelector('[data-v57-empty]');
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const hit = !q || (item.getAttribute('data-v57-search-item') || item.textContent || '').toLowerCase().includes(q);
        item.hidden = !hit;
        if (hit) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0 || !q;
    };
    search.addEventListener('input', apply);
  }
})();
