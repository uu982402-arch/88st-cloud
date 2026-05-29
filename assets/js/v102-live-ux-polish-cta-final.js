/* V102 LIVE UX POLISH / CTA FINAL PATCH */
(function(){
  'use strict';
  var VERSION='V102_LIVE_UX_POLISH_CTA_FINAL_20260526';
  document.documentElement.dataset.v102LiveUx='active';
  function onReady(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true}); else fn(); }
  function safeText(v){ return String(v||'').replace(/\s+/g,' ').trim().slice(0,120); }
  function setEvent(el,name,source){ if(!el || el.dataset.v102CtaDecorated==='true') return; if(!el.getAttribute('data-ga4-event')) el.setAttribute('data-ga4-event',name); el.setAttribute('data-v102-cta',source||name); el.dataset.v102CtaDecorated='true'; }
  function decorate(){
    document.body.classList.add('v102-live-ux');
    document.body.dataset.v102LiveUx='active';
    document.querySelectorAll('.v74-1-btn--detail,[data-v92-detail]').forEach(function(el){setEvent(el,'vendor_detail_click','guaranteed_detail_button');});
    document.querySelectorAll('.v74-1-btn--go,[data-v92-go],[data-v74-go]').forEach(function(el){setEvent(el,'vendor_outbound_click','guaranteed_outbound_button');});
    document.querySelectorAll('.v74-1-info-grid code,.v96-2-fact[data-v92-copy]').forEach(function(el){setEvent(el,'vendor_copy_code','guaranteed_code_copy'); if(!el.getAttribute('role')) el.setAttribute('role','button'); if(!el.getAttribute('tabindex')) el.setAttribute('tabindex','0');});
    document.querySelectorAll('.v71-partner-card').forEach(function(el){setEvent(el,'vendor_detail_click','home_partner_card');});
    document.querySelectorAll('.v71-blog-card,.v72-blog-card').forEach(function(el){setEvent(el,'blog_card_click','blog_card');});
    document.querySelectorAll('.v71-tool-card,[data-tool],[data-v73-tool]').forEach(function(el){setEvent(el,'tool_open','tool_card');});
    document.querySelectorAll('.v71-more[href*="/blog"],a[href="/blog/"]').forEach(function(el){setEvent(el,'blog_card_click','blog_more');});
    document.querySelectorAll('.v71-more[href*="/guaranteed"],a[href="/guaranteed/"]').forEach(function(el){setEvent(el,'vendor_detail_click','guaranteed_more');});
    document.querySelectorAll('.v71-telegram,.v71-fab,.v74-fab,a[href*="t.me/TRS999_bot"],a[href="/consult/"]').forEach(function(el){setEvent(el,'consult_click','consult_cta');});
    document.querySelectorAll('.rust-bottom-nav a,.v71-mobile-nav a').forEach(function(el){setEvent(el,'mobile_bottom_nav_click','mobile_bottom_nav');});
  }
  function viewportFix(){
    var vv=window.visualViewport;
    var bottom=0;
    if(vv){ bottom=Math.max(0,window.innerHeight - vv.height - vv.offsetTop); }
    document.documentElement.style.setProperty('--v102-vv-bottom', bottom.toFixed(0)+'px');
  }
  function audit(){
    var checks=[];
    function add(name,ok,detail){ checks.push({name:name,ok:!!ok,detail:detail||''}); }
    add('body_marker',document.body && document.body.dataset.v102LiveUx==='active','V102 body marker');
    add('bottom_nav',!!document.querySelector('.rust-bottom-nav,.v71-mobile-nav'),'mobile bottom nav present');
    add('cta_markers',document.querySelectorAll('[data-v102-cta]').length>=5,'decorated CTA count '+document.querySelectorAll('[data-v102-cta]').length);
    if(location.pathname==='/guaranteed/') add('guaranteed_cards',document.querySelectorAll('.v74-1-vendor-card').length===6,'guaranteed card count');
    window.RUST_V102_LIVE_QA={version:VERSION,checks:checks,passed:checks.every(function(c){return c.ok;}),runAt:new Date().toISOString()};
    document.documentElement.dataset.v102Qa=window.RUST_V102_LIVE_QA.passed?'pass':'warn';
  }
  onReady(function(){ decorate(); viewportFix(); audit(); });
  window.addEventListener('resize',viewportFix,{passive:true});
  window.addEventListener('orientationchange',function(){setTimeout(viewportFix,180);},{passive:true});
  if(window.visualViewport) window.visualViewport.addEventListener('resize',viewportFix,{passive:true});
})();
