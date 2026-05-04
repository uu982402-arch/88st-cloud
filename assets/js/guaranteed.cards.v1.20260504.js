(() => {
  const copyText = async (text) => {
    const value = String(text || '').trim();
    if (!value) return false;
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
  const toast = (message) => {
    const el = document.querySelector('.gtoast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-show'), 1500);
  };
  document.addEventListener('click', async (event) => {
    const copy = event.target.closest('[data-g-copy]');
    if (copy) {
      event.preventDefault();
      const code = copy.getAttribute('data-g-copy');
      const ok = await copyText(code);
      toast(ok ? `가입코드 ${code} 복사 완료` : `가입코드 ${code} 확인`);
      return;
    }
    const open = event.target.closest('[data-g-open]');
    if (open) {
      event.preventDefault();
      const code = open.getAttribute('data-g-code');
      const href = open.getAttribute('href');
      if (code) await copyText(code);
      toast(code ? `가입코드 ${code} 복사 후 이동합니다` : '사이트로 이동합니다');
      setTimeout(() => {
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
      }, 120);
    }
  });
})();