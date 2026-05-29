/* V107 guaranteed CRO polish: extra-safe copy state only. Existing outbound/copy handlers stay in charge. */
(() => {
  const showState = (el, text) => {
    if (!el) return;
    const original = el.dataset.v107OriginalText || el.textContent.trim();
    el.dataset.v107OriginalText = original;
    el.classList.add('v107-copy-state');
    el.textContent = text;
    window.setTimeout(() => { el.textContent = original; el.classList.remove('v107-copy-state'); }, 1200);
  };
  document.addEventListener('click', (event) => {
    const copy = event.target.closest('[data-v92-copy]');
    if (copy) showState(copy.querySelector('strong') || copy, '복사됨');
    const go = event.target.closest('[data-v92-go]');
    if (go) go.classList.add('v107-pressed');
  }, { passive: true });
})();
