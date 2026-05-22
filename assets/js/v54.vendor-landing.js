document.addEventListener('click', async (event) => {
  const copy = event.target.closest('[data-v54-copy-code]');
  if (copy) {
    const code = copy.getAttribute('data-v54-copy-code') || copy.textContent.trim();
    try { await navigator.clipboard.writeText(code); }
    catch (_) {
      const temp = document.createElement('textarea');
      temp.value = code;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    document.querySelectorAll('.v54-copy-toast').forEach((node) => node.remove());
    const toast = document.createElement('div');
    toast.className = 'v54-copy-toast';
    toast.textContent = '가입코드가 복사되었습니다';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1600);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'guaranteed_code_copy', version: 'v54', provider: copy.getAttribute('data-v54-provider') || '' });
  }
  const domain = event.target.closest('[data-v54-domain-click]');
  if (domain) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'guaranteed_domain_click', version: 'v54', provider: domain.getAttribute('data-v54-domain-click') || '' });
  }
});
