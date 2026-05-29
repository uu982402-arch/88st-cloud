(function(){
  var toast = document.querySelector('[data-v74-toast]');
  var timer = null;
  function showToast(message){
    if(!toast){ return; }
    toast.textContent = message;
    toast.classList.add('is-show');
    window.clearTimeout(timer);
    timer = window.setTimeout(function(){ toast.classList.remove('is-show'); }, 1800);
  }
  function fallbackCopy(text){
    var el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly','readonly');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(e) { ok = false; }
    document.body.removeChild(el);
    return ok;
  }
  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text).then(function(){return true;}).catch(function(){return fallbackCopy(text);});
    }
    return Promise.resolve(fallbackCopy(text));
  }
  document.addEventListener('click', function(event){
    var button = event.target.closest('[data-v74-go]');
    if(!button){ return; }
    event.preventDefault();
    var code = button.getAttribute('data-code') || '';
    var href = button.getAttribute('data-href') || '/consult/';
    var vendor = button.getAttribute('data-vendor') || '보증업체';
    copyText(code).then(function(ok){
      showToast(ok ? vendor + ' 가입코드가 자동 복사되었습니다!' : vendor + ' 가입코드: ' + code);
      window.setTimeout(function(){ window.open(href, '_blank', 'noopener,noreferrer'); }, 520);
    });
  });
})();
