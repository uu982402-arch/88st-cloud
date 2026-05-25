(function(){
  'use strict';
  var VERSION='static-v92-vendor-conversion-pass-20260526';
  if(!document.body || !/guaranteed/.test(location.pathname)){return;}
  document.body.classList.add('v92-vendor-conversion-active');
  function event(name,params){
    params=Object.assign({rust_version:VERSION,page_path:location.pathname,page_title:document.title},params||{});
    if(window.RUST_GA4&&typeof window.RUST_GA4.event==='function'){window.RUST_GA4.event(name,params);return;}
    if(typeof window.gtag==='function'){window.gtag('event',name,params);}
  }
  var toastTimer;
  function toast(message){
    var el=document.querySelector('.v92-copy-toast');
    if(!el){el=document.createElement('div');el.className='v92-copy-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}
    el.textContent=message;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){el.classList.remove('is-show');},1700);
  }
  function fallbackCopy(text){
    var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','readonly');ta.style.position='fixed';ta.style.left='-9999px';ta.style.top='0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy');}catch(e){ok=false;}document.body.removeChild(ta);return ok;
  }
  function copy(text){
    text=String(text||'').trim();
    if(!text){return Promise.resolve(false);} 
    if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(text).then(function(){return true;}).catch(function(){return fallbackCopy(text);});}
    return Promise.resolve(fallbackCopy(text));
  }
  document.addEventListener('click',function(ev){
    var go=ev.target.closest('[data-v92-go]');
    if(go){
      ev.preventDefault();ev.stopImmediatePropagation();
      var code=go.getAttribute('data-code')||'';
      var href=go.getAttribute('data-href')||go.getAttribute('href')||'/consult/';
      var vendor=go.getAttribute('data-vendor')||'보증업체';
      copy(code).then(function(ok){
        toast(ok? vendor+' 가입코드가 자동 복사되었습니다!': vendor+' 가입코드: '+code);
        event('vendor_copy_code',{vendor_name:vendor,vendor_code:code,link_url:href,source:'v92_go'});
        event('vendor_outbound_click',{vendor_name:vendor,vendor_code:code,link_url:href,source:'v92_go'});
        setTimeout(function(){window.open(href,'_blank','noopener,noreferrer');},420);
      });
      return;
    }
    var copyBtn=ev.target.closest('[data-v92-copy]');
    if(copyBtn){
      ev.preventDefault();ev.stopImmediatePropagation();
      var c=copyBtn.getAttribute('data-code')||copyBtn.getAttribute('data-v54-copy-code')||'';
      var v=copyBtn.getAttribute('data-vendor')||copyBtn.getAttribute('data-v54-provider')||'보증업체';
      copy(c).then(function(ok){toast(ok? v+' 가입코드가 복사되었습니다!': v+' 가입코드: '+c);event('vendor_copy_code',{vendor_name:v,vendor_code:c,source:'v92_copy'});});
      return;
    }
    var detail=ev.target.closest('[data-v92-detail]');
    if(detail){event('vendor_detail_click',{vendor_name:detail.getAttribute('data-vendor')||'',link_url:detail.getAttribute('href')||''});}
  },true);
  document.addEventListener('error',function(ev){
    var img=ev.target;
    if(img&&img.tagName==='IMG'&&(img.hasAttribute('data-v92-card-image')||img.hasAttribute('data-v92-detail-image'))){
      img.style.objectFit='contain';img.style.padding='10px';img.style.background='linear-gradient(180deg,#fff,#f7f2e8)';
    }
  },true);
  window.RUST_VENDOR_CONVERSION=Object.freeze({version:VERSION,marker:'V92_VENDOR_CONVERSION_PASS_ACTIVE'});
})();
