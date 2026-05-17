
(function(){
  var VERSION = "static-growth-conversion-v36-20260516";
  var BOT_URL = "https://t.me/TRS999_bot";
  function track(name, params){
    params = params || {};
    params.version = VERSION;
    params.path = location.pathname;
    try { if (typeof window.gtag === "function") window.gtag("event", name, params); } catch(e) {}
    try { window.dispatchEvent(new CustomEvent("v36:conversion", { detail: { name:name, params:params }})); } catch(e) {}
  }
  function label(el){
    return (el && (el.getAttribute("data-provider") || el.getAttribute("aria-label") || el.textContent || "") || "").trim().replace(/\s+/g," ").slice(0,100);
  }
  function toast(msg){
    try {
      var old = document.querySelector(".v36-toast");
      if (old) old.remove();
      var el = document.createElement("div");
      el.className = "v36-toast";
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 2300);
    } catch(e) {}
  }
  function copyText(text){
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function(){});
    }
  }
  document.addEventListener("click", function(e){
    var code = e.target.closest("[data-g-copy],.moon-code,[data-copy-code]");
    if (code) {
      var codeValue = code.getAttribute("data-g-copy") || code.getAttribute("data-copy-code") || (code.querySelector("b") && code.querySelector("b").textContent) || "";
      copyText(codeValue.trim());
      toast("가입코드를 복사했습니다. 공식주소와 조건을 함께 확인하세요.");
      track("code_copy", { provider: code.getAttribute("data-provider") || label(code), code: codeValue.trim() });
    }

    var domain = e.target.closest("[data-g-open],.moon-domain,.moon-provider-chip");
    if (domain) {
      track("official_domain_click", { provider: domain.getAttribute("data-provider") || label(domain), href: domain.getAttribute("href") || "" });
    }

    var consult = e.target.closest(".auto-consult-launcher,[href*='/consult/'],[href*='t.me/TRS999_bot'],[href*='TRS999_bot']");
    if (consult) {
      var href = consult.getAttribute("href") || "";
      track(href.indexOf("TRS999_bot") > -1 ? "consult_bot_click" : "consult_open", { label: label(consult), href: href });
    }

    var inquiry = e.target.closest("[href*='inquiry-builder']");
    if (inquiry) track("inquiry_builder_click", { href: inquiry.getAttribute("href") || "" });

    var related = e.target.closest(".v36-related-links a,.v36-growth-hubs a,.v36-conversion-cta a");
    if (related) track("internal_recommendation_click", { label: label(related), href: related.getAttribute("href") || "" });
  }, true);
  document.addEventListener("DOMContentLoaded", function(){
    document.documentElement.classList.add("v36-growth-ready");
    track("seo_page_ready", { title: document.title });
  });
  window.__GROWTH_CONVERSION_V36__ = VERSION;
  window.__CONSULT_BOT_URL__ = BOT_URL;
})();
