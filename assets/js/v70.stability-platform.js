(function(){
  var path=window.location.pathname.replace(/\/index\.html$/,'/');
  document.querySelectorAll('.v70-nav a,.v70-mobile-nav a').forEach(function(a){
    var href=a.getAttribute('href')||'';
    if(href==='/'?path==='/':path.indexOf(href)===0){a.setAttribute('aria-current','page');}
  });
  function toast(message){
    var el=document.querySelector('.v70-copy-toast');
    if(!el){el=document.createElement('div');el.className='v70-copy-toast';document.body.appendChild(el);}
    el.textContent=message;el.classList.add('is-show');clearTimeout(window.__v70Toast);window.__v70Toast=setTimeout(function(){el.classList.remove('is-show');},1500);
  }
  function fallbackCopy(text){
    var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','readonly');t.style.position='fixed';t.style.left='-9999px';t.style.top='0';document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){ok=false;}document.body.removeChild(t);return ok;
  }
  document.addEventListener('click',function(e){
    var btn=e.target.closest('[data-v70-copy]');
    if(!btn){return;}
    e.preventDefault();
    var code=btn.getAttribute('data-v70-copy')||'';
    var done=function(ok){toast(ok?'가입코드 '+code+' 복사 완료':'가입코드 '+code);};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(function(){done(true);}).catch(function(){done(fallbackCopy(code));});}else{done(fallbackCopy(code));}
  });
})();
