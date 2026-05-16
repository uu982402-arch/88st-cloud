/** V34 safe build loader: legacy loader neutralized after syntax audit. Modern CSS/JS are linked directly in HTML. */
(function(){
  window.__BUILD_LOADER_SAFE__ = 'worker-strictfix-v34';
  if (typeof window.track !== 'function') {
    window.track = function(name, params){ try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch(e) {} };
  }
})();
