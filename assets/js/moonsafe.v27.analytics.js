
(function(){
  var VERSION = "moonsafe-real-dashboard-final-v27-20260514";
  function track(name, params){
    params = params || {};
    params.v = VERSION;
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params);
      }
    } catch(e) {}
    try {
      window.dispatchEvent(new CustomEvent("moonsafe:v27", { detail: { name:name, params:params }}));
    } catch(e) {}
  }
  function text(el){
    return (el && (el.getAttribute("data-provider") || el.textContent || "") || "").trim().slice(0,80);
  }
  document.addEventListener("click", function(e){
    var code = e.target.closest("[data-g-copy], .moon-code");
    if (code) {
      track("code_copy_click", {
        provider: code.getAttribute("data-provider") || text(code),
        code: code.getAttribute("data-g-copy") || ""
      });
    }
    var open = e.target.closest("[data-g-open], .moon-domain, .moon-provider-chip");
    if (open) {
      track("official_domain_click", {
        provider: open.getAttribute("data-provider") || text(open),
        href: open.getAttribute("href") || ""
      });
    }
    var consult = e.target.closest(".auto-consult-launcher, [href*='/consult/'], [href*='t.me/seoa69'], [href*='odds88st_bot']");
    if (consult) {
      track("consult_entry_click", {
        label: text(consult),
        href: consult.getAttribute("href") || ""
      });
    }
    var inquiry = e.target.closest("[href*='inquiry-builder']");
    if (inquiry) {
      track("inquiry_builder_click", {
        href: inquiry.getAttribute("href") || ""
      });
    }
    var detailCta = e.target.closest(".v27-detail-support a");
    if (detailCta) {
      track("detail_support_cta_click", {
        label: text(detailCta),
        href: detailCta.getAttribute("href") || ""
      });
    }
  }, true);
  document.addEventListener("DOMContentLoaded", function(){
    track("page_v27_ready", {
      path: location.pathname,
      title: document.title
    });
  });
})();
