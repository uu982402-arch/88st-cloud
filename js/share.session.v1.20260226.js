/** V34 safe share helper. */
(function(){
  window.__SHARE_SESSION_SAFE__ = 'worker-strictfix-v34';
  window.shareSessionUrl = window.shareSessionUrl || function(){ try { return location.href; } catch(e) { return ''; } };
})();
