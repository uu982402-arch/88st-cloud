(() => {
  const toast = document.getElementById('v96-2-toast');
  const showToast = (msg = '가입코드가 복사되었습니다') => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(window.__v962ToastTimer);
    window.__v962ToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1600);
  };
  const copyCode = async (code) => {
    if (!code) return false;
    try { await navigator.clipboard.writeText(code); return true; }
    catch (err) {
      const input = document.createElement('input');
      input.value = code; document.body.appendChild(input); input.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      input.remove(); return ok;
    }
  };
  document.addEventListener('click', async (event) => {
    const copy = event.target.closest('[data-v92-copy]');
    if (copy) {
      event.preventDefault();
      const ok = await copyCode(copy.dataset.code || '');
      showToast(ok ? '가입코드가 복사되었습니다' : '코드를 직접 확인해 주세요');
      window.gtag?.('event', copy.dataset.ga4Event || 'vendor_copy_code', { vendor: copy.dataset.vendor || '', code: copy.dataset.code || '' });
      return;
    }
    const go = event.target.closest('[data-v92-go]');
    if (go) {
      event.preventDefault();
      await copyCode(go.dataset.code || '');
      showToast('가입코드 복사 후 이동합니다');
      window.gtag?.('event', go.dataset.ga4Event || 'vendor_outbound_click', { vendor: go.dataset.vendor || '', code: go.dataset.code || '' });
      const href = go.dataset.href;
      if (href) setTimeout(() => window.open(href, '_blank', 'noopener,noreferrer'), 180);
    }
  }, { passive:false });
})();
