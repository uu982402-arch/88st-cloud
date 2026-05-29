/* V118 CTA A/B labels: one visible label per CTA, managed by data attributes. */
(function(){
  var variants = ['코드 확인 후 이동','가입코드 복사하고 이동','조건 상담 후 이용','혜택표 먼저 확인'];
  var pick = 0;
  try { pick = Math.abs(Array.prototype.reduce.call(location.pathname, function(a,c){return a+c.charCodeAt(0)},0)) % variants.length; } catch(e) {}
  function fire(name, params){
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch(e) {}
  }
  document.querySelectorAll('[data-v118-cta-variants]').forEach(function(el){
    el.setAttribute('data-v118-active-label', variants[pick]);
    if (el.matches('[data-v118-ab-label="go"]') && pick < 2) el.textContent = variants[pick];
    if (el.matches('[data-v118-ab-label="consult"]') && pick === 2) el.textContent = variants[pick];
    if (el.matches('[data-v118-ab-label="detail"]') && pick === 3) el.textContent = variants[pick];
  });
  document.addEventListener('click', function(ev){
    var target = ev.target.closest('[data-ga4-event]');
    if (!target) return;
    fire(target.getAttribute('data-ga4-event'), {
      vendor: target.getAttribute('data-vendor') || '',
      code: target.getAttribute('data-code') || '',
      cta_label: (target.textContent || '').trim(),
      page_path: location.pathname
    });
  }, {capture:true});
  document.documentElement.setAttribute('data-v118-guaranteed-cta-ready','true');
})();
