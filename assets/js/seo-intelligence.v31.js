
(function(){
  var VERSION = "static-seo-intelligence-v31-20260514";
  function gtagEvent(name, params){
    params = params || {};
    params.version = VERSION;
    try{ if(typeof window.gtag === "function") window.gtag("event", name, params); }catch(e){}
    try{ window.dispatchEvent(new CustomEvent("seo-intelligence:event",{detail:{name:name,params:params}})); }catch(e){}
  }
  function label(el){ return (el && (el.getAttribute("data-provider") || el.textContent || "") || "").trim().replace(/\s+/g," ").slice(0,90); }
  document.addEventListener("click", function(e){
    var code=e.target.closest("[data-g-copy],.moon-code,[data-copy-code]");
    if(code) gtagEvent("code_copy", {provider:code.getAttribute("data-provider")||label(code), code:code.getAttribute("data-g-copy")||code.getAttribute("data-copy-code")||""});
    var domain=e.target.closest("[data-g-open],.moon-domain,.moon-provider-chip,[href^='http']");
    if(domain && /domain|provider|official|도메인|바로가기/i.test(domain.className+" "+label(domain))) gtagEvent("official_domain_click",{provider:domain.getAttribute("data-provider")||label(domain), href:domain.getAttribute("href")||""});
    var consult=e.target.closest(".auto-consult-launcher,[href='/consult/'],[href*='/consult/'],[href*='t.me/TRS999_bot']");
    if(consult) gtagEvent("consult_open",{label:label(consult), href:consult.getAttribute("href")||""});
    var related=e.target.closest(".v31-related-links a,.v31-topic-hubs a");
    if(related) gtagEvent("internal_recommendation_click",{label:label(related), href:related.getAttribute("href")||""});
    var inquiry=e.target.closest("[href*='inquiry-builder']");
    if(inquiry) gtagEvent("inquiry_builder_click",{href:inquiry.getAttribute("href")||""});
  }, true);
  document.addEventListener("DOMContentLoaded", function(){
    gtagEvent("seo_page_ready", {path:location.pathname, title:document.title});
  });
  window.__SEO_INTELLIGENCE_V31__ = VERSION;
})();
