
(function(){
  var VERSION = "moonsafe-mobile-compact-consult-v30-20260514";
  function apply(){
    document.documentElement.classList.add("v30-mobile-compact");
    document.querySelectorAll(".auto-consult-panel,.auto-consult-body,.auto-consult-foot,.auto-consult-section,.auto-consult-msg,.auto-consult-provider").forEach(function(el){
      el.classList.add("v30-consult-dark");
    });
  }
  document.addEventListener("DOMContentLoaded", apply);
  document.addEventListener("click", function(e){
    if (e.target.closest(".auto-consult-launcher,[data-auto-consult-provider],[data-auto-consult-open]")) {
      setTimeout(apply, 40);
      setTimeout(apply, 180);
      setTimeout(apply, 420);
    }
  }, true);
  new MutationObserver(apply).observe(document.documentElement, { childList:true, subtree:true });
  window.__MOBILE_COMPACT_V30__ = VERSION;
})();
