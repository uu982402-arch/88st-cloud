
(function(){
  var VERSION = "moonsafe-mobile-final-v28-20260514";
  function relabel(){
    if (!matchMedia("(max-width: 900px)").matches) return;
    document.querySelectorAll(".moon-nav a, .main-nav a, .gateway-nav a").forEach(function(a){
      var href = a.getAttribute("href") || "";
      if (href === "/") a.setAttribute("aria-label","메인");
      if (href === "/tools/") a.setAttribute("aria-label","도구");
      if (href === "/consult/") a.setAttribute("aria-label","상담");
    });
    var path = location.pathname.replace(/\/index\.html$/,"/");
    document.querySelectorAll(".moon-nav a, .main-nav a, .gateway-nav a").forEach(function(a){
      var href = a.getAttribute("href") || "";
      a.classList.remove("is-active");
      if ((path === "/" && href === "/") || (path.indexOf("/blog/") === 0 && href === "/blog/") || (path.indexOf("/tools/") === 0 && href === "/tools/") || (path.indexOf("/consult/") === 0 && href === "/consult/")) {
        a.classList.add("is-active");
      }
    });
  }
  document.addEventListener("DOMContentLoaded", relabel);
  window.addEventListener("resize", relabel);
  window.__MOBILE_FINAL_V28__ = VERSION;
})();
