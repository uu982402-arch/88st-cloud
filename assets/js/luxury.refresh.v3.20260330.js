
(() => {
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  function copyFromTarget(id) {
    const node = document.getElementById(id);
    return node ? String(node.value || node.textContent || '').trim() : '';
  }
  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try { return document.execCommand('copy'); } finally { input.remove(); }
    }
  }
  function setCopied(btn) {
    btn.classList.add('is-copied');
    clearTimeout(btn._copiedTimer);
    btn._copiedTimer = setTimeout(() => btn.classList.remove('is-copied'), 1800);
  }
  document.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-copy-target]');
    if (!btn) return;
    const text = copyFromTarget(btn.getAttribute('data-copy-target'));
    if (!text) return;
    const ok = await copyText(text);
    if (ok) setCopied(btn);
  });
  document.addEventListener('DOMContentLoaded', () => {
    qsa('[data-copy-target]').forEach((btn) => {
      if (!btn.querySelector('[data-copy-label]') && !btn.textContent.includes('복사')) {
        btn.innerHTML = `<span data-copy-label data-default-label="${btn.textContent.trim()}">${btn.textContent.trim()}</span>`;
      }
    });
  });
})();
