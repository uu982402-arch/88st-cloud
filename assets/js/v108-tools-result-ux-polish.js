(function(){
  if (window.__V108_TOOLS_RESULT_UX__) return;
  window.__V108_TOOLS_RESULT_UX__ = true;
  var toastTimer = null;
  function emit(name, params){
    try {
      if (window.gtag) window.gtag('event', name, params || {});
      document.dispatchEvent(new CustomEvent('rust:ga4', { detail: { event: name, params: params || {} } }));
    } catch(e) {}
  }
  function ensureToast(){
    var toast = document.querySelector('[data-v108-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'v108-toast';
      toast.setAttribute('data-v108-toast','true');
      toast.setAttribute('role','status');
      toast.setAttribute('aria-live','polite');
      document.body.appendChild(toast);
    }
    return toast;
  }
  function showToast(msg){
    var toast = ensureToast();
    toast.textContent = msg || '완료되었습니다';
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('is-show'); }, 1700);
  }
  function textFromResult(resultBox){
    var modal = resultBox.closest('.v73-modal,.v103-modal') || document;
    var heading = modal.querySelector('[data-v73-modal-title],[data-v103-title]');
    var value = resultBox.querySelector('[data-v73-result-value],[data-v103-result]');
    var note = resultBox.querySelector('[data-v73-result-note],[data-v103-note]');
    return [heading && heading.textContent.trim(), value && value.textContent.trim(), note && note.textContent.trim()].filter(Boolean).join('\n');
  }
  function copyText(text){
    text = String(text || '').trim();
    if (!text) return showToast('복사할 결과가 없습니다');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){ showToast('결과 요약을 복사했습니다'); }).catch(function(){ showToast('복사를 다시 시도해주세요'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      try { document.execCommand('copy'); showToast('결과 요약을 복사했습니다'); } catch(e) { showToast('복사를 다시 시도해주세요'); }
      ta.remove();
    }
    emit('tool_copy_result', { tool_version:'v108', source:'result_panel' });
  }
  function decorateResult(resultBox, type){
    if (!resultBox || resultBox.dataset.v108Decorated === 'true') return;
    resultBox.dataset.v108Decorated = 'true';
    resultBox.setAttribute('data-v108-result-panel', type || 'tool');
    resultBox.setAttribute('aria-live','polite');
    var head = document.createElement('div');
    head.className = 'v108-result-head';
    head.innerHTML = '<span>결과 요약</span><button class="v108-copy-mini" type="button" data-v108-copy-panel>요약 복사</button>';
    resultBox.insertBefore(head, resultBox.firstChild);
    var state = document.createElement('div');
    state.className = 'v108-result-state';
    state.setAttribute('data-v108-result-state','true');
    state.textContent = '입력값 변경 시 결과가 자동 갱신됩니다.';
    resultBox.appendChild(state);
  }
  function decorate(){
    decorateResult(document.querySelector('.v73-result'), 'v73');
    decorateResult(document.querySelector('.v103-result'), 'v103');
  }
  function markUpdated(modal){
    var state = modal && modal.querySelector('[data-v108-result-state]');
    if (!state) return;
    state.textContent = '방금 계산 결과가 갱신되었습니다.';
    clearTimeout(state.__v108Timer);
    state.__v108Timer = setTimeout(function(){ state.textContent = '입력값 변경 시 결과가 자동 갱신됩니다.'; }, 1800);
  }
  document.addEventListener('DOMContentLoaded', decorate);
  if (document.readyState !== 'loading') decorate();
  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-v108-copy-panel]');
    if (btn) {
      e.preventDefault();
      var resultBox = btn.closest('.v73-result,.v103-result');
      copyText(textFromResult(resultBox));
    }
    if (e.target.closest('[data-v73-copy],[data-v103-copy]')) {
      setTimeout(function(){ showToast('결과를 복사했습니다'); }, 80);
    }
    if (e.target.closest('[data-v73-reset],[data-v103-reset]')) {
      setTimeout(function(){ showToast('입력값을 초기화했습니다'); }, 80);
      emit('tool_reset', { tool_version:'v108' });
    }
  });
  document.addEventListener('input', function(e){
    if (e.target.closest('[data-v73-form]')) markUpdated(document.querySelector('.v73-modal'));
    if (e.target.closest('[data-v103-form]')) markUpdated(document.querySelector('.v103-modal'));
  }, true);
  document.addEventListener('change', function(e){
    if (e.target.closest('[data-v73-form]')) markUpdated(document.querySelector('.v73-modal'));
    if (e.target.closest('[data-v103-form]')) markUpdated(document.querySelector('.v103-modal'));
  }, true);
})();
