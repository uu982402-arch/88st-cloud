(function () {
  var COPY_EVENT = 'v82_3_indexing_copy';
  function copyText(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return fallback(text); });
    }
    return Promise.resolve(fallback(text));
  }
  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function flash(button, message) {
    var original = button.textContent;
    button.textContent = message;
    button.disabled = true;
    window.setTimeout(function () { button.textContent = original; button.disabled = false; }, 1200);
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-v82-copy]');
    if (!button) return;
    var target = button.getAttribute('data-v82-copy');
    var node = document.querySelector(target);
    var text = node ? node.textContent.trim() : '';
    copyText(text).then(function (ok) {
      flash(button, ok ? '복사 완료' : '복사 실패');
      window.dispatchEvent(new CustomEvent(COPY_EVENT, { detail: { ok: ok, target: target } }));
      if (window.gtag) window.gtag('event', 'ops_indexing_copy', { target: target, success: ok });
    });
  });
})();
